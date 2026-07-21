const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index.js","assets/vendor-lit.js","assets/vendor-vaadin.js","assets/vendor.js"])))=>i.map(i=>d[i]);
import{_ as $}from"./vendor-vaadin.js";import{A as n,u as w,s as L,e as E,g as S,t as j,d as o}from"./vendor-lit.js";import"./vendor.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))s(l);new MutationObserver(l=>{for(const t of l)if(t.type==="childList")for(const c of t.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function i(l){const t={};return l.integrity&&(t.integrity=l.integrity),l.referrerPolicy&&(t.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?t.credentials="include":l.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function s(l){if(l.ep)return;l.ep=!0;const t=i(l);fetch(l.href,t)}})();var d=(r=>(r.Page="Page",r.Div="Div",r.Element="Element",r.MicroFrontend="MicroFrontend",r.Form="Form",r.Crud="Crud",r.Result="Result",r.Card="Card",r.Directory="Directory",r.Stepper="Stepper",r.HorizontalLayout="HorizontalLayout",r.VerticalLayout="VerticalLayout",r.SplitLayout="SplitLayout",r.MasterDetailLayout="MasterDetailLayout",r.TabLayout="TabLayout",r.AccordionLayout="AccordionLayout",r.FormLayout="FormLayout",r.FormRow="FormRow",r.FormItem="FormItem",r.BoardLayout="BoardLayout",r.BoardLayoutRow="BoardLayoutRow",r.BoardLayoutItem="BoardLayoutItem",r.Scroller="Scroller",r.FullWidth="FullWidth",r.Container="Container",r.FormField="FormField",r.Table="Table",r.App="App",r.Text="Text",r.Avatar="Avatar",r.Chat="Chat",r.AvatarGroup="AvatarGroup",r.Badge="Badge",r.Breadcrumbs="Breadcrumbs",r.Anchor="Anchor",r.Button="Button",r.Chart="Chart",r.Icon="Icon",r.ConfirmDialog="ConfirmDialog",r.ContextMenu="ContextMenu",r.CookieConsent="CookieConsent",r.Details="Details",r.Dialog="Dialog",r.Drawer="Drawer",r.Image="Image",r.Map="Map",r.Markdown="Markdown",r.Notification="Notification",r.ProgressBar="ProgressBar",r.Popover="Popover",r.CarouselLayout="CarouselLayout",r.Tooltip="Tooltip",r.MessageInput="MessageInput",r.MessageList="MessageList",r.CustomField="CustomField",r.MenuBar="MenuBar",r.Grid="Grid",r.GridColumn="GridColumn",r.GridGroupColumn="GridGroupColumn",r.VirtualList="VirtualList",r.FormSection="FormSection",r.FormSubSection="FormSubSection",r.Bpmn="Bpmn",r.Workflow="Workflow",r.WorkflowElk="WorkflowElk",r.FormEditor="FormEditor",r.MetricCard="MetricCard",r.Scoreboard="Scoreboard",r.DashboardPanel="DashboardPanel",r.DashboardLayout="DashboardLayout",r.FoldoutLayout="FoldoutLayout",r.HeroSection="HeroSection",r.EmptyState="EmptyState",r.Skeleton="Skeleton",r.Gantt="Gantt",r.PlanningBoard="PlanningBoard",r.Kanban="Kanban",r.Timeline="Timeline",r.ProgressSteps="ProgressSteps",r.Stat="Stat",r.Calendar="Calendar",r.PricingTable="PricingTable",r.OrgChart="OrgChart",r.Heatmap="Heatmap",r.Funnel="Funnel",r.TrendChart="TrendChart",r.FeatureGrid="FeatureGrid",r.Testimonials="Testimonials",r.Faq="Faq",r.CalloutCard="CalloutCard",r.CommentThread="CommentThread",r.FileList="FileList",r.Checklist="Checklist",r.ComparisonCard="ComparisonCard",r.EntityHeader="EntityHeader",r.Meter="Meter",r.TaskProgress="TaskProgress",r.StatusList="StatusList",r.BulletedList="BulletedList",r.Separator="Separator",r.Notice="Notice",r.TaskQueue="TaskQueue",r.ResourceGrid="ResourceGrid",r.OfferCard="OfferCard",r.AddOnPicker="AddOnPicker",r.Ledger="Ledger",r.PaymentPicker="PaymentPicker",r.ProcessMonitor="ProcessMonitor",r))(d||{});class F extends S{constructor(e){if(super(e),e.type!==j.ELEMENT)throw new Error("applyOj can only be used on an element binding")}render(e){return n}update(e,[i]){const s=e.element;for(const[l,t]of Object.entries(i.props??{}))t!==void 0&&(s[l]=t);for(const[l,t]of Object.entries(i.attrs??{}))t===void 0?s.removeAttribute(l):s.setAttribute(l,t);return n}}const p=E(F);function m(r,e){const i=L(r);return w`<${i} ${p({props:e.props,attrs:e.attrs})}>${e.children??n}</${i}>`}const P={loaders:["oj-sp/welcome-page/loader"],render(r){const e=r.component.metadata;return m("oj-sp-welcome-page",{props:{pageTitle:e.title??"",descriptionText:e.subtitle??"",illustrationBackground:e.image??void 0},attrs:{"display-options.responsive-padding":"on",class:r.component.cssClasses||void 0,style:r.component.style||void 0},children:r.component.children?.length?o`
            <div class="oj-flex oj-sm-flex-wrap oj-sm-align-items-center" style="gap: 0.75rem;">
              ${r.component.children.map(i=>r.renderChild(i))}
            </div>
          `:n})}},A={loaders:["oj-sp/foldout-layout/loader","oj-sp/foldout-panel-summarizing/loader"],render(r){const e=r.component.metadata,i=r.component.children??[],s=i.find(c=>c.slot==="overview"),l=e.panels??[],t=l.findIndex(c=>c.open!==!1);return m("oj-sp-foldout-layout",{props:{orientation:e.orientation==="horizontal"?"horizontal":"vertical",selectedPanel:t>=0?t:0},attrs:{class:r.component.cssClasses||void 0,style:r.component.style||void 0},children:o`
        ${s?o`<div slot="overview">${r.renderChild(s)}</div>`:n}
        ${l.map((c,a)=>B(r,c,i.find(g=>g.slot===`panel-${a}`)))}
      `})}};function B(r,e,i){return m("oj-sp-foldout-panel-summarizing",{props:{panelTitle:e.title??""},children:o`
      <div>${i?r.renderChild(i):n}</div>
      ${e.subtitle?o`<div slot="summary">${e.subtitle}</div>`:n}
    `})}const D={loaders:["oj-c/button"],render(r){const e=r.component.metadata,i=s=>s.currentTarget?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:e.parameters},bubbles:!0,composed:!0}));return o`<oj-c-button
      id=${r.component.id||n}
      class=${r.component.cssClasses||n}
      style=${r.component.style||n}
      slot=${r.component.slot||n}
      .label=${e.label??""}
      chroming=${I(e.buttonStyle)}
      ?disabled=${!!e.disabled}
      @ojAction=${i}
    ></oj-c-button>`}};function I(r){return String(r)==="primary"?"callToAction":"outlined"}const O={loaders:[],render(r){const e=r.component.metadata,i=e.columns&&e.columns>0?`repeat(${e.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return o`
      <div
        style="display:grid; grid-template-columns:${i}; gap:1rem; padding:1rem; align-items:start; width:100%; box-sizing:border-box;"
      >
        ${(r.component.children??[]).map(s=>r.renderChild(s))}
      </div>
    `}},k={loaders:[],render(r){return o`
      <div class="mateu-rw-scoreboard" style="grid-column:1 / -1;">
        ${(r.component.children??[]).map(e=>r.renderChild(e))}
      </div>
    `}},N={loaders:["oj-sp/dashboard-panel/loader"],render(r){const e=r.component.metadata,i=[];return e.colSpan&&e.colSpan>1&&i.push(`grid-column: span ${e.colSpan}`),e.rowSpan&&e.rowSpan>1&&i.push(`grid-row: span ${e.rowSpan}`),o`<oj-sp-dashboard-panel
      class="mateu-rw-panel"
      .panelTitle=${e.title??""}
      .panelSubtitle=${e.subtitle??""}
      style=${i.length?i.join("; "):n}
      >${(r.component.children??[]).map(s=>r.renderChild(s))}</oj-sp-dashboard-panel
    >`}},R={loaders:["oj-sp/scoreboard-metric-card/loader"],render(r){const e=r.component.metadata,i=`${e.value??""}${e.unit?" "+e.unit:""}`,s=e.trendLabel||e.description||"",l=`flex:1 1 12rem; min-width:12rem;${e.actionId?" cursor:pointer;":""}`,t=e.actionId?c=>c.currentTarget?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{}},bubbles:!0,composed:!0})):void 0;return o`<oj-sp-scoreboard-metric-card
      style=${l}
      .cardTitle=${e.title??""}
      .metricText=${i}
      .metaText=${s}
      .trendColor=${_(e.trend)}
      @click=${t}
    ></oj-sp-scoreboard-metric-card>`}};function _(r){return r==="up"?"success":r==="down"?"danger":"neutral"}const G={loaders:[],render(r){const e=r.component.metadata,i=e.badges??[],s=e.facts??[];return o`
      <div class="mateu-rw-entity-header">
        <div class="rw-eh-top">
          <div class="rw-eh-titles">
            <h1 class="rw-eh-title">${e.title??""}</h1>
            ${e.subtitle?o`<div class="rw-eh-subtitle">${e.subtitle}</div>`:n}
            ${i.length?o`<div class="rw-eh-badges">${i.map(l=>H(l))}</div>`:n}
          </div>
          ${e.metricValue?o`<div class="rw-eh-metric">
                <div class="rw-eh-metric-value">${e.metricValue}</div>
                ${e.metricLabel?o`<div class="rw-eh-metric-label">${e.metricLabel}</div>`:n}
                ${e.metricCaption?o`<div class="rw-eh-metric-caption">${e.metricCaption}</div>`:n}
              </div>`:n}
        </div>
        ${s.length?o`<div class="rw-eh-facts">
              ${s.map(l=>o`<div class="rw-eh-fact">
                  <div class="rw-eh-fact-label">${l.label??""}</div>
                  <div class="rw-eh-fact-value">${l.value??""}</div>
                </div>`)}
            </div>`:n}
      </div>
    `}};function H(r){const e=r.color||"neutral";return o`<span class="rw-eh-chip rw-eh-chip--${e}">${r.label??""}</span>`}const V={xs:"0.25rem",s:"0.5rem",m:"1rem",l:"1.5rem",xl:"2rem"},q={START:"flex-start",CENTER:"center",END:"flex-end",BETWEEN:"space-between",AROUND:"space-around",EVENLY:"space-evenly"},z={STRETCH:"stretch",START:"flex-start",CENTER:"center",END:"flex-end",BASELINE:"baseline"};function f(r,e){const i=r.component.metadata,s=["display:flex",`flex-direction:${e}`];i.spacing&&s.push(`gap:${V[i.spacingVariant??"m"]??"1rem"}`),i.padding&&s.push("padding:1rem"),i.fullWidth&&s.push("width:100%"),i.wrap&&s.push("flex-wrap:wrap"),i.justification&&s.push(`justify-content:${q[i.justification]??"flex-start"}`);const l=e==="column"?i.horizontalAlignment:i.verticalAlignment;l&&s.push(`align-items:${z[l]??"stretch"}`);const t=s.join("; ")+(r.component.style?"; "+r.component.style:"");return o`<div class=${r.component.cssClasses||n} style=${t}>
    ${(r.component.children??[]).map(c=>r.renderChild(c))}
  </div>`}const W={loaders:[],render:r=>f(r,"column")},y={loaders:[],render:r=>f(r,"row")},J={loaders:[],render(r){const e=r.component.metadata,i=s=>s?r.renderChild(s):n;return o`<div
      class="mateu-rw-card ${r.component.cssClasses||""}"
      style=${r.component.style||n}
    >
      ${e.header?o`<div class="rw-card-header">${i(e.header)}</div>`:n}
      ${e.title?o`<div class="rw-card-title">${i(e.title)}</div>`:n}
      ${e.subtitle?o`<div class="rw-card-subtitle">${i(e.subtitle)}</div>`:n}
      ${i(e.media)}
      ${e.content?o`<div class="rw-card-content">${i(e.content)}</div>`:n}
      ${e.footer?o`<div class="rw-card-footer">${i(e.footer)}</div>`:n}
    </div>`}},U={loaders:[],render(r){return o`<div
      class="mateu-rw-form-layout ${r.component.cssClasses||""}"
      style=${r.component.style||n}
    >
      ${(r.component.children??[]).map(e=>r.renderChild(e))}
    </div>`}},K={loaders:[],render(r){return o`<div class="mateu-rw-form-row">
      ${(r.component.children??[]).map(e=>r.renderChild(e))}
    </div>`}};function Q(r){const e=window.__mateuArrayDataProvider;return e?new e(r.map(i=>({value:i.value,label:i.label})),{keyAttributes:"value"}):void 0}const Y={loaders:["oj-c/select-single","oj-c/input-text"],render(r){const e=r.component.metadata,i=x(r,e),s=(c,a)=>{c==null||String(c)===i||a?.dispatchEvent(new CustomEvent("value-changed",{detail:{value:c,fieldId:e.fieldId},bubbles:!0,composed:!0}))},l=e.label||e.fieldId,t=e.label?"top":"none";return e.options?.length?o`<oj-c-select-single
        class="mateu-rw-field"
        label-hint=${l}
        label-edge=${t}
        item-text="label"
        .data=${Q(e.options)}
        .value=${i}
        ?readonly=${!!e.readOnly}
        ?disabled=${!!e.disabled}
        @valueChanged=${c=>s(c.detail?.value,c.currentTarget)}
      ></oj-c-select-single>`:o`<oj-c-input-text
      class="mateu-rw-field"
      label-hint=${l}
      label-edge=${t}
      .value=${i}
      ?readonly=${!!e.readOnly}
      ?disabled=${!!e.disabled}
      @valueChanged=${c=>s(c.detail?.value,c.currentTarget)}
    ></oj-c-input-text>`}};function x(r,e){const i=r.state,s=i&&e.fieldId in i?i[e.fieldId]:e.initialValue;return s==null?"":String(s)}const X={loaders:[],render(r){const e=r.component.metadata;return o`<div class="mateu-rw-custom-field">
      ${e.label?o`<label class="rw-field-label">${e.label}</label>`:n}
      ${e.content?r.renderChild(e.content):n}
    </div>`}},h={[d.HeroSection]:P,[d.FoldoutLayout]:A,[d.Button]:D,[d.DashboardLayout]:O,[d.Scoreboard]:k,[d.DashboardPanel]:N,[d.MetricCard]:R,[d.EntityHeader]:G,[d.VerticalLayout]:W,[d.HorizontalLayout]:y,[d.Card]:J,[d.FormLayout]:U,[d.FormRow]:K,[d.FormField]:Y,[d.CustomField]:X};function tr(r){return r?h[r]:void 0}function Z(){return[...new Set(Object.values(h).flatMap(r=>r?.loaders??[]))]}const v="https://static.oracle.com/cdn/jet/19.0.0-2604.8",b="https://static.oracle.com/cdn/spectra-ui/oj-sp/2604.1.0",C=`${v}/3rdparty/require/require.js`,T=`${v}/default/js/bundles-config.js`,M=`${b}/oj-sp-bundle-config.js`,u=r=>new Promise((e,i)=>{const s=document.createElement("script");s.src=r,s.async=!1,s.onload=()=>e(),s.onerror=()=>i(new Error("failed to load "+r)),document.head.appendChild(s)});async function rr(){await $(()=>import("./index.js"),__vite__mapDeps([0,1,2,3]));const r=document.getElementById("ui-container"),e=document.getElementById("mateu-ui-holder");r&&e&&e.content.childElementCount>0&&r.appendChild(e.content.cloneNode(!0)),r&&(r.style.display=""),document.getElementById("landing-loader")?.remove()}async function er(){await u(C),await u(T),await u(M);const r=window.require;if(!r)throw new Error("RequireJS did not initialise");r.config({paths:{"oj-sp":b}}),await new Promise((e,i)=>{r(["ojs/ojbootstrap","ojs/ojarraydataprovider",...Z()],(s,l)=>{const t=l;window.__mateuArrayDataProvider=t?.default??t?.ArrayDataProvider??l,e()},i)})}async function ir(){try{await er()}catch(r){console.warn("[redwood-spectra] OJET CDN not available — falling back to the base renderer.",r)}await rr()}ir();export{d as C,tr as r};
