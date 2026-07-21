const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index.js","assets/vendor-lit.js","assets/vendor-vaadin.js","assets/vendor.js"])))=>i.map(i=>d[i]);
import{_ as g}from"./vendor-vaadin.js";import{A as c,u as w,s as $,e as L,g as S,t as E,d as t}from"./vendor-lit.js";import"./vendor.js";(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const l of s)if(l.type==="childList")for(const n of l.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&o(n)}).observe(document,{childList:!0,subtree:!0});function e(s){const l={};return s.integrity&&(l.integrity=s.integrity),s.referrerPolicy&&(l.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?l.credentials="include":s.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function o(s){if(s.ep)return;s.ep=!0;const l=e(s);fetch(s.href,l)}})();var u=(r=>(r.Page="Page",r.Div="Div",r.Element="Element",r.MicroFrontend="MicroFrontend",r.Form="Form",r.Crud="Crud",r.Result="Result",r.Card="Card",r.Directory="Directory",r.Stepper="Stepper",r.HorizontalLayout="HorizontalLayout",r.VerticalLayout="VerticalLayout",r.SplitLayout="SplitLayout",r.MasterDetailLayout="MasterDetailLayout",r.TabLayout="TabLayout",r.AccordionLayout="AccordionLayout",r.FormLayout="FormLayout",r.FormRow="FormRow",r.FormItem="FormItem",r.BoardLayout="BoardLayout",r.BoardLayoutRow="BoardLayoutRow",r.BoardLayoutItem="BoardLayoutItem",r.Scroller="Scroller",r.FullWidth="FullWidth",r.Container="Container",r.FormField="FormField",r.Table="Table",r.App="App",r.Text="Text",r.Avatar="Avatar",r.Chat="Chat",r.AvatarGroup="AvatarGroup",r.Badge="Badge",r.Breadcrumbs="Breadcrumbs",r.Anchor="Anchor",r.Button="Button",r.Chart="Chart",r.Icon="Icon",r.ConfirmDialog="ConfirmDialog",r.ContextMenu="ContextMenu",r.CookieConsent="CookieConsent",r.Details="Details",r.Dialog="Dialog",r.Drawer="Drawer",r.Image="Image",r.Map="Map",r.Markdown="Markdown",r.Notification="Notification",r.ProgressBar="ProgressBar",r.Popover="Popover",r.CarouselLayout="CarouselLayout",r.Tooltip="Tooltip",r.MessageInput="MessageInput",r.MessageList="MessageList",r.CustomField="CustomField",r.MenuBar="MenuBar",r.Grid="Grid",r.GridColumn="GridColumn",r.GridGroupColumn="GridGroupColumn",r.VirtualList="VirtualList",r.FormSection="FormSection",r.FormSubSection="FormSubSection",r.Bpmn="Bpmn",r.Workflow="Workflow",r.WorkflowElk="WorkflowElk",r.FormEditor="FormEditor",r.MetricCard="MetricCard",r.Scoreboard="Scoreboard",r.DashboardPanel="DashboardPanel",r.DashboardLayout="DashboardLayout",r.FoldoutLayout="FoldoutLayout",r.HeroSection="HeroSection",r.EmptyState="EmptyState",r.Skeleton="Skeleton",r.Gantt="Gantt",r.PlanningBoard="PlanningBoard",r.Kanban="Kanban",r.Timeline="Timeline",r.ProgressSteps="ProgressSteps",r.Stat="Stat",r.Calendar="Calendar",r.PricingTable="PricingTable",r.OrgChart="OrgChart",r.Heatmap="Heatmap",r.Funnel="Funnel",r.TrendChart="TrendChart",r.FeatureGrid="FeatureGrid",r.Testimonials="Testimonials",r.Faq="Faq",r.CalloutCard="CalloutCard",r.CommentThread="CommentThread",r.FileList="FileList",r.Checklist="Checklist",r.ComparisonCard="ComparisonCard",r.EntityHeader="EntityHeader",r.Meter="Meter",r.TaskProgress="TaskProgress",r.StatusList="StatusList",r.BulletedList="BulletedList",r.Separator="Separator",r.Notice="Notice",r.TaskQueue="TaskQueue",r.ResourceGrid="ResourceGrid",r.OfferCard="OfferCard",r.AddOnPicker="AddOnPicker",r.Ledger="Ledger",r.PaymentPicker="PaymentPicker",r.ProcessMonitor="ProcessMonitor",r))(u||{});class F extends S{constructor(i){if(super(i),i.type!==E.ELEMENT)throw new Error("applyOj can only be used on an element binding")}render(i){return c}update(i,[e]){const o=i.element;for(const[s,l]of Object.entries(e.props??{}))l!==void 0&&(o[s]=l);for(const[s,l]of Object.entries(e.attrs??{}))l===void 0?o.removeAttribute(s):o.setAttribute(s,l);return c}}const P=L(F);function a(r,i){const e=$(r);return w`<${e} ${P({props:i.props,attrs:i.attrs})}>${i.children??c}</${e}>`}const j={loaders:["oj-sp/welcome-page/loader"],render(r){const i=r.component.metadata;return a("oj-sp-welcome-page",{props:{pageTitle:i.title??"",descriptionText:i.subtitle??"",illustrationBackground:i.image??void 0},attrs:{"display-options.responsive-padding":"on",class:r.component.cssClasses||void 0,style:r.component.style||void 0},children:r.component.children?.length?t`
            <div class="oj-flex oj-sm-flex-wrap oj-sm-align-items-center" style="gap: 0.75rem;">
              ${r.component.children.map(e=>r.renderChild(e))}
            </div>
          `:c})}},B={loaders:["oj-sp/foldout-layout/loader","oj-sp/foldout-panel-summarizing/loader"],render(r){const i=r.component.metadata,e=r.component.children??[],o=e.find(n=>n.slot==="overview"),s=i.panels??[],l=s.findIndex(n=>n.open!==!1);return a("oj-sp-foldout-layout",{props:{orientation:i.orientation==="horizontal"?"horizontal":"vertical",selectedPanel:l>=0?l:0},attrs:{class:r.component.cssClasses||void 0,style:r.component.style||void 0},children:t`
        ${o?t`<div slot="overview">${r.renderChild(o)}</div>`:c}
        ${s.map((n,b)=>D(r,n,e.find(v=>v.slot===`panel-${b}`)))}
      `})}};function D(r,i,e){return a("oj-sp-foldout-panel-summarizing",{props:{panelTitle:i.title??""},children:t`
      <div>${e?r.renderChild(e):c}</div>
      ${i.subtitle?t`<div slot="summary">${i.subtitle}</div>`:c}
    `})}const A={loaders:["oj-c/button"],render(r){const i=r.component.metadata,e=o=>o.currentTarget?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId,parameters:i.parameters},bubbles:!0,composed:!0}));return t`<oj-c-button
      id=${r.component.id||c}
      class=${r.component.cssClasses||c}
      style=${r.component.style||c}
      slot=${r.component.slot||c}
      .label=${i.label??""}
      chroming=${I(i.buttonStyle)}
      ?disabled=${!!i.disabled}
      @ojAction=${e}
    ></oj-c-button>`}};function I(r){return String(r)==="primary"?"callToAction":"outlined"}const O={loaders:[],render(r){const i=r.component.metadata,e=i.columns&&i.columns>0?`repeat(${i.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return t`
      <div
        style="display:grid; grid-template-columns:${e}; gap:1rem; padding:1rem; align-items:start; width:100%; box-sizing:border-box;"
      >
        ${(r.component.children??[]).map(o=>r.renderChild(o))}
      </div>
    `}},k={loaders:[],render(r){return t`
      <div class="mateu-rw-scoreboard" style="grid-column:1 / -1;">
        ${(r.component.children??[]).map(i=>r.renderChild(i))}
      </div>
    `}},G={loaders:["oj-sp/dashboard-panel/loader"],render(r){const i=r.component.metadata,e=[];return i.colSpan&&i.colSpan>1&&e.push(`grid-column: span ${i.colSpan}`),i.rowSpan&&i.rowSpan>1&&e.push(`grid-row: span ${i.rowSpan}`),t`<oj-sp-dashboard-panel
      class="mateu-rw-panel"
      .panelTitle=${i.title??""}
      .panelSubtitle=${i.subtitle??""}
      style=${e.length?e.join("; "):c}
      >${(r.component.children??[]).map(o=>r.renderChild(o))}</oj-sp-dashboard-panel
    >`}},_={loaders:["oj-sp/scoreboard-metric-card/loader"],render(r){const i=r.component.metadata,e=`${i.value??""}${i.unit?" "+i.unit:""}`,o=i.trendLabel||i.description||"",s=`flex:1 1 12rem; min-width:12rem;${i.actionId?" cursor:pointer;":""}`,l=i.actionId?n=>n.currentTarget?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId,parameters:{}},bubbles:!0,composed:!0})):void 0;return t`<oj-sp-scoreboard-metric-card
      style=${s}
      .cardTitle=${i.title??""}
      .metricText=${e}
      .metaText=${o}
      .trendColor=${R(i.trend)}
      @click=${l}
    ></oj-sp-scoreboard-metric-card>`}};function R(r){return r==="up"?"success":r==="down"?"danger":"neutral"}const N={loaders:[],render(r){const i=r.component.metadata,e=i.badges??[],o=i.facts??[];return t`
      <div class="mateu-rw-entity-header">
        <div class="rw-eh-top">
          <div class="rw-eh-titles">
            <h1 class="rw-eh-title">${i.title??""}</h1>
            ${i.subtitle?t`<div class="rw-eh-subtitle">${i.subtitle}</div>`:c}
            ${e.length?t`<div class="rw-eh-badges">${e.map(s=>H(s))}</div>`:c}
          </div>
          ${i.metricValue?t`<div class="rw-eh-metric">
                <div class="rw-eh-metric-value">${i.metricValue}</div>
                ${i.metricLabel?t`<div class="rw-eh-metric-label">${i.metricLabel}</div>`:c}
                ${i.metricCaption?t`<div class="rw-eh-metric-caption">${i.metricCaption}</div>`:c}
              </div>`:c}
        </div>
        ${o.length?t`<div class="rw-eh-facts">
              ${o.map(s=>t`<div class="rw-eh-fact">
                  <div class="rw-eh-fact-label">${s.label??""}</div>
                  <div class="rw-eh-fact-value">${s.value??""}</div>
                </div>`)}
            </div>`:c}
      </div>
    `}};function H(r){const i=r.color||"neutral";return t`<span class="rw-eh-chip rw-eh-chip--${i}">${r.label??""}</span>`}const h={[u.HeroSection]:j,[u.FoldoutLayout]:B,[u.Button]:A,[u.DashboardLayout]:O,[u.Scoreboard]:k,[u.DashboardPanel]:G,[u.MetricCard]:_,[u.EntityHeader]:N};function Y(r){return r?h[r]:void 0}function q(){return[...new Set(Object.values(h).flatMap(r=>r?.loaders??[]))]}const m="https://static.oracle.com/cdn/jet/19.0.0-2604.8",f="https://static.oracle.com/cdn/spectra-ui/oj-sp/2604.1.0",z=`${m}/3rdparty/require/require.js`,V=`${m}/default/js/bundles-config.js`,W=`${f}/oj-sp-bundle-config.js`,d=r=>new Promise((i,e)=>{const o=document.createElement("script");o.src=r,o.async=!1,o.onload=()=>i(),o.onerror=()=>e(new Error("failed to load "+r)),document.head.appendChild(o)});async function J(){await g(()=>import("./index.js"),__vite__mapDeps([0,1,2,3]));const r=document.getElementById("ui-container"),i=document.getElementById("mateu-ui-holder");r&&i&&i.content.childElementCount>0&&r.appendChild(i.content.cloneNode(!0)),r&&(r.style.display=""),document.getElementById("landing-loader")?.remove()}async function K(){await d(z),await d(V),await d(W);const r=window.require;if(!r)throw new Error("RequireJS did not initialise");r.config({paths:{"oj-sp":f}}),await new Promise((i,e)=>{r(["ojs/ojbootstrap",...q()],()=>i(),e)})}async function Q(){try{await K()}catch(r){console.warn("[redwood-spectra] OJET CDN not available — falling back to the base renderer.",r)}await J()}Q();export{u as C,Y as r};
