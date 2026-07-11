const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-highcharts.js","assets/vendor-vaadin.js","assets/vendor-lit.js","assets/vendor.js","assets/vendor-ui5.js","assets/vendor-diagrams.js"])))=>i.map(i=>d[i]);
import{d as n,A as d,a as R,j as v,r as g,i as j,k as I,m as ne,D as Fi,c as A,w as Z,p as ys,q as Ye,s as xs}from"./vendor-lit.js";import{v as ws,b as ot,e as ks,n as qi,p as Mi,f as yt,i as Ea,j as Ui,N as na,k as Da,l as Qa,m as Cs}from"./vendor-vaadin.js";import{S as Ss,n as de,a as Es,b as Is}from"./vendor.js";import{_ as be,N as ga}from"./vendor-ui5.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function a(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(i){if(i.ep)return;i.ep=!0;const r=a(i);fetch(i.href,r)}})();var m=(e=>(e.Page="Page",e.Div="Div",e.Element="Element",e.MicroFrontend="MicroFrontend",e.Form="Form",e.Crud="Crud",e.Result="Result",e.Card="Card",e.Directory="Directory",e.Stepper="Stepper",e.HorizontalLayout="HorizontalLayout",e.VerticalLayout="VerticalLayout",e.SplitLayout="SplitLayout",e.MasterDetailLayout="MasterDetailLayout",e.TabLayout="TabLayout",e.AccordionLayout="AccordionLayout",e.FormLayout="FormLayout",e.FormRow="FormRow",e.FormItem="FormItem",e.BoardLayout="BoardLayout",e.BoardLayoutRow="BoardLayoutRow",e.BoardLayoutItem="BoardLayoutItem",e.Scroller="Scroller",e.FullWidth="FullWidth",e.Container="Container",e.FormField="FormField",e.Table="Table",e.App="App",e.Text="Text",e.Avatar="Avatar",e.Chat="Chat",e.AvatarGroup="AvatarGroup",e.Badge="Badge",e.Breadcrumbs="Breadcrumbs",e.Anchor="Anchor",e.Button="Button",e.Chart="Chart",e.Icon="Icon",e.ConfirmDialog="ConfirmDialog",e.ContextMenu="ContextMenu",e.CookieConsent="CookieConsent",e.Details="Details",e.Dialog="Dialog",e.Drawer="Drawer",e.Image="Image",e.Map="Map",e.Markdown="Markdown",e.Notification="Notification",e.ProgressBar="ProgressBar",e.Popover="Popover",e.CarouselLayout="CarouselLayout",e.Tooltip="Tooltip",e.MessageInput="MessageInput",e.MessageList="MessageList",e.CustomField="CustomField",e.MenuBar="MenuBar",e.Grid="Grid",e.GridColumn="GridColumn",e.GridGroupColumn="GridGroupColumn",e.VirtualList="VirtualList",e.FormSection="FormSection",e.FormSubSection="FormSubSection",e.Bpmn="Bpmn",e.Workflow="Workflow",e.WorkflowElk="WorkflowElk",e.FormEditor="FormEditor",e.MetricCard="MetricCard",e.Scoreboard="Scoreboard",e.DashboardPanel="DashboardPanel",e.DashboardLayout="DashboardLayout",e.FoldoutLayout="FoldoutLayout",e.HeroSection="HeroSection",e.EmptyState="EmptyState",e.Skeleton="Skeleton",e.Gantt="Gantt",e))(m||{}),ee=(e=>(e.ServerSide="ServerSide",e.ClientSide="ClientSide",e))(ee||{});class _s{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(t){if(this.componentRenderer=t,typeof window<"u"){const a=t.supportedClientSideTypes?.();window.__mateuRendererInfo={name:t.rendererName?.()??t.constructor?.name??"unknown",supportedTypes:a?[...a].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(t){this.useShadowRoot=t}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(t){this.afterRenderHook=t}getAfterRenderHook(){return this.afterRenderHook}}const K=new _s,kt=(e,t,a,s,i,r,o,l,c)=>(t.slot=l,$(e,t,a,s,i,r,o,c)),$=(e,t,a,s,i,r,o,l)=>{if(!t)return n``;if(t.type==ee.ClientSide)return K.get().renderClientSideComponent(e,t,a,s,i,r,o,l);const c=e.route,u=e.consumedRoute;return n`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${u}"
                         baseUrl="${a}"
                         slot="${t.slot??d}"
                         style="${t.style}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...s}}"
                         .data="${{...i}}"
                         .appState="${r}"
                         .appData="${o}"
        >
       </mateu-component>`},Ts=640,Rs=e=>e>0&&e<Ts?"accordion":"tabs";var Ps=Object.defineProperty,Os=Object.getOwnPropertyDescriptor,Ia=(e,t,a,s)=>{for(var i=s>1?void 0:s?Os(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Ps(t,a,i),i};let Nt=class extends j{constructor(){super(...arguments),this.tabLabels=[],this.mode="tabs",this.selected=0,this.selectedChangedListener=e=>{const t=e.detail?.value;typeof t=="number"&&t>=0&&(this.selected=t)}}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{for(const t of e)this.mode=Rs(t.contentRect.width)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect(),this.resizeObserver=void 0,this.detachTabsListener()}detachTabsListener(){this.slottedTabs?.removeEventListener("selected-changed",this.selectedChangedListener),this.slottedTabs=void 0}tabsSlotChanged(e){this.detachTabsListener();const a=e.target.assignedElements().find(s=>"selected"in s);a&&(this.slottedTabs=a,a.addEventListener("selected-changed",this.selectedChangedListener),a.selected=this.selected)}select(e){this.selected=e,this.slottedTabs&&(this.slottedTabs.selected=e)}updated(){this.slottedTabs&&this.slottedTabs.selected!=this.selected&&(this.slottedTabs.selected=this.selected)}render(){return n`
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
        `}};Nt.styles=R`
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
    `;Ia([v({type:Array})],Nt.prototype,"tabLabels",2);Ia([g()],Nt.prototype,"mode",2);Ia([g()],Nt.prototype,"selected",2);Nt=Ia([I("mateu-adaptive-tabs")],Nt);const js=(e,t,a,s,i,r,o)=>{const l=t.metadata;let c=t.style;return c==null&&(c=""),l.columnSpacing&&(c+="--vaadin-form-layout-column-spacing: "+l.columnSpacing+";"),l.itemRowSpacing&&(c+="--vaadin-form-layout-row-spacing: "+l.itemRowSpacing+";"),l.itemLabelSpacing&&(c+="--vaadin-form-layout-label-spacing: "+l.itemLabelSpacing+";"),l.labelsAside&&(c+="--vaadin-form-item-label-width: 92px;"),l.fullWidth&&(c+="width: 100%;"),n`
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
                   ${t.children?.map(u=>Bi(l,e,u,a,s,i,r,o))}
               </vaadin-form-layout>
            `},Bi=(e,t,a,s,i,r,o,l)=>a.type==ee.ClientSide&&a.metadata?.type==m.FormRow?As(e,t,a,s,i,r,o,l):e.labelsAside?Ls(t,a,s,i,r,o,l):$(t,a,s,i,r,o,l),Ls=(e,t,a,s,i,r,o)=>{if(t.type==ee.ClientSide&&t.metadata?.type==m.FormField&&t.metadata.label){const l=t.metadata,c=l.label?.includes("${")?e._evalTemplate(l.label):l.label;return n`
                       <vaadin-form-item data-colspan="${l.colspan}">
                           <label slot="label">${c}</label>
                           ${$(e,t,a,s,i,r,o,!0)}
                       </vaadin-form-item>
                   `}return $(e,t,a,s,i,r,o)},As=(e,t,a,s,i,r,o,l)=>n`
        <vaadin-form-row>
            ${a.children?.map(c=>Bi(e,t,c,s,i,r,o,l))}
        </vaadin-form-row>
            `,Ds=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let u=t.style;return l.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),l.justification&&(u=u?"justify-content: "+l.justification+";"+u:"justify-content: "+l.justification+";"),l.verticalAlignment&&(u=u?"align-items: "+l.verticalAlignment+";"+u:"align-items: "+l.verticalAlignment+";"),n`
               <vaadin-horizontal-layout 
                       style="${u}" 
                       class="${t.cssClasses}"
                       theme="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(h=>$(e,h,a,s,i,r,o))}
               </vaadin-horizontal-layout>
            `},zs=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let u=t.style;return l.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),l.justification&&(u=u?"justify-content: "+l.justification+";"+u:"justify-content: "+l.justification+";"),l.horizontalAlignment&&(u=u?"align-items: "+l.horizontalAlignment+";"+u:"align-items: "+l.horizontalAlignment+";"),n`
        <vaadin-vertical-layout
                style="${u}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(h=>$(e,h,a,s,i,r,o))}
        </vaadin-vertical-layout>
    `},Ns=(e,t,a,s,i,r,o)=>{const l=t.metadata;let c=t.style;return l.fullWidth&&(c=c?"width: 100%;"+c:"width: 100%;"),n`
               <vaadin-split-layout 
                       style="${c}" 
                       class="${t.cssClasses}"
                       orientation="${l.orientation??d}"
                       theme="${l.variant??d}"
                       slot="${t.slot??d}"
               >
                   <master-content>${$(e,t.children[0],a,s,i,r,o)}</master-content>
                   <detail-content>${$(e,t.children[1],a,s,i,r,o)}</detail-content>
               </vaadin-split-layout>
            `},Fs=(e,t,a,s,i,r,o)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,u=!!i?.hasDetail||!!l,h=c??l;return n`
               <vaadin-master-detail-layout ?has-detail="${u}"
                                            style="${t.style}"
                                            class="${t.cssClasses}"
                                            slot="${t.slot??d}">
                   <div>${$(e,t.children[0],a,s,i,r,o)}</div>
                   ${u&&h?n`<div slot="detail">${$(e,h,a,s,i,r,o)}</div>`:n`<div slot="detail" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Select an item to view details</div>`}
               </vaadin-master-detail-layout>
            `},qs=(e,t,a,s,i,r,o)=>{const l=t.metadata;let c=t.style;c==null&&(c=""),l.fullWidth&&(c+="width: 100%;");let u=l.variant;u=="equalWidth"&&(u="equal-width-tabs");const h=Math.max(0,(t.children??[]).findIndex(f=>f.metadata.active)),p=f=>{f.target.selected=h};if(l.adaptable){const f=(t.children??[]).map(y=>{const w=y.metadata.label;return w?.includes("${")?e._evalTemplate(w):w});return n`
            <mateu-adaptive-tabs
                    .tabLabels="${f}"
                    style="${c}"
                    class="${t.cssClasses}"
                    slot="${t.slot??d}"
            >
                <vaadin-tabs slot="tabs"
                             theme="${u??d}"
                             orientation="${l.orientation??d}"
                             @items-changed=${p}
                >
                    ${t.children?.map(y=>y).map((y,w)=>{const x=y.metadata.shortcut;return n`
                        <vaadin-tab id="${f[w]}"
                                    style="${y.style}"
                                    class="${y.cssClasses}"
                                    data-shortcut="${x??d}"
                        >${f[w]}</vaadin-tab>`})}
                </vaadin-tabs>

                ${t.children?.map((y,w)=>n`
                    <div slot="panel-${w}" style="padding: var(--lumo-space-m) 0;">
                        ${y.children?.map(x=>$(e,x,a,s,i,r,o))}
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
                         @items-changed=${p}
            >
                ${t.children?.map(f=>f).map(f=>{const y=f.metadata.label,w=y?.includes("${")?e._evalTemplate(y):y,x=f.metadata.shortcut;return n`
                    <vaadin-tab id="${w}"
                                style="${f.style}"
                                class="${f.cssClasses}"
                                data-shortcut="${x??d}"
                    >${w}</vaadin-tab>`})}
            </vaadin-tabs>

            ${t.children?.map(f=>Ms(e,f,a,s,i,r,o))}
        </vaadin-tabsheet>
            `},Ms=(e,t,a,s,i,r,o)=>{const l=t.metadata.label,c=l?.includes("${")?e._evalTemplate(l):l;return n`
        <div tab="${c}" style="padding: var(--lumo-space-m) 0;">
                   ${t.children?.map(u=>$(e,u,a,s,i,r,o))}
               </div>
            `},Us=(e,t,a,s,i,r,o)=>{const l=t.metadata;t.style,l.fullWidth;let c=0;if(t.children){for(let u=0;u<t.children.length;u++)if(t.children[u].metadata?.active){c=u;break}}return n`
               <vaadin-accordion
                       style="${t.style}"
                       class="${t.cssClasses}"
                       opened="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(u=>Bs(e,u,a,s,i,r,o,l.variant))}
               </vaadin-accordion>
            `},Bs=(e,t,a,s,i,r,o,l)=>{const c=t.metadata,u=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return n`
        <vaadin-accordion-panel style="${t.style}"
                                class="${t.cssClasses}"
                                theme="${l??d}"
                                ?opened="${c.active}"
                                ?disabled="${c.disabled}">
            <vaadin-accordion-heading slot="summary">${u}</vaadin-accordion-heading>
            ${t.children?.map(h=>$(e,h,a,s,i,r,o))}
        </vaadin-accordion-panel>
            `},Ws=(e,t,a,s,i,r,o)=>n`
               <vaadin-scroller style="${t.style}" 
                                class="${t.cssClasses}"
                                slot="${t.slot??d}">
                   ${t.children?.map(l=>$(e,l,a,s,i,r,o))}
               </vaadin-scroller>
            `,Vs=(e,t,a,s,i,r,o)=>n`
               <div style="width: 100%; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??d}">
                   ${t.children?.map(l=>$(e,l,a,s,i,r,o))}
               </div>
            `,Hs=(e,t,a,s,i,r,o)=>n`
               <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??d}">
                   ${t.children?.map(l=>$(e,l,a,s,i,r,o))}
               </div>
            `,Gs=(e,t,a,s,i,r,o)=>n`
        <vaadin-board style="${t.style}" 
                      class="${t.cssClasses}"
                      slot="${t.slot??d}">
            ${t.children?.map(l=>$(e,l,a,s,i,r,o))}
        </vaadin-board>
            `,Ks=(e,t,a,s,i,r,o)=>n`
        <vaadin-board-row style="${t.style}" class="${t.cssClasses}">
                   ${t.children?.map(l=>$(e,l,a,s,i,r,o))}
               </vaadin-board-row>
            `,Js=(e,t,a,s,i,r,o)=>{const l=t.metadata;return n`
        <div style="${t.style}" 
             class="${t.cssClasses}"
             board-cols="${l.boardCols??d}"
        >
                   ${t.children?.map(c=>$(e,c,a,s,i,r,o))}
               </div>
            `},Ft=(e,t)=>new Function(...Object.keys(t),"return `"+e+"`")(...Object.values(t)),Wt=(e,t,a)=>({state:e??{},data:t??{},...a});function ge(e,t,a,s){if(!e?.includes("${"))return e;try{return Ft(e,Wt(t,a,s))}catch(i){return console.warn(`Mateu: could not interpolate "${e}":`,i),e}}const rt=(e,t,a)=>{if(e&&e.indexOf("${")>=0)try{return Ft(e,Wt(t,a))}catch(s){return s.message}return e},Za=(e,t,a,s,i)=>{if(!e)return e;const r=Wt(t,a,{appState:s??{},appData:i??{}});let o=e;try{if(o=Ft(e,r),o.includes("${"))try{o=Ft(o,r)}catch(l){o="when evaluating nested "+e+" :"+l+", where data is "+a+" and state is "+t+" and app state is "+s+" and app data is "+i,console.error(l,o,t,a,s,i)}}catch(l){o="when evaluating "+e+" :"+l+", where data is "+a+" and state is "+t+" and app state is "+s+" and app data is "+i,console.error(l,o,t,a,s,i)}return o},Wi=(e,t,a,s,i,r)=>{const o=Wt(t,a,{appState:s??{},appData:i??{},...r}),l=Ft(e,o);return new Function(...Object.keys(o),`return (${l})`)(...Object.values(o))},Vi=(e,t,a,s)=>{const i=Wt(t,a,s);return new Function(...Object.keys(i),`return (${e})`)(...Object.values(i))},Ys=(e,t,a,s)=>Ft(e,Wt(t,a,s)),Xs=(e,t,a)=>{const s=e.metadata;return n`<vaadin-avatar
            img="${s.image}"
            name="${Ee(s.name,t,a)}"
            abbr="${s.abbreviation}"
            style="${e.style}" class="${e.cssClasses}"
            slot="${e.slot??d}"
    ></vaadin-avatar>`},Ee=(e,t,a)=>typeof e=="string"&&e.includes("${")?ge(e,t,a):e,Qs=e=>{const t=e.metadata;return n`<vaadin-avatar-group max-items-visible="${t.maxItemsVisible}"
                                     .items="${t.avatars}"
                                     style="${e.style}" class="${e.cssClasses}"
                                     slot="${e.slot??d}">
    </vaadin-avatar-group>`},Zs=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=u=>n`
            ${$(e,u,a,s,i,r,o)}
`;return n`
        <vaadin-virtual-list
                .items="${l.page.content}"
                ${ws(c,[])}
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
        ></vaadin-virtual-list>
    `};var er=Object.defineProperty,tr=Object.getOwnPropertyDescriptor,ei=(e,t,a,s)=>{for(var i=s>1?void 0:s?tr(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&er(t,a,i),i};let ta=class extends j{constructor(){super(...arguments),this.variant="text",this.count=3}render(){const e=Array.from({length:Math.max(1,this.count)});return this.variant=="card"?n`${e.map(()=>n`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant=="grid"?n`${e.map(()=>n`<div class="bone row"></div>`)}`:this.variant=="form"?n`${e.map(()=>n`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:n`${e.map(()=>n`<div class="bone line"></div>`)}`}};ta.styles=R`
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
    `;ei([v()],ta.prototype,"variant",2);ei([v({type:Number})],ta.prototype,"count",2);ta=ei([I("mateu-skeleton")],ta);const ar=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},Ct=(e,t,a,s,i,r)=>n`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${t??"🗂"}</span>
            ${a?n`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${a}</span>`:d}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${s??e??"Nothing here yet."}</span>
            ${i&&r?n`
                <vaadin-button theme="tertiary" style="margin-top: .25rem;" @click="${o=>ar(o,i)}">${r}</vaadin-button>
            `:d}
        </div>
    `,ir=e=>{const t=e.metadata;return n`
        <div style="${e.style??d}" class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${Ct(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},sr=e=>{const t=e.metadata;return n`
        <mateu-skeleton
                variant="${t.variant??"text"}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-skeleton>
    `};var ea=(e=>(e.NONE="NONE",e.INFO="INFO",e.SUCCESS="SUCCESS",e.WARNING="WARNING",e.DANGER="DANGER",e))(ea||{});const rr=(e,t,a)=>{const s=e[a.path];return s?n`<span theme="badge pill ${_a(s.type)}">${s.message}</span>`:n``},_a=e=>{switch(e){case ea.SUCCESS:return"success";case ea.WARNING:return"warning";case ea.DANGER:return"error";case ea.NONE:return"contrast"}return""},or=(e,t,a)=>{const i=e[a.path]?"vaadin:check":"vaadin:minus";return n`<vaadin-icon 
                    icon="${i}"
                    style="height: 16px; width: 16px; color: ${"var(--lumo-body-text-color)"};"
            ></vaadin-icon>`},nr=(e,t,a,s,i)=>{const r=e[a.path];let o=r;return s=="money"&&r&&r.locale&&r.currency?o=new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(r.value):i=="money"&&(o=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(r)),n`${o}`},vi=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},lr=(e,t,a,s,i,r)=>{const o=a.xcolumn??r;if(o.text){if(o.actionId)return n`<a href="javascript: void(0);" @click="${u=>vi(a,o,e)}">${o.text}</a>`;const c=e[a.path];return n`<a href="${c}">${o.text}</a>`}if(s=="string"){if(o.actionId){const u=e[a.path];return n`<a href="javascript: void(0);" @click="${h=>vi(a,o,e)}">${u}</a>`}const c=e[a.path];return n`<a href="${c}">${c}</a>`}const l=e[a.path];return n`<a href="${l.href}">${l.text}</a>`},dr=(e,t,a,s,i)=>s=="string"?e[a.path].split(",").map(l=>n`<vaadin-icon icon="${l}" style="width: 16px;"></vaadin-icon>`):e[a.path].split(",").map(o=>n`<vaadin-icon icon="${o.icon}" style="width: 16px;"></vaadin-icon>`),cr=(e,t,a,s,i)=>{const r=e[a.path];return n`${ne(r)}`},ur=(e,t,a,s,i,r)=>{if(s=="string"){const l=e[a.path],c="max-height: 40px; "+(r.style??"");return n`<img src="${l}" style="${c}">`}const o=e[a.path];return n`<img src="${o.src}" style="${r.style??""}">`},hr=e=>{const t={_clickedRow:e.target.row};e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+e.detail.value.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},fi=e=>{const t={_clickedRow:e.target.row},a=e.target.action;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+a.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},pr=e=>{const t=document.createElement("vaadin-context-menu-item"),a=document.createElement("vaadin-icon");return a.style.color="var(--lumo-secondary-text-color)",a.style.marginInlineEnd="var(--lumo-space-s)",a.style.padding="var(--lumo-space-xs)",a.setAttribute("icon",e.icon),t.appendChild(a),e.label&&t.appendChild(document.createTextNode(e.label)),t.disabled=e.disabled,t},bi=(e,t,a)=>{const s=e[a.path]?.actions?.map(i=>i.icon?{component:pr(i),methodNameInCrud:i.methodNameInCrud}:{...i,text:i.label});return!s||s.length==0?n``:n`
                                     <vaadin-menu-bar
                                         .items=${[{text:"···",children:s}]}
                                         theme="tertiary"
                                         .row="${e}"
                                         data-testid="menubar-${a.path}"
                                         @item-selected="${hr}"
                                     ></vaadin-menu-bar>
                                   `},mr=(e,t,a)=>{if(a.path=="select"){const r={actionId:a.path,icon:"",label:"Select",disabled:!1,methodNameInCrud:"select"};return n`
         <vaadin-button theme="tertiary" title="Select" @click="${fi}" .row="${e}" .action="${r}">
             Select
         </vaadin-button>
    `}const s=a.path&&e[a.path].methodNameInCrud?e[a.path]:e.action,i=s.icon&&!s.label;return n`
         <vaadin-button theme="tertiary${i?" icon":""}" title="${s.label||d}" @click="${fi}" .row="${e}" .action="${s}">
             ${s.icon?n`<vaadin-icon icon="${s.icon}"></vaadin-icon>`:d}
             ${s.label?s.label:d}
         </vaadin-button>
    `},vr=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},fr=(e,t,a,s,i,r)=>{const o=a.xcolumn??r;if(o.actionId){const c=o.text||e[a.path];return n`
            <vaadin-button theme="tertiary" @click="${u=>vr(a,o,e)}" .row="${e}">
                ${c}
            </vaadin-button>
        `}const l=e[a.path];return n`<a href="${l}">${o.text||l}</a>`},br=(e,t,a,s,i,r,o,l,c)=>{const u=e[a.path];return $(s,u,i,r,o,l,c)},Va=new WeakMap,gr=(e,t)=>Va.get(e)?.[t],$r=(e,t,a)=>{let s=Va.get(e);s||(s={},Va.set(e,s)),s[t]=a},gi=e=>{if(e==null||e==="")return null;const t=Number(e);return Number.isNaN(t)?null:t},yr=(e,t,a,s)=>{const i=a?.field?.fieldId,r=c=>{if(e[t.id]===c||e[t.id]==null&&(c===""||c==null))return;if(e[t.id]=c,!i){a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"update-row",parameters:{_editedRow:{...e}}},bubbles:!0,composed:!0}));return}const u=s[i];a.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:i,value:Array.isArray(u)?[...u]:u},bubbles:!0,composed:!0}))},o=e[t.id],l=o==null?"":String(o);switch(t.editorType){case"boolean":return n`<vaadin-checkbox ?checked=${!!o} @checked-changed=${c=>r(c.detail.value)}></vaadin-checkbox>`;case"integer":return n`<vaadin-integer-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(gi(c.target.value))}></vaadin-integer-field>`;case"number":return n`<vaadin-number-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(gi(c.target.value))}></vaadin-number-field>`;case"date":return n`<vaadin-date-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-date-picker>`;case"time":return n`<vaadin-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-time-picker>`;case"datetime":return n`<vaadin-date-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-date-time-picker>`;case"select":return n`<vaadin-combo-box
                theme="small" style="width:100%;"
                .items=${(t.editorOptions??[]).map(c=>({label:c.label,value:String(c.value)}))}
                item-label-path="label" item-value-path="value"
                .value=${l}
                @value-changed=${c=>r(c.detail.value)}></vaadin-combo-box>`;case"lookup":{const c=a?.field?.fieldId,u=`search-${c}-${t.id}`,h=`${c}-${t.id}`,f=(t.editorOptions??[]).find(w=>String(w.value)===l)??(l?{value:l,label:gr(e,t.id)??l}:void 0);return n`<vaadin-combo-box
                theme="small" style="width:100%;"
                item-label-path="label" item-id-path="value"
                .dataProvider=${(w,x)=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:u,parameters:{searchText:w.filter,size:w.pageSize,page:w.page},callback:_=>{const U=_?.fragments?.[0]?.data?.[h];x(U?.content??[],U?.totalElements??0)},callbackonly:!0},bubbles:!0,composed:!0}))}}
                .selectedItem=${f}
                @selected-item-changed=${w=>{const x=w.detail.value,_=x?x.value:null;String(_??"")!==l&&(x&&$r(e,t.id,x.label),r(_))}}></vaadin-combo-box>`}default:return n`<vaadin-text-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(c.target.value)}></vaadin-text-field>`}},za=e=>ks(()=>n`<span title="${e}" style="white-space:normal;overflow-wrap:break-word;">${e}</span>`,[e]),xr=e=>{e.preventDefault(),e.stopPropagation(),e.currentTarget?.dispatchEvent(new CustomEvent("sort-direction-changed",{detail:{grid:e.currentTarget.parentElement},bubbles:!0,composed:!0}))},wr=(e,t,a,s,i,r,o)=>{const l=ge(e.label,s,i);return n`
<vaadin-grid-column-group header="${l}">
    ${e.columns.map(c=>Hi(c.metadata,t,a,s,i,r,o))}
</vaadin-grid-column-group>
`},ti=(e,t,a,s,i,r,o)=>m.GridGroupColumn==e.metadata?.type?wr(e.metadata,t,a,s,i,r,o):Hi(e.metadata,t,a,s,i,r,o),Hi=(e,t,a,s,i,r,o)=>{const l=ge(e.label,s,i);return e.sortable?n`
                        <vaadin-grid-sort-column
                                path="${e.id}"
                                text-align="${e.align??d}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??d}"
                                ?resizable="${e.resizable}"
                                width="${e.width??d}"
                                @direction-changed="${xr}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${za(l)}
                                ${ot((c,u,h)=>ya(c,u,h,e,t,a,s,i,r,o),[])}
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
                                ${za(l)}
                                ${ot((c,u,h)=>ya(c,u,h,e,t,a,s,i,r,o),[])}
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
                                ${za(l)}
                                ${ot((c,u,h)=>ya(c,u,h,e,t,a,s,i,r,o),[])}
                        ></vaadin-grid-column>
                    `},ya=(e,t,a,s,i,r,o,l,c,u)=>{const h=a.dataset.dataType??"",p=a.dataset.stereotype??"";if(s.editable)return yr(e,s,i,o);if(h=="status")return rr(e,t,a);if(h=="bool")return or(e,t,a);if(h=="money"||p=="money")return nr(e,t,a,h,p);if(h=="link"||p=="link")return lr(e,t,a,h,p,s);if(h=="icon"||p=="icon")return dr(e,t,a,h);if(p=="html")return cr(e,t,a);if(p=="image")return ur(e,t,a,h,p,s);if(h=="menu")return bi(e,t,a);if(h=="component")return br(e,t,a,i,r,o,l,c,u);if(h=="action")return mr(e,t,a);if(h=="actionGroup")return bi(e,t,a);if(p=="button"||s.actionId)return fr(e,t,a,h,p,s);const f=e[a.path];return n`<span title="${f}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${f}</span>`},kr=(e,t,a,s,i,r,o)=>{const l=t.metadata;if(l.tree){const u=async(h,p)=>{const f=h.parentItem?h.parentItem.children:l.page.content;p(f,f.length)};return n`
        <vaadin-grid style="${t.style}" class="${t.cssClasses}"
                     .itemHasChildrenPath="${"children"}" .dataProvider="${u}"
                     slot="${t.slot??d}"
                     all-rows-visible
        >
            ${l.content.map((h,p)=>{const f=h.metadata;return p>0?n`
            <vaadin-grid-column path="${h.id}"
                                header="${f?.label??d}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??d}"
                                width="${f?.width??d}"
                                .column="${h.metadata}"
                                ${ot((y,w,x)=>ya(y,w,x,f,e,a,s,i,r,o),[])}></vaadin-grid-column>
`:n`
            <vaadin-grid-tree-column path="${h.id}"
                                header="${f?.label??d}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??d}"
                                width="${f?.width??d}"
            ></vaadin-grid-tree-column>
`})}
            <span slot="empty-state">${Ct()}</span>
        </vaadin-grid>
    `}let c=l.page?.content;return t.id&&s&&s[t.id]&&(c=s[t.id]),c||(c=[]),n`
        <vaadin-grid 
                style="${t.style}" 
                class="${t.cssClasses}" 
                .items="${c}"
                all-rows-visible
        >
            ${l?.content?.map(u=>ti(u,e,a,s,i,r,o))}
        </vaadin-grid>
    `},Cr=e=>{const a=(e.metadata.items??[]).map(s=>({text:s.text,time:s.time,userName:s.userName,userImg:s.userImg,userAbbr:s.userAbbr,userColorIndex:s.userColorIndex}));return n`
        <vaadin-message-list
                markdown
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??d}"
                .items="${a}"
        ></vaadin-message-list>
    `},bt=new Ss,ae={value:{}},aa={value:{}},Sr=(e,t,a,s,i,r,o)=>{const l=t.metadata;return n`
        <vaadin-context-menu .items=${ai(e,l.menu,a,s,i,r,o)} 
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             open-on="${l.activateOnLeftClick?"click":d}"
                             slot="${t.slot??d}">
            ${$(e,l.wrapped,a,s,i,r,o)}
        </vaadin-context-menu>
            `},Er=(e,t,a,s,i)=>{const r=t.metadata;return n`
        <vaadin-menu-bar .items=${ai(e,r.options,a,s,i,ae,aa)}
                         style="${t.style}" class="${t.cssClasses}"
                         slot="${t.slot??d}">
        </vaadin-menu-bar>
            `},$i=(e,t,a,s,i,r,o)=>{const l=document.createElement("vaadin-context-menu-item");return Fi($(e,t,a,s,i,r,o),l),l},ai=(e,t,a,s,i,r,o)=>t.map(l=>l.submenus?{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?$i(e,l.component,a,s,i,r,o):void 0,children:ai(e,l.submenus,a,s,i,r,o)}:l.separator?{component:"hr"}:{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?$i(e,l.component,a,s,i,r,o):void 0}),Ir=(e,t,a,s,i,r,o)=>{const l=t.metadata;return n`
        <vaadin-custom-field label="${l.label}"
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             slot="${t.slot??d}"
                             data-colspan="${l.colspan||d}"
        >
            ${$(e,l.content,a,s,i,r,o)}
        </vaadin-custom-field>
            `},_r=e=>{const t=e.metadata,a=s=>{const i=s.detail?.value??"";!t.actionId||!i.trim()||s.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:{message:i}},bubbles:!0,composed:!0}))};return n`
        <vaadin-message-input
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??d}"
                @submit="${a}"
        ></vaadin-message-input>
    `},Tr=(e,t,a,s,i,r,o)=>{const l=t.metadata;return n`
        <div id="show-notifications">${$(e,l.wrapped,a,s,i,r,o)}</div>
        <vaadin-tooltip
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
                for="show-notifications" text="${l.text}" position="top-start"></vaadin-tooltip>
    `},Rr=e=>{if(e instanceof CustomEvent)return e.detail;const t={};for(const a in e){const s=e[a];["number","string","boolean"].indexOf(typeof s)>=0&&(t[a]=e[a])}return t},yi=(e,t,a)=>{for(let s in t.attributes)e.setAttribute(s,t.attributes[s]);a.style&&e.setAttribute("style",a.style),a.cssClasses&&e.setAttribute("class",a.cssClasses),a.slot&&e.setAttribute("slot",a.slot),t.content&&(t.html?e.innerHTML=t.content:e.append(t.content))},Pr=e=>{const t=e.name;t.startsWith("vaadin-chart")&&!customElements.get(t)&&be(()=>import("./vendor-highcharts.js"),__vite__mapDeps([0,1,2,3,4]));const a=e.attributes?e.attributes.import:void 0;a&&t.includes("-")&&!customElements.get(t)&&import(a)},Or=(e,t,a)=>{Pr(t);let s=t.name;return t.attributes&&t.attributes.id&&(s="#"+t.attributes.id),setTimeout(()=>{const i=e.shadowRoot?.querySelector(".element-container")?.querySelector(s);if(i){for(;i.firstChild;)i.removeChild(i.lastChild);yi(i,t,a)}else{const r=document.createElement(t.name);yi(r,t,a);for(let o in t.on)r.addEventListener(o,l=>{const c=Rr(l);e.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.on[o],parameters:{event:c}},bubbles:!0,composed:!0}))});e.shadowRoot?.querySelector(".element-container")?.appendChild(r)}}),n`<div class="element-container"></div>`};var He=(e=>(e.div="div",e.p="p",e.h1="h1",e.h2="h2",e.h3="h3",e.h4="h4",e.h5="h5",e.h6="h6",e.span="span",e))(He||{});const jr=(e,t,a,s,i)=>{const r=e.metadata,o=r.attributes?.["data-colspan"],l=Za(r.text,t,a,s,i);return He.h1==r.container?n`
            <h1 style="${e.style}" class="${e.cssClasses}"
                id="${A(e.id)}"
                data-colspan="${A(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h1>
        `:He.h2==r.container?n`
            <h2 style="${e.style}" class="${e.cssClasses}"
                id="${A(e.id)}"
                data-colspan="${A(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h2>
        `:He.h3==r.container?n`
            <h3 style="${e.style}" class="${e.cssClasses}"
                id="${A(e.id)}"
                data-colspan="${A(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h3>
        `:He.h4==r.container?n`
            <h4 style="${e.style}" class="${e.cssClasses}"
                id="${A(e.id)}"
                data-colspan="${A(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h4>
        `:He.h5==r.container?n`
            <h5 style="${e.style}" class="${e.cssClasses}"
                id="${A(e.id)}"
                data-colspan="${A(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h5>
        `:He.h6==r.container?n`
            <h6 style="${e.style}" class="${e.cssClasses}"
                id="${A(e.id)}"
                data-colspan="${A(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h6>
        `:He.p==r.container?n`
               <p style="${e.style}" class="${e.cssClasses}"
                  id="${A(e.id)}"
                  data-colspan="${A(o)}"
                  slot="${e.slot??d}">
                   ${l??d}
               </p>
            `:He.div==r.container?n`
               <div style="${e.style}" class="${e.cssClasses}"
                    id="${A(e.id)}"
                    data-colspan="${A(o)}"
                    slot="${e.slot??d}">${l?ne(l):d}</div>
            `:He.span==r.container?n`
               <span style="${e.style}" class="${e.cssClasses}"
                     id="${A(e.id)}"
                     data-colspan="${A(o)}"
                    slot="${e.slot??d}">${l??d}</span>
            `:n`
               <p
                       id="${A(e.id)}"
                       data-colspan="${A(o)}"
                       slot="${e.slot??d}">
                   Unknown text container: ${r.container} 
               </p>
            `},Lr=(e,t,a)=>{const s=e.metadata;return n`<span theme="badge ${s.color} ${s.pill?"pill":""} ${s.small?"small":""} ${s.primary?"primary":""}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??d}">${Ee(s.text,t,a)}</span>`},Ar=(e,t,a)=>{const s=Ee(e.text,t,a);if(!s)return d;let i=Ee(e.color,t,a);return i=="SUCCESS"&&(i="success"),i=="ERROR"&&(i="error"),i=="DANGER"&&(i="error"),i=="WARNING"&&(i="warning"),i=="INFO"&&(i="info"),i=="PRIMARY"&&(i="primary"),i=="SECONDARY"&&(i="secondary"),i=="TERTIARY"&&(i="tertiary"),i=="QUATERNARY"&&(i="quaternary"),i=="LIGHT"&&(i="light"),i=="DARK"&&(i="dark"),n`<span theme="badge ${i} ${e.pill?"pill":""} ${e.small?"small":""} ${e.primary?"primary":""}">${s}</span>`},Dr=e=>{const t=e.metadata;return n`<a href="${t.url}" style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}">${t.text}</a>`},Gi=(e,t)=>{const a=e.toLowerCase().split("+");return t.ctrlKey===a.includes("ctrl")&&t.altKey===a.includes("alt")&&t.shiftKey===a.includes("shift")&&t.metaKey===a.includes("meta")},zr=(e,t)=>{if(!Gi(e,t))return!1;const a=e.toLowerCase().split("+"),s=a[a.length-1];return!!(t.key.toLowerCase()===s||/^[a-z]$/.test(s)&&t.code==="Key"+s.toUpperCase()||/^[0-9]$/.test(s)&&(t.code==="Digit"+s||t.code==="Numpad"+s))},Nr=e=>e?e.split("+").map(t=>t.length<=1?t.toUpperCase():t.charAt(0).toUpperCase()+t.slice(1)).join("+"):void 0,Fr=(e,t)=>{const a=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a,parameters:t.parameters},bubbles:!0,composed:!0}))},qr=(e,t,a)=>{const s=e.metadata,i=ge(s.label,t,a);let r="";return s.buttonStyle&&(r+=" "+s.buttonStyle),s.color&&s.color!=="none"&&s.color!=="normal"&&(r+=" "+s.color),s.size&&s.size!=="none"&&s.size!=="normal"&&(r+=" "+s.size),n`<vaadin-button
id="${e.id}"
            data-action-id="${s.actionId}"
            @click="${o=>Fr(o,s)}"
            style="${e.style}"
            class="${e.cssClasses}"
            theme="${r}"
            ?disabled="${s.disabled}"
            title="${s.shortcut?`${i} (${Nr(s.shortcut)})`:d}"
            slot="${e.slot??d}"
    >${s.iconOnLeft?n`<vaadin-icon icon="${s.iconOnLeft}"></vaadin-icon>`:d}${i}${s.iconOnRight?n`<vaadin-icon icon="${s.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>`},Mr=(e,t,a,s,i,r,o)=>{const l=t.metadata;if(!l)return n``;let c="";return l.variants?.map(u=>u=="stretchMedia"?"stretch-media":u=="coverMedia"?"cover-media":u).forEach(u=>c+=" "+u),c=c.trim(),n`
        <vaadin-card
                style="${t.style}" 
                class="${t.cssClasses}" 
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${l.media?kt(e,l.media,a,s,i,r,o,"media",!1):d}
            ${l.title?kt(e,l.title,a,s,i,r,o,"title",!1):d}
            ${l.subtitle?kt(e,l.subtitle,a,s,i,r,o,"subtitle",!1):d}
            ${l.header?kt(e,l.header,a,s,i,r,o,"header",!1):d}
            ${l.headerPrefix?kt(e,l.headerPrefix,a,s,i,r,o,"header-prefix",!1):d}
            ${l.headerSuffix?kt(e,l.headerSuffix,a,s,i,r,o,"header-suffix",!1):d}
            ${l.footer?kt(e,l.footer,a,s,i,r,o,"footer",!1):d}
            ${l.content?$(e,l.content,a,s,i,r,o,!1):d}
        </vaadin-card>
    `},Ur=e=>{const t=e.metadata;return n`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??d}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},Br=e=>{const t=e.metadata;return n`
        <vaadin-icon icon="${t.icon}" style="${e.style}" class="${e.cssClasses}"
                     slot="${e.slot??d}"></vaadin-icon>
    `},Wr=(e,t,a,s,i,r,o)=>{const l=t.metadata;let c=!1;if(l.openedCondition)try{c=Wi(l.openedCondition,s,i,r,o)}catch(u){console.error("when evaluating "+l.openedCondition+" :"+u+", where data is "+i+" and state is "+s)}return n`
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
  ${t.children?.map(u=>$(e,u,a,s,i,r,o))}
</vaadin-confirm-dialog>
            `},Vr=e=>{const t=e.metadata;let a;return t.position&&(a={Top:"top",Bottom:"bottom",TopLeft:"top-left",TopRight:"top-right",BottomLeft:"bottom-left",BottomRight:"bottom-right"}[t.position]),n`
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
    `},Hr=(e,t,a,s,i,r,o)=>{const l=t.metadata;return n`
        <vaadin-details 
                ?opened="${l.opened}" 
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            <vaadin-details-summary slot="summary">
            ${$(e,l.summary,a,s,i,r,o)}
            </vaadin-details-summary>
            ${$(e,l.content,a,s,i,r,o)}
        </vaadin-details>
            `},Gr=(e,t,a,s,i,r)=>n`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${s}"
            .appState="${i}"
            .appdata="${r}"
        ></mateu-dialog>
            `,Kr=(e,t,a,s,i,r)=>n`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${s}"
            .appState="${i}"
            .appdata="${r}"
        ></mateu-drawer>
            `,Jr=e=>{const t=e.metadata;return n`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"  
                  route="${t.route}" 
                  consumedRoute="${t.consumedRoute}" 
                  id="${de()}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??d}"
        ></mateu-ux>
        </mateu-api-caller>
            `},Yr=e=>{const t=e.metadata;return n`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style}" class="${e.cssClasses}"
                        slot="${e.slot??d}"></mateu-markdown>
            `},Xr=e=>{const t=e.metadata;return n`
        <vaadin-notification
                .opened="${!0}"
                slot="${e.slot??d}"
                style="${e.style}"
                class="${e.cssClasses}"
                ${qi(()=>n`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${t.title}</h3>
                        <div>
                            ${t.text}
                        </div>
                    </vaadin-horizontal-layout>
                `,[])}
        ></vaadin-notification>
            `},Qr=(e,t={})=>{const a=e.metadata,s=a.valueKey?t[a.valueKey]:a.value;return n`
        <div style="${e.style}">
        <vaadin-progress-bar
                ?indeterminate="${a.indeterminate}"
                min="${a.min&&a.min!=0?a.min:d}"
                max="${a.max&&a.max!=0?a.max:d}"
                value="${s??d}"
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??d}"
        ></vaadin-progress-bar>
        ${a.text?n`<span class="text-secondary text-xs" id="sublbl">
    ${a.text}
  </span>`:d}
        </div>
    `},Zr=(e,t,a,s,i,r,o)=>{const l=t.metadata;return n`
        <div id="show-notifications">${$(e,l.wrapped,a,s,i,r,o)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                slot="${t.slot??d}"
                ${Mi(()=>n`${$(e,l.content,a,s,i,r,o)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
        ></vaadin-popover>
    `},eo=e=>{const t=e.metadata;return n`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}"></mateu-map>
            `},to=e=>{const t=e.metadata;return n`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??d}">
            `},ao=e=>{const t=e.metadata;return n`<vaadin-horizontal-layout theme="spacing"
                                          slot="${e.slot??d}">
        ${t.breadcrumbs.map(a=>n`
            <a href="${a.link}">${a.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </vaadin-horizontal-layout>`},io=(e,t,a,s,i,r,o)=>{const l=t.metadata;return n`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${l.dots}" 
                ?nav = "${l.nav}" 
                ?loop = "${l.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(c=>n`<div>${$(e,c,a,s,i,r,o)}</div>`)}
        </skeleton-carousel>
    `},so=(e,t,a,s)=>{const i=e.metadata;return n`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            ${i.menu.map(r=>Ki(r))}
        </div>
            `},Ki=e=>n`
        ${e.submenus?n`
                <vaadin-details summary="${e.label}" opened>
                    <vaadin-vertical-layout theme="spacing">
                        ${e.submenus.map(t=>Ki(t))}
                    </vaadin-vertical-layout>
                </vaadin-details>
            `:n`
                <a href="${e.path}">${e.label}</a>
        `}
        `,ro=(e,t,a,s,i,r,o)=>{const l=t.metadata;return n`<div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >${l.content?ne(l.content):d}${t.children?.map(c=>$(e,c,a,s,i,r,o))}</div>
    `},oo=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return n`<vaadin-card
                slot="${t.slot??d}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?n`<div slot="title" style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color);">${c}</div>`:d}
        ${t.children?.map(u=>$(e,u,a,s,i,r,o))}
    </vaadin-card>
    `},no=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return n`
        <div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(u=>$(e,u,a,s,i,r,o))}</div>
    `},Ha=(e,t,a,s,i,r,o,l)=>{const c=t.metadata,u=c?.fabs??[];return n`<mateu-page
            .component="${t}"
            baseUrl="${a}"
            .state="${s}"
            .data="${i}"
            .appState="${r}"
            .appdata="${o}"
            slot="${t.slot??d}"
            style="${t.style}"
            class="${t.cssClasses}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(h=>$(e,h,a,s,i,r,o))}
        ${c?.buttons?.map(h=>n`
                   ${$(e,{id:h.actionId,metadata:h,type:ee.ClientSide,slot:"buttons"},void 0,s,i,r,o)}
`)}
        ${u.map((h,p)=>n`
            <button class="page-fab" style="position: fixed; bottom: ${1.5+p*4}rem; right: 5.5rem;"
                @click="${()=>e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:h.actionId},bubbles:!0,composed:!0}))}"
                title="${h.label}">
                <vaadin-icon icon="${h.icon}"></vaadin-icon>
            </button>
        `)}
</mateu-page>
    `},Ga=(e,t,a,s,i,r,o,l)=>n`<mateu-table-crud
            id="${t.id}"
            baseUrl="${a}"
            .component="${t}"
            .metadata="${t.metadata}"
            .state="${s}"
            .data="${i}"
            .appState="${r}"
            .appdata="${o}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(c=>$(e,c,a,s,i,r,o))}
    </mateu-table-crud>`,lo=e=>{const t=e.metadata;return n`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??d}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},co=(e,t,a)=>{const s=e.metadata;return n`<mateu-chat sseUrl="${s.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??d}"></mateu-chat>`},uo=e=>{const t=e.metadata;return n`
        <mateu-workflow
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow>
    `},ho=e=>{const t=e.metadata;return n`
        <mateu-workflow-elk
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
                ?readOnly="${t.readOnly??!1}"
        ></mateu-workflow-elk>
    `},po=e=>{const t=e.metadata;return n`
        <mateu-form-editor
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Form","fields":[]}'}"
        ></mateu-form-editor>
    `},Ji=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,mo=e=>e=="up"?"var(--lumo-success-text-color, #1a7f37)":e=="down"?"var(--lumo-error-text-color, #c5221f)":"var(--lumo-secondary-text-color, #666)",vo=e=>e=="up"?"▲":e=="down"?"▼":"",fo=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},bo=e=>{const t=e.metadata,a=!!t.actionId;return n`
        <div class="mateu-metric-card ${e.cssClasses??""}"
             style="${Ji} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${a?"cursor: pointer;":""} ${e.style??""}"
             slot="${e.slot??d}"
             role="${a?"button":d}"
             @click="${s=>fo(s,t)}"
        >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${t.title}</span>
                ${t.icon?n`<vaadin-icon icon="${t.icon}" style="color: var(--lumo-tertiary-text-color, #999); width: 1.1em; height: 1.1em;"></vaadin-icon>`:d}
            </div>
            <div style="display: flex; align-items: baseline; gap: .35rem;">
                <span style="font-size: var(--lumo-font-size-xxxl, 2rem); font-weight: 600; line-height: 1.1;">${t.value}</span>
                ${t.unit?n`<span style="font-size: var(--lumo-font-size-m, 1rem); color: var(--lumo-secondary-text-color, #666);">${t.unit}</span>`:d}
            </div>
            ${t.trend||t.trendLabel?n`
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${mo(t.trend)};">
                    ${vo(t.trend)} ${t.trendLabel??d}
                </span>
            `:d}
            ${t.description?n`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:d}
        </div>
    `},go=(e,t,a,s,i,r,o)=>n`
        <div class="mateu-scoreboard ${t.cssClasses??""}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(l=>$(e,l,a,s,i,r,o))}
        </div>
    `,$o=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=l.colSpan&&l.colSpan>1?`grid-column: span ${l.colSpan};`:"",u=l.rowSpan&&l.rowSpan>1?`grid-row: span ${l.rowSpan};`:"";return n`
        <div class="mateu-dashboard-panel ${t.cssClasses??""}"
             style="${Ji} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${u} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?n`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${l.title}</h3>
                    ${l.subtitle?n`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${l.subtitle}</span>`:d}
                </div>
            `:d}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(h=>$(e,h,a,s,i,r,o))}
            </div>
        </div>
    `},yo=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=l.columns&&l.columns>0?`repeat(${l.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return n`
        <div class="mateu-dashboard ${t.cssClasses??""}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(u=>$(e,u,a,s,i,r,o))}
        </div>
    `};var xo=Object.defineProperty,wo=Object.getOwnPropertyDescriptor,ii=(e,t,a,s)=>{for(var i=s>1?void 0:s?wo(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&xo(t,a,i),i};let ia=class extends j{constructor(){super(...arguments),this.panels=[],this.openPanels=new Set,this.initialized=!1}willUpdate(){!this.initialized&&this.panels.length&&(this.openPanels=new Set(this.panels.map((e,t)=>e.open?t:-1).filter(e=>e>=0)),this.initialized=!0)}toggle(e){const t=new Set(this.openPanels);t.has(e)?t.delete(e):t.add(e),this.openPanels=t}render(){return n`
            <div class="overview" part="overview">
                <slot name="overview"></slot>
            </div>
            <div class="rail" part="rail">
                ${this.panels.map((e,t)=>this.openPanels.has(t)?n`
                    <div class="panel" part="panel">
                        <div class="panel-header">
                            <div>
                                <h3>${e.title}</h3>
                                ${e.subtitle?n`<div class="subtitle">${e.subtitle}</div>`:""}
                            </div>
                            <button class="fold" title="Fold" @click="${()=>this.toggle(t)}">⟨</button>
                        </div>
                        <div style="flex: 1; min-height: 0;">
                            <slot name="panel-${t}"></slot>
                        </div>
                    </div>
                `:n`
                    <div class="strip" role="button" title="${e.title}" @click="${()=>this.toggle(t)}">
                        <button class="fold" tabindex="-1">⟩</button>
                        <span>${e.title}</span>
                    </div>
                `)}
            </div>
        `}};ia.styles=R`
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
    `;ii([v({type:Array})],ia.prototype,"panels",2);ii([g()],ia.prototype,"openPanels",2);ia=ii([I("mateu-foldout")],ia);const ko=(e,t,a,s,i,r,o)=>{const l=t.metadata;return n`
        <mateu-foldout
                .panels="${l.panels??[]}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(c=>$(e,c,a,s,i,r,o))}
        </mateu-foldout>
    `},Co=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=!!l.image,u=c?`background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${l.image}'); background-size: cover; background-position: center; color: #fff;`:"",h=l.centered===!1?"flex-start":"center",p=l.centered===!1?"left":"center";return n`
        <div class="mateu-hero ${t.cssClasses??""}"
             style="display: flex; flex-direction: column; align-items: ${h}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${p}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); min-height: ${l.height??"12rem"}; box-sizing: border-box; ${u} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?n`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${l.title}</h1>`:d}
            ${l.subtitle?n`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${c?"":"color: var(--lumo-secondary-text-color, #666);"} max-width: 40rem;">${l.subtitle}</p>`:d}
            ${t.children?.length?n`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${h}; width: 100%; max-width: 40rem;">
                    ${t.children?.map(f=>$(e,f,a,s,i,r,o))}
                </div>
            `:d}
        </div>
    `};var So=Object.defineProperty,Eo=Object.getOwnPropertyDescriptor,Yi=(e,t,a,s)=>{for(var i=s>1?void 0:s?Eo(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&So(t,a,i),i};const Na=1440*60*1e3;let xa=class extends j{constructor(){super(...arguments),this.tasks=[]}range(){const e=this.tasks.flatMap(t=>[t.start,t.end]).filter(t=>!!t).map(t=>new Date(t+"T00:00:00").getTime());return e.length?{min:Math.min(...e)-Na,max:Math.max(...e)+2*Na}:null}months(e,t){const a=[],s=new Date(e);for(s.setDate(1);s.getTime()<=t;){const i=Math.max(s.getTime(),e),r=new Date(s.getFullYear(),s.getMonth()+1,1),o=Math.min(r.getTime(),t);a.push({label:s.toLocaleDateString(void 0,{month:"short",year:"2-digit"}),from:i,to:o}),s.setMonth(s.getMonth()+1)}return a}render(){const e=this.range();if(!e)return n``;const t=e.max-e.min,a=i=>(i-e.min)/t*100,s=Date.now();return n`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(i=>n`
                        <div class="month" style="width: ${(i.to-i.from)/t*100}%;">${i.label}</div>
                    `)}
                </div>
                ${this.tasks.map(i=>{const r=new Date(i.start+"T00:00:00").getTime(),o=new Date(i.end+"T00:00:00").getTime()+Na;return n`
                        <div class="label" title="${i.title}">${i.title}</div>
                        <div class="lane">
                            ${s>=e.min&&s<=e.max?n`<div class="today" style="left: ${a(s)}%;"></div>`:d}
                            <div class="bar"
                                 title="${i.title} · ${i.start} → ${i.end}${i.progress?` · ${i.progress}%`:""}"
                                 style="left: ${a(r)}%; width: ${(o-r)/t*100}%; ${i.color?`--mateu-gantt-fill: ${i.color};`:""}">
                                <div class="fill" style="width: ${i.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};xa.styles=R`
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
    `;Yi([v({type:Array})],xa.prototype,"tasks",2);xa=Yi([I("mateu-gantt")],xa);const Io=e=>{const t=e.metadata;return n`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-gantt>
    `},_o=(e,t)=>{let a=e.style;return e.id&&(a&&!a.endsWith(";")&&(a+=";"),a==null&&(a=""),t[e.id+".hidden"]==!0&&(a+="display: none;")),a},To=(e,t)=>{let a={...e.metadata};if(e.id&&a){if(a.type==m.Button){const s=a;t[e.id+".disabled"]==!0&&(s.disabled=!0)}if(a.type==m.FormField){const s=a;t[e.id+".disabled"]==!0&&(s.disabled=!0)}}return a},L=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),Ro={[m.Bpmn]:({component:e})=>lo(e),[m.Workflow]:({component:e})=>uo(e),[m.WorkflowElk]:({component:e})=>ho(e),[m.FormEditor]:({component:e})=>po(e),[m.Page]:L(Ha),[m.Div]:L(ro),[m.Directory]:({component:e,baseUrl:t,state:a,data:s})=>so(e),[m.FormLayout]:L(js),[m.HorizontalLayout]:L(Ds),[m.VerticalLayout]:L(zs),[m.SplitLayout]:L(Ns),[m.MasterDetailLayout]:L(Fs),[m.TabLayout]:L(qs),[m.AccordionLayout]:L(Us),[m.BoardLayout]:L(Gs),[m.BoardLayoutRow]:L(Ks),[m.BoardLayoutItem]:L(Js),[m.Scroller]:L(Ws),[m.FullWidth]:L(Vs),[m.Container]:L(Hs),[m.Form]:({container:e,component:t,baseUrl:a,state:s,data:i,appState:r,appData:o})=>{const l=t.metadata;return n`<mateu-form
            id="${t.id}"
        baseUrl="${a}"
            .component="${t}"
            .values="${s}"
            .state="${s}"
            .data="${i}"
            .appState="${r}"
            .appdata="${o}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            >
                ${t.children?.map(c=>$(e,c,a,s,i,r,o))}
            ${l?.buttons?.map(c=>n`
               ${$(e,{id:c.actionId,metadata:c,type:ee.ClientSide,slot:"buttons"},void 0,s,i,r,o)}
`)}

            </mateu-form>`},[m.Table]:({container:e,component:t,baseUrl:a,state:s,data:i,appState:r,appData:o})=>n`<mateu-table
                        id="${t.id}"
        baseUrl="${a}"
            .metadata="${t.metadata}"
            .state="${s}"
                        .data="${i}"
                        .appState="${r}"
                        .appDate="${o}"
                        style="${t.style}" class="${t.cssClasses}"
                        slot="${t.slot??d}"
            >
             ${t.children?.map(l=>$(e,l,a,s,i,r,o))}
            </mateu-table>`,[m.Crud]:L(Ga),[m.App]:({container:e,component:t,baseUrl:a,state:s,data:i,appState:r,appData:o})=>n`
            <mateu-app
                        id="${t.id}"
                        baseUrl="${a}"
                        .component="${t}"
                        .state="${s}"
                        .data="${i}"
                        style="${t.style}"
                        class="${t.cssClasses}"
                        .appState="${r}"
                        .appData="${o}"
            >
             ${t.children?.map(l=>$(e,l,a,s,i,r,o))}
         </mateu-app>`,[m.Element]:({container:e,component:t})=>Or(e,t.metadata,t),[m.FormField]:({container:e,component:t,baseUrl:a,state:s,data:i,appState:r,appData:o,labelAlreadyRendered:l})=>{const c=t.metadata;return n`
    <mateu-field
                   id="${t.id}"
                   .component="${t}"
            .field="${t.metadata}"
                   .state="${s}"
                   .data="${i}"
                   .appState="${r}"
                   .appdata="${o}"
                   style="${t.style}" class="${t.cssClasses}"
                   slot="${t.slot??d}"
                   data-colspan="${c.colspan}"
                   .labelAlreadyRendered="${l}"
            >
                    ${t.children?.map(u=>$(e,u,a,s,i,r,o,l))}
                </mateu-field>
        `},[m.Text]:({component:e,state:t,data:a,appState:s,appData:i})=>jr(e,t,a,s,i),[m.Avatar]:({component:e,state:t,data:a})=>Xs(e,t,a),[m.Chat]:({component:e,state:t,data:a})=>co(e),[m.AvatarGroup]:({component:e})=>Qs(e),[m.Badge]:({component:e,state:t,data:a})=>Lr(e,t,a),[m.Breadcrumbs]:({component:e})=>ao(e),[m.Anchor]:({component:e})=>Dr(e),[m.Button]:({component:e,state:t,data:a})=>qr(e,t,a),[m.Card]:L(Mr),[m.Chart]:({component:e})=>Ur(e),[m.Icon]:({component:e})=>Br(e),[m.ConfirmDialog]:L(Wr),[m.ContextMenu]:L(Sr),[m.CookieConsent]:({component:e})=>Vr(e),[m.Details]:L(Hr),[m.Dialog]:({component:e,baseUrl:t,state:a,data:s,appState:i,appData:r})=>Gr(e,t,a,s,i,r),[m.Drawer]:({component:e,baseUrl:t,state:a,data:s,appState:i,appData:r})=>Kr(e,t,a,s,i,r),[m.Image]:({component:e})=>to(e),[m.Map]:({component:e})=>eo(e),[m.Markdown]:({component:e})=>Yr(e),[m.MicroFrontend]:({component:e})=>Jr(e),[m.Notification]:({component:e})=>Xr(e),[m.ProgressBar]:({component:e,state:t})=>Qr(e,t),[m.Popover]:L(Zr),[m.CarouselLayout]:L(io),[m.Tooltip]:L(Tr),[m.MessageInput]:({component:e})=>_r(e),[m.MessageList]:({component:e})=>Cr(e),[m.CustomField]:L(Ir),[m.MenuBar]:({container:e,component:t,baseUrl:a,state:s,data:i})=>Er(e,t,a,s,i),[m.Grid]:L(kr),[m.VirtualList]:L(Zs),[m.FormSection]:L(oo),[m.FormSubSection]:L(no),[m.MetricCard]:({component:e})=>bo(e),[m.Scoreboard]:L(go),[m.DashboardPanel]:L($o),[m.DashboardLayout]:L(yo),[m.FoldoutLayout]:L(ko),[m.HeroSection]:L(Co),[m.EmptyState]:({component:e})=>ir(e),[m.Skeleton]:({component:e})=>sr(e),[m.Gantt]:({component:e})=>Io(e)},si=(e,t,a,s,i,r,o,l)=>{if(!t?.metadata)return t==null?(console.warn("No metadata for component",t),n`<p>No metadata for component</p>`):si(e,{id:de(),metadata:t,type:ee.ClientSide},a,s,i,r,o,l);const c=t.metadata.type,u={...t,style:_o(t,i),metadata:To(t,i)},h=Ro[c];return h?h({container:e,component:u,baseUrl:a,state:s,data:i,appState:r,appData:o,labelAlreadyRendered:l}):n`<p ${u?.slot??d}>Unknown metadata type ${c} for component ${u?.id}</p>`};var le=(e=>(e.HAMBURGUER_MENU="HAMBURGUER_MENU",e.MENU_ON_LEFT="MENU_ON_LEFT",e.MENU_ON_TOP="MENU_ON_TOP",e.TABS="TABS",e.TILES="TILES",e.RAIL="RAIL",e.AUTO="AUTO",e.MEDIATOR="MEDIATOR",e))(le||{});const ri="mateu-app-context",Xi="mateu-app-context-labels",Qi=e=>{try{return JSON.parse(localStorage.getItem(e)??"{}")}catch{return{}}},xi=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},oi=()=>Qi(ri),Zi=()=>Qi(Xi),Po=(e,t,a)=>{const s=oi(),i=Zi();t==null||t===""?(delete s[e],delete i[e]):(s[e]=t,a!==void 0&&(i[e]=a)),xi(ri,s),xi(Xi,i)};let wi=!1;const Oo=()=>{wi||(wi=!0,window.addEventListener("storage",e=>{e.key===ri&&e.newValue!==e.oldValue&&window.location.reload()}))};let At=[];class jo{constructor(){this.axiosInstance=Es.create({timeout:6e4}),this.axiosInstance.interceptors.request.use(t=>(this.addAuthToken(t),this.addSessionId(t),t))}addSessionId(t){let a=sessionStorage.getItem("__mateu_sesion_id");a||(a=de(),sessionStorage.setItem("__mateu_sesion_id",a)),t.headers["X-Session-Id"]=a}addAuthToken(t){const a=localStorage.getItem("__mateu_auth_token");a&&(t.headers.Authorization="Bearer "+a)}async wrap(t,a,s,i){return s||a.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),t.then(r=>(a.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:i}})),r)).catch(r=>{throw r?.code=="ERR_CANCELED"?a.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{}})):a.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:i,reason:this.serialize(r)}})),r})}serialize(t){return t?.message?t:JSON.stringify(t)}async get(t){const a=new AbortController;return At=[...At,a],this.axiosInstance.get(t,{signal:a.signal})}async post(t,a){const s=new AbortController;return At=[...At,s],this.axiosInstance.post(t,a,{signal:s.signal})}async abortAll(){At.forEach(t=>t.abort()),At=[]}async runAction(t,a,s,i,r,o,l,c,u,h,p){return a&&a.startsWith("/")&&(a=a.substring(1)),o={...oi(),...o},await this.wrap(this.post(t+"/mateu/v3/sync/"+(a&&a!=""?a:"_no_route"),{serverSideType:l,appState:o,componentState:c,parameters:u,initiatorComponentId:r,consumedRoute:s,route:a&&a!=""?"/"+a:"",actionId:i}).then(f=>f.data),h,p,i)}}const ni=new jo;var Lo=Object.defineProperty,Ao=Object.getOwnPropertyDescriptor,Pt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ao(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Lo(t,a,i),i};let De=class extends j{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.searchText=""}connectedCallback(){super.connectedCallback(),Oo()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(oi()[this.selector.fieldName]??"")}currentLabel(){const e=this.currentValue();if(!e)return"—";const t=(this.searchedOptions??this.selector.options)?.find(s=>String(s.value)===e);if(t)return t.label;const a=Zi()[this.selector.fieldName];return a!==void 0?String(a):e}pick(e,t){Po(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText="",this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector("input.picker-search")?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){const e=this.app;if(e?.serverSideType)try{const t=await ni.runAction(this.baseUrl??"",e.rootRoute??e.initialRoute??"","",`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(const a of t?.fragments??[]){const r=a.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(r)){this.searchedOptions=r.map(o=>({value:o.value,label:o.label??String(o.value)}));return}}}catch{}}visibleOptions(){const e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(a=>a.label.toLowerCase().includes(t)):e}renderPanel(){const e=this.currentValue(),t=this.visibleOptions(),a=this.searchText!==""||t.length>De.SEARCHABLE_THRESHOLD;return n`
            <div class="panel">
                ${a?n`
                    <input class="picker-search" type="text" placeholder="Search"
                           .value="${this.searchText}"
                           @input="${this.onSearchInput}"
                           @keydown="${s=>{s.key==="Escape"&&this.closePanel()}}"/>`:d}
                <div class="options">
                    ${e?n`
                        <div class="option option--clear" @click="${()=>this.pick("")}">— (clear)</div>`:d}
                    ${t.map(s=>n`
                        <div class="option ${e===String(s.value)?"option--selected":""}"
                             @click="${()=>this.pick(s.value,s.label)}">${s.label}</div>`)}
                </div>
            </div>`}render(){return this.selector?n`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                <button class="picker-button"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    ${this.currentLabel()} <span aria-hidden="true" class="caret">▾</span>
                </button>
                ${this.opened?this.renderPanel():d}
            </label>`:n``}};De.SEARCHABLE_THRESHOLD=7;De.styles=R`
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
    `;Pt([v()],De.prototype,"selector",2);Pt([v()],De.prototype,"app",2);Pt([v()],De.prototype,"baseUrl",2);Pt([g()],De.prototype,"opened",2);Pt([g()],De.prototype,"searchText",2);Pt([g()],De.prototype,"searchedOptions",2);De=Pt([I("mateu-app-context-picker")],De);const Xt=(e,t)=>{const a=e.contextSelectors??[];return a.length===0?d:n`${a.map(s=>n`
        <mateu-app-context-picker .selector="${s}" .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-app-context-picker>`)}`},$a=(e,t)=>e.themeToggle?n`
        <vaadin-button theme="tertiary icon" @click="${t.toggleTheme}"
            title="${t.isDark?"Switch to light mode":"Switch to dark mode"}"
            style="margin-left: 0.5rem; margin-right: 0.5rem; flex-shrink: 0;">
            <vaadin-icon icon="${t.isDark?"vaadin:sun-o":"vaadin:moon"}" style="color: var(--lumo-body-text-color);"></vaadin-icon>
        </vaadin-button>
    `:d,Do=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},ki=(e,t,a)=>{const s=Se(e,t,a),i=Q(t,a);return s=="list"||s==i?"new":s},Se=(e,t,a)=>{const s=e?._route;if(s!=null&&(s===""||s.startsWith("/"))){const i=a.homeRoute??"",r=i.indexOf("?"),o=r>=0?i.substring(r+1):"",l=Q(t,a)+s;if(!o)return l;const c=l.indexOf("?")>=0?"&":"?";return l+c+o}return t.selectedRoute?t.selectedRoute:a.homeRoute},Q=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,me=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:t.homeBaseUrl,ve=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,fe=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,zo=(e,t,a,s,i,r,o)=>{const l=e.mapItems(t.menu,e.filter?.toLowerCase()??""),c=Q(e,t),u=ki(s,e,t),h=u&&u!=="new"&&u.startsWith(c+"/")?u.substring(c.length+1).split("/")[0]:void 0;return n`
                    ${t.variant==le.MEDIATOR?n`

                        ${t.layout=="SPLIT"?n`
                            <vaadin-master-detail-layout>
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${Q(e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${me(e,t)}"
                                            consumedRoute="${Q(e,t)}"
                                            serverSideType="${ve(e,t)}"
                                            uriPrefix="${fe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${{...r,_splitDetailId:h}}"
                                            .appData="${o}"
                                            instant="${c}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>
                                <mateu-api-caller slot="detail">
                                    <div style="padding-left: 1rem; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${ki(s,e,t)}"
                                            id="ux_${e.id}_detail"
                                            baseUrl="${me(e,t)}"
                                            consumedRoute="${Q(e,t)}"
                                            serverSideType="${ve(e,t)}"
                                            uriPrefix="${fe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>

                            </vaadin-master-detail-layout>
                        `:n`
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${Se(s,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${me(e,t)}"
                                        consumedRoute="${Q(e,t)}"
                                        serverSideType="${ve(e,t)}"
                                        uriPrefix="${fe(e,t)}"
                                        style="width: 100%;"
                                        .appState="${r}"
                                        .appData="${o}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `}
                        
`:d}
            ${t.variant==le.HAMBURGUER_MENU?n`
                <vaadin-app-layout style="${t?.style}" class="${t?.cssClasses}" .drawerOpened=${!t.drawerClosed}>
                    <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                    <h2 slot="navbar" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2><p slot="navbar">${t.subtitle}</p>
                    <vaadin-horizontal-layout slot="navbar" style="margin-left: auto; align-items: center;">
                        <slot name="widgets"></slot>
                        ${Xt(t,e)}${$a(t,e)}
                    </vaadin-horizontal-layout>
                    <vaadin-scroller slot="drawer" class="p-s"
                                     @navigation-requested="${e.updateRoute}">
                        ${t.menu&&t.totalMenuOptions>10?n`
                            <vaadin-text-field style="width: calc(100% - 20px); padding-left: 10px; padding-right: 10px;" @value-changed="${p=>Do(p,e)}">
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
                                            route="${Se(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${me(e,t)}"
                                            consumedRoute="${Q(e,t)}"
                                            serverSideType="${ve(e,t)}"
                                            uriPrefix="${fe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?n`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .menu="${t.menu}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-app-layout>

            `:d}
            
            ${t.variant==le.MENU_ON_TOP?n`
                <vaadin-vertical-layout style="width: 100%; height: 100vh; overflow: hidden;">
                    <vaadin-horizontal-layout
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>e.goHome()}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <vaadin-horizontal-layout style="align-items: center;">
                            ${t.logo?n`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:d}
                            ${t.title?n`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:d}
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
                            ${Xt(t,e)}${$a(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Se(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${me(e,t)}"
                                            consumedRoute="${Q(e,t)}"
                                            serverSideType="${ve(e,t)}"
                                            uriPrefix="${fe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?n`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .menu="${t.menu}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-vertical-layout>

            `:d}

            ${t.variant==le.TILES?n`
                <vaadin-vertical-layout style="width: 100%; height: 100vh; overflow: hidden;">
                    <vaadin-horizontal-layout
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>{e.goHome(),e.tilesMenuOption=null}}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <vaadin-horizontal-layout style="align-items: center;">
                            ${t.logo?n`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:d}
                            ${t.title?n`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:d}
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
                            ${Xt(t,e)}${$a(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):n`
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Se(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${me(e,t)}"
                                            consumedRoute="${Q(e,t)}"
                                            serverSideType="${ve(e,t)}"
                                            uriPrefix="${fe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?n`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .menu="${t.menu}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                        `}
                    </div>
                </vaadin-vertical-layout>
            `:d}

            ${t.variant==le.RAIL?n`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):d}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Se(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${me(e,t)}"
                                            consumedRoute="${Q(e,t)}"
                                            serverSideType="${ve(e,t)}"
                                            uriPrefix="${fe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?n`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .menu="${t.menu}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </div>
            `:d}

            ${t.variant==le.MENU_ON_LEFT?n`

                <vaadin-horizontal-layout>
                    <vaadin-scroller style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <vaadin-vertical-layout
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(p=>e.renderOptionOnLeftMenu(p))}
                            ${Xt(t,e)}${$a(t,e)}
                        </vaadin-vertical-layout>
                    </vaadin-scroller>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Se(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${me(e,t)}"
                                            consumedRoute="${Q(e,t)}"
                                            serverSideType="${ve(e,t)}"
                                            uriPrefix="${fe(e,t)}"
                                            style="width: 100%; padding: 1em;"
                                            .appState="${r}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?n`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .menu="${t.menu}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-horizontal-layout>


            `:d}

            ${t.variant==le.TABS?n`
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
                                ${t.logo?n`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:d}
                                ${t.title?n`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:d}
                            </vaadin-horizontal-layout>
                            </a>
                            <vaadin-tabs selected="${e.getSelectedIndex(t.menu)}"
                                         style="box-shadow: unset; flex-grow: 1; min-width: 0;"
                                         class="${e.component?.cssClasses}">
                                ${t.menu.map(p=>n`
                                <vaadin-tab 
                                        @click="${()=>e.selectRoute(p.consumedRoute,p.route,p.actionId,p.baseUrl,p.serverSideType,p.uriPrefix)}"
                                >${p.label}</vaadin-tab>
                            `)}
                            </vaadin-tabs>
                            <vaadin-horizontal-layout style="flex-shrink: 0; align-items: center;">
                                <slot name="widgets"></slot>
                                ${Xt(t,e)}
                            </vaadin-horizontal-layout>
                        </vaadin-horizontal-layout>
                    </div>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Se(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${me(e,t)}"
                                            consumedRoute="${Q(e,t)}"
                                            serverSideType="${ve(e,t)}"
                                            uriPrefix="${fe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?n`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .menu="${t.menu}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </div>
            
            `:d}

            ${t.fabs?.map((p,f)=>n`
                <button class="app-fab" style="bottom: ${t.sseUrl?5.5+f*4:1.5+f*4}rem; right: 1.5rem;"
                    @click="${()=>e.runAction(p.actionId)}"
                    title="${p.label}">
                    <vaadin-icon icon="${p.icon}"></vaadin-icon>
                </button>
            `)}
            ${t.sseUrl&&!e.chatOpen?n`
                <button class="ai-fab" @click="${e.showHideIa}" title="Asistente IA">
                    <vaadin-icon icon="vaadin:comments-o"></vaadin-icon>
                </button>
            `:d}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},No=(e,t)=>t!=null&&e!=null&&!e.has(t),Fo=typeof HTMLElement<"u"?HTMLElement:class{};class qo extends Fo{static get observedAttributes(){return["type","renderer"]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){const t=this.getAttribute("type")??"unknown",a=this.getAttribute("renderer")??"unknown";this.shadowRoot||this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
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
        `}}typeof customElements<"u"&&!customElements.get("mateu-unsupported")&&customElements.define("mateu-unsupported",qo);const Ci=new Set,Mo=(e,t,a)=>{const s=`${a}/${t}`;return Ci.has(s)||(Ci.add(s),console.warn(`[mateu] Component type "${t}" is not supported by the "${a}" renderer — rendering <mateu-unsupported> placeholder.`)),n`<mateu-unsupported
            type="${t}"
            renderer="${a}"
            data-component-id="${e?.id??d}"
            slot="${e?.slot??d}"
    ></mateu-unsupported>`};class Uo{renderFilterBar(t,a,s,i,r,o,l,c){const u=a?.metadata,h=f=>{const{fieldId:y,value:w}=f.detail;t.state={...t.state,[y]:w}},p=f=>{const{fieldIds:y}=f.detail,w={};y.forEach(x=>{w[x]=void 0}),w.searchText=void 0,t.state={...t.state,...w}};return n`
            <mateu-filter-bar
                .metadata="${u}"
                @search-requested="${t.search}"
                @value-changed="${h}"
                @filter-reset-requested="${p}"
                .state="${t.state}"
                .data="${r}"
                .appState="${o}"
                .appData="${l}"
                ?searchOnly="${c??!1}"
            >
                ${u?.header?.map(f=>$(t,f,s,i,r,o,l))}
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
        `}renderTableComponent(t,a,s,i,r,o,l){return n`
        <mateu-table id="${t.id}"
                     .metadata="${a?.metadata}"
                     .data="${t.data}"
                     .state="${i}"
                     .appState="${o}"
                     .appData="${l}"
                     .emptyStateMessage="${i[a?.id]?.emptyStateMessage}"
                     @sort-direction-changed="${t.directionChanged}"
                     @fetch-more-elements="${t.fetchMoreElements}"
                     baseUrl="${s}"
        ></mateu-table>
        `}rendererName(){return this.constructor?.name??"unknown"}supportedClientSideTypes(){}renderClientSideComponent(t,a,s,i,r,o,l,c){const u=a?.metadata?.type??a?.type,h=Object.values(m).includes(u)?u:void 0;return No(this.supportedClientSideTypes(),h)?Mo(a,h,this.rendererName()):si(t,a,s,i,r,o,l,c)}renderAppComponent(t,a,s,i,r,o,l){return zo(t,a?.metadata,s,i,r,o,l)}}const Si="border-left: 1px solid var(--oj-core-text-color-secondary, #888); height: 1.5rem; display: inline-block; align-self: center;",Bo=(e,t,a,s)=>{const i=e.metadata,r=e.slot??d;if(i.children&&i.children.length>0){const o=i.children.map(l=>({key:l.actionId,label:l.label,disabled:l.disabled??!1}));return n`
            ${i.separatorBefore?n`<span slot="${r}" style="${Si}"></span>`:d}
            <oj-c-menu-button
                data-oj-binding-provider="preact"
                label="${i.label}"
                .items="${o}"
                slot="${r}"
                @ojMenuAction="${l=>{const c=l.detail.key;l.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:c},bubbles:!0,composed:!0}))}}"
            ></oj-c-menu-button>
        `}return n`
        ${i.separatorBefore?n`<span slot="${r}" style="${Si}"></span>`:d}
        <oj-c-button
            data-oj-binding-provider="preact"
            data-action-id="${i.actionId}"
            label="${i.label}"
            @ojAction=${lc}
            slot="${r}"
        ></oj-c-button>
    `};var Wo=Object.defineProperty,Vo=Object.getOwnPropertyDescriptor,la=(e,t,a,s)=>{for(var i=s>1?void 0:s?Vo(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Wo(t,a,i),i};let St=class extends j{constructor(){super(...arguments),this.fieldId="",this.signing=!1,this.hasStrokes=!1,this.drawing=!1,this.startStroke=e=>{const t=e.target;this.ensureCanvasSize(t),t.setPointerCapture(e.pointerId),this.drawing=!0;const a=t.getContext("2d");a.lineWidth=2,a.lineCap="round",a.lineJoin="round",a.strokeStyle=getComputedStyle(this).getPropertyValue("--lumo-body-text-color")||"#1a1a1a";const[s,i]=this.pointerPosition(e);a.beginPath(),a.moveTo(s,i),e.preventDefault()},this.stroke=e=>{if(!this.drawing)return;const a=e.target.getContext("2d"),[s,i]=this.pointerPosition(e);a.lineTo(s,i),a.stroke(),this.hasStrokes=!0,e.preventDefault()},this.endStroke=e=>{this.drawing=!1,e.target.releasePointerCapture(e.pointerId)}}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}canvas(){return this.renderRoot.querySelector("canvas")}pointerPosition(e){const a=e.target.getBoundingClientRect();return[e.clientX-a.left,e.clientY-a.top]}ensureCanvasSize(e){const t=e.getBoundingClientRect();(e.width!==Math.round(t.width)||e.height!==Math.round(t.height))&&(e.width=Math.round(t.width),e.height=Math.round(t.height))}clear(){const e=this.canvas();e&&e.getContext("2d").clearRect(0,0,e.width,e.height),this.hasStrokes=!1}accept(){const e=this.canvas();!e||!this.hasStrokes||(this.signing=!1,this.emit(e.toDataURL("image/png")))}renderPad(){return n`
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
            </div>`}};St.styles=R`
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
    `;la([v()],St.prototype,"fieldId",2);la([v()],St.prototype,"value",2);la([g()],St.prototype,"signing",2);la([g()],St.prototype,"hasStrokes",2);St=la([I("mateu-signature-pad")],St);var Ho=Object.defineProperty,Go=Object.getOwnPropertyDescriptor,Ot=(e,t,a,s)=>{for(var i=s>1?void 0:s?Go(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Ho(t,a,i),i};let nt=class extends j{constructor(){super(...arguments),this.fieldId="",this.options=[],this.leavesOnly=!1,this.opened=!1,this.expanded=new Set}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}open(){this.opened||(this.opened=!0,this.expanded=new Set(this.pathTo(this.value??"",this.options)??[]),this.outsideClick=e=>{e.composedPath().includes(this)||this.close()},document.addEventListener("mousedown",this.outsideClick))}close(){this.detachOutsideClick(),this.opened=!1}pick(e){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e.value,fieldId:this.fieldId},bubbles:!0,composed:!0}))}clear(){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:this.fieldId},bubbles:!0,composed:!0}))}pathTo(e,t){for(const a of t){if(String(a.value)===e)return[];const s=this.pathTo(e,a.children??[]);if(s!=null)return[String(a.value),...s]}return null}labelOf(e,t){for(const a of t){if(String(a.value)===e)return a.label;const s=this.labelOf(e,a.children??[]);if(s!=null)return s}return null}toggle(e){const t=String(e.value),a=new Set(this.expanded);a.has(t)?a.delete(t):a.add(t),this.expanded=a}renderNode(e,t){const a=(e.children?.length??0)>0,s=this.expanded.has(String(e.value)),i=!this.leavesOnly||!a,r=String(e.value)===String(this.value??"");return n`
            <div class="node ${r?"node--selected":""} ${i?"":"node--group"}"
                 style="padding-left: ${.5+t*1.1}rem;"
                 @mousedown="${o=>o.preventDefault()}"
                 @click="${()=>i?this.pick(e):this.toggle(e)}">
                ${a?n`
                    <span class="caret" @click="${o=>{o.stopPropagation(),this.toggle(e)}}"
                    >${s?"▾":"▸"}</span>`:n`<span class="caret caret--empty"></span>`}
                ${e.label}
            </div>
            ${a&&s?e.children.map(o=>this.renderNode(o,t+1)):d}`}render(){const e=this.value?this.labelOf(String(this.value),this.options)??String(this.value):"";return n`
            <div class="root">
                <button class="control" @click="${()=>this.opened?this.close():this.open()}">
                    <span class="${e?"":"placeholder"}">${e||"—"}</span>
                    <span class="chevron" aria-hidden="true">▾</span>
                </button>
                ${this.opened?n`
                    <div class="panel">
                        ${this.value?n`
                            <div class="node node--clear"
                                 @mousedown="${t=>t.preventDefault()}"
                                 @click="${this.clear}">— (clear)</div>`:d}
                        ${this.options.map(t=>this.renderNode(t,0))}
                    </div>`:d}
            </div>`}};nt.styles=R`
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
    `;Ot([v()],nt.prototype,"fieldId",2);Ot([v()],nt.prototype,"value",2);Ot([v()],nt.prototype,"options",2);Ot([v({type:Boolean})],nt.prototype,"leavesOnly",2);Ot([g()],nt.prototype,"opened",2);Ot([g()],nt.prototype,"expanded",2);nt=Ot([I("mateu-tree-select")],nt);var Ko=Object.defineProperty,Jo=Object.getOwnPropertyDescriptor,da=(e,t,a,s)=>{for(var i=s>1?void 0:s?Jo(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Ko(t,a,i),i};let Et=class extends j{constructor(){super(...arguments),this.fieldId="",this.cameraOpen=!1,this.cameraError=!1,this.fileFallback=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const s=new FileReader;s.onload=()=>this.emit(s.result),s.readAsDataURL(a),t.value=""}}disconnectedCallback(){super.disconnectedCallback(),this.stopStream()}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}stopStream(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}async openCamera(){this.cameraError=!1;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:!1}),this.cameraOpen=!0,await this.updateComplete;const e=this.renderRoot.querySelector("video");e&&(e.srcObject=this.stream,await e.play())}catch{this.stopStream(),this.cameraOpen=!1,this.cameraError=!0}}closeCamera(){this.stopStream(),this.cameraOpen=!1}shoot(){const e=this.renderRoot.querySelector("video");if(!e||e.videoWidth===0)return;const t=document.createElement("canvas");t.width=e.videoWidth,t.height=e.videoHeight,t.getContext("2d").drawImage(e,0,0),this.closeCamera(),this.emit(t.toDataURL("image/jpeg",.9))}triggerFallback(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="";return n`
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
            `}`}};Et.styles=R`
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
    `;da([v()],Et.prototype,"fieldId",2);da([v()],Et.prototype,"value",2);da([g()],Et.prototype,"cameraOpen",2);da([g()],Et.prototype,"cameraError",2);Et=da([I("mateu-camera-capture")],Et);var Yo=Object.defineProperty,Xo=Object.getOwnPropertyDescriptor,li=(e,t,a,s)=>{for(var i=s>1?void 0:s?Xo(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Yo(t,a,i),i};let wa=class extends j{constructor(){super(...arguments),this.actions=[],this.rowdata={}}createRenderRoot(){return this}handleMenuAction(e){e.stopPropagation();const t=e.detail?.key;t&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:{_clickedRow:this.rowdata}},bubbles:!0,composed:!0}))}render(){const e=this.actions??[];if(!e.length)return n`${d}`;const t=e.map(a=>({label:a.label??a.text??"",key:a.methodNameInCrud??a.actionId??a.id??a.key??a.label,disabled:a.disabled??!1}));return n`
            <oj-c-menu-button
                data-oj-binding-provider="preact"
                label="···"
                chroming="borderless"
                .items="${t}"
                @ojMenuAction="${a=>this.handleMenuAction(a)}"
            ></oj-c-menu-button>
        `}};li([v({type:Array})],wa.prototype,"actions",2);li([v({type:Object})],wa.prototype,"rowdata",2);wa=li([I("mateu-redwood-action-menu")],wa);var Qo=Object.defineProperty,Zo=Object.getOwnPropertyDescriptor,Xe=(e,t,a,s)=>{for(var i=s>1?void 0:s?Zo(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Qo(t,a,i),i};function Fa(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}let re=class extends j{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.dataProvider=void 0,this._connected=!1,this.mountTimer=null,this.lastContentRef=null,this.lastContentLen=-1}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this._connected=!0}isLinkColumn(e){return!!e.actionId&&e.stereotype!=="button"&&!["action","actionGroup","status","menu"].includes(e.dataType??"")}getOjColumns(){const e={};return this.metadata?.columns?.forEach(t=>{const a=t.metadata,s=a.stereotype==="button"||a.dataType==="action"||a.dataType==="actionGroup"||a.dataType==="status"||a.dataType==="menu"||this.isLinkColumn(a),i={headerText:a.label,field:a.id};a.resizable&&(i.resizable="enabled"),a.flexGrow!=null&&(i.weight=a.flexGrow),s&&(i.template=a.id+"Template"),e[a.id]=i}),e}getTemplateSlots(){let e="";return this.metadata?.columns?.forEach(t=>{const a=t.metadata;if(a.stereotype==="button"){const s=Fa(a.text??a.label??"View"),i=Fa(a.actionId??a.id??"");e+=`<template slot="${a.id}Template" data-oj-as="cell">`,e+="<span>",e+=`<oj-c-button
 data-mateu-row-key="[[cell.item.data._rowNumber]]" 
 data-mateu-action-id="${i}"
data-oj-binding-provider="preact" label="${s}" chroming="borderless"></oj-c-button>`,e+="</span>",e+="</template>"}else if(this.isLinkColumn(a)){const s=Fa(a.actionId??"");e+=`<template slot="${a.id}Template" data-oj-as="cell">`,e+="<span>",e+=`<oj-c-button
 data-mateu-row-key="[[cell.item.data._rowNumber]]"
 data-mateu-action-id="${s}"
data-oj-binding-provider="preact" label="[[cell.data == null ? '' : '' + cell.data]]" chroming="borderless"></oj-c-button>`,e+="</span>",e+="</template>"}else if(a.dataType==="status")e+=`<template slot="${a.id}Template" data-oj-as="cell">`,e+="<oj-c-badge",e+=` label="[[cell.data ? (cell.data.message || String(cell.data)) : '']]"`,e+=` variant="[[cell.data ? (cell.data.type === 'SUCCESS' ? 'successSubtle' : cell.data.type === 'DANGER' ? 'dangerSubtle' : cell.data.type === 'WARNING' ? 'warningSubtle' : cell.data.type === 'INFO' ? 'infoSubtle' : 'neutral') : 'neutral']]"`,e+="></oj-c-badge>",e+="</template>";else if(a.dataType==="actionGroup"||a.dataType==="menu")e+=`<template slot="${a.id}Template" data-oj-as="cell">`,e+="<oj-c-menu-button",e+=' data-oj-binding-provider="preact"',e+=' label="···"',e+=' chroming="borderless"',e+=` :items="[[cell.data && cell.data.actions ? cell.data.actions.map(function(a){return {label:a.label||a.text||'',key:(cell.item.key+'')+'|'+(a.methodNameInCrud||a.actionId||a.id||a.key||(a.label||'')),disabled:!!a.disabled};}) : []]]"`,e+="></oj-c-menu-button>",e+="</template>";else if(a.dataType==="action"){const s=a.actionId||a.id;e+=`<template slot="${a.id}Template" data-oj-as="cell">`,e+="<oj-c-menu-button",e+=' data-oj-binding-provider="preact"',e+=' label="···"',e+=' chroming="borderless"',e+=` :items="[[cell.data ? [{label:cell.data.label||cell.data.text||'${s}',key:(cell.item.key+'')+'|'+(cell.data.methodNameInCrud||'${s}'),disabled:!!cell.data.disabled}] : []]]"`,e+="></oj-c-menu-button>",e+="</template>"}}),e}refreshDataProvider(){const e=()=>{const t=this.data[this.id]?.page?.content??[];this.dataProvider=new re._ADP(t,{keyAttributes:"@index"}),this.scheduleMount()};re._ADP?e():require(["ojs/ojarraydataprovider"],t=>{re._ADP=t.default??t,this.isConnected&&e()})}scheduleMount(){this.mountTimer&&clearTimeout(this.mountTimer),this.mountTimer=setTimeout(()=>{this.mountTimer=null,this.mountTable()},60)}mountTable(){const e=this.querySelector(".rwt-table-host");if(!e)return;const t=document.createElement("oj-c-table");t.setAttribute("data-oj-binding-provider","preact"),t.setAttribute("aria-label","Data table"),t.setAttribute("layout","contents"),t.style.width="100%";const a=this.getTemplateSlots();if(a){const s=document.createElement("div");s.innerHTML=a,Array.from(s.childNodes).forEach(i=>t.appendChild(i))}t.columns=this.getOjColumns(),t.selectionMode=this.metadata?.rowsSelectionEnabled?{row:"multiple"}:{row:"none"},t.addEventListener("ojRowAction",s=>this.handleRowAction(s)),t.addEventListener("ojAction",s=>this.handleCellButtonAction(s)),t.addEventListener("selectedChanged",s=>this.handleSelectedChanged(s)),t.addEventListener("ojMenuAction",s=>this.handleMenuAction(s)),t.data=this.dataProvider,e.replaceChildren(t)}updated(e){super.updated(e),e.has("metadata")&&(this.lastContentRef=!1);const t=this.data?.[this.id]?.page?.content,a=Array.isArray(t)?t.length:0;(t!==this.lastContentRef||a!==this.lastContentLen)&&(this.lastContentRef=t,this.lastContentLen=a,this.refreshDataProvider())}handleRowAction(e){console.log("handleRowAction",e);const t=e.detail?.context?.item?.data;if(!t)return;const a=this.metadata?.columns?.find(s=>{const i=s.metadata;return i.stereotype==="button"&&i.actionId});if(a){const s=a.metadata;this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId,parameters:t},bubbles:!0,composed:!0}))}}handleCellButtonAction(e){console.log("handleCellButtonAction",e);const t=e.composedPath();let a=null,s=null;for(const o of t){const l=o;if(console.log("el",l),l.getAttribute("data-mateu-row-key")){const c=l.getAttribute("data-mateu-row-key");if(console.log("k",c),c!==null){a=c,s=l.getAttribute("data-mateu-action-id");break}}}if(a===null)return;const i=this.data[this.id]?.page?.content??[],r=i.find((o,l)=>o._rowNumber==a)??{};console.log("rowData",a,i,r),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s??"",parameters:r},bubbles:!0,composed:!0}))}handleMenuAction(e){console.log("handleMenuAction",e);const t=e.detail?.key;if(!t)return;const a=t.indexOf("|");if(a<0)return;const s=parseInt(t.substring(0,a)),i=t.substring(a+1),o=(this.data[this.id]?.page?.content??[])[s]??{};this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i,parameters:o},bubbles:!0,composed:!0}))}handleSelectedChanged(e){console.log("handleSelectedChanged",e);const t=e.detail.value?.row;if(!t)return;const a=this.data[this.id]?.page?.content??[],s=t.isAddAll()?a:a.filter((i,r)=>t.has(r));this.state.crud_selected_items=s}render(){return this._connected?n`
            <div class="rwt-table-host" style="width: 100%;"></div>
            <slot></slot>
        `:n``}};re._ADP=null;Xe([v()],re.prototype,"id",2);Xe([v()],re.prototype,"metadata",2);Xe([v()],re.prototype,"baseUrl",2);Xe([v()],re.prototype,"state",2);Xe([v()],re.prototype,"data",2);Xe([v()],re.prototype,"appState",2);Xe([v()],re.prototype,"appData",2);Xe([v()],re.prototype,"emptyStateMessage",2);Xe([g()],re.prototype,"_connected",2);re=Xe([I("mateu-redwood-table")],re);const Ta="var(--oj-core-text-color-secondary, #666)",es="var(--oj-core-divider-color, #e0e0e0)",en=`text-align: left; padding: 0.5rem 0.75rem; border-bottom: 2px solid ${es}; color: ${Ta}; font-size: 0.8125rem; font-weight: 600; white-space: nowrap;`,Ei=`padding: 0.5rem 0.75rem; border-bottom: 1px solid ${es};`,tn=e=>{const t=(e??"").toUpperCase();return t==="SUCCESS"?"successSubtle":t==="DANGER"||t==="ERROR"?"dangerSubtle":t==="WARNING"?"warningSubtle":t==="INFO"?"infoSubtle":"neutral"},an=(e,t,a)=>{e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:a},bubbles:!0,composed:!0}))},sn=(e,t)=>{const a=e[t.id];if(t.stereotype==="button"||t.dataType==="action"){const s=a?.label??a?.text??t.text??t.label??"View",i=a?.methodNameInCrud??t.actionId??t.id;return n`<oj-c-button
            data-oj-binding-provider="preact"
            label="${s}"
            chroming="borderless"
            @ojAction="${r=>an(r.target,i,e)}"
        ></oj-c-button>`}return t.dataType==="status"?a==null?n``:n`<oj-c-badge
            data-oj-binding-provider="preact"
            label="${a.message??""+a}"
            variant="${tn(a.type)}"
        ></oj-c-badge>`:t.dataType==="bool"||t.dataType==="boolean"?n`<span aria-label="${a?"yes":"no"}">${a?"✓":"✕"}</span>`:n`${a??""}`},ts=e=>{const t=[];return e?.forEach(a=>{const s=a.metadata;s?.type===m.GridGroupColumn?t.push(...ts(s.columns??s.content??a.children)):s&&t.push({...s,id:s.id??a.id})}),t},as=(e,t,a=!1,s)=>{const i=(r,o)=>{const l=n`
            <tr style="${s?"cursor: pointer;":""}" @click="${s?u=>s(u,r):d}">
                ${e.map((u,h)=>n`
                    <td style="${Ei} ${h===0&&a?`padding-left: ${.75+o*1.25}rem;`:""} ${u.align?`text-align: ${u.align};`:""}">
                        ${sn(r,u)}
                    </td>`)}
            </tr>`,c=a?r.children??[]:[];return[l,...c.flatMap(u=>i(u,o+1))]};return n`
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>${e.map(r=>n`<th style="${en} ${r.align?`text-align: ${r.align};`:""}" width="${r.width??d}">${r.label??""}</th>`)}</tr>
            </thead>
            <tbody>
                ${t.length===0?n`<tr><td colspan="${e.length}" style="${Ei} color: ${Ta}; text-align: center;">No data.</td></tr>`:t.flatMap(r=>i(r,0))}
            </tbody>
        </table>`},rn=(e,t)=>{const a=e.metadata,s=ts(a.content);let i=a.page?.content??[];return e.id&&t&&Array.isArray(t[e.id])&&(i=t[e.id]),n`
        <div style="width: 100%; overflow-x: auto; ${e.style??""}" class="${e.cssClasses??d}"
             slot="${e.slot??d}">
            ${as(s,i,a.tree)}
        </div>`},on=(e,t,a,s,i,r,o)=>n`
    <mateu-redwood-table
        id="${t.id}"
        .metadata="${t.metadata}"
        .data="${i}"
        .state="${s}"
        .appState="${r}"
        .appData="${o}"
        baseUrl="${a??""}"
        style="${t.style??d}"
        class="${t.cssClasses??d}"
        slot="${t.slot??d}"
    >
        ${t.children?.map(l=>$(e,l,a,s,i,r,o))}
    </mateu-redwood-table>`,nn=(e,t,a,s,i,r,o)=>{const c=t.metadata.page?.content??[];return n`
        <div style="overflow-y: auto; ${t.style??""}" class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${c.map(u=>$(e,u,a,s,i,r,o))}
        </div>`},ln=e=>{const t=s=>s.submenus?n`
            <div style="min-width: 12rem;">
                <div class="oj-typography-subheading-sm" style="margin-bottom: 0.5rem;">${s.label??""}</div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${s.submenus.map(i=>t(i))}
                </div>
            </div>`:n`<a class="oj-link-standalone" href="${s.path??d}">${s.label}</a>`,a=e.metadata;return n`
        <div style="display: flex; gap: 3rem; align-items: flex-start; flex-wrap: wrap; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${a.menu.map(s=>t(s))}
        </div>`},dn=(e,t,a,s,i,r,o)=>{const l=t.metadata;return n`
        <div style="${t.style??d}" class="${t.cssClasses??d}"
             slot="${t.slot??d}" data-colspan="${l.colspan||d}">
            ${l.label?n`<div style="font-size: 0.75rem; color: ${Ta}; margin-bottom: 4px;">${l.label}</div>`:d}
            <div>${$(e,l.content,a,s,i,r,o)}</div>
        </div>`},cn=e=>{const t=e.state?.items??e.metadata?.items??[];return n`
        <div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 0.5rem; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${t.map(a=>n`
                <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                    <oj-c-avatar data-oj-binding-provider="preact" size="xs"
                                 initials="${(a.userName??"?").split(/\s+/).map(s=>s[0]).slice(0,2).join("")}"></oj-c-avatar>
                    <div>
                        ${a.userName?n`<div style="font-size: 0.75rem; color: ${Ta};">${a.userName}</div>`:d}
                        <div>${a.text}</div>
                    </div>
                </div>
            `)}
        </div>`},un=e=>{const t=a=>{const i=a.target.closest(".rw-message-input")?.querySelector("oj-c-input-text"),r=i?.rawValue??i?.value??"";r&&(a.target.dispatchEvent(new CustomEvent("submit",{detail:{value:r},bubbles:!0,composed:!0})),i&&(i.value=""))};return n`
        <div class="rw-message-input ${e.cssClasses??""}"
             style="display: flex; gap: 0.5rem; align-items: center; ${e.style??""}"
             slot="${e.slot??d}">
            <oj-c-input-text data-oj-binding-provider="preact" label-edge="none" placeholder="Message" style="flex: 1;"
                             @keydown="${a=>{a.key==="Enter"&&t(a)}}"></oj-c-input-text>
            <oj-c-button data-oj-binding-provider="preact" label="Send" chroming="callToAction" @ojAction="${t}"></oj-c-button>
        </div>`},Dt="var(--oj-core-text-color-secondary, #666)",di="var(--oj-core-divider-color, #e0e0e0)",ci="var(--oj-core-bg-color-content, #fff)",is="var(--oj-core-border-radius-md, 6px)",Vt=e=>"oj-ux-ico-"+(e??"").replace(/^vaadin:/,"").replace(/^lumo:/,""),hn=e=>{const t=e.metadata;return n`<span class="${Vt(t?.icon)} ${e.cssClasses??""}"
                      style="font-size: 1.25rem; ${e.style??""}"
                      slot="${e.slot??d}"
                      aria-label="${t?.icon??d}"></span>`},pn=e=>{const t=e.metadata,a=t?.breadcrumbs??[];return n`
        <nav aria-label="Breadcrumb"
             style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${a.map((s,i)=>n`
                ${i>0?n`<span style="color: ${Dt};">/</span>`:d}
                ${s.link?n`<a class="oj-link-standalone" href="${s.link}">${s.text}</a>`:n`<span>${s.text}</span>`}
            `)}
            ${t?.currentItemText?n`
                ${a.length>0?n`<span style="color: ${Dt};">/</span>`:d}
                <span style="color: ${Dt};">${t.currentItemText}</span>
            `:d}
        </nav>`},mn=e=>{const t=e.metadata;return n`
        <div role="status"
             style="display: flex; gap: 0.5rem; align-items: baseline; padding: 0.75rem 1rem; border: 1px solid ${di}; border-left: 4px solid var(--oj-core-info-color, #0572ce); border-radius: ${is}; background: ${ci}; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${t?.title?n`<span class="oj-typography-body-md oj-typography-bold">${t.title}</span>`:d}
            <span class="oj-typography-body-md">${t?.text??""}</span>
        </div>`},vn=(e,t={})=>{const a=e.metadata,s=a.valueKey?t[a.valueKey]:a.value;return n`
        <div style="${e.style??""}" class="${e.cssClasses??d}" slot="${e.slot??d}">
            <oj-c-progress-bar
                data-oj-binding-provider="preact"
                value="${a.indeterminate?-1:s??0}"
                max="${a.max&&a.max!=0?a.max:100}"
                style="width: 100%;"
            ></oj-c-progress-bar>
            ${a.text?n`<div style="font-size: 0.75rem; color: ${Dt}; margin-top: 2px;">${a.text}</div>`:d}
        </div>`},fn=(e,t,a,s,i,r,o)=>{const l=t.metadata;return n`
        <oj-c-collapsible data-oj-binding-provider="preact"
                 ?expanded="${l.opened}"
                 class="${t.cssClasses??d}"
                 style="${t.style??d}"
                 slot="${t.slot??d}">
            <div slot="header" class="oj-typography-subheading-sm">
                ${$(e,l.summary,a,s,i,r,o)}
            </div>
            <div style="padding-top: 0.5rem;">
                ${$(e,l.content,a,s,i,r,o)}
                ${t.children?.map(c=>$(e,c,a,s,i,r,o))}
            </div>
        </oj-c-collapsible>`},ss=e=>e.abbreviation||(e.name?e.name.split(/\s+/).map(t=>t[0]).slice(0,2).join(""):""),bn=(e,t,a)=>{const s=e.metadata;return n`<oj-c-avatar
            data-oj-binding-provider="preact"
            initials="${ss(s)||d}"
            src="${s.image??d}"
            role="img"
            aria-label="${Ee(s.name,t,a)??d}"
            title="${Ee(s.name,t,a)??d}"
            style="${e.style??d}" class="${e.cssClasses??d}"
            slot="${e.slot??d}"
    ></oj-c-avatar>`},gn=e=>{const t=e.metadata,a=t.avatars??[],s=t.maxItemsVisible||a.length,i=a.slice(0,s),r=a.length-i.length;return n`
        <div style="display: flex; align-items: center; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${i.map((o,l)=>n`
                <oj-c-avatar
                    data-oj-binding-provider="preact"
                    size="sm"
                    initials="${ss(o)||d}"
                    src="${o.image??d}"
                    title="${o.name??d}"
                    style="${l>0?"margin-left: -0.5rem;":""} border: 2px solid ${ci}; border-radius: 50%;"
                ></oj-c-avatar>
            `)}
            ${r>0?n`<span style="margin-left: 0.4rem; font-size: 0.8125rem; color: ${Dt};">+${r}</span>`:d}
        </div>`},$n=(e,t,a,s,i,r,o)=>{const l=t.metadata;return n`
        <span title="${l.text??""}" style="${t.style??d}"
              class="${t.cssClasses??d}" slot="${t.slot??d}">
            ${l.wrapped?$(e,l.wrapped,a,s,i,r,o):d}
        </span>`},Ka=e=>{const a=e?.closest(".rw-pop-wrap")?.querySelector(":scope > .rw-pop-panel");a&&(a.hidden=!a.hidden)},rs=`position: absolute; top: 100%; left: 0; margin-top: 4px; z-index: 1000; background: ${ci}; border: 1px solid ${di}; border-radius: ${is}; box-shadow: 0 4px 12px rgba(0,0,0,.15); min-width: 10rem;`,yn=(e,t,a,s,i,r,o)=>{const l=t.metadata;return n`
        <span class="rw-pop-wrap ${t.cssClasses??""}"
              style="position: relative; display: inline-block; ${t.style??""}"
              slot="${t.slot??d}">
            <span style="cursor: pointer;" @click="${c=>Ka(c.currentTarget)}">
                ${l.wrapped?$(e,l.wrapped,a,s,i,r,o):d}
            </span>
            <div class="rw-pop-panel" hidden style="${rs} padding: 0.75rem;">
                ${l.content?$(e,l.content,a,s,i,r,o):d}
            </div>
        </span>`},Ja=(e,t)=>{t&&e?.dispatchEvent(new CustomEvent("update-route",{detail:{route:t},bubbles:!0,composed:!0}))},xn=(e,t)=>{const s=t.metadata.options??[],i=r=>{if(r.submenus&&r.submenus.length>0){const o=r.submenus.map(l=>({key:l.path??l.label,label:l.label,disabled:l.disabled??!1}));return n`
                <oj-c-menu-button
                    data-oj-binding-provider="preact"
                    label="${r.label}"
                    chroming="borderless"
                    .items="${o}"
                    @ojMenuAction="${l=>Ja(e,l.detail.key)}"
                ></oj-c-menu-button>`}return n`
            <oj-c-button
                data-oj-binding-provider="preact"
                label="${r.label}"
                chroming="borderless"
                ?disabled="${r.disabled}"
                @ojAction="${o=>Ja(o.target,r.path)}"
            ></oj-c-button>`};return n`
        <div style="display: flex; flex-direction: row; gap: 0.25rem; align-items: center; ${t.style??""}"
             class="${t.cssClasses??d}" slot="${t.slot??d}">
            ${s.map(i)}
        </div>`},wn=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=p=>{p.preventDefault(),Ka(p.currentTarget)},u=(p,f)=>{Ka(p.currentTarget),Ja(p.target,f.path)},h=(p,f=0)=>n`
        ${p.map(y=>y.separator?n`<div style="border-top: 1px solid ${di}; margin: 0.25rem 0;"></div>`:n`
                <div role="menuitem"
                     style="padding: 0.4rem 1rem 0.4rem ${1+f*1.25}rem; cursor: ${y.disabled?"default":"pointer"}; ${y.disabled?`color: ${Dt}; opacity: 0.6;`:""} white-space: nowrap;"
                     @click="${y.disabled?d:w=>u(w,y)}">
                    ${y.icon?n`<span class="${Vt(y.icon)}" style="margin-right: 0.4rem;"></span>`:d}
                    ${y.label}
                </div>
                ${y.submenus?h(y.submenus,f+1):d}`)}
    `;return n`
        <span class="rw-pop-wrap ${t.cssClasses??""}"
              style="position: relative; display: inline-block; ${t.style??""}"
              slot="${t.slot??d}"
              @contextmenu="${l.activateOnLeftClick?d:c}"
              @click="${l.activateOnLeftClick?c:d}">
            ${$(e,l.wrapped,a,s,i,r,o)}
            <div class="rw-pop-panel" hidden role="menu" style="${rs} padding: 0.25rem 0;">
                ${h(l.menu??[])}
            </div>
        </span>`},Ht="var(--oj-core-text-color-secondary, #666)",sa="var(--oj-core-divider-color, #e0e0e0)",st=`display:block;font-size:0.75rem;color:${Ht};margin-bottom:4px;`,os=e=>{const t=window.require;if(!t)return null;try{const a=t("ojs/ojarraydataprovider");return new a(e,{keyAttributes:"value"})}catch{return null}},N=(e,t,a)=>{e.target?.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:t},bubbles:!0,composed:!0}))},ca=(e,t,a)=>{e?.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:t},bubbles:!0,composed:!0}))},Ya=(e,t,a)=>{e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:a},bubbles:!0,composed:!0}))},V=(e,t,a="")=>n`
    <div style="${a}">
        ${e?n`<div style="${st}">${e}</div>`:d}
        ${t}
    </div>`,kn=(e,t)=>{const a=typeof e=="number"?e:parseFloat(""+e);return isNaN(a)?""+e:t&&t.locale&&t.currency?new Intl.NumberFormat(t.locale,{style:"currency",currency:t.currency}).format(a):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(a)},Ii=new WeakMap,ns=(e,t,a,s,i)=>{const r=i?.[a]??i?.[s],o=r?.content??(Array.isArray(r)?r:void 0);if(o)return o;const l=t.remoteCoordinates?.action;if(l){let c=Ii.get(e);c||(c=new Set,Ii.set(e,c)),c.has(s)||(c.add(s),setTimeout(()=>Ya(e,l,{searchText:"",fieldId:s,size:200,page:0,sort:void 0})))}return[]},it=(e,t,a,s,i)=>t.remoteCoordinates?ns(e,t,a,s,i):t.options??[],qa=(e,t,a,s,i)=>{const r=os(i.map(o=>({value:o.value,label:o.label??""})));return n`<oj-c-select-single
        data-oj-binding-provider="preact"
        id="${t}"
        label-hint="${a}"
        label-edge="top"
        .value="${s??null}"
        item-text="label"
        .data="${r}"
        ?required="${e.required}"
        ?disabled="${e.disabled}"
        @valueChanged="${o=>N(o,t,o.detail.value)}"
    ></oj-c-select-single>`},Cn=(e,t,a,s,i)=>{const r=os(i.map(o=>({value:o.value,label:o.label??""})));return n`<oj-c-select-multiple
        data-oj-binding-provider="preact"
        id="${t}"
        label-hint="${a}"
        label-edge="top"
        .value="${s??[]}"
        item-text="label"
        .data="${r}"
        ?required="${e.required}"
        ?disabled="${e.disabled}"
        @valueChanged="${o=>N(o,t,o.detail.value)}"
    ></oj-c-select-multiple>`},_i=(e,t,a,s)=>{const i=o=>s?Array.isArray(t)&&t.includes(o.value):t===o.value,r=o=>{if(!s)return o.value;const l=Array.isArray(t)?t:[];return l.includes(o.value)?l.filter(c=>c!==o.value):[...l,o.value]};return n`
        <div role="listbox" aria-multiselectable="${s}"
             style="border: 1px solid ${sa}; border-radius: var(--oj-core-border-radius-md, 6px); max-height: 14rem; overflow-y: auto;">
            ${a.map(o=>{const l=i(o);return n`
                    <div role="option" aria-selected="${l}" tabindex="0"
                         style="padding: 0.4rem 0.75rem; cursor: ${e.disabled?"default":"pointer"}; display: flex; align-items: center; gap: 0.5rem; ${l?"background: var(--oj-core-bg-color-selected, #e5f0fa); font-weight: 600;":""}"
                         @click="${e.disabled?d:c=>ca(c.target,e.fieldId,r(o))}">
                        ${o.icon?n`<span class="${Vt(o.icon)}"></span>`:d}
                        <span style="pointer-events: none;">
                            <span>${o.label}</span>
                            ${o.description?n`<span style="display: block; font-size: 0.8125rem; color: ${Ht};">${o.description}</span>`:d}
                        </span>
                    </div>`})}
        </div>`},Ma=(e,t,a,s)=>n`
    <div style="display: flex; gap: 0.75rem; padding: 0.25rem 0; flex-wrap: wrap;">
        ${a.map(i=>{const r=s?Array.isArray(t)&&t.includes(i.value):t==i.value,o=()=>{if(!s)return i.value;const l=Array.isArray(t)?t:[];return l.includes(i.value)?l.filter(c=>c!==i.value):[...l,i.value]};return n`
                <div role="button" tabindex="0"
                     style="min-width: 10rem; min-height: 3rem; padding: 0.75rem 1rem; cursor: pointer; border-radius: var(--oj-core-border-radius-lg, 8px); border: 1px solid ${r?"var(--oj-core-info-color, #0572ce)":sa}; background: ${r?"var(--oj-core-bg-color-selected, #e5f0fa)":"transparent"};"
                     @click="${l=>ca(l.target,e.fieldId,o())}">
                    <div style="display: flex; align-items: center; gap: 0.5rem; pointer-events: none;">
                        ${i.icon?n`<span class="${Vt(i.icon)}"></span>`:d}
                        ${i.image?n`<img src="${i.image}" alt="${i.label}" style="${i.imageStyle??"width: 2rem;"}" />`:d}
                        <div>
                            <div>${i.label}</div>
                            ${i.description?n`
                                <div style="font-size: 0.8125rem; color: ${Ht};">${i.description}</div>
                            `:d}
                        </div>
                    </div>
                </div>`})}
    </div>`,Sn=(e,t,a)=>{let s=typeof e=="number"?e:parseInt(""+e,10);return isNaN(s)&&(s=0),n`<oj-c-rating-gauge
        data-oj-binding-provider="preact"
        .value="${s}"
        max="5"
        step="1"
        size="md"
        ?readonly="${a}"
        @valueChanged="${i=>ca(i.target,t,i.detail.value)}"
    ></oj-c-rating-gauge>`},En=e=>t=>{const a=t.target,s=a.files?.[0];if(!s)return;const i=new FileReader;i.onload=()=>ca(a,e,i.result),i.readAsDataURL(s),a.value=""},In=e=>t=>{t.target.getRootNode().querySelector(`#${CSS.escape(e)}`)?.click()},_n=(e,t,a)=>{const s=a!=null&&a!=="",i=`${t}_file`;return n`
        <div style="display: flex; flex-direction: column; align-items: stretch; gap: 0.5rem; max-width: 320px;">
            ${s?n`
                <img src="${a}"
                     style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid ${sa}; border-radius: var(--oj-core-border-radius-lg, 8px); ${e.style??""}">
            `:n`
                <div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed ${sa}; border-radius: var(--oj-core-border-radius-lg, 8px); color: ${Ht};">
                    <span class="oj-ux-ico-image" style="font-size: 2rem;"></span>
                </div>
            `}
            <input type="file" id="${i}" accept="image/*" style="display: none;" @change="${En(e.fieldId)}">
            <div style="display: flex; gap: 0.5rem;">
                <oj-c-button data-oj-binding-provider="preact" label="${s?"Replace":"Upload"}" chroming="outlined"
                             @ojAction="${In(i)}"></oj-c-button>
                ${s?n`
                    <oj-c-button data-oj-binding-provider="preact" label="Delete" chroming="borderless"
                                 @ojAction="${r=>ca(r.target,e.fieldId,"")}"></oj-c-button>`:d}
            </div>
        </div>`},Tn=(e,t,a)=>{const s=t===!0||t==="true";return n`
        <div style="${e.style??d}">
            <oj-c-badge data-oj-binding-provider="preact"
                        variant="${s?"success":"neutral"}"
                        style="${s?"":"opacity: 0.4;"}">${a}</oj-c-badge>
        </div>`},Rn=(e,t,a,s,i)=>{let r=Ee(t,s,i);const o=r&&typeof r=="object"&&"value"in r?r:null;r&&r.value&&(r=r.value);const l=e.dataType=="bool"||r===!0||r===!1,c=e.dataType=="money",u=r!=null&&r!=="";let h=u?""+r:"—";c&&u&&(h=kn(r,o));const p=l?n`<span>${r===!0||r==="true"?"✓":"—"}</span>`:e.multiline?n`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${h}</span>`:n`<span style="display: block; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${c?" font-variant-numeric: tabular-nums;":""}">${h}</span>`;return V(a,p,c?"text-align: right; ":"")},Pn=(e,t,a,s,i)=>{let r=Ee(t,s,i)||i?.[e.fieldId];if(r&&r.value&&(r=r.value),e.stereotype=="image"||e.stereotype=="uploadableImage"||e.stereotype=="signature"||e.stereotype=="camera")return V(a,n`<img src="${r}" style="${e.style??d}">`);if(e.dataType=="bool")return V(a,n`<span>${r?"✓":"—"}</span>`);if(e.stereotype=="link")return V(a,n`<a class="oj-link-standalone" href="${r??""}" target="_blank">${r??""}</a>`);if(e.stereotype=="color")return V(a,n`<span style="background-color: ${r}; display: block; height: 20px; width: 40px; border: 1px solid ${Ht}; border-radius: 4px;"></span>`);const o=r!=null&&r!=="";return V(a,n`<span style="display: block; font-weight: 500; overflow: hidden; text-overflow: ellipsis;">${o?r:"—"}</span>`)},On=Z`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,jn=Z`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,ls=(e,t,a)=>{const s=e.link,i=ge(s.href,t,a)??s.href,r=ge(s.title,t,a)||i;return{href:i,title:r}},Ln=e=>{const t=e;if(!t||t.__navlinkPositioned)return;t.__navlinkPositioned=!0;const a=()=>{const r=t.parentElement,o=r?.firstElementChild?.querySelector("input, textarea, select");if(!r||!o)return;const l=o.getBoundingClientRect();l.height!==0&&(t.style.marginTop=`${Math.max(0,Math.round(l.top+l.height/2-t.offsetHeight/2-r.getBoundingClientRect().top))}px`)};let s=0;const i=()=>{a(),s++<32&&setTimeout(i,250)};setTimeout(i),document.fonts?.ready.then(()=>setTimeout(a))},An=(e,t,a)=>{const s=e.link,{href:i,title:r}=ls(e,t,a),o=s.icon?n`<span class="${Vt(s.icon)}" style="font-size: 1.125rem;"></span>`:i.startsWith("http")?On:jn;return n`<a data-navlink
        href="${i}"
        title="${r}"
        target="${s.target||d}"
        ${ys(Ln)}
        style="display: flex; align-items: center; color: ${Ht}; align-self: flex-start; margin-top: 1.9rem;"
    >${o}</a>`},Dn=(e,t,a)=>s=>{const i=s.composedPath()[0]?.value;if(i==null)return;const o=s.currentTarget.querySelector("a[data-navlink]");if(!o)return;const{href:l,title:c}=ls(e,{...t,[e.fieldId]:i},a);o.setAttribute("href",l),o.setAttribute("title",c)},zn=(e,t,a,s,i)=>{const r=t.metadata,o=Nn(e,t,a,s,i);return r?.link?.href?n`<div style="display: flex; gap: 0.5rem;" @input="${Dn(r,s,i)}">
        <div style="flex: 1; min-width: 0;">${o}</div>
        ${An(r,s,i)}
    </div>`:o},Nn=(e,t,a,s,i)=>{const r=t.metadata,o=r?.fieldId??"",l=s&&o in s?s[o]:r?.initialValue,c=r.label??"",u=t.id??o,h=r.stereotype;if(h==="badge")return Tn(t,l,c||o);if(h==="plainText")return Rn(r,l,c,s,i);if(r.readOnly&&h!="grid"&&r.dataType!="status"&&r.dataType!="money")return Pn(r,l,c,s,i);if(h==="grid"&&r.columns&&r.columns.length>0){const p=Array.isArray(l)?l:[],f=r.columns.map(x=>({...x.metadata,id:x.metadata.id??x.id})),y=r.onItemSelectionActionId;return V(c,n`<div style="overflow-x: auto;">${as(f,p,!1,y?(x,_)=>x.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:y,parameters:{_clickedRow:_}},bubbles:!0,composed:!0})):void 0)}</div>`)}if(r.dataType==="string"){if(h==="searchable"){const p=y=>Ya(y.target,"code-"+o,{code:y.detail?.value??y.target?.value??""}),f=y=>Ya(y.target,"codesearch-"+o,{});return V(c,n`
                <div style="display: flex; gap: 0.33rem; align-items: center;">
                    <oj-c-input-text data-oj-binding-provider="preact" label-edge="none" style="width: 6rem;"
                                     .value="${l??""}" @valueChanged="${p}"></oj-c-input-text>
                    <oj-c-input-text data-oj-binding-provider="preact" label-edge="none" readonly style="flex: 1;"
                                     .value="${i?.[o+"-label"]??""}"></oj-c-input-text>
                    <oj-c-button data-oj-binding-provider="preact" label="Search" chroming="outlined" @ojAction="${f}"></oj-c-button>
                </div>`)}if(h==="textarea")return n`<oj-c-text-area
                data-oj-binding-provider="preact"
                id="${u}"
                label-hint="${c}"
                label-edge="top"
                .value="${l??""}"
                ?required="${r.required}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                @valueChanged="${p=>N(p,u,p.detail.value)}"
            ></oj-c-text-area>`;if(h==="richText"||h==="richtext")return n`<oj-c-text-area
                data-oj-binding-provider="preact"
                id="${u}"
                label-hint="${c}"
                label-edge="top"
                rows="6"
                .value="${l??""}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                @valueChanged="${p=>N(p,u,p.detail.value)}"
            ></oj-c-text-area>`;if(h==="markdown")return V(c,n`<mateu-markdown .content="${l??""}"></mateu-markdown>`);if(h==="password")return n`<oj-c-input-password
                data-oj-binding-provider="preact"
                id="${u}"
                label-hint="${c}"
                label-edge="top"
                .value="${l??""}"
                ?required="${r.required}"
                ?disabled="${r.disabled}"
                @valueChanged="${p=>N(p,u,p.detail.value)}"
            ></oj-c-input-password>`;if(h==="select"||h==="combobox"){const p=l&&l.value?l.value:l;return qa(r,u,c,p,it(e,r,u,o,i))}if(h==="listBox")return V(c,_i(r,l,it(e,r,u,o,i),!1));if(h==="choice")return V(c,Ma(r,l,it(e,r,u,o,i),!1));if(h==="popover"){const p=it(e,r,u,o,i),f=p.find(w=>w.value===l)?.label??l??"";return V(c,n`
                <span class="rw-pop-wrap" style="position: relative; display: inline-block;">
                    <span style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;" @click="${w=>{const _=w.currentTarget.closest(".rw-pop-wrap")?.querySelector(":scope > .rw-pop-panel");_&&(_.hidden=!_.hidden)}}">
                        <span>${f}</span>
                        <span class="oj-ux-ico-chevron-down"></span>
                    </span>
                    <div class="rw-pop-panel" hidden
                         style="position: absolute; top: 100%; left: 0; margin-top: 4px; z-index: 1000; background: var(--oj-core-bg-color-content, #fff); border: 1px solid ${sa}; border-radius: var(--oj-core-border-radius-md, 6px); box-shadow: 0 4px 12px rgba(0,0,0,.15); padding: 0.5rem;">
                        ${Ma(r,l,p,!1)}
                    </div>
                </span>`)}if(h==="radio"){const p=it(e,r,u,o,i).map(f=>({value:f.value,label:f.label??""}));return n`<oj-c-radioset
                data-oj-binding-provider="preact"
                id="${u}"
                label-hint="${c}"
                label-edge="top"
                .value="${l??null}"
                .options="${p}"
                ?required="${r.required}"
                ?disabled="${r.disabled}"
                @valueChanged="${f=>N(f,u,f.detail.value)}"
            ></oj-c-radioset>`}return h==="html"?n`<div id="${u}">${ne(""+(l??""))}</div>`:h==="image"?n`<figure style="margin: 0;">
                <figcaption style="${st}">${c}</figcaption>
                <img src="${l}" alt="${c}" style="${r.style??""}" />
            </figure>`:h==="uploadableImage"?V(c,_n(r,u,l)):h==="treeSelect"?V(c,n`<mateu-tree-select
                .fieldId="${u}" .value="${l}"
                .options="${r.options??[]}"
                .leavesOnly="${r.treeLeavesOnly??!1}"></mateu-tree-select>`):h==="signature"?V(c,n`<mateu-signature-pad .fieldId="${u}" .value="${l}"></mateu-signature-pad>`):h==="camera"?V(c,n`<mateu-camera-capture .fieldId="${u}" .value="${l}"></mateu-camera-capture>`):h==="icon"?V(c,n`
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <oj-c-input-text data-oj-binding-provider="preact" label-edge="none" style="flex: 1;"
                                     .value="${l??""}"
                                     ?disabled="${r.disabled}"
                                     @valueChanged="${p=>N(p,u,p.detail.value)}"
                    ></oj-c-input-text>
                    ${l?n`<span class="${Vt(l)}" style="font-size: 1.25rem;"></span>`:d}
                </div>`):h==="color"?n`<div>
                <label for="${u}" style="${st}">${c}</label>
                <input id="${u}" type="color" .value="${l??"#000000"}" ?disabled="${r.disabled}"
                    @input="${p=>N(p,u,p.target.value)}" />
            </div>`:h==="link"?n`<div>
                <div style="${st}">${c}</div>
                <a class="oj-link-standalone" href="${l}" target="_blank">${l}</a>
            </div>`:r.options&&r.options.length>0?qa(r,u,c,l,r.options):r.remoteCoordinates?qa(r,u,c,l,ns(e,r,u,o,i)):n`<oj-c-input-text
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${l??""}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            ?readonly="${r.readOnly}"
            placeholder="${r.placeholder??d}"
            @valueChanged="${p=>N(p,u,p.detail.value)}"
        ></oj-c-input-text>`}if(r.dataType==="number")return n`<oj-c-input-number
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${l??null}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${p=>N(p,u,p.detail.value)}"
        ></oj-c-input-number>`;if(r.dataType==="integer")return h==="stars"?V(c,Sn(l,o,r.disabled)):h==="slider"?n`<div>
                <label for="${u}" style="${st}">${c}</label>
                <input id="${u}" type="range"
                    min="${r.sliderMin??0}"
                    max="${r.sliderMax??10}"
                    .value="${""+(l??0)}"
                    @input="${p=>N(p,u,parseInt(p.target.value))}" />
            </div>`:n`<oj-c-input-number
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${l??null}"
            step="1"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${p=>N(p,u,p.detail.value)}"
        ></oj-c-input-number>`;if(r.dataType==="bool")return h==="toggle"?n`<div>
                <div style="${st}">${c}</div>
                <oj-c-toggle-button
                    data-oj-binding-provider="preact"
                    id="${u}"
                    label="${c}"
                    .value="${!!l}"
                    ?disabled="${r.disabled}"
                    @valueChanged="${p=>N(p,u,p.detail.value)}"
                ></oj-c-toggle-button>
            </div>`:n`<oj-c-checkbox
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            .value="${!!l}"
            ?disabled="${r.disabled}"
            @valueChanged="${p=>N(p,u,p.detail.value)}"
        >${c}</oj-c-checkbox>`;if(r.dataType==="date")return n`<oj-c-input-date-picker
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${l??null}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${p=>N(p,u,p.detail.value)}"
        ></oj-c-input-date-picker>`;if(r.dataType==="dateTime"){const p=l,f=p?p.split("T")[0]:null,y=p?p.split("T")[1]?.substring(0,5):null;return n`<div style="display:flex;gap:0.5rem;align-items:flex-end;">
            <oj-c-input-date-picker
                data-oj-binding-provider="preact"
                id="${u}_date"
                label-hint="${c}"
                label-edge="top"
                .value="${f}"
                ?required="${r.required}"
                ?disabled="${r.disabled}"
                @valueChanged="${w=>N(w,u,w.detail.value+"T"+(y??"00:00"))}"
            ></oj-c-input-date-picker>
            <oj-c-input-time-mask
                data-oj-binding-provider="preact"
                id="${u}_time"
                label-hint="Time"
                label-edge="top"
                .value="${y}"
                ?disabled="${r.disabled}"
                @valueChanged="${w=>N(w,u,(f??"")+"T"+w.detail.value)}"
            ></oj-c-input-time-mask>
        </div>`}if(r.dataType==="time")return n`<oj-c-input-time-mask
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${l??null}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${p=>N(p,u,p.detail.value)}"
        ></oj-c-input-time-mask>`;if(r.dataType==="dateRange"){const p=l;return n`<div style="display:flex;gap:0.5rem;align-items:flex-end;">
            <oj-c-input-date-picker
                data-oj-binding-provider="preact"
                id="${u}_from"
                label-hint="${c} From"
                label-edge="top"
                .value="${p?.from??null}"
                @valueChanged="${f=>N(f,u,{...p,from:f.detail.value})}"
            ></oj-c-input-date-picker>
            <oj-c-input-date-picker
                data-oj-binding-provider="preact"
                id="${u}_to"
                label-hint="${c} To"
                label-edge="top"
                .value="${p?.to??null}"
                @valueChanged="${f=>N(f,u,{...p,to:f.detail.value})}"
            ></oj-c-input-date-picker>
        </div>`}if(r.dataType==="array"){if(h==="choice")return V(c,Ma(r,l,it(e,r,u,o,i),!0));if(h==="listBox")return V(c,_i(r,l,it(e,r,u,o,i),!0));if(h==="combobox"||h==="select")return Cn(r,u,c,l,it(e,r,u,o,i));const p=it(e,r,u,o,i).map(f=>({value:f.value,label:f.label??""}));return n`<oj-c-checkboxset
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${l??[]}"
            .options="${p}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${f=>N(f,u,f.detail.value)}"
        ></oj-c-checkboxset>`}if(r.dataType==="status"){const p=l,y={danger:"error",success:"success",warning:"warning",info:"info"}[(p?.type??"").toLowerCase()]??"info";return n`<div id="${u}">
            <div style="${st}">${c}</div>
            ${p?n`<oj-c-badge
                data-oj-binding-provider="preact"
                .value="${p.message}"
                severity="${y}"
            ></oj-c-badge>`:n``}
        </div>`}if(r.dataType==="money"){if(r.readOnly){const p=l;let f="";return p?.locale&&p?.currency?f=new Intl.NumberFormat(p.locale,{style:"currency",currency:p.currency}).format(p.value):p!=null&&(f=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(p)),n`<div id="${u}">
                <div style="${st}">${c}</div>
                <div style="text-align:right;font-weight:bold;font-variant-numeric:tabular-nums;">${f}</div>
            </div>`}return n`<oj-c-input-number
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${l??null}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${p=>N(p,u,p.detail.value)}"
        ></oj-c-input-number>`}if(r.dataType==="file")return n`<oj-c-file-picker
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            ?disabled="${r.disabled}"
            @ojSelect="${p=>{const f=p.detail.files?.[0];N(p,u,f?{name:f.name,size:f.size}:null)}}"
        ></oj-c-file-picker>`;if(r.dataType==="range"){const p=l;return n`<div>
            <div style="${st}">${c}</div>
            <div style="display:flex;gap:1rem;align-items:center;">
                <input type="range"
                    min="${r.sliderMin??0}" max="${r.sliderMax??10}"
                    .value="${""+(p?.from??0)}"
                    @input="${f=>N(f,u,{...p,from:parseInt(f.target.value)})}" />
                <input type="range"
                    min="${r.sliderMin??0}" max="${r.sliderMax??10}"
                    .value="${""+(p?.to??0)}"
                    @input="${f=>N(f,u,{...p,to:parseInt(f.target.value)})}" />
            </div>
        </div>`}return n`<p>Unknown field type: ${r.dataType} / ${r.stereotype}</p>`};var ra=(e=>(e.Add="Add",e.Replace="Replace",e.ReplaceKeepData="ReplaceKeepData",e))(ra||{}),Fn=Object.defineProperty,ds=(e,t,a,s)=>{for(var i=void 0,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=o(t,a,i)||i);return i&&Fn(t,a,i),i};class Ra extends j{constructor(){super(...arguments),this.id="",this.baseUrl="",this.callbackToken="",this.createElement=t=>{const a=t.data,s=document.createElement(a.name);for(let i in a.attributes)s.setAttribute(i,a.attributes[i]);for(let i in a.on)s.addEventListener(i,r=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.on[i],parameters:{event:r}},bubbles:!0,composed:!0}))});return s},this.closeModal=()=>{const t=this.shadowRoot?.querySelectorAll("mateu-dialog, mateu-drawer");if(t&&t.length>0){t[t.length-1].close();return}this.dispatchEvent(new CustomEvent("close-modal-requested",{bubbles:!0,composed:!0}))},this.changeFavicon=t=>{let a=document.querySelector('link[rel="icon"]');a!==null?a.setAttribute("href",t):(a=document.createElement("link"),a.setAttribute("rel","icon"),a.setAttribute("href",t),document.head.appendChild(a))}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=bt.subscribe(t=>{if(t.command){const a=t.command;this.id==a.targetComponentId&&this.applyCommand(a)}if((!t.callbackToken||!this.callbackToken||t.callbackToken===this.callbackToken)&&t.fragment){const a=t.fragment;this.id==a.targetComponentId&&(this.applyFragment(a),this.completeMenu(a))}})}completeMenu(t){if(t.component&&t.component.type==ee.ClientSide){const a=t.component,s=a.metadata;if(s?.type==m.App){const i=s,r=this.getRemoteMenus(i.menu);if(r.length>0){const o=r.map(l=>ni.runAction(l.baseUrl,l.route,"_empty","",l.baseUrl+"#"+l.route,void 0,void 0,void 0,l.params,this,!0));Promise.all(o).then(l=>{i.menu=this.updateMenu(i.menu,l.map(c=>c.fragments).filter(c=>c).map(c=>c).flat()),i.variant=le.MENU_ON_TOP,bt.next({fragment:{component:a,data:void 0,state:void 0,action:ra.Replace,targetComponentId:this.id,containerId:void 0},callbackToken:this.callbackToken})})}}}}updateMenu(t,a){const s=[];return t.forEach(i=>{if(i.remote){const r=a.find(o=>o.targetComponentId==i.baseUrl+"#"+i.route);if(r&&r.component?.type==ee.ClientSide){const o=r.component;if(o.metadata?.type==m.App){const l=o.metadata,c=i.serverSideType&&i.serverSideType!=""?i.serverSideType:l.serverSideType;this.changeBaseUrl(l.menu,i.baseUrl,c,i.route,l.route),s.push(...l.menu)}}}else s.push(i)}),s}changeBaseUrl(t,a,s,i,r){t.forEach(o=>{o.baseUrl||(o.submenus&&o.submenus.length>0?this.changeBaseUrl(o.submenus,a,s,i,r):(o.consumedRoute=r??"",o.baseUrl=a,o.serverSideType=s,o.uriPrefix=i))})}getRemoteMenus(t){const a=[];return t.forEach(s=>{s.remote&&a.push(s)}),a}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(t){if(t.type=="SetWindowTitle"&&(document.title=t.data),t.type=="SetFavicon"&&this.changeFavicon(t.data),t.type=="DispatchEvent"&&this.dispatchNamedEvent(t.data),t.type=="NavigateTo"){const a=t.data;a&&(a.startsWith("http:")||a.startsWith("https:")?window.open(t.data,"_blank"):window.location.href=t.data)}if(t.type=="PushStateToHistory"){const a=t.data;a!==void 0&&this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:a},bubbles:!0,composed:!0}))}if(t.type=="RunAction"){const a=t.data;if(a&&a.actionId)if(a.targetComponentId){const s={command:{type:"RunAction",data:{actionId:a.actionId},targetComponentId:a.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:""};setTimeout(()=>bt.next(s))}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(t.type=="MarkAsDirty"&&this.dispatchEvent(new CustomEvent("dirty",{detail:{},bubbles:!0,composed:!0})),t.type=="MarkAsClean"&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),t.type=="DownloadFile"){const a=t.data;if(a&&a.base64Content){const s=atob(a.base64Content),i=new Uint8Array(s.length);for(let c=0;c<s.length;c++)i[c]=s.charCodeAt(c);const r=new Blob([i],{type:a.mimeType}),o=URL.createObjectURL(r),l=document.createElement("a");l.href=o,l.download=a.filename??"export",l.click(),URL.revokeObjectURL(o)}}if(t.type=="CloseModal"&&(this.closeModal(),this.dispatchNamedEvent(t.data)),t.type=="AddContentToHead"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.head.appendChild(this.createElement(t))}}if(t.type=="AddContentToBody"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.body.appendChild(this.createElement(t))}}}dispatchNamedEvent(t){if(t&&t.eventName){const a=this.component,s=a?.emitsName??a?.serverSideType;let i=t.payload??t.detail;s&&i&&typeof i=="object"&&(i={...i,__source:s}),this.dispatchEvent(new CustomEvent(t.eventName,{detail:i,bubbles:!0,composed:!0}))}}}ds([v()],Ra.prototype,"id");ds([v()],Ra.prototype,"baseUrl");var qn=Object.defineProperty,Mn=(e,t,a,s)=>{for(var i=void 0,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=o(t,a,i)||i);return i&&qn(t,a,i),i};class ua extends Ra{applyFragment(t){}manageActionRequestedEvent(t){}}Mn([v()],ua.prototype,"component");var Un=Object.defineProperty,Bn=Object.getOwnPropertyDescriptor,xt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Bn(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Un(t,a,i),i};const Wn=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},Vn=(e,t)=>{let a=t;for(;a;){if(a===e)return!0;a=a.assignedSlot??a.parentNode??a.host??null}return!1};let Ge=class extends ua{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.hoveredItem=null,this.onGridHoverMove=e=>{const t=e.currentTarget,a=t.getEventContext(e)?.item??null;a!==this.hoveredItem&&(this.hoveredItem=a,t.generateCellPartNames())},this.onGridHoverLeave=e=>{this.hoveredItem!==null&&(this.hoveredItem=null,e.currentTarget.generateCellPartNames())},this.hoverCellPartNameGenerator=(e,t)=>t?.item!=null&&t.item===this.hoveredItem?"hovered-cell":"",this._onRowKey=e=>{const t=this.field?.rowSelectionShortcut;if(!t||!this.field?.onItemSelectionActionId||!this._isRowShortcutRelevant()||!Gi(t,e))return;const a=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!a)return;const s=this.currentItems(),i=parseInt(a[1],10)-1;i>=s.length||(e.preventDefault(),this.selectRow(s[i]))},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onRowKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._onRowKey)}currentItems(){return this.field?.remoteCoordinates?this.data?.[this.id]?.content??[]:this.field?.fieldId&&this.state?this.state[this.field.fieldId]??[]:[]}selectRow(e){!e||!this.field?.onItemSelectionActionId||(this.selectedItems=[e],this.state[this.id+"_selected_items"]=[e],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.field.onItemSelectionActionId,parameters:{_clickedRow:e}},bubbles:!0,composed:!0})))}_isRowShortcutRelevant(){if(this.offsetParent===null&&this.getClientRects().length===0)return!1;const e=Wn();if(e&&e!==document.body&&!Vn(this,e)){const t=e.tagName?.toLowerCase()??"";if(e.isContentEditable||/^(input|textarea|select)$/.test(t)||t.startsWith("vaadin-")&&/(field|combo|picker|area|select)/.test(t))return!1}return!0}handleItemToggle(e){const{item:t,selected:a,shiftKey:s}=e.detail;if(this.rangeStartItem??=t,s){let i=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(i=this.state[this.field.fieldId]);const[r,o]=[this.rangeStartItem,t].map(u=>i.indexOf(u)).sort((u,h)=>u-h),l=i.slice(r,o+1),c=new Set(this.selectedItems);l.forEach(u=>{a?c.add(u):c.delete(u)}),this.selectedItems=[...c],this.state[this.id+"_selected_items"]=this.selectedItems}this.rangeStartItem=t}render(){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);const t=this.state[this.field?.fieldId+"_show_detail"]||this.state._show_detail&&this.state._show_detail[this.field.fieldId];if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates,s="";this.data[this.id]&&(this.data[this.id].searchSignature||s)&&this.data[this.id].searchSignature!=s&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements?e=this.data[this.id].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:s,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}if(Array.isArray(e)&&e.forEach((a,s)=>{a&&typeof a=="object"&&a._rowNumber===void 0&&(a._rowNumber=s)}),this.field?.inlineEditing)return this.renderMaster(e);if(this.field?.formPosition&&this.field?.formPosition.startsWith("modal")){const a=this;return n`

                ${this.renderMaster(e)}

                <vaadin-dialog
                        .opened="${t}"
                        @closed="${()=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.field?.fieldId+"_cancel"},bubbles:!0,composed:!0}))}}"
                        ${Ea(()=>n`
                            <mateu-event-interceptor .target="${a}">
                                <div id="container" style="${this.field?.formStyle??"display: contents;"}">
                                    <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                                </div>
                            </mateu-event-interceptor>
                            `,[()=>de()])}
                ></vaadin-dialog>
                
            `}else{const a=this.field?.formPosition=="left"||this.field?.formPosition=="right"?"horizontal":"vertical";return n`
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
                
                
            </vaadin-master-detail-layout>`}}renderMaster(e){const t=this.selectedItems||[];return n`<vaadin-vertical-layout style="width: 100%;">
            <!-- The field label is rendered by the surrounding mateu-field wrapper; rendering it
                 here too would duplicate it (e.g. "Guests / Guests"). -->
            <vaadin-grid
                    ?clickable="${!!this.field?.onItemSelectionActionId}"
                    .cellPartNameGenerator="${A(this.field?.onItemSelectionActionId?this.hoverCellPartNameGenerator:void 0)}"
                    @mousemove="${A(this.field?.onItemSelectionActionId?this.onGridHoverMove:void 0)}"
                    @mouseleave="${A(this.field?.onItemSelectionActionId?this.onGridHoverLeave:void 0)}"
                    style="${this.field?.onItemSelectionActionId?"cursor: pointer;":""}${this.field?.style??""}"
                    class="${this.field?.cssClasses}"
                    .items="${e}"
                    .selectedItems="${t}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${a=>{this.selectedItems=a.detail.value,this.state[this.id+"_selected_items"]=this.selectedItems}}"
                    @item-toggle="${this.handleItemToggle}"
                    @click="${A(this.field?.onItemSelectionActionId?a=>{const i=a.currentTarget.getEventContext(a)?.item;i&&this.selectRow(i)}:void 0)}"
                    @active-item-changed="${A(this.field?.detailPath&&!this.field?.useButtonForDetail?a=>{if(this.field?.detailPath){const s=a.detail.value;s?this.detailsOpenedItems=[s]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${A(this.field?.detailPath?Ui(a=>n`${$(this,a[this.field?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    ?all-rows-visible=${e?.length<10}
            >
                <span slot="empty-state">${this.field?.label?`No ${this.field.label.toLowerCase()} added yet.`:"No items added yet."}</span>
                ${this.field?.readOnly||this.field?.inlineEditing?d:n`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.columns?.map(a=>ti(a,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}

                ${this.field?.inlineEditing&&!this.field?.readOnly?n`
                    <vaadin-grid-column width="3.5rem" flex-grow="0" frozen-to-end
                            ${ot(a=>n`
                                <vaadin-button theme="tertiary icon error" title="Remove row"
                                    @click="${()=>{this.state[this.id+"_selected_items"]=[a],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_remove"},bubbles:!0,composed:!0}))}}">
                                    <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                                </vaadin-button>`,[])}
                    ></vaadin-grid-column>
                `:d}

                ${this.field?.useButtonForDetail?n`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${ot((a,{detailsOpened:s})=>n`
              <vaadin-button
                theme="tertiary icon"
                title="${s?"Collapse":"Expand"}"
                aria-label="Toggle details"
                aria-expanded="${s?"true":"false"}"
                @click="${()=>{this.detailsOpenedItems=this.detailsOpenedItems.length?this.detailsOpenedItems[0]._rowNumber==a._rowNumber?[]:[a]:[a]}}"
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
        </vaadin-vertical-layout>`}};Ge.styles=R`
        ${yt}

        /* Clickable grids (a row-selection action is wired) give visual feedback: the host sets a
           pointer cursor (inline, inherited by the slotted cell content), and the cells of the
           hovered row — tagged "hovered-cell" by cellPartNameGenerator — get a subtle highlight. */
        vaadin-grid[clickable]::part(hovered-cell) {
            background-color: var(--lumo-primary-color-10pct);
            cursor: pointer;
        }
    `;xt([v()],Ge.prototype,"field",2);xt([v()],Ge.prototype,"state",2);xt([v()],Ge.prototype,"data",2);xt([v()],Ge.prototype,"appState",2);xt([v()],Ge.prototype,"appData",2);xt([v()],Ge.prototype,"selectedItems",2);xt([g()],Ge.prototype,"detailsOpenedItems",2);Ge=xt([I("mateu-grid")],Ge);var Hn=Object.defineProperty,Gn=Object.getOwnPropertyDescriptor,Gt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Gn(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Hn(t,a,i),i};let gt=class extends j{constructor(){super(...arguments),this.getNewValue=e=>{if(this.field?.dataType=="array"){if(!this.value)return[e];const t=this.value;return t.indexOf(e)>=0?t.filter(a=>a!==e):[...t,e]}return e}}render(){let e=this.field?.options;if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates;this.data?.[this.field.fieldId]&&this.data[this.field.fieldId].content&&this.data[this.field.fieldId].totalElements?e=this.data[this.field.fieldId].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:"",fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}const t=this.field?.attributes?.divStyle;return n`
        <div style="display: flex; gap: 1rem; padding: 1rem; flex-wrap: wrap; ${t}">
                                    ${e?.map(a=>n`
                            <div 
                                    class="choice ${this.value==a.value||Array.isArray(this.value)&&this.value.includes(a.value)?"selected":""}"
                                    @click="${()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.getNewValue(a.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}"
                            >${a.description||a.image?n`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${a.image?n`
                                            <img src="${a.image}" alt="${a.label}" style="${a.imageStyle??"width: 2rem;"}" />
                                        `:d}
                                    <vaadin-vertical-layout>
                                        <span> ${a.label} </span>
                                        <span
                                                style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                                        >
              ${a.description}
            </span>
                                    </vaadin-vertical-layout>
                                </vaadin-horizontal-layout>
                            `:a.label}</div>
                        `)}
                                </div>

       `}};gt.styles=R`
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
  `;Gt([v()],gt.prototype,"field",2);Gt([v()],gt.prototype,"baseUrl",2);Gt([v()],gt.prototype,"state",2);Gt([v()],gt.prototype,"data",2);Gt([v()],gt.prototype,"value",2);gt=Gt([I("mateu-choice")],gt);var Kn=Object.defineProperty,Jn=Object.getOwnPropertyDescriptor,Qe=(e,t,a,s)=>{for(var i=s>1?void 0:s?Jn(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Kn(t,a,i),i};let Ie=class extends j{constructor(){super(...arguments),this.currencyChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),this.value.currency=e.detail.value,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}}))},this.valueChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),e.detail.value&&(this.value.value=e.detail.value?parseFloat(e.detail.value):0,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}})))}}render(){return n`
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
       `}};Ie.styles=R`
  `;Qe([v()],Ie.prototype,"fieldId",2);Qe([v()],Ie.prototype,"label",2);Qe([v()],Ie.prototype,"state",2);Qe([v()],Ie.prototype,"data",2);Qe([v()],Ie.prototype,"value",2);Qe([v()],Ie.prototype,"autoFocus",2);Qe([v()],Ie.prototype,"required",2);Qe([v()],Ie.prototype,"colspan",2);Qe([v()],Ie.prototype,"helperText",2);Ie=Qe([I("mateu-money-field")],Ie);const Ti=["vaadin:abacus","vaadin:absolute-position","vaadin:academy-cap","vaadin:accessibility","vaadin:accordion-menu","vaadin:add-dock","vaadin:adjust","vaadin:adobe-flash","vaadin:airplane","vaadin:alarm","vaadin:align-center","vaadin:align-justify","vaadin:align-left","vaadin:align-right","vaadin:alt-a","vaadin:alt","vaadin:ambulance","vaadin:anchor","vaadin:angle-double-down","vaadin:angle-double-left","vaadin:angle-double-right","vaadin:angle-double-up","vaadin:angle-down","vaadin:angle-left","vaadin:angle-right","vaadin:angle-up","vaadin:archive","vaadin:archives","vaadin:area-select","vaadin:arrow-backward","vaadin:arrow-circle-down-o","vaadin:arrow-circle-down","vaadin:arrow-circle-left-o","vaadin:arrow-circle-left","vaadin:arrow-circle-right-o","vaadin:arrow-circle-right","vaadin:arrow-circle-up-o","vaadin:arrow-circle-up","vaadin:arrow-down","vaadin:arrow-forward","vaadin:arrow-left","vaadin:arrow-long-down","vaadin:arrow-long-left","vaadin:arrow-right","vaadin:arrow-up","vaadin:arrows-cross","vaadin:arrows-long-h","vaadin:arrows-long-right","vaadin:arrows-long-up","vaadin:arrows-long-v","vaadin:arrows","vaadin:asterisk","vaadin:at","vaadin:automation","vaadin:backspace-a","vaadin:backspace","vaadin:backwards","vaadin:ban","vaadin:bar-chart-h","vaadin:bar-chart-v","vaadin:bar-chart","vaadin:barcode","vaadin:bed","vaadin:bell-o","vaadin:bell-slash-o","vaadin:bell-slash","vaadin:bell","vaadin:boat","vaadin:bold","vaadin:bolt","vaadin:bomb","vaadin:book-dollar","vaadin:book-percent","vaadin:book","vaadin:bookmark-o","vaadin:bookmark","vaadin:briefcase","vaadin:browser","vaadin:bug-o","vaadin:bug","vaadin:building-o","vaadin:building","vaadin:bullets","vaadin:bullseye","vaadin:bus","vaadin:buss","vaadin:button","vaadin:calc-book","vaadin:calc","vaadin:calendar-briefcase","vaadin:calendar-clock","vaadin:calendar-envelope","vaadin:calendar-o","vaadin:calendar-user","vaadin:calendar","vaadin:camera","vaadin:car","vaadin:caret-down","vaadin:caret-left","vaadin:caret-right","vaadin:caret-square-down-o","vaadin:caret-square-left-o","vaadin:caret-square-right-o","vaadin:caret-square-up-o","vaadin:caret-up","vaadin:cart-o","vaadin:cart","vaadin:cash","vaadin:chart-3d","vaadin:chart-grid","vaadin:chart-line","vaadin:chart-timeline","vaadin:chart","vaadin:chat","vaadin:check-circle-o","vaadin:check-circle","vaadin:check-square-o","vaadin:check-square","vaadin:check","vaadin:chevron-circle-down-o","vaadin:chevron-circle-down","vaadin:chevron-circle-left-o","vaadin:chevron-circle-left","vaadin:chevron-circle-right-o","vaadin:chevron-circle-right","vaadin:chevron-circle-up-o","vaadin:chevron-circle-up","vaadin:chevron-down-small","vaadin:chevron-down","vaadin:chevron-left-small","vaadin:chevron-left","vaadin:chevron-right-small","vaadin:chevron-right","vaadin:chevron-up-small","vaadin:chevron-up","vaadin:child","vaadin:circle-thin","vaadin:circle","vaadin:clipboard-check","vaadin:clipboard-cross","vaadin:clipboard-heart","vaadin:clipboard-pulse","vaadin:clipboard-text","vaadin:clipboard-user","vaadin:clipboard","vaadin:clock","vaadin:close-big","vaadin:close-circle-o","vaadin:close-circle","vaadin:close-small","vaadin:close","vaadin:cloud-download-o","vaadin:cloud-download","vaadin:cloud-o","vaadin:cloud-upload-o","vaadin:cloud-upload","vaadin:cloud","vaadin:cluster","vaadin:code","vaadin:coffee","vaadin:cog-o","vaadin:cog","vaadin:cogs","vaadin:coin-piles","vaadin:coins","vaadin:combobox","vaadin:comment-ellipsis-o","vaadin:comment-ellipsis","vaadin:comment-o","vaadin:comment","vaadin:comments-o","vaadin:comments","vaadin:compile","vaadin:compress-square","vaadin:compress","vaadin:connect-o","vaadin:connect","vaadin:controller","vaadin:copy-o","vaadin:copy","vaadin:copyright","vaadin:corner-lower-left","vaadin:corner-lower-right","vaadin:corner-upper-left","vaadin:corner-upper-right","vaadin:credit-card","vaadin:crop","vaadin:cross-cutlery","vaadin:crosshairs","vaadin:css","vaadin:ctrl-a","vaadin:ctrl","vaadin:cube","vaadin:cubes","vaadin:curly-brackets","vaadin:cursor-o","vaadin:cursor","vaadin:cutlery","vaadin:dashboard","vaadin:database","vaadin:date-input","vaadin:deindent","vaadin:del-a","vaadin:del","vaadin:dental-chair","vaadin:desktop","vaadin:diamond-o","vaadin:diamond","vaadin:diploma-scroll","vaadin:diploma","vaadin:disc","vaadin:doctor-briefcase","vaadin:doctor","vaadin:dollar","vaadin:dot-circle","vaadin:download-alt","vaadin:download","vaadin:drop","vaadin:edit","vaadin:eject","vaadin:elastic","vaadin:ellipsis-circle-o","vaadin:ellipsis-circle","vaadin:ellipsis-dots-h","vaadin:ellipsis-dots-v","vaadin:ellipsis-h","vaadin:ellipsis-v","vaadin:enter-arrow","vaadin:enter","vaadin:envelope-o","vaadin:envelope-open-o","vaadin:envelope-open","vaadin:envelope","vaadin:envelopes-o","vaadin:envelopes","vaadin:eraser","vaadin:esc-a","vaadin:esc","vaadin:euro","vaadin:exchange","vaadin:exclamation-circle-o","vaadin:exclamation-circle","vaadin:exclamation","vaadin:exit-o","vaadin:exit","vaadin:expand-full","vaadin:expand-square","vaadin:expand","vaadin:external-browser","vaadin:external-link","vaadin:eye-slash","vaadin:eye","vaadin:eyedropper","vaadin:facebook-square","vaadin:facebook","vaadin:factory","vaadin:family","vaadin:fast-backward","vaadin:fast-forward","vaadin:female","vaadin:file-add","vaadin:file-code","vaadin:file-font","vaadin:file-movie","vaadin:file-o","vaadin:file-picture","vaadin:file-presentation","vaadin:file-process","vaadin:file-refresh","vaadin:file-remove","vaadin:file-search","vaadin:file-sound","vaadin:file-start","vaadin:file-table","vaadin:file-text-o","vaadin:file-text","vaadin:file-tree-small","vaadin:file-tree-sub","vaadin:file-tree","vaadin:file-zip","vaadin:file","vaadin:fill","vaadin:film","vaadin:filter","vaadin:fire","vaadin:flag-checkered","vaadin:flag-o","vaadin:flag","vaadin:flash","vaadin:flask","vaadin:flight-landing","vaadin:flight-takeoff","vaadin:flip-h","vaadin:flip-v","vaadin:folder-add","vaadin:folder-o","vaadin:folder-open-o","vaadin:folder-open","vaadin:folder-remove","vaadin:folder-search","vaadin:folder","vaadin:font","vaadin:form","vaadin:forward","vaadin:frown-o","vaadin:funcion","vaadin:function","vaadin:funnel","vaadin:gamepad","vaadin:gavel","vaadin:gift","vaadin:glass","vaadin:glasses","vaadin:globe-wire","vaadin:globe","vaadin:golf","vaadin:google-plus-square","vaadin:google-plus","vaadin:grab","vaadin:grid-bevel","vaadin:grid-big-o","vaadin:grid-big","vaadin:grid-h","vaadin:grid-small-o","vaadin:grid-small","vaadin:grid-v","vaadin:grid","vaadin:group","vaadin:hammer","vaadin:hand","vaadin:handle-corner","vaadin:hands-up","vaadin:handshake","vaadin:harddrive-o","vaadin:harddrive","vaadin:hash","vaadin:header","vaadin:headphones","vaadin:headset","vaadin:health-card","vaadin:heart-o","vaadin:heart","vaadin:home-o","vaadin:home","vaadin:hospital","vaadin:hourglass-empty","vaadin:hourglass-end","vaadin:hourglass-start","vaadin:hourglass","vaadin:inbox","vaadin:indent","vaadin:info-circle-o","vaadin:info-circle","vaadin:info","vaadin:input","vaadin:insert","vaadin:institution","vaadin:invoice","vaadin:italic","vaadin:key-o","vaadin:key","vaadin:keyboard-o","vaadin:keyboard","vaadin:laptop","vaadin:layout","vaadin:level-down-bold","vaadin:level-down","vaadin:level-left-bold","vaadin:level-left","vaadin:level-right-bold","vaadin:level-right","vaadin:level-up-bold","vaadin:level-up","vaadin:lifebuoy","vaadin:lightbulb","vaadin:line-bar-chart","vaadin:line-chart","vaadin:line-h","vaadin:line-v","vaadin:lines-list","vaadin:lines","vaadin:link","vaadin:list-ol","vaadin:list-select","vaadin:list-ul","vaadin:list","vaadin:location-arrow-circle-o","vaadin:location-arrow-circle","vaadin:location-arrow","vaadin:lock","vaadin:magic","vaadin:magnet","vaadin:mailbox","vaadin:male","vaadin:map-marker","vaadin:margin-bottom","vaadin:margin-left","vaadin:margin-right","vaadin:margin-top","vaadin:margin","vaadin:medal","vaadin:megafone","vaadin:megaphone","vaadin:meh-o","vaadin:menu","vaadin:microphone","vaadin:minus-circle-o","vaadin:minus-circle","vaadin:minus-square-o","vaadin:minus","vaadin:mobile-browser","vaadin:mobile-retro","vaadin:mobile","vaadin:modal-list","vaadin:modal","vaadin:money-deposit","vaadin:money-exchange","vaadin:money-withdraw","vaadin:money","vaadin:moon-o","vaadin:moon","vaadin:morning","vaadin:movie","vaadin:music","vaadin:mute","vaadin:native-button","vaadin:newspaper","vaadin:notebook","vaadin:nurse","vaadin:office","vaadin:open-book","vaadin:option-a","vaadin:option","vaadin:options","vaadin:orientation","vaadin:out","vaadin:outbox","vaadin:package","vaadin:padding-bottom","vaadin:padding-left","vaadin:padding-right","vaadin:padding-top","vaadin:padding","vaadin:paint-roll","vaadin:paintbrush","vaadin:palete","vaadin:palette","vaadin:panel","vaadin:paperclip","vaadin:paperplane-o","vaadin:paperplane","vaadin:paragraph","vaadin:password","vaadin:paste","vaadin:pause","vaadin:pencil","vaadin:phone-landline","vaadin:phone","vaadin:picture","vaadin:pie-bar-chart","vaadin:pie-chart","vaadin:piggy-bank-coin","vaadin:piggy-bank","vaadin:pill","vaadin:pills","vaadin:pin-post","vaadin:pin","vaadin:play-circle-o","vaadin:play-circle","vaadin:play","vaadin:plug","vaadin:plus-circle-o","vaadin:plus-circle","vaadin:plus-minus","vaadin:plus-square-o","vaadin:plus","vaadin:pointer","vaadin:power-off","vaadin:presentation","vaadin:print","vaadin:progressbar","vaadin:puzzle-piece","vaadin:pyramid-chart","vaadin:qrcode","vaadin:question-circle-o","vaadin:question-circle","vaadin:question","vaadin:quote-left","vaadin:quote-right","vaadin:random","vaadin:raster-lower-left","vaadin:raster","vaadin:records","vaadin:recycle","vaadin:refresh","vaadin:reply-all","vaadin:reply","vaadin:resize-h","vaadin:resize-v","vaadin:retweet","vaadin:rhombus","vaadin:road-branch","vaadin:road-branches","vaadin:road-split","vaadin:road","vaadin:rocket","vaadin:rotate-left","vaadin:rotate-right","vaadin:rss-square","vaadin:rss","vaadin:safe-lock","vaadin:safe","vaadin:scale-unbalance","vaadin:scale","vaadin:scatter-chart","vaadin:scissors","vaadin:screwdriver","vaadin:search-minus","vaadin:search-plus","vaadin:search","vaadin:select","vaadin:server","vaadin:share-square","vaadin:share","vaadin:shield","vaadin:shift-arrow","vaadin:shift","vaadin:shop","vaadin:sign-in-alt","vaadin:sign-in","vaadin:sign-out-alt","vaadin:sign-out","vaadin:signal","vaadin:sitemap","vaadin:slider","vaadin:sliders","vaadin:smiley-o","vaadin:sort","vaadin:sound-disable","vaadin:spark-line","vaadin:specialist","vaadin:spinner-arc","vaadin:spinner-third","vaadin:spinner","vaadin:spline-area-chart","vaadin:spline-chart","vaadin:split-h","vaadin:split-v","vaadin:split","vaadin:spoon","vaadin:square-shadow","vaadin:star-half-left-o","vaadin:star-half-left","vaadin:star-half-right-o","vaadin:star-half-right","vaadin:star-o","vaadin:star","vaadin:start-cog","vaadin:step-backward","vaadin:step-forward","vaadin:stethoscope","vaadin:stock","vaadin:stop-cog","vaadin:stop","vaadin:stopwatch","vaadin:storage","vaadin:strikethrough","vaadin:subscript","vaadin:suitcase","vaadin:sun-down","vaadin:sun-o","vaadin:sun-rise","vaadin:superscript","vaadin:sword","vaadin:tab-a","vaadin:tab","vaadin:table","vaadin:tablet","vaadin:tabs","vaadin:tag","vaadin:tags","vaadin:tasks","vaadin:taxi","vaadin:teeth","vaadin:terminal","vaadin:text-height","vaadin:text-input","vaadin:text-label","vaadin:text-width","vaadin:thin-square","vaadin:thumbs-down-o","vaadin:thumbs-down","vaadin:thumbs-up-o","vaadin:thumbs-up","vaadin:ticket","vaadin:time-backward","vaadin:time-forward","vaadin:timer","vaadin:toolbox","vaadin:tools","vaadin:tooth","vaadin:touch","vaadin:train","vaadin:trash","vaadin:tree-table","vaadin:trendind-down","vaadin:trending-down","vaadin:trending-up","vaadin:trophy","vaadin:truck","vaadin:twin-col-select","vaadin:twitter-square","vaadin:twitter","vaadin:umbrella","vaadin:underline","vaadin:unlink","vaadin:unlock","vaadin:upload-alt","vaadin:upload","vaadin:user-card","vaadin:user-check","vaadin:user-clock","vaadin:user-heart","vaadin:user-star","vaadin:user","vaadin:users","vaadin:vaadin-h","vaadin:vaadin-v","vaadin:viewport","vaadin:vimeo-square","vaadin:vimeo","vaadin:volume-down","vaadin:volume-off","vaadin:volume-up","vaadin:volume","vaadin:wallet","vaadin:warning","vaadin:workplace","vaadin:wrench","vaadin:youtube-square","vaadin:youtube"];var Yn=Object.defineProperty,Xn=Object.getOwnPropertyDescriptor,ke=(e,t,a,s)=>{for(var i=s>1?void 0:s?Xn(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Yn(t,a,i),i};let oe=class extends j{constructor(){super(...arguments),this.component=void 0,this.field=void 0,this.baseUrl=void 0,this.state={},this.data={},this.appState={},this.appData={},this.colorPickerOpened=!1,this.colorPickerValue=void 0,this.comboData=[],this._comboFilter="",this.rendered=!1,this.renderColorPicker=()=>{const e=this.field?.fieldId,t=this.state&&e in this.state?this.state[e]:this.field?.initialValue;return n`
            <ui5-color-picker value="${t}" @change="${a=>this.colorPickerValue=a.target.value}">Picker</ui5-color-picker>
        `},this.saveColor=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.colorPickerValue,fieldId:this.field.fieldId},bubbles:!0,composed:!0})),this.colorPickerOpened=!1},this.renderColorPickerFooter=()=>n`<vaadin-button @click="${()=>this.colorPickerOpened=!1}">Cancel</vaadin-button>
        <vaadin-button theme="primary" @click="${this.saveColor}">Save</vaadin-button>`,this.checked=e=>{const t=e.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.checked,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))},this.convert=e=>this.field?.dataType=="integer"?parseInt(e):e,this.multiComboBoxValueChanged=e=>{if(this.rendered){const t=this.field?.fieldId,a=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let s;e.detail.value&&(s=e.detail.value.map(i=>i.value),s&&s.length>0&&(this.data[this.id]||(this.data[this.id]={}),this.data[this.id].content||(this.data[this.id].content=[]),this.data[this.id]&&this.data[this.id].content&&e.detail.value.forEach(i=>{this.data[this.id].content?.find(r=>i.value==r.value)||this.data[this.id].content.push(i)}))),this.compareArrays(s,a)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.valueChanged=e=>{this.rendered&&e.detail.value!==void 0&&e.detail.value!=this.state[this.field.fieldId]&&this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.convert(e.detail.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.selectedItems=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.comboData&&this.comboData.length>0)return this.comboData?.filter(t=>e.indexOf(t.value)>=0);if(this.data[this.id]&&this.data[this.id].content&&this.data[this.id].content.length>0)return this.data[this.id].content.filter(t=>e.indexOf(t.value)>=0)}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0);return[]},this.selectedIndex=e=>{if(e)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const t=this.data[this.id].content.find(a=>a.value==e);if(t)return this.data[this.id].content.indexOf(t)}}else{const t=this.field?.options?.find(a=>a.value==e);if(t)return this.field?.options?.indexOf(t)}},this.selectedIndexes=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content)return this.data[this.id].content.filter(a=>e.indexOf(a.value)>=0).map(a=>this.data[this.id].content.indexOf(a))}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0).map(t=>this.field?.options?.indexOf(t));return[]},this.compareArrays=(e,t)=>this.falsy(e)&&this.falsy(t)||e&&t&&e.length===t.length&&e.every((a,s)=>a===t[s]),this.falsy=e=>!e||e.length==0,this.listItemsSelected=e=>{const t=this.field?.fieldId,a=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let s;this.rendered&&(e.detail.value&&(this.field?.remoteCoordinates?this.data[this.id]&&this.data[this.id].content&&(s=e.detail.value.map(i=>this.data[this.id].content[i].value)):s=e.detail.value.map(i=>this.field.options[i].value)),this.compareArrays(s,a)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s,fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))},this.listItemSelected=e=>{let t;if(e.detail.value||e.detail.value==0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const a=this.data[this.id].content[e.detail.value];a&&(t=a.value)}}else{const a=this.field.options[e.detail.value];a&&(t=a.value)}this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.mapPosition=e=>{switch(e){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.helperShownInControl=!1,this.fileUploaded=e=>{const t=this.field?.fieldId??"",a=this.state[t];a.push({id:e.detail.xhr.responseText,name:e.detail.file.name}),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.fileChanged=e=>{const t=this.field?.fieldId??"",a=(e.detail.value??[]).filter(i=>i.id).map(i=>i.id),s=(this.state[t]??[]).map(i=>i.id);if(!this.compareArrays(s,a)){const i=(e.detail.value??[]).filter(r=>r.id).map(r=>({id:r.id,name:r.name}));this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.triggerImageUpload=()=>{this.renderRoot?.querySelector('input[type="file"]')?.click()},this.imageUpload=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const s=new FileReader;s.onload=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s.result,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},s.readAsDataURL(a),t.value=""},this.imageDelete=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:"",fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.iconComboboxRenderer=e=>n`
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
`,this.filteredIcons=[],this.navLinkOffset=null,this.iconFilterChanged=e=>{this.filteredIcons=Ti.filter(t=>!e.detail.value||t.indexOf(e.detail.value)>=0)}}remoteComboDataProvider(e){return(t,a)=>{const{filter:s,page:i,pageSize:r}=t,o=s??"";this._comboFilter=o,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{searchText:s,fieldId:this.field?.fieldId,size:r,page:i,sort:void 0},callback:l=>{if(o===this._comboFilter)if(l?.messages?.forEach(c=>{na.show(c.text,{position:c.position?this.mapPosition(c.position):void 0,theme:c.variant,duration:c.duration})}),!l.fragments||l.fragments.length==0)this.comboData=[],a([],0);else{const c=l.fragments[0].data?.[this.id];this.comboData=c?.content,a(c?.content,c?.totalElements)}},callbackonly:!0},bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.rendered=!1}renderNavLink(){const e=this.field?.link;if(!e?.href)return d;const t=ge(e.href,this.state,this.data)??e.href,a=ge(e.title,this.state,this.data)||t,s=e.icon||(t.startsWith("http")?"vaadin:external-link":"vaadin:link"),i=this.navLinkOffset??"calc(var(--lumo-font-size-s) * 1.6 + (var(--lumo-size-m) - var(--lumo-icon-size-s)) / 2)";return n`<a
                data-navlink
                href="${t}"
                title="${a}"
                target="${A(e.target||void 0)}"
                style="display: flex; align-items: center; color: var(--lumo-secondary-text-color); align-self: flex-start; margin-top: ${i};"
        ><vaadin-icon icon="${s}" style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"></vaadin-icon></a>`}positionNavLink(){const e=this.renderRoot?.querySelector("a[data-navlink]");e&&setTimeout(()=>{const t=e.parentElement,a=t?.firstElementChild?.firstElementChild;if(!t||!a)return;const i=(a.shadowRoot?.querySelector('[part="input-field"]')??a).getBoundingClientRect();if(i.height===0)return;const r=Math.max(0,i.top+i.height/2-e.offsetHeight/2-t.getBoundingClientRect().top),o=`${Math.round(r)}px`;this.navLinkOffset!==o&&(this.navLinkOffset=o)})}helperText(){return this.helperShownInControl=!0,Ee(this.field?.description??"",this.state,this.data)??""}render(){const e=this.field?.fieldId??"";this.rendered=!0;const t=this.renderNavLink();this.helperShownInControl=!1;const a=this.renderField(),s=this.field?.description&&!this.helperShownInControl?Ee(this.field.description,this.state,this.data):void 0;return n`<div style="display: block;">
            <div style="${t!==d?"display: flex; gap: var(--lumo-space-xs);":""}"><div style="flex: 1; min-width: 0;">${a}</div>${t}</div>
            ${s?n`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${s}</div>
            `:d}
            ${this.data.errors&&this.data.errors[e]&&this.data.errors[e].length>0?n`
                <div><ul>${this.data.errors[e].map(i=>n`<li>${i}</li>`)}</ul></div>
            `:d}
        </div>`}async firstUpdated(){this.filteredIcons=Ti}update(e){e.has("component")&&(this.rendered=!1),super.update(e)}updated(e){super.updated(e),this.positionNavLink()}renderField(){const e=this.field?.fieldId??"",t=this.state&&e in this.state?this.state[e]:this.field?.initialValue,a=this.field?.label+"",s=ge(a,this.state,this.data),i=this.labelAlreadyRendered||!s||s=="null"?d:s;return this.field?.stereotype=="badge"?this.renderBadgeField(e,t,i,s):this.field?.stereotype=="plainText"?this.renderPlainTextField(e,t,i,s):this.field?.readOnly&&this.field.stereotype!="grid"&&this.field.dataType!="status"&&this.field?.dataType!="money"?this.renderReadOnlyField(e,t,i,s):this.field?.dataType=="file"?this.renderFileField(e,t,i,s):this.field?.dataType=="string"?this.renderStringField(e,t,i,s):this.field?.dataType=="number"?this.renderNumberField(e,t,i,s):this.field?.dataType=="integer"?this.renderIntegerField(e,t,i,s):this.field?.dataType=="bool"?this.renderBoolField(e,t,i,s):this.field?.dataType=="dateRange"?this.renderDateRangeField(e,t,i,s):this.field?.dataType=="date"?this.renderDateField(e,t,i,s):this.field?.dataType=="dateTime"?this.renderDateTimeField(e,t,i,s):this.field?.dataType=="time"?this.renderTimeField(e,t,i,s):this.field?.dataType=="array"?this.renderArrayField(e,t,i,s):this.field?.dataType=="money"?this.renderMoneyField(e,t,i,s):this.field?.dataType=="status"?this.renderStatusField(e,t,i,s):this.field?.dataType=="range"?this.renderRangeField(e,t,i,s):n`<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`}renderBadgeField(e,t,a,s){if(!this.field)return n``;const i=t===!0||t==="true";return n`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><span theme="badge ${i?"success":""} pill" style="${i?"":"opacity: 0.4;"}">${s}</span>
            </vaadin-custom-field>`}renderPlainTextField(e,t,a,s){if(!this.field)return n``;let i=Ee(t,this.state,this.data);const r=i&&typeof i=="object"&&"value"in i?i:null;i&&i.value&&(i=i.value);const o=this.field?.dataType=="bool"||i===!0||i===!1,l=this.field?.dataType=="money",c=i!=null&&i!=="";let u=c?String(i):"—";if(l&&c){const p=typeof i=="number"?i:parseFloat(String(i));isNaN(p)||(u=r&&r.locale&&r.currency?new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(p):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(p))}const h=o?n`<vaadin-icon icon="${i===!0||i==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:this.field?.multiline?n`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${u}</span>`:n`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${l?" font-variant-numeric: tabular-nums;":""}">${u}</span>`;return n`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    data-colspan="${this.field?.colspan}"
                    style="${l?"text-align: right; ":""}${this.field?.style}"
            >${h}</vaadin-custom-field>`}renderReadOnlyField(e,t,a,s){if(!this.field)return n``;let i=Ee(t,this.state,this.data)||this.data[e];if(i&&i.value&&(i=i.value),this.field.stereotype=="image"||this.field.stereotype=="uploadableImage"||this.field.stereotype=="signature"||this.field.stereotype=="camera")return n`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><img src="${i}" id="${this.field.fieldId}_img" style="${this.field.style}">
                </vaadin-custom-field>`;if(this.field.dataType=="bool")return n`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><vaadin-icon icon="${i?"vaadin:check":"vaadin:minus"}" style="height: 20px;"></vaadin-icon>
                </vaadin-custom-field>`;const r=i!=null?String(i):"";return n`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        value="${i}"
                        readonly
                        style="${this.field.style}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >${r.length>15?n`<vaadin-icon
                        slot="suffix"
                        icon="vaadin:copy"
                        title="Copiar"
                        style="cursor: pointer; color: var(--lumo-secondary-text-color);"
                        @click="${()=>navigator.clipboard.writeText(r).catch(()=>{})}"
                ></vaadin-icon>`:d}</vaadin-text-field>
`}renderFileField(e,t,a,s){if(!this.field)return n``;const i=t?.map(r=>({id:r.id,name:r.name,type:"",uploadTarget:"",complete:!0}))??[];return n`
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
            `}renderStringField(e,t,a,s){if(!this.field)return n``;if(this.field?.stereotype=="searchable"){const i=o=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"code-"+this.field?.fieldId,parameters:{code:o.currentTarget.value}},bubbles:!0,composed:!0}))},r=o=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"codesearch-"+this.field?.fieldId,parameters:{}},bubbles:!0,composed:!0}))};return n`
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
                            <vaadin-button theme="icon" @click="${r}"><vaadin-icon icon="lumo:search"></vaadin-icon></vaadin-button>
                        </vaadin-horizontal-layout>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="select"){if(this.field?.remoteCoordinates){const r=this.field.remoteCoordinates,o="";this.data[this.id]&&(this.data[this.id].searchSignature||o)&&this.data[this.id].searchSignature!=o&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:r.action,parameters:{searchText:o,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}));let l=t;return t&&t.value&&(l=t.value),n`
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
                `;if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates;let r;this.data[this.id]&&this.data[this.id].content&&(r=this.data[this.id].content.find(l=>l.value==t)),!r&&this.comboData&&(r=this.comboData.find(l=>l.value==t)),!r&&t&&(r={value:t,label:this.data[this.id+"-label"]??t});const o=this.remoteComboDataProvider(i.action);return n`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${a}"
                            item-label-path="label"
                            item-id-path="value"
                            .dataProvider="${o}"
                            .selectedItem="${r}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            @keyup="${l=>{if(l.key=="Backspace"){const c=l.currentTarget;c.inputElement.value||(c.value="")}}}"
                            ${Da(this.comboRenderer,[])}
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
                            ${Da(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),n`
                        <vaadin-custom-field
                                label="${a}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${A(this.selectedIndex(t))}"
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
                            selected="${A(this.selectedIndex(t))}"
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
                `}if(this.field?.stereotype=="radio"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),n`
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
                            ${Mi(()=>n`
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
                            ${Da(this.iconComboboxRenderer,[])}
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
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${ne(""+t)}</div></vaadin-custom-field>
                `;if(this.field?.stereotype=="image")return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><img
                            src="${t}"
                            style="${this.component?.style}" class="${this.component?.cssClasses}"></vaadin-custom-field>
                `;if(this.field?.stereotype=="treeSelect")return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
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
                `;if(this.field?.stereotype=="signature")return n`
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
                `;if(this.field?.stereotype=="uploadableImage"){const i=t!=null&&t!=="";return n`
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
  ${Ea(this.renderColorPicker,[])}
  ${Qa(this.renderColorPickerFooter,[])}
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
`}renderNumberField(e,t,a,s){return this.field?n`<vaadin-number-field
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
            ></vaadin-number-field>`:n``}renderIntegerField(e,t,a,s){if(!this.field)return n``;if(this.field.stereotype=="stars"){let i=t;isNaN(i)&&(i=0);const r=[1,2,3,4,5];return n`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >${r.map(o=>n`
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
                    ><input type="range" @input="${r=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}" min="${this.field.sliderMin??0}" max="${this.field.sliderMax??10}" value="${i??0}"/></vaadin-custom-field>
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
            `}renderBoolField(e,t,a,s){return this.field?n`
                <vaadin-custom-field
                        label="${a}"
                        .helperText="${this.helperText()}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                >
                    ${this.field.stereotype=="toggle"?n`
                        <paper-toggle-button id="${this.field.fieldId}"
                                             ?disabled=${this.field.disabled}
                                             ?checked=${t}
                                             @change=${this.checked}>
                        </paper-toggle-button>
                    `:n`
                        <vaadin-checkbox
                                id="${this.field.fieldId}"
                                @change="${this.checked}"
                                value="${t}"
                                ?checked=${t}
                                ?autofocus="${this.field.wantsFocus}"
                        ></vaadin-checkbox>
                    `}
                </vaadin-custom-field>
            `:n``}renderDateRangeField(e,t,a,s){if(!this.field)return n``;const i=t?t.from+";"+t.to:void 0;return n`<vcf-date-range-picker
                    id="${this.field.fieldId}"
                    label="${a}"
                    @value-changed="${r=>{r.detail.value&&(r.detail.value={from:r.detail.value.split(";")[0],to:r.detail.value.split(";")[1]}),this.valueChanged(r)}}"
                    value="${i}"
                    .helperText="${this.helperText()}"
                    ?autofocus="${this.field.wantsFocus}"
                    ?required="${this.field.required||d}"
                    data-colspan="${this.field.colspan}"
            ></vcf-date-range-picker>`}renderDateField(e,t,a,s){return this.field?n`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-picker>`:n``}renderDateTimeField(e,t,a,s){return this.field?n`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-time-picker>`:n``}renderTimeField(e,t,a,s){return this.field?n`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-time-picker>`:n``}renderArrayField(e,t,a,s){if(!this.field)return n``;if(this.field?.stereotype=="choice")return n`
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
`;if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),n`
                        <vaadin-custom-field
                                label="${a}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box multiple
                                     .selectedValues="${A(this.selectedIndexes(t))}"
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
                                     .selectedValues="${A(this.selectedIndexes(t))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                                     data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(i=>n`
                            <vaadin-item>${i.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,r=this.remoteComboDataProvider(i.action);return n`
                        <vaadin-multi-select-combo-box
                            label="${a}"
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
                    `}if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.rendered||setTimeout(()=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}),n`
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
            `}renderMoneyField(e,t,a,s){if(!this.field)return n``;if(this.field.readOnly){const i=t;let r=i;return i&&i.locale&&i.currency?r=new Intl.NumberFormat(i.locale,{style:"currency",currency:i.currency}).format(i.value):r=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(i),n`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><div style="width: 186px; text-align: right;">${r}</div></vaadin-custom-field>`}return n`<mateu-money-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        .value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></mateu-money-field>`}renderStatusField(e,t,a,s){if(!this.field)return n``;const i=t;return n`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    ${i?n`<span theme="badge pill ${_a(i.type)}">${i.message}</span>`:n``}                    
                </vaadin-custom-field>
            `}renderRangeField(e,t,a,s){if(!this.field)return n``;const i=t;return n`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><ui5-range-slider start-value="${i?.from??0}" end-value="${i?.to??0}" 
                                   min="${this.field.sliderMin??0}" 
                                   max="${this.field.sliderMax??10}"
                                   step="${this.field.step||d}"
                                   @change="${r=>{const o=r.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{from:o.startValue,to:o.endValue},fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"
                                   style="min-width: 10rem;"
                ></ui5-range-slider></vaadin-custom-field>
            `}};oe.styles=R`
        ${yt}

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
  `;ke([v()],oe.prototype,"component",2);ke([v()],oe.prototype,"field",2);ke([v()],oe.prototype,"baseUrl",2);ke([v()],oe.prototype,"state",2);ke([v()],oe.prototype,"data",2);ke([v()],oe.prototype,"appState",2);ke([v()],oe.prototype,"appData",2);ke([v()],oe.prototype,"labelAlreadyRendered",2);ke([g()],oe.prototype,"colorPickerOpened",2);ke([g()],oe.prototype,"colorPickerValue",2);ke([g()],oe.prototype,"filteredIcons",2);ke([g()],oe.prototype,"navLinkOffset",2);oe=ke([I("mateu-field")],oe);var ft=(e=>(e.OnLoad="OnLoad",e.OnSuccess="OnSuccess",e.OnError="OnError",e.OnValueChange="OnValueChange",e.OnCustomEvent="OnCustomEvent",e.AutoSave="AutoSave",e))(ft||{}),Qn=Object.defineProperty,Pa=(e,t,a,s)=>{for(var i=void 0,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=o(t,a,i)||i);return i&&Qn(t,a,i),i};class wt extends ua{constructor(){super(...arguments),this.state={},this.data={},this.appData={},this.appState={},this.triggerOnLoad=()=>{const t=this.component;this.registerCustomEventListeners(),t.triggers?.filter(a=>a.type==ft.OnLoad).forEach(a=>{if((!a.condition||this._evalExpr(a.condition))&&!a.triggered){const i=a;i.triggered=!0;var s=i.times-1;i.timeoutMillis>0?this.scheduleOnload(i,s,this.id):this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(t,a,s)=>{if(s!=this.component?.id)return;const i=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,callbackToken:i},bubbles:!0,composed:!0}))},t.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=t=>{if(!(t instanceof CustomEvent))return;const a=t,i=(this.component.triggers??[]).filter(r=>r.type==ft.OnCustomEvent).filter(r=>r.eventName==a.type).filter(r=>r.source!=="COMPONENT"||a.detail?.__source===r.from);i.length!==0&&(i.some(r=>!r.source||r.source==="SELF")&&(t.stopPropagation(),t.preventDefault()),i.forEach(r=>{(!r.condition||this._evalExpr(r.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,parameters:a.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(t){return Vi(t,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(t){return Ys(t,this.state??{},this.data??{},this._interpolationExtra())}applyFragment(t){if(this.id==t.targetComponentId){if(t.component)if(ra.Add==t.action)this.component&&this.component.children?.push(t.component);else{if(this.callbackToken=de(),t.component?.type==ee.ServerSide)if(this.component){const s=this.component,i=t.component;s.actions=i.actions,s.type=i.type,s.rules=i.rules,s.triggers=i.triggers,s.serverSideType=i.serverSideType,s.route=i.route,s.initialData=i.initialData,s.validations=i.validations,s.cssClasses=i.cssClasses,s.slot=i.slot,s.style=i.style,s.children=i.children,(s.serverSideType!=i.serverSideType||s.id!=i.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=t.component,setTimeout(()=>this.triggerOnLoad());else{const s=[t.component];this.component&&(this.component.children=s)}t.action!==ra.ReplaceKeepData&&(this.state={},this.data={})}if(t.state&&(this.state={...this.state,...t.state}),t.data){for(const s in t.data){const i=t.data[s]?.page;i?.pageNumber>0&&this.data[s]&&this.data[s].page.content&&(i.content?i.content=[...this.data[s].page.content,...i.content]:i.content=[...this.data[s].page.content])}this.data={...this.data,...t.data}}this.registerCustomEventListeners();const a=K.getAfterRenderHook();a&&setTimeout(()=>a(this)),this.requestUpdate()}}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:a,name:s})=>a.removeEventListener(s,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(a=>a.type==ft.OnCustomEvent).forEach(a=>{const s=a.source==="DOCUMENT"||a.source==="COMPONENT"?document:this;s.addEventListener(a.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:s,name:a.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:t,name:a})=>t.removeEventListener(a,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}}Pa([v()],wt.prototype,"state");Pa([v()],wt.prototype,"data");Pa([v()],wt.prototype,"appData");Pa([v()],wt.prototype,"appState");const Zn={lon:0,lat:0},Ri=3,el=e=>{if(!e)return;const t=e.split(",").map(i=>i.trim());if(t.length!==2)return;const a=Number(t[0]),s=Number(t[1]);if(!(t[0]===""||t[1]===""||!Number.isFinite(a)||!Number.isFinite(s)))return{lon:s,lat:a}},tl=e=>{if(e==null||e.trim()==="")return Ri;const t=Number(e);return Number.isFinite(t)?t:Ri};var al=Object.defineProperty,il=Object.getOwnPropertyDescriptor,Oa=(e,t,a,s)=>{for(var i=s>1?void 0:s?il(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&al(t,a,i),i};let qt=class extends j{constructor(){super(...arguments),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){const e=++this.renderSeq,[{default:t},{default:a},{default:s},{default:i},{fromLonLat:r},{default:o}]=await Promise.all([be(()=>import("./vendor-ol.js").then(c=>c.M),[]),be(()=>import("./vendor-ol.js").then(c=>c.V),[]),be(()=>import("./vendor-ol.js").then(c=>c.T),[]),be(()=>import("./vendor-ol.js").then(c=>c.O),[]),be(()=>import("./vendor-ol.js").then(c=>c.p),[]),be(()=>import("./vendor-ol.js").then(c=>c.o),[])]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector("style[data-ol]")){const c=document.createElement("style");c.setAttribute("data-ol",""),c.textContent=o,this.shadowRoot.appendChild(c)}this.map&&(this.map.setTarget(void 0),this.map=void 0);const l=el(this.position)??Zn;this.map=new t({target:this.mapElement,layers:[new s({source:new i})],view:new a({center:r([l.lon,l.lat]),zoom:tl(this.zoom)})})}render(){return n`<div id="map"></div>`}};qt.styles=R`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `;Oa([v()],qt.prototype,"position",2);Oa([v()],qt.prototype,"zoom",2);Oa([Ye("#map")],qt.prototype,"mapElement",2);qt=Oa([I("mateu-map")],qt);const sl=typeof HTMLElement<"u"?HTMLElement:class{};class rl extends sl{static get observedAttributes(){return["content"]}#e;#t=0;get content(){return this.#e}set content(t){this.#e=t,this.#a()}attributeChangedCallback(t,a,s){this.content=s??void 0}connectedCallback(){this.style.display="block",this.#a()}async#a(){if(!this.isConnected)return;const t=this.#e??"",a=++this.#t,[{marked:s},{default:i}]=await Promise.all([be(()=>import("./vendor.js").then(r=>r.f),[]),be(()=>import("./vendor.js").then(r=>r.c),[])]);a===this.#t&&(this.innerHTML=i.sanitize(await s.parse(t),{CUSTOM_ELEMENT_HANDLING:{tagNameCheck:r=>!0}}))}}typeof customElements<"u"&&!customElements.get("mateu-markdown")&&customElements.define("mateu-markdown",rl);var ol=Object.defineProperty,nl=Object.getOwnPropertyDescriptor,jt=(e,t,a,s)=>{for(var i=s>1?void 0:s?nl(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&ol(t,a,i),i};const ll=e=>{const t=[];return e.color&&e.color!=="normal"&&e.color!=="none"&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle==="tertiaryInline"?"tertiary-inline":e.buttonStyle),e.size&&e.size!=="none"&&e.size!=="normal"&&t.push(e.size),t.length?t.join(" "):void 0},Pi=e=>e==="back"||e==="backToList"||!!e&&e.startsWith("cancel");let lt=class extends j{constructor(){super(...arguments),this.appState={},this.appData={},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.evalLabel=e=>ge(e,this.state,this.data),this.renderBtn=e=>{if((this.data??{})[e.actionId+".hidden"])return d;const t=this.evalLabel(e.label),a=K.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e.actionId));return a||n`
        <vaadin-button
                data-action-id="${e.id}"
                theme="${ll(e)||d}"
                @click="${()=>this.handleButtonClick(e.actionId)}"
                ?disabled="${e.disabled}"
        >${e.iconOnLeft?n`<vaadin-icon icon="${e.iconOnLeft}"></vaadin-icon>`:d}${t}${e.iconOnRight?n`<vaadin-icon icon="${e.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>
    `}}render(){const e=this.metadata;if(!e)return n``;const t=e.toolbar??[],a=t.filter(l=>Pi(l.actionId)),s=t.filter(l=>!Pi(l.actionId)),i=a.length>0&&s.length>0?n`<span class="toolbar-divider"></span>`:d,r=e.avatar||e.title||e.subtitle||e.kpis?.length>0||e.header?.length>0||t.length>0,o=e.level??0;return o>0?this.setAttribute("data-nested",""):this.removeAttribute("data-nested"),n`
            ${e.breadcrumbs&&e.breadcrumbs.length>0?n`
                <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: center;" class="breadcrumbs-bar">
                    ${e.breadcrumbs.map((l,c)=>n`
                        ${c>0?n`<span>/</span>`:d}
                        ${l.link?n`<vaadin-button theme="tertiary" @click="${()=>window.location.href=`${l.link}`}">${l.text}</vaadin-button>`:n`<span>${l.text}</span>`}
                    `)}
                </vaadin-horizontal-layout>
            `:d}
            ${e.noHeader?n`
                <vaadin-horizontal-layout theme="spacing">
                    ${e?.header?.map(l=>$(this,l,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${a.map(this.renderBtn)}
                    ${i}
                    ${s.map(this.renderBtn)}
                </vaadin-horizontal-layout>
            `:r?n`
                <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: center;" class="form-header">
                    ${e.avatar?$(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):d}
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        ${e?.title&&o==0?n`<h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ne(rt(e?.title,this.state??{},this.data??{}))}</h2>`:d}
                        ${e?.title&&o==1?n`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ne(rt(e?.title,this.state??{},this.data??{}))}</h3>`:d}
                        ${e?.title&&o==2?n`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ne(rt(e?.title,this.state??{},this.data??{}))}</h4>`:d}
                        ${e?.title&&o==3?n`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ne(rt(e?.title,this.state??{},this.data??{}))}</h5>`:d}
                        ${e?.title&&o>3?n`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ne(rt(e?.title,this.state??{},this.data??{}))}</h6>`:d}

                        ${e?.subtitle?n`<span style="display: inline-block; margin-block-end: 0.83em;">${ne(rt(e?.subtitle,this.state??{},this.data??{}))}</span>`:d}
                    </div>
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        ${e?.kpis?.map(l=>n`
                            <vaadin-vertical-layout style="align-items: center">
                                <div>${this.evalLabel(l.title)}</div>
                                <div>${ne(rt(l.text,this.state??{},this.data??{}))}</div>
                            </vaadin-vertical-layout>
                        `)}
                        ${e?.header?.map(l=>$(this,l,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${a.map(this.renderBtn)}
                        ${i}
                        ${s.map(this.renderBtn)}
                    </vaadin-horizontal-layout>
                </vaadin-horizontal-layout>
            `:d}
            ${e.badges&&e.badges.length>0?n`
                <vaadin-horizontal-layout style="padding-bottom: var(--lumo-space-s);">
                    ${e.badges.map(l=>Ar(l,this.state??{},this.data??{}))}
                </vaadin-horizontal-layout>
            `:d}
        `}};lt.styles=R`
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

        ${yt}
    `;jt([v()],lt.prototype,"metadata",2);jt([v()],lt.prototype,"baseUrl",2);jt([v()],lt.prototype,"state",2);jt([v()],lt.prototype,"data",2);jt([v()],lt.prototype,"appState",2);jt([v()],lt.prototype,"appData",2);lt=jt([I("mateu-content-header")],lt);var dl=Object.defineProperty,cl=Object.getOwnPropertyDescriptor,ha=(e,t,a,s)=>{for(var i=s>1?void 0:s?cl(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&dl(t,a,i),i};let It=class extends ua{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={}}render(){const e=this.component?.metadata;return n`
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
       `}};It.styles=R`
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
    `;ha([v()],It.prototype,"state",2);ha([v()],It.prototype,"data",2);ha([v()],It.prototype,"appState",2);ha([v()],It.prototype,"appData",2);It=ha([I("mateu-form")],It);var ul=Object.defineProperty,hl=Object.getOwnPropertyDescriptor,qe=(e,t,a,s)=>{for(var i=s>1?void 0:s?hl(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&ul(t,a,i),i};let $e=class extends j{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.pagesRequested=[],this.emptyArray=e=>!e||e.length==0,this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;if(this.metadata?.infiniteScrolling&&e.page>0){let s=!1;a&&a.content&&(a.content.length>=(e.page+1)*e.pageSize||a.content.length==a.totalElements)&&(t(a.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),a.totalElements),s=!0,this.grid&&this.grid.recalculateColumnWidths()),s||this.pagesRequested.find(i=>i==e.page)||(this.pagesRequested.push(e.page),this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:e,callback:()=>{this.data[this.id]?.page?.content&&(t(this.data[this.id].page.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),this.data[this.id].page.totalElements),this.grid&&this.grid.recalculateColumnWidths())}},bubbles:!0,composed:!0})))}else{const s=this.metadata?.infiniteScrolling?a?.totalElements:a?.content?.length??0;t(a?.content??[],s),this.grid&&this.grid.recalculateColumnWidths()}},this._onActionRequested=e=>{const t=e.detail,a=this.identifierFieldName;if(!a||!t.parameters||t.actionId?.startsWith("action-on-row-"))return;const s=t.parameters[a];s!==void 0&&(this.state._selectedId=String(s),this._applyCellPartNameGenerator(),this.grid?.requestContentUpdate())},this.tooltipGenerator=e=>{let t="";const{column:a,item:s}=e,i=this.metadata?.columns?.find(r=>r.metadata.id==a?.path);if(i?.metadata){const r=(i?.metadata).tooltipPath;r&&a&&s&&(t=s[r])}return t}}get identifierFieldName(){const e=this.metadata?.columns?.find(a=>a.metadata?.identifier);if(e)return e.metadata?.id;if(this.metadata?.columns?.find(a=>a.metadata?.id==="id"))return"id"}_applyCellPartNameGenerator(){if(!this.grid)return;const e=this.identifierFieldName,t=this.state?._selectedId??this.appState?._splitDetailId;e&&t!==void 0?this.grid.cellPartNameGenerator=(a,s)=>String(s.item[e])===String(t)?"selected-row":"":this.grid.cellPartNameGenerator=null}connectedCallback(){super.connectedCallback(),this.addEventListener("action-requested",this._onActionRequested)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("action-requested",this._onActionRequested)}updated(e){super.updated(e),this._applyCellPartNameGenerator(),this.grid?.clearCache(),this.grid?.recalculateColumnWidths(),this.pagesRequested=[]}render(){const e=this.data[this.id]?.page;let t="";this.metadata?.wrapCellContent&&(t+=" wrap-cell-content"),this.metadata?.compact&&(t+=" compact"),this.metadata?.noBorder&&(t+=" no-border"),this.metadata?.noRowBorder&&(t+=" no-row-borders"),this.metadata?.columnBorders&&(t+=" column-borders"),this.metadata?.rowStripes&&(t+=" row-stripes");const a=this.state[this.id+"_selected_items"]||[];return n`
            <vaadin-grid
                    .items="${e?.content}"
                    item-id-path="_rowNumber"
                    .selectedItems="${a}"
                    ?data-clickable-rows="${this.metadata?.detailPath&&!this.metadata?.useButtonForDetail}"
                    ?all-rows-visible="${this.metadata?.allRowsVisible}"
                    column-rendering="${this.metadata?.lazyColumnRendering?"lazy":d}"
                    ?column-reordering-allowed="${this.metadata?.columnReorderingAllowed}"
                    .dataProvider="${this.dataProvider}"
                    page-size="${this.metadata?.pageSize}"
                    multi-sort-on-shift-click
                    @selected-items-changed="${s=>{this.emptyArray(this.state[this.id+"_selected_items"])&&this.emptyArray(s.detail.value)||(this.state[this.id+"_selected_items"]=s.detail.value,this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0})))}}"
                    @active-item-changed="${A(this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?s=>{if(this.metadata?.detailPath){const i=s.detail.value;i?this.detailsOpenedItems=[i]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${A(this.metadata?.detailPath?Ui(s=>n`${$(this,s[this.metadata?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    theme="${t}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?n`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:d}
                ${this.metadata?.columns?.map(s=>ti(s,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}
                ${this.metadata?.useButtonForDetail?n`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${ot((s,{detailsOpened:i})=>n`
              <vaadin-button
                theme="tertiary icon"
                title="${i?"Collapse":"Expand"}"
                aria-label="Toggle details"
                aria-expanded="${i?"true":"false"}"
                @click="${()=>{this.detailsOpenedItems=i?this.detailsOpenedItems.filter(r=>r!==s):[...this.detailsOpenedItems,s]}}"
              >
                <vaadin-icon
                  .icon="${i?"lumo:angle-down":"lumo:angle-right"}"
                ></vaadin-icon>
              </vaadin-button>
            `,[])}
                    ></vaadin-grid-column>
                `:d}
                <span slot="empty-state">${Ct(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(s=>s.metadata.tooltipPath)?n`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:d}
            </vaadin-grid>
            <slot></slot>
       `}};$e.styles=R`
        ${yt}
        vaadin-grid[data-clickable-rows]::part(row) {
            cursor: pointer;
        }
        vaadin-grid[data-clickable-rows]::part(row):hover {
            background-color: var(--lumo-primary-color-10pct);
        }
        vaadin-grid::part(selected-row) {
            background-color: var(--lumo-primary-color-10pct);
        }
  `;qe([v()],$e.prototype,"id",2);qe([v()],$e.prototype,"metadata",2);qe([v()],$e.prototype,"baseUrl",2);qe([v()],$e.prototype,"state",2);qe([v()],$e.prototype,"data",2);qe([v()],$e.prototype,"appState",2);qe([v()],$e.prototype,"appData",2);qe([v()],$e.prototype,"emptyStateMessage",2);qe([g()],$e.prototype,"detailsOpenedItems",2);qe([Ye("vaadin-grid")],$e.prototype,"grid",2);$e=qe([I("mateu-table")],$e);var pl=Object.defineProperty,ml=Object.getOwnPropertyDescriptor,Me=(e,t,a,s)=>{for(var i=s>1?void 0:s?ml(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&pl(t,a,i),i};let ye=class extends j{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.panelOpened=!1,this.draftText="",this.openPanel=()=>{this.panelOpened||this.filters.length===0||(this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1,this.activeFilter=void 0},this.clearAllFilters=()=>{const e=this.filters.flatMap(a=>this.isRangeFilter(a)?[`${a.fieldId}_from`,`${a.fieldId}_to`]:[a.fieldId]),t={searchText:void 0};e.forEach(a=>{t[a]=void 0}),this.state={...this.state,...t},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:e},bubbles:!0,composed:!0})),this.requestSearch()},this.keepFocus=e=>e.preventDefault()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get filters(){return this.metadata?.filters??[]}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}requestSearch(){this.closePanel(),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))}emitValueChanged(e,t){this.state={...this.state,[e]:t},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:e},bubbles:!0,composed:!0}))}applyFilter(e,t){this.emitValueChanged(e,t),this.requestSearch()}removeChip(e){const t=this.filters.find(a=>a.fieldId===e);t&&this.isRangeFilter(t)?(this.emitValueChanged(`${e}_from`,void 0),this.emitValueChanged(`${e}_to`,void 0)):this.emitValueChanged(e,e==="searchText"?"":void 0),this.requestSearch()}commitText(e){this.emitValueChanged("searchText",e.value),this.draftText="",e.value="",this.requestSearch()}isBooleanFilter(e){return e.dataType==="boolean"||e.dataType==="bool"||e.stereotype==="checkbox"||e.stereotype==="toggle"}isNumericFilter(e){return["integer","decimal","number","money"].includes(e.dataType??"")}isRangeFilter(e){return e.stereotype==="dateRange"||e.stereotype==="numberRange"}isMultiFilter(e){return e.stereotype==="multiSelect"}hasOptions(e){return(e.options?.length??0)>0}multiValues(e){const t=this.state[e.fieldId];return Array.isArray(t)?t.map(String):typeof t=="string"&&t!==""?t.split(",").map(a=>a.trim()).filter(a=>a):[]}rangeBound(e,t){const a=this.state[`${e.fieldId}_${t}`];return a==null?"":String(a)}isSet(e){if(this.isRangeFilter(e))return this.rangeBound(e,"from")!==""||this.rangeBound(e,"to")!=="";if(this.isMultiFilter(e))return this.multiValues(e).length>0;const t=this.state[e.fieldId];return t!=null&&t!==""&&!Number.isNaN(t)}getFilterDisplayValue(e,t){if(e.options?.length){const a=e.options.find(s=>s.value===String(t));if(a)return a.label??a.value}return typeof t=="boolean"?t?"Yes":"No":String(t)}conditionDisplay(e){if(this.isRangeFilter(e)){const t=this.rangeBound(e,"from"),a=this.rangeBound(e,"to");return t&&a?`${t} – ${a}`:t?`≥ ${t}`:`≤ ${a}`}return this.isMultiFilter(e)?this.multiValues(e).map(t=>this.getFilterDisplayValue(e,t)).join(", "):this.getFilterDisplayValue(e,this.state[e.fieldId])}labelOf(e){return ge(e.label,this.state,this.data)||e.fieldId}panelRow(e,t,a="panel-row"){return n`
            <div class="${a}" @mousedown="${this.keepFocus}" @click="${t}">${e}</div>`}renderRangeWidget(e){const t=e.stereotype==="numberRange"?"number":e.dataType==="dateTime"?"datetime-local":e.dataType==="time"?"time":"date",a=i=>{const r=i.closest(".panel-input-row"),o=r.querySelector("input.range-from").value,l=r.querySelector("input.range-to").value;this.emitValueChanged(`${e.fieldId}_from`,o===""?void 0:o),this.emitValueChanged(`${e.fieldId}_to`,l===""?void 0:l),this.requestSearch()},s=i=>{i.key==="Enter"&&a(i.target),i.key==="Escape"&&this.closePanel()};return n`
            <div class="panel-input-row">
                <input class="range-from" type="${t}" placeholder="From"
                       .value="${this.rangeBound(e,"from")}"
                       @mousedown="${i=>i.stopPropagation()}"
                       @keydown="${s}"/>
                <span class="range-separator" aria-hidden="true">–</span>
                <input class="range-to" type="${t}" placeholder="To"
                       .value="${this.rangeBound(e,"to")}"
                       @mousedown="${i=>i.stopPropagation()}"
                       @keydown="${s}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${i=>a(i.target)}">Apply</button>
            </div>`}renderMultiWidget(e){const t=this.multiValues(e),a=s=>{const i=t.includes(s)?t.filter(r=>r!==s):[...t,s];this.emitValueChanged(e.fieldId,i.length>0?i:void 0),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))};return n`${(e.options??[]).map(s=>this.panelRow(n`
            <span class="multi-check ${t.includes(s.value)?"multi-check--on":""}"
                  aria-hidden="true">${t.includes(s.value)?"✓":""}</span>
            ${s.label??s.value}
        `,()=>a(s.value)))}`}renderActiveFilterWidget(e){if(this.isRangeFilter(e))return this.renderRangeWidget(e);if(this.isMultiFilter(e))return this.renderMultiWidget(e);if(this.hasOptions(e))return n`${e.options.map(s=>this.panelRow(s.label??s.value,()=>this.applyFilter(e.fieldId,s.value)))}`;if(this.isBooleanFilter(e))return n`
                ${this.panelRow("Yes",()=>this.applyFilter(e.fieldId,!0))}
                ${this.panelRow("No",()=>this.applyFilter(e.fieldId,!1))}`;const t=this.isNumericFilter(e),a=s=>{s.value!==""&&this.applyFilter(e.fieldId,t?Number(s.value):s.value)};return n`
            <div class="panel-input-row">
                <input type="${t?"number":"text"}"
                       placeholder="${e.placeholder||this.labelOf(e)}"
                       @mousedown="${s=>s.stopPropagation()}"
                       @keydown="${s=>{s.key==="Enter"&&a(s.target),s.key==="Escape"&&this.closePanel()}}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${s=>a(s.target.previousElementSibling)}">Apply</button>
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
                </div>
                ${this.renderPanel()}
            </div>
            <slot></slot>
        `}};ye.styles=R`
        ${yt}
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
    `;Me([v()],ye.prototype,"metadata",2);Me([v()],ye.prototype,"baseUrl",2);Me([g()],ye.prototype,"state",2);Me([g()],ye.prototype,"data",2);Me([v()],ye.prototype,"appState",2);Me([v()],ye.prototype,"appData",2);Me([v({type:Boolean})],ye.prototype,"searchOnly",2);Me([g()],ye.prototype,"panelOpened",2);Me([g()],ye.prototype,"activeFilter",2);Me([g()],ye.prototype,"draftText",2);ye=Me([I("mateu-filter-bar")],ye);var vl=Object.defineProperty,fl=Object.getOwnPropertyDescriptor,pa=(e,t,a,s)=>{for(var i=s>1?void 0:s?fl(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&vl(t,a,i),i};let _t=class extends j{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.totalPages=0}updated(e){super.updated(e),(e.has("totalElements")||e.has("pageSize"))&&(this.totalPages=Math.ceil(this.totalElements/this.pageSize))}dispatch(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return d;const e=this.totalPages>1,t=this.pageNumber,a=t===0,s=t>=this.totalPages-1;return n`
            <vaadin-horizontal-layout theme="spacing" style="align-items: center; flex-wrap: wrap;">
                ${e?n`
                    <vaadin-button theme="tertiary icon" title="First page" ?disabled="${a}"
                        @click="${()=>this.dispatch(0)}" data-testid="page-first">
                        <vaadin-icon icon="vaadin:angle-double-left"></vaadin-icon>
                    </vaadin-button>
                    <vaadin-button theme="tertiary icon" title="Previous page" ?disabled="${a}"
                        @click="${()=>this.dispatch(t-1)}" data-testid="page-prev">
                        <vaadin-icon icon="vaadin:angle-left"></vaadin-icon>
                    </vaadin-button>
                    <span class="page-indicator">Page ${t+1} of ${this.totalPages}</span>
                    <vaadin-button theme="tertiary icon" title="Next page" ?disabled="${s}"
                        @click="${()=>this.dispatch(t+1)}" data-testid="page-next">
                        <vaadin-icon icon="vaadin:angle-right"></vaadin-icon>
                    </vaadin-button>
                    <vaadin-button theme="tertiary icon" title="Last page" ?disabled="${s}"
                        @click="${()=>this.dispatch(this.totalPages-1)}" data-testid="page-last">
                        <vaadin-icon icon="vaadin:angle-double-right"></vaadin-icon>
                    </vaadin-button>
                    <span class="separator"></span>
                `:d}
                <span class="total-count">${this.totalElements} item${this.totalElements===1?"":"s"}</span>
                <slot></slot>
            </vaadin-horizontal-layout>
        `}};_t.styles=R`
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
    `;pa([v()],_t.prototype,"totalElements",2);pa([v()],_t.prototype,"pageSize",2);pa([v()],_t.prototype,"pageNumber",2);pa([g()],_t.prototype,"totalPages",2);_t=pa([I("mateu-pagination")],_t);var bl=Object.defineProperty,gl=Object.getOwnPropertyDescriptor,Re=(e,t,a,s)=>{for(var i=s>1?void 0:s?gl(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&bl(t,a,i),i};let ce=class extends j{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;t(a?.content??[],a?.content?.length??0)},this.respondToVisibility=(e,t)=>{var a={root:document.documentElement},s=new IntersectionObserver(i=>{i.forEach(r=>{t(r.intersectionRatio>0)})},a);s.observe(e)},this.keepAsking=!1,this.askToUpper=()=>{const e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?si(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?n`<vaadin-card
        >
                ${e.title?n`
                    <div slot="title">${e.title}</div>
                `:d}
                ${e.subtitle?n`
                    <div slot="subtitle">${e.subtitle}</div>
                `:d}
                ${e.content?n`
                    <div>${e.content}</div>
                `:d}
                ${e.status?n`
                    <span slot="header-suffix" theme="badge ${_a(e.status.type)}">${e.status.message}</span>
                `:d}
                ${e.image?n`
                    <img slot="media" src="${e.image}" alt="" />
                `:d}
                
        </vaadin-card>`:n`${e}`,this.hasMore=!1,this.clickedOnCard=e=>{this.state[this.id+"_selected_items"]=[e],this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0}))}}updated(e){super.updated(e);const t=this.data[this.id]?.page;this.hasMore=t?.content?.length<t?.totalElements}firstUpdated(e){super.firstUpdated(e),this.respondToVisibility(this.askForMore,t=>{this.keepAsking=t,t&&this.askToUpper()})}render(){const e=this.data[this.id]?.page;return n`
            <div class="card-container">
                ${e?.content?.map(t=>n`<div @click="${()=>this.clickedOnCard(t)}" class="car-container">${this.renderItem(t)}</div>`)}
                <div id="ask-for-more" style="display: ${this.hasMore?"flex":"none"}; width: 100%; justify-content: center; padding: var(--lumo-space-m); color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Loading more…</div>
            </div>

            <slot></slot>
       `}};ce.styles=R`
        ${yt}
        
        .card-container {
            display: flex; 
            width: 100%; 
            flex-wrap: wrap; 
            gap: 10px;
        }

        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }

    `;Re([v()],ce.prototype,"id",2);Re([v()],ce.prototype,"metadata",2);Re([v()],ce.prototype,"baseUrl",2);Re([v()],ce.prototype,"state",2);Re([v()],ce.prototype,"data",2);Re([v()],ce.prototype,"appState",2);Re([v()],ce.prototype,"appData",2);Re([v()],ce.prototype,"emptyStateMessage",2);Re([g()],ce.prototype,"keepAsking",2);Re([Ye("#ask-for-more")],ce.prototype,"askForMore",2);Re([g()],ce.prototype,"hasMore",2);ce=Re([I("mateu-card-list")],ce);var cs=(e=>(e.none="none",e.success="success",e.error="error",e.warning="warning",e.contrast="contrast",e.normal="normal",e))(cs||{}),us=(e=>(e.primary="primary",e.secondary="secondary",e.tertiary="tertiary",e.tertiaryInline="tertiaryInline",e))(us||{});const $l=76;function Oi(e){if(e.weight!=null)return e.weight;const t=e.stereotype??"";if(t==="icon")return 1;if(t==="image")return 4;if(t==="html"||t==="richText"||t==="markdown"||t==="textarea")return 5;if(t==="link")return 2.5;if(t==="combobox"||t==="select")return 2;const a=e.dataType??"";return a==="bool"?1:a==="status"||a==="integer"?1.5:a==="number"||a==="date"||a==="money"?2:a==="dateTime"||a==="dateRange"?2.5:3}function yl(e,t){if(e.length===0)return"table";const a=e.reduce((c,u)=>c+Oi(u),0),s=t/$l,i=a/s;if(i<=1)return"table";const r=e.filter(c=>c.identifier||(c.priority??Number.MAX_SAFE_INTEGER)<=2),o=r.reduce((c,u)=>c+Oi(u),0);return i>1.6||e.length>10?"masterDetail":r.length>0&&o<=8?"list":e.some(c=>c.stereotype==="image"||c.stereotype==="html")||r.length===0&&e.length>=4&&e.length<=8?"cards":"masterDetail"}function xl(e){return e.filter(t=>t.identifier||(t.priority??Number.MAX_SAFE_INTEGER)<=2).sort((t,a)=>(t.priority??Number.MAX_SAFE_INTEGER)-(a.priority??Number.MAX_SAFE_INTEGER))}var wl=Object.defineProperty,kl=Object.getOwnPropertyDescriptor,Ue=(e,t,a,s)=>{for(var i=s>1?void 0:s?kl(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&wl(t,a,i),i};const Cl={asc:"ascending",desc:"descending"};let xe=class extends j{constructor(){super(...arguments),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this.search=()=>{const e=this.component.metadata;this.state={...this.state,size:e.pageSize,page:0,crud_selected_items:[]},this._syncStateToUrl(e),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}}},bubbles:!0,composed:!0}))},this.notify=e=>{na.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.handleSearchRequested=e=>{this.state={...this.state,crud_selected_items:[]};const t=this.component.metadata;this._syncStateToUrl(t),!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}},callback:e},bubbles:!0,composed:!0}))},this.fetchMoreElements=e=>{const{params:t,callback:a}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(a)},this.directionChanged=e=>{const t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(a=>({fieldId:a.__data.path,direction:a.__data.direction?Cl[a.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForComponentId=void 0,this.evalLabel=e=>ge(e,this.state,this.data),this.handleToolbarButtonClick=e=>{if(e==="import"){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{const t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"process-import",parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get cols(){return this.component?.metadata?.columns?.map(t=>t.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.component?.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":yl(this.cols,this.availableWidthPx):t}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}_filterIds(e){return new Set(["searchText",...(e.filters??[]).flatMap(t=>t.stereotype==="dateRange"||t.stereotype==="numberRange"?[`${t.fieldId}_from`,`${t.fieldId}_to`]:[t.fieldId])])}_syncStateToUrl(e){const t=this._filterIds(e),a=new URLSearchParams(window.location.search);t.forEach(l=>a.delete(l)),a.delete("page"),a.delete("sort"),t.forEach(l=>{const c=this.state[l];c!=null&&c!==""&&a.set(l,String(c))});const s=this.state.page;s&&s>0&&a.set("page",String(s));const i=this.state.sort;if(i&&i.length>0){const l=i.filter(c=>c.fieldId&&c.direction).map(c=>`${c.fieldId}:${c.direction}`).join(",");l&&a.set("sort",l)}const r=a.toString(),o=r?`${window.location.pathname}?${r}`:window.location.pathname;window.location.pathname+window.location.search!==o&&history.replaceState(null,"",o)}_initStateFromUrl(e,t){const a=new URLSearchParams(window.location.search),s=this._filterIds(e),i={...t};a.forEach((l,c)=>{s.has(c)&&(i[c]=l)});const r=a.get("page");if(r!==null){const l=parseInt(r,10);!isNaN(l)&&l>0&&(i.page=l)}const o=a.get("sort");if(o){const l=o.split(",").map(c=>{const[u,h]=c.split(":");return u&&h?{fieldId:u,direction:h}:null}).filter(Boolean);l.length>0&&(i.sort=l)}return i}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}updated(e){if(super.updated(e),e.has("component")){const t=this.component?.id;if(t!==this._initializedForComponentId){this._initializedForComponentId=t;const a=this.component?.metadata,s=a.initialPage&&a.initialPage>0?a.initialPage:0;this.state=this._initStateFromUrl(a,{...this.state,size:a.pageSize,page:s,sort:[]}),(this.state.page!==s||this.state.sort?.length>0||[...this._filterIds(a)].some(r=>this.state[r]!=null))&&this.handleSearchRequested(void 0)}}}render(){const e=k=>{const P=[];return k.color&&k.color!==cs.normal&&P.push(k.color),k.buttonStyle&&P.push(k.buttonStyle===us.tertiaryInline?"tertiary-inline":k.buttonStyle),P.length?P.join(" "):void 0},t=k=>k==="back"||k==="backToList"||!!k&&k.startsWith("cancel"),a=k=>{const P=K.get()?.renderToolbarButton?.(k,this.evalLabel(k.label),()=>this.handleToolbarButtonClick(k.actionId));return P||n`
                <vaadin-button
                        data-action-id="${k.id}"
                        theme="${e(k)||d}"
                        @click="${()=>this.handleToolbarButtonClick(k.actionId)}"
                >${this.evalLabel(k.label)}</vaadin-button>
            `};if(!this.component)return n`no component`;const s=this.component.metadata;s.serverSideOrdering=!0;const i=s?.toolbar??[],r=i.filter(k=>t(k.actionId)),o=i.filter(k=>!t(k.actionId)),l=r.length>0&&o.length>0,c=!!s?.title||!!s?.subtitle||i.length>0,u=this.effectiveGridLayout,h=this.cols,p=xl(h),f=this.data[this.id]?.page?.content??[],y=this.state[this.component?.id]?.emptyStateMessage,w=(k,P)=>{const E=P[k.id];if(E==null)return n``;if(k.dataType==="status"){const H=_a(E.type);return n`<span theme="badge pill ${H}">${E.message}</span>`}return k.dataType==="bool"?n`${E?"✓":"✗"}`:typeof E=="object"?n`${E.label??E.name??E.message??""}`:n`${E}`},x=()=>{const k=this.identifierFieldName,P=this.state._selectedId??this.appState?._splitDetailId,E=p.find(T=>T.identifier)??p[0],H=T=>T.dataType==="action"||T.dataType==="actionGroup"||T.dataType==="menu"||T.stereotype==="button",Be=p.filter(T=>T!==E&&!H(T)),je=h.filter(T=>H(T)),te=(T,W,se)=>{T.stopPropagation(),T.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:W,parameters:{_clickedRow:se}},bubbles:!0,composed:!0}))},at=T=>{const W=[];for(const se of je){const z=T[se.id];if(se.dataType==="action"){const D=z?.methodNameInCrud?z:T.action?.methodNameInCrud?T.action:{methodNameInCrud:se.id,label:se.label,icon:null};W.push(n`
                            <vaadin-button theme="tertiary small" title="${D.label||d}"
                                @click="${C=>te(C,"action-on-row-"+D.methodNameInCrud,T)}">
                                ${D.icon?n`<vaadin-icon icon="${D.icon}"></vaadin-icon>`:d}
                                ${D.label??d}
                            </vaadin-button>`)}else(se.dataType==="actionGroup"||se.dataType==="menu")&&(z?.actions??[]).forEach(C=>W.push(n`
                            <vaadin-button theme="tertiary small" title="${C.label||d}"
                                @click="${G=>te(G,"action-on-row-"+C.methodNameInCrud,T)}">
                                ${C.icon?n`<vaadin-icon icon="${C.icon}"></vaadin-icon>`:d}
                                ${C.label??d}
                            </vaadin-button>`))}return W.length?n`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${W}
                    </div>`:d};return n`
                <vaadin-list-box style="width: 100%;">
                    ${f.length===0?n`<vaadin-item disabled>${Ct(y)}</vaadin-item>`:d}
                    ${f.map(T=>n`
                        <vaadin-item
                            ?selected="${k&&P!==void 0&&String(T[k])===String(P)}"
                            @click="${()=>{k&&T[k]!==void 0&&(this.state={...this.state,_selectedId:String(T[k])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:T},bubbles:!0,composed:!0}))}}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${E?T[E.id]??"":""}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${Be.map(W=>n`<span>${W.label}: ${w(W,T)}</span>`)}
                            </div>
                            ${at(T)}
                        </vaadin-item>
                    `)}
                </vaadin-list-box>`},_=(k,P,E)=>{const H=this.identifierFieldName;H&&E[H]!==void 0&&(this.state={...this.state,_selectedId:String(E[H])}),k.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:P,parameters:E},bubbles:!0,composed:!0}))},U=()=>{const k=this.identifierFieldName,P=this.state._selectedId??this.appState?._splitDetailId,E=h.slice(0,6),H=E.filter(C=>C.stereotype==="image"),Be=E.find(C=>C.identifier)??E[0],je=C=>!!C.actionId,te=C=>C.dataType==="action"||C.dataType==="actionGroup"||C.dataType==="menu"||C.stereotype==="button",at=E.find(C=>C.id==="select"&&C.dataType==="action"),T=!!at,W=E.filter(C=>C!==Be&&!H.includes(C)&&!je(C)&&!te(C)),se=E.filter(C=>te(C)&&!(T&&C===at)),z=(C,G,We)=>{C.stopPropagation(),C.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:G,parameters:{_clickedRow:We}},bubbles:!0,composed:!0}))},D=C=>{const G=[];for(const We of se){const b=C[We.id];if(We.dataType==="action"){const S=b?.methodNameInCrud?b:C.action?.methodNameInCrud?C.action:{methodNameInCrud:We.id,label:We.label,icon:null};G.push(n`
                            <vaadin-button theme="tertiary" title="${S.label||d}"
                                @click="${O=>z(O,"action-on-row-"+S.methodNameInCrud,C)}">
                                ${S.icon?n`<vaadin-icon icon="${S.icon}"></vaadin-icon>`:d}
                                ${S.label??d}
                            </vaadin-button>`)}else(We.dataType==="actionGroup"||We.dataType==="menu")&&(b?.actions??[]).forEach(O=>G.push(n`
                            <vaadin-button theme="tertiary" title="${O.label||d}"
                                @click="${F=>z(F,"action-on-row-"+O.methodNameInCrud,C)}">
                                ${O.icon?n`<vaadin-icon icon="${O.icon}"></vaadin-icon>`:d}
                                ${O.label??d}
                            </vaadin-button>`))}return G.length?n`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${G}
                    </div>`:d};return n`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${f.length===0?n`<div style="grid-column: 1 / -1;">${Ct(y)}</div>`:d}
                    ${f.map(C=>n`
                        <vaadin-card
                            clickable
                            ?data-selected="${k&&P!==void 0&&String(C[k])===String(P)}"
                            style="cursor: pointer;"
                            @click="${G=>T?z(G,"action-on-row-select",C):_(G.target,"view",C)}"
                        >
                            ${H.length?n`<img slot="media" src="${C[H[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover;" />`:d}
                            ${Be?n`<div slot="title">${C[Be.id]??""}</div>`:d}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${W.map(G=>n`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${G.label}</span>
                                        <span>${w(G,C)}</span>
                                    </div>
                                `)}
                            </div>
                            ${D(C)}
                        </vaadin-card>
                    `)}
                </div>`},Y=()=>{const k=p.find(E=>E.identifier)??p[0],P=p.filter(E=>E!==k);return n`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <vaadin-list-box style="width: 100%;">
                            ${f.length===0?n`<vaadin-item disabled>${Ct(y)}</vaadin-item>`:d}
                            ${f.map(E=>n`
                                <vaadin-item
                                    ?selected="${this.selectedItem===E}"
                                    @click="${()=>{this.selectedItem=E}}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${k?E[k.id]??"":""}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${P.map(H=>n`${w(H,E)} `)}
                                    </div>
                                </vaadin-item>
                            `)}
                        </vaadin-list-box>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?n`
                            <vaadin-form-layout>
                                ${h.map(E=>n`
                                    <vaadin-text-field
                                        label="${E.label}"
                                        .value="${String(this.selectedItem[E.id]??"")}"
                                        readonly
                                    ></vaadin-text-field>
                                `)}
                            </vaadin-form-layout>
                        `:n`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},q=()=>{const k=this.identifierFieldName,P=this.state._selectedId??this.appState?._splitDetailId,E=h[0],H=h.slice(1),Be=!!E?.actionId,je=z=>(z??[]).map(D=>{const C=Array.isArray(D.children)?D.children:[];return C.length>0?{...D,children:je(C)}:{...D,children:void 0}}),te=je(f),at=(z,D)=>{const C=z.parentItem?z.parentItem.children??[]:te;D(C,C.length)},T=(z,D)=>{for(const C of z??[]){if(k&&String(C[k])===D)return C;const G=T(C.children,D);if(G)return G}},W=k&&P!==void 0?T(te,String(P)):void 0,se=(z,D,C)=>{z.stopPropagation(),k&&D[k]!==void 0&&(this.state={...this.state,_selectedId:String(D[k])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:C,parameters:D},bubbles:!0,composed:!0}))};return n`
                <vaadin-grid
                    style="width: 100%;"
                    all-rows-visible
                    .itemHasChildrenPath="${"children"}"
                    .itemIdPath="${k??"id"}"
                    .dataProvider="${at}"
                    .selectedItems="${W?[W]:[]}"
                >
                    ${E?n`<vaadin-grid-tree-column path="${E.id}" header="${E.label??d}" flex-grow="1"></vaadin-grid-tree-column>`:d}
                    ${Be?n`
                    <vaadin-grid-column width="6rem" flex-grow="0" text-align="end" ${ot(z=>z?.viewable===!1?d:n`
                        <vaadin-button theme="tertiary small" @click="${D=>se(D,z,"view")}">View</vaadin-button>
                    `,[])}></vaadin-grid-column>`:d}
                    ${H.map(z=>z.id==="select"?n`<vaadin-grid-column width="7rem" flex-grow="0" text-align="end" header="${z.label??d}" ${ot(D=>n`
                            <vaadin-button theme="tertiary small" @click="${C=>{C.stopPropagation(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-select",parameters:{_clickedRow:D}},bubbles:!0,composed:!0}))}}">Select</vaadin-button>
                        `,[])}></vaadin-grid-column>`:n`<vaadin-grid-column path="${z.id}" header="${z.label??d}" auto-width></vaadin-grid-column>`)}
                    <span slot="empty-state">${Ct(y)}</span>
                </vaadin-grid>`},X=K.get()?.rendersCrudLayouts?.()===!0,Ce=n`
            ${s.infiniteScrolling?n`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:d}
            ${!X&&u==="list"?x():!X&&u==="cards"?s.contentHeight?n`
                <vaadin-scroller style="width: 100%; height: ${s.contentHeight};">
                    ${U()}
                </vaadin-scroller>
            `:U():!X&&u==="masterDetail"?Y():!X&&u==="tree"?q():K.get()?.renderTableComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,tt=s.infiniteScrolling?d:K.get()?.renderPagination(this,this.component),Lt=n`
            <vaadin-dialog
                .opened="${this.showImportDialog}"
                header-title="Import"
                @opened-changed="${k=>{this.showImportDialog=k.detail.value}}"
                ${Ea(()=>n`
                    <vaadin-upload
                        target="/upload"
                        max-files="1"
                        @upload-success="${this.handleImportUploadSuccess}"
                    ></vaadin-upload>
                `,[this.showImportDialog])}
                ${Qa(()=>n`
                    <vaadin-button @click="${()=>{this.showImportDialog=!1}}">Cancel</vaadin-button>
                `,[])}
            ></vaadin-dialog>
        `;return this.standalone?n`
                ${Lt}
                <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); width: 100%; box-sizing: border-box; padding: var(--lumo-space-m); display: flex; flex-direction: column;">
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
                    <div style="flex-shrink: 0;">${K.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                    <div style="flex: 1; overflow-y: auto; min-height: 0;">${Ce}</div>
                    <div style="flex-shrink: 0;">${tt}</div>
                </div>
            `:n`
            ${Lt}
            ${c?n`
                    <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m);">
                        <div style="flex: 1; min-width: 0;">
                            ${s?.title?n`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(s.title)}</h2>
                            `:d}
                            ${s?.subtitle?n`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(s.subtitle)}</span>
                            `:d}
                        </div>
                        ${r.map(k=>a(k))}
                        ${l?n`<span class="toolbar-divider"></span>`:d}
                        ${o.map(k=>a(k))}
                        <slot></slot>
                    </vaadin-horizontal-layout>
                `:d}
            <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); padding: var(--lumo-space-m); display: flex; flex-direction: column;">
                <div style="flex-shrink: 0;">${K.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                <div style="flex: 1; overflow-y: auto; min-height: 0;">${Ce}</div>
                <div style="flex-shrink: 0;">${tt}</div>
            </div>
        `}createRenderRoot(){return K.mustUseShadowRoot()?super.createRenderRoot():this}};xe.styles=R`
        ${yt}
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
    `;Ue([v()],xe.prototype,"component",2);Ue([v()],xe.prototype,"baseUrl",2);Ue([v({type:Boolean})],xe.prototype,"standalone",2);Ue([v()],xe.prototype,"state",2);Ue([v()],xe.prototype,"data",2);Ue([v()],xe.prototype,"appState",2);Ue([v()],xe.prototype,"appData",2);Ue([g()],xe.prototype,"showImportDialog",2);Ue([g()],xe.prototype,"availableWidthPx",2);Ue([g()],xe.prototype,"selectedItem",2);xe=Ue([I("mateu-table-crud")],xe);var Sl=Object.defineProperty,El=Object.getOwnPropertyDescriptor,ja=(e,t,a,s)=>{for(var i=s>1?void 0:s?El(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Sl(t,a,i),i};let Mt=class extends j{constructor(){super(...arguments),this.notificationOpened=!1,this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1,this.error=e.detail.reason,this.openNotification()},this.openNotification=()=>{this.notificationOpened=!0},this.closeNotification=()=>{this.notificationOpened=!1},this.notificationRenderer=()=>n`
    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
      <div>${this.error?.message??String(this.error)}</div>
      <vaadin-button theme="tertiary-inline" @click="${this.closeNotification}" aria-label="Close">
        <vaadin-icon icon="lumo:cross"></vaadin-icon>
      </vaadin-button>
    </vaadin-horizontal-layout>
  `}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-called-event",this.fetchStarted),this.addEventListener("backend-succeeded-event",this.fetchFinished),this.addEventListener("backend-cancelled-event",this.fetchFailed),this.addEventListener("backend-failed-event",this.fetchFailed)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-succeeded-event",this.fetchStarted),this.removeEventListener("backend-succeeded-event",this.fetchFinished),this.removeEventListener("backend-cancelled-event",this.fetchFailed),this.removeEventListener("backend-failed-event",this.fetchFailed)}render(){return n`<div class="loader-container"><vaadin-vertical-layout>
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
                ${qi(this.notificationRenderer,[])}
        ></vaadin-notification>`}};Mt.styles=R`
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
  `;ja([g()],Mt.prototype,"loading",2);ja([g()],Mt.prototype,"notificationOpened",2);ja([g()],Mt.prototype,"error",2);Mt=ja([I("mateu-api-caller")],Mt);var Il=Object.defineProperty,_l=Object.getOwnPropertyDescriptor,Ze=(e,t,a,s)=>{for(var i=s>1?void 0:s?_l(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Il(t,a,i),i};let _e=class extends j{constructor(){super(...arguments),this.message="This website uses cookies.",this.dismiss="Ok. Thanks :).",this.learnMore="Learn more",this.learnMoreLink="https://cookiesandyou.com/",this.showLearnMore=!0,this.position="top",this.cookieName="mateu-cookieconsent"}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement("style"),this._css.innerText=".cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}",document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){const e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){const e=this.popup;e&&(e.classList.remove("cc-invisible"),e.style.display="")}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:"#000"},button:{background:"rgba(22, 118, 243, 0.95)",hover:"rgba(22, 118, 243, 1)"}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});const e=this.popup;if(e){e.setAttribute("role","alert");const t=e.querySelector("a.cc-btn");t?.addEventListener("keydown",a=>{const r=a.keyCode||a.which;(r===32||r===13)&&t.click()})}}render(){return n`
       `}};_e.styles=R`
  `;Ze([v()],_e.prototype,"message",2);Ze([v()],_e.prototype,"dismiss",2);Ze([v()],_e.prototype,"learnMore",2);Ze([v()],_e.prototype,"learnMoreLink",2);Ze([v()],_e.prototype,"showLearnMore",2);Ze([v()],_e.prototype,"position",2);Ze([v()],_e.prototype,"cookieName",2);Ze([g()],_e.prototype,"_css",2);Ze([Ye('[aria-label="cookieconsent"]')],_e.prototype,"popup",2);_e=Ze([I("mateu-cookie-consent")],_e);var Tl=Object.defineProperty,Rl=Object.getOwnPropertyDescriptor,hs=(e,t,a,s)=>{for(var i=s>1?void 0:s?Rl(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Tl(t,a,i),i};let ka=class extends j{constructor(){super(...arguments),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener("value-changed",this.redispatchEvent),this.addEventListener("data-changed",this.redispatchEvent),this.addEventListener("action-requested",this.redispatchEvent),this.addEventListener("server-side-action-requested",this.redispatchEvent),this.addEventListener("route-changed",this.redispatchEvent),this.addEventListener("close-modal-requested",this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("value-changed",this.redispatchEvent),this.removeEventListener("data-changed",this.redispatchEvent),this.removeEventListener("action-requested",this.redispatchEvent),this.removeEventListener("server-side-action-requested",this.redispatchEvent),this.removeEventListener("route-changed",this.redispatchEvent)}render(){return n`<slot></slot>`}};ka.styles=R`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `;hs([v()],ka.prototype,"target",2);ka=hs([I("mateu-event-interceptor")],ka);var Pl=Object.defineProperty,Ol=Object.getOwnPropertyDescriptor,ps=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ol(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Pl(t,a,i),i};let Ca=class extends wt{constructor(){super(...arguments),this.opened=!0,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),500)}}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}render(){const e=this.component.metadata;let t="";e.noPadding&&(t+=" no-padding");const a=Za(e.headerTitle,this.state,this.data,this.appState,this.appData);return n`
        <vaadin-dialog
                header-title="${a}"
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
                ${e.header||e.closeButtonOnHeader?Cs(()=>n`<mateu-event-interceptor .target="${this}" style="width: 100%;">${e.header?$(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):d}${e.closeButtonOnHeader?n`
                            <vaadin-button theme="tertiary" @click="${this.close}">
                                <vaadin-icon icon="lumo:cross"></vaadin-icon>
                            </vaadin-button>
                        `:d}</mateu-event-interceptor>`,[this.state,this.data]):d}
                ${e.footer?Qa(()=>n`<mateu-event-interceptor .target="${this}" style="width: 100%;">${$(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):d}
                ${e.content?Ea(()=>n`<mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${$(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):d}
                style="${this.component?.style}" 
                class="${this.component?.cssClasses}"
        >
        </vaadin-dialog>

       `}};Ca.styles=R`
  `;ps([g()],Ca.prototype,"opened",2);Ca=ps([I("mateu-dialog")],Ca);var jl=Object.defineProperty,Ll=Object.getOwnPropertyDescriptor,ms=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ll(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&jl(t,a,i),i};let Sa=class extends wt{constructor(){super(...arguments),this.opened=!1,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),300)},this._escListener=e=>{if(e.key!=="Escape")return;const a=this.getRootNode().querySelectorAll("mateu-drawer, mateu-dialog");a[a.length-1]===this&&(e.stopPropagation(),this.close())}}firstUpdated(){requestAnimationFrame(()=>this.opened=!0)}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._escListener)}disconnectedCallback(){document.removeEventListener("keydown",this._escListener),super.disconnectedCallback()}render(){const e=this.component.metadata,t=e.position??"end",a=Za(e.headerTitle,this.state,this.data,this.appState,this.appData);return n`
        ${e.modeless?d:n`
            <div class="backdrop ${this.opened?"open":""}" @click="${this.close}"></div>
        `}
        <section
                class="panel ${t} ${this.opened?"open":""} ${this.component?.cssClasses??""}"
                role="dialog"
                aria-modal="${!e.modeless}"
                aria-label="${a??d}"
                style="${e.width?`width: ${e.width};`:""}${this.component?.style??""}"
        >
            <header>
                ${a?n`<h3>${a}</h3>`:n`<span class="spacer"></span>`}
                ${e.header?n`
                    <mateu-event-interceptor .target="${this}">${$(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:d}
                <vaadin-button theme="tertiary" aria-label="Close" @click="${this.close}">
                    <vaadin-icon icon="lumo:cross"></vaadin-icon>
                </vaadin-button>
            </header>
            <div class="content ${e.noPadding?"no-padding":""}">
                ${e.content?n`
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${$(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:d}
            </div>
            ${e.footer?n`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${$(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                </footer>
            `:d}
        </section>
       `}};Sa.styles=R`
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
  `;ms([g()],Sa.prototype,"opened",2);Sa=ms([I("mateu-drawer")],Sa);var Al=Object.defineProperty,Dl=Object.getOwnPropertyDescriptor,pe=(e,t,a,s)=>{for(var i=s>1?void 0:s?Dl(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Al(t,a,i),i};function ji(e){if(e.parentElement)return e.parentElement;const t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}let ie=class extends j{constructor(){super(...arguments),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type==="keydown"){const t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{const t=e.detail,a=t.banners??[],s=t.append??!1;s?this.actionBanners=[...this.actionBanners,...a]:(this._clearActionBannerTimers(),this.actionBanners=a);const i=s?this.actionBanners.length-a.length:0;a.forEach((r,o)=>{if(r.timeoutSeconds&&r.timeoutSeconds>0){const l=i+o;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((c,u)=>u!==l)},r.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;const t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;const a=parseInt(t[1],10)-1;a>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(a))},this._onScrollSpy=()=>{if(this._tocLocked)return;const e=this._sectionCards();if(!e.length)return;const t=12,a=this.shadowRoot?.querySelector("mateu-content-header");let s=a?a.getBoundingClientRect().bottom:0;for(const o of e){if(!o.classList.contains("mateu-section--sticky"))continue;const l=o.getBoundingClientRect();l.top<=s+t+2&&(s=Math.max(s,l.bottom))}const i=s+t+4;let r=0;this._tocEntries.forEach((o,l)=>{o.el.getBoundingClientRect().top<=i&&(r=l)}),this._activeToc=r}}connectedCallback(){super.connectedCallback(),document.addEventListener("page-banners-received",this._bannersHandler),window.addEventListener("resize",this._onResize),document.addEventListener("keydown",this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("page-banners-received",this._bannersHandler),window.removeEventListener("resize",this._onResize),document.removeEventListener("keydown",this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy()}updated(e){super.updated(e),e.has("component")&&e.get("component")!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has("component")&&(this._scheduleStaticBannerTimeouts(),this.dispatchEvent(new CustomEvent("compact-changed",{detail:{compact:!!this.component?.style?.includes("--mateu-compact:1")},bubbles:!0,composed:!0})),this._scheduleTocRebuild())}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(a=>clearTimeout(a)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((a,s)=>{a.timeoutSeconds&&a.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,s])},a.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,a)=>a!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){const t=e.theme?.toLowerCase()??"info";return t==="none"?"":t}_evalBannerText(e){return ge(e,this.state,this.data)}_renderBanner(e,t){const a=this._evalBannerText(e.title),s=this._evalBannerText(e.description);return n`
            <vaadin-card class="page-banner page-banner--${this.bannerThemeClass(e)}">
                ${a?n`
                    <div slot="title" style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span>${a}</span>
                        ${e.hasCloseButton?n`
                            <vaadin-button theme="icon tertiary small" class="banner-close" @click=${t} title="Dismiss">
                                <vaadin-icon icon="vaadin:close"></vaadin-icon>
                            </vaadin-button>
                        `:d}
                    </div>
                `:e.hasCloseButton?n`
                    <vaadin-button slot="title" theme="icon tertiary small" class="banner-close" style="margin-left: auto;" @click=${t} title="Dismiss">
                        <vaadin-icon icon="vaadin:close"></vaadin-icon>
                    </vaadin-button>
                `:d}
                ${s?n`<p>${s}</p>`:d}
            </vaadin-card>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll("vaadin-card.mateu-section"))}_sectionTitle(e){const t=e.querySelector('[slot="title"]')?.textContent?.trim();return t||e.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()||void 0}_rebuildToc(){const e=this._sectionCards(),t=e.map(r=>({title:this._sectionTitle(r),el:r})).filter(r=>!!r.title),a=this.component?.metadata?.toc,s=t.length>4&&e.every(r=>!r.closest("vaadin-horizontal-layout")),i=(a===!0?!0:a===!1?!1:s)&&t.length>0;this._tocEntries=t,this._tocVisible=i,this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),i?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){const e=this.shadowRoot?.querySelector("mateu-content-header");this._headerH=this._tocVisible&&e?e.offsetHeight:0,this.style.setProperty("--mateu-header-h",this._headerH+"px");const t=12;let a=this._headerH+t;for(const s of this._sectionCards())s.classList.contains("mateu-section--sticky")&&(s.style.top=a+"px",a+=s.offsetHeight+t)}_scrollContainer(){let e=ji(this);for(;e;){const t=getComputedStyle(e).overflowY;if((t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight)return e;e=ji(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener("scroll",this._onScrollSpy,{passive:!0}),window.addEventListener("wheel",this._unlockToc,{passive:!0}),window.addEventListener("touchstart",this._unlockToc,{passive:!0}),window.addEventListener("keydown",this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener("scroll",this._onScrollSpy),window.removeEventListener("wheel",this._unlockToc),window.removeEventListener("touchstart",this._unlockToc),window.removeEventListener("keydown",this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){const t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;const a=12;let s=this._headerH+a;for(const l of this._sectionCards()){if(l===t.el)break;l.classList.contains("mateu-section--sticky")&&(s+=l.offsetHeight+a)}const i=this._scrollContainer(),r=i?i.getBoundingClientRect().top:0,o=t.el.getBoundingClientRect().top-r-s;(i??window).scrollBy({top:o,behavior:"smooth"})}render(){const e=this.component?.metadata,s=[...(e?.banners??[]).map((r,o)=>({banner:r,index:o})).filter(({index:r})=>!this.dismissedStaticBannerIndices.has(r)).map(({banner:r,index:o})=>({banner:r,onDismiss:()=>this._dismissStaticBanner(o)})),...this.actionBanners.map((r,o)=>({banner:r,onDismiss:()=>this._dismissActionBanner(o)}))],i=n`
            <mateu-content-header
                class="${this._tocVisible?"sticky-header":""}"
                .metadata="${e}"
                .baseUrl="${this.baseUrl}"
                .state="${this.state}"
                .data="${this.data}"
                .appState="${this.appState}"
                .appData="${this.appData}"
            ></mateu-content-header>
            ${s.length>0?n`
                <div class="page-banners">
                    ${s.map(({banner:r,onDismiss:o})=>this._renderBanner(r,o))}
                </div>
            `:d}
            <div class="page-body ${this._tocVisible?"with-toc":""}">
                <div class="form-content">
                    <slot @slotchange=${this._onSlotChange}></slot>
                    <vaadin-horizontal-layout theme="spacing" class="form-buttons">
                        <slot name="buttons"></slot>
                    </vaadin-horizontal-layout>
                </div>
                ${this._tocVisible?n`
                    <aside class="page-toc">
                        <nav>
                            ${this._tocEntries.map((r,o)=>n`
                                <a class="page-toc__item ${o===this._activeToc?"is-active":""}"
                                   @click=${()=>this._scrollToSection(o)}
                                   title=${o<9?`${r.title} (Ctrl+Alt+${o+1})`:r.title}>
                                    <span class="page-toc__label">${r.title}</span>
                                    ${o<9?n`<span class="page-toc__key">${o+1}</span>`:d}
                                </a>
                            `)}
                        </nav>
                    </aside>
                `:d}
            </div>
            <div class="form-footer">
                ${e?.footer?.map(r=>$(this,r,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `;return n`<vaadin-vertical-layout style="width: 100%;">${i}</vaadin-vertical-layout>`}};ie.styles=R`
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
    `;pe([v()],ie.prototype,"component",2);pe([v()],ie.prototype,"baseUrl",2);pe([v()],ie.prototype,"state",2);pe([v()],ie.prototype,"data",2);pe([v()],ie.prototype,"appState",2);pe([v()],ie.prototype,"appData",2);pe([v()],ie.prototype,"value",2);pe([v({type:Boolean})],ie.prototype,"standalone",2);pe([g()],ie.prototype,"actionBanners",2);pe([g()],ie.prototype,"dismissedStaticBannerIndices",2);pe([g()],ie.prototype,"_tocEntries",2);pe([g()],ie.prototype,"_activeToc",2);pe([g()],ie.prototype,"_tocVisible",2);ie=pe([I("mateu-page")],ie);const La=R`
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
`,Kt=e=>Z`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,ui=Kt(Z`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),hi=Kt(Z`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),pi=Kt(Z`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`),zl=Kt(Z`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`),Nl=Kt(Z`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`),Fl=Kt(Z`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`);var ql=Object.defineProperty,Ml=Object.getOwnPropertyDescriptor,Pe=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ml(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&ql(t,a,i),i};const Li=["#e91e63","#1676f3","#10b981","#8b5cf6","#f59e0b","#ef4444"],Ul=e=>Li[Math.abs(e??0)%Li.length],Bl=e=>(e??"?").split(/\s+/).filter(t=>t).map(t=>t[0]).slice(0,2).join("").toUpperCase()||"?";let ue=class extends j{constructor(){super(...arguments),this.menu=[],this.chatSessionId=de(),this.menuContextSent=!1,this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onSpeechResult=e=>{if(this.recognition){const t=e,a=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=a,this.send(new CustomEvent("submit",{detail:{value:a},bubbles:!0,composed:!0})))}},this.send=async e=>{this.messageInputElement?.setAttribute("disabled","disabled");const t=e.detail.value.trim();if(!t||!this.sseUrl)return;this.addMessage(t,"user");const a=this.addMessage("","agent");this.startLoading();let s="";try{const i={Accept:"text/event-stream","Content-Type":"application/json"},r=localStorage.getItem("__mateu_auth_token");r&&(i.Authorization="Bearer "+r);const o=sessionStorage.getItem("__mateu_sesion_id");o&&(i["X-Session-Id"]=o);const l=JSON.stringify({message:t,sessionId:this.chatSessionId,...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;const c=await fetch(this.sseUrl,{method:"POST",headers:i,body:l});if(!c.ok){const f=await c.text();throw new Error(`Servidor respondió ${c.status}: ${f}`)}const u=c.body?.getReader();if(!u)throw new Error("No se pudo obtener el reader del stream.");const h=new TextDecoder;let p="";for(;;){const{done:f,value:y}=await u.read();if(f){if(p.trim().startsWith("data:")){const U=p.trim().slice(5).trim(),Y=this.tryParseTokenUsage(U),q=!Y&&this.tryParseCustomEvent(U);Y?this.tokenUsage={...this.tokenUsage,...Y}:q?q.event==="agent-error"?(s="⚠️ "+(q.detail?.message??"Error desconocido del agente"),this.updateMessage(a,s)):this.dispatchEvent(new CustomEvent(q.event,{detail:q.detail,bubbles:!0,composed:!0})):(s+=U,this.updateMessage(a,s))}break}const w=h.decode(y,{stream:!0});p+=w;const x=p.split(`
`);p=x.pop()||"";let _=!1;for(const U of x)if(U.trim().startsWith("data:")){const Y=U.trim().slice(5).trim(),q=this.tryParseTokenUsage(Y),X=!q&&this.tryParseCustomEvent(Y);q?this.tokenUsage={...this.tokenUsage,...q}:X?X.event==="agent-error"?(s="⚠️ "+(X.detail?.message??"Error desconocido del agente"),this.updateMessage(a,s)):this.dispatchEvent(new CustomEvent(X.event,{detail:X.detail,bubbles:!0,composed:!0})):(s+=Y+`
`,_=!0)}_&&this.updateMessage(a,s)}s||this.updateMessage(a,"⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).")}catch(i){console.error("Error en el flujo SSE:",i);const r=i?.message??String(i);(r==="Failed to fetch"||r==="network error"||r==="Load failed")&&!s?this.updateMessage(a,"⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible."):this.updateMessage(a,"⚠️ Error: "+r)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value="")},250),this.messageInputElement?.removeAttribute("disabled"),this.messageInputElement?.focus()}},this.closeChat=()=>{this.dispatchEvent(new CustomEvent("close-requested",{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{const e=this.messageInputElement?.value?.trim()??"";e&&this.send(new CustomEvent("submit",{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key==="Enter"&&(e.preventDefault(),this.submitFromInput())}}connectedCallback(){super.connectedCallback();const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){const t=new e;this.recognition=t,t.lang="es-ES",t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=a=>{console.error("Error de reconocimiento: "+a.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:"smooth"})},0)}addMessage(e,t){const a={text:e,time:new Date().toLocaleTimeString(),userName:t.includes("agent")?"Asistente":"Tú",userColorIndex:t.includes("agent")?2:1};return this.items=[...this.items,a],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((a,s)=>s===e?{...a,text:t}:a),this.scrollBottom()}tryParseCustomEvent(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const a=JSON.parse(t);if(typeof a.event=="string")return{event:a.event,detail:a.detail??{}}}catch{}return null}tryParseTokenUsage(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const a=JSON.parse(t);if("inputTokens"in a||"outputTokens"in a||"totalTokens"in a)return a}catch{}return null}buildMenuContext(e,t=[]){const a=[];for(const s of e){if(s.separator||s.remote)continue;const i=[...t,s.label];if(s.submenus&&s.submenus.length>0)a.push(...this.buildMenuContext(s.submenus,i));else{const r={path:i,navigation:{route:s.route,consumedRoute:s.consumedRoute,actionId:s.actionId??"",baseUrl:s.baseUrl,serverSideType:s.serverSideType,uriPrefix:s.uriPrefix}};s.description&&(r.description=s.description),a.push(r)}}return a}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}render(){return n`
            <div class="chat-container">
                <div class="chat-header">
                    <span class="chat-title">AI Assistant</span>
                    <button class="chat-close" @click="${this.closeChat}" title="Cerrar">
                        ${Fl}
                    </button>
                </div>
                <div class="scroll-container">
                    <div class="message-list" role="list">
                        ${this.items.map(e=>n`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${Ul(e.userColorIndex)};">${Bl(e.userName)}</div>
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
                        <span class="loading-text">Thinking… ${this.elapsedSeconds}s</span>
                    </div>
                `:d}
                <div class="input-bar">
                    <button class="mic-btn"
                            title="Dictar"
                            style="color: ${this.listening?"red":"var(--lumo-contrast-50pct, #767676)"};"
                            @click="${this.startListening}"
                            ?disabled="${!this.recognitionAvailable}"
                    >${Nl}</button>
                    <input class="msg-input"
                           placeholder="Message"
                           aria-label="Message"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">Send</button>
                </div>
            </div>
        `}};ue.styles=[La,R`
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
    `];Pe([v()],ue.prototype,"sseUrl",2);Pe([v({attribute:!1})],ue.prototype,"menu",2);Pe([v()],ue.prototype,"items",2);Pe([Ye(".scroll-container")],ue.prototype,"scrollContainer",2);Pe([Ye(".msg-input")],ue.prototype,"messageInputElement",2);Pe([g()],ue.prototype,"recognition",2);Pe([g()],ue.prototype,"listening",2);Pe([g()],ue.prototype,"recognitionAvailable",2);Pe([g()],ue.prototype,"loading",2);Pe([g()],ue.prototype,"elapsedSeconds",2);Pe([g()],ue.prototype,"tokenUsage",2);ue=Pe([I("mateu-chat")],ue);var Wl=Object.defineProperty,Vl=Object.getOwnPropertyDescriptor,ma=(e,t,a,s)=>{for(var i=s>1?void 0:s?Vl(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Wl(t,a,i),i};let Tt=class extends j{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.data&&this.createChart(this.data)}async createChart(e){const[{default:t}]=await Promise.all([be(()=>import("./vendor-chartjs.js").then(s=>s.a),[]),be(()=>import("./vendor-chartjs.js").then(s=>s.c),[])]);if(e!==this.data)return;this.chart&&this.chart.destroy();const a={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,a)}handleSlotChange(){}render(){return n`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};Tt.styles=R`
  `;ma([v()],Tt.prototype,"type",2);ma([v()],Tt.prototype,"data",2);ma([v()],Tt.prototype,"options",2);ma([Ye("#chart")],Tt.prototype,"chartElement",2);Tt=ma([I("mateu-chart")],Tt);var Hl=Object.defineProperty,Gl=Object.getOwnPropertyDescriptor,mi=(e,t,a,s)=>{for(var i=s>1?void 0:s?Gl(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Hl(t,a,i),i};let oa=class extends j{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){const{default:t}=await be(async()=>{const{default:s}=await import("./vendor-diagrams.js").then(i=>i.i);return{default:s}},__vite__mapDeps([5,3,1,2,4]));if(e!==this.xml)return;this.chart&&this.chart.destroy();const a={container:this.divElement};this.chart=new t(a),this.chart.importXML(e)}handleSlotChange(){}render(){return n`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};oa.styles=R`
  `;mi([v()],oa.prototype,"xml",2);mi([Ye("#canvas")],oa.prototype,"divElement",2);oa=mi([I("mateu-bpmn")],oa);var Kl=Object.defineProperty,Jl=Object.getOwnPropertyDescriptor,Jt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Jl(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Kl(t,a,i),i};const Ua=160,Ve=56,Yl=220,Ai=110,mt=60,Xl={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},Ql={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},Zl=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];function ed(){return"step-"+Math.random().toString(36).slice(2,8)}let $t=class extends j{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.wf={name:"New Workflow",steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value")){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){const e=this.wf.steps??[],t={};e.forEach(o=>{t[o.id]=0});let a=!0;for(;a;)a=!1,e.forEach(o=>{if(o.preconditionStepId!=null&&t[o.preconditionStepId]!==void 0){const l=t[o.preconditionStepId]+1;l>t[o.id]&&(t[o.id]=l,a=!0)}});const s={};e.forEach(o=>{const l=t[o.id]??0;(s[l]??=[]).push(o.id)});const i={...this.positions};let r=!1;Object.entries(s).forEach(([o,l])=>{const c=Number(o);l.forEach((u,h)=>{i[u]||(i[u]={x:mt+c*Yl,y:mt+h*Ai},r=!0)})}),r&&(this.positions=i)}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addStep(){const e=ed(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(i=>i.y),s=a.length?Math.max(...a)+Ai:mt;this.positions={...this.positions,[e]:{x:mt,y:s}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(s=>s.id!==e).map(s=>s.preconditionStepId===e?{...s,preconditionStepId:void 0}:s)};const{[e]:t,...a}=this.positions;this.positions=a,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},s=this.toSvgPoint(e);this.dragOffset={x:s.x-a.x,y:s.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(s=>s.x))+Ua+mt:600,a=e.length?Math.max(...e.map(s=>s.y))+Ve+mt:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return n`
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
                            ${a.map(s=>this.renderArrow(s))}
                            ${a.map(s=>this.renderNode(s))}
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
                    ${ui}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${hi}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${pi}
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
        `}renderArrow(e){if(!e.preconditionStepId)return Z``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return Z``;const s=t.x+Ua,i=t.y+Ve/2,r=a.x,o=a.y+Ve/2,l=(s+r)/2;return Z`
            <path d="M${s},${i} C${l},${i} ${l},${o} ${r},${o}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:mt,y:mt},a=Xl[e.type]??"#64748b",s=Ql[e.type]??"•",i=this.selectedId===e.id;return Z`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${r=>this.onNodeMouseDown(r,e.id)}"
               @click="${r=>{r.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${Ua}" height="${Ve}" rx="8"
                      fill="white"
                      stroke="${i?a:"#e2e8f0"}"
                      stroke-width="${i?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${Ve}" rx="8" fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${Ve}" fill="${a}"/>
                <text x="16" y="${Ve/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${s}</text>
                <!-- name -->
                <text x="44" y="${Ve/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+"…":e.name}
                </text>
                <text x="44" y="${Ve/2+8}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${Ve/2+20}" font-size="9" fill="${a}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(s=>s.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(s=>s.id!==e.id),a=(s,i)=>n`
            <div class="field">
                <label class="field-label">${s}</label>
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
                        @change="${s=>this.updateStep(e.id,{name:s.target.value})}"/>`)}
                    ${a("Type",n`
                        <select class="inp" @change="${s=>this.updateStep(e.id,{type:s.target.value})}">
                            ${Zl.map(s=>n`<option value="${s}" ?selected="${e.type===s}">${s}</option>`)}
                        </select>`)}
                    ${a("Description",n`<textarea class="inp" rows="2"
                        @change="${s=>this.updateStep(e.id,{description:s.target.value})}">${e.description??""}</textarea>`)}
                    ${a("Precondition step",n`
                        <select class="inp" @change="${s=>this.updateStep(e.id,{preconditionStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>n`<option value="${s.id}" ?selected="${e.preconditionStepId===s.id}">${s.name} (${s.id})</option>`)}
                        </select>`)}
                    ${a("Precondition expression",n`<input class="inp" placeholder="JEXL expression"
                        .value="${e.preconditionExpression??""}"
                        @change="${s=>this.updateStep(e.id,{preconditionExpression:s.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}"
                               @change="${s=>this.updateStep(e.id,{parallel:s.target.checked})}"/>
                    </div>
                    ${a("Timeout (ms)",n`<input class="inp" type="number" min="0"
                        .value="${String(e.timeout??0)}"
                        @change="${s=>this.updateStep(e.id,{timeout:Number(s.target.value)})}"/>`)}
                    ${a("Retries",n`<input class="inp" type="number" min="0"
                        .value="${String(e.retries??0)}"
                        @change="${s=>this.updateStep(e.id,{retries:Number(s.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}"
                               @change="${s=>this.updateStep(e.id,{rollbackable:s.target.checked})}"/>
                    </div>
                    ${e.rollbackable?a("Compensation step",n`
                        <select class="inp" @change="${s=>this.updateStep(e.id,{compensationStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>n`<option value="${s.id}" ?selected="${e.compensationStepId===s.id}">${s.name} (${s.id})</option>`)}
                        </select>`):""}

                    ${e.type==="ACTION"?a("Topic",n`<input class="inp" placeholder="kafka.topic.name"
                        .value="${e.topic??""}"
                        @change="${s=>this.updateStep(e.id,{topic:s.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?a("Form ID",n`<input class="inp"
                        .value="${e.formId??""}"
                        @change="${s=>this.updateStep(e.id,{formId:s.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?a("Child workflow ID",n`<input class="inp"
                        .value="${e.childWorkflowDefinitionId??""}"
                        @change="${s=>this.updateStep(e.id,{childWorkflowDefinitionId:s.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),s=document.createElement("a");s.href=a,s.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(a)}};$t.styles=[La,R`
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
    `];Jt([v()],$t.prototype,"value",2);Jt([g()],$t.prototype,"wf",2);Jt([g()],$t.prototype,"positions",2);Jt([g()],$t.prototype,"selectedId",2);Jt([g()],$t.prototype,"showMeta",2);$t=Jt([I("mateu-workflow")],$t);var td=Object.defineProperty,ad=Object.getOwnPropertyDescriptor,dt=(e,t,a,s)=>{for(var i=s>1?void 0:s?ad(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&td(t,a,i),i};const Qt=160,Le=56,vt=60,id={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},sd={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},rd=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];let Ba;const od=()=>(Ba||(Ba=be(()=>import("./vendor-diagrams.js").then(e=>e.e),__vite__mapDeps([5,3,1,2,4])).then(e=>new e.default)),Ba);function nd(){return"step-"+Math.random().toString(36).slice(2,8)}let ze=class extends j{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.readOnly=!1,this.wf={name:"New Workflow",steps:[]},this.positions={},this.layoutReady=!1,this.selectedId=null,this.showMeta=!1,this.layoutError=null,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.elkPositioned=new Set,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.elkPositioned.add(this.draggingId),this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value"))try{const t=JSON.parse(this.value),a=new Set((this.wf.steps??[]).map(r=>r.id)),s=new Set((t.steps??[]).map(r=>r.id)),i=a.size!==s.size||[...s].some(r=>!a.has(r))||[...s].some(r=>{const o=(this.wf.steps??[]).find(c=>c.id===r),l=(t.steps??[]).find(c=>c.id===r);return o?.preconditionStepId!==l?.preconditionStepId});this.wf=t,(i||!this.layoutReady)&&this.runElkLayout()}catch{}}async runElkLayout(){const e=this.wf.steps??[];if(e.length===0){this.positions={},this.layoutReady=!0;return}const t={id:"root",layoutOptions:{"elk.algorithm":"layered","elk.direction":"RIGHT","elk.spacing.nodeNode":"40","elk.layered.spacing.nodeNodeBetweenLayers":"80","elk.edgeRouting":"ORTHOGONAL","elk.layered.nodePlacement.strategy":"BRANDES_KOEPF"},children:e.map(a=>({id:a.id,width:Qt,height:Le})),edges:e.filter(a=>a.preconditionStepId).map(a=>({id:`${a.preconditionStepId}->${a.id}`,sources:[a.preconditionStepId],targets:[a.id]}))};try{const s=await(await od()).layout(t),i={...this.positions};for(const r of s.children??[])(!this.elkPositioned.has(r.id)||!i[r.id])&&(i[r.id]={x:(r.x??0)+vt,y:(r.y??0)+vt},this.elkPositioned.add(r.id));this.positions=i,this.layoutReady=!0,this.layoutError=null}catch(a){this.layoutError=a?.message??"ELK layout failed",this.layoutReady=!0}}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){const a=this.wf.steps.map(r=>r.id===e?{...r,...t}:r),s=this.wf.steps.find(r=>r.id===e),i=t.preconditionStepId!==void 0&&t.preconditionStepId!==s?.preconditionStepId;this.wf={...this.wf,steps:a},i&&(this.elkPositioned.clear(),this.runElkLayout()),this.emit()}addStep(){const e=nd(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(s=>s.x);this.positions={...this.positions,[e]:{x:a.length?Math.max(...a)+Qt+80:vt,y:vt}},this.selectedId=e,this.elkPositioned.clear(),this.runElkLayout(),this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(s=>s.id!==e).map(s=>s.preconditionStepId===e?{...s,preconditionStepId:void 0}:s)};const{[e]:t,...a}=this.positions;this.positions=a,this.elkPositioned.delete(e),this.selectedId===e&&(this.selectedId=null),this.runElkLayout(),this.emit()}onNodeMouseDown(e,t){if(this.readOnly)return;e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},s=this.toSvgPoint(e);this.dragOffset={x:s.x-a.x,y:s.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}relayout(){this.elkPositioned.clear(),this.runElkLayout()}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(s=>s.x))+Qt+vt:600,a=e.length?Math.max(...e.map(s=>s.y))+Le+vt:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){if(!this.layoutReady)return n`<div class="loading">Computing layout…</div>`;const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return n`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():""}
                ${this.layoutError?n`<div class="error">⚠ ${this.layoutError}</div>`:""}
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
                            ${a.map(s=>this.renderArrow(s))}
                            ${a.map(s=>this.renderNode(s))}
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
                <button class="nbtn" title="Re-run ELK layout"
                        @click="${()=>this.relayout()}">
                    ${zl}
                    Re-layout
                </button>
                ${this.readOnly?d:n`
                    <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                        ${ui}
                        Settings
                    </button>
                    <button class="nbtn primary" @click="${()=>this.addStep()}">
                        ${hi}
                        Add Step
                    </button>
                `}
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${pi}
                    Export
                </button>
            </div>
        `}renderMeta(){const e=this.wf;return n`
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
                        ${["DRAFT","ACTIVE","DISABLED","ARCHIVED"].map(t=>n`
                            <option value="${t}" ?selected="${e.status===t}">${t}</option>`)}
                    </select>
                    <label>Limit concurrent</label>
                    <input type="checkbox" ?checked="${e.limitConcurrentExecutions}"
                           @change="${t=>this.updateWf({limitConcurrentExecutions:t.target.checked})}"/>
                    ${e.limitConcurrentExecutions?n`
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
        `}renderArrow(e){if(!e.preconditionStepId)return Z``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return Z``;const s=t.x+Qt,i=t.y+Le/2,r=a.x,o=a.y+Le/2,l=(s+r)/2;return Z`
            <path d="M${s},${i} C${l},${i} ${l},${o} ${r},${o}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:vt,y:vt},a=id[e.type]??"#64748b",s=sd[e.type]??"•",i=this.selectedId===e.id,r=e.name.length>16?e.name.slice(0,15)+"…":e.name;return Z`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${o=>this.onNodeMouseDown(o,e.id)}"
               @click="${o=>{o.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${Qt}" height="${Le}" rx="8"
                      fill="white"
                      stroke="${i?a:"#e2e8f0"}"
                      stroke-width="${i?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge strip -->
                <rect x="0" y="0" width="32" height="${Le}" rx="8"
                      fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${Le}" fill="${a}"/>
                <text x="16" y="${Le/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${s}</text>
                <!-- labels -->
                <text x="44" y="${Le/2-6}" font-size="11"
                      fill="#1e293b" font-weight="600">${r}</text>
                <text x="44" y="${Le/2+8}" font-size="9"
                      fill="#94a3b8">${e.id}</text>
                <text x="44" y="${Le/2+20}" font-size="9"
                      fill="${a}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(i=>i.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(i=>i.id!==e.id),a=this.readOnly,s=(i,r)=>n`
            <div class="field">
                <label class="field-label">${i}</label>
                ${r}
            </div>
        `;return n`
            <div class="properties">
                <div class="prop-header">
                    <span>Step Properties</span>
                    ${a?d:n`<button class="del-btn" title="Delete step"
                            @click="${()=>this.deleteStep(e.id)}">🗑</button>`}
                    <button class="close-btn"
                            @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${s("ID",n`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${s("Name",n`<input class="inp" ?readonly="${a}" .value="${e.name}"
                        @change="${a?d:i=>this.updateStep(e.id,{name:i.target.value})}"/>`)}
                    ${s("Type",n`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?d:i=>this.updateStep(e.id,{type:i.target.value})}">
                            ${rd.map(i=>n`
                                <option value="${i}" ?selected="${e.type===i}">${i}</option>`)}
                        </select>`)}
                    ${s("Description",n`<textarea class="inp" rows="2" ?readonly="${a}"
                        @change="${a?d:i=>this.updateStep(e.id,{description:i.target.value})}">${e.description??""}</textarea>`)}
                    ${s("Precondition step",n`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?d:i=>this.updateStep(e.id,{preconditionStepId:i.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(i=>n`
                                <option value="${i.id}" ?selected="${e.preconditionStepId===i.id}">
                                    ${i.name} (${i.id})
                                </option>`)}
                        </select>`)}
                    ${s("Precondition expression",n`
                        <input class="inp" placeholder="JEXL expression" ?readonly="${a}"
                               .value="${e.preconditionExpression??""}"
                               @change="${a?d:i=>this.updateStep(e.id,{preconditionExpression:i.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}" ?disabled="${a}"
                               @change="${a?d:i=>this.updateStep(e.id,{parallel:i.target.checked})}"/>
                    </div>
                    ${s("Timeout (ms)",n`
                        <input class="inp" type="number" min="0" ?readonly="${a}"
                               .value="${String(e.timeout??0)}"
                               @change="${a?d:i=>this.updateStep(e.id,{timeout:Number(i.target.value)})}"/>`)}
                    ${s("Retries",n`
                        <input class="inp" type="number" min="0" ?readonly="${a}"
                               .value="${String(e.retries??0)}"
                               @change="${a?d:i=>this.updateStep(e.id,{retries:Number(i.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}" ?disabled="${a}"
                               @change="${a?d:i=>this.updateStep(e.id,{rollbackable:i.target.checked})}"/>
                    </div>
                    ${e.rollbackable?s("Compensation step",n`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?d:i=>this.updateStep(e.id,{compensationStepId:i.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(i=>n`
                                <option value="${i.id}" ?selected="${e.compensationStepId===i.id}">
                                    ${i.name} (${i.id})
                                </option>`)}
                        </select>`):""}
                    ${e.type==="ACTION"?s("Topic",n`
                        <input class="inp" placeholder="kafka.topic.name" ?readonly="${a}"
                               .value="${e.topic??""}"
                               @change="${a?d:i=>this.updateStep(e.id,{topic:i.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?s("Form ID",n`
                        <input class="inp" ?readonly="${a}" .value="${e.formId??""}"
                               @change="${a?d:i=>this.updateStep(e.id,{formId:i.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?s("Child workflow ID",n`
                        <input class="inp" ?readonly="${a}" .value="${e.childWorkflowDefinitionId??""}"
                               @change="${a?d:i=>this.updateStep(e.id,{childWorkflowDefinitionId:i.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),s=document.createElement("a");s.href=a,s.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(a)}};ze.styles=[La,R`
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
    `];dt([v()],ze.prototype,"value",2);dt([v({type:Boolean})],ze.prototype,"readOnly",2);dt([g()],ze.prototype,"wf",2);dt([g()],ze.prototype,"positions",2);dt([g()],ze.prototype,"layoutReady",2);dt([g()],ze.prototype,"selectedId",2);dt([g()],ze.prototype,"showMeta",2);dt([g()],ze.prototype,"layoutError",2);ze=dt([I("mateu-workflow-elk")],ze);var ld=Object.defineProperty,dd=Object.getOwnPropertyDescriptor,va=(e,t,a,s)=>{for(var i=s>1?void 0:s?dd(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&ld(t,a,i),i};const cd=["string","integer","number","bool","date","time","dateTime","dateRange","money","file","array","status","component","menu","range","action","actionGroup"],ud=["regular","radio","checkbox","textarea","toggle","combobox","select","email","password","richText","listBox","html","markdown","image","icon","link","money","grid","color","choice","popover","slider","button","stars"],hd={string:"#3B82F6",integer:"#8B5CF6",number:"#6366F1",bool:"#10B981",date:"#F59E0B",time:"#F59E0B",dateTime:"#F59E0B",dateRange:"#F59E0B",money:"#EF4444",file:"#64748B",array:"#0EA5E9",status:"#EC4899",component:"#14B8A6",menu:"#94A3B8",range:"#A855F7",action:"#F97316",actionGroup:"#FB923C"};function Di(){return"field-"+Math.random().toString(36).slice(2,8)}let Rt=class extends j{constructor(){super(...arguments),this.value='{"name":"New Form","fields":[]}',this.form={name:"New Form",fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has("value"))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){const e=this.shadowRoot?.querySelector(".field-list");!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=Is.create(e,{animation:150,handle:".drag-handle",ghostClass:"sortable-ghost",onEnd:t=>{const{oldIndex:a,newIndex:s}=t;if(a===void 0||s===void 0||a===s)return;const i=[...this.form.fields],[r]=i.splice(a,1);i.splice(s,0,r),this.form={...this.form,fields:i},this.emit()}}))}emit(){const e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addField(){const e=Di(),t={id:e,label:"New Field",dataType:"string"};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){const t=this.form.fields.find(r=>r.id===e);if(!t)return;const a={...t,id:Di(),label:t.label+" (copy)"},s=this.form.fields.findIndex(r=>r.id===e),i=[...this.form.fields];i.splice(s+1,0,a),this.form={...this.form,fields:i},this.selectedId=a.id,this.emit()}render(){return n`
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
                    ${ui}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${hi}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${pi}
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
        `}renderRow(e){const t=hd[e.dataType]??"#64748b",a=this.selectedId===e.id;return n`
            <div class="field-row ${a?"selected":""}"
                 data-id="${e.id}"
                 @click="${()=>this.selectedId=this.selectedId===e.id?null:e.id}">
                <span class="drag-handle" title="Drag to reorder">⠿</span>
                <span class="type-badge" style="background:${t}">${e.dataType}</span>
                <span class="field-label-text">${e.label}</span>
                <span class="field-id-text">${e.id}</span>
                ${e.required?n`<span class="required-badge">required</span>`:d}
                ${e.stereotype&&e.stereotype!=="regular"?n`<span class="stereo-badge">${e.stereotype}</span>`:d}
                <div style="flex:1"></div>
                <button class="row-btn" title="Duplicate"
                        @click="${s=>{s.stopPropagation(),this.duplicateField(e.id)}}">⧉</button>
                <button class="row-btn danger" title="Delete"
                        @click="${s=>{s.stopPropagation(),this.deleteField(e.id)}}">🗑</button>
            </div>
        `}renderPanel(){const e=this.form.fields.find(a=>a.id===this.selectedId);if(!e)return d;const t=(a,s)=>n`
            <div class="prop-field">
                <label class="prop-label">${a}</label>
                ${s}
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
                            ${cd.map(a=>n`
                                <option value="${a}" ?selected="${e.dataType===a}">${a}</option>`)}
                        </select>`)}
                    ${t("Stereotype",n`
                        <select class="inp"
                                @change="${a=>this.updateField(e.id,{stereotype:a.target.value||void 0})}">
                            ${ud.map(a=>n`
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
        `}exportJson(){const e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),s=document.createElement("a");s.href=a,s.download=(this.form.name??"form").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(a)}};Rt.styles=[La,R`
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
    `];va([v()],Rt.prototype,"value",2);va([g()],Rt.prototype,"form",2);va([g()],Rt.prototype,"selectedId",2);va([g()],Rt.prototype,"showMeta",2);Rt=va([I("mateu-form-editor")],Rt);var pd=Object.defineProperty,md=Object.getOwnPropertyDescriptor,et=(e,t,a,s)=>{for(var i=s>1?void 0:s?md(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&pd(t,a,i),i};let Te=class extends j{constructor(){super(...arguments),this.appState={},this.appData={},this.open=!1,this.activeTab="appstate",this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith("mateu-")&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset="",this._prevTarget=null,this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset=""),this._prevTarget=t,t.style.outline="2px solid #0070f3",t.style.outlineOffset="-2px",this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||"",this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener("mouseover",this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mouseover",this._onMouseover,!0),this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget=null)}_fmt(e){try{return JSON.stringify(e,null,2)??"null"}catch{return String(e)}}_renderTab(e,t){return n`
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
        `}};Te.styles=R`
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
    `;et([v()],Te.prototype,"appState",2);et([v()],Te.prototype,"appData",2);et([g()],Te.prototype,"open",2);et([g()],Te.prototype,"activeTab",2);et([g()],Te.prototype,"hoveredTag",2);et([g()],Te.prototype,"hoveredId",2);et([g()],Te.prototype,"hoveredState",2);et([g()],Te.prototype,"hoveredData",2);et([g()],Te.prototype,"hoveredMeta",2);Te=et([I("mateu-debug-overlay")],Te);var Ae=(e=>(e.SetAppDataValue="SetAppDataValue",e.SetAppStateValue="SetAppStateValue",e.SetDataValue="SetDataValue",e.RunAction="RunAction",e.RunJS="RunJS",e.SetAttributeValue="SetAttributeValue",e.SetStateValue="SetStateValue",e.SetCssClass="SetCssClass",e.SetStyle="SetStyle",e))(Ae||{}),vs=(e=>(e.required="required",e.disabled="disabled",e.hidden="hidden",e.pattern="pattern",e.minValue="minValue",e.maxValue="maxValue",e.minLength="minLength",e.maxLength="maxLength",e.css="css",e.style="style",e.theme="theme",e.errorMessage="errorMessage",e.description="description",e.none="none",e))(vs||{}),fs=(e=>(e.Continue="Continue",e.Stop="Stop",e))(fs||{}),vd=Object.defineProperty,fd=Object.getOwnPropertyDescriptor,Aa=(e,t,a,s)=>{for(var i=s>1?void 0:s?fd(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&vd(t,a,i),i};let Zt=null,Ut=class extends wt{constructor(){super(...arguments),this.baseUrl="",this.route="",this.consumedRoute="",this.formerState={},this.applyRules=()=>{const e=this.component.rules;if(e&&e.length>0){const t=this.state,a=this.data,s=this.appState,i=this.appData,r=this.component,o=w=>Vi(w,t,a,{appState:s,appData:i,component:r}),l=w=>Wi(w,t,a,s,i,{component:r}),c=["state","data","appState","appData","component"],u=[t,a,s,i,r],h={...this.state},p={...this.data};let f=!1,y=!1;for(let w=0;w<e.length;w++){const x=e[w];try{if(o(x.filter)){if(Ae.SetStateValue==x.action||Ae.SetDataValue==x.action){const _=Ae.SetStateValue==x.action?h:p,U=x.fieldName.split(",");for(let Y=0;Y<U.length;Y++){const q=U[Y];if(!_[q]||_[q]!=x.value){const X=x.expression?l(x.expression):x.value,Ce=vs.none==x.fieldAttribute?q:q+"."+x.fieldAttribute;X!=_[Ce]&&(_[Ce]=X,Ae.SetStateValue==x.action&&(f=!0),Ae.SetDataValue==x.action&&(y=!0))}}}if(Ae.RunAction==x.action&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:x.actionId},bubbles:!0,composed:!0})),Ae.RunJS==x.action&&new Function(...c,x.value)(...u),Ae.SetAttributeValue==x.action){const _=x.expression?o(x.expression):x.value;if(x.fieldAttribute=="disabled"){_?this.shadowRoot?.getElementById(x.fieldName)?.setAttribute(x.fieldAttribute,"disabled"):this.shadowRoot?.getElementById(x.fieldName)?.removeAttribute(x.fieldAttribute);continue}this.shadowRoot?.getElementById(x.fieldName)?.setAttribute(x.fieldAttribute,_)}if(Ae.SetCssClass==x.action&&this.shadowRoot?.getElementById(x.fieldName)?.setAttribute("class",x.value),Ae.SetStyle==x.action&&this.shadowRoot?.getElementById(x.fieldName)?.style.setProperty(x.expression,x.value),fs.Stop==x.result)break}}catch(_){console.error("rule failed",x,_)}}f&&(this.state=h),y&&(this.data=p),f&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes("-"),this.checkValidations=e=>{const t=e?e.split(","):void 0,a=this.component.validations;let s=!0,i=!1;const r=this.data??{},o={...this.data??{},errors:{}};if(a){for(let l=0;l<a.length;l++){const c=a[l];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let h=0;h<u.length;h++){const p=u[h];o.errors[p]=[]}}for(let l=0;l<a.length;l++){const c=a[l];if(!this.skipValidation(t,c))try{const u=c.condition&&c.condition.includes("${")?this._evalTemplate(c.condition):this._evalExpr(c.condition);if(c.condition&&!u){s=!1;const p=(c.fieldId??"_component").split(",");for(let f=0;f<p.length;f++){const y=p[f];let w=o.errors[y];if(w||(o.errors[y]=[]),w=o.errors[y],!r[y]){let x=c.message;try{x=this._evalTemplate(c.message)}catch{}w.push(x)}}}}catch(u){console.error("validation failed",c,u)}}for(let l=0;l<a.length;l++){const c=a[l];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let h=0;h<u.length;h++){const p=u[h];if(r.errors?[p].join(","):o.errors==""&&[p].join(",")){i=!0;break}}}(r.errors?["_component"].join(","):o.errors==""&&["_component"].join(","))&&(i=!0)}o._valid=s,o._valid!=r._valid&&(i=!0),i&&(this.data=o)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};t.fieldIds.forEach(s=>{a[s]=void 0}),a.searchText=void 0,this.state={...this.state,...a}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};a[t.key]=t.value,e.type=="data-changed"&&(this.data={...this.data,...a})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail;if(e.type=="value-changed"){const a={...this.state};a[t.fieldId]=t.value,this.state=a,(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("dirty",{detail:e.detail,bubbles:!0,composed:!0}));const s=this.component;s.triggers?.filter(i=>i.type==ft.OnValueChange).filter(i=>!i.propertyName||t.fieldId==i.propertyName).forEach(i=>{(!i.condition||this._evalExpr(i.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))}),s.triggers?.filter(i=>i.type==ft.AutoSave).forEach(i=>{const r=i.actionId,o=this._autoSaveTimers.get(r);o!==void 0&&clearTimeout(o),this._autoSaveTimers.set(r,setTimeout(()=>{this._autoSaveTimers.delete(r),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))},i.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{const t=e.detail;if(e.type=="action-requested"){e.preventDefault(),e.stopPropagation();const a=this.component,s=a.actions?.find(i=>i.id==t.actionId||i.id.endsWith("*")&&t.actionId.startsWith(i.id.replace("*","")));if(s){if(s&&s.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify("You first need to select some rows");return}if(s&&s.validationRequired){const r=Zt??this;if(Zt=null,r.checkValidations(s.fieldsToValidate),!r.data._valid){r.notifyValidationErrors();return}}Zt=null;const i={...t,initiatorComponentId:this.id};s&&s.confirmationRequired?this.callAfterConfirmation(s,()=>this.requestActionCallToServerOrBubble(i,a,s)):this.requestActionCallToServerOrBubble(i,a,s)}else{const i={...t.parameters};i.initiatorState||(i.initiatorState=this.state),Zt||(Zt=this),this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,parameters:i},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{const e={},t=a=>{if(a)for(const s of a){const i=s.metadata;if(i?.type===m.FormField){const r=i;r.fieldId&&r.label&&(e[r.fieldId]=r.label)}t(s.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{const e=this.data?.errors??{},t=this.buildFieldLabelMap(),a=[];if(Object.entries(e).forEach(([i,r])=>{if(!Array.isArray(r))return;const o=i==="_component"?void 0:t[i]??i;r.forEach(l=>{l&&!a.some(c=>c.label===o&&c.msg===l)&&a.push({label:o,msg:l})})}),a.length===0){this.notify("There are validation errors");return}const s=document.createElement("vaadin-notification");s.position="bottom-end",s.setAttribute("theme","error"),s.duration=Math.max(3e3,1500+a.length*1e3),s.renderer=i=>{Fi(n`
                <vaadin-vertical-layout style="gap: var(--lumo-space-xs);">
                    <strong>There are validation errors</strong>
                    ${a.map(({label:r,msg:o})=>r?n`<span>• <b>${r}:</b> ${o}</span>`:n`<span>• ${o}</span>`)}
                </vaadin-vertical-layout>
            `,i)},document.body.appendChild(s),s.opened=!0,s.addEventListener("opened-changed",i=>{i.detail.value||document.body.removeChild(s)})},this.notify=e=>{na.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.callAfterConfirmation=(e,t)=>{let a="One moment, please",s="Are you sure?",i="Yes",r="No";e.confirmationTexts&&(a=e.confirmationTexts.title,s=e.confirmationTexts.message,i=e.confirmationTexts.confirmationText,r=e.confirmationTexts.denialText);const o=document.createElement("vaadin-confirm-dialog");o.setAttribute("header",a),o.setAttribute("cancel-button-visible","cancel-button-visible"),o.setAttribute("confirm-text",i),o.setAttribute("cancel-text",r),o.append(s),o.opened=!0,o.addEventListener("confirm",()=>t()),o.addEventListener("close",()=>document.body.removeChild(o)),o.addEventListener("confirm",()=>document.body.removeChild(o)),o.addEventListener("cancel",()=>document.body.removeChild(o)),o.addEventListener("reject",()=>document.body.removeChild(o)),document.body.append(o)},this.requestActionCallToServerOrBubble=(e,t,a)=>{if(a&&a.bubble){const s={...e.parameters};s.initiatorState||(s.initiatorState=this.state),this.dispatchEvent(new CustomEvent("action-requested",{detail:{...e,parameters:s},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,a)},this.requestActionCallToServer=(e,t,a)=>{if(a&&a.href){window.location.href=a.href;return}if(a&&a.js)try{new Function("state","data","appState","appData","component",a.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(s){console.error("when evaluating "+a.js,s,this.component,this.state,this.data)}if(a&&a.customEvent&&this.dispatchEvent(new CustomEvent(a.customEvent.name,{detail:a.customEvent.detail,bubbles:!0,composed:!0})),!(a&&(a.js||a.customEvent))){if(e.actionId=="search"){const s=e.parameters?._searchState;s?this.state={...this.state,...s}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}this.dispatchEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:{...this.state},parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:a?.background,sse:a?.sse,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))}},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(s=>s.type==ft.OnSuccess).filter(s=>e.detail.actionId==s.calledActionId).forEach(s=>{if(!s.condition||this._evalExpr(s.condition))if(e.preventDefault(),e.stopPropagation(),s.timeoutMillis>0){const i=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId,callbackToken:i},bubbles:!0,composed:!0}))},s.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(s=>s.type==ft.OnError).filter(s=>e.detail.actionId==s.calledActionId).forEach(s=>{(!s.condition||this._evalExpr(s.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0})))})},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;const t=this.component;if(t)for(const a of t.actions??[]){const s=a.shortcut||(a.runOnEnter?"enter":null);if(s&&this._shortcutMatchesEvent(s,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return K.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has("state")&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has("component")&&(this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}_shortcutMatchesEvent(e,t){return zr(e,t)}_collectShortcutTabs(){const e=this.renderRoot;if(!e)return[];const t=Array.from(e.querySelectorAll("vaadin-tab[data-shortcut]"));return e.querySelectorAll("mateu-drawer, mateu-dialog").forEach(a=>{const s=a.shadowRoot;s&&t.push(...Array.from(s.querySelectorAll("vaadin-tab[data-shortcut]")))}),t}_handleTabShortcut(e){const t=this._collectShortcutTabs();if(t.length===0)return!1;for(const a of Array.from(t)){const s=a.dataset.shortcut;if(!s||!this._shortcutMatchesEvent(s,e))continue;const i=a.closest("vaadin-tabs");if(!i)continue;const r=Array.from(i.querySelectorAll("vaadin-tab")).indexOf(a);if(!(r<0))return e.preventDefault(),i.selected=r,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.addEventListener("backend-call-failed",this.handleBackendFailed),document.addEventListener("keydown",this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.removeEventListener("backend-call-failed",this.handleBackendFailed),document.removeEventListener("keydown",this._keydownListener)}render(){return n`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?n`
                <div><ul>${this.data.errors._component.map(e=>n`<li>${e}</li>`)}</ul></div>
            `:d}</div>`}_render(){if(this.component?.type==ee.ClientSide){const e=this.component;return e.metadata?.type==m.Page?Ha(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==m.Crud?Ga(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):K.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return n`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==ee.ClientSide){const t=e;if(t.metadata?.type==m.Page)return Ha(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==m.Crud)return Ga(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return $(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}};Ut.styles=R`
        :host {
        }

        ${xs(yt.cssText)}
        
        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }
        
  `;Aa([v()],Ut.prototype,"baseUrl",2);Aa([v()],Ut.prototype,"route",2);Aa([v()],Ut.prototype,"consumedRoute",2);Ut=Aa([I("mateu-component")],Ut);const zi=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}};class bd{async handle(t,a){return await t.runAction(a.baseUrl,a.route,a.consumedRoute,a.actionId,a.initiatorComponentId,a.appState,a.serverSideType,a.componentState,a.parameters,a.initiator,a.background)}}const gd=new bd;class $d{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,a,s)=>{if(t?.fragments?.forEach(i=>{bt.next({command:void 0,fragment:i,ui:void 0,error:void 0,callbackToken:s})}),t?.appState&&(ae.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const i=t?.appData;aa.value={...t.appData,...i},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}t?.messages?.forEach(i=>{na.show(i.text,{position:i.position?this.mapPosition(i.position):void 0,theme:i.variant,duration:i.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(i=>{bt.next({command:i,fragment:void 0,ui:void 0,error:void 0,callbackToken:s})})}}async runAction(t,a,s,i,r,o,l,c,u,h,p,f,y,w,x){try{const _=await gd.handle(t,{baseUrl:a,route:s,consumedRoute:i,actionId:r,appState:ae.value,initiatorComponentId:o,componentState:u,parameters:h,serverSideType:c,initiator:p,background:f});y&&y(_),w||this.handleUIIncrement(_,p,x),_.messages&&_.messages.length==1&&_.messages[0].variant=="error"&&p.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0})),p.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r,evevntId:de()},bubbles:!0,composed:!0}))}catch(_){console.warn("Action request failed",_),p.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(_)}})),p.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}}serialize(t){return t?.message?t:JSON.stringify(t)}}const yd=new $d,xd=yd;class wd{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,a,s)=>{if(t?.messages?.forEach(i=>{na.show(i.text,{position:i.position?this.mapPosition(i.position):"bottom-end",theme:i.variant,duration:i.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(i=>{bt.next({command:i,fragment:void 0,ui:void 0,error:void 0,callbackToken:s})}),t?.fragments?.forEach(i=>{bt.next({command:void 0,fragment:i,ui:void 0,error:void 0,callbackToken:s})}),t?.appState&&(ae.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const i=t?.appData;aa.value={...t.appData,...i},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}}}async runAction(t,a,s,i,r,o,l,c,u,h,p,f,y,w,x){if(s){s=s||"_no_route",s&&s.startsWith("/")&&(s=s.substring(1));const _={serverSideType:c,appState:ae.value,componentState:u,parameters:h,initiatorComponentId:o,consumedRoute:i,route:"/"+s,actionId:r};f||p.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),fetch(a+"/mateu/v3/sse/"+s,{method:"POST",headers:{Accept:"text/event-stream","Content-Type":"application/json"},body:JSON.stringify(_)}).then(async U=>{const Y=U.body?.pipeThrough(new TextDecoderStream).getReader();if(Y){let q="";for(;;){const{value:X,done:Ce}=await Y.read();if(Ce)break;q+=X;const tt=q.split(`

`);q=tt.pop()??"";for(const Lt of tt){const k=Lt.trim();if(k)if(k.startsWith("data:")){const P=JSON.parse(k.substring(5).trim());y&&y(P),w||this.handleUIIncrement(P,p,x),P.messages&&P.messages.length==1&&P.messages[0].variant=="error"&&p.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}else{let P=k;try{const E=JSON.parse(k);P=E.message,E._embedded?.errors?.length>0&&E._embedded.errors[0].message&&(P=E._embedded.errors[0].message)}catch{}throw new Error(P)}}}}f||p.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:r}})),p.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r},bubbles:!0,composed:!0}))}).catch(U=>{p.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(U)}})),p.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))})}}serialize(t){return t?.message?t:JSON.stringify(t)}}const kd=new wd;var Cd=Object.defineProperty,Sd=Object.getOwnPropertyDescriptor,Oe=(e,t,a,s)=>{for(var i=s>1?void 0:s?Sd(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Cd(t,a,i),i};let he=class extends Ra{constructor(){super(...arguments),this.consumedRoute="",this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t=="string"&&(t===""||t.startsWith("/"))&&this.consumedRoute&&this.consumedRoute!=="_empty"&&this.consumedRoute.startsWith("/")&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t.startsWith("/")&&this.uriPrefix.endsWith("/")?t=this.uriPrefix+t.substring(1):!t.startsWith("/")&&!this.uriPrefix.endsWith("/")?t=this.uriPrefix+"/"+t:t=this.uriPrefix+t),this.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==""&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:ee.ClientSide,metadata:{type:m.Element,name:"div",content:"Not found"},id:"fieldId"},action:ra.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;const t=this.detail1;if(e.type=="server-side-action-requested"){let a=xd;t.sse&&(a=kd),a.runAction(ni,this.baseUrl,t.route??"",t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken)}},this.getCustomisedAppState=()=>{let e={...ae.value};if(this.overrides){const t=zi(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw new Error("Method not implemented.")}createRenderRoot(){return K.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.overridesParsed=zi(this.overrides),this.addEventListener("server-side-action-requested",this.actionRequestedListener),this.addEventListener("backend-call-failed",this.backendFailedListener),this.addEventListener("history-pushed",this.historyPushed),this.addEventListener("route-changed",this.routeChangedListener),window.Vaadin.featureFlags.masterDetailLayoutComponent=!0}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.actionRequestedListener),this.removeEventListener("backend-call-failed",this.backendFailedListener),this.removeEventListener("history-pushed",this.historyPushed),this.removeEventListener("route-changed",this.routeChangedListener)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(a=>a==="appState"||a==="appData")){const a=this.renderRoot.querySelector("mateu-component");if(a)return e.has("appState")&&(a.appState=this.appState),e.has("appData")&&(a.appData=this.appData),!1}return!0}updated(e){(e.has("id")||e.has("baseurl")||e.has("route")||e.has("consumedRoute")||e.has("instant"))&&(this.preventNavigation||(this.callbackToken=this.instant||de(),this.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:"",serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,callbackToken:this.callbackToken},bubbles:!0,composed:!0})))),e.has("route")&&this.top&&(this.preventNavigation||this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&(this.preventNavigation=!1)}applyFragment(e){if(!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}};return}this.fragment=e}render(){return n`
           ${this.fragment?.component?$(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):d}
       `}};he.styles=R`
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
  `;Oe([v()],he.prototype,"consumedRoute",2);Oe([v()],he.prototype,"serverSideType",2);Oe([v()],he.prototype,"uriPrefix",2);Oe([v()],he.prototype,"overrides",2);Oe([v()],he.prototype,"homeRoute",2);Oe([v()],he.prototype,"route",2);Oe([v()],he.prototype,"top",2);Oe([v()],he.prototype,"instant",2);Oe([v()],he.prototype,"appState",2);Oe([v()],he.prototype,"appData",2);Oe([g()],he.prototype,"fragment",2);he=Oe([I("mateu-ux")],he);class Ed{constructor(){this._dirty=!1,this._installed=!1,this.message="You have unsaved changes. Are you sure you want to leave this page?",this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=t=>{this._dirty&&(t.preventDefault(),t.returnValue="")}}install(){this._installed||(this._installed=!0,document.addEventListener("dirty",this._onDirty),document.addEventListener("clean",this._onClean),window.addEventListener("beforeunload",this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;const t=window.confirm(this.message);return t&&(this._dirty=!1),t}}const zt=new Ed;var Id=Object.defineProperty,_d=Object.getOwnPropertyDescriptor,J=(e,t,a,s)=>{for(var i=s>1?void 0:s?_d(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Id(t,a,i),i};let M=class extends wt{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0,this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this.isDark=document.documentElement.getAttribute("theme")==="dark",this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;const e=this.isDark?"dark":"light";document.documentElement.setAttribute("theme",e),localStorage.setItem("mateu-theme",e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?"detail":"detail-hidden")},this.runAction=e=>{const a=this.renderRoot.querySelector?.("mateu-component");a&&a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){const a=e[t];if(a.selected)return a;const s=this.getSelectedOption(a.submenus);if(s)return s}return null},this.itemSelected=e=>{const t=e.detail.value;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.itemSelectedTiles=e=>{const t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))},this.mapItemsForTiles=e=>e.map(t=>({text:t.label,consumedRoute:t.consumedRoute,route:t.route,baseUrl:t.baseUrl,serverSideType:t.serverSideType,uriPrefix:t.uriPrefix,actionId:t.actionId,selected:t.selected,_menuOption:t})),this.flattenMenuForPalette=(e,t)=>{const a=[];for(const s of e)if(!s.separator)if(s.submenus&&s.submenus.length>0){const i=t?`${t} › ${s.label}`:s.label;a.push(...this.flattenMenuForPalette(s.submenus,i))}else a.push({label:s.label,breadcrumb:t,consumedRoute:s.consumedRoute,route:s.route,actionId:s.actionId,baseUrl:s.baseUrl,serverSideType:s.serverSideType,uriPrefix:s.uriPrefix});return a},this.handleCommandPaletteKeydown=(e,t)=>{if(e.key==="ArrowDown")e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,Math.min(t.length,10)-1);else if(e.key==="ArrowUp")e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key==="Enter"){const a=t[this.commandPaletteSelectedIndex];a&&(this.selectRoute(a.consumedRoute,a.route,a.actionId,a.baseUrl,a.serverSideType,a.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery="")}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return d;const e=this.component?.metadata;if(!e?.menu)return d;const t=this.flattenMenuForPalette(e.menu,""),a=this.commandPaletteQuery.toLowerCase(),s=a?t.filter(i=>i.label.toLowerCase().includes(a)||i.breadcrumb.toLowerCase().includes(a)):t;return n`
            <div class="cmd-backdrop" @click=${()=>{this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}>
                <div class="cmd-palette" @click=${i=>i.stopPropagation()}>
                    <div class="cmd-search-wrapper">
                        <vaadin-icon icon="vaadin:search" class="cmd-search-icon"></vaadin-icon>
                        <input
                            class="cmd-input"
                            placeholder="Go to…"
                            .value=${this.commandPaletteQuery}
                            @input=${i=>{this.commandPaletteQuery=i.target.value,this.commandPaletteSelectedIndex=0}}
                            @keydown=${i=>this.handleCommandPaletteKeydown(i,s)}
                        >
                    </div>
                    <div class="cmd-results">
                        ${s.slice(0,10).map((i,r)=>n`
                            <div class="cmd-result ${r===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                @click=${()=>{this.selectRoute(i.consumedRoute,i.route,i.actionId,i.baseUrl,i.serverSideType,i.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}
                                @mouseenter=${()=>{this.commandPaletteSelectedIndex=r}}
                            >
                                <span class="cmd-result-label">${i.label}</span>
                                ${i.breadcrumb?n`<span class="cmd-result-breadcrumb">${i.breadcrumb}</span>`:d}
                            </div>
                        `)}
                        ${s.length===0?n`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>`:d}
                    </div>
                </div>
            </div>
        `},this.renderRail=e=>n`
            <div class="nav-rail">
                ${e.map(t=>this.renderRailItem(t))}
            </div>
        `,this.renderRailItem=e=>{const t=e.submenus?.length>0?this.railOpenOption?.label===e.label:e.selected;return n`
            <div class="rail-item ${t?"rail-item--active":""}"
                @click=${()=>{e.submenus&&e.submenus.length>0?this.railOpenOption=this.railOpenOption?.label===e.label?null:e:(this.railOpenOption=null,this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix))}}
            >
                ${e.icon?n`<vaadin-icon icon="${e.icon}" class="rail-icon"></vaadin-icon>`:n`<div class="rail-icon-placeholder">${e.label.charAt(0).toUpperCase()}</div>`}
                <span class="rail-label">${e.label}</span>
            </div>
        `},this.renderRailSubPanel=e=>n`
            <div class="rail-sub-panel">
                <div class="rail-sub-title">${e.label}</div>
                ${e.submenus.map(t=>n`
                    <div class="rail-sub-item ${t.selected?"rail-sub-item--active":""}"
                        @click=${()=>{t.submenus&&t.submenus.length>0?this.railOpenOption=t:this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}
                    >${t.label}</div>
                `)}
            </div>
        `,this.renderTilesHub=e=>n`
            <div style="padding: 2rem;">
                <h2 style="margin-top: 0; margin-bottom: 1.5rem;">${e.label}</h2>
                <div class="tiles-hub-grid">
                    ${e.submenus.map(t=>n`
                        <div class="nav-tile"
                            @click=${()=>{t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))}}
                        >
                            ${t.icon?n`<vaadin-icon icon="${t.icon}" style="font-size: 2rem; color: var(--lumo-primary-color); display: block; margin-bottom: 0.75rem;"></vaadin-icon>`:d}
                            <div class="nav-tile-title">${t.label}</div>
                            ${t.description?n`<div class="nav-tile-desc">${t.description}</div>`:d}
                        </div>
                    `)}
                </div>
            </div>
        `,this.goHome=()=>{const e=this.component.metadata;this.selectRoute(e.route,"_page","",void 0,void 0,void 0)},this.selectRoute=(e,t,a,s,i,r)=>{zt.confirmLeave()&&this._selectRoute(e,t,a,s,i,r)},this._selectRoute=(e,t,a,s,i,r)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=s,this.selectedRoute=t,this.selectedServerSideType=i,this.selectedUriPrefix=r,this.instant=de(),this.state&&this.state._route!=null&&(this.state._route=void 0);let o=this.baseUrl??"";o.indexOf("://")<0&&(o.startsWith("/")||(o="/"+o),o=window.location.origin+o),o.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let l=new URL(o+t);if(e&&l.pathname.startsWith(e)){const c=l.pathname.substring(e.length);l=new URL(l.origin+(c||"/"))}if((window.location.pathname||l.pathname)&&window.location.pathname!=l.pathname){let c=l.pathname;l.search&&(c+=l.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let u=c;this.selectedUriPrefix&&(u.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+u.substring(1):!u.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+"/"+u:u=this.selectedUriPrefix+u),u=="/_page"&&(u=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:u},bubbles:!0,composed:!0}))}}},this.mapItems=(e,t)=>e.map(a=>{if(a.submenus&&a.submenus.length>0){let s=this.mapItems(a.submenus,t);return t&&a.label.toLowerCase().includes(t)&&(s=this.mapItems(a.submenus,"")),s&&s.length>0?{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||a.selected,children:s}:void 0}if(a.separator)return t?void 0:{component:"hr"};if(!t||a.label.toLowerCase().includes(t))return{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||a.selected}}).filter(a=>a!=null),this.getSelectedIndex=e=>{if(e){const t=this.getSelectedOption(e);if(t)return e.indexOf(t)}return NaN},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?n`
                <vaadin-details summary="${e.label}" theme="reverse">
                    <vaadin-vertical-layout>
                        ${e.submenus.map(t=>n`${this.renderOptionOnLeftMenu(t)}`)}
                    </vaadin-vertical-layout>
                </vaadin-details>
`:n`<vaadin-button theme="tertiary" 
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)}"
        >${e.label}</vaadin-button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){const t=this.shadowRoot?.querySelector("mateu-ux");t&&t.setAttribute("instant",de())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?n`
            ${e.map(a=>{const s=a;return n`

                        ${s.component=="hr"?n`<hr slot="children"/>`:n`
                                <vaadin-side-nav-item
                                .path="${s.route&&!s.children?s.route:void 0}"
                                .pathAliases="${[this.baseUrl+(s.route?s.route:"")]}"
                                slot="${t}"
                                ?expanded="${s.selected}"
                                >
                                    ${s.icon?n`
                                        <vaadin-icon icon="vaadin:dashboard" slot="prefix"></vaadin-icon>
                                    `:d}
                                    ${s.text}
                                    ${this.renderSideNav(s.children,"children")}
                                </vaadin-side-nav-item>
                        `}

                            `})}`:d,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}createRenderRoot(){return K.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute("theme")==="dark",this._commandPaletteHandler=e=>{(e.metaKey||e.ctrlKey)&&e.key==="k"&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0),e.key==="Escape"&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery="")},document.addEventListener("keydown",this._commandPaletteHandler),zt.install(),this.addEventListener("compact-changed",this._compactHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener("keydown",this._commandPaletteHandler),this.removeEventListener("compact-changed",this._compactHandler)}updated(e){if(super.updated(e),this.component){const a=this.component.metadata;if(a){const s=a;if(s.favicon){let i=document.querySelector("link[rel~='icon']");i||(i=document.createElement("link"),i.rel="icon",document.head.appendChild(i)),i.href=s.favicon}e.has("component")&&(this.selectedRoute=s.homeRoute,this.selectedConsumedRoute=s.homeConsumedRoute,this.selectedServerSideType=s.homeServerSideType,this.selectedBaseUrl=s.homeBaseUrl,this.selectedUriPrefix=s.homeUriPrefix)}}e.has("commandPaletteOpen")&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(".cmd-input")?.focus()},0)}render(){return K.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}};M.styles=R`

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

  `;J([g()],M.prototype,"filter",2);J([g()],M.prototype,"instant",2);J([g()],M.prototype,"selectedConsumedRoute",2);J([g()],M.prototype,"selectedRoute",2);J([g()],M.prototype,"selectedUriPrefix",2);J([g()],M.prototype,"selectedBaseUrl",2);J([g()],M.prototype,"selectedServerSideType",2);J([g()],M.prototype,"selectedParams",2);J([g()],M.prototype,"tilesMenuOption",2);J([g()],M.prototype,"railOpenOption",2);J([g()],M.prototype,"commandPaletteOpen",2);J([g()],M.prototype,"commandPaletteQuery",2);J([g()],M.prototype,"commandPaletteSelectedIndex",2);J([g()],M.prototype,"pageCompact",2);J([Ye("mateu-chat")],M.prototype,"chat",2);J([g()],M.prototype,"isDark",2);J([g()],M.prototype,"chatOpen",2);J([Ye("vaadin-app-layout")],M.prototype,"vaadinAppLayout",2);M=J([I("mateu-app")],M);var Td=Object.defineProperty,Rd=Object.getOwnPropertyDescriptor,ct=(e,t,a,s)=>{for(var i=s>1?void 0:s?Rd(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&Td(t,a,i),i};let Ne=class extends M{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.lastActionServerSideType=void 0,this.lastActionInitiatorComponentId=void 0,this.captureActionSST=e=>{const t=e.detail;typeof t?.serverSideComponentRoute=="string"&&t.serverSideComponentRoute.indexOf("_embeddedMediator=1")>=0||t?.serverSideType&&(this.lastActionServerSideType=t.serverSideType,this.lastActionInitiatorComponentId=t.initiatorComponentId)},this.handleUnhandledAction=e=>{if(this.component?.metadata?.variant==le.MEDIATOR)return;const a=e.detail;e.preventDefault(),e.stopPropagation();const s=this.renderRoot?.querySelector("#"+this.contentUxId);!s||typeof s.manageActionEvent!="function"||(this.lastActionServerSideType=this.selectedServerSideType,this.lastActionInitiatorComponentId=s.id,s.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:s.route??this.selectedRoute??"",consumedRoute:s.consumedRoute??this.selectedConsumedRoute??"",componentState:a.parameters?.initiatorState??{},parameters:a.parameters,actionId:a.actionId,serverSideType:this.selectedServerSideType??"",initiatorComponentId:s.id,initiator:s}})))},this.selectRoute=(e,t,a,s,i,r)=>{{const o=this.component?.metadata;if(o?.variant!=le.MEDIATOR&&!a&&(!s||s===this.baseUrl)&&(!i||i===o?.serverSideType)&&t!=null){if(!zt.confirmLeave())return;this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:t},bubbles:!0,composed:!0}));return}}{this.selectedConsumedRoute=e,this.selectedBaseUrl=s,this.selectedRoute=t,this.selectedServerSideType=i,this.selectedUriPrefix=r,this.instant=de();let o=this.baseUrl??"";o.indexOf("://")<0&&(o.startsWith("/")||(o="/"+o),o=window.location.origin+o),o.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let l=new URL(o+t);if(e&&(t??"").startsWith(e)&&(l=new URL(o+t?.substring(e.length))),(window.location.pathname||l.pathname)&&window.location.pathname!=l.pathname){let c=l.pathname;l.search&&(c+=l.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let u=c;this.selectedUriPrefix&&(u.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+u.substring(1):!u.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+"/"+u:u=this.selectedUriPrefix+u),u=="_page"&&(u=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:u},bubbles:!0,composed:!0}))}}},this.updateRoute=e=>{e.preventDefault(),e.stopPropagation(),console.log("update route",e,this);var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.ds=e=>e&&e!=="undefined"&&e!=="null"?e:void 0,this.tabSelected=(e,t,a)=>{this.selectRoute(this.ds(e.detail.tab.dataset.consumedRoute),this.ds(e.detail.tab.dataset.route),this.ds(e.detail.tab.dataset.actionId),this.ds(e.detail.tab.dataset.baseUrl),this.ds(e.detail.tab.dataset.serverSideType),this.ds(e.detail.tab.dataset.uriPrefix))},this.mode=ga.Auto,this.toggle=e=>{this.mode=this.mode==ga.Expanded?ga.Collapsed:ga.Expanded,e.requestUpdate()},this.selected=(e,t,a,s)=>{console.log("selected",e,e.target,e.detail.value);const i=this.renderRoot.querySelector('[data-path = "'+e.detail.value+'"]');if(i){this.selectRoute(this.ds(i.dataset.consumedRoute),this.ds(i.dataset.route),this.ds(i.dataset.actionId),this.ds(i.dataset.baseUrl),this.ds(i.dataset.serverSideType),this.ds(i.dataset.uriPrefix));return}const r=l=>{for(const c of l??[]){if(c.route===e.detail.value||c.path===e.detail.value)return c;const u=r(c.submenus);if(u)return u}},o=r(s?.menu);o?this.selectRoute(o.consumedRoute,o.route,o.actionId,o.baseUrl,o.serverSideType,o.uriPrefix):console.error("No item found for selected route",e.detail.value)}}get contentUxId(){return this._contentUxId||(this._contentUxId="ux_"+(window.location.pathname||"root").replace(/[^a-zA-Z0-9]/g,"_")+"_app"),this._contentUxId}connectedCallback(){super.connectedCallback(),this.addEventListener("server-side-action-requested",this.captureActionSST,!0),this.addEventListener("action-requested",this.handleUnhandledAction),this.innerFragmentSubscription=bt.subscribe(e=>{const t=e.fragment;if(t&&this.lastActionInitiatorComponentId&&t.targetComponentId===this.lastActionInitiatorComponentId&&t.state?._route!==void 0){const a=t.state._route;if(a!==""&&!a.startsWith("/")){this.lastActionInitiatorComponentId=void 0,this.lastActionServerSideType=void 0;return}const s=t.state._componentRoute||"",i=this.component?.metadata,r=this.renderRoot?.querySelector("#"+this.contentUxId),o=r?.consumedRoute&&r.consumedRoute!=="_empty"?r.consumedRoute:"",l=s||this.selectedConsumedRoute||o||i?.homeConsumedRoute||"",c=l+a;this.lastActionInitiatorComponentId=void 0,c!==this.selectedRoute&&(this.selectedConsumedRoute=l,this.selectedRoute=c,this.lastActionServerSideType&&(this.selectedServerSideType=this.lastActionServerSideType),this.state&&this.state._route!=null&&(this.state._route=void 0),this.instant=de()),this.lastActionServerSideType=void 0}})}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.captureActionSST,!0),this.removeEventListener("action-requested",this.handleUnhandledAction),this.innerFragmentSubscription?.unsubscribe()}render(){const e=this.component.metadata,t=this.data.opened==null?!0:this.data.opened;this.data.opened=t;const a=i=>{console.log("open",this.data.opened),this.data.opened=!this.data.opened,this.requestUpdate()},s=i=>{this.data.opened=!1,this.requestUpdate()};if(e.variant==le.MEDIATOR)return n`
                        <mateu-api-caller>
                            <mateu-ux
                                    route="${Se(this.state,this,e)}"
                                    id="ux_${this.id}"
                                    baseUrl="${me(this,e)}"
                                    consumedRoute="${Q(this,e)}"
                                    serverSideType="${ve(this,e)}"
                                    uriPrefix="${fe(this,e)}"
                                    style="width: 100%;"
                                    .appState="${this.appState}"
                                    .appData="${this.appData}"
                                    instant="${this.instant}"
                                    @navigation-requested="${this.updateRoute}"
                            ></mateu-ux>
                        </mateu-api-caller>
`;if(le.TABS==e.variant){const i=e.menu.map(r=>({label:r.label,itemKey:r.route}));return n`<div>
            <div><oj-c-tab-bar
                    .data="${i}"
                    .selection="${i[0].itemKey}"
                    @ojSelectionAction="${r=>this.selected(r,this,this.baseUrl??"",e)}"
                    edge="top"
                    
                    
                    
                    layout="condense"
                    display="standard"
                    aria-label="Basic TabBar"
            >
            </oj-c-tab-bar></div>
            <div id="xxxxx" class="demo-padding" style="width: 100%; height: -webkit-fill-available;">
                <div class="content" style="padding-left: 2rem; padding-right: 2rem; padding-bottom: 2rem;">
                    <mateu-api-caller style="width: 100%;">
                        <mateu-ux
                                route="${Se(this.state,this,e)}"
                                id="${this.contentUxId}"
                                baseUrl="${me(this,e)}"
                                consumedRoute="${Q(this,e)}"
                                serverSideType="${ve(this,e)}"
                                uriPrefix="${fe(this,e)}"
                                style="width: 100%;"
                                .appState="${this.appState}"
                                .appData="${this.appData}"
                                instant="${this.instant}"
                                @navigation-requested="${this.updateRoute}"
                        ></mateu-ux>
                    </mateu-api-caller>
                </div>
            </div>
        </div>`}if(le.MENU_ON_LEFT==e.variant){const i=e.menu.map(h=>({label:h.label,itemKey:h.route}));if(!e.homeRoute||e.homeRoute==="_no_home_route"){const h=e.menu[0];e.homeRoute=h?.submenus?.length?h.submenus[0].route:h?.route??""}const r=this.data.activeTopRoute??e.menu.find(h=>h.route===e.homeRoute||h.submenus?.some(p=>p.route===e.homeRoute))?.route??e.menu[0]?.route??"";this.data.activeTopRoute=r;const o=e.menu.find(h=>h.route===r),l=(o?.submenus??[]).map(h=>({label:h.label,itemKey:h.route}));if(this.data.activeConsumedRoute===void 0){const h=o?.submenus?.find(p=>p.route===e.homeRoute);this.data.activeConsumedRoute=h?.consumedRoute??o?.consumedRoute??e.homeConsumedRoute??"",this.data.activeServerSideType=h?.serverSideType??o?.serverSideType??e.homeServerSideType??""}const c=h=>{const p=h.detail.value;this.data.activeTopRoute=p;const f=e.menu.find(y=>y.route===p);if(f?.submenus?.length){const y=f.submenus[0];this.data.activeConsumedRoute=y.consumedRoute??"",this.data.activeServerSideType=y.serverSideType??f.serverSideType??e.serverSideType??"",this.selected({...h,detail:{...h.detail,value:y.route}},this,this.baseUrl??"",e)}else this.data.activeConsumedRoute=f?.consumedRoute??"",this.data.activeServerSideType=f?.serverSideType??e.serverSideType??"",this.selected({...h,detail:{...h.detail,value:p}},this,this.baseUrl??"",e)},u=h=>{const p=h.detail.value,y=e.menu.flatMap(w=>w.submenus??[]).find(w=>w.route===p);this.data.activeConsumedRoute=y?.consumedRoute??"",this.data.activeServerSideType=y?.serverSideType??e.serverSideType??"",this.selected(h,this,this.baseUrl??"",e)};return n`<div style="${this.style??d}">
            <oj-c-tab-bar
                    .data="${i}"
                    .selection="${r}"
                    @ojSelectionAction="${c}"
                    edge="top"
                    layout="condense"
                    display="standard"
                    aria-label="Main navigation"
            ></oj-c-tab-bar>
            ${l.length>0?n`
            <oj-c-tab-bar
                    .data="${l}"
                    .selection="${e.homeRoute}"
                    @ojSelectionAction="${u}"
                    edge="top"
                    layout="condense"
                    display="standard"
                    aria-label="Sub navigation"
            ></oj-c-tab-bar>`:d}
            <div style="padding: 1rem;">
                <mateu-api-caller style="width: 100%;">
                    <mateu-ux
                            route="${Se(this.state,this,e)}"
                            id="${this.contentUxId}"
                            baseUrl="${me(this,e)}"
                            consumedRoute="${Q(this,e)}"
                            serverSideType="${ve(this,e)}"
                            uriPrefix="${fe(this,e)}"
                            style="width: 100%;"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                            instant="${this.instant}"
                            @navigation-requested="${this.updateRoute}"
                    ></mateu-ux>
                </mateu-api-caller>
            </div>
        </div>`}return n`
        <div id="componentDemoContent" style="width: 100%;">

            <div id="demo-container" style="width: 100%; height: -webkit-fill-available;">
                <header id="header" role="banner" class="oj-flex-bar oj-web-applayout-header oj-sm-align-items-center"> <!-- Header: Main -->
                    <div class="oj-flex-bar oj-sm-flex-1 oj-sm-align-items-center oj-sm-only-width-full oj-sm-only-padding-0-end oj-sm-only-padding-0-start">
                        <div class="oj-flex-bar-start">
                            <div class="oj-sm-only-hide oj-flex oj-sm-align-items-center">
                                <oj-button id="toggleNavListButton"
                                           class="toggleNavListButton oj-lg-hide oj-button oj-button-half-chrome oj-button-icon-only oj-enabled oj-default oj-complete"
                                           chroming="half" display="icons" @ojAction="${a}"
                                           title="Cookbook navigation">
                                    <button aria-labelledby="toggleNavListButton_oj0|text" class="oj-button-button">
                                        <div class="oj-button-label"><span class="oj-button-icon oj-start"><span
                                                slot="startIcon" title="Cookbook Navigation"
                                                class="oj-ux-ico-menu"></span></span><span
                                                id="toggleNavListButton_oj0|text"
                                                class="oj-button-text oj-helper-hidden-accessible">
    Cookbook navigation
  </span></div>
                                    </button>
                                </oj-button>

                                <div id="togglePinnedNavListButtonDiv"
                                     class="togglePinnedNavListButtonSet oj-sm-only-hide oj-md-only-hide">
                                    <oj-button chroming="borderless" id="borderlessPushIcon"
                                               @ojAction="${open}" display="icons"
                                               class="oj-button oj-button-half-chrome oj-button-icon-only oj-enabled oj-complete oj-default"
                                               title="Cookbook navigation">
                                        <button aria-labelledby="borderlessPushIcon_oj1|text" class="oj-button-button">
                                            <div class="oj-button-label"><span class="oj-button-icon oj-start"><span
                                                    slot="startIcon" class="oj-ux-ico-menu"></span></span><span
                                                    id="borderlessPushIcon_oj1|text"
                                                    class="oj-button-text oj-helper-hidden-accessible">
         Cookbook navigation
      </span></div>
                                        </button>
                                    </oj-button>
                                </div>

                                <span class="oj-sm-only-hide oj-flex-item"><img alt="Oracle JET icon"
                                                                                src="/images/JET-icon.png"
                                                                                width="24" height="24"></span>
                                <span class=" oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-padding-2x-start">${e.title}</span>

                            </div>
                        </div>
                        <div 
                             class="oj-flex-bar-end  oj-sm-align-items-center oj-sm-only-width-full">
                            ${(e.contextSelectors??[]).map(i=>n`
                                <mateu-app-context-picker style="margin-right: 0.75rem;" .selector="${i}" .app="${e}" .baseUrl="${""}"></mateu-app-context-picker>`)}
                            <div class="oj-flex-item oj-sm-padding-2x-end">
                                <oj-button title="JET Website Home" chroming="borderless"
                                            display="icons"
                                           class="oj-button oj-button-half-chrome oj-button-icon-only oj-enabled oj-complete oj-default">
                                    <button class="oj-button-button">
                                        <div class="oj-button-label"><span class="oj-button-icon oj-start"><span
                                                slot="startIcon" class="oj-ux-ico-home"></span></span><span></span>
                                        </div>
                                    </button>
                                </oj-button>
                            </div>

                        </div>
                    </div>
                </header>
                <!--
                <div class="demo-header demo-padding oj-bg-neutral-0 oj-divider-bottom">
                    <div>
                        <oj-c-button id="buttonOpener" display="icons" @ojAction="${open}" label="Start">
                            <span slot="startIcon" class="oj-ux-ico-menu"></span>
                        </oj-c-button>
                    </div>
                    <span class=" oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-padding-2x-start">${e.title}</span>
                    <oj-c-avatar
                            aria-label="JD"
                            initials="JD"
                            background="green"
                            title="JD"
                            size="sm"
                            shape="circle">
                    </oj-c-avatar>
                </div>
                -->
                <oj-c-drawer-layout start-opened="${t}"
                                    start-display="reflow"
                                    class="demo-full-height"
                                    style="height: calc(100vh - 165px);"
>
                    
                    <div slot="start" class="demo-drawer-start  oj-bg-neutral-170 oj-color-invert" id="demo-drawer-start" style="height: calc(100% - 10px);">
                        <!--
                        <div class="demo-drawer-header" style="display: flex; padding: 0.3rem 1rem 0 1rem; justify-content: space-between; align-items: center;">
                            <div>
                                <h6>${e.title}</h6>
                            </div>
                            <oj-c-button
                                    id="buttonCloser"
                                    display="icons"
                                    chroming="borderless"
                                    @ojAction="${s}"
                                    label="Close">
                                <span slot="startIcon" class="oj-ux-ico-close"></span>
                            </oj-c-button>
                        </div>
                        -->
                        <oj-navigation-list aria-label="Choose a navigation item"
                        drill-mode="sliding"
                                            selection="${e.route}"
                            @ojSelectionAction="${i=>this.selected(i,this,this.baseUrl??"",e)}"
                                            root-label="Welcome"
                                            class="demo-main-navigation oj-bg-neutral-170 oj-color-invert"
                                            style="height: 100%;"
                        >
                            <ul>
                                ${e.menu.map(i=>n`
                                    <li

                                            data-path="${i.path}"
                                            data-route="${i.route}"
                                            data-consumed-route="${i.consumedRoute}"
                                            data-action-id="${i.actionId}"
                                            data-server-side-type="${i.serverSideType}"
                                            data-uri-prefix="${i.uriPrefix}"
                                            data-base-url="${i.baseUrl}"
                                            .data-params="${i.params}"
                                            
                                            id="${i.path}"><a href="#"
                                    
                                    >${i.label}</a>
                                        ${i.submenus&&i.submenus.length>0?n`
                                        <ul>
                                            ${i.submenus.map(r=>n`
                                                <li
                                                        data-path="${r.path}"
                                                        data-route="${r.route}"
                                                        data-consumed-route="${r.consumedRoute}"
                                                        data-action-id="${r.actionId}"
                                                        data-server-side-type="${r.serverSideType}"
                                                        data-uri-prefix="${r.uriPrefix}"
                                                        data-base-url="${r.baseUrl}"
                                                        .data-params="${r.params}"
                                                        
                                                        id="${r.path}"><a href="#">${r.label}</a></li>
                                            `)}
                                        </ul>
                                        `:d}
                                    </li>
                                `)}
                            </ul>
                        </oj-navigation-list>
                    </div>

                    <div id="xxxxx" class="demo-padding" style="width: 100%; height: -webkit-fill-available;">
                        <div class="content" style="padding-left: 2rem; padding-right: 2rem; padding-bottom: 2rem;">
                            <mateu-api-caller style="width: 100%;">
                                <mateu-ux
                                        route="${Se(this.state,this,e)}"
                                        id="${this.contentUxId}"
                                        baseUrl="${me(this,e)}"
                                        consumedRoute="${Q(this,e)}"
                                        serverSideType="${ve(this,e)}"
                                        uriPrefix="${fe(this,e)}"
                                        style="width: 100%;"
                                        .appState="${this.appState}"
                                        .appData="${this.appData}"
                                        instant="${this.instant}"
                                        @navigation-requested="${this.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        </div>
                    </div>

                </oj-c-drawer-layout>
            </div>



        </div>`}};Ne.styles=R`
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
  `;ct([g()],Ne.prototype,"filter",2);ct([g()],Ne.prototype,"instant",2);ct([g()],Ne.prototype,"selectedConsumedRoute",2);ct([g()],Ne.prototype,"selectedRoute",2);ct([g()],Ne.prototype,"selectedUriPrefix",2);ct([g()],Ne.prototype,"selectedBaseUrl",2);ct([g()],Ne.prototype,"selectedServerSideType",2);ct([g()],Ne.prototype,"selectedParams",2);Ne=ct([I("mateu-redwood-app")],Ne);const Pd=(e,t,a,s,i,r,o)=>n`
        <mateu-redwood-app
                id="${t.id}"
                baseUrl="${a}"
                .component="${t}"
                .state="${s}"
                .data="${i}"
                style="${t.style}"
                class="${t.cssClasses}"
                .appState="${r}"
                .appData="${o}"
                style="width: 100%;"
        ></mateu-redwood-app>
    `,Od=(e,t,a,s,i,r,o)=>{const l=t.metadata;return n`
        
        <mateu-redwood-form 
                id="${t.id}" 
            baseUrl="${a}"
                .component="${t}"
                .values="${s}"
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??d}"
                >

            ${l?.toolbar?.map(c=>n`
                ${$(e,{metadata:c,type:ee.ClientSide,slot:"header"},void 0,{},{},r,o)}
            `)}
            
                    ${t.children?.map(c=>$(e,c,a,s,i,r,o))}
                ${l?.buttons?.map(c=>n`
                   ${$(e,{metadata:c,type:ee.ClientSide,slot:"buttons"},void 0,{},{},r,o)}
`)}

                </mateu-redwood-form>
        
    
    `},jd=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=l.title||l.subtitle||l.toolbar?.length||l.header?.length||l.avatar;return n`
        <div style="display: flex; flex-direction: column; width: 100%; ${t.style??""}" slot="${t.slot??d}" class="${t.cssClasses}">
            ${l.breadcrumbs?.length>0?n`
                <div style="display: flex; align-items: center; gap: 0.25rem; padding: 0.5rem 0; flex-wrap: wrap;">
                    ${l.breadcrumbs.map((u,h)=>n`
                        ${h>0?n`<span>/</span>`:d}
                        ${u.link?n`
                            <oj-c-button
                                data-oj-binding-provider="preact"
                                label="${u.text}"
                                chroming="borderless"
                                @ojAction="${()=>{window.location.href=u.link}}"
                            ></oj-c-button>
                        `:n`<span>${u.text}</span>`}
                    `)}
                </div>
            `:d}
            ${c?n`
                <div style="display: flex; align-items: center; width: 100%; gap: 1rem; padding: 0.5rem 0;">
                    <div style="flex: 1;">
                        <h2 style="margin-block-end: 0px;">${ne(rt(l.title,s,i))}</h2>
                        <span style="display: inline-block;">${ne(rt(l.subtitle,s,i))}</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                        ${l.header?.map(u=>$(e,u,a,s,i,r,o))}
                        ${l.toolbar?.map(u=>$(e,{metadata:u,type:ee.ClientSide,slot:""},void 0,{},{},r,o))}
                    </div>
                </div>
            `:d}
            <div style="width: 100%;">
                ${t.children?.map(u=>$(e,u,a,s,i,r,o))}
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; padding: 0.5rem 0;">
                    ${l.buttons?.map(u=>$(e,{metadata:u,type:ee.ClientSide,slot:""},void 0,{},{},r,o))}
                </div>
            </div>
            ${l.footer?.length?n`
                <div>
                    ${l.footer.map(u=>$(e,u,a,s,i,r,o))}
                </div>
            `:d}
        </div>
    `},fa=(e,t)=>e?e.includes("${")&&t._evalTemplate?t._evalTemplate(e):e:"",we=(e,t,a,s,i,r,o)=>(t.children??[]).map(l=>$(e,l,a,s,i,r,o)),bs=e=>{const t=e?.metadata?.type;return t==="FormRow"||t==="FormItem"?(e.children??[]).flatMap(bs):[e]},Ld=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=Math.max(1,l.maxColumns??1),u=(t.children??[]).flatMap(bs),h=p=>{const f=p?.metadata?.colspan,y=typeof f=="number"?f:parseInt(f??"1",10);return Math.min(Math.max(isNaN(y)?1:y,1),c)};return n`
        <div style="display:grid; grid-template-columns: repeat(${c}, minmax(0,1fr)); gap:.5rem 1.5rem; align-items:start;">
            ${u.map(p=>n`<div style="grid-column: span ${h(p)}; min-width:0; overflow:hidden;">${$(e,p,a,s,i,r,o)}</div>`)}
        </div>`},Ad=(e,t,a,s,i,r,o)=>n`<div style="display:flex; flex-direction:row; gap:1rem; flex-wrap:wrap;">${we(e,t,a,s,i,r,o)}</div>`,Dd=(e,t,a,s,i,r,o)=>{const l=fa(t.metadata.title,e);return n`
        <div class="oj-panel oj-panel-shadow-sm" style="padding:1rem; margin-bottom:1rem; border-radius:var(--oj-core-border-radius-lg, 8px);"
             slot="${t.slot??d}">
            ${l?n`<h2 class="oj-typography-heading-sm" style="margin:0 0 .75rem;">${l}</h2>`:d}
            <div style="display:flex; flex-direction:column; gap:.5rem;">
                ${we(e,t,a,s,i,r,o)}
            </div>
        </div>`},zd=(e,t,a,s,i,r,o)=>{const l=fa(t.metadata.title,e);return n`
        <div style="margin:.5rem 0;" slot="${t.slot??d}">
            ${l?n`<h3 class="oj-typography-subheading-sm" style="margin:0 0 .5rem;">${l}</h3>`:d}
            <div style="display:flex; flex-direction:column; gap:.5rem;">${we(e,t,a,s,i,r,o)}</div>
        </div>`},Nd=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=l?.spacing===!1?"0":"1rem";return n`<div style="display:flex; flex-direction:row; gap:${c}; ${l?.wrap?"flex-wrap:wrap;":""} ${l?.fullWidth?"width:100%;":""} ${t.style??""}"
                     slot="${t.slot??d}">${we(e,t,a,s,i,r,o)}</div>`},Fd=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=l?.spacing===!1?"0":".75rem";return n`<div style="display:flex; flex-direction:column; gap:${c}; ${l?.fullWidth?"width:100%;":""} ${t.style??""}"
                     slot="${t.slot??d}">${we(e,t,a,s,i,r,o)}</div>`},qd=(e,t,a,s,i,r,o)=>{const l=t.metadata?.orientation==="vertical"?"column":"row";return n`<div style="display:flex; flex-direction:${l}; gap:1rem; width:100%; ${t.style??""}" slot="${t.slot??d}">
        ${(t.children??[]).map(c=>n`<div style="flex:1; min-width:0;">${$(e,c,a,s,i,r,o)}</div>`)}
    </div>`},Md=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=h=>h?$(e,h,a,s,i,r,o):d,u=typeof l.title=="string"?l.title:"";if(t.cssClasses?.includes("mateu-section")){const h=u?n`<h2 class="oj-typography-heading-sm" style="margin: 0;">${u}</h2>`:typeof l.title=="object"&&l.title?c(l.title):d;return n`
            <section class="${t.cssClasses}" style="margin: 0 0 1.5rem 0; min-width: 0; overflow-x: auto; ${t.style??""}"
                 slot="${t.slot??d}">
                ${h!==d?n`
                    <div style="padding-bottom: .5rem; border-bottom: 1px solid var(--oj-core-divider-color, rgba(22, 21, 19, 0.2));">${h}</div>
                `:d}
                <div style="padding-top: .75rem;">
                    ${c(l.content)}
                    ${we(e,t,a,s,i,r,o)}
                    ${c(l.footer)}
                </div>
            </section>`}return n`
        <div class="oj-panel oj-panel-shadow-sm" style="border-radius:var(--oj-core-border-radius-lg, 8px); overflow:hidden;"
             slot="${t.slot??d}">
            ${u?n`<h2 class="oj-typography-heading-sm" style="margin:0; padding:.75rem 1rem; border-bottom:1px solid var(--oj-core-divider-color, #e0e0e0);">${u}</h2>`:d}
            <div style="padding:1rem;">
                ${typeof l.title=="object"?c(l.title):d}
                ${c(l.content)}
                ${we(e,t,a,s,i,r,o)}
                ${c(l.footer)}
            </div>
        </div>`},Ud=e=>{switch(e){case"h1":return"oj-typography-heading-xl";case"h2":return"oj-typography-heading-lg";case"h3":return"oj-typography-heading-md";case"h4":return"oj-typography-heading-sm";case"h5":case"h6":return"oj-typography-subheading-sm";default:return"oj-typography-body-md"}},Bd=(e,t,a)=>{const s=t.metadata,i=fa(s.text,e);return n`<div class="${Ud(s.container)}" style="${t.style??""}">${i}</div>`},Wd=e=>{const t=e.metadata,a=t.color;return n`<oj-c-badge variant="${a==="success"?"success":a==="error"||a==="danger"?"danger":a==="warning"?"warning":a==="info"?"info":"neutral"}" slot="${e.slot??d}">${t.text??""}</oj-c-badge>`},Vd=e=>{const t=e.metadata;return n`<a class="oj-link-standalone" href="${t.url??"#"}" slot="${e.slot??d}">${t.text??t.url??""}</a>`},Wa=(e,t)=>{t&&e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:{}},bubbles:!0,composed:!0}))},gs=(e,t,a)=>n`
    <div style="position:fixed; inset:0; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:1000;">
        <div class="oj-panel oj-panel-shadow-lg" role="dialog" aria-modal="true"
             style="background:var(--oj-core-bg-color-content, #fff); border-radius:var(--oj-core-border-radius-lg, 8px); min-width:320px; max-width:90vw; max-height:90vh; overflow:auto;">
            ${e?n`<h2 class="oj-typography-heading-sm" style="margin:0; padding:1rem; border-bottom:1px solid var(--oj-core-divider-color, #e0e0e0);">${e}</h2>`:d}
            <div style="padding:1rem;">${t}</div>
            ${a?n`<div style="display:flex; gap:.5rem; justify-content:flex-end; padding:.75rem 1rem; border-top:1px solid var(--oj-core-divider-color, #e0e0e0);">${a}</div>`:d}
        </div>
    </div>`,Hd=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=fa(l.headerTitle,e),u=p=>p?$(e,p,a,s,i,r,o):d,h=n`${u(l.content)}${we(e,t,a,s,i,r,o)}`;return gs(c,h,u(l.footer))},Gd=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=fa(l.header,e),u=l.content?$(e,l.content,a,s,i,r,o):d,h=n`
        ${l.canCancel?n`<oj-c-button label="${l.cancelText??"Cancel"}" @ojAction="${p=>Wa(p.target,l.cancelActionId)}"></oj-c-button>`:d}
        ${l.canReject?n`<oj-c-button label="${l.rejectText??"No"}" @ojAction="${p=>Wa(p.target,l.rejectActionId)}"></oj-c-button>`:d}
        <oj-c-button chroming="callToAction" label="${l.confirmText??"OK"}" @ojAction="${p=>Wa(p.target,l.confirmActionId)}"></oj-c-button>`;return gs(c,u,h)},Kd=(e,t,a,s,i,r,o)=>n`<div style="overflow: auto; ${t.style??""}" class="${t.cssClasses??d}"
              slot="${t.slot??d}">${we(e,t,a,s,i,r,o)}</div>`,Jd=(e,t,a,s,i,r,o)=>n`<div style="width: 100%; ${t.style??""}" class="${t.cssClasses??d}"
              slot="${t.slot??d}">${we(e,t,a,s,i,r,o)}</div>`,Yd=(e,t,a,s,i,r,o)=>n`<div style="max-width: min(100%, 1200px); margin: auto; ${t.style??""}" class="${t.cssClasses??d}"
              slot="${t.slot??d}">${we(e,t,a,s,i,r,o)}</div>`,Xd=(e,t,a,s,i,r,o)=>n`<div style="display: flex; flex-direction: column; gap: 1rem; width: 100%; ${t.style??""}"
              class="${t.cssClasses??d}" slot="${t.slot??d}">
        ${we(e,t,a,s,i,r,o)}</div>`,Qd=(e,t,a,s,i,r,o)=>{const l=c=>c?.metadata?.type==="BoardLayoutItem"?c.metadata.boardCols??1:1;return n`<div style="display: flex; flex-direction: row; gap: 1rem; width: 100%; ${t.style??""}"
                     class="${t.cssClasses??d}" slot="${t.slot??d}">
        ${(t.children??[]).map(c=>n`
            <div style="flex: ${l(c)} 1 0; min-width: 0;">${$(e,c,a,s,i,r,o)}</div>`)}
    </div>`},Zd=(e,t,a,s,i,r,o)=>n`<div style="${t.style??""}" class="${t.cssClasses??d}">
        ${we(e,t,a,s,i,r,o)}</div>`,ec=(e,t,a,s,i,r,o)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,u=!!i?.hasDetail||!!l,h=c??l;return n`
        <div style="display: flex; gap: 0; width: 100%; border: 1px solid var(--oj-core-divider-color, #e0e0e0); border-radius: var(--oj-core-border-radius-lg, 8px); overflow: hidden; ${t.style??""}"
             class="${t.cssClasses??d}" slot="${t.slot??d}">
            <div style="flex: 1; min-width: 0; overflow-y: auto;">
                ${$(e,t.children[0],a,s,i,r,o)}
            </div>
            <div style="flex: 1; min-width: 0; overflow-y: auto; border-left: 1px solid var(--oj-core-divider-color, #e0e0e0); ${u&&h?"":"display: flex; align-items: center; justify-content: center;"}">
                ${u&&h?$(e,h,a,s,i,r,o):n`<span style="color: var(--oj-core-text-color-secondary, #666); font-size: 0.875rem; padding: 1rem;">Select an item to view details</span>`}
            </div>
        </div>`},tc=(e,t,a,s,i,r,o)=>{const l=t.metadata,c=h=>p=>{const y=p.target.closest(".rw-carousel-wrap")?.querySelector(":scope > .rw-carousel");y?.scrollBy({left:h*y.clientWidth,behavior:"smooth"})},u=l?.nav!==!1;return n`
        <div class="rw-carousel-wrap ${t.cssClasses??""}" style="position: relative; width: 100%; ${t.style??""}"
             slot="${t.slot??d}">
            <div class="rw-carousel" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 1rem; scrollbar-width: none;">
                ${(t.children??[]).map(h=>n`
                    <div style="scroll-snap-align: start; flex: 0 0 100%; min-width: 0;">${$(e,h,a,s,i,r,o)}</div>`)}
            </div>
            ${u?n`
                <div style="display: flex; gap: 0.5rem; justify-content: center; padding-top: 0.5rem;">
                    <oj-c-button data-oj-binding-provider="preact" label="‹" chroming="outlined" @ojAction="${c(-1)}"></oj-c-button>
                    <oj-c-button data-oj-binding-provider="preact" label="›" chroming="outlined" @ojAction="${c(1)}"></oj-c-button>
                </div>
            `:d}
        </div>`};var ac=Object.defineProperty,ic=Object.getOwnPropertyDescriptor,ut=(e,t,a,s)=>{for(var i=s>1?void 0:s?ic(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&ac(t,a,i),i};let Ke=class extends j{constructor(){super(...arguments),this.selected=0}createRenderRoot(){return this}label(e){const t=e?.metadata?.label;return t&&typeof t=="string"&&t.includes("${")&&this.container?._evalTemplate?this.container._evalTemplate(t):t??""}render(){const e=this.component?.children??[],t=e.map((s,i)=>({itemKey:String(i),label:this.label(s)})),a=e[this.selected];return n`
            <div>
                <oj-c-tab-bar data-oj-binding-provider="preact"
                        .data="${t}"
                        .selection="${String(this.selected)}"
                        edge="top"
                        @ojSelectionAction="${s=>{this.selected=parseInt(s.detail.value,10)||0}}"
                ></oj-c-tab-bar>
                <div role="tabpanel" style="padding-top: 1rem;">
                    ${(a?.children??[]).map(s=>$(this.container,s,this.baseUrl,this.compState,this.compData,this.appState,this.appData))}
                </div>
            </div>`}};ut([v({attribute:!1})],Ke.prototype,"component",2);ut([v({attribute:!1})],Ke.prototype,"container",2);ut([v()],Ke.prototype,"baseUrl",2);ut([v({attribute:!1})],Ke.prototype,"compState",2);ut([v({attribute:!1})],Ke.prototype,"compData",2);ut([v({attribute:!1})],Ke.prototype,"appState",2);ut([v({attribute:!1})],Ke.prototype,"appData",2);ut([g()],Ke.prototype,"selected",2);Ke=ut([I("mateu-redwood-tabs")],Ke);var sc=Object.defineProperty,rc=Object.getOwnPropertyDescriptor,ht=(e,t,a,s)=>{for(var i=s>1?void 0:s?rc(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&sc(t,a,i),i};let Je=class extends j{constructor(){super(...arguments),this.open={},this.initialized=!1}createRenderRoot(){return this}label(e){const t=e?.metadata?.label;return t&&typeof t=="string"&&t.includes("${")&&this.container?._evalTemplate?this.container._evalTemplate(t):t??""}render(){const e=this.component?.children??[];return this.initialized||(e.forEach((t,a)=>{t?.metadata?.active&&(this.open[a]=!0)}),this.initialized=!0),n`
            <div style="display:flex; flex-direction:column; gap:.5rem;">
                ${e.map((t,a)=>{const s=!!this.open[a];return n`
                        <oj-c-collapsible data-oj-binding-provider="preact"
                                ?expanded="${s}"
                                ?disabled="${t?.metadata?.disabled}"
                                @ojExpand="${()=>{this.open={...this.open,[a]:!0}}}"
                                @ojCollapse="${()=>{this.open={...this.open,[a]:!1}}}">
                            <span slot="header" class="oj-typography-heading-sm">${this.label(t)}</span>
                            <div>
                                ${(t?.children??[]).map(i=>$(this.container,i,this.baseUrl,this.compState,this.compData,this.appState,this.appData))}
                            </div>
                        </oj-c-collapsible>`})}
            </div>`}};ht([v({attribute:!1})],Je.prototype,"component",2);ht([v({attribute:!1})],Je.prototype,"container",2);ht([v()],Je.prototype,"baseUrl",2);ht([v({attribute:!1})],Je.prototype,"compState",2);ht([v({attribute:!1})],Je.prototype,"compData",2);ht([v({attribute:!1})],Je.prototype,"appState",2);ht([v({attribute:!1})],Je.prototype,"appData",2);ht([g()],Je.prototype,"open",2);Je=ht([I("mateu-redwood-accordion")],Je);var oc=Object.defineProperty,nc=Object.getOwnPropertyDescriptor,ba=(e,t,a,s)=>{for(var i=s>1?void 0:s?nc(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&oc(t,a,i),i};let Bt=class extends j{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.pages=[]}createRenderRoot(){return this}updated(e){if(super.updated(e),e.has("totalElements")||e.has("pageNumber")||e.has("pageSize")){const t=[],s=Math.ceil(this.totalElements/this.pageSize)-1;this.totalElements>0&&(this.pageNumber>0&&t.push({pageNumber:0,text:"First",clickable:!0}),this.pageNumber>1&&t.push({pageNumber:this.pageNumber-1,text:"Prev",clickable:!0}),t.push({pageNumber:this.pageNumber,text:`${this.pageNumber}`,clickable:!1}),this.pageNumber<s-1&&t.push({pageNumber:parseInt(""+this.pageNumber)+1,text:"Next",clickable:!0}),this.pageNumber<s&&t.push({pageNumber:s,text:"Last",clickable:!0})),this.pages=t}}goToPage(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){return this.totalElements?n`
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; padding: 0.25rem 0;">
                ${this.pages.length<2||this.totalElements<=this.pageSize?d:n`
                    <span>Page:</span>
                    ${this.pages.map(e=>e.clickable?n`
                        <oj-c-button
                            data-oj-binding-provider="preact"
                            label="${e.text}"
                            chroming="borderless"
                            @ojAction="${()=>this.goToPage(e.pageNumber)}"
                        ></oj-c-button>
                    `:n`<span>[ ${e.text} ]</span>`)}
                `}
                <span>Total elements: ${this.totalElements}</span>
                <slot></slot>
            </div>
        `:n`${d}`}};ba([v({type:Number})],Bt.prototype,"totalElements",2);ba([v({type:Number})],Bt.prototype,"pageSize",2);ba([v({type:Number})],Bt.prototype,"pageNumber",2);ba([g()],Bt.prototype,"pages",2);Bt=ba([I("mateu-redwood-pagination")],Bt);const Ni=new WeakMap,lc=e=>{const t=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},dc=new Set([m.App,m.Page,m.Form,m.Button,m.FormField,m.FormLayout,m.FormRow,m.FormSection,m.FormSubSection,m.HorizontalLayout,m.VerticalLayout,m.SplitLayout,m.MasterDetailLayout,m.Scroller,m.FullWidth,m.Container,m.BoardLayout,m.BoardLayoutRow,m.BoardLayoutItem,m.CarouselLayout,m.Card,m.Text,m.Badge,m.Anchor,m.Icon,m.Breadcrumbs,m.Notification,m.ProgressBar,m.Details,m.Avatar,m.AvatarGroup,m.Tooltip,m.Popover,m.MenuBar,m.ContextMenu,m.TabLayout,m.AccordionLayout,m.Dialog,m.Drawer,m.ConfirmDialog,m.Grid,m.Table,m.VirtualList,m.Directory,m.CustomField,m.MessageList,m.MessageInput,m.Crud,m.Element,m.Div,m.Image,m.MicroFrontend,m.Markdown,m.Chart,m.Bpmn,m.Map,m.Chat,m.CookieConsent,m.Workflow,m.WorkflowElk,m.FormEditor,m.MetricCard,m.Scoreboard,m.DashboardPanel,m.DashboardLayout,m.FoldoutLayout,m.HeroSection,m.EmptyState,m.Skeleton,m.Gantt]);class cc extends Uo{rendererName(){return"redwood-oj"}supportedClientSideTypes(){return dc}renderFilterBar(t,a,s,i,r,o,l){const c=a?.metadata,u=c?.filters??[],h=Ni.get(t)??{open:!1,text:""};Ni.set(t,h);const p=()=>t.requestUpdate(),f=()=>{h.outsideClick&&(document.removeEventListener("mousedown",h.outsideClick),h.outsideClick=void 0)},y=()=>{f(),h.open=!1,h.activeFilter=void 0,p()},w=()=>{h.open||(h.open=!0,h.outsideClick=b=>{b.composedPath().some(O=>O instanceof HTMLElement&&O.classList?.contains("mateu-smart-search"))||y()},document.addEventListener("mousedown",h.outsideClick),p())},x=()=>{f(),h.open=!1,h.activeFilter=void 0,t.search()},_=(b,S)=>{i[b]=S,x()},U=b=>{const S=u.find(O=>O.fieldId===b);S&&Ce(S)?(i[`${b}_from`]=void 0,i[`${b}_to`]=void 0):i[b]=b==="searchText"?"":void 0,x()},Y=b=>{i.searchText=b.value,h.text="",b.value="",x()},q=b=>b.dataType==="boolean"||b.dataType==="bool"||b.stereotype==="checkbox"||b.stereotype==="toggle",X=b=>["integer","decimal","number","money"].includes(b.dataType),Ce=b=>b.stereotype==="dateRange"||b.stereotype==="numberRange",tt=b=>b.stereotype==="multiSelect",Lt=b=>(b.options?.length??0)>0,k=b=>{const S=i[b.fieldId];return Array.isArray(S)?S.map(String):typeof S=="string"&&S!==""?S.split(",").map(O=>O.trim()).filter(O=>O):[]},P=(b,S)=>{const O=i[`${b.fieldId}_${S}`];return O==null?"":String(O)},E=b=>{if(Ce(b))return P(b,"from")!==""||P(b,"to")!=="";if(tt(b))return k(b).length>0;const S=i[b.fieldId];return S!=null&&S!==""},H=(b,S)=>{const O=b?.options?.find(F=>F.value===String(S));return O?O.label??O.value:typeof S=="boolean"?S?"Yes":"No":String(S)},Be=b=>{if(Ce(b)){const S=P(b,"from"),O=P(b,"to");return S&&O?`${S} – ${O}`:S?`≥ ${S}`:`≤ ${O}`}return tt(b)?k(b).map(S=>H(b,S)).join(", "):H(b,i[b.fieldId])},je=[];i.searchText&&je.push({fieldId:"searchText",label:"Text",display:String(i.searchText)}),u.forEach(b=>{E(b)&&je.push({fieldId:b.fieldId,label:b.label||b.fieldId,display:Be(b)})});const te="var(--mateu-redwood-text, rgb(22, 21, 19))",at=`display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 0.75rem; cursor: pointer; color: ${te}; font-size: 0.875rem;`,T=b=>b.preventDefault(),W=(b,S,O=!1)=>n`
            <div style="${at} ${O?"font-weight: 600;":""}"
                 @mousedown="${T}"
                 @click="${S}"
                 onmouseover="this.style.background='rgba(22,21,19,0.06)'"
                 onmouseout="this.style.background='transparent'">${b}</div>`,se=`flex: 1; min-width: 0; font: inherit; font-size: 0.875rem; color: ${te}; border: 1px solid rgba(22,21,19,0.5); border-radius: 4px; padding: 0.35rem 0.5rem; outline: none;`,z="font: inherit; font-size: 0.875rem; background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); color: #fff; border: 1px solid transparent; border-radius: 4px; padding: 0.35rem 0.75rem; cursor: pointer;",D=b=>{const S=b.stereotype==="numberRange"?"number":b.dataType==="dateTime"?"datetime-local":b.dataType==="time"?"time":"date",O=B=>{const Yt=B.closest(".range-row");i[`${b.fieldId}_from`]=Yt.querySelector("input.range-from").value||void 0,i[`${b.fieldId}_to`]=Yt.querySelector("input.range-to").value||void 0,x()},F=B=>{B.key==="Enter"&&O(B.target),B.key==="Escape"&&y()};return n`
                <div class="range-row" style="display: flex; gap: 0.5rem; align-items: center; padding: 0.5rem 0.75rem;">
                    <input class="range-from" type="${S}" placeholder="From" style="${se}"
                           .value="${P(b,"from")}"
                           @mousedown="${B=>B.stopPropagation()}"
                           @keydown="${F}"/>
                    <span aria-hidden="true" style="color: rgba(22,21,19,0.55);">–</span>
                    <input class="range-to" type="${S}" placeholder="To" style="${se}"
                           .value="${P(b,"to")}"
                           @mousedown="${B=>B.stopPropagation()}"
                           @keydown="${F}"/>
                    <button style="${z}"
                            @mousedown="${T}"
                            @click="${B=>O(B.target)}">Apply</button>
                </div>`},C=b=>{const S=k(b),O=B=>{const Yt=S.includes(B)?S.filter($s=>$s!==B):[...S,B];i[b.fieldId]=Yt.length>0?Yt:void 0,t.search(),p()},F="display: inline-flex; align-items: center; justify-content: center; width: 1rem; height: 1rem; border-radius: 3px; font-size: 0.7rem; line-height: 1; flex: none;";return n`${(b.options??[]).map(B=>W(n`
                <span aria-hidden="true" style="${F} ${S.includes(B.value)?"background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); border: 1px solid transparent; color: #fff;":"border: 1px solid rgba(22,21,19,0.5);"}">${S.includes(B.value)?"✓":""}</span>
                ${B.label??B.value}
            `,()=>O(B.value)))}`},G=b=>{if(Ce(b))return D(b);if(tt(b))return C(b);if(Lt(b))return n`${b.options.map(F=>W(F.label??F.value,()=>_(b.fieldId,F.value)))}`;if(q(b))return n`
                    ${W("Yes",()=>_(b.fieldId,!0))}
                    ${W("No",()=>_(b.fieldId,!1))}`;const S=X(b),O=F=>{F.value!==""&&_(b.fieldId,S?Number(F.value):F.value)};return n`
                <div style="display: flex; gap: 0.5rem; padding: 0.5rem 0.75rem;">
                    <input type="${S?"number":"text"}"
                           placeholder="${b.placeholder||b.label||b.fieldId}"
                           style="flex: 1; font: inherit; font-size: 0.875rem; color: ${te}; border: 1px solid rgba(22,21,19,0.5); border-radius: 4px; padding: 0.35rem 0.5rem; outline: none;"
                           @mousedown="${F=>F.stopPropagation()}"
                           @keydown="${F=>{F.key==="Enter"&&O(F.target),F.key==="Escape"&&y()}}"/>
                    <button style="font: inherit; font-size: 0.875rem; background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); color: #fff; border: 1px solid transparent; border-radius: 4px; padding: 0.35rem 0.75rem; cursor: pointer;"
                            @mousedown="${T}"
                            @click="${F=>O(F.target.previousElementSibling)}">Apply</button>
                </div>`},We=h.open&&u.length>0?n`
            <div style="position: absolute; top: calc(100% + 4px); left: 0; min-width: 20rem; max-width: 100%; background: var(--mateu-redwood-panel-bg, #fff); border: 1px solid rgba(22,21,19,0.25); border-radius: 8px; box-shadow: 0 6px 16px rgba(0,0,0,0.15); z-index: 30; overflow: hidden; padding: 0.25rem 0;">
                ${h.activeFilter?n`
                    <div style="${at} font-weight: 600; border-bottom: 1px solid rgba(22,21,19,0.15);"
                         @mousedown="${T}"
                         @click="${()=>{h.activeFilter=void 0,p()}}">
                        <span aria-hidden="true">←</span> ${h.activeFilter.label||h.activeFilter.fieldId}
                    </div>
                    ${G(h.activeFilter)}
                `:n`
                    <div style="padding: 0.35rem 0.75rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(22,21,19,0.6);">Filter by</div>
                    ${u.map(b=>W(n`
                        ${b.label||b.fieldId}
                        ${E(b)?n`<span style="margin-left: auto; color: rgba(22,21,19,0.55); font-size: 0.8125rem;">${Be(b)}</span>`:d}
                    `,()=>{h.activeFilter=b,p()}))}
                `}
            </div>`:d;return n`
            <div class="mateu-smart-search" style="position: relative; padding: 0.25rem 0;">
                <div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; border: 1px solid rgba(22,21,19,0.5); border-radius: 8px; padding: 0.3rem 0.6rem; background: var(--mateu-redwood-panel-bg, #fff); cursor: text;"
                     @click="${b=>{b.currentTarget.querySelector("input.smart-search-input")?.focus(),w()}}">
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" style="flex: none; opacity: 0.6;">
                        <path fill="${te.startsWith("var")?"rgb(22,21,19)":te}" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
                    </svg>
                    ${je.map(b=>n`
                        <span style="display: inline-flex; align-items: center; gap: 0.3rem; background: rgba(22,21,19,0.08); border-radius: 1rem; padding: 0.15rem 0.3rem 0.15rem 0.6rem; font-size: 0.8125rem; color: ${te}; white-space: nowrap;">
                            <span style="opacity: 0.7;">${b.label}:</span> ${b.display}
                            <button aria-label="Remove filter ${b.label}"
                                    style="border: none; background: transparent; cursor: pointer; font-size: 0.75rem; line-height: 1; padding: 0.1rem 0.3rem; opacity: 0.6;"
                                    @mousedown="${T}"
                                    @click="${S=>{S.stopPropagation(),U(b.fieldId)}}">✕</button>
                        </span>`)}
                    ${c?.searchable!==!1?n`
                        <input class="smart-search-input" type="text"
                               placeholder="${je.length===0?"Search":""}"
                               .value="${h.text??""}"
                               style="flex: 1 1 8rem; min-width: 7rem; border: none; outline: none; background: transparent; font: inherit; font-size: 0.875rem; color: ${te}; padding: 0.25rem 0;"
                               @input="${b=>{h.text=b.target.value,w()}}"
                               @keydown="${b=>{b.key==="Enter"&&Y(b.target),b.key==="Escape"&&y()}}"/>
                    `:d}
                </div>
                ${We}
                ${c?.header?.map(b=>$(t,b,s,i,r,o,l))}
            </div>
        `}renderToolbarButton(t,a,s){const i=t,r=i.color==="error"||i.variant==="error"||i.variant==="danger"?"danger":i.buttonStyle==="primary"?"callToAction":"outlined",o=r==="danger"?"background: var(--mateu-redwood-danger-bg, rgb(179, 49, 31)); color: #fff; border: 1px solid transparent;":r==="callToAction"?"background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); color: #fff; border: 1px solid transparent;":"background: transparent; color: var(--mateu-redwood-text, rgb(22, 21, 19)); border: 1px solid rgba(22, 21, 19, 0.5);";return n`
            <button
                data-action-id="${i.id}"
                style="${o} border-radius: 4px; height: 40px; padding: 0 16px; font-family: 'Oracle Sans', -apple-system, system-ui, sans-serif; font-size: 0.86rem; font-weight: 600; cursor: pointer; ${i.disabled?"opacity: .4; pointer-events: none;":""}"
                ?disabled="${i.disabled}"
                @click="${s}"
            >${a}</button>
        `}renderPagination(t,a){const s=t.id;return n`
            <mateu-redwood-pagination
                data-oj-binding-provider="preact"
                @page-changed="${t.pageChanged}"
                @fetch-more-elements="${t.fetchMoreElements}"
                totalElements="${t.data[s]?.page?.totalElements??0}"
                pageSize="${t.data[s]?.page?.pageSize??100}"
                pageNumber="${t.data[s]?.page?.pageNumber??0}"
            ></mateu-redwood-pagination>
        `}renderTableComponent(t,a,s,i,r,o,l){return n`
        <mateu-redwood-table id="${t.id}"
                     .metadata="${a?.metadata}"
                     .data="${t.data}"
                     .emptyStateMessage="${i[a?.id]?.emptyStateMessage}"
                     @sort-direction-changed="${t.directionChanged}"
                     @fetch-more-elements="${t.fetchMoreElements}"
                     .state="${i}"
                     baseUrl="${s}"
        ></mateu-redwood-table>
        `}renderClientSideComponent(t,a,s,i,r,o,l,c){return m.Page==a?.metadata?.type?jd(t,a,s,i,r,o,l):m.Form==a?.metadata?.type?Od(t,a,s,i,r,o,l):m.Button==a?.metadata?.type?Bo(a):m.FormField==a?.metadata?.type?zn(t,a,s,i,r):m.FormLayout==a?.metadata?.type?Ld(t,a,s,i,r,o,l):m.FormRow==a?.metadata?.type?Ad(t,a,s,i,r,o,l):m.FormSection==a?.metadata?.type?Dd(t,a,s,i,r,o,l):m.FormSubSection==a?.metadata?.type?zd(t,a,s,i,r,o,l):m.HorizontalLayout==a?.metadata?.type?Nd(t,a,s,i,r,o,l):m.VerticalLayout==a?.metadata?.type?Fd(t,a,s,i,r,o,l):m.SplitLayout==a?.metadata?.type?qd(t,a,s,i,r,o,l):m.MasterDetailLayout==a?.metadata?.type?ec(t,a,s,i,r,o,l):m.Scroller==a?.metadata?.type?Kd(t,a,s,i,r,o,l):m.FullWidth==a?.metadata?.type?Jd(t,a,s,i,r,o,l):m.Container==a?.metadata?.type?Yd(t,a,s,i,r,o,l):m.BoardLayout==a?.metadata?.type?Xd(t,a,s,i,r,o,l):m.BoardLayoutRow==a?.metadata?.type?Qd(t,a,s,i,r,o,l):m.BoardLayoutItem==a?.metadata?.type?Zd(t,a,s,i,r,o,l):m.CarouselLayout==a?.metadata?.type?tc(t,a,s,i,r,o,l):m.Card==a?.metadata?.type?Md(t,a,s,i,r,o,l):m.Text==a?.metadata?.type?Bd(t,a):m.Badge==a?.metadata?.type?Wd(a):m.Anchor==a?.metadata?.type?Vd(a):m.Icon==a?.metadata?.type?hn(a):m.Breadcrumbs==a?.metadata?.type?pn(a):m.Notification==a?.metadata?.type?mn(a):m.ProgressBar==a?.metadata?.type?vn(a,i):m.Details==a?.metadata?.type?fn(t,a,s,i,r,o,l):m.Avatar==a?.metadata?.type?bn(a,i,r):m.AvatarGroup==a?.metadata?.type?gn(a):m.Tooltip==a?.metadata?.type?$n(t,a,s,i,r,o,l):m.Popover==a?.metadata?.type?yn(t,a,s,i,r,o,l):m.MenuBar==a?.metadata?.type?xn(t,a):m.ContextMenu==a?.metadata?.type?wn(t,a,s,i,r,o,l):m.Grid==a?.metadata?.type?rn(a,i):m.Table==a?.metadata?.type?on(t,a,s,i,r,o,l):m.VirtualList==a?.metadata?.type?nn(t,a,s,i,r,o,l):m.Directory==a?.metadata?.type?ln(a):m.CustomField==a?.metadata?.type?dn(t,a,s,i,r,o,l):m.MessageList==a?.metadata?.type?cn(a):m.MessageInput==a?.metadata?.type?un(a):m.TabLayout==a?.metadata?.type?n`<mateu-redwood-tabs
                    .component="${a}" .container="${t}" baseUrl="${s}"
                    .compState="${i}" .compData="${r}" .appState="${o}" .appData="${l}"
            ></mateu-redwood-tabs>`:m.AccordionLayout==a?.metadata?.type?n`<mateu-redwood-accordion
                    .component="${a}" .container="${t}" baseUrl="${s}"
                    .compState="${i}" .compData="${r}" .appState="${o}" .appData="${l}"
            ></mateu-redwood-accordion>`:m.Dialog==a?.metadata?.type?Hd(t,a,s,i,r,o,l):m.ConfirmDialog==a?.metadata?.type?Gd(t,a,s,i,r,o,l):super.renderClientSideComponent(t,a,s,i,r,o,l,c)}renderAppComponent(t,a,s,i,r,o,l){return Pd(t,a,s,i,r,o,l)}}K.set(new cc);K.setUseShadowRoot(!1);K.setAfterRenderHook(e=>{});var uc=Object.defineProperty,hc=Object.getOwnPropertyDescriptor,pt=(e,t,a,s)=>{for(var i=s>1?void 0:s?hc(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=(s?o(t,a,i):o(i))||i);return s&&i&&uc(t,a,i),i};let Fe=class extends j{constructor(){super(...arguments),this.baseUrl="",this.route=void 0,this.consumedRoute="_empty",this.config=void 0,this.top="true",this.pathPrefix=void 0,this.debug=!1,this._lastUrl="",this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top=="true"){let t=e.detail.route,a=this.baseUrl??"";!t||t.startsWith("/")?a=window.location.origin+(this.pathPrefix??""):(t=(this.pathPrefix??"")+t,a.indexOf("://")<0&&(a.startsWith("/")||(a="/"+a),a=window.location.origin+a)),t.startsWith(this.pathPrefix+"/")&&(t=t.substring(this.pathPrefix?.length)),a.endsWith("/")&&t.startsWith("/")&&(t=t.substring(1));let s=new URL(a+t);if((window.location.pathname||s.pathname)&&window.location.pathname!=s.pathname){let i=s.pathname;s.search&&(i+=s.search),i&&!i.startsWith("/")&&(i="/"+i),window.history.pushState({},"",i),this._lastUrl=window.location.href}}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),zt.markClean(),e instanceof CustomEvent){let t=e.detail.route;const a=this.renderRoot.querySelector("mateu-ux");a&&(a.setAttribute("route",t),a.setAttribute("instant",de()))}}}createRenderRoot(){return K.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),zt.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!zt.confirmLeave()){window.history.pushState({},"",this._lastUrl);return}const t=e.target;this.loadUrl(t)},this.top=="true"?this.loadUrl(window):this.route&&(this.consumedRoute=""),this.config)try{const e=JSON.parse(this.config);ae.value={...ae.value,...e}}catch{ae.value={...ae.value,config:this.config}}this.addEventListener("url-update-requested",this.routeChangedListener),this.addEventListener("navigate-to-requested",this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener("url-update-requested",this.routeChangedListener),this.removeEventListener("navigate-to-requested",this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute("route",this.route),this.instant=de(),this._lastUrl=e.location.href,e.location.search){const a=new URLSearchParams(e.location.search).get("overrides");if(a&&(this.config=a,this.config))try{const s=JSON.parse(this.config);ae.value={...ae.value,...s}}catch{ae.value={...ae.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){const t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t=="/"?"":t}addQueryParams(e,t){return e+(t.search?""+t.search:"")}extractGrossRouteFromUrl(e){const t=e.location.pathname,a=this.baseUrl&&(this.baseUrl.startsWith("http://")||this.baseUrl.startsWith("https://"))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(a)?t.substring(a.length):t}getContextPathStartingIndex(e){return e.startsWith("http:")?e.indexOf("/",7):e.startsWith("https:")?e.indexOf("/",8):0}render(){return n`
           <mateu-api-caller>
                <mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${aa.value}"
                          .appState="${ae.value}"
                ></mateu-ux>
           </mateu-api-caller>
           ${this.debug?n`
               <mateu-debug-overlay
                   .appState="${ae.value}"
                   .appData="${aa.value}"
               ></mateu-debug-overlay>
           `:d}
       `}};Fe.styles=R`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `;pt([v()],Fe.prototype,"baseUrl",2);pt([v()],Fe.prototype,"route",2);pt([v()],Fe.prototype,"consumedRoute",2);pt([v()],Fe.prototype,"config",2);pt([v()],Fe.prototype,"top",2);pt([v()],Fe.prototype,"pathPrefix",2);pt([g()],Fe.prototype,"instant",2);pt([v({type:Boolean})],Fe.prototype,"debug",2);Fe=pt([I("mateu-ui")],Fe);var pc=Object.getOwnPropertyDescriptor,mc=(e,t,a,s)=>{for(var i=s>1?void 0:s?pc(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(i=o(i)||i);return i};let Xa=class extends ua{constructor(){super(...arguments),this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}render(){const e=this.component?.metadata;return n`
            <div class="form-frame">
                <div class="form-header">
                    <div class="form-titles">
                        ${e?.title?n`<h2>${e.title}</h2>`:""}
                        ${e?.subtitle?n`<span class="form-subtitle">${e.subtitle}</span>`:""}
                    </div>
                    <div class="form-header-actions"><slot name="header"></slot></div>
                </div>
                <slot></slot>
                <div class="form-buttons">
                    <slot name="buttons"></slot>
                </div>
            </div>
       `}};Xa.styles=R`
        :host {
            width: 100%;
        }
        .form-frame {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            width: 100%;
        }
        .form-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            width: 100%;
        }
        .form-titles {
            display: flex;
            flex-direction: column;
            min-width: 0;
        }
        .form-titles h2 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--oj-core-text-color-primary, rgb(22, 21, 19));
        }
        .form-subtitle {
            display: inline-block;
            margin-top: .25rem;
            color: var(--oj-core-text-color-secondary, #666);
        }
        .form-header-actions {
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: .5rem;
        }
        .form-buttons {
            display: flex;
            gap: .5rem;
        }
  `;Xa=mc([I("mateu-redwood-form")],Xa);
