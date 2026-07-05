const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-highcharts.js","assets/vendor-vaadin.js","assets/vendor-lit.js","assets/vendor.js","assets/vendor-diagrams.js"])))=>i.map(i=>d[i]);
import{d as n,A as d,a as R,j as v,i as F,k as _,m as de,D as sa,c as L,r as $,p as Ae,w as Y,q as La}from"./vendor-lit.js";import{v as Da,b as et,e as Fa,_ as ce,n as ra,p as Ii,f as st,i as Bt,j as na,N as Ut,k as mi,l as ai,m as Aa}from"./vendor-vaadin.js";import{S as za,n as Q,a as Na,b as qa}from"./vendor.js";import{N as Yt}from"./vendor-ui5.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function i(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(s){if(s.ep)return;s.ep=!0;const r=i(s);fetch(s.href,r)}})();class Ma{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(t){if(this.componentRenderer=t,typeof window<"u"){const i=t.supportedClientSideTypes?.();window.__mateuRendererInfo={name:t.rendererName?.()??t.constructor?.name??"unknown",supportedTypes:i?[...i].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(t){this.useShadowRoot=t}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(t){this.afterRenderHook=t}getAfterRenderHook(){return this.afterRenderHook}}const V=new Ma;var h=(e=>(e.Page="Page",e.Div="Div",e.Element="Element",e.MicroFrontend="MicroFrontend",e.Form="Form",e.Crud="Crud",e.Result="Result",e.Card="Card",e.Directory="Directory",e.Stepper="Stepper",e.HorizontalLayout="HorizontalLayout",e.VerticalLayout="VerticalLayout",e.SplitLayout="SplitLayout",e.MasterDetailLayout="MasterDetailLayout",e.TabLayout="TabLayout",e.AccordionLayout="AccordionLayout",e.FormLayout="FormLayout",e.FormRow="FormRow",e.FormItem="FormItem",e.BoardLayout="BoardLayout",e.BoardLayoutRow="BoardLayoutRow",e.BoardLayoutItem="BoardLayoutItem",e.Scroller="Scroller",e.FullWidth="FullWidth",e.Container="Container",e.FormField="FormField",e.Table="Table",e.App="App",e.Text="Text",e.Avatar="Avatar",e.Chat="Chat",e.AvatarGroup="AvatarGroup",e.Badge="Badge",e.Breadcrumbs="Breadcrumbs",e.Anchor="Anchor",e.Button="Button",e.Chart="Chart",e.Icon="Icon",e.ConfirmDialog="ConfirmDialog",e.ContextMenu="ContextMenu",e.CookieConsent="CookieConsent",e.Details="Details",e.Dialog="Dialog",e.Image="Image",e.Map="Map",e.Markdown="Markdown",e.Notification="Notification",e.ProgressBar="ProgressBar",e.Popover="Popover",e.CarouselLayout="CarouselLayout",e.Tooltip="Tooltip",e.MessageInput="MessageInput",e.MessageList="MessageList",e.CustomField="CustomField",e.MenuBar="MenuBar",e.Grid="Grid",e.GridColumn="GridColumn",e.GridGroupColumn="GridGroupColumn",e.VirtualList="VirtualList",e.FormSection="FormSection",e.FormSubSection="FormSubSection",e.Bpmn="Bpmn",e.Workflow="Workflow",e.WorkflowElk="WorkflowElk",e.FormEditor="FormEditor",e.MetricCard="MetricCard",e.Scoreboard="Scoreboard",e.DashboardPanel="DashboardPanel",e.DashboardLayout="DashboardLayout",e.FoldoutLayout="FoldoutLayout",e.HeroSection="HeroSection",e.EmptyState="EmptyState",e.Skeleton="Skeleton",e.Gantt="Gantt",e))(h||{}),M=(e=>(e.ServerSide="ServerSide",e.ClientSide="ClientSide",e))(M||{});const ut=(e,t,i,a,s,r,o,l,c)=>(t.slot=l,g(e,t,i,a,s,r,o,c)),g=(e,t,i,a,s,r,o,l)=>{if(!t)return n``;if(t.type==M.ClientSide)return V.get().renderClientSideComponent(e,t,i,a,s,r,o,l);const c=e.route,u=e.consumedRoute;return n`
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
                         .appData="${o}"
        >
       </mateu-component>`},Ba=(e,t,i,a,s,r,o)=>{const l=t.metadata;let c=t.style;return c==null&&(c=""),l.columnSpacing&&(c+="--vaadin-form-layout-column-spacing: "+l.columnSpacing+";"),l.itemRowSpacing&&(c+="--vaadin-form-layout-row-spacing: "+l.itemRowSpacing+";"),l.itemLabelSpacing&&(c+="--vaadin-form-layout-label-spacing: "+l.itemLabelSpacing+";"),l.labelsAside&&(c+="--vaadin-form-item-label-width: 92px;"),l.fullWidth&&(c+="width: 100%;"),n`
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
                   ${t.children?.map(u=>oa(l,e,u,i,a,s,r,o))}
               </vaadin-form-layout>
            `},oa=(e,t,i,a,s,r,o,l)=>i.type==M.ClientSide&&i.metadata?.type==h.FormRow?ja(e,t,i,a,s,r,o,l):e.labelsAside?Ua(t,i,a,s,r,o,l):g(t,i,a,s,r,o,l),Ua=(e,t,i,a,s,r,o)=>{if(t.type==M.ClientSide&&t.metadata?.type==h.FormField&&t.metadata.label){const l=t.metadata,c=l.label?.includes("${")?e._evalTemplate(l.label):l.label;return n`
                       <vaadin-form-item data-colspan="${l.colspan}">
                           <label slot="label">${c}</label>
                           ${g(e,t,i,a,s,r,o,!0)}
                       </vaadin-form-item>
                   `}return g(e,t,i,a,s,r,o)},ja=(e,t,i,a,s,r,o,l)=>n`
        <vaadin-form-row>
            ${i.children?.map(c=>oa(e,t,c,a,s,r,o,l))}
        </vaadin-form-row>
            `,Wa=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let u=t.style;return l.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),l.justification&&(u=u?"justify-content: "+l.justification+";"+u:"justify-content: "+l.justification+";"),l.verticalAlignment&&(u=u?"align-items: "+l.verticalAlignment+";"+u:"align-items: "+l.verticalAlignment+";"),n`
               <vaadin-horizontal-layout 
                       style="${u}" 
                       class="${t.cssClasses}"
                       theme="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(p=>g(e,p,i,a,s,r,o))}
               </vaadin-horizontal-layout>
            `},Va=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let u=t.style;return l.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),l.justification&&(u=u?"justify-content: "+l.justification+";"+u:"justify-content: "+l.justification+";"),l.horizontalAlignment&&(u=u?"align-items: "+l.horizontalAlignment+";"+u:"align-items: "+l.horizontalAlignment+";"),n`
        <vaadin-vertical-layout
                style="${u}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(p=>g(e,p,i,a,s,r,o))}
        </vaadin-vertical-layout>
    `},Ha=(e,t,i,a,s,r,o)=>{const l=t.metadata;let c=t.style;return l.fullWidth&&(c=c?"width: 100%;"+c:"width: 100%;"),n`
               <vaadin-split-layout 
                       style="${c}" 
                       class="${t.cssClasses}"
                       orientation="${l.orientation??d}"
                       theme="${l.variant??d}"
                       slot="${t.slot??d}"
               >
                   <master-content>${g(e,t.children[0],i,a,s,r,o)}</master-content>
                   <detail-content>${g(e,t.children[1],i,a,s,r,o)}</detail-content>
               </vaadin-split-layout>
            `},Ga=(e,t,i,a,s,r,o)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=s?.detailComponent??null,u=!!s?.hasDetail||!!l,p=c??l;return n`
               <vaadin-master-detail-layout ?has-detail="${u}"
                                            style="${t.style}"
                                            class="${t.cssClasses}"
                                            slot="${t.slot??d}">
                   <div>${g(e,t.children[0],i,a,s,r,o)}</div>
                   ${u&&p?n`<div slot="detail">${g(e,p,i,a,s,r,o)}</div>`:n`<div slot="detail" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Select an item to view details</div>`}
               </vaadin-master-detail-layout>
            `},Ka=(e,t,i,a,s,r,o)=>{const l=t.metadata;let c=t.style;c==null&&(c=""),l.fullWidth&&(c+="width: 100%;");let u=l.variant;u=="equalWidth"&&(u="equal-width-tabs");const p=m=>{m.target.selected=0};return n`
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
                ${t.children?.map(m=>m).map(m=>{const f=m.metadata.label,y=f?.includes("${")?e._evalTemplate(f):f,w=m.metadata.shortcut;return n`
                    <vaadin-tab id="${y}"
                                style="${m.style}"
                                class="${m.cssClasses}"
                                data-shortcut="${w??d}"
                    >${y}</vaadin-tab>`})}
            </vaadin-tabs>

            ${t.children?.map(m=>Ja(e,m,i,a,s,r,o))}
        </vaadin-tabsheet>
            `},Ja=(e,t,i,a,s,r,o)=>{const l=t.metadata.label,c=l?.includes("${")?e._evalTemplate(l):l;return n`
        <div tab="${c}" style="padding: var(--lumo-space-m) 0;">
                   ${t.children?.map(u=>g(e,u,i,a,s,r,o))}
               </div>
            `},Ya=(e,t,i,a,s,r,o)=>{const l=t.metadata;t.style,l.fullWidth;let c=0;if(t.children){for(let u=0;u<t.children.length;u++)if(t.children[u].metadata?.active){c=u;break}}return n`
               <vaadin-accordion
                       style="${t.style}"
                       class="${t.cssClasses}"
                       opened="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(u=>Xa(e,u,i,a,s,r,o,l.variant))}
               </vaadin-accordion>
            `},Xa=(e,t,i,a,s,r,o,l)=>{const c=t.metadata,u=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return n`
        <vaadin-accordion-panel style="${t.style}"
                                class="${t.cssClasses}"
                                theme="${l??d}"
                                ?opened="${c.active}"
                                ?disabled="${c.disabled}">
            <vaadin-accordion-heading slot="summary">${u}</vaadin-accordion-heading>
            ${t.children?.map(p=>g(e,p,i,a,s,r,o))}
        </vaadin-accordion-panel>
            `},Qa=(e,t,i,a,s,r,o)=>n`
               <vaadin-scroller style="${t.style}" 
                                class="${t.cssClasses}"
                                slot="${t.slot??d}">
                   ${t.children?.map(l=>g(e,l,i,a,s,r,o))}
               </vaadin-scroller>
            `,Za=(e,t,i,a,s,r,o)=>n`
               <div style="width: 100%; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??d}">
                   ${t.children?.map(l=>g(e,l,i,a,s,r,o))}
               </div>
            `,es=(e,t,i,a,s,r,o)=>n`
               <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??d}">
                   ${t.children?.map(l=>g(e,l,i,a,s,r,o))}
               </div>
            `,ts=(e,t,i,a,s,r,o)=>n`
        <vaadin-board style="${t.style}" 
                      class="${t.cssClasses}"
                      slot="${t.slot??d}">
            ${t.children?.map(l=>g(e,l,i,a,s,r,o))}
        </vaadin-board>
            `,is=(e,t,i,a,s,r,o)=>n`
        <vaadin-board-row style="${t.style}" class="${t.cssClasses}">
                   ${t.children?.map(l=>g(e,l,i,a,s,r,o))}
               </vaadin-board-row>
            `,as=(e,t,i,a,s,r,o)=>{const l=t.metadata;return n`
        <div style="${t.style}" 
             class="${t.cssClasses}"
             board-cols="${l.boardCols??d}"
        >
                   ${t.children?.map(c=>g(e,c,i,a,s,r,o))}
               </div>
            `},xt=(e,t)=>new Function(...Object.keys(t),"return `"+e+"`")(...Object.values(t)),It=(e,t,i)=>({state:e??{},data:t??{},...i});function ze(e,t,i,a){if(!e?.includes("${"))return e;try{return xt(e,It(t,i,a))}catch(s){return console.warn(`Mateu: could not interpolate "${e}":`,s),e}}const ht=(e,t,i)=>{if(e&&e.indexOf("${")>=0)try{return xt(e,It(t,i))}catch(a){return a.message}return e},la=(e,t,i,a,s)=>{if(!e)return e;const r=It(t,i,{appState:a??{},appData:s??{}});let o=e;try{if(o=xt(e,r),o.includes("${"))try{o=xt(o,r)}catch(l){o="when evaluating nested "+e+" :"+l+", where data is "+i+" and state is "+t+" and app state is "+a+" and app data is "+s,console.error(l,o,t,i,a,s)}}catch(l){o="when evaluating "+e+" :"+l+", where data is "+i+" and state is "+t+" and app state is "+a+" and app data is "+s,console.error(l,o,t,i,a,s)}return o},da=(e,t,i,a,s,r)=>{const o=It(t,i,{appState:a??{},appData:s??{},...r}),l=xt(e,o);return new Function(...Object.keys(o),`return (${l})`)(...Object.values(o))},ca=(e,t,i,a)=>{const s=It(t,i,a);return new Function(...Object.keys(s),`return (${e})`)(...Object.values(s))},ss=(e,t,i,a)=>xt(e,It(t,i,a)),rs=(e,t,i)=>{const a=e.metadata;return n`<vaadin-avatar
            img="${a.image}"
            name="${Ue(a.name,t,i)}"
            abbr="${a.abbreviation}"
            style="${e.style}" class="${e.cssClasses}"
            slot="${e.slot??d}"
    ></vaadin-avatar>`},Ue=(e,t,i)=>typeof e=="string"&&e.includes("${")?ze(e,t,i):e,ns=e=>{const t=e.metadata;return n`<vaadin-avatar-group max-items-visible="${t.maxItemsVisible}"
                                     .items="${t.avatars}"
                                     style="${e.style}" class="${e.cssClasses}"
                                     slot="${e.slot??d}">
    </vaadin-avatar-group>`},os=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=u=>n`
            ${g(e,u,i,a,s,r,o)}
`;return n`
        <vaadin-virtual-list
                .items="${l.page.content}"
                ${Da(c,[])}
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
        ></vaadin-virtual-list>
    `};var ls=Object.defineProperty,ds=Object.getOwnPropertyDescriptor,_i=(e,t,i,a)=>{for(var s=a>1?void 0:a?ds(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&ls(t,i,s),s};let At=class extends F{constructor(){super(...arguments),this.variant="text",this.count=3}render(){const e=Array.from({length:Math.max(1,this.count)});return this.variant=="card"?n`${e.map(()=>n`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant=="grid"?n`${e.map(()=>n`<div class="bone row"></div>`)}`:this.variant=="form"?n`${e.map(()=>n`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:n`${e.map(()=>n`<div class="bone line"></div>`)}`}};At.styles=R`
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
    `;_i([v()],At.prototype,"variant",2);_i([v({type:Number})],At.prototype,"count",2);At=_i([_("mateu-skeleton")],At);const cs=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},pt=(e,t,i,a,s,r)=>n`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${t??"🗂"}</span>
            ${i?n`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${i}</span>`:d}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${a??e??"Nothing here yet."}</span>
            ${s&&r?n`
                <vaadin-button theme="tertiary" style="margin-top: .25rem;" @click="${o=>cs(o,s)}">${r}</vaadin-button>
            `:d}
        </div>
    `,us=e=>{const t=e.metadata;return n`
        <div style="${e.style??d}" class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${pt(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},hs=e=>{const t=e.metadata;return n`
        <mateu-skeleton
                variant="${t.variant??"text"}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-skeleton>
    `};var Be=(e=>(e.NONE="NONE",e.INFO="INFO",e.SUCCESS="SUCCESS",e.WARNING="WARNING",e.DANGER="DANGER",e))(Be||{});const ps=(e,t,i)=>{const a=e[i.path];return a?n`<span theme="badge pill ${si(a.type)}">${a.message}</span>`:n``},si=e=>{switch(e){case Be.SUCCESS:return"success";case Be.WARNING:return"warning";case Be.DANGER:return"error";case Be.NONE:return"contrast"}return""},ms=(e,t,i)=>{const s=e[i.path]?"vaadin:check":"vaadin:minus";return n`<vaadin-icon 
                    icon="${s}"
                    style="height: 16px; width: 16px; color: ${"var(--lumo-body-text-color)"};"
            ></vaadin-icon>`},vs=(e,t,i,a,s)=>{const r=e[i.path];let o=r;return a=="money"&&r&&r.locale&&r.currency?o=new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(r.value):s=="money"&&(o=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(r)),n`${o}`},zi=(e,t,i)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:i},bubbles:!0,composed:!0}))},fs=(e,t,i,a,s,r)=>{const o=i.xcolumn??r;if(o.text){if(o.actionId)return n`<a href="javascript: void(0);" @click="${u=>zi(i,o,e)}">${o.text}</a>`;const c=e[i.path];return n`<a href="${c}">${o.text}</a>`}if(a=="string"){if(o.actionId){const u=e[i.path];return n`<a href="javascript: void(0);" @click="${p=>zi(i,o,e)}">${u}</a>`}const c=e[i.path];return n`<a href="${c}">${c}</a>`}const l=e[i.path];return n`<a href="${l.href}">${l.text}</a>`},gs=(e,t,i,a,s)=>a=="string"?e[i.path].split(",").map(l=>n`<vaadin-icon icon="${l}" style="width: 16px;"></vaadin-icon>`):e[i.path].split(",").map(o=>n`<vaadin-icon icon="${o.icon}" style="width: 16px;"></vaadin-icon>`),bs=(e,t,i,a,s)=>{const r=e[i.path];return n`${de(r)}`},$s=(e,t,i,a,s,r)=>{if(a=="string"){const l=e[i.path],c="max-height: 40px; "+(r.style??"");return n`<img src="${l}" style="${c}">`}const o=e[i.path];return n`<img src="${o.src}" style="${r.style??""}">`},ys=e=>{const t={_clickedRow:e.target.row};e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+e.detail.value.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Ni=e=>{const t={_clickedRow:e.target.row},i=e.target.action;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+i.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},ws=e=>{const t=document.createElement("vaadin-context-menu-item"),i=document.createElement("vaadin-icon");return i.style.color="var(--lumo-secondary-text-color)",i.style.marginInlineEnd="var(--lumo-space-s)",i.style.padding="var(--lumo-space-xs)",i.setAttribute("icon",e.icon),t.appendChild(i),e.label&&t.appendChild(document.createTextNode(e.label)),t.disabled=e.disabled,t},qi=(e,t,i)=>{const a=e[i.path]?.actions?.map(s=>s.icon?{component:ws(s),methodNameInCrud:s.methodNameInCrud}:{...s,text:s.label});return!a||a.length==0?n``:n`
                                     <vaadin-menu-bar
                                         .items=${[{text:"···",children:a}]}
                                         theme="tertiary"
                                         .row="${e}"
                                         data-testid="menubar-${i.path}"
                                         @item-selected="${ys}"
                                     ></vaadin-menu-bar>
                                   `},xs=(e,t,i)=>{if(i.path=="select"){const r={actionId:i.path,icon:"",label:"Select",disabled:!1,methodNameInCrud:"select"};return n`
         <vaadin-button theme="tertiary" title="Select" @click="${Ni}" .row="${e}" .action="${r}">
             Select
         </vaadin-button>
    `}const a=i.path&&e[i.path].methodNameInCrud?e[i.path]:e.action,s=a.icon&&!a.label;return n`
         <vaadin-button theme="tertiary${s?" icon":""}" title="${a.label||d}" @click="${Ni}" .row="${e}" .action="${a}">
             ${a.icon?n`<vaadin-icon icon="${a.icon}"></vaadin-icon>`:d}
             ${a.label?a.label:d}
         </vaadin-button>
    `},Cs=(e,t,i)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:i},bubbles:!0,composed:!0}))},Ss=(e,t,i,a,s,r)=>{const o=i.xcolumn??r;if(o.actionId){const c=o.text||e[i.path];return n`
            <vaadin-button theme="tertiary" @click="${u=>Cs(i,o,e)}" .row="${e}">
                ${c}
            </vaadin-button>
        `}const l=e[i.path];return n`<a href="${l}">${o.text||l}</a>`},ks=(e,t,i,a,s,r,o,l,c)=>{const u=e[i.path];return g(a,u,s,r,o,l,c)},yi=new WeakMap,Es=(e,t)=>yi.get(e)?.[t],Is=(e,t,i)=>{let a=yi.get(e);a||(a={},yi.set(e,a)),a[t]=i},Mi=e=>{if(e==null||e==="")return null;const t=Number(e);return Number.isNaN(t)?null:t},_s=(e,t,i,a)=>{const s=i?.field?.fieldId,r=c=>{if(e[t.id]===c||e[t.id]==null&&(c===""||c==null))return;if(e[t.id]=c,!s){i.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"update-row",parameters:{_editedRow:{...e}}},bubbles:!0,composed:!0}));return}const u=a[s];i.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:s,value:Array.isArray(u)?[...u]:u},bubbles:!0,composed:!0}))},o=e[t.id],l=o==null?"":String(o);switch(t.editorType){case"boolean":return n`<vaadin-checkbox ?checked=${!!o} @checked-changed=${c=>r(c.detail.value)}></vaadin-checkbox>`;case"integer":return n`<vaadin-integer-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(Mi(c.target.value))}></vaadin-integer-field>`;case"number":return n`<vaadin-number-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(Mi(c.target.value))}></vaadin-number-field>`;case"date":return n`<vaadin-date-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-date-picker>`;case"time":return n`<vaadin-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-time-picker>`;case"datetime":return n`<vaadin-date-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-date-time-picker>`;case"select":return n`<vaadin-combo-box
                theme="small" style="width:100%;"
                .items=${(t.editorOptions??[]).map(c=>({label:c.label,value:String(c.value)}))}
                item-label-path="label" item-value-path="value"
                .value=${l}
                @value-changed=${c=>r(c.detail.value)}></vaadin-combo-box>`;case"lookup":{const c=i?.field?.fieldId,u=`search-${c}-${t.id}`,p=`${c}-${t.id}`,f=(t.editorOptions??[]).find(w=>String(w.value)===l)??(l?{value:l,label:Es(e,t.id)??l}:void 0);return n`<vaadin-combo-box
                theme="small" style="width:100%;"
                item-label-path="label" item-id-path="value"
                .dataProvider=${(w,b)=>{i.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:u,parameters:{searchText:w.filter,size:w.pageSize,page:w.page},callback:C=>{const k=C?.fragments?.[0]?.data?.[p];b(k?.content??[],k?.totalElements??0)},callbackonly:!0},bubbles:!0,composed:!0}))}}
                .selectedItem=${f}
                @selected-item-changed=${w=>{const b=w.detail.value,C=b?b.value:null;String(C??"")!==l&&(b&&Is(e,t.id,b.label),r(C))}}></vaadin-combo-box>`}default:return n`<vaadin-text-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(c.target.value)}></vaadin-text-field>`}},vi=e=>Fa(()=>n`<span title="${e}" style="white-space:normal;overflow-wrap:break-word;">${e}</span>`,[e]),Ts=e=>{e.preventDefault(),e.stopPropagation(),e.currentTarget?.dispatchEvent(new CustomEvent("sort-direction-changed",{detail:{grid:e.currentTarget.parentElement},bubbles:!0,composed:!0}))},Rs=(e,t,i,a,s,r,o)=>{const l=ze(e.label,a,s);return n`
<vaadin-grid-column-group header="${l}">
    ${e.columns.map(c=>ua(c.metadata,t,i,a,s,r,o))}
</vaadin-grid-column-group>
`},Ti=(e,t,i,a,s,r,o)=>h.GridGroupColumn==e.metadata?.type?Rs(e.metadata,t,i,a,s,r,o):ua(e.metadata,t,i,a,s,r,o),ua=(e,t,i,a,s,r,o)=>{const l=ze(e.label,a,s);return e.sortable?n`
                        <vaadin-grid-sort-column
                                path="${e.id}"
                                text-align="${e.align??d}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??d}"
                                ?resizable="${e.resizable}"
                                width="${e.width??d}"
                                @direction-changed="${Ts}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${vi(l)}
                                ${et((c,u,p)=>Qt(c,u,p,e,t,i,a,s,r,o),[])}
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
                                ${vi(l)}
                                ${et((c,u,p)=>Qt(c,u,p,e,t,i,a,s,r,o),[])}
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
                                ${vi(l)}
                                ${et((c,u,p)=>Qt(c,u,p,e,t,i,a,s,r,o),[])}
                        ></vaadin-grid-column>
                    `},Qt=(e,t,i,a,s,r,o,l,c,u)=>{const p=i.dataset.dataType??"",m=i.dataset.stereotype??"";if(a.editable)return _s(e,a,s,o);if(p=="status")return ps(e,t,i);if(p=="bool")return ms(e,t,i);if(p=="money"||m=="money")return vs(e,t,i,p,m);if(p=="link"||m=="link")return fs(e,t,i,p,m,a);if(p=="icon"||m=="icon")return gs(e,t,i,p);if(m=="html")return bs(e,t,i);if(m=="image")return $s(e,t,i,p,m,a);if(p=="menu")return qi(e,t,i);if(p=="component")return ks(e,t,i,s,r,o,l,c,u);if(p=="action")return xs(e,t,i);if(p=="actionGroup")return qi(e,t,i);if(m=="button"||a.actionId)return Ss(e,t,i,p,m,a);const f=e[i.path];return n`<span title="${f}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${f}</span>`},Ps=(e,t,i,a,s,r,o)=>{const l=t.metadata;if(l.tree){const u=async(p,m)=>{const f=p.parentItem?p.parentItem.children:l.page.content;m(f,f.length)};return n`
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
                                ${et((y,w,b)=>Qt(y,w,b,f,e,i,a,s,r,o),[])}></vaadin-grid-column>
`:n`
            <vaadin-grid-tree-column path="${p.id}"
                                header="${f?.label??d}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??d}"
                                width="${f?.width??d}"
            ></vaadin-grid-tree-column>
`})}
            <span slot="empty-state">${pt()}</span>
        </vaadin-grid>
    `}let c=l.page?.content;return t.id&&a&&a[t.id]&&(c=a[t.id]),c||(c=[]),n`
        <vaadin-grid 
                style="${t.style}" 
                class="${t.cssClasses}" 
                .items="${c}"
                all-rows-visible
        >
            ${l?.content?.map(u=>Ti(u,e,i,a,s,r,o))}
        </vaadin-grid>
    `},Os=e=>(e.metadata,n`
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
    `),tt=new za,K={value:{}},zt={value:{}},Ls=(e,t,i,a,s,r,o)=>{const l=t.metadata;return n`
        <vaadin-context-menu .items=${Ri(e,l.menu,i,a,s,r,o)} 
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             open-on="${l.activateOnLeftClick?"click":d}"
                             slot="${t.slot??d}">
            ${g(e,l.wrapped,i,a,s,r,o)}
        </vaadin-context-menu>
            `},Ds=(e,t,i,a,s)=>{const r=t.metadata;return n`
        <vaadin-menu-bar .items=${Ri(e,r.options,i,a,s,K,zt)}
                         style="${t.style}" class="${t.cssClasses}"
                         slot="${t.slot??d}">
        </vaadin-menu-bar>
            `},Bi=(e,t,i,a,s,r,o)=>{const l=document.createElement("vaadin-context-menu-item");return sa(g(e,t,i,a,s,r,o),l),l},Ri=(e,t,i,a,s,r,o)=>t.map(l=>l.submenus?{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?Bi(e,l.component,i,a,s,r,o):void 0,children:Ri(e,l.submenus,i,a,s,r,o)}:l.separator?{component:"hr"}:{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?Bi(e,l.component,i,a,s,r,o):void 0}),Fs=(e,t,i,a,s,r,o)=>{const l=t.metadata;return n`
        <vaadin-custom-field label="${l.label}"
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             slot="${t.slot??d}"
                             data-colspan="${l.colspan||d}"
        >
            ${g(e,l.content,i,a,s,r,o)}
        </vaadin-custom-field>
            `},As=e=>(e.metadata,n`
        <vaadin-message-input style="${e.style}" class="${e.cssClasses}"
                              slot="${e.slot??d}"></vaadin-message-input>
    `),zs=(e,t,i,a,s,r,o)=>{const l=t.metadata;return n`
        <div id="show-notifications">${g(e,l.wrapped,i,a,s,r,o)}</div>
        <vaadin-tooltip
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
                for="show-notifications" text="${l.text}" position="top-start"></vaadin-tooltip>
    `},Ns=e=>{if(e instanceof CustomEvent)return e.detail;const t={};for(const i in e){const a=e[i];["number","string","boolean"].indexOf(typeof a)>=0&&(t[i]=e[i])}return t},Ui=(e,t,i)=>{for(let a in t.attributes)e.setAttribute(a,t.attributes[a]);i.style&&e.setAttribute("style",i.style),i.cssClasses&&e.setAttribute("class",i.cssClasses),i.slot&&e.setAttribute("slot",i.slot),t.content&&(t.html?e.innerHTML=t.content:e.append(t.content))},qs=e=>{e.startsWith("vaadin-chart")&&!customElements.get(e)&&ce(()=>import("./vendor-highcharts.js"),__vite__mapDeps([0,1,2,3]))},Ms=(e,t,i)=>{qs(t.name);let a=t.name;return t.attributes&&t.attributes.id&&(a="#"+t.attributes.id),setTimeout(()=>{const s=e.shadowRoot?.querySelector(".element-container")?.querySelector(a);if(s){for(;s.firstChild;)s.removeChild(s.lastChild);Ui(s,t,i)}else{const r=document.createElement(t.name);Ui(r,t,i);for(let o in t.on)r.addEventListener(o,l=>{const c=Ns(l);e.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.on[o],parameters:{event:c}},bubbles:!0,composed:!0}))});e.shadowRoot?.querySelector(".element-container")?.appendChild(r)}}),n`<div class="element-container"></div>`};var W=(e=>(e.div="div",e.p="p",e.h1="h1",e.h2="h2",e.h3="h3",e.h4="h4",e.h5="h5",e.h6="h6",e.span="span",e))(W||{});const Bs=(e,t,i,a,s)=>{const r=e.metadata,o=r.attributes?.["data-colspan"],l=la(r.text,t,i,a,s);return W.h1==r.container?n`
            <h1 style="${e.style}" class="${e.cssClasses}"
                id="${L(e.id)}"
                data-colspan="${L(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h1>
        `:W.h2==r.container?n`
            <h2 style="${e.style}" class="${e.cssClasses}"
                id="${L(e.id)}"
                data-colspan="${L(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h2>
        `:W.h3==r.container?n`
            <h3 style="${e.style}" class="${e.cssClasses}"
                id="${L(e.id)}"
                data-colspan="${L(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h3>
        `:W.h4==r.container?n`
            <h4 style="${e.style}" class="${e.cssClasses}"
                id="${L(e.id)}"
                data-colspan="${L(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h4>
        `:W.h5==r.container?n`
            <h5 style="${e.style}" class="${e.cssClasses}"
                id="${L(e.id)}"
                data-colspan="${L(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h5>
        `:W.h6==r.container?n`
            <h6 style="${e.style}" class="${e.cssClasses}"
                id="${L(e.id)}"
                data-colspan="${L(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h6>
        `:W.p==r.container?n`
               <p style="${e.style}" class="${e.cssClasses}"
                  id="${L(e.id)}"
                  data-colspan="${L(o)}"
                  slot="${e.slot??d}">
                   ${l??d}
               </p>
            `:W.div==r.container?n`
               <div style="${e.style}" class="${e.cssClasses}"
                    id="${L(e.id)}"
                    data-colspan="${L(o)}"
                    slot="${e.slot??d}">${l?de(l):d}</div>
            `:W.span==r.container?n`
               <span style="${e.style}" class="${e.cssClasses}"
                     id="${L(e.id)}"
                     data-colspan="${L(o)}"
                    slot="${e.slot??d}">${l??d}</span>
            `:n`
               <p
                       id="${L(e.id)}"
                       data-colspan="${L(o)}"
                       slot="${e.slot??d}">
                   Unknown text container: ${r.container} 
               </p>
            `},Us=(e,t,i)=>{const a=e.metadata;return n`<span theme="badge ${a.color} ${a.pill?"pill":""} ${a.small?"small":""} ${a.primary?"primary":""}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??d}">${Ue(a.text,t,i)}</span>`},js=(e,t,i)=>{const a=Ue(e.text,t,i);if(!a)return d;let s=Ue(e.color,t,i);return s=="SUCCESS"&&(s="success"),s=="ERROR"&&(s="error"),s=="DANGER"&&(s="error"),s=="WARNING"&&(s="warning"),s=="INFO"&&(s="info"),s=="PRIMARY"&&(s="primary"),s=="SECONDARY"&&(s="secondary"),s=="TERTIARY"&&(s="tertiary"),s=="QUATERNARY"&&(s="quaternary"),s=="LIGHT"&&(s="light"),s=="DARK"&&(s="dark"),n`<span theme="badge ${s} ${e.pill?"pill":""} ${e.small?"small":""} ${e.primary?"primary":""}">${a}</span>`},Ws=e=>{const t=e.metadata;return n`<a href="${t.url}" style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}">${t.text}</a>`},ha=(e,t)=>{const i=e.toLowerCase().split("+");return t.ctrlKey===i.includes("ctrl")&&t.altKey===i.includes("alt")&&t.shiftKey===i.includes("shift")&&t.metaKey===i.includes("meta")},Vs=(e,t)=>{if(!ha(e,t))return!1;const i=e.toLowerCase().split("+"),a=i[i.length-1];return!!(t.key.toLowerCase()===a||/^[a-z]$/.test(a)&&t.code==="Key"+a.toUpperCase()||/^[0-9]$/.test(a)&&(t.code==="Digit"+a||t.code==="Numpad"+a))},Hs=e=>e?e.split("+").map(t=>t.length<=1?t.toUpperCase():t.charAt(0).toUpperCase()+t.slice(1)).join("+"):void 0,Gs=(e,t)=>{const i=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i,parameters:t.parameters},bubbles:!0,composed:!0}))},Ks=(e,t,i)=>{const a=e.metadata,s=ze(a.label,t,i);let r="";return a.buttonStyle&&(r+=" "+a.buttonStyle),a.color&&a.color!=="none"&&a.color!=="normal"&&(r+=" "+a.color),a.size&&a.size!=="none"&&a.size!=="normal"&&(r+=" "+a.size),n`<vaadin-button
id="${e.id}"
            data-action-id="${a.actionId}"
            @click="${o=>Gs(o,a)}"
            style="${e.style}"
            class="${e.cssClasses}"
            theme="${r}"
            ?disabled="${a.disabled}"
            title="${a.shortcut?`${s} (${Hs(a.shortcut)})`:d}"
            slot="${e.slot??d}"
    >${a.iconOnLeft?n`<vaadin-icon icon="${a.iconOnLeft}"></vaadin-icon>`:d}${s}${a.iconOnRight?n`<vaadin-icon icon="${a.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>`},Js=(e,t,i,a,s,r,o)=>{const l=t.metadata;if(!l)return n``;let c="";return l.variants?.map(u=>u=="stretchMedia"?"stretch-media":u=="coverMedia"?"cover-media":u).forEach(u=>c+=" "+u),c=c.trim(),n`
        <vaadin-card
                style="${t.style}" 
                class="${t.cssClasses}" 
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${l.media?ut(e,l.media,i,a,s,r,o,"media",!1):d}
            ${l.title?ut(e,l.title,i,a,s,r,o,"title",!1):d}
            ${l.subtitle?ut(e,l.subtitle,i,a,s,r,o,"subtitle",!1):d}
            ${l.header?ut(e,l.header,i,a,s,r,o,"header",!1):d}
            ${l.headerPrefix?ut(e,l.headerPrefix,i,a,s,r,o,"header-prefix",!1):d}
            ${l.headerSuffix?ut(e,l.headerSuffix,i,a,s,r,o,"header-suffix",!1):d}
            ${l.footer?ut(e,l.footer,i,a,s,r,o,"footer",!1):d}
            ${l.content?g(e,l.content,i,a,s,r,o,!1):d}
        </vaadin-card>
    `},Ys=e=>{const t=e.metadata;return n`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??d}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},Xs=e=>{const t=e.metadata;return n`
        <vaadin-icon icon="${t.icon}" style="${e.style}" class="${e.cssClasses}"
                     slot="${e.slot??d}"></vaadin-icon>
    `},Qs=(e,t,i,a,s,r,o)=>{const l=t.metadata;let c=!1;if(l.openedCondition)try{c=da(l.openedCondition,a,s,r,o)}catch(u){console.error("when evaluating "+l.openedCondition+" :"+u+", where data is "+s+" and state is "+a)}return n`
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
  ${t.children?.map(u=>g(e,u,i,a,s,r,o))}
</vaadin-confirm-dialog>
            `},Zs=e=>{const t=e.metadata;let i;return t.position&&(i={Top:"top",Bottom:"bottom",TopLeft:"top-left",TopRight:"top-right",BottomLeft:"bottom-left",BottomRight:"bottom-right"}[t.position]),n`
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
    `},er=(e,t,i,a,s,r,o)=>{const l=t.metadata;return n`
        <vaadin-details 
                ?opened="${l.opened}" 
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            <vaadin-details-summary slot="summary">
            ${g(e,l.summary,i,a,s,r,o)}
            </vaadin-details-summary>
            ${g(e,l.content,i,a,s,r,o)}
        </vaadin-details>
            `},tr=(e,t,i,a,s,r)=>n`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${i}"
            .xdata="${a}"
            .appState="${s}"
            .appdata="${r}"
        ></mateu-dialog>
            `,ir=e=>{const t=e.metadata;return n`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"  
                  route="${t.route}" 
                  consumedRoute="${t.consumedRoute}" 
                  id="${Q()}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??d}"
        ></mateu-ux>
        </mateu-api-caller>
            `},ar=e=>{const t=e.metadata;return n`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style}" class="${e.cssClasses}"
                        slot="${e.slot??d}"></mateu-markdown>
            `},sr=e=>{const t=e.metadata;return n`
        <vaadin-notification
                .opened="${!0}"
                slot="${e.slot??d}"
                style="${e.style}"
                class="${e.cssClasses}"
                ${ra(()=>n`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${t.title}</h3>
                        <div>
                            ${t.text}
                        </div>
                    </vaadin-horizontal-layout>
                `,[])}
        ></vaadin-notification>
            `},rr=(e,t={})=>{const i=e.metadata,a=i.valueKey?t[i.valueKey]:i.value;return n`
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
        ${i.text?n`<span class="text-secondary text-xs" id="sublbl">
    ${i.text}
  </span>`:d}
        </div>
    `},nr=(e,t,i,a,s,r,o)=>{const l=t.metadata;return n`
        <div id="show-notifications">${g(e,l.wrapped,i,a,s,r,o)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                slot="${t.slot??d}"
                ${Ii(()=>n`${g(e,l.content,i,a,s,r,o)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
        ></vaadin-popover>
    `},or=e=>{const t=e.metadata;return n`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}"></mateu-map>
            `},lr=e=>{const t=e.metadata;return n`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??d}">
            `},dr=e=>{const t=e.metadata;return n`<vaadin-horizontal-layout theme="spacing"
                                          slot="${e.slot??d}">
        ${t.breadcrumbs.map(i=>n`
            <a href="${i.link}">${i.text}</a>
            <span>/</span>
        `)}
        <div style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </vaadin-horizontal-layout>`},cr=(e,t,i,a,s,r,o)=>{const l=t.metadata;return n`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${l.dots}" 
                ?nav = "${l.nav}" 
                ?loop = "${l.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(c=>n`<div>${g(e,c,i,a,s,r,o)}</div>`)}
        </skeleton-carousel>
    `},ur=(e,t,i,a)=>{const s=e.metadata;return n`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            ${s.menu.map(r=>pa(r))}
        </div>
            `},pa=e=>n`
        ${e.submenus?n`
                <vaadin-details summary="${e.label}" opened>
                    <vaadin-vertical-layout theme="spacing">
                        ${e.submenus.map(t=>pa(t))}
                    </vaadin-vertical-layout>
                </vaadin-details>
            `:n`
                <a href="${e.path}">${e.label}</a>
        `}
        `,hr=(e,t,i,a,s,r,o)=>{const l=t.metadata;return n`<div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >${l.content?de(l.content):d}${t.children?.map(c=>g(e,c,i,a,s,r,o))}</div>
    `},pr=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return n`<vaadin-card
                slot="${t.slot??d}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?n`<div slot="title" style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color);">${c}</div>`:d}
        ${t.children?.map(u=>g(e,u,i,a,s,r,o))}
    </vaadin-card>
    `},mr=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return n`
        <div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(u=>g(e,u,i,a,s,r,o))}</div>
    `},wi=(e,t,i,a,s,r,o,l)=>{const c=t.metadata,u=c?.fabs??[];return n`<mateu-page
            .component="${t}"
            baseUrl="${i}"
            .state="${a}"
            .data="${s}"
            .appState="${r}"
            .appdata="${o}"
            slot="${t.slot??d}"
            style="${t.style}"
            class="${t.cssClasses}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(p=>g(e,p,i,a,s,r,o))}
        ${c?.buttons?.map(p=>n`
                   ${g(e,{id:p.actionId,metadata:p,type:M.ClientSide,slot:"buttons"},void 0,a,s,r,o)}
`)}
        ${u.map((p,m)=>n`
            <button class="page-fab" style="position: fixed; bottom: ${1.5+m*4}rem; right: 5.5rem;"
                @click="${()=>e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:p.actionId},bubbles:!0,composed:!0}))}"
                title="${p.label}">
                <vaadin-icon icon="${p.icon}"></vaadin-icon>
            </button>
        `)}
</mateu-page>
    `},xi=(e,t,i,a,s,r,o,l)=>n`<mateu-table-crud
            id="${t.id}"
            baseUrl="${i}"
            .component="${t}"
            .metadata="${t.metadata}"
            .state="${a}"
            .data="${s}"
            .appState="${r}"
            .appdata="${o}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(c=>g(e,c,i,a,s,r,o))}
    </mateu-table-crud>`,vr=e=>{const t=e.metadata;return n`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??d}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},fr=(e,t,i)=>{const a=e.metadata;return n`<mateu-chat sseUrl="${a.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??d}"></mateu-chat>`},gr=e=>{const t=e.metadata;return n`
        <mateu-workflow
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow>
    `},br=e=>{const t=e.metadata;return n`
        <mateu-workflow-elk
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
                ?readOnly="${t.readOnly??!1}"
        ></mateu-workflow-elk>
    `},$r=e=>{const t=e.metadata;return n`
        <mateu-form-editor
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Form","fields":[]}'}"
        ></mateu-form-editor>
    `},ma=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,yr=e=>e=="up"?"var(--lumo-success-text-color, #1a7f37)":e=="down"?"var(--lumo-error-text-color, #c5221f)":"var(--lumo-secondary-text-color, #666)",wr=e=>e=="up"?"▲":e=="down"?"▼":"",xr=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},Cr=e=>{const t=e.metadata,i=!!t.actionId;return n`
        <div class="mateu-metric-card ${e.cssClasses??""}"
             style="${ma} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${i?"cursor: pointer;":""} ${e.style??""}"
             slot="${e.slot??d}"
             role="${i?"button":d}"
             @click="${a=>xr(a,t)}"
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
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${yr(t.trend)};">
                    ${wr(t.trend)} ${t.trendLabel??d}
                </span>
            `:d}
            ${t.description?n`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:d}
        </div>
    `},Sr=(e,t,i,a,s,r,o)=>n`
        <div class="mateu-scoreboard ${t.cssClasses??""}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(l=>g(e,l,i,a,s,r,o))}
        </div>
    `,kr=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=l.colSpan&&l.colSpan>1?`grid-column: span ${l.colSpan};`:"",u=l.rowSpan&&l.rowSpan>1?`grid-row: span ${l.rowSpan};`:"";return n`
        <div class="mateu-dashboard-panel ${t.cssClasses??""}"
             style="${ma} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${u} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?n`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${l.title}</h3>
                    ${l.subtitle?n`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${l.subtitle}</span>`:d}
                </div>
            `:d}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(p=>g(e,p,i,a,s,r,o))}
            </div>
        </div>
    `},Er=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=l.columns&&l.columns>0?`repeat(${l.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return n`
        <div class="mateu-dashboard ${t.cssClasses??""}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(u=>g(e,u,i,a,s,r,o))}
        </div>
    `};var Ir=Object.defineProperty,_r=Object.getOwnPropertyDescriptor,Pi=(e,t,i,a)=>{for(var s=a>1?void 0:a?_r(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Ir(t,i,s),s};let Nt=class extends F{constructor(){super(...arguments),this.panels=[],this.openPanels=new Set,this.initialized=!1}willUpdate(){!this.initialized&&this.panels.length&&(this.openPanels=new Set(this.panels.map((e,t)=>e.open?t:-1).filter(e=>e>=0)),this.initialized=!0)}toggle(e){const t=new Set(this.openPanels);t.has(e)?t.delete(e):t.add(e),this.openPanels=t}render(){return n`
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
        `}};Nt.styles=R`
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
    `;Pi([v({type:Array})],Nt.prototype,"panels",2);Pi([$()],Nt.prototype,"openPanels",2);Nt=Pi([_("mateu-foldout")],Nt);const Tr=(e,t,i,a,s,r,o)=>{const l=t.metadata;return n`
        <mateu-foldout
                .panels="${l.panels??[]}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(c=>g(e,c,i,a,s,r,o))}
        </mateu-foldout>
    `},Rr=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=!!l.image,u=c?`background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${l.image}'); background-size: cover; background-position: center; color: #fff;`:"",p=l.centered===!1?"flex-start":"center",m=l.centered===!1?"left":"center";return n`
        <div class="mateu-hero ${t.cssClasses??""}"
             style="display: flex; flex-direction: column; align-items: ${p}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${m}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); min-height: ${l.height??"12rem"}; box-sizing: border-box; ${u} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?n`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${l.title}</h1>`:d}
            ${l.subtitle?n`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${c?"":"color: var(--lumo-secondary-text-color, #666);"} max-width: 40rem;">${l.subtitle}</p>`:d}
            ${t.children?.length?n`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${p}; width: 100%; max-width: 40rem;">
                    ${t.children?.map(f=>g(e,f,i,a,s,r,o))}
                </div>
            `:d}
        </div>
    `};var Pr=Object.defineProperty,Or=Object.getOwnPropertyDescriptor,va=(e,t,i,a)=>{for(var s=a>1?void 0:a?Or(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Pr(t,i,s),s};const fi=1440*60*1e3;let Zt=class extends F{constructor(){super(...arguments),this.tasks=[]}range(){const e=this.tasks.flatMap(t=>[t.start,t.end]).filter(t=>!!t).map(t=>new Date(t+"T00:00:00").getTime());return e.length?{min:Math.min(...e)-fi,max:Math.max(...e)+2*fi}:null}months(e,t){const i=[],a=new Date(e);for(a.setDate(1);a.getTime()<=t;){const s=Math.max(a.getTime(),e),r=new Date(a.getFullYear(),a.getMonth()+1,1),o=Math.min(r.getTime(),t);i.push({label:a.toLocaleDateString(void 0,{month:"short",year:"2-digit"}),from:s,to:o}),a.setMonth(a.getMonth()+1)}return i}render(){const e=this.range();if(!e)return n``;const t=e.max-e.min,i=s=>(s-e.min)/t*100,a=Date.now();return n`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(s=>n`
                        <div class="month" style="width: ${(s.to-s.from)/t*100}%;">${s.label}</div>
                    `)}
                </div>
                ${this.tasks.map(s=>{const r=new Date(s.start+"T00:00:00").getTime(),o=new Date(s.end+"T00:00:00").getTime()+fi;return n`
                        <div class="label" title="${s.title}">${s.title}</div>
                        <div class="lane">
                            ${a>=e.min&&a<=e.max?n`<div class="today" style="left: ${i(a)}%;"></div>`:d}
                            <div class="bar"
                                 title="${s.title} · ${s.start} → ${s.end}${s.progress?` · ${s.progress}%`:""}"
                                 style="left: ${i(r)}%; width: ${(o-r)/t*100}%; ${s.color?`--mateu-gantt-fill: ${s.color};`:""}">
                                <div class="fill" style="width: ${s.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};Zt.styles=R`
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
    `;va([v({type:Array})],Zt.prototype,"tasks",2);Zt=va([_("mateu-gantt")],Zt);const Lr=e=>{const t=e.metadata;return n`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-gantt>
    `},Dr=(e,t)=>{let i=e.style;return e.id&&(i&&!i.endsWith(";")&&(i+=";"),i==null&&(i=""),t[e.id+".hidden"]==!0&&(i+="display: none;")),i},Fr=(e,t)=>{let i={...e.metadata};if(e.id&&i){if(i.type==h.Button){const a=i;t[e.id+".disabled"]==!0&&(a.disabled=!0)}if(i.type==h.FormField){const a=i;t[e.id+".disabled"]==!0&&(a.disabled=!0)}}return i},O=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),Ar={[h.Bpmn]:({component:e})=>vr(e),[h.Workflow]:({component:e})=>gr(e),[h.WorkflowElk]:({component:e})=>br(e),[h.FormEditor]:({component:e})=>$r(e),[h.Page]:O(wi),[h.Div]:O(hr),[h.Directory]:({component:e,baseUrl:t,state:i,data:a})=>ur(e),[h.FormLayout]:O(Ba),[h.HorizontalLayout]:O(Wa),[h.VerticalLayout]:O(Va),[h.SplitLayout]:O(Ha),[h.MasterDetailLayout]:O(Ga),[h.TabLayout]:O(Ka),[h.AccordionLayout]:O(Ya),[h.BoardLayout]:O(ts),[h.BoardLayoutRow]:O(is),[h.BoardLayoutItem]:O(as),[h.Scroller]:O(Qa),[h.FullWidth]:O(Za),[h.Container]:O(es),[h.Form]:({container:e,component:t,baseUrl:i,state:a,data:s,appState:r,appData:o})=>{const l=t.metadata;return n`<mateu-form
            id="${t.id}"
        baseUrl="${i}"
            .component="${t}"
            .values="${a}"
            .state="${a}"
            .data="${s}"
            .appState="${r}"
            .appdata="${o}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            >
                ${t.children?.map(c=>g(e,c,i,a,s,r,o))}
            ${l?.buttons?.map(c=>n`
               ${g(e,{id:c.actionId,metadata:c,type:M.ClientSide,slot:"buttons"},void 0,a,s,r,o)}
`)}

            </mateu-form>`},[h.Table]:({container:e,component:t,baseUrl:i,state:a,data:s,appState:r,appData:o})=>n`<mateu-table
                        id="${t.id}"
        baseUrl="${i}"
            .metadata="${t.metadata}"
            .state="${a}"
                        .data="${s}"
                        .appState="${r}"
                        .appDate="${o}"
                        style="${t.style}" class="${t.cssClasses}"
                        slot="${t.slot??d}"
            >
             ${t.children?.map(l=>g(e,l,i,a,s,r,o))}
            </mateu-table>`,[h.Crud]:O(xi),[h.App]:({container:e,component:t,baseUrl:i,state:a,data:s,appState:r,appData:o})=>n`
            <mateu-app
                        id="${t.id}"
                        baseUrl="${i}"
                        .component="${t}"
                        .state="${a}"
                        .data="${s}"
                        style="${t.style}"
                        class="${t.cssClasses}"
                        .appState="${r}"
                        .appData="${o}"
            >
             ${t.children?.map(l=>g(e,l,i,a,s,r,o))}
         </mateu-app>`,[h.Element]:({container:e,component:t})=>Ms(e,t.metadata,t),[h.FormField]:({container:e,component:t,baseUrl:i,state:a,data:s,appState:r,appData:o,labelAlreadyRendered:l})=>{const c=t.metadata;return n`
    <mateu-field
                   id="${t.id}"
                   .component="${t}"
            .field="${t.metadata}"
                   .state="${a}"
                   .data="${s}"
                   .appState="${r}"
                   .appdata="${o}"
                   style="${t.style}" class="${t.cssClasses}"
                   slot="${t.slot??d}"
                   data-colspan="${c.colspan}"
                   .labelAlreadyRendered="${l}"
            >
                    ${t.children?.map(u=>g(e,u,i,a,s,r,o,l))}
                </mateu-field>
        `},[h.Text]:({component:e,state:t,data:i,appState:a,appData:s})=>Bs(e,t,i,a,s),[h.Avatar]:({component:e,state:t,data:i})=>rs(e,t,i),[h.Chat]:({component:e,state:t,data:i})=>fr(e),[h.AvatarGroup]:({component:e})=>ns(e),[h.Badge]:({component:e,state:t,data:i})=>Us(e,t,i),[h.Breadcrumbs]:({component:e})=>dr(e),[h.Anchor]:({component:e})=>Ws(e),[h.Button]:({component:e,state:t,data:i})=>Ks(e,t,i),[h.Card]:O(Js),[h.Chart]:({component:e})=>Ys(e),[h.Icon]:({component:e})=>Xs(e),[h.ConfirmDialog]:O(Qs),[h.ContextMenu]:O(Ls),[h.CookieConsent]:({component:e})=>Zs(e),[h.Details]:O(er),[h.Dialog]:({component:e,baseUrl:t,state:i,data:a,appState:s,appData:r})=>tr(e,t,i,a,s,r),[h.Image]:({component:e})=>lr(e),[h.Map]:({component:e})=>or(e),[h.Markdown]:({component:e})=>ar(e),[h.MicroFrontend]:({component:e})=>ir(e),[h.Notification]:({component:e})=>sr(e),[h.ProgressBar]:({component:e,state:t})=>rr(e,t),[h.Popover]:O(nr),[h.CarouselLayout]:O(cr),[h.Tooltip]:O(zs),[h.MessageInput]:({component:e})=>As(e),[h.MessageList]:({component:e})=>Os(e),[h.CustomField]:O(Fs),[h.MenuBar]:({container:e,component:t,baseUrl:i,state:a,data:s})=>Ds(e,t,i,a,s),[h.Grid]:O(Ps),[h.VirtualList]:O(os),[h.FormSection]:O(pr),[h.FormSubSection]:O(mr),[h.MetricCard]:({component:e})=>Cr(e),[h.Scoreboard]:O(Sr),[h.DashboardPanel]:O(kr),[h.DashboardLayout]:O(Er),[h.FoldoutLayout]:O(Tr),[h.HeroSection]:O(Rr),[h.EmptyState]:({component:e})=>us(e),[h.Skeleton]:({component:e})=>hs(e),[h.Gantt]:({component:e})=>Lr(e)},Oi=(e,t,i,a,s,r,o,l)=>{if(!t?.metadata)return t==null?(console.warn("No metadata for component",t),n`<p>No metadata for component</p>`):Oi(e,{id:Q(),metadata:t,type:M.ClientSide},i,a,s,r,o,l);const c=t.metadata.type,u={...t,style:Dr(t,s),metadata:Fr(t,s)},p=Ar[c];return p?p({container:e,component:u,baseUrl:i,state:a,data:s,appState:r,appData:o,labelAlreadyRendered:l}):n`<p ${u?.slot??d}>Unknown metadata type ${c} for component ${u?.id}</p>`};var ve=(e=>(e.HAMBURGUER_MENU="HAMBURGUER_MENU",e.MENU_ON_LEFT="MENU_ON_LEFT",e.MENU_ON_TOP="MENU_ON_TOP",e.TABS="TABS",e.TILES="TILES",e.RAIL="RAIL",e.AUTO="AUTO",e.MEDIATOR="MEDIATOR",e))(ve||{});const Xt=(e,t)=>e.themeToggle?n`
        <vaadin-button theme="tertiary icon" @click="${t.toggleTheme}"
            title="${t.isDark?"Switch to light mode":"Switch to dark mode"}"
            style="margin-left: 0.5rem; margin-right: 0.5rem; flex-shrink: 0;">
            <vaadin-icon icon="${t.isDark?"vaadin:sun-o":"vaadin:moon"}" style="color: var(--lumo-body-text-color);"></vaadin-icon>
        </vaadin-button>
    `:d,zr=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},ji=(e,t,i)=>{const a=fe(e,t,i),s=j(t,i);return a=="list"||a==s?"new":a},fe=(e,t,i)=>{const a=e?._route;if(a!=null&&(a===""||a.startsWith("/"))){const s=i.homeRoute??"",r=s.indexOf("?"),o=r>=0?s.substring(r+1):"",l=j(t,i)+a;if(!o)return l;const c=l.indexOf("?")>=0?"&":"?";return l+c+o}return t.selectedRoute?t.selectedRoute:i.homeRoute},j=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,re=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:t.homeBaseUrl,ne=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,oe=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,Nr=(e,t,i,a,s,r,o)=>{const l=e.mapItems(t.menu,e.filter?.toLowerCase()??""),c=j(e,t),u=ji(a,e,t),p=u&&u!=="new"&&u.startsWith(c+"/")?u.substring(c.length+1).split("/")[0]:void 0;return n`
                    ${t.variant==ve.MEDIATOR?n`

                        ${t.layout=="SPLIT"?n`
                            <vaadin-master-detail-layout>
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${j(e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${re(e,t)}"
                                            consumedRoute="${j(e,t)}"
                                            serverSideType="${ne(e,t)}"
                                            uriPrefix="${oe(e,t)}"
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
                                            route="${ji(a,e,t)}"
                                            id="ux_${e.id}_detail"
                                            baseUrl="${re(e,t)}"
                                            consumedRoute="${j(e,t)}"
                                            serverSideType="${ne(e,t)}"
                                            uriPrefix="${oe(e,t)}"
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
                                        route="${fe(a,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${re(e,t)}"
                                        consumedRoute="${j(e,t)}"
                                        serverSideType="${ne(e,t)}"
                                        uriPrefix="${oe(e,t)}"
                                        style="width: 100%;"
                                        .appState="${r}"
                                        .appData="${o}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `}
                        
`:d}
            ${t.variant==ve.HAMBURGUER_MENU?n`
                <vaadin-app-layout style="${t?.style}" class="${t?.cssClasses}" .drawerOpened=${!t.drawerClosed}>
                    <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                    <h2 slot="navbar" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2><p slot="navbar">${t.subtitle}</p>
                    <vaadin-horizontal-layout slot="navbar" style="margin-left: auto; align-items: center;">
                        <slot name="widgets"></slot>
                        ${Xt(t,e)}
                    </vaadin-horizontal-layout>
                    <vaadin-scroller slot="drawer" class="p-s"
                                     @navigation-requested="${e.updateRoute}">
                        ${t.menu&&t.totalMenuOptions>10?n`
                            <vaadin-text-field style="width: calc(100% - 20px); padding-left: 10px; padding-right: 10px;" @value-changed="${m=>zr(m,e)}">
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
                                            route="${fe(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${re(e,t)}"
                                            consumedRoute="${j(e,t)}"
                                            serverSideType="${ne(e,t)}"
                                            uriPrefix="${oe(e,t)}"
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
            
            ${t.variant==ve.MENU_ON_TOP?n`
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
                            ${Xt(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${fe(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${re(e,t)}"
                                            consumedRoute="${j(e,t)}"
                                            serverSideType="${ne(e,t)}"
                                            uriPrefix="${oe(e,t)}"
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

            ${t.variant==ve.TILES?n`
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
                            ${Xt(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):n`
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${fe(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${re(e,t)}"
                                            consumedRoute="${j(e,t)}"
                                            serverSideType="${ne(e,t)}"
                                            uriPrefix="${oe(e,t)}"
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

            ${t.variant==ve.RAIL?n`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):d}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${fe(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${re(e,t)}"
                                            consumedRoute="${j(e,t)}"
                                            serverSideType="${ne(e,t)}"
                                            uriPrefix="${oe(e,t)}"
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

            ${t.variant==ve.MENU_ON_LEFT?n`

                <vaadin-horizontal-layout>
                    <vaadin-scroller style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <vaadin-vertical-layout
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(m=>e.renderOptionOnLeftMenu(m))}
                            ${Xt(t,e)}
                        </vaadin-vertical-layout>
                    </vaadin-scroller>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${fe(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${re(e,t)}"
                                            consumedRoute="${j(e,t)}"
                                            serverSideType="${ne(e,t)}"
                                            uriPrefix="${oe(e,t)}"
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

            ${t.variant==ve.TABS?n`
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
                                ${t.menu.map(m=>n`
                                <vaadin-tab 
                                        @click="${()=>e.selectRoute(m.consumedRoute,m.route,m.actionId,m.baseUrl,m.serverSideType,m.uriPrefix)}"
                                >${m.label}</vaadin-tab>
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
                                            route="${fe(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${re(e,t)}"
                                            consumedRoute="${j(e,t)}"
                                            serverSideType="${ne(e,t)}"
                                            uriPrefix="${oe(e,t)}"
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

            ${t.fabs?.map((m,f)=>n`
                <button class="app-fab" style="bottom: ${t.sseUrl?5.5+f*4:1.5+f*4}rem; right: 1.5rem;"
                    @click="${()=>e.runAction(m.actionId)}"
                    title="${m.label}">
                    <vaadin-icon icon="${m.icon}"></vaadin-icon>
                </button>
            `)}
            ${t.sseUrl&&!e.chatOpen?n`
                <button class="ai-fab" @click="${e.showHideIa}" title="Asistente IA">
                    <vaadin-icon icon="vaadin:comments-o"></vaadin-icon>
                </button>
            `:d}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},qr=(e,t)=>t!=null&&e!=null&&!e.has(t),Mr=typeof HTMLElement<"u"?HTMLElement:class{};class Br extends Mr{static get observedAttributes(){return["type","renderer"]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){const t=this.getAttribute("type")??"unknown",i=this.getAttribute("renderer")??"unknown";this.shadowRoot||this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
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
        `}}typeof customElements<"u"&&!customElements.get("mateu-unsupported")&&customElements.define("mateu-unsupported",Br);const Wi=new Set,Ur=(e,t,i)=>{const a=`${i}/${t}`;return Wi.has(a)||(Wi.add(a),console.warn(`[mateu] Component type "${t}" is not supported by the "${i}" renderer — rendering <mateu-unsupported> placeholder.`)),n`<mateu-unsupported
            type="${t}"
            renderer="${i}"
            data-component-id="${e?.id??d}"
            slot="${e?.slot??d}"
    ></mateu-unsupported>`};class jr{renderFilterBar(t,i,a,s,r,o,l,c){const u=i?.metadata,p=f=>{const{fieldId:y,value:w}=f.detail;t.state={...t.state,[y]:w}},m=f=>{const{fieldIds:y}=f.detail,w={};y.forEach(b=>{w[b]=void 0}),w.searchText=void 0,t.state={...t.state,...w}};return n`
            <mateu-filter-bar
                .metadata="${u}"
                @search-requested="${t.search}"
                @value-changed="${p}"
                @filter-reset-requested="${m}"
                .state="${t.state}"
                .data="${r}"
                .appState="${o}"
                .appData="${l}"
                ?searchOnly="${c??!1}"
            >
                ${u?.header?.map(f=>g(t,f,a,s,r,o,l))}
            </mateu-filter-bar>
        `}renderPagination(t,i){return n`
        <mateu-pagination
                @page-changed="${t.pageChanged}"
                @fetch-more-elements="${t.fetchMoreElements}"
                .totalElements="${t.data[i?.id]?.page?.totalElements??0}"
                .pageSize="${t.data[i?.id]?.page?.pageSize??10}"
                data-testid="pagination"
                .pageNumber="${t.data[i?.id]?.page?.pageNumber??0}"
        ></mateu-pagination>
        `}renderTableComponent(t,i,a,s,r,o,l){return n`
        <mateu-table id="${t.id}"
                     .metadata="${i?.metadata}"
                     .data="${t.data}"
                     .state="${s}"
                     .appState="${o}"
                     .appData="${l}"
                     .emptyStateMessage="${s[i?.id]?.emptyStateMessage}"
                     @sort-direction-changed="${t.directionChanged}"
                     @fetch-more-elements="${t.fetchMoreElements}"
                     baseUrl="${a}"
        ></mateu-table>
        `}rendererName(){return this.constructor?.name??"unknown"}supportedClientSideTypes(){}renderClientSideComponent(t,i,a,s,r,o,l,c){const u=i?.metadata?.type??i?.type,p=Object.values(h).includes(u)?u:void 0;return qr(this.supportedClientSideTypes(),p)?Ur(i,p,this.rendererName()):Oi(t,i,a,s,r,o,l,c)}renderAppComponent(t,i,a,s,r,o,l){return Nr(t,i?.metadata,a,s,r,o,l)}}const Wr=76;function Vi(e){if(e.weight!=null)return e.weight;const t=e.stereotype??"";if(t==="icon")return 1;if(t==="image")return 4;if(t==="html"||t==="richText"||t==="markdown"||t==="textarea")return 5;if(t==="link")return 2.5;if(t==="combobox"||t==="select")return 2;const i=e.dataType??"";return i==="bool"?1:i==="status"||i==="integer"?1.5:i==="number"||i==="date"||i==="money"?2:i==="dateTime"||i==="dateRange"?2.5:3}function fa(e,t){if(e.length===0)return"table";const i=e.reduce((c,u)=>c+Vi(u),0),a=t/Wr,s=i/a;if(s<=1)return"table";const r=e.filter(c=>c.identifier||(c.priority??Number.MAX_SAFE_INTEGER)<=2),o=r.reduce((c,u)=>c+Vi(u),0);return s>1.6||e.length>10?"masterDetail":r.length>0&&o<=8?"list":e.some(c=>c.stereotype==="image"||c.stereotype==="html")||r.length===0&&e.length>=4&&e.length<=8?"cards":"masterDetail"}function Ci(e){return e.filter(t=>t.identifier||(t.priority??Number.MAX_SAFE_INTEGER)<=2).sort((t,i)=>(t.priority??Number.MAX_SAFE_INTEGER)-(i.priority??Number.MAX_SAFE_INTEGER))}function Vr(e){const t=e.dataType??"",i=e.stereotype??"";let a;return i==="combobox"||i==="select"?a=2:t==="bool"?a=1:t==="status"||t==="integer"?a=1.5:t==="number"||t==="date"||t==="money"?a=2:t==="dateTime"?a=2.5:a=3,t==="dateRange"?2.5*1.5:i==="listBox"?a*1.5:a}function ga(e){if(e.length===0)return"inline";const t=e.reduce((i,a)=>i+Vr(a),0);return t<=4?"inline":e.length>=6||t>8?"drawer":"popover"}const Hr=e=>e===Be.SUCCESS?"8":e===Be.DANGER?"1":e===Be.WARNING?"6":e===Be.INFO?"4":"5",ba=e=>{if(!e)return n``;const t=e.message??String(e);return n`<ui5-tag color-scheme="${Hr(e.type)}">${t}</ui5-tag>`},$a=(e,t,i)=>{const a=t.dataType??"",s=t.stereotype??"",r=e[t.id];if(a==="status")return ba(r);if(a==="bool")return r?n`<ui5-icon name="accept"></ui5-icon>`:n`<ui5-icon name="decline"></ui5-icon>`;if(a==="money"||s==="money")return r==null?n``:n`${new Intl.NumberFormat(void 0,{minimumFractionDigits:2}).format(Number(r))}`;if(a==="link"||s==="link"){const o=typeof r=="object"?r?.text??"":r??"",l=t.actionId;if(l)return n`<ui5-link @click="${u=>{u.preventDefault(),i(l,e)}}">${o}</ui5-link>`;const c=typeof r=="object"?r?.href??r?.url??"":"";return n`<a href="${c}">${o}</a>`}if(a==="icon"||s==="icon"){const o=Array.isArray(r)?r:r?String(r).split(","):[];return n`${o.map(l=>n`<ui5-icon name="${l.trim().replace(/^vaadin:|^lumo:/,"")}"></ui5-icon>`)}`}if(s==="html")return n`${de(r??"")}`;if(s==="image"){const o=typeof r=="object"?r?.url??r?.src??"":r??"";return o?n`<img src="${o}" style="max-height: 3rem; object-fit: contain;" />`:n``}if(s==="button"){const o=t.text??t.label??"",l=t.actionId??t.id;return n`<ui5-button design="Transparent"
            @click="${c=>{c.stopPropagation(),i(l,e)}}"
        >${o}</ui5-button>`}if(a==="action"){const o=typeof r=="object"?r?.text??r?.label??"":"",l=typeof r=="object"?r?.methodNameInCrud??r?.actionId??r?.id??t.id:t.actionId??t.id;return n`<ui5-button design="Transparent"
            @click="${c=>{c.stopPropagation(),i(l,e)}}"
        >${o}</ui5-button>`}if(a==="actionGroup"||a==="menu"){const o=typeof r=="object"&&r?.actions?r.actions:Array.isArray(r)?r:[];return n`${o.map(l=>{const c=l.methodNameInCrud??l.actionId??l.id??"";return n`<ui5-button design="Transparent"
                @click="${u=>{u.stopPropagation(),i(c,e)}}"
            >${l.label??l.text??c}</ui5-button>`})}`}return n`${r??""}`};var Gr=Object.defineProperty,Kr=Object.getOwnPropertyDescriptor,me=(e,t,i,a)=>{for(var s=a>1?void 0:a?Kr(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Gr(t,i,s),s};let Z=class extends F{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.sortField="",this.sortDirection="None",this.availableWidthPx=1024,this.selectedItem=null}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}get cols(){return this.metadata?.columns?.map(e=>e.metadata)??[]}get effectiveGridLayout(){const e=this.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":fa(this.cols,this.availableWidthPx):t}getRows(){return this.data[this.id]?.page?.content??[]}toggleSort(e){this.sortField!==e?(this.sortField=e,this.sortDirection="Ascending"):this.sortDirection==="Ascending"?this.sortDirection="Descending":(this.sortDirection="None",this.sortField=""),this.dispatchEvent(new CustomEvent("sort-changed",{detail:{sorts:this.sortField?[{fieldId:this.sortField,direction:this.sortDirection==="Ascending"?"ascending":"descending"}]:[]},bubbles:!0,composed:!0}))}dispatchAction(e,t){this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}renderCellValue(e,t){return $a(e,t,(i,a)=>this.dispatchAction(i,a))}renderTable(e){const t=this.getRows();return n`
            <ui5-table
                no-data-text="${this.emptyStateMessage??this.metadata?.emptyStateMessage??"No data."}"
                overflow-mode="Popin"
                style="width: 100%;"
            >
                ${this.metadata?.rowsSelectionEnabled?n`
                    <ui5-table-selection mode="Multiple" slot="features"></ui5-table-selection>
                `:d}

                <ui5-table-header-row slot="headerRow">
                    ${e.map(i=>n`
                        <ui5-table-header-cell
                            width="${i.width??d}"
                            sort-indicator="${i.sortable&&this.sortField===i.id?this.sortDirection:i.sortable?"None":d}"
                            @click="${i.sortable?()=>this.toggleSort(i.id):d}"
                            style="${i.sortable?"cursor: pointer;":d}"
                        >${i.label}</ui5-table-header-cell>
                    `)}
                </ui5-table-header-row>

                ${t.map((i,a)=>n`
                    <ui5-table-row row-key="${i._rowNumber??a}">
                        ${e.map(s=>n`
                            <ui5-table-cell>${this.renderCellValue(i,s)}</ui5-table-cell>
                        `)}
                    </ui5-table-row>
                `)}
            </ui5-table>`}renderTwoLineList(e){const t=this.getRows(),i=Ci(e),a=i.find(r=>r.identifier)??i[0],s=i.filter(r=>r!==a);return n`
            <ui5-list no-data-text="${this.emptyStateMessage??"No data."}" style="width: 100%;">
                ${t.map(r=>n`
                    <ui5-li
                        description="${s.map(o=>`${o.label}: ${r[o.id]??""}`).join(" · ")}"
                        @click="${()=>this.dispatchAction("_rowClick",r)}"
                        style="cursor: pointer;"
                    >
                        ${a?this.renderCellValue(r,a):n`${r._rowNumber}`}
                    </ui5-li>
                `)}
            </ui5-list>`}renderCards(e){const t=this.getRows(),i=e.slice(0,6),a=i.filter(o=>o.stereotype==="image"),s=i.find(o=>o.identifier)??i[0],r=i.filter(o=>o!==s&&!a.includes(o));return n`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; padding: 0.5rem 0;">
                ${t.map(o=>n`
                    <ui5-card style="cursor: pointer;" @click="${()=>this.dispatchAction("_rowClick",o)}">
                        ${a.length?n`
                            <div slot="header" style="padding: 0.5rem;">
                                ${this.renderCellValue(o,a[0])}
                            </div>
                        `:d}
                        <ui5-card-header
                            title-text="${s?String(o[s.id]??""):""}"
                            slot="header"
                        ></ui5-card-header>
                        <div style="padding: 0.5rem 1rem 1rem; display: flex; flex-direction: column; gap: 0.25rem;">
                            ${r.map(l=>n`
                                <div style="display: flex; gap: 0.5rem; font-size: 0.875rem;">
                                    <span style="color: var(--sapContent_LabelColor, #6a6d70); min-width: 80px;">${l.label}</span>
                                    <span>${this.renderCellValue(o,l)}</span>
                                </div>
                            `)}
                        </div>
                    </ui5-card>
                `)}
            </div>`}renderMasterDetail(e){const t=this.getRows(),i=Ci(e),a=i.find(s=>s.identifier)??i[0];return n`
            <div style="display: flex; gap: 0; height: 100%; min-height: 400px; border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; overflow: hidden;">
                <!-- Left: compact row list -->
                <div style="width: 280px; flex-shrink: 0; border-right: 1px solid var(--sapNeutralBorderColor, #e5e5e5); overflow-y: auto;">
                    <ui5-list no-data-text="${this.emptyStateMessage??"No data."}" style="width: 100%;">
                        ${t.map(s=>n`
                            <ui5-li
                                description="${i.filter(r=>r!==a).map(r=>`${r.label}: ${s[r.id]??""}`).join(" · ")}"
                                ?selected="${this.selectedItem===s}"
                                @click="${()=>{this.selectedItem=s}}"
                                style="cursor: pointer;"
                            >
                                ${a?this.renderCellValue(s,a):n`${s._rowNumber}`}
                            </ui5-li>
                        `)}
                    </ui5-list>
                </div>

                <!-- Right: full detail for selected row -->
                <div style="flex: 1; overflow-y: auto; padding: 1rem;">
                    ${this.selectedItem?n`
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${e.map(s=>n`
                                <div style="display: flex; gap: 0.75rem; align-items: baseline;">
                                    <span style="min-width: 140px; color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem;">${s.label}</span>
                                    <span>${this.renderCellValue(this.selectedItem,s)}</span>
                                </div>
                            `)}
                        </div>
                    `:n`
                        <p style="color: var(--sapContent_LabelColor, #6a6d70);">Select a row to view details.</p>
                    `}
                </div>
            </div>`}renderTree(e){const t=this.getRows(),i=e.find(l=>l.dataType!=="action"&&l.dataType!=="actionGroup"&&l.dataType!=="menu")??e[0],a=e.filter(l=>l!==i),s=l=>String(l[i?.id??""]??""),r=l=>a.map(c=>l[c.id]!=null?`${c.label}: ${l[c.id]}`:"").filter(c=>c).join(" · "),o=l=>n`
            <ui5-tree-item
                text="${s(l)}"
                additional-text="${r(l)||d}"
                ?has-children="${(l.children?.length??0)>0}"
                expanded
                @click="${c=>{c.stopPropagation(),this.dispatchAction("_rowClick",l)}}"
            >
                ${l.children?.map(c=>o(c))}
            </ui5-tree-item>`;return n`
            <ui5-tree no-data-text="${this.emptyStateMessage??"No data."}" style="width: 100%;">
                ${t.map(l=>o(l))}
            </ui5-tree>`}render(){const e=this.cols,t=this.effectiveGridLayout;return t==="list"?this.renderTwoLineList(e):t==="cards"?this.renderCards(e):t==="masterDetail"?this.renderMasterDetail(e):t==="tree"?this.renderTree(e):this.renderTable(e)}};me([v()],Z.prototype,"id",2);me([v()],Z.prototype,"metadata",2);me([v()],Z.prototype,"baseUrl",2);me([v()],Z.prototype,"state",2);me([v()],Z.prototype,"data",2);me([v()],Z.prototype,"appState",2);me([v()],Z.prototype,"appData",2);me([v()],Z.prototype,"emptyStateMessage",2);me([$()],Z.prototype,"sortField",2);me([$()],Z.prototype,"sortDirection",2);me([$()],Z.prototype,"availableWidthPx",2);me([$()],Z.prototype,"selectedItem",2);Z=me([_("mateu-sapui5-table")],Z);var Jr=Object.defineProperty,Yr=Object.getOwnPropertyDescriptor,rt=(e,t,i,a)=>{for(var s=a>1?void 0:a?Yr(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Jr(t,i,s),s};let je=class extends F{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.filtersOpen=!1,this.handleKey=e=>{e.code==="Enter"&&(this.filtersOpen=!1,this.triggerSearch())}}createRenderRoot(){return this}get effectiveFiltersLayout(){const e=this.metadata?.filtersLayout??"auto";return e==="auto"?ga(this.metadata?.filters??[]):e}connectedCallback(){super.connectedCallback(),this.metadata?.searchOnEnter&&this.addEventListener("keydown",this.handleKey)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("keydown",this.handleKey)}triggerSearch(){this.dispatchEvent(new CustomEvent("search-requested",{bubbles:!0,composed:!0,detail:{}}))}clearFilters(){const e={};this.metadata?.filters?.forEach(t=>{e[t.fieldId??t.id]=void 0}),e.searchText=void 0,this.state={...this.state,...e},this.metadata?.filters?.forEach(t=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:t.fieldId??t.id},bubbles:!0,composed:!0}))}),this.triggerSearch()}clearSingleFilter(e){this.state={...this.state,[e]:void 0},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:e},bubbles:!0,composed:!0})),this.triggerSearch()}getFilterDisplayValue(e,t){if(e.options?.length){const i=e.options.find(a=>a.value===String(t));if(i)return i.label}return typeof t=="boolean"?t?"Yes":"No":String(t)}renderActiveFilterChips(){const e=(this.metadata?.filters??[]).map(t=>t).filter(t=>{const i=this.state[t.fieldId];return i!=null&&i!==""});return e.length===0?d:n`
            <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; padding: 0.25rem 0;">
                ${e.map(t=>n`
                    <ui5-token
                        text="${t.label}: ${this.getFilterDisplayValue(t,this.state[t.fieldId])}"
                        @ui5-delete="${()=>this.clearSingleFilter(t.fieldId)}"
                    ></ui5-token>
                `)}
            </div>`}dispatchToolbarAction(e){this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}wrapFilter(e){return{id:e.fieldId??"",metadata:{...e},type:M.ClientSide,style:"",children:[],slot:"",cssClasses:"",initialData:{}}}renderFilterControls(){return n`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; padding: 0.75rem 0;">
                ${this.metadata?.filters?.map(e=>g(this,this.wrapFilter(e),this.baseUrl,this.state,this.data,this.appState,this.appData))}
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end; padding-bottom: 0.5rem;">
                <ui5-button @click="${()=>{this.filtersOpen=!1,this.clearFilters()}}">Clear</ui5-button>
                <ui5-button design="Emphasized" @click="${()=>{this.filtersOpen=!1,this.triggerSearch()}}">Search</ui5-button>
            </div>`}renderInlineFilters(){return n`
            ${this.metadata?.filters?.map(e=>g(this,this.wrapFilter(e),this.baseUrl,this.state,this.data,this.appState,this.appData))}`}renderDrawer(){return n`
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
            ${this.filtersOpen?n`
                <div
                    style="position: fixed; inset: 0; background: rgba(0,0,0,.32); z-index: 199;"
                    @click="${()=>this.filtersOpen=!1}"
                ></div>`:d}`}renderDialog(){return n`
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
            </ui5-dialog>`}render(){const e=(this.metadata?.filters?.length??0)>0,t=this.effectiveFiltersLayout;return n`
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; padding: 0.25rem 0;">
                ${this.metadata?.searchable?n`
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

                ${e&&(t==="popover"||t==="drawer"||t==="dialog")?n`
                    <ui5-button
                        @click="${()=>this.filtersOpen=!this.filtersOpen}"
                    >${this.filtersOpen?"Hide Filters":"Filters"}</ui5-button>
                    <ui5-button @click="${()=>this.clearFilters()}">Clear</ui5-button>
                `:d}

                ${this.metadata?.searchable?n`
                    <ui5-button design="Emphasized" @click="${()=>this.triggerSearch()}">Search</ui5-button>
                `:d}

                ${this.metadata?.toolbar?.map(i=>n`
                    <ui5-button @click="${()=>this.dispatchToolbarAction(i.actionId)}">
                        ${i.label}
                    </ui5-button>
                `)}

                <slot></slot>
            </div>

            ${this.renderActiveFilterChips()}

            ${e&&t==="popover"&&this.filtersOpen?n`
                <div style="border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; padding: 0.75rem; margin-top: 0.25rem;">
                    ${this.renderFilterControls()}
                </div>
            `:d}

            ${e&&t==="drawer"?this.renderDrawer():d}

            ${e&&t==="dialog"?this.renderDialog():d}
        `}};rt([v()],je.prototype,"metadata",2);rt([v()],je.prototype,"baseUrl",2);rt([v()],je.prototype,"state",2);rt([v()],je.prototype,"data",2);rt([v()],je.prototype,"appState",2);rt([v()],je.prototype,"appData",2);rt([$()],je.prototype,"filtersOpen",2);je=rt([_("mateu-sapui5-filter-bar")],je);var Xr=Object.defineProperty,Qr=Object.getOwnPropertyDescriptor,jt=(e,t,i,a)=>{for(var s=a>1?void 0:a?Qr(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Xr(t,i,s),s};let Ct=class extends F{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.pages=[]}createRenderRoot(){return this}updated(e){if(super.updated(e),e.has("totalElements")||e.has("pageNumber")||e.has("pageSize")){const t=[],a=Math.ceil(this.totalElements/this.pageSize)-1;this.totalElements>0&&(this.pageNumber>0&&t.push({pageNumber:0,text:"«",clickable:!0}),this.pageNumber>1&&t.push({pageNumber:this.pageNumber-1,text:"‹",clickable:!0}),t.push({pageNumber:this.pageNumber,text:`${this.pageNumber+1}`,clickable:!1}),this.pageNumber<a-1&&t.push({pageNumber:this.pageNumber+1,text:"›",clickable:!0}),this.pageNumber<a&&t.push({pageNumber:a,text:"»",clickable:!0})),this.pages=t}}goToPage(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){return this.totalElements?n`
            <div style="display: flex; align-items: center; gap: 0.25rem; padding: 0.5rem 0; flex-wrap: wrap;">
                ${this.pages.length>=2&&this.totalElements>this.pageSize?n`
                    <span style="color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem; margin-right: 0.25rem;">Page:</span>
                    ${this.pages.map(e=>e.clickable?n`<ui5-button design="Transparent" @click="${()=>this.goToPage(e.pageNumber)}">${e.text}</ui5-button>`:n`<ui5-button design="Default" ?disabled="${!0}">${e.text}</ui5-button>`)}
                    <span style="color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem; margin-left: 0.5rem;">|</span>
                `:d}
                <span style="color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem;">
                    Total: <strong>${this.totalElements}</strong>
                </span>
                <slot></slot>
            </div>
        `:n``}};jt([v({type:Number})],Ct.prototype,"totalElements",2);jt([v({type:Number})],Ct.prototype,"pageSize",2);jt([v({type:Number})],Ct.prototype,"pageNumber",2);jt([$()],Ct.prototype,"pages",2);Ct=jt([_("mateu-sapui5-pagination")],Ct);const Zr=(e,t,i,a)=>{const s=e.metadata;return n`<ui5-button
                    part="button"
                    @click=${Ql}
                    data-action-id="${s.actionId}"
                    slot="${e.slot}"
            >${s.label}</ui5-button>`},en=e=>{const t=e.target,i=e.detail?.selectedOption,a=i?.value??i?.textContent?.trim()??"";t.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:t.id},bubbles:!0,composed:!0}))},tn=e=>{const t=e.target,a=(e.detail?.items??[]).map(s=>s.dataset?.value??s.text);t.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:t.id},bubbles:!0,composed:!0}))},ue=(e,t,i)=>{e?.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:t},bubbles:!0,composed:!0}))},Si=(e,t,i)=>{e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:i},bubbles:!0,composed:!0}))},ri=e=>(e??"").replace(/^vaadin:/,"").replace(/^lumo:/,""),I=(e,t,i,a,s,r="")=>n`
    <div style="${r}${e.style??""}" data-field-id="${t.fieldId??d}">
        ${a?n`<ui5-label for="${i}" show-colon ?required="${t.required}">${a}</ui5-label>`:d}
        ${s}
        ${t.description?n`
            <div style="font-size: 0.75rem; color: var(--sapContent_LabelColor, #6a6d70); margin-top: 0.125rem;">${t.description}</div>
        `:d}
    </div>`,ei=(e,t)=>{const i=e!=null?String(e):"";return!t||i.length<=15?d:n`<ui5-icon
        slot="icon"
        name="copy"
        style="cursor: pointer;"
        @click="${()=>navigator.clipboard.writeText(i).catch(()=>{})}"
    ></ui5-icon>`},ya=(e,t)=>{const i=typeof e=="number"?e:parseFloat(String(e));return isNaN(i)?String(e):t&&t.locale&&t.currency?new Intl.NumberFormat(t.locale,{style:"currency",currency:t.currency}).format(i):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(i)},Hi=new WeakMap,wa=(e,t,i,a,s)=>{const r=s?.[i]??s?.[a],o=r?.content??(Array.isArray(r)?r:void 0);if(o)return o;const l=t.remoteCoordinates?.action;if(l){let c=Hi.get(e);c||(c=new Set,Hi.set(e,c)),c.has(a)||(c.add(a),setTimeout(()=>Si(e,l,{searchText:"",fieldId:a,size:200,page:0,sort:void 0})))}return[]},De=(e,t,i,a,s)=>t.remoteCoordinates?wa(e,t,i,a,s):t.options??[],Gi=(e,t,i,a)=>n`
    <ui5-select
        id="${t}"
        ?disabled="${e.disabled}"
        @change="${en}"
        style="width: 100%;"
    >
        ${e.required?d:n`<ui5-option value="">-- Select --</ui5-option>`}
        ${a.map(s=>n`
            <ui5-option value="${s.value}" ?selected="${i===s.value}">${s.label}</ui5-option>
        `)}
    </ui5-select>`,Ki=(e,t,i,a)=>{const s=a.find(r=>r.value===i);return n`
        <ui5-combobox
            id="${t}"
            value="${s?.label??i??""}"
            ?disabled="${e.disabled}"
            ?readonly="${e.readOnly}"
            @selection-change="${r=>{const o=r.detail?.item;ue(r.target,e.fieldId,o?.dataset?.value??o?.text)}}"
            style="width: 100%;"
        >
            ${a.map(r=>n`
                <ui5-cb-item text="${r.label??r}" data-value="${r.value??r}"></ui5-cb-item>
            `)}
        </ui5-combobox>`},an=(e,t,i)=>n`
    <div style="display: flex; flex-wrap: wrap; gap: 0.25rem 1rem;">
        ${i.map(a=>n`
            <div style="display: flex; align-items: center; gap: 0.25rem;">
                ${a.icon?n`<ui5-icon name="${ri(a.icon)}"></ui5-icon>`:d}
                ${a.image?n`<img src="${a.image}" alt="${a.label}" style="height: 1rem;" />`:d}
                <ui5-radio-button
                    name="rg-${e.fieldId}"
                    text="${a.label}"
                    ?checked="${t===a.value}"
                    ?disabled="${e.disabled}"
                    @change="${s=>{s.target.checked&&ue(s.target,e.fieldId,a.value)}}"
                ></ui5-radio-button>
                ${a.description?n`<span style="font-size: 0.8125rem; color: var(--sapContent_LabelColor, #6a6d70);">${a.description}</span>`:d}
            </div>
        `)}
    </div>`,sn=(e,t)=>i=>{const s=(i.detail?.selectedItems??[]).map(r=>r.dataset?.value);ue(i.target,e,t?s:s[0])},xa=(e,t,i,a)=>{const s=r=>a?Array.isArray(t)&&t.includes(r.value):t===r.value;return n`
        <ui5-list
            selection-mode="${a?"Multiple":"Single"}"
            @selection-change="${sn(e.fieldId,a)}"
            style="width: 100%; border: 1px solid var(--sapField_BorderColor, #89919a); border-radius: 0.25rem;"
        >
            ${i.map(r=>n`
                <ui5-li
                    data-value="${r.value}"
                    ?selected="${s(r)}"
                    description="${r.description??d}"
                    icon="${r.icon?ri(r.icon):d}"
                >${r.label}</ui5-li>
            `)}
        </ui5-list>`},ki=(e,t,i,a)=>n`
    <div style="display: flex; gap: 0.75rem; padding: 0.25rem 0; flex-wrap: wrap;">
        ${i.map(s=>{const r=a?Array.isArray(t)&&t.includes(s.value):t==s.value,o=()=>{if(!a)return s.value;const l=Array.isArray(t)?t:[];return l.includes(s.value)?l.filter(c=>c!==s.value):[...l,s.value]};return n`
                <div role="button" tabindex="0"
                     style="min-width: 10rem; min-height: 3rem; padding: 0.75rem 1rem; cursor: pointer; border-radius: 0.5rem; border: 1px solid ${r?"var(--sapButton_Selected_BorderColor, #0064d9)":"var(--sapNeutralBorderColor, #e5e5e5)"}; background: ${r?"var(--sapList_SelectionBackgroundColor, #e5f0fa)":"transparent"};"
                     @click="${l=>ue(l.target,e.fieldId,o())}"
                >
                    <div style="display: flex; align-items: center; gap: 0.5rem; pointer-events: none;">
                        ${s.icon?n`<ui5-icon name="${ri(s.icon)}"></ui5-icon>`:d}
                        ${s.image?n`<img src="${s.image}" alt="${s.label}" style="${s.imageStyle??"width: 2rem;"}" />`:d}
                        <div>
                            <div>${s.label}</div>
                            ${s.description?n`
                                <div style="font-size: 0.8125rem; color: var(--sapContent_LabelColor, #6a6d70);">${s.description}</div>
                            `:d}
                        </div>
                    </div>
                </div>`})}
    </div>`,rn=(e,t,i)=>{const a=(e.optionsColumns??0)>1,s=r=>o=>{const l=Array.isArray(t)?t:[],u=o.target.checked?[...l.filter(p=>p!==r),r]:l.filter(p=>p!==r);ue(o.target,e.fieldId,u)};return n`
        <div style="display: ${a?"grid; grid-template-columns: repeat(3, 1fr); gap: 0.25rem 2rem":"flex; flex-direction: column"};">
            ${i.map(r=>n`
                <ui5-checkbox
                    text="${r.label}"
                    ?checked="${Array.isArray(t)&&t.includes(r.value)}"
                    ?disabled="${e.disabled}"
                    ?readonly="${e.readOnly}"
                    @change="${s(r.value)}"
                ></ui5-checkbox>
            `)}
        </div>`},nn=(e,t,i)=>{let a=e;return isNaN(a)&&(a=0),n`<div style="display: flex; align-items: center; gap: 0.25rem;">
        ${[1,2,3,4,5].map(r=>n`
            <ui5-icon
                name="${r<=a?"favorite":"unfavorite"}"
                style="cursor: ${i?"default":"pointer"}; color: ${r<=a?"var(--sapIndicationColor_5)":"var(--sapContent_NonInteractiveIconColor)"}; font-size: 1.5rem;"
                @click="${i?d:o=>ue(o.target,t,r)}"
            ></ui5-icon>
        `)}
    </div>`},on=e=>t=>{const i=t.target,a=i.files?.[0];if(!a)return;const s=new FileReader;s.onload=()=>ue(i,e,s.result),s.readAsDataURL(a),i.value=""},ln=e=>t=>{t.target.getRootNode().querySelector(`#${CSS.escape(e)}`)?.click()},dn=(e,t,i)=>{const a=i!=null&&i!=="",s=`${t}_file`;return n`
        <div style="display: flex; flex-direction: column; align-items: stretch; gap: 0.5rem; max-width: 320px;">
            ${a?n`
                <img src="${i}"
                     style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; ${e.style??""}">
            `:n`
                <div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--sapNeutralBorderColor, #b3b3b3); border-radius: 0.5rem; color: var(--sapContent_LabelColor, #6a6d70);">
                    <ui5-icon name="picture" style="height: 2rem; width: 2rem;"></ui5-icon>
                </div>
            `}
            <input type="file" id="${s}" accept="image/*" style="display: none;" @change="${on(e.fieldId)}">
            <div style="display: flex; gap: 0.5rem;">
                <ui5-button icon="upload" @click="${ln(s)}">${a?"Replace":"Upload"}</ui5-button>
                ${a?n`
                    <ui5-button design="Transparent" icon="delete"
                        @click="${r=>ue(r.target,e.fieldId,"")}"
                    >Delete</ui5-button>`:d}
            </div>
        </div>`},cn=(e,t)=>{const i=e[t.id];return t.dataType==="bool"||t.dataType==="boolean"?n`<ui5-icon name="${i?"accept":"decline"}"></ui5-icon>`:n`${i??""}`},un=(e,t)=>{const i=Array.isArray(t)?t:[],a=e.columns.map(s=>s.metadata);return n`
        <ui5-table style="width: 100%; margin-top: 0.5rem;">
            <ui5-table-header-row slot="headerRow">
                ${a.map(s=>n`
                    <ui5-table-header-cell width="${s.width??d}">${s.label}</ui5-table-header-cell>
                `)}
            </ui5-table-header-row>
            ${i.map((s,r)=>n`
                <ui5-table-row row-key="${s._rowNumber??r}">
                    ${a.map(o=>n`
                        <ui5-table-cell>${cn(s,o)}</ui5-table-cell>
                    `)}
                </ui5-table-row>
            `)}
        </ui5-table>`},hn=(e,t,i)=>{const a=t===!0||t==="true";return n`
        <div style="${e.style??d}">
            <ui5-tag color-scheme="${a?"8":d}" style="${a?"":"opacity: 0.4;"}">${i}</ui5-tag>
        </div>`},pn=(e,t,i,a,s,r,o)=>{let l=Ue(a,r,o);const c=l&&typeof l=="object"&&"value"in l?l:null;l&&l.value&&(l=l.value);const u=t.dataType=="bool"||l===!0||l===!1,p=t.dataType=="money",m=l!=null&&l!=="";let f=m?String(l):"—";p&&m&&(f=ya(l,c));const y=u?n`<ui5-icon name="${l===!0||l==="true"?"accept":"less"}" style="height: 16px; width: 16px;"></ui5-icon>`:t.multiline?n`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${f}</span>`:n`<span style="display: block; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${p?" font-variant-numeric: tabular-nums;":""}">${f}</span>`;return I(e,t,i,s,y,p?"text-align: right; ":"")},mn=(e,t,i,a,s,r,o)=>{let l=Ue(a,r,o)||o?.[t.fieldId];return l&&l.value&&(l=l.value),t.stereotype=="image"||t.stereotype=="uploadableImage"?I(e,t,i,s,n`<img src="${l}" id="${i}_img" style="${t.style??d}">`):t.dataType=="bool"?I(e,t,i,s,n`<ui5-icon name="${l?"accept":"less"}" style="height: 20px;"></ui5-icon>`):t.stereotype=="link"?I(e,t,i,s,n`<ui5-link href="${l??""}" target="_blank">${l??""}</ui5-link>`):t.stereotype=="color"?I(e,t,i,s,n`<span style="background-color: ${l}; display: block; height: 20px; width: 40px; border: 1px solid var(--sapContent_LabelColor, #6a6d70); border-radius: 0.25rem;"></span>`):I(e,t,i,s,n`
        <ui5-input
            id="${i}"
            readonly
            value="${l??""}"
            style="width: 100%;"
        >${ei(l,!0)}</ui5-input>`)},vn=(e,t,i,a,s,r,o)=>{const l=i.fieldId??"";if(i.stereotype=="searchable"){const u=m=>Si(m.currentTarget,"code-"+l,{code:m.currentTarget.value}),p=m=>Si(m.currentTarget,"codesearch-"+l,{});return I(t,i,a,r,n`
            <div style="display: flex; gap: 0.33rem; align-items: center;">
                <ui5-input style="width: 5rem;" value="${s??""}" @change="${u}"></ui5-input>
                <ui5-input readonly value="${o?.[l+"-label"]??""}" style="flex: 1;"></ui5-input>
                <ui5-button icon="search" @click="${p}"></ui5-button>
            </div>`)}if(i.stereotype=="select"){const u=s&&s.value?s.value:s;return I(t,i,a,r,Gi(i,a,u,De(e,i,a,l,o)))}if(i.stereotype=="markdown")return I(t,i,a,r,n`
            <mateu-markdown .content="${s??""}"></mateu-markdown>`);if(i.stereotype=="combobox")return I(t,i,a,r,Ki(i,a,s,De(e,i,a,l,o)));if(i.stereotype=="listBox")return I(t,i,a,r,xa(i,s,De(e,i,a,l,o),!1));if(i.stereotype=="radio")return I(t,i,a,r,an(i,s,De(e,i,a,l,o)));if(i.stereotype=="popover"){const u=De(e,i,a,l,o),p=`${a}_popover`,m=y=>{const b=y.target.getRootNode().querySelector(`#${CSS.escape(p)}`);b&&(b.opener=y.currentTarget,b.open=!b.open)},f=u.find(y=>y.value===s)?.label??s??"";return I(t,i,a,r,n`
            <div style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;" @click="${m}">
                <span>${f}</span>
                <ui5-icon name="slim-arrow-down"></ui5-icon>
            </div>
            <ui5-popover id="${p}" placement="Bottom">
                ${ki(i,s,u,!1)}
            </ui5-popover>`)}if(i.stereotype=="choice")return I(t,i,a,r,ki(i,s,De(e,i,a,l,o),!1));if(i.stereotype=="richText"||i.stereotype=="richtext")return I(t,i,a,r,n`
            <ui5-textarea
                id="${a}"
                ?disabled="${i.disabled}"
                ?readonly="${i.readOnly}"
                @change="${le}"
                value="${s??""}"
                growing
                growing-max-lines="10"
                style="width: 100%;"
            ></ui5-textarea>`);if(i.stereotype=="textarea")return I(t,i,a,r,n`
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
            ></ui5-textarea>`);if(i.stereotype=="link")return I(t,i,a,r,n`
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
            ></ui5-icon></ui5-input>`);if(i.stereotype=="icon")return I(t,i,a,r,n`
            <ui5-input
                id="${a}"
                ?disabled="${i.disabled}"
                value="${s??""}"
                @change="${le}"
                style="width: 100%;"
            >${s?n`<ui5-icon slot="icon" name="${ri(s)}"></ui5-icon>`:d}</ui5-input>`);if(i.stereotype=="html")return I(t,i,a,r,n`
            <div style="line-height: 20px; margin-top: 5px;">${de(""+(s??""))}</div>`);if(i.stereotype=="image")return I(t,i,a,r,n`
            <img src="${s??""}" style="${t.style??d}" class="${t.cssClasses??d}">`);if(i.stereotype=="uploadableImage")return I(t,i,a,r,dn(i,a,s));if(i.stereotype=="color")return I(t,i,a,r,n`
            <input type="color" value="${s??"#000000"}" ?disabled="${i.disabled}"
                   style="display: block; height: 2rem; width: 4rem; border: 1px solid var(--sapField_BorderColor, #89919a); border-radius: 0.25rem; background: transparent; cursor: pointer;"
                   @input="${u=>ue(u.target,l,u.target.value)}"/>`);if(i.options&&i.options.length>0)return I(t,i,a,r,Gi(i,a,s,i.options));if(i.remoteCoordinates)return I(t,i,a,r,Ki(i,a,s,wa(e,i,a,l,o)));const c=(()=>{switch(i.stereotype){case"email":return"Email";case"password":return"Password";case"url":return"URL";case"phone":case"tel":return"Tel";case"search":return"Search";default:return"Text"}})();return I(t,i,a,r,n`
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
        >${ei(s,i.readOnly)}</ui5-input>`)},fn=(e,t,i,a,s)=>{const r=t.metadata,o=r?.fieldId??"",l=a&&o in a?a[o]:r?.initialValue,c=t.id||o,u=r.label+"",p=ze(u,a,s),m=!p||p=="null"||p=="undefined"?void 0:p,f=r.dataType,y=r.stereotype;if(y=="badge")return hn(t,l,m??r.fieldId??"");if(y=="plainText")return pn(t,r,c,l,m,a,s);if(r.readOnly&&y!="grid"&&f!="status"&&f!="money")return mn(t,r,c,l,m,a,s);if(y=="grid"&&r.columns&&r.columns.length>0)return I(t,r,c,m,un(r,l));if(f=="file"||y=="file")return I(t,r,c,m,n`
            <ui5-file-uploader id="${c}" ?disabled="${r.disabled}" @change="${le}">
                <ui5-button icon="upload">Upload</ui5-button>
            </ui5-file-uploader>`);if(f=="dateRange"){const w=l?`${l.from} - ${l.to}`:"";return I(t,r,c,m,n`
            <ui5-daterange-picker
                id="${c}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                format-pattern="yyyy-MM-dd"
                value="${w}"
                @change="${b=>{const C=b.target,k=B=>B?`${B.getFullYear()}-${String(B.getMonth()+1).padStart(2,"0")}-${String(B.getDate()).padStart(2,"0")}`:void 0,T=k(C.startDateValue),z=k(C.endDateValue);ue(b.target,o,T&&z?{from:T,to:z}:void 0)}}"
                style="width: 100%;"
            ></ui5-daterange-picker>`)}if(f=="date"||f=="LocalDate")return I(t,r,c,m,n`
            <ui5-date-picker
                id="${c}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                format-pattern="yyyy-MM-dd"
                value="${l??""}"
                @change="${le}"
                style="width: 100%;"
            ></ui5-date-picker>`);if(f=="dateTime"||f=="datetime"||f=="LocalDateTime"||f=="ZonedDateTime")return I(t,r,c,m,n`
            <ui5-datetime-picker
                id="${c}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                value="${l??""}"
                @change="${le}"
                style="width: 100%;"
            ></ui5-datetime-picker>`);if(f=="time"||f=="LocalTime")return I(t,r,c,m,n`
            <ui5-time-picker
                id="${c}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                value="${l??""}"
                @change="${le}"
                style="width: 100%;"
            ></ui5-time-picker>`);if(f=="number"||y=="currency")return I(t,r,c,m,n`
            <ui5-input
                id="${c}"
                type="Number"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                value="${l??""}"
                @change="${le}"
                style="width: 100%;"
            >${ei(l,r.readOnly)}</ui5-input>`);if(f=="integer")return y=="stars"?I(t,r,c,m,nn(l,o,r.disabled)):y=="slider"?I(t,r,c,m,n`
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
                ></ui5-slider>`):r.stepButtonsVisible?I(t,r,c,m,n`
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
                ></ui5-step-input>`):I(t,r,c,m,n`
            <ui5-input
                id="${c}"
                type="Number"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                value="${l??""}"
                @change="${le}"
                style="width: 100%;"
            >${ei(l,r.readOnly)}</ui5-input>`);if(f=="bool"||f=="boolean"||f=="Boolean")return y=="toggle"?n`
                <div style="display: flex; align-items: center; gap: 0.5rem; ${t.style??""}">
                    <ui5-label for="${c}" ?required="${r.required}">${m}</ui5-label>
                    <ui5-switch
                        id="${c}"
                        ?checked="${l}"
                        ?disabled="${r.disabled}"
                        @change="${aa}"
                    ></ui5-switch>
                </div>`:n`
            <div style="${t.style??d}">
                <ui5-checkbox
                    id="${c}"
                    text="${m??""}"
                    ?checked="${l}"
                    ?disabled="${r.disabled}"
                    ?readonly="${r.readOnly}"
                    @change="${aa}"
                ></ui5-checkbox>
            </div>`;if(f=="array"){if(y=="choice")return I(t,r,c,m,ki(r,l,De(e,r,c,o,s),!0));if(y=="listBox")return I(t,r,c,m,xa(r,l,De(e,r,c,o,s),!0));if(y=="combobox"){const w=De(e,r,c,o,s),b=Array.isArray(l)?l:[];return I(t,r,c,m,n`
                <ui5-multi-combobox
                    id="${c}"
                    ?disabled="${r.disabled}"
                    ?readonly="${r.readOnly}"
                    @selection-change="${tn}"
                    style="width: 100%;"
                >
                    ${w.map(C=>n`
                        <ui5-mcb-item
                            text="${C.label??C}"
                            data-value="${C.value??C}"
                            ?selected="${b.includes(C.value??C)}"
                        ></ui5-mcb-item>
                    `)}
                </ui5-multi-combobox>`)}return I(t,r,c,m,rn(r,l,De(e,r,c,o,s)))}if(f=="money"||y=="money"){if(r.readOnly){const k=l&&typeof l=="object"&&"value"in l?l:null,T=k?k.value:l;return I(t,r,c,m,n`
                <div style="min-width: 8rem; text-align: right; font-variant-numeric: tabular-nums;">${l!=null?ya(T,k):""}</div>`)}const w=l&&typeof l=="object"&&"value"in l?l:{value:typeof l=="number"?l:parseFloat(String(l??0))||0,currency:"EUR",locale:"es-ES"},b=k=>{const T=k.detail?.selectedOption;ue(k.target,o,{...w,currency:T?.value??T?.textContent?.trim()??w.currency})},C=k=>{const T=k.target.value;ue(k.target,o,{...w,value:T?parseFloat(T):0})};return I(t,r,c,m,n`
            <div style="display: flex; gap: 0.25rem;">
                <ui5-select style="width: 6rem;" ?disabled="${r.disabled}" @change="${b}">
                    ${["EUR","USD","GBP"].map(k=>n`
                        <ui5-option value="${k}" ?selected="${w.currency===k}">${k}</ui5-option>
                    `)}
                </ui5-select>
                <ui5-input
                    id="${c}"
                    type="Number"
                    ?disabled="${r.disabled}"
                    value="${w.value??""}"
                    @change="${C}"
                    style="flex: 1; text-align: right;"
                ></ui5-input>
            </div>`)}if(f=="status")return I(t,r,c,m,ba(l));if(f=="range"){const w=l;return I(t,r,c,m,n`
            <ui5-range-slider
                start-value="${w?.from??0}"
                end-value="${w?.to??0}"
                min="${r.sliderMin??0}"
                max="${r.sliderMax??10}"
                step="${r.step||d}"
                ?disabled="${r.disabled}"
                @change="${b=>{const C=b.target;ue(b.target,o,{from:C.startValue,to:C.endValue})}}"
                style="min-width: 10rem; width: 100%;"
            ></ui5-range-slider>`)}return vn(e,t,r,c,l,m,s)};let wt=[];class gn{constructor(){this.axiosInstance=Na.create({timeout:6e4}),this.axiosInstance.interceptors.request.use(t=>(this.addAuthToken(t),this.addSessionId(t),t))}addSessionId(t){let i=sessionStorage.getItem("__mateu_sesion_id");i||(i=Q(),sessionStorage.setItem("__mateu_sesion_id",i)),t.headers["X-Session-Id"]=i}addAuthToken(t){const i=localStorage.getItem("__mateu_auth_token");i&&(t.headers.Authorization="Bearer "+i)}async wrap(t,i,a,s){return a||i.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),t.then(r=>(i.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:s}})),r)).catch(r=>{throw r?.code=="ERR_CANCELED"?i.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{}})):i.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:s,reason:this.serialize(r)}})),r})}serialize(t){return t?.message?t:JSON.stringify(t)}async get(t){const i=new AbortController;return wt=[...wt,i],this.axiosInstance.get(t,{signal:i.signal})}async post(t,i){const a=new AbortController;return wt=[...wt,a],this.axiosInstance.post(t,i,{signal:a.signal})}async abortAll(){wt.forEach(t=>t.abort()),wt=[]}async runAction(t,i,a,s,r,o,l,c,u,p,m){return i&&i.startsWith("/")&&(i=i.substring(1)),await this.wrap(this.post(t+"/mateu/v3/sync/"+(i&&i!=""?i:"_no_route"),{serverSideType:l,appState:o,componentState:c,parameters:u,initiatorComponentId:r,consumedRoute:a,route:i&&i!=""?"/"+i:"",actionId:s}).then(f=>f.data),p,m,s)}}const Ca=new gn;var qt=(e=>(e.Add="Add",e.Replace="Replace",e.ReplaceKeepData="ReplaceKeepData",e))(qt||{}),bn=Object.defineProperty,Sa=(e,t,i,a)=>{for(var s=void 0,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=o(t,i,s)||s);return s&&bn(t,i,s),s};class ni extends F{constructor(){super(...arguments),this.id="",this.baseUrl="",this.callbackToken="",this.createElement=t=>{const i=t.data,a=document.createElement(i.name);for(let s in i.attributes)a.setAttribute(s,i.attributes[s]);for(let s in i.on)a.addEventListener(s,r=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.on[s],parameters:{event:r}},bubbles:!0,composed:!0}))});return a},this.closeModal=()=>{const t=this.shadowRoot?.querySelectorAll("mateu-dialog");if(t&&t.length>0){t[t.length-1].close();return}this.dispatchEvent(new CustomEvent("close-modal-requested",{bubbles:!0,composed:!0}))},this.changeFavicon=t=>{let i=document.querySelector('link[rel="icon"]');i!==null?i.setAttribute("href",t):(i=document.createElement("link"),i.setAttribute("rel","icon"),i.setAttribute("href",t),document.head.appendChild(i))}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=tt.subscribe(t=>{if(t.command){const i=t.command;this.id==i.targetComponentId&&this.applyCommand(i)}if((!t.callbackToken||!this.callbackToken||t.callbackToken===this.callbackToken)&&t.fragment){const i=t.fragment;this.id==i.targetComponentId&&(this.applyFragment(i),this.completeMenu(i))}})}completeMenu(t){if(t.component&&t.component.type==M.ClientSide){const i=t.component,a=i.metadata;if(a?.type==h.App){const s=a,r=this.getRemoteMenus(s.menu);if(r.length>0){const o=r.map(l=>Ca.runAction(l.baseUrl,l.route,"_empty","",l.baseUrl+"#"+l.route,void 0,void 0,void 0,l.params,this,!0));Promise.all(o).then(l=>{s.menu=this.updateMenu(s.menu,l.map(c=>c.fragments).filter(c=>c).map(c=>c).flat()),s.variant=ve.MENU_ON_TOP,tt.next({fragment:{component:i,data:void 0,state:void 0,action:qt.Replace,targetComponentId:this.id,containerId:void 0},callbackToken:this.callbackToken})})}}}}updateMenu(t,i){const a=[];return t.forEach(s=>{if(s.remote){const r=i.find(o=>o.targetComponentId==s.baseUrl+"#"+s.route);if(r&&r.component?.type==M.ClientSide){const o=r.component;if(o.metadata?.type==h.App){const l=o.metadata,c=s.serverSideType&&s.serverSideType!=""?s.serverSideType:l.serverSideType;this.changeBaseUrl(l.menu,s.baseUrl,c,s.route,l.route),a.push(...l.menu)}}}else a.push(s)}),a}changeBaseUrl(t,i,a,s,r){t.forEach(o=>{o.baseUrl||(o.submenus&&o.submenus.length>0?this.changeBaseUrl(o.submenus,i,a,s,r):(o.consumedRoute=r??"",o.baseUrl=i,o.serverSideType=a,o.uriPrefix=s))})}getRemoteMenus(t){const i=[];return t.forEach(a=>{a.remote&&i.push(a)}),i}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(t){if(t.type=="SetWindowTitle"&&(document.title=t.data),t.type=="SetFavicon"&&this.changeFavicon(t.data),t.type=="DispatchEvent"){const i=t.data;if(i&&i.eventName){const a=this.component,s=a?.emitsName??a?.serverSideType;let r=i.payload??i.detail;s&&r&&typeof r=="object"&&(r={...r,__source:s}),this.dispatchEvent(new CustomEvent(i.eventName,{detail:r,bubbles:!0,composed:!0}))}}if(t.type=="NavigateTo"){const i=t.data;i&&(i.startsWith("http:")||i.startsWith("https:")?window.open(t.data,"_blank"):window.location.href=t.data)}if(t.type=="PushStateToHistory"){const i=t.data;i!==void 0&&this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:i},bubbles:!0,composed:!0}))}if(t.type=="RunAction"){const i=t.data;if(i&&i.actionId)if(i.targetComponentId){const a={command:{type:"RunAction",data:{actionId:i.actionId},targetComponentId:i.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:""};setTimeout(()=>tt.next(a))}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(t.type=="MarkAsDirty"&&this.dispatchEvent(new CustomEvent("dirty",{detail:{},bubbles:!0,composed:!0})),t.type=="MarkAsClean"&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),t.type=="DownloadFile"){const i=t.data;if(i&&i.base64Content){const a=atob(i.base64Content),s=new Uint8Array(a.length);for(let c=0;c<a.length;c++)s[c]=a.charCodeAt(c);const r=new Blob([s],{type:i.mimeType}),o=URL.createObjectURL(r),l=document.createElement("a");l.href=o,l.download=i.filename??"export",l.click(),URL.revokeObjectURL(o)}}if(t.type=="CloseModal"&&this.closeModal(),t.type=="AddContentToHead"){const i=t.data;if(i&&i.name){if(i.attributes&&i.attributes.id&&document.getElementById(i.attributes.id))return;document.head.appendChild(this.createElement(t))}}if(t.type=="AddContentToBody"){const i=t.data;if(i&&i.name){if(i.attributes&&i.attributes.id&&document.getElementById(i.attributes.id))return;document.body.appendChild(this.createElement(t))}}}}Sa([v()],ni.prototype,"id");Sa([v()],ni.prototype,"baseUrl");var $n=Object.defineProperty,yn=(e,t,i,a)=>{for(var s=void 0,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=o(t,i,s)||s);return s&&$n(t,i,s),s};class Wt extends ni{applyFragment(t){}manageActionRequestedEvent(t){}}yn([v()],Wt.prototype,"component");var Ze=(e=>(e.OnLoad="OnLoad",e.OnSuccess="OnSuccess",e.OnError="OnError",e.OnValueChange="OnValueChange",e.OnCustomEvent="OnCustomEvent",e.AutoSave="AutoSave",e))(Ze||{}),wn=Object.defineProperty,oi=(e,t,i,a)=>{for(var s=void 0,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=o(t,i,s)||s);return s&&wn(t,i,s),s};class bt extends Wt{constructor(){super(...arguments),this.state={},this.data={},this.appData={},this.appState={},this.triggerOnLoad=()=>{const t=this.component;this.registerCustomEventListeners(),t.triggers?.filter(i=>i.type==Ze.OnLoad).forEach(i=>{if((!i.condition||this._evalExpr(i.condition))&&!i.triggered){const s=i;s.triggered=!0;var a=s.times-1;s.timeoutMillis>0?this.scheduleOnload(s,a,this.id):this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(t,i,a)=>{if(a!=this.component?.id)return;const s=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,callbackToken:s},bubbles:!0,composed:!0}))},t.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=t=>{if(!(t instanceof CustomEvent))return;const i=t,s=(this.component.triggers??[]).filter(r=>r.type==Ze.OnCustomEvent).filter(r=>r.eventName==i.type).filter(r=>r.source!=="COMPONENT"||i.detail?.__source===r.from);s.length!==0&&(s.some(r=>!r.source||r.source==="SELF")&&(t.stopPropagation(),t.preventDefault()),s.forEach(r=>{(!r.condition||this._evalExpr(r.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,parameters:i.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(t){return ca(t,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(t){return ss(t,this.state??{},this.data??{},this._interpolationExtra())}applyFragment(t){if(this.id==t.targetComponentId){if(t.component)if(qt.Add==t.action)this.component&&this.component.children?.push(t.component);else{if(this.callbackToken=Q(),t.component?.type==M.ServerSide)if(this.component){const a=this.component,s=t.component;a.actions=s.actions,a.type=s.type,a.rules=s.rules,a.triggers=s.triggers,a.serverSideType=s.serverSideType,a.route=s.route,a.initialData=s.initialData,a.validations=s.validations,a.cssClasses=s.cssClasses,a.slot=s.slot,a.style=s.style,a.children=s.children,(a.serverSideType!=s.serverSideType||a.id!=s.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=t.component,setTimeout(()=>this.triggerOnLoad());else{const a=[t.component];this.component&&(this.component.children=a)}t.action!==qt.ReplaceKeepData&&(this.state={},this.data={})}if(t.state&&(this.state={...this.state,...t.state}),t.data){for(const a in t.data){const s=t.data[a]?.page;s?.pageNumber>0&&this.data[a]&&this.data[a].page.content&&(s.content?s.content=[...this.data[a].page.content,...s.content]:s.content=[...this.data[a].page.content])}this.data={...this.data,...t.data}}this.registerCustomEventListeners();const i=V.getAfterRenderHook();i&&setTimeout(()=>i(this)),this.requestUpdate()}}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:i,name:a})=>i.removeEventListener(a,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(i=>i.type==Ze.OnCustomEvent).forEach(i=>{const a=i.source==="DOCUMENT"||i.source==="COMPONENT"?document:this;a.addEventListener(i.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:a,name:i.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:t,name:i})=>t.removeEventListener(i,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}}oi([v()],bt.prototype,"state");oi([v()],bt.prototype,"data");oi([v()],bt.prototype,"appData");oi([v()],bt.prototype,"appState");const xn={lon:0,lat:0},Ji=3,Cn=e=>{if(!e)return;const t=e.split(",").map(s=>s.trim());if(t.length!==2)return;const i=Number(t[0]),a=Number(t[1]);if(!(t[0]===""||t[1]===""||!Number.isFinite(i)||!Number.isFinite(a)))return{lon:a,lat:i}},Sn=e=>{if(e==null||e.trim()==="")return Ji;const t=Number(e);return Number.isFinite(t)?t:Ji};var kn=Object.defineProperty,En=Object.getOwnPropertyDescriptor,li=(e,t,i,a)=>{for(var s=a>1?void 0:a?En(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&kn(t,i,s),s};let St=class extends F{constructor(){super(...arguments),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){const e=++this.renderSeq,[{default:t},{default:i},{default:a},{default:s},{fromLonLat:r},{default:o}]=await Promise.all([ce(()=>import("./vendor-ol.js").then(c=>c.M),[]),ce(()=>import("./vendor-ol.js").then(c=>c.V),[]),ce(()=>import("./vendor-ol.js").then(c=>c.T),[]),ce(()=>import("./vendor-ol.js").then(c=>c.O),[]),ce(()=>import("./vendor-ol.js").then(c=>c.p),[]),ce(()=>import("./vendor-ol.js").then(c=>c.o),[])]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector("style[data-ol]")){const c=document.createElement("style");c.setAttribute("data-ol",""),c.textContent=o,this.shadowRoot.appendChild(c)}this.map&&(this.map.setTarget(void 0),this.map=void 0);const l=Cn(this.position)??xn;this.map=new t({target:this.mapElement,layers:[new a({source:new s})],view:new i({center:r([l.lon,l.lat]),zoom:Sn(this.zoom)})})}render(){return n`<div id="map"></div>`}};St.styles=R`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `;li([v()],St.prototype,"position",2);li([v()],St.prototype,"zoom",2);li([Ae("#map")],St.prototype,"mapElement",2);St=li([_("mateu-map")],St);const In=typeof HTMLElement<"u"?HTMLElement:class{};class _n extends In{static get observedAttributes(){return["content"]}#e;#t=0;get content(){return this.#e}set content(t){this.#e=t,this.#i()}attributeChangedCallback(t,i,a){this.content=a??void 0}connectedCallback(){this.style.display="block",this.#i()}async#i(){if(!this.isConnected)return;const t=this.#e??"",i=++this.#t,[{marked:a},{default:s}]=await Promise.all([ce(()=>import("./vendor.js").then(r=>r.f),[]),ce(()=>import("./vendor.js").then(r=>r.c),[])]);i===this.#t&&(this.innerHTML=s.sanitize(await a.parse(t),{CUSTOM_ELEMENT_HANDLING:{tagNameCheck:r=>!0}}))}}typeof customElements<"u"&&!customElements.get("mateu-markdown")&&customElements.define("mateu-markdown",_n);var Tn=Object.defineProperty,Rn=Object.getOwnPropertyDescriptor,nt=(e,t,i,a)=>{for(var s=a>1?void 0:a?Rn(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Tn(t,i,s),s};const Pn=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},On=(e,t)=>{let i=t;for(;i;){if(i===e)return!0;i=i.assignedSlot??i.parentNode??i.host??null}return!1};let Fe=class extends Wt{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.hoveredItem=null,this.onGridHoverMove=e=>{const t=e.currentTarget,i=t.getEventContext(e)?.item??null;i!==this.hoveredItem&&(this.hoveredItem=i,t.generateCellPartNames())},this.onGridHoverLeave=e=>{this.hoveredItem!==null&&(this.hoveredItem=null,e.currentTarget.generateCellPartNames())},this.hoverCellPartNameGenerator=(e,t)=>t?.item!=null&&t.item===this.hoveredItem?"hovered-cell":"",this._onRowKey=e=>{const t=this.field?.rowSelectionShortcut;if(!t||!this.field?.onItemSelectionActionId||!this._isRowShortcutRelevant()||!ha(t,e))return;const i=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!i)return;const a=this.currentItems(),s=parseInt(i[1],10)-1;s>=a.length||(e.preventDefault(),this.selectRow(a[s]))},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onRowKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._onRowKey)}currentItems(){return this.field?.remoteCoordinates?this.data?.[this.id]?.content??[]:this.field?.fieldId&&this.state?this.state[this.field.fieldId]??[]:[]}selectRow(e){!e||!this.field?.onItemSelectionActionId||(this.selectedItems=[e],this.state[this.id+"_selected_items"]=[e],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.field.onItemSelectionActionId,parameters:{_clickedRow:e}},bubbles:!0,composed:!0})))}_isRowShortcutRelevant(){if(this.offsetParent===null&&this.getClientRects().length===0)return!1;const e=Pn();if(e&&e!==document.body&&!On(this,e)){const t=e.tagName?.toLowerCase()??"";if(e.isContentEditable||/^(input|textarea|select)$/.test(t)||t.startsWith("vaadin-")&&/(field|combo|picker|area|select)/.test(t))return!1}return!0}handleItemToggle(e){const{item:t,selected:i,shiftKey:a}=e.detail;if(this.rangeStartItem??=t,a){let s=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(s=this.state[this.field.fieldId]);const[r,o]=[this.rangeStartItem,t].map(u=>s.indexOf(u)).sort((u,p)=>u-p),l=s.slice(r,o+1),c=new Set(this.selectedItems);l.forEach(u=>{i?c.add(u):c.delete(u)}),this.selectedItems=[...c],this.state[this.id+"_selected_items"]=this.selectedItems}this.rangeStartItem=t}render(){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);const t=this.state[this.field?.fieldId+"_show_detail"]||this.state._show_detail&&this.state._show_detail[this.field.fieldId];if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,a="";this.data[this.id]&&(this.data[this.id].searchSignature||a)&&this.data[this.id].searchSignature!=a&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements?e=this.data[this.id].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:a,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}if(Array.isArray(e)&&e.forEach((i,a)=>{i&&typeof i=="object"&&i._rowNumber===void 0&&(i._rowNumber=a)}),this.field?.inlineEditing)return this.renderMaster(e);if(this.field?.formPosition&&this.field?.formPosition.startsWith("modal")){const i=this;return n`

                ${this.renderMaster(e)}

                <vaadin-dialog
                        .opened="${t}"
                        @closed="${()=>{i.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.field?.fieldId+"_cancel"},bubbles:!0,composed:!0}))}}"
                        ${Bt(()=>n`
                            <mateu-event-interceptor .target="${i}">
                                <div id="container" style="${this.field?.formStyle??"display: contents;"}">
                                    <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                                </div>
                            </mateu-event-interceptor>
                            `,[()=>Q()])}
                ></vaadin-dialog>
                
            `}else{const i=this.field?.formPosition=="left"||this.field?.formPosition=="right"?"horizontal":"vertical";return n`
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
                
                
            </vaadin-master-detail-layout>`}}renderMaster(e){const t=this.selectedItems||[];return n`<vaadin-vertical-layout style="width: 100%;">
            <!-- The field label is rendered by the surrounding mateu-field wrapper; rendering it
                 here too would duplicate it (e.g. "Guests / Guests"). -->
            <vaadin-grid
                    ?clickable="${!!this.field?.onItemSelectionActionId}"
                    .cellPartNameGenerator="${L(this.field?.onItemSelectionActionId?this.hoverCellPartNameGenerator:void 0)}"
                    @mousemove="${L(this.field?.onItemSelectionActionId?this.onGridHoverMove:void 0)}"
                    @mouseleave="${L(this.field?.onItemSelectionActionId?this.onGridHoverLeave:void 0)}"
                    style="${this.field?.onItemSelectionActionId?"cursor: pointer;":""}${this.field?.style??""}"
                    class="${this.field?.cssClasses}"
                    .items="${e}"
                    .selectedItems="${t}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${i=>{this.selectedItems=i.detail.value,this.state[this.id+"_selected_items"]=this.selectedItems}}"
                    @item-toggle="${this.handleItemToggle}"
                    @click="${L(this.field?.onItemSelectionActionId?i=>{const s=i.currentTarget.getEventContext(i)?.item;s&&this.selectRow(s)}:void 0)}"
                    @active-item-changed="${L(this.field?.detailPath&&!this.field?.useButtonForDetail?i=>{if(this.field?.detailPath){const a=i.detail.value;a?this.detailsOpenedItems=[a]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${L(this.field?.detailPath?na(i=>n`${g(this,i[this.field?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    ?all-rows-visible=${e?.length<10}
            >
                <span slot="empty-state">${this.field?.label?`No ${this.field.label.toLowerCase()} added yet.`:"No items added yet."}</span>
                ${this.field?.readOnly||this.field?.inlineEditing?d:n`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.columns?.map(i=>Ti(i,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}

                ${this.field?.inlineEditing&&!this.field?.readOnly?n`
                    <vaadin-grid-column width="3.5rem" flex-grow="0" frozen-to-end
                            ${et(i=>n`
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
                            ${et((i,{detailsOpened:a})=>n`
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
        </vaadin-vertical-layout>`}};Fe.styles=R`
        ${st}

        /* Clickable grids (a row-selection action is wired) give visual feedback: the host sets a
           pointer cursor (inline, inherited by the slotted cell content), and the cells of the
           hovered row — tagged "hovered-cell" by cellPartNameGenerator — get a subtle highlight. */
        vaadin-grid[clickable]::part(hovered-cell) {
            background-color: var(--lumo-primary-color-10pct);
            cursor: pointer;
        }
    `;nt([v()],Fe.prototype,"field",2);nt([v()],Fe.prototype,"state",2);nt([v()],Fe.prototype,"data",2);nt([v()],Fe.prototype,"appState",2);nt([v()],Fe.prototype,"appData",2);nt([v()],Fe.prototype,"selectedItems",2);nt([$()],Fe.prototype,"detailsOpenedItems",2);Fe=nt([_("mateu-grid")],Fe);var Ln=Object.defineProperty,Dn=Object.getOwnPropertyDescriptor,_t=(e,t,i,a)=>{for(var s=a>1?void 0:a?Dn(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Ln(t,i,s),s};let it=class extends F{constructor(){super(...arguments),this.getNewValue=e=>{if(this.field?.dataType=="array"){if(!this.value)return[e];const t=this.value;return t.indexOf(e)>=0?t.filter(i=>i!==e):[...t,e]}return e}}render(){let e=this.field?.options;if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates;this.data?.[this.field.fieldId]&&this.data[this.field.fieldId].content&&this.data[this.field.fieldId].totalElements?e=this.data[this.field.fieldId].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:"",fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}const t=this.field?.attributes?.divStyle;return n`
        <div style="display: flex; gap: 1rem; padding: 1rem; flex-wrap: wrap; ${t}">
                                    ${e?.map(i=>n`
                            <div 
                                    class="choice ${this.value==i.value||Array.isArray(this.value)&&this.value.includes(i.value)?"selected":""}"
                                    @click="${()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.getNewValue(i.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}"
                            >${i.description||i.image?n`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${i.image?n`
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

       `}};it.styles=R`
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
  `;_t([v()],it.prototype,"field",2);_t([v()],it.prototype,"baseUrl",2);_t([v()],it.prototype,"state",2);_t([v()],it.prototype,"data",2);_t([v()],it.prototype,"value",2);it=_t([_("mateu-choice")],it);var Fn=Object.defineProperty,An=Object.getOwnPropertyDescriptor,Ne=(e,t,i,a)=>{for(var s=a>1?void 0:a?An(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Fn(t,i,s),s};let ge=class extends F{constructor(){super(...arguments),this.currencyChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),this.value.currency=e.detail.value,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}}))},this.valueChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),e.detail.value&&(this.value.value=e.detail.value?parseFloat(e.detail.value):0,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}})))}}render(){return n`
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
       `}};ge.styles=R`
  `;Ne([v()],ge.prototype,"fieldId",2);Ne([v()],ge.prototype,"label",2);Ne([v()],ge.prototype,"state",2);Ne([v()],ge.prototype,"data",2);Ne([v()],ge.prototype,"value",2);Ne([v()],ge.prototype,"autoFocus",2);Ne([v()],ge.prototype,"required",2);Ne([v()],ge.prototype,"colspan",2);Ne([v()],ge.prototype,"helperText",2);ge=Ne([_("mateu-money-field")],ge);const Yi=["vaadin:abacus","vaadin:absolute-position","vaadin:academy-cap","vaadin:accessibility","vaadin:accordion-menu","vaadin:add-dock","vaadin:adjust","vaadin:adobe-flash","vaadin:airplane","vaadin:alarm","vaadin:align-center","vaadin:align-justify","vaadin:align-left","vaadin:align-right","vaadin:alt-a","vaadin:alt","vaadin:ambulance","vaadin:anchor","vaadin:angle-double-down","vaadin:angle-double-left","vaadin:angle-double-right","vaadin:angle-double-up","vaadin:angle-down","vaadin:angle-left","vaadin:angle-right","vaadin:angle-up","vaadin:archive","vaadin:archives","vaadin:area-select","vaadin:arrow-backward","vaadin:arrow-circle-down-o","vaadin:arrow-circle-down","vaadin:arrow-circle-left-o","vaadin:arrow-circle-left","vaadin:arrow-circle-right-o","vaadin:arrow-circle-right","vaadin:arrow-circle-up-o","vaadin:arrow-circle-up","vaadin:arrow-down","vaadin:arrow-forward","vaadin:arrow-left","vaadin:arrow-long-down","vaadin:arrow-long-left","vaadin:arrow-right","vaadin:arrow-up","vaadin:arrows-cross","vaadin:arrows-long-h","vaadin:arrows-long-right","vaadin:arrows-long-up","vaadin:arrows-long-v","vaadin:arrows","vaadin:asterisk","vaadin:at","vaadin:automation","vaadin:backspace-a","vaadin:backspace","vaadin:backwards","vaadin:ban","vaadin:bar-chart-h","vaadin:bar-chart-v","vaadin:bar-chart","vaadin:barcode","vaadin:bed","vaadin:bell-o","vaadin:bell-slash-o","vaadin:bell-slash","vaadin:bell","vaadin:boat","vaadin:bold","vaadin:bolt","vaadin:bomb","vaadin:book-dollar","vaadin:book-percent","vaadin:book","vaadin:bookmark-o","vaadin:bookmark","vaadin:briefcase","vaadin:browser","vaadin:bug-o","vaadin:bug","vaadin:building-o","vaadin:building","vaadin:bullets","vaadin:bullseye","vaadin:bus","vaadin:buss","vaadin:button","vaadin:calc-book","vaadin:calc","vaadin:calendar-briefcase","vaadin:calendar-clock","vaadin:calendar-envelope","vaadin:calendar-o","vaadin:calendar-user","vaadin:calendar","vaadin:camera","vaadin:car","vaadin:caret-down","vaadin:caret-left","vaadin:caret-right","vaadin:caret-square-down-o","vaadin:caret-square-left-o","vaadin:caret-square-right-o","vaadin:caret-square-up-o","vaadin:caret-up","vaadin:cart-o","vaadin:cart","vaadin:cash","vaadin:chart-3d","vaadin:chart-grid","vaadin:chart-line","vaadin:chart-timeline","vaadin:chart","vaadin:chat","vaadin:check-circle-o","vaadin:check-circle","vaadin:check-square-o","vaadin:check-square","vaadin:check","vaadin:chevron-circle-down-o","vaadin:chevron-circle-down","vaadin:chevron-circle-left-o","vaadin:chevron-circle-left","vaadin:chevron-circle-right-o","vaadin:chevron-circle-right","vaadin:chevron-circle-up-o","vaadin:chevron-circle-up","vaadin:chevron-down-small","vaadin:chevron-down","vaadin:chevron-left-small","vaadin:chevron-left","vaadin:chevron-right-small","vaadin:chevron-right","vaadin:chevron-up-small","vaadin:chevron-up","vaadin:child","vaadin:circle-thin","vaadin:circle","vaadin:clipboard-check","vaadin:clipboard-cross","vaadin:clipboard-heart","vaadin:clipboard-pulse","vaadin:clipboard-text","vaadin:clipboard-user","vaadin:clipboard","vaadin:clock","vaadin:close-big","vaadin:close-circle-o","vaadin:close-circle","vaadin:close-small","vaadin:close","vaadin:cloud-download-o","vaadin:cloud-download","vaadin:cloud-o","vaadin:cloud-upload-o","vaadin:cloud-upload","vaadin:cloud","vaadin:cluster","vaadin:code","vaadin:coffee","vaadin:cog-o","vaadin:cog","vaadin:cogs","vaadin:coin-piles","vaadin:coins","vaadin:combobox","vaadin:comment-ellipsis-o","vaadin:comment-ellipsis","vaadin:comment-o","vaadin:comment","vaadin:comments-o","vaadin:comments","vaadin:compile","vaadin:compress-square","vaadin:compress","vaadin:connect-o","vaadin:connect","vaadin:controller","vaadin:copy-o","vaadin:copy","vaadin:copyright","vaadin:corner-lower-left","vaadin:corner-lower-right","vaadin:corner-upper-left","vaadin:corner-upper-right","vaadin:credit-card","vaadin:crop","vaadin:cross-cutlery","vaadin:crosshairs","vaadin:css","vaadin:ctrl-a","vaadin:ctrl","vaadin:cube","vaadin:cubes","vaadin:curly-brackets","vaadin:cursor-o","vaadin:cursor","vaadin:cutlery","vaadin:dashboard","vaadin:database","vaadin:date-input","vaadin:deindent","vaadin:del-a","vaadin:del","vaadin:dental-chair","vaadin:desktop","vaadin:diamond-o","vaadin:diamond","vaadin:diploma-scroll","vaadin:diploma","vaadin:disc","vaadin:doctor-briefcase","vaadin:doctor","vaadin:dollar","vaadin:dot-circle","vaadin:download-alt","vaadin:download","vaadin:drop","vaadin:edit","vaadin:eject","vaadin:elastic","vaadin:ellipsis-circle-o","vaadin:ellipsis-circle","vaadin:ellipsis-dots-h","vaadin:ellipsis-dots-v","vaadin:ellipsis-h","vaadin:ellipsis-v","vaadin:enter-arrow","vaadin:enter","vaadin:envelope-o","vaadin:envelope-open-o","vaadin:envelope-open","vaadin:envelope","vaadin:envelopes-o","vaadin:envelopes","vaadin:eraser","vaadin:esc-a","vaadin:esc","vaadin:euro","vaadin:exchange","vaadin:exclamation-circle-o","vaadin:exclamation-circle","vaadin:exclamation","vaadin:exit-o","vaadin:exit","vaadin:expand-full","vaadin:expand-square","vaadin:expand","vaadin:external-browser","vaadin:external-link","vaadin:eye-slash","vaadin:eye","vaadin:eyedropper","vaadin:facebook-square","vaadin:facebook","vaadin:factory","vaadin:family","vaadin:fast-backward","vaadin:fast-forward","vaadin:female","vaadin:file-add","vaadin:file-code","vaadin:file-font","vaadin:file-movie","vaadin:file-o","vaadin:file-picture","vaadin:file-presentation","vaadin:file-process","vaadin:file-refresh","vaadin:file-remove","vaadin:file-search","vaadin:file-sound","vaadin:file-start","vaadin:file-table","vaadin:file-text-o","vaadin:file-text","vaadin:file-tree-small","vaadin:file-tree-sub","vaadin:file-tree","vaadin:file-zip","vaadin:file","vaadin:fill","vaadin:film","vaadin:filter","vaadin:fire","vaadin:flag-checkered","vaadin:flag-o","vaadin:flag","vaadin:flash","vaadin:flask","vaadin:flight-landing","vaadin:flight-takeoff","vaadin:flip-h","vaadin:flip-v","vaadin:folder-add","vaadin:folder-o","vaadin:folder-open-o","vaadin:folder-open","vaadin:folder-remove","vaadin:folder-search","vaadin:folder","vaadin:font","vaadin:form","vaadin:forward","vaadin:frown-o","vaadin:funcion","vaadin:function","vaadin:funnel","vaadin:gamepad","vaadin:gavel","vaadin:gift","vaadin:glass","vaadin:glasses","vaadin:globe-wire","vaadin:globe","vaadin:golf","vaadin:google-plus-square","vaadin:google-plus","vaadin:grab","vaadin:grid-bevel","vaadin:grid-big-o","vaadin:grid-big","vaadin:grid-h","vaadin:grid-small-o","vaadin:grid-small","vaadin:grid-v","vaadin:grid","vaadin:group","vaadin:hammer","vaadin:hand","vaadin:handle-corner","vaadin:hands-up","vaadin:handshake","vaadin:harddrive-o","vaadin:harddrive","vaadin:hash","vaadin:header","vaadin:headphones","vaadin:headset","vaadin:health-card","vaadin:heart-o","vaadin:heart","vaadin:home-o","vaadin:home","vaadin:hospital","vaadin:hourglass-empty","vaadin:hourglass-end","vaadin:hourglass-start","vaadin:hourglass","vaadin:inbox","vaadin:indent","vaadin:info-circle-o","vaadin:info-circle","vaadin:info","vaadin:input","vaadin:insert","vaadin:institution","vaadin:invoice","vaadin:italic","vaadin:key-o","vaadin:key","vaadin:keyboard-o","vaadin:keyboard","vaadin:laptop","vaadin:layout","vaadin:level-down-bold","vaadin:level-down","vaadin:level-left-bold","vaadin:level-left","vaadin:level-right-bold","vaadin:level-right","vaadin:level-up-bold","vaadin:level-up","vaadin:lifebuoy","vaadin:lightbulb","vaadin:line-bar-chart","vaadin:line-chart","vaadin:line-h","vaadin:line-v","vaadin:lines-list","vaadin:lines","vaadin:link","vaadin:list-ol","vaadin:list-select","vaadin:list-ul","vaadin:list","vaadin:location-arrow-circle-o","vaadin:location-arrow-circle","vaadin:location-arrow","vaadin:lock","vaadin:magic","vaadin:magnet","vaadin:mailbox","vaadin:male","vaadin:map-marker","vaadin:margin-bottom","vaadin:margin-left","vaadin:margin-right","vaadin:margin-top","vaadin:margin","vaadin:medal","vaadin:megafone","vaadin:megaphone","vaadin:meh-o","vaadin:menu","vaadin:microphone","vaadin:minus-circle-o","vaadin:minus-circle","vaadin:minus-square-o","vaadin:minus","vaadin:mobile-browser","vaadin:mobile-retro","vaadin:mobile","vaadin:modal-list","vaadin:modal","vaadin:money-deposit","vaadin:money-exchange","vaadin:money-withdraw","vaadin:money","vaadin:moon-o","vaadin:moon","vaadin:morning","vaadin:movie","vaadin:music","vaadin:mute","vaadin:native-button","vaadin:newspaper","vaadin:notebook","vaadin:nurse","vaadin:office","vaadin:open-book","vaadin:option-a","vaadin:option","vaadin:options","vaadin:orientation","vaadin:out","vaadin:outbox","vaadin:package","vaadin:padding-bottom","vaadin:padding-left","vaadin:padding-right","vaadin:padding-top","vaadin:padding","vaadin:paint-roll","vaadin:paintbrush","vaadin:palete","vaadin:palette","vaadin:panel","vaadin:paperclip","vaadin:paperplane-o","vaadin:paperplane","vaadin:paragraph","vaadin:password","vaadin:paste","vaadin:pause","vaadin:pencil","vaadin:phone-landline","vaadin:phone","vaadin:picture","vaadin:pie-bar-chart","vaadin:pie-chart","vaadin:piggy-bank-coin","vaadin:piggy-bank","vaadin:pill","vaadin:pills","vaadin:pin-post","vaadin:pin","vaadin:play-circle-o","vaadin:play-circle","vaadin:play","vaadin:plug","vaadin:plus-circle-o","vaadin:plus-circle","vaadin:plus-minus","vaadin:plus-square-o","vaadin:plus","vaadin:pointer","vaadin:power-off","vaadin:presentation","vaadin:print","vaadin:progressbar","vaadin:puzzle-piece","vaadin:pyramid-chart","vaadin:qrcode","vaadin:question-circle-o","vaadin:question-circle","vaadin:question","vaadin:quote-left","vaadin:quote-right","vaadin:random","vaadin:raster-lower-left","vaadin:raster","vaadin:records","vaadin:recycle","vaadin:refresh","vaadin:reply-all","vaadin:reply","vaadin:resize-h","vaadin:resize-v","vaadin:retweet","vaadin:rhombus","vaadin:road-branch","vaadin:road-branches","vaadin:road-split","vaadin:road","vaadin:rocket","vaadin:rotate-left","vaadin:rotate-right","vaadin:rss-square","vaadin:rss","vaadin:safe-lock","vaadin:safe","vaadin:scale-unbalance","vaadin:scale","vaadin:scatter-chart","vaadin:scissors","vaadin:screwdriver","vaadin:search-minus","vaadin:search-plus","vaadin:search","vaadin:select","vaadin:server","vaadin:share-square","vaadin:share","vaadin:shield","vaadin:shift-arrow","vaadin:shift","vaadin:shop","vaadin:sign-in-alt","vaadin:sign-in","vaadin:sign-out-alt","vaadin:sign-out","vaadin:signal","vaadin:sitemap","vaadin:slider","vaadin:sliders","vaadin:smiley-o","vaadin:sort","vaadin:sound-disable","vaadin:spark-line","vaadin:specialist","vaadin:spinner-arc","vaadin:spinner-third","vaadin:spinner","vaadin:spline-area-chart","vaadin:spline-chart","vaadin:split-h","vaadin:split-v","vaadin:split","vaadin:spoon","vaadin:square-shadow","vaadin:star-half-left-o","vaadin:star-half-left","vaadin:star-half-right-o","vaadin:star-half-right","vaadin:star-o","vaadin:star","vaadin:start-cog","vaadin:step-backward","vaadin:step-forward","vaadin:stethoscope","vaadin:stock","vaadin:stop-cog","vaadin:stop","vaadin:stopwatch","vaadin:storage","vaadin:strikethrough","vaadin:subscript","vaadin:suitcase","vaadin:sun-down","vaadin:sun-o","vaadin:sun-rise","vaadin:superscript","vaadin:sword","vaadin:tab-a","vaadin:tab","vaadin:table","vaadin:tablet","vaadin:tabs","vaadin:tag","vaadin:tags","vaadin:tasks","vaadin:taxi","vaadin:teeth","vaadin:terminal","vaadin:text-height","vaadin:text-input","vaadin:text-label","vaadin:text-width","vaadin:thin-square","vaadin:thumbs-down-o","vaadin:thumbs-down","vaadin:thumbs-up-o","vaadin:thumbs-up","vaadin:ticket","vaadin:time-backward","vaadin:time-forward","vaadin:timer","vaadin:toolbox","vaadin:tools","vaadin:tooth","vaadin:touch","vaadin:train","vaadin:trash","vaadin:tree-table","vaadin:trendind-down","vaadin:trending-down","vaadin:trending-up","vaadin:trophy","vaadin:truck","vaadin:twin-col-select","vaadin:twitter-square","vaadin:twitter","vaadin:umbrella","vaadin:underline","vaadin:unlink","vaadin:unlock","vaadin:upload-alt","vaadin:upload","vaadin:user-card","vaadin:user-check","vaadin:user-clock","vaadin:user-heart","vaadin:user-star","vaadin:user","vaadin:users","vaadin:vaadin-h","vaadin:vaadin-v","vaadin:viewport","vaadin:vimeo-square","vaadin:vimeo","vaadin:volume-down","vaadin:volume-off","vaadin:volume-up","vaadin:volume","vaadin:wallet","vaadin:warning","vaadin:workplace","vaadin:wrench","vaadin:youtube-square","vaadin:youtube"];var zn=Object.defineProperty,Nn=Object.getOwnPropertyDescriptor,ye=(e,t,i,a)=>{for(var s=a>1?void 0:a?Nn(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&zn(t,i,s),s};let ee=class extends F{constructor(){super(...arguments),this.component=void 0,this.field=void 0,this.baseUrl=void 0,this.state={},this.data={},this.appState={},this.appData={},this.colorPickerOpened=!1,this.colorPickerValue=void 0,this.comboData=[],this._comboFilter="",this.rendered=!1,this.renderColorPicker=()=>{const e=this.field?.fieldId,t=this.state&&e in this.state?this.state[e]:this.field?.initialValue;return n`
            <ui5-color-picker value="${t}" @change="${i=>this.colorPickerValue=i.target.value}">Picker</ui5-color-picker>
        `},this.saveColor=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.colorPickerValue,fieldId:this.field.fieldId},bubbles:!0,composed:!0})),this.colorPickerOpened=!1},this.renderColorPickerFooter=()=>n`<vaadin-button @click="${()=>this.colorPickerOpened=!1}">Cancel</vaadin-button>
        <vaadin-button theme="primary" @click="${this.saveColor}">Save</vaadin-button>`,this.checked=e=>{const t=e.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.checked,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))},this.convert=e=>this.field?.dataType=="integer"?parseInt(e):e,this.multiComboBoxValueChanged=e=>{if(this.rendered){const t=this.field?.fieldId,i=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let a;e.detail.value&&(a=e.detail.value.map(s=>s.value),a&&a.length>0&&(this.data[this.id]||(this.data[this.id]={}),this.data[this.id].content||(this.data[this.id].content=[]),this.data[this.id]&&this.data[this.id].content&&e.detail.value.forEach(s=>{this.data[this.id].content?.find(r=>s.value==r.value)||this.data[this.id].content.push(s)}))),this.compareArrays(a,i)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.valueChanged=e=>{this.rendered&&e.detail.value!==void 0&&e.detail.value!=this.state[this.field.fieldId]&&this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.convert(e.detail.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.selectedItems=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.comboData&&this.comboData.length>0)return this.comboData?.filter(t=>e.indexOf(t.value)>=0);if(this.data[this.id]&&this.data[this.id].content&&this.data[this.id].content.length>0)return this.data[this.id].content.filter(t=>e.indexOf(t.value)>=0)}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0);return[]},this.selectedIndex=e=>{if(e)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const t=this.data[this.id].content.find(i=>i.value==e);if(t)return this.data[this.id].content.indexOf(t)}}else{const t=this.field?.options?.find(i=>i.value==e);if(t)return this.field?.options?.indexOf(t)}},this.selectedIndexes=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content)return this.data[this.id].content.filter(i=>e.indexOf(i.value)>=0).map(i=>this.data[this.id].content.indexOf(i))}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0).map(t=>this.field?.options?.indexOf(t));return[]},this.compareArrays=(e,t)=>this.falsy(e)&&this.falsy(t)||e&&t&&e.length===t.length&&e.every((i,a)=>i===t[a]),this.falsy=e=>!e||e.length==0,this.listItemsSelected=e=>{const t=this.field?.fieldId,i=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let a;this.rendered&&(e.detail.value&&(this.field?.remoteCoordinates?this.data[this.id]&&this.data[this.id].content&&(a=e.detail.value.map(s=>this.data[this.id].content[s].value)):a=e.detail.value.map(s=>this.field.options[s].value)),this.compareArrays(a,i)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))},this.listItemSelected=e=>{let t;if(e.detail.value||e.detail.value==0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const i=this.data[this.id].content[e.detail.value];i&&(t=i.value)}}else{const i=this.field.options[e.detail.value];i&&(t=i.value)}this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.mapPosition=e=>{switch(e){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.fileUploaded=e=>{const t=this.field?.fieldId??"",i=this.state[t];i.push({id:e.detail.xhr.responseText,name:e.detail.file.name}),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.fileChanged=e=>{const t=this.field?.fieldId??"",i=(e.detail.value??[]).filter(s=>s.id).map(s=>s.id),a=(this.state[t]??[]).map(s=>s.id);if(!this.compareArrays(a,i)){const s=(e.detail.value??[]).filter(r=>r.id).map(r=>({id:r.id,name:r.name}));this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.triggerImageUpload=()=>{this.renderRoot?.querySelector('input[type="file"]')?.click()},this.imageUpload=e=>{const t=e.target,i=t.files?.[0];if(!i)return;const a=new FileReader;a.onload=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a.result,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},a.readAsDataURL(i),t.value=""},this.imageDelete=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:"",fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.iconComboboxRenderer=e=>n`
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
`,this.filteredIcons=[],this.iconFilterChanged=e=>{this.filteredIcons=Yi.filter(t=>!e.detail.value||t.indexOf(e.detail.value)>=0)}}remoteComboDataProvider(e){return(t,i)=>{const{filter:a,page:s,pageSize:r}=t,o=a??"";this._comboFilter=o,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{searchText:a,fieldId:this.field?.fieldId,size:r,page:s,sort:void 0},callback:l=>{if(o===this._comboFilter)if(l?.messages?.forEach(c=>{Ut.show(c.text,{position:c.position?this.mapPosition(c.position):void 0,theme:c.variant,duration:c.duration})}),!l.fragments||l.fragments.length==0)this.comboData=[],i([],0);else{const c=l.fragments[0].data?.[this.id];this.comboData=c?.content,i(c?.content,c?.totalElements)}},callbackonly:!0},bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.rendered=!1}render(){const e=this.field?.fieldId??"";return this.rendered=!0,n`<div style="display: block;">
            <div>${this.renderField()}</div>
            ${this.field?.description?n`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${Ue(this.field?.description,this.state,this.data)}</div>
            `:d}
            ${this.data.errors&&this.data.errors[e]&&this.data.errors[e].length>0?n`
                <div><ul>${this.data.errors[e].map(t=>n`<li>${t}</li>`)}</ul></div>
            `:d}
        </div>`}async firstUpdated(){this.filteredIcons=Yi}update(e){e.has("component")&&(this.rendered=!1),super.update(e)}renderField(){const e=this.field?.fieldId??"",t=this.state&&e in this.state?this.state[e]:this.field?.initialValue,i=this.field?.label+"",a=ze(i,this.state,this.data),s=this.labelAlreadyRendered||!a||a=="null"?d:a;return this.field?.stereotype=="badge"?this.renderBadgeField(e,t,s,a):this.field?.stereotype=="plainText"?this.renderPlainTextField(e,t,s,a):this.field?.readOnly&&this.field.stereotype!="grid"&&this.field.dataType!="status"&&this.field?.dataType!="money"?this.renderReadOnlyField(e,t,s,a):this.field?.dataType=="file"?this.renderFileField(e,t,s,a):this.field?.dataType=="string"?this.renderStringField(e,t,s,a):this.field?.dataType=="number"?this.renderNumberField(e,t,s,a):this.field?.dataType=="integer"?this.renderIntegerField(e,t,s,a):this.field?.dataType=="bool"?this.renderBoolField(e,t,s,a):this.field?.dataType=="dateRange"?this.renderDateRangeField(e,t,s,a):this.field?.dataType=="date"?this.renderDateField(e,t,s,a):this.field?.dataType=="dateTime"?this.renderDateTimeField(e,t,s,a):this.field?.dataType=="time"?this.renderTimeField(e,t,s,a):this.field?.dataType=="array"?this.renderArrayField(e,t,s,a):this.field?.dataType=="money"?this.renderMoneyField(e,t,s,a):this.field?.dataType=="status"?this.renderStatusField(e,t,s,a):this.field?.dataType=="range"?this.renderRangeField(e,t,s,a):n`<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`}renderBadgeField(e,t,i,a){if(!this.field)return n``;const s=t===!0||t==="true";return n`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><span theme="badge ${s?"success":""} pill" style="${s?"":"opacity: 0.4;"}">${a}</span>
            </vaadin-custom-field>`}renderPlainTextField(e,t,i,a){if(!this.field)return n``;let s=Ue(t,this.state,this.data);const r=s&&typeof s=="object"&&"value"in s?s:null;s&&s.value&&(s=s.value);const o=this.field?.dataType=="bool"||s===!0||s===!1,l=this.field?.dataType=="money",c=s!=null&&s!=="";let u=c?String(s):"—";if(l&&c){const m=typeof s=="number"?s:parseFloat(String(s));isNaN(m)||(u=r&&r.locale&&r.currency?new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(m):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(m))}const p=o?n`<vaadin-icon icon="${s===!0||s==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:this.field?.multiline?n`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${u}</span>`:n`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${l?" font-variant-numeric: tabular-nums;":""}">${u}</span>`;return n`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${i}"
                    data-colspan="${this.field?.colspan}"
                    style="${l?"text-align: right; ":""}${this.field?.style}"
            >${p}</vaadin-custom-field>`}renderReadOnlyField(e,t,i,a){if(!this.field)return n``;let s=Ue(t,this.state,this.data)||this.data[e];if(s&&s.value&&(s=s.value),this.field.stereotype=="image"||this.field.stereotype=="uploadableImage")return n`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${i}"
                        required="${this.field.required||d}"
                        .helperText="${this.field.description}"
                        data-colspan="${this.field.colspan}"
                ><img src="${s}" id="${this.field.fieldId}_img" style="${this.field.style}">
                </vaadin-custom-field>`;if(this.field.dataType=="bool")return n`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${i}"
                        required="${this.field.required||d}"
                        .helperText="${this.field.description}"
                        data-colspan="${this.field.colspan}"
                ><vaadin-icon icon="${s?"vaadin:check":"vaadin:minus"}" style="height: 20px;"></vaadin-icon>
                </vaadin-custom-field>`;const r=s!=null?String(s):"";return n`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${i}"
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
`}renderFileField(e,t,i,a){if(!this.field)return n``;const s=t?.map(r=>({id:r.id,name:r.name,type:"",uploadTarget:"",complete:!0}))??[];return n`
                <vaadin-custom-field
                        label="${i}"
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
            `}renderStringField(e,t,i,a){if(!this.field)return n``;if(this.field?.stereotype=="searchable"){const s=o=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"code-"+this.field?.fieldId,parameters:{code:o.currentTarget.value}},bubbles:!0,composed:!0}))},r=o=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"codesearch-"+this.field?.fieldId,parameters:{}},bubbles:!0,composed:!0}))};return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
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
                            label="${i}"
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
                            label="${i}"
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
                            label="${i}"
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
                            label="${i}"
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
                            ${mi(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}return n`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${i}"
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
                            ${mi(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),n`
                        <vaadin-custom-field
                                label="${i}"
                                .helperText="${this.field.description}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${L(this.selectedIndex(t))}"
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
                            label="${i}"
                            .helperText="${this.field.description}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${L(this.selectedIndex(t))}"
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
                            label="${i}"
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
                            label="${i}"
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
                            label="${i}"
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
                            ${Ii(()=>n`
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
                            label="${i}"
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
                            label="${i}"
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
                            label="${i}"
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
                            label="${i}"
                            @value-changed="${this.valueChanged}"
                            value="${t}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-email-field>
                `;if(this.field?.stereotype=="link")return this.field.readOnly?n`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            data-colspan="${this.field.colspan}"
                    ><a href="${t}">${t}</a></vaadin-custom-field>`:n`
                            <vaadin-text-field
                                    id="${this.field.fieldId}"
                                    label="${i}"
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
                                    label="${i}"
                                    required="${this.field.required||d}"
                                    @value-changed="${this.valueChanged}"
                                    value="${t}"
                                    ?autofocus="${this.field.wantsFocus}"
                                    data-colspan="${this.field.colspan}"
                            item-label-path="displayName"
                            style="--vaadin-combo-box-overlay-width: 16em"
                                    .filteredItems="${this.filteredIcons}"
                            @filter-changed="${this.iconFilterChanged}"
                            ${mi(this.iconComboboxRenderer,[])}
                    >
                        ${t?n`<vaadin-icon slot="prefix" icon="${t}"></vaadin-icon>`:d}
                    </vaadin-combo-box>
                `;if(this.field?.stereotype=="password")return n`
                    <vaadin-password-field
                            id="${this.field.fieldId}"
                            label="${i}"
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
                            label="${i}"
                            data-colspan="${this.field.colspan}"
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${de(""+t)}</div></vaadin-custom-field>
                `;if(this.field?.stereotype=="image")return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            data-colspan="${this.field.colspan}"
                    ><img
                            src="${t}"
                            style="${this.component?.style}" class="${this.component?.cssClasses}"></vaadin-custom-field>
                `;if(this.field?.stereotype=="uploadableImage"){const s=t!=null&&t!=="";return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
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
                            label="${i}"
                            data-colspan="${this.field.colspan}"
                    ><span style="background-color: ${t}; display: block; height: 20px; width: 40px; margin-top: 5px; margin-bottom: 24px; border: 1px solid var(--lumo-secondary-text-color)"></vaadin-custom-field>
                `:n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
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
  ${Bt(this.renderColorPicker,[])}
  ${ai(this.renderColorPickerFooter,[])}
></vaadin-dialog>
                `:n`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${i}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.field.description}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        ?disabled="${this.field.disabled}"
                        data-colspan="${this.field.colspan}"
                        style="${this.field.style}"
                ></vaadin-text-field>
`}renderNumberField(e,t,i,a){return this.field?n`<vaadin-number-field
                        id="${this.field.fieldId}"
                        label="${i}"
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
            ></vaadin-number-field>`:n``}renderIntegerField(e,t,i,a){if(!this.field)return n``;if(this.field.stereotype=="stars"){let s=t;isNaN(s)&&(s=0);const r=[1,2,3,4,5];return n`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
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
                            label="${i}"
                            data-colspan="${this.field.colspan}"
                    ><input type="range" @input="${r=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}" min="${this.field.sliderMin??0}" max="${this.field.sliderMax??10}" value="${s??0}"/></vaadin-custom-field>
                `}return n`
                <vaadin-integer-field
                        id="${this.field.fieldId}"
                        label="${i}"
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
            `}renderBoolField(e,t,i,a){return this.field?n`
                <vaadin-custom-field
                        label="${i}"
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
            `:n``}renderDateRangeField(e,t,i,a){if(!this.field)return n``;const s=t?t.from+";"+t.to:void 0;return n`<vcf-date-range-picker
                    id="${this.field.fieldId}"
                    label="${i}"
                    @value-changed="${r=>{r.detail.value&&(r.detail.value={from:r.detail.value.split(";")[0],to:r.detail.value.split(";")[1]}),this.valueChanged(r)}}"
                    value="${s}"
                    ?autofocus="${this.field.wantsFocus}"
                    ?required="${this.field.required||d}"
                    data-colspan="${this.field.colspan}"
            ></vcf-date-range-picker>`}renderDateField(e,t,i,a){return this.field?n`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${i}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.field.description}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-picker>`:n``}renderDateTimeField(e,t,i,a){return this.field?n`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${i}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.field.description}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-time-picker>`:n``}renderTimeField(e,t,i,a){return this.field?n`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${i}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.field.description}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-time-picker>`:n``}renderArrayField(e,t,i,a){if(!this.field)return n``;if(this.field?.stereotype=="choice")return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
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
                            label="${i}"
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
                                label="${i}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box multiple
                                     .selectedValues="${L(this.selectedIndexes(t))}"
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
                            label="${i}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box multiple 
                                     .selectedValues="${L(this.selectedIndexes(t))}"
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
                            label="${i}"
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
                            label="${i}"
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
                        label="${i}"
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
                        label="${i}"
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
            `}renderMoneyField(e,t,i,a){if(!this.field)return n``;if(this.field.readOnly){const s=t;let r=s;return s&&s.locale&&s.currency?r=new Intl.NumberFormat(s.locale,{style:"currency",currency:s.currency}).format(s.value):r=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(s),n`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${i}"
                        .helperText="${this.field.description}"
                        data-colspan="${this.field.colspan}"
                ><div style="width: 186px; text-align: right;">${r}</div></vaadin-custom-field>`}return n`<mateu-money-field
                        id="${this.field.fieldId}"
                        label="${i}"
                        @value-changed="${this.valueChanged}"
                        .value="${t}"
                        .helperText="${this.field.description}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></mateu-money-field>`}renderStatusField(e,t,i,a){if(!this.field)return n``;const s=t;return n`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${i}"
                        required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                >
                    ${s?n`<span theme="badge pill ${si(s.type)}">${s.message}</span>`:n``}                    
                </vaadin-custom-field>
            `}renderRangeField(e,t,i,a){if(!this.field)return n``;const s=t;return n`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${i}"
                        data-colspan="${this.field.colspan}"
                ><ui5-range-slider start-value="${s?.from??0}" end-value="${s?.to??0}" 
                                   min="${this.field.sliderMin??0}" 
                                   max="${this.field.sliderMax??10}"
                                   step="${this.field.step||d}"
                                   @change="${r=>{const o=r.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{from:o.startValue,to:o.endValue},fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"
                                   style="min-width: 10rem;"
                ></ui5-range-slider></vaadin-custom-field>
            `}};ee.styles=R`
        ${st}

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
  `;ye([v()],ee.prototype,"component",2);ye([v()],ee.prototype,"field",2);ye([v()],ee.prototype,"baseUrl",2);ye([v()],ee.prototype,"state",2);ye([v()],ee.prototype,"data",2);ye([v()],ee.prototype,"appState",2);ye([v()],ee.prototype,"appData",2);ye([v()],ee.prototype,"labelAlreadyRendered",2);ye([$()],ee.prototype,"colorPickerOpened",2);ye([$()],ee.prototype,"colorPickerValue",2);ye([$()],ee.prototype,"filteredIcons",2);ee=ye([_("mateu-field")],ee);var qn=Object.defineProperty,Mn=Object.getOwnPropertyDescriptor,$t=(e,t,i,a)=>{for(var s=a>1?void 0:a?Mn(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&qn(t,i,s),s};const Bn=e=>{const t=[];return e.color&&e.color!=="normal"&&e.color!=="none"&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle==="tertiaryInline"?"tertiary-inline":e.buttonStyle),e.size&&e.size!=="none"&&e.size!=="normal"&&t.push(e.size),t.length?t.join(" "):void 0},Xi=e=>e==="back"||e==="backToList"||!!e&&e.startsWith("cancel");let We=class extends F{constructor(){super(...arguments),this.appState={},this.appData={},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.evalLabel=e=>ze(e,this.state,this.data),this.renderBtn=e=>{if((this.data??{})[e.actionId+".hidden"])return d;const t=this.evalLabel(e.label),i=V.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e.actionId));return i||n`
        <vaadin-button
                data-action-id="${e.id}"
                theme="${Bn(e)||d}"
                @click="${()=>this.handleButtonClick(e.actionId)}"
                ?disabled="${e.disabled}"
        >${e.iconOnLeft?n`<vaadin-icon icon="${e.iconOnLeft}"></vaadin-icon>`:d}${t}${e.iconOnRight?n`<vaadin-icon icon="${e.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>
    `}}render(){const e=this.metadata;if(!e)return n``;const t=e.toolbar??[],i=t.filter(l=>Xi(l.actionId)),a=t.filter(l=>!Xi(l.actionId)),s=i.length>0&&a.length>0?n`<span class="toolbar-divider"></span>`:d,r=e.avatar||e.title||e.subtitle||e.kpis?.length>0||e.header?.length>0||t.length>0,o=e.level??0;return o>0?this.setAttribute("data-nested",""):this.removeAttribute("data-nested"),n`
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
                    ${e?.header?.map(l=>g(this,l,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${i.map(this.renderBtn)}
                    ${s}
                    ${a.map(this.renderBtn)}
                </vaadin-horizontal-layout>
            `:r?n`
                <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: center;" class="form-header">
                    ${e.avatar?g(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):d}
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        ${e?.title&&o==0?n`<h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${de(ht(e?.title,this.state??{},this.data??{}))}</h2>`:d}
                        ${e?.title&&o==1?n`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${de(ht(e?.title,this.state??{},this.data??{}))}</h3>`:d}
                        ${e?.title&&o==2?n`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${de(ht(e?.title,this.state??{},this.data??{}))}</h4>`:d}
                        ${e?.title&&o==3?n`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${de(ht(e?.title,this.state??{},this.data??{}))}</h5>`:d}
                        ${e?.title&&o>3?n`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${de(ht(e?.title,this.state??{},this.data??{}))}</h6>`:d}

                        ${e?.subtitle?n`<span style="display: inline-block; margin-block-end: 0.83em;">${de(ht(e?.subtitle,this.state??{},this.data??{}))}</span>`:d}
                    </div>
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        ${e?.kpis?.map(l=>n`
                            <vaadin-vertical-layout style="align-items: center">
                                <div>${this.evalLabel(l.title)}</div>
                                <div>${de(ht(l.text,this.state??{},this.data??{}))}</div>
                            </vaadin-vertical-layout>
                        `)}
                        ${e?.header?.map(l=>g(this,l,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${i.map(this.renderBtn)}
                        ${s}
                        ${a.map(this.renderBtn)}
                    </vaadin-horizontal-layout>
                </vaadin-horizontal-layout>
            `:d}
            ${e.badges&&e.badges.length>0?n`
                <vaadin-horizontal-layout style="padding-bottom: var(--lumo-space-s);">
                    ${e.badges.map(l=>js(l,this.state??{},this.data??{}))}
                </vaadin-horizontal-layout>
            `:d}
        `}};We.styles=R`
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

        ${st}
    `;$t([v()],We.prototype,"metadata",2);$t([v()],We.prototype,"baseUrl",2);$t([v()],We.prototype,"state",2);$t([v()],We.prototype,"data",2);$t([v()],We.prototype,"appState",2);$t([v()],We.prototype,"appData",2);We=$t([_("mateu-content-header")],We);var Un=Object.defineProperty,jn=Object.getOwnPropertyDescriptor,Vt=(e,t,i,a)=>{for(var s=a>1?void 0:a?jn(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Un(t,i,s),s};let mt=class extends Wt{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={}}render(){const e=this.component?.metadata;return n`
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
       `}};mt.styles=R`
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
    `;Vt([v()],mt.prototype,"state",2);Vt([v()],mt.prototype,"data",2);Vt([v()],mt.prototype,"appState",2);Vt([v()],mt.prototype,"appData",2);mt=Vt([_("mateu-form")],mt);var Wn=Object.defineProperty,Vn=Object.getOwnPropertyDescriptor,Pe=(e,t,i,a)=>{for(var s=a>1?void 0:a?Vn(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Wn(t,i,s),s};let he=class extends F{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.pagesRequested=[],this.emptyArray=e=>!e||e.length==0,this.dataProvider=(e,t)=>{const i=this.data[this.id]?.page;if(this.metadata?.infiniteScrolling&&e.page>0){let a=!1;i&&i.content&&(i.content.length>=(e.page+1)*e.pageSize||i.content.length==i.totalElements)&&(t(i.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),i.totalElements),a=!0,this.grid&&this.grid.recalculateColumnWidths()),a||this.pagesRequested.find(s=>s==e.page)||(this.pagesRequested.push(e.page),this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:e,callback:()=>{this.data[this.id]?.page?.content&&(t(this.data[this.id].page.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),this.data[this.id].page.totalElements),this.grid&&this.grid.recalculateColumnWidths())}},bubbles:!0,composed:!0})))}else{const a=this.metadata?.infiniteScrolling?i?.totalElements:i?.content?.length??0;t(i?.content??[],a),this.grid&&this.grid.recalculateColumnWidths()}},this._onActionRequested=e=>{const t=e.detail,i=this.identifierFieldName;if(!i||!t.parameters||t.actionId?.startsWith("action-on-row-"))return;const a=t.parameters[i];a!==void 0&&(this.state._selectedId=String(a),this._applyCellPartNameGenerator(),this.grid?.requestContentUpdate())},this.tooltipGenerator=e=>{let t="";const{column:i,item:a}=e,s=this.metadata?.columns?.find(r=>r.metadata.id==i?.path);if(s?.metadata){const r=(s?.metadata).tooltipPath;r&&i&&a&&(t=a[r])}return t}}get identifierFieldName(){const e=this.metadata?.columns?.find(i=>i.metadata?.identifier);if(e)return e.metadata?.id;if(this.metadata?.columns?.find(i=>i.metadata?.id==="id"))return"id"}_applyCellPartNameGenerator(){if(!this.grid)return;const e=this.identifierFieldName,t=this.state?._selectedId??this.appState?._splitDetailId;e&&t!==void 0?this.grid.cellPartNameGenerator=(i,a)=>String(a.item[e])===String(t)?"selected-row":"":this.grid.cellPartNameGenerator=null}connectedCallback(){super.connectedCallback(),this.addEventListener("action-requested",this._onActionRequested)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("action-requested",this._onActionRequested)}updated(e){super.updated(e),this._applyCellPartNameGenerator(),this.grid?.clearCache(),this.grid?.recalculateColumnWidths(),this.pagesRequested=[]}render(){const e=this.data[this.id]?.page;let t="";this.metadata?.wrapCellContent&&(t+=" wrap-cell-content"),this.metadata?.compact&&(t+=" compact"),this.metadata?.noBorder&&(t+=" no-border"),this.metadata?.noRowBorder&&(t+=" no-row-borders"),this.metadata?.columnBorders&&(t+=" column-borders"),this.metadata?.rowStripes&&(t+=" row-stripes");const i=this.state[this.id+"_selected_items"]||[];return n`
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
                    @active-item-changed="${L(this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?a=>{if(this.metadata?.detailPath){const s=a.detail.value;s?this.detailsOpenedItems=[s]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${L(this.metadata?.detailPath?na(a=>n`${g(this,a[this.metadata?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    theme="${t}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?n`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:d}
                ${this.metadata?.columns?.map(a=>Ti(a,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}
                ${this.metadata?.useButtonForDetail?n`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${et((a,{detailsOpened:s})=>n`
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
                <span slot="empty-state">${pt(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(a=>a.metadata.tooltipPath)?n`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:d}
            </vaadin-grid>
            <slot></slot>
       `}};he.styles=R`
        ${st}
        vaadin-grid[data-clickable-rows]::part(row) {
            cursor: pointer;
        }
        vaadin-grid[data-clickable-rows]::part(row):hover {
            background-color: var(--lumo-primary-color-10pct);
        }
        vaadin-grid::part(selected-row) {
            background-color: var(--lumo-primary-color-10pct);
        }
  `;Pe([v()],he.prototype,"id",2);Pe([v()],he.prototype,"metadata",2);Pe([v()],he.prototype,"baseUrl",2);Pe([v()],he.prototype,"state",2);Pe([v()],he.prototype,"data",2);Pe([v()],he.prototype,"appState",2);Pe([v()],he.prototype,"appData",2);Pe([v()],he.prototype,"emptyStateMessage",2);Pe([$()],he.prototype,"detailsOpenedItems",2);Pe([Ae("vaadin-grid")],he.prototype,"grid",2);he=Pe([_("mateu-table")],he);var Hn=Object.defineProperty,Gn=Object.getOwnPropertyDescriptor,Ve=(e,t,i,a)=>{for(var s=a>1?void 0:a?Gn(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Hn(t,i,s),s};let Ie=class extends F{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.filtersOpened=!1,this.clickedOnClearFilters=()=>{const e={};this.metadata?.filters.forEach(t=>{e[t.fieldId]=void 0}),e.searchText=void 0,this.state={...this.state,...e},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:this.metadata?.filters.map(t=>t.fieldId)},bubbles:!0,composed:!0})),this.handleButtonClick()},this.clickedOnFilters=()=>{this.filtersOpened=!0},this.clickedOnSearch=()=>{this.filtersOpened=!1,this.handleButtonClick()},this.valueChanged=e=>{const t=e.detail.value;if(typeof t=="number"&&Number.isNaN(t))return;const i=e.target.id;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:i},bubbles:!0,composed:!0}))},this.handleButtonClick=()=>{this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))},this.renderActiveFilterBadges=()=>{const e=(this.metadata?.filters??[]).map(t=>t).filter(t=>{const i=this.state[t.fieldId];return i!=null&&i!==""&&!Number.isNaN(i)});return e.length===0?d:n`
            <div class="active-filters">
                ${e.map(t=>{const i=ze(t.label,this.state,this.data);return n`
                    <span theme="badge contrast pill" class="active-filter-badge">
                        <span>${i}: ${this.getFilterDisplayValue(t,this.state[t.fieldId])}</span>
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
                ${this.mainFilters.map(e=>g(this,this.wrapFilter(e),this.baseUrl,this.state,this.data,this.appState,this.appData))}
            `:d}

            ${this.effectiveFiltersLayout==="inline"?n`
                ${this.secondaryFilters.map(e=>g(this,this.wrapFilter(e),this.baseUrl,this.state,this.data,this.appState,this.appData))}
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
                ${Bt(()=>this.renderFilterControls(),[])}
                ${ai(()=>n`
                    <vaadin-button theme="tertiary" @click="${()=>this.filtersOpened=!1}">Cancel</vaadin-button>
                    <vaadin-button theme="primary" @click="${this.clickedOnSearch}" style="margin-left: auto;">Search</vaadin-button>
                `,[])}
        ></vaadin-dialog>
    `}updated(e){super.updated(e);const t=this.renderRoot?.querySelector("#filters-toggle-btn"),i=this.renderRoot?.querySelector("vaadin-popover");t&&i&&i.target!==t&&(i.target=t)}get mainFilters(){return(this.metadata?.filters??[]).filter(e=>e.mainFilter)}get secondaryFilters(){return(this.metadata?.filters??[]).filter(e=>!e.mainFilter)}get effectiveFiltersLayout(){const e=this.metadata?.filtersLayout??"auto";return e==="auto"?ga(this.secondaryFilters):e}handleKey(e){e.code=="Enter"&&(this.filtersOpened=!1,this.handleButtonClick())}connectedCallback(){super.connectedCallback(),this.metadata?.searchOnEnter&&this.addEventListener("keydown",this.handleKey)}disconnectedCallback(){super.disconnectedCallback(),this.metadata?.searchOnEnter&&this.removeEventListener("keydown",this.handleKey)}getFilterDisplayValue(e,t){if(e.options?.length){const i=e.options.find(a=>a.value===String(t));if(i)return i.label}return typeof t=="boolean"?t?"Yes":"No":String(t)}clearFilter(e){this.state={...this.state,[e]:void 0},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:e},bubbles:!0,composed:!0})),this.handleButtonClick()}wrapFilter(e){return{id:"",metadata:{...e,wantsFocus:!0},type:M.ClientSide,style:"",children:[],slot:"",cssClasses:"",initialData:{},confirmOnNavigationIfDirty:!1}}renderFilterControls(){return n`
            <mateu-event-interceptor .target="${this}">
                <vaadin-form-layout max-columns="1" @keydown="${this.handleKey}" auto-responsive>
                    <vaadin-form-row>
                        ${this.secondaryFilters.map(e=>g(this,this.wrapFilter(e),this.baseUrl,this.state,this.data,this.appState,this.appData))}
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
                ${Ii(()=>n`
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
        `}};Ie.styles=R`
        ${st}
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
    `;Ve([v()],Ie.prototype,"metadata",2);Ve([v()],Ie.prototype,"baseUrl",2);Ve([$()],Ie.prototype,"state",2);Ve([$()],Ie.prototype,"data",2);Ve([v()],Ie.prototype,"appState",2);Ve([v()],Ie.prototype,"appData",2);Ve([v({type:Boolean})],Ie.prototype,"searchOnly",2);Ve([$()],Ie.prototype,"filtersOpened",2);Ie=Ve([_("mateu-filter-bar")],Ie);var Kn=Object.defineProperty,Jn=Object.getOwnPropertyDescriptor,Ht=(e,t,i,a)=>{for(var s=a>1?void 0:a?Jn(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Kn(t,i,s),s};let vt=class extends F{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.totalPages=0}updated(e){super.updated(e),(e.has("totalElements")||e.has("pageSize"))&&(this.totalPages=Math.ceil(this.totalElements/this.pageSize))}dispatch(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return d;const e=this.totalPages>1,t=this.pageNumber,i=t===0,a=t>=this.totalPages-1;return n`
            <vaadin-horizontal-layout theme="spacing" style="align-items: center; flex-wrap: wrap;">
                ${e?n`
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
        `}};vt.styles=R`
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
    `;Ht([v()],vt.prototype,"totalElements",2);Ht([v()],vt.prototype,"pageSize",2);Ht([v()],vt.prototype,"pageNumber",2);Ht([$()],vt.prototype,"totalPages",2);vt=Ht([_("mateu-pagination")],vt);var Yn=Object.defineProperty,Xn=Object.getOwnPropertyDescriptor,we=(e,t,i,a)=>{for(var s=a>1?void 0:a?Xn(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Yn(t,i,s),s};let te=class extends F{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.dataProvider=(e,t)=>{const i=this.data[this.id]?.page;t(i?.content??[],i?.content?.length??0)},this.respondToVisibility=(e,t)=>{var i={root:document.documentElement},a=new IntersectionObserver(s=>{s.forEach(r=>{t(r.intersectionRatio>0)})},i);a.observe(e)},this.keepAsking=!1,this.askToUpper=()=>{const e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?Oi(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?n`<vaadin-card
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
                    <span slot="header-suffix" theme="badge ${si(e.status.type)}">${e.status.message}</span>
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
       `}};te.styles=R`
        ${st}
        
        .card-container {
            display: flex; 
            width: 100%; 
            flex-wrap: wrap; 
            gap: 10px;
        }

        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }

    `;we([v()],te.prototype,"id",2);we([v()],te.prototype,"metadata",2);we([v()],te.prototype,"baseUrl",2);we([v()],te.prototype,"state",2);we([v()],te.prototype,"data",2);we([v()],te.prototype,"appState",2);we([v()],te.prototype,"appData",2);we([v()],te.prototype,"emptyStateMessage",2);we([$()],te.prototype,"keepAsking",2);we([Ae("#ask-for-more")],te.prototype,"askForMore",2);we([$()],te.prototype,"hasMore",2);te=we([_("mateu-card-list")],te);var ka=(e=>(e.none="none",e.success="success",e.error="error",e.warning="warning",e.contrast="contrast",e.normal="normal",e))(ka||{}),Ea=(e=>(e.primary="primary",e.secondary="secondary",e.tertiary="tertiary",e.tertiaryInline="tertiaryInline",e))(Ea||{}),Qn=Object.defineProperty,Zn=Object.getOwnPropertyDescriptor,Oe=(e,t,i,a)=>{for(var s=a>1?void 0:a?Zn(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Qn(t,i,s),s};const eo={asc:"ascending",desc:"descending"};let pe=class extends F{constructor(){super(...arguments),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this.search=()=>{const e=this.component.metadata;this.state={...this.state,size:e.pageSize,page:0,crud_selected_items:[]},this._syncStateToUrl(e),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}}},bubbles:!0,composed:!0}))},this.notify=e=>{Ut.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.handleSearchRequested=e=>{this.state={...this.state,crud_selected_items:[]};const t=this.component.metadata;this._syncStateToUrl(t),!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}},callback:e},bubbles:!0,composed:!0}))},this.fetchMoreElements=e=>{const{params:t,callback:i}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(i)},this.directionChanged=e=>{const t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(i=>({fieldId:i.__data.path,direction:i.__data.direction?eo[i.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForComponentId=void 0,this.evalLabel=e=>ze(e,this.state,this.data),this.handleToolbarButtonClick=e=>{if(e==="import"){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{const t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"process-import",parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get cols(){return this.component?.metadata?.columns?.map(t=>t.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.component?.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":fa(this.cols,this.availableWidthPx):t}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}_filterIds(e){return new Set(["searchText",...(e.filters??[]).map(t=>t.fieldId)])}_syncStateToUrl(e){const t=this._filterIds(e),i=new URLSearchParams(window.location.search);t.forEach(l=>i.delete(l)),i.delete("page"),i.delete("sort"),t.forEach(l=>{const c=this.state[l];c!=null&&c!==""&&i.set(l,String(c))});const a=this.state.page;a&&a>0&&i.set("page",String(a));const s=this.state.sort;if(s&&s.length>0){const l=s.filter(c=>c.fieldId&&c.direction).map(c=>`${c.fieldId}:${c.direction}`).join(",");l&&i.set("sort",l)}const r=i.toString(),o=r?`${window.location.pathname}?${r}`:window.location.pathname;window.location.pathname+window.location.search!==o&&history.replaceState(null,"",o)}_initStateFromUrl(e,t){const i=new URLSearchParams(window.location.search),a=this._filterIds(e),s={...t};i.forEach((l,c)=>{a.has(c)&&(s[c]=l)});const r=i.get("page");if(r!==null){const l=parseInt(r,10);!isNaN(l)&&l>0&&(s.page=l)}const o=i.get("sort");if(o){const l=o.split(",").map(c=>{const[u,p]=c.split(":");return u&&p?{fieldId:u,direction:p}:null}).filter(Boolean);l.length>0&&(s.sort=l)}return s}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}updated(e){if(super.updated(e),e.has("component")){const t=this.component?.id;if(t!==this._initializedForComponentId){this._initializedForComponentId=t;const i=this.component?.metadata,a=i.initialPage&&i.initialPage>0?i.initialPage:0;this.state=this._initStateFromUrl(i,{...this.state,size:i.pageSize,page:a,sort:[]}),(this.state.page!==a||this.state.sort?.length>0||[...this._filterIds(i)].some(r=>this.state[r]!=null))&&this.handleSearchRequested(void 0)}}}render(){const e=x=>{const D=[];return x.color&&x.color!==ka.normal&&D.push(x.color),x.buttonStyle&&D.push(x.buttonStyle===Ea.tertiaryInline?"tertiary-inline":x.buttonStyle),D.length?D.join(" "):void 0},t=x=>x==="back"||x==="backToList"||!!x&&x.startsWith("cancel"),i=x=>{const D=V.get()?.renderToolbarButton?.(x,this.evalLabel(x.label),()=>this.handleToolbarButtonClick(x.actionId));return D||n`
                <vaadin-button
                        data-action-id="${x.id}"
                        theme="${e(x)||d}"
                        @click="${()=>this.handleToolbarButtonClick(x.actionId)}"
                >${this.evalLabel(x.label)}</vaadin-button>
            `};if(!this.component)return n`no component`;const a=this.component.metadata;a.serverSideOrdering=!0;const s=a?.toolbar??[],r=s.filter(x=>t(x.actionId)),o=s.filter(x=>!t(x.actionId)),l=r.length>0&&o.length>0,c=!!a?.title||!!a?.subtitle||s.length>0,u=this.effectiveGridLayout,p=this.cols,m=Ci(p),f=this.data[this.id]?.page?.content??[],y=this.state[this.component?.id]?.emptyStateMessage,w=(x,D)=>{const S=D[x.id];if(S==null)return n``;if(x.dataType==="status"){const H=si(S.type);return n`<span theme="badge pill ${H}">${S.message}</span>`}return x.dataType==="bool"?n`${S?"✓":"✗"}`:typeof S=="object"?n`${S.label??S.name??S.message??""}`:n`${S}`},b=()=>{const x=this.identifierFieldName,D=this.state._selectedId??this.appState?._splitDetailId,S=m.find(P=>P.identifier)??m[0],H=P=>P.dataType==="action"||P.dataType==="actionGroup"||P.dataType==="menu"||P.stereotype==="button",lt=m.filter(P=>P!==S&&!H(P)),Ot=p.filter(P=>H(P)),Je=(P,A,q)=>{P.stopPropagation(),P.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:A,parameters:{_clickedRow:q}},bubbles:!0,composed:!0}))},dt=P=>{const A=[];for(const q of Ot){const G=P[q.id];if(q.dataType==="action"){const Se=G?.methodNameInCrud?G:P.action?.methodNameInCrud?P.action:{methodNameInCrud:q.id,label:q.label,icon:null};A.push(n`
                            <vaadin-button theme="tertiary small" title="${Se.label||d}"
                                @click="${E=>Je(E,"action-on-row-"+Se.methodNameInCrud,P)}">
                                ${Se.icon?n`<vaadin-icon icon="${Se.icon}"></vaadin-icon>`:d}
                                ${Se.label??d}
                            </vaadin-button>`)}else(q.dataType==="actionGroup"||q.dataType==="menu")&&(G?.actions??[]).forEach(E=>A.push(n`
                            <vaadin-button theme="tertiary small" title="${E.label||d}"
                                @click="${X=>Je(X,"action-on-row-"+E.methodNameInCrud,P)}">
                                ${E.icon?n`<vaadin-icon icon="${E.icon}"></vaadin-icon>`:d}
                                ${E.label??d}
                            </vaadin-button>`))}return A.length?n`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${A}
                    </div>`:d};return n`
                <vaadin-list-box style="width: 100%;">
                    ${f.length===0?n`<vaadin-item disabled>${pt(y)}</vaadin-item>`:d}
                    ${f.map(P=>n`
                        <vaadin-item
                            ?selected="${x&&D!==void 0&&String(P[x])===String(D)}"
                            @click="${()=>{x&&P[x]!==void 0&&(this.state={...this.state,_selectedId:String(P[x])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:P},bubbles:!0,composed:!0}))}}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${S?P[S.id]??"":""}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${lt.map(A=>n`<span>${A.label}: ${w(A,P)}</span>`)}
                            </div>
                            ${dt(P)}
                        </vaadin-item>
                    `)}
                </vaadin-list-box>`},C=(x,D,S)=>{const H=this.identifierFieldName;H&&S[H]!==void 0&&(this.state={...this.state,_selectedId:String(S[H])}),x.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:D,parameters:S},bubbles:!0,composed:!0}))},k=()=>{const x=this.identifierFieldName,D=this.state._selectedId??this.appState?._splitDetailId,S=p.slice(0,6),H=S.filter(E=>E.stereotype==="image"),lt=S.find(E=>E.identifier)??S[0],Ot=E=>!!E.actionId,Je=E=>E.dataType==="action"||E.dataType==="actionGroup"||E.dataType==="menu"||E.stereotype==="button",dt=S.find(E=>E.id==="select"&&E.dataType==="action"),P=!!dt,A=S.filter(E=>E!==lt&&!H.includes(E)&&!Ot(E)&&!Je(E)),q=S.filter(E=>Je(E)&&!(P&&E===dt)),G=(E,X,Ye)=>{E.stopPropagation(),E.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:X,parameters:{_clickedRow:Ye}},bubbles:!0,composed:!0}))},Se=E=>{const X=[];for(const Ye of q){const pi=E[Ye.id];if(Ye.dataType==="action"){const yt=pi?.methodNameInCrud?pi:E.action?.methodNameInCrud?E.action:{methodNameInCrud:Ye.id,label:Ye.label,icon:null};X.push(n`
                            <vaadin-button theme="tertiary" title="${yt.label||d}"
                                @click="${ct=>G(ct,"action-on-row-"+yt.methodNameInCrud,E)}">
                                ${yt.icon?n`<vaadin-icon icon="${yt.icon}"></vaadin-icon>`:d}
                                ${yt.label??d}
                            </vaadin-button>`)}else(Ye.dataType==="actionGroup"||Ye.dataType==="menu")&&(pi?.actions??[]).forEach(ct=>X.push(n`
                            <vaadin-button theme="tertiary" title="${ct.label||d}"
                                @click="${Oa=>G(Oa,"action-on-row-"+ct.methodNameInCrud,E)}">
                                ${ct.icon?n`<vaadin-icon icon="${ct.icon}"></vaadin-icon>`:d}
                                ${ct.label??d}
                            </vaadin-button>`))}return X.length?n`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${X}
                    </div>`:d};return n`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${f.length===0?n`<div style="grid-column: 1 / -1;">${pt(y)}</div>`:d}
                    ${f.map(E=>n`
                        <vaadin-card
                            clickable
                            ?data-selected="${x&&D!==void 0&&String(E[x])===String(D)}"
                            style="cursor: pointer;"
                            @click="${X=>P?G(X,"action-on-row-select",E):C(X.target,"view",E)}"
                        >
                            ${H.length?n`<img slot="media" src="${E[H[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover;" />`:d}
                            ${lt?n`<div slot="title">${E[lt.id]??""}</div>`:d}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${A.map(X=>n`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${X.label}</span>
                                        <span>${w(X,E)}</span>
                                    </div>
                                `)}
                            </div>
                            ${Se(E)}
                        </vaadin-card>
                    `)}
                </div>`},T=()=>{const x=m.find(S=>S.identifier)??m[0],D=m.filter(S=>S!==x);return n`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <vaadin-list-box style="width: 100%;">
                            ${f.length===0?n`<vaadin-item disabled>${pt(y)}</vaadin-item>`:d}
                            ${f.map(S=>n`
                                <vaadin-item
                                    ?selected="${this.selectedItem===S}"
                                    @click="${()=>{this.selectedItem=S}}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${x?S[x.id]??"":""}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${D.map(H=>n`${w(H,S)} `)}
                                    </div>
                                </vaadin-item>
                            `)}
                        </vaadin-list-box>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?n`
                            <vaadin-form-layout>
                                ${p.map(S=>n`
                                    <vaadin-text-field
                                        label="${S.label}"
                                        .value="${String(this.selectedItem[S.id]??"")}"
                                        readonly
                                    ></vaadin-text-field>
                                `)}
                            </vaadin-form-layout>
                        `:n`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},z=()=>{const x=this.identifierFieldName,D=this.state._selectedId??this.appState?._splitDetailId,S=p[0],H=p.slice(1),lt=!!S?.actionId,Ot=(A,q)=>{const G=A.parentItem?A.parentItem.children??[]:f;q(G,G.length)},Je=(A,q)=>{for(const G of A??[]){if(x&&String(G[x])===q)return G;const Se=Je(G.children,q);if(Se)return Se}},dt=x&&D!==void 0?Je(f,String(D)):void 0,P=(A,q,G)=>{A.stopPropagation(),x&&q[x]!==void 0&&(this.state={...this.state,_selectedId:String(q[x])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:G,parameters:q},bubbles:!0,composed:!0}))};return n`
                <vaadin-grid
                    style="width: 100%;"
                    all-rows-visible
                    .itemHasChildrenPath="${"children"}"
                    .itemIdPath="${x??"id"}"
                    .dataProvider="${Ot}"
                    .selectedItems="${dt?[dt]:[]}"
                >
                    ${S?n`<vaadin-grid-tree-column path="${S.id}" header="${S.label??d}" flex-grow="1"></vaadin-grid-tree-column>`:d}
                    ${lt?n`
                    <vaadin-grid-column width="6rem" flex-grow="0" text-align="end" ${et(A=>A?.viewable===!1?d:n`
                        <vaadin-button theme="tertiary small" @click="${q=>P(q,A,"view")}">View</vaadin-button>
                    `,[])}></vaadin-grid-column>`:d}
                    ${H.map(A=>n`<vaadin-grid-column path="${A.id}" header="${A.label??d}" auto-width></vaadin-grid-column>`)}
                    <span slot="empty-state">${pt(y)}</span>
                </vaadin-grid>`},B=V.get()?.rendersCrudLayouts?.()===!0,ot=n`
            ${a.infiniteScrolling?n`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:d}
            ${!B&&u==="list"?b():!B&&u==="cards"?a.contentHeight?n`
                <vaadin-scroller style="width: 100%; height: ${a.contentHeight};">
                    ${k()}
                </vaadin-scroller>
            `:k():!B&&u==="masterDetail"?T():!B&&u==="tree"?z():V.get()?.renderTableComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,Pt=a.infiniteScrolling?d:V.get()?.renderPagination(this,this.component),Jt=n`
            <vaadin-dialog
                .opened="${this.showImportDialog}"
                header-title="Import"
                @opened-changed="${x=>{this.showImportDialog=x.detail.value}}"
                ${Bt(()=>n`
                    <vaadin-upload
                        target="/upload"
                        max-files="1"
                        @upload-success="${this.handleImportUploadSuccess}"
                    ></vaadin-upload>
                `,[this.showImportDialog])}
                ${ai(()=>n`
                    <vaadin-button @click="${()=>{this.showImportDialog=!1}}">Cancel</vaadin-button>
                `,[])}
            ></vaadin-dialog>
        `;return this.standalone?n`
                ${Jt}
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
                    <div style="flex-shrink: 0;">${V.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                    <div style="flex: 1; overflow-y: auto; min-height: 0;">${ot}</div>
                    <div style="flex-shrink: 0;">${Pt}</div>
                </div>
            `:n`
            ${Jt}
            ${c?n`
                    <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m);">
                        <div style="flex: 1; min-width: 0;">
                            ${a?.title?n`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(a.title)}</h2>
                            `:d}
                            ${a?.subtitle?n`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(a.subtitle)}</span>
                            `:d}
                        </div>
                        ${r.map(x=>i(x))}
                        ${l?n`<span class="toolbar-divider"></span>`:d}
                        ${o.map(x=>i(x))}
                        <slot></slot>
                    </vaadin-horizontal-layout>
                `:d}
            <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); padding: var(--lumo-space-m); display: flex; flex-direction: column;">
                <div style="flex-shrink: 0;">${V.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                <div style="flex: 1; overflow-y: auto; min-height: 0;">${ot}</div>
                <div style="flex-shrink: 0;">${Pt}</div>
            </div>
        `}createRenderRoot(){return V.mustUseShadowRoot()?super.createRenderRoot():this}};pe.styles=R`
        ${st}
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
    `;Oe([v()],pe.prototype,"component",2);Oe([v()],pe.prototype,"baseUrl",2);Oe([v({type:Boolean})],pe.prototype,"standalone",2);Oe([v()],pe.prototype,"state",2);Oe([v()],pe.prototype,"data",2);Oe([v()],pe.prototype,"appState",2);Oe([v()],pe.prototype,"appData",2);Oe([$()],pe.prototype,"showImportDialog",2);Oe([$()],pe.prototype,"availableWidthPx",2);Oe([$()],pe.prototype,"selectedItem",2);pe=Oe([_("mateu-table-crud")],pe);var to=Object.defineProperty,io=Object.getOwnPropertyDescriptor,di=(e,t,i,a)=>{for(var s=a>1?void 0:a?io(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&to(t,i,s),s};let kt=class extends F{constructor(){super(...arguments),this.notificationOpened=!1,this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1,this.error=e.detail.reason,this.openNotification()},this.openNotification=()=>{this.notificationOpened=!0},this.closeNotification=()=>{this.notificationOpened=!1},this.notificationRenderer=()=>n`
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
                ${ra(this.notificationRenderer,[])}
        ></vaadin-notification>`}};kt.styles=R`
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
  `;di([$()],kt.prototype,"loading",2);di([$()],kt.prototype,"notificationOpened",2);di([$()],kt.prototype,"error",2);kt=di([_("mateu-api-caller")],kt);var ao=Object.defineProperty,so=Object.getOwnPropertyDescriptor,qe=(e,t,i,a)=>{for(var s=a>1?void 0:a?so(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&ao(t,i,s),s};let be=class extends F{constructor(){super(...arguments),this.message="This website uses cookies.",this.dismiss="Ok. Thanks :).",this.learnMore="Learn more",this.learnMoreLink="https://cookiesandyou.com/",this.showLearnMore=!0,this.position="top",this.cookieName="mateu-cookieconsent"}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement("style"),this._css.innerText=".cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}",document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){const e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){const e=this.popup;e&&(e.classList.remove("cc-invisible"),e.style.display="")}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:"#000"},button:{background:"rgba(22, 118, 243, 0.95)",hover:"rgba(22, 118, 243, 1)"}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});const e=this.popup;if(e){e.setAttribute("role","alert");const t=e.querySelector("a.cc-btn");t?.addEventListener("keydown",i=>{const r=i.keyCode||i.which;(r===32||r===13)&&t.click()})}}render(){return n`
       `}};be.styles=R`
  `;qe([v()],be.prototype,"message",2);qe([v()],be.prototype,"dismiss",2);qe([v()],be.prototype,"learnMore",2);qe([v()],be.prototype,"learnMoreLink",2);qe([v()],be.prototype,"showLearnMore",2);qe([v()],be.prototype,"position",2);qe([v()],be.prototype,"cookieName",2);qe([$()],be.prototype,"_css",2);qe([Ae('[aria-label="cookieconsent"]')],be.prototype,"popup",2);be=qe([_("mateu-cookie-consent")],be);var ro=Object.defineProperty,no=Object.getOwnPropertyDescriptor,Ia=(e,t,i,a)=>{for(var s=a>1?void 0:a?no(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&ro(t,i,s),s};let ti=class extends F{constructor(){super(...arguments),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener("value-changed",this.redispatchEvent),this.addEventListener("data-changed",this.redispatchEvent),this.addEventListener("action-requested",this.redispatchEvent),this.addEventListener("server-side-action-requested",this.redispatchEvent),this.addEventListener("route-changed",this.redispatchEvent),this.addEventListener("close-modal-requested",this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("value-changed",this.redispatchEvent),this.removeEventListener("data-changed",this.redispatchEvent),this.removeEventListener("action-requested",this.redispatchEvent),this.removeEventListener("server-side-action-requested",this.redispatchEvent),this.removeEventListener("route-changed",this.redispatchEvent)}render(){return n`<slot></slot>`}};ti.styles=R`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `;Ia([v()],ti.prototype,"target",2);ti=Ia([_("mateu-event-interceptor")],ti);var oo=Object.defineProperty,lo=Object.getOwnPropertyDescriptor,_a=(e,t,i,a)=>{for(var s=a>1?void 0:a?lo(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&oo(t,i,s),s};let ii=class extends bt{constructor(){super(...arguments),this.opened=!0,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),500)}}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}render(){const e=this.component.metadata;let t="";e.noPadding&&(t+=" no-padding");const i=la(e.headerTitle,this.state,this.data,this.appState,this.appData);return n`
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
                ${e.header||e.closeButtonOnHeader?Aa(()=>n`<mateu-event-interceptor .target="${this}" style="width: 100%;">${e.header?g(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):d}${e.closeButtonOnHeader?n`
                            <vaadin-button theme="tertiary" @click="${this.close}">
                                <vaadin-icon icon="lumo:cross"></vaadin-icon>
                            </vaadin-button>
                        `:d}</mateu-event-interceptor>`,[this.state,this.data]):d}
                ${e.footer?ai(()=>n`<mateu-event-interceptor .target="${this}" style="width: 100%;">${g(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):d}
                ${e.content?Bt(()=>n`<mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${g(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):d}
                style="${this.component?.style}" 
                class="${this.component?.cssClasses}"
        >
        </vaadin-dialog>

       `}};ii.styles=R`
  `;_a([$()],ii.prototype,"opened",2);ii=_a([_("mateu-dialog")],ii);var co=Object.defineProperty,uo=Object.getOwnPropertyDescriptor,se=(e,t,i,a)=>{for(var s=a>1?void 0:a?uo(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&co(t,i,s),s};function Qi(e){if(e.parentElement)return e.parentElement;const t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}let J=class extends F{constructor(){super(...arguments),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type==="keydown"){const t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{const t=e.detail,i=t.banners??[],a=t.append??!1;a?this.actionBanners=[...this.actionBanners,...i]:(this._clearActionBannerTimers(),this.actionBanners=i);const s=a?this.actionBanners.length-i.length:0;i.forEach((r,o)=>{if(r.timeoutSeconds&&r.timeoutSeconds>0){const l=s+o;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((c,u)=>u!==l)},r.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;const t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;const i=parseInt(t[1],10)-1;i>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(i))},this._onScrollSpy=()=>{if(this._tocLocked)return;const e=this._sectionCards();if(!e.length)return;const t=12,i=this.shadowRoot?.querySelector("mateu-content-header");let a=i?i.getBoundingClientRect().bottom:0;for(const o of e){if(!o.classList.contains("mateu-section--sticky"))continue;const l=o.getBoundingClientRect();l.top<=a+t+2&&(a=Math.max(a,l.bottom))}const s=a+t+4;let r=0;this._tocEntries.forEach((o,l)=>{o.el.getBoundingClientRect().top<=s&&(r=l)}),this._activeToc=r}}connectedCallback(){super.connectedCallback(),document.addEventListener("page-banners-received",this._bannersHandler),window.addEventListener("resize",this._onResize),document.addEventListener("keydown",this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("page-banners-received",this._bannersHandler),window.removeEventListener("resize",this._onResize),document.removeEventListener("keydown",this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy()}updated(e){super.updated(e),e.has("component")&&e.get("component")!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has("component")&&(this._scheduleStaticBannerTimeouts(),this.dispatchEvent(new CustomEvent("compact-changed",{detail:{compact:!!this.component?.style?.includes("--mateu-compact:1")},bubbles:!0,composed:!0})),this._scheduleTocRebuild())}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(i=>clearTimeout(i)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((i,a)=>{i.timeoutSeconds&&i.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,a])},i.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,i)=>i!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){const t=e.theme?.toLowerCase()??"info";return t==="none"?"":t}_evalBannerText(e){return ze(e,this.state,this.data)}_renderBanner(e,t){const i=this._evalBannerText(e.title),a=this._evalBannerText(e.description);return n`
            <vaadin-card class="page-banner page-banner--${this.bannerThemeClass(e)}">
                ${i?n`
                    <div slot="title" style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span>${i}</span>
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
                ${a?n`<p>${a}</p>`:d}
            </vaadin-card>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll("vaadin-card.mateu-section"))}_sectionTitle(e){const t=e.querySelector('[slot="title"]')?.textContent?.trim();return t||e.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()||void 0}_rebuildToc(){const e=this._sectionCards(),t=e.map(r=>({title:this._sectionTitle(r),el:r})).filter(r=>!!r.title),i=this.component?.metadata?.toc,a=t.length>4&&e.every(r=>!r.closest("vaadin-horizontal-layout")),s=(i===!0?!0:i===!1?!1:a)&&t.length>0;this._tocEntries=t,this._tocVisible=s,this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),s?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){const e=this.shadowRoot?.querySelector("mateu-content-header");this._headerH=this._tocVisible&&e?e.offsetHeight:0,this.style.setProperty("--mateu-header-h",this._headerH+"px");const t=12;let i=this._headerH+t;for(const a of this._sectionCards())a.classList.contains("mateu-section--sticky")&&(a.style.top=i+"px",i+=a.offsetHeight+t)}_scrollContainer(){let e=Qi(this);for(;e;){const t=getComputedStyle(e).overflowY;if((t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight)return e;e=Qi(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener("scroll",this._onScrollSpy,{passive:!0}),window.addEventListener("wheel",this._unlockToc,{passive:!0}),window.addEventListener("touchstart",this._unlockToc,{passive:!0}),window.addEventListener("keydown",this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener("scroll",this._onScrollSpy),window.removeEventListener("wheel",this._unlockToc),window.removeEventListener("touchstart",this._unlockToc),window.removeEventListener("keydown",this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){const t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;const i=12;let a=this._headerH+i;for(const l of this._sectionCards()){if(l===t.el)break;l.classList.contains("mateu-section--sticky")&&(a+=l.offsetHeight+i)}const s=this._scrollContainer(),r=s?s.getBoundingClientRect().top:0,o=t.el.getBoundingClientRect().top-r-a;(s??window).scrollBy({top:o,behavior:"smooth"})}render(){const e=this.component?.metadata,a=[...(e?.banners??[]).map((r,o)=>({banner:r,index:o})).filter(({index:r})=>!this.dismissedStaticBannerIndices.has(r)).map(({banner:r,index:o})=>({banner:r,onDismiss:()=>this._dismissStaticBanner(o)})),...this.actionBanners.map((r,o)=>({banner:r,onDismiss:()=>this._dismissActionBanner(o)}))],s=n`
            <mateu-content-header
                class="${this._tocVisible?"sticky-header":""}"
                .metadata="${e}"
                .baseUrl="${this.baseUrl}"
                .state="${this.state}"
                .data="${this.data}"
                .appState="${this.appState}"
                .appData="${this.appData}"
            ></mateu-content-header>
            ${a.length>0?n`
                <div class="page-banners">
                    ${a.map(({banner:r,onDismiss:o})=>this._renderBanner(r,o))}
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
                ${e?.footer?.map(r=>g(this,r,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `;return n`<vaadin-vertical-layout style="width: 100%;">${s}</vaadin-vertical-layout>`}};J.styles=R`
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
    `;se([v()],J.prototype,"component",2);se([v()],J.prototype,"baseUrl",2);se([v()],J.prototype,"state",2);se([v()],J.prototype,"data",2);se([v()],J.prototype,"appState",2);se([v()],J.prototype,"appData",2);se([v()],J.prototype,"value",2);se([v({type:Boolean})],J.prototype,"standalone",2);se([$()],J.prototype,"actionBanners",2);se([$()],J.prototype,"dismissedStaticBannerIndices",2);se([$()],J.prototype,"_tocEntries",2);se([$()],J.prototype,"_activeToc",2);se([$()],J.prototype,"_tocVisible",2);J=se([_("mateu-page")],J);const ci=R`
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
`,Tt=e=>Y`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,Li=Tt(Y`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),Di=Tt(Y`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),Fi=Tt(Y`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`),ho=Tt(Y`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`),po=Tt(Y`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`),mo=Tt(Y`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`);var vo=Object.defineProperty,fo=Object.getOwnPropertyDescriptor,xe=(e,t,i,a)=>{for(var s=a>1?void 0:a?fo(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&vo(t,i,s),s};const Zi=["#e91e63","#1676f3","#10b981","#8b5cf6","#f59e0b","#ef4444"],go=e=>Zi[Math.abs(e??0)%Zi.length],bo=e=>(e??"?").split(/\s+/).filter(t=>t).map(t=>t[0]).slice(0,2).join("").toUpperCase()||"?";let ie=class extends F{constructor(){super(...arguments),this.menu=[],this.chatSessionId=Q(),this.menuContextSent=!1,this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onSpeechResult=e=>{if(this.recognition){const t=e,i=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=i,this.send(new CustomEvent("submit",{detail:{value:i},bubbles:!0,composed:!0})))}},this.send=async e=>{this.messageInputElement?.setAttribute("disabled","disabled");const t=e.detail.value.trim();if(!t||!this.sseUrl)return;this.addMessage(t,"user");const i=this.addMessage("","agent");this.startLoading();let a="";try{const s={Accept:"text/event-stream","Content-Type":"application/json"},r=localStorage.getItem("__mateu_auth_token");r&&(s.Authorization="Bearer "+r);const o=sessionStorage.getItem("__mateu_sesion_id");o&&(s["X-Session-Id"]=o);const l=JSON.stringify({message:t,sessionId:this.chatSessionId,...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;const c=await fetch(this.sseUrl,{method:"POST",headers:s,body:l});if(!c.ok){const f=await c.text();throw new Error(`Servidor respondió ${c.status}: ${f}`)}const u=c.body?.getReader();if(!u)throw new Error("No se pudo obtener el reader del stream.");const p=new TextDecoder;let m="";for(;;){const{done:f,value:y}=await u.read();if(f){if(m.trim().startsWith("data:")){const k=m.trim().slice(5).trim(),T=this.tryParseTokenUsage(k),z=!T&&this.tryParseCustomEvent(k);T?this.tokenUsage={...this.tokenUsage,...T}:z?z.event==="agent-error"?(a="⚠️ "+(z.detail?.message??"Error desconocido del agente"),this.updateMessage(i,a)):this.dispatchEvent(new CustomEvent(z.event,{detail:z.detail,bubbles:!0,composed:!0})):(a+=k,this.updateMessage(i,a))}break}const w=p.decode(y,{stream:!0});m+=w;const b=m.split(`
`);m=b.pop()||"";let C=!1;for(const k of b)if(k.trim().startsWith("data:")){const T=k.trim().slice(5).trim(),z=this.tryParseTokenUsage(T),B=!z&&this.tryParseCustomEvent(T);z?this.tokenUsage={...this.tokenUsage,...z}:B?B.event==="agent-error"?(a="⚠️ "+(B.detail?.message??"Error desconocido del agente"),this.updateMessage(i,a)):this.dispatchEvent(new CustomEvent(B.event,{detail:B.detail,bubbles:!0,composed:!0})):(a+=T+`
`,C=!0)}C&&this.updateMessage(i,a)}a||this.updateMessage(i,"⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).")}catch(s){console.error("Error en el flujo SSE:",s);const r=s?.message??String(s);(r==="Failed to fetch"||r==="network error"||r==="Load failed")&&!a?this.updateMessage(i,"⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible."):this.updateMessage(i,"⚠️ Error: "+r)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value="")},250),this.messageInputElement?.removeAttribute("disabled"),this.messageInputElement?.focus()}},this.closeChat=()=>{this.dispatchEvent(new CustomEvent("close-requested",{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{const e=this.messageInputElement?.value?.trim()??"";e&&this.send(new CustomEvent("submit",{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key==="Enter"&&(e.preventDefault(),this.submitFromInput())}}connectedCallback(){super.connectedCallback();const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){const t=new e;this.recognition=t,t.lang="es-ES",t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=i=>{console.error("Error de reconocimiento: "+i.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:"smooth"})},0)}addMessage(e,t){const i={text:e,time:new Date().toLocaleTimeString(),userName:t.includes("agent")?"Asistente":"Tú",userColorIndex:t.includes("agent")?2:1};return this.items=[...this.items,i],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((i,a)=>a===e?{...i,text:t}:i),this.scrollBottom()}tryParseCustomEvent(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const i=JSON.parse(t);if(typeof i.event=="string")return{event:i.event,detail:i.detail??{}}}catch{}return null}tryParseTokenUsage(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const i=JSON.parse(t);if("inputTokens"in i||"outputTokens"in i||"totalTokens"in i)return i}catch{}return null}buildMenuContext(e,t=[]){const i=[];for(const a of e){if(a.separator||a.remote)continue;const s=[...t,a.label];if(a.submenus&&a.submenus.length>0)i.push(...this.buildMenuContext(a.submenus,s));else{const r={path:s,navigation:{route:a.route,consumedRoute:a.consumedRoute,actionId:a.actionId??"",baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix}};a.description&&(r.description=a.description),i.push(r)}}return i}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}render(){return n`
            <div class="chat-container">
                <div class="chat-header">
                    <span class="chat-title">AI Assistant</span>
                    <button class="chat-close" @click="${this.closeChat}" title="Cerrar">
                        ${mo}
                    </button>
                </div>
                <div class="scroll-container">
                    <div class="message-list" role="list">
                        ${this.items.map(e=>n`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${go(e.userColorIndex)};">${bo(e.userName)}</div>
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
                    >${po}</button>
                    <input class="msg-input"
                           placeholder="Message"
                           aria-label="Message"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">Send</button>
                </div>
            </div>
        `}};ie.styles=[ci,R`
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
    `];xe([v()],ie.prototype,"sseUrl",2);xe([v({attribute:!1})],ie.prototype,"menu",2);xe([v()],ie.prototype,"items",2);xe([Ae(".scroll-container")],ie.prototype,"scrollContainer",2);xe([Ae(".msg-input")],ie.prototype,"messageInputElement",2);xe([$()],ie.prototype,"recognition",2);xe([$()],ie.prototype,"listening",2);xe([$()],ie.prototype,"recognitionAvailable",2);xe([$()],ie.prototype,"loading",2);xe([$()],ie.prototype,"elapsedSeconds",2);xe([$()],ie.prototype,"tokenUsage",2);ie=xe([_("mateu-chat")],ie);var $o=Object.defineProperty,yo=Object.getOwnPropertyDescriptor,Gt=(e,t,i,a)=>{for(var s=a>1?void 0:a?yo(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&$o(t,i,s),s};let ft=class extends F{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.data&&this.createChart(this.data)}async createChart(e){const[{default:t}]=await Promise.all([ce(()=>import("./vendor-chartjs.js").then(a=>a.a),[]),ce(()=>import("./vendor-chartjs.js").then(a=>a.c),[])]);if(e!==this.data)return;this.chart&&this.chart.destroy();const i={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,i)}handleSlotChange(){}render(){return n`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};ft.styles=R`
  `;Gt([v()],ft.prototype,"type",2);Gt([v()],ft.prototype,"data",2);Gt([v()],ft.prototype,"options",2);Gt([Ae("#chart")],ft.prototype,"chartElement",2);ft=Gt([_("mateu-chart")],ft);var wo=Object.defineProperty,xo=Object.getOwnPropertyDescriptor,Ai=(e,t,i,a)=>{for(var s=a>1?void 0:a?xo(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&wo(t,i,s),s};let Mt=class extends F{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){const{default:t}=await ce(async()=>{const{default:a}=await import("./vendor-diagrams.js").then(s=>s.i);return{default:a}},__vite__mapDeps([4,3,1,2]));if(e!==this.xml)return;this.chart&&this.chart.destroy();const i={container:this.divElement};this.chart=new t(i),this.chart.importXML(e)}handleSlotChange(){}render(){return n`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};Mt.styles=R`
  `;Ai([v()],Mt.prototype,"xml",2);Ai([Ae("#canvas")],Mt.prototype,"divElement",2);Mt=Ai([_("mateu-bpmn")],Mt);var Co=Object.defineProperty,So=Object.getOwnPropertyDescriptor,Rt=(e,t,i,a)=>{for(var s=a>1?void 0:a?So(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Co(t,i,s),s};const gi=160,Le=56,ko=220,ea=110,Xe=60,Eo={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},Io={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},_o=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];function To(){return"step-"+Math.random().toString(36).slice(2,8)}let at=class extends F{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.wf={name:"New Workflow",steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value")){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){const e=this.wf.steps??[],t={};e.forEach(o=>{t[o.id]=0});let i=!0;for(;i;)i=!1,e.forEach(o=>{if(o.preconditionStepId!=null&&t[o.preconditionStepId]!==void 0){const l=t[o.preconditionStepId]+1;l>t[o.id]&&(t[o.id]=l,i=!0)}});const a={};e.forEach(o=>{const l=t[o.id]??0;(a[l]??=[]).push(o.id)});const s={...this.positions};let r=!1;Object.entries(a).forEach(([o,l])=>{const c=Number(o);l.forEach((u,p)=>{s[u]||(s[u]={x:Xe+c*ko,y:Xe+p*ea},r=!0)})}),r&&(this.positions=s)}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(i=>i.id===e?{...i,...t}:i)},this.emit()}addStep(){const e=To(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const i=Object.values(this.positions).map(s=>s.y),a=i.length?Math.max(...i)+ea:Xe;this.positions={...this.positions,[e]:{x:Xe,y:a}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(a=>a.id!==e).map(a=>a.preconditionStepId===e?{...a,preconditionStepId:void 0}:a)};const{[e]:t,...i}=this.positions;this.positions=i,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;const i=this.positions[t]??{x:0,y:0},a=this.toSvgPoint(e);this.dragOffset={x:a.x-i.x,y:a.y-i.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(a=>a.x))+gi+Xe:600,i=e.length?Math.max(...e.map(a=>a.y))+Le+Xe:400;return{w:Math.max(t,600),h:Math.max(i,400)}}render(){const{w:e,h:t}=this.canvasSize(),i=this.wf.steps??[];return n`
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
        `}renderToolbar(){const e=this.wf.status??"DRAFT";return n`
            <div class="toolbar">
                <span class="wf-name">${this.wf.name}</span>
                <span class="badge badge-${e.toLowerCase()}">${e}</span>
                <div style="flex:1"></div>
                <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                    ${Li}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${Di}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Fi}
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
        `}renderArrow(e){if(!e.preconditionStepId)return Y``;const t=this.positions[e.preconditionStepId],i=this.positions[e.id];if(!t||!i)return Y``;const a=t.x+gi,s=t.y+Le/2,r=i.x,o=i.y+Le/2,l=(a+r)/2;return Y`
            <path d="M${a},${s} C${l},${s} ${l},${o} ${r},${o}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:Xe,y:Xe},i=Eo[e.type]??"#64748b",a=Io[e.type]??"•",s=this.selectedId===e.id;return Y`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${r=>this.onNodeMouseDown(r,e.id)}"
               @click="${r=>{r.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${gi}" height="${Le}" rx="8"
                      fill="white"
                      stroke="${s?i:"#e2e8f0"}"
                      stroke-width="${s?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${Le}" rx="8" fill="${i}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${Le}" fill="${i}"/>
                <text x="16" y="${Le/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${a}</text>
                <!-- name -->
                <text x="44" y="${Le/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+"…":e.name}
                </text>
                <text x="44" y="${Le/2+8}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${Le/2+20}" font-size="9" fill="${i}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(a=>a.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(a=>a.id!==e.id),i=(a,s)=>n`
            <div class="field">
                <label class="field-label">${a}</label>
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
                    ${i("ID",n`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${i("Name",n`<input class="inp" .value="${e.name}"
                        @change="${a=>this.updateStep(e.id,{name:a.target.value})}"/>`)}
                    ${i("Type",n`
                        <select class="inp" @change="${a=>this.updateStep(e.id,{type:a.target.value})}">
                            ${_o.map(a=>n`<option value="${a}" ?selected="${e.type===a}">${a}</option>`)}
                        </select>`)}
                    ${i("Description",n`<textarea class="inp" rows="2"
                        @change="${a=>this.updateStep(e.id,{description:a.target.value})}">${e.description??""}</textarea>`)}
                    ${i("Precondition step",n`
                        <select class="inp" @change="${a=>this.updateStep(e.id,{preconditionStepId:a.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(a=>n`<option value="${a.id}" ?selected="${e.preconditionStepId===a.id}">${a.name} (${a.id})</option>`)}
                        </select>`)}
                    ${i("Precondition expression",n`<input class="inp" placeholder="JEXL expression"
                        .value="${e.preconditionExpression??""}"
                        @change="${a=>this.updateStep(e.id,{preconditionExpression:a.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}"
                               @change="${a=>this.updateStep(e.id,{parallel:a.target.checked})}"/>
                    </div>
                    ${i("Timeout (ms)",n`<input class="inp" type="number" min="0"
                        .value="${String(e.timeout??0)}"
                        @change="${a=>this.updateStep(e.id,{timeout:Number(a.target.value)})}"/>`)}
                    ${i("Retries",n`<input class="inp" type="number" min="0"
                        .value="${String(e.retries??0)}"
                        @change="${a=>this.updateStep(e.id,{retries:Number(a.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}"
                               @change="${a=>this.updateStep(e.id,{rollbackable:a.target.checked})}"/>
                    </div>
                    ${e.rollbackable?i("Compensation step",n`
                        <select class="inp" @change="${a=>this.updateStep(e.id,{compensationStepId:a.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(a=>n`<option value="${a.id}" ?selected="${e.compensationStepId===a.id}">${a.name} (${a.id})</option>`)}
                        </select>`):""}

                    ${e.type==="ACTION"?i("Topic",n`<input class="inp" placeholder="kafka.topic.name"
                        .value="${e.topic??""}"
                        @change="${a=>this.updateStep(e.id,{topic:a.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?i("Form ID",n`<input class="inp"
                        .value="${e.formId??""}"
                        @change="${a=>this.updateStep(e.id,{formId:a.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?i("Child workflow ID",n`<input class="inp"
                        .value="${e.childWorkflowDefinitionId??""}"
                        @change="${a=>this.updateStep(e.id,{childWorkflowDefinitionId:a.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),i=URL.createObjectURL(t),a=document.createElement("a");a.href=i,a.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",a.click(),URL.revokeObjectURL(i)}};at.styles=[ci,R`
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
    `];Rt([v()],at.prototype,"value",2);Rt([$()],at.prototype,"wf",2);Rt([$()],at.prototype,"positions",2);Rt([$()],at.prototype,"selectedId",2);Rt([$()],at.prototype,"showMeta",2);at=Rt([_("mateu-workflow")],at);var Ro=Object.defineProperty,Po=Object.getOwnPropertyDescriptor,He=(e,t,i,a)=>{for(var s=a>1?void 0:a?Po(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Ro(t,i,s),s};const Lt=160,ke=56,Qe=60,Oo={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},Lo={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},Do=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];let bi;const Fo=()=>(bi||(bi=ce(()=>import("./vendor-diagrams.js").then(e=>e.e),__vite__mapDeps([4,3,1,2])).then(e=>new e.default)),bi);function Ao(){return"step-"+Math.random().toString(36).slice(2,8)}let _e=class extends F{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.readOnly=!1,this.wf={name:"New Workflow",steps:[]},this.positions={},this.layoutReady=!1,this.selectedId=null,this.showMeta=!1,this.layoutError=null,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.elkPositioned=new Set,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.elkPositioned.add(this.draggingId),this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value"))try{const t=JSON.parse(this.value),i=new Set((this.wf.steps??[]).map(r=>r.id)),a=new Set((t.steps??[]).map(r=>r.id)),s=i.size!==a.size||[...a].some(r=>!i.has(r))||[...a].some(r=>{const o=(this.wf.steps??[]).find(c=>c.id===r),l=(t.steps??[]).find(c=>c.id===r);return o?.preconditionStepId!==l?.preconditionStepId});this.wf=t,(s||!this.layoutReady)&&this.runElkLayout()}catch{}}async runElkLayout(){const e=this.wf.steps??[];if(e.length===0){this.positions={},this.layoutReady=!0;return}const t={id:"root",layoutOptions:{"elk.algorithm":"layered","elk.direction":"RIGHT","elk.spacing.nodeNode":"40","elk.layered.spacing.nodeNodeBetweenLayers":"80","elk.edgeRouting":"ORTHOGONAL","elk.layered.nodePlacement.strategy":"BRANDES_KOEPF"},children:e.map(i=>({id:i.id,width:Lt,height:ke})),edges:e.filter(i=>i.preconditionStepId).map(i=>({id:`${i.preconditionStepId}->${i.id}`,sources:[i.preconditionStepId],targets:[i.id]}))};try{const a=await(await Fo()).layout(t),s={...this.positions};for(const r of a.children??[])(!this.elkPositioned.has(r.id)||!s[r.id])&&(s[r.id]={x:(r.x??0)+Qe,y:(r.y??0)+Qe},this.elkPositioned.add(r.id));this.positions=s,this.layoutReady=!0,this.layoutError=null}catch(i){this.layoutError=i?.message??"ELK layout failed",this.layoutReady=!0}}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){const i=this.wf.steps.map(r=>r.id===e?{...r,...t}:r),a=this.wf.steps.find(r=>r.id===e),s=t.preconditionStepId!==void 0&&t.preconditionStepId!==a?.preconditionStepId;this.wf={...this.wf,steps:i},s&&(this.elkPositioned.clear(),this.runElkLayout()),this.emit()}addStep(){const e=Ao(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const i=Object.values(this.positions).map(a=>a.x);this.positions={...this.positions,[e]:{x:i.length?Math.max(...i)+Lt+80:Qe,y:Qe}},this.selectedId=e,this.elkPositioned.clear(),this.runElkLayout(),this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(a=>a.id!==e).map(a=>a.preconditionStepId===e?{...a,preconditionStepId:void 0}:a)};const{[e]:t,...i}=this.positions;this.positions=i,this.elkPositioned.delete(e),this.selectedId===e&&(this.selectedId=null),this.runElkLayout(),this.emit()}onNodeMouseDown(e,t){if(this.readOnly)return;e.preventDefault(),this.draggingId=t;const i=this.positions[t]??{x:0,y:0},a=this.toSvgPoint(e);this.dragOffset={x:a.x-i.x,y:a.y-i.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}relayout(){this.elkPositioned.clear(),this.runElkLayout()}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(a=>a.x))+Lt+Qe:600,i=e.length?Math.max(...e.map(a=>a.y))+ke+Qe:400;return{w:Math.max(t,600),h:Math.max(i,400)}}render(){if(!this.layoutReady)return n`<div class="loading">Computing layout…</div>`;const{w:e,h:t}=this.canvasSize(),i=this.wf.steps??[];return n`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():""}
                ${this.layoutError?n`<div class="error">⚠ ${this.layoutError}</div>`:""}
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
        `}renderToolbar(){const e=this.wf.status??"DRAFT";return n`
            <div class="toolbar">
                <span class="wf-name">${this.wf.name}</span>
                <span class="badge badge-${e.toLowerCase()}">${e}</span>
                <div style="flex:1"></div>
                <button class="nbtn" title="Re-run ELK layout"
                        @click="${()=>this.relayout()}">
                    ${ho}
                    Re-layout
                </button>
                ${this.readOnly?d:n`
                    <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                        ${Li}
                        Settings
                    </button>
                    <button class="nbtn primary" @click="${()=>this.addStep()}">
                        ${Di}
                        Add Step
                    </button>
                `}
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Fi}
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
        `}renderArrow(e){if(!e.preconditionStepId)return Y``;const t=this.positions[e.preconditionStepId],i=this.positions[e.id];if(!t||!i)return Y``;const a=t.x+Lt,s=t.y+ke/2,r=i.x,o=i.y+ke/2,l=(a+r)/2;return Y`
            <path d="M${a},${s} C${l},${s} ${l},${o} ${r},${o}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:Qe,y:Qe},i=Oo[e.type]??"#64748b",a=Lo[e.type]??"•",s=this.selectedId===e.id,r=e.name.length>16?e.name.slice(0,15)+"…":e.name;return Y`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${o=>this.onNodeMouseDown(o,e.id)}"
               @click="${o=>{o.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${Lt}" height="${ke}" rx="8"
                      fill="white"
                      stroke="${s?i:"#e2e8f0"}"
                      stroke-width="${s?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge strip -->
                <rect x="0" y="0" width="32" height="${ke}" rx="8"
                      fill="${i}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${ke}" fill="${i}"/>
                <text x="16" y="${ke/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${a}</text>
                <!-- labels -->
                <text x="44" y="${ke/2-6}" font-size="11"
                      fill="#1e293b" font-weight="600">${r}</text>
                <text x="44" y="${ke/2+8}" font-size="9"
                      fill="#94a3b8">${e.id}</text>
                <text x="44" y="${ke/2+20}" font-size="9"
                      fill="${i}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(s=>s.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(s=>s.id!==e.id),i=this.readOnly,a=(s,r)=>n`
            <div class="field">
                <label class="field-label">${s}</label>
                ${r}
            </div>
        `;return n`
            <div class="properties">
                <div class="prop-header">
                    <span>Step Properties</span>
                    ${i?d:n`<button class="del-btn" title="Delete step"
                            @click="${()=>this.deleteStep(e.id)}">🗑</button>`}
                    <button class="close-btn"
                            @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${a("ID",n`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${a("Name",n`<input class="inp" ?readonly="${i}" .value="${e.name}"
                        @change="${i?d:s=>this.updateStep(e.id,{name:s.target.value})}"/>`)}
                    ${a("Type",n`
                        <select class="inp" ?disabled="${i}"
                                @change="${i?d:s=>this.updateStep(e.id,{type:s.target.value})}">
                            ${Do.map(s=>n`
                                <option value="${s}" ?selected="${e.type===s}">${s}</option>`)}
                        </select>`)}
                    ${a("Description",n`<textarea class="inp" rows="2" ?readonly="${i}"
                        @change="${i?d:s=>this.updateStep(e.id,{description:s.target.value})}">${e.description??""}</textarea>`)}
                    ${a("Precondition step",n`
                        <select class="inp" ?disabled="${i}"
                                @change="${i?d:s=>this.updateStep(e.id,{preconditionStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>n`
                                <option value="${s.id}" ?selected="${e.preconditionStepId===s.id}">
                                    ${s.name} (${s.id})
                                </option>`)}
                        </select>`)}
                    ${a("Precondition expression",n`
                        <input class="inp" placeholder="JEXL expression" ?readonly="${i}"
                               .value="${e.preconditionExpression??""}"
                               @change="${i?d:s=>this.updateStep(e.id,{preconditionExpression:s.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}" ?disabled="${i}"
                               @change="${i?d:s=>this.updateStep(e.id,{parallel:s.target.checked})}"/>
                    </div>
                    ${a("Timeout (ms)",n`
                        <input class="inp" type="number" min="0" ?readonly="${i}"
                               .value="${String(e.timeout??0)}"
                               @change="${i?d:s=>this.updateStep(e.id,{timeout:Number(s.target.value)})}"/>`)}
                    ${a("Retries",n`
                        <input class="inp" type="number" min="0" ?readonly="${i}"
                               .value="${String(e.retries??0)}"
                               @change="${i?d:s=>this.updateStep(e.id,{retries:Number(s.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}" ?disabled="${i}"
                               @change="${i?d:s=>this.updateStep(e.id,{rollbackable:s.target.checked})}"/>
                    </div>
                    ${e.rollbackable?a("Compensation step",n`
                        <select class="inp" ?disabled="${i}"
                                @change="${i?d:s=>this.updateStep(e.id,{compensationStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>n`
                                <option value="${s.id}" ?selected="${e.compensationStepId===s.id}">
                                    ${s.name} (${s.id})
                                </option>`)}
                        </select>`):""}
                    ${e.type==="ACTION"?a("Topic",n`
                        <input class="inp" placeholder="kafka.topic.name" ?readonly="${i}"
                               .value="${e.topic??""}"
                               @change="${i?d:s=>this.updateStep(e.id,{topic:s.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?a("Form ID",n`
                        <input class="inp" ?readonly="${i}" .value="${e.formId??""}"
                               @change="${i?d:s=>this.updateStep(e.id,{formId:s.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?a("Child workflow ID",n`
                        <input class="inp" ?readonly="${i}" .value="${e.childWorkflowDefinitionId??""}"
                               @change="${i?d:s=>this.updateStep(e.id,{childWorkflowDefinitionId:s.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),i=URL.createObjectURL(t),a=document.createElement("a");a.href=i,a.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",a.click(),URL.revokeObjectURL(i)}};_e.styles=[ci,R`
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
    `];He([v()],_e.prototype,"value",2);He([v({type:Boolean})],_e.prototype,"readOnly",2);He([$()],_e.prototype,"wf",2);He([$()],_e.prototype,"positions",2);He([$()],_e.prototype,"layoutReady",2);He([$()],_e.prototype,"selectedId",2);He([$()],_e.prototype,"showMeta",2);He([$()],_e.prototype,"layoutError",2);_e=He([_("mateu-workflow-elk")],_e);var zo=Object.defineProperty,No=Object.getOwnPropertyDescriptor,Kt=(e,t,i,a)=>{for(var s=a>1?void 0:a?No(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&zo(t,i,s),s};const qo=["string","integer","number","bool","date","time","dateTime","dateRange","money","file","array","status","component","menu","range","action","actionGroup"],Mo=["regular","radio","checkbox","textarea","toggle","combobox","select","email","password","richText","listBox","html","markdown","image","icon","link","money","grid","color","choice","popover","slider","button","stars"],Bo={string:"#3B82F6",integer:"#8B5CF6",number:"#6366F1",bool:"#10B981",date:"#F59E0B",time:"#F59E0B",dateTime:"#F59E0B",dateRange:"#F59E0B",money:"#EF4444",file:"#64748B",array:"#0EA5E9",status:"#EC4899",component:"#14B8A6",menu:"#94A3B8",range:"#A855F7",action:"#F97316",actionGroup:"#FB923C"};function ta(){return"field-"+Math.random().toString(36).slice(2,8)}let gt=class extends F{constructor(){super(...arguments),this.value='{"name":"New Form","fields":[]}',this.form={name:"New Form",fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has("value"))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){const e=this.shadowRoot?.querySelector(".field-list");!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=qa.create(e,{animation:150,handle:".drag-handle",ghostClass:"sortable-ghost",onEnd:t=>{const{oldIndex:i,newIndex:a}=t;if(i===void 0||a===void 0||i===a)return;const s=[...this.form.fields],[r]=s.splice(i,1);s.splice(a,0,r),this.form={...this.form,fields:s},this.emit()}}))}emit(){const e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(i=>i.id===e?{...i,...t}:i)},this.emit()}addField(){const e=ta(),t={id:e,label:"New Field",dataType:"string"};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){const t=this.form.fields.find(r=>r.id===e);if(!t)return;const i={...t,id:ta(),label:t.label+" (copy)"},a=this.form.fields.findIndex(r=>r.id===e),s=[...this.form.fields];s.splice(a+1,0,i),this.form={...this.form,fields:s},this.selectedId=i.id,this.emit()}render(){return n`
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
                    ${Li}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${Di}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Fi}
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
        `}renderRow(e){const t=Bo[e.dataType]??"#64748b",i=this.selectedId===e.id;return n`
            <div class="field-row ${i?"selected":""}"
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
                        @click="${a=>{a.stopPropagation(),this.duplicateField(e.id)}}">⧉</button>
                <button class="row-btn danger" title="Delete"
                        @click="${a=>{a.stopPropagation(),this.deleteField(e.id)}}">🗑</button>
            </div>
        `}renderPanel(){const e=this.form.fields.find(i=>i.id===this.selectedId);if(!e)return d;const t=(i,a)=>n`
            <div class="prop-field">
                <label class="prop-label">${i}</label>
                ${a}
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
                               @change="${i=>this.updateField(e.id,{label:i.target.value})}"/>`)}
                    ${t("Data type",n`
                        <select class="inp"
                                @change="${i=>this.updateField(e.id,{dataType:i.target.value})}">
                            ${qo.map(i=>n`
                                <option value="${i}" ?selected="${e.dataType===i}">${i}</option>`)}
                        </select>`)}
                    ${t("Stereotype",n`
                        <select class="inp"
                                @change="${i=>this.updateField(e.id,{stereotype:i.target.value||void 0})}">
                            ${Mo.map(i=>n`
                                <option value="${i}" ?selected="${(e.stereotype??"regular")===i}">${i}</option>`)}
                        </select>`)}
                    <div class="prop-field row">
                        <label class="prop-label">Required</label>
                        <input type="checkbox" ?checked="${e.required}"
                               @change="${i=>this.updateField(e.id,{required:i.target.checked})}"/>
                    </div>
                    ${t("Description / hint",n`
                        <textarea class="inp" rows="3"
                                  @change="${i=>this.updateField(e.id,{description:i.target.value||void 0})}">${e.description??""}</textarea>`)}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:"application/json"}),i=URL.createObjectURL(t),a=document.createElement("a");a.href=i,a.download=(this.form.name??"form").replace(/\s+/g,"-").toLowerCase()+".json",a.click(),URL.revokeObjectURL(i)}};gt.styles=[ci,R`
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
    `];Kt([v()],gt.prototype,"value",2);Kt([$()],gt.prototype,"form",2);Kt([$()],gt.prototype,"selectedId",2);Kt([$()],gt.prototype,"showMeta",2);gt=Kt([_("mateu-form-editor")],gt);var Uo=Object.defineProperty,jo=Object.getOwnPropertyDescriptor,Me=(e,t,i,a)=>{for(var s=a>1?void 0:a?jo(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Uo(t,i,s),s};let $e=class extends F{constructor(){super(...arguments),this.appState={},this.appData={},this.open=!1,this.activeTab="appstate",this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith("mateu-")&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset="",this._prevTarget=null,this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset=""),this._prevTarget=t,t.style.outline="2px solid #0070f3",t.style.outlineOffset="-2px",this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||"",this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener("mouseover",this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mouseover",this._onMouseover,!0),this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget=null)}_fmt(e){try{return JSON.stringify(e,null,2)??"null"}catch{return String(e)}}_renderTab(e,t){return n`
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
        `}};$e.styles=R`
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
    `;Me([v()],$e.prototype,"appState",2);Me([v()],$e.prototype,"appData",2);Me([$()],$e.prototype,"open",2);Me([$()],$e.prototype,"activeTab",2);Me([$()],$e.prototype,"hoveredTag",2);Me([$()],$e.prototype,"hoveredId",2);Me([$()],$e.prototype,"hoveredState",2);Me([$()],$e.prototype,"hoveredData",2);Me([$()],$e.prototype,"hoveredMeta",2);$e=Me([_("mateu-debug-overlay")],$e);var Ee=(e=>(e.SetAppDataValue="SetAppDataValue",e.SetAppStateValue="SetAppStateValue",e.SetDataValue="SetDataValue",e.RunAction="RunAction",e.RunJS="RunJS",e.SetAttributeValue="SetAttributeValue",e.SetStateValue="SetStateValue",e.SetCssClass="SetCssClass",e.SetStyle="SetStyle",e))(Ee||{}),Ta=(e=>(e.required="required",e.disabled="disabled",e.hidden="hidden",e.pattern="pattern",e.minValue="minValue",e.maxValue="maxValue",e.minLength="minLength",e.maxLength="maxLength",e.css="css",e.style="style",e.theme="theme",e.errorMessage="errorMessage",e.description="description",e.none="none",e))(Ta||{}),Ra=(e=>(e.Continue="Continue",e.Stop="Stop",e))(Ra||{}),Wo=Object.defineProperty,Vo=Object.getOwnPropertyDescriptor,ui=(e,t,i,a)=>{for(var s=a>1?void 0:a?Vo(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Wo(t,i,s),s};let Dt=null,Et=class extends bt{constructor(){super(...arguments),this.baseUrl="",this.route="",this.consumedRoute="",this.formerState={},this.applyRules=()=>{const e=this.component.rules;if(e&&e.length>0){const t=this.state,i=this.data,a=this.appState,s=this.appData,r=this.component,o=w=>ca(w,t,i,{appState:a,appData:s,component:r}),l=w=>da(w,t,i,a,s,{component:r}),c=["state","data","appState","appData","component"],u=[t,i,a,s,r],p={...this.state},m={...this.data};let f=!1,y=!1;for(let w=0;w<e.length;w++){const b=e[w];try{if(o(b.filter)){if(Ee.SetStateValue==b.action||Ee.SetDataValue==b.action){const C=Ee.SetStateValue==b.action?p:m,k=b.fieldName.split(",");for(let T=0;T<k.length;T++){const z=k[T];if(!C[z]||C[z]!=b.value){const B=b.expression?l(b.expression):b.value,ot=Ta.none==b.fieldAttribute?z:z+"."+b.fieldAttribute;B!=C[ot]&&(C[ot]=B,Ee.SetStateValue==b.action&&(f=!0),Ee.SetDataValue==b.action&&(y=!0))}}}if(Ee.RunAction==b.action&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:b.actionId},bubbles:!0,composed:!0})),Ee.RunJS==b.action&&new Function(...c,b.value)(...u),Ee.SetAttributeValue==b.action){const C=b.expression?o(b.expression):b.value;if(b.fieldAttribute=="disabled"){C?this.shadowRoot?.getElementById(b.fieldName)?.setAttribute(b.fieldAttribute,"disabled"):this.shadowRoot?.getElementById(b.fieldName)?.removeAttribute(b.fieldAttribute);continue}this.shadowRoot?.getElementById(b.fieldName)?.setAttribute(b.fieldAttribute,C)}if(Ee.SetCssClass==b.action&&this.shadowRoot?.getElementById(b.fieldName)?.setAttribute("class",b.value),Ee.SetStyle==b.action&&this.shadowRoot?.getElementById(b.fieldName)?.style.setProperty(b.expression,b.value),Ra.Stop==b.result)break}}catch(C){console.error("rule failed",b,C)}}f&&(this.state=p),y&&(this.data=m),f&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes("-"),this.checkValidations=e=>{const t=e?e.split(","):void 0,i=this.component.validations;let a=!0,s=!1;const r=this.data??{},o={...this.data??{},errors:{}};if(i){for(let l=0;l<i.length;l++){const c=i[l];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let p=0;p<u.length;p++){const m=u[p];o.errors[m]=[]}}for(let l=0;l<i.length;l++){const c=i[l];if(!this.skipValidation(t,c))try{const u=c.condition&&c.condition.includes("${")?this._evalTemplate(c.condition):this._evalExpr(c.condition);if(c.condition&&!u){a=!1;const m=(c.fieldId??"_component").split(",");for(let f=0;f<m.length;f++){const y=m[f];let w=o.errors[y];if(w||(o.errors[y]=[]),w=o.errors[y],!r[y]){let b=c.message;try{b=this._evalTemplate(c.message)}catch{}w.push(b)}}}}catch(u){console.error("validation failed",c,u)}}for(let l=0;l<i.length;l++){const c=i[l];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let p=0;p<u.length;p++){const m=u[p];if(r.errors?[m].join(","):o.errors==""&&[m].join(",")){s=!0;break}}}(r.errors?["_component"].join(","):o.errors==""&&["_component"].join(","))&&(s=!0)}o._valid=a,o._valid!=r._valid&&(s=!0),s&&(this.data=o)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,i={};t.fieldIds.forEach(a=>{i[a]=void 0}),i.searchText=void 0,this.state={...this.state,...i}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,i={};i[t.key]=t.value,e.type=="data-changed"&&(this.data={...this.data,...i})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail;if(e.type=="value-changed"){const i={...this.state};i[t.fieldId]=t.value,this.state=i,(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("dirty",{detail:e.detail,bubbles:!0,composed:!0}));const a=this.component;a.triggers?.filter(s=>s.type==Ze.OnValueChange).filter(s=>!s.propertyName||t.fieldId==s.propertyName).forEach(s=>{(!s.condition||this._evalExpr(s.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))}),a.triggers?.filter(s=>s.type==Ze.AutoSave).forEach(s=>{const r=s.actionId,o=this._autoSaveTimers.get(r);o!==void 0&&clearTimeout(o),this._autoSaveTimers.set(r,setTimeout(()=>{this._autoSaveTimers.delete(r),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))},s.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{const t=e.detail;if(e.type=="action-requested"){e.preventDefault(),e.stopPropagation();const i=this.component,a=i.actions?.find(s=>s.id==t.actionId||s.id.endsWith("*")&&t.actionId.startsWith(s.id.replace("*","")));if(a){if(a&&a.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify("You first need to select some rows");return}if(a&&a.validationRequired){const r=Dt??this;if(Dt=null,r.checkValidations(a.fieldsToValidate),!r.data._valid){r.notifyValidationErrors();return}}Dt=null;const s={...t,initiatorComponentId:this.id};a&&a.confirmationRequired?this.callAfterConfirmation(a,()=>this.requestActionCallToServerOrBubble(s,i,a)):this.requestActionCallToServerOrBubble(s,i,a)}else{const s={...t.parameters};s.initiatorState||(s.initiatorState=this.state),Dt||(Dt=this),this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,parameters:s},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{const e={},t=i=>{if(i)for(const a of i){const s=a.metadata;if(s?.type===h.FormField){const r=s;r.fieldId&&r.label&&(e[r.fieldId]=r.label)}t(a.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{const e=this.data?.errors??{},t=this.buildFieldLabelMap(),i=[];if(Object.entries(e).forEach(([s,r])=>{if(!Array.isArray(r))return;const o=s==="_component"?void 0:t[s]??s;r.forEach(l=>{l&&!i.some(c=>c.label===o&&c.msg===l)&&i.push({label:o,msg:l})})}),i.length===0){this.notify("There are validation errors");return}const a=document.createElement("vaadin-notification");a.position="bottom-end",a.setAttribute("theme","error"),a.duration=Math.max(3e3,1500+i.length*1e3),a.renderer=s=>{sa(n`
                <vaadin-vertical-layout style="gap: var(--lumo-space-xs);">
                    <strong>There are validation errors</strong>
                    ${i.map(({label:r,msg:o})=>r?n`<span>• <b>${r}:</b> ${o}</span>`:n`<span>• ${o}</span>`)}
                </vaadin-vertical-layout>
            `,s)},document.body.appendChild(a),a.opened=!0,a.addEventListener("opened-changed",s=>{s.detail.value||document.body.removeChild(a)})},this.notify=e=>{Ut.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.callAfterConfirmation=(e,t)=>{let i="One moment, please",a="Are you sure?",s="Yes",r="No";e.confirmationTexts&&(i=e.confirmationTexts.title,a=e.confirmationTexts.message,s=e.confirmationTexts.confirmationText,r=e.confirmationTexts.denialText);const o=document.createElement("vaadin-confirm-dialog");o.setAttribute("header",i),o.setAttribute("cancel-button-visible","cancel-button-visible"),o.setAttribute("confirm-text",s),o.setAttribute("cancel-text",r),o.append(a),o.opened=!0,o.addEventListener("confirm",()=>t()),o.addEventListener("close",()=>document.body.removeChild(o)),o.addEventListener("confirm",()=>document.body.removeChild(o)),o.addEventListener("cancel",()=>document.body.removeChild(o)),o.addEventListener("reject",()=>document.body.removeChild(o)),document.body.append(o)},this.requestActionCallToServerOrBubble=(e,t,i)=>{if(i&&i.bubble){const a={...e.parameters};a.initiatorState||(a.initiatorState=this.state),this.dispatchEvent(new CustomEvent("action-requested",{detail:{...e,parameters:a},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,i)},this.requestActionCallToServer=(e,t,i)=>{if(i&&i.href){window.location.href=i.href;return}if(i&&i.js)try{new Function("state","data","appState","appData","component",i.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(a){console.error("when evaluating "+i.js,a,this.component,this.state,this.data)}if(i&&i.customEvent&&this.dispatchEvent(new CustomEvent(i.customEvent.name,{detail:i.customEvent.detail,bubbles:!0,composed:!0})),!(i&&(i.js||i.customEvent))){if(e.actionId=="search"){const a=e.parameters?._searchState;a?this.state={...this.state,...a}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}this.dispatchEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:{...this.state},parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:i?.background,sse:i?.sse,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))}},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(a=>a.type==Ze.OnSuccess).filter(a=>e.detail.actionId==a.calledActionId).forEach(a=>{if(!a.condition||this._evalExpr(a.condition))if(e.preventDefault(),e.stopPropagation(),a.timeoutMillis>0){const s=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId,callbackToken:s},bubbles:!0,composed:!0}))},a.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(a=>a.type==Ze.OnError).filter(a=>e.detail.actionId==a.calledActionId).forEach(a=>{(!a.condition||this._evalExpr(a.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId},bubbles:!0,composed:!0})))})},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;const t=this.component;if(t)for(const i of t.actions??[]){const a=i.shortcut||(i.runOnEnter?"enter":null);if(a&&this._shortcutMatchesEvent(a,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return V.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has("state")&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has("component")&&(this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}_shortcutMatchesEvent(e,t){return Vs(e,t)}_handleTabShortcut(e){const t=this.renderRoot?.querySelectorAll("vaadin-tab[data-shortcut]");if(!t||t.length===0)return!1;for(const i of Array.from(t)){const a=i.dataset.shortcut;if(!a||!this._shortcutMatchesEvent(a,e))continue;const s=i.closest("vaadin-tabs");if(!s)continue;const r=Array.from(s.querySelectorAll("vaadin-tab")).indexOf(i);if(!(r<0))return e.preventDefault(),s.selected=r,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.addEventListener("backend-call-failed",this.handleBackendFailed),document.addEventListener("keydown",this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.removeEventListener("backend-call-failed",this.handleBackendFailed),document.removeEventListener("keydown",this._keydownListener)}render(){return n`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?n`
                <div><ul>${this.data.errors._component.map(e=>n`<li>${e}</li>`)}</ul></div>
            `:d}</div>`}_render(){if(this.component?.type==M.ClientSide){const e=this.component;return e.metadata?.type==h.Page?wi(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==h.Crud?xi(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):V.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return n`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==M.ClientSide){const t=e;if(t.metadata?.type==h.Page)return wi(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==h.Crud)return xi(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return g(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}};Et.styles=R`
        :host {
        }

        ${La(st.cssText)}
        
        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }
        
  `;ui([v()],Et.prototype,"baseUrl",2);ui([v()],Et.prototype,"route",2);ui([v()],Et.prototype,"consumedRoute",2);Et=ui([_("mateu-component")],Et);const ia=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}};class Ho{async handle(t,i){return await t.runAction(i.baseUrl,i.route,i.consumedRoute,i.actionId,i.initiatorComponentId,i.appState,i.serverSideType,i.componentState,i.parameters,i.initiator,i.background)}}const Go=new Ho;class Ko{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,i,a)=>{if(t?.fragments?.forEach(s=>{tt.next({command:void 0,fragment:s,ui:void 0,error:void 0,callbackToken:a})}),t?.appState&&(K.value={...t.appState},i.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const s=t?.appData;zt.value={...t.appData,...s},i.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}t?.messages?.forEach(s=>{Ut.show(s.text,{position:s.position?this.mapPosition(s.position):void 0,theme:s.variant,duration:s.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(s=>{tt.next({command:s,fragment:void 0,ui:void 0,error:void 0,callbackToken:a})})}}async runAction(t,i,a,s,r,o,l,c,u,p,m,f,y,w,b){try{const C=await Go.handle(t,{baseUrl:i,route:a,consumedRoute:s,actionId:r,appState:K.value,initiatorComponentId:o,componentState:u,parameters:p,serverSideType:c,initiator:m,background:f});y&&y(C),w||this.handleUIIncrement(C,m,b),C.messages&&C.messages.length==1&&C.messages[0].variant=="error"&&m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0})),m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r,evevntId:Q()},bubbles:!0,composed:!0}))}catch(C){console.warn("Action request failed",C),m.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(C)}})),m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}}serialize(t){return t?.message?t:JSON.stringify(t)}}const Jo=new Ko,Yo=Jo;class Xo{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,i,a)=>{if(t?.messages?.forEach(s=>{Ut.show(s.text,{position:s.position?this.mapPosition(s.position):"bottom-end",theme:s.variant,duration:s.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(s=>{tt.next({command:s,fragment:void 0,ui:void 0,error:void 0,callbackToken:a})}),t?.fragments?.forEach(s=>{tt.next({command:void 0,fragment:s,ui:void 0,error:void 0,callbackToken:a})}),t?.appState&&(K.value={...t.appState},i.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const s=t?.appData;zt.value={...t.appData,...s},i.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}}}async runAction(t,i,a,s,r,o,l,c,u,p,m,f,y,w,b){if(a){a=a||"_no_route",a&&a.startsWith("/")&&(a=a.substring(1));const C={serverSideType:c,appState:K.value,componentState:u,parameters:p,initiatorComponentId:o,consumedRoute:s,route:"/"+a,actionId:r};f||m.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),fetch(i+"/mateu/v3/sse/"+a,{method:"POST",headers:{Accept:"text/event-stream","Content-Type":"application/json"},body:JSON.stringify(C)}).then(async k=>{const T=k.body?.pipeThrough(new TextDecoderStream).getReader();if(T){let z="";for(;;){const{value:B,done:ot}=await T.read();if(ot)break;z+=B;const Pt=z.split(`

`);z=Pt.pop()??"";for(const Jt of Pt){const x=Jt.trim();if(x)if(x.startsWith("data:")){const D=JSON.parse(x.substring(5).trim());y&&y(D),w||this.handleUIIncrement(D,m,b),D.messages&&D.messages.length==1&&D.messages[0].variant=="error"&&m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}else{let D=x;try{const S=JSON.parse(x);D=S.message,S._embedded?.errors?.length>0&&S._embedded.errors[0].message&&(D=S._embedded.errors[0].message)}catch{}throw new Error(D)}}}}f||m.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:r}})),m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r},bubbles:!0,composed:!0}))}).catch(k=>{m.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(k)}})),m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))})}}serialize(t){return t?.message?t:JSON.stringify(t)}}const Qo=new Xo;var Zo=Object.defineProperty,el=Object.getOwnPropertyDescriptor,Ce=(e,t,i,a)=>{for(var s=a>1?void 0:a?el(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&Zo(t,i,s),s};let ae=class extends ni{constructor(){super(...arguments),this.consumedRoute="",this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t=="string"&&(t===""||t.startsWith("/"))&&this.consumedRoute&&this.consumedRoute!=="_empty"&&this.consumedRoute.startsWith("/")&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t.startsWith("/")&&this.uriPrefix.endsWith("/")?t=this.uriPrefix+t.substring(1):!t.startsWith("/")&&!this.uriPrefix.endsWith("/")?t=this.uriPrefix+"/"+t:t=this.uriPrefix+t),this.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==""&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:M.ClientSide,metadata:{type:h.Element,name:"div",content:"Not found"},id:"fieldId"},action:qt.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;const t=this.detail1;if(e.type=="server-side-action-requested"){let i=Yo;t.sse&&(i=Qo),i.runAction(Ca,this.baseUrl,t.route??"",t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken)}},this.getCustomisedAppState=()=>{let e={...K.value};if(this.overrides){const t=ia(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw new Error("Method not implemented.")}createRenderRoot(){return V.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.overridesParsed=ia(this.overrides),this.addEventListener("server-side-action-requested",this.actionRequestedListener),this.addEventListener("backend-call-failed",this.backendFailedListener),this.addEventListener("history-pushed",this.historyPushed),this.addEventListener("route-changed",this.routeChangedListener),window.Vaadin.featureFlags.masterDetailLayoutComponent=!0}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.actionRequestedListener),this.removeEventListener("backend-call-failed",this.backendFailedListener),this.removeEventListener("history-pushed",this.historyPushed),this.removeEventListener("route-changed",this.routeChangedListener)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(i=>i==="appState"||i==="appData")){const i=this.renderRoot.querySelector("mateu-component");if(i)return e.has("appState")&&(i.appState=this.appState),e.has("appData")&&(i.appData=this.appData),!1}return!0}updated(e){(e.has("id")||e.has("baseurl")||e.has("route")||e.has("consumedRoute")||e.has("instant"))&&(this.preventNavigation||(this.callbackToken=this.instant||Q(),this.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:"",serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,callbackToken:this.callbackToken},bubbles:!0,composed:!0})))),e.has("route")&&this.top&&(this.preventNavigation||this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&(this.preventNavigation=!1)}applyFragment(e){if(!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}};return}this.fragment=e}render(){return n`
           ${this.fragment?.component?g(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):d}
       `}};ae.styles=R`
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
  `;Ce([v()],ae.prototype,"consumedRoute",2);Ce([v()],ae.prototype,"serverSideType",2);Ce([v()],ae.prototype,"uriPrefix",2);Ce([v()],ae.prototype,"overrides",2);Ce([v()],ae.prototype,"homeRoute",2);Ce([v()],ae.prototype,"route",2);Ce([v()],ae.prototype,"top",2);Ce([v()],ae.prototype,"instant",2);Ce([v()],ae.prototype,"appState",2);Ce([v()],ae.prototype,"appData",2);Ce([$()],ae.prototype,"fragment",2);ae=Ce([_("mateu-ux")],ae);class tl{constructor(){this._dirty=!1,this._installed=!1,this.message="You have unsaved changes. Are you sure you want to leave this page?",this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=t=>{this._dirty&&(t.preventDefault(),t.returnValue="")}}install(){this._installed||(this._installed=!0,document.addEventListener("dirty",this._onDirty),document.addEventListener("clean",this._onClean),window.addEventListener("beforeunload",this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;const t=window.confirm(this.message);return t&&(this._dirty=!1),t}}const Ft=new tl;var il=Object.defineProperty,al=Object.getOwnPropertyDescriptor,U=(e,t,i,a)=>{for(var s=a>1?void 0:a?al(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&il(t,i,s),s};let N=class extends bt{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0,this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this.isDark=document.documentElement.getAttribute("theme")==="dark",this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;const e=this.isDark?"dark":"light";document.documentElement.setAttribute("theme",e),localStorage.setItem("mateu-theme",e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?"detail":"detail-hidden")},this.runAction=e=>{const i=this.renderRoot.querySelector?.("mateu-component");i&&i.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){const i=e[t];if(i.selected)return i;const a=this.getSelectedOption(i.submenus);if(a)return a}return null},this.itemSelected=e=>{const t=e.detail.value;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.itemSelectedTiles=e=>{const t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))},this.mapItemsForTiles=e=>e.map(t=>({text:t.label,consumedRoute:t.consumedRoute,route:t.route,baseUrl:t.baseUrl,serverSideType:t.serverSideType,uriPrefix:t.uriPrefix,actionId:t.actionId,selected:t.selected,_menuOption:t})),this.flattenMenuForPalette=(e,t)=>{const i=[];for(const a of e)if(!a.separator)if(a.submenus&&a.submenus.length>0){const s=t?`${t} › ${a.label}`:a.label;i.push(...this.flattenMenuForPalette(a.submenus,s))}else i.push({label:a.label,breadcrumb:t,consumedRoute:a.consumedRoute,route:a.route,actionId:a.actionId,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix});return i},this.handleCommandPaletteKeydown=(e,t)=>{if(e.key==="ArrowDown")e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,Math.min(t.length,10)-1);else if(e.key==="ArrowUp")e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key==="Enter"){const i=t[this.commandPaletteSelectedIndex];i&&(this.selectRoute(i.consumedRoute,i.route,i.actionId,i.baseUrl,i.serverSideType,i.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery="")}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return d;const e=this.component?.metadata;if(!e?.menu)return d;const t=this.flattenMenuForPalette(e.menu,""),i=this.commandPaletteQuery.toLowerCase(),a=i?t.filter(s=>s.label.toLowerCase().includes(i)||s.breadcrumb.toLowerCase().includes(i)):t;return n`
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
                        ${a.slice(0,10).map((s,r)=>n`
                            <div class="cmd-result ${r===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                @click=${()=>{this.selectRoute(s.consumedRoute,s.route,s.actionId,s.baseUrl,s.serverSideType,s.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}
                                @mouseenter=${()=>{this.commandPaletteSelectedIndex=r}}
                            >
                                <span class="cmd-result-label">${s.label}</span>
                                ${s.breadcrumb?n`<span class="cmd-result-breadcrumb">${s.breadcrumb}</span>`:d}
                            </div>
                        `)}
                        ${a.length===0?n`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>`:d}
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
        `,this.goHome=()=>{const e=this.component.metadata;this.selectRoute(e.route,"_page","",void 0,void 0,void 0)},this.selectRoute=(e,t,i,a,s,r)=>{Ft.confirmLeave()&&this._selectRoute(e,t,i,a,s,r)},this._selectRoute=(e,t,i,a,s,r)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=a,this.selectedRoute=t,this.selectedServerSideType=s,this.selectedUriPrefix=r,this.instant=Q(),this.state&&this.state._route!=null&&(this.state._route=void 0);let o=this.baseUrl??"";o.indexOf("://")<0&&(o.startsWith("/")||(o="/"+o),o=window.location.origin+o),o.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let l=new URL(o+t);if(e&&l.pathname.startsWith(e)){const c=l.pathname.substring(e.length);l=new URL(l.origin+(c||"/"))}if((window.location.pathname||l.pathname)&&window.location.pathname!=l.pathname){let c=l.pathname;l.search&&(c+=l.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let u=c;this.selectedUriPrefix&&(u.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+u.substring(1):!u.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+"/"+u:u=this.selectedUriPrefix+u),u=="/_page"&&(u=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:u},bubbles:!0,composed:!0}))}}},this.mapItems=(e,t)=>e.map(i=>{if(i.submenus&&i.submenus.length>0){let a=this.mapItems(i.submenus,t);return t&&i.label.toLowerCase().includes(t)&&(a=this.mapItems(i.submenus,"")),a&&a.length>0?{consumedRoute:i.consumedRoute,text:i.label,route:i.route,baseUrl:i.baseUrl,serverSideType:i.serverSideType,uriPrefix:i.uriPrefix,actionId:i.actionId,selected:t||i.selected,children:a}:void 0}if(i.separator)return t?void 0:{component:"hr"};if(!t||i.label.toLowerCase().includes(t))return{consumedRoute:i.consumedRoute,text:i.label,route:i.route,baseUrl:i.baseUrl,serverSideType:i.serverSideType,uriPrefix:i.uriPrefix,actionId:i.actionId,selected:t||i.selected}}).filter(i=>i!=null),this.getSelectedIndex=e=>{if(e){const t=this.getSelectedOption(e);if(t)return e.indexOf(t)}return NaN},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?n`
                <vaadin-details summary="${e.label}" theme="reverse">
                    <vaadin-vertical-layout>
                        ${e.submenus.map(t=>n`${this.renderOptionOnLeftMenu(t)}`)}
                    </vaadin-vertical-layout>
                </vaadin-details>
`:n`<vaadin-button theme="tertiary" 
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)}"
        >${e.label}</vaadin-button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){const t=this.shadowRoot?.querySelector("mateu-ux");t&&t.setAttribute("instant",Q())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?n`
            ${e.map(i=>{const a=i;return n`

                        ${a.component=="hr"?n`<hr slot="children"/>`:n`
                                <vaadin-side-nav-item
                                .path="${a.route&&!a.children?a.route:void 0}"
                                .pathAliases="${[this.baseUrl+(a.route?a.route:"")]}"
                                slot="${t}"
                                ?expanded="${a.selected}"
                                >
                                    ${a.icon?n`
                                        <vaadin-icon icon="vaadin:dashboard" slot="prefix"></vaadin-icon>
                                    `:d}
                                    ${a.text}
                                    ${this.renderSideNav(a.children,"children")}
                                </vaadin-side-nav-item>
                        `}

                            `})}`:d,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}createRenderRoot(){return V.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute("theme")==="dark",this._commandPaletteHandler=e=>{(e.metaKey||e.ctrlKey)&&e.key==="k"&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0),e.key==="Escape"&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery="")},document.addEventListener("keydown",this._commandPaletteHandler),Ft.install(),this.addEventListener("compact-changed",this._compactHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener("keydown",this._commandPaletteHandler),this.removeEventListener("compact-changed",this._compactHandler)}updated(e){if(super.updated(e),this.component){const i=this.component.metadata;if(i){const a=i;if(a.favicon){let s=document.querySelector("link[rel~='icon']");s||(s=document.createElement("link"),s.rel="icon",document.head.appendChild(s)),s.href=a.favicon}e.has("component")&&(this.selectedRoute=a.homeRoute,this.selectedConsumedRoute=a.homeConsumedRoute,this.selectedServerSideType=a.homeServerSideType,this.selectedBaseUrl=a.homeBaseUrl,this.selectedUriPrefix=a.homeUriPrefix)}}e.has("commandPaletteOpen")&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(".cmd-input")?.focus()},0)}render(){return V.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}};N.styles=R`

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

  `;U([$()],N.prototype,"filter",2);U([$()],N.prototype,"instant",2);U([$()],N.prototype,"selectedConsumedRoute",2);U([$()],N.prototype,"selectedRoute",2);U([$()],N.prototype,"selectedUriPrefix",2);U([$()],N.prototype,"selectedBaseUrl",2);U([$()],N.prototype,"selectedServerSideType",2);U([$()],N.prototype,"selectedParams",2);U([$()],N.prototype,"tilesMenuOption",2);U([$()],N.prototype,"railOpenOption",2);U([$()],N.prototype,"commandPaletteOpen",2);U([$()],N.prototype,"commandPaletteQuery",2);U([$()],N.prototype,"commandPaletteSelectedIndex",2);U([$()],N.prototype,"pageCompact",2);U([Ae("mateu-chat")],N.prototype,"chat",2);U([$()],N.prototype,"isDark",2);U([$()],N.prototype,"chatOpen",2);U([Ae("vaadin-app-layout")],N.prototype,"vaadinAppLayout",2);N=U([_("mateu-app")],N);var sl=Object.defineProperty,rl=Object.getOwnPropertyDescriptor,Ge=(e,t,i,a)=>{for(var s=a>1?void 0:a?rl(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&sl(t,i,s),s};let Te=class extends N{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.lastActionServerSideType=void 0,this.lastActionInitiatorComponentId=void 0,this.captureActionSST=e=>{const t=e.detail;t?.serverSideType&&(this.lastActionServerSideType=t.serverSideType,this.lastActionInitiatorComponentId=t.initiatorComponentId)},this.handleUnhandledAction=e=>{const t=e.detail;e.preventDefault(),e.stopPropagation();const i=this.shadowRoot?.querySelector("#ux_"+this.id);!i||typeof i.manageActionEvent!="function"||(this.lastActionServerSideType=this.selectedServerSideType,this.lastActionInitiatorComponentId=i.id,i.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:i.route??this.selectedRoute??"",consumedRoute:i.consumedRoute??this.selectedConsumedRoute??"",componentState:t.parameters?.initiatorState??{},parameters:t.parameters,actionId:t.actionId,serverSideType:this.selectedServerSideType??"",initiatorComponentId:i.id,initiator:i}})))},this.selectRoute=(e,t,i,a,s,r)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=a,this.selectedRoute=t,this.selectedServerSideType=s,this.selectedUriPrefix=r,this.instant=Q();let o=this.baseUrl??"";o.indexOf("://")<0&&(o.startsWith("/")||(o="/"+o),o=window.location.origin+o),o.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let l=new URL(o+t);if(e&&(t??"").startsWith(e)&&(l=new URL(o+t?.substring(e.length))),(window.location.pathname||l.pathname)&&window.location.pathname!=l.pathname){let c=l.pathname;l.search&&(c+=l.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let u=c;this.selectedUriPrefix&&(u.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+u.substring(1):!u.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+"/"+u:u=this.selectedUriPrefix+u),u=="_page"&&(u=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:u},bubbles:!0,composed:!0}))}}},this.updateRoute=e=>{e.preventDefault(),e.stopPropagation(),console.log("update route",e,this);var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.tabSelected=(e,t,i,a)=>{const s=e.detail.tab.dataset.route,r=a.menu.find(o=>o.route===s||o.path===s);r&&this.selectRoute(r.consumedRoute,r.route,r.actionId,r.baseUrl,r.serverSideType,r.uriPrefix)},this.mode=Yt.Auto,this.toggle=e=>{this.mode=this.mode==Yt.Expanded?Yt.Collapsed:Yt.Expanded,e.requestUpdate()},this.findMenuOption=(e,t)=>{for(const i of e){if(i.route===t||i.path===t||i.consumedRoute===t)return i;if(i.submenus?.length){const a=this.findMenuOption(i.submenus,t);if(a)return a}}},this.selected=(e,t,i,a)=>{const s=e.detail.item.dataset.route,r=this.findMenuOption(a.menu,s);r&&this.selectRoute(r.consumedRoute,r.route,r.actionId,r.baseUrl,r.serverSideType,r.uriPrefix)},this.renderSubmenu=e=>n`
                    ${e.submenus&&e.submenus.length>0?n`
                        <ui5-side-navigation-item text="${e.label}" ?unselectable="${e.submenus&&e.submenus.length>0}"
                                                  data-path="${e.path}"
                                                  data-route="${e.route}"
                                                  data-consumed-route="${e.consumedRoute}"
                                                  data-action-id="${e.actionId}"
                                                  data-server-side-type="${e.serverSideType}"
                                                  data-uri-prefix="${e.uriPrefix}"
                                                  data-base-url="${e.baseUrl}"
                        >
                            ${e.submenus.filter(t=>!t.separator).map(t=>n`
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
                    `:n`

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
                `,this.renderMenu=e=>n`
                    ${e.submenus&&e.submenus.length>0?n`
                        <ui5-side-navigation-group text="${e.label}">
                            ${e.submenus.filter(t=>!t.separator).map(t=>this.renderSubmenu(t))}
                        </ui5-side-navigation-group>

                    `:n`

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
                `}connectedCallback(){super.connectedCallback(),this.addEventListener("server-side-action-requested",this.captureActionSST,!0),this.addEventListener("action-requested",this.handleUnhandledAction),this.innerFragmentSubscription=tt.subscribe(e=>{if(e.fragment){const t=e.fragment;if(this.lastActionInitiatorComponentId&&t.targetComponentId===this.lastActionInitiatorComponentId&&t.state?._route!==void 0){const i=t.state._route;if(i!==""&&!i.startsWith("/")){this.lastActionInitiatorComponentId=void 0,this.lastActionServerSideType=void 0;return}const a=t.state._componentRoute||"";a&&(this.selectedConsumedRoute=a);const s=this.component?.metadata,r=a||j(this,s)||"";a||(this.selectedConsumedRoute=r||this.selectedConsumedRoute);const o=r+i;this.lastActionInitiatorComponentId=void 0,o!==this.selectedRoute&&(this.selectedRoute=o,this.lastActionServerSideType&&(this.selectedServerSideType=this.lastActionServerSideType),this.instant=Q()),this.lastActionServerSideType=void 0}}})}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.captureActionSST,!0),this.removeEventListener("action-requested",this.handleUnhandledAction),this.innerFragmentSubscription?.unsubscribe()}render(){const e=this.component?.metadata;return e.variant==ve.MEDIATOR?n`
                        <mateu-api-caller>
                            <mateu-ux
                                    route="${fe(this.state,this,e)}"
                                    id="ux_${this.id}"
                                    baseUrl="${re(this,e)}"
                                    consumedRoute="${j(this,e)}"
                                    serverSideType="${ne(this,e)}"
                                    uriPrefix="${oe(this,e)}"
                                    style="width: 100%;"
                                    .appState="${this.appState}"
                                    .appData="${this.appData}"
                                    instant="${this.instant}"
                                    @navigation-requested="${this.updateRoute}"
                            ></mateu-ux>
                        </mateu-api-caller>
`:ve.TABS==e.variant?n`

                <ui5-tabcontainer
                        @tab-select="${t=>this.tabSelected(t,this,this.baseUrl??"",e)}"
                >
                    ${e.menu.map(t=>n`
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

                            ${this.selectedRoute==t.path||this.selectedRoute==this.selectedConsumedRoute&&t.path==e.homeRoute?n`
                                <div class="content" style="flex-grow: 1; width: 100%; height: 100%;">
                                    <mateu-api-caller style="width: 100%;">
                                        <mateu-ux
                                                route="${fe(this.state,this,e)}"
                                                id="ux_${this.id}"
                                                baseUrl="${re(this,e)}"
                                                consumedRoute="${j(this,e)}"
                                                serverSideType="${ne(this,e)}"
                                                uriPrefix="${oe(this,e)}"
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

            `:ve.MENU_ON_LEFT==e.variant?n`
        <div style="display: flex; width: 100%; height: 100%;">
            <ui5-side-navigation id="snx"
                                 @selection-change="${t=>this.selected(t,this,this.baseUrl??"",e)}"
                                 style="flex-grow: 0;">
                <!-- Items -->
                ${e.menu.map(t=>n`
                    ${t.submenus?n`

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
                            ${t.submenus.map(i=>n`
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

                    `:n`

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
                            route="${fe(this.state,this,e)}"
                            id="ux_${this.id}"
                            baseUrl="${re(this,e)}"
                            consumedRoute="${j(this,e)}"
                            serverSideType="${ne(this,e)}"
                            uriPrefix="${oe(this,e)}"
                            style="width: 100%;"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                            instant="${this.instant}"
                            @navigation-requested="${this.updateRoute}"
                    ></mateu-ux>
                </mateu-api-caller>
            </div>

        </div>
        `:n`
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
                            route="${fe(this.state,this,e)}"
                            id="ux_${this.id}"
                            baseUrl="${re(this,e)}"
                            consumedRoute="${j(this,e)}"
                            serverSideType="${ne(this,e)}"
                            uriPrefix="${oe(this,e)}"
                            style="width: 100%;"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                            instant="${this.instant}"
                            @navigation-requested="${this.updateRoute}"
                    ></mateu-ux>
                </mateu-api-caller>
            </div>
        </ui5-navigation-layout>`}};Te.styles=R`
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
  `;Ge([$()],Te.prototype,"filter",2);Ge([$()],Te.prototype,"instant",2);Ge([$()],Te.prototype,"selectedConsumedRoute",2);Ge([$()],Te.prototype,"selectedRoute",2);Ge([$()],Te.prototype,"selectedUriPrefix",2);Ge([$()],Te.prototype,"selectedBaseUrl",2);Ge([$()],Te.prototype,"selectedServerSideType",2);Ge([$()],Te.prototype,"selectedParams",2);Te=Ge([_("mateu-sapui5-app")],Te);const nl=(e,t,i,a,s)=>{const r=t.metadata;return n`
        <mateu-sapui5-app
                id="${e.id}_app"
                route="${r.homeRoute}"
                consumedRoute="${r.route}"
                baseUrl="${i}"
                .component="${t}"
                style="width: 100%;"
        ></mateu-sapui5-app>
    `},ol=(e,t,i,a,s,r,o)=>{const l=t.metadata;return n`
        
        <mateu-sapui5-form 
            baseUrl="${i}"
                .component="${t}"
                .values="${a}"
                .state="${a}"
                .data="${s}"
            .appState="${r}"
            .appData="${o}"
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??d}"
                >
                    ${t.children?.map(c=>g(e,c,i,a,s,r,o))}
            
                            ${l?.toolbar?.map(c=>n`
                   ${g(e,{metadata:c,type:M.ClientSide,slot:"toolbar"},i,a,s,r,o)}
                `)}
            
            
                ${l?.buttons?.map(c=>n`
                   ${g(e,{metadata:c,type:M.ClientSide,slot:"buttons"},i,a,s,r,o)}

                `)}

                </mateu-sapui5-form>
        
    
    `},ll=(e,t,i,a,s,r,o)=>{const l=t.metadata;return n`
        <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">

            ${l?.title&&!l.noHeader?n`
                <ui5-title>${l.title}</ui5-title>
                ${l?.subtitle?n`<p style="color: var(--sapContent_LabelColor); margin: 0;">${l.subtitle}</p>`:d}
            `:d}

            ${l?.toolbar?.length>0?n`
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${l.toolbar.map(c=>g(e,{metadata:c,type:M.ClientSide},i,a,s,r,o))}
                </div>
            `:d}

            ${t.children?.map(c=>g(e,c,i,a,s,r,o))}

            ${l?.buttons?.length>0?n`
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--sapGroup_ContentBorderColor);">
                    ${l.buttons.map(c=>g(e,{metadata:c,type:M.ClientSide},i,a,s,r,o))}
                </div>
            `:d}
        </div>`},hi=(e,t)=>e?e.includes("${")&&t._evalTemplate?t._evalTemplate(e):e:"",dl=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=hi(l.title,e);return n`
        <ui5-panel header-text="${c||d}" fixed
                   style="margin-bottom: 1rem; ${t.style??""}"
                   class="${t.cssClasses??d}"
                   slot="${t.slot??d}">
            <div style="display:flex; flex-direction:column; gap:.5rem; padding:.25rem 0;">
                ${t.children?.map(u=>g(e,u,i,a,s,r,o))}
            </div>
        </ui5-panel>`},cl=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=hi(l.title,e);return n`
        <div style="margin: .5rem 0; ${t.style??""}" class="${t.cssClasses??d}" slot="${t.slot??d}">
            ${c?n`<ui5-title level="H5" style="margin-bottom:.25rem;">${c}</ui5-title>`:d}
            <div style="display:flex; flex-direction:column; gap:.5rem;">
                ${t.children?.map(u=>g(e,u,i,a,s,r,o))}
            </div>
        </div>`},ul=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=m=>m?g(e,m,i,a,s,r,o):d,u=typeof l.title=="string"?l.title:"",p=l.title&&typeof l.title=="object";return n`
        <ui5-card style="${t.style??""}" class="${t.cssClasses??d}" slot="${t.slot??d}">
            ${u||l.subtitle?n`
                <ui5-card-header slot="header"
                                 title-text="${u||d}"
                                 subtitle-text="${(typeof l.subtitle=="string"?l.subtitle:"")||d}">
                </ui5-card-header>`:d}
            <div style="padding: 1rem;">
                ${p?c(l.title):d}
                ${c(l.content)}
                ${t.children?.map(m=>g(e,m,i,a,s,r,o))}
                ${c(l.footer)}
            </div>
        </ui5-card>`},hl=e=>{const t=e.metadata;return n`<ui5-link href="${t.url??"#"}" slot="${e.slot??d}">${t.text??t.url??""}</ui5-link>`},$i=(e,t)=>{t&&e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:{}},bubbles:!0,composed:!0}))},pl=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=hi(l.headerTitle,e),u=p=>p?g(e,p,i,a,s,r,o):d;return n`
        <ui5-dialog open header-text="${c||d}">
            ${u(l.content)}
            ${t.children?.map(p=>g(e,p,i,a,s,r,o))}
            ${l.footer?n`<div slot="footer" style="display:flex; gap:.5rem; padding:.5rem; justify-content:flex-end;">${u(l.footer)}</div>`:d}
        </ui5-dialog>`},ml=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=hi(l.header,e),u=l.content?g(e,l.content,i,a,s,r,o):d;return n`
        <ui5-dialog open header-text="${c||d}">
            ${u}
            <div slot="footer" style="display:flex; gap:.5rem; padding:.5rem; justify-content:flex-end;">
                ${l.canCancel?n`<ui5-button @click="${p=>$i(p.target,l.cancelActionId)}">${l.cancelText??"Cancel"}</ui5-button>`:d}
                ${l.canReject?n`<ui5-button @click="${p=>$i(p.target,l.rejectActionId)}">${l.rejectText??"No"}</ui5-button>`:d}
                <ui5-button design="Emphasized" @click="${p=>$i(p.target,l.confirmActionId)}">${l.confirmText??"OK"}</ui5-button>
            </div>
        </ui5-dialog>`},vl=e=>{const t=e.metadata,i=t.abbreviation||(t.name?t.name.split(/\s+/).map(a=>a[0]).slice(0,2).join(""):"");return n`
        <ui5-avatar slot="${e.slot??d}"
                    initials="${i||d}"
                    accessible-name="${t.name??d}">
            ${t.image?n`<img src="${t.image}" />`:d}
        </ui5-avatar>`},fl=e=>{const i=e.metadata.avatars??[];return n`
        <ui5-avatar-group type="Group" slot="${e.slot??d}">
            ${i.map(a=>{const s=a.abbreviation||(a.name?a.name.split(/\s+/).map(r=>r[0]).slice(0,2).join(""):"");return n`<ui5-avatar initials="${s||d}" accessible-name="${a.name??d}">
                    ${a.image?n`<img src="${a.image}" />`:d}
                </ui5-avatar>`})}
        </ui5-avatar-group>`},gl=(e,t,i,a,s,r,o)=>{const l=t.metadata;return n`
        <span title="${l.text??""}" slot="${t.slot??d}">
            ${l.wrapped?g(e,l.wrapped,i,a,s,r,o):d}
        </span>`},bl=(e,t,i,a,s,r,o)=>{const l=t.metadata;return n`
        <ui5-carousel
                ?cyclic="${l.auto??!1}"
                arrows-placement="${l.alt?"Navigation":d}"
                style="${t.style??""}"
                class="${t.cssClasses??d}"
                slot="${t.slot??d}">
            ${t.children?.map(c=>g(e,c,i,a,s,r,o))}
        </ui5-carousel>`},$l=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=`pop-opener-${t.id}`,u=p=>{const f=p.target.getRootNode().querySelector(`#pop-${t.id}`);f&&(f.opener=c,f.open=!0)};return n`
        <span slot="${t.slot??d}">
            <span id="${c}" @click="${u}" style="cursor:pointer;">
                ${l.wrapped?g(e,l.wrapped,i,a,s,r,o):d}
            </span>
            <ui5-popover id="pop-${t.id}">
                <div style="padding:.5rem;">
                    ${l.content?g(e,l.content,i,a,s,r,o):d}
                </div>
            </ui5-popover>
        </span>`},yl=(e,t)=>{const a=t.metadata.options??[],s=o=>{o&&e.dispatchEvent(new CustomEvent("update-route",{detail:{route:o},bubbles:!0,composed:!0}))},r=o=>{if(o.submenus&&o.submenus.length>0){const l=`menu-${t.id}-${o.label}`,c=u=>{const m=u.target.getRootNode().querySelector(`#${CSS.escape(l)}`);m&&(m.opener=u.target,m.open=!0)};return n`
                <ui5-button design="Transparent" icon="${o.icon||d}" @click="${c}">${o.label}</ui5-button>
                <ui5-menu id="${l}">
                    ${o.submenus.map(u=>n`
                        <ui5-menu-item text="${u.label}" icon="${u.icon||d}"
                                       @click="${()=>s(u.path)}"></ui5-menu-item>`)}
                </ui5-menu>`}return n`<ui5-button design="Transparent" icon="${o.icon||d}" @click="${()=>s(o.path)}">${o.label}</ui5-button>`};return n`
        <div style="display:flex; flex-direction:row; gap:.25rem; align-items:center;"
             slot="${t.slot??d}">
            ${a.map(r)}
        </div>`},wl=(e,t,i,a,s,r,o)=>{const l=t.metadata;let c=t.style??"";l?.fullWidth&&(c+="width: 100%;"),l?.justification&&(c+=`justify-content: ${l.justification};`),l?.verticalAlignment&&(c+=`align-items: ${l.verticalAlignment};`);const u=l?.spacing?"1rem":"0";return n`
        <div style="display: flex; flex-direction: row; flex-wrap: ${l?.wrap?"wrap":"nowrap"}; gap: ${u}; ${c}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(p=>g(e,p,i,a,s,r,o))}
        </div>`},xl=(e,t,i,a,s,r,o)=>{const l=t.metadata;let c=t.style??"";l?.fullWidth&&(c+="width: 100%;"),l?.justification&&(c+=`justify-content: ${l.justification};`),l?.horizontalAlignment&&(c+=`align-items: ${l.horizontalAlignment};`);const u=l?.spacing?"1rem":"0";return n`
        <div style="display: flex; flex-direction: column; gap: ${u}; ${c}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(p=>g(e,p,i,a,s,r,o))}
        </div>`},Pa=(e,t,i,a,s,r,o,l)=>{const c=t;if(c.type===M.ClientSide&&c.metadata?.type===h.FormRow)return n`${c.children?.map(u=>Pa(e,u,i,a,s,r,o,l))}`;if(c.type===M.ClientSide&&c.metadata?.type===h.FormField){const p=c.metadata?.colspan??1;if(p>1)return n`<div style="grid-column: span ${Math.min(p,l)};">
                ${g(e,t,i,a,s,r,o)}
            </div>`}return g(e,t,i,a,s,r,o)},Cl=(e,t,i,a,s,r,o)=>n`${t.children?.map(l=>g(e,l,i,a,s,r,o))}`,Sl=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=l?.maxColumns&&l.maxColumns>0?l.maxColumns:2;let u=t.style??"";return l?.fullWidth&&(u+="width: 100%;"),n`
        <div style="display: grid; grid-template-columns: repeat(${c}, 1fr); gap: 1rem; ${u}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(p=>Pa(e,p,i,a,s,r,o,c))}
        </div>`},kl=(e,t,i,a,s,r,o)=>{const l=t.metadata;let c=t.style??"";return l?.fullWidth&&(c+="width: 100%;"),n`
        <ui5-tabcontainer
            style="${c}"
            class="${t.cssClasses??d}"
            slot="${t.slot??d}"
        >
            ${t.children?.map(u=>{const p=u,m=p.metadata;return n`
                    <ui5-tab text="${m?.label??""}">
                        ${p.children?.map(f=>g(e,f,i,a,s,r,o))}
                    </ui5-tab>`})}
        </ui5-tabcontainer>`},El=(e,t,i,a,s,r,o)=>{const l=t.metadata;let c=t.style??"";return l?.fullWidth&&(c+="width: 100%;"),n`
        <div style="${c}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(u=>{const p=u,m=p.metadata;return n`
                    <ui5-panel
                        header-text="${m?.label??""}"
                        ?collapsed="${!m?.active}"
                        ?disabled="${m?.disabled}"
                        style="margin-bottom: 0.5rem;"
                    >
                        ${p.children?.map(f=>g(e,f,i,a,s,r,o))}
                    </ui5-panel>`})}
        </div>`},Il=(e,t,i,a,s,r,o)=>n`
        <div style="display: flex; gap: 1rem; ${t.style??""}"
             slot="${t.slot??d}">
            <div style="flex: 1;">${t.children?.[0]?g(e,t.children[0],i,a,s,r,o):d}</div>
            <div style="flex: 1;">${t.children?.[1]?g(e,t.children[1],i,a,s,r,o):d}</div>
        </div>`,_l=(e,t,i,a,s,r,o)=>n`
        <div style="overflow: auto; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(l=>g(e,l,i,a,s,r,o))}
        </div>`,Tl=(e,t,i,a,s,r,o)=>n`
        <div style="width: 100%; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(l=>g(e,l,i,a,s,r,o))}
        </div>`,Rl=(e,t,i,a,s,r,o)=>n`
        <div style="max-width: 800px; margin: auto; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(l=>g(e,l,i,a,s,r,o))}
        </div>`,Pl=(e,t,i,a,s,r,o)=>n`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(l=>g(e,l,i,a,s,r,o))}
        </div>`,Ol=(e,t,i,a,s,r,o)=>n`
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; ${t.style??""}"
             class="${t.cssClasses??d}">
            ${t.children?.map(l=>g(e,l,i,a,s,r,o))}
        </div>`,Ll=(e,t,i,a,s,r,o)=>{const c=t.metadata?.boardCols,u=c?`flex: ${c}; ${t.style??""}`:`flex: 1; ${t.style??""}`;return n`
        <div style="${u}" class="${t.cssClasses??d}">
            ${t.children?.map(p=>g(e,p,i,a,s,r,o))}
        </div>`},Dl=(e,t,i,a,s)=>{const r=e.metadata,o=r.text??"",l={id:L(e.id),style:e.style??d,class:e.cssClasses??d,slot:e.slot??d};return r.container===W.h1?n`<h1 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${o}</h1>`:r.container===W.h2?n`<h2 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${o}</h2>`:r.container===W.h3?n`<h3 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${o}</h3>`:r.container===W.h4?n`<h4 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${o}</h4>`:r.container===W.h5?n`<h5 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${o}</h5>`:r.container===W.h6?n`<h6 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${o}</h6>`:r.container===W.span?n`<span id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${o}</span>`:n`<p id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${o}</p>`},Fl=(e,t,i)=>{const a=e.metadata,s=a?.text??"",r=a?.color??"",o=(()=>{const l=String(r).toUpperCase();return l==="SUCCESS"?"8":l==="ERROR"||l==="DANGER"?"1":l==="WARNING"?"6":l==="INFO"?"4":l==="PRIMARY"?"5":""})();return n`
        <ui5-tag
            color-scheme="${o||d}"
            style="${e.style??d}"
            slot="${e.slot??d}"
        >${s}</ui5-tag>`},Al=e=>{const i=(e.metadata?.icon??"").replace(/^vaadin:/,"").replace(/^lumo:/,"");return n`
        <ui5-icon
            name="${i||"question-mark"}"
            style="${e.style??d}"
            class="${e.cssClasses??d}"
            slot="${e.slot??d}"
        ></ui5-icon>`},zl=e=>{const t=e.metadata,i=t?.breadcrumbs??[],a=t?.currentItemText??"";return n`
        <ui5-breadcrumbs slot="${e.slot??d}">
            ${i.map(s=>n`
                <ui5-breadcrumbs-item href="${s.link??d}">${s.text}</ui5-breadcrumbs-item>
            `)}
            ${a?n`<ui5-breadcrumbs-item>${a}</ui5-breadcrumbs-item>`:d}
        </ui5-breadcrumbs>`},Nl=e=>{const t=e.metadata;return n`
        <ui5-message-strip
            design="Information"
            style="${e.style??d}"
            slot="${e.slot??d}"
        >
            ${t?.title?n`<strong>${t.title}: </strong>`:d}
            ${t?.text??""}
        </ui5-message-strip>`},ql=e=>{const t=e.metadata,i=t?.value??0,a=t?.label??`${i}%`,s=t?.valueState??"None";return n`
        <ui5-progress-indicator
            value="${i}"
            value-state="${s}"
            display-value="${a}"
            style="${e.style??d}"
            slot="${e.slot??d}"
        ></ui5-progress-indicator>`},Ml=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=l?.summary??l?.label??"",u=l?.open??!1;return n`
        <ui5-panel
            header-text="${c}"
            ?collapsed="${!u}"
            style="${t.style??d}"
            class="${t.cssClasses??d}"
            slot="${t.slot??d}"
        >
            ${t.children?.map(p=>g(e,p,i,a,s,r,o))}
        </ui5-panel>`},Bl=e=>{const t=e.metadata,i=t?.src??t?.url??"",a=t?.alt??"";return n`
        <img
            src="${i}"
            alt="${a}"
            style="${e.style??d}"
            class="${e.cssClasses??d}"
            slot="${e.slot??d}"
        />`},Ul=e=>{const t=e.metadata;return n`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style??d}" class="${e.cssClasses??d}"
                        slot="${e.slot??d}"></mateu-markdown>`},jl=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=(f,y)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:f,parameters:y},bubbles:!0,composed:!0}))},u=f=>{const y=[];return f?.forEach(w=>{const b=w.metadata;b?.type===h.GridGroupColumn?y.push(...u(b.columns??b.content??w.children)):b&&y.push({...b,id:b.id??w.id})}),y},p=u(l.content);if(l.tree){const f=l.page?.content??[],y=p[0],w=p.slice(1),b=k=>w.map(T=>k[T.id]!=null?`${T.label}: ${k[T.id]}`:"").filter(T=>T).join(" · "),C=k=>n`
            <ui5-tree-item
                text="${String(k[y?.id??""]??"")}"
                additional-text="${b(k)||d}"
                ?has-children="${(k.children?.length??0)>0}"
                expanded
            >
                ${k.children?.map(T=>C(T))}
            </ui5-tree-item>`;return n`
            <ui5-tree no-data-text="No data."
                      style="${t.style??"width: 100%;"}" class="${t.cssClasses??d}"
                      slot="${t.slot??d}">
                ${f.map(k=>C(k))}
            </ui5-tree>`}let m=l.page?.content??[];return t.id&&a&&a[t.id]&&(m=a[t.id]),n`
        <ui5-table no-data-text="No data." overflow-mode="Popin"
                   style="${t.style??"width: 100%;"}" class="${t.cssClasses??d}"
                   slot="${t.slot??d}">
            <ui5-table-header-row slot="headerRow">
                ${p.map(f=>n`
                    <ui5-table-header-cell width="${f.width??d}">${f.label??""}</ui5-table-header-cell>
                `)}
            </ui5-table-header-row>
            ${m.map((f,y)=>n`
                <ui5-table-row row-key="${f._rowNumber??y}">
                    ${p.map(w=>n`
                        <ui5-table-cell>${$a(f,w,c)}</ui5-table-cell>
                    `)}
                </ui5-table-row>
            `)}
        </ui5-table>`},Wl=(e,t,i,a,s,r,o)=>n`
    <mateu-sapui5-table
        id="${t.id}"
        .metadata="${t.metadata}"
        .data="${s}"
        .state="${a}"
        .appState="${r}"
        .appData="${o}"
        baseUrl="${i??""}"
        style="${t.style??d}"
        class="${t.cssClasses??d}"
        slot="${t.slot??d}"
    >
        ${t.children?.map(l=>g(e,l,i,a,s,r,o))}
    </mateu-sapui5-table>`,Vl=(e,t,i,a,s,r,o)=>{const c=t.metadata.page?.content??[];return n`
        <div style="overflow-y: auto; ${t.style??""}" class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${c.map(u=>g(e,u,i,a,s,r,o))}
        </div>`},Hl=(e,t,i,a,s,r,o)=>{const l=t.metadata,c=`ctx-menu-${t.id}`,u=(f,y)=>{y.path&&f?.dispatchEvent(new CustomEvent("update-route",{detail:{route:y.path},bubbles:!0,composed:!0}))},p=f=>n`
        ${f.map(y=>y.separator?n`<ui5-menu-separator></ui5-menu-separator>`:n`
                <ui5-menu-item
                    text="${y.label??""}"
                    ?disabled="${y.disabled}"
                    @click="${w=>u(w.target,y)}"
                >
                    ${y.submenus?p(y.submenus):d}
                </ui5-menu-item>`)}
    `,m=f=>{f.preventDefault();const w=f.currentTarget.getRootNode().querySelector(`#${CSS.escape(c)}`);w&&(w.opener=f.currentTarget,w.open=!0)};return n`
        <span style="${t.style??d}" class="${t.cssClasses??d}"
              slot="${t.slot??d}"
              @contextmenu="${l.activateOnLeftClick?d:m}"
              @click="${l.activateOnLeftClick?m:d}">
            ${g(e,l.wrapped,i,a,s,r,o)}
            <ui5-menu id="${c}">
                ${p(l.menu??[])}
            </ui5-menu>
        </span>`},Gl=e=>{const t=e.metadata,i=a=>a.submenus?n`
            <ui5-panel header-text="${a.label??""}" style="min-width: 12rem;">
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${a.submenus.map(s=>i(s))}
                </div>
            </ui5-panel>`:n`<ui5-link href="${a.path??d}">${a.label}</ui5-link>`;return n`
        <div style="display: flex; gap: 3rem; align-items: flex-start; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${t.menu.map(a=>i(a))}
        </div>`},Kl=(e,t,i,a,s,r,o)=>{const l=t.metadata;return n`
        <div style="${t.style??d}" class="${t.cssClasses??d}"
             slot="${t.slot??d}" data-colspan="${l.colspan||d}">
            ${l.label?n`<ui5-label show-colon>${l.label}</ui5-label>`:d}
            <div>${g(e,l.content,i,a,s,r,o)}</div>
        </div>`},Jl=(e,t,i,a,s,r,o)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=s?.detailComponent??null,u=!!s?.hasDetail||!!l,p=c??l;return n`
        <div style="display: flex; gap: 0; width: 100%; border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; overflow: hidden; ${t.style??""}"
             class="${t.cssClasses??d}" slot="${t.slot??d}">
            <div style="flex: 1; min-width: 0; overflow-y: auto;">
                ${g(e,t.children[0],i,a,s,r,o)}
            </div>
            <div style="flex: 1; min-width: 0; overflow-y: auto; border-left: 1px solid var(--sapNeutralBorderColor, #e5e5e5); ${u&&p?"":"display: flex; align-items: center; justify-content: center;"}">
                ${u&&p?g(e,p,i,a,s,r,o):n`<span style="color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem; padding: 1rem;">Select an item to view details</span>`}
            </div>
        </div>`},Yl=e=>{const t=e.state?.items??e.metadata?.items??[];return n`
        <div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 0.5rem; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${t.map(i=>n`
                <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                    <ui5-avatar size="XS" initials="${(i.userName??"?").split(/\s+/).map(a=>a[0]).slice(0,2).join("")}"></ui5-avatar>
                    <div>
                        ${i.userName?n`<div style="font-size: 0.75rem; color: var(--sapContent_LabelColor, #6a6d70);">${i.userName}</div>`:d}
                        <div>${i.text}</div>
                    </div>
                </div>
            `)}
        </div>`},Xl=e=>{const t=i=>{const s=i.target.parentElement?.querySelector("ui5-input"),r=s?.value??"";r&&(i.target.dispatchEvent(new CustomEvent("submit",{detail:{value:r},bubbles:!0,composed:!0})),s&&(s.value=""))};return n`
        <div style="display: flex; gap: 0.5rem; align-items: center; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            <ui5-input placeholder="Message" style="flex: 1;"
                       @keydown="${i=>{i.key==="Enter"&&t(i)}}"></ui5-input>
            <ui5-button design="Emphasized" @click="${t}">Send</ui5-button>
        </div>`},le=e=>{const t=e.target;t.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.value,fieldId:t.id},bubbles:!0,composed:!0}))},aa=e=>{const t=e.target;t.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.checked,fieldId:t.id},bubbles:!0,composed:!0}))},Ql=e=>{const t=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},Zl=new Set([h.App,h.Page,h.Form,h.Button,h.FormField,h.HorizontalLayout,h.VerticalLayout,h.FormLayout,h.FormRow,h.FormSection,h.FormSubSection,h.Card,h.TabLayout,h.AccordionLayout,h.SplitLayout,h.MasterDetailLayout,h.Scroller,h.FullWidth,h.Container,h.BoardLayout,h.BoardLayoutRow,h.BoardLayoutItem,h.Text,h.Badge,h.Icon,h.Breadcrumbs,h.Notification,h.ProgressBar,h.Details,h.Image,h.Anchor,h.Dialog,h.ConfirmDialog,h.Avatar,h.AvatarGroup,h.Tooltip,h.CarouselLayout,h.Popover,h.MenuBar,h.ContextMenu,h.Markdown,h.Grid,h.Table,h.VirtualList,h.Directory,h.CustomField,h.MessageList,h.MessageInput,h.Crud,h.Element,h.Div,h.MicroFrontend,h.Chart,h.Bpmn,h.CookieConsent,h.Map,h.Chat,h.Workflow,h.WorkflowElk,h.FormEditor,h.MetricCard,h.Scoreboard,h.DashboardPanel,h.DashboardLayout,h.FoldoutLayout,h.HeroSection,h.EmptyState,h.Skeleton,h.Gantt]);class ed extends jr{rendererName(){return"sapui5"}supportedClientSideTypes(){return Zl}rendersCrudLayouts(){return!0}renderClientSideComponent(t,i,a,s,r,o,l,c){return h.App==i?.metadata?.type?nl(t,i,a):h.Page==i?.metadata?.type?ol(t,i,a,s,r,o,l):h.Form==i?.metadata?.type?ll(t,i,a,s,r,o,l):h.Button==i?.metadata?.type?Zr(i):h.FormField==i?.metadata?.type?fn(t,i,a,s,r):h.HorizontalLayout==i?.metadata?.type?wl(t,i,a,s,r,o,l):h.VerticalLayout==i?.metadata?.type?xl(t,i,a,s,r,o,l):h.FormLayout==i?.metadata?.type?Sl(t,i,a,s,r,o,l):h.FormRow==i?.metadata?.type?Cl(t,i,a,s,r,o,l):h.FormSection==i?.metadata?.type?dl(t,i,a,s,r,o,l):h.FormSubSection==i?.metadata?.type?cl(t,i,a,s,r,o,l):h.Card==i?.metadata?.type?ul(t,i,a,s,r,o,l):h.TabLayout==i?.metadata?.type?kl(t,i,a,s,r,o,l):h.AccordionLayout==i?.metadata?.type?El(t,i,a,s,r,o,l):h.SplitLayout==i?.metadata?.type?Il(t,i,a,s,r,o,l):h.Scroller==i?.metadata?.type?_l(t,i,a,s,r,o,l):h.FullWidth==i?.metadata?.type?Tl(t,i,a,s,r,o,l):h.Container==i?.metadata?.type?Rl(t,i,a,s,r,o,l):h.BoardLayout==i?.metadata?.type?Pl(t,i,a,s,r,o,l):h.BoardLayoutRow==i?.metadata?.type?Ol(t,i,a,s,r,o,l):h.BoardLayoutItem==i?.metadata?.type?Ll(t,i,a,s,r,o,l):h.Text==i?.metadata?.type?Dl(i):h.Badge==i?.metadata?.type?Fl(i):h.Icon==i?.metadata?.type?Al(i):h.Breadcrumbs==i?.metadata?.type?zl(i):h.Notification==i?.metadata?.type?Nl(i):h.ProgressBar==i?.metadata?.type?ql(i):h.Details==i?.metadata?.type?Ml(t,i,a,s,r,o,l):h.Image==i?.metadata?.type?Bl(i):h.Anchor==i?.metadata?.type?hl(i):h.Dialog==i?.metadata?.type?pl(t,i,a,s,r,o,l):h.ConfirmDialog==i?.metadata?.type?ml(t,i,a,s,r,o,l):h.Avatar==i?.metadata?.type?vl(i):h.AvatarGroup==i?.metadata?.type?fl(i):h.Tooltip==i?.metadata?.type?gl(t,i,a,s,r,o,l):h.CarouselLayout==i?.metadata?.type?bl(t,i,a,s,r,o,l):h.Popover==i?.metadata?.type?$l(t,i,a,s,r,o,l):h.MenuBar==i?.metadata?.type?yl(t,i):h.ContextMenu==i?.metadata?.type?Hl(t,i,a,s,r,o,l):h.Markdown==i?.metadata?.type?Ul(i):h.Grid==i?.metadata?.type?jl(t,i,a,s):h.Table==i?.metadata?.type?Wl(t,i,a,s,r,o,l):h.VirtualList==i?.metadata?.type?Vl(t,i,a,s,r,o,l):h.Directory==i?.metadata?.type?Gl(i):h.CustomField==i?.metadata?.type?Kl(t,i,a,s,r,o,l):h.MasterDetailLayout==i?.metadata?.type?Jl(t,i,a,s,r,o,l):h.MessageList==i?.metadata?.type?Yl(i):h.MessageInput==i?.metadata?.type?Xl(i):super.renderClientSideComponent(t,i,a,s,r,o,l,c)}renderFilterBar(t,i,a,s,r,o,l){const c=i?.metadata,u=m=>{const{fieldId:f,value:y}=m.detail;t.state={...t.state,[f]:y}},p=m=>{const{fieldIds:f}=m.detail,y={};f?.forEach(w=>{y[w]=void 0}),y.searchText=void 0,t.state={...t.state,...y}};return n`
            <mateu-sapui5-filter-bar
                .metadata="${c}"
                .state="${t.state}"
                .data="${r}"
                .appState="${o}"
                .appData="${l}"
                baseUrl="${a??""}"
                @search-requested="${t.search}"
                @value-changed="${u}"
                @filter-reset-requested="${p}"
                @action-requested="${m=>{m.stopPropagation(),t.dispatchEvent(new CustomEvent("action-requested",{detail:m.detail,bubbles:!0,composed:!0}))}}"
            >
                ${c?.header?.map(m=>g(t,m,a,s,r,o,l))}
            </mateu-sapui5-filter-bar>
        `}renderPagination(t,i){const a=t.id;return n`
            <mateu-sapui5-pagination
                totalElements="${t.data[a]?.page?.totalElements??0}"
                pageSize="${t.data[a]?.page?.pageSize??100}"
                pageNumber="${t.data[a]?.page?.pageNumber??0}"
                @page-changed="${t.pageChanged}"
                @fetch-more-elements="${t.fetchMoreElements}"
            ></mateu-sapui5-pagination>
        `}renderTableComponent(t,i,a,s,r,o,l){return n`
            <mateu-sapui5-table
                id="${t.id}"
                .metadata="${i?.metadata}"
                .data="${t.data}"
                .state="${s}"
                .appState="${o}"
                .appData="${l}"
                .emptyStateMessage="${s[i?.id]?.emptyStateMessage}"
                baseUrl="${a}"
                @sort-changed="${c=>{t.state.sort=c.detail.sorts,t.handleSearchRequested(void 0)}}"
                @fetch-more-elements="${t.fetchMoreElements}"
                @action-requested="${c=>{c.stopPropagation(),t.dispatchEvent(new CustomEvent("action-requested",{detail:c.detail,bubbles:!0,composed:!0}))}}"
            ></mateu-sapui5-table>
        `}}var td=Object.defineProperty,id=Object.getOwnPropertyDescriptor,Ke=(e,t,i,a)=>{for(var s=a>1?void 0:a?id(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=(a?o(t,i,s):o(s))||s);return a&&s&&td(t,i,s),s};let Re=class extends F{constructor(){super(...arguments),this.baseUrl="",this.route=void 0,this.consumedRoute="_empty",this.config=void 0,this.top="true",this.pathPrefix=void 0,this.debug=!1,this._lastUrl="",this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top=="true"){let t=e.detail.route,i=this.baseUrl??"";!t||t.startsWith("/")?i=window.location.origin+(this.pathPrefix??""):(t=(this.pathPrefix??"")+t,i.indexOf("://")<0&&(i.startsWith("/")||(i="/"+i),i=window.location.origin+i)),t.startsWith(this.pathPrefix+"/")&&(t=t.substring(this.pathPrefix?.length)),i.endsWith("/")&&t.startsWith("/")&&(t=t.substring(1));let a=new URL(i+t);if((window.location.pathname||a.pathname)&&window.location.pathname!=a.pathname){let s=a.pathname;a.search&&(s+=a.search),s&&!s.startsWith("/")&&(s="/"+s),window.history.pushState({},"",s),this._lastUrl=window.location.href}}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),Ft.markClean(),e instanceof CustomEvent){let t=e.detail.route;const i=this.shadowRoot?.querySelector("mateu-ux");i&&(i.setAttribute("route",t),i.setAttribute("instant",Q()))}}}createRenderRoot(){return V.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),Ft.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!Ft.confirmLeave()){window.history.pushState({},"",this._lastUrl);return}const t=e.target;this.loadUrl(t)},this.top=="true"?this.loadUrl(window):this.route&&(this.consumedRoute=""),this.config)try{const e=JSON.parse(this.config);K.value={...K.value,...e}}catch{K.value={...K.value,config:this.config}}this.addEventListener("url-update-requested",this.routeChangedListener),this.addEventListener("navigate-to-requested",this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener("url-update-requested",this.routeChangedListener),this.removeEventListener("navigate-to-requested",this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute("route",this.route),this.instant=Q(),this._lastUrl=e.location.href,e.location.search){const i=new URLSearchParams(e.location.search).get("overrides");if(i&&(this.config=i,this.config))try{const a=JSON.parse(this.config);K.value={...K.value,...a}}catch{K.value={...K.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){const t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t=="/"?"":t}addQueryParams(e,t){return e+(t.search?""+t.search:"")}extractGrossRouteFromUrl(e){const t=e.location.pathname,i=this.baseUrl&&(this.baseUrl.startsWith("http://")||this.baseUrl.startsWith("https://"))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(i)?t.substring(i.length):t}getContextPathStartingIndex(e){return e.startsWith("http:")?e.indexOf("/",7):e.startsWith("https:")?e.indexOf("/",8):0}render(){return n`
           <mateu-api-caller>
                <mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${zt.value}"
                          .appState="${K.value}"
                ></mateu-ux>
           </mateu-api-caller>
           ${this.debug?n`
               <mateu-debug-overlay
                   .appState="${K.value}"
                   .appData="${zt.value}"
               ></mateu-debug-overlay>
           `:d}
       `}};Re.styles=R`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `;Ke([v()],Re.prototype,"baseUrl",2);Ke([v()],Re.prototype,"route",2);Ke([v()],Re.prototype,"consumedRoute",2);Ke([v()],Re.prototype,"config",2);Ke([v()],Re.prototype,"top",2);Ke([v()],Re.prototype,"pathPrefix",2);Ke([$()],Re.prototype,"instant",2);Ke([v({type:Boolean})],Re.prototype,"debug",2);Re=Ke([_("mateu-ui")],Re);var ad=Object.getOwnPropertyDescriptor,sd=(e,t,i,a)=>{for(var s=a>1?void 0:a?ad(t,i):t,r=e.length-1,o;r>=0;r--)(o=e[r])&&(s=o(s)||s);return s};let Ei=class extends Wt{constructor(){super(...arguments),this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}render(){const e=this.component?.metadata;return n`
            <div class="page-wrapper">
                ${e.noHeader?n`
                    ${e.toolbar?.length>0?n`
                        <div class="page-toolbar">
                            <slot name="toolbar"></slot>
                        </div>
                    `:d}
                `:n`
                    <div class="page-header">
                        <div class="page-title-area">
                            <ui5-title level="H3">${e.title}</ui5-title>
                            ${e.subtitle?n`<p class="subtitle">${e.subtitle}</p>`:d}
                        </div>
                        ${e.toolbar?.length>0?n`
                            <div class="page-toolbar">
                                <slot name="toolbar"></slot>
                            </div>
                        `:d}
                    </div>
                `}

                <div class="page-content">
                    <slot></slot>
                </div>

                ${e.buttons?.length>0?n`
                    <div class="page-footer">
                        <slot name="buttons"></slot>
                    </div>
                `:d}
            </div>`}};Ei.styles=R`
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
    `;Ei=sd([_("mateu-sapui5-form")],Ei);V.set(new ed);
