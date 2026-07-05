const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-highcharts.js","assets/vendor-vaadin.js","assets/vendor-lit.js","assets/vendor.js","assets/vendor-diagrams.js"])))=>i.map(i=>d[i]);
import{d as n,A as d,a as R,j as u,i as O,k as _,m as be,D as Va,c as T,r as f,p as Pe,w as H,q as vi}from"./vendor-lit.js";import{v as fi,b as Je,e as bi,_ as ae,n as Ha,p as fa,f as et,i as qt,j as Ga,N as Ut,k as la,l as Qt,m as gi}from"./vendor-vaadin.js";import{S as $i,n as G,a as yi,b as wi}from"./vendor.js";import"./vendor-ui5.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function a(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=a(s);fetch(s.href,r)}})();class xi{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(t){if(this.componentRenderer=t,typeof window<"u"){const a=t.supportedClientSideTypes?.();window.__mateuRendererInfo={name:t.rendererName?.()??t.constructor?.name??"unknown",supportedTypes:a?[...a].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(t){this.useShadowRoot=t}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(t){this.afterRenderHook=t}getAfterRenderHook(){return this.afterRenderHook}}const q=new xi;var m=(e=>(e.Page="Page",e.Div="Div",e.Element="Element",e.MicroFrontend="MicroFrontend",e.Form="Form",e.Crud="Crud",e.Result="Result",e.Card="Card",e.Directory="Directory",e.Stepper="Stepper",e.HorizontalLayout="HorizontalLayout",e.VerticalLayout="VerticalLayout",e.SplitLayout="SplitLayout",e.MasterDetailLayout="MasterDetailLayout",e.TabLayout="TabLayout",e.AccordionLayout="AccordionLayout",e.FormLayout="FormLayout",e.FormRow="FormRow",e.FormItem="FormItem",e.BoardLayout="BoardLayout",e.BoardLayoutRow="BoardLayoutRow",e.BoardLayoutItem="BoardLayoutItem",e.Scroller="Scroller",e.FullWidth="FullWidth",e.Container="Container",e.FormField="FormField",e.Table="Table",e.App="App",e.Text="Text",e.Avatar="Avatar",e.Chat="Chat",e.AvatarGroup="AvatarGroup",e.Badge="Badge",e.Breadcrumbs="Breadcrumbs",e.Anchor="Anchor",e.Button="Button",e.Chart="Chart",e.Icon="Icon",e.ConfirmDialog="ConfirmDialog",e.ContextMenu="ContextMenu",e.CookieConsent="CookieConsent",e.Details="Details",e.Dialog="Dialog",e.Image="Image",e.Map="Map",e.Markdown="Markdown",e.Notification="Notification",e.ProgressBar="ProgressBar",e.Popover="Popover",e.CarouselLayout="CarouselLayout",e.Tooltip="Tooltip",e.MessageInput="MessageInput",e.MessageList="MessageList",e.CustomField="CustomField",e.MenuBar="MenuBar",e.Grid="Grid",e.GridColumn="GridColumn",e.GridGroupColumn="GridGroupColumn",e.VirtualList="VirtualList",e.FormSection="FormSection",e.FormSubSection="FormSubSection",e.Bpmn="Bpmn",e.Workflow="Workflow",e.WorkflowElk="WorkflowElk",e.FormEditor="FormEditor",e.MetricCard="MetricCard",e.Scoreboard="Scoreboard",e.DashboardPanel="DashboardPanel",e.DashboardLayout="DashboardLayout",e.FoldoutLayout="FoldoutLayout",e.HeroSection="HeroSection",e.EmptyState="EmptyState",e.Skeleton="Skeleton",e.Gantt="Gantt",e))(m||{}),Y=(e=>(e.ServerSide="ServerSide",e.ClientSide="ClientSide",e))(Y||{});const nt=(e,t,a,i,s,r,o,l,c)=>(t.slot=l,b(e,t,a,i,s,r,o,c)),b=(e,t,a,i,s,r,o,l)=>{if(!t)return n``;if(t.type==Y.ClientSide)return q.get().renderClientSideComponent(e,t,a,i,s,r,o,l);const c=e.route,h=e.consumedRoute;return n`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${h}"
                         baseUrl="${a}"
                         slot="${t.slot??d}"
                         style="${t.style}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...i}}"
                         .data="${{...s}}"
                         .appState="${r}"
                         .appData="${o}"
        >
       </mateu-component>`},Si=(e,t,a,i,s,r,o)=>{const l=t.metadata;let c=t.style;return c==null&&(c=""),l.columnSpacing&&(c+="--vaadin-form-layout-column-spacing: "+l.columnSpacing+";"),l.itemRowSpacing&&(c+="--vaadin-form-layout-row-spacing: "+l.itemRowSpacing+";"),l.itemLabelSpacing&&(c+="--vaadin-form-layout-label-spacing: "+l.itemLabelSpacing+";"),l.labelsAside&&(c+="--vaadin-form-item-label-width: 92px;"),l.fullWidth&&(c+="width: 100%;"),n`
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
                   ${t.children?.map(h=>Ka(l,e,h,a,i,s,r,o))}
               </vaadin-form-layout>
            `},Ka=(e,t,a,i,s,r,o,l)=>a.type==Y.ClientSide&&a.metadata?.type==m.FormRow?_i(e,t,a,i,s,r,o,l):e.labelsAside?ki(t,a,i,s,r,o,l):b(t,a,i,s,r,o,l),ki=(e,t,a,i,s,r,o)=>{if(t.type==Y.ClientSide&&t.metadata?.type==m.FormField&&t.metadata.label){const l=t.metadata,c=l.label?.includes("${")?e._evalTemplate(l.label):l.label;return n`
                       <vaadin-form-item data-colspan="${l.colspan}">
                           <label slot="label">${c}</label>
                           ${b(e,t,a,i,s,r,o,!0)}
                       </vaadin-form-item>
                   `}return b(e,t,a,i,s,r,o)},_i=(e,t,a,i,s,r,o,l)=>n`
        <vaadin-form-row>
            ${a.children?.map(c=>Ka(e,t,c,i,s,r,o,l))}
        </vaadin-form-row>
            `,Ci=(e,t,a,i,s,r,o)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let h=t.style;return l.fullWidth&&(h=h?"width: 100%;"+h:"width: 100%;"),l.justification&&(h=h?"justify-content: "+l.justification+";"+h:"justify-content: "+l.justification+";"),l.verticalAlignment&&(h=h?"align-items: "+l.verticalAlignment+";"+h:"align-items: "+l.verticalAlignment+";"),n`
               <vaadin-horizontal-layout 
                       style="${h}" 
                       class="${t.cssClasses}"
                       theme="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(p=>b(e,p,a,i,s,r,o))}
               </vaadin-horizontal-layout>
            `},Ei=(e,t,a,i,s,r,o)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let h=t.style;return l.fullWidth&&(h=h?"width: 100%;"+h:"width: 100%;"),l.justification&&(h=h?"justify-content: "+l.justification+";"+h:"justify-content: "+l.justification+";"),l.horizontalAlignment&&(h=h?"align-items: "+l.horizontalAlignment+";"+h:"align-items: "+l.horizontalAlignment+";"),n`
        <vaadin-vertical-layout
                style="${h}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(p=>b(e,p,a,i,s,r,o))}
        </vaadin-vertical-layout>
    `},Ii=(e,t,a,i,s,r,o)=>{const l=t.metadata;let c=t.style;return l.fullWidth&&(c=c?"width: 100%;"+c:"width: 100%;"),n`
               <vaadin-split-layout 
                       style="${c}" 
                       class="${t.cssClasses}"
                       orientation="${l.orientation??d}"
                       theme="${l.variant??d}"
                       slot="${t.slot??d}"
               >
                   <master-content>${b(e,t.children[0],a,i,s,r,o)}</master-content>
                   <detail-content>${b(e,t.children[1],a,i,s,r,o)}</detail-content>
               </vaadin-split-layout>
            `},Ti=(e,t,a,i,s,r,o)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=s?.detailComponent??null,h=!!s?.hasDetail||!!l,p=c??l;return n`
               <vaadin-master-detail-layout ?has-detail="${h}"
                                            style="${t.style}"
                                            class="${t.cssClasses}"
                                            slot="${t.slot??d}">
                   <div>${b(e,t.children[0],a,i,s,r,o)}</div>
                   ${h&&p?n`<div slot="detail">${b(e,p,a,i,s,r,o)}</div>`:n`<div slot="detail" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Select an item to view details</div>`}
               </vaadin-master-detail-layout>
            `},Ri=(e,t,a,i,s,r,o)=>{const l=t.metadata;let c=t.style;c==null&&(c=""),l.fullWidth&&(c+="width: 100%;");let h=l.variant;h=="equalWidth"&&(h="equal-width-tabs");const p=v=>{v.target.selected=0};return n`
        <vaadin-tabsheet
                theme="${h??d}"
                style="${c}"
                slot="${t.slot??d}"
        >
            <vaadin-tabs slot="tabs"
                         style="${c}"
                         class="${t.cssClasses}"
                         orientation="${l.orientation??d}"
                         @items-changed=${p}
            >
                ${t.children?.map(v=>v).map(v=>{const $=v.metadata.label,k=$?.includes("${")?e._evalTemplate($):$,S=v.metadata.shortcut;return n`
                    <vaadin-tab id="${k}"
                                style="${v.style}"
                                class="${v.cssClasses}"
                                data-shortcut="${S??d}"
                    >${k}</vaadin-tab>`})}
            </vaadin-tabs>

            ${t.children?.map(v=>Pi(e,v,a,i,s,r,o))}
        </vaadin-tabsheet>
            `},Pi=(e,t,a,i,s,r,o)=>{const l=t.metadata.label,c=l?.includes("${")?e._evalTemplate(l):l;return n`
        <div tab="${c}" style="padding: var(--lumo-space-m) 0;">
                   ${t.children?.map(h=>b(e,h,a,i,s,r,o))}
               </div>
            `},Oi=(e,t,a,i,s,r,o)=>{const l=t.metadata;t.style,l.fullWidth;let c=0;if(t.children){for(let h=0;h<t.children.length;h++)if(t.children[h].metadata?.active){c=h;break}}return n`
               <vaadin-accordion
                       style="${t.style}"
                       class="${t.cssClasses}"
                       opened="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(h=>Li(e,h,a,i,s,r,o,l.variant))}
               </vaadin-accordion>
            `},Li=(e,t,a,i,s,r,o,l)=>{const c=t.metadata,h=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return n`
        <vaadin-accordion-panel style="${t.style}"
                                class="${t.cssClasses}"
                                theme="${l??d}"
                                ?opened="${c.active}"
                                ?disabled="${c.disabled}">
            <vaadin-accordion-heading slot="summary">${h}</vaadin-accordion-heading>
            ${t.children?.map(p=>b(e,p,a,i,s,r,o))}
        </vaadin-accordion-panel>
            `},Di=(e,t,a,i,s,r,o)=>n`
               <vaadin-scroller style="${t.style}" 
                                class="${t.cssClasses}"
                                slot="${t.slot??d}">
                   ${t.children?.map(l=>b(e,l,a,i,s,r,o))}
               </vaadin-scroller>
            `,zi=(e,t,a,i,s,r,o)=>n`
               <div style="width: 100%; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??d}">
                   ${t.children?.map(l=>b(e,l,a,i,s,r,o))}
               </div>
            `,Ai=(e,t,a,i,s,r,o)=>n`
               <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??d}">
                   ${t.children?.map(l=>b(e,l,a,i,s,r,o))}
               </div>
            `,Fi=(e,t,a,i,s,r,o)=>n`
        <vaadin-board style="${t.style}" 
                      class="${t.cssClasses}"
                      slot="${t.slot??d}">
            ${t.children?.map(l=>b(e,l,a,i,s,r,o))}
        </vaadin-board>
            `,Ni=(e,t,a,i,s,r,o)=>n`
        <vaadin-board-row style="${t.style}" class="${t.cssClasses}">
                   ${t.children?.map(l=>b(e,l,a,i,s,r,o))}
               </vaadin-board-row>
            `,qi=(e,t,a,i,s,r,o)=>{const l=t.metadata;return n`
        <div style="${t.style}" 
             class="${t.cssClasses}"
             board-cols="${l.boardCols??d}"
        >
                   ${t.children?.map(c=>b(e,c,a,i,s,r,o))}
               </div>
            `},gt=(e,t)=>new Function(...Object.keys(t),"return `"+e+"`")(...Object.values(t)),xt=(e,t,a)=>({state:e??{},data:t??{},...a});function Ne(e,t,a,i){if(!e?.includes("${"))return e;try{return gt(e,xt(t,a,i))}catch(s){return console.warn(`Mateu: could not interpolate "${e}":`,s),e}}const ot=(e,t,a)=>{if(e&&e.indexOf("${")>=0)try{return gt(e,xt(t,a))}catch(i){return i.message}return e},Ja=(e,t,a,i,s)=>{if(!e)return e;const r=xt(t,a,{appState:i??{},appData:s??{}});let o=e;try{if(o=gt(e,r),o.includes("${"))try{o=gt(o,r)}catch(l){o="when evaluating nested "+e+" :"+l+", where data is "+a+" and state is "+t+" and app state is "+i+" and app data is "+s,console.error(l,o,t,a,i,s)}}catch(l){o="when evaluating "+e+" :"+l+", where data is "+a+" and state is "+t+" and app state is "+i+" and app data is "+s,console.error(l,o,t,a,i,s)}return o},Ya=(e,t,a,i,s,r)=>{const o=xt(t,a,{appState:i??{},appData:s??{},...r}),l=gt(e,o);return new Function(...Object.keys(o),`return (${l})`)(...Object.values(o))},Xa=(e,t,a,i)=>{const s=xt(t,a,i);return new Function(...Object.keys(s),`return (${e})`)(...Object.values(s))},Ui=(e,t,a,i)=>gt(e,xt(t,a,i)),Mi=(e,t,a)=>{const i=e.metadata;return n`<vaadin-avatar
            img="${i.image}"
            name="${dt(i.name,t,a)}"
            abbr="${i.abbreviation}"
            style="${e.style}" class="${e.cssClasses}"
            slot="${e.slot??d}"
    ></vaadin-avatar>`},dt=(e,t,a)=>typeof e=="string"&&e.includes("${")?Ne(e,t,a):e,Bi=e=>{const t=e.metadata;return n`<vaadin-avatar-group max-items-visible="${t.maxItemsVisible}"
                                     .items="${t.avatars}"
                                     style="${e.style}" class="${e.cssClasses}"
                                     slot="${e.slot??d}">
    </vaadin-avatar-group>`},ji=(e,t,a,i,s,r,o)=>{const l=t.metadata,c=h=>n`
            ${b(e,h,a,i,s,r,o)}
`;return n`
        <vaadin-virtual-list
                .items="${l.page.content}"
                ${fi(c,[])}
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
        ></vaadin-virtual-list>
    `};var Wi=Object.defineProperty,Vi=Object.getOwnPropertyDescriptor,ba=(e,t,a,i)=>{for(var s=i>1?void 0:i?Vi(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Wi(t,a,s),s};let Lt=class extends O{constructor(){super(...arguments),this.variant="text",this.count=3}render(){const e=Array.from({length:Math.max(1,this.count)});return this.variant=="card"?n`${e.map(()=>n`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant=="grid"?n`${e.map(()=>n`<div class="bone row"></div>`)}`:this.variant=="form"?n`${e.map(()=>n`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:n`${e.map(()=>n`<div class="bone line"></div>`)}`}};Lt.styles=R`
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
    `;ba([u()],Lt.prototype,"variant",2);ba([u({type:Number})],Lt.prototype,"count",2);Lt=ba([_("mateu-skeleton")],Lt);const Hi=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},lt=(e,t,a,i,s,r)=>n`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${t??"🗂"}</span>
            ${a?n`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${a}</span>`:d}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${i??e??"Nothing here yet."}</span>
            ${s&&r?n`
                <vaadin-button theme="tertiary" style="margin-top: .25rem;" @click="${o=>Hi(o,s)}">${r}</vaadin-button>
            `:d}
        </div>
    `,Gi=e=>{const t=e.metadata;return n`
        <div style="${e.style??d}" class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${lt(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},Ki=e=>{const t=e.metadata;return n`
        <mateu-skeleton
                variant="${t.variant??"text"}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-skeleton>
    `};var Pt=(e=>(e.NONE="NONE",e.INFO="INFO",e.SUCCESS="SUCCESS",e.WARNING="WARNING",e.DANGER="DANGER",e))(Pt||{});const Ji=(e,t,a)=>{const i=e[a.path];return i?n`<span theme="badge pill ${Zt(i.type)}">${i.message}</span>`:n``},Zt=e=>{switch(e){case Pt.SUCCESS:return"success";case Pt.WARNING:return"warning";case Pt.DANGER:return"error";case Pt.NONE:return"contrast"}return""},Yi=(e,t,a)=>{const s=e[a.path]?"vaadin:check":"vaadin:minus";return n`<vaadin-icon 
                    icon="${s}"
                    style="height: 16px; width: 16px; color: ${"var(--lumo-body-text-color)"};"
            ></vaadin-icon>`},Xi=(e,t,a,i,s)=>{const r=e[a.path];let o=r;return i=="money"&&r&&r.locale&&r.currency?o=new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(r.value):s=="money"&&(o=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(r)),n`${o}`},Ca=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},Qi=(e,t,a,i,s,r)=>{const o=a.xcolumn??r;if(o.text){if(o.actionId)return n`<a href="javascript: void(0);" @click="${h=>Ca(a,o,e)}">${o.text}</a>`;const c=e[a.path];return n`<a href="${c}">${o.text}</a>`}if(i=="string"){if(o.actionId){const h=e[a.path];return n`<a href="javascript: void(0);" @click="${p=>Ca(a,o,e)}">${h}</a>`}const c=e[a.path];return n`<a href="${c}">${c}</a>`}const l=e[a.path];return n`<a href="${l.href}">${l.text}</a>`},Zi=(e,t,a,i,s)=>i=="string"?e[a.path].split(",").map(l=>n`<vaadin-icon icon="${l}" style="width: 16px;"></vaadin-icon>`):e[a.path].split(",").map(o=>n`<vaadin-icon icon="${o.icon}" style="width: 16px;"></vaadin-icon>`),es=(e,t,a,i,s)=>{const r=e[a.path];return n`${be(r)}`},ts=(e,t,a,i,s,r)=>{if(i=="string"){const l=e[a.path],c="max-height: 40px; "+(r.style??"");return n`<img src="${l}" style="${c}">`}const o=e[a.path];return n`<img src="${o.src}" style="${r.style??""}">`},as=e=>{const t={_clickedRow:e.target.row};e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+e.detail.value.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Ea=e=>{const t={_clickedRow:e.target.row},a=e.target.action;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+a.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},is=e=>{const t=document.createElement("vaadin-context-menu-item"),a=document.createElement("vaadin-icon");return a.style.color="var(--lumo-secondary-text-color)",a.style.marginInlineEnd="var(--lumo-space-s)",a.style.padding="var(--lumo-space-xs)",a.setAttribute("icon",e.icon),t.appendChild(a),e.label&&t.appendChild(document.createTextNode(e.label)),t.disabled=e.disabled,t},Ia=(e,t,a)=>{const i=e[a.path]?.actions?.map(s=>s.icon?{component:is(s),methodNameInCrud:s.methodNameInCrud}:{...s,text:s.label});return!i||i.length==0?n``:n`
                                     <vaadin-menu-bar
                                         .items=${[{text:"···",children:i}]}
                                         theme="tertiary"
                                         .row="${e}"
                                         data-testid="menubar-${a.path}"
                                         @item-selected="${as}"
                                     ></vaadin-menu-bar>
                                   `},ss=(e,t,a)=>{if(a.path=="select"){const r={actionId:a.path,icon:"",label:"Select",disabled:!1,methodNameInCrud:"select"};return n`
         <vaadin-button theme="tertiary" title="Select" @click="${Ea}" .row="${e}" .action="${r}">
             Select
         </vaadin-button>
    `}const i=a.path&&e[a.path].methodNameInCrud?e[a.path]:e.action,s=i.icon&&!i.label;return n`
         <vaadin-button theme="tertiary${s?" icon":""}" title="${i.label||d}" @click="${Ea}" .row="${e}" .action="${i}">
             ${i.icon?n`<vaadin-icon icon="${i.icon}"></vaadin-icon>`:d}
             ${i.label?i.label:d}
         </vaadin-button>
    `},rs=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},ns=(e,t,a,i,s,r)=>{const o=a.xcolumn??r;if(o.actionId){const c=o.text||e[a.path];return n`
            <vaadin-button theme="tertiary" @click="${h=>rs(a,o,e)}" .row="${e}">
                ${c}
            </vaadin-button>
        `}const l=e[a.path];return n`<a href="${l}">${o.text||l}</a>`},os=(e,t,a,i,s,r,o,l,c)=>{const h=e[a.path];return b(i,h,s,r,o,l,c)},pa=new WeakMap,ls=(e,t)=>pa.get(e)?.[t],ds=(e,t,a)=>{let i=pa.get(e);i||(i={},pa.set(e,i)),i[t]=a},Ta=e=>{if(e==null||e==="")return null;const t=Number(e);return Number.isNaN(t)?null:t},cs=(e,t,a,i)=>{const s=a?.field?.fieldId,r=c=>{if(e[t.id]===c||e[t.id]==null&&(c===""||c==null))return;if(e[t.id]=c,!s){a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"update-row",parameters:{_editedRow:{...e}}},bubbles:!0,composed:!0}));return}const h=i[s];a.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:s,value:Array.isArray(h)?[...h]:h},bubbles:!0,composed:!0}))},o=e[t.id],l=o==null?"":String(o);switch(t.editorType){case"boolean":return n`<vaadin-checkbox ?checked=${!!o} @checked-changed=${c=>r(c.detail.value)}></vaadin-checkbox>`;case"integer":return n`<vaadin-integer-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(Ta(c.target.value))}></vaadin-integer-field>`;case"number":return n`<vaadin-number-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(Ta(c.target.value))}></vaadin-number-field>`;case"date":return n`<vaadin-date-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-date-picker>`;case"time":return n`<vaadin-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-time-picker>`;case"datetime":return n`<vaadin-date-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-date-time-picker>`;case"select":return n`<vaadin-combo-box
                theme="small" style="width:100%;"
                .items=${(t.editorOptions??[]).map(c=>({label:c.label,value:String(c.value)}))}
                item-label-path="label" item-value-path="value"
                .value=${l}
                @value-changed=${c=>r(c.detail.value)}></vaadin-combo-box>`;case"lookup":{const c=a?.field?.fieldId,h=`search-${c}-${t.id}`,p=`${c}-${t.id}`,$=(t.editorOptions??[]).find(S=>String(S.value)===l)??(l?{value:l,label:ls(e,t.id)??l}:void 0);return n`<vaadin-combo-box
                theme="small" style="width:100%;"
                item-label-path="label" item-id-path="value"
                .dataProvider=${(S,g)=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:h,parameters:{searchText:S.filter,size:S.pageSize,page:S.page},callback:P=>{const F=P?.fragments?.[0]?.data?.[p];g(F?.content??[],F?.totalElements??0)},callbackonly:!0},bubbles:!0,composed:!0}))}}
                .selectedItem=${$}
                @selected-item-changed=${S=>{const g=S.detail.value,P=g?g.value:null;String(P??"")!==l&&(g&&ds(e,t.id,g.label),r(P))}}></vaadin-combo-box>`}default:return n`<vaadin-text-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(c.target.value)}></vaadin-text-field>`}},da=e=>bi(()=>n`<span title="${e}" style="white-space:normal;overflow-wrap:break-word;">${e}</span>`,[e]),hs=e=>{e.preventDefault(),e.stopPropagation(),e.currentTarget?.dispatchEvent(new CustomEvent("sort-direction-changed",{detail:{grid:e.currentTarget.parentElement},bubbles:!0,composed:!0}))},us=(e,t,a,i,s,r,o)=>{const l=Ne(e.label,i,s);return n`
<vaadin-grid-column-group header="${l}">
    ${e.columns.map(c=>Qa(c.metadata,t,a,i,s,r,o))}
</vaadin-grid-column-group>
`},ga=(e,t,a,i,s,r,o)=>m.GridGroupColumn==e.metadata?.type?us(e.metadata,t,a,i,s,r,o):Qa(e.metadata,t,a,i,s,r,o),Qa=(e,t,a,i,s,r,o)=>{const l=Ne(e.label,i,s);return e.sortable?n`
                        <vaadin-grid-sort-column
                                path="${e.id}"
                                text-align="${e.align??d}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??d}"
                                ?resizable="${e.resizable}"
                                width="${e.width??d}"
                                @direction-changed="${hs}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${da(l)}
                                ${Je((c,h,p)=>Kt(c,h,p,e,t,a,i,s,r,o),[])}
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
                                ${da(l)}
                                ${Je((c,h,p)=>Kt(c,h,p,e,t,a,i,s,r,o),[])}
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
                                ${da(l)}
                                ${Je((c,h,p)=>Kt(c,h,p,e,t,a,i,s,r,o),[])}
                        ></vaadin-grid-column>
                    `},Kt=(e,t,a,i,s,r,o,l,c,h)=>{const p=a.dataset.dataType??"",v=a.dataset.stereotype??"";if(i.editable)return cs(e,i,s,o);if(p=="status")return Ji(e,t,a);if(p=="bool")return Yi(e,t,a);if(p=="money"||v=="money")return Xi(e,t,a,p,v);if(p=="link"||v=="link")return Qi(e,t,a,p,v,i);if(p=="icon"||v=="icon")return Zi(e,t,a,p);if(v=="html")return es(e,t,a);if(v=="image")return ts(e,t,a,p,v,i);if(p=="menu")return Ia(e,t,a);if(p=="component")return os(e,t,a,s,r,o,l,c,h);if(p=="action")return ss(e,t,a);if(p=="actionGroup")return Ia(e,t,a);if(v=="button"||i.actionId)return ns(e,t,a,p,v,i);const $=e[a.path];return n`<span title="${$}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${$}</span>`},ps=(e,t,a,i,s,r,o)=>{const l=t.metadata;if(l.tree){const h=async(p,v)=>{const $=p.parentItem?p.parentItem.children:l.page.content;v($,$.length)};return n`
        <vaadin-grid style="${t.style}" class="${t.cssClasses}"
                     .itemHasChildrenPath="${"children"}" .dataProvider="${h}"
                     slot="${t.slot??d}"
                     all-rows-visible
        >
            ${l.content.map((p,v)=>{const $=p.metadata;return v>0?n`
            <vaadin-grid-column path="${p.id}"
                                header="${$?.label??d}"
                                ?auto-width="${$?.autoWidth}"
                                flex-grow="${$?.flexGrow??d}"
                                width="${$?.width??d}"
                                .column="${p.metadata}"
                                ${Je((k,S,g)=>Kt(k,S,g,$,e,a,i,s,r,o),[])}></vaadin-grid-column>
`:n`
            <vaadin-grid-tree-column path="${p.id}"
                                header="${$?.label??d}"
                                ?auto-width="${$?.autoWidth}"
                                flex-grow="${$?.flexGrow??d}"
                                width="${$?.width??d}"
            ></vaadin-grid-tree-column>
`})}
            <span slot="empty-state">${lt()}</span>
        </vaadin-grid>
    `}let c=l.page?.content;return t.id&&i&&i[t.id]&&(c=i[t.id]),c||(c=[]),n`
        <vaadin-grid 
                style="${t.style}" 
                class="${t.cssClasses}" 
                .items="${c}"
                all-rows-visible
        >
            ${l?.content?.map(h=>ga(h,e,a,i,s,r,o))}
        </vaadin-grid>
    `},ms=e=>(e.metadata,n`
        <vaadin-message-list
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??d}"
                .items="${[{text:"**Hello team!** Did everyone review the *design document* for the new project?",userName:"Alex Johnson"},{text:`## Project Update
I've completed the initial research phase and documented my findings.

* UI mockups ✅
* Market analysis ✅
* [See detailed report](https://vaadin.com)

Let me know your thoughts!`,userName:"Sam Rivera"}]}"
        ></vaadin-message-list>
    `),Ye=new $i,j={value:{}},Dt={value:{}},vs=(e,t,a,i,s,r,o)=>{const l=t.metadata;return n`
        <vaadin-context-menu .items=${$a(e,l.menu,a,i,s,r,o)} 
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             open-on="${l.activateOnLeftClick?"click":d}"
                             slot="${t.slot??d}">
            ${b(e,l.wrapped,a,i,s,r,o)}
        </vaadin-context-menu>
            `},fs=(e,t,a,i,s)=>{const r=t.metadata;return n`
        <vaadin-menu-bar .items=${$a(e,r.options,a,i,s,j,Dt)}
                         style="${t.style}" class="${t.cssClasses}"
                         slot="${t.slot??d}">
        </vaadin-menu-bar>
            `},Ra=(e,t,a,i,s,r,o)=>{const l=document.createElement("vaadin-context-menu-item");return Va(b(e,t,a,i,s,r,o),l),l},$a=(e,t,a,i,s,r,o)=>t.map(l=>l.submenus?{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?Ra(e,l.component,a,i,s,r,o):void 0,children:$a(e,l.submenus,a,i,s,r,o)}:l.separator?{component:"hr"}:{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?Ra(e,l.component,a,i,s,r,o):void 0}),bs=(e,t,a,i,s,r,o)=>{const l=t.metadata;return n`
        <vaadin-custom-field label="${l.label}"
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             slot="${t.slot??d}"
                             data-colspan="${l.colspan||d}"
        >
            ${b(e,l.content,a,i,s,r,o)}
        </vaadin-custom-field>
            `},gs=e=>(e.metadata,n`
        <vaadin-message-input style="${e.style}" class="${e.cssClasses}"
                              slot="${e.slot??d}"></vaadin-message-input>
    `),$s=(e,t,a,i,s,r,o)=>{const l=t.metadata;return n`
        <div id="show-notifications">${b(e,l.wrapped,a,i,s,r,o)}</div>
        <vaadin-tooltip
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
                for="show-notifications" text="${l.text}" position="top-start"></vaadin-tooltip>
    `},ys=e=>{if(e instanceof CustomEvent)return e.detail;const t={};for(const a in e){const i=e[a];["number","string","boolean"].indexOf(typeof i)>=0&&(t[a]=e[a])}return t},Pa=(e,t,a)=>{for(let i in t.attributes)e.setAttribute(i,t.attributes[i]);a.style&&e.setAttribute("style",a.style),a.cssClasses&&e.setAttribute("class",a.cssClasses),a.slot&&e.setAttribute("slot",a.slot),t.content&&(t.html?e.innerHTML=t.content:e.append(t.content))},ws=e=>{e.startsWith("vaadin-chart")&&!customElements.get(e)&&ae(()=>import("./vendor-highcharts.js"),__vite__mapDeps([0,1,2,3]))},xs=(e,t,a)=>{ws(t.name);let i=t.name;return t.attributes&&t.attributes.id&&(i="#"+t.attributes.id),setTimeout(()=>{const s=e.shadowRoot?.querySelector(".element-container")?.querySelector(i);if(s){for(;s.firstChild;)s.removeChild(s.lastChild);Pa(s,t,a)}else{const r=document.createElement(t.name);Pa(r,t,a);for(let o in t.on)r.addEventListener(o,l=>{const c=ys(l);e.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.on[o],parameters:{event:c}},bubbles:!0,composed:!0}))});e.shadowRoot?.querySelector(".element-container")?.appendChild(r)}}),n`<div class="element-container"></div>`};var ke=(e=>(e.div="div",e.p="p",e.h1="h1",e.h2="h2",e.h3="h3",e.h4="h4",e.h5="h5",e.h6="h6",e.span="span",e))(ke||{});const Ss=(e,t,a,i,s)=>{const r=e.metadata,o=r.attributes?.["data-colspan"],l=Ja(r.text,t,a,i,s);return ke.h1==r.container?n`
            <h1 style="${e.style}" class="${e.cssClasses}"
                id="${T(e.id)}"
                data-colspan="${T(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h1>
        `:ke.h2==r.container?n`
            <h2 style="${e.style}" class="${e.cssClasses}"
                id="${T(e.id)}"
                data-colspan="${T(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h2>
        `:ke.h3==r.container?n`
            <h3 style="${e.style}" class="${e.cssClasses}"
                id="${T(e.id)}"
                data-colspan="${T(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h3>
        `:ke.h4==r.container?n`
            <h4 style="${e.style}" class="${e.cssClasses}"
                id="${T(e.id)}"
                data-colspan="${T(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h4>
        `:ke.h5==r.container?n`
            <h5 style="${e.style}" class="${e.cssClasses}"
                id="${T(e.id)}"
                data-colspan="${T(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h5>
        `:ke.h6==r.container?n`
            <h6 style="${e.style}" class="${e.cssClasses}"
                id="${T(e.id)}"
                data-colspan="${T(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h6>
        `:ke.p==r.container?n`
               <p style="${e.style}" class="${e.cssClasses}"
                  id="${T(e.id)}"
                  data-colspan="${T(o)}"
                  slot="${e.slot??d}">
                   ${l??d}
               </p>
            `:ke.div==r.container?n`
               <div style="${e.style}" class="${e.cssClasses}"
                    id="${T(e.id)}"
                    data-colspan="${T(o)}"
                    slot="${e.slot??d}">${l?be(l):d}</div>
            `:ke.span==r.container?n`
               <span style="${e.style}" class="${e.cssClasses}"
                     id="${T(e.id)}"
                     data-colspan="${T(o)}"
                    slot="${e.slot??d}">${l??d}</span>
            `:n`
               <p
                       id="${T(e.id)}"
                       data-colspan="${T(o)}"
                       slot="${e.slot??d}">
                   Unknown text container: ${r.container} 
               </p>
            `},ks=(e,t,a)=>{const i=e.metadata;return n`<span theme="badge ${i.color} ${i.pill?"pill":""} ${i.small?"small":""} ${i.primary?"primary":""}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??d}">${dt(i.text,t,a)}</span>`},_s=(e,t,a)=>{const i=dt(e.text,t,a);if(!i)return d;let s=dt(e.color,t,a);return s=="SUCCESS"&&(s="success"),s=="ERROR"&&(s="error"),s=="DANGER"&&(s="error"),s=="WARNING"&&(s="warning"),s=="INFO"&&(s="info"),s=="PRIMARY"&&(s="primary"),s=="SECONDARY"&&(s="secondary"),s=="TERTIARY"&&(s="tertiary"),s=="QUATERNARY"&&(s="quaternary"),s=="LIGHT"&&(s="light"),s=="DARK"&&(s="dark"),n`<span theme="badge ${s} ${e.pill?"pill":""} ${e.small?"small":""} ${e.primary?"primary":""}">${i}</span>`},Cs=e=>{const t=e.metadata;return n`<a href="${t.url}" style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}">${t.text}</a>`},Za=(e,t)=>{const a=e.toLowerCase().split("+");return t.ctrlKey===a.includes("ctrl")&&t.altKey===a.includes("alt")&&t.shiftKey===a.includes("shift")&&t.metaKey===a.includes("meta")},Es=(e,t)=>{if(!Za(e,t))return!1;const a=e.toLowerCase().split("+"),i=a[a.length-1];return!!(t.key.toLowerCase()===i||/^[a-z]$/.test(i)&&t.code==="Key"+i.toUpperCase()||/^[0-9]$/.test(i)&&(t.code==="Digit"+i||t.code==="Numpad"+i))},Is=e=>e?e.split("+").map(t=>t.length<=1?t.toUpperCase():t.charAt(0).toUpperCase()+t.slice(1)).join("+"):void 0,ei=(e,t)=>{const a=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a,parameters:t.parameters},bubbles:!0,composed:!0}))},Ts=(e,t,a)=>{const i=e.metadata,s=Ne(i.label,t,a);let r="";return i.buttonStyle&&(r+=" "+i.buttonStyle),i.color&&i.color!=="none"&&i.color!=="normal"&&(r+=" "+i.color),i.size&&i.size!=="none"&&i.size!=="normal"&&(r+=" "+i.size),n`<vaadin-button
id="${e.id}"
            data-action-id="${i.actionId}"
            @click="${o=>ei(o,i)}"
            style="${e.style}"
            class="${e.cssClasses}"
            theme="${r}"
            ?disabled="${i.disabled}"
            title="${i.shortcut?`${s} (${Is(i.shortcut)})`:d}"
            slot="${e.slot??d}"
    >${i.iconOnLeft?n`<vaadin-icon icon="${i.iconOnLeft}"></vaadin-icon>`:d}${s}${i.iconOnRight?n`<vaadin-icon icon="${i.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>`},Rs=(e,t,a,i,s,r,o)=>{const l=t.metadata;if(!l)return n``;let c="";return l.variants?.map(h=>h=="stretchMedia"?"stretch-media":h=="coverMedia"?"cover-media":h).forEach(h=>c+=" "+h),c=c.trim(),n`
        <vaadin-card
                style="${t.style}" 
                class="${t.cssClasses}" 
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${l.media?nt(e,l.media,a,i,s,r,o,"media",!1):d}
            ${l.title?nt(e,l.title,a,i,s,r,o,"title",!1):d}
            ${l.subtitle?nt(e,l.subtitle,a,i,s,r,o,"subtitle",!1):d}
            ${l.header?nt(e,l.header,a,i,s,r,o,"header",!1):d}
            ${l.headerPrefix?nt(e,l.headerPrefix,a,i,s,r,o,"header-prefix",!1):d}
            ${l.headerSuffix?nt(e,l.headerSuffix,a,i,s,r,o,"header-suffix",!1):d}
            ${l.footer?nt(e,l.footer,a,i,s,r,o,"footer",!1):d}
            ${l.content?b(e,l.content,a,i,s,r,o,!1):d}
        </vaadin-card>
    `},Ps=e=>{const t=e.metadata;return n`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??d}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},Os=e=>{const t=e.metadata;return n`
        <vaadin-icon icon="${t.icon}" style="${e.style}" class="${e.cssClasses}"
                     slot="${e.slot??d}"></vaadin-icon>
    `},Ls=(e,t,a,i,s,r,o)=>{const l=t.metadata;let c=!1;if(l.openedCondition)try{c=Ya(l.openedCondition,i,s,r,o)}catch(h){console.error("when evaluating "+l.openedCondition+" :"+h+", where data is "+s+" and state is "+i)}return n`
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
  ${t.children?.map(h=>b(e,h,a,i,s,r,o))}
</vaadin-confirm-dialog>
            `},Ds=e=>{const t=e.metadata;let a;return t.position&&(a={Top:"top",Bottom:"bottom",TopLeft:"top-left",TopRight:"top-right",BottomLeft:"bottom-left",BottomRight:"bottom-right"}[t.position]),n`
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
    `},zs=(e,t,a,i,s,r,o)=>{const l=t.metadata;return n`
        <vaadin-details 
                ?opened="${l.opened}" 
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            <vaadin-details-summary slot="summary">
            ${b(e,l.summary,a,i,s,r,o)}
            </vaadin-details-summary>
            ${b(e,l.content,a,i,s,r,o)}
        </vaadin-details>
            `},As=(e,t,a,i,s,r)=>n`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${i}"
            .appState="${s}"
            .appdata="${r}"
        ></mateu-dialog>
            `,Fs=e=>{const t=e.metadata;return n`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"  
                  route="${t.route}" 
                  consumedRoute="${t.consumedRoute}" 
                  id="${G()}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??d}"
        ></mateu-ux>
        </mateu-api-caller>
            `},Ns=e=>{const t=e.metadata;return n`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style}" class="${e.cssClasses}"
                        slot="${e.slot??d}"></mateu-markdown>
            `},qs=e=>{const t=e.metadata;return n`
        <vaadin-notification
                .opened="${!0}"
                slot="${e.slot??d}"
                style="${e.style}"
                class="${e.cssClasses}"
                ${Ha(()=>n`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${t.title}</h3>
                        <div>
                            ${t.text}
                        </div>
                    </vaadin-horizontal-layout>
                `,[])}
        ></vaadin-notification>
            `},Us=(e,t={})=>{const a=e.metadata,i=a.valueKey?t[a.valueKey]:a.value;return n`
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
    `},Ms=(e,t,a,i,s,r,o)=>{const l=t.metadata;return n`
        <div id="show-notifications">${b(e,l.wrapped,a,i,s,r,o)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                slot="${t.slot??d}"
                ${fa(()=>n`${b(e,l.content,a,i,s,r,o)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
        ></vaadin-popover>
    `},Bs=e=>{const t=e.metadata;return n`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}"></mateu-map>
            `},js=e=>{const t=e.metadata;return n`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??d}">
            `},Ws=e=>{const t=e.metadata;return n`<vaadin-horizontal-layout theme="spacing"
                                          slot="${e.slot??d}">
        ${t.breadcrumbs.map(a=>n`
            <a href="${a.link}">${a.text}</a>
            <span>/</span>
        `)}
        <div style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </vaadin-horizontal-layout>`},Vs=(e,t,a,i,s,r,o)=>{const l=t.metadata;return n`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${l.dots}" 
                ?nav = "${l.nav}" 
                ?loop = "${l.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(c=>n`<div>${b(e,c,a,i,s,r,o)}</div>`)}
        </skeleton-carousel>
    `},Hs=(e,t,a,i)=>{const s=e.metadata;return n`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            ${s.menu.map(r=>ti(r))}
        </div>
            `},ti=e=>n`
        ${e.submenus?n`
                <vaadin-details summary="${e.label}" opened>
                    <vaadin-vertical-layout theme="spacing">
                        ${e.submenus.map(t=>ti(t))}
                    </vaadin-vertical-layout>
                </vaadin-details>
            `:n`
                <a href="${e.path}">${e.label}</a>
        `}
        `,Gs=(e,t,a,i,s,r,o)=>{const l=t.metadata;return n`<div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >${l.content?be(l.content):d}${t.children?.map(c=>b(e,c,a,i,s,r,o))}</div>
    `},Ks=(e,t,a,i,s,r,o)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return n`<vaadin-card
                slot="${t.slot??d}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?n`<div slot="title" style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color);">${c}</div>`:d}
        ${t.children?.map(h=>b(e,h,a,i,s,r,o))}
    </vaadin-card>
    `},Js=(e,t,a,i,s,r,o)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return n`
        <div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(h=>b(e,h,a,i,s,r,o))}</div>
    `},ma=(e,t,a,i,s,r,o,l)=>{const c=t.metadata,h=c?.fabs??[];return n`<mateu-page
            .component="${t}"
            baseUrl="${a}"
            .state="${i}"
            .data="${s}"
            .appState="${r}"
            .appdata="${o}"
            slot="${t.slot??d}"
            style="${t.style}"
            class="${t.cssClasses}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(p=>b(e,p,a,i,s,r,o))}
        ${c?.buttons?.map(p=>n`
                   ${b(e,{id:p.actionId,metadata:p,type:Y.ClientSide,slot:"buttons"},void 0,i,s,r,o)}
`)}
        ${h.map((p,v)=>n`
            <button class="page-fab" style="position: fixed; bottom: ${1.5+v*4}rem; right: 5.5rem;"
                @click="${()=>e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:p.actionId},bubbles:!0,composed:!0}))}"
                title="${p.label}">
                <vaadin-icon icon="${p.icon}"></vaadin-icon>
            </button>
        `)}
</mateu-page>
    `},va=(e,t,a,i,s,r,o,l)=>n`<mateu-table-crud
            id="${t.id}"
            baseUrl="${a}"
            .component="${t}"
            .metadata="${t.metadata}"
            .state="${i}"
            .data="${s}"
            .appState="${r}"
            .appdata="${o}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(c=>b(e,c,a,i,s,r,o))}
    </mateu-table-crud>`,Ys=e=>{const t=e.metadata;return n`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??d}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},Xs=(e,t,a)=>{const i=e.metadata;return n`<mateu-chat sseUrl="${i.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??d}"></mateu-chat>`},Qs=e=>{const t=e.metadata;return n`
        <mateu-workflow
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow>
    `},Zs=e=>{const t=e.metadata;return n`
        <mateu-workflow-elk
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
                ?readOnly="${t.readOnly??!1}"
        ></mateu-workflow-elk>
    `},er=e=>{const t=e.metadata;return n`
        <mateu-form-editor
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Form","fields":[]}'}"
        ></mateu-form-editor>
    `},ai=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,tr=e=>e=="up"?"var(--lumo-success-text-color, #1a7f37)":e=="down"?"var(--lumo-error-text-color, #c5221f)":"var(--lumo-secondary-text-color, #666)",ar=e=>e=="up"?"▲":e=="down"?"▼":"",ir=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},sr=e=>{const t=e.metadata,a=!!t.actionId;return n`
        <div class="mateu-metric-card ${e.cssClasses??""}"
             style="${ai} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${a?"cursor: pointer;":""} ${e.style??""}"
             slot="${e.slot??d}"
             role="${a?"button":d}"
             @click="${i=>ir(i,t)}"
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
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${tr(t.trend)};">
                    ${ar(t.trend)} ${t.trendLabel??d}
                </span>
            `:d}
            ${t.description?n`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:d}
        </div>
    `},rr=(e,t,a,i,s,r,o)=>n`
        <div class="mateu-scoreboard ${t.cssClasses??""}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(l=>b(e,l,a,i,s,r,o))}
        </div>
    `,nr=(e,t,a,i,s,r,o)=>{const l=t.metadata,c=l.colSpan&&l.colSpan>1?`grid-column: span ${l.colSpan};`:"",h=l.rowSpan&&l.rowSpan>1?`grid-row: span ${l.rowSpan};`:"";return n`
        <div class="mateu-dashboard-panel ${t.cssClasses??""}"
             style="${ai} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${h} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?n`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${l.title}</h3>
                    ${l.subtitle?n`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${l.subtitle}</span>`:d}
                </div>
            `:d}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(p=>b(e,p,a,i,s,r,o))}
            </div>
        </div>
    `},or=(e,t,a,i,s,r,o)=>{const l=t.metadata,c=l.columns&&l.columns>0?`repeat(${l.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return n`
        <div class="mateu-dashboard ${t.cssClasses??""}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(h=>b(e,h,a,i,s,r,o))}
        </div>
    `};var lr=Object.defineProperty,dr=Object.getOwnPropertyDescriptor,ya=(e,t,a,i)=>{for(var s=i>1?void 0:i?dr(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&lr(t,a,s),s};let zt=class extends O{constructor(){super(...arguments),this.panels=[],this.openPanels=new Set,this.initialized=!1}willUpdate(){!this.initialized&&this.panels.length&&(this.openPanels=new Set(this.panels.map((e,t)=>e.open?t:-1).filter(e=>e>=0)),this.initialized=!0)}toggle(e){const t=new Set(this.openPanels);t.has(e)?t.delete(e):t.add(e),this.openPanels=t}render(){return n`
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
        `}};zt.styles=R`
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
    `;ya([u({type:Array})],zt.prototype,"panels",2);ya([f()],zt.prototype,"openPanels",2);zt=ya([_("mateu-foldout")],zt);const cr=(e,t,a,i,s,r,o)=>{const l=t.metadata;return n`
        <mateu-foldout
                .panels="${l.panels??[]}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(c=>b(e,c,a,i,s,r,o))}
        </mateu-foldout>
    `},hr=(e,t,a,i,s,r,o)=>{const l=t.metadata,c=!!l.image,h=c?`background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${l.image}'); background-size: cover; background-position: center; color: #fff;`:"",p=l.centered===!1?"flex-start":"center",v=l.centered===!1?"left":"center";return n`
        <div class="mateu-hero ${t.cssClasses??""}"
             style="display: flex; flex-direction: column; align-items: ${p}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${v}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); min-height: ${l.height??"12rem"}; box-sizing: border-box; ${h} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?n`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${l.title}</h1>`:d}
            ${l.subtitle?n`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${c?"":"color: var(--lumo-secondary-text-color, #666);"} max-width: 40rem;">${l.subtitle}</p>`:d}
            ${t.children?.length?n`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${p}; width: 100%; max-width: 40rem;">
                    ${t.children?.map($=>b(e,$,a,i,s,r,o))}
                </div>
            `:d}
        </div>
    `};var ur=Object.defineProperty,pr=Object.getOwnPropertyDescriptor,ii=(e,t,a,i)=>{for(var s=i>1?void 0:i?pr(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&ur(t,a,s),s};const ca=1440*60*1e3;let Jt=class extends O{constructor(){super(...arguments),this.tasks=[]}range(){const e=this.tasks.flatMap(t=>[t.start,t.end]).filter(t=>!!t).map(t=>new Date(t+"T00:00:00").getTime());return e.length?{min:Math.min(...e)-ca,max:Math.max(...e)+2*ca}:null}months(e,t){const a=[],i=new Date(e);for(i.setDate(1);i.getTime()<=t;){const s=Math.max(i.getTime(),e),r=new Date(i.getFullYear(),i.getMonth()+1,1),o=Math.min(r.getTime(),t);a.push({label:i.toLocaleDateString(void 0,{month:"short",year:"2-digit"}),from:s,to:o}),i.setMonth(i.getMonth()+1)}return a}render(){const e=this.range();if(!e)return n``;const t=e.max-e.min,a=s=>(s-e.min)/t*100,i=Date.now();return n`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(s=>n`
                        <div class="month" style="width: ${(s.to-s.from)/t*100}%;">${s.label}</div>
                    `)}
                </div>
                ${this.tasks.map(s=>{const r=new Date(s.start+"T00:00:00").getTime(),o=new Date(s.end+"T00:00:00").getTime()+ca;return n`
                        <div class="label" title="${s.title}">${s.title}</div>
                        <div class="lane">
                            ${i>=e.min&&i<=e.max?n`<div class="today" style="left: ${a(i)}%;"></div>`:d}
                            <div class="bar"
                                 title="${s.title} · ${s.start} → ${s.end}${s.progress?` · ${s.progress}%`:""}"
                                 style="left: ${a(r)}%; width: ${(o-r)/t*100}%; ${s.color?`--mateu-gantt-fill: ${s.color};`:""}">
                                <div class="fill" style="width: ${s.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};Jt.styles=R`
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
    `;ii([u({type:Array})],Jt.prototype,"tasks",2);Jt=ii([_("mateu-gantt")],Jt);const mr=e=>{const t=e.metadata;return n`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-gantt>
    `},vr=(e,t)=>{let a=e.style;return e.id&&(a&&!a.endsWith(";")&&(a+=";"),a==null&&(a=""),t[e.id+".hidden"]==!0&&(a+="display: none;")),a},fr=(e,t)=>{let a={...e.metadata};if(e.id&&a){if(a.type==m.Button){const i=a;t[e.id+".disabled"]==!0&&(i.disabled=!0)}if(a.type==m.FormField){const i=a;t[e.id+".disabled"]==!0&&(i.disabled=!0)}}return a},E=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),br={[m.Bpmn]:({component:e})=>Ys(e),[m.Workflow]:({component:e})=>Qs(e),[m.WorkflowElk]:({component:e})=>Zs(e),[m.FormEditor]:({component:e})=>er(e),[m.Page]:E(ma),[m.Div]:E(Gs),[m.Directory]:({component:e,baseUrl:t,state:a,data:i})=>Hs(e),[m.FormLayout]:E(Si),[m.HorizontalLayout]:E(Ci),[m.VerticalLayout]:E(Ei),[m.SplitLayout]:E(Ii),[m.MasterDetailLayout]:E(Ti),[m.TabLayout]:E(Ri),[m.AccordionLayout]:E(Oi),[m.BoardLayout]:E(Fi),[m.BoardLayoutRow]:E(Ni),[m.BoardLayoutItem]:E(qi),[m.Scroller]:E(Di),[m.FullWidth]:E(zi),[m.Container]:E(Ai),[m.Form]:({container:e,component:t,baseUrl:a,state:i,data:s,appState:r,appData:o})=>{const l=t.metadata;return n`<mateu-form
            id="${t.id}"
        baseUrl="${a}"
            .component="${t}"
            .values="${i}"
            .state="${i}"
            .data="${s}"
            .appState="${r}"
            .appdata="${o}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            >
                ${t.children?.map(c=>b(e,c,a,i,s,r,o))}
            ${l?.buttons?.map(c=>n`
               ${b(e,{id:c.actionId,metadata:c,type:Y.ClientSide,slot:"buttons"},void 0,i,s,r,o)}
`)}

            </mateu-form>`},[m.Table]:({container:e,component:t,baseUrl:a,state:i,data:s,appState:r,appData:o})=>n`<mateu-table
                        id="${t.id}"
        baseUrl="${a}"
            .metadata="${t.metadata}"
            .state="${i}"
                        .data="${s}"
                        .appState="${r}"
                        .appDate="${o}"
                        style="${t.style}" class="${t.cssClasses}"
                        slot="${t.slot??d}"
            >
             ${t.children?.map(l=>b(e,l,a,i,s,r,o))}
            </mateu-table>`,[m.Crud]:E(va),[m.App]:({container:e,component:t,baseUrl:a,state:i,data:s,appState:r,appData:o})=>n`
            <mateu-app
                        id="${t.id}"
                        baseUrl="${a}"
                        .component="${t}"
                        .state="${i}"
                        .data="${s}"
                        style="${t.style}"
                        class="${t.cssClasses}"
                        .appState="${r}"
                        .appData="${o}"
            >
             ${t.children?.map(l=>b(e,l,a,i,s,r,o))}
         </mateu-app>`,[m.Element]:({container:e,component:t})=>xs(e,t.metadata,t),[m.FormField]:({container:e,component:t,baseUrl:a,state:i,data:s,appState:r,appData:o,labelAlreadyRendered:l})=>{const c=t.metadata;return n`
    <mateu-field
                   id="${t.id}"
                   .component="${t}"
            .field="${t.metadata}"
                   .state="${i}"
                   .data="${s}"
                   .appState="${r}"
                   .appdata="${o}"
                   style="${t.style}" class="${t.cssClasses}"
                   slot="${t.slot??d}"
                   data-colspan="${c.colspan}"
                   .labelAlreadyRendered="${l}"
            >
                    ${t.children?.map(h=>b(e,h,a,i,s,r,o,l))}
                </mateu-field>
        `},[m.Text]:({component:e,state:t,data:a,appState:i,appData:s})=>Ss(e,t,a,i,s),[m.Avatar]:({component:e,state:t,data:a})=>Mi(e,t,a),[m.Chat]:({component:e,state:t,data:a})=>Xs(e),[m.AvatarGroup]:({component:e})=>Bi(e),[m.Badge]:({component:e,state:t,data:a})=>ks(e,t,a),[m.Breadcrumbs]:({component:e})=>Ws(e),[m.Anchor]:({component:e})=>Cs(e),[m.Button]:({component:e,state:t,data:a})=>Ts(e,t,a),[m.Card]:E(Rs),[m.Chart]:({component:e})=>Ps(e),[m.Icon]:({component:e})=>Os(e),[m.ConfirmDialog]:E(Ls),[m.ContextMenu]:E(vs),[m.CookieConsent]:({component:e})=>Ds(e),[m.Details]:E(zs),[m.Dialog]:({component:e,baseUrl:t,state:a,data:i,appState:s,appData:r})=>As(e,t,a,i,s,r),[m.Image]:({component:e})=>js(e),[m.Map]:({component:e})=>Bs(e),[m.Markdown]:({component:e})=>Ns(e),[m.MicroFrontend]:({component:e})=>Fs(e),[m.Notification]:({component:e})=>qs(e),[m.ProgressBar]:({component:e,state:t})=>Us(e,t),[m.Popover]:E(Ms),[m.CarouselLayout]:E(Vs),[m.Tooltip]:E($s),[m.MessageInput]:({component:e})=>gs(e),[m.MessageList]:({component:e})=>ms(e),[m.CustomField]:E(bs),[m.MenuBar]:({container:e,component:t,baseUrl:a,state:i,data:s})=>fs(e,t,a,i,s),[m.Grid]:E(ps),[m.VirtualList]:E(ji),[m.FormSection]:E(Ks),[m.FormSubSection]:E(Js),[m.MetricCard]:({component:e})=>sr(e),[m.Scoreboard]:E(rr),[m.DashboardPanel]:E(nr),[m.DashboardLayout]:E(or),[m.FoldoutLayout]:E(cr),[m.HeroSection]:E(hr),[m.EmptyState]:({component:e})=>Gi(e),[m.Skeleton]:({component:e})=>Ki(e),[m.Gantt]:({component:e})=>mr(e)},wa=(e,t,a,i,s,r,o,l)=>{if(!t?.metadata)return t==null?(console.warn("No metadata for component",t),n`<p>No metadata for component</p>`):wa(e,{id:G(),metadata:t,type:Y.ClientSide},a,i,s,r,o,l);const c=t.metadata.type,h={...t,style:vr(t,s),metadata:fr(t,s)},p=br[c];return p?p({container:e,component:h,baseUrl:a,state:i,data:s,appState:r,appData:o,labelAlreadyRendered:l}):n`<p ${h?.slot??d}>Unknown metadata type ${c} for component ${h?.id}</p>`};var ze=(e=>(e.HAMBURGUER_MENU="HAMBURGUER_MENU",e.MENU_ON_LEFT="MENU_ON_LEFT",e.MENU_ON_TOP="MENU_ON_TOP",e.TABS="TABS",e.TILES="TILES",e.RAIL="RAIL",e.AUTO="AUTO",e.MEDIATOR="MEDIATOR",e))(ze||{});const Gt=(e,t)=>e.themeToggle?n`
        <vaadin-button theme="tertiary icon" @click="${t.toggleTheme}"
            title="${t.isDark?"Switch to light mode":"Switch to dark mode"}"
            style="margin-left: 0.5rem; margin-right: 0.5rem; flex-shrink: 0;">
            <vaadin-icon icon="${t.isDark?"vaadin:sun-o":"vaadin:moon"}" style="color: var(--lumo-body-text-color);"></vaadin-icon>
        </vaadin-button>
    `:d,gr=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},Oa=(e,t,a)=>{const i=Ae(e,t,a),s=J(t,a);return i=="list"||i==s?"new":i},Ae=(e,t,a)=>{const i=e?._route;if(i!=null&&(i===""||i.startsWith("/"))){const s=a.homeRoute??"",r=s.indexOf("?"),o=r>=0?s.substring(r+1):"",l=J(t,a)+i;if(!o)return l;const c=l.indexOf("?")>=0?"&":"?";return l+c+o}return t.selectedRoute?t.selectedRoute:a.homeRoute},J=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,_e=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:t.homeBaseUrl,Ce=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,Ee=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,$r=(e,t,a,i,s,r,o)=>{const l=e.mapItems(t.menu,e.filter?.toLowerCase()??""),c=J(e,t),h=Oa(i,e,t),p=h&&h!=="new"&&h.startsWith(c+"/")?h.substring(c.length+1).split("/")[0]:void 0;return n`
                    ${t.variant==ze.MEDIATOR?n`

                        ${t.layout=="SPLIT"?n`
                            <vaadin-master-detail-layout>
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${J(e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${_e(e,t)}"
                                            consumedRoute="${J(e,t)}"
                                            serverSideType="${Ce(e,t)}"
                                            uriPrefix="${Ee(e,t)}"
                                            style="width: 100%;"
                                            .appState="${{...r,_splitDetailId:p}}"
                                            .appData="${o}"
                                            instant="${c}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>
                                <mateu-api-caller slot="detail">
                                    <div style="padding-left: 1rem; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${Oa(i,e,t)}"
                                            id="ux_${e.id}_detail"
                                            baseUrl="${_e(e,t)}"
                                            consumedRoute="${J(e,t)}"
                                            serverSideType="${Ce(e,t)}"
                                            uriPrefix="${Ee(e,t)}"
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
                                        route="${Ae(i,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${_e(e,t)}"
                                        consumedRoute="${J(e,t)}"
                                        serverSideType="${Ce(e,t)}"
                                        uriPrefix="${Ee(e,t)}"
                                        style="width: 100%;"
                                        .appState="${r}"
                                        .appData="${o}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `}
                        
`:d}
            ${t.variant==ze.HAMBURGUER_MENU?n`
                <vaadin-app-layout style="${t?.style}" class="${t?.cssClasses}" .drawerOpened=${!t.drawerClosed}>
                    <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                    <h2 slot="navbar" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2><p slot="navbar">${t.subtitle}</p>
                    <vaadin-horizontal-layout slot="navbar" style="margin-left: auto; align-items: center;">
                        <slot name="widgets"></slot>
                        ${Gt(t,e)}
                    </vaadin-horizontal-layout>
                    <vaadin-scroller slot="drawer" class="p-s"
                                     @navigation-requested="${e.updateRoute}">
                        ${t.menu&&t.totalMenuOptions>10?n`
                            <vaadin-text-field style="width: calc(100% - 20px); padding-left: 10px; padding-right: 10px;" @value-changed="${v=>gr(v,e)}">
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
                                            route="${Ae(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${_e(e,t)}"
                                            consumedRoute="${J(e,t)}"
                                            serverSideType="${Ce(e,t)}"
                                            uriPrefix="${Ee(e,t)}"
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
            
            ${t.variant==ze.MENU_ON_TOP?n`
                <vaadin-vertical-layout style="width: 100%; height: 100vh; overflow: hidden;">
                    <vaadin-horizontal-layout
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>e.goHome()}" style="text-decoration: none; color: inherit;">
                        <vaadin-horizontal-layout style="align-items: center;">
                            ${t.logo?n`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:d}
                            ${t.title?n`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:d}
                        </vaadin-horizontal-layout>
                        </a>
                        <vaadin-menu-bar
                                .items="${l}"
                                @item-selected="${e.itemSelected}"
                                theme="dropdown-indicators"
                                style="flex-grow: 1; margin-left: 4rem; margin-top: 1.3rem;"
                                class="menu"
                        >
                        </vaadin-menu-bar>
                        <vaadin-horizontal-layout>
                            <slot name="widgets"></slot>
                            ${Gt(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Ae(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${_e(e,t)}"
                                            consumedRoute="${J(e,t)}"
                                            serverSideType="${Ce(e,t)}"
                                            uriPrefix="${Ee(e,t)}"
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

            ${t.variant==ze.TILES?n`
                <vaadin-vertical-layout style="width: 100%; height: 100vh; overflow: hidden;">
                    <vaadin-horizontal-layout
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>{e.goHome(),e.tilesMenuOption=null}}" style="text-decoration: none; color: inherit;">
                        <vaadin-horizontal-layout style="align-items: center;">
                            ${t.logo?n`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:d}
                            ${t.title?n`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:d}
                        </vaadin-horizontal-layout>
                        </a>
                        <vaadin-menu-bar
                                .items="${e.mapItemsForTiles(t.menu)}"
                                @item-selected="${e.itemSelectedTiles}"
                                theme="dropdown-indicators"
                                style="flex-grow: 1; margin-left: 4rem; margin-top: 1.3rem;"
                                class="menu"
                        >
                        </vaadin-menu-bar>
                        <vaadin-horizontal-layout>
                            <slot name="widgets"></slot>
                            ${Gt(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):n`
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Ae(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${_e(e,t)}"
                                            consumedRoute="${J(e,t)}"
                                            serverSideType="${Ce(e,t)}"
                                            uriPrefix="${Ee(e,t)}"
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

            ${t.variant==ze.RAIL?n`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):d}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Ae(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${_e(e,t)}"
                                            consumedRoute="${J(e,t)}"
                                            serverSideType="${Ce(e,t)}"
                                            uriPrefix="${Ee(e,t)}"
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

            ${t.variant==ze.MENU_ON_LEFT?n`

                <vaadin-horizontal-layout>
                    <vaadin-scroller style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <vaadin-vertical-layout
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(v=>e.renderOptionOnLeftMenu(v))}
                            ${Gt(t,e)}
                        </vaadin-vertical-layout>
                    </vaadin-scroller>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Ae(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${_e(e,t)}"
                                            consumedRoute="${J(e,t)}"
                                            serverSideType="${Ce(e,t)}"
                                            uriPrefix="${Ee(e,t)}"
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

            ${t.variant==ze.TABS?n`
                <!--
                
                box-shadow: inset 0 -1px 0 0 var(--lumo-contrast-10pct);
                
                -->
                
                <div>
                    <div>
                        <vaadin-horizontal-layout 
                                style="width: 100%;   align-items: center; border-bottom: 1px solid var(--lumo-contrast-10pct);" 
                                theme="spacing"
                                @navigation-requested="${e.updateRoute}">
                            <a href="javascript: void(0);" @click="${()=>e.goHome()}" style="text-decoration: none; color: inherit;">
                            <vaadin-horizontal-layout style="align-items: center;">
                                ${t.logo?n`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:d}
                                ${t.title?n`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:d}
                            </vaadin-horizontal-layout>
                            </a>
                            <vaadin-tabs selected="${e.getSelectedIndex(t.menu)}"
                                         style="box-shadow: unset;"
                                         class="${e.component?.cssClasses}">
                                ${t.menu.map(v=>n`
                                <vaadin-tab 
                                        @click="${()=>e.selectRoute(v.consumedRoute,v.route,v.actionId,v.baseUrl,v.serverSideType,v.uriPrefix)}"
                                >${v.label}</vaadin-tab>
                            `)}
                            </vaadin-tabs>
                            <vaadin-horizontal-layout>
                                <slot name="widgets"></slot>
                            </vaadin-horizontal-layout>
                        </vaadin-horizontal-layout>
                    </div>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Ae(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${_e(e,t)}"
                                            consumedRoute="${J(e,t)}"
                                            serverSideType="${Ce(e,t)}"
                                            uriPrefix="${Ee(e,t)}"
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

            ${t.fabs?.map((v,$)=>n`
                <button class="app-fab" style="bottom: ${t.sseUrl?5.5+$*4:1.5+$*4}rem; right: 1.5rem;"
                    @click="${()=>e.runAction(v.actionId)}"
                    title="${v.label}">
                    <vaadin-icon icon="${v.icon}"></vaadin-icon>
                </button>
            `)}
            ${t.sseUrl&&!e.chatOpen?n`
                <button class="ai-fab" @click="${e.showHideIa}" title="Asistente IA">
                    <vaadin-icon icon="vaadin:comments-o"></vaadin-icon>
                </button>
            `:d}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},yr=(e,t)=>t!=null&&e!=null&&!e.has(t),wr=typeof HTMLElement<"u"?HTMLElement:class{};class xr extends wr{static get observedAttributes(){return["type","renderer"]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){const t=this.getAttribute("type")??"unknown",a=this.getAttribute("renderer")??"unknown";this.shadowRoot||this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
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
        `}}typeof customElements<"u"&&!customElements.get("mateu-unsupported")&&customElements.define("mateu-unsupported",xr);const La=new Set,Sr=(e,t,a)=>{const i=`${a}/${t}`;return La.has(i)||(La.add(i),console.warn(`[mateu] Component type "${t}" is not supported by the "${a}" renderer — rendering <mateu-unsupported> placeholder.`)),n`<mateu-unsupported
            type="${t}"
            renderer="${a}"
            data-component-id="${e?.id??d}"
            slot="${e?.slot??d}"
    ></mateu-unsupported>`};class kr{renderFilterBar(t,a,i,s,r,o,l,c){const h=a?.metadata,p=$=>{const{fieldId:k,value:S}=$.detail;t.state={...t.state,[k]:S}},v=$=>{const{fieldIds:k}=$.detail,S={};k.forEach(g=>{S[g]=void 0}),S.searchText=void 0,t.state={...t.state,...S}};return n`
            <mateu-filter-bar
                .metadata="${h}"
                @search-requested="${t.search}"
                @value-changed="${p}"
                @filter-reset-requested="${v}"
                .state="${t.state}"
                .data="${r}"
                .appState="${o}"
                .appData="${l}"
                ?searchOnly="${c??!1}"
            >
                ${h?.header?.map($=>b(t,$,i,s,r,o,l))}
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
        `}renderTableComponent(t,a,i,s,r,o,l){return n`
        <mateu-table id="${t.id}"
                     .metadata="${a?.metadata}"
                     .data="${t.data}"
                     .state="${s}"
                     .appState="${o}"
                     .appData="${l}"
                     .emptyStateMessage="${s[a?.id]?.emptyStateMessage}"
                     @sort-direction-changed="${t.directionChanged}"
                     @fetch-more-elements="${t.fetchMoreElements}"
                     baseUrl="${i}"
        ></mateu-table>
        `}rendererName(){return this.constructor?.name??"unknown"}supportedClientSideTypes(){}renderClientSideComponent(t,a,i,s,r,o,l,c){const h=a?.metadata?.type??a?.type,p=Object.values(m).includes(h)?h:void 0;return yr(this.supportedClientSideTypes(),p)?Sr(a,p,this.rendererName()):wa(t,a,i,s,r,o,l,c)}renderAppComponent(t,a,i,s,r,o,l){return $r(t,a?.metadata,i,s,r,o,l)}}let bt=[];class _r{constructor(){this.axiosInstance=yi.create({timeout:6e4}),this.axiosInstance.interceptors.request.use(t=>(this.addAuthToken(t),this.addSessionId(t),t))}addSessionId(t){let a=sessionStorage.getItem("__mateu_sesion_id");a||(a=G(),sessionStorage.setItem("__mateu_sesion_id",a)),t.headers["X-Session-Id"]=a}addAuthToken(t){const a=localStorage.getItem("__mateu_auth_token");a&&(t.headers.Authorization="Bearer "+a)}async wrap(t,a,i,s){return i||a.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),t.then(r=>(a.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:s}})),r)).catch(r=>{throw r?.code=="ERR_CANCELED"?a.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{}})):a.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:s,reason:this.serialize(r)}})),r})}serialize(t){return t?.message?t:JSON.stringify(t)}async get(t){const a=new AbortController;return bt=[...bt,a],this.axiosInstance.get(t,{signal:a.signal})}async post(t,a){const i=new AbortController;return bt=[...bt,i],this.axiosInstance.post(t,a,{signal:i.signal})}async abortAll(){bt.forEach(t=>t.abort()),bt=[]}async runAction(t,a,i,s,r,o,l,c,h,p,v){return a&&a.startsWith("/")&&(a=a.substring(1)),await this.wrap(this.post(t+"/mateu/v3/sync/"+(a&&a!=""?a:"_no_route"),{serverSideType:l,appState:o,componentState:c,parameters:h,initiatorComponentId:r,consumedRoute:i,route:a&&a!=""?"/"+a:"",actionId:s}).then($=>$.data),p,v,s)}}const si=new _r;var At=(e=>(e.Add="Add",e.Replace="Replace",e.ReplaceKeepData="ReplaceKeepData",e))(At||{}),Cr=Object.defineProperty,ri=(e,t,a,i)=>{for(var s=void 0,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=o(t,a,s)||s);return s&&Cr(t,a,s),s};class ea extends O{constructor(){super(...arguments),this.id="",this.baseUrl="",this.callbackToken="",this.createElement=t=>{const a=t.data,i=document.createElement(a.name);for(let s in a.attributes)i.setAttribute(s,a.attributes[s]);for(let s in a.on)i.addEventListener(s,r=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.on[s],parameters:{event:r}},bubbles:!0,composed:!0}))});return i},this.closeModal=()=>{const t=this.shadowRoot?.querySelectorAll("mateu-dialog");if(t&&t.length>0){t[t.length-1].close();return}this.dispatchEvent(new CustomEvent("close-modal-requested",{bubbles:!0,composed:!0}))},this.changeFavicon=t=>{let a=document.querySelector('link[rel="icon"]');a!==null?a.setAttribute("href",t):(a=document.createElement("link"),a.setAttribute("rel","icon"),a.setAttribute("href",t),document.head.appendChild(a))}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=Ye.subscribe(t=>{if(t.command){const a=t.command;this.id==a.targetComponentId&&this.applyCommand(a)}if((!t.callbackToken||!this.callbackToken||t.callbackToken===this.callbackToken)&&t.fragment){const a=t.fragment;this.id==a.targetComponentId&&(this.applyFragment(a),this.completeMenu(a))}})}completeMenu(t){if(t.component&&t.component.type==Y.ClientSide){const a=t.component,i=a.metadata;if(i?.type==m.App){const s=i,r=this.getRemoteMenus(s.menu);if(r.length>0){const o=r.map(l=>si.runAction(l.baseUrl,l.route,"_empty","",l.baseUrl+"#"+l.route,void 0,void 0,void 0,l.params,this,!0));Promise.all(o).then(l=>{s.menu=this.updateMenu(s.menu,l.map(c=>c.fragments).filter(c=>c).map(c=>c).flat()),s.variant=ze.MENU_ON_TOP,Ye.next({fragment:{component:a,data:void 0,state:void 0,action:At.Replace,targetComponentId:this.id,containerId:void 0},callbackToken:this.callbackToken})})}}}}updateMenu(t,a){const i=[];return t.forEach(s=>{if(s.remote){const r=a.find(o=>o.targetComponentId==s.baseUrl+"#"+s.route);if(r&&r.component?.type==Y.ClientSide){const o=r.component;if(o.metadata?.type==m.App){const l=o.metadata,c=s.serverSideType&&s.serverSideType!=""?s.serverSideType:l.serverSideType;this.changeBaseUrl(l.menu,s.baseUrl,c,s.route,l.route),i.push(...l.menu)}}}else i.push(s)}),i}changeBaseUrl(t,a,i,s,r){t.forEach(o=>{o.baseUrl||(o.submenus&&o.submenus.length>0?this.changeBaseUrl(o.submenus,a,i,s,r):(o.consumedRoute=r??"",o.baseUrl=a,o.serverSideType=i,o.uriPrefix=s))})}getRemoteMenus(t){const a=[];return t.forEach(i=>{i.remote&&a.push(i)}),a}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(t){if(t.type=="SetWindowTitle"&&(document.title=t.data),t.type=="SetFavicon"&&this.changeFavicon(t.data),t.type=="DispatchEvent"){const a=t.data;if(a&&a.eventName){const i=this.component,s=i?.emitsName??i?.serverSideType;let r=a.payload??a.detail;s&&r&&typeof r=="object"&&(r={...r,__source:s}),this.dispatchEvent(new CustomEvent(a.eventName,{detail:r,bubbles:!0,composed:!0}))}}if(t.type=="NavigateTo"){const a=t.data;a&&(a.startsWith("http:")||a.startsWith("https:")?window.open(t.data,"_blank"):window.location.href=t.data)}if(t.type=="PushStateToHistory"){const a=t.data;a!==void 0&&this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:a},bubbles:!0,composed:!0}))}if(t.type=="RunAction"){const a=t.data;if(a&&a.actionId)if(a.targetComponentId){const i={command:{type:"RunAction",data:{actionId:a.actionId},targetComponentId:a.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:""};setTimeout(()=>Ye.next(i))}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(t.type=="MarkAsDirty"&&this.dispatchEvent(new CustomEvent("dirty",{detail:{},bubbles:!0,composed:!0})),t.type=="MarkAsClean"&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),t.type=="DownloadFile"){const a=t.data;if(a&&a.base64Content){const i=atob(a.base64Content),s=new Uint8Array(i.length);for(let c=0;c<i.length;c++)s[c]=i.charCodeAt(c);const r=new Blob([s],{type:a.mimeType}),o=URL.createObjectURL(r),l=document.createElement("a");l.href=o,l.download=a.filename??"export",l.click(),URL.revokeObjectURL(o)}}if(t.type=="CloseModal"&&this.closeModal(),t.type=="AddContentToHead"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.head.appendChild(this.createElement(t))}}if(t.type=="AddContentToBody"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.body.appendChild(this.createElement(t))}}}}ri([u()],ea.prototype,"id");ri([u()],ea.prototype,"baseUrl");var Er=Object.defineProperty,Ir=(e,t,a,i)=>{for(var s=void 0,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=o(t,a,s)||s);return s&&Er(t,a,s),s};class Mt extends ea{applyFragment(t){}manageActionRequestedEvent(t){}}Ir([u()],Mt.prototype,"component");const Tr={lon:0,lat:0},Da=3,Rr=e=>{if(!e)return;const t=e.split(",").map(s=>s.trim());if(t.length!==2)return;const a=Number(t[0]),i=Number(t[1]);if(!(t[0]===""||t[1]===""||!Number.isFinite(a)||!Number.isFinite(i)))return{lon:i,lat:a}},Pr=e=>{if(e==null||e.trim()==="")return Da;const t=Number(e);return Number.isFinite(t)?t:Da};var Or=Object.defineProperty,Lr=Object.getOwnPropertyDescriptor,ta=(e,t,a,i)=>{for(var s=i>1?void 0:i?Lr(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Or(t,a,s),s};let $t=class extends O{constructor(){super(...arguments),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){const e=++this.renderSeq,[{default:t},{default:a},{default:i},{default:s},{fromLonLat:r},{default:o}]=await Promise.all([ae(()=>import("./vendor-ol.js").then(c=>c.M),[]),ae(()=>import("./vendor-ol.js").then(c=>c.V),[]),ae(()=>import("./vendor-ol.js").then(c=>c.T),[]),ae(()=>import("./vendor-ol.js").then(c=>c.O),[]),ae(()=>import("./vendor-ol.js").then(c=>c.p),[]),ae(()=>import("./vendor-ol.js").then(c=>c.o),[])]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector("style[data-ol]")){const c=document.createElement("style");c.setAttribute("data-ol",""),c.textContent=o,this.shadowRoot.appendChild(c)}this.map&&(this.map.setTarget(void 0),this.map=void 0);const l=Rr(this.position)??Tr;this.map=new t({target:this.mapElement,layers:[new i({source:new s})],view:new a({center:r([l.lon,l.lat]),zoom:Pr(this.zoom)})})}render(){return n`<div id="map"></div>`}};$t.styles=R`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `;ta([u()],$t.prototype,"position",2);ta([u()],$t.prototype,"zoom",2);ta([Pe("#map")],$t.prototype,"mapElement",2);$t=ta([_("mateu-map")],$t);const Dr=typeof HTMLElement<"u"?HTMLElement:class{};class zr extends Dr{static get observedAttributes(){return["content"]}#e;#t=0;get content(){return this.#e}set content(t){this.#e=t,this.#a()}attributeChangedCallback(t,a,i){this.content=i??void 0}connectedCallback(){this.style.display="block",this.#a()}async#a(){if(!this.isConnected)return;const t=this.#e??"",a=++this.#t,[{marked:i},{default:s}]=await Promise.all([ae(()=>import("./vendor.js").then(r=>r.f),[]),ae(()=>import("./vendor.js").then(r=>r.c),[])]);a===this.#t&&(this.innerHTML=s.sanitize(await i.parse(t),{CUSTOM_ELEMENT_HANDLING:{tagNameCheck:r=>!0}}))}}typeof customElements<"u"&&!customElements.get("mateu-markdown")&&customElements.define("mateu-markdown",zr);var Ar=Object.defineProperty,Fr=Object.getOwnPropertyDescriptor,tt=(e,t,a,i)=>{for(var s=i>1?void 0:i?Fr(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Ar(t,a,s),s};const Nr=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},qr=(e,t)=>{let a=t;for(;a;){if(a===e)return!0;a=a.assignedSlot??a.parentNode??a.host??null}return!1};let Ie=class extends Mt{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.hoveredItem=null,this.onGridHoverMove=e=>{const t=e.currentTarget,a=t.getEventContext(e)?.item??null;a!==this.hoveredItem&&(this.hoveredItem=a,t.generateCellPartNames())},this.onGridHoverLeave=e=>{this.hoveredItem!==null&&(this.hoveredItem=null,e.currentTarget.generateCellPartNames())},this.hoverCellPartNameGenerator=(e,t)=>t?.item!=null&&t.item===this.hoveredItem?"hovered-cell":"",this._onRowKey=e=>{const t=this.field?.rowSelectionShortcut;if(!t||!this.field?.onItemSelectionActionId||!this._isRowShortcutRelevant()||!Za(t,e))return;const a=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!a)return;const i=this.currentItems(),s=parseInt(a[1],10)-1;s>=i.length||(e.preventDefault(),this.selectRow(i[s]))},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onRowKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._onRowKey)}currentItems(){return this.field?.remoteCoordinates?this.data?.[this.id]?.content??[]:this.field?.fieldId&&this.state?this.state[this.field.fieldId]??[]:[]}selectRow(e){!e||!this.field?.onItemSelectionActionId||(this.selectedItems=[e],this.state[this.id+"_selected_items"]=[e],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.field.onItemSelectionActionId,parameters:{_clickedRow:e}},bubbles:!0,composed:!0})))}_isRowShortcutRelevant(){if(this.offsetParent===null&&this.getClientRects().length===0)return!1;const e=Nr();if(e&&e!==document.body&&!qr(this,e)){const t=e.tagName?.toLowerCase()??"";if(e.isContentEditable||/^(input|textarea|select)$/.test(t)||t.startsWith("vaadin-")&&/(field|combo|picker|area|select)/.test(t))return!1}return!0}handleItemToggle(e){const{item:t,selected:a,shiftKey:i}=e.detail;if(this.rangeStartItem??=t,i){let s=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(s=this.state[this.field.fieldId]);const[r,o]=[this.rangeStartItem,t].map(h=>s.indexOf(h)).sort((h,p)=>h-p),l=s.slice(r,o+1),c=new Set(this.selectedItems);l.forEach(h=>{a?c.add(h):c.delete(h)}),this.selectedItems=[...c],this.state[this.id+"_selected_items"]=this.selectedItems}this.rangeStartItem=t}render(){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);const t=this.state[this.field?.fieldId+"_show_detail"]||this.state._show_detail&&this.state._show_detail[this.field.fieldId];if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates,i="";this.data[this.id]&&(this.data[this.id].searchSignature||i)&&this.data[this.id].searchSignature!=i&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements?e=this.data[this.id].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:i,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}if(Array.isArray(e)&&e.forEach((a,i)=>{a&&typeof a=="object"&&a._rowNumber===void 0&&(a._rowNumber=i)}),this.field?.inlineEditing)return this.renderMaster(e);if(this.field?.formPosition&&this.field?.formPosition.startsWith("modal")){const a=this;return n`

                ${this.renderMaster(e)}

                <vaadin-dialog
                        .opened="${t}"
                        @closed="${()=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.field?.fieldId+"_cancel"},bubbles:!0,composed:!0}))}}"
                        ${qt(()=>n`
                            <mateu-event-interceptor .target="${a}">
                                <div id="container" style="${this.field?.formStyle??"display: contents;"}">
                                    <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                                </div>
                            </mateu-event-interceptor>
                            `,[()=>G()])}
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
                    .cellPartNameGenerator="${T(this.field?.onItemSelectionActionId?this.hoverCellPartNameGenerator:void 0)}"
                    @mousemove="${T(this.field?.onItemSelectionActionId?this.onGridHoverMove:void 0)}"
                    @mouseleave="${T(this.field?.onItemSelectionActionId?this.onGridHoverLeave:void 0)}"
                    style="${this.field?.onItemSelectionActionId?"cursor: pointer;":""}${this.field?.style??""}"
                    class="${this.field?.cssClasses}"
                    .items="${e}"
                    .selectedItems="${t}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${a=>{this.selectedItems=a.detail.value,this.state[this.id+"_selected_items"]=this.selectedItems}}"
                    @item-toggle="${this.handleItemToggle}"
                    @click="${T(this.field?.onItemSelectionActionId?a=>{const s=a.currentTarget.getEventContext(a)?.item;s&&this.selectRow(s)}:void 0)}"
                    @active-item-changed="${T(this.field?.detailPath&&!this.field?.useButtonForDetail?a=>{if(this.field?.detailPath){const i=a.detail.value;i?this.detailsOpenedItems=[i]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${T(this.field?.detailPath?Ga(a=>n`${b(this,a[this.field?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    ?all-rows-visible=${e?.length<10}
            >
                <span slot="empty-state">${this.field?.label?`No ${this.field.label.toLowerCase()} added yet.`:"No items added yet."}</span>
                ${this.field?.readOnly||this.field?.inlineEditing?d:n`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.columns?.map(a=>ga(a,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}

                ${this.field?.inlineEditing&&!this.field?.readOnly?n`
                    <vaadin-grid-column width="3.5rem" flex-grow="0" frozen-to-end
                            ${Je(a=>n`
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
                            ${Je((a,{detailsOpened:i})=>n`
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
        </vaadin-vertical-layout>`}};Ie.styles=R`
        ${et}

        /* Clickable grids (a row-selection action is wired) give visual feedback: the host sets a
           pointer cursor (inline, inherited by the slotted cell content), and the cells of the
           hovered row — tagged "hovered-cell" by cellPartNameGenerator — get a subtle highlight. */
        vaadin-grid[clickable]::part(hovered-cell) {
            background-color: var(--lumo-primary-color-10pct);
            cursor: pointer;
        }
    `;tt([u()],Ie.prototype,"field",2);tt([u()],Ie.prototype,"state",2);tt([u()],Ie.prototype,"data",2);tt([u()],Ie.prototype,"appState",2);tt([u()],Ie.prototype,"appData",2);tt([u()],Ie.prototype,"selectedItems",2);tt([f()],Ie.prototype,"detailsOpenedItems",2);Ie=tt([_("mateu-grid")],Ie);var Ur=Object.defineProperty,Mr=Object.getOwnPropertyDescriptor,St=(e,t,a,i)=>{for(var s=i>1?void 0:i?Mr(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Ur(t,a,s),s};let Xe=class extends O{constructor(){super(...arguments),this.getNewValue=e=>{if(this.field?.dataType=="array"){if(!this.value)return[e];const t=this.value;return t.indexOf(e)>=0?t.filter(a=>a!==e):[...t,e]}return e}}render(){let e=this.field?.options;if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates;this.data?.[this.field.fieldId]&&this.data[this.field.fieldId].content&&this.data[this.field.fieldId].totalElements?e=this.data[this.field.fieldId].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:"",fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}const t=this.field?.attributes?.divStyle;return n`
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

       `}};Xe.styles=R`
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
  `;St([u()],Xe.prototype,"field",2);St([u()],Xe.prototype,"baseUrl",2);St([u()],Xe.prototype,"state",2);St([u()],Xe.prototype,"data",2);St([u()],Xe.prototype,"value",2);Xe=St([_("mateu-choice")],Xe);var Br=Object.defineProperty,jr=Object.getOwnPropertyDescriptor,Oe=(e,t,a,i)=>{for(var s=i>1?void 0:i?jr(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Br(t,a,s),s};let ne=class extends O{constructor(){super(...arguments),this.currencyChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),this.value.currency=e.detail.value,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}}))},this.valueChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),e.detail.value&&(this.value.value=e.detail.value?parseFloat(e.detail.value):0,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}})))}}render(){return n`
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
       `}};ne.styles=R`
  `;Oe([u()],ne.prototype,"fieldId",2);Oe([u()],ne.prototype,"label",2);Oe([u()],ne.prototype,"state",2);Oe([u()],ne.prototype,"data",2);Oe([u()],ne.prototype,"value",2);Oe([u()],ne.prototype,"autoFocus",2);Oe([u()],ne.prototype,"required",2);Oe([u()],ne.prototype,"colspan",2);Oe([u()],ne.prototype,"helperText",2);ne=Oe([_("mateu-money-field")],ne);const za=["vaadin:abacus","vaadin:absolute-position","vaadin:academy-cap","vaadin:accessibility","vaadin:accordion-menu","vaadin:add-dock","vaadin:adjust","vaadin:adobe-flash","vaadin:airplane","vaadin:alarm","vaadin:align-center","vaadin:align-justify","vaadin:align-left","vaadin:align-right","vaadin:alt-a","vaadin:alt","vaadin:ambulance","vaadin:anchor","vaadin:angle-double-down","vaadin:angle-double-left","vaadin:angle-double-right","vaadin:angle-double-up","vaadin:angle-down","vaadin:angle-left","vaadin:angle-right","vaadin:angle-up","vaadin:archive","vaadin:archives","vaadin:area-select","vaadin:arrow-backward","vaadin:arrow-circle-down-o","vaadin:arrow-circle-down","vaadin:arrow-circle-left-o","vaadin:arrow-circle-left","vaadin:arrow-circle-right-o","vaadin:arrow-circle-right","vaadin:arrow-circle-up-o","vaadin:arrow-circle-up","vaadin:arrow-down","vaadin:arrow-forward","vaadin:arrow-left","vaadin:arrow-long-down","vaadin:arrow-long-left","vaadin:arrow-right","vaadin:arrow-up","vaadin:arrows-cross","vaadin:arrows-long-h","vaadin:arrows-long-right","vaadin:arrows-long-up","vaadin:arrows-long-v","vaadin:arrows","vaadin:asterisk","vaadin:at","vaadin:automation","vaadin:backspace-a","vaadin:backspace","vaadin:backwards","vaadin:ban","vaadin:bar-chart-h","vaadin:bar-chart-v","vaadin:bar-chart","vaadin:barcode","vaadin:bed","vaadin:bell-o","vaadin:bell-slash-o","vaadin:bell-slash","vaadin:bell","vaadin:boat","vaadin:bold","vaadin:bolt","vaadin:bomb","vaadin:book-dollar","vaadin:book-percent","vaadin:book","vaadin:bookmark-o","vaadin:bookmark","vaadin:briefcase","vaadin:browser","vaadin:bug-o","vaadin:bug","vaadin:building-o","vaadin:building","vaadin:bullets","vaadin:bullseye","vaadin:bus","vaadin:buss","vaadin:button","vaadin:calc-book","vaadin:calc","vaadin:calendar-briefcase","vaadin:calendar-clock","vaadin:calendar-envelope","vaadin:calendar-o","vaadin:calendar-user","vaadin:calendar","vaadin:camera","vaadin:car","vaadin:caret-down","vaadin:caret-left","vaadin:caret-right","vaadin:caret-square-down-o","vaadin:caret-square-left-o","vaadin:caret-square-right-o","vaadin:caret-square-up-o","vaadin:caret-up","vaadin:cart-o","vaadin:cart","vaadin:cash","vaadin:chart-3d","vaadin:chart-grid","vaadin:chart-line","vaadin:chart-timeline","vaadin:chart","vaadin:chat","vaadin:check-circle-o","vaadin:check-circle","vaadin:check-square-o","vaadin:check-square","vaadin:check","vaadin:chevron-circle-down-o","vaadin:chevron-circle-down","vaadin:chevron-circle-left-o","vaadin:chevron-circle-left","vaadin:chevron-circle-right-o","vaadin:chevron-circle-right","vaadin:chevron-circle-up-o","vaadin:chevron-circle-up","vaadin:chevron-down-small","vaadin:chevron-down","vaadin:chevron-left-small","vaadin:chevron-left","vaadin:chevron-right-small","vaadin:chevron-right","vaadin:chevron-up-small","vaadin:chevron-up","vaadin:child","vaadin:circle-thin","vaadin:circle","vaadin:clipboard-check","vaadin:clipboard-cross","vaadin:clipboard-heart","vaadin:clipboard-pulse","vaadin:clipboard-text","vaadin:clipboard-user","vaadin:clipboard","vaadin:clock","vaadin:close-big","vaadin:close-circle-o","vaadin:close-circle","vaadin:close-small","vaadin:close","vaadin:cloud-download-o","vaadin:cloud-download","vaadin:cloud-o","vaadin:cloud-upload-o","vaadin:cloud-upload","vaadin:cloud","vaadin:cluster","vaadin:code","vaadin:coffee","vaadin:cog-o","vaadin:cog","vaadin:cogs","vaadin:coin-piles","vaadin:coins","vaadin:combobox","vaadin:comment-ellipsis-o","vaadin:comment-ellipsis","vaadin:comment-o","vaadin:comment","vaadin:comments-o","vaadin:comments","vaadin:compile","vaadin:compress-square","vaadin:compress","vaadin:connect-o","vaadin:connect","vaadin:controller","vaadin:copy-o","vaadin:copy","vaadin:copyright","vaadin:corner-lower-left","vaadin:corner-lower-right","vaadin:corner-upper-left","vaadin:corner-upper-right","vaadin:credit-card","vaadin:crop","vaadin:cross-cutlery","vaadin:crosshairs","vaadin:css","vaadin:ctrl-a","vaadin:ctrl","vaadin:cube","vaadin:cubes","vaadin:curly-brackets","vaadin:cursor-o","vaadin:cursor","vaadin:cutlery","vaadin:dashboard","vaadin:database","vaadin:date-input","vaadin:deindent","vaadin:del-a","vaadin:del","vaadin:dental-chair","vaadin:desktop","vaadin:diamond-o","vaadin:diamond","vaadin:diploma-scroll","vaadin:diploma","vaadin:disc","vaadin:doctor-briefcase","vaadin:doctor","vaadin:dollar","vaadin:dot-circle","vaadin:download-alt","vaadin:download","vaadin:drop","vaadin:edit","vaadin:eject","vaadin:elastic","vaadin:ellipsis-circle-o","vaadin:ellipsis-circle","vaadin:ellipsis-dots-h","vaadin:ellipsis-dots-v","vaadin:ellipsis-h","vaadin:ellipsis-v","vaadin:enter-arrow","vaadin:enter","vaadin:envelope-o","vaadin:envelope-open-o","vaadin:envelope-open","vaadin:envelope","vaadin:envelopes-o","vaadin:envelopes","vaadin:eraser","vaadin:esc-a","vaadin:esc","vaadin:euro","vaadin:exchange","vaadin:exclamation-circle-o","vaadin:exclamation-circle","vaadin:exclamation","vaadin:exit-o","vaadin:exit","vaadin:expand-full","vaadin:expand-square","vaadin:expand","vaadin:external-browser","vaadin:external-link","vaadin:eye-slash","vaadin:eye","vaadin:eyedropper","vaadin:facebook-square","vaadin:facebook","vaadin:factory","vaadin:family","vaadin:fast-backward","vaadin:fast-forward","vaadin:female","vaadin:file-add","vaadin:file-code","vaadin:file-font","vaadin:file-movie","vaadin:file-o","vaadin:file-picture","vaadin:file-presentation","vaadin:file-process","vaadin:file-refresh","vaadin:file-remove","vaadin:file-search","vaadin:file-sound","vaadin:file-start","vaadin:file-table","vaadin:file-text-o","vaadin:file-text","vaadin:file-tree-small","vaadin:file-tree-sub","vaadin:file-tree","vaadin:file-zip","vaadin:file","vaadin:fill","vaadin:film","vaadin:filter","vaadin:fire","vaadin:flag-checkered","vaadin:flag-o","vaadin:flag","vaadin:flash","vaadin:flask","vaadin:flight-landing","vaadin:flight-takeoff","vaadin:flip-h","vaadin:flip-v","vaadin:folder-add","vaadin:folder-o","vaadin:folder-open-o","vaadin:folder-open","vaadin:folder-remove","vaadin:folder-search","vaadin:folder","vaadin:font","vaadin:form","vaadin:forward","vaadin:frown-o","vaadin:funcion","vaadin:function","vaadin:funnel","vaadin:gamepad","vaadin:gavel","vaadin:gift","vaadin:glass","vaadin:glasses","vaadin:globe-wire","vaadin:globe","vaadin:golf","vaadin:google-plus-square","vaadin:google-plus","vaadin:grab","vaadin:grid-bevel","vaadin:grid-big-o","vaadin:grid-big","vaadin:grid-h","vaadin:grid-small-o","vaadin:grid-small","vaadin:grid-v","vaadin:grid","vaadin:group","vaadin:hammer","vaadin:hand","vaadin:handle-corner","vaadin:hands-up","vaadin:handshake","vaadin:harddrive-o","vaadin:harddrive","vaadin:hash","vaadin:header","vaadin:headphones","vaadin:headset","vaadin:health-card","vaadin:heart-o","vaadin:heart","vaadin:home-o","vaadin:home","vaadin:hospital","vaadin:hourglass-empty","vaadin:hourglass-end","vaadin:hourglass-start","vaadin:hourglass","vaadin:inbox","vaadin:indent","vaadin:info-circle-o","vaadin:info-circle","vaadin:info","vaadin:input","vaadin:insert","vaadin:institution","vaadin:invoice","vaadin:italic","vaadin:key-o","vaadin:key","vaadin:keyboard-o","vaadin:keyboard","vaadin:laptop","vaadin:layout","vaadin:level-down-bold","vaadin:level-down","vaadin:level-left-bold","vaadin:level-left","vaadin:level-right-bold","vaadin:level-right","vaadin:level-up-bold","vaadin:level-up","vaadin:lifebuoy","vaadin:lightbulb","vaadin:line-bar-chart","vaadin:line-chart","vaadin:line-h","vaadin:line-v","vaadin:lines-list","vaadin:lines","vaadin:link","vaadin:list-ol","vaadin:list-select","vaadin:list-ul","vaadin:list","vaadin:location-arrow-circle-o","vaadin:location-arrow-circle","vaadin:location-arrow","vaadin:lock","vaadin:magic","vaadin:magnet","vaadin:mailbox","vaadin:male","vaadin:map-marker","vaadin:margin-bottom","vaadin:margin-left","vaadin:margin-right","vaadin:margin-top","vaadin:margin","vaadin:medal","vaadin:megafone","vaadin:megaphone","vaadin:meh-o","vaadin:menu","vaadin:microphone","vaadin:minus-circle-o","vaadin:minus-circle","vaadin:minus-square-o","vaadin:minus","vaadin:mobile-browser","vaadin:mobile-retro","vaadin:mobile","vaadin:modal-list","vaadin:modal","vaadin:money-deposit","vaadin:money-exchange","vaadin:money-withdraw","vaadin:money","vaadin:moon-o","vaadin:moon","vaadin:morning","vaadin:movie","vaadin:music","vaadin:mute","vaadin:native-button","vaadin:newspaper","vaadin:notebook","vaadin:nurse","vaadin:office","vaadin:open-book","vaadin:option-a","vaadin:option","vaadin:options","vaadin:orientation","vaadin:out","vaadin:outbox","vaadin:package","vaadin:padding-bottom","vaadin:padding-left","vaadin:padding-right","vaadin:padding-top","vaadin:padding","vaadin:paint-roll","vaadin:paintbrush","vaadin:palete","vaadin:palette","vaadin:panel","vaadin:paperclip","vaadin:paperplane-o","vaadin:paperplane","vaadin:paragraph","vaadin:password","vaadin:paste","vaadin:pause","vaadin:pencil","vaadin:phone-landline","vaadin:phone","vaadin:picture","vaadin:pie-bar-chart","vaadin:pie-chart","vaadin:piggy-bank-coin","vaadin:piggy-bank","vaadin:pill","vaadin:pills","vaadin:pin-post","vaadin:pin","vaadin:play-circle-o","vaadin:play-circle","vaadin:play","vaadin:plug","vaadin:plus-circle-o","vaadin:plus-circle","vaadin:plus-minus","vaadin:plus-square-o","vaadin:plus","vaadin:pointer","vaadin:power-off","vaadin:presentation","vaadin:print","vaadin:progressbar","vaadin:puzzle-piece","vaadin:pyramid-chart","vaadin:qrcode","vaadin:question-circle-o","vaadin:question-circle","vaadin:question","vaadin:quote-left","vaadin:quote-right","vaadin:random","vaadin:raster-lower-left","vaadin:raster","vaadin:records","vaadin:recycle","vaadin:refresh","vaadin:reply-all","vaadin:reply","vaadin:resize-h","vaadin:resize-v","vaadin:retweet","vaadin:rhombus","vaadin:road-branch","vaadin:road-branches","vaadin:road-split","vaadin:road","vaadin:rocket","vaadin:rotate-left","vaadin:rotate-right","vaadin:rss-square","vaadin:rss","vaadin:safe-lock","vaadin:safe","vaadin:scale-unbalance","vaadin:scale","vaadin:scatter-chart","vaadin:scissors","vaadin:screwdriver","vaadin:search-minus","vaadin:search-plus","vaadin:search","vaadin:select","vaadin:server","vaadin:share-square","vaadin:share","vaadin:shield","vaadin:shift-arrow","vaadin:shift","vaadin:shop","vaadin:sign-in-alt","vaadin:sign-in","vaadin:sign-out-alt","vaadin:sign-out","vaadin:signal","vaadin:sitemap","vaadin:slider","vaadin:sliders","vaadin:smiley-o","vaadin:sort","vaadin:sound-disable","vaadin:spark-line","vaadin:specialist","vaadin:spinner-arc","vaadin:spinner-third","vaadin:spinner","vaadin:spline-area-chart","vaadin:spline-chart","vaadin:split-h","vaadin:split-v","vaadin:split","vaadin:spoon","vaadin:square-shadow","vaadin:star-half-left-o","vaadin:star-half-left","vaadin:star-half-right-o","vaadin:star-half-right","vaadin:star-o","vaadin:star","vaadin:start-cog","vaadin:step-backward","vaadin:step-forward","vaadin:stethoscope","vaadin:stock","vaadin:stop-cog","vaadin:stop","vaadin:stopwatch","vaadin:storage","vaadin:strikethrough","vaadin:subscript","vaadin:suitcase","vaadin:sun-down","vaadin:sun-o","vaadin:sun-rise","vaadin:superscript","vaadin:sword","vaadin:tab-a","vaadin:tab","vaadin:table","vaadin:tablet","vaadin:tabs","vaadin:tag","vaadin:tags","vaadin:tasks","vaadin:taxi","vaadin:teeth","vaadin:terminal","vaadin:text-height","vaadin:text-input","vaadin:text-label","vaadin:text-width","vaadin:thin-square","vaadin:thumbs-down-o","vaadin:thumbs-down","vaadin:thumbs-up-o","vaadin:thumbs-up","vaadin:ticket","vaadin:time-backward","vaadin:time-forward","vaadin:timer","vaadin:toolbox","vaadin:tools","vaadin:tooth","vaadin:touch","vaadin:train","vaadin:trash","vaadin:tree-table","vaadin:trendind-down","vaadin:trending-down","vaadin:trending-up","vaadin:trophy","vaadin:truck","vaadin:twin-col-select","vaadin:twitter-square","vaadin:twitter","vaadin:umbrella","vaadin:underline","vaadin:unlink","vaadin:unlock","vaadin:upload-alt","vaadin:upload","vaadin:user-card","vaadin:user-check","vaadin:user-clock","vaadin:user-heart","vaadin:user-star","vaadin:user","vaadin:users","vaadin:vaadin-h","vaadin:vaadin-v","vaadin:viewport","vaadin:vimeo-square","vaadin:vimeo","vaadin:volume-down","vaadin:volume-off","vaadin:volume-up","vaadin:volume","vaadin:wallet","vaadin:warning","vaadin:workplace","vaadin:wrench","vaadin:youtube-square","vaadin:youtube"];var Wr=Object.defineProperty,Vr=Object.getOwnPropertyDescriptor,de=(e,t,a,i)=>{for(var s=i>1?void 0:i?Vr(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Wr(t,a,s),s};let X=class extends O{constructor(){super(...arguments),this.component=void 0,this.field=void 0,this.baseUrl=void 0,this.state={},this.data={},this.appState={},this.appData={},this.colorPickerOpened=!1,this.colorPickerValue=void 0,this.comboData=[],this._comboFilter="",this.rendered=!1,this.renderColorPicker=()=>{const e=this.field?.fieldId,t=this.state&&e in this.state?this.state[e]:this.field?.initialValue;return n`
            <ui5-color-picker value="${t}" @change="${a=>this.colorPickerValue=a.target.value}">Picker</ui5-color-picker>
        `},this.saveColor=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.colorPickerValue,fieldId:this.field.fieldId},bubbles:!0,composed:!0})),this.colorPickerOpened=!1},this.renderColorPickerFooter=()=>n`<vaadin-button @click="${()=>this.colorPickerOpened=!1}">Cancel</vaadin-button>
        <vaadin-button theme="primary" @click="${this.saveColor}">Save</vaadin-button>`,this.checked=e=>{const t=e.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.checked,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))},this.convert=e=>this.field?.dataType=="integer"?parseInt(e):e,this.multiComboBoxValueChanged=e=>{if(this.rendered){const t=this.field?.fieldId,a=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let i;e.detail.value&&(i=e.detail.value.map(s=>s.value),i&&i.length>0&&(this.data[this.id]||(this.data[this.id]={}),this.data[this.id].content||(this.data[this.id].content=[]),this.data[this.id]&&this.data[this.id].content&&e.detail.value.forEach(s=>{this.data[this.id].content?.find(r=>s.value==r.value)||this.data[this.id].content.push(s)}))),this.compareArrays(i,a)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.valueChanged=e=>{this.rendered&&e.detail.value!==void 0&&e.detail.value!=this.state[this.field.fieldId]&&this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.convert(e.detail.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.selectedItems=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.comboData&&this.comboData.length>0)return this.comboData?.filter(t=>e.indexOf(t.value)>=0);if(this.data[this.id]&&this.data[this.id].content&&this.data[this.id].content.length>0)return this.data[this.id].content.filter(t=>e.indexOf(t.value)>=0)}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0);return[]},this.selectedIndex=e=>{if(e)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const t=this.data[this.id].content.find(a=>a.value==e);if(t)return this.data[this.id].content.indexOf(t)}}else{const t=this.field?.options?.find(a=>a.value==e);if(t)return this.field?.options?.indexOf(t)}},this.selectedIndexes=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content)return this.data[this.id].content.filter(a=>e.indexOf(a.value)>=0).map(a=>this.data[this.id].content.indexOf(a))}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0).map(t=>this.field?.options?.indexOf(t));return[]},this.compareArrays=(e,t)=>this.falsy(e)&&this.falsy(t)||e&&t&&e.length===t.length&&e.every((a,i)=>a===t[i]),this.falsy=e=>!e||e.length==0,this.listItemsSelected=e=>{const t=this.field?.fieldId,a=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let i;this.rendered&&(e.detail.value&&(this.field?.remoteCoordinates?this.data[this.id]&&this.data[this.id].content&&(i=e.detail.value.map(s=>this.data[this.id].content[s].value)):i=e.detail.value.map(s=>this.field.options[s].value)),this.compareArrays(i,a)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))},this.listItemSelected=e=>{let t;if(e.detail.value||e.detail.value==0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const a=this.data[this.id].content[e.detail.value];a&&(t=a.value)}}else{const a=this.field.options[e.detail.value];a&&(t=a.value)}this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.mapPosition=e=>{switch(e){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.fileUploaded=e=>{const t=this.field?.fieldId??"",a=this.state[t];a.push({id:e.detail.xhr.responseText,name:e.detail.file.name}),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.fileChanged=e=>{const t=this.field?.fieldId??"",a=(e.detail.value??[]).filter(s=>s.id).map(s=>s.id),i=(this.state[t]??[]).map(s=>s.id);if(!this.compareArrays(i,a)){const s=(e.detail.value??[]).filter(r=>r.id).map(r=>({id:r.id,name:r.name}));this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.triggerImageUpload=()=>{this.renderRoot?.querySelector('input[type="file"]')?.click()},this.imageUpload=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const i=new FileReader;i.onload=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i.result,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},i.readAsDataURL(a),t.value=""},this.imageDelete=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:"",fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.iconComboboxRenderer=e=>n`
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
`,this.filteredIcons=[],this.iconFilterChanged=e=>{this.filteredIcons=za.filter(t=>!e.detail.value||t.indexOf(e.detail.value)>=0)}}remoteComboDataProvider(e){return(t,a)=>{const{filter:i,page:s,pageSize:r}=t,o=i??"";this._comboFilter=o,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{searchText:i,fieldId:this.field?.fieldId,size:r,page:s,sort:void 0},callback:l=>{if(o===this._comboFilter)if(l?.messages?.forEach(c=>{Ut.show(c.text,{position:c.position?this.mapPosition(c.position):void 0,theme:c.variant,duration:c.duration})}),!l.fragments||l.fragments.length==0)this.comboData=[],a([],0);else{const c=l.fragments[0].data?.[this.id];this.comboData=c?.content,a(c?.content,c?.totalElements)}},callbackonly:!0},bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.rendered=!1}render(){const e=this.field?.fieldId??"";return this.rendered=!0,n`<div style="display: block;">
            <div>${this.renderField()}</div>
            ${this.field?.description?n`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${dt(this.field?.description,this.state,this.data)}</div>
            `:d}
            ${this.data.errors&&this.data.errors[e]&&this.data.errors[e].length>0?n`
                <div><ul>${this.data.errors[e].map(t=>n`<li>${t}</li>`)}</ul></div>
            `:d}
        </div>`}async firstUpdated(){this.filteredIcons=za}update(e){e.has("component")&&(this.rendered=!1),super.update(e)}renderField(){const e=this.field?.fieldId??"",t=this.state&&e in this.state?this.state[e]:this.field?.initialValue,a=this.field?.label+"",i=Ne(a,this.state,this.data),s=this.labelAlreadyRendered||!i||i=="null"?d:i;return this.field?.stereotype=="badge"?this.renderBadgeField(e,t,s,i):this.field?.stereotype=="plainText"?this.renderPlainTextField(e,t,s,i):this.field?.readOnly&&this.field.stereotype!="grid"&&this.field.dataType!="status"&&this.field?.dataType!="money"?this.renderReadOnlyField(e,t,s,i):this.field?.dataType=="file"?this.renderFileField(e,t,s,i):this.field?.dataType=="string"?this.renderStringField(e,t,s,i):this.field?.dataType=="number"?this.renderNumberField(e,t,s,i):this.field?.dataType=="integer"?this.renderIntegerField(e,t,s,i):this.field?.dataType=="bool"?this.renderBoolField(e,t,s,i):this.field?.dataType=="dateRange"?this.renderDateRangeField(e,t,s,i):this.field?.dataType=="date"?this.renderDateField(e,t,s,i):this.field?.dataType=="dateTime"?this.renderDateTimeField(e,t,s,i):this.field?.dataType=="time"?this.renderTimeField(e,t,s,i):this.field?.dataType=="array"?this.renderArrayField(e,t,s,i):this.field?.dataType=="money"?this.renderMoneyField(e,t,s,i):this.field?.dataType=="status"?this.renderStatusField(e,t,s,i):this.field?.dataType=="range"?this.renderRangeField(e,t,s,i):n`<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`}renderBadgeField(e,t,a,i){if(!this.field)return n``;const s=t===!0||t==="true";return n`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><span theme="badge ${s?"success":""} pill" style="${s?"":"opacity: 0.4;"}">${i}</span>
            </vaadin-custom-field>`}renderPlainTextField(e,t,a,i){if(!this.field)return n``;let s=dt(t,this.state,this.data);const r=s&&typeof s=="object"&&"value"in s?s:null;s&&s.value&&(s=s.value);const o=this.field?.dataType=="bool"||s===!0||s===!1,l=this.field?.dataType=="money",c=s!=null&&s!=="";let h=c?String(s):"—";if(l&&c){const v=typeof s=="number"?s:parseFloat(String(s));isNaN(v)||(h=r&&r.locale&&r.currency?new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(v):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v))}const p=o?n`<vaadin-icon icon="${s===!0||s==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:this.field?.multiline?n`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${h}</span>`:n`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${l?" font-variant-numeric: tabular-nums;":""}">${h}</span>`;return n`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    data-colspan="${this.field?.colspan}"
                    style="${l?"text-align: right; ":""}${this.field?.style}"
            >${p}</vaadin-custom-field>`}renderReadOnlyField(e,t,a,i){if(!this.field)return n``;let s=dt(t,this.state,this.data)||this.data[e];if(s&&s.value&&(s=s.value),this.field.stereotype=="image"||this.field.stereotype=="uploadableImage")return n`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.field.description}"
                        data-colspan="${this.field.colspan}"
                ><img src="${s}" id="${this.field.fieldId}_img" style="${this.field.style}">
                </vaadin-custom-field>`;if(this.field.dataType=="bool")return n`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.field.description}"
                        data-colspan="${this.field.colspan}"
                ><vaadin-icon icon="${s?"vaadin:check":"vaadin:minus"}" style="height: 20px;"></vaadin-icon>
                </vaadin-custom-field>`;const r=s!=null?String(s):"";return n`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        value="${s}"
                        readonly
                        style="${this.field.style}"
                        .helperText="${this.field.description??""}"
                        data-colspan="${this.field.colspan}"
                >${r.length>15?n`<vaadin-icon
                        slot="suffix"
                        icon="vaadin:copy"
                        title="Copiar"
                        style="cursor: pointer; color: var(--lumo-secondary-text-color);"
                        @click="${()=>navigator.clipboard.writeText(r).catch(()=>{})}"
                ></vaadin-icon>`:d}</vaadin-text-field>
`}renderFileField(e,t,a,i){if(!this.field)return n``;const s=t?.map(r=>({id:r.id,name:r.name,type:"",uploadTarget:"",complete:!0}))??[];return n`
                <vaadin-custom-field
                        label="${a}"
                        .helperText="${this.field.description}"
                        data-colspan="${this.field.colspan}"
                >
                    <vaadin-upload
                            target="/upload"
                            .files="${s}"
                            @upload-success="${this.fileUploaded}"
                            @files-changed="${this.fileChanged}"
                    ></vaadin-upload>
                </vaadin-custom-field>
            `}renderStringField(e,t,a,i){if(!this.field)return n``;if(this.field?.stereotype=="searchable"){const s=o=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"code-"+this.field?.fieldId,parameters:{code:o.currentTarget.value}},bubbles:!0,composed:!0}))},r=o=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"codesearch-"+this.field?.fieldId,parameters:{}},bubbles:!0,composed:!0}))};return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            required="${this.field.required||d}"
                            .helperText="${this.field.description}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-horizontal-layout theme="spacing" style="--lumo-space-m: 0.33rem;">
                            <vaadin-text-field style="width: 4rem;" @change="${s}" value="${t}"></vaadin-text-field>
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
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            .value="${l}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                    `}let s=t;return t&&t.value&&(s=t.value),n`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${a}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            .value="${s}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                `}if(this.field?.stereotype=="markdown")return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            required="${this.field.required||d}"
                            .helperText="${this.field.description}"
                            data-colspan="${this.field.colspan}"
                    ><vaadin-markdown
                            .content="${t}"
                    ></vaadin-markdown>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates;let r;this.data[this.id]&&this.data[this.id].content&&(r=this.data[this.id].content.find(l=>l.value==t)),!r&&this.comboData&&(r=this.comboData.find(l=>l.value==t)),!r&&t&&(r={value:t,label:this.data[this.id+"-label"]??t});const o=this.remoteComboDataProvider(s.action);return n`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${a}"
                            item-label-path="label"
                            item-id-path="value"
                            .dataProvider="${o}"
                            .selectedItem="${r}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            @keyup="${l=>{if(l.key=="Backspace"){const c=l.currentTarget;c.inputElement.value||(c.value="")}}}"
                            ${la(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}return n`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${a}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            ${la(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),n`
                        <vaadin-custom-field
                                label="${a}"
                                .helperText="${this.field.description}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${T(this.selectedIndex(t))}"
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
                            .helperText="${this.field.description}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${T(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(s=>n`
                            <vaadin-item>${s.description||s.image||s.icon?n`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${s.icon?n`
                                        <vaadin-icon icon="${s.icon}"></vaadin-icon>
                                    `:d}
                                    ${s.image?n`
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
                `}if(this.field?.stereotype=="radio"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),n`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${a}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            .helperText="${this.field.description}"
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
                            .helperText="${this.field.description}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(s=>n`
                            <vaadin-radio-button value="${s.value}" label="${s.label}">
                                ${s.description||s.image||s.icon?n`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${s.icon?n`
                                                <vaadin-icon icon="${s.icon}"></vaadin-icon>
                                            `:d}
                                            ${s.image?n`
                                                <img src="${s.image}" alt="${s.label}" style="height: 1rem;" />
                                            `:d}
                                            <span>${s.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${s.description?n`
                                            <div>${s.description}</div>
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
                            ${fa(()=>n`
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
                            .helperText="${this.field.description}"
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
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-rich-text-editor
                            .maxlength="${this.field.charLimit}"
                            .value="${t}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                    ></vaadin-rich-text-editor>
                    </vaadin-custom-field>`;if(this.field?.stereotype=="textarea")return n`
                    <vaadin-text-area
                            id="${this.field.fieldId}"
                            label="${a}"
                            .maxlength="${this.field.charLimit}"
                            .value="${t}"
                            .helperText="${this.field.description}"
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
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-email-field>
                `;if(this.field?.stereotype=="link")return this.field.readOnly?n`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            data-colspan="${this.field.colspan}"
                    ><a href="${t}">${t}</a></vaadin-custom-field>`:n`
                            <vaadin-text-field
                                    id="${this.field.fieldId}"
                                    label="${a}"
                                    required="${this.field.required||d}"
                                    @value-changed="${this.valueChanged}"
                                    value="${t}"
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
                                    ?autofocus="${this.field.wantsFocus}"
                                    data-colspan="${this.field.colspan}"
                            item-label-path="displayName"
                            style="--vaadin-combo-box-overlay-width: 16em"
                                    .filteredItems="${this.filteredIcons}"
                            @filter-changed="${this.iconFilterChanged}"
                            ${la(this.iconComboboxRenderer,[])}
                    >
                        ${t?n`<vaadin-icon slot="prefix" icon="${t}"></vaadin-icon>`:d}
                    </vaadin-combo-box>
                `;if(this.field?.stereotype=="password")return n`
                    <vaadin-password-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            @value-changed="${this.valueChanged}"
                            value="${t}"
                            .helperText="${this.field.description}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-password-field>
                `;if(this.field?.stereotype=="html")return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            data-colspan="${this.field.colspan}"
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${be(""+t)}</div></vaadin-custom-field>
                `;if(this.field?.stereotype=="image")return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            data-colspan="${this.field.colspan}"
                    ><img
                            src="${t}"
                            style="${this.component?.style}" class="${this.component?.cssClasses}"></vaadin-custom-field>
                `;if(this.field?.stereotype=="uploadableImage"){const s=t!=null&&t!=="";return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.field.description}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-vertical-layout style="align-items: stretch; gap: var(--lumo-space-s); max-width: 320px;">
                            ${s?n`<img
                                    src="${t}"
                                    style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid var(--lumo-contrast-20pct); border-radius: var(--lumo-border-radius-m); ${this.field.style??""}"
                                    class="${this.component?.cssClasses}">`:n`<div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--lumo-contrast-30pct); border-radius: var(--lumo-border-radius-m); color: var(--lumo-secondary-text-color);">
                                    <vaadin-icon icon="vaadin:picture" style="height: 2rem; width: 2rem;"></vaadin-icon>
                                </div>`}
                            <input type="file" accept="image/*" style="display: none;" @change="${this.imageUpload}">
                            <vaadin-horizontal-layout theme="spacing" style="justify-content: flex-start;">
                                <vaadin-button @click="${this.triggerImageUpload}">
                                    <vaadin-icon icon="vaadin:upload" slot="prefix"></vaadin-icon>
                                    ${s?"Replace":"Upload"}
                                </vaadin-button>
                                ${s?n`<vaadin-button theme="error tertiary" @click="${this.imageDelete}">
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
                            data-colspan="${this.field.colspan}"
                    ><span style="background-color: ${t}; display: block; height: 20px; width: 40px; margin-top: 5px; margin-bottom: 24px; border: 1px solid var(--lumo-secondary-text-color)"></vaadin-custom-field>
                `:n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
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
  ${qt(this.renderColorPicker,[])}
  ${Qt(this.renderColorPickerFooter,[])}
></vaadin-dialog>
                `:n`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.field.description}"
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
                        .helperText="${this.field.description}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step||d}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min!=null?this.field.min:d}"
                        max="${this.field.max!=null?this.field.max:d}"
            ></vaadin-number-field>`:n``}renderIntegerField(e,t,a,i){if(!this.field)return n``;if(this.field.stereotype=="stars"){let s=t;isNaN(s)&&(s=0);const r=[1,2,3,4,5];return n`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            data-colspan="${this.field.colspan}"
                    >${r.map(o=>n`
                    <vaadin-icon 
                            icon="vaadin:star" 
                            style="cursor: pointer; color: var(${o<=s?"--lumo-warning-color":"--lumo-shade-30pct"});"
                            @click="${()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:o,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}"
                    
                    ></vaadin-icon>
                `)}</vaadin-custom-field>`}if(this.field.stereotype=="slider"){let s=t;return isNaN(s)&&(s=0),n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            data-colspan="${this.field.colspan}"
                    ><input type="range" @input="${r=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}" min="${this.field.sliderMin??0}" max="${this.field.sliderMax??10}" value="${s??0}"/></vaadin-custom-field>
                `}return n`
                <vaadin-integer-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.field.description}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step||d}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min!=null?this.field.min:d}"
                        max="${this.field.max!=null?this.field.max:d}"
                ></vaadin-integer-field>
            `}renderBoolField(e,t,a,i){return this.field?n`
                <vaadin-custom-field
                        label="${a}"
                        .helperText="${this.field.description}"
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
            `:n``}renderDateRangeField(e,t,a,i){if(!this.field)return n``;const s=t?t.from+";"+t.to:void 0;return n`<vcf-date-range-picker
                    id="${this.field.fieldId}"
                    label="${a}"
                    @value-changed="${r=>{r.detail.value&&(r.detail.value={from:r.detail.value.split(";")[0],to:r.detail.value.split(";")[1]}),this.valueChanged(r)}}"
                    value="${s}"
                    ?autofocus="${this.field.wantsFocus}"
                    ?required="${this.field.required||d}"
                    data-colspan="${this.field.colspan}"
            ></vcf-date-range-picker>`}renderDateField(e,t,a,i){return this.field?n`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.field.description}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-picker>`:n``}renderDateTimeField(e,t,a,i){return this.field?n`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.field.description}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-time-picker>`:n``}renderTimeField(e,t,a,i){return this.field?n`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.field.description}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-time-picker>`:n``}renderArrayField(e,t,a,i){if(!this.field)return n``;if(this.field?.stereotype=="choice")return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.field.description}"
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
`;if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),n`
                        <vaadin-custom-field
                                label="${a}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box multiple
                                     .selectedValues="${T(this.selectedIndexes(t))}"
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
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box multiple 
                                     .selectedValues="${T(this.selectedIndexes(t))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                                     data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(s=>n`
                            <vaadin-item>${s.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r=this.remoteComboDataProvider(s.action);return n`
                        <vaadin-multi-select-combo-box
                            label="${a}"
                            item-label-path="label"
                            item-id-path="value"
                            item-value-path="value"
                            .dataProvider="${r}"
                            .helperText="${this.field.description}"
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
                            .helperText="${this.field.description}"
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
                    `}if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.rendered||setTimeout(()=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}),n`
                    <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${a}"
                        theme="vertical"
                        @value-changed="${this.valueChanged}"
                        .helperText="${this.field.description}"
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
                        .helperText="${this.field.description}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                        class="mateu-checkbox-group-${this.field.optionsColumns>1?"multi-column":""}"
                        .value="${t}"
                >
                        ${this.field.options?.map(s=>n`
                        <vaadin-checkbox 
                                value="${s.value}" 
                                label="${s.label}"
                        ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
            `}renderMoneyField(e,t,a,i){if(!this.field)return n``;if(this.field.readOnly){const s=t;let r=s;return s&&s.locale&&s.currency?r=new Intl.NumberFormat(s.locale,{style:"currency",currency:s.currency}).format(s.value):r=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(s),n`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.field.description}"
                        data-colspan="${this.field.colspan}"
                ><div style="width: 186px; text-align: right;">${r}</div></vaadin-custom-field>`}return n`<mateu-money-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        .value="${t}"
                        .helperText="${this.field.description}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></mateu-money-field>`}renderStatusField(e,t,a,i){if(!this.field)return n``;const s=t;return n`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                >
                    ${s?n`<span theme="badge pill ${Zt(s.type)}">${s.message}</span>`:n``}                    
                </vaadin-custom-field>
            `}renderRangeField(e,t,a,i){if(!this.field)return n``;const s=t;return n`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        data-colspan="${this.field.colspan}"
                ><ui5-range-slider start-value="${s?.from??0}" end-value="${s?.to??0}" 
                                   min="${this.field.sliderMin??0}" 
                                   max="${this.field.sliderMax??10}"
                                   step="${this.field.step||d}"
                                   @change="${r=>{const o=r.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{from:o.startValue,to:o.endValue},fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"
                                   style="min-width: 10rem;"
                ></ui5-range-slider></vaadin-custom-field>
            `}};X.styles=R`
        ${et}

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
  `;de([u()],X.prototype,"component",2);de([u()],X.prototype,"field",2);de([u()],X.prototype,"baseUrl",2);de([u()],X.prototype,"state",2);de([u()],X.prototype,"data",2);de([u()],X.prototype,"appState",2);de([u()],X.prototype,"appData",2);de([u()],X.prototype,"labelAlreadyRendered",2);de([f()],X.prototype,"colorPickerOpened",2);de([f()],X.prototype,"colorPickerValue",2);de([f()],X.prototype,"filteredIcons",2);X=de([_("mateu-field")],X);var Hr=Object.defineProperty,Gr=Object.getOwnPropertyDescriptor,mt=(e,t,a,i)=>{for(var s=i>1?void 0:i?Gr(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Hr(t,a,s),s};const Kr=e=>{const t=[];return e.color&&e.color!=="normal"&&e.color!=="none"&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle==="tertiaryInline"?"tertiary-inline":e.buttonStyle),e.size&&e.size!=="none"&&e.size!=="normal"&&t.push(e.size),t.length?t.join(" "):void 0},Aa=e=>e==="back"||e==="backToList"||!!e&&e.startsWith("cancel");let Fe=class extends O{constructor(){super(...arguments),this.appState={},this.appData={},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.evalLabel=e=>Ne(e,this.state,this.data),this.renderBtn=e=>{if((this.data??{})[e.actionId+".hidden"])return d;const t=this.evalLabel(e.label);return n`
        <vaadin-button
                data-action-id="${e.id}"
                theme="${Kr(e)||d}"
                @click="${()=>this.handleButtonClick(e.actionId)}"
                ?disabled="${e.disabled}"
        >${e.iconOnLeft?n`<vaadin-icon icon="${e.iconOnLeft}"></vaadin-icon>`:d}${t}${e.iconOnRight?n`<vaadin-icon icon="${e.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>
    `}}render(){const e=this.metadata;if(!e)return n``;const t=e.toolbar??[],a=t.filter(l=>Aa(l.actionId)),i=t.filter(l=>!Aa(l.actionId)),s=a.length>0&&i.length>0?n`<span class="toolbar-divider"></span>`:d,r=e.avatar||e.title||e.subtitle||e.kpis?.length>0||e.header?.length>0||t.length>0,o=e.level??0;return o>0?this.setAttribute("data-nested",""):this.removeAttribute("data-nested"),n`
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
                    ${e?.header?.map(l=>b(this,l,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${a.map(this.renderBtn)}
                    ${s}
                    ${i.map(this.renderBtn)}
                </vaadin-horizontal-layout>
            `:r?n`
                <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: center;" class="form-header">
                    ${e.avatar?b(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):d}
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        ${e?.title&&o==0?n`<h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${be(ot(e?.title,this.state??{},this.data??{}))}</h2>`:d}
                        ${e?.title&&o==1?n`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${be(ot(e?.title,this.state??{},this.data??{}))}</h3>`:d}
                        ${e?.title&&o==2?n`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${be(ot(e?.title,this.state??{},this.data??{}))}</h4>`:d}
                        ${e?.title&&o==3?n`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${be(ot(e?.title,this.state??{},this.data??{}))}</h5>`:d}
                        ${e?.title&&o>3?n`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${be(ot(e?.title,this.state??{},this.data??{}))}</h6>`:d}

                        ${e?.subtitle?n`<span style="display: inline-block; margin-block-end: 0.83em;">${be(ot(e?.subtitle,this.state??{},this.data??{}))}</span>`:d}
                    </div>
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        ${e?.kpis?.map(l=>n`
                            <vaadin-vertical-layout style="align-items: center">
                                <div>${this.evalLabel(l.title)}</div>
                                <div>${be(ot(l.text,this.state??{},this.data??{}))}</div>
                            </vaadin-vertical-layout>
                        `)}
                        ${e?.header?.map(l=>b(this,l,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${a.map(this.renderBtn)}
                        ${s}
                        ${i.map(this.renderBtn)}
                    </vaadin-horizontal-layout>
                </vaadin-horizontal-layout>
            `:d}
            ${e.badges&&e.badges.length>0?n`
                <vaadin-horizontal-layout style="padding-bottom: var(--lumo-space-s);">
                    ${e.badges.map(l=>_s(l,this.state??{},this.data??{}))}
                </vaadin-horizontal-layout>
            `:d}
        `}};Fe.styles=R`
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

        ${et}
    `;mt([u()],Fe.prototype,"metadata",2);mt([u()],Fe.prototype,"baseUrl",2);mt([u()],Fe.prototype,"state",2);mt([u()],Fe.prototype,"data",2);mt([u()],Fe.prototype,"appState",2);mt([u()],Fe.prototype,"appData",2);Fe=mt([_("mateu-content-header")],Fe);var Jr=Object.defineProperty,Yr=Object.getOwnPropertyDescriptor,Bt=(e,t,a,i)=>{for(var s=i>1?void 0:i?Yr(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Jr(t,a,s),s};let ct=class extends Mt{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={}}render(){const e=this.component?.metadata;return n`
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
       `}};ct.styles=R`
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
    `;Bt([u()],ct.prototype,"state",2);Bt([u()],ct.prototype,"data",2);Bt([u()],ct.prototype,"appState",2);Bt([u()],ct.prototype,"appData",2);ct=Bt([_("mateu-form")],ct);var Xr=Object.defineProperty,Qr=Object.getOwnPropertyDescriptor,we=(e,t,a,i)=>{for(var s=i>1?void 0:i?Qr(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Xr(t,a,s),s};let ie=class extends O{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.pagesRequested=[],this.emptyArray=e=>!e||e.length==0,this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;if(this.metadata?.infiniteScrolling&&e.page>0){let i=!1;a&&a.content&&(a.content.length>=(e.page+1)*e.pageSize||a.content.length==a.totalElements)&&(t(a.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),a.totalElements),i=!0,this.grid&&this.grid.recalculateColumnWidths()),i||this.pagesRequested.find(s=>s==e.page)||(this.pagesRequested.push(e.page),this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:e,callback:()=>{this.data[this.id]?.page?.content&&(t(this.data[this.id].page.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),this.data[this.id].page.totalElements),this.grid&&this.grid.recalculateColumnWidths())}},bubbles:!0,composed:!0})))}else{const i=this.metadata?.infiniteScrolling?a?.totalElements:a?.content?.length??0;t(a?.content??[],i),this.grid&&this.grid.recalculateColumnWidths()}},this._onActionRequested=e=>{const t=e.detail,a=this.identifierFieldName;if(!a||!t.parameters||t.actionId?.startsWith("action-on-row-"))return;const i=t.parameters[a];i!==void 0&&(this.state._selectedId=String(i),this._applyCellPartNameGenerator(),this.grid?.requestContentUpdate())},this.tooltipGenerator=e=>{let t="";const{column:a,item:i}=e,s=this.metadata?.columns?.find(r=>r.metadata.id==a?.path);if(s?.metadata){const r=(s?.metadata).tooltipPath;r&&a&&i&&(t=i[r])}return t}}get identifierFieldName(){const e=this.metadata?.columns?.find(a=>a.metadata?.identifier);if(e)return e.metadata?.id;if(this.metadata?.columns?.find(a=>a.metadata?.id==="id"))return"id"}_applyCellPartNameGenerator(){if(!this.grid)return;const e=this.identifierFieldName,t=this.state?._selectedId??this.appState?._splitDetailId;e&&t!==void 0?this.grid.cellPartNameGenerator=(a,i)=>String(i.item[e])===String(t)?"selected-row":"":this.grid.cellPartNameGenerator=null}connectedCallback(){super.connectedCallback(),this.addEventListener("action-requested",this._onActionRequested)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("action-requested",this._onActionRequested)}updated(e){super.updated(e),this._applyCellPartNameGenerator(),this.grid?.clearCache(),this.grid?.recalculateColumnWidths(),this.pagesRequested=[]}render(){const e=this.data[this.id]?.page;let t="";this.metadata?.wrapCellContent&&(t+=" wrap-cell-content"),this.metadata?.compact&&(t+=" compact"),this.metadata?.noBorder&&(t+=" no-border"),this.metadata?.noRowBorder&&(t+=" no-row-borders"),this.metadata?.columnBorders&&(t+=" column-borders"),this.metadata?.rowStripes&&(t+=" row-stripes");const a=this.state[this.id+"_selected_items"]||[];return n`
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
                    @active-item-changed="${T(this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?i=>{if(this.metadata?.detailPath){const s=i.detail.value;s?this.detailsOpenedItems=[s]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${T(this.metadata?.detailPath?Ga(i=>n`${b(this,i[this.metadata?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    theme="${t}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?n`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:d}
                ${this.metadata?.columns?.map(i=>ga(i,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}
                ${this.metadata?.useButtonForDetail?n`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${Je((i,{detailsOpened:s})=>n`
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
                <span slot="empty-state">${lt(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(i=>i.metadata.tooltipPath)?n`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:d}
            </vaadin-grid>
            <slot></slot>
       `}};ie.styles=R`
        ${et}
        vaadin-grid[data-clickable-rows]::part(row) {
            cursor: pointer;
        }
        vaadin-grid[data-clickable-rows]::part(row):hover {
            background-color: var(--lumo-primary-color-10pct);
        }
        vaadin-grid::part(selected-row) {
            background-color: var(--lumo-primary-color-10pct);
        }
  `;we([u()],ie.prototype,"id",2);we([u()],ie.prototype,"metadata",2);we([u()],ie.prototype,"baseUrl",2);we([u()],ie.prototype,"state",2);we([u()],ie.prototype,"data",2);we([u()],ie.prototype,"appState",2);we([u()],ie.prototype,"appData",2);we([u()],ie.prototype,"emptyStateMessage",2);we([f()],ie.prototype,"detailsOpenedItems",2);we([Pe("vaadin-grid")],ie.prototype,"grid",2);ie=we([_("mateu-table")],ie);const Zr=76;function Fa(e){if(e.weight!=null)return e.weight;const t=e.stereotype??"";if(t==="icon")return 1;if(t==="image")return 4;if(t==="html"||t==="richText"||t==="markdown"||t==="textarea")return 5;if(t==="link")return 2.5;if(t==="combobox"||t==="select")return 2;const a=e.dataType??"";return a==="bool"?1:a==="status"||a==="integer"?1.5:a==="number"||a==="date"||a==="money"?2:a==="dateTime"||a==="dateRange"?2.5:3}function en(e,t){if(e.length===0)return"table";const a=e.reduce((c,h)=>c+Fa(h),0),i=t/Zr,s=a/i;if(s<=1)return"table";const r=e.filter(c=>c.identifier||(c.priority??Number.MAX_SAFE_INTEGER)<=2),o=r.reduce((c,h)=>c+Fa(h),0);return s>1.6||e.length>10?"masterDetail":r.length>0&&o<=8?"list":e.some(c=>c.stereotype==="image"||c.stereotype==="html")||r.length===0&&e.length>=4&&e.length<=8?"cards":"masterDetail"}function tn(e){return e.filter(t=>t.identifier||(t.priority??Number.MAX_SAFE_INTEGER)<=2).sort((t,a)=>(t.priority??Number.MAX_SAFE_INTEGER)-(a.priority??Number.MAX_SAFE_INTEGER))}function an(e){const t=e.dataType??"",a=e.stereotype??"";let i;return a==="combobox"||a==="select"?i=2:t==="bool"?i=1:t==="status"||t==="integer"?i=1.5:t==="number"||t==="date"||t==="money"?i=2:t==="dateTime"?i=2.5:i=3,t==="dateRange"?2.5*1.5:a==="listBox"?i*1.5:i}function sn(e){if(e.length===0)return"inline";const t=e.reduce((a,i)=>a+an(i),0);return t<=4?"inline":e.length>=6||t>8?"drawer":"popover"}var rn=Object.defineProperty,nn=Object.getOwnPropertyDescriptor,qe=(e,t,a,i)=>{for(var s=i>1?void 0:i?nn(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&rn(t,a,s),s};let ge=class extends O{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.filtersOpened=!1,this.clickedOnClearFilters=()=>{const e={};this.metadata?.filters.forEach(t=>{e[t.fieldId]=void 0}),e.searchText=void 0,this.state={...this.state,...e},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:this.metadata?.filters.map(t=>t.fieldId)},bubbles:!0,composed:!0})),this.handleButtonClick()},this.clickedOnFilters=()=>{this.filtersOpened=!0},this.clickedOnSearch=()=>{this.filtersOpened=!1,this.handleButtonClick()},this.valueChanged=e=>{const t=e.detail.value;if(typeof t=="number"&&Number.isNaN(t))return;const a=e.target.id;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:a},bubbles:!0,composed:!0}))},this.handleButtonClick=()=>{this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))},this.renderActiveFilterBadges=()=>{const e=(this.metadata?.filters??[]).map(t=>t).filter(t=>{const a=this.state[t.fieldId];return a!=null&&a!==""&&!Number.isNaN(a)});return e.length===0?d:n`
            <div class="active-filters">
                ${e.map(t=>{const a=Ne(t.label,this.state,this.data);return n`
                    <span theme="badge contrast pill" class="active-filter-badge">
                        <span>${a}: ${this.getFilterDisplayValue(t,this.state[t.fieldId])}</span>
                        <button
                            class="active-filter-remove"
                            @click="${()=>this.clearFilter(t.fieldId)}"
                            aria-label="Remove filter"
                        >✕</button>
                    </span>
                `})}
                <vaadin-button theme="tertiary small" style="margin-left: 0.5rem;" @click="${this.clickedOnClearFilters}">Clear filters</vaadin-button>
            </div>
        `},this.renderSearchBar=()=>n`
        <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: baseline;">
            ${this.metadata?.searchable?n`
                <vaadin-text-field
                        id="searchText"
                        @value-changed="${this.valueChanged}"
                        .value="${this.state.searchText??""}"
                        autofocus="${this.metadata?.autoFocusOnSearchText?!0:d}"
                        style="flex: 1;"
                        placeholder="Search..."
                ></vaadin-text-field>
            `:d}

            ${this.mainFilters.length>0?n`
                ${this.mainFilters.map(e=>b(this,this.wrapFilter(e),this.baseUrl,this.state,this.data,this.appState,this.appData))}
            `:d}

            ${this.effectiveFiltersLayout==="inline"?n`
                ${this.secondaryFilters.map(e=>b(this,this.wrapFilter(e),this.baseUrl,this.state,this.data,this.appState,this.appData))}
            `:d}

            ${(this.effectiveFiltersLayout==="popover"||this.effectiveFiltersLayout==="drawer"||this.effectiveFiltersLayout==="dialog")&&this.secondaryFilters.length>0?n`
                <vaadin-button id="filters-toggle-btn" @click="${()=>{this.filtersOpened=!this.filtersOpened}}">Filters</vaadin-button>
            `:d}

            <vaadin-button @click="${()=>this.handleButtonClick()}" theme="primary">Search</vaadin-button>
        </vaadin-horizontal-layout>
        `,this.renderFiltersDialog=()=>n`
        <vaadin-dialog
                header-title="Filters"
                .opened="${this.filtersOpened}"
                @closed="${()=>this.filtersOpened=!1}"
                ${qt(()=>this.renderFilterControls(),[])}
                ${Qt(()=>n`
                    <vaadin-button theme="tertiary" @click="${()=>this.filtersOpened=!1}">Cancel</vaadin-button>
                    <vaadin-button theme="primary" @click="${this.clickedOnSearch}" style="margin-left: auto;">Search</vaadin-button>
                `,[])}
        ></vaadin-dialog>
    `}updated(e){super.updated(e);const t=this.renderRoot?.querySelector("#filters-toggle-btn"),a=this.renderRoot?.querySelector("vaadin-popover");t&&a&&a.target!==t&&(a.target=t)}get mainFilters(){return(this.metadata?.filters??[]).filter(e=>e.mainFilter)}get secondaryFilters(){return(this.metadata?.filters??[]).filter(e=>!e.mainFilter)}get effectiveFiltersLayout(){const e=this.metadata?.filtersLayout??"auto";return e==="auto"?sn(this.secondaryFilters):e}handleKey(e){e.code=="Enter"&&(this.filtersOpened=!1,this.handleButtonClick())}connectedCallback(){super.connectedCallback(),this.metadata?.searchOnEnter&&this.addEventListener("keydown",this.handleKey)}disconnectedCallback(){super.disconnectedCallback(),this.metadata?.searchOnEnter&&this.removeEventListener("keydown",this.handleKey)}getFilterDisplayValue(e,t){if(e.options?.length){const a=e.options.find(i=>i.value===String(t));if(a)return a.label}return typeof t=="boolean"?t?"Yes":"No":String(t)}clearFilter(e){this.state={...this.state,[e]:void 0},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:e},bubbles:!0,composed:!0})),this.handleButtonClick()}wrapFilter(e){return{id:"",metadata:{...e,wantsFocus:!0},type:Y.ClientSide,style:"",children:[],slot:"",cssClasses:"",initialData:{},confirmOnNavigationIfDirty:!1}}renderFilterControls(){return n`
            <mateu-event-interceptor .target="${this}">
                <vaadin-form-layout max-columns="1" @keydown="${this.handleKey}" auto-responsive>
                    <vaadin-form-row>
                        ${this.secondaryFilters.map(e=>b(this,this.wrapFilter(e),this.baseUrl,this.state,this.data,this.appState,this.appData))}
                    </vaadin-form-row>
                </vaadin-form-layout>
            </mateu-event-interceptor>`}renderFilterActionButtons(){return n`
            <vaadin-button theme="tertiary" @click="${()=>{this.filtersOpened=!1,this.clickedOnClearFilters()}}">Clear</vaadin-button>
            <vaadin-button theme="primary" @click="${this.clickedOnSearch}" style="margin-left: auto;">Search</vaadin-button>`}renderPopover(){return n`
            <vaadin-popover
                position="bottom-start"
                .trigger="${[]}"
                .opened="${this.filtersOpened}"
                @opened-changed="${e=>{this.filtersOpened=e.detail.value}}"
                content-width="400px"
                ${fa(()=>n`
                    <div style="padding: var(--lumo-space-m);">
                        ${this.renderFilterControls()}
                        <vaadin-horizontal-layout theme="spacing" style="justify-content: flex-end; padding-top: var(--lumo-space-s);">
                            ${this.renderFilterActionButtons()}
                        </vaadin-horizontal-layout>
                    </div>
                `,[this.state])}
            ></vaadin-popover>`}renderDrawer(){return n`
            <div class="filter-drawer ${this.filtersOpened?"filter-drawer--open":""}">
                <vaadin-horizontal-layout theme="spacing" style="align-items: center; margin-bottom: var(--lumo-space-m);">
                    <span style="font-size: var(--lumo-font-size-l); font-weight: 600; flex: 1;">Filters</span>
                    <vaadin-button theme="icon tertiary" @click="${()=>this.filtersOpened=!1}" aria-label="Close">✕</vaadin-button>
                </vaadin-horizontal-layout>
                ${this.renderFilterControls()}
                <vaadin-horizontal-layout theme="spacing" style="justify-content: flex-end; margin-top: var(--lumo-space-m);">
                    ${this.renderFilterActionButtons()}
                </vaadin-horizontal-layout>
            </div>
            ${this.filtersOpened?n`
                <div class="filter-drawer-overlay" @click="${()=>this.filtersOpened=!1}"></div>
            `:d}`}render(){const e=this.effectiveFiltersLayout;return this.searchOnly?n`
                ${this.metadata?.searchable?this.renderSearchBar():d}
                ${this.renderActiveFilterBadges()}
                ${e==="dialog"?this.renderFiltersDialog():d}
                ${e==="drawer"?this.renderDrawer():d}
                ${e==="popover"?this.renderPopover():d}
            `:n`
            <vaadin-vertical-layout style="width: 100%; position: relative;">
                ${this.metadata?.searchable?this.renderSearchBar():d}
                ${this.renderActiveFilterBadges()}
                ${e==="popover"?this.renderPopover():d}
            </vaadin-vertical-layout>
            ${e==="dialog"?this.renderFiltersDialog():d}
            ${e==="drawer"?this.renderDrawer():d}
        `}};ge.styles=R`
        ${et}
        :host {
            width: 100%;
        }
        .active-filters {
            display: flex;
            flex-wrap: wrap;
            gap: 0.25rem;
            padding: 0.25rem 0;
        }
        .active-filter-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
        }
        .active-filter-remove {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0 0 0 2px;
            line-height: 1;
            font-size: 0.7rem;
            color: inherit;
            opacity: 0.7;
        }
        .active-filter-remove:hover {
            opacity: 1;
        }
.filter-drawer {
            position: fixed;
            inset: 0 0 0 auto;
            width: min(360px, 90vw);
            background: var(--lumo-base-color);
            box-shadow: var(--lumo-box-shadow-xl);
            z-index: 200;
            padding: var(--lumo-space-l);
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            transform: translateX(100%);
            transition: transform 0.2s ease;
        }
        .filter-drawer--open {
            transform: translateX(0);
        }
        .filter-drawer-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.32);
            z-index: 199;
        }
    `;qe([u()],ge.prototype,"metadata",2);qe([u()],ge.prototype,"baseUrl",2);qe([f()],ge.prototype,"state",2);qe([f()],ge.prototype,"data",2);qe([u()],ge.prototype,"appState",2);qe([u()],ge.prototype,"appData",2);qe([u({type:Boolean})],ge.prototype,"searchOnly",2);qe([f()],ge.prototype,"filtersOpened",2);ge=qe([_("mateu-filter-bar")],ge);var on=Object.defineProperty,ln=Object.getOwnPropertyDescriptor,jt=(e,t,a,i)=>{for(var s=i>1?void 0:i?ln(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&on(t,a,s),s};let ht=class extends O{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.totalPages=0}updated(e){super.updated(e),(e.has("totalElements")||e.has("pageSize"))&&(this.totalPages=Math.ceil(this.totalElements/this.pageSize))}dispatch(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return d;const e=this.totalPages>1,t=this.pageNumber,a=t===0,i=t>=this.totalPages-1;return n`
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
        `}};ht.styles=R`
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
    `;jt([u()],ht.prototype,"totalElements",2);jt([u()],ht.prototype,"pageSize",2);jt([u()],ht.prototype,"pageNumber",2);jt([f()],ht.prototype,"totalPages",2);ht=jt([_("mateu-pagination")],ht);var dn=Object.defineProperty,cn=Object.getOwnPropertyDescriptor,ce=(e,t,a,i)=>{for(var s=i>1?void 0:i?cn(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&dn(t,a,s),s};let Q=class extends O{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;t(a?.content??[],a?.content?.length??0)},this.respondToVisibility=(e,t)=>{var a={root:document.documentElement},i=new IntersectionObserver(s=>{s.forEach(r=>{t(r.intersectionRatio>0)})},a);i.observe(e)},this.keepAsking=!1,this.askToUpper=()=>{const e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?wa(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?n`<vaadin-card
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
                    <span slot="header-suffix" theme="badge ${Zt(e.status.type)}">${e.status.message}</span>
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
       `}};Q.styles=R`
        ${et}
        
        .card-container {
            display: flex; 
            width: 100%; 
            flex-wrap: wrap; 
            gap: 10px;
        }

        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }

    `;ce([u()],Q.prototype,"id",2);ce([u()],Q.prototype,"metadata",2);ce([u()],Q.prototype,"baseUrl",2);ce([u()],Q.prototype,"state",2);ce([u()],Q.prototype,"data",2);ce([u()],Q.prototype,"appState",2);ce([u()],Q.prototype,"appData",2);ce([u()],Q.prototype,"emptyStateMessage",2);ce([f()],Q.prototype,"keepAsking",2);ce([Pe("#ask-for-more")],Q.prototype,"askForMore",2);ce([f()],Q.prototype,"hasMore",2);Q=ce([_("mateu-card-list")],Q);var ni=(e=>(e.none="none",e.success="success",e.error="error",e.warning="warning",e.contrast="contrast",e.normal="normal",e))(ni||{}),oi=(e=>(e.primary="primary",e.secondary="secondary",e.tertiary="tertiary",e.tertiaryInline="tertiaryInline",e))(oi||{}),hn=Object.defineProperty,un=Object.getOwnPropertyDescriptor,xe=(e,t,a,i)=>{for(var s=i>1?void 0:i?un(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&hn(t,a,s),s};const pn={asc:"ascending",desc:"descending"};let se=class extends O{constructor(){super(...arguments),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this.search=()=>{const e=this.component.metadata;this.state={...this.state,size:e.pageSize,page:0,crud_selected_items:[]},this._syncStateToUrl(e),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}}},bubbles:!0,composed:!0}))},this.notify=e=>{Ut.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.handleSearchRequested=e=>{this.state={...this.state,crud_selected_items:[]};const t=this.component.metadata;this._syncStateToUrl(t),!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}},callback:e},bubbles:!0,composed:!0}))},this.fetchMoreElements=e=>{const{params:t,callback:a}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(a)},this.directionChanged=e=>{const t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(a=>({fieldId:a.__data.path,direction:a.__data.direction?pn[a.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForComponentId=void 0,this.evalLabel=e=>Ne(e,this.state,this.data),this.handleToolbarButtonClick=e=>{if(e==="import"){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{const t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"process-import",parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get cols(){return this.component?.metadata?.columns?.map(t=>t.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.component?.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":en(this.cols,this.availableWidthPx):t}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}_filterIds(e){return new Set(["searchText",...(e.filters??[]).map(t=>t.fieldId)])}_syncStateToUrl(e){const t=this._filterIds(e),a=new URLSearchParams(window.location.search);t.forEach(l=>a.delete(l)),a.delete("page"),a.delete("sort"),t.forEach(l=>{const c=this.state[l];c!=null&&c!==""&&a.set(l,String(c))});const i=this.state.page;i&&i>0&&a.set("page",String(i));const s=this.state.sort;if(s&&s.length>0){const l=s.filter(c=>c.fieldId&&c.direction).map(c=>`${c.fieldId}:${c.direction}`).join(",");l&&a.set("sort",l)}const r=a.toString(),o=r?`${window.location.pathname}?${r}`:window.location.pathname;window.location.pathname+window.location.search!==o&&history.replaceState(null,"",o)}_initStateFromUrl(e,t){const a=new URLSearchParams(window.location.search),i=this._filterIds(e),s={...t};a.forEach((l,c)=>{i.has(c)&&(s[c]=l)});const r=a.get("page");if(r!==null){const l=parseInt(r,10);!isNaN(l)&&l>0&&(s.page=l)}const o=a.get("sort");if(o){const l=o.split(",").map(c=>{const[h,p]=c.split(":");return h&&p?{fieldId:h,direction:p}:null}).filter(Boolean);l.length>0&&(s.sort=l)}return s}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}updated(e){if(super.updated(e),e.has("component")){const t=this.component?.id;if(t!==this._initializedForComponentId){this._initializedForComponentId=t;const a=this.component?.metadata,i=a.initialPage&&a.initialPage>0?a.initialPage:0;this.state=this._initStateFromUrl(a,{...this.state,size:a.pageSize,page:i,sort:[]}),(this.state.page!==i||this.state.sort?.length>0||[...this._filterIds(a)].some(r=>this.state[r]!=null))&&this.handleSearchRequested(void 0)}}}render(){const e=y=>{const I=[];return y.color&&y.color!==ni.normal&&I.push(y.color),y.buttonStyle&&I.push(y.buttonStyle===oi.tertiaryInline?"tertiary-inline":y.buttonStyle),I.length?I.join(" "):void 0},t=y=>y==="back"||y==="backToList"||!!y&&y.startsWith("cancel"),a=y=>{const I=q.get()?.renderCrudToolbarButton?.(y,this.evalLabel(y.label),()=>this.handleToolbarButtonClick(y.actionId));return I||n`
                <vaadin-button
                        data-action-id="${y.id}"
                        theme="${e(y)||d}"
                        @click="${()=>this.handleToolbarButtonClick(y.actionId)}"
                >${this.evalLabel(y.label)}</vaadin-button>
            `};if(!this.component)return n`no component`;const i=this.component.metadata;i.serverSideOrdering=!0;const s=i?.toolbar??[],r=s.filter(y=>t(y.actionId)),o=s.filter(y=>!t(y.actionId)),l=r.length>0&&o.length>0,c=!!i?.title||!!i?.subtitle||s.length>0,h=this.effectiveGridLayout,p=this.cols,v=tn(p),$=this.data[this.id]?.page?.content??[],k=this.state[this.component?.id]?.emptyStateMessage,S=(y,I)=>{const w=I[y.id];if(w==null)return n``;if(y.dataType==="status"){const M=Zt(w.type);return n`<span theme="badge pill ${M}">${w.message}</span>`}return y.dataType==="bool"?n`${w?"✓":"✗"}`:typeof w=="object"?n`${w.label??w.name??w.message??""}`:n`${w}`},g=()=>{const y=this.identifierFieldName,I=this.state._selectedId??this.appState?._splitDetailId,w=v.find(C=>C.identifier)??v[0],M=C=>C.dataType==="action"||C.dataType==="actionGroup"||C.dataType==="menu"||C.stereotype==="button",it=v.filter(C=>C!==w&&!M(C)),It=p.filter(C=>M(C)),We=(C,L,D)=>{C.stopPropagation(),C.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:L,parameters:{_clickedRow:D}},bubbles:!0,composed:!0}))},st=C=>{const L=[];for(const D of It){const B=C[D.id];if(D.dataType==="action"){const me=B?.methodNameInCrud?B:C.action?.methodNameInCrud?C.action:{methodNameInCrud:D.id,label:D.label,icon:null};L.push(n`
                            <vaadin-button theme="tertiary small" title="${me.label||d}"
                                @click="${x=>We(x,"action-on-row-"+me.methodNameInCrud,C)}">
                                ${me.icon?n`<vaadin-icon icon="${me.icon}"></vaadin-icon>`:d}
                                ${me.label??d}
                            </vaadin-button>`)}else(D.dataType==="actionGroup"||D.dataType==="menu")&&(B?.actions??[]).forEach(x=>L.push(n`
                            <vaadin-button theme="tertiary small" title="${x.label||d}"
                                @click="${K=>We(K,"action-on-row-"+x.methodNameInCrud,C)}">
                                ${x.icon?n`<vaadin-icon icon="${x.icon}"></vaadin-icon>`:d}
                                ${x.label??d}
                            </vaadin-button>`))}return L.length?n`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${L}
                    </div>`:d};return n`
                <vaadin-list-box style="width: 100%;">
                    ${$.length===0?n`<vaadin-item disabled>${lt(k)}</vaadin-item>`:d}
                    ${$.map(C=>n`
                        <vaadin-item
                            ?selected="${y&&I!==void 0&&String(C[y])===String(I)}"
                            @click="${()=>{y&&C[y]!==void 0&&(this.state={...this.state,_selectedId:String(C[y])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:C},bubbles:!0,composed:!0}))}}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${w?C[w.id]??"":""}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${it.map(L=>n`<span>${L.label}: ${S(L,C)}</span>`)}
                            </div>
                            ${st(C)}
                        </vaadin-item>
                    `)}
                </vaadin-list-box>`},P=(y,I,w)=>{const M=this.identifierFieldName;M&&w[M]!==void 0&&(this.state={...this.state,_selectedId:String(w[M])}),y.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:I,parameters:w},bubbles:!0,composed:!0}))},F=()=>{const y=this.identifierFieldName,I=this.state._selectedId??this.appState?._splitDetailId,w=p.slice(0,6),M=w.filter(x=>x.stereotype==="image"),it=w.find(x=>x.identifier)??w[0],It=x=>!!x.actionId,We=x=>x.dataType==="action"||x.dataType==="actionGroup"||x.dataType==="menu"||x.stereotype==="button",st=w.find(x=>x.id==="select"&&x.dataType==="action"),C=!!st,L=w.filter(x=>x!==it&&!M.includes(x)&&!It(x)&&!We(x)),D=w.filter(x=>We(x)&&!(C&&x===st)),B=(x,K,Ve)=>{x.stopPropagation(),x.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:K,parameters:{_clickedRow:Ve}},bubbles:!0,composed:!0}))},me=x=>{const K=[];for(const Ve of D){const oa=x[Ve.id];if(Ve.dataType==="action"){const ft=oa?.methodNameInCrud?oa:x.action?.methodNameInCrud?x.action:{methodNameInCrud:Ve.id,label:Ve.label,icon:null};K.push(n`
                            <vaadin-button theme="tertiary" title="${ft.label||d}"
                                @click="${rt=>B(rt,"action-on-row-"+ft.methodNameInCrud,x)}">
                                ${ft.icon?n`<vaadin-icon icon="${ft.icon}"></vaadin-icon>`:d}
                                ${ft.label??d}
                            </vaadin-button>`)}else(Ve.dataType==="actionGroup"||Ve.dataType==="menu")&&(oa?.actions??[]).forEach(rt=>K.push(n`
                            <vaadin-button theme="tertiary" title="${rt.label||d}"
                                @click="${mi=>B(mi,"action-on-row-"+rt.methodNameInCrud,x)}">
                                ${rt.icon?n`<vaadin-icon icon="${rt.icon}"></vaadin-icon>`:d}
                                ${rt.label??d}
                            </vaadin-button>`))}return K.length?n`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${K}
                    </div>`:d};return n`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${$.length===0?n`<div style="grid-column: 1 / -1;">${lt(k)}</div>`:d}
                    ${$.map(x=>n`
                        <vaadin-card
                            clickable
                            ?data-selected="${y&&I!==void 0&&String(x[y])===String(I)}"
                            style="cursor: pointer;"
                            @click="${K=>C?B(K,"action-on-row-select",x):P(K.target,"view",x)}"
                        >
                            ${M.length?n`<img slot="media" src="${x[M[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover;" />`:d}
                            ${it?n`<div slot="title">${x[it.id]??""}</div>`:d}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${L.map(K=>n`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${K.label}</span>
                                        <span>${S(K,x)}</span>
                                    </div>
                                `)}
                            </div>
                            ${me(x)}
                        </vaadin-card>
                    `)}
                </div>`},U=()=>{const y=v.find(w=>w.identifier)??v[0],I=v.filter(w=>w!==y);return n`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <vaadin-list-box style="width: 100%;">
                            ${$.length===0?n`<vaadin-item disabled>${lt(k)}</vaadin-item>`:d}
                            ${$.map(w=>n`
                                <vaadin-item
                                    ?selected="${this.selectedItem===w}"
                                    @click="${()=>{this.selectedItem=w}}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${y?w[y.id]??"":""}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${I.map(M=>n`${S(M,w)} `)}
                                    </div>
                                </vaadin-item>
                            `)}
                        </vaadin-list-box>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?n`
                            <vaadin-form-layout>
                                ${p.map(w=>n`
                                    <vaadin-text-field
                                        label="${w.label}"
                                        .value="${String(this.selectedItem[w.id]??"")}"
                                        readonly
                                    ></vaadin-text-field>
                                `)}
                            </vaadin-form-layout>
                        `:n`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},A=()=>{const y=this.identifierFieldName,I=this.state._selectedId??this.appState?._splitDetailId,w=p[0],M=p.slice(1),it=!!w?.actionId,It=(L,D)=>{const B=L.parentItem?L.parentItem.children??[]:$;D(B,B.length)},We=(L,D)=>{for(const B of L??[]){if(y&&String(B[y])===D)return B;const me=We(B.children,D);if(me)return me}},st=y&&I!==void 0?We($,String(I)):void 0,C=(L,D,B)=>{L.stopPropagation(),y&&D[y]!==void 0&&(this.state={...this.state,_selectedId:String(D[y])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:B,parameters:D},bubbles:!0,composed:!0}))};return n`
                <vaadin-grid
                    style="width: 100%;"
                    all-rows-visible
                    .itemHasChildrenPath="${"children"}"
                    .itemIdPath="${y??"id"}"
                    .dataProvider="${It}"
                    .selectedItems="${st?[st]:[]}"
                >
                    ${w?n`<vaadin-grid-tree-column path="${w.id}" header="${w.label??d}" flex-grow="1"></vaadin-grid-tree-column>`:d}
                    ${it?n`
                    <vaadin-grid-column width="6rem" flex-grow="0" text-align="end" ${Je(L=>L?.viewable===!1?d:n`
                        <vaadin-button theme="tertiary small" @click="${D=>C(D,L,"view")}">View</vaadin-button>
                    `,[])}></vaadin-grid-column>`:d}
                    ${M.map(L=>n`<vaadin-grid-column path="${L.id}" header="${L.label??d}" auto-width></vaadin-grid-column>`)}
                    <span slot="empty-state">${lt(k)}</span>
                </vaadin-grid>`},V=q.get()?.rendersCrudLayouts?.()===!0,at=n`
            ${i.infiniteScrolling?n`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:d}
            ${!V&&h==="list"?g():!V&&h==="cards"?i.contentHeight?n`
                <vaadin-scroller style="width: 100%; height: ${i.contentHeight};">
                    ${F()}
                </vaadin-scroller>
            `:F():!V&&h==="masterDetail"?U():!V&&h==="tree"?A():q.get()?.renderTableComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,Et=i.infiniteScrolling?d:q.get()?.renderPagination(this,this.component),Ht=n`
            <vaadin-dialog
                .opened="${this.showImportDialog}"
                header-title="Import"
                @opened-changed="${y=>{this.showImportDialog=y.detail.value}}"
                ${qt(()=>n`
                    <vaadin-upload
                        target="/upload"
                        max-files="1"
                        @upload-success="${this.handleImportUploadSuccess}"
                    ></vaadin-upload>
                `,[this.showImportDialog])}
                ${Qt(()=>n`
                    <vaadin-button @click="${()=>{this.showImportDialog=!1}}">Cancel</vaadin-button>
                `,[])}
            ></vaadin-dialog>
        `;return this.standalone?n`
                ${Ht}
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
                    <div style="flex-shrink: 0;">${q.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                    <div style="flex: 1; overflow-y: auto; min-height: 0;">${at}</div>
                    <div style="flex-shrink: 0;">${Et}</div>
                </div>
            `:n`
            ${Ht}
            ${c?n`
                    <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m);">
                        <div style="flex: 1; min-width: 0;">
                            ${i?.title?n`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(i.title)}</h2>
                            `:d}
                            ${i?.subtitle?n`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(i.subtitle)}</span>
                            `:d}
                        </div>
                        ${r.map(y=>a(y))}
                        ${l?n`<span class="toolbar-divider"></span>`:d}
                        ${o.map(y=>a(y))}
                        <slot></slot>
                    </vaadin-horizontal-layout>
                `:d}
            <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); padding: var(--lumo-space-m); display: flex; flex-direction: column;">
                <div style="flex-shrink: 0;">${q.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                <div style="flex: 1; overflow-y: auto; min-height: 0;">${at}</div>
                <div style="flex-shrink: 0;">${Et}</div>
            </div>
        `}createRenderRoot(){return q.mustUseShadowRoot()?super.createRenderRoot():this}};se.styles=R`
        ${et}
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
    `;xe([u()],se.prototype,"component",2);xe([u()],se.prototype,"baseUrl",2);xe([u({type:Boolean})],se.prototype,"standalone",2);xe([u()],se.prototype,"state",2);xe([u()],se.prototype,"data",2);xe([u()],se.prototype,"appState",2);xe([u()],se.prototype,"appData",2);xe([f()],se.prototype,"showImportDialog",2);xe([f()],se.prototype,"availableWidthPx",2);xe([f()],se.prototype,"selectedItem",2);se=xe([_("mateu-table-crud")],se);var Ke=(e=>(e.OnLoad="OnLoad",e.OnSuccess="OnSuccess",e.OnError="OnError",e.OnValueChange="OnValueChange",e.OnCustomEvent="OnCustomEvent",e.AutoSave="AutoSave",e))(Ke||{}),mn=Object.defineProperty,aa=(e,t,a,i)=>{for(var s=void 0,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=o(t,a,s)||s);return s&&mn(t,a,s),s};class vt extends Mt{constructor(){super(...arguments),this.state={},this.data={},this.appData={},this.appState={},this.triggerOnLoad=()=>{const t=this.component;this.registerCustomEventListeners(),t.triggers?.filter(a=>a.type==Ke.OnLoad).forEach(a=>{if((!a.condition||this._evalExpr(a.condition))&&!a.triggered){const s=a;s.triggered=!0;var i=s.times-1;s.timeoutMillis>0?this.scheduleOnload(s,i,this.id):this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(t,a,i)=>{if(i!=this.component?.id)return;const s=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,callbackToken:s},bubbles:!0,composed:!0}))},t.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=t=>{if(!(t instanceof CustomEvent))return;const a=t,s=(this.component.triggers??[]).filter(r=>r.type==Ke.OnCustomEvent).filter(r=>r.eventName==a.type).filter(r=>r.source!=="COMPONENT"||a.detail?.__source===r.from);s.length!==0&&(s.some(r=>!r.source||r.source==="SELF")&&(t.stopPropagation(),t.preventDefault()),s.forEach(r=>{(!r.condition||this._evalExpr(r.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,parameters:a.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(t){return Xa(t,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(t){return Ui(t,this.state??{},this.data??{},this._interpolationExtra())}applyFragment(t){if(this.id==t.targetComponentId){if(t.component)if(At.Add==t.action)this.component&&this.component.children?.push(t.component);else{if(this.callbackToken=G(),t.component?.type==Y.ServerSide)if(this.component){const i=this.component,s=t.component;i.actions=s.actions,i.type=s.type,i.rules=s.rules,i.triggers=s.triggers,i.serverSideType=s.serverSideType,i.route=s.route,i.initialData=s.initialData,i.validations=s.validations,i.cssClasses=s.cssClasses,i.slot=s.slot,i.style=s.style,i.children=s.children,(i.serverSideType!=s.serverSideType||i.id!=s.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=t.component,setTimeout(()=>this.triggerOnLoad());else{const i=[t.component];this.component&&(this.component.children=i)}t.action!==At.ReplaceKeepData&&(this.state={},this.data={})}if(t.state&&(this.state={...this.state,...t.state}),t.data){for(const i in t.data){const s=t.data[i]?.page;s?.pageNumber>0&&this.data[i]&&this.data[i].page.content&&(s.content?s.content=[...this.data[i].page.content,...s.content]:s.content=[...this.data[i].page.content])}this.data={...this.data,...t.data}}this.registerCustomEventListeners();const a=q.getAfterRenderHook();a&&setTimeout(()=>a(this)),this.requestUpdate()}}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:a,name:i})=>a.removeEventListener(i,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(a=>a.type==Ke.OnCustomEvent).forEach(a=>{const i=a.source==="DOCUMENT"||a.source==="COMPONENT"?document:this;i.addEventListener(a.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:i,name:a.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:t,name:a})=>t.removeEventListener(a,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}}aa([u()],vt.prototype,"state");aa([u()],vt.prototype,"data");aa([u()],vt.prototype,"appData");aa([u()],vt.prototype,"appState");var vn=Object.defineProperty,fn=Object.getOwnPropertyDescriptor,ia=(e,t,a,i)=>{for(var s=i>1?void 0:i?fn(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&vn(t,a,s),s};let yt=class extends O{constructor(){super(...arguments),this.notificationOpened=!1,this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1,this.error=e.detail.reason,this.openNotification()},this.openNotification=()=>{this.notificationOpened=!0},this.closeNotification=()=>{this.notificationOpened=!1},this.notificationRenderer=()=>n`
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
                ${Ha(this.notificationRenderer,[])}
        ></vaadin-notification>`}};yt.styles=R`
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
  `;ia([f()],yt.prototype,"loading",2);ia([f()],yt.prototype,"notificationOpened",2);ia([f()],yt.prototype,"error",2);yt=ia([_("mateu-api-caller")],yt);class bn{constructor(){this._dirty=!1,this._installed=!1,this.message="You have unsaved changes. Are you sure you want to leave this page?",this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=t=>{this._dirty&&(t.preventDefault(),t.returnValue="")}}install(){this._installed||(this._installed=!0,document.addEventListener("dirty",this._onDirty),document.addEventListener("clean",this._onClean),window.addEventListener("beforeunload",this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;const t=window.confirm(this.message);return t&&(this._dirty=!1),t}}const Ot=new bn;var gn=Object.defineProperty,$n=Object.getOwnPropertyDescriptor,N=(e,t,a,i)=>{for(var s=i>1?void 0:i?$n(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&gn(t,a,s),s};let z=class extends vt{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0,this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this.isDark=document.documentElement.getAttribute("theme")==="dark",this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;const e=this.isDark?"dark":"light";document.documentElement.setAttribute("theme",e),localStorage.setItem("mateu-theme",e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?"detail":"detail-hidden")},this.runAction=e=>{const a=this.renderRoot.querySelector?.("mateu-component");a&&a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){const a=e[t];if(a.selected)return a;const i=this.getSelectedOption(a.submenus);if(i)return i}return null},this.itemSelected=e=>{const t=e.detail.value;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.itemSelectedTiles=e=>{const t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))},this.mapItemsForTiles=e=>e.map(t=>({text:t.label,consumedRoute:t.consumedRoute,route:t.route,baseUrl:t.baseUrl,serverSideType:t.serverSideType,uriPrefix:t.uriPrefix,actionId:t.actionId,selected:t.selected,_menuOption:t})),this.flattenMenuForPalette=(e,t)=>{const a=[];for(const i of e)if(!i.separator)if(i.submenus&&i.submenus.length>0){const s=t?`${t} › ${i.label}`:i.label;a.push(...this.flattenMenuForPalette(i.submenus,s))}else a.push({label:i.label,breadcrumb:t,consumedRoute:i.consumedRoute,route:i.route,actionId:i.actionId,baseUrl:i.baseUrl,serverSideType:i.serverSideType,uriPrefix:i.uriPrefix});return a},this.handleCommandPaletteKeydown=(e,t)=>{if(e.key==="ArrowDown")e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,Math.min(t.length,10)-1);else if(e.key==="ArrowUp")e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key==="Enter"){const a=t[this.commandPaletteSelectedIndex];a&&(this.selectRoute(a.consumedRoute,a.route,a.actionId,a.baseUrl,a.serverSideType,a.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery="")}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return d;const e=this.component?.metadata;if(!e?.menu)return d;const t=this.flattenMenuForPalette(e.menu,""),a=this.commandPaletteQuery.toLowerCase(),i=a?t.filter(s=>s.label.toLowerCase().includes(a)||s.breadcrumb.toLowerCase().includes(a)):t;return n`
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
                        ${i.slice(0,10).map((s,r)=>n`
                            <div class="cmd-result ${r===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                @click=${()=>{this.selectRoute(s.consumedRoute,s.route,s.actionId,s.baseUrl,s.serverSideType,s.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}
                                @mouseenter=${()=>{this.commandPaletteSelectedIndex=r}}
                            >
                                <span class="cmd-result-label">${s.label}</span>
                                ${s.breadcrumb?n`<span class="cmd-result-breadcrumb">${s.breadcrumb}</span>`:d}
                            </div>
                        `)}
                        ${i.length===0?n`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>`:d}
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
        `,this.goHome=()=>{const e=this.component.metadata;this.selectRoute(e.route,"_page","",void 0,void 0,void 0)},this.selectRoute=(e,t,a,i,s,r)=>{Ot.confirmLeave()&&this._selectRoute(e,t,a,i,s,r)},this._selectRoute=(e,t,a,i,s,r)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=i,this.selectedRoute=t,this.selectedServerSideType=s,this.selectedUriPrefix=r,this.instant=G(),this.state&&this.state._route!=null&&(this.state._route=void 0);let o=this.baseUrl??"";o.indexOf("://")<0&&(o.startsWith("/")||(o="/"+o),o=window.location.origin+o),o.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let l=new URL(o+t);if(e&&l.pathname.startsWith(e)){const c=l.pathname.substring(e.length);l=new URL(l.origin+(c||"/"))}if((window.location.pathname||l.pathname)&&window.location.pathname!=l.pathname){let c=l.pathname;l.search&&(c+=l.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let h=c;this.selectedUriPrefix&&(h.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?h=this.selectedUriPrefix+h.substring(1):!h.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?h=this.selectedUriPrefix+"/"+h:h=this.selectedUriPrefix+h),h=="/_page"&&(h=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:h},bubbles:!0,composed:!0}))}}},this.mapItems=(e,t)=>e.map(a=>{if(a.submenus&&a.submenus.length>0){let i=this.mapItems(a.submenus,t);return t&&a.label.toLowerCase().includes(t)&&(i=this.mapItems(a.submenus,"")),i&&i.length>0?{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||a.selected,children:i}:void 0}if(a.separator)return t?void 0:{component:"hr"};if(!t||a.label.toLowerCase().includes(t))return{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||a.selected}}).filter(a=>a!=null),this.getSelectedIndex=e=>{if(e){const t=this.getSelectedOption(e);if(t)return e.indexOf(t)}return NaN},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?n`
                <vaadin-details summary="${e.label}" theme="reverse">
                    <vaadin-vertical-layout>
                        ${e.submenus.map(t=>n`${this.renderOptionOnLeftMenu(t)}`)}
                    </vaadin-vertical-layout>
                </vaadin-details>
`:n`<vaadin-button theme="tertiary" 
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)}"
        >${e.label}</vaadin-button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){const t=this.shadowRoot?.querySelector("mateu-ux");t&&t.setAttribute("instant",G())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?n`
            ${e.map(a=>{const i=a;return n`

                        ${i.component=="hr"?n`<hr slot="children"/>`:n`
                                <vaadin-side-nav-item
                                .path="${i.route&&!i.children?i.route:void 0}"
                                .pathAliases="${[this.baseUrl+(i.route?i.route:"")]}"
                                slot="${t}"
                                ?expanded="${i.selected}"
                                >
                                    ${i.icon?n`
                                        <vaadin-icon icon="vaadin:dashboard" slot="prefix"></vaadin-icon>
                                    `:d}
                                    ${i.text}
                                    ${this.renderSideNav(i.children,"children")}
                                </vaadin-side-nav-item>
                        `}

                            `})}`:d,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}createRenderRoot(){return q.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute("theme")==="dark",this._commandPaletteHandler=e=>{(e.metaKey||e.ctrlKey)&&e.key==="k"&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0),e.key==="Escape"&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery="")},document.addEventListener("keydown",this._commandPaletteHandler),Ot.install(),this.addEventListener("compact-changed",this._compactHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener("keydown",this._commandPaletteHandler),this.removeEventListener("compact-changed",this._compactHandler)}updated(e){if(super.updated(e),this.component){const a=this.component.metadata;if(a){const i=a;if(i.favicon){let s=document.querySelector("link[rel~='icon']");s||(s=document.createElement("link"),s.rel="icon",document.head.appendChild(s)),s.href=i.favicon}e.has("component")&&(this.selectedRoute=i.homeRoute,this.selectedConsumedRoute=i.homeConsumedRoute,this.selectedServerSideType=i.homeServerSideType,this.selectedBaseUrl=i.homeBaseUrl,this.selectedUriPrefix=i.homeUriPrefix)}}e.has("commandPaletteOpen")&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(".cmd-input")?.focus()},0)}render(){return q.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}};z.styles=R`

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

  `;N([f()],z.prototype,"filter",2);N([f()],z.prototype,"instant",2);N([f()],z.prototype,"selectedConsumedRoute",2);N([f()],z.prototype,"selectedRoute",2);N([f()],z.prototype,"selectedUriPrefix",2);N([f()],z.prototype,"selectedBaseUrl",2);N([f()],z.prototype,"selectedServerSideType",2);N([f()],z.prototype,"selectedParams",2);N([f()],z.prototype,"tilesMenuOption",2);N([f()],z.prototype,"railOpenOption",2);N([f()],z.prototype,"commandPaletteOpen",2);N([f()],z.prototype,"commandPaletteQuery",2);N([f()],z.prototype,"commandPaletteSelectedIndex",2);N([f()],z.prototype,"pageCompact",2);N([Pe("mateu-chat")],z.prototype,"chat",2);N([f()],z.prototype,"isDark",2);N([f()],z.prototype,"chatOpen",2);N([Pe("vaadin-app-layout")],z.prototype,"vaadinAppLayout",2);z=N([_("mateu-app")],z);var yn=Object.defineProperty,wn=Object.getOwnPropertyDescriptor,Le=(e,t,a,i)=>{for(var s=i>1?void 0:i?wn(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&yn(t,a,s),s};let oe=class extends O{constructor(){super(...arguments),this.message="This website uses cookies.",this.dismiss="Ok. Thanks :).",this.learnMore="Learn more",this.learnMoreLink="https://cookiesandyou.com/",this.showLearnMore=!0,this.position="top",this.cookieName="mateu-cookieconsent"}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement("style"),this._css.innerText=".cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}",document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){const e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){const e=this.popup;e&&(e.classList.remove("cc-invisible"),e.style.display="")}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:"#000"},button:{background:"rgba(22, 118, 243, 0.95)",hover:"rgba(22, 118, 243, 1)"}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});const e=this.popup;if(e){e.setAttribute("role","alert");const t=e.querySelector("a.cc-btn");t?.addEventListener("keydown",a=>{const r=a.keyCode||a.which;(r===32||r===13)&&t.click()})}}render(){return n`
       `}};oe.styles=R`
  `;Le([u()],oe.prototype,"message",2);Le([u()],oe.prototype,"dismiss",2);Le([u()],oe.prototype,"learnMore",2);Le([u()],oe.prototype,"learnMoreLink",2);Le([u()],oe.prototype,"showLearnMore",2);Le([u()],oe.prototype,"position",2);Le([u()],oe.prototype,"cookieName",2);Le([f()],oe.prototype,"_css",2);Le([Pe('[aria-label="cookieconsent"]')],oe.prototype,"popup",2);oe=Le([_("mateu-cookie-consent")],oe);var xn=Object.defineProperty,Sn=Object.getOwnPropertyDescriptor,li=(e,t,a,i)=>{for(var s=i>1?void 0:i?Sn(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&xn(t,a,s),s};let Yt=class extends O{constructor(){super(...arguments),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener("value-changed",this.redispatchEvent),this.addEventListener("data-changed",this.redispatchEvent),this.addEventListener("action-requested",this.redispatchEvent),this.addEventListener("server-side-action-requested",this.redispatchEvent),this.addEventListener("route-changed",this.redispatchEvent),this.addEventListener("close-modal-requested",this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("value-changed",this.redispatchEvent),this.removeEventListener("data-changed",this.redispatchEvent),this.removeEventListener("action-requested",this.redispatchEvent),this.removeEventListener("server-side-action-requested",this.redispatchEvent),this.removeEventListener("route-changed",this.redispatchEvent)}render(){return n`<slot></slot>`}};Yt.styles=R`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `;li([u()],Yt.prototype,"target",2);Yt=li([_("mateu-event-interceptor")],Yt);var kn=Object.defineProperty,_n=Object.getOwnPropertyDescriptor,di=(e,t,a,i)=>{for(var s=i>1?void 0:i?_n(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&kn(t,a,s),s};let Xt=class extends vt{constructor(){super(...arguments),this.opened=!0,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),500)}}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}render(){const e=this.component.metadata;let t="";e.noPadding&&(t+=" no-padding");const a=Ja(e.headerTitle,this.state,this.data,this.appState,this.appData);return n`
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
                ${e.header||e.closeButtonOnHeader?gi(()=>n`<mateu-event-interceptor .target="${this}" style="width: 100%;">${e.header?b(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):d}${e.closeButtonOnHeader?n`
                            <vaadin-button theme="tertiary" @click="${this.close}">
                                <vaadin-icon icon="lumo:cross"></vaadin-icon>
                            </vaadin-button>
                        `:d}</mateu-event-interceptor>`,[this.state,this.data]):d}
                ${e.footer?Qt(()=>n`<mateu-event-interceptor .target="${this}" style="width: 100%;">${b(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):d}
                ${e.content?qt(()=>n`<mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${b(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):d}
                style="${this.component?.style}" 
                class="${this.component?.cssClasses}"
        >
        </vaadin-dialog>

       `}};Xt.styles=R`
  `;di([f()],Xt.prototype,"opened",2);Xt=di([_("mateu-dialog")],Xt);var Cn=Object.defineProperty,En=Object.getOwnPropertyDescriptor,te=(e,t,a,i)=>{for(var s=i>1?void 0:i?En(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Cn(t,a,s),s};function Na(e){if(e.parentElement)return e.parentElement;const t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}let W=class extends O{constructor(){super(...arguments),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type==="keydown"){const t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{const t=e.detail,a=t.banners??[],i=t.append??!1;i?this.actionBanners=[...this.actionBanners,...a]:(this._clearActionBannerTimers(),this.actionBanners=a);const s=i?this.actionBanners.length-a.length:0;a.forEach((r,o)=>{if(r.timeoutSeconds&&r.timeoutSeconds>0){const l=s+o;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((c,h)=>h!==l)},r.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;const t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;const a=parseInt(t[1],10)-1;a>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(a))},this._onScrollSpy=()=>{if(this._tocLocked)return;const e=this._sectionCards();if(!e.length)return;const t=12,a=this.shadowRoot?.querySelector("mateu-content-header");let i=a?a.getBoundingClientRect().bottom:0;for(const o of e){if(!o.classList.contains("mateu-section--sticky"))continue;const l=o.getBoundingClientRect();l.top<=i+t+2&&(i=Math.max(i,l.bottom))}const s=i+t+4;let r=0;this._tocEntries.forEach((o,l)=>{o.el.getBoundingClientRect().top<=s&&(r=l)}),this._activeToc=r}}connectedCallback(){super.connectedCallback(),document.addEventListener("page-banners-received",this._bannersHandler),window.addEventListener("resize",this._onResize),document.addEventListener("keydown",this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("page-banners-received",this._bannersHandler),window.removeEventListener("resize",this._onResize),document.removeEventListener("keydown",this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy()}updated(e){super.updated(e),e.has("component")&&e.get("component")!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has("component")&&(this._scheduleStaticBannerTimeouts(),this.dispatchEvent(new CustomEvent("compact-changed",{detail:{compact:!!this.component?.style?.includes("--mateu-compact:1")},bubbles:!0,composed:!0})),this._scheduleTocRebuild())}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(a=>clearTimeout(a)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((a,i)=>{a.timeoutSeconds&&a.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,i])},a.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,a)=>a!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){const t=e.theme?.toLowerCase()??"info";return t==="none"?"":t}_evalBannerText(e){return Ne(e,this.state,this.data)}_renderBanner(e,t){const a=this._evalBannerText(e.title),i=this._evalBannerText(e.description);return n`
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
                ${i?n`<p>${i}</p>`:d}
            </vaadin-card>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll("vaadin-card.mateu-section"))}_sectionTitle(e){const t=e.querySelector('[slot="title"]')?.textContent?.trim();return t||e.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()||void 0}_rebuildToc(){const e=this._sectionCards(),t=e.map(r=>({title:this._sectionTitle(r),el:r})).filter(r=>!!r.title),a=this.component?.metadata?.toc,i=t.length>4&&e.every(r=>!r.closest("vaadin-horizontal-layout")),s=(a===!0?!0:a===!1?!1:i)&&t.length>0;this._tocEntries=t,this._tocVisible=s,this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),s?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){const e=this.shadowRoot?.querySelector("mateu-content-header");this._headerH=this._tocVisible&&e?e.offsetHeight:0,this.style.setProperty("--mateu-header-h",this._headerH+"px");const t=12;let a=this._headerH+t;for(const i of this._sectionCards())i.classList.contains("mateu-section--sticky")&&(i.style.top=a+"px",a+=i.offsetHeight+t)}_scrollContainer(){let e=Na(this);for(;e;){const t=getComputedStyle(e).overflowY;if((t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight)return e;e=Na(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener("scroll",this._onScrollSpy,{passive:!0}),window.addEventListener("wheel",this._unlockToc,{passive:!0}),window.addEventListener("touchstart",this._unlockToc,{passive:!0}),window.addEventListener("keydown",this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener("scroll",this._onScrollSpy),window.removeEventListener("wheel",this._unlockToc),window.removeEventListener("touchstart",this._unlockToc),window.removeEventListener("keydown",this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){const t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;const a=12;let i=this._headerH+a;for(const l of this._sectionCards()){if(l===t.el)break;l.classList.contains("mateu-section--sticky")&&(i+=l.offsetHeight+a)}const s=this._scrollContainer(),r=s?s.getBoundingClientRect().top:0,o=t.el.getBoundingClientRect().top-r-i;(s??window).scrollBy({top:o,behavior:"smooth"})}render(){const e=this.component?.metadata,i=[...(e?.banners??[]).map((r,o)=>({banner:r,index:o})).filter(({index:r})=>!this.dismissedStaticBannerIndices.has(r)).map(({banner:r,index:o})=>({banner:r,onDismiss:()=>this._dismissStaticBanner(o)})),...this.actionBanners.map((r,o)=>({banner:r,onDismiss:()=>this._dismissActionBanner(o)}))],s=n`
            <mateu-content-header
                class="${this._tocVisible?"sticky-header":""}"
                .metadata="${e}"
                .baseUrl="${this.baseUrl}"
                .state="${this.state}"
                .data="${this.data}"
                .appState="${this.appState}"
                .appData="${this.appData}"
            ></mateu-content-header>
            ${i.length>0?n`
                <div class="page-banners">
                    ${i.map(({banner:r,onDismiss:o})=>this._renderBanner(r,o))}
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
                ${e?.footer?.map(r=>b(this,r,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `;return n`<vaadin-vertical-layout style="width: 100%;">${s}</vaadin-vertical-layout>`}};W.styles=R`
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
    `;te([u()],W.prototype,"component",2);te([u()],W.prototype,"baseUrl",2);te([u()],W.prototype,"state",2);te([u()],W.prototype,"data",2);te([u()],W.prototype,"appState",2);te([u()],W.prototype,"appData",2);te([u()],W.prototype,"value",2);te([u({type:Boolean})],W.prototype,"standalone",2);te([f()],W.prototype,"actionBanners",2);te([f()],W.prototype,"dismissedStaticBannerIndices",2);te([f()],W.prototype,"_tocEntries",2);te([f()],W.prototype,"_activeToc",2);te([f()],W.prototype,"_tocVisible",2);W=te([_("mateu-page")],W);const sa=R`
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
`,kt=e=>H`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,xa=kt(H`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),Sa=kt(H`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),ka=kt(H`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`),In=kt(H`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`),Tn=kt(H`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`),Rn=kt(H`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`);var Pn=Object.defineProperty,On=Object.getOwnPropertyDescriptor,he=(e,t,a,i)=>{for(var s=i>1?void 0:i?On(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Pn(t,a,s),s};const qa=["#e91e63","#1676f3","#10b981","#8b5cf6","#f59e0b","#ef4444"],Ln=e=>qa[Math.abs(e??0)%qa.length],Dn=e=>(e??"?").split(/\s+/).filter(t=>t).map(t=>t[0]).slice(0,2).join("").toUpperCase()||"?";let Z=class extends O{constructor(){super(...arguments),this.menu=[],this.chatSessionId=G(),this.menuContextSent=!1,this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onSpeechResult=e=>{if(this.recognition){const t=e,a=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=a,this.send(new CustomEvent("submit",{detail:{value:a},bubbles:!0,composed:!0})))}},this.send=async e=>{this.messageInputElement?.setAttribute("disabled","disabled");const t=e.detail.value.trim();if(!t||!this.sseUrl)return;this.addMessage(t,"user");const a=this.addMessage("","agent");this.startLoading();let i="";try{const s={Accept:"text/event-stream","Content-Type":"application/json"},r=localStorage.getItem("__mateu_auth_token");r&&(s.Authorization="Bearer "+r);const o=sessionStorage.getItem("__mateu_sesion_id");o&&(s["X-Session-Id"]=o);const l=JSON.stringify({message:t,sessionId:this.chatSessionId,...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;const c=await fetch(this.sseUrl,{method:"POST",headers:s,body:l});if(!c.ok){const $=await c.text();throw new Error(`Servidor respondió ${c.status}: ${$}`)}const h=c.body?.getReader();if(!h)throw new Error("No se pudo obtener el reader del stream.");const p=new TextDecoder;let v="";for(;;){const{done:$,value:k}=await h.read();if($){if(v.trim().startsWith("data:")){const F=v.trim().slice(5).trim(),U=this.tryParseTokenUsage(F),A=!U&&this.tryParseCustomEvent(F);U?this.tokenUsage={...this.tokenUsage,...U}:A?A.event==="agent-error"?(i="⚠️ "+(A.detail?.message??"Error desconocido del agente"),this.updateMessage(a,i)):this.dispatchEvent(new CustomEvent(A.event,{detail:A.detail,bubbles:!0,composed:!0})):(i+=F,this.updateMessage(a,i))}break}const S=p.decode(k,{stream:!0});v+=S;const g=v.split(`
`);v=g.pop()||"";let P=!1;for(const F of g)if(F.trim().startsWith("data:")){const U=F.trim().slice(5).trim(),A=this.tryParseTokenUsage(U),V=!A&&this.tryParseCustomEvent(U);A?this.tokenUsage={...this.tokenUsage,...A}:V?V.event==="agent-error"?(i="⚠️ "+(V.detail?.message??"Error desconocido del agente"),this.updateMessage(a,i)):this.dispatchEvent(new CustomEvent(V.event,{detail:V.detail,bubbles:!0,composed:!0})):(i+=U+`
`,P=!0)}P&&this.updateMessage(a,i)}i||this.updateMessage(a,"⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).")}catch(s){console.error("Error en el flujo SSE:",s);const r=s?.message??String(s);(r==="Failed to fetch"||r==="network error"||r==="Load failed")&&!i?this.updateMessage(a,"⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible."):this.updateMessage(a,"⚠️ Error: "+r)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value="")},250),this.messageInputElement?.removeAttribute("disabled"),this.messageInputElement?.focus()}},this.closeChat=()=>{this.dispatchEvent(new CustomEvent("close-requested",{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{const e=this.messageInputElement?.value?.trim()??"";e&&this.send(new CustomEvent("submit",{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key==="Enter"&&(e.preventDefault(),this.submitFromInput())}}connectedCallback(){super.connectedCallback();const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){const t=new e;this.recognition=t,t.lang="es-ES",t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=a=>{console.error("Error de reconocimiento: "+a.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:"smooth"})},0)}addMessage(e,t){const a={text:e,time:new Date().toLocaleTimeString(),userName:t.includes("agent")?"Asistente":"Tú",userColorIndex:t.includes("agent")?2:1};return this.items=[...this.items,a],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((a,i)=>i===e?{...a,text:t}:a),this.scrollBottom()}tryParseCustomEvent(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const a=JSON.parse(t);if(typeof a.event=="string")return{event:a.event,detail:a.detail??{}}}catch{}return null}tryParseTokenUsage(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const a=JSON.parse(t);if("inputTokens"in a||"outputTokens"in a||"totalTokens"in a)return a}catch{}return null}buildMenuContext(e,t=[]){const a=[];for(const i of e){if(i.separator||i.remote)continue;const s=[...t,i.label];if(i.submenus&&i.submenus.length>0)a.push(...this.buildMenuContext(i.submenus,s));else{const r={path:s,navigation:{route:i.route,consumedRoute:i.consumedRoute,actionId:i.actionId??"",baseUrl:i.baseUrl,serverSideType:i.serverSideType,uriPrefix:i.uriPrefix}};i.description&&(r.description=i.description),a.push(r)}}return a}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}render(){return n`
            <div class="chat-container">
                <div class="chat-header">
                    <span class="chat-title">AI Assistant</span>
                    <button class="chat-close" @click="${this.closeChat}" title="Cerrar">
                        ${Rn}
                    </button>
                </div>
                <div class="scroll-container">
                    <div class="message-list" role="list">
                        ${this.items.map(e=>n`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${Ln(e.userColorIndex)};">${Dn(e.userName)}</div>
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
                    >${Tn}</button>
                    <input class="msg-input"
                           placeholder="Message"
                           aria-label="Message"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">Send</button>
                </div>
            </div>
        `}};Z.styles=[sa,R`
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
    `];he([u()],Z.prototype,"sseUrl",2);he([u({attribute:!1})],Z.prototype,"menu",2);he([u()],Z.prototype,"items",2);he([Pe(".scroll-container")],Z.prototype,"scrollContainer",2);he([Pe(".msg-input")],Z.prototype,"messageInputElement",2);he([f()],Z.prototype,"recognition",2);he([f()],Z.prototype,"listening",2);he([f()],Z.prototype,"recognitionAvailable",2);he([f()],Z.prototype,"loading",2);he([f()],Z.prototype,"elapsedSeconds",2);he([f()],Z.prototype,"tokenUsage",2);Z=he([_("mateu-chat")],Z);var zn=Object.defineProperty,An=Object.getOwnPropertyDescriptor,Wt=(e,t,a,i)=>{for(var s=i>1?void 0:i?An(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&zn(t,a,s),s};let ut=class extends O{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.data&&this.createChart(this.data)}async createChart(e){const[{default:t}]=await Promise.all([ae(()=>import("./vendor-chartjs.js").then(i=>i.a),[]),ae(()=>import("./vendor-chartjs.js").then(i=>i.c),[])]);if(e!==this.data)return;this.chart&&this.chart.destroy();const a={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,a)}handleSlotChange(){}render(){return n`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};ut.styles=R`
  `;Wt([u()],ut.prototype,"type",2);Wt([u()],ut.prototype,"data",2);Wt([u()],ut.prototype,"options",2);Wt([Pe("#chart")],ut.prototype,"chartElement",2);ut=Wt([_("mateu-chart")],ut);var Fn=Object.defineProperty,Nn=Object.getOwnPropertyDescriptor,_a=(e,t,a,i)=>{for(var s=i>1?void 0:i?Nn(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Fn(t,a,s),s};let Ft=class extends O{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){const{default:t}=await ae(async()=>{const{default:i}=await import("./vendor-diagrams.js").then(s=>s.i);return{default:i}},__vite__mapDeps([4,3,1,2]));if(e!==this.xml)return;this.chart&&this.chart.destroy();const a={container:this.divElement};this.chart=new t(a),this.chart.importXML(e)}handleSlotChange(){}render(){return n`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};Ft.styles=R`
  `;_a([u()],Ft.prototype,"xml",2);_a([Pe("#canvas")],Ft.prototype,"divElement",2);Ft=_a([_("mateu-bpmn")],Ft);var qn=Object.defineProperty,Un=Object.getOwnPropertyDescriptor,_t=(e,t,a,i)=>{for(var s=i>1?void 0:i?Un(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&qn(t,a,s),s};const ha=160,Se=56,Mn=220,Ua=110,He=60,Bn={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},jn={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},Wn=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];function Vn(){return"step-"+Math.random().toString(36).slice(2,8)}let Qe=class extends O{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.wf={name:"New Workflow",steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value")){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){const e=this.wf.steps??[],t={};e.forEach(o=>{t[o.id]=0});let a=!0;for(;a;)a=!1,e.forEach(o=>{if(o.preconditionStepId!=null&&t[o.preconditionStepId]!==void 0){const l=t[o.preconditionStepId]+1;l>t[o.id]&&(t[o.id]=l,a=!0)}});const i={};e.forEach(o=>{const l=t[o.id]??0;(i[l]??=[]).push(o.id)});const s={...this.positions};let r=!1;Object.entries(i).forEach(([o,l])=>{const c=Number(o);l.forEach((h,p)=>{s[h]||(s[h]={x:He+c*Mn,y:He+p*Ua},r=!0)})}),r&&(this.positions=s)}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addStep(){const e=Vn(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(s=>s.y),i=a.length?Math.max(...a)+Ua:He;this.positions={...this.positions,[e]:{x:He,y:i}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(i=>i.id!==e).map(i=>i.preconditionStepId===e?{...i,preconditionStepId:void 0}:i)};const{[e]:t,...a}=this.positions;this.positions=a,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},i=this.toSvgPoint(e);this.dragOffset={x:i.x-a.x,y:i.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(i=>i.x))+ha+He:600,a=e.length?Math.max(...e.map(i=>i.y))+Se+He:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return n`
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
                    ${xa}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${Sa}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${ka}
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
        `}renderArrow(e){if(!e.preconditionStepId)return H``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return H``;const i=t.x+ha,s=t.y+Se/2,r=a.x,o=a.y+Se/2,l=(i+r)/2;return H`
            <path d="M${i},${s} C${l},${s} ${l},${o} ${r},${o}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:He,y:He},a=Bn[e.type]??"#64748b",i=jn[e.type]??"•",s=this.selectedId===e.id;return H`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${r=>this.onNodeMouseDown(r,e.id)}"
               @click="${r=>{r.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${ha}" height="${Se}" rx="8"
                      fill="white"
                      stroke="${s?a:"#e2e8f0"}"
                      stroke-width="${s?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${Se}" rx="8" fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${Se}" fill="${a}"/>
                <text x="16" y="${Se/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${i}</text>
                <!-- name -->
                <text x="44" y="${Se/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+"…":e.name}
                </text>
                <text x="44" y="${Se/2+8}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${Se/2+20}" font-size="9" fill="${a}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(i=>i.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(i=>i.id!==e.id),a=(i,s)=>n`
            <div class="field">
                <label class="field-label">${i}</label>
                ${s}
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
                            ${Wn.map(i=>n`<option value="${i}" ?selected="${e.type===i}">${i}</option>`)}
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
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",i.click(),URL.revokeObjectURL(a)}};Qe.styles=[sa,R`
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
    `];_t([u()],Qe.prototype,"value",2);_t([f()],Qe.prototype,"wf",2);_t([f()],Qe.prototype,"positions",2);_t([f()],Qe.prototype,"selectedId",2);_t([f()],Qe.prototype,"showMeta",2);Qe=_t([_("mateu-workflow")],Qe);var Hn=Object.defineProperty,Gn=Object.getOwnPropertyDescriptor,Ue=(e,t,a,i)=>{for(var s=i>1?void 0:i?Gn(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Hn(t,a,s),s};const Tt=160,ve=56,Ge=60,Kn={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},Jn={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},Yn=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];let ua;const Xn=()=>(ua||(ua=ae(()=>import("./vendor-diagrams.js").then(e=>e.e),__vite__mapDeps([4,3,1,2])).then(e=>new e.default)),ua);function Qn(){return"step-"+Math.random().toString(36).slice(2,8)}let $e=class extends O{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.readOnly=!1,this.wf={name:"New Workflow",steps:[]},this.positions={},this.layoutReady=!1,this.selectedId=null,this.showMeta=!1,this.layoutError=null,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.elkPositioned=new Set,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.elkPositioned.add(this.draggingId),this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value"))try{const t=JSON.parse(this.value),a=new Set((this.wf.steps??[]).map(r=>r.id)),i=new Set((t.steps??[]).map(r=>r.id)),s=a.size!==i.size||[...i].some(r=>!a.has(r))||[...i].some(r=>{const o=(this.wf.steps??[]).find(c=>c.id===r),l=(t.steps??[]).find(c=>c.id===r);return o?.preconditionStepId!==l?.preconditionStepId});this.wf=t,(s||!this.layoutReady)&&this.runElkLayout()}catch{}}async runElkLayout(){const e=this.wf.steps??[];if(e.length===0){this.positions={},this.layoutReady=!0;return}const t={id:"root",layoutOptions:{"elk.algorithm":"layered","elk.direction":"RIGHT","elk.spacing.nodeNode":"40","elk.layered.spacing.nodeNodeBetweenLayers":"80","elk.edgeRouting":"ORTHOGONAL","elk.layered.nodePlacement.strategy":"BRANDES_KOEPF"},children:e.map(a=>({id:a.id,width:Tt,height:ve})),edges:e.filter(a=>a.preconditionStepId).map(a=>({id:`${a.preconditionStepId}->${a.id}`,sources:[a.preconditionStepId],targets:[a.id]}))};try{const i=await(await Xn()).layout(t),s={...this.positions};for(const r of i.children??[])(!this.elkPositioned.has(r.id)||!s[r.id])&&(s[r.id]={x:(r.x??0)+Ge,y:(r.y??0)+Ge},this.elkPositioned.add(r.id));this.positions=s,this.layoutReady=!0,this.layoutError=null}catch(a){this.layoutError=a?.message??"ELK layout failed",this.layoutReady=!0}}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){const a=this.wf.steps.map(r=>r.id===e?{...r,...t}:r),i=this.wf.steps.find(r=>r.id===e),s=t.preconditionStepId!==void 0&&t.preconditionStepId!==i?.preconditionStepId;this.wf={...this.wf,steps:a},s&&(this.elkPositioned.clear(),this.runElkLayout()),this.emit()}addStep(){const e=Qn(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(i=>i.x);this.positions={...this.positions,[e]:{x:a.length?Math.max(...a)+Tt+80:Ge,y:Ge}},this.selectedId=e,this.elkPositioned.clear(),this.runElkLayout(),this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(i=>i.id!==e).map(i=>i.preconditionStepId===e?{...i,preconditionStepId:void 0}:i)};const{[e]:t,...a}=this.positions;this.positions=a,this.elkPositioned.delete(e),this.selectedId===e&&(this.selectedId=null),this.runElkLayout(),this.emit()}onNodeMouseDown(e,t){if(this.readOnly)return;e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},i=this.toSvgPoint(e);this.dragOffset={x:i.x-a.x,y:i.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}relayout(){this.elkPositioned.clear(),this.runElkLayout()}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(i=>i.x))+Tt+Ge:600,a=e.length?Math.max(...e.map(i=>i.y))+ve+Ge:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){if(!this.layoutReady)return n`<div class="loading">Computing layout…</div>`;const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return n`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():""}
                ${this.layoutError?n`<div class="error">⚠ ${this.layoutError}</div>`:""}
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
        `}renderToolbar(){const e=this.wf.status??"DRAFT";return n`
            <div class="toolbar">
                <span class="wf-name">${this.wf.name}</span>
                <span class="badge badge-${e.toLowerCase()}">${e}</span>
                <div style="flex:1"></div>
                <button class="nbtn" title="Re-run ELK layout"
                        @click="${()=>this.relayout()}">
                    ${In}
                    Re-layout
                </button>
                ${this.readOnly?d:n`
                    <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                        ${xa}
                        Settings
                    </button>
                    <button class="nbtn primary" @click="${()=>this.addStep()}">
                        ${Sa}
                        Add Step
                    </button>
                `}
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${ka}
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
        `}renderArrow(e){if(!e.preconditionStepId)return H``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return H``;const i=t.x+Tt,s=t.y+ve/2,r=a.x,o=a.y+ve/2,l=(i+r)/2;return H`
            <path d="M${i},${s} C${l},${s} ${l},${o} ${r},${o}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:Ge,y:Ge},a=Kn[e.type]??"#64748b",i=Jn[e.type]??"•",s=this.selectedId===e.id,r=e.name.length>16?e.name.slice(0,15)+"…":e.name;return H`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${o=>this.onNodeMouseDown(o,e.id)}"
               @click="${o=>{o.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${Tt}" height="${ve}" rx="8"
                      fill="white"
                      stroke="${s?a:"#e2e8f0"}"
                      stroke-width="${s?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge strip -->
                <rect x="0" y="0" width="32" height="${ve}" rx="8"
                      fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${ve}" fill="${a}"/>
                <text x="16" y="${ve/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${i}</text>
                <!-- labels -->
                <text x="44" y="${ve/2-6}" font-size="11"
                      fill="#1e293b" font-weight="600">${r}</text>
                <text x="44" y="${ve/2+8}" font-size="9"
                      fill="#94a3b8">${e.id}</text>
                <text x="44" y="${ve/2+20}" font-size="9"
                      fill="${a}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(s=>s.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(s=>s.id!==e.id),a=this.readOnly,i=(s,r)=>n`
            <div class="field">
                <label class="field-label">${s}</label>
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
                    ${i("ID",n`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${i("Name",n`<input class="inp" ?readonly="${a}" .value="${e.name}"
                        @change="${a?d:s=>this.updateStep(e.id,{name:s.target.value})}"/>`)}
                    ${i("Type",n`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?d:s=>this.updateStep(e.id,{type:s.target.value})}">
                            ${Yn.map(s=>n`
                                <option value="${s}" ?selected="${e.type===s}">${s}</option>`)}
                        </select>`)}
                    ${i("Description",n`<textarea class="inp" rows="2" ?readonly="${a}"
                        @change="${a?d:s=>this.updateStep(e.id,{description:s.target.value})}">${e.description??""}</textarea>`)}
                    ${i("Precondition step",n`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?d:s=>this.updateStep(e.id,{preconditionStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>n`
                                <option value="${s.id}" ?selected="${e.preconditionStepId===s.id}">
                                    ${s.name} (${s.id})
                                </option>`)}
                        </select>`)}
                    ${i("Precondition expression",n`
                        <input class="inp" placeholder="JEXL expression" ?readonly="${a}"
                               .value="${e.preconditionExpression??""}"
                               @change="${a?d:s=>this.updateStep(e.id,{preconditionExpression:s.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}" ?disabled="${a}"
                               @change="${a?d:s=>this.updateStep(e.id,{parallel:s.target.checked})}"/>
                    </div>
                    ${i("Timeout (ms)",n`
                        <input class="inp" type="number" min="0" ?readonly="${a}"
                               .value="${String(e.timeout??0)}"
                               @change="${a?d:s=>this.updateStep(e.id,{timeout:Number(s.target.value)})}"/>`)}
                    ${i("Retries",n`
                        <input class="inp" type="number" min="0" ?readonly="${a}"
                               .value="${String(e.retries??0)}"
                               @change="${a?d:s=>this.updateStep(e.id,{retries:Number(s.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}" ?disabled="${a}"
                               @change="${a?d:s=>this.updateStep(e.id,{rollbackable:s.target.checked})}"/>
                    </div>
                    ${e.rollbackable?i("Compensation step",n`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?d:s=>this.updateStep(e.id,{compensationStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>n`
                                <option value="${s.id}" ?selected="${e.compensationStepId===s.id}">
                                    ${s.name} (${s.id})
                                </option>`)}
                        </select>`):""}
                    ${e.type==="ACTION"?i("Topic",n`
                        <input class="inp" placeholder="kafka.topic.name" ?readonly="${a}"
                               .value="${e.topic??""}"
                               @change="${a?d:s=>this.updateStep(e.id,{topic:s.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?i("Form ID",n`
                        <input class="inp" ?readonly="${a}" .value="${e.formId??""}"
                               @change="${a?d:s=>this.updateStep(e.id,{formId:s.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?i("Child workflow ID",n`
                        <input class="inp" ?readonly="${a}" .value="${e.childWorkflowDefinitionId??""}"
                               @change="${a?d:s=>this.updateStep(e.id,{childWorkflowDefinitionId:s.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",i.click(),URL.revokeObjectURL(a)}};$e.styles=[sa,R`
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
    `];Ue([u()],$e.prototype,"value",2);Ue([u({type:Boolean})],$e.prototype,"readOnly",2);Ue([f()],$e.prototype,"wf",2);Ue([f()],$e.prototype,"positions",2);Ue([f()],$e.prototype,"layoutReady",2);Ue([f()],$e.prototype,"selectedId",2);Ue([f()],$e.prototype,"showMeta",2);Ue([f()],$e.prototype,"layoutError",2);$e=Ue([_("mateu-workflow-elk")],$e);var Zn=Object.defineProperty,eo=Object.getOwnPropertyDescriptor,Vt=(e,t,a,i)=>{for(var s=i>1?void 0:i?eo(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Zn(t,a,s),s};const to=["string","integer","number","bool","date","time","dateTime","dateRange","money","file","array","status","component","menu","range","action","actionGroup"],ao=["regular","radio","checkbox","textarea","toggle","combobox","select","email","password","richText","listBox","html","markdown","image","icon","link","money","grid","color","choice","popover","slider","button","stars"],io={string:"#3B82F6",integer:"#8B5CF6",number:"#6366F1",bool:"#10B981",date:"#F59E0B",time:"#F59E0B",dateTime:"#F59E0B",dateRange:"#F59E0B",money:"#EF4444",file:"#64748B",array:"#0EA5E9",status:"#EC4899",component:"#14B8A6",menu:"#94A3B8",range:"#A855F7",action:"#F97316",actionGroup:"#FB923C"};function Ma(){return"field-"+Math.random().toString(36).slice(2,8)}let pt=class extends O{constructor(){super(...arguments),this.value='{"name":"New Form","fields":[]}',this.form={name:"New Form",fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has("value"))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){const e=this.shadowRoot?.querySelector(".field-list");!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=wi.create(e,{animation:150,handle:".drag-handle",ghostClass:"sortable-ghost",onEnd:t=>{const{oldIndex:a,newIndex:i}=t;if(a===void 0||i===void 0||a===i)return;const s=[...this.form.fields],[r]=s.splice(a,1);s.splice(i,0,r),this.form={...this.form,fields:s},this.emit()}}))}emit(){const e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addField(){const e=Ma(),t={id:e,label:"New Field",dataType:"string"};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){const t=this.form.fields.find(r=>r.id===e);if(!t)return;const a={...t,id:Ma(),label:t.label+" (copy)"},i=this.form.fields.findIndex(r=>r.id===e),s=[...this.form.fields];s.splice(i+1,0,a),this.form={...this.form,fields:s},this.selectedId=a.id,this.emit()}render(){return n`
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
                    ${xa}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${Sa}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${ka}
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
        `}renderRow(e){const t=io[e.dataType]??"#64748b",a=this.selectedId===e.id;return n`
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
                            ${to.map(a=>n`
                                <option value="${a}" ?selected="${e.dataType===a}">${a}</option>`)}
                        </select>`)}
                    ${t("Stereotype",n`
                        <select class="inp"
                                @change="${a=>this.updateField(e.id,{stereotype:a.target.value||void 0})}">
                            ${ao.map(a=>n`
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
        `}exportJson(){const e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=(this.form.name??"form").replace(/\s+/g,"-").toLowerCase()+".json",i.click(),URL.revokeObjectURL(a)}};pt.styles=[sa,R`
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
    `];Vt([u()],pt.prototype,"value",2);Vt([f()],pt.prototype,"form",2);Vt([f()],pt.prototype,"selectedId",2);Vt([f()],pt.prototype,"showMeta",2);pt=Vt([_("mateu-form-editor")],pt);var so=Object.defineProperty,ro=Object.getOwnPropertyDescriptor,De=(e,t,a,i)=>{for(var s=i>1?void 0:i?ro(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&so(t,a,s),s};let le=class extends O{constructor(){super(...arguments),this.appState={},this.appData={},this.open=!1,this.activeTab="appstate",this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith("mateu-")&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset="",this._prevTarget=null,this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset=""),this._prevTarget=t,t.style.outline="2px solid #0070f3",t.style.outlineOffset="-2px",this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||"",this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener("mouseover",this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mouseover",this._onMouseover,!0),this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget=null)}_fmt(e){try{return JSON.stringify(e,null,2)??"null"}catch{return String(e)}}_renderTab(e,t){return n`
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
        `}};le.styles=R`
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
    `;De([u()],le.prototype,"appState",2);De([u()],le.prototype,"appData",2);De([f()],le.prototype,"open",2);De([f()],le.prototype,"activeTab",2);De([f()],le.prototype,"hoveredTag",2);De([f()],le.prototype,"hoveredId",2);De([f()],le.prototype,"hoveredState",2);De([f()],le.prototype,"hoveredData",2);De([f()],le.prototype,"hoveredMeta",2);le=De([_("mateu-debug-overlay")],le);var fe=(e=>(e.SetAppDataValue="SetAppDataValue",e.SetAppStateValue="SetAppStateValue",e.SetDataValue="SetDataValue",e.RunAction="RunAction",e.RunJS="RunJS",e.SetAttributeValue="SetAttributeValue",e.SetStateValue="SetStateValue",e.SetCssClass="SetCssClass",e.SetStyle="SetStyle",e))(fe||{}),ci=(e=>(e.required="required",e.disabled="disabled",e.hidden="hidden",e.pattern="pattern",e.minValue="minValue",e.maxValue="maxValue",e.minLength="minLength",e.maxLength="maxLength",e.css="css",e.style="style",e.theme="theme",e.errorMessage="errorMessage",e.description="description",e.none="none",e))(ci||{}),hi=(e=>(e.Continue="Continue",e.Stop="Stop",e))(hi||{}),no=Object.defineProperty,oo=Object.getOwnPropertyDescriptor,ra=(e,t,a,i)=>{for(var s=i>1?void 0:i?oo(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&no(t,a,s),s};let Rt=null,wt=class extends vt{constructor(){super(...arguments),this.baseUrl="",this.route="",this.consumedRoute="",this.formerState={},this.applyRules=()=>{const e=this.component.rules;if(e&&e.length>0){const t=this.state,a=this.data,i=this.appState,s=this.appData,r=this.component,o=S=>Xa(S,t,a,{appState:i,appData:s,component:r}),l=S=>Ya(S,t,a,i,s,{component:r}),c=["state","data","appState","appData","component"],h=[t,a,i,s,r],p={...this.state},v={...this.data};let $=!1,k=!1;for(let S=0;S<e.length;S++){const g=e[S];try{if(o(g.filter)){if(fe.SetStateValue==g.action||fe.SetDataValue==g.action){const P=fe.SetStateValue==g.action?p:v,F=g.fieldName.split(",");for(let U=0;U<F.length;U++){const A=F[U];if(!P[A]||P[A]!=g.value){const V=g.expression?l(g.expression):g.value,at=ci.none==g.fieldAttribute?A:A+"."+g.fieldAttribute;V!=P[at]&&(P[at]=V,fe.SetStateValue==g.action&&($=!0),fe.SetDataValue==g.action&&(k=!0))}}}if(fe.RunAction==g.action&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:g.actionId},bubbles:!0,composed:!0})),fe.RunJS==g.action&&new Function(...c,g.value)(...h),fe.SetAttributeValue==g.action){const P=g.expression?o(g.expression):g.value;if(g.fieldAttribute=="disabled"){P?this.shadowRoot?.getElementById(g.fieldName)?.setAttribute(g.fieldAttribute,"disabled"):this.shadowRoot?.getElementById(g.fieldName)?.removeAttribute(g.fieldAttribute);continue}this.shadowRoot?.getElementById(g.fieldName)?.setAttribute(g.fieldAttribute,P)}if(fe.SetCssClass==g.action&&this.shadowRoot?.getElementById(g.fieldName)?.setAttribute("class",g.value),fe.SetStyle==g.action&&this.shadowRoot?.getElementById(g.fieldName)?.style.setProperty(g.expression,g.value),hi.Stop==g.result)break}}catch(P){console.error("rule failed",g,P)}}$&&(this.state=p),k&&(this.data=v),$&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes("-"),this.checkValidations=e=>{const t=e?e.split(","):void 0,a=this.component.validations;let i=!0,s=!1;const r=this.data??{},o={...this.data??{},errors:{}};if(a){for(let l=0;l<a.length;l++){const c=a[l];if(this.skipValidation(t,c))continue;const h=(c.fieldId??"_component").split(",");for(let p=0;p<h.length;p++){const v=h[p];o.errors[v]=[]}}for(let l=0;l<a.length;l++){const c=a[l];if(!this.skipValidation(t,c))try{const h=c.condition&&c.condition.includes("${")?this._evalTemplate(c.condition):this._evalExpr(c.condition);if(c.condition&&!h){i=!1;const v=(c.fieldId??"_component").split(",");for(let $=0;$<v.length;$++){const k=v[$];let S=o.errors[k];if(S||(o.errors[k]=[]),S=o.errors[k],!r[k]){let g=c.message;try{g=this._evalTemplate(c.message)}catch{}S.push(g)}}}}catch(h){console.error("validation failed",c,h)}}for(let l=0;l<a.length;l++){const c=a[l];if(this.skipValidation(t,c))continue;const h=(c.fieldId??"_component").split(",");for(let p=0;p<h.length;p++){const v=h[p];if(r.errors?[v].join(","):o.errors==""&&[v].join(",")){s=!0;break}}}(r.errors?["_component"].join(","):o.errors==""&&["_component"].join(","))&&(s=!0)}o._valid=i,o._valid!=r._valid&&(s=!0),s&&(this.data=o)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};t.fieldIds.forEach(i=>{a[i]=void 0}),a.searchText=void 0,this.state={...this.state,...a}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};a[t.key]=t.value,e.type=="data-changed"&&(this.data={...this.data,...a})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail;if(e.type=="value-changed"){const a={...this.state};a[t.fieldId]=t.value,this.state=a,(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("dirty",{detail:e.detail,bubbles:!0,composed:!0}));const i=this.component;i.triggers?.filter(s=>s.type==Ke.OnValueChange).filter(s=>!s.propertyName||t.fieldId==s.propertyName).forEach(s=>{(!s.condition||this._evalExpr(s.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))}),i.triggers?.filter(s=>s.type==Ke.AutoSave).forEach(s=>{const r=s.actionId,o=this._autoSaveTimers.get(r);o!==void 0&&clearTimeout(o),this._autoSaveTimers.set(r,setTimeout(()=>{this._autoSaveTimers.delete(r),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))},s.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{const t=e.detail;if(e.type=="action-requested"){e.preventDefault(),e.stopPropagation();const a=this.component,i=a.actions?.find(s=>s.id==t.actionId||s.id.endsWith("*")&&t.actionId.startsWith(s.id.replace("*","")));if(i){if(i&&i.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify("You first need to select some rows");return}if(i&&i.validationRequired){const r=Rt??this;if(Rt=null,r.checkValidations(i.fieldsToValidate),!r.data._valid){r.notifyValidationErrors();return}}Rt=null;const s={...t,initiatorComponentId:this.id};i&&i.confirmationRequired?this.callAfterConfirmation(i,()=>this.requestActionCallToServerOrBubble(s,a,i)):this.requestActionCallToServerOrBubble(s,a,i)}else{const s={...t.parameters};s.initiatorState||(s.initiatorState=this.state),Rt||(Rt=this),this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,parameters:s},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{const e={},t=a=>{if(a)for(const i of a){const s=i.metadata;if(s?.type===m.FormField){const r=s;r.fieldId&&r.label&&(e[r.fieldId]=r.label)}t(i.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{const e=this.data?.errors??{},t=this.buildFieldLabelMap(),a=[];if(Object.entries(e).forEach(([s,r])=>{if(!Array.isArray(r))return;const o=s==="_component"?void 0:t[s]??s;r.forEach(l=>{l&&!a.some(c=>c.label===o&&c.msg===l)&&a.push({label:o,msg:l})})}),a.length===0){this.notify("There are validation errors");return}const i=document.createElement("vaadin-notification");i.position="bottom-end",i.setAttribute("theme","error"),i.duration=Math.max(3e3,1500+a.length*1e3),i.renderer=s=>{Va(n`
                <vaadin-vertical-layout style="gap: var(--lumo-space-xs);">
                    <strong>There are validation errors</strong>
                    ${a.map(({label:r,msg:o})=>r?n`<span>• <b>${r}:</b> ${o}</span>`:n`<span>• ${o}</span>`)}
                </vaadin-vertical-layout>
            `,s)},document.body.appendChild(i),i.opened=!0,i.addEventListener("opened-changed",s=>{s.detail.value||document.body.removeChild(i)})},this.notify=e=>{Ut.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.callAfterConfirmation=(e,t)=>{let a="One moment, please",i="Are you sure?",s="Yes",r="No";e.confirmationTexts&&(a=e.confirmationTexts.title,i=e.confirmationTexts.message,s=e.confirmationTexts.confirmationText,r=e.confirmationTexts.denialText);const o=document.createElement("vaadin-confirm-dialog");o.setAttribute("header",a),o.setAttribute("cancel-button-visible","cancel-button-visible"),o.setAttribute("confirm-text",s),o.setAttribute("cancel-text",r),o.append(i),o.opened=!0,o.addEventListener("confirm",()=>t()),o.addEventListener("close",()=>document.body.removeChild(o)),o.addEventListener("confirm",()=>document.body.removeChild(o)),o.addEventListener("cancel",()=>document.body.removeChild(o)),o.addEventListener("reject",()=>document.body.removeChild(o)),document.body.append(o)},this.requestActionCallToServerOrBubble=(e,t,a)=>{if(a&&a.bubble){const i={...e.parameters};i.initiatorState||(i.initiatorState=this.state),this.dispatchEvent(new CustomEvent("action-requested",{detail:{...e,parameters:i},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,a)},this.requestActionCallToServer=(e,t,a)=>{if(a&&a.href){window.location.href=a.href;return}if(a&&a.js)try{new Function("state","data","appState","appData","component",a.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(i){console.error("when evaluating "+a.js,i,this.component,this.state,this.data)}if(a&&a.customEvent&&this.dispatchEvent(new CustomEvent(a.customEvent.name,{detail:a.customEvent.detail,bubbles:!0,composed:!0})),!(a&&(a.js||a.customEvent))){if(e.actionId=="search"){const i=e.parameters?._searchState;i?this.state={...this.state,...i}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}this.dispatchEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:{...this.state},parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:a?.background,sse:a?.sse,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))}},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(i=>i.type==Ke.OnSuccess).filter(i=>e.detail.actionId==i.calledActionId).forEach(i=>{if(!i.condition||this._evalExpr(i.condition))if(e.preventDefault(),e.stopPropagation(),i.timeoutMillis>0){const s=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId,callbackToken:s},bubbles:!0,composed:!0}))},i.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(i=>i.type==Ke.OnError).filter(i=>e.detail.actionId==i.calledActionId).forEach(i=>{(!i.condition||this._evalExpr(i.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0})))})},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;const t=this.component;if(t)for(const a of t.actions??[]){const i=a.shortcut||(a.runOnEnter?"enter":null);if(i&&this._shortcutMatchesEvent(i,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return q.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has("state")&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has("component")&&(this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}_shortcutMatchesEvent(e,t){return Es(e,t)}_handleTabShortcut(e){const t=this.renderRoot?.querySelectorAll("vaadin-tab[data-shortcut]");if(!t||t.length===0)return!1;for(const a of Array.from(t)){const i=a.dataset.shortcut;if(!i||!this._shortcutMatchesEvent(i,e))continue;const s=a.closest("vaadin-tabs");if(!s)continue;const r=Array.from(s.querySelectorAll("vaadin-tab")).indexOf(a);if(!(r<0))return e.preventDefault(),s.selected=r,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.addEventListener("backend-call-failed",this.handleBackendFailed),document.addEventListener("keydown",this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.removeEventListener("backend-call-failed",this.handleBackendFailed),document.removeEventListener("keydown",this._keydownListener)}render(){return n`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?n`
                <div><ul>${this.data.errors._component.map(e=>n`<li>${e}</li>`)}</ul></div>
            `:d}</div>`}_render(){if(this.component?.type==Y.ClientSide){const e=this.component;return e.metadata?.type==m.Page?ma(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==m.Crud?va(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):q.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return n`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==Y.ClientSide){const t=e;if(t.metadata?.type==m.Page)return ma(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==m.Crud)return va(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return b(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}};wt.styles=R`
        :host {
        }

        ${vi(et.cssText)}
        
        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }
        
  `;ra([u()],wt.prototype,"baseUrl",2);ra([u()],wt.prototype,"route",2);ra([u()],wt.prototype,"consumedRoute",2);wt=ra([_("mateu-component")],wt);const Ba=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}};class lo{async handle(t,a){return await t.runAction(a.baseUrl,a.route,a.consumedRoute,a.actionId,a.initiatorComponentId,a.appState,a.serverSideType,a.componentState,a.parameters,a.initiator,a.background)}}const co=new lo;class ho{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,a,i)=>{if(t?.fragments?.forEach(s=>{Ye.next({command:void 0,fragment:s,ui:void 0,error:void 0,callbackToken:i})}),t?.appState&&(j.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const s=t?.appData;Dt.value={...t.appData,...s},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}t?.messages?.forEach(s=>{Ut.show(s.text,{position:s.position?this.mapPosition(s.position):void 0,theme:s.variant,duration:s.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(s=>{Ye.next({command:s,fragment:void 0,ui:void 0,error:void 0,callbackToken:i})})}}async runAction(t,a,i,s,r,o,l,c,h,p,v,$,k,S,g){try{const P=await co.handle(t,{baseUrl:a,route:i,consumedRoute:s,actionId:r,appState:j.value,initiatorComponentId:o,componentState:h,parameters:p,serverSideType:c,initiator:v,background:$});k&&k(P),S||this.handleUIIncrement(P,v,g),P.messages&&P.messages.length==1&&P.messages[0].variant=="error"&&v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r,evevntId:G()},bubbles:!0,composed:!0}))}catch(P){console.warn("Action request failed",P),v.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(P)}})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}}serialize(t){return t?.message?t:JSON.stringify(t)}}const uo=new ho,po=uo;class mo{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,a,i)=>{if(t?.messages?.forEach(s=>{Ut.show(s.text,{position:s.position?this.mapPosition(s.position):"bottom-end",theme:s.variant,duration:s.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(s=>{Ye.next({command:s,fragment:void 0,ui:void 0,error:void 0,callbackToken:i})}),t?.fragments?.forEach(s=>{Ye.next({command:void 0,fragment:s,ui:void 0,error:void 0,callbackToken:i})}),t?.appState&&(j.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const s=t?.appData;Dt.value={...t.appData,...s},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}}}async runAction(t,a,i,s,r,o,l,c,h,p,v,$,k,S,g){if(i){i=i||"_no_route",i&&i.startsWith("/")&&(i=i.substring(1));const P={serverSideType:c,appState:j.value,componentState:h,parameters:p,initiatorComponentId:o,consumedRoute:s,route:"/"+i,actionId:r};$||v.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),fetch(a+"/mateu/v3/sse/"+i,{method:"POST",headers:{Accept:"text/event-stream","Content-Type":"application/json"},body:JSON.stringify(P)}).then(async F=>{const U=F.body?.pipeThrough(new TextDecoderStream).getReader();if(U){let A="";for(;;){const{value:V,done:at}=await U.read();if(at)break;A+=V;const Et=A.split(`

`);A=Et.pop()??"";for(const Ht of Et){const y=Ht.trim();if(y)if(y.startsWith("data:")){const I=JSON.parse(y.substring(5).trim());k&&k(I),S||this.handleUIIncrement(I,v,g),I.messages&&I.messages.length==1&&I.messages[0].variant=="error"&&v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}else{let I=y;try{const w=JSON.parse(y);I=w.message,w._embedded?.errors?.length>0&&w._embedded.errors[0].message&&(I=w._embedded.errors[0].message)}catch{}throw new Error(I)}}}}$||v.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:r}})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r},bubbles:!0,composed:!0}))}).catch(F=>{v.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(F)}})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))})}}serialize(t){return t?.message?t:JSON.stringify(t)}}const vo=new mo;var fo=Object.defineProperty,bo=Object.getOwnPropertyDescriptor,ue=(e,t,a,i)=>{for(var s=i>1?void 0:i?bo(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&fo(t,a,s),s};let ee=class extends ea{constructor(){super(...arguments),this.consumedRoute="",this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t=="string"&&t.startsWith("/")&&this.consumedRoute&&this.consumedRoute!=="_empty"&&this.consumedRoute.startsWith("/")&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t.startsWith("/")&&this.uriPrefix.endsWith("/")?t=this.uriPrefix+t.substring(1):!t.startsWith("/")&&!this.uriPrefix.endsWith("/")?t=this.uriPrefix+"/"+t:t=this.uriPrefix+t),this.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==""&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:Y.ClientSide,metadata:{type:m.Element,name:"div",content:"Not found"},id:"fieldId"},action:At.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;const t=this.detail1;if(e.type=="server-side-action-requested"){let a=po;t.sse&&(a=vo),a.runAction(si,this.baseUrl,t.route??"",t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken)}},this.getCustomisedAppState=()=>{let e={...j.value};if(this.overrides){const t=Ba(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw new Error("Method not implemented.")}createRenderRoot(){return q.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.overridesParsed=Ba(this.overrides),this.addEventListener("server-side-action-requested",this.actionRequestedListener),this.addEventListener("backend-call-failed",this.backendFailedListener),this.addEventListener("history-pushed",this.historyPushed),this.addEventListener("route-changed",this.routeChangedListener),window.Vaadin.featureFlags.masterDetailLayoutComponent=!0}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.actionRequestedListener),this.removeEventListener("backend-call-failed",this.backendFailedListener),this.removeEventListener("history-pushed",this.historyPushed),this.removeEventListener("route-changed",this.routeChangedListener)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(a=>a==="appState"||a==="appData")){const a=this.renderRoot.querySelector("mateu-component");if(a)return e.has("appState")&&(a.appState=this.appState),e.has("appData")&&(a.appData=this.appData),!1}return!0}updated(e){(e.has("id")||e.has("baseurl")||e.has("route")||e.has("consumedRoute")||e.has("instant"))&&(this.preventNavigation||(this.callbackToken=this.instant||G(),this.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:"",serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,callbackToken:this.callbackToken},bubbles:!0,composed:!0})))),e.has("route")&&this.top&&(this.preventNavigation||this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&(this.preventNavigation=!1)}applyFragment(e){this.fragment=e}render(){return n`
           ${this.fragment?.component?b(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):d}
       `}};ee.styles=R`
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
  `;ue([u()],ee.prototype,"consumedRoute",2);ue([u()],ee.prototype,"serverSideType",2);ue([u()],ee.prototype,"uriPrefix",2);ue([u()],ee.prototype,"overrides",2);ue([u()],ee.prototype,"homeRoute",2);ue([u()],ee.prototype,"route",2);ue([u()],ee.prototype,"top",2);ue([u()],ee.prototype,"instant",2);ue([u()],ee.prototype,"appState",2);ue([u()],ee.prototype,"appData",2);ue([f()],ee.prototype,"fragment",2);ee=ue([_("mateu-ux")],ee);var go=Object.defineProperty,pe=(e,t,a,i)=>{for(var s=void 0,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=o(t,a,s)||s);return s&&go(t,a,s),s};class re extends Mt{constructor(){super(...arguments),this.baseUrl="",this.route="",this.consumedRoute="",this.state={},this.appState={},this.appData={},this.selectedRoute=void 0,this.selectedConsumedRoute=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedUriPrefix=void 0,this.instant=void 0,this.lastActionServerSideType=void 0,this.lastActionInitiatorComponentId=void 0,this.captureActionSST=t=>{const a=t.detail;a?.serverSideType&&(this.lastActionServerSideType=a.serverSideType,this.lastActionInitiatorComponentId=a.initiatorComponentId)},this.handleUnhandledAction=t=>{const a=t.detail;t.preventDefault(),t.stopPropagation();const i=this.renderRoot?.querySelector("#ux_"+this.id);!i||typeof i.manageActionEvent!="function"||(this.lastActionServerSideType=this.selectedServerSideType,this.lastActionInitiatorComponentId=i.id,i.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:i.route??this.selectedRoute??"",consumedRoute:i.consumedRoute??this.selectedConsumedRoute??"",componentState:a.parameters?.initiatorState??{},parameters:a.parameters,actionId:a.actionId,serverSideType:this.selectedServerSideType??"",initiatorComponentId:i.id,initiator:i}})))},this.updateRoute=t=>{t.preventDefault(),t.stopPropagation();const a=t.detail;this.selectedConsumedRoute=a.consumedRoute,this.selectedBaseUrl=a.baseUrl,this.selectedRoute=a.route,this.selectedServerSideType=a.serverSideType,this.selectedUriPrefix=a.uriPrefix,this.instant=G()}}appMetadata(){return this.component?.metadata}isActive(t){const a=this.appMetadata();return this.selectedRoute===t.path?!0:!this.selectedRoute&&this.route===this.consumedRoute&&t.path===a?.homeRoute}connectedCallback(){super.connectedCallback(),this.addEventListener("server-side-action-requested",this.captureActionSST,!0),this.addEventListener("action-requested",this.handleUnhandledAction),this.innerFragmentSubscription=Ye.subscribe(t=>{const a=t.fragment;if(a&&this.lastActionInitiatorComponentId&&a.targetComponentId===this.lastActionInitiatorComponentId&&a.state?._route!==void 0){const i=a.state._route;if(i!==""&&!i.startsWith("/")){this.lastActionInitiatorComponentId=void 0,this.lastActionServerSideType=void 0;return}const s=a.state._componentRoute||"",r=this.appMetadata(),o=this.renderRoot?.querySelector("#ux_"+this.id),l=o?.consumedRoute&&o.consumedRoute!=="_empty"?o.consumedRoute:"",c=s||this.selectedConsumedRoute||l||r?.homeConsumedRoute||"";this.selectedConsumedRoute=c;const h=c+i;this.lastActionInitiatorComponentId=void 0,h!==this.selectedRoute&&(this.selectedRoute=h,this.lastActionServerSideType&&(this.selectedServerSideType=this.lastActionServerSideType),this.state&&this.state._route!=null&&(this.state._route=void 0),this.instant=G()),this.lastActionServerSideType=void 0}})}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.captureActionSST,!0),this.removeEventListener("action-requested",this.handleUnhandledAction),this.innerFragmentSubscription?.unsubscribe()}navigate(t){this.selectedConsumedRoute=t.consumedRoute,this.selectedBaseUrl=t.baseUrl,this.selectedRoute=t.path,this.selectedServerSideType=t.serverSideType,this.selectedUriPrefix=t.uriPrefix,this.instant=G(),this.route=t.path??this.route,this.dispatchEvent(new CustomEvent("update-route",{detail:{route:t.path},bubbles:!0,composed:!0}))}renderContent(){const t=this.appMetadata();if(!t)return n`${d}`;const a=this;return n`
            <mateu-api-caller style="width: 100%;">
                <mateu-ux
                        route="${Ae(this.state,a,t)}"
                        id="ux_${this.id}"
                        baseUrl="${_e(a,t)}"
                        consumedRoute="${J(a,t)}"
                        serverSideType="${Ce(a,t)}"
                        uriPrefix="${Ee(a,t)}"
                        style="width: 100%;"
                        .appState="${this.appState}"
                        .appData="${this.appData}"
                        instant="${this.instant}"
                        @navigation-requested="${this.updateRoute}"
                ></mateu-ux>
            </mateu-api-caller>`}}pe([u()],re.prototype,"baseUrl");pe([u()],re.prototype,"route");pe([u()],re.prototype,"consumedRoute");pe([u({attribute:!1})],re.prototype,"state");pe([u({attribute:!1})],re.prototype,"appState");pe([u({attribute:!1})],re.prototype,"appData");pe([f()],re.prototype,"selectedRoute");pe([f()],re.prototype,"selectedConsumedRoute");pe([f()],re.prototype,"selectedBaseUrl");pe([f()],re.prototype,"selectedServerSideType");pe([f()],re.prototype,"selectedUriPrefix");pe([f()],re.prototype,"instant");var $o=Object.getOwnPropertyDescriptor,yo=(e,t,a,i)=>{for(var s=i>1?void 0:i?$o(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=o(s)||s);return s};let ja=class extends re{constructor(){super(...arguments),this.renderItem=e=>e.submenus&&e.submenus.length>0?n`
                <li class="pf-v6-c-nav__item">
                    <section class="pf-v6-c-nav__subnav">
                        <h2 class="pf-v6-c-nav__subnav-title">${e.label}</h2>
                        <ul class="pf-v6-c-nav__list">${e.submenus.map(t=>this.renderItem(t))}</ul>
                    </section>
                </li>`:n`
            <li class="pf-v6-c-nav__item">
                <a class="pf-v6-c-nav__link ${this.isActive(e)?"pf-m-current":""}" href="javascript:void(0)"
                   aria-current="${this.isActive(e)?"page":d}"
                   @click="${()=>this.navigate(e)}">${e.label}</a>
            </li>`}createRenderRoot(){return this}render(){const e=this.component?.metadata;if(!e)return d;const t=(e.menu??[]).length>0;return n`
            <div style="display:flex; flex-direction:column; min-height:100vh;">
                <header class="pf-v6-c-masthead" style="flex:0 0 auto;">
                    <div class="pf-v6-c-masthead__main">
                        ${e.logo?n`<img src="${e.logo}" alt="" style="height:1.75rem; margin-right:.75rem;" />`:d}
                        <span class="pf-v6-c-title pf-m-lg">${e.title??""}</span>
                    </div>
                    ${e.subtitle?n`<div class="pf-v6-c-masthead__content"><span class="pf-v6-c-content">${e.subtitle}</span></div>`:d}
                </header>
                <div style="display:flex; flex:1 1 auto; min-height:0;">
                    ${t?n`
                        <div class="pf-v6-c-page__sidebar" style="flex:0 0 16rem; overflow:auto;">
                            <div class="pf-v6-c-page__sidebar-body">
                                <nav class="pf-v6-c-nav" aria-label="Global">
                                    <ul class="pf-v6-c-nav__list">${e.menu.map(a=>this.renderItem(a))}</ul>
                                </nav>
                            </div>
                        </div>`:d}
                    <main style="flex:1 1 auto; min-width:0; overflow:auto; padding:1.5rem;">
                        ${this.renderContent()}
                    </main>
                </div>
            </div>`}};ja=yo([_("mateu-redhat-app")],ja);const wo=(e,t,a,i,s)=>{const r=t.metadata;return n`
        <mateu-redhat-app
                id="${e.id}_ux"
                route="${r.homeRoute}"
                consumedRoute="${r.route}"
                baseUrl="${a}"
                .component="${t}"
                style="width: 100%;"
        ></mateu-redhat-app>
    `},Ze=(e,t,a)=>e?e.includes("${")?new Function("state","data","return `"+e+"`")(t??{},a??{}):e:"",Ct=(e,t,a,i,s,r,o)=>(t.children??[]).map(l=>b(e,l,a,i,s,r,o)),xo=e=>{const t=e.color;return t==="primary"?"pf-m-primary":t==="error"||t==="danger"?"pf-m-danger":t==="success"?"pf-m-primary":"pf-m-secondary"},So=(e,t,a)=>{const i=e.metadata,s=Ze(i.label,t,a);return n`
        <button id="${e.id}" type="button"
                class="pf-v6-c-button ${xo(i)}"
                data-action-id="${i.actionId}"
                ?disabled="${i.disabled}"
                slot="${e.slot??d}"
                @click="${r=>ei(r,i)}">
            <span class="pf-v6-c-button__text">${s}</span>
        </button>`},ko=e=>{switch(e){case"h1":return"pf-m-2xl";case"h2":return"pf-m-xl";case"h3":return"pf-m-lg";case"h4":case"h5":case"h6":return"pf-m-md";default:return null}},_o=(e,t,a)=>{const i=e.metadata,s=Ze(i.text,t,a),r=ko(i.container);return r?n`<h2 class="pf-v6-c-title ${r}" style="${e.style??""}">${s}</h2>`:n`<div class="pf-v6-c-content" style="${e.style??""}"><p>${s}</p></div>`},ui=e=>{const t=e?.metadata?.type;return t==="FormRow"||t==="FormItem"?(e.children??[]).flatMap(ui):[e]},Co=(e,t,a,i,s,r,o)=>{const l=t.metadata,c=Math.max(1,l.maxColumns??1),h=(t.children??[]).flatMap(ui);return n`
        <div class="pf-v6-c-form" style="display:grid; grid-template-columns: repeat(${c}, minmax(0,1fr)); gap: var(--pf-t--global--spacer--md, 1rem) var(--pf-t--global--spacer--xl, 1.5rem); align-items:start;">
            ${h.map(p=>n`<div>${b(e,p,a,i,s,r,o)}</div>`)}
        </div>`},Eo=(e,t,a,i,s,r,o)=>{const l=t.metadata,c=t.children??[],h=c.filter(g=>g.slot!=="buttons"&&g.slot!=="toolbar"),p=c.filter(g=>g.slot==="toolbar"),v=c.filter(g=>g.slot==="buttons"),$=Ze(l.title,i,s),k=Ze(l.subtitle,i,s),S=g=>b(e,g,a,i,s,r,o);return n`
        <div>
            ${l.noHeader?d:n`
                <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom: var(--pf-t--global--spacer--md, 1rem);">
                    <div>
                        ${$?n`<h1 class="pf-v6-c-title pf-m-xl">${$}</h1>`:d}
                        ${k?n`<div class="pf-v6-c-content"><small>${k}</small></div>`:d}
                    </div>
                    ${p.length?n`<div class="pf-v6-c-action-list">${p.map(S)}</div>`:d}
                </div>`}
            ${h.map(S)}
            ${v.length?n`
                <div class="pf-v6-c-action-list" style="margin-top: var(--pf-t--global--spacer--md, 1rem);">
                    ${v.map(S)}
                </div>`:d}
        </div>`},Io=(e,t,a,i,s,r,o)=>{const l=Ze(t.metadata.title,i,s);return n`
        <div class="pf-v6-c-card pf-m-bordered" style="margin-bottom: var(--pf-t--global--spacer--md, 1rem);" slot="${t.slot??d}">
            ${l?n`<div class="pf-v6-c-card__title"><h2 class="pf-v6-c-card__title-text">${l}</h2></div>`:d}
            <div class="pf-v6-c-card__body">${Ct(e,t,a,i,s,r,o)}</div>
        </div>`},To=(e,t,a,i,s,r,o)=>{const l=Ze(t.metadata.title,i,s);return n`
        <div style="margin:.5rem 0;" slot="${t.slot??d}">
            ${l?n`<h3 class="pf-v6-c-title pf-m-md" style="margin-bottom:.5rem;">${l}</h3>`:d}
            ${Ct(e,t,a,i,s,r,o)}
        </div>`},Ro=(e,t,a,i,s,r,o)=>{const l=t.metadata,c=p=>p?b(e,p,a,i,s,r,o):d,h=typeof l.title=="string"?l.title:"";return n`
        <div class="pf-v6-c-card" slot="${t.slot??d}">
            ${h?n`<div class="pf-v6-c-card__title"><h2 class="pf-v6-c-card__title-text">${h}</h2></div>`:d}
            <div class="pf-v6-c-card__body">
                ${typeof l.title=="object"?c(l.title):d}
                ${c(l.content)}
                ${Ct(e,t,a,i,s,r,o)}
            </div>
            ${l.footer?n`<div class="pf-v6-c-card__footer">${c(l.footer)}</div>`:d}
        </div>`},Po=(e,t,a,i,s,r,o)=>{const l=t.metadata,c=l?.spacing===!1?"0":"var(--pf-t--global--spacer--md, 1rem)";return n`<div style="display:flex; flex-direction:row; gap:${c}; ${l?.wrap?"flex-wrap:wrap;":""} ${l?.fullWidth?"width:100%;":""} ${t.style??""}" slot="${t.slot??d}">${Ct(e,t,a,i,s,r,o)}</div>`},Oo=(e,t,a,i,s,r,o)=>{const l=t.metadata,c=l?.spacing===!1?"0":"var(--pf-t--global--spacer--sm, .75rem)";return n`<div style="display:flex; flex-direction:column; gap:${c}; ${l?.fullWidth?"width:100%;":""} ${t.style??""}" slot="${t.slot??d}">${Ct(e,t,a,i,s,r,o)}</div>`},Lo=(e,t,a,i,s,r,o)=>{const l=t.metadata?.orientation==="vertical"?"column":"row";return n`<div style="display:flex; flex-direction:${l}; gap:1rem; width:100%; ${t.style??""}" slot="${t.slot??d}">
        ${(t.children??[]).map(c=>n`<div style="flex:1; min-width:0;">${b(e,c,a,i,s,r,o)}</div>`)}
    </div>`},Do=e=>{const t=e.metadata,a=t.color;return n`<span class="pf-v6-c-label ${a==="success"?"pf-m-green":a==="error"||a==="danger"?"pf-m-red":a==="warning"?"pf-m-gold":a==="info"?"pf-m-blue":""}" slot="${e.slot??d}"><span class="pf-v6-c-label__content">${t.text??""}</span></span>`},zo=e=>{const t=e.metadata;return n`<a class="pf-v6-c-button pf-m-link pf-m-inline" href="${t.url??"#"}" slot="${e.slot??d}"><span class="pf-v6-c-button__text">${t.text??t.url??""}</span></a>`},Wa=(e,t)=>{t&&e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:{}},bubbles:!0,composed:!0}))},pi=(e,t,a)=>n`
    <div class="pf-v6-c-backdrop" style="position:fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:1000;">
        <div class="pf-v6-c-modal-box" role="dialog" aria-modal="true" style="max-width:90vw; max-height:90vh;">
            ${e?n`<header class="pf-v6-c-modal-box__header"><h1 class="pf-v6-c-modal-box__title">${e}</h1></header>`:d}
            <div class="pf-v6-c-modal-box__body">${t}</div>
            ${a?n`<footer class="pf-v6-c-modal-box__footer">${a}</footer>`:d}
        </div>
    </div>`,Ao=(e,t,a,i,s,r,o)=>{const l=t.metadata,c=h=>h?b(e,h,a,i,s,r,o):d;return pi(Ze(l.headerTitle,i,s),n`${c(l.content)}${Ct(e,t,a,i,s,r,o)}`,c(l.footer))},Fo=(e,t,a,i,s,r,o)=>{const l=t.metadata,c=l.content?b(e,l.content,a,i,s,r,o):d,h=(p,v,$)=>n`<button class="pf-v6-c-button ${$}" type="button" @click="${k=>Wa(k.target,v)}"><span class="pf-v6-c-button__text">${p}</span></button>`;return pi(Ze(l.header,i,s),c,n`
        <button class="pf-v6-c-button pf-m-primary" type="button" @click="${p=>Wa(p.target,l.confirmActionId)}"><span class="pf-v6-c-button__text">${l.confirmText??"OK"}</span></button>
        ${l.canReject?h(l.rejectText??"No",l.rejectActionId,"pf-m-secondary"):d}
        ${l.canCancel?h(l.cancelText??"Cancel",l.cancelActionId,"pf-m-link"):d}`)},No=e=>e==null?"":typeof e=="object"?e.text??e.label??e.name??JSON.stringify(e):String(e),qo=(e,t)=>{const a=t.metadata,i=(a.columns??[]).map(r=>r.metadata),s=e?.data?.[e.id]?.page?.content??[];return n`
        <table class="pf-v6-c-table pf-m-grid-md" role="grid">
            <thead><tr role="row">${i.map(r=>n`<th role="columnheader" scope="col">${r.label??""}</th>`)}</tr></thead>
            <tbody role="rowgroup">
                ${s.length===0?n`<tr role="row"><td role="cell" colspan="${i.length}"><div class="pf-v6-c-content" style="text-align:center; padding:1rem;">${a.emptyStateMessage??"No items."}</div></td></tr>`:d}
                ${s.map(r=>n`<tr role="row">${i.map(o=>n`<td role="cell" data-label="${o.label??""}">${No(r[o.id])}</td>`)}</tr>`)}
            </tbody>
        </table>`},Uo=(e,t)=>{const a=(s,r)=>{e.state={...e.state,[s]:r}},i=()=>e.search?.(new CustomEvent("search-requested"));return n`
        <div class="pf-v6-c-toolbar" style="margin-bottom:.5rem;">
            <div class="pf-v6-c-toolbar__content" style="display:flex; gap:.5rem; align-items:center;">
                <span class="pf-v6-c-form-control" style="flex:1; max-width:24rem;">
                    <input type="search" placeholder="Search…" .value="${e.state?.searchText??""}"
                           @input="${s=>a("searchText",s.target.value)}"
                           @keydown="${s=>{s.key==="Enter"&&i()}}" />
                </span>
                <button class="pf-v6-c-button pf-m-primary" type="button" @click="${i}"><span class="pf-v6-c-button__text">Search</span></button>
            </div>
        </div>`},Mo=(e,t)=>{const a=e?.data?.[t?.id??""]?.page??{},i=a.totalElements??0,s=a.pageSize??10,r=a.pageNumber??0,o=Math.max(1,Math.ceil(i/(s||1))),l=c=>e.pageChanged?.({detail:{page:c}});return i===0?n``:n`
        <div class="pf-v6-c-pagination pf-m-bottom" style="display:flex; justify-content:flex-end; align-items:center; gap:.5rem; padding:.5rem 0;">
            <span class="pf-v6-c-pagination__total-items">${i} item${i===1?"":"s"} · page ${r+1} of ${o}</span>
            <button class="pf-v6-c-button pf-m-plain" type="button" ?disabled="${r<=0}" @click="${()=>l(r-1)}">‹</button>
            <button class="pf-v6-c-button pf-m-plain" type="button" ?disabled="${r>=o-1}" @click="${()=>l(r+1)}">›</button>
        </div>`};var Bo=Object.defineProperty,jo=Object.getOwnPropertyDescriptor,na=(e,t,a,i)=>{for(var s=i>1?void 0:i?jo(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Bo(t,a,s),s};let Nt=class extends O{constructor(){super(...arguments),this.onInput=e=>this.emit(e.target.value),this.onNumber=e=>{const t=e.target.value;this.emit(t===""?null:Number(t))},this.onCheck=e=>this.emit(e.target.checked)}createRenderRoot(){return this}get value(){const e=this.field?.fieldId;return e&&this.state&&e in this.state?this.state[e]:this.field?.initialValue??""}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}get options(){return this.field?.options??[]}isCheckbox(){return this.field?.dataType==="bool"||this.field?.stereotype==="toggle"}inputType(){const e=this.field?.stereotype,t=this.field?.dataType;return e==="email"?"email":e==="password"?"password":t==="integer"||t==="number"?"number":t==="date"?"date":t==="dateTime"?"datetime-local":t==="time"?"time":"text"}control(){const e=this.field,t=e.disabled||e.readOnly;if(e.stereotype==="plainText")return n`<div class="pf-v6-c-content"><p>${this.value??""}</p></div>`;if(this.isCheckbox())return n`<div class="pf-v6-c-check">
                <input class="pf-v6-c-check__input" type="checkbox" id="${e.fieldId}_cb" .checked="${!!this.value}" ?disabled="${t}" @change="${this.onCheck}" />
                ${this.labelAlreadyRendered?d:n`<label class="pf-v6-c-check__label" for="${e.fieldId}_cb">${e.label??""}</label>`}
            </div>`;if(e.stereotype==="textarea")return n`<span class="pf-v6-c-form-control pf-m-resize-both"><textarea ?disabled="${t}" placeholder="${e.placeholder??""}" @input="${this.onInput}">${this.value??""}</textarea></span>`;if(e.stereotype==="radio"&&this.options.length)return n`${this.options.map(i=>n`<div class="pf-v6-c-radio">
                <input class="pf-v6-c-radio__input" type="radio" name="${e.fieldId}" value="${i.value}" .checked="${this.value===i.value}" ?disabled="${t}" @change="${()=>this.emit(i.value)}" />
                <label class="pf-v6-c-radio__label">${i.label}</label>
            </div>`)}`;if(this.options.length)return n`<span class="pf-v6-c-form-control">
                <select ?disabled="${t}" @change="${this.onInput}">
                    <option value=""></option>
                    ${this.options.map(i=>n`<option value="${i.value}" .selected="${this.value===i.value}">${i.label}</option>`)}
                </select>
            </span>`;const a=e.dataType==="integer"||e.dataType==="number";return n`<span class="pf-v6-c-form-control">
            <input type="${this.inputType()}" .value="${this.value??""}" placeholder="${e.placeholder??""}"
                   ?disabled="${t}" ?required="${e.required}"
                   @input="${a?this.onNumber:this.onInput}" />
        </span>`}render(){const e=this.field;if(!e)return d;const t=!this.labelAlreadyRendered&&!this.isCheckbox();return n`
            <div class="pf-v6-c-form__group">
                ${t?n`
                    <div class="pf-v6-c-form__group-label">
                        <label class="pf-v6-c-form__label" for="${e.fieldId}">
                            <span class="pf-v6-c-form__label-text">${e.label??""}</span>
                            ${e.required?n`<span class="pf-v6-c-form__label-required" aria-hidden="true"> *</span>`:d}
                        </label>
                    </div>`:d}
                <div class="pf-v6-c-form__group-control">
                    ${this.control()}
                    ${e.description?n`<div class="pf-v6-c-form__helper-text">${e.description}</div>`:d}
                </div>
            </div>`}};na([u({attribute:!1})],Nt.prototype,"field",2);na([u({attribute:!1})],Nt.prototype,"state",2);na([u({attribute:!1})],Nt.prototype,"labelAlreadyRendered",2);Nt=na([_("mateu-redhat-field")],Nt);var Wo=Object.defineProperty,Vo=Object.getOwnPropertyDescriptor,Me=(e,t,a,i)=>{for(var s=i>1?void 0:i?Vo(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Wo(t,a,s),s};let Te=class extends O{constructor(){super(...arguments),this.selected=0}createRenderRoot(){return this}label(e){const t=e?.metadata?.label;return t&&typeof t=="string"&&t.includes("${")&&this.container?._evalTemplate?this.container._evalTemplate(t):t??""}render(){const e=this.component?.children??[],t=e[this.selected];return n`
            <div>
                <div class="pf-v6-c-tabs pf-m-box">
                    <ul class="pf-v6-c-tabs__list">
                        ${e.map((a,i)=>n`
                            <li class="pf-v6-c-tabs__item ${i===this.selected?"pf-m-current":""}">
                                <button class="pf-v6-c-tabs__link" type="button" @click="${()=>{this.selected=i}}">
                                    <span class="pf-v6-c-tabs__item-text">${this.label(a)}</span>
                                </button>
                            </li>`)}
                    </ul>
                </div>
                <div style="padding: var(--pf-t--global--spacer--md, 1rem) 0;">
                    ${(t?.children??[]).map(a=>b(this.container,a,this.baseUrl,this.compState,this.compData,this.appState,this.appData))}
                </div>
            </div>`}};Me([u({attribute:!1})],Te.prototype,"component",2);Me([u({attribute:!1})],Te.prototype,"container",2);Me([u()],Te.prototype,"baseUrl",2);Me([u({attribute:!1})],Te.prototype,"compState",2);Me([u({attribute:!1})],Te.prototype,"compData",2);Me([u({attribute:!1})],Te.prototype,"appState",2);Me([u({attribute:!1})],Te.prototype,"appData",2);Me([f()],Te.prototype,"selected",2);Te=Me([_("mateu-redhat-tabs")],Te);var Ho=Object.defineProperty,Go=Object.getOwnPropertyDescriptor,Be=(e,t,a,i)=>{for(var s=i>1?void 0:i?Go(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Ho(t,a,s),s};let Re=class extends O{constructor(){super(...arguments),this.open={},this.initialized=!1}createRenderRoot(){return this}label(e){const t=e?.metadata?.label;return t&&typeof t=="string"&&t.includes("${")&&this.container?._evalTemplate?this.container._evalTemplate(t):t??""}render(){const e=this.component?.children??[];return this.initialized||(e.forEach((t,a)=>{t?.metadata?.active&&(this.open[a]=!0)}),this.initialized=!0),n`
            <div class="pf-v6-c-accordion">
                ${e.map((t,a)=>{const i=!!this.open[a];return n`
                        <h3>
                            <button class="pf-v6-c-accordion__toggle ${i?"pf-m-expanded":""}" type="button"
                                    aria-expanded="${i}" ?disabled="${t?.metadata?.disabled}"
                                    @click="${()=>{this.open={...this.open,[a]:!i}}}">
                                <span class="pf-v6-c-accordion__toggle-text">${this.label(t)}</span>
                                <span class="pf-v6-c-accordion__toggle-icon"><span style="display:inline-block; transform:rotate(${i?"90":"0"}deg);">›</span></span>
                            </button>
                        </h3>
                        <div class="pf-v6-c-accordion__expandable-content ${i?"pf-m-expanded":""}" ?hidden="${!i}">
                            <div class="pf-v6-c-accordion__expandable-content-body">
                                ${i?(t?.children??[]).map(s=>b(this.container,s,this.baseUrl,this.compState,this.compData,this.appState,this.appData)):d}
                            </div>
                        </div>`})}
            </div>`}};Be([u({attribute:!1})],Re.prototype,"component",2);Be([u({attribute:!1})],Re.prototype,"container",2);Be([u()],Re.prototype,"baseUrl",2);Be([u({attribute:!1})],Re.prototype,"compState",2);Be([u({attribute:!1})],Re.prototype,"compData",2);Be([u({attribute:!1})],Re.prototype,"appState",2);Be([u({attribute:!1})],Re.prototype,"appData",2);Be([f()],Re.prototype,"open",2);Re=Be([_("mateu-redhat-accordion")],Re);const Ko=new Set([m.App,m.Form,m.FormField,m.FormLayout,m.FormSection,m.FormSubSection,m.Card,m.Button,m.Text,m.HorizontalLayout,m.VerticalLayout,m.SplitLayout,m.Badge,m.Anchor,m.Dialog,m.ConfirmDialog,m.TabLayout,m.AccordionLayout,m.Page,m.Crud,m.Element,m.Div,m.Image,m.MicroFrontend]);class Jo extends kr{rendererName(){return"redhat"}supportedClientSideTypes(){return Ko}renderClientSideComponent(t,a,i,s,r,o,l,c){const h=a?.metadata?.type,p=a;return m.App==h?wo(t,p,i):m.Form==h?Eo(t,p,i,s,r,o,l):m.FormField==h?n`<mateu-redhat-field id="${p.id}" .component="${p}" .field="${p.metadata}" .state="${s}" .labelAlreadyRendered="${c}"></mateu-redhat-field>`:m.FormLayout==h?Co(t,p,i,s,r,o,l):m.FormSection==h?Io(t,p,i,s,r,o,l):m.FormSubSection==h?To(t,p,i,s,r,o,l):m.Card==h?Ro(t,p,i,s,r,o,l):m.Button==h?So(p,s,r):m.Text==h?_o(p,s,r):m.HorizontalLayout==h?Po(t,p,i,s,r,o,l):m.VerticalLayout==h?Oo(t,p,i,s,r,o,l):m.SplitLayout==h?Lo(t,p,i,s,r,o,l):m.Badge==h?Do(p):m.Anchor==h?zo(p):m.Dialog==h?Ao(t,p,i,s,r,o,l):m.ConfirmDialog==h?Fo(t,p,i,s,r,o,l):m.TabLayout==h?n`<mateu-redhat-tabs .component="${p}" .container="${t}" baseUrl="${i}" .compState="${s}" .compData="${r}" .appState="${o}" .appData="${l}"></mateu-redhat-tabs>`:m.AccordionLayout==h?n`<mateu-redhat-accordion .component="${p}" .container="${t}" baseUrl="${i}" .compState="${s}" .compData="${r}" .appState="${o}" .appData="${l}"></mateu-redhat-accordion>`:super.renderClientSideComponent(t,a,i,s,r,o,l,c)}renderTableComponent(t,a){return qo(t,a)}renderFilterBar(t,a){return Uo(t)}renderPagination(t,a){return Mo(t,a)}}q.set(new Jo);q.setUseShadowRoot(!1);var Yo=Object.defineProperty,Xo=Object.getOwnPropertyDescriptor,je=(e,t,a,i)=>{for(var s=i>1?void 0:i?Xo(t,a):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&Yo(t,a,s),s};let ye=class extends O{constructor(){super(...arguments),this.baseUrl="",this.route=void 0,this.consumedRoute="_empty",this.config=void 0,this.top="true",this.pathPrefix=void 0,this.debug=!1,this._lastUrl="",this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top=="true"){let t=e.detail.route,a=this.baseUrl??"";!t||t.startsWith("/")?a=window.location.origin+(this.pathPrefix??""):(t=(this.pathPrefix??"")+t,a.indexOf("://")<0&&(a.startsWith("/")||(a="/"+a),a=window.location.origin+a)),t.startsWith(this.pathPrefix+"/")&&(t=t.substring(this.pathPrefix?.length)),a.endsWith("/")&&t.startsWith("/")&&(t=t.substring(1));let i=new URL(a+t);if((window.location.pathname||i.pathname)&&window.location.pathname!=i.pathname){let s=i.pathname;i.search&&(s+=i.search),s&&!s.startsWith("/")&&(s="/"+s),window.history.pushState({},"",s),this._lastUrl=window.location.href}}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),Ot.markClean(),e instanceof CustomEvent){let t=e.detail.route;const a=this.shadowRoot?.querySelector("mateu-ux");a&&(a.setAttribute("route",t),a.setAttribute("instant",G()))}}}createRenderRoot(){return q.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),Ot.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!Ot.confirmLeave()){window.history.pushState({},"",this._lastUrl);return}const t=e.target;this.loadUrl(t)},this.top=="true"?this.loadUrl(window):this.route&&(this.consumedRoute=""),this.config)try{const e=JSON.parse(this.config);j.value={...j.value,...e}}catch{j.value={...j.value,config:this.config}}this.addEventListener("url-update-requested",this.routeChangedListener),this.addEventListener("navigate-to-requested",this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener("url-update-requested",this.routeChangedListener),this.removeEventListener("navigate-to-requested",this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute("route",this.route),this.instant=G(),this._lastUrl=e.location.href,e.location.search){const a=new URLSearchParams(e.location.search).get("overrides");if(a&&(this.config=a,this.config))try{const i=JSON.parse(this.config);j.value={...j.value,...i}}catch{j.value={...j.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){const t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t=="/"?"":t}addQueryParams(e,t){return e+(t.search?""+t.search:"")}extractGrossRouteFromUrl(e){const t=e.location.pathname,a=this.baseUrl&&(this.baseUrl.startsWith("http://")||this.baseUrl.startsWith("https://"))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(a)?t.substring(a.length):t}getContextPathStartingIndex(e){return e.startsWith("http:")?e.indexOf("/",7):e.startsWith("https:")?e.indexOf("/",8):0}render(){return n`
           <mateu-api-caller>
                <mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${Dt.value}"
                          .appState="${j.value}"
                ></mateu-ux>
           </mateu-api-caller>
           ${this.debug?n`
               <mateu-debug-overlay
                   .appState="${j.value}"
                   .appData="${Dt.value}"
               ></mateu-debug-overlay>
           `:d}
       `}};ye.styles=R`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `;je([u()],ye.prototype,"baseUrl",2);je([u()],ye.prototype,"route",2);je([u()],ye.prototype,"consumedRoute",2);je([u()],ye.prototype,"config",2);je([u()],ye.prototype,"top",2);je([u()],ye.prototype,"pathPrefix",2);je([f()],ye.prototype,"instant",2);je([u({type:Boolean})],ye.prototype,"debug",2);ye=je([_("mateu-ui")],ye);
