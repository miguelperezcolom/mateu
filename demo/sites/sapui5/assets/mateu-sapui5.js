const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-highcharts.js","assets/vendor-vaadin.js","assets/vendor-lit.js","assets/vendor.js","assets/vendor-diagrams.js"])))=>i.map(i=>d[i]);
import{d as o,A as d,a as S,j as p,r as y,i as E,k as C,m as pe,D as Vi,c as R,w as B,p as Rs,q as Ae,s as Ls}from"./vendor-lit.js";import{v as zs,b as Je,e as Ds,_ as me,n as Hi,p as Gi,f as ht,i as Ra,j as Ki,N as ra,k as Wa,l as ii,m as As}from"./vendor-vaadin.js";import{S as Fs,n as ie,a as Ns,b as qs}from"./vendor.js";import{N as ma}from"./vendor-ui5.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function a(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=a(s);fetch(s.href,r)}})();class Ms{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(t){if(this.componentRenderer=t,typeof window<"u"){const a=t.supportedClientSideTypes?.();window.__mateuRendererInfo={name:t.rendererName?.()??t.constructor?.name??"unknown",supportedTypes:a?[...a].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(t){this.useShadowRoot=t}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(t){this.afterRenderHook=t}getAfterRenderHook(){return this.afterRenderHook}}const K=new Ms;var h=(e=>(e.Page="Page",e.Div="Div",e.Element="Element",e.MicroFrontend="MicroFrontend",e.Form="Form",e.Crud="Crud",e.Result="Result",e.Card="Card",e.Directory="Directory",e.Stepper="Stepper",e.HorizontalLayout="HorizontalLayout",e.VerticalLayout="VerticalLayout",e.SplitLayout="SplitLayout",e.MasterDetailLayout="MasterDetailLayout",e.TabLayout="TabLayout",e.AccordionLayout="AccordionLayout",e.FormLayout="FormLayout",e.FormRow="FormRow",e.FormItem="FormItem",e.BoardLayout="BoardLayout",e.BoardLayoutRow="BoardLayoutRow",e.BoardLayoutItem="BoardLayoutItem",e.Scroller="Scroller",e.FullWidth="FullWidth",e.Container="Container",e.FormField="FormField",e.Table="Table",e.App="App",e.Text="Text",e.Avatar="Avatar",e.Chat="Chat",e.AvatarGroup="AvatarGroup",e.Badge="Badge",e.Breadcrumbs="Breadcrumbs",e.Anchor="Anchor",e.Button="Button",e.Chart="Chart",e.Icon="Icon",e.ConfirmDialog="ConfirmDialog",e.ContextMenu="ContextMenu",e.CookieConsent="CookieConsent",e.Details="Details",e.Dialog="Dialog",e.Drawer="Drawer",e.Image="Image",e.Map="Map",e.Markdown="Markdown",e.Notification="Notification",e.ProgressBar="ProgressBar",e.Popover="Popover",e.CarouselLayout="CarouselLayout",e.Tooltip="Tooltip",e.MessageInput="MessageInput",e.MessageList="MessageList",e.CustomField="CustomField",e.MenuBar="MenuBar",e.Grid="Grid",e.GridColumn="GridColumn",e.GridGroupColumn="GridGroupColumn",e.VirtualList="VirtualList",e.FormSection="FormSection",e.FormSubSection="FormSubSection",e.Bpmn="Bpmn",e.Workflow="Workflow",e.WorkflowElk="WorkflowElk",e.FormEditor="FormEditor",e.MetricCard="MetricCard",e.Scoreboard="Scoreboard",e.DashboardPanel="DashboardPanel",e.DashboardLayout="DashboardLayout",e.FoldoutLayout="FoldoutLayout",e.HeroSection="HeroSection",e.EmptyState="EmptyState",e.Skeleton="Skeleton",e.Gantt="Gantt",e.Kanban="Kanban",e.Timeline="Timeline",e.ProgressSteps="ProgressSteps",e.Stat="Stat",e.Calendar="Calendar",e.PricingTable="PricingTable",e.OrgChart="OrgChart",e.Heatmap="Heatmap",e.Funnel="Funnel",e.TrendChart="TrendChart",e.FeatureGrid="FeatureGrid",e.Testimonials="Testimonials",e.Faq="Faq",e.CalloutCard="CalloutCard",e.CommentThread="CommentThread",e.FileList="FileList",e.EntityHeader="EntityHeader",e.Meter="Meter",e.TaskProgress="TaskProgress",e.StatusList="StatusList",e.TaskQueue="TaskQueue",e.ResourceGrid="ResourceGrid",e.OfferCard="OfferCard",e.AddOnPicker="AddOnPicker",e.Ledger="Ledger",e.PaymentPicker="PaymentPicker",e.ProcessMonitor="ProcessMonitor",e))(h||{}),U=(e=>(e.ServerSide="ServerSide",e.ClientSide="ClientSide",e))(U||{});const $t=(e,t,a,i,s,r,n,l,c)=>(t.slot=l,$(e,t,a,i,s,r,n,c)),$=(e,t,a,i,s,r,n,l)=>{if(!t)return o``;if(t.type==U.ClientSide)return K.get().renderClientSideComponent(e,t,a,i,s,r,n,l);const c=e.route,u=e.consumedRoute;return o`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${u}"
                         baseUrl="${a}"
                         slot="${t.slot??d}"
                         style="${t.style}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...i}}"
                         .data="${{...s}}"
                         .appState="${r}"
                         .appData="${n}"
        >
       </mateu-component>`},Us=640,Bs=e=>e>0&&e<Us?"accordion":"tabs";var js=Object.defineProperty,Ws=Object.getOwnPropertyDescriptor,La=(e,t,a,i)=>{for(var s=i>1?void 0:i?Ws(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&js(t,a,s),s};let At=class extends E{constructor(){super(...arguments),this.tabLabels=[],this.mode="tabs",this.selected=0,this.selectedChangedListener=e=>{const t=e.detail?.value;typeof t=="number"&&t>=0&&(this.selected=t)}}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{for(const t of e)this.mode=Bs(t.contentRect.width)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect(),this.resizeObserver=void 0,this.detachTabsListener()}detachTabsListener(){this.slottedTabs?.removeEventListener("selected-changed",this.selectedChangedListener),this.slottedTabs=void 0}tabsSlotChanged(e){this.detachTabsListener();const a=e.target.assignedElements().find(i=>"selected"in i);a&&(this.slottedTabs=a,a.addEventListener("selected-changed",this.selectedChangedListener),a.selected=this.selected)}select(e){this.selected=e,this.slottedTabs&&(this.slottedTabs.selected=e)}updated(){this.slottedTabs&&this.slottedTabs.selected!=this.selected&&(this.slottedTabs.selected=this.selected)}render(){return o`
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
        `}};At.styles=S`
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
    `;La([p({type:Array})],At.prototype,"tabLabels",2);La([y()],At.prototype,"mode",2);La([y()],At.prototype,"selected",2);At=La([C("mateu-adaptive-tabs")],At);const Vs=(e,t,a,i,s,r,n)=>{const l=t.metadata;let c=t.style;return c==null&&(c=""),l.columnSpacing&&(c+="--vaadin-form-layout-column-spacing: "+l.columnSpacing+";"),l.itemRowSpacing&&(c+="--vaadin-form-layout-row-spacing: "+l.itemRowSpacing+";"),l.itemLabelSpacing&&(c+="--vaadin-form-layout-label-spacing: "+l.itemLabelSpacing+";"),l.labelsAside&&(c+="--vaadin-form-item-label-width: 92px;"),l.fullWidth&&(c+="width: 100%;"),o`
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
                   ${t.children?.map(u=>Ji(l,e,u,a,i,s,r,n))}
               </vaadin-form-layout>
            `},Ji=(e,t,a,i,s,r,n,l)=>a.type==U.ClientSide&&a.metadata?.type==h.FormRow?Gs(e,t,a,i,s,r,n,l):e.labelsAside?Hs(t,a,i,s,r,n,l):$(t,a,i,s,r,n,l),Hs=(e,t,a,i,s,r,n)=>{if(t.type==U.ClientSide&&t.metadata?.type==h.FormField&&t.metadata.label){const l=t.metadata,c=l.label?.includes("${")?e._evalTemplate(l.label):l.label;return o`
                       <vaadin-form-item data-colspan="${l.colspan}">
                           <label slot="label">${c}</label>
                           ${$(e,t,a,i,s,r,n,!0)}
                       </vaadin-form-item>
                   `}return $(e,t,a,i,s,r,n)},Gs=(e,t,a,i,s,r,n,l)=>o`
        <vaadin-form-row>
            ${a.children?.map(c=>Ji(e,t,c,i,s,r,n,l))}
        </vaadin-form-row>
            `,Ks=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let u=t.style;return l.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),l.justification&&(u=u?"justify-content: "+l.justification+";"+u:"justify-content: "+l.justification+";"),l.verticalAlignment&&(u=u?"align-items: "+l.verticalAlignment+";"+u:"align-items: "+l.verticalAlignment+";"),o`
               <vaadin-horizontal-layout 
                       style="${u}" 
                       class="${t.cssClasses}"
                       theme="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(m=>$(e,m,a,i,s,r,n))}
               </vaadin-horizontal-layout>
            `},Js=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let u=t.style;return l.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),l.justification&&(u=u?"justify-content: "+l.justification+";"+u:"justify-content: "+l.justification+";"),l.horizontalAlignment&&(u=u?"align-items: "+l.horizontalAlignment+";"+u:"align-items: "+l.horizontalAlignment+";"),o`
        <vaadin-vertical-layout
                style="${u}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(m=>$(e,m,a,i,s,r,n))}
        </vaadin-vertical-layout>
    `},Ys=(e,t,a,i,s,r,n)=>{const l=t.metadata;let c=t.style;return l.fullWidth&&(c=c?"width: 100%;"+c:"width: 100%;"),o`
               <vaadin-split-layout 
                       style="${c}" 
                       class="${t.cssClasses}"
                       orientation="${l.orientation??d}"
                       theme="${l.variant??d}"
                       slot="${t.slot??d}"
               >
                   <master-content>${$(e,t.children[0],a,i,s,r,n)}</master-content>
                   <detail-content>${$(e,t.children[1],a,i,s,r,n)}</detail-content>
               </vaadin-split-layout>
            `},Xs=(e,t,a,i,s,r,n)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=s?.detailComponent??null,u=!!s?.hasDetail||!!l,m=c??l;return o`
               <vaadin-master-detail-layout ?has-detail="${u}"
                                            style="${t.style}"
                                            class="${t.cssClasses}"
                                            slot="${t.slot??d}">
                   <div>${$(e,t.children[0],a,i,s,r,n)}</div>
                   ${u&&m?o`<div slot="detail">${$(e,m,a,i,s,r,n)}</div>`:o`<div slot="detail" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Select an item to view details</div>`}
               </vaadin-master-detail-layout>
            `},Qs=(e,t,a,i,s,r,n)=>{const l=t.metadata;let c=t.style;c==null&&(c=""),l.fullWidth&&(c+="width: 100%;");let u=l.variant;u=="equalWidth"&&(u="equal-width-tabs");const m=Math.max(0,(t.children??[]).findIndex(f=>f.metadata.active)),v=f=>{f.target.selected=m};if(l.adaptable){const f=(t.children??[]).map(b=>{const x=b.metadata.label;return x?.includes("${")?e._evalTemplate(x):x});return o`
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
                    ${t.children?.map(b=>b).map((b,x)=>{const g=b.metadata.shortcut;return o`
                        <vaadin-tab id="${f[x]}"
                                    style="${b.style}"
                                    class="${b.cssClasses}"
                                    data-shortcut="${g??d}"
                        >${f[x]}</vaadin-tab>`})}
                </vaadin-tabs>

                ${t.children?.map((b,x)=>o`
                    <div slot="panel-${x}" style="padding: var(--lumo-space-m) 0;">
                        ${b.children?.map(g=>$(e,g,a,i,s,r,n))}
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
                ${t.children?.map(f=>f).map(f=>{const b=f.metadata.label,x=b?.includes("${")?e._evalTemplate(b):b,g=f.metadata.shortcut;return o`
                    <vaadin-tab id="${x}"
                                style="${f.style}"
                                class="${f.cssClasses}"
                                data-shortcut="${g??d}"
                    >${x}</vaadin-tab>`})}
            </vaadin-tabs>

            ${t.children?.map(f=>Zs(e,f,a,i,s,r,n))}
        </vaadin-tabsheet>
            `},Zs=(e,t,a,i,s,r,n)=>{const l=t.metadata.label,c=l?.includes("${")?e._evalTemplate(l):l;return o`
        <div tab="${c}" style="padding: var(--lumo-space-m) 0;">
                   ${t.children?.map(u=>$(e,u,a,i,s,r,n))}
               </div>
            `},er=(e,t,a,i,s,r,n)=>{const l=t.metadata;t.style,l.fullWidth;let c=0;if(t.children){for(let u=0;u<t.children.length;u++)if(t.children[u].metadata?.active){c=u;break}}return o`
               <vaadin-accordion
                       style="${t.style}"
                       class="${t.cssClasses}"
                       opened="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(u=>tr(e,u,a,i,s,r,n,l.variant))}
               </vaadin-accordion>
            `},tr=(e,t,a,i,s,r,n,l)=>{const c=t.metadata,u=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return o`
        <vaadin-accordion-panel style="${t.style}"
                                class="${t.cssClasses}"
                                theme="${l??d}"
                                ?opened="${c.active}"
                                ?disabled="${c.disabled}">
            <vaadin-accordion-heading slot="summary">${u}</vaadin-accordion-heading>
            ${t.children?.map(m=>$(e,m,a,i,s,r,n))}
        </vaadin-accordion-panel>
            `},ar=(e,t,a,i,s,r,n)=>o`
               <vaadin-scroller style="${t.style}" 
                                class="${t.cssClasses}"
                                slot="${t.slot??d}">
                   ${t.children?.map(l=>$(e,l,a,i,s,r,n))}
               </vaadin-scroller>
            `,ir=(e,t,a,i,s,r,n)=>o`
               <div style="width: 100%; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??d}">
                   ${t.children?.map(l=>$(e,l,a,i,s,r,n))}
               </div>
            `,sr=(e,t,a,i,s,r,n)=>o`
               <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??d}">
                   ${t.children?.map(l=>$(e,l,a,i,s,r,n))}
               </div>
            `,rr=(e,t,a,i,s,r,n)=>o`
        <vaadin-board style="${t.style}" 
                      class="${t.cssClasses}"
                      slot="${t.slot??d}">
            ${t.children?.map(l=>$(e,l,a,i,s,r,n))}
        </vaadin-board>
            `,or=(e,t,a,i,s,r,n)=>o`
        <vaadin-board-row style="${t.style}" class="${t.cssClasses}">
                   ${t.children?.map(l=>$(e,l,a,i,s,r,n))}
               </vaadin-board-row>
            `,nr=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <div style="${t.style}" 
             class="${t.cssClasses}"
             board-cols="${l.boardCols??d}"
        >
                   ${t.children?.map(c=>$(e,c,a,i,s,r,n))}
               </div>
            `},Ft=(e,t)=>new Function(...Object.keys(t),"return `"+e+"`")(...Object.values(t)),Bt=(e,t,a)=>({state:e??{},data:t??{},...a});function Ce(e,t,a,i){if(!e?.includes("${"))return e;try{return Ft(e,Bt(t,a,i))}catch(s){return console.warn(`Mateu: could not interpolate "${e}":`,s),e}}const yt=(e,t,a)=>{if(e&&e.indexOf("${")>=0)try{return Ft(e,Bt(t,a))}catch(i){return i.message}return e},si=(e,t,a,i,s)=>{if(!e)return e;const r=Bt(t,a,{appState:i??{},appData:s??{}});let n=e;try{if(n=Ft(e,r),n.includes("${"))try{n=Ft(n,r)}catch(l){n="when evaluating nested "+e+" :"+l+", where data is "+a+" and state is "+t+" and app state is "+i+" and app data is "+s,console.error(l,n,t,a,i,s)}}catch(l){n="when evaluating "+e+" :"+l+", where data is "+a+" and state is "+t+" and app state is "+i+" and app data is "+s,console.error(l,n,t,a,i,s)}return n},Yi=(e,t,a,i,s,r)=>{const n=Bt(t,a,{appState:i??{},appData:s??{},...r}),l=Ft(e,n);return new Function(...Object.keys(n),`return (${l})`)(...Object.values(n))},Xi=(e,t,a,i)=>{const s=Bt(t,a,i);return new Function(...Object.keys(s),`return (${e})`)(...Object.values(s))},lr=(e,t,a,i)=>Ft(e,Bt(t,a,i)),dr=(e,t,a)=>{const i=e.metadata;return o`<vaadin-avatar
            img="${i.image}"
            name="${Be(i.name,t,a)}"
            abbr="${i.abbreviation}"
            style="${e.style}" class="${e.cssClasses}"
            slot="${e.slot??d}"
    ></vaadin-avatar>`},Be=(e,t,a)=>typeof e=="string"&&e.includes("${")?Ce(e,t,a):e,cr=e=>{const t=e.metadata;return o`<vaadin-avatar-group max-items-visible="${t.maxItemsVisible}"
                                     .items="${t.avatars}"
                                     style="${e.style}" class="${e.cssClasses}"
                                     slot="${e.slot??d}">
    </vaadin-avatar-group>`},ur=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=u=>o`
            ${$(e,u,a,i,s,r,n)}
`;return o`
        <vaadin-virtual-list
                .items="${l.page.content}"
                ${zs(c,[])}
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
        ></vaadin-virtual-list>
    `};var hr=Object.defineProperty,pr=Object.getOwnPropertyDescriptor,ri=(e,t,a,i)=>{for(var s=i>1?void 0:i?pr(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&hr(t,a,s),s};let Xt=class extends E{constructor(){super(...arguments),this.variant="text",this.count=3}render(){const e=Array.from({length:Math.max(1,this.count)});return this.variant=="card"?o`${e.map(()=>o`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant=="grid"?o`${e.map(()=>o`<div class="bone row"></div>`)}`:this.variant=="form"?o`${e.map(()=>o`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:o`${e.map(()=>o`<div class="bone line"></div>`)}`}};Xt.styles=S`
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
    `;ri([p()],Xt.prototype,"variant",2);ri([p({type:Number})],Xt.prototype,"count",2);Xt=ri([C("mateu-skeleton")],Xt);const mr=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},xt=(e,t,a,i,s,r)=>o`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${t??"🗂"}</span>
            ${a?o`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${a}</span>`:d}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${i??e??"Nothing here yet."}</span>
            ${s&&r?o`
                <vaadin-button theme="tertiary" style="margin-top: .25rem;" @click="${n=>mr(n,s)}">${r}</vaadin-button>
            `:d}
        </div>
    `,vr=e=>{const t=e.metadata;return o`
        <div style="${e.style??d}" class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${xt(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},fr=e=>{const t=e.metadata;return o`
        <mateu-skeleton
                variant="${t.variant??"text"}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-skeleton>
    `};var Ke=(e=>(e.NONE="NONE",e.INFO="INFO",e.SUCCESS="SUCCESS",e.WARNING="WARNING",e.DANGER="DANGER",e))(Ke||{});const br=(e,t,a)=>{const i=e[a.path];return i?o`<span theme="badge pill ${za(i.type)}">${i.message}</span>`:o``},za=e=>{switch(e){case Ke.SUCCESS:return"success";case Ke.WARNING:return"warning";case Ke.DANGER:return"error";case Ke.NONE:return"contrast"}return""},gr=(e,t,a)=>{const s=e[a.path]?"vaadin:check":"vaadin:minus";return o`<vaadin-icon 
                    icon="${s}"
                    style="height: 16px; width: 16px; color: ${"var(--lumo-body-text-color)"};"
            ></vaadin-icon>`},$r=(e,t,a,i,s)=>{const r=e[a.path];let n=r;return i=="money"&&r&&r.locale&&r.currency?n=new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(r.value):s=="money"&&(n=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(r)),o`${n}`},xi=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},yr=(e,t,a,i,s,r)=>{const n=a.xcolumn??r;if(n.text){if(n.actionId)return o`<a href="javascript: void(0);" @click="${u=>xi(a,n,e)}">${n.text}</a>`;const c=e[a.path];return o`<a href="${c}">${n.text}</a>`}if(i=="string"){if(n.actionId){const u=e[a.path];return o`<a href="javascript: void(0);" @click="${m=>xi(a,n,e)}">${u}</a>`}const c=e[a.path];return o`<a href="${c}">${c}</a>`}const l=e[a.path];return o`<a href="${l.href}">${l.text}</a>`},xr=(e,t,a,i,s)=>i=="string"?e[a.path].split(",").map(l=>o`<vaadin-icon icon="${l}" style="width: 16px;"></vaadin-icon>`):e[a.path].split(",").map(n=>o`<vaadin-icon icon="${n.icon}" style="width: 16px;"></vaadin-icon>`),wr=(e,t,a,i,s)=>{const r=e[a.path];return o`${pe(r)}`},kr=(e,t,a,i,s,r)=>{if(i=="string"){const l=e[a.path],c="max-height: 40px; "+(r.style??"");return o`<img src="${l}" style="${c}">`}const n=e[a.path];return o`<img src="${n.src}" style="${r.style??""}">`},Cr=e=>{const t={_clickedRow:e.target.row};e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+e.detail.value.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},wi=e=>{const t={_clickedRow:e.target.row},a=e.target.action;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+a.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Sr=e=>{const t=document.createElement("vaadin-context-menu-item"),a=document.createElement("vaadin-icon");return a.style.color="var(--lumo-secondary-text-color)",a.style.marginInlineEnd="var(--lumo-space-s)",a.style.padding="var(--lumo-space-xs)",a.setAttribute("icon",e.icon),t.appendChild(a),e.label&&t.appendChild(document.createTextNode(e.label)),t.disabled=e.disabled,t},ki=(e,t,a)=>{const i=e[a.path]?.actions?.map(s=>s.icon?{component:Sr(s),methodNameInCrud:s.methodNameInCrud}:{...s,text:s.label});return!i||i.length==0?o``:o`
                                     <vaadin-menu-bar
                                         .items=${[{text:"···",children:i}]}
                                         theme="tertiary"
                                         .row="${e}"
                                         data-testid="menubar-${a.path}"
                                         @item-selected="${Cr}"
                                     ></vaadin-menu-bar>
                                   `},_r=(e,t,a)=>{if(a.path=="select"){const r={actionId:a.path,icon:"",label:"Select",disabled:!1,methodNameInCrud:"select"};return o`
         <vaadin-button theme="tertiary" title="Select" @click="${wi}" .row="${e}" .action="${r}">
             Select
         </vaadin-button>
    `}const i=a.path&&e[a.path].methodNameInCrud?e[a.path]:e.action,s=i.icon&&!i.label;return o`
         <vaadin-button theme="tertiary${s?" icon":""}" title="${i.label||d}" @click="${wi}" .row="${e}" .action="${i}">
             ${i.icon?o`<vaadin-icon icon="${i.icon}"></vaadin-icon>`:d}
             ${i.label?i.label:d}
         </vaadin-button>
    `},Er=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},Ir=(e,t,a,i,s,r)=>{const n=a.xcolumn??r;if(n.actionId){const c=n.text||e[a.path];return o`
            <vaadin-button theme="tertiary" @click="${u=>Er(a,n,e)}" .row="${e}">
                ${c}
            </vaadin-button>
        `}const l=e[a.path];return o`<a href="${l}">${n.text||l}</a>`},Tr=(e,t,a,i,s,r,n,l,c)=>{const u=e[a.path];return $(i,u,s,r,n,l,c)},Ya=new WeakMap,Pr=(e,t)=>Ya.get(e)?.[t],Or=(e,t,a)=>{let i=Ya.get(e);i||(i={},Ya.set(e,i)),i[t]=a},Ci=e=>{if(e==null||e==="")return null;const t=Number(e);return Number.isNaN(t)?null:t},Rr=(e,t,a,i)=>{const s=a?.field?.fieldId,r=c=>{if(e[t.id]===c||e[t.id]==null&&(c===""||c==null))return;if(e[t.id]=c,!s){a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"update-row",parameters:{_editedRow:{...e}}},bubbles:!0,composed:!0}));return}const u=i[s];a.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:s,value:Array.isArray(u)?[...u]:u},bubbles:!0,composed:!0}))},n=e[t.id],l=n==null?"":String(n);switch(t.editorType){case"boolean":return o`<vaadin-checkbox ?checked=${!!n} @checked-changed=${c=>r(c.detail.value)}></vaadin-checkbox>`;case"integer":return o`<vaadin-integer-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(Ci(c.target.value))}></vaadin-integer-field>`;case"number":return o`<vaadin-number-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(Ci(c.target.value))}></vaadin-number-field>`;case"date":return o`<vaadin-date-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-date-picker>`;case"time":return o`<vaadin-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-time-picker>`;case"datetime":return o`<vaadin-date-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-date-time-picker>`;case"select":return o`<vaadin-combo-box
                theme="small" style="width:100%;"
                .items=${(t.editorOptions??[]).map(c=>({label:c.label,value:String(c.value)}))}
                item-label-path="label" item-value-path="value"
                .value=${l}
                @value-changed=${c=>r(c.detail.value)}></vaadin-combo-box>`;case"lookup":{const c=a?.field?.fieldId,u=`search-${c}-${t.id}`,m=`${c}-${t.id}`,f=(t.editorOptions??[]).find(x=>String(x.value)===l)??(l?{value:l,label:Pr(e,t.id)??l}:void 0);return o`<vaadin-combo-box
                theme="small" style="width:100%;"
                item-label-path="label" item-id-path="value"
                .dataProvider=${(x,g)=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:u,parameters:{searchText:x.filter,size:x.pageSize,page:x.page},callback:_=>{const P=_?.fragments?.[0]?.data?.[m];g(P?.content??[],P?.totalElements??0)},callbackonly:!0},bubbles:!0,composed:!0}))}}
                .selectedItem=${f}
                @selected-item-changed=${x=>{const g=x.detail.value,_=g?g.value:null;String(_??"")!==l&&(g&&Or(e,t.id,g.label),r(_))}}></vaadin-combo-box>`}default:return o`<vaadin-text-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(c.target.value)}></vaadin-text-field>`}},Va=e=>Ds(()=>o`<span title="${e}" style="white-space:normal;overflow-wrap:break-word;">${e}</span>`,[e]),Lr=e=>{e.preventDefault(),e.stopPropagation(),e.currentTarget?.dispatchEvent(new CustomEvent("sort-direction-changed",{detail:{grid:e.currentTarget.parentElement},bubbles:!0,composed:!0}))},zr=(e,t,a,i,s,r,n)=>{const l=Ce(e.label,i,s);return o`
<vaadin-grid-column-group header="${l}">
    ${e.columns.map(c=>Qi(c.metadata,t,a,i,s,r,n))}
</vaadin-grid-column-group>
`},oi=(e,t,a,i,s,r,n)=>h.GridGroupColumn==e.metadata?.type?zr(e.metadata,t,a,i,s,r,n):Qi(e.metadata,t,a,i,s,r,n),Qi=(e,t,a,i,s,r,n)=>{const l=Ce(e.label,i,s);return e.sortable?o`
                        <vaadin-grid-sort-column
                                path="${e.id}"
                                text-align="${e.align??d}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??d}"
                                ?resizable="${e.resizable}"
                                width="${e.width??d}"
                                @direction-changed="${Lr}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${Va(l)}
                                ${Je((c,u,m)=>fa(c,u,m,e,t,a,i,s,r,n),[])}
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
                                ${Va(l)}
                                ${Je((c,u,m)=>fa(c,u,m,e,t,a,i,s,r,n),[])}
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
                                ${Va(l)}
                                ${Je((c,u,m)=>fa(c,u,m,e,t,a,i,s,r,n),[])}
                        ></vaadin-grid-column>
                    `},fa=(e,t,a,i,s,r,n,l,c,u)=>{const m=a.dataset.dataType??"",v=a.dataset.stereotype??"";if(i.editable)return Rr(e,i,s,n);if(m=="status")return br(e,t,a);if(m=="bool")return gr(e,t,a);if(m=="money"||v=="money")return $r(e,t,a,m,v);if(m=="link"||v=="link")return yr(e,t,a,m,v,i);if(m=="icon"||v=="icon")return xr(e,t,a,m);if(v=="html")return wr(e,t,a);if(v=="image")return kr(e,t,a,m,v,i);if(m=="menu")return ki(e,t,a);if(m=="component")return Tr(e,t,a,s,r,n,l,c,u);if(m=="action")return _r(e,t,a);if(m=="actionGroup")return ki(e,t,a);if(v=="button"||i.actionId)return Ir(e,t,a,m,v,i);const f=e[a.path];return o`<span title="${f}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${f}</span>`},Dr=(e,t,a,i,s,r,n)=>{const l=t.metadata;if(l.tree){const u=async(m,v)=>{const f=m.parentItem?m.parentItem.children:l.page.content;v(f,f.length)};return o`
        <vaadin-grid style="${t.style}" class="${t.cssClasses}"
                     .itemHasChildrenPath="${"children"}" .dataProvider="${u}"
                     slot="${t.slot??d}"
                     all-rows-visible
        >
            ${l.content.map((m,v)=>{const f=m.metadata;return v>0?o`
            <vaadin-grid-column path="${m.id}"
                                header="${f?.label??d}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??d}"
                                width="${f?.width??d}"
                                .column="${m.metadata}"
                                ${Je((b,x,g)=>fa(b,x,g,f,e,a,i,s,r,n),[])}></vaadin-grid-column>
`:o`
            <vaadin-grid-tree-column path="${m.id}"
                                header="${f?.label??d}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??d}"
                                width="${f?.width??d}"
            ></vaadin-grid-tree-column>
`})}
            <span slot="empty-state">${xt()}</span>
        </vaadin-grid>
    `}let c=l.page?.content;return t.id&&i&&i[t.id]&&(c=i[t.id]),c||(c=[]),o`
        <vaadin-grid 
                style="${t.style}" 
                class="${t.cssClasses}" 
                .items="${c}"
                all-rows-visible
        >
            ${l?.content?.map(u=>oi(u,e,a,i,s,r,n))}
        </vaadin-grid>
    `},Ar=e=>{const a=(e.metadata.items??[]).map(i=>({text:i.text,time:i.time,userName:i.userName,userImg:i.userImg,userAbbr:i.userAbbr,userColorIndex:i.userColorIndex}));return o`
        <vaadin-message-list
                markdown
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??d}"
                .items="${a}"
        ></vaadin-message-list>
    `},lt=new Fs,X={value:{}},Qt={value:{}},Fr=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <vaadin-context-menu .items=${ni(e,l.menu,a,i,s,r,n)} 
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             open-on="${l.activateOnLeftClick?"click":d}"
                             slot="${t.slot??d}">
            ${$(e,l.wrapped,a,i,s,r,n)}
        </vaadin-context-menu>
            `},Nr=(e,t,a,i,s)=>{const r=t.metadata;return o`
        <vaadin-menu-bar .items=${ni(e,r.options,a,i,s,X,Qt)}
                         style="${t.style}" class="${t.cssClasses}"
                         slot="${t.slot??d}">
        </vaadin-menu-bar>
            `},Si=(e,t,a,i,s,r,n)=>{const l=document.createElement("vaadin-context-menu-item");return Vi($(e,t,a,i,s,r,n),l),l},ni=(e,t,a,i,s,r,n)=>t.map(l=>l.submenus?{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?Si(e,l.component,a,i,s,r,n):void 0,children:ni(e,l.submenus,a,i,s,r,n)}:l.separator?{component:"hr"}:{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?Si(e,l.component,a,i,s,r,n):void 0}),qr=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <vaadin-custom-field label="${l.label}"
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             slot="${t.slot??d}"
                             data-colspan="${l.colspan||d}"
        >
            ${$(e,l.content,a,i,s,r,n)}
        </vaadin-custom-field>
            `},Mr=e=>{const t=e.metadata,a=i=>{const s=i.detail?.value??"";!t.actionId||!s.trim()||i.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:{message:s}},bubbles:!0,composed:!0}))};return o`
        <vaadin-message-input
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??d}"
                @submit="${a}"
        ></vaadin-message-input>
    `},Ur=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <div id="show-notifications">${$(e,l.wrapped,a,i,s,r,n)}</div>
        <vaadin-tooltip
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
                for="show-notifications" text="${l.text}" position="top-start"></vaadin-tooltip>
    `},Br=e=>{if(e instanceof CustomEvent)return e.detail;const t={};for(const a in e){const i=e[a];["number","string","boolean"].indexOf(typeof i)>=0&&(t[a]=e[a])}return t},_i=(e,t,a)=>{for(let i in t.attributes)e.setAttribute(i,t.attributes[i]);a.style&&e.setAttribute("style",a.style),a.cssClasses&&e.setAttribute("class",a.cssClasses),a.slot&&e.setAttribute("slot",a.slot),t.content&&(t.html?e.innerHTML=t.content:e.append(t.content))},jr=e=>{const t=e.name;t.startsWith("vaadin-chart")&&!customElements.get(t)&&me(()=>import("./vendor-highcharts.js"),__vite__mapDeps([0,1,2,3]));const a=e.attributes?e.attributes.import:void 0;a&&t.includes("-")&&!customElements.get(t)&&import(a)},Wr=(e,t,a)=>{jr(t);let i=t.name;return t.attributes&&t.attributes.id&&(i="#"+t.attributes.id),setTimeout(()=>{const s=e.shadowRoot?.querySelector(".element-container")?.querySelector(i);if(s){for(;s.firstChild;)s.removeChild(s.lastChild);_i(s,t,a)}else{const r=document.createElement(t.name);_i(r,t,a);for(let n in t.on)r.addEventListener(n,l=>{const c=Br(l);e.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.on[n],parameters:{event:c}},bubbles:!0,composed:!0}))});e.shadowRoot?.querySelector(".element-container")?.appendChild(r)}}),o`<div class="element-container"></div>`};var G=(e=>(e.div="div",e.p="p",e.h1="h1",e.h2="h2",e.h3="h3",e.h4="h4",e.h5="h5",e.h6="h6",e.span="span",e))(G||{});const Vr=(e,t,a,i,s)=>{const r=e.metadata,n=r.attributes?.["data-colspan"],l=si(r.text,t,a,i,s);return G.h1==r.container?o`
            <h1 style="${e.style}" class="${e.cssClasses}"
                id="${R(e.id)}"
                data-colspan="${R(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h1>
        `:G.h2==r.container?o`
            <h2 style="${e.style}" class="${e.cssClasses}"
                id="${R(e.id)}"
                data-colspan="${R(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h2>
        `:G.h3==r.container?o`
            <h3 style="${e.style}" class="${e.cssClasses}"
                id="${R(e.id)}"
                data-colspan="${R(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h3>
        `:G.h4==r.container?o`
            <h4 style="${e.style}" class="${e.cssClasses}"
                id="${R(e.id)}"
                data-colspan="${R(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h4>
        `:G.h5==r.container?o`
            <h5 style="${e.style}" class="${e.cssClasses}"
                id="${R(e.id)}"
                data-colspan="${R(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h5>
        `:G.h6==r.container?o`
            <h6 style="${e.style}" class="${e.cssClasses}"
                id="${R(e.id)}"
                data-colspan="${R(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h6>
        `:G.p==r.container?o`
               <p style="${e.style}" class="${e.cssClasses}"
                  id="${R(e.id)}"
                  data-colspan="${R(n)}"
                  slot="${e.slot??d}">
                   ${l??d}
               </p>
            `:G.div==r.container?o`
               <div style="${e.style}" class="${e.cssClasses}"
                    id="${R(e.id)}"
                    data-colspan="${R(n)}"
                    slot="${e.slot??d}">${l?pe(l):d}</div>
            `:G.span==r.container?o`
               <span style="${e.style}" class="${e.cssClasses}"
                     id="${R(e.id)}"
                     data-colspan="${R(n)}"
                    slot="${e.slot??d}">${l??d}</span>
            `:o`
               <p
                       id="${R(e.id)}"
                       data-colspan="${R(n)}"
                       slot="${e.slot??d}">
                   Unknown text container: ${r.container} 
               </p>
            `},Hr=(e,t,a)=>{const i=e.metadata;return o`<span theme="badge ${i.color} ${i.pill?"pill":""} ${i.small?"small":""} ${i.primary?"primary":""}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??d}">${Be(i.text,t,a)}</span>`},Gr=(e,t,a)=>{const i=Be(e.text,t,a);if(!i)return d;let s=Be(e.color,t,a);return s=="SUCCESS"&&(s="success"),s=="ERROR"&&(s="error"),s=="DANGER"&&(s="error"),s=="WARNING"&&(s="warning"),s=="INFO"&&(s="info"),s=="PRIMARY"&&(s="primary"),s=="SECONDARY"&&(s="secondary"),s=="TERTIARY"&&(s="tertiary"),s=="QUATERNARY"&&(s="quaternary"),s=="LIGHT"&&(s="light"),s=="DARK"&&(s="dark"),o`<span theme="badge ${s} ${e.pill?"pill":""} ${e.small?"small":""} ${e.primary?"primary":""}">${i}</span>`},Kr=e=>{const t=e.metadata;return o`<a href="${t.url}" style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}">${t.text}</a>`},Zi=(e,t)=>{const a=e.toLowerCase().split("+");return t.ctrlKey===a.includes("ctrl")&&t.altKey===a.includes("alt")&&t.shiftKey===a.includes("shift")&&t.metaKey===a.includes("meta")},Jr=(e,t)=>{if(!Zi(e,t))return!1;const a=e.toLowerCase().split("+"),i=a[a.length-1];return!!(t.key.toLowerCase()===i||/^[a-z]$/.test(i)&&t.code==="Key"+i.toUpperCase()||/^[0-9]$/.test(i)&&(t.code==="Digit"+i||t.code==="Numpad"+i))},Yr=e=>e?e.split("+").map(t=>t.length<=1?t.toUpperCase():t.charAt(0).toUpperCase()+t.slice(1)).join("+"):void 0,Xr=(e,t)=>{const a=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a,parameters:t.parameters},bubbles:!0,composed:!0}))},Qr=(e,t,a)=>{const i=e.metadata,s=Ce(i.label,t,a);let r="";return i.buttonStyle&&(r+=" "+i.buttonStyle),i.color&&i.color!=="none"&&i.color!=="normal"&&(r+=" "+i.color),i.size&&i.size!=="none"&&i.size!=="normal"&&(r+=" "+i.size),o`<vaadin-button
id="${e.id}"
            data-action-id="${i.actionId}"
            @click="${n=>Xr(n,i)}"
            style="${e.style}"
            class="${e.cssClasses}"
            theme="${r}"
            ?disabled="${i.disabled}"
            title="${i.shortcut?`${s} (${Yr(i.shortcut)})`:d}"
            slot="${e.slot??d}"
    >${i.iconOnLeft?o`<vaadin-icon icon="${i.iconOnLeft}"></vaadin-icon>`:d}${s}${i.iconOnRight?o`<vaadin-icon icon="${i.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>`},Zr=(e,t,a,i,s,r,n)=>{const l=t.metadata;if(!l)return o``;let c="";return l.variants?.map(u=>u=="stretchMedia"?"stretch-media":u=="coverMedia"?"cover-media":u).forEach(u=>c+=" "+u),c=c.trim(),o`
        <vaadin-card
                style="${t.style}" 
                class="${t.cssClasses}" 
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${l.media?$t(e,l.media,a,i,s,r,n,"media",!1):d}
            ${l.title?$t(e,l.title,a,i,s,r,n,"title",!1):d}
            ${l.subtitle?$t(e,l.subtitle,a,i,s,r,n,"subtitle",!1):d}
            ${l.header?$t(e,l.header,a,i,s,r,n,"header",!1):d}
            ${l.headerPrefix?$t(e,l.headerPrefix,a,i,s,r,n,"header-prefix",!1):d}
            ${l.headerSuffix?$t(e,l.headerSuffix,a,i,s,r,n,"header-suffix",!1):d}
            ${l.footer?$t(e,l.footer,a,i,s,r,n,"footer",!1):d}
            ${l.content?$(e,l.content,a,i,s,r,n,!1):d}
        </vaadin-card>
    `},eo=e=>{const t=e.metadata;return o`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??d}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},to=e=>{const t=e.metadata;return o`
        <vaadin-icon icon="${t.icon}" style="${e.style}" class="${e.cssClasses}"
                     slot="${e.slot??d}"></vaadin-icon>
    `},ao=(e,t,a,i,s,r,n)=>{const l=t.metadata;let c=!1;if(l.openedCondition)try{c=Yi(l.openedCondition,i,s,r,n)}catch(u){console.error("when evaluating "+l.openedCondition+" :"+u+", where data is "+s+" and state is "+i)}return o`
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
  ${t.children?.map(u=>$(e,u,a,i,s,r,n))}
</vaadin-confirm-dialog>
            `},io=e=>{const t=e.metadata;let a;return t.position&&(a={Top:"top",Bottom:"bottom",TopLeft:"top-left",TopRight:"top-right",BottomLeft:"bottom-left",BottomRight:"bottom-right"}[t.position]),o`
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
    `},so=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <vaadin-details 
                ?opened="${l.opened}" 
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            <vaadin-details-summary slot="summary">
            ${$(e,l.summary,a,i,s,r,n)}
            </vaadin-details-summary>
            ${$(e,l.content,a,i,s,r,n)}
        </vaadin-details>
            `},ro=(e,t,a,i,s,r)=>o`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${i}"
            .appState="${s}"
            .appdata="${r}"
        ></mateu-dialog>
            `,oo=(e,t,a,i,s,r)=>o`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${i}"
            .appState="${s}"
            .appdata="${r}"
        ></mateu-drawer>
            `,no=e=>{const t=e.metadata;return o`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"  
                  route="${t.route}" 
                  consumedRoute="${t.consumedRoute}" 
                  id="${ie()}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??d}"
        ></mateu-ux>
        </mateu-api-caller>
            `},lo=e=>{const t=e.metadata;return o`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style}" class="${e.cssClasses}"
                        slot="${e.slot??d}"></mateu-markdown>
            `},co=e=>{const t=e.metadata;return o`
        <vaadin-notification
                .opened="${!0}"
                slot="${e.slot??d}"
                style="${e.style}"
                class="${e.cssClasses}"
                ${Hi(()=>o`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${t.title}</h3>
                        <div>
                            ${t.text}
                        </div>
                    </vaadin-horizontal-layout>
                `,[])}
        ></vaadin-notification>
            `},uo=(e,t={})=>{const a=e.metadata,i=a.valueKey?t[a.valueKey]:a.value;return o`
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
        ${a.text?o`<span class="text-secondary text-xs" id="sublbl">
    ${a.text}
  </span>`:d}
        </div>
    `},ho=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <div id="show-notifications">${$(e,l.wrapped,a,i,s,r,n)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                slot="${t.slot??d}"
                ${Gi(()=>o`${$(e,l.content,a,i,s,r,n)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
        ></vaadin-popover>
    `},po=e=>{const t=e.metadata;return o`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}"></mateu-map>
            `},mo=e=>{const t=e.metadata;return o`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??d}">
            `},vo=e=>{const t=e.metadata;return o`<vaadin-horizontal-layout theme="spacing"
                                          slot="${e.slot??d}">
        ${t.breadcrumbs.map(a=>o`
            <a href="${a.link}">${a.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </vaadin-horizontal-layout>`},fo=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${l.dots}" 
                ?nav = "${l.nav}" 
                ?loop = "${l.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(c=>o`<div>${$(e,c,a,i,s,r,n)}</div>`)}
        </skeleton-carousel>
    `},bo=(e,t,a,i)=>{const s=e.metadata;return o`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            ${s.menu.map(r=>es(r))}
        </div>
            `},es=e=>o`
        ${e.submenus?o`
                <vaadin-details summary="${e.label}" opened>
                    <vaadin-vertical-layout theme="spacing">
                        ${e.submenus.map(t=>es(t))}
                    </vaadin-vertical-layout>
                </vaadin-details>
            `:o`
                <a href="${e.path}">${e.label}</a>
        `}
        `,go=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`<div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >${l.content?pe(l.content):d}${t.children?.map(c=>$(e,c,a,i,s,r,n))}</div>
    `},$o=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return o`<vaadin-card
                slot="${t.slot??d}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?o`<div slot="title" style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color);">${c}</div>`:d}
        ${t.children?.map(u=>$(e,u,a,i,s,r,n))}
    </vaadin-card>
    `},yo=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return o`
        <div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(u=>$(e,u,a,i,s,r,n))}</div>
    `},Xa=(e,t,a,i,s,r,n,l)=>{const c=t.metadata,u=c?.fabs??[];return o`<mateu-page
            .component="${t}"
            baseUrl="${a}"
            .state="${i}"
            .data="${s}"
            .appState="${r}"
            .appdata="${n}"
            slot="${t.slot??d}"
            style="${t.style}"
            class="${t.cssClasses}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(m=>$(e,m,a,i,s,r,n))}
        ${c?.buttons?.map(m=>o`
                   ${$(e,{id:m.actionId,metadata:m,type:U.ClientSide,slot:"buttons"},void 0,i,s,r,n)}
`)}
        ${u.map((m,v)=>o`
            <button class="page-fab" style="position: fixed; bottom: ${1.5+v*4}rem; right: 5.5rem;"
                @click="${()=>e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:m.actionId},bubbles:!0,composed:!0}))}"
                title="${m.label}">
                <vaadin-icon icon="${m.icon}"></vaadin-icon>
            </button>
        `)}
</mateu-page>
    `},Qa=(e,t,a,i,s,r,n,l)=>o`<mateu-table-crud
            id="${t.id}"
            baseUrl="${a}"
            .component="${t}"
            .metadata="${t.metadata}"
            .state="${i}"
            .data="${s}"
            .appState="${r}"
            .appdata="${n}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(c=>$(e,c,a,i,s,r,n))}
    </mateu-table-crud>`,xo=e=>{const t=e.metadata;return o`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??d}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},wo=(e,t,a)=>{const i=e.metadata;return o`<mateu-chat sseUrl="${i.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??d}"></mateu-chat>`},ko=e=>{const t=e.metadata;return o`
        <mateu-workflow
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow>
    `},Co=e=>{const t=e.metadata;return o`
        <mateu-workflow-elk
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
                ?readOnly="${t.readOnly??!1}"
        ></mateu-workflow-elk>
    `},So=e=>{const t=e.metadata;return o`
        <mateu-form-editor
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Form","fields":[]}'}"
        ></mateu-form-editor>
    `},ts=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,_o=e=>e=="up"?"var(--lumo-success-text-color, #1a7f37)":e=="down"?"var(--lumo-error-text-color, #c5221f)":"var(--lumo-secondary-text-color, #666)",Eo=e=>e=="up"?"▲":e=="down"?"▼":"",Io=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},To=e=>{const t=e.metadata,a=!!t.actionId;return o`
        <div class="mateu-metric-card ${e.cssClasses??""}"
             style="${ts} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${a?"cursor: pointer;":""} ${e.style??""}"
             slot="${e.slot??d}"
             role="${a?"button":d}"
             @click="${i=>Io(i,t)}"
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
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${_o(t.trend)};">
                    ${Eo(t.trend)} ${t.trendLabel??d}
                </span>
            `:d}
            ${t.description?o`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:d}
        </div>
    `},Po=(e,t,a,i,s,r,n)=>o`
        <div class="mateu-scoreboard ${t.cssClasses??""}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(l=>$(e,l,a,i,s,r,n))}
        </div>
    `,Oo=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=l.colSpan&&l.colSpan>1?`grid-column: span ${l.colSpan};`:"",u=l.rowSpan&&l.rowSpan>1?`grid-row: span ${l.rowSpan};`:"";return o`
        <div class="mateu-dashboard-panel ${t.cssClasses??""}"
             style="${ts} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${u} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?o`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${l.title}</h3>
                    ${l.subtitle?o`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${l.subtitle}</span>`:d}
                </div>
            `:d}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(m=>$(e,m,a,i,s,r,n))}
            </div>
        </div>
    `},Ro=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=l.columns&&l.columns>0?`repeat(${l.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return o`
        <div class="mateu-dashboard ${t.cssClasses??""}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(u=>$(e,u,a,i,s,r,n))}
        </div>
    `};var Lo=Object.defineProperty,zo=Object.getOwnPropertyDescriptor,li=(e,t,a,i)=>{for(var s=i>1?void 0:i?zo(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Lo(t,a,s),s};let Zt=class extends E{constructor(){super(...arguments),this.panels=[],this.openPanels=new Set,this.initialized=!1}willUpdate(){!this.initialized&&this.panels.length&&(this.openPanels=new Set(this.panels.map((e,t)=>e.open?t:-1).filter(e=>e>=0)),this.initialized=!0)}toggle(e){const t=new Set(this.openPanels);t.has(e)?t.delete(e):t.add(e),this.openPanels=t}render(){return o`
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
        `}};Zt.styles=S`
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
    `;li([p({type:Array})],Zt.prototype,"panels",2);li([y()],Zt.prototype,"openPanels",2);Zt=li([C("mateu-foldout")],Zt);const Do=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <mateu-foldout
                .panels="${l.panels??[]}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(c=>$(e,c,a,i,s,r,n))}
        </mateu-foldout>
    `},Ao=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=!!l.image,u=c?`background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${l.image}'); background-size: cover; background-position: center; color: #fff;`:"",m=l.centered===!1?"flex-start":"center",v=l.centered===!1?"left":"center";return o`
        <div class="mateu-hero ${t.cssClasses??""}"
             style="display: flex; flex-direction: column; align-items: ${m}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${v}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); min-height: ${l.height??"12rem"}; box-sizing: border-box; ${u} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?o`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${l.title}</h1>`:d}
            ${l.subtitle?o`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${c?"":"color: var(--lumo-secondary-text-color, #666);"} max-width: 40rem;">${l.subtitle}</p>`:d}
            ${t.children?.length?o`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${m}; width: 100%; max-width: 40rem;">
                    ${t.children?.map(f=>$(e,f,a,i,s,r,n))}
                </div>
            `:d}
        </div>
    `};var Fo=Object.defineProperty,No=Object.getOwnPropertyDescriptor,as=(e,t,a,i)=>{for(var s=i>1?void 0:i?No(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Fo(t,a,s),s};const Ha=1440*60*1e3;let ba=class extends E{constructor(){super(...arguments),this.tasks=[]}range(){const e=this.tasks.flatMap(t=>[t.start,t.end]).filter(t=>!!t).map(t=>new Date(t+"T00:00:00").getTime());return e.length?{min:Math.min(...e)-Ha,max:Math.max(...e)+2*Ha}:null}months(e,t){const a=[],i=new Date(e);for(i.setDate(1);i.getTime()<=t;){const s=Math.max(i.getTime(),e),r=new Date(i.getFullYear(),i.getMonth()+1,1),n=Math.min(r.getTime(),t);a.push({label:i.toLocaleDateString(void 0,{month:"short",year:"2-digit"}),from:s,to:n}),i.setMonth(i.getMonth()+1)}return a}render(){const e=this.range();if(!e)return o``;const t=e.max-e.min,a=s=>(s-e.min)/t*100,i=Date.now();return o`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(s=>o`
                        <div class="month" style="width: ${(s.to-s.from)/t*100}%;">${s.label}</div>
                    `)}
                </div>
                ${this.tasks.map(s=>{const r=new Date(s.start+"T00:00:00").getTime(),n=new Date(s.end+"T00:00:00").getTime()+Ha;return o`
                        <div class="label" title="${s.title}">${s.title}</div>
                        <div class="lane">
                            ${i>=e.min&&i<=e.max?o`<div class="today" style="left: ${a(i)}%;"></div>`:d}
                            <div class="bar"
                                 title="${s.title} · ${s.start} → ${s.end}${s.progress?` · ${s.progress}%`:""}"
                                 style="left: ${a(r)}%; width: ${(n-r)/t*100}%; ${s.color?`--mateu-gantt-fill: ${s.color};`:""}">
                                <div class="fill" style="width: ${s.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};ba.styles=S`
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
    `;as([p({type:Array})],ba.prototype,"tasks",2);ba=as([C("mateu-gantt")],ba);const qo=e=>{const t=e.metadata;return o`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-gantt>
    `};var Mo=Object.defineProperty,Uo=Object.getOwnPropertyDescriptor,is=(e,t,a,i)=>{for(var s=i>1?void 0:i?Uo(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Mo(t,a,s),s};let ga=class extends E{constructor(){super(...arguments),this.columns=[]}clickCard(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedCard:e}},bubbles:!0,composed:!0}))}render(){return o`
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
                                ${t.description?o`<span class="card-desc">${t.description}</span>`:d}
                                ${t.badge?o`<span class="badge">${t.badge}</span>`:d}
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};ga.styles=S`
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
    `;is([p({type:Array})],ga.prototype,"columns",2);ga=is([C("mateu-kanban")],ga);const Bo=e=>{const t=e.metadata;return o`
        <mateu-kanban
                .columns="${t.columns??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-kanban>
    `};var jo=Object.defineProperty,Wo=Object.getOwnPropertyDescriptor,ss=(e,t,a,i)=>{for(var s=i>1?void 0:i?Wo(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&jo(t,a,s),s};let $a=class extends E{constructor(){super(...arguments),this.items=[]}clickItem(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedItem:e}},bubbles:!0,composed:!0}))}render(){return o`
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
                                ${e.timestamp?o`<span class="time">${e.timestamp}</span>`:d}
                            </div>
                            ${e.description?o`<div class="desc">${e.description}</div>`:d}
                        </div>
                    </div>
                `)}
            </div>
        `}};$a.styles=S`
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
    `;ss([p({type:Array})],$a.prototype,"items",2);$a=ss([C("mateu-timeline")],$a);const Vo=e=>{const t=e.metadata;return o`
        <mateu-timeline
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-timeline>
    `};var Ho=Object.defineProperty,Go=Object.getOwnPropertyDescriptor,rs=(e,t,a,i)=>{for(var s=i>1?void 0:i?Go(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Ho(t,a,s),s};let ya=class extends E{constructor(){super(...arguments),this.steps=[]}render(){return o`
            <div class="steps">
                ${this.steps.map((e,t)=>{const a=e.status??"upcoming";return o`
                        <div class="step ${a}">
                            <div class="connector"></div>
                            <div class="dot">${a==="done"?"✓":t+1}</div>
                            <div class="label">${e.title}</div>
                            ${e.description?o`<div class="desc">${e.description}</div>`:d}
                        </div>
                    `})}
            </div>
        `}};ya.styles=S`
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
            top: 1rem;
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
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: .85rem;
            background: var(--lumo-contrast-10pct, #e5e7eb);
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
            margin-top: .4rem;
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
    `;rs([p({type:Array})],ya.prototype,"steps",2);ya=rs([C("mateu-progress-steps")],ya);const Ko=e=>{const t=e.metadata;return o`
        <mateu-progress-steps
                .steps="${t.steps??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-progress-steps>
    `};var Jo=Object.defineProperty,Yo=Object.getOwnPropertyDescriptor,pt=(e,t,a,i)=>{for(var s=i>1?void 0:i?Yo(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Jo(t,a,s),s};let je=class extends E{constructor(){super(...arguments),this.spark=[]}sparkline(){const e=this.spark;if(!e||e.length<2)return d;const t=84,a=30,i=2,s=Math.min(...e),n=Math.max(...e)-s||1,l=(t-i*2)/(e.length-1),c=e.map((f,b)=>{const x=i+b*l,g=i+(a-i*2)*(1-(f-s)/n);return[x,g]}),u=c.map(([f,b],x)=>`${x===0?"M":"L"}${f.toFixed(1)} ${b.toFixed(1)}`).join(" "),m=`${u} L${c[c.length-1][0].toFixed(1)} ${a} L${c[0][0].toFixed(1)} ${a} Z`,v=this.trend==="down"?"var(--lumo-error-color, #e11d48)":this.trend==="flat"?"var(--lumo-secondary-text-color, #888)":"var(--lumo-success-color, #12b76a)";return B`
            <svg width="${t}" height="${a}" viewBox="0 0 ${t} ${a}">
                <path d="${m}" fill="${v}" opacity="0.12"></path>
                <path d="${u}" fill="none" stroke="${v}" stroke-width="1.6"
                      stroke-linejoin="round" stroke-linecap="round"></path>
            </svg>
        `}dispatchAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){const e=this.trend??"up";return o`
            <div class="tile ${this.actionId?"clickable":""}" @click="${()=>this.dispatchAction()}">
                ${this.label?o`<span class="label">${this.label}</span>`:d}
                <span class="value">${this.value}${this.unit?o`<span class="unit">${this.unit}</span>`:d}</span>
                <div class="foot">
                    ${this.delta?o`<span class="delta ${e}">${e==="up"?"▲":e==="down"?"▼":"→"} ${this.delta}</span>`:o`<span></span>`}
                    ${this.sparkline()}
                </div>
            </div>
        `}};je.styles=S`
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
    `;pt([p()],je.prototype,"label",2);pt([p()],je.prototype,"value",2);pt([p()],je.prototype,"unit",2);pt([p()],je.prototype,"delta",2);pt([p()],je.prototype,"trend",2);pt([p({type:Array})],je.prototype,"spark",2);pt([p()],je.prototype,"actionId",2);je=pt([C("mateu-stat")],je);const Xo=e=>{const t=e.metadata;return o`
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
    `};var Qo=Object.defineProperty,Zo=Object.getOwnPropertyDescriptor,di=(e,t,a,i)=>{for(var s=i>1?void 0:i?Zo(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Qo(t,a,s),s};let ea=class extends E{constructor(){super(...arguments),this.events=[]}clickEvent(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedEvent:e}},bubbles:!0,composed:!0}))}render(){const e=this.month?new Date(this.month+"T00:00:00"):new Date,t=e.getFullYear(),a=e.getMonth(),i=new Date(t,a,1),s=(i.getDay()+6)%7,r=new Date(t,a+1,0).getDate(),n=new Date,l=f=>n.getFullYear()===t&&n.getMonth()===a&&n.getDate()===f,c={};for(const f of this.events){if(!f.date)continue;const b=new Date(f.date+"T00:00:00");b.getFullYear()===t&&b.getMonth()===a&&(c[b.getDate()]??=[]).push(f)}const u=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],m=[];for(let f=0;f<s;f++)m.push(o`<div class="cell blank"></div>`);for(let f=1;f<=r;f++)m.push(o`
                <div class="cell ${l(f)?"today":""}">
                    <span class="num">${f}</span>
                    ${(c[f]??[]).map(b=>o`
                        <span class="chip ${b.actionId?"clickable":""}"
                              style="${b.color?`--mateu-cal-accent: ${b.color};`:""}"
                              title="${b.title??""}"
                              @click="${()=>this.clickEvent(b)}">${b.title}</span>
                    `)}
                </div>
            `);const v=i.toLocaleDateString(void 0,{month:"long",year:"numeric"});return o`
            <div class="title">${v}</div>
            <div class="grid">
                ${u.map(f=>o`<div class="dow">${f}</div>`)}
                ${m}
            </div>
        `}};ea.styles=S`
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
    `;di([p()],ea.prototype,"month",2);di([p({type:Array})],ea.prototype,"events",2);ea=di([C("mateu-calendar")],ea);const en=e=>{const t=e.metadata;return o`
        <mateu-calendar
                month="${t.month??d}"
                .events="${t.events??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-calendar>
    `};var tn=Object.defineProperty,an=Object.getOwnPropertyDescriptor,os=(e,t,a,i)=>{for(var s=i>1?void 0:i?an(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&tn(t,a,s),s};let xa=class extends E{constructor(){super(...arguments),this.plans=[]}cta(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return o`
            <div class="plans">
                ${this.plans.map(e=>o`
                    <div class="plan ${e.featured?"featured":""}">
                        ${e.featured?o`<span class="badge">Recommended</span>`:d}
                        <span class="name">${e.name}</span>
                        <div>
                            <span class="price">${e.price}</span>
                            ${e.period?o`<span class="period">${e.period}</span>`:d}
                        </div>
                        <ul>
                            ${(e.features??[]).map(t=>o`<li>${t}</li>`)}
                        </ul>
                        ${e.ctaLabel?o`
                            <button class="cta" @click="${()=>this.cta(e)}">${e.ctaLabel}</button>
                        `:d}
                    </div>
                `)}
            </div>
        `}};xa.styles=S`
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
    `;os([p({type:Array})],xa.prototype,"plans",2);xa=os([C("mateu-pricing-table")],xa);const sn=e=>{const t=e.metadata;return o`
        <mateu-pricing-table
                .plans="${t.plans??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-pricing-table>
    `};var rn=Object.defineProperty,on=Object.getOwnPropertyDescriptor,ns=(e,t,a,i)=>{for(var s=i>1?void 0:i?on(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&rn(t,a,s),s};let wa=class extends E{clickNode(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedNode:e}},bubbles:!0,composed:!0}))}renderNode(e){const t=e.avatar,a=t&&(t.startsWith("http")||t.startsWith("data:"));return o`
            <li>
                <div class="node ${e.actionId?"clickable":""}"
                     style="${e.color?`--mateu-org-accent: ${e.color};`:""}"
                     @click="${()=>this.clickNode(e)}">
                    ${t?o`<span class="avatar">${a?o`<img src="${t}" alt="">`:t}</span>`:d}
                    <span class="title">${e.title}</span>
                    ${e.subtitle?o`<span class="subtitle">${e.subtitle}</span>`:d}
                </div>
                ${e.children&&e.children.length?o`<ul>${e.children.map(i=>this.renderNode(i))}</ul>`:d}
            </li>
        `}render(){return this.root?o`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`:o``}};wa.styles=S`
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
    `;ns([p({attribute:!1})],wa.prototype,"root",2);wa=ns([C("mateu-org-chart")],wa);const nn=e=>{const t=e.metadata;return o`
        <mateu-org-chart
                .root="${t.root}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-org-chart>
    `};var ln=Object.defineProperty,dn=Object.getOwnPropertyDescriptor,ls=(e,t,a,i)=>{for(var s=i>1?void 0:i?dn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&ln(t,a,s),s};const cn=1440*60*1e3;let ka=class extends E{constructor(){super(...arguments),this.cells=[]}color(e,t){if(e<=0||t<=0)return"var(--lumo-contrast-10pct, #ebedf0)";const a=e/t,i=a>.75?1:a>.5?.75:a>.25?.5:.3;return`color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round(i*100)}%, transparent)`}render(){const e=this.cells.filter(c=>!!c.date);if(!e.length)return o``;const t=e.map(c=>new Date(c.date+"T00:00:00").getTime()),a=Math.min(...t),i=Math.max(...t),s=new Date(a);s.setDate(s.getDate()-(s.getDay()+6)%7);const r={};for(const c of e)r[c.date]=c;const n=Math.max(...e.map(c=>c.value??0),1),l=[];for(let c=s.getTime();c<=i;c+=cn){const u=new Date(c),m=u.toISOString().slice(0,10),v=r[m],f=v?.value??0,b=(u.getDay()+6)%7+1,x=v?.label??`${m}: ${f}`;l.push(o`
                <div class="cell" style="grid-row: ${b}; --cell: ${this.color(f,n)};" title="${x}"></div>
            `)}return o`
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
        `}};ka.styles=S`
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
    `;ls([p({type:Array})],ka.prototype,"cells",2);ka=ls([C("mateu-heatmap")],ka);const un=e=>{const t=e.metadata;return o`
        <mateu-heatmap
                .cells="${t.cells??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-heatmap>
    `};var hn=Object.defineProperty,pn=Object.getOwnPropertyDescriptor,ds=(e,t,a,i)=>{for(var s=i>1?void 0:i?pn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&hn(t,a,s),s};let Ca=class extends E{constructor(){super(...arguments),this.stages=[]}render(){const e=this.stages;if(!e.length)return o``;const t=e[0].value??0,a=Math.max(...e.map(i=>i.value??0),1);return o`
            <div class="funnel">
                ${e.map((i,s)=>{const r=i.value??0,n=a>0?Math.max(6,r/a*100):6,l=s>0?e[s-1].value??0:t,c=s===0?t>0?"100%":"":l>0?`${Math.round(r/l*100)}%`:"0%";return o`
                        <div class="stage">
                            <div class="meta">
                                <span class="label">${i.label}</span>
                                ${s>0?o`<span class="conv">${c} of previous</span>`:d}
                            </div>
                            <div class="bar" style="width: ${n}%; ${i.color?`--bar: ${i.color};`:""}">
                                ${r.toLocaleString()}
                            </div>
                        </div>
                    `})}
            </div>
        `}};Ca.styles=S`
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
    `;ds([p({type:Array})],Ca.prototype,"stages",2);Ca=ds([C("mateu-funnel")],Ca);const mn=e=>{const t=e.metadata;return o`
        <mateu-funnel
                .stages="${t.stages??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-funnel>
    `};var vn=Object.defineProperty,fn=Object.getOwnPropertyDescriptor,jt=(e,t,a,i)=>{for(var s=i>1?void 0:i?fn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&vn(t,a,s),s};let dt=class extends E{constructor(){super(...arguments),this.values=[],this.labels=[],this.area=!1}render(){const e=this.values;if(!e||e.length<2)return o``;const t=600,a=160,i=8,s=Math.min(...e),r=Math.max(...e),n=r-s||1,l=(t-i*2)/(e.length-1),c=e.map((x,g)=>{const _=i+g*l,P=i+(a-i*2)*(1-(x-s)/n);return[_,P]}),u=c.map(([x,g],_)=>`${_===0?"M":"L"}${x.toFixed(1)} ${g.toFixed(1)}`).join(" "),m=`${u} L${c[c.length-1][0].toFixed(1)} ${a-i} L${c[0][0].toFixed(1)} ${a-i} Z`,v=this.color||"var(--lumo-primary-color, #1a73e8)",f=e.indexOf(r),b=e.indexOf(s);return o`
            ${this.heading?o`<div class="title">${this.heading}</div>`:d}
            <svg viewBox="0 0 ${t} ${a}" preserveAspectRatio="none">
                ${this.area?B`<path d="${m}" fill="${v}" opacity="0.12"></path>`:d}
                <path d="${u}" fill="none" stroke="${v}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
                ${c.map((x,g)=>g===f||g===b?B`<circle cx="${x[0]}" cy="${x[1]}" r="3.2" fill="${v}"><title>${this.labels[g]??""}: ${e[g]}</title></circle>`:B`<circle cx="${x[0]}" cy="${x[1]}" r="6" fill="transparent"><title>${this.labels[g]??""}: ${e[g]}</title></circle>`)}
            </svg>
            ${this.labels&&this.labels.length?o`<div class="labels"><span>${this.labels[0]}</span><span>${this.labels[this.labels.length-1]}</span></div>`:d}
        `}};dt.styles=S`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .title { font-weight: 600; margin-bottom: .35rem; color: var(--lumo-body-text-color, #222); }
        svg { display: block; width: 100%; height: auto; overflow: visible; }
        .labels { display: flex; justify-content: space-between; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); margin-top: .2rem; }
    `;jt([p()],dt.prototype,"heading",2);jt([p({type:Array})],dt.prototype,"values",2);jt([p({type:Array})],dt.prototype,"labels",2);jt([p()],dt.prototype,"color",2);jt([p({type:Boolean})],dt.prototype,"area",2);dt=jt([C("mateu-trend-chart")],dt);const bn=e=>{const t=e.metadata;return o`
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
    `};var gn=Object.defineProperty,$n=Object.getOwnPropertyDescriptor,ci=(e,t,a,i)=>{for(var s=i>1?void 0:i?$n(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&gn(t,a,s),s};let ta=class extends E{constructor(){super(...arguments),this.features=[],this.columns=0}clickFeature(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){const e=this.columns&&this.columns>0?`repeat(${this.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(15rem, 1fr))";return o`
            <div class="grid" style="grid-template-columns: ${e};">
                ${this.features.map(t=>o`
                    <div class="card ${t.actionId?"clickable":""}" @click="${()=>this.clickFeature(t)}">
                        ${t.icon?o`<span class="icon">${t.icon}</span>`:d}
                        <span class="title">${t.title}</span>
                        ${t.description?o`<span class="desc">${t.description}</span>`:d}
                    </div>
                `)}
            </div>
        `}};ta.styles=S`
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
    `;ci([p({type:Array})],ta.prototype,"features",2);ci([p({type:Number})],ta.prototype,"columns",2);ta=ci([C("mateu-feature-grid")],ta);const yn=e=>{const t=e.metadata;return o`
        <mateu-feature-grid
                .features="${t.features??[]}"
                .columns="${t.columns??0}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-feature-grid>
    `};var xn=Object.defineProperty,wn=Object.getOwnPropertyDescriptor,cs=(e,t,a,i)=>{for(var s=i>1?void 0:i?wn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&xn(t,a,s),s};let Sa=class extends E{constructor(){super(...arguments),this.items=[]}stars(e){const t=Math.max(0,Math.min(5,e||0));return"★".repeat(t)+"☆".repeat(5-t)}render(){return o`
            <div class="grid">
                ${this.items.map(e=>{const t=e.avatar&&(e.avatar.startsWith("http")||e.avatar.startsWith("data:"));return o`
                        <div class="card">
                            ${e.rating?o`<div class="stars">${this.stars(e.rating)}</div>`:d}
                            <div class="quote">${e.quote}</div>
                            <div class="author">
                                ${e.avatar?o`<span class="avatar">${t?o`<img src="${e.avatar}" alt="">`:e.avatar}</span>`:d}
                                <div>
                                    <div class="name">${e.author}</div>
                                    ${e.role?o`<div class="role">${e.role}</div>`:d}
                                </div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};Sa.styles=S`
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
    `;cs([p({type:Array})],Sa.prototype,"items",2);Sa=cs([C("mateu-testimonials")],Sa);const kn=e=>{const t=e.metadata;return o`
        <mateu-testimonials
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-testimonials>
    `};var Cn=Object.defineProperty,Sn=Object.getOwnPropertyDescriptor,ui=(e,t,a,i)=>{for(var s=i>1?void 0:i?Sn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Cn(t,a,s),s};let aa=class extends E{constructor(){super(...arguments),this.items=[],this.openSet=new Set,this.seeded=!1}seed(){this.seeded||(this.seeded=!0,this.items.forEach((e,t)=>{e.open&&this.openSet.add(t)}))}toggle(e){this.openSet.has(e)?this.openSet.delete(e):this.openSet.add(e),this.requestUpdate()}render(){return this.seed(),o`
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
        `}};aa.styles=S`
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
    `;ui([p({type:Array})],aa.prototype,"items",2);ui([y()],aa.prototype,"openSet",2);aa=ui([C("mateu-faq")],aa);const _n=e=>{const t=e.metadata;return o`
        <mateu-faq
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-faq>
    `};var En=Object.defineProperty,In=Object.getOwnPropertyDescriptor,It=(e,t,a,i)=>{for(var s=i>1?void 0:i?In(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&En(t,a,s),s};let Ye=class extends E{themeVars(){switch(this.theme){case"success":return"--accent: var(--lumo-success-color, #12b76a); --bg: var(--lumo-success-color-10pct, rgba(18,183,106,.1));";case"warning":return"--accent: #f59e0b; --bg: rgba(245,158,11,.12);";case"danger":return"--accent: var(--lumo-error-color, #e11d48); --bg: var(--lumo-error-color-10pct, rgba(225,29,72,.1));";default:return"--accent: var(--lumo-primary-color, #1a73e8); --bg: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));"}}cta(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){return o`
            <div class="callout" style="${this.themeVars()}">
                ${this.icon?o`<span class="icon">${this.icon}</span>`:d}
                <div class="body">
                    ${this.heading?o`<span class="heading">${this.heading}</span>`:d}
                    ${this.description?o`<span class="desc">${this.description}</span>`:d}
                    ${this.ctaLabel?o`<button class="cta" @click="${()=>this.cta()}">${this.ctaLabel}</button>`:d}
                </div>
            </div>
        `}};Ye.styles=S`
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
    `;It([p()],Ye.prototype,"heading",2);It([p()],Ye.prototype,"description",2);It([p()],Ye.prototype,"icon",2);It([p()],Ye.prototype,"ctaLabel",2);It([p()],Ye.prototype,"actionId",2);It([p()],Ye.prototype,"theme",2);Ye=It([C("mateu-callout-card")],Ye);const Tn=e=>{const t=e.metadata;return o`
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
    `};var Pn=Object.defineProperty,On=Object.getOwnPropertyDescriptor,us=(e,t,a,i)=>{for(var s=i>1?void 0:i?On(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Pn(t,a,s),s};let _a=class extends E{constructor(){super(...arguments),this.comments=[]}renderComment(e){const t=e.avatar&&(e.avatar.startsWith("http")||e.avatar.startsWith("data:"));return o`
            <div class="comment">
                <span class="avatar">${e.avatar?t?o`<img src="${e.avatar}" alt="">`:e.avatar:e.author?.[0]??"?"}</span>
                <div class="body">
                    <div class="head">
                        <span class="author">${e.author}</span>
                        ${e.timestamp?o`<span class="time">${e.timestamp}</span>`:d}
                    </div>
                    <div class="text">${e.text}</div>
                    ${e.replies&&e.replies.length?o`<div class="replies">${e.replies.map(a=>this.renderComment(a))}</div>`:d}
                </div>
            </div>
        `}render(){return o`<div class="thread">${this.comments.map(e=>this.renderComment(e))}</div>`}};_a.styles=S`
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
    `;us([p({type:Array})],_a.prototype,"comments",2);_a=us([C("mateu-comment-thread")],_a);const Rn=e=>{const t=e.metadata;return o`
        <mateu-comment-thread
                .comments="${t.comments??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-comment-thread>
    `};var Ln=Object.defineProperty,zn=Object.getOwnPropertyDescriptor,hs=(e,t,a,i)=>{for(var s=i>1?void 0:i?zn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Ln(t,a,s),s};const Dn={pdf:"📕",image:"🖼️",img:"🖼️",doc:"📘",docx:"📘",word:"📘",xls:"📗",xlsx:"📗",excel:"📗",sheet:"📗",zip:"🗜️",archive:"🗜️",video:"🎬",audio:"🎵",code:"💻",csv:"📄",txt:"📄"};let Ea=class extends E{constructor(){super(...arguments),this.files=[]}icon(e){return e&&Dn[e.toLowerCase()]||"📄"}clickFile(e,t){e.url||e.actionId&&(t.preventDefault(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_file:e}},bubbles:!0,composed:!0})))}render(){return o`
            <div class="list">
                ${this.files.map(e=>{const t=!!e.url||!!e.actionId,a=o`
                        <span class="icon">${this.icon(e.type)}</span>
                        <span class="name">${e.name}</span>
                        ${e.size?o`<span class="size">${e.size}</span>`:d}
                        ${e.url?o`<span class="dl">⬇</span>`:d}
                    `;return e.url?o`<a class="file clickable" href="${e.url}" download target="_blank" rel="noopener">${a}</a>`:o`<div class="file ${t?"clickable":""}" @click="${i=>this.clickFile(e,i)}">${a}</div>`})}
            </div>
        `}};Ea.styles=S`
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
    `;hs([p({type:Array})],Ea.prototype,"files",2);Ea=hs([C("mateu-file-list")],Ea);const An=e=>{const t=e.metadata;return o`
        <mateu-file-list
                .files="${t.files??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-file-list>
    `},Fn=(e,t)=>{let a=e.style;return e.id&&(a&&!a.endsWith(";")&&(a+=";"),a==null&&(a=""),t[e.id+".hidden"]==!0&&(a+="display: none;")),a},Nn=(e,t)=>{let a={...e.metadata};if(e.id&&a){if(a.type==h.Button){const i=a;t[e.id+".disabled"]==!0&&(i.disabled=!0)}if(a.type==h.FormField){const i=a;t[e.id+".disabled"]==!0&&(i.disabled=!0)}}return a},L=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),qn={[h.Bpmn]:({component:e})=>xo(e),[h.Workflow]:({component:e})=>ko(e),[h.WorkflowElk]:({component:e})=>Co(e),[h.FormEditor]:({component:e})=>So(e),[h.Page]:L(Xa),[h.Div]:L(go),[h.Directory]:({component:e,baseUrl:t,state:a,data:i})=>bo(e),[h.FormLayout]:L(Vs),[h.HorizontalLayout]:L(Ks),[h.VerticalLayout]:L(Js),[h.SplitLayout]:L(Ys),[h.MasterDetailLayout]:L(Xs),[h.TabLayout]:L(Qs),[h.AccordionLayout]:L(er),[h.BoardLayout]:L(rr),[h.BoardLayoutRow]:L(or),[h.BoardLayoutItem]:L(nr),[h.Scroller]:L(ar),[h.FullWidth]:L(ir),[h.Container]:L(sr),[h.Form]:({container:e,component:t,baseUrl:a,state:i,data:s,appState:r,appData:n})=>{const l=t.metadata;return o`<mateu-form
            id="${t.id}"
        baseUrl="${a}"
            .component="${t}"
            .values="${i}"
            .state="${i}"
            .data="${s}"
            .appState="${r}"
            .appdata="${n}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            >
                ${t.children?.map(c=>$(e,c,a,i,s,r,n))}
            ${l?.buttons?.map(c=>o`
               ${$(e,{id:c.actionId,metadata:c,type:U.ClientSide,slot:"buttons"},void 0,i,s,r,n)}
`)}

            </mateu-form>`},[h.Table]:({container:e,component:t,baseUrl:a,state:i,data:s,appState:r,appData:n})=>o`<mateu-table
                        id="${t.id}"
        baseUrl="${a}"
            .metadata="${t.metadata}"
            .state="${i}"
                        .data="${s}"
                        .appState="${r}"
                        .appDate="${n}"
                        style="${t.style}" class="${t.cssClasses}"
                        slot="${t.slot??d}"
            >
             ${t.children?.map(l=>$(e,l,a,i,s,r,n))}
            </mateu-table>`,[h.Crud]:L(Qa),[h.App]:({container:e,component:t,baseUrl:a,state:i,data:s,appState:r,appData:n})=>o`
            <mateu-app
                        id="${t.id}"
                        baseUrl="${a}"
                        .component="${t}"
                        .state="${i}"
                        .data="${s}"
                        style="${t.style}"
                        class="${t.cssClasses}"
                        .appState="${r}"
                        .appData="${n}"
            >
             ${t.children?.map(l=>$(e,l,a,i,s,r,n))}
         </mateu-app>`,[h.Element]:({container:e,component:t})=>Wr(e,t.metadata,t),[h.FormField]:({container:e,component:t,baseUrl:a,state:i,data:s,appState:r,appData:n,labelAlreadyRendered:l})=>{const c=t.metadata;return o`
    <mateu-field
                   id="${t.id}"
                   .component="${t}"
            .field="${t.metadata}"
                   .state="${i}"
                   .data="${s}"
                   .appState="${r}"
                   .appdata="${n}"
                   style="${t.style}" class="${t.cssClasses}"
                   slot="${t.slot??d}"
                   data-colspan="${c.colspan}"
                   .labelAlreadyRendered="${l}"
            >
                    ${t.children?.map(u=>$(e,u,a,i,s,r,n,l))}
                </mateu-field>
        `},[h.Text]:({component:e,state:t,data:a,appState:i,appData:s})=>Vr(e,t,a,i,s),[h.Avatar]:({component:e,state:t,data:a})=>dr(e,t,a),[h.Chat]:({component:e,state:t,data:a})=>wo(e),[h.AvatarGroup]:({component:e})=>cr(e),[h.Badge]:({component:e,state:t,data:a})=>Hr(e,t,a),[h.Breadcrumbs]:({component:e})=>vo(e),[h.Anchor]:({component:e})=>Kr(e),[h.Button]:({component:e,state:t,data:a})=>Qr(e,t,a),[h.Card]:L(Zr),[h.Chart]:({component:e})=>eo(e),[h.Icon]:({component:e})=>to(e),[h.ConfirmDialog]:L(ao),[h.ContextMenu]:L(Fr),[h.CookieConsent]:({component:e})=>io(e),[h.Details]:L(so),[h.Dialog]:({component:e,baseUrl:t,state:a,data:i,appState:s,appData:r})=>ro(e,t,a,i,s,r),[h.Drawer]:({component:e,baseUrl:t,state:a,data:i,appState:s,appData:r})=>oo(e,t,a,i,s,r),[h.Image]:({component:e})=>mo(e),[h.Map]:({component:e})=>po(e),[h.Markdown]:({component:e})=>lo(e),[h.MicroFrontend]:({component:e})=>no(e),[h.Notification]:({component:e})=>co(e),[h.ProgressBar]:({component:e,state:t})=>uo(e,t),[h.Popover]:L(ho),[h.CarouselLayout]:L(fo),[h.Tooltip]:L(Ur),[h.MessageInput]:({component:e})=>Mr(e),[h.MessageList]:({component:e})=>Ar(e),[h.CustomField]:L(qr),[h.MenuBar]:({container:e,component:t,baseUrl:a,state:i,data:s})=>Nr(e,t,a,i,s),[h.Grid]:L(Dr),[h.VirtualList]:L(ur),[h.FormSection]:L($o),[h.FormSubSection]:L(yo),[h.MetricCard]:({component:e})=>To(e),[h.Scoreboard]:L(Po),[h.DashboardPanel]:L(Oo),[h.DashboardLayout]:L(Ro),[h.FoldoutLayout]:L(Do),[h.HeroSection]:L(Ao),[h.EmptyState]:({component:e})=>vr(e),[h.Skeleton]:({component:e})=>fr(e),[h.Gantt]:({component:e})=>qo(e),[h.Kanban]:({component:e})=>Bo(e),[h.Timeline]:({component:e})=>Vo(e),[h.ProgressSteps]:({component:e})=>Ko(e),[h.Stat]:({component:e})=>Xo(e),[h.Calendar]:({component:e})=>en(e),[h.PricingTable]:({component:e})=>sn(e),[h.OrgChart]:({component:e})=>nn(e),[h.Heatmap]:({component:e})=>un(e),[h.Funnel]:({component:e})=>mn(e),[h.TrendChart]:({component:e})=>bn(e),[h.FeatureGrid]:({component:e})=>yn(e),[h.Testimonials]:({component:e})=>kn(e),[h.Faq]:({component:e})=>_n(e),[h.CalloutCard]:({component:e})=>Tn(e),[h.CommentThread]:({component:e})=>Rn(e),[h.FileList]:({component:e})=>An(e)},hi=(e,t,a,i,s,r,n,l)=>{if(!t?.metadata)return t==null?(console.warn("No metadata for component",t),o`<p>No metadata for component</p>`):hi(e,{id:ie(),metadata:t,type:U.ClientSide},a,i,s,r,n,l);const c=t.metadata.type,u={...t,style:Fn(t,s),metadata:Nn(t,s)},m=qn[c];return m?m({container:e,component:u,baseUrl:a,state:i,data:s,appState:r,appData:n,labelAlreadyRendered:l}):o`<p ${u?.slot??d}>Unknown metadata type ${c} for component ${u?.id}</p>`};var we=(e=>(e.HAMBURGUER_MENU="HAMBURGUER_MENU",e.MENU_ON_LEFT="MENU_ON_LEFT",e.MENU_ON_TOP="MENU_ON_TOP",e.TABS="TABS",e.TILES="TILES",e.RAIL="RAIL",e.AUTO="AUTO",e.MEDIATOR="MEDIATOR",e))(we||{});const pi="mateu-app-context",ps="mateu-app-context-labels",ms=e=>{try{return JSON.parse(localStorage.getItem(e)??"{}")}catch{return{}}},Ei=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},mi=()=>ms(pi),vs=()=>ms(ps),Mn=(e,t,a)=>{const i=mi(),s=vs();t==null||t===""?(delete i[e],delete s[e]):(i[e]=t,a!==void 0&&(s[e]=a)),Ei(pi,i),Ei(ps,s)};let Ii=!1;const Un=()=>{Ii||(Ii=!0,window.addEventListener("storage",e=>{e.key===pi&&e.newValue!==e.oldValue&&window.location.reload()}))};let Dt=[];class Bn{constructor(){this.axiosInstance=Ns.create({timeout:6e4}),this.axiosInstance.interceptors.request.use(t=>(this.addAuthToken(t),this.addSessionId(t),t))}addSessionId(t){let a=sessionStorage.getItem("__mateu_sesion_id");a||(a=ie(),sessionStorage.setItem("__mateu_sesion_id",a)),t.headers["X-Session-Id"]=a}addAuthToken(t){const a=localStorage.getItem("__mateu_auth_token");a&&(t.headers.Authorization="Bearer "+a)}async wrap(t,a,i,s){return i||a.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),t.then(r=>(a.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:s}})),r)).catch(r=>{throw r?.code=="ERR_CANCELED"?a.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{}})):a.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:s,reason:this.serialize(r)}})),r})}serialize(t){return t?.message?t:JSON.stringify(t)}async get(t){const a=new AbortController;return Dt=[...Dt,a],this.axiosInstance.get(t,{signal:a.signal})}async post(t,a){const i=new AbortController;return Dt=[...Dt,i],this.axiosInstance.post(t,a,{signal:i.signal})}async abortAll(){Dt.forEach(t=>t.abort()),Dt=[]}async runAction(t,a,i,s,r,n,l,c,u,m,v){return a&&a.startsWith("/")&&(a=a.substring(1)),n={...mi(),...n},await this.wrap(this.post(t+"/mateu/v3/sync/"+(a&&a!=""?a:"_no_route"),{serverSideType:l,appState:n,componentState:c,parameters:u,initiatorComponentId:r,consumedRoute:i,route:a&&a!=""?"/"+a:"",actionId:s}).then(f=>f.data),m,v,s)}}const vi=new Bn;var jn=Object.defineProperty,Wn=Object.getOwnPropertyDescriptor,Tt=(e,t,a,i)=>{for(var s=i>1?void 0:i?Wn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&jn(t,a,s),s};let Re=class extends E{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.searchText=""}connectedCallback(){super.connectedCallback(),Un()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(mi()[this.selector.fieldName]??"")}currentLabel(){const e=this.currentValue();if(!e)return"—";const t=(this.searchedOptions??this.selector.options)?.find(i=>String(i.value)===e);if(t)return t.label;const a=vs()[this.selector.fieldName];return a!==void 0?String(a):e}pick(e,t){Mn(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText="",this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector("input.picker-search")?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){const e=this.app;if(e?.serverSideType)try{const t=await vi.runAction(this.baseUrl??"",e.rootRoute??e.initialRoute??"","",`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(const a of t?.fragments??[]){const r=a.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(r)){this.searchedOptions=r.map(n=>({value:n.value,label:n.label??String(n.value)}));return}}}catch{}}visibleOptions(){const e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(a=>a.label.toLowerCase().includes(t)):e}renderPanel(){const e=this.currentValue(),t=this.visibleOptions(),a=this.searchText!==""||t.length>Re.SEARCHABLE_THRESHOLD;return o`
            <div class="panel">
                ${a?o`
                    <input class="picker-search" type="text" placeholder="Search"
                           .value="${this.searchText}"
                           @input="${this.onSearchInput}"
                           @keydown="${i=>{i.key==="Escape"&&this.closePanel()}}"/>`:d}
                <div class="options">
                    ${e?o`
                        <div class="option option--clear" @click="${()=>this.pick("")}">— (clear)</div>`:d}
                    ${t.map(i=>o`
                        <div class="option ${e===String(i.value)?"option--selected":""}"
                             @click="${()=>this.pick(i.value,i.label)}">${i.label}</div>`)}
                </div>
            </div>`}render(){return this.selector?o`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                <button class="picker-button"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    ${this.currentLabel()} <span aria-hidden="true" class="caret">▾</span>
                </button>
                ${this.opened?this.renderPanel():d}
            </label>`:o``}};Re.SEARCHABLE_THRESHOLD=7;Re.styles=S`
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
    `;Tt([p()],Re.prototype,"selector",2);Tt([p()],Re.prototype,"app",2);Tt([p()],Re.prototype,"baseUrl",2);Tt([y()],Re.prototype,"opened",2);Tt([y()],Re.prototype,"searchText",2);Tt([y()],Re.prototype,"searchedOptions",2);Re=Tt([C("mateu-app-context-picker")],Re);const Gt=(e,t)=>{const a=e.contextSelectors??[];return a.length===0?d:o`${a.map(i=>o`
        <mateu-app-context-picker .selector="${i}" .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-app-context-picker>`)}`},va=(e,t)=>e.themeToggle?o`
        <vaadin-button theme="tertiary icon" @click="${t.toggleTheme}"
            title="${t.isDark?"Switch to light mode":"Switch to dark mode"}"
            style="margin-left: 0.5rem; margin-right: 0.5rem; flex-shrink: 0;">
            <vaadin-icon icon="${t.isDark?"vaadin:sun-o":"vaadin:moon"}" style="color: var(--lumo-body-text-color);"></vaadin-icon>
        </vaadin-button>
    `:d,Vn=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},Ti=(e,t,a)=>{const i=ke(e,t,a),s=W(t,a);return i=="list"||i==s?"new":i},ke=(e,t,a)=>{const i=e?._route;if(i!=null&&(i===""||i.startsWith("/"))){const s=a.homeRoute??"",r=s.indexOf("?"),n=r>=0?s.substring(r+1):"",l=W(t,a)+i;if(!n)return l;const c=l.indexOf("?")>=0?"&":"?";return l+c+n}return t.selectedRoute?t.selectedRoute:a.homeRoute},W=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,de=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:t.homeBaseUrl,ce=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,ue=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,Hn=(e,t,a,i,s,r,n)=>{const l=e.mapItems(t.menu,e.filter?.toLowerCase()??""),c=W(e,t),u=Ti(i,e,t),m=u&&u!=="new"&&u.startsWith(c+"/")?u.substring(c.length+1).split("/")[0]:void 0;return o`
                    ${t.variant==we.MEDIATOR?o`

                        ${t.layout=="SPLIT"?o`
                            <vaadin-master-detail-layout>
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${W(e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${de(e,t)}"
                                            consumedRoute="${W(e,t)}"
                                            serverSideType="${ce(e,t)}"
                                            uriPrefix="${ue(e,t)}"
                                            style="width: 100%;"
                                            .appState="${{...r,_splitDetailId:m}}"
                                            .appData="${n}"
                                            instant="${c}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>
                                <mateu-api-caller slot="detail">
                                    <div style="padding-left: 1rem; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${Ti(i,e,t)}"
                                            id="ux_${e.id}_detail"
                                            baseUrl="${de(e,t)}"
                                            consumedRoute="${W(e,t)}"
                                            serverSideType="${ce(e,t)}"
                                            uriPrefix="${ue(e,t)}"
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
                                        route="${ke(i,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${de(e,t)}"
                                        consumedRoute="${W(e,t)}"
                                        serverSideType="${ce(e,t)}"
                                        uriPrefix="${ue(e,t)}"
                                        style="width: 100%;"
                                        .appState="${r}"
                                        .appData="${n}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `}
                        
`:d}
            ${t.variant==we.HAMBURGUER_MENU?o`
                <vaadin-app-layout style="${t?.style}" class="${t?.cssClasses}" .drawerOpened=${!t.drawerClosed}>
                    <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                    <h2 slot="navbar" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2><p slot="navbar">${t.subtitle}</p>
                    <vaadin-horizontal-layout slot="navbar" style="margin-left: auto; align-items: center;">
                        <slot name="widgets"></slot>
                        ${Gt(t,e)}${va(t,e)}
                    </vaadin-horizontal-layout>
                    <vaadin-scroller slot="drawer" class="p-s"
                                     @navigation-requested="${e.updateRoute}">
                        ${t.menu&&t.totalMenuOptions>10?o`
                            <vaadin-text-field style="width: calc(100% - 20px); padding-left: 10px; padding-right: 10px;" @value-changed="${v=>Vn(v,e)}">
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
                                            route="${ke(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${de(e,t)}"
                                            consumedRoute="${W(e,t)}"
                                            serverSideType="${ce(e,t)}"
                                            uriPrefix="${ue(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-app-layout>

            `:d}
            
            ${t.variant==we.MENU_ON_TOP?o`
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
                            ${Gt(t,e)}${va(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${ke(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${de(e,t)}"
                                            consumedRoute="${W(e,t)}"
                                            serverSideType="${ce(e,t)}"
                                            uriPrefix="${ue(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-vertical-layout>

            `:d}

            ${t.variant==we.TILES?o`
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
                            ${Gt(t,e)}${va(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):o`
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${ke(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${de(e,t)}"
                                            consumedRoute="${W(e,t)}"
                                            serverSideType="${ce(e,t)}"
                                            uriPrefix="${ue(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                        `}
                    </div>
                </vaadin-vertical-layout>
            `:d}

            ${t.variant==we.RAIL?o`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):d}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${ke(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${de(e,t)}"
                                            consumedRoute="${W(e,t)}"
                                            serverSideType="${ce(e,t)}"
                                            uriPrefix="${ue(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </div>
            `:d}

            ${t.variant==we.MENU_ON_LEFT?o`

                <vaadin-horizontal-layout>
                    <vaadin-scroller style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <vaadin-vertical-layout
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(v=>e.renderOptionOnLeftMenu(v))}
                            ${Gt(t,e)}${va(t,e)}
                        </vaadin-vertical-layout>
                    </vaadin-scroller>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${ke(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${de(e,t)}"
                                            consumedRoute="${W(e,t)}"
                                            serverSideType="${ce(e,t)}"
                                            uriPrefix="${ue(e,t)}"
                                            style="width: 100%; padding: 1em;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-horizontal-layout>


            `:d}

            ${t.variant==we.TABS?o`
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
                                ${Gt(t,e)}
                            </vaadin-horizontal-layout>
                        </vaadin-horizontal-layout>
                    </div>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${ke(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${de(e,t)}"
                                            consumedRoute="${W(e,t)}"
                                            serverSideType="${ce(e,t)}"
                                            uriPrefix="${ue(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
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
       `},Gn=(e,t)=>t!=null&&e!=null&&!e.has(t),Kn=typeof HTMLElement<"u"?HTMLElement:class{};class Jn extends Kn{static get observedAttributes(){return["type","renderer"]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){const t=this.getAttribute("type")??"unknown",a=this.getAttribute("renderer")??"unknown";this.shadowRoot||this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
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
        `}}typeof customElements<"u"&&!customElements.get("mateu-unsupported")&&customElements.define("mateu-unsupported",Jn);const Pi=new Set,Yn=(e,t,a)=>{const i=`${a}/${t}`;return Pi.has(i)||(Pi.add(i),console.warn(`[mateu] Component type "${t}" is not supported by the "${a}" renderer — rendering <mateu-unsupported> placeholder.`)),o`<mateu-unsupported
            type="${t}"
            renderer="${a}"
            data-component-id="${e?.id??d}"
            slot="${e?.slot??d}"
    ></mateu-unsupported>`};class Xn{renderFilterBar(t,a,i,s,r,n,l,c){const u=a?.metadata,m=f=>{const{fieldId:b,value:x}=f.detail;t.state={...t.state,[b]:x}},v=f=>{const{fieldIds:b}=f.detail,x={};b.forEach(g=>{x[g]=void 0}),x.searchText=void 0,t.state={...t.state,...x}};return o`
            <mateu-filter-bar
                .metadata="${u}"
                @search-requested="${t.search}"
                @value-changed="${m}"
                @filter-reset-requested="${v}"
                .state="${t.state}"
                .data="${r}"
                .appState="${n}"
                .appData="${l}"
                ?searchOnly="${c??!1}"
            >
                ${u?.header?.map(f=>$(t,f,i,s,r,n,l))}
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
        `}renderTableComponent(t,a,i,s,r,n,l){return o`
        <mateu-table id="${t.id}"
                     .metadata="${a?.metadata}"
                     .data="${t.data}"
                     .state="${s}"
                     .appState="${n}"
                     .appData="${l}"
                     .emptyStateMessage="${s[a?.id]?.emptyStateMessage}"
                     @sort-direction-changed="${t.directionChanged}"
                     @fetch-more-elements="${t.fetchMoreElements}"
                     baseUrl="${i}"
        ></mateu-table>
        `}rendererName(){return this.constructor?.name??"unknown"}supportedClientSideTypes(){}renderClientSideComponent(t,a,i,s,r,n,l,c){const u=a?.metadata?.type??a?.type,m=Object.values(h).includes(u)?u:void 0;return Gn(this.supportedClientSideTypes(),m)?Yn(a,m,this.rendererName()):hi(t,a,i,s,r,n,l,c)}renderAppComponent(t,a,i,s,r,n,l){return Hn(t,a?.metadata,i,s,r,n,l)}}const Qn=76;function Oi(e){if(e.weight!=null)return e.weight;const t=e.stereotype??"";if(t==="icon")return 1;if(t==="image")return 4;if(t==="html"||t==="richText"||t==="markdown"||t==="textarea")return 5;if(t==="link")return 2.5;if(t==="combobox"||t==="select")return 2;const a=e.dataType??"";return a==="bool"?1:a==="status"||a==="integer"?1.5:a==="number"||a==="date"||a==="money"?2:a==="dateTime"||a==="dateRange"?2.5:3}function fs(e,t){if(e.length===0)return"table";const a=e.reduce((c,u)=>c+Oi(u),0),i=t/Qn,s=a/i;if(s<=1)return"table";const r=e.filter(c=>c.identifier||(c.priority??Number.MAX_SAFE_INTEGER)<=2),n=r.reduce((c,u)=>c+Oi(u),0);return s>1.6||e.length>10?"masterDetail":r.length>0&&n<=8?"list":e.some(c=>c.stereotype==="image"||c.stereotype==="html")||r.length===0&&e.length>=4&&e.length<=8?"cards":"masterDetail"}function Za(e){return e.filter(t=>t.identifier||(t.priority??Number.MAX_SAFE_INTEGER)<=2).sort((t,a)=>(t.priority??Number.MAX_SAFE_INTEGER)-(a.priority??Number.MAX_SAFE_INTEGER))}function Zn(e){const t=e.dataType??"",a=e.stereotype??"";let i;return a==="combobox"||a==="select"?i=2:t==="bool"?i=1:t==="status"||t==="integer"?i=1.5:t==="number"||t==="date"||t==="money"?i=2:t==="dateTime"?i=2.5:i=3,t==="dateRange"?2.5*1.5:a==="listBox"?i*1.5:i}function el(e){if(e.length===0)return"inline";const t=e.reduce((a,i)=>a+Zn(i),0);return t<=4?"inline":e.length>=6||t>8?"drawer":"popover"}const tl=e=>e===Ke.SUCCESS?"8":e===Ke.DANGER?"1":e===Ke.WARNING?"6":e===Ke.INFO?"4":"5",bs=e=>{if(!e)return o``;const t=e.message??String(e);return o`<ui5-tag color-scheme="${tl(e.type)}">${t}</ui5-tag>`},Ri=(e,t)=>{const a=e[t.id];return a==null?"":t.dataType==="bool"||typeof a=="boolean"?a?"✓":"✗":String(typeof a=="object"?a.message??a.label??a.text??a.value??"":a)},fi=(e,t,a)=>{const i=t.dataType??"",s=t.stereotype??"",r=e[t.id];if(i==="status")return bs(r);if(i==="bool")return r?o`<ui5-icon name="accept"></ui5-icon>`:o`<ui5-icon name="decline"></ui5-icon>`;if(i==="money"||s==="money")return r==null?o``:o`${new Intl.NumberFormat(void 0,{minimumFractionDigits:2}).format(Number(r))}`;if(i==="link"||s==="link"){const n=typeof r=="object"?r?.text??"":r??"",l=t.actionId;if(l)return o`<ui5-link @click="${u=>{u.preventDefault(),a(l,e)}}">${n}</ui5-link>`;const c=typeof r=="object"?r?.href??r?.url??"":"";return o`<a href="${c}">${n}</a>`}if(i==="icon"||s==="icon"){const n=Array.isArray(r)?r:r?String(r).split(","):[];return o`${n.map(l=>o`<ui5-icon name="${l.trim().replace(/^vaadin:|^lumo:/,"")}"></ui5-icon>`)}`}if(s==="html")return o`${pe(r??"")}`;if(s==="image"){const n=typeof r=="object"?r?.url??r?.src??"":r??"";return n?o`<img src="${n}" style="max-height: 3rem; object-fit: contain;" />`:o``}if(s==="button"){const n=t.text??t.label??"",l=t.actionId??t.id;return o`<ui5-button design="Transparent"
            @click="${c=>{c.stopPropagation(),a(l,e)}}"
        >${n}</ui5-button>`}if(i==="action"){const n=typeof r=="object"?r?.text??r?.label??"":"",l=typeof r=="object"?r?.methodNameInCrud??r?.actionId??r?.id??t.id:t.actionId??t.id;return o`<ui5-button design="Transparent"
            @click="${c=>{c.stopPropagation(),a(l,e)}}"
        >${n}</ui5-button>`}if(i==="actionGroup"||i==="menu"){const n=typeof r=="object"&&r?.actions?r.actions:Array.isArray(r)?r:[];return o`${n.map(l=>{const c=l.methodNameInCrud??l.actionId??l.id??"";return o`<ui5-button design="Transparent"
                @click="${u=>{u.stopPropagation(),a(c,e)}}"
            >${l.label??l.text??c}</ui5-button>`})}`}return o`${r??""}`};var al=Object.defineProperty,il=Object.getOwnPropertyDescriptor,$e=(e,t,a,i)=>{for(var s=i>1?void 0:i?il(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&al(t,a,s),s};let se=class extends E{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.sortField="",this.sortDirection="None",this.availableWidthPx=1024,this.selectedItem=null}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}get cols(){return this.metadata?.columns?.map(e=>e.metadata)??[]}get effectiveGridLayout(){const e=this.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":fs(this.cols,this.availableWidthPx):t}getRows(){return this.data[this.id]?.page?.content??[]}toggleSort(e){this.sortField!==e?(this.sortField=e,this.sortDirection="Ascending"):this.sortDirection==="Ascending"?this.sortDirection="Descending":(this.sortDirection="None",this.sortField=""),this.dispatchEvent(new CustomEvent("sort-changed",{detail:{sorts:this.sortField?[{fieldId:this.sortField,direction:this.sortDirection==="Ascending"?"ascending":"descending"}]:[]},bubbles:!0,composed:!0}))}dispatchAction(e,t){this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}renderCellValue(e,t){return fi(e,t,(a,i)=>this.dispatchAction(a,i))}renderTable(e){const t=this.getRows();return o`
            <ui5-table
                no-data-text="${this.emptyStateMessage??this.metadata?.emptyStateMessage??"No data."}"
                overflow-mode="Popin"
                style="width: 100%;"
            >
                ${this.metadata?.rowsSelectionEnabled?o`
                    <ui5-table-selection mode="Multiple" slot="features"></ui5-table-selection>
                `:d}

                <ui5-table-header-row slot="headerRow">
                    ${e.map(a=>o`
                        <ui5-table-header-cell
                            width="${a.width??d}"
                            sort-indicator="${a.sortable&&this.sortField===a.id?this.sortDirection:a.sortable?"None":d}"
                            @click="${a.sortable?()=>this.toggleSort(a.id):d}"
                            style="${a.sortable?"cursor: pointer;":d}"
                        >${a.label}</ui5-table-header-cell>
                    `)}
                </ui5-table-header-row>

                ${t.map((a,i)=>o`
                    <ui5-table-row row-key="${a._rowNumber??i}">
                        ${e.map(s=>o`
                            <ui5-table-cell>${this.renderCellValue(a,s)}</ui5-table-cell>
                        `)}
                    </ui5-table-row>
                `)}
            </ui5-table>`}renderTwoLineList(e){const t=this.getRows(),a=Za(e),i=a.find(r=>r.identifier)??a[0],s=a.filter(r=>r!==i);return o`
            <ui5-list no-data-text="${this.emptyStateMessage??"No data."}" style="width: 100%;">
                ${t.map(r=>o`
                    <ui5-li
                        description="${s.map(n=>`${n.label}: ${Ri(r,n)}`).join(" · ")}"
                        @click="${()=>this.dispatchAction("_rowClick",r)}"
                        style="cursor: pointer;"
                    >
                        ${i?this.renderCellValue(r,i):o`${r._rowNumber}`}
                    </ui5-li>
                `)}
            </ui5-list>`}renderCards(e){const t=this.getRows(),a=e.slice(0,6),i=a.filter(n=>n.stereotype==="image"),s=a.find(n=>n.identifier)??a[0],r=a.filter(n=>n!==s&&!i.includes(n));return o`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; padding: 0.5rem 0;">
                ${t.map(n=>o`
                    <ui5-card style="cursor: pointer;" @click="${()=>this.dispatchAction("_rowClick",n)}">
                        ${i.length?o`
                            <div slot="header" style="padding: 0.5rem;">
                                ${this.renderCellValue(n,i[0])}
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
            </div>`}renderMasterDetail(e){const t=this.getRows(),a=Za(e),i=a.find(s=>s.identifier)??a[0];return o`
            <div style="display: flex; gap: 0; height: 100%; min-height: 400px; border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; overflow: hidden;">
                <!-- Left: compact row list -->
                <div style="width: 280px; flex-shrink: 0; border-right: 1px solid var(--sapNeutralBorderColor, #e5e5e5); overflow-y: auto;">
                    <ui5-list no-data-text="${this.emptyStateMessage??"No data."}" style="width: 100%;">
                        ${t.map(s=>o`
                            <ui5-li
                                description="${a.filter(r=>r!==i).map(r=>`${r.label}: ${Ri(s,r)}`).join(" · ")}"
                                ?selected="${this.selectedItem===s}"
                                @click="${()=>{this.selectedItem=s}}"
                                style="cursor: pointer;"
                            >
                                ${i?this.renderCellValue(s,i):o`${s._rowNumber}`}
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
            </div>`}renderTree(e){const t=this.getRows(),a=e.find(l=>l.dataType!=="action"&&l.dataType!=="actionGroup"&&l.dataType!=="menu")??e[0],i=e.filter(l=>l!==a),s=l=>String(l[a?.id??""]??""),r=l=>i.map(c=>l[c.id]!=null?`${c.label}: ${l[c.id]}`:"").filter(c=>c).join(" · "),n=l=>o`
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
            </ui5-tree>`}render(){const e=this.cols,t=this.effectiveGridLayout;return t==="list"?this.renderTwoLineList(e):t==="cards"?this.renderCards(e):t==="masterDetail"?this.renderMasterDetail(e):t==="tree"?this.renderTree(e):this.renderTable(e)}};$e([p()],se.prototype,"id",2);$e([p()],se.prototype,"metadata",2);$e([p()],se.prototype,"baseUrl",2);$e([p()],se.prototype,"state",2);$e([p()],se.prototype,"data",2);$e([p()],se.prototype,"appState",2);$e([p()],se.prototype,"appData",2);$e([p()],se.prototype,"emptyStateMessage",2);$e([y()],se.prototype,"sortField",2);$e([y()],se.prototype,"sortDirection",2);$e([y()],se.prototype,"availableWidthPx",2);$e([y()],se.prototype,"selectedItem",2);se=$e([C("mateu-sapui5-table")],se);var sl=Object.defineProperty,rl=Object.getOwnPropertyDescriptor,mt=(e,t,a,i)=>{for(var s=i>1?void 0:i?rl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&sl(t,a,s),s};let Xe=class extends E{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.filtersOpen=!1,this.handleKey=e=>{e.code==="Enter"&&(this.filtersOpen=!1,this.triggerSearch())}}createRenderRoot(){return this}get effectiveFiltersLayout(){const e=this.metadata?.filtersLayout??"auto";return e==="auto"?el(this.metadata?.filters??[]):e}connectedCallback(){super.connectedCallback(),this.metadata?.searchOnEnter&&this.addEventListener("keydown",this.handleKey)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("keydown",this.handleKey)}triggerSearch(){this.dispatchEvent(new CustomEvent("search-requested",{bubbles:!0,composed:!0,detail:{}}))}clearFilters(){const e={};this.metadata?.filters?.forEach(t=>{e[t.fieldId??t.id]=void 0}),e.searchText=void 0,this.state={...this.state,...e},this.metadata?.filters?.forEach(t=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:t.fieldId??t.id},bubbles:!0,composed:!0}))}),this.triggerSearch()}clearSingleFilter(e){this.state={...this.state,[e]:void 0},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:e},bubbles:!0,composed:!0})),this.triggerSearch()}getFilterDisplayValue(e,t){if(e.options?.length){const a=e.options.find(i=>i.value===String(t));if(a)return a.label}return typeof t=="boolean"?t?"Yes":"No":String(t)}renderActiveFilterChips(){const e=(this.metadata?.filters??[]).map(t=>t).filter(t=>{const a=this.state[t.fieldId];return a!=null&&a!==""});return e.length===0?d:o`
            <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; padding: 0.25rem 0;">
                ${e.map(t=>o`
                    <ui5-token
                        text="${t.label}: ${this.getFilterDisplayValue(t,this.state[t.fieldId])}"
                        @ui5-delete="${()=>this.clearSingleFilter(t.fieldId)}"
                    ></ui5-token>
                `)}
            </div>`}wrapFilter(e){return{id:e.fieldId??"",metadata:{...e},type:U.ClientSide,style:"",children:[],slot:"",cssClasses:"",initialData:{}}}renderFilterControls(){return o`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; padding: 0.75rem 0;">
                ${this.metadata?.filters?.map(e=>$(this,this.wrapFilter(e),this.baseUrl,this.state,this.data,this.appState,this.appData))}
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end; padding-bottom: 0.5rem;">
                <ui5-button @click="${()=>{this.filtersOpen=!1,this.clearFilters()}}">Clear</ui5-button>
                <ui5-button design="Emphasized" @click="${()=>{this.filtersOpen=!1,this.triggerSearch()}}">Search</ui5-button>
            </div>`}renderInlineFilters(){return o`
            ${this.metadata?.filters?.map(e=>$(this,this.wrapFilter(e),this.baseUrl,this.state,this.data,this.appState,this.appData))}`}renderDrawer(){return o`
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
                        @input="${a=>{this.state.searchText=a.target.value}}"
                        @keydown="${a=>{a.code==="Enter"&&this.triggerSearch()}}"
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
        `}};mt([p()],Xe.prototype,"metadata",2);mt([p()],Xe.prototype,"baseUrl",2);mt([p()],Xe.prototype,"state",2);mt([p()],Xe.prototype,"data",2);mt([p()],Xe.prototype,"appState",2);mt([p()],Xe.prototype,"appData",2);mt([y()],Xe.prototype,"filtersOpen",2);Xe=mt([C("mateu-sapui5-filter-bar")],Xe);var ol=Object.defineProperty,nl=Object.getOwnPropertyDescriptor,oa=(e,t,a,i)=>{for(var s=i>1?void 0:i?nl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&ol(t,a,s),s};let Nt=class extends E{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.pages=[]}createRenderRoot(){return this}updated(e){if(super.updated(e),e.has("totalElements")||e.has("pageNumber")||e.has("pageSize")){const t=[],i=Math.ceil(this.totalElements/this.pageSize)-1;this.totalElements>0&&(this.pageNumber>0&&t.push({pageNumber:0,text:"«",clickable:!0}),this.pageNumber>1&&t.push({pageNumber:this.pageNumber-1,text:"‹",clickable:!0}),t.push({pageNumber:this.pageNumber,text:`${this.pageNumber+1}`,clickable:!1}),this.pageNumber<i-1&&t.push({pageNumber:this.pageNumber+1,text:"›",clickable:!0}),this.pageNumber<i&&t.push({pageNumber:i,text:"»",clickable:!0})),this.pages=t}}goToPage(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){return this.totalElements?o`
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
        `:o``}};oa([p({type:Number})],Nt.prototype,"totalElements",2);oa([p({type:Number})],Nt.prototype,"pageSize",2);oa([p({type:Number})],Nt.prototype,"pageNumber",2);oa([y()],Nt.prototype,"pages",2);Nt=oa([C("mateu-sapui5-pagination")],Nt);const ll=(e,t,a,i)=>{const s=e.metadata;return o`<ui5-button
                    part="button"
                    @click=${uu}
                    data-action-id="${s.actionId}"
                    slot="${e.slot}"
            >${s.label}</ui5-button>`},dl=e=>{const t=e.target,a=e.detail?.selectedOption,i=a?.value??a?.textContent?.trim()??"";t.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:t.id},bubbles:!0,composed:!0}))},cl=e=>{const t=e.target,i=(e.detail?.items??[]).map(s=>s.dataset?.value??s.text);t.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:t.id},bubbles:!0,composed:!0}))},ve=(e,t,a)=>{e?.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:t},bubbles:!0,composed:!0}))},ei=(e,t,a)=>{e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:a},bubbles:!0,composed:!0}))},Da=e=>(e??"").replace(/^vaadin:/,"").replace(/^lumo:/,""),T=(e,t,a,i,s,r="")=>o`
    <div style="${r}${e.style??""}" data-field-id="${t.fieldId??d}">
        ${i?o`<ui5-label for="${a}" show-colon ?required="${t.required}">${i}</ui5-label>`:d}
        ${s}
        ${t.description?o`
            <div style="font-size: 0.75rem; color: var(--sapContent_LabelColor, #6a6d70); margin-top: 0.125rem;">${t.description}</div>
        `:d}
    </div>`,Ia=(e,t)=>{const a=e!=null?String(e):"";return!t||a.length<=15?d:o`<ui5-icon
        slot="icon"
        name="copy"
        style="cursor: pointer;"
        @click="${()=>navigator.clipboard.writeText(a).catch(()=>{})}"
    ></ui5-icon>`},gs=(e,t)=>{const a=typeof e=="number"?e:parseFloat(String(e));return isNaN(a)?String(e):t&&t.locale&&t.currency?new Intl.NumberFormat(t.locale,{style:"currency",currency:t.currency}).format(a):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(a)},Li=new WeakMap,$s=(e,t,a,i,s)=>{const r=s?.[a]??s?.[i],n=r?.content??(Array.isArray(r)?r:void 0);if(n)return n;const l=t.remoteCoordinates?.action;if(l){let c=Li.get(e);c||(c=new Set,Li.set(e,c)),c.has(i)||(c.add(i),setTimeout(()=>ei(e,l,{searchText:"",fieldId:i,size:200,page:0,sort:void 0})))}return[]},Ue=(e,t,a,i,s)=>t.remoteCoordinates?$s(e,t,a,i,s):t.options??[],zi=(e,t,a,i)=>o`
    <ui5-select
        id="${t}"
        ?disabled="${e.disabled}"
        @change="${dl}"
        style="width: 100%;"
    >
        ${e.required?d:o`<ui5-option value="">-- Select --</ui5-option>`}
        ${i.map(s=>o`
            <ui5-option value="${s.value}" ?selected="${a===s.value}">${s.label}</ui5-option>
        `)}
    </ui5-select>`,Di=(e,t,a,i)=>{const s=i.find(r=>r.value===a);return o`
        <ui5-combobox
            id="${t}"
            value="${s?.label??a??""}"
            ?disabled="${e.disabled}"
            ?readonly="${e.readOnly}"
            @selection-change="${r=>{const n=r.detail?.item;ve(r.target,e.fieldId,n?.dataset?.value??n?.text)}}"
            style="width: 100%;"
        >
            ${i.map(r=>o`
                <ui5-cb-item text="${r.label??r}" data-value="${r.value??r}"></ui5-cb-item>
            `)}
        </ui5-combobox>`},ul=(e,t,a)=>o`
    <div style="display: flex; flex-wrap: wrap; gap: 0.25rem 1rem;">
        ${a.map(i=>o`
            <div style="display: flex; align-items: center; gap: 0.25rem;">
                ${i.icon?o`<ui5-icon name="${Da(i.icon)}"></ui5-icon>`:d}
                ${i.image?o`<img src="${i.image}" alt="${i.label}" style="height: 1rem;" />`:d}
                <ui5-radio-button
                    name="rg-${e.fieldId}"
                    text="${i.label}"
                    ?checked="${t===i.value}"
                    ?disabled="${e.disabled}"
                    @change="${s=>{s.target.checked&&ve(s.target,e.fieldId,i.value)}}"
                ></ui5-radio-button>
                ${i.description?o`<span style="font-size: 0.8125rem; color: var(--sapContent_LabelColor, #6a6d70);">${i.description}</span>`:d}
            </div>
        `)}
    </div>`,hl=(e,t)=>a=>{const s=(a.detail?.selectedItems??[]).map(r=>r.dataset?.value);ve(a.target,e,t?s:s[0])},ys=(e,t,a,i)=>{const s=r=>i?Array.isArray(t)&&t.includes(r.value):t===r.value;return o`
        <ui5-list
            selection-mode="${i?"Multiple":"Single"}"
            @selection-change="${hl(e.fieldId,i)}"
            style="width: 100%; border: 1px solid var(--sapField_BorderColor, #89919a); border-radius: 0.25rem;"
        >
            ${a.map(r=>o`
                <ui5-li
                    data-value="${r.value}"
                    ?selected="${s(r)}"
                    description="${r.description??d}"
                    icon="${r.icon?Da(r.icon):d}"
                >${r.label}</ui5-li>
            `)}
        </ui5-list>`},ti=(e,t,a,i)=>o`
    <div style="display: flex; gap: 0.75rem; padding: 0.25rem 0; flex-wrap: wrap;">
        ${a.map(s=>{const r=i?Array.isArray(t)&&t.includes(s.value):t==s.value,n=()=>{if(!i)return s.value;const l=Array.isArray(t)?t:[];return l.includes(s.value)?l.filter(c=>c!==s.value):[...l,s.value]};return o`
                <div role="button" tabindex="0"
                     style="min-width: 10rem; min-height: 3rem; padding: 0.75rem 1rem; cursor: pointer; border-radius: 0.5rem; border: 1px solid ${r?"var(--sapButton_Selected_BorderColor, #0064d9)":"var(--sapNeutralBorderColor, #e5e5e5)"}; background: ${r?"var(--sapList_SelectionBackgroundColor, #e5f0fa)":"transparent"};"
                     @click="${l=>ve(l.target,e.fieldId,n())}"
                >
                    <div style="display: flex; align-items: center; gap: 0.5rem; pointer-events: none;">
                        ${s.icon?o`<ui5-icon name="${Da(s.icon)}"></ui5-icon>`:d}
                        ${s.image?o`<img src="${s.image}" alt="${s.label}" style="${s.imageStyle??"width: 2rem;"}" />`:d}
                        <div>
                            <div>${s.label}</div>
                            ${s.description?o`
                                <div style="font-size: 0.8125rem; color: var(--sapContent_LabelColor, #6a6d70);">${s.description}</div>
                            `:d}
                        </div>
                    </div>
                </div>`})}
    </div>`,pl=(e,t,a)=>{const i=(e.optionsColumns??0)>1,s=r=>n=>{const l=Array.isArray(t)?t:[],u=n.target.checked?[...l.filter(m=>m!==r),r]:l.filter(m=>m!==r);ve(n.target,e.fieldId,u)};return o`
        <div style="display: ${i?"grid; grid-template-columns: repeat(3, 1fr); gap: 0.25rem 2rem":"flex; flex-direction: column"};">
            ${a.map(r=>o`
                <ui5-checkbox
                    text="${r.label}"
                    ?checked="${Array.isArray(t)&&t.includes(r.value)}"
                    ?disabled="${e.disabled}"
                    ?readonly="${e.readOnly}"
                    @change="${s(r.value)}"
                ></ui5-checkbox>
            `)}
        </div>`},ml=(e,t,a)=>{let i=e;return isNaN(i)&&(i=0),o`<div style="display: flex; align-items: center; gap: 0.25rem;">
        ${[1,2,3,4,5].map(r=>o`
            <ui5-icon
                name="${r<=i?"favorite":"unfavorite"}"
                style="cursor: ${a?"default":"pointer"}; color: ${r<=i?"var(--sapIndicationColor_5)":"var(--sapContent_NonInteractiveIconColor)"}; font-size: 1.5rem;"
                @click="${a?d:n=>ve(n.target,t,r)}"
            ></ui5-icon>
        `)}
    </div>`},vl=e=>t=>{const a=t.target,i=a.files?.[0];if(!i)return;const s=new FileReader;s.onload=()=>ve(a,e,s.result),s.readAsDataURL(i),a.value=""},fl=e=>t=>{t.target.getRootNode().querySelector(`#${CSS.escape(e)}`)?.click()},bl=(e,t,a)=>{const i=a!=null&&a!=="",s=`${t}_file`;return o`
        <div style="display: flex; flex-direction: column; align-items: stretch; gap: 0.5rem; max-width: 320px;">
            ${i?o`
                <img src="${a}"
                     style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; ${e.style??""}">
            `:o`
                <div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--sapNeutralBorderColor, #b3b3b3); border-radius: 0.5rem; color: var(--sapContent_LabelColor, #6a6d70);">
                    <ui5-icon name="picture" style="height: 2rem; width: 2rem;"></ui5-icon>
                </div>
            `}
            <input type="file" id="${s}" accept="image/*" style="display: none;" @change="${vl(e.fieldId)}">
            <div style="display: flex; gap: 0.5rem;">
                <ui5-button icon="upload" @click="${fl(s)}">${i?"Replace":"Upload"}</ui5-button>
                ${i?o`
                    <ui5-button design="Transparent" icon="delete"
                        @click="${r=>ve(r.target,e.fieldId,"")}"
                    >Delete</ui5-button>`:d}
            </div>
        </div>`},gl=(e,t)=>{const a=Array.isArray(t)?t:[],i=e.columns.map(n=>n.metadata),s={},r=(n,l)=>s.el?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:n,parameters:{_clickedRow:l}},bubbles:!0,composed:!0}));return o`
        <div style="overflow-x: auto;">
        <ui5-table style="width: 100%; min-width: ${Math.max(i.length*7,24)}rem; margin-top: 0.5rem;" ${Rs(n=>{s.el=n})}>
            <ui5-table-header-row slot="headerRow">
                ${i.map(n=>o`
                    <ui5-table-header-cell width="${n.width??d}">${n.label}</ui5-table-header-cell>
                `)}
            </ui5-table-header-row>
            ${a.map((n,l)=>o`
                <ui5-table-row row-key="${n._rowNumber??l}">
                    ${i.map(c=>o`
                        <ui5-table-cell>${fi(n,c,r)}</ui5-table-cell>
                    `)}
                </ui5-table-row>
            `)}
        </ui5-table>
        </div>`},$l=(e,t,a)=>{const i=t===!0||t==="true";return o`
        <div style="${e.style??d}">
            <ui5-tag color-scheme="${i?"8":d}" style="${i?"":"opacity: 0.4;"}">${a}</ui5-tag>
        </div>`},yl=(e,t,a,i,s,r,n)=>{let l=Be(i,r,n);const c=l&&typeof l=="object"&&"value"in l?l:null;l&&l.value&&(l=l.value);const u=t.dataType=="bool"||l===!0||l===!1,m=t.dataType=="money",v=l!=null&&l!=="";let f=v?String(l):"—";m&&v&&(f=gs(l,c));const b=u?o`<ui5-icon name="${l===!0||l==="true"?"accept":"less"}" style="height: 16px; width: 16px;"></ui5-icon>`:t.multiline?o`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${f}</span>`:o`<span style="display: block; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${m?" font-variant-numeric: tabular-nums;":""}">${f}</span>`;return T(e,t,a,s,b,m?"text-align: right; ":"")},xl=(e,t,a,i,s,r,n)=>{let l=Be(i,r,n)||n?.[t.fieldId];return l&&l.value&&(l=l.value),t.stereotype=="image"||t.stereotype=="uploadableImage"?T(e,t,a,s,o`<img src="${l}" id="${a}_img" style="${t.style??d}">`):t.dataType=="bool"?T(e,t,a,s,o`<ui5-icon name="${l?"accept":"less"}" style="height: 20px;"></ui5-icon>`):t.stereotype=="link"?T(e,t,a,s,o`<ui5-link href="${l??""}" target="_blank">${l??""}</ui5-link>`):t.stereotype=="color"?T(e,t,a,s,o`<span style="background-color: ${l}; display: block; height: 20px; width: 40px; border: 1px solid var(--sapContent_LabelColor, #6a6d70); border-radius: 0.25rem;"></span>`):T(e,t,a,s,o`
        <ui5-input
            id="${a}"
            readonly
            value="${l??""}"
            style="width: 100%;"
        >${Ia(l,!0)}</ui5-input>`)},wl=(e,t,a,i,s,r,n)=>{const l=a.fieldId??"";if(a.stereotype=="searchable"){const u=v=>ei(v.currentTarget,"code-"+l,{code:v.currentTarget.value}),m=v=>ei(v.currentTarget,"codesearch-"+l,{});return T(t,a,i,r,o`
            <div style="display: flex; gap: 0.33rem; align-items: center;">
                <ui5-input style="width: 5rem;" value="${s??""}" @change="${u}"></ui5-input>
                <ui5-input readonly value="${n?.[l+"-label"]??""}" style="flex: 1;"></ui5-input>
                <ui5-button icon="search" @click="${m}"></ui5-button>
            </div>`)}if(a.stereotype=="select"){const u=s&&s.value?s.value:s;return T(t,a,i,r,zi(a,i,u,Ue(e,a,i,l,n)))}if(a.stereotype=="markdown")return T(t,a,i,r,o`
            <mateu-markdown .content="${s??""}"></mateu-markdown>`);if(a.stereotype=="combobox")return T(t,a,i,r,Di(a,i,s,Ue(e,a,i,l,n)));if(a.stereotype=="listBox")return T(t,a,i,r,ys(a,s,Ue(e,a,i,l,n),!1));if(a.stereotype=="radio")return T(t,a,i,r,ul(a,s,Ue(e,a,i,l,n)));if(a.stereotype=="popover"){const u=Ue(e,a,i,l,n),m=`${i}_popover`,v=b=>{const g=b.target.getRootNode().querySelector(`#${CSS.escape(m)}`);g&&(g.opener=b.currentTarget,g.open=!g.open)},f=u.find(b=>b.value===s)?.label??s??"";return T(t,a,i,r,o`
            <div style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;" @click="${v}">
                <span>${f}</span>
                <ui5-icon name="slim-arrow-down"></ui5-icon>
            </div>
            <ui5-popover id="${m}" placement="Bottom">
                ${ti(a,s,u,!1)}
            </ui5-popover>`)}if(a.stereotype=="choice")return T(t,a,i,r,ti(a,s,Ue(e,a,i,l,n),!1));if(a.stereotype=="richText"||a.stereotype=="richtext")return T(t,a,i,r,o`
            <ui5-textarea
                id="${i}"
                ?disabled="${a.disabled}"
                ?readonly="${a.readOnly}"
                @change="${he}"
                value="${s??""}"
                growing
                growing-max-lines="10"
                style="width: 100%;"
            ></ui5-textarea>`);if(a.stereotype=="textarea")return T(t,a,i,r,o`
            <ui5-textarea
                id="${i}"
                ?disabled="${a.disabled}"
                ?readonly="${a.readOnly}"
                @change="${he}"
                value="${s??""}"
                maxlength="${a.charLimit??d}"
                growing
                growing-max-lines="5"
                style="width: 100%;"
            ></ui5-textarea>`);if(a.stereotype=="link")return T(t,a,i,r,o`
            <ui5-input
                id="${i}"
                ?disabled="${a.disabled}"
                value="${s??""}"
                @change="${he}"
                style="width: 100%;"
            ><ui5-icon
                slot="icon"
                name="chain-link"
                style="cursor: pointer;"
                @click="${()=>s&&window.open(s,"_blank")?.focus()}"
            ></ui5-icon></ui5-input>`);if(a.stereotype=="icon")return T(t,a,i,r,o`
            <ui5-input
                id="${i}"
                ?disabled="${a.disabled}"
                value="${s??""}"
                @change="${he}"
                style="width: 100%;"
            >${s?o`<ui5-icon slot="icon" name="${Da(s)}"></ui5-icon>`:d}</ui5-input>`);if(a.stereotype=="html")return T(t,a,i,r,o`
            <div style="line-height: 20px; margin-top: 5px;">${pe(""+(s??""))}</div>`);if(a.stereotype=="image")return T(t,a,i,r,o`
            <img src="${s??""}" style="${t.style??d}" class="${t.cssClasses??d}">`);if(a.stereotype=="uploadableImage")return T(t,a,i,r,bl(a,i,s));if(a.stereotype=="color")return T(t,a,i,r,o`
            <input type="color" value="${s??"#000000"}" ?disabled="${a.disabled}"
                   style="display: block; height: 2rem; width: 4rem; border: 1px solid var(--sapField_BorderColor, #89919a); border-radius: 0.25rem; background: transparent; cursor: pointer;"
                   @input="${u=>ve(u.target,l,u.target.value)}"/>`);if(a.options&&a.options.length>0)return T(t,a,i,r,zi(a,i,s,a.options));if(a.remoteCoordinates)return T(t,a,i,r,Di(a,i,s,$s(e,a,i,l,n)));const c=(()=>{switch(a.stereotype){case"email":return"Email";case"password":return"Password";case"url":return"URL";case"phone":case"tel":return"Tel";case"search":return"Search";default:return"Text"}})();return T(t,a,i,r,o`
        <ui5-input
            id="${i}"
            type="${c}"
            ?disabled="${a.disabled}"
            ?readonly="${a.readOnly}"
            value="${s??""}"
            @change="${he}"
            maxlength="${a.charLimit??d}"
            placeholder="${a.placeholder??d}"
            style="width: 100%;"
        >${Ia(s,a.readOnly)}</ui5-input>`)},kl=(e,t,a,i,s)=>{const r=t.metadata,n=r?.fieldId??"",l=i&&n in i?i[n]:r?.initialValue,c=t.id||n,u=r.label+"",m=Ce(u,i,s),v=!m||m=="null"||m=="undefined"?void 0:m,f=r.dataType,b=r.stereotype;if(b=="badge")return $l(t,l,v??r.fieldId??"");if(b=="plainText")return yl(t,r,c,l,v,i,s);if(r.readOnly&&b!="grid"&&f!="status"&&f!="money")return xl(t,r,c,l,v,i,s);if(b=="grid"&&r.columns&&r.columns.length>0)return T(t,r,c,v,gl(r,l));if(f=="file"||b=="file")return T(t,r,c,v,o`
            <ui5-file-uploader id="${c}" ?disabled="${r.disabled}" @change="${he}">
                <ui5-button icon="upload">Upload</ui5-button>
            </ui5-file-uploader>`);if(f=="dateRange"){const x=l?`${l.from} - ${l.to}`:"";return T(t,r,c,v,o`
            <ui5-daterange-picker
                id="${c}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                format-pattern="yyyy-MM-dd"
                value="${x}"
                @change="${g=>{const _=g.target,P=V=>V?`${V.getFullYear()}-${String(V.getMonth()+1).padStart(2,"0")}-${String(V.getDate()).padStart(2,"0")}`:void 0,D=P(_.startDateValue),J=P(_.endDateValue);ve(g.target,n,D&&J?{from:D,to:J}:void 0)}}"
                style="width: 100%;"
            ></ui5-daterange-picker>`)}if(f=="date"||f=="LocalDate")return T(t,r,c,v,o`
            <ui5-date-picker
                id="${c}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                format-pattern="yyyy-MM-dd"
                value="${l??""}"
                @change="${he}"
                style="width: 100%;"
            ></ui5-date-picker>`);if(f=="dateTime"||f=="datetime"||f=="LocalDateTime"||f=="ZonedDateTime")return T(t,r,c,v,o`
            <ui5-datetime-picker
                id="${c}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                value="${l??""}"
                @change="${he}"
                style="width: 100%;"
            ></ui5-datetime-picker>`);if(f=="time"||f=="LocalTime")return T(t,r,c,v,o`
            <ui5-time-picker
                id="${c}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                value="${l??""}"
                @change="${he}"
                style="width: 100%;"
            ></ui5-time-picker>`);if(f=="number"||b=="currency")return T(t,r,c,v,o`
            <ui5-input
                id="${c}"
                type="Number"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                value="${l??""}"
                @change="${he}"
                style="width: 100%;"
            >${Ia(l,r.readOnly)}</ui5-input>`);if(f=="integer")return b=="stars"?T(t,r,c,v,ml(l,n,r.disabled)):b=="slider"?T(t,r,c,v,o`
                <ui5-slider
                    id="${c}"
                    min="${r.sliderMin??0}"
                    max="${r.sliderMax??100}"
                    step="${r.step??1}"
                    value="${l??0}"
                    ?disabled="${r.disabled}"
                    show-tooltip
                    @change="${he}"
                    style="width: 100%;"
                ></ui5-slider>`):r.stepButtonsVisible?T(t,r,c,v,o`
                <ui5-step-input
                    id="${c}"
                    ?disabled="${r.disabled}"
                    ?readonly="${r.readOnly}"
                    value="${l??0}"
                    min="${r.min??d}"
                    max="${r.max??d}"
                    step="${r.step??d}"
                    @change="${he}"
                    style="width: 100%;"
                ></ui5-step-input>`):T(t,r,c,v,o`
            <ui5-input
                id="${c}"
                type="Number"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                value="${l??""}"
                @change="${he}"
                style="width: 100%;"
            >${Ia(l,r.readOnly)}</ui5-input>`);if(f=="bool"||f=="boolean"||f=="Boolean")return b=="toggle"?o`
                <div style="display: flex; align-items: center; gap: 0.5rem; ${t.style??""}">
                    <ui5-label for="${c}" ?required="${r.required}">${v}</ui5-label>
                    <ui5-switch
                        id="${c}"
                        ?checked="${l}"
                        ?disabled="${r.disabled}"
                        @change="${Wi}"
                    ></ui5-switch>
                </div>`:o`
            <div style="${t.style??d}">
                <ui5-checkbox
                    id="${c}"
                    text="${v??""}"
                    ?checked="${l}"
                    ?disabled="${r.disabled}"
                    ?readonly="${r.readOnly}"
                    @change="${Wi}"
                ></ui5-checkbox>
            </div>`;if(f=="array"){if(b=="choice")return T(t,r,c,v,ti(r,l,Ue(e,r,c,n,s),!0));if(b=="listBox")return T(t,r,c,v,ys(r,l,Ue(e,r,c,n,s),!0));if(b=="combobox"){const x=Ue(e,r,c,n,s),g=Array.isArray(l)?l:[];return T(t,r,c,v,o`
                <ui5-multi-combobox
                    id="${c}"
                    ?disabled="${r.disabled}"
                    ?readonly="${r.readOnly}"
                    @selection-change="${cl}"
                    style="width: 100%;"
                >
                    ${x.map(_=>o`
                        <ui5-mcb-item
                            text="${_.label??_}"
                            data-value="${_.value??_}"
                            ?selected="${g.includes(_.value??_)}"
                        ></ui5-mcb-item>
                    `)}
                </ui5-multi-combobox>`)}return T(t,r,c,v,pl(r,l,Ue(e,r,c,n,s)))}if(f=="money"||b=="money"){if(r.readOnly){const P=l&&typeof l=="object"&&"value"in l?l:null,D=P?P.value:l;return T(t,r,c,v,o`
                <div style="min-width: 8rem; text-align: right; font-variant-numeric: tabular-nums;">${l!=null?gs(D,P):""}</div>`)}const x=l&&typeof l=="object"&&"value"in l?l:{value:typeof l=="number"?l:parseFloat(String(l??0))||0,currency:"EUR",locale:"es-ES"},g=P=>{const D=P.detail?.selectedOption;ve(P.target,n,{...x,currency:D?.value??D?.textContent?.trim()??x.currency})},_=P=>{const D=P.target.value;ve(P.target,n,{...x,value:D?parseFloat(D):0})};return T(t,r,c,v,o`
            <div style="display: flex; gap: 0.25rem;">
                <ui5-select style="width: 6rem;" ?disabled="${r.disabled}" @change="${g}">
                    ${["EUR","USD","GBP"].map(P=>o`
                        <ui5-option value="${P}" ?selected="${x.currency===P}">${P}</ui5-option>
                    `)}
                </ui5-select>
                <ui5-input
                    id="${c}"
                    type="Number"
                    ?disabled="${r.disabled}"
                    value="${x.value??""}"
                    @change="${_}"
                    style="flex: 1; text-align: right;"
                ></ui5-input>
            </div>`)}if(f=="status")return T(t,r,c,v,bs(l));if(f=="range"){const x=l;return T(t,r,c,v,o`
            <ui5-range-slider
                start-value="${x?.from??0}"
                end-value="${x?.to??0}"
                min="${r.sliderMin??0}"
                max="${r.sliderMax??10}"
                step="${r.step||d}"
                ?disabled="${r.disabled}"
                @change="${g=>{const _=g.target;ve(g.target,n,{from:_.startValue,to:_.endValue})}}"
                style="min-width: 10rem; width: 100%;"
            ></ui5-range-slider>`)}return wl(e,t,r,c,l,v,s)};var ia=(e=>(e.Add="Add",e.Replace="Replace",e.ReplaceKeepData="ReplaceKeepData",e))(ia||{}),Cl=Object.defineProperty,xs=(e,t,a,i)=>{for(var s=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=n(t,a,s)||s);return s&&Cl(t,a,s),s};class Aa extends E{constructor(){super(...arguments),this.id="",this.baseUrl="",this.callbackToken="",this.createElement=t=>{const a=t.data,i=document.createElement(a.name);for(let s in a.attributes)i.setAttribute(s,a.attributes[s]);for(let s in a.on)i.addEventListener(s,r=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.on[s],parameters:{event:r}},bubbles:!0,composed:!0}))});return i},this.closeModal=()=>{const t=this.shadowRoot?.querySelectorAll("mateu-dialog, mateu-drawer");if(t&&t.length>0){t[t.length-1].close();return}this.dispatchEvent(new CustomEvent("close-modal-requested",{bubbles:!0,composed:!0}))},this.changeFavicon=t=>{let a=document.querySelector('link[rel="icon"]');a!==null?a.setAttribute("href",t):(a=document.createElement("link"),a.setAttribute("rel","icon"),a.setAttribute("href",t),document.head.appendChild(a))}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=lt.subscribe(t=>{if(t.command){const a=t.command;this.id==a.targetComponentId&&this.applyCommand(a)}if((!t.callbackToken||!this.callbackToken||t.callbackToken===this.callbackToken)&&t.fragment){const a=t.fragment;this.id==a.targetComponentId&&(this.applyFragment(a),this.completeMenu(a))}})}completeMenu(t){if(t.component&&t.component.type==U.ClientSide){const a=t.component,i=a.metadata;if(i?.type==h.App){const s=i,r=this.getRemoteMenus(s.menu);if(r.length>0){const n=r.map(l=>vi.runAction(l.baseUrl,l.route,"_empty","",l.baseUrl+"#"+l.route,void 0,void 0,void 0,l.params,this,!0));Promise.all(n).then(l=>{s.menu=this.updateMenu(s.menu,l.map(c=>c.fragments).filter(c=>c).map(c=>c).flat()),s.variant=we.MENU_ON_TOP,lt.next({fragment:{component:a,data:void 0,state:void 0,action:ia.Replace,targetComponentId:this.id,containerId:void 0},callbackToken:this.callbackToken})})}}}}updateMenu(t,a){const i=[];return t.forEach(s=>{if(s.remote){const r=a.find(n=>n.targetComponentId==s.baseUrl+"#"+s.route);if(r&&r.component?.type==U.ClientSide){const n=r.component;if(n.metadata?.type==h.App){const l=n.metadata,c=s.serverSideType&&s.serverSideType!=""?s.serverSideType:l.serverSideType;this.changeBaseUrl(l.menu,s.baseUrl,c,s.route,l.route),i.push(...l.menu)}}}else i.push(s)}),i}changeBaseUrl(t,a,i,s,r){t.forEach(n=>{n.baseUrl||(n.submenus&&n.submenus.length>0?this.changeBaseUrl(n.submenus,a,i,s,r):(n.consumedRoute=r??"",n.baseUrl=a,n.serverSideType=i,n.uriPrefix=s))})}getRemoteMenus(t){const a=[];return t.forEach(i=>{i.remote&&a.push(i)}),a}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(t){if(t.type=="SetWindowTitle"&&(document.title=t.data),t.type=="SetFavicon"&&this.changeFavicon(t.data),t.type=="DispatchEvent"&&this.dispatchNamedEvent(t.data),t.type=="NavigateTo"){const a=t.data;a&&(a.startsWith("http:")||a.startsWith("https:")?window.open(t.data,"_blank"):window.location.href=t.data)}if(t.type=="PushStateToHistory"){const a=t.data;a!==void 0&&this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:a},bubbles:!0,composed:!0}))}if(t.type=="RunAction"){const a=t.data;if(a&&a.actionId)if(a.targetComponentId){const i={command:{type:"RunAction",data:{actionId:a.actionId},targetComponentId:a.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:""};setTimeout(()=>lt.next(i))}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(t.type=="MarkAsDirty"&&this.dispatchEvent(new CustomEvent("dirty",{detail:{},bubbles:!0,composed:!0})),t.type=="MarkAsClean"&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),t.type=="DownloadFile"){const a=t.data;if(a&&a.base64Content){const i=atob(a.base64Content),s=new Uint8Array(i.length);for(let c=0;c<i.length;c++)s[c]=i.charCodeAt(c);const r=new Blob([s],{type:a.mimeType}),n=URL.createObjectURL(r),l=document.createElement("a");l.href=n,l.download=a.filename??"export",l.click(),URL.revokeObjectURL(n)}}if(t.type=="CloseModal"&&(this.closeModal(),this.dispatchNamedEvent(t.data)),t.type=="AddContentToHead"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.head.appendChild(this.createElement(t))}}if(t.type=="AddContentToBody"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.body.appendChild(this.createElement(t))}}}dispatchNamedEvent(t){if(t&&t.eventName){const a=this.component,i=a?.emitsName??a?.serverSideType;let s=t.payload??t.detail;i&&s&&typeof s=="object"&&(s={...s,__source:i}),this.dispatchEvent(new CustomEvent(t.eventName,{detail:s,bubbles:!0,composed:!0}))}}}xs([p()],Aa.prototype,"id");xs([p()],Aa.prototype,"baseUrl");var Sl=Object.defineProperty,_l=(e,t,a,i)=>{for(var s=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=n(t,a,s)||s);return s&&Sl(t,a,s),s};class na extends Aa{applyFragment(t){}manageActionRequestedEvent(t){}}_l([p()],na.prototype,"component");var nt=(e=>(e.OnLoad="OnLoad",e.OnSuccess="OnSuccess",e.OnError="OnError",e.OnValueChange="OnValueChange",e.OnCustomEvent="OnCustomEvent",e.AutoSave="AutoSave",e))(nt||{}),El=Object.defineProperty,Fa=(e,t,a,i)=>{for(var s=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=n(t,a,s)||s);return s&&El(t,a,s),s};class vt extends na{constructor(){super(...arguments),this.state={},this.data={},this.appData={},this.appState={},this.triggerOnLoad=()=>{const t=this.component;this.registerCustomEventListeners(),t.triggers?.filter(a=>a.type==nt.OnLoad).forEach(a=>{if((!a.condition||this._evalExpr(a.condition))&&!a.triggered){const s=a;s.triggered=!0;var i=s.times-1;s.timeoutMillis>0?this.scheduleOnload(s,i,this.id):this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(t,a,i)=>{if(i!=this.component?.id)return;const s=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,callbackToken:s},bubbles:!0,composed:!0}))},t.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=t=>{if(!(t instanceof CustomEvent))return;const a=t,s=(this.component.triggers??[]).filter(r=>r.type==nt.OnCustomEvent).filter(r=>r.eventName==a.type).filter(r=>r.source!=="COMPONENT"||a.detail?.__source===r.from);s.length!==0&&(s.some(r=>!r.source||r.source==="SELF")&&(t.stopPropagation(),t.preventDefault()),s.forEach(r=>{(!r.condition||this._evalExpr(r.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,parameters:a.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(t){return Xi(t,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(t){return lr(t,this.state??{},this.data??{},this._interpolationExtra())}applyFragment(t){if(this.id==t.targetComponentId){if(t.component)if(ia.Add==t.action)this.component&&this.component.children?.push(t.component);else{if(this.callbackToken=ie(),t.component?.type==U.ServerSide)if(this.component){const i=this.component,s=t.component;i.actions=s.actions,i.type=s.type,i.rules=s.rules,i.triggers=s.triggers,i.serverSideType=s.serverSideType,i.route=s.route,i.initialData=s.initialData,i.validations=s.validations,i.cssClasses=s.cssClasses,i.slot=s.slot,i.style=s.style,i.children=s.children,(i.serverSideType!=s.serverSideType||i.id!=s.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=t.component,setTimeout(()=>this.triggerOnLoad());else{const i=[t.component];this.component&&(this.component.children=i)}t.action!==ia.ReplaceKeepData&&(this.state={},this.data={})}if(t.state&&(this.state={...this.state,...t.state}),t.data){for(const i in t.data){const s=t.data[i]?.page;s?.pageNumber>0&&this.data[i]&&this.data[i].page.content&&(s.content?s.content=[...this.data[i].page.content,...s.content]:s.content=[...this.data[i].page.content])}this.data={...this.data,...t.data}}this.registerCustomEventListeners();const a=K.getAfterRenderHook();a&&setTimeout(()=>a(this)),this.requestUpdate()}}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:a,name:i})=>a.removeEventListener(i,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(a=>a.type==nt.OnCustomEvent).forEach(a=>{const i=a.source==="DOCUMENT"||a.source==="COMPONENT"?document:this;i.addEventListener(a.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:i,name:a.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:t,name:a})=>t.removeEventListener(a,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}}Fa([p()],vt.prototype,"state");Fa([p()],vt.prototype,"data");Fa([p()],vt.prototype,"appData");Fa([p()],vt.prototype,"appState");const Il={lon:0,lat:0},Ai=3,Tl=e=>{if(!e)return;const t=e.split(",").map(s=>s.trim());if(t.length!==2)return;const a=Number(t[0]),i=Number(t[1]);if(!(t[0]===""||t[1]===""||!Number.isFinite(a)||!Number.isFinite(i)))return{lon:i,lat:a}},Pl=e=>{if(e==null||e.trim()==="")return Ai;const t=Number(e);return Number.isFinite(t)?t:Ai};var Ol=Object.defineProperty,Rl=Object.getOwnPropertyDescriptor,Na=(e,t,a,i)=>{for(var s=i>1?void 0:i?Rl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Ol(t,a,s),s};let qt=class extends E{constructor(){super(...arguments),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){const e=++this.renderSeq,[{default:t},{default:a},{default:i},{default:s},{fromLonLat:r},{default:n}]=await Promise.all([me(()=>import("./vendor-ol.js").then(c=>c.M),[]),me(()=>import("./vendor-ol.js").then(c=>c.V),[]),me(()=>import("./vendor-ol.js").then(c=>c.T),[]),me(()=>import("./vendor-ol.js").then(c=>c.O),[]),me(()=>import("./vendor-ol.js").then(c=>c.p),[]),me(()=>import("./vendor-ol.js").then(c=>c.o),[])]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector("style[data-ol]")){const c=document.createElement("style");c.setAttribute("data-ol",""),c.textContent=n,this.shadowRoot.appendChild(c)}this.map&&(this.map.setTarget(void 0),this.map=void 0);const l=Tl(this.position)??Il;this.map=new t({target:this.mapElement,layers:[new i({source:new s})],view:new a({center:r([l.lon,l.lat]),zoom:Pl(this.zoom)})})}render(){return o`<div id="map"></div>`}};qt.styles=S`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `;Na([p()],qt.prototype,"position",2);Na([p()],qt.prototype,"zoom",2);Na([Ae("#map")],qt.prototype,"mapElement",2);qt=Na([C("mateu-map")],qt);const Ll=typeof HTMLElement<"u"?HTMLElement:class{};class zl extends Ll{static get observedAttributes(){return["content"]}#e;#t=0;get content(){return this.#e}set content(t){this.#e=t,this.#a()}attributeChangedCallback(t,a,i){this.content=i??void 0}connectedCallback(){this.style.display="block",this.#a()}async#a(){if(!this.isConnected)return;const t=this.#e??"",a=++this.#t,[{marked:i},{default:s}]=await Promise.all([me(()=>import("./vendor.js").then(r=>r.f),[]),me(()=>import("./vendor.js").then(r=>r.c),[])]);a===this.#t&&(this.innerHTML=s.sanitize(await i.parse(t),{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:r=>!0}}))}}typeof customElements<"u"&&!customElements.get("mateu-markdown")&&customElements.define("mateu-markdown",zl);var Dl=Object.defineProperty,Al=Object.getOwnPropertyDescriptor,la=(e,t,a,i)=>{for(var s=i>1?void 0:i?Al(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Dl(t,a,s),s};let wt=class extends E{constructor(){super(...arguments),this.fieldId="",this.signing=!1,this.hasStrokes=!1,this.drawing=!1,this.startStroke=e=>{const t=e.target;this.ensureCanvasSize(t),t.setPointerCapture(e.pointerId),this.drawing=!0;const a=t.getContext("2d");a.lineWidth=2,a.lineCap="round",a.lineJoin="round",a.strokeStyle=getComputedStyle(this).getPropertyValue("--lumo-body-text-color")||"#1a1a1a";const[i,s]=this.pointerPosition(e);a.beginPath(),a.moveTo(i,s),e.preventDefault()},this.stroke=e=>{if(!this.drawing)return;const a=e.target.getContext("2d"),[i,s]=this.pointerPosition(e);a.lineTo(i,s),a.stroke(),this.hasStrokes=!0,e.preventDefault()},this.endStroke=e=>{this.drawing=!1,e.target.releasePointerCapture(e.pointerId)}}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}canvas(){return this.renderRoot.querySelector("canvas")}pointerPosition(e){const a=e.target.getBoundingClientRect();return[e.clientX-a.left,e.clientY-a.top]}ensureCanvasSize(e){const t=e.getBoundingClientRect();(e.width!==Math.round(t.width)||e.height!==Math.round(t.height))&&(e.width=Math.round(t.width),e.height=Math.round(t.height))}clear(){const e=this.canvas();e&&e.getContext("2d").clearRect(0,0,e.width,e.height),this.hasStrokes=!1}accept(){const e=this.canvas();!e||!this.hasStrokes||(this.signing=!1,this.emit(e.toDataURL("image/png")))}renderPad(){return o`
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
            </div>`}};wt.styles=S`
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
    `;la([p()],wt.prototype,"fieldId",2);la([p()],wt.prototype,"value",2);la([y()],wt.prototype,"signing",2);la([y()],wt.prototype,"hasStrokes",2);wt=la([C("mateu-signature-pad")],wt);var Fl=Object.defineProperty,Nl=Object.getOwnPropertyDescriptor,Pt=(e,t,a,i)=>{for(var s=i>1?void 0:i?Nl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Fl(t,a,s),s};let Qe=class extends E{constructor(){super(...arguments),this.fieldId="",this.options=[],this.leavesOnly=!1,this.opened=!1,this.expanded=new Set}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}open(){this.opened||(this.opened=!0,this.expanded=new Set(this.pathTo(this.value??"",this.options)??[]),this.outsideClick=e=>{e.composedPath().includes(this)||this.close()},document.addEventListener("mousedown",this.outsideClick))}close(){this.detachOutsideClick(),this.opened=!1}pick(e){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e.value,fieldId:this.fieldId},bubbles:!0,composed:!0}))}clear(){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:this.fieldId},bubbles:!0,composed:!0}))}pathTo(e,t){for(const a of t){if(String(a.value)===e)return[];const i=this.pathTo(e,a.children??[]);if(i!=null)return[String(a.value),...i]}return null}labelOf(e,t){for(const a of t){if(String(a.value)===e)return a.label;const i=this.labelOf(e,a.children??[]);if(i!=null)return i}return null}toggle(e){const t=String(e.value),a=new Set(this.expanded);a.has(t)?a.delete(t):a.add(t),this.expanded=a}renderNode(e,t){const a=(e.children?.length??0)>0,i=this.expanded.has(String(e.value)),s=!this.leavesOnly||!a,r=String(e.value)===String(this.value??"");return o`
            <div class="node ${r?"node--selected":""} ${s?"":"node--group"}"
                 style="padding-left: ${.5+t*1.1}rem;"
                 @mousedown="${n=>n.preventDefault()}"
                 @click="${()=>s?this.pick(e):this.toggle(e)}">
                ${a?o`
                    <span class="caret" @click="${n=>{n.stopPropagation(),this.toggle(e)}}"
                    >${i?"▾":"▸"}</span>`:o`<span class="caret caret--empty"></span>`}
                ${e.label}
            </div>
            ${a&&i?e.children.map(n=>this.renderNode(n,t+1)):d}`}render(){const e=this.value?this.labelOf(String(this.value),this.options)??String(this.value):"";return o`
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
            </div>`}};Qe.styles=S`
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
    `;Pt([p()],Qe.prototype,"fieldId",2);Pt([p()],Qe.prototype,"value",2);Pt([p()],Qe.prototype,"options",2);Pt([p({type:Boolean})],Qe.prototype,"leavesOnly",2);Pt([y()],Qe.prototype,"opened",2);Pt([y()],Qe.prototype,"expanded",2);Qe=Pt([C("mateu-tree-select")],Qe);var ql=Object.defineProperty,Ml=Object.getOwnPropertyDescriptor,da=(e,t,a,i)=>{for(var s=i>1?void 0:i?Ml(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&ql(t,a,s),s};let kt=class extends E{constructor(){super(...arguments),this.fieldId="",this.cameraOpen=!1,this.cameraError=!1,this.fileFallback=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const i=new FileReader;i.onload=()=>this.emit(i.result),i.readAsDataURL(a),t.value=""}}disconnectedCallback(){super.disconnectedCallback(),this.stopStream()}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}stopStream(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}async openCamera(){this.cameraError=!1;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:!1}),this.cameraOpen=!0,await this.updateComplete;const e=this.renderRoot.querySelector("video");e&&(e.srcObject=this.stream,await e.play())}catch{this.stopStream(),this.cameraOpen=!1,this.cameraError=!0}}closeCamera(){this.stopStream(),this.cameraOpen=!1}shoot(){const e=this.renderRoot.querySelector("video");if(!e||e.videoWidth===0)return;const t=document.createElement("canvas");t.width=e.videoWidth,t.height=e.videoHeight,t.getContext("2d").drawImage(e,0,0),this.closeCamera(),this.emit(t.toDataURL("image/jpeg",.9))}triggerFallback(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="";return o`
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
            `}`}};kt.styles=S`
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
    `;da([p()],kt.prototype,"fieldId",2);da([p()],kt.prototype,"value",2);da([y()],kt.prototype,"cameraOpen",2);da([y()],kt.prototype,"cameraError",2);kt=da([C("mateu-camera-capture")],kt);var Ul=Object.defineProperty,Bl=Object.getOwnPropertyDescriptor,ft=(e,t,a,i)=>{for(var s=i>1?void 0:i?Bl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Ul(t,a,s),s};const jl=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},Wl=(e,t)=>{let a=t;for(;a;){if(a===e)return!0;a=a.assignedSlot??a.parentNode??a.host??null}return!1};let We=class extends na{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.hoveredItem=null,this.onGridHoverMove=e=>{const t=e.currentTarget,a=t.getEventContext(e)?.item??null;a!==this.hoveredItem&&(this.hoveredItem=a,t.generateCellPartNames())},this.onGridHoverLeave=e=>{this.hoveredItem!==null&&(this.hoveredItem=null,e.currentTarget.generateCellPartNames())},this.hoverCellPartNameGenerator=(e,t)=>t?.item!=null&&t.item===this.hoveredItem?"hovered-cell":"",this._onRowKey=e=>{const t=this.field?.rowSelectionShortcut;if(!t||!this.field?.onItemSelectionActionId||!this._isRowShortcutRelevant()||!Zi(t,e))return;const a=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!a)return;const i=this.currentItems(),s=parseInt(a[1],10)-1;s>=i.length||(e.preventDefault(),this.selectRow(i[s]))},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onRowKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._onRowKey)}currentItems(){return this.field?.remoteCoordinates?this.data?.[this.id]?.content??[]:this.field?.fieldId&&this.state?this.state[this.field.fieldId]??[]:[]}selectRow(e){!e||!this.field?.onItemSelectionActionId||(this.selectedItems=[e],this.state[this.id+"_selected_items"]=[e],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.field.onItemSelectionActionId,parameters:{_clickedRow:e}},bubbles:!0,composed:!0})))}_isRowShortcutRelevant(){if(this.offsetParent===null&&this.getClientRects().length===0)return!1;const e=jl();if(e&&e!==document.body&&!Wl(this,e)){const t=e.tagName?.toLowerCase()??"";if(e.isContentEditable||/^(input|textarea|select)$/.test(t)||t.startsWith("vaadin-")&&/(field|combo|picker|area|select)/.test(t))return!1}return!0}handleItemToggle(e){const{item:t,selected:a,shiftKey:i}=e.detail;if(this.rangeStartItem??=t,i){let s=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(s=this.state[this.field.fieldId]);const[r,n]=[this.rangeStartItem,t].map(u=>s.indexOf(u)).sort((u,m)=>u-m),l=s.slice(r,n+1),c=new Set(this.selectedItems);l.forEach(u=>{a?c.add(u):c.delete(u)}),this.selectedItems=[...c],this.state[this.id+"_selected_items"]=this.selectedItems}this.rangeStartItem=t}render(){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);const t=this.state[this.field?.fieldId+"_show_detail"]||this.state._show_detail&&this.state._show_detail[this.field.fieldId];if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates,i="";this.data[this.id]&&(this.data[this.id].searchSignature||i)&&this.data[this.id].searchSignature!=i&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements?e=this.data[this.id].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:i,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}if(Array.isArray(e)&&e.forEach((a,i)=>{a&&typeof a=="object"&&a._rowNumber===void 0&&(a._rowNumber=i)}),this.field?.inlineEditing)return this.renderMaster(e);if(this.field?.formPosition&&this.field?.formPosition.startsWith("modal")){const a=this;return o`

                ${this.renderMaster(e)}

                <vaadin-dialog
                        .opened="${t}"
                        @closed="${()=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.field?.fieldId+"_cancel"},bubbles:!0,composed:!0}))}}"
                        ${Ra(()=>o`
                            <mateu-event-interceptor .target="${a}">
                                <div id="container" style="${this.field?.formStyle??"display: contents;"}">
                                    <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                                </div>
                            </mateu-event-interceptor>
                            `,[()=>ie()])}
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
                    .cellPartNameGenerator="${R(this.field?.onItemSelectionActionId?this.hoverCellPartNameGenerator:void 0)}"
                    @mousemove="${R(this.field?.onItemSelectionActionId?this.onGridHoverMove:void 0)}"
                    @mouseleave="${R(this.field?.onItemSelectionActionId?this.onGridHoverLeave:void 0)}"
                    style="${this.field?.onItemSelectionActionId?"cursor: pointer;":""}${this.field?.style??""}"
                    class="${this.field?.cssClasses}"
                    .items="${e}"
                    .selectedItems="${t}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${a=>{this.selectedItems=a.detail.value,this.state[this.id+"_selected_items"]=this.selectedItems}}"
                    @item-toggle="${this.handleItemToggle}"
                    @click="${R(this.field?.onItemSelectionActionId?a=>{const s=a.currentTarget.getEventContext(a)?.item;s&&this.selectRow(s)}:void 0)}"
                    @active-item-changed="${R(this.field?.detailPath&&!this.field?.useButtonForDetail?a=>{if(this.field?.detailPath){const i=a.detail.value;i?this.detailsOpenedItems=[i]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${R(this.field?.detailPath?Ki(a=>o`${$(this,a[this.field?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    ?all-rows-visible=${e?.length<10}
            >
                <span slot="empty-state">${this.field?.label?`No ${this.field.label.toLowerCase()} added yet.`:"No items added yet."}</span>
                ${this.field?.readOnly||this.field?.inlineEditing?d:o`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.columns?.map(a=>oi(a,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}

                ${this.field?.inlineEditing&&!this.field?.readOnly?o`
                    <vaadin-grid-column width="3.5rem" flex-grow="0" frozen-to-end
                            ${Je(a=>o`
                                <vaadin-button theme="tertiary icon error" title="Remove row"
                                    @click="${()=>{this.state[this.id+"_selected_items"]=[a],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_remove"},bubbles:!0,composed:!0}))}}">
                                    <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                                </vaadin-button>`,[])}
                    ></vaadin-grid-column>
                `:d}

                ${this.field?.useButtonForDetail?o`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${Je((a,{detailsOpened:i})=>o`
              <vaadin-button
                theme="tertiary icon"
                title="${i?"Collapse":"Expand"}"
                aria-label="Toggle details"
                aria-expanded="${i?"true":"false"}"
                @click="${()=>{this.detailsOpenedItems=this.detailsOpenedItems.length?this.detailsOpenedItems[0]._rowNumber==a._rowNumber?[]:[a]:[a]}}"
              >
                <vaadin-icon
                  .icon="${i?"lumo:angle-down":"lumo:angle-right"}"
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
        </vaadin-vertical-layout>`}};We.styles=S`
        ${ht}

        /* Clickable grids (a row-selection action is wired) give visual feedback: the host sets a
           pointer cursor (inline, inherited by the slotted cell content), and the cells of the
           hovered row — tagged "hovered-cell" by cellPartNameGenerator — get a subtle highlight. */
        vaadin-grid[clickable]::part(hovered-cell) {
            background-color: var(--lumo-primary-color-10pct);
            cursor: pointer;
        }
    `;ft([p()],We.prototype,"field",2);ft([p()],We.prototype,"state",2);ft([p()],We.prototype,"data",2);ft([p()],We.prototype,"appState",2);ft([p()],We.prototype,"appData",2);ft([p()],We.prototype,"selectedItems",2);ft([y()],We.prototype,"detailsOpenedItems",2);We=ft([C("mateu-grid")],We);var Vl=Object.defineProperty,Hl=Object.getOwnPropertyDescriptor,Wt=(e,t,a,i)=>{for(var s=i>1?void 0:i?Hl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Vl(t,a,s),s};let ct=class extends E{constructor(){super(...arguments),this.getNewValue=e=>{if(this.field?.dataType=="array"){if(!this.value)return[e];const t=this.value;return t.indexOf(e)>=0?t.filter(a=>a!==e):[...t,e]}return e}}render(){let e=this.field?.options;if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates;this.data?.[this.field.fieldId]&&this.data[this.field.fieldId].content&&this.data[this.field.fieldId].totalElements?e=this.data[this.field.fieldId].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:"",fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}const t=this.field?.attributes?.divStyle;return o`
        <div style="display: flex; gap: 1rem; padding: 1rem; flex-wrap: wrap; ${t}">
                                    ${e?.map(a=>o`
                            <div 
                                    class="choice ${this.value==a.value||Array.isArray(this.value)&&this.value.includes(a.value)?"selected":""}"
                                    @click="${()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.getNewValue(a.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}"
                            >${a.description||a.image?o`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${a.image?o`
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

       `}};ct.styles=S`
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
  `;Wt([p()],ct.prototype,"field",2);Wt([p()],ct.prototype,"baseUrl",2);Wt([p()],ct.prototype,"state",2);Wt([p()],ct.prototype,"data",2);Wt([p()],ct.prototype,"value",2);ct=Wt([C("mateu-choice")],ct);var Gl=Object.defineProperty,Kl=Object.getOwnPropertyDescriptor,Ve=(e,t,a,i)=>{for(var s=i>1?void 0:i?Kl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Gl(t,a,s),s};let Se=class extends E{constructor(){super(...arguments),this.currencyChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),this.value.currency=e.detail.value,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}}))},this.valueChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),e.detail.value&&(this.value.value=e.detail.value?parseFloat(e.detail.value):0,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}})))}}render(){return o`
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
       `}};Se.styles=S`
  `;Ve([p()],Se.prototype,"fieldId",2);Ve([p()],Se.prototype,"label",2);Ve([p()],Se.prototype,"state",2);Ve([p()],Se.prototype,"data",2);Ve([p()],Se.prototype,"value",2);Ve([p()],Se.prototype,"autoFocus",2);Ve([p()],Se.prototype,"required",2);Ve([p()],Se.prototype,"colspan",2);Ve([p()],Se.prototype,"helperText",2);Se=Ve([C("mateu-money-field")],Se);const Fi=["vaadin:abacus","vaadin:absolute-position","vaadin:academy-cap","vaadin:accessibility","vaadin:accordion-menu","vaadin:add-dock","vaadin:adjust","vaadin:adobe-flash","vaadin:airplane","vaadin:alarm","vaadin:align-center","vaadin:align-justify","vaadin:align-left","vaadin:align-right","vaadin:alt-a","vaadin:alt","vaadin:ambulance","vaadin:anchor","vaadin:angle-double-down","vaadin:angle-double-left","vaadin:angle-double-right","vaadin:angle-double-up","vaadin:angle-down","vaadin:angle-left","vaadin:angle-right","vaadin:angle-up","vaadin:archive","vaadin:archives","vaadin:area-select","vaadin:arrow-backward","vaadin:arrow-circle-down-o","vaadin:arrow-circle-down","vaadin:arrow-circle-left-o","vaadin:arrow-circle-left","vaadin:arrow-circle-right-o","vaadin:arrow-circle-right","vaadin:arrow-circle-up-o","vaadin:arrow-circle-up","vaadin:arrow-down","vaadin:arrow-forward","vaadin:arrow-left","vaadin:arrow-long-down","vaadin:arrow-long-left","vaadin:arrow-right","vaadin:arrow-up","vaadin:arrows-cross","vaadin:arrows-long-h","vaadin:arrows-long-right","vaadin:arrows-long-up","vaadin:arrows-long-v","vaadin:arrows","vaadin:asterisk","vaadin:at","vaadin:automation","vaadin:backspace-a","vaadin:backspace","vaadin:backwards","vaadin:ban","vaadin:bar-chart-h","vaadin:bar-chart-v","vaadin:bar-chart","vaadin:barcode","vaadin:bed","vaadin:bell-o","vaadin:bell-slash-o","vaadin:bell-slash","vaadin:bell","vaadin:boat","vaadin:bold","vaadin:bolt","vaadin:bomb","vaadin:book-dollar","vaadin:book-percent","vaadin:book","vaadin:bookmark-o","vaadin:bookmark","vaadin:briefcase","vaadin:browser","vaadin:bug-o","vaadin:bug","vaadin:building-o","vaadin:building","vaadin:bullets","vaadin:bullseye","vaadin:bus","vaadin:buss","vaadin:button","vaadin:calc-book","vaadin:calc","vaadin:calendar-briefcase","vaadin:calendar-clock","vaadin:calendar-envelope","vaadin:calendar-o","vaadin:calendar-user","vaadin:calendar","vaadin:camera","vaadin:car","vaadin:caret-down","vaadin:caret-left","vaadin:caret-right","vaadin:caret-square-down-o","vaadin:caret-square-left-o","vaadin:caret-square-right-o","vaadin:caret-square-up-o","vaadin:caret-up","vaadin:cart-o","vaadin:cart","vaadin:cash","vaadin:chart-3d","vaadin:chart-grid","vaadin:chart-line","vaadin:chart-timeline","vaadin:chart","vaadin:chat","vaadin:check-circle-o","vaadin:check-circle","vaadin:check-square-o","vaadin:check-square","vaadin:check","vaadin:chevron-circle-down-o","vaadin:chevron-circle-down","vaadin:chevron-circle-left-o","vaadin:chevron-circle-left","vaadin:chevron-circle-right-o","vaadin:chevron-circle-right","vaadin:chevron-circle-up-o","vaadin:chevron-circle-up","vaadin:chevron-down-small","vaadin:chevron-down","vaadin:chevron-left-small","vaadin:chevron-left","vaadin:chevron-right-small","vaadin:chevron-right","vaadin:chevron-up-small","vaadin:chevron-up","vaadin:child","vaadin:circle-thin","vaadin:circle","vaadin:clipboard-check","vaadin:clipboard-cross","vaadin:clipboard-heart","vaadin:clipboard-pulse","vaadin:clipboard-text","vaadin:clipboard-user","vaadin:clipboard","vaadin:clock","vaadin:close-big","vaadin:close-circle-o","vaadin:close-circle","vaadin:close-small","vaadin:close","vaadin:cloud-download-o","vaadin:cloud-download","vaadin:cloud-o","vaadin:cloud-upload-o","vaadin:cloud-upload","vaadin:cloud","vaadin:cluster","vaadin:code","vaadin:coffee","vaadin:cog-o","vaadin:cog","vaadin:cogs","vaadin:coin-piles","vaadin:coins","vaadin:combobox","vaadin:comment-ellipsis-o","vaadin:comment-ellipsis","vaadin:comment-o","vaadin:comment","vaadin:comments-o","vaadin:comments","vaadin:compile","vaadin:compress-square","vaadin:compress","vaadin:connect-o","vaadin:connect","vaadin:controller","vaadin:copy-o","vaadin:copy","vaadin:copyright","vaadin:corner-lower-left","vaadin:corner-lower-right","vaadin:corner-upper-left","vaadin:corner-upper-right","vaadin:credit-card","vaadin:crop","vaadin:cross-cutlery","vaadin:crosshairs","vaadin:css","vaadin:ctrl-a","vaadin:ctrl","vaadin:cube","vaadin:cubes","vaadin:curly-brackets","vaadin:cursor-o","vaadin:cursor","vaadin:cutlery","vaadin:dashboard","vaadin:database","vaadin:date-input","vaadin:deindent","vaadin:del-a","vaadin:del","vaadin:dental-chair","vaadin:desktop","vaadin:diamond-o","vaadin:diamond","vaadin:diploma-scroll","vaadin:diploma","vaadin:disc","vaadin:doctor-briefcase","vaadin:doctor","vaadin:dollar","vaadin:dot-circle","vaadin:download-alt","vaadin:download","vaadin:drop","vaadin:edit","vaadin:eject","vaadin:elastic","vaadin:ellipsis-circle-o","vaadin:ellipsis-circle","vaadin:ellipsis-dots-h","vaadin:ellipsis-dots-v","vaadin:ellipsis-h","vaadin:ellipsis-v","vaadin:enter-arrow","vaadin:enter","vaadin:envelope-o","vaadin:envelope-open-o","vaadin:envelope-open","vaadin:envelope","vaadin:envelopes-o","vaadin:envelopes","vaadin:eraser","vaadin:esc-a","vaadin:esc","vaadin:euro","vaadin:exchange","vaadin:exclamation-circle-o","vaadin:exclamation-circle","vaadin:exclamation","vaadin:exit-o","vaadin:exit","vaadin:expand-full","vaadin:expand-square","vaadin:expand","vaadin:external-browser","vaadin:external-link","vaadin:eye-slash","vaadin:eye","vaadin:eyedropper","vaadin:facebook-square","vaadin:facebook","vaadin:factory","vaadin:family","vaadin:fast-backward","vaadin:fast-forward","vaadin:female","vaadin:file-add","vaadin:file-code","vaadin:file-font","vaadin:file-movie","vaadin:file-o","vaadin:file-picture","vaadin:file-presentation","vaadin:file-process","vaadin:file-refresh","vaadin:file-remove","vaadin:file-search","vaadin:file-sound","vaadin:file-start","vaadin:file-table","vaadin:file-text-o","vaadin:file-text","vaadin:file-tree-small","vaadin:file-tree-sub","vaadin:file-tree","vaadin:file-zip","vaadin:file","vaadin:fill","vaadin:film","vaadin:filter","vaadin:fire","vaadin:flag-checkered","vaadin:flag-o","vaadin:flag","vaadin:flash","vaadin:flask","vaadin:flight-landing","vaadin:flight-takeoff","vaadin:flip-h","vaadin:flip-v","vaadin:folder-add","vaadin:folder-o","vaadin:folder-open-o","vaadin:folder-open","vaadin:folder-remove","vaadin:folder-search","vaadin:folder","vaadin:font","vaadin:form","vaadin:forward","vaadin:frown-o","vaadin:funcion","vaadin:function","vaadin:funnel","vaadin:gamepad","vaadin:gavel","vaadin:gift","vaadin:glass","vaadin:glasses","vaadin:globe-wire","vaadin:globe","vaadin:golf","vaadin:google-plus-square","vaadin:google-plus","vaadin:grab","vaadin:grid-bevel","vaadin:grid-big-o","vaadin:grid-big","vaadin:grid-h","vaadin:grid-small-o","vaadin:grid-small","vaadin:grid-v","vaadin:grid","vaadin:group","vaadin:hammer","vaadin:hand","vaadin:handle-corner","vaadin:hands-up","vaadin:handshake","vaadin:harddrive-o","vaadin:harddrive","vaadin:hash","vaadin:header","vaadin:headphones","vaadin:headset","vaadin:health-card","vaadin:heart-o","vaadin:heart","vaadin:home-o","vaadin:home","vaadin:hospital","vaadin:hourglass-empty","vaadin:hourglass-end","vaadin:hourglass-start","vaadin:hourglass","vaadin:inbox","vaadin:indent","vaadin:info-circle-o","vaadin:info-circle","vaadin:info","vaadin:input","vaadin:insert","vaadin:institution","vaadin:invoice","vaadin:italic","vaadin:key-o","vaadin:key","vaadin:keyboard-o","vaadin:keyboard","vaadin:laptop","vaadin:layout","vaadin:level-down-bold","vaadin:level-down","vaadin:level-left-bold","vaadin:level-left","vaadin:level-right-bold","vaadin:level-right","vaadin:level-up-bold","vaadin:level-up","vaadin:lifebuoy","vaadin:lightbulb","vaadin:line-bar-chart","vaadin:line-chart","vaadin:line-h","vaadin:line-v","vaadin:lines-list","vaadin:lines","vaadin:link","vaadin:list-ol","vaadin:list-select","vaadin:list-ul","vaadin:list","vaadin:location-arrow-circle-o","vaadin:location-arrow-circle","vaadin:location-arrow","vaadin:lock","vaadin:magic","vaadin:magnet","vaadin:mailbox","vaadin:male","vaadin:map-marker","vaadin:margin-bottom","vaadin:margin-left","vaadin:margin-right","vaadin:margin-top","vaadin:margin","vaadin:medal","vaadin:megafone","vaadin:megaphone","vaadin:meh-o","vaadin:menu","vaadin:microphone","vaadin:minus-circle-o","vaadin:minus-circle","vaadin:minus-square-o","vaadin:minus","vaadin:mobile-browser","vaadin:mobile-retro","vaadin:mobile","vaadin:modal-list","vaadin:modal","vaadin:money-deposit","vaadin:money-exchange","vaadin:money-withdraw","vaadin:money","vaadin:moon-o","vaadin:moon","vaadin:morning","vaadin:movie","vaadin:music","vaadin:mute","vaadin:native-button","vaadin:newspaper","vaadin:notebook","vaadin:nurse","vaadin:office","vaadin:open-book","vaadin:option-a","vaadin:option","vaadin:options","vaadin:orientation","vaadin:out","vaadin:outbox","vaadin:package","vaadin:padding-bottom","vaadin:padding-left","vaadin:padding-right","vaadin:padding-top","vaadin:padding","vaadin:paint-roll","vaadin:paintbrush","vaadin:palete","vaadin:palette","vaadin:panel","vaadin:paperclip","vaadin:paperplane-o","vaadin:paperplane","vaadin:paragraph","vaadin:password","vaadin:paste","vaadin:pause","vaadin:pencil","vaadin:phone-landline","vaadin:phone","vaadin:picture","vaadin:pie-bar-chart","vaadin:pie-chart","vaadin:piggy-bank-coin","vaadin:piggy-bank","vaadin:pill","vaadin:pills","vaadin:pin-post","vaadin:pin","vaadin:play-circle-o","vaadin:play-circle","vaadin:play","vaadin:plug","vaadin:plus-circle-o","vaadin:plus-circle","vaadin:plus-minus","vaadin:plus-square-o","vaadin:plus","vaadin:pointer","vaadin:power-off","vaadin:presentation","vaadin:print","vaadin:progressbar","vaadin:puzzle-piece","vaadin:pyramid-chart","vaadin:qrcode","vaadin:question-circle-o","vaadin:question-circle","vaadin:question","vaadin:quote-left","vaadin:quote-right","vaadin:random","vaadin:raster-lower-left","vaadin:raster","vaadin:records","vaadin:recycle","vaadin:refresh","vaadin:reply-all","vaadin:reply","vaadin:resize-h","vaadin:resize-v","vaadin:retweet","vaadin:rhombus","vaadin:road-branch","vaadin:road-branches","vaadin:road-split","vaadin:road","vaadin:rocket","vaadin:rotate-left","vaadin:rotate-right","vaadin:rss-square","vaadin:rss","vaadin:safe-lock","vaadin:safe","vaadin:scale-unbalance","vaadin:scale","vaadin:scatter-chart","vaadin:scissors","vaadin:screwdriver","vaadin:search-minus","vaadin:search-plus","vaadin:search","vaadin:select","vaadin:server","vaadin:share-square","vaadin:share","vaadin:shield","vaadin:shift-arrow","vaadin:shift","vaadin:shop","vaadin:sign-in-alt","vaadin:sign-in","vaadin:sign-out-alt","vaadin:sign-out","vaadin:signal","vaadin:sitemap","vaadin:slider","vaadin:sliders","vaadin:smiley-o","vaadin:sort","vaadin:sound-disable","vaadin:spark-line","vaadin:specialist","vaadin:spinner-arc","vaadin:spinner-third","vaadin:spinner","vaadin:spline-area-chart","vaadin:spline-chart","vaadin:split-h","vaadin:split-v","vaadin:split","vaadin:spoon","vaadin:square-shadow","vaadin:star-half-left-o","vaadin:star-half-left","vaadin:star-half-right-o","vaadin:star-half-right","vaadin:star-o","vaadin:star","vaadin:start-cog","vaadin:step-backward","vaadin:step-forward","vaadin:stethoscope","vaadin:stock","vaadin:stop-cog","vaadin:stop","vaadin:stopwatch","vaadin:storage","vaadin:strikethrough","vaadin:subscript","vaadin:suitcase","vaadin:sun-down","vaadin:sun-o","vaadin:sun-rise","vaadin:superscript","vaadin:sword","vaadin:tab-a","vaadin:tab","vaadin:table","vaadin:tablet","vaadin:tabs","vaadin:tag","vaadin:tags","vaadin:tasks","vaadin:taxi","vaadin:teeth","vaadin:terminal","vaadin:text-height","vaadin:text-input","vaadin:text-label","vaadin:text-width","vaadin:thin-square","vaadin:thumbs-down-o","vaadin:thumbs-down","vaadin:thumbs-up-o","vaadin:thumbs-up","vaadin:ticket","vaadin:time-backward","vaadin:time-forward","vaadin:timer","vaadin:toolbox","vaadin:tools","vaadin:tooth","vaadin:touch","vaadin:train","vaadin:trash","vaadin:tree-table","vaadin:trendind-down","vaadin:trending-down","vaadin:trending-up","vaadin:trophy","vaadin:truck","vaadin:twin-col-select","vaadin:twitter-square","vaadin:twitter","vaadin:umbrella","vaadin:underline","vaadin:unlink","vaadin:unlock","vaadin:upload-alt","vaadin:upload","vaadin:user-card","vaadin:user-check","vaadin:user-clock","vaadin:user-heart","vaadin:user-star","vaadin:user","vaadin:users","vaadin:vaadin-h","vaadin:vaadin-v","vaadin:viewport","vaadin:vimeo-square","vaadin:vimeo","vaadin:volume-down","vaadin:volume-off","vaadin:volume-up","vaadin:volume","vaadin:wallet","vaadin:warning","vaadin:workplace","vaadin:wrench","vaadin:youtube-square","vaadin:youtube"];var Jl=Object.defineProperty,Yl=Object.getOwnPropertyDescriptor,ye=(e,t,a,i)=>{for(var s=i>1?void 0:i?Yl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Jl(t,a,s),s};let Z=class extends E{constructor(){super(...arguments),this.component=void 0,this.field=void 0,this.baseUrl=void 0,this.state={},this.data={},this.appState={},this.appData={},this.colorPickerOpened=!1,this.colorPickerValue=void 0,this.comboData=[],this._comboFilter="",this.rendered=!1,this.renderColorPicker=()=>{const e=this.field?.fieldId,t=this.state&&e in this.state?this.state[e]:this.field?.initialValue;return o`
            <ui5-color-picker value="${t}" @change="${a=>this.colorPickerValue=a.target.value}">Picker</ui5-color-picker>
        `},this.saveColor=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.colorPickerValue,fieldId:this.field.fieldId},bubbles:!0,composed:!0})),this.colorPickerOpened=!1},this.renderColorPickerFooter=()=>o`<vaadin-button @click="${()=>this.colorPickerOpened=!1}">Cancel</vaadin-button>
        <vaadin-button theme="primary" @click="${this.saveColor}">Save</vaadin-button>`,this.checked=e=>{const t=e.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.checked,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))},this.convert=e=>this.field?.dataType=="integer"?parseInt(e):e,this.multiComboBoxValueChanged=e=>{if(this.rendered){const t=this.field?.fieldId,a=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let i;e.detail.value&&(i=e.detail.value.map(s=>s.value),i&&i.length>0&&(this.data[this.id]||(this.data[this.id]={}),this.data[this.id].content||(this.data[this.id].content=[]),this.data[this.id]&&this.data[this.id].content&&e.detail.value.forEach(s=>{this.data[this.id].content?.find(r=>s.value==r.value)||this.data[this.id].content.push(s)}))),this.compareArrays(i,a)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.valueChanged=e=>{this.rendered&&e.detail.value!==void 0&&e.detail.value!=this.state[this.field.fieldId]&&this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.convert(e.detail.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.selectedItems=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.comboData&&this.comboData.length>0)return this.comboData?.filter(t=>e.indexOf(t.value)>=0);if(this.data[this.id]&&this.data[this.id].content&&this.data[this.id].content.length>0)return this.data[this.id].content.filter(t=>e.indexOf(t.value)>=0)}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0);return[]},this.selectedIndex=e=>{if(e)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const t=this.data[this.id].content.find(a=>a.value==e);if(t)return this.data[this.id].content.indexOf(t)}}else{const t=this.field?.options?.find(a=>a.value==e);if(t)return this.field?.options?.indexOf(t)}},this.selectedIndexes=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content)return this.data[this.id].content.filter(a=>e.indexOf(a.value)>=0).map(a=>this.data[this.id].content.indexOf(a))}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0).map(t=>this.field?.options?.indexOf(t));return[]},this.compareArrays=(e,t)=>this.falsy(e)&&this.falsy(t)||e&&t&&e.length===t.length&&e.every((a,i)=>a===t[i]),this.falsy=e=>!e||e.length==0,this.listItemsSelected=e=>{const t=this.field?.fieldId,a=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let i;this.rendered&&(e.detail.value&&(this.field?.remoteCoordinates?this.data[this.id]&&this.data[this.id].content&&(i=e.detail.value.map(s=>this.data[this.id].content[s].value)):i=e.detail.value.map(s=>this.field.options[s].value)),this.compareArrays(i,a)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))},this.listItemSelected=e=>{let t;if(e.detail.value||e.detail.value==0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const a=this.data[this.id].content[e.detail.value];a&&(t=a.value)}}else{const a=this.field.options[e.detail.value];a&&(t=a.value)}this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.mapPosition=e=>{switch(e){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.helperShownInControl=!1,this.fileUploaded=e=>{const t=this.field?.fieldId??"",a=this.state[t];a.push({id:e.detail.xhr.responseText,name:e.detail.file.name}),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.fileChanged=e=>{const t=this.field?.fieldId??"",a=(e.detail.value??[]).filter(s=>s.id).map(s=>s.id),i=(this.state[t]??[]).map(s=>s.id);if(!this.compareArrays(i,a)){const s=(e.detail.value??[]).filter(r=>r.id).map(r=>({id:r.id,name:r.name}));this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.triggerImageUpload=()=>{this.renderRoot?.querySelector('input[type="file"]')?.click()},this.imageUpload=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const i=new FileReader;i.onload=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i.result,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},i.readAsDataURL(a),t.value=""},this.imageDelete=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:"",fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.iconComboboxRenderer=e=>o`
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
`,this.filteredIcons=[],this.navLinkOffset=null,this.iconFilterChanged=e=>{this.filteredIcons=Fi.filter(t=>!e.detail.value||t.indexOf(e.detail.value)>=0)}}remoteComboDataProvider(e){return(t,a)=>{const{filter:i,page:s,pageSize:r}=t,n=i??"";this._comboFilter=n,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{searchText:i,fieldId:this.field?.fieldId,size:r,page:s,sort:void 0},callback:l=>{if(n===this._comboFilter)if(l?.messages?.forEach(c=>{ra.show(c.text,{position:c.position?this.mapPosition(c.position):void 0,theme:c.variant,duration:c.duration})}),!l.fragments||l.fragments.length==0)this.comboData=[],a([],0);else{const c=l.fragments[0].data?.[this.id];this.comboData=c?.content,a(c?.content,c?.totalElements)}},callbackonly:!0},bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.rendered=!1}renderNavLink(){const e=this.field?.link;if(!e?.href)return d;const t=Ce(e.href,this.state,this.data)??e.href,a=Ce(e.title,this.state,this.data)||t,i=e.icon||(t.startsWith("http")?"vaadin:external-link":"vaadin:link"),s=this.navLinkOffset??"calc(var(--lumo-font-size-s) * 1.6 + (var(--lumo-size-m) - var(--lumo-icon-size-s)) / 2)";return o`<a
                data-navlink
                href="${t}"
                title="${a}"
                target="${R(e.target||void 0)}"
                style="display: flex; align-items: center; color: var(--lumo-secondary-text-color); align-self: flex-start; margin-top: ${s};"
        ><vaadin-icon icon="${i}" style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"></vaadin-icon></a>`}positionNavLink(){const e=this.renderRoot?.querySelector("a[data-navlink]");e&&setTimeout(()=>{const t=e.parentElement,a=t?.firstElementChild?.firstElementChild;if(!t||!a)return;const s=(a.shadowRoot?.querySelector('[part="input-field"]')??a).getBoundingClientRect();if(s.height===0)return;const r=Math.max(0,s.top+s.height/2-e.offsetHeight/2-t.getBoundingClientRect().top),n=`${Math.round(r)}px`;this.navLinkOffset!==n&&(this.navLinkOffset=n)})}helperText(){return this.helperShownInControl=!0,Be(this.field?.description??"",this.state,this.data)??""}render(){const e=this.field?.fieldId??"";this.rendered=!0;const t=this.renderNavLink();this.helperShownInControl=!1;const a=this.renderField(),i=this.field?.description&&!this.helperShownInControl?Be(this.field.description,this.state,this.data):void 0;return o`<div style="display: block;">
            <div style="${t!==d?"display: flex; gap: var(--lumo-space-xs);":""}"><div style="flex: 1; min-width: 0;">${a}</div>${t}</div>
            ${i?o`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${i}</div>
            `:d}
            ${this.data.errors&&this.data.errors[e]&&this.data.errors[e].length>0?o`
                <div><ul>${this.data.errors[e].map(s=>o`<li>${s}</li>`)}</ul></div>
            `:d}
        </div>`}async firstUpdated(){this.filteredIcons=Fi}update(e){e.has("component")&&(this.rendered=!1),super.update(e)}updated(e){super.updated(e),this.positionNavLink()}renderField(){const e=this.field?.fieldId??"",t=this.state&&e in this.state?this.state[e]:this.field?.initialValue,a=this.field?.label+"",i=Ce(a,this.state,this.data),s=this.labelAlreadyRendered||!i||i=="null"?d:i;return this.field?.stereotype=="badge"?this.renderBadgeField(e,t,s,i):this.field?.stereotype=="plainText"?this.renderPlainTextField(e,t,s,i):this.field?.readOnly&&this.field.stereotype!="grid"&&this.field.dataType!="status"&&this.field?.dataType!="money"?this.renderReadOnlyField(e,t,s,i):this.field?.dataType=="file"?this.renderFileField(e,t,s,i):this.field?.dataType=="string"?this.renderStringField(e,t,s,i):this.field?.dataType=="number"?this.renderNumberField(e,t,s,i):this.field?.dataType=="integer"?this.renderIntegerField(e,t,s,i):this.field?.dataType=="bool"?this.renderBoolField(e,t,s,i):this.field?.dataType=="dateRange"?this.renderDateRangeField(e,t,s,i):this.field?.dataType=="date"?this.renderDateField(e,t,s,i):this.field?.dataType=="dateTime"?this.renderDateTimeField(e,t,s,i):this.field?.dataType=="time"?this.renderTimeField(e,t,s,i):this.field?.dataType=="array"?this.renderArrayField(e,t,s,i):this.field?.dataType=="money"?this.renderMoneyField(e,t,s,i):this.field?.dataType=="status"?this.renderStatusField(e,t,s,i):this.field?.dataType=="range"?this.renderRangeField(e,t,s,i):o`<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`}renderBadgeField(e,t,a,i){if(!this.field)return o``;const s=t===!0||t==="true";return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><span theme="badge ${s?"success":""} pill" style="${s?"":"opacity: 0.4;"}">${i}</span>
            </vaadin-custom-field>`}renderPlainTextField(e,t,a,i){if(!this.field)return o``;let s=Be(t,this.state,this.data);const r=s&&typeof s=="object"&&"value"in s?s:null;s&&s.value&&(s=s.value);const n=this.field?.dataType=="bool"||s===!0||s===!1,l=this.field?.dataType=="money",c=s!=null&&s!=="";let u=c?String(s):"—";if(l&&c){const v=typeof s=="number"?s:parseFloat(String(s));isNaN(v)||(u=r&&r.locale&&r.currency?new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(v):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v))}const m=n?o`<vaadin-icon icon="${s===!0||s==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:this.field?.multiline?o`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${u}</span>`:o`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${l?" font-variant-numeric: tabular-nums;":""}">${u}</span>`;return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    data-colspan="${this.field?.colspan}"
                    style="${l?"text-align: right; ":""}${this.field?.style}"
            >${m}</vaadin-custom-field>`}renderReadOnlyField(e,t,a,i){if(!this.field)return o``;let s=Be(t,this.state,this.data)||this.data[e];if(s&&s.value&&(s=s.value),this.field.stereotype=="image"||this.field.stereotype=="uploadableImage"||this.field.stereotype=="signature"||this.field.stereotype=="camera")return o`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><img src="${s}" id="${this.field.fieldId}_img" style="${this.field.style}">
                </vaadin-custom-field>`;if(this.field.dataType=="bool")return o`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><vaadin-icon icon="${s?"vaadin:check":"vaadin:minus"}" style="height: 20px;"></vaadin-icon>
                </vaadin-custom-field>`;const r=s!=null?String(s):"";return o`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${a}"
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
`}renderFileField(e,t,a,i){if(!this.field)return o``;const s=t?.map(r=>({id:r.id,name:r.name,type:"",uploadTarget:"",complete:!0}))??[];return o`
                <vaadin-custom-field
                        label="${a}"
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
            `}renderStringField(e,t,a,i){if(!this.field)return o``;if(this.field?.stereotype=="searchable"){const s=n=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"code-"+this.field?.fieldId,parameters:{code:n.currentTarget.value}},bubbles:!0,composed:!0}))},r=n=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"codesearch-"+this.field?.fieldId,parameters:{}},bubbles:!0,composed:!0}))};return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
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
                    `}let s=t;return t&&t.value&&(s=t.value),o`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${a}"
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
                            label="${a}"
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
                            label="${a}"
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
                            ${Wa(this.comboRenderer,[])}
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
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            ${Wa(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
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
                            label="${a}"
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
                            label="${a}"
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
                            ${Gi(()=>o`
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
                            required="${this.field.required||d}"
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
                            required="${this.field.required||d}"
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
                            ${Wa(this.iconComboboxRenderer,[])}
                    >
                        ${t?o`<vaadin-icon slot="prefix" icon="${t}"></vaadin-icon>`:d}
                    </vaadin-combo-box>
                `;if(this.field?.stereotype=="password")return o`
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
                `;if(this.field?.stereotype=="html")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${pe(""+t)}</div></vaadin-custom-field>
                `;if(this.field?.stereotype=="image")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><img
                            src="${t}"
                            style="${this.component?.style}" class="${this.component?.cssClasses}"></vaadin-custom-field>
                `;if(this.field?.stereotype=="treeSelect")return o`
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
                `;if(this.field?.stereotype=="signature")return o`
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
                `;if(this.field?.stereotype=="uploadableImage"){const s=t!=null&&t!=="";return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
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
  ${Ra(this.renderColorPicker,[])}
  ${ii(this.renderColorPickerFooter,[])}
></vaadin-dialog>
                `:o`
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
`}renderNumberField(e,t,a,i){return this.field?o`<vaadin-number-field
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
            ></vaadin-number-field>`:o``}renderIntegerField(e,t,a,i){if(!this.field)return o``;if(this.field.stereotype=="stars"){let s=t;isNaN(s)&&(s=0);const r=[1,2,3,4,5];return o`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
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
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><input type="range" @input="${r=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}" min="${this.field.sliderMin??0}" max="${this.field.sliderMax??10}" value="${s??0}"/></vaadin-custom-field>
                `}return o`
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
            `}renderBoolField(e,t,a,i){return this.field?o`
                <vaadin-custom-field
                        label="${a}"
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
            `:o``}renderDateRangeField(e,t,a,i){if(!this.field)return o``;const s=t?t.from+";"+t.to:void 0;return o`<vcf-date-range-picker
                    id="${this.field.fieldId}"
                    label="${a}"
                    @value-changed="${r=>{r.detail.value&&(r.detail.value={from:r.detail.value.split(";")[0],to:r.detail.value.split(";")[1]}),this.valueChanged(r)}}"
                    value="${s}"
                    .helperText="${this.helperText()}"
                    ?autofocus="${this.field.wantsFocus}"
                    ?required="${this.field.required||d}"
                    data-colspan="${this.field.colspan}"
            ></vcf-date-range-picker>`}renderDateField(e,t,a,i){return this.field?o`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-picker>`:o``}renderDateTimeField(e,t,a,i){return this.field?o`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-time-picker>`:o``}renderTimeField(e,t,a,i){return this.field?o`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-time-picker>`:o``}renderArrayField(e,t,a,i){if(!this.field)return o``;if(this.field?.stereotype=="choice")return o`
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
`;if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
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
                                     .selectedValues="${R(this.selectedIndexes(t))}"
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
                    `}return o`
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
                    `}if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.rendered||setTimeout(()=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}),o`
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
            `}renderMoneyField(e,t,a,i){if(!this.field)return o``;if(this.field.readOnly){const s=t;let r=s;return s&&s.locale&&s.currency?r=new Intl.NumberFormat(s.locale,{style:"currency",currency:s.currency}).format(s.value):r=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(s),o`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><div style="width: 186px; text-align: right;">${r}</div></vaadin-custom-field>`}return o`<mateu-money-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        .value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></mateu-money-field>`}renderStatusField(e,t,a,i){if(!this.field)return o``;const s=t;return o`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    ${s?o`<span theme="badge pill ${za(s.type)}">${s.message}</span>`:o``}                    
                </vaadin-custom-field>
            `}renderRangeField(e,t,a,i){if(!this.field)return o``;const s=t;return o`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><ui5-range-slider start-value="${s?.from??0}" end-value="${s?.to??0}" 
                                   min="${this.field.sliderMin??0}" 
                                   max="${this.field.sliderMax??10}"
                                   step="${this.field.step||d}"
                                   @change="${r=>{const n=r.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{from:n.startValue,to:n.endValue},fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"
                                   style="min-width: 10rem;"
                ></ui5-range-slider></vaadin-custom-field>
            `}};Z.styles=S`
        ${ht}

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
  `;ye([p()],Z.prototype,"component",2);ye([p()],Z.prototype,"field",2);ye([p()],Z.prototype,"baseUrl",2);ye([p()],Z.prototype,"state",2);ye([p()],Z.prototype,"data",2);ye([p()],Z.prototype,"appState",2);ye([p()],Z.prototype,"appData",2);ye([p()],Z.prototype,"labelAlreadyRendered",2);ye([y()],Z.prototype,"colorPickerOpened",2);ye([y()],Z.prototype,"colorPickerValue",2);ye([y()],Z.prototype,"filteredIcons",2);ye([y()],Z.prototype,"navLinkOffset",2);Z=ye([C("mateu-field")],Z);var Xl=Object.defineProperty,Ql=Object.getOwnPropertyDescriptor,Ot=(e,t,a,i)=>{for(var s=i>1?void 0:i?Ql(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Xl(t,a,s),s};const Zl=e=>{const t=[];return e.color&&e.color!=="normal"&&e.color!=="none"&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle==="tertiaryInline"?"tertiary-inline":e.buttonStyle),e.size&&e.size!=="none"&&e.size!=="normal"&&t.push(e.size),t.length?t.join(" "):void 0},Ni=e=>e==="back"||e==="backToList"||!!e&&e.startsWith("cancel");let Ze=class extends E{constructor(){super(...arguments),this.appState={},this.appData={},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.evalLabel=e=>Ce(e,this.state,this.data),this.renderBtn=e=>{if((this.data??{})[e.actionId+".hidden"])return d;const t=this.evalLabel(e.label),a=K.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e.actionId));return a||o`
        <vaadin-button
                data-action-id="${e.id}"
                theme="${Zl(e)||d}"
                @click="${()=>this.handleButtonClick(e.actionId)}"
                ?disabled="${e.disabled}"
        >${e.iconOnLeft?o`<vaadin-icon icon="${e.iconOnLeft}"></vaadin-icon>`:d}${t}${e.iconOnRight?o`<vaadin-icon icon="${e.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>
    `}}render(){const e=this.metadata;if(!e)return o``;const t=e.toolbar??[],a=t.filter(l=>Ni(l.actionId)),i=t.filter(l=>!Ni(l.actionId)),s=a.length>0&&i.length>0?o`<span class="toolbar-divider"></span>`:d,r=e.avatar||e.title||e.subtitle||e.kpis?.length>0||e.header?.length>0||t.length>0,n=e.level??0;return n>0?this.setAttribute("data-nested",""):this.removeAttribute("data-nested"),o`
            ${e.breadcrumbs&&e.breadcrumbs.length>0?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="breadcrumbs-bar">
                    ${e.breadcrumbs.map((l,c)=>o`
                        ${c>0?o`<span>/</span>`:d}
                        ${l.link?o`<button class="breadcrumb-link" @click="${()=>window.location.href=`${l.link}`}">${l.text}</button>`:o`<span>${l.text}</span>`}
                    `)}
                </div>
            `:d}
            ${e.noHeader?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                    ${e?.header?.map(l=>$(this,l,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${a.map(this.renderBtn)}
                    ${s}
                    ${i.map(this.renderBtn)}
                </div>
            `:r?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="form-header">
                    ${e.avatar?$(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):d}
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        ${e?.title&&n==0?o`<h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${pe(yt(e?.title,this.state??{},this.data??{}))}</h2>`:d}
                        ${e?.title&&n==1?o`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${pe(yt(e?.title,this.state??{},this.data??{}))}</h3>`:d}
                        ${e?.title&&n==2?o`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${pe(yt(e?.title,this.state??{},this.data??{}))}</h4>`:d}
                        ${e?.title&&n==3?o`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${pe(yt(e?.title,this.state??{},this.data??{}))}</h5>`:d}
                        ${e?.title&&n>3?o`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${pe(yt(e?.title,this.state??{},this.data??{}))}</h6>`:d}

                        ${e?.subtitle?o`<span style="display: inline-block; margin-block-end: 0.83em;">${pe(yt(e?.subtitle,this.state??{},this.data??{}))}</span>`:d}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${e?.kpis?.map(l=>o`
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div>${this.evalLabel(l.title)}</div>
                                <div>${pe(yt(l.text,this.state??{},this.data??{}))}</div>
                            </div>
                        `)}
                        ${e?.header?.map(l=>$(this,l,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${a.map(this.renderBtn)}
                        ${s}
                        ${i.map(this.renderBtn)}
                    </div>
                </div>
            `:d}
            ${e.badges&&e.badges.length>0?o`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${e.badges.map(l=>Gr(l,this.state??{},this.data??{}))}
                </div>
            `:d}
        `}};Ze.styles=S`
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

        ${ht}
    `;Ot([p()],Ze.prototype,"metadata",2);Ot([p()],Ze.prototype,"baseUrl",2);Ot([p()],Ze.prototype,"state",2);Ot([p()],Ze.prototype,"data",2);Ot([p()],Ze.prototype,"appState",2);Ot([p()],Ze.prototype,"appData",2);Ze=Ot([C("mateu-content-header")],Ze);var ed=Object.defineProperty,td=Object.getOwnPropertyDescriptor,ca=(e,t,a,i)=>{for(var s=i>1?void 0:i?td(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&ed(t,a,s),s};let Ct=class extends na{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={}}render(){const e=this.component?.metadata;return o`
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
       `}};Ct.styles=S`
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
    `;ca([p()],Ct.prototype,"state",2);ca([p()],Ct.prototype,"data",2);ca([p()],Ct.prototype,"appState",2);ca([p()],Ct.prototype,"appData",2);Ct=ca([C("mateu-form")],Ct);var ad=Object.defineProperty,id=Object.getOwnPropertyDescriptor,Fe=(e,t,a,i)=>{for(var s=i>1?void 0:i?id(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&ad(t,a,s),s};let fe=class extends E{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.pagesRequested=[],this.emptyArray=e=>!e||e.length==0,this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;if(this.metadata?.infiniteScrolling&&e.page>0){let i=!1;a&&a.content&&(a.content.length>=(e.page+1)*e.pageSize||a.content.length==a.totalElements)&&(t(a.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),a.totalElements),i=!0,this.grid&&this.grid.recalculateColumnWidths()),i||this.pagesRequested.find(s=>s==e.page)||(this.pagesRequested.push(e.page),this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:e,callback:()=>{this.data[this.id]?.page?.content&&(t(this.data[this.id].page.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),this.data[this.id].page.totalElements),this.grid&&this.grid.recalculateColumnWidths())}},bubbles:!0,composed:!0})))}else{const i=this.metadata?.infiniteScrolling?a?.totalElements:a?.content?.length??0;t(a?.content??[],i),this.grid&&this.grid.recalculateColumnWidths()}},this._onActionRequested=e=>{const t=e.detail,a=this.identifierFieldName;if(!a||!t.parameters||t.actionId?.startsWith("action-on-row-"))return;const i=t.parameters[a];i!==void 0&&(this.state._selectedId=String(i),this._applyCellPartNameGenerator(),this.grid?.requestContentUpdate())},this.tooltipGenerator=e=>{let t="";const{column:a,item:i}=e,s=this.metadata?.columns?.find(r=>r.metadata.id==a?.path);if(s?.metadata){const r=(s?.metadata).tooltipPath;r&&a&&i&&(t=i[r])}return t}}get identifierFieldName(){const e=this.metadata?.columns?.find(a=>a.metadata?.identifier);if(e)return e.metadata?.id;if(this.metadata?.columns?.find(a=>a.metadata?.id==="id"))return"id"}_applyCellPartNameGenerator(){if(!this.grid)return;const e=this.identifierFieldName,t=this.state?._selectedId??this.appState?._splitDetailId;e&&t!==void 0?this.grid.cellPartNameGenerator=(a,i)=>String(i.item[e])===String(t)?"selected-row":"":this.grid.cellPartNameGenerator=null}connectedCallback(){super.connectedCallback(),this.addEventListener("action-requested",this._onActionRequested)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("action-requested",this._onActionRequested)}updated(e){super.updated(e),this._applyCellPartNameGenerator(),this.grid?.clearCache(),this.grid?.recalculateColumnWidths(),this.pagesRequested=[]}render(){const e=this.data[this.id]?.page;let t="";this.metadata?.wrapCellContent&&(t+=" wrap-cell-content"),this.metadata?.compact&&(t+=" compact"),this.metadata?.noBorder&&(t+=" no-border"),this.metadata?.noRowBorder&&(t+=" no-row-borders"),this.metadata?.columnBorders&&(t+=" column-borders"),this.metadata?.rowStripes&&(t+=" row-stripes");const a=this.state[this.id+"_selected_items"]||[];return o`
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
                    @selected-items-changed="${i=>{this.emptyArray(this.state[this.id+"_selected_items"])&&this.emptyArray(i.detail.value)||(this.state[this.id+"_selected_items"]=i.detail.value,this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0})))}}"
                    @active-item-changed="${R(this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?i=>{if(this.metadata?.detailPath){const s=i.detail.value;s?this.detailsOpenedItems=[s]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${R(this.metadata?.detailPath?Ki(i=>o`${$(this,i[this.metadata?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    theme="${t}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?o`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:d}
                ${this.metadata?.columns?.map(i=>oi(i,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}
                ${this.metadata?.useButtonForDetail?o`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${Je((i,{detailsOpened:s})=>o`
              <vaadin-button
                theme="tertiary icon"
                title="${s?"Collapse":"Expand"}"
                aria-label="Toggle details"
                aria-expanded="${s?"true":"false"}"
                @click="${()=>{this.detailsOpenedItems=s?this.detailsOpenedItems.filter(r=>r!==i):[...this.detailsOpenedItems,i]}}"
              >
                <vaadin-icon
                  .icon="${s?"lumo:angle-down":"lumo:angle-right"}"
                ></vaadin-icon>
              </vaadin-button>
            `,[])}
                    ></vaadin-grid-column>
                `:d}
                <span slot="empty-state">${xt(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(i=>i.metadata.tooltipPath)?o`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:d}
            </vaadin-grid>
            <slot></slot>
       `}};fe.styles=S`
        ${ht}
        vaadin-grid[data-clickable-rows]::part(row) {
            cursor: pointer;
        }
        vaadin-grid[data-clickable-rows]::part(row):hover {
            background-color: var(--lumo-primary-color-10pct);
        }
        vaadin-grid::part(selected-row) {
            background-color: var(--lumo-primary-color-10pct);
        }
  `;Fe([p()],fe.prototype,"id",2);Fe([p()],fe.prototype,"metadata",2);Fe([p()],fe.prototype,"baseUrl",2);Fe([p()],fe.prototype,"state",2);Fe([p()],fe.prototype,"data",2);Fe([p()],fe.prototype,"appState",2);Fe([p()],fe.prototype,"appData",2);Fe([p()],fe.prototype,"emptyStateMessage",2);Fe([y()],fe.prototype,"detailsOpenedItems",2);Fe([Ae("vaadin-grid")],fe.prototype,"grid",2);fe=Fe([C("mateu-table")],fe);var sd=Object.defineProperty,rd=Object.getOwnPropertyDescriptor,Ne=(e,t,a,i)=>{for(var s=i>1?void 0:i?rd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&sd(t,a,s),s};let be=class extends E{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.panelOpened=!1,this.draftText="",this.openPanel=()=>{this.panelOpened||this.filters.length===0||(this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1,this.activeFilter=void 0},this.clearAllFilters=()=>{const e=this.filters.flatMap(a=>this.isRangeFilter(a)?[`${a.fieldId}_from`,`${a.fieldId}_to`]:[a.fieldId]),t={searchText:void 0};e.forEach(a=>{t[a]=void 0}),this.state={...this.state,...t},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:e},bubbles:!0,composed:!0})),this.requestSearch()},this.keepFocus=e=>e.preventDefault()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get filters(){return this.metadata?.filters??[]}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}requestSearch(){this.closePanel(),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))}emitValueChanged(e,t){this.state={...this.state,[e]:t},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:e},bubbles:!0,composed:!0}))}applyFilter(e,t){this.emitValueChanged(e,t),this.requestSearch()}removeChip(e){const t=this.filters.find(a=>a.fieldId===e);t&&this.isRangeFilter(t)?(this.emitValueChanged(`${e}_from`,void 0),this.emitValueChanged(`${e}_to`,void 0)):this.emitValueChanged(e,e==="searchText"?"":void 0),this.requestSearch()}commitText(e){this.emitValueChanged("searchText",e.value),this.draftText="",e.value="",this.requestSearch()}isBooleanFilter(e){return e.dataType==="boolean"||e.dataType==="bool"||e.stereotype==="checkbox"||e.stereotype==="toggle"}isNumericFilter(e){return["integer","decimal","number","money"].includes(e.dataType??"")}isRangeFilter(e){return e.stereotype==="dateRange"||e.stereotype==="numberRange"}isMultiFilter(e){return e.stereotype==="multiSelect"}hasOptions(e){return(e.options?.length??0)>0}multiValues(e){const t=this.state[e.fieldId];return Array.isArray(t)?t.map(String):typeof t=="string"&&t!==""?t.split(",").map(a=>a.trim()).filter(a=>a):[]}rangeBound(e,t){const a=this.state[`${e.fieldId}_${t}`];return a==null?"":String(a)}isSet(e){if(this.isRangeFilter(e))return this.rangeBound(e,"from")!==""||this.rangeBound(e,"to")!=="";if(this.isMultiFilter(e))return this.multiValues(e).length>0;const t=this.state[e.fieldId];return t!=null&&t!==""&&!Number.isNaN(t)}getFilterDisplayValue(e,t){if(e.options?.length){const a=e.options.find(i=>i.value===String(t));if(a)return a.label??a.value}return typeof t=="boolean"?t?"Yes":"No":String(t)}conditionDisplay(e){if(this.isRangeFilter(e)){const t=this.rangeBound(e,"from"),a=this.rangeBound(e,"to");return t&&a?`${t} – ${a}`:t?`≥ ${t}`:`≤ ${a}`}return this.isMultiFilter(e)?this.multiValues(e).map(t=>this.getFilterDisplayValue(e,t)).join(", "):this.getFilterDisplayValue(e,this.state[e.fieldId])}labelOf(e){return Ce(e.label,this.state,this.data)||e.fieldId}panelRow(e,t,a="panel-row"){return o`
            <div class="${a}" @mousedown="${this.keepFocus}" @click="${t}">${e}</div>`}renderRangeWidget(e){const t=e.stereotype==="numberRange"?"number":e.dataType==="dateTime"?"datetime-local":e.dataType==="time"?"time":"date",a=s=>{const r=s.closest(".panel-input-row"),n=r.querySelector("input.range-from").value,l=r.querySelector("input.range-to").value;this.emitValueChanged(`${e.fieldId}_from`,n===""?void 0:n),this.emitValueChanged(`${e.fieldId}_to`,l===""?void 0:l),this.requestSearch()},i=s=>{s.key==="Enter"&&a(s.target),s.key==="Escape"&&this.closePanel()};return o`
            <div class="panel-input-row">
                <input class="range-from" type="${t}" placeholder="From"
                       .value="${this.rangeBound(e,"from")}"
                       @mousedown="${s=>s.stopPropagation()}"
                       @keydown="${i}"/>
                <span class="range-separator" aria-hidden="true">–</span>
                <input class="range-to" type="${t}" placeholder="To"
                       .value="${this.rangeBound(e,"to")}"
                       @mousedown="${s=>s.stopPropagation()}"
                       @keydown="${i}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${s=>a(s.target)}">Apply</button>
            </div>`}renderMultiWidget(e){const t=this.multiValues(e),a=i=>{const s=t.includes(i)?t.filter(r=>r!==i):[...t,i];this.emitValueChanged(e.fieldId,s.length>0?s:void 0),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))};return o`${(e.options??[]).map(i=>this.panelRow(o`
            <span class="multi-check ${t.includes(i.value)?"multi-check--on":""}"
                  aria-hidden="true">${t.includes(i.value)?"✓":""}</span>
            ${i.label??i.value}
        `,()=>a(i.value)))}`}renderActiveFilterWidget(e){if(this.isRangeFilter(e))return this.renderRangeWidget(e);if(this.isMultiFilter(e))return this.renderMultiWidget(e);if(this.hasOptions(e))return o`${e.options.map(i=>this.panelRow(i.label??i.value,()=>this.applyFilter(e.fieldId,i.value)))}`;if(this.isBooleanFilter(e))return o`
                ${this.panelRow("Yes",()=>this.applyFilter(e.fieldId,!0))}
                ${this.panelRow("No",()=>this.applyFilter(e.fieldId,!1))}`;const t=this.isNumericFilter(e),a=i=>{i.value!==""&&this.applyFilter(e.fieldId,t?Number(i.value):i.value)};return o`
            <div class="panel-input-row">
                <input type="${t?"number":"text"}"
                       placeholder="${e.placeholder||this.labelOf(e)}"
                       @mousedown="${i=>i.stopPropagation()}"
                       @keydown="${i=>{i.key==="Enter"&&a(i.target),i.key==="Escape"&&this.closePanel()}}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${i=>a(i.target.previousElementSibling)}">Apply</button>
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
                                    @click="${a=>{a.stopPropagation(),this.removeChip(t.fieldId)}}">✕</button>
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
        `}};be.styles=S`
        ${ht}
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
    `;Ne([p()],be.prototype,"metadata",2);Ne([p()],be.prototype,"baseUrl",2);Ne([y()],be.prototype,"state",2);Ne([y()],be.prototype,"data",2);Ne([p()],be.prototype,"appState",2);Ne([p()],be.prototype,"appData",2);Ne([p({type:Boolean})],be.prototype,"searchOnly",2);Ne([y()],be.prototype,"panelOpened",2);Ne([y()],be.prototype,"activeFilter",2);Ne([y()],be.prototype,"draftText",2);be=Ne([C("mateu-filter-bar")],be);var od=Object.defineProperty,nd=Object.getOwnPropertyDescriptor,ua=(e,t,a,i)=>{for(var s=i>1?void 0:i?nd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&od(t,a,s),s};let St=class extends E{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.totalPages=0}updated(e){super.updated(e),(e.has("totalElements")||e.has("pageSize"))&&(this.totalPages=Math.ceil(this.totalElements/this.pageSize))}dispatch(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return d;const e=this.totalPages>1,t=this.pageNumber,a=t===0,i=t>=this.totalPages-1;return o`
            <vaadin-horizontal-layout theme="spacing" style="align-items: center; flex-wrap: wrap;">
                ${e?o`
                    <vaadin-button theme="tertiary icon" title="First page" ?disabled="${a}"
                        @click="${()=>this.dispatch(0)}" data-testid="page-first">
                        <vaadin-icon icon="vaadin:angle-double-left"></vaadin-icon>
                    </vaadin-button>
                    <vaadin-button theme="tertiary icon" title="Previous page" ?disabled="${a}"
                        @click="${()=>this.dispatch(t-1)}" data-testid="page-prev">
                        <vaadin-icon icon="vaadin:angle-left"></vaadin-icon>
                    </vaadin-button>
                    <span class="page-indicator">Page ${t+1} of ${this.totalPages}</span>
                    <vaadin-button theme="tertiary icon" title="Next page" ?disabled="${i}"
                        @click="${()=>this.dispatch(t+1)}" data-testid="page-next">
                        <vaadin-icon icon="vaadin:angle-right"></vaadin-icon>
                    </vaadin-button>
                    <vaadin-button theme="tertiary icon" title="Last page" ?disabled="${i}"
                        @click="${()=>this.dispatch(this.totalPages-1)}" data-testid="page-last">
                        <vaadin-icon icon="vaadin:angle-double-right"></vaadin-icon>
                    </vaadin-button>
                    <span class="separator"></span>
                `:d}
                <span class="total-count">${this.totalElements} item${this.totalElements===1?"":"s"}</span>
                <slot></slot>
            </vaadin-horizontal-layout>
        `}};St.styles=S`
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
    `;ua([p()],St.prototype,"totalElements",2);ua([p()],St.prototype,"pageSize",2);ua([p()],St.prototype,"pageNumber",2);ua([y()],St.prototype,"totalPages",2);St=ua([C("mateu-pagination")],St);var ld=Object.defineProperty,dd=Object.getOwnPropertyDescriptor,Ie=(e,t,a,i)=>{for(var s=i>1?void 0:i?dd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&ld(t,a,s),s};let re=class extends E{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;t(a?.content??[],a?.content?.length??0)},this.respondToVisibility=(e,t)=>{var a={root:document.documentElement},i=new IntersectionObserver(s=>{s.forEach(r=>{t(r.intersectionRatio>0)})},a);i.observe(e)},this.keepAsking=!1,this.askToUpper=()=>{const e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?hi(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?o`<vaadin-card
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
                    <span slot="header-suffix" theme="badge ${za(e.status.type)}">${e.status.message}</span>
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
       `}};re.styles=S`
        ${ht}
        
        .card-container {
            display: flex; 
            width: 100%; 
            flex-wrap: wrap; 
            gap: 10px;
        }

        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }

    `;Ie([p()],re.prototype,"id",2);Ie([p()],re.prototype,"metadata",2);Ie([p()],re.prototype,"baseUrl",2);Ie([p()],re.prototype,"state",2);Ie([p()],re.prototype,"data",2);Ie([p()],re.prototype,"appState",2);Ie([p()],re.prototype,"appData",2);Ie([p()],re.prototype,"emptyStateMessage",2);Ie([y()],re.prototype,"keepAsking",2);Ie([Ae("#ask-for-more")],re.prototype,"askForMore",2);Ie([y()],re.prototype,"hasMore",2);re=Ie([C("mateu-card-list")],re);var ws=(e=>(e.none="none",e.success="success",e.error="error",e.warning="warning",e.contrast="contrast",e.normal="normal",e))(ws||{}),ks=(e=>(e.primary="primary",e.secondary="secondary",e.tertiary="tertiary",e.tertiaryInline="tertiaryInline",e))(ks||{}),cd=Object.defineProperty,ud=Object.getOwnPropertyDescriptor,qe=(e,t,a,i)=>{for(var s=i>1?void 0:i?ud(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&cd(t,a,s),s};const hd={asc:"ascending",desc:"descending"};let ge=class extends E{constructor(){super(...arguments),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this.search=()=>{const e=this.component.metadata;this.state={...this.state,size:e.pageSize,page:0,crud_selected_items:[]},this._syncStateToUrl(e),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}}},bubbles:!0,composed:!0}))},this.notify=e=>{ra.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.handleSearchRequested=e=>{this.state={...this.state,crud_selected_items:[]};const t=this.component.metadata;this._syncStateToUrl(t),!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}},callback:e},bubbles:!0,composed:!0}))},this.fetchMoreElements=e=>{const{params:t,callback:a}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(a)},this.directionChanged=e=>{const t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(a=>({fieldId:a.__data.path,direction:a.__data.direction?hd[a.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForComponentId=void 0,this.evalLabel=e=>Ce(e,this.state,this.data),this.handleToolbarButtonClick=e=>{if(e==="import"){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{const t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"process-import",parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get cols(){return this.component?.metadata?.columns?.map(t=>t.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.component?.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":fs(this.cols,this.availableWidthPx):t}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}_filterIds(e){return new Set(["searchText",...(e.filters??[]).flatMap(t=>t.stereotype==="dateRange"||t.stereotype==="numberRange"?[`${t.fieldId}_from`,`${t.fieldId}_to`]:[t.fieldId])])}_syncStateToUrl(e){const t=this._filterIds(e),a=new URLSearchParams(window.location.search);t.forEach(l=>a.delete(l)),a.delete("page"),a.delete("sort"),t.forEach(l=>{const c=this.state[l];c!=null&&c!==""&&a.set(l,String(c))});const i=this.state.page;i&&i>0&&a.set("page",String(i));const s=this.state.sort;if(s&&s.length>0){const l=s.filter(c=>c.fieldId&&c.direction).map(c=>`${c.fieldId}:${c.direction}`).join(",");l&&a.set("sort",l)}const r=a.toString(),n=r?`${window.location.pathname}?${r}`:window.location.pathname;window.location.pathname+window.location.search!==n&&history.replaceState(null,"",n)}_initStateFromUrl(e,t){const a=new URLSearchParams(window.location.search),i=this._filterIds(e),s={...t};a.forEach((l,c)=>{i.has(c)&&(s[c]=l)});const r=a.get("page");if(r!==null){const l=parseInt(r,10);!isNaN(l)&&l>0&&(s.page=l)}const n=a.get("sort");if(n){const l=n.split(",").map(c=>{const[u,m]=c.split(":");return u&&m?{fieldId:u,direction:m}:null}).filter(Boolean);l.length>0&&(s.sort=l)}return s}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}updated(e){if(super.updated(e),e.has("component")){const t=this.component?.id;if(t!==this._initializedForComponentId){this._initializedForComponentId=t;const a=this.component?.metadata,i=a.initialPage&&a.initialPage>0?a.initialPage:0;this.state=this._initStateFromUrl(a,{...this.state,size:a.pageSize,page:i,sort:[]}),(this.state.page!==i||this.state.sort?.length>0||[...this._filterIds(a)].some(r=>this.state[r]!=null))&&this.handleSearchRequested(void 0)}}}render(){const e=w=>{const z=[];return w.color&&w.color!==ws.normal&&z.push(w.color),w.buttonStyle&&z.push(w.buttonStyle===ks.tertiaryInline?"tertiary-inline":w.buttonStyle),z.length?z.join(" "):void 0},t=w=>w==="back"||w==="backToList"||!!w&&w.startsWith("cancel"),a=w=>{const z=K.get()?.renderToolbarButton?.(w,this.evalLabel(w.label),()=>this.handleToolbarButtonClick(w.actionId));return z||o`
                <vaadin-button
                        data-action-id="${w.id}"
                        theme="${e(w)||d}"
                        @click="${()=>this.handleToolbarButtonClick(w.actionId)}"
                >${this.evalLabel(w.label)}</vaadin-button>
            `};if(!this.component)return o`no component`;const i=this.component.metadata;i.serverSideOrdering=!0;const s=i?.toolbar??[],r=s.filter(w=>t(w.actionId)),n=s.filter(w=>!t(w.actionId)),l=r.length>0&&n.length>0,c=!!i?.title||!!i?.subtitle||s.length>0,u=this.effectiveGridLayout,m=this.cols,v=Za(m),f=this.data[this.id]?.page?.content??[],b=this.state[this.component?.id]?.emptyStateMessage,x=(w,z)=>{const I=z[w.id];if(I==null)return o``;if(w.dataType==="status"){const Y=za(I.type);return o`<span theme="badge pill ${Y}">${I.message}</span>`}return w.dataType==="bool"?o`${I?"✓":"✗"}`:typeof I=="object"?o`${I.label??I.name??I.message??""}`:o`${I}`},g=()=>{const w=this.identifierFieldName,z=this.state._selectedId??this.appState?._splitDetailId,I=v.find(O=>O.identifier)??v[0],Y=O=>O.dataType==="action"||O.dataType==="actionGroup"||O.dataType==="menu"||O.stereotype==="button",bt=v.filter(O=>O!==I&&!Y(O)),Rt=m.filter(O=>Y(O)),it=(O,ae,xe)=>{O.stopPropagation(),O.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:ae,parameters:{_clickedRow:xe}},bubbles:!0,composed:!0}))},Lt=O=>{const ae=[];for(const xe of Rt){const F=O[xe.id];if(xe.dataType==="action"){const A=F?.methodNameInCrud?F:O.action?.methodNameInCrud?O.action:{methodNameInCrud:xe.id,label:xe.label,icon:null};ae.push(o`
                            <vaadin-button theme="tertiary small" title="${A.label||d}"
                                @click="${k=>it(k,"action-on-row-"+A.methodNameInCrud,O)}">
                                ${A.icon?o`<vaadin-icon icon="${A.icon}"></vaadin-icon>`:d}
                                ${A.label??d}
                            </vaadin-button>`)}else(xe.dataType==="actionGroup"||xe.dataType==="menu")&&(F?.actions??[]).forEach(k=>ae.push(o`
                            <vaadin-button theme="tertiary small" title="${k.label||d}"
                                @click="${H=>it(H,"action-on-row-"+k.methodNameInCrud,O)}">
                                ${k.icon?o`<vaadin-icon icon="${k.icon}"></vaadin-icon>`:d}
                                ${k.label??d}
                            </vaadin-button>`))}return ae.length?o`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${ae}
                    </div>`:d};return o`
                <vaadin-list-box style="width: 100%;">
                    ${f.length===0?o`<vaadin-item disabled>${xt(b)}</vaadin-item>`:d}
                    ${f.map(O=>o`
                        <vaadin-item
                            ?selected="${w&&z!==void 0&&String(O[w])===String(z)}"
                            @click="${()=>{w&&O[w]!==void 0&&(this.state={...this.state,_selectedId:String(O[w])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:O},bubbles:!0,composed:!0}))}}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${I?O[I.id]??"":""}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${bt.map(ae=>o`<span>${ae.label}: ${x(ae,O)}</span>`)}
                            </div>
                            ${Lt(O)}
                        </vaadin-item>
                    `)}
                </vaadin-list-box>`},_=(w,z,I)=>{const Y=this.identifierFieldName;Y&&I[Y]!==void 0&&(this.state={...this.state,_selectedId:String(I[Y])}),w.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:z,parameters:I},bubbles:!0,composed:!0}))},P=()=>{const w=this.identifierFieldName,z=this.state._selectedId??this.appState?._splitDetailId,I=m.slice(0,6),Y=I.filter(k=>k.stereotype==="image"),bt=I.find(k=>k.identifier)??I[0],Rt=k=>!!k.actionId,it=k=>k.dataType==="action"||k.dataType==="actionGroup"||k.dataType==="menu"||k.stereotype==="button",Lt=I.find(k=>k.id==="select"&&k.dataType==="action"),O=!!Lt,ae=I.filter(k=>k!==bt&&!Y.includes(k)&&!Rt(k)&&!it(k)),xe=I.filter(k=>it(k)&&!(O&&k===Lt)),F=(k,H,st)=>{k.stopPropagation(),k.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:H,parameters:{_clickedRow:st}},bubbles:!0,composed:!0}))},A=k=>{const H=[];for(const st of xe){const ja=k[st.id];if(st.dataType==="action"){const zt=ja?.methodNameInCrud?ja:k.action?.methodNameInCrud?k.action:{methodNameInCrud:st.id,label:st.label,icon:null};H.push(o`
                            <vaadin-button theme="tertiary" title="${zt.label||d}"
                                @click="${gt=>F(gt,"action-on-row-"+zt.methodNameInCrud,k)}">
                                ${zt.icon?o`<vaadin-icon icon="${zt.icon}"></vaadin-icon>`:d}
                                ${zt.label??d}
                            </vaadin-button>`)}else(st.dataType==="actionGroup"||st.dataType==="menu")&&(ja?.actions??[]).forEach(gt=>H.push(o`
                            <vaadin-button theme="tertiary" title="${gt.label||d}"
                                @click="${Os=>F(Os,"action-on-row-"+gt.methodNameInCrud,k)}">
                                ${gt.icon?o`<vaadin-icon icon="${gt.icon}"></vaadin-icon>`:d}
                                ${gt.label??d}
                            </vaadin-button>`))}return H.length?o`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${H}
                    </div>`:d};return o`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${f.length===0?o`<div style="grid-column: 1 / -1;">${xt(b)}</div>`:d}
                    ${f.map(k=>o`
                        <vaadin-card
                            clickable
                            ?data-selected="${w&&z!==void 0&&String(k[w])===String(z)}"
                            style="cursor: pointer;"
                            @click="${H=>O?F(H,"action-on-row-select",k):_(H.target,"view",k)}"
                        >
                            ${Y.length?o`<img slot="media" src="${k[Y[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover;" />`:d}
                            ${bt?o`<div slot="title">${k[bt.id]??""}</div>`:d}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${ae.map(H=>o`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${H.label}</span>
                                        <span>${x(H,k)}</span>
                                    </div>
                                `)}
                            </div>
                            ${A(k)}
                        </vaadin-card>
                    `)}
                </div>`},D=()=>{const w=v.find(I=>I.identifier)??v[0],z=v.filter(I=>I!==w);return o`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <vaadin-list-box style="width: 100%;">
                            ${f.length===0?o`<vaadin-item disabled>${xt(b)}</vaadin-item>`:d}
                            ${f.map(I=>o`
                                <vaadin-item
                                    ?selected="${this.selectedItem===I}"
                                    @click="${()=>{this.selectedItem=I}}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${w?I[w.id]??"":""}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${z.map(Y=>o`${x(Y,I)} `)}
                                    </div>
                                </vaadin-item>
                            `)}
                        </vaadin-list-box>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?o`
                            <vaadin-form-layout>
                                ${m.map(I=>o`
                                    <vaadin-text-field
                                        label="${I.label}"
                                        .value="${String(this.selectedItem[I.id]??"")}"
                                        readonly
                                    ></vaadin-text-field>
                                `)}
                            </vaadin-form-layout>
                        `:o`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},J=()=>{const w=this.identifierFieldName,z=this.state._selectedId??this.appState?._splitDetailId,I=m[0],Y=m.slice(1),bt=!!I?.actionId,Rt=F=>(F??[]).map(A=>{const k=Array.isArray(A.children)?A.children:[];return k.length>0?{...A,children:Rt(k)}:{...A,children:void 0}}),it=Rt(f),Lt=(F,A)=>{const k=F.parentItem?F.parentItem.children??[]:it;A(k,k.length)},O=(F,A)=>{for(const k of F??[]){if(w&&String(k[w])===A)return k;const H=O(k.children,A);if(H)return H}},ae=w&&z!==void 0?O(it,String(z)):void 0,xe=(F,A,k)=>{F.stopPropagation(),w&&A[w]!==void 0&&(this.state={...this.state,_selectedId:String(A[w])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:k,parameters:A},bubbles:!0,composed:!0}))};return o`
                <vaadin-grid
                    style="width: 100%;"
                    all-rows-visible
                    .itemHasChildrenPath="${"children"}"
                    .itemIdPath="${w??"id"}"
                    .dataProvider="${Lt}"
                    .selectedItems="${ae?[ae]:[]}"
                >
                    ${I?o`<vaadin-grid-tree-column path="${I.id}" header="${I.label??d}" flex-grow="1"></vaadin-grid-tree-column>`:d}
                    ${bt?o`
                    <vaadin-grid-column width="6rem" flex-grow="0" text-align="end" ${Je(F=>F?.viewable===!1?d:o`
                        <vaadin-button theme="tertiary small" @click="${A=>xe(A,F,"view")}">View</vaadin-button>
                    `,[])}></vaadin-grid-column>`:d}
                    ${Y.map(F=>F.id==="select"?o`<vaadin-grid-column width="7rem" flex-grow="0" text-align="end" header="${F.label??d}" ${Je(A=>o`
                            <vaadin-button theme="tertiary small" @click="${k=>{k.stopPropagation(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-select",parameters:{_clickedRow:A}},bubbles:!0,composed:!0}))}}">Select</vaadin-button>
                        `,[])}></vaadin-grid-column>`:o`<vaadin-grid-column path="${F.id}" header="${F.label??d}" auto-width></vaadin-grid-column>`)}
                    <span slot="empty-state">${xt(b)}</span>
                </vaadin-grid>`},V=K.get()?.rendersCrudLayouts?.()===!0,ee=o`
            ${i.infiniteScrolling?o`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:d}
            ${!V&&u==="list"?g():!V&&u==="cards"?i.contentHeight?o`
                <vaadin-scroller style="width: 100%; height: ${i.contentHeight};">
                    ${P()}
                </vaadin-scroller>
            `:P():!V&&u==="masterDetail"?D():!V&&u==="tree"?J():K.get()?.renderTableComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,le=i.infiniteScrolling?d:K.get()?.renderPagination(this,this.component),te=o`
            <vaadin-dialog
                .opened="${this.showImportDialog}"
                header-title="Import"
                @opened-changed="${w=>{this.showImportDialog=w.detail.value}}"
                ${Ra(()=>o`
                    <vaadin-upload
                        target="/upload"
                        max-files="1"
                        @upload-success="${this.handleImportUploadSuccess}"
                    ></vaadin-upload>
                `,[this.showImportDialog])}
                ${ii(()=>o`
                    <vaadin-button @click="${()=>{this.showImportDialog=!1}}">Cancel</vaadin-button>
                `,[])}
            ></vaadin-dialog>
        `;return this.standalone?o`
                ${te}
                <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); width: 100%; box-sizing: border-box; padding: var(--lumo-space-m); display: flex; flex-direction: column;">
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
                    <div style="flex-shrink: 0;">${K.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                    <div style="flex: 1; overflow-y: auto; min-height: 0;">${ee}</div>
                    <div style="flex-shrink: 0;">${le}</div>
                </div>
            `:o`
            ${te}
            ${c?o`
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m, 1rem);">
                        <div style="flex: 1; min-width: 0;">
                            ${i?.title?o`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(i.title)}</h2>
                            `:d}
                            ${i?.subtitle?o`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(i.subtitle)}</span>
                            `:d}
                        </div>
                        ${r.map(w=>a(w))}
                        ${l?o`<span class="toolbar-divider"></span>`:d}
                        ${n.map(w=>a(w))}
                        <slot></slot>
                    </div>
                `:d}
            <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); padding: var(--lumo-space-m); display: flex; flex-direction: column;">
                <div style="flex-shrink: 0;">${K.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                <div style="flex: 1; overflow-y: auto; min-height: 0;">${ee}</div>
                <div style="flex-shrink: 0;">${le}</div>
            </div>
        `}createRenderRoot(){return K.mustUseShadowRoot()?super.createRenderRoot():this}};ge.styles=S`
        ${ht}
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
    `;qe([p()],ge.prototype,"component",2);qe([p()],ge.prototype,"baseUrl",2);qe([p({type:Boolean})],ge.prototype,"standalone",2);qe([p()],ge.prototype,"state",2);qe([p()],ge.prototype,"data",2);qe([p()],ge.prototype,"appState",2);qe([p()],ge.prototype,"appData",2);qe([y()],ge.prototype,"showImportDialog",2);qe([y()],ge.prototype,"availableWidthPx",2);qe([y()],ge.prototype,"selectedItem",2);ge=qe([C("mateu-table-crud")],ge);var pd=Object.defineProperty,md=Object.getOwnPropertyDescriptor,qa=(e,t,a,i)=>{for(var s=i>1?void 0:i?md(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&pd(t,a,s),s};let Mt=class extends E{constructor(){super(...arguments),this.notificationOpened=!1,this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1,this.error=e.detail.reason,this.openNotification()},this.openNotification=()=>{this.notificationOpened=!0},this.closeNotification=()=>{this.notificationOpened=!1},this.notificationRenderer=()=>o`
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
                ${Hi(this.notificationRenderer,[])}
        ></vaadin-notification>`}};Mt.styles=S`
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
  `;qa([y()],Mt.prototype,"loading",2);qa([y()],Mt.prototype,"notificationOpened",2);qa([y()],Mt.prototype,"error",2);Mt=qa([C("mateu-api-caller")],Mt);var vd=Object.defineProperty,fd=Object.getOwnPropertyDescriptor,He=(e,t,a,i)=>{for(var s=i>1?void 0:i?fd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&vd(t,a,s),s};let _e=class extends E{constructor(){super(...arguments),this.message="This website uses cookies.",this.dismiss="Ok. Thanks :).",this.learnMore="Learn more",this.learnMoreLink="https://cookiesandyou.com/",this.showLearnMore=!0,this.position="top",this.cookieName="mateu-cookieconsent"}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement("style"),this._css.innerText=".cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}",document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){const e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){const e=this.popup;e&&(e.classList.remove("cc-invisible"),e.style.display="")}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:"#000"},button:{background:"rgba(22, 118, 243, 0.95)",hover:"rgba(22, 118, 243, 1)"}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});const e=this.popup;if(e){e.setAttribute("role","alert");const t=e.querySelector("a.cc-btn");t?.addEventListener("keydown",a=>{const r=a.keyCode||a.which;(r===32||r===13)&&t.click()})}}render(){return o`
       `}};_e.styles=S`
  `;He([p()],_e.prototype,"message",2);He([p()],_e.prototype,"dismiss",2);He([p()],_e.prototype,"learnMore",2);He([p()],_e.prototype,"learnMoreLink",2);He([p()],_e.prototype,"showLearnMore",2);He([p()],_e.prototype,"position",2);He([p()],_e.prototype,"cookieName",2);He([y()],_e.prototype,"_css",2);He([Ae('[aria-label="cookieconsent"]')],_e.prototype,"popup",2);_e=He([C("mateu-cookie-consent")],_e);var bd=Object.defineProperty,gd=Object.getOwnPropertyDescriptor,Cs=(e,t,a,i)=>{for(var s=i>1?void 0:i?gd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&bd(t,a,s),s};let Ta=class extends E{constructor(){super(...arguments),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener("value-changed",this.redispatchEvent),this.addEventListener("data-changed",this.redispatchEvent),this.addEventListener("action-requested",this.redispatchEvent),this.addEventListener("server-side-action-requested",this.redispatchEvent),this.addEventListener("route-changed",this.redispatchEvent),this.addEventListener("close-modal-requested",this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("value-changed",this.redispatchEvent),this.removeEventListener("data-changed",this.redispatchEvent),this.removeEventListener("action-requested",this.redispatchEvent),this.removeEventListener("server-side-action-requested",this.redispatchEvent),this.removeEventListener("route-changed",this.redispatchEvent)}render(){return o`<slot></slot>`}};Ta.styles=S`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `;Cs([p()],Ta.prototype,"target",2);Ta=Cs([C("mateu-event-interceptor")],Ta);var $d=Object.defineProperty,yd=Object.getOwnPropertyDescriptor,Ss=(e,t,a,i)=>{for(var s=i>1?void 0:i?yd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&$d(t,a,s),s};let Pa=class extends vt{constructor(){super(...arguments),this.opened=!0,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),500)}}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}render(){const e=this.component.metadata;let t="";e.noPadding&&(t+=" no-padding");const a=si(e.headerTitle,this.state,this.data,this.appState,this.appData);return o`
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
                ${e.header||e.closeButtonOnHeader?As(()=>o`<mateu-event-interceptor .target="${this}" style="width: 100%;">${e.header?$(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):d}${e.closeButtonOnHeader?o`
                            <vaadin-button theme="tertiary" @click="${this.close}">
                                <vaadin-icon icon="lumo:cross"></vaadin-icon>
                            </vaadin-button>
                        `:d}</mateu-event-interceptor>`,[this.state,this.data]):d}
                ${e.footer?ii(()=>o`<mateu-event-interceptor .target="${this}" style="width: 100%;">${$(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):d}
                ${e.content?Ra(()=>o`<mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${$(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):d}
                style="${this.component?.style}" 
                class="${this.component?.cssClasses}"
        >
        </vaadin-dialog>

       `}};Pa.styles=S`
  `;Ss([y()],Pa.prototype,"opened",2);Pa=Ss([C("mateu-dialog")],Pa);var xd=Object.defineProperty,wd=Object.getOwnPropertyDescriptor,_s=(e,t,a,i)=>{for(var s=i>1?void 0:i?wd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&xd(t,a,s),s};let Oa=class extends vt{constructor(){super(...arguments),this.opened=!1,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),300)},this._escListener=e=>{if(e.key!=="Escape")return;const a=this.getRootNode().querySelectorAll("mateu-drawer, mateu-dialog");a[a.length-1]===this&&(e.stopPropagation(),this.close())}}firstUpdated(){requestAnimationFrame(()=>this.opened=!0)}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._escListener)}disconnectedCallback(){document.removeEventListener("keydown",this._escListener),super.disconnectedCallback()}render(){const e=this.component.metadata,t=e.position??"end",a=si(e.headerTitle,this.state,this.data,this.appState,this.appData);return o`
        ${e.modeless?d:o`
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
                ${a?o`<h3>${a}</h3>`:o`<span class="spacer"></span>`}
                ${e.header?o`
                    <mateu-event-interceptor .target="${this}">${$(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:d}
                <button class="drawer-close" aria-label="Close" @click="${this.close}">✕</button>
            </header>
            <div class="content ${e.noPadding?"no-padding":""}">
                ${e.content?o`
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${$(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:d}
            </div>
            ${e.footer?o`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${$(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                </footer>
            `:d}
        </section>
       `}};Oa.styles=S`
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
  `;_s([y()],Oa.prototype,"opened",2);Oa=_s([C("mateu-drawer")],Oa);var kd=Object.defineProperty,Cd=Object.getOwnPropertyDescriptor,ne=(e,t,a,i)=>{for(var s=i>1?void 0:i?Cd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&kd(t,a,s),s};function qi(e){if(e.parentElement)return e.parentElement;const t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}let Q=class extends E{constructor(){super(...arguments),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type==="keydown"){const t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{const t=e.detail,a=t.banners??[],i=t.append??!1;i?this.actionBanners=[...this.actionBanners,...a]:(this._clearActionBannerTimers(),this.actionBanners=a);const s=i?this.actionBanners.length-a.length:0;a.forEach((r,n)=>{if(r.timeoutSeconds&&r.timeoutSeconds>0){const l=s+n;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((c,u)=>u!==l)},r.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;const t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;const a=parseInt(t[1],10)-1;a>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(a))},this._onScrollSpy=()=>{if(this._tocLocked)return;const e=this._sectionCards();if(!e.length)return;const t=12,a=this.shadowRoot?.querySelector("mateu-content-header");let i=a?a.getBoundingClientRect().bottom:0;for(const n of e){if(!n.classList.contains("mateu-section--sticky"))continue;const l=n.getBoundingClientRect();l.top<=i+t+2&&(i=Math.max(i,l.bottom))}const s=i+t+4;let r=0;this._tocEntries.forEach((n,l)=>{n.el.getBoundingClientRect().top<=s&&(r=l)}),this._activeToc=r}}connectedCallback(){super.connectedCallback(),document.addEventListener("page-banners-received",this._bannersHandler),window.addEventListener("resize",this._onResize),document.addEventListener("keydown",this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("page-banners-received",this._bannersHandler),window.removeEventListener("resize",this._onResize),document.removeEventListener("keydown",this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy()}updated(e){super.updated(e),e.has("component")&&e.get("component")!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has("component")&&(this._scheduleStaticBannerTimeouts(),this.dispatchEvent(new CustomEvent("compact-changed",{detail:{compact:!!this.component?.style?.includes("--mateu-compact:1")},bubbles:!0,composed:!0})),this._scheduleTocRebuild())}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(a=>clearTimeout(a)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((a,i)=>{a.timeoutSeconds&&a.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,i])},a.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,a)=>a!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){const t=e.theme?.toLowerCase()??"info";return t==="none"?"":t}_evalBannerText(e){return Ce(e,this.state,this.data)}_renderBanner(e,t){const a=this._evalBannerText(e.title),i=this._evalBannerText(e.description);return o`
            <div class="page-banner page-banner--${this.bannerThemeClass(e)}">
                ${a||e.hasCloseButton?o`
                    <div style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span style="font-weight: 600;">${a??""}</span>
                        ${e.hasCloseButton?o`
                            <button class="banner-close" @click=${t} title="Dismiss" aria-label="Dismiss">✕</button>
                        `:d}
                    </div>
                `:d}
                ${i?o`<p>${i}</p>`:d}
            </div>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll(".mateu-section"))}_sectionTitle(e){const t=e.querySelector('[slot="title"]')?.textContent?.trim();return t||e.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()||void 0}_rebuildToc(){const e=this._sectionCards(),t=e.map(r=>({title:this._sectionTitle(r),el:r})).filter(r=>!!r.title),a=this.component?.metadata?.toc,i=t.length>4&&e.every(r=>!r.closest("vaadin-horizontal-layout")),s=(a===!0?!0:a===!1?!1:i)&&t.length>0;this._tocEntries=t,this._tocVisible=s,this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),s?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){const e=this.shadowRoot?.querySelector("mateu-content-header");this._headerH=this._tocVisible&&e?e.offsetHeight:0,this.style.setProperty("--mateu-header-h",this._headerH+"px");const t=12;let a=this._headerH+t;for(const i of this._sectionCards())i.classList.contains("mateu-section--sticky")&&(i.style.top=a+"px",a+=i.offsetHeight+t)}_scrollContainer(){let e=qi(this);for(;e;){const t=getComputedStyle(e).overflowY;if((t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight)return e;e=qi(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener("scroll",this._onScrollSpy,{passive:!0}),window.addEventListener("wheel",this._unlockToc,{passive:!0}),window.addEventListener("touchstart",this._unlockToc,{passive:!0}),window.addEventListener("keydown",this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener("scroll",this._onScrollSpy),window.removeEventListener("wheel",this._unlockToc),window.removeEventListener("touchstart",this._unlockToc),window.removeEventListener("keydown",this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){const t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;const a=12;let i=this._headerH+a;for(const l of this._sectionCards()){if(l===t.el)break;l.classList.contains("mateu-section--sticky")&&(i+=l.offsetHeight+a)}const s=this._scrollContainer(),r=s?s.getBoundingClientRect().top:0,n=t.el.getBoundingClientRect().top-r-i;(s??window).scrollBy({top:n,behavior:"smooth"})}render(){const e=this.component?.metadata,i=[...(e?.banners??[]).map((r,n)=>({banner:r,index:n})).filter(({index:r})=>!this.dismissedStaticBannerIndices.has(r)).map(({banner:r,index:n})=>({banner:r,onDismiss:()=>this._dismissStaticBanner(n)})),...this.actionBanners.map((r,n)=>({banner:r,onDismiss:()=>this._dismissActionBanner(n)}))],s=o`
            <mateu-content-header
                class="${this._tocVisible?"sticky-header":""}"
                .metadata="${e}"
                .baseUrl="${this.baseUrl}"
                .state="${this.state}"
                .data="${this.data}"
                .appState="${this.appState}"
                .appData="${this.appData}"
            ></mateu-content-header>
            ${i.length>0?o`
                <div class="page-banners">
                    ${i.map(({banner:r,onDismiss:n})=>this._renderBanner(r,n))}
                </div>
            `:d}
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
                ${e?.footer?.map(r=>$(this,r,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `;return o`<div style="display: flex; flex-direction: column; width: 100%;">${s}</div>`}};Q.styles=S`
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
    `;ne([p()],Q.prototype,"component",2);ne([p()],Q.prototype,"baseUrl",2);ne([p()],Q.prototype,"state",2);ne([p()],Q.prototype,"data",2);ne([p()],Q.prototype,"appState",2);ne([p()],Q.prototype,"appData",2);ne([p()],Q.prototype,"value",2);ne([p({type:Boolean})],Q.prototype,"standalone",2);ne([y()],Q.prototype,"actionBanners",2);ne([y()],Q.prototype,"dismissedStaticBannerIndices",2);ne([y()],Q.prototype,"_tocEntries",2);ne([y()],Q.prototype,"_activeToc",2);ne([y()],Q.prototype,"_tocVisible",2);Q=ne([C("mateu-page")],Q);const Ma=S`
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
`,Vt=e=>B`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,bi=Vt(B`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),gi=Vt(B`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),$i=Vt(B`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`),Sd=Vt(B`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`),_d=Vt(B`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`),Ed=Vt(B`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`);var Id=Object.defineProperty,Td=Object.getOwnPropertyDescriptor,M=(e,t,a,i)=>{for(var s=i>1?void 0:i?Td(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Id(t,a,s),s};const Mi=["#e91e63","#1676f3","#10b981","#8b5cf6","#f59e0b","#ef4444"],Pd=e=>Mi[Math.abs(e??0)%Mi.length],Od=e=>(e??"?").split(/\s+/).filter(t=>t).map(t=>t[0]).slice(0,2).join("").toUpperCase()||"?";let N=class extends E{constructor(){super(...arguments),this.localAgentUrl="http://127.0.0.1:8776",this.localAgentAlive=!1,this.menu=[],this.chatSessionId=ie(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onSpeechResult=e=>{if(this.recognition){const t=e,a=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=a,this.send(new CustomEvent("submit",{detail:{value:a},bubbles:!0,composed:!0})))}},this.probeLocalAgent=async()=>{if(this.localAgentUrl)try{const e=new AbortController,t=setTimeout(()=>e.abort(),1200),a=await fetch(this.localAgentUrl+"/health",{signal:e.signal});clearTimeout(t),this.localAgentAlive=a.ok}catch{this.localAgentAlive=!1}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{const t=e.target,a=Array.from(t.files??[]);if(t.value="",!(!a.length||!this.uploadUrl)){this.uploading=!0;try{const i=new FormData;i.append("sessionId",this.chatSessionId);for(const m of a)i.append("files",m,m.name);const s={},r=localStorage.getItem("__mateu_auth_token");r&&(s.Authorization="Bearer "+r);const n=sessionStorage.getItem("__mateu_sesion_id");n&&(s["X-Session-Id"]=n);const l=await fetch(this.uploadUrl,{method:"POST",headers:s,body:i});if(!l.ok)throw new Error(`Upload failed: ${l.status}`);const u=((await l.json()).files??[]).filter(m=>m&&m.path);this.attachments=[...this.attachments,...u]}catch(i){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${i instanceof Error?i.message:i}`,"agent")}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async e=>{this.messageInputElement?.setAttribute("disabled","disabled");const t=e.detail.value.trim(),a=this.localAgentAlive?this.localAgentUrl+"/mateu/agent/stream":this.sseUrl,i=this.attachments;if(!t&&i.length===0||!a)return;const s=i.length?`${t}${t?`

`:""}📎 ${i.map(l=>l.name).join(", ")}`:t;this.addMessage(s,"user"),this.attachments=[];const r=this.addMessage("","agent");this.startLoading();let n="";try{const l={Accept:"text/event-stream","Content-Type":"application/json"},c=localStorage.getItem("__mateu_auth_token");c&&(l.Authorization="Bearer "+c);const u=sessionStorage.getItem("__mateu_sesion_id");u&&(l["X-Session-Id"]=u);const m=this.contextProvider?.(),v=JSON.stringify({message:t,sessionId:this.chatSessionId,...i.length&&{attachments:i},...m!=null&&{context:m},...this.mcpUrl&&{mcpUrl:new URL(this.mcpUrl,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;const f=await fetch(a,{method:"POST",headers:l,body:v});if(!f.ok){const _=await f.text();throw new Error(`Servidor respondió ${f.status}: ${_}`)}const b=f.body?.getReader();if(!b)throw new Error("No se pudo obtener el reader del stream.");const x=new TextDecoder;let g="";for(;;){const{done:_,value:P}=await b.read();if(_){if(g.trim().startsWith("data:")){const ee=g.trim().slice(5).trim(),le=this.tryParseTokenUsage(ee),te=!le&&this.tryParseCustomEvent(ee);le?this.tokenUsage={...this.tokenUsage,...le}:te?te.event==="agent-error"?(n="⚠️ "+(te.detail?.message??"Error desconocido del agente"),this.updateMessage(r,n)):this.dispatchEvent(new CustomEvent(te.event,{detail:te.detail,bubbles:!0,composed:!0})):(n+=ee,this.updateMessage(r,n))}break}const D=x.decode(P,{stream:!0});g+=D;const J=g.split(`
`);g=J.pop()||"";let V=!1;for(const ee of J)if(ee.trim().startsWith("data:")){const le=ee.trim().slice(5).trim(),te=this.tryParseTokenUsage(le),w=!te&&this.tryParseCustomEvent(le);te?this.tokenUsage={...this.tokenUsage,...te}:w?w.event==="agent-error"?(n="⚠️ "+(w.detail?.message??"Error desconocido del agente"),this.updateMessage(r,n)):this.dispatchEvent(new CustomEvent(w.event,{detail:w.detail,bubbles:!0,composed:!0})):(n+=le+`
`,V=!0)}V&&this.updateMessage(r,n)}n||this.updateMessage(r,"⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).")}catch(l){console.error("Error en el flujo SSE:",l);const c=l?.message??String(l);(c==="Failed to fetch"||c==="network error"||c==="Load failed")&&!n?this.updateMessage(r,"⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible."):this.updateMessage(r,"⚠️ Error: "+c)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value="")},250),this.messageInputElement?.removeAttribute("disabled"),this.messageInputElement?.focus()}},this.closeChat=()=>{this.dispatchEvent(new CustomEvent("close-requested",{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{const e=this.messageInputElement?.value?.trim()??"";e&&this.send(new CustomEvent("submit",{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key==="Enter"&&(e.preventDefault(),this.submitFromInput())}}connectedCallback(){super.connectedCallback(),this.probeLocalAgent();const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){const t=new e;this.recognition=t,t.lang="es-ES",t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=a=>{console.error("Error de reconocimiento: "+a.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:"smooth"})},0)}addMessage(e,t){const a={text:e,time:new Date().toLocaleTimeString(),userName:t.includes("agent")?"Asistente":"Tú",userColorIndex:t.includes("agent")?2:1};return this.items=[...this.items,a],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((a,i)=>i===e?{...a,text:t}:a),this.scrollBottom()}tryParseCustomEvent(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const a=JSON.parse(t);if(typeof a.event=="string")return{event:a.event,detail:a.detail??{}}}catch{}return null}tryParseTokenUsage(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const a=JSON.parse(t);if("inputTokens"in a||"outputTokens"in a||"totalTokens"in a)return a}catch{}return null}buildMenuContext(e,t=[]){const a=[];for(const i of e){if(i.separator||i.remote)continue;const s=[...t,i.label];if(i.submenus&&i.submenus.length>0)a.push(...this.buildMenuContext(i.submenus,s));else{const r={path:s,navigation:{route:i.route,consumedRoute:i.consumedRoute,actionId:i.actionId??"",baseUrl:i.baseUrl,serverSideType:i.serverSideType,uriPrefix:i.uriPrefix}};i.description&&(r.description=i.description),a.push(r)}}return a}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}render(){return o`
            <div class="chat-container">
                <div class="chat-header">
                    <span class="chat-title">AI Assistant</span>
                    ${this.localAgentAlive?o`<span class="local-agent-badge" title="Hablando con tu CLI local (companion en ${this.localAgentUrl}) — sin api key">agente local</span>`:d}
                    <button class="chat-icon-btn" @click="${this.toggleExpanded}"
                            title="${this.expanded?"Contraer":"Expandir a pantalla completa"}"
                            aria-label="${this.expanded?"Contraer el chat":"Expandir el chat"}">
                        ${this.expanded?"⤡":"⤢"}
                    </button>
                    <button class="chat-close" @click="${this.closeChat}" title="Cerrar">
                        ${Ed}
                    </button>
                </div>
                <div class="scroll-container">
                    <div class="message-list" role="list">
                        ${this.items.map(e=>o`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${Pd(e.userColorIndex)};">${Od(e.userName)}</div>
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
                ${this.attachments.length?o`
                    <div class="attachments">
                        ${this.attachments.map(e=>o`
                            <span class="attachment-chip" title="${e.path}">
                                📎 ${e.name}
                                <button class="attachment-remove" @click="${()=>this.removeAttachment(e.path)}" aria-label="Quitar ${e.name}">✕</button>
                            </span>`)}
                    </div>
                `:d}
                <div class="input-bar">
                    ${this.uploadUrl?o`
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
                    >${_d}</button>
                    <input class="msg-input"
                           placeholder="Message"
                           aria-label="Message"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">Send</button>
                </div>
            </div>
        `}};N.styles=[Ma,S`
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
    `];M([p({attribute:!1})],N.prototype,"contextProvider",2);M([p()],N.prototype,"localAgentUrl",2);M([p({attribute:!1})],N.prototype,"mcpUrl",2);M([y()],N.prototype,"localAgentAlive",2);M([p()],N.prototype,"sseUrl",2);M([p()],N.prototype,"uploadUrl",2);M([p({attribute:!1})],N.prototype,"menu",2);M([y()],N.prototype,"attachments",2);M([y()],N.prototype,"uploading",2);M([Ae(".file-input")],N.prototype,"fileInputElement",2);M([p({type:Boolean,reflect:!0})],N.prototype,"expanded",2);M([p()],N.prototype,"items",2);M([Ae(".scroll-container")],N.prototype,"scrollContainer",2);M([Ae(".msg-input")],N.prototype,"messageInputElement",2);M([y()],N.prototype,"recognition",2);M([y()],N.prototype,"listening",2);M([y()],N.prototype,"recognitionAvailable",2);M([y()],N.prototype,"loading",2);M([y()],N.prototype,"elapsedSeconds",2);M([y()],N.prototype,"tokenUsage",2);N=M([C("mateu-chat")],N);var Rd=Object.defineProperty,Ld=Object.getOwnPropertyDescriptor,ha=(e,t,a,i)=>{for(var s=i>1?void 0:i?Ld(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Rd(t,a,s),s};let _t=class extends E{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.data&&this.createChart(this.data)}async createChart(e){const[{default:t}]=await Promise.all([me(()=>import("./vendor-chartjs.js").then(i=>i.a),[]),me(()=>import("./vendor-chartjs.js").then(i=>i.c),[])]);if(e!==this.data)return;this.chart&&this.chart.destroy();const a={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,a)}handleSlotChange(){}render(){return o`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};_t.styles=S`
  `;ha([p()],_t.prototype,"type",2);ha([p()],_t.prototype,"data",2);ha([p()],_t.prototype,"options",2);ha([Ae("#chart")],_t.prototype,"chartElement",2);_t=ha([C("mateu-chart")],_t);var zd=Object.defineProperty,Dd=Object.getOwnPropertyDescriptor,yi=(e,t,a,i)=>{for(var s=i>1?void 0:i?Dd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&zd(t,a,s),s};let sa=class extends E{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){const{default:t}=await me(async()=>{const{default:i}=await import("./vendor-diagrams.js").then(s=>s.i);return{default:i}},__vite__mapDeps([4,3,1,2]));if(e!==this.xml)return;this.chart&&this.chart.destroy();const a={container:this.divElement};this.chart=new t(a),this.chart.importXML(e)}handleSlotChange(){}render(){return o`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};sa.styles=S`
  `;yi([p()],sa.prototype,"xml",2);yi([Ae("#canvas")],sa.prototype,"divElement",2);sa=yi([C("mateu-bpmn")],sa);var Ad=Object.defineProperty,Fd=Object.getOwnPropertyDescriptor,Ht=(e,t,a,i)=>{for(var s=i>1?void 0:i?Fd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Ad(t,a,s),s};const Ga=160,Me=56,Nd=220,Ui=110,rt=60,qd={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},Md={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},Ud=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];function Bd(){return"step-"+Math.random().toString(36).slice(2,8)}let ut=class extends E{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.wf={name:"New Workflow",steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value")){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){const e=this.wf.steps??[],t={};e.forEach(n=>{t[n.id]=0});let a=!0;for(;a;)a=!1,e.forEach(n=>{if(n.preconditionStepId!=null&&t[n.preconditionStepId]!==void 0){const l=t[n.preconditionStepId]+1;l>t[n.id]&&(t[n.id]=l,a=!0)}});const i={};e.forEach(n=>{const l=t[n.id]??0;(i[l]??=[]).push(n.id)});const s={...this.positions};let r=!1;Object.entries(i).forEach(([n,l])=>{const c=Number(n);l.forEach((u,m)=>{s[u]||(s[u]={x:rt+c*Nd,y:rt+m*Ui},r=!0)})}),r&&(this.positions=s)}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addStep(){const e=Bd(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(s=>s.y),i=a.length?Math.max(...a)+Ui:rt;this.positions={...this.positions,[e]:{x:rt,y:i}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(i=>i.id!==e).map(i=>i.preconditionStepId===e?{...i,preconditionStepId:void 0}:i)};const{[e]:t,...a}=this.positions;this.positions=a,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},i=this.toSvgPoint(e);this.dragOffset={x:i.x-a.x,y:i.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(i=>i.x))+Ga+rt:600,a=e.length?Math.max(...e.map(i=>i.y))+Me+rt:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return o`
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
        `}renderToolbar(){const e=this.wf.status??"DRAFT";return o`
            <div class="toolbar">
                <span class="wf-name">${this.wf.name}</span>
                <span class="badge badge-${e.toLowerCase()}">${e}</span>
                <div style="flex:1"></div>
                <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                    ${bi}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${gi}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${$i}
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
        `}renderArrow(e){if(!e.preconditionStepId)return B``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return B``;const i=t.x+Ga,s=t.y+Me/2,r=a.x,n=a.y+Me/2,l=(i+r)/2;return B`
            <path d="M${i},${s} C${l},${s} ${l},${n} ${r},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:rt,y:rt},a=qd[e.type]??"#64748b",i=Md[e.type]??"•",s=this.selectedId===e.id;return B`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${r=>this.onNodeMouseDown(r,e.id)}"
               @click="${r=>{r.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${Ga}" height="${Me}" rx="8"
                      fill="white"
                      stroke="${s?a:"#e2e8f0"}"
                      stroke-width="${s?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${Me}" rx="8" fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${Me}" fill="${a}"/>
                <text x="16" y="${Me/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${i}</text>
                <!-- name -->
                <text x="44" y="${Me/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+"…":e.name}
                </text>
                <text x="44" y="${Me/2+8}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${Me/2+20}" font-size="9" fill="${a}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(i=>i.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(i=>i.id!==e.id),a=(i,s)=>o`
            <div class="field">
                <label class="field-label">${i}</label>
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
                    ${a("ID",o`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${a("Name",o`<input class="inp" .value="${e.name}"
                        @change="${i=>this.updateStep(e.id,{name:i.target.value})}"/>`)}
                    ${a("Type",o`
                        <select class="inp" @change="${i=>this.updateStep(e.id,{type:i.target.value})}">
                            ${Ud.map(i=>o`<option value="${i}" ?selected="${e.type===i}">${i}</option>`)}
                        </select>`)}
                    ${a("Description",o`<textarea class="inp" rows="2"
                        @change="${i=>this.updateStep(e.id,{description:i.target.value})}">${e.description??""}</textarea>`)}
                    ${a("Precondition step",o`
                        <select class="inp" @change="${i=>this.updateStep(e.id,{preconditionStepId:i.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(i=>o`<option value="${i.id}" ?selected="${e.preconditionStepId===i.id}">${i.name} (${i.id})</option>`)}
                        </select>`)}
                    ${a("Precondition expression",o`<input class="inp" placeholder="JEXL expression"
                        .value="${e.preconditionExpression??""}"
                        @change="${i=>this.updateStep(e.id,{preconditionExpression:i.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}"
                               @change="${i=>this.updateStep(e.id,{parallel:i.target.checked})}"/>
                    </div>
                    ${a("Timeout (ms)",o`<input class="inp" type="number" min="0"
                        .value="${String(e.timeout??0)}"
                        @change="${i=>this.updateStep(e.id,{timeout:Number(i.target.value)})}"/>`)}
                    ${a("Retries",o`<input class="inp" type="number" min="0"
                        .value="${String(e.retries??0)}"
                        @change="${i=>this.updateStep(e.id,{retries:Number(i.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}"
                               @change="${i=>this.updateStep(e.id,{rollbackable:i.target.checked})}"/>
                    </div>
                    ${e.rollbackable?a("Compensation step",o`
                        <select class="inp" @change="${i=>this.updateStep(e.id,{compensationStepId:i.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(i=>o`<option value="${i.id}" ?selected="${e.compensationStepId===i.id}">${i.name} (${i.id})</option>`)}
                        </select>`):""}

                    ${e.type==="ACTION"?a("Topic",o`<input class="inp" placeholder="kafka.topic.name"
                        .value="${e.topic??""}"
                        @change="${i=>this.updateStep(e.id,{topic:i.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?a("Form ID",o`<input class="inp"
                        .value="${e.formId??""}"
                        @change="${i=>this.updateStep(e.id,{formId:i.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?a("Child workflow ID",o`<input class="inp"
                        .value="${e.childWorkflowDefinitionId??""}"
                        @change="${i=>this.updateStep(e.id,{childWorkflowDefinitionId:i.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",i.click(),URL.revokeObjectURL(a)}};ut.styles=[Ma,S`
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
    `];Ht([p()],ut.prototype,"value",2);Ht([y()],ut.prototype,"wf",2);Ht([y()],ut.prototype,"positions",2);Ht([y()],ut.prototype,"selectedId",2);Ht([y()],ut.prototype,"showMeta",2);ut=Ht([C("mateu-workflow")],ut);var jd=Object.defineProperty,Wd=Object.getOwnPropertyDescriptor,et=(e,t,a,i)=>{for(var s=i>1?void 0:i?Wd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&jd(t,a,s),s};const Kt=160,Pe=56,ot=60,Vd={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},Hd={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},Gd=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];let Ka;const Kd=()=>(Ka||(Ka=me(()=>import("./vendor-diagrams.js").then(e=>e.e),__vite__mapDeps([4,3,1,2])).then(e=>new e.default)),Ka);function Jd(){return"step-"+Math.random().toString(36).slice(2,8)}let Le=class extends E{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.readOnly=!1,this.wf={name:"New Workflow",steps:[]},this.positions={},this.layoutReady=!1,this.selectedId=null,this.showMeta=!1,this.layoutError=null,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.elkPositioned=new Set,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.elkPositioned.add(this.draggingId),this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value"))try{const t=JSON.parse(this.value),a=new Set((this.wf.steps??[]).map(r=>r.id)),i=new Set((t.steps??[]).map(r=>r.id)),s=a.size!==i.size||[...i].some(r=>!a.has(r))||[...i].some(r=>{const n=(this.wf.steps??[]).find(c=>c.id===r),l=(t.steps??[]).find(c=>c.id===r);return n?.preconditionStepId!==l?.preconditionStepId});this.wf=t,(s||!this.layoutReady)&&this.runElkLayout()}catch{}}async runElkLayout(){const e=this.wf.steps??[];if(e.length===0){this.positions={},this.layoutReady=!0;return}const t={id:"root",layoutOptions:{"elk.algorithm":"layered","elk.direction":"RIGHT","elk.spacing.nodeNode":"40","elk.layered.spacing.nodeNodeBetweenLayers":"80","elk.edgeRouting":"ORTHOGONAL","elk.layered.nodePlacement.strategy":"BRANDES_KOEPF"},children:e.map(a=>({id:a.id,width:Kt,height:Pe})),edges:e.filter(a=>a.preconditionStepId).map(a=>({id:`${a.preconditionStepId}->${a.id}`,sources:[a.preconditionStepId],targets:[a.id]}))};try{const i=await(await Kd()).layout(t),s={...this.positions};for(const r of i.children??[])(!this.elkPositioned.has(r.id)||!s[r.id])&&(s[r.id]={x:(r.x??0)+ot,y:(r.y??0)+ot},this.elkPositioned.add(r.id));this.positions=s,this.layoutReady=!0,this.layoutError=null}catch(a){this.layoutError=a?.message??"ELK layout failed",this.layoutReady=!0}}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){const a=this.wf.steps.map(r=>r.id===e?{...r,...t}:r),i=this.wf.steps.find(r=>r.id===e),s=t.preconditionStepId!==void 0&&t.preconditionStepId!==i?.preconditionStepId;this.wf={...this.wf,steps:a},s&&(this.elkPositioned.clear(),this.runElkLayout()),this.emit()}addStep(){const e=Jd(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(i=>i.x);this.positions={...this.positions,[e]:{x:a.length?Math.max(...a)+Kt+80:ot,y:ot}},this.selectedId=e,this.elkPositioned.clear(),this.runElkLayout(),this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(i=>i.id!==e).map(i=>i.preconditionStepId===e?{...i,preconditionStepId:void 0}:i)};const{[e]:t,...a}=this.positions;this.positions=a,this.elkPositioned.delete(e),this.selectedId===e&&(this.selectedId=null),this.runElkLayout(),this.emit()}onNodeMouseDown(e,t){if(this.readOnly)return;e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},i=this.toSvgPoint(e);this.dragOffset={x:i.x-a.x,y:i.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}relayout(){this.elkPositioned.clear(),this.runElkLayout()}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(i=>i.x))+Kt+ot:600,a=e.length?Math.max(...e.map(i=>i.y))+Pe+ot:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){if(!this.layoutReady)return o`<div class="loading">Computing layout…</div>`;const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return o`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():""}
                ${this.layoutError?o`<div class="error">⚠ ${this.layoutError}</div>`:""}
                <div class="workspace">
                    <div class="canvas-wrap">
                        <svg width="${e}" height="${t}" class="canvas"
                             @click="${i=>{i.target===i.currentTarget&&(this.selectedId=null)}}">
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
                            ${a.map(i=>this.renderArrow(i))}
                            ${a.map(i=>this.renderNode(i))}
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
                    ${Sd}
                    Re-layout
                </button>
                ${this.readOnly?d:o`
                    <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                        ${bi}
                        Settings
                    </button>
                    <button class="nbtn primary" @click="${()=>this.addStep()}">
                        ${gi}
                        Add Step
                    </button>
                `}
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${$i}
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
        `}renderArrow(e){if(!e.preconditionStepId)return B``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return B``;const i=t.x+Kt,s=t.y+Pe/2,r=a.x,n=a.y+Pe/2,l=(i+r)/2;return B`
            <path d="M${i},${s} C${l},${s} ${l},${n} ${r},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:ot,y:ot},a=Vd[e.type]??"#64748b",i=Hd[e.type]??"•",s=this.selectedId===e.id,r=e.name.length>16?e.name.slice(0,15)+"…":e.name;return B`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${n=>this.onNodeMouseDown(n,e.id)}"
               @click="${n=>{n.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${Kt}" height="${Pe}" rx="8"
                      fill="white"
                      stroke="${s?a:"#e2e8f0"}"
                      stroke-width="${s?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge strip -->
                <rect x="0" y="0" width="32" height="${Pe}" rx="8"
                      fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${Pe}" fill="${a}"/>
                <text x="16" y="${Pe/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${i}</text>
                <!-- labels -->
                <text x="44" y="${Pe/2-6}" font-size="11"
                      fill="#1e293b" font-weight="600">${r}</text>
                <text x="44" y="${Pe/2+8}" font-size="9"
                      fill="#94a3b8">${e.id}</text>
                <text x="44" y="${Pe/2+20}" font-size="9"
                      fill="${a}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(s=>s.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(s=>s.id!==e.id),a=this.readOnly,i=(s,r)=>o`
            <div class="field">
                <label class="field-label">${s}</label>
                ${r}
            </div>
        `;return o`
            <div class="properties">
                <div class="prop-header">
                    <span>Step Properties</span>
                    ${a?d:o`<button class="del-btn" title="Delete step"
                            @click="${()=>this.deleteStep(e.id)}">🗑</button>`}
                    <button class="close-btn"
                            @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${i("ID",o`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${i("Name",o`<input class="inp" ?readonly="${a}" .value="${e.name}"
                        @change="${a?d:s=>this.updateStep(e.id,{name:s.target.value})}"/>`)}
                    ${i("Type",o`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?d:s=>this.updateStep(e.id,{type:s.target.value})}">
                            ${Gd.map(s=>o`
                                <option value="${s}" ?selected="${e.type===s}">${s}</option>`)}
                        </select>`)}
                    ${i("Description",o`<textarea class="inp" rows="2" ?readonly="${a}"
                        @change="${a?d:s=>this.updateStep(e.id,{description:s.target.value})}">${e.description??""}</textarea>`)}
                    ${i("Precondition step",o`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?d:s=>this.updateStep(e.id,{preconditionStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>o`
                                <option value="${s.id}" ?selected="${e.preconditionStepId===s.id}">
                                    ${s.name} (${s.id})
                                </option>`)}
                        </select>`)}
                    ${i("Precondition expression",o`
                        <input class="inp" placeholder="JEXL expression" ?readonly="${a}"
                               .value="${e.preconditionExpression??""}"
                               @change="${a?d:s=>this.updateStep(e.id,{preconditionExpression:s.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}" ?disabled="${a}"
                               @change="${a?d:s=>this.updateStep(e.id,{parallel:s.target.checked})}"/>
                    </div>
                    ${i("Timeout (ms)",o`
                        <input class="inp" type="number" min="0" ?readonly="${a}"
                               .value="${String(e.timeout??0)}"
                               @change="${a?d:s=>this.updateStep(e.id,{timeout:Number(s.target.value)})}"/>`)}
                    ${i("Retries",o`
                        <input class="inp" type="number" min="0" ?readonly="${a}"
                               .value="${String(e.retries??0)}"
                               @change="${a?d:s=>this.updateStep(e.id,{retries:Number(s.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}" ?disabled="${a}"
                               @change="${a?d:s=>this.updateStep(e.id,{rollbackable:s.target.checked})}"/>
                    </div>
                    ${e.rollbackable?i("Compensation step",o`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?d:s=>this.updateStep(e.id,{compensationStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>o`
                                <option value="${s.id}" ?selected="${e.compensationStepId===s.id}">
                                    ${s.name} (${s.id})
                                </option>`)}
                        </select>`):""}
                    ${e.type==="ACTION"?i("Topic",o`
                        <input class="inp" placeholder="kafka.topic.name" ?readonly="${a}"
                               .value="${e.topic??""}"
                               @change="${a?d:s=>this.updateStep(e.id,{topic:s.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?i("Form ID",o`
                        <input class="inp" ?readonly="${a}" .value="${e.formId??""}"
                               @change="${a?d:s=>this.updateStep(e.id,{formId:s.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?i("Child workflow ID",o`
                        <input class="inp" ?readonly="${a}" .value="${e.childWorkflowDefinitionId??""}"
                               @change="${a?d:s=>this.updateStep(e.id,{childWorkflowDefinitionId:s.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",i.click(),URL.revokeObjectURL(a)}};Le.styles=[Ma,S`
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
    `];et([p()],Le.prototype,"value",2);et([p({type:Boolean})],Le.prototype,"readOnly",2);et([y()],Le.prototype,"wf",2);et([y()],Le.prototype,"positions",2);et([y()],Le.prototype,"layoutReady",2);et([y()],Le.prototype,"selectedId",2);et([y()],Le.prototype,"showMeta",2);et([y()],Le.prototype,"layoutError",2);Le=et([C("mateu-workflow-elk")],Le);var Yd=Object.defineProperty,Xd=Object.getOwnPropertyDescriptor,pa=(e,t,a,i)=>{for(var s=i>1?void 0:i?Xd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Yd(t,a,s),s};const Qd=["string","integer","number","bool","date","time","dateTime","dateRange","money","file","array","status","component","menu","range","action","actionGroup"],Zd=["regular","radio","checkbox","textarea","toggle","combobox","select","email","password","richText","listBox","html","markdown","image","icon","link","money","grid","color","choice","popover","slider","button","stars"],ec={string:"#3B82F6",integer:"#8B5CF6",number:"#6366F1",bool:"#10B981",date:"#F59E0B",time:"#F59E0B",dateTime:"#F59E0B",dateRange:"#F59E0B",money:"#EF4444",file:"#64748B",array:"#0EA5E9",status:"#EC4899",component:"#14B8A6",menu:"#94A3B8",range:"#A855F7",action:"#F97316",actionGroup:"#FB923C"};function Bi(){return"field-"+Math.random().toString(36).slice(2,8)}let Et=class extends E{constructor(){super(...arguments),this.value='{"name":"New Form","fields":[]}',this.form={name:"New Form",fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has("value"))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){const e=this.shadowRoot?.querySelector(".field-list");!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=qs.create(e,{animation:150,handle:".drag-handle",ghostClass:"sortable-ghost",onEnd:t=>{const{oldIndex:a,newIndex:i}=t;if(a===void 0||i===void 0||a===i)return;const s=[...this.form.fields],[r]=s.splice(a,1);s.splice(i,0,r),this.form={...this.form,fields:s},this.emit()}}))}emit(){const e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addField(){const e=Bi(),t={id:e,label:"New Field",dataType:"string"};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){const t=this.form.fields.find(r=>r.id===e);if(!t)return;const a={...t,id:Bi(),label:t.label+" (copy)"},i=this.form.fields.findIndex(r=>r.id===e),s=[...this.form.fields];s.splice(i+1,0,a),this.form={...this.form,fields:s},this.selectedId=a.id,this.emit()}render(){return o`
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
                    ${bi}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${gi}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${$i}
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
        `}renderRow(e){const t=ec[e.dataType]??"#64748b",a=this.selectedId===e.id;return o`
            <div class="field-row ${a?"selected":""}"
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
                        @click="${i=>{i.stopPropagation(),this.duplicateField(e.id)}}">⧉</button>
                <button class="row-btn danger" title="Delete"
                        @click="${i=>{i.stopPropagation(),this.deleteField(e.id)}}">🗑</button>
            </div>
        `}renderPanel(){const e=this.form.fields.find(a=>a.id===this.selectedId);if(!e)return d;const t=(a,i)=>o`
            <div class="prop-field">
                <label class="prop-label">${a}</label>
                ${i}
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
                            ${Qd.map(a=>o`
                                <option value="${a}" ?selected="${e.dataType===a}">${a}</option>`)}
                        </select>`)}
                    ${t("Stereotype",o`
                        <select class="inp"
                                @change="${a=>this.updateField(e.id,{stereotype:a.target.value||void 0})}">
                            ${Zd.map(a=>o`
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
        `}exportJson(){const e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=(this.form.name??"form").replace(/\s+/g,"-").toLowerCase()+".json",i.click(),URL.revokeObjectURL(a)}};Et.styles=[Ma,S`
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
    `];pa([p()],Et.prototype,"value",2);pa([y()],Et.prototype,"form",2);pa([y()],Et.prototype,"selectedId",2);pa([y()],Et.prototype,"showMeta",2);Et=pa([C("mateu-form-editor")],Et);var tc=Object.defineProperty,ac=Object.getOwnPropertyDescriptor,Ge=(e,t,a,i)=>{for(var s=i>1?void 0:i?ac(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&tc(t,a,s),s};let Ee=class extends E{constructor(){super(...arguments),this.appState={},this.appData={},this.open=!1,this.activeTab="appstate",this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith("mateu-")&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset="",this._prevTarget=null,this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset=""),this._prevTarget=t,t.style.outline="2px solid #0070f3",t.style.outlineOffset="-2px",this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||"",this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener("mouseover",this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mouseover",this._onMouseover,!0),this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget=null)}_fmt(e){try{return JSON.stringify(e,null,2)??"null"}catch{return String(e)}}_renderTab(e,t){return o`
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
        `}};Ee.styles=S`
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
    `;Ge([p()],Ee.prototype,"appState",2);Ge([p()],Ee.prototype,"appData",2);Ge([y()],Ee.prototype,"open",2);Ge([y()],Ee.prototype,"activeTab",2);Ge([y()],Ee.prototype,"hoveredTag",2);Ge([y()],Ee.prototype,"hoveredId",2);Ge([y()],Ee.prototype,"hoveredState",2);Ge([y()],Ee.prototype,"hoveredData",2);Ge([y()],Ee.prototype,"hoveredMeta",2);Ee=Ge([C("mateu-debug-overlay")],Ee);var Oe=(e=>(e.SetAppDataValue="SetAppDataValue",e.SetAppStateValue="SetAppStateValue",e.SetDataValue="SetDataValue",e.RunAction="RunAction",e.RunJS="RunJS",e.SetAttributeValue="SetAttributeValue",e.SetStateValue="SetStateValue",e.SetCssClass="SetCssClass",e.SetStyle="SetStyle",e))(Oe||{}),Es=(e=>(e.required="required",e.disabled="disabled",e.hidden="hidden",e.pattern="pattern",e.minValue="minValue",e.maxValue="maxValue",e.minLength="minLength",e.maxLength="maxLength",e.css="css",e.style="style",e.theme="theme",e.errorMessage="errorMessage",e.description="description",e.none="none",e))(Es||{}),Is=(e=>(e.Continue="Continue",e.Stop="Stop",e))(Is||{}),ic=Object.defineProperty,sc=Object.getOwnPropertyDescriptor,Ua=(e,t,a,i)=>{for(var s=i>1?void 0:i?sc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&ic(t,a,s),s};let Jt=null,Ut=class extends vt{constructor(){super(...arguments),this.baseUrl="",this.route="",this.consumedRoute="",this.formerState={},this.applyRules=()=>{const e=this.component.rules;if(e&&e.length>0){const t=this.state,a=this.data,i=this.appState,s=this.appData,r=this.component,n=x=>Xi(x,t,a,{appState:i,appData:s,component:r}),l=x=>Yi(x,t,a,i,s,{component:r}),c=["state","data","appState","appData","component"],u=[t,a,i,s,r],m={...this.state},v={...this.data};let f=!1,b=!1;for(let x=0;x<e.length;x++){const g=e[x];try{if(n(g.filter)){if(Oe.SetStateValue==g.action||Oe.SetDataValue==g.action){const _=Oe.SetStateValue==g.action?m:v,P=g.fieldName.split(",");for(let D=0;D<P.length;D++){const J=P[D];if(!_[J]||_[J]!=g.value){const V=g.expression?l(g.expression):g.value,ee=Es.none==g.fieldAttribute?J:J+"."+g.fieldAttribute;V!=_[ee]&&(_[ee]=V,Oe.SetStateValue==g.action&&(f=!0),Oe.SetDataValue==g.action&&(b=!0))}}}if(Oe.RunAction==g.action&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:g.actionId},bubbles:!0,composed:!0})),Oe.RunJS==g.action&&new Function(...c,g.value)(...u),Oe.SetAttributeValue==g.action){const _=g.expression?n(g.expression):g.value;if(g.fieldAttribute=="disabled"){_?this.shadowRoot?.getElementById(g.fieldName)?.setAttribute(g.fieldAttribute,"disabled"):this.shadowRoot?.getElementById(g.fieldName)?.removeAttribute(g.fieldAttribute);continue}this.shadowRoot?.getElementById(g.fieldName)?.setAttribute(g.fieldAttribute,_)}if(Oe.SetCssClass==g.action&&this.shadowRoot?.getElementById(g.fieldName)?.setAttribute("class",g.value),Oe.SetStyle==g.action&&this.shadowRoot?.getElementById(g.fieldName)?.style.setProperty(g.expression,g.value),Is.Stop==g.result)break}}catch(_){console.error("rule failed",g,_)}}f&&(this.state=m),b&&(this.data=v),f&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes("-"),this.checkValidations=e=>{const t=e?e.split(","):void 0,a=this.component.validations;let i=!0,s=!1;const r=this.data??{},n={...this.data??{},errors:{}};if(a){for(let l=0;l<a.length;l++){const c=a[l];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let m=0;m<u.length;m++){const v=u[m];n.errors[v]=[]}}for(let l=0;l<a.length;l++){const c=a[l];if(!this.skipValidation(t,c))try{const u=c.condition&&c.condition.includes("${")?this._evalTemplate(c.condition):this._evalExpr(c.condition);if(c.condition&&!u){i=!1;const v=(c.fieldId??"_component").split(",");for(let f=0;f<v.length;f++){const b=v[f];let x=n.errors[b];if(x||(n.errors[b]=[]),x=n.errors[b],!r[b]){let g=c.message;try{g=this._evalTemplate(c.message)}catch{}x.push(g)}}}}catch(u){console.error("validation failed",c,u)}}for(let l=0;l<a.length;l++){const c=a[l];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let m=0;m<u.length;m++){const v=u[m];if(r.errors?[v].join(","):n.errors==""&&[v].join(",")){s=!0;break}}}(r.errors?["_component"].join(","):n.errors==""&&["_component"].join(","))&&(s=!0)}n._valid=i,n._valid!=r._valid&&(s=!0),s&&(this.data=n)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};t.fieldIds.forEach(i=>{a[i]=void 0}),a.searchText=void 0,this.state={...this.state,...a}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};a[t.key]=t.value,e.type=="data-changed"&&(this.data={...this.data,...a})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail;if(e.type=="value-changed"){const a={...this.state};a[t.fieldId]=t.value,this.state=a,(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("dirty",{detail:e.detail,bubbles:!0,composed:!0}));const i=this.component;i.triggers?.filter(s=>s.type==nt.OnValueChange).filter(s=>!s.propertyName||t.fieldId==s.propertyName).forEach(s=>{(!s.condition||this._evalExpr(s.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))}),i.triggers?.filter(s=>s.type==nt.AutoSave).forEach(s=>{const r=s.actionId,n=this._autoSaveTimers.get(r);n!==void 0&&clearTimeout(n),this._autoSaveTimers.set(r,setTimeout(()=>{this._autoSaveTimers.delete(r),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))},s.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{const t=e.detail;if(e.type=="action-requested"){e.preventDefault(),e.stopPropagation();const a=this.component,i=a.actions?.find(s=>s.id==t.actionId||s.id.endsWith("*")&&t.actionId.startsWith(s.id.replace("*","")));if(i){if(i&&i.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify("You first need to select some rows");return}if(i&&i.validationRequired){const r=Jt??this;if(Jt=null,r.checkValidations(i.fieldsToValidate),!r.data._valid){r.notifyValidationErrors();return}}Jt=null;const s={...t,initiatorComponentId:this.id};i&&i.confirmationRequired?this.callAfterConfirmation(i,()=>this.requestActionCallToServerOrBubble(s,a,i)):this.requestActionCallToServerOrBubble(s,a,i)}else{const s={...t.parameters};s.initiatorState||(s.initiatorState=this.state),Jt||(Jt=this),this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,parameters:s},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{const e={},t=a=>{if(a)for(const i of a){const s=i.metadata;if(s?.type===h.FormField){const r=s;r.fieldId&&r.label&&(e[r.fieldId]=r.label)}t(i.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{const e=this.data?.errors??{},t=this.buildFieldLabelMap(),a=[];if(Object.entries(e).forEach(([s,r])=>{if(!Array.isArray(r))return;const n=s==="_component"?void 0:t[s]??s;r.forEach(l=>{l&&!a.some(c=>c.label===n&&c.msg===l)&&a.push({label:n,msg:l})})}),a.length===0){this.notify("There are validation errors");return}const i=document.createElement("vaadin-notification");i.position="bottom-end",i.setAttribute("theme","error"),i.duration=Math.max(3e3,1500+a.length*1e3),i.renderer=s=>{Vi(o`
                <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs, .25rem);">
                    <strong>There are validation errors</strong>
                    ${a.map(({label:r,msg:n})=>r?o`<span>• <b>${r}:</b> ${n}</span>`:o`<span>• ${n}</span>`)}
                </div>
            `,s)},document.body.appendChild(i),i.opened=!0,i.addEventListener("opened-changed",s=>{s.detail.value||document.body.removeChild(i)})},this.notify=e=>{ra.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.callAfterConfirmation=(e,t)=>{let a="One moment, please",i="Are you sure?",s="Yes",r="No";e.confirmationTexts&&(a=e.confirmationTexts.title,i=e.confirmationTexts.message,s=e.confirmationTexts.confirmationText,r=e.confirmationTexts.denialText);const n=document.createElement("vaadin-confirm-dialog");n.setAttribute("header",a),n.setAttribute("cancel-button-visible","cancel-button-visible"),n.setAttribute("confirm-text",s),n.setAttribute("cancel-text",r),n.append(i),n.opened=!0,n.addEventListener("confirm",()=>t()),n.addEventListener("close",()=>document.body.removeChild(n)),n.addEventListener("confirm",()=>document.body.removeChild(n)),n.addEventListener("cancel",()=>document.body.removeChild(n)),n.addEventListener("reject",()=>document.body.removeChild(n)),document.body.append(n)},this.requestActionCallToServerOrBubble=(e,t,a)=>{if(a&&a.bubble){const i={...e.parameters};i.initiatorState||(i.initiatorState=this.state),this.dispatchEvent(new CustomEvent("action-requested",{detail:{...e,parameters:i},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,a)},this.requestActionCallToServer=(e,t,a)=>{if(a&&a.href){window.location.href=a.href;return}if(a&&a.js)try{new Function("state","data","appState","appData","component",a.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(i){console.error("when evaluating "+a.js,i,this.component,this.state,this.data)}if(a&&a.customEvent&&this.dispatchEvent(new CustomEvent(a.customEvent.name,{detail:a.customEvent.detail,bubbles:!0,composed:!0})),!(a&&(a.js||a.customEvent))){if(e.actionId=="search"){const i=e.parameters?._searchState;i?this.state={...this.state,...i}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}this.dispatchEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:{...this.state},parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:a?.background,sse:a?.sse,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))}},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(i=>i.type==nt.OnSuccess).filter(i=>e.detail.actionId==i.calledActionId).forEach(i=>{if(!i.condition||this._evalExpr(i.condition))if(e.preventDefault(),e.stopPropagation(),i.timeoutMillis>0){const s=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId,callbackToken:s},bubbles:!0,composed:!0}))},i.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(i=>i.type==nt.OnError).filter(i=>e.detail.actionId==i.calledActionId).forEach(i=>{(!i.condition||this._evalExpr(i.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0})))})},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;const t=this.component;if(t)for(const a of t.actions??[]){const i=a.shortcut||(a.runOnEnter?"enter":null);if(i&&this._shortcutMatchesEvent(i,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return K.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has("state")&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has("component")&&(this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}_shortcutMatchesEvent(e,t){return Jr(e,t)}_collectShortcutTabs(){const e=this.renderRoot;if(!e)return[];const t=Array.from(e.querySelectorAll("vaadin-tab[data-shortcut]"));return e.querySelectorAll("mateu-drawer, mateu-dialog").forEach(a=>{const i=a.shadowRoot;i&&t.push(...Array.from(i.querySelectorAll("vaadin-tab[data-shortcut]")))}),t}_handleTabShortcut(e){const t=this._collectShortcutTabs();if(t.length===0)return!1;for(const a of Array.from(t)){const i=a.dataset.shortcut;if(!i||!this._shortcutMatchesEvent(i,e))continue;const s=a.closest("vaadin-tabs");if(!s)continue;const r=Array.from(s.querySelectorAll("vaadin-tab")).indexOf(a);if(!(r<0))return e.preventDefault(),s.selected=r,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.addEventListener("backend-call-failed",this.handleBackendFailed),document.addEventListener("keydown",this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.removeEventListener("backend-call-failed",this.handleBackendFailed),document.removeEventListener("keydown",this._keydownListener)}render(){return o`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?o`
                <div><ul>${this.data.errors._component.map(e=>o`<li>${e}</li>`)}</ul></div>
            `:d}</div>`}_render(){if(this.component?.type==U.ClientSide){const e=this.component;return e.metadata?.type==h.Page?Xa(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==h.Crud?Qa(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):K.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return o`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==U.ClientSide){const t=e;if(t.metadata?.type==h.Page)return Xa(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==h.Crud)return Qa(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return $(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}};Ut.styles=S`
        :host {
        }

        ${Ls(ht.cssText)}
        
        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }
        
  `;Ua([p()],Ut.prototype,"baseUrl",2);Ua([p()],Ut.prototype,"route",2);Ua([p()],Ut.prototype,"consumedRoute",2);Ut=Ua([C("mateu-component")],Ut);const ji=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}};class rc{async handle(t,a){return await t.runAction(a.baseUrl,a.route,a.consumedRoute,a.actionId,a.initiatorComponentId,a.appState,a.serverSideType,a.componentState,a.parameters,a.initiator,a.background)}}const oc=new rc;class nc{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,a,i)=>{if(t?.fragments?.forEach(s=>{lt.next({command:void 0,fragment:s,ui:void 0,error:void 0,callbackToken:i})}),t?.appState&&(X.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const s=t?.appData;Qt.value={...t.appData,...s},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}t?.messages?.forEach(s=>{ra.show(s.text,{position:s.position?this.mapPosition(s.position):void 0,theme:s.variant,duration:s.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(s=>{lt.next({command:s,fragment:void 0,ui:void 0,error:void 0,callbackToken:i})})}}async runAction(t,a,i,s,r,n,l,c,u,m,v,f,b,x,g){try{const _=await oc.handle(t,{baseUrl:a,route:i,consumedRoute:s,actionId:r,appState:X.value,initiatorComponentId:n,componentState:u,parameters:m,serverSideType:c,initiator:v,background:f});b&&b(_),x||this.handleUIIncrement(_,v,g),_.messages&&_.messages.length==1&&_.messages[0].variant=="error"&&v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r,evevntId:ie()},bubbles:!0,composed:!0}))}catch(_){console.warn("Action request failed",_),v.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(_)}})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}}serialize(t){return t?.message?t:JSON.stringify(t)}}const lc=new nc,dc=lc;class cc{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,a,i)=>{if(t?.messages?.forEach(s=>{ra.show(s.text,{position:s.position?this.mapPosition(s.position):"bottom-end",theme:s.variant,duration:s.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(s=>{lt.next({command:s,fragment:void 0,ui:void 0,error:void 0,callbackToken:i})}),t?.fragments?.forEach(s=>{lt.next({command:void 0,fragment:s,ui:void 0,error:void 0,callbackToken:i})}),t?.appState&&(X.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const s=t?.appData;Qt.value={...t.appData,...s},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}}}async runAction(t,a,i,s,r,n,l,c,u,m,v,f,b,x,g){if(i){i=i||"_no_route",i&&i.startsWith("/")&&(i=i.substring(1));const _={serverSideType:c,appState:X.value,componentState:u,parameters:m,initiatorComponentId:n,consumedRoute:s,route:"/"+i,actionId:r};f||v.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),fetch(a+"/mateu/v3/sse/"+i,{method:"POST",headers:{Accept:"text/event-stream","Content-Type":"application/json"},body:JSON.stringify(_)}).then(async P=>{const D=P.body?.pipeThrough(new TextDecoderStream).getReader();if(D){let J="";for(;;){const{value:V,done:ee}=await D.read();if(ee)break;J+=V;const le=J.split(`

`);J=le.pop()??"";for(const te of le){const w=te.trim();if(w)if(w.startsWith("data:")){const z=JSON.parse(w.substring(5).trim());b&&b(z),x||this.handleUIIncrement(z,v,g),z.messages&&z.messages.length==1&&z.messages[0].variant=="error"&&v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}else{let z=w;try{const I=JSON.parse(w);z=I.message,I._embedded?.errors?.length>0&&I._embedded.errors[0].message&&(z=I._embedded.errors[0].message)}catch{}throw new Error(z)}}}}f||v.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:r}})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r},bubbles:!0,composed:!0}))}).catch(P=>{v.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(P)}})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))})}}serialize(t){return t?.message?t:JSON.stringify(t)}}const uc=new cc;var hc=Object.defineProperty,pc=Object.getOwnPropertyDescriptor,Te=(e,t,a,i)=>{for(var s=i>1?void 0:i?pc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&hc(t,a,s),s};let oe=class extends Aa{constructor(){super(...arguments),this.consumedRoute="",this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t=="string"&&(t===""||t.startsWith("/"))&&this.consumedRoute&&this.consumedRoute!=="_empty"&&this.consumedRoute.startsWith("/")&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t.startsWith("/")&&this.uriPrefix.endsWith("/")?t=this.uriPrefix+t.substring(1):!t.startsWith("/")&&!this.uriPrefix.endsWith("/")?t=this.uriPrefix+"/"+t:t=this.uriPrefix+t),this.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==""&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:U.ClientSide,metadata:{type:h.Element,name:"div",content:"Not found"},id:"fieldId"},action:ia.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;const t=this.detail1;if(e.type=="server-side-action-requested"){let a=dc;t.sse&&(a=uc),a.runAction(vi,this.baseUrl,t.route??"",t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken)}},this.getCustomisedAppState=()=>{let e={...X.value};if(this.overrides){const t=ji(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw new Error("Method not implemented.")}createRenderRoot(){return K.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.overridesParsed=ji(this.overrides),this.addEventListener("server-side-action-requested",this.actionRequestedListener),this.addEventListener("backend-call-failed",this.backendFailedListener),this.addEventListener("history-pushed",this.historyPushed),this.addEventListener("route-changed",this.routeChangedListener),window.Vaadin.featureFlags.masterDetailLayoutComponent=!0}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.actionRequestedListener),this.removeEventListener("backend-call-failed",this.backendFailedListener),this.removeEventListener("history-pushed",this.historyPushed),this.removeEventListener("route-changed",this.routeChangedListener)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(a=>a==="appState"||a==="appData")){const a=this.renderRoot.querySelector("mateu-component");if(a)return e.has("appState")&&(a.appState=this.appState),e.has("appData")&&(a.appData=this.appData),!1}return!0}updated(e){(e.has("id")||e.has("baseurl")||e.has("route")||e.has("consumedRoute")||e.has("instant"))&&(this.preventNavigation||(this.callbackToken=this.instant||ie(),this.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:"",serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,callbackToken:this.callbackToken},bubbles:!0,composed:!0})))),e.has("route")&&this.top&&(this.preventNavigation||this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&(this.preventNavigation=!1)}applyFragment(e){if(!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}};return}this.fragment=e}render(){return o`
           ${this.fragment?.component?$(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):d}
       `}};oe.styles=S`
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
  `;Te([p()],oe.prototype,"consumedRoute",2);Te([p()],oe.prototype,"serverSideType",2);Te([p()],oe.prototype,"uriPrefix",2);Te([p()],oe.prototype,"overrides",2);Te([p()],oe.prototype,"homeRoute",2);Te([p()],oe.prototype,"route",2);Te([p()],oe.prototype,"top",2);Te([p()],oe.prototype,"instant",2);Te([p()],oe.prototype,"appState",2);Te([p()],oe.prototype,"appData",2);Te([y()],oe.prototype,"fragment",2);oe=Te([C("mateu-ux")],oe);class mc{constructor(){this._dirty=!1,this._installed=!1,this.message="You have unsaved changes. Are you sure you want to leave this page?",this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=t=>{this._dirty&&(t.preventDefault(),t.returnValue="")}}install(){this._installed||(this._installed=!0,document.addEventListener("dirty",this._onDirty),document.addEventListener("clean",this._onClean),window.addEventListener("beforeunload",this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;const t=window.confirm(this.message);return t&&(this._dirty=!1),t}}const Yt=new mc;var vc=Object.defineProperty,fc=Object.getOwnPropertyDescriptor,j=(e,t,a,i)=>{for(var s=i>1?void 0:i?fc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&vc(t,a,s),s};let q=class extends vt{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0,this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this.isDark=document.documentElement.getAttribute("theme")==="dark",this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;const e=this.isDark?"dark":"light";document.documentElement.setAttribute("theme",e),localStorage.setItem("mateu-theme",e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?"detail":"detail-hidden")},this.runAction=e=>{const a=this.renderRoot.querySelector?.("mateu-component");a&&a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){const a=e[t];if(a.selected)return a;const i=this.getSelectedOption(a.submenus);if(i)return i}return null},this.itemSelected=e=>{const t=e.detail.value;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.itemSelectedTiles=e=>{const t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))},this.mapItemsForTiles=e=>e.map(t=>({text:t.label,consumedRoute:t.consumedRoute,route:t.route,baseUrl:t.baseUrl,serverSideType:t.serverSideType,uriPrefix:t.uriPrefix,actionId:t.actionId,selected:t.selected,_menuOption:t})),this.flattenMenuForPalette=(e,t)=>{const a=[];for(const i of e)if(!i.separator)if(i.submenus&&i.submenus.length>0){const s=t?`${t} › ${i.label}`:i.label;a.push(...this.flattenMenuForPalette(i.submenus,s))}else a.push({label:i.label,breadcrumb:t,consumedRoute:i.consumedRoute,route:i.route,actionId:i.actionId,baseUrl:i.baseUrl,serverSideType:i.serverSideType,uriPrefix:i.uriPrefix});return a},this.handleCommandPaletteKeydown=(e,t)=>{if(e.key==="ArrowDown")e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,Math.min(t.length,10)-1);else if(e.key==="ArrowUp")e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key==="Enter"){const a=t[this.commandPaletteSelectedIndex];a&&(this.selectRoute(a.consumedRoute,a.route,a.actionId,a.baseUrl,a.serverSideType,a.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery="")}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return d;const e=this.component?.metadata;if(!e?.menu)return d;const t=this.flattenMenuForPalette(e.menu,""),a=this.commandPaletteQuery.toLowerCase(),i=a?t.filter(s=>s.label.toLowerCase().includes(a)||s.breadcrumb.toLowerCase().includes(a)):t;return o`
            <div class="cmd-backdrop" @click=${()=>{this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}>
                <div class="cmd-palette" @click=${s=>s.stopPropagation()}>
                    <div class="cmd-search-wrapper">
                        <vaadin-icon icon="vaadin:search" class="cmd-search-icon"></vaadin-icon>
                        <input
                            class="cmd-input"
                            placeholder="Go to…"
                            .value=${this.commandPaletteQuery}
                            @input=${s=>{this.commandPaletteQuery=s.target.value,this.commandPaletteSelectedIndex=0}}
                            @keydown=${s=>this.handleCommandPaletteKeydown(s,i)}
                        >
                    </div>
                    <div class="cmd-results">
                        ${i.slice(0,10).map((s,r)=>o`
                            <div class="cmd-result ${r===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                @click=${()=>{this.selectRoute(s.consumedRoute,s.route,s.actionId,s.baseUrl,s.serverSideType,s.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}
                                @mouseenter=${()=>{this.commandPaletteSelectedIndex=r}}
                            >
                                <span class="cmd-result-label">${s.label}</span>
                                ${s.breadcrumb?o`<span class="cmd-result-breadcrumb">${s.breadcrumb}</span>`:d}
                            </div>
                        `)}
                        ${i.length===0?o`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>`:d}
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
        `,this.goHome=()=>{const e=this.component.metadata;this.selectRoute(e.route,"_page","",void 0,void 0,void 0)},this.selectRoute=(e,t,a,i,s,r)=>{Yt.confirmLeave()&&this._selectRoute(e,t,a,i,s,r)},this._selectRoute=(e,t,a,i,s,r)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=i,this.selectedRoute=t,this.selectedServerSideType=s,this.selectedUriPrefix=r,this.instant=ie(),this.state&&this.state._route!=null&&(this.state._route=void 0);let n=this.baseUrl??"";n.indexOf("://")<0&&(n.startsWith("/")||(n="/"+n),n=window.location.origin+n),n.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let l=new URL(n+t);if(e&&l.pathname.startsWith(e)){const c=l.pathname.substring(e.length);l=new URL(l.origin+(c||"/"))}if((window.location.pathname||l.pathname)&&window.location.pathname!=l.pathname){let c=l.pathname;l.search&&(c+=l.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let u=c;this.selectedUriPrefix&&(u.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+u.substring(1):!u.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+"/"+u:u=this.selectedUriPrefix+u),u=="/_page"&&(u=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:u},bubbles:!0,composed:!0}))}}},this.mapItems=(e,t)=>e.map(a=>{if(a.submenus&&a.submenus.length>0){let i=this.mapItems(a.submenus,t);return t&&a.label.toLowerCase().includes(t)&&(i=this.mapItems(a.submenus,"")),i&&i.length>0?{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||a.selected,children:i}:void 0}if(a.separator)return t?void 0:{component:"hr"};if(!t||a.label.toLowerCase().includes(t))return{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||a.selected}}).filter(a=>a!=null),this.getSelectedIndex=e=>{if(e){const t=this.getSelectedOption(e);if(t)return e.indexOf(t)}return NaN},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?o`
                <vaadin-details summary="${e.label}" theme="reverse">
                    <vaadin-vertical-layout>
                        ${e.submenus.map(t=>o`${this.renderOptionOnLeftMenu(t)}`)}
                    </vaadin-vertical-layout>
                </vaadin-details>
`:o`<vaadin-button theme="tertiary" 
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)}"
        >${e.label}</vaadin-button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){const t=this.shadowRoot?.querySelector("mateu-ux");t&&t.setAttribute("instant",ie())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?o`
            ${e.map(a=>{const i=a;return o`

                        ${i.component=="hr"?o`<hr slot="children"/>`:o`
                                <vaadin-side-nav-item
                                .path="${i.route&&!i.children?i.route:void 0}"
                                .pathAliases="${[this.baseUrl+(i.route?i.route:"")]}"
                                slot="${t}"
                                ?expanded="${i.selected}"
                                >
                                    ${i.icon?o`
                                        <vaadin-icon icon="vaadin:dashboard" slot="prefix"></vaadin-icon>
                                    `:d}
                                    ${i.text}
                                    ${this.renderSideNav(i.children,"children")}
                                </vaadin-side-nav-item>
                        `}

                            `})}`:d,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}createRenderRoot(){return K.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute("theme")==="dark",this._commandPaletteHandler=e=>{(e.metaKey||e.ctrlKey)&&e.key==="k"&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0),e.key==="Escape"&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery="")},document.addEventListener("keydown",this._commandPaletteHandler),Yt.install(),this.addEventListener("compact-changed",this._compactHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener("keydown",this._commandPaletteHandler),this.removeEventListener("compact-changed",this._compactHandler)}updated(e){if(super.updated(e),this.component){const a=this.component.metadata;if(a){const i=a;if(i.favicon){let s=document.querySelector("link[rel~='icon']");s||(s=document.createElement("link"),s.rel="icon",document.head.appendChild(s)),s.href=i.favicon}e.has("component")&&(this.selectedRoute=i.homeRoute,this.selectedConsumedRoute=i.homeConsumedRoute,this.selectedServerSideType=i.homeServerSideType,this.selectedBaseUrl=i.homeBaseUrl,this.selectedUriPrefix=i.homeUriPrefix)}}e.has("commandPaletteOpen")&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(".cmd-input")?.focus()},0)}render(){return K.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}};q.styles=S`

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

  `;j([y()],q.prototype,"filter",2);j([y()],q.prototype,"instant",2);j([y()],q.prototype,"selectedConsumedRoute",2);j([y()],q.prototype,"selectedRoute",2);j([y()],q.prototype,"selectedUriPrefix",2);j([y()],q.prototype,"selectedBaseUrl",2);j([y()],q.prototype,"selectedServerSideType",2);j([y()],q.prototype,"selectedParams",2);j([y()],q.prototype,"tilesMenuOption",2);j([y()],q.prototype,"railOpenOption",2);j([y()],q.prototype,"commandPaletteOpen",2);j([y()],q.prototype,"commandPaletteQuery",2);j([y()],q.prototype,"commandPaletteSelectedIndex",2);j([y()],q.prototype,"pageCompact",2);j([Ae("mateu-chat")],q.prototype,"chat",2);j([y()],q.prototype,"isDark",2);j([y()],q.prototype,"chatOpen",2);j([Ae("vaadin-app-layout")],q.prototype,"vaadinAppLayout",2);q=j([C("mateu-app")],q);var bc=Object.defineProperty,gc=Object.getOwnPropertyDescriptor,tt=(e,t,a,i)=>{for(var s=i>1?void 0:i?gc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&bc(t,a,s),s};let ze=class extends q{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.lastActionServerSideType=void 0,this.lastActionInitiatorComponentId=void 0,this.captureActionSST=e=>{const t=e.detail;t?.serverSideType&&(this.lastActionServerSideType=t.serverSideType,this.lastActionInitiatorComponentId=t.initiatorComponentId)},this.handleUnhandledAction=e=>{const t=e.detail;e.preventDefault(),e.stopPropagation();const a=this.shadowRoot?.querySelector("#ux_"+this.id);!a||typeof a.manageActionEvent!="function"||(this.lastActionServerSideType=this.selectedServerSideType,this.lastActionInitiatorComponentId=a.id,a.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:a.route??this.selectedRoute??"",consumedRoute:a.consumedRoute??this.selectedConsumedRoute??"",componentState:t.parameters?.initiatorState??{},parameters:t.parameters,actionId:t.actionId,serverSideType:this.selectedServerSideType??"",initiatorComponentId:a.id,initiator:a}})))},this.selectRoute=(e,t,a,i,s,r)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=i,this.selectedRoute=t,this.selectedServerSideType=s,this.selectedUriPrefix=r,this.instant=ie();let n=this.baseUrl??"";n.indexOf("://")<0&&(n.startsWith("/")||(n="/"+n),n=window.location.origin+n),n.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let l=new URL(n+t);if(e&&(t??"").startsWith(e)&&(l=new URL(n+t?.substring(e.length))),(window.location.pathname||l.pathname)&&window.location.pathname!=l.pathname){let c=l.pathname;l.search&&(c+=l.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let u=c;this.selectedUriPrefix&&(u.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+u.substring(1):!u.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+"/"+u:u=this.selectedUriPrefix+u),u=="_page"&&(u=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:u},bubbles:!0,composed:!0}))}}},this.updateRoute=e=>{e.preventDefault(),e.stopPropagation(),console.log("update route",e,this);var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.tabSelected=(e,t,a,i)=>{const s=e.detail.tab.dataset.route,r=i.menu.find(n=>n.route===s||n.path===s);r&&this.selectRoute(r.consumedRoute,r.route,r.actionId,r.baseUrl,r.serverSideType,r.uriPrefix)},this.mode=ma.Auto,this.toggle=e=>{this.mode=this.mode==ma.Expanded?ma.Collapsed:ma.Expanded,e.requestUpdate()},this.findMenuOption=(e,t)=>{for(const a of e){if(a.route===t||a.path===t||a.consumedRoute===t)return a;if(a.submenus?.length){const i=this.findMenuOption(a.submenus,t);if(i)return i}}},this.selected=(e,t,a,i)=>{const s=e.detail.item.dataset.route,r=this.findMenuOption(i.menu,s);r&&this.selectRoute(r.consumedRoute,r.route,r.actionId,r.baseUrl,r.serverSideType,r.uriPrefix)},this.renderSubmenu=e=>o`
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
                `}connectedCallback(){super.connectedCallback(),this.addEventListener("server-side-action-requested",this.captureActionSST,!0),this.addEventListener("action-requested",this.handleUnhandledAction),this.innerFragmentSubscription=lt.subscribe(e=>{if(e.fragment){const t=e.fragment;if(this.lastActionInitiatorComponentId&&t.targetComponentId===this.lastActionInitiatorComponentId&&t.state?._route!==void 0){const a=t.state._route;if(a!==""&&!a.startsWith("/")){this.lastActionInitiatorComponentId=void 0,this.lastActionServerSideType=void 0;return}const i=t.state._componentRoute||"";i&&(this.selectedConsumedRoute=i);const s=this.component?.metadata,r=i||W(this,s)||"";i||(this.selectedConsumedRoute=r||this.selectedConsumedRoute);const n=r+a;this.lastActionInitiatorComponentId=void 0,n!==this.selectedRoute&&(this.selectedRoute=n,this.lastActionServerSideType&&(this.selectedServerSideType=this.lastActionServerSideType),this.instant=ie()),this.lastActionServerSideType=void 0}}})}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.captureActionSST,!0),this.removeEventListener("action-requested",this.handleUnhandledAction),this.innerFragmentSubscription?.unsubscribe()}render(){const e=this.component?.metadata;return e.variant==we.MEDIATOR?o`
                        <mateu-api-caller>
                            <mateu-ux
                                    route="${ke(this.state,this,e)}"
                                    id="ux_${this.id}"
                                    baseUrl="${de(this,e)}"
                                    consumedRoute="${W(this,e)}"
                                    serverSideType="${ce(this,e)}"
                                    uriPrefix="${ue(this,e)}"
                                    style="width: 100%;"
                                    .appState="${this.appState}"
                                    .appData="${this.appData}"
                                    instant="${this.instant}"
                                    @navigation-requested="${this.updateRoute}"
                            ></mateu-ux>
                        </mateu-api-caller>
`:we.TABS==e.variant?o`

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
                                                route="${ke(this.state,this,e)}"
                                                id="ux_${this.id}"
                                                baseUrl="${de(this,e)}"
                                                consumedRoute="${W(this,e)}"
                                                serverSideType="${ce(this,e)}"
                                                uriPrefix="${ue(this,e)}"
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

            `:we.MENU_ON_LEFT==e.variant?o`
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
                            ${t.submenus.map(a=>o`
                                <ui5-side-navigation-sub-item text="${a.label}"
                                                              data-path="${a.path}"
                                                              data-route="${a.route}"
                                                              data-consumed-route="${a.consumedRoute}"
                                                              data-action-id="${a.actionId}"
                                                              data-server-side-type="${a.serverSideType}"
                                                              data-uri-prefix="${a.uriPrefix}"
                                                              data-base-url="${a.baseUrl}"
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
                            route="${ke(this.state,this,e)}"
                            id="ux_${this.id}"
                            baseUrl="${de(this,e)}"
                            consumedRoute="${W(this,e)}"
                            serverSideType="${ce(this,e)}"
                            uriPrefix="${ue(this,e)}"
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
                ${(e.contextSelectors??[]).map(t=>o`
                    <mateu-app-context-picker slot="content" data-hide-order="1" .selector="${t}" .app="${e}" .baseUrl="${""}"></mateu-app-context-picker>`)}
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
                            route="${ke(this.state,this,e)}"
                            id="ux_${this.id}"
                            baseUrl="${de(this,e)}"
                            consumedRoute="${W(this,e)}"
                            serverSideType="${ce(this,e)}"
                            uriPrefix="${ue(this,e)}"
                            style="width: 100%;"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                            instant="${this.instant}"
                            @navigation-requested="${this.updateRoute}"
                    ></mateu-ux>
                </mateu-api-caller>
            </div>
        </ui5-navigation-layout>`}};ze.styles=S`
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
  `;tt([y()],ze.prototype,"filter",2);tt([y()],ze.prototype,"instant",2);tt([y()],ze.prototype,"selectedConsumedRoute",2);tt([y()],ze.prototype,"selectedRoute",2);tt([y()],ze.prototype,"selectedUriPrefix",2);tt([y()],ze.prototype,"selectedBaseUrl",2);tt([y()],ze.prototype,"selectedServerSideType",2);tt([y()],ze.prototype,"selectedParams",2);ze=tt([C("mateu-sapui5-app")],ze);const $c=(e,t,a,i,s)=>{const r=t.metadata;return o`
        <mateu-sapui5-app
                id="${e.id}_app"
                route="${r.homeRoute}"
                consumedRoute="${r.route}"
                baseUrl="${a}"
                .component="${t}"
                style="width: 100%;"
        ></mateu-sapui5-app>
    `},yc=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        
        <mateu-sapui5-form 
            baseUrl="${a}"
                .component="${t}"
                .values="${i}"
                .state="${i}"
                .data="${s}"
            .appState="${r}"
            .appData="${n}"
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??d}"
                >
                    ${t.children?.map(c=>$(e,c,a,i,s,r,n))}
            
                            ${l?.toolbar?.map(c=>o`
                   ${$(e,{metadata:c,type:U.ClientSide,slot:"toolbar"},a,i,s,r,n)}
                `)}
            
            
                ${l?.buttons?.map(c=>o`
                   ${$(e,{metadata:c,type:U.ClientSide,slot:"buttons"},a,i,s,r,n)}

                `)}

                </mateu-sapui5-form>
        
    
    `},xc=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">

            ${l?.title&&!l.noHeader?o`
                <ui5-title>${l.title}</ui5-title>
                ${l?.subtitle?o`<p style="color: var(--sapContent_LabelColor); margin: 0;">${l.subtitle}</p>`:d}
            `:d}

            ${l?.toolbar?.length>0?o`
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${l.toolbar.map(c=>$(e,{metadata:c,type:U.ClientSide},a,i,s,r,n))}
                </div>
            `:d}

            ${t.children?.map(c=>$(e,c,a,i,s,r,n))}

            ${l?.buttons?.length>0?o`
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--sapGroup_ContentBorderColor);">
                    ${l.buttons.map(c=>$(e,{metadata:c,type:U.ClientSide},a,i,s,r,n))}
                </div>
            `:d}
        </div>`},Ba=(e,t)=>e?e.includes("${")&&t._evalTemplate?t._evalTemplate(e):e:"",wc=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=Ba(l.title,e);return o`
        <ui5-panel header-text="${c||d}" fixed
                   style="margin-bottom: 1rem; ${t.style??""}"
                   class="${t.cssClasses??d}"
                   slot="${t.slot??d}">
            <div style="display:flex; flex-direction:column; gap:.5rem; padding:.25rem 0;">
                ${t.children?.map(u=>$(e,u,a,i,s,r,n))}
            </div>
        </ui5-panel>`},kc=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=Ba(l.title,e);return o`
        <div style="margin: .5rem 0; ${t.style??""}" class="${t.cssClasses??d}" slot="${t.slot??d}">
            ${c?o`<ui5-title level="H5" style="margin-bottom:.25rem;">${c}</ui5-title>`:d}
            <div style="display:flex; flex-direction:column; gap:.5rem;">
                ${t.children?.map(u=>$(e,u,a,i,s,r,n))}
            </div>
        </div>`},Cc=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=v=>v?$(e,v,a,i,s,r,n):d,u=typeof l.title=="string"?l.title:"",m=l.title&&typeof l.title=="object";return o`
        <ui5-card style="${t.style??""}" class="${t.cssClasses??d}" slot="${t.slot??d}">
            ${u||l.subtitle?o`
                <ui5-card-header slot="header"
                                 title-text="${u||d}"
                                 subtitle-text="${(typeof l.subtitle=="string"?l.subtitle:"")||d}">
                </ui5-card-header>`:d}
            <div style="padding: 1rem;">
                ${m?c(l.title):d}
                ${c(l.content)}
                ${t.children?.map(v=>$(e,v,a,i,s,r,n))}
                ${c(l.footer)}
            </div>
        </ui5-card>`},Sc=e=>{const t=e.metadata;return o`<ui5-link href="${t.url??"#"}" slot="${e.slot??d}">${t.text??t.url??""}</ui5-link>`},Ja=(e,t)=>{t&&e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:{}},bubbles:!0,composed:!0}))},_c=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=Ba(l.headerTitle,e),u=m=>m?$(e,m,a,i,s,r,n):d;return o`
        <ui5-dialog open header-text="${c||d}">
            ${u(l.content)}
            ${t.children?.map(m=>$(e,m,a,i,s,r,n))}
            ${l.footer?o`<div slot="footer" style="display:flex; gap:.5rem; padding:.5rem; justify-content:flex-end;">${u(l.footer)}</div>`:d}
        </ui5-dialog>`},Ec=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=Ba(l.header,e),u=l.content?$(e,l.content,a,i,s,r,n):d;return o`
        <ui5-dialog open header-text="${c||d}">
            ${u}
            <div slot="footer" style="display:flex; gap:.5rem; padding:.5rem; justify-content:flex-end;">
                ${l.canCancel?o`<ui5-button @click="${m=>Ja(m.target,l.cancelActionId)}">${l.cancelText??"Cancel"}</ui5-button>`:d}
                ${l.canReject?o`<ui5-button @click="${m=>Ja(m.target,l.rejectActionId)}">${l.rejectText??"No"}</ui5-button>`:d}
                <ui5-button design="Emphasized" @click="${m=>Ja(m.target,l.confirmActionId)}">${l.confirmText??"OK"}</ui5-button>
            </div>
        </ui5-dialog>`},Ic=e=>{const t=e.metadata,a=t.abbreviation||(t.name?t.name.split(/\s+/).map(i=>i[0]).slice(0,2).join(""):"");return o`
        <ui5-avatar slot="${e.slot??d}"
                    initials="${a||d}"
                    accessible-name="${t.name??d}">
            ${t.image?o`<img src="${t.image}" />`:d}
        </ui5-avatar>`},Tc=e=>{const a=e.metadata.avatars??[];return o`
        <ui5-avatar-group type="Group" slot="${e.slot??d}">
            ${a.map(i=>{const s=i.abbreviation||(i.name?i.name.split(/\s+/).map(r=>r[0]).slice(0,2).join(""):"");return o`<ui5-avatar initials="${s||d}" accessible-name="${i.name??d}">
                    ${i.image?o`<img src="${i.image}" />`:d}
                </ui5-avatar>`})}
        </ui5-avatar-group>`},Pc=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <span title="${l.text??""}" slot="${t.slot??d}">
            ${l.wrapped?$(e,l.wrapped,a,i,s,r,n):d}
        </span>`},Oc=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <ui5-carousel
                ?cyclic="${l.auto??!1}"
                arrows-placement="${l.alt?"Navigation":d}"
                style="${t.style??""}"
                class="${t.cssClasses??d}"
                slot="${t.slot??d}">
            ${t.children?.map(c=>$(e,c,a,i,s,r,n))}
        </ui5-carousel>`},Rc=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=`pop-opener-${t.id}`,u=m=>{const f=m.target.getRootNode().querySelector(`#pop-${t.id}`);f&&(f.opener=c,f.open=!0)};return o`
        <span slot="${t.slot??d}">
            <span id="${c}" @click="${u}" style="cursor:pointer;">
                ${l.wrapped?$(e,l.wrapped,a,i,s,r,n):d}
            </span>
            <ui5-popover id="pop-${t.id}">
                <div style="padding:.5rem;">
                    ${l.content?$(e,l.content,a,i,s,r,n):d}
                </div>
            </ui5-popover>
        </span>`},Lc=(e,t)=>{const i=t.metadata.options??[],s=n=>{n&&e.dispatchEvent(new CustomEvent("update-route",{detail:{route:n},bubbles:!0,composed:!0}))},r=n=>{if(n.submenus&&n.submenus.length>0){const l=`menu-${t.id}-${n.label}`,c=u=>{const v=u.target.getRootNode().querySelector(`#${CSS.escape(l)}`);v&&(v.opener=u.target,v.open=!0)};return o`
                <ui5-button design="Transparent" icon="${n.icon||d}" @click="${c}">${n.label}</ui5-button>
                <ui5-menu id="${l}">
                    ${n.submenus.map(u=>o`
                        <ui5-menu-item text="${u.label}" icon="${u.icon||d}"
                                       @click="${()=>s(u.path)}"></ui5-menu-item>`)}
                </ui5-menu>`}return o`<ui5-button design="Transparent" icon="${n.icon||d}" @click="${()=>s(n.path)}">${n.label}</ui5-button>`};return o`
        <div style="display:flex; flex-direction:row; gap:.25rem; align-items:center;"
             slot="${t.slot??d}">
            ${i.map(r)}
        </div>`},zc=(e,t,a,i,s,r,n)=>{const l=t.metadata;let c=t.style??"";l?.fullWidth&&(c+="width: 100%;"),l?.justification&&(c+=`justify-content: ${l.justification};`),l?.verticalAlignment&&(c+=`align-items: ${l.verticalAlignment};`);const u=l?.spacing?"1rem":"0";return o`
        <div style="display: flex; flex-direction: row; flex-wrap: ${l?.wrap?"wrap":"nowrap"}; gap: ${u}; ${c}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(m=>$(e,m,a,i,s,r,n))}
        </div>`},Dc=(e,t,a,i,s,r,n)=>{const l=t.metadata;let c=t.style??"";l?.fullWidth&&(c+="width: 100%;"),l?.justification&&(c+=`justify-content: ${l.justification};`),l?.horizontalAlignment&&(c+=`align-items: ${l.horizontalAlignment};`);const u=l?.spacing?"1rem":"0";return o`
        <div style="display: flex; flex-direction: column; gap: ${u}; ${c}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(m=>$(e,m,a,i,s,r,n))}
        </div>`},Ts=(e,t,a,i,s,r,n,l)=>{const c=t;if(c.type===U.ClientSide&&(c.metadata?.type===h.FormRow||c.metadata?.type===h.FormItem))return o`${c.children?.map(u=>Ts(e,u,a,i,s,r,n,l))}`;if(c.type===U.ClientSide&&c.metadata?.type===h.FormField){const u=c.metadata,m=u?.colspan??1,v=u?.stereotype==="grid"&&(u?.colspan??1)<=1;if(m>1||v)return o`<div style="grid-column: ${v?"1 / -1":`span ${Math.min(m,l)}`}; min-width: 0;">
                ${$(e,t,a,i,s,r,n)}
            </div>`}return $(e,t,a,i,s,r,n)},Ac=(e,t,a,i,s,r,n)=>o`${t.children?.map(l=>$(e,l,a,i,s,r,n))}`,Ps=e=>(e??[]).reduce((t,a)=>{const i=a,s=i.metadata?.type;return s===h.FormRow||s===h.FormItem?t+Ps(i.children):t+1},0),Fc=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=l?.maxColumns&&l.maxColumns>0?l.maxColumns:2,u=Math.max(1,Math.min(c,Ps(t.children)));let m=t.style??"";return l?.fullWidth&&(m+="width: 100%;"),o`
        <div style="display: grid; grid-template-columns: repeat(${u}, 1fr); gap: 1rem; ${m}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(v=>Ts(e,v,a,i,s,r,n,u))}
        </div>`},Nc=(e,t,a,i,s,r,n)=>{const l=t.metadata;let c=t.style??"";return l?.fullWidth&&(c+="width: 100%;"),o`
        <ui5-tabcontainer
            style="${c}"
            class="${t.cssClasses??d}"
            slot="${t.slot??d}"
        >
            ${t.children?.map(u=>{const m=u,v=m.metadata;return o`
                    <ui5-tab text="${v?.label??""}">
                        ${m.children?.map(f=>$(e,f,a,i,s,r,n))}
                    </ui5-tab>`})}
        </ui5-tabcontainer>`},qc=(e,t,a,i,s,r,n)=>{const l=t.metadata;let c=t.style??"";return l?.fullWidth&&(c+="width: 100%;"),o`
        <div style="${c}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(u=>{const m=u,v=m.metadata;return o`
                    <ui5-panel
                        header-text="${v?.label??""}"
                        ?collapsed="${!v?.active}"
                        ?disabled="${v?.disabled}"
                        style="margin-bottom: 0.5rem;"
                    >
                        ${m.children?.map(f=>$(e,f,a,i,s,r,n))}
                    </ui5-panel>`})}
        </div>`},Mc=(e,t,a,i,s,r,n)=>o`
        <div style="display: flex; gap: 1rem; ${t.style??""}"
             slot="${t.slot??d}">
            <div style="flex: 1;">${t.children?.[0]?$(e,t.children[0],a,i,s,r,n):d}</div>
            <div style="flex: 1;">${t.children?.[1]?$(e,t.children[1],a,i,s,r,n):d}</div>
        </div>`,Uc=(e,t,a,i,s,r,n)=>o`
        <div style="overflow: auto; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(l=>$(e,l,a,i,s,r,n))}
        </div>`,Bc=(e,t,a,i,s,r,n)=>o`
        <div style="width: 100%; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(l=>$(e,l,a,i,s,r,n))}
        </div>`,jc=(e,t,a,i,s,r,n)=>o`
        <div style="max-width: 800px; margin: auto; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(l=>$(e,l,a,i,s,r,n))}
        </div>`,Wc=(e,t,a,i,s,r,n)=>o`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(l=>$(e,l,a,i,s,r,n))}
        </div>`,Vc=(e,t,a,i,s,r,n)=>o`
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; ${t.style??""}"
             class="${t.cssClasses??d}">
            ${t.children?.map(l=>$(e,l,a,i,s,r,n))}
        </div>`,Hc=(e,t,a,i,s,r,n)=>{const c=t.metadata?.boardCols,u=c?`flex: ${c}; ${t.style??""}`:`flex: 1; ${t.style??""}`;return o`
        <div style="${u}" class="${t.cssClasses??d}">
            ${t.children?.map(m=>$(e,m,a,i,s,r,n))}
        </div>`},Gc=(e,t,a,i,s)=>{const r=e.metadata,n=r.text??"",l={id:R(e.id),style:e.style??d,class:e.cssClasses??d,slot:e.slot??d};return r.container===G.h1?o`<h1 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h1>`:r.container===G.h2?o`<h2 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h2>`:r.container===G.h3?o`<h3 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h3>`:r.container===G.h4?o`<h4 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h4>`:r.container===G.h5?o`<h5 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h5>`:r.container===G.h6?o`<h6 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h6>`:r.container===G.span?o`<span id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</span>`:o`<p id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</p>`},Kc=(e,t,a)=>{const i=e.metadata,s=i?.text??"",r=i?.color??"",n=(()=>{const l=String(r).toUpperCase();return l==="SUCCESS"?"8":l==="ERROR"||l==="DANGER"?"1":l==="WARNING"?"6":l==="INFO"?"4":l==="PRIMARY"?"5":""})();return o`
        <ui5-tag
            color-scheme="${n||d}"
            style="${e.style??d}"
            slot="${e.slot??d}"
        >${s}</ui5-tag>`},Jc=e=>{const a=(e.metadata?.icon??"").replace(/^vaadin:/,"").replace(/^lumo:/,"");return o`
        <ui5-icon
            name="${a||"question-mark"}"
            style="${e.style??d}"
            class="${e.cssClasses??d}"
            slot="${e.slot??d}"
        ></ui5-icon>`},Yc=e=>{const t=e.metadata,a=t?.breadcrumbs??[],i=t?.currentItemText??"";return o`
        <ui5-breadcrumbs slot="${e.slot??d}">
            ${a.map(s=>o`
                <ui5-breadcrumbs-item href="${s.link??d}">${s.text}</ui5-breadcrumbs-item>
            `)}
            ${i?o`<ui5-breadcrumbs-item>${i}</ui5-breadcrumbs-item>`:d}
        </ui5-breadcrumbs>`},Xc=e=>{const t=e.metadata;return o`
        <ui5-message-strip
            design="Information"
            style="${e.style??d}"
            slot="${e.slot??d}"
        >
            ${t?.title?o`<strong>${t.title}: </strong>`:d}
            ${t?.text??""}
        </ui5-message-strip>`},Qc=e=>{const t=e.metadata,a=t?.value??0,i=t?.label??`${a}%`,s=t?.valueState??"None";return o`
        <ui5-progress-indicator
            value="${a}"
            value-state="${s}"
            display-value="${i}"
            style="${e.style??d}"
            slot="${e.slot??d}"
        ></ui5-progress-indicator>`},Zc=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=l?.summary??l?.label??"",u=l?.open??!1;return o`
        <ui5-panel
            header-text="${c}"
            ?collapsed="${!u}"
            style="${t.style??d}"
            class="${t.cssClasses??d}"
            slot="${t.slot??d}"
        >
            ${t.children?.map(m=>$(e,m,a,i,s,r,n))}
        </ui5-panel>`},eu=e=>{const t=e.metadata,a=t?.src??t?.url??"",i=t?.alt??"";return o`
        <img
            src="${a}"
            alt="${i}"
            style="${e.style??d}"
            class="${e.cssClasses??d}"
            slot="${e.slot??d}"
        />`},tu=e=>{const t=e.metadata;return o`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style??d}" class="${e.cssClasses??d}"
                        slot="${e.slot??d}"></mateu-markdown>`},au=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=(f,b)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:f,parameters:b},bubbles:!0,composed:!0}))},u=f=>{const b=[];return f?.forEach(x=>{const g=x.metadata;g?.type===h.GridGroupColumn?b.push(...u(g.columns??g.content??x.children)):g&&b.push({...g,id:g.id??x.id})}),b},m=u(l.content);if(l.tree){const f=l.page?.content??[],b=m[0],x=m.slice(1),g=P=>x.map(D=>P[D.id]!=null?`${D.label}: ${P[D.id]}`:"").filter(D=>D).join(" · "),_=P=>o`
            <ui5-tree-item
                text="${String(P[b?.id??""]??"")}"
                additional-text="${g(P)||d}"
                ?has-children="${(P.children?.length??0)>0}"
                expanded
            >
                ${P.children?.map(D=>_(D))}
            </ui5-tree-item>`;return o`
            <ui5-tree no-data-text="No data."
                      style="${t.style??"width: 100%;"}" class="${t.cssClasses??d}"
                      slot="${t.slot??d}">
                ${f.map(P=>_(P))}
            </ui5-tree>`}let v=l.page?.content??[];return t.id&&i&&i[t.id]&&(v=i[t.id]),o`
        <ui5-table no-data-text="No data." overflow-mode="Popin"
                   style="${t.style??"width: 100%;"}" class="${t.cssClasses??d}"
                   slot="${t.slot??d}">
            <ui5-table-header-row slot="headerRow">
                ${m.map(f=>o`
                    <ui5-table-header-cell width="${f.width??d}">${f.label??""}</ui5-table-header-cell>
                `)}
            </ui5-table-header-row>
            ${v.map((f,b)=>o`
                <ui5-table-row row-key="${f._rowNumber??b}">
                    ${m.map(x=>o`
                        <ui5-table-cell>${fi(f,x,c)}</ui5-table-cell>
                    `)}
                </ui5-table-row>
            `)}
        </ui5-table>`},iu=(e,t,a,i,s,r,n)=>o`
    <mateu-sapui5-table
        id="${t.id}"
        .metadata="${t.metadata}"
        .data="${s}"
        .state="${i}"
        .appState="${r}"
        .appData="${n}"
        baseUrl="${a??""}"
        style="${t.style??d}"
        class="${t.cssClasses??d}"
        slot="${t.slot??d}"
    >
        ${t.children?.map(l=>$(e,l,a,i,s,r,n))}
    </mateu-sapui5-table>`,su=(e,t,a,i,s,r,n)=>{const c=t.metadata.page?.content??[];return o`
        <div style="overflow-y: auto; ${t.style??""}" class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${c.map(u=>$(e,u,a,i,s,r,n))}
        </div>`},ru=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=`ctx-menu-${t.id}`,u=(f,b)=>{b.path&&f?.dispatchEvent(new CustomEvent("update-route",{detail:{route:b.path},bubbles:!0,composed:!0}))},m=f=>o`
        ${f.map(b=>b.separator?o`<ui5-menu-separator></ui5-menu-separator>`:o`
                <ui5-menu-item
                    text="${b.label??""}"
                    ?disabled="${b.disabled}"
                    @click="${x=>u(x.target,b)}"
                >
                    ${b.submenus?m(b.submenus):d}
                </ui5-menu-item>`)}
    `,v=f=>{f.preventDefault();const x=f.currentTarget.getRootNode().querySelector(`#${CSS.escape(c)}`);x&&(x.opener=f.currentTarget,x.open=!0)};return o`
        <span style="${t.style??d}" class="${t.cssClasses??d}"
              slot="${t.slot??d}"
              @contextmenu="${l.activateOnLeftClick?d:v}"
              @click="${l.activateOnLeftClick?v:d}">
            ${$(e,l.wrapped,a,i,s,r,n)}
            <ui5-menu id="${c}">
                ${m(l.menu??[])}
            </ui5-menu>
        </span>`},ou=e=>{const t=e.metadata,a=i=>i.submenus?o`
            <ui5-panel header-text="${i.label??""}" style="min-width: 12rem;">
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${i.submenus.map(s=>a(s))}
                </div>
            </ui5-panel>`:o`<ui5-link href="${i.path??d}">${i.label}</ui5-link>`;return o`
        <div style="display: flex; gap: 3rem; align-items: flex-start; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${t.menu.map(i=>a(i))}
        </div>`},nu=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <div style="${t.style??d}" class="${t.cssClasses??d}"
             slot="${t.slot??d}" data-colspan="${l.colspan||d}">
            ${l.label?o`<ui5-label show-colon>${l.label}</ui5-label>`:d}
            <div>${$(e,l.content,a,i,s,r,n)}</div>
        </div>`},lu=(e,t,a,i,s,r,n)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=s?.detailComponent??null,u=!!s?.hasDetail||!!l,m=c??l;return o`
        <div style="display: flex; gap: 0; width: 100%; border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; overflow: hidden; ${t.style??""}"
             class="${t.cssClasses??d}" slot="${t.slot??d}">
            <div style="flex: 1; min-width: 0; overflow-y: auto;">
                ${$(e,t.children[0],a,i,s,r,n)}
            </div>
            <div style="flex: 1; min-width: 0; overflow-y: auto; border-left: 1px solid var(--sapNeutralBorderColor, #e5e5e5); ${u&&m?"":"display: flex; align-items: center; justify-content: center;"}">
                ${u&&m?$(e,m,a,i,s,r,n):o`<span style="color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem; padding: 1rem;">Select an item to view details</span>`}
            </div>
        </div>`},du=e=>{const t=e.state?.items??e.metadata?.items??[];return o`
        <div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 0.5rem; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${t.map(a=>o`
                <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                    <ui5-avatar size="XS" initials="${(a.userName??"?").split(/\s+/).map(i=>i[0]).slice(0,2).join("")}"></ui5-avatar>
                    <div>
                        ${a.userName?o`<div style="font-size: 0.75rem; color: var(--sapContent_LabelColor, #6a6d70);">${a.userName}</div>`:d}
                        <div>${a.text}</div>
                    </div>
                </div>
            `)}
        </div>`},cu=e=>{const t=a=>{const s=a.target.parentElement?.querySelector("ui5-input"),r=s?.value??"";r&&(a.target.dispatchEvent(new CustomEvent("submit",{detail:{value:r},bubbles:!0,composed:!0})),s&&(s.value=""))};return o`
        <div style="display: flex; gap: 0.5rem; align-items: center; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            <ui5-input placeholder="Message" style="flex: 1;"
                       @keydown="${a=>{a.key==="Enter"&&t(a)}}"></ui5-input>
            <ui5-button design="Emphasized" @click="${t}">Send</ui5-button>
        </div>`},he=e=>{const t=e.target;t.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.value,fieldId:t.id},bubbles:!0,composed:!0}))},Wi=e=>{const t=e.target;t.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.checked,fieldId:t.id},bubbles:!0,composed:!0}))},uu=e=>{const t=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},hu=new Set([h.App,h.Page,h.Form,h.Button,h.FormField,h.HorizontalLayout,h.VerticalLayout,h.FormLayout,h.FormRow,h.FormSection,h.FormSubSection,h.Card,h.TabLayout,h.AccordionLayout,h.SplitLayout,h.MasterDetailLayout,h.Scroller,h.FullWidth,h.Container,h.BoardLayout,h.BoardLayoutRow,h.BoardLayoutItem,h.Text,h.Badge,h.Icon,h.Breadcrumbs,h.Notification,h.ProgressBar,h.Details,h.Image,h.Anchor,h.Dialog,h.Drawer,h.ConfirmDialog,h.Avatar,h.AvatarGroup,h.Tooltip,h.CarouselLayout,h.Popover,h.MenuBar,h.ContextMenu,h.Markdown,h.Grid,h.Table,h.VirtualList,h.Directory,h.CustomField,h.MessageList,h.MessageInput,h.Crud,h.Element,h.Div,h.MicroFrontend,h.Chart,h.Bpmn,h.CookieConsent,h.Map,h.Chat,h.Workflow,h.WorkflowElk,h.FormEditor,h.MetricCard,h.Scoreboard,h.DashboardPanel,h.DashboardLayout,h.FoldoutLayout,h.HeroSection,h.EmptyState,h.Skeleton,h.Gantt,h.Kanban,h.Timeline,h.ProgressSteps,h.Stat,h.Calendar,h.PricingTable,h.OrgChart,h.Heatmap,h.Funnel,h.TrendChart,h.FeatureGrid,h.Testimonials,h.Faq,h.CalloutCard,h.CommentThread,h.FileList]);class pu extends Xn{rendererName(){return"sapui5"}supportedClientSideTypes(){return hu}rendersCrudLayouts(){return!0}renderToolbarButton(t,a,i){const s=t,r=s.color==="error"||s.variant==="error"||s.variant==="danger"?"Negative":s.buttonStyle==="primary"?"Emphasized":"Default";return o`
            <ui5-button data-action-id="${s.id}" design="${r}" ?disabled="${s.disabled}"
                        @click="${i}">${a}</ui5-button>`}renderClientSideComponent(t,a,i,s,r,n,l,c){return h.App==a?.metadata?.type?$c(t,a,i):h.Page==a?.metadata?.type?yc(t,a,i,s,r,n,l):h.Form==a?.metadata?.type?xc(t,a,i,s,r,n,l):h.Button==a?.metadata?.type?ll(a):h.FormField==a?.metadata?.type?kl(t,a,i,s,r):h.HorizontalLayout==a?.metadata?.type?zc(t,a,i,s,r,n,l):h.VerticalLayout==a?.metadata?.type?Dc(t,a,i,s,r,n,l):h.FormLayout==a?.metadata?.type?Fc(t,a,i,s,r,n,l):h.FormRow==a?.metadata?.type?Ac(t,a,i,s,r,n,l):h.FormSection==a?.metadata?.type?wc(t,a,i,s,r,n,l):h.FormSubSection==a?.metadata?.type?kc(t,a,i,s,r,n,l):h.Card==a?.metadata?.type?Cc(t,a,i,s,r,n,l):h.TabLayout==a?.metadata?.type?Nc(t,a,i,s,r,n,l):h.AccordionLayout==a?.metadata?.type?qc(t,a,i,s,r,n,l):h.SplitLayout==a?.metadata?.type?Mc(t,a,i,s,r,n,l):h.Scroller==a?.metadata?.type?Uc(t,a,i,s,r,n,l):h.FullWidth==a?.metadata?.type?Bc(t,a,i,s,r,n,l):h.Container==a?.metadata?.type?jc(t,a,i,s,r,n,l):h.BoardLayout==a?.metadata?.type?Wc(t,a,i,s,r,n,l):h.BoardLayoutRow==a?.metadata?.type?Vc(t,a,i,s,r,n,l):h.BoardLayoutItem==a?.metadata?.type?Hc(t,a,i,s,r,n,l):h.Text==a?.metadata?.type?Gc(a):h.Badge==a?.metadata?.type?Kc(a):h.Icon==a?.metadata?.type?Jc(a):h.Breadcrumbs==a?.metadata?.type?Yc(a):h.Notification==a?.metadata?.type?Xc(a):h.ProgressBar==a?.metadata?.type?Qc(a):h.Details==a?.metadata?.type?Zc(t,a,i,s,r,n,l):h.Image==a?.metadata?.type?eu(a):h.Anchor==a?.metadata?.type?Sc(a):h.Dialog==a?.metadata?.type?_c(t,a,i,s,r,n,l):h.ConfirmDialog==a?.metadata?.type?Ec(t,a,i,s,r,n,l):h.Avatar==a?.metadata?.type?Ic(a):h.AvatarGroup==a?.metadata?.type?Tc(a):h.Tooltip==a?.metadata?.type?Pc(t,a,i,s,r,n,l):h.CarouselLayout==a?.metadata?.type?Oc(t,a,i,s,r,n,l):h.Popover==a?.metadata?.type?Rc(t,a,i,s,r,n,l):h.MenuBar==a?.metadata?.type?Lc(t,a):h.ContextMenu==a?.metadata?.type?ru(t,a,i,s,r,n,l):h.Markdown==a?.metadata?.type?tu(a):h.Grid==a?.metadata?.type?au(t,a,i,s):h.Table==a?.metadata?.type?iu(t,a,i,s,r,n,l):h.VirtualList==a?.metadata?.type?su(t,a,i,s,r,n,l):h.Directory==a?.metadata?.type?ou(a):h.CustomField==a?.metadata?.type?nu(t,a,i,s,r,n,l):h.MasterDetailLayout==a?.metadata?.type?lu(t,a,i,s,r,n,l):h.MessageList==a?.metadata?.type?du(a):h.MessageInput==a?.metadata?.type?cu(a):super.renderClientSideComponent(t,a,i,s,r,n,l,c)}renderFilterBar(t,a,i,s,r,n,l){const c=a?.metadata,u=v=>{const{fieldId:f,value:b}=v.detail;t.state={...t.state,[f]:b}},m=v=>{const{fieldIds:f}=v.detail,b={};f?.forEach(x=>{b[x]=void 0}),b.searchText=void 0,t.state={...t.state,...b}};return o`
            <mateu-sapui5-filter-bar
                .metadata="${c}"
                .state="${t.state}"
                .data="${r}"
                .appState="${n}"
                .appData="${l}"
                baseUrl="${i??""}"
                @search-requested="${t.search}"
                @value-changed="${u}"
                @filter-reset-requested="${m}"
                @action-requested="${v=>{v.stopPropagation(),t.dispatchEvent(new CustomEvent("action-requested",{detail:v.detail,bubbles:!0,composed:!0}))}}"
            >
                ${c?.header?.map(v=>$(t,v,i,s,r,n,l))}
            </mateu-sapui5-filter-bar>
        `}renderPagination(t,a){const i=t.id;return o`
            <mateu-sapui5-pagination
                totalElements="${t.data[i]?.page?.totalElements??0}"
                pageSize="${t.data[i]?.page?.pageSize??100}"
                pageNumber="${t.data[i]?.page?.pageNumber??0}"
                @page-changed="${t.pageChanged}"
                @fetch-more-elements="${t.fetchMoreElements}"
            ></mateu-sapui5-pagination>
        `}renderTableComponent(t,a,i,s,r,n,l){return o`
            <mateu-sapui5-table
                id="${t.id}"
                .metadata="${a?.metadata}"
                .data="${t.data}"
                .state="${s}"
                .appState="${n}"
                .appData="${l}"
                .emptyStateMessage="${s[a?.id]?.emptyStateMessage}"
                baseUrl="${i}"
                @sort-changed="${c=>{t.state.sort=c.detail.sorts,t.handleSearchRequested(void 0)}}"
                @fetch-more-elements="${t.fetchMoreElements}"
                @action-requested="${c=>{c.stopPropagation(),t.dispatchEvent(new CustomEvent("action-requested",{detail:c.detail,bubbles:!0,composed:!0}))}}"
            ></mateu-sapui5-table>
        `}}var mu=Object.defineProperty,vu=Object.getOwnPropertyDescriptor,at=(e,t,a,i)=>{for(var s=i>1?void 0:i?vu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&mu(t,a,s),s};let De=class extends E{constructor(){super(...arguments),this.baseUrl="",this.route=void 0,this.consumedRoute="_empty",this.config=void 0,this.top="true",this.pathPrefix=void 0,this.debug=!1,this._lastUrl="",this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top=="true"){let t=e.detail.route,a=this.baseUrl??"";!t||t.startsWith("/")?a=window.location.origin+(this.pathPrefix??""):(t=(this.pathPrefix??"")+t,a.indexOf("://")<0&&(a.startsWith("/")||(a="/"+a),a=window.location.origin+a)),t.startsWith(this.pathPrefix+"/")&&(t=t.substring(this.pathPrefix?.length)),a.endsWith("/")&&t.startsWith("/")&&(t=t.substring(1));let i=new URL(a+t);if((window.location.pathname||i.pathname)&&window.location.pathname!=i.pathname){let s=i.pathname;i.search&&(s+=i.search),s&&!s.startsWith("/")&&(s="/"+s),window.history.pushState({},"",s),this._lastUrl=window.location.href}}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),Yt.markClean(),e instanceof CustomEvent){let t=e.detail.route;const a=this.renderRoot.querySelector("mateu-ux");a&&(a.setAttribute("route",t),a.setAttribute("instant",ie()))}}}createRenderRoot(){return K.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),Yt.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!Yt.confirmLeave()){window.history.pushState({},"",this._lastUrl);return}const t=e.target;this.loadUrl(t)},this.top=="true"?this.loadUrl(window):this.route&&(this.consumedRoute=""),this.config)try{const e=JSON.parse(this.config);X.value={...X.value,...e}}catch{X.value={...X.value,config:this.config}}this.addEventListener("url-update-requested",this.routeChangedListener),this.addEventListener("navigate-to-requested",this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener("url-update-requested",this.routeChangedListener),this.removeEventListener("navigate-to-requested",this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute("route",this.route),this.instant=ie(),this._lastUrl=e.location.href,e.location.search){const a=new URLSearchParams(e.location.search).get("overrides");if(a&&(this.config=a,this.config))try{const i=JSON.parse(this.config);X.value={...X.value,...i}}catch{X.value={...X.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){const t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t=="/"?"":t}addQueryParams(e,t){return e+(t.search?""+t.search:"")}extractGrossRouteFromUrl(e){const t=e.location.pathname,a=this.baseUrl&&(this.baseUrl.startsWith("http://")||this.baseUrl.startsWith("https://"))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(a)?t.substring(a.length):t}getContextPathStartingIndex(e){return e.startsWith("http:")?e.indexOf("/",7):e.startsWith("https:")?e.indexOf("/",8):0}render(){return o`
           <mateu-api-caller>
                <mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${Qt.value}"
                          .appState="${X.value}"
                ></mateu-ux>
           </mateu-api-caller>
           ${this.debug?o`
               <mateu-debug-overlay
                   .appState="${X.value}"
                   .appData="${Qt.value}"
               ></mateu-debug-overlay>
           `:d}
       `}};De.styles=S`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `;at([p()],De.prototype,"baseUrl",2);at([p()],De.prototype,"route",2);at([p()],De.prototype,"consumedRoute",2);at([p()],De.prototype,"config",2);at([p()],De.prototype,"top",2);at([p()],De.prototype,"pathPrefix",2);at([y()],De.prototype,"instant",2);at([p({type:Boolean})],De.prototype,"debug",2);De=at([C("mateu-ui")],De);var fu=Object.getOwnPropertyDescriptor,bu=(e,t,a,i)=>{for(var s=i>1?void 0:i?fu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=n(s)||s);return s};let ai=class extends na{constructor(){super(...arguments),this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}render(){const e=this.component?.metadata;return o`
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
            </div>`}};ai.styles=S`
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
    `;ai=bu([C("mateu-sapui5-form")],ai);K.set(new pu);
