const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./mateu-mobile-qr-dialog-CZLzAlAE.js","./focusTrap-CzU2IbJu.js","./lit-Ca8Nedot.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-hePW80VL.js";import{a as t,c as n,i as r,l as i,n as a,o,s,t as c}from"./focusTrap-CzU2IbJu.js";import{a as l,c as u,h as d,l as f,n as p,o as m,p as h,s as g,t as _}from"./lit-Ca8Nedot.js";import{t as v}from"./purify.es-DmVU2mR8.js";var ee=(e,t,n)=>(n.configurable=!0,n.enumerable=!0,Reflect.decorate&&typeof t!=`object`&&Object.defineProperty(e,t,n),n);function te(e,t){return(n,r,i)=>{let a=t=>t.renderRoot?.querySelector(e)??null;if(t){let{get:e,set:t}=typeof r==`object`?n:i??(()=>{let e=Symbol();return{get(){return this[e]},set(t){this[e]=t}}})();return ee(n,r,{get(){let n=e.call(this);return n===void 0&&(n=a(this),(n!==null||this.hasUpdated)&&t.call(this,n)),n}})}return ee(n,r,{get(){return a(this)}})}}function ne(e){let t=``;for(let n of e)switch(n){case`"`:t+=`\\"`;break;case`\\`:t+=`\\\\`;break;case`
`:t+=`\\n`;break;case`\r`:t+=`\\r`;break;case`	`:t+=`\\t`;break;case`\b`:t+=`\\b`;break;case`\f`:t+=`\\f`;break;default:t+=n<` `?`\\u`+n.charCodeAt(0).toString(16).padStart(4,`0`):n}return t}function re(e){if(typeof e==`string`)return ne(e);if(Array.isArray(e))return e.map(re);if(e&&typeof e==`object`){let t={};for(let[n,r]of Object.entries(e))t[n]=re(r);return t}return e}function ie(e){return e?Object.entries(e).some(([e,t])=>e.toLowerCase()===`content-type`&&(t??``).toLowerCase().includes(`json`)):!1}var y=[],ae=e=>{y=Array.isArray(e)?e:[]},oe=e=>e?y.find(t=>t.name===e):void 0,se=()=>y,ce=e=>e==null||e===``,le=e=>{if(!e?.ref)return e;let t=oe(e.ref);if(!t?.source)return console.warn(`mateu: no REST source named "${e.ref}" in the app's catalogue`),e;let n=t.source;return{...e,url:ce(e.url)?n.url:e.url,method:ce(e.method)?n.method:e.method,headers:e.headers&&Object.keys(e.headers).length>0?e.headers:n.headers,body:ce(e.body)?n.body:e.body,itemsPath:ce(e.itemsPath)?n.itemsPath:e.itemsPath,valuePath:ce(e.valuePath)?n.valuePath:e.valuePath,labelPath:ce(e.labelPath)?n.labelPath:e.labelPath,proxy:e.proxy||n.proxy,sample:e.sample!==void 0&&e.sample!==null?e.sample:t.sample??n.sample}},ue=!1,de=e=>{ue=!!e},b=e=>{if(!ue||!e)return;let t=le(e);return t?.sample===null?void 0:t?.sample},fe=e=>b(e)!==void 0,pe=e=>!!e&&!!le(e)?.proxy&&!fe(e),me=(e,t)=>{let n=oe(e?.ref)?.fields?.[t];return n&&n!==``?n:t},he=e=>oe(e?.ref)?.totalPath||void 0,ge=h`
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
`,x=h`
    :where(a:any-link) {
        color: var(--mateu-link-color, var(--lumo-primary-text-color, #1676f3));
    }
`,_e=`modulepreload`,ve=function(e,t){return new URL(e,t).href},ye={},be=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=ve(t,n),t=s(t),t in ye)return;ye[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:_e,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},S=function(e,t){return S=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},S(e,t)};function xe(e,t){if(typeof t!=`function`&&t!==null)throw TypeError(`Class extends value `+String(t)+` is not a constructor or null`);S(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}function Se(e){var t=typeof Symbol==`function`&&Symbol.iterator,n=t&&e[t],r=0;if(n)return n.call(e);if(e&&typeof e.length==`number`)return{next:function(){return e&&r>=e.length&&(e=void 0),{value:e&&e[r++],done:!e}}};throw TypeError(t?`Object is not iterable.`:`Symbol.iterator is not defined.`)}function Ce(e,t){var n=typeof Symbol==`function`&&e[Symbol.iterator];if(!n)return e;var r=n.call(e),i,a=[],o;try{for(;(t===void 0||t-->0)&&!(i=r.next()).done;)a.push(i.value)}catch(e){o={error:e}}finally{try{i&&!i.done&&(n=r.return)&&n.call(r)}finally{if(o)throw o.error}}return a}function we(e,t,n){if(n||arguments.length===2)for(var r=0,i=t.length,a;r<i;r++)(a||!(r in t))&&(a||=Array.prototype.slice.call(t,0,r),a[r]=t[r]);return e.concat(a||Array.prototype.slice.call(t))}function Te(e){return typeof e==`function`}function Ee(e){var t=e(function(e){Error.call(e),e.stack=Error().stack});return t.prototype=Object.create(Error.prototype),t.prototype.constructor=t,t}var De=Ee(function(e){return function(t){e(this),this.message=t?t.length+` errors occurred during unsubscription:
`+t.map(function(e,t){return t+1+`) `+e.toString()}).join(`
  `):``,this.name=`UnsubscriptionError`,this.errors=t}});function Oe(e,t){if(e){var n=e.indexOf(t);0<=n&&e.splice(n,1)}}var ke=function(){function e(e){this.initialTeardown=e,this.closed=!1,this._parentage=null,this._finalizers=null}return e.prototype.unsubscribe=function(){var e,t,n,r,i;if(!this.closed){this.closed=!0;var a=this._parentage;if(a){if(this._parentage=null,Array.isArray(a))try{for(var o=Se(a),s=o.next();!s.done;s=o.next())s.value.remove(this)}catch(t){e={error:t}}finally{try{s&&!s.done&&(t=o.return)&&t.call(o)}finally{if(e)throw e.error}}else a.remove(this)}var c=this.initialTeardown;if(Te(c))try{c()}catch(e){i=e instanceof De?e.errors:[e]}var l=this._finalizers;if(l){this._finalizers=null;try{for(var u=Se(l),d=u.next();!d.done;d=u.next()){var f=d.value;try{Me(f)}catch(e){i??=[],e instanceof De?i=we(we([],Ce(i)),Ce(e.errors)):i.push(e)}}}catch(e){n={error:e}}finally{try{d&&!d.done&&(r=u.return)&&r.call(u)}finally{if(n)throw n.error}}}if(i)throw new De(i)}},e.prototype.add=function(t){if(t&&t!==this){if(this.closed)Me(t);else{if(t instanceof e){if(t.closed||t._hasParent(this))return;t._addParent(this)}(this._finalizers=this._finalizers??[]).push(t)}}},e.prototype._hasParent=function(e){var t=this._parentage;return t===e||Array.isArray(t)&&t.includes(e)},e.prototype._addParent=function(e){var t=this._parentage;this._parentage=Array.isArray(t)?(t.push(e),t):t?[t,e]:e},e.prototype._removeParent=function(e){var t=this._parentage;t===e?this._parentage=null:Array.isArray(t)&&Oe(t,e)},e.prototype.remove=function(t){var n=this._finalizers;n&&Oe(n,t),t instanceof e&&t._removeParent(this)},e.EMPTY=(function(){var t=new e;return t.closed=!0,t})(),e}(),Ae=ke.EMPTY;function je(e){return e instanceof ke||e&&`closed`in e&&Te(e.remove)&&Te(e.add)&&Te(e.unsubscribe)}function Me(e){Te(e)?e():e.unsubscribe()}var Ne={onUnhandledError:null,onStoppedNotification:null,Promise:void 0,useDeprecatedSynchronousErrorHandling:!1,useDeprecatedNextContext:!1},Pe={setTimeout:function(e,t){var n=[...arguments].slice(2),r=Pe.delegate;return r?.setTimeout?r.setTimeout.apply(r,we([e,t],Ce(n))):setTimeout.apply(void 0,we([e,t],Ce(n)))},clearTimeout:function(e){return(Pe.delegate?.clearTimeout||clearTimeout)(e)},delegate:void 0};function Fe(e){Pe.setTimeout(function(){var t=Ne.onUnhandledError;if(t)t(e);else throw e})}function Ie(){}var Le=(function(){return Be(`C`,void 0,void 0)})();function Re(e){return Be(`E`,void 0,e)}function ze(e){return Be(`N`,e,void 0)}function Be(e,t,n){return{kind:e,value:t,error:n}}var Ve=null;function He(e){if(Ne.useDeprecatedSynchronousErrorHandling){var t=!Ve;if(t&&(Ve={errorThrown:!1,error:null}),e(),t){var n=Ve,r=n.errorThrown,i=n.error;if(Ve=null,r)throw i}}else e()}function Ue(e){Ne.useDeprecatedSynchronousErrorHandling&&Ve&&(Ve.errorThrown=!0,Ve.error=e)}var We=function(e){xe(t,e);function t(t){var n=e.call(this)||this;return n.isStopped=!1,t?(n.destination=t,je(t)&&t.add(n)):n.destination=Qe,n}return t.create=function(e,t,n){return new Je(e,t,n)},t.prototype.next=function(e){this.isStopped?Ze(ze(e),this):this._next(e)},t.prototype.error=function(e){this.isStopped?Ze(Re(e),this):(this.isStopped=!0,this._error(e))},t.prototype.complete=function(){this.isStopped?Ze(Le,this):(this.isStopped=!0,this._complete())},t.prototype.unsubscribe=function(){this.closed||(this.isStopped=!0,e.prototype.unsubscribe.call(this),this.destination=null)},t.prototype._next=function(e){this.destination.next(e)},t.prototype._error=function(e){try{this.destination.error(e)}finally{this.unsubscribe()}},t.prototype._complete=function(){try{this.destination.complete()}finally{this.unsubscribe()}},t}(ke),Ge=Function.prototype.bind;function Ke(e,t){return Ge.call(e,t)}var qe=function(){function e(e){this.partialObserver=e}return e.prototype.next=function(e){var t=this.partialObserver;if(t.next)try{t.next(e)}catch(e){Ye(e)}},e.prototype.error=function(e){var t=this.partialObserver;if(t.error)try{t.error(e)}catch(e){Ye(e)}else Ye(e)},e.prototype.complete=function(){var e=this.partialObserver;if(e.complete)try{e.complete()}catch(e){Ye(e)}},e}(),Je=function(e){xe(t,e);function t(t,n,r){var i=e.call(this)||this,a;if(Te(t)||!t)a={next:t??void 0,error:n??void 0,complete:r??void 0};else{var o;i&&Ne.useDeprecatedNextContext?(o=Object.create(t),o.unsubscribe=function(){return i.unsubscribe()},a={next:t.next&&Ke(t.next,o),error:t.error&&Ke(t.error,o),complete:t.complete&&Ke(t.complete,o)}):a=t}return i.destination=new qe(a),i}return t}(We);function Ye(e){Ne.useDeprecatedSynchronousErrorHandling?Ue(e):Fe(e)}function Xe(e){throw e}function Ze(e,t){var n=Ne.onStoppedNotification;n&&Pe.setTimeout(function(){return n(e,t)})}var Qe={closed:!0,next:Ie,error:Xe,complete:Ie},$e=(function(){return typeof Symbol==`function`&&Symbol.observable||`@@observable`})();function et(e){return e}function tt(e){return e.length===0?et:e.length===1?e[0]:function(t){return e.reduce(function(e,t){return t(e)},t)}}var nt=function(){function e(e){e&&(this._subscribe=e)}return e.prototype.lift=function(t){var n=new e;return n.source=this,n.operator=t,n},e.prototype.subscribe=function(e,t,n){var r=this,i=at(e)?e:new Je(e,t,n);return He(function(){var e=r,t=e.operator,n=e.source;i.add(t?t.call(i,n):n?r._subscribe(i):r._trySubscribe(i))}),i},e.prototype._trySubscribe=function(e){try{return this._subscribe(e)}catch(t){e.error(t)}},e.prototype.forEach=function(e,t){var n=this;return t=rt(t),new t(function(t,r){var i=new Je({next:function(t){try{e(t)}catch(e){r(e),i.unsubscribe()}},error:r,complete:t});n.subscribe(i)})},e.prototype._subscribe=function(e){return this.source?.subscribe(e)},e.prototype[$e]=function(){return this},e.prototype.pipe=function(){return tt([...arguments])(this)},e.prototype.toPromise=function(e){var t=this;return e=rt(e),new e(function(e,n){var r;t.subscribe(function(e){return r=e},function(e){return n(e)},function(){return e(r)})})},e.create=function(t){return new e(t)},e}();function rt(e){return e??Ne.Promise??Promise}function it(e){return e&&Te(e.next)&&Te(e.error)&&Te(e.complete)}function at(e){return e&&e instanceof We||it(e)&&je(e)}var ot=Ee(function(e){return function(){e(this),this.name=`ObjectUnsubscribedError`,this.message=`object unsubscribed`}}),st=function(e){xe(t,e);function t(){var t=e.call(this)||this;return t.closed=!1,t.currentObservers=null,t.observers=[],t.isStopped=!1,t.hasError=!1,t.thrownError=null,t}return t.prototype.lift=function(e){var t=new ct(this,this);return t.operator=e,t},t.prototype._throwIfClosed=function(){if(this.closed)throw new ot},t.prototype.next=function(e){var t=this;He(function(){var n,r;if(t._throwIfClosed(),!t.isStopped){t.currentObservers||=Array.from(t.observers);try{for(var i=Se(t.currentObservers),a=i.next();!a.done;a=i.next())a.value.next(e)}catch(e){n={error:e}}finally{try{a&&!a.done&&(r=i.return)&&r.call(i)}finally{if(n)throw n.error}}}})},t.prototype.error=function(e){var t=this;He(function(){if(t._throwIfClosed(),!t.isStopped){t.hasError=t.isStopped=!0,t.thrownError=e;for(var n=t.observers;n.length;)n.shift().error(e)}})},t.prototype.complete=function(){var e=this;He(function(){if(e._throwIfClosed(),!e.isStopped){e.isStopped=!0;for(var t=e.observers;t.length;)t.shift().complete()}})},t.prototype.unsubscribe=function(){this.isStopped=this.closed=!0,this.observers=this.currentObservers=null},Object.defineProperty(t.prototype,"observed",{get:function(){return this.observers?.length>0},enumerable:!1,configurable:!0}),t.prototype._trySubscribe=function(t){return this._throwIfClosed(),e.prototype._trySubscribe.call(this,t)},t.prototype._subscribe=function(e){return this._throwIfClosed(),this._checkFinalizedStatuses(e),this._innerSubscribe(e)},t.prototype._innerSubscribe=function(e){var t=this,n=this,r=n.hasError,i=n.isStopped,a=n.observers;return r||i?Ae:(this.currentObservers=null,a.push(e),new ke(function(){t.currentObservers=null,Oe(a,e)}))},t.prototype._checkFinalizedStatuses=function(e){var t=this,n=t.hasError,r=t.thrownError,i=t.isStopped;n?e.error(r):i&&e.complete()},t.prototype.asObservable=function(){var e=new nt;return e.source=this,e},t.create=function(e,t){return new ct(e,t)},t}(nt),ct=function(e){xe(t,e);function t(t,n){var r=e.call(this)||this;return r.destination=t,r.source=n,r}return t.prototype.next=function(e){var t,n;(n=(t=this.destination)?.next)==null||n.call(t,e)},t.prototype.error=function(e){var t,n;(n=(t=this.destination)?.error)==null||n.call(t,e)},t.prototype.complete=function(){var e,t;(t=(e=this.destination)?.complete)==null||t.call(e)},t.prototype._subscribe=function(e){return this.source?.subscribe(e)??Ae},t}(st);new class{constructor(){this.ui=void 0,this.loading=!1,this.config={},this.sharedData={},this.userData={},this.appData={},this.runtimeData={}}};var lt=new st,ut={value:{}},dt={value:{}},C=function(e){return e.ServerSide=`ServerSide`,e.ClientSide=`ClientSide`,e}({}),w=function(e){return e.Page=`Page`,e.Div=`Div`,e.Element=`Element`,e.MicroFrontend=`MicroFrontend`,e.Form=`Form`,e.Crud=`Crud`,e.Result=`Result`,e.Card=`Card`,e.Directory=`Directory`,e.Stepper=`Stepper`,e.HorizontalLayout=`HorizontalLayout`,e.VerticalLayout=`VerticalLayout`,e.SplitLayout=`SplitLayout`,e.MasterDetailLayout=`MasterDetailLayout`,e.TabLayout=`TabLayout`,e.AccordionLayout=`AccordionLayout`,e.FormLayout=`FormLayout`,e.FormRow=`FormRow`,e.FormItem=`FormItem`,e.BoardLayout=`BoardLayout`,e.BoardLayoutRow=`BoardLayoutRow`,e.BoardLayoutItem=`BoardLayoutItem`,e.Scroller=`Scroller`,e.FullWidth=`FullWidth`,e.Container=`Container`,e.FormField=`FormField`,e.Table=`Table`,e.App=`App`,e.Text=`Text`,e.Avatar=`Avatar`,e.Chat=`Chat`,e.AvatarGroup=`AvatarGroup`,e.Badge=`Badge`,e.Breadcrumbs=`Breadcrumbs`,e.Anchor=`Anchor`,e.Button=`Button`,e.Chart=`Chart`,e.Icon=`Icon`,e.ConfirmDialog=`ConfirmDialog`,e.ContextMenu=`ContextMenu`,e.CookieConsent=`CookieConsent`,e.Details=`Details`,e.Dialog=`Dialog`,e.Drawer=`Drawer`,e.Image=`Image`,e.Map=`Map`,e.Markdown=`Markdown`,e.Notification=`Notification`,e.ProgressBar=`ProgressBar`,e.Popover=`Popover`,e.CarouselLayout=`CarouselLayout`,e.Tooltip=`Tooltip`,e.MessageInput=`MessageInput`,e.MessageList=`MessageList`,e.CustomField=`CustomField`,e.MenuBar=`MenuBar`,e.Grid=`Grid`,e.GridColumn=`GridColumn`,e.GridGroupColumn=`GridGroupColumn`,e.VirtualList=`VirtualList`,e.FormSection=`FormSection`,e.FormSubSection=`FormSubSection`,e.Bpmn=`Bpmn`,e.Workflow=`Workflow`,e.FormEditor=`FormEditor`,e.MetricCard=`MetricCard`,e.Scoreboard=`Scoreboard`,e.DashboardPanel=`DashboardPanel`,e.DashboardLayout=`DashboardLayout`,e.ResponsiveGrid=`ResponsiveGrid`,e.FoldoutLayout=`FoldoutLayout`,e.ContentLayout=`ContentLayout`,e.HeroSection=`HeroSection`,e.EmptyState=`EmptyState`,e.Skeleton=`Skeleton`,e.Gantt=`Gantt`,e.PlanningBoard=`PlanningBoard`,e.Kanban=`Kanban`,e.Timeline=`Timeline`,e.ProgressSteps=`ProgressSteps`,e.Stat=`Stat`,e.Calendar=`Calendar`,e.PricingTable=`PricingTable`,e.OrgChart=`OrgChart`,e.Heatmap=`Heatmap`,e.Funnel=`Funnel`,e.TrendChart=`TrendChart`,e.FeatureGrid=`FeatureGrid`,e.Testimonials=`Testimonials`,e.Faq=`Faq`,e.CalloutCard=`CalloutCard`,e.CommentThread=`CommentThread`,e.FileList=`FileList`,e.Checklist=`Checklist`,e.ComparisonCard=`ComparisonCard`,e.EntityHeader=`EntityHeader`,e.Meter=`Meter`,e.TaskProgress=`TaskProgress`,e.StatusList=`StatusList`,e.BulletedList=`BulletedList`,e.ActionPanel=`ActionPanel`,e.MatrixGrid=`MatrixGrid`,e.DropZone=`DropZone`,e.Separator=`Separator`,e.CustomComponent=`CustomComponent`,e.Notice=`Notice`,e.TaskQueue=`TaskQueue`,e.ResourceGrid=`ResourceGrid`,e.OfferCard=`OfferCard`,e.AddOnPicker=`AddOnPicker`,e.Ledger=`Ledger`,e.PaymentPicker=`PaymentPicker`,e.ProcessMonitor=`ProcessMonitor`,e.NotFound=`NotFound`,e}({}),ft=function(e){return e.HAMBURGUER_MENU=`HAMBURGUER_MENU`,e.HAMBURGER_MENU=`HAMBURGER_MENU`,e.HAMBURGER_SECTIONS=`HAMBURGER_SECTIONS`,e.MENU_ON_LEFT=`MENU_ON_LEFT`,e.MENU_ON_TOP=`MENU_ON_TOP`,e.TABS=`TABS`,e.TILES=`TILES`,e.RAIL=`RAIL`,e.AUTO=`AUTO`,e.MEDIATOR=`MEDIATOR`,e}({});function pt(e,t){return function(){return e.apply(t,arguments)}}var{toString:mt}=Object.prototype,{getPrototypeOf:ht}=Object,{iterator:gt,toStringTag:_t}=Symbol,vt=(({hasOwnProperty:e})=>(t,n)=>e.call(t,n))(Object.prototype),yt=e=>typeof e==`string`&&(e===`__proto__`||e===`constructor`||e===`prototype`),bt=(e,t,n)=>e===Object.prototype||!n&&t===null,xt=e=>{if(!Object.isExtensible(e))return!1;let t=Object.getOwnPropertyNames(e);return Object.getOwnPropertySymbols&&t.push(...Object.getOwnPropertySymbols(e)),t.every(t=>{if(yt(t))return!1;let n=Object.getOwnPropertyDescriptor(e,t);return!!n&&n.configurable&&n.writable===!0})},St=(e,t)=>{let n=e,r=[];for(;n!=null;){if(r.indexOf(n)!==-1)return!1;r.push(n);let i=ht(n);if(bt(n,i,n===e))return!1;if(vt(n,t))return!0;n=i}return!1},Ct=(e,t)=>e!=null&&St(e,t)?e[t]:void 0,wt=e=>{if(e==null||typeof e!=`object`&&typeof e!=`function`)return e;let t=ht(e);if(t===null&&xt(e))return e;let n=Object.create(null),r=Object.create(null),i=[],a=e;for(;a!=null&&i.indexOf(a)===-1;){i.push(a);let o=a===e?t:ht(a);if(bt(a,o,a===e))break;let s=Object.getOwnPropertyNames(a);Object.getOwnPropertySymbols&&s.push(...Object.getOwnPropertySymbols(a));for(let t of s)yt(t)||vt(r,t)||(n[t]=e[t],r[t]=!0);a=o}return n},Tt=(e=>t=>{let n=mt.call(t);return e[n]||(e[n]=n.slice(8,-1).toLowerCase())})(Object.create(null)),T=e=>(e=e.toLowerCase(),t=>Tt(t)===e),Et=e=>t=>typeof t===e,{isArray:Dt}=Array,Ot=Et(`undefined`);function kt(e){return e!==null&&!Ot(e)&&e.constructor!==null&&!Ot(e.constructor)&&E(e.constructor.isBuffer)&&e.constructor.isBuffer(e)}var At=T(`ArrayBuffer`);function jt(e){let t;return t=typeof ArrayBuffer<`u`&&ArrayBuffer.isView?ArrayBuffer.isView(e):e&&e.buffer&&At(e.buffer),t}var Mt=Et(`string`),E=Et(`function`),Nt=Et(`number`),Pt=e=>typeof e==`object`&&!!e,Ft=e=>e===!0||e===!1,It=e=>{if(!Pt(e))return!1;let t=ht(e);return(t===null||t===Object.prototype||ht(t)===null)&&!St(e,_t)&&!St(e,gt)},Lt=e=>{if(!Pt(e)||kt(e))return!1;try{return Object.keys(e).length===0&&Object.getPrototypeOf(e)===Object.prototype}catch{return!1}},Rt=T(`Date`),zt=T(`File`),Bt=e=>!!(e&&e.uri!==void 0),Vt=e=>e&&e.getParts!==void 0,Ht=T(`Blob`),Ut=T(`FileList`),Wt=T(`Set`),Gt=e=>Pt(e)&&E(e.pipe);function Kt(){return typeof globalThis<`u`?globalThis:typeof self<`u`?self:typeof window<`u`?window:typeof global<`u`?global:{}}var qt=Kt(),Jt=qt.FormData===void 0?void 0:qt.FormData,Yt=e=>{if(!e)return!1;if(Jt&&e instanceof Jt)return!0;let t=ht(e);if(!t||t===Object.prototype||!E(e.append))return!1;let n=Tt(e);return n===`formdata`||n===`object`&&E(e.toString)&&e.toString()===`[object FormData]`},Xt=T(`URLSearchParams`),[Zt,Qt,$t,en]=[`ReadableStream`,`Request`,`Response`,`Headers`].map(T),tn=e=>e.trim?e.trim():e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,``);function nn(e,t,{allOwnKeys:n=!1}={}){if(e==null)return;let r,i;if(typeof e!=`object`&&(e=[e]),Dt(e))for(r=0,i=e.length;r<i;r++)t.call(null,e[r],r,e);else{if(kt(e))return;let i=n?Object.getOwnPropertyNames(e):Object.keys(e),a=i.length,o;for(r=0;r<a;r++)o=i[r],t.call(null,e[o],o,e)}}function rn(e,t){if(kt(e))return null;t=t.toLowerCase();let n=Object.keys(e),r=n.length,i;for(;r-->0;)if(i=n[r],t===i.toLowerCase())return i;return null}var an=typeof globalThis<`u`?globalThis:typeof self<`u`?self:typeof window<`u`?window:global,on=e=>!Ot(e)&&e!==an;function sn(...e){let{caseless:t,skipUndefined:n}=on(this)&&this||{},r={},i=(e,i)=>{if(i===`__proto__`||i===`constructor`||i===`prototype`)return;let a=t&&typeof i==`string`&&rn(r,i)||i,o=vt(r,a)?r[a]:void 0;It(o)&&It(e)?r[a]=sn(o,e):It(e)?r[a]=sn({},e):Dt(e)?r[a]=e.slice():(!n||!Ot(e))&&(r[a]=e)};for(let t=0,n=e.length;t<n;t++){let n=e[t];if(!n||kt(n)||(nn(n,i),typeof n!=`object`||Dt(n)))continue;let r=Object.getOwnPropertySymbols(n);for(let e=0;e<r.length;e++){let t=r[e];yn.call(n,t)&&i(n[t],t)}}return r}var cn=(e,t,n,{allOwnKeys:r}={})=>(nn(t,(t,r)=>{n&&E(t)?Object.defineProperty(e,r,{__proto__:null,value:pt(t,n),writable:!0,enumerable:!0,configurable:!0}):Object.defineProperty(e,r,{__proto__:null,value:t,writable:!0,enumerable:!0,configurable:!0})},{allOwnKeys:r}),e),ln=e=>(e.charCodeAt(0)===65279&&(e=e.slice(1)),e),un=(e,t,n,r)=>{e.prototype=Object.create(t.prototype,r),Object.defineProperty(e.prototype,"constructor",{__proto__:null,value:e,writable:!0,enumerable:!1,configurable:!0}),Object.defineProperty(e,"super",{__proto__:null,value:t.prototype}),n&&Object.assign(e.prototype,n)},dn=(e,t,n,r)=>{let i,a,o,s={};if(t||={},e==null)return t;do{for(i=Object.getOwnPropertyNames(e),a=i.length;a-->0;)o=i[a],(!r||r(o,e,t))&&!s[o]&&(t[o]=e[o],s[o]=!0);e=n!==!1&&ht(e)}while(e&&(!n||n(e,t))&&e!==Object.prototype);return t},fn=(e,t,n)=>{e=String(e),(n===void 0||n>e.length)&&(n=e.length),n-=t.length;let r=e.indexOf(t,n);return r!==-1&&r===n},pn=e=>{if(!e)return null;if(Dt(e))return e;let t=e.length;if(!Nt(t))return null;let n=Array(t);for(;t-->0;)n[t]=e[t];return n},mn=(e=>t=>e&&t instanceof e)(typeof Uint8Array<`u`&&ht(Uint8Array)),hn=(e,t)=>{let n=(e&&e[gt]).call(e),r;for(;(r=n.next())&&!r.done;){let n=r.value;t.call(e,n[0],n[1])}},gn=(e,t)=>{let n,r=[];for(;(n=e.exec(t))!==null;)r.push(n);return r},_n=T(`HTMLFormElement`),vn=e=>e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,function(e,t,n){return t.toUpperCase()+n}),{propertyIsEnumerable:yn}=Object.prototype,bn=T(`RegExp`),xn=(e,t)=>{let n=Object.getOwnPropertyDescriptors(e),r={};nn(n,(n,i)=>{let a;(a=t(n,i,e))!==!1&&(r[i]=a||n)}),Object.defineProperties(e,r)},Sn=e=>{xn(e,(t,n)=>{if(E(e)&&[`arguments`,`caller`,`callee`].includes(n))return!1;let r=e[n];if(E(r)){if(t.enumerable=!1,`writable`in t){t.writable=!1;return}t.set||=()=>{throw Error(`Can not rewrite read-only method '`+n+`'`)}}})},Cn=(e,t)=>{let n={},r=e=>{e.forEach(e=>{n[e]=!0})};return Dt(e)?r(e):r(String(e).split(t)),n},wn=()=>{},Tn=(e,t)=>e!=null&&Number.isFinite(e=+e)?e:t;function En(e){return!!(e&&E(e.append)&&e[_t]===`FormData`&&e[gt])}var Dn=e=>{let t=new WeakSet,n=e=>{if(Pt(e)){if(t.has(e))return;if(kt(e))return e;if(!(`toJSON`in e)){t.add(e);let r;if(Wt(e)){r=[];for(let t of e){let e=n(t);!Ot(e)&&r.push(e)}}else r=Dt(e)?[]:{},nn(e,(e,t)=>{let i=n(e);!Ot(i)&&(r[t]=i)});return t.delete(e),r}}return e};return n(e)},On=T(`AsyncFunction`),kn=e=>e&&(Pt(e)||E(e))&&E(e.then)&&E(e.catch),An=((e,t)=>e?setImmediate:t?((e,t)=>(an.addEventListener(`message`,({source:n,data:r})=>{n===an&&r===e&&t.length&&t.shift()()},!1),n=>{t.push(n),an.postMessage(e,`*`)}))(`axios@${Math.random()}`,[]):e=>setTimeout(e))(typeof setImmediate==`function`,E(an.postMessage)),jn=typeof queueMicrotask<`u`?queueMicrotask.bind(an):typeof process<`u`&&process.nextTick||An,Mn=e=>e!=null&&E(e[gt]),D={isArray:Dt,isArrayBuffer:At,isBuffer:kt,isFormData:Yt,isArrayBufferView:jt,isString:Mt,isNumber:Nt,isBoolean:Ft,isObject:Pt,isPlainObject:It,isEmptyObject:Lt,isReadableStream:Zt,isRequest:Qt,isResponse:$t,isHeaders:en,isUndefined:Ot,isDate:Rt,isFile:zt,isReactNativeBlob:Bt,isReactNative:Vt,isBlob:Ht,isRegExp:bn,isFunction:E,isStream:Gt,isURLSearchParams:Xt,isTypedArray:mn,isFileList:Ut,forEach:nn,merge:sn,extend:cn,trim:tn,stripBOM:ln,inherits:un,toFlatObject:dn,kindOf:Tt,kindOfTest:T,endsWith:fn,toArray:pn,forEachEntry:hn,matchAll:gn,isHTMLForm:_n,hasOwnProperty:vt,hasOwnProp:vt,hasOwnInPrototypeChain:St,getSafeProp:Ct,toSafeFlatObject:wt,reduceDescriptors:xn,freezeMethods:Sn,toObjectSet:Cn,toCamelCase:vn,noop:wn,toFiniteNumber:Tn,findKey:rn,global:an,isContextDefined:on,isSpecCompliantForm:En,toJSONObject:Dn,isAsyncFn:On,isThenable:kn,setImmediate:An,asap:jn,isIterable:Mn,isSafeIterable:e=>e!=null&&St(e,gt)&&Mn(e)},Nn=D.toObjectSet([`age`,`authorization`,`content-length`,`content-type`,`etag`,`expires`,`from`,`host`,`if-modified-since`,`if-unmodified-since`,`last-modified`,`location`,`max-forwards`,`proxy-authorization`,`referer`,`retry-after`,`user-agent`]),Pn=e=>{let t={},n,r,i;return e&&e.split(`
`).forEach(function(e){i=e.indexOf(`:`),n=e.substring(0,i).trim().toLowerCase(),r=e.substring(i+1).trim();let a=D.hasOwnProp(t,n);!n||a&&D.hasOwnProp(Nn,n)||(n===`set-cookie`?a?t[n].push(r):t[n]=[r]:t[n]=a?t[n]+`, `+r:r)}),t};function Fn(e){let t=0,n=e.length;for(;t<n;){let n=e.charCodeAt(t);if(n!==9&&n!==32)break;t+=1}for(;n>t;){let t=e.charCodeAt(n-1);if(t!==9&&t!==32)break;--n}return t===0&&n===e.length?e:e.slice(t,n)}var In=RegExp(`[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+`,`g`),Ln=RegExp(`[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+`,`g`);function Rn(e,t){return D.isArray(e)?e.map(e=>Rn(e,t)):Fn(String(e).replace(t,``))}var zn=e=>Rn(e,In),Bn=e=>Rn(e,Ln);function Vn(e){let t=Object.create(null);return D.forEach(e.toJSON(),(e,n)=>{t[n]=Bn(e)}),t}var Hn=Symbol(`internals`);function Un(e){return e&&String(e).trim().toLowerCase()}function Wn(e){return e===!1||e==null?e:D.isArray(e)?e.map(Wn):zn(String(e))}function Gn(e){let t=Object.create(null),n=/([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g,r;for(;r=n.exec(e);)t[r[1]]=r[2];return t}var Kn=/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;function qn(e){let t=0,n=e.length;for(;t<n;){let n=e.charCodeAt(t);if(n!==9&&n!==32)break;t+=1}for(;n>t;){let t=e.charCodeAt(n-1);if(t!==9&&t!==32)break;--n}return t===0&&n===e.length?e:e.slice(t,n)}function Jn(e){let t=e.length-1;if(t<1||e.charCodeAt(0)!==34||e.charCodeAt(t)!==34)return e;let n=``;for(let r=1;r<t;r++){let i=e.charCodeAt(r);if(i===34||i===92&&(r+=1,r>=t))return e;n+=e[r]}return n}function Yn(e){let t=Object.create(null),n=String(e),r=0,i=!1,a=!1;function o(e){let i=qn(n.slice(r,e)),a=i.indexOf(`=`);if(a<1)return;let o=qn(i.slice(0,a));if(!Kn.test(o))return;let s=o.toLowerCase();if(s===`__proto__`||s===`constructor`||s===`prototype`)return;let c=qn(i.slice(a+1));t[s]=Jn(c)}for(let e=0;e<n.length;e++){let t=n.charCodeAt(e);i?a?a=!1:t===92?a=!0:t===34&&(i=!1):t===34?i=!0:(t===44||t===59)&&(o(e),r=e+1)}return o(n.length),t}var Xn=e=>/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());function Zn(e,t,n,r,i){if(D.isFunction(r))return r.call(this,t,n);if(i&&(t=n),D.isString(t)){if(D.isString(r))return t.indexOf(r)!==-1;if(D.isRegExp(r))return r.test(t)}}function Qn(e){return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g,(e,t,n)=>t.toUpperCase()+n)}function $n(e,t){let n=D.toCamelCase(` `+t);[`get`,`set`,`has`].forEach(r=>{Object.defineProperty(e,r+n,{__proto__:null,value:function(e,n,i){return this[r].call(this,t,e,n,i)},configurable:!0})})}var O=class{constructor(e){e&&this.set(e)}set(e,t,n){let r=this;function i(e,t,n){let i=Un(t);if(!i)return;let a=D.findKey(r,i);(!a||r[a]===void 0||n===!0||n===void 0&&r[a]!==!1)&&(r[a||t]=Wn(e))}let a=(e,t)=>D.forEach(e,(e,n)=>i(e,n,t));if(D.isPlainObject(e)||e instanceof this.constructor)a(e,t);else if(D.isString(e)&&(e=e.trim())&&!Xn(e))a(Pn(e),t);else if(D.isObject(e)&&D.isSafeIterable(e)){let n=Object.create(null),r,i;for(let t of e){if(!D.isArray(t))throw TypeError(`Object iterator must return a key-value pair`);i=t[0],D.hasOwnProp(n,i)?(r=n[i],n[i]=D.isArray(r)?[...r,t[1]]:[r,t[1]]):n[i]=t[1]}a(n,t)}else e!=null&&i(t,e,n);return this}get(e,t){if(e=Un(e),e){let n=D.findKey(this,e);if(n){let e=this[n];if(!t)return e;if(t===!0)return Gn(e);if(D.isFunction(t))return t.call(this,e,n);if(D.isRegExp(t))return t.exec(e);throw TypeError(`parser must be boolean|regexp|function`)}}}has(e,t){if(e=Un(e),e){let n=D.findKey(this,e);return!!(n&&this[n]!==void 0&&(!t||Zn(this,this[n],n,t)))}return!1}delete(e,t){let n=this,r=!1;function i(e){if(e=Un(e),e){let i=D.findKey(n,e);i&&(!t||Zn(n,n[i],i,t))&&(delete n[i],r=!0)}}return D.isArray(e)?e.forEach(i):i(e),r}clear(e){let t=Object.keys(this),n=t.length,r=!1;for(;n--;){let i=t[n];(!e||Zn(this,this[i],i,e,!0))&&(delete this[i],r=!0)}return r}normalize(e){let t=this,n={};return D.forEach(this,(r,i)=>{let a=D.findKey(n,i);if(a){t[a]=Wn(r),delete t[i];return}let o=e?Qn(i):String(i).trim();o!==i&&delete t[i],t[o]=Wn(r),n[o]=!0}),this}concat(...e){return this.constructor.concat(this,...e)}toJSON(e){let t=Object.create(null);return D.forEach(this,(n,r)=>{n!=null&&n!==!1&&(t[r]=e&&D.isArray(n)?n.join(`, `):n)}),t}[Symbol.iterator](){return Object.entries(this.toJSON())[Symbol.iterator]()}toString(){return Object.entries(this.toJSON()).map(([e,t])=>e+`: `+t).join(`
`)}getSetCookie(){let e=this.get(`set-cookie`);return D.isArray(e)?e:e==null||e===!1?[]:[e]}get[Symbol.toStringTag](){return`AxiosHeaders`}static from(e){return e instanceof this?e:new this(e)}static parseParameters(e){return Yn(e)}static concat(e,...t){let n=new this(e);return t.forEach(e=>n.set(e)),n}static accessor(e){let t=(this[Hn]=this[Hn]={accessors:{}}).accessors,n=this.prototype;function r(e){let r=Un(e);t[r]||($n(n,e),t[r]=!0)}return D.isArray(e)?e.forEach(r):r(e),this}};O.accessor([`Content-Type`,`Content-Length`,`Accept`,`Accept-Encoding`,`User-Agent`,`Authorization`]),D.reduceDescriptors(O.prototype,({value:e},t)=>{let n=t[0].toUpperCase()+t.slice(1);return{get:()=>e,set(e){this[n]=e}}}),D.freezeMethods(O);var er=`[REDACTED ****]`;function tr(e){if(D.hasOwnProp(e,`toJSON`))return!0;let t=Object.getPrototypeOf(e);for(;t&&t!==Object.prototype;){if(D.hasOwnProp(t,`toJSON`))return!0;t=Object.getPrototypeOf(t)}return!1}function nr(e,t){let n=new Set(t.map(e=>String(e).toLowerCase())),r=[],i=e=>{if(typeof e!=`object`||!e||D.isBuffer(e))return e;if(r.indexOf(e)!==-1)return;e instanceof O&&(e=e.toJSON()),r.push(e);let t;if(D.isArray(e))t=[],e.forEach((e,n)=>{let r=i(e);D.isUndefined(r)||(t[n]=r)});else{if(!D.isPlainObject(e)&&tr(e))return r.pop(),e;t=Object.create(null);for(let[r,a]of Object.entries(e)){let e=n.has(r.toLowerCase())?er:i(a);D.isUndefined(e)||(t[r]=e)}}return r.pop(),t};return i(e)}function rr(e){try{return String(e)}catch{return``}}function ir(e){return e.errors.map(e=>{try{return e&&e.message?rr(e.message):rr(e)}catch{return``}}).filter(Boolean).join(`; `)||e.name||`AggregateError`}var k=class e extends Error{static from(t,n,r,i,a,o){let s=t.message;!s&&D.isArray(t.errors)&&t.errors.length&&(s=ir(t));let c=new e(s,n||t.code,r,i,a);return Object.defineProperty(c,"cause",{__proto__:null,value:t,writable:!0,enumerable:!1,configurable:!0}),c.name=t.name,t.status!=null&&c.status==null&&(c.status=t.status),o&&Object.assign(c,o),c}constructor(e,t,n,r,i){super(e),Object.defineProperty(this,"message",{__proto__:null,value:e,enumerable:!0,writable:!0,configurable:!0}),this.name=`AxiosError`,this.isAxiosError=!0,t&&(this.code=t),n&&(this.config=n),r&&(this.request=r),i&&(this.response=i,this.status=i.status)}toJSON(){let e=this.config,t=e&&D.hasOwnProp(e,`redact`)?e.redact:void 0,n=D.isArray(t)&&t.length>0?nr(e,t):D.toJSONObject(e);return{message:this.message,name:this.name,description:this.description,number:this.number,fileName:this.fileName,lineNumber:this.lineNumber,columnNumber:this.columnNumber,stack:this.stack,config:n,code:this.code,status:this.status}}};k.ERR_BAD_OPTION_VALUE=`ERR_BAD_OPTION_VALUE`,k.ERR_BAD_OPTION=`ERR_BAD_OPTION`,k.ECONNABORTED=`ECONNABORTED`,k.ETIMEDOUT=`ETIMEDOUT`,k.ECONNREFUSED=`ECONNREFUSED`,k.ERR_NETWORK=`ERR_NETWORK`,k.ERR_FR_TOO_MANY_REDIRECTS=`ERR_FR_TOO_MANY_REDIRECTS`,k.ERR_DEPRECATED=`ERR_DEPRECATED`,k.ERR_BAD_RESPONSE=`ERR_BAD_RESPONSE`,k.ERR_BAD_REQUEST=`ERR_BAD_REQUEST`,k.ERR_CANCELED=`ERR_CANCELED`,k.ERR_NOT_SUPPORT=`ERR_NOT_SUPPORT`,k.ERR_INVALID_URL=`ERR_INVALID_URL`,k.ERR_FORM_DATA_DEPTH_EXCEEDED=`ERR_FORM_DATA_DEPTH_EXCEEDED`;function ar(e){return D.isPlainObject(e)||D.isArray(e)}function or(e){return D.endsWith(e,`[]`)?e.slice(0,-2):e}function sr(e,t,n){return e?e.concat(t).map(function(e,t){return e=or(e),!n&&t?`[`+e+`]`:e}).join(n?`.`:``):t}function cr(e){return D.isArray(e)&&!e.some(ar)}var lr=D.toFlatObject(D,{},null,function(e){return/^is[A-Z]/.test(e)});function ur(e,t,n){if(!D.isObject(e))throw TypeError(`target must be an object`);t||=new FormData;let r=(e,t)=>{let r=D.getSafeProp(n,e);return D.isUndefined(r)?t:r},i=r(`metaTokens`,!0),a=r(`visitor`)||h,o=r(`dots`,!1),s=r(`indexes`,!1),c=r(`Blob`)||typeof Blob<`u`&&Blob,l=r(`maxDepth`,100),u=c&&D.isSpecCompliantForm(t),d=[];if(!D.isFunction(a))throw TypeError(`visitor must be a function`);function f(e){if(e===null)return``;if(D.isDate(e))return e.toISOString();if(D.isBoolean(e))return e.toString();if(!u&&D.isBlob(e))throw new k(`Blob is not supported. Use a Buffer instead.`);if(D.isArrayBuffer(e)||D.isTypedArray(e)){if(u&&typeof c==`function`)return new c([e]);throw new k(`Blob is not supported. Use a Buffer instead.`,k.ERR_NOT_SUPPORT)}return e}function p(e){if(e>l)throw new k(`Object is too deeply nested (`+e+` levels). Max depth: `+l,k.ERR_FORM_DATA_DEPTH_EXCEEDED)}function m(e,t){if(l===1/0)return JSON.stringify(e);let n=[];return JSON.stringify(e,function(e,r){if(!D.isObject(r))return r;for(;n.length&&n[n.length-1]!==this;)n.pop();return n.push(r),p(t+n.length-1),r})}function h(e,n,r){let a=e;if(D.isReactNative(t)&&D.isReactNativeBlob(e))return t.append(sr(r,n,o),f(e)),!1;if(e&&!r&&typeof e==`object`){if(D.endsWith(n,`{}`))n=i?n:n.slice(0,-2),e=m(e,1);else if(D.isArray(e)&&cr(e)||(D.isFileList(e)||D.endsWith(n,`[]`))&&(a=D.toArray(e)))return n=or(n),a.forEach(function(e,r){!(D.isUndefined(e)||e===null)&&t.append(s===!0?sr([n],r,o):s===null?n:n+`[]`,f(e))}),!1}return ar(e)?!0:(t.append(sr(r,n,o),f(e)),!1)}let g=Object.assign(lr,{defaultVisitor:h,convertValue:f,isVisitable:ar});function _(e,n,r=0){if(!D.isUndefined(e)){if(p(r),d.indexOf(e)!==-1)throw Error(`Circular reference detected in `+n.join(`.`));d.push(e),D.forEach(e,function(e,i){(!(D.isUndefined(e)||e===null)&&a.call(t,e,D.isString(i)?i.trim():i,n,g))===!0&&_(e,n?n.concat(i):[i],r+1)}),d.pop()}}if(!D.isObject(e))throw TypeError(`data must be an object`);return _(e),t}function dr(e){let t={"!":`%21`,"'":`%27`,"(":`%28`,")":`%29`,"~":`%7E`,"%20":`+`};return encodeURIComponent(e).replace(/[!'()~]|%20/g,function(e){return t[e]})}function fr(e,t){this._pairs=[],e&&ur(e,this,t)}var pr=fr.prototype;pr.append=function(e,t){this._pairs.push([e,t])},pr.toString=function(e){let t=e?t=>e.call(this,t,dr):dr;return this._pairs.map(function(e){return t(e[0])+`=`+t(e[1])},``).join(`&`)};function mr(e){return encodeURIComponent(e).replace(/%3A/gi,`:`).replace(/%24/g,`$`).replace(/%2C/gi,`,`).replace(/%20/g,`+`)}function hr(e,t,n){if(!t)return e;e||=``;let r=D.isFunction(n)?{serialize:n}:n,i=D.getSafeProp(r,`encode`)||mr,a=D.getSafeProp(r,`serialize`),o;if(o=a?a(t,r):D.isURLSearchParams(t)?t.toString():new fr(t,r).toString(i),o){let t=e.indexOf(`#`);t!==-1&&(e=e.slice(0,t)),e+=(e.indexOf(`?`)===-1?`?`:`&`)+o}return e}var gr=Symbol(`internals`);function _r(e){return e?e.length:0}function vr(e){if(e)for(;e.length&&e[e.length-1]===null;)e.pop()}function yr(e,t){let n=e.handlers,r=_r(n);n===t.handlersRef?r!==t.handlersLength&&(r?t.handlerEntries.forEach(function(e,r){n[e.index]!==e.handler&&t.handlerEntries.delete(r)}):t.handlerEntries.clear()):(t.handlersRef=n,t.handlerEntries.clear()),t.handlersLength=r}var br=class{constructor(){this.handlers=[],this[gr]={handlersRef:this.handlers,handlersLength:this.handlers.length,handlerEntries:new Map,iterationDepth:0,nextId:0}}use(e,t,n){let r={fulfilled:e,rejected:t,synchronous:n?n.synchronous:!1,runWhen:n?n.runWhen:null},i=this[gr];this.handlers??=[],yr(this,i);let a=i.nextId++;return this.handlers.push(r),i.handlerEntries.set(a,{handler:r,index:this.handlers.length-1}),i.handlersLength=this.handlers.length,a}eject(e){let t=this[gr];yr(this,t);let n=t.handlerEntries.get(e);if(n){if(t.handlerEntries.delete(e),this.handlers[n.index]!==n.handler)return;this.handlers[n.index]=null,t.iterationDepth||(vr(this.handlers),t.handlersLength=this.handlers.length)}}clear(){this.handlers&&(this.handlers=[],yr(this,this[gr]))}forEach(e){let t=this[gr];yr(this,t),t.iterationDepth++;try{D.forEach(this.handlers,function(t){t!==null&&e(t)})}finally{--t.iterationDepth||(yr(this,t),vr(this.handlers),t.handlersLength=_r(this.handlers))}}},xr={silentJSONParsing:!0,forcedJSONParsing:!0,clarifyTimeoutError:!1,legacyInterceptorReqResOrdering:!0,advertiseZstdAcceptEncoding:!1,validateStatusUndefinedResolves:!0},Sr={isBrowser:!0,classes:{URLSearchParams:typeof URLSearchParams<`u`?URLSearchParams:fr,FormData:typeof FormData<`u`?FormData:null,Blob:typeof Blob<`u`?Blob:null},protocols:[`http`,`https`,`file`,`blob`,`url`,`data`]},Cr=e({hasBrowserEnv:()=>wr,hasStandardBrowserEnv:()=>Er,hasStandardBrowserWebWorkerEnv:()=>Dr,navigator:()=>Tr,origin:()=>Or}),wr=typeof window<`u`&&typeof document<`u`,Tr=typeof navigator==`object`&&navigator||void 0,Er=wr&&(!Tr||[`ReactNative`,`NativeScript`,`NS`].indexOf(Tr.product)<0),Dr=typeof WorkerGlobalScope<`u`&&self instanceof WorkerGlobalScope&&typeof self.importScripts==`function`,Or=wr&&window.location.href||`http://localhost`,A={...Cr,...Sr};function kr(e,t){return ur(e,new A.classes.URLSearchParams,{visitor:function(e,t,n,r){return A.isNode&&D.isBuffer(e)?(this.append(t,e.toString(`base64`)),!1):r.defaultVisitor.apply(this,arguments)},...t})}var Ar=100;function jr(e){if(e>Ar)throw new k(`FormData field is too deeply nested (`+e+` levels). Max depth: `+Ar,k.ERR_FORM_DATA_DEPTH_EXCEEDED)}function Mr(e){let t=[],n=/[^.[\]]+|\[([^.[\]]*)]/g,r;for(;(r=n.exec(e))!==null;)jr(t.length),t.push(r[0]===`[]`?``:r[1]||r[0]);return t}function Nr(e){let t={},n=Object.keys(e),r,i=n.length,a;for(r=0;r<i;r++)a=n[r],t[a]=e[a];return t}function Pr(e){function t(e,n,r,i){jr(i);let a=e[i++];if(a===`__proto__`)return!0;let o=Number.isFinite(+a),s=i>=e.length;return a=!a&&D.isArray(r)?r.length:a,s?(D.hasOwnProp(r,a)?r[a]=D.isArray(r[a])?r[a].concat(n):[r[a],n]:r[a]=n,!o):((!D.hasOwnProp(r,a)||!D.isObject(r[a]))&&(r[a]=[]),t(e,n,r[a],i)&&D.isArray(r[a])&&(r[a]=Nr(r[a])),!o)}if(D.isFormData(e)&&D.isFunction(e.entries)){let n={};return D.forEachEntry(e,(e,r)=>{t(Mr(e),r,n,0)}),n}return null}var Fr=Object.freeze([`get`,`delete`,`head`,`options`,`post`,`put`,`patch`,`purge`,`link`,`unlink`,`query`]),Ir=(e,t)=>e!=null&&D.hasOwnProp(e,t)?e[t]:void 0;function Lr(e,t,n){if(D.isString(e))try{return(t||JSON.parse)(e),D.trim(e)}catch(e){if(e.name!==`SyntaxError`)throw e}return(n||JSON.stringify)(e)}var Rr={transitional:xr,adapter:[`xhr`,`http`,`fetch`],transformRequest:[function(e,t){let n=t.getContentType()||``,r=n.indexOf(`application/json`)>-1,i=D.isObject(e);if(i&&D.isHTMLForm(e)&&(e=new FormData(e)),D.isFormData(e))return r?JSON.stringify(Pr(e)):e;if(D.isArrayBuffer(e)||D.isBuffer(e)||D.isStream(e)||D.isFile(e)||D.isBlob(e)||D.isReadableStream(e))return e;if(D.isArrayBufferView(e))return e.buffer;if(D.isURLSearchParams(e))return t.setContentType(`application/x-www-form-urlencoded;charset=utf-8`,!1),e.toString();let a;if(i){let t=Ir(this,`formSerializer`);if(n.indexOf(`application/x-www-form-urlencoded`)>-1)return kr(e,t).toString();if((a=D.isFileList(e))||n.indexOf(`multipart/form-data`)>-1){let n=Ir(this,`env`),r=n&&n.FormData;return ur(a?{"files[]":e}:e,r&&new r,t)}}return i||r?(t.setContentType(`application/json`,!1),Lr(e)):e}],transformResponse:[function(e){let t=Ir(this,`transitional`)||Rr.transitional,n=t&&t.forcedJSONParsing,r=Ir(this,`responseType`),i=r===`json`;if(D.isResponse(e)||D.isReadableStream(e))return e;if(e&&D.isString(e)&&(n&&!r||i)){let n=!(t&&t.silentJSONParsing)&&i;try{return JSON.parse(e,Ir(this,`parseReviver`))}catch(e){if(n)throw e.name===`SyntaxError`?k.from(e,k.ERR_BAD_RESPONSE,this,null,Ir(this,`response`)):e}}return e}],timeout:0,xsrfCookieName:`XSRF-TOKEN`,xsrfHeaderName:`X-XSRF-TOKEN`,maxContentLength:-1,maxBodyLength:-1,env:{FormData:A.classes.FormData,Blob:A.classes.Blob},validateStatus:function(e){return e>=200&&e<300},headers:{common:{Accept:`application/json, text/plain, */*`,"Content-Type":void 0}}};D.forEach(Fr,e=>{Rr.headers[e]={}});function zr(e,t){let n=this||Rr,r=t||n,i=O.from(r.headers),a=r.data;return D.forEach(e,function(e){a=e.call(n,a,i.normalize(),t?t.status:void 0)}),i.normalize(),a}function Br(e){return!!(e&&e.__CANCEL__)}var Vr=class extends k{constructor(e,t,n){super(e??`canceled`,k.ERR_CANCELED,t,n),this.name=`CanceledError`,this.__CANCEL__=!0}};function Hr(e,t,n){let r=n.config.validateStatus;!n.status||!r||r(n.status)?e(n):t(new k(`Request failed with status code `+n.status,n.status>=400&&n.status<500?k.ERR_BAD_REQUEST:k.ERR_BAD_RESPONSE,n.config,n.request,n))}var Ur=/[\t\n\r]/g;function Wr(e){if(typeof e!=`string`)return e;let t=0;for(;t<e.length&&e.charCodeAt(t)<=32;)t++;return e.slice(t).replace(Ur,``)}function Gr(e){let t=/^([-+\w]{1,25}):(?:\/\/)?/.exec(e);return t&&t[1]||``}function Kr(e,t){e||=10;let n=Array(e),r=Array(e),i=0,a=0,o;return t=t===void 0?1e3:t,function(s){let c=Date.now(),l=r[a];o||=c,n[i]=s,r[i]=c;let u=a,d=0;for(;u!==i;)d+=n[u++],u%=e;if(i=(i+1)%e,i===a&&(a=(a+1)%e),c-o<t)return;let f=l&&c-l;return f?Math.round(d*1e3/f):void 0}}function qr(e,t){let n=0,r=1e3/t,i,a,o=(t,r=Date.now())=>{n=r,i=null,a&&=(clearTimeout(a),null),e(...t)};return[(...e)=>{let t=Date.now(),s=t-n;s>=r?o(e,t):(i=e,a||=setTimeout(()=>{a=null,o(i)},r-s))},()=>i&&o(i),(...e)=>o(e)]}var Jr=(e,t,n=3)=>{let r=0,i=Kr(50,250);return qr(n=>{if(!n||!D.isNumber(n.loaded))return;let a=n.loaded,o=n.lengthComputable?n.total:void 0,s=Math.max(0,o==null?a:Math.min(a,o)),c=Math.max(0,s-r),l=i(c);r=Math.max(r,s),e({loaded:s,total:o,progress:o?s/o:void 0,bytes:c,rate:l||void 0,estimated:l&&o?(o-s)/l:void 0,event:n,lengthComputable:o!=null,[t?`download`:`upload`]:!0})},n)},Yr=(e,t)=>{let n=e!=null;return[r=>t[0]({lengthComputable:n,total:e,loaded:r}),t[1]]},Xr=(e,t=D.asap)=>(...n)=>t(()=>e(...n)),Zr=A.hasStandardBrowserEnv?((e,t)=>n=>(n=new URL(n,A.origin),e.protocol===n.protocol&&e.host===n.host&&(t||e.port===n.port)))(new URL(A.origin),A.navigator&&/(msie|trident)/i.test(A.navigator.userAgent)):()=>!0,Qr=A.hasStandardBrowserEnv?{write(e,t,n,r,i,a,o){if(typeof document>`u`)return;let s=[`${e}=${encodeURIComponent(t)}`];D.isNumber(n)&&s.push(`expires=${new Date(n).toUTCString()}`),D.isString(r)&&s.push(`path=${r}`),D.isString(i)&&s.push(`domain=${i}`),a===!0&&s.push(`secure`),D.isString(o)&&s.push(`SameSite=${o}`),document.cookie=s.join(`; `)},read(e){if(typeof document>`u`)return null;let t=document.cookie.split(`;`);for(let n=0;n<t.length;n++){let r=t[n].replace(/^\s+/,``),i=r.indexOf(`=`);if(i!==-1&&r.slice(0,i)===e)try{return decodeURIComponent(r.slice(i+1))}catch{return r.slice(i+1)}}return null},remove(e){this.write(e,``,Date.now()-864e5,`/`)}}:{write(){},read(){return null},remove(){}};function $r(e){return typeof e==`string`&&/^([a-z][a-z\d+\-.]*:)?\/\//i.test(e)}function ei(e,t){if(!t)return e;let n=e.length;for(;n>0&&e.charCodeAt(n-1)===47;)n--;return e.slice(0,n)+`/`+t.replace(/^\/+/,``)}var ti=/^https?:(?!\/\/)/i;function ni(e){return e&&e.replace(/(^|&)([^=&]*=)?[^&]+/g,(e,t,n=``)=>`${t}${n}${er}`)}function ri(e){let t=e.replace(/^(https?:\/{0,2})[^/?#]*@/i,`$1${er}@`),n=t.indexOf(`#`),r=(n===-1?t:t.slice(0,n)).replace(/([?&][^=&#]*=)[^&#]*/g,`$1${er}`);return n===-1?r:`${r}#${ni(t.slice(n+1))}`}function ii(e,t){if(typeof e==`string`){let n=Wr(e);if(ti.test(n))throw new k(`Invalid URL ${JSON.stringify(ri(n))}: missing "//" after protocol`,k.ERR_INVALID_URL,t)}}function ai(e,t,n,r){ii(t,r);let i=!$r(t);return e&&(i||n===!1)?(ii(e,r),ei(e,t)):t}var oi=e=>e instanceof O?{...e}:e,si=e=>Object.getOwnPropertySymbols&&Object.getOwnPropertyDescriptor?Object.keys(e).concat(Object.getOwnPropertySymbols(e).filter(t=>Object.getOwnPropertyDescriptor(e,t).enumerable)):Object.keys(e);function ci(e,t){e||={},t||={};let n=Object.create(null);Object.defineProperty(n,"hasOwnProperty",{__proto__:null,value:Object.prototype.hasOwnProperty,enumerable:!1,writable:!0,configurable:!0});function r(e,t,n,r){return D.isPlainObject(e)&&D.isPlainObject(t)?D.merge.call({caseless:r},e,t):D.isPlainObject(t)?D.merge({},t):D.isArray(t)?t.slice():t}function i(e,t,n,i){if(!D.isUndefined(t))return r(e,t,n,i);if(!D.isUndefined(e))return r(void 0,e,n,i)}function a(e,t){if(!D.isUndefined(t))return r(void 0,t)}function o(e,t){if(!D.isUndefined(t))return r(void 0,t);if(!D.isUndefined(e))return r(void 0,e)}function s(n){let r=D.hasOwnProp(t,`transitional`)?t.transitional:void 0;if(!D.isUndefined(r)){if(D.isPlainObject(r)){if(D.hasOwnProp(r,n))return r[n]}else return}let i=D.hasOwnProp(e,`transitional`)?e.transitional:void 0;if(D.isPlainObject(i)&&D.hasOwnProp(i,n))return i[n]}function c(n,i,a){if(D.hasOwnProp(t,a))return r(n,i);if(D.hasOwnProp(e,a))return r(void 0,n)}let l={url:a,method:a,data:a,baseURL:o,transformRequest:o,transformResponse:o,paramsSerializer:o,timeout:o,timeoutErrorMessage:o,withCredentials:o,withXSRFToken:o,adapter:o,responseType:o,xsrfCookieName:o,xsrfHeaderName:o,onUploadProgress:o,onDownloadProgress:o,decompress:o,maxContentLength:o,maxBodyLength:o,beforeRedirect:o,transport:o,httpAgent:o,httpsAgent:o,cancelToken:o,socketPath:o,allowedSocketPaths:o,responseEncoding:o,validateStatus:c,headers:(e,t,n)=>i(oi(e),oi(t),n,!0)};return D.forEach(si({...e,...t}),function(r){if(r===`__proto__`||r===`constructor`||r===`prototype`)return;let a=D.hasOwnProp(l,r)?l[r]:i,o=a(D.hasOwnProp(e,r)?e[r]:void 0,D.hasOwnProp(t,r)?t[r]:void 0,r);D.isUndefined(o)&&a!==c||(n[r]=o)}),D.hasOwnProp(t,`validateStatus`)&&D.isUndefined(t.validateStatus)&&s(`validateStatusUndefinedResolves`)===!1&&(D.hasOwnProp(e,`validateStatus`)?n.validateStatus=r(void 0,e.validateStatus):delete n.validateStatus),n}var li=[`content-type`,`content-length`];function ui(e,t,n){if(n!==`content-only`){e.set(t);return}Object.entries(t||{}).forEach(([t,n])=>{li.includes(t.toLowerCase())&&e.set(t,n)})}var di=e=>encodeURIComponent(e).replace(/%([0-9A-F]{2})/gi,(e,t)=>String.fromCharCode(parseInt(t,16)));function fi(e){let t=ci({},e),n=e=>D.hasOwnProp(t,e)?t[e]:void 0,r=n(`data`),i=n(`withXSRFToken`),a=n(`xsrfHeaderName`),o=n(`xsrfCookieName`),s=n(`headers`),c=n(`auth`),l=n(`baseURL`),u=n(`allowAbsoluteUrls`),d=n(`url`);if(t.headers=s=O.from(s),t.url=hr(ai(l,d,u,t),n(`params`),n(`paramsSerializer`)),c){let t=D.getSafeProp(c,`username`)||``,n=D.getSafeProp(c,`password`)||``;try{s.set(`Authorization`,`Basic `+btoa(t+`:`+(n?di(n):``)))}catch(t){throw k.from(t,k.ERR_BAD_OPTION_VALUE,e)}}if(D.isFormData(r)){let e=D.getSafeProp(r,`getHeaders`);A.hasStandardBrowserEnv||A.hasStandardBrowserWebWorkerEnv||D.isReactNative(r)?s.setContentType(void 0):D.isFunction(e)&&ui(s,e.call(r),n(`formDataHeaderPolicy`))}if(A.hasStandardBrowserEnv&&(D.isFunction(i)&&(i=i(t)),i===!0||i==null&&Zr(t.url))){let e=a&&o&&Qr.read(o);e&&s.set(a,e)}return t}var pi=typeof XMLHttpRequest<`u`&&function(e){return new Promise(function(t,n){let r=fi(e),i=r.data,a=O.from(r.headers).normalize(),{responseType:o,onUploadProgress:s,onDownloadProgress:c}=r,l,u,d,f,p,m;function h(){f&&f(),p&&p(),r.cancelToken&&r.cancelToken.unsubscribe(l),r.signal&&r.signal.removeEventListener(`abort`,l)}let g=new XMLHttpRequest;g.open(r.method.toUpperCase(),r.url,!0),g.timeout=r.timeout;function _(i){if(!g)return;if(g.status===0&&(Gr(Wr(r.url))||Gr(A.origin))!==`file`&&!(g.responseURL&&g.responseURL.startsWith(`file:`))){n(new k(`Request aborted`,k.ECONNABORTED,e,g)),h(),g=null;return}try{i?m&&m(i):p&&p()}catch(e){setTimeout(()=>{throw e})}if(!g)return;let a=O.from(`getAllResponseHeaders`in g&&g.getAllResponseHeaders());Hr(function(e){t(e),h()},function(e){n(e),h()},{data:!o||o===`text`||o===`json`?g.responseText:g.response,status:g.status,statusText:g.statusText,headers:a,config:e,request:g}),g=null}`onloadend`in g?g.onloadend=_:g.onreadystatechange=function(){!g||g.readyState!==4||g.status===0&&!(g.responseURL&&g.responseURL.startsWith(`file:`))||setTimeout(_)},g.onabort=function(){g&&=(n(new k(`Request aborted`,k.ECONNABORTED,e,g)),h(),null)},g.onerror=function(t){let r=new k(t&&t.message?t.message:`Network Error`,k.ERR_NETWORK,e,g);r.event=t||null,n(r),h(),g=null},g.ontimeout=function(){let t=r.timeout?`timeout of `+r.timeout+`ms exceeded`:`timeout exceeded`,i=r.transitional||xr;r.timeoutErrorMessage&&(t=r.timeoutErrorMessage),n(new k(t,i.clarifyTimeoutError?k.ETIMEDOUT:k.ECONNABORTED,e,g)),h(),g=null},i===void 0&&a.setContentType(null),`setRequestHeader`in g&&D.forEach(Vn(a),function(e,t){g.setRequestHeader(t,e)}),D.isUndefined(r.withCredentials)||(g.withCredentials=!!r.withCredentials),o&&o!==`json`&&(g.responseType=r.responseType),c&&([d,p,m]=Jr(c,!0),g.addEventListener(`progress`,d)),s&&g.upload&&([u,f]=Jr(s),g.upload.addEventListener(`progress`,u),g.upload.addEventListener(`loadend`,f)),(r.cancelToken||r.signal)&&(l=t=>{g&&=(n(!t||t.type?new Vr(null,e,g):t),g.abort(),h(),null)},r.cancelToken&&r.cancelToken.subscribe(l),r.signal&&(r.signal.aborted?l():r.signal.addEventListener(`abort`,l)));let v=Gr(r.url);if(v&&!A.protocols.includes(v)){n(new k(`Unsupported protocol `+v+`:`,k.ERR_BAD_REQUEST,e)),h();return}g.send(i||null)})},mi=(e,t)=>{if(e=e?e.filter(Boolean):[],!t&&!e.length)return;let n=new AbortController,r=!1,i=function(e){if(!r){r=!0,o();let t=e instanceof Error?e:this.reason;n.abort(t instanceof k?t:new Vr(t instanceof Error?t.message:t))}},a=t&&setTimeout(()=>{a=null,i(new k(`timeout of ${t}ms exceeded`,k.ETIMEDOUT))},t),o=()=>{e&&=(a&&clearTimeout(a),a=null,e.forEach(e=>{e.unsubscribe?e.unsubscribe(i):e.removeEventListener(`abort`,i)}),null)};e.forEach(e=>{if(!r){if(e.aborted){i.call(e);return}e.addEventListener(`abort`,i,{once:!0})}});let{signal:s}=n;return s.unsubscribe=()=>D.asap(o),s},hi=function*(e,t){let n=e.byteLength;if(!t||n<t){yield e;return}let r=0,i;for(;r<n;)i=r+t,yield e.slice(r,i),r=i},gi=async function*(e,t){for await(let n of _i(e))yield*hi(n,t)},_i=async function*(e){if(e[Symbol.asyncIterator]){yield*e;return}let t=e.getReader();try{for(;;){let{done:e,value:n}=await t.read();if(e)break;yield n}}finally{await t.cancel()}},vi=(e,t,n,r)=>{let i=gi(e,t),a=0,o,s=e=>{o||(o=!0,r&&r(e))};return new ReadableStream({async pull(e){try{let{done:t,value:r}=await i.next();if(t){s(),e.close();return}let o=r.byteLength;n&&n(a+=o),e.enqueue(new Uint8Array(r))}catch(e){throw s(e),e}},cancel(e){return s(e),i.return()}},{highWaterMark:2})},yi=e=>e>=48&&e<=57||e>=65&&e<=70||e>=97&&e<=102,bi=(e,t,n)=>t+2<n&&yi(e.charCodeAt(t+1))&&yi(e.charCodeAt(t+2)),xi=e=>e<=57?e-48:(e&223)-55,Si=e=>e>=65&&e<=90||e>=97&&e<=122||e>=48&&e<=57||e===43||e===47||e===45||e===95,Ci=e=>e===9||e===10||e===12||e===13||e===32,wi=e=>{let t=Math.floor(e/4),n=e%4;return t*3+(n===2?1:n===3?2:0)},Ti=e=>{let t=e.length,n=0;return t>0&&e.charCodeAt(t-1)===61&&(n++,t>1&&e.charCodeAt(t-2)===61&&n++),Math.floor((t-n)*3/4)},Ei=e=>{let t=e.length,n=0,r=0,i=!1;for(let a=0;a<t;a++){let o=e.charCodeAt(a);if(o===37&&bi(e,a,t)&&(o=xi(e.charCodeAt(a+1))*16+xi(e.charCodeAt(a+2)),a+=2),!Ci(o)){if(o===61){r++;continue}if(!Si(o)||r>0){i=!0;continue}n++}}return i||r>2||r>0&&(n+r)%4!=0||n%4==1?Ti(e):wi(n)},Di=(e,t)=>{if(!e||typeof e!=`string`||!e.startsWith(`data:`))return 0;let n=e.indexOf(`,`);if(n<0)return 0;let r=e.slice(5,n),i=e.slice(n+1);if(/;base64/i.test(r))return t(i);let a=0;for(let e=0,t=i.length;e<t;e++){let n=i.charCodeAt(e);if(n===37&&bi(i,e,t))a+=1,e+=2;else if(n<128)a+=1;else if(n<2048)a+=2;else if(n>=55296&&n<=56319&&e+1<t){let t=i.charCodeAt(e+1);t>=56320&&t<=57343?(a+=4,e++):a+=3}else a+=3}return a};function Oi(e){let t=typeof e==`string`?e.indexOf(`#`):-1;return Di(t===-1?e:e.slice(0,t),Ei)}var ki=`1.20.0`,Ai=65536,ji={cache:`default`,redirect:`follow`,referrer:`about:client`,referrerPolicy:``,mode:`cors`,integrity:``,keepalive:!1,priority:`auto`,window:null},{isFunction:Mi}=D,Ni=e=>encodeURIComponent(e).replace(/%([0-9A-F]{2})/gi,(e,t)=>String.fromCharCode(parseInt(t,16))),Pi=e=>{if(!D.isString(e))return e;try{return decodeURIComponent(e)}catch{return e}},Fi=(e,...t)=>{try{return!!e(...t)}catch{return!1}},Ii=e=>{let t=e.indexOf(`://`),n=e;return t!==-1&&(n=n.slice(t+3)),n.includes(`@`)||n.includes(`:`)},Li=e=>{let t=D.global!==void 0&&D.global!==null?D.global:globalThis,{ReadableStream:n,TextEncoder:r}=t;e=D.merge.call({skipUndefined:!0},{Request:t.Request,Response:t.Response},e);let{fetch:i,Request:a,Response:o}=e,s=i?Mi(i):typeof fetch==`function`,c=Mi(a),l=Mi(o);if(!s)return!1;let u=s&&Mi(n),d=s&&(typeof r==`function`?(e=>t=>e.encode(t))(new r):async e=>new Uint8Array(await new a(e).arrayBuffer())),f=c&&u&&Fi(()=>{let e=!1,t=new a(A.origin,{body:new n,method:`POST`,get duplex(){return e=!0,`half`}}),r=t.headers.has(`Content-Type`);return t.body!=null&&t.body.cancel(),e&&!r}),p=l&&u&&Fi(()=>D.isReadableStream(new o(``).body)),m={stream:p&&(e=>e.body)};s&&[`text`,`arrayBuffer`,`blob`,`formData`,`stream`].forEach(e=>{!m[e]&&(m[e]=(t,n)=>{let r=t&&t[e];if(r)return r.call(t);throw new k(`Response type '${e}' is not supported`,k.ERR_NOT_SUPPORT,n)})});let h=async e=>{if(e==null)return 0;if(D.isBlob(e))return e.size;if(D.isSpecCompliantForm(e))return(await new a(A.origin,{method:`POST`,body:e}).arrayBuffer()).byteLength;if(D.isArrayBufferView(e)||D.isArrayBuffer(e))return e.byteLength;if(D.isURLSearchParams(e)&&(e+=``),D.isString(e))return(await d(e)).byteLength},g=async(e,t)=>D.toFiniteNumber(e.getContentLength())??h(t);return async e=>{let{url:t,method:n,data:s,signal:l,cancelToken:d,timeout:_,onDownloadProgress:v,onUploadProgress:ee,responseType:te,headers:ne,withCredentials:re=`same-origin`,fetchOptions:ie,maxContentLength:y,maxBodyLength:ae,maxRedirects:oe}=fi(e),se=D.isNumber(y)&&y>-1,ce=D.isNumber(ae)&&ae>-1,le=t=>D.hasOwnProp(e,t)?e[t]:void 0,ue=i||fetch;te=te?(te+``).toLowerCase():`text`;let de=mi([l,d&&d.toAbortSignal()],_),b=null,fe=de&&de.unsubscribe&&(()=>{de.unsubscribe()}),pe,me=null,he=()=>new k(`Request body larger than maxBodyLength limit`,k.ERR_BAD_REQUEST,e,b);try{let i,l=le(`auth`);if(l&&(i={username:D.getSafeProp(l,`username`)||``,password:D.getSafeProp(l,`password`)||``}),Ii(t)){let e=new URL(t,A.origin);!i&&(e.username||e.password)&&(i={username:Pi(e.username),password:Pi(e.password)}),(e.username||e.password)&&(e.username=``,e.password=``,t=e.href)}if(i&&(ne.delete(`authorization`),ne.set(`Authorization`,`Basic `+btoa(Ni((i.username||``)+`:`+(i.password||``))))),se&&typeof t==`string`&&t.startsWith(`data:`)&&Oi(t)>y)throw new k(`maxContentLength size of `+y+` exceeded`,k.ERR_BAD_RESPONSE,e,b);if(ce&&n!==`get`&&n!==`head`){let e=await h(s);if(typeof e==`number`&&isFinite(e)&&(pe=e,e>ae))throw he()}let d=ce&&(D.isReadableStream(s)||D.isStream(s)),_=(e,t,n)=>vi(e,Ai,e=>{if(ce&&e>ae)throw me=he();t&&t(e)},n);if(f&&n!==`get`&&n!==`head`&&(ee||d)){if(pe??=await g(ne,s),pe!==0||d){let e=new a(t,{method:`POST`,body:s,duplex:`half`}),n;if(D.isFormData(s)&&(n=e.headers.get(`content-type`))&&ne.setContentType(n),e.body){let[t,n]=ee&&Yr(pe,Jr(Xr(ee)))||[];s=_(e.body,t,n)}}}else if(d&&!c&&u&&n!==`get`&&n!==`head`)s=_(s);else if(d&&c&&!f&&n!==`get`&&n!==`head`)throw new k(`Stream request bodies are not supported by the current fetch implementation`,k.ERR_NOT_SUPPORT,e,b);D.isString(re)||(re=re?`include`:`omit`);let ge=c&&`credentials`in a.prototype;if(D.isFormData(s)){let e=ne.getContentType();e&&/^multipart\/form-data/i.test(e)&&!/boundary=/i.test(e)&&ne.delete(`content-type`)}ne.set(`User-Agent`,`axios/`+ki,!1);let x=ie==null?ie:Object.assign(Object.create(null),ie);x&&(delete x.body,delete x.headers,delete x.method,delete x.signal,delete x.duplex,delete x.credentials);let _e=Object.assign(Object.create(null),x,{signal:de,method:n.toUpperCase(),headers:Vn(ne.normalize()),body:s,duplex:`half`,credentials:ge?re:void 0});c&&(D.forEach(ji,(e,t)=>{_e[t]===void 0&&(_e[t]=e)}),_e.signal===void 0&&(_e.signal=null),_e.body===void 0&&(_e.body=null)),oe===0&&(_e.redirect=`manual`,x&&(x.redirect=`manual`)),b=c&&new a(t,_e);let ve=await(c?ue(b,x):ue(t,_e)),ye=O.from(ve.headers);if(se){let t=D.toFiniteNumber(ye.getContentLength());if(t!=null&&t>y)throw new k(`maxContentLength size of `+y+` exceeded`,k.ERR_BAD_RESPONSE,e,b)}let be=p&&(te===`stream`||te===`response`);if(p&&ve.body&&(v||se||be&&fe)){let t={};[`status`,`statusText`,`headers`].forEach(e=>{t[e]=ve[e]});let n=D.toFiniteNumber(ye.getContentLength()),[r,i]=v&&Yr(n,Jr(Xr(v),!0))||[],a=0;ve=new o(vi(ve.body,Ai,t=>{if(se&&(a=t,a>y))throw new k(`maxContentLength size of `+y+` exceeded`,k.ERR_BAD_RESPONSE,e,b);r&&r(t)},()=>{i&&i(),fe&&fe()}),t)}te||=`text`;let S=await m[D.findKey(m,te)||`text`](ve,e);if(se&&!p&&!be){let t;if(S!=null&&(typeof S.byteLength==`number`?t=S.byteLength:typeof S.size==`number`?t=S.size:typeof S==`string`&&(t=typeof r==`function`?new r().encode(S).byteLength:S.length)),typeof t==`number`&&t>y)throw new k(`maxContentLength size of `+y+` exceeded`,k.ERR_BAD_RESPONSE,e,b)}return!be&&fe&&fe(),await new Promise((t,n)=>{Hr(t,n,{data:S,headers:O.from(ve.headers),status:ve.status,statusText:ve.statusText,config:e,request:b})})}catch(t){if(fe&&fe(),de&&de.aborted&&de.reason instanceof k){let n=de.reason;throw n.config=e,b&&(n.request=b),t!==n&&Object.defineProperty(n,"cause",{__proto__:null,value:t,writable:!0,enumerable:!1,configurable:!0}),n}if(me)throw b&&!me.request&&(me.request=b),me;if(t instanceof k)throw b&&!t.request&&(t.request=b),t;if(t&&t.name===`TypeError`&&/Load failed|fetch/i.test(t.message)){let n=new k(`Network Error`,k.ERR_NETWORK,e,b,t&&t.response);throw Object.defineProperty(n,"cause",{__proto__:null,value:t.cause||t,writable:!0,enumerable:!1,configurable:!0}),n}throw k.from(t,t&&t.code,e,b,t&&t.response)}}},Ri=new Map,zi=e=>{let t=e&&e.env||{},{fetch:n,Request:r,Response:i}=t,a=[r,i,n],o=a.length,s,c,l=Ri;for(;o--;)s=a[o],c=l.get(s),c===void 0&&l.set(s,c=o?new Map:Li(t)),l=c;return c};zi();var Bi={http:null,xhr:pi,fetch:{get:zi}};D.forEach(Bi,(e,t)=>{if(e){try{Object.defineProperty(e,"name",{__proto__:null,value:t})}catch{}Object.defineProperty(e,"adapterName",{__proto__:null,value:t})}});var Vi=e=>`- ${e}`,Hi=e=>D.isFunction(e)||e===null||e===!1;function Ui(e,t){e=D.isArray(e)?e:[e];let{length:n}=e,r,i,a={};for(let o=0;o<n;o++){r=e[o];let n;if(i=r,!Hi(r)&&(i=Bi[(n=String(r)).toLowerCase()],i===void 0))throw new k(`Unknown adapter '${n}'`);if(i&&(D.isFunction(i)||(i=i.get(t))))break;a[n||`#`+o]=i}if(!i){let e=Object.entries(a).map(([e,t])=>`adapter ${e} `+(t===!1?`is not supported by the environment`:`is not available in the build`));throw new k(`There is no suitable adapter to dispatch the request `+(n?e.length>1?`since :
`+e.map(Vi).join(`
`):` `+Vi(e[0]):`as no adapter specified`),k.ERR_NOT_SUPPORT)}return i}var Wi={getAdapter:Ui,adapters:Bi};function Gi(e){if(e.cancelToken&&e.cancelToken.throwIfRequested(),e.signal&&e.signal.aborted)throw new Vr(null,e)}function Ki(e){let t=D.toSafeFlatObject(e);return Gi(t),t.headers=O.from(D.getSafeProp(t,`headers`)),t.data=zr.call(t,t.transformRequest),[`post`,`put`,`patch`].indexOf(t.method)!==-1&&t.headers.setContentType(`application/x-www-form-urlencoded`,!1),Wi.getAdapter(t.adapter||Rr.adapter,t)(t).then(function(e){Gi(t),t.response=e;try{e.data=zr.call(t,t.transformResponse,e)}finally{delete t.response}return e.headers=O.from(e.headers),e},function(e){if(!Br(e)&&(Gi(t),e&&e.response)){t.response=e.response;try{e.response.data=zr.call(t,t.transformResponse,e.response)}finally{delete t.response}e.response.headers=O.from(e.response.headers)}return Promise.reject(e)})}var qi={};[`object`,`boolean`,`number`,`function`,`string`,`symbol`].forEach((e,t)=>{qi[e]=function(n){return typeof n===e||`a`+(t<1?`n `:` `)+e}});var Ji={};qi.transitional=function(e,t,n){function r(e,t){return`[Axios v`+ki+`] Transitional option '`+e+`'`+t+(n?`. `+n:``)}return(n,i,a)=>{if(e===!1)throw new k(r(i,` has been removed`+(t?` in `+t:``)),k.ERR_DEPRECATED);return t&&!Ji[i]&&(Ji[i]=!0,console.warn(r(i,` has been deprecated since v`+t+` and will be removed in the near future`))),!e||e(n,i,a)}},qi.spelling=function(e){return(t,n)=>(console.warn(`${n} is likely a misspelling of ${e}`),!0)};function Yi(e,t,n){if(typeof e!=`object`||!e)throw new k(`options must be an object`,k.ERR_BAD_OPTION_VALUE);let r=Object.keys(e),i=r.length;for(;i-->0;){let a=r[i],o=Object.prototype.hasOwnProperty.call(t,a)?t[a]:void 0;if(o){let t=e[a],n=t===void 0||o(t,a,e);if(n!==!0)throw new k(`option `+a+` must be `+n,k.ERR_BAD_OPTION_VALUE);continue}if(n!==!0)throw new k(`Unknown option `+a,k.ERR_BAD_OPTION)}}var Xi={assertOptions:Yi,validators:qi},j=Xi.validators,Zi=class{constructor(e){this.defaults=e||{},this.interceptors={request:new br,response:new br}}async request(e,t){try{return await this._request(e,t)}catch(e){if(e instanceof Error)try{let t={};Error.captureStackTrace?Error.captureStackTrace(t):t=Error();let n=t.stack,r=``;if(typeof n==`string`){let e=n.indexOf(`
`);r=e===-1?``:n.slice(e+1)}if(!e.stack)e.stack=r;else if(r){let t=r.indexOf(`
`),n=t===-1?-1:r.indexOf(`
`,t+1),i=n===-1?``:r.slice(n+1);String(e.stack).endsWith(i)||(e.stack+=`
`+r)}}catch{}throw e}}_request(e,t){typeof e==`string`?(t||={},t.url=e):t=e||{},t=ci(this.defaults,t);let{transitional:n,paramsSerializer:r,headers:i}=t;n!==void 0&&Xi.assertOptions(n,{silentJSONParsing:j.transitional(j.boolean),forcedJSONParsing:j.transitional(j.boolean),clarifyTimeoutError:j.transitional(j.boolean),legacyInterceptorReqResOrdering:j.transitional(j.boolean),advertiseZstdAcceptEncoding:j.transitional(j.boolean),validateStatusUndefinedResolves:j.transitional(j.boolean)},!1),r!=null&&(D.isFunction(r)?t.paramsSerializer={serialize:r}:Xi.assertOptions(r,{encode:j.function,serialize:j.function},!0)),t.allowAbsoluteUrls!==void 0||(this.defaults.allowAbsoluteUrls===void 0?t.allowAbsoluteUrls=!0:t.allowAbsoluteUrls=this.defaults.allowAbsoluteUrls),Xi.assertOptions(t,{baseUrl:j.spelling(`baseURL`),withXsrfToken:j.spelling(`withXSRFToken`)},!0),t.method=(D.getSafeProp(t,`method`)||D.getSafeProp(this.defaults,`method`)||`get`).toLowerCase();let a=i&&D.merge(i.common,i[t.method]);i&&D.forEach(Fr.concat(`common`),e=>{delete i[e]}),t.headers=O.concat(a,i);let o=[],s=!0;this.interceptors.request.forEach(function(e){if(typeof e.runWhen==`function`&&e.runWhen(t)===!1)return;s&&=e.synchronous;let n=t.transitional||xr;n&&n.legacyInterceptorReqResOrdering?o.unshift(e.fulfilled,e.rejected):o.push(e.fulfilled,e.rejected)});let c=[];this.interceptors.response.forEach(function(e){c.push(e.fulfilled,e.rejected)});let l,u=0,d;if(!s){let e=[Ki.bind(this),void 0];for(e.unshift(...o),e.push(...c),d=e.length,l=Promise.resolve(t);u<d;)l=l.then(e[u++],e[u++]);return l}d=o.length;let f=t;for(;u<d;){let e=o[u++],t=o[u++];try{f=e?e(f):f}catch(e){if(!t){l=Promise.reject(e);break}try{let n=t.call(this,e);D.isThenable(n)&&(l=Promise.resolve(n).then(()=>Ki.call(this,f)))}catch(e){l=Promise.reject(e)}break}}if(!l)try{l=Ki.call(this,f)}catch(e){l=Promise.reject(e)}for(u=0,d=c.length;u<d;)l=l.then(c[u++],c[u++]);return l}getUri(e){return e=ci(this.defaults,e),hr(ai(e.baseURL,e.url,e.allowAbsoluteUrls,e),e.params,e.paramsSerializer)}};D.forEach([`delete`,`get`,`head`,`options`],function(e){Zi.prototype[e]=function(t,n){return this.request(ci(n||{},{method:e,url:t,data:n&&D.hasOwnProp(n,`data`)?n.data:void 0}))}}),D.forEach([`post`,`put`,`patch`,`query`],function(e){function t(t){return function(n,r,i){return this.request(ci(i||{},{method:e,headers:t?{"Content-Type":`multipart/form-data`}:{},url:n,data:r}))}}Zi.prototype[e]=t(),e!==`query`&&(Zi.prototype[e+`Form`]=t(!0))});var Qi=class e{constructor(e){if(typeof e!=`function`)throw TypeError(`executor must be a function.`);let t;this.promise=new Promise(function(e){t=e});let n=this;this.promise.then(e=>{if(!n._listeners)return;let t=n._listeners.length;for(;t-->0;)n._listeners[t](e);n._listeners=null}),this.promise.then=e=>{let t,r=new Promise(e=>{n.subscribe(e),t=e}).then(e);return r.cancel=function(){n.unsubscribe(t)},r},e(function(e,r,i){n.reason||(n.reason=new Vr(e,r,i),t(n.reason))})}throwIfRequested(){if(this.reason)throw this.reason}subscribe(e){if(this.reason){e(this.reason);return}this._listeners?this._listeners.push(e):this._listeners=[e]}unsubscribe(e){if(!this._listeners)return;let t=this._listeners.indexOf(e);t!==-1&&this._listeners.splice(t,1)}toAbortSignal(){let e=new AbortController,t=t=>{e.abort(t)};return this.subscribe(t),e.signal.unsubscribe=()=>this.unsubscribe(t),e.signal}static source(){let t;return{token:new e(function(e){t=e}),cancel:t}}};function $i(e){return function(t){return e.apply(null,t)}}function ea(e){return D.isObject(e)&&e.isAxiosError===!0}var ta={Continue:100,SwitchingProtocols:101,Processing:102,EarlyHints:103,Ok:200,Created:201,Accepted:202,NonAuthoritativeInformation:203,NoContent:204,ResetContent:205,PartialContent:206,MultiStatus:207,AlreadyReported:208,ImUsed:226,MultipleChoices:300,MovedPermanently:301,Found:302,SeeOther:303,NotModified:304,UseProxy:305,Unused:306,TemporaryRedirect:307,PermanentRedirect:308,BadRequest:400,Unauthorized:401,PaymentRequired:402,Forbidden:403,NotFound:404,MethodNotAllowed:405,NotAcceptable:406,ProxyAuthenticationRequired:407,RequestTimeout:408,Conflict:409,Gone:410,LengthRequired:411,PreconditionFailed:412,PayloadTooLarge:413,ContentTooLarge:413,UriTooLong:414,UnsupportedMediaType:415,RangeNotSatisfiable:416,ExpectationFailed:417,ImATeapot:418,MisdirectedRequest:421,UnprocessableEntity:422,UnprocessableContent:422,Locked:423,FailedDependency:424,TooEarly:425,UpgradeRequired:426,PreconditionRequired:428,TooManyRequests:429,RequestHeaderFieldsTooLarge:431,UnavailableForLegalReasons:451,InternalServerError:500,NotImplemented:501,BadGateway:502,ServiceUnavailable:503,GatewayTimeout:504,HttpVersionNotSupported:505,VariantAlsoNegotiates:506,InsufficientStorage:507,LoopDetected:508,NotExtended:510,NetworkAuthenticationRequired:511,WebServerReturnsAnUnknownError:520,WebServerIsDown:521,ConnectionTimedOut:522,OriginIsUnreachable:523,TimeoutOccurred:524,SslHandshakeFailed:525,InvalidSslCertificate:526};Object.entries(ta).forEach(([e,t])=>{ta[t]===void 0&&(ta[t]=e)});function na(e){let t=new Zi(e),n=pt(Zi.prototype.request,t);return D.extend(n,Zi.prototype,t,{allOwnKeys:!0}),D.extend(n,t,null,{allOwnKeys:!0}),n.create=function(t){return na(ci(e,t))},n}var M=na(Rr);M.Axios=Zi,M.CanceledError=Vr,M.CancelToken=Qi,M.isCancel=Br,M.VERSION=ki,M.toFormData=ur,M.AxiosError=k,M.Cancel=M.CanceledError,M.all=function(e){return Promise.all(e)},M.spread=$i,M.isAxiosError=ea,M.mergeConfig=ci,M.AxiosHeaders=O,M.formToJSON=e=>Pr(D.isHTMLForm(e)?new FormData(e):e),M.getAdapter=Wi.getAdapter,M.HttpStatusCode=ta,M.default=M;var ra=`mateu-app-context`,ia=`mateu-app-context-labels`,aa=e=>{try{return JSON.parse(localStorage.getItem(e)??`{}`)}catch{return{}}},oa=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},sa=()=>aa(ra),ca=()=>aa(ia),la=(e,t,n)=>{let r=sa(),i=ca();t==null||t===``?(delete r[e],delete i[e]):(r[e]=t,n!==void 0&&(i[e]=n)),oa(ra,r),oa(ia,i)},ua=!1,da=()=>{ua||(ua=!0,window.addEventListener(`storage`,e=>{e.key===ra&&e.newValue!==e.oldValue&&window.location.reload()}))},fa,pa=(e,t)=>new Promise((n,r)=>{let i=!1,a={retry:()=>{i||(i=!0,t().then(n,r))},giveUp:()=>{i||(i=!0,r(e))}};if(fa){fa(a);return}let o=new CustomEvent(`mateu-session-expired`,{detail:a,cancelable:!0,bubbles:!1});typeof document<`u`&&!document.dispatchEvent(o)||a.giveUp()}),ma=(e,t)=>e.includes(`json`)?!0:typeof t==`object`&&!!t,ha=(e,t)=>{let n=e.finalUrl;if(!n)return;let r=t??(typeof window<`u`?window.location.href:void 0),i;try{i=new URL(e.requestedUrl,r).href}catch{return}if(i!==n&&!ma(e.contentType??``,e.data))return n},ga=new class{constructor(){this.windowMs=4e3,this.threshold=12,this.events=[],this.reported=new Set}check(e,t=Date.now()){this.events.push({sig:e,t});let n=t-this.windowMs;this.events=this.events.filter(e=>e.t>=n);let r=0;for(let t of this.events)t.sig===e&&r++;if(r>=this.threshold){let t=!this.reported.has(e);return this.reported.add(e),{blocked:!0,firstTrip:t}}return this.reported.delete(e),{blocked:!1,firstTrip:!1}}reset(){this.events=[],this.reported.clear()}configure(e){e.windowMs!==void 0&&(this.windowMs=e.windowMs),e.threshold!==void 0&&(this.threshold=e.threshold)}},_a=[`eyesOnly`,`readOnlyUnless`,`disabledUnless`,`access`],va=!1,ya=(e,t)=>{if(Array.isArray(e))return e.map(e=>ya(e,t));if(e&&typeof e==`object`){let n={};for(let[r,i]of Object.entries(e)){if(_a.includes(r)){t.any=!0;continue}n[r]=ya(i,t)}return n}return e};function ba(e){let t={any:!1},n=ya(e,t);return t.any?(va||(va=!0,console.warn(`mateu: access rules (eyesOnly/readOnlyUnless/disabledUnless/access) need a server to check who is asking — with none, the page renders unrestricted`)),n):e}var xa=function(e){return e.Add=`Add`,e.Replace=`Replace`,e.ReplaceKeepData=`ReplaceKeepData`,e}({}),Sa=[],Ca=e=>{Sa=Array.isArray(e)?e:[]},wa=e=>e?Sa.find(t=>t.name===e)?.component:void 0,Ta={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Ea=e=>(...t)=>({_$litDirective$:e,values:t}),Da=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},Oa=!1,ka=e=>{Oa=e},Aa=()=>Oa,ja=e=>Oa&&e?.id?e.id:p,Ma=e=>{let t=e.startNode?e.startNode.nextSibling:e.parentNode?.firstChild??null;for(;t&&t!==e.endNode;){if(t.nodeType===1)return t;t=t.nextSibling}return null},Na=Ea(class extends Da{constructor(e){if(super(e),e.type!==Ta.CHILD)throw Error(`stampNodeId only works in a child position`)}render(e,t){return t}update(e,[t,n]){return queueMicrotask(()=>{let n=Ma(e);n&&n.getAttribute(`data-node-id`)!==t&&n.setAttribute(`data-node-id`,t)}),n}}),Pa=e=>Oa&&typeof e.id==`string`&&e.id?e.id:e.actionId,Fa=(e,t)=>Oa&&typeof e.id==`string`&&e.id?l`${Na(e.id,t)}`:t,Ia=new Set([`id`,`style`,`cssClasses`,`slot`,`initialData`,`confirmOnNavigationIfDirty`,`sizing`]),La=new Set([`Form`,`FormLayout`,`VerticalLayout`,`HorizontalLayout`,`Div`,`FlexLayout`,`CustomComponent`]),Ra={Card:[`content`,`title`,`subtitle`,`footer`,`header`,`media`,`headerPrefix`,`headerSuffix`],Form:[`header`,`footer`,`avatar`]},za={HeroSection:`content`,DashboardLayout:`items`,DashboardPanel:`content`,Scoreboard:`metrics`,TabLayout:`tabs`,Tab:`content`},Ba=new Set([`Listing`,`Crudl`,`Crud`]);function Va(e){let{note:t,...n}=e;if(Ba.has(n.type))return Ka(n);if(n.type===`FoldoutLayout`)return Ga(n);if(n.type===`ComponentRef`)return wa(n.ref)||{type:C.ClientSide,metadata:{type:`Text`,text:`Unknown business component: ${n.ref}`},children:[]};let{type:r,content:i,children:a,...o}=n,s={},c={type:r};for(let[e,t]of Object.entries(o))Ia.has(e)?s[e]=t:c[e]=(e===`toolbar`||e===`buttons`)&&Array.isArray(t)?t.map(Ya):t;r===`FormField`&&(o.id!==void 0&&(c.fieldId=o.id),delete c.id,c.dataType=c.dataType??`string`,c.stereotype=c.stereotype??`regular`),r===`HeroSection`&&c.tone===`auto`&&delete c.tone;let l=[];if(za[r]){let e=za[r],t=e===`content`?i:o[e];delete c[e],l=t==null?[]:Array.isArray(t)?t:[t]}else if(La.has(r)){let e=i??a??[];l=Array.isArray(e)?e:[e]}for(let e of Ra[r]??[]){let t=Wa(e===`content`?i:c[e]);t!==void 0&&(c[e]=t)}if(r===`Form`&&Ua(c.avatar)){let e=c.avatar;e.style=(typeof e.style==`string`?e.style:``)+`;width: 4rem;height: 4rem;`}return{...s,type:C.ClientSide,metadata:c,children:l.map(Va)}}var Ha=e=>!!e&&typeof e==`object`&&!Array.isArray(e)&&typeof e.type==`string`,Ua=e=>!!e&&typeof e==`object`&&!Array.isArray(e);function Wa(e){if(Ha(e))return Va(e);if(Array.isArray(e))return e.map(e=>Ha(e)?Va(e):e)}function Ga(e){let{type:t,content:n,children:r,overview:i,panels:a,badges:o,...s}=e,c={},l={type:t};for(let[e,t]of Object.entries(s))Ia.has(e)?c[e]=t:l[e]=t;let u=[];return Ha(i)&&u.push({...Va(i),slot:`overview`}),l.panels=(Array.isArray(a)?a:[]).map((e,t)=>(Ha(e.content)&&u.push({...Va(e.content),slot:`panel-`+t}),Ha(e.summary)&&u.push({...Va(e.summary),slot:`summary-`+t}),Object.fromEntries(Object.entries({title:e.title,subtitle:e.subtitle,icon:e.icon,open:!!e.open,width:e.width,id:Aa()&&typeof e.id==`string`?e.id:void 0}).filter(([,e])=>e!==void 0)))),Array.isArray(o)&&(l.badges=o.map(e=>e?.text).filter(e=>typeof e==`string`&&e.trim()!==``)),{...c,type:C.ClientSide,metadata:l,children:u}}function Ka(e){let{type:t,content:n,children:r,...i}=e,a={id:`crud`,sizing:`fill`},o={type:`Crud`,crudlType:i.crudlType??i.listingType??`table`,pageSize:10,searchOnEnter:!0,autoFocusOnSearchText:!0,filtersLayout:`auto`,gridLayout:`auto`};for(let[e,t]of Object.entries(i))e!==`crudlType`&&e!==`listingType`&&(Ia.has(e)?a[e]=t:e===`columns`&&Array.isArray(t)?o[e]=t.map(qa):e===`toolbar`&&Array.isArray(t)?o[e]=t.map(Ya):e===`filters`&&Array.isArray(t)?o[e]=t.map(Xa):e===`preSearch`&&Array.isArray(t)?t.length>0&&(o[e]=t.map(Va)):o[e]=t);return{...a,type:C.ClientSide,metadata:o,children:[]}}function qa(e){let t=Va(e);return e.id!==void 0&&t.metadata&&(t.metadata.id=e.id),t}var Ja=e=>e.replace(/[^\p{L}\p{N}]+/gu,` `).trim().split(/\s+/).filter(Boolean).map((e,t)=>t===0?e.charAt(0).toLowerCase()+e.slice(1):e.charAt(0).toUpperCase()+e.slice(1)).join(``);function Ya(e){if(!e||e.type!==`Button`)return e;let{actionable:t,...n}=e,r={...n};return t?.type===`RouteLink`&&t.route&&(r.route=t.route),!r.actionId&&typeof r.label==`string`&&(r.actionId=Ja(r.label)),r}function Xa(e){if(!e||e.type!==`FormField`)return e;let{id:t,...n}=e;return{...n,fieldId:n.fieldId??t,dataType:n.dataType??`string`,stereotype:n.stereotype??`regular`}}var Za=[],Qa=e=>{Za=Array.isArray(e)?e.filter(e=>e&&typeof e.id==`string`&&e.id.trim()!==``):[]},$a=()=>Za,eo=[`label`,`dataType`,`stereotype`,`placeholder`,`description`,`required`,`readOnly`,`options`,`optionsSource`,`min`,`max`,`step`,`colspan`,`style`,`cssClasses`,`align`,`width`,`autoWidth`,`tones`],to={GridColumn:[`label`,`dataType`,`stereotype`,`style`,`cssClasses`,`align`,`width`,`autoWidth`,`tones`],FormField:[`label`,`dataType`,`stereotype`,`placeholder`,`description`,`required`,`readOnly`,`options`,`optionsSource`,`min`,`max`,`step`,`colspan`,`style`,`cssClasses`]},no=e=>e==null||e===``||Array.isArray(e)&&e.length===0||typeof e==`object`&&!Array.isArray(e)&&Object.keys(e).length===0,ro=`fieldType`,io=e=>{if(Array.isArray(e))return e.some(io);if(!e||typeof e!=`object`)return!1;let t=e;return typeof t.fieldType==`string`||Object.values(t).some(io)},ao=e=>e===void 0?e:JSON.parse(JSON.stringify(e));function oo(e,t=Za){if(!io(e))return e;let n=new Map(t.map(e=>[e.id.trim(),e])),r=new Set,i=e=>{if(Array.isArray(e))return e.map(i);if(!e||typeof e!=`object`)return e;let t={};for(let[n,r]of Object.entries(e))n!==`fieldType`&&(t[n]=i(r));let a=e[ro];if(typeof a==`string`){let e=n.get(a.trim());if(!e)r.has(a)||(r.add(a),console.warn(`mateu: unknown field type '${a}' (on '${String(t.id??``)}') — rendered as declared`));else{let n=to[String(t.type??``)]??eo;for(let r of n){let n=e[r];no(n)||(t[r]===void 0||t[r]===null)&&(t[r]=ao(n))}}}return t};return i(e)}var so=`ux_main`;function co(e){return!(e.viewModel??e.modelView)&&!!lo(e)}function lo(e){if(e.layout&&typeof e.layout==`object`)return e.layout;if(typeof e.type==`string`)return e}function uo(e,t,n,r={}){e=ba(e),e=oo(e);let i=lo(e);if(!i)throw Error(`Definition for route "${t}" has no layout to expand`);if(i.type===`AppShell`)return wo(i);let a=n??(typeof i.title==`string`?i.title:t),o=Va(i);return{commands:[{targetComponentId:so,type:`SetWindowTitle`,data:a}],messages:[],fragments:[{targetComponentId:so,component:po(e,o,r),data:void 0,state:void 0,action:xa.Replace,containerId:void 0}],banners:[],appendBanners:!1,appData:void 0,appState:void 0}}function fo(e){return e.ref?{ref:e.ref}:Object.fromEntries(Object.entries(e).filter(([,e])=>e!=null))}function po(e,t,n){let r=(e.actions??[]).map(ho);r.push(...Mo(e.layout??t,r));let i=[...e.triggers??[]];if(n.data&&(n.data.ref||n.data.url)&&(r.push({id:`__restdata__`,restAction:{source:fo(n.data),resultPath:``}}),i.push({type:`OnLoad`,actionId:`__restdata__`,times:1})),!r.length&&!i.length)return t;let a=n.path??``;return{type:C.ServerSide,id:`page_`+(a||`root`).replace(/[^A-Za-z0-9_-]/g,`_`),serverSideType:void 0,route:`/`+a,initialData:{},actions:r,triggers:i,rules:[],validations:[],children:[t]}}function mo(e){let t=(e,t)=>({targetComponentId:null,type:e,data:t}),n=(e,t)=>({eventName:e,detail:t??null});switch(e?.type){case`Navigate`:return t(`NavigateTo`,e.route??null);case`Emit`:return t(`DispatchEvent`,n(e.event,e.payload));case`CloseOverlay`:return t(`CloseModal`,e.event?n(e.event,null):null);case`RunAction`:return t(`RunAction`,{actionId:e.actionId});case`MarkClean`:return t(`MarkAsClean`,null);case`MarkDirty`:return t(`MarkAsDirty`,null);default:return}}function ho(e){if(!e||typeof e!=`object`||!(`description`in e)&&!Array.isArray(e.steps))return e;let{description:t,...n}=e;if(!Array.isArray(n.steps))return n;let{steps:r,...i}=n,a=r.map(mo).filter(Boolean);return a.length?{...i,commands:a}:i}function go(e){if(typeof e!=`string`||!e)return``;let t=e.replace(/\./g,` `).replace(/(?<=[A-Z])(?=[A-Z][a-z])|(?<=[^A-Z])(?=[A-Z])|(?<=[A-Za-z])(?=[^A-Za-z])/g,` `).toLowerCase().replace(/ +/g,` `);return t.length<=1?t:t.split(` `).map((e,t)=>t>0&&e?e[0].toUpperCase()+e.substring(1):e).join(``)}function _o(e){return e.type!==`RuleLink`||!Array.isArray(e.rules)?[]:e.rules.map(e=>({filter:e.filter??null,action:e.action??null,fieldName:e.fieldName??null,fieldAttribute:e.fieldAttribute??null,value:e.value??null,expression:e.expression??null,result:e.result??null,actionId:e.actionId??null}))}function vo(e){let t=`/`+(typeof e.route==`string`&&e.route?e.route:typeof e.path==`string`?e.path:e.type===`RuleLink`?go(e.label):``).replace(/^\/+/,``),n=e.submenu??e.submenus??e.menu;return{label:e.label,icon:e.icon,path:t,route:t,consumedRoute:``,uriPrefix:``,visible:!e.hidden,selected:!1,disabled:!1,separator:e.type===`MenuSeparator`,remote:!1,rules:_o(e),submenus:Array.isArray(n)?n.map(vo):[]}}function yo(e){for(let t of e){if(t.type===`RouteLink`&&(t.route||t.path))return t.route??t.path;let e=t.submenu??t.submenus??t.menu;if(Array.isArray(e)){let t=yo(e);if(t)return t}}}var bo=e=>{let t=e.submenu??e.submenus??e.menu;return Array.isArray(t)?t:void 0},xo=e=>e.type===`Menu`||!e.type&&!!bo(e),So=e=>e.some(e=>e.type===`RemoteMenu`||xo(e)&&So(bo(e)??[]));function Co(e,t){return typeof e==`string`&&e.trim()&&e.trim().toUpperCase()!==`AUTO`?e.trim():So(t)?`MENU_ON_TOP`:t.some(xo)?t.some(e=>xo(e)&&(bo(e)??[]).some(xo))?`TILES`:t.length>7?`HAMBURGUER_MENU`:`MENU_ON_TOP`:`TABS`}function wo(e){let t=e.menu??[],n=(e.widgets??[]).filter(e=>e&&typeof e==`object`),r=t=>e[t]===!0||e[t]===`true`;return{commands:[{targetComponentId:so,type:`SetWindowTitle`,data:e.title??``}],messages:[],fragments:[{targetComponentId:so,component:{type:C.ClientSide,id:`app`,metadata:{type:`App`,route:``,rootRoute:``,variant:Co(e.variant,t),layout:`SINGLE_SLOT`,title:e.title,subtitle:e.subtitle,logo:e.logo,favicon:e.favicon,themeToggle:r(`themeToggle`),commandCenterEnabled:r(`commandCenter`)||r(`chromeless`),chromeless:r(`chromeless`),accessKeys:r(`accessKeys`),mobileQr:r(`mobileQr`),drawerClosed:r(`drawerClosed`),style:typeof e.style==`string`?e.style:void 0,cssClasses:typeof e.cssClasses==`string`?e.cssClasses:void 0,accentColor:typeof e.accentColor==`string`&&e.accentColor.trim()?e.accentColor.trim():void 0,menu:t.map(vo),totalMenuOptions:t.length,homeRoute:(typeof e.homeRoute==`string`&&e.homeRoute.trim()?e.homeRoute.trim().replace(/^\/+/,``):yo(t))??``,homeConsumedRoute:``,homeBaseUrl:``,apps:[],fabs:[],contextSelectors:[],contextActions:[],actions:(e.actions??[]).filter(e=>e&&typeof e==`object`).map(ho),actionCatalogue:ko()},children:n.map(e=>({...Va(e),slot:`widgets`}))},data:void 0,state:void 0,action:xa.Replace,containerId:void 0}],banners:[],appendBanners:!1,appData:void 0,appState:void 0}}var To=[],Eo=e=>{To=Array.isArray(e)?e.filter(e=>e&&typeof e.id==`string`):[]},Do=e=>{let t=new Map;for(let n of Array.isArray(e)?e:[]){if(!n||typeof n!=`object`)continue;let e=n;if(!(typeof e.id!=`string`||!e.id)){if(!(Array.isArray(e.steps)&&e.steps.length>0||e.restAction)){console.warn(`mateu: action catalogue entry "${e.id}" is not client-runnable (no steps, no restAction) — ignored`);continue}t.set(e.id,ho(e))}}return[...t.values()]},Oo=e=>e?To.find(t=>t.id===e):void 0,ko=()=>To,Ao=(e,t,n)=>t?(e??[]).find(e=>e&&e.id===t)||((n??[]).find(e=>e&&e.id===t)??Oo(t)):void 0,jo=(e,t=new Set)=>{if(Array.isArray(e))e.forEach(e=>jo(e,t));else if(e&&typeof e==`object`)for(let[n,r]of Object.entries(e))typeof r==`string`&&(n===`actionId`||n.endsWith(`ActionId`))&&r?t.add(r):r&&typeof r==`object`&&jo(r,t);return t},Mo=(e,t=[],n=To)=>{if(!n.length)return[];let r=new Set(t.map(e=>e?.id).filter(Boolean)),i=[...jo([e,t])],a=[];for(;i.length;){let e=i.shift();if(r.has(e))continue;let t=n.find(t=>t.id===e);t&&(r.add(e),a.push(t),i.push(...jo(t)))}return a},No=/\$\{\s*i18n\.([A-Za-z0-9_][A-Za-z0-9_.-]*)\s*\}/g,Po=`en`,Fo=e=>(e??``).trim().replace(/_/g,`-`).toLowerCase(),Io=(e,t)=>Object.keys(e).find(e=>Fo(e)===t);function Lo(e,t){if(!e)return;let n=Object.keys(e);if(n.length){for(let n of t){let t=Fo(n);if(!t)continue;let r=Io(e,t);if(r)return r;let i=Io(e,t.split(`-`)[0]);if(i)return i}return Io(e,Fo(Po))??Io(e,Fo(Po).split(`-`)[0])??n[0]}}var Ro=new Set;function zo(e,t,n){return typeof e!=`string`||!e.includes(`i18n.`)?e:e.replace(No,(e,r)=>{let i=t?.[r]??n?.[r];return i===void 0?(Ro.has(r)||(Ro.add(r),console.warn(`mateu: missing translation '${r}' — showing the key`)),r):i})}function Bo(e,t,n){let r=e=>{if(typeof e==`string`)return zo(e,t,n);if(Array.isArray(e))return e.map(r);if(e&&typeof e==`object`){let t={};for(let[n,i]of Object.entries(e))t[n]=r(i);return t}return e};return r(e)}var Vo=e=>{if(e==null)return!1;let t=typeof e==`string`?e:JSON.stringify(e);return No.lastIndex=0,No.test(t)},Ho=()=>{let e=globalThis.navigator;return e?[...e.languages??[],...e.language?[e.language]:[]]:[]},Uo,Wo=new Map,Go=[],Ko,qo=[],Jo=[],Yo={},Xo={},Zo,Qo=e=>{Zo=e||void 0},$o=()=>{let e=ps(Uo?.get(`_no_route`));return typeof e?.locale==`string`&&e.locale?e.locale:void 0},es=()=>Lo(Xo,[Zo,$o(),...Ho()]),ts=e=>{if(e===void 0||!Object.keys(Xo).length||!Vo(e))return e;let t=es(),n=Lo(Xo,[]);return Bo(e,t?Xo[t]:void 0,n&&n!==t?Xo[n]:void 0)},ns=e=>e.split(`/`).filter(e=>e.startsWith(`:`)&&e.length>1).map(e=>e.substring(1)),rs=e=>{let t=e=>e.replace(/^\/+/,``).replace(/\/+$/,``),n=t(e===`_no_route`?``:e),r=n===``?[]:n.split(`/`),i;for(let e of qo){let n=t(e.route??``),a=n===``?[]:n.split(`/`);if(a.length!==r.length)continue;let o={},s=!0;for(let e=0;e<a.length;e++){let t=a[e];if(t.startsWith(`:`)&&t.length>1)o[t.substring(1)]=r[e];else if(t!==r[e]){s=!1;break}}if(!s)continue;let c={entry:e,pathParams:o};(!i||ns(n).length<ns(t(i.entry.route??``)).length)&&(i=c)}return i},is=(e,t)=>{let n=rs(e);if(!n)return t;let{entry:r,pathParams:i}=n,a=r.defaultParams??{},o=r.fixedParams??{};return!Object.keys(a).length&&!Object.keys(o).length&&!Object.keys(i).length?t:{...t,fragments:(t.fragments??[]).map(e=>({...e,state:{...a,...e.state??{},...i,...o},data:{...a,...e.data??{},...i,...o}}))}},as=e=>{let t=e&&e.startsWith(`/`)?e.substring(1):e??``;return t===``?`_no_route`:t};function os(e,t=fetch){return Ko=(async()=>{try{let n=await t(e);if(!n.ok)return;let r=await n.json(),i=new Map,a=new Map,o=[];for(let e of r.entries??[])if(!(!e.ok||!e.json))try{let t=JSON.parse(e.json),n=e.contentJson?JSON.parse(e.contentJson):void 0;e.routePattern?o.push({regex:new RegExp(e.routePattern),paramNames:e.paramNames??[],increment:t,content:n}):(i.set(e.syncPath,t),n&&a.set(e.syncPath,n))}catch(t){console.warn(`mateu: bundle entry parse failed for`,e.syncPath,t)}Uo=i,Wo=a,Go=o,qo=r.routes?.routes??[],Yo=r.definitions??{},Jo=r.sources?.sources??[],Xo=r.translations??{},r.environment,ae(r.sources?.sources),Eo(r.actions),r.mockSources&&de(!0),r.types&&Qa(r.types.types)}catch(e){console.warn(`mateu: bundle manifest load failed`,e)}})(),Ko}var ss=()=>Ko??Promise.resolve(),cs=()=>Uo!==void 0&&Uo.size>0||Go.length>0||Object.keys(Yo).length>0,ls=e=>{let t=Uo?.get(e);return t===void 0?void 0:is(e,t)},us=(e,t=!1)=>{for(let n of Go){let r=n.regex.exec(e);if(!r)continue;let i=t?n.content:n.increment;if(!i)return;let a={};return n.paramNames.forEach((e,t)=>{a[e]=r[t+1]}),is(e,{...i,fragments:(i.fragments??[]).map(e=>({...e,component:ds(e.component,a),state:{...e.state??{},...a},data:{...e.data??{},...a}}))})}},ds=(e,t)=>{let n=e;return!n||!n.initialData||typeof n.initialData!=`object`?e:{...n,initialData:{...n.initialData,...t}}},fs=e=>{let t=rs(e),n=t?.entry.definition;if(!n)return;let r=Yo[n];if(!r||!co(r))return;let i=uo(ts(r),t.entry.route,void 0,{data:t.entry.data??void 0,path:e===`_no_route`?``:e});return is(e,{...i,fragments:(i.fragments??[]).map(e=>{let t=ps({fragments:[e]}),n=t?{...e.component,metadata:{...t,restSources:Jo}}:e.component;return{...e,component:n,targetComponentId:void 0}})})},ps=e=>{let t=e?.fragments?.[0]?.component;return t?.metadata?.type===`App`?t.metadata:void 0},ms=(e,t)=>{if(t===`_no_route`)return e;let[n,...r]=e.fragments??[],i=n.component;return{...e,fragments:[{...n,component:{...i,metadata:{...i.metadata,homeRoute:`/`+t}}},...r]}},hs=(e,t)=>ts(gs(e,t)),gs=(e,t)=>{let n=t===void 0||t===`_empty`,r=()=>ls(e)??us(e)??fs(e);if(n){let t=r();if(t&&ps(t))return ms(t,e);if(e!==`_no_route`&&(rs(e)||!t)){let t=ls(`_no_route`)??fs(`_no_route`);if(t&&ps(t))return ms(t,e)}return t}let i=Wo.get(e)===void 0?us(e,!0):is(e,Wo.get(e));if(i)return i;let a=r();return a&&ps(a)?void 0:a},_s=e=>e?t(`errorStatus`,{status:e}):``,vs={offline:()=>r(`failOffline`),timeout:()=>r(`failTimeout`),server:e=>t(`failServer`,{status:_s(e)}),unauthorized:()=>r(`failUnauthorized`),forbidden:()=>r(`forbidden`),notFound:()=>r(`failNotFound`),client:e=>t(`failClient`,{status:_s(e)}),cancelled:()=>``,unknown:()=>r(`failUnknown`)},ys=new Set([`offline`,`timeout`,`server`]),bs=(e,t={})=>{let n=e??{},r=n.response?.status,i=n.code,a=t.online??(typeof navigator<`u`&&typeof navigator.onLine==`boolean`?navigator.onLine:!0),o=e=>({kind:e,message:vs[e](r),retryable:ys.has(e),status:r});return i===`ERR_CANCELED`?o(`cancelled`):i===`ECONNABORTED`||i===`ETIMEDOUT`||/timeout/i.test(n.message??``)?o(`timeout`):r===void 0?!a||i===`ERR_NETWORK`||/network error/i.test(n.message??``)?o(`offline`):o(`unknown`):o(r===401?`unauthorized`:r===403?`forbidden`:r===404||r===410?`notFound`:r===408||r===429?`timeout`:r>=500?`server`:r>=400?`client`:`unknown`)},xs=e=>e.kind!==`forbidden`,Ss=new Set([``,`__load__`,`search`,`_globalsearch`,`_notifications-list`]),Cs=[`_appcontext-search-`,`search-`],ws=(e,t)=>t===!0?!0:e==null?!1:Ss.has(e)?!0:Cs.some(t=>e.startsWith(t)),Ts=(e,t=Math.random)=>{let n=300*3**Math.max(0,e-1);return Math.round(n*(.75+t()*.5))},Es=(e,t,n)=>!n.idempotent||t>2||!e.retryable?!1:e.kind===`timeout`||e.kind===`server`,Ds=new class{constructor(){this.linkUp=!0,this.listeners=new Set,this.waiters=new Set,this.started=!1}start(){this.started||typeof window>`u`||(this.started=!0,this.linkUp=typeof navigator<`u`&&typeof navigator.onLine==`boolean`?navigator.onLine:!0,window.addEventListener(`online`,()=>{this.linkUp=!0,this.reachable=void 0,this.changed(),this.releaseWaiters()}),window.addEventListener(`offline`,()=>{this.linkUp=!1,this.changed()}))}isOnline(){return this.linkUp?this.reachable!==!1:!1}noteReachable(){let e=this.isOnline();this.reachable=!0,e||(this.changed(),this.releaseWaiters())}noteUnreachable(){let e=this.isOnline();this.reachable=!1,e&&this.changed()}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}whenBack(e){return this.isOnline()?(e(),()=>{}):(this.waiters.add(e),()=>this.waiters.delete(e))}reset(){this.linkUp=!0,this.reachable=void 0,this.waiters.clear()}changed(){let e=this.isOnline();this.listeners.forEach(t=>t(e))}releaseWaiters(){let e=Array.from(this.waiters);this.waiters.clear(),e.forEach(e=>e())}};Ds.start();var Os=`useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict`,ks=(e=21)=>{let t=``,n=crypto.getRandomValues(new Uint8Array(e|=0));for(;e--;)t+=Os[n[e]&63];return t},As=e=>{try{return globalThis[e]??void 0}catch{return}},js=e=>{let t={get(t){try{return As(e)?.getItem(t)??null}catch{return null}},set(t,n){try{let r=As(e);return r?(r.setItem(t,n),!0):!1}catch{return!1}},remove(t){try{As(e)?.removeItem(t)}catch{}},getJson(e,n){let r=t.get(e);if(r==null)return n;try{return JSON.parse(r)}catch{return n}},setJson(e,n){try{return t.set(e,JSON.stringify(n))}catch{return!1}}};return t},Ms=js(`localStorage`),Ns=js(`sessionStorage`),Ps=`__mateu_auth_token`,Fs=`__mateu_sesion_id`,Is,Ls,Rs=null,zs=()=>{try{let e=typeof document<`u`?document.querySelector(`meta[name="mateu-auth-token-storage"]`)?.getAttribute(`content`):void 0;return e===`localStorage`||e===`sessionStorage`||e===`memory`?e:void 0}catch{return}},Bs=()=>Is??zs()??`localStorage`,Vs=()=>{if(Ls)try{let e=Ls();if(e)return e}catch{}switch(Bs()){case`memory`:return Rs;case`sessionStorage`:return Ns.get(Ps);default:return Ms.get(Ps)}},Hs=()=>{let e=Vs();return e?{Authorization:`Bearer `+e}:{}},Us,Ws=(e=!0)=>{let t=Ns.get(Fs);if(t)return t;if(Us)return Us;if(!e)return null;let n=ks();return Ns.set(`__mateu_sesion_id`,n)||(Us=n),n},Gs=(e,t,n)=>{let r=t??{},i=!!r.config||!!r.response,a=r.config?.headers?.traceparent;return{kind:e.kind,message:e.message,status:e.status??r.response?.status,detail:typeof t==`string`?t:r.message,url:r.config?.url,actionId:n,traceparent:typeof a==`string`?a:void 0,stack:i?void 0:r.stack}},Ks=null,qs=e=>{Ks?.report(e)},Js=(e,t)=>`${e??``}|${t??``}`,Ys=(e,t,n)=>!n||e===void 0||e===t,Xs=(e,t)=>{let n=e.generation,r=e.callbackToken,i=e.connected;return()=>e.generation!==n||t&&e.callbackToken!==r||i&&!e.connected},Zs=class extends Error{constructor(e,t){super(`response to '${e}' arrived for a view no longer on screen`),this.actionId=e,this.outcome=t,this.__mateuStale=!0,this.__mateuReported=!0,this.code=`ERR_CANCELED`}},Qs=e=>!!e&&typeof e==`object`&&e.__mateuStale===!0,$s={show:e=>console.debug(`[mateu] no notifier registered, dropping toast:`,e.text)};function ec(e){$s=e}function tc(e,t){$s.show(e,t)}function nc(e,t=3){if(typeof e!=`string`||e.trim()===``)return{ok:!0};let n=parseInt(e.trim().split(`.`)[0]??``,10);return Number.isFinite(n)?n===t?{ok:!0}:{ok:!1,serverMajor:n,received:e.trim()}:{ok:!0}}function rc(e,n=3){return t(`wireVersionMismatch`,{server:`${e}.x`,supported:`${n}.x`})}var ic=!1,ac=e=>{console.error(`[mateu] `+e),typeof document<`u`&&document.body&&tc({text:e,variant:`error`,position:`topStretch`,duration:0,actionLabel:r(`dismiss`),onAction:()=>void 0},document.body)};function oc(e,t=ac){if(!e||typeof e!=`object`)return{ok:!0};let n=nc(e.wireVersion);return!n.ok&&!ic&&(ic=!0,t(rc(n.serverMajor))),n}var sc=[],cc=6e4,lc=e=>new Promise(t=>setTimeout(t,e)),uc=new class{constructor(){this.axiosInstance=M.create({timeout:cc}),this.axiosInstance.interceptors.request.use(e=>(this.addAuthToken(e),this.addSessionId(e),e)),this.axiosInstance.interceptors.response.use(e=>{let t=ha({requestedUrl:this.axiosInstance.getUri(e.config),finalUrl:e.request?.responseURL,contentType:String(e.headers?.[`content-type`]??``),data:e.data});if(t)throw window.location.assign(t),Object.assign(Error(`session lost — redirecting to `+t),{code:`ERR_CANCELED`});return e},e=>{let t=e;if(t?.response?.status===401&&t.config&&!t.config.__mateuRetried&&!t.config.__mateuIsStale?.()){let n=t.config;return n.__mateuRetried=!0,pa(e,()=>this.axiosInstance.request(n))}throw e})}addSessionId(e){let t=Ws();t&&(e.headers[`X-Session-Id`]=t)}addAuthToken(e){let t=Vs();t&&(e.headers.Authorization=`Bearer `+t)}async wrap(e,t,n,r,i,a=!1,o){n||t.dispatchEvent(new CustomEvent(`backend-called-event`,{bubbles:!0,composed:!0,detail:{}}));let s=e=>{throw t.dispatchEvent(new CustomEvent(`backend-cancelled-event`,{bubbles:!0,composed:!0,detail:{actionId:r}})),new Zs(r,e)};return e().then(e=>(o?.()&&s(`answered`),t.dispatchEvent(new CustomEvent(`backend-succeeded-event`,{bubbles:!0,composed:!0,detail:{actionId:r}})),e),e=>{o?.()&&s(`failed`);let n=bs(e,{online:Ds.isOnline()});throw a||(n.kind==`cancelled`?t.dispatchEvent(new CustomEvent(`backend-cancelled-event`,{bubbles:!0,composed:!0,detail:{actionId:r}})):(e&&typeof e==`object`&&(e.__mateuReported=!0),t.dispatchEvent(new CustomEvent(`backend-failed-event`,{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(e),failure:n,retry:i}})))),e})}async sendWithRetry(e,t,n=!1,r){let i=0;for(;;)try{let t=await e();return n||Ds.noteReachable(),t}catch(e){let a=bs(e,{online:Ds.isOnline()});if(a.kind==`offline`&&!n&&Ds.noteUnreachable(),i++,r?.()||!Es(a,i,{idempotent:t}))throw e;await lc(Ts(i))}}serialize(e){return e?.message?e:JSON.stringify(e)}release(e){sc=sc.filter(t=>t!==e)}async get(e){let t=new AbortController;return sc=[...sc,t],this.axiosInstance.get(e,{signal:t.signal}).finally(()=>this.release(t))}async post(e,t,n,r){let i=new AbortController;return sc=[...sc,i],this.axiosInstance.post(e,t,{signal:i.signal,...r?{__mateuIsStale:r}:{},...n&&n>0?{timeout:n}:{}}).finally(()=>this.release(i))}async abortAll(){sc.forEach(e=>e.abort()),sc=[]}async runAction(e,t,n,i,a,o,s,c,l,u,d,f={}){if(t&&t.startsWith(`/`)&&(t=t.substring(1)),i===``&&(await ss(),cs())){let e=hs(as(t),n);if(e){let t={...e,fragments:(e.fragments??[]).map(e=>e.targetComponentId?e:{...e,targetComponentId:a})};return await this.wrap(()=>Promise.resolve(t),u,d,i,f.retry,!1,f.isStale)}}let p=[e,t,n,s??``,i,a].join(``),m=ga.check(p);if(m.blocked)return await this.abortAll(),m.firstTrip&&(console.error(`[mateu] request loop detected — aborting repeated request`,p),qs({kind:`request-loop`,message:`A repeating request was detected and stopped`,url:e+`/mateu/v3/sync/`+(t||`_no_route`),actionId:i})),{messages:m.firstTrip?[{title:``,text:r(`repeatingRequest`),position:`bottom-end`,variant:`error`,duration:6e3}]:[],commands:[],fragments:[],banners:[],appendBanners:!1,appData:void 0,appState:void 0};o={...sa(),...o};let h=e+`/mateu/v3/sync/`+(t&&t!=``?t:`_no_route`),g={serverSideType:s,appState:o,componentState:c,parameters:l,initiatorComponentId:a,consumedRoute:n,route:t&&t!=``?`/`+t:``,actionId:i,knownStructureHash:f.knownStructureHash},_=ws(i,f.idempotent),v=()=>this.post(h,g,f.timeoutMillis,f.isStale).then(e=>(oc(e.data),e.data));return await this.wrap(()=>this.sendWithRetry(v,_,f.quiet,f.isStale),u,d,i,f.retry,f.quiet,f.isStale)}},dc=e=>{let t=(e??``).trim(),n=t.search(/[?#]/);for(n>=0&&(t=t.slice(0,n)),t&&!t.startsWith(`/`)&&(t=`/`+t);t.length>1&&t.endsWith(`/`);)t=t.slice(0,-1);return t},fc=e=>{let t=e??``,n;do n=t,t=t.replace(/<[^<>]*>/g,``);while(t!==n);return t.replace(/[<>]/g,``).replace(/\s+/g,` `).trim()},pc=(e,t)=>!!e&&e!==`/`&&(t===e||t.startsWith(e+`/`)),N=e=>!!e&&!!e.remote,mc=e=>N(e)?dc(e.routePrefix||e.path||e.route):``,hc=(e,t)=>{if(!e||e.separator)return-1;let n=dc(t);if(N(e)){let t=mc(e);return pc(t,n)?t.length:-1}let r=-1,i=dc(e.route);pc(i,n)&&(r=i.length);for(let t of e.submenus??[])r=Math.max(r,hc(t,n));return r},gc=(e,t)=>hc(e,t)>=0;function _c(e,t){let n=NaN,r=-1;return(e??[]).forEach((e,i)=>{let a=hc(e,t);a>r&&(r=a,n=i)}),n}function vc(e,t){let n=dc(t),r,i=yc(e),a=(e,t,n)=>{(!r||e.length>r.route.length||e.length===r.route.length&&r.pending&&!n)&&(r={crumbs:t,route:e,pending:n})},o=(e,t)=>{for(let r of e??[]){if(!r||r.separator)continue;let e=fc(r.label);if(N(r)){let i=mc(r);pc(i,n)&&a(i,[...t,{text:e}],!0);continue}let s=dc(r.route),c=r.submenus??[];if(c.length>0){o(c,[...t,s&&s!==`/`&&i.has(s)?{text:e,route:s}:{text:e}]);continue}pc(s,n)&&a(s,[...t,{text:e,route:s}],!1)}};return o(e,[]),r?{crumbs:r.crumbs,matched:r.route,...r.pending?{pending:!0}:{}}:{crumbs:[]}}function yc(e){let t=new Set,n=e=>{for(let r of e??[]){if(!r||r.separator||N(r))continue;let e=r.submenus??[];if(e.length>0){n(e);continue}let i=dc(r.route);i&&i!==`/`&&t.add(i)}};return n(e),t}function bc(e,t){let n=dc(t),r,i=e=>{for(let t of e??[]){if(!t||t.separator||N(t))continue;let e=t.submenus??[];if(e.length>0){i(e);continue}let a=dc(t.route);pc(a,n)&&(!r||a.length>r.route.length)&&(r={option:t,route:a})}};return i(e),r?.option}var xc=(e,t)=>{let n=!1,r=e.map(e=>{if(N(e)){let r=t(e);return r!==e&&(n=!0),r}if(e.submenus&&e.submenus.length>0){let r=xc(e.submenus,t);if(r!==e.submenus)return n=!0,{...e,submenus:r}}return e});return n?r:e};function Sc(e,t,n){let r=dc(n);if(!t||!r||r===`/`)return e;let i=`/`+r.split(`/`)[1];return xc(e,e=>e.baseUrl===t&&!pc(mc(e),r)?{...e,routePrefix:i}:e)}function Cc(e,n){return t(`sectionUnavailable`,{name:fc(e)},n)}var wc=e=>e.map(e=>({...e,visible:!1,...e.submenus&&e.submenus.length>0?{submenus:wc(e.submenus)}:{}})),Tc=(e,t,n)=>{let r=t.serverSideType&&t.serverSideType!==``?t.serverSideType:n.serverSideType;return e.map(e=>e.baseUrl?e:e.submenus&&e.submenus.length>0?{...e,submenus:Tc(e.submenus,t,n)}:{...e,consumedRoute:n.route??``,baseUrl:t.baseUrl,serverSideType:r,uriPrefix:t.route})};function Ec(e,t,n,r={},i=0){let a=[];for(let o of e)if(N(o)){let e=t.get(o);if(!e)a.push(o);else if(`failed`in e)a.push({...o,unavailable:!0,disabled:!0,description:Cc(o.label,n)});else{let t=Tc(e.app.menu??[],o,e.app),n=t.length===1&&(t[0].submenus?.length??0)>0;r.sections&&i===0&&!n&&t.length>0?t=[Dc(o,t)]:o.shellLabel&&o.label&&t.length===1&&(t=[{...t[0],label:o.label,icon:o.icon||t[0].icon}]),a.push(...o.visible===!1?wc(t):t)}}else o.submenus&&o.submenus.length>0?a.push({...o,submenus:Ec(o.submenus,t,n,r,i+1)}):a.push(o);return a}var Dc=(e,t)=>({label:e.label,icon:e.icon,path:e.path,route:``,separator:!1,visible:e.visible,description:void 0,submenus:t});function Oc(e){let t=[];for(let n of e??[])N(n)?t.push(n):n.submenus&&n.submenus.length>0&&t.push(...Oc(n.submenus));return t}function kc(e){let t=!1,n=[];for(let r of e){if(r.visible===!1){t=!0;continue}if(r.submenus&&r.submenus.length>0){let e=kc(r.submenus);if(e!==r.submenus){t=!0,n.push({...r,submenus:e});continue}}n.push(r)}return t?n:e}function Ac(e,t){let n=_c(e,t);return Number.isNaN(n)?void 0:e[n]}function jc(e){if(!e||e.separator||e.visible===!1||N(e)||e.unavailable)return;let t=e.submenus??[];if(t.length===0)return e;for(let e of t){let t=jc(e);if(t)return t}}var Mc=new Set;function Nc(e){return Mc.add(e),()=>{Mc.delete(e)}}function Pc(){let e=[...Mc];Mc.clear(),e.forEach(e=>e())}function Fc(e,t){return!t.callbackToken||!e.callbackToken||t.callbackToken===e.callbackToken||t.initiator!=null&&t.initiator!==e}var Ic=new Set([`http:`,`https:`]),Lc=()=>typeof window<`u`&&window.location?window.location.href:void 0,Rc=(e,t=Lc())=>{if(typeof e!=`string`||e.trim()===``)return;let n;try{n=t?new URL(e,t):new URL(e)}catch{return}if(!Ic.has(n.protocol))return;let r=!1;try{r=!!t&&new URL(t).origin===n.origin}catch{r=!1}return{href:n.href,sameOrigin:r}},zc=e=>{console.warn(`mateu: refused to navigate to a URL that is not http(s) or relative:`,e)},Bc=(e,t={})=>{let n=Rc(e);return n?(n.sameOrigin&&!t.newTab?window.location.assign(n.href):window.open(n.href,`_blank`,`noopener,noreferrer`),!0):(zc(e),!1)},Vc=new Set([`http`,`https`,`mailto`,`tel`]),Hc=(e,t={})=>{if(e==null)return;let n=String(e).replace(/[\t\n\r]/g,``).replace(/^[\u0000- ]+/,``).trimEnd();if(n===``)return;let r=/^([a-z][a-z0-9+.-]*):/i.exec(n)?.[1]?.toLowerCase();if(!r||Vc.has(r)||r===`data`&&t.allowData)return n},Uc=class{get signal(){return(!this.controller||this.controller.signal.aborted)&&(this.controller=new AbortController),this.controller.signal}abort(){this.controller?.abort(),this.controller=void 0}},Wc=class{replace(){return this.controller?.abort(),this.controller=new AbortController,this.controller.signal}get active(){return!!this.controller&&!this.controller.signal.aborted}clear(){this.controller?.abort(),this.controller=void 0}},Gc=6e4;function Kc(e,t){if(e){if(/^https?:\/\//i.test(e))return e;if(!(!e.startsWith(`/`)||e.startsWith(`//`))){if(t&&/^https?:\/\//i.test(t))try{return new URL(e,new URL(t).origin).toString()}catch{return e}return e}}}function qc(e,t){let n=t(e),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r}function Jc(e,t,n){if(e.base64Content){let n=new t.Blob([qc(e.base64Content,t.atob)],{type:e.mimeType||`application/octet-stream`});return{href:t.URL.createObjectURL(n),objectUrl:!0}}let r=Kc(e.url,n);return r?{href:r,objectUrl:!1}:void 0}function Yc(e,t,n){e.objectUrl&&t.setTimeout(()=>t.URL.revokeObjectURL(e.href),n)}function Xc(e,t,n){let r=n.document.createElement(`a`);r.href=e,r.download=t,r.rel=`noopener`,r.style.display=`none`,n.document.body.appendChild(r),r.click(),r.remove()}function Zc(e,t,n){let r=t.document.createElement(`iframe`);r.setAttribute(`aria-hidden`,`true`),r.setAttribute(`tabindex`,`-1`),r.style.cssText=`position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden`,r.addEventListener(`load`,()=>{try{let e=r.contentWindow;if(!e)throw Error(`no frame window`);e.focus(),e.print()}catch{n()}t.setTimeout(()=>r.remove(),Gc)},{once:!0}),r.src=e,t.document.body.appendChild(r)}function Qc(e,t=window,n){if(!e||typeof e!=`object`||!t?.document)return`none`;let r=Jc(e,t,n);if(!r)return`none`;let i=e.filename||`download`,a=e.disposition===`inline`;if(a&&e.print)return Zc(r.href,t,()=>{r.objectUrl&&t.open(r.href,`_blank`)}),Yc(r,t,Gc),`printing`;if(a){let e=t.open(r.href,`_blank`);if(e){try{e.opener=null}catch{}return Yc(r,t,Gc),`opened`}}return Xc(r.href,i,t),Yc(r,t,1e3),`downloaded`}var $c=`
@media print {
    vaadin-app-layout::part(navbar), vaadin-app-layout::part(drawer),
    [slot="navbar"], [slot="drawer"], vaadin-drawer-toggle,
    vaadin-side-nav, vaadin-menu-bar, vaadin-tabs.app-tabs, nav,
    vaadin-button:not([data-mateu-print="show"]), button:not([data-mateu-print="show"]),
    .ai-fab, .app-fab, .page-fab, .page-toc, mateu-command-center, mateu-notification-bell,
    mateu-skip-link, mateu-connectivity-banner, mateu-app-context-picker,
    mateu-vaadin-app-context-picker, mateu-chat, mateu-filter-bar, mateu-action-panel,
    vaadin-notification-card, vaadin-tooltip-overlay, mateu-api-caller-veil,
    .mateu-no-print, [data-mateu-print="hide"] {
        display: none !important;
    }
    vaadin-app-layout { --_vaadin-app-layout-navbar-offset-size: 0 !important; padding: 0 !important; }
    vaadin-app-layout::part(content) { padding: 0 !important; margin: 0 !important; }
    vaadin-scroller, .app-content, [role="main"] {
        overflow: visible !important; height: auto !important; max-height: none !important;
    }
    * { box-shadow: none !important; }
}
`,el=new WeakSet;function tl(e){if(el.has(e))return;el.add(e);let t=e;if(typeof CSSStyleSheet<`u`&&Array.isArray(t.adoptedStyleSheets))try{let e=new CSSStyleSheet;e.replaceSync($c),t.adoptedStyleSheets=[...t.adoptedStyleSheets,e];return}catch{}let n=e instanceof Document?e.head:e;if(!n)return;let r=(e instanceof Document?e:e.ownerDocument).createElement(`style`);r.setAttribute(`data-mateu-print`,`styles`),r.textContent=$c,n.appendChild(r)}function nl(e){let t=[],n=e=>{(e.querySelectorAll?e.querySelectorAll(`*`):[]).forEach(e=>{let r=e.shadowRoot;r&&(t.push(r),n(r))})};return n(e),t}function rl(e=document){tl(e);let t=nl(e);return t.forEach(tl),t.length+1}function il(e=window){e?.document&&(rl(e.document),e.print())}var al=class e extends _{constructor(...e){super(...e),this.id=``,this.baseUrl=``,this.callbackToken=``,this.connection=new Uc,this.createElement=e=>{let t=e.data,n=document.createElement(t.name);for(let e in t.attributes)n.setAttribute(e,t.attributes[e]);for(let e in t.on)n.addEventListener(e,n=>{this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.on[e],parameters:{event:n}},bubbles:!0,composed:!0}))},{signal:this.connection.signal});return n},this.closeModal=()=>{let e=(this.shadowRoot??this).querySelectorAll(`mateu-dialog, mateu-drawer`);if(e&&e.length>0){e[e.length-1].close();return}this.dispatchEvent(new CustomEvent(`close-modal-requested`,{bubbles:!0,composed:!0}))},this.changeFavicon=e=>{let t=document.querySelector(`link[rel="icon"]`);t===null?(t=document.createElement(`link`),t.setAttribute(`rel`,`icon`),t.setAttribute(`href`,e),document.head.appendChild(t)):t.setAttribute(`href`,e)}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=lt.subscribe(e=>{if(e.command){let t=e.command;this.id==t.targetComponentId&&this.applyCommand(t)}if(Fc(this,e)&&e.fragment){let t=e.fragment;this.id==t.targetComponentId&&(this.applyFragment(t),this.completeMenu(t))}})}completeMenu(e){if(e.component&&e.component.type==C.ClientSide){let t=e.component,n=t.metadata;if(n?.type==w.App){this.pendingMenuRetries?.forEach(e=>e()),this.pendingMenuRetries=new Set;let e=n,r=typeof window<`u`?window.location.pathname:``,i=Sc(e.menu??[],e.homeBaseUrl,r),a=kc(i);(a!==e.menu||i!==e.menu)&&(t.metadata={...e,menu:a,navMenu:i});let o=Oc(i).filter(t=>t.visible!==!1||gc(t,r)||!!e.homeBaseUrl&&t.baseUrl===e.homeBaseUrl);o.length>0&&this.askRemotes(t,i,o,new Map,0)}}}static{this.remoteMenuTimeoutMillis=2e4}static{this.remoteRetryDelays=[1e4,3e4,6e4]}askRemotes(t,n,r,i,a){let o=[],s=()=>{let e=Ec(n,i,void 0,{sections:t.metadata.variant===ft.HAMBURGER_SECTIONS});t.metadata={...t.metadata,menu:kc(e),navMenu:e},this.requestUpdate()};Promise.allSettled(r.map(t=>uc.runAction(t.baseUrl,t.route,`_empty`,``,t.baseUrl+`#`+t.route,void 0,void 0,void 0,t.params,this,!0,{quiet:!0,timeoutMillis:e.remoteMenuTimeoutMillis}).then(e=>{let n=this.remoteAppOf(e?.fragments,t);if(!n)throw Error(`no app in the answer of `+t.baseUrl);i.set(t,{app:n}),s()}).catch(()=>{i.set(t,{failed:!0}),o.push(t),s()}))).then(()=>{if(o.length>0){let r=e.remoteRetryDelays[a],s,c=()=>{s!==void 0&&clearTimeout(s),u(),this.pendingMenuRetries?.delete(c)},l=()=>{c(),this.isConnected&&this.askRemotes(t,n,o,i,Math.min(a+1,e.remoteRetryDelays.length))},u=Nc(l);this.pendingMenuRetries?.add(c),r!==void 0&&(s=setTimeout(l,r))}})}remoteAppOf(e,t){let n=(e??[]).find(e=>e?.targetComponentId==t.baseUrl+`#`+t.route);if(n?.component?.type==C.ClientSide){let e=n.component.metadata;if(e?.type==w.App){let t=e;return{menu:t.menu??[],route:t.route,serverSideType:t.serverSideType}}}}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.connection.abort()}applyCommand(e){if(e.type==`SetWindowTitle`&&(document.title=e.data,a(document.title)),e.type==`Announce`){let t=e.data;t?.text&&a(t.text,{politeness:t.assertive?`assertive`:`polite`})}if(e.type==`SetFavicon`&&this.changeFavicon(e.data),e.type==`DispatchEvent`&&this.dispatchNamedEvent(e.data),e.type==`NavigateTo`){let t=e.data;t&&Bc(t)}if(e.type==`PushStateToHistory`){let t=e.data;t!==void 0&&this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:t},bubbles:!0,composed:!0}))}if(e.type==`RunAction`){let t=e.data;if(t&&t.actionId){if(t.targetComponentId){let e={command:{type:`RunAction`,data:{actionId:t.actionId},targetComponentId:t.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:``};setTimeout(()=>lt.next(e))}else this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:{}},bubbles:!0,composed:!0}))}}if(e.type==`MarkAsDirty`&&this.dispatchEvent(new CustomEvent(`dirty`,{detail:{},bubbles:!0,composed:!0})),e.type==`MarkAsClean`&&this.dispatchEvent(new CustomEvent(`clean`,{detail:{},bubbles:!0,composed:!0})),e.type==`DownloadFile`&&Qc(e.data,void 0,this.baseUrl),e.type==`Print`&&il(),e.type==`CloseModal`&&(this.closeModal(),this.dispatchNamedEvent(e.data)),e.type==`AddContentToHead`){let t=e.data;if(t&&t.name){if(t.attributes&&t.attributes.id&&document.getElementById(t.attributes.id))return;document.head.appendChild(this.createElement(e))}}if(e.type==`AddContentToBody`){let t=e.data;if(t&&t.name){if(t.attributes&&t.attributes.id&&document.getElementById(t.attributes.id))return;document.body.appendChild(this.createElement(e))}}}dispatchNamedEvent(e){if(e&&e.eventName){let t=this.component,n=t?.emitsName??t?.serverSideType,r=e.payload??e.detail;n&&r&&typeof r==`object`&&(r={...r,__source:n}),this.dispatchEvent(new CustomEvent(e.eventName,{detail:r,bubbles:!0,composed:!0}))}}};o([n()],al.prototype,`id`,void 0),o([n()],al.prototype,`baseUrl`,void 0);var ol=class extends al{applyFragment(e){}manageActionRequestedEvent(e){}};o([n()],ol.prototype,`component`,void 0);var sl=class extends Da{constructor(e){if(super(e),this.it=g,e.type!==Ta.CHILD)throw Error(this.constructor.directiveName+`() can only be used in child bindings`)}render(e){if(e===g||e==null)return this._t=void 0,this.it=e;if(e===u)return e;if(typeof e!=`string`)throw Error(this.constructor.directiveName+`() called with a non-string value`);if(e===this.it)return this._t;this.it=e;let t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}};sl.directiveName=`unsafeHTML`,sl.resultType=1;var cl=Ea(sl),ll=e=>v.sanitize(e,{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:e=>!0,attributeNameCheck:e=>!/^on/i.test(e),allowCustomizedBuiltInElements:!1}}),P=e=>cl(e==null?e:ll(String(e))),ul=`>>>= ... === !== **= <<= >>= >>> &&= ||= ??= => == != <= >= && || ?? ?. ++ -- ** << >> += -= *= /= %= &= |= ^= { } ( ) [ ] ; , < > + - * / % & | ^ ! ~ ? : = .`.split(` `),dl=e=>/[A-Za-z_$À-￿]/.test(e),fl=e=>/[A-Za-z0-9_$À-￿]/.test(e),pl=class extends SyntaxError{constructor(e,t,n){super(`${e} at ${n} in: ${t}`),this.source=t,this.position=n,this.name=`SyntaxError`}},ml=(e,t)=>{let n=e[t];switch(n){case`n`:return[`
`,t+1];case`t`:return[`	`,t+1];case`r`:return[`\r`,t+1];case`b`:return[`\b`,t+1];case`f`:return[`\f`,t+1];case`v`:return[`\v`,t+1];case`0`:return[`\0`,t+1];case`x`:return[String.fromCharCode(parseInt(e.substr(t+1,2),16)),t+3];case`u`:if(e[t+1]===`{`){let n=e.indexOf(`}`,t);return[String.fromCodePoint(parseInt(e.substring(t+2,n),16)),n+1]}return[String.fromCharCode(parseInt(e.substr(t+1,4),16)),t+5];case`\r`:return[``,e[t+1]===`
`?t+2:t+1];case`
`:case`\u2028`:case`\u2029`:return[``,t+1];default:return[n,t+1]}},hl=(e,t)=>{let n=0;for(;t<e.length;){let r=e[t];if(r===`'`||r===`"`){let n=r;for(t++;t<e.length&&e[t]!==n;)t+=e[t]===`\\`?2:1;t++;continue}if(r==="`"){for(t++;t<e.length&&e[t]!=="`";){if(e[t]===`\\`){t+=2;continue}if(e[t]===`$`&&e[t+1]===`{`){t=hl(e,t+2)+1;continue}t++}t++;continue}if(r===`{`&&n++,r===`}`){if(n===0)return t;n--}t++}throw new pl(`Unterminated template expression`,e,t)},gl=e=>{let t=[],n=0,r=()=>{let e=t[t.length-1];return e?e.t===`num`||e.t===`str`||e.t===`tpl`||e.t===`re`?!1:e.t===`id`?[`typeof`,`void`,`in`,`instanceof`,`new`,`return`,`delete`].includes(e.v):e.t!==`p`||![`)`,`]`,`}`].includes(e.v):!0};for(;n<e.length;){let i=e[n];if(/\s/.test(i)){n++;continue}if(i===`/`&&e[n+1]===`/`){for(;n<e.length&&e[n]!==`
`;)n++;continue}if(i===`/`&&e[n+1]===`*`){let t=e.indexOf(`*/`,n+2);if(t<0)throw new pl(`Unterminated comment`,e,n);n=t+2;continue}let a=n;if(/[0-9]/.test(i)||i===`.`&&/[0-9]/.test(e[n+1]??``)){let r=/^(0[xX][0-9a-fA-F_]+|0[oO][0-7_]+|0[bB][01_]+|(?:[0-9][0-9_]*)?\.?[0-9_]*(?:[eE][+-]?[0-9]+)?)(n?)/.exec(e.slice(n)),i=r[1].replace(/_/g,``);n+=r[0].length,t.push({t:`num`,v:r[2]?BigInt(i):Number(i),s:a});continue}if(i===`'`||i===`"`){let r=``;for(n++;n<e.length&&e[n]!==i;)if(e[n]===`\\`){let[t,i]=ml(e,n+1);r+=t,n=i}else{if(e[n]===`
`)throw new pl(`Unterminated string`,e,a);r+=e[n++]}if(n>=e.length)throw new pl(`Unterminated string`,e,a);n++,t.push({t:`str`,v:r,s:a});continue}if(i==="`"){let r=[],i=[],o=``;for(n++;;){if(n>=e.length)throw new pl(`Unterminated template literal`,e,a);let t=e[n];if(t==="`"){n++;break}if(t===`\\`){let[t,r]=ml(e,n+1);o+=t,n=r;continue}if(t===`$`&&e[n+1]===`{`){let t=hl(e,n+2);r.push(o),o=``,i.push(e.substring(n+2,t)),n=t+1;continue}o+=t,n++}r.push(o),t.push({t:`tpl`,quasis:r,exprs:i,s:a});continue}if(i===`/`&&r()){let r=n+1,i=!1;for(;r<e.length;){let t=e[r];if(t===`\\`){r+=2;continue}if(t===`[`)i=!0;else if(t===`]`)i=!1;else if(t===`/`&&!i)break;else if(t===`
`)break;r++}if(e[r]!==`/`)throw new pl(`Unterminated regular expression`,e,a);let o=e.substring(n+1,r);r++;let s=``;for(;r<e.length&&/[a-z]/i.test(e[r]);)s+=e[r++];n=r,t.push({t:`re`,pattern:o,flags:s,s:a});continue}if(dl(i)){let r=n+1;for(;r<e.length&&fl(e[r]);)r++;t.push({t:`id`,v:e.substring(n,r),s:a}),n=r;continue}let o=ul.find(t=>e.startsWith(t,n));if(!o)throw new pl(`Unexpected character '${i}'`,e,n);if(o===`?.`&&/[0-9]/.test(e[n+2]??``)){t.push({t:`p`,v:`?`,s:a}),n+=1;continue}t.push({t:`p`,v:o,s:a}),n+=o.length}return t.push({t:`eof`,s:n}),t},_l={"??":1,"||":2,"&&":3,"|":4,"^":5,"&":6,"==":7,"!=":7,"===":7,"!==":7,"<":8,">":8,"<=":8,">=":8,in:8,instanceof:8,"<<":9,">>":9,">>>":9,"+":10,"-":10,"*":11,"/":11,"%":11,"**":12},vl=new Set([`=`,`+=`,`-=`,`*=`,`/=`,`%=`,`**=`,`<<=`,`>>=`,`>>>=`,`&=`,`|=`,`^=`,`&&=`,`||=`,`??=`]),yl=class{constructor(e,t){this.tokens=e,this.src=t,this.i=0}peek(e=0){return this.tokens[Math.min(this.i+e,this.tokens.length-1)]}next(){return this.tokens[this.i++]}isP(e,t=0){let n=this.peek(t);return n.t===`p`&&n.v===e}isId(e,t=0){let n=this.peek(t);return n.t===`id`&&n.v===e}fail(e,t=this.peek()){throw new pl(e,this.src,t.s)}expectP(e){this.isP(e)||this.fail(`Expected '${e}'`),this.i++}parseAll(){let e=this.sequence();if(this.isP(`;`)&&this.i++,this.peek().t!==`eof`){let e=this.peek();e.t===`p`&&(vl.has(e.v)||e.v===`++`||e.v===`--`)&&this.fail(`Assignments are not allowed in expressions`),this.fail(`Unexpected token`)}return e}sequence(){let e=this.assignment();if(!this.isP(`,`))return e;let t=[e];for(;this.isP(`,`);)this.i++,t.push(this.assignment());return{k:`seq`,items:t}}assignment(){let e=this.tryArrow();if(e)return e;let t=this.conditional(),n=this.peek();return n.t===`p`&&vl.has(n.v)&&this.fail(`Assignments are not allowed in expressions`),t}tryArrow(){let e=this.peek();if(e.t===`id`&&this.isP(`=>`,1)&&!_l[e.v])return this.i+=2,{k:`arrow`,params:[e.v],rest:void 0,body:this.arrowBody()};if(!this.isP(`(`))return;let t=1,n=[],r;if(!this.isP(`)`,t))for(;;){if(this.isP(`...`,t)){let e=this.peek(t+1);if(e.t!==`id`)return;r=e.v,t+=2;break}let e=this.peek(t);if(e.t!==`id`)return;if(n.push(e.v),t++,this.isP(`,`,t)){t++;continue}break}if(!(!this.isP(`)`,t)||!this.isP(`=>`,t+1)))return this.i+=t+2,{k:`arrow`,params:n,rest:r,body:this.arrowBody()}}arrowBody(){return this.isP(`{`)&&this.fail(`Arrow functions with a block body are not supported; use an expression body`),this.assignment()}conditional(){let e=this.binary(0);if(!this.isP(`?`))return e;this.i++;let t=this.assignment();return this.expectP(`:`),{k:`cond`,test:e,consequent:t,alternate:this.assignment()}}binaryOp(){let e=this.peek();if(e.t===`p`&&_l[e.v]!==void 0||e.t===`id`&&(e.v===`in`||e.v===`instanceof`))return e.v}binary(e){let t=this.unary();for(;;){let n=this.binaryOp();if(!n)return t;let r=_l[n];if(r<e)return t;this.i++;let i=n===`**`?this.binary(r):this.binary(r+1);t=n===`&&`||n===`||`||n===`??`?{k:`logic`,op:n,left:t,right:i}:{k:`bin`,op:n,left:t,right:i}}}unary(){let e=this.peek();if(e.t===`p`&&[`!`,`-`,`+`,`~`].includes(e.v)||(e.t===`p`&&(e.v===`++`||e.v===`--`)&&this.fail(`Assignments are not allowed in expressions`),e.t===`id`&&(e.v===`typeof`||e.v===`void`)))return this.i++,{k:`unary`,op:e.v,arg:this.unary()};e.t===`id`&&e.v===`delete`&&this.fail(`'delete' is not allowed in expressions`);let t=this.postfix();return(this.isP(`++`)||this.isP(`--`))&&this.fail(`Assignments are not allowed in expressions`),t}args(){this.expectP(`(`);let e=[];for(;!this.isP(`)`);)this.isP(`...`)?(this.i++,e.push({k:`spread`,arg:this.assignment()})):e.push(this.assignment()),this.isP(`)`)||this.expectP(`,`);return this.i++,e}postfix(){let e;if(this.isId(`new`)){this.i++;let t=this.primary();for(;this.isP(`.`);){this.i++;let e=this.next();e.t!==`id`&&this.fail(`Expected a property name`,e),t={k:`member`,obj:t,prop:e.v,optional:!1}}let n=this.isP(`(`)?this.args():[];e={k:`new`,callee:t,args:n}}else e=this.primary();let t=!1;for(;;)if(this.isP(`.`)){this.i++;let t=this.next();t.t!==`id`&&this.fail(`Expected a property name`,t),e={k:`member`,obj:e,prop:t.v,optional:!1}}else if(this.isP(`?.`)){if(this.i++,t=!0,this.isP(`(`))e={k:`call`,callee:e,args:this.args(),optional:!0};else if(this.isP(`[`)){this.i++;let t=this.sequence();this.expectP(`]`),e={k:`member`,obj:e,prop:t,optional:!0}}else{let t=this.next();t.t!==`id`&&this.fail(`Expected a property name`,t),e={k:`member`,obj:e,prop:t.v,optional:!0}}}else if(this.isP(`[`)){this.i++;let t=this.sequence();this.expectP(`]`),e={k:`member`,obj:e,prop:t,optional:!1}}else if(this.isP(`(`))e={k:`call`,callee:e,args:this.args(),optional:!1};else if(this.peek().t===`tpl`)this.fail(`Tagged templates are not supported`);else break;return t?{k:`chain`,expr:e}:e}primary(){let e=this.next();switch(e.t){case`num`:return{k:`lit`,v:e.v};case`str`:return{k:`lit`,v:e.v};case`re`:return{k:`re`,pattern:e.pattern,flags:e.flags};case`tpl`:return{k:`tpl`,quasis:e.quasis,exprs:e.exprs.map(e=>bl(e))};case`id`:switch(e.v){case`true`:return{k:`lit`,v:!0};case`false`:return{k:`lit`,v:!1};case`null`:return{k:`lit`,v:null};case`undefined`:return{k:`lit`,v:void 0};case`this`:return{k:`lit`,v:void 0};case`function`:case`class`:case`import`:case`await`:case`yield`:case`super`:this.fail(`'${e.v}' is not allowed in expressions`,e)}return{k:`id`,name:e.v};case`p`:if(e.v===`(`){let e=this.sequence();return this.expectP(`)`),e}if(e.v===`[`){let e=[];for(;!this.isP(`]`);){if(this.isP(`,`)){this.i++,e.push(null);continue}this.isP(`...`)?(this.i++,e.push({k:`spread`,arg:this.assignment()})):e.push(this.assignment()),this.isP(`]`)||this.expectP(`,`)}return this.i++,{k:`arr`,items:e}}if(e.v===`{`){let e=[];for(;!this.isP(`}`);){if(this.isP(`...`))this.i++,e.push({k:`spread`,arg:this.assignment()});else{let t=this.next(),n;t.t===`id`||t.t===`str`?n=t.v:t.t===`num`?n=String(t.v):t.t===`p`&&t.v===`[`?(n=this.assignment(),this.expectP(`]`)):this.fail(`Unexpected token in object literal`,t),this.isP(`:`)?(this.i++,e.push({key:n,value:this.assignment()})):t.t===`id`?e.push({key:n,value:{k:`id`,name:t.v}}):this.fail(`Expected ':'`)}this.isP(`}`)||this.expectP(`,`)}return this.i++,{k:`obj`,props:e}}}this.fail(`Unexpected token`,e)}},bl=e=>new yl(gl(e),e).parseAll(),xl=new Set([`constructor`,`__proto__`,`prototype`,`__defineGetter__`,`__defineSetter__`,`__lookupGetter__`,`__lookupSetter__`]),Sl=new Set([`call`,`apply`,`bind`,`caller`,`arguments`]),Cl=Object.freeze({Math,JSON,Number,String,Boolean,Array,Object,Date,Intl,RegExp,Set,Map,parseInt,parseFloat,isNaN,isFinite,encodeURIComponent,decodeURIComponent,encodeURI,decodeURI,NaN:NaN,Infinity:1/0}),wl=new Set([Date,RegExp,Set,Map,Array,Number,String,Boolean,Object,Intl.NumberFormat,Intl.DateTimeFormat,Intl.Collator,Intl.PluralRules,Intl.RelativeTimeFormat,Intl.ListFormat]),Tl=new Set([Function,eval,Object.defineProperty,Object.defineProperties,Object.setPrototypeOf,Object.assign,Object.freeze,Object.seal,Object.preventExtensions,Reflect?.set,Reflect?.defineProperty,Reflect?.setPrototypeOf,Reflect?.deleteProperty].filter(Boolean)),El=Symbol(`mateu.expression.shortCircuit`),Dl=e=>typeof e==`symbol`?e:String(e),Ol=e=>{if(typeof e==`string`&&xl.has(e))throw TypeError(`Access to '${e}' is not allowed in expressions`)},kl=e=>e.k===`id`?e.name:e.k===`member`?kl(e.obj)+(typeof e.prop==`string`?`.`+e.prop:`[…]`):e.k===`call`?kl(e.callee)+`(…)`:`expression`,Al=(e,t)=>{for(let n=e;n;n=n.parent)if(Object.prototype.hasOwnProperty.call(n.vars,t))return{found:!0,value:n.vars[t]};return Object.prototype.hasOwnProperty.call(Cl,t)?{found:!0,value:Cl[t]}:{found:!1,value:void 0}},jl=(e,t,n)=>{if(Ol(t),typeof e==`function`&&typeof t==`string`&&Sl.has(t))throw TypeError(`Access to '${t}' is not allowed in expressions`);if(e==null)throw TypeError(`Cannot read properties of ${e} (reading '${String(t)}') in ${kl(n)}`);return e[t]},Ml=(e,t)=>{let n=[];for(let r of e)r.k===`spread`?n.push(...F(r.arg,t)):n.push(F(r,t));return n},Nl=(e,t,n,r)=>{if(typeof e!=`function`)throw TypeError(`${kl(r)} is not a function`);if(Tl.has(e))throw TypeError(`${kl(r)} is not allowed in expressions`);return Reflect.apply(e,t,n)},Pl=(e,t,n)=>{let r=t,i=n;switch(e){case`+`:return r+i;case`-`:return r-i;case`*`:return r*i;case`/`:return r/i;case`%`:return r%i;case`**`:return r**i;case`==`:return r==i;case`!=`:return r!=i;case`===`:return r===i;case`!==`:return r!==i;case`<`:return r<i;case`>`:return r>i;case`<=`:return r<=i;case`>=`:return r>=i;case`|`:return r|i;case`^`:return r^i;case`&`:return r&i;case`<<`:return r<<i;case`>>`:return r>>i;case`>>>`:return r>>>i;case`in`:return Dl(r)in Object(i);case`instanceof`:return r instanceof i}throw SyntaxError(`Unknown operator `+e)},F=(e,t)=>{switch(e.k){case`lit`:return e.v;case`re`:return new RegExp(e.pattern,e.flags);case`id`:{let{found:n,value:r}=Al(t,e.name);if(!n)throw ReferenceError(`${e.name} is not defined`);return r}case`tpl`:{let n=e.quasis[0];for(let r=0;r<e.exprs.length;r++)n+=String(F(e.exprs[r],t))+e.quasis[r+1];return n}case`arr`:{let n=[];for(let r of e.items)r===null?n.length++:r.k===`spread`?n.push(...F(r.arg,t)):n.push(F(r,t));return n}case`obj`:{let n={};for(let r of e.props){if(`k`in r&&r.k===`spread`){Object.assign(n,F(r.arg,t));continue}let e=r,i=typeof e.key==`string`?e.key:Dl(F(e.key,t));Ol(i),n[i]=F(e.value,t)}return n}case`chain`:try{return F(e.expr,t)}catch(e){if(e===El)return;throw e}case`member`:{let n=F(e.obj,t);if(e.optional&&n==null)throw El;return jl(n,typeof e.prop==`string`?e.prop:Dl(F(e.prop,t)),e)}case`call`:{let n,r;if(e.callee.k===`member`){let i=e.callee;if(n=F(i.obj,t),i.optional&&n==null)throw El;let a=typeof i.prop==`string`?i.prop:Dl(F(i.prop,t));r=jl(n,a,i)}else r=F(e.callee,t);if(e.optional&&r==null)throw El;return Nl(r,n,Ml(e.args,t),e.callee)}case`new`:{let n=F(e.callee,t);if(!wl.has(n))throw TypeError(`'new ${kl(e.callee)}' is not allowed in expressions`);return Reflect.construct(n,Ml(e.args,t))}case`unary`:{if(e.op===`typeof`)return e.arg.k===`id`&&!Al(t,e.arg.name).found?`undefined`:typeof F(e.arg,t);let n=F(e.arg,t);switch(e.op){case`!`:return!n;case`-`:return-n;case`+`:return+n;case`~`:return~n;case`void`:return}throw SyntaxError(`Unknown operator `+e.op)}case`logic`:{let n=F(e.left,t);return e.op===`&&`?n&&F(e.right,t):e.op===`||`?n||F(e.right,t):n??F(e.right,t)}case`bin`:return Pl(e.op,F(e.left,t),F(e.right,t));case`cond`:return F(e.test,t)?F(e.consequent,t):F(e.alternate,t);case`seq`:{let n;for(let r of e.items)n=F(r,t);return n}case`arrow`:{let{params:n,rest:r,body:i}=e;return(...e)=>{let a=Object.create(null);return n.forEach((t,n)=>{a[t]=e[n]}),r&&(a[r]=e.slice(n.length)),F(i,{vars:a,parent:t})}}case`spread`:throw SyntaxError(`Unexpected spread`)}},Fl=500,Il=new Map,Ll=e=>{let t=Il.get(e);return t||(t=bl(e),Il.size>=Fl&&Il.delete(Il.keys().next().value),Il.set(e,t)),t},Rl=(e,t={},n={})=>{let r=n.cache===!1?bl(e):Ll(e),i=Object.create(null);for(let e of Object.keys(t))i[e]=t[e];return F(r,{vars:i})},zl=(e,t)=>{let n=e[t];for(let r=t+1;r<e.length;r++){let t=e[r];if(t===`\\`){r++;continue}if(t===n)return r+1}throw SyntaxError(`Unterminated string literal in template expression`)},Bl=(e,t)=>{for(let n=t+1;n<e.length;n++){let t=e[n];if(t===`\\`){n++;continue}if(t==="`")return n+1;t===`$`&&e[n+1]===`{`&&(n=Vl(e,n+2))}throw SyntaxError(`Unterminated template literal in template expression`)},Vl=(e,t)=>{let n=0,r=t;for(;r<e.length;){let t=e[r];if(t===`'`||t===`"`){r=zl(e,r);continue}if(t==="`"){r=Bl(e,r);continue}if(t===`{`)n++;else if(t===`}`){if(n===0)return r;n--}r++}throw SyntaxError('Unterminated ${ expression in "'+e+`"`)},Hl=e=>{let t=[],n=``,r=0;for(;r<e.length;){let i=e[r];if(i===`\\`&&e[r+1]===`\\`){n+=`\\`,r+=2;continue}if(i===`\\`&&e[r+1]===`$`&&e[r+2]===`{`){n+="${",r+=3;continue}if(i===`$`&&e[r+1]===`{`){let i=Vl(e,r+2);n&&t.push({lit:n}),n=``,t.push({expr:e.substring(r+2,i)}),r=i+1;continue}n+=i,r++}return n&&t.push({lit:n}),t},Ul=(e,t)=>Rl(e,t),Wl=(e,t)=>{let n=``;for(let r of Hl(e)){if(`lit`in r){n+=r.lit;continue}let e=Gl.exec(r.expr);n+=e?e[1]:String(Ul(r.expr,t)??``)}return n},Gl=/^\s*i18n\.([A-Za-z0-9_][A-Za-z0-9_.-]*)\s*$/,Kl=(e,t,n)=>({state:e??{},data:t??{},...n});function ql(e,t,n,r){if(!e?.includes("${"))return e;try{return Wl(e,Kl(t,n,r))}catch(t){return console.warn(`Mateu: could not interpolate "${e}":`,t),e}}var I=(e,t,n)=>{if(e&&e.indexOf("${")>=0)try{return Wl(e,Kl(t,n))}catch(e){return e.message}return e},Jl=(e,t,n,r,i)=>{if(!e?.includes("${"))return e;let a=Kl(t,n,{appState:r??{},appData:i??{}}),o=e;try{o=Wl(e,a)}catch(a){o=`when evaluating `+e+` :`+a+`, where data is `+n+` and state is `+t+` and app state is `+r+` and app data is `+i,console.error(a,o,t,n,r,i)}return o},Yl=(e,t)=>{for(let n=0;n<e.length;n++){let r=e[n];t===`code`?(r===`'`||r===`"`||r==="`")&&(t=r):r===`\\`?n++:r===t&&(t=`code`)}return t},Xl=e=>e.replace(/[\\'"`\n\r\u2028\u2029]|\$\{/g,e=>{switch(e){case`
`:return`\\n`;case`\r`:return`\\r`;case`\u2028`:return`\\u2028`;case`\u2029`:return`\\u2029`;case"${":return"\\${";default:return`\\`+e}}),Zl=e=>e===null?`null`:e===void 0?`undefined`:typeof e==`number`||typeof e==`boolean`?String(e):typeof e==`bigint`?e+`n`:JSON.stringify(e)??`undefined`,Ql=(e,t,n,r,i,a)=>{let o=Kl(t,n,{appState:r??{},appData:i??{},...a}),s=``,c=`code`;for(let t of Hl(e))if(`lit`in t)s+=t.lit,c=Yl(t.lit,c);else{let e=Ul(t.expr,o);s+=c===`code`?Zl(e):Xl(String(e))}return Rl(s,o,{cache:!1})},$l=(e,t,n,r)=>Rl(e,Kl(t,n,r)),eu=(e,t,n,r)=>Wl(e,Kl(t,n,r)),tu=e=>encodeURIComponent(e).replace(/[!'()*]/g,e=>`%`+e.charCodeAt(0).toString(16).toUpperCase());function nu(e,t,n,r){if(!e?.includes("${"))return e;let i=Kl(t,n,r),a=Hl(e),o=a[0],s=!!o&&`lit`in o&&o.lit.includes(`://`),c=``,l=``;return a.forEach((t,n)=>{if(`lit`in t){if(s){let e=c===``?t.lit.indexOf(`://`)+3:0;/[/?#]/.test(t.lit.substring(e))&&(s=!1)}c+=t.lit,l+=t.lit;return}let r=String(Ul(t.expr,i)??``);if(s||n===0){if(/^\s*state\b/.test(t.expr))throw Error(`A client state value cannot choose the origin of a URL: `+e);l+=r}else if(/[?#]/.test(c))l+=tu(r);else{if(r===`.`||r===`..`)throw Error(`A dot segment is not a valid path value: `+r);l+=tu(r)}}),l}function ru(e,t,n){let r=r=>ql(r,e,t,n);return r.url=r=>nu(r,e,t,n),r}var iu=`display:inline-flex; align-items:center; justify-content:center; width:2rem; height:2rem; border-radius:50%; background:var(--lumo-contrast-10pct,#e0e0e0); color:var(--lumo-secondary-text-color,#555); font-size:.8rem; font-weight:600; overflow:hidden; flex:none;`,au=(e,t)=>t||(typeof e==`string`&&e?e.trim().split(/\s+/).map(e=>e[0]).slice(0,2).join(``).toUpperCase():``),ou=(e,t,n)=>{let r=e.metadata,i=su(r.name,t,n);return l`<span style="${iu}${e.style}" class="${e.cssClasses}"
                      title="${i||p}" slot="${e.slot??p}">
        ${r.image?l`<img src="${r.image}" alt="${i}" style="width:100%;height:100%;object-fit:cover;">`:au(i,r.abbreviation)}
    </span>`},su=(e,t,n)=>typeof e==`string`&&e.includes("${")?ql(e,t,n):e,cu=e=>{let t=e.metadata,n=t.avatars??[],r=t.maxItemsVisible&&t.maxItemsVisible>0?t.maxItemsVisible:n.length,i=n.slice(0,r),a=n.length-i.length,o=`margin-left:-0.4rem; border:2px solid var(--lumo-base-color,#fff);`;return l`<span style="display:inline-flex; ${e.style}" class="${e.cssClasses}" slot="${e.slot??p}">
        ${i.map(e=>l`<span style="${iu}${o}" title="${e.name||p}">
            ${e.img?l`<img src="${e.img}" style="width:100%;height:100%;object-fit:cover;">`:au(e.name??``,e.abbr)}
        </span>`)}
        ${a>0?l`<span style="${iu}${o}">+${a}</span>`:p}
    </span>`},lu=(e,t,n)=>{let r=e.metadata;return l`<span theme="badge ${r.color} ${r.pill?`pill`:``} ${r.small?`small`:``} ${r.primary?`primary`:``}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??p}">${su(r.text,t,n)}</span>`},uu=(e,t,n,r)=>{let i=su(e.text,t,n);if(!i)return p;let a=su(e.color,t,n);a==`SUCCESS`&&(a=`success`),a==`ERROR`&&(a=`error`),a==`DANGER`&&(a=`error`),a==`WARNING`&&(a=`warning`),a==`INFO`&&(a=`info`),a==`PRIMARY`&&(a=`primary`),a==`SECONDARY`&&(a=`secondary`),a==`TERTIARY`&&(a=`tertiary`),a==`QUATERNARY`&&(a=`quaternary`),a==`LIGHT`&&(a=`light`),a==`DARK`&&(a=`dark`);let o=e.pill||r?.pill;return l`<span theme="badge ${a} ${o?`pill`:``} ${e.small?`small`:``} ${e.primary?`primary`:``}">${i}</span>`},L=new class{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(e){if(this.componentRenderer=e,typeof window<`u`){let t=e.supportedClientSideTypes?.();window.__mateuRendererInfo={name:e.rendererName?.()??e.constructor?.name??`unknown`,supportedTypes:t?[...t].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(e){this.useShadowRoot=e}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(e){this.afterRenderHook=e}getAfterRenderHook(){return this.afterRenderHook}},du=(e,t,n,r,i,a,o,s,c)=>(t.slot=s,R(e,t,n,r,i,a,o,c)),fu=e=>{if(!e)return e;let t=/margin\s*:\s*(?:0\s+)?auto/.test(e)&&/max-width\s*:/.test(e),n=/(^|[;\s])width\s*:/.test(e);return t&&!n?`width: 100%; box-sizing: border-box; ${e}`:e},R=(e,t,n,r,i,a,o,s)=>{if(!t)return l``;if(t.type==C.ClientSide){let c=L.get().renderClientSideComponent(e,t,n,r,i,a,o,s);return Aa()&&t.id?l`${Na(t.id,c)}`:c}let c=e.route,u=e.consumedRoute;return l`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${u}"
                         baseUrl="${n}"
                         slot="${t.slot??p}"
                         style="${fu(t.style)}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...r}}"
                         .data="${{...i}}"
                         .appState="${a}"
                         .appData="${o}"
        >
       </mateu-component>`},pu=e=>e===`back`||e===`backToList`||e===`cancel-view`,mu=e=>!!e&&e.startsWith(`cancel`)&&!pu(e),hu=e=>pu(e)||mu(e);function gu(e,t,n,r){if(!e||t==null)return;let i=ql(e,n,r,{row:t});if(!(!i||i===e||i.includes("${")))return i}function _u(e,t){for(let n of[`route-changed`,`navigate-to-requested`])e.dispatchEvent(new CustomEvent(n,{detail:{route:t},bubbles:!0,composed:!0}))}function vu(e){if(!e)return[];let t=new Set;for(let n of e.matchAll(/\$\{\s*row\.([A-Za-z0-9_]+)/g))t.add(n[1]);return[...t]}var yu=dc,bu=fc,xu=e=>(e||typeof document<`u`&&document.documentElement?.lang||typeof navigator<`u`&&navigator.language||``).toLowerCase().startsWith(`es`),Su=new Map;function Cu(e,t,n={}){let{crumbs:i,matched:a,pending:o}=vc(e,t);if(!a)return[];let s=[...i];if(o){let e=bu(n.title);return e&&e!==s[s.length-1]?.text&&s.push({text:e}),s.length<2?[]:s}let c=yu(t).slice(a.length).split(`/`).filter(Boolean),l=xu(n.lang);if(c.length>0){let e=decodeURIComponent(c[0]);if(e===`new`||e===`create`)s.push({text:r(`newRecord`,l?`es`:`en`)});else{let t=a+`/`+c[0],i=bu(n.title);c.length===1&&i&&Su.set(t,i),s.push({text:Su.get(t)||e,route:t}),c[1]===`edit`?s.push({text:r(`edit`,l?`es`:`en`)}):c.length>1&&s.push({text:i||decodeURIComponent(c[c.length-1])})}}if(s.length<2)return[];let u=s[s.length-1];return s[s.length-1]={text:u.text},s}var wu,Tu=!1,Eu,Du,Ou=new Set;function ku(e,t,n,r){if(Eu&&Eu!==e&&Eu.isConnected!==!1)return;Eu=e;let i=wu!==t||Tu!==!!n;wu=t,Tu=!!n,Du=r,i&&Ou.forEach(e=>e())}function Au(e){return Ou.add(e),()=>{Ou.delete(e)}}function ju(e){if(!Du)return!1;let t=bc(wu,e);return t?(Du(t,e),!0):!1}function Mu(e,t){return Tu?[]:Cu(wu,e,t)}var Nu=new WeakMap,Pu=e=>{let t=Nu.get(e);return t===void 0&&(t=typeof window<`u`?window.location.pathname:``,Nu.set(e,t)),t},Fu=new class{constructor(){this._dirty=!1,this._installed=!1,this.message=r(`unsavedChanges`),this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=e=>{this._dirty&&(e.preventDefault(),e.returnValue=``)}}install(){this._installed||(this._installed=!0,document.addEventListener(`dirty`,this._onDirty),document.addEventListener(`clean`,this._onClean),window.addEventListener(`beforeunload`,this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;let e=window.confirm(this.message);return e&&(this._dirty=!1),e}},Iu=`_record`,Lu=e=>String(e??``).normalize(`NFD`).replace(/[̀-ͯ]/g,``).toLowerCase().trim(),Ru=(e,t)=>{let n=Lu(t).split(/\s+/).filter(Boolean);return n.length===0?e:e.filter(e=>{let t=Lu(e.label)+` `+Lu(e.description);return n.every(e=>t.includes(e))})},zu=e=>(e.options??[]).find(t=>String(t.value)===String(e.value??``)),Bu=(e,t)=>e.disabled||t==null||String(t)===String(e.value??``)?null:{actionId:e.actionId,parameters:{[Iu]:t}},z=h`
    [role="button"]:focus-visible,
    [role="option"]:focus-visible,
    [role="treeitem"]:focus-visible,
    [role="tab"]:focus-visible,
    [role="gridcell"]:focus-visible,
    [tabindex="0"]:focus-visible {
        outline: 2px solid var(--lumo-primary-color, #3b5bdb);
        outline-offset: 2px;
        border-radius: var(--lumo-border-radius-s, 4px);
    }
`,Vu=class extends _{constructor(...e){super(...e),this.open=!1,this.filter=``,this.active=0}pick(e){if(!this.switcher)return;let t=Bu(this.switcher,e);this.open=!1,this.filter=``,t&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:t,bubbles:!0,composed:!0}))}visible(){return Ru(this.switcher?.options??[],this.filter)}onKey(e){let t=this.visible();e.key===`ArrowDown`?(e.preventDefault(),this.open=!0,this.active=Math.min(t.length-1,this.active+1)):e.key===`ArrowUp`?(e.preventDefault(),this.active=Math.max(0,this.active-1)):e.key===`Enter`?(e.preventDefault(),this.open&&t[this.active]&&this.pick(t[this.active].value)):e.key===`Escape`&&(this.open=!1,this.filter=``)}render(){let e=this.switcher;if(!e)return p;let t=zu(e),n=e.label??(e.type===`context`?r(`context`):``);if(!e.searchable)return l`
                <label class="switcher ${e.type??`object`}">
                    ${n?l`<span class="hint">${n}</span>`:p}
                    <select ?disabled=${!!e.disabled} aria-label="${n||r(`switchRecord`)}"
                            @change=${e=>this.pick(e.target.value)}>
                        ${(e.options??[]).map(t=>l`
                            <option value="${String(t.value)}" ?selected=${String(t.value)===String(e.value??``)}>${t.label}</option>`)}
                    </select>
                </label>`;let i=this.visible();return l`
            <div class="switcher ${e.type??`object`}">
                ${n?l`<span class="hint" id="hint">${n}</span>`:p}
                <div class="combo">
                    <input role="combobox" aria-expanded="${this.open}" aria-controls="list"
                           aria-autocomplete="list" aria-label="${n||r(`switchRecord`)}"
                           ?disabled=${!!e.disabled}
                           placeholder="${t?.label??``}"
                           .value=${this.filter}
                           @focus=${()=>{this.open=!0,this.active=0}}
                           @blur=${()=>setTimeout(()=>{this.open=!1,this.filter=``},150)}
                           @input=${e=>{this.filter=e.target.value,this.open=!0,this.active=0}}
                           @keydown=${this.onKey}>
                    ${this.open?l`
                        <ul id="list" role="listbox">
                            ${i.length===0?l`<li class="none">${r(`noMatches`)}</li>`:p}
                            ${i.map((t,n)=>l`
                                <li role="option" aria-selected="${String(t.value)===String(e.value??``)}"
                                    class="${n===this.active?`active`:``}"
                                    @mousedown=${e=>{e.preventDefault(),this.pick(t.value)}}>
                                    <span>${t.label}</span>
                                    ${t.description?l`<small>${t.description}</small>`:p}
                                </li>`)}
                        </ul>`:p}
                </div>
            </div>`}static{this.styles=[z,h`
        :host { display: inline-flex; }
        .switcher { display: inline-flex; align-items: center; gap: var(--lumo-space-s, .5rem); font-size: var(--lumo-font-size-s, .875rem); }
        .hint { color: var(--lumo-secondary-text-color, #6b7280); }
        select, input {
            font: inherit; color: var(--lumo-body-text-color, #1f2937);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.04));
            border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2));
            border-radius: var(--lumo-border-radius-m, .375rem);
            padding: .3rem .6rem; min-width: 12rem;
        }
        input::placeholder { color: var(--lumo-body-text-color, #1f2937); opacity: .85; }
        select:disabled, input:disabled { opacity: .6; }
        .combo { position: relative; }
        ul {
            position: absolute; z-index: 20; top: calc(100% + 2px); left: 0; min-width: 100%;
            max-height: 18rem; overflow: auto; margin: 0; padding: .25rem 0; list-style: none;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-m, .375rem);
            box-shadow: var(--lumo-box-shadow-m, 0 4px 12px rgba(0,0,0,.15));
        }
        li { padding: .35rem .75rem; cursor: pointer; display: flex; flex-direction: column; }
        li.active, li:hover { background: var(--lumo-primary-color-10pct, rgba(26,115,232,.1)); }
        li[aria-selected="true"] { font-weight: 600; }
        li small { color: var(--lumo-secondary-text-color, #6b7280); }
        li.none { color: var(--lumo-secondary-text-color, #6b7280); cursor: default; }
    `]}};o([n({attribute:!1})],Vu.prototype,`switcher`,void 0),o([s()],Vu.prototype,`open`,void 0),o([s()],Vu.prototype,`filter`,void 0),o([s()],Vu.prototype,`active`,void 0),Vu=o([i(`mateu-record-switcher`)],Vu);var Hu=e=>{let t=[];return e.color&&e.color!==`normal`&&e.color!==`none`&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle===`tertiaryInline`?`tertiary-inline`:e.buttonStyle),e.size&&e.size!==`none`&&e.size!==`normal`&&t.push(e.size),t.length?t.join(` `):void 0},Uu=e=>{let t=Hu(e)??``,n=[];return t.includes(`primary`)&&n.push(`primary`),t.includes(`tertiary`)&&n.push(`tertiary`),(t.includes(`error`)||e.color===`error`)&&n.push(`danger`),n.join(` `)},Wu=class extends _{constructor(...e){super(...e),this.appState={},this.appData={},this._overflowOpen=!1,this._overflowN=0,this._secCount=0,this._onDocClick=e=>{e.composedPath().includes(this)||(this._overflowOpen=!1)},this._resetOverflow=()=>{this._overflowN===0?this.requestUpdate():this._overflowN=0},this.handleButtonClick=e=>{this._overflowOpen=!1;let t=e.route?ql(e.route,this.state,this.data):void 0;if(t&&!t.includes("${")){_u(this,t);return}this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{crud_selected_items:this.listingSelection()}},bubbles:!0,composed:!0}))},this.listingSelection=()=>{let e=this.findSiblingCrud()?.state?.crud_selected_items;return Array.isArray(e)?e:[]},this.findSiblingCrud=()=>{let e=t=>{for(let n of Array.from(t.querySelectorAll(`*`))){if(n.tagName===`MATEU-TABLE-CRUD`)return n;if(n.shadowRoot){let t=e(n.shadowRoot);if(t)return t}}return null},t=this;for(;t;){let n=t,r=n.parentElement??(n.getRootNode?.()instanceof ShadowRoot?n.getRootNode().host:null);if(!r)break;let i=e(r);if(i)return i;t=r}return null},this.evalLabel=e=>ql(e,this.state,this.data),this.renderBackChevron=e=>{if((this.data??{})[e.actionId+`.hidden`])return p;let t=this.evalLabel(e.label);return l`
        <button class="back-chevron"
                data-action-id="${e.id}"
                title="${t}"
                aria-label="${t}"
                @click="${()=>this.handleButtonClick(e)}">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>`},this.renderBtn=e=>{if((this.data??{})[e.actionId+`.hidden`])return p;let t=this.evalLabel(e.label),n=L.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e));return n?Fa(e,n):Fa(e,l`
        <button class="mtb ${Uu(e)}"
                data-action-id="${e.id}"
                @click="${()=>this.handleButtonClick(e)}"
                ?disabled="${e.disabled}"
        >${t}</button>
    `)},this.renderActions=e=>{let t=e.filter(e=>!(this.data??{})[e.actionId+`.hidden`]),n=t.filter(e=>e.buttonStyle===`primary`),i=t.filter(e=>e.buttonStyle!==`primary`);this._secCount=i.length;let a=Math.max(0,Math.min(this._overflowN,i.length)),o=i.slice(0,i.length-a),s=i.slice(i.length-a);return l`
            <div class="actions-cluster">
                ${n.map(this.renderBtn)}
                ${o.map(this.renderBtn)}
                ${s.length?l`
                    <div class="overflow-wrap">
                        <button class="mtb overflow-btn" title="${r(`moreActions`)}" aria-label="${r(`moreActions`)}" aria-haspopup="true"
                                aria-expanded="${this._overflowOpen}"
                                @click="${e=>{e.stopPropagation(),this._overflowOpen=!this._overflowOpen}}">⋯</button>
                        ${this._overflowOpen?l`
                            <div class="overflow-menu">
                                ${s.map(e=>l`
                                    <button class="overflow-item" ?disabled="${e.disabled}"
                                            data-action-id="${e.actionId}"
                                            @click="${()=>this.handleButtonClick(e)}">${this.evalLabel(e.label)}</button>
                                `)}
                            </div>
                        `:p}
                    </div>
                `:p}
            </div>
        `},this.renderPeerNav=e=>L.get()?.renderPeerNav?.(e)||l`
            <div style="display: flex; gap: var(--lumo-space-xs, .25rem); align-items: center;" class="peer-nav">
                <button class="mtb tertiary peer-nav-prev"
                        title="${e.prevLabel??r(`previous`)}"
                        aria-label="${e.prevLabel??r(`previous`)}"
                        ?disabled="${!e.prevRoute}"
                        @click="${()=>{e.prevRoute&&Bc(e.prevRoute)}}">‹</button>
                <button class="mtb tertiary peer-nav-next"
                        title="${e.nextLabel??r(`next`)}"
                        aria-label="${e.nextLabel??r(`next`)}"
                        ?disabled="${!e.nextRoute}"
                        @click="${()=>{e.nextRoute&&Bc(e.nextRoute)}}">›</button>
            </div>
        `,this.renderSwitcher=e=>L.get()?.renderRecordSwitcher?.(e)||l`<mateu-record-switcher .switcher=${e}></mateu-record-switcher>`}connectedCallback(){super.connectedCallback(),document.addEventListener(`click`,this._onDocClick),this._ro=new ResizeObserver(()=>this._resetOverflow()),this._ro.observe(this),window.addEventListener(`resize`,this._resetOverflow),this._offShellMenu=Au(()=>this.requestUpdate())}disconnectedCallback(){this._offShellMenu?.(),this._offShellMenu=void 0,document.removeEventListener(`click`,this._onDocClick),window.removeEventListener(`resize`,this._resetOverflow),this._ro?.disconnect(),this._ro=void 0,super.disconnectedCallback()}updated(e){if(e.has(`_overflowOpen`)&&this._overflowOpen&&this._placeOverflowMenu(),e.has(`metadata`)||e.has(`data`)){this._resetOverflow();return}if(this._inDialog()){this._overflowN!==0&&(this._overflowN=0);return}let t=this.renderRoot.querySelector(`.actions-cluster`);if(!t||this._secCount===0)return;let n=t.closest(`.form-header, .no-header-row`);if(!n)return;let r=t.getBoundingClientRect(),i=n.getBoundingClientRect();(r.top-i.top>8||r.right>i.right+1)&&this._overflowN<this._secCount&&(this._overflowN+=1)}_inDialog(){let e=this;for(;e;){let t=e.tagName;if(t===`VAADIN-DIALOG-OVERLAY`||t===`DIALOG`||e.getAttribute?.(`role`)===`dialog`)return!0;e=e.parentElement??e.getRootNode?.()?.host}return!1}_placeOverflowMenu(){let e=this.renderRoot.querySelector(`.overflow-menu`);e&&(e.classList.remove(`flip`),e.getBoundingClientRect().left<0&&e.classList.add(`flip`))}crumbsOf(e,t){return e?.breadcrumbs&&e.breadcrumbs.length>0?e.breadcrumbs.map(e=>({text:e.text,route:e.link||void 0})):t>0||e?.type!==w.Page||e.noBreadcrumbs?[]:Mu(Pu(e),{title:e.title,pageType:e.pageType})}goToCrumb(e){if(/^[a-z][a-z0-9+.-]*:/i.test(e)){Bc(e);return}Fu.confirmLeave()&&(ju(e)||_u(this,e))}render(){let e=this.metadata;if(!e)return l``;let t=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0,n=e.toolbar??[],i=!e.noHeader,a=n.filter(e=>hu(e.actionId)&&!(i&&pu(e.actionId))),o=i?n.filter(e=>pu(e.actionId)):[],s=n.filter(e=>!hu(e.actionId)),c=a.length>0&&s.length>0?l`<span class="toolbar-divider"></span>`:p,u=e.overline,d=e.title?void 0:e.titlePlaceholder,f=e.avatar||e.title||e.subtitle||u||d||e.kpis?.length>0||e.header?.length>0||n.length>0||!!t||!!e.switcher,m=e.level??0;m>0?this.setAttribute(`data-nested`,``):this.removeAttribute(`data-nested`);let h=this.crumbsOf(e,m);return l`
            ${h.length>0?l`
                <nav class="breadcrumbs-bar" aria-label="${r(`breadcrumb`)}">
                    ${h.map((e,t)=>l`
                        ${t>0?l`<span class="breadcrumb-sep" aria-hidden="true">›</span>`:p}
                        ${e.route?l`<button class="breadcrumb-link" @click="${()=>this.goToCrumb(e.route)}">${e.text}</button>`:l`<span class="${t===h.length-1?`breadcrumb-current`:`breadcrumb-group`}"
                                        aria-current="${t===h.length-1?`page`:p}">${e.text}</span>`}
                    `)}
                </nav>
            `:p}
            ${e.noHeader?l`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;" class="no-header-row">
                    ${e?.header?.map(e=>R(this,e,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${t?this.renderPeerNav(t):p}
                    ${a.map(this.renderBtn)}
                    ${c}
                    ${this.renderActions(s)}
                </div>
            `:f?l`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center; flex-wrap: wrap;" class="form-header">
                    ${o.map(this.renderBackChevron)}
                    ${e.avatar?R(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):p}
                    <div style="flex: 1; min-width: min(22rem, 100%); overflow: ${e.switcher?`visible`:`hidden`};">
                        ${u?l`<div class="page-overline">${P(I(u,this.state??{},this.data??{}))}</div>`:p}
                        ${(e?.title||d)&&m==0?l`
                            <div style="display: flex; align-items: center; gap: var(--lumo-space-s, .5rem); min-width: 0;">
                                <h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${e?.title?P(I(e?.title,this.state??{},this.data??{})):l`<span class="page-title-placeholder">${P(I(d,this.state??{},this.data??{}))}</span>`}</h2>
                                ${e.kpisBelow&&e.badges?.length?e.badges.map(e=>uu(e,this.state??{},this.data??{},{pill:!0})):p}
                                ${e.switcher?this.renderSwitcher(e.switcher):p}
                            </div>`:p}
                        ${e.switcher&&!((e?.title||d)&&m==0)?this.renderSwitcher(e.switcher):p}
                        ${e?.title&&m==1?l`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${P(I(e?.title,this.state??{},this.data??{}))}</h3>`:p}
                        ${e?.title&&m==2?l`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${P(I(e?.title,this.state??{},this.data??{}))}</h4>`:p}
                        ${e?.title&&m==3?l`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${P(I(e?.title,this.state??{},this.data??{}))}</h5>`:p}
                        ${e?.title&&m>3?l`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${P(I(e?.title,this.state??{},this.data??{}))}</h6>`:p}

                        ${e?.subtitle?l`<span style="display: inline-block; margin-block-end: 0.83em;">${P(I(e?.subtitle,this.state??{},this.data??{}))}</span>`:p}
                        ${e?.timestamp?l`<span class="page-timestamp" style="display: block; color: var(--lumo-secondary-text-color, #6b7280); font-size: var(--lumo-font-size-s, .875rem);">${P(I(e.timestamp,this.state??{},this.data??{}))}</span>`:p}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${e.kpisBelow?p:e?.kpis?.map(e=>l`
                            <div class="header-fact">
                                <span class="header-fact-label">${this.evalLabel(e.title)}</span>
                                <span class="header-fact-value">${P(I(e.text,this.state??{},this.data??{}))}</span>
                            </div>
                        `)}
                        ${e?.header?.map(e=>R(this,e,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${t?this.renderPeerNav(t):p}
                        ${a.map(this.renderBtn)}
                        ${c}
                        ${this.renderActions(s)}
                    </div>
                </div>
            `:p}
            ${e.kpisBelow&&e?.kpis?.length?l`
                <div class="kpi-row">
                    ${e.kpis.map(e=>l`
                        <div class="kpi-pair">
                            <span class="kpi-label">${this.evalLabel(e.title)}</span>
                            <span class="kpi-value">${P(I(e.text,this.state??{},this.data??{}))}</span>
                        </div>
                    `)}
                </div>
            `:p}
            ${e.badges&&e.badges.length>0&&!e.kpisBelow?l`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${e.badges.map(e=>uu(e,this.state??{},this.data??{},{pill:!0}))}
                </div>
            `:p}
        `}static{this.styles=[h`
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

        /* The way back: a chevron sitting before the title, at its optical size rather than a
           button's. Quiet until pointed at, like the affordance it imitates — a detail view's back
           arrow is furniture, not an action competing with Save. */
        .back-chevron {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;
            width: 2rem;
            height: 2rem;
            padding: 0;
            margin-inline-start: -0.35rem;
            border: none;
            border-radius: 50%;
            background: transparent;
            color: var(--lumo-secondary-text-color, #5a6270);
            cursor: pointer;
        }
        .back-chevron svg { width: 1.25rem; height: 1.25rem; }
        .back-chevron:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); color: inherit; }
        .back-chevron:focus-visible { outline: 2px solid var(--lumo-primary-color, #2563eb); outline-offset: 2px; }

        /* Redwood overline: the small line above the title — a category or parent context.
           Quieter and smaller than the title, with the same ellipsis discipline. */
        .page-overline {
            color: var(--lumo-secondary-text-color, #6b7280);
            font-size: var(--lumo-font-size-s, .875rem);
            line-height: 1.2;
            margin-block-end: .15rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* Redwood pageTitlePlaceholder: stands in for a title that does not exist yet (create
           mode). Rendered inside the title heading so it keeps its size, but muted so it never
           reads as a real title. */
        .page-title-placeholder {
            color: var(--lumo-secondary-text-color, #5f6b7a);
            font-weight: inherit;
        }

        .breadcrumbs-bar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--lumo-space-xs, .25rem) var(--lumo-space-s, .5rem);
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #6b7280);
            padding-bottom: var(--lumo-space-xs, .25rem);
        }
        .breadcrumb-sep { color: var(--lumo-tertiary-text-color, #9ca3af); }
        .breadcrumb-current { color: var(--lumo-body-text-color, inherit); }

        .breadcrumb-link {
            border: none;
            background: transparent;
            cursor: pointer;
            font: inherit;
            color: var(--lumo-primary-text-color, #1676f3);
            padding: 0;
        }

        /* Facts row UNDER the title (hoisted EntityHeader anatomy): label+value pairs,
           label in small caps secondary, value emphasized — mirrors the VB/Redwood header. */
        /* @KPI in the header: the EntityHeader fact look (small-caps muted label over a bold
           value), like the front office stay's TOTAL RESERVA / AGENCIA */
        .header-fact {
            display: flex; flex-direction: column; gap: .1rem; min-width: 0;
            padding-inline-end: var(--lumo-space-s, .5rem);
        }
        .header-fact-label {
            font-size: var(--lumo-font-size-xxs, .7rem); font-weight: 600; letter-spacing: .05em;
            text-transform: uppercase; color: var(--lumo-secondary-text-color, #5f6b7a);
            white-space: nowrap;
        }
        .header-fact-value {
            font-size: var(--lumo-font-size-m, 1rem); font-weight: 600;
            color: var(--lumo-body-text-color, #222);
            white-space: nowrap; line-height: normal;
        }
        .kpi-row {
            display: flex;
            flex-wrap: wrap;
            gap: var(--lumo-space-s, .5rem) 2.5rem;
            align-items: baseline;
            padding: var(--lumo-space-xs, .25rem) 0 var(--lumo-space-s, .5rem);
        }
        .kpi-pair {
            display: flex;
            gap: var(--lumo-space-s, .5rem);
            align-items: baseline;
        }
        .kpi-label {
            font-size: var(--lumo-font-size-xs, .8125rem);
            letter-spacing: .03em;
            text-transform: uppercase;
            color: var(--lumo-secondary-text-color, #6b7280);
        }
        .kpi-value {
            font-weight: 600;
        }

        /* The action cluster stays on one line and moves/wraps as a unit; updated() measures it
           against the header row to decide how many trailing secondaries overflow into the menu. */
        .actions-cluster {
            display: inline-flex;
            align-items: center;
            flex-wrap: nowrap;
            gap: var(--lumo-space-xs, .25rem);
        }

        /* "…" overflow menu for secondary header actions */
        .overflow-wrap {
            position: relative;
            display: inline-block;
        }
        .overflow-btn {
            font-weight: 700;
            line-height: 1;
        }
        .overflow-menu {
            position: absolute;
            right: 0;
            top: calc(100% + .25rem);
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, .15));
            border-radius: var(--lumo-border-radius-m, 6px);
            box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0, 0, 0, .18));
            padding: .25rem;
            min-width: 13rem;
            display: flex;
            flex-direction: column;
            z-index: 30;
        }
        .overflow-menu.flip {
            right: auto;
            left: 0;
        }
        .overflow-item {
            text-align: left;
            border: none;
            background: transparent;
            font: inherit;
            padding: .5rem .75rem;
            border-radius: var(--lumo-border-radius-s, 4px);
            cursor: pointer;
            white-space: nowrap;
            color: var(--lumo-body-text-color, #1a1a1a);
        }
        .overflow-item:hover:not(:disabled) {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, .04));
        }
        .overflow-item:disabled {
            opacity: .5;
            cursor: default;
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

        ${ge}
    `,x]}};o([n()],Wu.prototype,`metadata`,void 0),o([n()],Wu.prototype,`baseUrl`,void 0),o([n()],Wu.prototype,`state`,void 0),o([n()],Wu.prototype,`data`,void 0),o([n()],Wu.prototype,`appState`,void 0),o([n()],Wu.prototype,`appData`,void 0),o([s()],Wu.prototype,`_overflowOpen`,void 0),o([s()],Wu.prototype,`_overflowN`,void 0),Wu=o([i(`mateu-content-header`)],Wu);var Gu=e=>{let t=e?.line;return typeof t==`number`&&t>1?Math.floor(t):1};function Ku(e,t=e=>e){let n=[],r=new Map;for(let i of e??[]){let e=Gu(t(i));e===1?n.push(i):(r.has(e)||r.set(e,[]),r.get(e).push(i))}return{first:n,extra:[...r.keys()].sort((e,t)=>e-t).map(e=>r.get(e))}}function qu(e,t=e=>e){let{first:n,extra:r}=Ku(e,t);return[...n,...r.flat()]}var Ju=class extends _{constructor(...e){super(...e),this.variant=`text`,this.count=3}static{this.styles=h`
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
    `}render(){let e=Array.from({length:Math.max(1,this.count)});return this.variant==`card`?l`${e.map(()=>l`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant==`grid`?l`${e.map(()=>l`<div class="bone row"></div>`)}`:this.variant==`form`?l`${e.map(()=>l`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:l`${e.map(()=>l`<div class="bone line"></div>`)}`}};o([n()],Ju.prototype,`variant`,void 0),o([n({type:Number})],Ju.prototype,`count`,void 0),Ju=o([i(`mateu-skeleton`)],Ju);var B=(e,t,n,r)=>{if(!e)return l``;let i=L.get()?.renderIcon;if(i){let a=i.call(L.get(),e,t,n);return r?l`<span slot="${r}">${a}</span>`:a}return l`<span class="mateu-icon ${n??``}" data-icon="${e}" aria-hidden="true"
                      style="display:inline-block; width:1em; height:1em; ${t??``}" slot="${r??p}"></span>`},Yu=`vaadin:ban`,Xu=e=>{let t=e??Yu;return t.includes(`:`)?L.get()?.renderIcon?B(t,`width: 1.8rem; height: 1.8rem;`):l`${e?p:`🗂`}`:l`${t}`},Zu=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t},bubbles:!0,composed:!0}))},Qu=(e,t,n,i,a,o)=>l`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${Xu(t)}</span>
            ${n?l`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${n}</span>`:p}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${i??e??r(`nothingHere`)}</span>
            ${a&&o?l`
                <button style="margin-top: .25rem; font: inherit; font-weight: 500; cursor: pointer; padding: .4rem .9rem; border: none; border-radius: var(--lumo-border-radius-m, 6px); background: transparent; color: var(--lumo-primary-text-color, #3b5bdb);"
                        @click="${e=>Zu(e,a)}">${o}</button>
            `:p}
        </div>
    `,$u=e=>{let t=e.metadata;return l`
        <div style="${e.style??p}" class="${e.cssClasses??p}" slot="${e.slot??p}">
            ${Qu(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},ed=e=>{let t=e.metadata;return l`
        <mateu-skeleton
                variant="${t.variant??`text`}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-skeleton>
    `},td;async function nd(e){if(!td)return{};try{return await td(e)??{}}catch(e){return console.warn(`mateu: external auth provider failed`,e),{}}}function rd(e,t){return t?t.split(`.`).reduce((e,t)=>typeof e==`object`&&e?e[t]:void 0,e):e}function id(e,t,n=`value`,r=`label`){let i=rd(e,t);return Array.isArray(i)?i.map(e=>{if(typeof e==`object`&&e){let t=rd(e,n),i=rd(e,r);return{value:t??i,label:String(i??t??``)}}return{value:e,label:String(e)}}):[]}function ad(e,t,n,r=e=>e){let i=rd(e,t);return Array.isArray(i)?i.map(e=>{let t={};for(let i of n)t[i]=rd(e,r(i));return t}):[]}var od=null;function sd(e){od=e}async function cd(e,t=e=>e,n=fetch,r){let i=le(e),a=(i.method||`GET`).toUpperCase(),o=t.url??t;if(od){let t=i.url?o(i.url)??i.url:``,n=od({url:t,ref:e.ref,method:a});if(n!==void 0)return n}if(fe(e))return a!==`GET`&&a!==`HEAD`?null:structuredClone(b(e));if(!i.url)throw Error(`External REST fetch has no url${e.ref?` (unknown source "${e.ref}")`:``}`);let s=o(i.url)??i.url,c={};for(let[e,n]of Object.entries(i.headers??{}))c[e]=t(n)??n;Object.assign(c,await nd({url:s,method:a}));let l={method:a,headers:c};a!==`GET`&&a!==`HEAD`&&i.body&&(l.body=(r&&ie(c)?r:t)(i.body)??i.body);let u=await n(s,l);if(!u.ok)throw Error(`External REST fetch failed: ${u.status}`);if(u.status===204||u.status===205)return null;if(typeof u.text!=`function`)return u.json();let d=await u.text();return d.trim()===``?null:JSON.parse(d)}async function ld(e,t=e=>e,n=fetch){let r=await cd(e,t,n),i=le(e);return id(r,i.itemsPath,i.valuePath,i.labelPath)}async function ud(e,t,n=e=>e,r=fetch){return ad(await cd(e,n,r),le(e).itemsPath,t,t=>me(e,t))}async function dd(e,t,n=e=>e,r=fetch){return fd(await cd(e,n,r),e,t)}function fd(e,t,n){let r=ad(e,le(t).itemsPath,n,e=>me(t,e)),i=rd(e,he(t)),a=typeof i==`number`?i:Number(i);return{rows:r,total:Number.isFinite(a)?a:null}}var pd=(e,t,n=!1)=>e&&e>1||n?l`<div style="grid-column: span ${e&&e>1?e:1}; min-width: 0;">${t}</div>`:t,md=`var(--lumo-space-m, 1rem)`,hd=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.columnWidth||`13rem`,u=`display: grid; grid-template-columns: ${s.maxColumns&&s.maxColumns>0?`repeat(${s.maxColumns}, minmax(0, 1fr))`:`repeat(auto-fill, minmax(min(100%, ${c}), 1fr))`}; gap: ${md} var(--lumo-space-l, 1.5rem); align-items: start;`;return s.labelsAside&&(u+=` --mateu-label-width: 10rem;`),s.fullWidth&&(u+=` width: 100%;`),u+=t.style??``,l`
        <div id="${t.id??p}" style="${u}" class="${t.cssClasses}" slot="${t.slot||p}">
            ${t.children?.map(t=>gd(s,e,t,n,r,i,a,o))}
        </div>
    `},gd=(e,t,n,r,i,a,o,s)=>n.type==C.ClientSide&&n.metadata?.type==w.FormRow?yd(e,t,n,r,i,a,o,s):pd(_d(n),e.labelsAside?vd(t,n,r,i,a,o,s):R(t,n,r,i,a,o,s),!0),_d=e=>{if(e.type==C.ClientSide){let t=e.metadata;if(t?.type==w.FormField)return t.colspan||1}return 1},vd=(e,t,n,r,i,a,o)=>{if(t.type==C.ClientSide&&t.metadata?.type==w.FormField&&t.metadata.label){let s=t.metadata,c=s.label?.includes("${")?e._evalTemplate(s.label):s.label;return l`
            <div style="display: flex; gap: ${md}; align-items: baseline;">
                <label style="flex: 0 0 var(--mateu-label-width, 10rem); color: var(--lumo-secondary-text-color, #667);">${c}</label>
                <div style="flex: 1; min-width: 0;">${R(e,t,n,r,i,a,o,!0)}</div>
            </div>
        `}return R(e,t,n,r,i,a,o)},yd=(e,t,n,r,i,a,o,s)=>l`
        <div style="grid-column: 1 / -1; display: flex; gap: ${md}; flex-wrap: wrap;">
            ${n.children?.map(c=>l`<div style="flex: 1 1 ${100/Math.max(1,n.children.length)}%; min-width: min(100%, 13rem);">${gd(e,t,c,r,i,a,o,s)}</div>`)}
        </div>
    `,bd=(e,t,n,r,i,a,o,s)=>{let c=n.metadata,u=`display: flex; flex-direction: ${e};`;c.spacing&&(u+=` gap: ${md};`),c.padding&&(u+=` padding: var(--lumo-space-m, 1rem);`),c.wrap&&(u+=` flex-wrap: wrap;`),c.fullWidth&&(u+=` width: 100%;`),c.justification&&(u+=` justify-content: ${c.justification};`);let d=e===`row`?c.verticalAlignment:c.horizontalAlignment;return d&&(u+=` align-items: ${d};`),u+=n.style??``,l`
        <div id="${n.id??p}" style="${u}" class="${n.cssClasses}" slot="${n.slot??p}">
            ${n.children?.map(e=>R(t,e,r,i,a,o,s))}
        </div>
    `},xd=(e,t,n,r,i,a,o)=>bd(`row`,e,t,n,r,i,a,o),Sd=(e,t,n,r,i,a,o)=>bd(`column`,e,t,n,r,i,a,o),Cd=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=`display: flex; flex-direction: ${s.orientation===`vertical`?`column`:`row`}; gap: var(--lumo-space-s, 0.5rem);`;return s.fullWidth&&(c+=` width: 100%;`),c+=t.style??``,l`
        <div id="${t.id??p}" style="${c}" class="${t.cssClasses}" slot="${t.slot??p}">
            <div style="flex: 1; min-width: 0; min-height: 0;">${R(e,t.children[0],n,r,i,a,o)}</div>
            <div style="flex: 1; min-width: 0; min-height: 0;">${R(e,t.children[1],n,r,i,a,o)}</div>
        </div>
    `},wd=(e,t,n,i,a,o,s)=>{let c=t.children&&t.children.length>1?t.children[1]:null,u=a?.detailComponent??null,d=!!a?.hasDetail||!!c,f=u??c;return l`
        <div id="${t.id??p}" style="display: flex; gap: var(--lumo-space-m, 1rem); ${t.style??``}" class="${t.cssClasses}" slot="${t.slot??p}">
            <div style="flex: 1; min-width: 0;">${R(e,t.children[0],n,i,a,o,s)}</div>
            ${d&&f?l`<div style="flex: 1; min-width: 0;">${R(e,f,n,i,a,o,s)}</div>`:l`<div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-s, .875rem);">${r(`selectItemForDetails`)}</div>`}
        </div>
    `},Td=(e,t,n,r,i,a,o)=>{let s=t.style??``;t.metadata.fullWidth&&(s+=` width: 100%;`);let c=Math.max(0,(t.children??[]).findIndex(e=>e.metadata.active));return l`
        <div id="${t.id??p}" style="${s}" class="${t.cssClasses}" slot="${t.slot??p}">
            ${t.children?.map((t,s)=>{let u=t,d=u.metadata.label,f=d?.includes("${")?e._evalTemplate(d):d;return l`
                    <details data-node-id="${ja(u)}" ?open="${s===c}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));">
                        <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600;">${f}</summary>
                        <div style="padding: var(--lumo-space-m, 1rem) 0;">
                            ${u.children?.map(t=>R(e,t,n,r,i,a,o))}
                        </div>
                    </details>
                `})}
        </div>
    `},Ed=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style??``;return s.fullWidth&&(c+=` width: 100%;`),l`
        <div style="${c}" class="${t.cssClasses}" slot="${t.slot??p}">
            ${t.children?.map(t=>Dd(e,t,n,r,i,a,o,s.variant))}
        </div>
    `},Dd=(e,t,n,r,i,a,o,s)=>{let c=t.metadata,u=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return l`
        <details data-node-id="${ja(t)}" ?open="${c.active}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); ${t.style??``}" class="${t.cssClasses}">
            <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600; ${c.disabled?`pointer-events: none; opacity: .5;`:``}">${u}</summary>
            <div style="padding: var(--lumo-space-s, .5rem) 0;">
                ${t.children?.map(t=>R(e,t,n,r,i,a,o))}
            </div>
        </details>
    `},Od=(e,t,n,r,i,a,o)=>l`
        <div style="overflow: auto; ${t.style??``}" class="${t.cssClasses}" slot="${t.slot??p}">
            ${t.children?.map(t=>R(e,t,n,r,i,a,o))}
        </div>
    `,kd=(e,t,n,r,i,a,o)=>l`
        <div style="width: 100%; ${t.style}" class="${t.cssClasses}" slot="${t.slot??p}">
            ${t.children?.map(t=>R(e,t,n,r,i,a,o))}
        </div>
    `,Ad=(e,t,n,r,i,a,o)=>l`
        <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" class="${t.cssClasses}" slot="${t.slot??p}">
            ${t.children?.map(t=>R(e,t,n,r,i,a,o))}
        </div>
    `,jd=(e,t,n,r,i,a,o)=>l`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: ${md}; ${t.style}" class="${t.cssClasses}" slot="${t.slot??p}">
            ${t.children?.map(t=>R(e,t,n,r,i,a,o))}
        </div>
    `,Md=(e,t,n,r,i,a,o)=>l`
        <div style="display: flex; gap: ${md}; flex-wrap: wrap; ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(t=>R(e,t,n,r,i,a,o))}
        </div>
    `,Nd=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`
        <div style="flex: ${s.boardCols??1} 1 0; min-width: min(100%, 12rem); ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(t=>R(e,t,n,r,i,a,o))}
        </div>
    `},Pd=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`
        <div
                style="display: flex; flex-direction: column; overflow: auto; ${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??p}"
        >
            ${s.page.content.map(t=>R(e,t,n,r,i,a,o))}
        </div>
    `},Fd=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,Id=e=>typeof e==`string`&&Fd.test(e),Ld=e=>Id(e)?`…-`+e.substring(e.lastIndexOf(`-`)+1):e,Rd=e=>t=>{t.clipboardData&&(t.clipboardData.setData(`text/plain`,e),t.preventDefault())},zd=e=>Id(e)?l`<span class="mateu-uuid" data-uuid="${e}" title="${e}"
                     @copy="${Rd(e)}">${Ld(e)}</span>`:e,Bd=e=>{let t=e.metadata;return(t?.content??t?.columns??[]).filter(e=>e&&e.metadata).map(e=>{let t=e.metadata;return{id:e.id??``,label:t?.label??e.id??``,autoWidth:t?.autoWidth,width:t?.width}})},Vd=(e,t)=>{let n=e?.[t];return n==null?``:typeof n==`object`?n.text??n.label??n.value??``:String(n)},Hd=(e,t,n)=>{let i=Bd(e);return l`
        <div style="overflow:auto; width:100%; ${e.style}" class="${e.cssClasses}" slot="${e.slot??p}">
            <table style="border-collapse:collapse; width:100%; font-size: var(--lumo-font-size-s,.875rem);">
                <thead><tr>${i.map(e=>l`<th style="${`text-align:left; padding:.45rem .6rem; border-bottom:2px solid var(--lumo-contrast-20pct,rgba(0,0,0,.2)); font-weight:600; white-space:nowrap; color: var(--lumo-secondary-text-color,#556);`}">${e.label}</th>`)}</tr></thead>
                <tbody>
                    ${(t??[]).length===0?l`<tr><td colspan="${Math.max(1,i.length)}" style="padding:1.5rem; text-align:center; color: var(--lumo-secondary-text-color,#888);">${n??r(`noData`)}</td></tr>`:t.map(e=>l`<tr>${i.map(t=>l`<td style="${`padding:.4rem .6rem; border-bottom:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.08)); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:24rem;`}" title="${Vd(e,t.id)}">${zd(Vd(e,t.id))}</td>`)}</tr>`)}
                </tbody>
            </table>
        </div>
    `},Ud=(e,t)=>{let n=e.metadata;return e.id&&t&&t[e.id]?t[e.id]:n?.page?.content??[]},Wd=e=>{let t=e.metadata.items??[];return l`
        <div class="mateu-message-list ${e.cssClasses??``}"
             style="display:flex; flex-direction:column; gap:.75rem; ${e.style??``}"
             slot="${e.slot??p}">
            ${t.map(e=>l`
                <div style="display:flex; gap:.6rem; align-items:flex-start;">
                    <span style="flex:0 0 auto; width:2rem; height:2rem; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:.8rem; background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);">
                        ${e.userImg?l`<img src="${e.userImg}" alt="" style="width:100%; height:100%; object-fit:cover;">`:e.userAbbr??(e.userName?e.userName.charAt(0):`?`)}
                    </span>
                    <div style="min-width:0;">
                        <div style="display:flex; gap:.5rem; align-items:baseline;">
                            ${e.userName?l`<span style="font-weight:600;">${e.userName}</span>`:p}
                            ${e.time?l`<span style="font-size:var(--lumo-font-size-xs,.75rem); color:var(--lumo-secondary-text-color,#666);">${e.time}</span>`:p}
                        </div>
                        <div style="white-space:pre-wrap; overflow-wrap:anywhere;">${e.text}</div>
                    </div>
                </div>
            `)}
        </div>
    `},Gd=(e,t,n,r,i,a,o)=>t.separator?l`<span style="align-self: stretch; width: 1px; background: var(--lumo-contrast-20pct, rgba(0,0,0,.2));"></span>`:t.submenus?l`
            <details style="position: relative;">
                <summary style="cursor: pointer; list-style: none; padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);">
                    ${t.component?R(e,t.component,n,r,i,a,o):t.label} ▾
                </summary>
                <div style="display: flex; flex-direction: column; gap: .1rem; padding: .3rem; min-width: 10rem;
                            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px);
                            background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.15));">
                    ${t.submenus.map(t=>Gd(e,t,n,r,i,a,o))}
                </div>
            </details>
        `:l`
        <span class="${t.className??``}"
              style="cursor: ${t.disabled?`default`:`pointer`}; opacity: ${t.disabled?.5:1};
                     padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);
                     ${t.selected?`background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));`:``}">
            ${t.component?R(e,t.component,n,r,i,a,o):t.label}
        </span>
    `,Kd=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`
        <div style="display: flex; flex-wrap: wrap; gap: .25rem; align-items: center; ${t.style}"
             class="${t.cssClasses}" slot="${t.slot??p}">
            ${s.options?.map(t=>Gd(e,t,n,r,i,a??{},o??{}))}
        </div>
    `},qd=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`
        <div style="${t.style}" class="${t.cssClasses}" slot="${t.slot??p}">
            ${R(e,s.wrapped,n,r,i,a,o)}
        </div>
    `},Jd=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.content?.metadata,u=c?.type==w.Notice&&c.fullWidth===!0;return l`
        <div style="display:flex; flex-direction:column; ${u?`width: 100%; `:``}${t.style}"
             class="${t.cssClasses}"
             slot="${t.slot??p}"
             data-colspan="${s.colspan||(u?99:p)}"
        >
            ${s.label?l`<label style="font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${s.label}</label>`:p}
            ${R(e,s.content,n,r,i,a,o)}
        </div>
            `},Yd=e=>{let t=e.metadata,n=e=>{let n=e.closest(`.mateu-message-input`)?.querySelector(`input`),r=n?.value??``;!t.actionId||!r.trim()||(e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:{message:r}},bubbles:!0,composed:!0})),n&&(n.value=``))};return l`
        <div class="mateu-message-input ${e.cssClasses??``}"
             style="display:flex; gap:.5rem; align-items:center; ${e.style??``}"
             slot="${e.slot??p}">
            <input type="text"
                   style="flex:1; min-width:0; font:inherit; padding:.5rem .75rem; border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16)); border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513);"
                   @keydown="${e=>{e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),n(e.currentTarget))}}">
            <button style="font:inherit; font-weight:500; cursor:pointer; padding:.5rem 1rem; border:none; border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);"
                    @click="${e=>n(e.currentTarget)}">${r(`send`)}</button>
        </div>
    `},Xd=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`<span title="${s.text}" style="${t.style}" class="${t.cssClasses}" slot="${t.slot??p}"
        >${R(e,s.wrapped,n,r,i,a,o)}</span>`},V=e=>e??g,Zd=e=>{if(e instanceof CustomEvent)return e.detail;let t={};for(let n in e){let r=e[n];[`number`,`string`,`boolean`].indexOf(typeof r)>=0&&(t[n]=e[n])}return t},Qd=(e,t,n,r,i)=>{let a={appState:r??{},appData:i??{}},o={};for(let r in e.attributes)o[r]=ql(e.attributes[r],t,n,a);return{attributes:o,content:ql(e.content,t,n,a)}},$d=(e,t,n,r)=>{for(let t in r.attributes)e.setAttribute(t,r.attributes[t]);n.style&&e.setAttribute(`style`,n.style),n.cssClasses&&e.setAttribute(`class`,n.cssClasses),n.slot&&e.setAttribute(`slot`,n.slot),r.content&&(t.html?e.innerHTML=t.content?.includes("${")?ll(r.content):r.content:e.append(r.content))},ef=e=>{let t=e.name,n=e.attributes?e.attributes.import:void 0;n&&t.includes(`-`)&&!customElements.get(t)&&be(()=>import(n),[],import.meta.url)},tf=(e,t,n,r,i,a,o)=>{ef(t);let s=Qd(t,r,i,a,o),c=t.name;s.attributes.id&&(c=`#`+s.attributes.id);let u=n.id?`.element-container[data-element-id="${n.id}"]`:`.element-container`;return setTimeout(()=>{let r=e.shadowRoot?.querySelector(u),i=r?.querySelector(c);if(i){for(;i.firstChild;)i.removeChild(i.lastChild);$d(i,t,n,s)}else{let i=document.createElement(t.name);$d(i,t,n,s);for(let n in t.on)i.addEventListener(n,r=>{let i=Zd(r);e.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.on[n],parameters:{event:i}},bubbles:!0,composed:!0}))});r?.appendChild(i)}}),l`<div class="element-container" data-element-id="${V(n.id)}"></div>`},nf=function(e){return e.div=`div`,e.p=`p`,e.h1=`h1`,e.h2=`h2`,e.h3=`h3`,e.h4=`h4`,e.h5=`h5`,e.h6=`h6`,e.span=`span`,e}({}),rf=(e,t,n,r,i)=>{let a={...e.metadata};a.container??=nf.div;let o=a.attributes?.[`data-colspan`],s=Jl(a.text,t,n,r,i),c={xl:`var(--lumo-font-size-xl, 1.375rem)`,l:`var(--lumo-font-size-l, 1.125rem)`,s:`var(--lumo-font-size-s, .875rem)`,xs:`var(--lumo-font-size-xs, .8125rem)`},u=(a.size&&c[a.size]?`font-size: ${c[a.size]}; `:``)+(a.noMargins?`margin-block-start: 0; margin-block-end: 0; `:``);return nf.h1==a.container?l`
            <h1 style="${u}${e.style}" class="${e.cssClasses}"
                id="${V(e.id)}"
                data-colspan="${V(o)}"
                slot="${e.slot??p}">
                ${s??p}
            </h1>
        `:nf.h2==a.container?l`
            <h2 style="${u}${e.style}" class="${e.cssClasses}"
                id="${V(e.id)}"
                data-colspan="${V(o)}"
                slot="${e.slot??p}">
                ${s??p}
            </h2>
        `:nf.h3==a.container?l`
            <h3 style="${u}${e.style}" class="${e.cssClasses}"
                id="${V(e.id)}"
                data-colspan="${V(o)}"
                slot="${e.slot??p}">
                ${s??p}
            </h3>
        `:nf.h4==a.container?l`
            <h4 style="${u}${e.style}" class="${e.cssClasses}"
                id="${V(e.id)}"
                data-colspan="${V(o)}"
                slot="${e.slot??p}">
                ${s??p}
            </h4>
        `:nf.h5==a.container?l`
            <h5 style="${u}${e.style}" class="${e.cssClasses}"
                id="${V(e.id)}"
                data-colspan="${V(o)}"
                slot="${e.slot??p}">
                ${s??p}
            </h5>
        `:nf.h6==a.container?l`
            <h6 style="${u}${e.style}" class="${e.cssClasses}"
                id="${V(e.id)}"
                data-colspan="${V(o)}"
                slot="${e.slot??p}">
                ${s??p}
            </h6>
        `:nf.p==a.container?l`
               <p style="${u}${e.style}" class="${e.cssClasses}"
                  id="${V(e.id)}"
                  data-colspan="${V(o)}"
                  slot="${e.slot??p}">
                   ${s??p}
               </p>
            `:nf.div==a.container?l`
               <div style="${u}${e.style}" class="${e.cssClasses}"
                    id="${V(e.id)}"
                    data-colspan="${V(o)}"
                    slot="${e.slot??p}">${s?P(s):p}</div>
            `:nf.span==a.container?l`
               <span style="${u}${e.style}" class="${e.cssClasses}"
                     id="${V(e.id)}"
                     data-colspan="${V(o)}"
                    slot="${e.slot??p}">${s??p}</span>
            `:l`
               <p
                       id="${V(e.id)}"
                       data-colspan="${V(o)}"
                       slot="${e.slot??p}">
                   Unknown text container: ${a.container} 
               </p>
            `},af=e=>{let t=e.metadata;return l`<a href="${V(Hc(t.url))}" target="${t.target??p}"
                   rel="${t.target===`_blank`?`noopener`:p}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??p}">${t.text}</a>`},of=(e,t)=>{let n=e.toLowerCase().split(`+`);return t.ctrlKey===n.includes(`ctrl`)&&t.altKey===n.includes(`alt`)&&t.shiftKey===n.includes(`shift`)&&t.metaKey===n.includes(`meta`)},sf=(e,t)=>{if(!of(e,t))return!1;let n=e.toLowerCase().split(`+`),r=n[n.length-1];return!!(t.key.toLowerCase()===r||/^[a-z]$/.test(r)&&t.code===`Key`+r.toUpperCase()||/^[0-9]$/.test(r)&&(t.code===`Digit`+r||t.code===`Numpad`+r))},cf=e=>e?e.split(`+`).map(e=>e.length<=1?e.toUpperCase():e.charAt(0).toUpperCase()+e.slice(1)).join(`+`):void 0,lf=(e,t)=>{let n=e.currentTarget,r=n.dataset.route;if(r){_u(n,r);return}n.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:n.dataset.actionId,parameters:t.parameters},bubbles:!0,composed:!0}))},uf=(e,t,n)=>{if(!e.route)return;let r=ql(e.route,t,n);return!r||r.includes("${")?void 0:r},df=`display:inline-flex; align-items:center; justify-content:center; gap:.4em; box-sizing:border-box; font:inherit; font-weight:500; cursor:pointer; border-radius:var(--lumo-border-radius-m,6px); border:1px solid transparent; line-height:1; white-space:nowrap;`,ff=e=>{let t=e.buttonStyle??``,n=e.color&&e.color!==`none`&&e.color!==`normal`?e.color:``,r=e.size,i=n===`success`?`var(--lumo-success-color,#1a7f37)`:n===`error`?`var(--lumo-error-color,#c5221f)`:n===`contrast`?`var(--lumo-contrast,#161513)`:`var(--lumo-primary-color,#3b5bdb)`,a=n===`success`?`var(--lumo-success-contrast-color,#fff)`:n===`error`?`var(--lumo-error-contrast-color,#fff)`:n===`contrast`?`var(--lumo-base-color,#fff)`:`var(--lumo-primary-contrast-color,#fff)`,o=n===`success`?`var(--lumo-success-text-color,#1a7f37)`:n===`error`?`var(--lumo-error-text-color,#c5221f)`:n===`contrast`?`var(--lumo-body-text-color,#161513)`:`var(--lumo-primary-text-color,#3b5bdb)`,s;return s=t===`primary`?`background:${i}; color:${a};`:t===`tertiary`||t===`tertiaryInline`?`background:transparent; color:${o};`:`background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:${o}; border-color:var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,`${df}${s}${r===`small`?`padding:.25rem .6rem; font-size:var(--lumo-font-size-s,.875rem);`:r===`large`?`padding:.65rem 1.4rem; font-size:var(--lumo-font-size-l,1.125rem);`:`padding:.45rem 1rem; font-size:var(--lumo-font-size-m,1rem);`}`},pf=(e,t,n)=>{let r=e.metadata,i=ql(r.label,t,n);return l`<button
            id="${e.id}"
            data-action-id="${r.actionId}"
            data-route="${uf(r,t,n)??p}"
            @click="${e=>lf(e,r)}"
            style="${ff(r)}${e.style}"
            class="${e.cssClasses}"
            ?disabled="${r.disabled}"
            data-shortcut="${r.shortcut??p}"
            title="${r.shortcut?`${i} (${cf(r.shortcut)})`:p}"
            slot="${e.slot??p}"
    >${r.iconOnLeft?B(r.iconOnLeft):p}${i}${r.iconOnRight?B(r.iconOnRight):p}</button>`},mf=`display:block; box-sizing:border-box; background:var(--lumo-base-color,#fff); border:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.1)); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-xs,0 1px 3px rgba(0,0,0,.08)); overflow:hidden;`,hf=(e,t,n,r,i,a,o)=>{let s=t.metadata;if(!s)return l``;let c=t=>t?R(e,t,n,r,i,a,o,!1):p,u=s.header||s.headerPrefix||s.headerSuffix||s.title||s.subtitle;return l`
        <div id="${t.id??p}" style="${mf}${t.style}" class="${t.cssClasses}" slot="${t.slot??p}">
            ${s.media?c(s.media):p}
            ${u?l`<div style="display:flex; align-items:flex-start; gap:.75rem; padding:1rem 1.25rem ${s.content||s.footer?`0`:`1rem`};">
                ${s.headerPrefix?c(s.headerPrefix):p}
                <div style="flex:1; min-width:0;">
                    ${s.header?c(s.header):p}
                    ${s.title?l`<div style="font-weight:600; font-size:1.05rem; color:var(--lumo-body-text-color,#161513);">${c(s.title)}</div>`:p}
                    ${s.subtitle?l`<div style="color:var(--lumo-secondary-text-color,#667);">${c(s.subtitle)}</div>`:p}
                </div>
                ${s.headerSuffix?c(s.headerSuffix):p}
            </div>`:p}
            ${s.content?l`<div style="padding:1rem 1.25rem;">${c(s.content)}</div>`:p}
            ${s.footer?l`<div style="padding:0 1.25rem 1rem;">${c(s.footer)}</div>`:p}
        </div>
    `},gf=e=>{let t=e.metadata;return l`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??p}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},_f=e=>{let t=e.metadata;return B(t.icon,e.style,e.cssClasses,e.slot)},vf=(e,t)=>{e&&e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t},bubbles:!0,composed:!0}))},yf=`font:inherit; font-weight:500; cursor:pointer; padding:.45rem 1rem; border-radius:var(--lumo-border-radius-m,6px);`,bf=`${yf} background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:var(--lumo-body-text-color,#161513); border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,xf=`${yf} background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff); border:1px solid transparent;`,Sf=(e,t,n,i,a,o,s)=>{let c=t.metadata,u=!1;if(c.openedCondition)try{u=Ql(c.openedCondition,i,a,o,s)}catch(e){console.error(`when evaluating `+c.openedCondition+` :`+e+`, where data is `+a+` and state is `+i)}return u?l`
        <div class="mateu-confirm-dialog ${t.cssClasses??``}"
             style="position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.4); ${t.style??``}"
             slot="${t.slot??p}">
            <div style="background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-l,0 8px 24px rgba(0,0,0,.2)); width:100%; max-width:min(90vw,32rem); padding:1.5rem; box-sizing:border-box;">
                ${c.header?l`<h3 style="margin:0 0 .75rem; font-size:1.15rem;">${c.header}</h3>`:p}
                <div>${t.children?.map(t=>R(e,t,n,i,a,o,s))}</div>
                <div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:1.25rem;">
                    ${c.canCancel?l`<button style="${bf}" @click="${e=>vf(e.currentTarget,c.cancelActionId)}">${c.rejectText&&!c.canReject?c.rejectText:r(`cancel`)}</button>`:p}
                    ${c.canReject?l`<button style="${bf}" @click="${e=>vf(e.currentTarget,c.rejectActionId)}">${c.rejectText||r(`no`)}</button>`:p}
                    <button style="${xf}" @click="${e=>vf(e.currentTarget,c.confirmActionId)}">${c.confirmText||r(`ok`)}</button>
                </div>
            </div>
        </div>
    `:l``},Cf=e=>{let t=e.metadata,n;return t.position&&(n={Top:`top`,Bottom:`bottom`,TopLeft:`top-left`,TopRight:`top-right`,BottomLeft:`bottom-left`,BottomRight:`bottom-right`}[t.position]),l`
        <mateu-cookie-consent style="${e.style}" class="${e.cssClasses}"
                               slot="${e.slot??p}"
                               position="${n??p}"
                               cookie-name="${t.cookieName??p}"
                               .message="${t.message??p}"
                               theme="${t.theme??p}"
                               .learnMore="${t.learnMore??p}"
                               .learnMoreLink="${t.learnMoreLink??p}"
                               .dismiss="${t.dismiss??p}"
        ></mateu-cookie-consent>
    `},wf=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`
        <details
                ?open="${s.opened}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??p}"
        >
            <summary>${R(e,s.summary,n,r,i,a,o)}</summary>
            ${R(e,s.content,n,r,i,a,o)}
        </details>
            `},Tf=(e,t,n,r,i,a)=>l`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${n}"
            .xdata="${r}"
            .appState="${i}"
            .appdata="${a}"
        ></mateu-dialog>
            `,Ef=(e,t,n,r,i,a)=>l`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${n}"
            .xdata="${r}"
            .appState="${i}"
            .appdata="${a}"
        ></mateu-drawer>
            `,Df=e=>`mfe_`+[e.baseUrl,e.route,e.consumedRoute,e.serverSideType].map(e=>e??``).join(`|`).replace(/[^a-zA-Z0-9]/g,`_`),Of=e=>{let t=e.metadata;return l`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"
                  route="${t.route}"
                  consumedRoute="${t.consumedRoute}"
                  id="${Df(t)}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??p}"
        ></mateu-ux>
        </mateu-api-caller>
            `},kf=e=>{let t=e.metadata;return l`
        <mateu-markdown .content=${t.markdown}
                        style="display:block; max-width: 72ch; ${e.style??``}" class="${e.cssClasses}"
                        slot="${e.slot??p}"></mateu-markdown>
            `},Af=e=>{let t=e.metadata;return l`
        <div
            role="status"
            slot="${e.slot??p}"
            class="${e.cssClasses}"
            style="display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.9rem;
                   border-radius: var(--lumo-border-radius-m, 8px);
                   background: var(--lumo-contrast-5pct, rgba(0,0,0,0.05));
                   color: var(--lumo-body-text-color, #1a1a1a); ${e.style}"
        >
            ${t.title?l`<strong>${t.title}</strong>`:p}
            ${t.text?l`<span>${t.text}</span>`:p}
        </div>
    `},jf=(e,t={})=>{let n=e.metadata,r=n.valueKey?t[n.valueKey]:n.value,i=n.max&&n.max!=0?n.max:1,a=!n.indeterminate&&r!=null;return l`
        <div style="${e.style}" class="${e.cssClasses}" slot="${e.slot??p}">
            <progress
                    style="width:100%;"
                    max="${i}"
                    .value="${a?r:p}"
            ></progress>
            ${n.text?l`<span class="text-secondary text-xs" id="sublbl">
    ${n.text}
  </span>`:p}
        </div>
    `},Mf=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`
        <details style="position: relative; ${t.style}" class="${t.cssClasses}" slot="${t.slot??p}">
            <summary style="list-style: none; cursor: pointer;">${R(e,s.wrapped,n,r,i,a,o)}</summary>
            <div style="position: absolute; z-index: 100; min-width: 300px; margin-top: .25rem; padding: .6rem .8rem;
                        border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 8px);
                        background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,.2));">
                ${R(e,s.content,n,r,i,a,o)}
            </div>
        </details>
    `},Nf=e=>{let t=e.metadata;return l`
        <mateu-map id="${e.id??p}"
                   position="${t.position??p}" zoom="${t.zoom??p}"
                   .markers=${t.markers??[]}
                   .markerActionId=${t.markerActionId??void 0}
                   .tileUrl=${t.tileUrl??void 0}
                   .attribution=${t.attribution??void 0}
                   style="${e.style??p}" class="${e.cssClasses??p}"
                   slot="${e.slot??p}"></mateu-map>
            `},Pf=e=>{let t=e.metadata;return l`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??p}">
            `},Ff=e=>{let t=e.metadata;return l`<div style="display:flex; align-items:center; gap:0.5rem;" slot="${e.slot??p}">
        ${t.breadcrumbs.map(e=>l`
            <a href="${V(Hc(e.link))}">${e.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </div>`},If=(e,t,n,r)=>{if(n<=0)return 0;let i=e+t;return r?(i%n+n)%n:Math.max(0,Math.min(n-1,i))},Lf=class extends _{constructor(...e){super(...e),this.dots=!1,this.nav=!1,this.loop=!1,this.auto=!1,this.duration=4e3,this.disableKeys=!1,this.selected=0,this.total=0,this.paused=!1,this.syncSlides=()=>{let e=this.slides;this.total!==e.length&&(this.total=e.length),this.selected>=e.length&&e.length>0&&(this.selected=e.length-1),e.forEach((t,n)=>{t.hidden=n!==this.selected,t.setAttribute(`aria-roledescription`,`slide`),t.setAttribute(`aria-label`,`${n+1} / ${e.length}`)})},this.onKey=e=>{this.disableKeys||(e.key===`ArrowRight`&&(this.go(1),e.preventDefault()),e.key===`ArrowLeft`&&(this.go(-1),e.preventDefault()))}}get slides(){return Array.from(this.children)}go(e){this.selected=If(this.selected,e,this.total,this.loop)}connectedCallback(){super.connectedCallback(),this.restartTimer()}disconnectedCallback(){super.disconnectedCallback(),this.stopTimer()}stopTimer(){this.timer&&clearInterval(this.timer),this.timer=void 0}restartTimer(){this.stopTimer(),this.auto&&this.isConnected&&(this.timer=setInterval(()=>{this.paused||(this.selected=If(this.selected,1,this.total,!0))},Math.max(500,this.duration||4e3)))}updated(e){(e.has(`auto`)||e.has(`duration`))&&this.restartTimer(),this.syncSlides()}render(){let e=!this.loop&&this.selected<=0,t=!this.loop&&this.selected>=this.total-1;return l`
            <div class="frame" role="region" aria-roledescription="carousel" tabindex="0"
                 @keydown="${this.onKey}"
                 @mouseenter="${()=>{this.paused=!0}}" @mouseleave="${()=>{this.paused=!1}}"
                 @focusin="${()=>{this.paused=!0}}" @focusout="${()=>{this.paused=!1}}">
                ${this.nav?l`<button type="button" class="nav prev" aria-label="${r(`previous`)}"
                        ?disabled="${e}" @click="${()=>this.go(-1)}">‹</button>`:p}
                <div class="slides" aria-live="${this.auto?`off`:`polite`}"><slot @slotchange="${this.syncSlides}"></slot></div>
                ${this.nav?l`<button type="button" class="nav next" aria-label="${r(`next`)}"
                        ?disabled="${t}" @click="${()=>this.go(1)}">›</button>`:p}
            </div>
            ${this.dots&&this.total>1?l`<div class="dots">
                ${Array.from({length:this.total},(e,t)=>l`<button type="button"
                        class="dot ${t===this.selected?`active`:``}" aria-label="${t+1} / ${this.total}"
                        aria-current="${t===this.selected?`true`:`false`}"
                        @click="${()=>{this.selected=t}}"></button>`)}
            </div>`:p}
        `}static{this.styles=h`
        :host { display: block; }
        .frame { position: relative; display: flex; align-items: center; gap: var(--lumo-space-s, .5rem); outline: none; }
        .frame:focus-visible { box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct, #1676f380); border-radius: 4px; }
        .slides { flex: 1 1 auto; min-width: 0; }
        .nav { flex: 0 0 auto; border: none; background: var(--lumo-contrast-10pct, #eee); color: inherit;
               width: 2.25rem; height: 2.25rem; border-radius: 50%; font-size: 1.4rem; line-height: 1; cursor: pointer; }
        .nav:disabled { opacity: .35; cursor: default; }
        .dots { display: flex; justify-content: center; gap: .4rem; margin-top: var(--lumo-space-s, .5rem); }
        .dot { width: .6rem; height: .6rem; padding: 0; border-radius: 50%; border: none; cursor: pointer;
               background: var(--lumo-contrast-30pct, #bbb); }
        .dot.active { background: var(--lumo-primary-color, #1676f3); }
    `}};o([n({type:Boolean})],Lf.prototype,`dots`,void 0),o([n({type:Boolean})],Lf.prototype,`nav`,void 0),o([n({type:Boolean})],Lf.prototype,`loop`,void 0),o([n({type:Boolean})],Lf.prototype,`auto`,void 0),o([n({type:Number})],Lf.prototype,`duration`,void 0),o([n({type:Boolean,attribute:`disable-keys`})],Lf.prototype,`disableKeys`,void 0),o([n({type:Number,reflect:!0})],Lf.prototype,`selected`,void 0),o([s()],Lf.prototype,`total`,void 0),Lf=o([i(`mateu-carousel`)],Lf);var Rf=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`
        <mateu-carousel
                id="${t.id}"
                ?dots="${s.dots}"
                ?nav="${s.nav}"
                ?loop="${s.loop}"
                ?auto="${s.auto}"
                ?disable-keys="${s.disableKeys}"
                .duration="${s.duration??4e3}"
                .selected="${s.selected??0}"
                style="${t.style}"
                class="${t.cssClasses}"
        >
            ${t.children?.map(t=>l`<div>${R(e,t,n,r,i,a,o)}</div>`)}
        </mateu-carousel>
    `},zf=(e,t,n,r)=>{let i=e.metadata;return l`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??p}">
            ${i.menu.map(e=>Bf(e))}
        </div>
            `},Bf=e=>l`
        ${e.submenus?l`
                <details open>
                    <summary>${e.label}</summary>
                    <div style="display:flex; flex-direction:column; gap:0.25rem; padding-left:0.5rem;">
                        ${e.submenus.map(e=>Bf(e))}
                    </div>
                </details>
            `:l`
                <a href="${V(Hc(e.path))}">${e.label}</a>
        `}
        `,Vf=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`<div
                slot="${t.slot??p}"
                style="${t.style}" class="${t.cssClasses}"
        >${s.content?P(s.content):p}${t.children?.map(t=>R(e,t,n,r,i,a,o))}</div>
    `},Hf=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.title?.includes("${")?e._evalTemplate(s.title):s.title;return l`<div
                id="${t.id??p}"
                slot="${t.slot??p}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?l`<div style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color); margin-bottom: var(--lumo-space-s);">${c}</div>`:p}
        ${t.children?.map(t=>R(e,t,n,r,i,a,o))}
    </div>
    `},Uf=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.title?.includes("${")?e._evalTemplate(s.title):s.title;return l`
        <div
                slot="${t.slot??p}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(t=>R(e,t,n,r,i,a,o))}</div>
    `},Wf=(e,t,n)=>{n.dispatchEvent(new CustomEvent(`value-changed`,{detail:{fieldId:e,value:t},bubbles:!0,composed:!0}))},Gf=e=>t=>{let n=t.target,r=n.type===`checkbox`?n.checked:n.value;Wf(e.fieldId,r,n)},Kf=(e,t)=>{let n=e.metadata,r=t?.[n.fieldId]??``,i=n,a=i.dataType,o=i.stereotype,s=!!i.readOnly,c=!!i.disabled,u=i.options,d=n.label?l`<label style="display:block; font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${n.label}</label>`:p,f=`width:100%; box-sizing:border-box; padding:.4rem .6rem; border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.3)); border-radius: var(--lumo-border-radius-m,6px); font:inherit; background: var(--lumo-base-color,#fff); color: var(--lumo-body-text-color,#1a1a1a);`,m;return m=s||o===`plainText`?l`<div style="padding:.4rem 0;">${String(r??``)}</div>`:a===`boolean`||a===`bool`||o===`checkbox`||o===`badge`?l`<input type="checkbox" ?checked="${!!r}" ?disabled="${c}" @change="${Gf(n)}">`:u&&u.length?l`
            <select style="${f}" ?disabled="${c}" @change="${Gf(n)}">
                <option value="">—</option>
                ${u.map(e=>l`<option value="${e.value}" ?selected="${e.value===r}">${e.label}</option>`)}
            </select>`:o===`textarea`||o===`richText`||o===`html`?l`<textarea style="${f}" rows="3" ?disabled="${c}" @input="${Gf(n)}">${String(r??``)}</textarea>`:l`<input type="${a===`integer`||a===`number`||a===`double`||a===`money`?`number`:a===`date`?`date`:a===`datetime`?`datetime-local`:a===`time`?`time`:o===`password`?`password`:a===`email`?`email`:`text`}" style="${f}" .value="${String(r??``)}"
                              placeholder="${i.placeholder??p}" ?disabled="${c}" @input="${Gf(n)}">`,l`
        <div id="${e.id??p}" style="${e.style}" class="${e.cssClasses}" slot="${e.slot??p}">
            ${d}
            ${m}
        </div>
    `},{I:qf}=f,Jf={HTML:1,SVG:2,MATHML:3},Yf=(e,t)=>t===void 0?e?._$litType$!==void 0:e?._$litType$===t,Xf=e=>e.strings===void 0,Zf={},Qf=(e,t=Zf)=>e._$AH=t,$f=(e,t)=>{let n=e._$AN;if(n===void 0)return!1;for(let e of n)e._$AO?.(t,!1),$f(e,t);return!0},ep=e=>{let t,n;do{if((t=e._$AM)===void 0)break;n=t._$AN,n.delete(e),e=t}while(n?.size===0)},tp=e=>{for(let t;t=e._$AM;e=t){let n=t._$AN;if(n===void 0)t._$AN=n=new Set;else if(n.has(e))break;n.add(e),ip(t)}};function np(e){this._$AN===void 0?this._$AM=e:(ep(this),this._$AM=e,tp(this))}function rp(e,t=!1,n=0){let r=this._$AH,i=this._$AN;if(i!==void 0&&i.size!==0){if(t){if(Array.isArray(r))for(let e=n;e<r.length;e++)$f(r[e],!1),ep(r[e]);else r!=null&&($f(r,!1),ep(r))}else $f(this,e)}}var ip=e=>{e.type==Ta.CHILD&&(e._$AP??=rp,e._$AQ??=np)},ap=class extends Da{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,t,n){super._$AT(e,t,n),tp(this),this.isConnected=e._$AU}_$AO(e,t=!0){e!==this.isConnected&&(this.isConnected=e,e?this.reconnected?.():this.disconnected?.()),t&&($f(this,e),ep(this))}setValue(e){if(Xf(this._$Ct))this._$Ct._$AI(e,this);else{let t=[...this._$Ct._$AH];t[this._$Ci]=e,this._$Ct._$AI(t,this,0)}}disconnected(){}reconnected(){}},op=`var(--mateu-fab-size, var(--lumo-size-l, 2.75rem))`,sp=`var(--mateu-fab-gap, var(--lumo-space-s, 0.5rem))`,cp=`var(--mateu-fab-inset-bottom, var(--mateu-fab-inset-block, var(--lumo-space-m, 1rem)))`,lp=`var(--mateu-fab-inset-end, var(--lumo-space-m, 1rem))`,up={inset:1,size:2.75,gap:.5,toc:15,tocGap:2},dp=e=>`calc(${cp} + ${e} * (${op} + ${sp}))`,fp=e=>`calc(${cp} + (var(--mateu-fab-shell-slots, 0) + ${e}) * (${op} + ${sp}))`,pp=e=>`bottom: ${dp(e)}; right: ${lp};`,mp=e=>`bottom: ${fp(e)}; right: ${lp};`,hp=e=>h`
    ${Up(e)} {
        position: fixed;
        box-sizing: border-box;
        width: ${Hp(op)};
        height: ${Hp(op)};
        padding: 0;
        border: none;
        border-radius: var(--lumo-border-radius-m, 0.25rem);
        background-color: var(--lumo-primary-color, #1676f3);
        color: var(--lumo-primary-contrast-color, #fff);
        box-shadow: var(--lumo-box-shadow-s, 0 2px 4px rgba(0, 0, 0, 0.2));
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--lumo-icon-size-m, 1.5rem);
        z-index: 900;
        transition: background-color 0.15s, bottom 0.2s ease, right 0.2s ease;
    }
    ${Up(e)}:hover {
        background-image: linear-gradient(var(--lumo-tint-10pct, rgba(255, 255, 255, 0.1)), var(--lumo-tint-10pct, rgba(255, 255, 255, 0.1)));
    }
    ${Up(e)}:active {
        background-image: linear-gradient(var(--lumo-shade-10pct, rgba(0, 0, 0, 0.1)), var(--lumo-shade-10pct, rgba(0, 0, 0, 0.1)));
    }
    ${Up(e)}:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--lumo-base-color, #fff), 0 0 0 4px var(--lumo-primary-color-50pct, rgba(22, 118, 243, 0.5));
    }
`,gp=new Map,_p=new Map,vp=new Set,yp=!1,bp=()=>parseFloat(getComputedStyle(document.documentElement).fontSize||`16`)||16,xp=()=>{let e=document.documentElement.style,t=[...gp.values()],n=t.filter(e=>e.kind===`shell`).reduce((e,t)=>Math.max(e,t.slot+1),0),r=t.filter(e=>e.kind===`page`).length;e.setProperty(`--mateu-fab-shell-slots`,String(n)),e.setProperty(`--mateu-fab-slots`,String(n+r))},Sp=()=>{yp||(yp=!0,queueMicrotask(()=>{yp=!1,xp(),vp.forEach(e=>e())}))},Cp=(e,t)=>{let n=gp.get(e);(n?.kind!==t.kind||n.slot!==t.slot)&&(gp.set(e,t),Sp())},wp=e=>{gp.delete(e)&&Sp()},Tp=Ea(class extends ap{constructor(e){if(super(e),e.type!==Ta.ELEMENT)throw Error(`onFabRail goes on the FAB element`)}render(e,t){return p}update(e,[t,n]){return this.element&&this.element!==e.element&&wp(this.element),this.element=e.element,this.entry={kind:t,slot:n??0},this.isConnected&&Cp(this.element,this.entry),p}disconnected(){this.element&&wp(this.element)}reconnected(){this.element&&this.entry&&Cp(this.element,this.entry)}}),Ep=(e,t)=>(_p.set(e,t),t(Dp,Op),Sp(),()=>{_p.delete(e)&&Sp()}),Dp=`column`,Op,kp=(e,t)=>{Dp=e,Op=t,_p.forEach(n=>n(e,t))},Ap=e=>{let{mode:t,viewportWidth:n,contentEnd:r,hasFabs:i,hasToc:a,rem:o}=e,s=up.inset*o,c=(up.size+up.gap)*o;if(t===`edge`)return{channel:0,toc:`bar`,insetEnd:0,insetBottom:0};if(n<600)return{channel:0,toc:`bar`,insetEnd:s};let l=a&&n>=1200,u=Math.max(i?s+c:0,l?s+(up.toc+up.tocGap)*o:0),d=l?`aside`:`bar`;if(t===`full`)return{channel:u,toc:d,insetEnd:s,padEnd:u>0?Math.max(24,Math.round(u-(n-r))):void 0};let f=u>0?Math.max(0,Math.round(u-(n-(e.containerEnd??r)))):void 0,p=Math.max(c,u-s);return{channel:u,toc:d,insetEnd:Math.max(s,Math.round(n-r-p)),squeeze:f}},jp=new Map,Mp=0,H,Np,Pp=(e,t)=>{let n=t;for(;n;)if(n=n.parentNode??n.host??null,n===e)return!0;return!1},Fp=()=>{let e=[...jp.values()].filter(e=>e.element.isConnected);return e.filter(t=>!e.some(e=>e!==t&&Pp(e.element,t.element))).sort((e,t)=>t.order-e.order)[0]?.element},Ip=e=>{e.removeAttribute(`data-aside`),e.style.removeProperty(`--mateu-aside-squeeze`),e.style.removeProperty(`--mateu-aside-pad-end`)},Lp=()=>{let e=document.documentElement,t=Fp();if(H&&H!==t&&(Np?.unobserve(H),Ip(H)),t&&t!==H&&Np?.observe(t),H=t,!H){e.style.removeProperty(`--mateu-fab-inset-end`),e.style.removeProperty(`--mateu-fab-inset-bottom`),xp(),kp(`column`);return}let n=jp.get(H),r=bp(),i=e.clientWidth||window.innerWidth,a=H.getBoundingClientRect().right,o=Ap({mode:n.mode,viewportWidth:i,contentEnd:a,containerEnd:a+(parseFloat(getComputedStyle(H).marginRight)||0),hasFabs:gp.size>0,hasToc:_p.size>0,rem:r});o.channel>0?(H.setAttribute(`data-aside`,``),H.style.setProperty(`--mateu-aside-squeeze`,`${o.squeeze??0}px`),o.padEnd===void 0?H.style.removeProperty(`--mateu-aside-pad-end`):H.style.setProperty(`--mateu-aside-pad-end`,`${o.padEnd}px`)):Ip(H),e.style.setProperty(`--mateu-fab-inset-end`,`${o.insetEnd}px`),xp(),o.insetBottom===void 0?e.style.removeProperty(`--mateu-fab-inset-bottom`):e.style.setProperty(`--mateu-fab-inset-bottom`,`${o.insetBottom}px`),kp(o.toc,a-(parseFloat(getComputedStyle(H).paddingRight)||0))},Rp=!1,zp=()=>{Rp||(Rp=!0,Np=typeof ResizeObserver<`u`?new ResizeObserver(()=>Lp()):void 0,window.addEventListener(`resize`,Lp),vp.add(Lp))},Bp=()=>{Rp&&(Rp=!1,Np?.disconnect(),Np=void 0,window.removeEventListener(`resize`,Lp),vp.delete(Lp))},Vp=(e,t)=>(jp.set(e,{element:e,mode:t,order:++Mp}),zp(),Lp(),()=>{jp.get(e)?.element===e&&(jp.delete(e),Ip(e),Lp(),jp.size===0&&Bp())}),Hp=e=>d(e),Up=e=>d(e),Wp=e=>{let t=e.metadata;if((t?.level??0)>0)return e;let n=e=>{if(e?.metadata?.type===w.EntityHeader)return e;let t=e?.metadata?.content,r=[...e?.children??[],...Array.isArray(t)?t:t?[t]:[]];for(let e of r){let t=n(e);if(t)return t}},r;for(let t of e.children??[])if(r=n(t),r)break;if(!r)return e;let i=r.metadata;r.__hoistedToPageHeader=!0;let a=[...(i.facts??[]).filter(e=>e.label||e.value).map(e=>({title:e.label??``,text:e.value??``})),...i.metricLabel?[{title:i.metricLabel,text:i.metricValue??``}]:[]],o=(i.badges??[]).filter(e=>e.label).map(e=>({text:e.label,color:e.color})),s={...t,title:i.title||t.title,subtitle:i.subtitle??t.subtitle,kpis:[...t.kpis??[],...a],kpisBelow:!0,badges:[...t.badges??[],...o]};return{...e,metadata:s}},Gp=e=>`width: 100%; box-sizing: border-box; ${e??``}`,Kp=(e,t,n,r,i,a,o,s)=>{let c=Wp(t),u=c.metadata,d=u?.fabs??[];return l`<mateu-page
            .component="${c}"
            baseUrl="${n}"
            .state="${r}"
            .data="${i}"
            .appState="${a}"
            .appdata="${o}"
            slot="${c.slot??p}"
            style="${Gp(c.style)}"
            class="${c.cssClasses}"
            ?standalone="${s??!1}"
    >
        ${c.children?.map(t=>R(e,t,n,r,i,a,o))}
        ${u?.buttons?.map(t=>l`
                   ${R(e,{id:Pa(t),metadata:t,type:C.ClientSide,slot:`buttons`},void 0,r,i,a,o)}
`)}
        ${d.map((t,n)=>l`
            <button class="page-fab" style="${mp(n)}" ${Tp(`page`,n)} aria-label="${t.label}"
                @click="${()=>e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))}"
                title="${t.label}">
                ${B(t.icon)}
            </button>
        `)}
</mateu-page>
    `},qp=(e,t,n,r,i,a,o,s)=>l`<mateu-table-crud
            id="${t.id}"
            baseUrl="${n}"
            .component="${t}"
            .metadata="${t.metadata}"
            .state="${r}"
            .data="${i}"
            .appState="${a}"
            .appdata="${o}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??p}"
            ?standalone="${s??!1}"
    >
        ${t.children?.map(t=>R(e,t,n,r,i,a,o))}
    </mateu-table-crud>`,Jp=e=>{let t=e.metadata;return l`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??p}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},Yp=(e,t,n)=>{let r=e.metadata;return l`<mateu-chat sseUrl="${r.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??p}"></mateu-chat>`},Xp=e=>{let t=e.metadata;return l`
        <mateu-workflow
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
                value="${t.value??`{"name":"New Workflow","steps":[]}`}"
        ></mateu-workflow>
    `},Zp=e=>{let t=e.metadata;return l`
        <mateu-form-editor
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
                value="${t.value??`{"name":"New Form","fields":[]}`}"
        ></mateu-form-editor>
    `},Qp=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,$p=e=>e==`up`?`var(--lumo-success-text-color, #1a7f37)`:e==`down`?`var(--lumo-error-text-color, #c5221f)`:`var(--lumo-secondary-text-color, #666)`,em=e=>e==`up`?`▲`:e==`down`?`▼`:``,tm=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},nm=e=>{let t=e.metadata,n=!!t.actionId;return l`
        <div class="mateu-metric-card ${e.cssClasses??``}"
             style="${Qp} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${n?`cursor: pointer;`:``} ${e.style??``}"
             slot="${e.slot??p}"
             role="${n?`button`:p}"
             @click="${e=>tm(e,t)}"
        >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${t.title}</span>
                ${t.icon?B(t.icon,`color: var(--lumo-tertiary-text-color, #999); width: 1.1em; height: 1.1em;`):p}
            </div>
            <div style="display: flex; align-items: baseline; gap: .35rem;">
                <span style="font-size: var(--lumo-font-size-xxxl, 2rem); font-weight: 600; line-height: 1.1;">${t.value}</span>
                ${t.unit?l`<span style="font-size: var(--lumo-font-size-m, 1rem); color: var(--lumo-secondary-text-color, #666);">${t.unit}</span>`:p}
            </div>
            ${t.trend||t.trendLabel?l`
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${$p(t.trend)};">
                    ${em(t.trend)} ${t.trendLabel??p}
                </span>
            `:p}
            ${t.description?l`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-secondary-text-color, #5f6b7a);">${t.description}</span>`:p}
        </div>
    `},rm=(e,t,n,r,i,a,o)=>l`
        <div class="mateu-scoreboard ${t.cssClasses??``}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??``}"
             slot="${t.slot??p}"
        >
            ${t.children?.map(t=>R(e,t,n,r,i,a,o))}
        </div>
    `,im=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.colSpan&&s.colSpan>1?`grid-column: span ${s.colSpan};`:``,u=s.rowSpan&&s.rowSpan>1?`grid-row: span ${s.rowSpan};`:``,d=t.children??[];return d.length===1&&d[0].metadata?.type===`MetricCard`?l`
            <div style="min-width: 0; ${c} ${u} ${t.style??``}" slot="${t.slot??p}">
                ${R(e,d[0],n,r,i,a,o)}
            </div>`:l`
        <div class="mateu-dashboard-panel ${t.cssClasses??``}"
             style="${Qp} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${u} ${t.style??``}"
             slot="${t.slot??p}"
        >
            ${s.title?l`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${s.title}</h3>
                    ${s.subtitle?l`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${s.subtitle}</span>`:p}
                </div>
            `:p}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(t=>R(e,t,n,r,i,a,o))}
            </div>
        </div>
    `},am=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.columns&&s.columns>0?`repeat(${s.columns}, minmax(0, 1fr))`:`repeat(auto-fit, minmax(20rem, 1fr))`;return l`
        <div class="mateu-dashboard ${t.cssClasses??``}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??``}"
             slot="${t.slot??p}"
        >
            ${t.children?.map(t=>R(e,t,n,r,i,a,o))}
        </div>
    `},om=class extends _{constructor(...e){super(...e),this.panels=[],this.headerTitle=``,this.badges=[],this.orientation=`vertical`,this.navigation=null,this.overviewEditActionId=``,this.openPanels=new Set,this.expandedPanel=null,this._onPopState=()=>{let e=decodeURIComponent((location.hash||``).replace(/^#/,``));if(e.startsWith(`expand=`)){let t=e.slice(7),n=this.panels.findIndex((e,n)=>this.panelAnchor(e,n)===t);this.expandedPanel=n>=0?n:null}else this.expandedPanel=null},this.initialized=!1}navAction(e){e&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),window.addEventListener(`popstate`,this._onPopState)}disconnectedCallback(){window.removeEventListener(`popstate`,this._onPopState),super.disconnectedCallback()}willUpdate(){if(!this.initialized&&this.panels.length){this.openPanels=new Set(this.panels.map((e,t)=>e.open?t:-1).filter(e=>e>=0));let e=decodeURIComponent((location.hash||``).replace(/^#/,``));if(e.startsWith(`expand=`)){let t=e.slice(7),n=this.panels.findIndex((e,n)=>this.panelAnchor(e,n)===t);n>=0&&(this.expandedPanel=n)}else if(e){let t=this.panels.findIndex((t,n)=>this.panelAnchor(t,n)===e);t>=0&&this.openPanels.add(t)}this.initialized=!0}}firstUpdated(){let e=decodeURIComponent((location.hash||``).replace(/^#/,``));if(!e)return;let t=this.renderRoot.querySelector(`[data-anchor="${CSS.escape(e)}"]`);t&&t.scrollIntoView({block:`nearest`})}panelAnchor(e,t){return(e.title??``).toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)||`panel-${t}`}bookmarkPanel(e){let t=this.panelAnchor(this.panels[e],e);try{history.replaceState(history.state,``,`#`+t)}catch{}}clearBookmark(e){let t=this.panelAnchor(this.panels[e],e);if(decodeURIComponent((location.hash||``).replace(/^#/,``))===t)try{history.replaceState(history.state,``,location.pathname+location.search)}catch{}}expandPanel(e,t){t?.stopPropagation(),this.expandedPanel=e;let n=this.panelAnchor(this.panels[e],e);try{history.pushState(history.state,``,`#expand=`+n)}catch{}}collapsePanel(){try{history.back()}catch{this.expandedPanel=null}}toggle(e){let t=new Set(this.openPanels);t.has(e)?(t.delete(e),this.clearBookmark(e)):(t.add(e),this.bookmarkPanel(e)),this.openPanels=t}static{this.styles=h`
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
           --mateu-foldout-* custom properties. */
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
        .strip-summary {
            writing-mode: vertical-rl;
            font-size: var(--lumo-font-size-xs, .75rem);
            font-weight: 600;
            color: var(--lumo-body-text-color, #1f2937);
            max-height: 50%;
            overflow: hidden;
        }
        .strip-summary ::slotted(*) { margin: 0; }
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
           system opts in by setting --mateu-foldout-expand-display. */
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
    `}render(){if(this.expandedPanel!=null&&this.panels[this.expandedPanel]){let e=this.panels[this.expandedPanel];return l`
                <div class="expanded-view" part="expanded-view">
                    <div class="expanded-header">
                        <button class="nav-parent" title="${r(`back`)}"
                                @click="${()=>this.collapsePanel()}">
                            <span>‹</span><span>${r(`back`)}</span>
                        </button>
                        <span class="nav-title">${e.title}</span>
                        ${e.subtitle?l`<span class="subtitle">${e.subtitle}</span>`:p}
                    </div>
                    <div class="expanded-body">
                        <slot name="panel-${this.expandedPanel}"></slot>
                    </div>
                </div>
            `}let e=this.navigation;return l`
            ${e?l`
                <div class="nav-header" part="nav-header">
                    ${e.parentActionId?l`
                        <button class="nav-parent" title="${e.parentLabel??r(`back`)}"
                                @click="${()=>this.navAction(e.parentActionId)}">
                            <span>‹</span><span>${e.parentLabel??r(`back`)}</span>
                        </button>
                    `:p}
                    ${e.title?l`<span class="nav-title">${e.title}</span>`:p}
                    <span class="nav-spacer"></span>
                    ${e.previousActionId?l`
                        <button class="nav-move" title="${r(`previous`)}" aria-label="${r(`previous`)}"
                                @click="${()=>this.navAction(e.previousActionId)}">‹</button>
                    `:p}
                    ${e.nextActionId?l`
                        <button class="nav-move" title="${r(`next`)}" aria-label="${r(`next`)}"
                                @click="${()=>this.navAction(e.nextActionId)}">›</button>
                    `:p}
                </div>
            `:p}
            ${this.headerTitle?l`
                <div class="header-band" part="header-band">
                    <div class="header-content">
                        <h2 class="header-title">${this.headerTitle}</h2>
                        ${this.badges.length?l`
                            <div class="header-badges">
                                ${this.badges.map(e=>l`<span class="header-badge">${e}</span>`)}
                            </div>
                        `:``}
                    </div>
                    <div class="header-accent" part="header-accent"></div>
                </div>
            `:``}
            <div class="columns" part="columns">
                <div class="overview" part="overview">
                    ${this.overviewEditActionId?l`
                        <button class="overview-edit" title="${r(`edit`)}"
                                @click="${()=>this.navAction(this.overviewEditActionId)}">
                            <span>✎</span><span>${r(`edit`)}</span>
                        </button>
                    `:p}
                    <slot name="overview"></slot>
                </div>
                <div class="rail" part="rail">
                    ${this.panels.map((e,t)=>this.openPanels.has(t)?l`
                        <div class="panel" part="panel" data-anchor="${this.panelAnchor(e,t)}" data-node-id="${e.id??p}"
                             style="${e.width?`flex-basis: ${e.width}; min-width: min(${e.width}, 100%);`:p}"
                             @click="${()=>this.bookmarkPanel(t)}">
                            <div class="panel-header">
                                <div>
                                    <h3>${e.title}</h3>
                                    ${e.subtitle?l`<div class="subtitle">${e.subtitle}</div>`:``}
                                </div>
                                <span class="panel-actions">
                                    <button class="panel-expand" title="${r(`showAll`)}" aria-label="${r(`showAll`)}"
                                            @click="${e=>this.expandPanel(t,e)}">⤢</button>
                                    <button class="fold" title="${r(`fold`)}" aria-label="${r(`fold`)}" @click="${e=>{e.stopPropagation(),this.toggle(t)}}">⟨</button>
                                </span>
                            </div>
                            <div style="flex: 1; min-height: 0;">
                                <slot name="panel-${t}"></slot>
                            </div>
                        </div>
                    `:l`
                        <div class="strip" role="button" title="${e.title}" data-node-id="${e.id??p}"
                             data-anchor="${this.panelAnchor(e,t)}" @click="${()=>this.toggle(t)}">
                            <button class="fold" tabindex="-1">⟩</button>
                            <span>${e.title}</span>
                            <!-- the folded panel's digest (FoldoutPanel.summary, the Redwood foldout-panel
                                 summary slot): what tells the user whether it is worth opening -->
                            <div class="strip-summary"><slot name="summary-${t}"></slot></div>
                        </div>
                    `)}
                </div>
            </div>
        `}};o([n({type:Array})],om.prototype,`panels`,void 0),o([n({type:String})],om.prototype,`headerTitle`,void 0),o([n({type:Array})],om.prototype,`badges`,void 0),o([n({type:String,reflect:!0})],om.prototype,`orientation`,void 0),o([n({attribute:!1})],om.prototype,`navigation`,void 0),o([n({type:String})],om.prototype,`overviewEditActionId`,void 0),o([s()],om.prototype,`openPanels`,void 0),o([s()],om.prototype,`expandedPanel`,void 0),om=o([i(`mateu-foldout`)],om);var sm=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`
        <mateu-foldout
                .panels="${s.panels??[]}"
                .headerTitle="${s.headerTitle??``}"
                .badges="${s.badges??[]}"
                .navigation="${s.navigation??null}"
                overviewEditActionId="${s.overviewEditActionId??``}"
                orientation="${s.orientation??`vertical`}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??p}"
        >
            ${t.children?.map(t=>R(e,t,n,r,i,a,o))}
        </mateu-foldout>
    `},cm=`mateu-tile-order`,lm=()=>{try{let e=JSON.parse(localStorage.getItem(cm)??`{}`);return e&&typeof e==`object`&&!Array.isArray(e)?e:{}}catch{return{}}},um=(e,t)=>e?.id?String(e.id):`#`+t,dm=e=>{let t=lm()[e];return Array.isArray(t)?t.filter(e=>typeof e==`string`):null},fm=(e,t)=>{try{let n=lm();n[e]=t,localStorage.setItem(cm,JSON.stringify(n))}catch{}},pm=(e,t)=>{if(!t||!t.length)return e.map((e,t)=>t);let n=t.map(t=>e.indexOf(t)).filter(e=>e>=0),r=new Set(n);return[...n,...e.map((e,t)=>t).filter(e=>!r.has(e))]},mm=(e,t,n)=>{let r=e.indexOf(t),i=e.indexOf(n);if(r<0||i<0||r===i)return e;let a=e.filter(e=>e!==t);return a.splice(i,0,t),a},hm=(e,t)=>{if(e?.type===`Scoreboard`)return`grid-column: 1 / -1;`;let n=e?.type===`DashboardPanel`?e.colSpan:t,r=e?.type===`DashboardPanel`?e.rowSpan:void 0;return(n&&n>1?`grid-column: span ${n};`:``)+(r&&r>1?` grid-row: span ${r};`:``)},gm=(e,t,n)=>{let r=e.indexOf(t),i=r+n;return r<0||i<0||i>=e.length?e:mm(e,t,e[i])},_m=`application/x-mateu-tile`,vm=(e,t,n,i)=>{let a=t.children??[],o=(typeof location<`u`?location.pathname:``)+`#`+(t.id??`grid`),s=a.map((e,t)=>um(e,t)),c=pm(s,dm(o)),u=c.map(e=>s[e]),d=t=>{t!==u&&(fm(o,t),e.requestUpdate())};return c.map(e=>{let t=s[e],c=a[e].metadata;return l`<div class="mateu-tile" draggable="true" tabindex="0" data-tile-key="${t}"
                         aria-roledescription="draggable tile"
                         title="${r(`dragToRearrange`)}"
                         style="min-width: 0; cursor: grab; ${hm(c,i[e])}"
                         @dragstart=${e=>{e.dataTransfer?.setData(_m,o+`
`+t),e.dataTransfer&&(e.dataTransfer.effectAllowed=`move`)}}
                         @dragover=${e=>{e.dataTransfer?.types.includes(_m)&&e.preventDefault()}}
                         @drop=${e=>{let[n,r]=(e.dataTransfer?.getData(_m)??``).split(`
`);n!==o||!r||(e.preventDefault(),d(mm(u,r,t)))}}
                         @keydown=${e=>{if(!e.altKey||e.key!==`ArrowLeft`&&e.key!==`ArrowRight`||e.target!==e.currentTarget)return;e.preventDefault(),d(gm(u,t,e.key===`ArrowLeft`?-1:1));let n=e.currentTarget;requestAnimationFrame(()=>(n.parentElement?.querySelector(`[data-tile-key="${CSS.escape(t)}"]`))?.focus())}}
        >${n(e)}</div>`})},ym=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.gridTemplateAreas,u=s.gridTemplateColumns&&s.gridTemplateColumns.trim().length?s.gridTemplateColumns:c&&c.trim().length?null:`repeat(auto-fit, minmax(min(100%, 16rem), 1fr))`,d=s.gap??`var(--lumo-space-m, 1rem)`,f=s.colSpans??[],m=s.stickyAreas??[],h=`display: grid;${u?` grid-template-columns: ${u};`:``} gap: ${d}; align-items: start;${c&&c.trim().length?` grid-template-areas: ${c};`:``} ${t.style??``}`,g=s.reorderable&&!(c&&c.trim().length)?vm(e,t,s=>R(e,t.children[s],n,r,i,a,o),f):t.children?.map((t,s)=>{let u=R(e,t,n,r,i,a,o);if(c&&t.slot){let e=m.includes(t.slot)?` position: sticky; top: 1rem; align-self: start; height: fit-content;`:``;return l`<div style="grid-area: ${t.slot}; min-width: 0;${e}">${u}</div>`}return pd(f[s],u)});if(!s.stackBelow)return l`
            <div class="mateu-responsive-grid ${t.cssClasses??``}"
                 style="${h}"
                 slot="${t.slot??p}"
            >${g}</div>
        `;let _=t.id??`mateu-grid`;return l`
        <div style="container-type: inline-size;" slot="${t.slot??p}">
            <style>
                @container (max-width: ${s.stackBelow}) {
                    .mateu-responsive-grid[data-grid-id="${_}"] {
                        grid-template-columns: 1fr !important;
                        /* a named-slot template names N columns per row; on one track that would be a
                           mismatch (and void the areas) — drop the areas so the slots stack in order. */
                        grid-template-areas: none !important;
                    }
                }
            </style>
            <div class="mateu-responsive-grid ${t.cssClasses??``}"
                 data-grid-id="${_}"
                 style="${h}"
            >${g}</div>
        </div>
    `},bm=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.children??[],u=e=>c.filter(t=>(t.slot??``).startsWith(e)),d=u(`main-`),f=u(`aside-`),m=u(`footer-`),h=s.asideWidth&&s.asideWidth.trim()?s.asideWidth:`32%`,g=s.asidePosition===`start`,_=s.asideSticky!==!1,v=t=>t.map(t=>R(e,t,n,r,i,a,o)),ee=l`
        <div class="mateu-content-main"
             style="flex: 1 1 0; min-width: min(20rem, 100%); box-sizing: border-box;">
            ${v(d)}
        </div>`,te=f.length?l`
        <div class="mateu-content-aside"
             style="flex: 0 1 calc(${h} - var(--lumo-space-m, 1rem)); min-width: min(18rem, 100%); box-sizing: border-box; ${_?`position: sticky; top: 1rem; align-self: flex-start;`:``}">
            ${v(f)}
        </div>`:p;return l`
        <div class="mateu-content-layout ${t.cssClasses??``}"
             style="${t.style??``}"
             slot="${t.slot??p}">
            <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); align-items: flex-start;">
                ${g?[te,ee]:[ee,te]}
            </div>
            ${m.length?l`
                <div class="mateu-content-footer"
                     style="flex-basis: 100%; margin-top: var(--lumo-space-m, 1rem);">
                    ${v(m)}
                </div>`:p}
        </div>
    `},xm={ocean:`#1f4e79`,pine:`#2d5a3d`,lilac:`#5b4a7a`,teal:`#1f5c5c`,rose:`#7a3b4f`,pebble:`#5a5550`,slate:`#3d4a57`,plum:`#5e3557`,sienna:`#7a4a2e`},Sm=`--lumo-primary-text-color: var(--mateu-hero-ink, #fff); --lumo-body-text-color: var(--mateu-hero-ink, #fff); --lumo-secondary-text-color: var(--mateu-hero-ink-secondary, rgba(255, 255, 255, .88)); --lumo-contrast-5pct: rgba(255, 255, 255, .12); --lumo-contrast-10pct: rgba(255, 255, 255, .18);`,Cm=e=>(e&&xm[e])??`var(--mateu-hero-background, color-mix(in srgb, var(--mateu-accent, #1f6f8f) 78%, #0b1a24))`,wm=e=>e&&/^[\w\s/.:%~?&=#+,@-]+$/.test(e.trim())?`url("${e.trim()}")`:void 0,Tm=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=wm(s.image),u=!c&&s.centered!==!1,d=u?`center`:`flex-start`,f=u?`center`:`start`;return l`
        <div class="mateu-hero ${t.cssClasses??``}" data-tone="${s.tone??p}"
             style="position: relative; display: flex; flex-direction: column; overflow: hidden; border-radius: var(--lumo-border-radius-l, 12px); margin-top: var(--mateu-hero-margin-top, var(--lumo-space-l, 1.5rem)); min-height: ${s.height??`12rem`}; box-sizing: border-box; background: ${Cm(s.tone)}; color: var(--mateu-hero-ink, #fff); ${Sm} ${t.style??``}"
             slot="${t.slot??p}"
        >
            ${c?l`<div class="mateu-hero-image" aria-hidden="true"
                 style="position: absolute; inset: 0 0 0 auto; width: min(55%, 40rem); background-image: ${c}; background-repeat: no-repeat; background-position: right center; background-size: auto 150%; pointer-events: none;"></div>`:p}
            <div class="mateu-hero-text"
                 style="position: relative; flex: 1; display: flex; flex-direction: column; align-items: ${d}; justify-content: center; gap: var(--lumo-space-s, .5rem); text-align: ${f}; padding: var(--lumo-space-xl, 2.5rem); ${c?`max-width: min(60%, 42rem);`:``} box-sizing: border-box;">
                ${s.title?l`<h1 style="margin: 0; font-family: var(--lumo-font-family); font-size: var(--lumo-font-size-xxxl, 2.5rem); font-weight: 600; line-height: 1.15; letter-spacing: -0.01em; color: inherit;">${s.title}</h1>`:p}
                ${s.subtitle?l`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); color: var(--lumo-secondary-text-color); max-width: 40rem;">${s.subtitle}</p>`:p}
                ${t.children?.length?l`
                    <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${d}; width: 100%; max-width: 40rem; margin-top: var(--lumo-space-s, .5rem);">
                        ${t.children?.map(t=>R(e,t,n,r,i,a,o))}
                    </div>
                `:p}
            </div>
            <div class="mateu-hero-strip" aria-hidden="true"
                 style="position: relative; flex-shrink: 0; height: var(--mateu-page-band-h, 0px); background-image: var(--mateu-page-band-image, none); background-repeat: repeat-x; background-size: auto 100%;"></div>
        </div>
    `},U=e=>t=>{if(t.key===`Enter`){e(t);return}(t.key===` `||t.key===`Spacebar`)&&(t.preventDefault(),e(t))},Em=864e5,Dm=class extends _{constructor(...e){super(...e),this.tasks=[],this.onTaskSelectionActionId=``}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}static{this.styles=h`
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
    
        ${z}
    `}range(){let e=this.tasks.flatMap(e=>[e.start,e.end]).filter(e=>!!e).map(e=>new Date(e+`T00:00:00`).getTime());return e.length?{min:Math.min(...e)-Em,max:Math.max(...e)+2*Em}:null}months(e,t){let n=[],r=new Date(e);for(r.setDate(1);r.getTime()<=t;){let i=Math.max(r.getTime(),e),a=new Date(r.getFullYear(),r.getMonth()+1,1),o=Math.min(a.getTime(),t);n.push({label:r.toLocaleDateString(void 0,{month:`short`,year:`2-digit`}),from:i,to:o}),r.setMonth(r.getMonth()+1)}return n}render(){let e=this.range();if(!e)return l``;let t=e.max-e.min,n=n=>(n-e.min)/t*100,i=Date.now();return l`
            <div class="frame">
                <div class="head">${r(`task`)}</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(e=>l`
                        <div class="month" style="width: ${(e.to-e.from)/t*100}%;">${e.label}</div>
                    `)}
                </div>
                ${this.tasks.map(r=>{let a=new Date(r.start+`T00:00:00`).getTime(),o=new Date(r.end+`T00:00:00`).getTime()+Em;return l`
                        <div class="label" title="${r.title}">${r.title}</div>
                        <div class="lane">
                            ${i>=e.min&&i<=e.max?l`<div class="today" style="left: ${n(i)}%;"></div>`:p}
                            <div role="button" tabindex="0"
                                 aria-label="${r.title}, ${r.start} to ${r.end}${r.progress?`, ${r.progress}% complete`:``}"
                                 class="bar ${this.onTaskSelectionActionId?`clickable`:``}"
                                 title="${r.title} · ${r.start} → ${r.end}${r.progress?` · ${r.progress}%`:``}"
                                 @click="${()=>this.selectTask(r)}" @keydown="${U(()=>this.selectTask(r))}"
                                 style="left: ${n(a)}%; width: ${(o-a)/t*100}%; ${r.color?`--mateu-gantt-fill: ${r.color};`:``}">
                                <div class="fill" style="width: ${r.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};o([n({type:Array})],Dm.prototype,`tasks`,void 0),o([n()],Dm.prototype,`onTaskSelectionActionId`,void 0),Dm=o([i(`mateu-gantt`)],Dm);var Om=e=>{let t=e.metadata;return l`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                .onTaskSelectionActionId="${t.onTaskSelectionActionId??``}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-gantt>
    `},km=`#1a1a1a`,Am=`#fff`,jm=e=>{let t=e.trim().toLowerCase(),n=t.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);if(n){let e=n[1].length===3?n[1].split(``).map(e=>e+e).join(``):n[1];return[0,2,4].map(t=>parseInt(e.slice(t,t+2),16))}let r=t.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);return r?[+r[1],+r[2],+r[3]]:void 0},Mm=([e,t,n])=>{let r=e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4};return .2126*r(e)+.7152*r(t)+.0722*r(n)},Nm=(e,t)=>{let n=jm(e),r=jm(t);if(!n||!r)return;let[i,a]=[Mm(n),Mm(r)].sort((e,t)=>t-e);return(i+.05)/(a+.05)},Pm=e=>{if(!(!e||!jm(e)))return(Nm(e,Am)??0)>=(Nm(e,km)??0)?Am:km},W,Fm=(e,t)=>({startIdx:Math.min(e,t),endIdx:Math.max(e,t)}),Im=(e,t,n,r)=>e===`start`?{startIdx:Math.min(r,n),endIdx:n}:{startIdx:t,endIdx:Math.max(r,t)},G=class extends _{static{W=this}constructor(...e){super(...e),this.resources=[],this.blocks=[],this.attributeColumns=[],this.resize=null,this.range=null,this.drag=null,this.dragStartX=0,this.dragStartY=0,this.laneRects=[],this.onDragKeydown=e=>{e.key===`Escape`&&(this.drag||this.resize||this.range)&&(e.stopPropagation(),this.endDrag())}}static{this.styles=h`
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
            color: var(--lumo-secondary-text-color, #5f6b7a);
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
            color: var(--mateu-planning-block-ink, var(--lumo-primary-contrast-color, #fff));
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
        .label { display: flex; align-items: center; gap: .5rem; }
        .label .res-name { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; display: inline-flex; align-items: center; gap: .3rem; }
        .label .attr, .corner .attr {
            flex: 0 0 4rem; overflow: hidden; text-overflow: ellipsis; color: var(--lumo-secondary-text-color, #666);
            font-size: .85em;
        }
        .corner { display: flex; align-items: center; gap: .5rem; }
        .corner .res-name { flex: 1 1 auto; }
        .block vaadin-icon, .label vaadin-icon { width: .9rem; height: .9rem; vertical-align: -2px; margin-right: .2rem; }
        .handle {
            position: absolute; top: 0; bottom: 0; width: 6px; cursor: ew-resize; z-index: 1;
        }
        .handle.start { left: 0; }
        .handle.end { right: 0; }
        .handle:hover { background: rgba(255,255,255,.35); }
        .cells.selectable { cursor: crosshair; }
        .range {
            position: absolute; top: 15%; bottom: 15%;
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));
            border: 1px solid var(--lumo-primary-color-50pct, rgba(26,115,232,.5));
            border-radius: .35rem; pointer-events: none; z-index: 1;
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
    `}static parse(e){return new Date(e+`T00:00:00`)}static iso(e){let t=e=>String(e).padStart(2,`0`);return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}static addDays(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}static daysBetween(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}window(){if(this.from&&this.to){let e=W.parse(this.from),t=W.daysBetween(e,W.parse(this.to))+1;return t>0?{from:e,days:t}:null}let e=this.blocks.flatMap(e=>[e.start,e.end]).filter(e=>!!e).map(e=>W.parse(e));if(!e.length)return null;let t=new Date(Math.min(...e.map(e=>e.getTime()))),n=new Date(Math.max(...e.map(e=>e.getTime())));return{from:t,days:W.daysBetween(t,n)+1}}onBlockPointerDown(e,t,n){if(!this.moveActionId&&!this.selectActionId||(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.dragStartX=e.clientX,this.dragStartY=e.clientY,!this.window()))return;let r=W.parse(t.start),i=W.parse(t.end),a=Math.max(1,W.daysBetween(r,i)+1);this.laneRects=[...this.renderRoot.querySelectorAll(`.lane[data-resource-id]`)].map(e=>({resourceId:e.dataset.resourceId,rect:e.getBoundingClientRect()}));let o=this.dayAt(t.resourceId,e.clientX)??n;this.drag={blockId:t.id,duration:a,grabOffsetDays:o-n,originResourceId:t.resourceId,originStartIdx:n,targetResourceId:t.resourceId,targetStartIdx:n,moved:!1},window.addEventListener(`keydown`,this.onDragKeydown)}dayAt(e,t){let n=this.laneRects.find(t=>t.resourceId===e),r=this.window();if(!n||!r||n.rect.width===0)return null;let i=Math.floor((t-n.rect.left)/n.rect.width*r.days);return Math.max(0,Math.min(r.days-1,i))}onBlockPointerMove(e){if(!this.drag||!this.drag.moved&&Math.abs(e.clientX-this.dragStartX)<4&&Math.abs(e.clientY-this.dragStartY)<4||!this.moveActionId)return;let t=this.window();if(!t)return;let n=this.laneRects.find(t=>e.clientY>=t.rect.top&&e.clientY<=t.rect.bottom)??this.laneRects.find(e=>e.resourceId===this.drag.targetResourceId);if(!n)return;let r=this.dayAt(n.resourceId,e.clientX);if(r==null)return;let i=Math.max(0,Math.min(t.days-this.drag.duration,r-this.drag.grabOffsetDays));this.drag={...this.drag,moved:!0,targetResourceId:n.resourceId,targetStartIdx:i}}onBlockPointerUp(e){let t=this.drag;if(this.endDrag(),!t)return;if(!t.moved){this.selectActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.selectActionId,parameters:{_blockId:e.id}},bubbles:!0,composed:!0}));return}if(!this.moveActionId||t.targetResourceId===t.originResourceId&&t.targetStartIdx===t.originStartIdx)return;let n=this.window();if(!n)return;let r=W.addDays(n.from,t.targetStartIdx),i=W.addDays(r,t.duration-1);this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.moveActionId,parameters:{_blockId:t.blockId,_resourceId:t.targetResourceId,_start:W.iso(r),_end:W.iso(i)}},bubbles:!0,composed:!0}))}emit(e,t){this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}measureLanes(){this.laneRects=[...this.renderRoot.querySelectorAll(`.lane[data-resource-id]`)].map(e=>({resourceId:e.dataset.resourceId,rect:e.getBoundingClientRect()}))}onHandlePointerDown(e,t,n,r,i){this.resizeActionId&&(e.preventDefault(),e.stopPropagation(),e.currentTarget.setPointerCapture(e.pointerId),this.measureLanes(),this.resize={blockId:t.id,resourceId:t.resourceId,edge:n,startIdx:r,endIdx:i,originStartIdx:r,originEndIdx:i},window.addEventListener(`keydown`,this.onDragKeydown))}onHandlePointerMove(e){if(!this.resize)return;e.stopPropagation();let t=this.dayAt(this.resize.resourceId,e.clientX);t!=null&&(this.resize={...this.resize,...Im(this.resize.edge,this.resize.originStartIdx,this.resize.originEndIdx,t)})}onHandlePointerUp(e){e.stopPropagation();let t=this.resize;this.endDrag();let n=this.window();!t||!n||!this.resizeActionId||(t.startIdx!==t.originStartIdx||t.endIdx!==t.originEndIdx)&&this.emit(this.resizeActionId,{_blockId:t.blockId,_resourceId:t.resourceId,_start:W.iso(W.addDays(n.from,t.startIdx)),_end:W.iso(W.addDays(n.from,t.endIdx))})}onCellsPointerDown(e,t){if(!this.rangeSelectActionId||e.button>0)return;e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.measureLanes();let n=this.dayAt(t,e.clientX);n!=null&&(this.range={resourceId:t,anchorIdx:n,currentIdx:n},window.addEventListener(`keydown`,this.onDragKeydown))}onCellsPointerMove(e){if(!this.range)return;let t=this.dayAt(this.range.resourceId,e.clientX);t!=null&&t!==this.range.currentIdx&&(this.range={...this.range,currentIdx:t})}onCellsPointerUp(){let e=this.range;this.endDrag();let t=this.window();if(!e||!t||!this.rangeSelectActionId)return;let{startIdx:n,endIdx:r}=Fm(e.anchorIdx,e.currentIdx);this.emit(this.rangeSelectActionId,{_resourceId:e.resourceId,_start:W.iso(W.addDays(t.from,n)),_end:W.iso(W.addDays(t.from,r))})}endDrag(){this.drag=null,this.resize=null,this.range=null,window.removeEventListener(`keydown`,this.onDragKeydown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener(`keydown`,this.onDragKeydown)}render(){let e=this.window();if(!e||!this.resources.length)return l``;let t=[...Array(e.days).keys()].map(t=>W.addDays(e.from,t)),n=new Date,i=W.daysBetween(e.from,new Date(n.getFullYear(),n.getMonth(),n.getDate())),a=i>=0&&i<e.days,o=[],s;return this.resources.forEach(n=>{n.group&&n.group!==s&&o.push(l`<div class="group">${n.group}</div>`),s=n.group,o.push(this.renderRow(n,e,t,a?i:null))}),l`
            <div class="frame" style="grid-template-columns: minmax(${8+4.5*this.attributeColumns.length}rem, ${12+4.5*this.attributeColumns.length}rem) repeat(${e.days}, minmax(2.2rem, 1fr));">
                <div class="corner"><span class="res-name">${r(`resource`)}</span>${this.attributeColumns.map(e=>l`<span class="attr">${e}</span>`)}</div>
                ${t.map((e,t)=>l`
                    <div class="day-head ${this.isWeekend(e)?`weekend`:``} ${t===i?`today`:``}">
                        <span class="dow">${e.toLocaleDateString(void 0,{weekday:`short`})}</span>
                        <span class="num">${e.getDate()}</span>
                    </div>
                `)}
                ${o}
            </div>
        `}isWeekend(e){return e.getDay()===0||e.getDay()===6}renderRow(e,t,n,r){let i=100/t.days,a=this.blocks.filter(t=>t.resourceId===e.id&&t.start&&t.end),o=this.drag?.moved&&this.drag.targetResourceId===e.id?this.drag:null;return l`
            <div class="label" title="${e.label??``}">
                <span class="res-name">${e.icon?B(e.icon):p}${e.label}</span>
                ${this.attributeColumns.map((t,n)=>l`<span class="attr">${(e.attributes??[])[n]??``}</span>`)}
            </div>
            <div class="lane" data-resource-id="${e.id}">
                <div class="cells ${this.rangeSelectActionId?`selectable`:``}"
                     @pointerdown="${t=>this.onCellsPointerDown(t,e.id)}"
                     @pointermove="${e=>this.onCellsPointerMove(e)}"
                     @pointerup="${()=>this.onCellsPointerUp()}"
                     @pointercancel="${()=>this.endDrag()}">
                    ${n.map(e=>l`<div class="cell ${this.isWeekend(e)?`weekend`:``}"></div>`)}
                </div>
                ${r==null?p:l`<div class="today-line" style="left: ${(r+.5)*i}%;"></div>`}
                ${a.map(e=>{let n=W.daysBetween(t.from,W.parse(e.start)),r=W.daysBetween(t.from,W.parse(e.end));if(r<0||n>=t.days)return p;let a=Math.max(0,n),o=Math.min(t.days-1,r),s=this.drag?.moved&&this.drag.blockId===e.id,c=this.resize?.blockId===e.id?this.resize:null,u=c?Math.max(0,c.startIdx):a,d=c?Math.min(t.days-1,c.endIdx):o,f=e.summary??`${e.label??``} · ${e.start} → ${e.end}${e.status?` · ${e.status}`:``}`;return l`
                        <div class="block ${this.selectActionId?`clickable`:``} ${this.moveActionId?`draggable`:``} ${s?`dragging`:``}"
                             title="${f}"
                             style="left: ${u*i}%; width: ${(d-u+1)*i}%; ${e.color?`--mateu-planning-block: ${e.color}; ${Pm(e.color)?`--mateu-planning-block-ink: ${Pm(e.color)};`:``}`:``}"
                             @dblclick="${this.openActionId?()=>this.emit(this.openActionId,{_blockId:e.id}):p}"
                             @pointerdown="${t=>this.onBlockPointerDown(t,e,n)}"
                             @pointermove="${e=>this.onBlockPointerMove(e)}"
                             @pointerup="${()=>this.onBlockPointerUp(e)}"
                             @pointercancel="${()=>this.endDrag()}"
                        >${this.resizeActionId?l`<span class="handle start"
                                @pointerdown="${t=>this.onHandlePointerDown(t,e,`start`,n,r)}"
                                @pointermove="${e=>this.onHandlePointerMove(e)}"
                                @pointerup="${e=>this.onHandlePointerUp(e)}"></span>`:p}${e.icon?B(e.icon):p}${e.label}${this.resizeActionId?l`<span class="handle end"
                                @pointerdown="${t=>this.onHandlePointerDown(t,e,`end`,n,r)}"
                                @pointermove="${e=>this.onHandlePointerMove(e)}"
                                @pointerup="${e=>this.onHandlePointerUp(e)}"></span>`:p}</div>
                    `})}
                ${this.range&&this.range.resourceId===e.id?(()=>{let{startIdx:e,endIdx:t}=Fm(this.range.anchorIdx,this.range.currentIdx);return l`<div class="range" style="left: ${e*i}%; width: ${(t-e+1)*i}%;"></div>`})():p}
                ${o?l`
                    <div class="ghost"
                         style="left: ${o.targetStartIdx*i}%; width: ${Math.min(o.duration,t.days-o.targetStartIdx)*i}%;"></div>
                `:p}
            </div>
        `}};o([n({type:Array})],G.prototype,`resources`,void 0),o([n({type:Array})],G.prototype,`blocks`,void 0),o([n()],G.prototype,`from`,void 0),o([n()],G.prototype,`to`,void 0),o([n()],G.prototype,`moveActionId`,void 0),o([n()],G.prototype,`selectActionId`,void 0),o([n({type:Array})],G.prototype,`attributeColumns`,void 0),o([n()],G.prototype,`resizeActionId`,void 0),o([n()],G.prototype,`openActionId`,void 0),o([n()],G.prototype,`rangeSelectActionId`,void 0),o([s()],G.prototype,`resize`,void 0),o([s()],G.prototype,`range`,void 0),o([s()],G.prototype,`drag`,void 0),G=W=o([i(`mateu-planning-board`)],G);var Lm=e=>{let t=e.metadata;return l`
        <mateu-planning-board
                .resources="${t.resources??[]}"
                .blocks="${t.blocks??[]}"
                .from="${t.from}"
                .to="${t.to}"
                .moveActionId="${t.moveActionId}"
                .selectActionId="${t.selectActionId}"
                .attributeColumns="${t.attributeColumns??[]}"
                .resizeActionId="${t.resizeActionId??void 0}"
                .openActionId="${t.openActionId??void 0}"
                .rangeSelectActionId="${t.rangeSelectActionId??void 0}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-planning-board>
    `},Rm=class extends _{constructor(...e){super(...e),this.columns=[]}static{this.styles=h`
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
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            color: var(--lumo-body-text-color, #1a1a1a);
            border-radius: 999px;
            padding: .05rem .5rem;
            font-size: var(--lumo-font-size-xs, .72rem);
            font-weight: 600;
        }
    
        ${z}
    `}clickCard(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedCard:e}},bubbles:!0,composed:!0}))}render(){return l`
            <div class="board">
                ${this.columns.map(e=>l`
                    <div class="column" style="${e.color?`--mateu-kanban-accent: ${e.color};`:``}">
                        <div class="column-head">
                            <span class="column-title" title="${e.title??``}">${e.title}</span>
                            <span class="count">${e.cards?.length??0}</span>
                        </div>
                        ${(e.cards??[]).map(e=>l`
                            <div role="button" tabindex="0" class="card ${e.actionId?`clickable`:``}"
                                 style="${e.color?`--mateu-kanban-card-accent: ${e.color};`:``}"
                                 @click="${()=>this.clickCard(e)}" @keydown="${U(()=>this.clickCard(e))}">
                                <span class="card-title">${e.title}</span>
                                ${e.description?l`<span class="card-desc">${e.description}</span>`:p}
                                ${e.badge?l`<span class="badge">${e.badge}</span>`:p}
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};o([n({type:Array})],Rm.prototype,`columns`,void 0),Rm=o([i(`mateu-kanban`)],Rm);var zm=e=>{let t=e.metadata;return l`
        <mateu-kanban
                .columns="${t.columns??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-kanban>
    `},Bm=class extends _{constructor(...e){super(...e),this.items=[]}static{this.styles=h`
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
            color: var(--lumo-primary-text-color, #1a73e8);
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
    
        ${z}
    `}clickItem(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedItem:e}},bubbles:!0,composed:!0}))}render(){return l`
            <div class="feed">
                ${this.items.map(e=>l`
                    <div class="item ${e.actionId?`clickable`:``}">
                        <div class="rail">
                            <div class="dot" style="${e.color?`--mateu-timeline-dot: ${e.color};`:``}">${e.icon??``}</div>
                            <div class="line"></div>
                        </div>
                        <div role="button" tabindex="0" class="body" @click="${()=>this.clickItem(e)}" @keydown="${U(()=>this.clickItem(e))}">
                            <div class="head">
                                <span class="title">${e.title}</span>
                                ${e.timestamp?l`<span class="time">${e.timestamp}</span>`:p}
                            </div>
                            ${e.description?l`<div class="desc">${e.description}</div>`:p}
                        </div>
                    </div>
                `)}
            </div>
        `}};o([n({type:Array})],Bm.prototype,`items`,void 0),Bm=o([i(`mateu-timeline`)],Bm);var Vm=e=>{let t=e.metadata;return l`
        <mateu-timeline
                .items="${t.items??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-timeline>
    `},Hm=class extends _{constructor(...e){super(...e),this.steps=[],this.vertical=!1}static{this.styles=h`
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
            color: var(--lumo-primary-text-color, #1a73e8);
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
    `}updated(){let e=this.steps.length;if(e===0)return;let t=this.steps.findIndex(e=>e.status===`current`),n=this.steps.every(e=>e.status===`done`),r=t>=0?t+1:n?e:0;this.dispatchEvent(new CustomEvent(`mateu-guided-progress`,{detail:{current:r,total:e,steps:this.steps.map(e=>({id:e.id,title:e.title,status:e.status??`upcoming`}))},bubbles:!0,composed:!0}))}render(){return l`
            <div class="steps">
                ${this.steps.map((e,t)=>{let n=e.status??`upcoming`;return l`
                        <div class="step ${n}">
                            <div class="connector"></div>
                            <div class="dot">${n===`done`?`✓`:t+1}</div>
                            <div class="label">${e.title}</div>
                            ${e.description?l`<div class="desc">${e.description}</div>`:p}
                        </div>
                    `})}
            </div>
        `}};o([n({type:Array})],Hm.prototype,`steps`,void 0),o([n({type:Boolean,reflect:!0})],Hm.prototype,`vertical`,void 0),Hm=o([i(`mateu-progress-steps`)],Hm);var Um=e=>{let t=e.metadata;return l`
        <mateu-progress-steps
                .steps="${t.steps??[]}"
                ?vertical="${t.vertical??!1}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-progress-steps>
    `},Wm=class extends _{constructor(...e){super(...e),this.spark=[]}static{this.styles=h`
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
        .delta.up { color: var(--lumo-success-text-color, #12b76a); }
        .delta.down { color: var(--lumo-error-text-color, #e11d48); }
        .delta.flat { color: var(--lumo-secondary-text-color, #888); }
        svg { display: block; }
    
        ${z}
    `}sparkline(){let e=this.spark;if(!e||e.length<2)return p;let t=Math.min(...e),n=Math.max(...e)-t||1,r=80/(e.length-1),i=e.map((e,i)=>[2+i*r,2+26*(1-(e-t)/n)]),a=i.map(([e,t],n)=>`${n===0?`M`:`L`}${e.toFixed(1)} ${t.toFixed(1)}`).join(` `),o=`${a} L${i[i.length-1][0].toFixed(1)} 30 L${i[0][0].toFixed(1)} 30 Z`,s=this.trend===`down`?`var(--lumo-error-color, #e11d48)`:this.trend===`flat`?`var(--lumo-secondary-text-color, #888)`:`var(--lumo-success-color, #12b76a)`;return m`
            <svg width="${84}" height="${30}" viewBox="0 0 ${84} ${30}">
                <path d="${o}" fill="${s}" opacity="0.12"></path>
                <path d="${a}" fill="none" stroke="${s}" stroke-width="1.6"
                      stroke-linejoin="round" stroke-linecap="round"></path>
            </svg>
        `}dispatchAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){let e=this.trend??`up`;return l`
            <div role="button" tabindex="0" class="tile ${this.actionId?`clickable`:``}" @click="${()=>this.dispatchAction()}" @keydown="${U(()=>this.dispatchAction())}">
                ${this.label?l`<span class="label">${this.label}</span>`:p}
                <span class="value">${this.value}${this.unit?l`<span class="unit">${this.unit}</span>`:p}</span>
                <div class="foot">
                    ${this.delta?l`<span class="delta ${e}">${e===`up`?`▲`:e===`down`?`▼`:`→`} ${this.delta}</span>`:l`<span></span>`}
                    ${this.sparkline()}
                </div>
            </div>
        `}};o([n()],Wm.prototype,`label`,void 0),o([n()],Wm.prototype,`value`,void 0),o([n()],Wm.prototype,`unit`,void 0),o([n()],Wm.prototype,`delta`,void 0),o([n()],Wm.prototype,`trend`,void 0),o([n({type:Array})],Wm.prototype,`spark`,void 0),o([n()],Wm.prototype,`actionId`,void 0),Wm=o([i(`mateu-stat`)],Wm);var Gm=e=>{let t=e.metadata;return l`
        <mateu-stat
                label="${t.label??p}"
                value="${t.value??p}"
                unit="${t.unit??p}"
                delta="${t.delta??p}"
                trend="${t.trend??p}"
                actionId="${t.actionId??p}"
                .spark="${t.spark??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-stat>
    `},Km=e=>{let[t,n,r]=e.split(`-`).map(Number);return Date.UTC(t,n-1,r)},qm=e=>new Date(e).toISOString().slice(0,10),Jm=(e,t)=>qm(Km(e)+t*864e5),Ym=e=>(new Date(Km(e)).getUTCDay()+6)%7,Xm=e=>e.slice(0,8)+`01`,Zm=e=>{let[t,n]=e.split(`-`).map(Number);return qm(Date.UTC(t,n,0))},Qm=()=>{let e=new Date;return qm(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()))},$m=(e,t)=>{if(e===`day`)return{from:t,to:t};if(e===`week`){let e=Jm(t,-Ym(t));return{from:e,to:Jm(e,6)}}return{from:Xm(t),to:Zm(t)}},eh=(e,t)=>{let n=[];for(let r=e;r<=t;r=Jm(r,1))n.push(r);return n},th=e=>{let t=Xm(e),n=Array(Ym(t)).fill(null);for(n.push(...eh(t,Zm(e)));n.length%7;)n.push(null);let r=[];for(let e=0;e<n.length;e+=7)r.push(n.slice(e,e+7));return r},nh=(e,t)=>e.filter(e=>e.date&&e.date<=t&&(e.endDate||e.date)>=t).map((e,t)=>({e,i:t})).sort((e,t)=>(e.e.startTime||``).localeCompare(t.e.startTime||``)||e.i-t.i).map(({e})=>e),rh=(e,t,n)=>eh(t,n).map(t=>({date:t,events:nh(e,t)})).filter(e=>e.events.length),ih=(e,t)=>(e||[]).find(e=>e.date===t),ah=e=>e.startTime?e.startTime+(e.endTime?`–`+e.endTime:``):``,oh=new Set([`info`,`success`,`warning`,`danger`,`neutral`]),sh=e=>e&&oh.has(e)?`tone-`+e:``,ch=class extends _{constructor(...e){super(...e),this.events=[],this.views=[],this.days=[]}willUpdate(e){(e.has(`view`)||!this.shown)&&(this.shown=this.view||`month`)}static{this.styles=h`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .head { display: flex; align-items: center; justify-content: space-between; gap: .5rem; margin-bottom: .5rem; }
        .title {
            font-weight: 700;
            font-size: 1.05rem;
            color: var(--lumo-body-text-color, #222);
        }
        .switcher { display: inline-flex; border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2)); border-radius: var(--lumo-border-radius-m, 6px); overflow: hidden; }
        .switcher button {
            font: inherit; font-size: var(--lumo-font-size-s, .85rem); border: 0; padding: .3rem .7rem; cursor: pointer;
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #222);
        }
        .switcher button + button { border-left: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2)); }
        .switcher button[aria-pressed="true"] { background: var(--lumo-primary-color, #1a73e8); color: var(--lumo-primary-contrast-color, #fff); }
        .grid {
            display: grid;
            grid-template-columns: repeat(7, minmax(0, 1fr));
            gap: 1px;
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-m, 8px);
            overflow: hidden;
        }
        .grid.day { grid-template-columns: 1fr; }
        .dow {
            background: var(--lumo-contrast-5pct, #f7f7f8);
            padding: .35rem .5rem;
            font-weight: 600;
            font-size: var(--lumo-font-size-xs, .72rem);
            color: var(--lumo-body-text-color, #1a1a1a);
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
        .grid.week .cell { min-height: 12rem; }
        .grid.day .cell { min-height: 10rem; }
        .cell.blank {
            background: var(--lumo-contrast-5pct, #fafafa);
        }
        .cell.clickable { cursor: pointer; }
        .cell.clickable:hover { box-shadow: inset 0 0 0 2px var(--lumo-primary-color-50pct, rgba(26,115,232,.5)); }
        .top { display: flex; justify-content: space-between; align-items: center; gap: .25rem; }
        .label { font-size: var(--lumo-font-size-xs, .72rem); font-weight: 600; color: var(--lumo-secondary-text-color, #555); }
        .num {
            font-size: var(--lumo-font-size-xs, .72rem);
            color: var(--lumo-secondary-text-color, #888);
            margin-left: auto;
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
        .grid.week .chip, .grid.day .chip, .agenda .chip { white-space: normal; }
        .time { font-variant-numeric: tabular-nums; opacity: .8; margin-right: .25rem; }
        .chip.clickable { cursor: pointer; }
        .chip.clickable:hover { filter: brightness(.95); }
        .agenda { border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); border-radius: var(--lumo-border-radius-m, 8px); }
        .agenda .date { padding: .5rem .75rem; font-weight: 600; background: var(--lumo-contrast-5pct, #f7f7f8); display: flex; justify-content: space-between; }
        .agenda .entries { padding: .4rem .75rem; display: flex; flex-direction: column; gap: .3rem; }
        .empty { padding: 1rem; color: var(--lumo-secondary-text-color, #888); }
        .tone-info { background-color: rgba(0, 110, 200, .08); }
        .tone-success { background-color: rgba(30, 140, 60, .10); }
        .tone-warning { background-color: rgba(220, 140, 0, .16); }
        .tone-danger { background-color: rgba(200, 40, 30, .10); }
        .tone-danger .label { color: var(--lumo-error-text-color, #b3261e); }
        .tone-neutral { background-color: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }

        ${z}
    `}clickEvent(e,t){t?.stopPropagation(),e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedEvent:e}},bubbles:!0,composed:!0}))}clickDay(e){this.dayActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.dayActionId,parameters:{_date:e}},bubbles:!0,composed:!0}))}chip(e,t){let n=t?ah(e):``;return l`
            <span role="button" tabindex="0" class="chip ${e.actionId?`clickable`:``}"
                  style="${e.color?`--mateu-cal-accent: ${e.color};`:``}"
                  title="${(n?n+` `:``)+(e.title??``)}"
                  @click="${t=>this.clickEvent(e,t)}"
                  @keydown="${U(()=>this.clickEvent(e))}">${n?l`<span class="time">${n}</span>`:p}${e.title}</span>`}dayCell(e,t,n=!0){let r=ih(this.days,e),i=!!this.dayActionId,a=nh(this.events,e),o=new Date(e+`T00:00:00`).toLocaleDateString(void 0,{weekday:`long`,day:`numeric`,month:`long`})+(r?.label?`, `+r.label:``)+(a.length?`, `+a.length+` event`+(a.length>1?`s`:``):``);return l`
            <div class="cell ${e===Qm()?`today`:``} ${sh(r?.tone)} ${i?`clickable`:``}"
                 role="${i?`button`:p}" tabindex="${i?`0`:p}"
                 aria-label="${i?o:p}"
                 @click="${i?()=>this.clickDay(e):p}"
                 @keydown="${i?U(()=>this.clickDay(e)):p}">
                <div class="top">
                    ${r?.label?l`<span class="label">${r.label}</span>`:p}
                    ${n?l`<span class="num">${Number(e.slice(8))}</span>`:p}
                </div>
                ${a.map(e=>this.chip(e,t))}
            </div>`}renderMonth(e){return l`
            <div class="grid month">
                ${[`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`,`Sun`].map(e=>l`<div class="dow">${e}</div>`)}
                ${th(e).flat().map(e=>e?this.dayCell(e,!1):l`<div class="cell blank"></div>`)}
            </div>`}renderWeek(e){let{from:t,to:n}=$m(`week`,e),r=eh(t,n);return l`
            <div class="grid week">
                ${r.map(e=>l`<div class="dow">${new Date(e+`T00:00:00`).toLocaleDateString(void 0,{weekday:`short`,day:`numeric`})}</div>`)}
                ${r.map(e=>this.dayCell(e,!0,!1))}
            </div>`}renderDay(e){return l`
            <div class="grid day">
                <div class="dow">${new Date(e+`T00:00:00`).toLocaleDateString(void 0,{weekday:`long`,day:`numeric`,month:`long`})}</div>
                ${this.dayCell(e,!0,!1)}
            </div>`}renderList(e){let{from:t,to:n}=$m(`list`,e),i=rh(this.events,t,n);return i.length?l`
            <div class="agenda">
                ${i.map(({date:e,events:t})=>{let n=ih(this.days,e);return l`
                        <div class="date ${sh(n?.tone)}">
                            <span>${new Date(e+`T00:00:00`).toLocaleDateString(void 0,{weekday:`long`,day:`numeric`,month:`long`})}</span>
                            ${n?.label?l`<span class="label">${n.label}</span>`:p}
                        </div>
                        <div class="entries">${t.map(e=>this.chip(e,!0))}</div>`})}
            </div>`:l`<div class="agenda"><div class="empty">${r(`noEvents`)}</div></div>`}titleOf(e,t){let n=new Date(t+`T00:00:00`);if(e===`day`)return n.toLocaleDateString(void 0,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`});if(e===`week`){let{from:e,to:n}=$m(`week`,t),r=new Date(e+`T00:00:00`),i=new Date(n+`T00:00:00`);return r.toLocaleDateString(void 0,{day:`numeric`,month:`short`})+` – `+i.toLocaleDateString(void 0,{day:`numeric`,month:`short`,year:`numeric`})}return n.toLocaleDateString(void 0,{month:`long`,year:`numeric`})}render(){let e=this.month||Qm(),t=this.shown||`month`;return l`
            <div class="head">
                <div class="title">${this.titleOf(t,e)}</div>
                ${this.views&&this.views.length>1?l`
                    <div class="switcher" role="group" aria-label="${r(`calendarView`)}">
                        ${this.views.map(e=>l`<button type="button" aria-pressed="${e===t?`true`:`false`}"
                            @click="${()=>{this.shown=e}}">${e.charAt(0).toUpperCase()+e.slice(1)}</button>`)}
                    </div>`:p}
            </div>
            ${t===`week`?this.renderWeek(e):t===`day`?this.renderDay(e):t===`list`?this.renderList(e):this.renderMonth(e)}
        `}};o([n()],ch.prototype,`month`,void 0),o([n({type:Array})],ch.prototype,`events`,void 0),o([n()],ch.prototype,`view`,void 0),o([n({type:Array})],ch.prototype,`views`,void 0),o([n({type:Array})],ch.prototype,`days`,void 0),o([n()],ch.prototype,`dayActionId`,void 0),o([s()],ch.prototype,`shown`,void 0),ch=o([i(`mateu-calendar`)],ch);var lh=e=>{let t=e.metadata;return l`
        <mateu-calendar
                month="${t.month??p}"
                .events="${t.events??[]}"
                view="${t.view??p}"
                .views="${t.views??[]}"
                .days="${t.days??[]}"
                dayActionId="${t.dayActionId??p}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-calendar>
    `},uh=class extends _{constructor(...e){super(...e),this.plans=[]}static{this.styles=h`
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
            color: var(--lumo-success-text-color, #12b76a);
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
    `}cta(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return l`
            <div class="plans">
                ${this.plans.map(e=>l`
                    <div class="plan ${e.featured?`featured`:``}">
                        ${e.featured?l`<span class="badge">${r(`recommended`)}</span>`:p}
                        <span class="name">${e.name}</span>
                        <div>
                            <span class="price">${e.price}</span>
                            ${e.period?l`<span class="period">${e.period}</span>`:p}
                        </div>
                        <ul>
                            ${(e.features??[]).map(e=>l`<li>${e}</li>`)}
                        </ul>
                        ${e.ctaLabel?l`
                            <button class="cta" @click="${()=>this.cta(e)}">${e.ctaLabel}</button>
                        `:p}
                    </div>
                `)}
            </div>
        `}};o([n({type:Array})],uh.prototype,`plans`,void 0),uh=o([i(`mateu-pricing-table`)],uh);var dh=e=>{let t=e.metadata;return l`
        <mateu-pricing-table
                .plans="${t.plans??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-pricing-table>
    `},fh=class extends _{static{this.styles=h`
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
    
        ${z}
    `}clickNode(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedNode:e}},bubbles:!0,composed:!0}))}renderNode(e){let t=e.avatar,n=t&&(t.startsWith(`http`)||t.startsWith(`data:`));return l`
            <li>
                <div role="button" tabindex="0" class="node ${e.actionId?`clickable`:``}"
                     style="${e.color?`--mateu-org-accent: ${e.color};`:``}"
                     @click="${()=>this.clickNode(e)}" @keydown="${U(()=>this.clickNode(e))}">
                    ${t?l`<span class="avatar">${n?l`<img src="${t}" alt="">`:t}</span>`:p}
                    <span class="title">${e.title}</span>
                    ${e.subtitle?l`<span class="subtitle">${e.subtitle}</span>`:p}
                </div>
                ${e.children&&e.children.length?l`<ul>${e.children.map(e=>this.renderNode(e))}</ul>`:p}
            </li>
        `}render(){return this.root?l`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`:l``}};o([n({attribute:!1})],fh.prototype,`root`,void 0),fh=o([i(`mateu-org-chart`)],fh);var ph=e=>{let t=e.metadata;return l`
        <mateu-org-chart
                .root="${t.root}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-org-chart>
    `},mh=864e5,hh=class extends _{constructor(...e){super(...e),this.cells=[]}static{this.styles=h`
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
    `}color(e,t){if(e<=0||t<=0)return`var(--lumo-contrast-10pct, #ebedf0)`;let n=e/t;return`color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round((n>.75?1:n>.5?.75:n>.25?.5:.3)*100)}%, transparent)`}render(){let e=this.cells.filter(e=>!!e.date);if(!e.length)return l``;let t=e.map(e=>new Date(e.date+`T00:00:00`).getTime()),n=Math.min(...t),i=Math.max(...t),a=new Date(n);a.setDate(a.getDate()-(a.getDay()+6)%7);let o={};for(let t of e)o[t.date]=t;let s=Math.max(...e.map(e=>e.value??0),1),c=[];for(let e=a.getTime();e<=i;e+=mh){let t=new Date(e),n=t.toISOString().slice(0,10),r=o[n],i=r?.value??0,a=(t.getDay()+6)%7+1,u=r?.label??`${n}: ${i}`;c.push(l`
                <div class="cell" style="grid-row: ${a}; --cell: ${this.color(i,s)};" title="${u}"></div>
            `)}return l`
            <div class="wrap">
                <div class="grid">${c}</div>
                <div class="legend">
                    <span>${r(`less`)}</span>
                    <span class="cell" style="--cell: var(--lumo-contrast-10pct, #ebedf0);"></span>
                    <span class="cell" style="--cell: ${this.color(1,4)};"></span>
                    <span class="cell" style="--cell: ${this.color(2,4)};"></span>
                    <span class="cell" style="--cell: ${this.color(3,4)};"></span>
                    <span class="cell" style="--cell: ${this.color(4,4)};"></span>
                    <span>${r(`more`)}</span>
                </div>
            </div>
        `}};o([n({type:Array})],hh.prototype,`cells`,void 0),hh=o([i(`mateu-heatmap`)],hh);var gh=e=>{let t=e.metadata;return l`
        <mateu-heatmap
                .cells="${t.cells??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-heatmap>
    `},_h=class extends _{constructor(...e){super(...e),this.stages=[]}static{this.styles=h`
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
            color: var(--bar-ink, var(--lumo-primary-contrast-color, #fff));
            font-weight: 700;
            min-width: 3rem;
            transition: width .2s;
        }
        .meta { display: flex; gap: .5rem; align-items: baseline; }
        .label { font-weight: 600; color: var(--lumo-body-text-color, #222); }
        .conv { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .75rem); }
    `}render(){let e=this.stages;if(!e.length)return l``;let t=e[0].value??0,n=Math.max(...e.map(e=>e.value??0),1);return l`
            <div class="funnel">
                ${e.map((r,i)=>{let a=r.value??0,o=n>0?Math.max(6,a/n*100):6,s=i>0?e[i-1].value??0:t,c=i===0?t>0?`100%`:``:s>0?`${Math.round(a/s*100)}%`:`0%`;return l`
                        <div class="stage">
                            <div class="meta">
                                <span class="label">${r.label}</span>
                                ${i>0?l`<span class="conv">${c} of previous</span>`:p}
                            </div>
                            <div class="bar" style="width: ${o}%; ${r.color?`--bar: ${r.color}; ${Pm(r.color)?`--bar-ink: ${Pm(r.color)};`:``}`:``}">
                                ${a.toLocaleString()}
                            </div>
                        </div>
                    `})}
            </div>
        `}};o([n({type:Array})],_h.prototype,`stages`,void 0),_h=o([i(`mateu-funnel`)],_h);var vh=e=>{let t=e.metadata;return l`
        <mateu-funnel
                .stages="${t.stages??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-funnel>
    `},yh=class extends _{constructor(...e){super(...e),this.values=[],this.labels=[],this.area=!1}static{this.styles=h`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .title { font-weight: 600; margin-bottom: .35rem; color: var(--lumo-body-text-color, #222); }
        svg { display: block; width: 100%; height: auto; overflow: visible; }
        .labels { display: flex; justify-content: space-between; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); margin-top: .2rem; }
    `}render(){let e=this.values;if(!e||e.length<2)return l``;let t=Math.min(...e),n=Math.max(...e),r=n-t||1,i=584/(e.length-1),a=e.map((e,n)=>[8+n*i,8+144*(1-(e-t)/r)]),o=a.map(([e,t],n)=>`${n===0?`M`:`L`}${e.toFixed(1)} ${t.toFixed(1)}`).join(` `),s=`${o} L${a[a.length-1][0].toFixed(1)} 152 L${a[0][0].toFixed(1)} 152 Z`,c=this.color||`var(--lumo-primary-color, #1a73e8)`,u=e.indexOf(n),d=e.indexOf(t);return l`
            ${this.heading?l`<div class="title">${this.heading}</div>`:p}
            <svg viewBox="0 0 ${600} ${160}" preserveAspectRatio="none">
                ${this.area?m`<path d="${s}" fill="${c}" opacity="0.12"></path>`:p}
                <path d="${o}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
                ${a.map((t,n)=>n===u||n===d?m`<circle cx="${t[0]}" cy="${t[1]}" r="3.2" fill="${c}"><title>${this.labels[n]??``}: ${e[n]}</title></circle>`:m`<circle cx="${t[0]}" cy="${t[1]}" r="6" fill="transparent"><title>${this.labels[n]??``}: ${e[n]}</title></circle>`)}
            </svg>
            ${this.labels&&this.labels.length?l`<div class="labels"><span>${this.labels[0]}</span><span>${this.labels[this.labels.length-1]}</span></div>`:p}
        `}};o([n()],yh.prototype,`heading`,void 0),o([n({type:Array})],yh.prototype,`values`,void 0),o([n({type:Array})],yh.prototype,`labels`,void 0),o([n()],yh.prototype,`color`,void 0),o([n({type:Boolean})],yh.prototype,`area`,void 0),yh=o([i(`mateu-trend-chart`)],yh);var bh=e=>{let t=e.metadata;return l`
        <mateu-trend-chart
                heading="${t.title??p}"
                color="${t.color??p}"
                ?area="${t.area??!1}"
                .values="${t.values??[]}"
                .labels="${t.labels??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-trend-chart>
    `},xh=class extends _{constructor(...e){super(...e),this.features=[],this.columns=0}static{this.styles=h`
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
    
        ${z}
    `}clickFeature(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){let e=this.columns&&this.columns>0?`repeat(${this.columns}, minmax(0, 1fr))`:`repeat(auto-fit, minmax(15rem, 1fr))`;return l`
            <div class="grid" style="grid-template-columns: ${e};">
                ${this.features.map(e=>l`
                    <div role="button" tabindex="0" class="card ${e.actionId?`clickable`:``}" @click="${()=>this.clickFeature(e)}" @keydown="${U(()=>this.clickFeature(e))}">
                        ${e.icon?l`<span class="icon">${e.icon}</span>`:p}
                        <span class="title">${e.title}</span>
                        ${e.description?l`<span class="desc">${e.description}</span>`:p}
                    </div>
                `)}
            </div>
        `}};o([n({type:Array})],xh.prototype,`features`,void 0),o([n({type:Number})],xh.prototype,`columns`,void 0),xh=o([i(`mateu-feature-grid`)],xh);var Sh=e=>{let t=e.metadata;return l`
        <mateu-feature-grid
                .features="${t.features??[]}"
                .columns="${t.columns??0}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-feature-grid>
    `},Ch=class extends _{constructor(...e){super(...e),this.items=[]}static{this.styles=h`
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
    `}stars(e){let t=Math.max(0,Math.min(5,e||0));return`★`.repeat(t)+`☆`.repeat(5-t)}render(){return l`
            <div class="grid">
                ${this.items.map(e=>{let t=e.avatar&&(e.avatar.startsWith(`http`)||e.avatar.startsWith(`data:`));return l`
                        <div class="card">
                            ${e.rating?l`<div class="stars">${this.stars(e.rating)}</div>`:p}
                            <div class="quote">${e.quote}</div>
                            <div class="author">
                                ${e.avatar?l`<span class="avatar">${t?l`<img src="${e.avatar}" alt="">`:e.avatar}</span>`:p}
                                <div>
                                    <div class="name">${e.author}</div>
                                    ${e.role?l`<div class="role">${e.role}</div>`:p}
                                </div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};o([n({type:Array})],Ch.prototype,`items`,void 0),Ch=o([i(`mateu-testimonials`)],Ch);var wh=e=>{let t=e.metadata;return l`
        <mateu-testimonials
                .items="${t.items??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-testimonials>
    `},Th=class extends _{constructor(...e){super(...e),this.items=[],this.openSet=new Set,this.seeded=!1}static{this.styles=h`
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
    
        ${z}
    `}seed(){this.seeded||(this.seeded=!0,this.items.forEach((e,t)=>{e.open&&this.openSet.add(t)}))}toggle(e){this.openSet.has(e)?this.openSet.delete(e):this.openSet.add(e),this.requestUpdate()}render(){return this.seed(),l`
            <div class="list">
                ${this.items.map((e,t)=>{let n=this.openSet.has(t);return l`
                        <div class="item ${n?`open`:``}">
                            <div role="button" tabindex="0" aria-expanded="${n}" class="q" @click="${()=>this.toggle(t)}" @keydown="${U(()=>this.toggle(t))}">
                                <span>${e.question}</span>
                                <span class="chevron">›</span>
                            </div>
                            ${n?l`<div class="a">${e.answer}</div>`:``}
                        </div>
                    `})}
            </div>
        `}};o([n({type:Array})],Th.prototype,`items`,void 0),o([s()],Th.prototype,`openSet`,void 0),Th=o([i(`mateu-faq`)],Th);var Eh=e=>{let t=e.metadata;return l`
        <mateu-faq
                .items="${t.items??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-faq>
    `},Dh=class extends _{static{this.styles=h`
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
            background: var(--accent, var(--lumo-primary-color, #1a73e8)); color: var(--accent-ink, var(--lumo-primary-contrast-color, #fff));
        }
        .cta:hover { filter: brightness(.95); }
    `}themeVars(){switch(this.theme){case`success`:return`--accent: var(--lumo-success-color, #12b76a); --accent-ink: var(--lumo-success-contrast-color, #fff); --bg: var(--lumo-success-color-10pct, rgba(18,183,106,.1));`;case`warning`:return`--accent: var(--lumo-warning-color, #f59e0b); --accent-ink: var(--lumo-warning-contrast-color, #1a1a1a); --bg: var(--lumo-warning-color-10pct, rgba(245,158,11,.12));`;case`danger`:return`--accent: var(--lumo-error-color, #e11d48); --accent-ink: var(--lumo-error-contrast-color, #fff); --bg: var(--lumo-error-color-10pct, rgba(225,29,72,.1));`;default:return`--accent: var(--lumo-primary-color, #1a73e8); --bg: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));`}}cta(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){return l`
            <div class="callout" style="${this.themeVars()}">
                ${this.icon?l`<span class="icon">${this.icon}</span>`:p}
                <div class="body">
                    ${this.heading?l`<span class="heading">${this.heading}</span>`:p}
                    ${this.description?l`<span class="desc">${this.description}</span>`:p}
                    ${this.ctaLabel?l`<button class="cta" @click="${()=>this.cta()}">${this.ctaLabel}</button>`:p}
                </div>
            </div>
        `}};o([n()],Dh.prototype,`heading`,void 0),o([n()],Dh.prototype,`description`,void 0),o([n()],Dh.prototype,`icon`,void 0),o([n()],Dh.prototype,`ctaLabel`,void 0),o([n()],Dh.prototype,`actionId`,void 0),o([n()],Dh.prototype,`theme`,void 0),Dh=o([i(`mateu-callout-card`)],Dh);var Oh=e=>{let t=e.metadata;return l`
        <mateu-callout-card
                heading="${t.title??p}"
                description="${t.description??p}"
                icon="${t.icon??p}"
                ctaLabel="${t.ctaLabel??p}"
                actionId="${t.actionId??p}"
                theme="${t.theme??p}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-callout-card>
    `},kh=class extends _{constructor(...e){super(...e),this.comments=[]}static{this.styles=h`
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
    `}renderComment(e){let t=e.avatar&&(e.avatar.startsWith(`http`)||e.avatar.startsWith(`data:`));return l`
            <div class="comment">
                <span class="avatar">${e.avatar?t?l`<img src="${e.avatar}" alt="">`:e.avatar:e.author?.[0]??`?`}</span>
                <div class="body">
                    <div class="head">
                        <span class="author">${e.author}</span>
                        ${e.timestamp?l`<span class="time">${e.timestamp}</span>`:p}
                    </div>
                    <div class="text">${e.text}</div>
                    ${e.replies&&e.replies.length?l`<div class="replies">${e.replies.map(e=>this.renderComment(e))}</div>`:p}
                </div>
            </div>
        `}render(){return l`<div class="thread">${this.comments.map(e=>this.renderComment(e))}</div>`}};o([n({type:Array})],kh.prototype,`comments`,void 0),kh=o([i(`mateu-comment-thread`)],kh);var Ah=e=>{let t=e.metadata;return l`
        <mateu-comment-thread
                .comments="${t.comments??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-comment-thread>
    `},jh={pdf:`vaadin:file-text-o`,image:`vaadin:file-picture`,img:`vaadin:file-picture`,doc:`vaadin:file-text-o`,docx:`vaadin:file-text-o`,word:`vaadin:file-text-o`,xls:`vaadin:file-table`,xlsx:`vaadin:file-table`,excel:`vaadin:file-table`,sheet:`vaadin:file-table`,zip:`vaadin:file-zip`,archive:`vaadin:file-zip`,video:`vaadin:file-movie`,audio:`vaadin:file-sound`,code:`vaadin:file-code`,csv:`vaadin:file-table`,txt:`vaadin:file-text-o`},Mh=class extends _{constructor(...e){super(...e),this.files=[]}static{this.styles=h`
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
        .icon { flex: 0 0 auto; display: inline-flex; color: var(--lumo-secondary-text-color, #5f6b7a); }
        .name { flex: 1; min-width: 0; font-weight: 500; color: var(--lumo-body-text-color, #222); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .size { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .75rem); flex: 0 0 auto; }
        .dl { color: var(--lumo-primary-text-color, #1a73e8); flex: 0 0 auto; }
    
        ${z}
    `}icon(e){return B(e&&jh[e.toLowerCase()]||`vaadin:file-o`,`width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem);`)}clickFile(e,t){e.url||e.actionId&&(t.preventDefault(),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_file:e}},bubbles:!0,composed:!0})))}render(){return l`
            <div class="list">
                ${this.files.map(e=>{let t=!!e.url||!!e.actionId,n=l`
                        <span class="icon" aria-hidden="true">${this.icon(e.type)}</span>
                        <span class="name">${e.name}</span>
                        ${e.size?l`<span class="size">${e.size}</span>`:p}
                        ${e.url?l`<span class="dl" aria-hidden="true">${B(`vaadin:download`,`width: var(--lumo-icon-size-s, 1rem); height: var(--lumo-icon-size-s, 1rem);`)}</span>`:p}
                    `;return e.url?l`<a class="file clickable" href="${V(Hc(e.url,{allowData:!0}))}" download target="_blank" rel="noopener">${n}</a>`:l`<div role="button" tabindex="0" class="file ${t?`clickable`:``}" @click="${t=>this.clickFile(e,t)}" @keydown="${U(t=>this.clickFile(e,t))}">${n}</div>`})}
            </div>
        `}};o([n({type:Array})],Mh.prototype,`files`,void 0),Mh=o([i(`mateu-file-list`)],Mh);var Nh=e=>{let t=e.metadata;return l`
        <mateu-file-list
                .files="${t.files??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-file-list>
    `},Ph=class extends _{constructor(...e){super(...e),this.items=[],this.localDone=new Map}static{this.styles=h`
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
    
        ${z}
    `}isDone(e,t){return this.localDone.has(t)?!!this.localDone.get(t):!!e.done}toggle(e,t){let n=!this.isDone(e,t);this.localDone.set(t,n),this.requestUpdate(),e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_item:e,_done:n}},bubbles:!0,composed:!0}))}render(){let e=this.items.length,t=this.items.filter((e,t)=>this.isDone(e,t)).length,n=e>0?Math.round(t/e*100):0;return l`
            <div class="head">
                ${this.heading?l`<span class="title">${this.heading}</span>`:l`<span></span>`}
                <span class="count">${t} / ${e}</span>
            </div>
            <div class="bar"><div class="fill" style="width: ${n}%;"></div></div>
            ${this.items.map((e,t)=>{let n=this.isDone(e,t);return l`
                    <div role="button" tabindex="0" class="item ${n?`done`:``}" @click="${()=>this.toggle(e,t)}" @keydown="${U(()=>this.toggle(e,t))}">
                        <span class="box">${n?`✓`:p}</span>
                        <span class="label">${e.label}</span>
                    </div>
                `})}
        `}};o([n()],Ph.prototype,`heading`,void 0),o([n({type:Array})],Ph.prototype,`items`,void 0),o([s()],Ph.prototype,`localDone`,void 0),Ph=o([i(`mateu-checklist`)],Ph);var Fh=e=>{let t=e.metadata;return l`
        <mateu-checklist
                heading="${t.title??p}"
                .items="${t.items??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-checklist>
    `},Ih=class extends _{static{this.styles=h`
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
        .delta.up { color: var(--lumo-success-text-color, #12b76a); background: var(--lumo-success-color-10pct, rgba(18,183,106,.12)); }
        .delta.down { color: var(--lumo-error-text-color, #e11d48); background: var(--lumo-error-color-10pct, rgba(225,29,72,.12)); }
        .delta.flat { color: var(--lumo-secondary-text-color, #888); background: var(--lumo-contrast-10pct, rgba(0,0,0,.06)); }
    `}render(){let e=this.trend??`flat`;return l`
            <div class="card">
                ${this.heading?l`<div class="title">${this.heading}</div>`:p}
                <div class="row">
                    <div class="side">
                        ${this.leftLabel?l`<div class="label">${this.leftLabel}</div>`:p}
                        <div class="value">${this.leftValue}</div>
                    </div>
                    <div class="mid">
                        <span class="arrow">${`→`}</span>
                        ${this.delta?l`<span class="delta ${e}">${e===`up`?`▲`:e===`down`?`▼`:``} ${this.delta}</span>`:p}
                    </div>
                    <div class="side">
                        ${this.rightLabel?l`<div class="label">${this.rightLabel}</div>`:p}
                        <div class="value">${this.rightValue}</div>
                    </div>
                </div>
            </div>
        `}};o([n()],Ih.prototype,`heading`,void 0),o([n()],Ih.prototype,`leftLabel`,void 0),o([n()],Ih.prototype,`leftValue`,void 0),o([n()],Ih.prototype,`rightLabel`,void 0),o([n()],Ih.prototype,`rightValue`,void 0),o([n()],Ih.prototype,`delta`,void 0),o([n()],Ih.prototype,`trend`,void 0),Ih=o([i(`mateu-comparison-card`)],Ih);var Lh=e=>{let t=e.metadata;return l`
        <mateu-comparison-card
                heading="${t.title??p}"
                leftLabel="${t.leftLabel??p}"
                leftValue="${t.leftValue??p}"
                rightLabel="${t.rightLabel??p}"
                rightValue="${t.rightValue??p}"
                delta="${t.delta??p}"
                trend="${t.trend??p}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-comparison-card>
    `},Rh=h`
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
`,zh=new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}),Bh=e=>Number.isFinite(e)?zh.format(e):``,Vh=(e,t)=>{let n=e<0?`-`:``,r=Bh(Math.abs(e));return t?`${n}${t} ${r}`:`${n}${r}`},Hh=(e,t)=>t?`${Bh(e)} ${t}`:Bh(e),Uh=class extends _{constructor(...e){super(...e),this.title=``,this.badges=[],this.facts=[]}static{this.styles=[Rh,h`
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
            text-transform: uppercase; color: var(--lumo-secondary-text-color, #5f6b7a);
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
            text-transform: uppercase; color: var(--lumo-secondary-text-color, #5f6b7a);
        }
        .metric .value {
            font-size: 1.7rem; font-weight: 700; line-height: 1.1;
            color: var(--lumo-primary-text-color, #1a73e8);
        }
        .metric .caption { font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888); }
    `]}render(){let e=!!(this.metricLabel||this.metricValue||this.metricCaption);return l`
            <div class="card">
                <div class="main">
                    <div class="title-row">
                        <span class="title">${this.title}</span>
                        ${this.badges.map(e=>l`<span class="chip ${e.color??``}">${e.label}</span>`)}
                    </div>
                    ${this.subtitle?l`<span class="subtitle">${this.subtitle}</span>`:p}
                    ${this.facts.length?l`
                        <div class="facts">
                            ${this.facts.map(e=>l`
                                <div class="fact">
                                    <span class="label">${e.label}</span>
                                    <span class="value">${e.value}</span>
                                </div>
                            `)}
                        </div>
                    `:p}
                </div>
                ${e?l`
                    <div class="metric">
                        ${this.metricLabel?l`<span class="label">${this.metricLabel}</span>`:p}
                        ${this.metricValue?l`<span class="value">${this.metricValue}</span>`:p}
                        ${this.metricCaption?l`<span class="caption">${this.metricCaption}</span>`:p}
                    </div>
                `:p}
            </div>
        `}};o([n()],Uh.prototype,`title`,void 0),o([n({type:Array})],Uh.prototype,`badges`,void 0),o([n()],Uh.prototype,`subtitle`,void 0),o([n({type:Array})],Uh.prototype,`facts`,void 0),o([n()],Uh.prototype,`metricLabel`,void 0),o([n()],Uh.prototype,`metricValue`,void 0),o([n()],Uh.prototype,`metricCaption`,void 0),Uh=o([i(`mateu-entity-header`)],Uh);var Wh=e=>{if(e.__hoistedToPageHeader)return l``;let t=e.metadata;return l`
        <mateu-entity-header
                .title="${t.title??``}"
                .badges="${t.badges??[]}"
                .subtitle="${t.subtitle}"
                .facts="${t.facts??[]}"
                .metricLabel="${t.metricLabel}"
                .metricValue="${t.metricValue}"
                .metricCaption="${t.metricCaption}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-entity-header>
    `},Gh=class extends _{constructor(...e){super(...e),this.value=0,this.max=0}static{this.styles=h`
        :host { display: block; width: 100%; }
        .meter { display: flex; flex-direction: column; gap: .35rem; }
        .label {
            font-size: var(--lumo-font-size-xxs, .7rem); font-weight: 600; letter-spacing: .05em;
            text-transform: uppercase; color: var(--lumo-secondary-text-color, #5f6b7a);
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
    `}fillColor(){return this.dangerAt!=null&&this.value>=this.dangerAt?`error`:this.warnAt!=null&&this.value>=this.warnAt?`warning`:this.warnAt!=null||this.dangerAt!=null?`success`:`primary`}render(){let e=this.max>0?Math.min(Math.max(this.value/this.max,0),1):0,t=Math.round(e*100);return l`
            <div class="meter">
                ${this.label?l`<span class="label">${this.label}</span>`:p}
                <span class="value">${Hh(this.value,this.unit)}</span>
                <div class="track">
                    <div class="fill ${this.fillColor()}" style="width: ${t}%"></div>
                </div>
                <span class="caption">${this.caption?this.caption:`${t}%`}</span>
            </div>
        `}};o([n()],Gh.prototype,`label`,void 0),o([n({type:Number})],Gh.prototype,`value`,void 0),o([n({type:Number})],Gh.prototype,`max`,void 0),o([n()],Gh.prototype,`unit`,void 0),o([n()],Gh.prototype,`caption`,void 0),o([n({type:Number})],Gh.prototype,`warnAt`,void 0),o([n({type:Number})],Gh.prototype,`dangerAt`,void 0),Gh=o([i(`mateu-meter`)],Gh);var Kh=e=>{let t=e.metadata;return l`
        <mateu-meter
                .label="${t.label}"
                .value="${t.value??0}"
                .max="${t.max??0}"
                .unit="${t.unit}"
                .caption="${t.caption}"
                .warnAt="${t.warnAt}"
                .dangerAt="${t.dangerAt}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-meter>
    `},qh=class extends _{constructor(...e){super(...e),this.total=0,this.done=0}static{this.styles=h`
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
            border: 1px solid var(--lumo-contrast-30pct, rgba(0,0,0,.3));
            color: var(--lumo-body-text-color, #1a1a1a);
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
    `}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){let e=this.total>0&&this.done>=this.total,t=!e&&!!this.actionLabel&&!!this.actionId;return l`
            <div class="banner ${e?`complete`:``}">
                <span class="icon" aria-hidden="true">${B(`vaadin:users`,`width: var(--lumo-icon-size-s, 1rem); height: var(--lumo-icon-size-s, 1rem);`)}</span>
                ${this.label?l`<span class="label">${this.label}</span>`:p}
                <div class="pills">
                    ${Array.from({length:this.total},(e,t)=>l`
                        <span class="pill ${t+1<=this.done?`filled`:``}">${t+1}/${this.total}</span>
                    `)}
                </div>
                <span class="spacer"></span>
                ${t?l`<button @click="${()=>this.runAction()}">${this.actionLabel} →</button>`:p}
            </div>
        `}};o([n()],qh.prototype,`label`,void 0),o([n({type:Number})],qh.prototype,`total`,void 0),o([n({type:Number})],qh.prototype,`done`,void 0),o([n()],qh.prototype,`actionLabel`,void 0),o([n()],qh.prototype,`actionId`,void 0),qh=o([i(`mateu-task-progress`)],qh);var Jh=e=>{let t=e.metadata;return l`
        <mateu-task-progress
                .label="${t.label}"
                .total="${t.total??0}"
                .done="${t.done??0}"
                .actionLabel="${t.actionLabel}"
                .actionId="${t.actionId}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-task-progress>
    `},Yh=class extends _{constructor(...e){super(...e),this.items=[],this.compact=!1,this.frameless=!1,this.columns=0,this.itemHeadingLevel=3}static{this.styles=[Rh,z,h`
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
        /* title and description WRAP (a history entry or a payment in a narrow fold read whole —
           «Booking created 1 Oct 08:18 · demo — Res…» hid the part that mattered) */
        .title {
            font-weight: 500; color: var(--lumo-body-text-color, #222);
            white-space: normal; overflow-wrap: anywhere;
        }
        .description {
            font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888);
            white-space: normal; overflow-wrap: anywhere;
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
        /* N-column grid mode (columns > 1): cells instead of stacked rows — no dividers,
           auto-collapsing to one column on narrow viewports via the min() clamp */
        .list.grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
            /* air BETWEEN cards (the operations checklist reads as a grid of fichas, not a
               dense list) — overridable per surface via the CSS vars */
            column-gap: var(--mateu-status-grid-column-gap, 2.5rem);
            row-gap: var(--mateu-status-grid-row-gap, 2rem);
        }
        .list.grid .cell { padding: .6rem 0; }
        .list.grid .row + .row { border-top: none; }
        /* STACKED cells (items with actions or a timeline): borderless card — title + status
           chip on the same line, description below, icon actions below. Mirrors the VB/Redwood
           check-in anatomy (pax fichas / operations checklist). */
        .list.stacked { border: none; border-radius: 0; overflow: visible; }
        .cell { display: flex; flex-direction: column; gap: .2rem; padding: .5rem 0; }
        .cell + .cell { border-top: none; }
        .list.stacked:not(.grid) .cell + .cell { margin-top: .6rem; }
        /* a single-column stack (e.g. the guests rail) keeps card-sized cells — same width
           as the operations grid cells, however wide the hosting fold grows */
        .list.stacked:not(.grid) .cell { max-width: 22rem; }
        .cell-title-row { display: flex; align-items: center; gap: .5rem; min-width: 0; }
        .cell-title {
            margin: 0; font-weight: 600; color: var(--lumo-body-text-color, #222);
            white-space: normal; overflow-wrap: anywhere;
        }
        h3.cell-title { font-size: var(--lumo-font-size-m, 1rem); }
        h4.cell-title { font-size: var(--lumo-font-size-s, .875rem); }
        /* the status chip aligns to the RIGHT edge of the card */
        .cell-title-row .chip { margin-left: auto; }
        .cell-description {
            font-size: var(--lumo-font-size-xs, .75rem);
            color: var(--lumo-secondary-text-color, #888);
        }
        .cell-line {
            font-size: var(--lumo-font-size-xs, .75rem);
            color: var(--lumo-secondary-text-color, #888);
        }
        .cell-actions { display: flex; gap: .35rem; padding-top: .25rem; }
        .icon-action {
            display: inline-flex; align-items: center; justify-content: center;
            width: 2rem; height: 2rem;
            border: none; border-radius: var(--lumo-border-radius-m, 6px);
            background: transparent;
            color: var(--lumo-primary-text-color, #1a73e8);
            cursor: pointer; font-size: 1rem;
        }
        .icon-action:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
    `]}runAction(e,t){t&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}rowClicked(e){this.rowActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.rowActionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}renderItemAction(e,t,n,r){return!t||!n?p:r?l`
                <button class="icon-action" title="${t}" aria-label="${t}"
                    @click="${t=>{t.stopPropagation(),this.runAction(e,n)}}">
                    ${B(r)}
                </button>`:l`
            <button class="row-action" title="${t}"
                @click="${t=>{t.stopPropagation(),this.runAction(e,n)}}">${t}</button>`}render(){let e=this.columns>1||this.items.some(e=>e.actionId||e.actionId2||e.actionId3||(e.lines?.length??0)>0),t=this.itemHeadingLevel===4?`h4`:`h3`;return e?l`
                <div class="list stacked ${this.compact?`compact`:``} ${this.columns>1?`grid`:``}"
                     style="${this.columns>1?`grid-template-columns: repeat(auto-fit, minmax(min(18rem, calc(100% / ${this.columns} - 1.5rem)), 1fr));`:``}">
                    ${this.items.map(e=>l`
                        <div role="button" tabindex="0" class="cell ${(e.lines?.length??0)>0?`with-lines`:``} ${this.rowActionId?`clickable`:``}"
                             @click="${()=>this.rowClicked(e)}" @keydown="${U(()=>this.rowClicked(e))}">
                            <div class="cell-title-row">
                                ${t===`h4`?l`<h4 class="cell-title">${e.title}</h4>`:l`<h3 class="cell-title">${e.title}</h3>`}
                                ${e.status?l`<span class="chip ${e.statusColor??``}">${e.status}</span>`:p}
                            </div>
                            ${e.description?l`<span class="cell-description">${e.description}</span>`:p}
                            ${(e.lines??[]).map(e=>l`<span class="cell-line">${e}</span>`)}
                            ${e.actionId||e.actionId2||e.actionId3?l`
                                <div class="cell-actions">
                                    ${this.renderItemAction(e,e.actionLabel,e.actionId,e.actionIcon)}
                                    ${this.renderItemAction(e,e.actionLabel2,e.actionId2,e.actionIcon2)}
                                    ${this.renderItemAction(e,e.actionLabel3,e.actionId3,e.actionIcon3)}
                                </div>`:p}
                        </div>
                    `)}
                </div>
            `:l`
            <div class="list ${this.compact?`compact`:``} ${this.frameless?`frameless`:``}">
                ${this.items.map(e=>l`
                    <div role="button" tabindex="0" class="row ${this.rowActionId?`clickable`:``}"
                         @click="${()=>this.rowClicked(e)}" @keydown="${U(()=>this.rowClicked(e))}">
                        ${e.avatar?l`<span class="avatar">${e.avatar}</span>`:e.icon?l`<span class="icon">${e.icon}</span>`:p}
                        <div class="body">
                            <span class="title">${e.title}</span>
                            ${e.description?l`<span class="description">${e.description}</span>`:p}
                        </div>
                        ${e.status?l`<span class="chip ${e.statusColor??``}">${e.status}</span>`:p}
                    </div>
                `)}
            </div>
        `}};o([n({type:Array})],Yh.prototype,`items`,void 0),o([n({type:Boolean})],Yh.prototype,`compact`,void 0),o([n({type:Boolean})],Yh.prototype,`frameless`,void 0),o([n()],Yh.prototype,`rowActionId`,void 0),o([n({type:Number})],Yh.prototype,`columns`,void 0),o([n({type:Number})],Yh.prototype,`itemHeadingLevel`,void 0),Yh=o([i(`mateu-status-list`)],Yh);var Xh=e=>{let t=e.metadata;return l`
        <mateu-status-list
                .items="${t.items??[]}"
                ?compact="${t.compact??!1}"
                ?frameless="${t.frameless??!1}"
                columns="${t.columns??0}"
                itemHeadingLevel="${t.itemHeadingLevel??3}"
                rowActionId="${V(t.rowActionId??void 0)}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-status-list>
    `},Zh=class extends _{constructor(...e){super(...e),this.items=[]}static{this.styles=h`
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
    `}render(){return l`
            <ul>
                ${this.items.map(e=>l`<li>${e}</li>`)}
            </ul>
        `}};o([n({type:Array})],Zh.prototype,`items`,void 0),Zh=o([i(`mateu-bulleted-list`)],Zh);var Qh=e=>{let t=e.metadata;return l`
        <mateu-bulleted-list
                .items="${t.items??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-bulleted-list>
    `},$h=e=>(e.label??``)+((e.count??0)>0?` (${(e.count??0)>25?`25+`:e.count})`:``),eg=(e,t={})=>{let n=(e.maxPerCategory??0)>0?e.maxPerCategory:10;return(e.categories??[]).map((e,r)=>{let i=(e.actions??[]).map((e,t)=>({a:e,i:t})).sort((e,t)=>Number(!!t.a.populated)-Number(!!e.a.populated)||e.i-t.i).map(({a:e})=>({label:$h(e),actionId:e.actionId??``,parameters:e.parameters??{},populated:!!e.populated,disabled:!!e.disabled}));t.hideUnpopulated&&(i=i.filter(e=>e.populated));let a=t.showAll?.has(r)?i:i.slice(0,n);return{title:e.title??``,actions:a,hiddenCount:i.length-a.length,index:r}}).filter(e=>e.actions.length>0)},tg=(e,t)=>{let n=String(e??``).toLowerCase().split(`+`).map(e=>e.trim()).filter(Boolean);if(!n.length)return!1;let r=e=>n.includes(e),i=n.find(e=>![`ctrl`,`control`,`alt`,`shift`,`meta`,`cmd`].includes(e));return!i||t.ctrlKey!==(r(`ctrl`)||r(`control`))||t.altKey!==r(`alt`)||t.shiftKey!==r(`shift`)||t.metaKey!==(r(`meta`)||r(`cmd`))?!1:t.key?.toLowerCase()===i||t.code===`Key`+i.toUpperCase()||t.code===`Digit`+i||t.code===`Numpad`+i},ng=class extends _{constructor(...e){super(...e),this.open=!1,this.hideUnpopulated=!1,this.showAll=new Set,this.keydown=e=>{if(this.open&&e.key===`Escape`){e.preventDefault(),this.close();return}!this.open&&this.panel?.shortcut&&this.isConnected&&this.getClientRects().length&&tg(this.panel.shortcut,e)&&(e.preventDefault(),this.show())}}connectedCallback(){super.connectedCallback(),document.addEventListener(`keydown`,this.keydown,!0)}disconnectedCallback(){document.removeEventListener(`keydown`,this.keydown,!0),this.focusTrap?.release(),this.focusTrap=void 0,super.disconnectedCallback()}show(){this.showAll=new Set,this.open=!0}close(){this.open=!1,this.focusTrap?.release(),this.focusTrap=void 0}updated(){let e=this.renderRoot.querySelector(`[role="dialog"]`);this.open&&e&&!this.focusTrap?this.focusTrap=c(e):this.open&&this.focusTrap?.refresh()}pick(e){e.disabled||(this.close(),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:e.parameters},bubbles:!0,composed:!0})))}render(){let e=this.panel;if(!e)return p;let t=e.label||`I want to…`,n=eg(e,{showAll:this.showAll,hideUnpopulated:this.hideUnpopulated});return l`
            <button class="trigger" type="button" aria-haspopup="dialog" aria-expanded="${this.open?`true`:`false`}"
                    title="${e.shortcut?`${t} (${e.shortcut})`:t}"
                    @click="${()=>this.show()}">${t}</button>
            ${this.open?l`
                <div class="backdrop" @click="${()=>this.close()}"></div>
                <div class="dialog" role="dialog" aria-modal="true" aria-label="${t}">
                    <div class="head">
                        <h2>${t}</h2>
                        <button class="close" type="button" aria-label="${r(`close`)}" @click="${()=>this.close()}">✕</button>
                    </div>
                    ${e.hideUnpopulatedToggle?l`
                        <label class="toggle">
                            <input type="checkbox" role="switch" .checked="${this.hideUnpopulated}"
                                   @change="${e=>{this.hideUnpopulated=e.target.checked}}" />
                            Hide unpopulated
                        </label>`:p}
                    <div class="columns">
                        ${n.map(e=>l`
                            <section class="column" aria-label="${e.title}">
                                <h3>${e.title}</h3>
                                ${e.actions.map(e=>l`
                                    <button class="action ${e.populated?`populated`:``}" type="button"
                                            ?disabled="${e.disabled}"
                                            @click="${()=>this.pick(e)}">${e.label}</button>`)}
                                ${e.hiddenCount>0?l`
                                    <button class="action more" type="button"
                                            @click="${()=>{this.showAll=new Set([...this.showAll,e.index])}}">${r(`showMore`)} (${e.hiddenCount})</button>`:p}
                            </section>`)}
                    </div>
                </div>`:p}
        `}static{this.styles=h`
        :host { display: inline-flex; }
        button { font: inherit; cursor: pointer; }
        button:focus-visible { outline: 2px solid var(--lumo-primary-color, #0b6bcb); outline-offset: 2px; }
        .trigger {
            padding: 0.4rem 0.9rem; border-radius: var(--lumo-border-radius-m, 6px);
            border: 1px solid var(--lumo-contrast-30pct, rgba(0,0,0,.3)); background: var(--lumo-base-color, #fff);
            color: var(--lumo-body-text-color, #1a1a1a);
        }
        .trigger:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 1000; }
        .dialog {
            position: fixed; z-index: 1001; top: 10vh; left: 50%; transform: translateX(-50%);
            width: min(64rem, calc(100vw - 2rem)); max-height: 80vh; overflow: auto; box-sizing: border-box;
            padding: 1.25rem 1.5rem; border-radius: var(--lumo-border-radius-l, 10px);
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            box-shadow: var(--lumo-box-shadow-xl, 0 12px 40px rgba(0,0,0,.25));
        }
        .head { display: flex; align-items: center; justify-content: space-between; }
        h2 { margin: 0; font-size: var(--lumo-font-size-xl, 1.375rem); }
        .close { background: none; border: 0; font-size: 1.1rem; color: inherit; }
        .toggle { display: inline-flex; gap: 0.5rem; align-items: center; margin: 0.75rem 0 0.25rem; font-size: var(--lumo-font-size-s, 0.875rem); }
        .columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: 0.5rem 1.5rem; margin-top: 0.75rem; }
        .column { display: flex; flex-direction: column; align-items: flex-start; }
        h3 { margin: 0 0 0.5rem; font-size: var(--lumo-font-size-m, 1rem); }
        .action {
            background: none; border: 0; padding: 0.3rem 0; text-align: start;
            color: var(--lumo-primary-text-color, #0b6bcb);
        }
        .action:hover:not([disabled]) { text-decoration: underline; }
        .action.populated { font-weight: 700; }
        .action[disabled] { color: var(--lumo-disabled-text-color, #999); cursor: default; }
        .action.more { color: var(--lumo-secondary-text-color, #555); }
    `}};o([n({attribute:!1})],ng.prototype,`panel`,void 0),o([s()],ng.prototype,`open`,void 0),o([s()],ng.prototype,`hideUnpopulated`,void 0),o([s()],ng.prototype,`showAll`,void 0),ng=o([i(`mateu-action-panel`)],ng);var rg=e=>l`
    <mateu-action-panel
            .panel="${e.metadata}"
            style="${e.style??p}"
            class="${e.cssClasses??p}"
            slot="${e.slot??p}"
    ></mateu-action-panel>
`,ig=(e,t)=>{let n=[];for(let r of e.sections??[]){let e=!!r.title,i=e&&t.has(r.id);if(e&&n.push({kind:`section`,id:r.id,title:r.title,collapsed:i}),!i)for(let t of r.rows??[])n.push({kind:`row`,row:t,sectionId:r.id,indented:e})}return n},ag=e=>new Set((e.sections??[]).filter(e=>e.title&&e.collapsed).map(e=>e.id)),og=e=>{let t=e.columns??[];if(!t.some(e=>e.group))return[];let n=[];for(let e of t){let t=e.group??``,r=n[n.length-1];r&&r.label===t?r.span++:n.push({label:t,span:1})}return n},sg=new Set([`info`,`success`,`warning`,`danger`,`neutral`]),cg=(e,t)=>e&&sg.has(e)?e:t&&sg.has(t)?t:``,lg=class extends _{constructor(...e){super(...e),this.collapsed=new Set}willUpdate(e){e.has(`grid`)&&this.grid&&!this.seenGrid&&(this.collapsed=ag(this.grid)),e.has(`grid`)&&(this.seenGrid=this.grid,this.editing=void 0)}toggle(e){let t=new Set(this.collapsed);t.has(e)?t.delete(e):t.add(e),this.collapsed=t}dispatch(e,t,n,r){let i=this.grid?.columns?.[n];this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:{_rowId:t,_columnId:i?.id,_value:r}},bubbles:!0,composed:!0}))}commit(e,t,n){if(!this.editing)return;this.editing=void 0;let r=e.cells?.[t]?.value??``;n.value!==r&&this.grid?.editActionId&&this.dispatch(this.grid.editActionId,e.id,t,n.value)}renderCell(e,t){let n=this.grid,r=e.cells?.[t]??{},i=n.columns?.[t],a=cg(r.tone,i?.tone),o=!!(e.editable&&n.editActionId),s=`${e.label??``}, ${i?.label??``}: ${r.value??``}`;if(this.editing&&this.editing.rowId===e.id&&this.editing.columnIndex===t)return l`<td class="cell ${a} editing"><input aria-label="${s}" .value="${r.value??``}"
                @keydown="${n=>{n.key===`Enter`&&this.commit(e,t,n.target),n.key===`Escape`&&(this.editing=void 0)}}"
                @blur="${n=>this.commit(e,t,n.target)}" /></td>`;let c=()=>{this.editing={rowId:e.id,columnIndex:t}};return r.link&&n.cellActionId?l`<td class="cell ${a}"><button class="link" type="button" aria-label="${s}"
                @click="${()=>this.dispatch(n.cellActionId,e.id,t,r.value??``)}">${r.value}</button></td>`:l`<td class="cell ${a} ${o?`editable`:``}" tabindex="${o?`0`:p}"
            aria-label="${o?s:p}"
            @dblclick="${o?c:p}"
            @keydown="${o?e=>{(e.key===`Enter`||e.key===`F2`)&&(e.preventDefault(),c())}:p}">${r.value}</td>`}updated(){this.renderRoot.querySelector(`td.editing input`)?.focus()}render(){let e=this.grid;if(!e)return p;let t=e.columns??[],n=og(e);return l`
            <div class="scroller">
                <table>
                    <thead>
                        ${n.length?l`<tr>
                            <th class="corner" rowspan="2">${e.rowHeaderLabel??``}</th>
                            ${n.map(e=>l`<th class="group" colspan="${e.span}">${e.label}</th>`)}
                        </tr>`:p}
                        <tr>
                            ${n.length?p:l`<th class="corner">${e.rowHeaderLabel??``}</th>`}
                            ${t.map(e=>l`<th class="col ${cg(null,e.tone)}" scope="col">${e.label??e.id}</th>`)}
                        </tr>
                    </thead>
                    <tbody>
                        ${ig(e,this.collapsed).map(e=>e.kind===`section`?l`<tr class="section"><th scope="rowgroup" class="rowhead">
                                    <button type="button" class="toggle" aria-expanded="${e.collapsed?`false`:`true`}"
                                            @click="${()=>this.toggle(e.id)}"><span class="chevron" aria-hidden="true">${e.collapsed?`▸`:`▾`}</span>${e.title}</button>
                                </th>${t.map(()=>l`<td class="cell section-cell"></td>`)}</tr>`:l`<tr class="${e.row.emphasis?`emphasis`:``}">
                                    <th scope="row" class="rowhead ${e.indented?`indented`:``}">${e.row.label}</th>
                                    ${t.map((t,n)=>this.renderCell(e.row,n))}
                                </tr>`)}
                    </tbody>
                </table>
            </div>
        `}static{this.styles=h`
        :host { display: block; max-width: 100%; }
        .scroller { overflow: auto; max-height: 36rem; border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px); }
        table { border-collapse: separate; border-spacing: 0; font-size: var(--lumo-font-size-s, 0.875rem); color: var(--lumo-body-text-color, #1a1a1a); }
        th, td { padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); white-space: nowrap; background: var(--lumo-base-color, #fff); }
        thead th { position: sticky; top: 0; z-index: 2; font-weight: 600; text-align: end; }
        thead tr:nth-child(2) th { top: 2rem; }
        thead th.group { text-align: start; }
        th.corner, th.rowhead { position: sticky; left: 0; z-index: 1; text-align: start; min-width: 12rem; }
        th.corner { z-index: 3; }
        th.rowhead.indented { padding-inline-start: 1.6rem; font-weight: 500; }
        td.cell { text-align: end; min-width: 4.5rem; }
        tr.emphasis td, tr.emphasis th { font-weight: 700; }
        tr.section th, tr.section td { background: var(--lumo-contrast-5pct, #f5f5f5); }
        .toggle { font: inherit; font-weight: 600; background: none; border: 0; padding: 0; cursor: pointer; color: inherit; display: inline-flex; gap: 0.4rem; }
        .chevron { width: 1em; }
        .link { font: inherit; background: none; border: 0; padding: 0; cursor: pointer; color: var(--lumo-primary-text-color, #0b6bcb); text-decoration: underline; }
        td.editable { cursor: text; box-shadow: inset 0 -2px 0 var(--lumo-contrast-20pct, rgba(0,0,0,.2)); }
        td.editing input { width: 4rem; font: inherit; text-align: end; }
        button:focus-visible, td.editable:focus-visible { outline: 2px solid var(--lumo-primary-color, #0b6bcb); outline-offset: -2px; }
        .info { background-color: rgba(0, 110, 200, 0.08); }
        .success { background-color: rgba(30, 140, 60, 0.10); }
        .warning { background-color: rgba(220, 140, 0, 0.16); }
        .danger { background-color: rgba(200, 40, 30, 0.10); color: #b3261e; }
        .neutral { background-color: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
    `}};o([n({attribute:!1})],lg.prototype,`grid`,void 0),o([s()],lg.prototype,`collapsed`,void 0),o([s()],lg.prototype,`editing`,void 0),lg=o([i(`mateu-matrix-grid`)],lg);var ug=e=>l`
    <mateu-matrix-grid
            .grid="${e.metadata}"
            style="${e.style??p}"
            class="${e.cssClasses??p}"
            slot="${e.slot??p}"
    ></mateu-matrix-grid>
`,dg=e=>e?`application/x-mateu-`+String(e).toLowerCase().replace(/[^a-z0-9.+-]/g,`-`):``,fg=e=>{let t;try{t=JSON.parse(e)}catch{return[]}return(Array.isArray(t)?t:[t]).map(e=>{if(e==null)return null;if(typeof e!=`object`)return String(e);let t=e,n=(t.data&&typeof t.data==`object`?t.data:t).id??t.key;return n==null?null:String(n)}).filter(e=>e!=null)},pg=(e,t,n)=>({...e??{},_draggedIds:t,_dragType:n}),mg=class extends _{constructor(...e){super(...e),this.ready=!1,this.over=!1,this.onDocumentDragStart=e=>{setTimeout(()=>{this.ready=this.accepts(e)})},this.onDocumentDragEnd=()=>{this.ready=!1,this.over=!1}}get mime(){return dg(this.zone?.accept)}accepts(e){let t=e.dataTransfer?Array.from(e.dataTransfer.types):[];return!!this.mime&&t.includes(this.mime)}connectedCallback(){super.connectedCallback(),document.addEventListener(`dragstart`,this.onDocumentDragStart,!0),document.addEventListener(`dragend`,this.onDocumentDragEnd,!0)}disconnectedCallback(){document.removeEventListener(`dragstart`,this.onDocumentDragStart,!0),document.removeEventListener(`dragend`,this.onDocumentDragEnd,!0),super.disconnectedCallback()}onDragOver(e){this.accepts(e)&&(e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect=`move`),this.over=!0)}onDrop(e){if(!this.accepts(e))return;e.preventDefault(),this.over=!1,this.ready=!1;let t=fg(e.dataTransfer?.getData(this.mime)??``);!t.length||!this.zone?.actionId||this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.zone.actionId,parameters:pg(this.zone.parameters,t,this.zone.accept??``)},bubbles:!0,composed:!0}))}render(){let e=this.zone;return e?l`
            <div class="zone ${this.ready?`ready`:``} ${this.over?`over`:``}" role="group"
                 aria-label="${(e.title??``)+(e.subtitle?`, `+e.subtitle:``)} — drop target"
                 @dragover="${this.onDragOver}" @dragleave="${()=>{this.over=!1}}" @drop="${this.onDrop}">
                ${e.title?l`<div class="title">${e.title}</div>`:p}
                ${e.subtitle?l`<div class="subtitle">${e.subtitle}</div>`:p}
                <slot></slot>
                ${this.ready?l`<div class="hint">${r(`dropHere`)}</div>`:p}
            </div>`:p}static{this.styles=h`
        :host { display: block; }
        .zone {
            padding: var(--lumo-space-m, 1rem); border-radius: var(--lumo-border-radius-l, 10px);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); background: var(--lumo-base-color, #fff);
            transition: border-color .15s, background-color .15s; height: 100%; box-sizing: border-box;
        }
        .zone.ready { border: 2px dashed var(--lumo-primary-color, #1a73e8); }
        .zone.over { background: var(--lumo-primary-color-10pct, rgba(26,115,232,.1)); }
        .title { font-weight: 600; }
        .subtitle { font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666); margin-bottom: .25rem; }
        .hint { margin-top: .5rem; font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-primary-text-color, #1a73e8); }
    `}};o([n({attribute:!1})],mg.prototype,`zone`,void 0),o([s()],mg.prototype,`ready`,void 0),o([s()],mg.prototype,`over`,void 0),mg=o([i(`mateu-drop-zone`)],mg);var hg=(e,t,n,r,i,a,o)=>l`
    <mateu-drop-zone
            .zone="${t.metadata}"
            style="${t.style??p}"
            class="${t.cssClasses??p}"
            slot="${t.slot??p}"
    >${(t.children??[]).map(t=>R(e,t,n,r,i,a,o))}</mateu-drop-zone>
`,gg=e=>{let t=e.metadata.attributes?.[`data-colspan`];return l`
        <hr style="border: none; border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); width: 100%; margin: var(--lumo-space-s, .5rem) 0; ${e.style??``}"
            class="${e.cssClasses??p}"
            id="${V(e.id??void 0)}"
            data-colspan="${V(t)}"
            slot="${e.slot??p}"/>
    `},_g=new Map,vg=e=>_g.get(e),yg=(e,t)=>t!=null&&e!=null&&!e.has(t),bg=typeof HTMLElement<`u`?HTMLElement:class{},xg=class extends bg{static get observedAttributes(){return[`type`,`renderer`]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){let e=this.getAttribute(`type`)??`unknown`,t=this.getAttribute(`renderer`)??`unknown`;this.shadowRoot||this.attachShadow({mode:`open`}),this.shadowRoot.innerHTML=`
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
                ⚠ Component “${e}” is not supported by the “${t}” renderer yet.
            </div>
        `}};typeof customElements<`u`&&!customElements.get(`mateu-unsupported`)&&customElements.define(`mateu-unsupported`,xg);var Sg=new Set,Cg=(e,t,n)=>{let r=`${n}/${t}`;return Sg.has(r)||(Sg.add(r),console.warn(`[mateu] Component type "${t}" is not supported by the "${n}" renderer — rendering <mateu-unsupported> placeholder.`)),l`<mateu-unsupported
            type="${t}"
            renderer="${n}"
            data-component-id="${e?.id??p}"
            slot="${e?.slot??p}"
    ></mateu-unsupported>`},wg=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.children?.map(t=>R(e,t,n,r,i,a,o,!1))??[],l=vg(s.name);return l?l(s.props??{},c):Cg(t,`${w.CustomComponent}:${s.name}`,`custom-component-registry`)},Tg={info:`vaadin:info-circle`,success:`vaadin:check-circle`,warning:`vaadin:warning`,danger:`vaadin:exclamation-circle`},Eg=e=>!!e&&/^[a-z][\w-]*:[\w-]+$/.test(e),K=class extends _{constructor(...e){super(...e),this.text=``,this.theme=`info`,this.noIcon=!1,this.slim=!1,this.fullWidth=!1,this.hasContent=!1,this.inlineContent=!1}static{this.styles=h`
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
        .notice.slim .icon { --mateu-notice-icon-size: var(--lumo-icon-size-s, 1rem); }
        /* a custom content icon (text, an emoji) renders at its natural size */
        .icon.custom { font-size: var(--lumo-font-size-m, 1rem); }
        .icon {
            flex: 0 0 auto;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }
        .icon > * { width: var(--mateu-notice-icon-size, var(--lumo-icon-size-s, 1.1rem)); height: var(--mateu-notice-icon-size, var(--lumo-icon-size-s, 1.1rem)); }
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
        .notice-action:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.06)); }
        .status { flex: 0 0 auto; font-weight: 600; font-size: var(--lumo-font-size-xs, .75rem); }
        /* the theme's own semantic tints and inks (Lumo tunes the *-text-color tokens for 4.5:1 on
           the matching 10pct tint, in light AND dark) — the notice used to hard-code pastels that
           stayed light on a dark page */
        .info    { background: var(--lumo-primary-color-10pct, #e3f0fb); }
        .info .text, .info .status, .info .icon { color: var(--lumo-primary-text-color, #1a5dad); }
        .success { background: var(--lumo-success-color-10pct, #e2f3e6); }
        .success .text, .success .status, .success .icon { color: var(--lumo-success-text-color, #22703a); }
        .warning { background: var(--lumo-warning-color-10pct, #fdf0dc); }
        .warning .text, .warning .status, .warning .icon { color: var(--lumo-warning-text-color, #925a13); }
        .danger  { background: var(--lumo-error-color-10pct, #f6e0da); }
        .danger .text, .danger .status, .danger .icon { color: var(--lumo-error-text-color, #a5502e); }
    `}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){let e=!!this.text&&!!this.text.trim();if(!e&&!this.hasContent)return l``;let t=[`info`,`success`,`warning`,`danger`].includes(this.theme)?this.theme:`info`;return l`
            <div class="notice ${t} ${this.slim?`slim`:``}">
                ${this.noIcon?p:this.icon&&!Eg(this.icon)?l`<span class="icon custom" aria-hidden="true">${this.icon}</span>`:l`<span class="icon" aria-hidden="true">${B(this.icon||Tg[t])}</span>`}
                <div class="body ${this.inlineContent?`inline`:``}">
                    ${e?l`<span class="text">${this.text}</span>`:p}
                    ${this.hasContent?l`<div class="content"><slot></slot></div>`:p}
                </div>
                ${this.actionLabel&&this.actionId?l`<button class="notice-action" @click="${()=>this.runAction()}">${this.actionLabel}</button>`:this.status?l`<span class="status">${this.status}</span>`:p}
            </div>
        `}};o([n()],K.prototype,`text`,void 0),o([n()],K.prototype,`theme`,void 0),o([n()],K.prototype,`icon`,void 0),o([n({type:Boolean})],K.prototype,`noIcon`,void 0),o([n()],K.prototype,`actionLabel`,void 0),o([n()],K.prototype,`actionId`,void 0),o([n()],K.prototype,`status`,void 0),o([n({type:Boolean})],K.prototype,`slim`,void 0),o([n({type:Boolean})],K.prototype,`fullWidth`,void 0),o([n({type:Boolean})],K.prototype,`hasContent`,void 0),o([n({type:Boolean})],K.prototype,`inlineContent`,void 0),K=o([i(`mateu-notice`)],K);var Dg=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=Jl(s.text??``,r,i,a,o)??``,u=t.children??[];return l`
        <mateu-notice
                text="${c}"
                theme="${s.theme??`info`}"
                icon="${V(s.icon??void 0)}"
                ?noIcon="${s.noIcon??!1}"
                actionLabel="${V(s.actionLabel??void 0)}"
                actionId="${V(s.actionId??void 0)}"
                status="${V(s.status??void 0)}"
                ?slim="${s.slim??!1}"
                ?fullWidth="${s.fullWidth??!1}"
                ?inlineContent="${s.inlineContent??!1}"
                ?hasContent="${u.length>0}"
                data-colspan="${s.fullWidth?`99`:p}"
                style="${t.style??p}"
                class="${t.cssClasses??p}"
                slot="${t.slot??p}"
        >${u.map(t=>R(e,t,n,r,i,a,o))}</mateu-notice>
    `},Og=class extends _{constructor(...e){super(...e),this.groups=[]}static{this.styles=[Rh,z,h`
        :host { display: block; width: 100%; }
        .rail { display: flex; flex-direction: column; gap: var(--lumo-space-m, 1rem); }
        .group { display: flex; flex-direction: column; gap: .45rem; }
        .group-label {
            font-size: var(--lumo-font-size-xxs, .7rem); font-weight: 600; letter-spacing: .05em;
            text-transform: uppercase; color: var(--lumo-secondary-text-color, #5f6b7a);
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
        .item-action {
            align-self: flex-end; margin-top: .25rem; cursor: pointer;
            font-size: var(--lumo-font-size-xs, .75rem); font-weight: 600;
            color: var(--lumo-primary-text-color, #1a73e8);
            background: none; border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.15));
            border-radius: var(--lumo-border-radius-m, 8px); padding: .2rem .6rem;
        }
        .item-action:hover { border-color: var(--lumo-primary-color, #1a73e8); }
        .caption {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: var(--lumo-font-size-xs, .75rem);
            color: var(--lumo-secondary-text-color, #888);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
    `]}willUpdate(e){e.has(`groups`)&&(this.selectedId=this.groups.flatMap(e=>e.items??[]).find(e=>e.selected)?.id)}itemAction(e,t,n){e.stopPropagation(),t&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:{_item:n}},bubbles:!0,composed:!0}))}select(e){this.selectedId=e,this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{_item:e}},bubbles:!0,composed:!0}))}render(){return l`
            <div class="rail">
                ${this.groups.map(e=>l`
                    <div class="group" role="listbox" aria-label="${e.label||p}">
                        ${e.label?l`<span class="group-label">${e.label}</span>`:p}
                        ${(e.items??[]).map(e=>l`
                            <div role="option" tabindex="0" aria-selected="${e.id===this.selectedId}" class="card ${e.id===this.selectedId?`selected`:``}"
                                 @click="${()=>this.select(e.id)}" @keydown="${U(()=>this.select(e.id))}">
                                <span class="title">${e.title}</span>
                                <div class="meta">
                                    ${e.caption?l`<span class="caption">${e.caption}</span>`:p}
                                    ${(e.badges??[]).map(e=>l`<span class="chip ${e.color??``}">${e.label}</span>`)}
                                </div>
                                ${e.actionLabel&&e.actionId?l`
                                    <button class="item-action"
                                            @click="${t=>this.itemAction(t,e.actionId,e.id)}">${e.actionLabel}</button>
                                `:p}
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};o([n()],Og.prototype,`actionId`,void 0),o([n({type:Array})],Og.prototype,`groups`,void 0),o([s()],Og.prototype,`selectedId`,void 0),Og=o([i(`mateu-task-queue`)],Og);var kg=e=>{let t=e.metadata;return l`
        <mateu-task-queue
                .actionId="${t.actionId}"
                .groups="${t.groups??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-task-queue>
    `},Ag=class extends _{constructor(...e){super(...e),this.columns=0,this.items=[]}static{this.styles=[Rh,z,h`
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
    `]}willUpdate(e){e.has(`items`)&&(this.selectedId=this.items.find(e=>e.selected)?.id)}select(e){e.disabled||(this.selectedId=e.id,this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0})))}render(){let e=this.columns>0?`grid-template-columns: repeat(${this.columns}, minmax(0, 1fr));`:`grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));`;return l`
            <div class="grid" style="${e}">
                ${this.items.map(e=>l`
                    <div role="button" tabindex="0" class="cell ${e.disabled?`disabled`:``} ${e.recommended?`recommended`:``} ${e.id===this.selectedId?`selected`:``}"
                         @click="${()=>this.select(e)}" @keydown="${U(()=>this.select(e))}">
                        ${e.recommended?l`<span class="tag">${this.recommendedLabel||`Recommended`}</span>`:p}
                        <span class="title">${e.title}</span>
                        ${e.subtitle?l`<span class="subtitle">${e.subtitle}</span>`:p}
                        ${e.statusLabel?l`<span class="chip ${e.statusColor??``}">${e.statusLabel}</span>`:p}
                        ${e.note?l`<span class="note ${e.noteColor??``}"><span class="dot"></span>${e.note}</span>`:p}
                    </div>
                `)}
            </div>
        `}};o([n()],Ag.prototype,`actionId`,void 0),o([n({type:Number})],Ag.prototype,`columns`,void 0),o([n()],Ag.prototype,`recommendedLabel`,void 0),o([n({type:Array})],Ag.prototype,`items`,void 0),o([s()],Ag.prototype,`selectedId`,void 0),Ag=o([i(`mateu-resource-grid`)],Ag);var jg=e=>{let t=e.metadata;return l`
        <mateu-resource-grid
                .actionId="${t.actionId}"
                .columns="${t.columns??0}"
                .recommendedLabel="${t.recommendedLabel}"
                .items="${t.items??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-resource-grid>
    `},q=class extends _{constructor(...e){super(...e),this.title=``,this.features=[],this.current=!1,this.added=!1}static{this.styles=h`
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
    `}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return l`
            <div class="card ${this.current?``:`offer`}">
                ${this.image?l`<img class="image" src="${this.image}" alt="${this.title}">`:p}
                ${this.tag&&this.image?l`<span class="tag">${this.tag}</span>`:p}
                <div class="body">
                    ${this.tag&&!this.image?l`<span class="tag static">${this.tag}</span>`:p}
                    <span class="title">${this.title}</span>
                    ${this.subtitle?l`<span class="subtitle">${this.subtitle}</span>`:p}
                    ${this.features.length?l`
                        <div class="features">
                            ${this.features.map(e=>l`<span class="feature">${e}</span>`)}
                        </div>
                    `:p}
                </div>
                <div class="footer">
                    ${this.current?this.currentLabel?l`<span class="current-label">${this.currentLabel}</span>`:p:this.actionLabel&&this.actionId?l`
                            <button class="${this.added?`added`:``}" @click="${()=>this.runAction()}">
                                <span>${this.added&&this.addedLabel||this.actionLabel}</span>
                                ${this.priceLabel?l`<span class="price">${this.priceLabel}</span>`:p}
                            </button>
                        `:p}
                </div>
            </div>
        `}};o([n()],q.prototype,`tag`,void 0),o([n()],q.prototype,`title`,void 0),o([n()],q.prototype,`subtitle`,void 0),o([n()],q.prototype,`image`,void 0),o([n({type:Array})],q.prototype,`features`,void 0),o([n()],q.prototype,`priceLabel`,void 0),o([n()],q.prototype,`actionLabel`,void 0),o([n()],q.prototype,`actionId`,void 0),o([n({type:Boolean})],q.prototype,`current`,void 0),o([n()],q.prototype,`currentLabel`,void 0),o([n({type:Boolean})],q.prototype,`added`,void 0),o([n()],q.prototype,`addedLabel`,void 0),q=o([i(`mateu-offer-card`)],q);var Mg=e=>{let t=e.metadata;return l`
        <mateu-offer-card
                .tag="${t.tag}"
                .title="${t.title??``}"
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
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-offer-card>
    `},Ng=class extends _{constructor(...e){super(...e),this.items=[],this.added=new Set}static{this.styles=h`
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
    `}willUpdate(e){e.has(`items`)&&(this.added=new Set(this.items.filter(e=>e.added).map(e=>e.id)))}total(){return this.items.filter(e=>e.id!=null&&this.added.has(e.id)).reduce((e,t)=>e+(t.price??0),0)}toggle(e){if(e.id==null)return;let t=new Set(this.added),n=!t.has(e.id);n?t.add(e.id):t.delete(e.id),this.added=t,this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{_item:e.id,_added:n,_total:this.total()}},bubbles:!0,composed:!0}))}render(){return l`
            <div class="header">
                ${this.totalLabel?l`<span class="total-label">${this.totalLabel}:</span>`:p}
                <span class="total">${Vh(this.total(),this.currency)}</span>
            </div>
            <div class="grid">
                ${this.items.map(e=>{let t=e.id!=null&&this.added.has(e.id);return l`
                        <div class="card ${t?`added`:``}">
                            ${e.icon?l`<span class="icon">${e.icon}</span>`:p}
                            <span class="title">${e.title}</span>
                            ${e.description?l`<span class="description">${e.description}</span>`:p}
                            ${e.includedLabel?l`<span class="included">${e.includedLabel}</span>`:l`
                                    ${e.price==null?p:l`
                                        <span class="price">${Vh(e.price,this.currency)}${e.unit?` / ${e.unit}`:``}</span>
                                    `}
                                    <button class="toggle ${t?`on`:``}" @click="${()=>this.toggle(e)}"
                                            aria-pressed="${t}">${t?`✓`:`+`}</button>
                                `}
                        </div>
                    `})}
            </div>
        `}};o([n()],Ng.prototype,`totalLabel`,void 0),o([n()],Ng.prototype,`currency`,void 0),o([n()],Ng.prototype,`actionId`,void 0),o([n({type:Array})],Ng.prototype,`items`,void 0),o([s()],Ng.prototype,`added`,void 0),Ng=o([i(`mateu-addon-picker`)],Ng);var Pg=e=>{let t=e.metadata;return l`
        <mateu-addon-picker
                .totalLabel="${t.totalLabel}"
                .currency="${t.currency}"
                .actionId="${t.actionId}"
                .items="${t.items??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-addon-picker>
    `},Fg=class extends _{constructor(...e){super(...e),this.lines=[]}static{this.styles=h`
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
    `}computedTotal(){return this.total==null?this.lines.filter(e=>!e.included).reduce((e,t)=>e+(t.amount??0),0):this.total}render(){return l`
            ${this.lines.map(e=>l`
                <div class="row">
                    <span class="dot"></span>
                    <span class="concept">${e.concept}</span>
                    ${e.included?l`<span class="included-label">${e.includedLabel||`Included`}</span>`:l`<span class="amount ${(e.amount??0)<0?`negative`:``}">${Vh(e.amount??0,this.currency)}</span>`}
                </div>
            `)}
            <div class="total-row">
                <span class="total-label">${this.totalLabel||`Total`}</span>
                <span class="total">${Vh(this.computedTotal(),this.currency)}</span>
            </div>
        `}};o([n()],Fg.prototype,`currency`,void 0),o([n()],Fg.prototype,`totalLabel`,void 0),o([n({type:Array})],Fg.prototype,`lines`,void 0),o([n({type:Number})],Fg.prototype,`total`,void 0),Fg=o([i(`mateu-ledger`)],Fg);var Ig=e=>{let t=e.metadata;return l`
        <mateu-ledger
                .currency="${t.currency}"
                .totalLabel="${t.totalLabel}"
                .lines="${t.lines??[]}"
                .total="${t.total}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-ledger>
    `},Lg=class extends _{constructor(...e){super(...e),this.methods=[]}static{this.styles=h`
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
    `}willUpdate(e){e.has(`selected`)&&(this.selectedId=this.selected)}confirm(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{_method:this.selectedId}},bubbles:!0,composed:!0}))}pick(e){this.selectedId=e,this.methodActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.methodActionId,parameters:{_method:e}},bubbles:!0,composed:!0}))}render(){return l`
            <div class="bar">
                <div class="methods">
                    ${this.methods.map(e=>l`
                        <button class="method ${e.id===this.selectedId?`selected`:``}"
                                @click="${()=>this.pick(e.id)}">${e.label}</button>
                    `)}
                </div>
                ${this.contextLabel||this.contextValue?l`
                    <div class="context">
                        ${this.contextLabel?l`<span class="label">${this.contextLabel}</span>`:p}
                        ${this.contextValue?l`<span class="value">${this.contextValue}</span>`:p}
                    </div>
                `:p}
                <span class="spacer"></span>
                ${this.confirmLabel&&this.actionId?l`<button class="confirm" @click="${()=>this.confirm()}">${this.confirmLabel}</button>`:p}
            </div>
        `}};o([n()],Lg.prototype,`actionId`,void 0),o([n()],Lg.prototype,`methodActionId`,void 0),o([n({type:Array})],Lg.prototype,`methods`,void 0),o([n()],Lg.prototype,`selected`,void 0),o([n()],Lg.prototype,`contextLabel`,void 0),o([n()],Lg.prototype,`contextValue`,void 0),o([n()],Lg.prototype,`confirmLabel`,void 0),o([s()],Lg.prototype,`selectedId`,void 0),Lg=o([i(`mateu-payment-picker`)],Lg);var Rg=e=>{let t=e.metadata;return l`
        <mateu-payment-picker
                .actionId="${t.actionId}"
                .methodActionId="${t.methodActionId}"
                .methods="${t.methods??[]}"
                .selected="${t.selected}"
                .contextLabel="${t.contextLabel}"
                .contextValue="${t.contextValue}"
                .confirmLabel="${t.confirmLabel}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-payment-picker>
    `},zg=class extends _{constructor(...e){super(...e),this.items=[]}static{this.styles=h`
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
    `}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return l`
            <div class="list">
                ${this.items.map(e=>l`
                    <div class="row">
                        <span class="dot ${e.status??`ok`}"></span>
                        <div class="body">
                            <span class="name">${e.name}</span>
                            ${e.systems?.length?l`<span class="systems">${e.systems.join(` · `)}</span>`:p}
                        </div>
                        <div class="counters">
                            <span class="counter ok">${B(`vaadin:check-circle`,`width: var(--lumo-icon-size-s, 1rem); height: var(--lumo-icon-size-s, 1rem); vertical-align: text-bottom;`)} ${e.ok??0} OK</span>
                            ${(e.warnings??0)>0?l`<span class="counter warning">${B(`vaadin:warning`,`width: var(--lumo-icon-size-s, 1rem); height: var(--lumo-icon-size-s, 1rem); vertical-align: text-bottom;`)} ${e.warnings} warnings</span>`:p}
                            ${(e.errors??0)>0?l`<span class="counter error">${B(`vaadin:exclamation-circle`,`width: var(--lumo-icon-size-s, 1rem); height: var(--lumo-icon-size-s, 1rem); vertical-align: text-bottom;`)} ${e.errors} errors</span>`:p}
                        </div>
                        ${e.actionLabel&&e.actionId?l`<button @click="${()=>this.runAction(e)}">${e.actionLabel}</button>`:p}
                    </div>
                `)}
            </div>
        `}};o([n({type:Array})],zg.prototype,`items`,void 0),zg=o([i(`mateu-process-monitor`)],zg);var Bg=e=>{let t=e.metadata;return l`
        <mateu-process-monitor
                .items="${t.items??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-process-monitor>
    `},Vg=m`<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7"></circle><line x1="16.5" y1="16.5" x2="21" y2="21"></line></svg>`,Hg=()=>L.get()?.renderIcon?B(`vaadin:search`,`width: 100%; height: 100%;`):l`${Vg}`,Ug=(e,t)=>{e.ctrlKey||e.metaKey||e.shiftKey||(e.preventDefault(),_u(e.currentTarget,t))},Wg=e=>{let t=e.metadata??{},n=t.title||r(`notFound`),i=t.message||r(`notFoundMessage`),a=t.backRoute;return l`
        <section class="mateu-not-found ${e.cssClasses??``}"
                 slot="${e.slot??p}"
                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
                        gap: var(--lumo-space-s, .5rem); min-height: 50vh; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-m, 1rem);
                        color: var(--lumo-secondary-text-color, #5f6b7a); ${e.style??``}">
            <span class="mateu-not-found-icon" aria-hidden="true"
                  style="display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;
                         width: 4.5rem; height: 4.5rem; padding: 1.1rem; margin-bottom: var(--lumo-space-s, .5rem); border-radius: 50%;
                         color: var(--lumo-primary-text-color, #1676f3); background: var(--lumo-primary-color-10pct, rgba(22, 118, 243, .1));">
                ${Hg()}
            </span>
            <h2 class="mateu-not-found-title"
                style="margin: 0; font-size: var(--lumo-font-size-xl, 1.375rem); font-weight: 600; line-height: var(--lumo-line-height-s, 1.375);
                       color: var(--lumo-header-text-color, var(--lumo-body-text-color, #1a2533)); overflow-wrap: anywhere;">${n}</h2>
            <p class="mateu-not-found-message" style="margin: 0; max-width: 32rem; font-size: var(--lumo-font-size-m, 1rem);">${i}</p>
            ${a?l`
                <a class="mateu-not-found-back" href="${V(Hc(a))}" @click="${e=>Ug(e,a)}"
                   style="margin-top: var(--lumo-space-m, 1rem); font-weight: 500; text-decoration: none;
                          color: var(--lumo-primary-text-color, #1676f3);">← ${t.backLabel||r(`goBack`)}</a>
            `:p}
        </section>
    `},Gg=(e,t)=>{let n=e.style;return e.id&&(n&&!n.endsWith(`;`)&&(n+=`;`),n??=``,t[e.id+`.hidden`]==1&&(n+=`display: none;`)),n},Kg=(e,t)=>{let n={...e.metadata};if(e.id&&n){if(n.type==w.Button){let r=n;t[e.id+`.disabled`]==1&&(r.disabled=!0)}if(n.type==w.FormField){let r=n;t[e.id+`.disabled`]==1&&(r.disabled=!0)}}return n},J=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),qg={[w.Bpmn]:({component:e})=>Jp(e),[w.Workflow]:({component:e})=>Xp(e),[w.FormEditor]:({component:e})=>Zp(e),[w.Page]:J(Kp),[w.Div]:J(Vf),[w.Directory]:({component:e,baseUrl:t,state:n,data:r})=>zf(e,t,n,r),[w.FormLayout]:J(hd),[w.HorizontalLayout]:J(xd),[w.VerticalLayout]:J(Sd),[w.SplitLayout]:J(Cd),[w.MasterDetailLayout]:J(wd),[w.TabLayout]:J(Td),[w.AccordionLayout]:J(Ed),[w.BoardLayout]:J(jd),[w.BoardLayoutRow]:J(Md),[w.BoardLayoutItem]:J(Nd),[w.Scroller]:J(Od),[w.FullWidth]:J(kd),[w.Container]:J(Ad),[w.Form]:({container:e,component:t,baseUrl:n,state:r,data:i,appState:a,appData:o})=>{let s=t.metadata;return l`<mateu-form
            id="${t.id}"
        baseUrl="${n}"
            .component="${t}"
            .values="${r}"
            .state="${r}"
            .data="${i}"
            .appState="${a}"
            .appdata="${o}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??p}"
            >
                ${t.children?.map(t=>R(e,t,n,r,i,a,o))}
            ${s?.buttons?.map(t=>l`
               ${R(e,{id:Pa(t),metadata:t,type:C.ClientSide,slot:`buttons`},void 0,r,i,a,o)}
`)}

            </mateu-form>`},[w.Table]:({component:e,state:t,data:n})=>Hd(e,(e.id?n?.[e.id]:void 0)?.page?.content??Ud(e,t)),[w.Crud]:J(qp),[w.App]:({container:e,component:t,baseUrl:n,state:r,data:i,appState:a,appData:o})=>l`
            <mateu-app
                        id="${t.id}"
                        baseUrl="${n}"
                        .component="${t}"
                        .state="${r}"
                        .data="${i}"
                        style="${t.style}"
                        class="${t.cssClasses}"
                        .appState="${a}"
                        .appData="${o}"
            >
             ${t.children?.map(t=>R(e,t,n,r,i,a,o))}
         </mateu-app>`,[w.Element]:({container:e,component:t,state:n,data:r,appState:i,appData:a})=>tf(e,t.metadata,t,n,r,i,a),[w.FormField]:({component:e,state:t})=>Kf(e,t),[w.Text]:({component:e,state:t,data:n,appState:r,appData:i})=>rf(e,t,n,r,i),[w.Avatar]:({component:e,state:t,data:n})=>ou(e,t,n),[w.Chat]:({component:e,state:t,data:n})=>Yp(e,t,n),[w.AvatarGroup]:({component:e})=>cu(e),[w.Badge]:({component:e,state:t,data:n})=>lu(e,t,n),[w.Breadcrumbs]:({component:e})=>Ff(e),[w.Anchor]:({component:e})=>af(e),[w.Button]:({component:e,state:t,data:n})=>pf(e,t,n),[w.Card]:J(hf),[w.Chart]:({component:e})=>gf(e),[w.Icon]:({component:e})=>_f(e),[w.ConfirmDialog]:J(Sf),[w.ContextMenu]:J(qd),[w.CookieConsent]:({component:e})=>Cf(e),[w.Details]:J(wf),[w.Dialog]:({component:e,baseUrl:t,state:n,data:r,appState:i,appData:a})=>Tf(e,t,n,r,i,a),[w.Drawer]:({component:e,baseUrl:t,state:n,data:r,appState:i,appData:a})=>Ef(e,t,n,r,i,a),[w.Image]:({component:e})=>Pf(e),[w.Map]:({component:e})=>Nf(e),[w.Markdown]:({component:e})=>kf(e),[w.MicroFrontend]:({component:e})=>Of(e),[w.Notification]:({component:e})=>Af(e),[w.ProgressBar]:({component:e,state:t})=>jf(e,t),[w.Popover]:J(Mf),[w.CarouselLayout]:J(Rf),[w.Tooltip]:J(Xd),[w.MessageInput]:({component:e})=>Yd(e),[w.MessageList]:({component:e})=>Wd(e),[w.CustomField]:J(Jd),[w.MenuBar]:({container:e,component:t,baseUrl:n,state:r,data:i})=>Kd(e,t,n,r,i),[w.Grid]:({component:e,state:t})=>Hd(e,Ud(e,t)),[w.VirtualList]:J(Pd),[w.FormSection]:J(Hf),[w.FormSubSection]:J(Uf),[w.MetricCard]:({component:e})=>nm(e),[w.Scoreboard]:J(rm),[w.DashboardPanel]:J(im),[w.DashboardLayout]:J(am),[w.ResponsiveGrid]:J(ym),[w.FoldoutLayout]:J(sm),[w.ContentLayout]:J(bm),[w.HeroSection]:J(Tm),[w.EmptyState]:({component:e})=>$u(e),[w.Skeleton]:({component:e})=>ed(e),[w.Gantt]:({component:e})=>Om(e),[w.PlanningBoard]:({component:e})=>Lm(e),[w.Kanban]:({component:e})=>zm(e),[w.Timeline]:({component:e})=>Vm(e),[w.ProgressSteps]:({component:e})=>Um(e),[w.Stat]:({component:e})=>Gm(e),[w.Calendar]:({component:e})=>lh(e),[w.PricingTable]:({component:e})=>dh(e),[w.OrgChart]:({component:e})=>ph(e),[w.Heatmap]:({component:e})=>gh(e),[w.Funnel]:({component:e})=>vh(e),[w.TrendChart]:({component:e})=>bh(e),[w.FeatureGrid]:({component:e})=>Sh(e),[w.Testimonials]:({component:e})=>wh(e),[w.Faq]:({component:e})=>Eh(e),[w.CalloutCard]:({component:e})=>Oh(e),[w.CommentThread]:({component:e})=>Ah(e),[w.FileList]:({component:e})=>Nh(e),[w.Checklist]:({component:e})=>Fh(e),[w.ComparisonCard]:({component:e})=>Lh(e),[w.EntityHeader]:({component:e})=>Wh(e),[w.Meter]:({component:e})=>Kh(e),[w.TaskProgress]:({component:e})=>Jh(e),[w.StatusList]:({component:e})=>Xh(e),[w.BulletedList]:({component:e})=>Qh(e),[w.ActionPanel]:({component:e})=>rg(e),[w.MatrixGrid]:({component:e})=>ug(e),[w.DropZone]:J(hg),[w.Separator]:({component:e})=>gg(e),[w.CustomComponent]:J(wg),[w.Notice]:J(Dg),[w.TaskQueue]:({component:e})=>kg(e),[w.ResourceGrid]:({component:e})=>jg(e),[w.OfferCard]:({component:e})=>Mg(e),[w.AddOnPicker]:({component:e})=>Pg(e),[w.Ledger]:({component:e})=>Ig(e),[w.PaymentPicker]:({component:e})=>Rg(e),[w.ProcessMonitor]:({component:e})=>Bg(e),[w.NotFound]:({component:e})=>Wg(e)},Jg=(e,t,n,r,i,a,o,s)=>{if(!t?.metadata)return t==null?(console.warn(`No metadata for component`,t),l`<p>No metadata for component</p>`):Jg(e,{id:ks(),metadata:t,type:C.ClientSide},n,r,i,a,o,s);let c=t.metadata.type,u={...t,style:Gg(t,i),metadata:Kg(t,i)},d=qg[c];return d?d({container:e,component:u,baseUrl:n,state:r,data:i,appState:a,appData:o,labelAlreadyRendered:s}):l`<p ${u?.slot??p}>Unknown metadata type ${c} for component ${u?.id}</p>`},Y=function(e){return e.NONE=`NONE`,e.INFO=`INFO`,e.SUCCESS=`SUCCESS`,e.WARNING=`WARNING`,e.DANGER=`DANGER`,e}({}),Yg=(e,t)=>!t||e==null||typeof e!=`string`&&typeof e!=`number`&&typeof e!=`boolean`?e:t[String(e)]??e,Xg=e=>{if(!/^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.test(e)||e.length<2)return e;let t=e.toLowerCase().replace(/_/g,` `).replace(/([a-z])(\d)/g,`$1 $2`);return t.charAt(0).toUpperCase()+t.slice(1)},Zg=(e,t,n,r,i)=>{let a=t_(e[n.path],r,i);return a?l`<span theme="badge pill ${r_(a.type)}">${a.message}</span>`:l``},Qg=new Set([`AVAILABLE`,`ACTIVE`,`RUNNING`,`SUCCEEDED`,`SUCCESS`,`OK`,`ENABLED`,`READY`,`HEALTHY`,`COMPLETED`,`DONE`,`ATTACHED`,`UP`]),$g=new Set([`PROVISIONING`,`UPDATING`,`PENDING`,`STARTING`,`STOPPING`,`IN_PROGRESS`,`TERMINATING`,`DELETING`,`CREATING`,`MOVING`,`WAITING`,`ACCEPTED`,`WARNING`,`DEGRADED`,`RESTORING`,`SCALING`]),e_=new Set([`FAILED`,`TERMINATED`,`ERROR`,`DELETED`,`STOPPED`,`DISABLED`,`UNHEALTHY`,`DOWN`,`CANCELED`,`CANCELLED`,`REJECTED`,`INACTIVE`]),t_=(e,t,n)=>{if(e==null||e===``)return;if(typeof e==`object`)return e;let r=String(e),i=n_(r,t),a=n?n[r]:void 0;return a==null?{...i,message:Xg(r)}:{...i,message:a}},n_=(e,t)=>{let n=t?t[e]??t[e.trim().toUpperCase()]:void 0,r=n?i_(n):void 0;if(r)return{type:r,message:e};let i=e.trim().toUpperCase().replace(/[\s-]+/g,`_`);return{type:Qg.has(i)?Y.SUCCESS:$g.has(i)?Y.WARNING:e_.has(i)?Y.DANGER:Y.NONE,message:e}},r_=e=>{switch(e){case Y.SUCCESS:return`success`;case Y.WARNING:return`warning`;case Y.DANGER:return`error`;case Y.NONE:return`contrast`}return``},i_=e=>{switch(String(e).trim().toLowerCase()){case`success`:return Y.SUCCESS;case`warning`:return Y.WARNING;case`danger`:case`error`:return Y.DANGER;case`info`:return Y.INFO;case`neutral`:case`none`:return Y.NONE}},a_=e=>{let t=(e.split(`.`).filter(e=>e&&!/^\d+$/.test(e)).pop()??e).replace(/[_-]+/g,` `).replace(/([a-z0-9])([A-Z])/g,`$1 $2`).replace(/([A-Z]+)([A-Z][a-z])/g,`$1 $2`).trim().toLowerCase();return t?t.charAt(0).toUpperCase()+t.slice(1):e},o_=new class{constructor(){this.handleUIIncrement=(e,t,n)=>{if(e?.messages?.forEach(e=>{tc({text:e.text,position:e.position,variant:e.variant,duration:e.duration,undoLabel:e.undoLabel,undoActionId:e.undoActionId,undoParameters:e.undoParameters},t)}),e?.banners&&e.banners.length>0&&document.dispatchEvent(new CustomEvent(`page-banners-received`,{detail:{banners:e.banners,append:e.appendBanners??!1},bubbles:!1,composed:!1})),e?.commands?.forEach(e=>{lt.next({command:e,fragment:void 0,ui:void 0,error:void 0,callbackToken:n,initiator:t})}),e?.fragments?.forEach(e=>{lt.next({command:void 0,fragment:e,ui:void 0,error:void 0,callbackToken:n,initiator:t})}),e?.appState&&(ut.value={...e.appState},t.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0}))),e?.appData){let n=e?.appData;dt.value={...e.appData,...n},t.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0}))}}}async runAction(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h={}){let g=()=>{this.runAction(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)};n||=`_no_route`,n&&n.startsWith(`/`)&&(n=n.substring(1));let _={serverSideType:s,appState:ut.value,componentState:c,parameters:l,initiatorComponentId:a,consumedRoute:r,route:`/`+n,actionId:i};d||u.dispatchEvent(new CustomEvent(`backend-called-event`,{bubbles:!0,composed:!0,detail:{}}));let v={Accept:`text/event-stream`,"Content-Type":`application/json`};Object.assign(v,Hs());let ee=Ws(!1);ee&&(v[`X-Session-Id`]=ee),fetch(t+`/mateu/v3/sse/`+n,{method:`POST`,headers:v,body:JSON.stringify(_)}).then(async e=>{let t,n=e=>{if(h.isStale?.())throw t?.cancel().catch(()=>void 0),new Zs(i,e)};if(n(`answered`),t=e.body?.pipeThrough(new TextDecoderStream).getReader(),t){let e=``;for(;;){let{value:r,done:a}=await t.read();if(a)break;e+=r;let o=e.split(`

`);e=o.pop()??``;for(let e of o){let t=e.trim();if(t){if(t.startsWith(`data:`)){n(`answered`);let e=JSON.parse(t.substring(5).trim());oc(e),f&&f(e),p||this.handleUIIncrement(e,u,m),e.messages&&e.messages.length==1&&e.messages[0].variant==`error`&&u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-failed`,{detail:{actionId:i},bubbles:!0,composed:!0}))}else{let e=t;try{let n=JSON.parse(t);e=n.message,n._embedded?.errors?.length>0&&n._embedded.errors[0].message&&(e=n._embedded.errors[0].message)}catch{}throw n(`failed`),Error(e)}}}}}d||u.dispatchEvent(new CustomEvent(`backend-succeeded-event`,{bubbles:!0,composed:!0,detail:{actionId:i}})),u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-succeeded`,{detail:{actionId:i},bubbles:!0,composed:!0}))}).catch(e=>{if(Qs(e)||h.isStale?.()){console.debug?.(`mateu: dropped a streamed answer to an action of a view no longer on screen`,i,s,t),u.dispatchEvent(new CustomEvent(`backend-cancelled-event`,{bubbles:!0,composed:!0,detail:{actionId:i}}));return}u.dispatchEvent(new CustomEvent(`backend-failed-event`,{bubbles:!0,composed:!0,detail:{actionId:i,reason:this.serialize(e),retry:g}})),u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-failed`,{detail:{actionId:i},bubbles:!0,composed:!0}))})}serialize(e){return e?.message?e:JSON.stringify(e)}},s_,c_=class extends _{static{s_=this}constructor(...e){super(...e),this.baseUrl=``,this.opened=!1,this.searchText=``}static{this.SEARCHABLE_THRESHOLD=7}connectedCallback(){super.connectedCallback(),da()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(sa()[this.selector.fieldName]??``)}currentLabel(){let e=this.currentValue();if(!e)return`—`;let t=(this.searchedOptions??this.selector.options)?.find(t=>String(t.value)===e);if(t)return t.label;let n=ca()[this.selector.fieldName];return n===void 0?e:String(n)}pick(e,t){la(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText=``,this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener(`mousedown`,this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector(`input.picker-search`)?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){let e=this.app;if(e?.serverSideType)try{let t=await uc.runAction(this.baseUrl??``,e.rootRoute??e.initialRoute??``,``,`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(let e of t?.fragments??[]){let t=e.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(t)){this.searchedOptions=t.map(e=>({value:e.value,label:e.label??String(e.value)}));return}}}catch{}}visibleOptions(){let e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(e=>e.label.toLowerCase().includes(t)):e}renderPanel(){let e=this.currentValue(),t=this.visibleOptions(),n=this.searchText!==``||t.length>s_.SEARCHABLE_THRESHOLD;return l`
            <div class="panel">
                ${n?l`
                    <input class="picker-search" type="text" placeholder="${r(`search`)}" aria-label="${r(`search`)}"
                           .value="${this.searchText}"
                           @input="${this.onSearchInput}"
                           @keydown="${e=>{e.key===`Escape`&&this.closePanel()}}"/>`:p}
                <div class="options">
                    ${e?l`
                        <div class="option option--clear" @click="${()=>this.pick(``)}">— (clear)</div>`:p}
                    ${t.map(t=>l`
                        <div class="option ${e===String(t.value)?`option--selected`:``}"
                             @click="${()=>this.pick(t.value,t.label)}">${t.label}</div>`)}
                </div>
            </div>`}render(){return this.selector?l`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                <button class="picker-button"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    ${this.currentLabel()} <span aria-hidden="true" class="caret">▾</span>
                </button>
                ${this.opened?this.renderPanel():p}
            </label>`:l``}static{this.styles=h`
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
    `}};o([n()],c_.prototype,`selector`,void 0),o([n()],c_.prototype,`app`,void 0),o([n()],c_.prototype,`baseUrl`,void 0),o([s()],c_.prototype,`opened`,void 0),o([s()],c_.prototype,`searchText`,void 0),o([s()],c_.prototype,`searchedOptions`,void 0),c_=s_=o([i(`mateu-app-context-picker`)],c_);var l_=class extends _{constructor(...e){super(...e),this.baseUrl=``,this.opened=!1,this.notifications=[],this.fetched=!1}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}updated(){!this.fetched&&this.app?.serverSideType&&(this.fetched=!0,this.refresh())}unreadCount(){return this.notifications.filter(e=>e.unread).length}async runNotificationsAction(e,t){let n=this.app;if(n?.serverSideType)try{let r=await uc.runAction(this.baseUrl??``,n.rootRoute??n.initialRoute??``,``,e,`notification-bell`,void 0,n.serverSideType,{},t,this,!0);for(let e of r?.fragments??[]){let t=e.data?._notifications;if(Array.isArray(t)){this.notifications=t;return}}}catch{}}refresh(){return this.runNotificationsAction(`_notifications-list`,{})}markRead(e){return this.runNotificationsAction(`_notifications-read`,{ids:e})}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}openPanel(){this.opened||(this.opened=!0,this.refresh(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener(`mousedown`,this.outsideClick))}closePanel(){this.detachOutsideClick(),this.opened=!1}async entryClicked(e){e.unread&&await this.markRead([e.id]);let t=e.route;if(t){if(!Fu.confirmLeave())return;this.closePanel(),this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent(`navigate-to-requested`,{detail:{route:t},bubbles:!0,composed:!0}))}}renderEntry(e){return l`
            <div role="button" tabindex="0" class="entry ${e.unread?`entry--unread`:``}"
                 @click="${()=>this.entryClicked(e)}" @keydown="${U(()=>this.entryClicked(e))}">
                <span class="unread-dot" aria-hidden="true"></span>
                <div class="entry-body">
                    <div class="entry-top">
                        <span class="entry-title">${e.title}</span>
                        ${e.when?l`<span class="entry-when">${e.when}</span>`:p}
                    </div>
                    ${e.text?l`<div class="entry-text">${e.text}</div>`:p}
                </div>
            </div>`}renderPanel(){return l`
            <div class="panel">
                <div class="entries">
                    ${this.notifications.length===0?l`
                        <div class="empty">${r(`noNotifications`)}</div>`:p}
                    ${this.notifications.map(e=>this.renderEntry(e))}
                </div>
                ${this.notifications.length>0?l`
                    <div class="footer">
                        <button class="mark-all" ?disabled="${this.unreadCount()===0}"
                                @click="${()=>this.markRead(`all`)}">${r(`markAllRead`)}</button>
                    </div>`:p}
            </div>`}render(){let e=this.unreadCount();return l`
            <div class="root">
                <button class="bell-button" data-access-key-target title="${r(`notifications`)}" aria-label="${r(`notifications`)}"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    <svg class="bell-icon" viewBox="0 0 24 24" aria-hidden="true"
                         fill="none" stroke="currentColor" stroke-width="1.8"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    ${e>0?l`<span class="badge">${e>99?`99+`:e}</span>`:p}
                </button>
                ${this.opened?this.renderPanel():p}
            </div>`}static{this.styles=h`
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
            /* the header's one icon colour (mateu-app: --mateu-header-icon-color) */
            color: var(--mateu-header-icon-color, var(--lumo-secondary-text-color, #5a6573));
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
            color: var(--lumo-secondary-text-color, #5f6b7a));
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
    
        ${z}
    `}};o([n()],l_.prototype,`app`,void 0),o([n()],l_.prototype,`baseUrl`,void 0),o([s()],l_.prototype,`opened`,void 0),o([s()],l_.prototype,`notifications`,void 0),l_=o([i(`mateu-notification-bell`)],l_);var u_=e=>{if(!e||!(`querySelectorAll`in e))return null;for(let t of e.querySelectorAll(`*`)){if(t.tagName?.toLowerCase()===`mateu-component`)return t;let e=u_(t.shadowRoot);if(e)return e}return null},d_=async(e,t,n)=>{let r=u_(t.renderRoot??t);await o_.runAction(uc,t.baseUrl??``,e.rootRoute||`_no_route`,``,n,r?.id??`app-header-action`,{},e.serverSideType??``,{},{},r??t,!0,void 0,!1,``)},f_=class extends _{constructor(...e){super(...e),this.shown=!1}createRenderRoot(){return this}connectedCallback(){if(super.connectedCallback(),!this.shown){if(typeof IntersectionObserver>`u`){this.shown=!0;return}this.observer=new IntersectionObserver(e=>{e.some(e=>e.isIntersecting)&&(this.shown=!0,this.observer?.disconnect(),this.observer=void 0)}),this.observer.observe(this)}}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observer=void 0}render(){return this.shown&&this.content?this.content():l`<div class="mateu-when-visible-placeholder" style="min-height: 1px;">${p}</div>`}};o([n({attribute:!1})],f_.prototype,`content`,void 0),o([s()],f_.prototype,`shown`,void 0),f_=o([i(`mateu-when-visible`)],f_);var p_=e=>!!e&&/[?&]_lazy=1(&|$)/.test(e),m_=e=>(e.children??[]).filter(e=>e&&e.component!==`hr`&&e.text).map(e=>{let t=(e.children??[]).filter(e=>e&&e.text&&e.component!==`hr`);return{item:e,title:String(e.text??``),description:String(e.description??``),icon:String(e.icon??``),image:String(e.image??``),navigable:t.length===0,actions:t}}),h_=e=>!!e&&e.display===`cards`&&(e.children?.length??0)>0,g_=class extends _{constructor(...e){super(...e),this.open=!1,this.outside=e=>{e.composedPath().includes(this)||(this.open=!1)},this.escape=e=>{e.key===`Escape`&&this.open&&(this.open=!1,this.renderRoot.querySelector(`.trigger`)?.focus())}}connectedCallback(){super.connectedCallback(),document.addEventListener(`click`,this.outside,!0),document.addEventListener(`keydown`,this.escape)}disconnectedCallback(){document.removeEventListener(`click`,this.outside,!0),document.removeEventListener(`keydown`,this.escape),super.disconnectedCallback()}select(e,t){t?.stopPropagation(),this.open=!1,this.onSelect?.(e)}renderIcon(e){return e.image?l`<img class="visual image" src="${e.image}" alt="" />`:e.icon&&customElements.get(`vaadin-icon`)?l`<vaadin-icon class="visual icon" icon="${e.icon}"></vaadin-icon>`:p}render(){let e=this.item;if(!e)return p;let t=m_(e);return l`
            <button class="trigger ${e.selected?`active`:``}" type="button" data-access-key-target
                    aria-haspopup="true" aria-expanded="${this.open?`true`:`false`}"
                    @click="${()=>{this.open=!this.open}}">
                ${e.text}<span class="chevron" aria-hidden="true">▾</span>
            </button>
            ${this.open?l`
                <div class="panel" role="menu" aria-label="${e.text??``}">
                    ${t.map(e=>l`
                        <div class="card ${e.navigable?`navigable`:``} ${e.item.selected?`active`:``}"
                             role="${e.navigable?`menuitem`:`group`}"
                             tabindex="${e.navigable?`0`:p}"
                             aria-label="${e.title}"
                             @click="${e.navigable?t=>this.select(e.item,t):p}"
                             @keydown="${e.navigable?t=>{(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),this.select(e.item,t))}:p}">
                            ${this.renderIcon(e)}
                            <div class="body">
                                <div class="title">${e.title}</div>
                                ${e.description?l`<div class="description">${e.description}</div>`:p}
                                ${e.actions.length?l`
                                    <div class="actions">
                                        ${e.actions.map(e=>l`
                                            <button class="action" type="button" role="menuitem"
                                                    @click="${t=>this.select(e,t)}">${e.text}</button>`)}
                                    </div>`:p}
                            </div>
                        </div>`)}
                </div>`:p}
        `}static{this.styles=h`
        :host { position: relative; display: inline-flex; }
        .trigger {
            font: inherit; background: none; border: 0; cursor: pointer; display: inline-flex; align-items: center;
            gap: 0.25rem; padding: 0.5rem 0.75rem; border-radius: var(--lumo-border-radius-m, 6px);
            color: var(--lumo-body-text-color, inherit);
        }
        .trigger:hover, .trigger[aria-expanded="true"] { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .trigger.active { font-weight: 600; }
        .trigger:focus-visible, .card:focus-visible, .action:focus-visible {
            outline: 2px solid var(--lumo-primary-color, #0b6bcb); outline-offset: 2px;
        }
        .chevron { font-size: 0.75em; opacity: 0.7; }
        .panel {
            position: absolute; top: calc(100% + 0.25rem); left: 0; z-index: 1000;
            display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: 0.5rem;
            width: min(44rem, calc(100vw - 2rem)); padding: 0.75rem; box-sizing: border-box;
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 10px);
            box-shadow: var(--lumo-box-shadow-m, 0 6px 24px rgba(0,0,0,.15));
        }
        .card {
            display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.75rem;
            border-radius: var(--lumo-border-radius-m, 6px);
        }
        .card.navigable { cursor: pointer; }
        .card.navigable:hover, .card.active { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .visual { flex: 0 0 auto; }
        .icon { width: 1.5rem; height: 1.5rem; color: var(--lumo-primary-color, #0b6bcb); }
        .image { width: 2.5rem; height: 2.5rem; object-fit: cover; border-radius: var(--lumo-border-radius-s, 4px); }
        .body { min-width: 0; }
        .title { font-weight: 600; font-size: var(--lumo-font-size-m, 1rem); }
        .description { margin-top: 0.125rem; font-size: var(--lumo-font-size-s, 0.875rem); color: var(--lumo-secondary-text-color, #555); }
        .actions { margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.25rem 0.75rem; }
        .action {
            font: inherit; font-size: var(--lumo-font-size-s, 0.875rem); background: none; border: 0; padding: 0;
            cursor: pointer; color: var(--lumo-primary-text-color, #0b6bcb);
        }
        .action:hover { text-decoration: underline; }
    `}};o([n({attribute:!1})],g_.prototype,`item`,void 0),o([n({attribute:!1})],g_.prototype,`onSelect`,void 0),o([s()],g_.prototype,`open`,void 0),g_=o([i(`mateu-card-menu`)],g_);var __=(e,t)=>e?l`<mateu-when-visible style="display: block; width: 100%;" .content="${t}"></mateu-when-visible>`:t(),v_=async(e,n,r)=>{try{await d_(e,n,r)}catch(e){tc({text:t(`actionFailed`,{error:e}),position:`bottomStart`,duration:6e3,variant:`error`},n)}},y_=(e,t)=>{let n=e.contextSelectors??[],r=e.contextActions??[];return n.length===0&&r.length===0&&!e.notificationsEnabled?p:l`${e.notificationsEnabled?l`
        <mateu-notification-bell .app="${e}" .baseUrl="${t.baseUrl??``}"></mateu-notification-bell>`:p}${n.map(n=>l`
        <mateu-app-context-picker .selector="${n}" .app="${e}" .baseUrl="${t.baseUrl??``}"></mateu-app-context-picker>`)}${r.map(n=>(n.children?.length??0)>0?l`
        <details class="mateu-nav-group" style="flex-shrink: 0;">
            <summary class="app-header-action-btn">${n.label} ▾</summary>
            <div class="mateu-nav-panel" style="right: 0; left: auto;">
                ${n.children.map(n=>l`
                    <button class="mateu-nav-item" @click="${()=>n.actionId&&v_(e,t,n.actionId)}">${n.label}</button>`)}
            </div>
        </details>`:l`
        <button class="app-header-action-btn" style="flex-shrink: 0;"
            @click="${()=>n.actionId&&v_(e,t,n.actionId)}" title="${n.label}">${n.icon?B(n.icon):p}${n.label}</button>`)}`},b_=(e,t)=>l`
    <button class="mateu-nav-item ${e.selected?`mateu-nav-item--active`:``} ${e.className??``}"
            ?disabled="${e.disabled}"
            title="${e.title??p}"
            @click="${()=>t(e)}">${e.text}</button>`,x_=(e,t=!0)=>l`
    <div class="m-hl" style="align-items: ${e.title?`baseline`:`center`}; min-width: 0;">
        ${e.logo?l`<img src="${e.logo}" alt="logo" height="28px" style="margin-left: ${t?`10px`:`0`}; align-self: center;">`:p}
        ${e.title?l`<h2 class="mateu-app-title" style="margin: 0 var(--lumo-space-l, 1.5rem) 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${e.title}</h2>`:p}
    </div>`,S_=`flex: 1; min-width: 0; align-items: baseline;`,C_=`m-hl mateu-app-header`,w_=(e,t,n=``)=>l`
    <nav class="mateu-nav ${n}">
        ${e.map(e=>(e.children?.length??0)>0?l`<details class="mateu-nav-group">
                       <summary class="mateu-nav-item">${e.text} ▾</summary>
                       <div class="mateu-nav-panel">
                           ${e.children.map(e=>b_(e,t))}
                       </div>
                   </details>`:b_(e,t))}
    </nav>`,T_=(e,t,n)=>{let r=e=>L.get()?.renderTopNav?.(e,t,n)??w_(e,t,n);if(!e.some(h_))return r(e);let i=[],a=[];for(let n of e)h_(n)?(a.length&&i.push(r(a)),a=[],i.push(l`<mateu-card-menu .item=${n} .onSelect=${t}></mateu-card-menu>`)):a.push(n);return a.length&&i.push(r(a)),l`<div class="mateu-nav-with-cards" style="display: flex; align-items: center; flex-wrap: wrap; min-width: 0;">${i}</div>`},E_=(e,t)=>{let n=[{text:`☰`,children:e,className:`mateu-menu-button-root`,"aria-label":r(`menu`)}];return L.get()?.renderTopNav?.(n,t,`menu-button`)??w_(n,t,`menu-button`)},D_=(e,t)=>n=>t.call(e,{detail:{value:n}}),O_=(e,t)=>e.backRoute?l`
        <a href="${V(Hc(e.backRoute))}" class="mateu-back-link"
           style="align-self: center; margin-left: 10px; white-space: nowrap; font-size: var(--lumo-font-size-s, .875rem);"
           @click="${n=>{n.preventDefault(),Fu.confirmLeave()&&_u(t,e.backRoute)}}">← ${e.backLabel??r(`back`)}</a>`:p,k_=e=>L.get()?.renderHeaderIconButton?.(e)??l`
        <button class="app-chrome-icon-btn ${e.cssClasses??``}" @click="${e.onClick}"
            title="${e.title??e.label}" aria-label="${e.label}"
            aria-pressed="${e.pressed===void 0?p:String(e.pressed)}"
            aria-expanded="${e.expanded===void 0?p:String(e.expanded)}"
            aria-controls="${e.controls??p}">
            ${B(e.icon,`width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem); color: currentColor;`)}
        </button>`,A_=(e,t)=>e.themeToggle?k_({icon:t.isDark?`vaadin:sun-o`:`vaadin:moon-o`,label:r(t.isDark?`lightMode`:`darkMode`),cssClasses:`mateu-theme-toggle`,onClick:()=>t.toggleTheme()}):p,j_=(e,t)=>e.mobileQr?k_({icon:`vaadin:qrcode`,label:r(`openOnMobile`),cssClasses:`mateu-mobile-qr`,onClick:()=>{be(async()=>{let{openMobileQrDialog:e}=await import(`./mateu-mobile-qr-dialog-CZLzAlAE.js`);return{openMobileQrDialog:e}},__vite__mapDeps([0,1,2]),import.meta.url).then(({openMobileQrDialog:n})=>n({appTitle:e.title,baseUrl:t.baseUrl??``}))}}):p,M_=(e,t)=>e.sseUrl?k_({icon:`vaadin:comments-o`,label:r(`chat`),title:r(t.chatOpen?`closeChat`:`openChat`),pressed:!!t.chatOpen,cssClasses:`mateu-chat-toggle`+(t.chatOpen?` mateu-chat-toggle--open`:``),onClick:()=>t.showHideIa()}):p,N_=(e,t)=>l`
    ${M_(e,t)}
    <slot name="widgets"></slot>
    ${y_(e,t)}${j_(e,t)}${A_(e,t)}`,P_=(e,t,n,r)=>e.sseUrl?l`<mateu-chat slot="${t.chatOpen?`detail`:`detail-hidden`}" sseurl="${e.sseUrl}" .label="${e.askLabel}" .mcpUrl="${e.mcpUrl}" .uploadUrl="${e.uploadUrl}" .menu="${e.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:n,appData:r,componentState:t.state,componentData:t.data})}" @navigation-requested="${t.updateRoute}" @close-requested="${t.showHideIa}"></mateu-chat>`:p,F_=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},I_=(e,t,n)=>{let r=L_(e,t,n),i=X(t,n);return r==`list`||r==i?`new`:r},L_=(e,t,n)=>{let r=e?._route;if(r!=null&&(r===``||r.startsWith(`/`))){let e=n.homeRoute??``,i=e.indexOf(`?`),a=i>=0?e.substring(i+1):``,o=X(t,n)+r;return a?o+(o.indexOf(`?`)>=0?`&`:`?`)+a:o}return t.selectedRoute?t.selectedRoute:n.homeRoute},X=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,Z=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:e.baseUrl||t.homeBaseUrl,Q=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,$=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,R_=(e,t)=>`ux_`+((X(e,t)||`root`)+`|`+(Q(e,t)??``)).replace(/[^a-zA-Z0-9]/g,`_`),z_=e=>k_({icon:e.sectionsOpen?`lumo:cross`:`lumo:menu`,label:r(`sections`),expanded:!!e.sectionsOpen,controls:`mateu-sections-panel`,cssClasses:`mateu-sections-toggle`+(e.sectionsOpen?` mateu-sections-toggle--open`:``),onClick:()=>{e.sectionsOpen=!e.sectionsOpen}}),B_=(e,t,n)=>n.sectionsOpen?l`
    <div class="mateu-sections-scrim" @click="${()=>{n.sectionsOpen=!1}}"></div>
    <nav class="mateu-sections-panel" id="mateu-sections-panel" aria-label="${r(`sections`)}"
         @keydown="${e=>{e.key===`Escape`&&(n.sectionsOpen=!1)}}">
        ${e.filter(e=>!e.separator&&e.visible!==!1).map(e=>l`
            <button class="mateu-section-link ${e===t?`mateu-section-link--active`:``} ${e.unavailable?`mateu-nav-unavailable`:``}"
                    aria-current="${e===t?`page`:p}"
                    title="${e.unavailable?e.description??p:p}"
                    @click="${()=>n.selectSection(e)}">
                ${e.icon?B(e.icon,`width: var(--lumo-icon-size-s, 1.125rem); height: var(--lumo-icon-size-s, 1.125rem); flex-shrink: 0;`):p}
                <span>${e.label}</span>
            </button>`)}
    </nav>`:p,V_=(e,t)=>{if(!e)return p;let n=D_(t,t.itemSelected),r=N(e)?[]:t.mapItems(e.submenus??[],``);return l`
        <button type="button" class="mateu-app-band-title mateu-section-title"
           @click="${()=>t.selectSection(e)}">${e.label}</button>
        ${r.length>0?T_(r,n,`menu-on-top sections-band`):p}`},H_=(e,t,n,i,a,o,s)=>{let c=R_(e,t);if(t.chromeless)return l`
            <div class="app chromeless">
                <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}" style="height: 100%;">
                    <div class="m-md">
                        <div class="m-scroll" style="height: 100%;">
                            <mateu-api-caller>
                                <mateu-ux
                                        data-content-view
                                        route="${L_(i,e,t)}"
                                        id="${c}"
                                        baseUrl="${Z(e,t)}"
                                        consumedRoute="${X(e,t)}"
                                        serverSideType="${Q(e,t)}"
                                        uriPrefix="${$(e,t)}"
                                        style="width: 100%;"
                                        .appState="${o}"
                                        .appData="${s}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        </div>
                        ${P_(t,e,o,s)}
                    </div>
                </div>
                <slot></slot>
            </div>
        `;let u=e.mapItems(t.menu,e.filter?.toLowerCase()??``),d=X(e,t),f=I_(i,e,t),m=f&&f!==`new`&&f.startsWith(d+`/`)?f.substring(d.length+1).split(`/`)[0]:void 0;return l`
                    ${t.variant==ft.MEDIATOR?l`

                        ${t.layout==`SPLIT`?l`
                            <div class="m-md">
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            data-content-view
                                            route="${X(e,t)}"
                                            id="${c}"
                                            baseUrl="${Z(e,t)}"
                                            consumedRoute="${X(e,t)}"
                                            serverSideType="${Q(e,t)}"
                                            uriPrefix="${$(e,t)}"
                                            style="width: 100%;"
                                            .appState="${{...o,_splitDetailId:m}}"
                                            .appData="${s}"
                                            instant="${d}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>
                                <mateu-api-caller slot="detail">
                                    <div style="padding-left: 1rem; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            data-content-view
                                            route="${I_(i,e,t)}"
                                            id="${c}_detail"
                                            baseUrl="${Z(e,t)}"
                                            consumedRoute="${X(e,t)}"
                                            serverSideType="${Q(e,t)}"
                                            uriPrefix="${$(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${s}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>

                            </div>
                        `:__(p_(t.homeRoute),()=>l`
                            <mateu-api-caller>
                                <mateu-ux
                                        data-content-view
                                        route="${L_(i,e,t)}"
                                        id="${c}"
                                        baseUrl="${Z(e,t)}"
                                        consumedRoute="${X(e,t)}"
                                        serverSideType="${Q(e,t)}"
                                        uriPrefix="${$(e,t)}"
                                        style="width: 100%;"
                                        .appState="${o}"
                                        .appData="${s}"
                                        .initialState="${i}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `)}
                        
`:p}
            ${t.variant==ft.HAMBURGUER_MENU||t.variant==ft.HAMBURGER_MENU?l`
                <div class="mateu-app-layout m-app-layout ${t.drawerClosed?``:`drawer-open`} ${t?.cssClasses}" style="${t?.style}">
                    <header class="app-navbar">
                        <button class="drawer-toggle" title="${r(`menu`)}" aria-label="${r(`menu`)}"
                                @click="${e=>e.currentTarget.closest(`.m-app-layout`)?.classList.toggle(`drawer-open`)}">
                            ${B(`vaadin:menu`)}
                        </button>
                        <h2 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; margin: 0 .5rem;">${t.title}</h2><p style="margin: 0;">${t.subtitle}</p>
                        <div class="m-hl" style="margin-left: auto; align-items: center;">
                            ${N_(t,e)}
                        </div>
                    </header>
                    <div class="app-body">
                        <aside class="app-drawer p-s" @navigation-requested="${e.updateRoute}">
                            ${t.menu&&t.totalMenuOptions>10?l`
                                <div style="position: sticky; top: 0; z-index: 2; background: var(--lumo-base-color); padding: .25rem 0 .5rem;">
                                    <input class="drawer-search" placeholder="${r(`searchMenu`)}" aria-label="${r(`searchMenu`)}" style="width: calc(100% - 20px); margin: 0 10px;"
                                           @input="${t=>F_({detail:{value:t.target.value}},e)}">
                                </div>
                                `:p}
                            <nav class="side-nav">
                                ${e.renderSideNav(u,void 0)}
                            </nav>
                        </aside>
                        <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}" style="flex: 1; min-width: 0;">
                            <div class="m-md">
                                <div class="m-scroll" style="height: 100%;">
                                    <mateu-api-caller>
                                        <mateu-ux
                                                data-content-view
                                                route="${L_(i,e,t)}"
                                                id="${c}"
                                                baseUrl="${Z(e,t)}"
                                                consumedRoute="${X(e,t)}"
                                                serverSideType="${Q(e,t)}"
                                                uriPrefix="${$(e,t)}"
                                                style="width: 100%;"
                                                .appState="${o}"
                                                .appData="${s}"
                                                instant="${e.instant}"
                                                @navigation-requested="${e.updateRoute}"
                                        ></mateu-ux>
                                    </mateu-api-caller>
                                </div>
                                ${P_(t,e,o,s)}
                            </div>
                        </div>
                    </div>
                </div>

            `:p}
            
            ${t.variant==ft.MENU_ON_TOP?l`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <!-- TWO BANDS, like the Redwood header: band 1 = the logo on the left and the
                         widgets on the right; band 2 = the app's title, then its menu as a horizontal
                         bar. A narrow viewport folds the menu into a ☰ button next to the title. -->
                    <div class="m-hl mateu-app-band1"
                            style="width: 100%; height: 3.5rem; flex-shrink: 0; align-items: center; background-color: var(--lumo-base-color);"
                            @navigation-requested="${e.updateRoute}">
                    <div class="${C_}" style="${S_}" theme="spacing">
                        <button type="button" @click="${()=>e.goHome()}" class="mateu-app-brand" aria-label="${t.title||r(`home`)}" style="text-decoration: none; color: inherit;">
                        ${x_({...t,title:``},!1)}
                        </button>
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${N_(t,e)}
                        </div>
                    </div>
                    </div>
                    <nav class="mateu-app-band2" aria-label="${t.title||r(`menu`)}"
                            @navigation-requested="${e.updateRoute}">
                        <div class="mateu-app-menu-button">
                            ${E_(u,D_(e,e.itemSelected))}
                        </div>
                        ${t.title?l`<button type="button" @click="${()=>e.goHome()}" class="mateu-app-band-title">${t.title}</button>`:p}
                        ${(()=>{let t=D_(e,e.itemSelected);return T_(u,t,`menu-on-top menu-band`)})()}
                    </nav>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div role="main" class="m-scroll mateu-content-gutter" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${L_(i,e,t)}"
                                            id="${c}"
                                            baseUrl="${Z(e,t)}"
                                            consumedRoute="${X(e,t)}"
                                            serverSideType="${Q(e,t)}"
                                            uriPrefix="${$(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${s}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${P_(t,e,o,s)}
                        </div>
                    </div>
                </div>

            `:p}

            ${t.variant==ft.HAMBURGER_SECTIONS?(()=>{let n=e.activeSectionOf(t.menu);return l`
                <div class="m-vl mateu-sections-shell" style="width: 100%; height: 100vh; overflow: hidden; position: relative;">
                    <div class="m-hl mateu-app-band1"
                            style="width: 100%; height: 3.5rem; flex-shrink: 0; align-items: center; background-color: var(--lumo-base-color);"
                            @navigation-requested="${e.updateRoute}">
                    <div class="${C_}" style="${S_}" theme="spacing">
                        ${z_(e)}
                        <button type="button" @click="${()=>{e.sectionsOpen=!1,e.goHome()}}" class="mateu-app-brand" aria-label="${t.title||r(`home`)}" style="text-decoration: none; color: inherit;">
                        ${x_(t,!1)}
                        </button>
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${N_(t,e)}
                        </div>
                    </div>
                    </div>
                    <nav class="mateu-app-band2 mateu-section-band ${n?``:`mateu-section-band--empty`}"
                            aria-label="${n?.label||t.title||r(`menu`)}" ?inert="${!n}"
                            @navigation-requested="${e.updateRoute}">
                        ${V_(n,e)}
                    </nav>
                    ${B_(t.menu??[],n,e)}
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div role="main" class="m-scroll mateu-content-gutter" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${L_(i,e,t)}"
                                            id="${c}"
                                            baseUrl="${Z(e,t)}"
                                            consumedRoute="${X(e,t)}"
                                            serverSideType="${Q(e,t)}"
                                            uriPrefix="${$(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${s}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${P_(t,e,o,s)}
                        </div>
                    </div>
                </div>
            `})():p}

            ${t.variant==ft.TILES?l`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            @navigation-requested="${e.updateRoute}">
                    <div class="${C_}" style="${S_}" theme="spacing">
                        <button type="button" @click="${()=>{e.goHome(),e.tilesMenuOption=null}}" class="mateu-app-brand" aria-label="${t.title||r(`home`)}" style="text-decoration: none; color: inherit;">
                        ${x_(t)}
                        </button>
                        ${w_(e.mapItemsForTiles(t.menu),D_(e,e.itemSelectedTiles),`menu-on-top`)}
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${N_(t,e)}
                        </div>
                    </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):l`
                        <div class="m-md">
                            <div role="main" class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${L_(i,e,t)}"
                                            id="${c}"
                                            baseUrl="${Z(e,t)}"
                                            consumedRoute="${X(e,t)}"
                                            serverSideType="${Q(e,t)}"
                                            uriPrefix="${$(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${s}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${P_(t,e,o,s)}
                        </div>
                        `}
                    </div>
                </div>
            `:p}

            ${t.variant==ft.RAIL?l`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):p}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <div class="m-md">
                            <div role="main" class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${L_(i,e,t)}"
                                            id="${c}"
                                            baseUrl="${Z(e,t)}"
                                            consumedRoute="${X(e,t)}"
                                            serverSideType="${Q(e,t)}"
                                            uriPrefix="${$(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${s}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${P_(t,e,o,s)}
                        </div>
                    </div>
                </div>
            `:p}

            ${t.variant==ft.MENU_ON_LEFT?l`

                <div class="m-hl">
                    <div class="m-scroll" style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <div class="m-vl"
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(t=>e.renderOptionOnLeftMenu(t))}
                            ${M_(t,e)}${y_(t,e)}${A_(t,e)}
                        </div>
                    </div>
                    <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${L_(i,e,t)}"
                                            id="${c}"
                                            baseUrl="${Z(e,t)}"
                                            consumedRoute="${X(e,t)}"
                                            serverSideType="${Q(e,t)}"
                                            uriPrefix="${$(e,t)}"
                                            style="width: 100%; padding: 1em;"
                                            .appState="${o}"
                                            .appData="${s}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${P_(t,e,o,s)}
                        </div>
                    </div>
                </div>


            `:p}

            ${t.variant==ft.TABS?l`
                <!--
                
                box-shadow: inset 0 -1px 0 0 var(--lumo-contrast-10pct);
                
                -->
                
                <div>
                    <div>
                        <div class="${C_}" 
                                style="width: 100%; ${S_} border-bottom: 1px solid var(--lumo-contrast-10pct);" 
                                theme="spacing"
                                @navigation-requested="${e.updateRoute}">
                            ${O_(t,e)}
                            <button type="button" @click="${()=>e.goHome()}" class="mateu-app-brand" aria-label="${t.title||r(`home`)}" style="text-decoration: none; color: inherit;">
                            ${x_(t)}
                            </button>
                            <nav class="mateu-tabs ${e.component?.cssClasses??``}" style="flex-grow: 1; min-width: 0; margin-left: 1.5rem;"
                                 role="${(t.menu?.length??0)<2?p:`tablist`}">
                                ${(t.menu?.length??0)<2?p:t.menu.map((n,r)=>l`
                                <button type="button" role="tab"
                                        aria-selected="${r===e.getSelectedIndex(t.menu)?`true`:`false`}"
                                        class="mateu-tab ${r===e.getSelectedIndex(t.menu)?`mateu-tab--active`:``}"
                                        @click="${()=>e.selectRoute(n.consumedRoute,n.route,n.actionId,n.baseUrl,n.serverSideType,n.uriPrefix,n.rules)}"
                                >${n.label}</button>`)}
                            </nav>
                            <div class="m-hl mateu-app-widgets" style="align-items: center;">
                                ${N_(t,e)}
                            </div>
                        </div>
                    </div>
                    <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${L_(i,e,t)}"
                                            id="${c}"
                                            baseUrl="${Z(e,t)}"
                                            consumedRoute="${X(e,t)}"
                                            serverSideType="${Q(e,t)}"
                                            uriPrefix="${$(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${s}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${P_(t,e,o,s)}
                        </div>
                    </div>
                </div>
            
            `:p}

            ${t.fabs?.map((t,n)=>l`
                <button class="app-fab" style="${pp(n)}" ${Tp(`shell`,n)} aria-label="${t.label}"
                    @click="${()=>e.runAction(t.actionId)}"
                    title="${t.label}">
                    ${B(t.icon)}
                </button>
            `)}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},U_=class{renderFilterBar(e,t,n,r,i,a,o,s){let c=t?.metadata;return l`
            <mateu-filter-bar
                .metadata="${c}"
                @search-requested="${e.search}"
                @value-changed="${t=>{let{fieldId:n,value:r}=t.detail;e.state={...e.state,[n]:r}}}"
                @filter-reset-requested="${t=>{let{fieldIds:n}=t.detail,r={};n.forEach(e=>{r[e]=void 0}),r.searchText=void 0,e.state={...e.state,...r}}}"
                .state="${e.state}"
                .data="${i}"
                .appState="${a}"
                .appData="${o}"
                ?searchOnly="${s??!1}"
            >
                ${c?.header?.map(t=>R(e,t,n,r,i,a,o))}
            </mateu-filter-bar>
        `}renderPagination(e,t){return l`
        <mateu-pagination
                @page-changed="${e.pageChanged}"
                @fetch-more-elements="${e.fetchMoreElements}"
                .totalElements="${e.data[t?.id]?.page?.totalElements??0}"
                .pageSize="${e.data[t?.id]?.page?.pageSize??10}"
                data-testid="pagination"
                .pageNumber="${e.data[t?.id]?.page?.pageNumber??0}"
        ></mateu-pagination>
        `}renderTableComponent(e,t,n,r,i,a,o){return Hd(t,(e.data?.[e.id])?.page?.content??[],r[t?.id]?.emptyStateMessage)}rendererName(){return this.constructor?.name??`unknown`}supportedClientSideTypes(){}renderClientSideComponent(e,t,n,r,i,a,o,s){let c=t?.metadata?.type??t?.type,l=Object.values(w).includes(c)?c:void 0;return yg(this.supportedClientSideTypes(),l)?Cg(t,l,this.rendererName()):Jg(e,t,n,r,i,a,o,s)}renderAppComponent(e,t,n,r,i,a,o){return H_(e,t?.metadata,n,r,i,a,o)}};export{du as $,Fa as $t,cd as A,Hs as At,qu as B,os as Bt,lf as C,ec as Ct,sf as D,Js as Dt,of as E,Xs as Et,id as F,ws as Ft,Fu as G,Ao as Gt,Hu as H,Qo as Ht,fd as I,bs as It,vu as J,co as Jt,ku as K,Eo as Kt,sd as L,xs as Lt,dd as M,Ms as Mt,ud as N,ks as Nt,V as O,Gs as Ot,rd as P,Ds as Pt,R as Q,ka as Qt,Qu as R,ss as Rt,Qf as S,tc as St,cf as T,Qs as Tt,Uu as U,Oo as Ut,Ku as V,hs as Vt,z as W,Do as Wt,pu as X,Qa as Xt,gu as Y,$a as Yt,hu as Z,ja as Zt,Ep as _,de as _n,_c as _t,Zg as a,pa as an,Ql as at,Jf as b,re as bn,jc as bt,Jg as c,dt as cn,P as ct,U as d,be as dn,al as dt,Ea as en,L as et,qp as f,x as fn,Wc as ft,Tp as g,ae as gn,Ac as gt,hp as h,se as hn,Pc as ht,r_ as i,xa as in,ql as it,ld as j,Ws as jt,zd as k,qs as kt,Gg as l,ut as ln,sl as lt,pp as m,fe as mn,Bc as mt,o_ as n,Ta as nn,$l as nt,t_ as o,w as on,Jl as ot,Kp as p,ge as pn,Hc as pt,_u as q,uo as qt,a_ as r,Ca as rn,eu as rt,Yg as s,C as sn,ru as st,U_ as t,Da as tn,su as tt,dg as u,lt as un,ol as ut,Vp as v,he as vn,gc as vt,uf as w,Ys as wt,Yf as x,te as xn,uc as xt,ap as y,pe as yn,N as yt,B as z,es as zt};