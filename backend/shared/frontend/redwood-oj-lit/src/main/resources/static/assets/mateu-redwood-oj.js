const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-highcharts.js","assets/vendor-vaadin.js","assets/vendor-lit.js","assets/vendor.js","assets/vendor-ui5.js","assets/vendor-diagrams.js"])))=>i.map(i=>d[i]);
import{d as o,A as d,a as C,j as m,r as $,i as S,k,m as ge,D as gr,c as O,w as J,p as Do,q as et,s as No}from"./vendor-lit.js";import{v as Fo,b as wt,e as Mo,f as qo,n as $r,p as yr,N as ia,i as Ht,j as Mi,k as xr,l as ss,m as Cs,o as Uo}from"./vendor-vaadin.js";import{S as Bo,n as ye,a as Vo,b as Wo}from"./vendor.js";import{_ as Te,N as bi}from"./vendor-ui5.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function a(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(i){if(i.ep)return;i.ep=!0;const r=a(i);fetch(i.href,r)}})();var v=(e=>(e.Page="Page",e.Div="Div",e.Element="Element",e.MicroFrontend="MicroFrontend",e.Form="Form",e.Crud="Crud",e.Result="Result",e.Card="Card",e.Directory="Directory",e.Stepper="Stepper",e.HorizontalLayout="HorizontalLayout",e.VerticalLayout="VerticalLayout",e.SplitLayout="SplitLayout",e.MasterDetailLayout="MasterDetailLayout",e.TabLayout="TabLayout",e.AccordionLayout="AccordionLayout",e.FormLayout="FormLayout",e.FormRow="FormRow",e.FormItem="FormItem",e.BoardLayout="BoardLayout",e.BoardLayoutRow="BoardLayoutRow",e.BoardLayoutItem="BoardLayoutItem",e.Scroller="Scroller",e.FullWidth="FullWidth",e.Container="Container",e.FormField="FormField",e.Table="Table",e.App="App",e.Text="Text",e.Avatar="Avatar",e.Chat="Chat",e.AvatarGroup="AvatarGroup",e.Badge="Badge",e.Breadcrumbs="Breadcrumbs",e.Anchor="Anchor",e.Button="Button",e.Chart="Chart",e.Icon="Icon",e.ConfirmDialog="ConfirmDialog",e.ContextMenu="ContextMenu",e.CookieConsent="CookieConsent",e.Details="Details",e.Dialog="Dialog",e.Drawer="Drawer",e.Image="Image",e.Map="Map",e.Markdown="Markdown",e.Notification="Notification",e.ProgressBar="ProgressBar",e.Popover="Popover",e.CarouselLayout="CarouselLayout",e.Tooltip="Tooltip",e.MessageInput="MessageInput",e.MessageList="MessageList",e.CustomField="CustomField",e.MenuBar="MenuBar",e.Grid="Grid",e.GridColumn="GridColumn",e.GridGroupColumn="GridGroupColumn",e.VirtualList="VirtualList",e.FormSection="FormSection",e.FormSubSection="FormSubSection",e.Bpmn="Bpmn",e.Workflow="Workflow",e.WorkflowElk="WorkflowElk",e.FormEditor="FormEditor",e.MetricCard="MetricCard",e.Scoreboard="Scoreboard",e.DashboardPanel="DashboardPanel",e.DashboardLayout="DashboardLayout",e.FoldoutLayout="FoldoutLayout",e.HeroSection="HeroSection",e.EmptyState="EmptyState",e.Skeleton="Skeleton",e.Gantt="Gantt",e.PlanningBoard="PlanningBoard",e.Kanban="Kanban",e.Timeline="Timeline",e.ProgressSteps="ProgressSteps",e.Stat="Stat",e.Calendar="Calendar",e.PricingTable="PricingTable",e.OrgChart="OrgChart",e.Heatmap="Heatmap",e.Funnel="Funnel",e.TrendChart="TrendChart",e.FeatureGrid="FeatureGrid",e.Testimonials="Testimonials",e.Faq="Faq",e.CalloutCard="CalloutCard",e.CommentThread="CommentThread",e.FileList="FileList",e.Checklist="Checklist",e.ComparisonCard="ComparisonCard",e.EntityHeader="EntityHeader",e.Meter="Meter",e.TaskProgress="TaskProgress",e.StatusList="StatusList",e.BulletedList="BulletedList",e.Separator="Separator",e.Notice="Notice",e.TaskQueue="TaskQueue",e.ResourceGrid="ResourceGrid",e.OfferCard="OfferCard",e.AddOnPicker="AddOnPicker",e.Ledger="Ledger",e.PaymentPicker="PaymentPicker",e.ProcessMonitor="ProcessMonitor",e))(v||{}),oe=(e=>(e.ServerSide="ServerSide",e.ClientSide="ClientSide",e))(oe||{});class Ho{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(t){if(this.componentRenderer=t,typeof window<"u"){const a=t.supportedClientSideTypes?.();window.__mateuRendererInfo={name:t.rendererName?.()??t.constructor?.name??"unknown",supportedTypes:a?[...a].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(t){this.useShadowRoot=t}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(t){this.afterRenderHook=t}getAfterRenderHook(){return this.afterRenderHook}}const te=new Ho,ta=(e,t,a,s,i,r,n,l,c)=>(t.slot=l,w(e,t,a,s,i,r,n,c)),w=(e,t,a,s,i,r,n,l)=>{if(!t)return o``;if(t.type==oe.ClientSide)return te.get().renderClientSideComponent(e,t,a,s,i,r,n,l);const c=e.route,u=e.consumedRoute;return o`
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
                         .appData="${n}"
        >
       </mateu-component>`},Go=640,Ko=e=>e>0&&e<Go?"accordion":"tabs";var Yo=Object.defineProperty,Jo=Object.getOwnPropertyDescriptor,qi=(e,t,a,s)=>{for(var i=s>1?void 0:s?Jo(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Yo(t,a,i),i};let ka=class extends S{constructor(){super(...arguments),this.tabLabels=[],this.mode="tabs",this.selected=0,this.selectedChangedListener=e=>{const t=e.detail?.value;typeof t=="number"&&t>=0&&(this.selected=t)}}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{for(const t of e)this.mode=Ko(t.contentRect.width)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect(),this.resizeObserver=void 0,this.detachTabsListener()}detachTabsListener(){this.slottedTabs?.removeEventListener("selected-changed",this.selectedChangedListener),this.slottedTabs=void 0}tabsSlotChanged(e){this.detachTabsListener();const a=e.target.assignedElements().find(s=>"selected"in s);a&&(this.slottedTabs=a,a.addEventListener("selected-changed",this.selectedChangedListener),a.selected=this.selected)}select(e){this.selected=e,this.slottedTabs&&(this.slottedTabs.selected=e)}updated(){this.slottedTabs&&this.slottedTabs.selected!=this.selected&&(this.slottedTabs.selected=this.selected)}render(){return o`
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
        `}};ka.styles=C`
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
    `;qi([m({type:Array})],ka.prototype,"tabLabels",2);qi([$()],ka.prototype,"mode",2);qi([$()],ka.prototype,"selected",2);ka=qi([k("mateu-adaptive-tabs")],ka);const Xo=(e,t,a,s,i,r,n)=>{const l=t.metadata;let c=t.style;return c==null&&(c=""),l.columnSpacing&&(c+="--vaadin-form-layout-column-spacing: "+l.columnSpacing+";"),l.itemRowSpacing&&(c+="--vaadin-form-layout-row-spacing: "+l.itemRowSpacing+";"),l.itemLabelSpacing&&(c+="--vaadin-form-layout-label-spacing: "+l.itemLabelSpacing+";"),l.labelsAside&&(c+="--vaadin-form-item-label-width: 92px;"),l.fullWidth&&(c+="width: 100%;"),o`
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
                   ${t.children?.map(u=>wr(l,e,u,a,s,i,r,n))}
               </vaadin-form-layout>
            `},wr=(e,t,a,s,i,r,n,l)=>a.type==oe.ClientSide&&a.metadata?.type==v.FormRow?Zo(e,t,a,s,i,r,n,l):e.labelsAside?Qo(t,a,s,i,r,n,l):w(t,a,s,i,r,n,l),Qo=(e,t,a,s,i,r,n)=>{if(t.type==oe.ClientSide&&t.metadata?.type==v.FormField&&t.metadata.label){const l=t.metadata,c=l.label?.includes("${")?e._evalTemplate(l.label):l.label;return o`
                       <vaadin-form-item data-colspan="${l.colspan}">
                           <label slot="label">${c}</label>
                           ${w(e,t,a,s,i,r,n,!0)}
                       </vaadin-form-item>
                   `}return w(e,t,a,s,i,r,n)},Zo=(e,t,a,s,i,r,n,l)=>o`
        <vaadin-form-row>
            ${a.children?.map(c=>wr(e,t,c,s,i,r,n,l))}
        </vaadin-form-row>
            `,en=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let u=t.style;return l.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),l.justification&&(u=u?"justify-content: "+l.justification+";"+u:"justify-content: "+l.justification+";"),l.verticalAlignment&&(u=u?"align-items: "+l.verticalAlignment+";"+u:"align-items: "+l.verticalAlignment+";"),o`
               <vaadin-horizontal-layout 
                       style="${u}" 
                       class="${t.cssClasses}"
                       theme="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(h=>w(e,h,a,s,i,r,n))}
               </vaadin-horizontal-layout>
            `},tn=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let u=t.style;return l.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),l.justification&&(u=u?"justify-content: "+l.justification+";"+u:"justify-content: "+l.justification+";"),l.horizontalAlignment&&(u=u?"align-items: "+l.horizontalAlignment+";"+u:"align-items: "+l.horizontalAlignment+";"),o`
        <vaadin-vertical-layout
                style="${u}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(h=>w(e,h,a,s,i,r,n))}
        </vaadin-vertical-layout>
    `},an=(e,t,a,s,i,r,n)=>{const l=t.metadata;let c=t.style;return l.fullWidth&&(c=c?"width: 100%;"+c:"width: 100%;"),o`
               <vaadin-split-layout 
                       style="${c}" 
                       class="${t.cssClasses}"
                       orientation="${l.orientation??d}"
                       theme="${l.variant??d}"
                       slot="${t.slot??d}"
               >
                   <master-content>${w(e,t.children[0],a,s,i,r,n)}</master-content>
                   <detail-content>${w(e,t.children[1],a,s,i,r,n)}</detail-content>
               </vaadin-split-layout>
            `},sn=(e,t,a,s,i,r,n)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,u=!!i?.hasDetail||!!l,h=c??l;return o`
               <vaadin-master-detail-layout ?has-detail="${u}"
                                            style="${t.style}"
                                            class="${t.cssClasses}"
                                            slot="${t.slot??d}">
                   <div>${w(e,t.children[0],a,s,i,r,n)}</div>
                   ${u&&h?o`<div slot="detail">${w(e,h,a,s,i,r,n)}</div>`:o`<div slot="detail" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Select an item to view details</div>`}
               </vaadin-master-detail-layout>
            `},rn=(e,t,a,s,i,r,n)=>{const l=t.metadata;let c=t.style;c==null&&(c=""),l.fullWidth&&(c+="width: 100%;");let u=l.variant;u=="equalWidth"&&(u="equal-width-tabs");const h=Math.max(0,(t.children??[]).findIndex(f=>f.metadata.active)),p=f=>{f.target.selected=h};if(l.adaptable){const f=(t.children??[]).map(g=>{const y=g.metadata.label;return y?.includes("${")?e._evalTemplate(y):y});return o`
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
                    ${t.children?.map(g=>g).map((g,y)=>{const x=g.metadata.shortcut;return o`
                        <vaadin-tab id="${f[y]}"
                                    style="${g.style}"
                                    class="${g.cssClasses}"
                                    data-shortcut="${x??d}"
                        >${f[y]}</vaadin-tab>`})}
                </vaadin-tabs>

                ${t.children?.map((g,y)=>o`
                    <div slot="panel-${y}" style="padding: var(--lumo-space-m) 0;">
                        ${g.children?.map(x=>w(e,x,a,s,i,r,n))}
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
                         @items-changed=${p}
            >
                ${t.children?.map(f=>f).map(f=>{const g=f.metadata.label,y=g?.includes("${")?e._evalTemplate(g):g,x=f.metadata.shortcut;return o`
                    <vaadin-tab id="${y}"
                                style="${f.style}"
                                class="${f.cssClasses}"
                                data-shortcut="${x??d}"
                    >${y}</vaadin-tab>`})}
            </vaadin-tabs>

            ${t.children?.map(f=>on(e,f,a,s,i,r,n))}
        </vaadin-tabsheet>
            `},on=(e,t,a,s,i,r,n)=>{const l=t.metadata.label,c=l?.includes("${")?e._evalTemplate(l):l;return o`
        <div tab="${c}" style="padding: var(--lumo-space-m) 0;">
                   ${t.children?.map(u=>w(e,u,a,s,i,r,n))}
               </div>
            `},nn=(e,t,a,s,i,r,n)=>{const l=t.metadata;t.style,l.fullWidth;let c=0;if(t.children){for(let u=0;u<t.children.length;u++)if(t.children[u].metadata?.active){c=u;break}}return o`
               <vaadin-accordion
                       style="${t.style}"
                       class="${t.cssClasses}"
                       opened="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(u=>ln(e,u,a,s,i,r,n,l.variant))}
               </vaadin-accordion>
            `},ln=(e,t,a,s,i,r,n,l)=>{const c=t.metadata,u=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return o`
        <vaadin-accordion-panel style="${t.style}"
                                class="${t.cssClasses}"
                                theme="${l??d}"
                                ?opened="${c.active}"
                                ?disabled="${c.disabled}">
            <vaadin-accordion-heading slot="summary">${u}</vaadin-accordion-heading>
            ${t.children?.map(h=>w(e,h,a,s,i,r,n))}
        </vaadin-accordion-panel>
            `},dn=(e,t,a,s,i,r,n)=>o`
               <vaadin-scroller style="${t.style}" 
                                class="${t.cssClasses}"
                                slot="${t.slot??d}">
                   ${t.children?.map(l=>w(e,l,a,s,i,r,n))}
               </vaadin-scroller>
            `,cn=(e,t,a,s,i,r,n)=>o`
               <div style="width: 100%; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??d}">
                   ${t.children?.map(l=>w(e,l,a,s,i,r,n))}
               </div>
            `,un=(e,t,a,s,i,r,n)=>o`
               <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??d}">
                   ${t.children?.map(l=>w(e,l,a,s,i,r,n))}
               </div>
            `,pn=(e,t,a,s,i,r,n)=>o`
        <vaadin-board style="${t.style}" 
                      class="${t.cssClasses}"
                      slot="${t.slot??d}">
            ${t.children?.map(l=>w(e,l,a,s,i,r,n))}
        </vaadin-board>
            `,hn=(e,t,a,s,i,r,n)=>o`
        <vaadin-board-row style="${t.style}" class="${t.cssClasses}">
                   ${t.children?.map(l=>w(e,l,a,s,i,r,n))}
               </vaadin-board-row>
            `,mn=(e,t,a,s,i,r,n)=>{const l=t.metadata;return o`
        <div style="${t.style}" 
             class="${t.cssClasses}"
             board-cols="${l.boardCols??d}"
        >
                   ${t.children?.map(c=>w(e,c,a,s,i,r,n))}
               </div>
            `},Ca=(e,t)=>new Function(...Object.keys(t),"return `"+e+"`")(...Object.values(t)),Oa=(e,t,a)=>({state:e??{},data:t??{},...a});function Oe(e,t,a,s){if(!e?.includes("${"))return e;try{return Ca(e,Oa(t,a,s))}catch(i){return console.warn(`Mateu: could not interpolate "${e}":`,i),e}}const xt=(e,t,a)=>{if(e&&e.indexOf("${")>=0)try{return Ca(e,Oa(t,a))}catch(s){return s.message}return e},Ui=(e,t,a,s,i)=>{if(!e)return e;const r=Oa(t,a,{appState:s??{},appData:i??{}});let n=e;try{if(n=Ca(e,r),n.includes("${"))try{n=Ca(n,r)}catch(l){n="when evaluating nested "+e+" :"+l+", where data is "+a+" and state is "+t+" and app state is "+s+" and app data is "+i,console.error(l,n,t,a,s,i)}}catch(l){n="when evaluating "+e+" :"+l+", where data is "+a+" and state is "+t+" and app state is "+s+" and app data is "+i,console.error(l,n,t,a,s,i)}return n},kr=(e,t,a,s,i,r)=>{const n=Oa(t,a,{appState:s??{},appData:i??{},...r}),l=Ca(e,n);return new Function(...Object.keys(n),`return (${l})`)(...Object.values(n))},Cr=(e,t,a,s)=>{const i=Oa(t,a,s);return new Function(...Object.keys(i),`return (${e})`)(...Object.values(i))},vn=(e,t,a,s)=>Ca(e,Oa(t,a,s)),fn=(e,t,a)=>{const s=e.metadata;return o`<vaadin-avatar
            img="${s.image}"
            name="${de(s.name,t,a)}"
            abbr="${s.abbreviation}"
            style="${e.style}" class="${e.cssClasses}"
            slot="${e.slot??d}"
    ></vaadin-avatar>`},de=(e,t,a)=>typeof e=="string"&&e.includes("${")?Oe(e,t,a):e,bn=e=>{const t=e.metadata;return o`<vaadin-avatar-group max-items-visible="${t.maxItemsVisible}"
                                     .items="${t.avatars}"
                                     style="${e.style}" class="${e.cssClasses}"
                                     slot="${e.slot??d}">
    </vaadin-avatar-group>`},gn=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=u=>o`
            ${w(e,u,a,s,i,r,n)}
`;return o`
        <vaadin-virtual-list
                .items="${l.page.content}"
                ${Fo(c,[])}
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
        ></vaadin-virtual-list>
    `};var $n=Object.defineProperty,yn=Object.getOwnPropertyDescriptor,Ss=(e,t,a,s)=>{for(var i=s>1?void 0:s?yn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&$n(t,a,i),i};let Ga=class extends S{constructor(){super(...arguments),this.variant="text",this.count=3}render(){const e=Array.from({length:Math.max(1,this.count)});return this.variant=="card"?o`${e.map(()=>o`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant=="grid"?o`${e.map(()=>o`<div class="bone row"></div>`)}`:this.variant=="form"?o`${e.map(()=>o`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:o`${e.map(()=>o`<div class="bone line"></div>`)}`}};Ga.styles=C`
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
    `;Ss([m()],Ga.prototype,"variant",2);Ss([m({type:Number})],Ga.prototype,"count",2);Ga=Ss([k("mateu-skeleton")],Ga);const xn=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},aa=(e,t,a,s,i,r)=>o`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${t??"🗂"}</span>
            ${a?o`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${a}</span>`:d}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${s??e??"Nothing here yet."}</span>
            ${i&&r?o`
                <vaadin-button theme="tertiary" style="margin-top: .25rem;" @click="${n=>xn(n,i)}">${r}</vaadin-button>
            `:d}
        </div>
    `,wn=e=>{const t=e.metadata;return o`
        <div style="${e.style??d}" class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${aa(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},kn=e=>{const t=e.metadata;return o`
        <mateu-skeleton
                variant="${t.variant??"text"}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-skeleton>
    `},Ha=e=>!!e&&typeof e=="object"&&"__mateuGroup"in e,rs=e=>String(e??""),Sr=(e,t,a)=>{const s=e??[];if(!t||!a||a.length===0)return s;const i=[];let r,n=!1;return s.forEach((l,c)=>{const u=rs(l?.[t]);if(!n||u!==r){const h=a.find(p=>rs(p.value)===u)??{value:u,count:s.filter(p=>rs(p?.[t])===u).length,aggregates:{}};i.push({__mateuGroup:h,__mateuGroupBy:t,_rowNumber:`__mateuGroup:${c}:${u}`}),n=!0,r=u}i.push(l)}),i},Ir=(e,t)=>e==null?"":t.dataType==="money"||t.stereotype==="money"?new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(e):t.aggregate==="count"?new Intl.NumberFormat(void 0,{maximumFractionDigits:0}).format(Math.round(e)):new Intl.NumberFormat(void 0,{maximumFractionDigits:2}).format(e),_r=(e,t)=>e&&t.includes(e)?e:t.find(a=>!!a),Er=(e,t,a)=>{const s=e.__mateuGroup;return t.id===a?`${s.value} (${s.count})`:t.aggregate?Ir(s.aggregates?.[t.id],t):""},Pr=(e,t,a)=>{const s=t?.aggregates;if(!s||!e.some(n=>n.aggregate))return;const i={};e.forEach(n=>{n.aggregate&&s[n.id]!=null&&(i[n.id]=Ir(s[n.id],n))});const r=e[0];if(r&&i[r.id]===void 0){const n=t?.page?.totalElements;i[r.id]=a&&r.id===a&&n!=null?`Total (${n})`:"Total"}return i};var Wa=(e=>(e.NONE="NONE",e.INFO="INFO",e.SUCCESS="SUCCESS",e.WARNING="WARNING",e.DANGER="DANGER",e))(Wa||{});const Cn=(e,t,a)=>{const s=e[a.path];return s?o`<span theme="badge pill ${Bi(s.type)}">${s.message}</span>`:o``},Bi=e=>{switch(e){case Wa.SUCCESS:return"success";case Wa.WARNING:return"warning";case Wa.DANGER:return"error";case Wa.NONE:return"contrast"}return""},Sn=(e,t,a)=>{const i=e[a.path]?"vaadin:check":"vaadin:minus";return o`<vaadin-icon 
                    icon="${i}"
                    style="height: 16px; width: 16px; color: ${"var(--lumo-body-text-color)"};"
            ></vaadin-icon>`},In=(e,t,a,s,i)=>{const r=e[a.path];let n=r;return s=="money"&&r&&r.locale&&r.currency?n=new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(r.value):i=="money"&&(n=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(r)),o`${n}`},Hs=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},_n=(e,t,a,s,i,r)=>{const n=a.xcolumn??r;if(n.text){if(n.actionId)return o`<a href="javascript: void(0);" @click="${u=>Hs(a,n,e)}">${n.text}</a>`;const c=e[a.path];return o`<a href="${c}">${n.text}</a>`}if(s=="string"){if(n.actionId){const u=e[a.path];return o`<a href="javascript: void(0);" @click="${h=>Hs(a,n,e)}">${u}</a>`}const c=e[a.path];return o`<a href="${c}">${c}</a>`}const l=e[a.path];return o`<a href="${l.href}">${l.text}</a>`},En=(e,t,a,s,i)=>s=="string"?e[a.path].split(",").map(l=>o`<vaadin-icon icon="${l}" style="width: 16px;"></vaadin-icon>`):e[a.path].split(",").map(n=>o`<vaadin-icon icon="${n.icon}" style="width: 16px;"></vaadin-icon>`),Pn=(e,t,a,s,i)=>{const r=e[a.path];return o`${ge(r)}`},Tn=(e,t,a,s,i,r)=>{if(s=="string"){const l=e[a.path],c="max-height: 40px; "+(r.style??"");return o`<img src="${l}" style="${c}">`}const n=e[a.path];return o`<img src="${n.src}" style="${r.style??""}">`},On=e=>{const t={_clickedRow:e.target.row};e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+e.detail.value.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Gs=e=>{const t={_clickedRow:e.target.row},a=e.target.action;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+a.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Rn=e=>{const t=document.createElement("vaadin-context-menu-item"),a=document.createElement("vaadin-icon");return a.style.color="var(--lumo-secondary-text-color)",a.style.marginInlineEnd="var(--lumo-space-s)",a.style.padding="var(--lumo-space-xs)",a.setAttribute("icon",e.icon),t.appendChild(a),e.label&&t.appendChild(document.createTextNode(e.label)),t.disabled=e.disabled,t},Ks=(e,t,a)=>{const s=e[a.path]?.actions?.map(i=>i.icon?{component:Rn(i),methodNameInCrud:i.methodNameInCrud}:{...i,text:i.label});return!s||s.length==0?o``:o`
                                     <vaadin-menu-bar
                                         .items=${[{text:"···",children:s}]}
                                         theme="tertiary"
                                         .row="${e}"
                                         data-testid="menubar-${a.path}"
                                         @item-selected="${On}"
                                     ></vaadin-menu-bar>
                                   `},zn=(e,t,a)=>{if(a.path=="select"){const r={actionId:a.path,icon:"",label:"Select",disabled:!1,methodNameInCrud:"select"};return o`
         <vaadin-button theme="tertiary" title="Select" @click="${Gs}" .row="${e}" .action="${r}">
             Select
         </vaadin-button>
    `}const s=a.path&&e[a.path]?.methodNameInCrud?e[a.path]:e.action;if(!s)return o``;const i=s.icon&&!s.label;return o`
         <vaadin-button theme="tertiary${i?" icon":""}" title="${s.label||d}" @click="${Gs}" .row="${e}" .action="${s}">
             ${s.icon?o`<vaadin-icon icon="${s.icon}"></vaadin-icon>`:d}
             ${s.label?s.label:d}
         </vaadin-button>
    `},An=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},jn=(e,t,a,s,i,r)=>{const n=a.xcolumn??r;if(n.actionId){const c=n.text||e[a.path];return o`
            <vaadin-button theme="tertiary" @click="${u=>An(a,n,e)}" .row="${e}">
                ${c}
            </vaadin-button>
        `}const l=e[a.path];return o`<a href="${l}">${n.text||l}</a>`},Ln=(e,t,a,s,i,r,n,l,c)=>{const u=e[a.path];return w(s,u,i,r,n,l,c)},vs=new WeakMap,Dn=(e,t)=>vs.get(e)?.[t],Nn=(e,t,a)=>{let s=vs.get(e);s||(s={},vs.set(e,s)),s[t]=a},Ys=e=>{if(e==null||e==="")return null;const t=Number(e);return Number.isNaN(t)?null:t},Fn=(e,t,a,s)=>{const i=a?.field?.fieldId,r=c=>{if(e[t.id]===c||e[t.id]==null&&(c===""||c==null))return;if(e[t.id]=c,!i){a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"update-row",parameters:{_editedRow:{...e}}},bubbles:!0,composed:!0}));return}const h=(a?.state??s)[i];a.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:i,value:Array.isArray(h)?[...h]:h},bubbles:!0,composed:!0}))},n=e[t.id],l=n==null?"":String(n);switch(t.editorType){case"boolean":return o`<vaadin-checkbox ?checked=${!!n} @checked-changed=${c=>r(c.detail.value)}></vaadin-checkbox>`;case"integer":return o`<vaadin-integer-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(Ys(c.target.value))}></vaadin-integer-field>`;case"number":return o`<vaadin-number-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(Ys(c.target.value))}></vaadin-number-field>`;case"date":return o`<vaadin-date-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-date-picker>`;case"time":return o`<vaadin-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-time-picker>`;case"datetime":return o`<vaadin-date-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-date-time-picker>`;case"select":return o`<vaadin-combo-box
                theme="small" style="width:100%;"
                .items=${(t.editorOptions??[]).map(c=>({label:c.label,value:String(c.value)}))}
                item-label-path="label" item-value-path="value"
                .value=${l}
                @value-changed=${c=>r(c.detail.value)}></vaadin-combo-box>`;case"lookup":{const c=a?.field?.fieldId,u=`search-${c}-${t.id}`,h=`${c}-${t.id}`,f=(t.editorOptions??[]).find(y=>String(y.value)===l)??(l?{value:l,label:Dn(e,t.id)??l}:void 0);return o`<vaadin-combo-box
                theme="small" style="width:100%;"
                item-label-path="label" item-id-path="value"
                .dataProvider=${(y,x)=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:u,parameters:{searchText:y.filter,size:y.pageSize,page:y.page},callback:P=>{const q=P?.fragments?.[0]?.data?.[h];x(q?.content??[],q?.totalElements??0)},callbackonly:!0},bubbles:!0,composed:!0}))}}
                .selectedItem=${f}
                @selected-item-changed=${y=>{const x=y.detail.value,P=x?x.value:null;String(P??"")!==l&&(x&&Nn(e,t.id,x.label),r(P))}}></vaadin-combo-box>`}default:return o`<vaadin-text-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(c.target.value)}></vaadin-text-field>`}},os=e=>Mo(()=>o`<span title="${e}" style="white-space:normal;overflow-wrap:break-word;">${e}</span>`,[e]),ns=e=>e!==void 0?qo(()=>o`<span style="font-weight: 600; white-space: nowrap;">${e}</span>`,[e]):d,Mn=e=>{e.preventDefault(),e.stopPropagation(),e.currentTarget?.dispatchEvent(new CustomEvent("sort-direction-changed",{detail:{grid:e.currentTarget.parentElement},bubbles:!0,composed:!0}))},qn=(e,t,a,s,i,r,n,l)=>{const c=Oe(e.label,s,i);return o`
<vaadin-grid-column-group header="${c}">
    ${e.columns.map(u=>Tr(u.metadata,t,a,s,i,r,n,l?.[u.metadata?.id]))}
</vaadin-grid-column-group>
`},Is=(e,t,a,s,i,r,n,l)=>v.GridGroupColumn==e.metadata?.type?qn(e.metadata,t,a,s,i,r,n,l):Tr(e.metadata,t,a,s,i,r,n,l?.[e.metadata?.id]),Tr=(e,t,a,s,i,r,n,l)=>{const c=Oe(e.label,s,i);return e.sortable?o`
                        <vaadin-grid-sort-column
                                path="${e.id}"
                                text-align="${e.align??d}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??d}"
                                ?resizable="${e.resizable}"
                                width="${e.width??d}"
                                @direction-changed="${Mn}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${os(c)}
                                ${ns(l)}
                                ${wt((u,h,p)=>yi(u,h,p,e,t,a,s,i,r,n),[])}
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
                                ${os(c)}
                                ${ns(l)}
                                ${wt((u,h,p)=>yi(u,h,p,e,t,a,s,i,r,n),[])}
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
                                ${os(c)}
                                ${ns(l)}
                                ${wt((u,h,p)=>yi(u,h,p,e,t,a,s,i,r,n),[])}
                        ></vaadin-grid-column>
                    `},yi=(e,t,a,s,i,r,n,l,c,u)=>{const h=a.dataset.dataType??"",p=a.dataset.stereotype??"";if(Ha(e)){const g=i?.metadata,y=(g?.columns??[]).flatMap(N=>N?.metadata?.type===v.GridGroupColumn?(N.metadata.columns??[]).map(ne=>ne?.metadata?.id):[N?.metadata?.id]),x=_r(e.__mateuGroupBy,y),P=Er(e,s,x),q=e.__mateuGroup.hiddenActions??[],ae=s.id===y[y.length-1]?(g?.groupActions??[]).filter(N=>!q.includes(N.actionId??N.id)):[];return ae.length?o`<span style="display: flex; align-items: center; justify-content: flex-end; gap: var(--lumo-space-s); overflow: hidden;">
                ${P?o`<span style="font-weight: 600;">${P}</span>`:d}
                ${ae.map(N=>o`
                    <vaadin-button theme="tertiary small" style="flex-shrink: 0;"
                        @click="${ne=>{ne.stopPropagation(),ne.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+(N.actionId??N.id),parameters:{_groupValue:e.__mateuGroup.value}},bubbles:!0,composed:!0}))}}">${N.label??N.caption??""}</vaadin-button>
                `)}
            </span>`:o`<span title="${P}" style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${P}</span>`}if(s.editable)return Fn(e,s,i,n);if(h=="status")return Cn(e,t,a);if(h=="bool")return Sn(e,t,a);if(h=="money"||p=="money")return In(e,t,a,h,p);if(h=="link"||p=="link")return _n(e,t,a,h,p,s);if(h=="icon"||p=="icon")return En(e,t,a,h);if(p=="html")return Pn(e,t,a);if(p=="image")return Tn(e,t,a,h,p,s);if(h=="menu")return Ks(e,t,a);if(h=="component")return Ln(e,t,a,i,r,n,l,c,u);if(h=="action")return zn(e,t,a);if(h=="actionGroup")return Ks(e,t,a);if(p=="button"||s.actionId)return jn(e,t,a,h,p,s);const f=e[a.path];return o`<span title="${f}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${f}</span>`},Un=(e,t,a,s,i,r,n)=>{const l=t.metadata;if(l.tree){const u=async(h,p)=>{const f=h.parentItem?h.parentItem.children:l.page.content;p(f,f.length)};return o`
        <vaadin-grid style="${t.style}" class="${t.cssClasses}"
                     .itemHasChildrenPath="${"children"}" .dataProvider="${u}"
                     slot="${t.slot??d}"
                     all-rows-visible
        >
            ${l.content.map((h,p)=>{const f=h.metadata;return p>0?o`
            <vaadin-grid-column path="${h.id}"
                                header="${f?.label??d}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??d}"
                                width="${f?.width??d}"
                                .column="${h.metadata}"
                                ${wt((g,y,x)=>yi(g,y,x,f,e,a,s,i,r,n),[])}></vaadin-grid-column>
`:o`
            <vaadin-grid-tree-column path="${h.id}"
                                header="${f?.label??d}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??d}"
                                width="${f?.width??d}"
            ></vaadin-grid-tree-column>
`})}
            <span slot="empty-state">${aa()}</span>
        </vaadin-grid>
    `}let c=l.page?.content;return t.id&&s&&s[t.id]&&(c=s[t.id]),c||(c=[]),o`
        <vaadin-grid 
                style="${t.style}" 
                class="${t.cssClasses}" 
                .items="${c}"
                all-rows-visible
        >
            ${l?.content?.map(u=>Is(u,e,a,s,i,r,n))}
        </vaadin-grid>
    `},Bn=e=>{const a=(e.metadata.items??[]).map(s=>({text:s.text,time:s.time,userName:s.userName,userImg:s.userImg,userAbbr:s.userAbbr,userColorIndex:s.userColorIndex}));return o`
        <vaadin-message-list
                markdown
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??d}"
                .items="${a}"
        ></vaadin-message-list>
    `},Lt=new Bo,le={value:{}},Ka={value:{}},Vn=(e,t,a,s,i,r,n)=>{const l=t.metadata;return o`
        <vaadin-context-menu .items=${_s(e,l.menu,a,s,i,r,n)} 
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             open-on="${l.activateOnLeftClick?"click":d}"
                             slot="${t.slot??d}">
            ${w(e,l.wrapped,a,s,i,r,n)}
        </vaadin-context-menu>
            `},Wn=(e,t,a,s,i)=>{const r=t.metadata;return o`
        <vaadin-menu-bar .items=${_s(e,r.options,a,s,i,le,Ka)}
                         style="${t.style}" class="${t.cssClasses}"
                         slot="${t.slot??d}">
        </vaadin-menu-bar>
            `},Js=(e,t,a,s,i,r,n)=>{const l=document.createElement("vaadin-context-menu-item");return gr(w(e,t,a,s,i,r,n),l),l},_s=(e,t,a,s,i,r,n)=>t.map(l=>l.submenus?{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?Js(e,l.component,a,s,i,r,n):void 0,children:_s(e,l.submenus,a,s,i,r,n)}:l.separator?{component:"hr"}:{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?Js(e,l.component,a,s,i,r,n):void 0}),Hn=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=l.content?.metadata,u=c?.type==v.Notice&&c.fullWidth===!0;return o`
        <vaadin-custom-field label="${l.label}"
                             style="${u?"width: 100%; ":""}${t.style}"
                             class="${t.cssClasses}"
                             slot="${t.slot??d}"
                             data-colspan="${l.colspan||(u?99:d)}"
        >
            ${w(e,l.content,a,s,i,r,n)}
        </vaadin-custom-field>
            `},Gn=e=>{const t=e.metadata,a=s=>{const i=s.detail?.value??"";!t.actionId||!i.trim()||s.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:{message:i}},bubbles:!0,composed:!0}))};return o`
        <vaadin-message-input
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??d}"
                @submit="${a}"
        ></vaadin-message-input>
    `},Kn=(e,t,a,s,i,r,n)=>{const l=t.metadata;return o`
        <div id="show-notifications">${w(e,l.wrapped,a,s,i,r,n)}</div>
        <vaadin-tooltip
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
                for="show-notifications" text="${l.text}" position="top-start"></vaadin-tooltip>
    `},Yn=e=>{if(e instanceof CustomEvent)return e.detail;const t={};for(const a in e){const s=e[a];["number","string","boolean"].indexOf(typeof s)>=0&&(t[a]=e[a])}return t},Xs=(e,t,a)=>{for(let s in t.attributes)e.setAttribute(s,t.attributes[s]);a.style&&e.setAttribute("style",a.style),a.cssClasses&&e.setAttribute("class",a.cssClasses),a.slot&&e.setAttribute("slot",a.slot),t.content&&(t.html?e.innerHTML=t.content:e.append(t.content))},Jn=e=>{const t=e.name;t.startsWith("vaadin-chart")&&!customElements.get(t)&&Te(()=>import("./vendor-highcharts.js"),__vite__mapDeps([0,1,2,3,4]));const a=e.attributes?e.attributes.import:void 0;a&&t.includes("-")&&!customElements.get(t)&&import(a)},Xn=(e,t,a)=>{Jn(t);let s=t.name;return t.attributes&&t.attributes.id&&(s="#"+t.attributes.id),setTimeout(()=>{const i=e.shadowRoot?.querySelector(".element-container")?.querySelector(s);if(i){for(;i.firstChild;)i.removeChild(i.lastChild);Xs(i,t,a)}else{const r=document.createElement(t.name);Xs(r,t,a);for(let n in t.on)r.addEventListener(n,l=>{const c=Yn(l);e.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.on[n],parameters:{event:c}},bubbles:!0,composed:!0}))});e.shadowRoot?.querySelector(".element-container")?.appendChild(r)}}),o`<div class="element-container"></div>`};var rt=(e=>(e.div="div",e.p="p",e.h1="h1",e.h2="h2",e.h3="h3",e.h4="h4",e.h5="h5",e.h6="h6",e.span="span",e))(rt||{});const Qn=(e,t,a,s,i)=>{const r=e.metadata,n=r.attributes?.["data-colspan"],l=Ui(r.text,t,a,s,i),c={xl:"var(--lumo-font-size-xl, 1.375rem)",l:"var(--lumo-font-size-l, 1.125rem)",s:"var(--lumo-font-size-s, .875rem)",xs:"var(--lumo-font-size-xs, .8125rem)"},u=(r.size&&c[r.size]?`font-size: ${c[r.size]}; `:"")+(r.noMargins?"margin-block-start: 0; margin-block-end: 0; ":"");return rt.h1==r.container?o`
            <h1 style="${u}${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h1>
        `:rt.h2==r.container?o`
            <h2 style="${u}${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h2>
        `:rt.h3==r.container?o`
            <h3 style="${u}${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h3>
        `:rt.h4==r.container?o`
            <h4 style="${u}${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h4>
        `:rt.h5==r.container?o`
            <h5 style="${u}${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h5>
        `:rt.h6==r.container?o`
            <h6 style="${u}${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h6>
        `:rt.p==r.container?o`
               <p style="${u}${e.style}" class="${e.cssClasses}"
                  id="${O(e.id)}"
                  data-colspan="${O(n)}"
                  slot="${e.slot??d}">
                   ${l??d}
               </p>
            `:rt.div==r.container?o`
               <div style="${u}${e.style}" class="${e.cssClasses}"
                    id="${O(e.id)}"
                    data-colspan="${O(n)}"
                    slot="${e.slot??d}">${l?ge(l):d}</div>
            `:rt.span==r.container?o`
               <span style="${u}${e.style}" class="${e.cssClasses}"
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
            `},Zn=(e,t,a)=>{const s=e.metadata;return o`<span theme="badge ${s.color} ${s.pill?"pill":""} ${s.small?"small":""} ${s.primary?"primary":""}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??d}">${de(s.text,t,a)}</span>`},el=(e,t,a)=>{const s=de(e.text,t,a);if(!s)return d;let i=de(e.color,t,a);return i=="SUCCESS"&&(i="success"),i=="ERROR"&&(i="error"),i=="DANGER"&&(i="error"),i=="WARNING"&&(i="warning"),i=="INFO"&&(i="info"),i=="PRIMARY"&&(i="primary"),i=="SECONDARY"&&(i="secondary"),i=="TERTIARY"&&(i="tertiary"),i=="QUATERNARY"&&(i="quaternary"),i=="LIGHT"&&(i="light"),i=="DARK"&&(i="dark"),o`<span theme="badge ${i} ${e.pill?"pill":""} ${e.small?"small":""} ${e.primary?"primary":""}">${s}</span>`},tl=e=>{const t=e.metadata;return o`<a href="${t.url}" target="${t.target??d}"
                   rel="${t.target==="_blank"?"noopener":d}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}">${t.text}</a>`},Or=(e,t)=>{const a=e.toLowerCase().split("+");return t.ctrlKey===a.includes("ctrl")&&t.altKey===a.includes("alt")&&t.shiftKey===a.includes("shift")&&t.metaKey===a.includes("meta")},al=(e,t)=>{if(!Or(e,t))return!1;const a=e.toLowerCase().split("+"),s=a[a.length-1];return!!(t.key.toLowerCase()===s||/^[a-z]$/.test(s)&&t.code==="Key"+s.toUpperCase()||/^[0-9]$/.test(s)&&(t.code==="Digit"+s||t.code==="Numpad"+s))},il=e=>e?e.split("+").map(t=>t.length<=1?t.toUpperCase():t.charAt(0).toUpperCase()+t.slice(1)).join("+"):void 0,sl=(e,t)=>{const a=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a,parameters:t.parameters},bubbles:!0,composed:!0}))},rl=(e,t,a)=>{const s=e.metadata,i=Oe(s.label,t,a);let r="";return s.buttonStyle&&(r+=" "+s.buttonStyle),s.color&&s.color!=="none"&&s.color!=="normal"&&(r+=" "+s.color),s.size&&s.size!=="none"&&s.size!=="normal"&&(r+=" "+s.size),o`<vaadin-button
id="${e.id}"
            data-action-id="${s.actionId}"
            @click="${n=>sl(n,s)}"
            style="${e.style}"
            class="${e.cssClasses}"
            theme="${r}"
            ?disabled="${s.disabled}"
            title="${s.shortcut?`${i} (${il(s.shortcut)})`:d}"
            slot="${e.slot??d}"
    >${s.iconOnLeft?o`<vaadin-icon icon="${s.iconOnLeft}"></vaadin-icon>`:d}${i}${s.iconOnRight?o`<vaadin-icon icon="${s.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>`},ol=(e,t,a,s,i,r,n)=>{const l=t.metadata;if(!l)return o``;let c="";return l.variants?.map(u=>u=="stretchMedia"?"stretch-media":u=="coverMedia"?"cover-media":u).forEach(u=>c+=" "+u),c=c.trim(),o`
        <vaadin-card
                style="${t.style}" 
                class="${t.cssClasses}" 
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${l.media?ta(e,l.media,a,s,i,r,n,"media",!1):d}
            ${l.title?ta(e,l.title,a,s,i,r,n,"title",!1):d}
            ${l.subtitle?ta(e,l.subtitle,a,s,i,r,n,"subtitle",!1):d}
            ${l.header?ta(e,l.header,a,s,i,r,n,"header",!1):d}
            ${l.headerPrefix?ta(e,l.headerPrefix,a,s,i,r,n,"header-prefix",!1):d}
            ${l.headerSuffix?ta(e,l.headerSuffix,a,s,i,r,n,"header-suffix",!1):d}
            ${l.footer?ta(e,l.footer,a,s,i,r,n,"footer",!1):d}
            ${l.content?w(e,l.content,a,s,i,r,n,!1):d}
        </vaadin-card>
    `},nl=e=>{const t=e.metadata;return o`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??d}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},ll=e=>{const t=e.metadata;return o`
        <vaadin-icon icon="${t.icon}" style="${e.style}" class="${e.cssClasses}"
                     slot="${e.slot??d}"></vaadin-icon>
    `},dl=(e,t,a,s,i,r,n)=>{const l=t.metadata;let c=!1;if(l.openedCondition)try{c=kr(l.openedCondition,s,i,r,n)}catch(u){console.error("when evaluating "+l.openedCondition+" :"+u+", where data is "+i+" and state is "+s)}return o`
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
  ${t.children?.map(u=>w(e,u,a,s,i,r,n))}
</vaadin-confirm-dialog>
            `},cl=e=>{const t=e.metadata;let a;return t.position&&(a={Top:"top",Bottom:"bottom",TopLeft:"top-left",TopRight:"top-right",BottomLeft:"bottom-left",BottomRight:"bottom-right"}[t.position]),o`
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
    `},ul=(e,t,a,s,i,r,n)=>{const l=t.metadata;return o`
        <vaadin-details 
                ?opened="${l.opened}" 
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            <vaadin-details-summary slot="summary">
            ${w(e,l.summary,a,s,i,r,n)}
            </vaadin-details-summary>
            ${w(e,l.content,a,s,i,r,n)}
        </vaadin-details>
            `},pl=(e,t,a,s,i,r)=>o`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${s}"
            .appState="${i}"
            .appdata="${r}"
        ></mateu-dialog>
            `,hl=(e,t,a,s,i,r)=>o`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${s}"
            .appState="${i}"
            .appdata="${r}"
        ></mateu-drawer>
            `,ml=e=>{const t=e.metadata;return o`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"  
                  route="${t.route}" 
                  consumedRoute="${t.consumedRoute}" 
                  id="${ye()}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??d}"
        ></mateu-ux>
        </mateu-api-caller>
            `},vl=e=>{const t=e.metadata;return o`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style}" class="${e.cssClasses}"
                        slot="${e.slot??d}"></mateu-markdown>
            `},fl=e=>{const t=e.metadata;return o`
        <vaadin-notification
                .opened="${!0}"
                slot="${e.slot??d}"
                style="${e.style}"
                class="${e.cssClasses}"
                ${$r(()=>o`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${t.title}</h3>
                        <div>
                            ${t.text}
                        </div>
                    </vaadin-horizontal-layout>
                `,[])}
        ></vaadin-notification>
            `},bl=(e,t={})=>{const a=e.metadata,s=a.valueKey?t[a.valueKey]:a.value;return o`
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
        ${a.text?o`<span class="text-secondary text-xs" id="sublbl">
    ${a.text}
  </span>`:d}
        </div>
    `},gl=(e,t,a,s,i,r,n)=>{const l=t.metadata;return o`
        <div id="show-notifications">${w(e,l.wrapped,a,s,i,r,n)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                slot="${t.slot??d}"
                ${yr(()=>o`${w(e,l.content,a,s,i,r,n)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
        ></vaadin-popover>
    `},$l=e=>{const t=e.metadata;return o`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}"></mateu-map>
            `},yl=e=>{const t=e.metadata;return o`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??d}">
            `},xl=e=>{const t=e.metadata;return o`<vaadin-horizontal-layout theme="spacing"
                                          slot="${e.slot??d}">
        ${t.breadcrumbs.map(a=>o`
            <a href="${a.link}">${a.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </vaadin-horizontal-layout>`},wl=(e,t,a,s,i,r,n)=>{const l=t.metadata;return o`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${l.dots}" 
                ?nav = "${l.nav}" 
                ?loop = "${l.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(c=>o`<div>${w(e,c,a,s,i,r,n)}</div>`)}
        </skeleton-carousel>
    `},kl=(e,t,a,s)=>{const i=e.metadata;return o`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            ${i.menu.map(r=>Rr(r))}
        </div>
            `},Rr=e=>o`
        ${e.submenus?o`
                <vaadin-details summary="${e.label}" opened>
                    <vaadin-vertical-layout theme="spacing">
                        ${e.submenus.map(t=>Rr(t))}
                    </vaadin-vertical-layout>
                </vaadin-details>
            `:o`
                <a href="${e.path}">${e.label}</a>
        `}
        `,Cl=(e,t,a,s,i,r,n)=>{const l=t.metadata;return o`<div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >${l.content?ge(l.content):d}${t.children?.map(c=>w(e,c,a,s,i,r,n))}</div>
    `},Sl=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return o`<vaadin-card
                slot="${t.slot??d}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?o`<div slot="title" style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color);">${c}</div>`:d}
        ${t.children?.map(u=>w(e,u,a,s,i,r,n))}
    </vaadin-card>
    `},Il=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return o`
        <div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(u=>w(e,u,a,s,i,r,n))}</div>
    `},fs=(e,t,a,s,i,r,n,l)=>{const c=t.metadata,u=c?.fabs??[];return o`<mateu-page
            .component="${t}"
            baseUrl="${a}"
            .state="${s}"
            .data="${i}"
            .appState="${r}"
            .appdata="${n}"
            slot="${t.slot??d}"
            style="${t.style}"
            class="${t.cssClasses}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(h=>w(e,h,a,s,i,r,n))}
        ${c?.buttons?.map(h=>o`
                   ${w(e,{id:h.actionId,metadata:h,type:oe.ClientSide,slot:"buttons"},void 0,s,i,r,n)}
`)}
        ${u.map((h,p)=>o`
            <button class="page-fab" style="position: fixed; bottom: ${1.5+p*4}rem; right: 5.5rem;"
                @click="${()=>e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:h.actionId},bubbles:!0,composed:!0}))}"
                title="${h.label}">
                <vaadin-icon icon="${h.icon}"></vaadin-icon>
            </button>
        `)}
</mateu-page>
    `},bs=(e,t,a,s,i,r,n,l)=>o`<mateu-table-crud
            id="${t.id}"
            baseUrl="${a}"
            .component="${t}"
            .metadata="${t.metadata}"
            .state="${s}"
            .data="${i}"
            .appState="${r}"
            .appdata="${n}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(c=>w(e,c,a,s,i,r,n))}
    </mateu-table-crud>`,_l=e=>{const t=e.metadata;return o`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??d}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},El=(e,t,a)=>{const s=e.metadata;return o`<mateu-chat sseUrl="${s.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??d}"></mateu-chat>`},Pl=e=>{const t=e.metadata;return o`
        <mateu-workflow
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow>
    `},Tl=e=>{const t=e.metadata;return o`
        <mateu-workflow-elk
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
                ?readOnly="${t.readOnly??!1}"
        ></mateu-workflow-elk>
    `},Ol=e=>{const t=e.metadata;return o`
        <mateu-form-editor
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Form","fields":[]}'}"
        ></mateu-form-editor>
    `},zr=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,Rl=e=>e=="up"?"var(--lumo-success-text-color, #1a7f37)":e=="down"?"var(--lumo-error-text-color, #c5221f)":"var(--lumo-secondary-text-color, #666)",zl=e=>e=="up"?"▲":e=="down"?"▼":"",Al=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},jl=e=>{const t=e.metadata,a=!!t.actionId;return o`
        <div class="mateu-metric-card ${e.cssClasses??""}"
             style="${zr} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${a?"cursor: pointer;":""} ${e.style??""}"
             slot="${e.slot??d}"
             role="${a?"button":d}"
             @click="${s=>Al(s,t)}"
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
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${Rl(t.trend)};">
                    ${zl(t.trend)} ${t.trendLabel??d}
                </span>
            `:d}
            ${t.description?o`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:d}
        </div>
    `},Ll=(e,t,a,s,i,r,n)=>o`
        <div class="mateu-scoreboard ${t.cssClasses??""}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(l=>w(e,l,a,s,i,r,n))}
        </div>
    `,Dl=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=l.colSpan&&l.colSpan>1?`grid-column: span ${l.colSpan};`:"",u=l.rowSpan&&l.rowSpan>1?`grid-row: span ${l.rowSpan};`:"";return o`
        <div class="mateu-dashboard-panel ${t.cssClasses??""}"
             style="${zr} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${u} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?o`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${l.title}</h3>
                    ${l.subtitle?o`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${l.subtitle}</span>`:d}
                </div>
            `:d}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(h=>w(e,h,a,s,i,r,n))}
            </div>
        </div>
    `},Nl=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=l.columns&&l.columns>0?`repeat(${l.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return o`
        <div class="mateu-dashboard ${t.cssClasses??""}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(u=>w(e,u,a,s,i,r,n))}
        </div>
    `};var Fl=Object.defineProperty,Ml=Object.getOwnPropertyDescriptor,Es=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ml(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Fl(t,a,i),i};let Ya=class extends S{constructor(){super(...arguments),this.panels=[],this.openPanels=new Set,this.initialized=!1}willUpdate(){!this.initialized&&this.panels.length&&(this.openPanels=new Set(this.panels.map((e,t)=>e.open?t:-1).filter(e=>e>=0)),this.initialized=!0)}toggle(e){const t=new Set(this.openPanels);t.has(e)?t.delete(e):t.add(e),this.openPanels=t}render(){return o`
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
        `}};Ya.styles=C`
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
    `;Es([m({type:Array})],Ya.prototype,"panels",2);Es([$()],Ya.prototype,"openPanels",2);Ya=Es([k("mateu-foldout")],Ya);const ql=(e,t,a,s,i,r,n)=>{const l=t.metadata;return o`
        <mateu-foldout
                .panels="${l.panels??[]}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(c=>w(e,c,a,s,i,r,n))}
        </mateu-foldout>
    `},Ul=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=!!l.image,u=c?`background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${l.image}'); background-size: cover; background-position: center; color: #fff;`:"",h=l.centered===!1?"flex-start":"center",p=l.centered===!1?"left":"center";return o`
        <div class="mateu-hero ${t.cssClasses??""}"
             style="display: flex; flex-direction: column; align-items: ${h}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${p}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); min-height: ${l.height??"12rem"}; box-sizing: border-box; ${u} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?o`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${l.title}</h1>`:d}
            ${l.subtitle?o`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${c?"":"color: var(--lumo-secondary-text-color, #666);"} max-width: 40rem;">${l.subtitle}</p>`:d}
            ${t.children?.length?o`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${h}; width: 100%; max-width: 40rem;">
                    ${t.children?.map(f=>w(e,f,a,s,i,r,n))}
                </div>
            `:d}
        </div>
    `};var Bl=Object.defineProperty,Vl=Object.getOwnPropertyDescriptor,Ar=(e,t,a,s)=>{for(var i=s>1?void 0:s?Vl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Bl(t,a,i),i};const ls=1440*60*1e3;let xi=class extends S{constructor(){super(...arguments),this.tasks=[]}range(){const e=this.tasks.flatMap(t=>[t.start,t.end]).filter(t=>!!t).map(t=>new Date(t+"T00:00:00").getTime());return e.length?{min:Math.min(...e)-ls,max:Math.max(...e)+2*ls}:null}months(e,t){const a=[],s=new Date(e);for(s.setDate(1);s.getTime()<=t;){const i=Math.max(s.getTime(),e),r=new Date(s.getFullYear(),s.getMonth()+1,1),n=Math.min(r.getTime(),t);a.push({label:s.toLocaleDateString(void 0,{month:"short",year:"2-digit"}),from:i,to:n}),s.setMonth(s.getMonth()+1)}return a}render(){const e=this.range();if(!e)return o``;const t=e.max-e.min,a=i=>(i-e.min)/t*100,s=Date.now();return o`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(i=>o`
                        <div class="month" style="width: ${(i.to-i.from)/t*100}%;">${i.label}</div>
                    `)}
                </div>
                ${this.tasks.map(i=>{const r=new Date(i.start+"T00:00:00").getTime(),n=new Date(i.end+"T00:00:00").getTime()+ls;return o`
                        <div class="label" title="${i.title}">${i.title}</div>
                        <div class="lane">
                            ${s>=e.min&&s<=e.max?o`<div class="today" style="left: ${a(s)}%;"></div>`:d}
                            <div class="bar"
                                 title="${i.title} · ${i.start} → ${i.end}${i.progress?` · ${i.progress}%`:""}"
                                 style="left: ${a(r)}%; width: ${(n-r)/t*100}%; ${i.color?`--mateu-gantt-fill: ${i.color};`:""}">
                                <div class="fill" style="width: ${i.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};xi.styles=C`
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
    `;Ar([m({type:Array})],xi.prototype,"tasks",2);xi=Ar([k("mateu-gantt")],xi);const Wl=e=>{const t=e.metadata;return o`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-gantt>
    `};var Hl=Object.defineProperty,Gl=Object.getOwnPropertyDescriptor,Gt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Gl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Hl(t,a,i),i};let F=class extends S{constructor(){super(...arguments),this.resources=[],this.blocks=[],this.drag=null,this.dragStartX=0,this.dragStartY=0,this.laneRects=[],this.onDragKeydown=e=>{e.key==="Escape"&&this.drag&&(e.stopPropagation(),this.endDrag())}}static parse(e){return new Date(e+"T00:00:00")}static iso(e){const t=a=>String(a).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}static addDays(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}static daysBetween(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}window(){if(this.from&&this.to){const s=F.parse(this.from),i=F.daysBetween(s,F.parse(this.to))+1;return i>0?{from:s,days:i}:null}const e=this.blocks.flatMap(s=>[s.start,s.end]).filter(s=>!!s).map(s=>F.parse(s));if(!e.length)return null;const t=new Date(Math.min(...e.map(s=>s.getTime()))),a=new Date(Math.max(...e.map(s=>s.getTime())));return{from:t,days:F.daysBetween(t,a)+1}}onBlockPointerDown(e,t,a){if(!this.moveActionId&&!this.selectActionId||(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.dragStartX=e.clientX,this.dragStartY=e.clientY,!this.window()))return;const r=F.parse(t.start),n=F.parse(t.end),l=Math.max(1,F.daysBetween(r,n)+1);this.laneRects=[...this.renderRoot.querySelectorAll(".lane[data-resource-id]")].map(u=>({resourceId:u.dataset.resourceId,rect:u.getBoundingClientRect()}));const c=this.dayAt(t.resourceId,e.clientX)??a;this.drag={blockId:t.id,duration:l,grabOffsetDays:c-a,originResourceId:t.resourceId,originStartIdx:a,targetResourceId:t.resourceId,targetStartIdx:a,moved:!1},window.addEventListener("keydown",this.onDragKeydown)}dayAt(e,t){const a=this.laneRects.find(r=>r.resourceId===e),s=this.window();if(!a||!s||a.rect.width===0)return null;const i=Math.floor((t-a.rect.left)/a.rect.width*s.days);return Math.max(0,Math.min(s.days-1,i))}onBlockPointerMove(e){if(!this.drag||!this.drag.moved&&Math.abs(e.clientX-this.dragStartX)<4&&Math.abs(e.clientY-this.dragStartY)<4||!this.moveActionId)return;const t=this.window();if(!t)return;const a=this.laneRects.find(r=>e.clientY>=r.rect.top&&e.clientY<=r.rect.bottom)??this.laneRects.find(r=>r.resourceId===this.drag.targetResourceId);if(!a)return;const s=this.dayAt(a.resourceId,e.clientX);if(s==null)return;const i=Math.max(0,Math.min(t.days-this.drag.duration,s-this.drag.grabOffsetDays));this.drag={...this.drag,moved:!0,targetResourceId:a.resourceId,targetStartIdx:i}}onBlockPointerUp(e){const t=this.drag;if(this.endDrag(),!t)return;if(!t.moved){this.selectActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.selectActionId,parameters:{_blockId:e.id}},bubbles:!0,composed:!0}));return}if(!this.moveActionId||t.targetResourceId===t.originResourceId&&t.targetStartIdx===t.originStartIdx)return;const a=this.window();if(!a)return;const s=F.addDays(a.from,t.targetStartIdx),i=F.addDays(s,t.duration-1);this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.moveActionId,parameters:{_blockId:t.blockId,_resourceId:t.targetResourceId,_start:F.iso(s),_end:F.iso(i)}},bubbles:!0,composed:!0}))}endDrag(){this.drag=null,window.removeEventListener("keydown",this.onDragKeydown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.onDragKeydown)}render(){const e=this.window();if(!e||!this.resources.length)return o``;const t=[...Array(e.days).keys()].map(l=>F.addDays(e.from,l)),a=new Date,s=F.daysBetween(e.from,new Date(a.getFullYear(),a.getMonth(),a.getDate())),i=s>=0&&s<e.days,r=[];let n;return this.resources.forEach(l=>{l.group&&l.group!==n&&r.push(o`<div class="group">${l.group}</div>`),n=l.group,r.push(this.renderRow(l,e,t,i?s:null))}),o`
            <div class="frame" style="grid-template-columns: minmax(8rem, 12rem) repeat(${e.days}, minmax(2.2rem, 1fr));">
                <div class="corner">Resource</div>
                ${t.map((l,c)=>o`
                    <div class="day-head ${this.isWeekend(l)?"weekend":""} ${c===s?"today":""}">
                        <span class="dow">${l.toLocaleDateString(void 0,{weekday:"short"})}</span>
                        <span class="num">${l.getDate()}</span>
                    </div>
                `)}
                ${r}
            </div>
        `}isWeekend(e){return e.getDay()===0||e.getDay()===6}renderRow(e,t,a,s){const i=100/t.days,r=this.blocks.filter(l=>l.resourceId===e.id&&l.start&&l.end),n=this.drag?.moved&&this.drag.targetResourceId===e.id?this.drag:null;return o`
            <div class="label" title="${e.label??""}">${e.label}</div>
            <div class="lane" data-resource-id="${e.id}">
                <div class="cells">
                    ${a.map(l=>o`<div class="cell ${this.isWeekend(l)?"weekend":""}"></div>`)}
                </div>
                ${s!=null?o`<div class="today-line" style="left: ${(s+.5)*i}%;"></div>`:d}
                ${r.map(l=>{const c=F.daysBetween(t.from,F.parse(l.start)),u=F.daysBetween(t.from,F.parse(l.end));if(u<0||c>=t.days)return d;const h=Math.max(0,c),p=Math.min(t.days-1,u),f=this.drag?.moved&&this.drag.blockId===l.id;return o`
                        <div class="block ${this.selectActionId?"clickable":""} ${this.moveActionId?"draggable":""} ${f?"dragging":""}"
                             title="${l.label??""} · ${l.start} → ${l.end}${l.status?` · ${l.status}`:""}"
                             style="left: ${h*i}%; width: ${(p-h+1)*i}%; ${l.color?`--mateu-planning-block: ${l.color};`:""}"
                             @pointerdown="${g=>this.onBlockPointerDown(g,l,c)}"
                             @pointermove="${g=>this.onBlockPointerMove(g)}"
                             @pointerup="${()=>this.onBlockPointerUp(l)}"
                             @pointercancel="${()=>this.endDrag()}"
                        >${l.label}</div>
                    `})}
                ${n?o`
                    <div class="ghost"
                         style="left: ${n.targetStartIdx*i}%; width: ${Math.min(n.duration,t.days-n.targetStartIdx)*i}%;"></div>
                `:d}
            </div>
        `}};F.styles=C`
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
    `;Gt([m({type:Array})],F.prototype,"resources",2);Gt([m({type:Array})],F.prototype,"blocks",2);Gt([m()],F.prototype,"from",2);Gt([m()],F.prototype,"to",2);Gt([m()],F.prototype,"moveActionId",2);Gt([m()],F.prototype,"selectActionId",2);Gt([$()],F.prototype,"drag",2);F=Gt([k("mateu-planning-board")],F);const Kl=e=>{const t=e.metadata;return o`
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
    `};var Yl=Object.defineProperty,Jl=Object.getOwnPropertyDescriptor,jr=(e,t,a,s)=>{for(var i=s>1?void 0:s?Jl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Yl(t,a,i),i};let wi=class extends S{constructor(){super(...arguments),this.columns=[]}clickCard(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedCard:e}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};wi.styles=C`
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
    `;jr([m({type:Array})],wi.prototype,"columns",2);wi=jr([k("mateu-kanban")],wi);const Xl=e=>{const t=e.metadata;return o`
        <mateu-kanban
                .columns="${t.columns??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-kanban>
    `};var Ql=Object.defineProperty,Zl=Object.getOwnPropertyDescriptor,Lr=(e,t,a,s)=>{for(var i=s>1?void 0:s?Zl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Ql(t,a,i),i};let ki=class extends S{constructor(){super(...arguments),this.items=[]}clickItem(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedItem:e}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};ki.styles=C`
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
    `;Lr([m({type:Array})],ki.prototype,"items",2);ki=Lr([k("mateu-timeline")],ki);const ed=e=>{const t=e.metadata;return o`
        <mateu-timeline
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-timeline>
    `};var td=Object.defineProperty,ad=Object.getOwnPropertyDescriptor,Dr=(e,t,a,s)=>{for(var i=s>1?void 0:s?ad(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&td(t,a,i),i};let Ci=class extends S{constructor(){super(...arguments),this.steps=[]}render(){return o`
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
        `}};Ci.styles=C`
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
    `;Dr([m({type:Array})],Ci.prototype,"steps",2);Ci=Dr([k("mateu-progress-steps")],Ci);const id=e=>{const t=e.metadata;return o`
        <mateu-progress-steps
                .steps="${t.steps??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-progress-steps>
    `};var sd=Object.defineProperty,rd=Object.getOwnPropertyDescriptor,Kt=(e,t,a,s)=>{for(var i=s>1?void 0:s?rd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&sd(t,a,i),i};let ot=class extends S{constructor(){super(...arguments),this.spark=[]}sparkline(){const e=this.spark;if(!e||e.length<2)return d;const t=84,a=30,s=2,i=Math.min(...e),n=Math.max(...e)-i||1,l=(t-s*2)/(e.length-1),c=e.map((f,g)=>{const y=s+g*l,x=s+(a-s*2)*(1-(f-i)/n);return[y,x]}),u=c.map(([f,g],y)=>`${y===0?"M":"L"}${f.toFixed(1)} ${g.toFixed(1)}`).join(" "),h=`${u} L${c[c.length-1][0].toFixed(1)} ${a} L${c[0][0].toFixed(1)} ${a} Z`,p=this.trend==="down"?"var(--lumo-error-color, #e11d48)":this.trend==="flat"?"var(--lumo-secondary-text-color, #888)":"var(--lumo-success-color, #12b76a)";return J`
            <svg width="${t}" height="${a}" viewBox="0 0 ${t} ${a}">
                <path d="${h}" fill="${p}" opacity="0.12"></path>
                <path d="${u}" fill="none" stroke="${p}" stroke-width="1.6"
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
        `}};ot.styles=C`
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
    `;Kt([m()],ot.prototype,"label",2);Kt([m()],ot.prototype,"value",2);Kt([m()],ot.prototype,"unit",2);Kt([m()],ot.prototype,"delta",2);Kt([m()],ot.prototype,"trend",2);Kt([m({type:Array})],ot.prototype,"spark",2);Kt([m()],ot.prototype,"actionId",2);ot=Kt([k("mateu-stat")],ot);const od=e=>{const t=e.metadata;return o`
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
    `};var nd=Object.defineProperty,ld=Object.getOwnPropertyDescriptor,Ps=(e,t,a,s)=>{for(var i=s>1?void 0:s?ld(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&nd(t,a,i),i};let Ja=class extends S{constructor(){super(...arguments),this.events=[]}clickEvent(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedEvent:e}},bubbles:!0,composed:!0}))}render(){const e=this.month?new Date(this.month+"T00:00:00"):new Date,t=e.getFullYear(),a=e.getMonth(),s=new Date(t,a,1),i=(s.getDay()+6)%7,r=new Date(t,a+1,0).getDate(),n=new Date,l=f=>n.getFullYear()===t&&n.getMonth()===a&&n.getDate()===f,c={};for(const f of this.events){if(!f.date)continue;const g=new Date(f.date+"T00:00:00");g.getFullYear()===t&&g.getMonth()===a&&(c[g.getDate()]??=[]).push(f)}const u=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],h=[];for(let f=0;f<i;f++)h.push(o`<div class="cell blank"></div>`);for(let f=1;f<=r;f++)h.push(o`
                <div class="cell ${l(f)?"today":""}">
                    <span class="num">${f}</span>
                    ${(c[f]??[]).map(g=>o`
                        <span class="chip ${g.actionId?"clickable":""}"
                              style="${g.color?`--mateu-cal-accent: ${g.color};`:""}"
                              title="${g.title??""}"
                              @click="${()=>this.clickEvent(g)}">${g.title}</span>
                    `)}
                </div>
            `);const p=s.toLocaleDateString(void 0,{month:"long",year:"numeric"});return o`
            <div class="title">${p}</div>
            <div class="grid">
                ${u.map(f=>o`<div class="dow">${f}</div>`)}
                ${h}
            </div>
        `}};Ja.styles=C`
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
    `;Ps([m()],Ja.prototype,"month",2);Ps([m({type:Array})],Ja.prototype,"events",2);Ja=Ps([k("mateu-calendar")],Ja);const dd=e=>{const t=e.metadata;return o`
        <mateu-calendar
                month="${t.month??d}"
                .events="${t.events??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-calendar>
    `};var cd=Object.defineProperty,ud=Object.getOwnPropertyDescriptor,Nr=(e,t,a,s)=>{for(var i=s>1?void 0:s?ud(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&cd(t,a,i),i};let Si=class extends S{constructor(){super(...arguments),this.plans=[]}cta(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};Si.styles=C`
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
    `;Nr([m({type:Array})],Si.prototype,"plans",2);Si=Nr([k("mateu-pricing-table")],Si);const pd=e=>{const t=e.metadata;return o`
        <mateu-pricing-table
                .plans="${t.plans??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-pricing-table>
    `};var hd=Object.defineProperty,md=Object.getOwnPropertyDescriptor,Fr=(e,t,a,s)=>{for(var i=s>1?void 0:s?md(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&hd(t,a,i),i};let Ii=class extends S{clickNode(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedNode:e}},bubbles:!0,composed:!0}))}renderNode(e){const t=e.avatar,a=t&&(t.startsWith("http")||t.startsWith("data:"));return o`
            <li>
                <div class="node ${e.actionId?"clickable":""}"
                     style="${e.color?`--mateu-org-accent: ${e.color};`:""}"
                     @click="${()=>this.clickNode(e)}">
                    ${t?o`<span class="avatar">${a?o`<img src="${t}" alt="">`:t}</span>`:d}
                    <span class="title">${e.title}</span>
                    ${e.subtitle?o`<span class="subtitle">${e.subtitle}</span>`:d}
                </div>
                ${e.children&&e.children.length?o`<ul>${e.children.map(s=>this.renderNode(s))}</ul>`:d}
            </li>
        `}render(){return this.root?o`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`:o``}};Ii.styles=C`
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
    `;Fr([m({attribute:!1})],Ii.prototype,"root",2);Ii=Fr([k("mateu-org-chart")],Ii);const vd=e=>{const t=e.metadata;return o`
        <mateu-org-chart
                .root="${t.root}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-org-chart>
    `};var fd=Object.defineProperty,bd=Object.getOwnPropertyDescriptor,Mr=(e,t,a,s)=>{for(var i=s>1?void 0:s?bd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&fd(t,a,i),i};const gd=1440*60*1e3;let _i=class extends S{constructor(){super(...arguments),this.cells=[]}color(e,t){if(e<=0||t<=0)return"var(--lumo-contrast-10pct, #ebedf0)";const a=e/t,s=a>.75?1:a>.5?.75:a>.25?.5:.3;return`color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round(s*100)}%, transparent)`}render(){const e=this.cells.filter(c=>!!c.date);if(!e.length)return o``;const t=e.map(c=>new Date(c.date+"T00:00:00").getTime()),a=Math.min(...t),s=Math.max(...t),i=new Date(a);i.setDate(i.getDate()-(i.getDay()+6)%7);const r={};for(const c of e)r[c.date]=c;const n=Math.max(...e.map(c=>c.value??0),1),l=[];for(let c=i.getTime();c<=s;c+=gd){const u=new Date(c),h=u.toISOString().slice(0,10),p=r[h],f=p?.value??0,g=(u.getDay()+6)%7+1,y=p?.label??`${h}: ${f}`;l.push(o`
                <div class="cell" style="grid-row: ${g}; --cell: ${this.color(f,n)};" title="${y}"></div>
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
        `}};_i.styles=C`
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
    `;Mr([m({type:Array})],_i.prototype,"cells",2);_i=Mr([k("mateu-heatmap")],_i);const $d=e=>{const t=e.metadata;return o`
        <mateu-heatmap
                .cells="${t.cells??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-heatmap>
    `};var yd=Object.defineProperty,xd=Object.getOwnPropertyDescriptor,qr=(e,t,a,s)=>{for(var i=s>1?void 0:s?xd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&yd(t,a,i),i};let Ei=class extends S{constructor(){super(...arguments),this.stages=[]}render(){const e=this.stages;if(!e.length)return o``;const t=e[0].value??0,a=Math.max(...e.map(s=>s.value??0),1);return o`
            <div class="funnel">
                ${e.map((s,i)=>{const r=s.value??0,n=a>0?Math.max(6,r/a*100):6,l=i>0?e[i-1].value??0:t,c=i===0?t>0?"100%":"":l>0?`${Math.round(r/l*100)}%`:"0%";return o`
                        <div class="stage">
                            <div class="meta">
                                <span class="label">${s.label}</span>
                                ${i>0?o`<span class="conv">${c} of previous</span>`:d}
                            </div>
                            <div class="bar" style="width: ${n}%; ${s.color?`--bar: ${s.color};`:""}">
                                ${r.toLocaleString()}
                            </div>
                        </div>
                    `})}
            </div>
        `}};Ei.styles=C`
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
    `;qr([m({type:Array})],Ei.prototype,"stages",2);Ei=qr([k("mateu-funnel")],Ei);const wd=e=>{const t=e.metadata;return o`
        <mateu-funnel
                .stages="${t.stages??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-funnel>
    `};var kd=Object.defineProperty,Cd=Object.getOwnPropertyDescriptor,Ra=(e,t,a,s)=>{for(var i=s>1?void 0:s?Cd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&kd(t,a,i),i};let Nt=class extends S{constructor(){super(...arguments),this.values=[],this.labels=[],this.area=!1}render(){const e=this.values;if(!e||e.length<2)return o``;const t=600,a=160,s=8,i=Math.min(...e),r=Math.max(...e),n=r-i||1,l=(t-s*2)/(e.length-1),c=e.map((y,x)=>{const P=s+x*l,q=s+(a-s*2)*(1-(y-i)/n);return[P,q]}),u=c.map(([y,x],P)=>`${P===0?"M":"L"}${y.toFixed(1)} ${x.toFixed(1)}`).join(" "),h=`${u} L${c[c.length-1][0].toFixed(1)} ${a-s} L${c[0][0].toFixed(1)} ${a-s} Z`,p=this.color||"var(--lumo-primary-color, #1a73e8)",f=e.indexOf(r),g=e.indexOf(i);return o`
            ${this.heading?o`<div class="title">${this.heading}</div>`:d}
            <svg viewBox="0 0 ${t} ${a}" preserveAspectRatio="none">
                ${this.area?J`<path d="${h}" fill="${p}" opacity="0.12"></path>`:d}
                <path d="${u}" fill="none" stroke="${p}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
                ${c.map((y,x)=>x===f||x===g?J`<circle cx="${y[0]}" cy="${y[1]}" r="3.2" fill="${p}"><title>${this.labels[x]??""}: ${e[x]}</title></circle>`:J`<circle cx="${y[0]}" cy="${y[1]}" r="6" fill="transparent"><title>${this.labels[x]??""}: ${e[x]}</title></circle>`)}
            </svg>
            ${this.labels&&this.labels.length?o`<div class="labels"><span>${this.labels[0]}</span><span>${this.labels[this.labels.length-1]}</span></div>`:d}
        `}};Nt.styles=C`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .title { font-weight: 600; margin-bottom: .35rem; color: var(--lumo-body-text-color, #222); }
        svg { display: block; width: 100%; height: auto; overflow: visible; }
        .labels { display: flex; justify-content: space-between; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); margin-top: .2rem; }
    `;Ra([m()],Nt.prototype,"heading",2);Ra([m({type:Array})],Nt.prototype,"values",2);Ra([m({type:Array})],Nt.prototype,"labels",2);Ra([m()],Nt.prototype,"color",2);Ra([m({type:Boolean})],Nt.prototype,"area",2);Nt=Ra([k("mateu-trend-chart")],Nt);const Sd=e=>{const t=e.metadata;return o`
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
    `};var Id=Object.defineProperty,_d=Object.getOwnPropertyDescriptor,Ts=(e,t,a,s)=>{for(var i=s>1?void 0:s?_d(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Id(t,a,i),i};let Xa=class extends S{constructor(){super(...arguments),this.features=[],this.columns=0}clickFeature(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){const e=this.columns&&this.columns>0?`repeat(${this.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(15rem, 1fr))";return o`
            <div class="grid" style="grid-template-columns: ${e};">
                ${this.features.map(t=>o`
                    <div class="card ${t.actionId?"clickable":""}" @click="${()=>this.clickFeature(t)}">
                        ${t.icon?o`<span class="icon">${t.icon}</span>`:d}
                        <span class="title">${t.title}</span>
                        ${t.description?o`<span class="desc">${t.description}</span>`:d}
                    </div>
                `)}
            </div>
        `}};Xa.styles=C`
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
    `;Ts([m({type:Array})],Xa.prototype,"features",2);Ts([m({type:Number})],Xa.prototype,"columns",2);Xa=Ts([k("mateu-feature-grid")],Xa);const Ed=e=>{const t=e.metadata;return o`
        <mateu-feature-grid
                .features="${t.features??[]}"
                .columns="${t.columns??0}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-feature-grid>
    `};var Pd=Object.defineProperty,Td=Object.getOwnPropertyDescriptor,Ur=(e,t,a,s)=>{for(var i=s>1?void 0:s?Td(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Pd(t,a,i),i};let Pi=class extends S{constructor(){super(...arguments),this.items=[]}stars(e){const t=Math.max(0,Math.min(5,e||0));return"★".repeat(t)+"☆".repeat(5-t)}render(){return o`
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
        `}};Pi.styles=C`
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
    `;Ur([m({type:Array})],Pi.prototype,"items",2);Pi=Ur([k("mateu-testimonials")],Pi);const Od=e=>{const t=e.metadata;return o`
        <mateu-testimonials
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-testimonials>
    `};var Rd=Object.defineProperty,zd=Object.getOwnPropertyDescriptor,Os=(e,t,a,s)=>{for(var i=s>1?void 0:s?zd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Rd(t,a,i),i};let Qa=class extends S{constructor(){super(...arguments),this.items=[],this.openSet=new Set,this.seeded=!1}seed(){this.seeded||(this.seeded=!0,this.items.forEach((e,t)=>{e.open&&this.openSet.add(t)}))}toggle(e){this.openSet.has(e)?this.openSet.delete(e):this.openSet.add(e),this.requestUpdate()}render(){return this.seed(),o`
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
        `}};Qa.styles=C`
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
    `;Os([m({type:Array})],Qa.prototype,"items",2);Os([$()],Qa.prototype,"openSet",2);Qa=Os([k("mateu-faq")],Qa);const Ad=e=>{const t=e.metadata;return o`
        <mateu-faq
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-faq>
    `};var jd=Object.defineProperty,Ld=Object.getOwnPropertyDescriptor,ma=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ld(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&jd(t,a,i),i};let kt=class extends S{themeVars(){switch(this.theme){case"success":return"--accent: var(--lumo-success-color, #12b76a); --bg: var(--lumo-success-color-10pct, rgba(18,183,106,.1));";case"warning":return"--accent: #f59e0b; --bg: rgba(245,158,11,.12);";case"danger":return"--accent: var(--lumo-error-color, #e11d48); --bg: var(--lumo-error-color-10pct, rgba(225,29,72,.1));";default:return"--accent: var(--lumo-primary-color, #1a73e8); --bg: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));"}}cta(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){return o`
            <div class="callout" style="${this.themeVars()}">
                ${this.icon?o`<span class="icon">${this.icon}</span>`:d}
                <div class="body">
                    ${this.heading?o`<span class="heading">${this.heading}</span>`:d}
                    ${this.description?o`<span class="desc">${this.description}</span>`:d}
                    ${this.ctaLabel?o`<button class="cta" @click="${()=>this.cta()}">${this.ctaLabel}</button>`:d}
                </div>
            </div>
        `}};kt.styles=C`
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
    `;ma([m()],kt.prototype,"heading",2);ma([m()],kt.prototype,"description",2);ma([m()],kt.prototype,"icon",2);ma([m()],kt.prototype,"ctaLabel",2);ma([m()],kt.prototype,"actionId",2);ma([m()],kt.prototype,"theme",2);kt=ma([k("mateu-callout-card")],kt);const Dd=e=>{const t=e.metadata;return o`
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
    `};var Nd=Object.defineProperty,Fd=Object.getOwnPropertyDescriptor,Br=(e,t,a,s)=>{for(var i=s>1?void 0:s?Fd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Nd(t,a,i),i};let Ti=class extends S{constructor(){super(...arguments),this.comments=[]}renderComment(e){const t=e.avatar&&(e.avatar.startsWith("http")||e.avatar.startsWith("data:"));return o`
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
        `}render(){return o`<div class="thread">${this.comments.map(e=>this.renderComment(e))}</div>`}};Ti.styles=C`
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
    `;Br([m({type:Array})],Ti.prototype,"comments",2);Ti=Br([k("mateu-comment-thread")],Ti);const Md=e=>{const t=e.metadata;return o`
        <mateu-comment-thread
                .comments="${t.comments??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-comment-thread>
    `};var qd=Object.defineProperty,Ud=Object.getOwnPropertyDescriptor,Vr=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ud(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&qd(t,a,i),i};const Bd={pdf:"📕",image:"🖼️",img:"🖼️",doc:"📘",docx:"📘",word:"📘",xls:"📗",xlsx:"📗",excel:"📗",sheet:"📗",zip:"🗜️",archive:"🗜️",video:"🎬",audio:"🎵",code:"💻",csv:"📄",txt:"📄"};let Oi=class extends S{constructor(){super(...arguments),this.files=[]}icon(e){return e&&Bd[e.toLowerCase()]||"📄"}clickFile(e,t){e.url||e.actionId&&(t.preventDefault(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_file:e}},bubbles:!0,composed:!0})))}render(){return o`
            <div class="list">
                ${this.files.map(e=>{const t=!!e.url||!!e.actionId,a=o`
                        <span class="icon">${this.icon(e.type)}</span>
                        <span class="name">${e.name}</span>
                        ${e.size?o`<span class="size">${e.size}</span>`:d}
                        ${e.url?o`<span class="dl">⬇</span>`:d}
                    `;return e.url?o`<a class="file clickable" href="${e.url}" download target="_blank" rel="noopener">${a}</a>`:o`<div class="file ${t?"clickable":""}" @click="${s=>this.clickFile(e,s)}">${a}</div>`})}
            </div>
        `}};Oi.styles=C`
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
    `;Vr([m({type:Array})],Oi.prototype,"files",2);Oi=Vr([k("mateu-file-list")],Oi);const Vd=e=>{const t=e.metadata;return o`
        <mateu-file-list
                .files="${t.files??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-file-list>
    `};var Wd=Object.defineProperty,Hd=Object.getOwnPropertyDescriptor,Vi=(e,t,a,s)=>{for(var i=s>1?void 0:s?Hd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Wd(t,a,i),i};let Sa=class extends S{constructor(){super(...arguments),this.items=[],this.localDone=new Map}isDone(e,t){return this.localDone.has(t)?!!this.localDone.get(t):!!e.done}toggle(e,t){const a=!this.isDone(e,t);this.localDone.set(t,a),this.requestUpdate(),e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_item:e,_done:a}},bubbles:!0,composed:!0}))}render(){const e=this.items.length,t=this.items.filter((s,i)=>this.isDone(s,i)).length,a=e>0?Math.round(t/e*100):0;return o`
            <div class="head">
                ${this.heading?o`<span class="title">${this.heading}</span>`:o`<span></span>`}
                <span class="count">${t} / ${e}</span>
            </div>
            <div class="bar"><div class="fill" style="width: ${a}%;"></div></div>
            ${this.items.map((s,i)=>{const r=this.isDone(s,i);return o`
                    <div class="item ${r?"done":""}" @click="${()=>this.toggle(s,i)}">
                        <span class="box">${r?"✓":d}</span>
                        <span class="label">${s.label}</span>
                    </div>
                `})}
        `}};Sa.styles=C`
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
    `;Vi([m()],Sa.prototype,"heading",2);Vi([m({type:Array})],Sa.prototype,"items",2);Vi([$()],Sa.prototype,"localDone",2);Sa=Vi([k("mateu-checklist")],Sa);const Gd=e=>{const t=e.metadata;return o`
        <mateu-checklist
                heading="${t.title??d}"
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-checklist>
    `};var Kd=Object.defineProperty,Yd=Object.getOwnPropertyDescriptor,Yt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Yd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Kd(t,a,i),i};let nt=class extends S{render(){const e=this.trend??"flat";return o`
            <div class="card">
                ${this.heading?o`<div class="title">${this.heading}</div>`:d}
                <div class="row">
                    <div class="side">
                        ${this.leftLabel?o`<div class="label">${this.leftLabel}</div>`:d}
                        <div class="value">${this.leftValue}</div>
                    </div>
                    <div class="mid">
                        <span class="arrow">${"→"}</span>
                        ${this.delta?o`<span class="delta ${e}">${e==="up"?"▲":e==="down"?"▼":""} ${this.delta}</span>`:d}
                    </div>
                    <div class="side">
                        ${this.rightLabel?o`<div class="label">${this.rightLabel}</div>`:d}
                        <div class="value">${this.rightValue}</div>
                    </div>
                </div>
            </div>
        `}};nt.styles=C`
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
    `;Yt([m()],nt.prototype,"heading",2);Yt([m()],nt.prototype,"leftLabel",2);Yt([m()],nt.prototype,"leftValue",2);Yt([m()],nt.prototype,"rightLabel",2);Yt([m()],nt.prototype,"rightValue",2);Yt([m()],nt.prototype,"delta",2);Yt([m()],nt.prototype,"trend",2);nt=Yt([k("mateu-comparison-card")],nt);const Jd=e=>{const t=e.metadata;return o`
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
    `},Wi=C`
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
`,Xd=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}),gs=e=>Xd.format(e),Ri=(e,t)=>{const a=e<0?"-":"",s=gs(Math.abs(e));return t?`${a}${t} ${s}`:`${a}${s}`},Qd=(e,t)=>t?`${gs(e)} ${t}`:gs(e);var Zd=Object.defineProperty,ec=Object.getOwnPropertyDescriptor,Jt=(e,t,a,s)=>{for(var i=s>1?void 0:s?ec(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Zd(t,a,i),i};let lt=class extends S{constructor(){super(...arguments),this.title="",this.badges=[],this.facts=[]}render(){const e=!!(this.metricLabel||this.metricValue||this.metricCaption);return o`
            <div class="card">
                <div class="main">
                    <div class="title-row">
                        <span class="title">${this.title}</span>
                        ${this.badges.map(t=>o`<span class="chip ${t.color??""}">${t.label}</span>`)}
                    </div>
                    ${this.subtitle?o`<span class="subtitle">${this.subtitle}</span>`:d}
                    ${this.facts.length?o`
                        <div class="facts">
                            ${this.facts.map(t=>o`
                                <div class="fact">
                                    <span class="label">${t.label}</span>
                                    <span class="value">${t.value}</span>
                                </div>
                            `)}
                        </div>
                    `:d}
                </div>
                ${e?o`
                    <div class="metric">
                        ${this.metricLabel?o`<span class="label">${this.metricLabel}</span>`:d}
                        ${this.metricValue?o`<span class="value">${this.metricValue}</span>`:d}
                        ${this.metricCaption?o`<span class="caption">${this.metricCaption}</span>`:d}
                    </div>
                `:d}
            </div>
        `}};lt.styles=[Wi,C`
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
    `];Jt([m()],lt.prototype,"title",2);Jt([m({type:Array})],lt.prototype,"badges",2);Jt([m()],lt.prototype,"subtitle",2);Jt([m({type:Array})],lt.prototype,"facts",2);Jt([m()],lt.prototype,"metricLabel",2);Jt([m()],lt.prototype,"metricValue",2);Jt([m()],lt.prototype,"metricCaption",2);lt=Jt([k("mateu-entity-header")],lt);const tc=e=>{const t=e.metadata;return o`
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
    `};var ac=Object.defineProperty,ic=Object.getOwnPropertyDescriptor,Xt=(e,t,a,s)=>{for(var i=s>1?void 0:s?ic(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&ac(t,a,i),i};let dt=class extends S{constructor(){super(...arguments),this.value=0,this.max=0}fillColor(){return this.dangerAt!=null&&this.value>=this.dangerAt?"error":this.warnAt!=null&&this.value>=this.warnAt?"warning":this.warnAt!=null||this.dangerAt!=null?"success":"primary"}render(){const e=this.max>0?Math.min(Math.max(this.value/this.max,0),1):0,t=Math.round(e*100);return o`
            <div class="meter">
                ${this.label?o`<span class="label">${this.label}</span>`:d}
                <span class="value">${Qd(this.value,this.unit)}</span>
                <div class="track">
                    <div class="fill ${this.fillColor()}" style="width: ${t}%"></div>
                </div>
                <span class="caption">${this.caption?this.caption:`${t}%`}</span>
            </div>
        `}};dt.styles=C`
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
    `;Xt([m()],dt.prototype,"label",2);Xt([m({type:Number})],dt.prototype,"value",2);Xt([m({type:Number})],dt.prototype,"max",2);Xt([m()],dt.prototype,"unit",2);Xt([m()],dt.prototype,"caption",2);Xt([m({type:Number})],dt.prototype,"warnAt",2);Xt([m({type:Number})],dt.prototype,"dangerAt",2);dt=Xt([k("mateu-meter")],dt);const sc=e=>{const t=e.metadata;return o`
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
    `};var rc=Object.defineProperty,oc=Object.getOwnPropertyDescriptor,za=(e,t,a,s)=>{for(var i=s>1?void 0:s?oc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&rc(t,a,i),i};let Ft=class extends S{constructor(){super(...arguments),this.total=0,this.done=0}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){const e=this.total>0&&this.done>=this.total,t=!e&&!!this.actionLabel&&!!this.actionId;return o`
            <div class="banner ${e?"complete":""}">
                <span class="icon">👥</span>
                ${this.label?o`<span class="label">${this.label}</span>`:d}
                <div class="pills">
                    ${Array.from({length:this.total},(a,s)=>o`
                        <span class="pill ${s+1<=this.done?"filled":""}">${s+1}/${this.total}</span>
                    `)}
                </div>
                <span class="spacer"></span>
                ${t?o`<button @click="${()=>this.runAction()}">${this.actionLabel} →</button>`:d}
            </div>
        `}};Ft.styles=C`
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
    `;za([m()],Ft.prototype,"label",2);za([m({type:Number})],Ft.prototype,"total",2);za([m({type:Number})],Ft.prototype,"done",2);za([m()],Ft.prototype,"actionLabel",2);za([m()],Ft.prototype,"actionId",2);Ft=za([k("mateu-task-progress")],Ft);const nc=e=>{const t=e.metadata;return o`
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
    `};var lc=Object.defineProperty,dc=Object.getOwnPropertyDescriptor,ai=(e,t,a,s)=>{for(var i=s>1?void 0:s?dc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&lc(t,a,i),i};let sa=class extends S{constructor(){super(...arguments),this.items=[],this.compact=!1,this.frameless=!1}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}rowClicked(e){this.rowActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.rowActionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="list ${this.compact?"compact":""} ${this.frameless?"frameless":""}">
                ${this.items.map(e=>o`
                    <div class="row ${this.rowActionId?"clickable":""}"
                         @click="${()=>this.rowClicked(e)}">
                        ${e.avatar?o`<span class="avatar">${e.avatar}</span>`:e.icon?o`<span class="icon">${e.icon}</span>`:d}
                        <div class="body">
                            <span class="title">${e.title}</span>
                            ${e.description?o`<span class="description">${e.description}</span>`:d}
                        </div>
                        ${e.status?o`<span class="chip ${e.statusColor??""}">${e.status}</span>`:d}
                        ${e.actionLabel&&e.actionId?o`<vaadin-button theme="small" @click="${()=>this.runAction(e)}">${e.actionLabel}</vaadin-button>`:d}
                    </div>
                `)}
            </div>
        `}};sa.styles=[Wi,C`
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
        vaadin-button { flex: 0 0 auto; }
    `];ai([m({type:Array})],sa.prototype,"items",2);ai([m({type:Boolean})],sa.prototype,"compact",2);ai([m({type:Boolean})],sa.prototype,"frameless",2);ai([m()],sa.prototype,"rowActionId",2);sa=ai([k("mateu-status-list")],sa);const cc=e=>{const t=e.metadata;return o`
        <mateu-status-list
                .items="${t.items??[]}"
                ?compact="${t.compact??!1}"
                ?frameless="${t.frameless??!1}"
                rowActionId="${O(t.rowActionId??void 0)}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-status-list>
    `};var uc=Object.defineProperty,pc=Object.getOwnPropertyDescriptor,Wr=(e,t,a,s)=>{for(var i=s>1?void 0:s?pc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&uc(t,a,i),i};let zi=class extends S{constructor(){super(...arguments),this.items=[]}render(){return o`
            <ul>
                ${this.items.map(e=>o`<li>${e}</li>`)}
            </ul>
        `}};zi.styles=C`
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
    `;Wr([m({type:Array})],zi.prototype,"items",2);zi=Wr([k("mateu-bulleted-list")],zi);const hc=e=>{const t=e.metadata;return o`
        <mateu-bulleted-list
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-bulleted-list>
    `},mc=e=>{const a=e.metadata.attributes?.["data-colspan"];return o`
        <hr style="border: none; border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); width: 100%; margin: var(--lumo-space-s, .5rem) 0; ${e.style??""}"
            class="${e.cssClasses??d}"
            id="${O(e.id??void 0)}"
            data-colspan="${O(a)}"
            slot="${e.slot??d}"/>
    `};var vc=Object.defineProperty,fc=Object.getOwnPropertyDescriptor,qe=(e,t,a,s)=>{for(var i=s>1?void 0:s?fc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&vc(t,a,i),i};const bc={info:"ℹ",success:"✓",warning:"!",danger:"!"};let xe=class extends S{constructor(){super(...arguments),this.text="",this.theme="info",this.noIcon=!1,this.slim=!1,this.fullWidth=!1,this.hasContent=!1,this.inlineContent=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){const e=!!this.text&&!!this.text.trim();if(!e&&!this.hasContent)return o``;const t=["info","success","warning","danger"].includes(this.theme)?this.theme:"info";return o`
            <div class="notice ${t} ${this.slim?"slim":""}">
                ${this.noIcon?d:o`<span class="icon ${this.icon?"custom":""}">${this.icon||bc[t]}</span>`}
                <div class="body ${this.inlineContent?"inline":""}">
                    ${e?o`<span class="text">${this.text}</span>`:d}
                    ${this.hasContent?o`<div class="content"><slot></slot></div>`:d}
                </div>
                ${this.actionLabel&&this.actionId?o`<vaadin-button theme="small" @click="${()=>this.runAction()}">${this.actionLabel}</vaadin-button>`:this.status?o`<span class="status">${this.status}</span>`:d}
            </div>
        `}};xe.styles=C`
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
        vaadin-button { flex: 0 0 auto; }
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
    `;qe([m()],xe.prototype,"text",2);qe([m()],xe.prototype,"theme",2);qe([m()],xe.prototype,"icon",2);qe([m({type:Boolean})],xe.prototype,"noIcon",2);qe([m()],xe.prototype,"actionLabel",2);qe([m()],xe.prototype,"actionId",2);qe([m()],xe.prototype,"status",2);qe([m({type:Boolean})],xe.prototype,"slim",2);qe([m({type:Boolean})],xe.prototype,"fullWidth",2);qe([m({type:Boolean})],xe.prototype,"hasContent",2);qe([m({type:Boolean})],xe.prototype,"inlineContent",2);xe=qe([k("mateu-notice")],xe);const gc=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=Ui(l.text??"",s,i,r,n)??"",u=t.children??[];return o`
        <mateu-notice
                text="${c}"
                theme="${l.theme??"info"}"
                icon="${O(l.icon??void 0)}"
                ?noIcon="${l.noIcon??!1}"
                actionLabel="${O(l.actionLabel??void 0)}"
                actionId="${O(l.actionId??void 0)}"
                status="${O(l.status??void 0)}"
                ?slim="${l.slim??!1}"
                ?fullWidth="${l.fullWidth??!1}"
                ?inlineContent="${l.inlineContent??!1}"
                ?hasContent="${u.length>0}"
                data-colspan="${l.fullWidth?"99":d}"
                style="${t.style??d}"
                class="${t.cssClasses??d}"
                slot="${t.slot??d}"
        >${u.map(h=>w(e,h,a,s,i,r,n))}</mateu-notice>
    `};var $c=Object.defineProperty,yc=Object.getOwnPropertyDescriptor,Hi=(e,t,a,s)=>{for(var i=s>1?void 0:s?yc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&$c(t,a,i),i};let Ia=class extends S{constructor(){super(...arguments),this.groups=[]}willUpdate(e){e.has("groups")&&(this.selectedId=this.groups.flatMap(t=>t.items??[]).find(t=>t.selected)?.id)}select(e){this.selectedId=e,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="rail">
                ${this.groups.map(e=>o`
                    <div class="group">
                        ${e.label?o`<span class="group-label">${e.label}</span>`:d}
                        ${(e.items??[]).map(t=>o`
                            <div class="card ${t.id===this.selectedId?"selected":""}"
                                 @click="${()=>this.select(t.id)}">
                                <span class="title">${t.title}</span>
                                <div class="meta">
                                    ${t.caption?o`<span class="caption">${t.caption}</span>`:d}
                                    ${(t.badges??[]).map(a=>o`<span class="chip ${a.color??""}">${a.label}</span>`)}
                                </div>
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};Ia.styles=[Wi,C`
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
    `];Hi([m()],Ia.prototype,"actionId",2);Hi([m({type:Array})],Ia.prototype,"groups",2);Hi([$()],Ia.prototype,"selectedId",2);Ia=Hi([k("mateu-task-queue")],Ia);const xc=e=>{const t=e.metadata;return o`
        <mateu-task-queue
                .actionId="${t.actionId}"
                .groups="${t.groups??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-task-queue>
    `};var wc=Object.defineProperty,kc=Object.getOwnPropertyDescriptor,Aa=(e,t,a,s)=>{for(var i=s>1?void 0:s?kc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&wc(t,a,i),i};let Mt=class extends S{constructor(){super(...arguments),this.columns=0,this.items=[]}willUpdate(e){e.has("items")&&(this.selectedId=this.items.find(t=>t.selected)?.id)}select(e){e.disabled||(this.selectedId=e.id,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0})))}render(){const e=this.columns>0?`grid-template-columns: repeat(${this.columns}, minmax(0, 1fr));`:"grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));";return o`
            <div class="grid" style="${e}">
                ${this.items.map(t=>o`
                    <div class="cell ${t.disabled?"disabled":""} ${t.recommended?"recommended":""} ${t.id===this.selectedId?"selected":""}"
                         @click="${()=>this.select(t)}">
                        ${t.recommended?o`<span class="tag">${this.recommendedLabel||"Recommended"}</span>`:d}
                        <span class="title">${t.title}</span>
                        ${t.subtitle?o`<span class="subtitle">${t.subtitle}</span>`:d}
                        ${t.statusLabel?o`<span class="chip ${t.statusColor??""}">${t.statusLabel}</span>`:d}
                        ${t.note?o`<span class="note ${t.noteColor??""}"><span class="dot"></span>${t.note}</span>`:d}
                    </div>
                `)}
            </div>
        `}};Mt.styles=[Wi,C`
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
    `];Aa([m()],Mt.prototype,"actionId",2);Aa([m({type:Number})],Mt.prototype,"columns",2);Aa([m()],Mt.prototype,"recommendedLabel",2);Aa([m({type:Array})],Mt.prototype,"items",2);Aa([$()],Mt.prototype,"selectedId",2);Mt=Aa([k("mateu-resource-grid")],Mt);const Cc=e=>{const t=e.metadata;return o`
        <mateu-resource-grid
                .actionId="${t.actionId}"
                .columns="${t.columns??0}"
                .recommendedLabel="${t.recommendedLabel}"
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-resource-grid>
    `};var Sc=Object.defineProperty,Ic=Object.getOwnPropertyDescriptor,Ae=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ic(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Sc(t,a,i),i};let he=class extends S{constructor(){super(...arguments),this.title="",this.features=[],this.current=!1,this.added=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="card ${this.current?"":"offer"}">
                ${this.image?o`<img class="image" src="${this.image}" alt="${this.title}">`:d}
                ${this.tag&&this.image?o`<span class="tag">${this.tag}</span>`:d}
                <div class="body">
                    ${this.tag&&!this.image?o`<span class="tag static">${this.tag}</span>`:d}
                    <span class="title">${this.title}</span>
                    ${this.subtitle?o`<span class="subtitle">${this.subtitle}</span>`:d}
                    ${this.features.length?o`
                        <div class="features">
                            ${this.features.map(e=>o`<span class="feature">${e}</span>`)}
                        </div>
                    `:d}
                </div>
                <div class="footer">
                    ${this.current?this.currentLabel?o`<span class="current-label">${this.currentLabel}</span>`:d:this.actionLabel&&this.actionId?o`
                            <button class="${this.added?"added":""}" @click="${()=>this.runAction()}">
                                <span>${this.added?this.addedLabel||this.actionLabel:this.actionLabel}</span>
                                ${this.priceLabel?o`<span class="price">${this.priceLabel}</span>`:d}
                            </button>
                        `:d}
                </div>
            </div>
        `}};he.styles=C`
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
    `;Ae([m()],he.prototype,"tag",2);Ae([m()],he.prototype,"title",2);Ae([m()],he.prototype,"subtitle",2);Ae([m()],he.prototype,"image",2);Ae([m({type:Array})],he.prototype,"features",2);Ae([m()],he.prototype,"priceLabel",2);Ae([m()],he.prototype,"actionLabel",2);Ae([m()],he.prototype,"actionId",2);Ae([m({type:Boolean})],he.prototype,"current",2);Ae([m()],he.prototype,"currentLabel",2);Ae([m({type:Boolean})],he.prototype,"added",2);Ae([m()],he.prototype,"addedLabel",2);he=Ae([k("mateu-offer-card")],he);const _c=e=>{const t=e.metadata;return o`
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
    `};var Ec=Object.defineProperty,Pc=Object.getOwnPropertyDescriptor,ja=(e,t,a,s)=>{for(var i=s>1?void 0:s?Pc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Ec(t,a,i),i};let qt=class extends S{constructor(){super(...arguments),this.items=[],this.added=new Set}willUpdate(e){e.has("items")&&(this.added=new Set(this.items.filter(t=>t.added).map(t=>t.id)))}total(){return this.items.filter(e=>e.id!=null&&this.added.has(e.id)).reduce((e,t)=>e+(t.price??0),0)}toggle(e){if(e.id==null)return;const t=new Set(this.added),a=!t.has(e.id);a?t.add(e.id):t.delete(e.id),this.added=t,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id,_added:a,_total:this.total()}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="header">
                ${this.totalLabel?o`<span class="total-label">${this.totalLabel}:</span>`:d}
                <span class="total">${Ri(this.total(),this.currency)}</span>
            </div>
            <div class="grid">
                ${this.items.map(e=>{const t=e.id!=null&&this.added.has(e.id);return o`
                        <div class="card ${t?"added":""}">
                            ${e.icon?o`<span class="icon">${e.icon}</span>`:d}
                            <span class="title">${e.title}</span>
                            ${e.description?o`<span class="description">${e.description}</span>`:d}
                            ${e.includedLabel?o`<span class="included">${e.includedLabel}</span>`:o`
                                    ${e.price!=null?o`
                                        <span class="price">${Ri(e.price,this.currency)}${e.unit?` / ${e.unit}`:""}</span>
                                    `:d}
                                    <button class="toggle ${t?"on":""}" @click="${()=>this.toggle(e)}"
                                            aria-pressed="${t}">${t?"✓":"+"}</button>
                                `}
                        </div>
                    `})}
            </div>
        `}};qt.styles=C`
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
    `;ja([m()],qt.prototype,"totalLabel",2);ja([m()],qt.prototype,"currency",2);ja([m()],qt.prototype,"actionId",2);ja([m({type:Array})],qt.prototype,"items",2);ja([$()],qt.prototype,"added",2);qt=ja([k("mateu-addon-picker")],qt);const Tc=e=>{const t=e.metadata;return o`
        <mateu-addon-picker
                .totalLabel="${t.totalLabel}"
                .currency="${t.currency}"
                .actionId="${t.actionId}"
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-addon-picker>
    `};var Oc=Object.defineProperty,Rc=Object.getOwnPropertyDescriptor,ii=(e,t,a,s)=>{for(var i=s>1?void 0:s?Rc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Oc(t,a,i),i};let ra=class extends S{constructor(){super(...arguments),this.lines=[]}computedTotal(){return this.total!=null?this.total:this.lines.filter(e=>!e.included).reduce((e,t)=>e+(t.amount??0),0)}render(){return o`
            ${this.lines.map(e=>o`
                <div class="row">
                    <span class="dot"></span>
                    <span class="concept">${e.concept}</span>
                    ${e.included?o`<span class="included-label">${e.includedLabel||"Included"}</span>`:o`<span class="amount ${(e.amount??0)<0?"negative":""}">${Ri(e.amount??0,this.currency)}</span>`}
                </div>
            `)}
            <div class="total-row">
                <span class="total-label">${this.totalLabel||"Total"}</span>
                <span class="total">${Ri(this.computedTotal(),this.currency)}</span>
            </div>
        `}};ra.styles=C`
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
    `;ii([m()],ra.prototype,"currency",2);ii([m()],ra.prototype,"totalLabel",2);ii([m({type:Array})],ra.prototype,"lines",2);ii([m({type:Number})],ra.prototype,"total",2);ra=ii([k("mateu-ledger")],ra);const zc=e=>{const t=e.metadata;return o`
        <mateu-ledger
                .currency="${t.currency}"
                .totalLabel="${t.totalLabel}"
                .lines="${t.lines??[]}"
                .total="${t.total}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-ledger>
    `};var Ac=Object.defineProperty,jc=Object.getOwnPropertyDescriptor,It=(e,t,a,s)=>{for(var i=s>1?void 0:s?jc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Ac(t,a,i),i};let Ye=class extends S{constructor(){super(...arguments),this.methods=[]}willUpdate(e){e.has("selected")&&(this.selectedId=this.selected)}confirm(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_method:this.selectedId}},bubbles:!0,composed:!0}))}pick(e){this.selectedId=e,this.methodActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.methodActionId,parameters:{_method:e}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="bar">
                <div class="methods">
                    ${this.methods.map(e=>o`
                        <button class="method ${e.id===this.selectedId?"selected":""}"
                                @click="${()=>this.pick(e.id)}">${e.label}</button>
                    `)}
                </div>
                ${this.contextLabel||this.contextValue?o`
                    <div class="context">
                        ${this.contextLabel?o`<span class="label">${this.contextLabel}</span>`:d}
                        ${this.contextValue?o`<span class="value">${this.contextValue}</span>`:d}
                    </div>
                `:d}
                <span class="spacer"></span>
                ${this.confirmLabel&&this.actionId?o`<button class="confirm" @click="${()=>this.confirm()}">${this.confirmLabel}</button>`:d}
            </div>
        `}};Ye.styles=C`
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
    `;It([m()],Ye.prototype,"actionId",2);It([m()],Ye.prototype,"methodActionId",2);It([m({type:Array})],Ye.prototype,"methods",2);It([m()],Ye.prototype,"selected",2);It([m()],Ye.prototype,"contextLabel",2);It([m()],Ye.prototype,"contextValue",2);It([m()],Ye.prototype,"confirmLabel",2);It([$()],Ye.prototype,"selectedId",2);Ye=It([k("mateu-payment-picker")],Ye);const Lc=e=>{const t=e.metadata;return o`
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
    `};var Dc=Object.defineProperty,Nc=Object.getOwnPropertyDescriptor,Hr=(e,t,a,s)=>{for(var i=s>1?void 0:s?Nc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Dc(t,a,i),i};let Ai=class extends S{constructor(){super(...arguments),this.items=[]}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="list">
                ${this.items.map(e=>o`
                    <div class="row">
                        <span class="dot ${e.status??"ok"}"></span>
                        <div class="body">
                            <span class="name">${e.name}</span>
                            ${e.systems?.length?o`<span class="systems">${e.systems.join(" · ")}</span>`:d}
                        </div>
                        <div class="counters">
                            <span class="counter ok">✓ ${e.ok??0} OK</span>
                            ${(e.warnings??0)>0?o`<span class="counter warning">⚠ ${e.warnings} warnings</span>`:d}
                            ${(e.errors??0)>0?o`<span class="counter error">⛔ ${e.errors} errors</span>`:d}
                        </div>
                        ${e.actionLabel&&e.actionId?o`<button @click="${()=>this.runAction(e)}">${e.actionLabel}</button>`:d}
                    </div>
                `)}
            </div>
        `}};Ai.styles=C`
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
    `;Hr([m({type:Array})],Ai.prototype,"items",2);Ai=Hr([k("mateu-process-monitor")],Ai);const Fc=e=>{const t=e.metadata;return o`
        <mateu-process-monitor
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-process-monitor>
    `},Mc=(e,t)=>{let a=e.style;return e.id&&(a&&!a.endsWith(";")&&(a+=";"),a==null&&(a=""),t[e.id+".hidden"]==!0&&(a+="display: none;")),a},qc=(e,t)=>{let a={...e.metadata};if(e.id&&a){if(a.type==v.Button){const s=a;t[e.id+".disabled"]==!0&&(s.disabled=!0)}if(a.type==v.FormField){const s=a;t[e.id+".disabled"]==!0&&(s.disabled=!0)}}return a},j=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),Uc={[v.Bpmn]:({component:e})=>_l(e),[v.Workflow]:({component:e})=>Pl(e),[v.WorkflowElk]:({component:e})=>Tl(e),[v.FormEditor]:({component:e})=>Ol(e),[v.Page]:j(fs),[v.Div]:j(Cl),[v.Directory]:({component:e,baseUrl:t,state:a,data:s})=>kl(e),[v.FormLayout]:j(Xo),[v.HorizontalLayout]:j(en),[v.VerticalLayout]:j(tn),[v.SplitLayout]:j(an),[v.MasterDetailLayout]:j(sn),[v.TabLayout]:j(rn),[v.AccordionLayout]:j(nn),[v.BoardLayout]:j(pn),[v.BoardLayoutRow]:j(hn),[v.BoardLayoutItem]:j(mn),[v.Scroller]:j(dn),[v.FullWidth]:j(cn),[v.Container]:j(un),[v.Form]:({container:e,component:t,baseUrl:a,state:s,data:i,appState:r,appData:n})=>{const l=t.metadata;return o`<mateu-form
            id="${t.id}"
        baseUrl="${a}"
            .component="${t}"
            .values="${s}"
            .state="${s}"
            .data="${i}"
            .appState="${r}"
            .appdata="${n}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            >
                ${t.children?.map(c=>w(e,c,a,s,i,r,n))}
            ${l?.buttons?.map(c=>o`
               ${w(e,{id:c.actionId,metadata:c,type:oe.ClientSide,slot:"buttons"},void 0,s,i,r,n)}
`)}

            </mateu-form>`},[v.Table]:({container:e,component:t,baseUrl:a,state:s,data:i,appState:r,appData:n})=>o`<mateu-table
                        id="${t.id}"
        baseUrl="${a}"
            .metadata="${t.metadata}"
            .state="${s}"
                        .data="${i}"
                        .appState="${r}"
                        .appDate="${n}"
                        style="${t.style}" class="${t.cssClasses}"
                        slot="${t.slot??d}"
            >
             ${t.children?.map(l=>w(e,l,a,s,i,r,n))}
            </mateu-table>`,[v.Crud]:j(bs),[v.App]:({container:e,component:t,baseUrl:a,state:s,data:i,appState:r,appData:n})=>o`
            <mateu-app
                        id="${t.id}"
                        baseUrl="${a}"
                        .component="${t}"
                        .state="${s}"
                        .data="${i}"
                        style="${t.style}"
                        class="${t.cssClasses}"
                        .appState="${r}"
                        .appData="${n}"
            >
             ${t.children?.map(l=>w(e,l,a,s,i,r,n))}
         </mateu-app>`,[v.Element]:({container:e,component:t})=>Xn(e,t.metadata,t),[v.FormField]:({container:e,component:t,baseUrl:a,state:s,data:i,appState:r,appData:n,labelAlreadyRendered:l})=>{const c=t.metadata;return o`
    <mateu-field
                   id="${t.id}"
                   .component="${t}"
            .field="${t.metadata}"
                   .state="${s}"
                   .data="${i}"
                   .appState="${r}"
                   .appdata="${n}"
                   style="${t.style}" class="${t.cssClasses}"
                   slot="${t.slot??d}"
                   data-colspan="${c.colspan}"
                   colspan="${(c.colspan??1)>1?c.colspan:d}"
                   .labelAlreadyRendered="${l}"
            >
                    ${t.children?.map(u=>w(e,u,a,s,i,r,n,l))}
                </mateu-field>
        `},[v.Text]:({component:e,state:t,data:a,appState:s,appData:i})=>Qn(e,t,a,s,i),[v.Avatar]:({component:e,state:t,data:a})=>fn(e,t,a),[v.Chat]:({component:e,state:t,data:a})=>El(e),[v.AvatarGroup]:({component:e})=>bn(e),[v.Badge]:({component:e,state:t,data:a})=>Zn(e,t,a),[v.Breadcrumbs]:({component:e})=>xl(e),[v.Anchor]:({component:e})=>tl(e),[v.Button]:({component:e,state:t,data:a})=>rl(e,t,a),[v.Card]:j(ol),[v.Chart]:({component:e})=>nl(e),[v.Icon]:({component:e})=>ll(e),[v.ConfirmDialog]:j(dl),[v.ContextMenu]:j(Vn),[v.CookieConsent]:({component:e})=>cl(e),[v.Details]:j(ul),[v.Dialog]:({component:e,baseUrl:t,state:a,data:s,appState:i,appData:r})=>pl(e,t,a,s,i,r),[v.Drawer]:({component:e,baseUrl:t,state:a,data:s,appState:i,appData:r})=>hl(e,t,a,s,i,r),[v.Image]:({component:e})=>yl(e),[v.Map]:({component:e})=>$l(e),[v.Markdown]:({component:e})=>vl(e),[v.MicroFrontend]:({component:e})=>ml(e),[v.Notification]:({component:e})=>fl(e),[v.ProgressBar]:({component:e,state:t})=>bl(e,t),[v.Popover]:j(gl),[v.CarouselLayout]:j(wl),[v.Tooltip]:j(Kn),[v.MessageInput]:({component:e})=>Gn(e),[v.MessageList]:({component:e})=>Bn(e),[v.CustomField]:j(Hn),[v.MenuBar]:({container:e,component:t,baseUrl:a,state:s,data:i})=>Wn(e,t,a,s,i),[v.Grid]:j(Un),[v.VirtualList]:j(gn),[v.FormSection]:j(Sl),[v.FormSubSection]:j(Il),[v.MetricCard]:({component:e})=>jl(e),[v.Scoreboard]:j(Ll),[v.DashboardPanel]:j(Dl),[v.DashboardLayout]:j(Nl),[v.FoldoutLayout]:j(ql),[v.HeroSection]:j(Ul),[v.EmptyState]:({component:e})=>wn(e),[v.Skeleton]:({component:e})=>kn(e),[v.Gantt]:({component:e})=>Wl(e),[v.PlanningBoard]:({component:e})=>Kl(e),[v.Kanban]:({component:e})=>Xl(e),[v.Timeline]:({component:e})=>ed(e),[v.ProgressSteps]:({component:e})=>id(e),[v.Stat]:({component:e})=>od(e),[v.Calendar]:({component:e})=>dd(e),[v.PricingTable]:({component:e})=>pd(e),[v.OrgChart]:({component:e})=>vd(e),[v.Heatmap]:({component:e})=>$d(e),[v.Funnel]:({component:e})=>wd(e),[v.TrendChart]:({component:e})=>Sd(e),[v.FeatureGrid]:({component:e})=>Ed(e),[v.Testimonials]:({component:e})=>Od(e),[v.Faq]:({component:e})=>Ad(e),[v.CalloutCard]:({component:e})=>Dd(e),[v.CommentThread]:({component:e})=>Md(e),[v.FileList]:({component:e})=>Vd(e),[v.Checklist]:({component:e})=>Gd(e),[v.ComparisonCard]:({component:e})=>Jd(e),[v.EntityHeader]:({component:e})=>tc(e),[v.Meter]:({component:e})=>sc(e),[v.TaskProgress]:({component:e})=>nc(e),[v.StatusList]:({component:e})=>cc(e),[v.BulletedList]:({component:e})=>hc(e),[v.Separator]:({component:e})=>mc(e),[v.Notice]:j(gc),[v.TaskQueue]:({component:e})=>xc(e),[v.ResourceGrid]:({component:e})=>Cc(e),[v.OfferCard]:({component:e})=>_c(e),[v.AddOnPicker]:({component:e})=>Tc(e),[v.Ledger]:({component:e})=>zc(e),[v.PaymentPicker]:({component:e})=>Lc(e),[v.ProcessMonitor]:({component:e})=>Fc(e)},Rs=(e,t,a,s,i,r,n,l)=>{if(!t?.metadata)return t==null?(console.warn("No metadata for component",t),o`<p>No metadata for component</p>`):Rs(e,{id:ye(),metadata:t,type:oe.ClientSide},a,s,i,r,n,l);const c=t.metadata.type,u={...t,style:Mc(t,i),metadata:qc(t,i)},h=Uc[c];return h?h({container:e,component:u,baseUrl:a,state:s,data:i,appState:r,appData:n,labelAlreadyRendered:l}):o`<p ${u?.slot??d}>Unknown metadata type ${c} for component ${u?.id}</p>`};var $e=(e=>(e.HAMBURGUER_MENU="HAMBURGUER_MENU",e.MENU_ON_LEFT="MENU_ON_LEFT",e.MENU_ON_TOP="MENU_ON_TOP",e.TABS="TABS",e.TILES="TILES",e.RAIL="RAIL",e.AUTO="AUTO",e.MEDIATOR="MEDIATOR",e))($e||{});const zs="mateu-app-context",Gr="mateu-app-context-labels",Kr=e=>{try{return JSON.parse(localStorage.getItem(e)??"{}")}catch{return{}}},Qs=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},Gi=()=>Kr(zs),As=()=>Kr(Gr),Yr=(e,t,a)=>{const s=Gi(),i=As();t==null||t===""?(delete s[e],delete i[e]):(s[e]=t,a!==void 0&&(i[e]=a)),Qs(zs,s),Qs(Gr,i)};let Zs=!1;const Jr=()=>{Zs||(Zs=!0,window.addEventListener("storage",e=>{e.key===zs&&e.newValue!==e.oldValue&&window.location.reload()}))},Bc=(e,t)=>new Promise((a,s)=>{let i=!1;const r={retry:()=>{i||(i=!0,t().then(a,s))},giveUp:()=>{i||(i=!0,s(e))}},n=new CustomEvent("mateu-session-expired",{detail:r,cancelable:!0,bubbles:!1});typeof document<"u"&&!document.dispatchEvent(n)||r.giveUp()}),Vc=(e,t)=>e.includes("json")?!0:t!==null&&typeof t=="object",Wc=(e,t)=>{const a=e.finalUrl;if(!a)return;const s=typeof window<"u"?window.location.href:void 0;let i;try{i=new URL(e.requestedUrl,s).href}catch{return}if(i!==a&&!Vc(e.contentType??"",e.data))return a};let ya=[];class Hc{constructor(){this.axiosInstance=Vo.create({timeout:6e4}),this.axiosInstance.interceptors.request.use(t=>(this.addAuthToken(t),this.addSessionId(t),t)),this.axiosInstance.interceptors.response.use(t=>{const a=Wc({requestedUrl:this.axiosInstance.getUri(t.config),finalUrl:t.request?.responseURL,contentType:String(t.headers?.["content-type"]??""),data:t.data});if(a)throw window.location.assign(a),Object.assign(new Error("session lost — redirecting to "+a),{code:"ERR_CANCELED"});return t},t=>{const a=t;if(a?.response?.status===401&&a.config&&!a.config.__mateuRetried){const s=a.config;return s.__mateuRetried=!0,Bc(t,()=>this.axiosInstance.request(s))}throw t})}addSessionId(t){let a=sessionStorage.getItem("__mateu_sesion_id");a||(a=ye(),sessionStorage.setItem("__mateu_sesion_id",a)),t.headers["X-Session-Id"]=a}addAuthToken(t){const a=localStorage.getItem("__mateu_auth_token");a&&(t.headers.Authorization="Bearer "+a)}async wrap(t,a,s,i){return s||a.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),t.then(r=>(a.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:i}})),r)).catch(r=>{throw r?.code=="ERR_CANCELED"?a.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{}})):a.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:i,reason:this.serialize(r)}})),r})}serialize(t){return t?.message?t:JSON.stringify(t)}async get(t){const a=new AbortController;return ya=[...ya,a],this.axiosInstance.get(t,{signal:a.signal})}async post(t,a){const s=new AbortController;return ya=[...ya,s],this.axiosInstance.post(t,a,{signal:s.signal})}async abortAll(){ya.forEach(t=>t.abort()),ya=[]}async runAction(t,a,s,i,r,n,l,c,u,h,p){return a&&a.startsWith("/")&&(a=a.substring(1)),n={...Gi(),...n},await this.wrap(this.post(t+"/mateu/v3/sync/"+(a&&a!=""?a:"_no_route"),{serverSideType:l,appState:n,componentState:c,parameters:u,initiatorComponentId:r,consumedRoute:s,route:a&&a!=""?"/"+a:"",actionId:i}).then(f=>f.data),h,p,i)}}const va=new Hc;var Gc=Object.defineProperty,Kc=Object.getOwnPropertyDescriptor,Ki=(e,t,a,s)=>{for(var i=s>1?void 0:s?Kc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Gc(t,a,i),i};let Ut=class extends S{constructor(){super(...arguments),this.baseUrl="",this.dataProvider=async(e,t)=>{const a=e.filter??"",i=await this.remoteSearch(a)??(this.selector.options??[]).filter(r=>r.label.toLowerCase().includes(a.toLowerCase()));t(i,i.length)}}connectedCallback(){super.connectedCallback(),Jr()}currentValue(){return String(Gi()[this.selector.fieldName]??"")}currentLabel(){const e=this.currentValue();if(!e)return"";const t=(this.selector.options??[]).find(s=>String(s.value)===e);if(t)return t.label;const a=As()[this.selector.fieldName];return a!==void 0?String(a):e}pick(e,t){String(e??"")!==this.currentValue()&&(Yr(this.selector.fieldName,e,t),window.location.reload())}async remoteSearch(e){const t=this.app;if(t?.serverSideType)try{const a=await va.runAction(this.baseUrl??"",t.rootRoute??t.initialRoute??"","",`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,t.serverSideType,{},{searchText:e},this,!0);for(const s of a?.fragments??[]){const n=s.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(n))return n.map(l=>({value:l.value,label:l.label??String(l.value)}))}}catch{}}renderSelect(){const e=[{label:"—",value:""},...(this.selector.options??[]).map(t=>({label:t.label,value:String(t.value)}))];return o`
            <vaadin-select theme="small"
                           .items="${e}"
                           .value="${this.currentValue()}"
                           @value-changed="${t=>{const a=t.detail.value??"",s=e.find(i=>i.value===a)?.label;this.pick(a,a===""?void 0:s)}}"></vaadin-select>`}renderComboBox(){const e=this.currentValue(),t=e?{value:e,label:this.currentLabel()}:null;return o`
            <vaadin-combo-box theme="small"
                              item-label-path="label"
                              item-value-path="value"
                              clear-button-visible
                              placeholder="—"
                              .dataProvider="${this.dataProvider}"
                              .selectedItem="${t}"
                              @selected-item-changed="${a=>{const s=a.detail.value;this.pick(s?.value??"",s?.label)}}"></vaadin-combo-box>`}render(){if(!this.selector)return o``;const e=(this.selector.options?.length??0)>Ut.SEARCHABLE_THRESHOLD;return o`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                ${e?this.renderComboBox():this.renderSelect()}
            </label>`}};Ut.SEARCHABLE_THRESHOLD=7;Ut.styles=C`
        :host {
            display: inline-flex;
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
        vaadin-select, vaadin-combo-box {
            width: 11rem;
        }
    `;Ki([m()],Ut.prototype,"selector",2);Ki([m()],Ut.prototype,"app",2);Ki([m()],Ut.prototype,"baseUrl",2);Ut=Ki([k("mateu-vaadin-app-context-picker")],Ut);class Yc{constructor(){this._dirty=!1,this._installed=!1,this.message="You have unsaved changes. Are you sure you want to leave this page?",this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=t=>{this._dirty&&(t.preventDefault(),t.returnValue="")}}install(){this._installed||(this._installed=!0,document.addEventListener("dirty",this._onDirty),document.addEventListener("clean",this._onClean),window.addEventListener("beforeunload",this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;const t=window.confirm(this.message);return t&&(this._dirty=!1),t}}const Dt=new Yc;var Jc=Object.defineProperty,Xc=Object.getOwnPropertyDescriptor,si=(e,t,a,s)=>{for(var i=s>1?void 0:s?Xc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Jc(t,a,i),i};let oa=class extends S{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.notifications=[],this.fetched=!1}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}updated(){!this.fetched&&this.app?.serverSideType&&(this.fetched=!0,this.refresh())}unreadCount(){return this.notifications.filter(e=>e.unread).length}async runNotificationsAction(e,t){const a=this.app;if(a?.serverSideType)try{const s=await va.runAction(this.baseUrl??"",a.rootRoute??a.initialRoute??"","",e,"notification-bell",void 0,a.serverSideType,{},t,this,!0);for(const i of s?.fragments??[]){const n=i.data?._notifications;if(Array.isArray(n)){this.notifications=n;return}}}catch{}}refresh(){return this.runNotificationsAction("_notifications-list",{})}markRead(e){return this.runNotificationsAction("_notifications-read",{ids:e})}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.refresh(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))}closePanel(){this.detachOutsideClick(),this.opened=!1}async entryClicked(e){e.unread&&await this.markRead([e.id]);const t=e.route;if(t){if(!Dt.confirmLeave())return;this.closePanel(),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:t},bubbles:!0,composed:!0}))}}renderEntry(e){return o`
            <div class="entry ${e.unread?"entry--unread":""}"
                 @click="${()=>this.entryClicked(e)}">
                <span class="unread-dot" aria-hidden="true"></span>
                <div class="entry-body">
                    <div class="entry-top">
                        <span class="entry-title">${e.title}</span>
                        ${e.when?o`<span class="entry-when">${e.when}</span>`:d}
                    </div>
                    ${e.text?o`<div class="entry-text">${e.text}</div>`:d}
                </div>
            </div>`}renderPanel(){return o`
            <div class="panel">
                <div class="entries">
                    ${this.notifications.length===0?o`
                        <div class="empty">No notifications</div>`:d}
                    ${this.notifications.map(e=>this.renderEntry(e))}
                </div>
                ${this.notifications.length>0?o`
                    <div class="footer">
                        <button class="mark-all" ?disabled="${this.unreadCount()===0}"
                                @click="${()=>this.markRead("all")}">Mark all read</button>
                    </div>`:d}
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
                    ${e>0?o`<span class="badge">${e>99?"99+":e}</span>`:d}
                </button>
                ${this.opened?this.renderPanel():d}
            </div>`}};oa.styles=C`
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
    `;si([m()],oa.prototype,"app",2);si([m()],oa.prototype,"baseUrl",2);si([$()],oa.prototype,"opened",2);si([$()],oa.prototype,"notifications",2);oa=si([k("mateu-notification-bell")],oa);class Qc{async handle(t,a){return await t.runAction(a.baseUrl,a.route,a.consumedRoute,a.actionId,a.initiatorComponentId,a.appState,a.serverSideType,a.componentState,a.parameters,a.initiator,a.background)}}const Zc=new Qc;class eu{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,a,s)=>{if(t?.fragments?.forEach(i=>{Lt.next({command:void 0,fragment:i,ui:void 0,error:void 0,callbackToken:s})}),t?.appState&&(le.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const i=t?.appData;Ka.value={...t.appData,...i},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}t?.messages?.forEach(i=>{ia.show(i.text,{position:i.position?this.mapPosition(i.position):void 0,theme:i.variant,duration:i.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(i=>{Lt.next({command:i,fragment:void 0,ui:void 0,error:void 0,callbackToken:s})})}}async runAction(t,a,s,i,r,n,l,c,u,h,p,f,g,y,x){try{const P=await Zc.handle(t,{baseUrl:a,route:s,consumedRoute:i,actionId:r,appState:le.value,initiatorComponentId:n,componentState:u,parameters:h,serverSideType:c,initiator:p,background:f});g&&g(P),y||this.handleUIIncrement(P,p,x),P.messages&&P.messages.length==1&&P.messages[0].variant=="error"&&p.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0})),p.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r,evevntId:ye()},bubbles:!0,composed:!0}))}catch(P){console.warn("Action request failed",P),p.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(P)}})),p.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}}serialize(t){return t?.message?t:JSON.stringify(t)}}const tu=new eu;class au{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,a,s)=>{if(t?.messages?.forEach(i=>{if(i.undoActionId){this.showUndoableMessage(i,a);return}ia.show(i.text,{position:i.position?this.mapPosition(i.position):"bottom-end",theme:i.variant,duration:i.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(i=>{Lt.next({command:i,fragment:void 0,ui:void 0,error:void 0,callbackToken:s})}),t?.fragments?.forEach(i=>{Lt.next({command:void 0,fragment:i,ui:void 0,error:void 0,callbackToken:s})}),t?.appState&&(le.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const i=t?.appData;Ka.value={...t.appData,...i},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}}}async runAction(t,a,s,i,r,n,l,c,u,h,p,f,g,y,x){if(s){s=s||"_no_route",s&&s.startsWith("/")&&(s=s.substring(1));const P={serverSideType:c,appState:le.value,componentState:u,parameters:h,initiatorComponentId:n,consumedRoute:i,route:"/"+s,actionId:r};f||p.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),fetch(a+"/mateu/v3/sse/"+s,{method:"POST",headers:{Accept:"text/event-stream","Content-Type":"application/json"},body:JSON.stringify(P)}).then(async q=>{const ae=q.body?.pipeThrough(new TextDecoderStream).getReader();if(ae){let N="";for(;;){const{value:ne,done:ue}=await ae.read();if(ue)break;N+=ne;const ie=N.split(`

`);N=ie.pop()??"";for(const K of ie){const Z=K.trim();if(Z)if(Z.startsWith("data:")){const fe=JSON.parse(Z.substring(5).trim());g&&g(fe),y||this.handleUIIncrement(fe,p,x),fe.messages&&fe.messages.length==1&&fe.messages[0].variant=="error"&&p.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}else{let fe=Z;try{const I=JSON.parse(Z);fe=I.message,I._embedded?.errors?.length>0&&I._embedded.errors[0].message&&(fe=I._embedded.errors[0].message)}catch{}throw new Error(fe)}}}}f||p.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:r}})),p.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r},bubbles:!0,composed:!0}))}).catch(q=>{p.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(q)}})),p.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))})}}serialize(t){return t?.message?t:JSON.stringify(t)}showUndoableMessage(t,a){const s=new ia;s.position=t.position?this.mapPosition(t.position):"bottom-end",s.duration=t.duration??1e4,t.variant&&s.setAttribute("theme",t.variant),s.renderer=i=>{if(i.firstElementChild)return;const r=document.createElement("span");r.textContent=t.text;const n=document.createElement("button");n.textContent=t.undoLabel??"Undo",n.style.cssText="margin-left: 0.75rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;",n.addEventListener("click",()=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.undoActionId,parameters:t.undoParameters??{}},bubbles:!0,composed:!0})),s.opened=!1}),i.append(r,n)},document.body.appendChild(s),s.opened=!0,s.addEventListener("opened-changed",i=>{i.detail.value||s.remove()})}}const Xr=new au,Qr=e=>{if(!e||!("querySelectorAll"in e))return null;for(const t of e.querySelectorAll("*")){if(t.tagName?.toLowerCase()==="mateu-component")return t;const a=Qr(t.shadowRoot);if(a)return a}return null},Zr=async(e,t,a)=>{const s=t.renderRoot??t,i=Qr(s);await Xr.runAction(va,t.baseUrl??"",e.rootRoute||"_no_route","",a,i?.id??"app-header-action",{},e.serverSideType??"",{},{},i??t,!0,void 0,!1,"")},er=async(e,t,a)=>{try{await Zr(e,t,a)}catch(s){ia.show("La acción falló: "+s,{position:"bottom-start",duration:6e3,theme:"error"})}},qa=(e,t)=>{const a=e.contextSelectors??[],s=e.contextActions??[];return a.length===0&&s.length===0&&!e.notificationsEnabled?d:o`${e.notificationsEnabled?o`
        <mateu-notification-bell .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-notification-bell>`:d}${a.map(i=>o`
        <mateu-vaadin-app-context-picker .selector="${i}" .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-vaadin-app-context-picker>`)}${s.map(i=>(i.children?.length??0)>0?o`
        <vaadin-menu-bar theme="primary small" style="margin-left: 0.5rem; flex-shrink: 0;"
            .items="${[{text:i.label,children:i.children.map(r=>({text:r.label,actionId:r.actionId}))}]}"
            @item-selected="${r=>{const n=r.detail?.value?.actionId;n&&er(e,t,n)}}"></vaadin-menu-bar>`:o`
        <vaadin-button theme="primary small" style="margin-left: 0.5rem; flex-shrink: 0;"
            @click="${()=>i.actionId&&er(e,t,i.actionId)}" title="${i.label}">
            ${i.icon?o`<vaadin-icon icon="${i.icon}" slot="prefix"></vaadin-icon>`:d}${i.label}
        </vaadin-button>`)}`},gi=(e,t)=>e.themeToggle?o`
        <vaadin-button theme="tertiary icon" @click="${t.toggleTheme}"
            title="${t.isDark?"Switch to light mode":"Switch to dark mode"}"
            style="margin-left: 0.5rem; margin-right: 0.5rem; flex-shrink: 0;">
            <vaadin-icon icon="${t.isDark?"vaadin:sun-o":"vaadin:moon"}" style="color: var(--lumo-body-text-color);"></vaadin-icon>
        </vaadin-button>
    `:d,iu=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},tr=(e,t,a)=>{const s=De(e,t,a),i=re(t,a);return s=="list"||s==i?"new":s},De=(e,t,a)=>{const s=e?._route;if(s!=null&&(s===""||s.startsWith("/"))){const i=a.homeRoute??"",r=i.indexOf("?"),n=r>=0?i.substring(r+1):"",l=re(t,a)+s;if(!n)return l;const c=l.indexOf("?")>=0?"&":"?";return l+c+n}return t.selectedRoute?t.selectedRoute:a.homeRoute},re=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,_e=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:t.homeBaseUrl,Ee=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,Pe=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,su=(e,t,a,s,i,r,n)=>{const l=e.mapItems(t.menu,e.filter?.toLowerCase()??""),c=re(e,t),u=tr(s,e,t),h=u&&u!=="new"&&u.startsWith(c+"/")?u.substring(c.length+1).split("/")[0]:void 0;return o`
                    ${t.variant==$e.MEDIATOR?o`

                        ${t.layout=="SPLIT"?o`
                            <vaadin-master-detail-layout>
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${re(e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${_e(e,t)}"
                                            consumedRoute="${re(e,t)}"
                                            serverSideType="${Ee(e,t)}"
                                            uriPrefix="${Pe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${{...r,_splitDetailId:h}}"
                                            .appData="${n}"
                                            instant="${c}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>
                                <mateu-api-caller slot="detail">
                                    <div style="padding-left: 1rem; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${tr(s,e,t)}"
                                            id="ux_${e.id}_detail"
                                            baseUrl="${_e(e,t)}"
                                            consumedRoute="${re(e,t)}"
                                            serverSideType="${Ee(e,t)}"
                                            uriPrefix="${Pe(e,t)}"
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
                                        route="${De(s,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${_e(e,t)}"
                                        consumedRoute="${re(e,t)}"
                                        serverSideType="${Ee(e,t)}"
                                        uriPrefix="${Pe(e,t)}"
                                        style="width: 100%;"
                                        .appState="${r}"
                                        .appData="${n}"
                                        .initialState="${s}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `}
                        
`:d}
            ${t.variant==$e.HAMBURGUER_MENU?o`
                <vaadin-app-layout style="${t?.style}" class="${t?.cssClasses}" .drawerOpened=${!t.drawerClosed}>
                    <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                    <h2 slot="navbar" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2><p slot="navbar">${t.subtitle}</p>
                    <vaadin-horizontal-layout slot="navbar" style="margin-left: auto; align-items: center;">
                        <slot name="widgets"></slot>
                        ${qa(t,e)}${gi(t,e)}
                    </vaadin-horizontal-layout>
                    <vaadin-scroller slot="drawer" class="p-s"
                                     @navigation-requested="${e.updateRoute}">
                        ${t.menu&&t.totalMenuOptions>10?o`
                            <vaadin-text-field style="width: calc(100% - 20px); padding-left: 10px; padding-right: 10px;" @value-changed="${p=>iu(p,e)}">
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
                                            route="${De(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${_e(e,t)}"
                                            consumedRoute="${re(e,t)}"
                                            serverSideType="${Ee(e,t)}"
                                            uriPrefix="${Pe(e,t)}"
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
            
            ${t.variant==$e.MENU_ON_TOP?o`
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
                            ${qa(t,e)}${gi(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${De(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${_e(e,t)}"
                                            consumedRoute="${re(e,t)}"
                                            serverSideType="${Ee(e,t)}"
                                            uriPrefix="${Pe(e,t)}"
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

            ${t.variant==$e.TILES?o`
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
                            ${qa(t,e)}${gi(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):o`
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${De(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${_e(e,t)}"
                                            consumedRoute="${re(e,t)}"
                                            serverSideType="${Ee(e,t)}"
                                            uriPrefix="${Pe(e,t)}"
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

            ${t.variant==$e.RAIL?o`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):d}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${De(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${_e(e,t)}"
                                            consumedRoute="${re(e,t)}"
                                            serverSideType="${Ee(e,t)}"
                                            uriPrefix="${Pe(e,t)}"
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

            ${t.variant==$e.MENU_ON_LEFT?o`

                <vaadin-horizontal-layout>
                    <vaadin-scroller style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <vaadin-vertical-layout
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(p=>e.renderOptionOnLeftMenu(p))}
                            ${qa(t,e)}${gi(t,e)}
                        </vaadin-vertical-layout>
                    </vaadin-scroller>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${De(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${_e(e,t)}"
                                            consumedRoute="${re(e,t)}"
                                            serverSideType="${Ee(e,t)}"
                                            uriPrefix="${Pe(e,t)}"
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

            ${t.variant==$e.TABS?o`
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
                                ${t.menu.map(p=>o`
                                <vaadin-tab 
                                        @click="${()=>e.selectRoute(p.consumedRoute,p.route,p.actionId,p.baseUrl,p.serverSideType,p.uriPrefix)}"
                                >${p.label}</vaadin-tab>
                            `)}
                            </vaadin-tabs>
                            <vaadin-horizontal-layout style="flex-shrink: 0; align-items: center;">
                                <slot name="widgets"></slot>
                                ${qa(t,e)}
                            </vaadin-horizontal-layout>
                        </vaadin-horizontal-layout>
                    </div>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${De(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${_e(e,t)}"
                                            consumedRoute="${re(e,t)}"
                                            serverSideType="${Ee(e,t)}"
                                            uriPrefix="${Pe(e,t)}"
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

            ${t.fabs?.map((p,f)=>o`
                <button class="app-fab" style="bottom: ${t.sseUrl?5.5+f*4:1.5+f*4}rem; right: 1.5rem;"
                    @click="${()=>e.runAction(p.actionId)}"
                    title="${p.label}">
                    <vaadin-icon icon="${p.icon}"></vaadin-icon>
                </button>
            `)}
            ${t.sseUrl&&!e.chatOpen?o`
                <button class="ai-fab" @click="${e.showHideIa}" title="Asistente IA">
                    <vaadin-icon icon="vaadin:comments-o"></vaadin-icon>
                </button>
            `:d}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},ru=(e,t)=>t!=null&&e!=null&&!e.has(t),ou=typeof HTMLElement<"u"?HTMLElement:class{};class nu extends ou{static get observedAttributes(){return["type","renderer"]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){const t=this.getAttribute("type")??"unknown",a=this.getAttribute("renderer")??"unknown";this.shadowRoot||this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
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
        `}}typeof customElements<"u"&&!customElements.get("mateu-unsupported")&&customElements.define("mateu-unsupported",nu);const ar=new Set,lu=(e,t,a)=>{const s=`${a}/${t}`;return ar.has(s)||(ar.add(s),console.warn(`[mateu] Component type "${t}" is not supported by the "${a}" renderer — rendering <mateu-unsupported> placeholder.`)),o`<mateu-unsupported
            type="${t}"
            renderer="${a}"
            data-component-id="${e?.id??d}"
            slot="${e?.slot??d}"
    ></mateu-unsupported>`};class du{renderFilterBar(t,a,s,i,r,n,l,c){const u=a?.metadata,h=f=>{const{fieldId:g,value:y}=f.detail;t.state={...t.state,[g]:y}},p=f=>{const{fieldIds:g}=f.detail,y={};g.forEach(x=>{y[x]=void 0}),y.searchText=void 0,t.state={...t.state,...y}};return o`
            <mateu-filter-bar
                .metadata="${u}"
                @search-requested="${t.search}"
                @value-changed="${h}"
                @filter-reset-requested="${p}"
                .state="${t.state}"
                .data="${r}"
                .appState="${n}"
                .appData="${l}"
                ?searchOnly="${c??!1}"
            >
                ${u?.header?.map(f=>w(t,f,s,i,r,n,l))}
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
        `}renderTableComponent(t,a,s,i,r,n,l){return o`
        <mateu-table id="${t.id}"
                     .metadata="${a?.metadata}"
                     .data="${t.data}"
                     .state="${i}"
                     .appState="${n}"
                     .appData="${l}"
                     .emptyStateMessage="${i[a?.id]?.emptyStateMessage}"
                     @sort-direction-changed="${t.directionChanged}"
                     @fetch-more-elements="${t.fetchMoreElements}"
                     baseUrl="${s}"
        ></mateu-table>
        `}rendererName(){return this.constructor?.name??"unknown"}supportedClientSideTypes(){}renderClientSideComponent(t,a,s,i,r,n,l,c){const u=a?.metadata?.type??a?.type,h=Object.values(v).includes(u)?u:void 0;return ru(this.supportedClientSideTypes(),h)?lu(a,h,this.rendererName()):Rs(t,a,s,i,r,n,l,c)}renderAppComponent(t,a,s,i,r,n,l){return su(t,a?.metadata,s,i,r,n,l)}}const ir="border-left: 1px solid var(--oj-core-text-color-secondary, #888); height: 1.5rem; display: inline-block; align-self: center;",cu=(e,t,a,s)=>{const i=e.metadata,r=e.slot??d;if(i.children&&i.children.length>0){const n=i.children.map(l=>({key:l.actionId,label:l.label,disabled:l.disabled??!1}));return o`
            ${i.separatorBefore?o`<span slot="${r}" style="${ir}"></span>`:d}
            <oj-c-menu-button
                data-oj-binding-provider="preact"
                label="${i.label}"
                .items="${n}"
                slot="${r}"
                @ojMenuAction="${l=>{const c=l.detail.key;l.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:c},bubbles:!0,composed:!0}))}}"
            ></oj-c-menu-button>
        `}return o`
        ${i.separatorBefore?o`<span slot="${r}" style="${ir}"></span>`:d}
        <oj-c-button
            data-oj-binding-provider="preact"
            data-action-id="${i.actionId}"
            label="${i.label}"
            @ojAction=${Em}
            slot="${r}"
        ></oj-c-button>
    `};var uu=Object.defineProperty,pu=Object.getOwnPropertyDescriptor,ri=(e,t,a,s)=>{for(var i=s>1?void 0:s?pu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&uu(t,a,i),i};let na=class extends S{constructor(){super(...arguments),this.fieldId="",this.signing=!1,this.hasStrokes=!1,this.drawing=!1,this.startStroke=e=>{const t=e.target;this.ensureCanvasSize(t),t.setPointerCapture(e.pointerId),this.drawing=!0;const a=t.getContext("2d");a.lineWidth=2,a.lineCap="round",a.lineJoin="round",a.strokeStyle=getComputedStyle(this).getPropertyValue("--lumo-body-text-color")||"#1a1a1a";const[s,i]=this.pointerPosition(e);a.beginPath(),a.moveTo(s,i),e.preventDefault()},this.stroke=e=>{if(!this.drawing)return;const a=e.target.getContext("2d"),[s,i]=this.pointerPosition(e);a.lineTo(s,i),a.stroke(),this.hasStrokes=!0,e.preventDefault()},this.endStroke=e=>{this.drawing=!1,e.target.releasePointerCapture(e.pointerId)}}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}canvas(){return this.renderRoot.querySelector("canvas")}pointerPosition(e){const a=e.target.getBoundingClientRect();return[e.clientX-a.left,e.clientY-a.top]}ensureCanvasSize(e){const t=e.getBoundingClientRect();(e.width!==Math.round(t.width)||e.height!==Math.round(t.height))&&(e.width=Math.round(t.width),e.height=Math.round(t.height))}clear(){const e=this.canvas();e&&e.getContext("2d").clearRect(0,0,e.width,e.height),this.hasStrokes=!1}accept(){const e=this.canvas();!e||!this.hasStrokes||(this.signing=!1,this.emit(e.toDataURL("image/png")))}renderPad(){return o`
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
            </div>`}};na.styles=C`
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
    `;ri([m()],na.prototype,"fieldId",2);ri([m()],na.prototype,"value",2);ri([$()],na.prototype,"signing",2);ri([$()],na.prototype,"hasStrokes",2);na=ri([k("mateu-signature-pad")],na);var hu=Object.defineProperty,mu=Object.getOwnPropertyDescriptor,fa=(e,t,a,s)=>{for(var i=s>1?void 0:s?mu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&hu(t,a,i),i};let Ct=class extends S{constructor(){super(...arguments),this.fieldId="",this.options=[],this.leavesOnly=!1,this.opened=!1,this.expanded=new Set}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}open(){this.opened||(this.opened=!0,this.expanded=new Set(this.pathTo(this.value??"",this.options)??[]),this.outsideClick=e=>{e.composedPath().includes(this)||this.close()},document.addEventListener("mousedown",this.outsideClick))}close(){this.detachOutsideClick(),this.opened=!1}pick(e){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e.value,fieldId:this.fieldId},bubbles:!0,composed:!0}))}clear(){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:this.fieldId},bubbles:!0,composed:!0}))}pathTo(e,t){for(const a of t){if(String(a.value)===e)return[];const s=this.pathTo(e,a.children??[]);if(s!=null)return[String(a.value),...s]}return null}labelOf(e,t){for(const a of t){if(String(a.value)===e)return a.label;const s=this.labelOf(e,a.children??[]);if(s!=null)return s}return null}toggle(e){const t=String(e.value),a=new Set(this.expanded);a.has(t)?a.delete(t):a.add(t),this.expanded=a}renderNode(e,t){const a=(e.children?.length??0)>0,s=this.expanded.has(String(e.value)),i=!this.leavesOnly||!a,r=String(e.value)===String(this.value??"");return o`
            <div class="node ${r?"node--selected":""} ${i?"":"node--group"}"
                 style="padding-left: ${.5+t*1.1}rem;"
                 @mousedown="${n=>n.preventDefault()}"
                 @click="${()=>i?this.pick(e):this.toggle(e)}">
                ${a?o`
                    <span class="caret" @click="${n=>{n.stopPropagation(),this.toggle(e)}}"
                    >${s?"▾":"▸"}</span>`:o`<span class="caret caret--empty"></span>`}
                ${e.label}
            </div>
            ${a&&s?e.children.map(n=>this.renderNode(n,t+1)):d}`}render(){const e=this.value?this.labelOf(String(this.value),this.options)??String(this.value):"";return o`
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
            </div>`}};Ct.styles=C`
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
    `;fa([m()],Ct.prototype,"fieldId",2);fa([m()],Ct.prototype,"value",2);fa([m()],Ct.prototype,"options",2);fa([m({type:Boolean})],Ct.prototype,"leavesOnly",2);fa([$()],Ct.prototype,"opened",2);fa([$()],Ct.prototype,"expanded",2);Ct=fa([k("mateu-tree-select")],Ct);var vu=Object.defineProperty,fu=Object.getOwnPropertyDescriptor,oi=(e,t,a,s)=>{for(var i=s>1?void 0:s?fu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&vu(t,a,i),i};let la=class extends S{constructor(){super(...arguments),this.fieldId="",this.cameraOpen=!1,this.cameraError=!1,this.fileFallback=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const s=new FileReader;s.onload=()=>this.emit(s.result),s.readAsDataURL(a),t.value=""}}disconnectedCallback(){super.disconnectedCallback(),this.stopStream()}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}stopStream(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}async openCamera(){this.cameraError=!1;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:!1}),this.cameraOpen=!0,await this.updateComplete;const e=this.renderRoot.querySelector("video");e&&(e.srcObject=this.stream,await e.play())}catch{this.stopStream(),this.cameraOpen=!1,this.cameraError=!0}}closeCamera(){this.stopStream(),this.cameraOpen=!1}shoot(){const e=this.renderRoot.querySelector("video");if(!e||e.videoWidth===0)return;const t=document.createElement("canvas");t.width=e.videoWidth,t.height=e.videoHeight,t.getContext("2d").drawImage(e,0,0),this.closeCamera(),this.emit(t.toDataURL("image/jpeg",.9))}triggerFallback(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="";return o`
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
            `}`}};la.styles=C`
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
    `;oi([m()],la.prototype,"fieldId",2);oi([m()],la.prototype,"value",2);oi([$()],la.prototype,"cameraOpen",2);oi([$()],la.prototype,"cameraError",2);la=oi([k("mateu-camera-capture")],la);var bu=Object.defineProperty,gu=Object.getOwnPropertyDescriptor,ni=(e,t,a,s)=>{for(var i=s>1?void 0:s?gu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&bu(t,a,i),i};const eo=(e,t)=>{if(!e)return;if(Array.isArray(e)){const s=e.find(i=>i.key==t);return s?.value!=null?String(s.value):void 0}const a=e[t];return a!=null?String(a):void 0};let Bt=class extends S{constructor(){super(...arguments),this.fieldId="",this.editable=!0,this.filePicked=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const s=new FileReader;s.onload=()=>{const i=s.result,r=i.indexOf(","),n=i.substring(0,r).replace(";base64",`;name=${encodeURIComponent(a.name)};base64`);this.emit(n+i.substring(r))},s.readAsDataURL(a),t.value=""}}static fileName(e){if(!e)return"";if(e.startsWith("data:")){const t=e.indexOf(","),s=e.substring(5,t<0?e.length:t).split(";").find(i=>i.startsWith("name="));if(s)try{return decodeURIComponent(s.substring(5))}catch{return s.substring(5)}return"Attached file"}return e.split("/").pop()||e}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}triggerPick(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="",t=Bt.fileName(this.value),a=e&&this.value.startsWith("data:"),s=e?o`<span class="file" title="${t}">📄 ${a?o`<a href="${this.value}" download="${t}">${t}</a>`:o`<a href="${this.value}" target="_blank">${t}</a>`}</span>`:d;return this.editable?o`
            <input type="file" accept="${this.accept||d}" style="display: none;"
                   @change="${this.filePicked}">
            <div class="row">
                ${s}
                <button class="button" @click="${this.triggerPick}">
                    ${e?"Replace":"Choose file"}
                </button>
                ${e?o`
                    <button class="button button--danger" @click="${()=>this.emit("")}">Remove</button>`:d}
            </div>`:o`${e?s:o`<span class="empty">—</span>`}`}};Bt.styles=C`
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
    `;ni([m()],Bt.prototype,"fieldId",2);ni([m()],Bt.prototype,"value",2);ni([m()],Bt.prototype,"accept",2);ni([m({type:Boolean})],Bt.prototype,"editable",2);Bt=ni([k("mateu-file-upload")],Bt);const $u=76;function sr(e){if(e.weight!=null)return e.weight;const t=e.stereotype??"";if(t==="icon")return 1;if(t==="image")return 4;if(t==="html"||t==="richText"||t==="markdown"||t==="textarea")return 5;if(t==="link")return 2.5;if(t==="combobox"||t==="select")return 2;const a=e.dataType??"";return a==="bool"?1:a==="status"||a==="integer"?1.5:a==="number"||a==="date"||a==="money"?2:a==="dateTime"||a==="dateRange"?2.5:3}function to(e,t){if(e.length===0)return"table";const a=e.reduce((c,u)=>c+sr(u),0),s=t/$u,i=a/s;if(i<=1)return"table";const r=e.filter(c=>c.identifier||(c.priority??Number.MAX_SAFE_INTEGER)<=2),n=r.reduce((c,u)=>c+sr(u),0);return i>1.6||e.length>10?"masterDetail":r.length>0&&n<=8?"list":e.some(c=>c.stereotype==="image"||c.stereotype==="html")||r.length===0&&e.length>=4&&e.length<=8?"cards":"masterDetail"}function $s(e){return e.filter(t=>t.identifier||(t.priority??Number.MAX_SAFE_INTEGER)<=2).sort((t,a)=>(t.priority??Number.MAX_SAFE_INTEGER)-(a.priority??Number.MAX_SAFE_INTEGER))}var yu=Object.defineProperty,xu=Object.getOwnPropertyDescriptor,js=(e,t,a,s)=>{for(var i=s>1?void 0:s?xu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&yu(t,a,i),i};let ji=class extends S{constructor(){super(...arguments),this.actions=[],this.rowdata={}}createRenderRoot(){return this}handleMenuAction(e){e.stopPropagation();const t=e.detail?.key;t&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:{_clickedRow:this.rowdata}},bubbles:!0,composed:!0}))}render(){const e=this.actions??[];if(!e.length)return o`${d}`;const t=e.map(a=>({label:a.label??a.text??"",key:a.methodNameInCrud??a.actionId??a.id??a.key??a.label,disabled:a.disabled??!1}));return o`
            <oj-c-menu-button
                data-oj-binding-provider="preact"
                label="···"
                chroming="borderless"
                .items="${t}"
                @ojMenuAction="${a=>this.handleMenuAction(a)}"
            ></oj-c-menu-button>
        `}};js([m({type:Array})],ji.prototype,"actions",2);js([m({type:Object})],ji.prototype,"rowdata",2);ji=js([k("mateu-redwood-action-menu")],ji);var wu=Object.defineProperty,ku=Object.getOwnPropertyDescriptor,Ue=(e,t,a,s)=>{for(var i=s>1?void 0:s?ku(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&wu(t,a,i),i};function ds(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const xa="var(--mateu-redwood-text, rgb(22, 21, 19))",Rt="var(--oj-core-text-color-secondary, #666)",He="var(--oj-core-divider-color, #e0e0e0)",Ua="var(--mateu-redwood-panel-bg, #fff)",rr="var(--oj-link-text-color, rgb(28, 101, 154))",$i="rgba(28, 101, 154, 0.08)";let W=class extends S{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.dataProvider=void 0,this._connected=!1,this.availableWidthPx=1024,this.selectedItem=null,this.collapsedNodes=new Set,this.mountTimer=null,this.lastContentRef=null,this.lastContentLen=-1}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this._connected=!0,this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}get cols(){return this.metadata?.columns?.map(e=>e.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":to(this.cols,this.availableWidthPx):t}getRows(){return this.data[this.id]?.page?.content??[]}get groupedTableActive(){const e=this.data?.[this.id];return this.metadata?.groupBy&&(e?.groups?.length??0)>0?!0:!!e?.aggregates&&this.cols.some(a=>a.aggregate)}isLinkColumn(e){return!!e.actionId&&e.stereotype!=="button"&&!["action","actionGroup","status","menu"].includes(e.dataType??"")}getOjColumns(){const e={};return this.metadata?.columns?.forEach(t=>{const a=t.metadata,s=a.stereotype==="button"||a.dataType==="action"||a.dataType==="actionGroup"||a.dataType==="status"||a.dataType==="menu"||this.isLinkColumn(a),i={headerText:a.label,field:a.id};a.resizable&&(i.resizable="enabled"),a.flexGrow!=null&&(i.weight=a.flexGrow),s&&(i.template=a.id+"Template"),e[a.id]=i}),e}getTemplateSlots(){let e="";return this.metadata?.columns?.forEach(t=>{const a=t.metadata;if(a.stereotype==="button"){const s=ds(a.text??a.label??"View"),i=ds(a.actionId??a.id??"");e+=`<template slot="${a.id}Template" data-oj-as="cell">`,e+="<span>",e+=`<oj-c-button
 data-mateu-row-key="[[cell.item.data._rowNumber]]" 
 data-mateu-action-id="${i}"
data-oj-binding-provider="preact" label="${s}" chroming="borderless"></oj-c-button>`,e+="</span>",e+="</template>"}else if(this.isLinkColumn(a)){const s=ds(a.actionId??"");e+=`<template slot="${a.id}Template" data-oj-as="cell">`,e+="<span>",e+=`<oj-c-button
 data-mateu-row-key="[[cell.item.data._rowNumber]]"
 data-mateu-action-id="${s}"
data-oj-binding-provider="preact" label="[[cell.data == null ? '' : '' + cell.data]]" chroming="borderless"></oj-c-button>`,e+="</span>",e+="</template>"}else if(a.dataType==="status")e+=`<template slot="${a.id}Template" data-oj-as="cell">`,e+="<oj-c-badge",e+=` label="[[cell.data ? (cell.data.message || String(cell.data)) : '']]"`,e+=` variant="[[cell.data ? (cell.data.type === 'SUCCESS' ? 'successSubtle' : cell.data.type === 'DANGER' ? 'dangerSubtle' : cell.data.type === 'WARNING' ? 'warningSubtle' : cell.data.type === 'INFO' ? 'infoSubtle' : 'neutral') : 'neutral']]"`,e+="></oj-c-badge>",e+="</template>";else if(a.dataType==="actionGroup"||a.dataType==="menu")e+=`<template slot="${a.id}Template" data-oj-as="cell">`,e+="<oj-c-menu-button",e+=' data-oj-binding-provider="preact"',e+=' label="···"',e+=' chroming="borderless"',e+=` :items="[[cell.data && cell.data.actions ? cell.data.actions.map(function(a){return {label:a.label||a.text||'',key:(cell.item.key+'')+'|'+(a.methodNameInCrud||a.actionId||a.id||a.key||(a.label||'')),disabled:!!a.disabled};}) : []]]"`,e+="></oj-c-menu-button>",e+="</template>";else if(a.dataType==="action"){const s=a.actionId||a.id;e+=`<template slot="${a.id}Template" data-oj-as="cell">`,e+="<oj-c-menu-button",e+=' data-oj-binding-provider="preact"',e+=' label="···"',e+=' chroming="borderless"',e+=` :items="[[cell.data ? [{label:cell.data.label||cell.data.text||'${s}',key:(cell.item.key+'')+'|'+(cell.data.methodNameInCrud||'${s}'),disabled:!!cell.data.disabled}] : []]]"`,e+="></oj-c-menu-button>",e+="</template>"}}),e}refreshDataProvider(){const e=()=>{const t=this.data[this.id]?.page?.content??[];this.dataProvider=new W._ADP(t,{keyAttributes:"@index"}),this.scheduleMount()};W._ADP?e():require(["ojs/ojarraydataprovider"],t=>{W._ADP=t.default??t,this.isConnected&&e()})}scheduleMount(){this.mountTimer&&clearTimeout(this.mountTimer),this.mountTimer=setTimeout(()=>{this.mountTimer=null,this.mountTable()},60)}mountTable(){const e=this.querySelector(".rwt-table-host");if(!e)return;const t=document.createElement("oj-c-table");t.setAttribute("data-oj-binding-provider","preact"),t.setAttribute("aria-label","Data table"),t.setAttribute("layout","contents"),t.style.width="100%";const a=this.getTemplateSlots();if(a){const s=document.createElement("div");s.innerHTML=a,Array.from(s.childNodes).forEach(i=>t.appendChild(i))}t.columns=this.getOjColumns(),t.selectionMode=this.metadata?.rowsSelectionEnabled?{row:"multiple"}:{row:"none"},t.addEventListener("ojRowAction",s=>this.handleRowAction(s)),t.addEventListener("ojAction",s=>this.handleCellButtonAction(s)),t.addEventListener("selectedChanged",s=>this.handleSelectedChanged(s)),t.addEventListener("ojMenuAction",s=>this.handleMenuAction(s)),t.data=this.dataProvider,e.replaceChildren(t)}updated(e){super.updated(e),e.has("metadata")&&(this.lastContentRef=!1);const t=this.data?.[this.id]?.page?.content,a=Array.isArray(t)?t.length:0,s=t!==this.lastContentRef||a!==this.lastContentLen;if(s&&(this.lastContentRef=t,this.lastContentLen=a),this.effectiveGridLayout==="table"&&!this.groupedTableActive){const i=this.querySelector(".rwt-table-host");(s||i&&i.childElementCount===0)&&this.refreshDataProvider()}else s&&(this.collapsedNodes.clear(),this.requestUpdate())}handleRowAction(e){console.log("handleRowAction",e);const t=e.detail?.context?.item?.data;if(!t)return;const a=this.metadata?.columns?.find(s=>{const i=s.metadata;return i.stereotype==="button"&&i.actionId});if(a){const s=a.metadata;this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId,parameters:t},bubbles:!0,composed:!0}))}}handleCellButtonAction(e){console.log("handleCellButtonAction",e);const t=e.composedPath();let a=null,s=null;for(const n of t){const l=n;if(console.log("el",l),l.getAttribute("data-mateu-row-key")){const c=l.getAttribute("data-mateu-row-key");if(console.log("k",c),c!==null){a=c,s=l.getAttribute("data-mateu-action-id");break}}}if(a===null)return;const i=this.data[this.id]?.page?.content??[],r=i.find((n,l)=>n._rowNumber==a)??{};console.log("rowData",a,i,r),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s??"",parameters:r},bubbles:!0,composed:!0}))}handleMenuAction(e){console.log("handleMenuAction",e);const t=e.detail?.key;if(!t)return;const a=t.indexOf("|");if(a<0)return;const s=parseInt(t.substring(0,a)),i=t.substring(a+1),n=(this.data[this.id]?.page?.content??[])[s]??{};this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i,parameters:n},bubbles:!0,composed:!0}))}handleSelectedChanged(e){console.log("handleSelectedChanged",e);const t=e.detail.value?.row;if(!t)return;const a=this.data[this.id]?.page?.content??[],s=t.isAddAll()?a:a.filter((i,r)=>t.has(r));this.state.crud_selected_items=s}dispatchAction(e,t){this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}openRow(e){const t=this.identifierFieldName;t&&e[t]!==void 0&&(this.state._selectedId=String(e[t])),this.dispatchAction("view",e),this.requestUpdate()}isSelectedRow(e){const t=this.identifierFieldName,a=this.state?._selectedId??this.appState?._splitDetailId;return!!t&&a!==void 0&&String(e[t])===String(a)}static isActionButtonCol(e){return e.dataType==="action"||e.dataType==="actionGroup"||e.dataType==="menu"||e.stereotype==="button"}statusBadge(e){const t=(e?.type??"").toUpperCase();return o`<span style="${t==="SUCCESS"?"background: rgba(104, 150, 90, 0.18); color: rgb(49, 93, 36);":t==="DANGER"||t==="ERROR"?"background: rgba(179, 49, 31, 0.14); color: rgb(150, 40, 27);":t==="WARNING"?"background: rgba(190, 120, 0, 0.16); color: rgb(124, 79, 4);":t==="INFO"?"background: rgba(28, 101, 154, 0.14); color: rgb(28, 90, 131);":"background: rgba(22, 21, 19, 0.08); color: rgb(70, 68, 66);"} border-radius: 1rem; padding: 0.1rem 0.6rem; font-size: 0.75rem; font-weight: 600; white-space: nowrap;">${e?.message??String(e??"")}</span>`}formatValue(e,t){const a=t[e.id];return a==null?o``:e.dataType==="status"?this.statusBadge(a):e.dataType==="bool"||e.dataType==="boolean"?o`${a?"✓":"✗"}`:typeof a=="object"?o`${a.label??a.name??a.message??""}`:o`${a}`}linkButton(e,t,a){return o`
            <button title="${a||d}"
                    style="background: transparent; border: none; color: ${rr}; font-family: inherit; font-size: 0.8125rem; font-weight: 600; cursor: pointer; padding: 0.2rem 0.4rem; border-radius: 4px;"
                    @click="${t}">${e}</button>`}renderRowActionButtons(e,t,a){const s=[],i=(r,n)=>{r.stopPropagation(),this.dispatchAction("action-on-row-"+n,{_clickedRow:e})};for(const r of t){const n=e[r.id];if(r.dataType==="action"){const l=n?.methodNameInCrud?n:e.action?.methodNameInCrud?e.action:{methodNameInCrud:r.id,label:r.label};s.push(this.linkButton(l.label??"",c=>i(c,l.methodNameInCrud),l.label))}else(r.dataType==="actionGroup"||r.dataType==="menu")&&(n?.actions??[]).forEach(c=>s.push(this.linkButton(c.label??"",u=>i(u,c.methodNameInCrud),c.label)))}return s.length?o`
            <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.35rem; ${a?`padding-top: 0.5rem; border-top: 1px solid ${He};`:""}">
                ${s}
            </div>`:d}renderEmpty(){return o`
            <div style="padding: 1.5rem; text-align: center; color: ${Rt}; font-size: 0.875rem;">
                ${this.emptyStateMessage??this.metadata?.emptyStateMessage??"No data."}
            </div>`}renderListItem(e,t,a,s,i,r){return o`
            <div role="listitem"
                 style="padding: 0.6rem 0.75rem; border-bottom: 1px solid ${He}; cursor: pointer; ${s?`background: ${$i};`:""}"
                 onmouseover="this.style.background='rgba(22,21,19,0.04)'"
                 onmouseout="this.style.background='${s?$i:"transparent"}'"
                 @click="${i}">
                <div style="font-weight: 600; color: ${xa}; font-size: 0.875rem;">${t?e[t.id]??"":""}</div>
                <div style="font-size: 0.8125rem; color: ${Rt}; display: flex; flex-wrap: wrap; gap: 0.25rem 0.75rem; align-items: center;">
                    ${a.map(n=>o`<span>${n.label}: ${this.formatValue(n,e)}</span>`)}
                </div>
                ${r}
            </div>`}renderTwoLineList(e){const t=this.getRows(),a=$s(e),s=a.find(n=>n.identifier)??a[0],i=a.filter(n=>n!==s&&!W.isActionButtonCol(n)),r=e.filter(n=>W.isActionButtonCol(n));return o`
            <div role="list" style="width: 100%; background: ${Ua}; border: 1px solid ${He}; border-radius: 8px; overflow: hidden;">
                ${t.length===0?this.renderEmpty():d}
                ${t.map(n=>this.renderListItem(n,s,i,this.isSelectedRow(n),()=>this.openRow(n),this.renderRowActionButtons(n,r,!1)))}
            </div>`}renderCards(e){const t=this.getRows(),a=e.slice(0,6),s=a.filter(p=>p.stereotype==="image"),i=a.find(p=>p.identifier)??a[0],r=p=>!!p.actionId&&!W.isActionButtonCol(p),n=a.find(p=>p.id==="select"&&p.dataType==="action"),l=!!n,c=a.filter(p=>p!==i&&!s.includes(p)&&!r(p)&&!W.isActionButtonCol(p)),u=a.filter(p=>W.isActionButtonCol(p)&&!(l&&p===n)),h=(p,f)=>{l?(p.stopPropagation(),this.dispatchAction("action-on-row-select",{_clickedRow:f})):this.openRow(f)};return o`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; padding: 0.5rem 0;">
                ${t.length===0?o`<div style="grid-column: 1 / -1;">${this.renderEmpty()}</div>`:d}
                ${t.map(p=>o`
                    <div style="background: ${Ua}; border: 1px solid ${this.isSelectedRow(p)?rr:He}; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden; cursor: pointer; display: flex; flex-direction: column;"
                         onmouseover="this.style.boxShadow='0 3px 10px rgba(0,0,0,0.14)'"
                         onmouseout="this.style.boxShadow='0 1px 4px rgba(0,0,0,0.08)'"
                         @click="${f=>h(f,p)}">
                        ${s.length?o`<img src="${p[s[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover; display: block;"/>`:d}
                        <div style="padding: 0.75rem 1rem 1rem; display: flex; flex-direction: column; gap: 0.35rem; flex: 1;">
                            ${i?o`<div style="font-weight: 600; color: ${xa}; font-size: 1rem; margin-bottom: 0.25rem;">${p[i.id]??""}</div>`:d}
                            ${c.map(f=>o`
                                <div style="display: flex; gap: 0.5rem; font-size: 0.8125rem; align-items: baseline;">
                                    <span style="color: ${Rt}; min-width: 80px;">${f.label}</span>
                                    <span style="color: ${xa};">${this.formatValue(f,p)}</span>
                                </div>
                            `)}
                            ${this.renderRowActionButtons(p,u,!0)}
                        </div>
                    </div>
                `)}
            </div>`}renderMasterDetail(e){const t=this.getRows(),a=$s(e),s=a.find(r=>r.identifier)??a[0],i=a.filter(r=>r!==s);return o`
            <div style="display: flex; gap: 0; min-height: 400px; background: ${Ua}; border: 1px solid ${He}; border-radius: 8px; overflow: hidden;">
                <!-- Left: compact row list -->
                <div role="list" style="width: 280px; flex-shrink: 0; border-right: 1px solid ${He}; overflow-y: auto;">
                    ${t.length===0?this.renderEmpty():d}
                    ${t.map(r=>this.renderListItem(r,s,i,this.selectedItem===r,()=>{this.selectedItem=r},d))}
                </div>
                <!-- Right: full detail for the locally selected row -->
                <div style="flex: 1; overflow-y: auto; padding: 1rem;">
                    ${this.selectedItem?o`
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${e.filter(r=>!W.isActionButtonCol(r)).map(r=>o`
                                <div style="display: flex; gap: 0.75rem; align-items: baseline;">
                                    <span style="min-width: 140px; color: ${Rt}; font-size: 0.8125rem;">${r.label}</span>
                                    <span style="color: ${xa}; font-size: 0.875rem;">${this.formatValue(r,this.selectedItem)}</span>
                                </div>
                            `)}
                        </div>
                    `:o`
                        <p style="color: ${Rt}; font-size: 0.875rem;">Select a row to view details.</p>
                    `}
                </div>
            </div>`}renderTree(e){const t=this.getRows(),a=e[0],s=e.slice(1),i=!!a?.actionId,r=`text-align: left; padding: 0.5rem 0.75rem; border-bottom: 2px solid ${He}; color: ${Rt}; font-size: 0.8125rem; font-weight: 600; white-space: nowrap;`,n=`padding: 0.4rem 0.75rem; border-bottom: 1px solid ${He}; color: ${xa}; font-size: 0.875rem;`,l=1+(i?1:0)+s.length,c=(h,p)=>{h.stopPropagation(),this.collapsedNodes.has(p)?this.collapsedNodes.delete(p):this.collapsedNodes.add(p),this.requestUpdate()},u=(h,p)=>{const f=Array.isArray(h.children)?h.children:[],g=f.length>0,y=this.collapsedNodes.has(h);return[o`
                <tr style="${this.isSelectedRow(h)?`background: ${$i};`:""}">
                    <td style="${n} padding-left: ${.75+p*1.25}rem;">
                        <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
                            ${g?o`
                                <button aria-label="${y?"Expand":"Collapse"}"
                                        style="background: transparent; border: none; cursor: pointer; color: ${Rt}; font-size: 0.7rem; padding: 0 0.2rem; width: 1.2rem;"
                                        @click="${P=>c(P,h)}">${y?"▸":"▾"}</button>
                            `:o`<span style="display: inline-block; width: 1.2rem;"></span>`}
                            <span>${h[a?.id??""]??""}</span>
                        </span>
                    </td>
                    ${i?o`
                        <td style="${n} text-align: end; width: 6rem;">
                            ${h?.viewable===!1?d:this.linkButton("View",P=>{P.stopPropagation(),this.openRow(h)})}
                        </td>`:d}
                    ${s.map(P=>P.id==="select"&&P.dataType==="action"?o`
                            <td style="${n} text-align: end; width: 7rem;">
                                ${this.linkButton("Select",q=>{q.stopPropagation(),this.dispatchAction("action-on-row-select",{_clickedRow:h})})}
                            </td>`:o`<td style="${n}">${this.formatValue(P,h)}</td>`)}
                </tr>`,...y?[]:f.flatMap(P=>u(P,p+1))]};return o`
            <table style="width: 100%; border-collapse: collapse; background: ${Ua};">
                <thead>
                    <tr>
                        <th style="${r}">${a?.label??""}</th>
                        ${i?o`<th style="${r}"></th>`:d}
                        ${s.map(h=>o`<th style="${r} ${h.id==="select"?"text-align: end;":""}">${h.label??""}</th>`)}
                    </tr>
                </thead>
                <tbody>
                    ${t.length===0?o`<tr><td colspan="${l}">${this.renderEmpty()}</td></tr>`:t.flatMap(h=>u(h,0))}
                </tbody>
            </table>`}renderGroupedTable(e){const t=this.getRows(),a=this.data[this.id],s=this.metadata?.groupBy,i=Sr(t,s,a?.groups),r=Pr(e,a,s),n=_r(s,e.map(h=>h.id)),l=`text-align: left; padding: 0.5rem 0.75rem; border-bottom: 2px solid ${He}; color: ${Rt}; font-size: 0.8125rem; font-weight: 600; white-space: nowrap;`,c=`padding: 0.4rem 0.75rem; border-bottom: 1px solid ${He}; color: ${xa}; font-size: 0.875rem;`,u=(h,p)=>{const f=h[p.id];if(p.dataType==="action"){if(p.id==="select")return this.linkButton("Select",y=>{y.stopPropagation(),this.dispatchAction("action-on-row-select",{_clickedRow:h})});const g=f?.methodNameInCrud?f:{methodNameInCrud:p.id,label:p.label};return this.linkButton(g.label??"",y=>{y.stopPropagation(),this.dispatchAction("action-on-row-"+g.methodNameInCrud,{_clickedRow:h})},g.label)}if(p.dataType==="actionGroup"||p.dataType==="menu"){const g=f?.actions??[];return o`${g.map(y=>this.linkButton(y.label??"",x=>{x.stopPropagation(),this.dispatchAction("action-on-row-"+y.methodNameInCrud,{_clickedRow:h})},y.label))}`}return p.stereotype==="button"?this.linkButton(p.text??p.label??"View",g=>{g.stopPropagation(),this.dispatchAction(p.actionId??p.id,h)},p.label):this.isLinkColumn(p)?this.linkButton(""+(f??""),g=>{g.stopPropagation(),p.actionId==="view"?this.openRow(h):this.dispatchAction(p.actionId,h)},p.label):this.formatValue(p,h)};return o`
            <table style="width: 100%; border-collapse: collapse; background: ${Ua};">
                <thead>
                    <tr>
                        ${e.map(h=>o`<th style="${l}">${h.label??""}</th>`)}
                    </tr>
                </thead>
                <tbody>
                    ${t.length===0?o`<tr><td colspan="${e.length}">${this.renderEmpty()}</td></tr>`:d}
                    ${i.map(h=>Ha(h)?o`
                        <tr>
                            ${e.map(p=>o`<td style="${c} font-weight: 600; background: rgba(22, 21, 19, 0.05);">${Er(h,p,n)}</td>`)}
                        </tr>
                    `:o`
                        <tr style="${this.isSelectedRow(h)?`background: ${$i};`:""}">
                            ${e.map(p=>o`<td style="${c}">${u(h,p)}</td>`)}
                        </tr>
                    `)}
                </tbody>
                ${r?o`
                    <tfoot>
                        <tr>
                            ${e.map(h=>o`<td style="${c} font-weight: 700; border-top: 2px solid ${He}; border-bottom: none;">${r[h.id]??""}</td>`)}
                        </tr>
                    </tfoot>
                `:d}
            </table>`}render(){if(!this._connected)return o``;const e=this.effectiveGridLayout;return e==="table"&&this.groupedTableActive?this.renderGroupedTable(this.cols):e==="list"?this.renderTwoLineList(this.cols):e==="cards"?this.renderCards(this.cols):e==="masterDetail"?this.renderMasterDetail(this.cols):e==="tree"?this.renderTree(this.cols):o`
            <div class="rwt-table-host" style="width: 100%;"></div>
            <slot></slot>
        `}};W._ADP=null;Ue([m()],W.prototype,"id",2);Ue([m()],W.prototype,"metadata",2);Ue([m()],W.prototype,"baseUrl",2);Ue([m()],W.prototype,"state",2);Ue([m()],W.prototype,"data",2);Ue([m()],W.prototype,"appState",2);Ue([m()],W.prototype,"appData",2);Ue([m()],W.prototype,"emptyStateMessage",2);Ue([$()],W.prototype,"_connected",2);Ue([$()],W.prototype,"availableWidthPx",2);Ue([$()],W.prototype,"selectedItem",2);W=Ue([k("mateu-redwood-table")],W);const Yi="var(--oj-core-text-color-secondary, #666)",ao="var(--oj-core-divider-color, #e0e0e0)",Cu=`text-align: left; padding: 0.5rem 0.75rem; border-bottom: 2px solid ${ao}; color: ${Yi}; font-size: 0.8125rem; font-weight: 600; white-space: nowrap;`,or=`padding: 0.5rem 0.75rem; border-bottom: 1px solid ${ao};`,Su=e=>{const t=(e??"").toUpperCase();return t==="SUCCESS"?"successSubtle":t==="DANGER"||t==="ERROR"?"dangerSubtle":t==="WARNING"?"warningSubtle":t==="INFO"?"infoSubtle":"neutral"},Iu=(e,t,a)=>{e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:a},bubbles:!0,composed:!0}))},_u=(e,t)=>{const a=e[t.id];if(t.stereotype==="button"||t.dataType==="action"){const s=a?.label??a?.text??t.text??t.label??"View",i=a?.methodNameInCrud??t.actionId??t.id;return o`<oj-c-button
            data-oj-binding-provider="preact"
            label="${s}"
            chroming="borderless"
            @ojAction="${r=>Iu(r.target,i,e)}"
        ></oj-c-button>`}return t.dataType==="status"?a==null?o``:o`<oj-c-badge
            data-oj-binding-provider="preact"
            label="${a.message??""+a}"
            variant="${Su(a.type)}"
        ></oj-c-badge>`:t.dataType==="bool"||t.dataType==="boolean"?o`<span aria-label="${a?"yes":"no"}">${a?"✓":"✕"}</span>`:o`${a??""}`},io=e=>{const t=[];return e?.forEach(a=>{const s=a.metadata;s?.type===v.GridGroupColumn?t.push(...io(s.columns??s.content??a.children)):s&&t.push({...s,id:s.id??a.id})}),t},so=(e,t,a=!1,s)=>{const i=(r,n)=>{const l=o`
            <tr style="${s?"cursor: pointer;":""}" @click="${s?u=>s(u,r):d}">
                ${e.map((u,h)=>o`
                    <td style="${or} ${h===0&&a?`padding-left: ${.75+n*1.25}rem;`:""} ${u.align?`text-align: ${u.align};`:""}">
                        ${_u(r,u)}
                    </td>`)}
            </tr>`,c=a?r.children??[]:[];return[l,...c.flatMap(u=>i(u,n+1))]};return o`
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>${e.map(r=>o`<th style="${Cu} ${r.align?`text-align: ${r.align};`:""}" width="${r.width??d}">${r.label??""}</th>`)}</tr>
            </thead>
            <tbody>
                ${t.length===0?o`<tr><td colspan="${e.length}" style="${or} color: ${Yi}; text-align: center;">No data.</td></tr>`:t.flatMap(r=>i(r,0))}
            </tbody>
        </table>`},Eu=(e,t)=>{const a=e.metadata,s=io(a.content);let i=a.page?.content??[];return e.id&&t&&Array.isArray(t[e.id])&&(i=t[e.id]),o`
        <div style="width: 100%; overflow-x: auto; ${e.style??""}" class="${e.cssClasses??d}"
             slot="${e.slot??d}">
            ${so(s,i,a.tree)}
        </div>`},Pu=(e,t,a,s,i,r,n)=>o`
    <mateu-redwood-table
        id="${t.id}"
        .metadata="${t.metadata}"
        .data="${i}"
        .state="${s}"
        .appState="${r}"
        .appData="${n}"
        baseUrl="${a??""}"
        style="${t.style??d}"
        class="${t.cssClasses??d}"
        slot="${t.slot??d}"
    >
        ${t.children?.map(l=>w(e,l,a,s,i,r,n))}
    </mateu-redwood-table>`,Tu=(e,t,a,s,i,r,n)=>{const c=t.metadata.page?.content??[];return o`
        <div style="overflow-y: auto; ${t.style??""}" class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${c.map(u=>w(e,u,a,s,i,r,n))}
        </div>`},Ou=e=>{const t=s=>s.submenus?o`
            <div style="min-width: 12rem;">
                <div class="oj-typography-subheading-sm" style="margin-bottom: 0.5rem;">${s.label??""}</div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${s.submenus.map(i=>t(i))}
                </div>
            </div>`:o`<a class="oj-link-standalone" href="${s.path??d}">${s.label}</a>`,a=e.metadata;return o`
        <div style="display: flex; gap: 3rem; align-items: flex-start; flex-wrap: wrap; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${a.menu.map(s=>t(s))}
        </div>`},Ru=(e,t,a,s,i,r,n)=>{const l=t.metadata;return o`
        <div style="${t.style??d}" class="${t.cssClasses??d}"
             slot="${t.slot??d}" data-colspan="${l.colspan||d}">
            ${l.label?o`<div style="font-size: 0.75rem; color: ${Yi}; margin-bottom: 4px;">${l.label}</div>`:d}
            <div>${w(e,l.content,a,s,i,r,n)}</div>
        </div>`},zu=e=>{const t=e.state?.items??e.metadata?.items??[];return o`
        <div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 0.5rem; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${t.map(a=>o`
                <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                    <oj-c-avatar data-oj-binding-provider="preact" size="xs"
                                 initials="${(a.userName??"?").split(/\s+/).map(s=>s[0]).slice(0,2).join("")}"></oj-c-avatar>
                    <div>
                        ${a.userName?o`<div style="font-size: 0.75rem; color: ${Yi};">${a.userName}</div>`:d}
                        <div>${a.text}</div>
                    </div>
                </div>
            `)}
        </div>`},Au=e=>{const t=a=>{const i=a.target.closest(".rw-message-input")?.querySelector("oj-c-input-text"),r=i?.rawValue??i?.value??"";r&&(a.target.dispatchEvent(new CustomEvent("submit",{detail:{value:r},bubbles:!0,composed:!0})),i&&(i.value=""))};return o`
        <div class="rw-message-input ${e.cssClasses??""}"
             style="display: flex; gap: 0.5rem; align-items: center; ${e.style??""}"
             slot="${e.slot??d}">
            <oj-c-input-text data-oj-binding-provider="preact" label-edge="none" placeholder="Message" style="flex: 1;"
                             @keydown="${a=>{a.key==="Enter"&&t(a)}}"></oj-c-input-text>
            <oj-c-button data-oj-binding-provider="preact" label="Send" chroming="callToAction" @ojAction="${t}"></oj-c-button>
        </div>`},wa="var(--oj-core-text-color-secondary, #666)",Ls="var(--oj-core-divider-color, #e0e0e0)",Ds="var(--oj-core-bg-color-content, #fff)",ro="var(--oj-core-border-radius-md, 6px)",La=e=>"oj-ux-ico-"+(e??"").replace(/^vaadin:/,"").replace(/^lumo:/,""),ju=e=>{const t=e.metadata;return o`<span class="${La(t?.icon)} ${e.cssClasses??""}"
                      style="font-size: 1.25rem; ${e.style??""}"
                      slot="${e.slot??d}"
                      aria-label="${t?.icon??d}"></span>`},Lu=e=>{const t=e.metadata,a=t?.breadcrumbs??[];return o`
        <nav aria-label="Breadcrumb"
             style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${a.map((s,i)=>o`
                ${i>0?o`<span style="color: ${wa};">/</span>`:d}
                ${s.link?o`<a class="oj-link-standalone" href="${s.link}">${s.text}</a>`:o`<span>${s.text}</span>`}
            `)}
            ${t?.currentItemText?o`
                ${a.length>0?o`<span style="color: ${wa};">/</span>`:d}
                <span style="color: ${wa};">${t.currentItemText}</span>
            `:d}
        </nav>`},Du=e=>{const t=e.metadata;return o`
        <div role="status"
             style="display: flex; gap: 0.5rem; align-items: baseline; padding: 0.75rem 1rem; border: 1px solid ${Ls}; border-left: 4px solid var(--oj-core-info-color, #0572ce); border-radius: ${ro}; background: ${Ds}; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${t?.title?o`<span class="oj-typography-body-md oj-typography-bold">${t.title}</span>`:d}
            <span class="oj-typography-body-md">${t?.text??""}</span>
        </div>`},Nu=(e,t={})=>{const a=e.metadata,s=a.valueKey?t[a.valueKey]:a.value;return o`
        <div style="${e.style??""}" class="${e.cssClasses??d}" slot="${e.slot??d}">
            <oj-c-progress-bar
                data-oj-binding-provider="preact"
                value="${a.indeterminate?-1:s??0}"
                max="${a.max&&a.max!=0?a.max:100}"
                style="width: 100%;"
            ></oj-c-progress-bar>
            ${a.text?o`<div style="font-size: 0.75rem; color: ${wa}; margin-top: 2px;">${a.text}</div>`:d}
        </div>`},Fu=(e,t,a,s,i,r,n)=>{const l=t.metadata;return o`
        <oj-c-collapsible data-oj-binding-provider="preact"
                 ?expanded="${l.opened}"
                 class="${t.cssClasses??d}"
                 style="${t.style??d}"
                 slot="${t.slot??d}">
            <div slot="header" class="oj-typography-subheading-sm">
                ${w(e,l.summary,a,s,i,r,n)}
            </div>
            <div style="padding-top: 0.5rem;">
                ${w(e,l.content,a,s,i,r,n)}
                ${t.children?.map(c=>w(e,c,a,s,i,r,n))}
            </div>
        </oj-c-collapsible>`},oo=e=>e.abbreviation||(e.name?e.name.split(/\s+/).map(t=>t[0]).slice(0,2).join(""):""),Mu=(e,t,a)=>{const s=e.metadata;return o`<oj-c-avatar
            data-oj-binding-provider="preact"
            initials="${oo(s)||d}"
            src="${s.image??d}"
            role="img"
            aria-label="${de(s.name,t,a)??d}"
            title="${de(s.name,t,a)??d}"
            style="${e.style??d}" class="${e.cssClasses??d}"
            slot="${e.slot??d}"
    ></oj-c-avatar>`},qu=e=>{const t=e.metadata,a=t.avatars??[],s=t.maxItemsVisible||a.length,i=a.slice(0,s),r=a.length-i.length;return o`
        <div style="display: flex; align-items: center; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${i.map((n,l)=>o`
                <oj-c-avatar
                    data-oj-binding-provider="preact"
                    size="sm"
                    initials="${oo(n)||d}"
                    src="${n.image??d}"
                    title="${n.name??d}"
                    style="${l>0?"margin-left: -0.5rem;":""} border: 2px solid ${Ds}; border-radius: 50%;"
                ></oj-c-avatar>
            `)}
            ${r>0?o`<span style="margin-left: 0.4rem; font-size: 0.8125rem; color: ${wa};">+${r}</span>`:d}
        </div>`},Uu=(e,t,a,s,i,r,n)=>{const l=t.metadata;return o`
        <span title="${l.text??""}" style="${t.style??d}"
              class="${t.cssClasses??d}" slot="${t.slot??d}">
            ${l.wrapped?w(e,l.wrapped,a,s,i,r,n):d}
        </span>`},ys=e=>{const a=e?.closest(".rw-pop-wrap")?.querySelector(":scope > .rw-pop-panel");a&&(a.hidden=!a.hidden)},no=`position: absolute; top: 100%; left: 0; margin-top: 4px; z-index: 1000; background: ${Ds}; border: 1px solid ${Ls}; border-radius: ${ro}; box-shadow: 0 4px 12px rgba(0,0,0,.15); min-width: 10rem;`,Bu=(e,t,a,s,i,r,n)=>{const l=t.metadata;return o`
        <span class="rw-pop-wrap ${t.cssClasses??""}"
              style="position: relative; display: inline-block; ${t.style??""}"
              slot="${t.slot??d}">
            <span style="cursor: pointer;" @click="${c=>ys(c.currentTarget)}">
                ${l.wrapped?w(e,l.wrapped,a,s,i,r,n):d}
            </span>
            <div class="rw-pop-panel" hidden style="${no} padding: 0.75rem;">
                ${l.content?w(e,l.content,a,s,i,r,n):d}
            </div>
        </span>`},xs=(e,t)=>{t&&e?.dispatchEvent(new CustomEvent("update-route",{detail:{route:t},bubbles:!0,composed:!0}))},Vu=(e,t)=>{const s=t.metadata.options??[],i=r=>{if(r.submenus&&r.submenus.length>0){const n=r.submenus.map(l=>({key:l.path??l.label,label:l.label,disabled:l.disabled??!1}));return o`
                <oj-c-menu-button
                    data-oj-binding-provider="preact"
                    label="${r.label}"
                    chroming="borderless"
                    .items="${n}"
                    @ojMenuAction="${l=>xs(e,l.detail.key)}"
                ></oj-c-menu-button>`}return o`
            <oj-c-button
                data-oj-binding-provider="preact"
                label="${r.label}"
                chroming="borderless"
                ?disabled="${r.disabled}"
                @ojAction="${n=>xs(n.target,r.path)}"
            ></oj-c-button>`};return o`
        <div style="display: flex; flex-direction: row; gap: 0.25rem; align-items: center; ${t.style??""}"
             class="${t.cssClasses??d}" slot="${t.slot??d}">
            ${s.map(i)}
        </div>`},Wu=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=p=>{p.preventDefault(),ys(p.currentTarget)},u=(p,f)=>{ys(p.currentTarget),xs(p.target,f.path)},h=(p,f=0)=>o`
        ${p.map(g=>g.separator?o`<div style="border-top: 1px solid ${Ls}; margin: 0.25rem 0;"></div>`:o`
                <div role="menuitem"
                     style="padding: 0.4rem 1rem 0.4rem ${1+f*1.25}rem; cursor: ${g.disabled?"default":"pointer"}; ${g.disabled?`color: ${wa}; opacity: 0.6;`:""} white-space: nowrap;"
                     @click="${g.disabled?d:y=>u(y,g)}">
                    ${g.icon?o`<span class="${La(g.icon)}" style="margin-right: 0.4rem;"></span>`:d}
                    ${g.label}
                </div>
                ${g.submenus?h(g.submenus,f+1):d}`)}
    `;return o`
        <span class="rw-pop-wrap ${t.cssClasses??""}"
              style="position: relative; display: inline-block; ${t.style??""}"
              slot="${t.slot??d}"
              @contextmenu="${l.activateOnLeftClick?d:c}"
              @click="${l.activateOnLeftClick?c:d}">
            ${w(e,l.wrapped,a,s,i,r,n)}
            <div class="rw-pop-panel" hidden role="menu" style="${no} padding: 0.25rem 0;">
                ${h(l.menu??[])}
            </div>
        </span>`},ba="var(--oj-core-text-color-secondary, #666)",Za="var(--oj-core-divider-color, #e0e0e0)",yt=`display:block;font-size:0.75rem;color:${ba};margin-bottom:4px;`,lo=e=>{const t=window.require;if(!t)return null;try{const a=t("ojs/ojarraydataprovider");return new a(e,{keyAttributes:"value"})}catch{return null}},B=(e,t,a)=>{e.target?.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:t},bubbles:!0,composed:!0}))},li=(e,t,a)=>{e?.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:t},bubbles:!0,composed:!0}))},ws=(e,t,a)=>{e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:a},bubbles:!0,composed:!0}))},V=(e,t,a="")=>o`
    <div style="${a}">
        ${e?o`<div style="${yt}">${e}</div>`:d}
        ${t}
    </div>`,co=(e,t)=>{const a=typeof e=="number"?e:parseFloat(""+e);return isNaN(a)?""+e:t&&t.locale&&t.currency?new Intl.NumberFormat(t.locale,{style:"currency",currency:t.currency}).format(a):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(a)},nr=new WeakMap,uo=(e,t,a,s,i)=>{const r=i?.[a]??i?.[s],n=r?.content??(Array.isArray(r)?r:void 0);if(n)return n;const l=t.remoteCoordinates?.action;if(l){let c=nr.get(e);c||(c=new Set,nr.set(e,c)),c.has(s)||(c.add(s),setTimeout(()=>ws(e,l,{searchText:"",fieldId:s,size:200,page:0,sort:void 0})))}return[]},$t=(e,t,a,s,i)=>t.remoteCoordinates?uo(e,t,a,s,i):t.options??[],cs=(e,t,a,s,i)=>{const r=lo(i.map(n=>({value:n.value,label:n.label??""})));return o`<oj-c-select-single
        data-oj-binding-provider="preact"
        id="${t}"
        label-hint="${a}"
        label-edge="top"
        .value="${s??null}"
        item-text="label"
        .data="${r}"
        ?required="${e.required}"
        ?disabled="${e.disabled}"
        @valueChanged="${n=>B(n,t,n.detail.value)}"
    ></oj-c-select-single>`},Hu=(e,t,a,s,i)=>{const r=lo(i.map(n=>({value:n.value,label:n.label??""})));return o`<oj-c-select-multiple
        data-oj-binding-provider="preact"
        id="${t}"
        label-hint="${a}"
        label-edge="top"
        .value="${s??[]}"
        item-text="label"
        .data="${r}"
        ?required="${e.required}"
        ?disabled="${e.disabled}"
        @valueChanged="${n=>B(n,t,n.detail.value)}"
    ></oj-c-select-multiple>`},lr=(e,t,a,s)=>{const i=n=>s?Array.isArray(t)&&t.includes(n.value):t===n.value,r=n=>{if(!s)return n.value;const l=Array.isArray(t)?t:[];return l.includes(n.value)?l.filter(c=>c!==n.value):[...l,n.value]};return o`
        <div role="listbox" aria-multiselectable="${s}"
             style="border: 1px solid ${Za}; border-radius: var(--oj-core-border-radius-md, 6px); max-height: 14rem; overflow-y: auto;">
            ${a.map(n=>{const l=i(n);return o`
                    <div role="option" aria-selected="${l}" tabindex="0"
                         style="padding: 0.4rem 0.75rem; cursor: ${e.disabled?"default":"pointer"}; display: flex; align-items: center; gap: 0.5rem; ${l?"background: var(--oj-core-bg-color-selected, #e5f0fa); font-weight: 600;":""}"
                         @click="${e.disabled?d:c=>li(c.target,e.fieldId,r(n))}">
                        ${n.icon?o`<span class="${La(n.icon)}"></span>`:d}
                        <span style="pointer-events: none;">
                            <span>${n.label}</span>
                            ${n.description?o`<span style="display: block; font-size: 0.8125rem; color: ${ba};">${n.description}</span>`:d}
                        </span>
                    </div>`})}
        </div>`},us=(e,t,a,s)=>o`
    <div style="display: flex; gap: 0.75rem; padding: 0.25rem 0; flex-wrap: wrap;">
        ${a.map(i=>{const r=s?Array.isArray(t)&&t.includes(i.value):t==i.value,n=()=>{if(!s)return i.value;const l=Array.isArray(t)?t:[];return l.includes(i.value)?l.filter(c=>c!==i.value):[...l,i.value]};return o`
                <div role="button" tabindex="0"
                     style="min-width: 10rem; min-height: 3rem; padding: 0.75rem 1rem; cursor: pointer; border-radius: var(--oj-core-border-radius-lg, 8px); border: 1px solid ${r?"var(--oj-core-info-color, #0572ce)":Za}; background: ${r?"var(--oj-core-bg-color-selected, #e5f0fa)":"transparent"};"
                     @click="${l=>li(l.target,e.fieldId,n())}">
                    <div style="display: flex; align-items: center; gap: 0.5rem; pointer-events: none;">
                        ${i.icon?o`<span class="${La(i.icon)}"></span>`:d}
                        ${i.image?o`<img src="${i.image}" alt="${i.label}" style="${i.imageStyle??"width: 2rem;"}" />`:d}
                        <div>
                            <div>${i.label}</div>
                            ${i.description?o`
                                <div style="font-size: 0.8125rem; color: ${ba};">${i.description}</div>
                            `:d}
                        </div>
                    </div>
                </div>`})}
    </div>`,Gu=(e,t,a)=>{let s=typeof e=="number"?e:parseInt(""+e,10);return isNaN(s)&&(s=0),o`<oj-c-rating-gauge
        data-oj-binding-provider="preact"
        .value="${s}"
        max="5"
        step="1"
        size="md"
        ?readonly="${a}"
        @valueChanged="${i=>li(i.target,t,i.detail.value)}"
    ></oj-c-rating-gauge>`},Ku=e=>t=>{const a=t.target,s=a.files?.[0];if(!s)return;const i=new FileReader;i.onload=()=>li(a,e,i.result),i.readAsDataURL(s),a.value=""},Yu=e=>t=>{t.target.getRootNode().querySelector(`#${CSS.escape(e)}`)?.click()},Ju=(e,t,a)=>{const s=a!=null&&a!=="",i=`${t}_file`;return o`
        <div style="display: flex; flex-direction: column; align-items: stretch; gap: 0.5rem; max-width: 320px;">
            ${s?o`
                <img src="${a}"
                     style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid ${Za}; border-radius: var(--oj-core-border-radius-lg, 8px); ${e.style??""}">
            `:o`
                <div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed ${Za}; border-radius: var(--oj-core-border-radius-lg, 8px); color: ${ba};">
                    <span class="oj-ux-ico-image" style="font-size: 2rem;"></span>
                </div>
            `}
            <input type="file" id="${i}" accept="image/*" style="display: none;" @change="${Ku(e.fieldId)}">
            <div style="display: flex; gap: 0.5rem;">
                <oj-c-button data-oj-binding-provider="preact" label="${s?"Replace":"Upload"}" chroming="outlined"
                             @ojAction="${Yu(i)}"></oj-c-button>
                ${s?o`
                    <oj-c-button data-oj-binding-provider="preact" label="Delete" chroming="borderless"
                                 @ojAction="${r=>li(r.target,e.fieldId,"")}"></oj-c-button>`:d}
            </div>
        </div>`},Xu=(e,t,a)=>{const s=t===!0||t==="true";return o`
        <div style="${e.style??d}">
            <oj-c-badge data-oj-binding-provider="preact"
                        variant="${s?"success":"neutral"}"
                        style="${s?"":"opacity: 0.4;"}">${a}</oj-c-badge>
        </div>`},Qu=(e,t,a,s,i)=>{let r=de(t,s,i);const n=r&&typeof r=="object"&&"value"in r?r:null;r&&r.value&&(r=r.value);const l=e.dataType=="bool"||r===!0||r===!1,c=e.dataType=="money",u=r!=null&&r!=="";let h=u?""+r:"—";c&&u&&(h=co(r,n));const p=l?o`<span>${r===!0||r==="true"?"✓":"—"}</span>`:e.multiline?o`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${h}</span>`:o`<span style="display: block; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${c?" font-variant-numeric: tabular-nums;":""}">${h}</span>`;return V(a,p,c?"text-align: right; ":"")},Zu=(e,t,a,s,i)=>{let r=de(t,s,i);const n=r&&typeof r=="object"&&"value"in r?r:null;r&&r.value&&(r=r.value);const l=e.dataType=="bool"||r===!0||r===!1,c=e.dataType=="money",u=r!=null&&r!=="";let h=u?""+r:"—";c&&u&&(h=co(r,n));const p=l?o`<span style="margin-left: auto;">${r===!0||r==="true"?"✓":"—"}</span>`:o`<span style="font-weight: 500; text-align: right; word-break: break-word; margin-left: auto;${c?" font-variant-numeric: tabular-nums;":""}">${h}</span>`,f=a!=null&&a!==""&&a!=="null"?""+a:"";return o`<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; width: 100%; padding: 0.4rem 0; border-bottom: 1px solid rgba(0,0,0,.08); ${e.style??""}"
    >${f?o`<span style="color: ${ba}; white-space: nowrap;">${f}</span>`:d}${p}</div>`},ep=(e,t,a,s,i)=>{const r=de(t,s,i),n=Array.isArray(r)?r.map(l=>""+l):r!=null&&r!==""?[""+r]:[];return V(a,o`<mateu-bulleted-list .items="${n}" style="${e.style??d}"></mateu-bulleted-list>`)},tp=(e,t,a,s,i)=>{let r=de(t,s,i)||i?.[e.fieldId];if(r&&r.value&&(r=r.value),e.stereotype=="image"||e.stereotype=="uploadableImage"||e.stereotype=="signature"||e.stereotype=="camera")return V(a,o`<img src="${r}" style="${e.style??d}">`);if(e.stereotype=="fileUpload")return V(a,o`<mateu-file-upload .fieldId="${e.fieldId}" .value="${r}" .editable="${!1}"></mateu-file-upload>`);if(e.dataType=="bool")return V(a,o`<span>${r?"✓":"—"}</span>`);if(e.stereotype=="link")return V(a,o`<a class="oj-link-standalone" href="${r??""}" target="_blank">${r??""}</a>`);if(e.stereotype=="color")return V(a,o`<span style="background-color: ${r}; display: block; height: 20px; width: 40px; border: 1px solid ${ba}; border-radius: 4px;"></span>`);const n=r!=null&&r!=="";return V(a,o`<span style="display: block; font-weight: 500; overflow: hidden; text-overflow: ellipsis;">${n?r:"—"}</span>`)},ap=J`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,ip=J`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,po=(e,t,a)=>{const s=e.link,i=Oe(s.href,t,a)??s.href,r=Oe(s.title,t,a)||i;return{href:i,title:r}},sp=e=>{const t=e;if(!t||t.__navlinkPositioned)return;t.__navlinkPositioned=!0;const a=()=>{const r=t.parentElement,n=r?.firstElementChild?.querySelector("input, textarea, select");if(!r||!n)return;const l=n.getBoundingClientRect();l.height!==0&&(t.style.marginTop=`${Math.max(0,Math.round(l.top+l.height/2-t.offsetHeight/2-r.getBoundingClientRect().top))}px`)};let s=0;const i=()=>{a(),s++<32&&setTimeout(i,250)};setTimeout(i),document.fonts?.ready.then(()=>setTimeout(a))},rp=(e,t,a)=>{const s=e.link,{href:i,title:r}=po(e,t,a),n=s.icon?o`<span class="${La(s.icon)}" style="font-size: 1.125rem;"></span>`:i.startsWith("http")?ap:ip;return o`<a data-navlink
        href="${i}"
        title="${r}"
        target="${s.target||d}"
        ${Do(sp)}
        style="display: flex; align-items: center; color: ${ba}; align-self: flex-start; margin-top: 1.9rem;"
    >${n}</a>`},op=(e,t,a)=>s=>{const i=s.composedPath()[0]?.value;if(i==null)return;const n=s.currentTarget.querySelector("a[data-navlink]");if(!n)return;const{href:l,title:c}=po(e,{...t,[e.fieldId]:i},a);n.setAttribute("href",l),n.setAttribute("title",c)},np=(e,t,a,s,i)=>{const r=t.metadata,n=lp(e,t,a,s,i);return r?.link?.href?o`<div style="display: flex; gap: 0.5rem;" @input="${op(r,s,i)}">
        <div style="flex: 1; min-width: 0;">${n}</div>
        ${rp(r,s,i)}
    </div>`:n},lp=(e,t,a,s,i)=>{const r=t.metadata,n=r?.fieldId??"",l=s&&n in s?s[n]:r?.initialValue,c=r.label??"",u=t.id??n,h=r.stereotype;if(r.propertyRow)return Zu(r,l,c,s,i);if(h==="badge")return Xu(t,l,c||n);if(h==="plainText")return Qu(r,l,c,s,i);if(h==="bulletedList")return ep(r,l,c,s,i);if(r.readOnly&&h!="grid"&&r.dataType!="status"&&r.dataType!="money")return tp(r,l,c,s,i);if(h==="grid"&&r.columns&&r.columns.length>0){const p=Array.isArray(l)?l:[],f=r.columns.map(x=>({...x.metadata,id:x.metadata.id??x.id})),g=r.onItemSelectionActionId;return V(c,o`<div style="overflow-x: auto;">${so(f,p,!1,g?(x,P)=>x.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:g,parameters:{_clickedRow:P}},bubbles:!0,composed:!0})):void 0)}</div>`)}if(r.dataType==="string"){if(h==="searchable"){const p=g=>ws(g.target,"code-"+n,{code:g.detail?.value??g.target?.value??""}),f=g=>ws(g.target,"codesearch-"+n,{});return V(c,o`
                <div style="display: flex; gap: 0.33rem; align-items: center;">
                    <oj-c-input-text data-oj-binding-provider="preact" label-edge="none" style="width: 6rem;"
                                     .value="${l??""}" @valueChanged="${p}"></oj-c-input-text>
                    <oj-c-input-text data-oj-binding-provider="preact" label-edge="none" readonly style="flex: 1;"
                                     .value="${i?.[n+"-label"]??""}"></oj-c-input-text>
                    <oj-c-button data-oj-binding-provider="preact" label="Search" chroming="outlined" @ojAction="${f}"></oj-c-button>
                </div>`)}if(h==="textarea")return o`<oj-c-text-area
                data-oj-binding-provider="preact"
                id="${u}"
                label-hint="${c}"
                label-edge="top"
                .value="${l??""}"
                ?required="${r.required}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                @valueChanged="${p=>B(p,u,p.detail.value)}"
            ></oj-c-text-area>`;if(h==="richText"||h==="richtext")return o`<oj-c-text-area
                data-oj-binding-provider="preact"
                id="${u}"
                label-hint="${c}"
                label-edge="top"
                rows="6"
                .value="${l??""}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                @valueChanged="${p=>B(p,u,p.detail.value)}"
            ></oj-c-text-area>`;if(h==="markdown")return V(c,o`<mateu-markdown .content="${l??""}"></mateu-markdown>`);if(h==="password")return o`<oj-c-input-password
                data-oj-binding-provider="preact"
                id="${u}"
                label-hint="${c}"
                label-edge="top"
                .value="${l??""}"
                ?required="${r.required}"
                ?disabled="${r.disabled}"
                @valueChanged="${p=>B(p,u,p.detail.value)}"
            ></oj-c-input-password>`;if(h==="select"||h==="combobox"){const p=l&&l.value?l.value:l;return cs(r,u,c,p,$t(e,r,u,n,i))}if(h==="listBox")return V(c,lr(r,l,$t(e,r,u,n,i),!1));if(h==="choice")return V(c,us(r,l,$t(e,r,u,n,i),!1));if(h==="popover"){const p=$t(e,r,u,n,i),f=p.find(y=>y.value===l)?.label??l??"";return V(c,o`
                <span class="rw-pop-wrap" style="position: relative; display: inline-block;">
                    <span style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;" @click="${y=>{const P=y.currentTarget.closest(".rw-pop-wrap")?.querySelector(":scope > .rw-pop-panel");P&&(P.hidden=!P.hidden)}}">
                        <span>${f}</span>
                        <span class="oj-ux-ico-chevron-down"></span>
                    </span>
                    <div class="rw-pop-panel" hidden
                         style="position: absolute; top: 100%; left: 0; margin-top: 4px; z-index: 1000; background: var(--oj-core-bg-color-content, #fff); border: 1px solid ${Za}; border-radius: var(--oj-core-border-radius-md, 6px); box-shadow: 0 4px 12px rgba(0,0,0,.15); padding: 0.5rem;">
                        ${us(r,l,p,!1)}
                    </div>
                </span>`)}if(h==="radio"){const p=$t(e,r,u,n,i).map(f=>({value:f.value,label:f.label??""}));return o`<oj-c-radioset
                data-oj-binding-provider="preact"
                id="${u}"
                label-hint="${c}"
                label-edge="top"
                .value="${l??null}"
                .options="${p}"
                ?required="${r.required}"
                ?disabled="${r.disabled}"
                @valueChanged="${f=>B(f,u,f.detail.value)}"
            ></oj-c-radioset>`}return h==="html"?o`<div id="${u}">${ge(""+(l??""))}</div>`:h==="image"?o`<figure style="margin: 0;">
                <figcaption style="${yt}">${c}</figcaption>
                <img src="${l}" alt="${c}" style="${r.style??""}" />
            </figure>`:h==="uploadableImage"?V(c,Ju(r,u,l)):h==="treeSelect"?V(c,o`<mateu-tree-select
                .fieldId="${u}" .value="${l}"
                .options="${r.options??[]}"
                .leavesOnly="${r.treeLeavesOnly??!1}"></mateu-tree-select>`):h==="signature"?V(c,o`<mateu-signature-pad .fieldId="${u}" .value="${l}"></mateu-signature-pad>`):h==="camera"?V(c,o`<mateu-camera-capture .fieldId="${u}" .value="${l}"></mateu-camera-capture>`):h==="fileUpload"?V(c,o`<mateu-file-upload
                .fieldId="${u}" .value="${l}"
                .accept="${eo(r.attributes,"accept")}"></mateu-file-upload>`):h==="icon"?V(c,o`
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <oj-c-input-text data-oj-binding-provider="preact" label-edge="none" style="flex: 1;"
                                     .value="${l??""}"
                                     ?disabled="${r.disabled}"
                                     @valueChanged="${p=>B(p,u,p.detail.value)}"
                    ></oj-c-input-text>
                    ${l?o`<span class="${La(l)}" style="font-size: 1.25rem;"></span>`:d}
                </div>`):h==="color"?o`<div>
                <label for="${u}" style="${yt}">${c}</label>
                <input id="${u}" type="color" .value="${l??"#000000"}" ?disabled="${r.disabled}"
                    @input="${p=>B(p,u,p.target.value)}" />
            </div>`:h==="link"?o`<div>
                <div style="${yt}">${c}</div>
                <a class="oj-link-standalone" href="${l}" target="_blank">${l}</a>
            </div>`:r.options&&r.options.length>0?cs(r,u,c,l,r.options):r.remoteCoordinates?cs(r,u,c,l,uo(e,r,u,n,i)):o`<oj-c-input-text
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${l??""}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            ?readonly="${r.readOnly}"
            placeholder="${r.placeholder??d}"
            @valueChanged="${p=>B(p,u,p.detail.value)}"
        ></oj-c-input-text>`}if(r.dataType==="number")return o`<oj-c-input-number
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${l??null}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${p=>B(p,u,p.detail.value)}"
        ></oj-c-input-number>`;if(r.dataType==="integer")return h==="stars"?V(c,Gu(l,n,r.disabled)):h==="slider"?o`<div>
                <label for="${u}" style="${yt}">${c}</label>
                <input id="${u}" type="range"
                    min="${r.sliderMin??0}"
                    max="${r.sliderMax??10}"
                    .value="${""+(l??0)}"
                    @input="${p=>B(p,u,parseInt(p.target.value))}" />
            </div>`:o`<oj-c-input-number
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${l??null}"
            step="1"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${p=>B(p,u,p.detail.value)}"
        ></oj-c-input-number>`;if(r.dataType==="bool")return h==="toggle"?o`<div>
                <div style="${yt}">${c}</div>
                <oj-c-toggle-button
                    data-oj-binding-provider="preact"
                    id="${u}"
                    label="${c}"
                    .value="${!!l}"
                    ?disabled="${r.disabled}"
                    @valueChanged="${p=>B(p,u,p.detail.value)}"
                ></oj-c-toggle-button>
            </div>`:o`<oj-c-checkbox
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            .value="${!!l}"
            ?disabled="${r.disabled}"
            @valueChanged="${p=>B(p,u,p.detail.value)}"
        >${c}</oj-c-checkbox>`;if(r.dataType==="date")return o`<oj-c-input-date-picker
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${l??null}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${p=>B(p,u,p.detail.value)}"
        ></oj-c-input-date-picker>`;if(r.dataType==="dateTime"){const p=l,f=p?p.split("T")[0]:null,g=p?p.split("T")[1]?.substring(0,5):null;return o`<div style="display:flex;gap:0.5rem;align-items:flex-end;">
            <oj-c-input-date-picker
                data-oj-binding-provider="preact"
                id="${u}_date"
                label-hint="${c}"
                label-edge="top"
                .value="${f}"
                ?required="${r.required}"
                ?disabled="${r.disabled}"
                @valueChanged="${y=>B(y,u,y.detail.value+"T"+(g??"00:00"))}"
            ></oj-c-input-date-picker>
            <oj-c-input-time-mask
                data-oj-binding-provider="preact"
                id="${u}_time"
                label-hint="Time"
                label-edge="top"
                .value="${g}"
                ?disabled="${r.disabled}"
                @valueChanged="${y=>B(y,u,(f??"")+"T"+y.detail.value)}"
            ></oj-c-input-time-mask>
        </div>`}if(r.dataType==="time")return o`<oj-c-input-time-mask
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${l??null}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${p=>B(p,u,p.detail.value)}"
        ></oj-c-input-time-mask>`;if(r.dataType==="dateRange"){const p=l;return o`<div style="display:flex;gap:0.5rem;align-items:flex-end;">
            <oj-c-input-date-picker
                data-oj-binding-provider="preact"
                id="${u}_from"
                label-hint="${c} From"
                label-edge="top"
                .value="${p?.from??null}"
                @valueChanged="${f=>B(f,u,{...p,from:f.detail.value})}"
            ></oj-c-input-date-picker>
            <oj-c-input-date-picker
                data-oj-binding-provider="preact"
                id="${u}_to"
                label-hint="${c} To"
                label-edge="top"
                .value="${p?.to??null}"
                @valueChanged="${f=>B(f,u,{...p,to:f.detail.value})}"
            ></oj-c-input-date-picker>
        </div>`}if(r.dataType==="array"){if(h==="choice")return V(c,us(r,l,$t(e,r,u,n,i),!0));if(h==="listBox")return V(c,lr(r,l,$t(e,r,u,n,i),!0));if(h==="combobox"||h==="select")return Hu(r,u,c,l,$t(e,r,u,n,i));const p=$t(e,r,u,n,i).map(f=>({value:f.value,label:f.label??""}));return o`<oj-c-checkboxset
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${l??[]}"
            .options="${p}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${f=>B(f,u,f.detail.value)}"
        ></oj-c-checkboxset>`}if(r.dataType==="status"){const p=l,g={danger:"error",success:"success",warning:"warning",info:"info"}[(p?.type??"").toLowerCase()]??"info";return o`<div id="${u}">
            <div style="${yt}">${c}</div>
            ${p?o`<oj-c-badge
                data-oj-binding-provider="preact"
                .value="${p.message}"
                severity="${g}"
            ></oj-c-badge>`:o``}
        </div>`}if(r.dataType==="money"){if(r.readOnly){const p=l;let f="";return p?.locale&&p?.currency?f=new Intl.NumberFormat(p.locale,{style:"currency",currency:p.currency}).format(p.value):p!=null&&(f=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(p)),o`<div id="${u}">
                <div style="${yt}">${c}</div>
                <div style="text-align:right;font-weight:bold;font-variant-numeric:tabular-nums;">${f}</div>
            </div>`}return o`<oj-c-input-number
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${l??null}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${p=>B(p,u,p.detail.value)}"
        ></oj-c-input-number>`}if(r.dataType==="file")return o`<oj-c-file-picker
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            ?disabled="${r.disabled}"
            @ojSelect="${p=>{const f=p.detail.files?.[0];B(p,u,f?{name:f.name,size:f.size}:null)}}"
        ></oj-c-file-picker>`;if(r.dataType==="range"){const p=l;return o`<div>
            <div style="${yt}">${c}</div>
            <div style="display:flex;gap:1rem;align-items:center;">
                <input type="range"
                    min="${r.sliderMin??0}" max="${r.sliderMax??10}"
                    .value="${""+(p?.from??0)}"
                    @input="${f=>B(f,u,{...p,from:parseInt(f.target.value)})}" />
                <input type="range"
                    min="${r.sliderMin??0}" max="${r.sliderMax??10}"
                    .value="${""+(p?.to??0)}"
                    @input="${f=>B(f,u,{...p,to:parseInt(f.target.value)})}" />
            </div>
        </div>`}return o`<p>Unknown field type: ${r.dataType} / ${r.stereotype}</p>`};var dp=Object.defineProperty,cp=Object.getOwnPropertyDescriptor,ga=(e,t,a,s)=>{for(var i=s>1?void 0:s?cp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&dp(t,a,i),i};let Je=class extends S{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.searchText=""}connectedCallback(){super.connectedCallback(),Jr()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(Gi()[this.selector.fieldName]??"")}currentLabel(){const e=this.currentValue();if(!e)return"—";const t=(this.searchedOptions??this.selector.options)?.find(s=>String(s.value)===e);if(t)return t.label;const a=As()[this.selector.fieldName];return a!==void 0?String(a):e}pick(e,t){Yr(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText="",this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector("input.picker-search")?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){const e=this.app;if(e?.serverSideType)try{const t=await va.runAction(this.baseUrl??"",e.rootRoute??e.initialRoute??"","",`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(const a of t?.fragments??[]){const r=a.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(r)){this.searchedOptions=r.map(n=>({value:n.value,label:n.label??String(n.value)}));return}}}catch{}}visibleOptions(){const e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(a=>a.label.toLowerCase().includes(t)):e}renderPanel(){const e=this.currentValue(),t=this.visibleOptions(),a=this.searchText!==""||t.length>Je.SEARCHABLE_THRESHOLD;return o`
            <div class="panel">
                ${a?o`
                    <input class="picker-search" type="text" placeholder="Search"
                           .value="${this.searchText}"
                           @input="${this.onSearchInput}"
                           @keydown="${s=>{s.key==="Escape"&&this.closePanel()}}"/>`:d}
                <div class="options">
                    ${e?o`
                        <div class="option option--clear" @click="${()=>this.pick("")}">— (clear)</div>`:d}
                    ${t.map(s=>o`
                        <div class="option ${e===String(s.value)?"option--selected":""}"
                             @click="${()=>this.pick(s.value,s.label)}">${s.label}</div>`)}
                </div>
            </div>`}render(){return this.selector?o`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                <button class="picker-button"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    ${this.currentLabel()} <span aria-hidden="true" class="caret">▾</span>
                </button>
                ${this.opened?this.renderPanel():d}
            </label>`:o``}};Je.SEARCHABLE_THRESHOLD=7;Je.styles=C`
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
    `;ga([m()],Je.prototype,"selector",2);ga([m()],Je.prototype,"app",2);ga([m()],Je.prototype,"baseUrl",2);ga([$()],Je.prototype,"opened",2);ga([$()],Je.prototype,"searchText",2);ga([$()],Je.prototype,"searchedOptions",2);Je=ga([k("mateu-app-context-picker")],Je);var ei=(e=>(e.Add="Add",e.Replace="Replace",e.ReplaceKeepData="ReplaceKeepData",e))(ei||{}),up=Object.defineProperty,ho=(e,t,a,s)=>{for(var i=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=n(t,a,i)||i);return i&&up(t,a,i),i};class Ji extends S{constructor(){super(...arguments),this.id="",this.baseUrl="",this.callbackToken="",this.createElement=t=>{const a=t.data,s=document.createElement(a.name);for(let i in a.attributes)s.setAttribute(i,a.attributes[i]);for(let i in a.on)s.addEventListener(i,r=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.on[i],parameters:{event:r}},bubbles:!0,composed:!0}))});return s},this.closeModal=()=>{const t=this.shadowRoot?.querySelectorAll("mateu-dialog, mateu-drawer");if(t&&t.length>0){t[t.length-1].close();return}this.dispatchEvent(new CustomEvent("close-modal-requested",{bubbles:!0,composed:!0}))},this.changeFavicon=t=>{let a=document.querySelector('link[rel="icon"]');a!==null?a.setAttribute("href",t):(a=document.createElement("link"),a.setAttribute("rel","icon"),a.setAttribute("href",t),document.head.appendChild(a))}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=Lt.subscribe(t=>{if(t.command){const a=t.command;this.id==a.targetComponentId&&this.applyCommand(a)}if((!t.callbackToken||!this.callbackToken||t.callbackToken===this.callbackToken)&&t.fragment){const a=t.fragment;this.id==a.targetComponentId&&(this.applyFragment(a),this.completeMenu(a))}})}completeMenu(t){if(t.component&&t.component.type==oe.ClientSide){const a=t.component,s=a.metadata;if(s?.type==v.App){const i=s,r=this.getRemoteMenus(i.menu);if(r.length>0){const n=r.map(l=>va.runAction(l.baseUrl,l.route,"_empty","",l.baseUrl+"#"+l.route,void 0,void 0,void 0,l.params,this,!0));Promise.all(n).then(l=>{i.menu=this.updateMenu(i.menu,l.map(c=>c.fragments).filter(c=>c).map(c=>c).flat()),i.variant=$e.MENU_ON_TOP,Lt.next({fragment:{component:a,data:void 0,state:void 0,action:ei.Replace,targetComponentId:this.id,containerId:void 0},callbackToken:this.callbackToken})})}}}}updateMenu(t,a){const s=[];return t.forEach(i=>{if(i.remote){const r=a.find(n=>n.targetComponentId==i.baseUrl+"#"+i.route);if(r&&r.component?.type==oe.ClientSide){const n=r.component;if(n.metadata?.type==v.App){const l=n.metadata,c=i.serverSideType&&i.serverSideType!=""?i.serverSideType:l.serverSideType;this.changeBaseUrl(l.menu,i.baseUrl,c,i.route,l.route),s.push(...l.menu)}}}else s.push(i)}),s}changeBaseUrl(t,a,s,i,r){t.forEach(n=>{n.baseUrl||(n.submenus&&n.submenus.length>0?this.changeBaseUrl(n.submenus,a,s,i,r):(n.consumedRoute=r??"",n.baseUrl=a,n.serverSideType=s,n.uriPrefix=i))})}getRemoteMenus(t){const a=[];return t.forEach(s=>{s.remote&&a.push(s)}),a}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(t){if(t.type=="SetWindowTitle"&&(document.title=t.data),t.type=="SetFavicon"&&this.changeFavicon(t.data),t.type=="DispatchEvent"&&this.dispatchNamedEvent(t.data),t.type=="NavigateTo"){const a=t.data;a&&(a.startsWith("http:")||a.startsWith("https:")?window.open(t.data,"_blank"):window.location.href=t.data)}if(t.type=="PushStateToHistory"){const a=t.data;a!==void 0&&this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:a},bubbles:!0,composed:!0}))}if(t.type=="RunAction"){const a=t.data;if(a&&a.actionId)if(a.targetComponentId){const s={command:{type:"RunAction",data:{actionId:a.actionId},targetComponentId:a.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:""};setTimeout(()=>Lt.next(s))}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(t.type=="MarkAsDirty"&&this.dispatchEvent(new CustomEvent("dirty",{detail:{},bubbles:!0,composed:!0})),t.type=="MarkAsClean"&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),t.type=="DownloadFile"){const a=t.data;if(a&&a.base64Content){const s=atob(a.base64Content),i=new Uint8Array(s.length);for(let c=0;c<s.length;c++)i[c]=s.charCodeAt(c);const r=new Blob([i],{type:a.mimeType}),n=URL.createObjectURL(r),l=document.createElement("a");l.href=n,l.download=a.filename??"export",l.click(),URL.revokeObjectURL(n)}}if(t.type=="CloseModal"&&(this.closeModal(),this.dispatchNamedEvent(t.data)),t.type=="AddContentToHead"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.head.appendChild(this.createElement(t))}}if(t.type=="AddContentToBody"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.body.appendChild(this.createElement(t))}}}dispatchNamedEvent(t){if(t&&t.eventName){const a=this.component,s=a?.emitsName??a?.serverSideType;let i=t.payload??t.detail;s&&i&&typeof i=="object"&&(i={...i,__source:s}),this.dispatchEvent(new CustomEvent(t.eventName,{detail:i,bubbles:!0,composed:!0}))}}}ho([m()],Ji.prototype,"id");ho([m()],Ji.prototype,"baseUrl");var pp=Object.defineProperty,hp=(e,t,a,s)=>{for(var i=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=n(t,a,i)||i);return i&&pp(t,a,i),i};class di extends Ji{applyFragment(t){}manageActionRequestedEvent(t){}}hp([m()],di.prototype,"component");var mp=Object.defineProperty,vp=Object.getOwnPropertyDescriptor,Qt=(e,t,a,s)=>{for(var i=s>1?void 0:s?vp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&mp(t,a,i),i};const fp=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},bp=(e,t)=>{let a=t;for(;a;){if(a===e)return!0;a=a.assignedSlot??a.parentNode??a.host??null}return!1};let ct=class extends di{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.hoveredItem=null,this.onGridHoverMove=e=>{const t=e.currentTarget,a=t.getEventContext(e)?.item??null;a!==this.hoveredItem&&(this.hoveredItem=a,t.generateCellPartNames())},this.onGridHoverLeave=e=>{this.hoveredItem!==null&&(this.hoveredItem=null,e.currentTarget.generateCellPartNames())},this.hoverCellPartNameGenerator=(e,t)=>t?.item!=null&&t.item===this.hoveredItem?"hovered-cell":"",this._onRowKey=e=>{const t=this.field?.rowSelectionShortcut;if(!t||!this.field?.onItemSelectionActionId||!this._isRowShortcutRelevant()||!Or(t,e))return;const a=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!a)return;const s=this.currentItems(),i=parseInt(a[1],10)-1;i>=s.length||(e.preventDefault(),this.selectRow(s[i]))},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onRowKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._onRowKey)}currentItems(){return this.field?.remoteCoordinates?this.data?.[this.id]?.content??[]:this.field?.fieldId&&this.state?this.state[this.field.fieldId]??[]:[]}selectRow(e){!e||!this.field?.onItemSelectionActionId||(this.selectedItems=[e],this.state[this.id+"_selected_items"]=[e],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.field.onItemSelectionActionId,parameters:{_clickedRow:e}},bubbles:!0,composed:!0})))}_isRowShortcutRelevant(){if(this.offsetParent===null&&this.getClientRects().length===0)return!1;const e=fp();if(e&&e!==document.body&&!bp(this,e)){const t=e.tagName?.toLowerCase()??"";if(e.isContentEditable||/^(input|textarea|select)$/.test(t)||t.startsWith("vaadin-")&&/(field|combo|picker|area|select)/.test(t))return!1}return!0}handleItemToggle(e){const{item:t,selected:a,shiftKey:s}=e.detail;if(this.rangeStartItem??=t,s){let i=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(i=this.state[this.field.fieldId]);const[r,n]=[this.rangeStartItem,t].map(u=>i.indexOf(u)).sort((u,h)=>u-h),l=i.slice(r,n+1),c=new Set(this.selectedItems);l.forEach(u=>{a?c.add(u):c.delete(u)}),this.selectedItems=[...c],this.state[this.id+"_selected_items"]=this.selectedItems}this.rangeStartItem=t}render(){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);const t=this.state[this.field?.fieldId+"_show_detail"]||this.state._show_detail&&this.state._show_detail[this.field.fieldId];if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates,s="";this.data[this.id]&&(this.data[this.id].searchSignature||s)&&this.data[this.id].searchSignature!=s&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements?e=this.data[this.id].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:s,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}if(Array.isArray(e)&&e.forEach((a,s)=>{a&&typeof a=="object"&&a._rowNumber===void 0&&(a._rowNumber=s)}),this.field?.inlineEditing)return this.renderMaster(e);if(this.field?.formPosition&&this.field?.formPosition.startsWith("modal")){const a=this;return o`

                ${this.renderMaster(e)}

                <vaadin-dialog
                        .opened="${t}"
                        @closed="${()=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.field?.fieldId+"_cancel"},bubbles:!0,composed:!0}))}}"
                        ${Mi(()=>o`
                            <mateu-event-interceptor .target="${a}">
                                <div id="container" style="${this.field?.formStyle??"display: contents;"}">
                                    <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                                </div>
                            </mateu-event-interceptor>
                            `,[()=>ye()])}
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
                    .cellPartNameGenerator="${O(this.field?.onItemSelectionActionId?this.hoverCellPartNameGenerator:void 0)}"
                    @mousemove="${O(this.field?.onItemSelectionActionId?this.onGridHoverMove:void 0)}"
                    @mouseleave="${O(this.field?.onItemSelectionActionId?this.onGridHoverLeave:void 0)}"
                    style="${this.field?.onItemSelectionActionId?"cursor: pointer;":""}${this.field?.style??""}"
                    class="${this.field?.cssClasses}"
                    .items="${e}"
                    .selectedItems="${t}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${a=>{this.selectedItems=a.detail.value,this.state[this.id+"_selected_items"]=this.selectedItems}}"
                    @item-toggle="${this.handleItemToggle}"
                    @click="${O(this.field?.onItemSelectionActionId?a=>{const i=a.currentTarget.getEventContext(a)?.item;i&&this.selectRow(i)}:void 0)}"
                    @active-item-changed="${O(this.field?.detailPath&&!this.field?.useButtonForDetail?a=>{if(this.field?.detailPath){const s=a.detail.value;s?this.detailsOpenedItems=[s]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${O(this.field?.detailPath?xr(a=>o`${w(this,a[this.field?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    ?all-rows-visible=${e?.length<10}
            >
                <span slot="empty-state">${this.field?.label?`No ${this.field.label.toLowerCase()} added yet.`:"No items added yet."}</span>
                ${this.field?.readOnly||this.field?.inlineEditing?d:o`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.columns?.map(a=>Is(a,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}

                ${this.field?.inlineEditing&&!this.field?.readOnly?o`
                    <vaadin-grid-column width="3.5rem" flex-grow="0" frozen-to-end
                            ${wt(a=>o`
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
                            ${wt((a,{detailsOpened:s})=>o`
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
        </vaadin-vertical-layout>`}};ct.styles=C`
        ${Ht}

        /* Clickable grids (a row-selection action is wired) give visual feedback: the host sets a
           pointer cursor (inline, inherited by the slotted cell content), and the cells of the
           hovered row — tagged "hovered-cell" by cellPartNameGenerator — get a subtle highlight. */
        vaadin-grid[clickable]::part(hovered-cell) {
            background-color: var(--lumo-primary-color-10pct);
            cursor: pointer;
        }
    `;Qt([m()],ct.prototype,"field",2);Qt([m()],ct.prototype,"state",2);Qt([m()],ct.prototype,"data",2);Qt([m()],ct.prototype,"appState",2);Qt([m()],ct.prototype,"appData",2);Qt([m()],ct.prototype,"selectedItems",2);Qt([$()],ct.prototype,"detailsOpenedItems",2);ct=Qt([k("mateu-grid")],ct);var gp=Object.defineProperty,$p=Object.getOwnPropertyDescriptor,Da=(e,t,a,s)=>{for(var i=s>1?void 0:s?$p(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&gp(t,a,i),i};let Vt=class extends S{constructor(){super(...arguments),this.getNewValue=e=>{if(this.field?.dataType=="array"){if(!this.value)return[e];const t=this.value;return t.indexOf(e)>=0?t.filter(a=>a!==e):[...t,e]}return e}}render(){let e=this.field?.options;if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates;this.data?.[this.field.fieldId]&&this.data[this.field.fieldId].content&&this.data[this.field.fieldId].totalElements?e=this.data[this.field.fieldId].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:"",fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}const t=this.field?.attributes?.divStyle;return o`
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

       `}};Vt.styles=C`
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
  `;Da([m()],Vt.prototype,"field",2);Da([m()],Vt.prototype,"baseUrl",2);Da([m()],Vt.prototype,"state",2);Da([m()],Vt.prototype,"data",2);Da([m()],Vt.prototype,"value",2);Vt=Da([k("mateu-choice")],Vt);var yp=Object.defineProperty,xp=Object.getOwnPropertyDescriptor,ht=(e,t,a,s)=>{for(var i=s>1?void 0:s?xp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&yp(t,a,i),i};let Ne=class extends S{constructor(){super(...arguments),this.currencyChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),this.value.currency=e.detail.value,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}}))},this.valueChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),e.detail.value&&(this.value.value=e.detail.value?parseFloat(e.detail.value):0,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}})))}}render(){return o`
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
       `}};Ne.styles=C`
  `;ht([m()],Ne.prototype,"fieldId",2);ht([m()],Ne.prototype,"label",2);ht([m()],Ne.prototype,"state",2);ht([m()],Ne.prototype,"data",2);ht([m()],Ne.prototype,"value",2);ht([m()],Ne.prototype,"autoFocus",2);ht([m()],Ne.prototype,"required",2);ht([m()],Ne.prototype,"colspan",2);ht([m()],Ne.prototype,"helperText",2);Ne=ht([k("mateu-money-field")],Ne);const dr=["vaadin:abacus","vaadin:absolute-position","vaadin:academy-cap","vaadin:accessibility","vaadin:accordion-menu","vaadin:add-dock","vaadin:adjust","vaadin:adobe-flash","vaadin:airplane","vaadin:alarm","vaadin:align-center","vaadin:align-justify","vaadin:align-left","vaadin:align-right","vaadin:alt-a","vaadin:alt","vaadin:ambulance","vaadin:anchor","vaadin:angle-double-down","vaadin:angle-double-left","vaadin:angle-double-right","vaadin:angle-double-up","vaadin:angle-down","vaadin:angle-left","vaadin:angle-right","vaadin:angle-up","vaadin:archive","vaadin:archives","vaadin:area-select","vaadin:arrow-backward","vaadin:arrow-circle-down-o","vaadin:arrow-circle-down","vaadin:arrow-circle-left-o","vaadin:arrow-circle-left","vaadin:arrow-circle-right-o","vaadin:arrow-circle-right","vaadin:arrow-circle-up-o","vaadin:arrow-circle-up","vaadin:arrow-down","vaadin:arrow-forward","vaadin:arrow-left","vaadin:arrow-long-down","vaadin:arrow-long-left","vaadin:arrow-right","vaadin:arrow-up","vaadin:arrows-cross","vaadin:arrows-long-h","vaadin:arrows-long-right","vaadin:arrows-long-up","vaadin:arrows-long-v","vaadin:arrows","vaadin:asterisk","vaadin:at","vaadin:automation","vaadin:backspace-a","vaadin:backspace","vaadin:backwards","vaadin:ban","vaadin:bar-chart-h","vaadin:bar-chart-v","vaadin:bar-chart","vaadin:barcode","vaadin:bed","vaadin:bell-o","vaadin:bell-slash-o","vaadin:bell-slash","vaadin:bell","vaadin:boat","vaadin:bold","vaadin:bolt","vaadin:bomb","vaadin:book-dollar","vaadin:book-percent","vaadin:book","vaadin:bookmark-o","vaadin:bookmark","vaadin:briefcase","vaadin:browser","vaadin:bug-o","vaadin:bug","vaadin:building-o","vaadin:building","vaadin:bullets","vaadin:bullseye","vaadin:bus","vaadin:buss","vaadin:button","vaadin:calc-book","vaadin:calc","vaadin:calendar-briefcase","vaadin:calendar-clock","vaadin:calendar-envelope","vaadin:calendar-o","vaadin:calendar-user","vaadin:calendar","vaadin:camera","vaadin:car","vaadin:caret-down","vaadin:caret-left","vaadin:caret-right","vaadin:caret-square-down-o","vaadin:caret-square-left-o","vaadin:caret-square-right-o","vaadin:caret-square-up-o","vaadin:caret-up","vaadin:cart-o","vaadin:cart","vaadin:cash","vaadin:chart-3d","vaadin:chart-grid","vaadin:chart-line","vaadin:chart-timeline","vaadin:chart","vaadin:chat","vaadin:check-circle-o","vaadin:check-circle","vaadin:check-square-o","vaadin:check-square","vaadin:check","vaadin:chevron-circle-down-o","vaadin:chevron-circle-down","vaadin:chevron-circle-left-o","vaadin:chevron-circle-left","vaadin:chevron-circle-right-o","vaadin:chevron-circle-right","vaadin:chevron-circle-up-o","vaadin:chevron-circle-up","vaadin:chevron-down-small","vaadin:chevron-down","vaadin:chevron-left-small","vaadin:chevron-left","vaadin:chevron-right-small","vaadin:chevron-right","vaadin:chevron-up-small","vaadin:chevron-up","vaadin:child","vaadin:circle-thin","vaadin:circle","vaadin:clipboard-check","vaadin:clipboard-cross","vaadin:clipboard-heart","vaadin:clipboard-pulse","vaadin:clipboard-text","vaadin:clipboard-user","vaadin:clipboard","vaadin:clock","vaadin:close-big","vaadin:close-circle-o","vaadin:close-circle","vaadin:close-small","vaadin:close","vaadin:cloud-download-o","vaadin:cloud-download","vaadin:cloud-o","vaadin:cloud-upload-o","vaadin:cloud-upload","vaadin:cloud","vaadin:cluster","vaadin:code","vaadin:coffee","vaadin:cog-o","vaadin:cog","vaadin:cogs","vaadin:coin-piles","vaadin:coins","vaadin:combobox","vaadin:comment-ellipsis-o","vaadin:comment-ellipsis","vaadin:comment-o","vaadin:comment","vaadin:comments-o","vaadin:comments","vaadin:compile","vaadin:compress-square","vaadin:compress","vaadin:connect-o","vaadin:connect","vaadin:controller","vaadin:copy-o","vaadin:copy","vaadin:copyright","vaadin:corner-lower-left","vaadin:corner-lower-right","vaadin:corner-upper-left","vaadin:corner-upper-right","vaadin:credit-card","vaadin:crop","vaadin:cross-cutlery","vaadin:crosshairs","vaadin:css","vaadin:ctrl-a","vaadin:ctrl","vaadin:cube","vaadin:cubes","vaadin:curly-brackets","vaadin:cursor-o","vaadin:cursor","vaadin:cutlery","vaadin:dashboard","vaadin:database","vaadin:date-input","vaadin:deindent","vaadin:del-a","vaadin:del","vaadin:dental-chair","vaadin:desktop","vaadin:diamond-o","vaadin:diamond","vaadin:diploma-scroll","vaadin:diploma","vaadin:disc","vaadin:doctor-briefcase","vaadin:doctor","vaadin:dollar","vaadin:dot-circle","vaadin:download-alt","vaadin:download","vaadin:drop","vaadin:edit","vaadin:eject","vaadin:elastic","vaadin:ellipsis-circle-o","vaadin:ellipsis-circle","vaadin:ellipsis-dots-h","vaadin:ellipsis-dots-v","vaadin:ellipsis-h","vaadin:ellipsis-v","vaadin:enter-arrow","vaadin:enter","vaadin:envelope-o","vaadin:envelope-open-o","vaadin:envelope-open","vaadin:envelope","vaadin:envelopes-o","vaadin:envelopes","vaadin:eraser","vaadin:esc-a","vaadin:esc","vaadin:euro","vaadin:exchange","vaadin:exclamation-circle-o","vaadin:exclamation-circle","vaadin:exclamation","vaadin:exit-o","vaadin:exit","vaadin:expand-full","vaadin:expand-square","vaadin:expand","vaadin:external-browser","vaadin:external-link","vaadin:eye-slash","vaadin:eye","vaadin:eyedropper","vaadin:facebook-square","vaadin:facebook","vaadin:factory","vaadin:family","vaadin:fast-backward","vaadin:fast-forward","vaadin:female","vaadin:file-add","vaadin:file-code","vaadin:file-font","vaadin:file-movie","vaadin:file-o","vaadin:file-picture","vaadin:file-presentation","vaadin:file-process","vaadin:file-refresh","vaadin:file-remove","vaadin:file-search","vaadin:file-sound","vaadin:file-start","vaadin:file-table","vaadin:file-text-o","vaadin:file-text","vaadin:file-tree-small","vaadin:file-tree-sub","vaadin:file-tree","vaadin:file-zip","vaadin:file","vaadin:fill","vaadin:film","vaadin:filter","vaadin:fire","vaadin:flag-checkered","vaadin:flag-o","vaadin:flag","vaadin:flash","vaadin:flask","vaadin:flight-landing","vaadin:flight-takeoff","vaadin:flip-h","vaadin:flip-v","vaadin:folder-add","vaadin:folder-o","vaadin:folder-open-o","vaadin:folder-open","vaadin:folder-remove","vaadin:folder-search","vaadin:folder","vaadin:font","vaadin:form","vaadin:forward","vaadin:frown-o","vaadin:funcion","vaadin:function","vaadin:funnel","vaadin:gamepad","vaadin:gavel","vaadin:gift","vaadin:glass","vaadin:glasses","vaadin:globe-wire","vaadin:globe","vaadin:golf","vaadin:google-plus-square","vaadin:google-plus","vaadin:grab","vaadin:grid-bevel","vaadin:grid-big-o","vaadin:grid-big","vaadin:grid-h","vaadin:grid-small-o","vaadin:grid-small","vaadin:grid-v","vaadin:grid","vaadin:group","vaadin:hammer","vaadin:hand","vaadin:handle-corner","vaadin:hands-up","vaadin:handshake","vaadin:harddrive-o","vaadin:harddrive","vaadin:hash","vaadin:header","vaadin:headphones","vaadin:headset","vaadin:health-card","vaadin:heart-o","vaadin:heart","vaadin:home-o","vaadin:home","vaadin:hospital","vaadin:hourglass-empty","vaadin:hourglass-end","vaadin:hourglass-start","vaadin:hourglass","vaadin:inbox","vaadin:indent","vaadin:info-circle-o","vaadin:info-circle","vaadin:info","vaadin:input","vaadin:insert","vaadin:institution","vaadin:invoice","vaadin:italic","vaadin:key-o","vaadin:key","vaadin:keyboard-o","vaadin:keyboard","vaadin:laptop","vaadin:layout","vaadin:level-down-bold","vaadin:level-down","vaadin:level-left-bold","vaadin:level-left","vaadin:level-right-bold","vaadin:level-right","vaadin:level-up-bold","vaadin:level-up","vaadin:lifebuoy","vaadin:lightbulb","vaadin:line-bar-chart","vaadin:line-chart","vaadin:line-h","vaadin:line-v","vaadin:lines-list","vaadin:lines","vaadin:link","vaadin:list-ol","vaadin:list-select","vaadin:list-ul","vaadin:list","vaadin:location-arrow-circle-o","vaadin:location-arrow-circle","vaadin:location-arrow","vaadin:lock","vaadin:magic","vaadin:magnet","vaadin:mailbox","vaadin:male","vaadin:map-marker","vaadin:margin-bottom","vaadin:margin-left","vaadin:margin-right","vaadin:margin-top","vaadin:margin","vaadin:medal","vaadin:megafone","vaadin:megaphone","vaadin:meh-o","vaadin:menu","vaadin:microphone","vaadin:minus-circle-o","vaadin:minus-circle","vaadin:minus-square-o","vaadin:minus","vaadin:mobile-browser","vaadin:mobile-retro","vaadin:mobile","vaadin:modal-list","vaadin:modal","vaadin:money-deposit","vaadin:money-exchange","vaadin:money-withdraw","vaadin:money","vaadin:moon-o","vaadin:moon","vaadin:morning","vaadin:movie","vaadin:music","vaadin:mute","vaadin:native-button","vaadin:newspaper","vaadin:notebook","vaadin:nurse","vaadin:office","vaadin:open-book","vaadin:option-a","vaadin:option","vaadin:options","vaadin:orientation","vaadin:out","vaadin:outbox","vaadin:package","vaadin:padding-bottom","vaadin:padding-left","vaadin:padding-right","vaadin:padding-top","vaadin:padding","vaadin:paint-roll","vaadin:paintbrush","vaadin:palete","vaadin:palette","vaadin:panel","vaadin:paperclip","vaadin:paperplane-o","vaadin:paperplane","vaadin:paragraph","vaadin:password","vaadin:paste","vaadin:pause","vaadin:pencil","vaadin:phone-landline","vaadin:phone","vaadin:picture","vaadin:pie-bar-chart","vaadin:pie-chart","vaadin:piggy-bank-coin","vaadin:piggy-bank","vaadin:pill","vaadin:pills","vaadin:pin-post","vaadin:pin","vaadin:play-circle-o","vaadin:play-circle","vaadin:play","vaadin:plug","vaadin:plus-circle-o","vaadin:plus-circle","vaadin:plus-minus","vaadin:plus-square-o","vaadin:plus","vaadin:pointer","vaadin:power-off","vaadin:presentation","vaadin:print","vaadin:progressbar","vaadin:puzzle-piece","vaadin:pyramid-chart","vaadin:qrcode","vaadin:question-circle-o","vaadin:question-circle","vaadin:question","vaadin:quote-left","vaadin:quote-right","vaadin:random","vaadin:raster-lower-left","vaadin:raster","vaadin:records","vaadin:recycle","vaadin:refresh","vaadin:reply-all","vaadin:reply","vaadin:resize-h","vaadin:resize-v","vaadin:retweet","vaadin:rhombus","vaadin:road-branch","vaadin:road-branches","vaadin:road-split","vaadin:road","vaadin:rocket","vaadin:rotate-left","vaadin:rotate-right","vaadin:rss-square","vaadin:rss","vaadin:safe-lock","vaadin:safe","vaadin:scale-unbalance","vaadin:scale","vaadin:scatter-chart","vaadin:scissors","vaadin:screwdriver","vaadin:search-minus","vaadin:search-plus","vaadin:search","vaadin:select","vaadin:server","vaadin:share-square","vaadin:share","vaadin:shield","vaadin:shift-arrow","vaadin:shift","vaadin:shop","vaadin:sign-in-alt","vaadin:sign-in","vaadin:sign-out-alt","vaadin:sign-out","vaadin:signal","vaadin:sitemap","vaadin:slider","vaadin:sliders","vaadin:smiley-o","vaadin:sort","vaadin:sound-disable","vaadin:spark-line","vaadin:specialist","vaadin:spinner-arc","vaadin:spinner-third","vaadin:spinner","vaadin:spline-area-chart","vaadin:spline-chart","vaadin:split-h","vaadin:split-v","vaadin:split","vaadin:spoon","vaadin:square-shadow","vaadin:star-half-left-o","vaadin:star-half-left","vaadin:star-half-right-o","vaadin:star-half-right","vaadin:star-o","vaadin:star","vaadin:start-cog","vaadin:step-backward","vaadin:step-forward","vaadin:stethoscope","vaadin:stock","vaadin:stop-cog","vaadin:stop","vaadin:stopwatch","vaadin:storage","vaadin:strikethrough","vaadin:subscript","vaadin:suitcase","vaadin:sun-down","vaadin:sun-o","vaadin:sun-rise","vaadin:superscript","vaadin:sword","vaadin:tab-a","vaadin:tab","vaadin:table","vaadin:tablet","vaadin:tabs","vaadin:tag","vaadin:tags","vaadin:tasks","vaadin:taxi","vaadin:teeth","vaadin:terminal","vaadin:text-height","vaadin:text-input","vaadin:text-label","vaadin:text-width","vaadin:thin-square","vaadin:thumbs-down-o","vaadin:thumbs-down","vaadin:thumbs-up-o","vaadin:thumbs-up","vaadin:ticket","vaadin:time-backward","vaadin:time-forward","vaadin:timer","vaadin:toolbox","vaadin:tools","vaadin:tooth","vaadin:touch","vaadin:train","vaadin:trash","vaadin:tree-table","vaadin:trendind-down","vaadin:trending-down","vaadin:trending-up","vaadin:trophy","vaadin:truck","vaadin:twin-col-select","vaadin:twitter-square","vaadin:twitter","vaadin:umbrella","vaadin:underline","vaadin:unlink","vaadin:unlock","vaadin:upload-alt","vaadin:upload","vaadin:user-card","vaadin:user-check","vaadin:user-clock","vaadin:user-heart","vaadin:user-star","vaadin:user","vaadin:users","vaadin:vaadin-h","vaadin:vaadin-v","vaadin:viewport","vaadin:vimeo-square","vaadin:vimeo","vaadin:volume-down","vaadin:volume-off","vaadin:volume-up","vaadin:volume","vaadin:wallet","vaadin:warning","vaadin:workplace","vaadin:wrench","vaadin:youtube-square","vaadin:youtube"];var wp=Object.defineProperty,kp=Object.getOwnPropertyDescriptor,je=(e,t,a,s)=>{for(var i=s>1?void 0:s?kp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&wp(t,a,i),i};let me=class extends S{constructor(){super(...arguments),this.component=void 0,this.field=void 0,this.baseUrl=void 0,this.state={},this.data={},this.appState={},this.appData={},this.colorPickerOpened=!1,this.colorPickerValue=void 0,this.comboData=[],this._comboFilter="",this.rendered=!1,this.renderColorPicker=()=>{const e=this.field?.fieldId,t=this.state&&e in this.state?this.state[e]:this.field?.initialValue;return o`
            <ui5-color-picker value="${t}" @change="${a=>this.colorPickerValue=a.target.value}">Picker</ui5-color-picker>
        `},this.saveColor=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.colorPickerValue,fieldId:this.field.fieldId},bubbles:!0,composed:!0})),this.colorPickerOpened=!1},this.renderColorPickerFooter=()=>o`<vaadin-button @click="${()=>this.colorPickerOpened=!1}">Cancel</vaadin-button>
        <vaadin-button theme="primary" @click="${this.saveColor}">Save</vaadin-button>`,this.checked=e=>{const t=e.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.checked,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))},this.convert=e=>this.field?.dataType=="integer"?parseInt(e):e,this.multiComboBoxValueChanged=e=>{if(this.rendered){const t=this.field?.fieldId,a=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let s;e.detail.value&&(s=e.detail.value.map(i=>i.value),s&&s.length>0&&(this.data[this.id]||(this.data[this.id]={}),this.data[this.id].content||(this.data[this.id].content=[]),this.data[this.id]&&this.data[this.id].content&&e.detail.value.forEach(i=>{this.data[this.id].content?.find(r=>i.value==r.value)||this.data[this.id].content.push(i)}))),this.compareArrays(s,a)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.valueChanged=e=>{this.rendered&&e.detail.value!==void 0&&e.detail.value!=this.state[this.field.fieldId]&&this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.convert(e.detail.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.selectedItems=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.comboData&&this.comboData.length>0)return this.comboData?.filter(t=>e.indexOf(t.value)>=0);if(this.data[this.id]&&this.data[this.id].content&&this.data[this.id].content.length>0)return this.data[this.id].content.filter(t=>e.indexOf(t.value)>=0)}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0);return[]},this.selectedIndex=e=>{if(e)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const t=this.data[this.id].content.find(a=>a.value==e);if(t)return this.data[this.id].content.indexOf(t)}}else{const t=this.field?.options?.find(a=>a.value==e);if(t)return this.field?.options?.indexOf(t)}},this.selectedIndexes=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content)return this.data[this.id].content.filter(a=>e.indexOf(a.value)>=0).map(a=>this.data[this.id].content.indexOf(a))}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0).map(t=>this.field?.options?.indexOf(t));return[]},this.compareArrays=(e,t)=>this.falsy(e)&&this.falsy(t)||e&&t&&e.length===t.length&&e.every((a,s)=>a===t[s]),this.falsy=e=>!e||e.length==0,this.listItemsSelected=e=>{const t=this.field?.fieldId,a=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let s;this.rendered&&(e.detail.value&&(this.field?.remoteCoordinates?this.data[this.id]&&this.data[this.id].content&&(s=e.detail.value.map(i=>this.data[this.id].content[i].value)):s=e.detail.value.map(i=>this.field.options[i].value)),this.compareArrays(s,a)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s,fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))},this.listItemSelected=e=>{let t;if(e.detail.value||e.detail.value==0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const a=this.data[this.id].content[e.detail.value];a&&(t=a.value)}}else{const a=this.field.options[e.detail.value];a&&(t=a.value)}this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.mapPosition=e=>{switch(e){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.helperShownInControl=!1,this.fileUploaded=e=>{const t=this.field?.fieldId??"",a=this.state[t];a.push({id:e.detail.xhr.responseText,name:e.detail.file.name}),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.fileChanged=e=>{const t=this.field?.fieldId??"",a=(e.detail.value??[]).filter(i=>i.id).map(i=>i.id),s=(this.state[t]??[]).map(i=>i.id);if(!this.compareArrays(s,a)){const i=(e.detail.value??[]).filter(r=>r.id).map(r=>({id:r.id,name:r.name}));this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.triggerImageUpload=()=>{this.renderRoot?.querySelector('input[type="file"]')?.click()},this.imageUpload=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const s=new FileReader;s.onload=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s.result,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},s.readAsDataURL(a),t.value=""},this.imageDelete=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:"",fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.iconComboboxRenderer=e=>o`
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
`,this.filteredIcons=[],this.navLinkOffset=null,this.iconFilterChanged=e=>{this.filteredIcons=dr.filter(t=>!e.detail.value||t.indexOf(e.detail.value)>=0)}}remoteComboDataProvider(e){return(t,a)=>{const{filter:s,page:i,pageSize:r}=t,n=s??"";this._comboFilter=n,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{searchText:s,fieldId:this.field?.fieldId,size:r,page:i,sort:void 0},callback:l=>{if(n===this._comboFilter)if(l?.messages?.forEach(c=>{ia.show(c.text,{position:c.position?this.mapPosition(c.position):void 0,theme:c.variant,duration:c.duration})}),!l.fragments||l.fragments.length==0)this.comboData=[],a([],0);else{const c=l.fragments[0].data?.[this.id];this.comboData=c?.content,a(c?.content,c?.totalElements)}},callbackonly:!0},bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.rendered=!1}renderNavLink(){const e=this.field?.link;if(!e?.href)return d;const t=Oe(e.href,this.state,this.data)??e.href,a=Oe(e.title,this.state,this.data)||t,s=e.icon||(t.startsWith("http")?"vaadin:external-link":"vaadin:link"),i=this.navLinkOffset??"calc(var(--lumo-font-size-s) * 1.6 + (var(--lumo-size-m) - var(--lumo-icon-size-s)) / 2)";return o`<a
                data-navlink
                href="${t}"
                title="${a}"
                target="${O(e.target||void 0)}"
                style="display: flex; align-items: center; color: var(--lumo-secondary-text-color); align-self: flex-start; margin-top: ${i};"
        ><vaadin-icon icon="${s}" style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"></vaadin-icon></a>`}positionNavLink(){const e=this.renderRoot?.querySelector("a[data-navlink]");e&&setTimeout(()=>{const t=e.parentElement,a=t?.firstElementChild?.firstElementChild;if(!t||!a)return;const i=(a.shadowRoot?.querySelector('[part="input-field"]')??a).getBoundingClientRect();if(i.height===0)return;const r=Math.max(0,i.top+i.height/2-e.offsetHeight/2-t.getBoundingClientRect().top),n=`${Math.round(r)}px`;this.navLinkOffset!==n&&(this.navLinkOffset=n)})}helperText(){return this.helperShownInControl=!0,de(this.field?.description??"",this.state,this.data)??""}render(){const e=this.field?.fieldId??"";this.rendered=!0;const t=this.renderNavLink();this.helperShownInControl=!1;const a=this.renderField(),s=this.field?.description&&!this.helperShownInControl?de(this.field.description,this.state,this.data):void 0;return o`<div style="display: block;">
            <div style="${t!==d?"display: flex; gap: var(--lumo-space-xs);":""}"><div style="flex: 1; min-width: 0;">${a}</div>${t}</div>
            ${s?o`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${s}</div>
            `:d}
            ${this.data.errors&&this.data.errors[e]&&this.data.errors[e].length>0?o`
                <div><ul>${this.data.errors[e].map(i=>o`<li>${i}</li>`)}</ul></div>
            `:d}
        </div>`}async firstUpdated(){this.filteredIcons=dr}update(e){e.has("component")&&(this.rendered=!1),super.update(e)}updated(e){super.updated(e),this.positionNavLink()}renderField(){const e=this.field?.fieldId??"",t=this.state&&e in this.state?this.state[e]:this.field?.initialValue,a=this.field?.label+"",s=Oe(a,this.state,this.data),i=this.labelAlreadyRendered||!s||s=="null"?d:s;return this.field?.propertyRow?this.renderPropertyRowField(e,t,i,s):this.field?.stereotype=="badge"?this.renderBadgeField(e,t,i,s):this.field?.stereotype=="plainText"?this.renderPlainTextField(e,t,i,s):this.field?.stereotype=="bulletedList"?this.renderBulletedListField(e,t,i,s):this.field?.readOnly&&this.field.stereotype!="grid"&&this.field.dataType!="status"&&this.field?.dataType!="money"?this.renderReadOnlyField(e,t,i,s):this.field?.dataType=="file"?this.renderFileField(e,t,i,s):this.field?.dataType=="string"?this.renderStringField(e,t,i,s):this.field?.dataType=="number"?this.renderNumberField(e,t,i,s):this.field?.dataType=="integer"?this.renderIntegerField(e,t,i,s):this.field?.dataType=="bool"?this.renderBoolField(e,t,i,s):this.field?.dataType=="dateRange"?this.renderDateRangeField(e,t,i,s):this.field?.dataType=="date"?this.renderDateField(e,t,i,s):this.field?.dataType=="dateTime"?this.renderDateTimeField(e,t,i,s):this.field?.dataType=="time"?this.renderTimeField(e,t,i,s):this.field?.dataType=="array"?this.renderArrayField(e,t,i,s):this.field?.dataType=="money"?this.renderMoneyField(e,t,i,s):this.field?.dataType=="status"?this.renderStatusField(e,t,i,s):this.field?.dataType=="range"?this.renderRangeField(e,t,i,s):o`<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`}renderBadgeField(e,t,a,s){if(!this.field)return o``;const i=t===!0||t==="true";return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><span theme="badge ${i?"success":""} pill" style="${i?"":"opacity: 0.4;"}">${s}</span>
            </vaadin-custom-field>`}renderPropertyRowField(e,t,a,s){if(!this.field)return o``;let i=de(t,this.state,this.data);const r=i&&typeof i=="object"&&"value"in i?i:null;i&&i.value&&(i=i.value);const n=this.field?.dataType=="bool"||i===!0||i===!1,l=this.field?.dataType=="money",c=i!=null&&i!=="";let u=c?String(i):"—";if(l&&c){const f=typeof i=="number"?i:parseFloat(String(i));isNaN(f)||(u=r&&r.locale&&r.currency?new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(f):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(f))}const h=n?o`<vaadin-icon icon="${i===!0||i==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:o`<span style="font-weight: 500; text-align: right; word-break: break-word; margin-left: auto;${l?" font-variant-numeric: tabular-nums;":""}">${u}</span>`,p=s&&s!="null";return o`<div
                    id="${this.field.fieldId}"
                    data-colspan="${this.field?.colspan}"
                    style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; width: 100%; padding: 0.4rem 0; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); font-size: var(--lumo-font-size-s, .875rem); ${this.field?.style}"
            >${p?o`<span style="color: var(--lumo-secondary-text-color, #888); white-space: nowrap;">${s}</span>`:d}${h}</div>`}renderBulletedListField(e,t,a,s){if(!this.field)return o``;const i=de(t,this.state,this.data),r=Array.isArray(i)?i.map(n=>String(n)):i!=null&&i!==""?[String(i)]:[];return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><mateu-bulleted-list .items="${r}"></mateu-bulleted-list>
            </vaadin-custom-field>`}renderPlainTextField(e,t,a,s){if(!this.field)return o``;let i=de(t,this.state,this.data);const r=i&&typeof i=="object"&&"value"in i?i:null;i&&i.value&&(i=i.value);const n=this.field?.dataType=="bool"||i===!0||i===!1,l=this.field?.dataType=="money",c=i!=null&&i!=="";let u=c?String(i):"—";if(l&&c){const p=typeof i=="number"?i:parseFloat(String(i));isNaN(p)||(u=r&&r.locale&&r.currency?new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(p):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(p))}const h=n?o`<vaadin-icon icon="${i===!0||i==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:this.field?.multiline?o`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${u}</span>`:o`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${l?" font-variant-numeric: tabular-nums;":""}">${u}</span>`;return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    data-colspan="${this.field?.colspan}"
                    style="${l?"text-align: right; ":""}${this.field?.style}"
            >${h}</vaadin-custom-field>`}renderReadOnlyField(e,t,a,s){if(!this.field)return o``;let i=de(t,this.state,this.data)||this.data[e];if(i&&i.value&&(i=i.value),this.field.stereotype=="fileUpload")return o`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><mateu-file-upload .fieldId="${this.field.fieldId}" .value="${i}" .editable="${!1}"></mateu-file-upload>
                </vaadin-custom-field>`;if(this.field.stereotype=="image"||this.field.stereotype=="uploadableImage"||this.field.stereotype=="signature"||this.field.stereotype=="camera")return o`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><img src="${i}" id="${this.field.fieldId}_img" style="${this.field.style}">
                </vaadin-custom-field>`;if(this.field.dataType=="bool")return o`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><vaadin-icon icon="${i?"vaadin:check":"vaadin:minus"}" style="height: 20px;"></vaadin-icon>
                </vaadin-custom-field>`;const r=i!=null?String(i):"";return o`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        value="${i}"
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
`}renderFileField(e,t,a,s){if(!this.field)return o``;const i=t?.map(r=>({id:r.id,name:r.name,type:"",uploadTarget:"",complete:!0}))??[];return o`
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
            `}renderStringField(e,t,a,s){if(!this.field)return o``;if(this.field?.stereotype=="searchable"){const i=n=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"code-"+this.field?.fieldId,parameters:{code:n.currentTarget.value}},bubbles:!0,composed:!0}))},r=n=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"codesearch-"+this.field?.fieldId,parameters:{}},bubbles:!0,composed:!0}))};return o`
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
                `;if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates;let r;this.data[this.id]&&this.data[this.id].content&&(r=this.data[this.id].content.find(l=>l.value==t)),!r&&this.comboData&&(r=this.comboData.find(l=>l.value==t)),!r&&t&&(r={value:t,label:this.data[this.id+"-label"]??t});const n=this.remoteComboDataProvider(i.action);return o`
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
                            ${ss(this.comboRenderer,[])}
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
                            ${ss(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
                        <vaadin-custom-field
                                label="${a}"
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
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${O(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(i=>o`
                            <vaadin-item>${i.description||i.image||i.icon?o`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${i.icon?o`
                                        <vaadin-icon icon="${i.icon}"></vaadin-icon>
                                    `:d}
                                    ${i.image?o`
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
                `}if(this.field?.stereotype=="radio"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
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
                        ${this.field.options?.map(i=>o`
                            <vaadin-radio-button value="${i.value}" label="${i.label}">
                                ${i.description||i.image||i.icon?o`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${i.icon?o`
                                                <vaadin-icon icon="${i.icon}"></vaadin-icon>
                                            `:d}
                                            ${i.image?o`
                                                <img src="${i.image}" alt="${i.label}" style="height: 1rem;" />
                                            `:d}
                                            <span>${i.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${i.description?o`
                                            <div>${i.description}</div>
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
                            ${yr(()=>o`
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
                            ${ss(this.iconComboboxRenderer,[])}
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
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${ge(""+t)}</div></vaadin-custom-field>
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
                `;if(this.field?.stereotype=="fileUpload"){const i=eo(this.field.attributes,"accept");return o`
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
  ${Mi(this.renderColorPicker,[])}
  ${Cs(this.renderColorPickerFooter,[])}
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
`}renderNumberField(e,t,a,s){return this.field?o`<vaadin-number-field
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
            ></vaadin-number-field>`:o``}renderIntegerField(e,t,a,s){if(!this.field)return o``;if(this.field.stereotype=="stars"){let i=t;isNaN(i)&&(i=0);const r=[1,2,3,4,5];return o`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >${r.map(n=>o`
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
                    ><input type="range" @input="${r=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}" min="${this.field.sliderMin??0}" max="${this.field.sliderMax??10}" value="${i??0}"/></vaadin-custom-field>
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
            `}renderBoolField(e,t,a,s){return this.field?this.field.stereotype=="toggle"?o`
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
                `:o`
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
            `:o``}renderDateRangeField(e,t,a,s){if(!this.field)return o``;const i=t?t.from+";"+t.to:void 0;return o`<vcf-date-range-picker
                    id="${this.field.fieldId}"
                    label="${a}"
                    @value-changed="${r=>{r.detail.value&&(r.detail.value={from:r.detail.value.split(";")[0],to:r.detail.value.split(";")[1]}),this.valueChanged(r)}}"
                    value="${i}"
                    .helperText="${this.helperText()}"
                    ?autofocus="${this.field.wantsFocus}"
                    ?required="${this.field.required||d}"
                    data-colspan="${this.field.colspan}"
            ></vcf-date-range-picker>`}renderDateField(e,t,a,s){return this.field?o`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-picker>`:o``}renderDateTimeField(e,t,a,s){return this.field?o`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-time-picker>`:o``}renderTimeField(e,t,a,s){return this.field?o`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-time-picker>`:o``}renderArrayField(e,t,a,s){if(!this.field)return o``;if(this.field?.stereotype=="choice")return o`
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
`;if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
                        <vaadin-custom-field
                                label="${a}"
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
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box multiple
                                     .selectedValues="${O(this.selectedIndexes(t))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                                     data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(i=>o`
                            <vaadin-item>${i.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,r=this.remoteComboDataProvider(i.action);return o`
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
                    `}if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.rendered||setTimeout(()=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}),o`
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
                        ${this.field.options?.map(i=>o`
                        <vaadin-checkbox 
                                value="${i.value}" 
                                label="${i.label}"
                        ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
            `}renderMoneyField(e,t,a,s){if(!this.field)return o``;if(this.field.readOnly){const i=t;let r=i;return i&&i.locale&&i.currency?r=new Intl.NumberFormat(i.locale,{style:"currency",currency:i.currency}).format(i.value):r=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(i),o`<vaadin-custom-field
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
            ></mateu-money-field>`}renderStatusField(e,t,a,s){if(!this.field)return o``;const i=t;return o`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    ${i?o`<span theme="badge pill ${Bi(i.type)}">${i.message}</span>`:o``}                    
                </vaadin-custom-field>
            `}renderRangeField(e,t,a,s){if(!this.field)return o``;const i=t;return o`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><ui5-range-slider start-value="${i?.from??0}" end-value="${i?.to??0}" 
                                   min="${this.field.sliderMin??0}" 
                                   max="${this.field.sliderMax??10}"
                                   step="${this.field.step||d}"
                                   @change="${r=>{const n=r.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{from:n.startValue,to:n.endValue},fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"
                                   style="min-width: 10rem;"
                ></ui5-range-slider></vaadin-custom-field>
            `}};me.styles=C`
        ${Ht}

        /* A field spanning several columns (host colspan attribute, set when colspan > 1) must
           stretch to fill them — vaadin inputs default to a fixed width otherwise. */
        :host([colspan]) {
            display: block;
            width: 100%;
        }
        :host([colspan]) vaadin-text-field,
        :host([colspan]) vaadin-text-area,
        :host([colspan]) vaadin-combo-box,
        :host([colspan]) vaadin-date-picker,
        :host([colspan]) vaadin-time-picker,
        :host([colspan]) vaadin-number-field,
        :host([colspan]) vaadin-integer-field,
        :host([colspan]) vaadin-email-field,
        :host([colspan]) vaadin-password-field,
        :host([colspan]) vaadin-custom-field {
            width: 100%;
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
  `;je([m()],me.prototype,"component",2);je([m()],me.prototype,"field",2);je([m()],me.prototype,"baseUrl",2);je([m()],me.prototype,"state",2);je([m()],me.prototype,"data",2);je([m()],me.prototype,"appState",2);je([m()],me.prototype,"appData",2);je([m()],me.prototype,"labelAlreadyRendered",2);je([$()],me.prototype,"colorPickerOpened",2);je([$()],me.prototype,"colorPickerValue",2);je([$()],me.prototype,"filteredIcons",2);je([$()],me.prototype,"navLinkOffset",2);me=je([k("mateu-field")],me);var jt=(e=>(e.OnLoad="OnLoad",e.OnSuccess="OnSuccess",e.OnError="OnError",e.OnValueChange="OnValueChange",e.OnCustomEvent="OnCustomEvent",e.AutoSave="AutoSave",e))(jt||{}),Cp=Object.defineProperty,Xi=(e,t,a,s)=>{for(var i=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=n(t,a,i)||i);return i&&Cp(t,a,i),i};class Zt extends di{constructor(){super(...arguments),this.state={},this.data={},this.appData={},this.appState={},this.triggerOnLoad=()=>{const t=this.component;this.registerCustomEventListeners(),t.triggers?.filter(a=>a.type==jt.OnLoad).forEach(a=>{if((!a.condition||this._evalExpr(a.condition))&&!a.triggered){const i=a;i.triggered=!0;var s=i.times-1;i.timeoutMillis>0?this.scheduleOnload(i,s,this.id):this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(t,a,s)=>{if(s!=this.component?.id)return;const i=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,callbackToken:i},bubbles:!0,composed:!0}))},t.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=t=>{if(!(t instanceof CustomEvent))return;const a=t,i=(this.component.triggers??[]).filter(r=>r.type==jt.OnCustomEvent).filter(r=>r.eventName==a.type).filter(r=>r.source!=="COMPONENT"||a.detail?.__source===r.from);i.length!==0&&(i.some(r=>!r.source||r.source==="SELF")&&(t.stopPropagation(),t.preventDefault()),i.forEach(r=>{(!r.condition||this._evalExpr(r.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,parameters:a.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(t){return Cr(t,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(t){return vn(t,this.state??{},this.data??{},this._interpolationExtra())}applyFragment(t){if(this.id==t.targetComponentId){if(t.component)if(ei.Add==t.action)this.component&&this.component.children?.push(t.component);else{if(this.callbackToken=ye(),t.component?.type==oe.ServerSide)if(this.component){const s=this.component,i=t.component;s.actions=i.actions,s.type=i.type,s.rules=i.rules,s.triggers=i.triggers,s.serverSideType=i.serverSideType,s.route=i.route,s.initialData=i.initialData,s.validations=i.validations,s.cssClasses=i.cssClasses,s.slot=i.slot,s.style=i.style,s.children=i.children,(s.serverSideType!=i.serverSideType||s.id!=i.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=t.component,setTimeout(()=>this.triggerOnLoad());else{const s=[t.component];this.component&&(this.component.children=s)}t.action!==ei.ReplaceKeepData&&(this.state={},this.data={})}if(t.state&&(this.state={...this.state,...t.state}),t.data){for(const s in t.data){const i=t.data[s]?.page;i?.pageNumber>0&&this.data[s]&&this.data[s].page.content&&(i.content?i.content=[...this.data[s].page.content,...i.content]:i.content=[...this.data[s].page.content])}this.data={...this.data,...t.data}}this.registerCustomEventListeners();const a=te.getAfterRenderHook();a&&setTimeout(()=>a(this)),this.requestUpdate()}}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:a,name:s})=>a.removeEventListener(s,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(a=>a.type==jt.OnCustomEvent).forEach(a=>{const s=a.source==="DOCUMENT"||a.source==="COMPONENT"?document:this;s.addEventListener(a.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:s,name:a.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:t,name:a})=>t.removeEventListener(a,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}}Xi([m()],Zt.prototype,"state");Xi([m()],Zt.prototype,"data");Xi([m()],Zt.prototype,"appData");Xi([m()],Zt.prototype,"appState");const Sp={lon:0,lat:0},cr=3,Ip=e=>{if(!e)return;const t=e.split(",").map(i=>i.trim());if(t.length!==2)return;const a=Number(t[0]),s=Number(t[1]);if(!(t[0]===""||t[1]===""||!Number.isFinite(a)||!Number.isFinite(s)))return{lon:s,lat:a}},_p=e=>{if(e==null||e.trim()==="")return cr;const t=Number(e);return Number.isFinite(t)?t:cr};var Ep=Object.defineProperty,Pp=Object.getOwnPropertyDescriptor,Qi=(e,t,a,s)=>{for(var i=s>1?void 0:s?Pp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Ep(t,a,i),i};let _a=class extends S{constructor(){super(...arguments),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){const e=++this.renderSeq,[{default:t},{default:a},{default:s},{default:i},{fromLonLat:r},{default:n}]=await Promise.all([Te(()=>import("./vendor-ol.js").then(c=>c.M),[]),Te(()=>import("./vendor-ol.js").then(c=>c.V),[]),Te(()=>import("./vendor-ol.js").then(c=>c.T),[]),Te(()=>import("./vendor-ol.js").then(c=>c.O),[]),Te(()=>import("./vendor-ol.js").then(c=>c.p),[]),Te(()=>import("./vendor-ol.js").then(c=>c.o),[])]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector("style[data-ol]")){const c=document.createElement("style");c.setAttribute("data-ol",""),c.textContent=n,this.shadowRoot.appendChild(c)}this.map&&(this.map.setTarget(void 0),this.map=void 0);const l=Ip(this.position)??Sp;this.map=new t({target:this.mapElement,layers:[new s({source:new i})],view:new a({center:r([l.lon,l.lat]),zoom:_p(this.zoom)})})}render(){return o`<div id="map"></div>`}};_a.styles=C`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `;Qi([m()],_a.prototype,"position",2);Qi([m()],_a.prototype,"zoom",2);Qi([et("#map")],_a.prototype,"mapElement",2);_a=Qi([k("mateu-map")],_a);const Tp=typeof HTMLElement<"u"?HTMLElement:class{};class Op extends Tp{static get observedAttributes(){return["content"]}#e;#t=0;get content(){return this.#e}set content(t){this.#e=t,this.#a()}attributeChangedCallback(t,a,s){this.content=s??void 0}connectedCallback(){this.style.display="block",this.#a()}async#a(){if(!this.isConnected)return;const t=this.#e??"",a=++this.#t,[{marked:s},{default:i}]=await Promise.all([Te(()=>import("./vendor.js").then(r=>r.f),[]),Te(()=>import("./vendor.js").then(r=>r.c),[])]);a===this.#t&&(this.innerHTML=i.sanitize(await s.parse(t),{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:r=>!0}}))}}typeof customElements<"u"&&!customElements.get("mateu-markdown")&&customElements.define("mateu-markdown",Op);var Rp=Object.defineProperty,zp=Object.getOwnPropertyDescriptor,$a=(e,t,a,s)=>{for(var i=s>1?void 0:s?zp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Rp(t,a,i),i};const Ap=e=>{const t=[];return e.color&&e.color!=="normal"&&e.color!=="none"&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle==="tertiaryInline"?"tertiary-inline":e.buttonStyle),e.size&&e.size!=="none"&&e.size!=="normal"&&t.push(e.size),t.length?t.join(" "):void 0},ur=e=>e==="back"||e==="backToList"||!!e&&e.startsWith("cancel");let St=class extends S{constructor(){super(...arguments),this.appState={},this.appData={},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.evalLabel=e=>Oe(e,this.state,this.data),this.renderBtn=e=>{if((this.data??{})[e.actionId+".hidden"])return d;const t=this.evalLabel(e.label),a=te.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e.actionId));return a||o`
        <vaadin-button
                data-action-id="${e.id}"
                theme="${Ap(e)||d}"
                @click="${()=>this.handleButtonClick(e.actionId)}"
                ?disabled="${e.disabled}"
        >${e.iconOnLeft?o`<vaadin-icon icon="${e.iconOnLeft}"></vaadin-icon>`:d}${t}${e.iconOnRight?o`<vaadin-icon icon="${e.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>
    `}}render(){const e=this.metadata;if(!e)return o``;const t=e.toolbar??[],a=t.filter(l=>ur(l.actionId)),s=t.filter(l=>!ur(l.actionId)),i=a.length>0&&s.length>0?o`<span class="toolbar-divider"></span>`:d,r=e.avatar||e.title||e.subtitle||e.kpis?.length>0||e.header?.length>0||t.length>0,n=e.level??0;return n>0?this.setAttribute("data-nested",""):this.removeAttribute("data-nested"),o`
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
                    ${e?.header?.map(l=>w(this,l,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${a.map(this.renderBtn)}
                    ${i}
                    ${s.map(this.renderBtn)}
                </div>
            `:r?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="form-header">
                    ${e.avatar?w(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):d}
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        ${e?.title&&n==0?o`<h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ge(xt(e?.title,this.state??{},this.data??{}))}</h2>`:d}
                        ${e?.title&&n==1?o`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ge(xt(e?.title,this.state??{},this.data??{}))}</h3>`:d}
                        ${e?.title&&n==2?o`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ge(xt(e?.title,this.state??{},this.data??{}))}</h4>`:d}
                        ${e?.title&&n==3?o`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ge(xt(e?.title,this.state??{},this.data??{}))}</h5>`:d}
                        ${e?.title&&n>3?o`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ge(xt(e?.title,this.state??{},this.data??{}))}</h6>`:d}

                        ${e?.subtitle?o`<span style="display: inline-block; margin-block-end: 0.83em;">${ge(xt(e?.subtitle,this.state??{},this.data??{}))}</span>`:d}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${e?.kpis?.map(l=>o`
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div>${this.evalLabel(l.title)}</div>
                                <div>${ge(xt(l.text,this.state??{},this.data??{}))}</div>
                            </div>
                        `)}
                        ${e?.header?.map(l=>w(this,l,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${a.map(this.renderBtn)}
                        ${i}
                        ${s.map(this.renderBtn)}
                    </div>
                </div>
            `:d}
            ${e.badges&&e.badges.length>0?o`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${e.badges.map(l=>el(l,this.state??{},this.data??{}))}
                </div>
            `:d}
        `}};St.styles=C`
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

        ${Ht}
    `;$a([m()],St.prototype,"metadata",2);$a([m()],St.prototype,"baseUrl",2);$a([m()],St.prototype,"state",2);$a([m()],St.prototype,"data",2);$a([m()],St.prototype,"appState",2);$a([m()],St.prototype,"appData",2);St=$a([k("mateu-content-header")],St);var jp=Object.defineProperty,Lp=Object.getOwnPropertyDescriptor,ci=(e,t,a,s)=>{for(var i=s>1?void 0:s?Lp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&jp(t,a,i),i};let da=class extends di{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={}}render(){const e=this.component?.metadata;return o`
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
       `}};da.styles=C`
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
    `;ci([m()],da.prototype,"state",2);ci([m()],da.prototype,"data",2);ci([m()],da.prototype,"appState",2);ci([m()],da.prototype,"appData",2);da=ci([k("mateu-form")],da);var Dp=Object.defineProperty,Np=Object.getOwnPropertyDescriptor,tt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Np(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Dp(t,a,i),i};let Re=class extends S{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.pagesRequested=[],this.emptyArray=e=>!e||e.length==0,this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;if(this.metadata?.infiniteScrolling&&e.page>0){let s=!1;a&&a.content&&(a.content.length>=(e.page+1)*e.pageSize||a.content.length==a.totalElements)&&(t(a.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),a.totalElements),s=!0,this.grid&&this.grid.recalculateColumnWidths()),s||this.pagesRequested.find(i=>i==e.page)||(this.pagesRequested.push(e.page),this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:e,callback:()=>{this.data[this.id]?.page?.content&&(t(this.data[this.id].page.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),this.data[this.id].page.totalElements),this.grid&&this.grid.recalculateColumnWidths())}},bubbles:!0,composed:!0})))}else{const s=this.metadata?.infiniteScrolling?a?.totalElements:a?.content?.length??0;t(a?.content??[],s),this.grid&&this.grid.recalculateColumnWidths()}},this._onActionRequested=e=>{const t=e.detail,a=this.identifierFieldName;if(!a||!t.parameters||t.actionId?.startsWith("action-on-row-"))return;const s=t.parameters[a];s!==void 0&&(this.state._selectedId=String(s),this._applyCellPartNameGenerator(),this.grid?.requestContentUpdate())},this.tooltipGenerator=e=>{let t="";const{column:a,item:s}=e,i=this.metadata?.columns?.find(r=>r.metadata.id==a?.path);if(i?.metadata){const r=(i?.metadata).tooltipPath;r&&a&&s&&(t=s[r])}return t}}get identifierFieldName(){const e=this.metadata?.columns?.find(a=>a.metadata?.identifier);if(e)return e.metadata?.id;if(this.metadata?.columns?.find(a=>a.metadata?.id==="id"))return"id"}_applyCellPartNameGenerator(){if(!this.grid)return;const e=this.identifierFieldName,t=this.state?._selectedId??this.appState?._splitDetailId,a=!!this.metadata?.groupBy;e&&t!==void 0||a?this.grid.cellPartNameGenerator=(s,i)=>{const r=i.item;return Ha(r)?"mateu-group-row":e&&t!==void 0&&String(r[e])===String(t)?"selected-row":""}:this.grid.cellPartNameGenerator=null}connectedCallback(){super.connectedCallback(),this.addEventListener("action-requested",this._onActionRequested)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("action-requested",this._onActionRequested)}updated(e){super.updated(e),this._applyCellPartNameGenerator(),this.grid?.clearCache(),this.grid?.requestContentUpdate(),this.grid?.recalculateColumnWidths(),this.pagesRequested=[]}render(){const e=this.data[this.id],t=e?.page,a=this.metadata?.groupBy,s=this.metadata?.infiniteScrolling?void 0:t?.content?Sr(t.content,a,e?.groups):t?.content,i=(this.metadata?.columns??[]).flatMap(c=>c.metadata?.type===v.GridGroupColumn?(c.metadata.columns??[]).map(u=>u.metadata):[c.metadata]),r=Pr(i,e,a);let n="";this.metadata?.wrapCellContent&&(n+=" wrap-cell-content"),this.metadata?.compact&&(n+=" compact"),this.metadata?.noBorder&&(n+=" no-border"),this.metadata?.noRowBorder&&(n+=" no-row-borders"),this.metadata?.columnBorders&&(n+=" column-borders"),this.metadata?.rowStripes&&(n+=" row-stripes");const l=this.state[this.id+"_selected_items"]||[];return o`
            <vaadin-grid
                    .items="${s}"
                    item-id-path="_rowNumber"
                    .selectedItems="${l}"
                    ?data-clickable-rows="${this.metadata?.detailPath&&!this.metadata?.useButtonForDetail}"
                    ?all-rows-visible="${this.metadata?.allRowsVisible}"
                    column-rendering="${this.metadata?.lazyColumnRendering?"lazy":d}"
                    ?column-reordering-allowed="${this.metadata?.columnReorderingAllowed}"
                    .dataProvider="${this.metadata?.infiniteScrolling?this.dataProvider:void 0}"
                    page-size="${this.metadata?.pageSize}"
                    multi-sort-on-shift-click
                    @selected-items-changed="${c=>{const u=(c.detail.value??[]).filter(h=>!Ha(h));this.emptyArray(this.state[this.id+"_selected_items"])&&this.emptyArray(u)||(this.state[this.id+"_selected_items"]=u,this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0})))}}"
                    @active-item-changed="${O(this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?c=>{if(this.metadata?.detailPath){const u=c.detail.value;if(u&&Ha(u))return;u?this.detailsOpenedItems=[u]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${O(this.metadata?.detailPath?xr(c=>o`${w(this,c[this.metadata?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    theme="${n}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?o`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:d}
                ${this.metadata?.columns?.map(c=>Is(c,this,this.baseUrl,this.state,this.data,this.appState,this.appData,r))}
                ${this.metadata?.useButtonForDetail?o`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${wt((c,{detailsOpened:u})=>o`
              <vaadin-button
                theme="tertiary icon"
                title="${u?"Collapse":"Expand"}"
                aria-label="Toggle details"
                aria-expanded="${u?"true":"false"}"
                @click="${()=>{this.detailsOpenedItems=u?this.detailsOpenedItems.filter(h=>h!==c):[...this.detailsOpenedItems,c]}}"
              >
                <vaadin-icon
                  .icon="${u?"lumo:angle-down":"lumo:angle-right"}"
                ></vaadin-icon>
              </vaadin-button>
            `,[])}
                    ></vaadin-grid-column>
                `:d}
                <span slot="empty-state">${aa(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(c=>c.metadata.tooltipPath)?o`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:d}
            </vaadin-grid>
            <slot></slot>
       `}};Re.styles=C`
        ${Ht}
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
  `;tt([m()],Re.prototype,"id",2);tt([m()],Re.prototype,"metadata",2);tt([m()],Re.prototype,"baseUrl",2);tt([m()],Re.prototype,"state",2);tt([m()],Re.prototype,"data",2);tt([m()],Re.prototype,"appState",2);tt([m()],Re.prototype,"appData",2);tt([m()],Re.prototype,"emptyStateMessage",2);tt([$()],Re.prototype,"detailsOpenedItems",2);tt([et("vaadin-grid")],Re.prototype,"grid",2);Re=tt([k("mateu-table")],Re);const mo="mateu-saved-views",Zi=()=>{try{return JSON.parse(localStorage.getItem(mo)??"{}")}catch{return{}}},Ns=e=>{try{localStorage.setItem(mo,JSON.stringify(e))}catch{}},Li=e=>Zi()[e]??[],vo=(e,t)=>{const a=t.name?.trim();if(!a||Object.keys(t.values??{}).length===0)return;const s=Zi(),i=(s[e]??[]).filter(r=>r.name!==a);i.push({...t,name:a}),s[e]=i,Ns(s)},fo=(e,t)=>{const a=Zi(),s=(a[e]??[]).filter(i=>i.name!==t);s.length===0?delete a[e]:a[e]=s,Ns(a)},bo=(e,t)=>{const a=Zi();a[e]=(a[e]??[]).map(s=>({...s,isDefault:s.name===t?!s.isDefault:!1})),Ns(a)},go=e=>Li(e).find(t=>t.isDefault);var Fp=Object.defineProperty,Mp=Object.getOwnPropertyDescriptor,Be=(e,t,a,s)=>{for(var i=s>1?void 0:s?Mp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Fp(t,a,i),i};let we=class extends S{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.panelOpened=!1,this.viewsOpened=!1,this.draftText="",this.openPanel=()=>{this.panelOpened||this.filters.length===0||(this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1,this.activeFilter=void 0},this.clearAllFilters=()=>{const e=this.filters.flatMap(a=>this.isRangeFilter(a)?[`${a.fieldId}_from`,`${a.fieldId}_to`]:[a.fieldId]),t={searchText:void 0};e.forEach(a=>{t[a]=void 0}),this.state={...this.state,...t},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:e},bubbles:!0,composed:!0})),this.requestSearch()},this.keepFocus=e=>e.preventDefault()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get filters(){return this.metadata?.filters??[]}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}requestSearch(){this.closePanel(),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))}emitValueChanged(e,t){this.state={...this.state,[e]:t},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:e},bubbles:!0,composed:!0}))}applyFilter(e,t){this.emitValueChanged(e,t),this.requestSearch()}removeChip(e){const t=this.filters.find(a=>a.fieldId===e);t&&this.isRangeFilter(t)?(this.emitValueChanged(`${e}_from`,void 0),this.emitValueChanged(`${e}_to`,void 0)):this.emitValueChanged(e,e==="searchText"?"":void 0),this.requestSearch()}commitText(e){this.emitValueChanged("searchText",e.value),this.draftText="",e.value="",this.requestSearch()}get viewsScope(){return window.location.pathname}allFilterKeys(){return["searchText",...this.filters.flatMap(e=>this.isRangeFilter(e)?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId])]}snapshotValues(){const e={};return this.state.searchText&&(e.searchText=this.state.searchText),this.filters.forEach(t=>{if(this.isSet(t))if(this.isRangeFilter(t)){const a=this.rangeBound(t,"from"),s=this.rangeBound(t,"to");a&&(e[`${t.fieldId}_from`]=a),s&&(e[`${t.fieldId}_to`]=s)}else this.isMultiFilter(t)?e[t.fieldId]=this.multiValues(t):e[t.fieldId]=this.state[t.fieldId]}),e}applyView(e){const t=this.allFilterKeys(),a={};t.forEach(s=>{a[s]=void 0}),this.state={...this.state,...a},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:t},bubbles:!0,composed:!0})),Object.entries(e.values).forEach(([s,i])=>this.emitValueChanged(s,i)),this.viewsOpened=!1,this.detachOutsideClick(),this.requestSearch()}saveCurrentView(e){const t=e.value.trim();t&&(vo(this.viewsScope,{name:t,values:this.snapshotValues()}),e.value="",this.requestUpdate())}firstUpdated(){if(window.location.search)return;const e=go(this.viewsScope);e&&setTimeout(()=>{this.state.searchText||this.filters.some(a=>this.isSet(a))||this.applyView(e)},0)}isBooleanFilter(e){return e.dataType==="boolean"||e.dataType==="bool"||e.stereotype==="checkbox"||e.stereotype==="toggle"}isNumericFilter(e){return["integer","decimal","number","money"].includes(e.dataType??"")}isRangeFilter(e){return e.stereotype==="dateRange"||e.stereotype==="numberRange"}isMultiFilter(e){return e.stereotype==="multiSelect"}hasOptions(e){return(e.options?.length??0)>0}multiValues(e){const t=this.state[e.fieldId];return Array.isArray(t)?t.map(String):typeof t=="string"&&t!==""?t.split(",").map(a=>a.trim()).filter(a=>a):[]}rangeBound(e,t){const a=this.state[`${e.fieldId}_${t}`];return a==null?"":String(a)}isSet(e){if(this.isRangeFilter(e))return this.rangeBound(e,"from")!==""||this.rangeBound(e,"to")!=="";if(this.isMultiFilter(e))return this.multiValues(e).length>0;const t=this.state[e.fieldId];return t!=null&&t!==""&&!Number.isNaN(t)}getFilterDisplayValue(e,t){if(e.options?.length){const a=e.options.find(s=>s.value===String(t));if(a)return a.label??a.value}return typeof t=="boolean"?t?"Yes":"No":String(t)}conditionDisplay(e){if(this.isRangeFilter(e)){const t=this.rangeBound(e,"from"),a=this.rangeBound(e,"to");return t&&a?`${t} – ${a}`:t?`≥ ${t}`:`≤ ${a}`}return this.isMultiFilter(e)?this.multiValues(e).map(t=>this.getFilterDisplayValue(e,t)).join(", "):this.getFilterDisplayValue(e,this.state[e.fieldId])}labelOf(e){return Oe(e.label,this.state,this.data)||e.fieldId}panelRow(e,t,a="panel-row"){return o`
            <div class="${a}" @mousedown="${this.keepFocus}" @click="${t}">${e}</div>`}renderRangeWidget(e){const t=e.stereotype==="numberRange"?"number":e.dataType==="dateTime"?"datetime-local":e.dataType==="time"?"time":"date",a=i=>{const r=i.closest(".panel-input-row"),n=r.querySelector("input.range-from").value,l=r.querySelector("input.range-to").value;this.emitValueChanged(`${e.fieldId}_from`,n===""?void 0:n),this.emitValueChanged(`${e.fieldId}_to`,l===""?void 0:l),this.requestSearch()},s=i=>{i.key==="Enter"&&a(i.target),i.key==="Escape"&&this.closePanel()};return o`
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
            </div>`}renderMultiWidget(e){const t=this.multiValues(e),a=s=>{const i=t.includes(s)?t.filter(r=>r!==s):[...t,s];this.emitValueChanged(e.fieldId,i.length>0?i:void 0),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))};return o`${(e.options??[]).map(s=>this.panelRow(o`
            <span class="multi-check ${t.includes(s.value)?"multi-check--on":""}"
                  aria-hidden="true">${t.includes(s.value)?"✓":""}</span>
            ${s.label??s.value}
        `,()=>a(s.value)))}`}renderActiveFilterWidget(e){if(this.isRangeFilter(e))return this.renderRangeWidget(e);if(this.isMultiFilter(e))return this.renderMultiWidget(e);if(this.hasOptions(e))return o`${e.options.map(s=>this.panelRow(s.label??s.value,()=>this.applyFilter(e.fieldId,s.value)))}`;if(this.isBooleanFilter(e))return o`
                ${this.panelRow("Yes",()=>this.applyFilter(e.fieldId,!0))}
                ${this.panelRow("No",()=>this.applyFilter(e.fieldId,!1))}`;const t=this.isNumericFilter(e),a=s=>{s.value!==""&&this.applyFilter(e.fieldId,t?Number(s.value):s.value)};return o`
            <div class="panel-input-row">
                <input type="${t?"number":"text"}"
                       placeholder="${e.placeholder||this.labelOf(e)}"
                       @mousedown="${s=>s.stopPropagation()}"
                       @keydown="${s=>{s.key==="Enter"&&a(s.target),s.key==="Escape"&&this.closePanel()}}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${s=>a(s.target.previousElementSibling)}">Apply</button>
            </div>`}renderViewsPanel(){if(!this.viewsOpened)return d;const e=Li(this.viewsScope),t=!!this.state.searchText||this.filters.some(a=>this.isSet(a));return o`
            <div class="panel views-panel">
                <div class="panel-caption">Saved views</div>
                ${e.length===0?o`
                    <div class="panel-row views-empty">No saved views yet</div>`:d}
                ${e.map(a=>o`
                    <div class="panel-row view-row" @mousedown="${this.keepFocus}">
                        <span class="view-name" @click="${()=>this.applyView(a)}">${a.name}</span>
                        <button class="view-star ${a.isDefault?"view-star--on":""}"
                                title="${a.isDefault?"Unset as default":"Open this listing with this view"}"
                                @click="${()=>{bo(this.viewsScope,a.name),this.requestUpdate()}}">★</button>
                        <button class="chip-remove" aria-label="Delete view ${a.name}"
                                @click="${()=>{fo(this.viewsScope,a.name),this.requestUpdate()}}">✕</button>
                    </div>`)}
                ${t?o`
                    <div class="panel-input-row" @mousedown="${a=>a.stopPropagation()}">
                        <input class="view-name-input" type="text" placeholder="Save current view as…"
                               @keydown="${a=>{a.key==="Enter"&&this.saveCurrentView(a.target),a.key==="Escape"&&(this.viewsOpened=!1)}}"/>
                        <button class="apply-button"
                                @click="${a=>this.saveCurrentView(a.target.previousElementSibling)}">Save</button>
                    </div>`:o`
                    <div class="panel-row views-empty">Apply some filters to save a view</div>`}
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
        `}};we.styles=C`
        ${Ht}
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
    `;Be([m()],we.prototype,"metadata",2);Be([m()],we.prototype,"baseUrl",2);Be([$()],we.prototype,"state",2);Be([$()],we.prototype,"data",2);Be([m()],we.prototype,"appState",2);Be([m()],we.prototype,"appData",2);Be([m({type:Boolean})],we.prototype,"searchOnly",2);Be([$()],we.prototype,"panelOpened",2);Be([$()],we.prototype,"viewsOpened",2);Be([$()],we.prototype,"activeFilter",2);Be([$()],we.prototype,"draftText",2);we=Be([k("mateu-filter-bar")],we);const $o="mateu-column-prefs",Fs=()=>{try{const e=JSON.parse(localStorage.getItem($o)??"{}");return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}catch{return{}}},yo=e=>{try{localStorage.setItem($o,JSON.stringify(e))}catch{}},Ms=e=>{if(!e||typeof e!="object")return;const t=a=>Array.isArray(a)?a.filter(s=>typeof s=="string"):[];return{hidden:t(e.hidden),order:t(e.order)}},xo=e=>Ms(Fs()[e]),qp=(e,t)=>{const a=Fs(),s=Ms(t);s.hidden.length===0&&s.order.length===0?delete a[e]:a[e]=s,yo(a)},Up=e=>{const t=Fs();delete t[e],yo(t)},wo=e=>e?!!e.identifier||e.dataType==="action"||e.dataType==="actionGroup"||e.dataType==="menu"||e.id==="select"||e.id==="menu":!1,ko=(e,t,a=s=>s)=>{const s=Ms(t);if(!s||s.hidden.length===0&&s.order.length===0)return e;const i=p=>a(p)?.id??p.id,r=new Set(s.hidden),n=e.filter(p=>{const f=i(p);return!f||!r.has(f)||wo(a(p))});if(s.order.length===0)return n.length===e.length?e:n;const l=new Map;n.forEach(p=>{const f=i(p);f&&!l.has(f)&&l.set(f,p)});const c=[],u=new Set;return s.order.forEach(p=>{const f=l.get(p);f&&!u.has(f)&&(c.push(f),u.add(f))}),n.forEach(p=>{u.has(p)||(c.push(p),u.add(p))}),c.length===e.length&&c.every((p,f)=>p===e[f])?e:c};var Bp=Object.defineProperty,Vp=Object.getOwnPropertyDescriptor,ui=(e,t,a,s)=>{for(var i=s>1?void 0:s?Vp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Bp(t,a,i),i};let ca=class extends S{constructor(){super(...arguments),this.columns=[],this.scope="",this.panelOpened=!1,this.revision=0,this.togglePanel=()=>{if(this.panelOpened){this.closePanel();return}this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick)},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1},this.reset=()=>{Up(this.scope),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}get prefs(){return xo(this.scope)??{hidden:[],order:[]}}effectiveEntries(e){return ko(this.columns,{hidden:[],order:e.order})}commit(e){qp(this.scope,e),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}toggleVisibility(e){const t=this.prefs,a=t.hidden.includes(e)?t.hidden.filter(s=>s!==e):[...t.hidden,e];this.commit({...t,hidden:a})}move(e,t){const a=this.prefs,s=[...this.effectiveEntries(a)],i=s.findIndex(l=>l.id===e);if(i<0)return;let r=i+t;for(;r>=0&&r<s.length&&s[r].protected;)r+=t;if(r<0||r>=s.length)return;const n=s[i];s[i]=s[r],s[r]=n,this.commit({...a,order:s.map(l=>l.id)})}render(){this.revision;const e=this.prefs,t=this.effectiveEntries(e).filter(s=>!s.protected);if(t.length===0)return o``;const a=e.hidden.length>0||e.order.length>0;return o`
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
                        ${t.map((s,i)=>{const r=e.hidden.includes(s.id);return o`
                                <div class="row" data-column-id="${s.id}">
                                    <label class="row-label">
                                        <input
                                            type="checkbox"
                                            .checked="${!r}"
                                            @change="${()=>this.toggleVisibility(s.id)}"
                                        />
                                        <span class="${r?"muted":""}">${s.label||s.id}</span>
                                    </label>
                                    <button class="move" type="button" title="Move up" aria-label="Move ${s.label||s.id} up"
                                        ?disabled="${i===0}"
                                        @click="${()=>this.move(s.id,-1)}">↑</button>
                                    <button class="move" type="button" title="Move down" aria-label="Move ${s.label||s.id} down"
                                        ?disabled="${i===t.length-1}"
                                        @click="${()=>this.move(s.id,1)}">↓</button>
                                </div>
                            `})}
                        <div class="footer">
                            <button class="reset" type="button" ?disabled="${!a}" @click="${this.reset}">Reset</button>
                        </div>
                    </div>
                `:d}
            </div>
        `}};ca.styles=C`
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
    `;ui([m()],ca.prototype,"columns",2);ui([m()],ca.prototype,"scope",2);ui([$()],ca.prototype,"panelOpened",2);ui([$()],ca.prototype,"revision",2);ca=ui([k("mateu-column-chooser")],ca);var Wp=Object.defineProperty,Hp=Object.getOwnPropertyDescriptor,pi=(e,t,a,s)=>{for(var i=s>1?void 0:s?Hp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Wp(t,a,i),i};let ua=class extends S{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.totalPages=0}updated(e){super.updated(e),(e.has("totalElements")||e.has("pageSize"))&&(this.totalPages=Math.ceil(this.totalElements/this.pageSize))}dispatch(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return d;const e=this.totalPages>1,t=this.pageNumber,a=t===0,s=t>=this.totalPages-1;return o`
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
        `}};ua.styles=C`
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
    `;pi([m()],ua.prototype,"totalElements",2);pi([m()],ua.prototype,"pageSize",2);pi([m()],ua.prototype,"pageNumber",2);pi([$()],ua.prototype,"totalPages",2);ua=pi([k("mateu-pagination")],ua);var Gp=Object.defineProperty,Kp=Object.getOwnPropertyDescriptor,Ve=(e,t,a,s)=>{for(var i=s>1?void 0:s?Kp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Gp(t,a,i),i};let ke=class extends S{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;t(a?.content??[],a?.content?.length??0)},this.respondToVisibility=(e,t)=>{var a={root:document.documentElement},s=new IntersectionObserver(i=>{i.forEach(r=>{t(r.intersectionRatio>0)})},a);s.observe(e)},this.keepAsking=!1,this.askToUpper=()=>{const e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?Rs(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?o`<vaadin-card
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
                    <span slot="header-suffix" theme="badge ${Bi(e.status.type)}">${e.status.message}</span>
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
       `}};ke.styles=C`
        ${Ht}
        
        .card-container {
            display: flex; 
            width: 100%; 
            flex-wrap: wrap; 
            gap: 10px;
        }

        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }

    `;Ve([m()],ke.prototype,"id",2);Ve([m()],ke.prototype,"metadata",2);Ve([m()],ke.prototype,"baseUrl",2);Ve([m()],ke.prototype,"state",2);Ve([m()],ke.prototype,"data",2);Ve([m()],ke.prototype,"appState",2);Ve([m()],ke.prototype,"appData",2);Ve([m()],ke.prototype,"emptyStateMessage",2);Ve([$()],ke.prototype,"keepAsking",2);Ve([et("#ask-for-more")],ke.prototype,"askForMore",2);Ve([$()],ke.prototype,"hasMore",2);ke=Ve([k("mateu-card-list")],ke);var Co=(e=>(e.none="none",e.success="success",e.error="error",e.warning="warning",e.contrast="contrast",e.normal="normal",e))(Co||{}),So=(e=>(e.primary="primary",e.secondary="secondary",e.tertiary="tertiary",e.tertiaryInline="tertiaryInline",e))(So||{}),Yp=Object.defineProperty,Jp=Object.getOwnPropertyDescriptor,We=(e,t,a,s)=>{for(var i=s>1?void 0:s?Jp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Yp(t,a,i),i};const Xp={asc:"ascending",desc:"descending"};let Ce=class extends S{constructor(){super(...arguments),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this._columnPrefsRevision=0,this._prefsRevisionApplied=-1,this.search=()=>{const e=this.component.metadata;this.state={...this.state,size:e.pageSize,page:0,crud_selected_items:[]},this._syncStateToUrl(e),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}}},bubbles:!0,composed:!0}))},this.notify=e=>{ia.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.handleSearchRequested=e=>{this.state={...this.state,crud_selected_items:[]};const t=this.component.metadata;this._syncStateToUrl(t),!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}},callback:e},bubbles:!0,composed:!0}))},this.fetchMoreElements=e=>{const{params:t,callback:a}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(a)},this.directionChanged=e=>{const t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(a=>({fieldId:a.__data.path,direction:a.__data.direction?Xp[a.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForComponentId=void 0,this.evalLabel=e=>Oe(e,this.state,this.data),this.handleToolbarButtonClick=e=>{if(e==="import"){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{const t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"process-import",parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get columnPrefsScope(){return window.location.pathname}get effectiveComponent(){const e=this.component,t=e?.metadata;if(!e||!t?.columns)return e;if(this._prefsSource===e&&this._prefsRevisionApplied===this._columnPrefsRevision)return this._prefsApplied;const a=xo(this.columnPrefsScope),s=ko(t.columns,a,i=>i.metadata??{});return this._prefsApplied=s===t.columns?e:{...e,metadata:{...t,columns:s}},this._prefsSource=e,this._prefsRevisionApplied=this._columnPrefsRevision,this._prefsApplied}get columnChooserEntries(){return(this.component?.metadata?.columns??[]).map(t=>{const a=t.metadata??{},s=a.id??t.id;return s?{id:s,label:a.label??s,protected:wo(a)}:void 0}).filter(t=>!!t)}renderColumnChooser(){const e=this.columnChooserEntries;return e.filter(t=>!t.protected).length===0?d:o`
            <mateu-column-chooser
                .columns="${e}"
                .scope="${this.columnPrefsScope}"
                @column-prefs-changed="${t=>{t.stopPropagation(),this._columnPrefsRevision++}}"
            ></mateu-column-chooser>
        `}get cols(){return this.effectiveComponent?.metadata?.columns?.map(t=>t.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.component?.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":to(this.cols,this.availableWidthPx):t}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}_filterIds(e){return new Set(["searchText",...(e.filters??[]).flatMap(t=>t.stereotype==="dateRange"||t.stereotype==="numberRange"?[`${t.fieldId}_from`,`${t.fieldId}_to`]:[t.fieldId])])}_syncStateToUrl(e){const t=this._filterIds(e),a=new URLSearchParams(window.location.search);t.forEach(l=>a.delete(l)),a.delete("page"),a.delete("sort"),t.forEach(l=>{const c=this.state[l];c!=null&&c!==""&&a.set(l,String(c))});const s=this.state.page;s&&s>0&&a.set("page",String(s));const i=this.state.sort;if(i&&i.length>0){const l=i.filter(c=>c.fieldId&&c.direction).map(c=>`${c.fieldId}:${c.direction}`).join(",");l&&a.set("sort",l)}const r=a.toString(),n=r?`${window.location.pathname}?${r}`:window.location.pathname;window.location.pathname+window.location.search!==n&&history.replaceState(null,"",n)}_initStateFromUrl(e,t){const a=new URLSearchParams(window.location.search),s=this._filterIds(e),i={...t};a.forEach((l,c)=>{s.has(c)&&(i[c]=l)});const r=a.get("page");if(r!==null){const l=parseInt(r,10);!isNaN(l)&&l>0&&(i.page=l)}const n=a.get("sort");if(n){const l=n.split(",").map(c=>{const[u,h]=c.split(":");return u&&h?{fieldId:u,direction:h}:null}).filter(Boolean);l.length>0&&(i.sort=l)}return i}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}updated(e){if(super.updated(e),e.has("component")){const t=this.component?.id;if(t!==this._initializedForComponentId){this._initializedForComponentId=t;const a=this.component?.metadata,s=a.initialPage&&a.initialPage>0?a.initialPage:0;this.state=this._initStateFromUrl(a,{...this.state,size:a.pageSize,page:s,sort:[]}),(this.state.page!==s||this.state.sort?.length>0||[...this._filterIds(a)].some(r=>this.state[r]!=null))&&this.handleSearchRequested(void 0)}}}render(){const e=I=>{const L=[];return I.color&&I.color!==Co.normal&&L.push(I.color),I.buttonStyle&&L.push(I.buttonStyle===So.tertiaryInline?"tertiary-inline":I.buttonStyle),L.length?L.join(" "):void 0},t=I=>I==="back"||I==="backToList"||!!I&&I.startsWith("cancel"),a=I=>{const L=te.get()?.renderToolbarButton?.(I,this.evalLabel(I.label),()=>this.handleToolbarButtonClick(I.actionId));return L||o`
                <vaadin-button
                        data-action-id="${I.id}"
                        theme="${e(I)||d}"
                        @click="${()=>this.handleToolbarButtonClick(I.actionId)}"
                >${this.evalLabel(I.label)}</vaadin-button>
            `};if(!this.component)return o`no component`;const s=this.effectiveComponent,i=s.metadata;i.serverSideOrdering=!0;const r=i?.toolbar??[],n=r.filter(I=>t(I.actionId)),l=r.filter(I=>!t(I.actionId)),c=n.length>0&&l.length>0,u=!!i?.title||!!i?.subtitle||r.length>0,h=this.effectiveGridLayout,p=this.cols,f=$s(p),y=this.data[this.id]?.page?.content??[],x=this.state[this.component?.id]?.emptyStateMessage,P=(I,L)=>{const T=L[I.id];if(T==null)return o``;if(I.dataType==="status"){const ee=Bi(T.type);return o`<span theme="badge pill ${ee}">${T.message}</span>`}return I.dataType==="bool"?o`${T?"✓":"✗"}`:typeof T=="object"?o`${T.label??T.name??T.message??""}`:o`${T}`},q=()=>{const I=this.identifierFieldName,L=this.state._selectedId??this.appState?._splitDetailId,T=f.find(R=>R.identifier)??f[0],ee=R=>R.dataType==="action"||R.dataType==="actionGroup"||R.dataType==="menu"||R.stereotype==="button",at=f.filter(R=>R!==T&&!ee(R)),Ie=p.filter(R=>ee(R)),it=(R,se,pe)=>{R.stopPropagation(),R.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:se,parameters:{_clickedRow:pe}},bubbles:!0,composed:!0}))},ft=R=>{const se=[];for(const pe of Ie){const D=R[pe.id];if(pe.dataType==="action"){const A=D?.methodNameInCrud?D:R.action?.methodNameInCrud?R.action:{methodNameInCrud:pe.id,label:pe.label,icon:null};se.push(o`
                            <vaadin-button theme="tertiary small" title="${A.label||d}"
                                @click="${_=>it(_,"action-on-row-"+A.methodNameInCrud,R)}">
                                ${A.icon?o`<vaadin-icon icon="${A.icon}"></vaadin-icon>`:d}
                                ${A.label??d}
                            </vaadin-button>`)}else(pe.dataType==="actionGroup"||pe.dataType==="menu")&&(D?.actions??[]).forEach(_=>se.push(o`
                            <vaadin-button theme="tertiary small" title="${_.label||d}"
                                @click="${M=>it(M,"action-on-row-"+_.methodNameInCrud,R)}">
                                ${_.icon?o`<vaadin-icon icon="${_.icon}"></vaadin-icon>`:d}
                                ${_.label??d}
                            </vaadin-button>`))}return se.length?o`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${se}
                    </div>`:d};return o`
                <vaadin-list-box style="width: 100%;">
                    ${y.length===0?o`<vaadin-item disabled>${aa(x)}</vaadin-item>`:d}
                    ${y.map(R=>o`
                        <vaadin-item
                            ?selected="${I&&L!==void 0&&String(R[I])===String(L)}"
                            @click="${()=>{I&&R[I]!==void 0&&(this.state={...this.state,_selectedId:String(R[I])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:R},bubbles:!0,composed:!0}))}}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${T?R[T.id]??"":""}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${at.map(se=>o`<span>${se.label}: ${P(se,R)}</span>`)}
                            </div>
                            ${ft(R)}
                        </vaadin-item>
                    `)}
                </vaadin-list-box>`},ae=(I,L,T)=>{const ee=this.identifierFieldName;ee&&T[ee]!==void 0&&(this.state={...this.state,_selectedId:String(T[ee])}),I.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:L,parameters:T},bubbles:!0,composed:!0}))},N=()=>{const I=this.identifierFieldName,L=this.state._selectedId??this.appState?._splitDetailId,T=p.slice(0,6),ee=T.filter(_=>_.stereotype==="image"),at=T.find(_=>_.identifier)??T[0],Ie=_=>!!_.actionId,it=_=>_.dataType==="action"||_.dataType==="actionGroup"||_.dataType==="menu"||_.stereotype==="button",ft=T.find(_=>_.id==="select"&&_.dataType==="action"),R=!!ft,se=T.filter(_=>_!==at&&!ee.includes(_)&&!Ie(_)&&!it(_)),pe=T.filter(_=>it(_)&&!(R&&_===ft)),D=(_,M,be)=>{_.stopPropagation(),_.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:M,parameters:{_clickedRow:be}},bubbles:!0,composed:!0}))},A=_=>{const M=[];for(const be of pe){const ea=_[be.id];if(be.dataType==="action"){const bt=ea?.methodNameInCrud?ea:_.action?.methodNameInCrud?_.action:{methodNameInCrud:be.id,label:be.label,icon:null};M.push(o`
                            <vaadin-button theme="tertiary" title="${bt.label||d}"
                                @click="${gt=>D(gt,"action-on-row-"+bt.methodNameInCrud,_)}">
                                ${bt.icon?o`<vaadin-icon icon="${bt.icon}"></vaadin-icon>`:d}
                                ${bt.label??d}
                            </vaadin-button>`)}else(be.dataType==="actionGroup"||be.dataType==="menu")&&(ea?.actions??[]).forEach(gt=>M.push(o`
                            <vaadin-button theme="tertiary" title="${gt.label||d}"
                                @click="${is=>D(is,"action-on-row-"+gt.methodNameInCrud,_)}">
                                ${gt.icon?o`<vaadin-icon icon="${gt.icon}"></vaadin-icon>`:d}
                                ${gt.label??d}
                            </vaadin-button>`))}return M.length?o`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${M}
                    </div>`:d};return o`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${y.length===0?o`<div style="grid-column: 1 / -1;">${aa(x)}</div>`:d}
                    ${y.map(_=>o`
                        <vaadin-card
                            clickable
                            ?data-selected="${I&&L!==void 0&&String(_[I])===String(L)}"
                            style="cursor: pointer;"
                            @click="${M=>R?D(M,"action-on-row-select",_):ae(M.target,"view",_)}"
                        >
                            ${ee.length?o`<img slot="media" src="${_[ee[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover;" />`:d}
                            ${at?o`<div slot="title">${_[at.id]??""}</div>`:d}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${se.map(M=>o`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${M.label}</span>
                                        <span>${P(M,_)}</span>
                                    </div>
                                `)}
                            </div>
                            ${A(_)}
                        </vaadin-card>
                    `)}
                </div>`},ne=()=>{const I=f.find(T=>T.identifier)??f[0],L=f.filter(T=>T!==I);return o`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <vaadin-list-box style="width: 100%;">
                            ${y.length===0?o`<vaadin-item disabled>${aa(x)}</vaadin-item>`:d}
                            ${y.map(T=>o`
                                <vaadin-item
                                    ?selected="${this.selectedItem===T}"
                                    @click="${()=>{this.selectedItem=T}}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${I?T[I.id]??"":""}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${L.map(ee=>o`${P(ee,T)} `)}
                                    </div>
                                </vaadin-item>
                            `)}
                        </vaadin-list-box>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?o`
                            <vaadin-form-layout>
                                ${p.map(T=>o`
                                    <vaadin-text-field
                                        label="${T.label}"
                                        .value="${String(this.selectedItem[T.id]??"")}"
                                        readonly
                                    ></vaadin-text-field>
                                `)}
                            </vaadin-form-layout>
                        `:o`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},ue=()=>{const I=this.identifierFieldName,L=this.state._selectedId??this.appState?._splitDetailId,T=p[0],ee=p.slice(1),at=!!T?.actionId,Ie=D=>(D??[]).map(A=>{const _=Array.isArray(A.children)?A.children:[];return _.length>0?{...A,children:Ie(_)}:{...A,children:void 0}}),it=Ie(y),ft=(D,A)=>{const _=D.parentItem?D.parentItem.children??[]:it;A(_,_.length)},R=(D,A)=>{for(const _ of D??[]){if(I&&String(_[I])===A)return _;const M=R(_.children,A);if(M)return M}},se=I&&L!==void 0?R(it,String(L)):void 0,pe=(D,A,_)=>{D.stopPropagation(),I&&A[I]!==void 0&&(this.state={...this.state,_selectedId:String(A[I])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:_,parameters:A},bubbles:!0,composed:!0}))};return o`
                <vaadin-grid
                    style="width: 100%;"
                    all-rows-visible
                    .itemHasChildrenPath="${"children"}"
                    .itemIdPath="${I??"id"}"
                    .dataProvider="${ft}"
                    .selectedItems="${se?[se]:[]}"
                >
                    ${T?o`<vaadin-grid-tree-column path="${T.id}" header="${T.label??d}" flex-grow="1"></vaadin-grid-tree-column>`:d}
                    ${at?o`
                    <vaadin-grid-column width="6rem" flex-grow="0" text-align="end" ${wt(D=>D?.viewable===!1?d:o`
                        <vaadin-button theme="tertiary small" @click="${A=>pe(A,D,"view")}">View</vaadin-button>
                    `,[])}></vaadin-grid-column>`:d}
                    ${ee.map(D=>D.id==="select"?o`<vaadin-grid-column width="7rem" flex-grow="0" text-align="end" header="${D.label??d}" ${wt(A=>o`
                            <vaadin-button theme="tertiary small" @click="${_=>{_.stopPropagation(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-select",parameters:{_clickedRow:A}},bubbles:!0,composed:!0}))}}">Select</vaadin-button>
                        `,[])}></vaadin-grid-column>`:o`<vaadin-grid-column path="${D.id}" header="${D.label??d}" auto-width></vaadin-grid-column>`)}
                    <span slot="empty-state">${aa(x)}</span>
                </vaadin-grid>`},ie=te.get()?.rendersCrudLayouts?.()===!0,K=o`
            ${i.infiniteScrolling?o`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:d}
            ${!ie&&h==="list"?q():!ie&&h==="cards"?i.contentHeight?o`
                <vaadin-scroller style="width: 100%; height: ${i.contentHeight};">
                    ${N()}
                </vaadin-scroller>
            `:N():!ie&&h==="masterDetail"?ne():!ie&&h==="tree"?ue():te.get()?.renderTableComponent(this,s,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,Z=i.infiniteScrolling?d:te.get()?.renderPagination(this,this.component),fe=o`
            <vaadin-dialog
                .opened="${this.showImportDialog}"
                header-title="Import"
                @opened-changed="${I=>{this.showImportDialog=I.detail.value}}"
                ${Mi(()=>o`
                    <vaadin-upload
                        target="/upload"
                        max-files="1"
                        @upload-success="${this.handleImportUploadSuccess}"
                    ></vaadin-upload>
                `,[this.showImportDialog])}
                ${Cs(()=>o`
                    <vaadin-button @click="${()=>{this.showImportDialog=!1}}">Cancel</vaadin-button>
                `,[])}
            ></vaadin-dialog>
        `;return this.standalone?o`
                ${fe}
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
                    <div style="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);">
                        <div style="flex: 1; min-width: 0;">${te.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                        ${this.renderColumnChooser()}
                    </div>
                    <div style="flex: 1; overflow-y: auto; min-height: 0;">${K}</div>
                    <div style="flex-shrink: 0;">${Z}</div>
                </div>
            `:o`
            ${fe}
            ${u?o`
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m, 1rem);">
                        <div style="flex: 1; min-width: 0;">
                            ${i?.title?o`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(i.title)}</h2>
                            `:d}
                            ${i?.subtitle?o`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(i.subtitle)}</span>
                            `:d}
                        </div>
                        ${n.map(I=>a(I))}
                        ${c?o`<span class="toolbar-divider"></span>`:d}
                        ${l.map(I=>a(I))}
                        <slot></slot>
                    </div>
                `:d}
            <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); padding: var(--lumo-space-m); display: flex; flex-direction: column;">
                <div style="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);">
                    <div style="flex: 1; min-width: 0;">${te.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                    ${this.renderColumnChooser()}
                </div>
                <div style="flex: 1; overflow-y: auto; min-height: 0;">${K}</div>
                <div style="flex-shrink: 0;">${Z}</div>
            </div>
        `}createRenderRoot(){return te.mustUseShadowRoot()?super.createRenderRoot():this}};Ce.styles=C`
        ${Ht}
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
    `;We([m()],Ce.prototype,"component",2);We([m()],Ce.prototype,"baseUrl",2);We([m({type:Boolean})],Ce.prototype,"standalone",2);We([m()],Ce.prototype,"state",2);We([m()],Ce.prototype,"data",2);We([m()],Ce.prototype,"appState",2);We([m()],Ce.prototype,"appData",2);We([$()],Ce.prototype,"showImportDialog",2);We([$()],Ce.prototype,"availableWidthPx",2);We([$()],Ce.prototype,"selectedItem",2);We([$()],Ce.prototype,"_columnPrefsRevision",2);Ce=We([k("mateu-table-crud")],Ce);var Qp=Object.defineProperty,Zp=Object.getOwnPropertyDescriptor,es=(e,t,a,s)=>{for(var i=s>1?void 0:s?Zp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Qp(t,a,i),i};let Ea=class extends S{constructor(){super(...arguments),this.notificationOpened=!1,this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1,this.error=e.detail.reason,this.openNotification()},this.openNotification=()=>{this.notificationOpened=!0},this.closeNotification=()=>{this.notificationOpened=!1},this.notificationRenderer=()=>o`
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
                ${$r(this.notificationRenderer,[])}
        ></vaadin-notification>`}};Ea.styles=C`
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
  `;es([$()],Ea.prototype,"loading",2);es([$()],Ea.prototype,"notificationOpened",2);es([$()],Ea.prototype,"error",2);Ea=es([k("mateu-api-caller")],Ea);var eh=Object.defineProperty,th=Object.getOwnPropertyDescriptor,mt=(e,t,a,s)=>{for(var i=s>1?void 0:s?th(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&eh(t,a,i),i};let Fe=class extends S{constructor(){super(...arguments),this.message="This website uses cookies.",this.dismiss="Ok. Thanks :).",this.learnMore="Learn more",this.learnMoreLink="https://cookiesandyou.com/",this.showLearnMore=!0,this.position="top",this.cookieName="mateu-cookieconsent"}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement("style"),this._css.innerText=".cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}",document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){const e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){const e=this.popup;e&&(e.classList.remove("cc-invisible"),e.style.display="")}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:"#000"},button:{background:"rgba(22, 118, 243, 0.95)",hover:"rgba(22, 118, 243, 1)"}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});const e=this.popup;if(e){e.setAttribute("role","alert");const t=e.querySelector("a.cc-btn");t?.addEventListener("keydown",a=>{const r=a.keyCode||a.which;(r===32||r===13)&&t.click()})}}render(){return o`
       `}};Fe.styles=C`
  `;mt([m()],Fe.prototype,"message",2);mt([m()],Fe.prototype,"dismiss",2);mt([m()],Fe.prototype,"learnMore",2);mt([m()],Fe.prototype,"learnMoreLink",2);mt([m()],Fe.prototype,"showLearnMore",2);mt([m()],Fe.prototype,"position",2);mt([m()],Fe.prototype,"cookieName",2);mt([$()],Fe.prototype,"_css",2);mt([et('[aria-label="cookieconsent"]')],Fe.prototype,"popup",2);Fe=mt([k("mateu-cookie-consent")],Fe);var ah=Object.defineProperty,ih=Object.getOwnPropertyDescriptor,Io=(e,t,a,s)=>{for(var i=s>1?void 0:s?ih(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&ah(t,a,i),i};let Di=class extends S{constructor(){super(...arguments),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener("value-changed",this.redispatchEvent),this.addEventListener("data-changed",this.redispatchEvent),this.addEventListener("action-requested",this.redispatchEvent),this.addEventListener("server-side-action-requested",this.redispatchEvent),this.addEventListener("route-changed",this.redispatchEvent),this.addEventListener("close-modal-requested",this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("value-changed",this.redispatchEvent),this.removeEventListener("data-changed",this.redispatchEvent),this.removeEventListener("action-requested",this.redispatchEvent),this.removeEventListener("server-side-action-requested",this.redispatchEvent),this.removeEventListener("route-changed",this.redispatchEvent)}render(){return o`<slot></slot>`}};Di.styles=C`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `;Io([m()],Di.prototype,"target",2);Di=Io([k("mateu-event-interceptor")],Di);var sh=Object.defineProperty,rh=Object.getOwnPropertyDescriptor,_o=(e,t,a,s)=>{for(var i=s>1?void 0:s?rh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&sh(t,a,i),i};let Ni=class extends Zt{constructor(){super(...arguments),this.opened=!0,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),500)}}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}render(){const e=this.component.metadata;let t="";e.noPadding&&(t+=" no-padding");const a=Ui(e.headerTitle,this.state,this.data,this.appState,this.appData);return o`
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
                ${e.header||e.closeButtonOnHeader?Uo(()=>o`<mateu-event-interceptor .target="${this}" style="width: 100%;">${e.header?w(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):d}${e.closeButtonOnHeader?o`
                            <vaadin-button theme="tertiary" @click="${this.close}">
                                <vaadin-icon icon="lumo:cross"></vaadin-icon>
                            </vaadin-button>
                        `:d}</mateu-event-interceptor>`,[this.state,this.data]):d}
                ${e.footer?Cs(()=>o`<mateu-event-interceptor .target="${this}" style="width: 100%;">${w(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):d}
                ${e.content?Mi(()=>o`<mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${w(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):d}
                style="${this.component?.style}" 
                class="${this.component?.cssClasses}"
        >
        </vaadin-dialog>

       `}};Ni.styles=C`
  `;_o([$()],Ni.prototype,"opened",2);Ni=_o([k("mateu-dialog")],Ni);var oh=Object.defineProperty,nh=Object.getOwnPropertyDescriptor,Eo=(e,t,a,s)=>{for(var i=s>1?void 0:s?nh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&oh(t,a,i),i};let Fi=class extends Zt{constructor(){super(...arguments),this.opened=!1,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),300)},this._escListener=e=>{if(e.key!=="Escape")return;const a=this.getRootNode().querySelectorAll("mateu-drawer, mateu-dialog");a[a.length-1]===this&&(e.stopPropagation(),this.close())}}firstUpdated(){requestAnimationFrame(()=>this.opened=!0)}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._escListener)}disconnectedCallback(){document.removeEventListener("keydown",this._escListener),super.disconnectedCallback()}render(){const e=this.component.metadata,t=e.position??"end",a=Ui(e.headerTitle,this.state,this.data,this.appState,this.appData);return o`
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
                    <mateu-event-interceptor .target="${this}">${w(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:d}
                <button class="drawer-close" aria-label="Close" @click="${this.close}">✕</button>
            </header>
            <div class="content ${e.noPadding?"no-padding":""}">
                ${e.content?o`
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${w(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:d}
            </div>
            ${e.footer?o`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${w(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                </footer>
            `:d}
        </section>
       `}};Fi.styles=C`
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
  `;Eo([$()],Fi.prototype,"opened",2);Fi=Eo([k("mateu-drawer")],Fi);var lh=Object.defineProperty,dh=Object.getOwnPropertyDescriptor,Se=(e,t,a,s)=>{for(var i=s>1?void 0:s?dh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&lh(t,a,i),i};function pr(e){if(e.parentElement)return e.parentElement;const t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}let ce=class extends S{constructor(){super(...arguments),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type==="keydown"){const t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{const t=e.detail,a=t.banners??[],s=t.append??!1;s?this.actionBanners=[...this.actionBanners,...a]:(this._clearActionBannerTimers(),this.actionBanners=a);const i=s?this.actionBanners.length-a.length:0;a.forEach((r,n)=>{if(r.timeoutSeconds&&r.timeoutSeconds>0){const l=i+n;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((c,u)=>u!==l)},r.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;const t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;const a=parseInt(t[1],10)-1;a>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(a))},this._onScrollSpy=()=>{if(this._tocLocked)return;const e=this._sectionCards();if(!e.length)return;const t=12,a=this.shadowRoot?.querySelector("mateu-content-header");let s=a?a.getBoundingClientRect().bottom:0;for(const n of e){if(!n.classList.contains("mateu-section--sticky"))continue;const l=n.getBoundingClientRect();l.top<=s+t+2&&(s=Math.max(s,l.bottom))}const i=s+t+4;let r=0;this._tocEntries.forEach((n,l)=>{n.el.getBoundingClientRect().top<=i&&(r=l)}),this._activeToc=r}}connectedCallback(){super.connectedCallback(),document.addEventListener("page-banners-received",this._bannersHandler),window.addEventListener("resize",this._onResize),document.addEventListener("keydown",this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("page-banners-received",this._bannersHandler),window.removeEventListener("resize",this._onResize),document.removeEventListener("keydown",this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy()}updated(e){super.updated(e),e.has("component")&&e.get("component")!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has("component")&&(this._scheduleStaticBannerTimeouts(),this.dispatchEvent(new CustomEvent("compact-changed",{detail:{compact:!!this.component?.style?.includes("--mateu-compact:1")},bubbles:!0,composed:!0})),this._scheduleTocRebuild())}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(a=>clearTimeout(a)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((a,s)=>{a.timeoutSeconds&&a.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,s])},a.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,a)=>a!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){const t=e.theme?.toLowerCase()??"info";return t==="none"?"":t}_evalBannerText(e){return Oe(e,this.state,this.data)}_renderBanner(e,t){const a=this._evalBannerText(e.title),s=this._evalBannerText(e.description);return o`
            <div class="page-banner page-banner--${this.bannerThemeClass(e)}">
                ${a||e.hasCloseButton?o`
                    <div style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span style="font-weight: 600;">${a??""}</span>
                        ${e.hasCloseButton?o`
                            <button class="banner-close" @click=${t} title="Dismiss" aria-label="Dismiss">✕</button>
                        `:d}
                    </div>
                `:d}
                ${s?o`<p>${s}</p>`:d}
            </div>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll(".mateu-section"))}_sectionTitle(e){const t=e.querySelector('[slot="title"]')?.textContent?.trim();return t||e.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()||void 0}_rebuildToc(){const e=this._sectionCards(),t=e.map(r=>({title:this._sectionTitle(r),el:r})).filter(r=>!!r.title),a=this.component?.metadata?.toc,s=t.length>4&&e.every(r=>!r.closest("vaadin-horizontal-layout")),i=(a===!0?!0:a===!1?!1:s)&&t.length>0;this._tocEntries=t,this._tocVisible=i,this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),i?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){const e=this.shadowRoot?.querySelector("mateu-content-header");this._headerH=this._tocVisible&&e?e.offsetHeight:0,this.style.setProperty("--mateu-header-h",this._headerH+"px");const t=12;let a=this._headerH+t;for(const s of this._sectionCards())s.classList.contains("mateu-section--sticky")&&(s.style.top=a+"px",a+=s.offsetHeight+t)}_scrollContainer(){let e=pr(this);for(;e;){const t=getComputedStyle(e).overflowY;if((t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight)return e;e=pr(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener("scroll",this._onScrollSpy,{passive:!0}),window.addEventListener("wheel",this._unlockToc,{passive:!0}),window.addEventListener("touchstart",this._unlockToc,{passive:!0}),window.addEventListener("keydown",this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener("scroll",this._onScrollSpy),window.removeEventListener("wheel",this._unlockToc),window.removeEventListener("touchstart",this._unlockToc),window.removeEventListener("keydown",this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){const t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;const a=12;let s=this._headerH+a;for(const l of this._sectionCards()){if(l===t.el)break;l.classList.contains("mateu-section--sticky")&&(s+=l.offsetHeight+a)}const i=this._scrollContainer(),r=i?i.getBoundingClientRect().top:0,n=t.el.getBoundingClientRect().top-r-s;(i??window).scrollBy({top:n,behavior:"smooth"})}render(){const e=this.component?.metadata,s=[...(e?.banners??[]).map((r,n)=>({banner:r,index:n})).filter(({index:r})=>!this.dismissedStaticBannerIndices.has(r)).map(({banner:r,index:n})=>({banner:r,onDismiss:()=>this._dismissStaticBanner(n)})),...this.actionBanners.map((r,n)=>({banner:r,onDismiss:()=>this._dismissActionBanner(n)}))],i=o`
            <mateu-content-header
                class="${this._tocVisible?"sticky-header":""}"
                .metadata="${e}"
                .baseUrl="${this.baseUrl}"
                .state="${this.state}"
                .data="${this.data}"
                .appState="${this.appState}"
                .appData="${this.appData}"
            ></mateu-content-header>
            ${s.length>0?o`
                <div class="page-banners">
                    ${s.map(({banner:r,onDismiss:n})=>this._renderBanner(r,n))}
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
                ${e?.footer?.map(r=>w(this,r,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `;return o`<div style="display: flex; flex-direction: column; width: 100%;">${i}</div>`}};ce.styles=C`
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
    `;Se([m()],ce.prototype,"component",2);Se([m()],ce.prototype,"baseUrl",2);Se([m()],ce.prototype,"state",2);Se([m()],ce.prototype,"data",2);Se([m()],ce.prototype,"appState",2);Se([m()],ce.prototype,"appData",2);Se([m()],ce.prototype,"value",2);Se([m({type:Boolean})],ce.prototype,"standalone",2);Se([$()],ce.prototype,"actionBanners",2);Se([$()],ce.prototype,"dismissedStaticBannerIndices",2);Se([$()],ce.prototype,"_tocEntries",2);Se([$()],ce.prototype,"_activeToc",2);Se([$()],ce.prototype,"_tocVisible",2);ce=Se([k("mateu-page")],ce);const ts=C`
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
`,Na=e=>J`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,qs=Na(J`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),Us=Na(J`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),Bs=Na(J`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`),ch=Na(J`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`),uh=Na(J`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`),ph=Na(J`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`);var hh=Object.defineProperty,mh=Object.getOwnPropertyDescriptor,X=(e,t,a,s)=>{for(var i=s>1?void 0:s?mh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&hh(t,a,i),i};const hr=["#e91e63","#1676f3","#10b981","#8b5cf6","#f59e0b","#ef4444"],vh=e=>hr[Math.abs(e??0)%hr.length],fh=e=>(e??"?").split(/\s+/).filter(t=>t).map(t=>t[0]).slice(0,2).join("").toUpperCase()||"?";let H=class extends S{constructor(){super(...arguments),this.localAgentUrl="http://127.0.0.1:8776",this.localAgentAlive=!1,this.menu=[],this.chatSessionId=ye(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onSpeechResult=e=>{if(this.recognition){const t=e,a=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=a,this.send(new CustomEvent("submit",{detail:{value:a},bubbles:!0,composed:!0})))}},this.probeLocalAgent=async()=>{if(this.localAgentUrl)try{const e=new AbortController,t=setTimeout(()=>e.abort(),1200),a=await fetch(this.localAgentUrl+"/health",{signal:e.signal});clearTimeout(t),this.localAgentAlive=a.ok}catch{this.localAgentAlive=!1}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{const t=e.target,a=Array.from(t.files??[]);if(t.value="",!(!a.length||!this.uploadUrl)){this.uploading=!0;try{const s=new FormData;s.append("sessionId",this.chatSessionId);for(const h of a)s.append("files",h,h.name);const i={},r=localStorage.getItem("__mateu_auth_token");r&&(i.Authorization="Bearer "+r);const n=sessionStorage.getItem("__mateu_sesion_id");n&&(i["X-Session-Id"]=n);const l=await fetch(this.uploadUrl,{method:"POST",headers:i,body:s});if(!l.ok)throw new Error(`Upload failed: ${l.status}`);const u=((await l.json()).files??[]).filter(h=>h&&h.path);this.attachments=[...this.attachments,...u]}catch(s){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${s instanceof Error?s.message:s}`,"agent")}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async e=>{this.messageInputElement?.setAttribute("disabled","disabled");const t=e.detail.value.trim(),a=this.localAgentAlive?this.localAgentUrl+"/mateu/agent/stream":this.sseUrl,s=this.attachments;if(!t&&s.length===0||!a)return;const i=s.length?`${t}${t?`

`:""}📎 ${s.map(l=>l.name).join(", ")}`:t;this.addMessage(i,"user"),this.attachments=[];const r=this.addMessage("","agent");this.startLoading();let n="";try{const l={Accept:"text/event-stream","Content-Type":"application/json"},c=localStorage.getItem("__mateu_auth_token");c&&(l.Authorization="Bearer "+c);const u=sessionStorage.getItem("__mateu_sesion_id");u&&(l["X-Session-Id"]=u);const h=this.contextProvider?.(),p=JSON.stringify({message:t,sessionId:this.chatSessionId,...s.length&&{attachments:s},...h!=null&&{context:h},...this.mcpUrl&&{mcpUrl:new URL(this.mcpUrl,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;const f=await fetch(a,{method:"POST",headers:l,body:p});if(!f.ok){const P=await f.text();throw new Error(`Servidor respondió ${f.status}: ${P}`)}const g=f.body?.getReader();if(!g)throw new Error("No se pudo obtener el reader del stream.");const y=new TextDecoder;let x="";for(;;){const{done:P,value:q}=await g.read();if(P){if(x.trim().startsWith("data:")){const ue=x.trim().slice(5).trim(),ie=this.tryParseTokenUsage(ue),K=!ie&&this.tryParseCustomEvent(ue);ie?this.tokenUsage={...this.tokenUsage,...ie}:K?K.event==="agent-error"?(n="⚠️ "+(K.detail?.message??"Error desconocido del agente"),this.updateMessage(r,n)):this.dispatchEvent(new CustomEvent(K.event,{detail:K.detail,bubbles:!0,composed:!0})):(n+=ue,this.updateMessage(r,n))}break}const ae=y.decode(q,{stream:!0});x+=ae;const N=x.split(`
`);x=N.pop()||"";let ne=!1;for(const ue of N)if(ue.trim().startsWith("data:")){const ie=ue.trim().slice(5).trim(),K=this.tryParseTokenUsage(ie),Z=!K&&this.tryParseCustomEvent(ie);K?this.tokenUsage={...this.tokenUsage,...K}:Z?Z.event==="agent-error"?(n="⚠️ "+(Z.detail?.message??"Error desconocido del agente"),this.updateMessage(r,n)):this.dispatchEvent(new CustomEvent(Z.event,{detail:Z.detail,bubbles:!0,composed:!0})):(n+=ie+`
`,ne=!0)}ne&&this.updateMessage(r,n)}n||this.updateMessage(r,"⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).")}catch(l){console.error("Error en el flujo SSE:",l);const c=l?.message??String(l);(c==="Failed to fetch"||c==="network error"||c==="Load failed")&&!n?this.updateMessage(r,"⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible."):this.updateMessage(r,"⚠️ Error: "+c)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value="")},250),this.messageInputElement?.removeAttribute("disabled"),this.messageInputElement?.focus()}},this.closeChat=()=>{this.dispatchEvent(new CustomEvent("close-requested",{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{const e=this.messageInputElement?.value?.trim()??"";e&&this.send(new CustomEvent("submit",{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key==="Enter"&&(e.preventDefault(),this.submitFromInput())}}connectedCallback(){super.connectedCallback(),this.probeLocalAgent();const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){const t=new e;this.recognition=t,t.lang="es-ES",t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=a=>{console.error("Error de reconocimiento: "+a.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:"smooth"})},0)}addMessage(e,t){const a={text:e,time:new Date().toLocaleTimeString(),userName:t.includes("agent")?"Asistente":"Tú",userColorIndex:t.includes("agent")?2:1};return this.items=[...this.items,a],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((a,s)=>s===e?{...a,text:t}:a),this.scrollBottom()}tryParseCustomEvent(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const a=JSON.parse(t);if(typeof a.event=="string")return{event:a.event,detail:a.detail??{}}}catch{}return null}tryParseTokenUsage(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const a=JSON.parse(t);if("inputTokens"in a||"outputTokens"in a||"totalTokens"in a)return a}catch{}return null}buildMenuContext(e,t=[]){const a=[];for(const s of e){if(s.separator||s.remote)continue;const i=[...t,s.label];if(s.submenus&&s.submenus.length>0)a.push(...this.buildMenuContext(s.submenus,i));else{const r={path:i,navigation:{route:s.route,consumedRoute:s.consumedRoute,actionId:s.actionId??"",baseUrl:s.baseUrl,serverSideType:s.serverSideType,uriPrefix:s.uriPrefix}};s.description&&(r.description=s.description),a.push(r)}}return a}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}render(){return o`
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
                        ${ph}
                    </button>
                </div>
                <div class="scroll-container">
                    <div class="message-list" role="list">
                        ${this.items.map(e=>o`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${vh(e.userColorIndex)};">${fh(e.userName)}</div>
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
                    >${uh}</button>
                    <input class="msg-input"
                           placeholder="Message"
                           aria-label="Message"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">Send</button>
                </div>
            </div>
        `}};H.styles=[ts,C`
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
    `];X([m({attribute:!1})],H.prototype,"contextProvider",2);X([m()],H.prototype,"localAgentUrl",2);X([m({attribute:!1})],H.prototype,"mcpUrl",2);X([$()],H.prototype,"localAgentAlive",2);X([m()],H.prototype,"sseUrl",2);X([m()],H.prototype,"uploadUrl",2);X([m({attribute:!1})],H.prototype,"menu",2);X([$()],H.prototype,"attachments",2);X([$()],H.prototype,"uploading",2);X([et(".file-input")],H.prototype,"fileInputElement",2);X([m({type:Boolean,reflect:!0})],H.prototype,"expanded",2);X([m()],H.prototype,"items",2);X([et(".scroll-container")],H.prototype,"scrollContainer",2);X([et(".msg-input")],H.prototype,"messageInputElement",2);X([$()],H.prototype,"recognition",2);X([$()],H.prototype,"listening",2);X([$()],H.prototype,"recognitionAvailable",2);X([$()],H.prototype,"loading",2);X([$()],H.prototype,"elapsedSeconds",2);X([$()],H.prototype,"tokenUsage",2);H=X([k("mateu-chat")],H);var bh=Object.defineProperty,gh=Object.getOwnPropertyDescriptor,hi=(e,t,a,s)=>{for(var i=s>1?void 0:s?gh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&bh(t,a,i),i};let pa=class extends S{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.data&&this.createChart(this.data)}async createChart(e){const[{default:t}]=await Promise.all([Te(()=>import("./vendor-chartjs.js").then(s=>s.a),[]),Te(()=>import("./vendor-chartjs.js").then(s=>s.c),[])]);if(e!==this.data)return;this.chart&&this.chart.destroy();const a={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,a)}handleSlotChange(){}render(){return o`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};pa.styles=C`
  `;hi([m()],pa.prototype,"type",2);hi([m()],pa.prototype,"data",2);hi([m()],pa.prototype,"options",2);hi([et("#chart")],pa.prototype,"chartElement",2);pa=hi([k("mateu-chart")],pa);var $h=Object.defineProperty,yh=Object.getOwnPropertyDescriptor,Vs=(e,t,a,s)=>{for(var i=s>1?void 0:s?yh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&$h(t,a,i),i};let ti=class extends S{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){const{default:t}=await Te(async()=>{const{default:s}=await import("./vendor-diagrams.js").then(i=>i.i);return{default:s}},__vite__mapDeps([5,3,1,2,4]));if(e!==this.xml)return;this.chart&&this.chart.destroy();const a={container:this.divElement};this.chart=new t(a),this.chart.importXML(e)}handleSlotChange(){}render(){return o`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};ti.styles=C`
  `;Vs([m()],ti.prototype,"xml",2);Vs([et("#canvas")],ti.prototype,"divElement",2);ti=Vs([k("mateu-bpmn")],ti);var xh=Object.defineProperty,wh=Object.getOwnPropertyDescriptor,Fa=(e,t,a,s)=>{for(var i=s>1?void 0:s?wh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&xh(t,a,i),i};const ps=160,st=56,kh=220,mr=110,zt=60,Ch={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},Sh={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},Ih=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];function _h(){return"step-"+Math.random().toString(36).slice(2,8)}let Wt=class extends S{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.wf={name:"New Workflow",steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value")){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){const e=this.wf.steps??[],t={};e.forEach(n=>{t[n.id]=0});let a=!0;for(;a;)a=!1,e.forEach(n=>{if(n.preconditionStepId!=null&&t[n.preconditionStepId]!==void 0){const l=t[n.preconditionStepId]+1;l>t[n.id]&&(t[n.id]=l,a=!0)}});const s={};e.forEach(n=>{const l=t[n.id]??0;(s[l]??=[]).push(n.id)});const i={...this.positions};let r=!1;Object.entries(s).forEach(([n,l])=>{const c=Number(n);l.forEach((u,h)=>{i[u]||(i[u]={x:zt+c*kh,y:zt+h*mr},r=!0)})}),r&&(this.positions=i)}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addStep(){const e=_h(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(i=>i.y),s=a.length?Math.max(...a)+mr:zt;this.positions={...this.positions,[e]:{x:zt,y:s}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(s=>s.id!==e).map(s=>s.preconditionStepId===e?{...s,preconditionStepId:void 0}:s)};const{[e]:t,...a}=this.positions;this.positions=a,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},s=this.toSvgPoint(e);this.dragOffset={x:s.x-a.x,y:s.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(s=>s.x))+ps+zt:600,a=e.length?Math.max(...e.map(s=>s.y))+st+zt:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return o`
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
        `}renderToolbar(){const e=this.wf.status??"DRAFT";return o`
            <div class="toolbar">
                <span class="wf-name">${this.wf.name}</span>
                <span class="badge badge-${e.toLowerCase()}">${e}</span>
                <div style="flex:1"></div>
                <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                    ${qs}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${Us}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Bs}
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
        `}renderArrow(e){if(!e.preconditionStepId)return J``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return J``;const s=t.x+ps,i=t.y+st/2,r=a.x,n=a.y+st/2,l=(s+r)/2;return J`
            <path d="M${s},${i} C${l},${i} ${l},${n} ${r},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:zt,y:zt},a=Ch[e.type]??"#64748b",s=Sh[e.type]??"•",i=this.selectedId===e.id;return J`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${r=>this.onNodeMouseDown(r,e.id)}"
               @click="${r=>{r.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${ps}" height="${st}" rx="8"
                      fill="white"
                      stroke="${i?a:"#e2e8f0"}"
                      stroke-width="${i?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${st}" rx="8" fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${st}" fill="${a}"/>
                <text x="16" y="${st/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${s}</text>
                <!-- name -->
                <text x="44" y="${st/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+"…":e.name}
                </text>
                <text x="44" y="${st/2+8}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${st/2+20}" font-size="9" fill="${a}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(s=>s.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(s=>s.id!==e.id),a=(s,i)=>o`
            <div class="field">
                <label class="field-label">${s}</label>
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
                        @change="${s=>this.updateStep(e.id,{name:s.target.value})}"/>`)}
                    ${a("Type",o`
                        <select class="inp" @change="${s=>this.updateStep(e.id,{type:s.target.value})}">
                            ${Ih.map(s=>o`<option value="${s}" ?selected="${e.type===s}">${s}</option>`)}
                        </select>`)}
                    ${a("Description",o`<textarea class="inp" rows="2"
                        @change="${s=>this.updateStep(e.id,{description:s.target.value})}">${e.description??""}</textarea>`)}
                    ${a("Precondition step",o`
                        <select class="inp" @change="${s=>this.updateStep(e.id,{preconditionStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>o`<option value="${s.id}" ?selected="${e.preconditionStepId===s.id}">${s.name} (${s.id})</option>`)}
                        </select>`)}
                    ${a("Precondition expression",o`<input class="inp" placeholder="JEXL expression"
                        .value="${e.preconditionExpression??""}"
                        @change="${s=>this.updateStep(e.id,{preconditionExpression:s.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}"
                               @change="${s=>this.updateStep(e.id,{parallel:s.target.checked})}"/>
                    </div>
                    ${a("Timeout (ms)",o`<input class="inp" type="number" min="0"
                        .value="${String(e.timeout??0)}"
                        @change="${s=>this.updateStep(e.id,{timeout:Number(s.target.value)})}"/>`)}
                    ${a("Retries",o`<input class="inp" type="number" min="0"
                        .value="${String(e.retries??0)}"
                        @change="${s=>this.updateStep(e.id,{retries:Number(s.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}"
                               @change="${s=>this.updateStep(e.id,{rollbackable:s.target.checked})}"/>
                    </div>
                    ${e.rollbackable?a("Compensation step",o`
                        <select class="inp" @change="${s=>this.updateStep(e.id,{compensationStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>o`<option value="${s.id}" ?selected="${e.compensationStepId===s.id}">${s.name} (${s.id})</option>`)}
                        </select>`):""}

                    ${e.type==="ACTION"?a("Topic",o`<input class="inp" placeholder="kafka.topic.name"
                        .value="${e.topic??""}"
                        @change="${s=>this.updateStep(e.id,{topic:s.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?a("Form ID",o`<input class="inp"
                        .value="${e.formId??""}"
                        @change="${s=>this.updateStep(e.id,{formId:s.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?a("Child workflow ID",o`<input class="inp"
                        .value="${e.childWorkflowDefinitionId??""}"
                        @change="${s=>this.updateStep(e.id,{childWorkflowDefinitionId:s.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),s=document.createElement("a");s.href=a,s.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(a)}};Wt.styles=[ts,C`
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
    `];Fa([m()],Wt.prototype,"value",2);Fa([$()],Wt.prototype,"wf",2);Fa([$()],Wt.prototype,"positions",2);Fa([$()],Wt.prototype,"selectedId",2);Fa([$()],Wt.prototype,"showMeta",2);Wt=Fa([k("mateu-workflow")],Wt);var Eh=Object.defineProperty,Ph=Object.getOwnPropertyDescriptor,_t=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ph(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Eh(t,a,i),i};const Ba=160,Ge=56,At=60,Th={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},Oh={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},Rh=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];let hs;const zh=()=>(hs||(hs=Te(()=>import("./vendor-diagrams.js").then(e=>e.e),__vite__mapDeps([5,3,1,2,4])).then(e=>new e.default)),hs);function Ah(){return"step-"+Math.random().toString(36).slice(2,8)}let Xe=class extends S{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.readOnly=!1,this.wf={name:"New Workflow",steps:[]},this.positions={},this.layoutReady=!1,this.selectedId=null,this.showMeta=!1,this.layoutError=null,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.elkPositioned=new Set,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.elkPositioned.add(this.draggingId),this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value"))try{const t=JSON.parse(this.value),a=new Set((this.wf.steps??[]).map(r=>r.id)),s=new Set((t.steps??[]).map(r=>r.id)),i=a.size!==s.size||[...s].some(r=>!a.has(r))||[...s].some(r=>{const n=(this.wf.steps??[]).find(c=>c.id===r),l=(t.steps??[]).find(c=>c.id===r);return n?.preconditionStepId!==l?.preconditionStepId});this.wf=t,(i||!this.layoutReady)&&this.runElkLayout()}catch{}}async runElkLayout(){const e=this.wf.steps??[];if(e.length===0){this.positions={},this.layoutReady=!0;return}const t={id:"root",layoutOptions:{"elk.algorithm":"layered","elk.direction":"RIGHT","elk.spacing.nodeNode":"40","elk.layered.spacing.nodeNodeBetweenLayers":"80","elk.edgeRouting":"ORTHOGONAL","elk.layered.nodePlacement.strategy":"BRANDES_KOEPF"},children:e.map(a=>({id:a.id,width:Ba,height:Ge})),edges:e.filter(a=>a.preconditionStepId).map(a=>({id:`${a.preconditionStepId}->${a.id}`,sources:[a.preconditionStepId],targets:[a.id]}))};try{const s=await(await zh()).layout(t),i={...this.positions};for(const r of s.children??[])(!this.elkPositioned.has(r.id)||!i[r.id])&&(i[r.id]={x:(r.x??0)+At,y:(r.y??0)+At},this.elkPositioned.add(r.id));this.positions=i,this.layoutReady=!0,this.layoutError=null}catch(a){this.layoutError=a?.message??"ELK layout failed",this.layoutReady=!0}}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){const a=this.wf.steps.map(r=>r.id===e?{...r,...t}:r),s=this.wf.steps.find(r=>r.id===e),i=t.preconditionStepId!==void 0&&t.preconditionStepId!==s?.preconditionStepId;this.wf={...this.wf,steps:a},i&&(this.elkPositioned.clear(),this.runElkLayout()),this.emit()}addStep(){const e=Ah(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(s=>s.x);this.positions={...this.positions,[e]:{x:a.length?Math.max(...a)+Ba+80:At,y:At}},this.selectedId=e,this.elkPositioned.clear(),this.runElkLayout(),this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(s=>s.id!==e).map(s=>s.preconditionStepId===e?{...s,preconditionStepId:void 0}:s)};const{[e]:t,...a}=this.positions;this.positions=a,this.elkPositioned.delete(e),this.selectedId===e&&(this.selectedId=null),this.runElkLayout(),this.emit()}onNodeMouseDown(e,t){if(this.readOnly)return;e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},s=this.toSvgPoint(e);this.dragOffset={x:s.x-a.x,y:s.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}relayout(){this.elkPositioned.clear(),this.runElkLayout()}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(s=>s.x))+Ba+At:600,a=e.length?Math.max(...e.map(s=>s.y))+Ge+At:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){if(!this.layoutReady)return o`<div class="loading">Computing layout…</div>`;const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return o`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():""}
                ${this.layoutError?o`<div class="error">⚠ ${this.layoutError}</div>`:""}
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
        `}renderToolbar(){const e=this.wf.status??"DRAFT";return o`
            <div class="toolbar">
                <span class="wf-name">${this.wf.name}</span>
                <span class="badge badge-${e.toLowerCase()}">${e}</span>
                <div style="flex:1"></div>
                <button class="nbtn" title="Re-run ELK layout"
                        @click="${()=>this.relayout()}">
                    ${ch}
                    Re-layout
                </button>
                ${this.readOnly?d:o`
                    <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                        ${qs}
                        Settings
                    </button>
                    <button class="nbtn primary" @click="${()=>this.addStep()}">
                        ${Us}
                        Add Step
                    </button>
                `}
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Bs}
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
        `}renderArrow(e){if(!e.preconditionStepId)return J``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return J``;const s=t.x+Ba,i=t.y+Ge/2,r=a.x,n=a.y+Ge/2,l=(s+r)/2;return J`
            <path d="M${s},${i} C${l},${i} ${l},${n} ${r},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:At,y:At},a=Th[e.type]??"#64748b",s=Oh[e.type]??"•",i=this.selectedId===e.id,r=e.name.length>16?e.name.slice(0,15)+"…":e.name;return J`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${n=>this.onNodeMouseDown(n,e.id)}"
               @click="${n=>{n.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${Ba}" height="${Ge}" rx="8"
                      fill="white"
                      stroke="${i?a:"#e2e8f0"}"
                      stroke-width="${i?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge strip -->
                <rect x="0" y="0" width="32" height="${Ge}" rx="8"
                      fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${Ge}" fill="${a}"/>
                <text x="16" y="${Ge/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${s}</text>
                <!-- labels -->
                <text x="44" y="${Ge/2-6}" font-size="11"
                      fill="#1e293b" font-weight="600">${r}</text>
                <text x="44" y="${Ge/2+8}" font-size="9"
                      fill="#94a3b8">${e.id}</text>
                <text x="44" y="${Ge/2+20}" font-size="9"
                      fill="${a}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(i=>i.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(i=>i.id!==e.id),a=this.readOnly,s=(i,r)=>o`
            <div class="field">
                <label class="field-label">${i}</label>
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
                    ${s("ID",o`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${s("Name",o`<input class="inp" ?readonly="${a}" .value="${e.name}"
                        @change="${a?d:i=>this.updateStep(e.id,{name:i.target.value})}"/>`)}
                    ${s("Type",o`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?d:i=>this.updateStep(e.id,{type:i.target.value})}">
                            ${Rh.map(i=>o`
                                <option value="${i}" ?selected="${e.type===i}">${i}</option>`)}
                        </select>`)}
                    ${s("Description",o`<textarea class="inp" rows="2" ?readonly="${a}"
                        @change="${a?d:i=>this.updateStep(e.id,{description:i.target.value})}">${e.description??""}</textarea>`)}
                    ${s("Precondition step",o`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?d:i=>this.updateStep(e.id,{preconditionStepId:i.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(i=>o`
                                <option value="${i.id}" ?selected="${e.preconditionStepId===i.id}">
                                    ${i.name} (${i.id})
                                </option>`)}
                        </select>`)}
                    ${s("Precondition expression",o`
                        <input class="inp" placeholder="JEXL expression" ?readonly="${a}"
                               .value="${e.preconditionExpression??""}"
                               @change="${a?d:i=>this.updateStep(e.id,{preconditionExpression:i.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}" ?disabled="${a}"
                               @change="${a?d:i=>this.updateStep(e.id,{parallel:i.target.checked})}"/>
                    </div>
                    ${s("Timeout (ms)",o`
                        <input class="inp" type="number" min="0" ?readonly="${a}"
                               .value="${String(e.timeout??0)}"
                               @change="${a?d:i=>this.updateStep(e.id,{timeout:Number(i.target.value)})}"/>`)}
                    ${s("Retries",o`
                        <input class="inp" type="number" min="0" ?readonly="${a}"
                               .value="${String(e.retries??0)}"
                               @change="${a?d:i=>this.updateStep(e.id,{retries:Number(i.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}" ?disabled="${a}"
                               @change="${a?d:i=>this.updateStep(e.id,{rollbackable:i.target.checked})}"/>
                    </div>
                    ${e.rollbackable?s("Compensation step",o`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?d:i=>this.updateStep(e.id,{compensationStepId:i.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(i=>o`
                                <option value="${i.id}" ?selected="${e.compensationStepId===i.id}">
                                    ${i.name} (${i.id})
                                </option>`)}
                        </select>`):""}
                    ${e.type==="ACTION"?s("Topic",o`
                        <input class="inp" placeholder="kafka.topic.name" ?readonly="${a}"
                               .value="${e.topic??""}"
                               @change="${a?d:i=>this.updateStep(e.id,{topic:i.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?s("Form ID",o`
                        <input class="inp" ?readonly="${a}" .value="${e.formId??""}"
                               @change="${a?d:i=>this.updateStep(e.id,{formId:i.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?s("Child workflow ID",o`
                        <input class="inp" ?readonly="${a}" .value="${e.childWorkflowDefinitionId??""}"
                               @change="${a?d:i=>this.updateStep(e.id,{childWorkflowDefinitionId:i.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),s=document.createElement("a");s.href=a,s.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(a)}};Xe.styles=[ts,C`
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
    `];_t([m()],Xe.prototype,"value",2);_t([m({type:Boolean})],Xe.prototype,"readOnly",2);_t([$()],Xe.prototype,"wf",2);_t([$()],Xe.prototype,"positions",2);_t([$()],Xe.prototype,"layoutReady",2);_t([$()],Xe.prototype,"selectedId",2);_t([$()],Xe.prototype,"showMeta",2);_t([$()],Xe.prototype,"layoutError",2);Xe=_t([k("mateu-workflow-elk")],Xe);var jh=Object.defineProperty,Lh=Object.getOwnPropertyDescriptor,mi=(e,t,a,s)=>{for(var i=s>1?void 0:s?Lh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&jh(t,a,i),i};const Dh=["string","integer","number","bool","date","time","dateTime","dateRange","money","file","array","status","component","menu","range","action","actionGroup"],Nh=["regular","radio","checkbox","textarea","toggle","combobox","select","email","password","richText","listBox","html","markdown","image","icon","link","money","grid","color","choice","popover","slider","button","stars"],Fh={string:"#3B82F6",integer:"#8B5CF6",number:"#6366F1",bool:"#10B981",date:"#F59E0B",time:"#F59E0B",dateTime:"#F59E0B",dateRange:"#F59E0B",money:"#EF4444",file:"#64748B",array:"#0EA5E9",status:"#EC4899",component:"#14B8A6",menu:"#94A3B8",range:"#A855F7",action:"#F97316",actionGroup:"#FB923C"};function vr(){return"field-"+Math.random().toString(36).slice(2,8)}let ha=class extends S{constructor(){super(...arguments),this.value='{"name":"New Form","fields":[]}',this.form={name:"New Form",fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has("value"))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){const e=this.shadowRoot?.querySelector(".field-list");!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=Wo.create(e,{animation:150,handle:".drag-handle",ghostClass:"sortable-ghost",onEnd:t=>{const{oldIndex:a,newIndex:s}=t;if(a===void 0||s===void 0||a===s)return;const i=[...this.form.fields],[r]=i.splice(a,1);i.splice(s,0,r),this.form={...this.form,fields:i},this.emit()}}))}emit(){const e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addField(){const e=vr(),t={id:e,label:"New Field",dataType:"string"};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){const t=this.form.fields.find(r=>r.id===e);if(!t)return;const a={...t,id:vr(),label:t.label+" (copy)"},s=this.form.fields.findIndex(r=>r.id===e),i=[...this.form.fields];i.splice(s+1,0,a),this.form={...this.form,fields:i},this.selectedId=a.id,this.emit()}render(){return o`
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
                    ${qs}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${Us}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Bs}
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
        `}renderRow(e){const t=Fh[e.dataType]??"#64748b",a=this.selectedId===e.id;return o`
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
                        @click="${s=>{s.stopPropagation(),this.duplicateField(e.id)}}">⧉</button>
                <button class="row-btn danger" title="Delete"
                        @click="${s=>{s.stopPropagation(),this.deleteField(e.id)}}">🗑</button>
            </div>
        `}renderPanel(){const e=this.form.fields.find(a=>a.id===this.selectedId);if(!e)return d;const t=(a,s)=>o`
            <div class="prop-field">
                <label class="prop-label">${a}</label>
                ${s}
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
                            ${Dh.map(a=>o`
                                <option value="${a}" ?selected="${e.dataType===a}">${a}</option>`)}
                        </select>`)}
                    ${t("Stereotype",o`
                        <select class="inp"
                                @change="${a=>this.updateField(e.id,{stereotype:a.target.value||void 0})}">
                            ${Nh.map(a=>o`
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
        `}exportJson(){const e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),s=document.createElement("a");s.href=a,s.download=(this.form.name??"form").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(a)}};ha.styles=[ts,C`
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
    `];mi([m()],ha.prototype,"value",2);mi([$()],ha.prototype,"form",2);mi([$()],ha.prototype,"selectedId",2);mi([$()],ha.prototype,"showMeta",2);ha=mi([k("mateu-form-editor")],ha);var Mh=Object.defineProperty,qh=Object.getOwnPropertyDescriptor,vt=(e,t,a,s)=>{for(var i=s>1?void 0:s?qh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Mh(t,a,i),i};let Me=class extends S{constructor(){super(...arguments),this.appState={},this.appData={},this.open=!1,this.activeTab="appstate",this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith("mateu-")&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset="",this._prevTarget=null,this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset=""),this._prevTarget=t,t.style.outline="2px solid #0070f3",t.style.outlineOffset="-2px",this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||"",this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener("mouseover",this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mouseover",this._onMouseover,!0),this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget=null)}_fmt(e){try{return JSON.stringify(e,null,2)??"null"}catch{return String(e)}}_renderTab(e,t){return o`
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
        `}};Me.styles=C`
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
    `;vt([m()],Me.prototype,"appState",2);vt([m()],Me.prototype,"appData",2);vt([$()],Me.prototype,"open",2);vt([$()],Me.prototype,"activeTab",2);vt([$()],Me.prototype,"hoveredTag",2);vt([$()],Me.prototype,"hoveredId",2);vt([$()],Me.prototype,"hoveredState",2);vt([$()],Me.prototype,"hoveredData",2);vt([$()],Me.prototype,"hoveredMeta",2);Me=vt([k("mateu-debug-overlay")],Me);var Ke=(e=>(e.SetAppDataValue="SetAppDataValue",e.SetAppStateValue="SetAppStateValue",e.SetDataValue="SetDataValue",e.RunAction="RunAction",e.RunJS="RunJS",e.SetAttributeValue="SetAttributeValue",e.SetStateValue="SetStateValue",e.SetCssClass="SetCssClass",e.SetStyle="SetStyle",e))(Ke||{}),Po=(e=>(e.required="required",e.disabled="disabled",e.hidden="hidden",e.pattern="pattern",e.minValue="minValue",e.maxValue="maxValue",e.minLength="minLength",e.maxLength="maxLength",e.css="css",e.style="style",e.theme="theme",e.errorMessage="errorMessage",e.description="description",e.none="none",e))(Po||{}),To=(e=>(e.Continue="Continue",e.Stop="Stop",e))(To||{}),Uh=Object.defineProperty,Bh=Object.getOwnPropertyDescriptor,as=(e,t,a,s)=>{for(var i=s>1?void 0:s?Bh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Uh(t,a,i),i};let Va=null,Pa=class extends Zt{constructor(){super(...arguments),this.baseUrl="",this.route="",this.consumedRoute="",this.formerState={},this.applyRules=()=>{const e=this.component.rules;if(e&&e.length>0){const t=this.state,a=this.data,s=this.appState,i=this.appData,r=this.component,n=y=>Cr(y,t,a,{appState:s,appData:i,component:r}),l=y=>kr(y,t,a,s,i,{component:r}),c=["state","data","appState","appData","component"],u=[t,a,s,i,r],h={...this.state},p={...this.data};let f=!1,g=!1;for(let y=0;y<e.length;y++){const x=e[y];try{if(n(x.filter)){if(Ke.SetStateValue==x.action||Ke.SetDataValue==x.action){const P=Ke.SetStateValue==x.action?h:p,q=x.fieldName.split(",");for(let ae=0;ae<q.length;ae++){const N=q[ae];if(!P[N]||P[N]!=x.value){const ne=x.expression?l(x.expression):x.value,ue=Po.none==x.fieldAttribute?N:N+"."+x.fieldAttribute;ne!=P[ue]&&(P[ue]=ne,Ke.SetStateValue==x.action&&(f=!0),Ke.SetDataValue==x.action&&(g=!0))}}}if(Ke.RunAction==x.action&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:x.actionId},bubbles:!0,composed:!0})),Ke.RunJS==x.action&&new Function(...c,x.value)(...u),Ke.SetAttributeValue==x.action){const P=x.expression?n(x.expression):x.value;if(x.fieldAttribute=="disabled"){P?this.shadowRoot?.getElementById(x.fieldName)?.setAttribute(x.fieldAttribute,"disabled"):this.shadowRoot?.getElementById(x.fieldName)?.removeAttribute(x.fieldAttribute);continue}this.shadowRoot?.getElementById(x.fieldName)?.setAttribute(x.fieldAttribute,P)}if(Ke.SetCssClass==x.action&&this.shadowRoot?.getElementById(x.fieldName)?.setAttribute("class",x.value),Ke.SetStyle==x.action&&this.shadowRoot?.getElementById(x.fieldName)?.style.setProperty(x.expression,x.value),To.Stop==x.result)break}}catch(P){console.error("rule failed",x,P)}}f&&(this.state=h),g&&(this.data=p),f&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes("-"),this.checkValidations=e=>{const t=e?e.split(","):void 0,a=this.component.validations;let s=!0,i=!1;const r=this.data??{},n={...this.data??{},errors:{}};if(a){for(let l=0;l<a.length;l++){const c=a[l];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let h=0;h<u.length;h++){const p=u[h];n.errors[p]=[]}}for(let l=0;l<a.length;l++){const c=a[l];if(!this.skipValidation(t,c))try{const u=c.condition&&c.condition.includes("${")?this._evalTemplate(c.condition):this._evalExpr(c.condition);if(c.condition&&!u){s=!1;const p=(c.fieldId??"_component").split(",");for(let f=0;f<p.length;f++){const g=p[f];let y=n.errors[g];if(y||(n.errors[g]=[]),y=n.errors[g],!r[g]){let x=c.message;try{x=this._evalTemplate(c.message)}catch{}y.push(x)}}}}catch(u){console.error("validation failed",c,u)}}for(let l=0;l<a.length;l++){const c=a[l];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let h=0;h<u.length;h++){const p=u[h];if(r.errors?[p].join(","):n.errors==""&&[p].join(",")){i=!0;break}}}(r.errors?["_component"].join(","):n.errors==""&&["_component"].join(","))&&(i=!0)}n._valid=s,n._valid!=r._valid&&(i=!0),i&&(this.data=n)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};t.fieldIds.forEach(s=>{a[s]=void 0}),a.searchText=void 0,this.state={...this.state,...a}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};a[t.key]=t.value,e.type=="data-changed"&&(this.data={...this.data,...a})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail;if(e.type=="value-changed"){const a={...this.state};a[t.fieldId]=t.value,this.state=a,(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("dirty",{detail:e.detail,bubbles:!0,composed:!0}));const s=this.component;s.triggers?.filter(i=>i.type==jt.OnValueChange).filter(i=>!i.propertyName||t.fieldId==i.propertyName).forEach(i=>{(!i.condition||this._evalExpr(i.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))}),s.triggers?.filter(i=>i.type==jt.AutoSave).forEach(i=>{const r=i.actionId,n=this._autoSaveTimers.get(r);n!==void 0&&clearTimeout(n),this._autoSaveTimers.set(r,setTimeout(()=>{this._autoSaveTimers.delete(r),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))},i.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{const t=e.detail;if(e.type=="action-requested"){e.preventDefault(),e.stopPropagation();const a=this.component,s=a.actions?.find(i=>i.id==t.actionId||i.id.endsWith("*")&&t.actionId.startsWith(i.id.replace("*","")));if(s){if(s&&s.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify("You first need to select some rows");return}if(s&&s.validationRequired){const r=Va??this;if(Va=null,r.checkValidations(s.fieldsToValidate),!r.data._valid){r.notifyValidationErrors();return}}Va=null;const i={...t,initiatorComponentId:this.id};s&&s.confirmationRequired?this.callAfterConfirmation(s,()=>this.requestActionCallToServerOrBubble(i,a,s)):this.requestActionCallToServerOrBubble(i,a,s)}else{const i={...t.parameters};i.initiatorState||(i.initiatorState=this.state),Va||(Va=this),this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,parameters:i},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{const e={},t=a=>{if(a)for(const s of a){const i=s.metadata;if(i?.type===v.FormField){const r=i;r.fieldId&&r.label&&(e[r.fieldId]=r.label)}t(s.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{const e=this.data?.errors??{},t=this.buildFieldLabelMap(),a=[];if(Object.entries(e).forEach(([i,r])=>{if(!Array.isArray(r))return;const n=i==="_component"?void 0:t[i]??i;r.forEach(l=>{l&&!a.some(c=>c.label===n&&c.msg===l)&&a.push({label:n,msg:l})})}),a.length===0){this.notify("There are validation errors");return}const s=document.createElement("vaadin-notification");s.position="bottom-end",s.setAttribute("theme","error"),s.duration=Math.max(3e3,1500+a.length*1e3),s.renderer=i=>{gr(o`
                <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs, .25rem);">
                    <strong>There are validation errors</strong>
                    ${a.map(({label:r,msg:n})=>r?o`<span>• <b>${r}:</b> ${n}</span>`:o`<span>• ${n}</span>`)}
                </div>
            `,i)},document.body.appendChild(s),s.opened=!0,s.addEventListener("opened-changed",i=>{i.detail.value||document.body.removeChild(s)})},this.notify=e=>{ia.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.callAfterConfirmation=(e,t)=>{let a="One moment, please",s="Are you sure?",i="Yes",r="No";e.confirmationTexts&&(a=e.confirmationTexts.title,s=e.confirmationTexts.message,i=e.confirmationTexts.confirmationText,r=e.confirmationTexts.denialText);const n=document.createElement("vaadin-confirm-dialog");n.setAttribute("header",a),n.setAttribute("cancel-button-visible","cancel-button-visible"),n.setAttribute("confirm-text",i),n.setAttribute("cancel-text",r),n.append(s),n.opened=!0,n.addEventListener("confirm",()=>t()),n.addEventListener("close",()=>document.body.removeChild(n)),n.addEventListener("confirm",()=>document.body.removeChild(n)),n.addEventListener("cancel",()=>document.body.removeChild(n)),n.addEventListener("reject",()=>document.body.removeChild(n)),document.body.append(n)},this.requestActionCallToServerOrBubble=(e,t,a)=>{if(a&&a.bubble){const s={...e.parameters};s.initiatorState||(s.initiatorState=this.state),this.dispatchEvent(new CustomEvent("action-requested",{detail:{...e,parameters:s},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,a)},this.requestActionCallToServer=(e,t,a)=>{if(a&&a.href){window.location.href=a.href;return}if(a&&a.js)try{new Function("state","data","appState","appData","component",a.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(s){console.error("when evaluating "+a.js,s,this.component,this.state,this.data)}if(a&&a.customEvent&&this.dispatchEvent(new CustomEvent(a.customEvent.name,{detail:a.customEvent.detail,bubbles:!0,composed:!0})),!(a&&(a.js||a.customEvent))){if(e.actionId=="search"){const s=e.parameters?._searchState;s?this.state={...this.state,...s}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}this.dispatchEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:{...this.state},parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:a?.background,sse:a?.sse,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))}},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(s=>s.type==jt.OnSuccess).filter(s=>e.detail.actionId==s.calledActionId).forEach(s=>{if(!s.condition||this._evalExpr(s.condition))if(e.preventDefault(),e.stopPropagation(),s.timeoutMillis>0){const i=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId,callbackToken:i},bubbles:!0,composed:!0}))},s.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(s=>s.type==jt.OnError).filter(s=>e.detail.actionId==s.calledActionId).forEach(s=>{(!s.condition||this._evalExpr(s.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0})))})},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;const t=this.component;if(t)for(const a of t.actions??[]){const s=a.shortcut||(a.runOnEnter?"enter":null);if(s&&this._shortcutMatchesEvent(s,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return te.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has("state")&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has("component")&&(this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}_shortcutMatchesEvent(e,t){return al(e,t)}_collectShortcutTabs(){const e=this.renderRoot;if(!e)return[];const t=Array.from(e.querySelectorAll("vaadin-tab[data-shortcut]"));return e.querySelectorAll("mateu-drawer, mateu-dialog").forEach(a=>{const s=a.shadowRoot;s&&t.push(...Array.from(s.querySelectorAll("vaadin-tab[data-shortcut]")))}),t}_handleTabShortcut(e){const t=this._collectShortcutTabs();if(t.length===0)return!1;for(const a of Array.from(t)){const s=a.dataset.shortcut;if(!s||!this._shortcutMatchesEvent(s,e))continue;const i=a.closest("vaadin-tabs");if(!i)continue;const r=Array.from(i.querySelectorAll("vaadin-tab")).indexOf(a);if(!(r<0))return e.preventDefault(),i.selected=r,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.addEventListener("backend-call-failed",this.handleBackendFailed),document.addEventListener("keydown",this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.removeEventListener("backend-call-failed",this.handleBackendFailed),document.removeEventListener("keydown",this._keydownListener)}render(){return o`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?o`
                <div><ul>${this.data.errors._component.map(e=>o`<li>${e}</li>`)}</ul></div>
            `:d}</div>`}_render(){if(this.component?.type==oe.ClientSide){const e=this.component;return e.metadata?.type==v.Page?fs(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==v.Crud?bs(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):te.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return o`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==oe.ClientSide){const t=e;if(t.metadata?.type==v.Page)return fs(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==v.Crud)return bs(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return w(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}};Pa.styles=C`
        :host {
        }

        ${No(Ht.cssText)}
        
        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }
        
  `;as([m()],Pa.prototype,"baseUrl",2);as([m()],Pa.prototype,"route",2);as([m()],Pa.prototype,"consumedRoute",2);Pa=as([k("mateu-component")],Pa);const fr=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}},Vh=tu;var Wh=Object.defineProperty,Hh=Object.getOwnPropertyDescriptor,Le=(e,t,a,s)=>{for(var i=s>1?void 0:s?Hh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Wh(t,a,i),i};let ve=class extends Ji{constructor(){super(...arguments),this.consumedRoute="",this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t=="string"&&(t===""||t.startsWith("/"))&&this.consumedRoute&&this.consumedRoute!=="_empty"&&this.consumedRoute.startsWith("/")&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t.startsWith("/")&&this.uriPrefix.endsWith("/")?t=this.uriPrefix+t.substring(1):!t.startsWith("/")&&!this.uriPrefix.endsWith("/")?t=this.uriPrefix+"/"+t:t=this.uriPrefix+t),this.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==""&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:oe.ClientSide,metadata:{type:v.Element,name:"div",content:"Not found"},id:"fieldId"},action:ei.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;const t=this.detail1;if(e.type=="server-side-action-requested"){let a=Vh;t.sse&&(a=Xr),a.runAction(va,this.baseUrl,t.route??"",t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken)}},this.getCustomisedAppState=()=>{let e={...le.value};if(this.overrides){const t=fr(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw new Error("Method not implemented.")}createRenderRoot(){return te.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.overridesParsed=fr(this.overrides),this.addEventListener("server-side-action-requested",this.actionRequestedListener),this.addEventListener("backend-call-failed",this.backendFailedListener),this.addEventListener("history-pushed",this.historyPushed),this.addEventListener("route-changed",this.routeChangedListener),window.Vaadin.featureFlags.masterDetailLayoutComponent=!0}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.actionRequestedListener),this.removeEventListener("backend-call-failed",this.backendFailedListener),this.removeEventListener("history-pushed",this.historyPushed),this.removeEventListener("route-changed",this.routeChangedListener)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(a=>a==="appState"||a==="appData")){const a=this.renderRoot.querySelector("mateu-component");if(a)return e.has("appState")&&(a.appState=this.appState),e.has("appData")&&(a.appData=this.appData),!1}return!0}updated(e){(e.has("id")||e.has("baseurl")||e.has("route")||e.has("consumedRoute")||e.has("instant"))&&(this.preventNavigation||(this.callbackToken=this.instant||ye(),this.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:"",serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,componentState:this.initialState,callbackToken:this.callbackToken},bubbles:!0,composed:!0})))),e.has("route")&&this.top&&(this.preventNavigation||this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&(this.preventNavigation=!1)}applyFragment(e){if(!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}};return}this.fragment=e}render(){return o`
           ${this.fragment?.component?w(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):d}
       `}};ve.styles=C`
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
  `;Le([m()],ve.prototype,"consumedRoute",2);Le([m()],ve.prototype,"serverSideType",2);Le([m()],ve.prototype,"uriPrefix",2);Le([m()],ve.prototype,"overrides",2);Le([m()],ve.prototype,"homeRoute",2);Le([m()],ve.prototype,"route",2);Le([m()],ve.prototype,"top",2);Le([m()],ve.prototype,"instant",2);Le([m()],ve.prototype,"initialState",2);Le([m()],ve.prototype,"appState",2);Le([m()],ve.prototype,"appData",2);Le([$()],ve.prototype,"fragment",2);ve=Le([k("mateu-ux")],ve);var Gh=Object.defineProperty,Kh=Object.getOwnPropertyDescriptor,Q=(e,t,a,s)=>{for(var i=s>1?void 0:s?Kh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Gh(t,a,i),i};let G=class extends Zt{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0,this.commandPaletteDataHits=[],this.openDataHit=e=>{Dt.confirmLeave()&&(this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteDataHits=[],this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:e.route},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:e.route},bubbles:!0,composed:!0})))},this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this.isDark=document.documentElement.getAttribute("theme")==="dark",this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;const e=this.isDark?"dark":"light";document.documentElement.setAttribute("theme",e),localStorage.setItem("mateu-theme",e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?"detail":"detail-hidden")},this.runAction=e=>{const a=this.renderRoot.querySelector?.("mateu-component");a&&a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){const a=e[t];if(a.selected)return a;const s=this.getSelectedOption(a.submenus);if(s)return s}return null},this.itemSelected=e=>{const t=e.detail.value;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.itemSelectedTiles=e=>{const t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))},this.mapItemsForTiles=e=>e.map(t=>({text:t.label,consumedRoute:t.consumedRoute,route:t.route,baseUrl:t.baseUrl,serverSideType:t.serverSideType,uriPrefix:t.uriPrefix,actionId:t.actionId,selected:t.selected,_menuOption:t})),this.flattenMenuForPalette=(e,t)=>{const a=[];for(const s of e)if(!s.separator)if(s.submenus&&s.submenus.length>0){const i=t?`${t} › ${s.label}`:s.label;a.push(...this.flattenMenuForPalette(s.submenus,i))}else a.push({label:s.label,breadcrumb:t,consumedRoute:s.consumedRoute,route:s.route,actionId:s.actionId,baseUrl:s.baseUrl,serverSideType:s.serverSideType,uriPrefix:s.uriPrefix});return a},this.handleCommandPaletteKeydown=(e,t)=>{const a=Math.min(t.length,10),s=a+Math.min(this.commandPaletteDataHits.length,8);if(e.key==="ArrowDown")e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,s-1);else if(e.key==="ArrowUp")e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key==="Enter"){if(this.commandPaletteSelectedIndex>=a){const r=this.commandPaletteDataHits[this.commandPaletteSelectedIndex-a];r&&this.openDataHit(r);return}const i=t[this.commandPaletteSelectedIndex];i&&(this.selectRoute(i.consumedRoute,i.route,i.actionId,i.baseUrl,i.serverSideType,i.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery="")}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return d;const e=this.component?.metadata;if(!e?.menu)return d;const t=this.flattenMenuForPalette(e.menu,""),a=this.commandPaletteQuery.toLowerCase(),s=a?t.filter(i=>i.label.toLowerCase().includes(a)||i.breadcrumb.toLowerCase().includes(a)):t;return o`
            <div class="cmd-backdrop" @click=${()=>{this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}>
                <div class="cmd-palette" @click=${i=>i.stopPropagation()}>
                    <div class="cmd-search-wrapper">
                        <vaadin-icon icon="vaadin:search" class="cmd-search-icon"></vaadin-icon>
                        <input
                            class="cmd-input"
                            placeholder="Go to…"
                            .value=${this.commandPaletteQuery}
                            @input=${i=>{this.commandPaletteQuery=i.target.value,this.commandPaletteSelectedIndex=0,this.fetchGlobalSearch(this.commandPaletteQuery)}}
                            @keydown=${i=>this.handleCommandPaletteKeydown(i,s)}
                        >
                    </div>
                    <div class="cmd-results">
                        ${s.slice(0,10).map((i,r)=>o`
                            <div class="cmd-result ${r===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                @click=${()=>{this.selectRoute(i.consumedRoute,i.route,i.actionId,i.baseUrl,i.serverSideType,i.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}
                                @mouseenter=${()=>{this.commandPaletteSelectedIndex=r}}
                            >
                                <span class="cmd-result-label">${i.label}</span>
                                ${i.breadcrumb?o`<span class="cmd-result-breadcrumb">${i.breadcrumb}</span>`:d}
                            </div>
                        `)}
                        ${a&&this.commandPaletteDataHits.length>0?o`
                            ${this.commandPaletteDataHits.slice(0,8).map((i,r)=>{const n=Math.min(s.length,10)+r,l=this.commandPaletteDataHits[r-1];return o`
                                    ${i.category&&i.category!==l?.category?o`
                                        <div class="cmd-category">${i.category}</div>`:d}
                                    <div class="cmd-result ${n===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                         @click=${()=>this.openDataHit(i)}
                                         @mouseenter=${()=>{this.commandPaletteSelectedIndex=n}}
                                    >
                                        <span class="cmd-result-label">${i.label}</span>
                                        ${i.description?o`<span class="cmd-result-breadcrumb">${i.description}</span>`:d}
                                    </div>`})}`:d}
                        ${s.length===0&&this.commandPaletteDataHits.length===0?o`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>`:d}
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
        `,this.goHome=()=>{const e=this.component.metadata;this.selectRoute(e.route,"_page","",void 0,void 0,void 0)},this.selectRoute=(e,t,a,s,i,r)=>{Dt.confirmLeave()&&this._selectRoute(e,t,a,s,i,r)},this._selectRoute=(e,t,a,s,i,r)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=s,this.selectedRoute=t,this.selectedServerSideType=i,this.selectedUriPrefix=r,this.instant=ye(),this.state&&this.state._route!=null&&(this.state._route=void 0);let n=this.baseUrl??"";n.indexOf("://")<0&&(n.startsWith("/")||(n="/"+n),n=window.location.origin+n),n.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let l=new URL(n+t);if(e&&l.pathname.startsWith(e)){const c=l.pathname.substring(e.length);l=new URL(l.origin+(c||"/"))}if((window.location.pathname||l.pathname)&&window.location.pathname!=l.pathname){let c=l.pathname;l.search&&(c+=l.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let u=c;this.selectedUriPrefix&&(u.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+u.substring(1):!u.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+"/"+u:u=this.selectedUriPrefix+u),u=="/_page"&&(u=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:u},bubbles:!0,composed:!0}))}}},this.mapItems=(e,t)=>e.map(a=>{if(a.submenus&&a.submenus.length>0){let s=this.mapItems(a.submenus,t);return t&&a.label.toLowerCase().includes(t)&&(s=this.mapItems(a.submenus,"")),s&&s.length>0?{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||a.selected,children:s}:void 0}if(a.separator)return t?void 0:{component:"hr"};if(!t||a.label.toLowerCase().includes(t))return{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||a.selected}}).filter(a=>a!=null),this.getSelectedIndex=e=>{if(e){const t=this.getSelectedOption(e);if(t)return e.indexOf(t)}return NaN},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?o`
                <vaadin-details summary="${e.label}" theme="reverse">
                    <vaadin-vertical-layout>
                        ${e.submenus.map(t=>o`${this.renderOptionOnLeftMenu(t)}`)}
                    </vaadin-vertical-layout>
                </vaadin-details>
`:o`<vaadin-button theme="tertiary" 
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)}"
        >${e.label}</vaadin-button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){const t=this.shadowRoot?.querySelector("mateu-ux");t&&t.setAttribute("instant",ye())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?o`
            ${e.map(a=>{const s=a;return o`

                        ${s.component=="hr"?o`<hr slot="children"/>`:o`
                                <vaadin-side-nav-item
                                .path="${s.route&&!s.children?s.route:void 0}"
                                .pathAliases="${[this.baseUrl+(s.route?s.route:"")]}"
                                slot="${t}"
                                ?expanded="${s.selected}"
                                >
                                    ${s.icon?o`
                                        <vaadin-icon icon="vaadin:dashboard" slot="prefix"></vaadin-icon>
                                    `:d}
                                    ${s.text}
                                    ${this.renderSideNav(s.children,"children")}
                                </vaadin-side-nav-item>
                        `}

                            `})}`:d,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}createRenderRoot(){return te.mustUseShadowRoot()?super.createRenderRoot():this}fetchGlobalSearch(e){const t=this.component?.metadata;if(t?.globalSearchEnabled){if(clearTimeout(this._globalSearchTimer),!e){this.commandPaletteDataHits=[];return}this._globalSearchTimer=setTimeout(async()=>{try{const s=(await va.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","cmd-palette",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(i=>i.data).find(i=>i&&i._globalsearch);this.commandPaletteDataHits=s?._globalsearch??[]}catch{this.commandPaletteDataHits=[]}},250)}}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute("theme")==="dark",this._commandPaletteHandler=e=>{(e.metaKey||e.ctrlKey)&&e.key==="k"&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0),e.key==="Escape"&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery="")},document.addEventListener("keydown",this._commandPaletteHandler),Dt.install(),this.addEventListener("compact-changed",this._compactHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener("keydown",this._commandPaletteHandler),this.removeEventListener("compact-changed",this._compactHandler)}updated(e){if(super.updated(e),this.component){const a=this.component.metadata;if(a){const s=a;if(s.favicon){let i=document.querySelector("link[rel~='icon']");i||(i=document.createElement("link"),i.rel="icon",document.head.appendChild(i)),i.href=s.favicon}e.has("component")&&(this.selectedRoute=s.homeRoute,this.selectedConsumedRoute=s.homeConsumedRoute,this.selectedServerSideType=s.homeServerSideType,this.selectedBaseUrl=s.homeBaseUrl,this.selectedUriPrefix=s.homeUriPrefix)}}e.has("commandPaletteOpen")&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(".cmd-input")?.focus()},0)}render(){return te.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}};G.styles=C`

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

  `;Q([$()],G.prototype,"filter",2);Q([$()],G.prototype,"instant",2);Q([$()],G.prototype,"selectedConsumedRoute",2);Q([$()],G.prototype,"selectedRoute",2);Q([$()],G.prototype,"selectedUriPrefix",2);Q([$()],G.prototype,"selectedBaseUrl",2);Q([$()],G.prototype,"selectedServerSideType",2);Q([$()],G.prototype,"selectedParams",2);Q([$()],G.prototype,"tilesMenuOption",2);Q([$()],G.prototype,"railOpenOption",2);Q([$()],G.prototype,"commandPaletteOpen",2);Q([$()],G.prototype,"commandPaletteQuery",2);Q([$()],G.prototype,"commandPaletteSelectedIndex",2);Q([$()],G.prototype,"commandPaletteDataHits",2);Q([$()],G.prototype,"pageCompact",2);Q([et("mateu-chat")],G.prototype,"chat",2);Q([$()],G.prototype,"isDark",2);Q([$()],G.prototype,"chatOpen",2);Q([et("vaadin-app-layout")],G.prototype,"vaadinAppLayout",2);G=Q([k("mateu-app")],G);var Yh=Object.defineProperty,Jh=Object.getOwnPropertyDescriptor,Et=(e,t,a,s)=>{for(var i=s>1?void 0:s?Jh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Yh(t,a,i),i};let Qe=class extends G{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.lastActionServerSideType=void 0,this.lastActionInitiatorComponentId=void 0,this.captureActionSST=e=>{const t=e.detail;typeof t?.serverSideComponentRoute=="string"&&t.serverSideComponentRoute.indexOf("_embeddedMediator=1")>=0||t?.serverSideType&&(this.lastActionServerSideType=t.serverSideType,this.lastActionInitiatorComponentId=t.initiatorComponentId)},this.handleUnhandledAction=e=>{if(this.component?.metadata?.variant==$e.MEDIATOR)return;const a=e.detail;e.preventDefault(),e.stopPropagation();const s=this.renderRoot?.querySelector("#"+this.contentUxId);!s||typeof s.manageActionEvent!="function"||(this.lastActionServerSideType=this.selectedServerSideType,this.lastActionInitiatorComponentId=s.id,s.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:s.route??this.selectedRoute??"",consumedRoute:s.consumedRoute??this.selectedConsumedRoute??"",componentState:a.parameters?.initiatorState??{},parameters:a.parameters,actionId:a.actionId,serverSideType:this.selectedServerSideType??"",initiatorComponentId:s.id,initiator:s}})))},this.selectRoute=(e,t,a,s,i,r)=>{{const n=this.component?.metadata;if(n?.variant!=$e.MEDIATOR&&!a&&(!s||s===this.baseUrl)&&(!i||i===n?.serverSideType)&&t!=null){if(!Dt.confirmLeave())return;this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:t},bubbles:!0,composed:!0}));return}}{this.selectedConsumedRoute=e,this.selectedBaseUrl=s,this.selectedRoute=t,this.selectedServerSideType=i,this.selectedUriPrefix=r,this.instant=ye();let n=this.baseUrl??"";n.indexOf("://")<0&&(n.startsWith("/")||(n="/"+n),n=window.location.origin+n),n.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let l=new URL(n+t);if(e&&(t??"").startsWith(e)&&(l=new URL(n+t?.substring(e.length))),(window.location.pathname||l.pathname)&&window.location.pathname!=l.pathname){let c=l.pathname;l.search&&(c+=l.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let u=c;this.selectedUriPrefix&&(u.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+u.substring(1):!u.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+"/"+u:u=this.selectedUriPrefix+u),u=="_page"&&(u=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:u},bubbles:!0,composed:!0}))}}},this.updateRoute=e=>{e.preventDefault(),e.stopPropagation(),console.log("update route",e,this);var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.ds=e=>e&&e!=="undefined"&&e!=="null"?e:void 0,this.tabSelected=(e,t,a)=>{this.selectRoute(this.ds(e.detail.tab.dataset.consumedRoute),this.ds(e.detail.tab.dataset.route),this.ds(e.detail.tab.dataset.actionId),this.ds(e.detail.tab.dataset.baseUrl),this.ds(e.detail.tab.dataset.serverSideType),this.ds(e.detail.tab.dataset.uriPrefix))},this.mode=bi.Auto,this.toggle=e=>{this.mode=this.mode==bi.Expanded?bi.Collapsed:bi.Expanded,e.requestUpdate()},this.selected=(e,t,a,s)=>{console.log("selected",e,e.target,e.detail.value);const i=this.renderRoot.querySelector('[data-path = "'+e.detail.value+'"]');if(i){this.selectRoute(this.ds(i.dataset.consumedRoute),this.ds(i.dataset.route),this.ds(i.dataset.actionId),this.ds(i.dataset.baseUrl),this.ds(i.dataset.serverSideType),this.ds(i.dataset.uriPrefix));return}const r=l=>{for(const c of l??[]){if(c.route===e.detail.value||c.path===e.detail.value)return c;const u=r(c.submenus);if(u)return u}},n=r(s?.menu);n?this.selectRoute(n.consumedRoute,n.route,n.actionId,n.baseUrl,n.serverSideType,n.uriPrefix):console.error("No item found for selected route",e.detail.value)},this.runHeaderAction=async(e,t)=>{if(t)try{await Zr(e,this,t)}catch(a){const s=document.createElement("div");s.style.cssText="position: fixed; bottom: 1rem; left: 1rem; z-index: 10000; background: var(--oj-core-danger-3, #b1380b); color: #fff; padding: .75rem 1rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,.25); font-size: .875rem;",s.textContent="La acción falló: "+(""+a),document.body.appendChild(s),setTimeout(()=>s.remove(),6e3)}},this.renderContextActions=e=>o`
        ${(e.contextActions??[]).map(t=>(t.children?.length??0)>0?o`
            <oj-c-menu-button
                    data-oj-binding-provider="preact"
                    label="${t.label}"
                    chroming="solid"
                    style="margin-right: 0.75rem;"
                    .items="${t.children.map(a=>({key:a.actionId,label:a.label}))}"
                    @ojMenuAction="${a=>this.runHeaderAction(e,a.detail?.key)}"
            ></oj-c-menu-button>`:o`
            <oj-c-button
                    data-oj-binding-provider="preact"
                    label="${t.label}"
                    title="${t.label}"
                    chroming="callToAction"
                    style="margin-right: 0.75rem;"
                    @ojAction="${()=>this.runHeaderAction(e,t.actionId)}"
            ></oj-c-button>`)}
    `}get contentUxId(){return this._contentUxId||(this._contentUxId="ux_"+(window.location.pathname||"root").replace(/[^a-zA-Z0-9]/g,"_")+"_app"),this._contentUxId}connectedCallback(){super.connectedCallback(),this.addEventListener("server-side-action-requested",this.captureActionSST,!0),this.addEventListener("action-requested",this.handleUnhandledAction),this.innerFragmentSubscription=Lt.subscribe(e=>{const t=e.fragment;if(t&&this.lastActionInitiatorComponentId&&t.targetComponentId===this.lastActionInitiatorComponentId&&t.state?._route!==void 0){const a=t.state._route;if(a!==""&&!a.startsWith("/")){this.lastActionInitiatorComponentId=void 0,this.lastActionServerSideType=void 0;return}const s=t.state._componentRoute||"",i=this.component?.metadata,r=this.renderRoot?.querySelector("#"+this.contentUxId),n=r?.consumedRoute&&r.consumedRoute!=="_empty"?r.consumedRoute:"",l=s||this.selectedConsumedRoute||n||i?.homeConsumedRoute||"",c=l+a;this.lastActionInitiatorComponentId=void 0,c!==this.selectedRoute&&(this.selectedConsumedRoute=l,this.selectedRoute=c,this.lastActionServerSideType&&(this.selectedServerSideType=this.lastActionServerSideType),this.state&&this.state._route!=null&&(this.state._route=void 0),this.instant=ye()),this.lastActionServerSideType=void 0}})}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.captureActionSST,!0),this.removeEventListener("action-requested",this.handleUnhandledAction),this.innerFragmentSubscription?.unsubscribe()}render(){const e=this.component.metadata,t=this.data.opened==null?!0:this.data.opened;this.data.opened=t;const a=i=>{console.log("open",this.data.opened),this.data.opened=!this.data.opened,this.requestUpdate()},s=i=>{this.data.opened=!1,this.requestUpdate()};if(e.variant==$e.MEDIATOR)return o`
                        <mateu-api-caller>
                            <mateu-ux
                                    route="${De(this.state,this,e)}"
                                    id="ux_${this.id}"
                                    baseUrl="${_e(this,e)}"
                                    consumedRoute="${re(this,e)}"
                                    serverSideType="${Ee(this,e)}"
                                    uriPrefix="${Pe(this,e)}"
                                    style="width: 100%;"
                                    .appState="${this.appState}"
                                    .appData="${this.appData}"
                                    instant="${this.instant}"
                                    @navigation-requested="${this.updateRoute}"
                            ></mateu-ux>
                        </mateu-api-caller>
`;if($e.TABS==e.variant){const i=e.menu.map(r=>({label:r.label,itemKey:r.route}));return o`<div>
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
                                route="${De(this.state,this,e)}"
                                id="${this.contentUxId}"
                                baseUrl="${_e(this,e)}"
                                consumedRoute="${re(this,e)}"
                                serverSideType="${Ee(this,e)}"
                                uriPrefix="${Pe(this,e)}"
                                style="width: 100%;"
                                .appState="${this.appState}"
                                .appData="${this.appData}"
                                instant="${this.instant}"
                                @navigation-requested="${this.updateRoute}"
                        ></mateu-ux>
                    </mateu-api-caller>
                </div>
            </div>
        </div>`}if($e.MENU_ON_LEFT==e.variant){const i=e.menu.map(h=>({label:h.label,itemKey:h.route}));if(!e.homeRoute||e.homeRoute==="_no_home_route"){const h=e.menu[0];e.homeRoute=h?.submenus?.length?h.submenus[0].route:h?.route??""}const r=this.data.activeTopRoute??e.menu.find(h=>h.route===e.homeRoute||h.submenus?.some(p=>p.route===e.homeRoute))?.route??e.menu[0]?.route??"";this.data.activeTopRoute=r;const n=e.menu.find(h=>h.route===r),l=(n?.submenus??[]).map(h=>({label:h.label,itemKey:h.route}));if(this.data.activeConsumedRoute===void 0){const h=n?.submenus?.find(p=>p.route===e.homeRoute);this.data.activeConsumedRoute=h?.consumedRoute??n?.consumedRoute??e.homeConsumedRoute??"",this.data.activeServerSideType=h?.serverSideType??n?.serverSideType??e.homeServerSideType??""}const c=h=>{const p=h.detail.value;this.data.activeTopRoute=p;const f=e.menu.find(g=>g.route===p);if(f?.submenus?.length){const g=f.submenus[0];this.data.activeConsumedRoute=g.consumedRoute??"",this.data.activeServerSideType=g.serverSideType??f.serverSideType??e.serverSideType??"",this.selected({...h,detail:{...h.detail,value:g.route}},this,this.baseUrl??"",e)}else this.data.activeConsumedRoute=f?.consumedRoute??"",this.data.activeServerSideType=f?.serverSideType??e.serverSideType??"",this.selected({...h,detail:{...h.detail,value:p}},this,this.baseUrl??"",e)},u=h=>{const p=h.detail.value,g=e.menu.flatMap(y=>y.submenus??[]).find(y=>y.route===p);this.data.activeConsumedRoute=g?.consumedRoute??"",this.data.activeServerSideType=g?.serverSideType??e.serverSideType??"",this.selected(h,this,this.baseUrl??"",e)};return o`<div style="${this.style??d}">
            <oj-c-tab-bar
                    .data="${i}"
                    .selection="${r}"
                    @ojSelectionAction="${c}"
                    edge="top"
                    layout="condense"
                    display="standard"
                    aria-label="Main navigation"
            ></oj-c-tab-bar>
            ${l.length>0?o`
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
                            route="${De(this.state,this,e)}"
                            id="${this.contentUxId}"
                            baseUrl="${_e(this,e)}"
                            consumedRoute="${re(this,e)}"
                            serverSideType="${Ee(this,e)}"
                            uriPrefix="${Pe(this,e)}"
                            style="width: 100%;"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                            instant="${this.instant}"
                            @navigation-requested="${this.updateRoute}"
                    ></mateu-ux>
                </mateu-api-caller>
            </div>
        </div>`}return o`
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
                                               @ojAction="${a}" display="icons"
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
                            ${e.notificationsEnabled?o`
                                <mateu-notification-bell style="margin-right: 0.75rem;" .app="${e}" .baseUrl="${""}"></mateu-notification-bell>`:d}
                            ${(e.contextSelectors??[]).map(i=>o`
                                <mateu-app-context-picker style="margin-right: 0.75rem;" .selector="${i}" .app="${e}" .baseUrl="${""}"></mateu-app-context-picker>`)}
                            ${this.renderContextActions(e)}
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
                <oj-c-drawer-layout .startOpened="${t}"
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
                                ${e.menu.map(i=>o`
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
                                        ${i.submenus&&i.submenus.length>0?o`
                                        <ul>
                                            ${i.submenus.map(r=>o`
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
                                        route="${De(this.state,this,e)}"
                                        id="${this.contentUxId}"
                                        baseUrl="${_e(this,e)}"
                                        consumedRoute="${re(this,e)}"
                                        serverSideType="${Ee(this,e)}"
                                        uriPrefix="${Pe(this,e)}"
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



        </div>`}};Qe.styles=C`
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
  `;Et([$()],Qe.prototype,"filter",2);Et([$()],Qe.prototype,"instant",2);Et([$()],Qe.prototype,"selectedConsumedRoute",2);Et([$()],Qe.prototype,"selectedRoute",2);Et([$()],Qe.prototype,"selectedUriPrefix",2);Et([$()],Qe.prototype,"selectedBaseUrl",2);Et([$()],Qe.prototype,"selectedServerSideType",2);Et([$()],Qe.prototype,"selectedParams",2);Qe=Et([k("mateu-redwood-app")],Qe);const Xh=(e,t,a,s,i,r,n)=>o`
        <mateu-redwood-app
                id="${t.id}"
                baseUrl="${a}"
                .component="${t}"
                .state="${s}"
                .data="${i}"
                style="${t.style}"
                class="${t.cssClasses}"
                .appState="${r}"
                .appData="${n}"
                style="width: 100%;"
        ></mateu-redwood-app>
    `,Qh=(e,t,a,s,i,r,n)=>{const l=t.metadata;return o`
        
        <mateu-redwood-form 
                id="${t.id}" 
            baseUrl="${a}"
                .component="${t}"
                .values="${s}"
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??d}"
                >

            ${l?.toolbar?.map(c=>o`
                ${w(e,{metadata:c,type:oe.ClientSide,slot:"header"},void 0,{},{},r,n)}
            `)}
            
                    ${t.children?.map(c=>w(e,c,a,s,i,r,n))}
                ${l?.buttons?.map(c=>o`
                   ${w(e,{metadata:c,type:oe.ClientSide,slot:"buttons"},void 0,{},{},r,n)}
`)}

                </mateu-redwood-form>
        
    
    `},Zh=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=l.title||l.subtitle||l.toolbar?.length||l.header?.length||l.avatar;return o`
        <div style="display: flex; flex-direction: column; width: 100%; ${t.style??""}" slot="${t.slot??d}" class="${t.cssClasses}">
            ${l.breadcrumbs?.length>0?o`
                <div style="display: flex; align-items: center; gap: 0.25rem; padding: 0.5rem 0; flex-wrap: wrap;">
                    ${l.breadcrumbs.map((u,h)=>o`
                        ${h>0?o`<span>/</span>`:d}
                        ${u.link?o`
                            <oj-c-button
                                data-oj-binding-provider="preact"
                                label="${u.text}"
                                chroming="borderless"
                                @ojAction="${()=>{window.location.href=u.link}}"
                            ></oj-c-button>
                        `:o`<span>${u.text}</span>`}
                    `)}
                </div>
            `:d}
            ${c?o`
                <div style="display: flex; align-items: center; width: 100%; gap: 1rem; padding: 0.5rem 0;">
                    <div style="flex: 1;">
                        <h2 style="margin-block-end: 0px;">${ge(xt(l.title,s,i))}</h2>
                        <span style="display: inline-block;">${ge(xt(l.subtitle,s,i))}</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                        ${l.header?.map(u=>w(e,u,a,s,i,r,n))}
                        ${l.toolbar?.map(u=>w(e,{metadata:u,type:oe.ClientSide,slot:""},void 0,{},{},r,n))}
                    </div>
                </div>
            `:d}
            <div style="width: 100%;">
                ${t.children?.map(u=>w(e,u,a,s,i,r,n))}
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; padding: 0.5rem 0;">
                    ${l.buttons?.map(u=>w(e,{metadata:u,type:oe.ClientSide,slot:""},void 0,{},{},r,n))}
                </div>
            </div>
            ${l.footer?.length?o`
                <div>
                    ${l.footer.map(u=>w(e,u,a,s,i,r,n))}
                </div>
            `:d}
        </div>
    `},vi=(e,t)=>e?e.includes("${")&&t._evalTemplate?t._evalTemplate(e):e:"",ze=(e,t,a,s,i,r,n)=>(t.children??[]).map(l=>w(e,l,a,s,i,r,n)),Oo=e=>{const t=e?.metadata?.type;return t==="FormRow"||t==="FormItem"?(e.children??[]).flatMap(Oo):[e]},em=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=Math.max(1,l.maxColumns??1),u=(t.children??[]).flatMap(Oo),h=p=>{const f=p?.metadata?.colspan,g=typeof f=="number"?f:parseInt(f??"1",10);return Math.min(Math.max(isNaN(g)?1:g,1),c)};return o`
        <div style="display:grid; grid-template-columns: repeat(${c}, minmax(0,1fr)); gap:.5rem 1.5rem; align-items:start;">
            ${u.map(p=>o`<div style="grid-column: span ${h(p)}; min-width:0; overflow:hidden;">${w(e,p,a,s,i,r,n)}</div>`)}
        </div>`},tm=(e,t,a,s,i,r,n)=>o`<div style="display:flex; flex-direction:row; gap:1rem; flex-wrap:wrap;">${ze(e,t,a,s,i,r,n)}</div>`,am=(e,t,a,s,i,r,n)=>{const l=vi(t.metadata.title,e);return o`
        <div class="oj-panel oj-panel-shadow-sm" style="padding:1rem; margin-bottom:1rem; border-radius:var(--oj-core-border-radius-lg, 8px);"
             slot="${t.slot??d}">
            ${l?o`<h2 class="oj-typography-heading-sm" style="margin:0 0 .75rem;">${l}</h2>`:d}
            <div style="display:flex; flex-direction:column; gap:.5rem;">
                ${ze(e,t,a,s,i,r,n)}
            </div>
        </div>`},im=(e,t,a,s,i,r,n)=>{const l=vi(t.metadata.title,e);return o`
        <div style="margin:.5rem 0;" slot="${t.slot??d}">
            ${l?o`<h3 class="oj-typography-subheading-sm" style="margin:0 0 .5rem;">${l}</h3>`:d}
            <div style="display:flex; flex-direction:column; gap:.5rem;">${ze(e,t,a,s,i,r,n)}</div>
        </div>`},sm=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=l?.spacing===!1?"0":"1rem";return o`<div style="display:flex; flex-direction:row; gap:${c}; ${l?.wrap?"flex-wrap:wrap;":""} ${l?.fullWidth?"width:100%;":""} ${t.style??""}"
                     slot="${t.slot??d}">${ze(e,t,a,s,i,r,n)}</div>`},rm=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=l?.spacing===!1?"0":".75rem";return o`<div style="display:flex; flex-direction:column; gap:${c}; ${l?.fullWidth?"width:100%;":""} ${t.style??""}"
                     slot="${t.slot??d}">${ze(e,t,a,s,i,r,n)}</div>`},om=(e,t,a,s,i,r,n)=>{const l=t.metadata?.orientation==="vertical"?"column":"row";return o`<div style="display:flex; flex-direction:${l}; gap:1rem; width:100%; ${t.style??""}" slot="${t.slot??d}">
        ${(t.children??[]).map(c=>o`<div style="flex:1; min-width:0;">${w(e,c,a,s,i,r,n)}</div>`)}
    </div>`},nm=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=h=>h?w(e,h,a,s,i,r,n):d,u=typeof l.title=="string"?l.title:"";if(t.cssClasses?.includes("mateu-section")){const h=u?o`<h2 class="oj-typography-heading-sm" style="margin: 0;">${u}</h2>`:typeof l.title=="object"&&l.title?c(l.title):d;return o`
            <section class="${t.cssClasses}" style="margin: 0 0 1.5rem 0; min-width: 0; overflow-x: auto; ${t.style??""}"
                 slot="${t.slot??d}">
                ${h!==d?o`
                    <div style="padding-bottom: .5rem; border-bottom: 1px solid var(--oj-core-divider-color, rgba(22, 21, 19, 0.2));">${h}</div>
                `:d}
                <div style="padding-top: .75rem;">
                    ${c(l.content)}
                    ${ze(e,t,a,s,i,r,n)}
                    ${c(l.footer)}
                </div>
            </section>`}return o`
        <div class="oj-panel oj-panel-shadow-sm" style="border-radius:var(--oj-core-border-radius-lg, 8px); overflow:hidden;"
             slot="${t.slot??d}">
            ${u?o`<h2 class="oj-typography-heading-sm" style="margin:0; padding:.75rem 1rem; border-bottom:1px solid var(--oj-core-divider-color, #e0e0e0);">${u}</h2>`:d}
            <div style="padding:1rem;">
                ${typeof l.title=="object"?c(l.title):d}
                ${c(l.content)}
                ${ze(e,t,a,s,i,r,n)}
                ${c(l.footer)}
            </div>
        </div>`},lm=e=>{switch(e){case"h1":return"oj-typography-heading-xl";case"h2":return"oj-typography-heading-lg";case"h3":return"oj-typography-heading-md";case"h4":return"oj-typography-heading-sm";case"h5":case"h6":return"oj-typography-subheading-sm";default:return"oj-typography-body-md"}},dm=(e,t,a)=>{const s=t.metadata,i=vi(s.text,e);return o`<div class="${lm(s.container)}" style="${t.style??""}">${i}</div>`},cm=e=>{const t=e.metadata,a=t.color;return o`<oj-c-badge variant="${a==="success"?"success":a==="error"||a==="danger"?"danger":a==="warning"?"warning":a==="info"?"info":"neutral"}" slot="${e.slot??d}">${t.text??""}</oj-c-badge>`},um=e=>{const t=e.metadata;return o`<a class="oj-link-standalone" href="${t.url??"#"}" slot="${e.slot??d}">${t.text??t.url??""}</a>`},ms=(e,t)=>{t&&e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:{}},bubbles:!0,composed:!0}))},Ro=(e,t,a)=>o`
    <div style="position:fixed; inset:0; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:1000;">
        <div class="oj-panel oj-panel-shadow-lg" role="dialog" aria-modal="true"
             style="background:var(--oj-core-bg-color-content, #fff); border-radius:var(--oj-core-border-radius-lg, 8px); min-width:320px; max-width:90vw; max-height:90vh; overflow:auto;">
            ${e?o`<h2 class="oj-typography-heading-sm" style="margin:0; padding:1rem; border-bottom:1px solid var(--oj-core-divider-color, #e0e0e0);">${e}</h2>`:d}
            <div style="padding:1rem;">${t}</div>
            ${a?o`<div style="display:flex; gap:.5rem; justify-content:flex-end; padding:.75rem 1rem; border-top:1px solid var(--oj-core-divider-color, #e0e0e0);">${a}</div>`:d}
        </div>
    </div>`,pm=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=vi(l.headerTitle,e),u=p=>p?w(e,p,a,s,i,r,n):d,h=o`${u(l.content)}${ze(e,t,a,s,i,r,n)}`;return Ro(c,h,u(l.footer))},hm=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=vi(l.header,e),u=l.content?w(e,l.content,a,s,i,r,n):d,h=o`
        ${l.canCancel?o`<oj-c-button label="${l.cancelText??"Cancel"}" @ojAction="${p=>ms(p.target,l.cancelActionId)}"></oj-c-button>`:d}
        ${l.canReject?o`<oj-c-button label="${l.rejectText??"No"}" @ojAction="${p=>ms(p.target,l.rejectActionId)}"></oj-c-button>`:d}
        <oj-c-button chroming="callToAction" label="${l.confirmText??"OK"}" @ojAction="${p=>ms(p.target,l.confirmActionId)}"></oj-c-button>`;return Ro(c,u,h)},mm=(e,t,a,s,i,r,n)=>o`<div style="overflow: auto; ${t.style??""}" class="${t.cssClasses??d}"
              slot="${t.slot??d}">${ze(e,t,a,s,i,r,n)}</div>`,vm=(e,t,a,s,i,r,n)=>o`<div style="width: 100%; ${t.style??""}" class="${t.cssClasses??d}"
              slot="${t.slot??d}">${ze(e,t,a,s,i,r,n)}</div>`,fm=(e,t,a,s,i,r,n)=>o`<div style="max-width: min(100%, 1200px); margin: auto; ${t.style??""}" class="${t.cssClasses??d}"
              slot="${t.slot??d}">${ze(e,t,a,s,i,r,n)}</div>`,bm=(e,t,a,s,i,r,n)=>o`<div style="display: flex; flex-direction: column; gap: 1rem; width: 100%; ${t.style??""}"
              class="${t.cssClasses??d}" slot="${t.slot??d}">
        ${ze(e,t,a,s,i,r,n)}</div>`,gm=(e,t,a,s,i,r,n)=>{const l=c=>c?.metadata?.type==="BoardLayoutItem"?c.metadata.boardCols??1:1;return o`<div style="display: flex; flex-direction: row; gap: 1rem; width: 100%; ${t.style??""}"
                     class="${t.cssClasses??d}" slot="${t.slot??d}">
        ${(t.children??[]).map(c=>o`
            <div style="flex: ${l(c)} 1 0; min-width: 0;">${w(e,c,a,s,i,r,n)}</div>`)}
    </div>`},$m=(e,t,a,s,i,r,n)=>o`<div style="${t.style??""}" class="${t.cssClasses??d}">
        ${ze(e,t,a,s,i,r,n)}</div>`,ym=(e,t,a,s,i,r,n)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,u=!!i?.hasDetail||!!l,h=c??l;return o`
        <div style="display: flex; gap: 0; width: 100%; border: 1px solid var(--oj-core-divider-color, #e0e0e0); border-radius: var(--oj-core-border-radius-lg, 8px); overflow: hidden; ${t.style??""}"
             class="${t.cssClasses??d}" slot="${t.slot??d}">
            <div style="flex: 1; min-width: 0; overflow-y: auto;">
                ${w(e,t.children[0],a,s,i,r,n)}
            </div>
            <div style="flex: 1; min-width: 0; overflow-y: auto; border-left: 1px solid var(--oj-core-divider-color, #e0e0e0); ${u&&h?"":"display: flex; align-items: center; justify-content: center;"}">
                ${u&&h?w(e,h,a,s,i,r,n):o`<span style="color: var(--oj-core-text-color-secondary, #666); font-size: 0.875rem; padding: 1rem;">Select an item to view details</span>`}
            </div>
        </div>`},xm=(e,t,a,s,i,r,n)=>{const l=t.metadata,c=h=>p=>{const g=p.target.closest(".rw-carousel-wrap")?.querySelector(":scope > .rw-carousel");g?.scrollBy({left:h*g.clientWidth,behavior:"smooth"})},u=l?.nav!==!1;return o`
        <div class="rw-carousel-wrap ${t.cssClasses??""}" style="position: relative; width: 100%; ${t.style??""}"
             slot="${t.slot??d}">
            <div class="rw-carousel" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 1rem; scrollbar-width: none;">
                ${(t.children??[]).map(h=>o`
                    <div style="scroll-snap-align: start; flex: 0 0 100%; min-width: 0;">${w(e,h,a,s,i,r,n)}</div>`)}
            </div>
            ${u?o`
                <div style="display: flex; gap: 0.5rem; justify-content: center; padding-top: 0.5rem;">
                    <oj-c-button data-oj-binding-provider="preact" label="‹" chroming="outlined" @ojAction="${c(-1)}"></oj-c-button>
                    <oj-c-button data-oj-binding-provider="preact" label="›" chroming="outlined" @ojAction="${c(1)}"></oj-c-button>
                </div>
            `:d}
        </div>`};var wm=Object.defineProperty,km=Object.getOwnPropertyDescriptor,Pt=(e,t,a,s)=>{for(var i=s>1?void 0:s?km(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&wm(t,a,i),i};let ut=class extends S{constructor(){super(...arguments),this.selected=0}createRenderRoot(){return this}label(e){const t=e?.metadata?.label;return t&&typeof t=="string"&&t.includes("${")&&this.container?._evalTemplate?this.container._evalTemplate(t):t??""}render(){const e=this.component?.children??[],t=e.map((s,i)=>({itemKey:String(i),label:this.label(s)})),a=e[this.selected];return o`
            <div>
                <oj-c-tab-bar data-oj-binding-provider="preact"
                        .data="${t}"
                        .selection="${String(this.selected)}"
                        edge="top"
                        @ojSelectionAction="${s=>{this.selected=parseInt(s.detail.value,10)||0}}"
                ></oj-c-tab-bar>
                <div role="tabpanel" style="padding-top: 1rem;">
                    ${(a?.children??[]).map(s=>w(this.container,s,this.baseUrl,this.compState,this.compData,this.appState,this.appData))}
                </div>
            </div>`}};Pt([m({attribute:!1})],ut.prototype,"component",2);Pt([m({attribute:!1})],ut.prototype,"container",2);Pt([m()],ut.prototype,"baseUrl",2);Pt([m({attribute:!1})],ut.prototype,"compState",2);Pt([m({attribute:!1})],ut.prototype,"compData",2);Pt([m({attribute:!1})],ut.prototype,"appState",2);Pt([m({attribute:!1})],ut.prototype,"appData",2);Pt([$()],ut.prototype,"selected",2);ut=Pt([k("mateu-redwood-tabs")],ut);var Cm=Object.defineProperty,Sm=Object.getOwnPropertyDescriptor,Tt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Sm(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Cm(t,a,i),i};let pt=class extends S{constructor(){super(...arguments),this.open={},this.initialized=!1}createRenderRoot(){return this}label(e){const t=e?.metadata?.label;return t&&typeof t=="string"&&t.includes("${")&&this.container?._evalTemplate?this.container._evalTemplate(t):t??""}render(){const e=this.component?.children??[];return this.initialized||(e.forEach((t,a)=>{t?.metadata?.active&&(this.open[a]=!0)}),this.initialized=!0),o`
            <div style="display:flex; flex-direction:column; gap:.5rem;">
                ${e.map((t,a)=>{const s=!!this.open[a];return o`
                        <oj-c-collapsible data-oj-binding-provider="preact"
                                ?expanded="${s}"
                                ?disabled="${t?.metadata?.disabled}"
                                @ojExpand="${()=>{this.open={...this.open,[a]:!0}}}"
                                @ojCollapse="${()=>{this.open={...this.open,[a]:!1}}}">
                            <span slot="header" class="oj-typography-heading-sm">${this.label(t)}</span>
                            <div>
                                ${(t?.children??[]).map(i=>w(this.container,i,this.baseUrl,this.compState,this.compData,this.appState,this.appData))}
                            </div>
                        </oj-c-collapsible>`})}
            </div>`}};Tt([m({attribute:!1})],pt.prototype,"component",2);Tt([m({attribute:!1})],pt.prototype,"container",2);Tt([m()],pt.prototype,"baseUrl",2);Tt([m({attribute:!1})],pt.prototype,"compState",2);Tt([m({attribute:!1})],pt.prototype,"compData",2);Tt([m({attribute:!1})],pt.prototype,"appState",2);Tt([m({attribute:!1})],pt.prototype,"appData",2);Tt([$()],pt.prototype,"open",2);pt=Tt([k("mateu-redwood-accordion")],pt);var Im=Object.defineProperty,_m=Object.getOwnPropertyDescriptor,fi=(e,t,a,s)=>{for(var i=s>1?void 0:s?_m(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Im(t,a,i),i};let Ta=class extends S{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.pages=[]}createRenderRoot(){return this}updated(e){if(super.updated(e),e.has("totalElements")||e.has("pageNumber")||e.has("pageSize")){const t=[],s=Math.ceil(this.totalElements/this.pageSize)-1;this.totalElements>0&&(this.pageNumber>0&&t.push({pageNumber:0,text:"First",clickable:!0}),this.pageNumber>1&&t.push({pageNumber:this.pageNumber-1,text:"Prev",clickable:!0}),t.push({pageNumber:this.pageNumber,text:`${this.pageNumber}`,clickable:!1}),this.pageNumber<s-1&&t.push({pageNumber:parseInt(""+this.pageNumber)+1,text:"Next",clickable:!0}),this.pageNumber<s&&t.push({pageNumber:s,text:"Last",clickable:!0})),this.pages=t}}goToPage(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){return this.totalElements?o`
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; padding: 0.25rem 0;">
                ${this.pages.length<2||this.totalElements<=this.pageSize?d:o`
                    <span>Page:</span>
                    ${this.pages.map(e=>e.clickable?o`
                        <oj-c-button
                            data-oj-binding-provider="preact"
                            label="${e.text}"
                            chroming="borderless"
                            @ojAction="${()=>this.goToPage(e.pageNumber)}"
                        ></oj-c-button>
                    `:o`<span>[ ${e.text} ]</span>`)}
                `}
                <span>Total elements: ${this.totalElements}</span>
                <slot></slot>
            </div>
        `:o`${d}`}};fi([m({type:Number})],Ta.prototype,"totalElements",2);fi([m({type:Number})],Ta.prototype,"pageSize",2);fi([m({type:Number})],Ta.prototype,"pageNumber",2);fi([$()],Ta.prototype,"pages",2);Ta=fi([k("mateu-redwood-pagination")],Ta);const br=new WeakMap,Em=e=>{const t=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},Pm=new Set([v.App,v.Page,v.Form,v.Button,v.FormField,v.FormLayout,v.FormRow,v.FormSection,v.FormSubSection,v.HorizontalLayout,v.VerticalLayout,v.SplitLayout,v.MasterDetailLayout,v.Scroller,v.FullWidth,v.Container,v.BoardLayout,v.BoardLayoutRow,v.BoardLayoutItem,v.CarouselLayout,v.Card,v.Text,v.Badge,v.Anchor,v.Icon,v.Breadcrumbs,v.Notification,v.ProgressBar,v.Details,v.Avatar,v.AvatarGroup,v.Tooltip,v.Popover,v.MenuBar,v.ContextMenu,v.TabLayout,v.AccordionLayout,v.Dialog,v.Drawer,v.ConfirmDialog,v.Grid,v.Table,v.VirtualList,v.Directory,v.CustomField,v.MessageList,v.MessageInput,v.Crud,v.Element,v.Div,v.Image,v.MicroFrontend,v.Markdown,v.Chart,v.Bpmn,v.Map,v.Chat,v.CookieConsent,v.Workflow,v.WorkflowElk,v.FormEditor,v.MetricCard,v.Scoreboard,v.DashboardPanel,v.DashboardLayout,v.FoldoutLayout,v.HeroSection,v.EmptyState,v.Skeleton,v.Gantt,v.PlanningBoard,v.Kanban,v.Timeline,v.ProgressSteps,v.Stat,v.Calendar,v.PricingTable,v.OrgChart,v.Heatmap,v.Funnel,v.TrendChart,v.FeatureGrid,v.Testimonials,v.Faq,v.CalloutCard,v.CommentThread,v.FileList,v.Checklist,v.ComparisonCard,v.EntityHeader,v.Meter,v.TaskProgress,v.StatusList,v.BulletedList,v.Separator,v.Notice,v.TaskQueue,v.ResourceGrid,v.OfferCard,v.AddOnPicker,v.Ledger,v.PaymentPicker,v.ProcessMonitor]);class Tm extends du{rendererName(){return"redwood-oj"}supportedClientSideTypes(){return Pm}rendersCrudLayouts(){return!0}renderFilterBar(t,a,s,i,r,n,l){const c=a?.metadata,u=c?.filters??[],h=br.get(t)??{open:!1,text:"",viewsOpen:!1};br.set(t,h);const p=()=>t.requestUpdate(),f=()=>{h.outsideClick&&(document.removeEventListener("mousedown",h.outsideClick),h.outsideClick=void 0)},g=()=>{f(),h.open=!1,h.viewsOpen=!1,h.activeFilter=void 0,p()},y=()=>{f(),h.outsideClick=b=>{b.composedPath().some(z=>z instanceof HTMLElement&&z.classList?.contains("mateu-smart-search"))||g()},document.addEventListener("mousedown",h.outsideClick)},x=()=>{h.open||(h.open=!0,h.viewsOpen=!1,y(),p())},P=()=>{const b=!h.viewsOpen;h.open=!1,h.activeFilter=void 0,h.viewsOpen=b,b?y():f(),p()},q=()=>{f(),h.open=!1,h.viewsOpen=!1,h.activeFilter=void 0,t.search()},ae=(b,E)=>{i[b]=E,q()},N=b=>{const E=u.find(z=>z.fieldId===b);E&&K(E)?(i[`${b}_from`]=void 0,i[`${b}_to`]=void 0):i[b]=b==="searchText"?"":void 0,q()},ne=b=>{i.searchText=b.value,h.text="",b.value="",q()},ue=b=>b.dataType==="boolean"||b.dataType==="bool"||b.stereotype==="checkbox"||b.stereotype==="toggle",ie=b=>["integer","decimal","number","money"].includes(b.dataType),K=b=>b.stereotype==="dateRange"||b.stereotype==="numberRange",Z=b=>b.stereotype==="multiSelect",fe=b=>(b.options?.length??0)>0,I=b=>{const E=i[b.fieldId];return Array.isArray(E)?E.map(String):typeof E=="string"&&E!==""?E.split(",").map(z=>z.trim()).filter(z=>z):[]},L=(b,E)=>{const z=i[`${b.fieldId}_${E}`];return z==null?"":String(z)},T=b=>{if(K(b))return L(b,"from")!==""||L(b,"to")!=="";if(Z(b))return I(b).length>0;const E=i[b.fieldId];return E!=null&&E!==""},ee=(b,E)=>{const z=b?.options?.find(U=>U.value===String(E));return z?z.label??z.value:typeof E=="boolean"?E?"Yes":"No":String(E)},at=b=>{if(K(b)){const E=L(b,"from"),z=L(b,"to");return E&&z?`${E} – ${z}`:E?`≥ ${E}`:`≤ ${z}`}return Z(b)?I(b).map(E=>ee(b,E)).join(", "):ee(b,i[b.fieldId])},Ie=window.location.pathname,it=()=>["searchText",...u.flatMap(b=>K(b)?[`${b.fieldId}_from`,`${b.fieldId}_to`]:[b.fieldId])],ft=()=>!!i.searchText||u.some(b=>T(b)),R=()=>{const b={};return i.searchText&&(b.searchText=i.searchText),u.forEach(E=>{if(T(E))if(K(E)){const z=L(E,"from"),U=L(E,"to");z&&(b[`${E.fieldId}_from`]=z),U&&(b[`${E.fieldId}_to`]=U)}else Z(E)?b[E.fieldId]=I(E):b[E.fieldId]=i[E.fieldId]}),b},se=b=>{it().forEach(E=>{i[E]=void 0}),Object.entries(b.values).forEach(([E,z])=>{i[E]=z}),q()},pe=b=>{const E=b.value.trim();E&&(vo(Ie,{name:E,values:R()}),b.value="",p())};if(!h.defaultViewChecked&&(h.defaultViewChecked=!0,!window.location.search)){const b=go(Ie);b&&setTimeout(()=>{ft()||se(b)},0)}const D=[];i.searchText&&D.push({fieldId:"searchText",label:"Text",display:String(i.searchText)}),u.forEach(b=>{T(b)&&D.push({fieldId:b.fieldId,label:b.label||b.fieldId,display:at(b)})});const A="var(--mateu-redwood-text, rgb(22, 21, 19))",_=`display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 0.75rem; cursor: pointer; color: ${A}; font-size: 0.875rem;`,M=b=>b.preventDefault(),be=(b,E,z=!1)=>o`
            <div style="${_} ${z?"font-weight: 600;":""}"
                 @mousedown="${M}"
                 @click="${E}"
                 onmouseover="this.style.background='rgba(22,21,19,0.06)'"
                 onmouseout="this.style.background='transparent'">${b}</div>`,ea=`flex: 1; min-width: 0; font: inherit; font-size: 0.875rem; color: ${A}; border: 1px solid rgba(22,21,19,0.5); border-radius: 4px; padding: 0.35rem 0.5rem; outline: none;`,bt="font: inherit; font-size: 0.875rem; background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); color: #fff; border: 1px solid transparent; border-radius: 4px; padding: 0.35rem 0.75rem; cursor: pointer;",gt=b=>{const E=b.stereotype==="numberRange"?"number":b.dataType==="dateTime"?"datetime-local":b.dataType==="time"?"time":"date",z=Y=>{const Ma=Y.closest(".range-row");i[`${b.fieldId}_from`]=Ma.querySelector("input.range-from").value||void 0,i[`${b.fieldId}_to`]=Ma.querySelector("input.range-to").value||void 0,q()},U=Y=>{Y.key==="Enter"&&z(Y.target),Y.key==="Escape"&&g()};return o`
                <div class="range-row" style="display: flex; gap: 0.5rem; align-items: center; padding: 0.5rem 0.75rem;">
                    <input class="range-from" type="${E}" placeholder="From" style="${ea}"
                           .value="${L(b,"from")}"
                           @mousedown="${Y=>Y.stopPropagation()}"
                           @keydown="${U}"/>
                    <span aria-hidden="true" style="color: rgba(22,21,19,0.55);">–</span>
                    <input class="range-to" type="${E}" placeholder="To" style="${ea}"
                           .value="${L(b,"to")}"
                           @mousedown="${Y=>Y.stopPropagation()}"
                           @keydown="${U}"/>
                    <button style="${bt}"
                            @mousedown="${M}"
                            @click="${Y=>z(Y.target)}">Apply</button>
                </div>`},is=b=>{const E=I(b),z=Y=>{const Ma=E.includes(Y)?E.filter(Lo=>Lo!==Y):[...E,Y];i[b.fieldId]=Ma.length>0?Ma:void 0,t.search(),p()},U="display: inline-flex; align-items: center; justify-content: center; width: 1rem; height: 1rem; border-radius: 3px; font-size: 0.7rem; line-height: 1; flex: none;";return o`${(b.options??[]).map(Y=>be(o`
                <span aria-hidden="true" style="${U} ${E.includes(Y.value)?"background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); border: 1px solid transparent; color: #fff;":"border: 1px solid rgba(22,21,19,0.5);"}">${E.includes(Y.value)?"✓":""}</span>
                ${Y.label??Y.value}
            `,()=>z(Y.value)))}`},zo=b=>{if(K(b))return gt(b);if(Z(b))return is(b);if(fe(b))return o`${b.options.map(U=>be(U.label??U.value,()=>ae(b.fieldId,U.value)))}`;if(ue(b))return o`
                    ${be("Yes",()=>ae(b.fieldId,!0))}
                    ${be("No",()=>ae(b.fieldId,!1))}`;const E=ie(b),z=U=>{U.value!==""&&ae(b.fieldId,E?Number(U.value):U.value)};return o`
                <div style="display: flex; gap: 0.5rem; padding: 0.5rem 0.75rem;">
                    <input type="${E?"number":"text"}"
                           placeholder="${b.placeholder||b.label||b.fieldId}"
                           style="flex: 1; font: inherit; font-size: 0.875rem; color: ${A}; border: 1px solid rgba(22,21,19,0.5); border-radius: 4px; padding: 0.35rem 0.5rem; outline: none;"
                           @mousedown="${U=>U.stopPropagation()}"
                           @keydown="${U=>{U.key==="Enter"&&z(U.target),U.key==="Escape"&&g()}}"/>
                    <button style="font: inherit; font-size: 0.875rem; background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); color: #fff; border: 1px solid transparent; border-radius: 4px; padding: 0.35rem 0.75rem; cursor: pointer;"
                            @mousedown="${M}"
                            @click="${U=>z(U.target.previousElementSibling)}">Apply</button>
                </div>`},Ao=h.open&&u.length>0?o`
            <div style="position: absolute; top: calc(100% + 4px); left: 0; min-width: 20rem; max-width: 100%; background: var(--mateu-redwood-panel-bg, #fff); border: 1px solid rgba(22,21,19,0.25); border-radius: 8px; box-shadow: 0 6px 16px rgba(0,0,0,0.15); z-index: 30; overflow: hidden; padding: 0.25rem 0;">
                ${h.activeFilter?o`
                    <div style="${_} font-weight: 600; border-bottom: 1px solid rgba(22,21,19,0.15);"
                         @mousedown="${M}"
                         @click="${()=>{h.activeFilter=void 0,p()}}">
                        <span aria-hidden="true">←</span> ${h.activeFilter.label||h.activeFilter.fieldId}
                    </div>
                    ${zo(h.activeFilter)}
                `:o`
                    <div style="padding: 0.35rem 0.75rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(22,21,19,0.6);">Filter by</div>
                    ${u.map(b=>be(o`
                        ${b.label||b.fieldId}
                        ${T(b)?o`<span style="margin-left: auto; color: rgba(22,21,19,0.55); font-size: 0.8125rem;">${at(b)}</span>`:d}
                    `,()=>{h.activeFilter=b,p()}))}
                `}
            </div>`:d,Ws=`${_} cursor: default; color: rgba(22,21,19,0.6);`,jo=h.viewsOpen?o`
            <div style="position: absolute; top: calc(100% + 4px); right: 0; left: auto; min-width: 20rem; max-width: 100%; background: var(--mateu-redwood-panel-bg, #fff); border: 1px solid rgba(22,21,19,0.25); border-radius: 8px; box-shadow: 0 6px 16px rgba(0,0,0,0.15); z-index: 30; overflow: hidden; padding: 0.25rem 0;">
                <div style="padding: 0.35rem 0.75rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(22,21,19,0.6);">Saved views</div>
                ${Li(Ie).length===0?o`
                    <div style="${Ws}">No saved views yet</div>`:d}
                ${Li(Ie).map(b=>o`
                    <div style="${_}"
                         @mousedown="${M}"
                         onmouseover="this.style.background='rgba(22,21,19,0.06)'"
                         onmouseout="this.style.background='transparent'">
                        <span style="flex: 1 1 auto; cursor: pointer;" @click="${()=>se(b)}">${b.name}</span>
                        <button title="${b.isDefault?"Unset as default":"Open this listing with this view"}"
                                style="border: none; background: none; cursor: pointer; padding: 0 0.15rem; color: ${b.isDefault?"var(--mateu-redwood-cta-bg, rgb(49, 45, 42))":"rgba(22,21,19,0.4)"};"
                                @click="${()=>{bo(Ie,b.name),p()}}">★</button>
                        <button aria-label="Delete view ${b.name}"
                                style="border: none; background: transparent; cursor: pointer; font-size: 0.75rem; line-height: 1; padding: 0.1rem 0.3rem; opacity: 0.6;"
                                @click="${()=>{fo(Ie,b.name),p()}}">✕</button>
                    </div>`)}
                ${ft()?o`
                    <div style="display: flex; gap: 0.5rem; padding: 0.5rem 0.75rem;" @mousedown="${b=>b.stopPropagation()}">
                        <input type="text" placeholder="Save current view as…" style="${ea}"
                               @keydown="${b=>{b.key==="Enter"&&pe(b.target),b.key==="Escape"&&g()}}"/>
                        <button style="${bt}"
                                @mousedown="${M}"
                                @click="${b=>pe(b.target.previousElementSibling)}">Save</button>
                    </div>`:o`
                    <div style="${Ws}">Apply some filters to save a view</div>`}
            </div>`:d;return o`
            <div class="mateu-smart-search" style="position: relative; padding: 0.25rem 0;">
                <div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; border: 1px solid rgba(22,21,19,0.5); border-radius: 8px; padding: 0.3rem 0.6rem; background: var(--mateu-redwood-panel-bg, #fff); cursor: text;"
                     @click="${b=>{b.currentTarget.querySelector("input.smart-search-input")?.focus(),x()}}">
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" style="flex: none; opacity: 0.6;">
                        <path fill="${A.startsWith("var")?"rgb(22,21,19)":A}" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
                    </svg>
                    ${D.map(b=>o`
                        <span style="display: inline-flex; align-items: center; gap: 0.3rem; background: rgba(22,21,19,0.08); border-radius: 1rem; padding: 0.15rem 0.3rem 0.15rem 0.6rem; font-size: 0.8125rem; color: ${A}; white-space: nowrap;">
                            <span style="opacity: 0.7;">${b.label}:</span> ${b.display}
                            <button aria-label="Remove filter ${b.label}"
                                    style="border: none; background: transparent; cursor: pointer; font-size: 0.75rem; line-height: 1; padding: 0.1rem 0.3rem; opacity: 0.6;"
                                    @mousedown="${M}"
                                    @click="${E=>{E.stopPropagation(),N(b.fieldId)}}">✕</button>
                        </span>`)}
                    ${c?.searchable!==!1?o`
                        <input class="smart-search-input" type="text"
                               placeholder="${D.length===0?"Search":""}"
                               .value="${h.text??""}"
                               style="flex: 1 1 8rem; min-width: 7rem; border: none; outline: none; background: transparent; font: inherit; font-size: 0.875rem; color: ${A}; padding: 0.25rem 0;"
                               @input="${b=>{h.text=b.target.value,x()}}"
                               @keydown="${b=>{b.key==="Enter"&&ne(b.target),b.key==="Escape"&&g()}}"/>
                    `:d}
                    <button title="Saved views" aria-label="Saved views"
                            style="margin-left: auto; flex: none; border: none; background: none; cursor: pointer; padding: 0.15rem 0.3rem; color: rgba(22,21,19,0.6); line-height: 1;"
                            @mousedown="${M}"
                            @click="${b=>{b.stopPropagation(),P()}}">
                        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z"/>
                        </svg>
                    </button>
                </div>
                ${Ao}
                ${jo}
                ${c?.header?.map(b=>w(t,b,s,i,r,n,l))}
            </div>
        `}renderToolbarButton(t,a,s){const i=t,r=i.color==="error"||i.variant==="error"||i.variant==="danger"?"danger":i.buttonStyle==="primary"?"callToAction":"outlined",n=r==="danger"?"background: var(--mateu-redwood-danger-bg, rgb(179, 49, 31)); color: #fff; border: 1px solid transparent;":r==="callToAction"?"background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); color: #fff; border: 1px solid transparent;":"background: transparent; color: var(--mateu-redwood-text, rgb(22, 21, 19)); border: 1px solid rgba(22, 21, 19, 0.5);";return o`
            <button
                data-action-id="${i.id}"
                style="${n} border-radius: 4px; height: 40px; padding: 0 16px; font-family: 'Oracle Sans', -apple-system, system-ui, sans-serif; font-size: 0.86rem; font-weight: 600; cursor: pointer; ${i.disabled?"opacity: .4; pointer-events: none;":""}"
                ?disabled="${i.disabled}"
                @click="${s}"
            >${a}</button>
        `}renderPagination(t,a){const s=t.id;return o`
            <mateu-redwood-pagination
                data-oj-binding-provider="preact"
                @page-changed="${t.pageChanged}"
                @fetch-more-elements="${t.fetchMoreElements}"
                totalElements="${t.data[s]?.page?.totalElements??0}"
                pageSize="${t.data[s]?.page?.pageSize??100}"
                pageNumber="${t.data[s]?.page?.pageNumber??0}"
            ></mateu-redwood-pagination>
        `}renderTableComponent(t,a,s,i,r,n,l){return o`
        <mateu-redwood-table id="${t.id}"
                     .metadata="${a?.metadata}"
                     .data="${t.data}"
                     .emptyStateMessage="${i[a?.id]?.emptyStateMessage}"
                     @sort-direction-changed="${t.directionChanged}"
                     @fetch-more-elements="${t.fetchMoreElements}"
                     .state="${i}"
                     .appState="${n}"
                     .appData="${l}"
                     baseUrl="${s}"
        ></mateu-redwood-table>
        `}renderClientSideComponent(t,a,s,i,r,n,l,c){return v.Page==a?.metadata?.type?Zh(t,a,s,i,r,n,l):v.Form==a?.metadata?.type?Qh(t,a,s,i,r,n,l):v.Button==a?.metadata?.type?cu(a):v.FormField==a?.metadata?.type?np(t,a,s,i,r):v.FormLayout==a?.metadata?.type?em(t,a,s,i,r,n,l):v.FormRow==a?.metadata?.type?tm(t,a,s,i,r,n,l):v.FormSection==a?.metadata?.type?am(t,a,s,i,r,n,l):v.FormSubSection==a?.metadata?.type?im(t,a,s,i,r,n,l):v.HorizontalLayout==a?.metadata?.type?sm(t,a,s,i,r,n,l):v.VerticalLayout==a?.metadata?.type?rm(t,a,s,i,r,n,l):v.SplitLayout==a?.metadata?.type?om(t,a,s,i,r,n,l):v.MasterDetailLayout==a?.metadata?.type?ym(t,a,s,i,r,n,l):v.Scroller==a?.metadata?.type?mm(t,a,s,i,r,n,l):v.FullWidth==a?.metadata?.type?vm(t,a,s,i,r,n,l):v.Container==a?.metadata?.type?fm(t,a,s,i,r,n,l):v.BoardLayout==a?.metadata?.type?bm(t,a,s,i,r,n,l):v.BoardLayoutRow==a?.metadata?.type?gm(t,a,s,i,r,n,l):v.BoardLayoutItem==a?.metadata?.type?$m(t,a,s,i,r,n,l):v.CarouselLayout==a?.metadata?.type?xm(t,a,s,i,r,n,l):v.Card==a?.metadata?.type?nm(t,a,s,i,r,n,l):v.Text==a?.metadata?.type?dm(t,a):v.Badge==a?.metadata?.type?cm(a):v.Anchor==a?.metadata?.type?um(a):v.Icon==a?.metadata?.type?ju(a):v.Breadcrumbs==a?.metadata?.type?Lu(a):v.Notification==a?.metadata?.type?Du(a):v.ProgressBar==a?.metadata?.type?Nu(a,i):v.Details==a?.metadata?.type?Fu(t,a,s,i,r,n,l):v.Avatar==a?.metadata?.type?Mu(a,i,r):v.AvatarGroup==a?.metadata?.type?qu(a):v.Tooltip==a?.metadata?.type?Uu(t,a,s,i,r,n,l):v.Popover==a?.metadata?.type?Bu(t,a,s,i,r,n,l):v.MenuBar==a?.metadata?.type?Vu(t,a):v.ContextMenu==a?.metadata?.type?Wu(t,a,s,i,r,n,l):v.Grid==a?.metadata?.type?Eu(a,i):v.Table==a?.metadata?.type?Pu(t,a,s,i,r,n,l):v.VirtualList==a?.metadata?.type?Tu(t,a,s,i,r,n,l):v.Directory==a?.metadata?.type?Ou(a):v.CustomField==a?.metadata?.type?Ru(t,a,s,i,r,n,l):v.MessageList==a?.metadata?.type?zu(a):v.MessageInput==a?.metadata?.type?Au(a):v.TabLayout==a?.metadata?.type?o`<mateu-redwood-tabs
                    .component="${a}" .container="${t}" baseUrl="${s}"
                    .compState="${i}" .compData="${r}" .appState="${n}" .appData="${l}"
            ></mateu-redwood-tabs>`:v.AccordionLayout==a?.metadata?.type?o`<mateu-redwood-accordion
                    .component="${a}" .container="${t}" baseUrl="${s}"
                    .compState="${i}" .compData="${r}" .appState="${n}" .appData="${l}"
            ></mateu-redwood-accordion>`:v.Dialog==a?.metadata?.type?pm(t,a,s,i,r,n,l):v.ConfirmDialog==a?.metadata?.type?hm(t,a,s,i,r,n,l):super.renderClientSideComponent(t,a,s,i,r,n,l,c)}renderAppComponent(t,a,s,i,r,n,l){return Xh(t,a,s,i,r,n,l)}}te.set(new Tm);te.setUseShadowRoot(!1);te.setAfterRenderHook(e=>{});var Om=Object.defineProperty,Rm=Object.getOwnPropertyDescriptor,Ot=(e,t,a,s)=>{for(var i=s>1?void 0:s?Rm(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Om(t,a,i),i};let Ze=class extends S{constructor(){super(...arguments),this.baseUrl="",this.route=void 0,this.consumedRoute="_empty",this.config=void 0,this.top="true",this.pathPrefix=void 0,this.debug=!1,this._lastUrl="",this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top=="true"){let t=e.detail.route,a=this.baseUrl??"";!t||t.startsWith("/")?a=window.location.origin+(this.pathPrefix??""):(t=(this.pathPrefix??"")+t,a.indexOf("://")<0&&(a.startsWith("/")||(a="/"+a),a=window.location.origin+a)),t.startsWith(this.pathPrefix+"/")&&(t=t.substring(this.pathPrefix?.length)),a.endsWith("/")&&t.startsWith("/")&&(t=t.substring(1));let s=new URL(a+t);if((window.location.pathname||s.pathname)&&window.location.pathname!=s.pathname){let i=s.pathname;s.search&&(i+=s.search),i&&!i.startsWith("/")&&(i="/"+i),window.history.pushState({},"",i),this._lastUrl=window.location.href}}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),Dt.markClean(),e instanceof CustomEvent){let t=e.detail.route;const a=this.renderRoot.querySelector("mateu-ux");a&&(a.setAttribute("route",t),a.setAttribute("instant",ye()))}}}createRenderRoot(){return te.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),Dt.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!Dt.confirmLeave()){window.history.pushState({},"",this._lastUrl);return}const t=e.target;this.loadUrl(t)},this.top=="true"?this.loadUrl(window):this.route&&(this.consumedRoute=""),this.config)try{const e=JSON.parse(this.config);le.value={...le.value,...e}}catch{le.value={...le.value,config:this.config}}this.addEventListener("url-update-requested",this.routeChangedListener),this.addEventListener("navigate-to-requested",this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener("url-update-requested",this.routeChangedListener),this.removeEventListener("navigate-to-requested",this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute("route",this.route),this.instant=ye(),this._lastUrl=e.location.href,e.location.search){const a=new URLSearchParams(e.location.search).get("overrides");if(a&&(this.config=a,this.config))try{const s=JSON.parse(this.config);le.value={...le.value,...s}}catch{le.value={...le.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){const t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t=="/"?"":t}addQueryParams(e,t){return e+(t.search?""+t.search:"")}extractGrossRouteFromUrl(e){const t=e.location.pathname,a=this.baseUrl&&(this.baseUrl.startsWith("http://")||this.baseUrl.startsWith("https://"))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(a)?t.substring(a.length):t}getContextPathStartingIndex(e){return e.startsWith("http:")?e.indexOf("/",7):e.startsWith("https:")?e.indexOf("/",8):0}render(){return o`
           <mateu-api-caller>
                <mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${Ka.value}"
                          .appState="${le.value}"
                ></mateu-ux>
           </mateu-api-caller>
           ${this.debug?o`
               <mateu-debug-overlay
                   .appState="${le.value}"
                   .appData="${Ka.value}"
               ></mateu-debug-overlay>
           `:d}
       `}};Ze.styles=C`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `;Ot([m()],Ze.prototype,"baseUrl",2);Ot([m()],Ze.prototype,"route",2);Ot([m()],Ze.prototype,"consumedRoute",2);Ot([m()],Ze.prototype,"config",2);Ot([m()],Ze.prototype,"top",2);Ot([m()],Ze.prototype,"pathPrefix",2);Ot([$()],Ze.prototype,"instant",2);Ot([m({type:Boolean})],Ze.prototype,"debug",2);Ze=Ot([k("mateu-ui")],Ze);var zm=Object.getOwnPropertyDescriptor,Am=(e,t,a,s)=>{for(var i=s>1?void 0:s?zm(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=n(i)||i);return i};let ks=class extends di{constructor(){super(...arguments),this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}render(){const e=this.component?.metadata;return o`
            <div class="form-frame">
                <div class="form-header">
                    <div class="form-titles">
                        ${e?.title?o`<h2>${e.title}</h2>`:""}
                        ${e?.subtitle?o`<span class="form-subtitle">${e.subtitle}</span>`:""}
                    </div>
                    <div class="form-header-actions"><slot name="header"></slot></div>
                </div>
                <slot></slot>
                <div class="form-buttons">
                    <slot name="buttons"></slot>
                </div>
            </div>
       `}};ks.styles=C`
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
  `;ks=Am([k("mateu-redwood-form")],ks);
