const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index.js","assets/vendor-lit.js","assets/vendor.js"])))=>i.map(i=>d[i]);
import{A as l,u as g,s as p,e as B,i as D,t as I,b as i,o as L}from"./vendor-lit.js";import{m as O}from"./vendor.js";(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function t(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(o){if(o.ep)return;o.ep=!0;const n=t(o);fetch(o.href,n)}})();const R="modulepreload",y=function(e){return"/"+e},w={},N=function(r,t,s){let o=Promise.resolve();if(t&&t.length>0){let v=function(u){return Promise.all(u.map(h=>Promise.resolve(h).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};document.getElementsByTagName("link");const c=document.querySelector("meta[property=csp-nonce]"),d=c?.nonce||c?.getAttribute("nonce");o=v(t.map(u=>{if(u=y(u),u in w)return;w[u]=!0;const h=u.endsWith(".css"),f=h?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${f}`))return;const m=document.createElement("link");if(m.rel=h?"stylesheet":R,h||(m.as="script"),m.crossOrigin="",m.href=u,d&&m.setAttribute("nonce",d),document.head.appendChild(m),h)return new Promise((A,k)=>{m.addEventListener("load",A),m.addEventListener("error",()=>k(new Error(`Unable to preload CSS for ${u}`)))})}))}function n(c){const d=new Event("vite:preloadError",{cancelable:!0});if(d.payload=c,window.dispatchEvent(d),!d.defaultPrevented)throw c}return o.then(c=>{for(const d of c||[])d.status==="rejected"&&n(d.reason);return r().catch(n)})};var a=(e=>(e.Page="Page",e.Div="Div",e.Element="Element",e.MicroFrontend="MicroFrontend",e.Form="Form",e.Crud="Crud",e.Result="Result",e.Card="Card",e.Directory="Directory",e.Stepper="Stepper",e.HorizontalLayout="HorizontalLayout",e.VerticalLayout="VerticalLayout",e.SplitLayout="SplitLayout",e.MasterDetailLayout="MasterDetailLayout",e.TabLayout="TabLayout",e.AccordionLayout="AccordionLayout",e.FormLayout="FormLayout",e.FormRow="FormRow",e.FormItem="FormItem",e.BoardLayout="BoardLayout",e.BoardLayoutRow="BoardLayoutRow",e.BoardLayoutItem="BoardLayoutItem",e.Scroller="Scroller",e.FullWidth="FullWidth",e.Container="Container",e.FormField="FormField",e.Table="Table",e.App="App",e.Text="Text",e.Avatar="Avatar",e.Chat="Chat",e.AvatarGroup="AvatarGroup",e.Badge="Badge",e.Breadcrumbs="Breadcrumbs",e.Anchor="Anchor",e.Button="Button",e.Chart="Chart",e.Icon="Icon",e.ConfirmDialog="ConfirmDialog",e.ContextMenu="ContextMenu",e.CookieConsent="CookieConsent",e.Details="Details",e.Dialog="Dialog",e.Drawer="Drawer",e.Image="Image",e.Map="Map",e.Markdown="Markdown",e.Notification="Notification",e.ProgressBar="ProgressBar",e.Popover="Popover",e.CarouselLayout="CarouselLayout",e.Tooltip="Tooltip",e.MessageInput="MessageInput",e.MessageList="MessageList",e.CustomField="CustomField",e.MenuBar="MenuBar",e.Grid="Grid",e.GridColumn="GridColumn",e.GridGroupColumn="GridGroupColumn",e.VirtualList="VirtualList",e.FormSection="FormSection",e.FormSubSection="FormSubSection",e.Bpmn="Bpmn",e.Workflow="Workflow",e.WorkflowElk="WorkflowElk",e.FormEditor="FormEditor",e.MetricCard="MetricCard",e.Scoreboard="Scoreboard",e.DashboardPanel="DashboardPanel",e.DashboardLayout="DashboardLayout",e.FoldoutLayout="FoldoutLayout",e.HeroSection="HeroSection",e.EmptyState="EmptyState",e.Skeleton="Skeleton",e.Gantt="Gantt",e.PlanningBoard="PlanningBoard",e.Kanban="Kanban",e.Timeline="Timeline",e.ProgressSteps="ProgressSteps",e.Stat="Stat",e.Calendar="Calendar",e.PricingTable="PricingTable",e.OrgChart="OrgChart",e.Heatmap="Heatmap",e.Funnel="Funnel",e.TrendChart="TrendChart",e.FeatureGrid="FeatureGrid",e.Testimonials="Testimonials",e.Faq="Faq",e.CalloutCard="CalloutCard",e.CommentThread="CommentThread",e.FileList="FileList",e.Checklist="Checklist",e.ComparisonCard="ComparisonCard",e.EntityHeader="EntityHeader",e.Meter="Meter",e.TaskProgress="TaskProgress",e.StatusList="StatusList",e.BulletedList="BulletedList",e.Separator="Separator",e.Notice="Notice",e.TaskQueue="TaskQueue",e.ResourceGrid="ResourceGrid",e.OfferCard="OfferCard",e.AddOnPicker="AddOnPicker",e.Ledger="Ledger",e.PaymentPicker="PaymentPicker",e.ProcessMonitor="ProcessMonitor",e))(a||{});class G extends D{constructor(r){if(super(r),r.type!==I.ELEMENT)throw new Error("applyOj can only be used on an element binding")}render(r){return l}update(r,[t]){const s=r.element;for(const[o,n]of Object.entries(t.props??{}))n!==void 0&&(s[o]=n);for(const[o,n]of Object.entries(t.attrs??{}))n===void 0?s.removeAttribute(o):s.setAttribute(o,n);return l}}const _=B(G);function $(e,r){const t=p(e);return g`<${t} ${_({props:r.props,attrs:r.attrs})}>${r.children??l}</${t}>`}const H={loaders:["oj-sp/welcome-page/loader"],render(e){const r=e.component.metadata;return $("oj-sp-welcome-page",{props:{pageTitle:r.title??"",descriptionText:r.subtitle??"",illustrationBackground:r.image??void 0},attrs:{"display-options.responsive-padding":"on",class:e.component.cssClasses||void 0,style:e.component.style||void 0},children:e.component.children?.length?i`
            <div class="oj-flex oj-sm-flex-wrap oj-sm-align-items-center" style="gap: 0.75rem;">
              ${e.component.children.map(t=>e.renderChild(t))}
            </div>
          `:l})}},z={loaders:["oj-sp/foldout-layout/loader","oj-sp/foldout-panel-summarizing/loader"],render(e){const r=e.component.metadata,t=e.component.children??[],s=t.find(c=>c.slot==="overview"),o=r.panels??[],n=o.findIndex(c=>c.open!==!1);return $("oj-sp-foldout-layout",{props:{orientation:r.orientation==="horizontal"?"horizontal":"vertical",selectedPanel:n>=0?n:0},attrs:{class:e.component.cssClasses||void 0,style:e.component.style||void 0},children:i`
        ${s?i`<div slot="overview">${e.renderChild(s)}</div>`:l}
        ${o.map((c,d)=>q(e,c,t.find(v=>v.slot===`panel-${d}`)))}
      `})}};function q(e,r,t){return $("oj-sp-foldout-panel-summarizing",{props:{panelTitle:r.title??""},children:i`
      <div>${t?e.renderChild(t):l}</div>
      ${r.subtitle?i`<div slot="summary">${r.subtitle}</div>`:l}
    `})}const V={loaders:["oj-c/button"],render(e){const r=e.component.metadata,t=s=>s.currentTarget?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,parameters:r.parameters},bubbles:!0,composed:!0}));return i`<oj-c-button
      id=${e.component.id||l}
      class=${e.component.cssClasses||l}
      style=${e.component.style||l}
      slot=${e.component.slot||l}
      .label=${r.label??""}
      chroming=${U(r.buttonStyle)}
      ?disabled=${!!r.disabled}
      @ojAction=${t}
    ></oj-c-button>`}};function U(e){return String(e)==="primary"?"callToAction":"outlined"}const W={loaders:[],render(e){const r=e.component.metadata,t=r.columns&&r.columns>0?`repeat(${r.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return i`
      <div
        style="display:grid; grid-template-columns:${t}; gap:1rem; padding:1rem; align-items:start; width:100%; box-sizing:border-box;"
      >
        ${(e.component.children??[]).map(s=>e.renderChild(s))}
      </div>
    `}},J={loaders:[],render(e){return i`
      <div class="mateu-rw-scoreboard" style="grid-column:1 / -1;">
        ${(e.component.children??[]).map(r=>e.renderChild(r))}
      </div>
    `}},K={loaders:["oj-sp/dashboard-panel/loader"],render(e){const r=e.component.metadata,t=[];return r.colSpan&&r.colSpan>1&&t.push(`grid-column: span ${r.colSpan}`),r.rowSpan&&r.rowSpan>1&&t.push(`grid-row: span ${r.rowSpan}`),i`<oj-sp-dashboard-panel
      class="mateu-rw-panel"
      .panelTitle=${r.title??""}
      .panelSubtitle=${r.subtitle??""}
      style=${t.length?t.join("; "):l}
      >${(e.component.children??[]).map(s=>e.renderChild(s))}</oj-sp-dashboard-panel
    >`}},Q={loaders:["oj-sp/scoreboard-metric-card/loader"],render(e){const r=e.component.metadata,t=`${r.value??""}${r.unit?" "+r.unit:""}`,s=r.trendLabel||r.description||"",o=`flex:1 1 12rem; min-width:12rem;${r.actionId?" cursor:pointer;":""}`,n=r.actionId?c=>c.currentTarget?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,parameters:{}},bubbles:!0,composed:!0})):void 0;return i`<oj-sp-scoreboard-metric-card
      style=${o}
      .cardTitle=${r.title??""}
      .metricText=${t}
      .metaText=${s}
      .trendColor=${Y(r.trend)}
      @click=${n}
    ></oj-sp-scoreboard-metric-card>`}};function Y(e){return e==="up"?"success":e==="down"?"danger":"neutral"}const X={loaders:[],render(e){const r=e.component.metadata,t=r.badges??[],s=r.facts??[];return i`
      <div class="mateu-rw-entity-header">
        <div class="rw-eh-top">
          <div class="rw-eh-titles">
            <h1 class="rw-eh-title">${r.title??""}</h1>
            ${r.subtitle?i`<div class="rw-eh-subtitle">${r.subtitle}</div>`:l}
            ${t.length?i`<div class="rw-eh-badges">${t.map(o=>Z(o))}</div>`:l}
          </div>
          ${r.metricValue?i`<div class="rw-eh-metric">
                <div class="rw-eh-metric-value">${r.metricValue}</div>
                ${r.metricLabel?i`<div class="rw-eh-metric-label">${r.metricLabel}</div>`:l}
                ${r.metricCaption?i`<div class="rw-eh-metric-caption">${r.metricCaption}</div>`:l}
              </div>`:l}
        </div>
        ${s.length?i`<div class="rw-eh-facts">
              ${s.map(o=>i`<div class="rw-eh-fact">
                  <div class="rw-eh-fact-label">${o.label??""}</div>
                  <div class="rw-eh-fact-value">${o.value??""}</div>
                </div>`)}
            </div>`:l}
      </div>
    `}};function Z(e){const r=e.color||"neutral";return i`<span class="rw-eh-chip rw-eh-chip--${r}">${e.label??""}</span>`}const x={xs:"0.25rem",s:"0.5rem",m:"1rem",l:"1.5rem",xl:"2rem"},C={START:"flex-start",CENTER:"center",END:"flex-end",BETWEEN:"space-between",AROUND:"space-around",EVENLY:"space-evenly"},T={STRETCH:"stretch",START:"flex-start",CENTER:"center",END:"flex-end",BASELINE:"baseline"};function E(e,r){const t=e.component.metadata,s=["display:flex",`flex-direction:${r}`];t.spacing&&s.push(`gap:${x[t.spacingVariant??"m"]??"1rem"}`),t.padding&&s.push("padding:1rem"),t.fullWidth&&s.push("width:100%"),t.wrap&&s.push("flex-wrap:wrap"),t.justification&&s.push(`justify-content:${C[t.justification]??"flex-start"}`);const o=r==="column"?t.horizontalAlignment:t.verticalAlignment;o&&s.push(`align-items:${T[o]??"stretch"}`);const n=s.join("; ")+(e.component.style?"; "+e.component.style:"");return i`<div class=${e.component.cssClasses||l} style=${n}>
    ${(e.component.children??[]).map(c=>e.renderChild(c))}
  </div>`}const M={loaders:[],render:e=>E(e,"column")},ee={loaders:[],render:e=>E(e,"row")},re={loaders:[],render(e){const r=e.component.metadata,t=s=>s?e.renderChild(s):l;return i`<div
      class="mateu-rw-card ${e.component.cssClasses||""}"
      style=${e.component.style||l}
    >
      ${r.header?i`<div class="rw-card-header">${t(r.header)}</div>`:l}
      ${r.title?i`<div class="rw-card-title">${t(r.title)}</div>`:l}
      ${r.subtitle?i`<div class="rw-card-subtitle">${t(r.subtitle)}</div>`:l}
      ${t(r.media)}
      ${r.content?i`<div class="rw-card-content">${t(r.content)}</div>`:l}
      ${r.footer?i`<div class="rw-card-footer">${t(r.footer)}</div>`:l}
    </div>`}},te={loaders:[],render(e){return i`<div
      class="mateu-rw-form-layout ${e.component.cssClasses||""}"
      style=${e.component.style||l}
    >
      ${(e.component.children??[]).map(r=>e.renderChild(r))}
    </div>`}},se={loaders:[],render(e){return i`<div class="mateu-rw-form-row">
      ${(e.component.children??[]).map(r=>e.renderChild(r))}
    </div>`}};function oe(e){const r=window.__mateuArrayDataProvider;return r?new r(e.map(t=>({value:t.value,label:t.label})),{keyAttributes:"value"}):void 0}const ie={loaders:["oj-c/select-single","oj-c/input-text"],render(e){const r=e.component.metadata,t=le(e,r),s=(c,d)=>{c==null||String(c)===t||d?.dispatchEvent(new CustomEvent("value-changed",{detail:{value:c,fieldId:r.fieldId},bubbles:!0,composed:!0}))},o=r.label||r.fieldId,n=r.label?"top":"none";return r.options?.length?i`<oj-c-select-single
        class="mateu-rw-field"
        label-hint=${o}
        label-edge=${n}
        item-text="label"
        .data=${oe(r.options)}
        .value=${t}
        ?readonly=${!!r.readOnly}
        ?disabled=${!!r.disabled}
        @valueChanged=${c=>s(c.detail?.value,c.currentTarget)}
      ></oj-c-select-single>`:i`<oj-c-input-text
      class="mateu-rw-field"
      label-hint=${o}
      label-edge=${n}
      .value=${t}
      ?readonly=${!!r.readOnly}
      ?disabled=${!!r.disabled}
      @valueChanged=${c=>s(c.detail?.value,c.currentTarget)}
    ></oj-c-input-text>`}};function le(e,r){const t=e.state,s=t&&r.fieldId in t?t[r.fieldId]:r.initialValue;return s==null?"":String(s)}const ne={loaders:[],render(e){const r=e.component.metadata;return i`<div class="mateu-rw-custom-field">
      ${r.label?i`<label class="rw-field-label">${r.label}</label>`:l}
      ${r.content?e.renderChild(r.content):l}
    </div>`}};function S(e){const r=e.component.metadata,t=!r.noHeader&&(r.title||r.subtitle);return i`<div class="mateu-rw-page">
    ${t?i`<div class="rw-page-header">
          ${r.title?i`<h1 class="rw-page-title">${r.title}</h1>`:l}
          ${r.subtitle?i`<div class="rw-page-subtitle">${r.subtitle}</div>`:l}
        </div>`:l}
    ${(e.component.children??[]).map(s=>e.renderChild(s))}
  </div>`}const ce={loaders:[],render:S},ae={loaders:[],render:S},de=new Set(["h1","h2","h3","h4","h5","h6","p","span","div"]),ue={loaders:[],render(e){const r=e.component.metadata,t=de.has(r.container)?r.container:"span",s=[];r.size&&r.size!=="m"&&s.push(`font-size: var(--lumo-font-size-${r.size}, 1rem)`),r.noMargins&&s.push("margin-block-start: 0","margin-block-end: 0"),e.component.style&&s.push(e.component.style);const o=p(t);return g`<${o} class=${e.component.cssClasses||l} style=${s.length?s.join("; "):l}>${r.text??""}</${o}>`}},me={loaders:[],render(e){const r=e.component.metadata,t=O.parse(r.markdown??"",{async:!1});return i`<div class="mateu-rw-markdown" style=${e.component.style||l}>${L(t)}</div>`}},he={loaders:[],render(e){const r=e.component.metadata,t=r.items??[];return i`<div class="mateu-rw-status-list ${r.frameless?"frameless":""} ${r.compact?"compact":""}">
      ${t.map(s=>ve(s))}
    </div>`}},fe={loaders:[],render(e){const r=e.component.metadata;return i`<div class=${e.component.cssClasses||l} style=${e.component.style||l}>
      ${(e.component.children??[]).map(t=>e.renderChild(t))}
      ${r.content?L(r.content):l}
    </div>`}};function ve(e){return i`<div class="rw-status-row">
    <div class="rw-status-main">
      <div class="rw-status-title">${e.title??""}</div>
      ${e.description?i`<div class="rw-status-desc">${e.description}</div>`:l}
    </div>
    ${e.status?i`<span class="rw-status-chip rw-status-chip--${e.statusColor||"neutral"}">${e.status}</span>`:l}
  </div>`}const j={[a.HeroSection]:H,[a.FoldoutLayout]:z,[a.Button]:V,[a.DashboardLayout]:W,[a.Scoreboard]:J,[a.DashboardPanel]:K,[a.MetricCard]:Q,[a.EntityHeader]:X,[a.VerticalLayout]:M,[a.HorizontalLayout]:ee,[a.Card]:re,[a.FormLayout]:te,[a.FormRow]:se,[a.FormField]:ie,[a.CustomField]:ne,[a.Page]:ce,[a.Form]:ae,[a.Text]:ue,[a.Markdown]:me,[a.StatusList]:he,[a.Div]:fe};function Pe(e){return e?j[e]:void 0}function be(){return[...new Set(Object.values(j).flatMap(e=>e?.loaders??[]))]}const P="https://static.oracle.com/cdn/jet/19.0.0-2604.8",F="https://static.oracle.com/cdn/spectra-ui/oj-sp/2604.1.0",$e=`${P}/3rdparty/require/require.js`,we=`${P}/default/js/bundles-config.js`,ge=`${F}/oj-sp-bundle-config.js`,b=e=>new Promise((r,t)=>{const s=document.createElement("script");s.src=e,s.async=!1,s.onload=()=>r(),s.onerror=()=>t(new Error("failed to load "+e)),document.head.appendChild(s)});async function pe(){await N(()=>import("./index.js"),__vite__mapDeps([0,1,2]));const e=document.getElementById("ui-container");if(!e)return;const t=document.getElementById("mateu-ui-holder")?.content.querySelector("mateu-ui"),s=t?.getAttribute("baseurl")??"",o=t?.getAttribute("pathprefix")??"";let n=window.location.pathname;o&&n.startsWith(o)&&(n=n.substring(o.length));const c=n.replace(/^\/+/,""),d=document.createElement("rw-root");d.baseUrl=s,d.route=c,d.style.width="100%",e.appendChild(d),e.style.display="",document.getElementById("landing-loader")?.remove()}async function Le(){await b($e),await b(we),await b(ge);const e=window.require;if(!e)throw new Error("RequireJS did not initialise");e.config({paths:{"oj-sp":F}}),await new Promise((r,t)=>{e(["ojs/ojbootstrap","ojs/ojarraydataprovider",...be()],(s,o)=>{const n=o;window.__mateuArrayDataProvider=n?.default??n?.ArrayDataProvider??o,r()},t)})}async function Ee(){try{await Le()}catch(e){console.warn("[redwood-spectra] OJET CDN not available — falling back to the base renderer.",e)}await pe()}Ee();export{Pe as r};
