const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-diagrams.js","assets/vendor.js"])))=>i.map(i=>d[i]);
import{b as o,A as d,o as D,a as Se,i as w,n as h,r as g,c as S,t as k,w as ee,d as $i,e as je,f as xi,D as wi}from"./vendor-lit.js";import{n as $e,a as ki,S as Ci,b as Si}from"./vendor.js";import{_ as Ae,N as Lr}from"./vendor-ui5.js";import"./vendor-vaadin.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function r(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(a){if(a.ep)return;a.ep=!0;const i=r(a);fetch(a.href,i)}})();class _i{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(t){if(this.componentRenderer=t,typeof window<"u"){const r=t.supportedClientSideTypes?.();window.__mateuRendererInfo={name:t.rendererName?.()??t.constructor?.name??"unknown",supportedTypes:r?[...r].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(t){this.useShadowRoot=t}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(t){this.afterRenderHook=t}getAfterRenderHook(){return this.afterRenderHook}}const V=new _i;var u=(e=>(e.Page="Page",e.Div="Div",e.Element="Element",e.MicroFrontend="MicroFrontend",e.Form="Form",e.Crud="Crud",e.Result="Result",e.Card="Card",e.Directory="Directory",e.Stepper="Stepper",e.HorizontalLayout="HorizontalLayout",e.VerticalLayout="VerticalLayout",e.SplitLayout="SplitLayout",e.MasterDetailLayout="MasterDetailLayout",e.TabLayout="TabLayout",e.AccordionLayout="AccordionLayout",e.FormLayout="FormLayout",e.FormRow="FormRow",e.FormItem="FormItem",e.BoardLayout="BoardLayout",e.BoardLayoutRow="BoardLayoutRow",e.BoardLayoutItem="BoardLayoutItem",e.Scroller="Scroller",e.FullWidth="FullWidth",e.Container="Container",e.FormField="FormField",e.Table="Table",e.App="App",e.Text="Text",e.Avatar="Avatar",e.Chat="Chat",e.AvatarGroup="AvatarGroup",e.Badge="Badge",e.Breadcrumbs="Breadcrumbs",e.Anchor="Anchor",e.Button="Button",e.Chart="Chart",e.Icon="Icon",e.ConfirmDialog="ConfirmDialog",e.ContextMenu="ContextMenu",e.CookieConsent="CookieConsent",e.Details="Details",e.Dialog="Dialog",e.Drawer="Drawer",e.Image="Image",e.Map="Map",e.Markdown="Markdown",e.Notification="Notification",e.ProgressBar="ProgressBar",e.Popover="Popover",e.CarouselLayout="CarouselLayout",e.Tooltip="Tooltip",e.MessageInput="MessageInput",e.MessageList="MessageList",e.CustomField="CustomField",e.MenuBar="MenuBar",e.Grid="Grid",e.GridColumn="GridColumn",e.GridGroupColumn="GridGroupColumn",e.VirtualList="VirtualList",e.FormSection="FormSection",e.FormSubSection="FormSubSection",e.Bpmn="Bpmn",e.Workflow="Workflow",e.FormEditor="FormEditor",e.MetricCard="MetricCard",e.Scoreboard="Scoreboard",e.DashboardPanel="DashboardPanel",e.DashboardLayout="DashboardLayout",e.FoldoutLayout="FoldoutLayout",e.HeroSection="HeroSection",e.EmptyState="EmptyState",e.Skeleton="Skeleton",e.Gantt="Gantt",e.PlanningBoard="PlanningBoard",e.Kanban="Kanban",e.Timeline="Timeline",e.ProgressSteps="ProgressSteps",e.Stat="Stat",e.Calendar="Calendar",e.PricingTable="PricingTable",e.OrgChart="OrgChart",e.Heatmap="Heatmap",e.Funnel="Funnel",e.TrendChart="TrendChart",e.FeatureGrid="FeatureGrid",e.Testimonials="Testimonials",e.Faq="Faq",e.CalloutCard="CalloutCard",e.CommentThread="CommentThread",e.FileList="FileList",e.Checklist="Checklist",e.ComparisonCard="ComparisonCard",e.EntityHeader="EntityHeader",e.Meter="Meter",e.TaskProgress="TaskProgress",e.StatusList="StatusList",e.BulletedList="BulletedList",e.Separator="Separator",e.Notice="Notice",e.TaskQueue="TaskQueue",e.ResourceGrid="ResourceGrid",e.OfferCard="OfferCard",e.AddOnPicker="AddOnPicker",e.Ledger="Ledger",e.PaymentPicker="PaymentPicker",e.ProcessMonitor="ProcessMonitor",e))(u||{}),j=(e=>(e.ServerSide="ServerSide",e.ClientSide="ClientSide",e))(j||{});const y=(e,t,r,s,a,i,n,l)=>{if(!t)return o``;if(t.type==j.ClientSide)return V.get().renderClientSideComponent(e,t,r,s,a,i,n,l);const c=e.route,p=e.consumedRoute;return o`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${p}"
                         baseUrl="${r}"
                         slot="${t.slot??d}"
                         style="${t.style}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...s}}"
                         .data="${{...a}}"
                         .appState="${i}"
                         .appData="${n}"
        >
       </mateu-component>`},rr="var(--lumo-space-m, 1rem)",Ei=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=l.columnWidth||"13rem";let f=`display: grid; grid-template-columns: ${l.maxColumns&&l.maxColumns>0?`repeat(${l.maxColumns}, minmax(0, 1fr))`:`repeat(auto-fill, minmax(min(100%, ${c}), 1fr))`}; gap: ${rr} var(--lumo-space-l, 1.5rem); align-items: start;`;return l.labelsAside&&(f+=" --mateu-label-width: 10rem;"),l.fullWidth&&(f+=" width: 100%;"),f+=t.style??"",o`
        <div style="${f}" class="${t.cssClasses}" slot="${t.slot||d}">
            ${t.children?.map(m=>ma(l,e,m,r,s,a,i,n))}
        </div>
    `},ma=(e,t,r,s,a,i,n,l)=>{if(r.type==j.ClientSide&&r.metadata?.type==u.FormRow)return Ti(e,t,r,s,a,i,n,l);const c=Ii(r),p=e.labelsAside?Pi(t,r,s,a,i,n,l):y(t,r,s,a,i,n,l);return o`<div style="grid-column: span ${c}; min-width: 0;">${p}</div>`},Ii=e=>{if(e.type==j.ClientSide){const t=e.metadata;if(t?.type==u.FormField)return t.colspan||1}return 1},Pi=(e,t,r,s,a,i,n)=>{if(t.type==j.ClientSide&&t.metadata?.type==u.FormField&&t.metadata.label){const l=t.metadata,c=l.label?.includes("${")?e._evalTemplate(l.label):l.label;return o`
            <div style="display: flex; gap: ${rr}; align-items: baseline;">
                <label style="flex: 0 0 var(--mateu-label-width, 10rem); color: var(--lumo-secondary-text-color, #667);">${c}</label>
                <div style="flex: 1; min-width: 0;">${y(e,t,r,s,a,i,n,!0)}</div>
            </div>
        `}return y(e,t,r,s,a,i,n)},Ti=(e,t,r,s,a,i,n,l)=>o`
        <div style="grid-column: 1 / -1; display: flex; gap: ${rr}; flex-wrap: wrap;">
            ${r.children?.map(c=>o`<div style="flex: 1 1 ${100/Math.max(1,r.children.length)}%; min-width: min(100%, 13rem);">${ma(e,t,c,s,a,i,n,l)}</div>`)}
        </div>
    `,fa=(e,t,r,s,a,i,n,l)=>{const c=r.metadata;let p=`display: flex; flex-direction: ${e};`;c.spacing&&(p+=` gap: ${rr};`),c.padding&&(p+=" padding: var(--lumo-space-m, 1rem);"),c.wrap&&(p+=" flex-wrap: wrap;"),c.fullWidth&&(p+=" width: 100%;"),c.justification&&(p+=` justify-content: ${c.justification};`);const f=e==="row"?c.verticalAlignment:c.horizontalAlignment;return f&&(p+=` align-items: ${f};`),p+=r.style??"",o`
        <div style="${p}" class="${r.cssClasses}" slot="${r.slot??d}">
            ${r.children?.map(m=>y(t,m,s,a,i,n,l))}
        </div>
    `},Oi=(e,t,r,s,a,i,n)=>fa("row",e,t,r,s,a,i,n),Ri=(e,t,r,s,a,i,n)=>fa("column",e,t,r,s,a,i,n),Li=(e,t,r,s,a,i,n)=>{const l=t.metadata;let p=`display: flex; flex-direction: ${l.orientation==="vertical"?"column":"row"}; gap: var(--lumo-space-s, 0.5rem);`;return l.fullWidth&&(p+=" width: 100%;"),p+=t.style??"",o`
        <div style="${p}" class="${t.cssClasses}" slot="${t.slot??d}">
            <div style="flex: 1; min-width: 0; min-height: 0;">${y(e,t.children[0],r,s,a,i,n)}</div>
            <div style="flex: 1; min-width: 0; min-height: 0;">${y(e,t.children[1],r,s,a,i,n)}</div>
        </div>
    `},zi=(e,t,r,s,a,i,n)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=a?.detailComponent??null,p=!!a?.hasDetail||!!l,f=c??l;return o`
        <div style="display: flex; gap: var(--lumo-space-m, 1rem); ${t.style??""}" class="${t.cssClasses}" slot="${t.slot??d}">
            <div style="flex: 1; min-width: 0;">${y(e,t.children[0],r,s,a,i,n)}</div>
            ${p&&f?o`<div style="flex: 1; min-width: 0;">${y(e,f,r,s,a,i,n)}</div>`:o`<div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-s, .875rem);">Select an item to view details</div>`}
        </div>
    `},Ai=(e,t,r,s,a,i,n)=>{let l=t.style??"";t.metadata.fullWidth&&(l+=" width: 100%;");const c=Math.max(0,(t.children??[]).findIndex(p=>p.metadata.active));return o`
        <div style="${l}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map((p,f)=>{const m=p,v=m.metadata.label,b=v?.includes("${")?e._evalTemplate(v):v;return o`
                    <details ?open="${f===c}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));">
                        <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600;">${b}</summary>
                        <div style="padding: var(--lumo-space-m, 1rem) 0;">
                            ${m.children?.map(x=>y(e,x,r,s,a,i,n))}
                        </div>
                    </details>
                `})}
        </div>
    `},Di=(e,t,r,s,a,i,n)=>{const l=t.metadata;let c=t.style??"";return l.fullWidth&&(c+=" width: 100%;"),o`
        <div style="${c}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map(p=>Fi(e,p,r,s,a,i,n,l.variant))}
        </div>
    `},Fi=(e,t,r,s,a,i,n,l)=>{const c=t.metadata,p=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return o`
        <details ?open="${c.active}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); ${t.style??""}" class="${t.cssClasses}">
            <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600; ${c.disabled?"pointer-events: none; opacity: .5;":""}">${p}</summary>
            <div style="padding: var(--lumo-space-s, .5rem) 0;">
                ${t.children?.map(f=>y(e,f,r,s,a,i,n))}
            </div>
        </details>
    `},Mi=(e,t,r,s,a,i,n)=>o`
        <div style="overflow: auto; ${t.style??""}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map(l=>y(e,l,r,s,a,i,n))}
        </div>
    `,Ni=(e,t,r,s,a,i,n)=>o`
        <div style="width: 100%; ${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map(l=>y(e,l,r,s,a,i,n))}
        </div>
    `,Ui=(e,t,r,s,a,i,n)=>o`
        <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map(l=>y(e,l,r,s,a,i,n))}
        </div>
    `,Bi=(e,t,r,s,a,i,n)=>o`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: ${rr}; ${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map(l=>y(e,l,r,s,a,i,n))}
        </div>
    `,ji=(e,t,r,s,a,i,n)=>o`
        <div style="display: flex; gap: ${rr}; flex-wrap: wrap; ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(l=>y(e,l,r,s,a,i,n))}
        </div>
    `,qi=(e,t,r,s,a,i,n)=>{const l=t.metadata;return o`
        <div style="flex: ${l.boardCols??1} 1 0; min-width: min(100%, 12rem); ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(c=>y(e,c,r,s,a,i,n))}
        </div>
    `},Yt=(e,t)=>new Function(...Object.keys(t),"return `"+e+"`")(...Object.values(t)),sr=(e,t,r)=>({state:e??{},data:t??{},...r});function Bt(e,t,r,s){if(!e?.includes("${"))return e;try{return Yt(e,sr(t,r,s))}catch(a){return console.warn(`Mateu: could not interpolate "${e}":`,a),e}}const ut=(e,t,r)=>{if(e&&e.indexOf("${")>=0)try{return Yt(e,sr(t,r))}catch(s){return s.message}return e},hr=(e,t,r,s,a)=>{if(!e)return e;const i=sr(t,r,{appState:s??{},appData:a??{}});let n=e;try{if(n=Yt(e,i),n.includes("${"))try{n=Yt(n,i)}catch(l){n="when evaluating nested "+e+" :"+l+", where data is "+r+" and state is "+t+" and app state is "+s+" and app data is "+a,console.error(l,n,t,r,s,a)}}catch(l){n="when evaluating "+e+" :"+l+", where data is "+r+" and state is "+t+" and app state is "+s+" and app data is "+a,console.error(l,n,t,r,s,a)}return n},va=(e,t,r,s,a,i)=>{const n=sr(t,r,{appState:s??{},appData:a??{},...i}),l=Yt(e,n);return new Function(...Object.keys(n),`return (${l})`)(...Object.values(n))},ba=(e,t,r,s)=>{const a=sr(t,r,s);return new Function(...Object.keys(a),`return (${e})`)(...Object.values(a))},Hi=(e,t,r,s)=>Yt(e,sr(t,r,s)),ys="display:inline-flex; align-items:center; justify-content:center; width:2rem; height:2rem; border-radius:50%; background:var(--lumo-contrast-10pct,#e0e0e0); color:var(--lumo-secondary-text-color,#555); font-size:.8rem; font-weight:600; overflow:hidden; flex:none;",ga=(e,t)=>t||(typeof e=="string"&&e?e.trim().split(/\s+/).map(r=>r[0]).slice(0,2).join("").toUpperCase():""),Vi=(e,t,r)=>{const s=e.metadata,a=Jt(s.name,t,r);return o`<span style="${ys}${e.style}" class="${e.cssClasses}"
                      title="${a||d}" slot="${e.slot??d}">
        ${s.image?o`<img src="${s.image}" alt="${a}" style="width:100%;height:100%;object-fit:cover;">`:ga(a,s.abbreviation)}
    </span>`},Jt=(e,t,r)=>typeof e=="string"&&e.includes("${")?Bt(e,t,r):e,Wi=e=>{const t=e.metadata,r=t.avatars??[],s=t.maxItemsVisible&&t.maxItemsVisible>0?t.maxItemsVisible:r.length,a=r.slice(0,s),i=r.length-a.length,n="margin-left:-0.4rem; border:2px solid var(--lumo-base-color,#fff);";return o`<span style="display:inline-flex; ${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
        ${a.map(l=>o`<span style="${ys}${n}" title="${l.name||d}">
            ${l.img?o`<img src="${l.img}" style="width:100%;height:100%;object-fit:cover;">`:ga(l.name??"",l.abbr)}
        </span>`)}
        ${i>0?o`<span style="${ys}${n}">+${i}</span>`:d}
    </span>`},Gi=(e,t,r,s,a,i,n)=>{const l=t.metadata;return o`
        <div
                style="display: flex; flex-direction: column; overflow: auto; ${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            ${l.page.content.map(c=>y(e,c,r,s,a,i,n))}
        </div>
    `},Ki=e=>{const t=e.metadata;return(t?.content??t?.columns??[]).filter(s=>s&&s.metadata).map(s=>{const a=s.metadata;return{id:s.id??"",label:a?.label??s.id??"",autoWidth:a?.autoWidth,width:a?.width}})},js=(e,t)=>{const r=e?.[t];return r==null?"":typeof r=="object"?r.text??r.label??r.value??"":String(r)},$s=(e,t,r)=>{const s=Ki(e),a="text-align:left; padding:.45rem .6rem; border-bottom:2px solid var(--lumo-contrast-20pct,rgba(0,0,0,.2)); font-weight:600; white-space:nowrap; color: var(--lumo-secondary-text-color,#556);",i="padding:.4rem .6rem; border-bottom:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.08)); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:24rem;";return o`
        <div style="overflow:auto; width:100%; ${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            <table style="border-collapse:collapse; width:100%; font-size: var(--lumo-font-size-s,.875rem);">
                <thead><tr>${s.map(n=>o`<th style="${a}">${n.label}</th>`)}</tr></thead>
                <tbody>
                    ${(t??[]).length===0?o`<tr><td colspan="${Math.max(1,s.length)}" style="padding:1.5rem; text-align:center; color: var(--lumo-secondary-text-color,#888);">${r??"No data."}</td></tr>`:t.map(n=>o`<tr>${s.map(l=>o`<td style="${i}" title="${js(n,l.id)}">${js(n,l.id)}</td>`)}</tr>`)}
                </tbody>
            </table>
        </div>
    `},qs=(e,t)=>{const r=e.metadata;return e.id&&t&&t[e.id]?t[e.id]:r?.page?.content??[]},Yi=e=>{const r=e.metadata.items??[];return o`
        <div class="mateu-message-list ${e.cssClasses??""}"
             style="display:flex; flex-direction:column; gap:.75rem; ${e.style??""}"
             slot="${e.slot??d}">
            ${r.map(s=>o`
                <div style="display:flex; gap:.6rem; align-items:flex-start;">
                    <span style="flex:0 0 auto; width:2rem; height:2rem; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:.8rem; background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);">
                        ${s.userImg?o`<img src="${s.userImg}" alt="" style="width:100%; height:100%; object-fit:cover;">`:s.userAbbr??(s.userName?s.userName.charAt(0):"?")}
                    </span>
                    <div style="min-width:0;">
                        <div style="display:flex; gap:.5rem; align-items:baseline;">
                            ${s.userName?o`<span style="font-weight:600;">${s.userName}</span>`:d}
                            ${s.time?o`<span style="font-size:var(--lumo-font-size-xs,.75rem); color:var(--lumo-secondary-text-color,#666);">${s.time}</span>`:d}
                        </div>
                        <div style="white-space:pre-wrap; overflow-wrap:anywhere;">${s.text}</div>
                    </div>
                </div>
            `)}
        </div>
    `},ya=(e,t,r,s,a,i,n)=>t.separator?o`<span style="align-self: stretch; width: 1px; background: var(--lumo-contrast-20pct, rgba(0,0,0,.2));"></span>`:t.submenus?o`
            <details style="position: relative;">
                <summary style="cursor: pointer; list-style: none; padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);">
                    ${t.component?y(e,t.component,r,s,a,i,n):t.label} ▾
                </summary>
                <div style="display: flex; flex-direction: column; gap: .1rem; padding: .3rem; min-width: 10rem;
                            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px);
                            background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.15));">
                    ${t.submenus.map(l=>ya(e,l,r,s,a,i,n))}
                </div>
            </details>
        `:o`
        <span class="${t.className??""}"
              style="cursor: ${t.disabled?"default":"pointer"}; opacity: ${t.disabled?.5:1};
                     padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);
                     ${t.selected?"background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));":""}">
            ${t.component?y(e,t.component,r,s,a,i,n):t.label}
        </span>
    `,Ji=(e,t,r,s,a,i,n)=>{const l=t.metadata;return o`
        <div style="display: flex; flex-wrap: wrap; gap: .25rem; align-items: center; ${t.style}"
             class="${t.cssClasses}" slot="${t.slot??d}">
            ${l.options?.map(c=>ya(e,c,r,s,a,{},{}))}
        </div>
    `},Xi=(e,t,r,s,a,i,n)=>{const l=t.metadata;return o`
        <div style="${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${y(e,l.wrapped,r,s,a,i,n)}
        </div>
    `},Qi=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=l.content?.metadata,p=c?.type==u.Notice&&c.fullWidth===!0;return o`
        <div style="display:flex; flex-direction:column; ${p?"width: 100%; ":""}${t.style}"
             class="${t.cssClasses}"
             slot="${t.slot??d}"
             data-colspan="${l.colspan||(p?99:d)}"
        >
            ${l.label?o`<label style="font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${l.label}</label>`:d}
            ${y(e,l.content,r,s,a,i,n)}
        </div>
            `},Zi=e=>{const t=e.metadata,r=s=>{const a=s.closest(".mateu-message-input")?.querySelector("input"),i=a?.value??"";!t.actionId||!i.trim()||(s.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:{message:i}},bubbles:!0,composed:!0})),a&&(a.value=""))};return o`
        <div class="mateu-message-input ${e.cssClasses??""}"
             style="display:flex; gap:.5rem; align-items:center; ${e.style??""}"
             slot="${e.slot??d}">
            <input type="text"
                   style="flex:1; min-width:0; font:inherit; padding:.5rem .75rem; border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16)); border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513);"
                   @keydown="${s=>{s.key==="Enter"&&!s.shiftKey&&(s.preventDefault(),r(s.currentTarget))}}">
            <button style="font:inherit; font-weight:500; cursor:pointer; padding:.5rem 1rem; border:none; border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);"
                    @click="${s=>r(s.currentTarget)}">Send</button>
        </div>
    `},eo=(e,t,r,s,a,i,n)=>{const l=t.metadata;return o`<span title="${l.text}" style="${t.style}" class="${t.cssClasses}" slot="${t.slot??d}"
        >${y(e,l.wrapped,r,s,a,i,n)}</span>`},to=e=>{if(e instanceof CustomEvent)return e.detail;const t={};for(const r in e){const s=e[r];["number","string","boolean"].indexOf(typeof s)>=0&&(t[r]=e[r])}return t},Hs=(e,t,r)=>{for(let s in t.attributes)e.setAttribute(s,t.attributes[s]);r.style&&e.setAttribute("style",r.style),r.cssClasses&&e.setAttribute("class",r.cssClasses),r.slot&&e.setAttribute("slot",r.slot),t.content&&(t.html?e.innerHTML=t.content:e.append(t.content))},ro=e=>{const t=e.name,r=e.attributes?e.attributes.import:void 0;r&&t.includes("-")&&!customElements.get(t)&&import(r)},so=(e,t,r)=>{ro(t);let s=t.name;return t.attributes&&t.attributes.id&&(s="#"+t.attributes.id),setTimeout(()=>{const a=e.shadowRoot?.querySelector(".element-container")?.querySelector(s);if(a){for(;a.firstChild;)a.removeChild(a.lastChild);Hs(a,t,r)}else{const i=document.createElement(t.name);Hs(i,t,r);for(let n in t.on)i.addEventListener(n,l=>{const c=to(l);e.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.on[n],parameters:{event:c}},bubbles:!0,composed:!0}))});e.shadowRoot?.querySelector(".element-container")?.appendChild(i)}}),o`<div class="element-container"></div>`};var J=(e=>(e.div="div",e.p="p",e.h1="h1",e.h2="h2",e.h3="h3",e.h4="h4",e.h5="h5",e.h6="h6",e.span="span",e))(J||{});const ao=(e,t,r,s,a)=>{const i=e.metadata,n=i.attributes?.["data-colspan"],l=hr(i.text,t,r,s,a),c={xl:"var(--lumo-font-size-xl, 1.375rem)",l:"var(--lumo-font-size-l, 1.125rem)",s:"var(--lumo-font-size-s, .875rem)",xs:"var(--lumo-font-size-xs, .8125rem)"},p=(i.size&&c[i.size]?`font-size: ${c[i.size]}; `:"")+(i.noMargins?"margin-block-start: 0; margin-block-end: 0; ":"");return J.h1==i.container?o`
            <h1 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h1>
        `:J.h2==i.container?o`
            <h2 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h2>
        `:J.h3==i.container?o`
            <h3 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h3>
        `:J.h4==i.container?o`
            <h4 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h4>
        `:J.h5==i.container?o`
            <h5 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h5>
        `:J.h6==i.container?o`
            <h6 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h6>
        `:J.p==i.container?o`
               <p style="${p}${e.style}" class="${e.cssClasses}"
                  id="${D(e.id)}"
                  data-colspan="${D(n)}"
                  slot="${e.slot??d}">
                   ${l??d}
               </p>
            `:J.div==i.container?o`
               <div style="${p}${e.style}" class="${e.cssClasses}"
                    id="${D(e.id)}"
                    data-colspan="${D(n)}"
                    slot="${e.slot??d}">${l?Se(l):d}</div>
            `:J.span==i.container?o`
               <span style="${p}${e.style}" class="${e.cssClasses}"
                     id="${D(e.id)}"
                     data-colspan="${D(n)}"
                    slot="${e.slot??d}">${l??d}</span>
            `:o`
               <p
                       id="${D(e.id)}"
                       data-colspan="${D(n)}"
                       slot="${e.slot??d}">
                   Unknown text container: ${i.container} 
               </p>
            `},io=(e,t,r)=>{const s=e.metadata;return o`<span theme="badge ${s.color} ${s.pill?"pill":""} ${s.small?"small":""} ${s.primary?"primary":""}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??d}">${Jt(s.text,t,r)}</span>`},oo=(e,t,r)=>{const s=Jt(e.text,t,r);if(!s)return d;let a=Jt(e.color,t,r);return a=="SUCCESS"&&(a="success"),a=="ERROR"&&(a="error"),a=="DANGER"&&(a="error"),a=="WARNING"&&(a="warning"),a=="INFO"&&(a="info"),a=="PRIMARY"&&(a="primary"),a=="SECONDARY"&&(a="secondary"),a=="TERTIARY"&&(a="tertiary"),a=="QUATERNARY"&&(a="quaternary"),a=="LIGHT"&&(a="light"),a=="DARK"&&(a="dark"),o`<span theme="badge ${a} ${e.pill?"pill":""} ${e.small?"small":""} ${e.primary?"primary":""}">${s}</span>`},no=e=>{const t=e.metadata;return o`<a href="${t.url}" target="${t.target??d}"
                   rel="${t.target==="_blank"?"noopener":d}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}">${t.text}</a>`},lo=(e,t)=>{const r=e.toLowerCase().split("+");return t.ctrlKey===r.includes("ctrl")&&t.altKey===r.includes("alt")&&t.shiftKey===r.includes("shift")&&t.metaKey===r.includes("meta")},co=(e,t)=>{if(!lo(e,t))return!1;const r=e.toLowerCase().split("+"),s=r[r.length-1];return!!(t.key.toLowerCase()===s||/^[a-z]$/.test(s)&&t.code==="Key"+s.toUpperCase()||/^[0-9]$/.test(s)&&(t.code==="Digit"+s||t.code==="Numpad"+s))},uo=e=>e?e.split("+").map(t=>t.length<=1?t.toUpperCase():t.charAt(0).toUpperCase()+t.slice(1)).join("+"):void 0,K=(e,t,r,s)=>{if(!e)return o``;const a=V.get()?.renderIcon;if(a){const i=a.call(V.get(),e,t,r);return s?o`<span slot="${s}">${i}</span>`:i}return o`<span class="mateu-icon ${r??""}" data-icon="${e}" aria-hidden="true"
                      style="display:inline-block; width:1em; height:1em; ${t??""}" slot="${s??d}"></span>`},po=(e,t)=>{const r=e.currentTarget.dataset.actionId;e.currentTarget?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:r,parameters:t.parameters},bubbles:!0,composed:!0}))},ho="display:inline-flex; align-items:center; justify-content:center; gap:.4em; box-sizing:border-box; font:inherit; font-weight:500; cursor:pointer; border-radius:var(--lumo-border-radius-m,6px); border:1px solid transparent; line-height:1; white-space:nowrap;",mo=e=>{const t=e.buttonStyle??"",r=e.color&&e.color!=="none"&&e.color!=="normal"?e.color:"",s=e.size,a=r==="success"?"var(--lumo-success-color,#1a7f37)":r==="error"?"var(--lumo-error-color,#c5221f)":r==="contrast"?"var(--lumo-contrast,#161513)":"var(--lumo-primary-color,#3b5bdb)",i=r==="success"?"var(--lumo-success-contrast-color,#fff)":r==="error"?"var(--lumo-error-contrast-color,#fff)":r==="contrast"?"var(--lumo-base-color,#fff)":"var(--lumo-primary-contrast-color,#fff)",n=r==="success"?"var(--lumo-success-text-color,#1a7f37)":r==="error"?"var(--lumo-error-text-color,#c5221f)":r==="contrast"?"var(--lumo-body-text-color,#161513)":"var(--lumo-primary-text-color,#3b5bdb)";let l;return t==="primary"?l=`background:${a}; color:${i};`:t==="tertiary"||t==="tertiaryInline"?l=`background:transparent; color:${n};`:l=`background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:${n}; border-color:var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,`${ho}${l}${s==="small"?"padding:.25rem .6rem; font-size:var(--lumo-font-size-s,.875rem);":s==="large"?"padding:.65rem 1.4rem; font-size:var(--lumo-font-size-l,1.125rem);":"padding:.45rem 1rem; font-size:var(--lumo-font-size-m,1rem);"}`},fo=(e,t,r)=>{const s=e.metadata,a=Bt(s.label,t,r);return o`<button
            id="${e.id}"
            data-action-id="${s.actionId}"
            @click="${i=>po(i,s)}"
            style="${mo(s)}${e.style}"
            class="${e.cssClasses}"
            ?disabled="${s.disabled}"
            title="${s.shortcut?`${a} (${uo(s.shortcut)})`:d}"
            slot="${e.slot??d}"
    >${s.iconOnLeft?K(s.iconOnLeft):d}${a}${s.iconOnRight?K(s.iconOnRight):d}</button>`},vo="display:block; box-sizing:border-box; background:var(--lumo-base-color,#fff); border:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.1)); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-xs,0 1px 3px rgba(0,0,0,.08)); overflow:hidden;",bo=(e,t,r,s,a,i,n)=>{const l=t.metadata;if(!l)return o``;const c=f=>f?y(e,f,r,s,a,i,n,!1):d,p=l.header||l.headerPrefix||l.headerSuffix||l.title||l.subtitle;return o`
        <div style="${vo}${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${l.media?c(l.media):d}
            ${p?o`<div style="display:flex; align-items:flex-start; gap:.75rem; padding:1rem 1.25rem ${l.content||l.footer?"0":"1rem"};">
                ${l.headerPrefix?c(l.headerPrefix):d}
                <div style="flex:1; min-width:0;">
                    ${l.header?c(l.header):d}
                    ${l.title?o`<div style="font-weight:600; font-size:1.05rem; color:var(--lumo-body-text-color,#161513);">${c(l.title)}</div>`:d}
                    ${l.subtitle?o`<div style="color:var(--lumo-secondary-text-color,#667);">${c(l.subtitle)}</div>`:d}
                </div>
                ${l.headerSuffix?c(l.headerSuffix):d}
            </div>`:d}
            ${l.content?o`<div style="padding:1rem 1.25rem;">${c(l.content)}</div>`:d}
            ${l.footer?o`<div style="padding:0 1.25rem 1rem;">${c(l.footer)}</div>`:d}
        </div>
    `},go=e=>{const t=e.metadata;return o`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??d}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},yo=e=>{const t=e.metadata;return K(t.icon,e.style,e.cssClasses,e.slot)},ms=(e,t)=>{e&&e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},$a="font:inherit; font-weight:500; cursor:pointer; padding:.45rem 1rem; border-radius:var(--lumo-border-radius-m,6px);",Vs=`${$a} background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:var(--lumo-body-text-color,#161513); border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,$o=`${$a} background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff); border:1px solid transparent;`,xo=(e,t,r,s,a,i,n)=>{const l=t.metadata;let c=!1;if(l.openedCondition)try{c=va(l.openedCondition,s,a,i,n)}catch(p){console.error("when evaluating "+l.openedCondition+" :"+p+", where data is "+a+" and state is "+s)}return c?o`
        <div class="mateu-confirm-dialog ${t.cssClasses??""}"
             style="position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.4); ${t.style??""}"
             slot="${t.slot??d}">
            <div style="background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-l,0 8px 24px rgba(0,0,0,.2)); width:100%; max-width:min(90vw,32rem); padding:1.5rem; box-sizing:border-box;">
                ${l.header?o`<h3 style="margin:0 0 .75rem; font-size:1.15rem;">${l.header}</h3>`:d}
                <div>${t.children?.map(p=>y(e,p,r,s,a,i,n))}</div>
                <div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:1.25rem;">
                    ${l.canCancel?o`<button style="${Vs}" @click="${p=>ms(p.currentTarget,l.cancelActionId)}">${l.rejectText&&!l.canReject?l.rejectText:"Cancel"}</button>`:d}
                    ${l.canReject?o`<button style="${Vs}" @click="${p=>ms(p.currentTarget,l.rejectActionId)}">${l.rejectText||"No"}</button>`:d}
                    <button style="${$o}" @click="${p=>ms(p.currentTarget,l.confirmActionId)}">${l.confirmText||"OK"}</button>
                </div>
            </div>
        </div>
    `:o``},wo=e=>{const t=e.metadata;let r;return t.position&&(r={Top:"top",Bottom:"bottom",TopLeft:"top-left",TopRight:"top-right",BottomLeft:"bottom-left",BottomRight:"bottom-right"}[t.position]),o`
        <mateu-cookie-consent style="${e.style}" class="${e.cssClasses}"
                               slot="${e.slot??d}"
                               position="${r??d}"
                               cookie-name="${t.cookieName??d}"
                               .message="${t.message??d}"
                               theme="${t.theme??d}"
                               .learnMore="${t.learnMore??d}"
                               .learnMoreLink="${t.learnMoreLink??d}"
                               .dismiss="${t.dismiss??d}"
        ></mateu-cookie-consent>
    `},ko=(e,t,r,s,a,i,n)=>{const l=t.metadata;return o`
        <details
                ?open="${l.opened}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            <summary>${y(e,l.summary,r,s,a,i,n)}</summary>
            ${y(e,l.content,r,s,a,i,n)}
        </details>
            `},Co=(e,t,r,s,a,i)=>o`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${r}"
            .xdata="${s}"
            .appState="${a}"
            .appdata="${i}"
        ></mateu-dialog>
            `,So=(e,t,r,s,a,i)=>o`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${r}"
            .xdata="${s}"
            .appState="${a}"
            .appdata="${i}"
        ></mateu-drawer>
            `,_o=e=>{const t=e.metadata;return o`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"  
                  route="${t.route}" 
                  consumedRoute="${t.consumedRoute}" 
                  id="${$e()}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??d}"
        ></mateu-ux>
        </mateu-api-caller>
            `},Eo=e=>{const t=e.metadata;return o`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style}" class="${e.cssClasses}"
                        slot="${e.slot??d}"></mateu-markdown>
            `},Io=e=>{const t=e.metadata;return o`
        <div
            role="status"
            slot="${e.slot??d}"
            class="${e.cssClasses}"
            style="display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.9rem;
                   border-radius: var(--lumo-border-radius-m, 8px);
                   background: var(--lumo-contrast-5pct, rgba(0,0,0,0.05));
                   color: var(--lumo-body-text-color, #1a1a1a); ${e.style}"
        >
            ${t.title?o`<strong>${t.title}</strong>`:d}
            ${t.text?o`<span>${t.text}</span>`:d}
        </div>
    `},Po=(e,t={})=>{const r=e.metadata,s=r.valueKey?t[r.valueKey]:r.value,a=r.max&&r.max!=0?r.max:1,i=!r.indeterminate&&s!=null;return o`
        <div style="${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            <progress
                    style="width:100%;"
                    max="${a}"
                    .value="${i?s:d}"
            ></progress>
            ${r.text?o`<span class="text-secondary text-xs" id="sublbl">
    ${r.text}
  </span>`:d}
        </div>
    `},To=(e,t,r,s,a,i,n)=>{const l=t.metadata;return o`
        <details style="position: relative; ${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            <summary style="list-style: none; cursor: pointer;">${y(e,l.wrapped,r,s,a,i,n)}</summary>
            <div style="position: absolute; z-index: 100; min-width: 300px; margin-top: .25rem; padding: .6rem .8rem;
                        border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 8px);
                        background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,.2));">
                ${y(e,l.content,r,s,a,i,n)}
            </div>
        </details>
    `},Oo=e=>{const t=e.metadata;return o`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}"></mateu-map>
            `},Ro=e=>{const t=e.metadata;return o`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??d}">
            `},Lo=e=>{const t=e.metadata;return o`<div style="display:flex; align-items:center; gap:0.5rem;" slot="${e.slot??d}">
        ${t.breadcrumbs.map(r=>o`
            <a href="${r.link}">${r.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </div>`},zo=(e,t,r,s,a,i,n)=>{const l=t.metadata;return o`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${l.dots}" 
                ?nav = "${l.nav}" 
                ?loop = "${l.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(c=>o`<div>${y(e,c,r,s,a,i,n)}</div>`)}
        </skeleton-carousel>
    `},Ao=(e,t,r,s)=>{const a=e.metadata;return o`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            ${a.menu.map(i=>xa(i))}
        </div>
            `},xa=e=>o`
        ${e.submenus?o`
                <details open>
                    <summary>${e.label}</summary>
                    <div style="display:flex; flex-direction:column; gap:0.25rem; padding-left:0.5rem;">
                        ${e.submenus.map(t=>xa(t))}
                    </div>
                </details>
            `:o`
                <a href="${e.path}">${e.label}</a>
        `}
        `,Do=(e,t,r,s,a,i,n)=>{const l=t.metadata;return o`<div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >${l.content?Se(l.content):d}${t.children?.map(c=>y(e,c,r,s,a,i,n))}</div>
    `},Fo=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return o`<div
                slot="${t.slot??d}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?o`<div style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color); margin-bottom: var(--lumo-space-s);">${c}</div>`:d}
        ${t.children?.map(p=>y(e,p,r,s,a,i,n))}
    </div>
    `},Mo=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return o`
        <div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(p=>y(e,p,r,s,a,i,n))}</div>
    `},No=(e,t,r)=>{r.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:e,value:t},bubbles:!0,composed:!0}))},zr=e=>t=>{const r=t.target,s=r.type==="checkbox"?r.checked:r.value;No(e.fieldId,s,r)},Uo=(e,t)=>{const r=e.metadata,s=t?.[r.fieldId]??"",a=r,i=a.dataType,n=a.stereotype,l=!!a.readOnly,c=!!a.disabled,p=a.options,f=r.label?o`<label style="display:block; font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${r.label}</label>`:d,m="width:100%; box-sizing:border-box; padding:.4rem .6rem; border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.3)); border-radius: var(--lumo-border-radius-m,6px); font:inherit; background: var(--lumo-base-color,#fff); color: var(--lumo-body-text-color,#1a1a1a);";let v;return l||n==="plainText"?v=o`<div style="padding:.4rem 0;">${String(s??"")}</div>`:i==="boolean"||n==="checkbox"||n==="badge"?v=o`<input type="checkbox" ?checked="${!!s}" ?disabled="${c}" @change="${zr(r)}">`:p&&p.length?v=o`
            <select style="${m}" ?disabled="${c}" @change="${zr(r)}">
                <option value="">—</option>
                ${p.map(b=>o`<option value="${b.value}" ?selected="${b.value===s}">${b.label}</option>`)}
            </select>`:n==="textarea"||n==="richText"||n==="html"?v=o`<textarea style="${m}" rows="3" ?disabled="${c}" @input="${zr(r)}">${String(s??"")}</textarea>`:v=o`<input type="${i==="integer"||i==="number"||i==="double"||i==="money"?"number":i==="date"?"date":i==="datetime"?"datetime-local":i==="time"?"time":n==="password"?"password":i==="email"?"email":"text"}" style="${m}" .value="${String(s??"")}"
                              placeholder="${a.placeholder??d}" ?disabled="${c}" @input="${zr(r)}">`,o`
        <div style="${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            ${f}
            ${v}
        </div>
    `},xs=(e,t,r,s,a,i,n,l)=>{const c=t.metadata,p=c?.fabs??[];return o`<mateu-page
            .component="${t}"
            baseUrl="${r}"
            .state="${s}"
            .data="${a}"
            .appState="${i}"
            .appdata="${n}"
            slot="${t.slot??d}"
            style="${t.style}"
            class="${t.cssClasses}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(f=>y(e,f,r,s,a,i,n))}
        ${c?.buttons?.map(f=>o`
                   ${y(e,{id:f.actionId,metadata:f,type:j.ClientSide,slot:"buttons"},void 0,s,a,i,n)}
`)}
        ${p.map((f,m)=>o`
            <button class="page-fab" style="position: fixed; bottom: ${1.5+m*4}rem; right: 5.5rem;"
                @click="${()=>e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:f.actionId},bubbles:!0,composed:!0}))}"
                title="${f.label}">
                ${K(f.icon)}
            </button>
        `)}
</mateu-page>
    `},ws=(e,t,r,s,a,i,n,l)=>o`<mateu-table-crud
            id="${t.id}"
            baseUrl="${r}"
            .component="${t}"
            .metadata="${t.metadata}"
            .state="${s}"
            .data="${a}"
            .appState="${i}"
            .appdata="${n}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(c=>y(e,c,r,s,a,i,n))}
    </mateu-table-crud>`,Bo=e=>{const t=e.metadata;return o`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??d}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},jo=(e,t,r)=>{const s=e.metadata;return o`<mateu-chat sseUrl="${s.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??d}"></mateu-chat>`},qo=e=>{const t=e.metadata;return o`
        <mateu-workflow
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow>
    `},Ho=e=>{const t=e.metadata;return o`
        <mateu-form-editor
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Form","fields":[]}'}"
        ></mateu-form-editor>
    `},wa=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,Vo=e=>e=="up"?"var(--lumo-success-text-color, #1a7f37)":e=="down"?"var(--lumo-error-text-color, #c5221f)":"var(--lumo-secondary-text-color, #666)",Wo=e=>e=="up"?"▲":e=="down"?"▼":"",Go=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},Ko=e=>{const t=e.metadata,r=!!t.actionId;return o`
        <div class="mateu-metric-card ${e.cssClasses??""}"
             style="${wa} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${r?"cursor: pointer;":""} ${e.style??""}"
             slot="${e.slot??d}"
             role="${r?"button":d}"
             @click="${s=>Go(s,t)}"
        >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${t.title}</span>
                ${t.icon?K(t.icon,"color: var(--lumo-tertiary-text-color, #999); width: 1.1em; height: 1.1em;"):d}
            </div>
            <div style="display: flex; align-items: baseline; gap: .35rem;">
                <span style="font-size: var(--lumo-font-size-xxxl, 2rem); font-weight: 600; line-height: 1.1;">${t.value}</span>
                ${t.unit?o`<span style="font-size: var(--lumo-font-size-m, 1rem); color: var(--lumo-secondary-text-color, #666);">${t.unit}</span>`:d}
            </div>
            ${t.trend||t.trendLabel?o`
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${Vo(t.trend)};">
                    ${Wo(t.trend)} ${t.trendLabel??d}
                </span>
            `:d}
            ${t.description?o`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:d}
        </div>
    `},Yo=(e,t,r,s,a,i,n)=>o`
        <div class="mateu-scoreboard ${t.cssClasses??""}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(l=>y(e,l,r,s,a,i,n))}
        </div>
    `,Jo=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=l.colSpan&&l.colSpan>1?`grid-column: span ${l.colSpan};`:"",p=l.rowSpan&&l.rowSpan>1?`grid-row: span ${l.rowSpan};`:"";return o`
        <div class="mateu-dashboard-panel ${t.cssClasses??""}"
             style="${wa} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${p} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?o`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${l.title}</h3>
                    ${l.subtitle?o`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${l.subtitle}</span>`:d}
                </div>
            `:d}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(f=>y(e,f,r,s,a,i,n))}
            </div>
        </div>
    `},Xo=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=l.columns&&l.columns>0?`repeat(${l.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return o`
        <div class="mateu-dashboard ${t.cssClasses??""}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(p=>y(e,p,r,s,a,i,n))}
        </div>
    `};var Qo=Object.defineProperty,Zo=Object.getOwnPropertyDescriptor,it=(e,t,r,s)=>{for(var a=s>1?void 0:s?Zo(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Qo(t,r,a),a};let Fe=class extends S{constructor(){super(...arguments),this.panels=[],this.headerTitle="",this.badges=[],this.orientation="vertical",this.navigation=null,this.overviewEditActionId="",this.openPanels=new Set,this.expandedPanel=null,this._onPopState=()=>{const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(e.startsWith("expand=")){const t=e.slice(7),r=this.panels.findIndex((s,a)=>this.panelAnchor(s,a)===t);this.expandedPanel=r>=0?r:null}else this.expandedPanel=null},this.initialized=!1}navAction(e){e&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),window.addEventListener("popstate",this._onPopState)}disconnectedCallback(){window.removeEventListener("popstate",this._onPopState),super.disconnectedCallback()}willUpdate(){if(!this.initialized&&this.panels.length){this.openPanels=new Set(this.panels.map((t,r)=>t.open?r:-1).filter(t=>t>=0));const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(e.startsWith("expand=")){const t=e.slice(7),r=this.panels.findIndex((s,a)=>this.panelAnchor(s,a)===t);r>=0&&(this.expandedPanel=r)}else if(e){const t=this.panels.findIndex((r,s)=>this.panelAnchor(r,s)===e);t>=0&&this.openPanels.add(t)}this.initialized=!0}}firstUpdated(){const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(!e)return;const t=this.renderRoot.querySelector(`[data-anchor="${CSS.escape(e)}"]`);t&&t.scrollIntoView({block:"nearest"})}panelAnchor(e,t){return(e.title??"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||`panel-${t}`}bookmarkPanel(e){const t=this.panelAnchor(this.panels[e],e);try{history.replaceState(history.state,"","#"+t)}catch{}}clearBookmark(e){const t=this.panelAnchor(this.panels[e],e);if(decodeURIComponent((location.hash||"").replace(/^#/,""))===t)try{history.replaceState(history.state,"",location.pathname+location.search)}catch{}}expandPanel(e,t){t?.stopPropagation(),this.expandedPanel=e;const r=this.panelAnchor(this.panels[e],e);try{history.pushState(history.state,"","#expand="+r)}catch{}}collapsePanel(){try{history.back()}catch{this.expandedPanel=null}}toggle(e){const t=new Set(this.openPanels);t.has(e)?(t.delete(e),this.clearBookmark(e)):(t.add(e),this.bookmarkPanel(e)),this.openPanels=t}render(){if(this.expandedPanel!=null&&this.panels[this.expandedPanel]){const t=this.panels[this.expandedPanel];return o`
                <div class="expanded-view" part="expanded-view">
                    <div class="expanded-header">
                        <button class="nav-parent" title="Back"
                                @click="${()=>this.collapsePanel()}">
                            <span>‹</span><span>Back</span>
                        </button>
                        <span class="nav-title">${t.title}</span>
                        ${t.subtitle?o`<span class="subtitle">${t.subtitle}</span>`:d}
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
                    `:d}
                    ${e.title?o`<span class="nav-title">${e.title}</span>`:d}
                    <span class="nav-spacer"></span>
                    ${e.previousActionId?o`
                        <button class="nav-move" title="Previous"
                                @click="${()=>this.navAction(e.previousActionId)}">‹</button>
                    `:d}
                    ${e.nextActionId?o`
                        <button class="nav-move" title="Next"
                                @click="${()=>this.navAction(e.nextActionId)}">›</button>
                    `:d}
                </div>
            `:d}
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
                    `:d}
                    <slot name="overview"></slot>
                </div>
                <div class="rail" part="rail">
                    ${this.panels.map((t,r)=>this.openPanels.has(r)?o`
                        <div class="panel" part="panel" data-anchor="${this.panelAnchor(t,r)}"
                             @click="${()=>this.bookmarkPanel(r)}">
                            <div class="panel-header">
                                <div>
                                    <h3>${t.title}</h3>
                                    ${t.subtitle?o`<div class="subtitle">${t.subtitle}</div>`:""}
                                </div>
                                <span class="panel-actions">
                                    <button class="panel-expand" title="Show all"
                                            @click="${s=>this.expandPanel(r,s)}">⤢</button>
                                    <button class="fold" title="Fold" @click="${s=>{s.stopPropagation(),this.toggle(r)}}">⟨</button>
                                </span>
                            </div>
                            <div style="flex: 1; min-height: 0;">
                                <slot name="panel-${r}"></slot>
                            </div>
                        </div>
                    `:o`
                        <div class="strip" role="button" title="${t.title}"
                             data-anchor="${this.panelAnchor(t,r)}" @click="${()=>this.toggle(r)}">
                            <button class="fold" tabindex="-1">⟩</button>
                            <span>${t.title}</span>
                        </div>
                    `)}
                </div>
            </div>
        `}};Fe.styles=w`
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
    `;it([h({type:Array})],Fe.prototype,"panels",2);it([h({type:String})],Fe.prototype,"headerTitle",2);it([h({type:Array})],Fe.prototype,"badges",2);it([h({type:String,reflect:!0})],Fe.prototype,"orientation",2);it([h({attribute:!1})],Fe.prototype,"navigation",2);it([h({type:String})],Fe.prototype,"overviewEditActionId",2);it([g()],Fe.prototype,"openPanels",2);it([g()],Fe.prototype,"expandedPanel",2);Fe=it([k("mateu-foldout")],Fe);const en=(e,t,r,s,a,i,n)=>{const l=t.metadata;return o`
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
            ${t.children?.map(c=>y(e,c,r,s,a,i,n))}
        </mateu-foldout>
    `},tn=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=!!l.image,p=c?`background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${l.image}'); background-size: cover; background-position: center; color: #fff;`:"",f=l.centered===!1?"flex-start":"center",m=l.centered===!1?"left":"center";return o`
        <div class="mateu-hero ${t.cssClasses??""}"
             style="display: flex; flex-direction: column; align-items: ${f}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${m}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); min-height: ${l.height??"12rem"}; box-sizing: border-box; ${p} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?o`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${l.title}</h1>`:d}
            ${l.subtitle?o`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${c?"":"color: var(--lumo-secondary-text-color, #666);"} max-width: 40rem;">${l.subtitle}</p>`:d}
            ${t.children?.length?o`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${f}; width: 100%; max-width: 40rem;">
                    ${t.children?.map(v=>y(e,v,r,s,a,i,n))}
                </div>
            `:d}
        </div>
    `};var rn=Object.defineProperty,sn=Object.getOwnPropertyDescriptor,Es=(e,t,r,s)=>{for(var a=s>1?void 0:s?sn(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&rn(t,r,a),a};let mr=class extends S{constructor(){super(...arguments),this.variant="text",this.count=3}render(){const e=Array.from({length:Math.max(1,this.count)});return this.variant=="card"?o`${e.map(()=>o`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant=="grid"?o`${e.map(()=>o`<div class="bone row"></div>`)}`:this.variant=="form"?o`${e.map(()=>o`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:o`${e.map(()=>o`<div class="bone line"></div>`)}`}};mr.styles=w`
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
    `;Es([h()],mr.prototype,"variant",2);Es([h({type:Number})],mr.prototype,"count",2);mr=Es([k("mateu-skeleton")],mr);const an=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},pr=(e,t,r,s,a,i)=>o`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${t??"🗂"}</span>
            ${r?o`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${r}</span>`:d}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${s??e??"Nothing here yet."}</span>
            ${a&&i?o`
                <button style="margin-top: .25rem; font: inherit; font-weight: 500; cursor: pointer; padding: .4rem .9rem; border: none; border-radius: var(--lumo-border-radius-m, 6px); background: transparent; color: var(--lumo-primary-text-color, #3b5bdb);"
                        @click="${n=>an(n,a)}">${i}</button>
            `:d}
        </div>
    `,on=e=>{const t=e.metadata;return o`
        <div style="${e.style??d}" class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${pr(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},nn=e=>{const t=e.metadata;return o`
        <mateu-skeleton
                variant="${t.variant??"text"}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-skeleton>
    `};var ln=Object.defineProperty,dn=Object.getOwnPropertyDescriptor,Is=(e,t,r,s)=>{for(var a=s>1?void 0:s?dn(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&ln(t,r,a),a};const fs=1440*60*1e3;let fr=class extends S{constructor(){super(...arguments),this.tasks=[],this.onTaskSelectionActionId=""}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}range(){const e=this.tasks.flatMap(t=>[t.start,t.end]).filter(t=>!!t).map(t=>new Date(t+"T00:00:00").getTime());return e.length?{min:Math.min(...e)-fs,max:Math.max(...e)+2*fs}:null}months(e,t){const r=[],s=new Date(e);for(s.setDate(1);s.getTime()<=t;){const a=Math.max(s.getTime(),e),i=new Date(s.getFullYear(),s.getMonth()+1,1),n=Math.min(i.getTime(),t);r.push({label:s.toLocaleDateString(void 0,{month:"short",year:"2-digit"}),from:a,to:n}),s.setMonth(s.getMonth()+1)}return r}render(){const e=this.range();if(!e)return o``;const t=e.max-e.min,r=a=>(a-e.min)/t*100,s=Date.now();return o`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(a=>o`
                        <div class="month" style="width: ${(a.to-a.from)/t*100}%;">${a.label}</div>
                    `)}
                </div>
                ${this.tasks.map(a=>{const i=new Date(a.start+"T00:00:00").getTime(),n=new Date(a.end+"T00:00:00").getTime()+fs;return o`
                        <div class="label" title="${a.title}">${a.title}</div>
                        <div class="lane">
                            ${s>=e.min&&s<=e.max?o`<div class="today" style="left: ${r(s)}%;"></div>`:d}
                            <div class="bar ${this.onTaskSelectionActionId?"clickable":""}"
                                 title="${a.title} · ${a.start} → ${a.end}${a.progress?` · ${a.progress}%`:""}"
                                 @click="${()=>this.selectTask(a)}"
                                 style="left: ${r(i)}%; width: ${(n-i)/t*100}%; ${a.color?`--mateu-gantt-fill: ${a.color};`:""}">
                                <div class="fill" style="width: ${a.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};fr.styles=w`
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
    `;Is([h({type:Array})],fr.prototype,"tasks",2);Is([h()],fr.prototype,"onTaskSelectionActionId",2);fr=Is([k("mateu-gantt")],fr);const cn=e=>{const t=e.metadata;return o`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                .onTaskSelectionActionId="${t.onTaskSelectionActionId??""}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-gantt>
    `};var un=Object.defineProperty,pn=Object.getOwnPropertyDescriptor,xt=(e,t,r,s)=>{for(var a=s>1?void 0:s?pn(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&un(t,r,a),a};let F=class extends S{constructor(){super(...arguments),this.resources=[],this.blocks=[],this.drag=null,this.dragStartX=0,this.dragStartY=0,this.laneRects=[],this.onDragKeydown=e=>{e.key==="Escape"&&this.drag&&(e.stopPropagation(),this.endDrag())}}static parse(e){return new Date(e+"T00:00:00")}static iso(e){const t=r=>String(r).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}static addDays(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}static daysBetween(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}window(){if(this.from&&this.to){const s=F.parse(this.from),a=F.daysBetween(s,F.parse(this.to))+1;return a>0?{from:s,days:a}:null}const e=this.blocks.flatMap(s=>[s.start,s.end]).filter(s=>!!s).map(s=>F.parse(s));if(!e.length)return null;const t=new Date(Math.min(...e.map(s=>s.getTime()))),r=new Date(Math.max(...e.map(s=>s.getTime())));return{from:t,days:F.daysBetween(t,r)+1}}onBlockPointerDown(e,t,r){if(!this.moveActionId&&!this.selectActionId||(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.dragStartX=e.clientX,this.dragStartY=e.clientY,!this.window()))return;const i=F.parse(t.start),n=F.parse(t.end),l=Math.max(1,F.daysBetween(i,n)+1);this.laneRects=[...this.renderRoot.querySelectorAll(".lane[data-resource-id]")].map(p=>({resourceId:p.dataset.resourceId,rect:p.getBoundingClientRect()}));const c=this.dayAt(t.resourceId,e.clientX)??r;this.drag={blockId:t.id,duration:l,grabOffsetDays:c-r,originResourceId:t.resourceId,originStartIdx:r,targetResourceId:t.resourceId,targetStartIdx:r,moved:!1},window.addEventListener("keydown",this.onDragKeydown)}dayAt(e,t){const r=this.laneRects.find(i=>i.resourceId===e),s=this.window();if(!r||!s||r.rect.width===0)return null;const a=Math.floor((t-r.rect.left)/r.rect.width*s.days);return Math.max(0,Math.min(s.days-1,a))}onBlockPointerMove(e){if(!this.drag||!this.drag.moved&&Math.abs(e.clientX-this.dragStartX)<4&&Math.abs(e.clientY-this.dragStartY)<4||!this.moveActionId)return;const t=this.window();if(!t)return;const r=this.laneRects.find(i=>e.clientY>=i.rect.top&&e.clientY<=i.rect.bottom)??this.laneRects.find(i=>i.resourceId===this.drag.targetResourceId);if(!r)return;const s=this.dayAt(r.resourceId,e.clientX);if(s==null)return;const a=Math.max(0,Math.min(t.days-this.drag.duration,s-this.drag.grabOffsetDays));this.drag={...this.drag,moved:!0,targetResourceId:r.resourceId,targetStartIdx:a}}onBlockPointerUp(e){const t=this.drag;if(this.endDrag(),!t)return;if(!t.moved){this.selectActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.selectActionId,parameters:{_blockId:e.id}},bubbles:!0,composed:!0}));return}if(!this.moveActionId||t.targetResourceId===t.originResourceId&&t.targetStartIdx===t.originStartIdx)return;const r=this.window();if(!r)return;const s=F.addDays(r.from,t.targetStartIdx),a=F.addDays(s,t.duration-1);this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.moveActionId,parameters:{_blockId:t.blockId,_resourceId:t.targetResourceId,_start:F.iso(s),_end:F.iso(a)}},bubbles:!0,composed:!0}))}endDrag(){this.drag=null,window.removeEventListener("keydown",this.onDragKeydown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.onDragKeydown)}render(){const e=this.window();if(!e||!this.resources.length)return o``;const t=[...Array(e.days).keys()].map(l=>F.addDays(e.from,l)),r=new Date,s=F.daysBetween(e.from,new Date(r.getFullYear(),r.getMonth(),r.getDate())),a=s>=0&&s<e.days,i=[];let n;return this.resources.forEach(l=>{l.group&&l.group!==n&&i.push(o`<div class="group">${l.group}</div>`),n=l.group,i.push(this.renderRow(l,e,t,a?s:null))}),o`
            <div class="frame" style="grid-template-columns: minmax(8rem, 12rem) repeat(${e.days}, minmax(2.2rem, 1fr));">
                <div class="corner">Resource</div>
                ${t.map((l,c)=>o`
                    <div class="day-head ${this.isWeekend(l)?"weekend":""} ${c===s?"today":""}">
                        <span class="dow">${l.toLocaleDateString(void 0,{weekday:"short"})}</span>
                        <span class="num">${l.getDate()}</span>
                    </div>
                `)}
                ${i}
            </div>
        `}isWeekend(e){return e.getDay()===0||e.getDay()===6}renderRow(e,t,r,s){const a=100/t.days,i=this.blocks.filter(l=>l.resourceId===e.id&&l.start&&l.end),n=this.drag?.moved&&this.drag.targetResourceId===e.id?this.drag:null;return o`
            <div class="label" title="${e.label??""}">${e.label}</div>
            <div class="lane" data-resource-id="${e.id}">
                <div class="cells">
                    ${r.map(l=>o`<div class="cell ${this.isWeekend(l)?"weekend":""}"></div>`)}
                </div>
                ${s!=null?o`<div class="today-line" style="left: ${(s+.5)*a}%;"></div>`:d}
                ${i.map(l=>{const c=F.daysBetween(t.from,F.parse(l.start)),p=F.daysBetween(t.from,F.parse(l.end));if(p<0||c>=t.days)return d;const f=Math.max(0,c),m=Math.min(t.days-1,p),v=this.drag?.moved&&this.drag.blockId===l.id;return o`
                        <div class="block ${this.selectActionId?"clickable":""} ${this.moveActionId?"draggable":""} ${v?"dragging":""}"
                             title="${l.label??""} · ${l.start} → ${l.end}${l.status?` · ${l.status}`:""}"
                             style="left: ${f*a}%; width: ${(m-f+1)*a}%; ${l.color?`--mateu-planning-block: ${l.color};`:""}"
                             @pointerdown="${b=>this.onBlockPointerDown(b,l,c)}"
                             @pointermove="${b=>this.onBlockPointerMove(b)}"
                             @pointerup="${()=>this.onBlockPointerUp(l)}"
                             @pointercancel="${()=>this.endDrag()}"
                        >${l.label}</div>
                    `})}
                ${n?o`
                    <div class="ghost"
                         style="left: ${n.targetStartIdx*a}%; width: ${Math.min(n.duration,t.days-n.targetStartIdx)*a}%;"></div>
                `:d}
            </div>
        `}};F.styles=w`
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
    `;xt([h({type:Array})],F.prototype,"resources",2);xt([h({type:Array})],F.prototype,"blocks",2);xt([h()],F.prototype,"from",2);xt([h()],F.prototype,"to",2);xt([h()],F.prototype,"moveActionId",2);xt([h()],F.prototype,"selectActionId",2);xt([g()],F.prototype,"drag",2);F=xt([k("mateu-planning-board")],F);const hn=e=>{const t=e.metadata;return o`
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
    `};var mn=Object.defineProperty,fn=Object.getOwnPropertyDescriptor,ka=(e,t,r,s)=>{for(var a=s>1?void 0:s?fn(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&mn(t,r,a),a};let Dr=class extends S{constructor(){super(...arguments),this.columns=[]}clickCard(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedCard:e}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};Dr.styles=w`
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
    `;ka([h({type:Array})],Dr.prototype,"columns",2);Dr=ka([k("mateu-kanban")],Dr);const vn=e=>{const t=e.metadata;return o`
        <mateu-kanban
                .columns="${t.columns??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-kanban>
    `};var bn=Object.defineProperty,gn=Object.getOwnPropertyDescriptor,Ca=(e,t,r,s)=>{for(var a=s>1?void 0:s?gn(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&bn(t,r,a),a};let Fr=class extends S{constructor(){super(...arguments),this.items=[]}clickItem(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedItem:e}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};Fr.styles=w`
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
    `;Ca([h({type:Array})],Fr.prototype,"items",2);Fr=Ca([k("mateu-timeline")],Fr);const yn=e=>{const t=e.metadata;return o`
        <mateu-timeline
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-timeline>
    `};var $n=Object.defineProperty,xn=Object.getOwnPropertyDescriptor,Ps=(e,t,r,s)=>{for(var a=s>1?void 0:s?xn(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&$n(t,r,a),a};let vr=class extends S{constructor(){super(...arguments),this.steps=[],this.vertical=!1}render(){return o`
            <div class="steps">
                ${this.steps.map((e,t)=>{const r=e.status??"upcoming";return o`
                        <div class="step ${r}">
                            <div class="connector"></div>
                            <div class="dot">${r==="done"?"✓":t+1}</div>
                            <div class="label">${e.title}</div>
                            ${e.description?o`<div class="desc">${e.description}</div>`:d}
                        </div>
                    `})}
            </div>
        `}};vr.styles=w`
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
    `;Ps([h({type:Array})],vr.prototype,"steps",2);Ps([h({type:Boolean,reflect:!0})],vr.prototype,"vertical",2);vr=Ps([k("mateu-progress-steps")],vr);const wn=e=>{const t=e.metadata;return o`
        <mateu-progress-steps
                .steps="${t.steps??[]}"
                ?vertical="${t.vertical??!1}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-progress-steps>
    `};var kn=Object.defineProperty,Cn=Object.getOwnPropertyDescriptor,wt=(e,t,r,s)=>{for(var a=s>1?void 0:s?Cn(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&kn(t,r,a),a};let Ke=class extends S{constructor(){super(...arguments),this.spark=[]}sparkline(){const e=this.spark;if(!e||e.length<2)return d;const t=84,r=30,s=2,a=Math.min(...e),n=Math.max(...e)-a||1,l=(t-s*2)/(e.length-1),c=e.map((v,b)=>{const x=s+b*l,$=s+(r-s*2)*(1-(v-a)/n);return[x,$]}),p=c.map(([v,b],x)=>`${x===0?"M":"L"}${v.toFixed(1)} ${b.toFixed(1)}`).join(" "),f=`${p} L${c[c.length-1][0].toFixed(1)} ${r} L${c[0][0].toFixed(1)} ${r} Z`,m=this.trend==="down"?"var(--lumo-error-color, #e11d48)":this.trend==="flat"?"var(--lumo-secondary-text-color, #888)":"var(--lumo-success-color, #12b76a)";return ee`
            <svg width="${t}" height="${r}" viewBox="0 0 ${t} ${r}">
                <path d="${f}" fill="${m}" opacity="0.12"></path>
                <path d="${p}" fill="none" stroke="${m}" stroke-width="1.6"
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
        `}};Ke.styles=w`
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
    `;wt([h()],Ke.prototype,"label",2);wt([h()],Ke.prototype,"value",2);wt([h()],Ke.prototype,"unit",2);wt([h()],Ke.prototype,"delta",2);wt([h()],Ke.prototype,"trend",2);wt([h({type:Array})],Ke.prototype,"spark",2);wt([h()],Ke.prototype,"actionId",2);Ke=wt([k("mateu-stat")],Ke);const Sn=e=>{const t=e.metadata;return o`
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
    `};var _n=Object.defineProperty,En=Object.getOwnPropertyDescriptor,Ts=(e,t,r,s)=>{for(var a=s>1?void 0:s?En(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&_n(t,r,a),a};let br=class extends S{constructor(){super(...arguments),this.events=[]}clickEvent(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedEvent:e}},bubbles:!0,composed:!0}))}render(){const e=this.month?new Date(this.month+"T00:00:00"):new Date,t=e.getFullYear(),r=e.getMonth(),s=new Date(t,r,1),a=(s.getDay()+6)%7,i=new Date(t,r+1,0).getDate(),n=new Date,l=v=>n.getFullYear()===t&&n.getMonth()===r&&n.getDate()===v,c={};for(const v of this.events){if(!v.date)continue;const b=new Date(v.date+"T00:00:00");b.getFullYear()===t&&b.getMonth()===r&&(c[b.getDate()]??=[]).push(v)}const p=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],f=[];for(let v=0;v<a;v++)f.push(o`<div class="cell blank"></div>`);for(let v=1;v<=i;v++)f.push(o`
                <div class="cell ${l(v)?"today":""}">
                    <span class="num">${v}</span>
                    ${(c[v]??[]).map(b=>o`
                        <span class="chip ${b.actionId?"clickable":""}"
                              style="${b.color?`--mateu-cal-accent: ${b.color};`:""}"
                              title="${b.title??""}"
                              @click="${()=>this.clickEvent(b)}">${b.title}</span>
                    `)}
                </div>
            `);const m=s.toLocaleDateString(void 0,{month:"long",year:"numeric"});return o`
            <div class="title">${m}</div>
            <div class="grid">
                ${p.map(v=>o`<div class="dow">${v}</div>`)}
                ${f}
            </div>
        `}};br.styles=w`
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
    `;Ts([h()],br.prototype,"month",2);Ts([h({type:Array})],br.prototype,"events",2);br=Ts([k("mateu-calendar")],br);const In=e=>{const t=e.metadata;return o`
        <mateu-calendar
                month="${t.month??d}"
                .events="${t.events??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-calendar>
    `};var Pn=Object.defineProperty,Tn=Object.getOwnPropertyDescriptor,Sa=(e,t,r,s)=>{for(var a=s>1?void 0:s?Tn(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Pn(t,r,a),a};let Mr=class extends S{constructor(){super(...arguments),this.plans=[]}cta(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};Mr.styles=w`
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
    `;Sa([h({type:Array})],Mr.prototype,"plans",2);Mr=Sa([k("mateu-pricing-table")],Mr);const On=e=>{const t=e.metadata;return o`
        <mateu-pricing-table
                .plans="${t.plans??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-pricing-table>
    `};var Rn=Object.defineProperty,Ln=Object.getOwnPropertyDescriptor,_a=(e,t,r,s)=>{for(var a=s>1?void 0:s?Ln(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Rn(t,r,a),a};let Nr=class extends S{clickNode(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedNode:e}},bubbles:!0,composed:!0}))}renderNode(e){const t=e.avatar,r=t&&(t.startsWith("http")||t.startsWith("data:"));return o`
            <li>
                <div class="node ${e.actionId?"clickable":""}"
                     style="${e.color?`--mateu-org-accent: ${e.color};`:""}"
                     @click="${()=>this.clickNode(e)}">
                    ${t?o`<span class="avatar">${r?o`<img src="${t}" alt="">`:t}</span>`:d}
                    <span class="title">${e.title}</span>
                    ${e.subtitle?o`<span class="subtitle">${e.subtitle}</span>`:d}
                </div>
                ${e.children&&e.children.length?o`<ul>${e.children.map(s=>this.renderNode(s))}</ul>`:d}
            </li>
        `}render(){return this.root?o`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`:o``}};Nr.styles=w`
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
    `;_a([h({attribute:!1})],Nr.prototype,"root",2);Nr=_a([k("mateu-org-chart")],Nr);const zn=e=>{const t=e.metadata;return o`
        <mateu-org-chart
                .root="${t.root}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-org-chart>
    `};var An=Object.defineProperty,Dn=Object.getOwnPropertyDescriptor,Ea=(e,t,r,s)=>{for(var a=s>1?void 0:s?Dn(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&An(t,r,a),a};const Fn=1440*60*1e3;let Ur=class extends S{constructor(){super(...arguments),this.cells=[]}color(e,t){if(e<=0||t<=0)return"var(--lumo-contrast-10pct, #ebedf0)";const r=e/t,s=r>.75?1:r>.5?.75:r>.25?.5:.3;return`color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round(s*100)}%, transparent)`}render(){const e=this.cells.filter(c=>!!c.date);if(!e.length)return o``;const t=e.map(c=>new Date(c.date+"T00:00:00").getTime()),r=Math.min(...t),s=Math.max(...t),a=new Date(r);a.setDate(a.getDate()-(a.getDay()+6)%7);const i={};for(const c of e)i[c.date]=c;const n=Math.max(...e.map(c=>c.value??0),1),l=[];for(let c=a.getTime();c<=s;c+=Fn){const p=new Date(c),f=p.toISOString().slice(0,10),m=i[f],v=m?.value??0,b=(p.getDay()+6)%7+1,x=m?.label??`${f}: ${v}`;l.push(o`
                <div class="cell" style="grid-row: ${b}; --cell: ${this.color(v,n)};" title="${x}"></div>
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
        `}};Ur.styles=w`
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
    `;Ea([h({type:Array})],Ur.prototype,"cells",2);Ur=Ea([k("mateu-heatmap")],Ur);const Mn=e=>{const t=e.metadata;return o`
        <mateu-heatmap
                .cells="${t.cells??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-heatmap>
    `};var Nn=Object.defineProperty,Un=Object.getOwnPropertyDescriptor,Ia=(e,t,r,s)=>{for(var a=s>1?void 0:s?Un(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Nn(t,r,a),a};let Br=class extends S{constructor(){super(...arguments),this.stages=[]}render(){const e=this.stages;if(!e.length)return o``;const t=e[0].value??0,r=Math.max(...e.map(s=>s.value??0),1);return o`
            <div class="funnel">
                ${e.map((s,a)=>{const i=s.value??0,n=r>0?Math.max(6,i/r*100):6,l=a>0?e[a-1].value??0:t,c=a===0?t>0?"100%":"":l>0?`${Math.round(i/l*100)}%`:"0%";return o`
                        <div class="stage">
                            <div class="meta">
                                <span class="label">${s.label}</span>
                                ${a>0?o`<span class="conv">${c} of previous</span>`:d}
                            </div>
                            <div class="bar" style="width: ${n}%; ${s.color?`--bar: ${s.color};`:""}">
                                ${i.toLocaleString()}
                            </div>
                        </div>
                    `})}
            </div>
        `}};Br.styles=w`
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
    `;Ia([h({type:Array})],Br.prototype,"stages",2);Br=Ia([k("mateu-funnel")],Br);const Bn=e=>{const t=e.metadata;return o`
        <mateu-funnel
                .stages="${t.stages??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-funnel>
    `};var jn=Object.defineProperty,qn=Object.getOwnPropertyDescriptor,ar=(e,t,r,s)=>{for(var a=s>1?void 0:s?qn(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&jn(t,r,a),a};let ft=class extends S{constructor(){super(...arguments),this.values=[],this.labels=[],this.area=!1}render(){const e=this.values;if(!e||e.length<2)return o``;const t=600,r=160,s=8,a=Math.min(...e),i=Math.max(...e),n=i-a||1,l=(t-s*2)/(e.length-1),c=e.map((x,$)=>{const _=s+$*l,P=s+(r-s*2)*(1-(x-a)/n);return[_,P]}),p=c.map(([x,$],_)=>`${_===0?"M":"L"}${x.toFixed(1)} ${$.toFixed(1)}`).join(" "),f=`${p} L${c[c.length-1][0].toFixed(1)} ${r-s} L${c[0][0].toFixed(1)} ${r-s} Z`,m=this.color||"var(--lumo-primary-color, #1a73e8)",v=e.indexOf(i),b=e.indexOf(a);return o`
            ${this.heading?o`<div class="title">${this.heading}</div>`:d}
            <svg viewBox="0 0 ${t} ${r}" preserveAspectRatio="none">
                ${this.area?ee`<path d="${f}" fill="${m}" opacity="0.12"></path>`:d}
                <path d="${p}" fill="none" stroke="${m}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
                ${c.map((x,$)=>$===v||$===b?ee`<circle cx="${x[0]}" cy="${x[1]}" r="3.2" fill="${m}"><title>${this.labels[$]??""}: ${e[$]}</title></circle>`:ee`<circle cx="${x[0]}" cy="${x[1]}" r="6" fill="transparent"><title>${this.labels[$]??""}: ${e[$]}</title></circle>`)}
            </svg>
            ${this.labels&&this.labels.length?o`<div class="labels"><span>${this.labels[0]}</span><span>${this.labels[this.labels.length-1]}</span></div>`:d}
        `}};ft.styles=w`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .title { font-weight: 600; margin-bottom: .35rem; color: var(--lumo-body-text-color, #222); }
        svg { display: block; width: 100%; height: auto; overflow: visible; }
        .labels { display: flex; justify-content: space-between; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); margin-top: .2rem; }
    `;ar([h()],ft.prototype,"heading",2);ar([h({type:Array})],ft.prototype,"values",2);ar([h({type:Array})],ft.prototype,"labels",2);ar([h()],ft.prototype,"color",2);ar([h({type:Boolean})],ft.prototype,"area",2);ft=ar([k("mateu-trend-chart")],ft);const Hn=e=>{const t=e.metadata;return o`
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
    `};var Vn=Object.defineProperty,Wn=Object.getOwnPropertyDescriptor,Os=(e,t,r,s)=>{for(var a=s>1?void 0:s?Wn(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Vn(t,r,a),a};let gr=class extends S{constructor(){super(...arguments),this.features=[],this.columns=0}clickFeature(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){const e=this.columns&&this.columns>0?`repeat(${this.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(15rem, 1fr))";return o`
            <div class="grid" style="grid-template-columns: ${e};">
                ${this.features.map(t=>o`
                    <div class="card ${t.actionId?"clickable":""}" @click="${()=>this.clickFeature(t)}">
                        ${t.icon?o`<span class="icon">${t.icon}</span>`:d}
                        <span class="title">${t.title}</span>
                        ${t.description?o`<span class="desc">${t.description}</span>`:d}
                    </div>
                `)}
            </div>
        `}};gr.styles=w`
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
    `;Os([h({type:Array})],gr.prototype,"features",2);Os([h({type:Number})],gr.prototype,"columns",2);gr=Os([k("mateu-feature-grid")],gr);const Gn=e=>{const t=e.metadata;return o`
        <mateu-feature-grid
                .features="${t.features??[]}"
                .columns="${t.columns??0}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-feature-grid>
    `};var Kn=Object.defineProperty,Yn=Object.getOwnPropertyDescriptor,Pa=(e,t,r,s)=>{for(var a=s>1?void 0:s?Yn(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Kn(t,r,a),a};let jr=class extends S{constructor(){super(...arguments),this.items=[]}stars(e){const t=Math.max(0,Math.min(5,e||0));return"★".repeat(t)+"☆".repeat(5-t)}render(){return o`
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
        `}};jr.styles=w`
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
    `;Pa([h({type:Array})],jr.prototype,"items",2);jr=Pa([k("mateu-testimonials")],jr);const Jn=e=>{const t=e.metadata;return o`
        <mateu-testimonials
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-testimonials>
    `};var Xn=Object.defineProperty,Qn=Object.getOwnPropertyDescriptor,Rs=(e,t,r,s)=>{for(var a=s>1?void 0:s?Qn(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Xn(t,r,a),a};let yr=class extends S{constructor(){super(...arguments),this.items=[],this.openSet=new Set,this.seeded=!1}seed(){this.seeded||(this.seeded=!0,this.items.forEach((e,t)=>{e.open&&this.openSet.add(t)}))}toggle(e){this.openSet.has(e)?this.openSet.delete(e):this.openSet.add(e),this.requestUpdate()}render(){return this.seed(),o`
            <div class="list">
                ${this.items.map((e,t)=>{const r=this.openSet.has(t);return o`
                        <div class="item ${r?"open":""}">
                            <div class="q" @click="${()=>this.toggle(t)}">
                                <span>${e.question}</span>
                                <span class="chevron">›</span>
                            </div>
                            ${r?o`<div class="a">${e.answer}</div>`:""}
                        </div>
                    `})}
            </div>
        `}};yr.styles=w`
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
    `;Rs([h({type:Array})],yr.prototype,"items",2);Rs([g()],yr.prototype,"openSet",2);yr=Rs([k("mateu-faq")],yr);const Zn=e=>{const t=e.metadata;return o`
        <mateu-faq
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-faq>
    `};var el=Object.defineProperty,tl=Object.getOwnPropertyDescriptor,jt=(e,t,r,s)=>{for(var a=s>1?void 0:s?tl(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&el(t,r,a),a};let rt=class extends S{themeVars(){switch(this.theme){case"success":return"--accent: var(--lumo-success-color, #12b76a); --bg: var(--lumo-success-color-10pct, rgba(18,183,106,.1));";case"warning":return"--accent: #f59e0b; --bg: rgba(245,158,11,.12);";case"danger":return"--accent: var(--lumo-error-color, #e11d48); --bg: var(--lumo-error-color-10pct, rgba(225,29,72,.1));";default:return"--accent: var(--lumo-primary-color, #1a73e8); --bg: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));"}}cta(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){return o`
            <div class="callout" style="${this.themeVars()}">
                ${this.icon?o`<span class="icon">${this.icon}</span>`:d}
                <div class="body">
                    ${this.heading?o`<span class="heading">${this.heading}</span>`:d}
                    ${this.description?o`<span class="desc">${this.description}</span>`:d}
                    ${this.ctaLabel?o`<button class="cta" @click="${()=>this.cta()}">${this.ctaLabel}</button>`:d}
                </div>
            </div>
        `}};rt.styles=w`
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
    `;jt([h()],rt.prototype,"heading",2);jt([h()],rt.prototype,"description",2);jt([h()],rt.prototype,"icon",2);jt([h()],rt.prototype,"ctaLabel",2);jt([h()],rt.prototype,"actionId",2);jt([h()],rt.prototype,"theme",2);rt=jt([k("mateu-callout-card")],rt);const rl=e=>{const t=e.metadata;return o`
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
    `};var sl=Object.defineProperty,al=Object.getOwnPropertyDescriptor,Ta=(e,t,r,s)=>{for(var a=s>1?void 0:s?al(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&sl(t,r,a),a};let qr=class extends S{constructor(){super(...arguments),this.comments=[]}renderComment(e){const t=e.avatar&&(e.avatar.startsWith("http")||e.avatar.startsWith("data:"));return o`
            <div class="comment">
                <span class="avatar">${e.avatar?t?o`<img src="${e.avatar}" alt="">`:e.avatar:e.author?.[0]??"?"}</span>
                <div class="body">
                    <div class="head">
                        <span class="author">${e.author}</span>
                        ${e.timestamp?o`<span class="time">${e.timestamp}</span>`:d}
                    </div>
                    <div class="text">${e.text}</div>
                    ${e.replies&&e.replies.length?o`<div class="replies">${e.replies.map(r=>this.renderComment(r))}</div>`:d}
                </div>
            </div>
        `}render(){return o`<div class="thread">${this.comments.map(e=>this.renderComment(e))}</div>`}};qr.styles=w`
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
    `;Ta([h({type:Array})],qr.prototype,"comments",2);qr=Ta([k("mateu-comment-thread")],qr);const il=e=>{const t=e.metadata;return o`
        <mateu-comment-thread
                .comments="${t.comments??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-comment-thread>
    `};var ol=Object.defineProperty,nl=Object.getOwnPropertyDescriptor,Oa=(e,t,r,s)=>{for(var a=s>1?void 0:s?nl(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&ol(t,r,a),a};const ll={pdf:"📕",image:"🖼️",img:"🖼️",doc:"📘",docx:"📘",word:"📘",xls:"📗",xlsx:"📗",excel:"📗",sheet:"📗",zip:"🗜️",archive:"🗜️",video:"🎬",audio:"🎵",code:"💻",csv:"📄",txt:"📄"};let Hr=class extends S{constructor(){super(...arguments),this.files=[]}icon(e){return e&&ll[e.toLowerCase()]||"📄"}clickFile(e,t){e.url||e.actionId&&(t.preventDefault(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_file:e}},bubbles:!0,composed:!0})))}render(){return o`
            <div class="list">
                ${this.files.map(e=>{const t=!!e.url||!!e.actionId,r=o`
                        <span class="icon">${this.icon(e.type)}</span>
                        <span class="name">${e.name}</span>
                        ${e.size?o`<span class="size">${e.size}</span>`:d}
                        ${e.url?o`<span class="dl">⬇</span>`:d}
                    `;return e.url?o`<a class="file clickable" href="${e.url}" download target="_blank" rel="noopener">${r}</a>`:o`<div class="file ${t?"clickable":""}" @click="${s=>this.clickFile(e,s)}">${r}</div>`})}
            </div>
        `}};Hr.styles=w`
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
    `;Oa([h({type:Array})],Hr.prototype,"files",2);Hr=Oa([k("mateu-file-list")],Hr);const dl=e=>{const t=e.metadata;return o`
        <mateu-file-list
                .files="${t.files??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-file-list>
    `};var cl=Object.defineProperty,ul=Object.getOwnPropertyDescriptor,ts=(e,t,r,s)=>{for(var a=s>1?void 0:s?ul(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&cl(t,r,a),a};let Xt=class extends S{constructor(){super(...arguments),this.items=[],this.localDone=new Map}isDone(e,t){return this.localDone.has(t)?!!this.localDone.get(t):!!e.done}toggle(e,t){const r=!this.isDone(e,t);this.localDone.set(t,r),this.requestUpdate(),e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_item:e,_done:r}},bubbles:!0,composed:!0}))}render(){const e=this.items.length,t=this.items.filter((s,a)=>this.isDone(s,a)).length,r=e>0?Math.round(t/e*100):0;return o`
            <div class="head">
                ${this.heading?o`<span class="title">${this.heading}</span>`:o`<span></span>`}
                <span class="count">${t} / ${e}</span>
            </div>
            <div class="bar"><div class="fill" style="width: ${r}%;"></div></div>
            ${this.items.map((s,a)=>{const i=this.isDone(s,a);return o`
                    <div class="item ${i?"done":""}" @click="${()=>this.toggle(s,a)}">
                        <span class="box">${i?"✓":d}</span>
                        <span class="label">${s.label}</span>
                    </div>
                `})}
        `}};Xt.styles=w`
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
    `;ts([h()],Xt.prototype,"heading",2);ts([h({type:Array})],Xt.prototype,"items",2);ts([g()],Xt.prototype,"localDone",2);Xt=ts([k("mateu-checklist")],Xt);const pl=e=>{const t=e.metadata;return o`
        <mateu-checklist
                heading="${t.title??d}"
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-checklist>
    `};var hl=Object.defineProperty,ml=Object.getOwnPropertyDescriptor,kt=(e,t,r,s)=>{for(var a=s>1?void 0:s?ml(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&hl(t,r,a),a};let Ye=class extends S{render(){const e=this.trend??"flat";return o`
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
        `}};Ye.styles=w`
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
    `;kt([h()],Ye.prototype,"heading",2);kt([h()],Ye.prototype,"leftLabel",2);kt([h()],Ye.prototype,"leftValue",2);kt([h()],Ye.prototype,"rightLabel",2);kt([h()],Ye.prototype,"rightValue",2);kt([h()],Ye.prototype,"delta",2);kt([h()],Ye.prototype,"trend",2);Ye=kt([k("mateu-comparison-card")],Ye);const fl=e=>{const t=e.metadata;return o`
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
    `},rs=w`
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
`,vl=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}),ks=e=>vl.format(e),Vr=(e,t)=>{const r=e<0?"-":"",s=ks(Math.abs(e));return t?`${r}${t} ${s}`:`${r}${s}`},bl=(e,t)=>t?`${ks(e)} ${t}`:ks(e);var gl=Object.defineProperty,yl=Object.getOwnPropertyDescriptor,Ct=(e,t,r,s)=>{for(var a=s>1?void 0:s?yl(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&gl(t,r,a),a};let Je=class extends S{constructor(){super(...arguments),this.title="",this.badges=[],this.facts=[]}render(){const e=!!(this.metricLabel||this.metricValue||this.metricCaption);return o`
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
        `}};Je.styles=[rs,w`
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
    `];Ct([h()],Je.prototype,"title",2);Ct([h({type:Array})],Je.prototype,"badges",2);Ct([h()],Je.prototype,"subtitle",2);Ct([h({type:Array})],Je.prototype,"facts",2);Ct([h()],Je.prototype,"metricLabel",2);Ct([h()],Je.prototype,"metricValue",2);Ct([h()],Je.prototype,"metricCaption",2);Je=Ct([k("mateu-entity-header")],Je);const $l=e=>{const t=e.metadata;return o`
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
    `};var xl=Object.defineProperty,wl=Object.getOwnPropertyDescriptor,St=(e,t,r,s)=>{for(var a=s>1?void 0:s?wl(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&xl(t,r,a),a};let Xe=class extends S{constructor(){super(...arguments),this.value=0,this.max=0}fillColor(){return this.dangerAt!=null&&this.value>=this.dangerAt?"error":this.warnAt!=null&&this.value>=this.warnAt?"warning":this.warnAt!=null||this.dangerAt!=null?"success":"primary"}render(){const e=this.max>0?Math.min(Math.max(this.value/this.max,0),1):0,t=Math.round(e*100);return o`
            <div class="meter">
                ${this.label?o`<span class="label">${this.label}</span>`:d}
                <span class="value">${bl(this.value,this.unit)}</span>
                <div class="track">
                    <div class="fill ${this.fillColor()}" style="width: ${t}%"></div>
                </div>
                <span class="caption">${this.caption?this.caption:`${t}%`}</span>
            </div>
        `}};Xe.styles=w`
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
    `;St([h()],Xe.prototype,"label",2);St([h({type:Number})],Xe.prototype,"value",2);St([h({type:Number})],Xe.prototype,"max",2);St([h()],Xe.prototype,"unit",2);St([h()],Xe.prototype,"caption",2);St([h({type:Number})],Xe.prototype,"warnAt",2);St([h({type:Number})],Xe.prototype,"dangerAt",2);Xe=St([k("mateu-meter")],Xe);const kl=e=>{const t=e.metadata;return o`
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
    `};var Cl=Object.defineProperty,Sl=Object.getOwnPropertyDescriptor,ir=(e,t,r,s)=>{for(var a=s>1?void 0:s?Sl(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Cl(t,r,a),a};let vt=class extends S{constructor(){super(...arguments),this.total=0,this.done=0}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){const e=this.total>0&&this.done>=this.total,t=!e&&!!this.actionLabel&&!!this.actionId;return o`
            <div class="banner ${e?"complete":""}">
                <span class="icon">👥</span>
                ${this.label?o`<span class="label">${this.label}</span>`:d}
                <div class="pills">
                    ${Array.from({length:this.total},(r,s)=>o`
                        <span class="pill ${s+1<=this.done?"filled":""}">${s+1}/${this.total}</span>
                    `)}
                </div>
                <span class="spacer"></span>
                ${t?o`<button @click="${()=>this.runAction()}">${this.actionLabel} →</button>`:d}
            </div>
        `}};vt.styles=w`
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
    `;ir([h()],vt.prototype,"label",2);ir([h({type:Number})],vt.prototype,"total",2);ir([h({type:Number})],vt.prototype,"done",2);ir([h()],vt.prototype,"actionLabel",2);ir([h()],vt.prototype,"actionId",2);vt=ir([k("mateu-task-progress")],vt);const _l=e=>{const t=e.metadata;return o`
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
    `};var El=Object.defineProperty,Il=Object.getOwnPropertyDescriptor,wr=(e,t,r,s)=>{for(var a=s>1?void 0:s?Il(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&El(t,r,a),a};let Ot=class extends S{constructor(){super(...arguments),this.items=[],this.compact=!1,this.frameless=!1}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}rowClicked(e){this.rowActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.rowActionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}render(){return o`
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
                        ${e.actionLabel&&e.actionId?o`<button class="row-action" @click="${()=>this.runAction(e)}">${e.actionLabel}</button>`:d}
                    </div>
                `)}
            </div>
        `}};Ot.styles=[rs,w`
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
    `];wr([h({type:Array})],Ot.prototype,"items",2);wr([h({type:Boolean})],Ot.prototype,"compact",2);wr([h({type:Boolean})],Ot.prototype,"frameless",2);wr([h()],Ot.prototype,"rowActionId",2);Ot=wr([k("mateu-status-list")],Ot);const Pl=e=>{const t=e.metadata;return o`
        <mateu-status-list
                .items="${t.items??[]}"
                ?compact="${t.compact??!1}"
                ?frameless="${t.frameless??!1}"
                rowActionId="${D(t.rowActionId??void 0)}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-status-list>
    `};var Tl=Object.defineProperty,Ol=Object.getOwnPropertyDescriptor,Ra=(e,t,r,s)=>{for(var a=s>1?void 0:s?Ol(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Tl(t,r,a),a};let Wr=class extends S{constructor(){super(...arguments),this.items=[]}render(){return o`
            <ul>
                ${this.items.map(e=>o`<li>${e}</li>`)}
            </ul>
        `}};Wr.styles=w`
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
    `;Ra([h({type:Array})],Wr.prototype,"items",2);Wr=Ra([k("mateu-bulleted-list")],Wr);const Rl=e=>{const t=e.metadata;return o`
        <mateu-bulleted-list
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-bulleted-list>
    `},Ll=e=>{const r=e.metadata.attributes?.["data-colspan"];return o`
        <hr style="border: none; border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); width: 100%; margin: var(--lumo-space-s, .5rem) 0; ${e.style??""}"
            class="${e.cssClasses??d}"
            id="${D(e.id??void 0)}"
            data-colspan="${D(r)}"
            slot="${e.slot??d}"/>
    `};var zl=Object.defineProperty,Al=Object.getOwnPropertyDescriptor,Te=(e,t,r,s)=>{for(var a=s>1?void 0:s?Al(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&zl(t,r,a),a};const Dl={info:"ℹ",success:"✓",warning:"!",danger:"!"};let ce=class extends S{constructor(){super(...arguments),this.text="",this.theme="info",this.noIcon=!1,this.slim=!1,this.fullWidth=!1,this.hasContent=!1,this.inlineContent=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){const e=!!this.text&&!!this.text.trim();if(!e&&!this.hasContent)return o``;const t=["info","success","warning","danger"].includes(this.theme)?this.theme:"info";return o`
            <div class="notice ${t} ${this.slim?"slim":""}">
                ${this.noIcon?d:o`<span class="icon ${this.icon?"custom":""}">${this.icon||Dl[t]}</span>`}
                <div class="body ${this.inlineContent?"inline":""}">
                    ${e?o`<span class="text">${this.text}</span>`:d}
                    ${this.hasContent?o`<div class="content"><slot></slot></div>`:d}
                </div>
                ${this.actionLabel&&this.actionId?o`<button class="notice-action" @click="${()=>this.runAction()}">${this.actionLabel}</button>`:this.status?o`<span class="status">${this.status}</span>`:d}
            </div>
        `}};ce.styles=w`
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
    `;Te([h()],ce.prototype,"text",2);Te([h()],ce.prototype,"theme",2);Te([h()],ce.prototype,"icon",2);Te([h({type:Boolean})],ce.prototype,"noIcon",2);Te([h()],ce.prototype,"actionLabel",2);Te([h()],ce.prototype,"actionId",2);Te([h()],ce.prototype,"status",2);Te([h({type:Boolean})],ce.prototype,"slim",2);Te([h({type:Boolean})],ce.prototype,"fullWidth",2);Te([h({type:Boolean})],ce.prototype,"hasContent",2);Te([h({type:Boolean})],ce.prototype,"inlineContent",2);ce=Te([k("mateu-notice")],ce);const Fl=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=hr(l.text??"",s,a,i,n)??"",p=t.children??[];return o`
        <mateu-notice
                text="${c}"
                theme="${l.theme??"info"}"
                icon="${D(l.icon??void 0)}"
                ?noIcon="${l.noIcon??!1}"
                actionLabel="${D(l.actionLabel??void 0)}"
                actionId="${D(l.actionId??void 0)}"
                status="${D(l.status??void 0)}"
                ?slim="${l.slim??!1}"
                ?fullWidth="${l.fullWidth??!1}"
                ?inlineContent="${l.inlineContent??!1}"
                ?hasContent="${p.length>0}"
                data-colspan="${l.fullWidth?"99":d}"
                style="${t.style??d}"
                class="${t.cssClasses??d}"
                slot="${t.slot??d}"
        >${p.map(f=>y(e,f,r,s,a,i,n))}</mateu-notice>
    `};var Ml=Object.defineProperty,Nl=Object.getOwnPropertyDescriptor,ss=(e,t,r,s)=>{for(var a=s>1?void 0:s?Nl(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Ml(t,r,a),a};let Qt=class extends S{constructor(){super(...arguments),this.groups=[]}willUpdate(e){e.has("groups")&&(this.selectedId=this.groups.flatMap(t=>t.items??[]).find(t=>t.selected)?.id)}select(e){this.selectedId=e,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e}},bubbles:!0,composed:!0}))}render(){return o`
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
                                    ${(t.badges??[]).map(r=>o`<span class="chip ${r.color??""}">${r.label}</span>`)}
                                </div>
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};Qt.styles=[rs,w`
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
    `];ss([h()],Qt.prototype,"actionId",2);ss([h({type:Array})],Qt.prototype,"groups",2);ss([g()],Qt.prototype,"selectedId",2);Qt=ss([k("mateu-task-queue")],Qt);const Ul=e=>{const t=e.metadata;return o`
        <mateu-task-queue
                .actionId="${t.actionId}"
                .groups="${t.groups??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-task-queue>
    `};var Bl=Object.defineProperty,jl=Object.getOwnPropertyDescriptor,or=(e,t,r,s)=>{for(var a=s>1?void 0:s?jl(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Bl(t,r,a),a};let bt=class extends S{constructor(){super(...arguments),this.columns=0,this.items=[]}willUpdate(e){e.has("items")&&(this.selectedId=this.items.find(t=>t.selected)?.id)}select(e){e.disabled||(this.selectedId=e.id,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0})))}render(){const e=this.columns>0?`grid-template-columns: repeat(${this.columns}, minmax(0, 1fr));`:"grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));";return o`
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
        `}};bt.styles=[rs,w`
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
    `];or([h()],bt.prototype,"actionId",2);or([h({type:Number})],bt.prototype,"columns",2);or([h()],bt.prototype,"recommendedLabel",2);or([h({type:Array})],bt.prototype,"items",2);or([g()],bt.prototype,"selectedId",2);bt=or([k("mateu-resource-grid")],bt);const ql=e=>{const t=e.metadata;return o`
        <mateu-resource-grid
                .actionId="${t.actionId}"
                .columns="${t.columns??0}"
                .recommendedLabel="${t.recommendedLabel}"
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-resource-grid>
    `};var Hl=Object.defineProperty,Vl=Object.getOwnPropertyDescriptor,xe=(e,t,r,s)=>{for(var a=s>1?void 0:s?Vl(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Hl(t,r,a),a};let te=class extends S{constructor(){super(...arguments),this.title="",this.features=[],this.current=!1,this.added=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};te.styles=w`
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
    `;xe([h()],te.prototype,"tag",2);xe([h()],te.prototype,"title",2);xe([h()],te.prototype,"subtitle",2);xe([h()],te.prototype,"image",2);xe([h({type:Array})],te.prototype,"features",2);xe([h()],te.prototype,"priceLabel",2);xe([h()],te.prototype,"actionLabel",2);xe([h()],te.prototype,"actionId",2);xe([h({type:Boolean})],te.prototype,"current",2);xe([h()],te.prototype,"currentLabel",2);xe([h({type:Boolean})],te.prototype,"added",2);xe([h()],te.prototype,"addedLabel",2);te=xe([k("mateu-offer-card")],te);const Wl=e=>{const t=e.metadata;return o`
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
    `};var Gl=Object.defineProperty,Kl=Object.getOwnPropertyDescriptor,nr=(e,t,r,s)=>{for(var a=s>1?void 0:s?Kl(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Gl(t,r,a),a};let gt=class extends S{constructor(){super(...arguments),this.items=[],this.added=new Set}willUpdate(e){e.has("items")&&(this.added=new Set(this.items.filter(t=>t.added).map(t=>t.id)))}total(){return this.items.filter(e=>e.id!=null&&this.added.has(e.id)).reduce((e,t)=>e+(t.price??0),0)}toggle(e){if(e.id==null)return;const t=new Set(this.added),r=!t.has(e.id);r?t.add(e.id):t.delete(e.id),this.added=t,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id,_added:r,_total:this.total()}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="header">
                ${this.totalLabel?o`<span class="total-label">${this.totalLabel}:</span>`:d}
                <span class="total">${Vr(this.total(),this.currency)}</span>
            </div>
            <div class="grid">
                ${this.items.map(e=>{const t=e.id!=null&&this.added.has(e.id);return o`
                        <div class="card ${t?"added":""}">
                            ${e.icon?o`<span class="icon">${e.icon}</span>`:d}
                            <span class="title">${e.title}</span>
                            ${e.description?o`<span class="description">${e.description}</span>`:d}
                            ${e.includedLabel?o`<span class="included">${e.includedLabel}</span>`:o`
                                    ${e.price!=null?o`
                                        <span class="price">${Vr(e.price,this.currency)}${e.unit?` / ${e.unit}`:""}</span>
                                    `:d}
                                    <button class="toggle ${t?"on":""}" @click="${()=>this.toggle(e)}"
                                            aria-pressed="${t}">${t?"✓":"+"}</button>
                                `}
                        </div>
                    `})}
            </div>
        `}};gt.styles=w`
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
    `;nr([h()],gt.prototype,"totalLabel",2);nr([h()],gt.prototype,"currency",2);nr([h()],gt.prototype,"actionId",2);nr([h({type:Array})],gt.prototype,"items",2);nr([g()],gt.prototype,"added",2);gt=nr([k("mateu-addon-picker")],gt);const Yl=e=>{const t=e.metadata;return o`
        <mateu-addon-picker
                .totalLabel="${t.totalLabel}"
                .currency="${t.currency}"
                .actionId="${t.actionId}"
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-addon-picker>
    `};var Jl=Object.defineProperty,Xl=Object.getOwnPropertyDescriptor,kr=(e,t,r,s)=>{for(var a=s>1?void 0:s?Xl(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Jl(t,r,a),a};let Rt=class extends S{constructor(){super(...arguments),this.lines=[]}computedTotal(){return this.total!=null?this.total:this.lines.filter(e=>!e.included).reduce((e,t)=>e+(t.amount??0),0)}render(){return o`
            ${this.lines.map(e=>o`
                <div class="row">
                    <span class="dot"></span>
                    <span class="concept">${e.concept}</span>
                    ${e.included?o`<span class="included-label">${e.includedLabel||"Included"}</span>`:o`<span class="amount ${(e.amount??0)<0?"negative":""}">${Vr(e.amount??0,this.currency)}</span>`}
                </div>
            `)}
            <div class="total-row">
                <span class="total-label">${this.totalLabel||"Total"}</span>
                <span class="total">${Vr(this.computedTotal(),this.currency)}</span>
            </div>
        `}};Rt.styles=w`
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
    `;kr([h()],Rt.prototype,"currency",2);kr([h()],Rt.prototype,"totalLabel",2);kr([h({type:Array})],Rt.prototype,"lines",2);kr([h({type:Number})],Rt.prototype,"total",2);Rt=kr([k("mateu-ledger")],Rt);const Ql=e=>{const t=e.metadata;return o`
        <mateu-ledger
                .currency="${t.currency}"
                .totalLabel="${t.totalLabel}"
                .lines="${t.lines??[]}"
                .total="${t.total}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-ledger>
    `};var Zl=Object.defineProperty,ed=Object.getOwnPropertyDescriptor,ot=(e,t,r,s)=>{for(var a=s>1?void 0:s?ed(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Zl(t,r,a),a};let Me=class extends S{constructor(){super(...arguments),this.methods=[]}willUpdate(e){e.has("selected")&&(this.selectedId=this.selected)}confirm(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_method:this.selectedId}},bubbles:!0,composed:!0}))}pick(e){this.selectedId=e,this.methodActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.methodActionId,parameters:{_method:e}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};Me.styles=w`
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
    `;ot([h()],Me.prototype,"actionId",2);ot([h()],Me.prototype,"methodActionId",2);ot([h({type:Array})],Me.prototype,"methods",2);ot([h()],Me.prototype,"selected",2);ot([h()],Me.prototype,"contextLabel",2);ot([h()],Me.prototype,"contextValue",2);ot([h()],Me.prototype,"confirmLabel",2);ot([g()],Me.prototype,"selectedId",2);Me=ot([k("mateu-payment-picker")],Me);const td=e=>{const t=e.metadata;return o`
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
    `};var rd=Object.defineProperty,sd=Object.getOwnPropertyDescriptor,La=(e,t,r,s)=>{for(var a=s>1?void 0:s?sd(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&rd(t,r,a),a};let Gr=class extends S{constructor(){super(...arguments),this.items=[]}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};Gr.styles=w`
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
    `;La([h({type:Array})],Gr.prototype,"items",2);Gr=La([k("mateu-process-monitor")],Gr);const ad=e=>{const t=e.metadata;return o`
        <mateu-process-monitor
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-process-monitor>
    `},id=(e,t)=>{let r=e.style;return e.id&&(r&&!r.endsWith(";")&&(r+=";"),r==null&&(r=""),t[e.id+".hidden"]==!0&&(r+="display: none;")),r},od=(e,t)=>{let r={...e.metadata};if(e.id&&r){if(r.type==u.Button){const s=r;t[e.id+".disabled"]==!0&&(s.disabled=!0)}if(r.type==u.FormField){const s=r;t[e.id+".disabled"]==!0&&(s.disabled=!0)}}return r},R=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),nd={[u.Bpmn]:({component:e})=>Bo(e),[u.Workflow]:({component:e})=>qo(e),[u.FormEditor]:({component:e})=>Ho(e),[u.Page]:R(xs),[u.Div]:R(Do),[u.Directory]:({component:e,baseUrl:t,state:r,data:s})=>Ao(e),[u.FormLayout]:R(Ei),[u.HorizontalLayout]:R(Oi),[u.VerticalLayout]:R(Ri),[u.SplitLayout]:R(Li),[u.MasterDetailLayout]:R(zi),[u.TabLayout]:R(Ai),[u.AccordionLayout]:R(Di),[u.BoardLayout]:R(Bi),[u.BoardLayoutRow]:R(ji),[u.BoardLayoutItem]:R(qi),[u.Scroller]:R(Mi),[u.FullWidth]:R(Ni),[u.Container]:R(Ui),[u.Form]:({container:e,component:t,baseUrl:r,state:s,data:a,appState:i,appData:n})=>{const l=t.metadata;return o`<mateu-form
            id="${t.id}"
        baseUrl="${r}"
            .component="${t}"
            .values="${s}"
            .state="${s}"
            .data="${a}"
            .appState="${i}"
            .appdata="${n}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            >
                ${t.children?.map(c=>y(e,c,r,s,a,i,n))}
            ${l?.buttons?.map(c=>o`
               ${y(e,{id:c.actionId,metadata:c,type:j.ClientSide,slot:"buttons"},void 0,s,a,i,n)}
`)}

            </mateu-form>`},[u.Table]:({component:e,state:t,data:r})=>$s(e,(e.id?r?.[e.id]:void 0)?.page?.content??qs(e,t)),[u.Crud]:R(ws),[u.App]:({container:e,component:t,baseUrl:r,state:s,data:a,appState:i,appData:n})=>o`
            <mateu-app
                        id="${t.id}"
                        baseUrl="${r}"
                        .component="${t}"
                        .state="${s}"
                        .data="${a}"
                        style="${t.style}"
                        class="${t.cssClasses}"
                        .appState="${i}"
                        .appData="${n}"
            >
             ${t.children?.map(l=>y(e,l,r,s,a,i,n))}
         </mateu-app>`,[u.Element]:({container:e,component:t})=>so(e,t.metadata,t),[u.FormField]:({component:e,state:t})=>Uo(e,t),[u.Text]:({component:e,state:t,data:r,appState:s,appData:a})=>ao(e,t,r,s,a),[u.Avatar]:({component:e,state:t,data:r})=>Vi(e,t,r),[u.Chat]:({component:e,state:t,data:r})=>jo(e),[u.AvatarGroup]:({component:e})=>Wi(e),[u.Badge]:({component:e,state:t,data:r})=>io(e,t,r),[u.Breadcrumbs]:({component:e})=>Lo(e),[u.Anchor]:({component:e})=>no(e),[u.Button]:({component:e,state:t,data:r})=>fo(e,t,r),[u.Card]:R(bo),[u.Chart]:({component:e})=>go(e),[u.Icon]:({component:e})=>yo(e),[u.ConfirmDialog]:R(xo),[u.ContextMenu]:R(Xi),[u.CookieConsent]:({component:e})=>wo(e),[u.Details]:R(ko),[u.Dialog]:({component:e,baseUrl:t,state:r,data:s,appState:a,appData:i})=>Co(e,t,r,s,a,i),[u.Drawer]:({component:e,baseUrl:t,state:r,data:s,appState:a,appData:i})=>So(e,t,r,s,a,i),[u.Image]:({component:e})=>Ro(e),[u.Map]:({component:e})=>Oo(e),[u.Markdown]:({component:e})=>Eo(e),[u.MicroFrontend]:({component:e})=>_o(e),[u.Notification]:({component:e})=>Io(e),[u.ProgressBar]:({component:e,state:t})=>Po(e,t),[u.Popover]:R(To),[u.CarouselLayout]:R(zo),[u.Tooltip]:R(eo),[u.MessageInput]:({component:e})=>Zi(e),[u.MessageList]:({component:e})=>Yi(e),[u.CustomField]:R(Qi),[u.MenuBar]:({container:e,component:t,baseUrl:r,state:s,data:a})=>Ji(e,t,r,s,a),[u.Grid]:({component:e,state:t})=>$s(e,qs(e,t)),[u.VirtualList]:R(Gi),[u.FormSection]:R(Fo),[u.FormSubSection]:R(Mo),[u.MetricCard]:({component:e})=>Ko(e),[u.Scoreboard]:R(Yo),[u.DashboardPanel]:R(Jo),[u.DashboardLayout]:R(Xo),[u.FoldoutLayout]:R(en),[u.HeroSection]:R(tn),[u.EmptyState]:({component:e})=>on(e),[u.Skeleton]:({component:e})=>nn(e),[u.Gantt]:({component:e})=>cn(e),[u.PlanningBoard]:({component:e})=>hn(e),[u.Kanban]:({component:e})=>vn(e),[u.Timeline]:({component:e})=>yn(e),[u.ProgressSteps]:({component:e})=>wn(e),[u.Stat]:({component:e})=>Sn(e),[u.Calendar]:({component:e})=>In(e),[u.PricingTable]:({component:e})=>On(e),[u.OrgChart]:({component:e})=>zn(e),[u.Heatmap]:({component:e})=>Mn(e),[u.Funnel]:({component:e})=>Bn(e),[u.TrendChart]:({component:e})=>Hn(e),[u.FeatureGrid]:({component:e})=>Gn(e),[u.Testimonials]:({component:e})=>Jn(e),[u.Faq]:({component:e})=>Zn(e),[u.CalloutCard]:({component:e})=>rl(e),[u.CommentThread]:({component:e})=>il(e),[u.FileList]:({component:e})=>dl(e),[u.Checklist]:({component:e})=>pl(e),[u.ComparisonCard]:({component:e})=>fl(e),[u.EntityHeader]:({component:e})=>$l(e),[u.Meter]:({component:e})=>kl(e),[u.TaskProgress]:({component:e})=>_l(e),[u.StatusList]:({component:e})=>Pl(e),[u.BulletedList]:({component:e})=>Rl(e),[u.Separator]:({component:e})=>Ll(e),[u.Notice]:R(Fl),[u.TaskQueue]:({component:e})=>Ul(e),[u.ResourceGrid]:({component:e})=>ql(e),[u.OfferCard]:({component:e})=>Wl(e),[u.AddOnPicker]:({component:e})=>Yl(e),[u.Ledger]:({component:e})=>Ql(e),[u.PaymentPicker]:({component:e})=>td(e),[u.ProcessMonitor]:({component:e})=>ad(e)},Ls=(e,t,r,s,a,i,n,l)=>{if(!t?.metadata)return t==null?(console.warn("No metadata for component",t),o`<p>No metadata for component</p>`):Ls(e,{id:$e(),metadata:t,type:j.ClientSide},r,s,a,i,n,l);const c=t.metadata.type,p={...t,style:id(t,a),metadata:od(t,a)},f=nd[c];return f?f({container:e,component:p,baseUrl:r,state:s,data:a,appState:i,appData:n,labelAlreadyRendered:l}):o`<p ${p?.slot??d}>Unknown metadata type ${c} for component ${p?.id}</p>`};var _e=(e=>(e.HAMBURGUER_MENU="HAMBURGUER_MENU",e.MENU_ON_LEFT="MENU_ON_LEFT",e.MENU_ON_TOP="MENU_ON_TOP",e.TABS="TABS",e.TILES="TILES",e.RAIL="RAIL",e.AUTO="AUTO",e.MEDIATOR="MEDIATOR",e))(_e||{});const zs="mateu-app-context",za="mateu-app-context-labels",Aa=e=>{try{return JSON.parse(localStorage.getItem(e)??"{}")}catch{return{}}},Ws=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},As=()=>Aa(zs),Da=()=>Aa(za),ld=(e,t,r)=>{const s=As(),a=Da();t==null||t===""?(delete s[e],delete a[e]):(s[e]=t,r!==void 0&&(a[e]=r)),Ws(zs,s),Ws(za,a)};let Gs=!1;const dd=()=>{Gs||(Gs=!0,window.addEventListener("storage",e=>{e.key===zs&&e.newValue!==e.oldValue&&window.location.reload()}))},cd=(e,t)=>new Promise((r,s)=>{let a=!1;const i={retry:()=>{a||(a=!0,t().then(r,s))},giveUp:()=>{a||(a=!0,s(e))}},n=new CustomEvent("mateu-session-expired",{detail:i,cancelable:!0,bubbles:!1});typeof document<"u"&&!document.dispatchEvent(n)||i.giveUp()}),ud=(e,t)=>e.includes("json")?!0:t!==null&&typeof t=="object",pd=(e,t)=>{const r=e.finalUrl;if(!r)return;const s=typeof window<"u"?window.location.href:void 0;let a;try{a=new URL(e.requestedUrl,s).href}catch{return}if(a!==r&&!ud(e.contentType??"",e.data))return r};class hd{constructor(){this.windowMs=4e3,this.threshold=12,this.events=[],this.reported=new Set}check(t,r=Date.now()){this.events.push({sig:t,t:r});const s=r-this.windowMs;this.events=this.events.filter(i=>i.t>=s);let a=0;for(const i of this.events)i.sig===t&&a++;if(a>=this.threshold){const i=!this.reported.has(t);return this.reported.add(t),{blocked:!0,firstTrip:i}}return this.reported.delete(t),{blocked:!1,firstTrip:!1}}reset(){this.events=[],this.reported.clear()}configure(t){t.windowMs!==void 0&&(this.windowMs=t.windowMs),t.threshold!==void 0&&(this.threshold=t.threshold)}}const md=new hd;let Kt=[];class fd{constructor(){this.axiosInstance=ki.create({timeout:6e4}),this.axiosInstance.interceptors.request.use(t=>(this.addAuthToken(t),this.addSessionId(t),t)),this.axiosInstance.interceptors.response.use(t=>{const r=pd({requestedUrl:this.axiosInstance.getUri(t.config),finalUrl:t.request?.responseURL,contentType:String(t.headers?.["content-type"]??""),data:t.data});if(r)throw window.location.assign(r),Object.assign(new Error("session lost — redirecting to "+r),{code:"ERR_CANCELED"});return t},t=>{const r=t;if(r?.response?.status===401&&r.config&&!r.config.__mateuRetried){const s=r.config;return s.__mateuRetried=!0,cd(t,()=>this.axiosInstance.request(s))}throw t})}addSessionId(t){let r=sessionStorage.getItem("__mateu_sesion_id");r||(r=$e(),sessionStorage.setItem("__mateu_sesion_id",r)),t.headers["X-Session-Id"]=r}addAuthToken(t){const r=localStorage.getItem("__mateu_auth_token");r&&(t.headers.Authorization="Bearer "+r)}async wrap(t,r,s,a){return s||r.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),t.then(i=>(r.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:a}})),i)).catch(i=>{throw i?.code=="ERR_CANCELED"?r.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{}})):r.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:a,reason:this.serialize(i)}})),i})}serialize(t){return t?.message?t:JSON.stringify(t)}async get(t){const r=new AbortController;return Kt=[...Kt,r],this.axiosInstance.get(t,{signal:r.signal})}async post(t,r){const s=new AbortController;return Kt=[...Kt,s],this.axiosInstance.post(t,r,{signal:s.signal})}async abortAll(){Kt.forEach(t=>t.abort()),Kt=[]}async runAction(t,r,s,a,i,n,l,c,p,f,m){r&&r.startsWith("/")&&(r=r.substring(1));const v=[t,r,s,l??"",a,i].join(""),b=md.check(v);return b.blocked?(await this.abortAll(),b.firstTrip&&console.error("[mateu] request loop detected — aborting repeated request",v),{messages:b.firstTrip?[{title:"",text:"A repeating request was detected and stopped to protect the server. Reload the page or navigate elsewhere.",position:"bottom-end",variant:"error",duration:6e3}]:[],commands:[],fragments:[],banners:[],appendBanners:!1,appData:void 0,appState:void 0}):(n={...As(),...n},await this.wrap(this.post(t+"/mateu/v3/sync/"+(r&&r!=""?r:"_no_route"),{serverSideType:l,appState:n,componentState:c,parameters:p,initiatorComponentId:i,consumedRoute:s,route:r&&r!=""?"/"+r:"",actionId:a}).then(x=>x.data),f,m,a))}}const qt=new fd;var vd=Object.defineProperty,bd=Object.getOwnPropertyDescriptor,Ht=(e,t,r,s)=>{for(var a=s>1?void 0:s?bd(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&vd(t,r,a),a};let Ne=class extends S{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.searchText=""}connectedCallback(){super.connectedCallback(),dd()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(As()[this.selector.fieldName]??"")}currentLabel(){const e=this.currentValue();if(!e)return"—";const t=(this.searchedOptions??this.selector.options)?.find(s=>String(s.value)===e);if(t)return t.label;const r=Da()[this.selector.fieldName];return r!==void 0?String(r):e}pick(e,t){ld(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText="",this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector("input.picker-search")?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){const e=this.app;if(e?.serverSideType)try{const t=await qt.runAction(this.baseUrl??"",e.rootRoute??e.initialRoute??"","",`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(const r of t?.fragments??[]){const i=r.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(i)){this.searchedOptions=i.map(n=>({value:n.value,label:n.label??String(n.value)}));return}}}catch{}}visibleOptions(){const e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(r=>r.label.toLowerCase().includes(t)):e}renderPanel(){const e=this.currentValue(),t=this.visibleOptions(),r=this.searchText!==""||t.length>Ne.SEARCHABLE_THRESHOLD;return o`
            <div class="panel">
                ${r?o`
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
            </label>`:o``}};Ne.SEARCHABLE_THRESHOLD=7;Ne.styles=w`
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
    `;Ht([h()],Ne.prototype,"selector",2);Ht([h()],Ne.prototype,"app",2);Ht([h()],Ne.prototype,"baseUrl",2);Ht([g()],Ne.prototype,"opened",2);Ht([g()],Ne.prototype,"searchText",2);Ht([g()],Ne.prototype,"searchedOptions",2);Ne=Ht([k("mateu-app-context-picker")],Ne);class gd{constructor(){this._dirty=!1,this._installed=!1,this.message="You have unsaved changes. Are you sure you want to leave this page?",this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=t=>{this._dirty&&(t.preventDefault(),t.returnValue="")}}install(){this._installed||(this._installed=!0,document.addEventListener("dirty",this._onDirty),document.addEventListener("clean",this._onClean),window.addEventListener("beforeunload",this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;const t=window.confirm(this.message);return t&&(this._dirty=!1),t}}const Tt=new gd;var yd=Object.defineProperty,$d=Object.getOwnPropertyDescriptor,Cr=(e,t,r,s)=>{for(var a=s>1?void 0:s?$d(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&yd(t,r,a),a};let Lt=class extends S{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.notifications=[],this.fetched=!1}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}updated(){!this.fetched&&this.app?.serverSideType&&(this.fetched=!0,this.refresh())}unreadCount(){return this.notifications.filter(e=>e.unread).length}async runNotificationsAction(e,t){const r=this.app;if(r?.serverSideType)try{const s=await qt.runAction(this.baseUrl??"",r.rootRoute??r.initialRoute??"","",e,"notification-bell",void 0,r.serverSideType,{},t,this,!0);for(const a of s?.fragments??[]){const n=a.data?._notifications;if(Array.isArray(n)){this.notifications=n;return}}}catch{}}refresh(){return this.runNotificationsAction("_notifications-list",{})}markRead(e){return this.runNotificationsAction("_notifications-read",{ids:e})}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.refresh(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))}closePanel(){this.detachOutsideClick(),this.opened=!1}async entryClicked(e){e.unread&&await this.markRead([e.id]);const t=e.route;if(t){if(!Tt.confirmLeave())return;this.closePanel(),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:t},bubbles:!0,composed:!0}))}}renderEntry(e){return o`
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
            </div>`}};Lt.styles=w`
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
    `;Cr([h()],Lt.prototype,"app",2);Cr([h()],Lt.prototype,"baseUrl",2);Cr([g()],Lt.prototype,"opened",2);Cr([g()],Lt.prototype,"notifications",2);Lt=Cr([k("mateu-notification-bell")],Lt);const mt=new Ci,Z={value:{}},Kr={value:{}};class xd{async handle(t,r){return await t.runAction(r.baseUrl,r.route,r.consumedRoute,r.actionId,r.initiatorComponentId,r.appState,r.serverSideType,r.componentState,r.parameters,r.initiator,r.background)}}const wd=new xd,kd={show:e=>console.debug("[mateu] no notifier registered, dropping toast:",e.text)};let Fa=kd;function Cd(e){Fa=e}function zt(e,t){Fa.show(e,t)}class Sd{constructor(){this.handleUIIncrement=(t,r,s)=>{if(t?.fragments?.forEach(a=>{mt.next({command:void 0,fragment:a,ui:void 0,error:void 0,callbackToken:s})}),t?.appState&&(Z.value={...t.appState},r.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const a=t?.appData;Kr.value={...t.appData,...a},r.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}t?.messages?.forEach(a=>{zt({text:a.text,position:a.position,variant:a.variant,duration:a.duration,undoLabel:a.undoLabel,undoActionId:a.undoActionId,undoParameters:a.undoParameters},r)}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(a=>{mt.next({command:a,fragment:void 0,ui:void 0,error:void 0,callbackToken:s})})}}async runAction(t,r,s,a,i,n,l,c,p,f,m,v,b,x,$){try{const _=await wd.handle(t,{baseUrl:r,route:s,consumedRoute:a,actionId:i,appState:Z.value,initiatorComponentId:n,componentState:p,parameters:f,serverSideType:c,initiator:m,background:v});b&&b(_),x||this.handleUIIncrement(_,m,$),_.messages&&_.messages.length==1&&_.messages[0].variant=="error"&&m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:i},bubbles:!0,composed:!0})),m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:i,evevntId:$e()},bubbles:!0,composed:!0}))}catch(_){console.warn("Action request failed",_),m.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:i,reason:this.serialize(_)}})),m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:i},bubbles:!0,composed:!0}))}}serialize(t){return t?.message?t:JSON.stringify(t)}}const _d=new Sd;class Ed{constructor(){this.handleUIIncrement=(t,r,s)=>{if(t?.messages?.forEach(a=>{zt({text:a.text,position:a.position,variant:a.variant,duration:a.duration,undoLabel:a.undoLabel,undoActionId:a.undoActionId,undoParameters:a.undoParameters},r)}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(a=>{mt.next({command:a,fragment:void 0,ui:void 0,error:void 0,callbackToken:s})}),t?.fragments?.forEach(a=>{mt.next({command:void 0,fragment:a,ui:void 0,error:void 0,callbackToken:s})}),t?.appState&&(Z.value={...t.appState},r.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const a=t?.appData;Kr.value={...t.appData,...a},r.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}}}async runAction(t,r,s,a,i,n,l,c,p,f,m,v,b,x,$){if(s){s=s||"_no_route",s&&s.startsWith("/")&&(s=s.substring(1));const _={serverSideType:c,appState:Z.value,componentState:p,parameters:f,initiatorComponentId:n,consumedRoute:a,route:"/"+s,actionId:i};v||m.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),fetch(r+"/mateu/v3/sse/"+s,{method:"POST",headers:{Accept:"text/event-stream","Content-Type":"application/json"},body:JSON.stringify(_)}).then(async P=>{const z=P.body?.pipeThrough(new TextDecoderStream).getReader();if(z){let Y="";for(;;){const{value:se,done:ve}=await z.read();if(ve)break;Y+=se;const Q=Y.split(`

`);Y=Q.pop()??"";for(const ae of Q){const ie=ae.trim();if(ie)if(ie.startsWith("data:")){const Ce=JSON.parse(ie.substring(5).trim());b&&b(Ce),x||this.handleUIIncrement(Ce,m,$),Ce.messages&&Ce.messages.length==1&&Ce.messages[0].variant=="error"&&m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:i},bubbles:!0,composed:!0}))}else{let Ce=ie;try{const C=JSON.parse(ie);Ce=C.message,C._embedded?.errors?.length>0&&C._embedded.errors[0].message&&(Ce=C._embedded.errors[0].message)}catch{}throw new Error(Ce)}}}}v||m.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:i}})),m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:i},bubbles:!0,composed:!0}))}).catch(P=>{m.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:i,reason:this.serialize(P)}})),m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:i},bubbles:!0,composed:!0}))})}}serialize(t){return t?.message?t:JSON.stringify(t)}}const Ma=new Ed,Na=e=>{if(!e||!("querySelectorAll"in e))return null;for(const t of e.querySelectorAll("*")){if(t.tagName?.toLowerCase()==="mateu-component")return t;const r=Na(t.shadowRoot);if(r)return r}return null},Ua=async(e,t,r)=>{const s=t.renderRoot??t,a=Na(s);await Ma.runAction(qt,t.baseUrl??"",e.rootRoute||"_no_route","",r,a?.id??"app-header-action",{},e.serverSideType??"",{},{},a??t,!0,void 0,!1,"")},Ks=async(e,t,r)=>{try{await Ua(e,t,r)}catch(s){zt({text:"La acción falló: "+s,position:"bottomStart",duration:6e3,variant:"error"},t)}},cr=(e,t)=>{const r=e.contextSelectors??[],s=e.contextActions??[];return r.length===0&&s.length===0&&!e.notificationsEnabled?d:o`${e.notificationsEnabled?o`
        <mateu-notification-bell .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-notification-bell>`:d}${r.map(a=>o`
        <mateu-app-context-picker .selector="${a}" .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-app-context-picker>`)}${s.map(a=>(a.children?.length??0)>0?o`
        <details class="mateu-nav-group" style="margin-left: 0.5rem; flex-shrink: 0;">
            <summary class="app-header-action-btn">${a.label} ▾</summary>
            <div class="mateu-nav-panel" style="right: 0; left: auto;">
                ${a.children.map(i=>o`
                    <button class="mateu-nav-item" @click="${()=>i.actionId&&Ks(e,t,i.actionId)}">${i.label}</button>`)}
            </div>
        </details>`:o`
        <button class="app-header-action-btn" style="margin-left: 0.5rem; flex-shrink: 0;"
            @click="${()=>a.actionId&&Ks(e,t,a.actionId)}" title="${a.label}">${a.icon?K(a.icon):d}${a.label}</button>`)}`},Ys=(e,t)=>o`
    <button class="mateu-nav-item ${e.selected?"mateu-nav-item--active":""}"
            ?disabled="${e.disabled}"
            @click="${()=>t(e)}">${e.text}</button>`,Js=(e,t,r="")=>o`
    <nav class="mateu-nav ${r}">
        ${e.map(s=>(s.children?.length??0)>0?o`<details class="mateu-nav-group">
                       <summary class="mateu-nav-item">${s.text} ▾</summary>
                       <div class="mateu-nav-panel">
                           ${s.children.map(a=>Ys(a,t))}
                       </div>
                   </details>`:Ys(s,t))}
    </nav>`,Xs=(e,t)=>r=>t.call(e,{detail:{value:r}}),Ar=(e,t)=>e.themeToggle?o`
        <button class="app-chrome-icon-btn" @click="${t.toggleTheme}"
            title="${t.isDark?"Switch to light mode":"Switch to dark mode"}"
            style="margin-left: 0.5rem; margin-right: 0.5rem; flex-shrink: 0;">
            ${K(t.isDark?"vaadin:sun-o":"vaadin:moon","color: var(--lumo-body-text-color);")}
        </button>
    `:d,Id=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},Qs=(e,t,r)=>{const s=be(e,t,r),a=G(t,r);return s=="list"||s==a?"new":s},be=(e,t,r)=>{const s=e?._route;if(s!=null&&(s===""||s.startsWith("/"))){const a=r.homeRoute??"",i=a.indexOf("?"),n=i>=0?a.substring(i+1):"",l=G(t,r)+s;if(!n)return l;const c=l.indexOf("?")>=0?"&":"?";return l+c+n}return t.selectedRoute?t.selectedRoute:r.homeRoute},G=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,ne=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:t.homeBaseUrl,le=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,de=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,Pd=(e,t,r,s,a,i,n)=>{if(t.chromeless)return o`
            <div class="app chromeless">
                <div class="${"app-content"+(e.pageCompact?" no-padding":"")}" style="height: 100%;">
                    <div class="m-md">
                        <div class="m-scroll" style="height: 100%;">
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${be(s,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${ne(e,t)}"
                                        consumedRoute="${G(e,t)}"
                                        serverSideType="${le(e,t)}"
                                        uriPrefix="${de(e,t)}"
                                        style="width: 100%;"
                                        .appState="${i}"
                                        .appData="${n}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        </div>
                        ${t.sseUrl?o`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:i,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                    </div>
                </div>
                <slot></slot>
            </div>
        `;const l=e.mapItems(t.menu,e.filter?.toLowerCase()??""),c=G(e,t),p=Qs(s,e,t),f=p&&p!=="new"&&p.startsWith(c+"/")?p.substring(c.length+1).split("/")[0]:void 0;return o`
                    ${t.variant==_e.MEDIATOR?o`

                        ${t.layout=="SPLIT"?o`
                            <div class="m-md">
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${G(e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${ne(e,t)}"
                                            consumedRoute="${G(e,t)}"
                                            serverSideType="${le(e,t)}"
                                            uriPrefix="${de(e,t)}"
                                            style="width: 100%;"
                                            .appState="${{...i,_splitDetailId:f}}"
                                            .appData="${n}"
                                            instant="${c}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>
                                <mateu-api-caller slot="detail">
                                    <div style="padding-left: 1rem; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${Qs(s,e,t)}"
                                            id="ux_${e.id}_detail"
                                            baseUrl="${ne(e,t)}"
                                            consumedRoute="${G(e,t)}"
                                            serverSideType="${le(e,t)}"
                                            uriPrefix="${de(e,t)}"
                                            style="width: 100%;"
                                            .appState="${i}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>

                            </div>
                        `:o`
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${be(s,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${ne(e,t)}"
                                        consumedRoute="${G(e,t)}"
                                        serverSideType="${le(e,t)}"
                                        uriPrefix="${de(e,t)}"
                                        style="width: 100%;"
                                        .appState="${i}"
                                        .appData="${n}"
                                        .initialState="${s}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `}
                        
`:d}
            ${t.variant==_e.HAMBURGUER_MENU?o`
                <div class="mateu-app-layout m-app-layout ${t.drawerClosed?"":"drawer-open"} ${t?.cssClasses}" style="${t?.style}">
                    <header class="app-navbar">
                        <button class="drawer-toggle" title="Menu"
                                @click="${m=>m.currentTarget.closest(".m-app-layout")?.classList.toggle("drawer-open")}">
                            ${K("vaadin:menu")}
                        </button>
                        <h2 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; margin: 0 .5rem;">${t.title}</h2><p style="margin: 0;">${t.subtitle}</p>
                        <div class="m-hl" style="margin-left: auto; align-items: center;">
                            <slot name="widgets"></slot>
                            ${cr(t,e)}${Ar(t,e)}
                        </div>
                    </header>
                    <div class="app-body">
                        <aside class="app-drawer p-s" @navigation-requested="${e.updateRoute}">
                            ${t.menu&&t.totalMenuOptions>10?o`
                                <div style="position: sticky; top: 0; z-index: 2; background: var(--lumo-base-color); padding: .25rem 0 .5rem;">
                                    <input class="drawer-search" placeholder="Search…" style="width: calc(100% - 20px); margin: 0 10px;"
                                           @input="${m=>Id({detail:{value:m.target.value}},e)}">
                                </div>
                                `:d}
                            <nav class="side-nav">
                                ${e.renderSideNav(l,void 0)}
                            </nav>
                        </aside>
                        <div class="${"app-content"+(e.pageCompact?" no-padding":"")}" style="flex: 1; min-width: 0;">
                            <div class="m-md">
                                <div class="m-scroll" style="height: 100%;">
                                    <mateu-api-caller>
                                        <mateu-ux
                                                route="${be(s,e,t)}"
                                                id="ux_${e.id}"
                                                baseUrl="${ne(e,t)}"
                                                consumedRoute="${G(e,t)}"
                                                serverSideType="${le(e,t)}"
                                                uriPrefix="${de(e,t)}"
                                                style="width: 100%;"
                                                .appState="${i}"
                                                .appData="${n}"
                                                instant="${e.instant}"
                                                @navigation-requested="${e.updateRoute}"
                                        ></mateu-ux>
                                    </mateu-api-caller>
                                </div>
                                ${t.sseUrl?o`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:i,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                            </div>
                        </div>
                    </div>
                </div>

            `:d}
            
            ${t.variant==_e.MENU_ON_TOP?o`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>e.goHome()}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <div class="m-hl" style="align-items: center;">
                            ${t.logo?o`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:d}
                            ${t.title?o`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:d}
                        </div>
                        </a>
                        ${Js(l,Xs(e,e.itemSelected),"menu-on-top")}
                        <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${cr(t,e)}${Ar(t,e)}
                        </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${be(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${ne(e,t)}"
                                            consumedRoute="${G(e,t)}"
                                            serverSideType="${le(e,t)}"
                                            uriPrefix="${de(e,t)}"
                                            style="width: 100%;"
                                            .appState="${i}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?o`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:i,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </div>
                    </div>
                </div>

            `:d}

            ${t.variant==_e.TILES?o`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>{e.goHome(),e.tilesMenuOption=null}}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <div class="m-hl" style="align-items: center;">
                            ${t.logo?o`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:d}
                            ${t.title?o`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:d}
                        </div>
                        </a>
                        ${Js(e.mapItemsForTiles(t.menu),Xs(e,e.itemSelectedTiles),"menu-on-top")}
                        <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${cr(t,e)}${Ar(t,e)}
                        </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):o`
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${be(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${ne(e,t)}"
                                            consumedRoute="${G(e,t)}"
                                            serverSideType="${le(e,t)}"
                                            uriPrefix="${de(e,t)}"
                                            style="width: 100%;"
                                            .appState="${i}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?o`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:i,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </div>
                        `}
                    </div>
                </div>
            `:d}

            ${t.variant==_e.RAIL?o`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):d}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${be(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${ne(e,t)}"
                                            consumedRoute="${G(e,t)}"
                                            serverSideType="${le(e,t)}"
                                            uriPrefix="${de(e,t)}"
                                            style="width: 100%;"
                                            .appState="${i}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?o`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:i,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </div>
                    </div>
                </div>
            `:d}

            ${t.variant==_e.MENU_ON_LEFT?o`

                <div class="m-hl">
                    <div class="m-scroll" style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <div class="m-vl"
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(m=>e.renderOptionOnLeftMenu(m))}
                            ${cr(t,e)}${Ar(t,e)}
                        </div>
                    </div>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${be(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${ne(e,t)}"
                                            consumedRoute="${G(e,t)}"
                                            serverSideType="${le(e,t)}"
                                            uriPrefix="${de(e,t)}"
                                            style="width: 100%; padding: 1em;"
                                            .appState="${i}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?o`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:i,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </div>
                    </div>
                </div>


            `:d}

            ${t.variant==_e.TABS?o`
                <!--
                
                box-shadow: inset 0 -1px 0 0 var(--lumo-contrast-10pct);
                
                -->
                
                <div>
                    <div>
                        <div class="m-hl" 
                                style="width: 100%;   align-items: center; border-bottom: 1px solid var(--lumo-contrast-10pct);" 
                                theme="spacing"
                                @navigation-requested="${e.updateRoute}">
                            <a href="javascript: void(0);" @click="${()=>e.goHome()}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                            <div class="m-hl" style="align-items: center;">
                                ${t.logo?o`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:d}
                                ${t.title?o`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:d}
                            </div>
                            </a>
                            <nav class="mateu-tabs ${e.component?.cssClasses??""}" style="flex-grow: 1; min-width: 0;">
                                ${t.menu.map((m,v)=>o`
                                <button class="mateu-tab ${v===e.getSelectedIndex(t.menu)?"mateu-tab--active":""}"
                                        @click="${()=>e.selectRoute(m.consumedRoute,m.route,m.actionId,m.baseUrl,m.serverSideType,m.uriPrefix)}"
                                >${m.label}</button>`)}
                            </nav>
                            <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                                <slot name="widgets"></slot>
                                ${cr(t,e)}
                            </div>
                        </div>
                    </div>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${be(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${ne(e,t)}"
                                            consumedRoute="${G(e,t)}"
                                            serverSideType="${le(e,t)}"
                                            uriPrefix="${de(e,t)}"
                                            style="width: 100%;"
                                            .appState="${i}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?o`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:i,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </div>
                    </div>
                </div>
            
            `:d}

            ${t.fabs?.map((m,v)=>o`
                <button class="app-fab" style="bottom: ${(t.sseUrl?5.5:1.5)+v*4}rem; right: 1.5rem;"
                    @click="${()=>e.runAction(m.actionId)}"
                    title="${m.label}">
                    ${K(m.icon)}
                </button>
            `)}
            ${t.sseUrl&&!e.chatOpen?o`
                <button class="ai-fab" @click="${e.showHideIa}" title="Asistente IA">
                    ${K("vaadin:comments-o")}
                </button>
            `:d}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},Td=(e,t)=>t!=null&&e!=null&&!e.has(t),Od=typeof HTMLElement<"u"?HTMLElement:class{};class Rd extends Od{static get observedAttributes(){return["type","renderer"]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){const t=this.getAttribute("type")??"unknown",r=this.getAttribute("renderer")??"unknown";this.shadowRoot||this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
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
                ⚠ Component “${t}” is not supported by the “${r}” renderer yet.
            </div>
        `}}typeof customElements<"u"&&!customElements.get("mateu-unsupported")&&customElements.define("mateu-unsupported",Rd);const Zs=new Set,Ld=(e,t,r)=>{const s=`${r}/${t}`;return Zs.has(s)||(Zs.add(s),console.warn(`[mateu] Component type "${t}" is not supported by the "${r}" renderer — rendering <mateu-unsupported> placeholder.`)),o`<mateu-unsupported
            type="${t}"
            renderer="${r}"
            data-component-id="${e?.id??d}"
            slot="${e?.slot??d}"
    ></mateu-unsupported>`};class zd{renderFilterBar(t,r,s,a,i,n,l,c){const p=r?.metadata,f=v=>{const{fieldId:b,value:x}=v.detail;t.state={...t.state,[b]:x}},m=v=>{const{fieldIds:b}=v.detail,x={};b.forEach($=>{x[$]=void 0}),x.searchText=void 0,t.state={...t.state,...x}};return o`
            <mateu-filter-bar
                .metadata="${p}"
                @search-requested="${t.search}"
                @value-changed="${f}"
                @filter-reset-requested="${m}"
                .state="${t.state}"
                .data="${i}"
                .appState="${n}"
                .appData="${l}"
                ?searchOnly="${c??!1}"
            >
                ${p?.header?.map(v=>y(t,v,s,a,i,n,l))}
            </mateu-filter-bar>
        `}renderPagination(t,r){return o`
        <mateu-pagination
                @page-changed="${t.pageChanged}"
                @fetch-more-elements="${t.fetchMoreElements}"
                .totalElements="${t.data[r?.id]?.page?.totalElements??0}"
                .pageSize="${t.data[r?.id]?.page?.pageSize??10}"
                data-testid="pagination"
                .pageNumber="${t.data[r?.id]?.page?.pageNumber??0}"
        ></mateu-pagination>
        `}renderTableComponent(t,r,s,a,i,n,l){const c=t.data?.[t.id]?.page?.content??[];return $s(r,c,a[r?.id]?.emptyStateMessage)}rendererName(){return this.constructor?.name??"unknown"}supportedClientSideTypes(){}renderClientSideComponent(t,r,s,a,i,n,l,c){const p=r?.metadata?.type??r?.type,f=Object.values(u).includes(p)?p:void 0;return Td(this.supportedClientSideTypes(),f)?Ld(r,f,this.rendererName()):Ls(t,r,s,a,i,n,l,c)}renderAppComponent(t,r,s,a,i,n,l){return Pd(t,r?.metadata,s,a,i,n,l)}}const Ad=76;function ea(e){if(e.weight!=null)return e.weight;const t=e.stereotype??"";if(t==="icon")return 1;if(t==="image")return 4;if(t==="html"||t==="richText"||t==="markdown"||t==="textarea")return 5;if(t==="link")return 2.5;if(t==="combobox"||t==="select")return 2;const r=e.dataType??"";return r==="bool"?1:r==="status"||r==="integer"?1.5:r==="number"||r==="date"||r==="money"?2:r==="dateTime"||r==="dateRange"?2.5:3}function Ba(e,t){if(e.length===0)return"table";const r=e.reduce((c,p)=>c+ea(p),0),s=t/Ad,a=r/s;if(e.length>10)return"masterDetail";if(a<=1.7)return"table";const i=e.filter(c=>c.identifier||(c.priority??Number.MAX_SAFE_INTEGER)<=2),n=i.reduce((c,p)=>c+ea(p),0);return a>2.4?"masterDetail":i.length>0&&n<=8?"list":e.some(c=>c.stereotype==="image"||c.stereotype==="html")||i.length===0&&e.length>=4&&e.length<=8?"cards":"masterDetail"}function Yr(e){return e.filter(t=>t.identifier||(t.priority??Number.MAX_SAFE_INTEGER)<=2).sort((t,r)=>(t.priority??Number.MAX_SAFE_INTEGER)-(r.priority??Number.MAX_SAFE_INTEGER))}function Dd(e){const t=Yr(e);return t.length>0?t:e.slice(0,3)}function Fd(e){const t=e.dataType??"",r=e.stereotype??"";let s;return r==="combobox"||r==="select"?s=2:t==="bool"?s=1:t==="status"||t==="integer"?s=1.5:t==="number"||t==="date"||t==="money"?s=2:t==="dateTime"?s=2.5:s=3,t==="dateRange"?2.5*1.5:r==="listBox"?s*1.5:s}function Md(e){if(e.length===0)return"inline";const t=e.reduce((r,s)=>r+Fd(s),0);return t<=4?"inline":e.length>=6||t>8?"drawer":"popover"}const Nd=e=>!!e&&typeof e=="object"&&"__mateuGroup"in e,vs=e=>String(e??""),Ud=(e,t,r)=>{const s=e??[];if(!t||!r||r.length===0)return s;const a=[];let i,n=!1;return s.forEach((l,c)=>{const p=vs(l?.[t]);if(!n||p!==i){const f=r.find(m=>vs(m.value)===p)??{value:p,count:s.filter(m=>vs(m?.[t])===p).length,aggregates:{}};a.push({__mateuGroup:f,__mateuGroupBy:t,_rowNumber:`__mateuGroup:${c}:${p}`}),n=!0,i=p}a.push(l)}),a},ja=(e,t)=>e==null?"":t.dataType==="money"||t.stereotype==="money"?new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(e):t.aggregate==="count"?new Intl.NumberFormat(void 0,{maximumFractionDigits:0}).format(Math.round(e)):new Intl.NumberFormat(void 0,{maximumFractionDigits:2}).format(e),Bd=(e,t)=>e&&t.includes(e)?e:t.find(r=>!!r),jd=(e,t,r)=>{const s=e.__mateuGroup;return t.id===r?`${s.value} (${s.count})`:t.aggregate?ja(s.aggregates?.[t.id],t):""},qd=(e,t,r)=>{const s=t?.aggregates;if(!s||!e.some(n=>n.aggregate))return;const a={};e.forEach(n=>{n.aggregate&&s[n.id]!=null&&(a[n.id]=ja(s[n.id],n))});const i=e[0];if(i&&a[i.id]===void 0){const n=t?.page?.totalElements;a[i.id]=r&&i.id===r&&n!=null?`Total (${n})`:"Total"}return a};var tt=(e=>(e.NONE="NONE",e.INFO="INFO",e.SUCCESS="SUCCESS",e.WARNING="WARNING",e.DANGER="DANGER",e))(tt||{});const Hd=e=>e===tt.SUCCESS?"8":e===tt.DANGER?"1":e===tt.WARNING?"6":e===tt.INFO?"4":"5",qa=e=>{if(!e)return o``;const t=e.message??String(e);return o`<ui5-tag color-scheme="${Hd(e.type)}">${t}</ui5-tag>`},ta=(e,t)=>{const r=e[t.id];return r==null?"":t.dataType==="bool"||typeof r=="boolean"?r?"✓":"✗":String(typeof r=="object"?r.message??r.label??r.text??r.value??"":r)},Ds=(e,t,r)=>{const s=t.dataType??"",a=t.stereotype??"",i=e[t.id];if(s==="status")return qa(i);if(s==="bool")return i?o`<ui5-icon name="accept"></ui5-icon>`:o`<ui5-icon name="decline"></ui5-icon>`;if(s==="money"||a==="money")return i==null?o``:o`${new Intl.NumberFormat(void 0,{minimumFractionDigits:2}).format(Number(i))}`;if(s==="link"||a==="link"){const n=typeof i=="object"?i?.text??"":i??"",l=t.actionId;if(l)return o`<ui5-link @click="${p=>{p.preventDefault(),r(l,e)}}">${n}</ui5-link>`;const c=typeof i=="object"?i?.href??i?.url??"":"";return o`<a href="${c}">${n}</a>`}if(s==="icon"||a==="icon"){const n=Array.isArray(i)?i:i?String(i).split(","):[];return o`${n.map(l=>o`<ui5-icon name="${l.trim().replace(/^vaadin:|^lumo:/,"")}"></ui5-icon>`)}`}if(a==="html")return o`${Se(i??"")}`;if(a==="image"){const n=typeof i=="object"?i?.url??i?.src??"":i??"";return n?o`<img src="${n}" style="max-height: 3rem; object-fit: contain;" />`:o``}if(a==="button"){const n=t.text??t.label??"",l=t.actionId??t.id;return o`<ui5-button design="Transparent"
            @click="${c=>{c.stopPropagation(),r(l,e)}}"
        >${n}</ui5-button>`}if(s==="action"){const n=typeof i=="object"?i?.text??i?.label??"":"",l=typeof i=="object"?i?.methodNameInCrud??i?.actionId??i?.id??t.id:t.actionId??t.id;return o`<ui5-button design="Transparent"
            @click="${c=>{c.stopPropagation(),r(l,e)}}"
        >${n}</ui5-button>`}if(s==="actionGroup"||s==="menu"){const n=typeof i=="object"&&i?.actions?i.actions:Array.isArray(i)?i:[];return o`${n.map(l=>{const c=l.methodNameInCrud??l.actionId??l.id??"";return o`<ui5-button design="Transparent"
                @click="${p=>{p.stopPropagation(),r(c,e)}}"
            >${l.label??l.text??c}</ui5-button>`})}`}return o`${i??""}`};var Vd=Object.defineProperty,Wd=Object.getOwnPropertyDescriptor,we=(e,t,r,s)=>{for(var a=s>1?void 0:s?Wd(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Vd(t,r,a),a};let ue=class extends S{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.sortField="",this.sortDirection="None",this.availableWidthPx=1024,this.selectedItem=null}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}get cols(){return this.metadata?.columns?.map(e=>e.metadata)??[]}get effectiveGridLayout(){const e=this.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":Ba(this.cols,this.availableWidthPx):t}getRows(){return this.data[this.id]?.page?.content??[]}toggleSort(e){this.sortField!==e?(this.sortField=e,this.sortDirection="Ascending"):this.sortDirection==="Ascending"?this.sortDirection="Descending":(this.sortDirection="None",this.sortField=""),this.dispatchEvent(new CustomEvent("sort-changed",{detail:{sorts:this.sortField?[{fieldId:this.sortField,direction:this.sortDirection==="Ascending"?"ascending":"descending"}]:[]},bubbles:!0,composed:!0}))}dispatchAction(e,t){this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}renderCellValue(e,t){return Ds(e,t,(r,s)=>this.dispatchAction(r,s))}rowKey(e,t){return String(e._rowNumber??t)}selectedRowKeys(){const e=this.getRows();return(this.state[this.id+"_selected_items"]??[]).map(r=>this.rowKey(r,e.indexOf(r))).join(" ")}handleSelectionChange(e){const t=String(e.target?.selected??""),r=new Set(t.split(" ").filter(a=>a!=="")),s=this.getRows();this.state[this.id+"_selected_items"]=s.filter((a,i)=>r.has(this.rowKey(a,i)))}renderTable(e){const t=this.getRows(),r=this.data[this.id],s=this.metadata?.groupBy,a=Ud(t,s,r?.groups),i=qd(e,r,s),n=Bd(s,e.map(p=>p.id)),l="font-weight: 600; color: var(--sapList_TableGroupHeaderTextColor, #32363a); background: var(--sapList_TableGroupHeaderBackground, #efefef);",c="font-weight: 700; border-top: 2px solid var(--sapList_BorderColor, #e5e5e5);";return o`
            <ui5-table
                no-data-text="${this.emptyStateMessage??this.metadata?.emptyStateMessage??"No data."}"
                overflow-mode="Popin"
                style="width: 100%;"
            >
                ${this.metadata?.rowsSelectionEnabled?o`
                    <ui5-table-selection mode="Multiple" slot="features"
                        selected="${this.selectedRowKeys()}"
                        @change="${p=>this.handleSelectionChange(p)}"></ui5-table-selection>
                `:d}

                <ui5-table-header-row slot="headerRow">
                    ${e.map(p=>o`
                        <ui5-table-header-cell
                            width="${p.width??d}"
                            sort-indicator="${p.sortable&&this.sortField===p.id?this.sortDirection:p.sortable?"None":d}"
                            @click="${p.sortable?()=>this.toggleSort(p.id):d}"
                            style="${p.sortable?"cursor: pointer;":d}"
                        >${p.label}</ui5-table-header-cell>
                    `)}
                </ui5-table-header-row>

                ${a.map(p=>Nd(p)?o`
                    <ui5-table-row row-key="${p._rowNumber}">
                        ${e.map(f=>o`
                            <ui5-table-cell style="${l}">${jd(p,f,n)}</ui5-table-cell>
                        `)}
                    </ui5-table-row>
                `:o`
                    <ui5-table-row row-key="${p._rowNumber??t.indexOf(p)}">
                        ${e.map(f=>o`
                            <ui5-table-cell>${this.renderCellValue(p,f)}</ui5-table-cell>
                        `)}
                    </ui5-table-row>
                `)}

                ${i?o`
                    <ui5-table-row row-key="__mateuTotals">
                        ${e.map(p=>o`
                            <ui5-table-cell style="${c}">${i[p.id]??""}</ui5-table-cell>
                        `)}
                    </ui5-table-row>
                `:d}
            </ui5-table>`}renderTwoLineList(e){const t=this.getRows(),r=Yr(e),s=r.find(i=>i.identifier)??r[0],a=r.filter(i=>i!==s);return o`
            <ui5-list no-data-text="${this.emptyStateMessage??"No data."}" style="width: 100%;">
                ${t.map(i=>o`
                    <ui5-li
                        description="${a.map(n=>`${n.label}: ${ta(i,n)}`).join(" · ")}"
                        @click="${()=>this.dispatchAction("_rowClick",i)}"
                        style="cursor: pointer;"
                    >
                        ${s?this.renderCellValue(i,s):o`${i._rowNumber}`}
                    </ui5-li>
                `)}
            </ui5-list>`}renderCards(e){const t=this.getRows(),r=e.slice(0,6),s=r.filter(n=>n.stereotype==="image"),a=r.find(n=>n.identifier)??r[0],i=r.filter(n=>n!==a&&!s.includes(n));return o`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; padding: 0.5rem 0;">
                ${t.map(n=>o`
                    <ui5-card style="cursor: pointer;" @click="${()=>this.dispatchAction("_rowClick",n)}">
                        ${s.length?o`
                            <div slot="header" style="padding: 0.5rem;">
                                ${this.renderCellValue(n,s[0])}
                            </div>
                        `:d}
                        <ui5-card-header
                            title-text="${a?String(n[a.id]??""):""}"
                            slot="header"
                        ></ui5-card-header>
                        <div style="padding: 0.5rem 1rem 1rem; display: flex; flex-direction: column; gap: 0.25rem;">
                            ${i.map(l=>o`
                                <div style="display: flex; gap: 0.5rem; font-size: 0.875rem;">
                                    <span style="color: var(--sapContent_LabelColor, #6a6d70); min-width: 80px;">${l.label}</span>
                                    <span>${this.renderCellValue(n,l)}</span>
                                </div>
                            `)}
                        </div>
                    </ui5-card>
                `)}
            </div>`}renderMasterDetail(e){const t=this.getRows(),r=Yr(e),s=r.find(a=>a.identifier)??r[0];return o`
            <div style="display: flex; gap: 0; height: 100%; min-height: 400px; border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; overflow: hidden;">
                <!-- Left: compact row list -->
                <div style="width: 280px; flex-shrink: 0; border-right: 1px solid var(--sapNeutralBorderColor, #e5e5e5); overflow-y: auto;">
                    <ui5-list no-data-text="${this.emptyStateMessage??"No data."}" style="width: 100%;">
                        ${t.map(a=>o`
                            <ui5-li
                                description="${r.filter(i=>i!==s).map(i=>`${i.label}: ${ta(a,i)}`).join(" · ")}"
                                ?selected="${this.selectedItem===a}"
                                @click="${()=>{this.selectedItem=a}}"
                                style="cursor: pointer;"
                            >
                                ${s?this.renderCellValue(a,s):o`${a._rowNumber}`}
                            </ui5-li>
                        `)}
                    </ui5-list>
                </div>

                <!-- Right: full detail for selected row -->
                <div style="flex: 1; overflow-y: auto; padding: 1rem;">
                    ${this.selectedItem?o`
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${e.map(a=>o`
                                <div style="display: flex; gap: 0.75rem; align-items: baseline;">
                                    <span style="min-width: 140px; color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem;">${a.label}</span>
                                    <span>${this.renderCellValue(this.selectedItem,a)}</span>
                                </div>
                            `)}
                        </div>
                    `:o`
                        <p style="color: var(--sapContent_LabelColor, #6a6d70);">Select a row to view details.</p>
                    `}
                </div>
            </div>`}renderTree(e){const t=this.getRows(),r=e.find(l=>l.dataType!=="action"&&l.dataType!=="actionGroup"&&l.dataType!=="menu")??e[0],s=e.filter(l=>l!==r),a=l=>String(l[r?.id??""]??""),i=l=>s.map(c=>l[c.id]!=null?`${c.label}: ${l[c.id]}`:"").filter(c=>c).join(" · "),n=l=>o`
            <ui5-tree-item
                text="${a(l)}"
                additional-text="${i(l)||d}"
                ?has-children="${(l.children?.length??0)>0}"
                expanded
                @click="${c=>{c.stopPropagation(),this.dispatchAction("_rowClick",l)}}"
            >
                ${l.children?.map(c=>n(c))}
            </ui5-tree-item>`;return o`
            <ui5-tree no-data-text="${this.emptyStateMessage??"No data."}" style="width: 100%;">
                ${t.map(l=>n(l))}
            </ui5-tree>`}render(){const e=this.cols,t=this.effectiveGridLayout;return t==="list"?this.renderTwoLineList(e):t==="cards"?this.renderCards(e):t==="masterDetail"?this.renderMasterDetail(e):t==="tree"?this.renderTree(e):this.renderTable(e)}};we([h()],ue.prototype,"id",2);we([h()],ue.prototype,"metadata",2);we([h()],ue.prototype,"baseUrl",2);we([h()],ue.prototype,"state",2);we([h()],ue.prototype,"data",2);we([h()],ue.prototype,"appState",2);we([h()],ue.prototype,"appData",2);we([h()],ue.prototype,"emptyStateMessage",2);we([g()],ue.prototype,"sortField",2);we([g()],ue.prototype,"sortDirection",2);we([g()],ue.prototype,"availableWidthPx",2);we([g()],ue.prototype,"selectedItem",2);ue=we([k("mateu-sapui5-table")],ue);var Gd=Object.defineProperty,Kd=Object.getOwnPropertyDescriptor,_t=(e,t,r,s)=>{for(var a=s>1?void 0:s?Kd(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Gd(t,r,a),a};let st=class extends S{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.filtersOpen=!1,this.handleKey=e=>{e.code==="Enter"&&(this.filtersOpen=!1,this.triggerSearch())}}createRenderRoot(){return this}get effectiveFiltersLayout(){const e=this.metadata?.filtersLayout??"auto";return e==="auto"?Md(this.metadata?.filters??[]):e}connectedCallback(){super.connectedCallback(),this.metadata?.searchOnEnter&&this.addEventListener("keydown",this.handleKey)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("keydown",this.handleKey)}triggerSearch(){this.dispatchEvent(new CustomEvent("search-requested",{bubbles:!0,composed:!0,detail:{}}))}clearFilters(){const e={};this.metadata?.filters?.forEach(t=>{e[t.fieldId??t.id]=void 0}),e.searchText=void 0,this.state={...this.state,...e},this.metadata?.filters?.forEach(t=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:t.fieldId??t.id},bubbles:!0,composed:!0}))}),this.triggerSearch()}clearSingleFilter(e){this.state={...this.state,[e]:void 0},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:e},bubbles:!0,composed:!0})),this.triggerSearch()}getFilterDisplayValue(e,t){if(e.options?.length){const r=e.options.find(s=>s.value===String(t));if(r)return r.label}return typeof t=="boolean"?t?"Yes":"No":String(t)}renderActiveFilterChips(){const e=(this.metadata?.filters??[]).map(t=>t).filter(t=>{const r=this.state[t.fieldId];return r!=null&&r!==""});return e.length===0?d:o`
            <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; padding: 0.25rem 0;">
                ${e.map(t=>o`
                    <ui5-token
                        text="${t.label}: ${this.getFilterDisplayValue(t,this.state[t.fieldId])}"
                        @ui5-delete="${()=>this.clearSingleFilter(t.fieldId)}"
                    ></ui5-token>
                `)}
            </div>`}wrapFilter(e){return{id:e.fieldId??"",metadata:{...e},type:j.ClientSide,style:"",children:[],slot:"",cssClasses:"",initialData:{}}}renderFilterControls(){return o`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; padding: 0.75rem 0;">
                ${this.metadata?.filters?.map(e=>y(this,this.wrapFilter(e),this.baseUrl,this.state,this.data,this.appState,this.appData))}
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end; padding-bottom: 0.5rem;">
                <ui5-button @click="${()=>{this.filtersOpen=!1,this.clearFilters()}}">Clear</ui5-button>
                <ui5-button design="Emphasized" @click="${()=>{this.filtersOpen=!1,this.triggerSearch()}}">Search</ui5-button>
            </div>`}renderInlineFilters(){return o`
            ${this.metadata?.filters?.map(e=>y(this,this.wrapFilter(e),this.baseUrl,this.state,this.data,this.appState,this.appData))}`}renderDrawer(){return o`
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
                        @input="${r=>{this.state.searchText=r.target.value}}"
                        @keydown="${r=>{r.code==="Enter"&&this.triggerSearch()}}"
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
        `}};_t([h()],st.prototype,"metadata",2);_t([h()],st.prototype,"baseUrl",2);_t([h()],st.prototype,"state",2);_t([h()],st.prototype,"data",2);_t([h()],st.prototype,"appState",2);_t([h()],st.prototype,"appData",2);_t([g()],st.prototype,"filtersOpen",2);st=_t([k("mateu-sapui5-filter-bar")],st);var Yd=Object.defineProperty,Jd=Object.getOwnPropertyDescriptor,Sr=(e,t,r,s)=>{for(var a=s>1?void 0:s?Jd(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Yd(t,r,a),a};let Zt=class extends S{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.pages=[]}createRenderRoot(){return this}updated(e){if(super.updated(e),e.has("totalElements")||e.has("pageNumber")||e.has("pageSize")){const t=[],s=Math.ceil(this.totalElements/this.pageSize)-1;this.totalElements>0&&(this.pageNumber>0&&t.push({pageNumber:0,text:"«",clickable:!0}),this.pageNumber>1&&t.push({pageNumber:this.pageNumber-1,text:"‹",clickable:!0}),t.push({pageNumber:this.pageNumber,text:`${this.pageNumber+1}`,clickable:!1}),this.pageNumber<s-1&&t.push({pageNumber:this.pageNumber+1,text:"›",clickable:!0}),this.pageNumber<s&&t.push({pageNumber:s,text:"»",clickable:!0})),this.pages=t}}goToPage(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){return this.totalElements?o`
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
        `:o``}};Sr([h({type:Number})],Zt.prototype,"totalElements",2);Sr([h({type:Number})],Zt.prototype,"pageSize",2);Sr([h({type:Number})],Zt.prototype,"pageNumber",2);Sr([g()],Zt.prototype,"pages",2);Zt=Sr([k("mateu-sapui5-pagination")],Zt);const Xd=(e,t,r,s)=>{const a=e.metadata;return o`<ui5-button
                    part="button"
                    @click=${Wp}
                    data-action-id="${a.actionId}"
                    slot="${e.slot}"
            >${a.label}</ui5-button>`};var Qd=Object.defineProperty,Zd=Object.getOwnPropertyDescriptor,_r=(e,t,r,s)=>{for(var a=s>1?void 0:s?Zd(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Qd(t,r,a),a};const ec=(e,t)=>{if(!e)return;if(Array.isArray(e)){const s=e.find(a=>a.key==t);return s?.value!=null?String(s.value):void 0}const r=e[t];return r!=null?String(r):void 0};let yt=class extends S{constructor(){super(...arguments),this.fieldId="",this.editable=!0,this.filePicked=e=>{const t=e.target,r=t.files?.[0];if(!r)return;const s=new FileReader;s.onload=()=>{const a=s.result,i=a.indexOf(","),n=a.substring(0,i).replace(";base64",`;name=${encodeURIComponent(r.name)};base64`);this.emit(n+a.substring(i))},s.readAsDataURL(r),t.value=""}}static fileName(e){if(!e)return"";if(e.startsWith("data:")){const t=e.indexOf(","),s=e.substring(5,t<0?e.length:t).split(";").find(a=>a.startsWith("name="));if(s)try{return decodeURIComponent(s.substring(5))}catch{return s.substring(5)}return"Attached file"}return e.split("/").pop()||e}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}triggerPick(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="",t=yt.fileName(this.value),r=e&&this.value.startsWith("data:"),s=e?o`<span class="file" title="${t}">📄 ${r?o`<a href="${this.value}" download="${t}">${t}</a>`:o`<a href="${this.value}" target="_blank">${t}</a>`}</span>`:d;return this.editable?o`
            <input type="file" accept="${this.accept||d}" style="display: none;"
                   @change="${this.filePicked}">
            <div class="row">
                ${s}
                <button class="button" @click="${this.triggerPick}">
                    ${e?"Replace":"Choose file"}
                </button>
                ${e?o`
                    <button class="button button--danger" @click="${()=>this.emit("")}">Remove</button>`:d}
            </div>`:o`${e?s:o`<span class="empty">—</span>`}`}};yt.styles=w`
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
    `;_r([h()],yt.prototype,"fieldId",2);_r([h()],yt.prototype,"value",2);_r([h()],yt.prototype,"accept",2);_r([h({type:Boolean})],yt.prototype,"editable",2);yt=_r([k("mateu-file-upload")],yt);const tc=e=>{const t=e.target,r=e.detail?.selectedOption,s=r?.value??r?.textContent?.trim()??"";t.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s,fieldId:t.id},bubbles:!0,composed:!0}))},rc=e=>{const t=e.target,s=(e.detail?.items??[]).map(a=>a.dataset?.value??a.text);t.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s,fieldId:t.id},bubbles:!0,composed:!0}))},ye=(e,t,r)=>{e?.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r,fieldId:t},bubbles:!0,composed:!0}))},Cs=(e,t,r)=>{e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:r},bubbles:!0,composed:!0}))},as=e=>(e??"").replace(/^vaadin:/,"").replace(/^lumo:/,""),I=(e,t,r,s,a,i="")=>o`
    <div style="${i}${e.style??""}" data-field-id="${t.fieldId??d}">
        ${s?o`<ui5-label for="${r}" show-colon ?required="${t.required}">${s}</ui5-label>`:d}
        ${a}
        ${t.description?o`
            <div style="font-size: 0.75rem; color: var(--sapContent_LabelColor, #6a6d70); margin-top: 0.125rem;">${t.description}</div>
        `:d}
    </div>`,Jr=(e,t)=>{const r=e!=null?String(e):"";return!t||r.length<=15?d:o`<ui5-icon
        slot="icon"
        name="copy"
        style="cursor: pointer;"
        @click="${()=>navigator.clipboard.writeText(r).catch(()=>{})}"
    ></ui5-icon>`},Ha=(e,t)=>{const r=typeof e=="number"?e:parseFloat(String(e));return isNaN(r)?String(e):t&&t.locale&&t.currency?new Intl.NumberFormat(t.locale,{style:"currency",currency:t.currency}).format(r):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(r)},ra=new WeakMap,Va=(e,t,r,s,a)=>{const i=a?.[r]??a?.[s],n=i?.content??(Array.isArray(i)?i:void 0);if(n)return n;const l=t.remoteCoordinates?.action;if(l){let c=ra.get(e);c||(c=new Set,ra.set(e,c)),c.has(s)||(c.add(s),setTimeout(()=>Cs(e,l,{searchText:"",fieldId:s,size:200,page:0,sort:void 0})))}return[]},Ge=(e,t,r,s,a)=>t.remoteCoordinates?Va(e,t,r,s,a):t.options??[],sa=(e,t,r,s)=>o`
    <ui5-select
        id="${t}"
        ?disabled="${e.disabled}"
        @change="${tc}"
        style="width: 100%;"
    >
        ${e.required?d:o`<ui5-option value="">-- Select --</ui5-option>`}
        ${s.map(a=>o`
            <ui5-option value="${a.value}" ?selected="${r===a.value}">${a.label}</ui5-option>
        `)}
    </ui5-select>`,aa=(e,t,r,s)=>{const a=s.find(i=>i.value===r);return o`
        <ui5-combobox
            id="${t}"
            value="${a?.label??r??""}"
            ?disabled="${e.disabled}"
            ?readonly="${e.readOnly}"
            @selection-change="${i=>{const n=i.detail?.item;ye(i.target,e.fieldId,n?.dataset?.value??n?.text)}}"
            style="width: 100%;"
        >
            ${s.map(i=>o`
                <ui5-cb-item text="${i.label??i}" data-value="${i.value??i}"></ui5-cb-item>
            `)}
        </ui5-combobox>`},sc=(e,t,r)=>o`
    <div style="display: flex; flex-wrap: wrap; gap: 0.25rem 1rem;">
        ${r.map(s=>o`
            <div style="display: flex; align-items: center; gap: 0.25rem;">
                ${s.icon?o`<ui5-icon name="${as(s.icon)}"></ui5-icon>`:d}
                ${s.image?o`<img src="${s.image}" alt="${s.label}" style="height: 1rem;" />`:d}
                <ui5-radio-button
                    name="rg-${e.fieldId}"
                    text="${s.label}"
                    ?checked="${t===s.value}"
                    ?disabled="${e.disabled}"
                    @change="${a=>{a.target.checked&&ye(a.target,e.fieldId,s.value)}}"
                ></ui5-radio-button>
                ${s.description?o`<span style="font-size: 0.8125rem; color: var(--sapContent_LabelColor, #6a6d70);">${s.description}</span>`:d}
            </div>
        `)}
    </div>`,ac=(e,t)=>r=>{const a=(r.detail?.selectedItems??[]).map(i=>i.dataset?.value);ye(r.target,e,t?a:a[0])},Wa=(e,t,r,s)=>{const a=i=>s?Array.isArray(t)&&t.includes(i.value):t===i.value;return o`
        <ui5-list
            selection-mode="${s?"Multiple":"Single"}"
            @selection-change="${ac(e.fieldId,s)}"
            style="width: 100%; border: 1px solid var(--sapField_BorderColor, #89919a); border-radius: 0.25rem;"
        >
            ${r.map(i=>o`
                <ui5-li
                    data-value="${i.value}"
                    ?selected="${a(i)}"
                    description="${i.description??d}"
                    icon="${i.icon?as(i.icon):d}"
                >${i.label}</ui5-li>
            `)}
        </ui5-list>`},Ss=(e,t,r,s)=>o`
    <div style="display: flex; gap: 0.75rem; padding: 0.25rem 0; flex-wrap: wrap;">
        ${r.map(a=>{const i=s?Array.isArray(t)&&t.includes(a.value):t==a.value,n=()=>{if(!s)return a.value;const l=Array.isArray(t)?t:[];return l.includes(a.value)?l.filter(c=>c!==a.value):[...l,a.value]};return o`
                <div role="button" tabindex="0"
                     style="min-width: 10rem; min-height: 3rem; padding: 0.75rem 1rem; cursor: pointer; border-radius: 0.5rem; border: 1px solid ${i?"var(--sapButton_Selected_BorderColor, #0064d9)":"var(--sapNeutralBorderColor, #e5e5e5)"}; background: ${i?"var(--sapList_SelectionBackgroundColor, #e5f0fa)":"transparent"};"
                     @click="${l=>ye(l.target,e.fieldId,n())}"
                >
                    <div style="display: flex; align-items: center; gap: 0.5rem; pointer-events: none;">
                        ${a.icon?o`<ui5-icon name="${as(a.icon)}"></ui5-icon>`:d}
                        ${a.image?o`<img src="${a.image}" alt="${a.label}" style="${a.imageStyle??"width: 2rem;"}" />`:d}
                        <div>
                            <div>${a.label}</div>
                            ${a.description?o`
                                <div style="font-size: 0.8125rem; color: var(--sapContent_LabelColor, #6a6d70);">${a.description}</div>
                            `:d}
                        </div>
                    </div>
                </div>`})}
    </div>`,ic=(e,t,r)=>{const s=(e.optionsColumns??0)>1,a=i=>n=>{const l=Array.isArray(t)?t:[],p=n.target.checked?[...l.filter(f=>f!==i),i]:l.filter(f=>f!==i);ye(n.target,e.fieldId,p)};return o`
        <div style="display: ${s?"grid; grid-template-columns: repeat(3, 1fr); gap: 0.25rem 2rem":"flex; flex-direction: column"};">
            ${r.map(i=>o`
                <ui5-checkbox
                    text="${i.label}"
                    ?checked="${Array.isArray(t)&&t.includes(i.value)}"
                    ?disabled="${e.disabled}"
                    ?readonly="${e.readOnly}"
                    @change="${a(i.value)}"
                ></ui5-checkbox>
            `)}
        </div>`},oc=(e,t,r)=>{let s=e;return isNaN(s)&&(s=0),o`<div style="display: flex; align-items: center; gap: 0.25rem;">
        ${[1,2,3,4,5].map(i=>o`
            <ui5-icon
                name="${i<=s?"favorite":"unfavorite"}"
                style="cursor: ${r?"default":"pointer"}; color: ${i<=s?"var(--sapIndicationColor_5)":"var(--sapContent_NonInteractiveIconColor)"}; font-size: 1.5rem;"
                @click="${r?d:n=>ye(n.target,t,i)}"
            ></ui5-icon>
        `)}
    </div>`},nc=e=>t=>{const r=t.target,s=r.files?.[0];if(!s)return;const a=new FileReader;a.onload=()=>ye(r,e,a.result),a.readAsDataURL(s),r.value=""},lc=e=>t=>{t.target.getRootNode().querySelector(`#${CSS.escape(e)}`)?.click()},dc=(e,t,r)=>{const s=r!=null&&r!=="",a=`${t}_file`;return o`
        <div style="display: flex; flex-direction: column; align-items: stretch; gap: 0.5rem; max-width: 320px;">
            ${s?o`
                <img src="${r}"
                     style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; ${e.style??""}">
            `:o`
                <div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--sapNeutralBorderColor, #b3b3b3); border-radius: 0.5rem; color: var(--sapContent_LabelColor, #6a6d70);">
                    <ui5-icon name="picture" style="height: 2rem; width: 2rem;"></ui5-icon>
                </div>
            `}
            <input type="file" id="${a}" accept="image/*" style="display: none;" @change="${nc(e.fieldId)}">
            <div style="display: flex; gap: 0.5rem;">
                <ui5-button icon="upload" @click="${lc(a)}">${s?"Replace":"Upload"}</ui5-button>
                ${s?o`
                    <ui5-button design="Transparent" icon="delete"
                        @click="${i=>ye(i.target,e.fieldId,"")}"
                    >Delete</ui5-button>`:d}
            </div>
        </div>`},cc=(e,t)=>{const r=Array.isArray(t)?t:[],s=e.columns.map(n=>n.metadata),a={},i=(n,l)=>a.el?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:n,parameters:{_clickedRow:l}},bubbles:!0,composed:!0}));return o`
        <div style="overflow-x: auto;">
        <ui5-table style="width: 100%; min-width: ${Math.max(s.length*7,24)}rem; margin-top: 0.5rem;" ${$i(n=>{a.el=n})}>
            <ui5-table-header-row slot="headerRow">
                ${s.map(n=>o`
                    <ui5-table-header-cell width="${n.width??d}">${n.label}</ui5-table-header-cell>
                `)}
            </ui5-table-header-row>
            ${r.map((n,l)=>o`
                <ui5-table-row row-key="${n._rowNumber??l}">
                    ${s.map(c=>o`
                        <ui5-table-cell>${Ds(n,c,i)}</ui5-table-cell>
                    `)}
                </ui5-table-row>
            `)}
        </ui5-table>
        </div>`},uc=(e,t,r)=>{const s=t===!0||t==="true";return o`
        <div style="${e.style??d}">
            <ui5-tag color-scheme="${s?"8":d}" style="${s?"":"opacity: 0.4;"}">${r}</ui5-tag>
        </div>`},pc=(e,t,r,s,a,i,n)=>{let l=Jt(s,i,n);const c=l&&typeof l=="object"&&"value"in l?l:null;l&&l.value&&(l=l.value);const p=t.dataType=="bool"||l===!0||l===!1,f=t.dataType=="money",m=l!=null&&l!=="";let v=m?String(l):"—";f&&m&&(v=Ha(l,c));const b=p?o`<ui5-icon name="${l===!0||l==="true"?"accept":"less"}" style="height: 16px; width: 16px;"></ui5-icon>`:t.multiline?o`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${v}</span>`:o`<span style="display: block; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${f?" font-variant-numeric: tabular-nums;":""}">${v}</span>`;return I(e,t,r,a,b,f?"text-align: right; ":"")},hc=(e,t,r,s,a,i,n)=>{let l=Jt(s,i,n)||n?.[t.fieldId];return l&&l.value&&(l=l.value),t.stereotype=="image"||t.stereotype=="uploadableImage"?I(e,t,r,a,o`<img src="${l}" id="${r}_img" style="${t.style??d}">`):t.stereotype=="fileUpload"?I(e,t,r,a,o`
            <mateu-file-upload .fieldId="${t.fieldId}" .value="${l}" .editable="${!1}"></mateu-file-upload>`):t.dataType=="bool"?I(e,t,r,a,o`<ui5-icon name="${l?"accept":"less"}" style="height: 20px;"></ui5-icon>`):t.stereotype=="link"?I(e,t,r,a,o`<ui5-link href="${l??""}" target="_blank">${l??""}</ui5-link>`):t.stereotype=="color"?I(e,t,r,a,o`<span style="background-color: ${l}; display: block; height: 20px; width: 40px; border: 1px solid var(--sapContent_LabelColor, #6a6d70); border-radius: 0.25rem;"></span>`):I(e,t,r,a,o`
        <ui5-input
            id="${r}"
            readonly
            value="${l??""}"
            style="width: 100%;"
        >${Jr(l,!0)}</ui5-input>`)},mc=(e,t,r,s,a,i,n)=>{const l=r.fieldId??"";if(r.stereotype=="searchable"){const p=m=>Cs(m.currentTarget,"code-"+l,{code:m.currentTarget.value}),f=m=>Cs(m.currentTarget,"codesearch-"+l,{});return I(t,r,s,i,o`
            <div style="display: flex; gap: 0.33rem; align-items: center;">
                <ui5-input style="width: 5rem;" value="${a??""}" @change="${p}"></ui5-input>
                <ui5-input readonly value="${n?.[l+"-label"]??""}" style="flex: 1;"></ui5-input>
                <ui5-button icon="search" @click="${f}"></ui5-button>
            </div>`)}if(r.stereotype=="select"){const p=a&&a.value?a.value:a;return I(t,r,s,i,sa(r,s,p,Ge(e,r,s,l,n)))}if(r.stereotype=="markdown")return I(t,r,s,i,o`
            <mateu-markdown .content="${a??""}"></mateu-markdown>`);if(r.stereotype=="combobox")return I(t,r,s,i,aa(r,s,a,Ge(e,r,s,l,n)));if(r.stereotype=="listBox")return I(t,r,s,i,Wa(r,a,Ge(e,r,s,l,n),!1));if(r.stereotype=="radio")return I(t,r,s,i,sc(r,a,Ge(e,r,s,l,n)));if(r.stereotype=="popover"){const p=Ge(e,r,s,l,n),f=`${s}_popover`,m=b=>{const $=b.target.getRootNode().querySelector(`#${CSS.escape(f)}`);$&&($.opener=b.currentTarget,$.open=!$.open)},v=p.find(b=>b.value===a)?.label??a??"";return I(t,r,s,i,o`
            <div style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;" @click="${m}">
                <span>${v}</span>
                <ui5-icon name="slim-arrow-down"></ui5-icon>
            </div>
            <ui5-popover id="${f}" placement="Bottom">
                ${Ss(r,a,p,!1)}
            </ui5-popover>`)}if(r.stereotype=="choice")return I(t,r,s,i,Ss(r,a,Ge(e,r,s,l,n),!1));if(r.stereotype=="richText"||r.stereotype=="richtext")return I(t,r,s,i,o`
            <ui5-textarea
                id="${s}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                @change="${ge}"
                value="${a??""}"
                growing
                growing-max-lines="10"
                style="width: 100%;"
            ></ui5-textarea>`);if(r.stereotype=="textarea")return I(t,r,s,i,o`
            <ui5-textarea
                id="${s}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                @change="${ge}"
                value="${a??""}"
                maxlength="${r.charLimit??d}"
                growing
                growing-max-lines="5"
                style="width: 100%;"
            ></ui5-textarea>`);if(r.stereotype=="link")return I(t,r,s,i,o`
            <ui5-input
                id="${s}"
                ?disabled="${r.disabled}"
                value="${a??""}"
                @change="${ge}"
                style="width: 100%;"
            ><ui5-icon
                slot="icon"
                name="chain-link"
                style="cursor: pointer;"
                @click="${()=>a&&window.open(a,"_blank")?.focus()}"
            ></ui5-icon></ui5-input>`);if(r.stereotype=="icon")return I(t,r,s,i,o`
            <ui5-input
                id="${s}"
                ?disabled="${r.disabled}"
                value="${a??""}"
                @change="${ge}"
                style="width: 100%;"
            >${a?o`<ui5-icon slot="icon" name="${as(a)}"></ui5-icon>`:d}</ui5-input>`);if(r.stereotype=="html")return I(t,r,s,i,o`
            <div style="line-height: 20px; margin-top: 5px;">${Se(""+(a??""))}</div>`);if(r.stereotype=="image")return I(t,r,s,i,o`
            <img src="${a??""}" style="${t.style??d}" class="${t.cssClasses??d}">`);if(r.stereotype=="uploadableImage")return I(t,r,s,i,dc(r,s,a));if(r.stereotype=="fileUpload")return I(t,r,s,i,o`
            <mateu-file-upload
                .fieldId="${r.fieldId}" .value="${a}"
                .accept="${ec(r.attributes,"accept")}"></mateu-file-upload>`);if(r.stereotype=="color")return I(t,r,s,i,o`
            <input type="color" value="${a??"#000000"}" ?disabled="${r.disabled}"
                   style="display: block; height: 2rem; width: 4rem; border: 1px solid var(--sapField_BorderColor, #89919a); border-radius: 0.25rem; background: transparent; cursor: pointer;"
                   @input="${p=>ye(p.target,l,p.target.value)}"/>`);if(r.options&&r.options.length>0)return I(t,r,s,i,sa(r,s,a,r.options));if(r.remoteCoordinates)return I(t,r,s,i,aa(r,s,a,Va(e,r,s,l,n)));const c=(()=>{switch(r.stereotype){case"email":return"Email";case"password":return"Password";case"url":return"URL";case"phone":case"tel":return"Tel";case"search":return"Search";default:return"Text"}})();return I(t,r,s,i,o`
        <ui5-input
            id="${s}"
            type="${c}"
            ?disabled="${r.disabled}"
            ?readonly="${r.readOnly}"
            value="${a??""}"
            @change="${ge}"
            maxlength="${r.charLimit??d}"
            placeholder="${r.placeholder??d}"
            style="width: 100%;"
        >${Jr(a,r.readOnly)}</ui5-input>`)},fc=(e,t,r,s,a)=>{const i=t.metadata,n=i?.fieldId??"",l=s&&n in s?s[n]:i?.initialValue,c=t.id||n,p=i.label+"",f=Bt(p,s,a),m=!f||f=="null"||f=="undefined"?void 0:f,v=i.dataType,b=i.stereotype;if(b=="badge")return uc(t,l,m??i.fieldId??"");if(b=="plainText")return pc(t,i,c,l,m,s,a);if(i.readOnly&&b!="grid"&&v!="status"&&v!="money")return hc(t,i,c,l,m,s,a);if(b=="grid"&&i.columns&&i.columns.length>0)return I(t,i,c,m,cc(i,l));if(v=="file"||b=="file")return I(t,i,c,m,o`
            <ui5-file-uploader id="${c}" ?disabled="${i.disabled}" @change="${ge}">
                <ui5-button icon="upload">Upload</ui5-button>
            </ui5-file-uploader>`);if(v=="dateRange"){const x=l?`${l.from} - ${l.to}`:"";return I(t,i,c,m,o`
            <ui5-daterange-picker
                id="${c}"
                ?disabled="${i.disabled}"
                ?readonly="${i.readOnly}"
                format-pattern="yyyy-MM-dd"
                value="${x}"
                @change="${$=>{const _=$.target,P=se=>se?`${se.getFullYear()}-${String(se.getMonth()+1).padStart(2,"0")}-${String(se.getDate()).padStart(2,"0")}`:void 0,z=P(_.startDateValue),Y=P(_.endDateValue);ye($.target,n,z&&Y?{from:z,to:Y}:void 0)}}"
                style="width: 100%;"
            ></ui5-daterange-picker>`)}if(v=="date"||v=="LocalDate")return I(t,i,c,m,o`
            <ui5-date-picker
                id="${c}"
                ?disabled="${i.disabled}"
                ?readonly="${i.readOnly}"
                format-pattern="yyyy-MM-dd"
                value="${l??""}"
                @change="${ge}"
                style="width: 100%;"
            ></ui5-date-picker>`);if(v=="dateTime"||v=="datetime"||v=="LocalDateTime"||v=="ZonedDateTime")return I(t,i,c,m,o`
            <ui5-datetime-picker
                id="${c}"
                ?disabled="${i.disabled}"
                ?readonly="${i.readOnly}"
                value="${l??""}"
                @change="${ge}"
                style="width: 100%;"
            ></ui5-datetime-picker>`);if(v=="time"||v=="LocalTime")return I(t,i,c,m,o`
            <ui5-time-picker
                id="${c}"
                ?disabled="${i.disabled}"
                ?readonly="${i.readOnly}"
                value="${l??""}"
                @change="${ge}"
                style="width: 100%;"
            ></ui5-time-picker>`);if(v=="number"||b=="currency")return I(t,i,c,m,o`
            <ui5-input
                id="${c}"
                type="Number"
                ?disabled="${i.disabled}"
                ?readonly="${i.readOnly}"
                value="${l??""}"
                @change="${ge}"
                style="width: 100%;"
            >${Jr(l,i.readOnly)}</ui5-input>`);if(v=="integer")return b=="stars"?I(t,i,c,m,oc(l,n,i.disabled)):b=="slider"?I(t,i,c,m,o`
                <ui5-slider
                    id="${c}"
                    min="${i.sliderMin??0}"
                    max="${i.sliderMax??100}"
                    step="${i.step??1}"
                    value="${l??0}"
                    ?disabled="${i.disabled}"
                    show-tooltip
                    @change="${ge}"
                    style="width: 100%;"
                ></ui5-slider>`):i.stepButtonsVisible?I(t,i,c,m,o`
                <ui5-step-input
                    id="${c}"
                    ?disabled="${i.disabled}"
                    ?readonly="${i.readOnly}"
                    value="${l??0}"
                    min="${i.min??d}"
                    max="${i.max??d}"
                    step="${i.step??d}"
                    @change="${ge}"
                    style="width: 100%;"
                ></ui5-step-input>`):I(t,i,c,m,o`
            <ui5-input
                id="${c}"
                type="Number"
                ?disabled="${i.disabled}"
                ?readonly="${i.readOnly}"
                value="${l??""}"
                @change="${ge}"
                style="width: 100%;"
            >${Jr(l,i.readOnly)}</ui5-input>`);if(v=="bool"||v=="boolean"||v=="Boolean")return b=="toggle"?o`
                <div style="display: flex; align-items: center; gap: 0.5rem; ${t.style??""}">
                    <ui5-label for="${c}" ?required="${i.required}">${m}</ui5-label>
                    <ui5-switch
                        id="${c}"
                        ?checked="${l}"
                        ?disabled="${i.disabled}"
                        @change="${ha}"
                    ></ui5-switch>
                </div>`:o`
            <div style="${t.style??d}">
                <ui5-checkbox
                    id="${c}"
                    text="${m??""}"
                    ?checked="${l}"
                    ?disabled="${i.disabled}"
                    ?readonly="${i.readOnly}"
                    @change="${ha}"
                ></ui5-checkbox>
            </div>`;if(v=="array"){if(b=="choice")return I(t,i,c,m,Ss(i,l,Ge(e,i,c,n,a),!0));if(b=="listBox")return I(t,i,c,m,Wa(i,l,Ge(e,i,c,n,a),!0));if(b=="combobox"){const x=Ge(e,i,c,n,a),$=Array.isArray(l)?l:[];return I(t,i,c,m,o`
                <ui5-multi-combobox
                    id="${c}"
                    ?disabled="${i.disabled}"
                    ?readonly="${i.readOnly}"
                    @selection-change="${rc}"
                    style="width: 100%;"
                >
                    ${x.map(_=>o`
                        <ui5-mcb-item
                            text="${_.label??_}"
                            data-value="${_.value??_}"
                            ?selected="${$.includes(_.value??_)}"
                        ></ui5-mcb-item>
                    `)}
                </ui5-multi-combobox>`)}return I(t,i,c,m,ic(i,l,Ge(e,i,c,n,a)))}if(v=="money"||b=="money"){if(i.readOnly){const P=l&&typeof l=="object"&&"value"in l?l:null,z=P?P.value:l;return I(t,i,c,m,o`
                <div style="min-width: 8rem; text-align: right; font-variant-numeric: tabular-nums;">${l!=null?Ha(z,P):""}</div>`)}const x=l&&typeof l=="object"&&"value"in l?l:{value:typeof l=="number"?l:parseFloat(String(l??0))||0,currency:"EUR",locale:"es-ES"},$=P=>{const z=P.detail?.selectedOption;ye(P.target,n,{...x,currency:z?.value??z?.textContent?.trim()??x.currency})},_=P=>{const z=P.target.value;ye(P.target,n,{...x,value:z?parseFloat(z):0})};return I(t,i,c,m,o`
            <div style="display: flex; gap: 0.25rem;">
                <ui5-select style="width: 6rem;" ?disabled="${i.disabled}" @change="${$}">
                    ${["EUR","USD","GBP"].map(P=>o`
                        <ui5-option value="${P}" ?selected="${x.currency===P}">${P}</ui5-option>
                    `)}
                </ui5-select>
                <ui5-input
                    id="${c}"
                    type="Number"
                    ?disabled="${i.disabled}"
                    value="${x.value??""}"
                    @change="${_}"
                    style="flex: 1; text-align: right;"
                ></ui5-input>
            </div>`)}if(v=="status")return I(t,i,c,m,qa(l));if(v=="range"){const x=l;return I(t,i,c,m,o`
            <ui5-range-slider
                start-value="${x?.from??0}"
                end-value="${x?.to??0}"
                min="${i.sliderMin??0}"
                max="${i.sliderMax??10}"
                step="${i.step||d}"
                ?disabled="${i.disabled}"
                @change="${$=>{const _=$.target;ye($.target,n,{from:_.startValue,to:_.endValue})}}"
                style="min-width: 10rem; width: 100%;"
            ></ui5-range-slider>`)}return mc(e,t,i,c,l,m,a)};var $r=(e=>(e.Add="Add",e.Replace="Replace",e.ReplaceKeepData="ReplaceKeepData",e))($r||{}),vc=Object.defineProperty,Ga=(e,t,r,s)=>{for(var a=void 0,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=n(t,r,a)||a);return a&&vc(t,r,a),a};class is extends S{constructor(){super(...arguments),this.id="",this.baseUrl="",this.callbackToken="",this.createElement=t=>{const r=t.data,s=document.createElement(r.name);for(let a in r.attributes)s.setAttribute(a,r.attributes[a]);for(let a in r.on)s.addEventListener(a,i=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.on[a],parameters:{event:i}},bubbles:!0,composed:!0}))});return s},this.closeModal=()=>{const t=(this.shadowRoot??this).querySelectorAll("mateu-dialog, mateu-drawer");if(t&&t.length>0){t[t.length-1].close(),this.removeTopOverlayChild();return}this.dispatchEvent(new CustomEvent("close-modal-requested",{bubbles:!0,composed:!0}))},this.changeFavicon=t=>{let r=document.querySelector('link[rel="icon"]');r!==null?r.setAttribute("href",t):(r=document.createElement("link"),r.setAttribute("rel","icon"),r.setAttribute("href",t),document.head.appendChild(r))}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=mt.subscribe(t=>{if(t.command){const r=t.command;this.id==r.targetComponentId&&this.applyCommand(r)}if((!t.callbackToken||!this.callbackToken||t.callbackToken===this.callbackToken)&&t.fragment){const r=t.fragment;this.id==r.targetComponentId&&(this.applyFragment(r),this.completeMenu(r))}})}completeMenu(t){if(t.component&&t.component.type==j.ClientSide){const r=t.component,s=r.metadata;if(s?.type==u.App){const a=s,i=this.getRemoteMenus(a.menu);if(i.length>0){const n=i.map(l=>qt.runAction(l.baseUrl,l.route,"_empty","",l.baseUrl+"#"+l.route,void 0,void 0,void 0,l.params,this,!0));Promise.all(n).then(l=>{a.menu=this.updateMenu(a.menu,l.map(c=>c.fragments).filter(c=>c).map(c=>c).flat()),a.variant=_e.MENU_ON_TOP,mt.next({fragment:{component:r,data:void 0,state:void 0,action:$r.Replace,targetComponentId:this.id,containerId:void 0},callbackToken:this.callbackToken})})}}}}updateMenu(t,r){const s=[];return t.forEach(a=>{if(a.remote){const i=r.find(n=>n.targetComponentId==a.baseUrl+"#"+a.route);if(i&&i.component?.type==j.ClientSide){const n=i.component;if(n.metadata?.type==u.App){const l=n.metadata,c=a.serverSideType&&a.serverSideType!=""?a.serverSideType:l.serverSideType;this.changeBaseUrl(l.menu,a.baseUrl,c,a.route,l.route),s.push(...l.menu)}}}else s.push(a)}),s}changeBaseUrl(t,r,s,a,i){t.forEach(n=>{n.baseUrl||(n.submenus&&n.submenus.length>0?this.changeBaseUrl(n.submenus,r,s,a,i):(n.consumedRoute=i??"",n.baseUrl=r,n.serverSideType=s,n.uriPrefix=a))})}getRemoteMenus(t){const r=[];return t.forEach(s=>{s.remote&&r.push(s)}),r}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(t){if(t.type=="SetWindowTitle"&&(document.title=t.data),t.type=="SetFavicon"&&this.changeFavicon(t.data),t.type=="DispatchEvent"&&this.dispatchNamedEvent(t.data),t.type=="NavigateTo"){const r=t.data;r&&(r.startsWith("http:")||r.startsWith("https:")?window.open(t.data,"_blank"):window.location.href=t.data)}if(t.type=="PushStateToHistory"){const r=t.data;r!==void 0&&this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:r},bubbles:!0,composed:!0}))}if(t.type=="RunAction"){const r=t.data;if(r&&r.actionId)if(r.targetComponentId){const s={command:{type:"RunAction",data:{actionId:r.actionId},targetComponentId:r.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:""};setTimeout(()=>mt.next(s))}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(t.type=="MarkAsDirty"&&this.dispatchEvent(new CustomEvent("dirty",{detail:{},bubbles:!0,composed:!0})),t.type=="MarkAsClean"&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),t.type=="DownloadFile"){const r=t.data;if(r&&r.base64Content){const s=atob(r.base64Content),a=new Uint8Array(s.length);for(let c=0;c<s.length;c++)a[c]=s.charCodeAt(c);const i=new Blob([a],{type:r.mimeType}),n=URL.createObjectURL(i),l=document.createElement("a");l.href=n,l.download=r.filename??"export",l.click(),URL.revokeObjectURL(n)}}if(t.type=="CloseModal"&&(this.closeModal(),this.dispatchNamedEvent(t.data)),t.type=="AddContentToHead"){const r=t.data;if(r&&r.name){if(r.attributes&&r.attributes.id&&document.getElementById(r.attributes.id))return;document.head.appendChild(this.createElement(t))}}if(t.type=="AddContentToBody"){const r=t.data;if(r&&r.name){if(r.attributes&&r.attributes.id&&document.getElementById(r.attributes.id))return;document.body.appendChild(this.createElement(t))}}}dispatchNamedEvent(t){if(t&&t.eventName){const r=this.component,s=r?.emitsName??r?.serverSideType;let a=t.payload??t.detail;s&&a&&typeof a=="object"&&(a={...a,__source:s}),this.dispatchEvent(new CustomEvent(t.eventName,{detail:a,bubbles:!0,composed:!0}))}}removeTopOverlayChild(){const t=this.component?.children;if(t)for(let r=t.length-1;r>=0;r--){const s=t[r]?.metadata?.type;if(s==u.Drawer||s==u.Dialog){t.splice(r,1);return}}}}Ga([h()],is.prototype,"id");Ga([h()],is.prototype,"baseUrl");var bc=Object.defineProperty,gc=(e,t,r,s)=>{for(var a=void 0,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=n(t,r,a)||a);return a&&bc(t,r,a),a};class os extends is{applyFragment(t){}manageActionRequestedEvent(t){}}gc([h()],os.prototype,"component");var ht=(e=>(e.OnLoad="OnLoad",e.OnSuccess="OnSuccess",e.OnError="OnError",e.OnValueChange="OnValueChange",e.OnCustomEvent="OnCustomEvent",e.AutoSave="AutoSave",e))(ht||{}),yc=Object.defineProperty,ns=(e,t,r,s)=>{for(var a=void 0,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=n(t,r,a)||a);return a&&yc(t,r,a),a};class Et extends os{constructor(){super(...arguments),this.state={},this.data={},this.appData={},this.appState={},this.triggerOnLoad=()=>{const t=this.component;this.registerCustomEventListeners(),t.triggers?.filter(r=>r.type==ht.OnLoad).forEach(r=>{if((!r.condition||this._evalExpr(r.condition))&&!r.triggered){const a=r;a.triggered=!0;var s=a.times-1;a.timeoutMillis>0?this.scheduleOnload(a,s,this.id):this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(t,r,s)=>{if(s!=this.component?.id)return;const a=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,callbackToken:a},bubbles:!0,composed:!0}))},t.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=t=>{if(!(t instanceof CustomEvent))return;const r=t,a=(this.component.triggers??[]).filter(i=>i.type==ht.OnCustomEvent).filter(i=>i.eventName==r.type).filter(i=>i.source!=="COMPONENT"||r.detail?.__source===i.from);a.length!==0&&(a.some(i=>!i.source||i.source==="SELF")&&(t.stopPropagation(),t.preventDefault()),a.forEach(i=>{(!i.condition||this._evalExpr(i.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId,parameters:r.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(t){return ba(t,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(t){return Hi(t,this.state??{},this.data??{},this._interpolationExtra())}applyFragment(t){if(this.id==t.targetComponentId){if(t.component)if($r.Add==t.action)this.component&&this.component.children?.push(t.component);else{if(this.callbackToken=$e(),t.component?.type==j.ServerSide)if(this.component){const s=this.component,a=t.component;s.actions=a.actions,s.type=a.type,s.rules=a.rules,s.triggers=a.triggers,s.serverSideType=a.serverSideType,s.route=a.route,s.initialData=a.initialData,s.validations=a.validations,s.cssClasses=a.cssClasses,s.slot=a.slot,s.style=a.style,s.children=a.children,(s.serverSideType!=a.serverSideType||s.id!=a.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=t.component,setTimeout(()=>this.triggerOnLoad());else{const s=[t.component];this.component&&(this.component.children=s)}t.action!==$r.ReplaceKeepData&&(this.state={},this.data={})}if(t.state&&(this.state={...this.state,...t.state}),t.data){for(const s in t.data){const a=t.data[s]?.page;a?.pageNumber>0&&this.data[s]&&this.data[s].page.content&&(a.content?a.content=[...this.data[s].page.content,...a.content]:a.content=[...this.data[s].page.content])}this.data={...this.data,...t.data}}this.registerCustomEventListeners();const r=V.getAfterRenderHook();r&&setTimeout(()=>r(this)),this.requestUpdate()}}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:r,name:s})=>r.removeEventListener(s,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(r=>r.type==ht.OnCustomEvent).forEach(r=>{const s=r.source==="DOCUMENT"||r.source==="COMPONENT"?document:this;s.addEventListener(r.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:s,name:r.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:t,name:r})=>t.removeEventListener(r,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}}ns([h()],Et.prototype,"state");ns([h()],Et.prototype,"data");ns([h()],Et.prototype,"appData");ns([h()],Et.prototype,"appState");const Ka="mateu-recent-routes",$c=8;function Ya(){try{return JSON.parse(localStorage.getItem(Ka)??"{}")}catch{return{}}}function xc(e){try{localStorage.setItem(Ka,JSON.stringify(e))}catch{}}function ia(e){return Ya()[e||"_"]??[]}function wc(e,t){if(!t?.route||!t.label)return;const r=e||"_",s=Ya(),i=(s[r]??[]).filter(n=>n.route!==t.route);i.unshift({route:t.route,label:t.label}),s[r]=i.slice(0,$c),xc(s)}var kc=Object.defineProperty,Cc=Object.getOwnPropertyDescriptor,Qe=(e,t,r,s)=>{for(var a=s>1?void 0:s?Cc(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&kc(t,r,a),a};let Ee=class extends S{constructor(){super(...arguments),this.baseUrl="",this.open=!1,this.queryText="",this.dataHits=[],this.loading=!1,this.selectedIndex=0,this.fabOffset=0,this.keydownHandler=null}connectedCallback(){super.connectedCallback(),this.keydownHandler=e=>{(e.metaKey||e.ctrlKey)&&(e.key==="k"||e.key==="K")?(e.preventDefault(),this.toggle()):e.key==="Escape"&&this.open&&this.close()},document.addEventListener("keydown",this.keydownHandler),this.setupFabObserver()}disconnectedCallback(){super.disconnectedCallback(),this.keydownHandler&&document.removeEventListener("keydown",this.keydownHandler),clearTimeout(this.searchTimer),this.fabObserver?.disconnect(),this.fabObserver=void 0}setupFabObserver(){const e=this.getRootNode(),t=e instanceof ShadowRoot?e:document.body;this.measureFabStack(),this.fabObserver?.disconnect(),this.fabObserver=new MutationObserver(()=>this.measureFabStack()),this.fabObserver.observe(t,{childList:!0,subtree:!0})}measureFabStack(){const r=(this.getRootNode().querySelectorAll?.(".ai-fab, .app-fab, .page-fab").length??0)*4;r!==this.fabOffset&&(this.fabOffset=r)}updated(e){e.has("open")&&this.open&&requestAnimationFrame(()=>this.inputEl?.focus())}toggle(){this.open?this.close():this.openCenter()}openCenter(){this.open=!0,this.queryText="",this.dataHits=[],this.selectedIndex=0}close(){this.open=!1,this.queryText="",this.dataHits=[],clearTimeout(this.searchTimer)}flattenMenu(e,t){const r=[];for(const s of e??[])if(!s.separator)if(s.submenus&&s.submenus.length>0){const a=t?`${t} › ${s.label}`:s.label;r.push(...this.flattenMenu(s.submenus,a))}else s.route!==void 0&&s.route!==null&&r.push({label:s.label,breadcrumb:t,route:s.route});return r}onInput(e){this.queryText=e,this.selectedIndex=0;const t=e.trim();if(clearTimeout(this.searchTimer),!t||!this.app?.globalSearchEnabled){this.dataHits=[],this.loading=!1;return}this.loading=!0,this.searchTimer=setTimeout(()=>this.fetchGlobalSearch(t),250)}async fetchGlobalSearch(e){const t=this.app;if(!t?.globalSearchEnabled){this.loading=!1;return}try{const s=(await qt.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","command-center",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(a=>a.data).find(a=>a&&a._globalsearch);this.dataHits=s?._globalsearch??[]}catch{this.dataHits=[]}finally{this.loading=!1}}navigateTo(e,t){wc(this.app?.serverSideType??"",{route:e,label:t}),this.close();for(const r of["route-changed","navigate-to-requested"])this.dispatchEvent(new CustomEvent(r,{detail:{route:e},bubbles:!0,composed:!0}))}askAi(){const e=this.queryText.trim();this.close(),this.dispatchEvent(new CustomEvent("mateu-open-ai",{detail:{query:e},bubbles:!0,composed:!0}))}visibleTargets(e){if(!this.queryText.trim()){const t=this.flattenMenu(this.app?.menu,"").map(s=>({route:s.route,label:s.label})),r=ia(this.app?.serverSideType??"");return[...t,...r]}return[...e.map(t=>({route:t.route,label:t.label})),...this.dataHits.map(t=>({route:t.route,label:t.label}))]}onKeydown(e,t){if(e.key==="ArrowDown")e.preventDefault(),this.selectedIndex=Math.min(this.selectedIndex+1,t.length-1);else if(e.key==="ArrowUp")e.preventDefault(),this.selectedIndex=Math.max(this.selectedIndex-1,0);else if(e.key==="Enter"){const r=t[this.selectedIndex];r&&this.navigateTo(r.route,r.label)}}render(){return o`
            <button class="cc-fab" style="bottom: ${1.5+this.fabOffset}rem;"
                @click=${()=>this.openCenter()} title="Buscar y navegar (⌘K)" aria-label="Command center">
                ${this.fabIcon()}
            </button>
            ${this.open?this.renderOverlay():d}
        `}fabIcon(){return o`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>`}renderOverlay(){const e=this.queryText.trim().toLowerCase(),t=e?this.flattenMenu(this.app?.menu,"").filter(s=>s.label.toLowerCase().includes(e)||s.breadcrumb.toLowerCase().includes(e)):[],r=this.visibleTargets(t);return o`
            <div class="cc-backdrop" @click=${()=>this.close()}>
                <div class="cc-panel" @click=${s=>s.stopPropagation()}>
                    <div class="cc-bar">
                        <button class="cc-icon-btn" @click=${()=>this.queryText?this.onInput(""):this.close()} title="${this.queryText?"Borrar":"Cerrar"}">
                            ${this.queryText?this.backIcon():this.searchGlyph()}
                        </button>
                        <input class="cc-input" .value=${this.queryText} placeholder="Buscar pantallas, datos y acciones…"
                            @input=${s=>this.onInput(s.target.value)}
                            @keydown=${s=>this.onKeydown(s,r)}>
                        ${this.queryText?o`<button class="cc-icon-btn" @click=${()=>this.onInput("")} title="Limpiar">${this.clearIcon()}</button>`:d}
                    </div>
                    <div class="cc-body">
                        ${e?this.renderResults(t):this.renderDefault()}
                    </div>
                </div>
                <button class="cc-close" @click=${()=>this.close()} title="Cerrar">${this.clearIcon()}</button>
            </div>
        `}renderDefault(){const e=this.flattenMenu(this.app?.menu,""),t=ia(this.app?.serverSideType??"");let r=-1;return o`
            <div class="cc-columns">
                <div class="cc-col">
                    <div class="cc-section-title">Ir a</div>
                    <div class="cc-tiles">
                        ${e.map(s=>{r++;const a=r;return o`
                            <button class="cc-tile ${a===this.selectedIndex?"cc-sel":""}"
                                @click=${()=>this.navigateTo(s.route,s.label)}
                                @mouseenter=${()=>{this.selectedIndex=a}}>
                                <span class="cc-tile-label">${s.label}</span>
                                ${s.breadcrumb?o`<span class="cc-sub">${s.breadcrumb}</span>`:d}
                            </button>`})}
                        ${e.length===0?o`<div class="cc-empty">Sin opciones de menú.</div>`:d}
                    </div>
                </div>
                ${t.length>0?o`
                    <div class="cc-col cc-col--recent">
                        <div class="cc-section-title">Recientes</div>
                        ${t.map(s=>{r++;const a=r;return o`
                            <button class="cc-row ${a===this.selectedIndex?"cc-sel":""}"
                                @click=${()=>this.navigateTo(s.route,s.label)}
                                @mouseenter=${()=>{this.selectedIndex=a}}>
                                <span class="cc-tile-label">${s.label}</span>
                            </button>`})}
                    </div>`:d}
            </div>
        `}renderResults(e){if(this.loading&&this.dataHits.length===0&&e.length===0)return o`<div class="cc-list">${[0,1,2,3].map(()=>o`<div class="cc-skeleton"></div>`)}</div>`;const t=e.length===0&&this.dataHits.length===0;return o`
            <div class="cc-list">
                ${this.app?.sseUrl?o`
                    <button class="cc-row cc-ask-ai" @click=${()=>this.askAi()}>
                        ${this.aiIcon()}<span class="cc-tile-label">Preguntar a la IA: “${this.queryText.trim()}”</span>
                    </button>`:d}
                ${e.length>0?o`<div class="cc-section-title">Pantallas</div>`:d}
                ${e.map((r,s)=>o`
                    <button class="cc-row ${s===this.selectedIndex?"cc-sel":""}"
                        @click=${()=>this.navigateTo(r.route,r.label)}
                        @mouseenter=${()=>{this.selectedIndex=s}}>
                        <span class="cc-tile-label">${r.label}</span>
                        ${r.breadcrumb?o`<span class="cc-sub">${r.breadcrumb}</span>`:d}
                    </button>`)}
                ${this.renderDataHits(e.length)}
                ${t?o`<div class="cc-empty">No encontramos coincidencias para “${this.queryText.trim()}”.</div>`:d}
            </div>
        `}renderDataHits(e){if(this.dataHits.length===0)return d;let t;return o`${this.dataHits.map((r,s)=>{const a=e+s,i=r.category&&r.category!==t;return t=r.category,o`
                ${i?o`<div class="cc-section-title">${r.category}</div>`:d}
                <button class="cc-row ${a===this.selectedIndex?"cc-sel":""}"
                    @click=${()=>this.navigateTo(r.route,r.label)}
                    @mouseenter=${()=>{this.selectedIndex=a}}>
                    <span class="cc-tile-label">${r.label}</span>
                    ${r.description?o`<span class="cc-sub">${r.description}</span>`:d}
                </button>`})}`}searchGlyph(){return o`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`}backIcon(){return o`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`}clearIcon(){return o`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`}aiIcon(){return o`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l1.9 4.7L19 8.5l-4.1 2.3L12 15l-1.9-4.2L6 8.5l5.1-1.8z"></path></svg>`}};Ee.styles=w`
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
    `;Qe([h({attribute:!1})],Ee.prototype,"app",2);Qe([h()],Ee.prototype,"baseUrl",2);Qe([g()],Ee.prototype,"open",2);Qe([g()],Ee.prototype,"queryText",2);Qe([g()],Ee.prototype,"dataHits",2);Qe([g()],Ee.prototype,"loading",2);Qe([g()],Ee.prototype,"selectedIndex",2);Qe([g()],Ee.prototype,"fabOffset",2);Qe([je(".cc-input")],Ee.prototype,"inputEl",2);Ee=Qe([k("mateu-command-center")],Ee);let Ve=null;function Sc(e){const t=e.component?.metadata;!!(t&&(t.commandCenterEnabled||t.chromeless)&&t.variant!=="MEDIATOR")?((!Ve||!Ve.isConnected)&&(Ve=document.createElement("mateu-command-center"),e.renderRoot.appendChild(Ve)),Ve.app=t,Ve.baseUrl=e.baseUrl??""):Ve&&e.renderRoot.contains(Ve)&&(Ve.remove(),Ve=null)}const Er=w`
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
`,_c={lon:0,lat:0},oa=3,Ec=e=>{if(!e)return;const t=e.split(",").map(a=>a.trim());if(t.length!==2)return;const r=Number(t[0]),s=Number(t[1]);if(!(t[0]===""||t[1]===""||!Number.isFinite(r)||!Number.isFinite(s)))return{lon:s,lat:r}},Ic=e=>{if(e==null||e.trim()==="")return oa;const t=Number(e);return Number.isFinite(t)?t:oa};var Pc=Object.defineProperty,Tc=Object.getOwnPropertyDescriptor,ls=(e,t,r,s)=>{for(var a=s>1?void 0:s?Tc(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Pc(t,r,a),a};let er=class extends S{constructor(){super(...arguments),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){const e=++this.renderSeq,[{default:t},{default:r},{default:s},{default:a},{fromLonLat:i},{default:n}]=await Promise.all([Ae(()=>import("./vendor-ol.js").then(c=>c.M),[]),Ae(()=>import("./vendor-ol.js").then(c=>c.V),[]),Ae(()=>import("./vendor-ol.js").then(c=>c.T),[]),Ae(()=>import("./vendor-ol.js").then(c=>c.O),[]),Ae(()=>import("./vendor-ol.js").then(c=>c.p),[]),Ae(()=>import("./vendor-ol.js").then(c=>c.o),[])]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector("style[data-ol]")){const c=document.createElement("style");c.setAttribute("data-ol",""),c.textContent=n,this.shadowRoot.appendChild(c)}this.map&&(this.map.setTarget(void 0),this.map=void 0);const l=Ec(this.position)??_c;this.map=new t({target:this.mapElement,layers:[new s({source:new a})],view:new r({center:i([l.lon,l.lat]),zoom:Ic(this.zoom)})})}render(){return o`<div id="map"></div>`}};er.styles=w`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `;ls([h()],er.prototype,"position",2);ls([h()],er.prototype,"zoom",2);ls([je("#map")],er.prototype,"mapElement",2);er=ls([k("mateu-map")],er);const Oc=typeof HTMLElement<"u"?HTMLElement:class{};class Rc extends Oc{static get observedAttributes(){return["content"]}#e;#t=0;get content(){return this.#e}set content(t){this.#e=t,this.#r()}attributeChangedCallback(t,r,s){this.content=s??void 0}connectedCallback(){this.style.display="block",this.#r()}async#r(){if(!this.isConnected)return;const t=this.#e??"",r=++this.#t,[{marked:s},{default:a}]=await Promise.all([Ae(()=>import("./vendor.js").then(i=>i.m),[]),Ae(()=>import("./vendor.js").then(i=>i.p),[])]);r===this.#t&&(this.innerHTML=a.sanitize(await s.parse(t),{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:i=>!0}}))}}typeof customElements<"u"&&!customElements.get("mateu-markdown")&&customElements.define("mateu-markdown",Rc);var Lc=Object.defineProperty,zc=Object.getOwnPropertyDescriptor,Vt=(e,t,r,s)=>{for(var a=s>1?void 0:s?zc(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Lc(t,r,a),a};const Ac=e=>{const t=[];return e.color&&e.color!=="normal"&&e.color!=="none"&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle==="tertiaryInline"?"tertiary-inline":e.buttonStyle),e.size&&e.size!=="none"&&e.size!=="normal"&&t.push(e.size),t.length?t.join(" "):void 0},Dc=e=>{const t=Ac(e)??"",r=[];return t.includes("primary")&&r.push("primary"),t.includes("tertiary")&&r.push("tertiary"),(t.includes("error")||e.color==="error")&&r.push("danger"),r.join(" ")},na=e=>e==="back"||e==="backToList"||!!e&&e.startsWith("cancel");let at=class extends S{constructor(){super(...arguments),this.appState={},this.appData={},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.evalLabel=e=>Bt(e,this.state,this.data),this.renderBtn=e=>{if((this.data??{})[e.actionId+".hidden"])return d;const t=this.evalLabel(e.label),r=V.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e.actionId));return r||o`
        <button class="mtb ${Dc(e)}"
                data-action-id="${e.id}"
                @click="${()=>this.handleButtonClick(e.actionId)}"
                ?disabled="${e.disabled}"
        >${t}</button>
    `},this.renderPeerNav=e=>{const t=V.get()?.renderPeerNav?.(e);return t||o`
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
        `}}render(){const e=this.metadata;if(!e)return o``;const t=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0,r=e.toolbar??[],s=r.filter(c=>na(c.actionId)),a=r.filter(c=>!na(c.actionId)),i=s.length>0&&a.length>0?o`<span class="toolbar-divider"></span>`:d,n=e.avatar||e.title||e.subtitle||e.kpis?.length>0||e.header?.length>0||r.length>0||!!t,l=e.level??0;return l>0?this.setAttribute("data-nested",""):this.removeAttribute("data-nested"),o`
            ${e.breadcrumbs&&e.breadcrumbs.length>0?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="breadcrumbs-bar">
                    ${e.breadcrumbs.map((c,p)=>o`
                        ${p>0?o`<span>/</span>`:d}
                        ${c.link?o`<button class="breadcrumb-link" @click="${()=>window.location.href=`${c.link}`}">${c.text}</button>`:o`<span>${c.text}</span>`}
                    `)}
                </div>
            `:d}
            ${e.noHeader?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                    ${e?.header?.map(c=>y(this,c,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${t?this.renderPeerNav(t):d}
                    ${s.map(this.renderBtn)}
                    ${i}
                    ${a.map(this.renderBtn)}
                </div>
            `:n?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="form-header">
                    ${e.avatar?y(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):d}
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        ${e?.title&&l==0?o`<h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${Se(ut(e?.title,this.state??{},this.data??{}))}</h2>`:d}
                        ${e?.title&&l==1?o`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${Se(ut(e?.title,this.state??{},this.data??{}))}</h3>`:d}
                        ${e?.title&&l==2?o`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${Se(ut(e?.title,this.state??{},this.data??{}))}</h4>`:d}
                        ${e?.title&&l==3?o`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${Se(ut(e?.title,this.state??{},this.data??{}))}</h5>`:d}
                        ${e?.title&&l>3?o`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${Se(ut(e?.title,this.state??{},this.data??{}))}</h6>`:d}

                        ${e?.subtitle?o`<span style="display: inline-block; margin-block-end: 0.83em;">${Se(ut(e?.subtitle,this.state??{},this.data??{}))}</span>`:d}
                        ${e?.timestamp?o`<span class="page-timestamp" style="display: block; color: var(--lumo-secondary-text-color, #6b7280); font-size: var(--lumo-font-size-s, .875rem);">${Se(ut(e.timestamp,this.state??{},this.data??{}))}</span>`:d}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${e?.kpis?.map(c=>o`
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div>${this.evalLabel(c.title)}</div>
                                <div>${Se(ut(c.text,this.state??{},this.data??{}))}</div>
                            </div>
                        `)}
                        ${e?.header?.map(c=>y(this,c,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${t?this.renderPeerNav(t):d}
                        ${s.map(this.renderBtn)}
                        ${i}
                        ${a.map(this.renderBtn)}
                    </div>
                </div>
            `:d}
            ${e.badges&&e.badges.length>0?o`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${e.badges.map(c=>oo(c,this.state??{},this.data??{}))}
                </div>
            `:d}
        `}};at.styles=w`
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

        ${Er}
    `;Vt([h()],at.prototype,"metadata",2);Vt([h()],at.prototype,"baseUrl",2);Vt([h()],at.prototype,"state",2);Vt([h()],at.prototype,"data",2);Vt([h()],at.prototype,"appState",2);Vt([h()],at.prototype,"appData",2);at=Vt([k("mateu-content-header")],at);var Fc=Object.defineProperty,Mc=Object.getOwnPropertyDescriptor,Ir=(e,t,r,s)=>{for(var a=s>1?void 0:s?Mc(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Fc(t,r,a),a};let At=class extends os{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={}}render(){const e=this.component?.metadata;return o`
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
       `}};At.styles=w`
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
    `;Ir([h()],At.prototype,"state",2);Ir([h()],At.prototype,"data",2);Ir([h()],At.prototype,"appState",2);Ir([h()],At.prototype,"appData",2);At=Ir([k("mateu-form")],At);const Ja="mateu-saved-views",ds=()=>{try{return JSON.parse(localStorage.getItem(Ja)??"{}")}catch{return{}}},Fs=e=>{try{localStorage.setItem(Ja,JSON.stringify(e))}catch{}},Xa=e=>ds()[e]??[],Nc=(e,t)=>{const r=t.name?.trim();if(!r||Object.keys(t.values??{}).length===0)return;const s=ds(),a=(s[e]??[]).filter(i=>i.name!==r);a.push({...t,name:r}),s[e]=a,Fs(s)},Uc=(e,t)=>{const r=ds(),s=(r[e]??[]).filter(a=>a.name!==t);s.length===0?delete r[e]:r[e]=s,Fs(r)},Bc=(e,t)=>{const r=ds();r[e]=(r[e]??[]).map(s=>({...s,isDefault:s.name===t?!s.isDefault:!1})),Fs(r)},jc=e=>Xa(e).find(t=>t.isDefault);var qc=Object.defineProperty,Hc=Object.getOwnPropertyDescriptor,Oe=(e,t,r,s)=>{for(var a=s>1?void 0:s?Hc(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&qc(t,r,a),a};let pe=class extends S{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.panelOpened=!1,this.viewsOpened=!1,this.draftText="",this.openPanel=()=>{this.panelOpened||this.filters.length===0||(this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1,this.activeFilter=void 0},this.clearAllFilters=()=>{const e=this.filters.flatMap(r=>this.isRangeFilter(r)?[`${r.fieldId}_from`,`${r.fieldId}_to`]:[r.fieldId]),t={searchText:void 0};e.forEach(r=>{t[r]=void 0}),this.state={...this.state,...t},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:e},bubbles:!0,composed:!0})),this.requestSearch()},this.keepFocus=e=>e.preventDefault()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get filters(){return this.metadata?.filters??[]}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}requestSearch(){this.closePanel(),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))}emitValueChanged(e,t){this.state={...this.state,[e]:t},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:e},bubbles:!0,composed:!0}))}applyFilter(e,t){this.emitValueChanged(e,t),this.requestSearch()}removeChip(e){const t=this.filters.find(r=>r.fieldId===e);t&&this.isRangeFilter(t)?(this.emitValueChanged(`${e}_from`,void 0),this.emitValueChanged(`${e}_to`,void 0)):this.emitValueChanged(e,e==="searchText"?"":void 0),this.requestSearch()}commitText(e){this.emitValueChanged("searchText",e.value),this.draftText="",e.value="",this.requestSearch()}get viewsScope(){return window.location.pathname}allFilterKeys(){return["searchText",...this.filters.flatMap(e=>this.isRangeFilter(e)?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId])]}snapshotValues(){const e={};return this.state.searchText&&(e.searchText=this.state.searchText),this.filters.forEach(t=>{if(this.isSet(t))if(this.isRangeFilter(t)){const r=this.rangeBound(t,"from"),s=this.rangeBound(t,"to");r&&(e[`${t.fieldId}_from`]=r),s&&(e[`${t.fieldId}_to`]=s)}else this.isMultiFilter(t)?e[t.fieldId]=this.multiValues(t):e[t.fieldId]=this.state[t.fieldId]}),e}applyView(e){const t=this.allFilterKeys(),r={};t.forEach(s=>{r[s]=void 0}),this.state={...this.state,...r},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:t},bubbles:!0,composed:!0})),Object.entries(e.values).forEach(([s,a])=>this.emitValueChanged(s,a)),this.viewsOpened=!1,this.detachOutsideClick(),this.requestSearch()}saveCurrentView(e){const t=e.value.trim();t&&(Nc(this.viewsScope,{name:t,values:this.snapshotValues()}),e.value="",this.requestUpdate())}firstUpdated(){if(window.location.search)return;const e=jc(this.viewsScope);e&&setTimeout(()=>{this.state.searchText||this.filters.some(r=>this.isSet(r))||this.applyView(e)},0)}isBooleanFilter(e){return e.dataType==="boolean"||e.dataType==="bool"||e.stereotype==="checkbox"||e.stereotype==="toggle"}isNumericFilter(e){return["integer","decimal","number","money"].includes(e.dataType??"")}isRangeFilter(e){return e.stereotype==="dateRange"||e.stereotype==="numberRange"}isMultiFilter(e){return e.stereotype==="multiSelect"}hasOptions(e){return(e.options?.length??0)>0}multiValues(e){const t=this.state[e.fieldId];return Array.isArray(t)?t.map(String):typeof t=="string"&&t!==""?t.split(",").map(r=>r.trim()).filter(r=>r):[]}rangeBound(e,t){const r=this.state[`${e.fieldId}_${t}`];return r==null?"":String(r)}isSet(e){if(this.isRangeFilter(e))return this.rangeBound(e,"from")!==""||this.rangeBound(e,"to")!=="";if(this.isMultiFilter(e))return this.multiValues(e).length>0;const t=this.state[e.fieldId];return t!=null&&t!==""&&!Number.isNaN(t)}getFilterDisplayValue(e,t){if(e.options?.length){const r=e.options.find(s=>s.value===String(t));if(r)return r.label??r.value}return typeof t=="boolean"?t?"Yes":"No":String(t)}conditionDisplay(e){if(this.isRangeFilter(e)){const t=this.rangeBound(e,"from"),r=this.rangeBound(e,"to");return t&&r?`${t} – ${r}`:t?`≥ ${t}`:`≤ ${r}`}return this.isMultiFilter(e)?this.multiValues(e).map(t=>this.getFilterDisplayValue(e,t)).join(", "):this.getFilterDisplayValue(e,this.state[e.fieldId])}labelOf(e){return Bt(e.label,this.state,this.data)||e.fieldId}panelRow(e,t,r="panel-row"){return o`
            <div class="${r}" @mousedown="${this.keepFocus}" @click="${t}">${e}</div>`}renderRangeWidget(e){const t=e.stereotype==="numberRange"?"number":e.dataType==="dateTime"?"datetime-local":e.dataType==="time"?"time":"date",r=a=>{const i=a.closest(".panel-input-row"),n=i.querySelector("input.range-from").value,l=i.querySelector("input.range-to").value;this.emitValueChanged(`${e.fieldId}_from`,n===""?void 0:n),this.emitValueChanged(`${e.fieldId}_to`,l===""?void 0:l),this.requestSearch()},s=a=>{a.key==="Enter"&&r(a.target),a.key==="Escape"&&this.closePanel()};return o`
            <div class="panel-input-row">
                <input class="range-from" type="${t}" placeholder="From"
                       .value="${this.rangeBound(e,"from")}"
                       @mousedown="${a=>a.stopPropagation()}"
                       @keydown="${s}"/>
                <span class="range-separator" aria-hidden="true">–</span>
                <input class="range-to" type="${t}" placeholder="To"
                       .value="${this.rangeBound(e,"to")}"
                       @mousedown="${a=>a.stopPropagation()}"
                       @keydown="${s}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${a=>r(a.target)}">Apply</button>
            </div>`}renderMultiWidget(e){const t=this.multiValues(e),r=s=>{const a=t.includes(s)?t.filter(i=>i!==s):[...t,s];this.emitValueChanged(e.fieldId,a.length>0?a:void 0),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))};return o`${(e.options??[]).map(s=>this.panelRow(o`
            <span class="multi-check ${t.includes(s.value)?"multi-check--on":""}"
                  aria-hidden="true">${t.includes(s.value)?"✓":""}</span>
            ${s.label??s.value}
        `,()=>r(s.value)))}`}renderActiveFilterWidget(e){if(this.isRangeFilter(e))return this.renderRangeWidget(e);if(this.isMultiFilter(e))return this.renderMultiWidget(e);if(this.hasOptions(e))return o`${e.options.map(s=>this.panelRow(s.label??s.value,()=>this.applyFilter(e.fieldId,s.value)))}`;if(this.isBooleanFilter(e))return o`
                ${this.panelRow("Yes",()=>this.applyFilter(e.fieldId,!0))}
                ${this.panelRow("No",()=>this.applyFilter(e.fieldId,!1))}`;const t=this.isNumericFilter(e),r=s=>{s.value!==""&&this.applyFilter(e.fieldId,t?Number(s.value):s.value)};return o`
            <div class="panel-input-row">
                <input type="${t?"number":"text"}"
                       placeholder="${e.placeholder||this.labelOf(e)}"
                       @mousedown="${s=>s.stopPropagation()}"
                       @keydown="${s=>{s.key==="Enter"&&r(s.target),s.key==="Escape"&&this.closePanel()}}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${s=>r(s.target.previousElementSibling)}">Apply</button>
            </div>`}renderViewsPanel(){if(!this.viewsOpened)return d;const e=Xa(this.viewsScope),t=!!this.state.searchText||this.filters.some(r=>this.isSet(r));return o`
            <div class="panel views-panel">
                <div class="panel-caption">Saved views</div>
                ${e.length===0?o`
                    <div class="panel-row views-empty">No saved views yet</div>`:d}
                ${e.map(r=>o`
                    <div class="panel-row view-row" @mousedown="${this.keepFocus}">
                        <span class="view-name" @click="${()=>this.applyView(r)}">${r.name}</span>
                        <button class="view-star ${r.isDefault?"view-star--on":""}"
                                title="${r.isDefault?"Unset as default":"Open this listing with this view"}"
                                @click="${()=>{Bc(this.viewsScope,r.name),this.requestUpdate()}}">★</button>
                        <button class="chip-remove" aria-label="Delete view ${r.name}"
                                @click="${()=>{Uc(this.viewsScope,r.name),this.requestUpdate()}}">✕</button>
                    </div>`)}
                ${t?o`
                    <div class="panel-input-row" @mousedown="${r=>r.stopPropagation()}">
                        <input class="view-name-input" type="text" placeholder="Save current view as…"
                               @keydown="${r=>{r.key==="Enter"&&this.saveCurrentView(r.target),r.key==="Escape"&&(this.viewsOpened=!1)}}"/>
                        <button class="apply-button"
                                @click="${r=>this.saveCurrentView(r.target.previousElementSibling)}">Save</button>
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
                                    @click="${r=>{r.stopPropagation(),this.removeChip(t.fieldId)}}">✕</button>
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
                            @click="${t=>{t.stopPropagation(),this.closePanel(),this.viewsOpened=!this.viewsOpened,this.viewsOpened&&(this.outsideClick=r=>{r.composedPath().includes(this)||(this.viewsOpened=!1,this.detachOutsideClick())},document.addEventListener("mousedown",this.outsideClick))}}">
                        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z"/>
                        </svg>
                    </button>
                </div>
                ${this.renderPanel()}
                ${this.renderViewsPanel()}
            </div>
            <slot></slot>
        `}};pe.styles=w`
        ${Er}
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
    `;Oe([h()],pe.prototype,"metadata",2);Oe([h()],pe.prototype,"baseUrl",2);Oe([g()],pe.prototype,"state",2);Oe([g()],pe.prototype,"data",2);Oe([h()],pe.prototype,"appState",2);Oe([h()],pe.prototype,"appData",2);Oe([h({type:Boolean})],pe.prototype,"searchOnly",2);Oe([g()],pe.prototype,"panelOpened",2);Oe([g()],pe.prototype,"viewsOpened",2);Oe([g()],pe.prototype,"activeFilter",2);Oe([g()],pe.prototype,"draftText",2);pe=Oe([k("mateu-filter-bar")],pe);const Qa="mateu-column-prefs",Ms=()=>{try{const e=JSON.parse(localStorage.getItem(Qa)??"{}");return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}catch{return{}}},Za=e=>{try{localStorage.setItem(Qa,JSON.stringify(e))}catch{}},Ns=e=>{if(!e||typeof e!="object")return;const t=r=>Array.isArray(r)?r.filter(s=>typeof s=="string"):[];return{hidden:t(e.hidden),order:t(e.order)}},ei=e=>Ns(Ms()[e]),Vc=(e,t)=>{const r=Ms(),s=Ns(t);s.hidden.length===0&&s.order.length===0?delete r[e]:r[e]=s,Za(r)},Wc=e=>{const t=Ms();delete t[e],Za(t)},ti=e=>e?!!e.identifier||e.dataType==="action"||e.dataType==="actionGroup"||e.dataType==="menu"||e.id==="select"||e.id==="menu":!1,ri=(e,t,r=s=>s)=>{const s=Ns(t);if(!s||s.hidden.length===0&&s.order.length===0)return e;const a=m=>r(m)?.id??m.id,i=new Set(s.hidden),n=e.filter(m=>{const v=a(m);return!v||!i.has(v)||ti(r(m))});if(s.order.length===0)return n.length===e.length?e:n;const l=new Map;n.forEach(m=>{const v=a(m);v&&!l.has(v)&&l.set(v,m)});const c=[],p=new Set;return s.order.forEach(m=>{const v=l.get(m);v&&!p.has(v)&&(c.push(v),p.add(v))}),n.forEach(m=>{p.has(m)||(c.push(m),p.add(m))}),c.length===e.length&&c.every((m,v)=>m===e[v])?e:c};var Gc=Object.defineProperty,Kc=Object.getOwnPropertyDescriptor,Pr=(e,t,r,s)=>{for(var a=s>1?void 0:s?Kc(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Gc(t,r,a),a};let Dt=class extends S{constructor(){super(...arguments),this.columns=[],this.scope="",this.panelOpened=!1,this.revision=0,this.togglePanel=()=>{if(this.panelOpened){this.closePanel();return}this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick)},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1},this.reset=()=>{Wc(this.scope),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}get prefs(){return ei(this.scope)??{hidden:[],order:[]}}effectiveEntries(e){return ri(this.columns,{hidden:[],order:e.order})}commit(e){Vc(this.scope,e),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}toggleVisibility(e){const t=this.prefs,r=t.hidden.includes(e)?t.hidden.filter(s=>s!==e):[...t.hidden,e];this.commit({...t,hidden:r})}move(e,t){const r=this.prefs,s=[...this.effectiveEntries(r)],a=s.findIndex(l=>l.id===e);if(a<0)return;let i=a+t;for(;i>=0&&i<s.length&&s[i].protected;)i+=t;if(i<0||i>=s.length)return;const n=s[a];s[a]=s[i],s[i]=n,this.commit({...r,order:s.map(l=>l.id)})}render(){this.revision;const e=this.prefs,t=this.effectiveEntries(e).filter(s=>!s.protected);if(t.length===0)return o``;const r=e.hidden.length>0||e.order.length>0;return o`
            <div class="chooser">
                <button
                    class="trigger ${r?"active":""}"
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
                        ${t.map((s,a)=>{const i=e.hidden.includes(s.id);return o`
                                <div class="row" data-column-id="${s.id}">
                                    <label class="row-label">
                                        <input
                                            type="checkbox"
                                            .checked="${!i}"
                                            @change="${()=>this.toggleVisibility(s.id)}"
                                        />
                                        <span class="${i?"muted":""}">${s.label||s.id}</span>
                                    </label>
                                    <button class="move" type="button" title="Move up" aria-label="Move ${s.label||s.id} up"
                                        ?disabled="${a===0}"
                                        @click="${()=>this.move(s.id,-1)}">↑</button>
                                    <button class="move" type="button" title="Move down" aria-label="Move ${s.label||s.id} down"
                                        ?disabled="${a===t.length-1}"
                                        @click="${()=>this.move(s.id,1)}">↓</button>
                                </div>
                            `})}
                        <div class="footer">
                            <button class="reset" type="button" ?disabled="${!r}" @click="${this.reset}">Reset</button>
                        </div>
                    </div>
                `:d}
            </div>
        `}};Dt.styles=w`
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
    `;Pr([h()],Dt.prototype,"columns",2);Pr([h()],Dt.prototype,"scope",2);Pr([g()],Dt.prototype,"panelOpened",2);Pr([g()],Dt.prototype,"revision",2);Dt=Pr([k("mateu-column-chooser")],Dt);var Yc=Object.defineProperty,Jc=Object.getOwnPropertyDescriptor,Tr=(e,t,r,s)=>{for(var a=s>1?void 0:s?Jc(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Yc(t,r,a),a};let Ft=class extends S{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.totalPages=0}updated(e){super.updated(e),(e.has("totalElements")||e.has("pageSize"))&&(this.totalPages=Math.ceil(this.totalElements/this.pageSize))}dispatch(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return d;const e=this.totalPages>1,t=this.pageNumber,r=t===0,s=t>=this.totalPages-1;return o`
            <div class="bar">
                ${e?o`
                    <button class="nav" title="First page" ?disabled="${r}"
                        @click="${()=>this.dispatch(0)}" data-testid="page-first">«</button>
                    <button class="nav" title="Previous page" ?disabled="${r}"
                        @click="${()=>this.dispatch(t-1)}" data-testid="page-prev">‹</button>
                    <span class="page-indicator">Page ${t+1} of ${this.totalPages}</span>
                    <button class="nav" title="Next page" ?disabled="${s}"
                        @click="${()=>this.dispatch(t+1)}" data-testid="page-next">›</button>
                    <button class="nav" title="Last page" ?disabled="${s}"
                        @click="${()=>this.dispatch(this.totalPages-1)}" data-testid="page-last">»</button>
                    <span class="separator"></span>
                `:d}
                <span class="total-count">${this.totalElements} item${this.totalElements===1?"":"s"}</span>
                <slot></slot>
            </div>
        `}};Ft.styles=w`
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
    `;Tr([h()],Ft.prototype,"totalElements",2);Tr([h()],Ft.prototype,"pageSize",2);Tr([h()],Ft.prototype,"pageNumber",2);Tr([g()],Ft.prototype,"totalPages",2);Ft=Tr([k("mateu-pagination")],Ft);const si=e=>{switch(e){case tt.SUCCESS:return"success";case tt.WARNING:return"warning";case tt.DANGER:return"error";case tt.NONE:return"contrast"}return""};var Xc=Object.defineProperty,Qc=Object.getOwnPropertyDescriptor,Re=(e,t,r,s)=>{for(var a=s>1?void 0:s?Qc(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Xc(t,r,a),a};let he=class extends S{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.respondToVisibility=(e,t)=>{var r={root:document.documentElement},s=new IntersectionObserver(a=>{a.forEach(i=>{t(i.intersectionRatio>0)})},r);s.observe(e)},this.keepAsking=!1,this.askToUpper=()=>{const e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?Ls(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?o`<div class="neutral-card">
                ${e.image?o`<img class="card-media" src="${e.image}" alt="" />`:d}
                <div class="card-body">
                    <div class="card-head">
                        ${e.title?o`<span class="card-title">${e.title}</span>`:d}
                        ${e.status?o`<span theme="badge ${si(e.status.type)}">${e.status.message}</span>`:d}
                    </div>
                    ${e.subtitle?o`<div class="card-subtitle">${e.subtitle}</div>`:d}
                    ${e.content?o`<div>${e.content}</div>`:d}
                </div>
        </div>`:o`${e}`,this.hasMore=!1,this.clickedOnCard=e=>{this.state[this.id+"_selected_items"]=[e],this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0}))}}updated(e){super.updated(e);const t=this.data[this.id]?.page;this.hasMore=t?.content?.length<t?.totalElements}firstUpdated(e){super.firstUpdated(e),this.respondToVisibility(this.askForMore,t=>{this.keepAsking=t,t&&this.askToUpper()})}render(){const e=this.data[this.id]?.page;return o`
            <div class="card-container">
                ${e?.content?.map(t=>o`<div @click="${()=>this.clickedOnCard(t)}" class="car-container">${this.renderItem(t)}</div>`)}
                <div id="ask-for-more" style="display: ${this.hasMore?"flex":"none"}; width: 100%; justify-content: center; padding: var(--lumo-space-m); color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Loading more…</div>
            </div>

            <slot></slot>
       `}};he.styles=w`
        ${Er}
        
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
    `;Re([h()],he.prototype,"id",2);Re([h()],he.prototype,"metadata",2);Re([h()],he.prototype,"baseUrl",2);Re([h()],he.prototype,"state",2);Re([h()],he.prototype,"data",2);Re([h()],he.prototype,"appState",2);Re([h()],he.prototype,"appData",2);Re([h()],he.prototype,"emptyStateMessage",2);Re([g()],he.prototype,"keepAsking",2);Re([je("#ask-for-more")],he.prototype,"askForMore",2);Re([g()],he.prototype,"hasMore",2);he=Re([k("mateu-card-list")],he);var ai=(e=>(e.none="none",e.success="success",e.error="error",e.warning="warning",e.contrast="contrast",e.normal="normal",e))(ai||{}),ii=(e=>(e.primary="primary",e.secondary="secondary",e.tertiary="tertiary",e.tertiaryInline="tertiaryInline",e))(ii||{}),Zc=Object.defineProperty,eu=Object.getOwnPropertyDescriptor,Le=(e,t,r,s)=>{for(var a=s>1?void 0:s?eu(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Zc(t,r,a),a};const tu={asc:"ascending",desc:"descending"};let me=class extends S{constructor(){super(...arguments),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this._columnPrefsRevision=0,this._prefsRevisionApplied=-1,this.search=()=>{const e=this.component.metadata;this.state={...this.state,size:e.pageSize,page:0,crud_selected_items:[]},this._syncStateToUrl(e),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}}},bubbles:!0,composed:!0}))},this.notify=e=>{zt({text:e,position:"bottomEnd",variant:"error",duration:3e3},this)},this.handleSearchRequested=e=>{this.state={...this.state,crud_selected_items:[]};const t=this.component.metadata;this._syncStateToUrl(t),!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}},callback:e},bubbles:!0,composed:!0}))},this.fetchMoreElements=e=>{const{params:t,callback:r}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(r)},this.directionChanged=e=>{const t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(r=>({fieldId:r.__data.path,direction:r.__data.direction?tu[r.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForComponentId=void 0,this.evalLabel=e=>Bt(e,this.state,this.data),this.handleToolbarButtonClick=e=>{if(e==="import"){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{const t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"process-import",parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get columnPrefsScope(){return window.location.pathname}get effectiveComponent(){const e=this.component,t=e?.metadata;if(!e||!t?.columns)return e;if(this._prefsSource===e&&this._prefsRevisionApplied===this._columnPrefsRevision)return this._prefsApplied;const r=ei(this.columnPrefsScope),s=ri(t.columns,r,a=>a.metadata??{});return this._prefsApplied=s===t.columns?e:{...e,metadata:{...t,columns:s}},this._prefsSource=e,this._prefsRevisionApplied=this._columnPrefsRevision,this._prefsApplied}get columnChooserEntries(){return(this.component?.metadata?.columns??[]).map(t=>{const r=t.metadata??{},s=r.id??t.id;return s?{id:s,label:r.label??s,protected:ti(r)}:void 0}).filter(t=>!!t)}renderColumnChooser(){const e=this.columnChooserEntries;return e.filter(t=>!t.protected).length===0?d:o`
            <mateu-column-chooser
                .columns="${e}"
                .scope="${this.columnPrefsScope}"
                @column-prefs-changed="${t=>{t.stopPropagation(),this._columnPrefsRevision++}}"
            ></mateu-column-chooser>
        `}get cols(){return this.effectiveComponent?.metadata?.columns?.map(t=>t.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.component?.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":Ba(this.cols,this.availableWidthPx):t}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}_filterIds(e){return new Set(["searchText",...(e.filters??[]).flatMap(t=>t.stereotype==="dateRange"||t.stereotype==="numberRange"?[`${t.fieldId}_from`,`${t.fieldId}_to`]:[t.fieldId])])}_syncStateToUrl(e){const t=this._filterIds(e),r=new URLSearchParams(window.location.search);t.forEach(l=>r.delete(l)),r.delete("page"),r.delete("sort"),t.forEach(l=>{const c=this.state[l];c!=null&&c!==""&&r.set(l,String(c))});const s=this.state.page;s&&s>0&&r.set("page",String(s));const a=this.state.sort;if(a&&a.length>0){const l=a.filter(c=>c.fieldId&&c.direction).map(c=>`${c.fieldId}:${c.direction}`).join(",");l&&r.set("sort",l)}const i=r.toString(),n=i?`${window.location.pathname}?${i}`:window.location.pathname;window.location.pathname+window.location.search!==n&&history.replaceState(null,"",n)}_initStateFromUrl(e,t){const r=new URLSearchParams(window.location.search),s=this._filterIds(e),a={...t};r.forEach((l,c)=>{s.has(c)&&(a[c]=l)});const i=r.get("page");if(i!==null){const l=parseInt(i,10);!isNaN(l)&&l>0&&(a.page=l)}const n=r.get("sort");if(n){const l=n.split(",").map(c=>{const[p,f]=c.split(":");return p&&f?{fieldId:p,direction:f}:null}).filter(Boolean);l.length>0&&(a.sort=l)}return a}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}updated(e){if(super.updated(e),e.has("component")){const t=this.component?.id;if(t!==this._initializedForComponentId){this._initializedForComponentId=t;const r=this.component?.metadata,s=r.initialPage&&r.initialPage>0?r.initialPage:0;this.state=this._initStateFromUrl(r,{...this.state,size:r.pageSize,page:s,sort:[]}),(this.state.page!==s||this.state.sort?.length>0||[...this._filterIds(r)].some(i=>this.state[i]!=null))&&this.handleSearchRequested(void 0)}}}render(){const e=C=>{const N=[];return C.color&&C.color!==ai.normal&&N.push(C.color),C.buttonStyle&&N.push(C.buttonStyle===ii.tertiaryInline?"tertiary-inline":C.buttonStyle),N.length?N.join(" "):void 0},t=C=>C==="back"||C==="backToList"||!!C&&C.startsWith("cancel"),r=C=>{const N=V.get()?.renderToolbarButton?.(C,this.evalLabel(C.label),()=>this.handleToolbarButtonClick(C.actionId));return N||o`
                <button class="crud-btn"
                        data-action-id="${C.id}"
                        theme="${e(C)||d}"
                        @click="${()=>this.handleToolbarButtonClick(C.actionId)}"
                >${this.evalLabel(C.label)}</button>
            `};if(!this.component)return o`no component`;const s=this.effectiveComponent,a=s.metadata;a.serverSideOrdering=!0;const i=a?.toolbar??[],n=i.filter(C=>t(C.actionId)),l=i.filter(C=>!t(C.actionId)),c=n.length>0&&l.length>0,p=!!a?.title||!!a?.subtitle||i.length>0,f=this.effectiveGridLayout,m=this.cols,v=Yr(m),x=this.data[this.id]?.page?.content??[],$=this.state[this.component?.id]?.emptyStateMessage,_=(C,N)=>{const T=N[C.id];if(T==null)return o``;if(C.dataType==="status"){const L=si(T.type);return o`<span theme="badge pill ${L}">${T.message}</span>`}return C.dataType==="bool"?o`${T?"✓":"✗"}`:typeof T=="object"?o`${T.label??T.name??T.message??""}`:o`${T}`},P=()=>{const C=this.identifierFieldName,N=this.state._selectedId??this.appState?._splitDetailId,T=v.find(O=>O.identifier)??v[0],L=O=>O.dataType==="action"||O.dataType==="actionGroup"||O.dataType==="menu"||O.stereotype==="button",qe=v.filter(O=>O!==T&&!L(O)),Wt=m.filter(O=>L(O)),dt=(O,A,B)=>{O.stopPropagation(),O.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:A,parameters:{_clickedRow:B}},bubbles:!0,composed:!0}))},It=O=>{const A=[];for(const B of Wt){const q=O[B.id];if(B.dataType==="action"){const He=q?.methodNameInCrud?q:O.action?.methodNameInCrud?O.action:{methodNameInCrud:B.id,label:B.label,icon:null};A.push(o`
                            <button class="crud-btn" theme="tertiary small" title="${He.label||d}"
                                @click="${E=>dt(E,"action-on-row-"+He.methodNameInCrud,O)}">
                                ${He.icon?K(He.icon):d}
                                ${He.label??d}
                            </button>`)}else(B.dataType==="actionGroup"||B.dataType==="menu")&&(q?.actions??[]).forEach(E=>A.push(o`
                            <button class="crud-btn" theme="tertiary small" title="${E.label||d}"
                                @click="${oe=>dt(oe,"action-on-row-"+E.methodNameInCrud,O)}">
                                ${E.icon?K(E.icon):d}
                                ${E.label??d}
                            </button>`))}return A.length?o`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${A}
                    </div>`:d};return o`
                <div class="m-listbox" style="width: 100%;">
                    ${x.length===0?o`<div class="m-item" disabled>${pr($)}</div>`:d}
                    ${x.map(O=>o`
                        <div class="m-item"
                            ?selected="${C&&N!==void 0&&String(O[C])===String(N)}"
                            @click="${()=>{C&&O[C]!==void 0&&(this.state={...this.state,_selectedId:String(O[C])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:O},bubbles:!0,composed:!0}))}}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${T?O[T.id]??"":""}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${qe.map(A=>o`<span>${A.label}: ${_(A,O)}</span>`)}
                            </div>
                            ${It(O)}
                        </div>
                    `)}
                </div>`},z=(C,N,T)=>{const L=this.identifierFieldName;L&&T[L]!==void 0&&(this.state={...this.state,_selectedId:String(T[L])}),C.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:N,parameters:T},bubbles:!0,composed:!0}))},Y=()=>{const C=this.identifierFieldName,N=this.state._selectedId??this.appState?._splitDetailId,T=m.slice(0,6),L=T.filter(E=>E.stereotype==="image"),qe=T.find(E=>E.identifier)??T[0],Wt=E=>!!E.actionId,dt=E=>E.dataType==="action"||E.dataType==="actionGroup"||E.dataType==="menu"||E.stereotype==="button",It=T.find(E=>E.id==="select"&&E.dataType==="action"),O=!!It,A=T.filter(E=>E!==qe&&!L.includes(E)&&!Wt(E)&&!dt(E)),B=T.filter(E=>dt(E)&&!(O&&E===It)),q=(E,oe,ct)=>{E.stopPropagation(),E.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:oe,parameters:{_clickedRow:ct}},bubbles:!0,composed:!0}))},He=E=>{const oe=[];for(const ct of B){const hs=E[ct.id];if(ct.dataType==="action"){const Gt=hs?.methodNameInCrud?hs:E.action?.methodNameInCrud?E.action:{methodNameInCrud:ct.id,label:ct.label,icon:null};oe.push(o`
                            <button class="crud-btn" theme="tertiary" title="${Gt.label||d}"
                                @click="${Pt=>q(Pt,"action-on-row-"+Gt.methodNameInCrud,E)}">
                                ${Gt.icon?K(Gt.icon):d}
                                ${Gt.label??d}
                            </button>`)}else(ct.dataType==="actionGroup"||ct.dataType==="menu")&&(hs?.actions??[]).forEach(Pt=>oe.push(o`
                            <button class="crud-btn" theme="tertiary" title="${Pt.label||d}"
                                @click="${yi=>q(yi,"action-on-row-"+Pt.methodNameInCrud,E)}">
                                ${Pt.icon?K(Pt.icon):d}
                                ${Pt.label??d}
                            </button>`))}return oe.length?o`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${oe}
                    </div>`:d};return o`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${x.length===0?o`<div style="grid-column: 1 / -1;">${pr($)}</div>`:d}
                    ${x.map(E=>o`
                        <div class="crud-card"
                            ?data-selected="${C&&N!==void 0&&String(E[C])===String(N)}"
                            style="cursor: pointer;"
                            @click="${oe=>O?q(oe,"action-on-row-select",E):z(oe.target,"view",E)}"
                        >
                            ${L.length?o`<img src="${E[L[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: var(--lumo-border-radius-m, 8px);" />`:d}
                            ${qe?o`<div class="crud-card-title">${E[qe.id]??""}</div>`:d}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${A.map(oe=>o`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${oe.label}</span>
                                        <span>${_(oe,E)}</span>
                                    </div>
                                `)}
                            </div>
                            ${He(E)}
                        </div>
                    `)}
                </div>`},se=()=>{const C=Dd(m),N=C.find(L=>L.identifier)??C[0],T=C.filter(L=>L!==N);return o`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <div class="m-listbox" style="width: 100%;">
                            ${x.length===0?o`<div class="m-item" disabled>${pr($)}</div>`:d}
                            ${x.map(L=>o`
                                <div class="m-item"
                                    ?selected="${this.selectedItem===L}"
                                    @click="${()=>{this.selectedItem=L}}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${N?L[N.id]??"":""}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${T.map(qe=>o`${_(qe,L)} `)}
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?o`
                            <div class="m-formlayout">
                                ${m.map(L=>o`
                                    <label style="display: flex; flex-direction: column; gap: .1rem; font-size: var(--lumo-font-size-s, .875rem);">
                                        <span style="color: var(--lumo-secondary-text-color, #667);">${L.label}</span>
                                        <span>${String(this.selectedItem[L.id]??"")}</span>
                                    </label>
                                `)}
                            </div>
                        `:o`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},ve=()=>{const C=this.identifierFieldName,N=this.state._selectedId??this.appState?._splitDetailId,T=m[0],L=m.slice(1),qe=!!T?.actionId,Wt=A=>(A??[]).map(B=>{const q=Array.isArray(B.children)?B.children:[];return q.length>0?{...B,children:Wt(q)}:{...B,children:void 0}}),dt=Wt(x),It=(A,B,q)=>{A.stopPropagation(),C&&B[C]!==void 0&&(this.state={...this.state,_selectedId:String(B[C])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:q,parameters:B},bubbles:!0,composed:!0}))},O=(A,B)=>o`
                <tr class="${C&&N!==void 0&&String(A[C])===String(N)?"selected":""}"
                    style="cursor: pointer;" @click="${q=>It(q,A,"view")}">
                    ${T?o`<td style="padding-left: ${B*1.2+.6}rem;">${A[T.id]??""}</td>`:d}
                    ${L.map(q=>q.id==="select"?o`<td><button class="crud-btn small" @click="${He=>{He.stopPropagation(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-select",parameters:{_clickedRow:A}},bubbles:!0,composed:!0}))}}">Select</button></td>`:o`<td>${A[q.id]??""}</td>`)}
                    ${qe?o`<td style="text-align: end;">${A?.viewable===!1?d:o`<button class="crud-btn small" @click="${q=>It(q,A,"view")}">View</button>`}</td>`:d}
                </tr>
                ${(A.children??[]).map(q=>O(q,B+1))}
            `;return o`
                <table class="crud-table">
                    <thead><tr>
                        ${T?o`<th>${T.label??d}</th>`:d}
                        ${L.map(A=>o`<th>${A.label??d}</th>`)}
                        ${qe?o`<th></th>`:d}
                    </tr></thead>
                    <tbody>
                        ${dt.length===0?o`<tr><td colspan="99" style="padding: 1.5rem; text-align: center; color: var(--lumo-secondary-text-color, #888);">${pr($)}</td></tr>`:d}
                        ${dt.map(A=>O(A,0))}
                    </tbody>
                </table>`},Q=V.get()?.rendersCrudLayouts?.()===!0,ae=o`
            ${a.infiniteScrolling?o`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:d}
            ${!Q&&f==="list"?P():!Q&&f==="cards"?a.contentHeight?o`
                <div class="m-scroll" style="width: 100%; height: ${a.contentHeight};">
                    ${Y()}
                </div>
            `:Y():!Q&&f==="masterDetail"?se():!Q&&f==="tree"?ve():V.get()?.renderTableComponent(this,s,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,ie=a.infiniteScrolling?d:V.get()?.renderPagination(this,this.component),Ce=this.showImportDialog?o`
            <div class="crud-modal-backdrop" @click="${C=>{C.target===C.currentTarget&&(this.showImportDialog=!1)}}">
                <div class="crud-modal">
                    <h3 style="margin: 0 0 .75rem;">Import</h3>
                    <input type="file" @change="${C=>{const N=C.target.files?.[0];if(N){const T=new FormData;T.append("file",N),fetch("/upload",{method:"POST",body:T}).then(L=>L.json()).then(L=>this.handleImportUploadSuccess({detail:L})).catch(()=>this.notify("Import failed"))}}}">
                    <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                        <button class="crud-btn" @click="${()=>{this.showImportDialog=!1}}">Cancel</button>
                    </div>
                </div>
            </div>
        `:d;return this.standalone?o`
                ${Ce}
                <div style="border: var(--mateu-section-border, none); background: var(--mateu-section-bg, transparent); overflow: hidden; max-height: calc(100dvh - 12rem); width: 100%; box-sizing: border-box; padding: var(--mateu-section-padding, 0); display: flex; flex-direction: column;">
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
                    <div style="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);">
                        <div style="flex: 1; min-width: 0;">${V.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                        ${this.renderColumnChooser()}
                    </div>
                    <div style="flex: 1; overflow-y: auto; min-height: 0;">${ae}</div>
                    <div style="flex-shrink: 0;">${ie}</div>
                </div>
            `:o`
            ${Ce}
            ${p?o`
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m, 1rem);">
                        <div style="flex: 1; min-width: 0;">
                            ${a?.title?o`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(a.title)}</h2>
                            `:d}
                            ${a?.subtitle?o`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(a.subtitle)}</span>
                            `:d}
                        </div>
                        ${n.map(C=>r(C))}
                        ${c?o`<span class="toolbar-divider"></span>`:d}
                        ${l.map(C=>r(C))}
                        <slot></slot>
                    </div>
                `:d}
            <div style="border: var(--mateu-section-border, none); background: var(--mateu-section-bg, transparent); overflow: hidden; max-height: calc(100dvh - 12rem); padding: var(--mateu-section-padding, 0); display: flex; flex-direction: column;">
                <div style="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);">
                    <div style="flex: 1; min-width: 0;">${V.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                    ${this.renderColumnChooser()}
                </div>
                <div style="flex: 1; overflow-y: auto; min-height: 0;">${ae}</div>
                <div style="flex-shrink: 0;">${ie}</div>
            </div>
        `}createRenderRoot(){return V.mustUseShadowRoot()?super.createRenderRoot():this}};me.styles=w`
        ${Er}
        /* DS-neutral crud widgets (replace vaadin-button/card/grid/list-box/form-layout/dialog). */
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
    `;Le([h()],me.prototype,"component",2);Le([h()],me.prototype,"baseUrl",2);Le([h({type:Boolean})],me.prototype,"standalone",2);Le([h()],me.prototype,"state",2);Le([h()],me.prototype,"data",2);Le([h()],me.prototype,"appState",2);Le([h()],me.prototype,"appData",2);Le([g()],me.prototype,"showImportDialog",2);Le([g()],me.prototype,"availableWidthPx",2);Le([g()],me.prototype,"selectedItem",2);Le([g()],me.prototype,"_columnPrefsRevision",2);me=Le([k("mateu-table-crud")],me);var ru=Object.defineProperty,su=Object.getOwnPropertyDescriptor,oi=(e,t,r,s)=>{for(var a=s>1?void 0:s?su(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&ru(t,r,a),a};let Xr=class extends S{constructor(){super(...arguments),this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1;const t=e.detail.reason,r=t?.message??String(t);zt({text:r,variant:"error",duration:3e3,position:"bottomEnd"},this)}}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-called-event",this.fetchStarted),this.addEventListener("backend-succeeded-event",this.fetchFinished),this.addEventListener("backend-cancelled-event",this.fetchFailed),this.addEventListener("backend-failed-event",this.fetchFailed)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-succeeded-event",this.fetchStarted),this.removeEventListener("backend-succeeded-event",this.fetchFinished),this.removeEventListener("backend-cancelled-event",this.fetchFailed),this.removeEventListener("backend-failed-event",this.fetchFailed)}render(){return o`<div class="loader-container">
            <div style="display: flex; flex-direction: column;">
                <slot></slot>
                <div class="loader-frame ${this.loading?"delayed-show":""}" style="${this.loading?"pointer-events: all;":"display: none;"}"><div class="loader"></div></div>
            </div>
        </div>`}};Xr.styles=w`
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
  `;oi([g()],Xr.prototype,"loading",2);Xr=oi([k("mateu-api-caller")],Xr);var au=Object.defineProperty,iu=Object.getOwnPropertyDescriptor,Ze=(e,t,r,s)=>{for(var a=s>1?void 0:s?iu(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&au(t,r,a),a};let Ie=class extends S{constructor(){super(...arguments),this.message="This website uses cookies.",this.dismiss="Ok. Thanks :).",this.learnMore="Learn more",this.learnMoreLink="https://cookiesandyou.com/",this.showLearnMore=!0,this.position="top",this.cookieName="mateu-cookieconsent"}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement("style"),this._css.innerText=".cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}",document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){const e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){const e=this.popup;e&&(e.classList.remove("cc-invisible"),e.style.display="")}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:"#000"},button:{background:"rgba(22, 118, 243, 0.95)",hover:"rgba(22, 118, 243, 1)"}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});const e=this.popup;if(e){e.setAttribute("role","alert");const t=e.querySelector("a.cc-btn");t?.addEventListener("keydown",r=>{const i=r.keyCode||r.which;(i===32||i===13)&&t.click()})}}render(){return o`
       `}};Ie.styles=w`
  `;Ze([h()],Ie.prototype,"message",2);Ze([h()],Ie.prototype,"dismiss",2);Ze([h()],Ie.prototype,"learnMore",2);Ze([h()],Ie.prototype,"learnMoreLink",2);Ze([h()],Ie.prototype,"showLearnMore",2);Ze([h()],Ie.prototype,"position",2);Ze([h()],Ie.prototype,"cookieName",2);Ze([g()],Ie.prototype,"_css",2);Ze([je('[aria-label="cookieconsent"]')],Ie.prototype,"popup",2);Ie=Ze([k("mateu-cookie-consent")],Ie);var ou=Object.defineProperty,nu=Object.getOwnPropertyDescriptor,ni=(e,t,r,s)=>{for(var a=s>1?void 0:s?nu(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&ou(t,r,a),a};let Qr=class extends S{constructor(){super(...arguments),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener("value-changed",this.redispatchEvent),this.addEventListener("data-changed",this.redispatchEvent),this.addEventListener("action-requested",this.redispatchEvent),this.addEventListener("server-side-action-requested",this.redispatchEvent),this.addEventListener("route-changed",this.redispatchEvent),this.addEventListener("close-modal-requested",this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("value-changed",this.redispatchEvent),this.removeEventListener("data-changed",this.redispatchEvent),this.removeEventListener("action-requested",this.redispatchEvent),this.removeEventListener("server-side-action-requested",this.redispatchEvent),this.removeEventListener("route-changed",this.redispatchEvent)}render(){return o`<slot></slot>`}};Qr.styles=w`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `;ni([h()],Qr.prototype,"target",2);Qr=ni([k("mateu-event-interceptor")],Qr);var lu=Object.defineProperty,du=Object.getOwnPropertyDescriptor,li=(e,t,r,s)=>{for(var a=s>1?void 0:s?du(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&lu(t,r,a),a};let Zr=class extends Et{constructor(){super(...arguments),this.opened=!0,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),500)},this.onKeydown=e=>{e.key==="Escape"&&this.opened&&(e.stopPropagation(),this.close())}}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this.onKeydown)}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}render(){if(!this.opened)return o``;const e=this.component.metadata,t=hr(e.headerTitle,this.state,this.data,this.appState,this.appData),r=!!(t||e.header||e.closeButtonOnHeader),s=[e.width?`width:${e.width};`:"min-width:min(90vw,28rem);",e.height?`height:${e.height};`:"",e.top?`margin-top:${e.top};`:""].join("");return o`
            <div class="backdrop ${e.modeless?"modeless":""}"
                 @click="${a=>{!e.modeless&&a.target===a.currentTarget&&this.close()}}">
                <div class="dialog ${e.noPadding?"no-padding":""} ${this.component?.cssClasses??""}" style="${s} ${this.component?.style??""}">
                    ${r?o`
                        <div class="dialog-header">
                            <mateu-event-interceptor .target="${this}" style="flex:1; min-width:0;">
                                ${t?o`<span class="dialog-title">${t}</span>`:d}
                                ${e.header?y(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):d}
                            </mateu-event-interceptor>
                            ${e.closeButtonOnHeader?o`<button class="dialog-close" @click="${this.close}" aria-label="Close">✕</button>`:d}
                        </div>`:d}
                    ${e.content?o`
                        <div class="dialog-body">
                            <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width:100%;">
                                ${y(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:d}
                    ${e.footer?o`
                        <div class="dialog-footer">
                            <mateu-event-interceptor .target="${this}" style="width:100%;">
                                ${y(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:d}
                </div>
            </div>
        `}};Zr.styles=w`
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
    `;li([g()],Zr.prototype,"opened",2);Zr=li([k("mateu-dialog")],Zr);var cu=Object.defineProperty,uu=Object.getOwnPropertyDescriptor,cs=(e,t,r,s)=>{for(var a=s>1?void 0:s?uu(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&cu(t,r,a),a};let De=class extends Et{constructor(){super(...arguments),this.opened=!1,this.maximizeSteps=0,this.collapsed=!1,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),300)},this._escListener=e=>{if(e.key!=="Escape")return;const r=this.getRootNode().querySelectorAll("mateu-drawer, mateu-dialog");r[r.length-1]===this&&(e.stopPropagation(),this.close())}}effectiveWidth(e){if(e.width)return e.width;if(!e.size)return;const t=De.SIZE_LADDER,r=Math.max(0,t.indexOf(e.size)),s=Math.min(t.length-1,r+this.maximizeSteps);return De.SIZE_WIDTHS[t[s]]}canMaximize(e){if(!e.maximizable)return!1;const t=De.SIZE_LADDER;return Math.max(0,t.indexOf(e.size??"m"))+this.maximizeSteps<t.length-1}firstUpdated(){requestAnimationFrame(()=>this.opened=!0)}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._escListener)}disconnectedCallback(){document.removeEventListener("keydown",this._escListener),super.disconnectedCallback()}render(){const e=this.component.metadata,t=e.position??"end",r=hr(e.headerTitle,this.state,this.data,this.appState,this.appData),s=hr(e.subtitle,this.state,this.data,this.appState,this.appData),a=this.effectiveWidth(e),i=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0;return o`
        ${e.modeless?d:o`
            <div class="backdrop ${this.opened?"open":""}" @click="${this.close}"></div>
        `}
        <section
                class="panel ${t} ${this.opened?"open":""} ${this.collapsed?"collapsed":""} ${this.component?.cssClasses??""}"
                role="dialog"
                aria-modal="${!e.modeless}"
                aria-label="${r??d}"
                style="${a&&t!=="bottom"?`width: ${a};`:""}${this.component?.style??""}"
        >
            <header>
                ${r?o`<div class="titles"><h3>${r}</h3>${s?o`<span class="subtitle">${s}</span>`:d}</div>`:o`<span class="spacer"></span>`}
                ${e.header?o`
                    <mateu-event-interceptor .target="${this}">${y(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:d}
                ${i?o`
                    <button class="drawer-icon" aria-label="${i.prevLabel??"Previous"}" title="${i.prevLabel??"Previous"}"
                            ?disabled="${!i.prevRoute}" @click="${()=>{i.prevRoute&&(window.location.href=i.prevRoute)}}">‹</button>
                    <button class="drawer-icon" aria-label="${i.nextLabel??"Next"}" title="${i.nextLabel??"Next"}"
                            ?disabled="${!i.nextRoute}" @click="${()=>{i.nextRoute&&(window.location.href=i.nextRoute)}}">›</button>
                `:d}
                ${e.collapsible?o`
                    <button class="drawer-icon" aria-label="${this.collapsed?"Expand":"Collapse"}" title="${this.collapsed?"Expand":"Collapse"}"
                            @click="${()=>this.collapsed=!this.collapsed}">${this.collapsed?"▴":"▾"}</button>
                `:d}
                ${this.canMaximize(e)?o`
                    <button class="drawer-icon" aria-label="Maximize" title="Maximize" @click="${()=>this.maximizeSteps++}">⤢</button>
                `:d}
                <button class="drawer-close" aria-label="Close" @click="${this.close}">✕</button>
            </header>
            ${this.collapsed?d:o`
            <div class="content ${e.noPadding?"no-padding":""}">
                ${e.content?o`
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${y(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:d}
            </div>
            ${e.footer?o`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${y(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                </footer>
            `:d}
            `}
        </section>
       `}};De.SIZE_LADDER=["s","m","l","xl"];De.SIZE_WIDTHS={s:"464px",m:"648px",l:"968px",xl:"90vw"};De.styles=w`
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
  `;cs([g()],De.prototype,"opened",2);cs([g()],De.prototype,"maximizeSteps",2);cs([g()],De.prototype,"collapsed",2);De=cs([k("mateu-drawer")],De);var pu=Object.defineProperty,hu=Object.getOwnPropertyDescriptor,fe=(e,t,r,s)=>{for(var a=s>1?void 0:s?hu(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&pu(t,r,a),a};function la(e){if(e.parentElement)return e.parentElement;const t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}let X=class extends S{constructor(){super(...arguments),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type==="keydown"){const t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{const t=e.detail,r=t.banners??[],s=t.append??!1;s?this.actionBanners=[...this.actionBanners,...r]:(this._clearActionBannerTimers(),this.actionBanners=r);const a=s?this.actionBanners.length-r.length:0;r.forEach((i,n)=>{if(i.timeoutSeconds&&i.timeoutSeconds>0){const l=a+n;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((c,p)=>p!==l)},i.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;const t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;const r=parseInt(t[1],10)-1;r>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(r))},this._onScrollSpy=()=>{if(this._tocLocked)return;const e=this._sectionCards();if(!e.length)return;const t=12,r=this.shadowRoot?.querySelector("mateu-content-header");let s=r?r.getBoundingClientRect().bottom:0;for(const n of e){if(!n.classList.contains("mateu-section--sticky"))continue;const l=n.getBoundingClientRect();l.top<=s+t+2&&(s=Math.max(s,l.bottom))}const a=s+t+4;let i=0;this._tocEntries.forEach((n,l)=>{n.el.getBoundingClientRect().top<=a&&(i=l)}),this._activeToc=i}}connectedCallback(){super.connectedCallback(),document.addEventListener("page-banners-received",this._bannersHandler),window.addEventListener("resize",this._onResize),document.addEventListener("keydown",this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("page-banners-received",this._bannersHandler),window.removeEventListener("resize",this._onResize),document.removeEventListener("keydown",this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy()}updated(e){if(super.updated(e),e.has("component")&&e.get("component")!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has("component")){const t=this.component?.metadata?.level??0;this.toggleAttribute("data-nested",t>0),this._scheduleStaticBannerTimeouts(),this.dispatchEvent(new CustomEvent("compact-changed",{detail:{compact:!!this.component?.style?.includes("--mateu-compact:1")},bubbles:!0,composed:!0})),this._scheduleTocRebuild()}}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(r=>clearTimeout(r)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((r,s)=>{r.timeoutSeconds&&r.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,s])},r.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,r)=>r!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){const t=e.theme?.toLowerCase()??"info";return t==="none"?"":t}_evalBannerText(e){return Bt(e,this.state,this.data)}_renderBanner(e,t){const r=this._evalBannerText(e.title),s=this._evalBannerText(e.description);return o`
            <div class="page-banner page-banner--${this.bannerThemeClass(e)}">
                ${r||e.hasCloseButton?o`
                    <div style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span style="font-weight: 600;">${r??""}</span>
                        ${e.hasCloseButton?o`
                            <button class="banner-close" @click=${t} title="Dismiss" aria-label="Dismiss">✕</button>
                        `:d}
                    </div>
                `:d}
                ${s?o`<p>${s}</p>`:d}
            </div>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll(".mateu-section"))}_sectionTitle(e){const t=e.querySelector('[slot="title"]')?.textContent?.trim();return t||e.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()||void 0}_rebuildToc(){const e=this._sectionCards(),t=e.map(i=>({title:this._sectionTitle(i),el:i})).filter(i=>!!i.title),r=this.component?.metadata?.toc,s=t.length>4&&e.every(i=>!i.closest("vaadin-horizontal-layout")),a=(r===!0?!0:r===!1?!1:s)&&t.length>0;this._tocEntries=t,this._tocVisible=a,this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),a?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){const e=this.shadowRoot?.querySelector("mateu-content-header");this._headerH=this._tocVisible&&e?e.offsetHeight:0,this.style.setProperty("--mateu-header-h",this._headerH+"px");const t=12;let r=this._headerH+t;for(const s of this._sectionCards())s.classList.contains("mateu-section--sticky")&&(s.style.top=r+"px",r+=s.offsetHeight+t)}_scrollContainer(){let e=la(this);for(;e;){const t=getComputedStyle(e).overflowY;if((t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight)return e;e=la(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener("scroll",this._onScrollSpy,{passive:!0}),window.addEventListener("wheel",this._unlockToc,{passive:!0}),window.addEventListener("touchstart",this._unlockToc,{passive:!0}),window.addEventListener("keydown",this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener("scroll",this._onScrollSpy),window.removeEventListener("wheel",this._unlockToc),window.removeEventListener("touchstart",this._unlockToc),window.removeEventListener("keydown",this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){const t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;const r=12;let s=this._headerH+r;for(const l of this._sectionCards()){if(l===t.el)break;l.classList.contains("mateu-section--sticky")&&(s+=l.offsetHeight+r)}const a=this._scrollContainer(),i=a?a.getBoundingClientRect().top:0,n=t.el.getBoundingClientRect().top-i-s;(a??window).scrollBy({top:n,behavior:"smooth"})}_showHeaderBand(){const e=this.component?.metadata,t=!!(e?.title||e?.subtitle||e?.toolbar?.length),r=!!this.component?.children?.some(s=>s.metadata?.type===u.Crud);return t&&!r&&!this._hasWelcomeBanner()}_hasWelcomeBanner(){const e=t=>t?.metadata?.type===u.HeroSection?!0:(t?.children??[]).some(e);return(this.component?.children??[]).some(e)}render(){const e=this.component?.metadata,s=[...(e?.banners??[]).map((i,n)=>({banner:i,index:n})).filter(({index:i})=>!this.dismissedStaticBannerIndices.has(i)).map(({banner:i,index:n})=>({banner:i,onDismiss:()=>this._dismissStaticBanner(n)})),...this.actionBanners.map((i,n)=>({banner:i,onDismiss:()=>this._dismissActionBanner(n)}))],a=o`
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
                `:d}
            </div>
            ${s.length>0?o`
                <div class="page-banners">
                    ${s.map(({banner:i,onDismiss:n})=>this._renderBanner(i,n))}
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
                            ${this._tocEntries.map((i,n)=>o`
                                <a class="page-toc__item ${n===this._activeToc?"is-active":""}"
                                   @click=${()=>this._scrollToSection(n)}
                                   title=${n<9?`${i.title} (Ctrl+Alt+${n+1})`:i.title}>
                                    <span class="page-toc__label">${i.title}</span>
                                    ${n<9?o`<span class="page-toc__key">${n+1}</span>`:d}
                                </a>
                            `)}
                        </nav>
                    </aside>
                `:d}
            </div>
            <div class="form-footer">
                ${e?.footer?.map(i=>y(this,i,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `;return o`<div style="display: flex; flex-direction: column; width: 100%;">${a}</div>`}};X.styles=w`
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
    `;fe([h()],X.prototype,"component",2);fe([h()],X.prototype,"baseUrl",2);fe([h()],X.prototype,"state",2);fe([h()],X.prototype,"data",2);fe([h()],X.prototype,"appState",2);fe([h()],X.prototype,"appData",2);fe([h()],X.prototype,"value",2);fe([h({type:Boolean})],X.prototype,"standalone",2);fe([g()],X.prototype,"actionBanners",2);fe([g()],X.prototype,"dismissedStaticBannerIndices",2);fe([g()],X.prototype,"_tocEntries",2);fe([g()],X.prototype,"_activeToc",2);fe([g()],X.prototype,"_tocVisible",2);X=fe([k("mateu-page")],X);const Us=w`
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
`,lr=e=>ee`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,di=lr(ee`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),ci=lr(ee`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),ui=lr(ee`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`);lr(ee`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`);const mu=lr(ee`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`),fu=lr(ee`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`);var vu=Object.defineProperty,bu=Object.getOwnPropertyDescriptor,H=(e,t,r,s)=>{for(var a=s>1?void 0:s?bu(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&vu(t,r,a),a};const da=["#e91e63","#1676f3","#10b981","#8b5cf6","#f59e0b","#ef4444"],gu=e=>da[Math.abs(e??0)%da.length],yu=e=>(e??"?").split(/\s+/).filter(t=>t).map(t=>t[0]).slice(0,2).join("").toUpperCase()||"?";let U=class extends S{constructor(){super(...arguments),this.localAgentUrl="http://127.0.0.1:8776",this.localAgentAlive=!1,this.menu=[],this.chatSessionId=$e(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onSpeechResult=e=>{if(this.recognition){const t=e,r=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=r,this.send(new CustomEvent("submit",{detail:{value:r},bubbles:!0,composed:!0})))}},this.probeLocalAgent=async()=>{if(this.localAgentUrl)try{const e=new AbortController,t=setTimeout(()=>e.abort(),1200),r=await fetch(this.localAgentUrl+"/health",{signal:e.signal});clearTimeout(t),this.localAgentAlive=r.ok}catch{this.localAgentAlive=!1}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{const t=e.target,r=Array.from(t.files??[]);if(t.value="",!(!r.length||!this.uploadUrl)){this.uploading=!0;try{const s=new FormData;s.append("sessionId",this.chatSessionId);for(const f of r)s.append("files",f,f.name);const a={},i=localStorage.getItem("__mateu_auth_token");i&&(a.Authorization="Bearer "+i);const n=sessionStorage.getItem("__mateu_sesion_id");n&&(a["X-Session-Id"]=n);const l=await fetch(this.uploadUrl,{method:"POST",headers:a,body:s});if(!l.ok)throw new Error(`Upload failed: ${l.status}`);const p=((await l.json()).files??[]).filter(f=>f&&f.path);this.attachments=[...this.attachments,...p]}catch(s){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${s instanceof Error?s.message:s}`,"agent")}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async e=>{this.messageInputElement?.setAttribute("disabled","disabled");const t=e.detail.value.trim(),r=this.localAgentAlive?this.localAgentUrl+"/mateu/agent/stream":this.sseUrl,s=this.attachments;if(!t&&s.length===0||!r)return;const a=s.length?`${t}${t?`

`:""}📎 ${s.map(l=>l.name).join(", ")}`:t;this.addMessage(a,"user"),this.attachments=[];const i=this.addMessage("","agent");this.startLoading();let n="";try{const l={Accept:"text/event-stream","Content-Type":"application/json"},c=localStorage.getItem("__mateu_auth_token");c&&(l.Authorization="Bearer "+c);const p=sessionStorage.getItem("__mateu_sesion_id");p&&(l["X-Session-Id"]=p);const f=this.contextProvider?.(),m=JSON.stringify({message:t,sessionId:this.chatSessionId,...s.length&&{attachments:s},...f!=null&&{context:f},...this.mcpUrl&&{mcpUrl:new URL(this.mcpUrl,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;const v=await fetch(r,{method:"POST",headers:l,body:m});if(!v.ok){const _=await v.text();throw new Error(`Servidor respondió ${v.status}: ${_}`)}const b=v.body?.getReader();if(!b)throw new Error("No se pudo obtener el reader del stream.");const x=new TextDecoder;let $="";for(;;){const{done:_,value:P}=await b.read();if(_){if($.trim().startsWith("data:")){const ve=$.trim().slice(5).trim(),Q=this.tryParseTokenUsage(ve),ae=!Q&&this.tryParseCustomEvent(ve);Q?this.tokenUsage={...this.tokenUsage,...Q}:ae?ae.event==="agent-error"?(n="⚠️ "+(ae.detail?.message??"Error desconocido del agente"),this.updateMessage(i,n)):this.dispatchEvent(new CustomEvent(ae.event,{detail:ae.detail,bubbles:!0,composed:!0})):(n+=ve,this.updateMessage(i,n))}break}const z=x.decode(P,{stream:!0});$+=z;const Y=$.split(`
`);$=Y.pop()||"";let se=!1;for(const ve of Y)if(ve.trim().startsWith("data:")){const Q=ve.trim().slice(5).trim(),ae=this.tryParseTokenUsage(Q),ie=!ae&&this.tryParseCustomEvent(Q);ae?this.tokenUsage={...this.tokenUsage,...ae}:ie?ie.event==="agent-error"?(n="⚠️ "+(ie.detail?.message??"Error desconocido del agente"),this.updateMessage(i,n)):this.dispatchEvent(new CustomEvent(ie.event,{detail:ie.detail,bubbles:!0,composed:!0})):(n+=Q+`
`,se=!0)}se&&this.updateMessage(i,n)}n||this.updateMessage(i,"⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).")}catch(l){console.error("Error en el flujo SSE:",l);const c=l?.message??String(l);(c==="Failed to fetch"||c==="network error"||c==="Load failed")&&!n?this.updateMessage(i,"⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible."):this.updateMessage(i,"⚠️ Error: "+c)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value="")},250),this.messageInputElement?.removeAttribute("disabled"),this.messageInputElement?.focus()}},this.closeChat=()=>{this.dispatchEvent(new CustomEvent("close-requested",{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{const e=this.messageInputElement?.value?.trim()??"";e&&this.send(new CustomEvent("submit",{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key==="Enter"&&(e.preventDefault(),this.submitFromInput())}}connectedCallback(){super.connectedCallback(),this.probeLocalAgent();const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){const t=new e;this.recognition=t,t.lang="es-ES",t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=r=>{console.error("Error de reconocimiento: "+r.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:"smooth"})},0)}addMessage(e,t){const r={text:e,time:new Date().toLocaleTimeString(),userName:t.includes("agent")?"Asistente":"Tú",userColorIndex:t.includes("agent")?2:1};return this.items=[...this.items,r],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((r,s)=>s===e?{...r,text:t}:r),this.scrollBottom()}tryParseCustomEvent(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const r=JSON.parse(t);if(typeof r.event=="string")return{event:r.event,detail:r.detail??{}}}catch{}return null}tryParseTokenUsage(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const r=JSON.parse(t);if("inputTokens"in r||"outputTokens"in r||"totalTokens"in r)return r}catch{}return null}buildMenuContext(e,t=[]){const r=[];for(const s of e){if(s.separator||s.remote)continue;const a=[...t,s.label];if(s.submenus&&s.submenus.length>0)r.push(...this.buildMenuContext(s.submenus,a));else{const i={path:a,navigation:{route:s.route,consumedRoute:s.consumedRoute,actionId:s.actionId??"",baseUrl:s.baseUrl,serverSideType:s.serverSideType,uriPrefix:s.uriPrefix}};s.description&&(i.description=s.description),r.push(i)}}return r}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}render(){return o`
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
                        ${fu}
                    </button>
                </div>
                <div class="scroll-container">
                    <div class="message-list" role="list">
                        ${this.items.map(e=>o`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${gu(e.userColorIndex)};">${yu(e.userName)}</div>
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
                    >${mu}</button>
                    <input class="msg-input"
                           placeholder="Message"
                           aria-label="Message"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">Send</button>
                </div>
            </div>
        `}};U.styles=[Us,w`
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
    `];H([h({attribute:!1})],U.prototype,"contextProvider",2);H([h()],U.prototype,"localAgentUrl",2);H([h({attribute:!1})],U.prototype,"mcpUrl",2);H([g()],U.prototype,"localAgentAlive",2);H([h()],U.prototype,"sseUrl",2);H([h()],U.prototype,"uploadUrl",2);H([h({attribute:!1})],U.prototype,"menu",2);H([g()],U.prototype,"attachments",2);H([g()],U.prototype,"uploading",2);H([je(".file-input")],U.prototype,"fileInputElement",2);H([h({type:Boolean,reflect:!0})],U.prototype,"expanded",2);H([h()],U.prototype,"items",2);H([je(".scroll-container")],U.prototype,"scrollContainer",2);H([je(".msg-input")],U.prototype,"messageInputElement",2);H([g()],U.prototype,"recognition",2);H([g()],U.prototype,"listening",2);H([g()],U.prototype,"recognitionAvailable",2);H([g()],U.prototype,"loading",2);H([g()],U.prototype,"elapsedSeconds",2);H([g()],U.prototype,"tokenUsage",2);U=H([k("mateu-chat")],U);var $u=Object.defineProperty,xu=Object.getOwnPropertyDescriptor,Or=(e,t,r,s)=>{for(var a=s>1?void 0:s?xu(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&$u(t,r,a),a};let Mt=class extends S{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.data&&this.createChart(this.data)}async createChart(e){const[{default:t}]=await Promise.all([Ae(()=>import("./vendor-chartjs.js").then(s=>s.a),[]),Ae(()=>import("./vendor-chartjs.js").then(s=>s.c),[])]);if(e!==this.data)return;this.chart&&this.chart.destroy();const r={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,r)}handleSlotChange(){}render(){return o`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};Mt.styles=w`
  `;Or([h()],Mt.prototype,"type",2);Or([h()],Mt.prototype,"data",2);Or([h()],Mt.prototype,"options",2);Or([je("#chart")],Mt.prototype,"chartElement",2);Mt=Or([k("mateu-chart")],Mt);var wu=Object.defineProperty,ku=Object.getOwnPropertyDescriptor,Bs=(e,t,r,s)=>{for(var a=s>1?void 0:s?ku(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&wu(t,r,a),a};let xr=class extends S{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){const{default:t}=await Ae(async()=>{const{default:s}=await import("./vendor-diagrams.js");return{default:s}},__vite__mapDeps([0,1]));if(e!==this.xml)return;this.chart&&this.chart.destroy();const r={container:this.divElement};this.chart=new t(r),this.chart.importXML(e)}handleSlotChange(){}render(){return o`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};xr.styles=w`
  `;Bs([h()],xr.prototype,"xml",2);Bs([je("#canvas")],xr.prototype,"divElement",2);xr=Bs([k("mateu-bpmn")],xr);var Cu=Object.defineProperty,Su=Object.getOwnPropertyDescriptor,dr=(e,t,r,s)=>{for(var a=s>1?void 0:s?Su(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Cu(t,r,a),a};const bs=160,We=56,_u=220,ca=110,pt=60,Eu={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},Iu={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},Pu=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];function Tu(){return"step-"+Math.random().toString(36).slice(2,8)}let $t=class extends S{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.wf={name:"New Workflow",steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value")){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){const e=this.wf.steps??[],t={};e.forEach(n=>{t[n.id]=0});let r=!0;for(;r;)r=!1,e.forEach(n=>{if(n.preconditionStepId!=null&&t[n.preconditionStepId]!==void 0){const l=t[n.preconditionStepId]+1;l>t[n.id]&&(t[n.id]=l,r=!0)}});const s={};e.forEach(n=>{const l=t[n.id]??0;(s[l]??=[]).push(n.id)});const a={...this.positions};let i=!1;Object.entries(s).forEach(([n,l])=>{const c=Number(n);l.forEach((p,f)=>{a[p]||(a[p]={x:pt+c*_u,y:pt+f*ca},i=!0)})}),i&&(this.positions=a)}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(r=>r.id===e?{...r,...t}:r)},this.emit()}addStep(){const e=Tu(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const r=Object.values(this.positions).map(a=>a.y),s=r.length?Math.max(...r)+ca:pt;this.positions={...this.positions,[e]:{x:pt,y:s}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(s=>s.id!==e).map(s=>s.preconditionStepId===e?{...s,preconditionStepId:void 0}:s)};const{[e]:t,...r}=this.positions;this.positions=r,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;const r=this.positions[t]??{x:0,y:0},s=this.toSvgPoint(e);this.dragOffset={x:s.x-r.x,y:s.y-r.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(s=>s.x))+bs+pt:600,r=e.length?Math.max(...e.map(s=>s.y))+We+pt:400;return{w:Math.max(t,600),h:Math.max(r,400)}}render(){const{w:e,h:t}=this.canvasSize(),r=this.wf.steps??[];return o`
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
                            ${r.map(s=>this.renderArrow(s))}
                            ${r.map(s=>this.renderNode(s))}
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
                    ${di}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${ci}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${ui}
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
        `}renderArrow(e){if(!e.preconditionStepId)return ee``;const t=this.positions[e.preconditionStepId],r=this.positions[e.id];if(!t||!r)return ee``;const s=t.x+bs,a=t.y+We/2,i=r.x,n=r.y+We/2,l=(s+i)/2;return ee`
            <path d="M${s},${a} C${l},${a} ${l},${n} ${i},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:pt,y:pt},r=Eu[e.type]??"#64748b",s=Iu[e.type]??"•",a=this.selectedId===e.id;return ee`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${i=>this.onNodeMouseDown(i,e.id)}"
               @click="${i=>{i.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${bs}" height="${We}" rx="8"
                      fill="white"
                      stroke="${a?r:"#e2e8f0"}"
                      stroke-width="${a?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${We}" rx="8" fill="${r}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${We}" fill="${r}"/>
                <text x="16" y="${We/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${s}</text>
                <!-- name -->
                <text x="44" y="${We/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+"…":e.name}
                </text>
                <text x="44" y="${We/2+8}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${We/2+20}" font-size="9" fill="${r}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(s=>s.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(s=>s.id!==e.id),r=(s,a)=>o`
            <div class="field">
                <label class="field-label">${s}</label>
                ${a}
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
                    ${r("ID",o`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${r("Name",o`<input class="inp" .value="${e.name}"
                        @change="${s=>this.updateStep(e.id,{name:s.target.value})}"/>`)}
                    ${r("Type",o`
                        <select class="inp" @change="${s=>this.updateStep(e.id,{type:s.target.value})}">
                            ${Pu.map(s=>o`<option value="${s}" ?selected="${e.type===s}">${s}</option>`)}
                        </select>`)}
                    ${r("Description",o`<textarea class="inp" rows="2"
                        @change="${s=>this.updateStep(e.id,{description:s.target.value})}">${e.description??""}</textarea>`)}
                    ${r("Precondition step",o`
                        <select class="inp" @change="${s=>this.updateStep(e.id,{preconditionStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>o`<option value="${s.id}" ?selected="${e.preconditionStepId===s.id}">${s.name} (${s.id})</option>`)}
                        </select>`)}
                    ${r("Precondition expression",o`<input class="inp" placeholder="JEXL expression"
                        .value="${e.preconditionExpression??""}"
                        @change="${s=>this.updateStep(e.id,{preconditionExpression:s.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}"
                               @change="${s=>this.updateStep(e.id,{parallel:s.target.checked})}"/>
                    </div>
                    ${r("Timeout (ms)",o`<input class="inp" type="number" min="0"
                        .value="${String(e.timeout??0)}"
                        @change="${s=>this.updateStep(e.id,{timeout:Number(s.target.value)})}"/>`)}
                    ${r("Retries",o`<input class="inp" type="number" min="0"
                        .value="${String(e.retries??0)}"
                        @change="${s=>this.updateStep(e.id,{retries:Number(s.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}"
                               @change="${s=>this.updateStep(e.id,{rollbackable:s.target.checked})}"/>
                    </div>
                    ${e.rollbackable?r("Compensation step",o`
                        <select class="inp" @change="${s=>this.updateStep(e.id,{compensationStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>o`<option value="${s.id}" ?selected="${e.compensationStepId===s.id}">${s.name} (${s.id})</option>`)}
                        </select>`):""}

                    ${e.type==="ACTION"?r("Topic",o`<input class="inp" placeholder="kafka.topic.name"
                        .value="${e.topic??""}"
                        @change="${s=>this.updateStep(e.id,{topic:s.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?r("Form ID",o`<input class="inp"
                        .value="${e.formId??""}"
                        @change="${s=>this.updateStep(e.id,{formId:s.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?r("Child workflow ID",o`<input class="inp"
                        .value="${e.childWorkflowDefinitionId??""}"
                        @change="${s=>this.updateStep(e.id,{childWorkflowDefinitionId:s.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),r=URL.createObjectURL(t),s=document.createElement("a");s.href=r,s.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(r)}};$t.styles=[Us,w`
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
    `];dr([h()],$t.prototype,"value",2);dr([g()],$t.prototype,"wf",2);dr([g()],$t.prototype,"positions",2);dr([g()],$t.prototype,"selectedId",2);dr([g()],$t.prototype,"showMeta",2);$t=dr([k("mateu-workflow")],$t);var Ou=Object.defineProperty,Ru=Object.getOwnPropertyDescriptor,Rr=(e,t,r,s)=>{for(var a=s>1?void 0:s?Ru(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Ou(t,r,a),a};const Lu=["string","integer","number","bool","date","time","dateTime","dateRange","money","file","array","status","component","menu","range","action","actionGroup"],zu=["regular","radio","checkbox","textarea","toggle","combobox","select","email","password","richText","listBox","html","markdown","image","icon","link","money","grid","color","choice","popover","slider","button","stars"],Au={string:"#3B82F6",integer:"#8B5CF6",number:"#6366F1",bool:"#10B981",date:"#F59E0B",time:"#F59E0B",dateTime:"#F59E0B",dateRange:"#F59E0B",money:"#EF4444",file:"#64748B",array:"#0EA5E9",status:"#EC4899",component:"#14B8A6",menu:"#94A3B8",range:"#A855F7",action:"#F97316",actionGroup:"#FB923C"};function ua(){return"field-"+Math.random().toString(36).slice(2,8)}let Nt=class extends S{constructor(){super(...arguments),this.value='{"name":"New Form","fields":[]}',this.form={name:"New Form",fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has("value"))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){const e=this.shadowRoot?.querySelector(".field-list");!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=Si.create(e,{animation:150,handle:".drag-handle",ghostClass:"sortable-ghost",onEnd:t=>{const{oldIndex:r,newIndex:s}=t;if(r===void 0||s===void 0||r===s)return;const a=[...this.form.fields],[i]=a.splice(r,1);a.splice(s,0,i),this.form={...this.form,fields:a},this.emit()}}))}emit(){const e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(r=>r.id===e?{...r,...t}:r)},this.emit()}addField(){const e=ua(),t={id:e,label:"New Field",dataType:"string"};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){const t=this.form.fields.find(i=>i.id===e);if(!t)return;const r={...t,id:ua(),label:t.label+" (copy)"},s=this.form.fields.findIndex(i=>i.id===e),a=[...this.form.fields];a.splice(s+1,0,r),this.form={...this.form,fields:a},this.selectedId=r.id,this.emit()}render(){return o`
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
                    ${di}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${ci}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${ui}
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
        `}renderRow(e){const t=Au[e.dataType]??"#64748b",r=this.selectedId===e.id;return o`
            <div class="field-row ${r?"selected":""}"
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
        `}renderPanel(){const e=this.form.fields.find(r=>r.id===this.selectedId);if(!e)return d;const t=(r,s)=>o`
            <div class="prop-field">
                <label class="prop-label">${r}</label>
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
                               @change="${r=>this.updateField(e.id,{label:r.target.value})}"/>`)}
                    ${t("Data type",o`
                        <select class="inp"
                                @change="${r=>this.updateField(e.id,{dataType:r.target.value})}">
                            ${Lu.map(r=>o`
                                <option value="${r}" ?selected="${e.dataType===r}">${r}</option>`)}
                        </select>`)}
                    ${t("Stereotype",o`
                        <select class="inp"
                                @change="${r=>this.updateField(e.id,{stereotype:r.target.value||void 0})}">
                            ${zu.map(r=>o`
                                <option value="${r}" ?selected="${(e.stereotype??"regular")===r}">${r}</option>`)}
                        </select>`)}
                    <div class="prop-field row">
                        <label class="prop-label">Required</label>
                        <input type="checkbox" ?checked="${e.required}"
                               @change="${r=>this.updateField(e.id,{required:r.target.checked})}"/>
                    </div>
                    ${t("Description / hint",o`
                        <textarea class="inp" rows="3"
                                  @change="${r=>this.updateField(e.id,{description:r.target.value||void 0})}">${e.description??""}</textarea>`)}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:"application/json"}),r=URL.createObjectURL(t),s=document.createElement("a");s.href=r,s.download=(this.form.name??"form").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(r)}};Nt.styles=[Us,w`
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
    `];Rr([h()],Nt.prototype,"value",2);Rr([g()],Nt.prototype,"form",2);Rr([g()],Nt.prototype,"selectedId",2);Rr([g()],Nt.prototype,"showMeta",2);Nt=Rr([k("mateu-form-editor")],Nt);var Du=Object.defineProperty,Fu=Object.getOwnPropertyDescriptor,et=(e,t,r,s)=>{for(var a=s>1?void 0:s?Fu(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Du(t,r,a),a};let Pe=class extends S{constructor(){super(...arguments),this.appState={},this.appData={},this.open=!1,this.activeTab="appstate",this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith("mateu-")&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset="",this._prevTarget=null,this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset=""),this._prevTarget=t,t.style.outline="2px solid #0070f3",t.style.outlineOffset="-2px",this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||"",this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener("mouseover",this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mouseover",this._onMouseover,!0),this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget=null)}_fmt(e){try{return JSON.stringify(e,null,2)??"null"}catch{return String(e)}}_renderTab(e,t){return o`
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
        `}};Pe.styles=w`
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
    `;et([h()],Pe.prototype,"appState",2);et([h()],Pe.prototype,"appData",2);et([g()],Pe.prototype,"open",2);et([g()],Pe.prototype,"activeTab",2);et([g()],Pe.prototype,"hoveredTag",2);et([g()],Pe.prototype,"hoveredId",2);et([g()],Pe.prototype,"hoveredState",2);et([g()],Pe.prototype,"hoveredData",2);et([g()],Pe.prototype,"hoveredMeta",2);Pe=et([k("mateu-debug-overlay")],Pe);var ze=(e=>(e.SetAppDataValue="SetAppDataValue",e.SetAppStateValue="SetAppStateValue",e.SetDataValue="SetDataValue",e.RunAction="RunAction",e.RunJS="RunJS",e.SetAttributeValue="SetAttributeValue",e.SetStateValue="SetStateValue",e.SetCssClass="SetCssClass",e.SetStyle="SetStyle",e))(ze||{}),pi=(e=>(e.required="required",e.disabled="disabled",e.hidden="hidden",e.pattern="pattern",e.minValue="minValue",e.maxValue="maxValue",e.minLength="minLength",e.maxLength="maxLength",e.css="css",e.style="style",e.theme="theme",e.errorMessage="errorMessage",e.description="description",e.none="none",e))(pi||{}),hi=(e=>(e.Continue="Continue",e.Stop="Stop",e))(hi||{}),Mu=Object.defineProperty,Nu=Object.getOwnPropertyDescriptor,us=(e,t,r,s)=>{for(var a=s>1?void 0:s?Nu(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Mu(t,r,a),a};let ur=null,tr=class extends Et{constructor(){super(...arguments),this.baseUrl="",this.route="",this.consumedRoute="",this.formerState={},this.applyRules=()=>{const e=this.component.rules;if(e&&e.length>0){const t=this.state,r=this.data,s=this.appState,a=this.appData,i=this.component,n=x=>ba(x,t,r,{appState:s,appData:a,component:i}),l=x=>va(x,t,r,s,a,{component:i}),c=["state","data","appState","appData","component"],p=[t,r,s,a,i],f={...this.state},m={...this.data};let v=!1,b=!1;for(let x=0;x<e.length;x++){const $=e[x];try{if(n($.filter)){if(ze.SetStateValue==$.action||ze.SetDataValue==$.action){const _=ze.SetStateValue==$.action?f:m,P=$.fieldName.split(",");for(let z=0;z<P.length;z++){const Y=P[z];if(!_[Y]||_[Y]!=$.value){const se=$.expression?l($.expression):$.value,ve=pi.none==$.fieldAttribute?Y:Y+"."+$.fieldAttribute;se!=_[ve]&&(_[ve]=se,ze.SetStateValue==$.action&&(v=!0),ze.SetDataValue==$.action&&(b=!0))}}}if(ze.RunAction==$.action&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:$.actionId},bubbles:!0,composed:!0})),ze.RunJS==$.action&&new Function(...c,$.value)(...p),ze.SetAttributeValue==$.action){const _=$.expression?n($.expression):$.value;if($.fieldAttribute=="disabled"){_?this.shadowRoot?.getElementById($.fieldName)?.setAttribute($.fieldAttribute,"disabled"):this.shadowRoot?.getElementById($.fieldName)?.removeAttribute($.fieldAttribute);continue}this.shadowRoot?.getElementById($.fieldName)?.setAttribute($.fieldAttribute,_)}if(ze.SetCssClass==$.action&&this.shadowRoot?.getElementById($.fieldName)?.setAttribute("class",$.value),ze.SetStyle==$.action&&this.shadowRoot?.getElementById($.fieldName)?.style.setProperty($.expression,$.value),hi.Stop==$.result)break}}catch(_){console.error("rule failed",$,_)}}v&&(this.state=f),b&&(this.data=m),v&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes("-"),this.checkValidations=e=>{const t=e?e.split(","):void 0,r=this.component.validations;let s=!0,a=!1;const i=this.data??{},n={...this.data??{},errors:{}};if(r){for(let l=0;l<r.length;l++){const c=r[l];if(this.skipValidation(t,c))continue;const p=(c.fieldId??"_component").split(",");for(let f=0;f<p.length;f++){const m=p[f];n.errors[m]=[]}}for(let l=0;l<r.length;l++){const c=r[l];if(!this.skipValidation(t,c))try{const p=c.condition&&c.condition.includes("${")?this._evalTemplate(c.condition):this._evalExpr(c.condition);if(c.condition&&!p){s=!1;const m=(c.fieldId??"_component").split(",");for(let v=0;v<m.length;v++){const b=m[v];let x=n.errors[b];if(x||(n.errors[b]=[]),x=n.errors[b],!i[b]){let $=c.message;try{$=this._evalTemplate(c.message)}catch{}x.push($)}}}}catch(p){console.error("validation failed",c,p)}}for(let l=0;l<r.length;l++){const c=r[l];if(this.skipValidation(t,c))continue;const p=(c.fieldId??"_component").split(",");for(let f=0;f<p.length;f++){const m=p[f];if(i.errors?[m].join(","):n.errors==""&&[m].join(",")){a=!0;break}}}(i.errors?["_component"].join(","):n.errors==""&&["_component"].join(","))&&(a=!0)}n._valid=s,n._valid!=i._valid&&(a=!0),a&&(this.data=n)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,r={};t.fieldIds.forEach(s=>{r[s]=void 0}),r.searchText=void 0,this.state={...this.state,...r}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,r={};r[t.key]=t.value,e.type=="data-changed"&&(this.data={...this.data,...r})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail;if(e.type=="value-changed"){const r={...this.state};r[t.fieldId]=t.value,this.state=r,(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("dirty",{detail:e.detail,bubbles:!0,composed:!0}));const s=this.component;s.triggers?.filter(a=>a.type==ht.OnValueChange).filter(a=>!a.propertyName||t.fieldId==a.propertyName).forEach(a=>{(!a.condition||this._evalExpr(a.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId},bubbles:!0,composed:!0}))}),s.triggers?.filter(a=>a.type==ht.AutoSave).forEach(a=>{const i=a.actionId,n=this._autoSaveTimers.get(i);n!==void 0&&clearTimeout(n),this._autoSaveTimers.set(i,setTimeout(()=>{this._autoSaveTimers.delete(i),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId},bubbles:!0,composed:!0}))},a.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{const t=e.detail;if(e.type=="action-requested"){e.preventDefault(),e.stopPropagation();const r=this.component,s=r.actions?.find(a=>a.id==t.actionId||a.id.endsWith("*")&&t.actionId.startsWith(a.id.replace("*","")));if(s){if(s&&s.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify("You first need to select some rows");return}if(s&&s.validationRequired){const i=ur??this;if(ur=null,i.checkValidations(s.fieldsToValidate),!i.data._valid){i.notifyValidationErrors();return}}ur=null;const a={...t,initiatorComponentId:this.id};s&&s.confirmationRequired?this.callAfterConfirmation(s,()=>this.requestActionCallToServerOrBubble(a,r,s)):this.requestActionCallToServerOrBubble(a,r,s)}else{const a={...t.parameters};a.initiatorState||(a.initiatorState=this.state),ur||(ur=this),this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,parameters:a},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{const e={},t=r=>{if(r)for(const s of r){const a=s.metadata;if(a?.type===u.FormField){const i=a;i.fieldId&&i.label&&(e[i.fieldId]=i.label)}t(s.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{const e=this.data?.errors??{},t=this.buildFieldLabelMap(),r=[];if(Object.entries(e).forEach(([a,i])=>{if(!Array.isArray(i))return;const n=a==="_component"?void 0:t[a]??a;i.forEach(l=>{l&&!r.some(c=>c.label===n&&c.msg===l)&&r.push({label:n,msg:l})})}),r.length===0){this.notify("There are validation errors");return}const s=`There are validation errors
`+r.map(({label:a,msg:i})=>a?`• ${a}: ${i}`:`• ${i}`).join(`
`);zt({text:s,variant:"error",position:"bottomEnd",duration:Math.max(3e3,1500+r.length*1e3)},this)},this.notify=e=>{zt({text:e,variant:"error",position:"bottomEnd",duration:3e3},this)},this.callAfterConfirmation=(e,t)=>{let r="One moment, please",s="Are you sure?",a="Yes",i="No";e.confirmationTexts&&(r=e.confirmationTexts.title,s=e.confirmationTexts.message,a=e.confirmationTexts.confirmationText,i=e.confirmationTexts.denialText);const n=document.createElement("div");n.style.cssText="position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);padding:1rem;";const l=document.createElement("div");l.style.cssText="background:var(--lumo-base-color,#fff);color:var(--lumo-body-text-color,#1a1a1a);border-radius:var(--lumo-border-radius-l,12px);box-shadow:var(--lumo-box-shadow-xl,0 12px 40px rgba(0,0,0,.3));padding:1.2rem;max-width:min(90vw,26rem);";const c=()=>{n.parentElement&&document.body.removeChild(n)},p="font:inherit;font-weight:600;padding:.45rem 1rem;border-radius:var(--lumo-border-radius-m,6px);cursor:pointer;";wi(o`
            <h3 style="margin:0 0 .5rem;">${r}</h3>
            <div style="margin-bottom:1.2rem;">${s}</div>
            <div style="display:flex;justify-content:flex-end;gap:.5rem;">
                <button style="${p}border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.25));background:var(--lumo-base-color,#fff);"
                        @click="${()=>c()}">${i}</button>
                <button style="${p}border:none;background:var(--lumo-primary-color,#1676f3);color:var(--lumo-primary-contrast-color,#fff);"
                        @click="${()=>{c(),t()}}">${a}</button>
            </div>
        `,l),n.appendChild(l),n.addEventListener("click",f=>{f.target===n&&c()}),document.body.appendChild(n)},this.requestActionCallToServerOrBubble=(e,t,r)=>{if(r&&r.bubble){const s={...e.parameters};s.initiatorState||(s.initiatorState=this.state),this.dispatchEvent(new CustomEvent("action-requested",{detail:{...e,parameters:s},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,r)},this.requestActionCallToServer=(e,t,r)=>{if(r&&r.href){window.location.href=r.href;return}if(r&&r.js)try{new Function("state","data","appState","appData","component",r.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(s){console.error("when evaluating "+r.js,s,this.component,this.state,this.data)}if(r&&r.customEvent&&this.dispatchEvent(new CustomEvent(r.customEvent.name,{detail:r.customEvent.detail,bubbles:!0,composed:!0})),!(r&&(r.js||r.customEvent))){if(e.actionId=="search"){const s=e.parameters?._searchState;s?this.state={...this.state,...s}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}this.dispatchEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:{...this.state},parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:r?.background,sse:r?.sse,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))}},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(s=>s.type==ht.OnSuccess).filter(s=>e.detail.actionId==s.calledActionId).forEach(s=>{if(!s.condition||this._evalExpr(s.condition))if(e.preventDefault(),e.stopPropagation(),s.timeoutMillis>0){const a=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId,callbackToken:a},bubbles:!0,composed:!0}))},s.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(s=>s.type==ht.OnError).filter(s=>e.detail.actionId==s.calledActionId).forEach(s=>{(!s.condition||this._evalExpr(s.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0})))})},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;const t=this.component;if(t)for(const r of t.actions??[]){const s=r.shortcut||(r.runOnEnter?"enter":null);if(s&&this._shortcutMatchesEvent(s,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return V.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has("state")&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has("component")&&(this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}_shortcutMatchesEvent(e,t){return co(e,t)}_collectShortcutTabs(){const e=this.renderRoot;if(!e)return[];const t=Array.from(e.querySelectorAll("vaadin-tab[data-shortcut]"));return e.querySelectorAll("mateu-drawer, mateu-dialog").forEach(r=>{const s=r.shadowRoot;s&&t.push(...Array.from(s.querySelectorAll("vaadin-tab[data-shortcut]")))}),t}_handleTabShortcut(e){const t=this._collectShortcutTabs();if(t.length===0)return!1;for(const r of Array.from(t)){const s=r.dataset.shortcut;if(!s||!this._shortcutMatchesEvent(s,e))continue;const a=r.closest("vaadin-tabs");if(!a)continue;const i=Array.from(a.querySelectorAll("vaadin-tab")).indexOf(r);if(!(i<0))return e.preventDefault(),a.selected=i,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.addEventListener("backend-call-failed",this.handleBackendFailed),document.addEventListener("keydown",this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.removeEventListener("backend-call-failed",this.handleBackendFailed),document.removeEventListener("keydown",this._keydownListener)}render(){return o`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?o`
                <div><ul>${this.data.errors._component.map(e=>o`<li>${e}</li>`)}</ul></div>
            `:d}</div>`}_render(){if(this.component?.type==j.ClientSide){const e=this.component;return e.metadata?.type==u.Page?xs(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==u.Crud?ws(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):V.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return o`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==j.ClientSide){const t=e;if(t.metadata?.type==u.Page)return xs(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==u.Crud)return ws(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return y(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}};tr.styles=w`
        :host {
        }

        ${xi(Er.cssText)}
        
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
  `;us([h()],tr.prototype,"baseUrl",2);us([h()],tr.prototype,"route",2);us([h()],tr.prototype,"consumedRoute",2);tr=us([k("mateu-component")],tr);const pa=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}},Uu=_d,Bu={fixed:"fixed",fullWidth:"full",edgeToEdge:"edge"},ju=new Set([u.Gantt,u.PlanningBoard,u.Kanban,u.Bpmn,u.Workflow,u.Map]),qu={landing:"fixed",form:"fixed",process:"fixed"},mi=e=>e?Bu[e]:void 0,Ut=e=>e.type==j.ClientSide?e.metadata:void 0,fi=e=>{const t=Ut(e);if(t?.type==u.Page){const r=mi(t.pageWidth);if(r)return r}for(const r of e.children??[]){const s=fi(r);if(s)return s}},vi=e=>{const t=e.pageType;if(t)return t;const r=s=>{const a=Ut(s);if(a?.type==u.Page&&a.pageType)return a.pageType;for(const i of s.children??[]){const n=r(i);if(n)return n}};return r(e)},Hu=e=>{const t=Ut(e);if(t?.type!=u.Crud)return!1;const r=t;return r.compact?!0:(r.columns??[]).some(s=>s.metadata?.editable)},es=(e,t)=>t(e)||(e.children??[]).some(r=>es(r,t)),Vu=e=>!!e&&es(e,t=>Ut(t)?.type==u.HeroSection),Wu=e=>Ut(e)?.type==u.App?!0:(e.children??[]).some(t=>Ut(t)?.type==u.App),Gu=(e,t)=>{if(!e)return"fixed";const r=mi(e.pageWidth)??fi(e);if(r)return r;if(t?.top&&Wu(e))return"edge";const s=qu[vi(e)??""];return s||(es(e,a=>{const i=Ut(a)?.type;return i!=null&&ju.has(i)})?"edge":es(e,Hu)?"full":"fixed")};var Ku=Object.defineProperty,Yu=Object.getOwnPropertyDescriptor,ke=(e,t,r,s)=>{for(var a=s>1?void 0:s?Yu(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Ku(t,r,a),a};let re=class extends is{constructor(){super(...arguments),this.consumedRoute="",this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t=="string"&&(t===""||t.startsWith("/"))&&this.consumedRoute&&this.consumedRoute!=="_empty"&&this.consumedRoute.startsWith("/")&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t.startsWith("/")&&this.uriPrefix.endsWith("/")?t=this.uriPrefix+t.substring(1):!t.startsWith("/")&&!this.uriPrefix.endsWith("/")?t=this.uriPrefix+"/"+t:t=this.uriPrefix+t),this.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==""&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:j.ClientSide,metadata:{type:u.Element,name:"div",content:"Not found"},id:"fieldId"},action:$r.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;const t=this.detail1;if(e.type=="server-side-action-requested"){let r=Uu;t.sse&&(r=Ma),r.runAction(qt,this.baseUrl,t.route??"",t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken)}},this.getCustomisedAppState=()=>{let e={...Z.value};if(this.overrides){const t=pa(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw new Error("Method not implemented.")}createRenderRoot(){return V.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.overridesParsed=pa(this.overrides),this.addEventListener("server-side-action-requested",this.actionRequestedListener),this.addEventListener("backend-call-failed",this.backendFailedListener),this.addEventListener("history-pushed",this.historyPushed),this.addEventListener("route-changed",this.routeChangedListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.actionRequestedListener),this.removeEventListener("backend-call-failed",this.backendFailedListener),this.removeEventListener("history-pushed",this.historyPushed),this.removeEventListener("route-changed",this.routeChangedListener)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(r=>r==="appState"||r==="appData")){const r=this.renderRoot.querySelector("mateu-component");if(r)return e.has("appState")&&(r.appState=this.appState),e.has("appData")&&(r.appData=this.appData),!1}return!0}updated(e){(e.has("id")||e.has("baseurl")||e.has("route")||e.has("consumedRoute")||e.has("instant"))&&(this.preventNavigation||(this.callbackToken=this.instant||$e(),this.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:"",serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,componentState:this.initialState,callbackToken:this.callbackToken},bubbles:!0,composed:!0})))),e.has("route")&&this.top&&(this.preventNavigation||this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&(this.preventNavigation=!1)}applyFragment(e){if(!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}};return}this.fragment=e,e.component&&(this.dataset.pageWidth=Gu(e.component,{top:this.top}),this.dataset.pageType=vi(e.component)??"",this.dataset.hasWelcomeBanner=String(Vu(e.component)))}render(){return o`
           ${this.fragment?.component?y(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):d}
       `}};re.styles=w`
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
  `;ke([h()],re.prototype,"consumedRoute",2);ke([h()],re.prototype,"serverSideType",2);ke([h()],re.prototype,"uriPrefix",2);ke([h()],re.prototype,"overrides",2);ke([h()],re.prototype,"homeRoute",2);ke([h()],re.prototype,"route",2);ke([h()],re.prototype,"top",2);ke([h()],re.prototype,"instant",2);ke([h()],re.prototype,"initialState",2);ke([h()],re.prototype,"appState",2);ke([h()],re.prototype,"appData",2);ke([g()],re.prototype,"fragment",2);re=ke([k("mateu-ux")],re);var Ju=Object.defineProperty,Xu=Object.getOwnPropertyDescriptor,W=(e,t,r,s)=>{for(var a=s>1?void 0:s?Xu(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Ju(t,r,a),a};let M=class extends Et{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0,this.commandPaletteDataHits=[],this.openDataHit=e=>{Tt.confirmLeave()&&(this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteDataHits=[],this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:e.route},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:e.route},bubbles:!0,composed:!0})))},this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this._openAiHandler=()=>{this.chatOpen||this.showHideIa()},this.isDark=document.documentElement.getAttribute("theme")==="dark",this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;const e=this.isDark?"dark":"light";document.documentElement.setAttribute("theme",e),localStorage.setItem("mateu-theme",e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?"detail":"detail-hidden")},this.runAction=e=>{const r=this.renderRoot.querySelector?.("mateu-component");r&&r.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){const r=e[t];if(r.selected)return r;const s=this.getSelectedOption(r.submenus);if(s)return s}return null},this.itemSelected=e=>{const t=e.detail.value;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.itemSelectedTiles=e=>{const t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))},this.mapItemsForTiles=e=>e.map(t=>({text:t.label,consumedRoute:t.consumedRoute,route:t.route,baseUrl:t.baseUrl,serverSideType:t.serverSideType,uriPrefix:t.uriPrefix,actionId:t.actionId,selected:t.selected,_menuOption:t})),this.flattenMenuForPalette=(e,t)=>{const r=[];for(const s of e)if(!s.separator)if(s.submenus&&s.submenus.length>0){const a=t?`${t} › ${s.label}`:s.label;r.push(...this.flattenMenuForPalette(s.submenus,a))}else r.push({label:s.label,breadcrumb:t,consumedRoute:s.consumedRoute,route:s.route,actionId:s.actionId,baseUrl:s.baseUrl,serverSideType:s.serverSideType,uriPrefix:s.uriPrefix});return r},this.handleCommandPaletteKeydown=(e,t)=>{const r=Math.min(t.length,10),s=r+Math.min(this.commandPaletteDataHits.length,8);if(e.key==="ArrowDown")e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,s-1);else if(e.key==="ArrowUp")e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key==="Enter"){if(this.commandPaletteSelectedIndex>=r){const i=this.commandPaletteDataHits[this.commandPaletteSelectedIndex-r];i&&this.openDataHit(i);return}const a=t[this.commandPaletteSelectedIndex];a&&(this.selectRoute(a.consumedRoute,a.route,a.actionId,a.baseUrl,a.serverSideType,a.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery="")}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return d;const e=this.component?.metadata;if(e?.commandCenterEnabled)return d;if(!e?.menu)return d;const t=this.flattenMenuForPalette(e.menu,""),r=this.commandPaletteQuery.toLowerCase(),s=r?t.filter(a=>a.label.toLowerCase().includes(r)||a.breadcrumb.toLowerCase().includes(r)):t;return o`
            <div class="cmd-backdrop" @click=${()=>{this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}>
                <div class="cmd-palette" @click=${a=>a.stopPropagation()}>
                    <div class="cmd-search-wrapper">
                        ${K("vaadin:search",void 0,"cmd-search-icon")}
                        <input
                            class="cmd-input"
                            placeholder="Go to…"
                            .value=${this.commandPaletteQuery}
                            @input=${a=>{this.commandPaletteQuery=a.target.value,this.commandPaletteSelectedIndex=0,this.fetchGlobalSearch(this.commandPaletteQuery)}}
                            @keydown=${a=>this.handleCommandPaletteKeydown(a,s)}
                        >
                    </div>
                    <div class="cmd-results">
                        ${s.slice(0,10).map((a,i)=>o`
                            <div class="cmd-result ${i===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                @click=${()=>{this.selectRoute(a.consumedRoute,a.route,a.actionId,a.baseUrl,a.serverSideType,a.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}
                                @mouseenter=${()=>{this.commandPaletteSelectedIndex=i}}
                            >
                                <span class="cmd-result-label">${a.label}</span>
                                ${a.breadcrumb?o`<span class="cmd-result-breadcrumb">${a.breadcrumb}</span>`:d}
                            </div>
                        `)}
                        ${r&&this.commandPaletteDataHits.length>0?o`
                            ${this.commandPaletteDataHits.slice(0,8).map((a,i)=>{const n=Math.min(s.length,10)+i,l=this.commandPaletteDataHits[i-1];return o`
                                    ${a.category&&a.category!==l?.category?o`
                                        <div class="cmd-category">${a.category}</div>`:d}
                                    <div class="cmd-result ${n===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                         @click=${()=>this.openDataHit(a)}
                                         @mouseenter=${()=>{this.commandPaletteSelectedIndex=n}}
                                    >
                                        <span class="cmd-result-label">${a.label}</span>
                                        ${a.description?o`<span class="cmd-result-breadcrumb">${a.description}</span>`:d}
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
                ${e.icon?K(e.icon,void 0,"rail-icon"):o`<div class="rail-icon-placeholder">${e.label.charAt(0).toUpperCase()}</div>`}
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
                            ${t.icon?K(t.icon,"font-size: 2rem; color: var(--lumo-primary-color); display: block; margin-bottom: 0.75rem;"):d}
                            <div class="nav-tile-title">${t.label}</div>
                            ${t.description?o`<div class="nav-tile-desc">${t.description}</div>`:d}
                        </div>
                    `)}
                </div>
            </div>
        `,this.goHome=()=>{const e=this.component.metadata;this.selectRoute(e.route,"_page","",void 0,void 0,void 0)},this.selectRoute=(e,t,r,s,a,i)=>{Tt.confirmLeave()&&this._selectRoute(e,t,r,s,a,i)},this._selectRoute=(e,t,r,s,a,i)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=s,this.selectedRoute=t,this.selectedServerSideType=a,this.selectedUriPrefix=i,this.instant=$e(),this.state&&this.state._route!=null&&(this.state._route=void 0);let n=this.baseUrl??"";n.indexOf("://")<0&&(n.startsWith("/")||(n="/"+n),n=window.location.origin+n),n.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let l=new URL(n+t);if(e&&l.pathname.startsWith(e)){const c=l.pathname.substring(e.length);l=new URL(l.origin+(c||"/"))}if((window.location.pathname||l.pathname)&&window.location.pathname!=l.pathname){let c=l.pathname;l.search&&(c+=l.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let p=c;this.selectedUriPrefix&&(p.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?p=this.selectedUriPrefix+p.substring(1):!p.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?p=this.selectedUriPrefix+"/"+p:p=this.selectedUriPrefix+p),p=="/_page"&&(p=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:p},bubbles:!0,composed:!0}))}}},this.mapItems=(e,t)=>e.map(r=>{if(r.submenus&&r.submenus.length>0){let s=this.mapItems(r.submenus,t);return t&&r.label.toLowerCase().includes(t)&&(s=this.mapItems(r.submenus,"")),s&&s.length>0?{consumedRoute:r.consumedRoute,text:r.label,route:r.route,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix,actionId:r.actionId,selected:t||r.selected,children:s}:void 0}if(r.separator)return t?void 0:{component:"hr"};if(!t||r.label.toLowerCase().includes(t))return{consumedRoute:r.consumedRoute,text:r.label,route:r.route,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix,actionId:r.actionId,selected:t||r.selected}}).filter(r=>r!=null),this.getSelectedIndex=e=>{if(e){const t=this.getSelectedOption(e);if(t)return e.indexOf(t)}return NaN},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?o`
                <details open class="left-menu-group">
                    <summary>${e.label}</summary>
                    <div class="left-menu-children">
                        ${e.submenus.map(t=>o`${this.renderOptionOnLeftMenu(t)}`)}
                    </div>
                </details>
`:o`<button class="left-menu-item"
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)}"
        >${e.label}</button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){const t=this.shadowRoot?.querySelector("mateu-ux");t&&t.setAttribute("instant",$e())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?o`
            ${e.map(r=>{const s=r;return o`

                        ${s.component=="hr"?o`<hr/>`:o`
                                <div class="side-nav-item ${s.selected?"side-nav-item--active":""}">
                                    <button class="side-nav-link"
                                            @click="${()=>{s.route&&!s.children&&this.selectRoute(void 0,s.route,void 0,this.baseUrl,void 0,void 0)}}">
                                        ${s.icon?K("vaadin:dashboard","margin-right:.5rem;"):d}${s.text}
                                    </button>
                                    ${s.children?o`<div class="side-nav-children">${this.renderSideNav(s.children,"children")}</div>`:d}
                                </div>
                        `}

                            `})}`:d,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}createRenderRoot(){return V.mustUseShadowRoot()?super.createRenderRoot():(M.injectLightDomStyles(),this)}static injectLightDomStyles(){if(M.lightDomStylesInjected||typeof document>"u"||(M.lightDomStylesInjected=!0,document.getElementById("mateu-app-light-styles")))return;const e=M.styles,t=Array.isArray(e)?e.map(s=>s?.cssText??"").join(`
`):e?.cssText??"";if(!t)return;const r=document.createElement("style");r.id="mateu-app-light-styles",r.textContent=t,document.head.appendChild(r)}fetchGlobalSearch(e){const t=this.component?.metadata;if(t?.globalSearchEnabled){if(clearTimeout(this._globalSearchTimer),!e){this.commandPaletteDataHits=[];return}this._globalSearchTimer=setTimeout(async()=>{try{const s=(await qt.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","cmd-palette",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(a=>a.data).find(a=>a&&a._globalsearch);this.commandPaletteDataHits=s?._globalsearch??[]}catch{this.commandPaletteDataHits=[]}},250)}}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute("theme")==="dark",this._commandPaletteHandler=e=>{this.component?.metadata?.commandCenterEnabled||((e.metaKey||e.ctrlKey)&&e.key==="k"&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0),e.key==="Escape"&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery=""))},document.addEventListener("keydown",this._commandPaletteHandler),Tt.install(),this.addEventListener("compact-changed",this._compactHandler),this.addEventListener("mateu-open-ai",this._openAiHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener("keydown",this._commandPaletteHandler),this.removeEventListener("compact-changed",this._compactHandler),this.removeEventListener("mateu-open-ai",this._openAiHandler)}updated(e){if(super.updated(e),Sc(this),this.component){const r=this.component.metadata;if(r){const s=r;if(s.favicon){let a=document.querySelector("link[rel~='icon']");a||(a=document.createElement("link"),a.rel="icon",document.head.appendChild(a)),a.href=s.favicon}e.has("component")&&(this.selectedRoute=s.homeRoute,this.selectedConsumedRoute=s.homeConsumedRoute,this.selectedServerSideType=s.homeServerSideType,this.selectedBaseUrl=s.homeBaseUrl,this.selectedUriPrefix=s.homeUriPrefix)}}e.has("commandPaletteOpen")&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(".cmd-input")?.focus()},0)}render(){return V.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}};M.lightDomStylesInjected=!1;M.styles=w`
        /* DS-neutral app chrome (replaces vaadin-app-layout / menu-bar / tabs / side-nav). */
        .m-hl { display: flex; flex-direction: row; }
        .m-vl { display: flex; flex-direction: column; }
        .m-scroll { overflow: auto; }
        .m-md { display: flex; width: 100%; height: 100%; }
        .m-md > .m-scroll { flex: 1; min-width: 0; }
        /* the AI chat panel: shown when open (slot="detail"), hidden when closed — replaces the
           vaadin-master-detail-layout detail slot that used to toggle it. */
        mateu-chat[slot="detail-hidden"] { display: none; }
        mateu-chat[slot="detail"] { display: flex; flex-direction: column; flex: 0 0 24rem; min-width: 0; }
        .m-app-layout { display: flex; flex-direction: column; width: 100%; height: 100vh; overflow: hidden; }
        .m-app-layout > .app-navbar { display: flex; align-items: center; gap: .5rem; height: 4rem; flex-shrink: 0; padding: 0 .75rem; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); background: var(--lumo-base-color, #fff); }
        .m-app-layout > .app-body { display: flex; flex: 1; min-height: 0; }
        .app-drawer { width: 16rem; flex-shrink: 0; overflow: auto; border-right: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); padding: .5rem 0; }
        .m-app-layout:not(.drawer-open) > .app-body > .app-drawer { display: none; }
        .drawer-toggle { border: none; background: transparent; font-size: 1.2rem; cursor: pointer; padding: .3rem .5rem; border-radius: var(--lumo-border-radius-m, 6px); }
        .drawer-toggle:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .drawer-search { padding: .4rem .6rem; border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2)); border-radius: var(--lumo-border-radius-m, 6px); box-sizing: border-box; font: inherit; }

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
        .app-chrome-icon-btn { border: none; background: transparent; cursor: pointer; padding: .4rem; border-radius: var(--lumo-border-radius-m, 6px); display: inline-flex; align-items: center; }
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

  `;W([g()],M.prototype,"filter",2);W([g()],M.prototype,"instant",2);W([g()],M.prototype,"selectedConsumedRoute",2);W([g()],M.prototype,"selectedRoute",2);W([g()],M.prototype,"selectedUriPrefix",2);W([g()],M.prototype,"selectedBaseUrl",2);W([g()],M.prototype,"selectedServerSideType",2);W([g()],M.prototype,"selectedParams",2);W([g()],M.prototype,"tilesMenuOption",2);W([g()],M.prototype,"railOpenOption",2);W([g()],M.prototype,"commandPaletteOpen",2);W([g()],M.prototype,"commandPaletteQuery",2);W([g()],M.prototype,"commandPaletteSelectedIndex",2);W([g()],M.prototype,"commandPaletteDataHits",2);W([g()],M.prototype,"pageCompact",2);W([je("mateu-chat")],M.prototype,"chat",2);W([g()],M.prototype,"isDark",2);W([g()],M.prototype,"chatOpen",2);W([je(".mateu-app-layout")],M.prototype,"vaadinAppLayout",2);M=W([k("mateu-app")],M);var Qu=Object.defineProperty,Zu=Object.getOwnPropertyDescriptor,nt=(e,t,r,s)=>{for(var a=s>1?void 0:s?Zu(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Qu(t,r,a),a};let Ue=class extends M{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.lastActionServerSideType=void 0,this.lastActionInitiatorComponentId=void 0,this.captureActionSST=e=>{const t=e.detail;t?.serverSideType&&(this.lastActionServerSideType=t.serverSideType,this.lastActionInitiatorComponentId=t.initiatorComponentId)},this.handleUnhandledAction=e=>{const t=e.detail;e.preventDefault(),e.stopPropagation();const r=this.shadowRoot?.querySelector("#ux_"+this.id);!r||typeof r.manageActionEvent!="function"||(this.lastActionServerSideType=this.selectedServerSideType,this.lastActionInitiatorComponentId=r.id,r.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:r.route??this.selectedRoute??"",consumedRoute:r.consumedRoute??this.selectedConsumedRoute??"",componentState:t.parameters?.initiatorState??{},parameters:t.parameters,actionId:t.actionId,serverSideType:this.selectedServerSideType??"",initiatorComponentId:r.id,initiator:r}})))},this.selectRoute=(e,t,r,s,a,i)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=s,this.selectedRoute=t,this.selectedServerSideType=a,this.selectedUriPrefix=i,this.instant=$e();let n=this.baseUrl??"";n.indexOf("://")<0&&(n.startsWith("/")||(n="/"+n),n=window.location.origin+n),n.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let l=new URL(n+t);if(e&&(t??"").startsWith(e)&&(l=new URL(n+t?.substring(e.length))),(window.location.pathname||l.pathname)&&window.location.pathname!=l.pathname){let c=l.pathname;l.search&&(c+=l.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let p=c;this.selectedUriPrefix&&(p.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?p=this.selectedUriPrefix+p.substring(1):!p.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?p=this.selectedUriPrefix+"/"+p:p=this.selectedUriPrefix+p),p=="_page"&&(p=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:p},bubbles:!0,composed:!0}))}}},this.updateRoute=e=>{e.preventDefault(),e.stopPropagation(),console.log("update route",e,this);var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.tabSelected=(e,t,r,s)=>{const a=e.detail.tab.dataset.route,i=s.menu.find(n=>n.route===a||n.path===a);i&&this.selectRoute(i.consumedRoute,i.route,i.actionId,i.baseUrl,i.serverSideType,i.uriPrefix)},this.mode=Lr.Auto,this.toggle=e=>{this.mode=this.mode==Lr.Expanded?Lr.Collapsed:Lr.Expanded,e.requestUpdate()},this.findMenuOption=(e,t)=>{for(const r of e){if(r.route===t||r.path===t||r.consumedRoute===t)return r;if(r.submenus?.length){const s=this.findMenuOption(r.submenus,t);if(s)return s}}},this.selected=(e,t,r,s)=>{const a=e.detail.item.dataset.route,i=this.findMenuOption(s.menu,a);i&&this.selectRoute(i.consumedRoute,i.route,i.actionId,i.baseUrl,i.serverSideType,i.uriPrefix)},this.renderSubmenu=e=>o`
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
                `,this.runHeaderAction=async(e,t)=>{if(t)try{await Ua(e,this,t)}catch(r){const s=document.createElement("ui5-toast");s.duration=6e3,s.textContent="La acción falló: "+r,document.body.appendChild(s),s.open=!0,setTimeout(()=>s.remove(),7e3)}},this.openHeaderActionMenu=(e,t)=>{const s=e.currentTarget.getRootNode().querySelector(`#${CSS.escape(t)}`);s&&(s.opener=e.currentTarget,s.open=!0)},this.renderContextActions=e=>o`
        ${(e.contextActions??[]).map((t,r)=>(t.children?.length??0)>0?o`
            <span slot="content" data-hide-order="2">
                <ui5-button design="Emphasized" title="${t.label}"
                            @click="${s=>this.openHeaderActionMenu(s,"header-action-menu-"+r)}">${t.label}</ui5-button>
                <ui5-menu id="header-action-menu-${r}">
                    ${t.children.map(s=>o`
                        <ui5-menu-item text="${s.label}"
                                       @click="${()=>this.runHeaderAction(e,s.actionId)}"></ui5-menu-item>`)}
                </ui5-menu>
            </span>`:o`
            <ui5-button slot="content" data-hide-order="2" design="Emphasized" title="${t.label}"
                        @click="${()=>this.runHeaderAction(e,t.actionId)}">${t.label}</ui5-button>`)}
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
                `}connectedCallback(){super.connectedCallback(),this.addEventListener("server-side-action-requested",this.captureActionSST,!0),this.addEventListener("action-requested",this.handleUnhandledAction),this.innerFragmentSubscription=mt.subscribe(e=>{if(e.fragment){const t=e.fragment;if(this.lastActionInitiatorComponentId&&t.targetComponentId===this.lastActionInitiatorComponentId&&t.state?._route!==void 0){const r=t.state._route;if(r!==""&&!r.startsWith("/")){this.lastActionInitiatorComponentId=void 0,this.lastActionServerSideType=void 0;return}const s=t.state._componentRoute||"";s&&(this.selectedConsumedRoute=s);const a=this.component?.metadata,i=s||G(this,a)||"";s||(this.selectedConsumedRoute=i||this.selectedConsumedRoute);const n=i+r;this.lastActionInitiatorComponentId=void 0,n!==this.selectedRoute&&(this.selectedRoute=n,this.lastActionServerSideType&&(this.selectedServerSideType=this.lastActionServerSideType),this.instant=$e()),this.lastActionServerSideType=void 0}}})}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.captureActionSST,!0),this.removeEventListener("action-requested",this.handleUnhandledAction),this.innerFragmentSubscription?.unsubscribe()}render(){const e=this.component?.metadata;return e.variant==_e.MEDIATOR?o`
                        <mateu-api-caller>
                            <mateu-ux
                                    route="${be(this.state,this,e)}"
                                    id="ux_${this.id}"
                                    baseUrl="${ne(this,e)}"
                                    consumedRoute="${G(this,e)}"
                                    serverSideType="${le(this,e)}"
                                    uriPrefix="${de(this,e)}"
                                    style="width: 100%;"
                                    .appState="${this.appState}"
                                    .appData="${this.appData}"
                                    instant="${this.instant}"
                                    @navigation-requested="${this.updateRoute}"
                            ></mateu-ux>
                        </mateu-api-caller>
`:_e.TABS==e.variant?o`

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
                                                route="${be(this.state,this,e)}"
                                                id="ux_${this.id}"
                                                baseUrl="${ne(this,e)}"
                                                consumedRoute="${G(this,e)}"
                                                serverSideType="${le(this,e)}"
                                                uriPrefix="${de(this,e)}"
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

            `:_e.MENU_ON_LEFT==e.variant?o`
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
                            ${t.submenus.map(r=>o`
                                <ui5-side-navigation-sub-item text="${r.label}"
                                                              data-path="${r.path}"
                                                              data-route="${r.route}"
                                                              data-consumed-route="${r.consumedRoute}"
                                                              data-action-id="${r.actionId}"
                                                              data-server-side-type="${r.serverSideType}"
                                                              data-uri-prefix="${r.uriPrefix}"
                                                              data-base-url="${r.baseUrl}"
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
                            route="${be(this.state,this,e)}"
                            id="ux_${this.id}"
                            baseUrl="${ne(this,e)}"
                            consumedRoute="${G(this,e)}"
                            serverSideType="${le(this,e)}"
                            uriPrefix="${de(this,e)}"
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
                ${e.notificationsEnabled?o`
                    <mateu-notification-bell slot="content" data-hide-order="1" .app="${e}" .baseUrl="${""}"></mateu-notification-bell>`:d}
                ${(e.contextSelectors??[]).map(t=>o`
                    <mateu-app-context-picker slot="content" data-hide-order="1" .selector="${t}" .app="${e}" .baseUrl="${""}"></mateu-app-context-picker>`)}
                ${this.renderContextActions(e)}
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
                            route="${be(this.state,this,e)}"
                            id="ux_${this.id}"
                            baseUrl="${ne(this,e)}"
                            consumedRoute="${G(this,e)}"
                            serverSideType="${le(this,e)}"
                            uriPrefix="${de(this,e)}"
                            style="width: 100%;"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                            instant="${this.instant}"
                            @navigation-requested="${this.updateRoute}"
                    ></mateu-ux>
                </mateu-api-caller>
            </div>
        </ui5-navigation-layout>`}};Ue.styles=w`
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
  `;nt([g()],Ue.prototype,"filter",2);nt([g()],Ue.prototype,"instant",2);nt([g()],Ue.prototype,"selectedConsumedRoute",2);nt([g()],Ue.prototype,"selectedRoute",2);nt([g()],Ue.prototype,"selectedUriPrefix",2);nt([g()],Ue.prototype,"selectedBaseUrl",2);nt([g()],Ue.prototype,"selectedServerSideType",2);nt([g()],Ue.prototype,"selectedParams",2);Ue=nt([k("mateu-sapui5-app")],Ue);const ep=(e,t,r,s,a)=>{const i=t.metadata;return o`
        <mateu-sapui5-app
                id="${e.id}_app"
                route="${i.homeRoute}"
                consumedRoute="${i.route}"
                baseUrl="${r}"
                .component="${t}"
                style="width: 100%;"
        ></mateu-sapui5-app>
    `},tp=(e,t,r,s,a,i,n)=>{const l=t.metadata;return o`
        
        <mateu-sapui5-form 
            baseUrl="${r}"
                .component="${t}"
                .values="${s}"
                .state="${s}"
                .data="${a}"
            .appState="${i}"
            .appData="${n}"
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??d}"
                >
                    ${t.children?.map(c=>y(e,c,r,s,a,i,n))}
            
                            ${l?.toolbar?.map(c=>o`
                   ${y(e,{metadata:c,type:j.ClientSide,slot:"toolbar"},r,s,a,i,n)}
                `)}
            
            
                ${l?.buttons?.map(c=>o`
                   ${y(e,{metadata:c,type:j.ClientSide,slot:"buttons"},r,s,a,i,n)}

                `)}

                </mateu-sapui5-form>
        
    
    `},rp=(e,t,r,s,a,i,n)=>{const l=t.metadata;return o`
        <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">

            ${l?.title&&!l.noHeader?o`
                <ui5-title>${l.title}</ui5-title>
                ${l?.subtitle?o`<p style="color: var(--sapContent_LabelColor); margin: 0;">${l.subtitle}</p>`:d}
            `:d}

            ${l?.toolbar?.length>0?o`
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${l.toolbar.map(c=>y(e,{metadata:c,type:j.ClientSide},r,s,a,i,n))}
                </div>
            `:d}

            ${t.children?.map(c=>y(e,c,r,s,a,i,n))}

            ${l?.buttons?.length>0?o`
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--sapGroup_ContentBorderColor);">
                    ${l.buttons.map(c=>y(e,{metadata:c,type:j.ClientSide},r,s,a,i,n))}
                </div>
            `:d}
        </div>`},ps=(e,t)=>e?e.includes("${")&&t._evalTemplate?t._evalTemplate(e):e:"",sp=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=ps(l.title,e);return o`
        <ui5-panel header-text="${c||d}" fixed
                   style="margin-bottom: 1rem; ${t.style??""}"
                   class="${t.cssClasses??d}"
                   slot="${t.slot??d}">
            <div style="display:flex; flex-direction:column; gap:.5rem; padding:.25rem 0;">
                ${t.children?.map(p=>y(e,p,r,s,a,i,n))}
            </div>
        </ui5-panel>`},ap=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=ps(l.title,e);return o`
        <div style="margin: .5rem 0; ${t.style??""}" class="${t.cssClasses??d}" slot="${t.slot??d}">
            ${c?o`<ui5-title level="H5" style="margin-bottom:.25rem;">${c}</ui5-title>`:d}
            <div style="display:flex; flex-direction:column; gap:.5rem;">
                ${t.children?.map(p=>y(e,p,r,s,a,i,n))}
            </div>
        </div>`},ip=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=m=>m?y(e,m,r,s,a,i,n):d,p=typeof l.title=="string"?l.title:"",f=l.title&&typeof l.title=="object";return o`
        <ui5-card style="${t.style??""}" class="${t.cssClasses??d}" slot="${t.slot??d}">
            ${p||l.subtitle?o`
                <ui5-card-header slot="header"
                                 title-text="${p||d}"
                                 subtitle-text="${(typeof l.subtitle=="string"?l.subtitle:"")||d}">
                </ui5-card-header>`:d}
            <div style="padding: 1rem;">
                ${f?c(l.title):d}
                ${c(l.content)}
                ${t.children?.map(m=>y(e,m,r,s,a,i,n))}
                ${c(l.footer)}
            </div>
        </ui5-card>`},op=e=>{const t=e.metadata;return o`<ui5-link href="${t.url??"#"}" slot="${e.slot??d}">${t.text??t.url??""}</ui5-link>`},gs=(e,t)=>{t&&e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:{}},bubbles:!0,composed:!0}))},np=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=ps(l.headerTitle,e),p=f=>f?y(e,f,r,s,a,i,n):d;return o`
        <ui5-dialog open header-text="${c||d}">
            ${p(l.content)}
            ${t.children?.map(f=>y(e,f,r,s,a,i,n))}
            ${l.footer?o`<div slot="footer" style="display:flex; gap:.5rem; padding:.5rem; justify-content:flex-end;">${p(l.footer)}</div>`:d}
        </ui5-dialog>`},lp=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=ps(l.header,e),p=l.content?y(e,l.content,r,s,a,i,n):d;return o`
        <ui5-dialog open header-text="${c||d}">
            ${p}
            <div slot="footer" style="display:flex; gap:.5rem; padding:.5rem; justify-content:flex-end;">
                ${l.canCancel?o`<ui5-button @click="${f=>gs(f.target,l.cancelActionId)}">${l.cancelText??"Cancel"}</ui5-button>`:d}
                ${l.canReject?o`<ui5-button @click="${f=>gs(f.target,l.rejectActionId)}">${l.rejectText??"No"}</ui5-button>`:d}
                <ui5-button design="Emphasized" @click="${f=>gs(f.target,l.confirmActionId)}">${l.confirmText??"OK"}</ui5-button>
            </div>
        </ui5-dialog>`},dp=e=>{const t=e.metadata,r=t.abbreviation||(t.name?t.name.split(/\s+/).map(s=>s[0]).slice(0,2).join(""):"");return o`
        <ui5-avatar slot="${e.slot??d}"
                    initials="${r||d}"
                    accessible-name="${t.name??d}">
            ${t.image?o`<img src="${t.image}" />`:d}
        </ui5-avatar>`},cp=e=>{const r=e.metadata.avatars??[];return o`
        <ui5-avatar-group type="Group" slot="${e.slot??d}">
            ${r.map(s=>{const a=s.abbreviation||(s.name?s.name.split(/\s+/).map(i=>i[0]).slice(0,2).join(""):"");return o`<ui5-avatar initials="${a||d}" accessible-name="${s.name??d}">
                    ${s.image?o`<img src="${s.image}" />`:d}
                </ui5-avatar>`})}
        </ui5-avatar-group>`},up=(e,t,r,s,a,i,n)=>{const l=t.metadata;return o`
        <span title="${l.text??""}" slot="${t.slot??d}">
            ${l.wrapped?y(e,l.wrapped,r,s,a,i,n):d}
        </span>`},pp=(e,t,r,s,a,i,n)=>{const l=t.metadata;return o`
        <ui5-carousel
                ?cyclic="${l.auto??!1}"
                arrows-placement="${l.alt?"Navigation":d}"
                style="${t.style??""}"
                class="${t.cssClasses??d}"
                slot="${t.slot??d}">
            ${t.children?.map(c=>y(e,c,r,s,a,i,n))}
        </ui5-carousel>`},hp=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=`pop-opener-${t.id}`,p=f=>{const v=f.target.getRootNode().querySelector(`#pop-${t.id}`);v&&(v.opener=c,v.open=!0)};return o`
        <span slot="${t.slot??d}">
            <span id="${c}" @click="${p}" style="cursor:pointer;">
                ${l.wrapped?y(e,l.wrapped,r,s,a,i,n):d}
            </span>
            <ui5-popover id="pop-${t.id}">
                <div style="padding:.5rem;">
                    ${l.content?y(e,l.content,r,s,a,i,n):d}
                </div>
            </ui5-popover>
        </span>`},mp=(e,t)=>{const s=t.metadata.options??[],a=n=>{n&&e.dispatchEvent(new CustomEvent("update-route",{detail:{route:n},bubbles:!0,composed:!0}))},i=n=>{if(n.submenus&&n.submenus.length>0){const l=`menu-${t.id}-${n.label}`,c=p=>{const m=p.target.getRootNode().querySelector(`#${CSS.escape(l)}`);m&&(m.opener=p.target,m.open=!0)};return o`
                <ui5-button design="Transparent" icon="${n.icon||d}" @click="${c}">${n.label}</ui5-button>
                <ui5-menu id="${l}">
                    ${n.submenus.map(p=>o`
                        <ui5-menu-item text="${p.label}" icon="${p.icon||d}"
                                       @click="${()=>a(p.path)}"></ui5-menu-item>`)}
                </ui5-menu>`}return o`<ui5-button design="Transparent" icon="${n.icon||d}" @click="${()=>a(n.path)}">${n.label}</ui5-button>`};return o`
        <div style="display:flex; flex-direction:row; gap:.25rem; align-items:center;"
             slot="${t.slot??d}">
            ${s.map(i)}
        </div>`},fp=(e,t,r,s,a,i,n)=>{const l=t.metadata;let c=t.style??"";l?.fullWidth&&(c+="width: 100%;"),l?.justification&&(c+=`justify-content: ${l.justification};`),l?.verticalAlignment&&(c+=`align-items: ${l.verticalAlignment};`);const p=l?.spacing?"1rem":"0";return o`
        <div style="display: flex; flex-direction: row; flex-wrap: ${l?.wrap?"wrap":"nowrap"}; gap: ${p}; ${c}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(f=>y(e,f,r,s,a,i,n))}
        </div>`},vp=(e,t,r,s,a,i,n)=>{const l=t.metadata;let c=t.style??"";l?.fullWidth&&(c+="width: 100%;"),l?.justification&&(c+=`justify-content: ${l.justification};`),l?.horizontalAlignment&&(c+=`align-items: ${l.horizontalAlignment};`);const p=l?.spacing?"1rem":"0";return o`
        <div style="display: flex; flex-direction: column; gap: ${p}; ${c}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(f=>y(e,f,r,s,a,i,n))}
        </div>`},bi=(e,t,r,s,a,i,n,l)=>{const c=t;if(c.type===j.ClientSide&&(c.metadata?.type===u.FormRow||c.metadata?.type===u.FormItem))return o`${c.children?.map(p=>bi(e,p,r,s,a,i,n,l))}`;if(c.type===j.ClientSide&&c.metadata?.type===u.FormField){const p=c.metadata,f=p?.colspan??1,m=p?.stereotype==="grid"&&(p?.colspan??1)<=1;if(f>1||m)return o`<div style="grid-column: ${m?"1 / -1":`span ${Math.min(f,l)}`}; min-width: 0;">
                ${y(e,t,r,s,a,i,n)}
            </div>`}return y(e,t,r,s,a,i,n)},bp=(e,t,r,s,a,i,n)=>o`${t.children?.map(l=>y(e,l,r,s,a,i,n))}`,gi=e=>(e??[]).reduce((t,r)=>{const s=r,a=s.metadata?.type;return a===u.FormRow||a===u.FormItem?t+gi(s.children):t+1},0),gp=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=l?.maxColumns&&l.maxColumns>0?l.maxColumns:2,p=Math.max(1,Math.min(c,gi(t.children)));let f=t.style??"";return l?.fullWidth&&(f+="width: 100%;"),o`
        <div style="display: grid; grid-template-columns: repeat(${p}, 1fr); gap: 1rem; ${f}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(m=>bi(e,m,r,s,a,i,n,p))}
        </div>`},yp=(e,t,r,s,a,i,n)=>{const l=t.metadata;let c=t.style??"";return l?.fullWidth&&(c+="width: 100%;"),o`
        <ui5-tabcontainer
            style="${c}"
            class="${t.cssClasses??d}"
            slot="${t.slot??d}"
        >
            ${t.children?.map(p=>{const f=p,m=f.metadata;return o`
                    <ui5-tab text="${m?.label??""}">
                        ${f.children?.map(v=>y(e,v,r,s,a,i,n))}
                    </ui5-tab>`})}
        </ui5-tabcontainer>`},$p=(e,t,r,s,a,i,n)=>{const l=t.metadata;let c=t.style??"";return l?.fullWidth&&(c+="width: 100%;"),o`
        <div style="${c}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(p=>{const f=p,m=f.metadata;return o`
                    <ui5-panel
                        header-text="${m?.label??""}"
                        ?collapsed="${!m?.active}"
                        ?disabled="${m?.disabled}"
                        style="margin-bottom: 0.5rem;"
                    >
                        ${f.children?.map(v=>y(e,v,r,s,a,i,n))}
                    </ui5-panel>`})}
        </div>`},xp=(e,t,r,s,a,i,n)=>o`
        <div style="display: flex; gap: 1rem; ${t.style??""}"
             slot="${t.slot??d}">
            <div style="flex: 1;">${t.children?.[0]?y(e,t.children[0],r,s,a,i,n):d}</div>
            <div style="flex: 1;">${t.children?.[1]?y(e,t.children[1],r,s,a,i,n):d}</div>
        </div>`,wp=(e,t,r,s,a,i,n)=>o`
        <div style="overflow: auto; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(l=>y(e,l,r,s,a,i,n))}
        </div>`,kp=(e,t,r,s,a,i,n)=>o`
        <div style="width: 100%; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(l=>y(e,l,r,s,a,i,n))}
        </div>`,Cp=(e,t,r,s,a,i,n)=>o`
        <div style="max-width: 800px; margin: auto; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(l=>y(e,l,r,s,a,i,n))}
        </div>`,Sp=(e,t,r,s,a,i,n)=>o`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(l=>y(e,l,r,s,a,i,n))}
        </div>`,_p=(e,t,r,s,a,i,n)=>o`
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; ${t.style??""}"
             class="${t.cssClasses??d}">
            ${t.children?.map(l=>y(e,l,r,s,a,i,n))}
        </div>`,Ep=(e,t,r,s,a,i,n)=>{const c=t.metadata?.boardCols,p=c?`flex: ${c}; ${t.style??""}`:`flex: 1; ${t.style??""}`;return o`
        <div style="${p}" class="${t.cssClasses??d}">
            ${t.children?.map(f=>y(e,f,r,s,a,i,n))}
        </div>`},Ip=(e,t,r,s,a)=>{const i=e.metadata,n=i.text??"",l={id:D(e.id),style:e.style??d,class:e.cssClasses??d,slot:e.slot??d};return i.container===J.h1?o`<h1 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h1>`:i.container===J.h2?o`<h2 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h2>`:i.container===J.h3?o`<h3 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h3>`:i.container===J.h4?o`<h4 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h4>`:i.container===J.h5?o`<h5 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h5>`:i.container===J.h6?o`<h6 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h6>`:i.container===J.span?o`<span id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</span>`:o`<p id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</p>`},Pp=(e,t,r)=>{const s=e.metadata,a=s?.text??"",i=s?.color??"",n=(()=>{const l=String(i).toUpperCase();return l==="SUCCESS"?"8":l==="ERROR"||l==="DANGER"?"1":l==="WARNING"?"6":l==="INFO"?"4":l==="PRIMARY"?"5":""})();return o`
        <ui5-tag
            color-scheme="${n||d}"
            style="${e.style??d}"
            slot="${e.slot??d}"
        >${a}</ui5-tag>`},Tp=e=>{const r=(e.metadata?.icon??"").replace(/^vaadin:/,"").replace(/^lumo:/,"");return o`
        <ui5-icon
            name="${r||"question-mark"}"
            style="${e.style??d}"
            class="${e.cssClasses??d}"
            slot="${e.slot??d}"
        ></ui5-icon>`},Op=e=>{const t=e.metadata,r=t?.breadcrumbs??[],s=t?.currentItemText??"";return o`
        <ui5-breadcrumbs slot="${e.slot??d}">
            ${r.map(a=>o`
                <ui5-breadcrumbs-item href="${a.link??d}">${a.text}</ui5-breadcrumbs-item>
            `)}
            ${s?o`<ui5-breadcrumbs-item>${s}</ui5-breadcrumbs-item>`:d}
        </ui5-breadcrumbs>`},Rp=e=>{const t=e.metadata;return o`
        <ui5-message-strip
            design="Information"
            style="${e.style??d}"
            slot="${e.slot??d}"
        >
            ${t?.title?o`<strong>${t.title}: </strong>`:d}
            ${t?.text??""}
        </ui5-message-strip>`},Lp=e=>{const t=e.metadata,r=t?.value??0,s=t?.label??`${r}%`,a=t?.valueState??"None";return o`
        <ui5-progress-indicator
            value="${r}"
            value-state="${a}"
            display-value="${s}"
            style="${e.style??d}"
            slot="${e.slot??d}"
        ></ui5-progress-indicator>`},zp=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=l?.summary??l?.label??"",p=l?.open??!1;return o`
        <ui5-panel
            header-text="${c}"
            ?collapsed="${!p}"
            style="${t.style??d}"
            class="${t.cssClasses??d}"
            slot="${t.slot??d}"
        >
            ${t.children?.map(f=>y(e,f,r,s,a,i,n))}
        </ui5-panel>`},Ap=e=>{const t=e.metadata,r=t?.src??t?.url??"",s=t?.alt??"";return o`
        <img
            src="${r}"
            alt="${s}"
            style="${e.style??d}"
            class="${e.cssClasses??d}"
            slot="${e.slot??d}"
        />`},Dp=e=>{const t=e.metadata;return o`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style??d}" class="${e.cssClasses??d}"
                        slot="${e.slot??d}"></mateu-markdown>`},Fp=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=(v,b)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:v,parameters:b},bubbles:!0,composed:!0}))},p=v=>{const b=[];return v?.forEach(x=>{const $=x.metadata;$?.type===u.GridGroupColumn?b.push(...p($.columns??$.content??x.children)):$&&b.push({...$,id:$.id??x.id})}),b},f=p(l.content);if(l.tree){const v=l.page?.content??[],b=f[0],x=f.slice(1),$=P=>x.map(z=>P[z.id]!=null?`${z.label}: ${P[z.id]}`:"").filter(z=>z).join(" · "),_=P=>o`
            <ui5-tree-item
                text="${String(P[b?.id??""]??"")}"
                additional-text="${$(P)||d}"
                ?has-children="${(P.children?.length??0)>0}"
                expanded
            >
                ${P.children?.map(z=>_(z))}
            </ui5-tree-item>`;return o`
            <ui5-tree no-data-text="No data."
                      style="${t.style??"width: 100%;"}" class="${t.cssClasses??d}"
                      slot="${t.slot??d}">
                ${v.map(P=>_(P))}
            </ui5-tree>`}let m=l.page?.content??[];return t.id&&s&&s[t.id]&&(m=s[t.id]),o`
        <ui5-table no-data-text="No data." overflow-mode="Popin"
                   style="${t.style??"width: 100%;"}" class="${t.cssClasses??d}"
                   slot="${t.slot??d}">
            <ui5-table-header-row slot="headerRow">
                ${f.map(v=>o`
                    <ui5-table-header-cell width="${v.width??d}">${v.label??""}</ui5-table-header-cell>
                `)}
            </ui5-table-header-row>
            ${m.map((v,b)=>o`
                <ui5-table-row row-key="${v._rowNumber??b}">
                    ${f.map(x=>o`
                        <ui5-table-cell>${Ds(v,x,c)}</ui5-table-cell>
                    `)}
                </ui5-table-row>
            `)}
        </ui5-table>`},Mp=(e,t,r,s,a,i,n)=>o`
    <mateu-sapui5-table
        id="${t.id}"
        .metadata="${t.metadata}"
        .data="${a}"
        .state="${s}"
        .appState="${i}"
        .appData="${n}"
        baseUrl="${r??""}"
        style="${t.style??d}"
        class="${t.cssClasses??d}"
        slot="${t.slot??d}"
    >
        ${t.children?.map(l=>y(e,l,r,s,a,i,n))}
    </mateu-sapui5-table>`,Np=(e,t,r,s,a,i,n)=>{const c=t.metadata.page?.content??[];return o`
        <div style="overflow-y: auto; ${t.style??""}" class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${c.map(p=>y(e,p,r,s,a,i,n))}
        </div>`},Up=(e,t,r,s,a,i,n)=>{const l=t.metadata,c=`ctx-menu-${t.id}`,p=(v,b)=>{b.path&&v?.dispatchEvent(new CustomEvent("update-route",{detail:{route:b.path},bubbles:!0,composed:!0}))},f=v=>o`
        ${v.map(b=>b.separator?o`<ui5-menu-separator></ui5-menu-separator>`:o`
                <ui5-menu-item
                    text="${b.label??""}"
                    ?disabled="${b.disabled}"
                    @click="${x=>p(x.target,b)}"
                >
                    ${b.submenus?f(b.submenus):d}
                </ui5-menu-item>`)}
    `,m=v=>{v.preventDefault();const x=v.currentTarget.getRootNode().querySelector(`#${CSS.escape(c)}`);x&&(x.opener=v.currentTarget,x.open=!0)};return o`
        <span style="${t.style??d}" class="${t.cssClasses??d}"
              slot="${t.slot??d}"
              @contextmenu="${l.activateOnLeftClick?d:m}"
              @click="${l.activateOnLeftClick?m:d}">
            ${y(e,l.wrapped,r,s,a,i,n)}
            <ui5-menu id="${c}">
                ${f(l.menu??[])}
            </ui5-menu>
        </span>`},Bp=e=>{const t=e.metadata,r=s=>s.submenus?o`
            <ui5-panel header-text="${s.label??""}" style="min-width: 12rem;">
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${s.submenus.map(a=>r(a))}
                </div>
            </ui5-panel>`:o`<ui5-link href="${s.path??d}">${s.label}</ui5-link>`;return o`
        <div style="display: flex; gap: 3rem; align-items: flex-start; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${t.menu.map(s=>r(s))}
        </div>`},jp=(e,t,r,s,a,i,n)=>{const l=t.metadata;return o`
        <div style="${t.style??d}" class="${t.cssClasses??d}"
             slot="${t.slot??d}" data-colspan="${l.colspan||d}">
            ${l.label?o`<ui5-label show-colon>${l.label}</ui5-label>`:d}
            <div>${y(e,l.content,r,s,a,i,n)}</div>
        </div>`},qp=(e,t,r,s,a,i,n)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=a?.detailComponent??null,p=!!a?.hasDetail||!!l,f=c??l;return o`
        <div style="display: flex; gap: 0; width: 100%; border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; overflow: hidden; ${t.style??""}"
             class="${t.cssClasses??d}" slot="${t.slot??d}">
            <div style="flex: 1; min-width: 0; overflow-y: auto;">
                ${y(e,t.children[0],r,s,a,i,n)}
            </div>
            <div style="flex: 1; min-width: 0; overflow-y: auto; border-left: 1px solid var(--sapNeutralBorderColor, #e5e5e5); ${p&&f?"":"display: flex; align-items: center; justify-content: center;"}">
                ${p&&f?y(e,f,r,s,a,i,n):o`<span style="color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem; padding: 1rem;">Select an item to view details</span>`}
            </div>
        </div>`},Hp=e=>{const t=e.state?.items??e.metadata?.items??[];return o`
        <div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 0.5rem; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${t.map(r=>o`
                <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                    <ui5-avatar size="XS" initials="${(r.userName??"?").split(/\s+/).map(s=>s[0]).slice(0,2).join("")}"></ui5-avatar>
                    <div>
                        ${r.userName?o`<div style="font-size: 0.75rem; color: var(--sapContent_LabelColor, #6a6d70);">${r.userName}</div>`:d}
                        <div>${r.text}</div>
                    </div>
                </div>
            `)}
        </div>`},Vp=e=>{const t=r=>{const a=r.target.parentElement?.querySelector("ui5-input"),i=a?.value??"";i&&(r.target.dispatchEvent(new CustomEvent("submit",{detail:{value:i},bubbles:!0,composed:!0})),a&&(a.value=""))};return o`
        <div style="display: flex; gap: 0.5rem; align-items: center; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            <ui5-input placeholder="Message" style="flex: 1;"
                       @keydown="${r=>{r.key==="Enter"&&t(r)}}"></ui5-input>
            <ui5-button design="Emphasized" @click="${t}">Send</ui5-button>
        </div>`},ge=e=>{const t=e.target;t.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.value,fieldId:t.id},bubbles:!0,composed:!0}))},ha=e=>{const t=e.target;t.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.checked,fieldId:t.id},bubbles:!0,composed:!0}))},Wp=e=>{const t=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},Gp=new Set([u.App,u.Page,u.Form,u.Button,u.FormField,u.HorizontalLayout,u.VerticalLayout,u.FormLayout,u.FormRow,u.FormSection,u.FormSubSection,u.Card,u.TabLayout,u.AccordionLayout,u.SplitLayout,u.MasterDetailLayout,u.Scroller,u.FullWidth,u.Container,u.BoardLayout,u.BoardLayoutRow,u.BoardLayoutItem,u.Text,u.Badge,u.Icon,u.Breadcrumbs,u.Notification,u.ProgressBar,u.Details,u.Image,u.Anchor,u.Dialog,u.Drawer,u.ConfirmDialog,u.Avatar,u.AvatarGroup,u.Tooltip,u.CarouselLayout,u.Popover,u.MenuBar,u.ContextMenu,u.Markdown,u.Grid,u.Table,u.VirtualList,u.Directory,u.CustomField,u.MessageList,u.MessageInput,u.Crud,u.Element,u.Div,u.MicroFrontend,u.Chart,u.Bpmn,u.CookieConsent,u.Map,u.Chat,u.Workflow,u.FormEditor,u.MetricCard,u.Scoreboard,u.DashboardPanel,u.DashboardLayout,u.FoldoutLayout,u.HeroSection,u.EmptyState,u.Skeleton,u.Gantt,u.PlanningBoard,u.Kanban,u.Timeline,u.ProgressSteps,u.Stat,u.Calendar,u.PricingTable,u.OrgChart,u.Heatmap,u.Funnel,u.TrendChart,u.FeatureGrid,u.Testimonials,u.Faq,u.CalloutCard,u.CommentThread,u.FileList,u.Checklist,u.ComparisonCard,u.EntityHeader,u.Meter,u.TaskProgress,u.StatusList,u.BulletedList,u.Separator,u.Notice,u.TaskQueue,u.ResourceGrid,u.OfferCard,u.AddOnPicker,u.Ledger,u.PaymentPicker,u.ProcessMonitor]);class Kp extends zd{rendererName(){return"sapui5"}supportedClientSideTypes(){return Gp}rendersCrudLayouts(){return!0}renderToolbarButton(t,r,s){const a=t,i=a.color==="error"||a.variant==="error"||a.variant==="danger"?"Negative":a.buttonStyle==="primary"?"Emphasized":"Default";return o`
            <ui5-button data-action-id="${a.id}" design="${i}" ?disabled="${a.disabled}"
                        @click="${s}">${r}</ui5-button>`}renderClientSideComponent(t,r,s,a,i,n,l,c){return u.App==r?.metadata?.type?ep(t,r,s):u.Page==r?.metadata?.type?tp(t,r,s,a,i,n,l):u.Form==r?.metadata?.type?rp(t,r,s,a,i,n,l):u.Button==r?.metadata?.type?Xd(r):u.FormField==r?.metadata?.type?fc(t,r,s,a,i):u.HorizontalLayout==r?.metadata?.type?fp(t,r,s,a,i,n,l):u.VerticalLayout==r?.metadata?.type?vp(t,r,s,a,i,n,l):u.FormLayout==r?.metadata?.type?gp(t,r,s,a,i,n,l):u.FormRow==r?.metadata?.type?bp(t,r,s,a,i,n,l):u.FormSection==r?.metadata?.type?sp(t,r,s,a,i,n,l):u.FormSubSection==r?.metadata?.type?ap(t,r,s,a,i,n,l):u.Card==r?.metadata?.type?ip(t,r,s,a,i,n,l):u.TabLayout==r?.metadata?.type?yp(t,r,s,a,i,n,l):u.AccordionLayout==r?.metadata?.type?$p(t,r,s,a,i,n,l):u.SplitLayout==r?.metadata?.type?xp(t,r,s,a,i,n,l):u.Scroller==r?.metadata?.type?wp(t,r,s,a,i,n,l):u.FullWidth==r?.metadata?.type?kp(t,r,s,a,i,n,l):u.Container==r?.metadata?.type?Cp(t,r,s,a,i,n,l):u.BoardLayout==r?.metadata?.type?Sp(t,r,s,a,i,n,l):u.BoardLayoutRow==r?.metadata?.type?_p(t,r,s,a,i,n,l):u.BoardLayoutItem==r?.metadata?.type?Ep(t,r,s,a,i,n,l):u.Text==r?.metadata?.type?Ip(r):u.Badge==r?.metadata?.type?Pp(r):u.Icon==r?.metadata?.type?Tp(r):u.Breadcrumbs==r?.metadata?.type?Op(r):u.Notification==r?.metadata?.type?Rp(r):u.ProgressBar==r?.metadata?.type?Lp(r):u.Details==r?.metadata?.type?zp(t,r,s,a,i,n,l):u.Image==r?.metadata?.type?Ap(r):u.Anchor==r?.metadata?.type?op(r):u.Dialog==r?.metadata?.type?np(t,r,s,a,i,n,l):u.ConfirmDialog==r?.metadata?.type?lp(t,r,s,a,i,n,l):u.Avatar==r?.metadata?.type?dp(r):u.AvatarGroup==r?.metadata?.type?cp(r):u.Tooltip==r?.metadata?.type?up(t,r,s,a,i,n,l):u.CarouselLayout==r?.metadata?.type?pp(t,r,s,a,i,n,l):u.Popover==r?.metadata?.type?hp(t,r,s,a,i,n,l):u.MenuBar==r?.metadata?.type?mp(t,r):u.ContextMenu==r?.metadata?.type?Up(t,r,s,a,i,n,l):u.Markdown==r?.metadata?.type?Dp(r):u.Grid==r?.metadata?.type?Fp(t,r,s,a):u.Table==r?.metadata?.type?Mp(t,r,s,a,i,n,l):u.VirtualList==r?.metadata?.type?Np(t,r,s,a,i,n,l):u.Directory==r?.metadata?.type?Bp(r):u.CustomField==r?.metadata?.type?jp(t,r,s,a,i,n,l):u.MasterDetailLayout==r?.metadata?.type?qp(t,r,s,a,i,n,l):u.MessageList==r?.metadata?.type?Hp(r):u.MessageInput==r?.metadata?.type?Vp(r):super.renderClientSideComponent(t,r,s,a,i,n,l,c)}renderFilterBar(t,r,s,a,i,n,l){const c=r?.metadata,p=m=>{const{fieldId:v,value:b}=m.detail;t.state={...t.state,[v]:b}},f=m=>{const{fieldIds:v}=m.detail,b={};v?.forEach(x=>{b[x]=void 0}),b.searchText=void 0,t.state={...t.state,...b}};return o`
            <mateu-sapui5-filter-bar
                .metadata="${c}"
                .state="${t.state}"
                .data="${i}"
                .appState="${n}"
                .appData="${l}"
                baseUrl="${s??""}"
                @search-requested="${t.search}"
                @value-changed="${p}"
                @filter-reset-requested="${f}"
                @action-requested="${m=>{m.stopPropagation(),t.dispatchEvent(new CustomEvent("action-requested",{detail:m.detail,bubbles:!0,composed:!0}))}}"
            >
                ${c?.header?.map(m=>y(t,m,s,a,i,n,l))}
            </mateu-sapui5-filter-bar>
        `}renderPagination(t,r){const s=t.id;return o`
            <mateu-sapui5-pagination
                totalElements="${t.data[s]?.page?.totalElements??0}"
                pageSize="${t.data[s]?.page?.pageSize??100}"
                pageNumber="${t.data[s]?.page?.pageNumber??0}"
                @page-changed="${t.pageChanged}"
                @fetch-more-elements="${t.fetchMoreElements}"
            ></mateu-sapui5-pagination>
        `}renderTableComponent(t,r,s,a,i,n,l){return o`
            <mateu-sapui5-table
                id="${t.id}"
                .metadata="${r?.metadata}"
                .data="${t.data}"
                .state="${a}"
                .appState="${n}"
                .appData="${l}"
                .emptyStateMessage="${a[r?.id]?.emptyStateMessage}"
                baseUrl="${s}"
                @sort-changed="${c=>{t.state.sort=c.detail.sorts,t.handleSearchRequested(void 0)}}"
                @fetch-more-elements="${t.fetchMoreElements}"
                @action-requested="${c=>{c.stopPropagation(),t.dispatchEvent(new CustomEvent("action-requested",{detail:c.detail,bubbles:!0,composed:!0}))}}"
            ></mateu-sapui5-table>
        `}}function Yp(e){const t="var(--lumo-space-m, 1rem)",r={left:"50%",transform:"translateX(-50%)"};switch(e){case"topStart":return{top:t,left:t};case"topCenter":return{top:t,...r};case"topEnd":return{top:t,right:t};case"topStretch":return{top:t,left:t,right:t};case"middle":return{top:"50%",left:"50%",transform:"translate(-50%, -50%)"};case"bottomStart":return{bottom:t,left:t};case"bottomCenter":return{bottom:t,...r};case"bottomStretch":return{bottom:t,left:t,right:t};default:return{bottom:t,right:t}}}function Jp(e){switch(e){case"success":return{bg:"var(--lumo-success-color, #2e7d32)",fg:"#fff"};case"error":return{bg:"var(--lumo-error-color, #c62828)",fg:"#fff"};case"warning":return{bg:"var(--lumo-warning-color, #f9a825)",fg:"#1a1a1a"};case"contrast":return{bg:"var(--lumo-contrast-90pct, #1a1a1a)",fg:"#fff"};default:return{bg:"var(--lumo-base-color, #fff)",fg:"var(--lumo-body-text-color, #1a1a1a)"}}}const Xp={show(e,t){const{bg:r,fg:s}=Jp(e.variant),a=Yp(e.position),i=document.createElement("div");i.setAttribute("role","status"),Object.assign(i.style,{position:"fixed",zIndex:"2000",display:"flex",alignItems:"center",gap:"0.75rem",maxWidth:"min(90vw, 28rem)",padding:"0.7rem 1rem",borderRadius:"var(--lumo-border-radius-m, 8px)",boxShadow:"var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,0.2))",background:r,color:s,font:"inherit",fontSize:"var(--lumo-font-size-s, 0.875rem)",opacity:"0",transition:"opacity 0.2s ease",...a});const n=document.createElement("span");n.textContent=e.text,i.appendChild(n);const l=()=>{i.style.opacity="0",setTimeout(()=>i.remove(),200)};if(e.undoActionId){const p=document.createElement("button");p.textContent=e.undoLabel??"Undo",p.style.cssText="margin-left: 0.25rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;",p.addEventListener("click",()=>{t.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.undoActionId,parameters:e.undoParameters??{}},bubbles:!0,composed:!0})),l()}),i.appendChild(p)}document.body.appendChild(i),requestAnimationFrame(()=>{i.style.opacity="1"});const c=e.duration??(e.undoActionId?1e4:5e3);c>0&&setTimeout(l,c)}};function Qp(){Cd(Xp)}var Zp=Object.defineProperty,eh=Object.getOwnPropertyDescriptor,lt=(e,t,r,s)=>{for(var a=s>1?void 0:s?eh(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Zp(t,r,a),a};Qp();let Be=class extends S{constructor(){super(...arguments),this.baseUrl="",this.route=void 0,this.consumedRoute="_empty",this.config=void 0,this.top="true",this.pathPrefix=void 0,this.debug=!1,this._lastUrl="",this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top=="true"){let t=e.detail.route,r=this.baseUrl??"";!t||t.startsWith("/")?r=window.location.origin+(this.pathPrefix??""):(t=(this.pathPrefix??"")+t,r.indexOf("://")<0&&(r.startsWith("/")||(r="/"+r),r=window.location.origin+r)),t.startsWith(this.pathPrefix+"/")&&(t=t.substring(this.pathPrefix?.length)),r.endsWith("/")&&t.startsWith("/")&&(t=t.substring(1));let s=new URL(r+t);if((window.location.pathname||s.pathname)&&window.location.pathname!=s.pathname){let a=s.pathname;s.search&&(a+=s.search),a&&!a.startsWith("/")&&(a="/"+a),window.history.pushState({},"",a),this._lastUrl=window.location.href}}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),Tt.markClean(),e instanceof CustomEvent){let t=e.detail.route;const r=this.renderRoot.querySelector("mateu-ux");r&&(r.setAttribute("route",t),r.setAttribute("instant",$e()))}}}createRenderRoot(){return V.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),Tt.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!Tt.confirmLeave()){window.history.pushState({},"",this._lastUrl);return}const t=e.target;this.loadUrl(t)},this.top=="true"?this.loadUrl(window):this.route&&(this.consumedRoute=""),this.config)try{const e=JSON.parse(this.config);Z.value={...Z.value,...e}}catch{Z.value={...Z.value,config:this.config}}this.addEventListener("url-update-requested",this.routeChangedListener),this.addEventListener("navigate-to-requested",this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener("url-update-requested",this.routeChangedListener),this.removeEventListener("navigate-to-requested",this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute("route",this.route),this.instant=$e(),this._lastUrl=e.location.href,e.location.search){const r=new URLSearchParams(e.location.search).get("overrides");if(r&&(this.config=r,this.config))try{const s=JSON.parse(this.config);Z.value={...Z.value,...s}}catch{Z.value={...Z.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){const t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t=="/"?"":t}addQueryParams(e,t){return e+(t.search?""+t.search:"")}extractGrossRouteFromUrl(e){const t=e.location.pathname,r=this.baseUrl&&(this.baseUrl.startsWith("http://")||this.baseUrl.startsWith("https://"))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(r)?t.substring(r.length):t}getContextPathStartingIndex(e){return e.startsWith("http:")?e.indexOf("/",7):e.startsWith("https:")?e.indexOf("/",8):0}render(){return o`
           <mateu-api-caller>
                <mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${Kr.value}"
                          .appState="${Z.value}"
                ></mateu-ux>
           </mateu-api-caller>
           ${this.debug?o`
               <mateu-debug-overlay
                   .appState="${Z.value}"
                   .appData="${Kr.value}"
               ></mateu-debug-overlay>
           `:d}
       `}};Be.styles=w`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `;lt([h()],Be.prototype,"baseUrl",2);lt([h()],Be.prototype,"route",2);lt([h()],Be.prototype,"consumedRoute",2);lt([h()],Be.prototype,"config",2);lt([h()],Be.prototype,"top",2);lt([h()],Be.prototype,"pathPrefix",2);lt([g()],Be.prototype,"instant",2);lt([h({type:Boolean})],Be.prototype,"debug",2);Be=lt([k("mateu-ui")],Be);var th=Object.getOwnPropertyDescriptor,rh=(e,t,r,s)=>{for(var a=s>1?void 0:s?th(t,r):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(a=n(a)||a);return a};let _s=class extends os{constructor(){super(...arguments),this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}render(){const e=this.component?.metadata;return o`
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
            </div>`}};_s.styles=w`
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
    `;_s=rh([k("mateu-sapui5-form")],_s);V.set(new Kp);
