const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-highcharts.js","assets/vendor-vaadin.js","assets/vendor-lit.js","assets/vendor.js","assets/vendor-ui5.js","assets/vendor-diagrams.js"])))=>i.map(i=>d[i]);
import{d as o,A as l,a as C,j as p,r as $,i as S,k,m as he,D as Tr,c as P,w as X,p as Jo,q as Be,s as Xo}from"./vendor-lit.js";import{v as Qo,b as Et,e as Zo,f as en,n as Pr,p as Or,N as pa,i as ea,j as Ji,k as Rr,l as ms,m as zs,o as tn}from"./vendor-vaadin.js";import{S as an,n as ke,a as sn,b as rn}from"./vendor.js";import{_ as Oe,N as Ei}from"./vendor-ui5.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function a(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(i){if(i.ep)return;i.ep=!0;const r=a(i);fetch(i.href,r)}})();var v=(e=>(e.Page="Page",e.Div="Div",e.Element="Element",e.MicroFrontend="MicroFrontend",e.Form="Form",e.Crud="Crud",e.Result="Result",e.Card="Card",e.Directory="Directory",e.Stepper="Stepper",e.HorizontalLayout="HorizontalLayout",e.VerticalLayout="VerticalLayout",e.SplitLayout="SplitLayout",e.MasterDetailLayout="MasterDetailLayout",e.TabLayout="TabLayout",e.AccordionLayout="AccordionLayout",e.FormLayout="FormLayout",e.FormRow="FormRow",e.FormItem="FormItem",e.BoardLayout="BoardLayout",e.BoardLayoutRow="BoardLayoutRow",e.BoardLayoutItem="BoardLayoutItem",e.Scroller="Scroller",e.FullWidth="FullWidth",e.Container="Container",e.FormField="FormField",e.Table="Table",e.App="App",e.Text="Text",e.Avatar="Avatar",e.Chat="Chat",e.AvatarGroup="AvatarGroup",e.Badge="Badge",e.Breadcrumbs="Breadcrumbs",e.Anchor="Anchor",e.Button="Button",e.Chart="Chart",e.Icon="Icon",e.ConfirmDialog="ConfirmDialog",e.ContextMenu="ContextMenu",e.CookieConsent="CookieConsent",e.Details="Details",e.Dialog="Dialog",e.Drawer="Drawer",e.Image="Image",e.Map="Map",e.Markdown="Markdown",e.Notification="Notification",e.ProgressBar="ProgressBar",e.Popover="Popover",e.CarouselLayout="CarouselLayout",e.Tooltip="Tooltip",e.MessageInput="MessageInput",e.MessageList="MessageList",e.CustomField="CustomField",e.MenuBar="MenuBar",e.Grid="Grid",e.GridColumn="GridColumn",e.GridGroupColumn="GridGroupColumn",e.VirtualList="VirtualList",e.FormSection="FormSection",e.FormSubSection="FormSubSection",e.Bpmn="Bpmn",e.Workflow="Workflow",e.WorkflowElk="WorkflowElk",e.FormEditor="FormEditor",e.MetricCard="MetricCard",e.Scoreboard="Scoreboard",e.DashboardPanel="DashboardPanel",e.DashboardLayout="DashboardLayout",e.FoldoutLayout="FoldoutLayout",e.HeroSection="HeroSection",e.EmptyState="EmptyState",e.Skeleton="Skeleton",e.Gantt="Gantt",e.PlanningBoard="PlanningBoard",e.Kanban="Kanban",e.Timeline="Timeline",e.ProgressSteps="ProgressSteps",e.Stat="Stat",e.Calendar="Calendar",e.PricingTable="PricingTable",e.OrgChart="OrgChart",e.Heatmap="Heatmap",e.Funnel="Funnel",e.TrendChart="TrendChart",e.FeatureGrid="FeatureGrid",e.Testimonials="Testimonials",e.Faq="Faq",e.CalloutCard="CalloutCard",e.CommentThread="CommentThread",e.FileList="FileList",e.Checklist="Checklist",e.ComparisonCard="ComparisonCard",e.EntityHeader="EntityHeader",e.Meter="Meter",e.TaskProgress="TaskProgress",e.StatusList="StatusList",e.BulletedList="BulletedList",e.Separator="Separator",e.Notice="Notice",e.TaskQueue="TaskQueue",e.ResourceGrid="ResourceGrid",e.OfferCard="OfferCard",e.AddOnPicker="AddOnPicker",e.Ledger="Ledger",e.PaymentPicker="PaymentPicker",e.ProcessMonitor="ProcessMonitor",e))(v||{}),oe=(e=>(e.ServerSide="ServerSide",e.ClientSide="ClientSide",e))(oe||{});class on{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(t){if(this.componentRenderer=t,typeof window<"u"){const a=t.supportedClientSideTypes?.();window.__mateuRendererInfo={name:t.rendererName?.()??t.constructor?.name??"unknown",supportedTypes:a?[...a].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(t){this.useShadowRoot=t}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(t){this.afterRenderHook=t}getAfterRenderHook(){return this.afterRenderHook}}const Z=new on,ca=(e,t,a,s,i,r,n,d,c)=>(t.slot=d,w(e,t,a,s,i,r,n,c)),w=(e,t,a,s,i,r,n,d)=>{if(!t)return o``;if(t.type==oe.ClientSide)return Z.get().renderClientSideComponent(e,t,a,s,i,r,n,d);const c=e.route,u=e.consumedRoute;return o`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${u}"
                         baseUrl="${a}"
                         slot="${t.slot??l}"
                         style="${t.style}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...s}}"
                         .data="${{...i}}"
                         .appState="${r}"
                         .appData="${n}"
        >
       </mateu-component>`},nn=640,ln=e=>e>0&&e<nn?"accordion":"tabs";var dn=Object.defineProperty,cn=Object.getOwnPropertyDescriptor,Xi=(e,t,a,s)=>{for(var i=s>1?void 0:s?cn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&dn(t,a,i),i};let za=class extends S{constructor(){super(...arguments),this.tabLabels=[],this.mode="tabs",this.selected=0,this.selectedChangedListener=e=>{const t=e.detail?.value;typeof t=="number"&&t>=0&&(this.selected=t)}}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{for(const t of e)this.mode=ln(t.contentRect.width)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect(),this.resizeObserver=void 0,this.detachTabsListener()}detachTabsListener(){this.slottedTabs?.removeEventListener("selected-changed",this.selectedChangedListener),this.slottedTabs=void 0}tabsSlotChanged(e){this.detachTabsListener();const a=e.target.assignedElements().find(s=>"selected"in s);a&&(this.slottedTabs=a,a.addEventListener("selected-changed",this.selectedChangedListener),a.selected=this.selected)}select(e){this.selected=e,this.slottedTabs&&(this.slottedTabs.selected=e)}updated(){this.slottedTabs&&this.slottedTabs.selected!=this.selected&&(this.slottedTabs.selected=this.selected)}render(){return o`
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
        `}};za.styles=C`
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
    `;Xi([p({type:Array})],za.prototype,"tabLabels",2);Xi([$()],za.prototype,"mode",2);Xi([$()],za.prototype,"selected",2);za=Xi([k("mateu-adaptive-tabs")],za);const un=(e,t,a,s,i,r,n)=>{const d=t.metadata;let c=t.style;return c==null&&(c=""),d.columnSpacing&&(c+="--vaadin-form-layout-column-spacing: "+d.columnSpacing+";"),d.itemRowSpacing&&(c+="--vaadin-form-layout-row-spacing: "+d.itemRowSpacing+";"),d.itemLabelSpacing&&(c+="--vaadin-form-layout-label-spacing: "+d.itemLabelSpacing+";"),d.labelsAside&&(c+="--vaadin-form-item-label-width: 10rem;"),d.fullWidth&&(c+="width: 100%;"),o`
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
                   ${t.children?.map(u=>zr(d,e,u,a,s,i,r,n))}
               </vaadin-form-layout>
            `},zr=(e,t,a,s,i,r,n,d)=>a.type==oe.ClientSide&&a.metadata?.type==v.FormRow?hn(e,t,a,s,i,r,n,d):e.labelsAside?pn(t,a,s,i,r,n,d):w(t,a,s,i,r,n,d),pn=(e,t,a,s,i,r,n)=>{if(t.type==oe.ClientSide&&t.metadata?.type==v.FormField&&t.metadata.label){const d=t.metadata,c=d.label?.includes("${")?e._evalTemplate(d.label):d.label;return o`
                       <vaadin-form-item data-colspan="${d.colspan}">
                           <label slot="label">${c}</label>
                           ${w(e,t,a,s,i,r,n,!0)}
                       </vaadin-form-item>
                   `}return w(e,t,a,s,i,r,n)},hn=(e,t,a,s,i,r,n,d)=>o`
        <vaadin-form-row>
            ${a.children?.map(c=>zr(e,t,c,s,i,r,n,d))}
        </vaadin-form-row>
            `,mn=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=(d.padding?" padding":"")+(d.spacing?" spacing":"")+(d.spacingVariant?" spacing-"+d.spacingVariant:"")+(d.wrap?" wrap":"");let u=t.style;return d.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),d.justification&&(u=u?"justify-content: "+d.justification+";"+u:"justify-content: "+d.justification+";"),d.verticalAlignment&&(u=u?"align-items: "+d.verticalAlignment+";"+u:"align-items: "+d.verticalAlignment+";"),o`
               <vaadin-horizontal-layout 
                       style="${u}" 
                       class="${t.cssClasses}"
                       theme="${c}"
                       slot="${t.slot??l}"
               >
                   ${t.children?.map(m=>w(e,m,a,s,i,r,n))}
               </vaadin-horizontal-layout>
            `},vn=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=(d.padding?" padding":"")+(d.spacing?" spacing":"")+(d.spacingVariant?" spacing-"+d.spacingVariant:"")+(d.wrap?" wrap":"");let u=t.style;return d.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),d.justification&&(u=u?"justify-content: "+d.justification+";"+u:"justify-content: "+d.justification+";"),d.horizontalAlignment&&(u=u?"align-items: "+d.horizontalAlignment+";"+u:"align-items: "+d.horizontalAlignment+";"),o`
        <vaadin-vertical-layout
                style="${u}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??l}"
        >
            ${t.children?.map(m=>w(e,m,a,s,i,r,n))}
        </vaadin-vertical-layout>
    `},fn=(e,t,a,s,i,r,n)=>{const d=t.metadata;let c=t.style;return d.fullWidth&&(c=c?"width: 100%;"+c:"width: 100%;"),o`
               <vaadin-split-layout 
                       style="${c}" 
                       class="${t.cssClasses}"
                       orientation="${d.orientation??l}"
                       theme="${d.variant??l}"
                       slot="${t.slot??l}"
               >
                   <master-content>${w(e,t.children[0],a,s,i,r,n)}</master-content>
                   <detail-content>${w(e,t.children[1],a,s,i,r,n)}</detail-content>
               </vaadin-split-layout>
            `},bn=(e,t,a,s,i,r,n)=>{const d=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,u=!!i?.hasDetail||!!d,m=c??d;return o`
               <vaadin-master-detail-layout ?has-detail="${u}"
                                            style="${t.style}"
                                            class="${t.cssClasses}"
                                            slot="${t.slot??l}">
                   <div>${w(e,t.children[0],a,s,i,r,n)}</div>
                   ${u&&m?o`<div slot="detail">${w(e,m,a,s,i,r,n)}</div>`:o`<div slot="detail" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Select an item to view details</div>`}
               </vaadin-master-detail-layout>
            `},gn=(e,t,a,s,i,r,n)=>{const d=t.metadata;let c=t.style;c==null&&(c=""),d.fullWidth&&(c+="width: 100%;");let u=d.variant;u=="equalWidth"&&(u="equal-width-tabs");const m=Math.max(0,(t.children??[]).findIndex(f=>f.metadata.active)),h=f=>{f.target.selected=m};if(d.adaptable){const f=(t.children??[]).map(g=>{const y=g.metadata.label;return y?.includes("${")?e._evalTemplate(y):y});return o`
            <mateu-adaptive-tabs
                    .tabLabels="${f}"
                    style="${c}"
                    class="${t.cssClasses}"
                    slot="${t.slot??l}"
            >
                <vaadin-tabs slot="tabs"
                             theme="${u??l}"
                             orientation="${d.orientation??l}"
                             @items-changed=${h}
                >
                    ${t.children?.map(g=>g).map((g,y)=>{const x=g.metadata.shortcut;return o`
                        <vaadin-tab id="${f[y]}"
                                    style="${g.style}"
                                    class="${g.cssClasses}"
                                    data-shortcut="${x??l}"
                        >${f[y]}</vaadin-tab>`})}
                </vaadin-tabs>

                ${t.children?.map((g,y)=>o`
                    <div slot="panel-${y}" style="padding: var(--lumo-space-m) 0;">
                        ${g.children?.map(x=>w(e,x,a,s,i,r,n))}
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
                         @items-changed=${h}
            >
                ${t.children?.map(f=>f).map(f=>{const g=f.metadata.label,y=g?.includes("${")?e._evalTemplate(g):g,x=f.metadata.shortcut;return o`
                    <vaadin-tab id="${y}"
                                style="${f.style}"
                                class="${f.cssClasses}"
                                data-shortcut="${x??l}"
                    >${y}</vaadin-tab>`})}
            </vaadin-tabs>

            ${t.children?.map(f=>$n(e,f,a,s,i,r,n))}
        </vaadin-tabsheet>
            `},$n=(e,t,a,s,i,r,n)=>{const d=t.metadata.label,c=d?.includes("${")?e._evalTemplate(d):d;return o`
        <div tab="${c}" style="padding: var(--lumo-space-m) 0;">
                   ${t.children?.map(u=>w(e,u,a,s,i,r,n))}
               </div>
            `},yn=(e,t,a,s,i,r,n)=>{const d=t.metadata;t.style,d.fullWidth;let c=0;if(t.children){for(let u=0;u<t.children.length;u++)if(t.children[u].metadata?.active){c=u;break}}return o`
               <vaadin-accordion
                       style="${t.style}"
                       class="${t.cssClasses}"
                       opened="${c}"
                       slot="${t.slot??l}"
               >
                   ${t.children?.map(u=>xn(e,u,a,s,i,r,n,d.variant))}
               </vaadin-accordion>
            `},xn=(e,t,a,s,i,r,n,d)=>{const c=t.metadata,u=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return o`
        <vaadin-accordion-panel style="${t.style}"
                                class="${t.cssClasses}"
                                theme="${d??l}"
                                ?opened="${c.active}"
                                ?disabled="${c.disabled}">
            <vaadin-accordion-heading slot="summary">${u}</vaadin-accordion-heading>
            ${t.children?.map(m=>w(e,m,a,s,i,r,n))}
        </vaadin-accordion-panel>
            `},wn=(e,t,a,s,i,r,n)=>o`
               <vaadin-scroller style="${t.style}" 
                                class="${t.cssClasses}"
                                slot="${t.slot??l}">
                   ${t.children?.map(d=>w(e,d,a,s,i,r,n))}
               </vaadin-scroller>
            `,kn=(e,t,a,s,i,r,n)=>o`
               <div style="width: 100%; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??l}">
                   ${t.children?.map(d=>w(e,d,a,s,i,r,n))}
               </div>
            `,Cn=(e,t,a,s,i,r,n)=>o`
               <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??l}">
                   ${t.children?.map(d=>w(e,d,a,s,i,r,n))}
               </div>
            `,Sn=(e,t,a,s,i,r,n)=>o`
        <vaadin-board style="${t.style}" 
                      class="${t.cssClasses}"
                      slot="${t.slot??l}">
            ${t.children?.map(d=>w(e,d,a,s,i,r,n))}
        </vaadin-board>
            `,In=(e,t,a,s,i,r,n)=>o`
        <vaadin-board-row style="${t.style}" class="${t.cssClasses}">
                   ${t.children?.map(d=>w(e,d,a,s,i,r,n))}
               </vaadin-board-row>
            `,_n=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        <div style="${t.style}" 
             class="${t.cssClasses}"
             board-cols="${d.boardCols??l}"
        >
                   ${t.children?.map(c=>w(e,c,a,s,i,r,n))}
               </div>
            `},Aa=(e,t)=>new Function(...Object.keys(t),"return `"+e+"`")(...Object.values(t)),Ma=(e,t,a)=>({state:e??{},data:t??{},...a});function Re(e,t,a,s){if(!e?.includes("${"))return e;try{return Aa(e,Ma(t,a,s))}catch(i){return console.warn(`Mateu: could not interpolate "${e}":`,i),e}}const ct=(e,t,a)=>{if(e&&e.indexOf("${")>=0)try{return Aa(e,Ma(t,a))}catch(s){return s.message}return e},ii=(e,t,a,s,i)=>{if(!e)return e;const r=Ma(t,a,{appState:s??{},appData:i??{}});let n=e;try{if(n=Aa(e,r),n.includes("${"))try{n=Aa(n,r)}catch(d){n="when evaluating nested "+e+" :"+d+", where data is "+a+" and state is "+t+" and app state is "+s+" and app data is "+i,console.error(d,n,t,a,s,i)}}catch(d){n="when evaluating "+e+" :"+d+", where data is "+a+" and state is "+t+" and app state is "+s+" and app data is "+i,console.error(d,n,t,a,s,i)}return n},Ar=(e,t,a,s,i,r)=>{const n=Ma(t,a,{appState:s??{},appData:i??{},...r}),d=Aa(e,n);return new Function(...Object.keys(n),`return (${d})`)(...Object.values(n))},jr=(e,t,a,s)=>{const i=Ma(t,a,s);return new Function(...Object.keys(i),`return (${e})`)(...Object.values(i))},En=(e,t,a,s)=>Aa(e,Ma(t,a,s)),Tn=(e,t,a)=>{const s=e.metadata;return o`<vaadin-avatar
            img="${s.image}"
            name="${de(s.name,t,a)}"
            abbr="${s.abbreviation}"
            style="${e.style}" class="${e.cssClasses}"
            slot="${e.slot??l}"
    ></vaadin-avatar>`},de=(e,t,a)=>typeof e=="string"&&e.includes("${")?Re(e,t,a):e,Pn=e=>{const t=e.metadata;return o`<vaadin-avatar-group max-items-visible="${t.maxItemsVisible}"
                                     .items="${t.avatars}"
                                     style="${e.style}" class="${e.cssClasses}"
                                     slot="${e.slot??l}">
    </vaadin-avatar-group>`},On=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=u=>o`
            ${w(e,u,a,s,i,r,n)}
`;return o`
        <vaadin-virtual-list
                .items="${d.page.content}"
                ${Qo(c,[])}
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??l}"
        ></vaadin-virtual-list>
    `};var Rn=Object.defineProperty,zn=Object.getOwnPropertyDescriptor,As=(e,t,a,s)=>{for(var i=s>1?void 0:s?zn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Rn(t,a,i),i};let si=class extends S{constructor(){super(...arguments),this.variant="text",this.count=3}render(){const e=Array.from({length:Math.max(1,this.count)});return this.variant=="card"?o`${e.map(()=>o`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant=="grid"?o`${e.map(()=>o`<div class="bone row"></div>`)}`:this.variant=="form"?o`${e.map(()=>o`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:o`${e.map(()=>o`<div class="bone line"></div>`)}`}};si.styles=C`
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
    `;As([p()],si.prototype,"variant",2);As([p({type:Number})],si.prototype,"count",2);si=As([k("mateu-skeleton")],si);const An=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},ua=(e,t,a,s,i,r)=>o`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${t??"🗂"}</span>
            ${a?o`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${a}</span>`:l}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${s??e??"Nothing here yet."}</span>
            ${i&&r?o`
                <vaadin-button theme="tertiary" style="margin-top: .25rem;" @click="${n=>An(n,i)}">${r}</vaadin-button>
            `:l}
        </div>
    `,jn=e=>{const t=e.metadata;return o`
        <div style="${e.style??l}" class="${e.cssClasses??l}" slot="${e.slot??l}">
            ${ua(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},Ln=e=>{const t=e.metadata;return o`
        <mateu-skeleton
                variant="${t.variant??"text"}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-skeleton>
    `},ai=e=>!!e&&typeof e=="object"&&"__mateuGroup"in e,vs=e=>String(e??""),Lr=(e,t,a)=>{const s=e??[];if(!t||!a||a.length===0)return s;const i=[];let r,n=!1;return s.forEach((d,c)=>{const u=vs(d?.[t]);if(!n||u!==r){const m=a.find(h=>vs(h.value)===u)??{value:u,count:s.filter(h=>vs(h?.[t])===u).length,aggregates:{}};i.push({__mateuGroup:m,__mateuGroupBy:t,_rowNumber:`__mateuGroup:${c}:${u}`}),n=!0,r=u}i.push(d)}),i},Dr=(e,t)=>e==null?"":t.dataType==="money"||t.stereotype==="money"?new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(e):t.aggregate==="count"?new Intl.NumberFormat(void 0,{maximumFractionDigits:0}).format(Math.round(e)):new Intl.NumberFormat(void 0,{maximumFractionDigits:2}).format(e),Nr=(e,t)=>e&&t.includes(e)?e:t.find(a=>!!a),Fr=(e,t,a)=>{const s=e.__mateuGroup;return t.id===a?`${s.value} (${s.count})`:t.aggregate?Dr(s.aggregates?.[t.id],t):""},Mr=(e,t,a)=>{const s=t?.aggregates;if(!s||!e.some(n=>n.aggregate))return;const i={};e.forEach(n=>{n.aggregate&&s[n.id]!=null&&(i[n.id]=Dr(s[n.id],n))});const r=e[0];if(r&&i[r.id]===void 0){const n=t?.page?.totalElements;i[r.id]=a&&r.id===a&&n!=null?`Total (${n})`:"Total"}return i};var ti=(e=>(e.NONE="NONE",e.INFO="INFO",e.SUCCESS="SUCCESS",e.WARNING="WARNING",e.DANGER="DANGER",e))(ti||{});const Dn=(e,t,a)=>{const s=e[a.path];return s?o`<span theme="badge pill ${Qi(s.type)}">${s.message}</span>`:o``},Qi=e=>{switch(e){case ti.SUCCESS:return"success";case ti.WARNING:return"warning";case ti.DANGER:return"error";case ti.NONE:return"contrast"}return""},Nn=(e,t,a)=>{const i=e[a.path]?"vaadin:check":"vaadin:minus";return o`<vaadin-icon 
                    icon="${i}"
                    style="height: 16px; width: 16px; color: ${"var(--lumo-body-text-color)"};"
            ></vaadin-icon>`},Fn=(e,t,a,s,i)=>{const r=e[a.path];let n=r;return s=="money"&&r&&r.locale&&r.currency?n=new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(r.value):i=="money"&&(n=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(r)),o`${n}`},ar=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},Mn=(e,t,a,s,i,r)=>{const n=a.xcolumn??r;if(n.text){if(n.actionId)return o`<a href="javascript: void(0);" @click="${u=>ar(a,n,e)}">${n.text}</a>`;const c=e[a.path];return o`<a href="${c}">${n.text}</a>`}if(s=="string"){if(n.actionId){const u=e[a.path];return o`<a href="javascript: void(0);" @click="${m=>ar(a,n,e)}">${u}</a>`}const c=e[a.path];return o`<a href="${c}">${c}</a>`}const d=e[a.path];return o`<a href="${d.href}">${d.text}</a>`},qn=(e,t,a,s,i)=>s=="string"?e[a.path].split(",").map(d=>o`<vaadin-icon icon="${d}" style="width: 16px;"></vaadin-icon>`):e[a.path].split(",").map(n=>o`<vaadin-icon icon="${n.icon}" style="width: 16px;"></vaadin-icon>`),Un=(e,t,a,s,i)=>{const r=e[a.path];return o`${he(r)}`},Bn=(e,t,a,s,i,r)=>{if(s=="string"){const d=e[a.path],c="max-height: 40px; "+(r.style??"");return o`<img src="${d}" style="${c}">`}const n=e[a.path];return o`<img src="${n.src}" style="${r.style??""}">`},Vn=e=>{const t={_clickedRow:e.target.row};e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+e.detail.value.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},ir=e=>{const t={_clickedRow:e.target.row},a=e.target.action;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+a.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Hn=e=>{const t=document.createElement("vaadin-context-menu-item"),a=document.createElement("vaadin-icon");return a.style.color="var(--lumo-secondary-text-color)",a.style.marginInlineEnd="var(--lumo-space-s)",a.style.padding="var(--lumo-space-xs)",a.setAttribute("icon",e.icon),t.appendChild(a),e.label&&t.appendChild(document.createTextNode(e.label)),t.disabled=e.disabled,t},sr=(e,t,a)=>{const s=e[a.path]?.actions?.map(i=>i.icon?{component:Hn(i),methodNameInCrud:i.methodNameInCrud}:{...i,text:i.label});return!s||s.length==0?o``:o`
                                     <vaadin-menu-bar
                                         .items=${[{text:"···",children:s}]}
                                         theme="tertiary"
                                         .row="${e}"
                                         data-testid="menubar-${a.path}"
                                         @item-selected="${Vn}"
                                     ></vaadin-menu-bar>
                                   `},Wn=(e,t,a)=>{if(a.path=="select"){const r={actionId:a.path,icon:"",label:"Select",disabled:!1,methodNameInCrud:"select"};return o`
         <vaadin-button theme="tertiary" title="Select" @click="${ir}" .row="${e}" .action="${r}">
             Select
         </vaadin-button>
    `}const s=a.path&&e[a.path]?.methodNameInCrud?e[a.path]:e.action;if(!s)return o``;const i=s.icon&&!s.label;return o`
         <vaadin-button theme="tertiary${i?" icon":""}" title="${s.label||l}" @click="${ir}" .row="${e}" .action="${s}">
             ${s.icon?o`<vaadin-icon icon="${s.icon}"></vaadin-icon>`:l}
             ${s.label?s.label:l}
         </vaadin-button>
    `},Gn=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},Kn=(e,t,a,s,i,r)=>{const n=a.xcolumn??r;if(n.actionId){const c=n.text||e[a.path];return o`
            <vaadin-button theme="tertiary" @click="${u=>Gn(a,n,e)}" .row="${e}">
                ${c}
            </vaadin-button>
        `}const d=e[a.path];return o`<a href="${d}">${n.text||d}</a>`},Yn=(e,t,a,s,i,r,n,d,c)=>{const u=e[a.path];return w(s,u,i,r,n,d,c)},Ss=new WeakMap,Jn=(e,t)=>Ss.get(e)?.[t],Xn=(e,t,a)=>{let s=Ss.get(e);s||(s={},Ss.set(e,s)),s[t]=a},rr=e=>{if(e==null||e==="")return null;const t=Number(e);return Number.isNaN(t)?null:t},Qn=(e,t,a,s)=>{const i=a?.field?.fieldId,r=c=>{if(e[t.id]===c||e[t.id]==null&&(c===""||c==null))return;if(e[t.id]=c,!i){a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"update-row",parameters:{_editedRow:{...e}}},bubbles:!0,composed:!0}));return}const m=(a?.state??s)[i];a.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:i,value:Array.isArray(m)?[...m]:m},bubbles:!0,composed:!0}))},n=e[t.id],d=n==null?"":String(n);switch(t.editorType){case"boolean":return o`<vaadin-checkbox ?checked=${!!n} @checked-changed=${c=>r(c.detail.value)}></vaadin-checkbox>`;case"integer":return o`<vaadin-integer-field theme="small" style="width:100%;" .value=${d} @change=${c=>r(rr(c.target.value))}></vaadin-integer-field>`;case"number":return o`<vaadin-number-field theme="small" style="width:100%;" .value=${d} @change=${c=>r(rr(c.target.value))}></vaadin-number-field>`;case"date":return o`<vaadin-date-picker theme="small" style="width:100%;" .value=${d} @value-changed=${c=>r(c.detail.value)}></vaadin-date-picker>`;case"time":return o`<vaadin-time-picker theme="small" style="width:100%;" .value=${d} @value-changed=${c=>r(c.detail.value)}></vaadin-time-picker>`;case"datetime":return o`<vaadin-date-time-picker theme="small" style="width:100%;" .value=${d} @value-changed=${c=>r(c.detail.value)}></vaadin-date-time-picker>`;case"select":return o`<vaadin-combo-box
                theme="small" style="width:100%;"
                .items=${(t.editorOptions??[]).map(c=>({label:c.label,value:String(c.value)}))}
                item-label-path="label" item-value-path="value"
                .value=${d}
                @value-changed=${c=>r(c.detail.value)}></vaadin-combo-box>`;case"lookup":{const c=a?.field?.fieldId,u=`search-${c}-${t.id}`,m=`${c}-${t.id}`,f=(t.editorOptions??[]).find(y=>String(y.value)===d)??(d?{value:d,label:Jn(e,t.id)??d}:void 0);return o`<vaadin-combo-box
                theme="small" style="width:100%;"
                item-label-path="label" item-id-path="value"
                .dataProvider=${(y,x)=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:u,parameters:{searchText:y.filter,size:y.pageSize,page:y.page},callback:T=>{const U=T?.fragments?.[0]?.data?.[m];x(U?.content??[],U?.totalElements??0)},callbackonly:!0},bubbles:!0,composed:!0}))}}
                .selectedItem=${f}
                @selected-item-changed=${y=>{const x=y.detail.value,T=x?x.value:null;String(T??"")!==d&&(x&&Xn(e,t.id,x.label),r(T))}}></vaadin-combo-box>`}default:return o`<vaadin-text-field theme="small" style="width:100%;" .value=${d} @change=${c=>r(c.target.value)}></vaadin-text-field>`}},fs=e=>Zo(()=>o`<span title="${e}" style="white-space:normal;overflow-wrap:break-word;">${e}</span>`,[e]),bs=e=>e!==void 0?en(()=>o`<span style="font-weight: 600; white-space: nowrap;">${e}</span>`,[e]):l,Zn=e=>{e.preventDefault(),e.stopPropagation(),e.currentTarget?.dispatchEvent(new CustomEvent("sort-direction-changed",{detail:{grid:e.currentTarget.parentElement},bubbles:!0,composed:!0}))},el=(e,t,a,s,i,r,n,d)=>{const c=Re(e.label,s,i);return o`
<vaadin-grid-column-group header="${c}">
    ${e.columns.map(u=>qr(u.metadata,t,a,s,i,r,n,d?.[u.metadata?.id]))}
</vaadin-grid-column-group>
`},js=(e,t,a,s,i,r,n,d)=>v.GridGroupColumn==e.metadata?.type?el(e.metadata,t,a,s,i,r,n,d):qr(e.metadata,t,a,s,i,r,n,d?.[e.metadata?.id]),qr=(e,t,a,s,i,r,n,d)=>{const c=Re(e.label,s,i);return e.sortable?o`
                        <vaadin-grid-sort-column
                                path="${e.id}"
                                text-align="${e.align??l}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??l}"
                                ?resizable="${e.resizable}"
                                width="${e.width??l}"
                                @direction-changed="${Zn}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${fs(c)}
                                ${bs(d)}
                                ${Et((u,m,h)=>Oi(u,m,h,e,t,a,s,i,r,n),[])}
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
                                ${fs(c)}
                                ${bs(d)}
                                ${Et((u,m,h)=>Oi(u,m,h,e,t,a,s,i,r,n),[])}
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
                                ${fs(c)}
                                ${bs(d)}
                                ${Et((u,m,h)=>Oi(u,m,h,e,t,a,s,i,r,n),[])}
                        ></vaadin-grid-column>
                    `},Oi=(e,t,a,s,i,r,n,d,c,u)=>{const m=a.dataset.dataType??"",h=a.dataset.stereotype??"";if(ai(e)){const g=i?.metadata,y=(g?.columns??[]).flatMap(F=>F?.metadata?.type===v.GridGroupColumn?(F.metadata.columns??[]).map(ne=>ne?.metadata?.id):[F?.metadata?.id]),x=Nr(e.__mateuGroupBy,y),T=Fr(e,s,x),U=e.__mateuGroup.hiddenActions??[],ae=s.id===y[y.length-1]?(g?.groupActions??[]).filter(F=>!U.includes(F.actionId??F.id)):[];return ae.length?o`<span style="display: flex; align-items: center; justify-content: flex-end; gap: var(--lumo-space-s); overflow: hidden;">
                ${T?o`<span style="font-weight: 600;">${T}</span>`:l}
                ${ae.map(F=>o`
                    <vaadin-button theme="tertiary small" style="flex-shrink: 0;"
                        @click="${ne=>{ne.stopPropagation(),ne.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+(F.actionId??F.id),parameters:{_groupValue:e.__mateuGroup.value}},bubbles:!0,composed:!0}))}}">${F.label??F.caption??""}</vaadin-button>
                `)}
            </span>`:o`<span title="${T}" style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${T}</span>`}if(s.editable)return Qn(e,s,i,n);if(m=="status")return Dn(e,t,a);if(m=="bool")return Nn(e,t,a);if(m=="money"||h=="money")return Fn(e,t,a,m,h);if(m=="link"||h=="link")return Mn(e,t,a,m,h,s);if(m=="icon"||h=="icon")return qn(e,t,a,m);if(h=="html")return Un(e,t,a);if(h=="image")return Bn(e,t,a,m,h,s);if(m=="menu")return sr(e,t,a);if(m=="component")return Yn(e,t,a,i,r,n,d,c,u);if(m=="action")return Wn(e,t,a);if(m=="actionGroup")return sr(e,t,a);if(h=="button"||s.actionId)return Kn(e,t,a,m,h,s);const f=e[a.path];return o`<span title="${f}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${f}</span>`},tl=(e,t,a,s,i,r,n)=>{const d=t.metadata;if(d.tree){const u=async(m,h)=>{const f=m.parentItem?m.parentItem.children:d.page.content;h(f,f.length)};return o`
        <vaadin-grid style="${t.style}" class="${t.cssClasses}"
                     .itemHasChildrenPath="${"children"}" .dataProvider="${u}"
                     slot="${t.slot??l}"
                     all-rows-visible
        >
            ${d.content.map((m,h)=>{const f=m.metadata;return h>0?o`
            <vaadin-grid-column path="${m.id}"
                                header="${f?.label??l}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??l}"
                                width="${f?.width??l}"
                                .column="${m.metadata}"
                                ${Et((g,y,x)=>Oi(g,y,x,f,e,a,s,i,r,n),[])}></vaadin-grid-column>
`:o`
            <vaadin-grid-tree-column path="${m.id}"
                                header="${f?.label??l}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??l}"
                                width="${f?.width??l}"
            ></vaadin-grid-tree-column>
`})}
            <span slot="empty-state">${ua()}</span>
        </vaadin-grid>
    `}let c=d.page?.content;return t.id&&s&&s[t.id]&&(c=s[t.id]),c||(c=[]),o`
        <vaadin-grid 
                style="${t.style}" 
                class="${t.cssClasses}" 
                .items="${c}"
                all-rows-visible
        >
            ${d?.content?.map(u=>js(u,e,a,s,i,r,n))}
        </vaadin-grid>
    `},al=e=>{const a=(e.metadata.items??[]).map(s=>({text:s.text,time:s.time,userName:s.userName,userImg:s.userImg,userAbbr:s.userAbbr,userColorIndex:s.userColorIndex}));return o`
        <vaadin-message-list
                markdown
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??l}"
                .items="${a}"
        ></vaadin-message-list>
    `},Vt=new an,le={value:{}},ri={value:{}},il=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        <vaadin-context-menu .items=${Ls(e,d.menu,a,s,i,r,n)} 
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             open-on="${d.activateOnLeftClick?"click":l}"
                             slot="${t.slot??l}">
            ${w(e,d.wrapped,a,s,i,r,n)}
        </vaadin-context-menu>
            `},sl=(e,t,a,s,i)=>{const r=t.metadata;return o`
        <vaadin-menu-bar .items=${Ls(e,r.options,a,s,i,le,ri)}
                         style="${t.style}" class="${t.cssClasses}"
                         slot="${t.slot??l}">
        </vaadin-menu-bar>
            `},or=(e,t,a,s,i,r,n)=>{const d=document.createElement("vaadin-context-menu-item");return Tr(w(e,t,a,s,i,r,n),d),d},Ls=(e,t,a,s,i,r,n)=>t.map(d=>d.submenus?{text:d.component?void 0:d.label,route:d.path,checked:d.selected,disabled:d.disabled,className:d.className,component:d.component?or(e,d.component,a,s,i,r,n):void 0,children:Ls(e,d.submenus,a,s,i,r,n)}:d.separator?{component:"hr"}:{text:d.component?void 0:d.label,route:d.path,checked:d.selected,disabled:d.disabled,className:d.className,component:d.component?or(e,d.component,a,s,i,r,n):void 0}),rl=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=d.content?.metadata,u=c?.type==v.Notice&&c.fullWidth===!0;return o`
        <vaadin-custom-field label="${d.label}"
                             style="${u?"width: 100%; ":""}${t.style}"
                             class="${t.cssClasses}"
                             slot="${t.slot??l}"
                             data-colspan="${d.colspan||(u?99:l)}"
        >
            ${w(e,d.content,a,s,i,r,n)}
        </vaadin-custom-field>
            `},ol=e=>{const t=e.metadata,a=s=>{const i=s.detail?.value??"";!t.actionId||!i.trim()||s.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:{message:i}},bubbles:!0,composed:!0}))};return o`
        <vaadin-message-input
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??l}"
                @submit="${a}"
        ></vaadin-message-input>
    `},nl=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        <div id="show-notifications">${w(e,d.wrapped,a,s,i,r,n)}</div>
        <vaadin-tooltip
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??l}"
                for="show-notifications" text="${d.text}" position="top-start"></vaadin-tooltip>
    `},ll=e=>{if(e instanceof CustomEvent)return e.detail;const t={};for(const a in e){const s=e[a];["number","string","boolean"].indexOf(typeof s)>=0&&(t[a]=e[a])}return t},nr=(e,t,a)=>{for(let s in t.attributes)e.setAttribute(s,t.attributes[s]);a.style&&e.setAttribute("style",a.style),a.cssClasses&&e.setAttribute("class",a.cssClasses),a.slot&&e.setAttribute("slot",a.slot),t.content&&(t.html?e.innerHTML=t.content:e.append(t.content))},dl=e=>{const t=e.name;t.startsWith("vaadin-chart")&&!customElements.get(t)&&Oe(()=>import("./vendor-highcharts.js"),__vite__mapDeps([0,1,2,3,4]));const a=e.attributes?e.attributes.import:void 0;a&&t.includes("-")&&!customElements.get(t)&&import(a)},cl=(e,t,a)=>{dl(t);let s=t.name;return t.attributes&&t.attributes.id&&(s="#"+t.attributes.id),setTimeout(()=>{const i=e.shadowRoot?.querySelector(".element-container")?.querySelector(s);if(i){for(;i.firstChild;)i.removeChild(i.lastChild);nr(i,t,a)}else{const r=document.createElement(t.name);nr(r,t,a);for(let n in t.on)r.addEventListener(n,d=>{const c=ll(d);e.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.on[n],parameters:{event:c}},bubbles:!0,composed:!0}))});e.shadowRoot?.querySelector(".element-container")?.appendChild(r)}}),o`<div class="element-container"></div>`};var dt=(e=>(e.div="div",e.p="p",e.h1="h1",e.h2="h2",e.h3="h3",e.h4="h4",e.h5="h5",e.h6="h6",e.span="span",e))(dt||{});const ul=(e,t,a,s,i)=>{const r=e.metadata,n=r.attributes?.["data-colspan"],d=ii(r.text,t,a,s,i),c={xl:"var(--lumo-font-size-xl, 1.375rem)",l:"var(--lumo-font-size-l, 1.125rem)",s:"var(--lumo-font-size-s, .875rem)",xs:"var(--lumo-font-size-xs, .8125rem)"},u=(r.size&&c[r.size]?`font-size: ${c[r.size]}; `:"")+(r.noMargins?"margin-block-start: 0; margin-block-end: 0; ":"");return dt.h1==r.container?o`
            <h1 style="${u}${e.style}" class="${e.cssClasses}"
                id="${P(e.id)}"
                data-colspan="${P(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h1>
        `:dt.h2==r.container?o`
            <h2 style="${u}${e.style}" class="${e.cssClasses}"
                id="${P(e.id)}"
                data-colspan="${P(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h2>
        `:dt.h3==r.container?o`
            <h3 style="${u}${e.style}" class="${e.cssClasses}"
                id="${P(e.id)}"
                data-colspan="${P(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h3>
        `:dt.h4==r.container?o`
            <h4 style="${u}${e.style}" class="${e.cssClasses}"
                id="${P(e.id)}"
                data-colspan="${P(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h4>
        `:dt.h5==r.container?o`
            <h5 style="${u}${e.style}" class="${e.cssClasses}"
                id="${P(e.id)}"
                data-colspan="${P(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h5>
        `:dt.h6==r.container?o`
            <h6 style="${u}${e.style}" class="${e.cssClasses}"
                id="${P(e.id)}"
                data-colspan="${P(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h6>
        `:dt.p==r.container?o`
               <p style="${u}${e.style}" class="${e.cssClasses}"
                  id="${P(e.id)}"
                  data-colspan="${P(n)}"
                  slot="${e.slot??l}">
                   ${d??l}
               </p>
            `:dt.div==r.container?o`
               <div style="${u}${e.style}" class="${e.cssClasses}"
                    id="${P(e.id)}"
                    data-colspan="${P(n)}"
                    slot="${e.slot??l}">${d?he(d):l}</div>
            `:dt.span==r.container?o`
               <span style="${u}${e.style}" class="${e.cssClasses}"
                     id="${P(e.id)}"
                     data-colspan="${P(n)}"
                    slot="${e.slot??l}">${d??l}</span>
            `:o`
               <p
                       id="${P(e.id)}"
                       data-colspan="${P(n)}"
                       slot="${e.slot??l}">
                   Unknown text container: ${r.container} 
               </p>
            `},pl=(e,t,a)=>{const s=e.metadata;return o`<span theme="badge ${s.color} ${s.pill?"pill":""} ${s.small?"small":""} ${s.primary?"primary":""}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??l}">${de(s.text,t,a)}</span>`},hl=(e,t,a)=>{const s=de(e.text,t,a);if(!s)return l;let i=de(e.color,t,a);return i=="SUCCESS"&&(i="success"),i=="ERROR"&&(i="error"),i=="DANGER"&&(i="error"),i=="WARNING"&&(i="warning"),i=="INFO"&&(i="info"),i=="PRIMARY"&&(i="primary"),i=="SECONDARY"&&(i="secondary"),i=="TERTIARY"&&(i="tertiary"),i=="QUATERNARY"&&(i="quaternary"),i=="LIGHT"&&(i="light"),i=="DARK"&&(i="dark"),o`<span theme="badge ${i} ${e.pill?"pill":""} ${e.small?"small":""} ${e.primary?"primary":""}">${s}</span>`},ml=e=>{const t=e.metadata;return o`<a href="${t.url}" target="${t.target??l}"
                   rel="${t.target==="_blank"?"noopener":l}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??l}">${t.text}</a>`},Ur=(e,t)=>{const a=e.toLowerCase().split("+");return t.ctrlKey===a.includes("ctrl")&&t.altKey===a.includes("alt")&&t.shiftKey===a.includes("shift")&&t.metaKey===a.includes("meta")},vl=(e,t)=>{if(!Ur(e,t))return!1;const a=e.toLowerCase().split("+"),s=a[a.length-1];return!!(t.key.toLowerCase()===s||/^[a-z]$/.test(s)&&t.code==="Key"+s.toUpperCase()||/^[0-9]$/.test(s)&&(t.code==="Digit"+s||t.code==="Numpad"+s))},fl=e=>e?e.split("+").map(t=>t.length<=1?t.toUpperCase():t.charAt(0).toUpperCase()+t.slice(1)).join("+"):void 0,bl=(e,t)=>{const a=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a,parameters:t.parameters},bubbles:!0,composed:!0}))},gl=(e,t,a)=>{const s=e.metadata,i=Re(s.label,t,a);let r="";return s.buttonStyle&&(r+=" "+s.buttonStyle),s.color&&s.color!=="none"&&s.color!=="normal"&&(r+=" "+s.color),s.size&&s.size!=="none"&&s.size!=="normal"&&(r+=" "+s.size),o`<vaadin-button
id="${e.id}"
            data-action-id="${s.actionId}"
            @click="${n=>bl(n,s)}"
            style="${e.style}"
            class="${e.cssClasses}"
            theme="${r}"
            ?disabled="${s.disabled}"
            title="${s.shortcut?`${i} (${fl(s.shortcut)})`:l}"
            slot="${e.slot??l}"
    >${s.iconOnLeft?o`<vaadin-icon icon="${s.iconOnLeft}"></vaadin-icon>`:l}${i}${s.iconOnRight?o`<vaadin-icon icon="${s.iconOnRight}"></vaadin-icon>`:l}</vaadin-button>`},$l=(e,t,a,s,i,r,n)=>{const d=t.metadata;if(!d)return o``;let c="";return d.variants?.map(u=>u=="stretchMedia"?"stretch-media":u=="coverMedia"?"cover-media":u).forEach(u=>c+=" "+u),c=c.trim(),o`
        <vaadin-card
                style="${t.style}" 
                class="${t.cssClasses}" 
                theme="${c}"
                slot="${t.slot??l}"
        >
            ${d.media?ca(e,d.media,a,s,i,r,n,"media",!1):l}
            ${d.title?ca(e,d.title,a,s,i,r,n,"title",!1):l}
            ${d.subtitle?ca(e,d.subtitle,a,s,i,r,n,"subtitle",!1):l}
            ${d.header?ca(e,d.header,a,s,i,r,n,"header",!1):l}
            ${d.headerPrefix?ca(e,d.headerPrefix,a,s,i,r,n,"header-prefix",!1):l}
            ${d.headerSuffix?ca(e,d.headerSuffix,a,s,i,r,n,"header-suffix",!1):l}
            ${d.footer?ca(e,d.footer,a,s,i,r,n,"footer",!1):l}
            ${d.content?w(e,d.content,a,s,i,r,n,!1):l}
        </vaadin-card>
    `},yl=e=>{const t=e.metadata;return o`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??l}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},xl=e=>{const t=e.metadata;return o`
        <vaadin-icon icon="${t.icon}" style="${e.style}" class="${e.cssClasses}"
                     slot="${e.slot??l}"></vaadin-icon>
    `},wl=(e,t,a,s,i,r,n)=>{const d=t.metadata;let c=!1;if(d.openedCondition)try{c=Ar(d.openedCondition,s,i,r,n)}catch(u){console.error("when evaluating "+d.openedCondition+" :"+u+", where data is "+i+" and state is "+s)}return o`
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
  ${t.children?.map(u=>w(e,u,a,s,i,r,n))}
</vaadin-confirm-dialog>
            `},kl=e=>{const t=e.metadata;let a;return t.position&&(a={Top:"top",Bottom:"bottom",TopLeft:"top-left",TopRight:"top-right",BottomLeft:"bottom-left",BottomRight:"bottom-right"}[t.position]),o`
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
    `},Cl=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        <vaadin-details 
                ?opened="${d.opened}" 
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??l}"
        >
            <vaadin-details-summary slot="summary">
            ${w(e,d.summary,a,s,i,r,n)}
            </vaadin-details-summary>
            ${w(e,d.content,a,s,i,r,n)}
        </vaadin-details>
            `},Sl=(e,t,a,s,i,r)=>o`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${s}"
            .appState="${i}"
            .appdata="${r}"
        ></mateu-dialog>
            `,Il=(e,t,a,s,i,r)=>o`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${s}"
            .appState="${i}"
            .appdata="${r}"
        ></mateu-drawer>
            `,_l=e=>{const t=e.metadata;return o`
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
            `},El=e=>{const t=e.metadata;return o`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style}" class="${e.cssClasses}"
                        slot="${e.slot??l}"></mateu-markdown>
            `},Tl=e=>{const t=e.metadata;return o`
        <vaadin-notification
                .opened="${!0}"
                slot="${e.slot??l}"
                style="${e.style}"
                class="${e.cssClasses}"
                ${Pr(()=>o`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${t.title}</h3>
                        <div>
                            ${t.text}
                        </div>
                    </vaadin-horizontal-layout>
                `,[])}
        ></vaadin-notification>
            `},Pl=(e,t={})=>{const a=e.metadata,s=a.valueKey?t[a.valueKey]:a.value;return o`
        <div style="${e.style}">
        <vaadin-progress-bar
                ?indeterminate="${a.indeterminate}"
                min="${a.min&&a.min!=0?a.min:l}"
                max="${a.max&&a.max!=0?a.max:l}"
                value="${s??l}"
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??l}"
        ></vaadin-progress-bar>
        ${a.text?o`<span class="text-secondary text-xs" id="sublbl">
    ${a.text}
  </span>`:l}
        </div>
    `},Ol=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        <div id="show-notifications" slot="${t.slot??l}">${w(e,d.wrapped,a,s,i,r,n)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                ${Or(()=>o`${w(e,d.content,a,s,i,r,n)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
        ></vaadin-popover>
    `},Rl=e=>{const t=e.metadata;return o`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??l}"></mateu-map>
            `},zl=e=>{const t=e.metadata;return o`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??l}">
            `},Al=e=>{const t=e.metadata;return o`<vaadin-horizontal-layout theme="spacing"
                                          slot="${e.slot??l}">
        ${t.breadcrumbs.map(a=>o`
            <a href="${a.link}">${a.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </vaadin-horizontal-layout>`},jl=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${d.dots}" 
                ?nav = "${d.nav}" 
                ?loop = "${d.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(c=>o`<div>${w(e,c,a,s,i,r,n)}</div>`)}
        </skeleton-carousel>
    `},Ll=(e,t,a,s)=>{const i=e.metadata;return o`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??l}">
            ${i.menu.map(r=>Br(r))}
        </div>
            `},Br=e=>o`
        ${e.submenus?o`
                <vaadin-details summary="${e.label}" opened>
                    <vaadin-vertical-layout theme="spacing">
                        ${e.submenus.map(t=>Br(t))}
                    </vaadin-vertical-layout>
                </vaadin-details>
            `:o`
                <a href="${e.path}">${e.label}</a>
        `}
        `,Dl=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`<div
                slot="${t.slot??l}"
                style="${t.style}" class="${t.cssClasses}"
        >${d.content?he(d.content):l}${t.children?.map(c=>w(e,c,a,s,i,r,n))}</div>
    `},Nl=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=d.title?.includes("${")?e._evalTemplate(d.title):d.title;return o`<div
                slot="${t.slot??l}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?o`<div style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color); margin-bottom: var(--lumo-space-s);">${c}</div>`:l}
        ${t.children?.map(u=>w(e,u,a,s,i,r,n))}
    </div>
    `},Fl=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=d.title?.includes("${")?e._evalTemplate(d.title):d.title;return o`
        <div
                slot="${t.slot??l}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(u=>w(e,u,a,s,i,r,n))}</div>
    `},Is=(e,t,a,s,i,r,n,d)=>{const c=t.metadata,u=c?.fabs??[];return o`<mateu-page
            .component="${t}"
            baseUrl="${a}"
            .state="${s}"
            .data="${i}"
            .appState="${r}"
            .appdata="${n}"
            slot="${t.slot??l}"
            style="${t.style}"
            class="${t.cssClasses}"
            ?standalone="${d??!1}"
    >
        ${t.children?.map(m=>w(e,m,a,s,i,r,n))}
        ${c?.buttons?.map(m=>o`
                   ${w(e,{id:m.actionId,metadata:m,type:oe.ClientSide,slot:"buttons"},void 0,s,i,r,n)}
`)}
        ${u.map((m,h)=>o`
            <button class="page-fab" style="position: fixed; bottom: ${1.5+h*4}rem; right: 5.5rem;"
                @click="${()=>e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:m.actionId},bubbles:!0,composed:!0}))}"
                title="${m.label}">
                <vaadin-icon icon="${m.icon}"></vaadin-icon>
            </button>
        `)}
</mateu-page>
    `},_s=(e,t,a,s,i,r,n,d)=>o`<mateu-table-crud
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
            slot="${t.slot??l}"
            ?standalone="${d??!1}"
    >
        ${t.children?.map(c=>w(e,c,a,s,i,r,n))}
    </mateu-table-crud>`,Ml=e=>{const t=e.metadata;return o`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??l}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},ql=(e,t,a)=>{const s=e.metadata;return o`<mateu-chat sseUrl="${s.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??l}"></mateu-chat>`},Ul=e=>{const t=e.metadata;return o`
        <mateu-workflow
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow>
    `},Bl=e=>{const t=e.metadata;return o`
        <mateu-workflow-elk
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
                ?readOnly="${t.readOnly??!1}"
        ></mateu-workflow-elk>
    `},Vl=e=>{const t=e.metadata;return o`
        <mateu-form-editor
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
                value="${t.value??'{"name":"New Form","fields":[]}'}"
        ></mateu-form-editor>
    `},Vr=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,Hl=e=>e=="up"?"var(--lumo-success-text-color, #1a7f37)":e=="down"?"var(--lumo-error-text-color, #c5221f)":"var(--lumo-secondary-text-color, #666)",Wl=e=>e=="up"?"▲":e=="down"?"▼":"",Gl=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},Kl=e=>{const t=e.metadata,a=!!t.actionId;return o`
        <div class="mateu-metric-card ${e.cssClasses??""}"
             style="${Vr} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${a?"cursor: pointer;":""} ${e.style??""}"
             slot="${e.slot??l}"
             role="${a?"button":l}"
             @click="${s=>Gl(s,t)}"
        >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${t.title}</span>
                ${t.icon?o`<vaadin-icon icon="${t.icon}" style="color: var(--lumo-tertiary-text-color, #999); width: 1.1em; height: 1.1em;"></vaadin-icon>`:l}
            </div>
            <div style="display: flex; align-items: baseline; gap: .35rem;">
                <span style="font-size: var(--lumo-font-size-xxxl, 2rem); font-weight: 600; line-height: 1.1;">${t.value}</span>
                ${t.unit?o`<span style="font-size: var(--lumo-font-size-m, 1rem); color: var(--lumo-secondary-text-color, #666);">${t.unit}</span>`:l}
            </div>
            ${t.trend||t.trendLabel?o`
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${Hl(t.trend)};">
                    ${Wl(t.trend)} ${t.trendLabel??l}
                </span>
            `:l}
            ${t.description?o`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:l}
        </div>
    `},Yl=(e,t,a,s,i,r,n)=>o`
        <div class="mateu-scoreboard ${t.cssClasses??""}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${t.children?.map(d=>w(e,d,a,s,i,r,n))}
        </div>
    `,Jl=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=d.colSpan&&d.colSpan>1?`grid-column: span ${d.colSpan};`:"",u=d.rowSpan&&d.rowSpan>1?`grid-row: span ${d.rowSpan};`:"";return o`
        <div class="mateu-dashboard-panel ${t.cssClasses??""}"
             style="${Vr} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${u} ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${d.title?o`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${d.title}</h3>
                    ${d.subtitle?o`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${d.subtitle}</span>`:l}
                </div>
            `:l}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(m=>w(e,m,a,s,i,r,n))}
            </div>
        </div>
    `},Xl=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=d.columns&&d.columns>0?`repeat(${d.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return o`
        <div class="mateu-dashboard ${t.cssClasses??""}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${t.children?.map(u=>w(e,u,a,s,i,r,n))}
        </div>
    `};var Ql=Object.defineProperty,Zl=Object.getOwnPropertyDescriptor,Rt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Zl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Ql(t,a,i),i};let Ze=class extends S{constructor(){super(...arguments),this.panels=[],this.headerTitle="",this.badges=[],this.orientation="vertical",this.navigation=null,this.overviewEditActionId="",this.openPanels=new Set,this.expandedPanel=null,this._onPopState=()=>{const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(e.startsWith("expand=")){const t=e.slice(7),a=this.panels.findIndex((s,i)=>this.panelAnchor(s,i)===t);this.expandedPanel=a>=0?a:null}else this.expandedPanel=null},this.initialized=!1}navAction(e){e&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),window.addEventListener("popstate",this._onPopState)}disconnectedCallback(){window.removeEventListener("popstate",this._onPopState),super.disconnectedCallback()}willUpdate(){if(!this.initialized&&this.panels.length){this.openPanels=new Set(this.panels.map((t,a)=>t.open?a:-1).filter(t=>t>=0));const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(e.startsWith("expand=")){const t=e.slice(7),a=this.panels.findIndex((s,i)=>this.panelAnchor(s,i)===t);a>=0&&(this.expandedPanel=a)}else if(e){const t=this.panels.findIndex((a,s)=>this.panelAnchor(a,s)===e);t>=0&&this.openPanels.add(t)}this.initialized=!0}}firstUpdated(){const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(!e)return;const t=this.renderRoot.querySelector(`[data-anchor="${CSS.escape(e)}"]`);t&&t.scrollIntoView({block:"nearest"})}panelAnchor(e,t){return(e.title??"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||`panel-${t}`}bookmarkPanel(e){const t=this.panelAnchor(this.panels[e],e);try{history.replaceState(history.state,"","#"+t)}catch{}}clearBookmark(e){const t=this.panelAnchor(this.panels[e],e);if(decodeURIComponent((location.hash||"").replace(/^#/,""))===t)try{history.replaceState(history.state,"",location.pathname+location.search)}catch{}}expandPanel(e,t){t?.stopPropagation(),this.expandedPanel=e;const a=this.panelAnchor(this.panels[e],e);try{history.pushState(history.state,"","#expand="+a)}catch{}}collapsePanel(){try{history.back()}catch{this.expandedPanel=null}}toggle(e){const t=new Set(this.openPanels);t.has(e)?(t.delete(e),this.clearBookmark(e)):(t.add(e),this.bookmarkPanel(e)),this.openPanels=t}render(){if(this.expandedPanel!=null&&this.panels[this.expandedPanel]){const t=this.panels[this.expandedPanel];return o`
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
                                            @click="${s=>this.expandPanel(a,s)}">⤢</button>
                                    <button class="fold" title="Fold" @click="${s=>{s.stopPropagation(),this.toggle(a)}}">⟨</button>
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
        `}};Ze.styles=C`
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
    `;Rt([p({type:Array})],Ze.prototype,"panels",2);Rt([p({type:String})],Ze.prototype,"headerTitle",2);Rt([p({type:Array})],Ze.prototype,"badges",2);Rt([p({type:String,reflect:!0})],Ze.prototype,"orientation",2);Rt([p({attribute:!1})],Ze.prototype,"navigation",2);Rt([p({type:String})],Ze.prototype,"overviewEditActionId",2);Rt([$()],Ze.prototype,"openPanels",2);Rt([$()],Ze.prototype,"expandedPanel",2);Ze=Rt([k("mateu-foldout")],Ze);const ed=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
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
            ${t.children?.map(c=>w(e,c,a,s,i,r,n))}
        </mateu-foldout>
    `},td=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=!!d.image,u=c?`background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${d.image}'); background-size: cover; background-position: center; color: #fff;`:"",m=d.centered===!1?"flex-start":"center",h=d.centered===!1?"left":"center";return o`
        <div class="mateu-hero ${t.cssClasses??""}"
             style="display: flex; flex-direction: column; align-items: ${m}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${h}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); min-height: ${d.height??"12rem"}; box-sizing: border-box; ${u} ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${d.title?o`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${d.title}</h1>`:l}
            ${d.subtitle?o`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${c?"":"color: var(--lumo-secondary-text-color, #666);"} max-width: 40rem;">${d.subtitle}</p>`:l}
            ${t.children?.length?o`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${m}; width: 100%; max-width: 40rem;">
                    ${t.children?.map(f=>w(e,f,a,s,i,r,n))}
                </div>
            `:l}
        </div>
    `};var ad=Object.defineProperty,id=Object.getOwnPropertyDescriptor,Ds=(e,t,a,s)=>{for(var i=s>1?void 0:s?id(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&ad(t,a,i),i};const gs=1440*60*1e3;let oi=class extends S{constructor(){super(...arguments),this.tasks=[],this.onTaskSelectionActionId=""}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}range(){const e=this.tasks.flatMap(t=>[t.start,t.end]).filter(t=>!!t).map(t=>new Date(t+"T00:00:00").getTime());return e.length?{min:Math.min(...e)-gs,max:Math.max(...e)+2*gs}:null}months(e,t){const a=[],s=new Date(e);for(s.setDate(1);s.getTime()<=t;){const i=Math.max(s.getTime(),e),r=new Date(s.getFullYear(),s.getMonth()+1,1),n=Math.min(r.getTime(),t);a.push({label:s.toLocaleDateString(void 0,{month:"short",year:"2-digit"}),from:i,to:n}),s.setMonth(s.getMonth()+1)}return a}render(){const e=this.range();if(!e)return o``;const t=e.max-e.min,a=i=>(i-e.min)/t*100,s=Date.now();return o`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(i=>o`
                        <div class="month" style="width: ${(i.to-i.from)/t*100}%;">${i.label}</div>
                    `)}
                </div>
                ${this.tasks.map(i=>{const r=new Date(i.start+"T00:00:00").getTime(),n=new Date(i.end+"T00:00:00").getTime()+gs;return o`
                        <div class="label" title="${i.title}">${i.title}</div>
                        <div class="lane">
                            ${s>=e.min&&s<=e.max?o`<div class="today" style="left: ${a(s)}%;"></div>`:l}
                            <div class="bar ${this.onTaskSelectionActionId?"clickable":""}"
                                 title="${i.title} · ${i.start} → ${i.end}${i.progress?` · ${i.progress}%`:""}"
                                 @click="${()=>this.selectTask(i)}"
                                 style="left: ${a(r)}%; width: ${(n-r)/t*100}%; ${i.color?`--mateu-gantt-fill: ${i.color};`:""}">
                                <div class="fill" style="width: ${i.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};oi.styles=C`
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
    `;Ds([p({type:Array})],oi.prototype,"tasks",2);Ds([p()],oi.prototype,"onTaskSelectionActionId",2);oi=Ds([k("mateu-gantt")],oi);const sd=e=>{const t=e.metadata;return o`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                .onTaskSelectionActionId="${t.onTaskSelectionActionId??""}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-gantt>
    `};var rd=Object.defineProperty,od=Object.getOwnPropertyDescriptor,ta=(e,t,a,s)=>{for(var i=s>1?void 0:s?od(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&rd(t,a,i),i};let M=class extends S{constructor(){super(...arguments),this.resources=[],this.blocks=[],this.drag=null,this.dragStartX=0,this.dragStartY=0,this.laneRects=[],this.onDragKeydown=e=>{e.key==="Escape"&&this.drag&&(e.stopPropagation(),this.endDrag())}}static parse(e){return new Date(e+"T00:00:00")}static iso(e){const t=a=>String(a).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}static addDays(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}static daysBetween(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}window(){if(this.from&&this.to){const s=M.parse(this.from),i=M.daysBetween(s,M.parse(this.to))+1;return i>0?{from:s,days:i}:null}const e=this.blocks.flatMap(s=>[s.start,s.end]).filter(s=>!!s).map(s=>M.parse(s));if(!e.length)return null;const t=new Date(Math.min(...e.map(s=>s.getTime()))),a=new Date(Math.max(...e.map(s=>s.getTime())));return{from:t,days:M.daysBetween(t,a)+1}}onBlockPointerDown(e,t,a){if(!this.moveActionId&&!this.selectActionId||(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.dragStartX=e.clientX,this.dragStartY=e.clientY,!this.window()))return;const r=M.parse(t.start),n=M.parse(t.end),d=Math.max(1,M.daysBetween(r,n)+1);this.laneRects=[...this.renderRoot.querySelectorAll(".lane[data-resource-id]")].map(u=>({resourceId:u.dataset.resourceId,rect:u.getBoundingClientRect()}));const c=this.dayAt(t.resourceId,e.clientX)??a;this.drag={blockId:t.id,duration:d,grabOffsetDays:c-a,originResourceId:t.resourceId,originStartIdx:a,targetResourceId:t.resourceId,targetStartIdx:a,moved:!1},window.addEventListener("keydown",this.onDragKeydown)}dayAt(e,t){const a=this.laneRects.find(r=>r.resourceId===e),s=this.window();if(!a||!s||a.rect.width===0)return null;const i=Math.floor((t-a.rect.left)/a.rect.width*s.days);return Math.max(0,Math.min(s.days-1,i))}onBlockPointerMove(e){if(!this.drag||!this.drag.moved&&Math.abs(e.clientX-this.dragStartX)<4&&Math.abs(e.clientY-this.dragStartY)<4||!this.moveActionId)return;const t=this.window();if(!t)return;const a=this.laneRects.find(r=>e.clientY>=r.rect.top&&e.clientY<=r.rect.bottom)??this.laneRects.find(r=>r.resourceId===this.drag.targetResourceId);if(!a)return;const s=this.dayAt(a.resourceId,e.clientX);if(s==null)return;const i=Math.max(0,Math.min(t.days-this.drag.duration,s-this.drag.grabOffsetDays));this.drag={...this.drag,moved:!0,targetResourceId:a.resourceId,targetStartIdx:i}}onBlockPointerUp(e){const t=this.drag;if(this.endDrag(),!t)return;if(!t.moved){this.selectActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.selectActionId,parameters:{_blockId:e.id}},bubbles:!0,composed:!0}));return}if(!this.moveActionId||t.targetResourceId===t.originResourceId&&t.targetStartIdx===t.originStartIdx)return;const a=this.window();if(!a)return;const s=M.addDays(a.from,t.targetStartIdx),i=M.addDays(s,t.duration-1);this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.moveActionId,parameters:{_blockId:t.blockId,_resourceId:t.targetResourceId,_start:M.iso(s),_end:M.iso(i)}},bubbles:!0,composed:!0}))}endDrag(){this.drag=null,window.removeEventListener("keydown",this.onDragKeydown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.onDragKeydown)}render(){const e=this.window();if(!e||!this.resources.length)return o``;const t=[...Array(e.days).keys()].map(d=>M.addDays(e.from,d)),a=new Date,s=M.daysBetween(e.from,new Date(a.getFullYear(),a.getMonth(),a.getDate())),i=s>=0&&s<e.days,r=[];let n;return this.resources.forEach(d=>{d.group&&d.group!==n&&r.push(o`<div class="group">${d.group}</div>`),n=d.group,r.push(this.renderRow(d,e,t,i?s:null))}),o`
            <div class="frame" style="grid-template-columns: minmax(8rem, 12rem) repeat(${e.days}, minmax(2.2rem, 1fr));">
                <div class="corner">Resource</div>
                ${t.map((d,c)=>o`
                    <div class="day-head ${this.isWeekend(d)?"weekend":""} ${c===s?"today":""}">
                        <span class="dow">${d.toLocaleDateString(void 0,{weekday:"short"})}</span>
                        <span class="num">${d.getDate()}</span>
                    </div>
                `)}
                ${r}
            </div>
        `}isWeekend(e){return e.getDay()===0||e.getDay()===6}renderRow(e,t,a,s){const i=100/t.days,r=this.blocks.filter(d=>d.resourceId===e.id&&d.start&&d.end),n=this.drag?.moved&&this.drag.targetResourceId===e.id?this.drag:null;return o`
            <div class="label" title="${e.label??""}">${e.label}</div>
            <div class="lane" data-resource-id="${e.id}">
                <div class="cells">
                    ${a.map(d=>o`<div class="cell ${this.isWeekend(d)?"weekend":""}"></div>`)}
                </div>
                ${s!=null?o`<div class="today-line" style="left: ${(s+.5)*i}%;"></div>`:l}
                ${r.map(d=>{const c=M.daysBetween(t.from,M.parse(d.start)),u=M.daysBetween(t.from,M.parse(d.end));if(u<0||c>=t.days)return l;const m=Math.max(0,c),h=Math.min(t.days-1,u),f=this.drag?.moved&&this.drag.blockId===d.id;return o`
                        <div class="block ${this.selectActionId?"clickable":""} ${this.moveActionId?"draggable":""} ${f?"dragging":""}"
                             title="${d.label??""} · ${d.start} → ${d.end}${d.status?` · ${d.status}`:""}"
                             style="left: ${m*i}%; width: ${(h-m+1)*i}%; ${d.color?`--mateu-planning-block: ${d.color};`:""}"
                             @pointerdown="${g=>this.onBlockPointerDown(g,d,c)}"
                             @pointermove="${g=>this.onBlockPointerMove(g)}"
                             @pointerup="${()=>this.onBlockPointerUp(d)}"
                             @pointercancel="${()=>this.endDrag()}"
                        >${d.label}</div>
                    `})}
                ${n?o`
                    <div class="ghost"
                         style="left: ${n.targetStartIdx*i}%; width: ${Math.min(n.duration,t.days-n.targetStartIdx)*i}%;"></div>
                `:l}
            </div>
        `}};M.styles=C`
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
    `;ta([p({type:Array})],M.prototype,"resources",2);ta([p({type:Array})],M.prototype,"blocks",2);ta([p()],M.prototype,"from",2);ta([p()],M.prototype,"to",2);ta([p()],M.prototype,"moveActionId",2);ta([p()],M.prototype,"selectActionId",2);ta([$()],M.prototype,"drag",2);M=ta([k("mateu-planning-board")],M);const nd=e=>{const t=e.metadata;return o`
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
    `};var ld=Object.defineProperty,dd=Object.getOwnPropertyDescriptor,Hr=(e,t,a,s)=>{for(var i=s>1?void 0:s?dd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&ld(t,a,i),i};let Ri=class extends S{constructor(){super(...arguments),this.columns=[]}clickCard(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedCard:e}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};Ri.styles=C`
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
    `;Hr([p({type:Array})],Ri.prototype,"columns",2);Ri=Hr([k("mateu-kanban")],Ri);const cd=e=>{const t=e.metadata;return o`
        <mateu-kanban
                .columns="${t.columns??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-kanban>
    `};var ud=Object.defineProperty,pd=Object.getOwnPropertyDescriptor,Wr=(e,t,a,s)=>{for(var i=s>1?void 0:s?pd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&ud(t,a,i),i};let zi=class extends S{constructor(){super(...arguments),this.items=[]}clickItem(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedItem:e}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};zi.styles=C`
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
    `;Wr([p({type:Array})],zi.prototype,"items",2);zi=Wr([k("mateu-timeline")],zi);const hd=e=>{const t=e.metadata;return o`
        <mateu-timeline
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-timeline>
    `};var md=Object.defineProperty,vd=Object.getOwnPropertyDescriptor,Ns=(e,t,a,s)=>{for(var i=s>1?void 0:s?vd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&md(t,a,i),i};let ni=class extends S{constructor(){super(...arguments),this.steps=[],this.vertical=!1}render(){return o`
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
        `}};ni.styles=C`
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
    `;Ns([p({type:Array})],ni.prototype,"steps",2);Ns([p({type:Boolean,reflect:!0})],ni.prototype,"vertical",2);ni=Ns([k("mateu-progress-steps")],ni);const fd=e=>{const t=e.metadata;return o`
        <mateu-progress-steps
                .steps="${t.steps??[]}"
                ?vertical="${t.vertical??!1}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-progress-steps>
    `};var bd=Object.defineProperty,gd=Object.getOwnPropertyDescriptor,aa=(e,t,a,s)=>{for(var i=s>1?void 0:s?gd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&bd(t,a,i),i};let ut=class extends S{constructor(){super(...arguments),this.spark=[]}sparkline(){const e=this.spark;if(!e||e.length<2)return l;const t=84,a=30,s=2,i=Math.min(...e),n=Math.max(...e)-i||1,d=(t-s*2)/(e.length-1),c=e.map((f,g)=>{const y=s+g*d,x=s+(a-s*2)*(1-(f-i)/n);return[y,x]}),u=c.map(([f,g],y)=>`${y===0?"M":"L"}${f.toFixed(1)} ${g.toFixed(1)}`).join(" "),m=`${u} L${c[c.length-1][0].toFixed(1)} ${a} L${c[0][0].toFixed(1)} ${a} Z`,h=this.trend==="down"?"var(--lumo-error-color, #e11d48)":this.trend==="flat"?"var(--lumo-secondary-text-color, #888)":"var(--lumo-success-color, #12b76a)";return X`
            <svg width="${t}" height="${a}" viewBox="0 0 ${t} ${a}">
                <path d="${m}" fill="${h}" opacity="0.12"></path>
                <path d="${u}" fill="none" stroke="${h}" stroke-width="1.6"
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
        `}};ut.styles=C`
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
    `;aa([p()],ut.prototype,"label",2);aa([p()],ut.prototype,"value",2);aa([p()],ut.prototype,"unit",2);aa([p()],ut.prototype,"delta",2);aa([p()],ut.prototype,"trend",2);aa([p({type:Array})],ut.prototype,"spark",2);aa([p()],ut.prototype,"actionId",2);ut=aa([k("mateu-stat")],ut);const $d=e=>{const t=e.metadata;return o`
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
    `};var yd=Object.defineProperty,xd=Object.getOwnPropertyDescriptor,Fs=(e,t,a,s)=>{for(var i=s>1?void 0:s?xd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&yd(t,a,i),i};let li=class extends S{constructor(){super(...arguments),this.events=[]}clickEvent(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedEvent:e}},bubbles:!0,composed:!0}))}render(){const e=this.month?new Date(this.month+"T00:00:00"):new Date,t=e.getFullYear(),a=e.getMonth(),s=new Date(t,a,1),i=(s.getDay()+6)%7,r=new Date(t,a+1,0).getDate(),n=new Date,d=f=>n.getFullYear()===t&&n.getMonth()===a&&n.getDate()===f,c={};for(const f of this.events){if(!f.date)continue;const g=new Date(f.date+"T00:00:00");g.getFullYear()===t&&g.getMonth()===a&&(c[g.getDate()]??=[]).push(f)}const u=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],m=[];for(let f=0;f<i;f++)m.push(o`<div class="cell blank"></div>`);for(let f=1;f<=r;f++)m.push(o`
                <div class="cell ${d(f)?"today":""}">
                    <span class="num">${f}</span>
                    ${(c[f]??[]).map(g=>o`
                        <span class="chip ${g.actionId?"clickable":""}"
                              style="${g.color?`--mateu-cal-accent: ${g.color};`:""}"
                              title="${g.title??""}"
                              @click="${()=>this.clickEvent(g)}">${g.title}</span>
                    `)}
                </div>
            `);const h=s.toLocaleDateString(void 0,{month:"long",year:"numeric"});return o`
            <div class="title">${h}</div>
            <div class="grid">
                ${u.map(f=>o`<div class="dow">${f}</div>`)}
                ${m}
            </div>
        `}};li.styles=C`
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
    `;Fs([p()],li.prototype,"month",2);Fs([p({type:Array})],li.prototype,"events",2);li=Fs([k("mateu-calendar")],li);const wd=e=>{const t=e.metadata;return o`
        <mateu-calendar
                month="${t.month??l}"
                .events="${t.events??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-calendar>
    `};var kd=Object.defineProperty,Cd=Object.getOwnPropertyDescriptor,Gr=(e,t,a,s)=>{for(var i=s>1?void 0:s?Cd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&kd(t,a,i),i};let Ai=class extends S{constructor(){super(...arguments),this.plans=[]}cta(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};Ai.styles=C`
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
    `;Gr([p({type:Array})],Ai.prototype,"plans",2);Ai=Gr([k("mateu-pricing-table")],Ai);const Sd=e=>{const t=e.metadata;return o`
        <mateu-pricing-table
                .plans="${t.plans??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-pricing-table>
    `};var Id=Object.defineProperty,_d=Object.getOwnPropertyDescriptor,Kr=(e,t,a,s)=>{for(var i=s>1?void 0:s?_d(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Id(t,a,i),i};let ji=class extends S{clickNode(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedNode:e}},bubbles:!0,composed:!0}))}renderNode(e){const t=e.avatar,a=t&&(t.startsWith("http")||t.startsWith("data:"));return o`
            <li>
                <div class="node ${e.actionId?"clickable":""}"
                     style="${e.color?`--mateu-org-accent: ${e.color};`:""}"
                     @click="${()=>this.clickNode(e)}">
                    ${t?o`<span class="avatar">${a?o`<img src="${t}" alt="">`:t}</span>`:l}
                    <span class="title">${e.title}</span>
                    ${e.subtitle?o`<span class="subtitle">${e.subtitle}</span>`:l}
                </div>
                ${e.children&&e.children.length?o`<ul>${e.children.map(s=>this.renderNode(s))}</ul>`:l}
            </li>
        `}render(){return this.root?o`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`:o``}};ji.styles=C`
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
    `;Kr([p({attribute:!1})],ji.prototype,"root",2);ji=Kr([k("mateu-org-chart")],ji);const Ed=e=>{const t=e.metadata;return o`
        <mateu-org-chart
                .root="${t.root}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-org-chart>
    `};var Td=Object.defineProperty,Pd=Object.getOwnPropertyDescriptor,Yr=(e,t,a,s)=>{for(var i=s>1?void 0:s?Pd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Td(t,a,i),i};const Od=1440*60*1e3;let Li=class extends S{constructor(){super(...arguments),this.cells=[]}color(e,t){if(e<=0||t<=0)return"var(--lumo-contrast-10pct, #ebedf0)";const a=e/t,s=a>.75?1:a>.5?.75:a>.25?.5:.3;return`color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round(s*100)}%, transparent)`}render(){const e=this.cells.filter(c=>!!c.date);if(!e.length)return o``;const t=e.map(c=>new Date(c.date+"T00:00:00").getTime()),a=Math.min(...t),s=Math.max(...t),i=new Date(a);i.setDate(i.getDate()-(i.getDay()+6)%7);const r={};for(const c of e)r[c.date]=c;const n=Math.max(...e.map(c=>c.value??0),1),d=[];for(let c=i.getTime();c<=s;c+=Od){const u=new Date(c),m=u.toISOString().slice(0,10),h=r[m],f=h?.value??0,g=(u.getDay()+6)%7+1,y=h?.label??`${m}: ${f}`;d.push(o`
                <div class="cell" style="grid-row: ${g}; --cell: ${this.color(f,n)};" title="${y}"></div>
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
        `}};Li.styles=C`
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
    `;Yr([p({type:Array})],Li.prototype,"cells",2);Li=Yr([k("mateu-heatmap")],Li);const Rd=e=>{const t=e.metadata;return o`
        <mateu-heatmap
                .cells="${t.cells??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-heatmap>
    `};var zd=Object.defineProperty,Ad=Object.getOwnPropertyDescriptor,Jr=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ad(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&zd(t,a,i),i};let Di=class extends S{constructor(){super(...arguments),this.stages=[]}render(){const e=this.stages;if(!e.length)return o``;const t=e[0].value??0,a=Math.max(...e.map(s=>s.value??0),1);return o`
            <div class="funnel">
                ${e.map((s,i)=>{const r=s.value??0,n=a>0?Math.max(6,r/a*100):6,d=i>0?e[i-1].value??0:t,c=i===0?t>0?"100%":"":d>0?`${Math.round(r/d*100)}%`:"0%";return o`
                        <div class="stage">
                            <div class="meta">
                                <span class="label">${s.label}</span>
                                ${i>0?o`<span class="conv">${c} of previous</span>`:l}
                            </div>
                            <div class="bar" style="width: ${n}%; ${s.color?`--bar: ${s.color};`:""}">
                                ${r.toLocaleString()}
                            </div>
                        </div>
                    `})}
            </div>
        `}};Di.styles=C`
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
    `;Jr([p({type:Array})],Di.prototype,"stages",2);Di=Jr([k("mateu-funnel")],Di);const jd=e=>{const t=e.metadata;return o`
        <mateu-funnel
                .stages="${t.stages??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-funnel>
    `};var Ld=Object.defineProperty,Dd=Object.getOwnPropertyDescriptor,qa=(e,t,a,s)=>{for(var i=s>1?void 0:s?Dd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Ld(t,a,i),i};let Wt=class extends S{constructor(){super(...arguments),this.values=[],this.labels=[],this.area=!1}render(){const e=this.values;if(!e||e.length<2)return o``;const t=600,a=160,s=8,i=Math.min(...e),r=Math.max(...e),n=r-i||1,d=(t-s*2)/(e.length-1),c=e.map((y,x)=>{const T=s+x*d,U=s+(a-s*2)*(1-(y-i)/n);return[T,U]}),u=c.map(([y,x],T)=>`${T===0?"M":"L"}${y.toFixed(1)} ${x.toFixed(1)}`).join(" "),m=`${u} L${c[c.length-1][0].toFixed(1)} ${a-s} L${c[0][0].toFixed(1)} ${a-s} Z`,h=this.color||"var(--lumo-primary-color, #1a73e8)",f=e.indexOf(r),g=e.indexOf(i);return o`
            ${this.heading?o`<div class="title">${this.heading}</div>`:l}
            <svg viewBox="0 0 ${t} ${a}" preserveAspectRatio="none">
                ${this.area?X`<path d="${m}" fill="${h}" opacity="0.12"></path>`:l}
                <path d="${u}" fill="none" stroke="${h}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
                ${c.map((y,x)=>x===f||x===g?X`<circle cx="${y[0]}" cy="${y[1]}" r="3.2" fill="${h}"><title>${this.labels[x]??""}: ${e[x]}</title></circle>`:X`<circle cx="${y[0]}" cy="${y[1]}" r="6" fill="transparent"><title>${this.labels[x]??""}: ${e[x]}</title></circle>`)}
            </svg>
            ${this.labels&&this.labels.length?o`<div class="labels"><span>${this.labels[0]}</span><span>${this.labels[this.labels.length-1]}</span></div>`:l}
        `}};Wt.styles=C`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .title { font-weight: 600; margin-bottom: .35rem; color: var(--lumo-body-text-color, #222); }
        svg { display: block; width: 100%; height: auto; overflow: visible; }
        .labels { display: flex; justify-content: space-between; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); margin-top: .2rem; }
    `;qa([p()],Wt.prototype,"heading",2);qa([p({type:Array})],Wt.prototype,"values",2);qa([p({type:Array})],Wt.prototype,"labels",2);qa([p()],Wt.prototype,"color",2);qa([p({type:Boolean})],Wt.prototype,"area",2);Wt=qa([k("mateu-trend-chart")],Wt);const Nd=e=>{const t=e.metadata;return o`
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
    `};var Fd=Object.defineProperty,Md=Object.getOwnPropertyDescriptor,Ms=(e,t,a,s)=>{for(var i=s>1?void 0:s?Md(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Fd(t,a,i),i};let di=class extends S{constructor(){super(...arguments),this.features=[],this.columns=0}clickFeature(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){const e=this.columns&&this.columns>0?`repeat(${this.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(15rem, 1fr))";return o`
            <div class="grid" style="grid-template-columns: ${e};">
                ${this.features.map(t=>o`
                    <div class="card ${t.actionId?"clickable":""}" @click="${()=>this.clickFeature(t)}">
                        ${t.icon?o`<span class="icon">${t.icon}</span>`:l}
                        <span class="title">${t.title}</span>
                        ${t.description?o`<span class="desc">${t.description}</span>`:l}
                    </div>
                `)}
            </div>
        `}};di.styles=C`
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
    `;Ms([p({type:Array})],di.prototype,"features",2);Ms([p({type:Number})],di.prototype,"columns",2);di=Ms([k("mateu-feature-grid")],di);const qd=e=>{const t=e.metadata;return o`
        <mateu-feature-grid
                .features="${t.features??[]}"
                .columns="${t.columns??0}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-feature-grid>
    `};var Ud=Object.defineProperty,Bd=Object.getOwnPropertyDescriptor,Xr=(e,t,a,s)=>{for(var i=s>1?void 0:s?Bd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Ud(t,a,i),i};let Ni=class extends S{constructor(){super(...arguments),this.items=[]}stars(e){const t=Math.max(0,Math.min(5,e||0));return"★".repeat(t)+"☆".repeat(5-t)}render(){return o`
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
        `}};Ni.styles=C`
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
    `;Xr([p({type:Array})],Ni.prototype,"items",2);Ni=Xr([k("mateu-testimonials")],Ni);const Vd=e=>{const t=e.metadata;return o`
        <mateu-testimonials
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-testimonials>
    `};var Hd=Object.defineProperty,Wd=Object.getOwnPropertyDescriptor,qs=(e,t,a,s)=>{for(var i=s>1?void 0:s?Wd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Hd(t,a,i),i};let ci=class extends S{constructor(){super(...arguments),this.items=[],this.openSet=new Set,this.seeded=!1}seed(){this.seeded||(this.seeded=!0,this.items.forEach((e,t)=>{e.open&&this.openSet.add(t)}))}toggle(e){this.openSet.has(e)?this.openSet.delete(e):this.openSet.add(e),this.requestUpdate()}render(){return this.seed(),o`
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
        `}};ci.styles=C`
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
    `;qs([p({type:Array})],ci.prototype,"items",2);qs([$()],ci.prototype,"openSet",2);ci=qs([k("mateu-faq")],ci);const Gd=e=>{const t=e.metadata;return o`
        <mateu-faq
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-faq>
    `};var Kd=Object.defineProperty,Yd=Object.getOwnPropertyDescriptor,Sa=(e,t,a,s)=>{for(var i=s>1?void 0:s?Yd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Kd(t,a,i),i};let Tt=class extends S{themeVars(){switch(this.theme){case"success":return"--accent: var(--lumo-success-color, #12b76a); --bg: var(--lumo-success-color-10pct, rgba(18,183,106,.1));";case"warning":return"--accent: #f59e0b; --bg: rgba(245,158,11,.12);";case"danger":return"--accent: var(--lumo-error-color, #e11d48); --bg: var(--lumo-error-color-10pct, rgba(225,29,72,.1));";default:return"--accent: var(--lumo-primary-color, #1a73e8); --bg: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));"}}cta(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){return o`
            <div class="callout" style="${this.themeVars()}">
                ${this.icon?o`<span class="icon">${this.icon}</span>`:l}
                <div class="body">
                    ${this.heading?o`<span class="heading">${this.heading}</span>`:l}
                    ${this.description?o`<span class="desc">${this.description}</span>`:l}
                    ${this.ctaLabel?o`<button class="cta" @click="${()=>this.cta()}">${this.ctaLabel}</button>`:l}
                </div>
            </div>
        `}};Tt.styles=C`
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
    `;Sa([p()],Tt.prototype,"heading",2);Sa([p()],Tt.prototype,"description",2);Sa([p()],Tt.prototype,"icon",2);Sa([p()],Tt.prototype,"ctaLabel",2);Sa([p()],Tt.prototype,"actionId",2);Sa([p()],Tt.prototype,"theme",2);Tt=Sa([k("mateu-callout-card")],Tt);const Jd=e=>{const t=e.metadata;return o`
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
    `};var Xd=Object.defineProperty,Qd=Object.getOwnPropertyDescriptor,Qr=(e,t,a,s)=>{for(var i=s>1?void 0:s?Qd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Xd(t,a,i),i};let Fi=class extends S{constructor(){super(...arguments),this.comments=[]}renderComment(e){const t=e.avatar&&(e.avatar.startsWith("http")||e.avatar.startsWith("data:"));return o`
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
        `}render(){return o`<div class="thread">${this.comments.map(e=>this.renderComment(e))}</div>`}};Fi.styles=C`
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
    `;Qr([p({type:Array})],Fi.prototype,"comments",2);Fi=Qr([k("mateu-comment-thread")],Fi);const Zd=e=>{const t=e.metadata;return o`
        <mateu-comment-thread
                .comments="${t.comments??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-comment-thread>
    `};var ec=Object.defineProperty,tc=Object.getOwnPropertyDescriptor,Zr=(e,t,a,s)=>{for(var i=s>1?void 0:s?tc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&ec(t,a,i),i};const ac={pdf:"📕",image:"🖼️",img:"🖼️",doc:"📘",docx:"📘",word:"📘",xls:"📗",xlsx:"📗",excel:"📗",sheet:"📗",zip:"🗜️",archive:"🗜️",video:"🎬",audio:"🎵",code:"💻",csv:"📄",txt:"📄"};let Mi=class extends S{constructor(){super(...arguments),this.files=[]}icon(e){return e&&ac[e.toLowerCase()]||"📄"}clickFile(e,t){e.url||e.actionId&&(t.preventDefault(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_file:e}},bubbles:!0,composed:!0})))}render(){return o`
            <div class="list">
                ${this.files.map(e=>{const t=!!e.url||!!e.actionId,a=o`
                        <span class="icon">${this.icon(e.type)}</span>
                        <span class="name">${e.name}</span>
                        ${e.size?o`<span class="size">${e.size}</span>`:l}
                        ${e.url?o`<span class="dl">⬇</span>`:l}
                    `;return e.url?o`<a class="file clickable" href="${e.url}" download target="_blank" rel="noopener">${a}</a>`:o`<div class="file ${t?"clickable":""}" @click="${s=>this.clickFile(e,s)}">${a}</div>`})}
            </div>
        `}};Mi.styles=C`
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
    `;Zr([p({type:Array})],Mi.prototype,"files",2);Mi=Zr([k("mateu-file-list")],Mi);const ic=e=>{const t=e.metadata;return o`
        <mateu-file-list
                .files="${t.files??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-file-list>
    `};var sc=Object.defineProperty,rc=Object.getOwnPropertyDescriptor,Zi=(e,t,a,s)=>{for(var i=s>1?void 0:s?rc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&sc(t,a,i),i};let ja=class extends S{constructor(){super(...arguments),this.items=[],this.localDone=new Map}isDone(e,t){return this.localDone.has(t)?!!this.localDone.get(t):!!e.done}toggle(e,t){const a=!this.isDone(e,t);this.localDone.set(t,a),this.requestUpdate(),e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_item:e,_done:a}},bubbles:!0,composed:!0}))}render(){const e=this.items.length,t=this.items.filter((s,i)=>this.isDone(s,i)).length,a=e>0?Math.round(t/e*100):0;return o`
            <div class="head">
                ${this.heading?o`<span class="title">${this.heading}</span>`:o`<span></span>`}
                <span class="count">${t} / ${e}</span>
            </div>
            <div class="bar"><div class="fill" style="width: ${a}%;"></div></div>
            ${this.items.map((s,i)=>{const r=this.isDone(s,i);return o`
                    <div class="item ${r?"done":""}" @click="${()=>this.toggle(s,i)}">
                        <span class="box">${r?"✓":l}</span>
                        <span class="label">${s.label}</span>
                    </div>
                `})}
        `}};ja.styles=C`
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
    `;Zi([p()],ja.prototype,"heading",2);Zi([p({type:Array})],ja.prototype,"items",2);Zi([$()],ja.prototype,"localDone",2);ja=Zi([k("mateu-checklist")],ja);const oc=e=>{const t=e.metadata;return o`
        <mateu-checklist
                heading="${t.title??l}"
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-checklist>
    `};var nc=Object.defineProperty,lc=Object.getOwnPropertyDescriptor,ia=(e,t,a,s)=>{for(var i=s>1?void 0:s?lc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&nc(t,a,i),i};let pt=class extends S{render(){const e=this.trend??"flat";return o`
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
        `}};pt.styles=C`
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
    `;ia([p()],pt.prototype,"heading",2);ia([p()],pt.prototype,"leftLabel",2);ia([p()],pt.prototype,"leftValue",2);ia([p()],pt.prototype,"rightLabel",2);ia([p()],pt.prototype,"rightValue",2);ia([p()],pt.prototype,"delta",2);ia([p()],pt.prototype,"trend",2);pt=ia([k("mateu-comparison-card")],pt);const dc=e=>{const t=e.metadata;return o`
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
    `},es=C`
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
`,cc=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}),Es=e=>cc.format(e),qi=(e,t)=>{const a=e<0?"-":"",s=Es(Math.abs(e));return t?`${a}${t} ${s}`:`${a}${s}`},uc=(e,t)=>t?`${Es(e)} ${t}`:Es(e);var pc=Object.defineProperty,hc=Object.getOwnPropertyDescriptor,sa=(e,t,a,s)=>{for(var i=s>1?void 0:s?hc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&pc(t,a,i),i};let ht=class extends S{constructor(){super(...arguments),this.title="",this.badges=[],this.facts=[]}render(){const e=!!(this.metricLabel||this.metricValue||this.metricCaption);return o`
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
        `}};ht.styles=[es,C`
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
    `];sa([p()],ht.prototype,"title",2);sa([p({type:Array})],ht.prototype,"badges",2);sa([p()],ht.prototype,"subtitle",2);sa([p({type:Array})],ht.prototype,"facts",2);sa([p()],ht.prototype,"metricLabel",2);sa([p()],ht.prototype,"metricValue",2);sa([p()],ht.prototype,"metricCaption",2);ht=sa([k("mateu-entity-header")],ht);const mc=e=>{const t=e.metadata;return o`
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
    `};var vc=Object.defineProperty,fc=Object.getOwnPropertyDescriptor,ra=(e,t,a,s)=>{for(var i=s>1?void 0:s?fc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&vc(t,a,i),i};let mt=class extends S{constructor(){super(...arguments),this.value=0,this.max=0}fillColor(){return this.dangerAt!=null&&this.value>=this.dangerAt?"error":this.warnAt!=null&&this.value>=this.warnAt?"warning":this.warnAt!=null||this.dangerAt!=null?"success":"primary"}render(){const e=this.max>0?Math.min(Math.max(this.value/this.max,0),1):0,t=Math.round(e*100);return o`
            <div class="meter">
                ${this.label?o`<span class="label">${this.label}</span>`:l}
                <span class="value">${uc(this.value,this.unit)}</span>
                <div class="track">
                    <div class="fill ${this.fillColor()}" style="width: ${t}%"></div>
                </div>
                <span class="caption">${this.caption?this.caption:`${t}%`}</span>
            </div>
        `}};mt.styles=C`
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
    `;ra([p()],mt.prototype,"label",2);ra([p({type:Number})],mt.prototype,"value",2);ra([p({type:Number})],mt.prototype,"max",2);ra([p()],mt.prototype,"unit",2);ra([p()],mt.prototype,"caption",2);ra([p({type:Number})],mt.prototype,"warnAt",2);ra([p({type:Number})],mt.prototype,"dangerAt",2);mt=ra([k("mateu-meter")],mt);const bc=e=>{const t=e.metadata;return o`
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
    `};var gc=Object.defineProperty,$c=Object.getOwnPropertyDescriptor,Ua=(e,t,a,s)=>{for(var i=s>1?void 0:s?$c(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&gc(t,a,i),i};let Gt=class extends S{constructor(){super(...arguments),this.total=0,this.done=0}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){const e=this.total>0&&this.done>=this.total,t=!e&&!!this.actionLabel&&!!this.actionId;return o`
            <div class="banner ${e?"complete":""}">
                <span class="icon">👥</span>
                ${this.label?o`<span class="label">${this.label}</span>`:l}
                <div class="pills">
                    ${Array.from({length:this.total},(a,s)=>o`
                        <span class="pill ${s+1<=this.done?"filled":""}">${s+1}/${this.total}</span>
                    `)}
                </div>
                <span class="spacer"></span>
                ${t?o`<button @click="${()=>this.runAction()}">${this.actionLabel} →</button>`:l}
            </div>
        `}};Gt.styles=C`
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
    `;Ua([p()],Gt.prototype,"label",2);Ua([p({type:Number})],Gt.prototype,"total",2);Ua([p({type:Number})],Gt.prototype,"done",2);Ua([p()],Gt.prototype,"actionLabel",2);Ua([p()],Gt.prototype,"actionId",2);Gt=Ua([k("mateu-task-progress")],Gt);const yc=e=>{const t=e.metadata;return o`
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
    `};var xc=Object.defineProperty,wc=Object.getOwnPropertyDescriptor,mi=(e,t,a,s)=>{for(var i=s>1?void 0:s?wc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&xc(t,a,i),i};let ha=class extends S{constructor(){super(...arguments),this.items=[],this.compact=!1,this.frameless=!1}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}rowClicked(e){this.rowActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.rowActionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}render(){return o`
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
                        ${e.actionLabel&&e.actionId?o`<vaadin-button theme="small" @click="${()=>this.runAction(e)}">${e.actionLabel}</vaadin-button>`:l}
                    </div>
                `)}
            </div>
        `}};ha.styles=[es,C`
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
    `];mi([p({type:Array})],ha.prototype,"items",2);mi([p({type:Boolean})],ha.prototype,"compact",2);mi([p({type:Boolean})],ha.prototype,"frameless",2);mi([p()],ha.prototype,"rowActionId",2);ha=mi([k("mateu-status-list")],ha);const kc=e=>{const t=e.metadata;return o`
        <mateu-status-list
                .items="${t.items??[]}"
                ?compact="${t.compact??!1}"
                ?frameless="${t.frameless??!1}"
                rowActionId="${P(t.rowActionId??void 0)}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-status-list>
    `};var Cc=Object.defineProperty,Sc=Object.getOwnPropertyDescriptor,eo=(e,t,a,s)=>{for(var i=s>1?void 0:s?Sc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Cc(t,a,i),i};let Ui=class extends S{constructor(){super(...arguments),this.items=[]}render(){return o`
            <ul>
                ${this.items.map(e=>o`<li>${e}</li>`)}
            </ul>
        `}};Ui.styles=C`
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
    `;eo([p({type:Array})],Ui.prototype,"items",2);Ui=eo([k("mateu-bulleted-list")],Ui);const Ic=e=>{const t=e.metadata;return o`
        <mateu-bulleted-list
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-bulleted-list>
    `},_c=e=>{const a=e.metadata.attributes?.["data-colspan"];return o`
        <hr style="border: none; border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); width: 100%; margin: var(--lumo-space-s, .5rem) 0; ${e.style??""}"
            class="${e.cssClasses??l}"
            id="${P(e.id??void 0)}"
            data-colspan="${P(a)}"
            slot="${e.slot??l}"/>
    `};var Ec=Object.defineProperty,Tc=Object.getOwnPropertyDescriptor,Ve=(e,t,a,s)=>{for(var i=s>1?void 0:s?Tc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Ec(t,a,i),i};const Pc={info:"ℹ",success:"✓",warning:"!",danger:"!"};let Ce=class extends S{constructor(){super(...arguments),this.text="",this.theme="info",this.noIcon=!1,this.slim=!1,this.fullWidth=!1,this.hasContent=!1,this.inlineContent=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){const e=!!this.text&&!!this.text.trim();if(!e&&!this.hasContent)return o``;const t=["info","success","warning","danger"].includes(this.theme)?this.theme:"info";return o`
            <div class="notice ${t} ${this.slim?"slim":""}">
                ${this.noIcon?l:o`<span class="icon ${this.icon?"custom":""}">${this.icon||Pc[t]}</span>`}
                <div class="body ${this.inlineContent?"inline":""}">
                    ${e?o`<span class="text">${this.text}</span>`:l}
                    ${this.hasContent?o`<div class="content"><slot></slot></div>`:l}
                </div>
                ${this.actionLabel&&this.actionId?o`<vaadin-button theme="small" @click="${()=>this.runAction()}">${this.actionLabel}</vaadin-button>`:this.status?o`<span class="status">${this.status}</span>`:l}
            </div>
        `}};Ce.styles=C`
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
    `;Ve([p()],Ce.prototype,"text",2);Ve([p()],Ce.prototype,"theme",2);Ve([p()],Ce.prototype,"icon",2);Ve([p({type:Boolean})],Ce.prototype,"noIcon",2);Ve([p()],Ce.prototype,"actionLabel",2);Ve([p()],Ce.prototype,"actionId",2);Ve([p()],Ce.prototype,"status",2);Ve([p({type:Boolean})],Ce.prototype,"slim",2);Ve([p({type:Boolean})],Ce.prototype,"fullWidth",2);Ve([p({type:Boolean})],Ce.prototype,"hasContent",2);Ve([p({type:Boolean})],Ce.prototype,"inlineContent",2);Ce=Ve([k("mateu-notice")],Ce);const Oc=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=ii(d.text??"",s,i,r,n)??"",u=t.children??[];return o`
        <mateu-notice
                text="${c}"
                theme="${d.theme??"info"}"
                icon="${P(d.icon??void 0)}"
                ?noIcon="${d.noIcon??!1}"
                actionLabel="${P(d.actionLabel??void 0)}"
                actionId="${P(d.actionId??void 0)}"
                status="${P(d.status??void 0)}"
                ?slim="${d.slim??!1}"
                ?fullWidth="${d.fullWidth??!1}"
                ?inlineContent="${d.inlineContent??!1}"
                ?hasContent="${u.length>0}"
                data-colspan="${d.fullWidth?"99":l}"
                style="${t.style??l}"
                class="${t.cssClasses??l}"
                slot="${t.slot??l}"
        >${u.map(m=>w(e,m,a,s,i,r,n))}</mateu-notice>
    `};var Rc=Object.defineProperty,zc=Object.getOwnPropertyDescriptor,ts=(e,t,a,s)=>{for(var i=s>1?void 0:s?zc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Rc(t,a,i),i};let La=class extends S{constructor(){super(...arguments),this.groups=[]}willUpdate(e){e.has("groups")&&(this.selectedId=this.groups.flatMap(t=>t.items??[]).find(t=>t.selected)?.id)}select(e){this.selectedId=e,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};La.styles=[es,C`
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
    `];ts([p()],La.prototype,"actionId",2);ts([p({type:Array})],La.prototype,"groups",2);ts([$()],La.prototype,"selectedId",2);La=ts([k("mateu-task-queue")],La);const Ac=e=>{const t=e.metadata;return o`
        <mateu-task-queue
                .actionId="${t.actionId}"
                .groups="${t.groups??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-task-queue>
    `};var jc=Object.defineProperty,Lc=Object.getOwnPropertyDescriptor,Ba=(e,t,a,s)=>{for(var i=s>1?void 0:s?Lc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&jc(t,a,i),i};let Kt=class extends S{constructor(){super(...arguments),this.columns=0,this.items=[]}willUpdate(e){e.has("items")&&(this.selectedId=this.items.find(t=>t.selected)?.id)}select(e){e.disabled||(this.selectedId=e.id,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0})))}render(){const e=this.columns>0?`grid-template-columns: repeat(${this.columns}, minmax(0, 1fr));`:"grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));";return o`
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
        `}};Kt.styles=[es,C`
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
    `];Ba([p()],Kt.prototype,"actionId",2);Ba([p({type:Number})],Kt.prototype,"columns",2);Ba([p()],Kt.prototype,"recommendedLabel",2);Ba([p({type:Array})],Kt.prototype,"items",2);Ba([$()],Kt.prototype,"selectedId",2);Kt=Ba([k("mateu-resource-grid")],Kt);const Dc=e=>{const t=e.metadata;return o`
        <mateu-resource-grid
                .actionId="${t.actionId}"
                .columns="${t.columns??0}"
                .recommendedLabel="${t.recommendedLabel}"
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-resource-grid>
    `};var Nc=Object.defineProperty,Fc=Object.getOwnPropertyDescriptor,je=(e,t,a,s)=>{for(var i=s>1?void 0:s?Fc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Nc(t,a,i),i};let me=class extends S{constructor(){super(...arguments),this.title="",this.features=[],this.current=!1,this.added=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};me.styles=C`
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
    `;je([p()],me.prototype,"tag",2);je([p()],me.prototype,"title",2);je([p()],me.prototype,"subtitle",2);je([p()],me.prototype,"image",2);je([p({type:Array})],me.prototype,"features",2);je([p()],me.prototype,"priceLabel",2);je([p()],me.prototype,"actionLabel",2);je([p()],me.prototype,"actionId",2);je([p({type:Boolean})],me.prototype,"current",2);je([p()],me.prototype,"currentLabel",2);je([p({type:Boolean})],me.prototype,"added",2);je([p()],me.prototype,"addedLabel",2);me=je([k("mateu-offer-card")],me);const Mc=e=>{const t=e.metadata;return o`
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
    `};var qc=Object.defineProperty,Uc=Object.getOwnPropertyDescriptor,Va=(e,t,a,s)=>{for(var i=s>1?void 0:s?Uc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&qc(t,a,i),i};let Yt=class extends S{constructor(){super(...arguments),this.items=[],this.added=new Set}willUpdate(e){e.has("items")&&(this.added=new Set(this.items.filter(t=>t.added).map(t=>t.id)))}total(){return this.items.filter(e=>e.id!=null&&this.added.has(e.id)).reduce((e,t)=>e+(t.price??0),0)}toggle(e){if(e.id==null)return;const t=new Set(this.added),a=!t.has(e.id);a?t.add(e.id):t.delete(e.id),this.added=t,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id,_added:a,_total:this.total()}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="header">
                ${this.totalLabel?o`<span class="total-label">${this.totalLabel}:</span>`:l}
                <span class="total">${qi(this.total(),this.currency)}</span>
            </div>
            <div class="grid">
                ${this.items.map(e=>{const t=e.id!=null&&this.added.has(e.id);return o`
                        <div class="card ${t?"added":""}">
                            ${e.icon?o`<span class="icon">${e.icon}</span>`:l}
                            <span class="title">${e.title}</span>
                            ${e.description?o`<span class="description">${e.description}</span>`:l}
                            ${e.includedLabel?o`<span class="included">${e.includedLabel}</span>`:o`
                                    ${e.price!=null?o`
                                        <span class="price">${qi(e.price,this.currency)}${e.unit?` / ${e.unit}`:""}</span>
                                    `:l}
                                    <button class="toggle ${t?"on":""}" @click="${()=>this.toggle(e)}"
                                            aria-pressed="${t}">${t?"✓":"+"}</button>
                                `}
                        </div>
                    `})}
            </div>
        `}};Yt.styles=C`
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
    `;Va([p()],Yt.prototype,"totalLabel",2);Va([p()],Yt.prototype,"currency",2);Va([p()],Yt.prototype,"actionId",2);Va([p({type:Array})],Yt.prototype,"items",2);Va([$()],Yt.prototype,"added",2);Yt=Va([k("mateu-addon-picker")],Yt);const Bc=e=>{const t=e.metadata;return o`
        <mateu-addon-picker
                .totalLabel="${t.totalLabel}"
                .currency="${t.currency}"
                .actionId="${t.actionId}"
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-addon-picker>
    `};var Vc=Object.defineProperty,Hc=Object.getOwnPropertyDescriptor,vi=(e,t,a,s)=>{for(var i=s>1?void 0:s?Hc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Vc(t,a,i),i};let ma=class extends S{constructor(){super(...arguments),this.lines=[]}computedTotal(){return this.total!=null?this.total:this.lines.filter(e=>!e.included).reduce((e,t)=>e+(t.amount??0),0)}render(){return o`
            ${this.lines.map(e=>o`
                <div class="row">
                    <span class="dot"></span>
                    <span class="concept">${e.concept}</span>
                    ${e.included?o`<span class="included-label">${e.includedLabel||"Included"}</span>`:o`<span class="amount ${(e.amount??0)<0?"negative":""}">${qi(e.amount??0,this.currency)}</span>`}
                </div>
            `)}
            <div class="total-row">
                <span class="total-label">${this.totalLabel||"Total"}</span>
                <span class="total">${qi(this.computedTotal(),this.currency)}</span>
            </div>
        `}};ma.styles=C`
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
    `;vi([p()],ma.prototype,"currency",2);vi([p()],ma.prototype,"totalLabel",2);vi([p({type:Array})],ma.prototype,"lines",2);vi([p({type:Number})],ma.prototype,"total",2);ma=vi([k("mateu-ledger")],ma);const Wc=e=>{const t=e.metadata;return o`
        <mateu-ledger
                .currency="${t.currency}"
                .totalLabel="${t.totalLabel}"
                .lines="${t.lines??[]}"
                .total="${t.total}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-ledger>
    `};var Gc=Object.defineProperty,Kc=Object.getOwnPropertyDescriptor,zt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Kc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Gc(t,a,i),i};let et=class extends S{constructor(){super(...arguments),this.methods=[]}willUpdate(e){e.has("selected")&&(this.selectedId=this.selected)}confirm(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_method:this.selectedId}},bubbles:!0,composed:!0}))}pick(e){this.selectedId=e,this.methodActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.methodActionId,parameters:{_method:e}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};et.styles=C`
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
    `;zt([p()],et.prototype,"actionId",2);zt([p()],et.prototype,"methodActionId",2);zt([p({type:Array})],et.prototype,"methods",2);zt([p()],et.prototype,"selected",2);zt([p()],et.prototype,"contextLabel",2);zt([p()],et.prototype,"contextValue",2);zt([p()],et.prototype,"confirmLabel",2);zt([$()],et.prototype,"selectedId",2);et=zt([k("mateu-payment-picker")],et);const Yc=e=>{const t=e.metadata;return o`
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
    `};var Jc=Object.defineProperty,Xc=Object.getOwnPropertyDescriptor,to=(e,t,a,s)=>{for(var i=s>1?void 0:s?Xc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Jc(t,a,i),i};let Bi=class extends S{constructor(){super(...arguments),this.items=[]}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};Bi.styles=C`
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
    `;to([p({type:Array})],Bi.prototype,"items",2);Bi=to([k("mateu-process-monitor")],Bi);const Qc=e=>{const t=e.metadata;return o`
        <mateu-process-monitor
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-process-monitor>
    `},Zc=(e,t)=>{let a=e.style;return e.id&&(a&&!a.endsWith(";")&&(a+=";"),a==null&&(a=""),t[e.id+".hidden"]==!0&&(a+="display: none;")),a},eu=(e,t)=>{let a={...e.metadata};if(e.id&&a){if(a.type==v.Button){const s=a;t[e.id+".disabled"]==!0&&(s.disabled=!0)}if(a.type==v.FormField){const s=a;t[e.id+".disabled"]==!0&&(s.disabled=!0)}}return a},j=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),tu={[v.Bpmn]:({component:e})=>Ml(e),[v.Workflow]:({component:e})=>Ul(e),[v.WorkflowElk]:({component:e})=>Bl(e),[v.FormEditor]:({component:e})=>Vl(e),[v.Page]:j(Is),[v.Div]:j(Dl),[v.Directory]:({component:e,baseUrl:t,state:a,data:s})=>Ll(e),[v.FormLayout]:j(un),[v.HorizontalLayout]:j(mn),[v.VerticalLayout]:j(vn),[v.SplitLayout]:j(fn),[v.MasterDetailLayout]:j(bn),[v.TabLayout]:j(gn),[v.AccordionLayout]:j(yn),[v.BoardLayout]:j(Sn),[v.BoardLayoutRow]:j(In),[v.BoardLayoutItem]:j(_n),[v.Scroller]:j(wn),[v.FullWidth]:j(kn),[v.Container]:j(Cn),[v.Form]:({container:e,component:t,baseUrl:a,state:s,data:i,appState:r,appData:n})=>{const d=t.metadata;return o`<mateu-form
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
            slot="${t.slot??l}"
            >
                ${t.children?.map(c=>w(e,c,a,s,i,r,n))}
            ${d?.buttons?.map(c=>o`
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
                        slot="${t.slot??l}"
            >
             ${t.children?.map(d=>w(e,d,a,s,i,r,n))}
            </mateu-table>`,[v.Crud]:j(_s),[v.App]:({container:e,component:t,baseUrl:a,state:s,data:i,appState:r,appData:n})=>o`
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
             ${t.children?.map(d=>w(e,d,a,s,i,r,n))}
         </mateu-app>`,[v.Element]:({container:e,component:t})=>cl(e,t.metadata,t),[v.FormField]:({container:e,component:t,baseUrl:a,state:s,data:i,appState:r,appData:n,labelAlreadyRendered:d})=>{const c=t.metadata;return o`
    <mateu-field
                   id="${t.id}"
                   .component="${t}"
            .field="${t.metadata}"
                   .state="${s}"
                   .data="${i}"
                   .appState="${r}"
                   .appdata="${n}"
                   style="${t.style}" class="${t.cssClasses}"
                   slot="${t.slot??l}"
                   data-colspan="${c.colspan}"
                   colspan="${(c.colspan??1)>1?c.colspan:l}"
                   .labelAlreadyRendered="${d}"
            >
                    ${t.children?.map(u=>w(e,u,a,s,i,r,n,d))}
                </mateu-field>
        `},[v.Text]:({component:e,state:t,data:a,appState:s,appData:i})=>ul(e,t,a,s,i),[v.Avatar]:({component:e,state:t,data:a})=>Tn(e,t,a),[v.Chat]:({component:e,state:t,data:a})=>ql(e),[v.AvatarGroup]:({component:e})=>Pn(e),[v.Badge]:({component:e,state:t,data:a})=>pl(e,t,a),[v.Breadcrumbs]:({component:e})=>Al(e),[v.Anchor]:({component:e})=>ml(e),[v.Button]:({component:e,state:t,data:a})=>gl(e,t,a),[v.Card]:j($l),[v.Chart]:({component:e})=>yl(e),[v.Icon]:({component:e})=>xl(e),[v.ConfirmDialog]:j(wl),[v.ContextMenu]:j(il),[v.CookieConsent]:({component:e})=>kl(e),[v.Details]:j(Cl),[v.Dialog]:({component:e,baseUrl:t,state:a,data:s,appState:i,appData:r})=>Sl(e,t,a,s,i,r),[v.Drawer]:({component:e,baseUrl:t,state:a,data:s,appState:i,appData:r})=>Il(e,t,a,s,i,r),[v.Image]:({component:e})=>zl(e),[v.Map]:({component:e})=>Rl(e),[v.Markdown]:({component:e})=>El(e),[v.MicroFrontend]:({component:e})=>_l(e),[v.Notification]:({component:e})=>Tl(e),[v.ProgressBar]:({component:e,state:t})=>Pl(e,t),[v.Popover]:j(Ol),[v.CarouselLayout]:j(jl),[v.Tooltip]:j(nl),[v.MessageInput]:({component:e})=>ol(e),[v.MessageList]:({component:e})=>al(e),[v.CustomField]:j(rl),[v.MenuBar]:({container:e,component:t,baseUrl:a,state:s,data:i})=>sl(e,t,a,s,i),[v.Grid]:j(tl),[v.VirtualList]:j(On),[v.FormSection]:j(Nl),[v.FormSubSection]:j(Fl),[v.MetricCard]:({component:e})=>Kl(e),[v.Scoreboard]:j(Yl),[v.DashboardPanel]:j(Jl),[v.DashboardLayout]:j(Xl),[v.FoldoutLayout]:j(ed),[v.HeroSection]:j(td),[v.EmptyState]:({component:e})=>jn(e),[v.Skeleton]:({component:e})=>Ln(e),[v.Gantt]:({component:e})=>sd(e),[v.PlanningBoard]:({component:e})=>nd(e),[v.Kanban]:({component:e})=>cd(e),[v.Timeline]:({component:e})=>hd(e),[v.ProgressSteps]:({component:e})=>fd(e),[v.Stat]:({component:e})=>$d(e),[v.Calendar]:({component:e})=>wd(e),[v.PricingTable]:({component:e})=>Sd(e),[v.OrgChart]:({component:e})=>Ed(e),[v.Heatmap]:({component:e})=>Rd(e),[v.Funnel]:({component:e})=>jd(e),[v.TrendChart]:({component:e})=>Nd(e),[v.FeatureGrid]:({component:e})=>qd(e),[v.Testimonials]:({component:e})=>Vd(e),[v.Faq]:({component:e})=>Gd(e),[v.CalloutCard]:({component:e})=>Jd(e),[v.CommentThread]:({component:e})=>Zd(e),[v.FileList]:({component:e})=>ic(e),[v.Checklist]:({component:e})=>oc(e),[v.ComparisonCard]:({component:e})=>dc(e),[v.EntityHeader]:({component:e})=>mc(e),[v.Meter]:({component:e})=>bc(e),[v.TaskProgress]:({component:e})=>yc(e),[v.StatusList]:({component:e})=>kc(e),[v.BulletedList]:({component:e})=>Ic(e),[v.Separator]:({component:e})=>_c(e),[v.Notice]:j(Oc),[v.TaskQueue]:({component:e})=>Ac(e),[v.ResourceGrid]:({component:e})=>Dc(e),[v.OfferCard]:({component:e})=>Mc(e),[v.AddOnPicker]:({component:e})=>Bc(e),[v.Ledger]:({component:e})=>Wc(e),[v.PaymentPicker]:({component:e})=>Yc(e),[v.ProcessMonitor]:({component:e})=>Qc(e)},Us=(e,t,a,s,i,r,n,d)=>{if(!t?.metadata)return t==null?(console.warn("No metadata for component",t),o`<p>No metadata for component</p>`):Us(e,{id:ke(),metadata:t,type:oe.ClientSide},a,s,i,r,n,d);const c=t.metadata.type,u={...t,style:Zc(t,i),metadata:eu(t,i)},m=tu[c];return m?m({container:e,component:u,baseUrl:a,state:s,data:i,appState:r,appData:n,labelAlreadyRendered:d}):o`<p ${u?.slot??l}>Unknown metadata type ${c} for component ${u?.id}</p>`};var we=(e=>(e.HAMBURGUER_MENU="HAMBURGUER_MENU",e.MENU_ON_LEFT="MENU_ON_LEFT",e.MENU_ON_TOP="MENU_ON_TOP",e.TABS="TABS",e.TILES="TILES",e.RAIL="RAIL",e.AUTO="AUTO",e.MEDIATOR="MEDIATOR",e))(we||{});const Bs="mateu-app-context",ao="mateu-app-context-labels",io=e=>{try{return JSON.parse(localStorage.getItem(e)??"{}")}catch{return{}}},lr=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},as=()=>io(Bs),Vs=()=>io(ao),so=(e,t,a)=>{const s=as(),i=Vs();t==null||t===""?(delete s[e],delete i[e]):(s[e]=t,a!==void 0&&(i[e]=a)),lr(Bs,s),lr(ao,i)};let dr=!1;const ro=()=>{dr||(dr=!0,window.addEventListener("storage",e=>{e.key===Bs&&e.newValue!==e.oldValue&&window.location.reload()}))},au=(e,t)=>new Promise((a,s)=>{let i=!1;const r={retry:()=>{i||(i=!0,t().then(a,s))},giveUp:()=>{i||(i=!0,s(e))}},n=new CustomEvent("mateu-session-expired",{detail:r,cancelable:!0,bubbles:!1});typeof document<"u"&&!document.dispatchEvent(n)||r.giveUp()}),iu=(e,t)=>e.includes("json")?!0:t!==null&&typeof t=="object",su=(e,t)=>{const a=e.finalUrl;if(!a)return;const s=typeof window<"u"?window.location.href:void 0;let i;try{i=new URL(e.requestedUrl,s).href}catch{return}if(i!==a&&!iu(e.contentType??"",e.data))return a};class ru{constructor(){this.windowMs=4e3,this.threshold=12,this.events=[],this.reported=new Set}check(t,a=Date.now()){this.events.push({sig:t,t:a});const s=a-this.windowMs;this.events=this.events.filter(r=>r.t>=s);let i=0;for(const r of this.events)r.sig===t&&i++;if(i>=this.threshold){const r=!this.reported.has(t);return this.reported.add(t),{blocked:!0,firstTrip:r}}return this.reported.delete(t),{blocked:!1,firstTrip:!1}}reset(){this.events=[],this.reported.clear()}configure(t){t.windowMs!==void 0&&(this.windowMs=t.windowMs),t.threshold!==void 0&&(this.threshold=t.threshold)}}const ou=new ru;let Pa=[];class nu{constructor(){this.axiosInstance=sn.create({timeout:6e4}),this.axiosInstance.interceptors.request.use(t=>(this.addAuthToken(t),this.addSessionId(t),t)),this.axiosInstance.interceptors.response.use(t=>{const a=su({requestedUrl:this.axiosInstance.getUri(t.config),finalUrl:t.request?.responseURL,contentType:String(t.headers?.["content-type"]??""),data:t.data});if(a)throw window.location.assign(a),Object.assign(new Error("session lost — redirecting to "+a),{code:"ERR_CANCELED"});return t},t=>{const a=t;if(a?.response?.status===401&&a.config&&!a.config.__mateuRetried){const s=a.config;return s.__mateuRetried=!0,au(t,()=>this.axiosInstance.request(s))}throw t})}addSessionId(t){let a=sessionStorage.getItem("__mateu_sesion_id");a||(a=ke(),sessionStorage.setItem("__mateu_sesion_id",a)),t.headers["X-Session-Id"]=a}addAuthToken(t){const a=localStorage.getItem("__mateu_auth_token");a&&(t.headers.Authorization="Bearer "+a)}async wrap(t,a,s,i){return s||a.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),t.then(r=>(a.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:i}})),r)).catch(r=>{throw r?.code=="ERR_CANCELED"?a.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{}})):a.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:i,reason:this.serialize(r)}})),r})}serialize(t){return t?.message?t:JSON.stringify(t)}async get(t){const a=new AbortController;return Pa=[...Pa,a],this.axiosInstance.get(t,{signal:a.signal})}async post(t,a){const s=new AbortController;return Pa=[...Pa,s],this.axiosInstance.post(t,a,{signal:s.signal})}async abortAll(){Pa.forEach(t=>t.abort()),Pa=[]}async runAction(t,a,s,i,r,n,d,c,u,m,h){a&&a.startsWith("/")&&(a=a.substring(1));const f=[t,a,s,d??"",i,r].join(""),g=ou.check(f);return g.blocked?(await this.abortAll(),g.firstTrip&&console.error("[mateu] request loop detected — aborting repeated request",f),{messages:g.firstTrip?[{title:"",text:"A repeating request was detected and stopped to protect the server. Reload the page or navigate elsewhere.",position:"bottom-end",variant:"error",duration:6e3}]:[],commands:[],fragments:[],banners:[],appendBanners:!1,appData:void 0,appState:void 0}):(n={...as(),...n},await this.wrap(this.post(t+"/mateu/v3/sync/"+(a&&a!=""?a:"_no_route"),{serverSideType:d,appState:n,componentState:c,parameters:u,initiatorComponentId:r,consumedRoute:s,route:a&&a!=""?"/"+a:"",actionId:i}).then(y=>y.data),m,h,i))}}const oa=new nu;var lu=Object.defineProperty,du=Object.getOwnPropertyDescriptor,is=(e,t,a,s)=>{for(var i=s>1?void 0:s?du(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&lu(t,a,i),i};let Jt=class extends S{constructor(){super(...arguments),this.baseUrl="",this.dataProvider=async(e,t)=>{const a=e.filter??"",i=await this.remoteSearch(a)??(this.selector.options??[]).filter(r=>r.label.toLowerCase().includes(a.toLowerCase()));t(i,i.length)}}connectedCallback(){super.connectedCallback(),ro()}currentValue(){return String(as()[this.selector.fieldName]??"")}currentLabel(){const e=this.currentValue();if(!e)return"";const t=(this.selector.options??[]).find(s=>String(s.value)===e);if(t)return t.label;const a=Vs()[this.selector.fieldName];return a!==void 0?String(a):e}pick(e,t){String(e??"")!==this.currentValue()&&(so(this.selector.fieldName,e,t),window.location.reload())}async remoteSearch(e){const t=this.app;if(t?.serverSideType)try{const a=await oa.runAction(this.baseUrl??"",t.rootRoute??t.initialRoute??"","",`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,t.serverSideType,{},{searchText:e},this,!0);for(const s of a?.fragments??[]){const n=s.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(n))return n.map(d=>({value:d.value,label:d.label??String(d.value)}))}}catch{}}renderSelect(){const e=[{label:"—",value:""},...(this.selector.options??[]).map(t=>({label:t.label,value:String(t.value)}))];return o`
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
                              @selected-item-changed="${a=>{const s=a.detail.value;this.pick(s?.value??"",s?.label)}}"></vaadin-combo-box>`}render(){if(!this.selector)return o``;const e=(this.selector.options?.length??0)>Jt.SEARCHABLE_THRESHOLD;return o`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                ${e?this.renderComboBox():this.renderSelect()}
            </label>`}};Jt.SEARCHABLE_THRESHOLD=7;Jt.styles=C`
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
    `;is([p()],Jt.prototype,"selector",2);is([p()],Jt.prototype,"app",2);is([p()],Jt.prototype,"baseUrl",2);Jt=is([k("mateu-vaadin-app-context-picker")],Jt);class cu{constructor(){this._dirty=!1,this._installed=!1,this.message="You have unsaved changes. Are you sure you want to leave this page?",this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=t=>{this._dirty&&(t.preventDefault(),t.returnValue="")}}install(){this._installed||(this._installed=!0,document.addEventListener("dirty",this._onDirty),document.addEventListener("clean",this._onClean),window.addEventListener("beforeunload",this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;const t=window.confirm(this.message);return t&&(this._dirty=!1),t}}const Ht=new cu;var uu=Object.defineProperty,pu=Object.getOwnPropertyDescriptor,fi=(e,t,a,s)=>{for(var i=s>1?void 0:s?pu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&uu(t,a,i),i};let va=class extends S{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.notifications=[],this.fetched=!1}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}updated(){!this.fetched&&this.app?.serverSideType&&(this.fetched=!0,this.refresh())}unreadCount(){return this.notifications.filter(e=>e.unread).length}async runNotificationsAction(e,t){const a=this.app;if(a?.serverSideType)try{const s=await oa.runAction(this.baseUrl??"",a.rootRoute??a.initialRoute??"","",e,"notification-bell",void 0,a.serverSideType,{},t,this,!0);for(const i of s?.fragments??[]){const n=i.data?._notifications;if(Array.isArray(n)){this.notifications=n;return}}}catch{}}refresh(){return this.runNotificationsAction("_notifications-list",{})}markRead(e){return this.runNotificationsAction("_notifications-read",{ids:e})}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.refresh(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))}closePanel(){this.detachOutsideClick(),this.opened=!1}async entryClicked(e){e.unread&&await this.markRead([e.id]);const t=e.route;if(t){if(!Ht.confirmLeave())return;this.closePanel(),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:t},bubbles:!0,composed:!0}))}}renderEntry(e){return o`
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
            </div>`}};va.styles=C`
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
    `;fi([p()],va.prototype,"app",2);fi([p()],va.prototype,"baseUrl",2);fi([$()],va.prototype,"opened",2);fi([$()],va.prototype,"notifications",2);va=fi([k("mateu-notification-bell")],va);class hu{async handle(t,a){return await t.runAction(a.baseUrl,a.route,a.consumedRoute,a.actionId,a.initiatorComponentId,a.appState,a.serverSideType,a.componentState,a.parameters,a.initiator,a.background)}}const mu=new hu;class vu{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,a,s)=>{if(t?.fragments?.forEach(i=>{Vt.next({command:void 0,fragment:i,ui:void 0,error:void 0,callbackToken:s})}),t?.appState&&(le.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const i=t?.appData;ri.value={...t.appData,...i},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}t?.messages?.forEach(i=>{pa.show(i.text,{position:i.position?this.mapPosition(i.position):void 0,theme:i.variant,duration:i.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(i=>{Vt.next({command:i,fragment:void 0,ui:void 0,error:void 0,callbackToken:s})})}}async runAction(t,a,s,i,r,n,d,c,u,m,h,f,g,y,x){try{const T=await mu.handle(t,{baseUrl:a,route:s,consumedRoute:i,actionId:r,appState:le.value,initiatorComponentId:n,componentState:u,parameters:m,serverSideType:c,initiator:h,background:f});g&&g(T),y||this.handleUIIncrement(T,h,x),T.messages&&T.messages.length==1&&T.messages[0].variant=="error"&&h.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0})),h.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r,evevntId:ke()},bubbles:!0,composed:!0}))}catch(T){console.warn("Action request failed",T),h.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(T)}})),h.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}}serialize(t){return t?.message?t:JSON.stringify(t)}}const fu=new vu;class bu{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,a,s)=>{if(t?.messages?.forEach(i=>{if(i.undoActionId){this.showUndoableMessage(i,a);return}pa.show(i.text,{position:i.position?this.mapPosition(i.position):"bottom-end",theme:i.variant,duration:i.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(i=>{Vt.next({command:i,fragment:void 0,ui:void 0,error:void 0,callbackToken:s})}),t?.fragments?.forEach(i=>{Vt.next({command:void 0,fragment:i,ui:void 0,error:void 0,callbackToken:s})}),t?.appState&&(le.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const i=t?.appData;ri.value={...t.appData,...i},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}}}async runAction(t,a,s,i,r,n,d,c,u,m,h,f,g,y,x){if(s){s=s||"_no_route",s&&s.startsWith("/")&&(s=s.substring(1));const T={serverSideType:c,appState:le.value,componentState:u,parameters:m,initiatorComponentId:n,consumedRoute:i,route:"/"+s,actionId:r};f||h.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),fetch(a+"/mateu/v3/sse/"+s,{method:"POST",headers:{Accept:"text/event-stream","Content-Type":"application/json"},body:JSON.stringify(T)}).then(async U=>{const ae=U.body?.pipeThrough(new TextDecoderStream).getReader();if(ae){let F="";for(;;){const{value:ne,done:ue}=await ae.read();if(ue)break;F+=ne;const se=F.split(`

`);F=se.pop()??"";for(const Y of se){const te=Y.trim();if(te)if(te.startsWith("data:")){const be=JSON.parse(te.substring(5).trim());g&&g(be),y||this.handleUIIncrement(be,h,x),be.messages&&be.messages.length==1&&be.messages[0].variant=="error"&&h.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}else{let be=te;try{const I=JSON.parse(te);be=I.message,I._embedded?.errors?.length>0&&I._embedded.errors[0].message&&(be=I._embedded.errors[0].message)}catch{}throw new Error(be)}}}}f||h.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:r}})),h.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r},bubbles:!0,composed:!0}))}).catch(U=>{h.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(U)}})),h.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))})}}serialize(t){return t?.message?t:JSON.stringify(t)}showUndoableMessage(t,a){const s=new pa;s.position=t.position?this.mapPosition(t.position):"bottom-end",s.duration=t.duration??1e4,t.variant&&s.setAttribute("theme",t.variant),s.renderer=i=>{if(i.firstElementChild)return;const r=document.createElement("span");r.textContent=t.text;const n=document.createElement("button");n.textContent=t.undoLabel??"Undo",n.style.cssText="margin-left: 0.75rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;",n.addEventListener("click",()=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.undoActionId,parameters:t.undoParameters??{}},bubbles:!0,composed:!0})),s.opened=!1}),i.append(r,n)},document.body.appendChild(s),s.opened=!0,s.addEventListener("opened-changed",i=>{i.detail.value||s.remove()})}}const oo=new bu,no=e=>{if(!e||!("querySelectorAll"in e))return null;for(const t of e.querySelectorAll("*")){if(t.tagName?.toLowerCase()==="mateu-component")return t;const a=no(t.shadowRoot);if(a)return a}return null},lo=async(e,t,a)=>{const s=t.renderRoot??t,i=no(s);await oo.runAction(oa,t.baseUrl??"",e.rootRoute||"_no_route","",a,i?.id??"app-header-action",{},e.serverSideType??"",{},{},i??t,!0,void 0,!1,"")},cr=async(e,t,a)=>{try{await lo(e,t,a)}catch(s){pa.show("La acción falló: "+s,{position:"bottom-start",duration:6e3,theme:"error"})}},Xa=(e,t)=>{const a=e.contextSelectors??[],s=e.contextActions??[];return a.length===0&&s.length===0&&!e.notificationsEnabled?l:o`${e.notificationsEnabled?o`
        <mateu-notification-bell .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-notification-bell>`:l}${a.map(i=>o`
        <mateu-vaadin-app-context-picker .selector="${i}" .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-vaadin-app-context-picker>`)}${s.map(i=>(i.children?.length??0)>0?o`
        <vaadin-menu-bar theme="primary small" style="margin-left: 0.5rem; flex-shrink: 0;"
            .items="${[{text:i.label,children:i.children.map(r=>({text:r.label,actionId:r.actionId}))}]}"
            @item-selected="${r=>{const n=r.detail?.value?.actionId;n&&cr(e,t,n)}}"></vaadin-menu-bar>`:o`
        <vaadin-button theme="primary small" style="margin-left: 0.5rem; flex-shrink: 0;"
            @click="${()=>i.actionId&&cr(e,t,i.actionId)}" title="${i.label}">
            ${i.icon?o`<vaadin-icon icon="${i.icon}" slot="prefix"></vaadin-icon>`:l}${i.label}
        </vaadin-button>`)}`},Ti=(e,t)=>e.themeToggle?o`
        <vaadin-button theme="tertiary icon" @click="${t.toggleTheme}"
            title="${t.isDark?"Switch to light mode":"Switch to dark mode"}"
            style="margin-left: 0.5rem; margin-right: 0.5rem; flex-shrink: 0;">
            <vaadin-icon icon="${t.isDark?"vaadin:sun-o":"vaadin:moon"}" style="color: var(--lumo-body-text-color);"></vaadin-icon>
        </vaadin-button>
    `:l,gu=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},ur=(e,t,a)=>{const s=Pe(e,t,a),i=ie(t,a);return s=="list"||s==i?"new":s},Pe=(e,t,a)=>{const s=e?._route;if(s!=null&&(s===""||s.startsWith("/"))){const i=a.homeRoute??"",r=i.indexOf("?"),n=r>=0?i.substring(r+1):"",d=ie(t,a)+s;if(!n)return d;const c=d.indexOf("?")>=0?"&":"?";return d+c+n}return t.selectedRoute?t.selectedRoute:a.homeRoute},ie=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,$e=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:t.homeBaseUrl,ye=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,xe=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,$u=(e,t,a,s,i,r,n)=>{if(t.chromeless)return o`
            <div class="app chromeless">
                <div class="${"app-content"+(e.pageCompact?" no-padding":"")}" style="height: 100%;">
                    <vaadin-master-detail-layout>
                        <vaadin-scroller style="height: 100%;">
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${Pe(s,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${$e(e,t)}"
                                        consumedRoute="${ie(e,t)}"
                                        serverSideType="${ye(e,t)}"
                                        uriPrefix="${xe(e,t)}"
                                        style="width: 100%;"
                                        .appState="${r}"
                                        .appData="${n}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        </vaadin-scroller>
                        ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                    </vaadin-master-detail-layout>
                </div>
                <slot></slot>
            </div>
        `;const d=e.mapItems(t.menu,e.filter?.toLowerCase()??""),c=ie(e,t),u=ur(s,e,t),m=u&&u!=="new"&&u.startsWith(c+"/")?u.substring(c.length+1).split("/")[0]:void 0;return o`
                    ${t.variant==we.MEDIATOR?o`

                        ${t.layout=="SPLIT"?o`
                            <vaadin-master-detail-layout>
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${ie(e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${$e(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${ye(e,t)}"
                                            uriPrefix="${xe(e,t)}"
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
                                            route="${ur(s,e,t)}"
                                            id="ux_${e.id}_detail"
                                            baseUrl="${$e(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${ye(e,t)}"
                                            uriPrefix="${xe(e,t)}"
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
                                        route="${Pe(s,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${$e(e,t)}"
                                        consumedRoute="${ie(e,t)}"
                                        serverSideType="${ye(e,t)}"
                                        uriPrefix="${xe(e,t)}"
                                        style="width: 100%;"
                                        .appState="${r}"
                                        .appData="${n}"
                                        .initialState="${s}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `}
                        
`:l}
            ${t.variant==we.HAMBURGUER_MENU?o`
                <vaadin-app-layout style="${t?.style}" class="${t?.cssClasses}" .drawerOpened=${!t.drawerClosed}>
                    <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                    <h2 slot="navbar" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2><p slot="navbar">${t.subtitle}</p>
                    <vaadin-horizontal-layout slot="navbar" style="margin-left: auto; align-items: center;">
                        <slot name="widgets"></slot>
                        ${Xa(t,e)}${Ti(t,e)}
                    </vaadin-horizontal-layout>
                    <vaadin-scroller slot="drawer" class="p-s"
                                     @navigation-requested="${e.updateRoute}">
                        ${t.menu&&t.totalMenuOptions>10?o`
                            <vaadin-text-field style="width: calc(100% - 20px); padding-left: 10px; padding-right: 10px;" @value-changed="${h=>gu(h,e)}">
                                <vaadin-icon slot="suffix" icon="vaadin:search"></vaadin-icon>
                            </vaadin-text-field>
                            `:l}

                        <vaadin-side-nav .onNavigate="${e.navItemSelected}">
                            ${e.renderSideNav(d,void 0)}
                        </vaadin-side-nav>
                    </vaadin-scroller>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Pe(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${$e(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${ye(e,t)}"
                                            uriPrefix="${xe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-app-layout>

            `:l}
            
            ${t.variant==we.MENU_ON_TOP?o`
                <vaadin-vertical-layout style="width: 100%; height: 100vh; overflow: hidden;">
                    <vaadin-horizontal-layout
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>e.goHome()}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <vaadin-horizontal-layout style="align-items: center;">
                            ${t.logo?o`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:l}
                            ${t.title?o`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:l}
                        </vaadin-horizontal-layout>
                        </a>
                        <vaadin-menu-bar
                                .items="${d}"
                                @item-selected="${e.itemSelected}"
                                theme="dropdown-indicators"
                                style="flex-grow: 1; min-width: 0; margin-left: 4rem; margin-top: 1.3rem;"
                                class="menu"
                        >
                        </vaadin-menu-bar>
                        <vaadin-horizontal-layout style="flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${Xa(t,e)}${Ti(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Pe(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${$e(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${ye(e,t)}"
                                            uriPrefix="${xe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-vertical-layout>

            `:l}

            ${t.variant==we.TILES?o`
                <vaadin-vertical-layout style="width: 100%; height: 100vh; overflow: hidden;">
                    <vaadin-horizontal-layout
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>{e.goHome(),e.tilesMenuOption=null}}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <vaadin-horizontal-layout style="align-items: center;">
                            ${t.logo?o`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:l}
                            ${t.title?o`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:l}
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
                            ${Xa(t,e)}${Ti(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):o`
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Pe(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${$e(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${ye(e,t)}"
                                            uriPrefix="${xe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </vaadin-master-detail-layout>
                        `}
                    </div>
                </vaadin-vertical-layout>
            `:l}

            ${t.variant==we.RAIL?o`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):l}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Pe(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${$e(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${ye(e,t)}"
                                            uriPrefix="${xe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </vaadin-master-detail-layout>
                    </div>
                </div>
            `:l}

            ${t.variant==we.MENU_ON_LEFT?o`

                <vaadin-horizontal-layout>
                    <vaadin-scroller style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <vaadin-vertical-layout
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(h=>e.renderOptionOnLeftMenu(h))}
                            ${Xa(t,e)}${Ti(t,e)}
                        </vaadin-vertical-layout>
                    </vaadin-scroller>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Pe(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${$e(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${ye(e,t)}"
                                            uriPrefix="${xe(e,t)}"
                                            style="width: 100%; padding: 1em;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-horizontal-layout>


            `:l}

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
                                ${t.logo?o`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:l}
                                ${t.title?o`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:l}
                            </vaadin-horizontal-layout>
                            </a>
                            <vaadin-tabs selected="${e.getSelectedIndex(t.menu)}"
                                         style="box-shadow: unset; flex-grow: 1; min-width: 0;"
                                         class="${e.component?.cssClasses}">
                                ${t.menu.map(h=>o`
                                <vaadin-tab 
                                        @click="${()=>e.selectRoute(h.consumedRoute,h.route,h.actionId,h.baseUrl,h.serverSideType,h.uriPrefix)}"
                                >${h.label}</vaadin-tab>
                            `)}
                            </vaadin-tabs>
                            <vaadin-horizontal-layout style="flex-shrink: 0; align-items: center;">
                                <slot name="widgets"></slot>
                                ${Xa(t,e)}
                            </vaadin-horizontal-layout>
                        </vaadin-horizontal-layout>
                    </div>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Pe(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${$e(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${ye(e,t)}"
                                            uriPrefix="${xe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </vaadin-master-detail-layout>
                    </div>
                </div>
            
            `:l}

            ${t.fabs?.map((h,f)=>o`
                <button class="app-fab" style="bottom: ${(t.sseUrl?5.5:1.5)+f*4}rem; right: 1.5rem;"
                    @click="${()=>e.runAction(h.actionId)}"
                    title="${h.label}">
                    <vaadin-icon icon="${h.icon}"></vaadin-icon>
                </button>
            `)}
            ${t.sseUrl&&!e.chatOpen?o`
                <button class="ai-fab" @click="${e.showHideIa}" title="Asistente IA">
                    <vaadin-icon icon="vaadin:comments-o"></vaadin-icon>
                </button>
            `:l}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},yu=(e,t)=>t!=null&&e!=null&&!e.has(t),xu=typeof HTMLElement<"u"?HTMLElement:class{};class wu extends xu{static get observedAttributes(){return["type","renderer"]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){const t=this.getAttribute("type")??"unknown",a=this.getAttribute("renderer")??"unknown";this.shadowRoot||this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
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
        `}}typeof customElements<"u"&&!customElements.get("mateu-unsupported")&&customElements.define("mateu-unsupported",wu);const pr=new Set,ku=(e,t,a)=>{const s=`${a}/${t}`;return pr.has(s)||(pr.add(s),console.warn(`[mateu] Component type "${t}" is not supported by the "${a}" renderer — rendering <mateu-unsupported> placeholder.`)),o`<mateu-unsupported
            type="${t}"
            renderer="${a}"
            data-component-id="${e?.id??l}"
            slot="${e?.slot??l}"
    ></mateu-unsupported>`};class Cu{renderFilterBar(t,a,s,i,r,n,d,c){const u=a?.metadata,m=f=>{const{fieldId:g,value:y}=f.detail;t.state={...t.state,[g]:y}},h=f=>{const{fieldIds:g}=f.detail,y={};g.forEach(x=>{y[x]=void 0}),y.searchText=void 0,t.state={...t.state,...y}};return o`
            <mateu-filter-bar
                .metadata="${u}"
                @search-requested="${t.search}"
                @value-changed="${m}"
                @filter-reset-requested="${h}"
                .state="${t.state}"
                .data="${r}"
                .appState="${n}"
                .appData="${d}"
                ?searchOnly="${c??!1}"
            >
                ${u?.header?.map(f=>w(t,f,s,i,r,n,d))}
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
        `}renderTableComponent(t,a,s,i,r,n,d){return o`
        <mateu-table id="${t.id}"
                     .metadata="${a?.metadata}"
                     .data="${t.data}"
                     .state="${i}"
                     .appState="${n}"
                     .appData="${d}"
                     .emptyStateMessage="${i[a?.id]?.emptyStateMessage}"
                     @sort-direction-changed="${t.directionChanged}"
                     @fetch-more-elements="${t.fetchMoreElements}"
                     baseUrl="${s}"
        ></mateu-table>
        `}rendererName(){return this.constructor?.name??"unknown"}supportedClientSideTypes(){}renderClientSideComponent(t,a,s,i,r,n,d,c){const u=a?.metadata?.type??a?.type,m=Object.values(v).includes(u)?u:void 0;return yu(this.supportedClientSideTypes(),m)?ku(a,m,this.rendererName()):Us(t,a,s,i,r,n,d,c)}renderAppComponent(t,a,s,i,r,n,d){return $u(t,a?.metadata,s,i,r,n,d)}}const hr="border-left: 1px solid var(--oj-core-text-color-secondary, #888); height: 1.5rem; display: inline-block; align-self: center;",Su=(e,t,a,s)=>{const i=e.metadata,r=e.slot??l;if(i.children&&i.children.length>0){const d=i.children.map(c=>({key:c.actionId,label:c.label,disabled:c.disabled??!1}));return o`
            ${i.separatorBefore?o`<span slot="${r}" style="${hr}"></span>`:l}
            <oj-c-menu-button
                data-oj-binding-provider="preact"
                label="${i.label}"
                .items="${d}"
                slot="${r}"
                @ojMenuAction="${c=>{const u=c.detail.key;c.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:u},bubbles:!0,composed:!0}))}}"
            ></oj-c-menu-button>
        `}const n=i.buttonStyle==="primary"?"callToAction":"solid";return o`
        ${i.separatorBefore?o`<span slot="${r}" style="${hr}"></span>`:l}
        <oj-c-button
            data-oj-binding-provider="preact"
            data-action-id="${i.actionId}"
            label="${i.label}"
            chroming="${n}"
            @ojAction=${nv}
            slot="${r}"
        ></oj-c-button>
    `};var Iu=Object.defineProperty,_u=Object.getOwnPropertyDescriptor,bi=(e,t,a,s)=>{for(var i=s>1?void 0:s?_u(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Iu(t,a,i),i};let fa=class extends S{constructor(){super(...arguments),this.fieldId="",this.signing=!1,this.hasStrokes=!1,this.drawing=!1,this.startStroke=e=>{const t=e.target;this.ensureCanvasSize(t),t.setPointerCapture(e.pointerId),this.drawing=!0;const a=t.getContext("2d");a.lineWidth=2,a.lineCap="round",a.lineJoin="round",a.strokeStyle=getComputedStyle(this).getPropertyValue("--lumo-body-text-color")||"#1a1a1a";const[s,i]=this.pointerPosition(e);a.beginPath(),a.moveTo(s,i),e.preventDefault()},this.stroke=e=>{if(!this.drawing)return;const a=e.target.getContext("2d"),[s,i]=this.pointerPosition(e);a.lineTo(s,i),a.stroke(),this.hasStrokes=!0,e.preventDefault()},this.endStroke=e=>{this.drawing=!1,e.target.releasePointerCapture(e.pointerId)}}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}canvas(){return this.renderRoot.querySelector("canvas")}pointerPosition(e){const a=e.target.getBoundingClientRect();return[e.clientX-a.left,e.clientY-a.top]}ensureCanvasSize(e){const t=e.getBoundingClientRect();(e.width!==Math.round(t.width)||e.height!==Math.round(t.height))&&(e.width=Math.round(t.width),e.height=Math.round(t.height))}clear(){const e=this.canvas();e&&e.getContext("2d").clearRect(0,0,e.width,e.height),this.hasStrokes=!1}accept(){const e=this.canvas();!e||!this.hasStrokes||(this.signing=!1,this.emit(e.toDataURL("image/png")))}renderPad(){return o`
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
            </div>`}};fa.styles=C`
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
    `;bi([p()],fa.prototype,"fieldId",2);bi([p()],fa.prototype,"value",2);bi([$()],fa.prototype,"signing",2);bi([$()],fa.prototype,"hasStrokes",2);fa=bi([k("mateu-signature-pad")],fa);var Eu=Object.defineProperty,Tu=Object.getOwnPropertyDescriptor,Ia=(e,t,a,s)=>{for(var i=s>1?void 0:s?Tu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Eu(t,a,i),i};let Pt=class extends S{constructor(){super(...arguments),this.fieldId="",this.options=[],this.leavesOnly=!1,this.opened=!1,this.expanded=new Set}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}open(){this.opened||(this.opened=!0,this.expanded=new Set(this.pathTo(this.value??"",this.options)??[]),this.outsideClick=e=>{e.composedPath().includes(this)||this.close()},document.addEventListener("mousedown",this.outsideClick))}close(){this.detachOutsideClick(),this.opened=!1}pick(e){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e.value,fieldId:this.fieldId},bubbles:!0,composed:!0}))}clear(){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:this.fieldId},bubbles:!0,composed:!0}))}pathTo(e,t){for(const a of t){if(String(a.value)===e)return[];const s=this.pathTo(e,a.children??[]);if(s!=null)return[String(a.value),...s]}return null}labelOf(e,t){for(const a of t){if(String(a.value)===e)return a.label;const s=this.labelOf(e,a.children??[]);if(s!=null)return s}return null}toggle(e){const t=String(e.value),a=new Set(this.expanded);a.has(t)?a.delete(t):a.add(t),this.expanded=a}renderNode(e,t){const a=(e.children?.length??0)>0,s=this.expanded.has(String(e.value)),i=!this.leavesOnly||!a,r=String(e.value)===String(this.value??"");return o`
            <div class="node ${r?"node--selected":""} ${i?"":"node--group"}"
                 style="padding-left: ${.5+t*1.1}rem;"
                 @mousedown="${n=>n.preventDefault()}"
                 @click="${()=>i?this.pick(e):this.toggle(e)}">
                ${a?o`
                    <span class="caret" @click="${n=>{n.stopPropagation(),this.toggle(e)}}"
                    >${s?"▾":"▸"}</span>`:o`<span class="caret caret--empty"></span>`}
                ${e.label}
            </div>
            ${a&&s?e.children.map(n=>this.renderNode(n,t+1)):l}`}render(){const e=this.value?this.labelOf(String(this.value),this.options)??String(this.value):"";return o`
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
                                 @click="${this.clear}">— (clear)</div>`:l}
                        ${this.options.map(t=>this.renderNode(t,0))}
                    </div>`:l}
            </div>`}};Pt.styles=C`
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
    `;Ia([p()],Pt.prototype,"fieldId",2);Ia([p()],Pt.prototype,"value",2);Ia([p()],Pt.prototype,"options",2);Ia([p({type:Boolean})],Pt.prototype,"leavesOnly",2);Ia([$()],Pt.prototype,"opened",2);Ia([$()],Pt.prototype,"expanded",2);Pt=Ia([k("mateu-tree-select")],Pt);var Pu=Object.defineProperty,Ou=Object.getOwnPropertyDescriptor,gi=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ou(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Pu(t,a,i),i};let ba=class extends S{constructor(){super(...arguments),this.fieldId="",this.cameraOpen=!1,this.cameraError=!1,this.fileFallback=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const s=new FileReader;s.onload=()=>this.emit(s.result),s.readAsDataURL(a),t.value=""}}disconnectedCallback(){super.disconnectedCallback(),this.stopStream()}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}stopStream(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}async openCamera(){this.cameraError=!1;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:!1}),this.cameraOpen=!0,await this.updateComplete;const e=this.renderRoot.querySelector("video");e&&(e.srcObject=this.stream,await e.play())}catch{this.stopStream(),this.cameraOpen=!1,this.cameraError=!0}}closeCamera(){this.stopStream(),this.cameraOpen=!1}shoot(){const e=this.renderRoot.querySelector("video");if(!e||e.videoWidth===0)return;const t=document.createElement("canvas");t.width=e.videoWidth,t.height=e.videoHeight,t.getContext("2d").drawImage(e,0,0),this.closeCamera(),this.emit(t.toDataURL("image/jpeg",.9))}triggerFallback(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="";return o`
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
            `}`}};ba.styles=C`
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
    `;gi([p()],ba.prototype,"fieldId",2);gi([p()],ba.prototype,"value",2);gi([$()],ba.prototype,"cameraOpen",2);gi([$()],ba.prototype,"cameraError",2);ba=gi([k("mateu-camera-capture")],ba);var Ru=Object.defineProperty,zu=Object.getOwnPropertyDescriptor,$i=(e,t,a,s)=>{for(var i=s>1?void 0:s?zu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Ru(t,a,i),i};const co=(e,t)=>{if(!e)return;if(Array.isArray(e)){const s=e.find(i=>i.key==t);return s?.value!=null?String(s.value):void 0}const a=e[t];return a!=null?String(a):void 0};let Xt=class extends S{constructor(){super(...arguments),this.fieldId="",this.editable=!0,this.filePicked=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const s=new FileReader;s.onload=()=>{const i=s.result,r=i.indexOf(","),n=i.substring(0,r).replace(";base64",`;name=${encodeURIComponent(a.name)};base64`);this.emit(n+i.substring(r))},s.readAsDataURL(a),t.value=""}}static fileName(e){if(!e)return"";if(e.startsWith("data:")){const t=e.indexOf(","),s=e.substring(5,t<0?e.length:t).split(";").find(i=>i.startsWith("name="));if(s)try{return decodeURIComponent(s.substring(5))}catch{return s.substring(5)}return"Attached file"}return e.split("/").pop()||e}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}triggerPick(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="",t=Xt.fileName(this.value),a=e&&this.value.startsWith("data:"),s=e?o`<span class="file" title="${t}">📄 ${a?o`<a href="${this.value}" download="${t}">${t}</a>`:o`<a href="${this.value}" target="_blank">${t}</a>`}</span>`:l;return this.editable?o`
            <input type="file" accept="${this.accept||l}" style="display: none;"
                   @change="${this.filePicked}">
            <div class="row">
                ${s}
                <button class="button" @click="${this.triggerPick}">
                    ${e?"Replace":"Choose file"}
                </button>
                ${e?o`
                    <button class="button button--danger" @click="${()=>this.emit("")}">Remove</button>`:l}
            </div>`:o`${e?s:o`<span class="empty">—</span>`}`}};Xt.styles=C`
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
    `;$i([p()],Xt.prototype,"fieldId",2);$i([p()],Xt.prototype,"value",2);$i([p()],Xt.prototype,"accept",2);$i([p({type:Boolean})],Xt.prototype,"editable",2);Xt=$i([k("mateu-file-upload")],Xt);const Au=76;function mr(e){if(e.weight!=null)return e.weight;const t=e.stereotype??"";if(t==="icon")return 1;if(t==="image")return 4;if(t==="html"||t==="richText"||t==="markdown"||t==="textarea")return 5;if(t==="link")return 2.5;if(t==="combobox"||t==="select")return 2;const a=e.dataType??"";return a==="bool"?1:a==="status"||a==="integer"?1.5:a==="number"||a==="date"||a==="money"?2:a==="dateTime"||a==="dateRange"?2.5:3}function uo(e,t){if(e.length===0)return"table";const a=e.reduce((c,u)=>c+mr(u),0),s=t/Au,i=a/s;if(i<=1)return"table";const r=e.filter(c=>c.identifier||(c.priority??Number.MAX_SAFE_INTEGER)<=2),n=r.reduce((c,u)=>c+mr(u),0);return i>1.6||e.length>10?"masterDetail":r.length>0&&n<=8?"list":e.some(c=>c.stereotype==="image"||c.stereotype==="html")||r.length===0&&e.length>=4&&e.length<=8?"cards":"masterDetail"}function Vi(e){return e.filter(t=>t.identifier||(t.priority??Number.MAX_SAFE_INTEGER)<=2).sort((t,a)=>(t.priority??Number.MAX_SAFE_INTEGER)-(a.priority??Number.MAX_SAFE_INTEGER))}function ju(e){const t=Vi(e);return t.length>0?t:e.slice(0,3)}var Lu=Object.defineProperty,Du=Object.getOwnPropertyDescriptor,Hs=(e,t,a,s)=>{for(var i=s>1?void 0:s?Du(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Lu(t,a,i),i};let Hi=class extends S{constructor(){super(...arguments),this.actions=[],this.rowdata={}}createRenderRoot(){return this}handleMenuAction(e){e.stopPropagation();const t=e.detail?.key;t&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:{_clickedRow:this.rowdata}},bubbles:!0,composed:!0}))}render(){const e=this.actions??[];if(!e.length)return o`${l}`;const t=e.map(a=>({label:a.label??a.text??"",key:a.methodNameInCrud??a.actionId??a.id??a.key??a.label,disabled:a.disabled??!1}));return o`
            <oj-c-menu-button
                data-oj-binding-provider="preact"
                label="···"
                chroming="borderless"
                .items="${t}"
                @ojMenuAction="${a=>this.handleMenuAction(a)}"
            ></oj-c-menu-button>
        `}};Hs([p({type:Array})],Hi.prototype,"actions",2);Hs([p({type:Object})],Hi.prototype,"rowdata",2);Hi=Hs([k("mateu-redwood-action-menu")],Hi);var Nu=Object.defineProperty,Fu=Object.getOwnPropertyDescriptor,He=(e,t,a,s)=>{for(var i=s>1?void 0:s?Fu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Nu(t,a,i),i};function $s(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const Oa="var(--mateu-redwood-text, rgb(22, 21, 19))",Mt="var(--oj-core-text-color-secondary, rgba(22,21,19,.7))",Ye="var(--oj-core-divider-color, rgba(22,21,19,.12))",Qa="var(--mateu-redwood-panel-bg, #fff)",vr="var(--oj-link-text-color, rgb(28, 101, 154))",Pi="rgba(28, 101, 154, 0.08)";let W=class extends S{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.dataProvider=void 0,this._connected=!1,this.availableWidthPx=1024,this.selectedItem=null,this.collapsedNodes=new Set,this.mountTimer=null,this.lastContentRef=null,this.lastContentLen=-1}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this._connected=!0,this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}get cols(){return this.metadata?.columns?.map(e=>e.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":uo(this.cols,this.availableWidthPx):t}getRows(){return this.data[this.id]?.page?.content??[]}get groupedTableActive(){const e=this.data?.[this.id];return this.metadata?.groupBy&&(e?.groups?.length??0)>0?!0:!!e?.aggregates&&this.cols.some(a=>a.aggregate)}isLinkColumn(e){return!!e.actionId&&e.stereotype!=="button"&&!["action","actionGroup","status","menu"].includes(e.dataType??"")}getOjColumns(){const e={};return this.metadata?.columns?.forEach(t=>{const a=t.metadata,s=a.stereotype==="button"||a.dataType==="action"||a.dataType==="actionGroup"||a.dataType==="status"||a.dataType==="menu"||this.isLinkColumn(a),i={headerText:a.label,field:a.id};a.resizable&&(i.resizable="enabled"),a.flexGrow!=null&&(i.weight=a.flexGrow),s&&(i.template=a.id+"Template"),e[a.id]=i}),e}getTemplateSlots(){let e="";return this.metadata?.columns?.forEach(t=>{const a=t.metadata;if(a.stereotype==="button"){const s=$s(a.text??a.label??"View"),i=$s(a.actionId??a.id??"");e+=`<template slot="${a.id}Template" data-oj-as="cell">`,e+="<span>",e+=`<oj-c-button
 data-mateu-row-key="[[cell.item.data._rowNumber]]" 
 data-mateu-action-id="${i}"
data-oj-binding-provider="preact" label="${s}" chroming="borderless"></oj-c-button>`,e+="</span>",e+="</template>"}else if(this.isLinkColumn(a)){const s=$s(a.actionId??"");e+=`<template slot="${a.id}Template" data-oj-as="cell">`,e+="<span>",e+=`<oj-c-button
 data-mateu-row-key="[[cell.item.data._rowNumber]]"
 data-mateu-action-id="${s}"
data-oj-binding-provider="preact" label="[[cell.data == null ? '' : '' + cell.data]]" chroming="borderless"></oj-c-button>`,e+="</span>",e+="</template>"}else if(a.dataType==="status")e+=`<template slot="${a.id}Template" data-oj-as="cell">`,e+="<oj-c-badge",e+=` label="[[cell.data ? (cell.data.message || String(cell.data)) : '']]"`,e+=` variant="[[cell.data ? (cell.data.type === 'SUCCESS' ? 'successSubtle' : cell.data.type === 'DANGER' ? 'dangerSubtle' : cell.data.type === 'WARNING' ? 'warningSubtle' : cell.data.type === 'INFO' ? 'infoSubtle' : 'neutral') : 'neutral']]"`,e+="></oj-c-badge>",e+="</template>";else if(a.dataType==="actionGroup"||a.dataType==="menu")e+=`<template slot="${a.id}Template" data-oj-as="cell">`,e+="<oj-c-menu-button",e+=' data-oj-binding-provider="preact"',e+=' label="···"',e+=' chroming="borderless"',e+=` :items="[[cell.data && cell.data.actions ? cell.data.actions.map(function(a){return {label:a.label||a.text||'',key:(cell.item.key+'')+'|'+(a.methodNameInCrud||a.actionId||a.id||a.key||(a.label||'')),disabled:!!a.disabled};}) : []]]"`,e+="></oj-c-menu-button>",e+="</template>";else if(a.dataType==="action"){const s=a.actionId||a.id;e+=`<template slot="${a.id}Template" data-oj-as="cell">`,e+="<oj-c-menu-button",e+=' data-oj-binding-provider="preact"',e+=' label="···"',e+=' chroming="borderless"',e+=` :items="[[cell.data ? [{label:cell.data.label||cell.data.text||'${s}',key:(cell.item.key+'')+'|'+(cell.data.methodNameInCrud||'${s}'),disabled:!!cell.data.disabled}] : []]]"`,e+="></oj-c-menu-button>",e+="</template>"}}),e}refreshDataProvider(){const e=()=>{const t=this.data[this.id]?.page?.content??[];this.dataProvider=new W._ADP(t,{keyAttributes:"@index"}),this.scheduleMount()};W._ADP?e():require(["ojs/ojarraydataprovider"],t=>{W._ADP=t.default??t,this.isConnected&&e()})}scheduleMount(){this.mountTimer&&clearTimeout(this.mountTimer),this.mountTimer=setTimeout(()=>{this.mountTimer=null,this.mountTable()},60)}mountTable(){const e=this.querySelector(".rwt-table-host");if(!e)return;const t=document.createElement("oj-c-table");t.setAttribute("data-oj-binding-provider","preact"),t.setAttribute("aria-label","Data table"),t.setAttribute("layout","contents"),t.style.width="100%";const a=this.getTemplateSlots();if(a){const s=document.createElement("div");s.innerHTML=a,Array.from(s.childNodes).forEach(i=>t.appendChild(i))}t.columns=this.getOjColumns(),t.selectionMode=this.metadata?.rowsSelectionEnabled?{row:"multiple"}:{row:"none"},t.addEventListener("ojRowAction",s=>this.handleRowAction(s)),t.addEventListener("ojAction",s=>this.handleCellButtonAction(s)),t.addEventListener("selectedChanged",s=>this.handleSelectedChanged(s)),t.addEventListener("ojMenuAction",s=>this.handleMenuAction(s)),t.data=this.dataProvider,e.replaceChildren(t)}updated(e){super.updated(e),e.has("metadata")&&(this.lastContentRef=!1);const t=this.data?.[this.id]?.page?.content,a=Array.isArray(t)?t.length:0,s=t!==this.lastContentRef||a!==this.lastContentLen;if(s&&(this.lastContentRef=t,this.lastContentLen=a),this.effectiveGridLayout==="table"&&!this.groupedTableActive){const i=this.querySelector(".rwt-table-host");(s||i&&i.childElementCount===0)&&this.refreshDataProvider()}else s&&(this.collapsedNodes.clear(),this.requestUpdate())}handleRowAction(e){const t=e.detail?.context?.item?.data;if(!t)return;const a=this.metadata?.columns?.find(s=>{const i=s.metadata;return i.stereotype==="button"&&i.actionId});if(a){const s=a.metadata;this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId,parameters:t},bubbles:!0,composed:!0}))}}handleCellButtonAction(e){const t=e.composedPath();let a=null,s=null;for(const n of t){const d=n;if(d.getAttribute("data-mateu-row-key")){const c=d.getAttribute("data-mateu-row-key");if(c!==null){a=c,s=d.getAttribute("data-mateu-action-id");break}}}if(a===null)return;const r=(this.data[this.id]?.page?.content??[]).find((n,d)=>n._rowNumber==a)??{};this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s??"",parameters:r},bubbles:!0,composed:!0}))}handleMenuAction(e){const t=e.detail?.key;if(!t)return;const a=t.indexOf("|");if(a<0)return;const s=parseInt(t.substring(0,a)),i=t.substring(a+1),n=(this.data[this.id]?.page?.content??[])[s]??{};this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i,parameters:n},bubbles:!0,composed:!0}))}handleSelectedChanged(e){const t=e.detail.value?.row;if(!t)return;const a=this.data[this.id]?.page?.content??[],s=t.isAddAll()?a:a.filter((i,r)=>t.has(r));this.state.crud_selected_items=s}dispatchAction(e,t){this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}openRow(e){const t=this.identifierFieldName;t&&e[t]!==void 0&&(this.state._selectedId=String(e[t])),this.dispatchAction("view",e),this.requestUpdate()}isSelectedRow(e){const t=this.identifierFieldName,a=this.state?._selectedId??this.appState?._splitDetailId;return!!t&&a!==void 0&&String(e[t])===String(a)}static isActionButtonCol(e){return e.dataType==="action"||e.dataType==="actionGroup"||e.dataType==="menu"||e.stereotype==="button"}statusBadge(e){const t=(e?.type??"").toUpperCase();return o`<span style="${t==="SUCCESS"?"background: rgba(104, 150, 90, 0.18); color: rgb(49, 93, 36);":t==="DANGER"||t==="ERROR"?"background: rgba(179, 49, 31, 0.14); color: rgb(150, 40, 27);":t==="WARNING"?"background: rgba(190, 120, 0, 0.16); color: rgb(124, 79, 4);":t==="INFO"?"background: rgba(28, 101, 154, 0.14); color: rgb(28, 90, 131);":"background: rgba(22, 21, 19, 0.08); color: rgb(70, 68, 66);"} border-radius: 1rem; padding: 0.1rem 0.6rem; font-size: 0.75rem; font-weight: 600; white-space: nowrap;">${e?.message??String(e??"")}</span>`}formatValue(e,t){const a=t[e.id];return a==null?o``:e.dataType==="status"?this.statusBadge(a):e.dataType==="bool"||e.dataType==="boolean"?o`${a?"✓":"✗"}`:typeof a=="object"?o`${a.label??a.name??a.message??""}`:o`${a}`}linkButton(e,t,a){return o`
            <button title="${a||l}"
                    style="background: transparent; border: none; color: ${vr}; font-family: inherit; font-size: 0.8125rem; font-weight: 600; cursor: pointer; padding: 0.2rem 0.4rem; border-radius: 4px;"
                    @click="${t}">${e}</button>`}renderRowActionButtons(e,t,a){const s=[],i=(r,n)=>{r.stopPropagation(),this.dispatchAction("action-on-row-"+n,{_clickedRow:e})};for(const r of t){const n=e[r.id];if(r.dataType==="action"){const d=n?.methodNameInCrud?n:e.action?.methodNameInCrud?e.action:{methodNameInCrud:r.id,label:r.label};s.push(this.linkButton(d.label??"",c=>i(c,d.methodNameInCrud),d.label))}else(r.dataType==="actionGroup"||r.dataType==="menu")&&(n?.actions??[]).forEach(c=>s.push(this.linkButton(c.label??"",u=>i(u,c.methodNameInCrud),c.label)))}return s.length?o`
            <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.35rem; ${a?`padding-top: 0.5rem; border-top: 1px solid ${Ye};`:""}">
                ${s}
            </div>`:l}renderEmpty(){return o`
            <div style="padding: 1.5rem; text-align: center; color: ${Mt}; font-size: 0.875rem;">
                ${this.emptyStateMessage??this.metadata?.emptyStateMessage??"No data."}
            </div>`}renderListItem(e,t,a,s,i,r){return o`
            <div role="listitem"
                 style="padding: 0.6rem 0.75rem; border-bottom: 1px solid ${Ye}; cursor: pointer; ${s?`background: ${Pi};`:""}"
                 onmouseover="this.style.background='rgba(22,21,19,0.04)'"
                 onmouseout="this.style.background='${s?Pi:"transparent"}'"
                 @click="${i}">
                <div style="font-weight: 600; color: ${Oa}; font-size: 0.875rem;">${t?e[t.id]??"":""}</div>
                <div style="font-size: 0.8125rem; color: ${Mt}; display: flex; flex-wrap: wrap; gap: 0.25rem 0.75rem; align-items: center;">
                    ${a.map(n=>o`<span>${n.label}: ${this.formatValue(n,e)}</span>`)}
                </div>
                ${r}
            </div>`}renderTwoLineList(e){const t=this.getRows(),a=Vi(e),s=a.find(n=>n.identifier)??a[0],i=a.filter(n=>n!==s&&!W.isActionButtonCol(n)),r=e.filter(n=>W.isActionButtonCol(n));return o`
            <div role="list" style="width: 100%; background: ${Qa}; border: 1px solid ${Ye}; border-radius: 8px; overflow: hidden;">
                ${t.length===0?this.renderEmpty():l}
                ${t.map(n=>this.renderListItem(n,s,i,this.isSelectedRow(n),()=>this.openRow(n),this.renderRowActionButtons(n,r,!1)))}
            </div>`}renderCards(e){const t=this.getRows(),a=e.slice(0,6),s=a.filter(h=>h.stereotype==="image"),i=a.find(h=>h.identifier)??a[0],r=h=>!!h.actionId&&!W.isActionButtonCol(h),n=a.find(h=>h.id==="select"&&h.dataType==="action"),d=!!n,c=a.filter(h=>h!==i&&!s.includes(h)&&!r(h)&&!W.isActionButtonCol(h)),u=a.filter(h=>W.isActionButtonCol(h)&&!(d&&h===n)),m=(h,f)=>{d?(h.stopPropagation(),this.dispatchAction("action-on-row-select",{_clickedRow:f})):this.openRow(f)};return o`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; padding: 0.5rem 0;">
                ${t.length===0?o`<div style="grid-column: 1 / -1;">${this.renderEmpty()}</div>`:l}
                ${t.map(h=>o`
                    <div style="background: ${Qa}; border: 1px solid ${this.isSelectedRow(h)?vr:Ye}; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden; cursor: pointer; display: flex; flex-direction: column;"
                         onmouseover="this.style.boxShadow='0 3px 10px rgba(0,0,0,0.14)'"
                         onmouseout="this.style.boxShadow='0 1px 4px rgba(0,0,0,0.08)'"
                         @click="${f=>m(f,h)}">
                        ${s.length?o`<img src="${h[s[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover; display: block;"/>`:l}
                        <div style="padding: 0.75rem 1rem 1rem; display: flex; flex-direction: column; gap: 0.35rem; flex: 1;">
                            ${i?o`<div style="font-weight: 600; color: ${Oa}; font-size: 1rem; margin-bottom: 0.25rem;">${h[i.id]??""}</div>`:l}
                            ${c.map(f=>o`
                                <div style="display: flex; gap: 0.5rem; font-size: 0.8125rem; align-items: baseline;">
                                    <span style="color: ${Mt}; min-width: 80px;">${f.label}</span>
                                    <span style="color: ${Oa};">${this.formatValue(f,h)}</span>
                                </div>
                            `)}
                            ${this.renderRowActionButtons(h,u,!0)}
                        </div>
                    </div>
                `)}
            </div>`}renderMasterDetail(e){const t=this.getRows(),a=Vi(e),s=a.find(r=>r.identifier)??a[0],i=a.filter(r=>r!==s);return o`
            <div style="display: flex; gap: 0; min-height: 400px; background: ${Qa}; border: 1px solid ${Ye}; border-radius: 8px; overflow: hidden;">
                <!-- Left: compact row list -->
                <div role="list" style="width: 280px; flex-shrink: 0; border-right: 1px solid ${Ye}; overflow-y: auto;">
                    ${t.length===0?this.renderEmpty():l}
                    ${t.map(r=>this.renderListItem(r,s,i,this.selectedItem===r,()=>{this.selectedItem=r},l))}
                </div>
                <!-- Right: full detail for the locally selected row -->
                <div style="flex: 1; overflow-y: auto; padding: 1rem;">
                    ${this.selectedItem?o`
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${e.filter(r=>!W.isActionButtonCol(r)).map(r=>o`
                                <div style="display: flex; gap: 0.75rem; align-items: baseline;">
                                    <span style="min-width: 140px; color: ${Mt}; font-size: 0.8125rem;">${r.label}</span>
                                    <span style="color: ${Oa}; font-size: 0.875rem;">${this.formatValue(r,this.selectedItem)}</span>
                                </div>
                            `)}
                        </div>
                    `:o`
                        <p style="color: ${Mt}; font-size: 0.875rem;">Select a row to view details.</p>
                    `}
                </div>
            </div>`}renderTree(e){const t=this.getRows(),a=e[0],s=e.slice(1),i=!!a?.actionId,r=`text-align: left; padding: 0.5rem 0.75rem; border-bottom: 2px solid ${Ye}; color: ${Mt}; font-size: 0.8125rem; font-weight: 600; white-space: nowrap;`,n=`padding: 0.4rem 0.75rem; border-bottom: 1px solid ${Ye}; color: ${Oa}; font-size: 0.875rem;`,d=1+(i?1:0)+s.length,c=(m,h)=>{m.stopPropagation(),this.collapsedNodes.has(h)?this.collapsedNodes.delete(h):this.collapsedNodes.add(h),this.requestUpdate()},u=(m,h)=>{const f=Array.isArray(m.children)?m.children:[],g=f.length>0,y=this.collapsedNodes.has(m);return[o`
                <tr style="${this.isSelectedRow(m)?`background: ${Pi};`:""}">
                    <td style="${n} padding-left: ${.75+h*1.25}rem;">
                        <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
                            ${g?o`
                                <button aria-label="${y?"Expand":"Collapse"}"
                                        style="background: transparent; border: none; cursor: pointer; color: ${Mt}; font-size: 0.7rem; padding: 0 0.2rem; width: 1.2rem;"
                                        @click="${T=>c(T,m)}">${y?"▸":"▾"}</button>
                            `:o`<span style="display: inline-block; width: 1.2rem;"></span>`}
                            <span>${m[a?.id??""]??""}</span>
                        </span>
                    </td>
                    ${i?o`
                        <td style="${n} text-align: end; width: 6rem;">
                            ${m?.viewable===!1?l:this.linkButton("View",T=>{T.stopPropagation(),this.openRow(m)})}
                        </td>`:l}
                    ${s.map(T=>T.id==="select"&&T.dataType==="action"?o`
                            <td style="${n} text-align: end; width: 7rem;">
                                ${this.linkButton("Select",U=>{U.stopPropagation(),this.dispatchAction("action-on-row-select",{_clickedRow:m})})}
                            </td>`:o`<td style="${n}">${this.formatValue(T,m)}</td>`)}
                </tr>`,...y?[]:f.flatMap(T=>u(T,h+1))]};return o`
            <table style="width: 100%; border-collapse: collapse; background: ${Qa};">
                <thead>
                    <tr>
                        <th style="${r}">${a?.label??""}</th>
                        ${i?o`<th style="${r}"></th>`:l}
                        ${s.map(m=>o`<th style="${r} ${m.id==="select"?"text-align: end;":""}">${m.label??""}</th>`)}
                    </tr>
                </thead>
                <tbody>
                    ${t.length===0?o`<tr><td colspan="${d}">${this.renderEmpty()}</td></tr>`:t.flatMap(m=>u(m,0))}
                </tbody>
            </table>`}renderGroupedTable(e){const t=this.getRows(),a=this.data[this.id],s=this.metadata?.groupBy,i=Lr(t,s,a?.groups),r=Mr(e,a,s),n=Nr(s,e.map(m=>m.id)),d=`text-align: left; padding: 0.5rem 0.75rem; border-bottom: 2px solid ${Ye}; color: ${Mt}; font-size: 0.8125rem; font-weight: 600; white-space: nowrap;`,c=`padding: 0.4rem 0.75rem; border-bottom: 1px solid ${Ye}; color: ${Oa}; font-size: 0.875rem;`,u=(m,h)=>{const f=m[h.id];if(h.dataType==="action"){if(h.id==="select")return this.linkButton("Select",y=>{y.stopPropagation(),this.dispatchAction("action-on-row-select",{_clickedRow:m})});const g=f?.methodNameInCrud?f:{methodNameInCrud:h.id,label:h.label};return this.linkButton(g.label??"",y=>{y.stopPropagation(),this.dispatchAction("action-on-row-"+g.methodNameInCrud,{_clickedRow:m})},g.label)}if(h.dataType==="actionGroup"||h.dataType==="menu"){const g=f?.actions??[];return o`${g.map(y=>this.linkButton(y.label??"",x=>{x.stopPropagation(),this.dispatchAction("action-on-row-"+y.methodNameInCrud,{_clickedRow:m})},y.label))}`}return h.stereotype==="button"?this.linkButton(h.text??h.label??"View",g=>{g.stopPropagation(),this.dispatchAction(h.actionId??h.id,m)},h.label):this.isLinkColumn(h)?this.linkButton(""+(f??""),g=>{g.stopPropagation(),h.actionId==="view"?this.openRow(m):this.dispatchAction(h.actionId,m)},h.label):this.formatValue(h,m)};return o`
            <table style="width: 100%; border-collapse: collapse; background: ${Qa};">
                <thead>
                    <tr>
                        ${e.map(m=>o`<th style="${d}">${m.label??""}</th>`)}
                    </tr>
                </thead>
                <tbody>
                    ${t.length===0?o`<tr><td colspan="${e.length}">${this.renderEmpty()}</td></tr>`:l}
                    ${i.map(m=>ai(m)?o`
                        <tr>
                            ${e.map(h=>o`<td style="${c} font-weight: 600; background: rgba(22, 21, 19, 0.05);">${Fr(m,h,n)}</td>`)}
                        </tr>
                    `:o`
                        <tr style="${this.isSelectedRow(m)?`background: ${Pi};`:""}">
                            ${e.map(h=>o`<td style="${c}">${u(m,h)}</td>`)}
                        </tr>
                    `)}
                </tbody>
                ${r?o`
                    <tfoot>
                        <tr>
                            ${e.map(m=>o`<td style="${c} font-weight: 700; border-top: 2px solid ${Ye}; border-bottom: none;">${r[m.id]??""}</td>`)}
                        </tr>
                    </tfoot>
                `:l}
            </table>`}render(){if(!this._connected)return o``;const e=this.effectiveGridLayout;return e==="table"&&this.groupedTableActive?this.renderGroupedTable(this.cols):e==="list"?this.renderTwoLineList(this.cols):e==="cards"?this.renderCards(this.cols):e==="masterDetail"?this.renderMasterDetail(this.cols):e==="tree"?this.renderTree(this.cols):o`
            <div class="rwt-table-host" style="width: 100%;"></div>
            <slot></slot>
        `}};W._ADP=null;He([p()],W.prototype,"id",2);He([p()],W.prototype,"metadata",2);He([p()],W.prototype,"baseUrl",2);He([p()],W.prototype,"state",2);He([p()],W.prototype,"data",2);He([p()],W.prototype,"appState",2);He([p()],W.prototype,"appData",2);He([p()],W.prototype,"emptyStateMessage",2);He([$()],W.prototype,"_connected",2);He([$()],W.prototype,"availableWidthPx",2);He([$()],W.prototype,"selectedItem",2);W=He([k("mateu-redwood-table")],W);const ss="var(--oj-core-text-color-secondary, #666)",po="var(--oj-core-divider-color, rgba(22,21,19,.12))",Mu=`text-align: left; padding: 0.5rem 0.75rem; border-bottom: 2px solid ${po}; color: ${ss}; font-size: 0.8125rem; font-weight: 600; white-space: nowrap;`,fr=`padding: 0.5rem 0.75rem; border-bottom: 1px solid ${po};`,qu=e=>{const t=(e??"").toUpperCase();return t==="SUCCESS"?"successSubtle":t==="DANGER"||t==="ERROR"?"dangerSubtle":t==="WARNING"?"warningSubtle":t==="INFO"?"infoSubtle":"neutral"},Uu=(e,t,a)=>{e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:a},bubbles:!0,composed:!0}))},Bu=(e,t)=>{const a=e[t.id];if(t.stereotype==="button"||t.dataType==="action"){const s=a?.label??a?.text??t.text??t.label??"View",i=a?.methodNameInCrud??t.actionId??t.id;return o`<oj-c-button
            data-oj-binding-provider="preact"
            label="${s}"
            chroming="borderless"
            @ojAction="${r=>Uu(r.target,i,e)}"
        ></oj-c-button>`}return t.dataType==="status"?a==null?o``:o`<oj-c-badge
            data-oj-binding-provider="preact"
            label="${a.message??""+a}"
            variant="${qu(a.type)}"
        ></oj-c-badge>`:t.dataType==="bool"||t.dataType==="boolean"?o`<span aria-label="${a?"yes":"no"}">${a?"✓":"✕"}</span>`:o`${a??""}`},ho=e=>{const t=[];return e?.forEach(a=>{const s=a.metadata;s?.type===v.GridGroupColumn?t.push(...ho(s.columns??s.content??a.children)):s&&t.push({...s,id:s.id??a.id})}),t},mo=(e,t,a=!1,s)=>{const i=(r,n)=>{const d=o`
            <tr style="${s?"cursor: pointer;":""}" @click="${s?u=>s(u,r):l}">
                ${e.map((u,m)=>o`
                    <td style="${fr} ${m===0&&a?`padding-left: ${.75+n*1.25}rem;`:""} ${u.align?`text-align: ${u.align};`:""}">
                        ${Bu(r,u)}
                    </td>`)}
            </tr>`,c=a?r.children??[]:[];return[d,...c.flatMap(u=>i(u,n+1))]};return o`
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>${e.map(r=>o`<th style="${Mu} ${r.align?`text-align: ${r.align};`:""}" width="${r.width??l}">${r.label??""}</th>`)}</tr>
            </thead>
            <tbody>
                ${t.length===0?o`<tr><td colspan="${e.length}" style="${fr} color: ${ss}; text-align: center;">No data.</td></tr>`:t.flatMap(r=>i(r,0))}
            </tbody>
        </table>`},Vu=(e,t)=>{const a=e.metadata,s=ho(a.content);let i=a.page?.content??[];return e.id&&t&&Array.isArray(t[e.id])&&(i=t[e.id]),o`
        <div style="width: 100%; overflow-x: auto; ${e.style??""}" class="${e.cssClasses??l}"
             slot="${e.slot??l}">
            ${mo(s,i,a.tree)}
        </div>`},Hu=(e,t,a,s,i,r,n)=>o`
    <mateu-redwood-table
        id="${t.id}"
        .metadata="${t.metadata}"
        .data="${i}"
        .state="${s}"
        .appState="${r}"
        .appData="${n}"
        baseUrl="${a??""}"
        style="${t.style??l}"
        class="${t.cssClasses??l}"
        slot="${t.slot??l}"
    >
        ${t.children?.map(d=>w(e,d,a,s,i,r,n))}
    </mateu-redwood-table>`,Wu=(e,t,a,s,i,r,n)=>{const c=t.metadata.page?.content??[];return o`
        <div style="overflow-y: auto; ${t.style??""}" class="${t.cssClasses??l}"
             slot="${t.slot??l}">
            ${c.map(u=>w(e,u,a,s,i,r,n))}
        </div>`},Gu=e=>{const t=s=>s.submenus?o`
            <div style="min-width: 12rem;">
                <div class="oj-typography-subheading-sm" style="margin-bottom: 0.5rem;">${s.label??""}</div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${s.submenus.map(i=>t(i))}
                </div>
            </div>`:o`<a class="oj-link-standalone" href="${s.path??l}">${s.label}</a>`,a=e.metadata;return o`
        <div style="display: flex; gap: 3rem; align-items: flex-start; flex-wrap: wrap; ${e.style??""}"
             class="${e.cssClasses??l}" slot="${e.slot??l}">
            ${a.menu.map(s=>t(s))}
        </div>`},Ku=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        <div style="${t.style??l}" class="${t.cssClasses??l}"
             slot="${t.slot??l}" data-colspan="${d.colspan||l}">
            ${d.label?o`<div style="font-size: 0.75rem; color: ${ss}; margin-bottom: 4px;">${d.label}</div>`:l}
            <div>${w(e,d.content,a,s,i,r,n)}</div>
        </div>`},Yu=e=>{const t=e.state?.items??e.metadata?.items??[];return o`
        <div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 0.5rem; ${e.style??""}"
             class="${e.cssClasses??l}" slot="${e.slot??l}">
            ${t.map(a=>o`
                <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                    <oj-c-avatar data-oj-binding-provider="preact" size="xs"
                                 initials="${(a.userName??"?").split(/\s+/).map(s=>s[0]).slice(0,2).join("")}"></oj-c-avatar>
                    <div>
                        ${a.userName?o`<div style="font-size: 0.75rem; color: ${ss};">${a.userName}</div>`:l}
                        <div>${a.text}</div>
                    </div>
                </div>
            `)}
        </div>`},Ju=e=>{const t=a=>{const i=a.target.closest(".rw-message-input")?.querySelector("oj-c-input-text"),r=i?.rawValue??i?.value??"";r&&(a.target.dispatchEvent(new CustomEvent("submit",{detail:{value:r},bubbles:!0,composed:!0})),i&&(i.value=""))};return o`
        <div class="rw-message-input ${e.cssClasses??""}"
             style="display: flex; gap: 0.5rem; align-items: center; ${e.style??""}"
             slot="${e.slot??l}">
            <oj-c-input-text data-oj-binding-provider="preact" label-edge="none" placeholder="Message" style="flex: 1;"
                             @keydown="${a=>{a.key==="Enter"&&t(a)}}"></oj-c-input-text>
            <oj-c-button data-oj-binding-provider="preact" label="Send" chroming="callToAction" @ojAction="${t}"></oj-c-button>
        </div>`},Ra="var(--oj-core-text-color-secondary, #666)",Ws="var(--oj-core-divider-color, rgba(22,21,19,.12))",Gs="var(--oj-core-bg-color-content, #fff)",vo="var(--oj-core-border-radius-md, 6px)",Ha=e=>"oj-ux-ico-"+(e??"").replace(/^vaadin:/,"").replace(/^lumo:/,""),Xu=e=>{const t=e.metadata;return o`<span class="${Ha(t?.icon)} ${e.cssClasses??""}"
                      style="font-size: 1.25rem; ${e.style??""}"
                      slot="${e.slot??l}"
                      aria-label="${t?.icon??l}"></span>`},Qu=e=>{const t=e.metadata,a=t?.breadcrumbs??[];return o`
        <nav aria-label="Breadcrumb"
             style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; ${e.style??""}"
             class="${e.cssClasses??l}" slot="${e.slot??l}">
            ${a.map((s,i)=>o`
                ${i>0?o`<span style="color: ${Ra};">/</span>`:l}
                ${s.link?o`<a class="oj-link-standalone" href="${s.link}">${s.text}</a>`:o`<span>${s.text}</span>`}
            `)}
            ${t?.currentItemText?o`
                ${a.length>0?o`<span style="color: ${Ra};">/</span>`:l}
                <span style="color: ${Ra};">${t.currentItemText}</span>
            `:l}
        </nav>`},Zu=e=>{const t=e.metadata;return o`
        <div role="status"
             style="display: flex; gap: 0.5rem; align-items: baseline; padding: 0.75rem 1rem; border: 1px solid ${Ws}; border-left: 4px solid var(--oj-core-info-color, #0572ce); border-radius: ${vo}; background: ${Gs}; ${e.style??""}"
             class="${e.cssClasses??l}" slot="${e.slot??l}">
            ${t?.title?o`<span class="oj-typography-body-md oj-typography-bold">${t.title}</span>`:l}
            <span class="oj-typography-body-md">${t?.text??""}</span>
        </div>`},ep=(e,t={})=>{const a=e.metadata,s=a.valueKey?t[a.valueKey]:a.value;return o`
        <div style="${e.style??""}" class="${e.cssClasses??l}" slot="${e.slot??l}">
            <oj-c-progress-bar
                data-oj-binding-provider="preact"
                value="${a.indeterminate?-1:s??0}"
                max="${a.max&&a.max!=0?a.max:100}"
                style="width: 100%;"
            ></oj-c-progress-bar>
            ${a.text?o`<div style="font-size: 0.75rem; color: ${Ra}; margin-top: 2px;">${a.text}</div>`:l}
        </div>`},tp=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        <oj-c-collapsible data-oj-binding-provider="preact"
                 ?expanded="${d.opened}"
                 class="${t.cssClasses??l}"
                 style="${t.style??l}"
                 slot="${t.slot??l}">
            <div slot="header" class="oj-typography-subheading-sm">
                ${w(e,d.summary,a,s,i,r,n)}
            </div>
            <div style="padding-top: 0.5rem;">
                ${w(e,d.content,a,s,i,r,n)}
                ${t.children?.map(c=>w(e,c,a,s,i,r,n))}
            </div>
        </oj-c-collapsible>`},fo=e=>e.abbreviation||(e.name?e.name.split(/\s+/).map(t=>t[0]).slice(0,2).join(""):""),ap=(e,t,a)=>{const s=e.metadata;return o`<oj-c-avatar
            data-oj-binding-provider="preact"
            initials="${fo(s)||l}"
            src="${s.image??l}"
            role="img"
            aria-label="${de(s.name,t,a)??l}"
            title="${de(s.name,t,a)??l}"
            style="${e.style??l}" class="${e.cssClasses??l}"
            slot="${e.slot??l}"
    ></oj-c-avatar>`},ip=e=>{const t=e.metadata,a=t.avatars??[],s=t.maxItemsVisible||a.length,i=a.slice(0,s),r=a.length-i.length;return o`
        <div style="display: flex; align-items: center; ${e.style??""}"
             class="${e.cssClasses??l}" slot="${e.slot??l}">
            ${i.map((n,d)=>o`
                <oj-c-avatar
                    data-oj-binding-provider="preact"
                    size="sm"
                    initials="${fo(n)||l}"
                    src="${n.image??l}"
                    title="${n.name??l}"
                    style="${d>0?"margin-left: -0.5rem;":""} border: 2px solid ${Gs}; border-radius: 50%;"
                ></oj-c-avatar>
            `)}
            ${r>0?o`<span style="margin-left: 0.4rem; font-size: 0.8125rem; color: ${Ra};">+${r}</span>`:l}
        </div>`},sp=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        <span title="${d.text??""}" style="${t.style??l}"
              class="${t.cssClasses??l}" slot="${t.slot??l}">
            ${d.wrapped?w(e,d.wrapped,a,s,i,r,n):l}
        </span>`},Ts=e=>{const a=e?.closest(".rw-pop-wrap")?.querySelector(":scope > .rw-pop-panel");a&&(a.hidden=!a.hidden)},bo=`position: absolute; top: 100%; left: 0; margin-top: 4px; z-index: 1000; background: ${Gs}; border: 1px solid ${Ws}; border-radius: ${vo}; box-shadow: 0 4px 12px rgba(0,0,0,.15); min-width: 10rem;`,rp=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        <span class="rw-pop-wrap ${t.cssClasses??""}"
              style="position: relative; display: inline-block; ${t.style??""}"
              slot="${t.slot??l}">
            <span style="cursor: pointer;" @click="${c=>Ts(c.currentTarget)}">
                ${d.wrapped?w(e,d.wrapped,a,s,i,r,n):l}
            </span>
            <div class="rw-pop-panel" hidden style="${bo} padding: 0.75rem;">
                ${d.content?w(e,d.content,a,s,i,r,n):l}
            </div>
        </span>`},Ps=(e,t)=>{t&&e?.dispatchEvent(new CustomEvent("update-route",{detail:{route:t},bubbles:!0,composed:!0}))},op=(e,t)=>{const s=t.metadata.options??[],i=r=>{if(r.submenus&&r.submenus.length>0){const n=r.submenus.map(d=>({key:d.path??d.label,label:d.label,disabled:d.disabled??!1}));return o`
                <oj-c-menu-button
                    data-oj-binding-provider="preact"
                    label="${r.label}"
                    chroming="borderless"
                    .items="${n}"
                    @ojMenuAction="${d=>Ps(e,d.detail.key)}"
                ></oj-c-menu-button>`}return o`
            <oj-c-button
                data-oj-binding-provider="preact"
                label="${r.label}"
                chroming="borderless"
                ?disabled="${r.disabled}"
                @ojAction="${n=>Ps(n.target,r.path)}"
            ></oj-c-button>`};return o`
        <div style="display: flex; flex-direction: row; gap: 0.25rem; align-items: center; ${t.style??""}"
             class="${t.cssClasses??l}" slot="${t.slot??l}">
            ${s.map(i)}
        </div>`},np=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=h=>{h.preventDefault(),Ts(h.currentTarget)},u=(h,f)=>{Ts(h.currentTarget),Ps(h.target,f.path)},m=(h,f=0)=>o`
        ${h.map(g=>g.separator?o`<div style="border-top: 1px solid ${Ws}; margin: 0.25rem 0;"></div>`:o`
                <div role="menuitem"
                     style="padding: 0.4rem 1rem 0.4rem ${1+f*1.25}rem; cursor: ${g.disabled?"default":"pointer"}; ${g.disabled?`color: ${Ra}; opacity: 0.6;`:""} white-space: nowrap;"
                     @click="${g.disabled?l:y=>u(y,g)}">
                    ${g.icon?o`<span class="${Ha(g.icon)}" style="margin-right: 0.4rem;"></span>`:l}
                    ${g.label}
                </div>
                ${g.submenus?m(g.submenus,f+1):l}`)}
    `;return o`
        <span class="rw-pop-wrap ${t.cssClasses??""}"
              style="position: relative; display: inline-block; ${t.style??""}"
              slot="${t.slot??l}"
              @contextmenu="${d.activateOnLeftClick?l:c}"
              @click="${d.activateOnLeftClick?c:l}">
            ${w(e,d.wrapped,a,s,i,r,n)}
            <div class="rw-pop-panel" hidden role="menu" style="${bo} padding: 0.25rem 0;">
                ${m(d.menu??[])}
            </div>
        </span>`},_a="var(--oj-core-text-color-secondary, #666)",ui="var(--oj-core-divider-color, rgba(22,21,19,.12))",_t=`display:block;font-size:0.75rem;color:${_a};margin-bottom:4px;`,go=e=>{const t=window.require;if(!t)return null;try{const a=t("ojs/ojarraydataprovider");return new a(e,{keyAttributes:"value"})}catch{return null}},V=(e,t,a)=>{e.target?.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:t},bubbles:!0,composed:!0}))},yi=(e,t,a)=>{e?.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:t},bubbles:!0,composed:!0}))},Os=(e,t,a)=>{e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:a},bubbles:!0,composed:!0}))},H=(e,t,a="")=>o`
    <div style="${a}">
        ${e?o`<div style="${_t}">${e}</div>`:l}
        ${t}
    </div>`,$o=(e,t)=>{const a=typeof e=="number"?e:parseFloat(""+e);return isNaN(a)?""+e:t&&t.locale&&t.currency?new Intl.NumberFormat(t.locale,{style:"currency",currency:t.currency}).format(a):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(a)},br=new WeakMap,yo=(e,t,a,s,i)=>{const r=i?.[a]??i?.[s],n=r?.content??(Array.isArray(r)?r:void 0);if(n)return n;const d=t.remoteCoordinates?.action;if(d){let c=br.get(e);c||(c=new Set,br.set(e,c)),c.has(s)||(c.add(s),setTimeout(()=>Os(e,d,{searchText:"",fieldId:s,size:200,page:0,sort:void 0})))}return[]},It=(e,t,a,s,i)=>t.remoteCoordinates?yo(e,t,a,s,i):t.options??[],ys=(e,t,a,s,i)=>{const r=go(i.map(n=>({value:n.value,label:n.label??""})));return o`<oj-c-select-single
        data-oj-binding-provider="preact"
        id="${t}"
        label-hint="${a}"
        label-edge="top"
        .value="${s??null}"
        item-text="label"
        .data="${r}"
        ?required="${e.required}"
        ?disabled="${e.disabled}"
        @valueChanged="${n=>V(n,t,n.detail.value)}"
    ></oj-c-select-single>`},lp=(e,t,a,s,i)=>{const r=go(i.map(n=>({value:n.value,label:n.label??""})));return o`<oj-c-select-multiple
        data-oj-binding-provider="preact"
        id="${t}"
        label-hint="${a}"
        label-edge="top"
        .value="${s??[]}"
        item-text="label"
        .data="${r}"
        ?required="${e.required}"
        ?disabled="${e.disabled}"
        @valueChanged="${n=>V(n,t,n.detail.value)}"
    ></oj-c-select-multiple>`},gr=(e,t,a,s)=>{const i=n=>s?Array.isArray(t)&&t.includes(n.value):t===n.value,r=n=>{if(!s)return n.value;const d=Array.isArray(t)?t:[];return d.includes(n.value)?d.filter(c=>c!==n.value):[...d,n.value]};return o`
        <div role="listbox" aria-multiselectable="${s}"
             style="border: 1px solid ${ui}; border-radius: var(--oj-core-border-radius-md, 6px); max-height: 14rem; overflow-y: auto;">
            ${a.map(n=>{const d=i(n);return o`
                    <div role="option" aria-selected="${d}" tabindex="0"
                         style="padding: 0.4rem 0.75rem; cursor: ${e.disabled?"default":"pointer"}; display: flex; align-items: center; gap: 0.5rem; ${d?"background: var(--oj-core-bg-color-selected, #e5f0fa); font-weight: 600;":""}"
                         @click="${e.disabled?l:c=>yi(c.target,e.fieldId,r(n))}">
                        ${n.icon?o`<span class="${Ha(n.icon)}"></span>`:l}
                        <span style="pointer-events: none;">
                            <span>${n.label}</span>
                            ${n.description?o`<span style="display: block; font-size: 0.8125rem; color: ${_a};">${n.description}</span>`:l}
                        </span>
                    </div>`})}
        </div>`},xs=(e,t,a,s)=>o`
    <div style="display: flex; gap: 0.75rem; padding: 0.25rem 0; flex-wrap: wrap;">
        ${a.map(i=>{const r=s?Array.isArray(t)&&t.includes(i.value):t==i.value,n=()=>{if(!s)return i.value;const d=Array.isArray(t)?t:[];return d.includes(i.value)?d.filter(c=>c!==i.value):[...d,i.value]};return o`
                <div role="button" tabindex="0"
                     style="min-width: 10rem; min-height: 3rem; padding: 0.75rem 1rem; cursor: pointer; border-radius: var(--oj-core-border-radius-lg, .375rem); border: 1px solid ${r?"var(--oj-core-info-color, #0572ce)":ui}; background: ${r?"var(--oj-core-bg-color-selected, #e5f0fa)":"transparent"};"
                     @click="${d=>yi(d.target,e.fieldId,n())}">
                    <div style="display: flex; align-items: center; gap: 0.5rem; pointer-events: none;">
                        ${i.icon?o`<span class="${Ha(i.icon)}"></span>`:l}
                        ${i.image?o`<img src="${i.image}" alt="${i.label}" style="${i.imageStyle??"width: 2rem;"}" />`:l}
                        <div>
                            <div>${i.label}</div>
                            ${i.description?o`
                                <div style="font-size: 0.8125rem; color: ${_a};">${i.description}</div>
                            `:l}
                        </div>
                    </div>
                </div>`})}
    </div>`,dp=(e,t,a)=>{let s=typeof e=="number"?e:parseInt(""+e,10);return isNaN(s)&&(s=0),o`<oj-c-rating-gauge
        data-oj-binding-provider="preact"
        .value="${s}"
        max="5"
        step="1"
        size="md"
        ?readonly="${a}"
        @valueChanged="${i=>yi(i.target,t,i.detail.value)}"
    ></oj-c-rating-gauge>`},cp=e=>t=>{const a=t.target,s=a.files?.[0];if(!s)return;const i=new FileReader;i.onload=()=>yi(a,e,i.result),i.readAsDataURL(s),a.value=""},up=e=>t=>{t.target.getRootNode().querySelector(`#${CSS.escape(e)}`)?.click()},pp=(e,t,a)=>{const s=a!=null&&a!=="",i=`${t}_file`;return o`
        <div style="display: flex; flex-direction: column; align-items: stretch; gap: 0.5rem; max-width: 320px;">
            ${s?o`
                <img src="${a}"
                     style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid ${ui}; border-radius: var(--oj-core-border-radius-lg, .375rem); ${e.style??""}">
            `:o`
                <div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed ${ui}; border-radius: var(--oj-core-border-radius-lg, .375rem); color: ${_a};">
                    <span class="oj-ux-ico-image" style="font-size: 2rem;"></span>
                </div>
            `}
            <input type="file" id="${i}" accept="image/*" style="display: none;" @change="${cp(e.fieldId)}">
            <div style="display: flex; gap: 0.5rem;">
                <oj-c-button data-oj-binding-provider="preact" label="${s?"Replace":"Upload"}" chroming="outlined"
                             @ojAction="${up(i)}"></oj-c-button>
                ${s?o`
                    <oj-c-button data-oj-binding-provider="preact" label="Delete" chroming="borderless"
                                 @ojAction="${r=>yi(r.target,e.fieldId,"")}"></oj-c-button>`:l}
            </div>
        </div>`},hp=(e,t,a)=>{const s=t===!0||t==="true";return o`
        <div style="${e.style??l}">
            <oj-c-badge data-oj-binding-provider="preact"
                        variant="${s?"success":"neutral"}"
                        style="${s?"":"opacity: 0.4;"}">${a}</oj-c-badge>
        </div>`},mp=(e,t,a,s,i)=>{let r=de(t,s,i);const n=r&&typeof r=="object"&&"value"in r?r:null;r&&r.value&&(r=r.value);const d=e.dataType=="bool"||r===!0||r===!1,c=e.dataType=="money",u=r!=null&&r!=="";let m=u?""+r:"—";c&&u&&(m=$o(r,n));const h=d?o`<span>${r===!0||r==="true"?"✓":"—"}</span>`:e.multiline?o`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${m}</span>`:o`<span style="display: block; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${c?" font-variant-numeric: tabular-nums;":""}">${m}</span>`;return H(a,h,c?"text-align: right; ":"")},vp=(e,t,a,s,i)=>{let r=de(t,s,i);const n=r&&typeof r=="object"&&"value"in r?r:null;r&&r.value&&(r=r.value);const d=e.dataType=="bool"||r===!0||r===!1,c=e.dataType=="money",u=r!=null&&r!=="";let m=u?""+r:"—";c&&u&&(m=$o(r,n));const h=d?o`<span style="margin-left: auto;">${r===!0||r==="true"?"✓":"—"}</span>`:o`<span style="font-weight: 500; text-align: right; word-break: break-word; margin-left: auto;${c?" font-variant-numeric: tabular-nums;":""}">${m}</span>`,f=a!=null&&a!==""&&a!=="null"?""+a:"";return o`<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; width: 100%; padding: 0.4rem 0; border-bottom: 1px solid rgba(0,0,0,.08); ${e.style??""}"
    >${f?o`<span style="color: ${_a}; white-space: nowrap;">${f}</span>`:l}${h}</div>`},fp=(e,t,a,s,i)=>{const r=de(t,s,i),n=Array.isArray(r)?r.map(d=>""+d):r!=null&&r!==""?[""+r]:[];return H(a,o`<mateu-bulleted-list .items="${n}" style="${e.style??l}"></mateu-bulleted-list>`)},bp=(e,t,a,s,i)=>{let r=de(t,s,i)||i?.[e.fieldId];if(r&&r.value&&(r=r.value),e.stereotype=="image"||e.stereotype=="uploadableImage"||e.stereotype=="signature"||e.stereotype=="camera")return H(a,o`<img src="${r}" style="${e.style??l}">`);if(e.stereotype=="fileUpload")return H(a,o`<mateu-file-upload .fieldId="${e.fieldId}" .value="${r}" .editable="${!1}"></mateu-file-upload>`);if(e.dataType=="bool")return H(a,o`<span>${r?"✓":"—"}</span>`);if(e.stereotype=="link")return H(a,o`<a class="oj-link-standalone" href="${r??""}" target="_blank">${r??""}</a>`);if(e.stereotype=="color")return H(a,o`<span style="background-color: ${r}; display: block; height: 20px; width: 40px; border: 1px solid ${_a}; border-radius: 4px;"></span>`);const n=r!=null&&r!=="";return H(a,o`<span style="display: block; font-weight: 500; overflow: hidden; text-overflow: ellipsis;">${n?r:"—"}</span>`)},gp=X`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,$p=X`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,xo=(e,t,a)=>{const s=e.link,i=Re(s.href,t,a)??s.href,r=Re(s.title,t,a)||i;return{href:i,title:r}},yp=e=>{const t=e;if(!t||t.__navlinkPositioned)return;t.__navlinkPositioned=!0;const a=()=>{const r=t.parentElement,n=r?.firstElementChild?.querySelector("input, textarea, select");if(!r||!n)return;const d=n.getBoundingClientRect();d.height!==0&&(t.style.marginTop=`${Math.max(0,Math.round(d.top+d.height/2-t.offsetHeight/2-r.getBoundingClientRect().top))}px`)};let s=0;const i=()=>{a(),s++<32&&setTimeout(i,250)};setTimeout(i),document.fonts?.ready.then(()=>setTimeout(a))},xp=(e,t,a)=>{const s=e.link,{href:i,title:r}=xo(e,t,a),n=s.icon?o`<span class="${Ha(s.icon)}" style="font-size: 1.125rem;"></span>`:i.startsWith("http")?gp:$p;return o`<a data-navlink
        href="${i}"
        title="${r}"
        target="${s.target||l}"
        ${Jo(yp)}
        style="display: flex; align-items: center; color: ${_a}; align-self: flex-start; margin-top: 1.9rem;"
    >${n}</a>`},wp=(e,t,a)=>s=>{const i=s.composedPath()[0]?.value;if(i==null)return;const n=s.currentTarget.querySelector("a[data-navlink]");if(!n)return;const{href:d,title:c}=xo(e,{...t,[e.fieldId]:i},a);n.setAttribute("href",d),n.setAttribute("title",c)},kp=(e,t,a,s,i)=>{const r=t.metadata,n=Cp(e,t,a,s,i);return r?.link?.href?o`<div style="display: flex; gap: 0.5rem;" @input="${wp(r,s,i)}">
        <div style="flex: 1; min-width: 0;">${n}</div>
        ${xp(r,s,i)}
    </div>`:n},Cp=(e,t,a,s,i)=>{const r=t.metadata,n=r?.fieldId??"",d=s&&n in s?s[n]:r?.initialValue,c=r.label??"",u=t.id??n,m=r.stereotype;if(r.propertyRow)return vp(r,d,c,s,i);if(m==="badge")return hp(t,d,c||n);if(m==="plainText")return mp(r,d,c,s,i);if(m==="bulletedList")return fp(r,d,c,s,i);if(r.readOnly&&m!="grid"&&r.dataType!="status"&&r.dataType!="money")return bp(r,d,c,s,i);if(m==="grid"&&r.columns&&r.columns.length>0){const h=Array.isArray(d)?d:[],f=r.columns.map(x=>({...x.metadata,id:x.metadata.id??x.id})),g=r.onItemSelectionActionId;return H(c,o`<div style="overflow-x: auto;">${mo(f,h,!1,g?(x,T)=>x.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:g,parameters:{_clickedRow:T}},bubbles:!0,composed:!0})):void 0)}</div>`)}if(r.dataType==="string"){if(m==="searchable"){const h=g=>Os(g.target,"code-"+n,{code:g.detail?.value??g.target?.value??""}),f=g=>Os(g.target,"codesearch-"+n,{});return H(c,o`
                <div style="display: flex; gap: 0.33rem; align-items: center;">
                    <oj-c-input-text data-oj-binding-provider="preact" label-edge="none" style="width: 6rem;"
                                     .value="${d??""}" @valueChanged="${h}"></oj-c-input-text>
                    <oj-c-input-text data-oj-binding-provider="preact" label-edge="none" readonly style="flex: 1;"
                                     .value="${i?.[n+"-label"]??""}"></oj-c-input-text>
                    <oj-c-button data-oj-binding-provider="preact" label="Search" chroming="outlined" @ojAction="${f}"></oj-c-button>
                </div>`)}if(m==="textarea")return o`<oj-c-text-area
                data-oj-binding-provider="preact"
                id="${u}"
                label-hint="${c}"
                label-edge="top"
                .value="${d??""}"
                ?required="${r.required}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                @valueChanged="${h=>V(h,u,h.detail.value)}"
            ></oj-c-text-area>`;if(m==="richText"||m==="richtext")return o`<oj-c-text-area
                data-oj-binding-provider="preact"
                id="${u}"
                label-hint="${c}"
                label-edge="top"
                rows="6"
                .value="${d??""}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                @valueChanged="${h=>V(h,u,h.detail.value)}"
            ></oj-c-text-area>`;if(m==="markdown")return H(c,o`<mateu-markdown .content="${d??""}"></mateu-markdown>`);if(m==="password")return o`<oj-c-input-password
                data-oj-binding-provider="preact"
                id="${u}"
                label-hint="${c}"
                label-edge="top"
                .value="${d??""}"
                ?required="${r.required}"
                ?disabled="${r.disabled}"
                @valueChanged="${h=>V(h,u,h.detail.value)}"
            ></oj-c-input-password>`;if(m==="select"||m==="combobox"){const h=d&&d.value?d.value:d;return ys(r,u,c,h,It(e,r,u,n,i))}if(m==="listBox")return H(c,gr(r,d,It(e,r,u,n,i),!1));if(m==="choice")return H(c,xs(r,d,It(e,r,u,n,i),!1));if(m==="popover"){const h=It(e,r,u,n,i),f=h.find(y=>y.value===d)?.label??d??"";return H(c,o`
                <span class="rw-pop-wrap" style="position: relative; display: inline-block;">
                    <span style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;" @click="${y=>{const T=y.currentTarget.closest(".rw-pop-wrap")?.querySelector(":scope > .rw-pop-panel");T&&(T.hidden=!T.hidden)}}">
                        <span>${f}</span>
                        <span class="oj-ux-ico-chevron-down"></span>
                    </span>
                    <div class="rw-pop-panel" hidden
                         style="position: absolute; top: 100%; left: 0; margin-top: 4px; z-index: 1000; background: var(--oj-core-bg-color-content, #fff); border: 1px solid ${ui}; border-radius: var(--oj-core-border-radius-md, 6px); box-shadow: 0 4px 12px rgba(0,0,0,.15); padding: 0.5rem;">
                        ${xs(r,d,h,!1)}
                    </div>
                </span>`)}if(m==="radio"){const h=It(e,r,u,n,i).map(f=>({value:f.value,label:f.label??""}));return o`<oj-c-radioset
                data-oj-binding-provider="preact"
                id="${u}"
                label-hint="${c}"
                label-edge="top"
                .value="${d??null}"
                .options="${h}"
                ?required="${r.required}"
                ?disabled="${r.disabled}"
                @valueChanged="${f=>V(f,u,f.detail.value)}"
            ></oj-c-radioset>`}return m==="html"?o`<div id="${u}">${he(""+(d??""))}</div>`:m==="image"?o`<figure style="margin: 0;">
                <figcaption style="${_t}">${c}</figcaption>
                <img src="${d}" alt="${c}" style="${r.style??""}" />
            </figure>`:m==="uploadableImage"?H(c,pp(r,u,d)):m==="treeSelect"?H(c,o`<mateu-tree-select
                .fieldId="${u}" .value="${d}"
                .options="${r.options??[]}"
                .leavesOnly="${r.treeLeavesOnly??!1}"></mateu-tree-select>`):m==="signature"?H(c,o`<mateu-signature-pad .fieldId="${u}" .value="${d}"></mateu-signature-pad>`):m==="camera"?H(c,o`<mateu-camera-capture .fieldId="${u}" .value="${d}"></mateu-camera-capture>`):m==="fileUpload"?H(c,o`<mateu-file-upload
                .fieldId="${u}" .value="${d}"
                .accept="${co(r.attributes,"accept")}"></mateu-file-upload>`):m==="icon"?H(c,o`
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <oj-c-input-text data-oj-binding-provider="preact" label-edge="none" style="flex: 1;"
                                     .value="${d??""}"
                                     ?disabled="${r.disabled}"
                                     @valueChanged="${h=>V(h,u,h.detail.value)}"
                    ></oj-c-input-text>
                    ${d?o`<span class="${Ha(d)}" style="font-size: 1.25rem;"></span>`:l}
                </div>`):m==="color"?o`<div>
                <label for="${u}" style="${_t}">${c}</label>
                <input id="${u}" type="color" .value="${d??"#000000"}" ?disabled="${r.disabled}"
                    @input="${h=>V(h,u,h.target.value)}" />
            </div>`:m==="link"?o`<div>
                <div style="${_t}">${c}</div>
                <a class="oj-link-standalone" href="${d}" target="_blank">${d}</a>
            </div>`:r.options&&r.options.length>0?ys(r,u,c,d,r.options):r.remoteCoordinates?ys(r,u,c,d,yo(e,r,u,n,i)):o`<oj-c-input-text
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${d??""}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            ?readonly="${r.readOnly}"
            placeholder="${r.placeholder??l}"
            @valueChanged="${h=>V(h,u,h.detail.value)}"
        ></oj-c-input-text>`}if(r.dataType==="number")return o`<oj-c-input-number
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${d??null}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${h=>V(h,u,h.detail.value)}"
        ></oj-c-input-number>`;if(r.dataType==="integer")return m==="stars"?H(c,dp(d,n,r.disabled)):m==="slider"?o`<div>
                <label for="${u}" style="${_t}">${c}</label>
                <input id="${u}" type="range"
                    min="${r.sliderMin??0}"
                    max="${r.sliderMax??10}"
                    .value="${""+(d??0)}"
                    @input="${h=>V(h,u,parseInt(h.target.value))}" />
            </div>`:o`<oj-c-input-number
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${d??null}"
            step="1"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${h=>V(h,u,h.detail.value)}"
        ></oj-c-input-number>`;if(r.dataType==="bool")return m==="toggle"?o`<div>
                <div style="${_t}">${c}</div>
                <oj-c-toggle-button
                    data-oj-binding-provider="preact"
                    id="${u}"
                    label="${c}"
                    .value="${!!d}"
                    ?disabled="${r.disabled}"
                    @valueChanged="${h=>V(h,u,h.detail.value)}"
                ></oj-c-toggle-button>
            </div>`:o`<oj-c-checkbox
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            .value="${!!d}"
            ?disabled="${r.disabled}"
            @valueChanged="${h=>V(h,u,h.detail.value)}"
        >${c}</oj-c-checkbox>`;if(r.dataType==="date")return o`<oj-c-input-date-picker
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${d??null}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${h=>V(h,u,h.detail.value)}"
        ></oj-c-input-date-picker>`;if(r.dataType==="dateTime"){const h=d,f=h?h.split("T")[0]:null,g=h?h.split("T")[1]?.substring(0,5):null;return o`<div style="display:flex;gap:0.5rem;align-items:flex-end;">
            <oj-c-input-date-picker
                data-oj-binding-provider="preact"
                id="${u}_date"
                label-hint="${c}"
                label-edge="top"
                .value="${f}"
                ?required="${r.required}"
                ?disabled="${r.disabled}"
                @valueChanged="${y=>V(y,u,y.detail.value+"T"+(g??"00:00"))}"
            ></oj-c-input-date-picker>
            <oj-c-input-time-mask
                data-oj-binding-provider="preact"
                id="${u}_time"
                label-hint="Time"
                label-edge="top"
                .value="${g}"
                ?disabled="${r.disabled}"
                @valueChanged="${y=>V(y,u,(f??"")+"T"+y.detail.value)}"
            ></oj-c-input-time-mask>
        </div>`}if(r.dataType==="time")return o`<oj-c-input-time-mask
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${d??null}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${h=>V(h,u,h.detail.value)}"
        ></oj-c-input-time-mask>`;if(r.dataType==="dateRange"){const h=d;return o`<div style="display:flex;gap:0.5rem;align-items:flex-end;">
            <oj-c-input-date-picker
                data-oj-binding-provider="preact"
                id="${u}_from"
                label-hint="${c} From"
                label-edge="top"
                .value="${h?.from??null}"
                @valueChanged="${f=>V(f,u,{...h,from:f.detail.value})}"
            ></oj-c-input-date-picker>
            <oj-c-input-date-picker
                data-oj-binding-provider="preact"
                id="${u}_to"
                label-hint="${c} To"
                label-edge="top"
                .value="${h?.to??null}"
                @valueChanged="${f=>V(f,u,{...h,to:f.detail.value})}"
            ></oj-c-input-date-picker>
        </div>`}if(r.dataType==="array"){if(m==="choice")return H(c,xs(r,d,It(e,r,u,n,i),!0));if(m==="listBox")return H(c,gr(r,d,It(e,r,u,n,i),!0));if(m==="combobox"||m==="select")return lp(r,u,c,d,It(e,r,u,n,i));const h=It(e,r,u,n,i).map(f=>({value:f.value,label:f.label??""}));return o`<oj-c-checkboxset
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${d??[]}"
            .options="${h}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${f=>V(f,u,f.detail.value)}"
        ></oj-c-checkboxset>`}if(r.dataType==="status"){const h=d,g={danger:"error",success:"success",warning:"warning",info:"info"}[(h?.type??"").toLowerCase()]??"info";return o`<div id="${u}">
            <div style="${_t}">${c}</div>
            ${h?o`<oj-c-badge
                data-oj-binding-provider="preact"
                .value="${h.message}"
                severity="${g}"
            ></oj-c-badge>`:o``}
        </div>`}if(r.dataType==="money"){if(r.readOnly){const h=d;let f="";return h?.locale&&h?.currency?f=new Intl.NumberFormat(h.locale,{style:"currency",currency:h.currency}).format(h.value):h!=null&&(f=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(h)),o`<div id="${u}">
                <div style="${_t}">${c}</div>
                <div style="text-align:right;font-weight:bold;font-variant-numeric:tabular-nums;">${f}</div>
            </div>`}return o`<oj-c-input-number
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            label-edge="top"
            .value="${d??null}"
            ?required="${r.required}"
            ?disabled="${r.disabled}"
            @valueChanged="${h=>V(h,u,h.detail.value)}"
        ></oj-c-input-number>`}if(r.dataType==="file")return o`<oj-c-file-picker
            data-oj-binding-provider="preact"
            id="${u}"
            label-hint="${c}"
            ?disabled="${r.disabled}"
            @ojSelect="${h=>{const f=h.detail.files?.[0];V(h,u,f?{name:f.name,size:f.size}:null)}}"
        ></oj-c-file-picker>`;if(r.dataType==="range"){const h=d;return o`<div>
            <div style="${_t}">${c}</div>
            <div style="display:flex;gap:1rem;align-items:center;">
                <input type="range"
                    min="${r.sliderMin??0}" max="${r.sliderMax??10}"
                    .value="${""+(h?.from??0)}"
                    @input="${f=>V(f,u,{...h,from:parseInt(f.target.value)})}" />
                <input type="range"
                    min="${r.sliderMin??0}" max="${r.sliderMax??10}"
                    .value="${""+(h?.to??0)}"
                    @input="${f=>V(f,u,{...h,to:parseInt(f.target.value)})}" />
            </div>
        </div>`}return o`<p>Unknown field type: ${r.dataType} / ${r.stereotype}</p>`};var Sp=Object.defineProperty,Ip=Object.getOwnPropertyDescriptor,Ea=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ip(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Sp(t,a,i),i};let tt=class extends S{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.searchText=""}connectedCallback(){super.connectedCallback(),ro()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(as()[this.selector.fieldName]??"")}currentLabel(){const e=this.currentValue();if(!e)return"—";const t=(this.searchedOptions??this.selector.options)?.find(s=>String(s.value)===e);if(t)return t.label;const a=Vs()[this.selector.fieldName];return a!==void 0?String(a):e}pick(e,t){so(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText="",this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector("input.picker-search")?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){const e=this.app;if(e?.serverSideType)try{const t=await oa.runAction(this.baseUrl??"",e.rootRoute??e.initialRoute??"","",`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(const a of t?.fragments??[]){const r=a.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(r)){this.searchedOptions=r.map(n=>({value:n.value,label:n.label??String(n.value)}));return}}}catch{}}visibleOptions(){const e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(a=>a.label.toLowerCase().includes(t)):e}renderPanel(){const e=this.currentValue(),t=this.visibleOptions(),a=this.searchText!==""||t.length>tt.SEARCHABLE_THRESHOLD;return o`
            <div class="panel">
                ${a?o`
                    <input class="picker-search" type="text" placeholder="Search"
                           .value="${this.searchText}"
                           @input="${this.onSearchInput}"
                           @keydown="${s=>{s.key==="Escape"&&this.closePanel()}}"/>`:l}
                <div class="options">
                    ${e?o`
                        <div class="option option--clear" @click="${()=>this.pick("")}">— (clear)</div>`:l}
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
                ${this.opened?this.renderPanel():l}
            </label>`:o``}};tt.SEARCHABLE_THRESHOLD=7;tt.styles=C`
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
    `;Ea([p()],tt.prototype,"selector",2);Ea([p()],tt.prototype,"app",2);Ea([p()],tt.prototype,"baseUrl",2);Ea([$()],tt.prototype,"opened",2);Ea([$()],tt.prototype,"searchText",2);Ea([$()],tt.prototype,"searchedOptions",2);tt=Ea([k("mateu-app-context-picker")],tt);var pi=(e=>(e.Add="Add",e.Replace="Replace",e.ReplaceKeepData="ReplaceKeepData",e))(pi||{}),_p=Object.defineProperty,wo=(e,t,a,s)=>{for(var i=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=n(t,a,i)||i);return i&&_p(t,a,i),i};class rs extends S{constructor(){super(...arguments),this.id="",this.baseUrl="",this.callbackToken="",this.createElement=t=>{const a=t.data,s=document.createElement(a.name);for(let i in a.attributes)s.setAttribute(i,a.attributes[i]);for(let i in a.on)s.addEventListener(i,r=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.on[i],parameters:{event:r}},bubbles:!0,composed:!0}))});return s},this.closeModal=()=>{const t=(this.shadowRoot??this).querySelectorAll("mateu-dialog, mateu-drawer");if(t&&t.length>0){t[t.length-1].close(),this.removeTopOverlayChild();return}this.dispatchEvent(new CustomEvent("close-modal-requested",{bubbles:!0,composed:!0}))},this.changeFavicon=t=>{let a=document.querySelector('link[rel="icon"]');a!==null?a.setAttribute("href",t):(a=document.createElement("link"),a.setAttribute("rel","icon"),a.setAttribute("href",t),document.head.appendChild(a))}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=Vt.subscribe(t=>{if(t.command){const a=t.command;this.id==a.targetComponentId&&this.applyCommand(a)}if((!t.callbackToken||!this.callbackToken||t.callbackToken===this.callbackToken)&&t.fragment){const a=t.fragment;this.id==a.targetComponentId&&(this.applyFragment(a),this.completeMenu(a))}})}completeMenu(t){if(t.component&&t.component.type==oe.ClientSide){const a=t.component,s=a.metadata;if(s?.type==v.App){const i=s,r=this.getRemoteMenus(i.menu);if(r.length>0){const n=r.map(d=>oa.runAction(d.baseUrl,d.route,"_empty","",d.baseUrl+"#"+d.route,void 0,void 0,void 0,d.params,this,!0));Promise.all(n).then(d=>{i.menu=this.updateMenu(i.menu,d.map(c=>c.fragments).filter(c=>c).map(c=>c).flat()),i.variant=we.MENU_ON_TOP,Vt.next({fragment:{component:a,data:void 0,state:void 0,action:pi.Replace,targetComponentId:this.id,containerId:void 0},callbackToken:this.callbackToken})})}}}}updateMenu(t,a){const s=[];return t.forEach(i=>{if(i.remote){const r=a.find(n=>n.targetComponentId==i.baseUrl+"#"+i.route);if(r&&r.component?.type==oe.ClientSide){const n=r.component;if(n.metadata?.type==v.App){const d=n.metadata,c=i.serverSideType&&i.serverSideType!=""?i.serverSideType:d.serverSideType;this.changeBaseUrl(d.menu,i.baseUrl,c,i.route,d.route),s.push(...d.menu)}}}else s.push(i)}),s}changeBaseUrl(t,a,s,i,r){t.forEach(n=>{n.baseUrl||(n.submenus&&n.submenus.length>0?this.changeBaseUrl(n.submenus,a,s,i,r):(n.consumedRoute=r??"",n.baseUrl=a,n.serverSideType=s,n.uriPrefix=i))})}getRemoteMenus(t){const a=[];return t.forEach(s=>{s.remote&&a.push(s)}),a}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(t){if(t.type=="SetWindowTitle"&&(document.title=t.data),t.type=="SetFavicon"&&this.changeFavicon(t.data),t.type=="DispatchEvent"&&this.dispatchNamedEvent(t.data),t.type=="NavigateTo"){const a=t.data;a&&(a.startsWith("http:")||a.startsWith("https:")?window.open(t.data,"_blank"):window.location.href=t.data)}if(t.type=="PushStateToHistory"){const a=t.data;a!==void 0&&this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:a},bubbles:!0,composed:!0}))}if(t.type=="RunAction"){const a=t.data;if(a&&a.actionId)if(a.targetComponentId){const s={command:{type:"RunAction",data:{actionId:a.actionId},targetComponentId:a.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:""};setTimeout(()=>Vt.next(s))}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(t.type=="MarkAsDirty"&&this.dispatchEvent(new CustomEvent("dirty",{detail:{},bubbles:!0,composed:!0})),t.type=="MarkAsClean"&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),t.type=="DownloadFile"){const a=t.data;if(a&&a.base64Content){const s=atob(a.base64Content),i=new Uint8Array(s.length);for(let c=0;c<s.length;c++)i[c]=s.charCodeAt(c);const r=new Blob([i],{type:a.mimeType}),n=URL.createObjectURL(r),d=document.createElement("a");d.href=n,d.download=a.filename??"export",d.click(),URL.revokeObjectURL(n)}}if(t.type=="CloseModal"&&(this.closeModal(),this.dispatchNamedEvent(t.data)),t.type=="AddContentToHead"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.head.appendChild(this.createElement(t))}}if(t.type=="AddContentToBody"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.body.appendChild(this.createElement(t))}}}dispatchNamedEvent(t){if(t&&t.eventName){const a=this.component,s=a?.emitsName??a?.serverSideType;let i=t.payload??t.detail;s&&i&&typeof i=="object"&&(i={...i,__source:s}),this.dispatchEvent(new CustomEvent(t.eventName,{detail:i,bubbles:!0,composed:!0}))}}removeTopOverlayChild(){const t=this.component?.children;if(t)for(let a=t.length-1;a>=0;a--){const s=t[a]?.metadata?.type;if(s==v.Drawer||s==v.Dialog){t.splice(a,1);return}}}}wo([p()],rs.prototype,"id");wo([p()],rs.prototype,"baseUrl");var Ep=Object.defineProperty,Tp=(e,t,a,s)=>{for(var i=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=n(t,a,i)||i);return i&&Ep(t,a,i),i};class xi extends rs{applyFragment(t){}manageActionRequestedEvent(t){}}Tp([p()],xi.prototype,"component");var Pp=Object.defineProperty,Op=Object.getOwnPropertyDescriptor,na=(e,t,a,s)=>{for(var i=s>1?void 0:s?Op(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Pp(t,a,i),i};const Rp=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},zp=(e,t)=>{let a=t;for(;a;){if(a===e)return!0;a=a.assignedSlot??a.parentNode??a.host??null}return!1};let vt=class extends xi{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.hoveredItem=null,this.onGridHoverMove=e=>{const t=e.currentTarget,a=t.getEventContext(e)?.item??null;a!==this.hoveredItem&&(this.hoveredItem=a,t.generateCellPartNames())},this.onGridHoverLeave=e=>{this.hoveredItem!==null&&(this.hoveredItem=null,e.currentTarget.generateCellPartNames())},this.hoverCellPartNameGenerator=(e,t)=>t?.item!=null&&t.item===this.hoveredItem?"hovered-cell":"",this._onRowKey=e=>{const t=this.field?.rowSelectionShortcut;if(!t||!this.field?.onItemSelectionActionId||!this._isRowShortcutRelevant()||!Ur(t,e))return;const a=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!a)return;const s=this.currentItems(),i=parseInt(a[1],10)-1;i>=s.length||(e.preventDefault(),this.selectRow(s[i]))},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onRowKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._onRowKey)}currentItems(){return this.field?.remoteCoordinates?this.data?.[this.id]?.content??[]:this.field?.fieldId&&this.state?this.state[this.field.fieldId]??[]:[]}selectRow(e){!e||!this.field?.onItemSelectionActionId||(this.selectedItems=[e],this.state[this.id+"_selected_items"]=[e],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.field.onItemSelectionActionId,parameters:{_clickedRow:e}},bubbles:!0,composed:!0})))}_isRowShortcutRelevant(){if(this.offsetParent===null&&this.getClientRects().length===0)return!1;const e=Rp();if(e&&e!==document.body&&!zp(this,e)){const t=e.tagName?.toLowerCase()??"";if(e.isContentEditable||/^(input|textarea|select)$/.test(t)||t.startsWith("vaadin-")&&/(field|combo|picker|area|select)/.test(t))return!1}return!0}handleItemToggle(e){const{item:t,selected:a,shiftKey:s}=e.detail;if(this.rangeStartItem??=t,s){let i=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(i=this.state[this.field.fieldId]);const[r,n]=[this.rangeStartItem,t].map(u=>i.indexOf(u)).sort((u,m)=>u-m),d=i.slice(r,n+1),c=new Set(this.selectedItems);d.forEach(u=>{a?c.add(u):c.delete(u)}),this.selectedItems=[...c],this.state[this.id+"_selected_items"]=this.selectedItems}this.rangeStartItem=t}render(){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);const t=this.state[this.field?.fieldId+"_show_detail"]||this.state._show_detail&&this.state._show_detail[this.field.fieldId];if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates,s="";this.data[this.id]&&(this.data[this.id].searchSignature||s)&&this.data[this.id].searchSignature!=s&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements?e=this.data[this.id].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:s,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}if(Array.isArray(e)&&e.forEach((a,s)=>{a&&typeof a=="object"&&a._rowNumber===void 0&&(a._rowNumber=s)}),this.field?.inlineEditing)return this.renderMaster(e);if(this.field?.formPosition&&this.field?.formPosition.startsWith("modal")){const a=this;return o`

                ${this.renderMaster(e)}

                <vaadin-dialog
                        .opened="${t}"
                        @closed="${()=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.field?.fieldId+"_cancel"},bubbles:!0,composed:!0}))}}"
                        ${Ji(()=>o`
                            <mateu-event-interceptor .target="${a}">
                                <div id="container" style="${this.field?.formStyle??"display: contents;"}">
                                    <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                                </div>
                            </mateu-event-interceptor>
                            `,[()=>ke()])}
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
                    .cellPartNameGenerator="${P(this.field?.onItemSelectionActionId?this.hoverCellPartNameGenerator:void 0)}"
                    @mousemove="${P(this.field?.onItemSelectionActionId?this.onGridHoverMove:void 0)}"
                    @mouseleave="${P(this.field?.onItemSelectionActionId?this.onGridHoverLeave:void 0)}"
                    style="${this.field?.onItemSelectionActionId?"cursor: pointer;":""}${this.field?.style??""}"
                    class="${this.field?.cssClasses}"
                    .items="${e}"
                    .selectedItems="${t}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${a=>{this.selectedItems=a.detail.value,this.state[this.id+"_selected_items"]=this.selectedItems}}"
                    @item-toggle="${this.handleItemToggle}"
                    @click="${P(this.field?.onItemSelectionActionId?a=>{const i=a.currentTarget.getEventContext(a)?.item;i&&this.selectRow(i)}:void 0)}"
                    @active-item-changed="${P(this.field?.detailPath&&!this.field?.useButtonForDetail?a=>{if(this.field?.detailPath){const s=a.detail.value;s?this.detailsOpenedItems=[s]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${P(this.field?.detailPath?Rr(a=>o`${w(this,a[this.field?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    ?all-rows-visible=${e?.length<10}
            >
                <span slot="empty-state">${this.field?.label?`No ${this.field.label.toLowerCase()} added yet.`:"No items added yet."}</span>
                ${this.field?.readOnly||this.field?.inlineEditing?l:o`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.columns?.map(a=>js(a,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}

                ${this.field?.inlineEditing&&!this.field?.readOnly?o`
                    <vaadin-grid-column width="3.5rem" flex-grow="0" frozen-to-end
                            ${Et(a=>o`
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
                            ${Et((a,{detailsOpened:s})=>o`
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
        </vaadin-vertical-layout>`}};vt.styles=C`
        ${ea}

        /* Clickable grids (a row-selection action is wired) give visual feedback: the host sets a
           pointer cursor (inline, inherited by the slotted cell content), and the cells of the
           hovered row — tagged "hovered-cell" by cellPartNameGenerator — get a subtle highlight. */
        vaadin-grid[clickable]::part(hovered-cell) {
            background-color: var(--lumo-primary-color-10pct);
            cursor: pointer;
        }
    `;na([p()],vt.prototype,"field",2);na([p()],vt.prototype,"state",2);na([p()],vt.prototype,"data",2);na([p()],vt.prototype,"appState",2);na([p()],vt.prototype,"appData",2);na([p()],vt.prototype,"selectedItems",2);na([$()],vt.prototype,"detailsOpenedItems",2);vt=na([k("mateu-grid")],vt);var Ap=Object.defineProperty,jp=Object.getOwnPropertyDescriptor,Wa=(e,t,a,s)=>{for(var i=s>1?void 0:s?jp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Ap(t,a,i),i};let Qt=class extends S{constructor(){super(...arguments),this.getNewValue=e=>{if(this.field?.dataType=="array"){if(!this.value)return[e];const t=this.value;return t.indexOf(e)>=0?t.filter(a=>a!==e):[...t,e]}return e}}render(){let e=this.field?.options;if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates;this.data?.[this.field.fieldId]&&this.data[this.field.fieldId].content&&this.data[this.field.fieldId].totalElements?e=this.data[this.field.fieldId].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:"",fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}const t=this.field?.attributes?.divStyle;return o`
        <div style="display: flex; gap: 1rem; padding: 1rem; flex-wrap: wrap; ${t}">
                                    ${e?.map(a=>o`
                            <div 
                                    class="choice ${this.value==a.value||Array.isArray(this.value)&&this.value.includes(a.value)?"selected":""}"
                                    @click="${()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.getNewValue(a.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}"
                            >${a.description||a.image?o`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${a.image?o`
                                            <img src="${a.image}" alt="${a.label}" style="${a.imageStyle??"width: 2rem;"}" />
                                        `:l}
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

       `}};Qt.styles=C`
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
  `;Wa([p()],Qt.prototype,"field",2);Wa([p()],Qt.prototype,"baseUrl",2);Wa([p()],Qt.prototype,"state",2);Wa([p()],Qt.prototype,"data",2);Wa([p()],Qt.prototype,"value",2);Qt=Wa([k("mateu-choice")],Qt);var Lp=Object.defineProperty,Dp=Object.getOwnPropertyDescriptor,$t=(e,t,a,s)=>{for(var i=s>1?void 0:s?Dp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Lp(t,a,i),i};let Fe=class extends S{constructor(){super(...arguments),this.currencyChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),this.value.currency=e.detail.value,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}}))},this.valueChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),e.detail.value&&(this.value.value=e.detail.value?parseFloat(e.detail.value):0,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}})))}}render(){return o`
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
       `}};Fe.styles=C`
  `;$t([p()],Fe.prototype,"fieldId",2);$t([p()],Fe.prototype,"label",2);$t([p()],Fe.prototype,"state",2);$t([p()],Fe.prototype,"data",2);$t([p()],Fe.prototype,"value",2);$t([p()],Fe.prototype,"autoFocus",2);$t([p()],Fe.prototype,"required",2);$t([p()],Fe.prototype,"colspan",2);$t([p()],Fe.prototype,"helperText",2);Fe=$t([k("mateu-money-field")],Fe);const $r=["vaadin:abacus","vaadin:absolute-position","vaadin:academy-cap","vaadin:accessibility","vaadin:accordion-menu","vaadin:add-dock","vaadin:adjust","vaadin:adobe-flash","vaadin:airplane","vaadin:alarm","vaadin:align-center","vaadin:align-justify","vaadin:align-left","vaadin:align-right","vaadin:alt-a","vaadin:alt","vaadin:ambulance","vaadin:anchor","vaadin:angle-double-down","vaadin:angle-double-left","vaadin:angle-double-right","vaadin:angle-double-up","vaadin:angle-down","vaadin:angle-left","vaadin:angle-right","vaadin:angle-up","vaadin:archive","vaadin:archives","vaadin:area-select","vaadin:arrow-backward","vaadin:arrow-circle-down-o","vaadin:arrow-circle-down","vaadin:arrow-circle-left-o","vaadin:arrow-circle-left","vaadin:arrow-circle-right-o","vaadin:arrow-circle-right","vaadin:arrow-circle-up-o","vaadin:arrow-circle-up","vaadin:arrow-down","vaadin:arrow-forward","vaadin:arrow-left","vaadin:arrow-long-down","vaadin:arrow-long-left","vaadin:arrow-right","vaadin:arrow-up","vaadin:arrows-cross","vaadin:arrows-long-h","vaadin:arrows-long-right","vaadin:arrows-long-up","vaadin:arrows-long-v","vaadin:arrows","vaadin:asterisk","vaadin:at","vaadin:automation","vaadin:backspace-a","vaadin:backspace","vaadin:backwards","vaadin:ban","vaadin:bar-chart-h","vaadin:bar-chart-v","vaadin:bar-chart","vaadin:barcode","vaadin:bed","vaadin:bell-o","vaadin:bell-slash-o","vaadin:bell-slash","vaadin:bell","vaadin:boat","vaadin:bold","vaadin:bolt","vaadin:bomb","vaadin:book-dollar","vaadin:book-percent","vaadin:book","vaadin:bookmark-o","vaadin:bookmark","vaadin:briefcase","vaadin:browser","vaadin:bug-o","vaadin:bug","vaadin:building-o","vaadin:building","vaadin:bullets","vaadin:bullseye","vaadin:bus","vaadin:buss","vaadin:button","vaadin:calc-book","vaadin:calc","vaadin:calendar-briefcase","vaadin:calendar-clock","vaadin:calendar-envelope","vaadin:calendar-o","vaadin:calendar-user","vaadin:calendar","vaadin:camera","vaadin:car","vaadin:caret-down","vaadin:caret-left","vaadin:caret-right","vaadin:caret-square-down-o","vaadin:caret-square-left-o","vaadin:caret-square-right-o","vaadin:caret-square-up-o","vaadin:caret-up","vaadin:cart-o","vaadin:cart","vaadin:cash","vaadin:chart-3d","vaadin:chart-grid","vaadin:chart-line","vaadin:chart-timeline","vaadin:chart","vaadin:chat","vaadin:check-circle-o","vaadin:check-circle","vaadin:check-square-o","vaadin:check-square","vaadin:check","vaadin:chevron-circle-down-o","vaadin:chevron-circle-down","vaadin:chevron-circle-left-o","vaadin:chevron-circle-left","vaadin:chevron-circle-right-o","vaadin:chevron-circle-right","vaadin:chevron-circle-up-o","vaadin:chevron-circle-up","vaadin:chevron-down-small","vaadin:chevron-down","vaadin:chevron-left-small","vaadin:chevron-left","vaadin:chevron-right-small","vaadin:chevron-right","vaadin:chevron-up-small","vaadin:chevron-up","vaadin:child","vaadin:circle-thin","vaadin:circle","vaadin:clipboard-check","vaadin:clipboard-cross","vaadin:clipboard-heart","vaadin:clipboard-pulse","vaadin:clipboard-text","vaadin:clipboard-user","vaadin:clipboard","vaadin:clock","vaadin:close-big","vaadin:close-circle-o","vaadin:close-circle","vaadin:close-small","vaadin:close","vaadin:cloud-download-o","vaadin:cloud-download","vaadin:cloud-o","vaadin:cloud-upload-o","vaadin:cloud-upload","vaadin:cloud","vaadin:cluster","vaadin:code","vaadin:coffee","vaadin:cog-o","vaadin:cog","vaadin:cogs","vaadin:coin-piles","vaadin:coins","vaadin:combobox","vaadin:comment-ellipsis-o","vaadin:comment-ellipsis","vaadin:comment-o","vaadin:comment","vaadin:comments-o","vaadin:comments","vaadin:compile","vaadin:compress-square","vaadin:compress","vaadin:connect-o","vaadin:connect","vaadin:controller","vaadin:copy-o","vaadin:copy","vaadin:copyright","vaadin:corner-lower-left","vaadin:corner-lower-right","vaadin:corner-upper-left","vaadin:corner-upper-right","vaadin:credit-card","vaadin:crop","vaadin:cross-cutlery","vaadin:crosshairs","vaadin:css","vaadin:ctrl-a","vaadin:ctrl","vaadin:cube","vaadin:cubes","vaadin:curly-brackets","vaadin:cursor-o","vaadin:cursor","vaadin:cutlery","vaadin:dashboard","vaadin:database","vaadin:date-input","vaadin:deindent","vaadin:del-a","vaadin:del","vaadin:dental-chair","vaadin:desktop","vaadin:diamond-o","vaadin:diamond","vaadin:diploma-scroll","vaadin:diploma","vaadin:disc","vaadin:doctor-briefcase","vaadin:doctor","vaadin:dollar","vaadin:dot-circle","vaadin:download-alt","vaadin:download","vaadin:drop","vaadin:edit","vaadin:eject","vaadin:elastic","vaadin:ellipsis-circle-o","vaadin:ellipsis-circle","vaadin:ellipsis-dots-h","vaadin:ellipsis-dots-v","vaadin:ellipsis-h","vaadin:ellipsis-v","vaadin:enter-arrow","vaadin:enter","vaadin:envelope-o","vaadin:envelope-open-o","vaadin:envelope-open","vaadin:envelope","vaadin:envelopes-o","vaadin:envelopes","vaadin:eraser","vaadin:esc-a","vaadin:esc","vaadin:euro","vaadin:exchange","vaadin:exclamation-circle-o","vaadin:exclamation-circle","vaadin:exclamation","vaadin:exit-o","vaadin:exit","vaadin:expand-full","vaadin:expand-square","vaadin:expand","vaadin:external-browser","vaadin:external-link","vaadin:eye-slash","vaadin:eye","vaadin:eyedropper","vaadin:facebook-square","vaadin:facebook","vaadin:factory","vaadin:family","vaadin:fast-backward","vaadin:fast-forward","vaadin:female","vaadin:file-add","vaadin:file-code","vaadin:file-font","vaadin:file-movie","vaadin:file-o","vaadin:file-picture","vaadin:file-presentation","vaadin:file-process","vaadin:file-refresh","vaadin:file-remove","vaadin:file-search","vaadin:file-sound","vaadin:file-start","vaadin:file-table","vaadin:file-text-o","vaadin:file-text","vaadin:file-tree-small","vaadin:file-tree-sub","vaadin:file-tree","vaadin:file-zip","vaadin:file","vaadin:fill","vaadin:film","vaadin:filter","vaadin:fire","vaadin:flag-checkered","vaadin:flag-o","vaadin:flag","vaadin:flash","vaadin:flask","vaadin:flight-landing","vaadin:flight-takeoff","vaadin:flip-h","vaadin:flip-v","vaadin:folder-add","vaadin:folder-o","vaadin:folder-open-o","vaadin:folder-open","vaadin:folder-remove","vaadin:folder-search","vaadin:folder","vaadin:font","vaadin:form","vaadin:forward","vaadin:frown-o","vaadin:funcion","vaadin:function","vaadin:funnel","vaadin:gamepad","vaadin:gavel","vaadin:gift","vaadin:glass","vaadin:glasses","vaadin:globe-wire","vaadin:globe","vaadin:golf","vaadin:google-plus-square","vaadin:google-plus","vaadin:grab","vaadin:grid-bevel","vaadin:grid-big-o","vaadin:grid-big","vaadin:grid-h","vaadin:grid-small-o","vaadin:grid-small","vaadin:grid-v","vaadin:grid","vaadin:group","vaadin:hammer","vaadin:hand","vaadin:handle-corner","vaadin:hands-up","vaadin:handshake","vaadin:harddrive-o","vaadin:harddrive","vaadin:hash","vaadin:header","vaadin:headphones","vaadin:headset","vaadin:health-card","vaadin:heart-o","vaadin:heart","vaadin:home-o","vaadin:home","vaadin:hospital","vaadin:hourglass-empty","vaadin:hourglass-end","vaadin:hourglass-start","vaadin:hourglass","vaadin:inbox","vaadin:indent","vaadin:info-circle-o","vaadin:info-circle","vaadin:info","vaadin:input","vaadin:insert","vaadin:institution","vaadin:invoice","vaadin:italic","vaadin:key-o","vaadin:key","vaadin:keyboard-o","vaadin:keyboard","vaadin:laptop","vaadin:layout","vaadin:level-down-bold","vaadin:level-down","vaadin:level-left-bold","vaadin:level-left","vaadin:level-right-bold","vaadin:level-right","vaadin:level-up-bold","vaadin:level-up","vaadin:lifebuoy","vaadin:lightbulb","vaadin:line-bar-chart","vaadin:line-chart","vaadin:line-h","vaadin:line-v","vaadin:lines-list","vaadin:lines","vaadin:link","vaadin:list-ol","vaadin:list-select","vaadin:list-ul","vaadin:list","vaadin:location-arrow-circle-o","vaadin:location-arrow-circle","vaadin:location-arrow","vaadin:lock","vaadin:magic","vaadin:magnet","vaadin:mailbox","vaadin:male","vaadin:map-marker","vaadin:margin-bottom","vaadin:margin-left","vaadin:margin-right","vaadin:margin-top","vaadin:margin","vaadin:medal","vaadin:megafone","vaadin:megaphone","vaadin:meh-o","vaadin:menu","vaadin:microphone","vaadin:minus-circle-o","vaadin:minus-circle","vaadin:minus-square-o","vaadin:minus","vaadin:mobile-browser","vaadin:mobile-retro","vaadin:mobile","vaadin:modal-list","vaadin:modal","vaadin:money-deposit","vaadin:money-exchange","vaadin:money-withdraw","vaadin:money","vaadin:moon-o","vaadin:moon","vaadin:morning","vaadin:movie","vaadin:music","vaadin:mute","vaadin:native-button","vaadin:newspaper","vaadin:notebook","vaadin:nurse","vaadin:office","vaadin:open-book","vaadin:option-a","vaadin:option","vaadin:options","vaadin:orientation","vaadin:out","vaadin:outbox","vaadin:package","vaadin:padding-bottom","vaadin:padding-left","vaadin:padding-right","vaadin:padding-top","vaadin:padding","vaadin:paint-roll","vaadin:paintbrush","vaadin:palete","vaadin:palette","vaadin:panel","vaadin:paperclip","vaadin:paperplane-o","vaadin:paperplane","vaadin:paragraph","vaadin:password","vaadin:paste","vaadin:pause","vaadin:pencil","vaadin:phone-landline","vaadin:phone","vaadin:picture","vaadin:pie-bar-chart","vaadin:pie-chart","vaadin:piggy-bank-coin","vaadin:piggy-bank","vaadin:pill","vaadin:pills","vaadin:pin-post","vaadin:pin","vaadin:play-circle-o","vaadin:play-circle","vaadin:play","vaadin:plug","vaadin:plus-circle-o","vaadin:plus-circle","vaadin:plus-minus","vaadin:plus-square-o","vaadin:plus","vaadin:pointer","vaadin:power-off","vaadin:presentation","vaadin:print","vaadin:progressbar","vaadin:puzzle-piece","vaadin:pyramid-chart","vaadin:qrcode","vaadin:question-circle-o","vaadin:question-circle","vaadin:question","vaadin:quote-left","vaadin:quote-right","vaadin:random","vaadin:raster-lower-left","vaadin:raster","vaadin:records","vaadin:recycle","vaadin:refresh","vaadin:reply-all","vaadin:reply","vaadin:resize-h","vaadin:resize-v","vaadin:retweet","vaadin:rhombus","vaadin:road-branch","vaadin:road-branches","vaadin:road-split","vaadin:road","vaadin:rocket","vaadin:rotate-left","vaadin:rotate-right","vaadin:rss-square","vaadin:rss","vaadin:safe-lock","vaadin:safe","vaadin:scale-unbalance","vaadin:scale","vaadin:scatter-chart","vaadin:scissors","vaadin:screwdriver","vaadin:search-minus","vaadin:search-plus","vaadin:search","vaadin:select","vaadin:server","vaadin:share-square","vaadin:share","vaadin:shield","vaadin:shift-arrow","vaadin:shift","vaadin:shop","vaadin:sign-in-alt","vaadin:sign-in","vaadin:sign-out-alt","vaadin:sign-out","vaadin:signal","vaadin:sitemap","vaadin:slider","vaadin:sliders","vaadin:smiley-o","vaadin:sort","vaadin:sound-disable","vaadin:spark-line","vaadin:specialist","vaadin:spinner-arc","vaadin:spinner-third","vaadin:spinner","vaadin:spline-area-chart","vaadin:spline-chart","vaadin:split-h","vaadin:split-v","vaadin:split","vaadin:spoon","vaadin:square-shadow","vaadin:star-half-left-o","vaadin:star-half-left","vaadin:star-half-right-o","vaadin:star-half-right","vaadin:star-o","vaadin:star","vaadin:start-cog","vaadin:step-backward","vaadin:step-forward","vaadin:stethoscope","vaadin:stock","vaadin:stop-cog","vaadin:stop","vaadin:stopwatch","vaadin:storage","vaadin:strikethrough","vaadin:subscript","vaadin:suitcase","vaadin:sun-down","vaadin:sun-o","vaadin:sun-rise","vaadin:superscript","vaadin:sword","vaadin:tab-a","vaadin:tab","vaadin:table","vaadin:tablet","vaadin:tabs","vaadin:tag","vaadin:tags","vaadin:tasks","vaadin:taxi","vaadin:teeth","vaadin:terminal","vaadin:text-height","vaadin:text-input","vaadin:text-label","vaadin:text-width","vaadin:thin-square","vaadin:thumbs-down-o","vaadin:thumbs-down","vaadin:thumbs-up-o","vaadin:thumbs-up","vaadin:ticket","vaadin:time-backward","vaadin:time-forward","vaadin:timer","vaadin:toolbox","vaadin:tools","vaadin:tooth","vaadin:touch","vaadin:train","vaadin:trash","vaadin:tree-table","vaadin:trendind-down","vaadin:trending-down","vaadin:trending-up","vaadin:trophy","vaadin:truck","vaadin:twin-col-select","vaadin:twitter-square","vaadin:twitter","vaadin:umbrella","vaadin:underline","vaadin:unlink","vaadin:unlock","vaadin:upload-alt","vaadin:upload","vaadin:user-card","vaadin:user-check","vaadin:user-clock","vaadin:user-heart","vaadin:user-star","vaadin:user","vaadin:users","vaadin:vaadin-h","vaadin:vaadin-v","vaadin:viewport","vaadin:vimeo-square","vaadin:vimeo","vaadin:volume-down","vaadin:volume-off","vaadin:volume-up","vaadin:volume","vaadin:wallet","vaadin:warning","vaadin:workplace","vaadin:wrench","vaadin:youtube-square","vaadin:youtube"];var Np=Object.defineProperty,Fp=Object.getOwnPropertyDescriptor,Le=(e,t,a,s)=>{for(var i=s>1?void 0:s?Fp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Np(t,a,i),i};let ve=class extends S{constructor(){super(...arguments),this.component=void 0,this.field=void 0,this.baseUrl=void 0,this.state={},this.data={},this.appState={},this.appData={},this.colorPickerOpened=!1,this.colorPickerValue=void 0,this.comboData=[],this._comboFilter="",this.rendered=!1,this.renderColorPicker=()=>{const e=this.field?.fieldId,t=this.state&&e in this.state?this.state[e]:this.field?.initialValue;return o`
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
`,this.filteredIcons=[],this.navLinkOffset=null,this.iconFilterChanged=e=>{this.filteredIcons=$r.filter(t=>!e.detail.value||t.indexOf(e.detail.value)>=0)}}remoteComboDataProvider(e){return(t,a)=>{const{filter:s,page:i,pageSize:r}=t,n=s??"";this._comboFilter=n,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{searchText:s,fieldId:this.field?.fieldId,size:r,page:i,sort:void 0},callback:d=>{if(n===this._comboFilter)if(d?.messages?.forEach(c=>{pa.show(c.text,{position:c.position?this.mapPosition(c.position):void 0,theme:c.variant,duration:c.duration})}),!d.fragments||d.fragments.length==0)this.comboData=[],a([],0);else{const c=d.fragments[0].data?.[this.id];this.comboData=c?.content,a(c?.content,c?.totalElements)}},callbackonly:!0},bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.rendered=!1}renderNavLink(){const e=this.field?.link;if(!e?.href)return l;const t=Re(e.href,this.state,this.data)??e.href,a=Re(e.title,this.state,this.data)||t,s=e.icon||(t.startsWith("http")?"vaadin:external-link":"vaadin:link"),i=this.navLinkOffset??"calc(var(--lumo-font-size-s) * 1.6 + (var(--lumo-size-m) - var(--lumo-icon-size-s)) / 2)";return o`<a
                data-navlink
                href="${t}"
                title="${a}"
                target="${P(e.target||void 0)}"
                style="display: flex; align-items: center; color: var(--lumo-secondary-text-color); align-self: flex-start; margin-top: ${i};"
        ><vaadin-icon icon="${s}" style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"></vaadin-icon></a>`}positionNavLink(){const e=this.renderRoot?.querySelector("a[data-navlink]");e&&setTimeout(()=>{const t=e.parentElement,a=t?.firstElementChild?.firstElementChild;if(!t||!a)return;const i=(a.shadowRoot?.querySelector('[part="input-field"]')??a).getBoundingClientRect();if(i.height===0)return;const r=Math.max(0,i.top+i.height/2-e.offsetHeight/2-t.getBoundingClientRect().top),n=`${Math.round(r)}px`;this.navLinkOffset!==n&&(this.navLinkOffset=n)})}helperText(){return this.helperShownInControl=!0,de(this.field?.description??"",this.state,this.data)??""}render(){const e=this.field?.fieldId??"";this.rendered=!0;const t=this.renderNavLink();this.helperShownInControl=!1;const a=this.renderField(),s=this.field?.description&&!this.helperShownInControl?de(this.field.description,this.state,this.data):void 0;return o`<div style="display: block;">
            <div style="${t!==l?"display: flex; gap: var(--lumo-space-xs);":""}"><div style="flex: 1; min-width: 0;">${a}</div>${t}</div>
            ${s?o`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${s}</div>
            `:l}
            ${this.data.errors&&this.data.errors[e]&&this.data.errors[e].length>0?o`
                <div><ul>${this.data.errors[e].map(i=>o`<li>${i}</li>`)}</ul></div>
            `:l}
        </div>`}async firstUpdated(){this.filteredIcons=$r}update(e){e.has("component")&&(this.rendered=!1),super.update(e)}updated(e){super.updated(e),this.positionNavLink()}renderField(){const e=this.field?.fieldId??"",t=this.state&&e in this.state?this.state[e]:this.field?.initialValue,a=this.field?.label+"",s=Re(a,this.state,this.data),i=this.labelAlreadyRendered||!s||s=="null"?l:s;return this.field?.propertyRow?this.renderPropertyRowField(e,t,i,s):this.field?.stereotype=="badge"?this.renderBadgeField(e,t,i,s):this.field?.stereotype=="plainText"?this.renderPlainTextField(e,t,i,s):this.field?.stereotype=="bulletedList"?this.renderBulletedListField(e,t,i,s):this.field?.readOnly&&this.field.stereotype!="grid"&&this.field.dataType!="status"&&this.field?.dataType!="money"?this.renderReadOnlyField(e,t,i,s):this.field?.dataType=="file"?this.renderFileField(e,t,i,s):this.field?.dataType=="string"?this.renderStringField(e,t,i,s):this.field?.dataType=="number"?this.renderNumberField(e,t,i,s):this.field?.dataType=="integer"?this.renderIntegerField(e,t,i,s):this.field?.dataType=="bool"?this.renderBoolField(e,t,i,s):this.field?.dataType=="dateRange"?this.renderDateRangeField(e,t,i,s):this.field?.dataType=="date"?this.renderDateField(e,t,i,s):this.field?.dataType=="dateTime"?this.renderDateTimeField(e,t,i,s):this.field?.dataType=="time"?this.renderTimeField(e,t,i,s):this.field?.dataType=="array"?this.renderArrayField(e,t,i,s):this.field?.dataType=="money"?this.renderMoneyField(e,t,i,s):this.field?.dataType=="status"?this.renderStatusField(e,t,i,s):this.field?.dataType=="range"?this.renderRangeField(e,t,i,s):o`<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`}renderBadgeField(e,t,a,s){if(!this.field)return o``;const i=t===!0||t==="true";return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><span theme="badge ${i?"success":""} pill" style="${i?"":"opacity: 0.4;"}">${s}</span>
            </vaadin-custom-field>`}renderPropertyRowField(e,t,a,s){if(!this.field)return o``;let i=de(t,this.state,this.data);const r=i&&typeof i=="object"&&"value"in i?i:null;i&&i.value&&(i=i.value);const n=this.field?.dataType=="bool"||i===!0||i===!1,d=this.field?.dataType=="money",c=i!=null&&i!=="";let u=c?String(i):"—";if(d&&c){const f=typeof i=="number"?i:parseFloat(String(i));isNaN(f)||(u=r&&r.locale&&r.currency?new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(f):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(f))}const m=n?o`<vaadin-icon icon="${i===!0||i==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:o`<span style="font-weight: 500; text-align: right; word-break: break-word; margin-left: auto;${d?" font-variant-numeric: tabular-nums;":""}">${u}</span>`,h=s&&s!="null";return o`<div
                    id="${this.field.fieldId}"
                    data-colspan="${this.field?.colspan}"
                    style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; width: 100%; padding: 0.4rem 0; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); font-size: var(--lumo-font-size-s, .875rem); ${this.field?.style}"
            >${h?o`<span style="color: var(--lumo-secondary-text-color, #888); white-space: nowrap;">${s}</span>`:l}${m}</div>`}renderBulletedListField(e,t,a,s){if(!this.field)return o``;const i=de(t,this.state,this.data),r=Array.isArray(i)?i.map(n=>String(n)):i!=null&&i!==""?[String(i)]:[];return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><mateu-bulleted-list .items="${r}"></mateu-bulleted-list>
            </vaadin-custom-field>`}renderPlainTextField(e,t,a,s){if(!this.field)return o``;let i=de(t,this.state,this.data);const r=i&&typeof i=="object"&&"value"in i?i:null;i&&i.value&&(i=i.value);const n=this.field?.dataType=="bool"||i===!0||i===!1,d=this.field?.dataType=="money",c=i!=null&&i!=="";let u=c?String(i):"—";if(d&&c){const h=typeof i=="number"?i:parseFloat(String(i));isNaN(h)||(u=r&&r.locale&&r.currency?new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(h):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(h))}const m=n?o`<vaadin-icon icon="${i===!0||i==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:this.field?.multiline?o`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${u}</span>`:o`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${d?" font-variant-numeric: tabular-nums;":""}">${u}</span>`;return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    data-colspan="${this.field?.colspan}"
                    style="${d?"text-align: right; ":""}${this.field?.style}"
            >${m}</vaadin-custom-field>`}renderReadOnlyField(e,t,a,s){if(!this.field)return o``;let i=de(t,this.state,this.data)||this.data[e];if(i&&i.value&&(i=i.value),this.field.stereotype=="fileUpload")return o`<vaadin-custom-field
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
                ></vaadin-icon>`:l}</vaadin-text-field>
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
                            required="${this.field.required||l}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-horizontal-layout theme="spacing" style="--lumo-space-m: 0.33rem;">
                            <vaadin-text-field style="width: 4rem;" @change="${i}" value="${t}"></vaadin-text-field>
                            <vaadin-text-field readonly="" value="${this.data[this.field.fieldId+"-label"]}"></vaadin-text-field>
                            <vaadin-button theme="icon" @click="${r}"><vaadin-icon icon="lumo:search"></vaadin-icon></vaadin-button>
                        </vaadin-horizontal-layout>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="select"){if(this.field?.remoteCoordinates){const r=this.field.remoteCoordinates,n="";this.data[this.id]&&(this.data[this.id].searchSignature||n)&&this.data[this.id].searchSignature!=n&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:r.action,parameters:{searchText:n,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}));let d=t;return t&&t.value&&(d=t.value),o`
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
                `;if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates;let r;this.data[this.id]&&this.data[this.id].content&&(r=this.data[this.id].content.find(d=>d.value==t)),!r&&this.comboData&&(r=this.comboData.find(d=>d.value==t)),!r&&t&&(r={value:t,label:this.data[this.id+"-label"]??t});const n=this.remoteComboDataProvider(i.action);return o`
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
                            ?required="${this.field.required||l}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            @keyup="${d=>{if(d.key=="Backspace"){const c=d.currentTarget;c.inputElement.value||(c.value="")}}}"
                            ${ms(this.comboRenderer,[])}
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
                            ${ms(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
                        <vaadin-custom-field
                                label="${a}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${P(this.selectedIndex(t))}"
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
                            selected="${P(this.selectedIndex(t))}"
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
                `}if(this.field?.stereotype=="radio"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
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
                            ${Or(()=>o`
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
                            ${ms(this.iconComboboxRenderer,[])}
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
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${he(""+t)}</div></vaadin-custom-field>
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
                `;if(this.field?.stereotype=="fileUpload"){const i=co(this.field.attributes,"accept");return o`
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
  ${Ji(this.renderColorPicker,[])}
  ${zs(this.renderColorPickerFooter,[])}
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
`}renderNumberField(e,t,a,s){return this.field?o`<vaadin-number-field
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
                        ?required="${this.field.required||l}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step||l}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min!=null?this.field.min:l}"
                        max="${this.field.max!=null?this.field.max:l}"
                ></vaadin-integer-field>
            `}renderBoolField(e,t,a,s){return this.field?this.field.stereotype=="toggle"?o`
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
            `:o``}renderDateRangeField(e,t,a,s){if(!this.field)return o``;const i=t?t.from+";"+t.to:void 0;return o`<vcf-date-range-picker
                    id="${this.field.fieldId}"
                    label="${a}"
                    @value-changed="${r=>{r.detail.value&&(r.detail.value={from:r.detail.value.split(";")[0],to:r.detail.value.split(";")[1]}),this.valueChanged(r)}}"
                    value="${i}"
                    .helperText="${this.helperText()}"
                    ?autofocus="${this.field.wantsFocus}"
                    ?required="${this.field.required||l}"
                    data-colspan="${this.field.colspan}"
            ></vcf-date-range-picker>`}renderDateField(e,t,a,s){return this.field?o`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||l}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-picker>`:o``}renderDateTimeField(e,t,a,s){return this.field?o`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||l}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-time-picker>`:o``}renderTimeField(e,t,a,s){return this.field?o`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||l}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-time-picker>`:o``}renderArrayField(e,t,a,s){if(!this.field)return o``;if(this.field?.stereotype=="choice")return o`
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
`;if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
                        <vaadin-custom-field
                                label="${a}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box multiple
                                     .selectedValues="${P(this.selectedIndexes(t))}"
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
                                     .selectedValues="${P(this.selectedIndexes(t))}"
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
                    `}if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.rendered||setTimeout(()=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}),o`
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
                        ?required="${this.field.required||l}"
                        data-colspan="${this.field.colspan}"
            ></mateu-money-field>`}renderStatusField(e,t,a,s){if(!this.field)return o``;const i=t;return o`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||l}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    ${i?o`<span theme="badge pill ${Qi(i.type)}">${i.message}</span>`:o``}                    
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
                                   step="${this.field.step||l}"
                                   @change="${r=>{const n=r.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{from:n.startValue,to:n.endValue},fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"
                                   style="min-width: 10rem;"
                ></ui5-range-slider></vaadin-custom-field>
            `}};ve.styles=C`
        ${ea}

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
  `;Le([p()],ve.prototype,"component",2);Le([p()],ve.prototype,"field",2);Le([p()],ve.prototype,"baseUrl",2);Le([p()],ve.prototype,"state",2);Le([p()],ve.prototype,"data",2);Le([p()],ve.prototype,"appState",2);Le([p()],ve.prototype,"appData",2);Le([p()],ve.prototype,"labelAlreadyRendered",2);Le([$()],ve.prototype,"colorPickerOpened",2);Le([$()],ve.prototype,"colorPickerValue",2);Le([$()],ve.prototype,"filteredIcons",2);Le([$()],ve.prototype,"navLinkOffset",2);ve=Le([k("mateu-field")],ve);var Bt=(e=>(e.OnLoad="OnLoad",e.OnSuccess="OnSuccess",e.OnError="OnError",e.OnValueChange="OnValueChange",e.OnCustomEvent="OnCustomEvent",e.AutoSave="AutoSave",e))(Bt||{}),Mp=Object.defineProperty,os=(e,t,a,s)=>{for(var i=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=n(t,a,i)||i);return i&&Mp(t,a,i),i};class la extends xi{constructor(){super(...arguments),this.state={},this.data={},this.appData={},this.appState={},this.triggerOnLoad=()=>{const t=this.component;this.registerCustomEventListeners(),t.triggers?.filter(a=>a.type==Bt.OnLoad).forEach(a=>{if((!a.condition||this._evalExpr(a.condition))&&!a.triggered){const i=a;i.triggered=!0;var s=i.times-1;i.timeoutMillis>0?this.scheduleOnload(i,s,this.id):this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(t,a,s)=>{if(s!=this.component?.id)return;const i=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,callbackToken:i},bubbles:!0,composed:!0}))},t.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=t=>{if(!(t instanceof CustomEvent))return;const a=t,i=(this.component.triggers??[]).filter(r=>r.type==Bt.OnCustomEvent).filter(r=>r.eventName==a.type).filter(r=>r.source!=="COMPONENT"||a.detail?.__source===r.from);i.length!==0&&(i.some(r=>!r.source||r.source==="SELF")&&(t.stopPropagation(),t.preventDefault()),i.forEach(r=>{(!r.condition||this._evalExpr(r.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,parameters:a.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(t){return jr(t,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(t){return En(t,this.state??{},this.data??{},this._interpolationExtra())}applyFragment(t){if(this.id==t.targetComponentId){if(t.component)if(pi.Add==t.action)this.component&&this.component.children?.push(t.component);else{if(this.callbackToken=ke(),t.component?.type==oe.ServerSide)if(this.component){const s=this.component,i=t.component;s.actions=i.actions,s.type=i.type,s.rules=i.rules,s.triggers=i.triggers,s.serverSideType=i.serverSideType,s.route=i.route,s.initialData=i.initialData,s.validations=i.validations,s.cssClasses=i.cssClasses,s.slot=i.slot,s.style=i.style,s.children=i.children,(s.serverSideType!=i.serverSideType||s.id!=i.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=t.component,setTimeout(()=>this.triggerOnLoad());else{const s=[t.component];this.component&&(this.component.children=s)}t.action!==pi.ReplaceKeepData&&(this.state={},this.data={})}if(t.state&&(this.state={...this.state,...t.state}),t.data){for(const s in t.data){const i=t.data[s]?.page;i?.pageNumber>0&&this.data[s]&&this.data[s].page.content&&(i.content?i.content=[...this.data[s].page.content,...i.content]:i.content=[...this.data[s].page.content])}this.data={...this.data,...t.data}}this.registerCustomEventListeners();const a=Z.getAfterRenderHook();a&&setTimeout(()=>a(this)),this.requestUpdate()}}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:a,name:s})=>a.removeEventListener(s,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(a=>a.type==Bt.OnCustomEvent).forEach(a=>{const s=a.source==="DOCUMENT"||a.source==="COMPONENT"?document:this;s.addEventListener(a.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:s,name:a.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:t,name:a})=>t.removeEventListener(a,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}}os([p()],la.prototype,"state");os([p()],la.prototype,"data");os([p()],la.prototype,"appData");os([p()],la.prototype,"appState");const ko="mateu-recent-routes",qp=8;function Co(){try{return JSON.parse(localStorage.getItem(ko)??"{}")}catch{return{}}}function Up(e){try{localStorage.setItem(ko,JSON.stringify(e))}catch{}}function yr(e){return Co()[e||"_"]??[]}function Bp(e,t){if(!t?.route||!t.label)return;const a=e||"_",s=Co(),r=(s[a]??[]).filter(n=>n.route!==t.route);r.unshift({route:t.route,label:t.label}),s[a]=r.slice(0,qp),Up(s)}var Vp=Object.defineProperty,Hp=Object.getOwnPropertyDescriptor,yt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Hp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Vp(t,a,i),i};let Me=class extends S{constructor(){super(...arguments),this.baseUrl="",this.open=!1,this.queryText="",this.dataHits=[],this.loading=!1,this.selectedIndex=0,this.fabOffset=0,this.keydownHandler=null}connectedCallback(){super.connectedCallback(),this.keydownHandler=e=>{(e.metaKey||e.ctrlKey)&&(e.key==="k"||e.key==="K")?(e.preventDefault(),this.toggle()):e.key==="Escape"&&this.open&&this.close()},document.addEventListener("keydown",this.keydownHandler),this.setupFabObserver()}disconnectedCallback(){super.disconnectedCallback(),this.keydownHandler&&document.removeEventListener("keydown",this.keydownHandler),clearTimeout(this.searchTimer),this.fabObserver?.disconnect(),this.fabObserver=void 0}setupFabObserver(){const e=this.getRootNode(),t=e instanceof ShadowRoot?e:document.body;this.measureFabStack(),this.fabObserver?.disconnect(),this.fabObserver=new MutationObserver(()=>this.measureFabStack()),this.fabObserver.observe(t,{childList:!0,subtree:!0})}measureFabStack(){const a=(this.getRootNode().querySelectorAll?.(".ai-fab, .app-fab, .page-fab").length??0)*4;a!==this.fabOffset&&(this.fabOffset=a)}updated(e){e.has("open")&&this.open&&requestAnimationFrame(()=>this.inputEl?.focus())}toggle(){this.open?this.close():this.openCenter()}openCenter(){this.open=!0,this.queryText="",this.dataHits=[],this.selectedIndex=0}close(){this.open=!1,this.queryText="",this.dataHits=[],clearTimeout(this.searchTimer)}flattenMenu(e,t){const a=[];for(const s of e??[])if(!s.separator)if(s.submenus&&s.submenus.length>0){const i=t?`${t} › ${s.label}`:s.label;a.push(...this.flattenMenu(s.submenus,i))}else s.route!==void 0&&s.route!==null&&a.push({label:s.label,breadcrumb:t,route:s.route});return a}onInput(e){this.queryText=e,this.selectedIndex=0;const t=e.trim();if(clearTimeout(this.searchTimer),!t||!this.app?.globalSearchEnabled){this.dataHits=[],this.loading=!1;return}this.loading=!0,this.searchTimer=setTimeout(()=>this.fetchGlobalSearch(t),250)}async fetchGlobalSearch(e){const t=this.app;if(!t?.globalSearchEnabled){this.loading=!1;return}try{const s=(await oa.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","command-center",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(i=>i.data).find(i=>i&&i._globalsearch);this.dataHits=s?._globalsearch??[]}catch{this.dataHits=[]}finally{this.loading=!1}}navigateTo(e,t){Bp(this.app?.serverSideType??"",{route:e,label:t}),this.close();for(const a of["route-changed","navigate-to-requested"])this.dispatchEvent(new CustomEvent(a,{detail:{route:e},bubbles:!0,composed:!0}))}askAi(){const e=this.queryText.trim();this.close(),this.dispatchEvent(new CustomEvent("mateu-open-ai",{detail:{query:e},bubbles:!0,composed:!0}))}visibleTargets(e){if(!this.queryText.trim()){const t=this.flattenMenu(this.app?.menu,"").map(s=>({route:s.route,label:s.label})),a=yr(this.app?.serverSideType??"");return[...t,...a]}return[...e.map(t=>({route:t.route,label:t.label})),...this.dataHits.map(t=>({route:t.route,label:t.label}))]}onKeydown(e,t){if(e.key==="ArrowDown")e.preventDefault(),this.selectedIndex=Math.min(this.selectedIndex+1,t.length-1);else if(e.key==="ArrowUp")e.preventDefault(),this.selectedIndex=Math.max(this.selectedIndex-1,0);else if(e.key==="Enter"){const a=t[this.selectedIndex];a&&this.navigateTo(a.route,a.label)}}render(){return o`
            <button class="cc-fab" style="bottom: ${1.5+this.fabOffset}rem;"
                @click=${()=>this.openCenter()} title="Buscar y navegar (⌘K)" aria-label="Command center">
                ${this.fabIcon()}
            </button>
            ${this.open?this.renderOverlay():l}
        `}fabIcon(){return o`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>`}renderOverlay(){const e=this.queryText.trim().toLowerCase(),t=e?this.flattenMenu(this.app?.menu,"").filter(s=>s.label.toLowerCase().includes(e)||s.breadcrumb.toLowerCase().includes(e)):[],a=this.visibleTargets(t);return o`
            <div class="cc-backdrop" @click=${()=>this.close()}>
                <div class="cc-panel" @click=${s=>s.stopPropagation()}>
                    <div class="cc-bar">
                        <button class="cc-icon-btn" @click=${()=>this.queryText?this.onInput(""):this.close()} title="${this.queryText?"Borrar":"Cerrar"}">
                            ${this.queryText?this.backIcon():this.searchGlyph()}
                        </button>
                        <input class="cc-input" .value=${this.queryText} placeholder="Buscar pantallas, datos y acciones…"
                            @input=${s=>this.onInput(s.target.value)}
                            @keydown=${s=>this.onKeydown(s,a)}>
                        ${this.queryText?o`<button class="cc-icon-btn" @click=${()=>this.onInput("")} title="Limpiar">${this.clearIcon()}</button>`:l}
                    </div>
                    <div class="cc-body">
                        ${e?this.renderResults(t):this.renderDefault()}
                    </div>
                </div>
                <button class="cc-close" @click=${()=>this.close()} title="Cerrar">${this.clearIcon()}</button>
            </div>
        `}renderDefault(){const e=this.flattenMenu(this.app?.menu,""),t=yr(this.app?.serverSideType??"");let a=-1;return o`
            <div class="cc-columns">
                <div class="cc-col">
                    <div class="cc-section-title">Ir a</div>
                    <div class="cc-tiles">
                        ${e.map(s=>{a++;const i=a;return o`
                            <button class="cc-tile ${i===this.selectedIndex?"cc-sel":""}"
                                @click=${()=>this.navigateTo(s.route,s.label)}
                                @mouseenter=${()=>{this.selectedIndex=i}}>
                                <span class="cc-tile-label">${s.label}</span>
                                ${s.breadcrumb?o`<span class="cc-sub">${s.breadcrumb}</span>`:l}
                            </button>`})}
                        ${e.length===0?o`<div class="cc-empty">Sin opciones de menú.</div>`:l}
                    </div>
                </div>
                ${t.length>0?o`
                    <div class="cc-col cc-col--recent">
                        <div class="cc-section-title">Recientes</div>
                        ${t.map(s=>{a++;const i=a;return o`
                            <button class="cc-row ${i===this.selectedIndex?"cc-sel":""}"
                                @click=${()=>this.navigateTo(s.route,s.label)}
                                @mouseenter=${()=>{this.selectedIndex=i}}>
                                <span class="cc-tile-label">${s.label}</span>
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
                ${e.map((a,s)=>o`
                    <button class="cc-row ${s===this.selectedIndex?"cc-sel":""}"
                        @click=${()=>this.navigateTo(a.route,a.label)}
                        @mouseenter=${()=>{this.selectedIndex=s}}>
                        <span class="cc-tile-label">${a.label}</span>
                        ${a.breadcrumb?o`<span class="cc-sub">${a.breadcrumb}</span>`:l}
                    </button>`)}
                ${this.renderDataHits(e.length)}
                ${t?o`<div class="cc-empty">No encontramos coincidencias para “${this.queryText.trim()}”.</div>`:l}
            </div>
        `}renderDataHits(e){if(this.dataHits.length===0)return l;let t;return o`${this.dataHits.map((a,s)=>{const i=e+s,r=a.category&&a.category!==t;return t=a.category,o`
                ${r?o`<div class="cc-section-title">${a.category}</div>`:l}
                <button class="cc-row ${i===this.selectedIndex?"cc-sel":""}"
                    @click=${()=>this.navigateTo(a.route,a.label)}
                    @mouseenter=${()=>{this.selectedIndex=i}}>
                    <span class="cc-tile-label">${a.label}</span>
                    ${a.description?o`<span class="cc-sub">${a.description}</span>`:l}
                </button>`})}`}searchGlyph(){return o`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`}backIcon(){return o`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`}clearIcon(){return o`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`}aiIcon(){return o`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l1.9 4.7L19 8.5l-4.1 2.3L12 15l-1.9-4.2L6 8.5l5.1-1.8z"></path></svg>`}};Me.styles=C`
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
    `;yt([p({attribute:!1})],Me.prototype,"app",2);yt([p()],Me.prototype,"baseUrl",2);yt([$()],Me.prototype,"open",2);yt([$()],Me.prototype,"queryText",2);yt([$()],Me.prototype,"dataHits",2);yt([$()],Me.prototype,"loading",2);yt([$()],Me.prototype,"selectedIndex",2);yt([$()],Me.prototype,"fabOffset",2);yt([Be(".cc-input")],Me.prototype,"inputEl",2);Me=yt([k("mateu-command-center")],Me);let nt=null;function Wp(e){const t=e.component?.metadata;!!(t&&(t.commandCenterEnabled||t.chromeless)&&t.variant!=="MEDIATOR")?((!nt||!nt.isConnected)&&(nt=document.createElement("mateu-command-center"),e.renderRoot.appendChild(nt)),nt.app=t,nt.baseUrl=e.baseUrl??""):nt&&e.renderRoot.contains(nt)&&(nt.remove(),nt=null)}const Gp={lon:0,lat:0},xr=3,Kp=e=>{if(!e)return;const t=e.split(",").map(i=>i.trim());if(t.length!==2)return;const a=Number(t[0]),s=Number(t[1]);if(!(t[0]===""||t[1]===""||!Number.isFinite(a)||!Number.isFinite(s)))return{lon:s,lat:a}},Yp=e=>{if(e==null||e.trim()==="")return xr;const t=Number(e);return Number.isFinite(t)?t:xr};var Jp=Object.defineProperty,Xp=Object.getOwnPropertyDescriptor,ns=(e,t,a,s)=>{for(var i=s>1?void 0:s?Xp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Jp(t,a,i),i};let Da=class extends S{constructor(){super(...arguments),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){const e=++this.renderSeq,[{default:t},{default:a},{default:s},{default:i},{fromLonLat:r},{default:n}]=await Promise.all([Oe(()=>import("./vendor-ol.js").then(c=>c.M),[]),Oe(()=>import("./vendor-ol.js").then(c=>c.V),[]),Oe(()=>import("./vendor-ol.js").then(c=>c.T),[]),Oe(()=>import("./vendor-ol.js").then(c=>c.O),[]),Oe(()=>import("./vendor-ol.js").then(c=>c.p),[]),Oe(()=>import("./vendor-ol.js").then(c=>c.o),[])]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector("style[data-ol]")){const c=document.createElement("style");c.setAttribute("data-ol",""),c.textContent=n,this.shadowRoot.appendChild(c)}this.map&&(this.map.setTarget(void 0),this.map=void 0);const d=Kp(this.position)??Gp;this.map=new t({target:this.mapElement,layers:[new s({source:new i})],view:new a({center:r([d.lon,d.lat]),zoom:Yp(this.zoom)})})}render(){return o`<div id="map"></div>`}};Da.styles=C`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `;ns([p()],Da.prototype,"position",2);ns([p()],Da.prototype,"zoom",2);ns([Be("#map")],Da.prototype,"mapElement",2);Da=ns([k("mateu-map")],Da);const Qp=typeof HTMLElement<"u"?HTMLElement:class{};class Zp extends Qp{static get observedAttributes(){return["content"]}#e;#t=0;get content(){return this.#e}set content(t){this.#e=t,this.#a()}attributeChangedCallback(t,a,s){this.content=s??void 0}connectedCallback(){this.style.display="block",this.#a()}async#a(){if(!this.isConnected)return;const t=this.#e??"",a=++this.#t,[{marked:s},{default:i}]=await Promise.all([Oe(()=>import("./vendor.js").then(r=>r.f),[]),Oe(()=>import("./vendor.js").then(r=>r.c),[])]);a===this.#t&&(this.innerHTML=i.sanitize(await s.parse(t),{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:r=>!0}}))}}typeof customElements<"u"&&!customElements.get("mateu-markdown")&&customElements.define("mateu-markdown",Zp);var eh=Object.defineProperty,th=Object.getOwnPropertyDescriptor,Ta=(e,t,a,s)=>{for(var i=s>1?void 0:s?th(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&eh(t,a,i),i};const ah=e=>{const t=[];return e.color&&e.color!=="normal"&&e.color!=="none"&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle==="tertiaryInline"?"tertiary-inline":e.buttonStyle),e.size&&e.size!=="none"&&e.size!=="normal"&&t.push(e.size),t.length?t.join(" "):void 0},wr=e=>e==="back"||e==="backToList"||!!e&&e.startsWith("cancel");let Ot=class extends S{constructor(){super(...arguments),this.appState={},this.appData={},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.evalLabel=e=>Re(e,this.state,this.data),this.renderBtn=e=>{if((this.data??{})[e.actionId+".hidden"])return l;const t=this.evalLabel(e.label),a=Z.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e.actionId));return a||o`
        <vaadin-button
                data-action-id="${e.id}"
                theme="${ah(e)||l}"
                @click="${()=>this.handleButtonClick(e.actionId)}"
                ?disabled="${e.disabled}"
        >${e.iconOnLeft?o`<vaadin-icon icon="${e.iconOnLeft}"></vaadin-icon>`:l}${t}${e.iconOnRight?o`<vaadin-icon icon="${e.iconOnRight}"></vaadin-icon>`:l}</vaadin-button>
    `},this.renderPeerNav=e=>{const t=Z.get()?.renderPeerNav?.(e);return t||o`
            <div style="display: flex; gap: var(--lumo-space-xs, .25rem); align-items: center;" class="peer-nav">
                <vaadin-button theme="tertiary icon" class="peer-nav-prev"
                        title="${e.prevLabel??"Previous"}"
                        ?disabled="${!e.prevRoute}"
                        @click="${()=>{e.prevRoute&&(window.location.href=e.prevRoute)}}">
                    <vaadin-icon icon="vaadin:angle-left"></vaadin-icon>
                </vaadin-button>
                <vaadin-button theme="tertiary icon" class="peer-nav-next"
                        title="${e.nextLabel??"Next"}"
                        ?disabled="${!e.nextRoute}"
                        @click="${()=>{e.nextRoute&&(window.location.href=e.nextRoute)}}">
                    <vaadin-icon icon="vaadin:angle-right"></vaadin-icon>
                </vaadin-button>
            </div>
        `}}render(){const e=this.metadata;if(!e)return o``;const t=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0,a=e.toolbar??[],s=a.filter(c=>wr(c.actionId)),i=a.filter(c=>!wr(c.actionId)),r=s.length>0&&i.length>0?o`<span class="toolbar-divider"></span>`:l,n=e.avatar||e.title||e.subtitle||e.kpis?.length>0||e.header?.length>0||a.length>0||!!t,d=e.level??0;return d>0?this.setAttribute("data-nested",""):this.removeAttribute("data-nested"),o`
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
                    ${e?.header?.map(c=>w(this,c,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${t?this.renderPeerNav(t):l}
                    ${s.map(this.renderBtn)}
                    ${r}
                    ${i.map(this.renderBtn)}
                </div>
            `:n?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="form-header">
                    ${e.avatar?w(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):l}
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        ${e?.title&&d==0?o`<h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${he(ct(e?.title,this.state??{},this.data??{}))}</h2>`:l}
                        ${e?.title&&d==1?o`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${he(ct(e?.title,this.state??{},this.data??{}))}</h3>`:l}
                        ${e?.title&&d==2?o`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${he(ct(e?.title,this.state??{},this.data??{}))}</h4>`:l}
                        ${e?.title&&d==3?o`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${he(ct(e?.title,this.state??{},this.data??{}))}</h5>`:l}
                        ${e?.title&&d>3?o`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${he(ct(e?.title,this.state??{},this.data??{}))}</h6>`:l}

                        ${e?.subtitle?o`<span style="display: inline-block; margin-block-end: 0.83em;">${he(ct(e?.subtitle,this.state??{},this.data??{}))}</span>`:l}
                        ${e?.timestamp?o`<span class="page-timestamp" style="display: block; color: var(--lumo-secondary-text-color, #6b7280); font-size: var(--lumo-font-size-s, .875rem);">${he(ct(e.timestamp,this.state??{},this.data??{}))}</span>`:l}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${e?.kpis?.map(c=>o`
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div>${this.evalLabel(c.title)}</div>
                                <div>${he(ct(c.text,this.state??{},this.data??{}))}</div>
                            </div>
                        `)}
                        ${e?.header?.map(c=>w(this,c,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${t?this.renderPeerNav(t):l}
                        ${s.map(this.renderBtn)}
                        ${r}
                        ${i.map(this.renderBtn)}
                    </div>
                </div>
            `:l}
            ${e.badges&&e.badges.length>0?o`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${e.badges.map(c=>hl(c,this.state??{},this.data??{}))}
                </div>
            `:l}
        `}};Ot.styles=C`
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

        ${ea}
    `;Ta([p()],Ot.prototype,"metadata",2);Ta([p()],Ot.prototype,"baseUrl",2);Ta([p()],Ot.prototype,"state",2);Ta([p()],Ot.prototype,"data",2);Ta([p()],Ot.prototype,"appState",2);Ta([p()],Ot.prototype,"appData",2);Ot=Ta([k("mateu-content-header")],Ot);var ih=Object.defineProperty,sh=Object.getOwnPropertyDescriptor,wi=(e,t,a,s)=>{for(var i=s>1?void 0:s?sh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&ih(t,a,i),i};let ga=class extends xi{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={}}render(){const e=this.component?.metadata;return o`
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
       `}};ga.styles=C`
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
    `;wi([p()],ga.prototype,"state",2);wi([p()],ga.prototype,"data",2);wi([p()],ga.prototype,"appState",2);wi([p()],ga.prototype,"appData",2);ga=wi([k("mateu-form")],ga);var rh=Object.defineProperty,oh=Object.getOwnPropertyDescriptor,rt=(e,t,a,s)=>{for(var i=s>1?void 0:s?oh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&rh(t,a,i),i};let ze=class extends S{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.pagesRequested=[],this.emptyArray=e=>!e||e.length==0,this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;if(this.metadata?.infiniteScrolling&&e.page>0){let s=!1;a&&a.content&&(a.content.length>=(e.page+1)*e.pageSize||a.content.length==a.totalElements)&&(t(a.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),a.totalElements),s=!0,this.grid&&this.grid.recalculateColumnWidths()),s||this.pagesRequested.find(i=>i==e.page)||(this.pagesRequested.push(e.page),this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:e,callback:()=>{this.data[this.id]?.page?.content&&(t(this.data[this.id].page.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),this.data[this.id].page.totalElements),this.grid&&this.grid.recalculateColumnWidths())}},bubbles:!0,composed:!0})))}else{const s=this.metadata?.infiniteScrolling?a?.totalElements:a?.content?.length??0;t(a?.content??[],s),this.grid&&this.grid.recalculateColumnWidths()}},this._onActionRequested=e=>{const t=e.detail,a=this.identifierFieldName;if(!a||!t.parameters||t.actionId?.startsWith("action-on-row-"))return;const s=t.parameters[a];s!==void 0&&(this.state._selectedId=String(s),this._applyCellPartNameGenerator(),this.grid?.requestContentUpdate())},this.tooltipGenerator=e=>{let t="";const{column:a,item:s}=e,i=this.metadata?.columns?.find(r=>r.metadata.id==a?.path);if(i?.metadata){const r=(i?.metadata).tooltipPath;r&&a&&s&&(t=s[r])}return t}}get identifierFieldName(){const e=this.metadata?.columns?.find(a=>a.metadata?.identifier);if(e)return e.metadata?.id;if(this.metadata?.columns?.find(a=>a.metadata?.id==="id"))return"id"}_applyCellPartNameGenerator(){if(!this.grid)return;const e=this.identifierFieldName,t=this.state?._selectedId??this.appState?._splitDetailId,a=!!this.metadata?.groupBy;e&&t!==void 0||a?this.grid.cellPartNameGenerator=(s,i)=>{const r=i.item;return ai(r)?"mateu-group-row":e&&t!==void 0&&String(r[e])===String(t)?"selected-row":""}:this.grid.cellPartNameGenerator=null}connectedCallback(){super.connectedCallback(),this.addEventListener("action-requested",this._onActionRequested)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("action-requested",this._onActionRequested)}updated(e){super.updated(e),this._applyCellPartNameGenerator(),this.grid?.clearCache(),this.grid?.requestContentUpdate(),this.grid?.recalculateColumnWidths(),this.pagesRequested=[]}render(){const e=this.data[this.id],t=e?.page,a=this.metadata?.groupBy,s=this.metadata?.infiniteScrolling?void 0:t?.content?Lr(t.content,a,e?.groups):t?.content,i=(this.metadata?.columns??[]).flatMap(c=>c.metadata?.type===v.GridGroupColumn?(c.metadata.columns??[]).map(u=>u.metadata):[c.metadata]),r=Mr(i,e,a);let n="";this.metadata?.wrapCellContent&&(n+=" wrap-cell-content"),this.metadata?.compact&&(n+=" compact"),this.metadata?.noBorder&&(n+=" no-border"),this.metadata?.noRowBorder&&(n+=" no-row-borders"),this.metadata?.columnBorders&&(n+=" column-borders"),this.metadata?.rowStripes&&(n+=" row-stripes");const d=this.state[this.id+"_selected_items"]||[];return o`
            <vaadin-grid
                    .items="${s}"
                    item-id-path="_rowNumber"
                    .selectedItems="${d}"
                    ?data-clickable-rows="${this.metadata?.detailPath&&!this.metadata?.useButtonForDetail}"
                    ?all-rows-visible="${this.metadata?.allRowsVisible}"
                    column-rendering="${this.metadata?.lazyColumnRendering?"lazy":l}"
                    ?column-reordering-allowed="${this.metadata?.columnReorderingAllowed}"
                    .dataProvider="${this.metadata?.infiniteScrolling?this.dataProvider:void 0}"
                    page-size="${this.metadata?.pageSize}"
                    multi-sort-on-shift-click
                    @selected-items-changed="${c=>{const u=(c.detail.value??[]).filter(m=>!ai(m));this.emptyArray(this.state[this.id+"_selected_items"])&&this.emptyArray(u)||(this.state[this.id+"_selected_items"]=u,this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0})))}}"
                    @active-item-changed="${P(this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?c=>{if(this.metadata?.detailPath){const u=c.detail.value;if(u&&ai(u))return;u?this.detailsOpenedItems=[u]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${P(this.metadata?.detailPath?Rr(c=>o`${w(this,c[this.metadata?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    theme="${n}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?o`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:l}
                ${this.metadata?.columns?.map(c=>js(c,this,this.baseUrl,this.state,this.data,this.appState,this.appData,r))}
                ${this.metadata?.useButtonForDetail?o`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${Et((c,{detailsOpened:u})=>o`
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
                <span slot="empty-state">${ua(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(c=>c.metadata.tooltipPath)?o`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:l}
            </vaadin-grid>
            <slot></slot>
       `}};ze.styles=C`
        ${ea}
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
  `;rt([p()],ze.prototype,"id",2);rt([p()],ze.prototype,"metadata",2);rt([p()],ze.prototype,"baseUrl",2);rt([p()],ze.prototype,"state",2);rt([p()],ze.prototype,"data",2);rt([p()],ze.prototype,"appState",2);rt([p()],ze.prototype,"appData",2);rt([p()],ze.prototype,"emptyStateMessage",2);rt([$()],ze.prototype,"detailsOpenedItems",2);rt([Be("vaadin-grid")],ze.prototype,"grid",2);ze=rt([k("mateu-table")],ze);const So="mateu-saved-views",ls=()=>{try{return JSON.parse(localStorage.getItem(So)??"{}")}catch{return{}}},Ks=e=>{try{localStorage.setItem(So,JSON.stringify(e))}catch{}},Wi=e=>ls()[e]??[],Io=(e,t)=>{const a=t.name?.trim();if(!a||Object.keys(t.values??{}).length===0)return;const s=ls(),i=(s[e]??[]).filter(r=>r.name!==a);i.push({...t,name:a}),s[e]=i,Ks(s)},_o=(e,t)=>{const a=ls(),s=(a[e]??[]).filter(i=>i.name!==t);s.length===0?delete a[e]:a[e]=s,Ks(a)},Eo=(e,t)=>{const a=ls();a[e]=(a[e]??[]).map(s=>({...s,isDefault:s.name===t?!s.isDefault:!1})),Ks(a)},To=e=>Wi(e).find(t=>t.isDefault);var nh=Object.defineProperty,lh=Object.getOwnPropertyDescriptor,We=(e,t,a,s)=>{for(var i=s>1?void 0:s?lh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&nh(t,a,i),i};let Se=class extends S{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.panelOpened=!1,this.viewsOpened=!1,this.draftText="",this.openPanel=()=>{this.panelOpened||this.filters.length===0||(this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1,this.activeFilter=void 0},this.clearAllFilters=()=>{const e=this.filters.flatMap(a=>this.isRangeFilter(a)?[`${a.fieldId}_from`,`${a.fieldId}_to`]:[a.fieldId]),t={searchText:void 0};e.forEach(a=>{t[a]=void 0}),this.state={...this.state,...t},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:e},bubbles:!0,composed:!0})),this.requestSearch()},this.keepFocus=e=>e.preventDefault()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get filters(){return this.metadata?.filters??[]}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}requestSearch(){this.closePanel(),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))}emitValueChanged(e,t){this.state={...this.state,[e]:t},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:e},bubbles:!0,composed:!0}))}applyFilter(e,t){this.emitValueChanged(e,t),this.requestSearch()}removeChip(e){const t=this.filters.find(a=>a.fieldId===e);t&&this.isRangeFilter(t)?(this.emitValueChanged(`${e}_from`,void 0),this.emitValueChanged(`${e}_to`,void 0)):this.emitValueChanged(e,e==="searchText"?"":void 0),this.requestSearch()}commitText(e){this.emitValueChanged("searchText",e.value),this.draftText="",e.value="",this.requestSearch()}get viewsScope(){return window.location.pathname}allFilterKeys(){return["searchText",...this.filters.flatMap(e=>this.isRangeFilter(e)?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId])]}snapshotValues(){const e={};return this.state.searchText&&(e.searchText=this.state.searchText),this.filters.forEach(t=>{if(this.isSet(t))if(this.isRangeFilter(t)){const a=this.rangeBound(t,"from"),s=this.rangeBound(t,"to");a&&(e[`${t.fieldId}_from`]=a),s&&(e[`${t.fieldId}_to`]=s)}else this.isMultiFilter(t)?e[t.fieldId]=this.multiValues(t):e[t.fieldId]=this.state[t.fieldId]}),e}applyView(e){const t=this.allFilterKeys(),a={};t.forEach(s=>{a[s]=void 0}),this.state={...this.state,...a},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:t},bubbles:!0,composed:!0})),Object.entries(e.values).forEach(([s,i])=>this.emitValueChanged(s,i)),this.viewsOpened=!1,this.detachOutsideClick(),this.requestSearch()}saveCurrentView(e){const t=e.value.trim();t&&(Io(this.viewsScope,{name:t,values:this.snapshotValues()}),e.value="",this.requestUpdate())}firstUpdated(){if(window.location.search)return;const e=To(this.viewsScope);e&&setTimeout(()=>{this.state.searchText||this.filters.some(a=>this.isSet(a))||this.applyView(e)},0)}isBooleanFilter(e){return e.dataType==="boolean"||e.dataType==="bool"||e.stereotype==="checkbox"||e.stereotype==="toggle"}isNumericFilter(e){return["integer","decimal","number","money"].includes(e.dataType??"")}isRangeFilter(e){return e.stereotype==="dateRange"||e.stereotype==="numberRange"}isMultiFilter(e){return e.stereotype==="multiSelect"}hasOptions(e){return(e.options?.length??0)>0}multiValues(e){const t=this.state[e.fieldId];return Array.isArray(t)?t.map(String):typeof t=="string"&&t!==""?t.split(",").map(a=>a.trim()).filter(a=>a):[]}rangeBound(e,t){const a=this.state[`${e.fieldId}_${t}`];return a==null?"":String(a)}isSet(e){if(this.isRangeFilter(e))return this.rangeBound(e,"from")!==""||this.rangeBound(e,"to")!=="";if(this.isMultiFilter(e))return this.multiValues(e).length>0;const t=this.state[e.fieldId];return t!=null&&t!==""&&!Number.isNaN(t)}getFilterDisplayValue(e,t){if(e.options?.length){const a=e.options.find(s=>s.value===String(t));if(a)return a.label??a.value}return typeof t=="boolean"?t?"Yes":"No":String(t)}conditionDisplay(e){if(this.isRangeFilter(e)){const t=this.rangeBound(e,"from"),a=this.rangeBound(e,"to");return t&&a?`${t} – ${a}`:t?`≥ ${t}`:`≤ ${a}`}return this.isMultiFilter(e)?this.multiValues(e).map(t=>this.getFilterDisplayValue(e,t)).join(", "):this.getFilterDisplayValue(e,this.state[e.fieldId])}labelOf(e){return Re(e.label,this.state,this.data)||e.fieldId}panelRow(e,t,a="panel-row"){return o`
            <div class="${a}" @mousedown="${this.keepFocus}" @click="${t}">${e}</div>`}renderRangeWidget(e){const t=e.stereotype==="numberRange"?"number":e.dataType==="dateTime"?"datetime-local":e.dataType==="time"?"time":"date",a=i=>{const r=i.closest(".panel-input-row"),n=r.querySelector("input.range-from").value,d=r.querySelector("input.range-to").value;this.emitValueChanged(`${e.fieldId}_from`,n===""?void 0:n),this.emitValueChanged(`${e.fieldId}_to`,d===""?void 0:d),this.requestSearch()},s=i=>{i.key==="Enter"&&a(i.target),i.key==="Escape"&&this.closePanel()};return o`
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
            </div>`}renderViewsPanel(){if(!this.viewsOpened)return l;const e=Wi(this.viewsScope),t=!!this.state.searchText||this.filters.some(a=>this.isSet(a));return o`
            <div class="panel views-panel">
                <div class="panel-caption">Saved views</div>
                ${e.length===0?o`
                    <div class="panel-row views-empty">No saved views yet</div>`:l}
                ${e.map(a=>o`
                    <div class="panel-row view-row" @mousedown="${this.keepFocus}">
                        <span class="view-name" @click="${()=>this.applyView(a)}">${a.name}</span>
                        <button class="view-star ${a.isDefault?"view-star--on":""}"
                                title="${a.isDefault?"Unset as default":"Open this listing with this view"}"
                                @click="${()=>{Eo(this.viewsScope,a.name),this.requestUpdate()}}">★</button>
                        <button class="chip-remove" aria-label="Delete view ${a.name}"
                                @click="${()=>{_o(this.viewsScope,a.name),this.requestUpdate()}}">✕</button>
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
        `}};Se.styles=C`
        ${ea}
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
    `;We([p()],Se.prototype,"metadata",2);We([p()],Se.prototype,"baseUrl",2);We([$()],Se.prototype,"state",2);We([$()],Se.prototype,"data",2);We([p()],Se.prototype,"appState",2);We([p()],Se.prototype,"appData",2);We([p({type:Boolean})],Se.prototype,"searchOnly",2);We([$()],Se.prototype,"panelOpened",2);We([$()],Se.prototype,"viewsOpened",2);We([$()],Se.prototype,"activeFilter",2);We([$()],Se.prototype,"draftText",2);Se=We([k("mateu-filter-bar")],Se);const Po="mateu-column-prefs",Ys=()=>{try{const e=JSON.parse(localStorage.getItem(Po)??"{}");return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}catch{return{}}},Oo=e=>{try{localStorage.setItem(Po,JSON.stringify(e))}catch{}},Js=e=>{if(!e||typeof e!="object")return;const t=a=>Array.isArray(a)?a.filter(s=>typeof s=="string"):[];return{hidden:t(e.hidden),order:t(e.order)}},Ro=e=>Js(Ys()[e]),dh=(e,t)=>{const a=Ys(),s=Js(t);s.hidden.length===0&&s.order.length===0?delete a[e]:a[e]=s,Oo(a)},ch=e=>{const t=Ys();delete t[e],Oo(t)},zo=e=>e?!!e.identifier||e.dataType==="action"||e.dataType==="actionGroup"||e.dataType==="menu"||e.id==="select"||e.id==="menu":!1,Ao=(e,t,a=s=>s)=>{const s=Js(t);if(!s||s.hidden.length===0&&s.order.length===0)return e;const i=h=>a(h)?.id??h.id,r=new Set(s.hidden),n=e.filter(h=>{const f=i(h);return!f||!r.has(f)||zo(a(h))});if(s.order.length===0)return n.length===e.length?e:n;const d=new Map;n.forEach(h=>{const f=i(h);f&&!d.has(f)&&d.set(f,h)});const c=[],u=new Set;return s.order.forEach(h=>{const f=d.get(h);f&&!u.has(f)&&(c.push(f),u.add(f))}),n.forEach(h=>{u.has(h)||(c.push(h),u.add(h))}),c.length===e.length&&c.every((h,f)=>h===e[f])?e:c};var uh=Object.defineProperty,ph=Object.getOwnPropertyDescriptor,ki=(e,t,a,s)=>{for(var i=s>1?void 0:s?ph(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&uh(t,a,i),i};let $a=class extends S{constructor(){super(...arguments),this.columns=[],this.scope="",this.panelOpened=!1,this.revision=0,this.togglePanel=()=>{if(this.panelOpened){this.closePanel();return}this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick)},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1},this.reset=()=>{ch(this.scope),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}get prefs(){return Ro(this.scope)??{hidden:[],order:[]}}effectiveEntries(e){return Ao(this.columns,{hidden:[],order:e.order})}commit(e){dh(this.scope,e),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}toggleVisibility(e){const t=this.prefs,a=t.hidden.includes(e)?t.hidden.filter(s=>s!==e):[...t.hidden,e];this.commit({...t,hidden:a})}move(e,t){const a=this.prefs,s=[...this.effectiveEntries(a)],i=s.findIndex(d=>d.id===e);if(i<0)return;let r=i+t;for(;r>=0&&r<s.length&&s[r].protected;)r+=t;if(r<0||r>=s.length)return;const n=s[i];s[i]=s[r],s[r]=n,this.commit({...a,order:s.map(d=>d.id)})}render(){this.revision;const e=this.prefs,t=this.effectiveEntries(e).filter(s=>!s.protected);if(t.length===0)return o``;const a=e.hidden.length>0||e.order.length>0;return o`
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
                `:l}
            </div>
        `}};$a.styles=C`
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
    `;ki([p()],$a.prototype,"columns",2);ki([p()],$a.prototype,"scope",2);ki([$()],$a.prototype,"panelOpened",2);ki([$()],$a.prototype,"revision",2);$a=ki([k("mateu-column-chooser")],$a);var hh=Object.defineProperty,mh=Object.getOwnPropertyDescriptor,Ci=(e,t,a,s)=>{for(var i=s>1?void 0:s?mh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&hh(t,a,i),i};let ya=class extends S{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.totalPages=0}updated(e){super.updated(e),(e.has("totalElements")||e.has("pageSize"))&&(this.totalPages=Math.ceil(this.totalElements/this.pageSize))}dispatch(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return l;const e=this.totalPages>1,t=this.pageNumber,a=t===0,s=t>=this.totalPages-1;return o`
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
                `:l}
                <span class="total-count">${this.totalElements} item${this.totalElements===1?"":"s"}</span>
                <slot></slot>
            </vaadin-horizontal-layout>
        `}};ya.styles=C`
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
    `;Ci([p()],ya.prototype,"totalElements",2);Ci([p()],ya.prototype,"pageSize",2);Ci([p()],ya.prototype,"pageNumber",2);Ci([$()],ya.prototype,"totalPages",2);ya=Ci([k("mateu-pagination")],ya);var vh=Object.defineProperty,fh=Object.getOwnPropertyDescriptor,Ge=(e,t,a,s)=>{for(var i=s>1?void 0:s?fh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&vh(t,a,i),i};let Ie=class extends S{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;t(a?.content??[],a?.content?.length??0)},this.respondToVisibility=(e,t)=>{var a={root:document.documentElement},s=new IntersectionObserver(i=>{i.forEach(r=>{t(r.intersectionRatio>0)})},a);s.observe(e)},this.keepAsking=!1,this.askToUpper=()=>{const e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?Us(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?o`<vaadin-card
        >
                ${e.title?o`
                    <div slot="title">${e.title}</div>
                `:l}
                ${e.subtitle?o`
                    <div slot="subtitle">${e.subtitle}</div>
                `:l}
                ${e.content?o`
                    <div>${e.content}</div>
                `:l}
                ${e.status?o`
                    <span slot="header-suffix" theme="badge ${Qi(e.status.type)}">${e.status.message}</span>
                `:l}
                ${e.image?o`
                    <img slot="media" src="${e.image}" alt="" />
                `:l}
                
        </vaadin-card>`:o`${e}`,this.hasMore=!1,this.clickedOnCard=e=>{this.state[this.id+"_selected_items"]=[e],this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0}))}}updated(e){super.updated(e);const t=this.data[this.id]?.page;this.hasMore=t?.content?.length<t?.totalElements}firstUpdated(e){super.firstUpdated(e),this.respondToVisibility(this.askForMore,t=>{this.keepAsking=t,t&&this.askToUpper()})}render(){const e=this.data[this.id]?.page;return o`
            <div class="card-container">
                ${e?.content?.map(t=>o`<div @click="${()=>this.clickedOnCard(t)}" class="car-container">${this.renderItem(t)}</div>`)}
                <div id="ask-for-more" style="display: ${this.hasMore?"flex":"none"}; width: 100%; justify-content: center; padding: var(--lumo-space-m); color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Loading more…</div>
            </div>

            <slot></slot>
       `}};Ie.styles=C`
        ${ea}
        
        .card-container {
            display: flex; 
            width: 100%; 
            flex-wrap: wrap; 
            gap: 10px;
        }

        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }

    `;Ge([p()],Ie.prototype,"id",2);Ge([p()],Ie.prototype,"metadata",2);Ge([p()],Ie.prototype,"baseUrl",2);Ge([p()],Ie.prototype,"state",2);Ge([p()],Ie.prototype,"data",2);Ge([p()],Ie.prototype,"appState",2);Ge([p()],Ie.prototype,"appData",2);Ge([p()],Ie.prototype,"emptyStateMessage",2);Ge([$()],Ie.prototype,"keepAsking",2);Ge([Be("#ask-for-more")],Ie.prototype,"askForMore",2);Ge([$()],Ie.prototype,"hasMore",2);Ie=Ge([k("mateu-card-list")],Ie);var jo=(e=>(e.none="none",e.success="success",e.error="error",e.warning="warning",e.contrast="contrast",e.normal="normal",e))(jo||{}),Lo=(e=>(e.primary="primary",e.secondary="secondary",e.tertiary="tertiary",e.tertiaryInline="tertiaryInline",e))(Lo||{}),bh=Object.defineProperty,gh=Object.getOwnPropertyDescriptor,Ke=(e,t,a,s)=>{for(var i=s>1?void 0:s?gh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&bh(t,a,i),i};const $h={asc:"ascending",desc:"descending"};let _e=class extends S{constructor(){super(...arguments),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this._columnPrefsRevision=0,this._prefsRevisionApplied=-1,this.search=()=>{const e=this.component.metadata;this.state={...this.state,size:e.pageSize,page:0,crud_selected_items:[]},this._syncStateToUrl(e),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}}},bubbles:!0,composed:!0}))},this.notify=e=>{pa.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.handleSearchRequested=e=>{this.state={...this.state,crud_selected_items:[]};const t=this.component.metadata;this._syncStateToUrl(t),!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}},callback:e},bubbles:!0,composed:!0}))},this.fetchMoreElements=e=>{const{params:t,callback:a}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(a)},this.directionChanged=e=>{const t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(a=>({fieldId:a.__data.path,direction:a.__data.direction?$h[a.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForComponentId=void 0,this.evalLabel=e=>Re(e,this.state,this.data),this.handleToolbarButtonClick=e=>{if(e==="import"){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{const t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"process-import",parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get columnPrefsScope(){return window.location.pathname}get effectiveComponent(){const e=this.component,t=e?.metadata;if(!e||!t?.columns)return e;if(this._prefsSource===e&&this._prefsRevisionApplied===this._columnPrefsRevision)return this._prefsApplied;const a=Ro(this.columnPrefsScope),s=Ao(t.columns,a,i=>i.metadata??{});return this._prefsApplied=s===t.columns?e:{...e,metadata:{...t,columns:s}},this._prefsSource=e,this._prefsRevisionApplied=this._columnPrefsRevision,this._prefsApplied}get columnChooserEntries(){return(this.component?.metadata?.columns??[]).map(t=>{const a=t.metadata??{},s=a.id??t.id;return s?{id:s,label:a.label??s,protected:zo(a)}:void 0}).filter(t=>!!t)}renderColumnChooser(){const e=this.columnChooserEntries;return e.filter(t=>!t.protected).length===0?l:o`
            <mateu-column-chooser
                .columns="${e}"
                .scope="${this.columnPrefsScope}"
                @column-prefs-changed="${t=>{t.stopPropagation(),this._columnPrefsRevision++}}"
            ></mateu-column-chooser>
        `}get cols(){return this.effectiveComponent?.metadata?.columns?.map(t=>t.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.component?.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":uo(this.cols,this.availableWidthPx):t}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}_filterIds(e){return new Set(["searchText",...(e.filters??[]).flatMap(t=>t.stereotype==="dateRange"||t.stereotype==="numberRange"?[`${t.fieldId}_from`,`${t.fieldId}_to`]:[t.fieldId])])}_syncStateToUrl(e){const t=this._filterIds(e),a=new URLSearchParams(window.location.search);t.forEach(d=>a.delete(d)),a.delete("page"),a.delete("sort"),t.forEach(d=>{const c=this.state[d];c!=null&&c!==""&&a.set(d,String(c))});const s=this.state.page;s&&s>0&&a.set("page",String(s));const i=this.state.sort;if(i&&i.length>0){const d=i.filter(c=>c.fieldId&&c.direction).map(c=>`${c.fieldId}:${c.direction}`).join(",");d&&a.set("sort",d)}const r=a.toString(),n=r?`${window.location.pathname}?${r}`:window.location.pathname;window.location.pathname+window.location.search!==n&&history.replaceState(null,"",n)}_initStateFromUrl(e,t){const a=new URLSearchParams(window.location.search),s=this._filterIds(e),i={...t};a.forEach((d,c)=>{s.has(c)&&(i[c]=d)});const r=a.get("page");if(r!==null){const d=parseInt(r,10);!isNaN(d)&&d>0&&(i.page=d)}const n=a.get("sort");if(n){const d=n.split(",").map(c=>{const[u,m]=c.split(":");return u&&m?{fieldId:u,direction:m}:null}).filter(Boolean);d.length>0&&(i.sort=d)}return i}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}updated(e){if(super.updated(e),e.has("component")){const t=this.component?.id;if(t!==this._initializedForComponentId){this._initializedForComponentId=t;const a=this.component?.metadata,s=a.initialPage&&a.initialPage>0?a.initialPage:0;this.state=this._initStateFromUrl(a,{...this.state,size:a.pageSize,page:s,sort:[]}),(this.state.page!==s||this.state.sort?.length>0||[...this._filterIds(a)].some(r=>this.state[r]!=null))&&this.handleSearchRequested(void 0)}}}render(){const e=I=>{const L=[];return I.color&&I.color!==jo.normal&&L.push(I.color),I.buttonStyle&&L.push(I.buttonStyle===Lo.tertiaryInline?"tertiary-inline":I.buttonStyle),L.length?L.join(" "):void 0},t=I=>I==="back"||I==="backToList"||!!I&&I.startsWith("cancel"),a=I=>{const L=Z.get()?.renderToolbarButton?.(I,this.evalLabel(I.label),()=>this.handleToolbarButtonClick(I.actionId));return L||o`
                <vaadin-button
                        data-action-id="${I.id}"
                        theme="${e(I)||l}"
                        @click="${()=>this.handleToolbarButtonClick(I.actionId)}"
                >${this.evalLabel(I.label)}</vaadin-button>
            `};if(!this.component)return o`no component`;const s=this.effectiveComponent,i=s.metadata;i.serverSideOrdering=!0;const r=i?.toolbar??[],n=r.filter(I=>t(I.actionId)),d=r.filter(I=>!t(I.actionId)),c=n.length>0&&d.length>0,u=!!i?.title||!!i?.subtitle||r.length>0,m=this.effectiveGridLayout,h=this.cols,f=Vi(h),y=this.data[this.id]?.page?.content??[],x=this.state[this.component?.id]?.emptyStateMessage,T=(I,L)=>{const O=L[I.id];if(O==null)return o``;if(I.dataType==="status"){const D=Qi(O.type);return o`<span theme="badge pill ${D}">${O.message}</span>`}return I.dataType==="bool"?o`${O?"✓":"✗"}`:typeof O=="object"?o`${O.label??O.name??O.message??""}`:o`${O}`},U=()=>{const I=this.identifierFieldName,L=this.state._selectedId??this.appState?._splitDetailId,O=f.find(R=>R.identifier)??f[0],D=R=>R.dataType==="action"||R.dataType==="actionGroup"||R.dataType==="menu"||R.stereotype==="button",Ne=f.filter(R=>R!==O&&!D(R)),Te=h.filter(R=>D(R)),ot=(R,re,pe)=>{R.stopPropagation(),R.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:re,parameters:{_clickedRow:pe}},bubbles:!0,composed:!0}))},kt=R=>{const re=[];for(const pe of Te){const N=R[pe.id];if(pe.dataType==="action"){const A=N?.methodNameInCrud?N:R.action?.methodNameInCrud?R.action:{methodNameInCrud:pe.id,label:pe.label,icon:null};re.push(o`
                            <vaadin-button theme="tertiary small" title="${A.label||l}"
                                @click="${_=>ot(_,"action-on-row-"+A.methodNameInCrud,R)}">
                                ${A.icon?o`<vaadin-icon icon="${A.icon}"></vaadin-icon>`:l}
                                ${A.label??l}
                            </vaadin-button>`)}else(pe.dataType==="actionGroup"||pe.dataType==="menu")&&(N?.actions??[]).forEach(_=>re.push(o`
                            <vaadin-button theme="tertiary small" title="${_.label||l}"
                                @click="${q=>ot(q,"action-on-row-"+_.methodNameInCrud,R)}">
                                ${_.icon?o`<vaadin-icon icon="${_.icon}"></vaadin-icon>`:l}
                                ${_.label??l}
                            </vaadin-button>`))}return re.length?o`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${re}
                    </div>`:l};return o`
                <vaadin-list-box style="width: 100%;">
                    ${y.length===0?o`<vaadin-item disabled>${ua(x)}</vaadin-item>`:l}
                    ${y.map(R=>o`
                        <vaadin-item
                            ?selected="${I&&L!==void 0&&String(R[I])===String(L)}"
                            @click="${()=>{I&&R[I]!==void 0&&(this.state={...this.state,_selectedId:String(R[I])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:R},bubbles:!0,composed:!0}))}}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${O?R[O.id]??"":""}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${Ne.map(re=>o`<span>${re.label}: ${T(re,R)}</span>`)}
                            </div>
                            ${kt(R)}
                        </vaadin-item>
                    `)}
                </vaadin-list-box>`},ae=(I,L,O)=>{const D=this.identifierFieldName;D&&O[D]!==void 0&&(this.state={...this.state,_selectedId:String(O[D])}),I.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:L,parameters:O},bubbles:!0,composed:!0}))},F=()=>{const I=this.identifierFieldName,L=this.state._selectedId??this.appState?._splitDetailId,O=h.slice(0,6),D=O.filter(_=>_.stereotype==="image"),Ne=O.find(_=>_.identifier)??O[0],Te=_=>!!_.actionId,ot=_=>_.dataType==="action"||_.dataType==="actionGroup"||_.dataType==="menu"||_.stereotype==="button",kt=O.find(_=>_.id==="select"&&_.dataType==="action"),R=!!kt,re=O.filter(_=>_!==Ne&&!D.includes(_)&&!Te(_)&&!ot(_)),pe=O.filter(_=>ot(_)&&!(R&&_===kt)),N=(_,q,ge)=>{_.stopPropagation(),_.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:q,parameters:{_clickedRow:ge}},bubbles:!0,composed:!0}))},A=_=>{const q=[];for(const ge of pe){const da=_[ge.id];if(ge.dataType==="action"){const Ct=da?.methodNameInCrud?da:_.action?.methodNameInCrud?_.action:{methodNameInCrud:ge.id,label:ge.label,icon:null};q.push(o`
                            <vaadin-button theme="tertiary" title="${Ct.label||l}"
                                @click="${St=>N(St,"action-on-row-"+Ct.methodNameInCrud,_)}">
                                ${Ct.icon?o`<vaadin-icon icon="${Ct.icon}"></vaadin-icon>`:l}
                                ${Ct.label??l}
                            </vaadin-button>`)}else(ge.dataType==="actionGroup"||ge.dataType==="menu")&&(da?.actions??[]).forEach(St=>q.push(o`
                            <vaadin-button theme="tertiary" title="${St.label||l}"
                                @click="${hs=>N(hs,"action-on-row-"+St.methodNameInCrud,_)}">
                                ${St.icon?o`<vaadin-icon icon="${St.icon}"></vaadin-icon>`:l}
                                ${St.label??l}
                            </vaadin-button>`))}return q.length?o`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${q}
                    </div>`:l};return o`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${y.length===0?o`<div style="grid-column: 1 / -1;">${ua(x)}</div>`:l}
                    ${y.map(_=>o`
                        <vaadin-card
                            clickable
                            ?data-selected="${I&&L!==void 0&&String(_[I])===String(L)}"
                            style="cursor: pointer;"
                            @click="${q=>R?N(q,"action-on-row-select",_):ae(q.target,"view",_)}"
                        >
                            ${D.length?o`<img slot="media" src="${_[D[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover;" />`:l}
                            ${Ne?o`<div slot="title">${_[Ne.id]??""}</div>`:l}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${re.map(q=>o`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${q.label}</span>
                                        <span>${T(q,_)}</span>
                                    </div>
                                `)}
                            </div>
                            ${A(_)}
                        </vaadin-card>
                    `)}
                </div>`},ne=()=>{const I=ju(h),L=I.find(D=>D.identifier)??I[0],O=I.filter(D=>D!==L);return o`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <vaadin-list-box style="width: 100%;">
                            ${y.length===0?o`<vaadin-item disabled>${ua(x)}</vaadin-item>`:l}
                            ${y.map(D=>o`
                                <vaadin-item
                                    ?selected="${this.selectedItem===D}"
                                    @click="${()=>{this.selectedItem=D}}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${L?D[L.id]??"":""}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${O.map(Ne=>o`${T(Ne,D)} `)}
                                    </div>
                                </vaadin-item>
                            `)}
                        </vaadin-list-box>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?o`
                            <vaadin-form-layout>
                                ${h.map(D=>o`
                                    <vaadin-text-field
                                        label="${D.label}"
                                        .value="${String(this.selectedItem[D.id]??"")}"
                                        readonly
                                    ></vaadin-text-field>
                                `)}
                            </vaadin-form-layout>
                        `:o`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},ue=()=>{const I=this.identifierFieldName,L=this.state._selectedId??this.appState?._splitDetailId,O=h[0],D=h.slice(1),Ne=!!O?.actionId,Te=N=>(N??[]).map(A=>{const _=Array.isArray(A.children)?A.children:[];return _.length>0?{...A,children:Te(_)}:{...A,children:void 0}}),ot=Te(y),kt=(N,A)=>{const _=N.parentItem?N.parentItem.children??[]:ot;A(_,_.length)},R=(N,A)=>{for(const _ of N??[]){if(I&&String(_[I])===A)return _;const q=R(_.children,A);if(q)return q}},re=I&&L!==void 0?R(ot,String(L)):void 0,pe=(N,A,_)=>{N.stopPropagation(),I&&A[I]!==void 0&&(this.state={...this.state,_selectedId:String(A[I])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:_,parameters:A},bubbles:!0,composed:!0}))};return o`
                <vaadin-grid
                    style="width: 100%;"
                    all-rows-visible
                    .itemHasChildrenPath="${"children"}"
                    .itemIdPath="${I??"id"}"
                    .dataProvider="${kt}"
                    .selectedItems="${re?[re]:[]}"
                >
                    ${O?o`<vaadin-grid-tree-column path="${O.id}" header="${O.label??l}" flex-grow="1"></vaadin-grid-tree-column>`:l}
                    ${Ne?o`
                    <vaadin-grid-column width="6rem" flex-grow="0" text-align="end" ${Et(N=>N?.viewable===!1?l:o`
                        <vaadin-button theme="tertiary small" @click="${A=>pe(A,N,"view")}">View</vaadin-button>
                    `,[])}></vaadin-grid-column>`:l}
                    ${D.map(N=>N.id==="select"?o`<vaadin-grid-column width="7rem" flex-grow="0" text-align="end" header="${N.label??l}" ${Et(A=>o`
                            <vaadin-button theme="tertiary small" @click="${_=>{_.stopPropagation(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-select",parameters:{_clickedRow:A}},bubbles:!0,composed:!0}))}}">Select</vaadin-button>
                        `,[])}></vaadin-grid-column>`:o`<vaadin-grid-column path="${N.id}" header="${N.label??l}" auto-width></vaadin-grid-column>`)}
                    <span slot="empty-state">${ua(x)}</span>
                </vaadin-grid>`},se=Z.get()?.rendersCrudLayouts?.()===!0,Y=o`
            ${i.infiniteScrolling?o`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:l}
            ${!se&&m==="list"?U():!se&&m==="cards"?i.contentHeight?o`
                <vaadin-scroller style="width: 100%; height: ${i.contentHeight};">
                    ${F()}
                </vaadin-scroller>
            `:F():!se&&m==="masterDetail"?ne():!se&&m==="tree"?ue():Z.get()?.renderTableComponent(this,s,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,te=i.infiniteScrolling?l:Z.get()?.renderPagination(this,this.component),be=o`
            <vaadin-dialog
                .opened="${this.showImportDialog}"
                header-title="Import"
                @opened-changed="${I=>{this.showImportDialog=I.detail.value}}"
                ${Ji(()=>o`
                    <vaadin-upload
                        target="/upload"
                        max-files="1"
                        @upload-success="${this.handleImportUploadSuccess}"
                    ></vaadin-upload>
                `,[this.showImportDialog])}
                ${zs(()=>o`
                    <vaadin-button @click="${()=>{this.showImportDialog=!1}}">Cancel</vaadin-button>
                `,[])}
            ></vaadin-dialog>
        `;return this.standalone?o`
                ${be}
                <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); background: var(--mateu-section-bg, transparent); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); width: 100%; box-sizing: border-box; padding: var(--lumo-space-m); display: flex; flex-direction: column;">
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
                        <div style="flex: 1; min-width: 0;">${Z.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                        ${this.renderColumnChooser()}
                    </div>
                    <div style="flex: 1; overflow-y: auto; min-height: 0;">${Y}</div>
                    <div style="flex-shrink: 0;">${te}</div>
                </div>
            `:o`
            ${be}
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
                        ${n.map(I=>a(I))}
                        ${c?o`<span class="toolbar-divider"></span>`:l}
                        ${d.map(I=>a(I))}
                        <slot></slot>
                    </div>
                `:l}
            <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); background: var(--mateu-section-bg, transparent); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); padding: var(--lumo-space-m); display: flex; flex-direction: column;">
                <div style="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);">
                    <div style="flex: 1; min-width: 0;">${Z.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                    ${this.renderColumnChooser()}
                </div>
                <div style="flex: 1; overflow-y: auto; min-height: 0;">${Y}</div>
                <div style="flex-shrink: 0;">${te}</div>
            </div>
        `}createRenderRoot(){return Z.mustUseShadowRoot()?super.createRenderRoot():this}};_e.styles=C`
        ${ea}
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
    `;Ke([p()],_e.prototype,"component",2);Ke([p()],_e.prototype,"baseUrl",2);Ke([p({type:Boolean})],_e.prototype,"standalone",2);Ke([p()],_e.prototype,"state",2);Ke([p()],_e.prototype,"data",2);Ke([p()],_e.prototype,"appState",2);Ke([p()],_e.prototype,"appData",2);Ke([$()],_e.prototype,"showImportDialog",2);Ke([$()],_e.prototype,"availableWidthPx",2);Ke([$()],_e.prototype,"selectedItem",2);Ke([$()],_e.prototype,"_columnPrefsRevision",2);_e=Ke([k("mateu-table-crud")],_e);var yh=Object.defineProperty,xh=Object.getOwnPropertyDescriptor,ds=(e,t,a,s)=>{for(var i=s>1?void 0:s?xh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&yh(t,a,i),i};let Na=class extends S{constructor(){super(...arguments),this.notificationOpened=!1,this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1,this.error=e.detail.reason,this.openNotification()},this.openNotification=()=>{this.notificationOpened=!0},this.closeNotification=()=>{this.notificationOpened=!1},this.notificationRenderer=()=>o`
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
                ${Pr(this.notificationRenderer,[])}
        ></vaadin-notification>`}};Na.styles=C`
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
  `;ds([$()],Na.prototype,"loading",2);ds([$()],Na.prototype,"notificationOpened",2);ds([$()],Na.prototype,"error",2);Na=ds([k("mateu-api-caller")],Na);var wh=Object.defineProperty,kh=Object.getOwnPropertyDescriptor,xt=(e,t,a,s)=>{for(var i=s>1?void 0:s?kh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&wh(t,a,i),i};let qe=class extends S{constructor(){super(...arguments),this.message="This website uses cookies.",this.dismiss="Ok. Thanks :).",this.learnMore="Learn more",this.learnMoreLink="https://cookiesandyou.com/",this.showLearnMore=!0,this.position="top",this.cookieName="mateu-cookieconsent"}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement("style"),this._css.innerText=".cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}",document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){const e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){const e=this.popup;e&&(e.classList.remove("cc-invisible"),e.style.display="")}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:"#000"},button:{background:"rgba(22, 118, 243, 0.95)",hover:"rgba(22, 118, 243, 1)"}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});const e=this.popup;if(e){e.setAttribute("role","alert");const t=e.querySelector("a.cc-btn");t?.addEventListener("keydown",a=>{const r=a.keyCode||a.which;(r===32||r===13)&&t.click()})}}render(){return o`
       `}};qe.styles=C`
  `;xt([p()],qe.prototype,"message",2);xt([p()],qe.prototype,"dismiss",2);xt([p()],qe.prototype,"learnMore",2);xt([p()],qe.prototype,"learnMoreLink",2);xt([p()],qe.prototype,"showLearnMore",2);xt([p()],qe.prototype,"position",2);xt([p()],qe.prototype,"cookieName",2);xt([$()],qe.prototype,"_css",2);xt([Be('[aria-label="cookieconsent"]')],qe.prototype,"popup",2);qe=xt([k("mateu-cookie-consent")],qe);var Ch=Object.defineProperty,Sh=Object.getOwnPropertyDescriptor,Do=(e,t,a,s)=>{for(var i=s>1?void 0:s?Sh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Ch(t,a,i),i};let Gi=class extends S{constructor(){super(...arguments),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener("value-changed",this.redispatchEvent),this.addEventListener("data-changed",this.redispatchEvent),this.addEventListener("action-requested",this.redispatchEvent),this.addEventListener("server-side-action-requested",this.redispatchEvent),this.addEventListener("route-changed",this.redispatchEvent),this.addEventListener("close-modal-requested",this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("value-changed",this.redispatchEvent),this.removeEventListener("data-changed",this.redispatchEvent),this.removeEventListener("action-requested",this.redispatchEvent),this.removeEventListener("server-side-action-requested",this.redispatchEvent),this.removeEventListener("route-changed",this.redispatchEvent)}render(){return o`<slot></slot>`}};Gi.styles=C`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `;Do([p()],Gi.prototype,"target",2);Gi=Do([k("mateu-event-interceptor")],Gi);var Ih=Object.defineProperty,_h=Object.getOwnPropertyDescriptor,No=(e,t,a,s)=>{for(var i=s>1?void 0:s?_h(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Ih(t,a,i),i};let Ki=class extends la{constructor(){super(...arguments),this.opened=!0,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),500)}}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}render(){const e=this.component.metadata;let t="";e.noPadding&&(t+=" no-padding");const a=ii(e.headerTitle,this.state,this.data,this.appState,this.appData);return o`
        <vaadin-dialog
                header-title="${a}"
                .opened="${this.opened}"
                slot="${this.component?.slot??l}"
                theme="${t}"
                ?modeless="${e.modeless}"
                ?draggable="${e.draggable}"
                ?resizable="${e.resizable}"
                top="${e.top??l}"
                left="${e.left??l}"
                right="${e.right??l}"
                width="${e.width??l}"
                height="${e.height??l}"
                ${e.header||e.closeButtonOnHeader?tn(()=>o`<mateu-event-interceptor .target="${this}" style="width: 100%;">${e.header?w(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):l}${e.closeButtonOnHeader?o`
                            <vaadin-button theme="tertiary" @click="${this.close}">
                                <vaadin-icon icon="lumo:cross"></vaadin-icon>
                            </vaadin-button>
                        `:l}</mateu-event-interceptor>`,[this.state,this.data]):l}
                ${e.footer?zs(()=>o`<mateu-event-interceptor .target="${this}" style="width: 100%;">${w(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):l}
                ${e.content?Ji(()=>o`<mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${w(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):l}
                style="${this.component?.style}" 
                class="${this.component?.cssClasses}"
        >
        </vaadin-dialog>

       `}};Ki.styles=C`
  `;No([$()],Ki.prototype,"opened",2);Ki=No([k("mateu-dialog")],Ki);var Eh=Object.defineProperty,Th=Object.getOwnPropertyDescriptor,cs=(e,t,a,s)=>{for(var i=s>1?void 0:s?Th(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Eh(t,a,i),i};let Qe=class extends la{constructor(){super(...arguments),this.opened=!1,this.maximizeSteps=0,this.collapsed=!1,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),300)},this._escListener=e=>{if(e.key!=="Escape")return;const a=this.getRootNode().querySelectorAll("mateu-drawer, mateu-dialog");a[a.length-1]===this&&(e.stopPropagation(),this.close())}}effectiveWidth(e){if(e.width)return e.width;if(!e.size)return;const t=Qe.SIZE_LADDER,a=Math.max(0,t.indexOf(e.size)),s=Math.min(t.length-1,a+this.maximizeSteps);return Qe.SIZE_WIDTHS[t[s]]}canMaximize(e){if(!e.maximizable)return!1;const t=Qe.SIZE_LADDER;return Math.max(0,t.indexOf(e.size??"m"))+this.maximizeSteps<t.length-1}firstUpdated(){requestAnimationFrame(()=>this.opened=!0)}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._escListener)}disconnectedCallback(){document.removeEventListener("keydown",this._escListener),super.disconnectedCallback()}render(){const e=this.component.metadata,t=e.position??"end",a=ii(e.headerTitle,this.state,this.data,this.appState,this.appData),s=ii(e.subtitle,this.state,this.data,this.appState,this.appData),i=this.effectiveWidth(e),r=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0;return o`
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
                ${a?o`<div class="titles"><h3>${a}</h3>${s?o`<span class="subtitle">${s}</span>`:l}</div>`:o`<span class="spacer"></span>`}
                ${e.header?o`
                    <mateu-event-interceptor .target="${this}">${w(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:l}
                ${r?o`
                    <button class="drawer-icon" aria-label="${r.prevLabel??"Previous"}" title="${r.prevLabel??"Previous"}"
                            ?disabled="${!r.prevRoute}" @click="${()=>{r.prevRoute&&(window.location.href=r.prevRoute)}}">‹</button>
                    <button class="drawer-icon" aria-label="${r.nextLabel??"Next"}" title="${r.nextLabel??"Next"}"
                            ?disabled="${!r.nextRoute}" @click="${()=>{r.nextRoute&&(window.location.href=r.nextRoute)}}">›</button>
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
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${w(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:l}
            </div>
            ${e.footer?o`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${w(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                </footer>
            `:l}
            `}
        </section>
       `}};Qe.SIZE_LADDER=["s","m","l","xl"];Qe.SIZE_WIDTHS={s:"464px",m:"648px",l:"968px",xl:"90vw"};Qe.styles=C`
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
  `;cs([$()],Qe.prototype,"opened",2);cs([$()],Qe.prototype,"maximizeSteps",2);cs([$()],Qe.prototype,"collapsed",2);Qe=cs([k("mateu-drawer")],Qe);var Ph=Object.defineProperty,Oh=Object.getOwnPropertyDescriptor,Ee=(e,t,a,s)=>{for(var i=s>1?void 0:s?Oh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Ph(t,a,i),i};function kr(e){if(e.parentElement)return e.parentElement;const t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}let ce=class extends S{constructor(){super(...arguments),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type==="keydown"){const t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{const t=e.detail,a=t.banners??[],s=t.append??!1;s?this.actionBanners=[...this.actionBanners,...a]:(this._clearActionBannerTimers(),this.actionBanners=a);const i=s?this.actionBanners.length-a.length:0;a.forEach((r,n)=>{if(r.timeoutSeconds&&r.timeoutSeconds>0){const d=i+n;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((c,u)=>u!==d)},r.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;const t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;const a=parseInt(t[1],10)-1;a>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(a))},this._onScrollSpy=()=>{if(this._tocLocked)return;const e=this._sectionCards();if(!e.length)return;const t=12,a=this.shadowRoot?.querySelector("mateu-content-header");let s=a?a.getBoundingClientRect().bottom:0;for(const n of e){if(!n.classList.contains("mateu-section--sticky"))continue;const d=n.getBoundingClientRect();d.top<=s+t+2&&(s=Math.max(s,d.bottom))}const i=s+t+4;let r=0;this._tocEntries.forEach((n,d)=>{n.el.getBoundingClientRect().top<=i&&(r=d)}),this._activeToc=r}}connectedCallback(){super.connectedCallback(),document.addEventListener("page-banners-received",this._bannersHandler),window.addEventListener("resize",this._onResize),document.addEventListener("keydown",this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("page-banners-received",this._bannersHandler),window.removeEventListener("resize",this._onResize),document.removeEventListener("keydown",this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy()}updated(e){super.updated(e),e.has("component")&&e.get("component")!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has("component")&&(this._scheduleStaticBannerTimeouts(),this.dispatchEvent(new CustomEvent("compact-changed",{detail:{compact:!!this.component?.style?.includes("--mateu-compact:1")},bubbles:!0,composed:!0})),this._scheduleTocRebuild())}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(a=>clearTimeout(a)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((a,s)=>{a.timeoutSeconds&&a.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,s])},a.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,a)=>a!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){const t=e.theme?.toLowerCase()??"info";return t==="none"?"":t}_evalBannerText(e){return Re(e,this.state,this.data)}_renderBanner(e,t){const a=this._evalBannerText(e.title),s=this._evalBannerText(e.description);return o`
            <div class="page-banner page-banner--${this.bannerThemeClass(e)}">
                ${a||e.hasCloseButton?o`
                    <div style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span style="font-weight: 600;">${a??""}</span>
                        ${e.hasCloseButton?o`
                            <button class="banner-close" @click=${t} title="Dismiss" aria-label="Dismiss">✕</button>
                        `:l}
                    </div>
                `:l}
                ${s?o`<p>${s}</p>`:l}
            </div>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll(".mateu-section"))}_sectionTitle(e){const t=e.querySelector('[slot="title"]')?.textContent?.trim();return t||e.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()||void 0}_rebuildToc(){const e=this._sectionCards(),t=e.map(r=>({title:this._sectionTitle(r),el:r})).filter(r=>!!r.title),a=this.component?.metadata?.toc,s=t.length>4&&e.every(r=>!r.closest("vaadin-horizontal-layout")),i=(a===!0?!0:a===!1?!1:s)&&t.length>0;this._tocEntries=t,this._tocVisible=i,this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),i?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){const e=this.shadowRoot?.querySelector("mateu-content-header");this._headerH=this._tocVisible&&e?e.offsetHeight:0,this.style.setProperty("--mateu-header-h",this._headerH+"px");const t=12;let a=this._headerH+t;for(const s of this._sectionCards())s.classList.contains("mateu-section--sticky")&&(s.style.top=a+"px",a+=s.offsetHeight+t)}_scrollContainer(){let e=kr(this);for(;e;){const t=getComputedStyle(e).overflowY;if((t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight)return e;e=kr(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener("scroll",this._onScrollSpy,{passive:!0}),window.addEventListener("wheel",this._unlockToc,{passive:!0}),window.addEventListener("touchstart",this._unlockToc,{passive:!0}),window.addEventListener("keydown",this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener("scroll",this._onScrollSpy),window.removeEventListener("wheel",this._unlockToc),window.removeEventListener("touchstart",this._unlockToc),window.removeEventListener("keydown",this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){const t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;const a=12;let s=this._headerH+a;for(const d of this._sectionCards()){if(d===t.el)break;d.classList.contains("mateu-section--sticky")&&(s+=d.offsetHeight+a)}const i=this._scrollContainer(),r=i?i.getBoundingClientRect().top:0,n=t.el.getBoundingClientRect().top-r-s;(i??window).scrollBy({top:n,behavior:"smooth"})}_showHeaderBand(){const e=this.component?.metadata,t=!!(e?.title||e?.subtitle||e?.toolbar?.length),a=!!this.component?.children?.some(s=>s.metadata?.type===v.Crud);return t&&!a&&!this._hasWelcomeBanner()}_hasWelcomeBanner(){const e=t=>t?.metadata?.type===v.HeroSection?!0:(t?.children??[]).some(e);return(this.component?.children??[]).some(e)}render(){const e=this.component?.metadata,s=[...(e?.banners??[]).map((r,n)=>({banner:r,index:n})).filter(({index:r})=>!this.dismissedStaticBannerIndices.has(r)).map(({banner:r,index:n})=>({banner:r,onDismiss:()=>this._dismissStaticBanner(n)})),...this.actionBanners.map((r,n)=>({banner:r,onDismiss:()=>this._dismissActionBanner(n)}))],i=o`
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
            ${s.length>0?o`
                <div class="page-banners">
                    ${s.map(({banner:r,onDismiss:n})=>this._renderBanner(r,n))}
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
                            ${this._tocEntries.map((r,n)=>o`
                                <a class="page-toc__item ${n===this._activeToc?"is-active":""}"
                                   @click=${()=>this._scrollToSection(n)}
                                   title=${n<9?`${r.title} (Ctrl+Alt+${n+1})`:r.title}>
                                    <span class="page-toc__label">${r.title}</span>
                                    ${n<9?o`<span class="page-toc__key">${n+1}</span>`:l}
                                </a>
                            `)}
                        </nav>
                    </aside>
                `:l}
            </div>
            <div class="form-footer">
                ${e?.footer?.map(r=>w(this,r,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `;return o`<div style="display: flex; flex-direction: column; width: 100%;">${i}</div>`}};ce.styles=C`
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
    `;Ee([p()],ce.prototype,"component",2);Ee([p()],ce.prototype,"baseUrl",2);Ee([p()],ce.prototype,"state",2);Ee([p()],ce.prototype,"data",2);Ee([p()],ce.prototype,"appState",2);Ee([p()],ce.prototype,"appData",2);Ee([p()],ce.prototype,"value",2);Ee([p({type:Boolean})],ce.prototype,"standalone",2);Ee([$()],ce.prototype,"actionBanners",2);Ee([$()],ce.prototype,"dismissedStaticBannerIndices",2);Ee([$()],ce.prototype,"_tocEntries",2);Ee([$()],ce.prototype,"_activeToc",2);Ee([$()],ce.prototype,"_tocVisible",2);ce=Ee([k("mateu-page")],ce);const us=C`
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
`,Ga=e=>X`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,Xs=Ga(X`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),Qs=Ga(X`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),Zs=Ga(X`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`),Rh=Ga(X`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`),zh=Ga(X`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`),Ah=Ga(X`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`);var jh=Object.defineProperty,Lh=Object.getOwnPropertyDescriptor,Q=(e,t,a,s)=>{for(var i=s>1?void 0:s?Lh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&jh(t,a,i),i};const Cr=["#e91e63","#1676f3","#10b981","#8b5cf6","#f59e0b","#ef4444"],Dh=e=>Cr[Math.abs(e??0)%Cr.length],Nh=e=>(e??"?").split(/\s+/).filter(t=>t).map(t=>t[0]).slice(0,2).join("").toUpperCase()||"?";let G=class extends S{constructor(){super(...arguments),this.localAgentUrl="http://127.0.0.1:8776",this.localAgentAlive=!1,this.menu=[],this.chatSessionId=ke(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onSpeechResult=e=>{if(this.recognition){const t=e,a=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=a,this.send(new CustomEvent("submit",{detail:{value:a},bubbles:!0,composed:!0})))}},this.probeLocalAgent=async()=>{if(this.localAgentUrl)try{const e=new AbortController,t=setTimeout(()=>e.abort(),1200),a=await fetch(this.localAgentUrl+"/health",{signal:e.signal});clearTimeout(t),this.localAgentAlive=a.ok}catch{this.localAgentAlive=!1}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{const t=e.target,a=Array.from(t.files??[]);if(t.value="",!(!a.length||!this.uploadUrl)){this.uploading=!0;try{const s=new FormData;s.append("sessionId",this.chatSessionId);for(const m of a)s.append("files",m,m.name);const i={},r=localStorage.getItem("__mateu_auth_token");r&&(i.Authorization="Bearer "+r);const n=sessionStorage.getItem("__mateu_sesion_id");n&&(i["X-Session-Id"]=n);const d=await fetch(this.uploadUrl,{method:"POST",headers:i,body:s});if(!d.ok)throw new Error(`Upload failed: ${d.status}`);const u=((await d.json()).files??[]).filter(m=>m&&m.path);this.attachments=[...this.attachments,...u]}catch(s){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${s instanceof Error?s.message:s}`,"agent")}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async e=>{this.messageInputElement?.setAttribute("disabled","disabled");const t=e.detail.value.trim(),a=this.localAgentAlive?this.localAgentUrl+"/mateu/agent/stream":this.sseUrl,s=this.attachments;if(!t&&s.length===0||!a)return;const i=s.length?`${t}${t?`

`:""}📎 ${s.map(d=>d.name).join(", ")}`:t;this.addMessage(i,"user"),this.attachments=[];const r=this.addMessage("","agent");this.startLoading();let n="";try{const d={Accept:"text/event-stream","Content-Type":"application/json"},c=localStorage.getItem("__mateu_auth_token");c&&(d.Authorization="Bearer "+c);const u=sessionStorage.getItem("__mateu_sesion_id");u&&(d["X-Session-Id"]=u);const m=this.contextProvider?.(),h=JSON.stringify({message:t,sessionId:this.chatSessionId,...s.length&&{attachments:s},...m!=null&&{context:m},...this.mcpUrl&&{mcpUrl:new URL(this.mcpUrl,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;const f=await fetch(a,{method:"POST",headers:d,body:h});if(!f.ok){const T=await f.text();throw new Error(`Servidor respondió ${f.status}: ${T}`)}const g=f.body?.getReader();if(!g)throw new Error("No se pudo obtener el reader del stream.");const y=new TextDecoder;let x="";for(;;){const{done:T,value:U}=await g.read();if(T){if(x.trim().startsWith("data:")){const ue=x.trim().slice(5).trim(),se=this.tryParseTokenUsage(ue),Y=!se&&this.tryParseCustomEvent(ue);se?this.tokenUsage={...this.tokenUsage,...se}:Y?Y.event==="agent-error"?(n="⚠️ "+(Y.detail?.message??"Error desconocido del agente"),this.updateMessage(r,n)):this.dispatchEvent(new CustomEvent(Y.event,{detail:Y.detail,bubbles:!0,composed:!0})):(n+=ue,this.updateMessage(r,n))}break}const ae=y.decode(U,{stream:!0});x+=ae;const F=x.split(`
`);x=F.pop()||"";let ne=!1;for(const ue of F)if(ue.trim().startsWith("data:")){const se=ue.trim().slice(5).trim(),Y=this.tryParseTokenUsage(se),te=!Y&&this.tryParseCustomEvent(se);Y?this.tokenUsage={...this.tokenUsage,...Y}:te?te.event==="agent-error"?(n="⚠️ "+(te.detail?.message??"Error desconocido del agente"),this.updateMessage(r,n)):this.dispatchEvent(new CustomEvent(te.event,{detail:te.detail,bubbles:!0,composed:!0})):(n+=se+`
`,ne=!0)}ne&&this.updateMessage(r,n)}n||this.updateMessage(r,"⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).")}catch(d){console.error("Error en el flujo SSE:",d);const c=d?.message??String(d);(c==="Failed to fetch"||c==="network error"||c==="Load failed")&&!n?this.updateMessage(r,"⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible."):this.updateMessage(r,"⚠️ Error: "+c)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value="")},250),this.messageInputElement?.removeAttribute("disabled"),this.messageInputElement?.focus()}},this.closeChat=()=>{this.dispatchEvent(new CustomEvent("close-requested",{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{const e=this.messageInputElement?.value?.trim()??"";e&&this.send(new CustomEvent("submit",{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key==="Enter"&&(e.preventDefault(),this.submitFromInput())}}connectedCallback(){super.connectedCallback(),this.probeLocalAgent();const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){const t=new e;this.recognition=t,t.lang="es-ES",t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=a=>{console.error("Error de reconocimiento: "+a.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:"smooth"})},0)}addMessage(e,t){const a={text:e,time:new Date().toLocaleTimeString(),userName:t.includes("agent")?"Asistente":"Tú",userColorIndex:t.includes("agent")?2:1};return this.items=[...this.items,a],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((a,s)=>s===e?{...a,text:t}:a),this.scrollBottom()}tryParseCustomEvent(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const a=JSON.parse(t);if(typeof a.event=="string")return{event:a.event,detail:a.detail??{}}}catch{}return null}tryParseTokenUsage(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const a=JSON.parse(t);if("inputTokens"in a||"outputTokens"in a||"totalTokens"in a)return a}catch{}return null}buildMenuContext(e,t=[]){const a=[];for(const s of e){if(s.separator||s.remote)continue;const i=[...t,s.label];if(s.submenus&&s.submenus.length>0)a.push(...this.buildMenuContext(s.submenus,i));else{const r={path:i,navigation:{route:s.route,consumedRoute:s.consumedRoute,actionId:s.actionId??"",baseUrl:s.baseUrl,serverSideType:s.serverSideType,uriPrefix:s.uriPrefix}};s.description&&(r.description=s.description),a.push(r)}}return a}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}render(){return o`
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
                        ${Ah}
                    </button>
                </div>
                <div class="scroll-container">
                    <div class="message-list" role="list">
                        ${this.items.map(e=>o`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${Dh(e.userColorIndex)};">${Nh(e.userName)}</div>
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
                    >${zh}</button>
                    <input class="msg-input"
                           placeholder="Message"
                           aria-label="Message"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">Send</button>
                </div>
            </div>
        `}};G.styles=[us,C`
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
    `];Q([p({attribute:!1})],G.prototype,"contextProvider",2);Q([p()],G.prototype,"localAgentUrl",2);Q([p({attribute:!1})],G.prototype,"mcpUrl",2);Q([$()],G.prototype,"localAgentAlive",2);Q([p()],G.prototype,"sseUrl",2);Q([p()],G.prototype,"uploadUrl",2);Q([p({attribute:!1})],G.prototype,"menu",2);Q([$()],G.prototype,"attachments",2);Q([$()],G.prototype,"uploading",2);Q([Be(".file-input")],G.prototype,"fileInputElement",2);Q([p({type:Boolean,reflect:!0})],G.prototype,"expanded",2);Q([p()],G.prototype,"items",2);Q([Be(".scroll-container")],G.prototype,"scrollContainer",2);Q([Be(".msg-input")],G.prototype,"messageInputElement",2);Q([$()],G.prototype,"recognition",2);Q([$()],G.prototype,"listening",2);Q([$()],G.prototype,"recognitionAvailable",2);Q([$()],G.prototype,"loading",2);Q([$()],G.prototype,"elapsedSeconds",2);Q([$()],G.prototype,"tokenUsage",2);G=Q([k("mateu-chat")],G);var Fh=Object.defineProperty,Mh=Object.getOwnPropertyDescriptor,Si=(e,t,a,s)=>{for(var i=s>1?void 0:s?Mh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Fh(t,a,i),i};let xa=class extends S{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.data&&this.createChart(this.data)}async createChart(e){const[{default:t}]=await Promise.all([Oe(()=>import("./vendor-chartjs.js").then(s=>s.a),[]),Oe(()=>import("./vendor-chartjs.js").then(s=>s.c),[])]);if(e!==this.data)return;this.chart&&this.chart.destroy();const a={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,a)}handleSlotChange(){}render(){return o`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};xa.styles=C`
  `;Si([p()],xa.prototype,"type",2);Si([p()],xa.prototype,"data",2);Si([p()],xa.prototype,"options",2);Si([Be("#chart")],xa.prototype,"chartElement",2);xa=Si([k("mateu-chart")],xa);var qh=Object.defineProperty,Uh=Object.getOwnPropertyDescriptor,er=(e,t,a,s)=>{for(var i=s>1?void 0:s?Uh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&qh(t,a,i),i};let hi=class extends S{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){const{default:t}=await Oe(async()=>{const{default:s}=await import("./vendor-diagrams.js").then(i=>i.i);return{default:s}},__vite__mapDeps([5,3,1,2,4]));if(e!==this.xml)return;this.chart&&this.chart.destroy();const a={container:this.divElement};this.chart=new t(a),this.chart.importXML(e)}handleSlotChange(){}render(){return o`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};hi.styles=C`
  `;er([p()],hi.prototype,"xml",2);er([Be("#canvas")],hi.prototype,"divElement",2);hi=er([k("mateu-bpmn")],hi);var Bh=Object.defineProperty,Vh=Object.getOwnPropertyDescriptor,Ka=(e,t,a,s)=>{for(var i=s>1?void 0:s?Vh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Bh(t,a,i),i};const ws=160,lt=56,Hh=220,Sr=110,qt=60,Wh={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},Gh={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},Kh=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];function Yh(){return"step-"+Math.random().toString(36).slice(2,8)}let Zt=class extends S{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.wf={name:"New Workflow",steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value")){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){const e=this.wf.steps??[],t={};e.forEach(n=>{t[n.id]=0});let a=!0;for(;a;)a=!1,e.forEach(n=>{if(n.preconditionStepId!=null&&t[n.preconditionStepId]!==void 0){const d=t[n.preconditionStepId]+1;d>t[n.id]&&(t[n.id]=d,a=!0)}});const s={};e.forEach(n=>{const d=t[n.id]??0;(s[d]??=[]).push(n.id)});const i={...this.positions};let r=!1;Object.entries(s).forEach(([n,d])=>{const c=Number(n);d.forEach((u,m)=>{i[u]||(i[u]={x:qt+c*Hh,y:qt+m*Sr},r=!0)})}),r&&(this.positions=i)}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addStep(){const e=Yh(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(i=>i.y),s=a.length?Math.max(...a)+Sr:qt;this.positions={...this.positions,[e]:{x:qt,y:s}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(s=>s.id!==e).map(s=>s.preconditionStepId===e?{...s,preconditionStepId:void 0}:s)};const{[e]:t,...a}=this.positions;this.positions=a,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},s=this.toSvgPoint(e);this.dragOffset={x:s.x-a.x,y:s.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(s=>s.x))+ws+qt:600,a=e.length?Math.max(...e.map(s=>s.y))+lt+qt:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return o`
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
                    ${Xs}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${Qs}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Zs}
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
        `}renderArrow(e){if(!e.preconditionStepId)return X``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return X``;const s=t.x+ws,i=t.y+lt/2,r=a.x,n=a.y+lt/2,d=(s+r)/2;return X`
            <path d="M${s},${i} C${d},${i} ${d},${n} ${r},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:qt,y:qt},a=Wh[e.type]??"#64748b",s=Gh[e.type]??"•",i=this.selectedId===e.id;return X`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${r=>this.onNodeMouseDown(r,e.id)}"
               @click="${r=>{r.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${ws}" height="${lt}" rx="8"
                      fill="white"
                      stroke="${i?a:"#e2e8f0"}"
                      stroke-width="${i?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${lt}" rx="8" fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${lt}" fill="${a}"/>
                <text x="16" y="${lt/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${s}</text>
                <!-- name -->
                <text x="44" y="${lt/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+"…":e.name}
                </text>
                <text x="44" y="${lt/2+8}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${lt/2+20}" font-size="9" fill="${a}">${e.type}</text>
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
                            ${Kh.map(s=>o`<option value="${s}" ?selected="${e.type===s}">${s}</option>`)}
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
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),s=document.createElement("a");s.href=a,s.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(a)}};Zt.styles=[us,C`
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
    `];Ka([p()],Zt.prototype,"value",2);Ka([$()],Zt.prototype,"wf",2);Ka([$()],Zt.prototype,"positions",2);Ka([$()],Zt.prototype,"selectedId",2);Ka([$()],Zt.prototype,"showMeta",2);Zt=Ka([k("mateu-workflow")],Zt);var Jh=Object.defineProperty,Xh=Object.getOwnPropertyDescriptor,At=(e,t,a,s)=>{for(var i=s>1?void 0:s?Xh(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Jh(t,a,i),i};const Za=160,Je=56,Ut=60,Qh={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},Zh={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},em=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];let ks;const tm=()=>(ks||(ks=Oe(()=>import("./vendor-diagrams.js").then(e=>e.e),__vite__mapDeps([5,3,1,2,4])).then(e=>new e.default)),ks);function am(){return"step-"+Math.random().toString(36).slice(2,8)}let at=class extends S{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.readOnly=!1,this.wf={name:"New Workflow",steps:[]},this.positions={},this.layoutReady=!1,this.selectedId=null,this.showMeta=!1,this.layoutError=null,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.elkPositioned=new Set,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.elkPositioned.add(this.draggingId),this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value"))try{const t=JSON.parse(this.value),a=new Set((this.wf.steps??[]).map(r=>r.id)),s=new Set((t.steps??[]).map(r=>r.id)),i=a.size!==s.size||[...s].some(r=>!a.has(r))||[...s].some(r=>{const n=(this.wf.steps??[]).find(c=>c.id===r),d=(t.steps??[]).find(c=>c.id===r);return n?.preconditionStepId!==d?.preconditionStepId});this.wf=t,(i||!this.layoutReady)&&this.runElkLayout()}catch{}}async runElkLayout(){const e=this.wf.steps??[];if(e.length===0){this.positions={},this.layoutReady=!0;return}const t={id:"root",layoutOptions:{"elk.algorithm":"layered","elk.direction":"RIGHT","elk.spacing.nodeNode":"40","elk.layered.spacing.nodeNodeBetweenLayers":"80","elk.edgeRouting":"ORTHOGONAL","elk.layered.nodePlacement.strategy":"BRANDES_KOEPF"},children:e.map(a=>({id:a.id,width:Za,height:Je})),edges:e.filter(a=>a.preconditionStepId).map(a=>({id:`${a.preconditionStepId}->${a.id}`,sources:[a.preconditionStepId],targets:[a.id]}))};try{const s=await(await tm()).layout(t),i={...this.positions};for(const r of s.children??[])(!this.elkPositioned.has(r.id)||!i[r.id])&&(i[r.id]={x:(r.x??0)+Ut,y:(r.y??0)+Ut},this.elkPositioned.add(r.id));this.positions=i,this.layoutReady=!0,this.layoutError=null}catch(a){this.layoutError=a?.message??"ELK layout failed",this.layoutReady=!0}}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){const a=this.wf.steps.map(r=>r.id===e?{...r,...t}:r),s=this.wf.steps.find(r=>r.id===e),i=t.preconditionStepId!==void 0&&t.preconditionStepId!==s?.preconditionStepId;this.wf={...this.wf,steps:a},i&&(this.elkPositioned.clear(),this.runElkLayout()),this.emit()}addStep(){const e=am(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(s=>s.x);this.positions={...this.positions,[e]:{x:a.length?Math.max(...a)+Za+80:Ut,y:Ut}},this.selectedId=e,this.elkPositioned.clear(),this.runElkLayout(),this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(s=>s.id!==e).map(s=>s.preconditionStepId===e?{...s,preconditionStepId:void 0}:s)};const{[e]:t,...a}=this.positions;this.positions=a,this.elkPositioned.delete(e),this.selectedId===e&&(this.selectedId=null),this.runElkLayout(),this.emit()}onNodeMouseDown(e,t){if(this.readOnly)return;e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},s=this.toSvgPoint(e);this.dragOffset={x:s.x-a.x,y:s.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}relayout(){this.elkPositioned.clear(),this.runElkLayout()}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(s=>s.x))+Za+Ut:600,a=e.length?Math.max(...e.map(s=>s.y))+Je+Ut:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){if(!this.layoutReady)return o`<div class="loading">Computing layout…</div>`;const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return o`
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
                    ${Rh}
                    Re-layout
                </button>
                ${this.readOnly?l:o`
                    <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                        ${Xs}
                        Settings
                    </button>
                    <button class="nbtn primary" @click="${()=>this.addStep()}">
                        ${Qs}
                        Add Step
                    </button>
                `}
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Zs}
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
        `}renderArrow(e){if(!e.preconditionStepId)return X``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return X``;const s=t.x+Za,i=t.y+Je/2,r=a.x,n=a.y+Je/2,d=(s+r)/2;return X`
            <path d="M${s},${i} C${d},${i} ${d},${n} ${r},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:Ut,y:Ut},a=Qh[e.type]??"#64748b",s=Zh[e.type]??"•",i=this.selectedId===e.id,r=e.name.length>16?e.name.slice(0,15)+"…":e.name;return X`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${n=>this.onNodeMouseDown(n,e.id)}"
               @click="${n=>{n.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${Za}" height="${Je}" rx="8"
                      fill="white"
                      stroke="${i?a:"#e2e8f0"}"
                      stroke-width="${i?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge strip -->
                <rect x="0" y="0" width="32" height="${Je}" rx="8"
                      fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${Je}" fill="${a}"/>
                <text x="16" y="${Je/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${s}</text>
                <!-- labels -->
                <text x="44" y="${Je/2-6}" font-size="11"
                      fill="#1e293b" font-weight="600">${r}</text>
                <text x="44" y="${Je/2+8}" font-size="9"
                      fill="#94a3b8">${e.id}</text>
                <text x="44" y="${Je/2+20}" font-size="9"
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
                    ${a?l:o`<button class="del-btn" title="Delete step"
                            @click="${()=>this.deleteStep(e.id)}">🗑</button>`}
                    <button class="close-btn"
                            @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${s("ID",o`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${s("Name",o`<input class="inp" ?readonly="${a}" .value="${e.name}"
                        @change="${a?l:i=>this.updateStep(e.id,{name:i.target.value})}"/>`)}
                    ${s("Type",o`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?l:i=>this.updateStep(e.id,{type:i.target.value})}">
                            ${em.map(i=>o`
                                <option value="${i}" ?selected="${e.type===i}">${i}</option>`)}
                        </select>`)}
                    ${s("Description",o`<textarea class="inp" rows="2" ?readonly="${a}"
                        @change="${a?l:i=>this.updateStep(e.id,{description:i.target.value})}">${e.description??""}</textarea>`)}
                    ${s("Precondition step",o`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?l:i=>this.updateStep(e.id,{preconditionStepId:i.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(i=>o`
                                <option value="${i.id}" ?selected="${e.preconditionStepId===i.id}">
                                    ${i.name} (${i.id})
                                </option>`)}
                        </select>`)}
                    ${s("Precondition expression",o`
                        <input class="inp" placeholder="JEXL expression" ?readonly="${a}"
                               .value="${e.preconditionExpression??""}"
                               @change="${a?l:i=>this.updateStep(e.id,{preconditionExpression:i.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}" ?disabled="${a}"
                               @change="${a?l:i=>this.updateStep(e.id,{parallel:i.target.checked})}"/>
                    </div>
                    ${s("Timeout (ms)",o`
                        <input class="inp" type="number" min="0" ?readonly="${a}"
                               .value="${String(e.timeout??0)}"
                               @change="${a?l:i=>this.updateStep(e.id,{timeout:Number(i.target.value)})}"/>`)}
                    ${s("Retries",o`
                        <input class="inp" type="number" min="0" ?readonly="${a}"
                               .value="${String(e.retries??0)}"
                               @change="${a?l:i=>this.updateStep(e.id,{retries:Number(i.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}" ?disabled="${a}"
                               @change="${a?l:i=>this.updateStep(e.id,{rollbackable:i.target.checked})}"/>
                    </div>
                    ${e.rollbackable?s("Compensation step",o`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?l:i=>this.updateStep(e.id,{compensationStepId:i.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(i=>o`
                                <option value="${i.id}" ?selected="${e.compensationStepId===i.id}">
                                    ${i.name} (${i.id})
                                </option>`)}
                        </select>`):""}
                    ${e.type==="ACTION"?s("Topic",o`
                        <input class="inp" placeholder="kafka.topic.name" ?readonly="${a}"
                               .value="${e.topic??""}"
                               @change="${a?l:i=>this.updateStep(e.id,{topic:i.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?s("Form ID",o`
                        <input class="inp" ?readonly="${a}" .value="${e.formId??""}"
                               @change="${a?l:i=>this.updateStep(e.id,{formId:i.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?s("Child workflow ID",o`
                        <input class="inp" ?readonly="${a}" .value="${e.childWorkflowDefinitionId??""}"
                               @change="${a?l:i=>this.updateStep(e.id,{childWorkflowDefinitionId:i.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),s=document.createElement("a");s.href=a,s.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(a)}};at.styles=[us,C`
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
    `];At([p()],at.prototype,"value",2);At([p({type:Boolean})],at.prototype,"readOnly",2);At([$()],at.prototype,"wf",2);At([$()],at.prototype,"positions",2);At([$()],at.prototype,"layoutReady",2);At([$()],at.prototype,"selectedId",2);At([$()],at.prototype,"showMeta",2);At([$()],at.prototype,"layoutError",2);at=At([k("mateu-workflow-elk")],at);var im=Object.defineProperty,sm=Object.getOwnPropertyDescriptor,Ii=(e,t,a,s)=>{for(var i=s>1?void 0:s?sm(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&im(t,a,i),i};const rm=["string","integer","number","bool","date","time","dateTime","dateRange","money","file","array","status","component","menu","range","action","actionGroup"],om=["regular","radio","checkbox","textarea","toggle","combobox","select","email","password","richText","listBox","html","markdown","image","icon","link","money","grid","color","choice","popover","slider","button","stars"],nm={string:"#3B82F6",integer:"#8B5CF6",number:"#6366F1",bool:"#10B981",date:"#F59E0B",time:"#F59E0B",dateTime:"#F59E0B",dateRange:"#F59E0B",money:"#EF4444",file:"#64748B",array:"#0EA5E9",status:"#EC4899",component:"#14B8A6",menu:"#94A3B8",range:"#A855F7",action:"#F97316",actionGroup:"#FB923C"};function Ir(){return"field-"+Math.random().toString(36).slice(2,8)}let wa=class extends S{constructor(){super(...arguments),this.value='{"name":"New Form","fields":[]}',this.form={name:"New Form",fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has("value"))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){const e=this.shadowRoot?.querySelector(".field-list");!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=rn.create(e,{animation:150,handle:".drag-handle",ghostClass:"sortable-ghost",onEnd:t=>{const{oldIndex:a,newIndex:s}=t;if(a===void 0||s===void 0||a===s)return;const i=[...this.form.fields],[r]=i.splice(a,1);i.splice(s,0,r),this.form={...this.form,fields:i},this.emit()}}))}emit(){const e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addField(){const e=Ir(),t={id:e,label:"New Field",dataType:"string"};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){const t=this.form.fields.find(r=>r.id===e);if(!t)return;const a={...t,id:Ir(),label:t.label+" (copy)"},s=this.form.fields.findIndex(r=>r.id===e),i=[...this.form.fields];i.splice(s+1,0,a),this.form={...this.form,fields:i},this.selectedId=a.id,this.emit()}render(){return o`
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
                    ${Xs}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${Qs}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Zs}
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
        `}renderRow(e){const t=nm[e.dataType]??"#64748b",a=this.selectedId===e.id;return o`
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
                        @click="${s=>{s.stopPropagation(),this.duplicateField(e.id)}}">⧉</button>
                <button class="row-btn danger" title="Delete"
                        @click="${s=>{s.stopPropagation(),this.deleteField(e.id)}}">🗑</button>
            </div>
        `}renderPanel(){const e=this.form.fields.find(a=>a.id===this.selectedId);if(!e)return l;const t=(a,s)=>o`
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
                            ${rm.map(a=>o`
                                <option value="${a}" ?selected="${e.dataType===a}">${a}</option>`)}
                        </select>`)}
                    ${t("Stereotype",o`
                        <select class="inp"
                                @change="${a=>this.updateField(e.id,{stereotype:a.target.value||void 0})}">
                            ${om.map(a=>o`
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
        `}exportJson(){const e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),s=document.createElement("a");s.href=a,s.download=(this.form.name??"form").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(a)}};wa.styles=[us,C`
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
    `];Ii([p()],wa.prototype,"value",2);Ii([$()],wa.prototype,"form",2);Ii([$()],wa.prototype,"selectedId",2);Ii([$()],wa.prototype,"showMeta",2);wa=Ii([k("mateu-form-editor")],wa);var lm=Object.defineProperty,dm=Object.getOwnPropertyDescriptor,wt=(e,t,a,s)=>{for(var i=s>1?void 0:s?dm(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&lm(t,a,i),i};let Ue=class extends S{constructor(){super(...arguments),this.appState={},this.appData={},this.open=!1,this.activeTab="appstate",this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith("mateu-")&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset="",this._prevTarget=null,this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset=""),this._prevTarget=t,t.style.outline="2px solid #0070f3",t.style.outlineOffset="-2px",this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||"",this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener("mouseover",this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mouseover",this._onMouseover,!0),this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget=null)}_fmt(e){try{return JSON.stringify(e,null,2)??"null"}catch{return String(e)}}_renderTab(e,t){return o`
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
        `}};Ue.styles=C`
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
    `;wt([p()],Ue.prototype,"appState",2);wt([p()],Ue.prototype,"appData",2);wt([$()],Ue.prototype,"open",2);wt([$()],Ue.prototype,"activeTab",2);wt([$()],Ue.prototype,"hoveredTag",2);wt([$()],Ue.prototype,"hoveredId",2);wt([$()],Ue.prototype,"hoveredState",2);wt([$()],Ue.prototype,"hoveredData",2);wt([$()],Ue.prototype,"hoveredMeta",2);Ue=wt([k("mateu-debug-overlay")],Ue);var Xe=(e=>(e.SetAppDataValue="SetAppDataValue",e.SetAppStateValue="SetAppStateValue",e.SetDataValue="SetDataValue",e.RunAction="RunAction",e.RunJS="RunJS",e.SetAttributeValue="SetAttributeValue",e.SetStateValue="SetStateValue",e.SetCssClass="SetCssClass",e.SetStyle="SetStyle",e))(Xe||{}),Fo=(e=>(e.required="required",e.disabled="disabled",e.hidden="hidden",e.pattern="pattern",e.minValue="minValue",e.maxValue="maxValue",e.minLength="minLength",e.maxLength="maxLength",e.css="css",e.style="style",e.theme="theme",e.errorMessage="errorMessage",e.description="description",e.none="none",e))(Fo||{}),Mo=(e=>(e.Continue="Continue",e.Stop="Stop",e))(Mo||{}),cm=Object.defineProperty,um=Object.getOwnPropertyDescriptor,ps=(e,t,a,s)=>{for(var i=s>1?void 0:s?um(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&cm(t,a,i),i};let ei=null,Fa=class extends la{constructor(){super(...arguments),this.baseUrl="",this.route="",this.consumedRoute="",this.formerState={},this.applyRules=()=>{const e=this.component.rules;if(e&&e.length>0){const t=this.state,a=this.data,s=this.appState,i=this.appData,r=this.component,n=y=>jr(y,t,a,{appState:s,appData:i,component:r}),d=y=>Ar(y,t,a,s,i,{component:r}),c=["state","data","appState","appData","component"],u=[t,a,s,i,r],m={...this.state},h={...this.data};let f=!1,g=!1;for(let y=0;y<e.length;y++){const x=e[y];try{if(n(x.filter)){if(Xe.SetStateValue==x.action||Xe.SetDataValue==x.action){const T=Xe.SetStateValue==x.action?m:h,U=x.fieldName.split(",");for(let ae=0;ae<U.length;ae++){const F=U[ae];if(!T[F]||T[F]!=x.value){const ne=x.expression?d(x.expression):x.value,ue=Fo.none==x.fieldAttribute?F:F+"."+x.fieldAttribute;ne!=T[ue]&&(T[ue]=ne,Xe.SetStateValue==x.action&&(f=!0),Xe.SetDataValue==x.action&&(g=!0))}}}if(Xe.RunAction==x.action&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:x.actionId},bubbles:!0,composed:!0})),Xe.RunJS==x.action&&new Function(...c,x.value)(...u),Xe.SetAttributeValue==x.action){const T=x.expression?n(x.expression):x.value;if(x.fieldAttribute=="disabled"){T?this.shadowRoot?.getElementById(x.fieldName)?.setAttribute(x.fieldAttribute,"disabled"):this.shadowRoot?.getElementById(x.fieldName)?.removeAttribute(x.fieldAttribute);continue}this.shadowRoot?.getElementById(x.fieldName)?.setAttribute(x.fieldAttribute,T)}if(Xe.SetCssClass==x.action&&this.shadowRoot?.getElementById(x.fieldName)?.setAttribute("class",x.value),Xe.SetStyle==x.action&&this.shadowRoot?.getElementById(x.fieldName)?.style.setProperty(x.expression,x.value),Mo.Stop==x.result)break}}catch(T){console.error("rule failed",x,T)}}f&&(this.state=m),g&&(this.data=h),f&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes("-"),this.checkValidations=e=>{const t=e?e.split(","):void 0,a=this.component.validations;let s=!0,i=!1;const r=this.data??{},n={...this.data??{},errors:{}};if(a){for(let d=0;d<a.length;d++){const c=a[d];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let m=0;m<u.length;m++){const h=u[m];n.errors[h]=[]}}for(let d=0;d<a.length;d++){const c=a[d];if(!this.skipValidation(t,c))try{const u=c.condition&&c.condition.includes("${")?this._evalTemplate(c.condition):this._evalExpr(c.condition);if(c.condition&&!u){s=!1;const h=(c.fieldId??"_component").split(",");for(let f=0;f<h.length;f++){const g=h[f];let y=n.errors[g];if(y||(n.errors[g]=[]),y=n.errors[g],!r[g]){let x=c.message;try{x=this._evalTemplate(c.message)}catch{}y.push(x)}}}}catch(u){console.error("validation failed",c,u)}}for(let d=0;d<a.length;d++){const c=a[d];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let m=0;m<u.length;m++){const h=u[m];if(r.errors?[h].join(","):n.errors==""&&[h].join(",")){i=!0;break}}}(r.errors?["_component"].join(","):n.errors==""&&["_component"].join(","))&&(i=!0)}n._valid=s,n._valid!=r._valid&&(i=!0),i&&(this.data=n)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};t.fieldIds.forEach(s=>{a[s]=void 0}),a.searchText=void 0,this.state={...this.state,...a}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};a[t.key]=t.value,e.type=="data-changed"&&(this.data={...this.data,...a})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail;if(e.type=="value-changed"){const a={...this.state};a[t.fieldId]=t.value,this.state=a,(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("dirty",{detail:e.detail,bubbles:!0,composed:!0}));const s=this.component;s.triggers?.filter(i=>i.type==Bt.OnValueChange).filter(i=>!i.propertyName||t.fieldId==i.propertyName).forEach(i=>{(!i.condition||this._evalExpr(i.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))}),s.triggers?.filter(i=>i.type==Bt.AutoSave).forEach(i=>{const r=i.actionId,n=this._autoSaveTimers.get(r);n!==void 0&&clearTimeout(n),this._autoSaveTimers.set(r,setTimeout(()=>{this._autoSaveTimers.delete(r),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))},i.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{const t=e.detail;if(e.type=="action-requested"){e.preventDefault(),e.stopPropagation();const a=this.component,s=a.actions?.find(i=>i.id==t.actionId||i.id.endsWith("*")&&t.actionId.startsWith(i.id.replace("*","")));if(s){if(s&&s.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify("You first need to select some rows");return}if(s&&s.validationRequired){const r=ei??this;if(ei=null,r.checkValidations(s.fieldsToValidate),!r.data._valid){r.notifyValidationErrors();return}}ei=null;const i={...t,initiatorComponentId:this.id};s&&s.confirmationRequired?this.callAfterConfirmation(s,()=>this.requestActionCallToServerOrBubble(i,a,s)):this.requestActionCallToServerOrBubble(i,a,s)}else{const i={...t.parameters};i.initiatorState||(i.initiatorState=this.state),ei||(ei=this),this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,parameters:i},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{const e={},t=a=>{if(a)for(const s of a){const i=s.metadata;if(i?.type===v.FormField){const r=i;r.fieldId&&r.label&&(e[r.fieldId]=r.label)}t(s.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{const e=this.data?.errors??{},t=this.buildFieldLabelMap(),a=[];if(Object.entries(e).forEach(([i,r])=>{if(!Array.isArray(r))return;const n=i==="_component"?void 0:t[i]??i;r.forEach(d=>{d&&!a.some(c=>c.label===n&&c.msg===d)&&a.push({label:n,msg:d})})}),a.length===0){this.notify("There are validation errors");return}const s=document.createElement("vaadin-notification");s.position="bottom-end",s.setAttribute("theme","error"),s.duration=Math.max(3e3,1500+a.length*1e3),s.renderer=i=>{Tr(o`
                <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs, .25rem);">
                    <strong>There are validation errors</strong>
                    ${a.map(({label:r,msg:n})=>r?o`<span>• <b>${r}:</b> ${n}</span>`:o`<span>• ${n}</span>`)}
                </div>
            `,i)},document.body.appendChild(s),s.opened=!0,s.addEventListener("opened-changed",i=>{i.detail.value||document.body.removeChild(s)})},this.notify=e=>{pa.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.callAfterConfirmation=(e,t)=>{let a="One moment, please",s="Are you sure?",i="Yes",r="No";e.confirmationTexts&&(a=e.confirmationTexts.title,s=e.confirmationTexts.message,i=e.confirmationTexts.confirmationText,r=e.confirmationTexts.denialText);const n=document.createElement("vaadin-confirm-dialog");n.setAttribute("header",a),n.setAttribute("cancel-button-visible","cancel-button-visible"),n.setAttribute("confirm-text",i),n.setAttribute("cancel-text",r),n.append(s),n.opened=!0,n.addEventListener("confirm",()=>t()),n.addEventListener("close",()=>document.body.removeChild(n)),n.addEventListener("confirm",()=>document.body.removeChild(n)),n.addEventListener("cancel",()=>document.body.removeChild(n)),n.addEventListener("reject",()=>document.body.removeChild(n)),document.body.append(n)},this.requestActionCallToServerOrBubble=(e,t,a)=>{if(a&&a.bubble){const s={...e.parameters};s.initiatorState||(s.initiatorState=this.state),this.dispatchEvent(new CustomEvent("action-requested",{detail:{...e,parameters:s},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,a)},this.requestActionCallToServer=(e,t,a)=>{if(a&&a.href){window.location.href=a.href;return}if(a&&a.js)try{new Function("state","data","appState","appData","component",a.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(s){console.error("when evaluating "+a.js,s,this.component,this.state,this.data)}if(a&&a.customEvent&&this.dispatchEvent(new CustomEvent(a.customEvent.name,{detail:a.customEvent.detail,bubbles:!0,composed:!0})),!(a&&(a.js||a.customEvent))){if(e.actionId=="search"){const s=e.parameters?._searchState;s?this.state={...this.state,...s}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}this.dispatchEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:{...this.state},parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:a?.background,sse:a?.sse,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))}},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(s=>s.type==Bt.OnSuccess).filter(s=>e.detail.actionId==s.calledActionId).forEach(s=>{if(!s.condition||this._evalExpr(s.condition))if(e.preventDefault(),e.stopPropagation(),s.timeoutMillis>0){const i=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId,callbackToken:i},bubbles:!0,composed:!0}))},s.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(s=>s.type==Bt.OnError).filter(s=>e.detail.actionId==s.calledActionId).forEach(s=>{(!s.condition||this._evalExpr(s.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0})))})},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;const t=this.component;if(t)for(const a of t.actions??[]){const s=a.shortcut||(a.runOnEnter?"enter":null);if(s&&this._shortcutMatchesEvent(s,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return Z.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has("state")&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has("component")&&(this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}_shortcutMatchesEvent(e,t){return vl(e,t)}_collectShortcutTabs(){const e=this.renderRoot;if(!e)return[];const t=Array.from(e.querySelectorAll("vaadin-tab[data-shortcut]"));return e.querySelectorAll("mateu-drawer, mateu-dialog").forEach(a=>{const s=a.shadowRoot;s&&t.push(...Array.from(s.querySelectorAll("vaadin-tab[data-shortcut]")))}),t}_handleTabShortcut(e){const t=this._collectShortcutTabs();if(t.length===0)return!1;for(const a of Array.from(t)){const s=a.dataset.shortcut;if(!s||!this._shortcutMatchesEvent(s,e))continue;const i=a.closest("vaadin-tabs");if(!i)continue;const r=Array.from(i.querySelectorAll("vaadin-tab")).indexOf(a);if(!(r<0))return e.preventDefault(),i.selected=r,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.addEventListener("backend-call-failed",this.handleBackendFailed),document.addEventListener("keydown",this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.removeEventListener("backend-call-failed",this.handleBackendFailed),document.removeEventListener("keydown",this._keydownListener)}render(){return o`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?o`
                <div><ul>${this.data.errors._component.map(e=>o`<li>${e}</li>`)}</ul></div>
            `:l}</div>`}_render(){if(this.component?.type==oe.ClientSide){const e=this.component;return e.metadata?.type==v.Page?Is(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==v.Crud?_s(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):Z.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return o`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==oe.ClientSide){const t=e;if(t.metadata?.type==v.Page)return Is(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==v.Crud)return _s(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return w(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}};Fa.styles=C`
        :host {
        }

        ${Xo(ea.cssText)}
        
        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }
        
  `;ps([p()],Fa.prototype,"baseUrl",2);ps([p()],Fa.prototype,"route",2);ps([p()],Fa.prototype,"consumedRoute",2);Fa=ps([k("mateu-component")],Fa);const _r=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}},pm=fu,hm={fixed:"fixed",fullWidth:"full",edgeToEdge:"edge"},mm=new Set([v.Gantt,v.PlanningBoard,v.Kanban,v.Bpmn,v.Workflow,v.WorkflowElk,v.Map]),vm={landing:"fixed",form:"fixed",process:"fixed"},qo=e=>e?hm[e]:void 0,ka=e=>e.type==oe.ClientSide?e.metadata:void 0,Uo=e=>{const t=ka(e);if(t?.type==v.Page){const a=qo(t.pageWidth);if(a)return a}for(const a of e.children??[]){const s=Uo(a);if(s)return s}},Bo=e=>{const t=e.pageType;if(t)return t;const a=s=>{const i=ka(s);if(i?.type==v.Page&&i.pageType)return i.pageType;for(const r of s.children??[]){const n=a(r);if(n)return n}};return a(e)},fm=e=>{const t=ka(e);if(t?.type!=v.Crud)return!1;const a=t;return a.compact?!0:(a.columns??[]).some(s=>s.metadata?.editable)},Yi=(e,t)=>t(e)||(e.children??[]).some(a=>Yi(a,t)),bm=e=>!!e&&Yi(e,t=>ka(t)?.type==v.HeroSection),gm=e=>ka(e)?.type==v.App?!0:(e.children??[]).some(t=>ka(t)?.type==v.App),$m=(e,t)=>{if(!e)return"fixed";const a=qo(e.pageWidth)??Uo(e);if(a)return a;if(t?.top&&gm(e))return"edge";const s=vm[Bo(e)??""];return s||(Yi(e,i=>{const r=ka(i)?.type;return r!=null&&mm.has(r)})?"edge":Yi(e,fm)?"full":"fixed")};var ym=Object.defineProperty,xm=Object.getOwnPropertyDescriptor,De=(e,t,a,s)=>{for(var i=s>1?void 0:s?xm(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&ym(t,a,i),i};let fe=class extends rs{constructor(){super(...arguments),this.consumedRoute="",this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t=="string"&&(t===""||t.startsWith("/"))&&this.consumedRoute&&this.consumedRoute!=="_empty"&&this.consumedRoute.startsWith("/")&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t.startsWith("/")&&this.uriPrefix.endsWith("/")?t=this.uriPrefix+t.substring(1):!t.startsWith("/")&&!this.uriPrefix.endsWith("/")?t=this.uriPrefix+"/"+t:t=this.uriPrefix+t),this.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==""&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:oe.ClientSide,metadata:{type:v.Element,name:"div",content:"Not found"},id:"fieldId"},action:pi.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;const t=this.detail1;if(e.type=="server-side-action-requested"){let a=pm;t.sse&&(a=oo),a.runAction(oa,this.baseUrl,t.route??"",t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken)}},this.getCustomisedAppState=()=>{let e={...le.value};if(this.overrides){const t=_r(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw new Error("Method not implemented.")}createRenderRoot(){return Z.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.overridesParsed=_r(this.overrides),this.addEventListener("server-side-action-requested",this.actionRequestedListener),this.addEventListener("backend-call-failed",this.backendFailedListener),this.addEventListener("history-pushed",this.historyPushed),this.addEventListener("route-changed",this.routeChangedListener),window.Vaadin.featureFlags.masterDetailLayoutComponent=!0}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.actionRequestedListener),this.removeEventListener("backend-call-failed",this.backendFailedListener),this.removeEventListener("history-pushed",this.historyPushed),this.removeEventListener("route-changed",this.routeChangedListener)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(a=>a==="appState"||a==="appData")){const a=this.renderRoot.querySelector("mateu-component");if(a)return e.has("appState")&&(a.appState=this.appState),e.has("appData")&&(a.appData=this.appData),!1}return!0}updated(e){(e.has("id")||e.has("baseurl")||e.has("route")||e.has("consumedRoute")||e.has("instant"))&&(this.preventNavigation||(this.callbackToken=this.instant||ke(),this.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:"",serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,componentState:this.initialState,callbackToken:this.callbackToken},bubbles:!0,composed:!0})))),e.has("route")&&this.top&&(this.preventNavigation||this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&(this.preventNavigation=!1)}applyFragment(e){if(!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}};return}this.fragment=e,e.component&&(this.dataset.pageWidth=$m(e.component,{top:this.top}),this.dataset.pageType=Bo(e.component)??"",this.dataset.hasWelcomeBanner=String(bm(e.component)))}render(){return o`
           ${this.fragment?.component?w(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):l}
       `}};fe.styles=C`
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
  `;De([p()],fe.prototype,"consumedRoute",2);De([p()],fe.prototype,"serverSideType",2);De([p()],fe.prototype,"uriPrefix",2);De([p()],fe.prototype,"overrides",2);De([p()],fe.prototype,"homeRoute",2);De([p()],fe.prototype,"route",2);De([p()],fe.prototype,"top",2);De([p()],fe.prototype,"instant",2);De([p()],fe.prototype,"initialState",2);De([p()],fe.prototype,"appState",2);De([p()],fe.prototype,"appData",2);De([$()],fe.prototype,"fragment",2);fe=De([k("mateu-ux")],fe);var wm=Object.defineProperty,km=Object.getOwnPropertyDescriptor,ee=(e,t,a,s)=>{for(var i=s>1?void 0:s?km(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&wm(t,a,i),i};let K=class extends la{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0,this.commandPaletteDataHits=[],this.openDataHit=e=>{Ht.confirmLeave()&&(this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteDataHits=[],this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:e.route},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:e.route},bubbles:!0,composed:!0})))},this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this._openAiHandler=()=>{this.chatOpen||this.showHideIa()},this.isDark=document.documentElement.getAttribute("theme")==="dark",this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;const e=this.isDark?"dark":"light";document.documentElement.setAttribute("theme",e),localStorage.setItem("mateu-theme",e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?"detail":"detail-hidden")},this.runAction=e=>{const a=this.renderRoot.querySelector?.("mateu-component");a&&a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){const a=e[t];if(a.selected)return a;const s=this.getSelectedOption(a.submenus);if(s)return s}return null},this.itemSelected=e=>{const t=e.detail.value;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.itemSelectedTiles=e=>{const t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))},this.mapItemsForTiles=e=>e.map(t=>({text:t.label,consumedRoute:t.consumedRoute,route:t.route,baseUrl:t.baseUrl,serverSideType:t.serverSideType,uriPrefix:t.uriPrefix,actionId:t.actionId,selected:t.selected,_menuOption:t})),this.flattenMenuForPalette=(e,t)=>{const a=[];for(const s of e)if(!s.separator)if(s.submenus&&s.submenus.length>0){const i=t?`${t} › ${s.label}`:s.label;a.push(...this.flattenMenuForPalette(s.submenus,i))}else a.push({label:s.label,breadcrumb:t,consumedRoute:s.consumedRoute,route:s.route,actionId:s.actionId,baseUrl:s.baseUrl,serverSideType:s.serverSideType,uriPrefix:s.uriPrefix});return a},this.handleCommandPaletteKeydown=(e,t)=>{const a=Math.min(t.length,10),s=a+Math.min(this.commandPaletteDataHits.length,8);if(e.key==="ArrowDown")e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,s-1);else if(e.key==="ArrowUp")e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key==="Enter"){if(this.commandPaletteSelectedIndex>=a){const r=this.commandPaletteDataHits[this.commandPaletteSelectedIndex-a];r&&this.openDataHit(r);return}const i=t[this.commandPaletteSelectedIndex];i&&(this.selectRoute(i.consumedRoute,i.route,i.actionId,i.baseUrl,i.serverSideType,i.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery="")}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return l;const e=this.component?.metadata;if(e?.commandCenterEnabled)return l;if(!e?.menu)return l;const t=this.flattenMenuForPalette(e.menu,""),a=this.commandPaletteQuery.toLowerCase(),s=a?t.filter(i=>i.label.toLowerCase().includes(a)||i.breadcrumb.toLowerCase().includes(a)):t;return o`
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
                                ${i.breadcrumb?o`<span class="cmd-result-breadcrumb">${i.breadcrumb}</span>`:l}
                            </div>
                        `)}
                        ${a&&this.commandPaletteDataHits.length>0?o`
                            ${this.commandPaletteDataHits.slice(0,8).map((i,r)=>{const n=Math.min(s.length,10)+r,d=this.commandPaletteDataHits[r-1];return o`
                                    ${i.category&&i.category!==d?.category?o`
                                        <div class="cmd-category">${i.category}</div>`:l}
                                    <div class="cmd-result ${n===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                         @click=${()=>this.openDataHit(i)}
                                         @mouseenter=${()=>{this.commandPaletteSelectedIndex=n}}
                                    >
                                        <span class="cmd-result-label">${i.label}</span>
                                        ${i.description?o`<span class="cmd-result-breadcrumb">${i.description}</span>`:l}
                                    </div>`})}`:l}
                        ${s.length===0&&this.commandPaletteDataHits.length===0?o`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>`:l}
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
                            ${t.icon?o`<vaadin-icon icon="${t.icon}" style="font-size: 2rem; color: var(--lumo-primary-color); display: block; margin-bottom: 0.75rem;"></vaadin-icon>`:l}
                            <div class="nav-tile-title">${t.label}</div>
                            ${t.description?o`<div class="nav-tile-desc">${t.description}</div>`:l}
                        </div>
                    `)}
                </div>
            </div>
        `,this.goHome=()=>{const e=this.component.metadata;this.selectRoute(e.route,"_page","",void 0,void 0,void 0)},this.selectRoute=(e,t,a,s,i,r)=>{Ht.confirmLeave()&&this._selectRoute(e,t,a,s,i,r)},this._selectRoute=(e,t,a,s,i,r)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=s,this.selectedRoute=t,this.selectedServerSideType=i,this.selectedUriPrefix=r,this.instant=ke(),this.state&&this.state._route!=null&&(this.state._route=void 0);let n=this.baseUrl??"";n.indexOf("://")<0&&(n.startsWith("/")||(n="/"+n),n=window.location.origin+n),n.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let d=new URL(n+t);if(e&&d.pathname.startsWith(e)){const c=d.pathname.substring(e.length);d=new URL(d.origin+(c||"/"))}if((window.location.pathname||d.pathname)&&window.location.pathname!=d.pathname){let c=d.pathname;d.search&&(c+=d.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let u=c;this.selectedUriPrefix&&(u.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+u.substring(1):!u.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+"/"+u:u=this.selectedUriPrefix+u),u=="/_page"&&(u=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:u},bubbles:!0,composed:!0}))}}},this.mapItems=(e,t)=>e.map(a=>{if(a.submenus&&a.submenus.length>0){let s=this.mapItems(a.submenus,t);return t&&a.label.toLowerCase().includes(t)&&(s=this.mapItems(a.submenus,"")),s&&s.length>0?{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||a.selected,children:s}:void 0}if(a.separator)return t?void 0:{component:"hr"};if(!t||a.label.toLowerCase().includes(t))return{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||a.selected}}).filter(a=>a!=null),this.getSelectedIndex=e=>{if(e){const t=this.getSelectedOption(e);if(t)return e.indexOf(t)}return NaN},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?o`
                <vaadin-details summary="${e.label}" theme="reverse">
                    <vaadin-vertical-layout>
                        ${e.submenus.map(t=>o`${this.renderOptionOnLeftMenu(t)}`)}
                    </vaadin-vertical-layout>
                </vaadin-details>
`:o`<vaadin-button theme="tertiary" 
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)}"
        >${e.label}</vaadin-button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){const t=this.shadowRoot?.querySelector("mateu-ux");t&&t.setAttribute("instant",ke())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?o`
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
                                    `:l}
                                    ${s.text}
                                    ${this.renderSideNav(s.children,"children")}
                                </vaadin-side-nav-item>
                        `}

                            `})}`:l,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}createRenderRoot(){return Z.mustUseShadowRoot()?super.createRenderRoot():this}fetchGlobalSearch(e){const t=this.component?.metadata;if(t?.globalSearchEnabled){if(clearTimeout(this._globalSearchTimer),!e){this.commandPaletteDataHits=[];return}this._globalSearchTimer=setTimeout(async()=>{try{const s=(await oa.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","cmd-palette",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(i=>i.data).find(i=>i&&i._globalsearch);this.commandPaletteDataHits=s?._globalsearch??[]}catch{this.commandPaletteDataHits=[]}},250)}}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute("theme")==="dark",this._commandPaletteHandler=e=>{this.component?.metadata?.commandCenterEnabled||((e.metaKey||e.ctrlKey)&&e.key==="k"&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0),e.key==="Escape"&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery=""))},document.addEventListener("keydown",this._commandPaletteHandler),Ht.install(),this.addEventListener("compact-changed",this._compactHandler),this.addEventListener("mateu-open-ai",this._openAiHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener("keydown",this._commandPaletteHandler),this.removeEventListener("compact-changed",this._compactHandler),this.removeEventListener("mateu-open-ai",this._openAiHandler)}updated(e){if(super.updated(e),Wp(this),this.component){const a=this.component.metadata;if(a){const s=a;if(s.favicon){let i=document.querySelector("link[rel~='icon']");i||(i=document.createElement("link"),i.rel="icon",document.head.appendChild(i)),i.href=s.favicon}e.has("component")&&(this.selectedRoute=s.homeRoute,this.selectedConsumedRoute=s.homeConsumedRoute,this.selectedServerSideType=s.homeServerSideType,this.selectedBaseUrl=s.homeBaseUrl,this.selectedUriPrefix=s.homeUriPrefix)}}e.has("commandPaletteOpen")&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(".cmd-input")?.focus()},0)}render(){return Z.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}};K.styles=C`

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

  `;ee([$()],K.prototype,"filter",2);ee([$()],K.prototype,"instant",2);ee([$()],K.prototype,"selectedConsumedRoute",2);ee([$()],K.prototype,"selectedRoute",2);ee([$()],K.prototype,"selectedUriPrefix",2);ee([$()],K.prototype,"selectedBaseUrl",2);ee([$()],K.prototype,"selectedServerSideType",2);ee([$()],K.prototype,"selectedParams",2);ee([$()],K.prototype,"tilesMenuOption",2);ee([$()],K.prototype,"railOpenOption",2);ee([$()],K.prototype,"commandPaletteOpen",2);ee([$()],K.prototype,"commandPaletteQuery",2);ee([$()],K.prototype,"commandPaletteSelectedIndex",2);ee([$()],K.prototype,"commandPaletteDataHits",2);ee([$()],K.prototype,"pageCompact",2);ee([Be("mateu-chat")],K.prototype,"chat",2);ee([$()],K.prototype,"isDark",2);ee([$()],K.prototype,"chatOpen",2);ee([Be("vaadin-app-layout")],K.prototype,"vaadinAppLayout",2);K=ee([k("mateu-app")],K);var Cm=Object.defineProperty,Sm=Object.getOwnPropertyDescriptor,jt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Sm(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Cm(t,a,i),i};let it=class extends K{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.lastActionServerSideType=void 0,this.lastActionInitiatorComponentId=void 0,this.captureActionSST=e=>{const t=e.detail;typeof t?.serverSideComponentRoute=="string"&&t.serverSideComponentRoute.indexOf("_embeddedMediator=1")>=0||t?.serverSideType&&(this.lastActionServerSideType=t.serverSideType,this.lastActionInitiatorComponentId=t.initiatorComponentId)},this.handleUnhandledAction=e=>{if(this.component?.metadata?.variant==we.MEDIATOR)return;const a=e.detail;e.preventDefault(),e.stopPropagation();const s=this.renderRoot?.querySelector("#"+this.contentUxId);!s||typeof s.manageActionEvent!="function"||(this.lastActionServerSideType=this.selectedServerSideType,this.lastActionInitiatorComponentId=s.id,s.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:s.route??this.selectedRoute??"",consumedRoute:s.consumedRoute??this.selectedConsumedRoute??"",componentState:a.parameters?.initiatorState??{},parameters:a.parameters,actionId:a.actionId,serverSideType:this.selectedServerSideType??"",initiatorComponentId:s.id,initiator:s}})))},this.selectRoute=(e,t,a,s,i,r)=>{{const n=this.component?.metadata;if(n?.variant!=we.MEDIATOR&&!a&&(!s||s===this.baseUrl)&&(!i||i===n?.serverSideType)&&t!=null){if(!Ht.confirmLeave())return;this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:t},bubbles:!0,composed:!0}));return}}{this.selectedConsumedRoute=e,this.selectedBaseUrl=s,this.selectedRoute=t,this.selectedServerSideType=i,this.selectedUriPrefix=r,this.instant=ke();let n=this.baseUrl??"";n.indexOf("://")<0&&(n.startsWith("/")||(n="/"+n),n=window.location.origin+n),n.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let d=new URL(n+t);if(e&&(t??"").startsWith(e)&&(d=new URL(n+t?.substring(e.length))),(window.location.pathname||d.pathname)&&window.location.pathname!=d.pathname){let c=d.pathname;d.search&&(c+=d.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let u=c;this.selectedUriPrefix&&(u.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+u.substring(1):!u.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+"/"+u:u=this.selectedUriPrefix+u),u=="_page"&&(u=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:u},bubbles:!0,composed:!0}))}}},this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.ds=e=>e&&e!=="undefined"&&e!=="null"?e:void 0,this.tabSelected=(e,t,a)=>{this.selectRoute(this.ds(e.detail.tab.dataset.consumedRoute),this.ds(e.detail.tab.dataset.route),this.ds(e.detail.tab.dataset.actionId),this.ds(e.detail.tab.dataset.baseUrl),this.ds(e.detail.tab.dataset.serverSideType),this.ds(e.detail.tab.dataset.uriPrefix))},this.mode=Ei.Auto,this.toggle=e=>{this.mode=this.mode==Ei.Expanded?Ei.Collapsed:Ei.Expanded,e.requestUpdate()},this.selected=(e,t,a,s)=>{const i=this.renderRoot.querySelector('[data-path = "'+e.detail.value+'"]');if(i){this.selectRoute(this.ds(i.dataset.consumedRoute),this.ds(i.dataset.route),this.ds(i.dataset.actionId),this.ds(i.dataset.baseUrl),this.ds(i.dataset.serverSideType),this.ds(i.dataset.uriPrefix));return}const r=d=>{for(const c of d??[]){if(c.route===e.detail.value||c.path===e.detail.value)return c;const u=r(c.submenus);if(u)return u}},n=r(s?.menu);n?this.selectRoute(n.consumedRoute,n.route,n.actionId,n.baseUrl,n.serverSideType,n.uriPrefix):console.error("No item found for selected route",e.detail.value)},this.runHeaderAction=async(e,t)=>{if(t)try{await lo(e,this,t)}catch(a){const s=document.createElement("div");s.style.cssText="position: fixed; bottom: 1rem; left: 1rem; z-index: 10000; background: var(--oj-core-danger-3, #b3311f); color: #fff; padding: .75rem 1rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,.25); font-size: .875rem;",s.textContent="The action failed: "+(""+a),document.body.appendChild(s),setTimeout(()=>s.remove(),6e3)}},this.renderContextActions=e=>o`
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
    `}get contentUxId(){return this._contentUxId||(this._contentUxId="ux_"+(window.location.pathname||"root").replace(/[^a-zA-Z0-9]/g,"_")+"_app"),this._contentUxId}connectedCallback(){super.connectedCallback(),this.addEventListener("server-side-action-requested",this.captureActionSST,!0),this.addEventListener("action-requested",this.handleUnhandledAction),this.innerFragmentSubscription=Vt.subscribe(e=>{const t=e.fragment;if(t&&this.lastActionInitiatorComponentId&&t.targetComponentId===this.lastActionInitiatorComponentId&&t.state?._route!==void 0){const a=t.state._route;if(a!==""&&!a.startsWith("/")){this.lastActionInitiatorComponentId=void 0,this.lastActionServerSideType=void 0;return}const s=t.state._componentRoute||"",i=this.component?.metadata,r=this.renderRoot?.querySelector("#"+this.contentUxId),n=r?.consumedRoute&&r.consumedRoute!=="_empty"?r.consumedRoute:"",d=s||this.selectedConsumedRoute||n||i?.homeConsumedRoute||"",c=d+a;this.lastActionInitiatorComponentId=void 0,c!==this.selectedRoute&&(this.selectedConsumedRoute=d,this.selectedRoute=c,this.lastActionServerSideType&&(this.selectedServerSideType=this.lastActionServerSideType),this.state&&this.state._route!=null&&(this.state._route=void 0),this.instant=ke()),this.lastActionServerSideType=void 0}})}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.captureActionSST,!0),this.removeEventListener("action-requested",this.handleUnhandledAction),this.innerFragmentSubscription?.unsubscribe()}render(){const e=this.component.metadata,t=this.data.opened==null?!0:this.data.opened;this.data.opened=t;const a=i=>{this.data.opened=!this.data.opened,this.requestUpdate()},s=i=>{this.data.opened=!1,this.requestUpdate()};if(e.variant==we.MEDIATOR)return o`
                        <mateu-api-caller>
                            <mateu-ux
                                    route="${Pe(this.state,this,e)}"
                                    id="ux_${this.id}"
                                    baseUrl="${$e(this,e)}"
                                    consumedRoute="${ie(this,e)}"
                                    serverSideType="${ye(this,e)}"
                                    uriPrefix="${xe(this,e)}"
                                    style="width: 100%;"
                                    .appState="${this.appState}"
                                    .appData="${this.appData}"
                                    instant="${this.instant}"
                                    @navigation-requested="${this.updateRoute}"
                            ></mateu-ux>
                        </mateu-api-caller>
`;if(we.TABS==e.variant){const i=e.menu.map(r=>({label:r.label,itemKey:r.route}));return o`<div>
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
                <div class="content" style="padding-bottom: 2rem;">
                    <mateu-api-caller style="width: 100%;">
                        <mateu-ux
                                route="${Pe(this.state,this,e)}"
                                id="${this.contentUxId}"
                                baseUrl="${$e(this,e)}"
                                consumedRoute="${ie(this,e)}"
                                serverSideType="${ye(this,e)}"
                                uriPrefix="${xe(this,e)}"
                                style="width: 100%;"
                                .appState="${this.appState}"
                                .appData="${this.appData}"
                                instant="${this.instant}"
                                @navigation-requested="${this.updateRoute}"
                        ></mateu-ux>
                    </mateu-api-caller>
                </div>
            </div>
        </div>`}if(we.MENU_ON_LEFT==e.variant){const i=e.menu.map(m=>({label:m.label,itemKey:m.route}));if(!e.homeRoute||e.homeRoute==="_no_home_route"){const m=e.menu[0];e.homeRoute=m?.submenus?.length?m.submenus[0].route:m?.route??""}const r=this.data.activeTopRoute??e.menu.find(m=>m.route===e.homeRoute||m.submenus?.some(h=>h.route===e.homeRoute))?.route??e.menu[0]?.route??"";this.data.activeTopRoute=r;const n=e.menu.find(m=>m.route===r),d=(n?.submenus??[]).map(m=>({label:m.label,itemKey:m.route}));if(this.data.activeConsumedRoute===void 0){const m=n?.submenus?.find(h=>h.route===e.homeRoute);this.data.activeConsumedRoute=m?.consumedRoute??n?.consumedRoute??e.homeConsumedRoute??"",this.data.activeServerSideType=m?.serverSideType??n?.serverSideType??e.homeServerSideType??""}const c=m=>{const h=m.detail.value;this.data.activeTopRoute=h;const f=e.menu.find(g=>g.route===h);if(f?.submenus?.length){const g=f.submenus[0];this.data.activeConsumedRoute=g.consumedRoute??"",this.data.activeServerSideType=g.serverSideType??f.serverSideType??e.serverSideType??"",this.selected({...m,detail:{...m.detail,value:g.route}},this,this.baseUrl??"",e)}else this.data.activeConsumedRoute=f?.consumedRoute??"",this.data.activeServerSideType=f?.serverSideType??e.serverSideType??"",this.selected({...m,detail:{...m.detail,value:h}},this,this.baseUrl??"",e)},u=m=>{const h=m.detail.value,g=e.menu.flatMap(y=>y.submenus??[]).find(y=>y.route===h);this.data.activeConsumedRoute=g?.consumedRoute??"",this.data.activeServerSideType=g?.serverSideType??e.serverSideType??"",this.selected(m,this,this.baseUrl??"",e)};return o`<div style="${this.style??l}">
            <oj-c-tab-bar
                    .data="${i}"
                    .selection="${r}"
                    @ojSelectionAction="${c}"
                    edge="top"
                    layout="condense"
                    display="standard"
                    aria-label="Main navigation"
            ></oj-c-tab-bar>
            ${d.length>0?o`
            <oj-c-tab-bar
                    .data="${d}"
                    .selection="${e.homeRoute}"
                    @ojSelectionAction="${u}"
                    edge="top"
                    layout="condense"
                    display="standard"
                    aria-label="Sub navigation"
            ></oj-c-tab-bar>`:l}
            <div style="padding: 1rem;">
                <mateu-api-caller style="width: 100%;">
                    <mateu-ux
                            route="${Pe(this.state,this,e)}"
                            id="${this.contentUxId}"
                            baseUrl="${$e(this,e)}"
                            consumedRoute="${ie(this,e)}"
                            serverSideType="${ye(this,e)}"
                            uriPrefix="${xe(this,e)}"
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
                                <mateu-notification-bell style="margin-right: 0.75rem;" .app="${e}" .baseUrl="${""}"></mateu-notification-bell>`:l}
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
                                        `:l}
                                    </li>
                                `)}
                            </ul>
                        </oj-navigation-list>
                    </div>

                    <div id="xxxxx" class="demo-padding" style="width: 100%; height: -webkit-fill-available;">
                        <div class="content" style="padding-bottom: 2rem;">
                            <mateu-api-caller style="width: 100%;">
                                <mateu-ux
                                        route="${Pe(this.state,this,e)}"
                                        id="${this.contentUxId}"
                                        baseUrl="${$e(this,e)}"
                                        consumedRoute="${ie(this,e)}"
                                        serverSideType="${ye(this,e)}"
                                        uriPrefix="${xe(this,e)}"
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



        </div>`}};it.styles=C`
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
  `;jt([$()],it.prototype,"filter",2);jt([$()],it.prototype,"instant",2);jt([$()],it.prototype,"selectedConsumedRoute",2);jt([$()],it.prototype,"selectedRoute",2);jt([$()],it.prototype,"selectedUriPrefix",2);jt([$()],it.prototype,"selectedBaseUrl",2);jt([$()],it.prototype,"selectedServerSideType",2);jt([$()],it.prototype,"selectedParams",2);it=jt([k("mateu-redwood-app")],it);const Im=(e,t,a,s,i,r,n)=>o`
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
    `,_m=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        
        <mateu-redwood-form 
                id="${t.id}" 
            baseUrl="${a}"
                .component="${t}"
                .values="${s}"
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??l}"
                >

            ${d?.toolbar?.map(c=>o`
                ${w(e,{metadata:c,type:oe.ClientSide,slot:"header"},void 0,{},{},r,n)}
            `)}
            
                    ${t.children?.map(c=>w(e,c,a,s,i,r,n))}
                ${d?.buttons?.map(c=>o`
                   ${w(e,{metadata:c,type:oe.ClientSide,slot:"buttons"},void 0,{},{},r,n)}
`)}

                </mateu-redwood-form>
        
    
    `},Em=e=>{const t=e.color==="error"||e.variant==="danger"?"danger":e.buttonStyle==="primary"?"callToAction":"outlined",a=t==="danger"?"background: var(--mateu-redwood-danger-bg, rgb(179, 49, 31)); color: #fff; border: 1px solid transparent;":t==="callToAction"?"background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); color: #fff; border: 1px solid transparent;":"background: transparent; color: var(--mateu-redwood-text, rgb(22, 21, 19)); border: 1px solid rgba(22, 21, 19, 0.5);",s=i=>i.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}));return o`
        <button
            data-action-id="${e.actionId}"
            style="${a} border-radius: var(--oj-button-border-radius, .25rem); height: var(--oj-button-height, 2.75rem); padding: 0 1rem; font-family: 'Oracle Sans', -apple-system, system-ui, sans-serif; font-size: var(--oj-button-font-size, 0.859rem); font-weight: 600; cursor: pointer; ${e.disabled?"opacity: .4; pointer-events: none;":""}"
            ?disabled="${e.disabled}"
            @click="${s}"
        >${e.label}</button>`},Tm=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=d.title||d.subtitle||d.toolbar?.length||d.header?.length||d.avatar;return o`
        <div style="display: flex; flex-direction: column; width: 100%; ${t.style??""}" slot="${t.slot??l}" class="${t.cssClasses}">
            ${d.breadcrumbs?.length>0?o`
                <div style="display: flex; align-items: center; gap: 0.25rem; padding: 0.5rem 0; flex-wrap: wrap;">
                    ${d.breadcrumbs.map((u,m)=>o`
                        ${m>0?o`<span>/</span>`:l}
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
            `:l}
            ${c?o`
                <div style="display: flex; align-items: center; width: 100%; gap: 1rem; padding: 0.5rem 0;">
                    <div style="flex: 1;">
                        <h2 style="margin-block-end: 0px;">${he(ct(d.title,s,i))}</h2>
                        <span style="display: inline-block;">${he(ct(d.subtitle,s,i))}</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                        ${d.header?.map(u=>w(e,u,a,s,i,r,n))}
                        ${d.toolbar?.map(u=>w(e,{metadata:u,type:oe.ClientSide,slot:""},void 0,{},{},r,n))}
                    </div>
                </div>
            `:l}
            <div style="width: 100%;">
                ${t.children?.map(u=>w(e,u,a,s,i,r,n))}
                ${d.buttons?.length?o`
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end; padding: 0.75rem 0 0.25rem;">
                    ${d.buttons.map(u=>Em(u))}
                </div>`:l}
            </div>
            ${d.footer?.length?o`
                <div>
                    ${d.footer.map(u=>w(e,u,a,s,i,r,n))}
                </div>
            `:l}
        </div>
    `},_i=(e,t)=>e?e.includes("${")&&t._evalTemplate?t._evalTemplate(e):e:"",Ae=(e,t,a,s,i,r,n)=>(t.children??[]).map(d=>w(e,d,a,s,i,r,n)),Vo=e=>{const t=e?.metadata?.type;return t==="FormRow"||t==="FormItem"?(e.children??[]).flatMap(Vo):[e]},Pm=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=Math.max(1,d.maxColumns??1),u=(t.children??[]).flatMap(Vo),m=h=>{const f=h?.metadata?.colspan,g=typeof f=="number"?f:parseInt(f??"1",10);return Math.min(Math.max(isNaN(g)?1:g,1),c)};return o`
        <div style="display:grid; grid-template-columns: repeat(${c}, minmax(0,1fr)); gap:.5rem 1.5rem; align-items:start;">
            ${u.map(h=>o`<div style="grid-column: span ${m(h)}; min-width:0; overflow:hidden;">${w(e,h,a,s,i,r,n)}</div>`)}
        </div>`},Om=(e,t,a,s,i,r,n)=>o`<div style="display:flex; flex-direction:row; gap:1rem; flex-wrap:wrap;">${Ae(e,t,a,s,i,r,n)}</div>`,Rm=(e,t,a,s,i,r,n)=>{const d=_i(t.metadata.title,e);return o`
        <div class="oj-panel oj-panel-shadow-sm" style="padding:1rem; margin-bottom:1rem; border-radius:var(--oj-core-border-radius-lg, .375rem);"
             slot="${t.slot??l}">
            ${d?o`<h2 class="oj-typography-heading-sm" style="margin:0 0 .75rem;">${d}</h2>`:l}
            <div style="display:flex; flex-direction:column; gap:.5rem;">
                ${Ae(e,t,a,s,i,r,n)}
            </div>
        </div>`},zm=(e,t,a,s,i,r,n)=>{const d=_i(t.metadata.title,e);return o`
        <div style="margin:.5rem 0;" slot="${t.slot??l}">
            ${d?o`<h3 class="oj-typography-subheading-sm" style="margin:0 0 .5rem;">${d}</h3>`:l}
            <div style="display:flex; flex-direction:column; gap:.5rem;">${Ae(e,t,a,s,i,r,n)}</div>
        </div>`},Am=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=d?.spacing===!1?"0":"1rem";return o`<div style="display:flex; flex-direction:row; gap:${c}; ${d?.wrap?"flex-wrap:wrap;":""} ${d?.fullWidth?"width:100%;":""} ${t.style??""}"
                     slot="${t.slot??l}">${Ae(e,t,a,s,i,r,n)}</div>`},jm=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=d?.spacing===!1?"0":".75rem";return o`<div style="display:flex; flex-direction:column; gap:${c}; ${d?.fullWidth?"width:100%;":""} ${t.style??""}"
                     slot="${t.slot??l}">${Ae(e,t,a,s,i,r,n)}</div>`},Lm=(e,t,a,s,i,r,n)=>{const d=t.metadata?.orientation==="vertical"?"column":"row";return o`<div style="display:flex; flex-direction:${d}; gap:1rem; width:100%; ${t.style??""}" slot="${t.slot??l}">
        ${(t.children??[]).map(c=>o`<div style="flex:1; min-width:0;">${w(e,c,a,s,i,r,n)}</div>`)}
    </div>`},Dm=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=m=>m?w(e,m,a,s,i,r,n):l,u=typeof d.title=="string"?d.title:"";if(t.cssClasses?.includes("mateu-section")){const m=u?o`<h2 class="oj-typography-heading-sm" style="margin: 0;">${u}</h2>`:typeof d.title=="object"&&d.title?c(d.title):l;return o`
            <section class="${t.cssClasses}" style="margin: 0 0 1.5rem 0; min-width: 0; overflow-x: auto; ${t.style??""}"
                 slot="${t.slot??l}">
                ${m!==l?o`
                    <div style="padding-bottom: .5rem; border-bottom: 1px solid var(--oj-core-divider-color, rgba(22, 21, 19, 0.2));">${m}</div>
                `:l}
                <div style="padding-top: .75rem;">
                    ${c(d.content)}
                    ${Ae(e,t,a,s,i,r,n)}
                    ${c(d.footer)}
                </div>
            </section>`}return o`
        <div class="oj-panel oj-panel-shadow-sm" style="border-radius:var(--oj-core-border-radius-lg, .375rem); overflow:hidden;"
             slot="${t.slot??l}">
            ${u?o`<h2 class="oj-typography-heading-sm" style="margin:0; padding:.75rem 1rem; border-bottom:1px solid var(--oj-core-divider-color, rgba(22,21,19,.12));">${u}</h2>`:l}
            <div style="padding:1rem;">
                ${typeof d.title=="object"?c(d.title):l}
                ${c(d.content)}
                ${Ae(e,t,a,s,i,r,n)}
                ${c(d.footer)}
            </div>
        </div>`},Nm=e=>{switch(e){case"h1":return"oj-typography-heading-xl";case"h2":return"oj-typography-heading-lg";case"h3":return"oj-typography-heading-md";case"h4":return"oj-typography-heading-sm";case"h5":case"h6":return"oj-typography-subheading-sm";default:return"oj-typography-body-md"}},Fm=(e,t,a)=>{const s=t.metadata,i=_i(s.text,e);return o`<div class="${Nm(s.container)}" style="${t.style??""}">${i}</div>`},Mm=e=>{const t=e.metadata,a=t.color;return o`<oj-c-badge variant="${a==="success"?"success":a==="error"||a==="danger"?"danger":a==="warning"?"warning":a==="info"?"info":"neutral"}" slot="${e.slot??l}">${t.text??""}</oj-c-badge>`},qm=e=>{const t=e.metadata;return o`<a class="oj-link-standalone" href="${t.url??"#"}" slot="${e.slot??l}">${t.text??t.url??""}</a>`},Cs=(e,t)=>{t&&e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:{}},bubbles:!0,composed:!0}))},Ho=(e,t,a)=>o`
    <div style="position:fixed; inset:0; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:1000;">
        <div class="oj-panel oj-panel-shadow-lg" role="dialog" aria-modal="true"
             style="background:var(--oj-core-bg-color-content, #fff); border-radius:var(--oj-core-border-radius-lg, .375rem); min-width:320px; max-width:90vw; max-height:90vh; overflow:auto;">
            ${e?o`<h2 class="oj-typography-heading-sm" style="margin:0; padding:1rem; border-bottom:1px solid var(--oj-core-divider-color, rgba(22,21,19,.12));">${e}</h2>`:l}
            <div style="padding:1rem;">${t}</div>
            ${a?o`<div style="display:flex; gap:.5rem; justify-content:flex-end; padding:.75rem 1rem; border-top:1px solid var(--oj-core-divider-color, rgba(22,21,19,.12));">${a}</div>`:l}
        </div>
    </div>`,Um=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=_i(d.headerTitle,e),u=h=>h?w(e,h,a,s,i,r,n):l,m=o`${u(d.content)}${Ae(e,t,a,s,i,r,n)}`;return Ho(c,m,u(d.footer))},Bm=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=_i(d.header,e),u=d.content?w(e,d.content,a,s,i,r,n):l,m=o`
        ${d.canCancel?o`<oj-c-button label="${d.cancelText??"Cancel"}" @ojAction="${h=>Cs(h.target,d.cancelActionId)}"></oj-c-button>`:l}
        ${d.canReject?o`<oj-c-button label="${d.rejectText??"No"}" @ojAction="${h=>Cs(h.target,d.rejectActionId)}"></oj-c-button>`:l}
        <oj-c-button chroming="callToAction" label="${d.confirmText??"OK"}" @ojAction="${h=>Cs(h.target,d.confirmActionId)}"></oj-c-button>`;return Ho(c,u,m)},Vm=(e,t,a,s,i,r,n)=>o`<div style="overflow: auto; ${t.style??""}" class="${t.cssClasses??l}"
              slot="${t.slot??l}">${Ae(e,t,a,s,i,r,n)}</div>`,Hm=(e,t,a,s,i,r,n)=>o`<div style="width: 100%; ${t.style??""}" class="${t.cssClasses??l}"
              slot="${t.slot??l}">${Ae(e,t,a,s,i,r,n)}</div>`,Wm=(e,t,a,s,i,r,n)=>o`<div style="max-width: min(100%, 1200px); margin: auto; ${t.style??""}" class="${t.cssClasses??l}"
              slot="${t.slot??l}">${Ae(e,t,a,s,i,r,n)}</div>`,Gm=(e,t,a,s,i,r,n)=>o`<div style="display: flex; flex-direction: column; gap: 1rem; width: 100%; ${t.style??""}"
              class="${t.cssClasses??l}" slot="${t.slot??l}">
        ${Ae(e,t,a,s,i,r,n)}</div>`,Km=(e,t,a,s,i,r,n)=>{const d=c=>c?.metadata?.type==="BoardLayoutItem"?c.metadata.boardCols??1:1;return o`<div style="display: flex; flex-direction: row; gap: 1rem; width: 100%; ${t.style??""}"
                     class="${t.cssClasses??l}" slot="${t.slot??l}">
        ${(t.children??[]).map(c=>o`
            <div style="flex: ${d(c)} 1 0; min-width: 0;">${w(e,c,a,s,i,r,n)}</div>`)}
    </div>`},Ym=(e,t,a,s,i,r,n)=>o`<div style="${t.style??""}" class="${t.cssClasses??l}">
        ${Ae(e,t,a,s,i,r,n)}</div>`,Jm=(e,t,a,s,i,r,n)=>{const d=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,u=!!i?.hasDetail||!!d,m=c??d;return o`
        <div style="display: flex; gap: 0; width: 100%; border: 1px solid var(--oj-core-divider-color, rgba(22,21,19,.12)); border-radius: var(--oj-core-border-radius-lg, .375rem); overflow: hidden; ${t.style??""}"
             class="${t.cssClasses??l}" slot="${t.slot??l}">
            <div style="flex: 1; min-width: 0; overflow-y: auto;">
                ${w(e,t.children[0],a,s,i,r,n)}
            </div>
            <div style="flex: 1; min-width: 0; overflow-y: auto; border-left: 1px solid var(--oj-core-divider-color, rgba(22,21,19,.12)); ${u&&m?"":"display: flex; align-items: center; justify-content: center;"}">
                ${u&&m?w(e,m,a,s,i,r,n):o`<span style="color: var(--oj-core-text-color-secondary, #666); font-size: 0.875rem; padding: 1rem;">Select an item to view details</span>`}
            </div>
        </div>`},Xm=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=m=>h=>{const g=h.target.closest(".rw-carousel-wrap")?.querySelector(":scope > .rw-carousel");g?.scrollBy({left:m*g.clientWidth,behavior:"smooth"})},u=d?.nav!==!1;return o`
        <div class="rw-carousel-wrap ${t.cssClasses??""}" style="position: relative; width: 100%; ${t.style??""}"
             slot="${t.slot??l}">
            <div class="rw-carousel" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 1rem; scrollbar-width: none;">
                ${(t.children??[]).map(m=>o`
                    <div style="scroll-snap-align: start; flex: 0 0 100%; min-width: 0;">${w(e,m,a,s,i,r,n)}</div>`)}
            </div>
            ${u?o`
                <div style="display: flex; gap: 0.5rem; justify-content: center; padding-top: 0.5rem;">
                    <oj-c-button data-oj-binding-provider="preact" label="‹" chroming="outlined" @ojAction="${c(-1)}"></oj-c-button>
                    <oj-c-button data-oj-binding-provider="preact" label="›" chroming="outlined" @ojAction="${c(1)}"></oj-c-button>
                </div>
            `:l}
        </div>`};var Qm=Object.defineProperty,Zm=Object.getOwnPropertyDescriptor,Lt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Zm(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Qm(t,a,i),i};let ft=class extends S{constructor(){super(...arguments),this.selected=0}createRenderRoot(){return this}label(e){const t=e?.metadata?.label;return t&&typeof t=="string"&&t.includes("${")&&this.container?._evalTemplate?this.container._evalTemplate(t):t??""}render(){const e=this.component?.children??[],t=e.map((s,i)=>({itemKey:String(i),label:this.label(s)})),a=e[this.selected];return o`
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
            </div>`}};Lt([p({attribute:!1})],ft.prototype,"component",2);Lt([p({attribute:!1})],ft.prototype,"container",2);Lt([p()],ft.prototype,"baseUrl",2);Lt([p({attribute:!1})],ft.prototype,"compState",2);Lt([p({attribute:!1})],ft.prototype,"compData",2);Lt([p({attribute:!1})],ft.prototype,"appState",2);Lt([p({attribute:!1})],ft.prototype,"appData",2);Lt([$()],ft.prototype,"selected",2);ft=Lt([k("mateu-redwood-tabs")],ft);var ev=Object.defineProperty,tv=Object.getOwnPropertyDescriptor,Dt=(e,t,a,s)=>{for(var i=s>1?void 0:s?tv(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&ev(t,a,i),i};let bt=class extends S{constructor(){super(...arguments),this.open={},this.initialized=!1}createRenderRoot(){return this}label(e){const t=e?.metadata?.label;return t&&typeof t=="string"&&t.includes("${")&&this.container?._evalTemplate?this.container._evalTemplate(t):t??""}render(){const e=this.component?.children??[];return this.initialized||(e.forEach((t,a)=>{t?.metadata?.active&&(this.open[a]=!0)}),this.initialized=!0),o`
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
            </div>`}};Dt([p({attribute:!1})],bt.prototype,"component",2);Dt([p({attribute:!1})],bt.prototype,"container",2);Dt([p()],bt.prototype,"baseUrl",2);Dt([p({attribute:!1})],bt.prototype,"compState",2);Dt([p({attribute:!1})],bt.prototype,"compData",2);Dt([p({attribute:!1})],bt.prototype,"appState",2);Dt([p({attribute:!1})],bt.prototype,"appData",2);Dt([$()],bt.prototype,"open",2);bt=Dt([k("mateu-redwood-accordion")],bt);var av=Object.defineProperty,iv=Object.getOwnPropertyDescriptor,Nt=(e,t,a,s)=>{for(var i=s>1?void 0:s?iv(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&av(t,a,i),i};let gt=class extends S{constructor(){super(...arguments),this.openPanels=new Set,this.seeded=!1}createRenderRoot(){return this}get md(){return this.component?.metadata??{}}get panels(){return this.md.panels??[]}get isHorizontal(){return(this.md.orientation??"vertical")==="horizontal"}childForSlot(e){return(this.component?.children??[]).find(t=>t?.slot===e)}evalTpl(e){return e?e.includes("${")&&this.container?._evalTemplate?this.container._evalTemplate(e):e:""}dispatchAction(e){e&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}renderChild(e){return e?w(this.container,e,this.baseUrl,this.compState,this.compData,this.appState,this.appData):o``}renderNav(e){return e?e.parentActionId||e.previousActionId||e.nextActionId||e.title?o`
            <div class="oj-sp-foldout-horizontal-header-panel">
                <div class="oj-sp-foldout-layout-header-horizontal">
                    <oj-sp-header-navigation class="oj-sp-foldout-layout-header-navigation">
                        <header class="oj-sp-header-container"
                                style="display:flex; align-items:center; gap:1rem; padding:.5rem 1rem;">
                            ${e.parentActionId?o`
                                <a href="#" class="oj-sp-header-navigation-goToParent oj-sp-link-standalone oj-typography-body-md oj-typography-semi-bold"
                                   @click="${a=>{a.preventDefault(),this.dispatchAction(e.parentActionId)}}"
                                >${e.parentLabel||"Parent"}</a>`:l}
                            ${e.title?o`<span class="oj-typography-body-md" style="flex:1 1 auto;">${e.title}</span>`:o`<span style="flex:1 1 auto;"></span>`}
                            <div class="oj-flex-bar-end" style="display:flex; gap:.25rem;">
                                ${e.previousActionId?o`
                                    <button class="oj-sp-header-navigation-previous-btn" title="Previous"
                                            style="background:transparent; border:none; cursor:pointer; padding:.25rem .5rem;"
                                            @click="${()=>this.dispatchAction(e.previousActionId)}"
                                    ><span class="oj-ux-ico-arrow-left"></span></button>`:l}
                                ${e.nextActionId?o`
                                    <button class="oj-sp-header-navigation-next-btn" title="Next"
                                            style="background:transparent; border:none; cursor:pointer; padding:.25rem .5rem;"
                                            @click="${()=>this.dispatchAction(e.nextActionId)}"
                                    ><span class="oj-ux-ico-arrow-right"></span></button>`:l}
                            </div>
                        </header>
                    </oj-sp-header-navigation>
                </div>
            </div>`:o``:o``}renderOverview(){const e=this.evalTpl(this.md.headerTitle),t=this.md.badges??[],a=this.childForSlot("overview"),s=this.md.overviewEditActionId;return o`
            <div class="oj-sp-horizontal-overview" style="padding:.5rem 1rem;">
                <div class="oj-sp-horizontal-overview-title-panel oj-flex-bar"
                     style="display:flex; align-items:center; gap:.75rem;">
                    ${e?o`<h1 class="oj-sp-horizontal-overview-title oj-typography-subheading-lg" style="margin:0;">${e}</h1>`:l}
                    ${t.map(i=>o`<span class="oj-badge oj-badge-subtle" style="padding:.1rem .5rem; border:1px solid rgba(0,0,0,.2); border-radius:999px; font-size:.75rem;">${i}</span>`)}
                    <span style="flex:1 1 auto;"></span>
                    ${s?o`
                        <button class="oj-sp-link-standalone" style="background:transparent; border:none; cursor:pointer; display:inline-flex; align-items:center; gap:.25rem; color:var(--mateu-redwood-text, rgb(22,21,19));"
                                @click="${()=>this.dispatchAction(s)}"
                        ><span class="oj-ux-ico-edit"></span>Edit</button>`:l}
                </div>
                ${a?o`<div class="oj-sp-horizontal-overview-content" style="margin-top:.5rem;">${this.renderChild(a)}</div>`:l}
            </div>`}renderPanel(e,t,a){const s=this.openPanels.has(t),i=this.evalTpl(e.title),r=this.childForSlot(`panel-${t}`);return s?o`
            <div class="oj-sp-foldout-animation-container oj-sp-foldout-layout-panel-container open ${a?"oj-sp-foldout-layout-last-panel":""}"
                 style="min-width:min(24rem, 90vw); flex:0 0 auto; border-inline-start:1px solid rgba(0,0,0,.08);">
                <oj-sp-foldout-panel class="oj-sp-foldout-panel" style="display:block; padding:1.5rem 1rem;">
                    <div class="oj-sp-foldout-panel-header oj-flex-bar"
                         style="display:flex; align-items:center; gap:.5rem;">
                        <span class="oj-sp-foldout-panel-title oj-typography-heading-sm" title="${i}" style="flex:1 1 auto;">${i}</span>
                        ${this.panels.length>1?o`
                            <button title="Collapse" style="background:transparent; border:none; cursor:pointer;"
                                    @click="${()=>{const n=new Set(this.openPanels);n.delete(t),this.openPanels=n}}"
                            ><span class="oj-ux-ico-close"></span></button>`:l}
                    </div>
                    ${e.subtitle?o`<div class="oj-typography-body-sm" style="opacity:.75; margin-top:.25rem;">${this.evalTpl(e.subtitle)}</div>`:l}
                    <div class="oj-sp-foldout-panel-title-underline" style="height:1px; background:rgba(0,0,0,.12); margin:.5rem 0 1rem;"></div>
                    <div class="oj-sp-foldout-panel-content">${this.renderChild(r)}</div>
                </oj-sp-foldout-panel>
            </div>`:o`
                <div class="oj-sp-foldout-animation-container oj-sp-foldout-layout-panel-container closed ${a?"oj-sp-foldout-layout-last-panel":""}"
                     style="cursor:pointer; min-width:2.5rem; display:flex; align-items:flex-start; justify-content:center; border-inline-start:1px solid rgba(0,0,0,.08);"
                     title="${i}"
                     @click="${()=>{this.openPanels=new Set(this.openPanels).add(t)}}">
                    <span class="oj-typography-heading-sm" style="writing-mode:vertical-rl; transform:rotate(180deg); margin-top:1rem; white-space:nowrap;">${i}</span>
                </div>`}render(){this.seeded||(this.openPanels=new Set(this.panels.map((t,a)=>t.open?a:-1).filter(t=>t>=0)),this.openPanels.size===0&&this.panels.length&&this.openPanels.add(0),this.seeded=!0);const e=this.isHorizontal?"row":"column";return o`
            <div class="oj-sp-foldout-layout" style="display:flex; flex-direction:column; width:100%; ${this.component?.style??""}"
                 slot="${this.component?.slot??l}">
                <div class="oj-sp-foldout-layout-${this.isHorizontal?"horizontal":"vertical"} oj-sp-foldout-layout-${this.isHorizontal?"horizontal":"vertical"}-ready">
                    ${this.renderNav(this.md.navigation)}
                    ${this.renderOverview()}
                    <div class="oj-sp-foldout-horizontal-scroll-container" style="overflow-x:auto;">
                        <div class="oj-sp-foldout-layout-horizontal-content oj-sp-foldout-layout-children-container"
                             style="display:flex; flex-direction:${e}; align-items:stretch;">
                            ${this.panels.map((t,a)=>this.renderPanel(t,a,a===this.panels.length-1))}
                        </div>
                    </div>
                </div>
            </div>`}};Nt([p({attribute:!1})],gt.prototype,"component",2);Nt([p({attribute:!1})],gt.prototype,"container",2);Nt([p()],gt.prototype,"baseUrl",2);Nt([p({attribute:!1})],gt.prototype,"compState",2);Nt([p({attribute:!1})],gt.prototype,"compData",2);Nt([p({attribute:!1})],gt.prototype,"appState",2);Nt([p({attribute:!1})],gt.prototype,"appData",2);Nt([$()],gt.prototype,"openPanels",2);gt=Nt([k("mateu-redwood-foldout")],gt);var sv=Object.defineProperty,rv=Object.getOwnPropertyDescriptor,Ya=(e,t,a,s)=>{for(var i=s>1?void 0:s?rv(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&sv(t,a,i),i};let Ca=class extends S{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.pages=[],this.summary=""}createRenderRoot(){return this}updated(e){if(super.updated(e),e.has("totalElements")||e.has("pageNumber")||e.has("pageSize")){const t=[],a=Math.max(1,Math.ceil(this.totalElements/this.pageSize)),s=a-1;this.totalElements>0&&(this.pageNumber>0&&(t.push({pageNumber:0,text:"First",clickable:!0}),t.push({pageNumber:this.pageNumber-1,text:"Prev",clickable:!0})),t.push({pageNumber:this.pageNumber,text:`Page ${this.pageNumber+1} of ${a}`,clickable:!1}),this.pageNumber<s&&(t.push({pageNumber:this.pageNumber+1,text:"Next",clickable:!0}),t.push({pageNumber:s,text:"Last",clickable:!0}))),this.pages=t,this.summary=this.totalElements===1?"1 item":`${this.totalElements} items`}}goToPage(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){return this.totalElements?o`
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; padding: 0.25rem 0; font-size: 0.859rem; color: var(--oj-core-text-color-secondary, rgba(22,21,19,.7));">
                ${this.totalElements<=this.pageSize?l:o`
                    ${this.pages.map(e=>e.clickable?o`
                        <oj-c-button
                            data-oj-binding-provider="preact"
                            label="${e.text}"
                            chroming="borderless"
                            @ojAction="${()=>this.goToPage(e.pageNumber)}"
                        ></oj-c-button>
                    `:o`<span style="font-weight: 600; color: var(--oj-core-text-color-primary, #161513);">${e.text}</span>`)}
                    <span aria-hidden="true" style="opacity: 0.4;">·</span>
                `}
                <span>${this.summary}</span>
                <slot></slot>
            </div>
        `:o`${l}`}};Ya([p({type:Number})],Ca.prototype,"totalElements",2);Ya([p({type:Number})],Ca.prototype,"pageSize",2);Ya([p({type:Number})],Ca.prototype,"pageNumber",2);Ya([$()],Ca.prototype,"pages",2);Ya([$()],Ca.prototype,"summary",2);Ca=Ya([k("mateu-redwood-pagination")],Ca);const ov=e=>{let t=e;for(;t;){if(t.tagName?.toLowerCase()==="mateu-ux")return t;t=t.parentElement??t.getRootNode?.()?.host??null}return null},Er=new WeakMap,nv=e=>{const t=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},lv=new Set([v.App,v.Page,v.Form,v.Button,v.FormField,v.FormLayout,v.FormRow,v.FormSection,v.FormSubSection,v.HorizontalLayout,v.VerticalLayout,v.SplitLayout,v.MasterDetailLayout,v.Scroller,v.FullWidth,v.Container,v.BoardLayout,v.BoardLayoutRow,v.BoardLayoutItem,v.CarouselLayout,v.Card,v.Text,v.Badge,v.Anchor,v.Icon,v.Breadcrumbs,v.Notification,v.ProgressBar,v.Details,v.Avatar,v.AvatarGroup,v.Tooltip,v.Popover,v.MenuBar,v.ContextMenu,v.TabLayout,v.AccordionLayout,v.FoldoutLayout,v.Dialog,v.Drawer,v.ConfirmDialog,v.Grid,v.Table,v.VirtualList,v.Directory,v.CustomField,v.MessageList,v.MessageInput,v.Crud,v.Element,v.Div,v.Image,v.MicroFrontend,v.Markdown,v.Chart,v.Bpmn,v.Map,v.Chat,v.CookieConsent,v.Workflow,v.WorkflowElk,v.FormEditor,v.MetricCard,v.Scoreboard,v.DashboardPanel,v.DashboardLayout,v.FoldoutLayout,v.HeroSection,v.EmptyState,v.Skeleton,v.Gantt,v.PlanningBoard,v.Kanban,v.Timeline,v.ProgressSteps,v.Stat,v.Calendar,v.PricingTable,v.OrgChart,v.Heatmap,v.Funnel,v.TrendChart,v.FeatureGrid,v.Testimonials,v.Faq,v.CalloutCard,v.CommentThread,v.FileList,v.Checklist,v.ComparisonCard,v.EntityHeader,v.Meter,v.TaskProgress,v.StatusList,v.BulletedList,v.Separator,v.Notice,v.TaskQueue,v.ResourceGrid,v.OfferCard,v.AddOnPicker,v.Ledger,v.PaymentPicker,v.ProcessMonitor]);class dv extends Cu{rendererName(){return"redwood-oj"}supportedClientSideTypes(){return lv}rendersCrudLayouts(){return!0}renderFilterBar(t,a,s,i,r,n,d){const c=a?.metadata,u=c?.filters??[],m=Er.get(t)??{open:!1,text:"",viewsOpen:!1};Er.set(t,m);const h=()=>t.requestUpdate(),f=()=>{m.outsideClick&&(document.removeEventListener("mousedown",m.outsideClick),m.outsideClick=void 0)},g=()=>{f(),m.open=!1,m.viewsOpen=!1,m.activeFilter=void 0,h()},y=()=>{f(),m.outsideClick=b=>{b.composedPath().some(z=>z instanceof HTMLElement&&z.classList?.contains("mateu-smart-search"))||g()},document.addEventListener("mousedown",m.outsideClick)},x=()=>{m.open||(m.open=!0,m.viewsOpen=!1,y(),h())},T=()=>{const b=!m.viewsOpen;m.open=!1,m.activeFilter=void 0,m.viewsOpen=b,b?y():f(),h()},U=()=>{f(),m.open=!1,m.viewsOpen=!1,m.activeFilter=void 0,t.search()},ae=(b,E)=>{i[b]=E,U()},F=b=>{const E=u.find(z=>z.fieldId===b);E&&Y(E)?(i[`${b}_from`]=void 0,i[`${b}_to`]=void 0):i[b]=b==="searchText"?"":void 0,U()},ne=b=>{i.searchText=b.value,m.text="",b.value="",U()},ue=b=>b.dataType==="boolean"||b.dataType==="bool"||b.stereotype==="checkbox"||b.stereotype==="toggle",se=b=>["integer","decimal","number","money"].includes(b.dataType),Y=b=>b.stereotype==="dateRange"||b.stereotype==="numberRange",te=b=>b.stereotype==="multiSelect",be=b=>(b.options?.length??0)>0,I=b=>{const E=i[b.fieldId];return Array.isArray(E)?E.map(String):typeof E=="string"&&E!==""?E.split(",").map(z=>z.trim()).filter(z=>z):[]},L=(b,E)=>{const z=i[`${b.fieldId}_${E}`];return z==null?"":String(z)},O=b=>{if(Y(b))return L(b,"from")!==""||L(b,"to")!=="";if(te(b))return I(b).length>0;const E=i[b.fieldId];return E!=null&&E!==""},D=(b,E)=>{const z=b?.options?.find(B=>B.value===String(E));return z?z.label??z.value:typeof E=="boolean"?E?"Yes":"No":String(E)},Ne=b=>{if(Y(b)){const E=L(b,"from"),z=L(b,"to");return E&&z?`${E} – ${z}`:E?`≥ ${E}`:`≤ ${z}`}return te(b)?I(b).map(E=>D(b,E)).join(", "):D(b,i[b.fieldId])},Te=window.location.pathname,ot=()=>["searchText",...u.flatMap(b=>Y(b)?[`${b.fieldId}_from`,`${b.fieldId}_to`]:[b.fieldId])],kt=()=>!!i.searchText||u.some(b=>O(b)),R=()=>{const b={};return i.searchText&&(b.searchText=i.searchText),u.forEach(E=>{if(O(E))if(Y(E)){const z=L(E,"from"),B=L(E,"to");z&&(b[`${E.fieldId}_from`]=z),B&&(b[`${E.fieldId}_to`]=B)}else te(E)?b[E.fieldId]=I(E):b[E.fieldId]=i[E.fieldId]}),b},re=b=>{ot().forEach(E=>{i[E]=void 0}),Object.entries(b.values).forEach(([E,z])=>{i[E]=z}),U()},pe=b=>{const E=b.value.trim();E&&(Io(Te,{name:E,values:R()}),b.value="",h())};if(!m.defaultViewChecked&&(m.defaultViewChecked=!0,!window.location.search)){const b=To(Te);b&&setTimeout(()=>{kt()||re(b)},0)}const N=[];i.searchText&&N.push({fieldId:"searchText",label:"Text",display:String(i.searchText)}),u.forEach(b=>{O(b)&&N.push({fieldId:b.fieldId,label:b.label||b.fieldId,display:Ne(b)})});const A="var(--mateu-redwood-text, rgb(22, 21, 19))",_=`display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 0.75rem; cursor: pointer; color: ${A}; font-size: 0.875rem;`,q=b=>b.preventDefault(),ge=(b,E,z=!1)=>o`
            <div style="${_} ${z?"font-weight: 600;":""}"
                 @mousedown="${q}"
                 @click="${E}"
                 onmouseover="this.style.background='rgba(22,21,19,0.06)'"
                 onmouseout="this.style.background='transparent'">${b}</div>`,da=`flex: 1; min-width: 0; font: inherit; font-size: 0.875rem; color: ${A}; border: 1px solid rgba(22,21,19,0.5); border-radius: 4px; padding: 0.35rem 0.5rem; outline: none;`,Ct="font: inherit; font-size: 0.875rem; background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); color: #fff; border: 1px solid transparent; border-radius: 4px; padding: 0.35rem 0.75rem; cursor: pointer;",St=b=>{const E=b.stereotype==="numberRange"?"number":b.dataType==="dateTime"?"datetime-local":b.dataType==="time"?"time":"date",z=J=>{const Ja=J.closest(".range-row");i[`${b.fieldId}_from`]=Ja.querySelector("input.range-from").value||void 0,i[`${b.fieldId}_to`]=Ja.querySelector("input.range-to").value||void 0,U()},B=J=>{J.key==="Enter"&&z(J.target),J.key==="Escape"&&g()};return o`
                <div class="range-row" style="display: flex; gap: 0.5rem; align-items: center; padding: 0.5rem 0.75rem;">
                    <input class="range-from" type="${E}" placeholder="From" style="${da}"
                           .value="${L(b,"from")}"
                           @mousedown="${J=>J.stopPropagation()}"
                           @keydown="${B}"/>
                    <span aria-hidden="true" style="color: rgba(22,21,19,0.55);">–</span>
                    <input class="range-to" type="${E}" placeholder="To" style="${da}"
                           .value="${L(b,"to")}"
                           @mousedown="${J=>J.stopPropagation()}"
                           @keydown="${B}"/>
                    <button style="${Ct}"
                            @mousedown="${q}"
                            @click="${J=>z(J.target)}">Apply</button>
                </div>`},hs=b=>{const E=I(b),z=J=>{const Ja=E.includes(J)?E.filter(Yo=>Yo!==J):[...E,J];i[b.fieldId]=Ja.length>0?Ja:void 0,t.search(),h()},B="display: inline-flex; align-items: center; justify-content: center; width: 1rem; height: 1rem; border-radius: 3px; font-size: 0.7rem; line-height: 1; flex: none;";return o`${(b.options??[]).map(J=>ge(o`
                <span aria-hidden="true" style="${B} ${E.includes(J.value)?"background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); border: 1px solid transparent; color: #fff;":"border: 1px solid rgba(22,21,19,0.5);"}">${E.includes(J.value)?"✓":""}</span>
                ${J.label??J.value}
            `,()=>z(J.value)))}`},Wo=b=>{if(Y(b))return St(b);if(te(b))return hs(b);if(be(b))return o`${b.options.map(B=>ge(B.label??B.value,()=>ae(b.fieldId,B.value)))}`;if(ue(b))return o`
                    ${ge("Yes",()=>ae(b.fieldId,!0))}
                    ${ge("No",()=>ae(b.fieldId,!1))}`;const E=se(b),z=B=>{B.value!==""&&ae(b.fieldId,E?Number(B.value):B.value)};return o`
                <div style="display: flex; gap: 0.5rem; padding: 0.5rem 0.75rem;">
                    <input type="${E?"number":"text"}"
                           placeholder="${b.placeholder||b.label||b.fieldId}"
                           style="flex: 1; font: inherit; font-size: 0.875rem; color: ${A}; border: 1px solid rgba(22,21,19,0.5); border-radius: 4px; padding: 0.35rem 0.5rem; outline: none;"
                           @mousedown="${B=>B.stopPropagation()}"
                           @keydown="${B=>{B.key==="Enter"&&z(B.target),B.key==="Escape"&&g()}}"/>
                    <button style="font: inherit; font-size: 0.875rem; background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); color: #fff; border: 1px solid transparent; border-radius: 4px; padding: 0.35rem 0.75rem; cursor: pointer;"
                            @mousedown="${q}"
                            @click="${B=>z(B.target.previousElementSibling)}">Apply</button>
                </div>`},Go=m.open&&u.length>0?o`
            <div style="position: absolute; top: calc(100% + 4px); left: 0; min-width: 20rem; max-width: 100%; background: var(--mateu-redwood-panel-bg, #fff); border: 1px solid rgba(22,21,19,0.25); border-radius: 8px; box-shadow: 0 6px 16px rgba(0,0,0,0.15); z-index: 30; overflow: hidden; padding: 0.25rem 0;">
                ${m.activeFilter?o`
                    <div style="${_} font-weight: 600; border-bottom: 1px solid rgba(22,21,19,0.15);"
                         @mousedown="${q}"
                         @click="${()=>{m.activeFilter=void 0,h()}}">
                        <span aria-hidden="true">←</span> ${m.activeFilter.label||m.activeFilter.fieldId}
                    </div>
                    ${Wo(m.activeFilter)}
                `:o`
                    <div style="padding: 0.35rem 0.75rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(22,21,19,0.6);">Filter by</div>
                    ${u.map(b=>ge(o`
                        ${b.label||b.fieldId}
                        ${O(b)?o`<span style="margin-left: auto; color: rgba(22,21,19,0.55); font-size: 0.8125rem;">${Ne(b)}</span>`:l}
                    `,()=>{m.activeFilter=b,h()}))}
                `}
            </div>`:l,tr=`${_} cursor: default; color: rgba(22,21,19,0.6);`,Ko=m.viewsOpen?o`
            <div style="position: absolute; top: calc(100% + 4px); right: 0; left: auto; min-width: 20rem; max-width: 100%; background: var(--mateu-redwood-panel-bg, #fff); border: 1px solid rgba(22,21,19,0.25); border-radius: 8px; box-shadow: 0 6px 16px rgba(0,0,0,0.15); z-index: 30; overflow: hidden; padding: 0.25rem 0;">
                <div style="padding: 0.35rem 0.75rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(22,21,19,0.6);">Saved views</div>
                ${Wi(Te).length===0?o`
                    <div style="${tr}">No saved views yet</div>`:l}
                ${Wi(Te).map(b=>o`
                    <div style="${_}"
                         @mousedown="${q}"
                         onmouseover="this.style.background='rgba(22,21,19,0.06)'"
                         onmouseout="this.style.background='transparent'">
                        <span style="flex: 1 1 auto; cursor: pointer;" @click="${()=>re(b)}">${b.name}</span>
                        <button title="${b.isDefault?"Unset as default":"Open this listing with this view"}"
                                style="border: none; background: none; cursor: pointer; padding: 0 0.15rem; color: ${b.isDefault?"var(--mateu-redwood-cta-bg, rgb(49, 45, 42))":"rgba(22,21,19,0.4)"};"
                                @click="${()=>{Eo(Te,b.name),h()}}">★</button>
                        <button aria-label="Delete view ${b.name}"
                                style="border: none; background: transparent; cursor: pointer; font-size: 0.75rem; line-height: 1; padding: 0.1rem 0.3rem; opacity: 0.6;"
                                @click="${()=>{_o(Te,b.name),h()}}">✕</button>
                    </div>`)}
                ${kt()?o`
                    <div style="display: flex; gap: 0.5rem; padding: 0.5rem 0.75rem;" @mousedown="${b=>b.stopPropagation()}">
                        <input type="text" placeholder="Save current view as…" style="${da}"
                               @keydown="${b=>{b.key==="Enter"&&pe(b.target),b.key==="Escape"&&g()}}"/>
                        <button style="${Ct}"
                                @mousedown="${q}"
                                @click="${b=>pe(b.target.previousElementSibling)}">Save</button>
                    </div>`:o`
                    <div style="${tr}">Apply some filters to save a view</div>`}
            </div>`:l;return o`
            <div class="mateu-smart-search" style="position: relative; padding: 0.25rem 0;">
                <div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; border: 1px solid rgba(22,21,19,0.5); border-radius: 8px; padding: 0.3rem 0.6rem; background: var(--mateu-redwood-panel-bg, #fff); cursor: text;"
                     @click="${b=>{b.currentTarget.querySelector("input.smart-search-input")?.focus(),x()}}">
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" style="flex: none; opacity: 0.6;">
                        <path fill="${A.startsWith("var")?"rgb(22,21,19)":A}" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
                    </svg>
                    ${N.map(b=>o`
                        <span style="display: inline-flex; align-items: center; gap: 0.3rem; background: rgba(22,21,19,0.08); border-radius: 1rem; padding: 0.15rem 0.3rem 0.15rem 0.6rem; font-size: 0.8125rem; color: ${A}; white-space: nowrap;">
                            <span style="opacity: 0.7;">${b.label}:</span> ${b.display}
                            <button aria-label="Remove filter ${b.label}"
                                    style="border: none; background: transparent; cursor: pointer; font-size: 0.75rem; line-height: 1; padding: 0.1rem 0.3rem; opacity: 0.6;"
                                    @mousedown="${q}"
                                    @click="${E=>{E.stopPropagation(),F(b.fieldId)}}">✕</button>
                        </span>`)}
                    ${c?.searchable!==!1?o`
                        <input class="smart-search-input" type="text"
                               placeholder="${N.length===0?"Search":""}"
                               .value="${m.text??""}"
                               style="flex: 1 1 8rem; min-width: 7rem; border: none; outline: none; background: transparent; font: inherit; font-size: 0.875rem; color: ${A}; padding: 0.25rem 0;"
                               @input="${b=>{m.text=b.target.value,x()}}"
                               @keydown="${b=>{b.key==="Enter"&&ne(b.target),b.key==="Escape"&&g()}}"/>
                    `:l}
                    <button title="Saved views" aria-label="Saved views"
                            style="margin-left: auto; flex: none; border: none; background: none; cursor: pointer; padding: 0.15rem 0.3rem; color: rgba(22,21,19,0.6); line-height: 1;"
                            @mousedown="${q}"
                            @click="${b=>{b.stopPropagation(),T()}}">
                        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z"/>
                        </svg>
                    </button>
                </div>
                ${Go}
                ${Ko}
                ${c?.header?.map(b=>w(t,b,s,i,r,n,d))}
            </div>
            <!-- RDS chrome: the color strip marks the top edge of the collection container —
                 between the smart search bar and the toolbar+table, exactly where the Smart
                 Filter and Search template places it. Suppressed when the page carries a welcome
                 banner: the accent only shows on pages WITHOUT one (Redwood rule). -->
            ${ov(t)?.getAttribute("data-has-welcome-banner")==="true"?l:o`
                <div class="redwood-color-strip" aria-hidden="true" style="height: 8px; background-image: url('/images/redwood-color-strip.png'); background-repeat: repeat-x; background-size: auto 8px; flex: none; width: 100%; margin-top: 0.5rem;"></div>
            `}
        `}renderToolbarButton(t,a,s){const i=t,r=i.color==="error"||i.variant==="error"||i.variant==="danger"?"danger":i.buttonStyle==="primary"?"callToAction":"outlined",n=r==="danger"?"background: var(--mateu-redwood-danger-bg, rgb(179, 49, 31)); color: #fff; border: 1px solid transparent;":r==="callToAction"?"background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); color: #fff; border: 1px solid transparent;":"background: transparent; color: var(--mateu-redwood-text, rgb(22, 21, 19)); border: 1px solid rgba(22, 21, 19, 0.5);";return o`
            <button
                data-action-id="${i.id}"
                style="${n} border-radius: var(--oj-button-border-radius, .25rem); height: var(--oj-button-height, 2.75rem); padding: 0 1rem; font-family: 'Oracle Sans', -apple-system, system-ui, sans-serif; font-size: var(--oj-button-font-size, 0.859rem); font-weight: 600; cursor: pointer; ${i.disabled?"opacity: .4; pointer-events: none;":""}"
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
        `}renderTableComponent(t,a,s,i,r,n,d){return o`
        <mateu-redwood-table id="${t.id}"
                     .metadata="${a?.metadata}"
                     .data="${t.data}"
                     .emptyStateMessage="${i[a?.id]?.emptyStateMessage}"
                     @sort-direction-changed="${t.directionChanged}"
                     @fetch-more-elements="${t.fetchMoreElements}"
                     .state="${i}"
                     .appState="${n}"
                     .appData="${d}"
                     baseUrl="${s}"
        ></mateu-redwood-table>
        `}renderClientSideComponent(t,a,s,i,r,n,d,c){return v.Page==a?.metadata?.type?Tm(t,a,s,i,r,n,d):v.Form==a?.metadata?.type?_m(t,a,s,i,r,n,d):v.Button==a?.metadata?.type?Su(a):v.FormField==a?.metadata?.type?kp(t,a,s,i,r):v.FormLayout==a?.metadata?.type?Pm(t,a,s,i,r,n,d):v.FormRow==a?.metadata?.type?Om(t,a,s,i,r,n,d):v.FormSection==a?.metadata?.type?Rm(t,a,s,i,r,n,d):v.FormSubSection==a?.metadata?.type?zm(t,a,s,i,r,n,d):v.HorizontalLayout==a?.metadata?.type?Am(t,a,s,i,r,n,d):v.VerticalLayout==a?.metadata?.type?jm(t,a,s,i,r,n,d):v.SplitLayout==a?.metadata?.type?Lm(t,a,s,i,r,n,d):v.MasterDetailLayout==a?.metadata?.type?Jm(t,a,s,i,r,n,d):v.Scroller==a?.metadata?.type?Vm(t,a,s,i,r,n,d):v.FullWidth==a?.metadata?.type?Hm(t,a,s,i,r,n,d):v.Container==a?.metadata?.type?Wm(t,a,s,i,r,n,d):v.BoardLayout==a?.metadata?.type?Gm(t,a,s,i,r,n,d):v.BoardLayoutRow==a?.metadata?.type?Km(t,a,s,i,r,n,d):v.BoardLayoutItem==a?.metadata?.type?Ym(t,a,s,i,r,n,d):v.CarouselLayout==a?.metadata?.type?Xm(t,a,s,i,r,n,d):v.Card==a?.metadata?.type?Dm(t,a,s,i,r,n,d):v.Text==a?.metadata?.type?Fm(t,a):v.Badge==a?.metadata?.type?Mm(a):v.Anchor==a?.metadata?.type?qm(a):v.Icon==a?.metadata?.type?Xu(a):v.Breadcrumbs==a?.metadata?.type?Qu(a):v.Notification==a?.metadata?.type?Zu(a):v.ProgressBar==a?.metadata?.type?ep(a,i):v.Details==a?.metadata?.type?tp(t,a,s,i,r,n,d):v.Avatar==a?.metadata?.type?ap(a,i,r):v.AvatarGroup==a?.metadata?.type?ip(a):v.Tooltip==a?.metadata?.type?sp(t,a,s,i,r,n,d):v.Popover==a?.metadata?.type?rp(t,a,s,i,r,n,d):v.MenuBar==a?.metadata?.type?op(t,a):v.ContextMenu==a?.metadata?.type?np(t,a,s,i,r,n,d):v.Grid==a?.metadata?.type?Vu(a,i):v.Table==a?.metadata?.type?Hu(t,a,s,i,r,n,d):v.VirtualList==a?.metadata?.type?Wu(t,a,s,i,r,n,d):v.Directory==a?.metadata?.type?Gu(a):v.CustomField==a?.metadata?.type?Ku(t,a,s,i,r,n,d):v.MessageList==a?.metadata?.type?Yu(a):v.MessageInput==a?.metadata?.type?Ju(a):v.TabLayout==a?.metadata?.type?o`<mateu-redwood-tabs
                    .component="${a}" .container="${t}" baseUrl="${s}"
                    .compState="${i}" .compData="${r}" .appState="${n}" .appData="${d}"
            ></mateu-redwood-tabs>`:v.AccordionLayout==a?.metadata?.type?o`<mateu-redwood-accordion
                    .component="${a}" .container="${t}" baseUrl="${s}"
                    .compState="${i}" .compData="${r}" .appState="${n}" .appData="${d}"
            ></mateu-redwood-accordion>`:v.FoldoutLayout==a?.metadata?.type?o`<mateu-redwood-foldout
                    .component="${a}" .container="${t}" baseUrl="${s}"
                    .compState="${i}" .compData="${r}" .appState="${n}" .appData="${d}"
            ></mateu-redwood-foldout>`:v.Dialog==a?.metadata?.type?Um(t,a,s,i,r,n,d):v.ConfirmDialog==a?.metadata?.type?Bm(t,a,s,i,r,n,d):super.renderClientSideComponent(t,a,s,i,r,n,d,c)}renderAppComponent(t,a,s,i,r,n,d){return Im(t,a,s,i,r,n,d)}}Z.set(new dv);Z.setUseShadowRoot(!1);Z.setAfterRenderHook(e=>{});var cv=Object.defineProperty,uv=Object.getOwnPropertyDescriptor,Ft=(e,t,a,s)=>{for(var i=s>1?void 0:s?uv(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&cv(t,a,i),i};let st=class extends S{constructor(){super(...arguments),this.baseUrl="",this.route=void 0,this.consumedRoute="_empty",this.config=void 0,this.top="true",this.pathPrefix=void 0,this.debug=!1,this._lastUrl="",this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top=="true"){let t=e.detail.route,a=this.baseUrl??"";!t||t.startsWith("/")?a=window.location.origin+(this.pathPrefix??""):(t=(this.pathPrefix??"")+t,a.indexOf("://")<0&&(a.startsWith("/")||(a="/"+a),a=window.location.origin+a)),t.startsWith(this.pathPrefix+"/")&&(t=t.substring(this.pathPrefix?.length)),a.endsWith("/")&&t.startsWith("/")&&(t=t.substring(1));let s=new URL(a+t);if((window.location.pathname||s.pathname)&&window.location.pathname!=s.pathname){let i=s.pathname;s.search&&(i+=s.search),i&&!i.startsWith("/")&&(i="/"+i),window.history.pushState({},"",i),this._lastUrl=window.location.href}}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),Ht.markClean(),e instanceof CustomEvent){let t=e.detail.route;const a=this.renderRoot.querySelector("mateu-ux");a&&(a.setAttribute("route",t),a.setAttribute("instant",ke()))}}}createRenderRoot(){return Z.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),Ht.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!Ht.confirmLeave()){window.history.pushState({},"",this._lastUrl);return}const t=e.target;this.loadUrl(t)},this.top=="true"?this.loadUrl(window):this.route&&(this.consumedRoute=""),this.config)try{const e=JSON.parse(this.config);le.value={...le.value,...e}}catch{le.value={...le.value,config:this.config}}this.addEventListener("url-update-requested",this.routeChangedListener),this.addEventListener("navigate-to-requested",this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener("url-update-requested",this.routeChangedListener),this.removeEventListener("navigate-to-requested",this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute("route",this.route),this.instant=ke(),this._lastUrl=e.location.href,e.location.search){const a=new URLSearchParams(e.location.search).get("overrides");if(a&&(this.config=a,this.config))try{const s=JSON.parse(this.config);le.value={...le.value,...s}}catch{le.value={...le.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){const t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t=="/"?"":t}addQueryParams(e,t){return e+(t.search?""+t.search:"")}extractGrossRouteFromUrl(e){const t=e.location.pathname,a=this.baseUrl&&(this.baseUrl.startsWith("http://")||this.baseUrl.startsWith("https://"))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(a)?t.substring(a.length):t}getContextPathStartingIndex(e){return e.startsWith("http:")?e.indexOf("/",7):e.startsWith("https:")?e.indexOf("/",8):0}render(){return o`
           <mateu-api-caller>
                <mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${ri.value}"
                          .appState="${le.value}"
                ></mateu-ux>
           </mateu-api-caller>
           ${this.debug?o`
               <mateu-debug-overlay
                   .appState="${le.value}"
                   .appData="${ri.value}"
               ></mateu-debug-overlay>
           `:l}
       `}};st.styles=C`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `;Ft([p()],st.prototype,"baseUrl",2);Ft([p()],st.prototype,"route",2);Ft([p()],st.prototype,"consumedRoute",2);Ft([p()],st.prototype,"config",2);Ft([p()],st.prototype,"top",2);Ft([p()],st.prototype,"pathPrefix",2);Ft([$()],st.prototype,"instant",2);Ft([p({type:Boolean})],st.prototype,"debug",2);st=Ft([k("mateu-ui")],st);var pv=Object.getOwnPropertyDescriptor,hv=(e,t,a,s)=>{for(var i=s>1?void 0:s?pv(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=n(i)||i);return i};let Rs=class extends xi{constructor(){super(...arguments),this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}render(){const e=this.component?.metadata;return o`
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
       `}};Rs.styles=C`
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
  `;Rs=hv([k("mateu-redwood-form")],Rs);
