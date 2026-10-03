import{n as e}from"./rolldown-runtime-BpQH8Ho1.js";import{gt as t,ht as n,it as r,lt as i,mt as a,pt as ee}from"./index-D7Svh3vn.js";import{n as te}from"./markdown-helpers-CgpK1hns.js";window.Vaadin||={},window.Vaadin.featureFlags||={};function ne(e){return e.replace(/-[a-z]/gu,e=>e[1].toUpperCase())}var o={};function s(e,t=`25.2.6`){if(Object.defineProperty(e,"version",{get(){return t}}),e.experimental){let t=typeof e.experimental==`string`?e.experimental:`${ne(e.is.split(`-`).slice(1).join(`-`))}Component`;if(!window.Vaadin.featureFlags[t]&&!o[t]){o[t]=new Set,o[t].add(e),Object.defineProperty(window.Vaadin.featureFlags,t,{get(){return o[t].size===0},set(e){e&&o[t].size>0&&(o[t].forEach(e=>{customElements.define(e.is,e)}),o[t].clear())}});return}if(o[t]){o[t].add(e);return}}let n=customElements.get(e.is);if(!n)customElements.define(e.is,e);else{let t=n.version;t&&e.version&&t===e.version?console.warn(`The component ${e.is} has been loaded twice`):console.error(`Tried to define ${e.is} version ${e.version} when version ${n.version} is already in use. Something will probably break.`)}}var re=/\/\*[\*!]\s+vaadin-dev-mode:start([\s\S]*)vaadin-dev-mode:end\s+\*\*\//i,c=window.Vaadin&&window.Vaadin.Flow&&window.Vaadin.Flow.clients;function ie(){function e(){return!0}return l(e)}function ae(){try{return oe()?!0:se()?c?!ce():!ie():!1}catch{return!1}}function oe(){return localStorage.getItem(`vaadin.developmentmode.force`)}function se(){return[`localhost`,`127.0.0.1`].indexOf(window.location.hostname)>=0}function ce(){return!!(c&&Object.keys(c).map(e=>c[e]).filter(e=>e.productionMode).length>0)}function l(e,t){if(typeof e!=`function`)return;let n=re.exec(e.toString());if(n)try{e=Function(n[1])}catch(e){console.log(`vaadin-development-mode-detector: uncommentAndRun() failed`,e)}return e(t)}window.Vaadin=window.Vaadin||{};var u=function(e,t){if(window.Vaadin.developmentMode)return l(e,t)};window.Vaadin.developmentMode===void 0&&(window.Vaadin.developmentMode=ae());function le(){}var ue=function(){if(typeof u==`function`)return u(le)},d=0,f=0,p=[],m=!1;function h(){m=!1;let e=p.length;for(let t=0;t<e;t++){let e=p[t];if(e)try{e()}catch(e){setTimeout(()=>{throw e})}}p.splice(0,e),f+=e}var de={after(e){return{run(t){return window.setTimeout(t,e)},cancel(e){window.clearTimeout(e)}}},run(e,t){return window.setTimeout(e,t)},cancel(e){window.clearTimeout(e)}},fe={run(e){return window.requestAnimationFrame(e)},cancel(e){window.cancelAnimationFrame(e)}},g={run(e){return window.requestIdleCallback?window.requestIdleCallback(e):window.setTimeout(e,16)},cancel(e){window.cancelIdleCallback?window.cancelIdleCallback(e):window.clearTimeout(e)}},pe={run(e){m||(m=!0,queueMicrotask(()=>h())),p.push(e);let t=d;return d+=1,t},cancel(e){let t=e-f;if(t>=0){if(!p[t])throw Error(`invalid async handle: ${e}`);p[t]=null}}},_=new Set,v=class e{static debounce(t,n,r){return t instanceof e?t._cancelAsync():t=new e,t.setConfig(n,r),t}constructor(){this._asyncModule=null,this._callback=null,this._timer=null}setConfig(e,t){this._asyncModule=e,this._callback=t,this._timer=this._asyncModule.run(()=>{this._timer=null,_.delete(this),this._callback()})}cancel(){this.isActive()&&(this._cancelAsync(),_.delete(this))}_cancelAsync(){this.isActive()&&(this._asyncModule.cancel(this._timer),this._timer=null)}flush(){this.isActive()&&(this.cancel(),this._callback())}isActive(){return this._timer!=null}};function y(e){_.add(e)}function me(){let e=!!_.size;return _.forEach(e=>{try{e.flush()}catch(e){setTimeout(()=>{throw e})}}),e}var he=()=>{let e;do e=me();while(e)},b=[];function x(e,t,n=e.getAttribute(`dir`)){t?e.setAttribute(`dir`,t):n!=null&&e.removeAttribute(`dir`)}function S(){return document.documentElement.getAttribute(`dir`)}function ge(){let e=S();b.forEach(t=>{x(t,e)})}new MutationObserver(ge).observe(document.documentElement,{attributes:!0,attributeFilter:[`dir`]});var C=e=>class extends e{static get properties(){return{dir:{type:String,value:``,reflectToAttribute:!0,converter:{fromAttribute:e=>e||``,toAttribute:e=>e===``?null:e}}}}get __isRTL(){return this.getAttribute(`dir`)===`rtl`}connectedCallback(){super.connectedCallback(),(!this.hasAttribute(`dir`)||this.__restoreSubscription)&&(this.__subscribe(),x(this,S(),null))}attributeChangedCallback(e,t,n){if(super.attributeChangedCallback(e,t,n),e!==`dir`)return;let r=S(),i=n===r&&b.indexOf(this)===-1,a=!n&&t&&b.indexOf(this)===-1;i||a?(this.__subscribe(),x(this,r,n)):n!==r&&t===r&&this.__unsubscribe()}disconnectedCallback(){super.disconnectedCallback(),this.__restoreSubscription=b.includes(this),this.__unsubscribe()}_valueToNodeAttribute(e,t,n){n===`dir`&&t===``&&!e.hasAttribute(`dir`)||super._valueToNodeAttribute(e,t,n)}_attributeToProperty(e,t,n){e===`dir`&&!t?this.dir=``:super._attributeToProperty(e,t,n)}__subscribe(){b.includes(this)||b.push(this)}__unsubscribe(){b.includes(this)&&b.splice(b.indexOf(this),1)}};window.Vaadin||(window.Vaadin={}),window.Vaadin.registrations||(window.Vaadin.registrations=[]),window.Vaadin.developmentModeCallback||(window.Vaadin.developmentModeCallback={}),window.Vaadin.developmentModeCallback[`vaadin-usage-statistics`]=function(){ue()};var w,T=new Set,E=e=>class extends C(e){static _ensureRegistrations(){let{is:e}=this;if(e&&!T.has(e)){window.Vaadin.registrations.push(this),T.add(e);let t=window.Vaadin.developmentModeCallback;t&&(w=v.debounce(w,g,()=>{t[`vaadin-usage-statistics`]()}),y(w))}}constructor(){super(),document.doctype===null&&console.warn(`Vaadin components require the "standards mode" declaration. Please add <!DOCTYPE html> to the HTML document.`),this.constructor._ensureRegistrations()}},D=new WeakMap;function _e(e,t){let n=t;for(;n;){if(D.get(n)===e)return!0;n=Object.getPrototypeOf(n)}return!1}function O(e){return t=>{if(_e(e,t))return t;let n=e(t);return D.set(n,e),n}}function k(e,t){return e.split(`.`).reduce((e,t)=>e?e[t]:void 0,t)}function ve(e,t,n){let r=e.split(`.`),i=r.pop(),a=r.reduce((e,t)=>e[t],n);a[i]=t}var A={},ye=/([A-Z])/gu;function j(e){return A[e]||(A[e]=e.replace(ye,`-$1`).toLowerCase()),A[e]}function M(e){return e[0].toUpperCase()+e.substring(1)}function N(e){let[t,n]=e.split(`(`);return{method:t,observerProps:n.replace(`)`,``).split(`,`).map(e=>e.trim())}}function P(e,t){return Object.prototype.hasOwnProperty.call(e,t)||(e[t]=new Map(e[t])),e[t]}var F=O(e=>{class t extends e{static enabledWarnings=[];static createProperty(e,t){[String,Boolean,Number,Array].includes(t)&&(t={type:t}),t?.reflectToAttribute&&(t.reflect=!0),super.createProperty(e,t)}static getOrCreateMap(e){return P(this,e)}static finalize(){if(window.litIssuedWarnings&&(window.litIssuedWarnings.add(`no-override-create-property`),window.litIssuedWarnings.add(`no-override-get-property-descriptor`)),super.finalize(),Array.isArray(this.observers)){let e=this.getOrCreateMap(`__complexObservers`);this.observers.forEach(t=>{let{method:n,observerProps:r}=N(t);e.set(n,r)})}}static addCheckedInitializer(e){super.addInitializer(t=>{t instanceof this&&e(t)})}static getPropertyDescriptor(e,t,n){let r=super.getPropertyDescriptor(e,t,n),i=r;if(this.getOrCreateMap(`__propKeys`).set(e,t),n.sync&&(i={get:r.get,set(r){let i=this[e];ee(r,i)&&(this[t]=r,this.requestUpdate(e,i,n),this.hasUpdated&&this.performUpdate())},configurable:!0,enumerable:!0}),n.readOnly){let t=i.set;this.addCheckedInitializer(n=>{n[`_set${M(e)}`]=function(e){t.call(n,e)}}),i={get:i.get,set(){},configurable:!0,enumerable:!0}}if(`value`in n&&this.addCheckedInitializer(t=>{let r=typeof n.value==`function`?n.value.call(t):n.value;n.readOnly?t[`_set${M(e)}`](r):t[e]=r}),n.observer){let t=n.observer;this.getOrCreateMap(`__observers`).set(e,t),this.addCheckedInitializer(e=>{e[t]||console.warn(`observer method ${t} not defined`)})}if(n.notify){if(!this.__notifyProps)this.__notifyProps=new Set;else if(!this.hasOwnProperty(`__notifyProps`)){let e=this.__notifyProps;this.__notifyProps=new Set(e)}this.__notifyProps.add(e)}if(n.computed){let t=`__assignComputed${e}`,r=N(n.computed);this.prototype[t]=function(...t){this[e]=this[r.method](...t)},this.getOrCreateMap(`__computedObservers`).set(t,r.observerProps)}return n.attribute||=j(e),i}static get polylitConfig(){return{asyncFirstRender:!1}}connectedCallback(){super.connectedCallback();let{polylitConfig:e}=this.constructor;!this.hasUpdated&&!e.asyncFirstRender&&this.performUpdate()}firstUpdated(){super.firstUpdated(),this.$||={},this.renderRoot.querySelectorAll(`[id]`).forEach(e=>{this.$[e.id]=e})}ready(){}willUpdate(e){this.constructor.__computedObservers&&this.__runComplexObservers(e,this.constructor.__computedObservers)}updated(e){let t=this.__isReadyInvoked;this.__isReadyInvoked=!0,this.constructor.__observers&&this.__runObservers(e,this.constructor.__observers),this.constructor.__complexObservers&&this.__runComplexObservers(e,this.constructor.__complexObservers),this.__dynamicPropertyObservers&&this.__runDynamicObservers(e,this.__dynamicPropertyObservers),this.__dynamicMethodObservers&&this.__runComplexObservers(e,this.__dynamicMethodObservers),this.constructor.__notifyProps&&this.__runNotifyProps(e,this.constructor.__notifyProps),t||this.ready()}setProperties(e){Object.entries(e).forEach(([e,t])=>{let n=this.constructor.__propKeys.get(e),r=this[n];this[n]=t,this.requestUpdate(e,r)}),this.hasUpdated&&this.performUpdate()}_createMethodObserver(e){let t=P(this,`__dynamicMethodObservers`),{method:n,observerProps:r}=N(e);t.set(n,r)}_createPropertyObserver(e,t){P(this,`__dynamicPropertyObservers`).set(t,e)}__runComplexObservers(e,t){t.forEach((t,n)=>{t.some(t=>e.has(t))&&(this[n]?this[n](...t.map(e=>this[e])):console.warn(`observer method ${n} not defined`))})}__runDynamicObservers(e,t){t.forEach((t,n)=>{e.has(t)&&this[n]&&this[n](this[t],e.get(t))})}__runObservers(e,t){e.forEach((e,n)=>{let r=t.get(n);r!==void 0&&this[r]&&this[r](this[n],e)})}__runNotifyProps(e,t){e.forEach((e,n)=>{t.has(n)&&this.dispatchEvent(new CustomEvent(`${j(n)}-changed`,{detail:{value:this[n]}}))})}_get(e,t){return k(e,t)}_set(e,t,n){ve(e,t,n)}}return t});function I(e){try{CSS.registerProperty(e)}catch(t){if(t instanceof DOMException&&t.name===`InvalidModificationError`)console.warn(`The CSS property ${e.name} has already been registered.`);else throw t}}var L=(e,...t)=>{let n=document.createElement(`style`);n.id=e,n.textContent=t.map(e=>e.toString()).join(`
`),document.head.insertAdjacentElement(`afterbegin`,n)};function be(e){let{baseStyles:t,themeStyles:n,elementStyles:r,lumoInjector:i}=e.constructor,a=e.__lumoStyleSheet;return a?[...i.includeBaseStyles?t??r:[],a,...n??[]]:r}function R(e){a(e.shadowRoot,be(e))}function xe(e,t){e.__lumoStyleSheet=t,R(e)}function Se(e){e.__lumoStyleSheet=void 0,R(e)}var z=e=>class extends e{static get properties(){return{_theme:{type:String,readOnly:!0}}}static get observedAttributes(){return[...super.observedAttributes,`theme`]}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),e===`theme`&&this._set_theme(n)}},B=[],V=new Set,H=new Set;function U(e){return e&&Object.prototype.hasOwnProperty.call(e,`__themes`)}function Ce(e){return U(customElements.get(e))}function W(e=[]){return[e].flat(1/0).filter(e=>e instanceof t||(console.warn("An item in styles is not of type CSSResult. Use `unsafeCSS` or `css`."),!1))}function G(e,t){return(e||``).split(` `).some(e=>RegExp(`^${e.split(`*`).join(`.*`)}$`,`u`).test(t))}function K(e){return e.map(e=>e.cssText).join(`
`)}var q=`vaadin-themable-mixin-style`;function we(e,t){let n=document.createElement(`style`);n.id=q,n.textContent=K(e),t.content.appendChild(n)}function Te(e){if(!e.shadowRoot)return;let t=e.constructor;if(e instanceof r)R(e);else{let n=e.shadowRoot.getElementById(q);n.textContent=t.prototype._template.content.getElementById(q).textContent}}function Ee(e){V.forEach(t=>{let n=t.deref();n instanceof e?Te(n):n||V.delete(t)})}function J(e){if(e.prototype instanceof r)e.elementStyles=e.finalizeStyles(e.styles);else{let t=e.prototype._template;t.content.getElementById(q).textContent=K(e.getStylesForThis())}H.forEach(t=>{let n=customElements.get(t);n!==e&&n.prototype instanceof e&&J(n)})}function De(e,t){let n=e.__themes;return!n||!t?!1:n.some(e=>e.styles.some(e=>t.some(t=>t.cssText===e.cssText)))}function Oe(e,t,n={}){t=W(t),B.push({themeFor:e,styles:t,include:n.include,moduleId:n.moduleId}),e&&H.forEach(n=>{if(G(e,n)&&Ce(n)){let e=customElements.get(n);De(e,t)?console.warn(`Registering styles that already exist for ${n}`):(!window.Vaadin||!window.Vaadin.suppressPostFinalizeStylesWarning)&&console.warn(`The custom element definition for "${n}" was finalized before a style module was registered. Ideally, import component specific style modules before importing the corresponding custom element. This warning can be suppressed by setting "window.Vaadin.suppressPostFinalizeStylesWarning = true".`),J(e),Ee(e)}})}function ke(e=``){let t=0;return e.startsWith(`lumo-`)||e.startsWith(`material-`)?t=1:e.startsWith(`vaadin-`)&&(t=2),t}function Y(e){let t=[];return e.include&&[].concat(e.include).forEach(e=>{let n=B.find(t=>t.moduleId===e);n?t.push(...Y(n),...n.styles):console.warn(`Included moduleId ${e} not found in style registry`)},e.styles),t}function Ae(e){let t=`${e}-default-theme`,n=B.filter(n=>n.moduleId!==t&&G(n.themeFor,e)).map(e=>({...e,styles:[...Y(e),...e.styles],includePriority:ke(e.moduleId)})).sort((e,t)=>t.includePriority-e.includePriority);return n.length>0?n:B.filter(e=>e.moduleId===t)}var X=e=>class extends z(e){constructor(){super(),V.add(new WeakRef(this))}static finalize(){if(super.finalize(),this.is&&H.add(this.is),this.elementStyles)return;let e=this.prototype._template;!e||U(this)||we(this.getStylesForThis(),e)}static finalizeStyles(e){return this.baseStyles=e?[e].flat(1/0):[],this.themeStyles=this.getStylesForThis(),[...this.baseStyles,...this.themeStyles]}static getStylesForThis(){let t=e.__themes||[],n=Object.getPrototypeOf(this.prototype),r=(n?n.constructor.__themes:[])||[];this.__themes=[...t,...r,...Ae(this.is)];let i=this.__themes.flatMap(e=>e.styles);return i.filter((e,t)=>t===i.lastIndexOf(e))}};[`--vaadin-text-color`,`--vaadin-text-color-disabled`,`--vaadin-text-color-secondary`,`--vaadin-border-color`,`--vaadin-border-color-secondary`,`--vaadin-background-color`].forEach(e=>{I({name:e,syntax:`<color>`,inherits:!0,initialValue:`transparent`})}),L(`vaadin-base`,n`
    @layer vaadin.base {
      html {
        /* Background color */
        --vaadin-background-color: light-dark(#fff, #222);

        /* Container colors */
        --vaadin-background-container: color-mix(in oklab, var(--vaadin-text-color) 5%, var(--vaadin-background-color));
        --vaadin-background-container-strong: color-mix(
          in oklab,
          var(--vaadin-text-color) 10%,
          var(--vaadin-background-color)
        );

        /* Border colors */
        --vaadin-border-color-secondary: color-mix(in oklab, var(--vaadin-text-color) 24%, transparent);
        --vaadin-border-color: color-mix(in oklab, var(--vaadin-text-color) 48%, transparent); /* Above 3:1 contrast */

        /* Text colors */
        /* Above 3:1 contrast */
        --vaadin-text-color-disabled: color-mix(in oklab, var(--vaadin-text-color) 48%, transparent);
        /* Above 4.5:1 contrast */
        --vaadin-text-color-secondary: color-mix(in oklab, var(--vaadin-text-color) 68%, transparent);
        /* Above 7:1 contrast */
        --vaadin-text-color: light-dark(#1f1f1f, white);

        /* Padding */
        --vaadin-padding-xs: 6px;
        --vaadin-padding-s: 8px;
        --vaadin-padding-m: 12px;
        --vaadin-padding-l: 16px;
        --vaadin-padding-xl: 24px;
        --vaadin-padding-block-container: var(--vaadin-padding-xs);
        --vaadin-padding-inline-container: var(--vaadin-padding-s);

        /* Gap/spacing */
        --vaadin-gap-xs: 6px;
        --vaadin-gap-s: 8px;
        --vaadin-gap-m: 12px;
        --vaadin-gap-l: 16px;
        --vaadin-gap-xl: 24px;

        /* Border radius */
        --vaadin-radius-s: 3px;
        --vaadin-radius-m: 6px;
        --vaadin-radius-l: 12px;

        /* Focus outline */
        --vaadin-focus-ring-width: 2px;
        --vaadin-focus-ring-color: var(--vaadin-text-color);

        /* Icons, used as mask-image */
        --_vaadin-icon-arrow-up: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>');
        --_vaadin-icon-calendar: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>');
        --_vaadin-icon-checkmark: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>');
        --_vaadin-icon-chevron-down: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>');
        --_vaadin-icon-chevron-right: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>');
        --_vaadin-icon-clock: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>');
        --_vaadin-icon-cross: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>');
        --_vaadin-icon-drag: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M11 7c0 .82843-.6716 1.5-1.5 1.5C8.67157 8.5 8 7.82843 8 7s.67157-1.5 1.5-1.5c.8284 0 1.5.67157 1.5 1.5Zm0 5c0 .8284-.6716 1.5-1.5 1.5-.82843 0-1.5-.6716-1.5-1.5s.67157-1.5 1.5-1.5c.8284 0 1.5.6716 1.5 1.5Zm0 5c0 .8284-.6716 1.5-1.5 1.5-.82843 0-1.5-.6716-1.5-1.5s.67157-1.5 1.5-1.5c.8284 0 1.5.6716 1.5 1.5Zm5-10c0 .82843-.6716 1.5-1.5 1.5S13 7.82843 13 7s.6716-1.5 1.5-1.5S16 6.17157 16 7Zm0 5c0 .8284-.6716 1.5-1.5 1.5S13 12.8284 13 12s.6716-1.5 1.5-1.5 1.5.6716 1.5 1.5Zm0 5c0 .8284-.6716 1.5-1.5 1.5S13 17.8284 13 17s.6716-1.5 1.5-1.5 1.5.6716 1.5 1.5Z" fill="currentColor"/></svg>');
        --_vaadin-icon-ellipsis: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>');
        --_vaadin-icon-eye: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>');
        --_vaadin-icon-eye-slash: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>');
        --_vaadin-icon-file: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>');
        --_vaadin-icon-fullscreen: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>');
        --_vaadin-icon-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>');
        --_vaadin-icon-link: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>');
        --_vaadin-icon-menu: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>');
        --_vaadin-icon-minus: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>');
        --_vaadin-icon-paper-airplane: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>');
        --_vaadin-icon-pen: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>');
        --_vaadin-icon-play: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>');
        --_vaadin-icon-plus: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>');
        --_vaadin-icon-redo: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>');
        --_vaadin-icon-refresh: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M22 10C22 10 19.995 7.26822 18.3662 5.63824C16.7373 4.00827 14.4864 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.1031 21 19.5649 18.2543 20.6482 14.5M22 10V4M22 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
        --_vaadin-icon-resize: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.5303 7.46967c.2929.29289.2929.76777 0 1.06066L8.53033 18.5304c-.29289.2929-.76777.2929-1.06066 0s-.29289-.7678 0-1.0607L17.4697 7.46967c.2929-.29289.7677-.29289 1.0606 0Zm0 4.50003c.2929.2929.2929.7678 0 1.0607l-5.5 5.5c-.2929.2928-.7677.2928-1.0606 0-.2929-.2929-.2929-.7678 0-1.0607l5.4999-5.5c.2929-.2929.7678-.2929 1.0607 0Zm0 4.5c.2929.2928.2929.7677 0 1.0606l-1 1.0001c-.2929.2928-.7677.2929-1.0606 0-.2929-.2929-.2929-.7678 0-1.0607l1-1c.2929-.2929.7677-.2929 1.0606 0Z" fill="currentColor"/></svg>');
        --_vaadin-icon-slash: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect x="13.7812" y="4.22583" width="1.5" height="16" rx="0.75" transform="rotate(20 13.7812 4.22583)" fill="currentColor"/></svg>');
        --_vaadin-icon-sort: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none"><path d="M7.49854 6.99951C7.92795 6.99951 8.15791 7.50528 7.87549 7.82861L4.37646 11.8296C4.17728 12.0571 3.82272 12.0571 3.62354 11.8296L0.125488 7.82861C-0.157248 7.50531 0.0719873 6.99956 0.501465 6.99951H7.49854ZM3.62354 0.17041C3.82275 -0.0573875 4.17725 -0.0573848 4.37646 0.17041L7.87549 4.17041C8.15825 4.49373 7.92806 5.00049 7.49854 5.00049L0.501465 4.99951C0.0719873 4.99946 -0.157248 4.49371 0.125488 4.17041L3.62354 0.17041Z" fill="black"/></svg>');
        --_vaadin-icon-undo: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>');
        --_vaadin-icon-upload: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>');
        --_vaadin-icon-user: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>');
        --_vaadin-icon-warn: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>');

        /* Cursors for interactive elements */
        --vaadin-clickable-cursor: pointer;
        --vaadin-disabled-cursor: not-allowed;

        /* Use units so that the values can be used in calc() */
        --safe-area-inset-top: env(safe-area-inset-top, 0px);
        --safe-area-inset-right: env(safe-area-inset-right, 0px);
        --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
        --safe-area-inset-left: env(safe-area-inset-left, 0px);
        --safe-area-inset-inline-start: var(--safe-area-inset-left);
        --safe-area-inset-inline-end: var(--safe-area-inset-right);

        &:dir(rtl) {
          --safe-area-inset-inline-start: var(--safe-area-inset-right);
          --safe-area-inset-inline-end: var(--safe-area-inset-left);
        }
      }

      @supports not (color: hsl(0 0 0)) {
        html {
          --_vaadin-safari-17-deg: 1deg;
        }
      }

      @media (forced-colors: active) {
        html {
          --vaadin-background-color: Canvas;
          --vaadin-border-color: CanvasText;
          --vaadin-border-color-secondary: CanvasText;
          --vaadin-text-color-disabled: CanvasText;
          --vaadin-text-color-secondary: CanvasText;
          --vaadin-text-color: CanvasText;
          --vaadin-icon-color: CanvasText;
          --vaadin-focus-ring-color: Highlight;
        }
      }
    }
  `);var Z=new WeakMap;function je(e){return Z.has(e)||Z.set(e,new Set),Z.get(e)}function Me(e,t){let n=document.createElement(`style`);n.textContent=e,t===document?document.head.appendChild(n):t.insertBefore(n,t.firstChild)}var Q=O(e=>class extends e{get slotStyles(){return[]}connectedCallback(){super.connectedCallback(),this.__applySlotStyles()}__applySlotStyles(){let e=this.getRootNode(),t=je(e);this.slotStyles.forEach(n=>{t.has(n)||(Me(n,e),t.add(n))})}}),Ne=n`
  @layer vaadin.base {
    vaadin-markdown {
      line-height: 1.6;

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-weight: 600;
        line-height: 1.25;
        text-wrap: balance;
      }

      h1 {
        font-size: 1.75em;
        margin-top: 1.8em;
        margin-bottom: 0.9em;
      }

      h2 {
        font-size: 1.5em;
        margin-top: 1.6em;
        margin-bottom: 0.8em;
      }

      h3 {
        font-size: 1.25em;
        margin-top: 1.4em;
        margin-bottom: 0.7em;
      }

      h4 {
        font-size: 1.125em;
        margin-top: 1.2em;
        margin-bottom: 0.6em;
      }

      h5 {
        font-size: 1em;
        margin-top: 1em;
        margin-bottom: 0.5em;
      }

      h6 {
        font-size: 0.875em;
        margin-top: 1em;
        margin-bottom: 0.5em;
      }

      p,
      ul,
      ol,
      blockquote,
      table,
      figure {
        margin-inline: 0;
        margin-block: 1.25em;
      }

      code {
        font-family: ui-monospace, monospace;
        font-size: 0.9em;
        line-height: 1.25;
        font-weight: 500;
        background-color: var(--vaadin-background-container);
        border-radius: var(--vaadin-radius-s);
        padding: 0.125em 0.25em;
      }

      pre {
        background-color: light-dark(var(--vaadin-text-color), var(--vaadin-background-container));
        border-radius: var(--vaadin-radius-m);
        color: light-dark(var(--vaadin-background-color), var(--vaadin-text-color));
        padding: var(--vaadin-padding-m);

        code {
          font-weight: 500;
          background: none;
          padding: 0;
        }
      }

      hr {
        height: 0;
        border: 0;
        border-top: 1px solid var(--vaadin-border-color-secondary);
        margin-block: 3em;
      }

      b,
      strong {
        font-weight: 600;
      }

      blockquote {
        font-weight: 500;
        font-style: italic;
        border-left: 0.25rem solid var(--vaadin-border-color);
        quotes: '\\201C' '\\201D' '\\2018' '\\2019';
        margin-inline: 0;
        padding-inline-start: 1em;
      }

      ul {
        list-style-type: disc;
      }

      ul,
      ol {
        padding-inline-start: 1.625em;
      }

      li {
        margin-block: 0.5em;
        padding-inline-start: 0.375em;

        &::marker {
          color: var(--vaadin-text-color-disabled);
        }
      }

      ol li::marker {
        font-weight: 400;
        color: var(--vaadin-text-color-secondary);
      }

      ul:has(> li > input[type='checkbox']:first-child) {
        list-style: none;
        padding-inline-start: 0;
      }

      img,
      video,
      svg,
      canvas,
      audio,
      iframe,
      embed,
      object {
        display: block;
      }

      img,
      video {
        max-width: 100%;
        height: auto;
        border-radius: var(--vaadin-radius-m);
      }

      figcaption {
        font-size: 0.875em;
        line-height: 1.125;
        color: var(--vaadin-text-color-secondary);
        margin-top: 0.75em;
      }

      table {
        min-width: 100%;
        border-spacing: 0;
      }

      th {
        text-align: start;
        font-weight: 500;
        background: var(--vaadin-background-container);
      }

      th,
      td {
        padding: var(--vaadin-padding-block-container) var(--vaadin-padding-inline-container);
      }

      tr:not(:last-child) {
        th,
        td {
          border-bottom: 1px solid var(--vaadin-border-color-secondary);
        }
      }
    }
  }
`,Pe=e({Markdown:()=>$}),$=class extends Q(E(X(F(r)))){static get is(){return`vaadin-markdown`}static get styles(){return n`
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }
    `}get slotStyles(){return[Ne]}static get properties(){return{content:{type:String,sync:!0}}}render(){return i`<slot></slot>`}updated(e){super.updated(e),e.has(`content`)&&te(this,this.content)}};s($);export{s as S,he as _,z as a,pe as b,L as c,k as d,O as f,y as g,v as h,Oe as i,I as l,C as m,Q as n,xe as o,E as p,X as r,Se as s,Pe as t,F as u,fe as v,de as x,g as y};