const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-highcharts.js","assets/vendor-vaadin.js","assets/vendor-lit.js","assets/vendor.js","assets/vendor-ui5.js","assets/vendor-diagrams.js"])))=>i.map(i=>d[i]);
import{d as o,A as l,a as y,j as u,r as b,i as k,k as x,m as ge,D as ks,c as E,w as B,p as Ce,q as gr}from"./vendor-lit.js";import{C as m,r as yr}from"./mateu-redwood-spectra.js";import{v as $r,b as it,e as xr,f as wr,_ as J,n as Cs,p as _s,N as qt,i as _t,j as li,k as Is,l as _i,m as Mi,o as kr}from"./vendor-vaadin.js";import{S as Cr,n as ye,a as _r,b as Ir}from"./vendor.js";var se=(e=>(e.ServerSide="ServerSide",e.ClientSide="ClientSide",e))(se||{});class Sr{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(t){if(this.componentRenderer=t,typeof window<"u"){const a=t.supportedClientSideTypes?.();window.__mateuRendererInfo={name:t.rendererName?.()??t.constructor?.name??"unknown",supportedTypes:a?[...a].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(t){this.useShadowRoot=t}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(t){this.afterRenderHook=t}getAfterRenderHook(){return this.afterRenderHook}}const j=new Sr,Dt=(e,t,a,s,i,r,n,d,c)=>(t.slot=d,C(e,t,a,s,i,r,n,c)),C=(e,t,a,s,i,r,n,d)=>{if(!t)return o``;if(t.type==se.ClientSide)return j.get().renderClientSideComponent(e,t,a,s,i,r,n,d);const c=e.route,p=e.consumedRoute;return o`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${p}"
                         baseUrl="${a}"
                         slot="${t.slot??l}"
                         style="${t.style}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...s}}"
                         .data="${{...i}}"
                         .appState="${r}"
                         .appData="${n}"
        >
       </mateu-component>`},Er=640,Tr=e=>e>0&&e<Er?"accordion":"tabs";var Pr=Object.defineProperty,Or=Object.getOwnPropertyDescriptor,di=(e,t,a,s)=>{for(var i=s>1?void 0:s?Or(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Pr(t,a,i),i};let sa=class extends k{constructor(){super(...arguments),this.tabLabels=[],this.mode="tabs",this.selected=0,this.selectedChangedListener=e=>{const t=e.detail?.value;typeof t=="number"&&t>=0&&(this.selected=t)}}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{for(const t of e)this.mode=Tr(t.contentRect.width)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect(),this.resizeObserver=void 0,this.detachTabsListener()}detachTabsListener(){this.slottedTabs?.removeEventListener("selected-changed",this.selectedChangedListener),this.slottedTabs=void 0}tabsSlotChanged(e){this.detachTabsListener();const a=e.target.assignedElements().find(s=>"selected"in s);a&&(this.slottedTabs=a,a.addEventListener("selected-changed",this.selectedChangedListener),a.selected=this.selected)}select(e){this.selected=e,this.slottedTabs&&(this.slottedTabs.selected=e)}updated(){this.slottedTabs&&this.slottedTabs.selected!=this.selected&&(this.slottedTabs.selected=this.selected)}render(){return o`
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
        `}};sa.styles=y`
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
    `;di([u({type:Array})],sa.prototype,"tabLabels",2);di([b()],sa.prototype,"mode",2);di([b()],sa.prototype,"selected",2);sa=di([x("mateu-adaptive-tabs")],sa);const zr=(e,t,a,s,i,r,n)=>{const d=t.metadata;let c=t.style;return c==null&&(c=""),d.columnSpacing&&(c+="--vaadin-form-layout-column-spacing: "+d.columnSpacing+";"),d.itemRowSpacing&&(c+="--vaadin-form-layout-row-spacing: "+d.itemRowSpacing+";"),d.itemLabelSpacing&&(c+="--vaadin-form-layout-label-spacing: "+d.itemLabelSpacing+";"),d.labelsAside&&(c+="--vaadin-form-item-label-width: 10rem;"),d.fullWidth&&(c+="width: 100%;"),o`
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
                   ${t.children?.map(p=>Ss(d,e,p,a,s,i,r,n))}
               </vaadin-form-layout>
            `},Ss=(e,t,a,s,i,r,n,d)=>a.type==se.ClientSide&&a.metadata?.type==m.FormRow?Dr(e,t,a,s,i,r,n,d):e.labelsAside?Rr(t,a,s,i,r,n,d):C(t,a,s,i,r,n,d),Rr=(e,t,a,s,i,r,n)=>{if(t.type==se.ClientSide&&t.metadata?.type==m.FormField&&t.metadata.label){const d=t.metadata,c=d.label?.includes("${")?e._evalTemplate(d.label):d.label;return o`
                       <vaadin-form-item data-colspan="${d.colspan}">
                           <label slot="label">${c}</label>
                           ${C(e,t,a,s,i,r,n,!0)}
                       </vaadin-form-item>
                   `}return C(e,t,a,s,i,r,n)},Dr=(e,t,a,s,i,r,n,d)=>o`
        <vaadin-form-row>
            ${a.children?.map(c=>Ss(e,t,c,s,i,r,n,d))}
        </vaadin-form-row>
            `,Ar=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=(d.padding?" padding":"")+(d.spacing?" spacing":"")+(d.spacingVariant?" spacing-"+d.spacingVariant:"")+(d.wrap?" wrap":"");let p=t.style;return d.fullWidth&&(p=p?"width: 100%;"+p:"width: 100%;"),d.justification&&(p=p?"justify-content: "+d.justification+";"+p:"justify-content: "+d.justification+";"),d.verticalAlignment&&(p=p?"align-items: "+d.verticalAlignment+";"+p:"align-items: "+d.verticalAlignment+";"),o`
               <vaadin-horizontal-layout 
                       style="${p}" 
                       class="${t.cssClasses}"
                       theme="${c}"
                       slot="${t.slot??l}"
               >
                   ${t.children?.map(h=>C(e,h,a,s,i,r,n))}
               </vaadin-horizontal-layout>
            `},Lr=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=(d.padding?" padding":"")+(d.spacing?" spacing":"")+(d.spacingVariant?" spacing-"+d.spacingVariant:"")+(d.wrap?" wrap":"");let p=t.style;return d.fullWidth&&(p=p?"width: 100%;"+p:"width: 100%;"),d.justification&&(p=p?"justify-content: "+d.justification+";"+p:"justify-content: "+d.justification+";"),d.horizontalAlignment&&(p=p?"align-items: "+d.horizontalAlignment+";"+p:"align-items: "+d.horizontalAlignment+";"),o`
        <vaadin-vertical-layout
                style="${p}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??l}"
        >
            ${t.children?.map(h=>C(e,h,a,s,i,r,n))}
        </vaadin-vertical-layout>
    `},Mr=(e,t,a,s,i,r,n)=>{const d=t.metadata;let c=t.style;return d.fullWidth&&(c=c?"width: 100%;"+c:"width: 100%;"),o`
               <vaadin-split-layout 
                       style="${c}" 
                       class="${t.cssClasses}"
                       orientation="${d.orientation??l}"
                       theme="${d.variant??l}"
                       slot="${t.slot??l}"
               >
                   <master-content>${C(e,t.children[0],a,s,i,r,n)}</master-content>
                   <detail-content>${C(e,t.children[1],a,s,i,r,n)}</detail-content>
               </vaadin-split-layout>
            `},qr=(e,t,a,s,i,r,n)=>{const d=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,p=!!i?.hasDetail||!!d,h=c??d;return o`
               <vaadin-master-detail-layout ?has-detail="${p}"
                                            style="${t.style}"
                                            class="${t.cssClasses}"
                                            slot="${t.slot??l}">
                   <div>${C(e,t.children[0],a,s,i,r,n)}</div>
                   ${p&&h?o`<div slot="detail">${C(e,h,a,s,i,r,n)}</div>`:o`<div slot="detail" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Select an item to view details</div>`}
               </vaadin-master-detail-layout>
            `},Fr=(e,t,a,s,i,r,n)=>{const d=t.metadata;let c=t.style;c==null&&(c=""),d.fullWidth&&(c+="width: 100%;");let p=d.variant;p=="equalWidth"&&(p="equal-width-tabs");const h=Math.max(0,(t.children??[]).findIndex(f=>f.metadata.active)),v=f=>{f.target.selected=h};if(d.adaptable){const f=(t.children??[]).map(w=>{const $=w.metadata.label;return $?.includes("${")?e._evalTemplate($):$});return o`
            <mateu-adaptive-tabs
                    .tabLabels="${f}"
                    style="${c}"
                    class="${t.cssClasses}"
                    slot="${t.slot??l}"
            >
                <vaadin-tabs slot="tabs"
                             theme="${p??l}"
                             orientation="${d.orientation??l}"
                             @items-changed=${v}
                >
                    ${t.children?.map(w=>w).map((w,$)=>{const g=w.metadata.shortcut;return o`
                        <vaadin-tab id="${f[$]}"
                                    style="${w.style}"
                                    class="${w.cssClasses}"
                                    data-shortcut="${g??l}"
                        >${f[$]}</vaadin-tab>`})}
                </vaadin-tabs>

                ${t.children?.map((w,$)=>o`
                    <div slot="panel-${$}" style="padding: var(--lumo-space-m) 0;">
                        ${w.children?.map(g=>C(e,g,a,s,i,r,n))}
                    </div>`)}
            </mateu-adaptive-tabs>
                `}return o`
        <vaadin-tabsheet
                theme="${p??l}"
                style="${c}"
                slot="${t.slot??l}"
        >
            <vaadin-tabs slot="tabs"
                         style="${c}"
                         class="${t.cssClasses}"
                         orientation="${d.orientation??l}"
                         @items-changed=${v}
            >
                ${t.children?.map(f=>f).map(f=>{const w=f.metadata.label,$=w?.includes("${")?e._evalTemplate(w):w,g=f.metadata.shortcut;return o`
                    <vaadin-tab id="${$}"
                                style="${f.style}"
                                class="${f.cssClasses}"
                                data-shortcut="${g??l}"
                    >${$}</vaadin-tab>`})}
            </vaadin-tabs>

            ${t.children?.map(f=>Nr(e,f,a,s,i,r,n))}
        </vaadin-tabsheet>
            `},Nr=(e,t,a,s,i,r,n)=>{const d=t.metadata.label,c=d?.includes("${")?e._evalTemplate(d):d;return o`
        <div tab="${c}" style="padding: var(--lumo-space-m) 0;">
                   ${t.children?.map(p=>C(e,p,a,s,i,r,n))}
               </div>
            `},Ur=(e,t,a,s,i,r,n)=>{const d=t.metadata;t.style,d.fullWidth;let c=0;if(t.children){for(let p=0;p<t.children.length;p++)if(t.children[p].metadata?.active){c=p;break}}return o`
               <vaadin-accordion
                       style="${t.style}"
                       class="${t.cssClasses}"
                       opened="${c}"
                       slot="${t.slot??l}"
               >
                   ${t.children?.map(p=>jr(e,p,a,s,i,r,n,d.variant))}
               </vaadin-accordion>
            `},jr=(e,t,a,s,i,r,n,d)=>{const c=t.metadata,p=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return o`
        <vaadin-accordion-panel style="${t.style}"
                                class="${t.cssClasses}"
                                theme="${d??l}"
                                ?opened="${c.active}"
                                ?disabled="${c.disabled}">
            <vaadin-accordion-heading slot="summary">${p}</vaadin-accordion-heading>
            ${t.children?.map(h=>C(e,h,a,s,i,r,n))}
        </vaadin-accordion-panel>
            `},Br=(e,t,a,s,i,r,n)=>o`
               <vaadin-scroller style="${t.style}" 
                                class="${t.cssClasses}"
                                slot="${t.slot??l}">
                   ${t.children?.map(d=>C(e,d,a,s,i,r,n))}
               </vaadin-scroller>
            `,Vr=(e,t,a,s,i,r,n)=>o`
               <div style="width: 100%; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??l}">
                   ${t.children?.map(d=>C(e,d,a,s,i,r,n))}
               </div>
            `,Hr=(e,t,a,s,i,r,n)=>o`
               <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??l}">
                   ${t.children?.map(d=>C(e,d,a,s,i,r,n))}
               </div>
            `,Wr=(e,t,a,s,i,r,n)=>o`
        <vaadin-board style="${t.style}" 
                      class="${t.cssClasses}"
                      slot="${t.slot??l}">
            ${t.children?.map(d=>C(e,d,a,s,i,r,n))}
        </vaadin-board>
            `,Gr=(e,t,a,s,i,r,n)=>o`
        <vaadin-board-row style="${t.style}" class="${t.cssClasses}">
                   ${t.children?.map(d=>C(e,d,a,s,i,r,n))}
               </vaadin-board-row>
            `,Kr=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        <div style="${t.style}" 
             class="${t.cssClasses}"
             board-cols="${d.boardCols??l}"
        >
                   ${t.children?.map(c=>C(e,c,a,s,i,r,n))}
               </div>
            `},ra=(e,t)=>new Function(...Object.keys(t),"return `"+e+"`")(...Object.values(t)),ua=(e,t,a)=>({state:e??{},data:t??{},...a});function Oe(e,t,a,s){if(!e?.includes("${"))return e;try{return ra(e,ua(t,a,s))}catch(i){return console.warn(`Mateu: could not interpolate "${e}":`,i),e}}const ht=(e,t,a)=>{if(e&&e.indexOf("${")>=0)try{return ra(e,ua(t,a))}catch(s){return s.message}return e},ka=(e,t,a,s,i)=>{if(!e)return e;const r=ua(t,a,{appState:s??{},appData:i??{}});let n=e;try{if(n=ra(e,r),n.includes("${"))try{n=ra(n,r)}catch(d){n="when evaluating nested "+e+" :"+d+", where data is "+a+" and state is "+t+" and app state is "+s+" and app data is "+i,console.error(d,n,t,a,s,i)}}catch(d){n="when evaluating "+e+" :"+d+", where data is "+a+" and state is "+t+" and app state is "+s+" and app data is "+i,console.error(d,n,t,a,s,i)}return n},Es=(e,t,a,s,i,r)=>{const n=ua(t,a,{appState:s??{},appData:i??{},...r}),d=ra(e,n);return new Function(...Object.keys(n),`return (${d})`)(...Object.values(n))},Ts=(e,t,a,s)=>{const i=ua(t,a,s);return new Function(...Object.keys(i),`return (${e})`)(...Object.values(i))},Yr=(e,t,a,s)=>ra(e,ua(t,a,s)),Jr=(e,t,a)=>{const s=e.metadata;return o`<vaadin-avatar
            img="${s.image}"
            name="${Ve(s.name,t,a)}"
            abbr="${s.abbreviation}"
            style="${e.style}" class="${e.cssClasses}"
            slot="${e.slot??l}"
    ></vaadin-avatar>`},Ve=(e,t,a)=>typeof e=="string"&&e.includes("${")?Oe(e,t,a):e,Xr=e=>{const t=e.metadata;return o`<vaadin-avatar-group max-items-visible="${t.maxItemsVisible}"
                                     .items="${t.avatars}"
                                     style="${e.style}" class="${e.cssClasses}"
                                     slot="${e.slot??l}">
    </vaadin-avatar-group>`},Qr=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=p=>o`
            ${C(e,p,a,s,i,r,n)}
`;return o`
        <vaadin-virtual-list
                .items="${d.page.content}"
                ${$r(c,[])}
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??l}"
        ></vaadin-virtual-list>
    `};var Zr=Object.defineProperty,eo=Object.getOwnPropertyDescriptor,qi=(e,t,a,s)=>{for(var i=s>1?void 0:s?eo(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Zr(t,a,i),i};let Ca=class extends k{constructor(){super(...arguments),this.variant="text",this.count=3}render(){const e=Array.from({length:Math.max(1,this.count)});return this.variant=="card"?o`${e.map(()=>o`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant=="grid"?o`${e.map(()=>o`<div class="bone row"></div>`)}`:this.variant=="form"?o`${e.map(()=>o`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:o`${e.map(()=>o`<div class="bone line"></div>`)}`}};Ca.styles=y`
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
    `;qi([u()],Ca.prototype,"variant",2);qi([u({type:Number})],Ca.prototype,"count",2);Ca=qi([x("mateu-skeleton")],Ca);const to=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},At=(e,t,a,s,i,r)=>o`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${t??"🗂"}</span>
            ${a?o`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${a}</span>`:l}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${s??e??"Nothing here yet."}</span>
            ${i&&r?o`
                <vaadin-button theme="tertiary" style="margin-top: .25rem;" @click="${n=>to(n,i)}">${r}</vaadin-button>
            `:l}
        </div>
    `,ao=e=>{const t=e.metadata;return o`
        <div style="${e.style??l}" class="${e.cssClasses??l}" slot="${e.slot??l}">
            ${At(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},io=e=>{const t=e.metadata;return o`
        <mateu-skeleton
                variant="${t.variant??"text"}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-skeleton>
    `},Ha=e=>!!e&&typeof e=="object"&&"__mateuGroup"in e,Ii=e=>String(e??""),so=(e,t,a)=>{const s=e??[];if(!t||!a||a.length===0)return s;const i=[];let r,n=!1;return s.forEach((d,c)=>{const p=Ii(d?.[t]);if(!n||p!==r){const h=a.find(v=>Ii(v.value)===p)??{value:p,count:s.filter(v=>Ii(v?.[t])===p).length,aggregates:{}};i.push({__mateuGroup:h,__mateuGroupBy:t,_rowNumber:`__mateuGroup:${c}:${p}`}),n=!0,r=p}i.push(d)}),i},Ps=(e,t)=>e==null?"":t.dataType==="money"||t.stereotype==="money"?new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(e):t.aggregate==="count"?new Intl.NumberFormat(void 0,{maximumFractionDigits:0}).format(Math.round(e)):new Intl.NumberFormat(void 0,{maximumFractionDigits:2}).format(e),ro=(e,t)=>e&&t.includes(e)?e:t.find(a=>!!a),oo=(e,t,a)=>{const s=e.__mateuGroup;return t.id===a?`${s.value} (${s.count})`:t.aggregate?Ps(s.aggregates?.[t.id],t):""},no=(e,t,a)=>{const s=t?.aggregates;if(!s||!e.some(n=>n.aggregate))return;const i={};e.forEach(n=>{n.aggregate&&s[n.id]!=null&&(i[n.id]=Ps(s[n.id],n))});const r=e[0];if(r&&i[r.id]===void 0){const n=t?.page?.totalElements;i[r.id]=a&&r.id===a&&n!=null?`Total (${n})`:"Total"}return i};var wa=(e=>(e.NONE="NONE",e.INFO="INFO",e.SUCCESS="SUCCESS",e.WARNING="WARNING",e.DANGER="DANGER",e))(wa||{});const lo=(e,t,a)=>{const s=e[a.path];return s?o`<span theme="badge pill ${ci(s.type)}">${s.message}</span>`:o``},ci=e=>{switch(e){case wa.SUCCESS:return"success";case wa.WARNING:return"warning";case wa.DANGER:return"error";case wa.NONE:return"contrast"}return""},co=(e,t,a)=>{const i=e[a.path]?"vaadin:check":"vaadin:minus";return o`<vaadin-icon 
                    icon="${i}"
                    style="height: 16px; width: 16px; color: ${"var(--lumo-body-text-color)"};"
            ></vaadin-icon>`},uo=(e,t,a,s,i)=>{const r=e[a.path];let n=r;return s=="money"&&r&&r.locale&&r.currency?n=new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(r.value):i=="money"&&(n=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(r)),o`${n}`},as=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},po=(e,t,a,s,i,r)=>{const n=a.xcolumn??r;if(n.text){if(n.actionId)return o`<a href="javascript: void(0);" @click="${p=>as(a,n,e)}">${n.text}</a>`;const c=e[a.path];return o`<a href="${c}">${n.text}</a>`}if(s=="string"){if(n.actionId){const p=e[a.path];return o`<a href="javascript: void(0);" @click="${h=>as(a,n,e)}">${p}</a>`}const c=e[a.path];return o`<a href="${c}">${c}</a>`}const d=e[a.path];return o`<a href="${d.href}">${d.text}</a>`},ho=(e,t,a,s,i)=>s=="string"?e[a.path].split(",").map(d=>o`<vaadin-icon icon="${d}" style="width: 16px;"></vaadin-icon>`):e[a.path].split(",").map(n=>o`<vaadin-icon icon="${n.icon}" style="width: 16px;"></vaadin-icon>`),mo=(e,t,a,s,i)=>{const r=e[a.path];return o`${ge(r)}`},vo=(e,t,a,s,i,r)=>{if(s=="string"){const d=e[a.path],c="max-height: 40px; "+(r.style??"");return o`<img src="${d}" style="${c}">`}const n=e[a.path];return o`<img src="${n.src}" style="${r.style??""}">`},fo=e=>{const t={_clickedRow:e.target.row};e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+e.detail.value.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},is=e=>{const t={_clickedRow:e.target.row},a=e.target.action;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+a.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},bo=e=>{const t=document.createElement("vaadin-context-menu-item"),a=document.createElement("vaadin-icon");return a.style.color="var(--lumo-secondary-text-color)",a.style.marginInlineEnd="var(--lumo-space-s)",a.style.padding="var(--lumo-space-xs)",a.setAttribute("icon",e.icon),t.appendChild(a),e.label&&t.appendChild(document.createTextNode(e.label)),t.disabled=e.disabled,t},ss=(e,t,a)=>{const s=e[a.path]?.actions?.map(i=>i.icon?{component:bo(i),methodNameInCrud:i.methodNameInCrud}:{...i,text:i.label});return!s||s.length==0?o``:o`
                                     <vaadin-menu-bar
                                         .items=${[{text:"···",children:s}]}
                                         theme="tertiary"
                                         .row="${e}"
                                         data-testid="menubar-${a.path}"
                                         @item-selected="${fo}"
                                     ></vaadin-menu-bar>
                                   `},go=(e,t,a)=>{if(a.path=="select"){const r={actionId:a.path,icon:"",label:"Select",disabled:!1,methodNameInCrud:"select"};return o`
         <vaadin-button theme="tertiary" title="Select" @click="${is}" .row="${e}" .action="${r}">
             Select
         </vaadin-button>
    `}const s=a.path&&e[a.path]?.methodNameInCrud?e[a.path]:e.action;if(!s)return o``;const i=s.icon&&!s.label;return o`
         <vaadin-button theme="tertiary${i?" icon":""}" title="${s.label||l}" @click="${is}" .row="${e}" .action="${s}">
             ${s.icon?o`<vaadin-icon icon="${s.icon}"></vaadin-icon>`:l}
             ${s.label?s.label:l}
         </vaadin-button>
    `},yo=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},$o=(e,t,a,s,i,r)=>{const n=a.xcolumn??r;if(n.actionId){const c=n.text||e[a.path];return o`
            <vaadin-button theme="tertiary" @click="${p=>yo(a,n,e)}" .row="${e}">
                ${c}
            </vaadin-button>
        `}const d=e[a.path];return o`<a href="${d}">${n.text||d}</a>`},xo=(e,t,a,s,i,r,n,d,c)=>{const p=e[a.path];return C(s,p,i,r,n,d,c)},Ri=new WeakMap,wo=(e,t)=>Ri.get(e)?.[t],ko=(e,t,a)=>{let s=Ri.get(e);s||(s={},Ri.set(e,s)),s[t]=a},rs=e=>{if(e==null||e==="")return null;const t=Number(e);return Number.isNaN(t)?null:t},Co=(e,t,a,s)=>{const i=a?.field?.fieldId,r=c=>{if(e[t.id]===c||e[t.id]==null&&(c===""||c==null))return;if(e[t.id]=c,!i){a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"update-row",parameters:{_editedRow:{...e}}},bubbles:!0,composed:!0}));return}const h=(a?.state??s)[i];a.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:i,value:Array.isArray(h)?[...h]:h},bubbles:!0,composed:!0}))},n=e[t.id],d=n==null?"":String(n);switch(t.editorType){case"boolean":return o`<vaadin-checkbox ?checked=${!!n} @checked-changed=${c=>r(c.detail.value)}></vaadin-checkbox>`;case"integer":return o`<vaadin-integer-field theme="small" style="width:100%;" .value=${d} @change=${c=>r(rs(c.target.value))}></vaadin-integer-field>`;case"number":return o`<vaadin-number-field theme="small" style="width:100%;" .value=${d} @change=${c=>r(rs(c.target.value))}></vaadin-number-field>`;case"date":return o`<vaadin-date-picker theme="small" style="width:100%;" .value=${d} @value-changed=${c=>r(c.detail.value)}></vaadin-date-picker>`;case"time":return o`<vaadin-time-picker theme="small" style="width:100%;" .value=${d} @value-changed=${c=>r(c.detail.value)}></vaadin-time-picker>`;case"datetime":return o`<vaadin-date-time-picker theme="small" style="width:100%;" .value=${d} @value-changed=${c=>r(c.detail.value)}></vaadin-date-time-picker>`;case"select":return o`<vaadin-combo-box
                theme="small" style="width:100%;"
                .items=${(t.editorOptions??[]).map(c=>({label:c.label,value:String(c.value)}))}
                item-label-path="label" item-value-path="value"
                .value=${d}
                @value-changed=${c=>r(c.detail.value)}></vaadin-combo-box>`;case"lookup":{const c=a?.field?.fieldId,p=`search-${c}-${t.id}`,h=`${c}-${t.id}`,f=(t.editorOptions??[]).find($=>String($.value)===d)??(d?{value:d,label:wo(e,t.id)??d}:void 0);return o`<vaadin-combo-box
                theme="small" style="width:100%;"
                item-label-path="label" item-id-path="value"
                .dataProvider=${($,g)=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:p,parameters:{searchText:$.filter,size:$.pageSize,page:$.page},callback:S=>{const V=S?.fragments?.[0]?.data?.[h];g(V?.content??[],V?.totalElements??0)},callbackonly:!0},bubbles:!0,composed:!0}))}}
                .selectedItem=${f}
                @selected-item-changed=${$=>{const g=$.detail.value,S=g?g.value:null;String(S??"")!==d&&(g&&ko(e,t.id,g.label),r(S))}}></vaadin-combo-box>`}default:return o`<vaadin-text-field theme="small" style="width:100%;" .value=${d} @change=${c=>r(c.target.value)}></vaadin-text-field>`}},Si=e=>xr(()=>o`<span title="${e}" style="white-space:normal;overflow-wrap:break-word;">${e}</span>`,[e]),Ei=e=>e!==void 0?wr(()=>o`<span style="font-weight: 600; white-space: nowrap;">${e}</span>`,[e]):l,_o=e=>{e.preventDefault(),e.stopPropagation(),e.currentTarget?.dispatchEvent(new CustomEvent("sort-direction-changed",{detail:{grid:e.currentTarget.parentElement},bubbles:!0,composed:!0}))},Io=(e,t,a,s,i,r,n,d)=>{const c=Oe(e.label,s,i);return o`
<vaadin-grid-column-group header="${c}">
    ${e.columns.map(p=>Os(p.metadata,t,a,s,i,r,n,d?.[p.metadata?.id]))}
</vaadin-grid-column-group>
`},Fi=(e,t,a,s,i,r,n,d)=>m.GridGroupColumn==e.metadata?.type?Io(e.metadata,t,a,s,i,r,n,d):Os(e.metadata,t,a,s,i,r,n,d?.[e.metadata?.id]),Os=(e,t,a,s,i,r,n,d)=>{const c=Oe(e.label,s,i);return e.sortable?o`
                        <vaadin-grid-sort-column
                                path="${e.id}"
                                text-align="${e.align??l}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??l}"
                                ?resizable="${e.resizable}"
                                width="${e.width??l}"
                                @direction-changed="${_o}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${Si(c)}
                                ${Ei(d)}
                                ${it((p,h,v)=>Wa(p,h,v,e,t,a,s,i,r,n),[])}
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
                                ${Si(c)}
                                ${Ei(d)}
                                ${it((p,h,v)=>Wa(p,h,v,e,t,a,s,i,r,n),[])}
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
                                ${Si(c)}
                                ${Ei(d)}
                                ${it((p,h,v)=>Wa(p,h,v,e,t,a,s,i,r,n),[])}
                        ></vaadin-grid-column>
                    `},Wa=(e,t,a,s,i,r,n,d,c,p)=>{const h=a.dataset.dataType??"",v=a.dataset.stereotype??"";if(Ha(e)){const w=i?.metadata,$=(w?.columns??[]).flatMap(R=>R?.metadata?.type===m.GridGroupColumn?(R.metadata.columns??[]).map(Z=>Z?.metadata?.id):[R?.metadata?.id]),g=ro(e.__mateuGroupBy,$),S=oo(e,s,g),V=e.__mateuGroup.hiddenActions??[],ue=s.id===$[$.length-1]?(w?.groupActions??[]).filter(R=>!V.includes(R.actionId??R.id)):[];return ue.length?o`<span style="display: flex; align-items: center; justify-content: flex-end; gap: var(--lumo-space-s); overflow: hidden;">
                ${S?o`<span style="font-weight: 600;">${S}</span>`:l}
                ${ue.map(R=>o`
                    <vaadin-button theme="tertiary small" style="flex-shrink: 0;"
                        @click="${Z=>{Z.stopPropagation(),Z.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+(R.actionId??R.id),parameters:{_groupValue:e.__mateuGroup.value}},bubbles:!0,composed:!0}))}}">${R.label??R.caption??""}</vaadin-button>
                `)}
            </span>`:o`<span title="${S}" style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${S}</span>`}if(s.editable)return Co(e,s,i,n);if(h=="status")return lo(e,t,a);if(h=="bool")return co(e,t,a);if(h=="money"||v=="money")return uo(e,t,a,h,v);if(h=="link"||v=="link")return po(e,t,a,h,v,s);if(h=="icon"||v=="icon")return ho(e,t,a,h);if(v=="html")return mo(e,t,a);if(v=="image")return vo(e,t,a,h,v,s);if(h=="menu")return ss(e,t,a);if(h=="component")return xo(e,t,a,i,r,n,d,c,p);if(h=="action")return go(e,t,a);if(h=="actionGroup")return ss(e,t,a);if(v=="button"||s.actionId)return $o(e,t,a,h,v,s);const f=e[a.path];return o`<span title="${f}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${f}</span>`},So=(e,t,a,s,i,r,n)=>{const d=t.metadata;if(d.tree){const p=async(h,v)=>{const f=h.parentItem?h.parentItem.children:d.page.content;v(f,f.length)};return o`
        <vaadin-grid style="${t.style}" class="${t.cssClasses}"
                     .itemHasChildrenPath="${"children"}" .dataProvider="${p}"
                     slot="${t.slot??l}"
                     all-rows-visible
        >
            ${d.content.map((h,v)=>{const f=h.metadata;return v>0?o`
            <vaadin-grid-column path="${h.id}"
                                header="${f?.label??l}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??l}"
                                width="${f?.width??l}"
                                .column="${h.metadata}"
                                ${it((w,$,g)=>Wa(w,$,g,f,e,a,s,i,r,n),[])}></vaadin-grid-column>
`:o`
            <vaadin-grid-tree-column path="${h.id}"
                                header="${f?.label??l}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??l}"
                                width="${f?.width??l}"
            ></vaadin-grid-tree-column>
`})}
            <span slot="empty-state">${At()}</span>
        </vaadin-grid>
    `}let c=d.page?.content;return t.id&&s&&s[t.id]&&(c=s[t.id]),c||(c=[]),o`
        <vaadin-grid 
                style="${t.style}" 
                class="${t.cssClasses}" 
                .items="${c}"
                all-rows-visible
        >
            ${d?.content?.map(p=>Fi(p,e,a,s,i,r,n))}
        </vaadin-grid>
    `},Eo=e=>{const a=(e.metadata.items??[]).map(s=>({text:s.text,time:s.time,userName:s.userName,userImg:s.userImg,userAbbr:s.userAbbr,userColorIndex:s.userColorIndex}));return o`
        <vaadin-message-list
                markdown
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??l}"
                .items="${a}"
        ></vaadin-message-list>
    `},Lt=new Cr,W={value:{}},_a={value:{}},To=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        <vaadin-context-menu .items=${Ni(e,d.menu,a,s,i,r,n)} 
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             open-on="${d.activateOnLeftClick?"click":l}"
                             slot="${t.slot??l}">
            ${C(e,d.wrapped,a,s,i,r,n)}
        </vaadin-context-menu>
            `},Po=(e,t,a,s,i)=>{const r=t.metadata;return o`
        <vaadin-menu-bar .items=${Ni(e,r.options,a,s,i,W,_a)}
                         style="${t.style}" class="${t.cssClasses}"
                         slot="${t.slot??l}">
        </vaadin-menu-bar>
            `},os=(e,t,a,s,i,r,n)=>{const d=document.createElement("vaadin-context-menu-item");return ks(C(e,t,a,s,i,r,n),d),d},Ni=(e,t,a,s,i,r,n)=>t.map(d=>d.submenus?{text:d.component?void 0:d.label,route:d.path,checked:d.selected,disabled:d.disabled,className:d.className,component:d.component?os(e,d.component,a,s,i,r,n):void 0,children:Ni(e,d.submenus,a,s,i,r,n)}:d.separator?{component:"hr"}:{text:d.component?void 0:d.label,route:d.path,checked:d.selected,disabled:d.disabled,className:d.className,component:d.component?os(e,d.component,a,s,i,r,n):void 0}),Oo=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=d.content?.metadata,p=c?.type==m.Notice&&c.fullWidth===!0;return o`
        <vaadin-custom-field label="${d.label}"
                             style="${p?"width: 100%; ":""}${t.style}"
                             class="${t.cssClasses}"
                             slot="${t.slot??l}"
                             data-colspan="${d.colspan||(p?99:l)}"
        >
            ${C(e,d.content,a,s,i,r,n)}
        </vaadin-custom-field>
            `},zo=e=>{const t=e.metadata,a=s=>{const i=s.detail?.value??"";!t.actionId||!i.trim()||s.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:{message:i}},bubbles:!0,composed:!0}))};return o`
        <vaadin-message-input
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??l}"
                @submit="${a}"
        ></vaadin-message-input>
    `},Ro=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        <div id="show-notifications">${C(e,d.wrapped,a,s,i,r,n)}</div>
        <vaadin-tooltip
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??l}"
                for="show-notifications" text="${d.text}" position="top-start"></vaadin-tooltip>
    `},Do=e=>{if(e instanceof CustomEvent)return e.detail;const t={};for(const a in e){const s=e[a];["number","string","boolean"].indexOf(typeof s)>=0&&(t[a]=e[a])}return t},ns=(e,t,a)=>{for(let s in t.attributes)e.setAttribute(s,t.attributes[s]);a.style&&e.setAttribute("style",a.style),a.cssClasses&&e.setAttribute("class",a.cssClasses),a.slot&&e.setAttribute("slot",a.slot),t.content&&(t.html?e.innerHTML=t.content:e.append(t.content))},Ao=e=>{const t=e.name;t.startsWith("vaadin-chart")&&!customElements.get(t)&&J(()=>import("./vendor-highcharts.js"),__vite__mapDeps([0,1,2,3]));const a=e.attributes?e.attributes.import:void 0;a&&t.includes("-")&&!customElements.get(t)&&import(a)},Lo=(e,t,a)=>{Ao(t);let s=t.name;return t.attributes&&t.attributes.id&&(s="#"+t.attributes.id),setTimeout(()=>{const i=e.shadowRoot?.querySelector(".element-container")?.querySelector(s);if(i){for(;i.firstChild;)i.removeChild(i.lastChild);ns(i,t,a)}else{const r=document.createElement(t.name);ns(r,t,a);for(let n in t.on)r.addEventListener(n,d=>{const c=Do(d);e.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.on[n],parameters:{event:c}},bubbles:!0,composed:!0}))});e.shadowRoot?.querySelector(".element-container")?.appendChild(r)}}),o`<div class="element-container"></div>`};var Be=(e=>(e.div="div",e.p="p",e.h1="h1",e.h2="h2",e.h3="h3",e.h4="h4",e.h5="h5",e.h6="h6",e.span="span",e))(Be||{});const Mo=(e,t,a,s,i)=>{const r=e.metadata,n=r.attributes?.["data-colspan"],d=ka(r.text,t,a,s,i),c={xl:"var(--lumo-font-size-xl, 1.375rem)",l:"var(--lumo-font-size-l, 1.125rem)",s:"var(--lumo-font-size-s, .875rem)",xs:"var(--lumo-font-size-xs, .8125rem)"},p=(r.size&&c[r.size]?`font-size: ${c[r.size]}; `:"")+(r.noMargins?"margin-block-start: 0; margin-block-end: 0; ":"");return Be.h1==r.container?o`
            <h1 style="${p}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h1>
        `:Be.h2==r.container?o`
            <h2 style="${p}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h2>
        `:Be.h3==r.container?o`
            <h3 style="${p}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h3>
        `:Be.h4==r.container?o`
            <h4 style="${p}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h4>
        `:Be.h5==r.container?o`
            <h5 style="${p}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h5>
        `:Be.h6==r.container?o`
            <h6 style="${p}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h6>
        `:Be.p==r.container?o`
               <p style="${p}${e.style}" class="${e.cssClasses}"
                  id="${E(e.id)}"
                  data-colspan="${E(n)}"
                  slot="${e.slot??l}">
                   ${d??l}
               </p>
            `:Be.div==r.container?o`
               <div style="${p}${e.style}" class="${e.cssClasses}"
                    id="${E(e.id)}"
                    data-colspan="${E(n)}"
                    slot="${e.slot??l}">${d?ge(d):l}</div>
            `:Be.span==r.container?o`
               <span style="${p}${e.style}" class="${e.cssClasses}"
                     id="${E(e.id)}"
                     data-colspan="${E(n)}"
                    slot="${e.slot??l}">${d??l}</span>
            `:o`
               <p
                       id="${E(e.id)}"
                       data-colspan="${E(n)}"
                       slot="${e.slot??l}">
                   Unknown text container: ${r.container} 
               </p>
            `},qo=(e,t,a)=>{const s=e.metadata;return o`<span theme="badge ${s.color} ${s.pill?"pill":""} ${s.small?"small":""} ${s.primary?"primary":""}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??l}">${Ve(s.text,t,a)}</span>`},Fo=(e,t,a)=>{const s=Ve(e.text,t,a);if(!s)return l;let i=Ve(e.color,t,a);return i=="SUCCESS"&&(i="success"),i=="ERROR"&&(i="error"),i=="DANGER"&&(i="error"),i=="WARNING"&&(i="warning"),i=="INFO"&&(i="info"),i=="PRIMARY"&&(i="primary"),i=="SECONDARY"&&(i="secondary"),i=="TERTIARY"&&(i="tertiary"),i=="QUATERNARY"&&(i="quaternary"),i=="LIGHT"&&(i="light"),i=="DARK"&&(i="dark"),o`<span theme="badge ${i} ${e.pill?"pill":""} ${e.small?"small":""} ${e.primary?"primary":""}">${s}</span>`},No=e=>{const t=e.metadata;return o`<a href="${t.url}" target="${t.target??l}"
                   rel="${t.target==="_blank"?"noopener":l}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??l}">${t.text}</a>`},zs=(e,t)=>{const a=e.toLowerCase().split("+");return t.ctrlKey===a.includes("ctrl")&&t.altKey===a.includes("alt")&&t.shiftKey===a.includes("shift")&&t.metaKey===a.includes("meta")},Uo=(e,t)=>{if(!zs(e,t))return!1;const a=e.toLowerCase().split("+"),s=a[a.length-1];return!!(t.key.toLowerCase()===s||/^[a-z]$/.test(s)&&t.code==="Key"+s.toUpperCase()||/^[0-9]$/.test(s)&&(t.code==="Digit"+s||t.code==="Numpad"+s))},jo=e=>e?e.split("+").map(t=>t.length<=1?t.toUpperCase():t.charAt(0).toUpperCase()+t.slice(1)).join("+"):void 0,Bo=(e,t)=>{const a=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a,parameters:t.parameters},bubbles:!0,composed:!0}))},Vo=(e,t,a)=>{const s=e.metadata,i=Oe(s.label,t,a);let r="";return s.buttonStyle&&(r+=" "+s.buttonStyle),s.color&&s.color!=="none"&&s.color!=="normal"&&(r+=" "+s.color),s.size&&s.size!=="none"&&s.size!=="normal"&&(r+=" "+s.size),o`<vaadin-button
id="${e.id}"
            data-action-id="${s.actionId}"
            @click="${n=>Bo(n,s)}"
            style="${e.style}"
            class="${e.cssClasses}"
            theme="${r}"
            ?disabled="${s.disabled}"
            title="${s.shortcut?`${i} (${jo(s.shortcut)})`:l}"
            slot="${e.slot??l}"
    >${s.iconOnLeft?o`<vaadin-icon icon="${s.iconOnLeft}"></vaadin-icon>`:l}${i}${s.iconOnRight?o`<vaadin-icon icon="${s.iconOnRight}"></vaadin-icon>`:l}</vaadin-button>`},Ho=(e,t,a,s,i,r,n)=>{const d=t.metadata;if(!d)return o``;let c="";return d.variants?.map(p=>p=="stretchMedia"?"stretch-media":p=="coverMedia"?"cover-media":p).forEach(p=>c+=" "+p),c=c.trim(),o`
        <vaadin-card
                style="${t.style}" 
                class="${t.cssClasses}" 
                theme="${c}"
                slot="${t.slot??l}"
        >
            ${d.media?Dt(e,d.media,a,s,i,r,n,"media",!1):l}
            ${d.title?Dt(e,d.title,a,s,i,r,n,"title",!1):l}
            ${d.subtitle?Dt(e,d.subtitle,a,s,i,r,n,"subtitle",!1):l}
            ${d.header?Dt(e,d.header,a,s,i,r,n,"header",!1):l}
            ${d.headerPrefix?Dt(e,d.headerPrefix,a,s,i,r,n,"header-prefix",!1):l}
            ${d.headerSuffix?Dt(e,d.headerSuffix,a,s,i,r,n,"header-suffix",!1):l}
            ${d.footer?Dt(e,d.footer,a,s,i,r,n,"footer",!1):l}
            ${d.content?C(e,d.content,a,s,i,r,n,!1):l}
        </vaadin-card>
    `},Wo=e=>{const t=e.metadata;return o`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??l}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},Go=e=>{const t=e.metadata;return o`
        <vaadin-icon icon="${t.icon}" style="${e.style}" class="${e.cssClasses}"
                     slot="${e.slot??l}"></vaadin-icon>
    `},Ko=(e,t,a,s,i,r,n)=>{const d=t.metadata;let c=!1;if(d.openedCondition)try{c=Es(d.openedCondition,s,i,r,n)}catch(p){console.error("when evaluating "+d.openedCondition+" :"+p+", where data is "+i+" and state is "+s)}return o`
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
  ${t.children?.map(p=>C(e,p,a,s,i,r,n))}
</vaadin-confirm-dialog>
            `},Yo=e=>{const t=e.metadata;let a;return t.position&&(a={Top:"top",Bottom:"bottom",TopLeft:"top-left",TopRight:"top-right",BottomLeft:"bottom-left",BottomRight:"bottom-right"}[t.position]),o`
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
    `},Jo=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        <vaadin-details 
                ?opened="${d.opened}" 
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??l}"
        >
            <vaadin-details-summary slot="summary">
            ${C(e,d.summary,a,s,i,r,n)}
            </vaadin-details-summary>
            ${C(e,d.content,a,s,i,r,n)}
        </vaadin-details>
            `},Xo=(e,t,a,s,i,r)=>o`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${s}"
            .appState="${i}"
            .appdata="${r}"
        ></mateu-dialog>
            `,Qo=(e,t,a,s,i,r)=>o`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${s}"
            .appState="${i}"
            .appdata="${r}"
        ></mateu-drawer>
            `,Zo=e=>{const t=e.metadata;return o`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"  
                  route="${t.route}" 
                  consumedRoute="${t.consumedRoute}" 
                  id="${ye()}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??l}"
        ></mateu-ux>
        </mateu-api-caller>
            `},en=e=>{const t=e.metadata;return o`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style}" class="${e.cssClasses}"
                        slot="${e.slot??l}"></mateu-markdown>
            `},tn=e=>{const t=e.metadata;return o`
        <vaadin-notification
                .opened="${!0}"
                slot="${e.slot??l}"
                style="${e.style}"
                class="${e.cssClasses}"
                ${Cs(()=>o`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${t.title}</h3>
                        <div>
                            ${t.text}
                        </div>
                    </vaadin-horizontal-layout>
                `,[])}
        ></vaadin-notification>
            `},an=(e,t={})=>{const a=e.metadata,s=a.valueKey?t[a.valueKey]:a.value;return o`
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
    `},sn=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        <div id="show-notifications" slot="${t.slot??l}">${C(e,d.wrapped,a,s,i,r,n)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                ${_s(()=>o`${C(e,d.content,a,s,i,r,n)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
        ></vaadin-popover>
    `},rn=e=>{const t=e.metadata;return o`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??l}"></mateu-map>
            `},on=e=>{const t=e.metadata;return o`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??l}">
            `},nn=e=>{const t=e.metadata;return o`<vaadin-horizontal-layout theme="spacing"
                                          slot="${e.slot??l}">
        ${t.breadcrumbs.map(a=>o`
            <a href="${a.link}">${a.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </vaadin-horizontal-layout>`},ln=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${d.dots}" 
                ?nav = "${d.nav}" 
                ?loop = "${d.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(c=>o`<div>${C(e,c,a,s,i,r,n)}</div>`)}
        </skeleton-carousel>
    `},dn=(e,t,a,s)=>{const i=e.metadata;return o`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??l}">
            ${i.menu.map(r=>Rs(r))}
        </div>
            `},Rs=e=>o`
        ${e.submenus?o`
                <vaadin-details summary="${e.label}" opened>
                    <vaadin-vertical-layout theme="spacing">
                        ${e.submenus.map(t=>Rs(t))}
                    </vaadin-vertical-layout>
                </vaadin-details>
            `:o`
                <a href="${e.path}">${e.label}</a>
        `}
        `,cn=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`<div
                slot="${t.slot??l}"
                style="${t.style}" class="${t.cssClasses}"
        >${d.content?ge(d.content):l}${t.children?.map(c=>C(e,c,a,s,i,r,n))}</div>
    `},un=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=d.title?.includes("${")?e._evalTemplate(d.title):d.title;return o`<div
                slot="${t.slot??l}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?o`<div style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color); margin-bottom: var(--lumo-space-s);">${c}</div>`:l}
        ${t.children?.map(p=>C(e,p,a,s,i,r,n))}
    </div>
    `},pn=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=d.title?.includes("${")?e._evalTemplate(d.title):d.title;return o`
        <div
                slot="${t.slot??l}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(p=>C(e,p,a,s,i,r,n))}</div>
    `},Di=(e,t,a,s,i,r,n,d)=>{const c=t.metadata,p=c?.fabs??[];return o`<mateu-page
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
        ${t.children?.map(h=>C(e,h,a,s,i,r,n))}
        ${c?.buttons?.map(h=>o`
                   ${C(e,{id:h.actionId,metadata:h,type:se.ClientSide,slot:"buttons"},void 0,s,i,r,n)}
`)}
        ${p.map((h,v)=>o`
            <button class="page-fab" style="position: fixed; bottom: ${1.5+v*4}rem; right: 5.5rem;"
                @click="${()=>e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:h.actionId},bubbles:!0,composed:!0}))}"
                title="${h.label}">
                <vaadin-icon icon="${h.icon}"></vaadin-icon>
            </button>
        `)}
</mateu-page>
    `},Ai=(e,t,a,s,i,r,n,d)=>o`<mateu-table-crud
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
        ${t.children?.map(c=>C(e,c,a,s,i,r,n))}
    </mateu-table-crud>`,hn=e=>{const t=e.metadata;return o`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??l}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},mn=(e,t,a)=>{const s=e.metadata;return o`<mateu-chat sseUrl="${s.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??l}"></mateu-chat>`},vn=e=>{const t=e.metadata;return o`
        <mateu-workflow
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow>
    `},fn=e=>{const t=e.metadata;return o`
        <mateu-workflow-elk
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
                ?readOnly="${t.readOnly??!1}"
        ></mateu-workflow-elk>
    `},bn=e=>{const t=e.metadata;return o`
        <mateu-form-editor
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
                value="${t.value??'{"name":"New Form","fields":[]}'}"
        ></mateu-form-editor>
    `},Ds=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,gn=e=>e=="up"?"var(--lumo-success-text-color, #1a7f37)":e=="down"?"var(--lumo-error-text-color, #c5221f)":"var(--lumo-secondary-text-color, #666)",yn=e=>e=="up"?"▲":e=="down"?"▼":"",$n=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},xn=e=>{const t=e.metadata,a=!!t.actionId;return o`
        <div class="mateu-metric-card ${e.cssClasses??""}"
             style="${Ds} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${a?"cursor: pointer;":""} ${e.style??""}"
             slot="${e.slot??l}"
             role="${a?"button":l}"
             @click="${s=>$n(s,t)}"
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
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${gn(t.trend)};">
                    ${yn(t.trend)} ${t.trendLabel??l}
                </span>
            `:l}
            ${t.description?o`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:l}
        </div>
    `},wn=(e,t,a,s,i,r,n)=>o`
        <div class="mateu-scoreboard ${t.cssClasses??""}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${t.children?.map(d=>C(e,d,a,s,i,r,n))}
        </div>
    `,kn=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=d.colSpan&&d.colSpan>1?`grid-column: span ${d.colSpan};`:"",p=d.rowSpan&&d.rowSpan>1?`grid-row: span ${d.rowSpan};`:"";return o`
        <div class="mateu-dashboard-panel ${t.cssClasses??""}"
             style="${Ds} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${p} ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${d.title?o`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${d.title}</h3>
                    ${d.subtitle?o`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${d.subtitle}</span>`:l}
                </div>
            `:l}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(h=>C(e,h,a,s,i,r,n))}
            </div>
        </div>
    `},Cn=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=d.columns&&d.columns>0?`repeat(${d.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return o`
        <div class="mateu-dashboard ${t.cssClasses??""}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${t.children?.map(p=>C(e,p,a,s,i,r,n))}
        </div>
    `};var _n=Object.defineProperty,In=Object.getOwnPropertyDescriptor,nt=(e,t,a,s)=>{for(var i=s>1?void 0:s?In(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&_n(t,a,i),i};let Re=class extends k{constructor(){super(...arguments),this.panels=[],this.headerTitle="",this.badges=[],this.orientation="vertical",this.navigation=null,this.overviewEditActionId="",this.openPanels=new Set,this.expandedPanel=null,this._onPopState=()=>{const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(e.startsWith("expand=")){const t=e.slice(7),a=this.panels.findIndex((s,i)=>this.panelAnchor(s,i)===t);this.expandedPanel=a>=0?a:null}else this.expandedPanel=null},this.initialized=!1}navAction(e){e&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),window.addEventListener("popstate",this._onPopState)}disconnectedCallback(){window.removeEventListener("popstate",this._onPopState),super.disconnectedCallback()}willUpdate(){if(!this.initialized&&this.panels.length){this.openPanels=new Set(this.panels.map((t,a)=>t.open?a:-1).filter(t=>t>=0));const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(e.startsWith("expand=")){const t=e.slice(7),a=this.panels.findIndex((s,i)=>this.panelAnchor(s,i)===t);a>=0&&(this.expandedPanel=a)}else if(e){const t=this.panels.findIndex((a,s)=>this.panelAnchor(a,s)===e);t>=0&&this.openPanels.add(t)}this.initialized=!0}}firstUpdated(){const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(!e)return;const t=this.renderRoot.querySelector(`[data-anchor="${CSS.escape(e)}"]`);t&&t.scrollIntoView({block:"nearest"})}panelAnchor(e,t){return(e.title??"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||`panel-${t}`}bookmarkPanel(e){const t=this.panelAnchor(this.panels[e],e);try{history.replaceState(history.state,"","#"+t)}catch{}}clearBookmark(e){const t=this.panelAnchor(this.panels[e],e);if(decodeURIComponent((location.hash||"").replace(/^#/,""))===t)try{history.replaceState(history.state,"",location.pathname+location.search)}catch{}}expandPanel(e,t){t?.stopPropagation(),this.expandedPanel=e;const a=this.panelAnchor(this.panels[e],e);try{history.pushState(history.state,"","#expand="+a)}catch{}}collapsePanel(){try{history.back()}catch{this.expandedPanel=null}}toggle(e){const t=new Set(this.openPanels);t.has(e)?(t.delete(e),this.clearBookmark(e)):(t.add(e),this.bookmarkPanel(e)),this.openPanels=t}render(){if(this.expandedPanel!=null&&this.panels[this.expandedPanel]){const t=this.panels[this.expandedPanel];return o`
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
        `}};Re.styles=y`
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
    `;nt([u({type:Array})],Re.prototype,"panels",2);nt([u({type:String})],Re.prototype,"headerTitle",2);nt([u({type:Array})],Re.prototype,"badges",2);nt([u({type:String,reflect:!0})],Re.prototype,"orientation",2);nt([u({attribute:!1})],Re.prototype,"navigation",2);nt([u({type:String})],Re.prototype,"overviewEditActionId",2);nt([b()],Re.prototype,"openPanels",2);nt([b()],Re.prototype,"expandedPanel",2);Re=nt([x("mateu-foldout")],Re);const Sn=(e,t,a,s,i,r,n)=>{const d=t.metadata;return o`
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
            ${t.children?.map(c=>C(e,c,a,s,i,r,n))}
        </mateu-foldout>
    `},En=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=!!d.image,p=c?`background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${d.image}'); background-size: cover; background-position: center; color: #fff;`:"",h=d.centered===!1?"flex-start":"center",v=d.centered===!1?"left":"center";return o`
        <div class="mateu-hero ${t.cssClasses??""}"
             style="display: flex; flex-direction: column; align-items: ${h}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${v}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); min-height: ${d.height??"12rem"}; box-sizing: border-box; ${p} ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${d.title?o`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${d.title}</h1>`:l}
            ${d.subtitle?o`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${c?"":"color: var(--lumo-secondary-text-color, #666);"} max-width: 40rem;">${d.subtitle}</p>`:l}
            ${t.children?.length?o`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${h}; width: 100%; max-width: 40rem;">
                    ${t.children?.map(f=>C(e,f,a,s,i,r,n))}
                </div>
            `:l}
        </div>
    `};var Tn=Object.defineProperty,Pn=Object.getOwnPropertyDescriptor,Ui=(e,t,a,s)=>{for(var i=s>1?void 0:s?Pn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Tn(t,a,i),i};const Ti=1440*60*1e3;let Ia=class extends k{constructor(){super(...arguments),this.tasks=[],this.onTaskSelectionActionId=""}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}range(){const e=this.tasks.flatMap(t=>[t.start,t.end]).filter(t=>!!t).map(t=>new Date(t+"T00:00:00").getTime());return e.length?{min:Math.min(...e)-Ti,max:Math.max(...e)+2*Ti}:null}months(e,t){const a=[],s=new Date(e);for(s.setDate(1);s.getTime()<=t;){const i=Math.max(s.getTime(),e),r=new Date(s.getFullYear(),s.getMonth()+1,1),n=Math.min(r.getTime(),t);a.push({label:s.toLocaleDateString(void 0,{month:"short",year:"2-digit"}),from:i,to:n}),s.setMonth(s.getMonth()+1)}return a}render(){const e=this.range();if(!e)return o``;const t=e.max-e.min,a=i=>(i-e.min)/t*100,s=Date.now();return o`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(i=>o`
                        <div class="month" style="width: ${(i.to-i.from)/t*100}%;">${i.label}</div>
                    `)}
                </div>
                ${this.tasks.map(i=>{const r=new Date(i.start+"T00:00:00").getTime(),n=new Date(i.end+"T00:00:00").getTime()+Ti;return o`
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
        `}};Ia.styles=y`
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
    `;Ui([u({type:Array})],Ia.prototype,"tasks",2);Ui([u()],Ia.prototype,"onTaskSelectionActionId",2);Ia=Ui([x("mateu-gantt")],Ia);const On=e=>{const t=e.metadata;return o`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                .onTaskSelectionActionId="${t.onTaskSelectionActionId??""}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-gantt>
    `};var zn=Object.defineProperty,Rn=Object.getOwnPropertyDescriptor,It=(e,t,a,s)=>{for(var i=s>1?void 0:s?Rn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&zn(t,a,i),i};let z=class extends k{constructor(){super(...arguments),this.resources=[],this.blocks=[],this.drag=null,this.dragStartX=0,this.dragStartY=0,this.laneRects=[],this.onDragKeydown=e=>{e.key==="Escape"&&this.drag&&(e.stopPropagation(),this.endDrag())}}static parse(e){return new Date(e+"T00:00:00")}static iso(e){const t=a=>String(a).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}static addDays(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}static daysBetween(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}window(){if(this.from&&this.to){const s=z.parse(this.from),i=z.daysBetween(s,z.parse(this.to))+1;return i>0?{from:s,days:i}:null}const e=this.blocks.flatMap(s=>[s.start,s.end]).filter(s=>!!s).map(s=>z.parse(s));if(!e.length)return null;const t=new Date(Math.min(...e.map(s=>s.getTime()))),a=new Date(Math.max(...e.map(s=>s.getTime())));return{from:t,days:z.daysBetween(t,a)+1}}onBlockPointerDown(e,t,a){if(!this.moveActionId&&!this.selectActionId||(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.dragStartX=e.clientX,this.dragStartY=e.clientY,!this.window()))return;const r=z.parse(t.start),n=z.parse(t.end),d=Math.max(1,z.daysBetween(r,n)+1);this.laneRects=[...this.renderRoot.querySelectorAll(".lane[data-resource-id]")].map(p=>({resourceId:p.dataset.resourceId,rect:p.getBoundingClientRect()}));const c=this.dayAt(t.resourceId,e.clientX)??a;this.drag={blockId:t.id,duration:d,grabOffsetDays:c-a,originResourceId:t.resourceId,originStartIdx:a,targetResourceId:t.resourceId,targetStartIdx:a,moved:!1},window.addEventListener("keydown",this.onDragKeydown)}dayAt(e,t){const a=this.laneRects.find(r=>r.resourceId===e),s=this.window();if(!a||!s||a.rect.width===0)return null;const i=Math.floor((t-a.rect.left)/a.rect.width*s.days);return Math.max(0,Math.min(s.days-1,i))}onBlockPointerMove(e){if(!this.drag||!this.drag.moved&&Math.abs(e.clientX-this.dragStartX)<4&&Math.abs(e.clientY-this.dragStartY)<4||!this.moveActionId)return;const t=this.window();if(!t)return;const a=this.laneRects.find(r=>e.clientY>=r.rect.top&&e.clientY<=r.rect.bottom)??this.laneRects.find(r=>r.resourceId===this.drag.targetResourceId);if(!a)return;const s=this.dayAt(a.resourceId,e.clientX);if(s==null)return;const i=Math.max(0,Math.min(t.days-this.drag.duration,s-this.drag.grabOffsetDays));this.drag={...this.drag,moved:!0,targetResourceId:a.resourceId,targetStartIdx:i}}onBlockPointerUp(e){const t=this.drag;if(this.endDrag(),!t)return;if(!t.moved){this.selectActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.selectActionId,parameters:{_blockId:e.id}},bubbles:!0,composed:!0}));return}if(!this.moveActionId||t.targetResourceId===t.originResourceId&&t.targetStartIdx===t.originStartIdx)return;const a=this.window();if(!a)return;const s=z.addDays(a.from,t.targetStartIdx),i=z.addDays(s,t.duration-1);this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.moveActionId,parameters:{_blockId:t.blockId,_resourceId:t.targetResourceId,_start:z.iso(s),_end:z.iso(i)}},bubbles:!0,composed:!0}))}endDrag(){this.drag=null,window.removeEventListener("keydown",this.onDragKeydown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.onDragKeydown)}render(){const e=this.window();if(!e||!this.resources.length)return o``;const t=[...Array(e.days).keys()].map(d=>z.addDays(e.from,d)),a=new Date,s=z.daysBetween(e.from,new Date(a.getFullYear(),a.getMonth(),a.getDate())),i=s>=0&&s<e.days,r=[];let n;return this.resources.forEach(d=>{d.group&&d.group!==n&&r.push(o`<div class="group">${d.group}</div>`),n=d.group,r.push(this.renderRow(d,e,t,i?s:null))}),o`
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
                ${r.map(d=>{const c=z.daysBetween(t.from,z.parse(d.start)),p=z.daysBetween(t.from,z.parse(d.end));if(p<0||c>=t.days)return l;const h=Math.max(0,c),v=Math.min(t.days-1,p),f=this.drag?.moved&&this.drag.blockId===d.id;return o`
                        <div class="block ${this.selectActionId?"clickable":""} ${this.moveActionId?"draggable":""} ${f?"dragging":""}"
                             title="${d.label??""} · ${d.start} → ${d.end}${d.status?` · ${d.status}`:""}"
                             style="left: ${h*i}%; width: ${(v-h+1)*i}%; ${d.color?`--mateu-planning-block: ${d.color};`:""}"
                             @pointerdown="${w=>this.onBlockPointerDown(w,d,c)}"
                             @pointermove="${w=>this.onBlockPointerMove(w)}"
                             @pointerup="${()=>this.onBlockPointerUp(d)}"
                             @pointercancel="${()=>this.endDrag()}"
                        >${d.label}</div>
                    `})}
                ${n?o`
                    <div class="ghost"
                         style="left: ${n.targetStartIdx*i}%; width: ${Math.min(n.duration,t.days-n.targetStartIdx)*i}%;"></div>
                `:l}
            </div>
        `}};z.styles=y`
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
    `;It([u({type:Array})],z.prototype,"resources",2);It([u({type:Array})],z.prototype,"blocks",2);It([u()],z.prototype,"from",2);It([u()],z.prototype,"to",2);It([u()],z.prototype,"moveActionId",2);It([u()],z.prototype,"selectActionId",2);It([b()],z.prototype,"drag",2);z=It([x("mateu-planning-board")],z);const Dn=e=>{const t=e.metadata;return o`
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
    `};var An=Object.defineProperty,Ln=Object.getOwnPropertyDescriptor,As=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ln(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&An(t,a,i),i};let Ga=class extends k{constructor(){super(...arguments),this.columns=[]}clickCard(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedCard:e}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};Ga.styles=y`
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
    `;As([u({type:Array})],Ga.prototype,"columns",2);Ga=As([x("mateu-kanban")],Ga);const Mn=e=>{const t=e.metadata;return o`
        <mateu-kanban
                .columns="${t.columns??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-kanban>
    `};var qn=Object.defineProperty,Fn=Object.getOwnPropertyDescriptor,Ls=(e,t,a,s)=>{for(var i=s>1?void 0:s?Fn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&qn(t,a,i),i};let Ka=class extends k{constructor(){super(...arguments),this.items=[]}clickItem(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedItem:e}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};Ka.styles=y`
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
    `;Ls([u({type:Array})],Ka.prototype,"items",2);Ka=Ls([x("mateu-timeline")],Ka);const Nn=e=>{const t=e.metadata;return o`
        <mateu-timeline
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-timeline>
    `};var Un=Object.defineProperty,jn=Object.getOwnPropertyDescriptor,ji=(e,t,a,s)=>{for(var i=s>1?void 0:s?jn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Un(t,a,i),i};let Sa=class extends k{constructor(){super(...arguments),this.steps=[],this.vertical=!1}render(){return o`
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
        `}};Sa.styles=y`
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
    `;ji([u({type:Array})],Sa.prototype,"steps",2);ji([u({type:Boolean,reflect:!0})],Sa.prototype,"vertical",2);Sa=ji([x("mateu-progress-steps")],Sa);const Bn=e=>{const t=e.metadata;return o`
        <mateu-progress-steps
                .steps="${t.steps??[]}"
                ?vertical="${t.vertical??!1}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-progress-steps>
    `};var Vn=Object.defineProperty,Hn=Object.getOwnPropertyDescriptor,St=(e,t,a,s)=>{for(var i=s>1?void 0:s?Hn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Vn(t,a,i),i};let He=class extends k{constructor(){super(...arguments),this.spark=[]}sparkline(){const e=this.spark;if(!e||e.length<2)return l;const t=84,a=30,s=2,i=Math.min(...e),n=Math.max(...e)-i||1,d=(t-s*2)/(e.length-1),c=e.map((f,w)=>{const $=s+w*d,g=s+(a-s*2)*(1-(f-i)/n);return[$,g]}),p=c.map(([f,w],$)=>`${$===0?"M":"L"}${f.toFixed(1)} ${w.toFixed(1)}`).join(" "),h=`${p} L${c[c.length-1][0].toFixed(1)} ${a} L${c[0][0].toFixed(1)} ${a} Z`,v=this.trend==="down"?"var(--lumo-error-color, #e11d48)":this.trend==="flat"?"var(--lumo-secondary-text-color, #888)":"var(--lumo-success-color, #12b76a)";return B`
            <svg width="${t}" height="${a}" viewBox="0 0 ${t} ${a}">
                <path d="${h}" fill="${v}" opacity="0.12"></path>
                <path d="${p}" fill="none" stroke="${v}" stroke-width="1.6"
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
        `}};He.styles=y`
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
    `;St([u()],He.prototype,"label",2);St([u()],He.prototype,"value",2);St([u()],He.prototype,"unit",2);St([u()],He.prototype,"delta",2);St([u()],He.prototype,"trend",2);St([u({type:Array})],He.prototype,"spark",2);St([u()],He.prototype,"actionId",2);He=St([x("mateu-stat")],He);const Wn=e=>{const t=e.metadata;return o`
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
    `};var Gn=Object.defineProperty,Kn=Object.getOwnPropertyDescriptor,Bi=(e,t,a,s)=>{for(var i=s>1?void 0:s?Kn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Gn(t,a,i),i};let Ea=class extends k{constructor(){super(...arguments),this.events=[]}clickEvent(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedEvent:e}},bubbles:!0,composed:!0}))}render(){const e=this.month?new Date(this.month+"T00:00:00"):new Date,t=e.getFullYear(),a=e.getMonth(),s=new Date(t,a,1),i=(s.getDay()+6)%7,r=new Date(t,a+1,0).getDate(),n=new Date,d=f=>n.getFullYear()===t&&n.getMonth()===a&&n.getDate()===f,c={};for(const f of this.events){if(!f.date)continue;const w=new Date(f.date+"T00:00:00");w.getFullYear()===t&&w.getMonth()===a&&(c[w.getDate()]??=[]).push(f)}const p=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],h=[];for(let f=0;f<i;f++)h.push(o`<div class="cell blank"></div>`);for(let f=1;f<=r;f++)h.push(o`
                <div class="cell ${d(f)?"today":""}">
                    <span class="num">${f}</span>
                    ${(c[f]??[]).map(w=>o`
                        <span class="chip ${w.actionId?"clickable":""}"
                              style="${w.color?`--mateu-cal-accent: ${w.color};`:""}"
                              title="${w.title??""}"
                              @click="${()=>this.clickEvent(w)}">${w.title}</span>
                    `)}
                </div>
            `);const v=s.toLocaleDateString(void 0,{month:"long",year:"numeric"});return o`
            <div class="title">${v}</div>
            <div class="grid">
                ${p.map(f=>o`<div class="dow">${f}</div>`)}
                ${h}
            </div>
        `}};Ea.styles=y`
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
    `;Bi([u()],Ea.prototype,"month",2);Bi([u({type:Array})],Ea.prototype,"events",2);Ea=Bi([x("mateu-calendar")],Ea);const Yn=e=>{const t=e.metadata;return o`
        <mateu-calendar
                month="${t.month??l}"
                .events="${t.events??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-calendar>
    `};var Jn=Object.defineProperty,Xn=Object.getOwnPropertyDescriptor,Ms=(e,t,a,s)=>{for(var i=s>1?void 0:s?Xn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Jn(t,a,i),i};let Ya=class extends k{constructor(){super(...arguments),this.plans=[]}cta(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};Ya.styles=y`
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
    `;Ms([u({type:Array})],Ya.prototype,"plans",2);Ya=Ms([x("mateu-pricing-table")],Ya);const Qn=e=>{const t=e.metadata;return o`
        <mateu-pricing-table
                .plans="${t.plans??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-pricing-table>
    `};var Zn=Object.defineProperty,el=Object.getOwnPropertyDescriptor,qs=(e,t,a,s)=>{for(var i=s>1?void 0:s?el(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Zn(t,a,i),i};let Ja=class extends k{clickNode(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedNode:e}},bubbles:!0,composed:!0}))}renderNode(e){const t=e.avatar,a=t&&(t.startsWith("http")||t.startsWith("data:"));return o`
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
        `}render(){return this.root?o`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`:o``}};Ja.styles=y`
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
    `;qs([u({attribute:!1})],Ja.prototype,"root",2);Ja=qs([x("mateu-org-chart")],Ja);const tl=e=>{const t=e.metadata;return o`
        <mateu-org-chart
                .root="${t.root}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-org-chart>
    `};var al=Object.defineProperty,il=Object.getOwnPropertyDescriptor,Fs=(e,t,a,s)=>{for(var i=s>1?void 0:s?il(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&al(t,a,i),i};const sl=1440*60*1e3;let Xa=class extends k{constructor(){super(...arguments),this.cells=[]}color(e,t){if(e<=0||t<=0)return"var(--lumo-contrast-10pct, #ebedf0)";const a=e/t,s=a>.75?1:a>.5?.75:a>.25?.5:.3;return`color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round(s*100)}%, transparent)`}render(){const e=this.cells.filter(c=>!!c.date);if(!e.length)return o``;const t=e.map(c=>new Date(c.date+"T00:00:00").getTime()),a=Math.min(...t),s=Math.max(...t),i=new Date(a);i.setDate(i.getDate()-(i.getDay()+6)%7);const r={};for(const c of e)r[c.date]=c;const n=Math.max(...e.map(c=>c.value??0),1),d=[];for(let c=i.getTime();c<=s;c+=sl){const p=new Date(c),h=p.toISOString().slice(0,10),v=r[h],f=v?.value??0,w=(p.getDay()+6)%7+1,$=v?.label??`${h}: ${f}`;d.push(o`
                <div class="cell" style="grid-row: ${w}; --cell: ${this.color(f,n)};" title="${$}"></div>
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
        `}};Xa.styles=y`
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
    `;Fs([u({type:Array})],Xa.prototype,"cells",2);Xa=Fs([x("mateu-heatmap")],Xa);const rl=e=>{const t=e.metadata;return o`
        <mateu-heatmap
                .cells="${t.cells??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-heatmap>
    `};var ol=Object.defineProperty,nl=Object.getOwnPropertyDescriptor,Ns=(e,t,a,s)=>{for(var i=s>1?void 0:s?nl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&ol(t,a,i),i};let Qa=class extends k{constructor(){super(...arguments),this.stages=[]}render(){const e=this.stages;if(!e.length)return o``;const t=e[0].value??0,a=Math.max(...e.map(s=>s.value??0),1);return o`
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
        `}};Qa.styles=y`
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
    `;Ns([u({type:Array})],Qa.prototype,"stages",2);Qa=Ns([x("mateu-funnel")],Qa);const ll=e=>{const t=e.metadata;return o`
        <mateu-funnel
                .stages="${t.stages??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-funnel>
    `};var dl=Object.defineProperty,cl=Object.getOwnPropertyDescriptor,pa=(e,t,a,s)=>{for(var i=s>1?void 0:s?cl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&dl(t,a,i),i};let bt=class extends k{constructor(){super(...arguments),this.values=[],this.labels=[],this.area=!1}render(){const e=this.values;if(!e||e.length<2)return o``;const t=600,a=160,s=8,i=Math.min(...e),r=Math.max(...e),n=r-i||1,d=(t-s*2)/(e.length-1),c=e.map(($,g)=>{const S=s+g*d,V=s+(a-s*2)*(1-($-i)/n);return[S,V]}),p=c.map(([$,g],S)=>`${S===0?"M":"L"}${$.toFixed(1)} ${g.toFixed(1)}`).join(" "),h=`${p} L${c[c.length-1][0].toFixed(1)} ${a-s} L${c[0][0].toFixed(1)} ${a-s} Z`,v=this.color||"var(--lumo-primary-color, #1a73e8)",f=e.indexOf(r),w=e.indexOf(i);return o`
            ${this.heading?o`<div class="title">${this.heading}</div>`:l}
            <svg viewBox="0 0 ${t} ${a}" preserveAspectRatio="none">
                ${this.area?B`<path d="${h}" fill="${v}" opacity="0.12"></path>`:l}
                <path d="${p}" fill="none" stroke="${v}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
                ${c.map(($,g)=>g===f||g===w?B`<circle cx="${$[0]}" cy="${$[1]}" r="3.2" fill="${v}"><title>${this.labels[g]??""}: ${e[g]}</title></circle>`:B`<circle cx="${$[0]}" cy="${$[1]}" r="6" fill="transparent"><title>${this.labels[g]??""}: ${e[g]}</title></circle>`)}
            </svg>
            ${this.labels&&this.labels.length?o`<div class="labels"><span>${this.labels[0]}</span><span>${this.labels[this.labels.length-1]}</span></div>`:l}
        `}};bt.styles=y`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .title { font-weight: 600; margin-bottom: .35rem; color: var(--lumo-body-text-color, #222); }
        svg { display: block; width: 100%; height: auto; overflow: visible; }
        .labels { display: flex; justify-content: space-between; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); margin-top: .2rem; }
    `;pa([u()],bt.prototype,"heading",2);pa([u({type:Array})],bt.prototype,"values",2);pa([u({type:Array})],bt.prototype,"labels",2);pa([u()],bt.prototype,"color",2);pa([u({type:Boolean})],bt.prototype,"area",2);bt=pa([x("mateu-trend-chart")],bt);const ul=e=>{const t=e.metadata;return o`
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
    `};var pl=Object.defineProperty,hl=Object.getOwnPropertyDescriptor,Vi=(e,t,a,s)=>{for(var i=s>1?void 0:s?hl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&pl(t,a,i),i};let Ta=class extends k{constructor(){super(...arguments),this.features=[],this.columns=0}clickFeature(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){const e=this.columns&&this.columns>0?`repeat(${this.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(15rem, 1fr))";return o`
            <div class="grid" style="grid-template-columns: ${e};">
                ${this.features.map(t=>o`
                    <div class="card ${t.actionId?"clickable":""}" @click="${()=>this.clickFeature(t)}">
                        ${t.icon?o`<span class="icon">${t.icon}</span>`:l}
                        <span class="title">${t.title}</span>
                        ${t.description?o`<span class="desc">${t.description}</span>`:l}
                    </div>
                `)}
            </div>
        `}};Ta.styles=y`
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
    `;Vi([u({type:Array})],Ta.prototype,"features",2);Vi([u({type:Number})],Ta.prototype,"columns",2);Ta=Vi([x("mateu-feature-grid")],Ta);const ml=e=>{const t=e.metadata;return o`
        <mateu-feature-grid
                .features="${t.features??[]}"
                .columns="${t.columns??0}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-feature-grid>
    `};var vl=Object.defineProperty,fl=Object.getOwnPropertyDescriptor,Us=(e,t,a,s)=>{for(var i=s>1?void 0:s?fl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&vl(t,a,i),i};let Za=class extends k{constructor(){super(...arguments),this.items=[]}stars(e){const t=Math.max(0,Math.min(5,e||0));return"★".repeat(t)+"☆".repeat(5-t)}render(){return o`
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
        `}};Za.styles=y`
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
    `;Us([u({type:Array})],Za.prototype,"items",2);Za=Us([x("mateu-testimonials")],Za);const bl=e=>{const t=e.metadata;return o`
        <mateu-testimonials
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-testimonials>
    `};var gl=Object.defineProperty,yl=Object.getOwnPropertyDescriptor,Hi=(e,t,a,s)=>{for(var i=s>1?void 0:s?yl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&gl(t,a,i),i};let Pa=class extends k{constructor(){super(...arguments),this.items=[],this.openSet=new Set,this.seeded=!1}seed(){this.seeded||(this.seeded=!0,this.items.forEach((e,t)=>{e.open&&this.openSet.add(t)}))}toggle(e){this.openSet.has(e)?this.openSet.delete(e):this.openSet.add(e),this.requestUpdate()}render(){return this.seed(),o`
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
        `}};Pa.styles=y`
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
    `;Hi([u({type:Array})],Pa.prototype,"items",2);Hi([b()],Pa.prototype,"openSet",2);Pa=Hi([x("mateu-faq")],Pa);const $l=e=>{const t=e.metadata;return o`
        <mateu-faq
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-faq>
    `};var xl=Object.defineProperty,wl=Object.getOwnPropertyDescriptor,Jt=(e,t,a,s)=>{for(var i=s>1?void 0:s?wl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&xl(t,a,i),i};let st=class extends k{themeVars(){switch(this.theme){case"success":return"--accent: var(--lumo-success-color, #12b76a); --bg: var(--lumo-success-color-10pct, rgba(18,183,106,.1));";case"warning":return"--accent: #f59e0b; --bg: rgba(245,158,11,.12);";case"danger":return"--accent: var(--lumo-error-color, #e11d48); --bg: var(--lumo-error-color-10pct, rgba(225,29,72,.1));";default:return"--accent: var(--lumo-primary-color, #1a73e8); --bg: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));"}}cta(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){return o`
            <div class="callout" style="${this.themeVars()}">
                ${this.icon?o`<span class="icon">${this.icon}</span>`:l}
                <div class="body">
                    ${this.heading?o`<span class="heading">${this.heading}</span>`:l}
                    ${this.description?o`<span class="desc">${this.description}</span>`:l}
                    ${this.ctaLabel?o`<button class="cta" @click="${()=>this.cta()}">${this.ctaLabel}</button>`:l}
                </div>
            </div>
        `}};st.styles=y`
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
    `;Jt([u()],st.prototype,"heading",2);Jt([u()],st.prototype,"description",2);Jt([u()],st.prototype,"icon",2);Jt([u()],st.prototype,"ctaLabel",2);Jt([u()],st.prototype,"actionId",2);Jt([u()],st.prototype,"theme",2);st=Jt([x("mateu-callout-card")],st);const kl=e=>{const t=e.metadata;return o`
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
    `};var Cl=Object.defineProperty,_l=Object.getOwnPropertyDescriptor,js=(e,t,a,s)=>{for(var i=s>1?void 0:s?_l(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Cl(t,a,i),i};let ei=class extends k{constructor(){super(...arguments),this.comments=[]}renderComment(e){const t=e.avatar&&(e.avatar.startsWith("http")||e.avatar.startsWith("data:"));return o`
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
        `}render(){return o`<div class="thread">${this.comments.map(e=>this.renderComment(e))}</div>`}};ei.styles=y`
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
    `;js([u({type:Array})],ei.prototype,"comments",2);ei=js([x("mateu-comment-thread")],ei);const Il=e=>{const t=e.metadata;return o`
        <mateu-comment-thread
                .comments="${t.comments??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-comment-thread>
    `};var Sl=Object.defineProperty,El=Object.getOwnPropertyDescriptor,Bs=(e,t,a,s)=>{for(var i=s>1?void 0:s?El(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Sl(t,a,i),i};const Tl={pdf:"📕",image:"🖼️",img:"🖼️",doc:"📘",docx:"📘",word:"📘",xls:"📗",xlsx:"📗",excel:"📗",sheet:"📗",zip:"🗜️",archive:"🗜️",video:"🎬",audio:"🎵",code:"💻",csv:"📄",txt:"📄"};let ti=class extends k{constructor(){super(...arguments),this.files=[]}icon(e){return e&&Tl[e.toLowerCase()]||"📄"}clickFile(e,t){e.url||e.actionId&&(t.preventDefault(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_file:e}},bubbles:!0,composed:!0})))}render(){return o`
            <div class="list">
                ${this.files.map(e=>{const t=!!e.url||!!e.actionId,a=o`
                        <span class="icon">${this.icon(e.type)}</span>
                        <span class="name">${e.name}</span>
                        ${e.size?o`<span class="size">${e.size}</span>`:l}
                        ${e.url?o`<span class="dl">⬇</span>`:l}
                    `;return e.url?o`<a class="file clickable" href="${e.url}" download target="_blank" rel="noopener">${a}</a>`:o`<div class="file ${t?"clickable":""}" @click="${s=>this.clickFile(e,s)}">${a}</div>`})}
            </div>
        `}};ti.styles=y`
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
    `;Bs([u({type:Array})],ti.prototype,"files",2);ti=Bs([x("mateu-file-list")],ti);const Pl=e=>{const t=e.metadata;return o`
        <mateu-file-list
                .files="${t.files??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-file-list>
    `};var Ol=Object.defineProperty,zl=Object.getOwnPropertyDescriptor,ui=(e,t,a,s)=>{for(var i=s>1?void 0:s?zl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Ol(t,a,i),i};let oa=class extends k{constructor(){super(...arguments),this.items=[],this.localDone=new Map}isDone(e,t){return this.localDone.has(t)?!!this.localDone.get(t):!!e.done}toggle(e,t){const a=!this.isDone(e,t);this.localDone.set(t,a),this.requestUpdate(),e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_item:e,_done:a}},bubbles:!0,composed:!0}))}render(){const e=this.items.length,t=this.items.filter((s,i)=>this.isDone(s,i)).length,a=e>0?Math.round(t/e*100):0;return o`
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
        `}};oa.styles=y`
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
    `;ui([u()],oa.prototype,"heading",2);ui([u({type:Array})],oa.prototype,"items",2);ui([b()],oa.prototype,"localDone",2);oa=ui([x("mateu-checklist")],oa);const Rl=e=>{const t=e.metadata;return o`
        <mateu-checklist
                heading="${t.title??l}"
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-checklist>
    `};var Dl=Object.defineProperty,Al=Object.getOwnPropertyDescriptor,Et=(e,t,a,s)=>{for(var i=s>1?void 0:s?Al(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Dl(t,a,i),i};let We=class extends k{render(){const e=this.trend??"flat";return o`
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
        `}};We.styles=y`
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
    `;Et([u()],We.prototype,"heading",2);Et([u()],We.prototype,"leftLabel",2);Et([u()],We.prototype,"leftValue",2);Et([u()],We.prototype,"rightLabel",2);Et([u()],We.prototype,"rightValue",2);Et([u()],We.prototype,"delta",2);Et([u()],We.prototype,"trend",2);We=Et([x("mateu-comparison-card")],We);const Ll=e=>{const t=e.metadata;return o`
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
    `},pi=y`
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
`,Ml=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}),Li=e=>Ml.format(e),ai=(e,t)=>{const a=e<0?"-":"",s=Li(Math.abs(e));return t?`${a}${t} ${s}`:`${a}${s}`},ql=(e,t)=>t?`${Li(e)} ${t}`:Li(e);var Fl=Object.defineProperty,Nl=Object.getOwnPropertyDescriptor,Tt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Nl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Fl(t,a,i),i};let Ge=class extends k{constructor(){super(...arguments),this.title="",this.badges=[],this.facts=[]}render(){const e=!!(this.metricLabel||this.metricValue||this.metricCaption);return o`
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
        `}};Ge.styles=[pi,y`
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
    `];Tt([u()],Ge.prototype,"title",2);Tt([u({type:Array})],Ge.prototype,"badges",2);Tt([u()],Ge.prototype,"subtitle",2);Tt([u({type:Array})],Ge.prototype,"facts",2);Tt([u()],Ge.prototype,"metricLabel",2);Tt([u()],Ge.prototype,"metricValue",2);Tt([u()],Ge.prototype,"metricCaption",2);Ge=Tt([x("mateu-entity-header")],Ge);const Ul=e=>{const t=e.metadata;return o`
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
    `};var jl=Object.defineProperty,Bl=Object.getOwnPropertyDescriptor,Pt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Bl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&jl(t,a,i),i};let Ke=class extends k{constructor(){super(...arguments),this.value=0,this.max=0}fillColor(){return this.dangerAt!=null&&this.value>=this.dangerAt?"error":this.warnAt!=null&&this.value>=this.warnAt?"warning":this.warnAt!=null||this.dangerAt!=null?"success":"primary"}render(){const e=this.max>0?Math.min(Math.max(this.value/this.max,0),1):0,t=Math.round(e*100);return o`
            <div class="meter">
                ${this.label?o`<span class="label">${this.label}</span>`:l}
                <span class="value">${ql(this.value,this.unit)}</span>
                <div class="track">
                    <div class="fill ${this.fillColor()}" style="width: ${t}%"></div>
                </div>
                <span class="caption">${this.caption?this.caption:`${t}%`}</span>
            </div>
        `}};Ke.styles=y`
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
    `;Pt([u()],Ke.prototype,"label",2);Pt([u({type:Number})],Ke.prototype,"value",2);Pt([u({type:Number})],Ke.prototype,"max",2);Pt([u()],Ke.prototype,"unit",2);Pt([u()],Ke.prototype,"caption",2);Pt([u({type:Number})],Ke.prototype,"warnAt",2);Pt([u({type:Number})],Ke.prototype,"dangerAt",2);Ke=Pt([x("mateu-meter")],Ke);const Vl=e=>{const t=e.metadata;return o`
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
    `};var Hl=Object.defineProperty,Wl=Object.getOwnPropertyDescriptor,ha=(e,t,a,s)=>{for(var i=s>1?void 0:s?Wl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Hl(t,a,i),i};let gt=class extends k{constructor(){super(...arguments),this.total=0,this.done=0}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){const e=this.total>0&&this.done>=this.total,t=!e&&!!this.actionLabel&&!!this.actionId;return o`
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
        `}};gt.styles=y`
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
    `;ha([u()],gt.prototype,"label",2);ha([u({type:Number})],gt.prototype,"total",2);ha([u({type:Number})],gt.prototype,"done",2);ha([u()],gt.prototype,"actionLabel",2);ha([u()],gt.prototype,"actionId",2);gt=ha([x("mateu-task-progress")],gt);const Gl=e=>{const t=e.metadata;return o`
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
    `};var Kl=Object.defineProperty,Yl=Object.getOwnPropertyDescriptor,Ra=(e,t,a,s)=>{for(var i=s>1?void 0:s?Yl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Kl(t,a,i),i};let Ft=class extends k{constructor(){super(...arguments),this.items=[],this.compact=!1,this.frameless=!1}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}rowClicked(e){this.rowActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.rowActionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};Ft.styles=[pi,y`
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
    `];Ra([u({type:Array})],Ft.prototype,"items",2);Ra([u({type:Boolean})],Ft.prototype,"compact",2);Ra([u({type:Boolean})],Ft.prototype,"frameless",2);Ra([u()],Ft.prototype,"rowActionId",2);Ft=Ra([x("mateu-status-list")],Ft);const Jl=e=>{const t=e.metadata;return o`
        <mateu-status-list
                .items="${t.items??[]}"
                ?compact="${t.compact??!1}"
                ?frameless="${t.frameless??!1}"
                rowActionId="${E(t.rowActionId??void 0)}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-status-list>
    `};var Xl=Object.defineProperty,Ql=Object.getOwnPropertyDescriptor,Vs=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ql(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Xl(t,a,i),i};let ii=class extends k{constructor(){super(...arguments),this.items=[]}render(){return o`
            <ul>
                ${this.items.map(e=>o`<li>${e}</li>`)}
            </ul>
        `}};ii.styles=y`
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
    `;Vs([u({type:Array})],ii.prototype,"items",2);ii=Vs([x("mateu-bulleted-list")],ii);const Zl=e=>{const t=e.metadata;return o`
        <mateu-bulleted-list
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-bulleted-list>
    `},ed=e=>{const a=e.metadata.attributes?.["data-colspan"];return o`
        <hr style="border: none; border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); width: 100%; margin: var(--lumo-space-s, .5rem) 0; ${e.style??""}"
            class="${e.cssClasses??l}"
            id="${E(e.id??void 0)}"
            data-colspan="${E(a)}"
            slot="${e.slot??l}"/>
    `};var td=Object.defineProperty,ad=Object.getOwnPropertyDescriptor,_e=(e,t,a,s)=>{for(var i=s>1?void 0:s?ad(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&td(t,a,i),i};const id={info:"ℹ",success:"✓",warning:"!",danger:"!"};let re=class extends k{constructor(){super(...arguments),this.text="",this.theme="info",this.noIcon=!1,this.slim=!1,this.fullWidth=!1,this.hasContent=!1,this.inlineContent=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){const e=!!this.text&&!!this.text.trim();if(!e&&!this.hasContent)return o``;const t=["info","success","warning","danger"].includes(this.theme)?this.theme:"info";return o`
            <div class="notice ${t} ${this.slim?"slim":""}">
                ${this.noIcon?l:o`<span class="icon ${this.icon?"custom":""}">${this.icon||id[t]}</span>`}
                <div class="body ${this.inlineContent?"inline":""}">
                    ${e?o`<span class="text">${this.text}</span>`:l}
                    ${this.hasContent?o`<div class="content"><slot></slot></div>`:l}
                </div>
                ${this.actionLabel&&this.actionId?o`<vaadin-button theme="small" @click="${()=>this.runAction()}">${this.actionLabel}</vaadin-button>`:this.status?o`<span class="status">${this.status}</span>`:l}
            </div>
        `}};re.styles=y`
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
    `;_e([u()],re.prototype,"text",2);_e([u()],re.prototype,"theme",2);_e([u()],re.prototype,"icon",2);_e([u({type:Boolean})],re.prototype,"noIcon",2);_e([u()],re.prototype,"actionLabel",2);_e([u()],re.prototype,"actionId",2);_e([u()],re.prototype,"status",2);_e([u({type:Boolean})],re.prototype,"slim",2);_e([u({type:Boolean})],re.prototype,"fullWidth",2);_e([u({type:Boolean})],re.prototype,"hasContent",2);_e([u({type:Boolean})],re.prototype,"inlineContent",2);re=_e([x("mateu-notice")],re);const sd=(e,t,a,s,i,r,n)=>{const d=t.metadata,c=ka(d.text??"",s,i,r,n)??"",p=t.children??[];return o`
        <mateu-notice
                text="${c}"
                theme="${d.theme??"info"}"
                icon="${E(d.icon??void 0)}"
                ?noIcon="${d.noIcon??!1}"
                actionLabel="${E(d.actionLabel??void 0)}"
                actionId="${E(d.actionId??void 0)}"
                status="${E(d.status??void 0)}"
                ?slim="${d.slim??!1}"
                ?fullWidth="${d.fullWidth??!1}"
                ?inlineContent="${d.inlineContent??!1}"
                ?hasContent="${p.length>0}"
                data-colspan="${d.fullWidth?"99":l}"
                style="${t.style??l}"
                class="${t.cssClasses??l}"
                slot="${t.slot??l}"
        >${p.map(h=>C(e,h,a,s,i,r,n))}</mateu-notice>
    `};var rd=Object.defineProperty,od=Object.getOwnPropertyDescriptor,hi=(e,t,a,s)=>{for(var i=s>1?void 0:s?od(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&rd(t,a,i),i};let na=class extends k{constructor(){super(...arguments),this.groups=[]}willUpdate(e){e.has("groups")&&(this.selectedId=this.groups.flatMap(t=>t.items??[]).find(t=>t.selected)?.id)}select(e){this.selectedId=e,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};na.styles=[pi,y`
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
    `];hi([u()],na.prototype,"actionId",2);hi([u({type:Array})],na.prototype,"groups",2);hi([b()],na.prototype,"selectedId",2);na=hi([x("mateu-task-queue")],na);const nd=e=>{const t=e.metadata;return o`
        <mateu-task-queue
                .actionId="${t.actionId}"
                .groups="${t.groups??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-task-queue>
    `};var ld=Object.defineProperty,dd=Object.getOwnPropertyDescriptor,ma=(e,t,a,s)=>{for(var i=s>1?void 0:s?dd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&ld(t,a,i),i};let yt=class extends k{constructor(){super(...arguments),this.columns=0,this.items=[]}willUpdate(e){e.has("items")&&(this.selectedId=this.items.find(t=>t.selected)?.id)}select(e){e.disabled||(this.selectedId=e.id,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0})))}render(){const e=this.columns>0?`grid-template-columns: repeat(${this.columns}, minmax(0, 1fr));`:"grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));";return o`
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
        `}};yt.styles=[pi,y`
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
    `];ma([u()],yt.prototype,"actionId",2);ma([u({type:Number})],yt.prototype,"columns",2);ma([u()],yt.prototype,"recommendedLabel",2);ma([u({type:Array})],yt.prototype,"items",2);ma([b()],yt.prototype,"selectedId",2);yt=ma([x("mateu-resource-grid")],yt);const cd=e=>{const t=e.metadata;return o`
        <mateu-resource-grid
                .actionId="${t.actionId}"
                .columns="${t.columns??0}"
                .recommendedLabel="${t.recommendedLabel}"
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-resource-grid>
    `};var ud=Object.defineProperty,pd=Object.getOwnPropertyDescriptor,me=(e,t,a,s)=>{for(var i=s>1?void 0:s?pd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&ud(t,a,i),i};let X=class extends k{constructor(){super(...arguments),this.title="",this.features=[],this.current=!1,this.added=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};X.styles=y`
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
    `;me([u()],X.prototype,"tag",2);me([u()],X.prototype,"title",2);me([u()],X.prototype,"subtitle",2);me([u()],X.prototype,"image",2);me([u({type:Array})],X.prototype,"features",2);me([u()],X.prototype,"priceLabel",2);me([u()],X.prototype,"actionLabel",2);me([u()],X.prototype,"actionId",2);me([u({type:Boolean})],X.prototype,"current",2);me([u()],X.prototype,"currentLabel",2);me([u({type:Boolean})],X.prototype,"added",2);me([u()],X.prototype,"addedLabel",2);X=me([x("mateu-offer-card")],X);const hd=e=>{const t=e.metadata;return o`
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
    `};var md=Object.defineProperty,vd=Object.getOwnPropertyDescriptor,va=(e,t,a,s)=>{for(var i=s>1?void 0:s?vd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&md(t,a,i),i};let $t=class extends k{constructor(){super(...arguments),this.items=[],this.added=new Set}willUpdate(e){e.has("items")&&(this.added=new Set(this.items.filter(t=>t.added).map(t=>t.id)))}total(){return this.items.filter(e=>e.id!=null&&this.added.has(e.id)).reduce((e,t)=>e+(t.price??0),0)}toggle(e){if(e.id==null)return;const t=new Set(this.added),a=!t.has(e.id);a?t.add(e.id):t.delete(e.id),this.added=t,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id,_added:a,_total:this.total()}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="header">
                ${this.totalLabel?o`<span class="total-label">${this.totalLabel}:</span>`:l}
                <span class="total">${ai(this.total(),this.currency)}</span>
            </div>
            <div class="grid">
                ${this.items.map(e=>{const t=e.id!=null&&this.added.has(e.id);return o`
                        <div class="card ${t?"added":""}">
                            ${e.icon?o`<span class="icon">${e.icon}</span>`:l}
                            <span class="title">${e.title}</span>
                            ${e.description?o`<span class="description">${e.description}</span>`:l}
                            ${e.includedLabel?o`<span class="included">${e.includedLabel}</span>`:o`
                                    ${e.price!=null?o`
                                        <span class="price">${ai(e.price,this.currency)}${e.unit?` / ${e.unit}`:""}</span>
                                    `:l}
                                    <button class="toggle ${t?"on":""}" @click="${()=>this.toggle(e)}"
                                            aria-pressed="${t}">${t?"✓":"+"}</button>
                                `}
                        </div>
                    `})}
            </div>
        `}};$t.styles=y`
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
    `;va([u()],$t.prototype,"totalLabel",2);va([u()],$t.prototype,"currency",2);va([u()],$t.prototype,"actionId",2);va([u({type:Array})],$t.prototype,"items",2);va([b()],$t.prototype,"added",2);$t=va([x("mateu-addon-picker")],$t);const fd=e=>{const t=e.metadata;return o`
        <mateu-addon-picker
                .totalLabel="${t.totalLabel}"
                .currency="${t.currency}"
                .actionId="${t.actionId}"
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-addon-picker>
    `};var bd=Object.defineProperty,gd=Object.getOwnPropertyDescriptor,Da=(e,t,a,s)=>{for(var i=s>1?void 0:s?gd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&bd(t,a,i),i};let Nt=class extends k{constructor(){super(...arguments),this.lines=[]}computedTotal(){return this.total!=null?this.total:this.lines.filter(e=>!e.included).reduce((e,t)=>e+(t.amount??0),0)}render(){return o`
            ${this.lines.map(e=>o`
                <div class="row">
                    <span class="dot"></span>
                    <span class="concept">${e.concept}</span>
                    ${e.included?o`<span class="included-label">${e.includedLabel||"Included"}</span>`:o`<span class="amount ${(e.amount??0)<0?"negative":""}">${ai(e.amount??0,this.currency)}</span>`}
                </div>
            `)}
            <div class="total-row">
                <span class="total-label">${this.totalLabel||"Total"}</span>
                <span class="total">${ai(this.computedTotal(),this.currency)}</span>
            </div>
        `}};Nt.styles=y`
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
    `;Da([u()],Nt.prototype,"currency",2);Da([u()],Nt.prototype,"totalLabel",2);Da([u({type:Array})],Nt.prototype,"lines",2);Da([u({type:Number})],Nt.prototype,"total",2);Nt=Da([x("mateu-ledger")],Nt);const yd=e=>{const t=e.metadata;return o`
        <mateu-ledger
                .currency="${t.currency}"
                .totalLabel="${t.totalLabel}"
                .lines="${t.lines??[]}"
                .total="${t.total}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-ledger>
    `};var $d=Object.defineProperty,xd=Object.getOwnPropertyDescriptor,lt=(e,t,a,s)=>{for(var i=s>1?void 0:s?xd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&$d(t,a,i),i};let De=class extends k{constructor(){super(...arguments),this.methods=[]}willUpdate(e){e.has("selected")&&(this.selectedId=this.selected)}confirm(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_method:this.selectedId}},bubbles:!0,composed:!0}))}pick(e){this.selectedId=e,this.methodActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.methodActionId,parameters:{_method:e}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};De.styles=y`
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
    `;lt([u()],De.prototype,"actionId",2);lt([u()],De.prototype,"methodActionId",2);lt([u({type:Array})],De.prototype,"methods",2);lt([u()],De.prototype,"selected",2);lt([u()],De.prototype,"contextLabel",2);lt([u()],De.prototype,"contextValue",2);lt([u()],De.prototype,"confirmLabel",2);lt([b()],De.prototype,"selectedId",2);De=lt([x("mateu-payment-picker")],De);const wd=e=>{const t=e.metadata;return o`
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
    `};var kd=Object.defineProperty,Cd=Object.getOwnPropertyDescriptor,Hs=(e,t,a,s)=>{for(var i=s>1?void 0:s?Cd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&kd(t,a,i),i};let si=class extends k{constructor(){super(...arguments),this.items=[]}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};si.styles=y`
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
    `;Hs([u({type:Array})],si.prototype,"items",2);si=Hs([x("mateu-process-monitor")],si);const _d=e=>{const t=e.metadata;return o`
        <mateu-process-monitor
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-process-monitor>
    `},Id=(e,t)=>{let a=e.style;return e.id&&(a&&!a.endsWith(";")&&(a+=";"),a==null&&(a=""),t[e.id+".hidden"]==!0&&(a+="display: none;")),a},Sd=(e,t)=>{let a={...e.metadata};if(e.id&&a){if(a.type==m.Button){const s=a;t[e.id+".disabled"]==!0&&(s.disabled=!0)}if(a.type==m.FormField){const s=a;t[e.id+".disabled"]==!0&&(s.disabled=!0)}}return a},P=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),Ed={[m.Bpmn]:({component:e})=>hn(e),[m.Workflow]:({component:e})=>vn(e),[m.WorkflowElk]:({component:e})=>fn(e),[m.FormEditor]:({component:e})=>bn(e),[m.Page]:P(Di),[m.Div]:P(cn),[m.Directory]:({component:e,baseUrl:t,state:a,data:s})=>dn(e),[m.FormLayout]:P(zr),[m.HorizontalLayout]:P(Ar),[m.VerticalLayout]:P(Lr),[m.SplitLayout]:P(Mr),[m.MasterDetailLayout]:P(qr),[m.TabLayout]:P(Fr),[m.AccordionLayout]:P(Ur),[m.BoardLayout]:P(Wr),[m.BoardLayoutRow]:P(Gr),[m.BoardLayoutItem]:P(Kr),[m.Scroller]:P(Br),[m.FullWidth]:P(Vr),[m.Container]:P(Hr),[m.Form]:({container:e,component:t,baseUrl:a,state:s,data:i,appState:r,appData:n})=>{const d=t.metadata;return o`<mateu-form
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
                ${t.children?.map(c=>C(e,c,a,s,i,r,n))}
            ${d?.buttons?.map(c=>o`
               ${C(e,{id:c.actionId,metadata:c,type:se.ClientSide,slot:"buttons"},void 0,s,i,r,n)}
`)}

            </mateu-form>`},[m.Table]:({container:e,component:t,baseUrl:a,state:s,data:i,appState:r,appData:n})=>o`<mateu-table
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
             ${t.children?.map(d=>C(e,d,a,s,i,r,n))}
            </mateu-table>`,[m.Crud]:P(Ai),[m.App]:({container:e,component:t,baseUrl:a,state:s,data:i,appState:r,appData:n})=>o`
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
             ${t.children?.map(d=>C(e,d,a,s,i,r,n))}
         </mateu-app>`,[m.Element]:({container:e,component:t})=>Lo(e,t.metadata,t),[m.FormField]:({container:e,component:t,baseUrl:a,state:s,data:i,appState:r,appData:n,labelAlreadyRendered:d})=>{const c=t.metadata;return o`
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
                    ${t.children?.map(p=>C(e,p,a,s,i,r,n,d))}
                </mateu-field>
        `},[m.Text]:({component:e,state:t,data:a,appState:s,appData:i})=>Mo(e,t,a,s,i),[m.Avatar]:({component:e,state:t,data:a})=>Jr(e,t,a),[m.Chat]:({component:e,state:t,data:a})=>mn(e),[m.AvatarGroup]:({component:e})=>Xr(e),[m.Badge]:({component:e,state:t,data:a})=>qo(e,t,a),[m.Breadcrumbs]:({component:e})=>nn(e),[m.Anchor]:({component:e})=>No(e),[m.Button]:({component:e,state:t,data:a})=>Vo(e,t,a),[m.Card]:P(Ho),[m.Chart]:({component:e})=>Wo(e),[m.Icon]:({component:e})=>Go(e),[m.ConfirmDialog]:P(Ko),[m.ContextMenu]:P(To),[m.CookieConsent]:({component:e})=>Yo(e),[m.Details]:P(Jo),[m.Dialog]:({component:e,baseUrl:t,state:a,data:s,appState:i,appData:r})=>Xo(e,t,a,s,i,r),[m.Drawer]:({component:e,baseUrl:t,state:a,data:s,appState:i,appData:r})=>Qo(e,t,a,s,i,r),[m.Image]:({component:e})=>on(e),[m.Map]:({component:e})=>rn(e),[m.Markdown]:({component:e})=>en(e),[m.MicroFrontend]:({component:e})=>Zo(e),[m.Notification]:({component:e})=>tn(e),[m.ProgressBar]:({component:e,state:t})=>an(e,t),[m.Popover]:P(sn),[m.CarouselLayout]:P(ln),[m.Tooltip]:P(Ro),[m.MessageInput]:({component:e})=>zo(e),[m.MessageList]:({component:e})=>Eo(e),[m.CustomField]:P(Oo),[m.MenuBar]:({container:e,component:t,baseUrl:a,state:s,data:i})=>Po(e,t,a,s,i),[m.Grid]:P(So),[m.VirtualList]:P(Qr),[m.FormSection]:P(un),[m.FormSubSection]:P(pn),[m.MetricCard]:({component:e})=>xn(e),[m.Scoreboard]:P(wn),[m.DashboardPanel]:P(kn),[m.DashboardLayout]:P(Cn),[m.FoldoutLayout]:P(Sn),[m.HeroSection]:P(En),[m.EmptyState]:({component:e})=>ao(e),[m.Skeleton]:({component:e})=>io(e),[m.Gantt]:({component:e})=>On(e),[m.PlanningBoard]:({component:e})=>Dn(e),[m.Kanban]:({component:e})=>Mn(e),[m.Timeline]:({component:e})=>Nn(e),[m.ProgressSteps]:({component:e})=>Bn(e),[m.Stat]:({component:e})=>Wn(e),[m.Calendar]:({component:e})=>Yn(e),[m.PricingTable]:({component:e})=>Qn(e),[m.OrgChart]:({component:e})=>tl(e),[m.Heatmap]:({component:e})=>rl(e),[m.Funnel]:({component:e})=>ll(e),[m.TrendChart]:({component:e})=>ul(e),[m.FeatureGrid]:({component:e})=>ml(e),[m.Testimonials]:({component:e})=>bl(e),[m.Faq]:({component:e})=>$l(e),[m.CalloutCard]:({component:e})=>kl(e),[m.CommentThread]:({component:e})=>Il(e),[m.FileList]:({component:e})=>Pl(e),[m.Checklist]:({component:e})=>Rl(e),[m.ComparisonCard]:({component:e})=>Ll(e),[m.EntityHeader]:({component:e})=>Ul(e),[m.Meter]:({component:e})=>Vl(e),[m.TaskProgress]:({component:e})=>Gl(e),[m.StatusList]:({component:e})=>Jl(e),[m.BulletedList]:({component:e})=>Zl(e),[m.Separator]:({component:e})=>ed(e),[m.Notice]:P(sd),[m.TaskQueue]:({component:e})=>nd(e),[m.ResourceGrid]:({component:e})=>cd(e),[m.OfferCard]:({component:e})=>hd(e),[m.AddOnPicker]:({component:e})=>fd(e),[m.Ledger]:({component:e})=>yd(e),[m.PaymentPicker]:({component:e})=>wd(e),[m.ProcessMonitor]:({component:e})=>_d(e)},Wi=(e,t,a,s,i,r,n,d)=>{if(!t?.metadata)return t==null?(console.warn("No metadata for component",t),o`<p>No metadata for component</p>`):Wi(e,{id:ye(),metadata:t,type:se.ClientSide},a,s,i,r,n,d);const c=t.metadata.type,p={...t,style:Id(t,i),metadata:Sd(t,i)},h=Ed[c];return h?h({container:e,component:p,baseUrl:a,state:s,data:i,appState:r,appData:n,labelAlreadyRendered:d}):o`<p ${p?.slot??l}>Unknown metadata type ${c} for component ${p?.id}</p>`};var at=(e=>(e.HAMBURGUER_MENU="HAMBURGUER_MENU",e.MENU_ON_LEFT="MENU_ON_LEFT",e.MENU_ON_TOP="MENU_ON_TOP",e.TABS="TABS",e.TILES="TILES",e.RAIL="RAIL",e.AUTO="AUTO",e.MEDIATOR="MEDIATOR",e))(at||{});const Gi="mateu-app-context",Ws="mateu-app-context-labels",Gs=e=>{try{return JSON.parse(localStorage.getItem(e)??"{}")}catch{return{}}},ls=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},Ki=()=>Gs(Gi),Ks=()=>Gs(Ws),Td=(e,t,a)=>{const s=Ki(),i=Ks();t==null||t===""?(delete s[e],delete i[e]):(s[e]=t,a!==void 0&&(i[e]=a)),ls(Gi,s),ls(Ws,i)};let ds=!1;const Pd=()=>{ds||(ds=!0,window.addEventListener("storage",e=>{e.key===Gi&&e.newValue!==e.oldValue&&window.location.reload()}))},Od=(e,t)=>new Promise((a,s)=>{let i=!1;const r={retry:()=>{i||(i=!0,t().then(a,s))},giveUp:()=>{i||(i=!0,s(e))}},n=new CustomEvent("mateu-session-expired",{detail:r,cancelable:!0,bubbles:!1});typeof document<"u"&&!document.dispatchEvent(n)||r.giveUp()}),zd=(e,t)=>e.includes("json")?!0:t!==null&&typeof t=="object",Rd=(e,t)=>{const a=e.finalUrl;if(!a)return;const s=typeof window<"u"?window.location.href:void 0;let i;try{i=new URL(e.requestedUrl,s).href}catch{return}if(i!==a&&!zd(e.contentType??"",e.data))return a};class Dd{constructor(){this.windowMs=4e3,this.threshold=12,this.events=[],this.reported=new Set}check(t,a=Date.now()){this.events.push({sig:t,t:a});const s=a-this.windowMs;this.events=this.events.filter(r=>r.t>=s);let i=0;for(const r of this.events)r.sig===t&&i++;if(i>=this.threshold){const r=!this.reported.has(t);return this.reported.add(t),{blocked:!0,firstTrip:r}}return this.reported.delete(t),{blocked:!1,firstTrip:!1}}reset(){this.events=[],this.reported.clear()}configure(t){t.windowMs!==void 0&&(this.windowMs=t.windowMs),t.threshold!==void 0&&(this.threshold=t.threshold)}}const Ad=new Dd;let ia=[];class Ld{constructor(){this.axiosInstance=_r.create({timeout:6e4}),this.axiosInstance.interceptors.request.use(t=>(this.addAuthToken(t),this.addSessionId(t),t)),this.axiosInstance.interceptors.response.use(t=>{const a=Rd({requestedUrl:this.axiosInstance.getUri(t.config),finalUrl:t.request?.responseURL,contentType:String(t.headers?.["content-type"]??""),data:t.data});if(a)throw window.location.assign(a),Object.assign(new Error("session lost — redirecting to "+a),{code:"ERR_CANCELED"});return t},t=>{const a=t;if(a?.response?.status===401&&a.config&&!a.config.__mateuRetried){const s=a.config;return s.__mateuRetried=!0,Od(t,()=>this.axiosInstance.request(s))}throw t})}addSessionId(t){let a=sessionStorage.getItem("__mateu_sesion_id");a||(a=ye(),sessionStorage.setItem("__mateu_sesion_id",a)),t.headers["X-Session-Id"]=a}addAuthToken(t){const a=localStorage.getItem("__mateu_auth_token");a&&(t.headers.Authorization="Bearer "+a)}async wrap(t,a,s,i){return s||a.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),t.then(r=>(a.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:i}})),r)).catch(r=>{throw r?.code=="ERR_CANCELED"?a.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{}})):a.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:i,reason:this.serialize(r)}})),r})}serialize(t){return t?.message?t:JSON.stringify(t)}async get(t){const a=new AbortController;return ia=[...ia,a],this.axiosInstance.get(t,{signal:a.signal})}async post(t,a){const s=new AbortController;return ia=[...ia,s],this.axiosInstance.post(t,a,{signal:s.signal})}async abortAll(){ia.forEach(t=>t.abort()),ia=[]}async runAction(t,a,s,i,r,n,d,c,p,h,v){a&&a.startsWith("/")&&(a=a.substring(1));const f=[t,a,s,d??"",i,r].join(""),w=Ad.check(f);return w.blocked?(await this.abortAll(),w.firstTrip&&console.error("[mateu] request loop detected — aborting repeated request",f),{messages:w.firstTrip?[{title:"",text:"A repeating request was detected and stopped to protect the server. Reload the page or navigate elsewhere.",position:"bottom-end",variant:"error",duration:6e3}]:[],commands:[],fragments:[],banners:[],appendBanners:!1,appData:void 0,appState:void 0}):(n={...Ki(),...n},await this.wrap(this.post(t+"/mateu/v3/sync/"+(a&&a!=""?a:"_no_route"),{serverSideType:d,appState:n,componentState:c,parameters:p,initiatorComponentId:r,consumedRoute:s,route:a&&a!=""?"/"+a:"",actionId:i}).then($=>$.data),h,v,i))}}const Xt=new Ld;var Md=Object.defineProperty,qd=Object.getOwnPropertyDescriptor,mi=(e,t,a,s)=>{for(var i=s>1?void 0:s?qd(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Md(t,a,i),i};let xt=class extends k{constructor(){super(...arguments),this.baseUrl="",this.dataProvider=async(e,t)=>{const a=e.filter??"",i=await this.remoteSearch(a)??(this.selector.options??[]).filter(r=>r.label.toLowerCase().includes(a.toLowerCase()));t(i,i.length)}}connectedCallback(){super.connectedCallback(),Pd()}currentValue(){return String(Ki()[this.selector.fieldName]??"")}currentLabel(){const e=this.currentValue();if(!e)return"";const t=(this.selector.options??[]).find(s=>String(s.value)===e);if(t)return t.label;const a=Ks()[this.selector.fieldName];return a!==void 0?String(a):e}pick(e,t){String(e??"")!==this.currentValue()&&(Td(this.selector.fieldName,e,t),window.location.reload())}async remoteSearch(e){const t=this.app;if(t?.serverSideType)try{const a=await Xt.runAction(this.baseUrl??"",t.rootRoute??t.initialRoute??"","",`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,t.serverSideType,{},{searchText:e},this,!0);for(const s of a?.fragments??[]){const n=s.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(n))return n.map(d=>({value:d.value,label:d.label??String(d.value)}))}}catch{}}renderSelect(){const e=[{label:"—",value:""},...(this.selector.options??[]).map(t=>({label:t.label,value:String(t.value)}))];return o`
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
                              @selected-item-changed="${a=>{const s=a.detail.value;this.pick(s?.value??"",s?.label)}}"></vaadin-combo-box>`}render(){if(!this.selector)return o``;const e=(this.selector.options?.length??0)>xt.SEARCHABLE_THRESHOLD;return o`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                ${e?this.renderComboBox():this.renderSelect()}
            </label>`}};xt.SEARCHABLE_THRESHOLD=7;xt.styles=y`
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
    `;mi([u()],xt.prototype,"selector",2);mi([u()],xt.prototype,"app",2);mi([u()],xt.prototype,"baseUrl",2);xt=mi([x("mateu-vaadin-app-context-picker")],xt);class Fd{constructor(){this._dirty=!1,this._installed=!1,this.message="You have unsaved changes. Are you sure you want to leave this page?",this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=t=>{this._dirty&&(t.preventDefault(),t.returnValue="")}}install(){this._installed||(this._installed=!0,document.addEventListener("dirty",this._onDirty),document.addEventListener("clean",this._onClean),window.addEventListener("beforeunload",this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;const t=window.confirm(this.message);return t&&(this._dirty=!1),t}}const Mt=new Fd;var Nd=Object.defineProperty,Ud=Object.getOwnPropertyDescriptor,Aa=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ud(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Nd(t,a,i),i};let Ut=class extends k{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.notifications=[],this.fetched=!1}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}updated(){!this.fetched&&this.app?.serverSideType&&(this.fetched=!0,this.refresh())}unreadCount(){return this.notifications.filter(e=>e.unread).length}async runNotificationsAction(e,t){const a=this.app;if(a?.serverSideType)try{const s=await Xt.runAction(this.baseUrl??"",a.rootRoute??a.initialRoute??"","",e,"notification-bell",void 0,a.serverSideType,{},t,this,!0);for(const i of s?.fragments??[]){const n=i.data?._notifications;if(Array.isArray(n)){this.notifications=n;return}}}catch{}}refresh(){return this.runNotificationsAction("_notifications-list",{})}markRead(e){return this.runNotificationsAction("_notifications-read",{ids:e})}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.refresh(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))}closePanel(){this.detachOutsideClick(),this.opened=!1}async entryClicked(e){e.unread&&await this.markRead([e.id]);const t=e.route;if(t){if(!Mt.confirmLeave())return;this.closePanel(),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:t},bubbles:!0,composed:!0}))}}renderEntry(e){return o`
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
            </div>`}};Ut.styles=y`
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
    `;Aa([u()],Ut.prototype,"app",2);Aa([u()],Ut.prototype,"baseUrl",2);Aa([b()],Ut.prototype,"opened",2);Aa([b()],Ut.prototype,"notifications",2);Ut=Aa([x("mateu-notification-bell")],Ut);class jd{async handle(t,a){return await t.runAction(a.baseUrl,a.route,a.consumedRoute,a.actionId,a.initiatorComponentId,a.appState,a.serverSideType,a.componentState,a.parameters,a.initiator,a.background)}}const Bd=new jd;class Vd{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,a,s)=>{if(t?.fragments?.forEach(i=>{Lt.next({command:void 0,fragment:i,ui:void 0,error:void 0,callbackToken:s})}),t?.appState&&(W.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const i=t?.appData;_a.value={...t.appData,...i},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}t?.messages?.forEach(i=>{qt.show(i.text,{position:i.position?this.mapPosition(i.position):void 0,theme:i.variant,duration:i.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(i=>{Lt.next({command:i,fragment:void 0,ui:void 0,error:void 0,callbackToken:s})})}}async runAction(t,a,s,i,r,n,d,c,p,h,v,f,w,$,g){try{const S=await Bd.handle(t,{baseUrl:a,route:s,consumedRoute:i,actionId:r,appState:W.value,initiatorComponentId:n,componentState:p,parameters:h,serverSideType:c,initiator:v,background:f});w&&w(S),$||this.handleUIIncrement(S,v,g),S.messages&&S.messages.length==1&&S.messages[0].variant=="error"&&v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r,evevntId:ye()},bubbles:!0,composed:!0}))}catch(S){console.warn("Action request failed",S),v.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(S)}})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}}serialize(t){return t?.message?t:JSON.stringify(t)}}const Hd=new Vd;class Wd{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,a,s)=>{if(t?.messages?.forEach(i=>{if(i.undoActionId){this.showUndoableMessage(i,a);return}qt.show(i.text,{position:i.position?this.mapPosition(i.position):"bottom-end",theme:i.variant,duration:i.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(i=>{Lt.next({command:i,fragment:void 0,ui:void 0,error:void 0,callbackToken:s})}),t?.fragments?.forEach(i=>{Lt.next({command:void 0,fragment:i,ui:void 0,error:void 0,callbackToken:s})}),t?.appState&&(W.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const i=t?.appData;_a.value={...t.appData,...i},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}}}async runAction(t,a,s,i,r,n,d,c,p,h,v,f,w,$,g){if(s){s=s||"_no_route",s&&s.startsWith("/")&&(s=s.substring(1));const S={serverSideType:c,appState:W.value,componentState:p,parameters:h,initiatorComponentId:n,consumedRoute:i,route:"/"+s,actionId:r};f||v.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),fetch(a+"/mateu/v3/sse/"+s,{method:"POST",headers:{Accept:"text/event-stream","Content-Type":"application/json"},body:JSON.stringify(S)}).then(async V=>{const ue=V.body?.pipeThrough(new TextDecoderStream).getReader();if(ue){let R="";for(;;){const{value:Z,done:pe}=await ue.read();if(pe)break;R+=Z;const Y=R.split(`

`);R=Y.pop()??"";for(const ee of Y){const te=ee.trim();if(te)if(te.startsWith("data:")){const fe=JSON.parse(te.substring(5).trim());w&&w(fe),$||this.handleUIIncrement(fe,v,g),fe.messages&&fe.messages.length==1&&fe.messages[0].variant=="error"&&v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}else{let fe=te;try{const _=JSON.parse(te);fe=_.message,_._embedded?.errors?.length>0&&_._embedded.errors[0].message&&(fe=_._embedded.errors[0].message)}catch{}throw new Error(fe)}}}}f||v.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:r}})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r},bubbles:!0,composed:!0}))}).catch(V=>{v.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(V)}})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))})}}serialize(t){return t?.message?t:JSON.stringify(t)}showUndoableMessage(t,a){const s=new qt;s.position=t.position?this.mapPosition(t.position):"bottom-end",s.duration=t.duration??1e4,t.variant&&s.setAttribute("theme",t.variant),s.renderer=i=>{if(i.firstElementChild)return;const r=document.createElement("span");r.textContent=t.text;const n=document.createElement("button");n.textContent=t.undoLabel??"Undo",n.style.cssText="margin-left: 0.75rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;",n.addEventListener("click",()=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.undoActionId,parameters:t.undoParameters??{}},bubbles:!0,composed:!0})),s.opened=!1}),i.append(r,n)},document.body.appendChild(s),s.opened=!0,s.addEventListener("opened-changed",i=>{i.detail.value||s.remove()})}}const Ys=new Wd,Js=e=>{if(!e||!("querySelectorAll"in e))return null;for(const t of e.querySelectorAll("*")){if(t.tagName?.toLowerCase()==="mateu-component")return t;const a=Js(t.shadowRoot);if(a)return a}return null},Gd=async(e,t,a)=>{const s=t.renderRoot??t,i=Js(s);await Ys.runAction(Xt,t.baseUrl??"",e.rootRoute||"_no_route","",a,i?.id??"app-header-action",{},e.serverSideType??"",{},{},i??t,!0,void 0,!1,"")},cs=async(e,t,a)=>{try{await Gd(e,t,a)}catch(s){qt.show("La acción falló: "+s,{position:"bottom-start",duration:6e3,theme:"error"})}},ya=(e,t)=>{const a=e.contextSelectors??[],s=e.contextActions??[];return a.length===0&&s.length===0&&!e.notificationsEnabled?l:o`${e.notificationsEnabled?o`
        <mateu-notification-bell .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-notification-bell>`:l}${a.map(i=>o`
        <mateu-vaadin-app-context-picker .selector="${i}" .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-vaadin-app-context-picker>`)}${s.map(i=>(i.children?.length??0)>0?o`
        <vaadin-menu-bar theme="primary small" style="margin-left: 0.5rem; flex-shrink: 0;"
            .items="${[{text:i.label,children:i.children.map(r=>({text:r.label,actionId:r.actionId}))}]}"
            @item-selected="${r=>{const n=r.detail?.value?.actionId;n&&cs(e,t,n)}}"></vaadin-menu-bar>`:o`
        <vaadin-button theme="primary small" style="margin-left: 0.5rem; flex-shrink: 0;"
            @click="${()=>i.actionId&&cs(e,t,i.actionId)}" title="${i.label}">
            ${i.icon?o`<vaadin-icon icon="${i.icon}" slot="prefix"></vaadin-icon>`:l}${i.label}
        </vaadin-button>`)}`},Va=(e,t)=>e.themeToggle?o`
        <vaadin-button theme="tertiary icon" @click="${t.toggleTheme}"
            title="${t.isDark?"Switch to light mode":"Switch to dark mode"}"
            style="margin-left: 0.5rem; margin-right: 0.5rem; flex-shrink: 0;">
            <vaadin-icon icon="${t.isDark?"vaadin:sun-o":"vaadin:moon"}" style="color: var(--lumo-body-text-color);"></vaadin-icon>
        </vaadin-button>
    `:l,Kd=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},us=(e,t,a)=>{const s=tt(e,t,a),i=ie(t,a);return s=="list"||s==i?"new":s},tt=(e,t,a)=>{const s=e?._route;if(s!=null&&(s===""||s.startsWith("/"))){const i=a.homeRoute??"",r=i.indexOf("?"),n=r>=0?i.substring(r+1):"",d=ie(t,a)+s;if(!n)return d;const c=d.indexOf("?")>=0?"&":"?";return d+c+n}return t.selectedRoute?t.selectedRoute:a.homeRoute},ie=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,qe=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:t.homeBaseUrl,Fe=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,Ne=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,Yd=(e,t,a,s,i,r,n)=>{if(t.chromeless)return o`
            <div class="app chromeless">
                <div class="${"app-content"+(e.pageCompact?" no-padding":"")}" style="height: 100%;">
                    <vaadin-master-detail-layout>
                        <vaadin-scroller style="height: 100%;">
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${tt(s,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${qe(e,t)}"
                                        consumedRoute="${ie(e,t)}"
                                        serverSideType="${Fe(e,t)}"
                                        uriPrefix="${Ne(e,t)}"
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
        `;const d=e.mapItems(t.menu,e.filter?.toLowerCase()??""),c=ie(e,t),p=us(s,e,t),h=p&&p!=="new"&&p.startsWith(c+"/")?p.substring(c.length+1).split("/")[0]:void 0;return o`
                    ${t.variant==at.MEDIATOR?o`

                        ${t.layout=="SPLIT"?o`
                            <vaadin-master-detail-layout>
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${ie(e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${qe(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${Fe(e,t)}"
                                            uriPrefix="${Ne(e,t)}"
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
                                            route="${us(s,e,t)}"
                                            id="ux_${e.id}_detail"
                                            baseUrl="${qe(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${Fe(e,t)}"
                                            uriPrefix="${Ne(e,t)}"
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
                                        route="${tt(s,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${qe(e,t)}"
                                        consumedRoute="${ie(e,t)}"
                                        serverSideType="${Fe(e,t)}"
                                        uriPrefix="${Ne(e,t)}"
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
            ${t.variant==at.HAMBURGUER_MENU?o`
                <vaadin-app-layout style="${t?.style}" class="${t?.cssClasses}" .drawerOpened=${!t.drawerClosed}>
                    <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                    <h2 slot="navbar" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2><p slot="navbar">${t.subtitle}</p>
                    <vaadin-horizontal-layout slot="navbar" style="margin-left: auto; align-items: center;">
                        <slot name="widgets"></slot>
                        ${ya(t,e)}${Va(t,e)}
                    </vaadin-horizontal-layout>
                    <vaadin-scroller slot="drawer" class="p-s"
                                     @navigation-requested="${e.updateRoute}">
                        ${t.menu&&t.totalMenuOptions>10?o`
                            <vaadin-text-field style="width: calc(100% - 20px); padding-left: 10px; padding-right: 10px;" @value-changed="${v=>Kd(v,e)}">
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
                                            route="${tt(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${qe(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${Fe(e,t)}"
                                            uriPrefix="${Ne(e,t)}"
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
            
            ${t.variant==at.MENU_ON_TOP?o`
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
                            ${ya(t,e)}${Va(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${tt(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${qe(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${Fe(e,t)}"
                                            uriPrefix="${Ne(e,t)}"
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

            ${t.variant==at.TILES?o`
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
                            ${ya(t,e)}${Va(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):o`
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${tt(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${qe(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${Fe(e,t)}"
                                            uriPrefix="${Ne(e,t)}"
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

            ${t.variant==at.RAIL?o`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):l}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${tt(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${qe(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${Fe(e,t)}"
                                            uriPrefix="${Ne(e,t)}"
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

            ${t.variant==at.MENU_ON_LEFT?o`

                <vaadin-horizontal-layout>
                    <vaadin-scroller style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <vaadin-vertical-layout
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(v=>e.renderOptionOnLeftMenu(v))}
                            ${ya(t,e)}${Va(t,e)}
                        </vaadin-vertical-layout>
                    </vaadin-scroller>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${tt(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${qe(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${Fe(e,t)}"
                                            uriPrefix="${Ne(e,t)}"
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

            ${t.variant==at.TABS?o`
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
                                ${t.menu.map(v=>o`
                                <vaadin-tab 
                                        @click="${()=>e.selectRoute(v.consumedRoute,v.route,v.actionId,v.baseUrl,v.serverSideType,v.uriPrefix)}"
                                >${v.label}</vaadin-tab>
                            `)}
                            </vaadin-tabs>
                            <vaadin-horizontal-layout style="flex-shrink: 0; align-items: center;">
                                <slot name="widgets"></slot>
                                ${ya(t,e)}
                            </vaadin-horizontal-layout>
                        </vaadin-horizontal-layout>
                    </div>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${tt(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${qe(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${Fe(e,t)}"
                                            uriPrefix="${Ne(e,t)}"
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

            ${t.fabs?.map((v,f)=>o`
                <button class="app-fab" style="bottom: ${(t.sseUrl?5.5:1.5)+f*4}rem; right: 1.5rem;"
                    @click="${()=>e.runAction(v.actionId)}"
                    title="${v.label}">
                    <vaadin-icon icon="${v.icon}"></vaadin-icon>
                </button>
            `)}
            ${t.sseUrl&&!e.chatOpen?o`
                <button class="ai-fab" @click="${e.showHideIa}" title="Asistente IA">
                    <vaadin-icon icon="vaadin:comments-o"></vaadin-icon>
                </button>
            `:l}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},Jd=(e,t)=>t!=null&&e!=null&&!e.has(t),Xd=typeof HTMLElement<"u"?HTMLElement:class{};class Qd extends Xd{static get observedAttributes(){return["type","renderer"]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){const t=this.getAttribute("type")??"unknown",a=this.getAttribute("renderer")??"unknown";this.shadowRoot||this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
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
        `}}typeof customElements<"u"&&!customElements.get("mateu-unsupported")&&customElements.define("mateu-unsupported",Qd);const ps=new Set,Zd=(e,t,a)=>{const s=`${a}/${t}`;return ps.has(s)||(ps.add(s),console.warn(`[mateu] Component type "${t}" is not supported by the "${a}" renderer — rendering <mateu-unsupported> placeholder.`)),o`<mateu-unsupported
            type="${t}"
            renderer="${a}"
            data-component-id="${e?.id??l}"
            slot="${e?.slot??l}"
    ></mateu-unsupported>`};class ec{renderFilterBar(t,a,s,i,r,n,d,c){const p=a?.metadata,h=f=>{const{fieldId:w,value:$}=f.detail;t.state={...t.state,[w]:$}},v=f=>{const{fieldIds:w}=f.detail,$={};w.forEach(g=>{$[g]=void 0}),$.searchText=void 0,t.state={...t.state,...$}};return o`
            <mateu-filter-bar
                .metadata="${p}"
                @search-requested="${t.search}"
                @value-changed="${h}"
                @filter-reset-requested="${v}"
                .state="${t.state}"
                .data="${r}"
                .appState="${n}"
                .appData="${d}"
                ?searchOnly="${c??!1}"
            >
                ${p?.header?.map(f=>C(t,f,s,i,r,n,d))}
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
        `}rendererName(){return this.constructor?.name??"unknown"}supportedClientSideTypes(){}renderClientSideComponent(t,a,s,i,r,n,d,c){const p=a?.metadata?.type??a?.type,h=Object.values(m).includes(p)?p:void 0;return Jd(this.supportedClientSideTypes(),h)?Zd(a,h,this.rendererName()):Wi(t,a,s,i,r,n,d,c)}renderAppComponent(t,a,s,i,r,n,d){return Yd(t,a?.metadata,s,i,r,n,d)}}class tc extends ec{renderClientSideComponent(t,a,s,i,r,n,d,c){const p=a?.metadata?.type,h=yr(p);return h&&a?h.render({container:t,component:a,baseUrl:s,state:i,data:r,appState:n,appData:d,renderChild:v=>C(t,v,s,i,r,n,d)}):super.renderClientSideComponent(t,a,s,i,r,n,d,c)}}j.set(new tc);j.setUseShadowRoot(!1);const ac={lon:0,lat:0},hs=3,ic=e=>{if(!e)return;const t=e.split(",").map(i=>i.trim());if(t.length!==2)return;const a=Number(t[0]),s=Number(t[1]);if(!(t[0]===""||t[1]===""||!Number.isFinite(a)||!Number.isFinite(s)))return{lon:s,lat:a}},sc=e=>{if(e==null||e.trim()==="")return hs;const t=Number(e);return Number.isFinite(t)?t:hs};var rc=Object.defineProperty,oc=Object.getOwnPropertyDescriptor,vi=(e,t,a,s)=>{for(var i=s>1?void 0:s?oc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&rc(t,a,i),i};let la=class extends k{constructor(){super(...arguments),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){const e=++this.renderSeq,[{default:t},{default:a},{default:s},{default:i},{fromLonLat:r},{default:n}]=await Promise.all([J(()=>import("./vendor-ol.js").then(c=>c.M),[]),J(()=>import("./vendor-ol.js").then(c=>c.V),[]),J(()=>import("./vendor-ol.js").then(c=>c.T),[]),J(()=>import("./vendor-ol.js").then(c=>c.O),[]),J(()=>import("./vendor-ol.js").then(c=>c.p),[]),J(()=>import("./vendor-ol.js").then(c=>c.o),[])]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector("style[data-ol]")){const c=document.createElement("style");c.setAttribute("data-ol",""),c.textContent=n,this.shadowRoot.appendChild(c)}this.map&&(this.map.setTarget(void 0),this.map=void 0);const d=ic(this.position)??ac;this.map=new t({target:this.mapElement,layers:[new s({source:new i})],view:new a({center:r([d.lon,d.lat]),zoom:sc(this.zoom)})})}render(){return o`<div id="map"></div>`}};la.styles=y`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `;vi([u()],la.prototype,"position",2);vi([u()],la.prototype,"zoom",2);vi([Ce("#map")],la.prototype,"mapElement",2);la=vi([x("mateu-map")],la);const nc=typeof HTMLElement<"u"?HTMLElement:class{};class lc extends nc{static get observedAttributes(){return["content"]}#e;#t=0;get content(){return this.#e}set content(t){this.#e=t,this.#a()}attributeChangedCallback(t,a,s){this.content=s??void 0}connectedCallback(){this.style.display="block",this.#a()}async#a(){if(!this.isConnected)return;const t=this.#e??"",a=++this.#t,[{marked:s},{default:i}]=await Promise.all([J(()=>import("./vendor.js").then(r=>r.f),[]),J(()=>import("./vendor.js").then(r=>r.c),[])]);a===this.#t&&(this.innerHTML=i.sanitize(await s.parse(t),{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:r=>!0}}))}}typeof customElements<"u"&&!customElements.get("mateu-markdown")&&customElements.define("mateu-markdown",lc);var dc=Object.defineProperty,cc=Object.getOwnPropertyDescriptor,La=(e,t,a,s)=>{for(var i=s>1?void 0:s?cc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&dc(t,a,i),i};let jt=class extends k{constructor(){super(...arguments),this.fieldId="",this.signing=!1,this.hasStrokes=!1,this.drawing=!1,this.startStroke=e=>{const t=e.target;this.ensureCanvasSize(t),t.setPointerCapture(e.pointerId),this.drawing=!0;const a=t.getContext("2d");a.lineWidth=2,a.lineCap="round",a.lineJoin="round",a.strokeStyle=getComputedStyle(this).getPropertyValue("--lumo-body-text-color")||"#1a1a1a";const[s,i]=this.pointerPosition(e);a.beginPath(),a.moveTo(s,i),e.preventDefault()},this.stroke=e=>{if(!this.drawing)return;const a=e.target.getContext("2d"),[s,i]=this.pointerPosition(e);a.lineTo(s,i),a.stroke(),this.hasStrokes=!0,e.preventDefault()},this.endStroke=e=>{this.drawing=!1,e.target.releasePointerCapture(e.pointerId)}}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}canvas(){return this.renderRoot.querySelector("canvas")}pointerPosition(e){const a=e.target.getBoundingClientRect();return[e.clientX-a.left,e.clientY-a.top]}ensureCanvasSize(e){const t=e.getBoundingClientRect();(e.width!==Math.round(t.width)||e.height!==Math.round(t.height))&&(e.width=Math.round(t.width),e.height=Math.round(t.height))}clear(){const e=this.canvas();e&&e.getContext("2d").clearRect(0,0,e.width,e.height),this.hasStrokes=!1}accept(){const e=this.canvas();!e||!this.hasStrokes||(this.signing=!1,this.emit(e.toDataURL("image/png")))}renderPad(){return o`
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
            </div>`}};jt.styles=y`
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
    `;La([u()],jt.prototype,"fieldId",2);La([u()],jt.prototype,"value",2);La([b()],jt.prototype,"signing",2);La([b()],jt.prototype,"hasStrokes",2);jt=La([x("mateu-signature-pad")],jt);var uc=Object.defineProperty,pc=Object.getOwnPropertyDescriptor,Qt=(e,t,a,s)=>{for(var i=s>1?void 0:s?pc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&uc(t,a,i),i};let rt=class extends k{constructor(){super(...arguments),this.fieldId="",this.options=[],this.leavesOnly=!1,this.opened=!1,this.expanded=new Set}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}open(){this.opened||(this.opened=!0,this.expanded=new Set(this.pathTo(this.value??"",this.options)??[]),this.outsideClick=e=>{e.composedPath().includes(this)||this.close()},document.addEventListener("mousedown",this.outsideClick))}close(){this.detachOutsideClick(),this.opened=!1}pick(e){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e.value,fieldId:this.fieldId},bubbles:!0,composed:!0}))}clear(){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:this.fieldId},bubbles:!0,composed:!0}))}pathTo(e,t){for(const a of t){if(String(a.value)===e)return[];const s=this.pathTo(e,a.children??[]);if(s!=null)return[String(a.value),...s]}return null}labelOf(e,t){for(const a of t){if(String(a.value)===e)return a.label;const s=this.labelOf(e,a.children??[]);if(s!=null)return s}return null}toggle(e){const t=String(e.value),a=new Set(this.expanded);a.has(t)?a.delete(t):a.add(t),this.expanded=a}renderNode(e,t){const a=(e.children?.length??0)>0,s=this.expanded.has(String(e.value)),i=!this.leavesOnly||!a,r=String(e.value)===String(this.value??"");return o`
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
            </div>`}};rt.styles=y`
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
    `;Qt([u()],rt.prototype,"fieldId",2);Qt([u()],rt.prototype,"value",2);Qt([u()],rt.prototype,"options",2);Qt([u({type:Boolean})],rt.prototype,"leavesOnly",2);Qt([b()],rt.prototype,"opened",2);Qt([b()],rt.prototype,"expanded",2);rt=Qt([x("mateu-tree-select")],rt);var hc=Object.defineProperty,mc=Object.getOwnPropertyDescriptor,Ma=(e,t,a,s)=>{for(var i=s>1?void 0:s?mc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&hc(t,a,i),i};let Bt=class extends k{constructor(){super(...arguments),this.fieldId="",this.cameraOpen=!1,this.cameraError=!1,this.fileFallback=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const s=new FileReader;s.onload=()=>this.emit(s.result),s.readAsDataURL(a),t.value=""}}disconnectedCallback(){super.disconnectedCallback(),this.stopStream()}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}stopStream(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}async openCamera(){this.cameraError=!1;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:!1}),this.cameraOpen=!0,await this.updateComplete;const e=this.renderRoot.querySelector("video");e&&(e.srcObject=this.stream,await e.play())}catch{this.stopStream(),this.cameraOpen=!1,this.cameraError=!0}}closeCamera(){this.stopStream(),this.cameraOpen=!1}shoot(){const e=this.renderRoot.querySelector("video");if(!e||e.videoWidth===0)return;const t=document.createElement("canvas");t.width=e.videoWidth,t.height=e.videoHeight,t.getContext("2d").drawImage(e,0,0),this.closeCamera(),this.emit(t.toDataURL("image/jpeg",.9))}triggerFallback(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="";return o`
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
            `}`}};Bt.styles=y`
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
    `;Ma([u()],Bt.prototype,"fieldId",2);Ma([u()],Bt.prototype,"value",2);Ma([b()],Bt.prototype,"cameraOpen",2);Ma([b()],Bt.prototype,"cameraError",2);Bt=Ma([x("mateu-camera-capture")],Bt);var vc=Object.defineProperty,fc=Object.getOwnPropertyDescriptor,qa=(e,t,a,s)=>{for(var i=s>1?void 0:s?fc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&vc(t,a,i),i};const bc=(e,t)=>{if(!e)return;if(Array.isArray(e)){const s=e.find(i=>i.key==t);return s?.value!=null?String(s.value):void 0}const a=e[t];return a!=null?String(a):void 0};let wt=class extends k{constructor(){super(...arguments),this.fieldId="",this.editable=!0,this.filePicked=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const s=new FileReader;s.onload=()=>{const i=s.result,r=i.indexOf(","),n=i.substring(0,r).replace(";base64",`;name=${encodeURIComponent(a.name)};base64`);this.emit(n+i.substring(r))},s.readAsDataURL(a),t.value=""}}static fileName(e){if(!e)return"";if(e.startsWith("data:")){const t=e.indexOf(","),s=e.substring(5,t<0?e.length:t).split(";").find(i=>i.startsWith("name="));if(s)try{return decodeURIComponent(s.substring(5))}catch{return s.substring(5)}return"Attached file"}return e.split("/").pop()||e}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}triggerPick(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="",t=wt.fileName(this.value),a=e&&this.value.startsWith("data:"),s=e?o`<span class="file" title="${t}">📄 ${a?o`<a href="${this.value}" download="${t}">${t}</a>`:o`<a href="${this.value}" target="_blank">${t}</a>`}</span>`:l;return this.editable?o`
            <input type="file" accept="${this.accept||l}" style="display: none;"
                   @change="${this.filePicked}">
            <div class="row">
                ${s}
                <button class="button" @click="${this.triggerPick}">
                    ${e?"Replace":"Choose file"}
                </button>
                ${e?o`
                    <button class="button button--danger" @click="${()=>this.emit("")}">Remove</button>`:l}
            </div>`:o`${e?s:o`<span class="empty">—</span>`}`}};wt.styles=y`
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
    `;qa([u()],wt.prototype,"fieldId",2);qa([u()],wt.prototype,"value",2);qa([u()],wt.prototype,"accept",2);qa([u({type:Boolean})],wt.prototype,"editable",2);wt=qa([x("mateu-file-upload")],wt);var Oa=(e=>(e.Add="Add",e.Replace="Replace",e.ReplaceKeepData="ReplaceKeepData",e))(Oa||{}),gc=Object.defineProperty,Xs=(e,t,a,s)=>{for(var i=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=n(t,a,i)||i);return i&&gc(t,a,i),i};class fi extends k{constructor(){super(...arguments),this.id="",this.baseUrl="",this.callbackToken="",this.createElement=t=>{const a=t.data,s=document.createElement(a.name);for(let i in a.attributes)s.setAttribute(i,a.attributes[i]);for(let i in a.on)s.addEventListener(i,r=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.on[i],parameters:{event:r}},bubbles:!0,composed:!0}))});return s},this.closeModal=()=>{const t=(this.shadowRoot??this).querySelectorAll("mateu-dialog, mateu-drawer");if(t&&t.length>0){t[t.length-1].close(),this.removeTopOverlayChild();return}this.dispatchEvent(new CustomEvent("close-modal-requested",{bubbles:!0,composed:!0}))},this.changeFavicon=t=>{let a=document.querySelector('link[rel="icon"]');a!==null?a.setAttribute("href",t):(a=document.createElement("link"),a.setAttribute("rel","icon"),a.setAttribute("href",t),document.head.appendChild(a))}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=Lt.subscribe(t=>{if(t.command){const a=t.command;this.id==a.targetComponentId&&this.applyCommand(a)}if((!t.callbackToken||!this.callbackToken||t.callbackToken===this.callbackToken)&&t.fragment){const a=t.fragment;this.id==a.targetComponentId&&(this.applyFragment(a),this.completeMenu(a))}})}completeMenu(t){if(t.component&&t.component.type==se.ClientSide){const a=t.component,s=a.metadata;if(s?.type==m.App){const i=s,r=this.getRemoteMenus(i.menu);if(r.length>0){const n=r.map(d=>Xt.runAction(d.baseUrl,d.route,"_empty","",d.baseUrl+"#"+d.route,void 0,void 0,void 0,d.params,this,!0));Promise.all(n).then(d=>{i.menu=this.updateMenu(i.menu,d.map(c=>c.fragments).filter(c=>c).map(c=>c).flat()),i.variant=at.MENU_ON_TOP,Lt.next({fragment:{component:a,data:void 0,state:void 0,action:Oa.Replace,targetComponentId:this.id,containerId:void 0},callbackToken:this.callbackToken})})}}}}updateMenu(t,a){const s=[];return t.forEach(i=>{if(i.remote){const r=a.find(n=>n.targetComponentId==i.baseUrl+"#"+i.route);if(r&&r.component?.type==se.ClientSide){const n=r.component;if(n.metadata?.type==m.App){const d=n.metadata,c=i.serverSideType&&i.serverSideType!=""?i.serverSideType:d.serverSideType;this.changeBaseUrl(d.menu,i.baseUrl,c,i.route,d.route),s.push(...d.menu)}}}else s.push(i)}),s}changeBaseUrl(t,a,s,i,r){t.forEach(n=>{n.baseUrl||(n.submenus&&n.submenus.length>0?this.changeBaseUrl(n.submenus,a,s,i,r):(n.consumedRoute=r??"",n.baseUrl=a,n.serverSideType=s,n.uriPrefix=i))})}getRemoteMenus(t){const a=[];return t.forEach(s=>{s.remote&&a.push(s)}),a}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(t){if(t.type=="SetWindowTitle"&&(document.title=t.data),t.type=="SetFavicon"&&this.changeFavicon(t.data),t.type=="DispatchEvent"&&this.dispatchNamedEvent(t.data),t.type=="NavigateTo"){const a=t.data;a&&(a.startsWith("http:")||a.startsWith("https:")?window.open(t.data,"_blank"):window.location.href=t.data)}if(t.type=="PushStateToHistory"){const a=t.data;a!==void 0&&this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:a},bubbles:!0,composed:!0}))}if(t.type=="RunAction"){const a=t.data;if(a&&a.actionId)if(a.targetComponentId){const s={command:{type:"RunAction",data:{actionId:a.actionId},targetComponentId:a.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:""};setTimeout(()=>Lt.next(s))}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(t.type=="MarkAsDirty"&&this.dispatchEvent(new CustomEvent("dirty",{detail:{},bubbles:!0,composed:!0})),t.type=="MarkAsClean"&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),t.type=="DownloadFile"){const a=t.data;if(a&&a.base64Content){const s=atob(a.base64Content),i=new Uint8Array(s.length);for(let c=0;c<s.length;c++)i[c]=s.charCodeAt(c);const r=new Blob([i],{type:a.mimeType}),n=URL.createObjectURL(r),d=document.createElement("a");d.href=n,d.download=a.filename??"export",d.click(),URL.revokeObjectURL(n)}}if(t.type=="CloseModal"&&(this.closeModal(),this.dispatchNamedEvent(t.data)),t.type=="AddContentToHead"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.head.appendChild(this.createElement(t))}}if(t.type=="AddContentToBody"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.body.appendChild(this.createElement(t))}}}dispatchNamedEvent(t){if(t&&t.eventName){const a=this.component,s=a?.emitsName??a?.serverSideType;let i=t.payload??t.detail;s&&i&&typeof i=="object"&&(i={...i,__source:s}),this.dispatchEvent(new CustomEvent(t.eventName,{detail:i,bubbles:!0,composed:!0}))}}removeTopOverlayChild(){const t=this.component?.children;if(t)for(let a=t.length-1;a>=0;a--){const s=t[a]?.metadata?.type;if(s==m.Drawer||s==m.Dialog){t.splice(a,1);return}}}}Xs([u()],fi.prototype,"id");Xs([u()],fi.prototype,"baseUrl");var yc=Object.defineProperty,$c=(e,t,a,s)=>{for(var i=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=n(t,a,i)||i);return i&&yc(t,a,i),i};class bi extends fi{applyFragment(t){}manageActionRequestedEvent(t){}}$c([u()],bi.prototype,"component");var xc=Object.defineProperty,wc=Object.getOwnPropertyDescriptor,Ot=(e,t,a,s)=>{for(var i=s>1?void 0:s?wc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&xc(t,a,i),i};const kc=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},Cc=(e,t)=>{let a=t;for(;a;){if(a===e)return!0;a=a.assignedSlot??a.parentNode??a.host??null}return!1};let Ye=class extends bi{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.hoveredItem=null,this.onGridHoverMove=e=>{const t=e.currentTarget,a=t.getEventContext(e)?.item??null;a!==this.hoveredItem&&(this.hoveredItem=a,t.generateCellPartNames())},this.onGridHoverLeave=e=>{this.hoveredItem!==null&&(this.hoveredItem=null,e.currentTarget.generateCellPartNames())},this.hoverCellPartNameGenerator=(e,t)=>t?.item!=null&&t.item===this.hoveredItem?"hovered-cell":"",this._onRowKey=e=>{const t=this.field?.rowSelectionShortcut;if(!t||!this.field?.onItemSelectionActionId||!this._isRowShortcutRelevant()||!zs(t,e))return;const a=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!a)return;const s=this.currentItems(),i=parseInt(a[1],10)-1;i>=s.length||(e.preventDefault(),this.selectRow(s[i]))},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onRowKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._onRowKey)}currentItems(){return this.field?.remoteCoordinates?this.data?.[this.id]?.content??[]:this.field?.fieldId&&this.state?this.state[this.field.fieldId]??[]:[]}selectRow(e){!e||!this.field?.onItemSelectionActionId||(this.selectedItems=[e],this.state[this.id+"_selected_items"]=[e],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.field.onItemSelectionActionId,parameters:{_clickedRow:e}},bubbles:!0,composed:!0})))}_isRowShortcutRelevant(){if(this.offsetParent===null&&this.getClientRects().length===0)return!1;const e=kc();if(e&&e!==document.body&&!Cc(this,e)){const t=e.tagName?.toLowerCase()??"";if(e.isContentEditable||/^(input|textarea|select)$/.test(t)||t.startsWith("vaadin-")&&/(field|combo|picker|area|select)/.test(t))return!1}return!0}handleItemToggle(e){const{item:t,selected:a,shiftKey:s}=e.detail;if(this.rangeStartItem??=t,s){let i=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(i=this.state[this.field.fieldId]);const[r,n]=[this.rangeStartItem,t].map(p=>i.indexOf(p)).sort((p,h)=>p-h),d=i.slice(r,n+1),c=new Set(this.selectedItems);d.forEach(p=>{a?c.add(p):c.delete(p)}),this.selectedItems=[...c],this.state[this.id+"_selected_items"]=this.selectedItems}this.rangeStartItem=t}render(){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);const t=this.state[this.field?.fieldId+"_show_detail"]||this.state._show_detail&&this.state._show_detail[this.field.fieldId];if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates,s="";this.data[this.id]&&(this.data[this.id].searchSignature||s)&&this.data[this.id].searchSignature!=s&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements?e=this.data[this.id].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:s,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}if(Array.isArray(e)&&e.forEach((a,s)=>{a&&typeof a=="object"&&a._rowNumber===void 0&&(a._rowNumber=s)}),this.field?.inlineEditing)return this.renderMaster(e);if(this.field?.formPosition&&this.field?.formPosition.startsWith("modal")){const a=this;return o`

                ${this.renderMaster(e)}

                <vaadin-dialog
                        .opened="${t}"
                        @closed="${()=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.field?.fieldId+"_cancel"},bubbles:!0,composed:!0}))}}"
                        ${li(()=>o`
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
                    .cellPartNameGenerator="${E(this.field?.onItemSelectionActionId?this.hoverCellPartNameGenerator:void 0)}"
                    @mousemove="${E(this.field?.onItemSelectionActionId?this.onGridHoverMove:void 0)}"
                    @mouseleave="${E(this.field?.onItemSelectionActionId?this.onGridHoverLeave:void 0)}"
                    style="${this.field?.onItemSelectionActionId?"cursor: pointer;":""}${this.field?.style??""}"
                    class="${this.field?.cssClasses}"
                    .items="${e}"
                    .selectedItems="${t}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${a=>{this.selectedItems=a.detail.value,this.state[this.id+"_selected_items"]=this.selectedItems}}"
                    @item-toggle="${this.handleItemToggle}"
                    @click="${E(this.field?.onItemSelectionActionId?a=>{const i=a.currentTarget.getEventContext(a)?.item;i&&this.selectRow(i)}:void 0)}"
                    @active-item-changed="${E(this.field?.detailPath&&!this.field?.useButtonForDetail?a=>{if(this.field?.detailPath){const s=a.detail.value;s?this.detailsOpenedItems=[s]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${E(this.field?.detailPath?Is(a=>o`${C(this,a[this.field?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    ?all-rows-visible=${e?.length<10}
            >
                <span slot="empty-state">${this.field?.label?`No ${this.field.label.toLowerCase()} added yet.`:"No items added yet."}</span>
                ${this.field?.readOnly||this.field?.inlineEditing?l:o`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.columns?.map(a=>Fi(a,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}

                ${this.field?.inlineEditing&&!this.field?.readOnly?o`
                    <vaadin-grid-column width="3.5rem" flex-grow="0" frozen-to-end
                            ${it(a=>o`
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
                            ${it((a,{detailsOpened:s})=>o`
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
        </vaadin-vertical-layout>`}};Ye.styles=y`
        ${_t}

        /* Clickable grids (a row-selection action is wired) give visual feedback: the host sets a
           pointer cursor (inline, inherited by the slotted cell content), and the cells of the
           hovered row — tagged "hovered-cell" by cellPartNameGenerator — get a subtle highlight. */
        vaadin-grid[clickable]::part(hovered-cell) {
            background-color: var(--lumo-primary-color-10pct);
            cursor: pointer;
        }
    `;Ot([u()],Ye.prototype,"field",2);Ot([u()],Ye.prototype,"state",2);Ot([u()],Ye.prototype,"data",2);Ot([u()],Ye.prototype,"appState",2);Ot([u()],Ye.prototype,"appData",2);Ot([u()],Ye.prototype,"selectedItems",2);Ot([b()],Ye.prototype,"detailsOpenedItems",2);Ye=Ot([x("mateu-grid")],Ye);var _c=Object.defineProperty,Ic=Object.getOwnPropertyDescriptor,fa=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ic(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&_c(t,a,i),i};let kt=class extends k{constructor(){super(...arguments),this.getNewValue=e=>{if(this.field?.dataType=="array"){if(!this.value)return[e];const t=this.value;return t.indexOf(e)>=0?t.filter(a=>a!==e):[...t,e]}return e}}render(){let e=this.field?.options;if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates;this.data?.[this.field.fieldId]&&this.data[this.field.fieldId].content&&this.data[this.field.fieldId].totalElements?e=this.data[this.field.fieldId].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:"",fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}const t=this.field?.attributes?.divStyle;return o`
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

       `}};kt.styles=y`
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
  `;fa([u()],kt.prototype,"field",2);fa([u()],kt.prototype,"baseUrl",2);fa([u()],kt.prototype,"state",2);fa([u()],kt.prototype,"data",2);fa([u()],kt.prototype,"value",2);kt=fa([x("mateu-choice")],kt);var Sc=Object.defineProperty,Ec=Object.getOwnPropertyDescriptor,Je=(e,t,a,s)=>{for(var i=s>1?void 0:s?Ec(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Sc(t,a,i),i};let $e=class extends k{constructor(){super(...arguments),this.currencyChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),this.value.currency=e.detail.value,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}}))},this.valueChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),e.detail.value&&(this.value.value=e.detail.value?parseFloat(e.detail.value):0,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}})))}}render(){return o`
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
       `}};$e.styles=y`
  `;Je([u()],$e.prototype,"fieldId",2);Je([u()],$e.prototype,"label",2);Je([u()],$e.prototype,"state",2);Je([u()],$e.prototype,"data",2);Je([u()],$e.prototype,"value",2);Je([u()],$e.prototype,"autoFocus",2);Je([u()],$e.prototype,"required",2);Je([u()],$e.prototype,"colspan",2);Je([u()],$e.prototype,"helperText",2);$e=Je([x("mateu-money-field")],$e);const ms=["vaadin:abacus","vaadin:absolute-position","vaadin:academy-cap","vaadin:accessibility","vaadin:accordion-menu","vaadin:add-dock","vaadin:adjust","vaadin:adobe-flash","vaadin:airplane","vaadin:alarm","vaadin:align-center","vaadin:align-justify","vaadin:align-left","vaadin:align-right","vaadin:alt-a","vaadin:alt","vaadin:ambulance","vaadin:anchor","vaadin:angle-double-down","vaadin:angle-double-left","vaadin:angle-double-right","vaadin:angle-double-up","vaadin:angle-down","vaadin:angle-left","vaadin:angle-right","vaadin:angle-up","vaadin:archive","vaadin:archives","vaadin:area-select","vaadin:arrow-backward","vaadin:arrow-circle-down-o","vaadin:arrow-circle-down","vaadin:arrow-circle-left-o","vaadin:arrow-circle-left","vaadin:arrow-circle-right-o","vaadin:arrow-circle-right","vaadin:arrow-circle-up-o","vaadin:arrow-circle-up","vaadin:arrow-down","vaadin:arrow-forward","vaadin:arrow-left","vaadin:arrow-long-down","vaadin:arrow-long-left","vaadin:arrow-right","vaadin:arrow-up","vaadin:arrows-cross","vaadin:arrows-long-h","vaadin:arrows-long-right","vaadin:arrows-long-up","vaadin:arrows-long-v","vaadin:arrows","vaadin:asterisk","vaadin:at","vaadin:automation","vaadin:backspace-a","vaadin:backspace","vaadin:backwards","vaadin:ban","vaadin:bar-chart-h","vaadin:bar-chart-v","vaadin:bar-chart","vaadin:barcode","vaadin:bed","vaadin:bell-o","vaadin:bell-slash-o","vaadin:bell-slash","vaadin:bell","vaadin:boat","vaadin:bold","vaadin:bolt","vaadin:bomb","vaadin:book-dollar","vaadin:book-percent","vaadin:book","vaadin:bookmark-o","vaadin:bookmark","vaadin:briefcase","vaadin:browser","vaadin:bug-o","vaadin:bug","vaadin:building-o","vaadin:building","vaadin:bullets","vaadin:bullseye","vaadin:bus","vaadin:buss","vaadin:button","vaadin:calc-book","vaadin:calc","vaadin:calendar-briefcase","vaadin:calendar-clock","vaadin:calendar-envelope","vaadin:calendar-o","vaadin:calendar-user","vaadin:calendar","vaadin:camera","vaadin:car","vaadin:caret-down","vaadin:caret-left","vaadin:caret-right","vaadin:caret-square-down-o","vaadin:caret-square-left-o","vaadin:caret-square-right-o","vaadin:caret-square-up-o","vaadin:caret-up","vaadin:cart-o","vaadin:cart","vaadin:cash","vaadin:chart-3d","vaadin:chart-grid","vaadin:chart-line","vaadin:chart-timeline","vaadin:chart","vaadin:chat","vaadin:check-circle-o","vaadin:check-circle","vaadin:check-square-o","vaadin:check-square","vaadin:check","vaadin:chevron-circle-down-o","vaadin:chevron-circle-down","vaadin:chevron-circle-left-o","vaadin:chevron-circle-left","vaadin:chevron-circle-right-o","vaadin:chevron-circle-right","vaadin:chevron-circle-up-o","vaadin:chevron-circle-up","vaadin:chevron-down-small","vaadin:chevron-down","vaadin:chevron-left-small","vaadin:chevron-left","vaadin:chevron-right-small","vaadin:chevron-right","vaadin:chevron-up-small","vaadin:chevron-up","vaadin:child","vaadin:circle-thin","vaadin:circle","vaadin:clipboard-check","vaadin:clipboard-cross","vaadin:clipboard-heart","vaadin:clipboard-pulse","vaadin:clipboard-text","vaadin:clipboard-user","vaadin:clipboard","vaadin:clock","vaadin:close-big","vaadin:close-circle-o","vaadin:close-circle","vaadin:close-small","vaadin:close","vaadin:cloud-download-o","vaadin:cloud-download","vaadin:cloud-o","vaadin:cloud-upload-o","vaadin:cloud-upload","vaadin:cloud","vaadin:cluster","vaadin:code","vaadin:coffee","vaadin:cog-o","vaadin:cog","vaadin:cogs","vaadin:coin-piles","vaadin:coins","vaadin:combobox","vaadin:comment-ellipsis-o","vaadin:comment-ellipsis","vaadin:comment-o","vaadin:comment","vaadin:comments-o","vaadin:comments","vaadin:compile","vaadin:compress-square","vaadin:compress","vaadin:connect-o","vaadin:connect","vaadin:controller","vaadin:copy-o","vaadin:copy","vaadin:copyright","vaadin:corner-lower-left","vaadin:corner-lower-right","vaadin:corner-upper-left","vaadin:corner-upper-right","vaadin:credit-card","vaadin:crop","vaadin:cross-cutlery","vaadin:crosshairs","vaadin:css","vaadin:ctrl-a","vaadin:ctrl","vaadin:cube","vaadin:cubes","vaadin:curly-brackets","vaadin:cursor-o","vaadin:cursor","vaadin:cutlery","vaadin:dashboard","vaadin:database","vaadin:date-input","vaadin:deindent","vaadin:del-a","vaadin:del","vaadin:dental-chair","vaadin:desktop","vaadin:diamond-o","vaadin:diamond","vaadin:diploma-scroll","vaadin:diploma","vaadin:disc","vaadin:doctor-briefcase","vaadin:doctor","vaadin:dollar","vaadin:dot-circle","vaadin:download-alt","vaadin:download","vaadin:drop","vaadin:edit","vaadin:eject","vaadin:elastic","vaadin:ellipsis-circle-o","vaadin:ellipsis-circle","vaadin:ellipsis-dots-h","vaadin:ellipsis-dots-v","vaadin:ellipsis-h","vaadin:ellipsis-v","vaadin:enter-arrow","vaadin:enter","vaadin:envelope-o","vaadin:envelope-open-o","vaadin:envelope-open","vaadin:envelope","vaadin:envelopes-o","vaadin:envelopes","vaadin:eraser","vaadin:esc-a","vaadin:esc","vaadin:euro","vaadin:exchange","vaadin:exclamation-circle-o","vaadin:exclamation-circle","vaadin:exclamation","vaadin:exit-o","vaadin:exit","vaadin:expand-full","vaadin:expand-square","vaadin:expand","vaadin:external-browser","vaadin:external-link","vaadin:eye-slash","vaadin:eye","vaadin:eyedropper","vaadin:facebook-square","vaadin:facebook","vaadin:factory","vaadin:family","vaadin:fast-backward","vaadin:fast-forward","vaadin:female","vaadin:file-add","vaadin:file-code","vaadin:file-font","vaadin:file-movie","vaadin:file-o","vaadin:file-picture","vaadin:file-presentation","vaadin:file-process","vaadin:file-refresh","vaadin:file-remove","vaadin:file-search","vaadin:file-sound","vaadin:file-start","vaadin:file-table","vaadin:file-text-o","vaadin:file-text","vaadin:file-tree-small","vaadin:file-tree-sub","vaadin:file-tree","vaadin:file-zip","vaadin:file","vaadin:fill","vaadin:film","vaadin:filter","vaadin:fire","vaadin:flag-checkered","vaadin:flag-o","vaadin:flag","vaadin:flash","vaadin:flask","vaadin:flight-landing","vaadin:flight-takeoff","vaadin:flip-h","vaadin:flip-v","vaadin:folder-add","vaadin:folder-o","vaadin:folder-open-o","vaadin:folder-open","vaadin:folder-remove","vaadin:folder-search","vaadin:folder","vaadin:font","vaadin:form","vaadin:forward","vaadin:frown-o","vaadin:funcion","vaadin:function","vaadin:funnel","vaadin:gamepad","vaadin:gavel","vaadin:gift","vaadin:glass","vaadin:glasses","vaadin:globe-wire","vaadin:globe","vaadin:golf","vaadin:google-plus-square","vaadin:google-plus","vaadin:grab","vaadin:grid-bevel","vaadin:grid-big-o","vaadin:grid-big","vaadin:grid-h","vaadin:grid-small-o","vaadin:grid-small","vaadin:grid-v","vaadin:grid","vaadin:group","vaadin:hammer","vaadin:hand","vaadin:handle-corner","vaadin:hands-up","vaadin:handshake","vaadin:harddrive-o","vaadin:harddrive","vaadin:hash","vaadin:header","vaadin:headphones","vaadin:headset","vaadin:health-card","vaadin:heart-o","vaadin:heart","vaadin:home-o","vaadin:home","vaadin:hospital","vaadin:hourglass-empty","vaadin:hourglass-end","vaadin:hourglass-start","vaadin:hourglass","vaadin:inbox","vaadin:indent","vaadin:info-circle-o","vaadin:info-circle","vaadin:info","vaadin:input","vaadin:insert","vaadin:institution","vaadin:invoice","vaadin:italic","vaadin:key-o","vaadin:key","vaadin:keyboard-o","vaadin:keyboard","vaadin:laptop","vaadin:layout","vaadin:level-down-bold","vaadin:level-down","vaadin:level-left-bold","vaadin:level-left","vaadin:level-right-bold","vaadin:level-right","vaadin:level-up-bold","vaadin:level-up","vaadin:lifebuoy","vaadin:lightbulb","vaadin:line-bar-chart","vaadin:line-chart","vaadin:line-h","vaadin:line-v","vaadin:lines-list","vaadin:lines","vaadin:link","vaadin:list-ol","vaadin:list-select","vaadin:list-ul","vaadin:list","vaadin:location-arrow-circle-o","vaadin:location-arrow-circle","vaadin:location-arrow","vaadin:lock","vaadin:magic","vaadin:magnet","vaadin:mailbox","vaadin:male","vaadin:map-marker","vaadin:margin-bottom","vaadin:margin-left","vaadin:margin-right","vaadin:margin-top","vaadin:margin","vaadin:medal","vaadin:megafone","vaadin:megaphone","vaadin:meh-o","vaadin:menu","vaadin:microphone","vaadin:minus-circle-o","vaadin:minus-circle","vaadin:minus-square-o","vaadin:minus","vaadin:mobile-browser","vaadin:mobile-retro","vaadin:mobile","vaadin:modal-list","vaadin:modal","vaadin:money-deposit","vaadin:money-exchange","vaadin:money-withdraw","vaadin:money","vaadin:moon-o","vaadin:moon","vaadin:morning","vaadin:movie","vaadin:music","vaadin:mute","vaadin:native-button","vaadin:newspaper","vaadin:notebook","vaadin:nurse","vaadin:office","vaadin:open-book","vaadin:option-a","vaadin:option","vaadin:options","vaadin:orientation","vaadin:out","vaadin:outbox","vaadin:package","vaadin:padding-bottom","vaadin:padding-left","vaadin:padding-right","vaadin:padding-top","vaadin:padding","vaadin:paint-roll","vaadin:paintbrush","vaadin:palete","vaadin:palette","vaadin:panel","vaadin:paperclip","vaadin:paperplane-o","vaadin:paperplane","vaadin:paragraph","vaadin:password","vaadin:paste","vaadin:pause","vaadin:pencil","vaadin:phone-landline","vaadin:phone","vaadin:picture","vaadin:pie-bar-chart","vaadin:pie-chart","vaadin:piggy-bank-coin","vaadin:piggy-bank","vaadin:pill","vaadin:pills","vaadin:pin-post","vaadin:pin","vaadin:play-circle-o","vaadin:play-circle","vaadin:play","vaadin:plug","vaadin:plus-circle-o","vaadin:plus-circle","vaadin:plus-minus","vaadin:plus-square-o","vaadin:plus","vaadin:pointer","vaadin:power-off","vaadin:presentation","vaadin:print","vaadin:progressbar","vaadin:puzzle-piece","vaadin:pyramid-chart","vaadin:qrcode","vaadin:question-circle-o","vaadin:question-circle","vaadin:question","vaadin:quote-left","vaadin:quote-right","vaadin:random","vaadin:raster-lower-left","vaadin:raster","vaadin:records","vaadin:recycle","vaadin:refresh","vaadin:reply-all","vaadin:reply","vaadin:resize-h","vaadin:resize-v","vaadin:retweet","vaadin:rhombus","vaadin:road-branch","vaadin:road-branches","vaadin:road-split","vaadin:road","vaadin:rocket","vaadin:rotate-left","vaadin:rotate-right","vaadin:rss-square","vaadin:rss","vaadin:safe-lock","vaadin:safe","vaadin:scale-unbalance","vaadin:scale","vaadin:scatter-chart","vaadin:scissors","vaadin:screwdriver","vaadin:search-minus","vaadin:search-plus","vaadin:search","vaadin:select","vaadin:server","vaadin:share-square","vaadin:share","vaadin:shield","vaadin:shift-arrow","vaadin:shift","vaadin:shop","vaadin:sign-in-alt","vaadin:sign-in","vaadin:sign-out-alt","vaadin:sign-out","vaadin:signal","vaadin:sitemap","vaadin:slider","vaadin:sliders","vaadin:smiley-o","vaadin:sort","vaadin:sound-disable","vaadin:spark-line","vaadin:specialist","vaadin:spinner-arc","vaadin:spinner-third","vaadin:spinner","vaadin:spline-area-chart","vaadin:spline-chart","vaadin:split-h","vaadin:split-v","vaadin:split","vaadin:spoon","vaadin:square-shadow","vaadin:star-half-left-o","vaadin:star-half-left","vaadin:star-half-right-o","vaadin:star-half-right","vaadin:star-o","vaadin:star","vaadin:start-cog","vaadin:step-backward","vaadin:step-forward","vaadin:stethoscope","vaadin:stock","vaadin:stop-cog","vaadin:stop","vaadin:stopwatch","vaadin:storage","vaadin:strikethrough","vaadin:subscript","vaadin:suitcase","vaadin:sun-down","vaadin:sun-o","vaadin:sun-rise","vaadin:superscript","vaadin:sword","vaadin:tab-a","vaadin:tab","vaadin:table","vaadin:tablet","vaadin:tabs","vaadin:tag","vaadin:tags","vaadin:tasks","vaadin:taxi","vaadin:teeth","vaadin:terminal","vaadin:text-height","vaadin:text-input","vaadin:text-label","vaadin:text-width","vaadin:thin-square","vaadin:thumbs-down-o","vaadin:thumbs-down","vaadin:thumbs-up-o","vaadin:thumbs-up","vaadin:ticket","vaadin:time-backward","vaadin:time-forward","vaadin:timer","vaadin:toolbox","vaadin:tools","vaadin:tooth","vaadin:touch","vaadin:train","vaadin:trash","vaadin:tree-table","vaadin:trendind-down","vaadin:trending-down","vaadin:trending-up","vaadin:trophy","vaadin:truck","vaadin:twin-col-select","vaadin:twitter-square","vaadin:twitter","vaadin:umbrella","vaadin:underline","vaadin:unlink","vaadin:unlock","vaadin:upload-alt","vaadin:upload","vaadin:user-card","vaadin:user-check","vaadin:user-clock","vaadin:user-heart","vaadin:user-star","vaadin:user","vaadin:users","vaadin:vaadin-h","vaadin:vaadin-v","vaadin:viewport","vaadin:vimeo-square","vaadin:vimeo","vaadin:volume-down","vaadin:volume-off","vaadin:volume-up","vaadin:volume","vaadin:wallet","vaadin:warning","vaadin:workplace","vaadin:wrench","vaadin:youtube-square","vaadin:youtube"];var Tc=Object.defineProperty,Pc=Object.getOwnPropertyDescriptor,de=(e,t,a,s)=>{for(var i=s>1?void 0:s?Pc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Tc(t,a,i),i};let Pi=null;const Oc=()=>(Pi||(Pi=Promise.all([J(()=>import("./vendor-ui5.js").then(e=>e.C),__vite__mapDeps([4,1,2,3])),J(()=>import("./vendor-ui5.js").then(e=>e.R),__vite__mapDeps([4,1,2,3]))])),Pi);let G=class extends k{constructor(){super(...arguments),this.ui5FieldComponentsReady=!1,this.component=void 0,this.field=void 0,this.baseUrl=void 0,this.state={},this.data={},this.appState={},this.appData={},this.colorPickerOpened=!1,this.colorPickerValue=void 0,this.comboData=[],this._comboFilter="",this.rendered=!1,this.renderColorPicker=()=>{this.loadUi5FieldComponents();const e=this.field?.fieldId,t=this.state&&e in this.state?this.state[e]:this.field?.initialValue;return o`
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
`,this.filteredIcons=[],this.navLinkOffset=null,this.iconFilterChanged=e=>{this.filteredIcons=ms.filter(t=>!e.detail.value||t.indexOf(e.detail.value)>=0)}}loadUi5FieldComponents(){this.ui5FieldComponentsReady||Oc().then(()=>{this.ui5FieldComponentsReady=!0})}remoteComboDataProvider(e){return(t,a)=>{const{filter:s,page:i,pageSize:r}=t,n=s??"";this._comboFilter=n,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{searchText:s,fieldId:this.field?.fieldId,size:r,page:i,sort:void 0},callback:d=>{if(n===this._comboFilter)if(d?.messages?.forEach(c=>{qt.show(c.text,{position:c.position?this.mapPosition(c.position):void 0,theme:c.variant,duration:c.duration})}),!d.fragments||d.fragments.length==0)this.comboData=[],a([],0);else{const c=d.fragments[0].data?.[this.id];this.comboData=c?.content,a(c?.content,c?.totalElements)}},callbackonly:!0},bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.rendered=!1}renderNavLink(){const e=this.field?.link;if(!e?.href)return l;const t=Oe(e.href,this.state,this.data)??e.href,a=Oe(e.title,this.state,this.data)||t,s=e.icon||(t.startsWith("http")?"vaadin:external-link":"vaadin:link"),i=this.navLinkOffset??"calc(var(--lumo-font-size-s) * 1.6 + (var(--lumo-size-m) - var(--lumo-icon-size-s)) / 2)";return o`<a
                data-navlink
                href="${t}"
                title="${a}"
                target="${E(e.target||void 0)}"
                style="display: flex; align-items: center; color: var(--lumo-secondary-text-color); align-self: flex-start; margin-top: ${i};"
        ><vaadin-icon icon="${s}" style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"></vaadin-icon></a>`}positionNavLink(){const e=this.renderRoot?.querySelector("a[data-navlink]");e&&setTimeout(()=>{const t=e.parentElement,a=t?.firstElementChild?.firstElementChild;if(!t||!a)return;const i=(a.shadowRoot?.querySelector('[part="input-field"]')??a).getBoundingClientRect();if(i.height===0)return;const r=Math.max(0,i.top+i.height/2-e.offsetHeight/2-t.getBoundingClientRect().top),n=`${Math.round(r)}px`;this.navLinkOffset!==n&&(this.navLinkOffset=n)})}helperText(){return this.helperShownInControl=!0,Ve(this.field?.description??"",this.state,this.data)??""}render(){const e=this.field?.fieldId??"";this.rendered=!0;const t=this.renderNavLink();this.helperShownInControl=!1;const a=this.renderField(),s=this.field?.description&&!this.helperShownInControl?Ve(this.field.description,this.state,this.data):void 0;return o`<div style="display: block;">
            <div style="${t!==l?"display: flex; gap: var(--lumo-space-xs);":""}"><div style="flex: 1; min-width: 0;">${a}</div>${t}</div>
            ${s?o`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${s}</div>
            `:l}
            ${this.data.errors&&this.data.errors[e]&&this.data.errors[e].length>0?o`
                <div><ul>${this.data.errors[e].map(i=>o`<li>${i}</li>`)}</ul></div>
            `:l}
        </div>`}async firstUpdated(){this.filteredIcons=ms}update(e){e.has("component")&&(this.rendered=!1),super.update(e)}updated(e){super.updated(e),this.positionNavLink()}renderField(){const e=this.field?.fieldId??"",t=this.state&&e in this.state?this.state[e]:this.field?.initialValue,a=this.field?.label+"",s=Oe(a,this.state,this.data),i=this.labelAlreadyRendered||!s||s=="null"?l:s;return this.field?.propertyRow?this.renderPropertyRowField(e,t,i,s):this.field?.stereotype=="badge"?this.renderBadgeField(e,t,i,s):this.field?.stereotype=="plainText"?this.renderPlainTextField(e,t,i,s):this.field?.stereotype=="bulletedList"?this.renderBulletedListField(e,t,i,s):this.field?.readOnly&&this.field.stereotype!="grid"&&this.field.dataType!="status"&&this.field?.dataType!="money"?this.renderReadOnlyField(e,t,i,s):this.field?.dataType=="file"?this.renderFileField(e,t,i,s):this.field?.dataType=="string"?this.renderStringField(e,t,i,s):this.field?.dataType=="number"?this.renderNumberField(e,t,i,s):this.field?.dataType=="integer"?this.renderIntegerField(e,t,i,s):this.field?.dataType=="bool"?this.renderBoolField(e,t,i,s):this.field?.dataType=="dateRange"?this.renderDateRangeField(e,t,i,s):this.field?.dataType=="date"?this.renderDateField(e,t,i,s):this.field?.dataType=="dateTime"?this.renderDateTimeField(e,t,i,s):this.field?.dataType=="time"?this.renderTimeField(e,t,i,s):this.field?.dataType=="array"?this.renderArrayField(e,t,i,s):this.field?.dataType=="money"?this.renderMoneyField(e,t,i,s):this.field?.dataType=="status"?this.renderStatusField(e,t,i,s):this.field?.dataType=="range"?this.renderRangeField(e,t,i,s):o`<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`}renderBadgeField(e,t,a,s){if(!this.field)return o``;const i=t===!0||t==="true";return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><span theme="badge ${i?"success":""} pill" style="${i?"":"opacity: 0.4;"}">${s}</span>
            </vaadin-custom-field>`}renderPropertyRowField(e,t,a,s){if(!this.field)return o``;let i=Ve(t,this.state,this.data);const r=i&&typeof i=="object"&&"value"in i?i:null;i&&i.value&&(i=i.value);const n=this.field?.dataType=="bool"||i===!0||i===!1,d=this.field?.dataType=="money",c=i!=null&&i!=="";let p=c?String(i):"—";if(d&&c){const f=typeof i=="number"?i:parseFloat(String(i));isNaN(f)||(p=r&&r.locale&&r.currency?new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(f):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(f))}const h=n?o`<vaadin-icon icon="${i===!0||i==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:o`<span style="font-weight: 500; text-align: right; word-break: break-word; margin-left: auto;${d?" font-variant-numeric: tabular-nums;":""}">${p}</span>`,v=s&&s!="null";return o`<div
                    id="${this.field.fieldId}"
                    data-colspan="${this.field?.colspan}"
                    style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; width: 100%; padding: 0.4rem 0; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); font-size: var(--lumo-font-size-s, .875rem); ${this.field?.style}"
            >${v?o`<span style="color: var(--lumo-secondary-text-color, #888); white-space: nowrap;">${s}</span>`:l}${h}</div>`}renderBulletedListField(e,t,a,s){if(!this.field)return o``;const i=Ve(t,this.state,this.data),r=Array.isArray(i)?i.map(n=>String(n)):i!=null&&i!==""?[String(i)]:[];return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><mateu-bulleted-list .items="${r}"></mateu-bulleted-list>
            </vaadin-custom-field>`}renderPlainTextField(e,t,a,s){if(!this.field)return o``;let i=Ve(t,this.state,this.data);const r=i&&typeof i=="object"&&"value"in i?i:null;i&&i.value&&(i=i.value);const n=this.field?.dataType=="bool"||i===!0||i===!1,d=this.field?.dataType=="money",c=i!=null&&i!=="";let p=c?String(i):"—";if(d&&c){const v=typeof i=="number"?i:parseFloat(String(i));isNaN(v)||(p=r&&r.locale&&r.currency?new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(v):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v))}const h=n?o`<vaadin-icon icon="${i===!0||i==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:this.field?.multiline?o`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${p}</span>`:o`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${d?" font-variant-numeric: tabular-nums;":""}">${p}</span>`;return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    data-colspan="${this.field?.colspan}"
                    style="${d?"text-align: right; ":""}${this.field?.style}"
            >${h}</vaadin-custom-field>`}renderReadOnlyField(e,t,a,s){if(!this.field)return o``;let i=Ve(t,this.state,this.data)||this.data[e];if(i&&i.value&&(i=i.value),this.field.stereotype=="fileUpload")return o`<vaadin-custom-field
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
                            ${_i(this.comboRenderer,[])}
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
                            ${_i(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
                        <vaadin-custom-field
                                label="${a}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${E(this.selectedIndex(t))}"
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
                            selected="${E(this.selectedIndex(t))}"
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
                            ${_s(()=>o`
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
                            ${_i(this.iconComboboxRenderer,[])}
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
                `;if(this.field?.stereotype=="fileUpload"){const i=bc(this.field.attributes,"accept");return o`
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
  ${li(this.renderColorPicker,[])}
  ${Mi(this.renderColorPickerFooter,[])}
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
                                     .selectedValues="${E(this.selectedIndexes(t))}"
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
                                     .selectedValues="${E(this.selectedIndexes(t))}"
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
                    ${i?o`<span theme="badge pill ${ci(i.type)}">${i.message}</span>`:o``}                    
                </vaadin-custom-field>
            `}renderRangeField(e,t,a,s){if(!this.field)return o``;this.loadUi5FieldComponents();const i=t;return o`
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
            `}};G.styles=y`
        ${_t}

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
  `;de([b()],G.prototype,"ui5FieldComponentsReady",2);de([u()],G.prototype,"component",2);de([u()],G.prototype,"field",2);de([u()],G.prototype,"baseUrl",2);de([u()],G.prototype,"state",2);de([u()],G.prototype,"data",2);de([u()],G.prototype,"appState",2);de([u()],G.prototype,"appData",2);de([u()],G.prototype,"labelAlreadyRendered",2);de([b()],G.prototype,"colorPickerOpened",2);de([b()],G.prototype,"colorPickerValue",2);de([b()],G.prototype,"filteredIcons",2);de([b()],G.prototype,"navLinkOffset",2);G=de([x("mateu-field")],G);var zc=Object.defineProperty,Rc=Object.getOwnPropertyDescriptor,Zt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Rc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&zc(t,a,i),i};const Dc=e=>{const t=[];return e.color&&e.color!=="normal"&&e.color!=="none"&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle==="tertiaryInline"?"tertiary-inline":e.buttonStyle),e.size&&e.size!=="none"&&e.size!=="normal"&&t.push(e.size),t.length?t.join(" "):void 0},vs=e=>e==="back"||e==="backToList"||!!e&&e.startsWith("cancel");let ot=class extends k{constructor(){super(...arguments),this.appState={},this.appData={},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.evalLabel=e=>Oe(e,this.state,this.data),this.renderBtn=e=>{if((this.data??{})[e.actionId+".hidden"])return l;const t=this.evalLabel(e.label),a=j.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e.actionId));return a||o`
        <vaadin-button
                data-action-id="${e.id}"
                theme="${Dc(e)||l}"
                @click="${()=>this.handleButtonClick(e.actionId)}"
                ?disabled="${e.disabled}"
        >${e.iconOnLeft?o`<vaadin-icon icon="${e.iconOnLeft}"></vaadin-icon>`:l}${t}${e.iconOnRight?o`<vaadin-icon icon="${e.iconOnRight}"></vaadin-icon>`:l}</vaadin-button>
    `},this.renderPeerNav=e=>{const t=j.get()?.renderPeerNav?.(e);return t||o`
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
        `}}render(){const e=this.metadata;if(!e)return o``;const t=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0,a=e.toolbar??[],s=a.filter(c=>vs(c.actionId)),i=a.filter(c=>!vs(c.actionId)),r=s.length>0&&i.length>0?o`<span class="toolbar-divider"></span>`:l,n=e.avatar||e.title||e.subtitle||e.kpis?.length>0||e.header?.length>0||a.length>0||!!t,d=e.level??0;return d>0?this.setAttribute("data-nested",""):this.removeAttribute("data-nested"),o`
            ${e.breadcrumbs&&e.breadcrumbs.length>0?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="breadcrumbs-bar">
                    ${e.breadcrumbs.map((c,p)=>o`
                        ${p>0?o`<span>/</span>`:l}
                        ${c.link?o`<button class="breadcrumb-link" @click="${()=>window.location.href=`${c.link}`}">${c.text}</button>`:o`<span>${c.text}</span>`}
                    `)}
                </div>
            `:l}
            ${e.noHeader?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                    ${e?.header?.map(c=>C(this,c,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${t?this.renderPeerNav(t):l}
                    ${s.map(this.renderBtn)}
                    ${r}
                    ${i.map(this.renderBtn)}
                </div>
            `:n?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="form-header">
                    ${e.avatar?C(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):l}
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        ${e?.title&&d==0?o`<h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ge(ht(e?.title,this.state??{},this.data??{}))}</h2>`:l}
                        ${e?.title&&d==1?o`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ge(ht(e?.title,this.state??{},this.data??{}))}</h3>`:l}
                        ${e?.title&&d==2?o`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ge(ht(e?.title,this.state??{},this.data??{}))}</h4>`:l}
                        ${e?.title&&d==3?o`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ge(ht(e?.title,this.state??{},this.data??{}))}</h5>`:l}
                        ${e?.title&&d>3?o`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ge(ht(e?.title,this.state??{},this.data??{}))}</h6>`:l}

                        ${e?.subtitle?o`<span style="display: inline-block; margin-block-end: 0.83em;">${ge(ht(e?.subtitle,this.state??{},this.data??{}))}</span>`:l}
                        ${e?.timestamp?o`<span class="page-timestamp" style="display: block; color: var(--lumo-secondary-text-color, #6b7280); font-size: var(--lumo-font-size-s, .875rem);">${ge(ht(e.timestamp,this.state??{},this.data??{}))}</span>`:l}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${e?.kpis?.map(c=>o`
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div>${this.evalLabel(c.title)}</div>
                                <div>${ge(ht(c.text,this.state??{},this.data??{}))}</div>
                            </div>
                        `)}
                        ${e?.header?.map(c=>C(this,c,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${t?this.renderPeerNav(t):l}
                        ${s.map(this.renderBtn)}
                        ${r}
                        ${i.map(this.renderBtn)}
                    </div>
                </div>
            `:l}
            ${e.badges&&e.badges.length>0?o`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${e.badges.map(c=>Fo(c,this.state??{},this.data??{}))}
                </div>
            `:l}
        `}};ot.styles=y`
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

        ${_t}
    `;Zt([u()],ot.prototype,"metadata",2);Zt([u()],ot.prototype,"baseUrl",2);Zt([u()],ot.prototype,"state",2);Zt([u()],ot.prototype,"data",2);Zt([u()],ot.prototype,"appState",2);Zt([u()],ot.prototype,"appData",2);ot=Zt([x("mateu-content-header")],ot);var Ac=Object.defineProperty,Lc=Object.getOwnPropertyDescriptor,Fa=(e,t,a,s)=>{for(var i=s>1?void 0:s?Lc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Ac(t,a,i),i};let Vt=class extends bi{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={}}render(){const e=this.component?.metadata;return o`
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
       `}};Vt.styles=y`
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
    `;Fa([u()],Vt.prototype,"state",2);Fa([u()],Vt.prototype,"data",2);Fa([u()],Vt.prototype,"appState",2);Fa([u()],Vt.prototype,"appData",2);Vt=Fa([x("mateu-form")],Vt);var Mc=Object.defineProperty,qc=Object.getOwnPropertyDescriptor,Me=(e,t,a,s)=>{for(var i=s>1?void 0:s?qc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Mc(t,a,i),i};let he=class extends k{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.pagesRequested=[],this.emptyArray=e=>!e||e.length==0,this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;if(this.metadata?.infiniteScrolling&&e.page>0){let s=!1;a&&a.content&&(a.content.length>=(e.page+1)*e.pageSize||a.content.length==a.totalElements)&&(t(a.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),a.totalElements),s=!0,this.grid&&this.grid.recalculateColumnWidths()),s||this.pagesRequested.find(i=>i==e.page)||(this.pagesRequested.push(e.page),this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:e,callback:()=>{this.data[this.id]?.page?.content&&(t(this.data[this.id].page.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),this.data[this.id].page.totalElements),this.grid&&this.grid.recalculateColumnWidths())}},bubbles:!0,composed:!0})))}else{const s=this.metadata?.infiniteScrolling?a?.totalElements:a?.content?.length??0;t(a?.content??[],s),this.grid&&this.grid.recalculateColumnWidths()}},this._onActionRequested=e=>{const t=e.detail,a=this.identifierFieldName;if(!a||!t.parameters||t.actionId?.startsWith("action-on-row-"))return;const s=t.parameters[a];s!==void 0&&(this.state._selectedId=String(s),this._applyCellPartNameGenerator(),this.grid?.requestContentUpdate())},this.tooltipGenerator=e=>{let t="";const{column:a,item:s}=e,i=this.metadata?.columns?.find(r=>r.metadata.id==a?.path);if(i?.metadata){const r=(i?.metadata).tooltipPath;r&&a&&s&&(t=s[r])}return t}}get identifierFieldName(){const e=this.metadata?.columns?.find(a=>a.metadata?.identifier);if(e)return e.metadata?.id;if(this.metadata?.columns?.find(a=>a.metadata?.id==="id"))return"id"}_applyCellPartNameGenerator(){if(!this.grid)return;const e=this.identifierFieldName,t=this.state?._selectedId??this.appState?._splitDetailId,a=!!this.metadata?.groupBy;e&&t!==void 0||a?this.grid.cellPartNameGenerator=(s,i)=>{const r=i.item;return Ha(r)?"mateu-group-row":e&&t!==void 0&&String(r[e])===String(t)?"selected-row":""}:this.grid.cellPartNameGenerator=null}connectedCallback(){super.connectedCallback(),this.addEventListener("action-requested",this._onActionRequested)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("action-requested",this._onActionRequested)}updated(e){super.updated(e),this._applyCellPartNameGenerator(),this.grid?.clearCache(),this.grid?.requestContentUpdate(),this.grid?.recalculateColumnWidths(),this.pagesRequested=[]}render(){const e=this.data[this.id],t=e?.page,a=this.metadata?.groupBy,s=this.metadata?.infiniteScrolling?void 0:t?.content?so(t.content,a,e?.groups):t?.content,i=(this.metadata?.columns??[]).flatMap(c=>c.metadata?.type===m.GridGroupColumn?(c.metadata.columns??[]).map(p=>p.metadata):[c.metadata]),r=no(i,e,a);let n="";this.metadata?.wrapCellContent&&(n+=" wrap-cell-content"),this.metadata?.compact&&(n+=" compact"),this.metadata?.noBorder&&(n+=" no-border"),this.metadata?.noRowBorder&&(n+=" no-row-borders"),this.metadata?.columnBorders&&(n+=" column-borders"),this.metadata?.rowStripes&&(n+=" row-stripes");const d=this.state[this.id+"_selected_items"]||[];return o`
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
                    @selected-items-changed="${c=>{const p=(c.detail.value??[]).filter(h=>!Ha(h));this.emptyArray(this.state[this.id+"_selected_items"])&&this.emptyArray(p)||(this.state[this.id+"_selected_items"]=p,this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0})))}}"
                    @active-item-changed="${E(this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?c=>{if(this.metadata?.detailPath){const p=c.detail.value;if(p&&Ha(p))return;p?this.detailsOpenedItems=[p]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${E(this.metadata?.detailPath?Is(c=>o`${C(this,c[this.metadata?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    theme="${n}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?o`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:l}
                ${this.metadata?.columns?.map(c=>Fi(c,this,this.baseUrl,this.state,this.data,this.appState,this.appData,r))}
                ${this.metadata?.useButtonForDetail?o`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${it((c,{detailsOpened:p})=>o`
              <vaadin-button
                theme="tertiary icon"
                title="${p?"Collapse":"Expand"}"
                aria-label="Toggle details"
                aria-expanded="${p?"true":"false"}"
                @click="${()=>{this.detailsOpenedItems=p?this.detailsOpenedItems.filter(h=>h!==c):[...this.detailsOpenedItems,c]}}"
              >
                <vaadin-icon
                  .icon="${p?"lumo:angle-down":"lumo:angle-right"}"
                ></vaadin-icon>
              </vaadin-button>
            `,[])}
                    ></vaadin-grid-column>
                `:l}
                <span slot="empty-state">${At(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(c=>c.metadata.tooltipPath)?o`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:l}
            </vaadin-grid>
            <slot></slot>
       `}};he.styles=y`
        ${_t}
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
  `;Me([u()],he.prototype,"id",2);Me([u()],he.prototype,"metadata",2);Me([u()],he.prototype,"baseUrl",2);Me([u()],he.prototype,"state",2);Me([u()],he.prototype,"data",2);Me([u()],he.prototype,"appState",2);Me([u()],he.prototype,"appData",2);Me([u()],he.prototype,"emptyStateMessage",2);Me([b()],he.prototype,"detailsOpenedItems",2);Me([Ce("vaadin-grid")],he.prototype,"grid",2);he=Me([x("mateu-table")],he);const Qs="mateu-saved-views",gi=()=>{try{return JSON.parse(localStorage.getItem(Qs)??"{}")}catch{return{}}},Yi=e=>{try{localStorage.setItem(Qs,JSON.stringify(e))}catch{}},Zs=e=>gi()[e]??[],Fc=(e,t)=>{const a=t.name?.trim();if(!a||Object.keys(t.values??{}).length===0)return;const s=gi(),i=(s[e]??[]).filter(r=>r.name!==a);i.push({...t,name:a}),s[e]=i,Yi(s)},Nc=(e,t)=>{const a=gi(),s=(a[e]??[]).filter(i=>i.name!==t);s.length===0?delete a[e]:a[e]=s,Yi(a)},Uc=(e,t)=>{const a=gi();a[e]=(a[e]??[]).map(s=>({...s,isDefault:s.name===t?!s.isDefault:!1})),Yi(a)},jc=e=>Zs(e).find(t=>t.isDefault);var Bc=Object.defineProperty,Vc=Object.getOwnPropertyDescriptor,Ie=(e,t,a,s)=>{for(var i=s>1?void 0:s?Vc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Bc(t,a,i),i};let oe=class extends k{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.panelOpened=!1,this.viewsOpened=!1,this.draftText="",this.openPanel=()=>{this.panelOpened||this.filters.length===0||(this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1,this.activeFilter=void 0},this.clearAllFilters=()=>{const e=this.filters.flatMap(a=>this.isRangeFilter(a)?[`${a.fieldId}_from`,`${a.fieldId}_to`]:[a.fieldId]),t={searchText:void 0};e.forEach(a=>{t[a]=void 0}),this.state={...this.state,...t},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:e},bubbles:!0,composed:!0})),this.requestSearch()},this.keepFocus=e=>e.preventDefault()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get filters(){return this.metadata?.filters??[]}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}requestSearch(){this.closePanel(),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))}emitValueChanged(e,t){this.state={...this.state,[e]:t},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:e},bubbles:!0,composed:!0}))}applyFilter(e,t){this.emitValueChanged(e,t),this.requestSearch()}removeChip(e){const t=this.filters.find(a=>a.fieldId===e);t&&this.isRangeFilter(t)?(this.emitValueChanged(`${e}_from`,void 0),this.emitValueChanged(`${e}_to`,void 0)):this.emitValueChanged(e,e==="searchText"?"":void 0),this.requestSearch()}commitText(e){this.emitValueChanged("searchText",e.value),this.draftText="",e.value="",this.requestSearch()}get viewsScope(){return window.location.pathname}allFilterKeys(){return["searchText",...this.filters.flatMap(e=>this.isRangeFilter(e)?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId])]}snapshotValues(){const e={};return this.state.searchText&&(e.searchText=this.state.searchText),this.filters.forEach(t=>{if(this.isSet(t))if(this.isRangeFilter(t)){const a=this.rangeBound(t,"from"),s=this.rangeBound(t,"to");a&&(e[`${t.fieldId}_from`]=a),s&&(e[`${t.fieldId}_to`]=s)}else this.isMultiFilter(t)?e[t.fieldId]=this.multiValues(t):e[t.fieldId]=this.state[t.fieldId]}),e}applyView(e){const t=this.allFilterKeys(),a={};t.forEach(s=>{a[s]=void 0}),this.state={...this.state,...a},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:t},bubbles:!0,composed:!0})),Object.entries(e.values).forEach(([s,i])=>this.emitValueChanged(s,i)),this.viewsOpened=!1,this.detachOutsideClick(),this.requestSearch()}saveCurrentView(e){const t=e.value.trim();t&&(Fc(this.viewsScope,{name:t,values:this.snapshotValues()}),e.value="",this.requestUpdate())}firstUpdated(){if(window.location.search)return;const e=jc(this.viewsScope);e&&setTimeout(()=>{this.state.searchText||this.filters.some(a=>this.isSet(a))||this.applyView(e)},0)}isBooleanFilter(e){return e.dataType==="boolean"||e.dataType==="bool"||e.stereotype==="checkbox"||e.stereotype==="toggle"}isNumericFilter(e){return["integer","decimal","number","money"].includes(e.dataType??"")}isRangeFilter(e){return e.stereotype==="dateRange"||e.stereotype==="numberRange"}isMultiFilter(e){return e.stereotype==="multiSelect"}hasOptions(e){return(e.options?.length??0)>0}multiValues(e){const t=this.state[e.fieldId];return Array.isArray(t)?t.map(String):typeof t=="string"&&t!==""?t.split(",").map(a=>a.trim()).filter(a=>a):[]}rangeBound(e,t){const a=this.state[`${e.fieldId}_${t}`];return a==null?"":String(a)}isSet(e){if(this.isRangeFilter(e))return this.rangeBound(e,"from")!==""||this.rangeBound(e,"to")!=="";if(this.isMultiFilter(e))return this.multiValues(e).length>0;const t=this.state[e.fieldId];return t!=null&&t!==""&&!Number.isNaN(t)}getFilterDisplayValue(e,t){if(e.options?.length){const a=e.options.find(s=>s.value===String(t));if(a)return a.label??a.value}return typeof t=="boolean"?t?"Yes":"No":String(t)}conditionDisplay(e){if(this.isRangeFilter(e)){const t=this.rangeBound(e,"from"),a=this.rangeBound(e,"to");return t&&a?`${t} – ${a}`:t?`≥ ${t}`:`≤ ${a}`}return this.isMultiFilter(e)?this.multiValues(e).map(t=>this.getFilterDisplayValue(e,t)).join(", "):this.getFilterDisplayValue(e,this.state[e.fieldId])}labelOf(e){return Oe(e.label,this.state,this.data)||e.fieldId}panelRow(e,t,a="panel-row"){return o`
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
            </div>`}renderViewsPanel(){if(!this.viewsOpened)return l;const e=Zs(this.viewsScope),t=!!this.state.searchText||this.filters.some(a=>this.isSet(a));return o`
            <div class="panel views-panel">
                <div class="panel-caption">Saved views</div>
                ${e.length===0?o`
                    <div class="panel-row views-empty">No saved views yet</div>`:l}
                ${e.map(a=>o`
                    <div class="panel-row view-row" @mousedown="${this.keepFocus}">
                        <span class="view-name" @click="${()=>this.applyView(a)}">${a.name}</span>
                        <button class="view-star ${a.isDefault?"view-star--on":""}"
                                title="${a.isDefault?"Unset as default":"Open this listing with this view"}"
                                @click="${()=>{Uc(this.viewsScope,a.name),this.requestUpdate()}}">★</button>
                        <button class="chip-remove" aria-label="Delete view ${a.name}"
                                @click="${()=>{Nc(this.viewsScope,a.name),this.requestUpdate()}}">✕</button>
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
        `}};oe.styles=y`
        ${_t}
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
    `;Ie([u()],oe.prototype,"metadata",2);Ie([u()],oe.prototype,"baseUrl",2);Ie([b()],oe.prototype,"state",2);Ie([b()],oe.prototype,"data",2);Ie([u()],oe.prototype,"appState",2);Ie([u()],oe.prototype,"appData",2);Ie([u({type:Boolean})],oe.prototype,"searchOnly",2);Ie([b()],oe.prototype,"panelOpened",2);Ie([b()],oe.prototype,"viewsOpened",2);Ie([b()],oe.prototype,"activeFilter",2);Ie([b()],oe.prototype,"draftText",2);oe=Ie([x("mateu-filter-bar")],oe);const er="mateu-column-prefs",Ji=()=>{try{const e=JSON.parse(localStorage.getItem(er)??"{}");return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}catch{return{}}},tr=e=>{try{localStorage.setItem(er,JSON.stringify(e))}catch{}},Xi=e=>{if(!e||typeof e!="object")return;const t=a=>Array.isArray(a)?a.filter(s=>typeof s=="string"):[];return{hidden:t(e.hidden),order:t(e.order)}},ar=e=>Xi(Ji()[e]),Hc=(e,t)=>{const a=Ji(),s=Xi(t);s.hidden.length===0&&s.order.length===0?delete a[e]:a[e]=s,tr(a)},Wc=e=>{const t=Ji();delete t[e],tr(t)},ir=e=>e?!!e.identifier||e.dataType==="action"||e.dataType==="actionGroup"||e.dataType==="menu"||e.id==="select"||e.id==="menu":!1,sr=(e,t,a=s=>s)=>{const s=Xi(t);if(!s||s.hidden.length===0&&s.order.length===0)return e;const i=v=>a(v)?.id??v.id,r=new Set(s.hidden),n=e.filter(v=>{const f=i(v);return!f||!r.has(f)||ir(a(v))});if(s.order.length===0)return n.length===e.length?e:n;const d=new Map;n.forEach(v=>{const f=i(v);f&&!d.has(f)&&d.set(f,v)});const c=[],p=new Set;return s.order.forEach(v=>{const f=d.get(v);f&&!p.has(f)&&(c.push(f),p.add(f))}),n.forEach(v=>{p.has(v)||(c.push(v),p.add(v))}),c.length===e.length&&c.every((v,f)=>v===e[f])?e:c};var Gc=Object.defineProperty,Kc=Object.getOwnPropertyDescriptor,Na=(e,t,a,s)=>{for(var i=s>1?void 0:s?Kc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Gc(t,a,i),i};let Ht=class extends k{constructor(){super(...arguments),this.columns=[],this.scope="",this.panelOpened=!1,this.revision=0,this.togglePanel=()=>{if(this.panelOpened){this.closePanel();return}this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick)},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1},this.reset=()=>{Wc(this.scope),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}get prefs(){return ar(this.scope)??{hidden:[],order:[]}}effectiveEntries(e){return sr(this.columns,{hidden:[],order:e.order})}commit(e){Hc(this.scope,e),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}toggleVisibility(e){const t=this.prefs,a=t.hidden.includes(e)?t.hidden.filter(s=>s!==e):[...t.hidden,e];this.commit({...t,hidden:a})}move(e,t){const a=this.prefs,s=[...this.effectiveEntries(a)],i=s.findIndex(d=>d.id===e);if(i<0)return;let r=i+t;for(;r>=0&&r<s.length&&s[r].protected;)r+=t;if(r<0||r>=s.length)return;const n=s[i];s[i]=s[r],s[r]=n,this.commit({...a,order:s.map(d=>d.id)})}render(){this.revision;const e=this.prefs,t=this.effectiveEntries(e).filter(s=>!s.protected);if(t.length===0)return o``;const a=e.hidden.length>0||e.order.length>0;return o`
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
        `}};Ht.styles=y`
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
    `;Na([u()],Ht.prototype,"columns",2);Na([u()],Ht.prototype,"scope",2);Na([b()],Ht.prototype,"panelOpened",2);Na([b()],Ht.prototype,"revision",2);Ht=Na([x("mateu-column-chooser")],Ht);var Yc=Object.defineProperty,Jc=Object.getOwnPropertyDescriptor,Ua=(e,t,a,s)=>{for(var i=s>1?void 0:s?Jc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Yc(t,a,i),i};let Wt=class extends k{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.totalPages=0}updated(e){super.updated(e),(e.has("totalElements")||e.has("pageSize"))&&(this.totalPages=Math.ceil(this.totalElements/this.pageSize))}dispatch(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return l;const e=this.totalPages>1,t=this.pageNumber,a=t===0,s=t>=this.totalPages-1;return o`
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
        `}};Wt.styles=y`
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
    `;Ua([u()],Wt.prototype,"totalElements",2);Ua([u()],Wt.prototype,"pageSize",2);Ua([u()],Wt.prototype,"pageNumber",2);Ua([b()],Wt.prototype,"totalPages",2);Wt=Ua([x("mateu-pagination")],Wt);var Xc=Object.defineProperty,Qc=Object.getOwnPropertyDescriptor,Se=(e,t,a,s)=>{for(var i=s>1?void 0:s?Qc(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Xc(t,a,i),i};let ne=class extends k{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;t(a?.content??[],a?.content?.length??0)},this.respondToVisibility=(e,t)=>{var a={root:document.documentElement},s=new IntersectionObserver(i=>{i.forEach(r=>{t(r.intersectionRatio>0)})},a);s.observe(e)},this.keepAsking=!1,this.askToUpper=()=>{const e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?Wi(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?o`<vaadin-card
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
                    <span slot="header-suffix" theme="badge ${ci(e.status.type)}">${e.status.message}</span>
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
       `}};ne.styles=y`
        ${_t}
        
        .card-container {
            display: flex; 
            width: 100%; 
            flex-wrap: wrap; 
            gap: 10px;
        }

        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }

    `;Se([u()],ne.prototype,"id",2);Se([u()],ne.prototype,"metadata",2);Se([u()],ne.prototype,"baseUrl",2);Se([u()],ne.prototype,"state",2);Se([u()],ne.prototype,"data",2);Se([u()],ne.prototype,"appState",2);Se([u()],ne.prototype,"appData",2);Se([u()],ne.prototype,"emptyStateMessage",2);Se([b()],ne.prototype,"keepAsking",2);Se([Ce("#ask-for-more")],ne.prototype,"askForMore",2);Se([b()],ne.prototype,"hasMore",2);ne=Se([x("mateu-card-list")],ne);var rr=(e=>(e.none="none",e.success="success",e.error="error",e.warning="warning",e.contrast="contrast",e.normal="normal",e))(rr||{}),or=(e=>(e.primary="primary",e.secondary="secondary",e.tertiary="tertiary",e.tertiaryInline="tertiaryInline",e))(or||{});const Zc=76;function fs(e){if(e.weight!=null)return e.weight;const t=e.stereotype??"";if(t==="icon")return 1;if(t==="image")return 4;if(t==="html"||t==="richText"||t==="markdown"||t==="textarea")return 5;if(t==="link")return 2.5;if(t==="combobox"||t==="select")return 2;const a=e.dataType??"";return a==="bool"?1:a==="status"||a==="integer"?1.5:a==="number"||a==="date"||a==="money"?2:a==="dateTime"||a==="dateRange"?2.5:3}function eu(e,t){if(e.length===0)return"table";const a=e.reduce((c,p)=>c+fs(p),0),s=t/Zc,i=a/s;if(i<=1)return"table";const r=e.filter(c=>c.identifier||(c.priority??Number.MAX_SAFE_INTEGER)<=2),n=r.reduce((c,p)=>c+fs(p),0);return i>1.6||e.length>10?"masterDetail":r.length>0&&n<=8?"list":e.some(c=>c.stereotype==="image"||c.stereotype==="html")||r.length===0&&e.length>=4&&e.length<=8?"cards":"masterDetail"}function nr(e){return e.filter(t=>t.identifier||(t.priority??Number.MAX_SAFE_INTEGER)<=2).sort((t,a)=>(t.priority??Number.MAX_SAFE_INTEGER)-(a.priority??Number.MAX_SAFE_INTEGER))}function tu(e){const t=nr(e);return t.length>0?t:e.slice(0,3)}var au=Object.defineProperty,iu=Object.getOwnPropertyDescriptor,Ee=(e,t,a,s)=>{for(var i=s>1?void 0:s?iu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&au(t,a,i),i};const su={asc:"ascending",desc:"descending"};let le=class extends k{constructor(){super(...arguments),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this._columnPrefsRevision=0,this._prefsRevisionApplied=-1,this.search=()=>{const e=this.component.metadata;this.state={...this.state,size:e.pageSize,page:0,crud_selected_items:[]},this._syncStateToUrl(e),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}}},bubbles:!0,composed:!0}))},this.notify=e=>{qt.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.handleSearchRequested=e=>{this.state={...this.state,crud_selected_items:[]};const t=this.component.metadata;this._syncStateToUrl(t),!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}},callback:e},bubbles:!0,composed:!0}))},this.fetchMoreElements=e=>{const{params:t,callback:a}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(a)},this.directionChanged=e=>{const t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(a=>({fieldId:a.__data.path,direction:a.__data.direction?su[a.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForComponentId=void 0,this.evalLabel=e=>Oe(e,this.state,this.data),this.handleToolbarButtonClick=e=>{if(e==="import"){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{const t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"process-import",parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get columnPrefsScope(){return window.location.pathname}get effectiveComponent(){const e=this.component,t=e?.metadata;if(!e||!t?.columns)return e;if(this._prefsSource===e&&this._prefsRevisionApplied===this._columnPrefsRevision)return this._prefsApplied;const a=ar(this.columnPrefsScope),s=sr(t.columns,a,i=>i.metadata??{});return this._prefsApplied=s===t.columns?e:{...e,metadata:{...t,columns:s}},this._prefsSource=e,this._prefsRevisionApplied=this._columnPrefsRevision,this._prefsApplied}get columnChooserEntries(){return(this.component?.metadata?.columns??[]).map(t=>{const a=t.metadata??{},s=a.id??t.id;return s?{id:s,label:a.label??s,protected:ir(a)}:void 0}).filter(t=>!!t)}renderColumnChooser(){const e=this.columnChooserEntries;return e.filter(t=>!t.protected).length===0?l:o`
            <mateu-column-chooser
                .columns="${e}"
                .scope="${this.columnPrefsScope}"
                @column-prefs-changed="${t=>{t.stopPropagation(),this._columnPrefsRevision++}}"
            ></mateu-column-chooser>
        `}get cols(){return this.effectiveComponent?.metadata?.columns?.map(t=>t.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.component?.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":eu(this.cols,this.availableWidthPx):t}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}_filterIds(e){return new Set(["searchText",...(e.filters??[]).flatMap(t=>t.stereotype==="dateRange"||t.stereotype==="numberRange"?[`${t.fieldId}_from`,`${t.fieldId}_to`]:[t.fieldId])])}_syncStateToUrl(e){const t=this._filterIds(e),a=new URLSearchParams(window.location.search);t.forEach(d=>a.delete(d)),a.delete("page"),a.delete("sort"),t.forEach(d=>{const c=this.state[d];c!=null&&c!==""&&a.set(d,String(c))});const s=this.state.page;s&&s>0&&a.set("page",String(s));const i=this.state.sort;if(i&&i.length>0){const d=i.filter(c=>c.fieldId&&c.direction).map(c=>`${c.fieldId}:${c.direction}`).join(",");d&&a.set("sort",d)}const r=a.toString(),n=r?`${window.location.pathname}?${r}`:window.location.pathname;window.location.pathname+window.location.search!==n&&history.replaceState(null,"",n)}_initStateFromUrl(e,t){const a=new URLSearchParams(window.location.search),s=this._filterIds(e),i={...t};a.forEach((d,c)=>{s.has(c)&&(i[c]=d)});const r=a.get("page");if(r!==null){const d=parseInt(r,10);!isNaN(d)&&d>0&&(i.page=d)}const n=a.get("sort");if(n){const d=n.split(",").map(c=>{const[p,h]=c.split(":");return p&&h?{fieldId:p,direction:h}:null}).filter(Boolean);d.length>0&&(i.sort=d)}return i}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}updated(e){if(super.updated(e),e.has("component")){const t=this.component?.id;if(t!==this._initializedForComponentId){this._initializedForComponentId=t;const a=this.component?.metadata,s=a.initialPage&&a.initialPage>0?a.initialPage:0;this.state=this._initStateFromUrl(a,{...this.state,size:a.pageSize,page:s,sort:[]}),(this.state.page!==s||this.state.sort?.length>0||[...this._filterIds(a)].some(r=>this.state[r]!=null))&&this.handleSearchRequested(void 0)}}}render(){const e=_=>{const L=[];return _.color&&_.color!==rr.normal&&L.push(_.color),_.buttonStyle&&L.push(_.buttonStyle===or.tertiaryInline?"tertiary-inline":_.buttonStyle),L.length?L.join(" "):void 0},t=_=>_==="back"||_==="backToList"||!!_&&_.startsWith("cancel"),a=_=>{const L=j.get()?.renderToolbarButton?.(_,this.evalLabel(_.label),()=>this.handleToolbarButtonClick(_.actionId));return L||o`
                <vaadin-button
                        data-action-id="${_.id}"
                        theme="${e(_)||l}"
                        @click="${()=>this.handleToolbarButtonClick(_.actionId)}"
                >${this.evalLabel(_.label)}</vaadin-button>
            `};if(!this.component)return o`no component`;const s=this.effectiveComponent,i=s.metadata;i.serverSideOrdering=!0;const r=i?.toolbar??[],n=r.filter(_=>t(_.actionId)),d=r.filter(_=>!t(_.actionId)),c=n.length>0&&d.length>0,p=!!i?.title||!!i?.subtitle||r.length>0,h=this.effectiveGridLayout,v=this.cols,f=nr(v),$=this.data[this.id]?.page?.content??[],g=this.state[this.component?.id]?.emptyStateMessage,S=(_,L)=>{const O=L[_.id];if(O==null)return o``;if(_.dataType==="status"){const D=ci(O.type);return o`<span theme="badge pill ${D}">${O.message}</span>`}return _.dataType==="bool"?o`${O?"✓":"✗"}`:typeof O=="object"?o`${O.label??O.name??O.message??""}`:o`${O}`},V=()=>{const _=this.identifierFieldName,L=this.state._selectedId??this.appState?._splitDetailId,O=f.find(T=>T.identifier)??f[0],D=T=>T.dataType==="action"||T.dataType==="actionGroup"||T.dataType==="menu"||T.stereotype==="button",et=f.filter(T=>T!==O&&!D(T)),ea=v.filter(T=>D(T)),ut=(T,ae,be)=>{T.stopPropagation(),T.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:ae,parameters:{_clickedRow:be}},bubbles:!0,composed:!0}))},ta=T=>{const ae=[];for(const be of ea){const M=T[be.id];if(be.dataType==="action"){const A=M?.methodNameInCrud?M:T.action?.methodNameInCrud?T.action:{methodNameInCrud:be.id,label:be.label,icon:null};ae.push(o`
                            <vaadin-button theme="tertiary small" title="${A.label||l}"
                                @click="${I=>ut(I,"action-on-row-"+A.methodNameInCrud,T)}">
                                ${A.icon?o`<vaadin-icon icon="${A.icon}"></vaadin-icon>`:l}
                                ${A.label??l}
                            </vaadin-button>`)}else(be.dataType==="actionGroup"||be.dataType==="menu")&&(M?.actions??[]).forEach(I=>ae.push(o`
                            <vaadin-button theme="tertiary small" title="${I.label||l}"
                                @click="${H=>ut(H,"action-on-row-"+I.methodNameInCrud,T)}">
                                ${I.icon?o`<vaadin-icon icon="${I.icon}"></vaadin-icon>`:l}
                                ${I.label??l}
                            </vaadin-button>`))}return ae.length?o`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${ae}
                    </div>`:l};return o`
                <vaadin-list-box style="width: 100%;">
                    ${$.length===0?o`<vaadin-item disabled>${At(g)}</vaadin-item>`:l}
                    ${$.map(T=>o`
                        <vaadin-item
                            ?selected="${_&&L!==void 0&&String(T[_])===String(L)}"
                            @click="${()=>{_&&T[_]!==void 0&&(this.state={...this.state,_selectedId:String(T[_])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:T},bubbles:!0,composed:!0}))}}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${O?T[O.id]??"":""}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${et.map(ae=>o`<span>${ae.label}: ${S(ae,T)}</span>`)}
                            </div>
                            ${ta(T)}
                        </vaadin-item>
                    `)}
                </vaadin-list-box>`},ue=(_,L,O)=>{const D=this.identifierFieldName;D&&O[D]!==void 0&&(this.state={...this.state,_selectedId:String(O[D])}),_.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:L,parameters:O},bubbles:!0,composed:!0}))},R=()=>{const _=this.identifierFieldName,L=this.state._selectedId??this.appState?._splitDetailId,O=v.slice(0,6),D=O.filter(I=>I.stereotype==="image"),et=O.find(I=>I.identifier)??O[0],ea=I=>!!I.actionId,ut=I=>I.dataType==="action"||I.dataType==="actionGroup"||I.dataType==="menu"||I.stereotype==="button",ta=O.find(I=>I.id==="select"&&I.dataType==="action"),T=!!ta,ae=O.filter(I=>I!==et&&!D.includes(I)&&!ea(I)&&!ut(I)),be=O.filter(I=>ut(I)&&!(T&&I===ta)),M=(I,H,pt)=>{I.stopPropagation(),I.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:H,parameters:{_clickedRow:pt}},bubbles:!0,composed:!0}))},A=I=>{const H=[];for(const pt of be){const Ci=I[pt.id];if(pt.dataType==="action"){const aa=Ci?.methodNameInCrud?Ci:I.action?.methodNameInCrud?I.action:{methodNameInCrud:pt.id,label:pt.label,icon:null};H.push(o`
                            <vaadin-button theme="tertiary" title="${aa.label||l}"
                                @click="${Rt=>M(Rt,"action-on-row-"+aa.methodNameInCrud,I)}">
                                ${aa.icon?o`<vaadin-icon icon="${aa.icon}"></vaadin-icon>`:l}
                                ${aa.label??l}
                            </vaadin-button>`)}else(pt.dataType==="actionGroup"||pt.dataType==="menu")&&(Ci?.actions??[]).forEach(Rt=>H.push(o`
                            <vaadin-button theme="tertiary" title="${Rt.label||l}"
                                @click="${br=>M(br,"action-on-row-"+Rt.methodNameInCrud,I)}">
                                ${Rt.icon?o`<vaadin-icon icon="${Rt.icon}"></vaadin-icon>`:l}
                                ${Rt.label??l}
                            </vaadin-button>`))}return H.length?o`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${H}
                    </div>`:l};return o`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${$.length===0?o`<div style="grid-column: 1 / -1;">${At(g)}</div>`:l}
                    ${$.map(I=>o`
                        <vaadin-card
                            clickable
                            ?data-selected="${_&&L!==void 0&&String(I[_])===String(L)}"
                            style="cursor: pointer;"
                            @click="${H=>T?M(H,"action-on-row-select",I):ue(H.target,"view",I)}"
                        >
                            ${D.length?o`<img slot="media" src="${I[D[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover;" />`:l}
                            ${et?o`<div slot="title">${I[et.id]??""}</div>`:l}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${ae.map(H=>o`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${H.label}</span>
                                        <span>${S(H,I)}</span>
                                    </div>
                                `)}
                            </div>
                            ${A(I)}
                        </vaadin-card>
                    `)}
                </div>`},Z=()=>{const _=tu(v),L=_.find(D=>D.identifier)??_[0],O=_.filter(D=>D!==L);return o`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <vaadin-list-box style="width: 100%;">
                            ${$.length===0?o`<vaadin-item disabled>${At(g)}</vaadin-item>`:l}
                            ${$.map(D=>o`
                                <vaadin-item
                                    ?selected="${this.selectedItem===D}"
                                    @click="${()=>{this.selectedItem=D}}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${L?D[L.id]??"":""}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${O.map(et=>o`${S(et,D)} `)}
                                    </div>
                                </vaadin-item>
                            `)}
                        </vaadin-list-box>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?o`
                            <vaadin-form-layout>
                                ${v.map(D=>o`
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
                </div>`},pe=()=>{const _=this.identifierFieldName,L=this.state._selectedId??this.appState?._splitDetailId,O=v[0],D=v.slice(1),et=!!O?.actionId,ea=M=>(M??[]).map(A=>{const I=Array.isArray(A.children)?A.children:[];return I.length>0?{...A,children:ea(I)}:{...A,children:void 0}}),ut=ea($),ta=(M,A)=>{const I=M.parentItem?M.parentItem.children??[]:ut;A(I,I.length)},T=(M,A)=>{for(const I of M??[]){if(_&&String(I[_])===A)return I;const H=T(I.children,A);if(H)return H}},ae=_&&L!==void 0?T(ut,String(L)):void 0,be=(M,A,I)=>{M.stopPropagation(),_&&A[_]!==void 0&&(this.state={...this.state,_selectedId:String(A[_])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:I,parameters:A},bubbles:!0,composed:!0}))};return o`
                <vaadin-grid
                    style="width: 100%;"
                    all-rows-visible
                    .itemHasChildrenPath="${"children"}"
                    .itemIdPath="${_??"id"}"
                    .dataProvider="${ta}"
                    .selectedItems="${ae?[ae]:[]}"
                >
                    ${O?o`<vaadin-grid-tree-column path="${O.id}" header="${O.label??l}" flex-grow="1"></vaadin-grid-tree-column>`:l}
                    ${et?o`
                    <vaadin-grid-column width="6rem" flex-grow="0" text-align="end" ${it(M=>M?.viewable===!1?l:o`
                        <vaadin-button theme="tertiary small" @click="${A=>be(A,M,"view")}">View</vaadin-button>
                    `,[])}></vaadin-grid-column>`:l}
                    ${D.map(M=>M.id==="select"?o`<vaadin-grid-column width="7rem" flex-grow="0" text-align="end" header="${M.label??l}" ${it(A=>o`
                            <vaadin-button theme="tertiary small" @click="${I=>{I.stopPropagation(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-select",parameters:{_clickedRow:A}},bubbles:!0,composed:!0}))}}">Select</vaadin-button>
                        `,[])}></vaadin-grid-column>`:o`<vaadin-grid-column path="${M.id}" header="${M.label??l}" auto-width></vaadin-grid-column>`)}
                    <span slot="empty-state">${At(g)}</span>
                </vaadin-grid>`},Y=j.get()?.rendersCrudLayouts?.()===!0,ee=o`
            ${i.infiniteScrolling?o`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:l}
            ${!Y&&h==="list"?V():!Y&&h==="cards"?i.contentHeight?o`
                <vaadin-scroller style="width: 100%; height: ${i.contentHeight};">
                    ${R()}
                </vaadin-scroller>
            `:R():!Y&&h==="masterDetail"?Z():!Y&&h==="tree"?pe():j.get()?.renderTableComponent(this,s,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,te=i.infiniteScrolling?l:j.get()?.renderPagination(this,this.component),fe=o`
            <vaadin-dialog
                .opened="${this.showImportDialog}"
                header-title="Import"
                @opened-changed="${_=>{this.showImportDialog=_.detail.value}}"
                ${li(()=>o`
                    <vaadin-upload
                        target="/upload"
                        max-files="1"
                        @upload-success="${this.handleImportUploadSuccess}"
                    ></vaadin-upload>
                `,[this.showImportDialog])}
                ${Mi(()=>o`
                    <vaadin-button @click="${()=>{this.showImportDialog=!1}}">Cancel</vaadin-button>
                `,[])}
            ></vaadin-dialog>
        `;return this.standalone?o`
                ${fe}
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
                        <div style="flex: 1; min-width: 0;">${j.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                        ${this.renderColumnChooser()}
                    </div>
                    <div style="flex: 1; overflow-y: auto; min-height: 0;">${ee}</div>
                    <div style="flex-shrink: 0;">${te}</div>
                </div>
            `:o`
            ${fe}
            ${p?o`
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m, 1rem);">
                        <div style="flex: 1; min-width: 0;">
                            ${i?.title?o`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(i.title)}</h2>
                            `:l}
                            ${i?.subtitle?o`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(i.subtitle)}</span>
                            `:l}
                        </div>
                        ${n.map(_=>a(_))}
                        ${c?o`<span class="toolbar-divider"></span>`:l}
                        ${d.map(_=>a(_))}
                        <slot></slot>
                    </div>
                `:l}
            <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); background: var(--mateu-section-bg, transparent); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); padding: var(--lumo-space-m); display: flex; flex-direction: column;">
                <div style="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);">
                    <div style="flex: 1; min-width: 0;">${j.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                    ${this.renderColumnChooser()}
                </div>
                <div style="flex: 1; overflow-y: auto; min-height: 0;">${ee}</div>
                <div style="flex-shrink: 0;">${te}</div>
            </div>
        `}createRenderRoot(){return j.mustUseShadowRoot()?super.createRenderRoot():this}};le.styles=y`
        ${_t}
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
    `;Ee([u()],le.prototype,"component",2);Ee([u()],le.prototype,"baseUrl",2);Ee([u({type:Boolean})],le.prototype,"standalone",2);Ee([u()],le.prototype,"state",2);Ee([u()],le.prototype,"data",2);Ee([u()],le.prototype,"appState",2);Ee([u()],le.prototype,"appData",2);Ee([b()],le.prototype,"showImportDialog",2);Ee([b()],le.prototype,"availableWidthPx",2);Ee([b()],le.prototype,"selectedItem",2);Ee([b()],le.prototype,"_columnPrefsRevision",2);le=Ee([x("mateu-table-crud")],le);var ft=(e=>(e.OnLoad="OnLoad",e.OnSuccess="OnSuccess",e.OnError="OnError",e.OnValueChange="OnValueChange",e.OnCustomEvent="OnCustomEvent",e.AutoSave="AutoSave",e))(ft||{}),ru=Object.defineProperty,yi=(e,t,a,s)=>{for(var i=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=n(t,a,i)||i);return i&&ru(t,a,i),i};class zt extends bi{constructor(){super(...arguments),this.state={},this.data={},this.appData={},this.appState={},this.triggerOnLoad=()=>{const t=this.component;this.registerCustomEventListeners(),t.triggers?.filter(a=>a.type==ft.OnLoad).forEach(a=>{if((!a.condition||this._evalExpr(a.condition))&&!a.triggered){const i=a;i.triggered=!0;var s=i.times-1;i.timeoutMillis>0?this.scheduleOnload(i,s,this.id):this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(t,a,s)=>{if(s!=this.component?.id)return;const i=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,callbackToken:i},bubbles:!0,composed:!0}))},t.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=t=>{if(!(t instanceof CustomEvent))return;const a=t,i=(this.component.triggers??[]).filter(r=>r.type==ft.OnCustomEvent).filter(r=>r.eventName==a.type).filter(r=>r.source!=="COMPONENT"||a.detail?.__source===r.from);i.length!==0&&(i.some(r=>!r.source||r.source==="SELF")&&(t.stopPropagation(),t.preventDefault()),i.forEach(r=>{(!r.condition||this._evalExpr(r.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,parameters:a.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(t){return Ts(t,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(t){return Yr(t,this.state??{},this.data??{},this._interpolationExtra())}applyFragment(t){if(this.id==t.targetComponentId){if(t.component)if(Oa.Add==t.action)this.component&&this.component.children?.push(t.component);else{if(this.callbackToken=ye(),t.component?.type==se.ServerSide)if(this.component){const s=this.component,i=t.component;s.actions=i.actions,s.type=i.type,s.rules=i.rules,s.triggers=i.triggers,s.serverSideType=i.serverSideType,s.route=i.route,s.initialData=i.initialData,s.validations=i.validations,s.cssClasses=i.cssClasses,s.slot=i.slot,s.style=i.style,s.children=i.children,(s.serverSideType!=i.serverSideType||s.id!=i.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=t.component,setTimeout(()=>this.triggerOnLoad());else{const s=[t.component];this.component&&(this.component.children=s)}t.action!==Oa.ReplaceKeepData&&(this.state={},this.data={})}if(t.state&&(this.state={...this.state,...t.state}),t.data){for(const s in t.data){const i=t.data[s]?.page;i?.pageNumber>0&&this.data[s]&&this.data[s].page.content&&(i.content?i.content=[...this.data[s].page.content,...i.content]:i.content=[...this.data[s].page.content])}this.data={...this.data,...t.data}}this.registerCustomEventListeners();const a=j.getAfterRenderHook();a&&setTimeout(()=>a(this)),this.requestUpdate()}}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:a,name:s})=>a.removeEventListener(s,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(a=>a.type==ft.OnCustomEvent).forEach(a=>{const s=a.source==="DOCUMENT"||a.source==="COMPONENT"?document:this;s.addEventListener(a.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:s,name:a.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:t,name:a})=>t.removeEventListener(a,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}}yi([u()],zt.prototype,"state");yi([u()],zt.prototype,"data");yi([u()],zt.prototype,"appData");yi([u()],zt.prototype,"appState");const lr="mateu-recent-routes",ou=8;function dr(){try{return JSON.parse(localStorage.getItem(lr)??"{}")}catch{return{}}}function nu(e){try{localStorage.setItem(lr,JSON.stringify(e))}catch{}}function bs(e){return dr()[e||"_"]??[]}function lu(e,t){if(!t?.route||!t.label)return;const a=e||"_",s=dr(),r=(s[a]??[]).filter(n=>n.route!==t.route);r.unshift({route:t.route,label:t.label}),s[a]=r.slice(0,ou),nu(s)}var du=Object.defineProperty,cu=Object.getOwnPropertyDescriptor,Xe=(e,t,a,s)=>{for(var i=s>1?void 0:s?cu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&du(t,a,i),i};let xe=class extends k{constructor(){super(...arguments),this.baseUrl="",this.open=!1,this.queryText="",this.dataHits=[],this.loading=!1,this.selectedIndex=0,this.fabOffset=0,this.keydownHandler=null}connectedCallback(){super.connectedCallback(),this.keydownHandler=e=>{(e.metaKey||e.ctrlKey)&&(e.key==="k"||e.key==="K")?(e.preventDefault(),this.toggle()):e.key==="Escape"&&this.open&&this.close()},document.addEventListener("keydown",this.keydownHandler),this.setupFabObserver()}disconnectedCallback(){super.disconnectedCallback(),this.keydownHandler&&document.removeEventListener("keydown",this.keydownHandler),clearTimeout(this.searchTimer),this.fabObserver?.disconnect(),this.fabObserver=void 0}setupFabObserver(){const e=this.getRootNode(),t=e instanceof ShadowRoot?e:document.body;this.measureFabStack(),this.fabObserver?.disconnect(),this.fabObserver=new MutationObserver(()=>this.measureFabStack()),this.fabObserver.observe(t,{childList:!0,subtree:!0})}measureFabStack(){const a=(this.getRootNode().querySelectorAll?.(".ai-fab, .app-fab, .page-fab").length??0)*4;a!==this.fabOffset&&(this.fabOffset=a)}updated(e){e.has("open")&&this.open&&requestAnimationFrame(()=>this.inputEl?.focus())}toggle(){this.open?this.close():this.openCenter()}openCenter(){this.open=!0,this.queryText="",this.dataHits=[],this.selectedIndex=0}close(){this.open=!1,this.queryText="",this.dataHits=[],clearTimeout(this.searchTimer)}flattenMenu(e,t){const a=[];for(const s of e??[])if(!s.separator)if(s.submenus&&s.submenus.length>0){const i=t?`${t} › ${s.label}`:s.label;a.push(...this.flattenMenu(s.submenus,i))}else s.route!==void 0&&s.route!==null&&a.push({label:s.label,breadcrumb:t,route:s.route});return a}onInput(e){this.queryText=e,this.selectedIndex=0;const t=e.trim();if(clearTimeout(this.searchTimer),!t||!this.app?.globalSearchEnabled){this.dataHits=[],this.loading=!1;return}this.loading=!0,this.searchTimer=setTimeout(()=>this.fetchGlobalSearch(t),250)}async fetchGlobalSearch(e){const t=this.app;if(!t?.globalSearchEnabled){this.loading=!1;return}try{const s=(await Xt.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","command-center",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(i=>i.data).find(i=>i&&i._globalsearch);this.dataHits=s?._globalsearch??[]}catch{this.dataHits=[]}finally{this.loading=!1}}navigateTo(e,t){lu(this.app?.serverSideType??"",{route:e,label:t}),this.close();for(const a of["route-changed","navigate-to-requested"])this.dispatchEvent(new CustomEvent(a,{detail:{route:e},bubbles:!0,composed:!0}))}askAi(){const e=this.queryText.trim();this.close(),this.dispatchEvent(new CustomEvent("mateu-open-ai",{detail:{query:e},bubbles:!0,composed:!0}))}visibleTargets(e){if(!this.queryText.trim()){const t=this.flattenMenu(this.app?.menu,"").map(s=>({route:s.route,label:s.label})),a=bs(this.app?.serverSideType??"");return[...t,...a]}return[...e.map(t=>({route:t.route,label:t.label})),...this.dataHits.map(t=>({route:t.route,label:t.label}))]}onKeydown(e,t){if(e.key==="ArrowDown")e.preventDefault(),this.selectedIndex=Math.min(this.selectedIndex+1,t.length-1);else if(e.key==="ArrowUp")e.preventDefault(),this.selectedIndex=Math.max(this.selectedIndex-1,0);else if(e.key==="Enter"){const a=t[this.selectedIndex];a&&this.navigateTo(a.route,a.label)}}render(){return o`
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
        `}renderDefault(){const e=this.flattenMenu(this.app?.menu,""),t=bs(this.app?.serverSideType??"");let a=-1;return o`
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
                </button>`})}`}searchGlyph(){return o`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`}backIcon(){return o`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`}clearIcon(){return o`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`}aiIcon(){return o`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l1.9 4.7L19 8.5l-4.1 2.3L12 15l-1.9-4.2L6 8.5l5.1-1.8z"></path></svg>`}};xe.styles=y`
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
    `;Xe([u({attribute:!1})],xe.prototype,"app",2);Xe([u()],xe.prototype,"baseUrl",2);Xe([b()],xe.prototype,"open",2);Xe([b()],xe.prototype,"queryText",2);Xe([b()],xe.prototype,"dataHits",2);Xe([b()],xe.prototype,"loading",2);Xe([b()],xe.prototype,"selectedIndex",2);Xe([b()],xe.prototype,"fabOffset",2);Xe([Ce(".cc-input")],xe.prototype,"inputEl",2);xe=Xe([x("mateu-command-center")],xe);let Ue=null;function uu(e){const t=e.component?.metadata;!!(t&&(t.commandCenterEnabled||t.chromeless)&&t.variant!=="MEDIATOR")?((!Ue||!Ue.isConnected)&&(Ue=document.createElement("mateu-command-center"),e.renderRoot.appendChild(Ue)),Ue.app=t,Ue.baseUrl=e.baseUrl??""):Ue&&e.renderRoot.contains(Ue)&&(Ue.remove(),Ue=null)}var pu=Object.defineProperty,hu=Object.getOwnPropertyDescriptor,$i=(e,t,a,s)=>{for(var i=s>1?void 0:s?hu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&pu(t,a,i),i};let da=class extends k{constructor(){super(...arguments),this.notificationOpened=!1,this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1,this.error=e.detail.reason,this.openNotification()},this.openNotification=()=>{this.notificationOpened=!0},this.closeNotification=()=>{this.notificationOpened=!1},this.notificationRenderer=()=>o`
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
                ${Cs(this.notificationRenderer,[])}
        ></vaadin-notification>`}};da.styles=y`
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
  `;$i([b()],da.prototype,"loading",2);$i([b()],da.prototype,"notificationOpened",2);$i([b()],da.prototype,"error",2);da=$i([x("mateu-api-caller")],da);var mu=Object.defineProperty,vu=Object.getOwnPropertyDescriptor,U=(e,t,a,s)=>{for(var i=s>1?void 0:s?vu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&mu(t,a,i),i};let F=class extends zt{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0,this.commandPaletteDataHits=[],this.openDataHit=e=>{Mt.confirmLeave()&&(this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteDataHits=[],this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:e.route},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:e.route},bubbles:!0,composed:!0})))},this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this._openAiHandler=()=>{this.chatOpen||this.showHideIa()},this.isDark=document.documentElement.getAttribute("theme")==="dark",this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;const e=this.isDark?"dark":"light";document.documentElement.setAttribute("theme",e),localStorage.setItem("mateu-theme",e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?"detail":"detail-hidden")},this.runAction=e=>{const a=this.renderRoot.querySelector?.("mateu-component");a&&a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){const a=e[t];if(a.selected)return a;const s=this.getSelectedOption(a.submenus);if(s)return s}return null},this.itemSelected=e=>{const t=e.detail.value;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.itemSelectedTiles=e=>{const t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))},this.mapItemsForTiles=e=>e.map(t=>({text:t.label,consumedRoute:t.consumedRoute,route:t.route,baseUrl:t.baseUrl,serverSideType:t.serverSideType,uriPrefix:t.uriPrefix,actionId:t.actionId,selected:t.selected,_menuOption:t})),this.flattenMenuForPalette=(e,t)=>{const a=[];for(const s of e)if(!s.separator)if(s.submenus&&s.submenus.length>0){const i=t?`${t} › ${s.label}`:s.label;a.push(...this.flattenMenuForPalette(s.submenus,i))}else a.push({label:s.label,breadcrumb:t,consumedRoute:s.consumedRoute,route:s.route,actionId:s.actionId,baseUrl:s.baseUrl,serverSideType:s.serverSideType,uriPrefix:s.uriPrefix});return a},this.handleCommandPaletteKeydown=(e,t)=>{const a=Math.min(t.length,10),s=a+Math.min(this.commandPaletteDataHits.length,8);if(e.key==="ArrowDown")e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,s-1);else if(e.key==="ArrowUp")e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key==="Enter"){if(this.commandPaletteSelectedIndex>=a){const r=this.commandPaletteDataHits[this.commandPaletteSelectedIndex-a];r&&this.openDataHit(r);return}const i=t[this.commandPaletteSelectedIndex];i&&(this.selectRoute(i.consumedRoute,i.route,i.actionId,i.baseUrl,i.serverSideType,i.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery="")}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return l;const e=this.component?.metadata;if(e?.commandCenterEnabled)return l;if(!e?.menu)return l;const t=this.flattenMenuForPalette(e.menu,""),a=this.commandPaletteQuery.toLowerCase(),s=a?t.filter(i=>i.label.toLowerCase().includes(a)||i.breadcrumb.toLowerCase().includes(a)):t;return o`
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
        `,this.goHome=()=>{const e=this.component.metadata;this.selectRoute(e.route,"_page","",void 0,void 0,void 0)},this.selectRoute=(e,t,a,s,i,r)=>{Mt.confirmLeave()&&this._selectRoute(e,t,a,s,i,r)},this._selectRoute=(e,t,a,s,i,r)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=s,this.selectedRoute=t,this.selectedServerSideType=i,this.selectedUriPrefix=r,this.instant=ye(),this.state&&this.state._route!=null&&(this.state._route=void 0);let n=this.baseUrl??"";n.indexOf("://")<0&&(n.startsWith("/")||(n="/"+n),n=window.location.origin+n),n.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let d=new URL(n+t);if(e&&d.pathname.startsWith(e)){const c=d.pathname.substring(e.length);d=new URL(d.origin+(c||"/"))}if((window.location.pathname||d.pathname)&&window.location.pathname!=d.pathname){let c=d.pathname;d.search&&(c+=d.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let p=c;this.selectedUriPrefix&&(p.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?p=this.selectedUriPrefix+p.substring(1):!p.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?p=this.selectedUriPrefix+"/"+p:p=this.selectedUriPrefix+p),p=="/_page"&&(p=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:p},bubbles:!0,composed:!0}))}}},this.mapItems=(e,t)=>e.map(a=>{if(a.submenus&&a.submenus.length>0){let s=this.mapItems(a.submenus,t);return t&&a.label.toLowerCase().includes(t)&&(s=this.mapItems(a.submenus,"")),s&&s.length>0?{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||a.selected,children:s}:void 0}if(a.separator)return t?void 0:{component:"hr"};if(!t||a.label.toLowerCase().includes(t))return{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||a.selected}}).filter(a=>a!=null),this.getSelectedIndex=e=>{if(e){const t=this.getSelectedOption(e);if(t)return e.indexOf(t)}return NaN},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?o`
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
                                    `:l}
                                    ${s.text}
                                    ${this.renderSideNav(s.children,"children")}
                                </vaadin-side-nav-item>
                        `}

                            `})}`:l,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}createRenderRoot(){return j.mustUseShadowRoot()?super.createRenderRoot():this}fetchGlobalSearch(e){const t=this.component?.metadata;if(t?.globalSearchEnabled){if(clearTimeout(this._globalSearchTimer),!e){this.commandPaletteDataHits=[];return}this._globalSearchTimer=setTimeout(async()=>{try{const s=(await Xt.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","cmd-palette",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(i=>i.data).find(i=>i&&i._globalsearch);this.commandPaletteDataHits=s?._globalsearch??[]}catch{this.commandPaletteDataHits=[]}},250)}}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute("theme")==="dark",this._commandPaletteHandler=e=>{this.component?.metadata?.commandCenterEnabled||((e.metaKey||e.ctrlKey)&&e.key==="k"&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0),e.key==="Escape"&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery=""))},document.addEventListener("keydown",this._commandPaletteHandler),Mt.install(),this.addEventListener("compact-changed",this._compactHandler),this.addEventListener("mateu-open-ai",this._openAiHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener("keydown",this._commandPaletteHandler),this.removeEventListener("compact-changed",this._compactHandler),this.removeEventListener("mateu-open-ai",this._openAiHandler)}updated(e){if(super.updated(e),uu(this),this.component){const a=this.component.metadata;if(a){const s=a;if(s.favicon){let i=document.querySelector("link[rel~='icon']");i||(i=document.createElement("link"),i.rel="icon",document.head.appendChild(i)),i.href=s.favicon}e.has("component")&&(this.selectedRoute=s.homeRoute,this.selectedConsumedRoute=s.homeConsumedRoute,this.selectedServerSideType=s.homeServerSideType,this.selectedBaseUrl=s.homeBaseUrl,this.selectedUriPrefix=s.homeUriPrefix)}}e.has("commandPaletteOpen")&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(".cmd-input")?.focus()},0)}render(){return j.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}};F.styles=y`

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

  `;U([b()],F.prototype,"filter",2);U([b()],F.prototype,"instant",2);U([b()],F.prototype,"selectedConsumedRoute",2);U([b()],F.prototype,"selectedRoute",2);U([b()],F.prototype,"selectedUriPrefix",2);U([b()],F.prototype,"selectedBaseUrl",2);U([b()],F.prototype,"selectedServerSideType",2);U([b()],F.prototype,"selectedParams",2);U([b()],F.prototype,"tilesMenuOption",2);U([b()],F.prototype,"railOpenOption",2);U([b()],F.prototype,"commandPaletteOpen",2);U([b()],F.prototype,"commandPaletteQuery",2);U([b()],F.prototype,"commandPaletteSelectedIndex",2);U([b()],F.prototype,"commandPaletteDataHits",2);U([b()],F.prototype,"pageCompact",2);U([Ce("mateu-chat")],F.prototype,"chat",2);U([b()],F.prototype,"isDark",2);U([b()],F.prototype,"chatOpen",2);U([Ce("vaadin-app-layout")],F.prototype,"vaadinAppLayout",2);F=U([x("mateu-app")],F);var fu=Object.defineProperty,bu=Object.getOwnPropertyDescriptor,Qe=(e,t,a,s)=>{for(var i=s>1?void 0:s?bu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&fu(t,a,i),i};let we=class extends k{constructor(){super(...arguments),this.message="This website uses cookies.",this.dismiss="Ok. Thanks :).",this.learnMore="Learn more",this.learnMoreLink="https://cookiesandyou.com/",this.showLearnMore=!0,this.position="top",this.cookieName="mateu-cookieconsent"}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement("style"),this._css.innerText=".cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}",document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){const e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){const e=this.popup;e&&(e.classList.remove("cc-invisible"),e.style.display="")}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:"#000"},button:{background:"rgba(22, 118, 243, 0.95)",hover:"rgba(22, 118, 243, 1)"}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});const e=this.popup;if(e){e.setAttribute("role","alert");const t=e.querySelector("a.cc-btn");t?.addEventListener("keydown",a=>{const r=a.keyCode||a.which;(r===32||r===13)&&t.click()})}}render(){return o`
       `}};we.styles=y`
  `;Qe([u()],we.prototype,"message",2);Qe([u()],we.prototype,"dismiss",2);Qe([u()],we.prototype,"learnMore",2);Qe([u()],we.prototype,"learnMoreLink",2);Qe([u()],we.prototype,"showLearnMore",2);Qe([u()],we.prototype,"position",2);Qe([u()],we.prototype,"cookieName",2);Qe([b()],we.prototype,"_css",2);Qe([Ce('[aria-label="cookieconsent"]')],we.prototype,"popup",2);we=Qe([x("mateu-cookie-consent")],we);var gu=Object.defineProperty,yu=Object.getOwnPropertyDescriptor,cr=(e,t,a,s)=>{for(var i=s>1?void 0:s?yu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&gu(t,a,i),i};let ri=class extends k{constructor(){super(...arguments),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener("value-changed",this.redispatchEvent),this.addEventListener("data-changed",this.redispatchEvent),this.addEventListener("action-requested",this.redispatchEvent),this.addEventListener("server-side-action-requested",this.redispatchEvent),this.addEventListener("route-changed",this.redispatchEvent),this.addEventListener("close-modal-requested",this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("value-changed",this.redispatchEvent),this.removeEventListener("data-changed",this.redispatchEvent),this.removeEventListener("action-requested",this.redispatchEvent),this.removeEventListener("server-side-action-requested",this.redispatchEvent),this.removeEventListener("route-changed",this.redispatchEvent)}render(){return o`<slot></slot>`}};ri.styles=y`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `;cr([u()],ri.prototype,"target",2);ri=cr([x("mateu-event-interceptor")],ri);var $u=Object.defineProperty,xu=Object.getOwnPropertyDescriptor,ur=(e,t,a,s)=>{for(var i=s>1?void 0:s?xu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&$u(t,a,i),i};let oi=class extends zt{constructor(){super(...arguments),this.opened=!0,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),500)}}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}render(){const e=this.component.metadata;let t="";e.noPadding&&(t+=" no-padding");const a=ka(e.headerTitle,this.state,this.data,this.appState,this.appData);return o`
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
                ${e.header||e.closeButtonOnHeader?kr(()=>o`<mateu-event-interceptor .target="${this}" style="width: 100%;">${e.header?C(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):l}${e.closeButtonOnHeader?o`
                            <vaadin-button theme="tertiary" @click="${this.close}">
                                <vaadin-icon icon="lumo:cross"></vaadin-icon>
                            </vaadin-button>
                        `:l}</mateu-event-interceptor>`,[this.state,this.data]):l}
                ${e.footer?Mi(()=>o`<mateu-event-interceptor .target="${this}" style="width: 100%;">${C(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):l}
                ${e.content?li(()=>o`<mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${C(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):l}
                style="${this.component?.style}" 
                class="${this.component?.cssClasses}"
        >
        </vaadin-dialog>

       `}};oi.styles=y`
  `;ur([b()],oi.prototype,"opened",2);oi=ur([x("mateu-dialog")],oi);var wu=Object.defineProperty,ku=Object.getOwnPropertyDescriptor,xi=(e,t,a,s)=>{for(var i=s>1?void 0:s?ku(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&wu(t,a,i),i};let ze=class extends zt{constructor(){super(...arguments),this.opened=!1,this.maximizeSteps=0,this.collapsed=!1,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),300)},this._escListener=e=>{if(e.key!=="Escape")return;const a=this.getRootNode().querySelectorAll("mateu-drawer, mateu-dialog");a[a.length-1]===this&&(e.stopPropagation(),this.close())}}effectiveWidth(e){if(e.width)return e.width;if(!e.size)return;const t=ze.SIZE_LADDER,a=Math.max(0,t.indexOf(e.size)),s=Math.min(t.length-1,a+this.maximizeSteps);return ze.SIZE_WIDTHS[t[s]]}canMaximize(e){if(!e.maximizable)return!1;const t=ze.SIZE_LADDER;return Math.max(0,t.indexOf(e.size??"m"))+this.maximizeSteps<t.length-1}firstUpdated(){requestAnimationFrame(()=>this.opened=!0)}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._escListener)}disconnectedCallback(){document.removeEventListener("keydown",this._escListener),super.disconnectedCallback()}render(){const e=this.component.metadata,t=e.position??"end",a=ka(e.headerTitle,this.state,this.data,this.appState,this.appData),s=ka(e.subtitle,this.state,this.data,this.appState,this.appData),i=this.effectiveWidth(e),r=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0;return o`
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
                    <mateu-event-interceptor .target="${this}">${C(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
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
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${C(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:l}
            </div>
            ${e.footer?o`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${C(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                </footer>
            `:l}
            `}
        </section>
       `}};ze.SIZE_LADDER=["s","m","l","xl"];ze.SIZE_WIDTHS={s:"464px",m:"648px",l:"968px",xl:"90vw"};ze.styles=y`
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
  `;xi([b()],ze.prototype,"opened",2);xi([b()],ze.prototype,"maximizeSteps",2);xi([b()],ze.prototype,"collapsed",2);ze=xi([x("mateu-drawer")],ze);var Cu=Object.defineProperty,_u=Object.getOwnPropertyDescriptor,ce=(e,t,a,s)=>{for(var i=s>1?void 0:s?_u(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Cu(t,a,i),i};function gs(e){if(e.parentElement)return e.parentElement;const t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}let K=class extends k{constructor(){super(...arguments),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type==="keydown"){const t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{const t=e.detail,a=t.banners??[],s=t.append??!1;s?this.actionBanners=[...this.actionBanners,...a]:(this._clearActionBannerTimers(),this.actionBanners=a);const i=s?this.actionBanners.length-a.length:0;a.forEach((r,n)=>{if(r.timeoutSeconds&&r.timeoutSeconds>0){const d=i+n;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((c,p)=>p!==d)},r.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;const t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;const a=parseInt(t[1],10)-1;a>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(a))},this._onScrollSpy=()=>{if(this._tocLocked)return;const e=this._sectionCards();if(!e.length)return;const t=12,a=this.shadowRoot?.querySelector("mateu-content-header");let s=a?a.getBoundingClientRect().bottom:0;for(const n of e){if(!n.classList.contains("mateu-section--sticky"))continue;const d=n.getBoundingClientRect();d.top<=s+t+2&&(s=Math.max(s,d.bottom))}const i=s+t+4;let r=0;this._tocEntries.forEach((n,d)=>{n.el.getBoundingClientRect().top<=i&&(r=d)}),this._activeToc=r}}connectedCallback(){super.connectedCallback(),document.addEventListener("page-banners-received",this._bannersHandler),window.addEventListener("resize",this._onResize),document.addEventListener("keydown",this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("page-banners-received",this._bannersHandler),window.removeEventListener("resize",this._onResize),document.removeEventListener("keydown",this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy()}updated(e){super.updated(e),e.has("component")&&e.get("component")!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has("component")&&(this._scheduleStaticBannerTimeouts(),this.dispatchEvent(new CustomEvent("compact-changed",{detail:{compact:!!this.component?.style?.includes("--mateu-compact:1")},bubbles:!0,composed:!0})),this._scheduleTocRebuild())}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(a=>clearTimeout(a)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((a,s)=>{a.timeoutSeconds&&a.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,s])},a.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,a)=>a!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){const t=e.theme?.toLowerCase()??"info";return t==="none"?"":t}_evalBannerText(e){return Oe(e,this.state,this.data)}_renderBanner(e,t){const a=this._evalBannerText(e.title),s=this._evalBannerText(e.description);return o`
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
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll(".mateu-section"))}_sectionTitle(e){const t=e.querySelector('[slot="title"]')?.textContent?.trim();return t||e.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()||void 0}_rebuildToc(){const e=this._sectionCards(),t=e.map(r=>({title:this._sectionTitle(r),el:r})).filter(r=>!!r.title),a=this.component?.metadata?.toc,s=t.length>4&&e.every(r=>!r.closest("vaadin-horizontal-layout")),i=(a===!0?!0:a===!1?!1:s)&&t.length>0;this._tocEntries=t,this._tocVisible=i,this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),i?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){const e=this.shadowRoot?.querySelector("mateu-content-header");this._headerH=this._tocVisible&&e?e.offsetHeight:0,this.style.setProperty("--mateu-header-h",this._headerH+"px");const t=12;let a=this._headerH+t;for(const s of this._sectionCards())s.classList.contains("mateu-section--sticky")&&(s.style.top=a+"px",a+=s.offsetHeight+t)}_scrollContainer(){let e=gs(this);for(;e;){const t=getComputedStyle(e).overflowY;if((t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight)return e;e=gs(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener("scroll",this._onScrollSpy,{passive:!0}),window.addEventListener("wheel",this._unlockToc,{passive:!0}),window.addEventListener("touchstart",this._unlockToc,{passive:!0}),window.addEventListener("keydown",this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener("scroll",this._onScrollSpy),window.removeEventListener("wheel",this._unlockToc),window.removeEventListener("touchstart",this._unlockToc),window.removeEventListener("keydown",this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){const t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;const a=12;let s=this._headerH+a;for(const d of this._sectionCards()){if(d===t.el)break;d.classList.contains("mateu-section--sticky")&&(s+=d.offsetHeight+a)}const i=this._scrollContainer(),r=i?i.getBoundingClientRect().top:0,n=t.el.getBoundingClientRect().top-r-s;(i??window).scrollBy({top:n,behavior:"smooth"})}_showHeaderBand(){const e=this.component?.metadata,t=!!(e?.title||e?.subtitle||e?.toolbar?.length),a=!!this.component?.children?.some(s=>s.metadata?.type===m.Crud);return t&&!a&&!this._hasWelcomeBanner()}_hasWelcomeBanner(){const e=t=>t?.metadata?.type===m.HeroSection?!0:(t?.children??[]).some(e);return(this.component?.children??[]).some(e)}render(){const e=this.component?.metadata,s=[...(e?.banners??[]).map((r,n)=>({banner:r,index:n})).filter(({index:r})=>!this.dismissedStaticBannerIndices.has(r)).map(({banner:r,index:n})=>({banner:r,onDismiss:()=>this._dismissStaticBanner(n)})),...this.actionBanners.map((r,n)=>({banner:r,onDismiss:()=>this._dismissActionBanner(n)}))],i=o`
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
                ${e?.footer?.map(r=>C(this,r,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `;return o`<div style="display: flex; flex-direction: column; width: 100%;">${i}</div>`}};K.styles=y`
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
    `;ce([u()],K.prototype,"component",2);ce([u()],K.prototype,"baseUrl",2);ce([u()],K.prototype,"state",2);ce([u()],K.prototype,"data",2);ce([u()],K.prototype,"appState",2);ce([u()],K.prototype,"appData",2);ce([u()],K.prototype,"value",2);ce([u({type:Boolean})],K.prototype,"standalone",2);ce([b()],K.prototype,"actionBanners",2);ce([b()],K.prototype,"dismissedStaticBannerIndices",2);ce([b()],K.prototype,"_tocEntries",2);ce([b()],K.prototype,"_activeToc",2);ce([b()],K.prototype,"_tocVisible",2);K=ce([x("mateu-page")],K);const wi=y`
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
`,ba=e=>B`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,Qi=ba(B`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),Zi=ba(B`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),es=ba(B`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`),Iu=ba(B`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`),Su=ba(B`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`),Eu=ba(B`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`);var Tu=Object.defineProperty,Pu=Object.getOwnPropertyDescriptor,N=(e,t,a,s)=>{for(var i=s>1?void 0:s?Pu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Tu(t,a,i),i};const ys=["#e91e63","#1676f3","#10b981","#8b5cf6","#f59e0b","#ef4444"],Ou=e=>ys[Math.abs(e??0)%ys.length],zu=e=>(e??"?").split(/\s+/).filter(t=>t).map(t=>t[0]).slice(0,2).join("").toUpperCase()||"?";let q=class extends k{constructor(){super(...arguments),this.localAgentUrl="http://127.0.0.1:8776",this.localAgentAlive=!1,this.menu=[],this.chatSessionId=ye(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onSpeechResult=e=>{if(this.recognition){const t=e,a=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=a,this.send(new CustomEvent("submit",{detail:{value:a},bubbles:!0,composed:!0})))}},this.probeLocalAgent=async()=>{if(this.localAgentUrl)try{const e=new AbortController,t=setTimeout(()=>e.abort(),1200),a=await fetch(this.localAgentUrl+"/health",{signal:e.signal});clearTimeout(t),this.localAgentAlive=a.ok}catch{this.localAgentAlive=!1}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{const t=e.target,a=Array.from(t.files??[]);if(t.value="",!(!a.length||!this.uploadUrl)){this.uploading=!0;try{const s=new FormData;s.append("sessionId",this.chatSessionId);for(const h of a)s.append("files",h,h.name);const i={},r=localStorage.getItem("__mateu_auth_token");r&&(i.Authorization="Bearer "+r);const n=sessionStorage.getItem("__mateu_sesion_id");n&&(i["X-Session-Id"]=n);const d=await fetch(this.uploadUrl,{method:"POST",headers:i,body:s});if(!d.ok)throw new Error(`Upload failed: ${d.status}`);const p=((await d.json()).files??[]).filter(h=>h&&h.path);this.attachments=[...this.attachments,...p]}catch(s){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${s instanceof Error?s.message:s}`,"agent")}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async e=>{this.messageInputElement?.setAttribute("disabled","disabled");const t=e.detail.value.trim(),a=this.localAgentAlive?this.localAgentUrl+"/mateu/agent/stream":this.sseUrl,s=this.attachments;if(!t&&s.length===0||!a)return;const i=s.length?`${t}${t?`

`:""}📎 ${s.map(d=>d.name).join(", ")}`:t;this.addMessage(i,"user"),this.attachments=[];const r=this.addMessage("","agent");this.startLoading();let n="";try{const d={Accept:"text/event-stream","Content-Type":"application/json"},c=localStorage.getItem("__mateu_auth_token");c&&(d.Authorization="Bearer "+c);const p=sessionStorage.getItem("__mateu_sesion_id");p&&(d["X-Session-Id"]=p);const h=this.contextProvider?.(),v=JSON.stringify({message:t,sessionId:this.chatSessionId,...s.length&&{attachments:s},...h!=null&&{context:h},...this.mcpUrl&&{mcpUrl:new URL(this.mcpUrl,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;const f=await fetch(a,{method:"POST",headers:d,body:v});if(!f.ok){const S=await f.text();throw new Error(`Servidor respondió ${f.status}: ${S}`)}const w=f.body?.getReader();if(!w)throw new Error("No se pudo obtener el reader del stream.");const $=new TextDecoder;let g="";for(;;){const{done:S,value:V}=await w.read();if(S){if(g.trim().startsWith("data:")){const pe=g.trim().slice(5).trim(),Y=this.tryParseTokenUsage(pe),ee=!Y&&this.tryParseCustomEvent(pe);Y?this.tokenUsage={...this.tokenUsage,...Y}:ee?ee.event==="agent-error"?(n="⚠️ "+(ee.detail?.message??"Error desconocido del agente"),this.updateMessage(r,n)):this.dispatchEvent(new CustomEvent(ee.event,{detail:ee.detail,bubbles:!0,composed:!0})):(n+=pe,this.updateMessage(r,n))}break}const ue=$.decode(V,{stream:!0});g+=ue;const R=g.split(`
`);g=R.pop()||"";let Z=!1;for(const pe of R)if(pe.trim().startsWith("data:")){const Y=pe.trim().slice(5).trim(),ee=this.tryParseTokenUsage(Y),te=!ee&&this.tryParseCustomEvent(Y);ee?this.tokenUsage={...this.tokenUsage,...ee}:te?te.event==="agent-error"?(n="⚠️ "+(te.detail?.message??"Error desconocido del agente"),this.updateMessage(r,n)):this.dispatchEvent(new CustomEvent(te.event,{detail:te.detail,bubbles:!0,composed:!0})):(n+=Y+`
`,Z=!0)}Z&&this.updateMessage(r,n)}n||this.updateMessage(r,"⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).")}catch(d){console.error("Error en el flujo SSE:",d);const c=d?.message??String(d);(c==="Failed to fetch"||c==="network error"||c==="Load failed")&&!n?this.updateMessage(r,"⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible."):this.updateMessage(r,"⚠️ Error: "+c)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value="")},250),this.messageInputElement?.removeAttribute("disabled"),this.messageInputElement?.focus()}},this.closeChat=()=>{this.dispatchEvent(new CustomEvent("close-requested",{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{const e=this.messageInputElement?.value?.trim()??"";e&&this.send(new CustomEvent("submit",{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key==="Enter"&&(e.preventDefault(),this.submitFromInput())}}connectedCallback(){super.connectedCallback(),this.probeLocalAgent();const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){const t=new e;this.recognition=t,t.lang="es-ES",t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=a=>{console.error("Error de reconocimiento: "+a.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:"smooth"})},0)}addMessage(e,t){const a={text:e,time:new Date().toLocaleTimeString(),userName:t.includes("agent")?"Asistente":"Tú",userColorIndex:t.includes("agent")?2:1};return this.items=[...this.items,a],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((a,s)=>s===e?{...a,text:t}:a),this.scrollBottom()}tryParseCustomEvent(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const a=JSON.parse(t);if(typeof a.event=="string")return{event:a.event,detail:a.detail??{}}}catch{}return null}tryParseTokenUsage(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const a=JSON.parse(t);if("inputTokens"in a||"outputTokens"in a||"totalTokens"in a)return a}catch{}return null}buildMenuContext(e,t=[]){const a=[];for(const s of e){if(s.separator||s.remote)continue;const i=[...t,s.label];if(s.submenus&&s.submenus.length>0)a.push(...this.buildMenuContext(s.submenus,i));else{const r={path:i,navigation:{route:s.route,consumedRoute:s.consumedRoute,actionId:s.actionId??"",baseUrl:s.baseUrl,serverSideType:s.serverSideType,uriPrefix:s.uriPrefix}};s.description&&(r.description=s.description),a.push(r)}}return a}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}render(){return o`
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
                        ${Eu}
                    </button>
                </div>
                <div class="scroll-container">
                    <div class="message-list" role="list">
                        ${this.items.map(e=>o`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${Ou(e.userColorIndex)};">${zu(e.userName)}</div>
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
                    >${Su}</button>
                    <input class="msg-input"
                           placeholder="Message"
                           aria-label="Message"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">Send</button>
                </div>
            </div>
        `}};q.styles=[wi,y`
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
    `];N([u({attribute:!1})],q.prototype,"contextProvider",2);N([u()],q.prototype,"localAgentUrl",2);N([u({attribute:!1})],q.prototype,"mcpUrl",2);N([b()],q.prototype,"localAgentAlive",2);N([u()],q.prototype,"sseUrl",2);N([u()],q.prototype,"uploadUrl",2);N([u({attribute:!1})],q.prototype,"menu",2);N([b()],q.prototype,"attachments",2);N([b()],q.prototype,"uploading",2);N([Ce(".file-input")],q.prototype,"fileInputElement",2);N([u({type:Boolean,reflect:!0})],q.prototype,"expanded",2);N([u()],q.prototype,"items",2);N([Ce(".scroll-container")],q.prototype,"scrollContainer",2);N([Ce(".msg-input")],q.prototype,"messageInputElement",2);N([b()],q.prototype,"recognition",2);N([b()],q.prototype,"listening",2);N([b()],q.prototype,"recognitionAvailable",2);N([b()],q.prototype,"loading",2);N([b()],q.prototype,"elapsedSeconds",2);N([b()],q.prototype,"tokenUsage",2);q=N([x("mateu-chat")],q);var Ru=Object.defineProperty,Du=Object.getOwnPropertyDescriptor,ja=(e,t,a,s)=>{for(var i=s>1?void 0:s?Du(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Ru(t,a,i),i};let Gt=class extends k{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.data&&this.createChart(this.data)}async createChart(e){const[{default:t}]=await Promise.all([J(()=>import("./vendor-chartjs.js").then(s=>s.a),[]),J(()=>import("./vendor-chartjs.js").then(s=>s.c),[])]);if(e!==this.data)return;this.chart&&this.chart.destroy();const a={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,a)}handleSlotChange(){}render(){return o`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};Gt.styles=y`
  `;ja([u()],Gt.prototype,"type",2);ja([u()],Gt.prototype,"data",2);ja([u()],Gt.prototype,"options",2);ja([Ce("#chart")],Gt.prototype,"chartElement",2);Gt=ja([x("mateu-chart")],Gt);var Au=Object.defineProperty,Lu=Object.getOwnPropertyDescriptor,ts=(e,t,a,s)=>{for(var i=s>1?void 0:s?Lu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Au(t,a,i),i};let za=class extends k{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){const{default:t}=await J(async()=>{const{default:s}=await import("./vendor-diagrams.js").then(i=>i.i);return{default:s}},__vite__mapDeps([5,3,1,2]));if(e!==this.xml)return;this.chart&&this.chart.destroy();const a={container:this.divElement};this.chart=new t(a),this.chart.importXML(e)}handleSlotChange(){}render(){return o`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};za.styles=y`
  `;ts([u()],za.prototype,"xml",2);ts([Ce("#canvas")],za.prototype,"divElement",2);za=ts([x("mateu-bpmn")],za);var Mu=Object.defineProperty,qu=Object.getOwnPropertyDescriptor,ga=(e,t,a,s)=>{for(var i=s>1?void 0:s?qu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Mu(t,a,i),i};const Oi=160,je=56,Fu=220,$s=110,mt=60,Nu={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},Uu={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},ju=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];function Bu(){return"step-"+Math.random().toString(36).slice(2,8)}let Ct=class extends k{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.wf={name:"New Workflow",steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value")){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){const e=this.wf.steps??[],t={};e.forEach(n=>{t[n.id]=0});let a=!0;for(;a;)a=!1,e.forEach(n=>{if(n.preconditionStepId!=null&&t[n.preconditionStepId]!==void 0){const d=t[n.preconditionStepId]+1;d>t[n.id]&&(t[n.id]=d,a=!0)}});const s={};e.forEach(n=>{const d=t[n.id]??0;(s[d]??=[]).push(n.id)});const i={...this.positions};let r=!1;Object.entries(s).forEach(([n,d])=>{const c=Number(n);d.forEach((p,h)=>{i[p]||(i[p]={x:mt+c*Fu,y:mt+h*$s},r=!0)})}),r&&(this.positions=i)}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addStep(){const e=Bu(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(i=>i.y),s=a.length?Math.max(...a)+$s:mt;this.positions={...this.positions,[e]:{x:mt,y:s}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(s=>s.id!==e).map(s=>s.preconditionStepId===e?{...s,preconditionStepId:void 0}:s)};const{[e]:t,...a}=this.positions;this.positions=a,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},s=this.toSvgPoint(e);this.dragOffset={x:s.x-a.x,y:s.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(s=>s.x))+Oi+mt:600,a=e.length?Math.max(...e.map(s=>s.y))+je+mt:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return o`
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
                    ${Qi}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${Zi}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${es}
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
        `}renderArrow(e){if(!e.preconditionStepId)return B``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return B``;const s=t.x+Oi,i=t.y+je/2,r=a.x,n=a.y+je/2,d=(s+r)/2;return B`
            <path d="M${s},${i} C${d},${i} ${d},${n} ${r},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:mt,y:mt},a=Nu[e.type]??"#64748b",s=Uu[e.type]??"•",i=this.selectedId===e.id;return B`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${r=>this.onNodeMouseDown(r,e.id)}"
               @click="${r=>{r.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${Oi}" height="${je}" rx="8"
                      fill="white"
                      stroke="${i?a:"#e2e8f0"}"
                      stroke-width="${i?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${je}" rx="8" fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${je}" fill="${a}"/>
                <text x="16" y="${je/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${s}</text>
                <!-- name -->
                <text x="44" y="${je/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+"…":e.name}
                </text>
                <text x="44" y="${je/2+8}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${je/2+20}" font-size="9" fill="${a}">${e.type}</text>
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
                            ${ju.map(s=>o`<option value="${s}" ?selected="${e.type===s}">${s}</option>`)}
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
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),s=document.createElement("a");s.href=a,s.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(a)}};Ct.styles=[wi,y`
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
    `];ga([u()],Ct.prototype,"value",2);ga([b()],Ct.prototype,"wf",2);ga([b()],Ct.prototype,"positions",2);ga([b()],Ct.prototype,"selectedId",2);ga([b()],Ct.prototype,"showMeta",2);Ct=ga([x("mateu-workflow")],Ct);var Vu=Object.defineProperty,Hu=Object.getOwnPropertyDescriptor,dt=(e,t,a,s)=>{for(var i=s>1?void 0:s?Hu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Vu(t,a,i),i};const $a=160,Te=56,vt=60,Wu={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},Gu={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},Ku=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];let zi;const Yu=()=>(zi||(zi=J(()=>import("./vendor-diagrams.js").then(e=>e.e),__vite__mapDeps([5,3,1,2])).then(e=>new e.default)),zi);function Ju(){return"step-"+Math.random().toString(36).slice(2,8)}let Ae=class extends k{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.readOnly=!1,this.wf={name:"New Workflow",steps:[]},this.positions={},this.layoutReady=!1,this.selectedId=null,this.showMeta=!1,this.layoutError=null,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.elkPositioned=new Set,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.elkPositioned.add(this.draggingId),this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value"))try{const t=JSON.parse(this.value),a=new Set((this.wf.steps??[]).map(r=>r.id)),s=new Set((t.steps??[]).map(r=>r.id)),i=a.size!==s.size||[...s].some(r=>!a.has(r))||[...s].some(r=>{const n=(this.wf.steps??[]).find(c=>c.id===r),d=(t.steps??[]).find(c=>c.id===r);return n?.preconditionStepId!==d?.preconditionStepId});this.wf=t,(i||!this.layoutReady)&&this.runElkLayout()}catch{}}async runElkLayout(){const e=this.wf.steps??[];if(e.length===0){this.positions={},this.layoutReady=!0;return}const t={id:"root",layoutOptions:{"elk.algorithm":"layered","elk.direction":"RIGHT","elk.spacing.nodeNode":"40","elk.layered.spacing.nodeNodeBetweenLayers":"80","elk.edgeRouting":"ORTHOGONAL","elk.layered.nodePlacement.strategy":"BRANDES_KOEPF"},children:e.map(a=>({id:a.id,width:$a,height:Te})),edges:e.filter(a=>a.preconditionStepId).map(a=>({id:`${a.preconditionStepId}->${a.id}`,sources:[a.preconditionStepId],targets:[a.id]}))};try{const s=await(await Yu()).layout(t),i={...this.positions};for(const r of s.children??[])(!this.elkPositioned.has(r.id)||!i[r.id])&&(i[r.id]={x:(r.x??0)+vt,y:(r.y??0)+vt},this.elkPositioned.add(r.id));this.positions=i,this.layoutReady=!0,this.layoutError=null}catch(a){this.layoutError=a?.message??"ELK layout failed",this.layoutReady=!0}}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){const a=this.wf.steps.map(r=>r.id===e?{...r,...t}:r),s=this.wf.steps.find(r=>r.id===e),i=t.preconditionStepId!==void 0&&t.preconditionStepId!==s?.preconditionStepId;this.wf={...this.wf,steps:a},i&&(this.elkPositioned.clear(),this.runElkLayout()),this.emit()}addStep(){const e=Ju(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(s=>s.x);this.positions={...this.positions,[e]:{x:a.length?Math.max(...a)+$a+80:vt,y:vt}},this.selectedId=e,this.elkPositioned.clear(),this.runElkLayout(),this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(s=>s.id!==e).map(s=>s.preconditionStepId===e?{...s,preconditionStepId:void 0}:s)};const{[e]:t,...a}=this.positions;this.positions=a,this.elkPositioned.delete(e),this.selectedId===e&&(this.selectedId=null),this.runElkLayout(),this.emit()}onNodeMouseDown(e,t){if(this.readOnly)return;e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},s=this.toSvgPoint(e);this.dragOffset={x:s.x-a.x,y:s.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}relayout(){this.elkPositioned.clear(),this.runElkLayout()}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(s=>s.x))+$a+vt:600,a=e.length?Math.max(...e.map(s=>s.y))+Te+vt:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){if(!this.layoutReady)return o`<div class="loading">Computing layout…</div>`;const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return o`
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
                    ${Iu}
                    Re-layout
                </button>
                ${this.readOnly?l:o`
                    <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                        ${Qi}
                        Settings
                    </button>
                    <button class="nbtn primary" @click="${()=>this.addStep()}">
                        ${Zi}
                        Add Step
                    </button>
                `}
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${es}
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
        `}renderArrow(e){if(!e.preconditionStepId)return B``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return B``;const s=t.x+$a,i=t.y+Te/2,r=a.x,n=a.y+Te/2,d=(s+r)/2;return B`
            <path d="M${s},${i} C${d},${i} ${d},${n} ${r},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:vt,y:vt},a=Wu[e.type]??"#64748b",s=Gu[e.type]??"•",i=this.selectedId===e.id,r=e.name.length>16?e.name.slice(0,15)+"…":e.name;return B`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${n=>this.onNodeMouseDown(n,e.id)}"
               @click="${n=>{n.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${$a}" height="${Te}" rx="8"
                      fill="white"
                      stroke="${i?a:"#e2e8f0"}"
                      stroke-width="${i?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge strip -->
                <rect x="0" y="0" width="32" height="${Te}" rx="8"
                      fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${Te}" fill="${a}"/>
                <text x="16" y="${Te/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${s}</text>
                <!-- labels -->
                <text x="44" y="${Te/2-6}" font-size="11"
                      fill="#1e293b" font-weight="600">${r}</text>
                <text x="44" y="${Te/2+8}" font-size="9"
                      fill="#94a3b8">${e.id}</text>
                <text x="44" y="${Te/2+20}" font-size="9"
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
                            ${Ku.map(i=>o`
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
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),s=document.createElement("a");s.href=a,s.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(a)}};Ae.styles=[wi,y`
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
    `];dt([u()],Ae.prototype,"value",2);dt([u({type:Boolean})],Ae.prototype,"readOnly",2);dt([b()],Ae.prototype,"wf",2);dt([b()],Ae.prototype,"positions",2);dt([b()],Ae.prototype,"layoutReady",2);dt([b()],Ae.prototype,"selectedId",2);dt([b()],Ae.prototype,"showMeta",2);dt([b()],Ae.prototype,"layoutError",2);Ae=dt([x("mateu-workflow-elk")],Ae);var Xu=Object.defineProperty,Qu=Object.getOwnPropertyDescriptor,Ba=(e,t,a,s)=>{for(var i=s>1?void 0:s?Qu(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&Xu(t,a,i),i};const Zu=["string","integer","number","bool","date","time","dateTime","dateRange","money","file","array","status","component","menu","range","action","actionGroup"],ep=["regular","radio","checkbox","textarea","toggle","combobox","select","email","password","richText","listBox","html","markdown","image","icon","link","money","grid","color","choice","popover","slider","button","stars"],tp={string:"#3B82F6",integer:"#8B5CF6",number:"#6366F1",bool:"#10B981",date:"#F59E0B",time:"#F59E0B",dateTime:"#F59E0B",dateRange:"#F59E0B",money:"#EF4444",file:"#64748B",array:"#0EA5E9",status:"#EC4899",component:"#14B8A6",menu:"#94A3B8",range:"#A855F7",action:"#F97316",actionGroup:"#FB923C"};function xs(){return"field-"+Math.random().toString(36).slice(2,8)}let Kt=class extends k{constructor(){super(...arguments),this.value='{"name":"New Form","fields":[]}',this.form={name:"New Form",fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has("value"))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){const e=this.shadowRoot?.querySelector(".field-list");!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=Ir.create(e,{animation:150,handle:".drag-handle",ghostClass:"sortable-ghost",onEnd:t=>{const{oldIndex:a,newIndex:s}=t;if(a===void 0||s===void 0||a===s)return;const i=[...this.form.fields],[r]=i.splice(a,1);i.splice(s,0,r),this.form={...this.form,fields:i},this.emit()}}))}emit(){const e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addField(){const e=xs(),t={id:e,label:"New Field",dataType:"string"};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){const t=this.form.fields.find(r=>r.id===e);if(!t)return;const a={...t,id:xs(),label:t.label+" (copy)"},s=this.form.fields.findIndex(r=>r.id===e),i=[...this.form.fields];i.splice(s+1,0,a),this.form={...this.form,fields:i},this.selectedId=a.id,this.emit()}render(){return o`
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
                    ${Qi}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${Zi}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${es}
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
        `}renderRow(e){const t=tp[e.dataType]??"#64748b",a=this.selectedId===e.id;return o`
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
                            ${Zu.map(a=>o`
                                <option value="${a}" ?selected="${e.dataType===a}">${a}</option>`)}
                        </select>`)}
                    ${t("Stereotype",o`
                        <select class="inp"
                                @change="${a=>this.updateField(e.id,{stereotype:a.target.value||void 0})}">
                            ${ep.map(a=>o`
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
        `}exportJson(){const e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),s=document.createElement("a");s.href=a,s.download=(this.form.name??"form").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(a)}};Kt.styles=[wi,y`
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
    `];Ba([u()],Kt.prototype,"value",2);Ba([b()],Kt.prototype,"form",2);Ba([b()],Kt.prototype,"selectedId",2);Ba([b()],Kt.prototype,"showMeta",2);Kt=Ba([x("mateu-form-editor")],Kt);var ap=Object.defineProperty,ip=Object.getOwnPropertyDescriptor,Ze=(e,t,a,s)=>{for(var i=s>1?void 0:s?ip(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&ap(t,a,i),i};let ke=class extends k{constructor(){super(...arguments),this.appState={},this.appData={},this.open=!1,this.activeTab="appstate",this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith("mateu-")&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset="",this._prevTarget=null,this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset=""),this._prevTarget=t,t.style.outline="2px solid #0070f3",t.style.outlineOffset="-2px",this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||"",this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener("mouseover",this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mouseover",this._onMouseover,!0),this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget=null)}_fmt(e){try{return JSON.stringify(e,null,2)??"null"}catch{return String(e)}}_renderTab(e,t){return o`
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
        `}};ke.styles=y`
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
    `;Ze([u()],ke.prototype,"appState",2);Ze([u()],ke.prototype,"appData",2);Ze([b()],ke.prototype,"open",2);Ze([b()],ke.prototype,"activeTab",2);Ze([b()],ke.prototype,"hoveredTag",2);Ze([b()],ke.prototype,"hoveredId",2);Ze([b()],ke.prototype,"hoveredState",2);Ze([b()],ke.prototype,"hoveredData",2);Ze([b()],ke.prototype,"hoveredMeta",2);ke=Ze([x("mateu-debug-overlay")],ke);var Pe=(e=>(e.SetAppDataValue="SetAppDataValue",e.SetAppStateValue="SetAppStateValue",e.SetDataValue="SetDataValue",e.RunAction="RunAction",e.RunJS="RunJS",e.SetAttributeValue="SetAttributeValue",e.SetStateValue="SetStateValue",e.SetCssClass="SetCssClass",e.SetStyle="SetStyle",e))(Pe||{}),pr=(e=>(e.required="required",e.disabled="disabled",e.hidden="hidden",e.pattern="pattern",e.minValue="minValue",e.maxValue="maxValue",e.minLength="minLength",e.maxLength="maxLength",e.css="css",e.style="style",e.theme="theme",e.errorMessage="errorMessage",e.description="description",e.none="none",e))(pr||{}),hr=(e=>(e.Continue="Continue",e.Stop="Stop",e))(hr||{}),sp=Object.defineProperty,rp=Object.getOwnPropertyDescriptor,ki=(e,t,a,s)=>{for(var i=s>1?void 0:s?rp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&sp(t,a,i),i};let xa=null,ca=class extends zt{constructor(){super(...arguments),this.baseUrl="",this.route="",this.consumedRoute="",this.formerState={},this.applyRules=()=>{const e=this.component.rules;if(e&&e.length>0){const t=this.state,a=this.data,s=this.appState,i=this.appData,r=this.component,n=$=>Ts($,t,a,{appState:s,appData:i,component:r}),d=$=>Es($,t,a,s,i,{component:r}),c=["state","data","appState","appData","component"],p=[t,a,s,i,r],h={...this.state},v={...this.data};let f=!1,w=!1;for(let $=0;$<e.length;$++){const g=e[$];try{if(n(g.filter)){if(Pe.SetStateValue==g.action||Pe.SetDataValue==g.action){const S=Pe.SetStateValue==g.action?h:v,V=g.fieldName.split(",");for(let ue=0;ue<V.length;ue++){const R=V[ue];if(!S[R]||S[R]!=g.value){const Z=g.expression?d(g.expression):g.value,pe=pr.none==g.fieldAttribute?R:R+"."+g.fieldAttribute;Z!=S[pe]&&(S[pe]=Z,Pe.SetStateValue==g.action&&(f=!0),Pe.SetDataValue==g.action&&(w=!0))}}}if(Pe.RunAction==g.action&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:g.actionId},bubbles:!0,composed:!0})),Pe.RunJS==g.action&&new Function(...c,g.value)(...p),Pe.SetAttributeValue==g.action){const S=g.expression?n(g.expression):g.value;if(g.fieldAttribute=="disabled"){S?this.shadowRoot?.getElementById(g.fieldName)?.setAttribute(g.fieldAttribute,"disabled"):this.shadowRoot?.getElementById(g.fieldName)?.removeAttribute(g.fieldAttribute);continue}this.shadowRoot?.getElementById(g.fieldName)?.setAttribute(g.fieldAttribute,S)}if(Pe.SetCssClass==g.action&&this.shadowRoot?.getElementById(g.fieldName)?.setAttribute("class",g.value),Pe.SetStyle==g.action&&this.shadowRoot?.getElementById(g.fieldName)?.style.setProperty(g.expression,g.value),hr.Stop==g.result)break}}catch(S){console.error("rule failed",g,S)}}f&&(this.state=h),w&&(this.data=v),f&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes("-"),this.checkValidations=e=>{const t=e?e.split(","):void 0,a=this.component.validations;let s=!0,i=!1;const r=this.data??{},n={...this.data??{},errors:{}};if(a){for(let d=0;d<a.length;d++){const c=a[d];if(this.skipValidation(t,c))continue;const p=(c.fieldId??"_component").split(",");for(let h=0;h<p.length;h++){const v=p[h];n.errors[v]=[]}}for(let d=0;d<a.length;d++){const c=a[d];if(!this.skipValidation(t,c))try{const p=c.condition&&c.condition.includes("${")?this._evalTemplate(c.condition):this._evalExpr(c.condition);if(c.condition&&!p){s=!1;const v=(c.fieldId??"_component").split(",");for(let f=0;f<v.length;f++){const w=v[f];let $=n.errors[w];if($||(n.errors[w]=[]),$=n.errors[w],!r[w]){let g=c.message;try{g=this._evalTemplate(c.message)}catch{}$.push(g)}}}}catch(p){console.error("validation failed",c,p)}}for(let d=0;d<a.length;d++){const c=a[d];if(this.skipValidation(t,c))continue;const p=(c.fieldId??"_component").split(",");for(let h=0;h<p.length;h++){const v=p[h];if(r.errors?[v].join(","):n.errors==""&&[v].join(",")){i=!0;break}}}(r.errors?["_component"].join(","):n.errors==""&&["_component"].join(","))&&(i=!0)}n._valid=s,n._valid!=r._valid&&(i=!0),i&&(this.data=n)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};t.fieldIds.forEach(s=>{a[s]=void 0}),a.searchText=void 0,this.state={...this.state,...a}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};a[t.key]=t.value,e.type=="data-changed"&&(this.data={...this.data,...a})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail;if(e.type=="value-changed"){const a={...this.state};a[t.fieldId]=t.value,this.state=a,(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("dirty",{detail:e.detail,bubbles:!0,composed:!0}));const s=this.component;s.triggers?.filter(i=>i.type==ft.OnValueChange).filter(i=>!i.propertyName||t.fieldId==i.propertyName).forEach(i=>{(!i.condition||this._evalExpr(i.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))}),s.triggers?.filter(i=>i.type==ft.AutoSave).forEach(i=>{const r=i.actionId,n=this._autoSaveTimers.get(r);n!==void 0&&clearTimeout(n),this._autoSaveTimers.set(r,setTimeout(()=>{this._autoSaveTimers.delete(r),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))},i.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{const t=e.detail;if(e.type=="action-requested"){e.preventDefault(),e.stopPropagation();const a=this.component,s=a.actions?.find(i=>i.id==t.actionId||i.id.endsWith("*")&&t.actionId.startsWith(i.id.replace("*","")));if(s){if(s&&s.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify("You first need to select some rows");return}if(s&&s.validationRequired){const r=xa??this;if(xa=null,r.checkValidations(s.fieldsToValidate),!r.data._valid){r.notifyValidationErrors();return}}xa=null;const i={...t,initiatorComponentId:this.id};s&&s.confirmationRequired?this.callAfterConfirmation(s,()=>this.requestActionCallToServerOrBubble(i,a,s)):this.requestActionCallToServerOrBubble(i,a,s)}else{const i={...t.parameters};i.initiatorState||(i.initiatorState=this.state),xa||(xa=this),this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,parameters:i},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{const e={},t=a=>{if(a)for(const s of a){const i=s.metadata;if(i?.type===m.FormField){const r=i;r.fieldId&&r.label&&(e[r.fieldId]=r.label)}t(s.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{const e=this.data?.errors??{},t=this.buildFieldLabelMap(),a=[];if(Object.entries(e).forEach(([i,r])=>{if(!Array.isArray(r))return;const n=i==="_component"?void 0:t[i]??i;r.forEach(d=>{d&&!a.some(c=>c.label===n&&c.msg===d)&&a.push({label:n,msg:d})})}),a.length===0){this.notify("There are validation errors");return}const s=document.createElement("vaadin-notification");s.position="bottom-end",s.setAttribute("theme","error"),s.duration=Math.max(3e3,1500+a.length*1e3),s.renderer=i=>{ks(o`
                <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs, .25rem);">
                    <strong>There are validation errors</strong>
                    ${a.map(({label:r,msg:n})=>r?o`<span>• <b>${r}:</b> ${n}</span>`:o`<span>• ${n}</span>`)}
                </div>
            `,i)},document.body.appendChild(s),s.opened=!0,s.addEventListener("opened-changed",i=>{i.detail.value||document.body.removeChild(s)})},this.notify=e=>{qt.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.callAfterConfirmation=(e,t)=>{let a="One moment, please",s="Are you sure?",i="Yes",r="No";e.confirmationTexts&&(a=e.confirmationTexts.title,s=e.confirmationTexts.message,i=e.confirmationTexts.confirmationText,r=e.confirmationTexts.denialText);const n=document.createElement("vaadin-confirm-dialog");n.setAttribute("header",a),n.setAttribute("cancel-button-visible","cancel-button-visible"),n.setAttribute("confirm-text",i),n.setAttribute("cancel-text",r),n.append(s),n.opened=!0,n.addEventListener("confirm",()=>t()),n.addEventListener("close",()=>document.body.removeChild(n)),n.addEventListener("confirm",()=>document.body.removeChild(n)),n.addEventListener("cancel",()=>document.body.removeChild(n)),n.addEventListener("reject",()=>document.body.removeChild(n)),document.body.append(n)},this.requestActionCallToServerOrBubble=(e,t,a)=>{if(a&&a.bubble){const s={...e.parameters};s.initiatorState||(s.initiatorState=this.state),this.dispatchEvent(new CustomEvent("action-requested",{detail:{...e,parameters:s},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,a)},this.requestActionCallToServer=(e,t,a)=>{if(a&&a.href){window.location.href=a.href;return}if(a&&a.js)try{new Function("state","data","appState","appData","component",a.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(s){console.error("when evaluating "+a.js,s,this.component,this.state,this.data)}if(a&&a.customEvent&&this.dispatchEvent(new CustomEvent(a.customEvent.name,{detail:a.customEvent.detail,bubbles:!0,composed:!0})),!(a&&(a.js||a.customEvent))){if(e.actionId=="search"){const s=e.parameters?._searchState;s?this.state={...this.state,...s}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}this.dispatchEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:{...this.state},parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:a?.background,sse:a?.sse,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))}},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(s=>s.type==ft.OnSuccess).filter(s=>e.detail.actionId==s.calledActionId).forEach(s=>{if(!s.condition||this._evalExpr(s.condition))if(e.preventDefault(),e.stopPropagation(),s.timeoutMillis>0){const i=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId,callbackToken:i},bubbles:!0,composed:!0}))},s.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(s=>s.type==ft.OnError).filter(s=>e.detail.actionId==s.calledActionId).forEach(s=>{(!s.condition||this._evalExpr(s.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0})))})},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;const t=this.component;if(t)for(const a of t.actions??[]){const s=a.shortcut||(a.runOnEnter?"enter":null);if(s&&this._shortcutMatchesEvent(s,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return j.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has("state")&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has("component")&&(this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}_shortcutMatchesEvent(e,t){return Uo(e,t)}_collectShortcutTabs(){const e=this.renderRoot;if(!e)return[];const t=Array.from(e.querySelectorAll("vaadin-tab[data-shortcut]"));return e.querySelectorAll("mateu-drawer, mateu-dialog").forEach(a=>{const s=a.shadowRoot;s&&t.push(...Array.from(s.querySelectorAll("vaadin-tab[data-shortcut]")))}),t}_handleTabShortcut(e){const t=this._collectShortcutTabs();if(t.length===0)return!1;for(const a of Array.from(t)){const s=a.dataset.shortcut;if(!s||!this._shortcutMatchesEvent(s,e))continue;const i=a.closest("vaadin-tabs");if(!i)continue;const r=Array.from(i.querySelectorAll("vaadin-tab")).indexOf(a);if(!(r<0))return e.preventDefault(),i.selected=r,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.addEventListener("backend-call-failed",this.handleBackendFailed),document.addEventListener("keydown",this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.removeEventListener("backend-call-failed",this.handleBackendFailed),document.removeEventListener("keydown",this._keydownListener)}render(){return o`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?o`
                <div><ul>${this.data.errors._component.map(e=>o`<li>${e}</li>`)}</ul></div>
            `:l}</div>`}_render(){if(this.component?.type==se.ClientSide){const e=this.component;return e.metadata?.type==m.Page?Di(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==m.Crud?Ai(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):j.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return o`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==se.ClientSide){const t=e;if(t.metadata?.type==m.Page)return Di(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==m.Crud)return Ai(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return C(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}};ca.styles=y`
        :host {
        }

        ${gr(_t.cssText)}
        
        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }
        
  `;ki([u()],ca.prototype,"baseUrl",2);ki([u()],ca.prototype,"route",2);ki([u()],ca.prototype,"consumedRoute",2);ca=ki([x("mateu-component")],ca);const ws=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}},op=Hd,np={fixed:"fixed",fullWidth:"full",edgeToEdge:"edge"},lp=new Set([m.Gantt,m.PlanningBoard,m.Kanban,m.Bpmn,m.Workflow,m.WorkflowElk,m.Map]),dp={landing:"fixed",form:"fixed",process:"fixed"},mr=e=>e?np[e]:void 0,Yt=e=>e.type==se.ClientSide?e.metadata:void 0,vr=e=>{const t=Yt(e);if(t?.type==m.Page){const a=mr(t.pageWidth);if(a)return a}for(const a of e.children??[]){const s=vr(a);if(s)return s}},fr=e=>{const t=e.pageType;if(t)return t;const a=s=>{const i=Yt(s);if(i?.type==m.Page&&i.pageType)return i.pageType;for(const r of s.children??[]){const n=a(r);if(n)return n}};return a(e)},cp=e=>{const t=Yt(e);if(t?.type!=m.Crud)return!1;const a=t;return a.compact?!0:(a.columns??[]).some(s=>s.metadata?.editable)},ni=(e,t)=>t(e)||(e.children??[]).some(a=>ni(a,t)),up=e=>!!e&&ni(e,t=>Yt(t)?.type==m.HeroSection),pp=e=>Yt(e)?.type==m.App?!0:(e.children??[]).some(t=>Yt(t)?.type==m.App),hp=(e,t)=>{if(!e)return"fixed";const a=mr(e.pageWidth)??vr(e);if(a)return a;if(t?.top&&pp(e))return"edge";const s=dp[fr(e)??""];return s||(ni(e,i=>{const r=Yt(i)?.type;return r!=null&&lp.has(r)})?"edge":ni(e,cp)?"full":"fixed")};var mp=Object.defineProperty,vp=Object.getOwnPropertyDescriptor,ve=(e,t,a,s)=>{for(var i=s>1?void 0:s?vp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&mp(t,a,i),i};let Q=class extends fi{constructor(){super(...arguments),this.consumedRoute="",this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t=="string"&&(t===""||t.startsWith("/"))&&this.consumedRoute&&this.consumedRoute!=="_empty"&&this.consumedRoute.startsWith("/")&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t.startsWith("/")&&this.uriPrefix.endsWith("/")?t=this.uriPrefix+t.substring(1):!t.startsWith("/")&&!this.uriPrefix.endsWith("/")?t=this.uriPrefix+"/"+t:t=this.uriPrefix+t),this.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==""&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:se.ClientSide,metadata:{type:m.Element,name:"div",content:"Not found"},id:"fieldId"},action:Oa.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;const t=this.detail1;if(e.type=="server-side-action-requested"){let a=op;t.sse&&(a=Ys),a.runAction(Xt,this.baseUrl,t.route??"",t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken)}},this.getCustomisedAppState=()=>{let e={...W.value};if(this.overrides){const t=ws(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw new Error("Method not implemented.")}createRenderRoot(){return j.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.overridesParsed=ws(this.overrides),this.addEventListener("server-side-action-requested",this.actionRequestedListener),this.addEventListener("backend-call-failed",this.backendFailedListener),this.addEventListener("history-pushed",this.historyPushed),this.addEventListener("route-changed",this.routeChangedListener),window.Vaadin.featureFlags.masterDetailLayoutComponent=!0}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.actionRequestedListener),this.removeEventListener("backend-call-failed",this.backendFailedListener),this.removeEventListener("history-pushed",this.historyPushed),this.removeEventListener("route-changed",this.routeChangedListener)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(a=>a==="appState"||a==="appData")){const a=this.renderRoot.querySelector("mateu-component");if(a)return e.has("appState")&&(a.appState=this.appState),e.has("appData")&&(a.appData=this.appData),!1}return!0}updated(e){(e.has("id")||e.has("baseurl")||e.has("route")||e.has("consumedRoute")||e.has("instant"))&&(this.preventNavigation||(this.callbackToken=this.instant||ye(),this.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:"",serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,componentState:this.initialState,callbackToken:this.callbackToken},bubbles:!0,composed:!0})))),e.has("route")&&this.top&&(this.preventNavigation||this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&(this.preventNavigation=!1)}applyFragment(e){if(!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}};return}this.fragment=e,e.component&&(this.dataset.pageWidth=hp(e.component,{top:this.top}),this.dataset.pageType=fr(e.component)??"",this.dataset.hasWelcomeBanner=String(up(e.component)))}render(){return o`
           ${this.fragment?.component?C(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):l}
       `}};Q.styles=y`
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
  `;ve([u()],Q.prototype,"consumedRoute",2);ve([u()],Q.prototype,"serverSideType",2);ve([u()],Q.prototype,"uriPrefix",2);ve([u()],Q.prototype,"overrides",2);ve([u()],Q.prototype,"homeRoute",2);ve([u()],Q.prototype,"route",2);ve([u()],Q.prototype,"top",2);ve([u()],Q.prototype,"instant",2);ve([u()],Q.prototype,"initialState",2);ve([u()],Q.prototype,"appState",2);ve([u()],Q.prototype,"appData",2);ve([b()],Q.prototype,"fragment",2);Q=ve([x("mateu-ux")],Q);var fp=Object.defineProperty,bp=Object.getOwnPropertyDescriptor,ct=(e,t,a,s)=>{for(var i=s>1?void 0:s?bp(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(i=(s?n(t,a,i):n(i))||i);return s&&i&&fp(t,a,i),i};let Le=class extends k{constructor(){super(...arguments),this.baseUrl="",this.route=void 0,this.consumedRoute="_empty",this.config=void 0,this.top="true",this.pathPrefix=void 0,this.debug=!1,this._lastUrl="",this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top=="true"){let t=e.detail.route,a=this.baseUrl??"";!t||t.startsWith("/")?a=window.location.origin+(this.pathPrefix??""):(t=(this.pathPrefix??"")+t,a.indexOf("://")<0&&(a.startsWith("/")||(a="/"+a),a=window.location.origin+a)),t.startsWith(this.pathPrefix+"/")&&(t=t.substring(this.pathPrefix?.length)),a.endsWith("/")&&t.startsWith("/")&&(t=t.substring(1));let s=new URL(a+t);if((window.location.pathname||s.pathname)&&window.location.pathname!=s.pathname){let i=s.pathname;s.search&&(i+=s.search),i&&!i.startsWith("/")&&(i="/"+i),window.history.pushState({},"",i),this._lastUrl=window.location.href}}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),Mt.markClean(),e instanceof CustomEvent){let t=e.detail.route;const a=this.renderRoot.querySelector("mateu-ux");a&&(a.setAttribute("route",t),a.setAttribute("instant",ye()))}}}createRenderRoot(){return j.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),Mt.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!Mt.confirmLeave()){window.history.pushState({},"",this._lastUrl);return}const t=e.target;this.loadUrl(t)},this.top=="true"?this.loadUrl(window):this.route&&(this.consumedRoute=""),this.config)try{const e=JSON.parse(this.config);W.value={...W.value,...e}}catch{W.value={...W.value,config:this.config}}this.addEventListener("url-update-requested",this.routeChangedListener),this.addEventListener("navigate-to-requested",this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener("url-update-requested",this.routeChangedListener),this.removeEventListener("navigate-to-requested",this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute("route",this.route),this.instant=ye(),this._lastUrl=e.location.href,e.location.search){const a=new URLSearchParams(e.location.search).get("overrides");if(a&&(this.config=a,this.config))try{const s=JSON.parse(this.config);W.value={...W.value,...s}}catch{W.value={...W.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){const t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t=="/"?"":t}addQueryParams(e,t){return e+(t.search?""+t.search:"")}extractGrossRouteFromUrl(e){const t=e.location.pathname,a=this.baseUrl&&(this.baseUrl.startsWith("http://")||this.baseUrl.startsWith("https://"))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(a)?t.substring(a.length):t}getContextPathStartingIndex(e){return e.startsWith("http:")?e.indexOf("/",7):e.startsWith("https:")?e.indexOf("/",8):0}render(){return o`
           <mateu-api-caller>
                <mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${_a.value}"
                          .appState="${W.value}"
                ></mateu-ux>
           </mateu-api-caller>
           ${this.debug?o`
               <mateu-debug-overlay
                   .appState="${W.value}"
                   .appData="${_a.value}"
               ></mateu-debug-overlay>
           `:l}
       `}};Le.styles=y`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `;ct([u()],Le.prototype,"baseUrl",2);ct([u()],Le.prototype,"route",2);ct([u()],Le.prototype,"consumedRoute",2);ct([u()],Le.prototype,"config",2);ct([u()],Le.prototype,"top",2);ct([u()],Le.prototype,"pathPrefix",2);ct([b()],Le.prototype,"instant",2);ct([u({type:Boolean})],Le.prototype,"debug",2);Le=ct([x("mateu-ui")],Le);
