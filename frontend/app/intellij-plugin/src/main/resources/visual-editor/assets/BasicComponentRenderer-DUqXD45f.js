const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./mateu-mobile-qr-dialog-BXagoDAp.js","./focusTrap-U7R8_AQu.js","./lit-Ca8Nedot.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-hePW80VL.js";import{a as t,c as n,i as r,l as i,n as a,o,s,t as c}from"./focusTrap-U7R8_AQu.js";import{a as l,c as u,h as d,l as f,n as p,o as m,p as h,s as g,t as _}from"./lit-Ca8Nedot.js";import{t as v}from"./purify.es-DmVU2mR8.js";var ee=(e,t,n)=>(n.configurable=!0,n.enumerable=!0,Reflect.decorate&&typeof t!=`object`&&Object.defineProperty(e,t,n),n);function te(e,t){return(n,r,i)=>{let a=t=>t.renderRoot?.querySelector(e)??null;if(t){let{get:e,set:t}=typeof r==`object`?n:i??(()=>{let e=Symbol();return{get(){return this[e]},set(t){this[e]=t}}})();return ee(n,r,{get(){let n=e.call(this);return n===void 0&&(n=a(this),(n!==null||this.hasUpdated)&&t.call(this,n)),n}})}return ee(n,r,{get(){return a(this)}})}}function ne(e){let t=``;for(let n of e)switch(n){case`"`:t+=`\\"`;break;case`\\`:t+=`\\\\`;break;case`
`:t+=`\\n`;break;case`\r`:t+=`\\r`;break;case`	`:t+=`\\t`;break;case`\b`:t+=`\\b`;break;case`\f`:t+=`\\f`;break;default:t+=n<` `?`\\u`+n.charCodeAt(0).toString(16).padStart(4,`0`):n}return t}function re(e){if(typeof e==`string`)return ne(e);if(Array.isArray(e))return e.map(re);if(e&&typeof e==`object`){let t={};for(let[n,r]of Object.entries(e))t[n]=re(r);return t}return e}function ie(e){return e?Object.entries(e).some(([e,t])=>e.toLowerCase()===`content-type`&&(t??``).toLowerCase().includes(`json`)):!1}var y=[],ae=new Map,oe=e=>{y=Array.isArray(e)?e:[]},se=(e,t)=>{e&&(Array.isArray(t)&&t.length>0?ae.set(e,t):ae.delete(e))},ce=e=>{if(!e)return;let t=y.find(t=>t.name===e);if(t)return t;for(let t of ae.values()){let n=t.find(t=>t.name===e);if(n)return n}},le=()=>y,ue=new Set,de=e=>{let t=e.then(()=>void 0,()=>void 0).finally(()=>{ue.delete(t)});ue.add(t)},b=()=>Promise.all([...ue]).then(()=>void 0),x=e=>e==null||e===``,fe=e=>{if(!e?.ref)return e;let t=ce(e.ref);if(!t?.source)return console.warn(`mateu: no REST source named "${e.ref}" in the app's catalogue`),e;let n=t.source;return{...e,url:x(e.url)?n.url:e.url,method:x(e.method)?n.method:e.method,headers:e.headers&&Object.keys(e.headers).length>0?e.headers:n.headers,body:x(e.body)?n.body:e.body,itemsPath:x(e.itemsPath)?n.itemsPath:e.itemsPath,valuePath:x(e.valuePath)?n.valuePath:e.valuePath,labelPath:x(e.labelPath)?n.labelPath:e.labelPath,proxy:e.proxy||n.proxy,sample:e.sample!==void 0&&e.sample!==null?e.sample:t.sample??n.sample}},pe=!1,me=e=>{pe=!!e},he=e=>{if(!pe||!e)return;let t=fe(e);return t?.sample===null?void 0:t?.sample},S=e=>he(e)!==void 0,ge=e=>!!e&&!!fe(e)?.proxy&&!S(e),C=(e,t)=>{let n=ce(e?.ref)?.fields?.[t];return n&&n!==``?n:t},_e=e=>ce(e?.ref)?.totalPath||void 0,ve=h`
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
`,w=h`
    :where(a:any-link) {
        color: var(--mateu-link-color, var(--lumo-primary-text-color, #1676f3));
    }
`,ye=`modulepreload`,be=function(e,t){return new URL(e,t).href},xe={},Se=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=be(t,n),t=s(t),t in xe)return;xe[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:ye,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},Ce=function(e,t){return Ce=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},Ce(e,t)};function we(e,t){if(typeof t!=`function`&&t!==null)throw TypeError(`Class extends value `+String(t)+` is not a constructor or null`);Ce(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}function Te(e){var t=typeof Symbol==`function`&&Symbol.iterator,n=t&&e[t],r=0;if(n)return n.call(e);if(e&&typeof e.length==`number`)return{next:function(){return e&&r>=e.length&&(e=void 0),{value:e&&e[r++],done:!e}}};throw TypeError(t?`Object is not iterable.`:`Symbol.iterator is not defined.`)}function Ee(e,t){var n=typeof Symbol==`function`&&e[Symbol.iterator];if(!n)return e;var r=n.call(e),i,a=[],o;try{for(;(t===void 0||t-->0)&&!(i=r.next()).done;)a.push(i.value)}catch(e){o={error:e}}finally{try{i&&!i.done&&(n=r.return)&&n.call(r)}finally{if(o)throw o.error}}return a}function De(e,t,n){if(n||arguments.length===2)for(var r=0,i=t.length,a;r<i;r++)(a||!(r in t))&&(a||=Array.prototype.slice.call(t,0,r),a[r]=t[r]);return e.concat(a||Array.prototype.slice.call(t))}function Oe(e){return typeof e==`function`}function ke(e){var t=e(function(e){Error.call(e),e.stack=Error().stack});return t.prototype=Object.create(Error.prototype),t.prototype.constructor=t,t}var Ae=ke(function(e){return function(t){e(this),this.message=t?t.length+` errors occurred during unsubscription:
`+t.map(function(e,t){return t+1+`) `+e.toString()}).join(`
  `):``,this.name=`UnsubscriptionError`,this.errors=t}});function je(e,t){if(e){var n=e.indexOf(t);0<=n&&e.splice(n,1)}}var Me=function(){function e(e){this.initialTeardown=e,this.closed=!1,this._parentage=null,this._finalizers=null}return e.prototype.unsubscribe=function(){var e,t,n,r,i;if(!this.closed){this.closed=!0;var a=this._parentage;if(a){if(this._parentage=null,Array.isArray(a))try{for(var o=Te(a),s=o.next();!s.done;s=o.next())s.value.remove(this)}catch(t){e={error:t}}finally{try{s&&!s.done&&(t=o.return)&&t.call(o)}finally{if(e)throw e.error}}else a.remove(this)}var c=this.initialTeardown;if(Oe(c))try{c()}catch(e){i=e instanceof Ae?e.errors:[e]}var l=this._finalizers;if(l){this._finalizers=null;try{for(var u=Te(l),d=u.next();!d.done;d=u.next()){var f=d.value;try{Fe(f)}catch(e){i??=[],e instanceof Ae?i=De(De([],Ee(i)),Ee(e.errors)):i.push(e)}}}catch(e){n={error:e}}finally{try{d&&!d.done&&(r=u.return)&&r.call(u)}finally{if(n)throw n.error}}}if(i)throw new Ae(i)}},e.prototype.add=function(t){if(t&&t!==this){if(this.closed)Fe(t);else{if(t instanceof e){if(t.closed||t._hasParent(this))return;t._addParent(this)}(this._finalizers=this._finalizers??[]).push(t)}}},e.prototype._hasParent=function(e){var t=this._parentage;return t===e||Array.isArray(t)&&t.includes(e)},e.prototype._addParent=function(e){var t=this._parentage;this._parentage=Array.isArray(t)?(t.push(e),t):t?[t,e]:e},e.prototype._removeParent=function(e){var t=this._parentage;t===e?this._parentage=null:Array.isArray(t)&&je(t,e)},e.prototype.remove=function(t){var n=this._finalizers;n&&je(n,t),t instanceof e&&t._removeParent(this)},e.EMPTY=(function(){var t=new e;return t.closed=!0,t})(),e}(),Ne=Me.EMPTY;function Pe(e){return e instanceof Me||e&&`closed`in e&&Oe(e.remove)&&Oe(e.add)&&Oe(e.unsubscribe)}function Fe(e){Oe(e)?e():e.unsubscribe()}var Ie={onUnhandledError:null,onStoppedNotification:null,Promise:void 0,useDeprecatedSynchronousErrorHandling:!1,useDeprecatedNextContext:!1},Le={setTimeout:function(e,t){var n=[...arguments].slice(2),r=Le.delegate;return r?.setTimeout?r.setTimeout.apply(r,De([e,t],Ee(n))):setTimeout.apply(void 0,De([e,t],Ee(n)))},clearTimeout:function(e){return(Le.delegate?.clearTimeout||clearTimeout)(e)},delegate:void 0};function Re(e){Le.setTimeout(function(){var t=Ie.onUnhandledError;if(t)t(e);else throw e})}function ze(){}var Be=(function(){return Ue(`C`,void 0,void 0)})();function Ve(e){return Ue(`E`,void 0,e)}function He(e){return Ue(`N`,e,void 0)}function Ue(e,t,n){return{kind:e,value:t,error:n}}var We=null;function Ge(e){if(Ie.useDeprecatedSynchronousErrorHandling){var t=!We;if(t&&(We={errorThrown:!1,error:null}),e(),t){var n=We,r=n.errorThrown,i=n.error;if(We=null,r)throw i}}else e()}function Ke(e){Ie.useDeprecatedSynchronousErrorHandling&&We&&(We.errorThrown=!0,We.error=e)}var qe=function(e){we(t,e);function t(t){var n=e.call(this)||this;return n.isStopped=!1,t?(n.destination=t,Pe(t)&&t.add(n)):n.destination=tt,n}return t.create=function(e,t,n){return new Ze(e,t,n)},t.prototype.next=function(e){this.isStopped?et(He(e),this):this._next(e)},t.prototype.error=function(e){this.isStopped?et(Ve(e),this):(this.isStopped=!0,this._error(e))},t.prototype.complete=function(){this.isStopped?et(Be,this):(this.isStopped=!0,this._complete())},t.prototype.unsubscribe=function(){this.closed||(this.isStopped=!0,e.prototype.unsubscribe.call(this),this.destination=null)},t.prototype._next=function(e){this.destination.next(e)},t.prototype._error=function(e){try{this.destination.error(e)}finally{this.unsubscribe()}},t.prototype._complete=function(){try{this.destination.complete()}finally{this.unsubscribe()}},t}(Me),Je=Function.prototype.bind;function Ye(e,t){return Je.call(e,t)}var Xe=function(){function e(e){this.partialObserver=e}return e.prototype.next=function(e){var t=this.partialObserver;if(t.next)try{t.next(e)}catch(e){Qe(e)}},e.prototype.error=function(e){var t=this.partialObserver;if(t.error)try{t.error(e)}catch(e){Qe(e)}else Qe(e)},e.prototype.complete=function(){var e=this.partialObserver;if(e.complete)try{e.complete()}catch(e){Qe(e)}},e}(),Ze=function(e){we(t,e);function t(t,n,r){var i=e.call(this)||this,a;if(Oe(t)||!t)a={next:t??void 0,error:n??void 0,complete:r??void 0};else{var o;i&&Ie.useDeprecatedNextContext?(o=Object.create(t),o.unsubscribe=function(){return i.unsubscribe()},a={next:t.next&&Ye(t.next,o),error:t.error&&Ye(t.error,o),complete:t.complete&&Ye(t.complete,o)}):a=t}return i.destination=new Xe(a),i}return t}(qe);function Qe(e){Ie.useDeprecatedSynchronousErrorHandling?Ke(e):Re(e)}function $e(e){throw e}function et(e,t){var n=Ie.onStoppedNotification;n&&Le.setTimeout(function(){return n(e,t)})}var tt={closed:!0,next:ze,error:$e,complete:ze},nt=(function(){return typeof Symbol==`function`&&Symbol.observable||`@@observable`})();function rt(e){return e}function it(e){return e.length===0?rt:e.length===1?e[0]:function(t){return e.reduce(function(e,t){return t(e)},t)}}var at=function(){function e(e){e&&(this._subscribe=e)}return e.prototype.lift=function(t){var n=new e;return n.source=this,n.operator=t,n},e.prototype.subscribe=function(e,t,n){var r=this,i=ct(e)?e:new Ze(e,t,n);return Ge(function(){var e=r,t=e.operator,n=e.source;i.add(t?t.call(i,n):n?r._subscribe(i):r._trySubscribe(i))}),i},e.prototype._trySubscribe=function(e){try{return this._subscribe(e)}catch(t){e.error(t)}},e.prototype.forEach=function(e,t){var n=this;return t=ot(t),new t(function(t,r){var i=new Ze({next:function(t){try{e(t)}catch(e){r(e),i.unsubscribe()}},error:r,complete:t});n.subscribe(i)})},e.prototype._subscribe=function(e){return this.source?.subscribe(e)},e.prototype[nt]=function(){return this},e.prototype.pipe=function(){return it([...arguments])(this)},e.prototype.toPromise=function(e){var t=this;return e=ot(e),new e(function(e,n){var r;t.subscribe(function(e){return r=e},function(e){return n(e)},function(){return e(r)})})},e.create=function(t){return new e(t)},e}();function ot(e){return e??Ie.Promise??Promise}function st(e){return e&&Oe(e.next)&&Oe(e.error)&&Oe(e.complete)}function ct(e){return e&&e instanceof qe||st(e)&&Pe(e)}var lt=ke(function(e){return function(){e(this),this.name=`ObjectUnsubscribedError`,this.message=`object unsubscribed`}}),ut=function(e){we(t,e);function t(){var t=e.call(this)||this;return t.closed=!1,t.currentObservers=null,t.observers=[],t.isStopped=!1,t.hasError=!1,t.thrownError=null,t}return t.prototype.lift=function(e){var t=new dt(this,this);return t.operator=e,t},t.prototype._throwIfClosed=function(){if(this.closed)throw new lt},t.prototype.next=function(e){var t=this;Ge(function(){var n,r;if(t._throwIfClosed(),!t.isStopped){t.currentObservers||=Array.from(t.observers);try{for(var i=Te(t.currentObservers),a=i.next();!a.done;a=i.next())a.value.next(e)}catch(e){n={error:e}}finally{try{a&&!a.done&&(r=i.return)&&r.call(i)}finally{if(n)throw n.error}}}})},t.prototype.error=function(e){var t=this;Ge(function(){if(t._throwIfClosed(),!t.isStopped){t.hasError=t.isStopped=!0,t.thrownError=e;for(var n=t.observers;n.length;)n.shift().error(e)}})},t.prototype.complete=function(){var e=this;Ge(function(){if(e._throwIfClosed(),!e.isStopped){e.isStopped=!0;for(var t=e.observers;t.length;)t.shift().complete()}})},t.prototype.unsubscribe=function(){this.isStopped=this.closed=!0,this.observers=this.currentObservers=null},Object.defineProperty(t.prototype,"observed",{get:function(){return this.observers?.length>0},enumerable:!1,configurable:!0}),t.prototype._trySubscribe=function(t){return this._throwIfClosed(),e.prototype._trySubscribe.call(this,t)},t.prototype._subscribe=function(e){return this._throwIfClosed(),this._checkFinalizedStatuses(e),this._innerSubscribe(e)},t.prototype._innerSubscribe=function(e){var t=this,n=this,r=n.hasError,i=n.isStopped,a=n.observers;return r||i?Ne:(this.currentObservers=null,a.push(e),new Me(function(){t.currentObservers=null,je(a,e)}))},t.prototype._checkFinalizedStatuses=function(e){var t=this,n=t.hasError,r=t.thrownError,i=t.isStopped;n?e.error(r):i&&e.complete()},t.prototype.asObservable=function(){var e=new at;return e.source=this,e},t.create=function(e,t){return new dt(e,t)},t}(at),dt=function(e){we(t,e);function t(t,n){var r=e.call(this)||this;return r.destination=t,r.source=n,r}return t.prototype.next=function(e){var t,n;(n=(t=this.destination)?.next)==null||n.call(t,e)},t.prototype.error=function(e){var t,n;(n=(t=this.destination)?.error)==null||n.call(t,e)},t.prototype.complete=function(){var e,t;(t=(e=this.destination)?.complete)==null||t.call(e)},t.prototype._subscribe=function(e){return this.source?.subscribe(e)??Ne},t}(ut);new class{constructor(){this.ui=void 0,this.loading=!1,this.config={},this.sharedData={},this.userData={},this.appData={},this.runtimeData={}}};var ft=new ut,pt={value:{}},mt={value:{}},T=function(e){return e.ServerSide=`ServerSide`,e.ClientSide=`ClientSide`,e}({}),E=function(e){return e.Page=`Page`,e.Div=`Div`,e.Element=`Element`,e.MicroFrontend=`MicroFrontend`,e.Form=`Form`,e.Crud=`Crud`,e.Result=`Result`,e.Card=`Card`,e.Directory=`Directory`,e.Stepper=`Stepper`,e.HorizontalLayout=`HorizontalLayout`,e.VerticalLayout=`VerticalLayout`,e.SplitLayout=`SplitLayout`,e.MasterDetailLayout=`MasterDetailLayout`,e.TabLayout=`TabLayout`,e.AccordionLayout=`AccordionLayout`,e.FormLayout=`FormLayout`,e.FormRow=`FormRow`,e.FormItem=`FormItem`,e.BoardLayout=`BoardLayout`,e.BoardLayoutRow=`BoardLayoutRow`,e.BoardLayoutItem=`BoardLayoutItem`,e.Scroller=`Scroller`,e.FullWidth=`FullWidth`,e.Container=`Container`,e.FormField=`FormField`,e.Table=`Table`,e.App=`App`,e.Text=`Text`,e.Avatar=`Avatar`,e.Chat=`Chat`,e.AvatarGroup=`AvatarGroup`,e.Badge=`Badge`,e.Breadcrumbs=`Breadcrumbs`,e.Anchor=`Anchor`,e.Button=`Button`,e.Chart=`Chart`,e.Icon=`Icon`,e.ConfirmDialog=`ConfirmDialog`,e.ContextMenu=`ContextMenu`,e.CookieConsent=`CookieConsent`,e.Details=`Details`,e.Dialog=`Dialog`,e.Drawer=`Drawer`,e.Image=`Image`,e.Map=`Map`,e.Markdown=`Markdown`,e.Notification=`Notification`,e.ProgressBar=`ProgressBar`,e.Popover=`Popover`,e.CarouselLayout=`CarouselLayout`,e.Tooltip=`Tooltip`,e.MessageInput=`MessageInput`,e.MessageList=`MessageList`,e.CustomField=`CustomField`,e.MenuBar=`MenuBar`,e.Grid=`Grid`,e.GridColumn=`GridColumn`,e.GridGroupColumn=`GridGroupColumn`,e.VirtualList=`VirtualList`,e.FormSection=`FormSection`,e.FormSubSection=`FormSubSection`,e.Bpmn=`Bpmn`,e.Workflow=`Workflow`,e.FormEditor=`FormEditor`,e.MetricCard=`MetricCard`,e.Scoreboard=`Scoreboard`,e.DashboardPanel=`DashboardPanel`,e.DashboardLayout=`DashboardLayout`,e.ResponsiveGrid=`ResponsiveGrid`,e.FoldoutLayout=`FoldoutLayout`,e.ContentLayout=`ContentLayout`,e.HeroSection=`HeroSection`,e.EmptyState=`EmptyState`,e.Skeleton=`Skeleton`,e.Gantt=`Gantt`,e.PlanningBoard=`PlanningBoard`,e.Kanban=`Kanban`,e.Timeline=`Timeline`,e.ProgressSteps=`ProgressSteps`,e.Stat=`Stat`,e.Calendar=`Calendar`,e.PricingTable=`PricingTable`,e.OrgChart=`OrgChart`,e.Heatmap=`Heatmap`,e.Funnel=`Funnel`,e.TrendChart=`TrendChart`,e.FeatureGrid=`FeatureGrid`,e.Testimonials=`Testimonials`,e.Faq=`Faq`,e.CalloutCard=`CalloutCard`,e.CommentThread=`CommentThread`,e.FileList=`FileList`,e.Checklist=`Checklist`,e.ComparisonCard=`ComparisonCard`,e.EntityHeader=`EntityHeader`,e.Meter=`Meter`,e.TaskProgress=`TaskProgress`,e.StatusList=`StatusList`,e.BulletedList=`BulletedList`,e.ActionPanel=`ActionPanel`,e.MatrixGrid=`MatrixGrid`,e.DropZone=`DropZone`,e.Separator=`Separator`,e.CustomComponent=`CustomComponent`,e.Notice=`Notice`,e.TaskQueue=`TaskQueue`,e.ResourceGrid=`ResourceGrid`,e.OfferCard=`OfferCard`,e.AddOnPicker=`AddOnPicker`,e.Ledger=`Ledger`,e.PaymentPicker=`PaymentPicker`,e.ProcessMonitor=`ProcessMonitor`,e.NotFound=`NotFound`,e}({}),ht=function(e){return e.HAMBURGUER_MENU=`HAMBURGUER_MENU`,e.HAMBURGER_MENU=`HAMBURGER_MENU`,e.HAMBURGER_SECTIONS=`HAMBURGER_SECTIONS`,e.MENU_ON_LEFT=`MENU_ON_LEFT`,e.MENU_ON_TOP=`MENU_ON_TOP`,e.TABS=`TABS`,e.TILES=`TILES`,e.RAIL=`RAIL`,e.AUTO=`AUTO`,e.MEDIATOR=`MEDIATOR`,e}({});function gt(e,t){return function(){return e.apply(t,arguments)}}var{toString:_t}=Object.prototype,{getPrototypeOf:vt}=Object,{iterator:yt,toStringTag:bt}=Symbol,xt=(({hasOwnProperty:e})=>(t,n)=>e.call(t,n))(Object.prototype),St=e=>typeof e==`string`&&(e===`__proto__`||e===`constructor`||e===`prototype`),Ct=(e,t,n)=>e===Object.prototype||!n&&t===null,wt=e=>{if(!Object.isExtensible(e))return!1;let t=Object.getOwnPropertyNames(e);return Object.getOwnPropertySymbols&&t.push(...Object.getOwnPropertySymbols(e)),t.every(t=>{if(St(t))return!1;let n=Object.getOwnPropertyDescriptor(e,t);return!!n&&n.configurable&&n.writable===!0})},Tt=(e,t)=>{let n=e,r=[];for(;n!=null;){if(r.indexOf(n)!==-1)return!1;r.push(n);let i=vt(n);if(Ct(n,i,n===e))return!1;if(xt(n,t))return!0;n=i}return!1},Et=(e,t)=>e!=null&&Tt(e,t)?e[t]:void 0,Dt=e=>{if(e==null||typeof e!=`object`&&typeof e!=`function`)return e;let t=vt(e);if(t===null&&wt(e))return e;let n=Object.create(null),r=Object.create(null),i=[],a=e;for(;a!=null&&i.indexOf(a)===-1;){i.push(a);let o=a===e?t:vt(a);if(Ct(a,o,a===e))break;let s=Object.getOwnPropertyNames(a);Object.getOwnPropertySymbols&&s.push(...Object.getOwnPropertySymbols(a));for(let t of s)St(t)||xt(r,t)||(n[t]=e[t],r[t]=!0);a=o}return n},Ot=(e=>t=>{let n=_t.call(t);return e[n]||(e[n]=n.slice(8,-1).toLowerCase())})(Object.create(null)),D=e=>(e=e.toLowerCase(),t=>Ot(t)===e),kt=e=>t=>typeof t===e,{isArray:At}=Array,jt=kt(`undefined`);function Mt(e){return e!==null&&!jt(e)&&e.constructor!==null&&!jt(e.constructor)&&O(e.constructor.isBuffer)&&e.constructor.isBuffer(e)}var Nt=D(`ArrayBuffer`);function Pt(e){let t;return t=typeof ArrayBuffer<`u`&&ArrayBuffer.isView?ArrayBuffer.isView(e):e&&e.buffer&&Nt(e.buffer),t}var Ft=kt(`string`),O=kt(`function`),It=kt(`number`),Lt=e=>typeof e==`object`&&!!e,Rt=e=>e===!0||e===!1,zt=e=>{if(!Lt(e))return!1;let t=vt(e);return(t===null||t===Object.prototype||vt(t)===null)&&!Tt(e,bt)&&!Tt(e,yt)},Bt=e=>{if(!Lt(e)||Mt(e))return!1;try{return Object.keys(e).length===0&&Object.getPrototypeOf(e)===Object.prototype}catch{return!1}},Vt=D(`Date`),Ht=D(`File`),Ut=e=>!!(e&&e.uri!==void 0),Wt=e=>e&&e.getParts!==void 0,Gt=D(`Blob`),Kt=D(`FileList`),qt=D(`Set`),Jt=e=>Lt(e)&&O(e.pipe);function Yt(){return typeof globalThis<`u`?globalThis:typeof self<`u`?self:typeof window<`u`?window:typeof global<`u`?global:{}}var Xt=Yt(),Zt=Xt.FormData===void 0?void 0:Xt.FormData,Qt=e=>{if(!e)return!1;if(Zt&&e instanceof Zt)return!0;let t=vt(e);if(!t||t===Object.prototype||!O(e.append))return!1;let n=Ot(e);return n===`formdata`||n===`object`&&O(e.toString)&&e.toString()===`[object FormData]`},$t=D(`URLSearchParams`),[en,tn,nn,rn]=[`ReadableStream`,`Request`,`Response`,`Headers`].map(D),an=e=>e.trim?e.trim():e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,``);function on(e,t,{allOwnKeys:n=!1}={}){if(e==null)return;let r,i;if(typeof e!=`object`&&(e=[e]),At(e))for(r=0,i=e.length;r<i;r++)t.call(null,e[r],r,e);else{if(Mt(e))return;let i=n?Object.getOwnPropertyNames(e):Object.keys(e),a=i.length,o;for(r=0;r<a;r++)o=i[r],t.call(null,e[o],o,e)}}function sn(e,t){if(Mt(e))return null;t=t.toLowerCase();let n=Object.keys(e),r=n.length,i;for(;r-->0;)if(i=n[r],t===i.toLowerCase())return i;return null}var cn=typeof globalThis<`u`?globalThis:typeof self<`u`?self:typeof window<`u`?window:global,ln=e=>!jt(e)&&e!==cn;function un(...e){let{caseless:t,skipUndefined:n}=ln(this)&&this||{},r={},i=(e,i)=>{if(i===`__proto__`||i===`constructor`||i===`prototype`)return;let a=t&&typeof i==`string`&&sn(r,i)||i,o=xt(r,a)?r[a]:void 0;zt(o)&&zt(e)?r[a]=un(o,e):zt(e)?r[a]=un({},e):At(e)?r[a]=e.slice():(!n||!jt(e))&&(r[a]=e)};for(let t=0,n=e.length;t<n;t++){let n=e[t];if(!n||Mt(n)||(on(n,i),typeof n!=`object`||At(n)))continue;let r=Object.getOwnPropertySymbols(n);for(let e=0;e<r.length;e++){let t=r[e];Sn.call(n,t)&&i(n[t],t)}}return r}var dn=(e,t,n,{allOwnKeys:r}={})=>(on(t,(t,r)=>{n&&O(t)?Object.defineProperty(e,r,{__proto__:null,value:gt(t,n),writable:!0,enumerable:!0,configurable:!0}):Object.defineProperty(e,r,{__proto__:null,value:t,writable:!0,enumerable:!0,configurable:!0})},{allOwnKeys:r}),e),fn=e=>(e.charCodeAt(0)===65279&&(e=e.slice(1)),e),pn=(e,t,n,r)=>{e.prototype=Object.create(t.prototype,r),Object.defineProperty(e.prototype,"constructor",{__proto__:null,value:e,writable:!0,enumerable:!1,configurable:!0}),Object.defineProperty(e,"super",{__proto__:null,value:t.prototype}),n&&Object.assign(e.prototype,n)},mn=(e,t,n,r)=>{let i,a,o,s={};if(t||={},e==null)return t;do{for(i=Object.getOwnPropertyNames(e),a=i.length;a-->0;)o=i[a],(!r||r(o,e,t))&&!s[o]&&(t[o]=e[o],s[o]=!0);e=n!==!1&&vt(e)}while(e&&(!n||n(e,t))&&e!==Object.prototype);return t},hn=(e,t,n)=>{e=String(e),(n===void 0||n>e.length)&&(n=e.length),n-=t.length;let r=e.indexOf(t,n);return r!==-1&&r===n},gn=e=>{if(!e)return null;if(At(e))return e;let t=e.length;if(!It(t))return null;let n=Array(t);for(;t-->0;)n[t]=e[t];return n},_n=(e=>t=>e&&t instanceof e)(typeof Uint8Array<`u`&&vt(Uint8Array)),vn=(e,t)=>{let n=(e&&e[yt]).call(e),r;for(;(r=n.next())&&!r.done;){let n=r.value;t.call(e,n[0],n[1])}},yn=(e,t)=>{let n,r=[];for(;(n=e.exec(t))!==null;)r.push(n);return r},bn=D(`HTMLFormElement`),xn=e=>e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,function(e,t,n){return t.toUpperCase()+n}),{propertyIsEnumerable:Sn}=Object.prototype,Cn=D(`RegExp`),wn=(e,t)=>{let n=Object.getOwnPropertyDescriptors(e),r={};on(n,(n,i)=>{let a;(a=t(n,i,e))!==!1&&(r[i]=a||n)}),Object.defineProperties(e,r)},Tn=e=>{wn(e,(t,n)=>{if(O(e)&&[`arguments`,`caller`,`callee`].includes(n))return!1;let r=e[n];if(O(r)){if(t.enumerable=!1,`writable`in t){t.writable=!1;return}t.set||=()=>{throw Error(`Can not rewrite read-only method '`+n+`'`)}}})},En=(e,t)=>{let n={},r=e=>{e.forEach(e=>{n[e]=!0})};return At(e)?r(e):r(String(e).split(t)),n},Dn=()=>{},On=(e,t)=>e!=null&&Number.isFinite(e=+e)?e:t;function kn(e){return!!(e&&O(e.append)&&e[bt]===`FormData`&&e[yt])}var An=e=>{let t=new WeakSet,n=e=>{if(Lt(e)){if(t.has(e))return;if(Mt(e))return e;if(!(`toJSON`in e)){t.add(e);let r;if(qt(e)){r=[];for(let t of e){let e=n(t);!jt(e)&&r.push(e)}}else r=At(e)?[]:{},on(e,(e,t)=>{let i=n(e);!jt(i)&&(r[t]=i)});return t.delete(e),r}}return e};return n(e)},jn=D(`AsyncFunction`),Mn=e=>e&&(Lt(e)||O(e))&&O(e.then)&&O(e.catch),Nn=((e,t)=>e?setImmediate:t?((e,t)=>(cn.addEventListener(`message`,({source:n,data:r})=>{n===cn&&r===e&&t.length&&t.shift()()},!1),n=>{t.push(n),cn.postMessage(e,`*`)}))(`axios@${Math.random()}`,[]):e=>setTimeout(e))(typeof setImmediate==`function`,O(cn.postMessage)),Pn=typeof queueMicrotask<`u`?queueMicrotask.bind(cn):typeof process<`u`&&process.nextTick||Nn,Fn=e=>e!=null&&O(e[yt]),k={isArray:At,isArrayBuffer:Nt,isBuffer:Mt,isFormData:Qt,isArrayBufferView:Pt,isString:Ft,isNumber:It,isBoolean:Rt,isObject:Lt,isPlainObject:zt,isEmptyObject:Bt,isReadableStream:en,isRequest:tn,isResponse:nn,isHeaders:rn,isUndefined:jt,isDate:Vt,isFile:Ht,isReactNativeBlob:Ut,isReactNative:Wt,isBlob:Gt,isRegExp:Cn,isFunction:O,isStream:Jt,isURLSearchParams:$t,isTypedArray:_n,isFileList:Kt,forEach:on,merge:un,extend:dn,trim:an,stripBOM:fn,inherits:pn,toFlatObject:mn,kindOf:Ot,kindOfTest:D,endsWith:hn,toArray:gn,forEachEntry:vn,matchAll:yn,isHTMLForm:bn,hasOwnProperty:xt,hasOwnProp:xt,hasOwnInPrototypeChain:Tt,getSafeProp:Et,toSafeFlatObject:Dt,reduceDescriptors:wn,freezeMethods:Tn,toObjectSet:En,toCamelCase:xn,noop:Dn,toFiniteNumber:On,findKey:sn,global:cn,isContextDefined:ln,isSpecCompliantForm:kn,toJSONObject:An,isAsyncFn:jn,isThenable:Mn,setImmediate:Nn,asap:Pn,isIterable:Fn,isSafeIterable:e=>e!=null&&Tt(e,yt)&&Fn(e)},In=k.toObjectSet([`age`,`authorization`,`content-length`,`content-type`,`etag`,`expires`,`from`,`host`,`if-modified-since`,`if-unmodified-since`,`last-modified`,`location`,`max-forwards`,`proxy-authorization`,`referer`,`retry-after`,`user-agent`]),Ln=e=>{let t={},n,r,i;return e&&e.split(`
`).forEach(function(e){i=e.indexOf(`:`),n=e.substring(0,i).trim().toLowerCase(),r=e.substring(i+1).trim();let a=k.hasOwnProp(t,n);!n||a&&k.hasOwnProp(In,n)||(n===`set-cookie`?a?t[n].push(r):t[n]=[r]:t[n]=a?t[n]+`, `+r:r)}),t};function Rn(e){let t=0,n=e.length;for(;t<n;){let n=e.charCodeAt(t);if(n!==9&&n!==32)break;t+=1}for(;n>t;){let t=e.charCodeAt(n-1);if(t!==9&&t!==32)break;--n}return t===0&&n===e.length?e:e.slice(t,n)}var zn=RegExp(`[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+`,`g`),Bn=RegExp(`[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+`,`g`);function Vn(e,t){return k.isArray(e)?e.map(e=>Vn(e,t)):Rn(String(e).replace(t,``))}var Hn=e=>Vn(e,zn),Un=e=>Vn(e,Bn);function Wn(e){let t=Object.create(null);return k.forEach(e.toJSON(),(e,n)=>{t[n]=Un(e)}),t}var Gn=Symbol(`internals`);function Kn(e){return e&&String(e).trim().toLowerCase()}function qn(e){return e===!1||e==null?e:k.isArray(e)?e.map(qn):Hn(String(e))}function Jn(e){let t=Object.create(null),n=/([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g,r;for(;r=n.exec(e);)t[r[1]]=r[2];return t}var Yn=/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;function Xn(e){let t=0,n=e.length;for(;t<n;){let n=e.charCodeAt(t);if(n!==9&&n!==32)break;t+=1}for(;n>t;){let t=e.charCodeAt(n-1);if(t!==9&&t!==32)break;--n}return t===0&&n===e.length?e:e.slice(t,n)}function Zn(e){let t=e.length-1;if(t<1||e.charCodeAt(0)!==34||e.charCodeAt(t)!==34)return e;let n=``;for(let r=1;r<t;r++){let i=e.charCodeAt(r);if(i===34||i===92&&(r+=1,r>=t))return e;n+=e[r]}return n}function Qn(e){let t=Object.create(null),n=String(e),r=0,i=!1,a=!1;function o(e){let i=Xn(n.slice(r,e)),a=i.indexOf(`=`);if(a<1)return;let o=Xn(i.slice(0,a));if(!Yn.test(o))return;let s=o.toLowerCase();if(s===`__proto__`||s===`constructor`||s===`prototype`)return;let c=Xn(i.slice(a+1));t[s]=Zn(c)}for(let e=0;e<n.length;e++){let t=n.charCodeAt(e);i?a?a=!1:t===92?a=!0:t===34&&(i=!1):t===34?i=!0:(t===44||t===59)&&(o(e),r=e+1)}return o(n.length),t}var $n=e=>/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());function er(e,t,n,r,i){if(k.isFunction(r))return r.call(this,t,n);if(i&&(t=n),k.isString(t)){if(k.isString(r))return t.indexOf(r)!==-1;if(k.isRegExp(r))return r.test(t)}}function tr(e){return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g,(e,t,n)=>t.toUpperCase()+n)}function nr(e,t){let n=k.toCamelCase(` `+t);[`get`,`set`,`has`].forEach(r=>{Object.defineProperty(e,r+n,{__proto__:null,value:function(e,n,i){return this[r].call(this,t,e,n,i)},configurable:!0})})}var A=class{constructor(e){e&&this.set(e)}set(e,t,n){let r=this;function i(e,t,n){let i=Kn(t);if(!i)return;let a=k.findKey(r,i);(!a||r[a]===void 0||n===!0||n===void 0&&r[a]!==!1)&&(r[a||t]=qn(e))}let a=(e,t)=>k.forEach(e,(e,n)=>i(e,n,t));if(k.isPlainObject(e)||e instanceof this.constructor)a(e,t);else if(k.isString(e)&&(e=e.trim())&&!$n(e))a(Ln(e),t);else if(k.isObject(e)&&k.isSafeIterable(e)){let n=Object.create(null),r,i;for(let t of e){if(!k.isArray(t))throw TypeError(`Object iterator must return a key-value pair`);i=t[0],k.hasOwnProp(n,i)?(r=n[i],n[i]=k.isArray(r)?[...r,t[1]]:[r,t[1]]):n[i]=t[1]}a(n,t)}else e!=null&&i(t,e,n);return this}get(e,t){if(e=Kn(e),e){let n=k.findKey(this,e);if(n){let e=this[n];if(!t)return e;if(t===!0)return Jn(e);if(k.isFunction(t))return t.call(this,e,n);if(k.isRegExp(t))return t.exec(e);throw TypeError(`parser must be boolean|regexp|function`)}}}has(e,t){if(e=Kn(e),e){let n=k.findKey(this,e);return!!(n&&this[n]!==void 0&&(!t||er(this,this[n],n,t)))}return!1}delete(e,t){let n=this,r=!1;function i(e){if(e=Kn(e),e){let i=k.findKey(n,e);i&&(!t||er(n,n[i],i,t))&&(delete n[i],r=!0)}}return k.isArray(e)?e.forEach(i):i(e),r}clear(e){let t=Object.keys(this),n=t.length,r=!1;for(;n--;){let i=t[n];(!e||er(this,this[i],i,e,!0))&&(delete this[i],r=!0)}return r}normalize(e){let t=this,n={};return k.forEach(this,(r,i)=>{let a=k.findKey(n,i);if(a){t[a]=qn(r),delete t[i];return}let o=e?tr(i):String(i).trim();o!==i&&delete t[i],t[o]=qn(r),n[o]=!0}),this}concat(...e){return this.constructor.concat(this,...e)}toJSON(e){let t=Object.create(null);return k.forEach(this,(n,r)=>{n!=null&&n!==!1&&(t[r]=e&&k.isArray(n)?n.join(`, `):n)}),t}[Symbol.iterator](){return Object.entries(this.toJSON())[Symbol.iterator]()}toString(){return Object.entries(this.toJSON()).map(([e,t])=>e+`: `+t).join(`
`)}getSetCookie(){let e=this.get(`set-cookie`);return k.isArray(e)?e:e==null||e===!1?[]:[e]}get[Symbol.toStringTag](){return`AxiosHeaders`}static from(e){return e instanceof this?e:new this(e)}static parseParameters(e){return Qn(e)}static concat(e,...t){let n=new this(e);return t.forEach(e=>n.set(e)),n}static accessor(e){let t=(this[Gn]=this[Gn]={accessors:{}}).accessors,n=this.prototype;function r(e){let r=Kn(e);t[r]||(nr(n,e),t[r]=!0)}return k.isArray(e)?e.forEach(r):r(e),this}};A.accessor([`Content-Type`,`Content-Length`,`Accept`,`Accept-Encoding`,`User-Agent`,`Authorization`]),k.reduceDescriptors(A.prototype,({value:e},t)=>{let n=t[0].toUpperCase()+t.slice(1);return{get:()=>e,set(e){this[n]=e}}}),k.freezeMethods(A);var rr=`[REDACTED ****]`;function ir(e){if(k.hasOwnProp(e,`toJSON`))return!0;let t=Object.getPrototypeOf(e);for(;t&&t!==Object.prototype;){if(k.hasOwnProp(t,`toJSON`))return!0;t=Object.getPrototypeOf(t)}return!1}function ar(e,t){let n=new Set(t.map(e=>String(e).toLowerCase())),r=[],i=e=>{if(typeof e!=`object`||!e||k.isBuffer(e))return e;if(r.indexOf(e)!==-1)return;e instanceof A&&(e=e.toJSON()),r.push(e);let t;if(k.isArray(e))t=[],e.forEach((e,n)=>{let r=i(e);k.isUndefined(r)||(t[n]=r)});else{if(!k.isPlainObject(e)&&ir(e))return r.pop(),e;t=Object.create(null);for(let[r,a]of Object.entries(e)){let e=n.has(r.toLowerCase())?rr:i(a);k.isUndefined(e)||(t[r]=e)}}return r.pop(),t};return i(e)}function or(e){try{return String(e)}catch{return``}}function sr(e){return e.errors.map(e=>{try{return e&&e.message?or(e.message):or(e)}catch{return``}}).filter(Boolean).join(`; `)||e.name||`AggregateError`}var j=class e extends Error{static from(t,n,r,i,a,o){let s=t.message;!s&&k.isArray(t.errors)&&t.errors.length&&(s=sr(t));let c=new e(s,n||t.code,r,i,a);return Object.defineProperty(c,"cause",{__proto__:null,value:t,writable:!0,enumerable:!1,configurable:!0}),c.name=t.name,t.status!=null&&c.status==null&&(c.status=t.status),o&&Object.assign(c,o),c}constructor(e,t,n,r,i){super(e),Object.defineProperty(this,"message",{__proto__:null,value:e,enumerable:!0,writable:!0,configurable:!0}),this.name=`AxiosError`,this.isAxiosError=!0,t&&(this.code=t),n&&(this.config=n),r&&(this.request=r),i&&(this.response=i,this.status=i.status)}toJSON(){let e=this.config,t=e&&k.hasOwnProp(e,`redact`)?e.redact:void 0,n=k.isArray(t)&&t.length>0?ar(e,t):k.toJSONObject(e);return{message:this.message,name:this.name,description:this.description,number:this.number,fileName:this.fileName,lineNumber:this.lineNumber,columnNumber:this.columnNumber,stack:this.stack,config:n,code:this.code,status:this.status}}};j.ERR_BAD_OPTION_VALUE=`ERR_BAD_OPTION_VALUE`,j.ERR_BAD_OPTION=`ERR_BAD_OPTION`,j.ECONNABORTED=`ECONNABORTED`,j.ETIMEDOUT=`ETIMEDOUT`,j.ECONNREFUSED=`ECONNREFUSED`,j.ERR_NETWORK=`ERR_NETWORK`,j.ERR_FR_TOO_MANY_REDIRECTS=`ERR_FR_TOO_MANY_REDIRECTS`,j.ERR_DEPRECATED=`ERR_DEPRECATED`,j.ERR_BAD_RESPONSE=`ERR_BAD_RESPONSE`,j.ERR_BAD_REQUEST=`ERR_BAD_REQUEST`,j.ERR_CANCELED=`ERR_CANCELED`,j.ERR_NOT_SUPPORT=`ERR_NOT_SUPPORT`,j.ERR_INVALID_URL=`ERR_INVALID_URL`,j.ERR_FORM_DATA_DEPTH_EXCEEDED=`ERR_FORM_DATA_DEPTH_EXCEEDED`;function cr(e){return k.isPlainObject(e)||k.isArray(e)}function lr(e){return k.endsWith(e,`[]`)?e.slice(0,-2):e}function ur(e,t,n){return e?e.concat(t).map(function(e,t){return e=lr(e),!n&&t?`[`+e+`]`:e}).join(n?`.`:``):t}function dr(e){return k.isArray(e)&&!e.some(cr)}var fr=k.toFlatObject(k,{},null,function(e){return/^is[A-Z]/.test(e)});function pr(e,t,n){if(!k.isObject(e))throw TypeError(`target must be an object`);t||=new FormData;let r=(e,t)=>{let r=k.getSafeProp(n,e);return k.isUndefined(r)?t:r},i=r(`metaTokens`,!0),a=r(`visitor`)||h,o=r(`dots`,!1),s=r(`indexes`,!1),c=r(`Blob`)||typeof Blob<`u`&&Blob,l=r(`maxDepth`,100),u=c&&k.isSpecCompliantForm(t),d=[];if(!k.isFunction(a))throw TypeError(`visitor must be a function`);function f(e){if(e===null)return``;if(k.isDate(e))return e.toISOString();if(k.isBoolean(e))return e.toString();if(!u&&k.isBlob(e))throw new j(`Blob is not supported. Use a Buffer instead.`);if(k.isArrayBuffer(e)||k.isTypedArray(e)){if(u&&typeof c==`function`)return new c([e]);throw new j(`Blob is not supported. Use a Buffer instead.`,j.ERR_NOT_SUPPORT)}return e}function p(e){if(e>l)throw new j(`Object is too deeply nested (`+e+` levels). Max depth: `+l,j.ERR_FORM_DATA_DEPTH_EXCEEDED)}function m(e,t){if(l===1/0)return JSON.stringify(e);let n=[];return JSON.stringify(e,function(e,r){if(!k.isObject(r))return r;for(;n.length&&n[n.length-1]!==this;)n.pop();return n.push(r),p(t+n.length-1),r})}function h(e,n,r){let a=e;if(k.isReactNative(t)&&k.isReactNativeBlob(e))return t.append(ur(r,n,o),f(e)),!1;if(e&&!r&&typeof e==`object`){if(k.endsWith(n,`{}`))n=i?n:n.slice(0,-2),e=m(e,1);else if(k.isArray(e)&&dr(e)||(k.isFileList(e)||k.endsWith(n,`[]`))&&(a=k.toArray(e)))return n=lr(n),a.forEach(function(e,r){!(k.isUndefined(e)||e===null)&&t.append(s===!0?ur([n],r,o):s===null?n:n+`[]`,f(e))}),!1}return cr(e)?!0:(t.append(ur(r,n,o),f(e)),!1)}let g=Object.assign(fr,{defaultVisitor:h,convertValue:f,isVisitable:cr});function _(e,n,r=0){if(!k.isUndefined(e)){if(p(r),d.indexOf(e)!==-1)throw Error(`Circular reference detected in `+n.join(`.`));d.push(e),k.forEach(e,function(e,i){(!(k.isUndefined(e)||e===null)&&a.call(t,e,k.isString(i)?i.trim():i,n,g))===!0&&_(e,n?n.concat(i):[i],r+1)}),d.pop()}}if(!k.isObject(e))throw TypeError(`data must be an object`);return _(e),t}function mr(e){let t={"!":`%21`,"'":`%27`,"(":`%28`,")":`%29`,"~":`%7E`,"%20":`+`};return encodeURIComponent(e).replace(/[!'()~]|%20/g,function(e){return t[e]})}function hr(e,t){this._pairs=[],e&&pr(e,this,t)}var gr=hr.prototype;gr.append=function(e,t){this._pairs.push([e,t])},gr.toString=function(e){let t=e?t=>e.call(this,t,mr):mr;return this._pairs.map(function(e){return t(e[0])+`=`+t(e[1])},``).join(`&`)};function _r(e){return encodeURIComponent(e).replace(/%3A/gi,`:`).replace(/%24/g,`$`).replace(/%2C/gi,`,`).replace(/%20/g,`+`)}function vr(e,t,n){if(!t)return e;e||=``;let r=k.isFunction(n)?{serialize:n}:n,i=k.getSafeProp(r,`encode`)||_r,a=k.getSafeProp(r,`serialize`),o;if(o=a?a(t,r):k.isURLSearchParams(t)?t.toString():new hr(t,r).toString(i),o){let t=e.indexOf(`#`);t!==-1&&(e=e.slice(0,t)),e+=(e.indexOf(`?`)===-1?`?`:`&`)+o}return e}var yr=Symbol(`internals`);function br(e){return e?e.length:0}function xr(e){if(e)for(;e.length&&e[e.length-1]===null;)e.pop()}function Sr(e,t){let n=e.handlers,r=br(n);n===t.handlersRef?r!==t.handlersLength&&(r?t.handlerEntries.forEach(function(e,r){n[e.index]!==e.handler&&t.handlerEntries.delete(r)}):t.handlerEntries.clear()):(t.handlersRef=n,t.handlerEntries.clear()),t.handlersLength=r}var Cr=class{constructor(){this.handlers=[],this[yr]={handlersRef:this.handlers,handlersLength:this.handlers.length,handlerEntries:new Map,iterationDepth:0,nextId:0}}use(e,t,n){let r={fulfilled:e,rejected:t,synchronous:n?n.synchronous:!1,runWhen:n?n.runWhen:null},i=this[yr];this.handlers??=[],Sr(this,i);let a=i.nextId++;return this.handlers.push(r),i.handlerEntries.set(a,{handler:r,index:this.handlers.length-1}),i.handlersLength=this.handlers.length,a}eject(e){let t=this[yr];Sr(this,t);let n=t.handlerEntries.get(e);if(n){if(t.handlerEntries.delete(e),this.handlers[n.index]!==n.handler)return;this.handlers[n.index]=null,t.iterationDepth||(xr(this.handlers),t.handlersLength=this.handlers.length)}}clear(){this.handlers&&(this.handlers=[],Sr(this,this[yr]))}forEach(e){let t=this[yr];Sr(this,t),t.iterationDepth++;try{k.forEach(this.handlers,function(t){t!==null&&e(t)})}finally{--t.iterationDepth||(Sr(this,t),xr(this.handlers),t.handlersLength=br(this.handlers))}}},wr={silentJSONParsing:!0,forcedJSONParsing:!0,clarifyTimeoutError:!1,legacyInterceptorReqResOrdering:!0,advertiseZstdAcceptEncoding:!1,validateStatusUndefinedResolves:!0},Tr={isBrowser:!0,classes:{URLSearchParams:typeof URLSearchParams<`u`?URLSearchParams:hr,FormData:typeof FormData<`u`?FormData:null,Blob:typeof Blob<`u`?Blob:null},protocols:[`http`,`https`,`file`,`blob`,`url`,`data`]},Er=e({hasBrowserEnv:()=>Dr,hasStandardBrowserEnv:()=>kr,hasStandardBrowserWebWorkerEnv:()=>Ar,navigator:()=>Or,origin:()=>jr}),Dr=typeof window<`u`&&typeof document<`u`,Or=typeof navigator==`object`&&navigator||void 0,kr=Dr&&(!Or||[`ReactNative`,`NativeScript`,`NS`].indexOf(Or.product)<0),Ar=typeof WorkerGlobalScope<`u`&&self instanceof WorkerGlobalScope&&typeof self.importScripts==`function`,jr=Dr&&window.location.href||`http://localhost`,M={...Er,...Tr};function Mr(e,t){return pr(e,new M.classes.URLSearchParams,{visitor:function(e,t,n,r){return M.isNode&&k.isBuffer(e)?(this.append(t,e.toString(`base64`)),!1):r.defaultVisitor.apply(this,arguments)},...t})}var Nr=100;function Pr(e){if(e>Nr)throw new j(`FormData field is too deeply nested (`+e+` levels). Max depth: `+Nr,j.ERR_FORM_DATA_DEPTH_EXCEEDED)}function Fr(e){let t=[],n=/[^.[\]]+|\[([^.[\]]*)]/g,r;for(;(r=n.exec(e))!==null;)Pr(t.length),t.push(r[0]===`[]`?``:r[1]||r[0]);return t}function Ir(e){let t={},n=Object.keys(e),r,i=n.length,a;for(r=0;r<i;r++)a=n[r],t[a]=e[a];return t}function Lr(e){function t(e,n,r,i){Pr(i);let a=e[i++];if(a===`__proto__`)return!0;let o=Number.isFinite(+a),s=i>=e.length;return a=!a&&k.isArray(r)?r.length:a,s?(k.hasOwnProp(r,a)?r[a]=k.isArray(r[a])?r[a].concat(n):[r[a],n]:r[a]=n,!o):((!k.hasOwnProp(r,a)||!k.isObject(r[a]))&&(r[a]=[]),t(e,n,r[a],i)&&k.isArray(r[a])&&(r[a]=Ir(r[a])),!o)}if(k.isFormData(e)&&k.isFunction(e.entries)){let n={};return k.forEachEntry(e,(e,r)=>{t(Fr(e),r,n,0)}),n}return null}var Rr=Object.freeze([`get`,`delete`,`head`,`options`,`post`,`put`,`patch`,`purge`,`link`,`unlink`,`query`]),zr=(e,t)=>e!=null&&k.hasOwnProp(e,t)?e[t]:void 0;function Br(e,t,n){if(k.isString(e))try{return(t||JSON.parse)(e),k.trim(e)}catch(e){if(e.name!==`SyntaxError`)throw e}return(n||JSON.stringify)(e)}var Vr={transitional:wr,adapter:[`xhr`,`http`,`fetch`],transformRequest:[function(e,t){let n=t.getContentType()||``,r=n.indexOf(`application/json`)>-1,i=k.isObject(e);if(i&&k.isHTMLForm(e)&&(e=new FormData(e)),k.isFormData(e))return r?JSON.stringify(Lr(e)):e;if(k.isArrayBuffer(e)||k.isBuffer(e)||k.isStream(e)||k.isFile(e)||k.isBlob(e)||k.isReadableStream(e))return e;if(k.isArrayBufferView(e))return e.buffer;if(k.isURLSearchParams(e))return t.setContentType(`application/x-www-form-urlencoded;charset=utf-8`,!1),e.toString();let a;if(i){let t=zr(this,`formSerializer`);if(n.indexOf(`application/x-www-form-urlencoded`)>-1)return Mr(e,t).toString();if((a=k.isFileList(e))||n.indexOf(`multipart/form-data`)>-1){let n=zr(this,`env`),r=n&&n.FormData;return pr(a?{"files[]":e}:e,r&&new r,t)}}return i||r?(t.setContentType(`application/json`,!1),Br(e)):e}],transformResponse:[function(e){let t=zr(this,`transitional`)||Vr.transitional,n=t&&t.forcedJSONParsing,r=zr(this,`responseType`),i=r===`json`;if(k.isResponse(e)||k.isReadableStream(e))return e;if(e&&k.isString(e)&&(n&&!r||i)){let n=!(t&&t.silentJSONParsing)&&i;try{return JSON.parse(e,zr(this,`parseReviver`))}catch(e){if(n)throw e.name===`SyntaxError`?j.from(e,j.ERR_BAD_RESPONSE,this,null,zr(this,`response`)):e}}return e}],timeout:0,xsrfCookieName:`XSRF-TOKEN`,xsrfHeaderName:`X-XSRF-TOKEN`,maxContentLength:-1,maxBodyLength:-1,env:{FormData:M.classes.FormData,Blob:M.classes.Blob},validateStatus:function(e){return e>=200&&e<300},headers:{common:{Accept:`application/json, text/plain, */*`,"Content-Type":void 0}}};k.forEach(Rr,e=>{Vr.headers[e]={}});function Hr(e,t){let n=this||Vr,r=t||n,i=A.from(r.headers),a=r.data;return k.forEach(e,function(e){a=e.call(n,a,i.normalize(),t?t.status:void 0)}),i.normalize(),a}function Ur(e){return!!(e&&e.__CANCEL__)}var Wr=class extends j{constructor(e,t,n){super(e??`canceled`,j.ERR_CANCELED,t,n),this.name=`CanceledError`,this.__CANCEL__=!0}};function Gr(e,t,n){let r=n.config.validateStatus;!n.status||!r||r(n.status)?e(n):t(new j(`Request failed with status code `+n.status,n.status>=400&&n.status<500?j.ERR_BAD_REQUEST:j.ERR_BAD_RESPONSE,n.config,n.request,n))}var Kr=/[\t\n\r]/g;function qr(e){if(typeof e!=`string`)return e;let t=0;for(;t<e.length&&e.charCodeAt(t)<=32;)t++;return e.slice(t).replace(Kr,``)}function Jr(e){let t=/^([-+\w]{1,25}):(?:\/\/)?/.exec(e);return t&&t[1]||``}function Yr(e,t){e||=10;let n=Array(e),r=Array(e),i=0,a=0,o;return t=t===void 0?1e3:t,function(s){let c=Date.now(),l=r[a];o||=c,n[i]=s,r[i]=c;let u=a,d=0;for(;u!==i;)d+=n[u++],u%=e;if(i=(i+1)%e,i===a&&(a=(a+1)%e),c-o<t)return;let f=l&&c-l;return f?Math.round(d*1e3/f):void 0}}function Xr(e,t){let n=0,r=1e3/t,i,a,o=(t,r=Date.now())=>{n=r,i=null,a&&=(clearTimeout(a),null),e(...t)};return[(...e)=>{let t=Date.now(),s=t-n;s>=r?o(e,t):(i=e,a||=setTimeout(()=>{a=null,o(i)},r-s))},()=>i&&o(i),(...e)=>o(e)]}var Zr=(e,t,n=3)=>{let r=0,i=Yr(50,250);return Xr(n=>{if(!n||!k.isNumber(n.loaded))return;let a=n.loaded,o=n.lengthComputable?n.total:void 0,s=Math.max(0,o==null?a:Math.min(a,o)),c=Math.max(0,s-r),l=i(c);r=Math.max(r,s),e({loaded:s,total:o,progress:o?s/o:void 0,bytes:c,rate:l||void 0,estimated:l&&o?(o-s)/l:void 0,event:n,lengthComputable:o!=null,[t?`download`:`upload`]:!0})},n)},Qr=(e,t)=>{let n=e!=null;return[r=>t[0]({lengthComputable:n,total:e,loaded:r}),t[1]]},$r=(e,t=k.asap)=>(...n)=>t(()=>e(...n)),ei=M.hasStandardBrowserEnv?((e,t)=>n=>(n=new URL(n,M.origin),e.protocol===n.protocol&&e.host===n.host&&(t||e.port===n.port)))(new URL(M.origin),M.navigator&&/(msie|trident)/i.test(M.navigator.userAgent)):()=>!0,ti=M.hasStandardBrowserEnv?{write(e,t,n,r,i,a,o){if(typeof document>`u`)return;let s=[`${e}=${encodeURIComponent(t)}`];k.isNumber(n)&&s.push(`expires=${new Date(n).toUTCString()}`),k.isString(r)&&s.push(`path=${r}`),k.isString(i)&&s.push(`domain=${i}`),a===!0&&s.push(`secure`),k.isString(o)&&s.push(`SameSite=${o}`),document.cookie=s.join(`; `)},read(e){if(typeof document>`u`)return null;let t=document.cookie.split(`;`);for(let n=0;n<t.length;n++){let r=t[n].replace(/^\s+/,``),i=r.indexOf(`=`);if(i!==-1&&r.slice(0,i)===e)try{return decodeURIComponent(r.slice(i+1))}catch{return r.slice(i+1)}}return null},remove(e){this.write(e,``,Date.now()-864e5,`/`)}}:{write(){},read(){return null},remove(){}};function ni(e){return typeof e==`string`&&/^([a-z][a-z\d+\-.]*:)?\/\//i.test(e)}function ri(e,t){if(!t)return e;let n=e.length;for(;n>0&&e.charCodeAt(n-1)===47;)n--;return e.slice(0,n)+`/`+t.replace(/^\/+/,``)}var ii=/^https?:(?!\/\/)/i;function ai(e){return e&&e.replace(/(^|&)([^=&]*=)?[^&]+/g,(e,t,n=``)=>`${t}${n}${rr}`)}function oi(e){let t=e.replace(/^(https?:\/{0,2})[^/?#]*@/i,`$1${rr}@`),n=t.indexOf(`#`),r=(n===-1?t:t.slice(0,n)).replace(/([?&][^=&#]*=)[^&#]*/g,`$1${rr}`);return n===-1?r:`${r}#${ai(t.slice(n+1))}`}function si(e,t){if(typeof e==`string`){let n=qr(e);if(ii.test(n))throw new j(`Invalid URL ${JSON.stringify(oi(n))}: missing "//" after protocol`,j.ERR_INVALID_URL,t)}}function ci(e,t,n,r){si(t,r);let i=!ni(t);return e&&(i||n===!1)?(si(e,r),ri(e,t)):t}var li=e=>e instanceof A?{...e}:e,ui=e=>Object.getOwnPropertySymbols&&Object.getOwnPropertyDescriptor?Object.keys(e).concat(Object.getOwnPropertySymbols(e).filter(t=>Object.getOwnPropertyDescriptor(e,t).enumerable)):Object.keys(e);function di(e,t){e||={},t||={};let n=Object.create(null);Object.defineProperty(n,"hasOwnProperty",{__proto__:null,value:Object.prototype.hasOwnProperty,enumerable:!1,writable:!0,configurable:!0});function r(e,t,n,r){return k.isPlainObject(e)&&k.isPlainObject(t)?k.merge.call({caseless:r},e,t):k.isPlainObject(t)?k.merge({},t):k.isArray(t)?t.slice():t}function i(e,t,n,i){if(!k.isUndefined(t))return r(e,t,n,i);if(!k.isUndefined(e))return r(void 0,e,n,i)}function a(e,t){if(!k.isUndefined(t))return r(void 0,t)}function o(e,t){if(!k.isUndefined(t))return r(void 0,t);if(!k.isUndefined(e))return r(void 0,e)}function s(n){let r=k.hasOwnProp(t,`transitional`)?t.transitional:void 0;if(!k.isUndefined(r)){if(k.isPlainObject(r)){if(k.hasOwnProp(r,n))return r[n]}else return}let i=k.hasOwnProp(e,`transitional`)?e.transitional:void 0;if(k.isPlainObject(i)&&k.hasOwnProp(i,n))return i[n]}function c(n,i,a){if(k.hasOwnProp(t,a))return r(n,i);if(k.hasOwnProp(e,a))return r(void 0,n)}let l={url:a,method:a,data:a,baseURL:o,transformRequest:o,transformResponse:o,paramsSerializer:o,timeout:o,timeoutErrorMessage:o,withCredentials:o,withXSRFToken:o,adapter:o,responseType:o,xsrfCookieName:o,xsrfHeaderName:o,onUploadProgress:o,onDownloadProgress:o,decompress:o,maxContentLength:o,maxBodyLength:o,beforeRedirect:o,transport:o,httpAgent:o,httpsAgent:o,cancelToken:o,socketPath:o,allowedSocketPaths:o,responseEncoding:o,validateStatus:c,headers:(e,t,n)=>i(li(e),li(t),n,!0)};return k.forEach(ui({...e,...t}),function(r){if(r===`__proto__`||r===`constructor`||r===`prototype`)return;let a=k.hasOwnProp(l,r)?l[r]:i,o=a(k.hasOwnProp(e,r)?e[r]:void 0,k.hasOwnProp(t,r)?t[r]:void 0,r);k.isUndefined(o)&&a!==c||(n[r]=o)}),k.hasOwnProp(t,`validateStatus`)&&k.isUndefined(t.validateStatus)&&s(`validateStatusUndefinedResolves`)===!1&&(k.hasOwnProp(e,`validateStatus`)?n.validateStatus=r(void 0,e.validateStatus):delete n.validateStatus),n}var fi=[`content-type`,`content-length`];function pi(e,t,n){if(n!==`content-only`){e.set(t);return}Object.entries(t||{}).forEach(([t,n])=>{fi.includes(t.toLowerCase())&&e.set(t,n)})}var mi=e=>encodeURIComponent(e).replace(/%([0-9A-F]{2})/gi,(e,t)=>String.fromCharCode(parseInt(t,16)));function hi(e){let t=di({},e),n=e=>k.hasOwnProp(t,e)?t[e]:void 0,r=n(`data`),i=n(`withXSRFToken`),a=n(`xsrfHeaderName`),o=n(`xsrfCookieName`),s=n(`headers`),c=n(`auth`),l=n(`baseURL`),u=n(`allowAbsoluteUrls`),d=n(`url`);if(t.headers=s=A.from(s),t.url=vr(ci(l,d,u,t),n(`params`),n(`paramsSerializer`)),c){let t=k.getSafeProp(c,`username`)||``,n=k.getSafeProp(c,`password`)||``;try{s.set(`Authorization`,`Basic `+btoa(t+`:`+(n?mi(n):``)))}catch(t){throw j.from(t,j.ERR_BAD_OPTION_VALUE,e)}}if(k.isFormData(r)){let e=k.getSafeProp(r,`getHeaders`);M.hasStandardBrowserEnv||M.hasStandardBrowserWebWorkerEnv||k.isReactNative(r)?s.setContentType(void 0):k.isFunction(e)&&pi(s,e.call(r),n(`formDataHeaderPolicy`))}if(M.hasStandardBrowserEnv&&(k.isFunction(i)&&(i=i(t)),i===!0||i==null&&ei(t.url))){let e=a&&o&&ti.read(o);e&&s.set(a,e)}return t}var gi=typeof XMLHttpRequest<`u`&&function(e){return new Promise(function(t,n){let r=hi(e),i=r.data,a=A.from(r.headers).normalize(),{responseType:o,onUploadProgress:s,onDownloadProgress:c}=r,l,u,d,f,p,m;function h(){f&&f(),p&&p(),r.cancelToken&&r.cancelToken.unsubscribe(l),r.signal&&r.signal.removeEventListener(`abort`,l)}let g=new XMLHttpRequest;g.open(r.method.toUpperCase(),r.url,!0),g.timeout=r.timeout;function _(i){if(!g)return;if(g.status===0&&(Jr(qr(r.url))||Jr(M.origin))!==`file`&&!(g.responseURL&&g.responseURL.startsWith(`file:`))){n(new j(`Request aborted`,j.ECONNABORTED,e,g)),h(),g=null;return}try{i?m&&m(i):p&&p()}catch(e){setTimeout(()=>{throw e})}if(!g)return;let a=A.from(`getAllResponseHeaders`in g&&g.getAllResponseHeaders());Gr(function(e){t(e),h()},function(e){n(e),h()},{data:!o||o===`text`||o===`json`?g.responseText:g.response,status:g.status,statusText:g.statusText,headers:a,config:e,request:g}),g=null}`onloadend`in g?g.onloadend=_:g.onreadystatechange=function(){!g||g.readyState!==4||g.status===0&&!(g.responseURL&&g.responseURL.startsWith(`file:`))||setTimeout(_)},g.onabort=function(){g&&=(n(new j(`Request aborted`,j.ECONNABORTED,e,g)),h(),null)},g.onerror=function(t){let r=new j(t&&t.message?t.message:`Network Error`,j.ERR_NETWORK,e,g);r.event=t||null,n(r),h(),g=null},g.ontimeout=function(){let t=r.timeout?`timeout of `+r.timeout+`ms exceeded`:`timeout exceeded`,i=r.transitional||wr;r.timeoutErrorMessage&&(t=r.timeoutErrorMessage),n(new j(t,i.clarifyTimeoutError?j.ETIMEDOUT:j.ECONNABORTED,e,g)),h(),g=null},i===void 0&&a.setContentType(null),`setRequestHeader`in g&&k.forEach(Wn(a),function(e,t){g.setRequestHeader(t,e)}),k.isUndefined(r.withCredentials)||(g.withCredentials=!!r.withCredentials),o&&o!==`json`&&(g.responseType=r.responseType),c&&([d,p,m]=Zr(c,!0),g.addEventListener(`progress`,d)),s&&g.upload&&([u,f]=Zr(s),g.upload.addEventListener(`progress`,u),g.upload.addEventListener(`loadend`,f)),(r.cancelToken||r.signal)&&(l=t=>{g&&=(n(!t||t.type?new Wr(null,e,g):t),g.abort(),h(),null)},r.cancelToken&&r.cancelToken.subscribe(l),r.signal&&(r.signal.aborted?l():r.signal.addEventListener(`abort`,l)));let v=Jr(r.url);if(v&&!M.protocols.includes(v)){n(new j(`Unsupported protocol `+v+`:`,j.ERR_BAD_REQUEST,e)),h();return}g.send(i||null)})},_i=(e,t)=>{if(e=e?e.filter(Boolean):[],!t&&!e.length)return;let n=new AbortController,r=!1,i=function(e){if(!r){r=!0,o();let t=e instanceof Error?e:this.reason;n.abort(t instanceof j?t:new Wr(t instanceof Error?t.message:t))}},a=t&&setTimeout(()=>{a=null,i(new j(`timeout of ${t}ms exceeded`,j.ETIMEDOUT))},t),o=()=>{e&&=(a&&clearTimeout(a),a=null,e.forEach(e=>{e.unsubscribe?e.unsubscribe(i):e.removeEventListener(`abort`,i)}),null)};e.forEach(e=>{if(!r){if(e.aborted){i.call(e);return}e.addEventListener(`abort`,i,{once:!0})}});let{signal:s}=n;return s.unsubscribe=()=>k.asap(o),s},vi=function*(e,t){let n=e.byteLength;if(!t||n<t){yield e;return}let r=0,i;for(;r<n;)i=r+t,yield e.slice(r,i),r=i},yi=async function*(e,t){for await(let n of bi(e))yield*vi(n,t)},bi=async function*(e){if(e[Symbol.asyncIterator]){yield*e;return}let t=e.getReader();try{for(;;){let{done:e,value:n}=await t.read();if(e)break;yield n}}finally{await t.cancel()}},xi=(e,t,n,r)=>{let i=yi(e,t),a=0,o,s=e=>{o||(o=!0,r&&r(e))};return new ReadableStream({async pull(e){try{let{done:t,value:r}=await i.next();if(t){s(),e.close();return}let o=r.byteLength;n&&n(a+=o),e.enqueue(new Uint8Array(r))}catch(e){throw s(e),e}},cancel(e){return s(e),i.return()}},{highWaterMark:2})},Si=e=>e>=48&&e<=57||e>=65&&e<=70||e>=97&&e<=102,Ci=(e,t,n)=>t+2<n&&Si(e.charCodeAt(t+1))&&Si(e.charCodeAt(t+2)),wi=e=>e<=57?e-48:(e&223)-55,Ti=e=>e>=65&&e<=90||e>=97&&e<=122||e>=48&&e<=57||e===43||e===47||e===45||e===95,Ei=e=>e===9||e===10||e===12||e===13||e===32,Di=e=>{let t=Math.floor(e/4),n=e%4;return t*3+(n===2?1:n===3?2:0)},Oi=e=>{let t=e.length,n=0;return t>0&&e.charCodeAt(t-1)===61&&(n++,t>1&&e.charCodeAt(t-2)===61&&n++),Math.floor((t-n)*3/4)},ki=e=>{let t=e.length,n=0,r=0,i=!1;for(let a=0;a<t;a++){let o=e.charCodeAt(a);if(o===37&&Ci(e,a,t)&&(o=wi(e.charCodeAt(a+1))*16+wi(e.charCodeAt(a+2)),a+=2),!Ei(o)){if(o===61){r++;continue}if(!Ti(o)||r>0){i=!0;continue}n++}}return i||r>2||r>0&&(n+r)%4!=0||n%4==1?Oi(e):Di(n)},Ai=(e,t)=>{if(!e||typeof e!=`string`||!e.startsWith(`data:`))return 0;let n=e.indexOf(`,`);if(n<0)return 0;let r=e.slice(5,n),i=e.slice(n+1);if(/;base64/i.test(r))return t(i);let a=0;for(let e=0,t=i.length;e<t;e++){let n=i.charCodeAt(e);if(n===37&&Ci(i,e,t))a+=1,e+=2;else if(n<128)a+=1;else if(n<2048)a+=2;else if(n>=55296&&n<=56319&&e+1<t){let t=i.charCodeAt(e+1);t>=56320&&t<=57343?(a+=4,e++):a+=3}else a+=3}return a};function ji(e){let t=typeof e==`string`?e.indexOf(`#`):-1;return Ai(t===-1?e:e.slice(0,t),ki)}var Mi=`1.20.0`,Ni=65536,Pi={cache:`default`,redirect:`follow`,referrer:`about:client`,referrerPolicy:``,mode:`cors`,integrity:``,keepalive:!1,priority:`auto`,window:null},{isFunction:Fi}=k,Ii=e=>encodeURIComponent(e).replace(/%([0-9A-F]{2})/gi,(e,t)=>String.fromCharCode(parseInt(t,16))),Li=e=>{if(!k.isString(e))return e;try{return decodeURIComponent(e)}catch{return e}},Ri=(e,...t)=>{try{return!!e(...t)}catch{return!1}},zi=e=>{let t=e.indexOf(`://`),n=e;return t!==-1&&(n=n.slice(t+3)),n.includes(`@`)||n.includes(`:`)},Bi=e=>{let t=k.global!==void 0&&k.global!==null?k.global:globalThis,{ReadableStream:n,TextEncoder:r}=t;e=k.merge.call({skipUndefined:!0},{Request:t.Request,Response:t.Response},e);let{fetch:i,Request:a,Response:o}=e,s=i?Fi(i):typeof fetch==`function`,c=Fi(a),l=Fi(o);if(!s)return!1;let u=s&&Fi(n),d=s&&(typeof r==`function`?(e=>t=>e.encode(t))(new r):async e=>new Uint8Array(await new a(e).arrayBuffer())),f=c&&u&&Ri(()=>{let e=!1,t=new a(M.origin,{body:new n,method:`POST`,get duplex(){return e=!0,`half`}}),r=t.headers.has(`Content-Type`);return t.body!=null&&t.body.cancel(),e&&!r}),p=l&&u&&Ri(()=>k.isReadableStream(new o(``).body)),m={stream:p&&(e=>e.body)};s&&[`text`,`arrayBuffer`,`blob`,`formData`,`stream`].forEach(e=>{!m[e]&&(m[e]=(t,n)=>{let r=t&&t[e];if(r)return r.call(t);throw new j(`Response type '${e}' is not supported`,j.ERR_NOT_SUPPORT,n)})});let h=async e=>{if(e==null)return 0;if(k.isBlob(e))return e.size;if(k.isSpecCompliantForm(e))return(await new a(M.origin,{method:`POST`,body:e}).arrayBuffer()).byteLength;if(k.isArrayBufferView(e)||k.isArrayBuffer(e))return e.byteLength;if(k.isURLSearchParams(e)&&(e+=``),k.isString(e))return(await d(e)).byteLength},g=async(e,t)=>k.toFiniteNumber(e.getContentLength())??h(t);return async e=>{let{url:t,method:n,data:s,signal:l,cancelToken:d,timeout:_,onDownloadProgress:v,onUploadProgress:ee,responseType:te,headers:ne,withCredentials:re=`same-origin`,fetchOptions:ie,maxContentLength:y,maxBodyLength:ae,maxRedirects:oe}=hi(e),se=k.isNumber(y)&&y>-1,ce=k.isNumber(ae)&&ae>-1,le=t=>k.hasOwnProp(e,t)?e[t]:void 0,ue=i||fetch;te=te?(te+``).toLowerCase():`text`;let de=_i([l,d&&d.toAbortSignal()],_),b=null,x=de&&de.unsubscribe&&(()=>{de.unsubscribe()}),fe,pe=null,me=()=>new j(`Request body larger than maxBodyLength limit`,j.ERR_BAD_REQUEST,e,b);try{let i,l=le(`auth`);if(l&&(i={username:k.getSafeProp(l,`username`)||``,password:k.getSafeProp(l,`password`)||``}),zi(t)){let e=new URL(t,M.origin);!i&&(e.username||e.password)&&(i={username:Li(e.username),password:Li(e.password)}),(e.username||e.password)&&(e.username=``,e.password=``,t=e.href)}if(i&&(ne.delete(`authorization`),ne.set(`Authorization`,`Basic `+btoa(Ii((i.username||``)+`:`+(i.password||``))))),se&&typeof t==`string`&&t.startsWith(`data:`)&&ji(t)>y)throw new j(`maxContentLength size of `+y+` exceeded`,j.ERR_BAD_RESPONSE,e,b);if(ce&&n!==`get`&&n!==`head`){let e=await h(s);if(typeof e==`number`&&isFinite(e)&&(fe=e,e>ae))throw me()}let d=ce&&(k.isReadableStream(s)||k.isStream(s)),_=(e,t,n)=>xi(e,Ni,e=>{if(ce&&e>ae)throw pe=me();t&&t(e)},n);if(f&&n!==`get`&&n!==`head`&&(ee||d)){if(fe??=await g(ne,s),fe!==0||d){let e=new a(t,{method:`POST`,body:s,duplex:`half`}),n;if(k.isFormData(s)&&(n=e.headers.get(`content-type`))&&ne.setContentType(n),e.body){let[t,n]=ee&&Qr(fe,Zr($r(ee)))||[];s=_(e.body,t,n)}}}else if(d&&!c&&u&&n!==`get`&&n!==`head`)s=_(s);else if(d&&c&&!f&&n!==`get`&&n!==`head`)throw new j(`Stream request bodies are not supported by the current fetch implementation`,j.ERR_NOT_SUPPORT,e,b);k.isString(re)||(re=re?`include`:`omit`);let he=c&&`credentials`in a.prototype;if(k.isFormData(s)){let e=ne.getContentType();e&&/^multipart\/form-data/i.test(e)&&!/boundary=/i.test(e)&&ne.delete(`content-type`)}ne.set(`User-Agent`,`axios/`+Mi,!1);let S=ie==null?ie:Object.assign(Object.create(null),ie);S&&(delete S.body,delete S.headers,delete S.method,delete S.signal,delete S.duplex,delete S.credentials);let ge=Object.assign(Object.create(null),S,{signal:de,method:n.toUpperCase(),headers:Wn(ne.normalize()),body:s,duplex:`half`,credentials:he?re:void 0});c&&(k.forEach(Pi,(e,t)=>{ge[t]===void 0&&(ge[t]=e)}),ge.signal===void 0&&(ge.signal=null),ge.body===void 0&&(ge.body=null)),oe===0&&(ge.redirect=`manual`,S&&(S.redirect=`manual`)),b=c&&new a(t,ge);let C=await(c?ue(b,S):ue(t,ge)),_e=A.from(C.headers);if(se){let t=k.toFiniteNumber(_e.getContentLength());if(t!=null&&t>y)throw new j(`maxContentLength size of `+y+` exceeded`,j.ERR_BAD_RESPONSE,e,b)}let ve=p&&(te===`stream`||te===`response`);if(p&&C.body&&(v||se||ve&&x)){let t={};[`status`,`statusText`,`headers`].forEach(e=>{t[e]=C[e]});let n=k.toFiniteNumber(_e.getContentLength()),[r,i]=v&&Qr(n,Zr($r(v),!0))||[],a=0;C=new o(xi(C.body,Ni,t=>{if(se&&(a=t,a>y))throw new j(`maxContentLength size of `+y+` exceeded`,j.ERR_BAD_RESPONSE,e,b);r&&r(t)},()=>{i&&i(),x&&x()}),t)}te||=`text`;let w=await m[k.findKey(m,te)||`text`](C,e);if(se&&!p&&!ve){let t;if(w!=null&&(typeof w.byteLength==`number`?t=w.byteLength:typeof w.size==`number`?t=w.size:typeof w==`string`&&(t=typeof r==`function`?new r().encode(w).byteLength:w.length)),typeof t==`number`&&t>y)throw new j(`maxContentLength size of `+y+` exceeded`,j.ERR_BAD_RESPONSE,e,b)}return!ve&&x&&x(),await new Promise((t,n)=>{Gr(t,n,{data:w,headers:A.from(C.headers),status:C.status,statusText:C.statusText,config:e,request:b})})}catch(t){if(x&&x(),de&&de.aborted&&de.reason instanceof j){let n=de.reason;throw n.config=e,b&&(n.request=b),t!==n&&Object.defineProperty(n,"cause",{__proto__:null,value:t,writable:!0,enumerable:!1,configurable:!0}),n}if(pe)throw b&&!pe.request&&(pe.request=b),pe;if(t instanceof j)throw b&&!t.request&&(t.request=b),t;if(t&&t.name===`TypeError`&&/Load failed|fetch/i.test(t.message)){let n=new j(`Network Error`,j.ERR_NETWORK,e,b,t&&t.response);throw Object.defineProperty(n,"cause",{__proto__:null,value:t.cause||t,writable:!0,enumerable:!1,configurable:!0}),n}throw j.from(t,t&&t.code,e,b,t&&t.response)}}},Vi=new Map,Hi=e=>{let t=e&&e.env||{},{fetch:n,Request:r,Response:i}=t,a=[r,i,n],o=a.length,s,c,l=Vi;for(;o--;)s=a[o],c=l.get(s),c===void 0&&l.set(s,c=o?new Map:Bi(t)),l=c;return c};Hi();var Ui={http:null,xhr:gi,fetch:{get:Hi}};k.forEach(Ui,(e,t)=>{if(e){try{Object.defineProperty(e,"name",{__proto__:null,value:t})}catch{}Object.defineProperty(e,"adapterName",{__proto__:null,value:t})}});var Wi=e=>`- ${e}`,Gi=e=>k.isFunction(e)||e===null||e===!1;function Ki(e,t){e=k.isArray(e)?e:[e];let{length:n}=e,r,i,a={};for(let o=0;o<n;o++){r=e[o];let n;if(i=r,!Gi(r)&&(i=Ui[(n=String(r)).toLowerCase()],i===void 0))throw new j(`Unknown adapter '${n}'`);if(i&&(k.isFunction(i)||(i=i.get(t))))break;a[n||`#`+o]=i}if(!i){let e=Object.entries(a).map(([e,t])=>`adapter ${e} `+(t===!1?`is not supported by the environment`:`is not available in the build`));throw new j(`There is no suitable adapter to dispatch the request `+(n?e.length>1?`since :
`+e.map(Wi).join(`
`):` `+Wi(e[0]):`as no adapter specified`),j.ERR_NOT_SUPPORT)}return i}var qi={getAdapter:Ki,adapters:Ui};function Ji(e){if(e.cancelToken&&e.cancelToken.throwIfRequested(),e.signal&&e.signal.aborted)throw new Wr(null,e)}function Yi(e){let t=k.toSafeFlatObject(e);return Ji(t),t.headers=A.from(k.getSafeProp(t,`headers`)),t.data=Hr.call(t,t.transformRequest),[`post`,`put`,`patch`].indexOf(t.method)!==-1&&t.headers.setContentType(`application/x-www-form-urlencoded`,!1),qi.getAdapter(t.adapter||Vr.adapter,t)(t).then(function(e){Ji(t),t.response=e;try{e.data=Hr.call(t,t.transformResponse,e)}finally{delete t.response}return e.headers=A.from(e.headers),e},function(e){if(!Ur(e)&&(Ji(t),e&&e.response)){t.response=e.response;try{e.response.data=Hr.call(t,t.transformResponse,e.response)}finally{delete t.response}e.response.headers=A.from(e.response.headers)}return Promise.reject(e)})}var Xi={};[`object`,`boolean`,`number`,`function`,`string`,`symbol`].forEach((e,t)=>{Xi[e]=function(n){return typeof n===e||`a`+(t<1?`n `:` `)+e}});var Zi={};Xi.transitional=function(e,t,n){function r(e,t){return`[Axios v`+Mi+`] Transitional option '`+e+`'`+t+(n?`. `+n:``)}return(n,i,a)=>{if(e===!1)throw new j(r(i,` has been removed`+(t?` in `+t:``)),j.ERR_DEPRECATED);return t&&!Zi[i]&&(Zi[i]=!0,console.warn(r(i,` has been deprecated since v`+t+` and will be removed in the near future`))),!e||e(n,i,a)}},Xi.spelling=function(e){return(t,n)=>(console.warn(`${n} is likely a misspelling of ${e}`),!0)};function Qi(e,t,n){if(typeof e!=`object`||!e)throw new j(`options must be an object`,j.ERR_BAD_OPTION_VALUE);let r=Object.keys(e),i=r.length;for(;i-->0;){let a=r[i],o=Object.prototype.hasOwnProperty.call(t,a)?t[a]:void 0;if(o){let t=e[a],n=t===void 0||o(t,a,e);if(n!==!0)throw new j(`option `+a+` must be `+n,j.ERR_BAD_OPTION_VALUE);continue}if(n!==!0)throw new j(`Unknown option `+a,j.ERR_BAD_OPTION)}}var $i={assertOptions:Qi,validators:Xi},N=$i.validators,ea=class{constructor(e){this.defaults=e||{},this.interceptors={request:new Cr,response:new Cr}}async request(e,t){try{return await this._request(e,t)}catch(e){if(e instanceof Error)try{let t={};Error.captureStackTrace?Error.captureStackTrace(t):t=Error();let n=t.stack,r=``;if(typeof n==`string`){let e=n.indexOf(`
`);r=e===-1?``:n.slice(e+1)}if(!e.stack)e.stack=r;else if(r){let t=r.indexOf(`
`),n=t===-1?-1:r.indexOf(`
`,t+1),i=n===-1?``:r.slice(n+1);String(e.stack).endsWith(i)||(e.stack+=`
`+r)}}catch{}throw e}}_request(e,t){typeof e==`string`?(t||={},t.url=e):t=e||{},t=di(this.defaults,t);let{transitional:n,paramsSerializer:r,headers:i}=t;n!==void 0&&$i.assertOptions(n,{silentJSONParsing:N.transitional(N.boolean),forcedJSONParsing:N.transitional(N.boolean),clarifyTimeoutError:N.transitional(N.boolean),legacyInterceptorReqResOrdering:N.transitional(N.boolean),advertiseZstdAcceptEncoding:N.transitional(N.boolean),validateStatusUndefinedResolves:N.transitional(N.boolean)},!1),r!=null&&(k.isFunction(r)?t.paramsSerializer={serialize:r}:$i.assertOptions(r,{encode:N.function,serialize:N.function},!0)),t.allowAbsoluteUrls!==void 0||(this.defaults.allowAbsoluteUrls===void 0?t.allowAbsoluteUrls=!0:t.allowAbsoluteUrls=this.defaults.allowAbsoluteUrls),$i.assertOptions(t,{baseUrl:N.spelling(`baseURL`),withXsrfToken:N.spelling(`withXSRFToken`)},!0),t.method=(k.getSafeProp(t,`method`)||k.getSafeProp(this.defaults,`method`)||`get`).toLowerCase();let a=i&&k.merge(i.common,i[t.method]);i&&k.forEach(Rr.concat(`common`),e=>{delete i[e]}),t.headers=A.concat(a,i);let o=[],s=!0;this.interceptors.request.forEach(function(e){if(typeof e.runWhen==`function`&&e.runWhen(t)===!1)return;s&&=e.synchronous;let n=t.transitional||wr;n&&n.legacyInterceptorReqResOrdering?o.unshift(e.fulfilled,e.rejected):o.push(e.fulfilled,e.rejected)});let c=[];this.interceptors.response.forEach(function(e){c.push(e.fulfilled,e.rejected)});let l,u=0,d;if(!s){let e=[Yi.bind(this),void 0];for(e.unshift(...o),e.push(...c),d=e.length,l=Promise.resolve(t);u<d;)l=l.then(e[u++],e[u++]);return l}d=o.length;let f=t;for(;u<d;){let e=o[u++],t=o[u++];try{f=e?e(f):f}catch(e){if(!t){l=Promise.reject(e);break}try{let n=t.call(this,e);k.isThenable(n)&&(l=Promise.resolve(n).then(()=>Yi.call(this,f)))}catch(e){l=Promise.reject(e)}break}}if(!l)try{l=Yi.call(this,f)}catch(e){l=Promise.reject(e)}for(u=0,d=c.length;u<d;)l=l.then(c[u++],c[u++]);return l}getUri(e){return e=di(this.defaults,e),vr(ci(e.baseURL,e.url,e.allowAbsoluteUrls,e),e.params,e.paramsSerializer)}};k.forEach([`delete`,`get`,`head`,`options`],function(e){ea.prototype[e]=function(t,n){return this.request(di(n||{},{method:e,url:t,data:n&&k.hasOwnProp(n,`data`)?n.data:void 0}))}}),k.forEach([`post`,`put`,`patch`,`query`],function(e){function t(t){return function(n,r,i){return this.request(di(i||{},{method:e,headers:t?{"Content-Type":`multipart/form-data`}:{},url:n,data:r}))}}ea.prototype[e]=t(),e!==`query`&&(ea.prototype[e+`Form`]=t(!0))});var ta=class e{constructor(e){if(typeof e!=`function`)throw TypeError(`executor must be a function.`);let t;this.promise=new Promise(function(e){t=e});let n=this;this.promise.then(e=>{if(!n._listeners)return;let t=n._listeners.length;for(;t-->0;)n._listeners[t](e);n._listeners=null}),this.promise.then=e=>{let t,r=new Promise(e=>{n.subscribe(e),t=e}).then(e);return r.cancel=function(){n.unsubscribe(t)},r},e(function(e,r,i){n.reason||(n.reason=new Wr(e,r,i),t(n.reason))})}throwIfRequested(){if(this.reason)throw this.reason}subscribe(e){if(this.reason){e(this.reason);return}this._listeners?this._listeners.push(e):this._listeners=[e]}unsubscribe(e){if(!this._listeners)return;let t=this._listeners.indexOf(e);t!==-1&&this._listeners.splice(t,1)}toAbortSignal(){let e=new AbortController,t=t=>{e.abort(t)};return this.subscribe(t),e.signal.unsubscribe=()=>this.unsubscribe(t),e.signal}static source(){let t;return{token:new e(function(e){t=e}),cancel:t}}};function na(e){return function(t){return e.apply(null,t)}}function ra(e){return k.isObject(e)&&e.isAxiosError===!0}var ia={Continue:100,SwitchingProtocols:101,Processing:102,EarlyHints:103,Ok:200,Created:201,Accepted:202,NonAuthoritativeInformation:203,NoContent:204,ResetContent:205,PartialContent:206,MultiStatus:207,AlreadyReported:208,ImUsed:226,MultipleChoices:300,MovedPermanently:301,Found:302,SeeOther:303,NotModified:304,UseProxy:305,Unused:306,TemporaryRedirect:307,PermanentRedirect:308,BadRequest:400,Unauthorized:401,PaymentRequired:402,Forbidden:403,NotFound:404,MethodNotAllowed:405,NotAcceptable:406,ProxyAuthenticationRequired:407,RequestTimeout:408,Conflict:409,Gone:410,LengthRequired:411,PreconditionFailed:412,PayloadTooLarge:413,ContentTooLarge:413,UriTooLong:414,UnsupportedMediaType:415,RangeNotSatisfiable:416,ExpectationFailed:417,ImATeapot:418,MisdirectedRequest:421,UnprocessableEntity:422,UnprocessableContent:422,Locked:423,FailedDependency:424,TooEarly:425,UpgradeRequired:426,PreconditionRequired:428,TooManyRequests:429,RequestHeaderFieldsTooLarge:431,UnavailableForLegalReasons:451,InternalServerError:500,NotImplemented:501,BadGateway:502,ServiceUnavailable:503,GatewayTimeout:504,HttpVersionNotSupported:505,VariantAlsoNegotiates:506,InsufficientStorage:507,LoopDetected:508,NotExtended:510,NetworkAuthenticationRequired:511,WebServerReturnsAnUnknownError:520,WebServerIsDown:521,ConnectionTimedOut:522,OriginIsUnreachable:523,TimeoutOccurred:524,SslHandshakeFailed:525,InvalidSslCertificate:526};Object.entries(ia).forEach(([e,t])=>{ia[t]===void 0&&(ia[t]=e)});function aa(e){let t=new ea(e),n=gt(ea.prototype.request,t);return k.extend(n,ea.prototype,t,{allOwnKeys:!0}),k.extend(n,t,null,{allOwnKeys:!0}),n.create=function(t){return aa(di(e,t))},n}var P=aa(Vr);P.Axios=ea,P.CanceledError=Wr,P.CancelToken=ta,P.isCancel=Ur,P.VERSION=Mi,P.toFormData=pr,P.AxiosError=j,P.Cancel=P.CanceledError,P.all=function(e){return Promise.all(e)},P.spread=na,P.isAxiosError=ra,P.mergeConfig=di,P.AxiosHeaders=A,P.formToJSON=e=>Lr(k.isHTMLForm(e)?new FormData(e):e),P.getAdapter=qi.getAdapter,P.HttpStatusCode=ia,P.default=P;var oa=`mateu-app-context`,sa=`mateu-app-context-labels`,ca=e=>{try{return JSON.parse(localStorage.getItem(e)??`{}`)}catch{return{}}},la=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},ua=()=>ca(oa),da=()=>ca(sa),fa=(e,t,n)=>{let r=ua(),i=da();t==null||t===``?(delete r[e],delete i[e]):(r[e]=t,n!==void 0&&(i[e]=n)),la(oa,r),la(sa,i)},pa=!1,ma=()=>{pa||(pa=!0,window.addEventListener(`storage`,e=>{e.key===oa&&e.newValue!==e.oldValue&&window.location.reload()}))},ha,ga=(e,t)=>new Promise((n,r)=>{let i=!1,a={retry:()=>{i||(i=!0,t().then(n,r))},giveUp:()=>{i||(i=!0,r(e))}};if(ha){ha(a);return}let o=new CustomEvent(`mateu-session-expired`,{detail:a,cancelable:!0,bubbles:!1});typeof document<`u`&&!document.dispatchEvent(o)||a.giveUp()}),_a=(e,t)=>e.includes(`json`)?!0:typeof t==`object`&&!!t,va=(e,t)=>{let n=e.finalUrl;if(!n)return;let r=t??(typeof window<`u`?window.location.href:void 0),i;try{i=new URL(e.requestedUrl,r).href}catch{return}if(i!==n&&!_a(e.contentType??``,e.data))return n},ya=new class{constructor(){this.windowMs=4e3,this.threshold=12,this.events=[],this.reported=new Set}check(e,t=Date.now()){this.events.push({sig:e,t});let n=t-this.windowMs;this.events=this.events.filter(e=>e.t>=n);let r=0;for(let t of this.events)t.sig===e&&r++;if(r>=this.threshold){let t=!this.reported.has(e);return this.reported.add(e),{blocked:!0,firstTrip:t}}return this.reported.delete(e),{blocked:!1,firstTrip:!1}}reset(){this.events=[],this.reported.clear()}configure(e){e.windowMs!==void 0&&(this.windowMs=e.windowMs),e.threshold!==void 0&&(this.threshold=e.threshold)}},ba=[`eyesOnly`,`readOnlyUnless`,`disabledUnless`,`access`],xa=!1,Sa=(e,t)=>{if(Array.isArray(e))return e.map(e=>Sa(e,t));if(e&&typeof e==`object`){let n={};for(let[r,i]of Object.entries(e)){if(ba.includes(r)){t.any=!0;continue}n[r]=Sa(i,t)}return n}return e};function Ca(e){let t={any:!1},n=Sa(e,t);return t.any?(xa||(xa=!0,console.warn(`mateu: access rules (eyesOnly/readOnlyUnless/disabledUnless/access) need a server to check who is asking — with none, the page renders unrestricted`)),n):e}var wa=function(e){return e.Add=`Add`,e.Replace=`Replace`,e.ReplaceKeepData=`ReplaceKeepData`,e}({}),Ta=[],Ea=e=>{Ta=Array.isArray(e)?e:[]},Da=e=>e?Ta.find(t=>t.name===e)?.component:void 0,Oa={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},ka=e=>(...t)=>({_$litDirective$:e,values:t}),Aa=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},ja=!1,Ma=e=>{ja=e},Na=()=>ja,Pa=e=>ja&&e?.id?e.id:p,Fa=e=>{let t=e.startNode?e.startNode.nextSibling:e.parentNode?.firstChild??null;for(;t&&t!==e.endNode;){if(t.nodeType===1)return t;t=t.nextSibling}return null},Ia=ka(class extends Aa{constructor(e){if(super(e),e.type!==Oa.CHILD)throw Error(`stampNodeId only works in a child position`)}render(e,t){return t}update(e,[t,n]){return queueMicrotask(()=>{let n=Fa(e);n&&n.getAttribute(`data-node-id`)!==t&&n.setAttribute(`data-node-id`,t)}),n}}),La=e=>ja&&typeof e.id==`string`&&e.id?e.id:e.actionId,Ra=(e,t)=>ja&&typeof e.id==`string`&&e.id?l`${Ia(e.id,t)}`:t,za=new Set([`id`,`style`,`cssClasses`,`slot`,`initialData`,`confirmOnNavigationIfDirty`,`sizing`]),Ba=new Set([`Form`,`FormLayout`,`VerticalLayout`,`HorizontalLayout`,`Div`,`FlexLayout`,`CustomComponent`]),Va={Card:[`content`,`title`,`subtitle`,`footer`,`header`,`media`,`headerPrefix`,`headerSuffix`],Form:[`header`,`footer`,`avatar`]},Ha={HeroSection:`content`,DashboardLayout:`items`,DashboardPanel:`content`,Scoreboard:`metrics`,TabLayout:`tabs`,Tab:`content`},Ua=new Set([`Listing`,`Crudl`,`Crud`]);function Wa(e){let{note:t,...n}=e;if(Ua.has(n.type))return Ya(n);if(n.type===`FoldoutLayout`)return Ja(n);if(n.type===`ComponentRef`)return Da(n.ref)||{type:T.ClientSide,metadata:{type:`Text`,text:`Unknown business component: ${n.ref}`},children:[]};let{type:r,content:i,children:a,...o}=n,s={},c={type:r};for(let[e,t]of Object.entries(o))za.has(e)?s[e]=t:c[e]=(e===`toolbar`||e===`buttons`)&&Array.isArray(t)?t.map(Qa):t;r===`FormField`&&(o.id!==void 0&&(c.fieldId=o.id),delete c.id,c.dataType=c.dataType??`string`,c.stereotype=c.stereotype??`regular`),r===`HeroSection`&&c.tone===`auto`&&delete c.tone;let l=[];if(Ha[r]){let e=Ha[r],t=e===`content`?i:o[e];delete c[e],l=t==null?[]:Array.isArray(t)?t:[t]}else if(Ba.has(r)){let e=i??a??[];l=Array.isArray(e)?e:[e]}for(let e of Va[r]??[]){let t=qa(e===`content`?i:c[e]);t!==void 0&&(c[e]=t)}if(r===`Form`&&Ka(c.avatar)){let e=c.avatar;e.style=(typeof e.style==`string`?e.style:``)+`;width: 4rem;height: 4rem;`}return{...s,type:T.ClientSide,metadata:c,children:l.map(Wa)}}var Ga=e=>!!e&&typeof e==`object`&&!Array.isArray(e)&&typeof e.type==`string`,Ka=e=>!!e&&typeof e==`object`&&!Array.isArray(e);function qa(e){if(Ga(e))return Wa(e);if(Array.isArray(e))return e.map(e=>Ga(e)?Wa(e):e)}function Ja(e){let{type:t,content:n,children:r,overview:i,panels:a,badges:o,...s}=e,c={},l={type:t};for(let[e,t]of Object.entries(s))za.has(e)?c[e]=t:l[e]=t;let u=[];return Ga(i)&&u.push({...Wa(i),slot:`overview`}),l.panels=(Array.isArray(a)?a:[]).map((e,t)=>(Ga(e.content)&&u.push({...Wa(e.content),slot:`panel-`+t}),Ga(e.summary)&&u.push({...Wa(e.summary),slot:`summary-`+t}),Object.fromEntries(Object.entries({title:e.title,subtitle:e.subtitle,icon:e.icon,open:!!e.open,width:e.width,id:Na()&&typeof e.id==`string`?e.id:void 0}).filter(([,e])=>e!==void 0)))),Array.isArray(o)&&(l.badges=o.map(e=>e?.text).filter(e=>typeof e==`string`&&e.trim()!==``)),{...c,type:T.ClientSide,metadata:l,children:u}}function Ya(e){let{type:t,content:n,children:r,...i}=e,a={id:`crud`,sizing:`fill`},o={type:`Crud`,crudlType:i.crudlType??i.listingType??`table`,pageSize:10,searchOnEnter:!0,autoFocusOnSearchText:!0,filtersLayout:`auto`,gridLayout:`auto`};for(let[e,t]of Object.entries(i))e!==`crudlType`&&e!==`listingType`&&(za.has(e)?a[e]=t:e===`columns`&&Array.isArray(t)?o[e]=t.map(Xa):e===`toolbar`&&Array.isArray(t)?o[e]=t.map(Qa):e===`filters`&&Array.isArray(t)?o[e]=t.map($a):e===`preSearch`&&Array.isArray(t)?t.length>0&&(o[e]=t.map(Wa)):o[e]=t);return{...a,type:T.ClientSide,metadata:o,children:[]}}function Xa(e){let t=Wa(e);return e.id!==void 0&&t.metadata&&(t.metadata.id=e.id),t}var Za=e=>e.replace(/[^\p{L}\p{N}]+/gu,` `).trim().split(/\s+/).filter(Boolean).map((e,t)=>t===0?e.charAt(0).toLowerCase()+e.slice(1):e.charAt(0).toUpperCase()+e.slice(1)).join(``);function Qa(e){if(!e||e.type!==`Button`)return e;let{actionable:t,...n}=e,r={...n};return t?.type===`RouteLink`&&t.route&&(r.route=t.route),!r.actionId&&typeof r.label==`string`&&(r.actionId=Za(r.label)),r}function $a(e){if(!e||e.type!==`FormField`)return e;let{id:t,...n}=e;return{...n,fieldId:n.fieldId??t,dataType:n.dataType??`string`,stereotype:n.stereotype??`regular`}}var eo=[],to=e=>{eo=Array.isArray(e)?e.filter(e=>e&&typeof e.id==`string`&&e.id.trim()!==``):[]},no=()=>eo,ro=[`label`,`dataType`,`stereotype`,`placeholder`,`description`,`required`,`readOnly`,`options`,`optionsSource`,`min`,`max`,`step`,`colspan`,`style`,`cssClasses`,`align`,`width`,`autoWidth`,`tones`],io={GridColumn:[`label`,`dataType`,`stereotype`,`style`,`cssClasses`,`align`,`width`,`autoWidth`,`tones`],FormField:[`label`,`dataType`,`stereotype`,`placeholder`,`description`,`required`,`readOnly`,`options`,`optionsSource`,`min`,`max`,`step`,`colspan`,`style`,`cssClasses`]},ao=e=>e==null||e===``||Array.isArray(e)&&e.length===0||typeof e==`object`&&!Array.isArray(e)&&Object.keys(e).length===0,oo=`fieldType`,so=e=>{if(Array.isArray(e))return e.some(so);if(!e||typeof e!=`object`)return!1;let t=e;return typeof t.fieldType==`string`||Object.values(t).some(so)},co=e=>e===void 0?e:JSON.parse(JSON.stringify(e));function lo(e,t=eo){if(!so(e))return e;let n=new Map(t.map(e=>[e.id.trim(),e])),r=new Set,i=e=>{if(Array.isArray(e))return e.map(i);if(!e||typeof e!=`object`)return e;let t={};for(let[n,r]of Object.entries(e))n!==`fieldType`&&(t[n]=i(r));let a=e[oo];if(typeof a==`string`){let e=n.get(a.trim());if(!e)r.has(a)||(r.add(a),console.warn(`mateu: unknown field type '${a}' (on '${String(t.id??``)}') — rendered as declared`));else{let n=io[String(t.type??``)]??ro;for(let r of n){let n=e[r];ao(n)||(t[r]===void 0||t[r]===null)&&(t[r]=co(n))}}}return t};return i(e)}var uo=`ux_main`;function fo(e){return!(e.viewModel??e.modelView)&&!!po(e)}function po(e){if(e.layout&&typeof e.layout==`object`)return e.layout;if(typeof e.type==`string`)return e}function mo(e,t,n,r={}){e=Ca(e),e=lo(e);let i=po(e);if(!i)throw Error(`Definition for route "${t}" has no layout to expand`);if(i.type===`AppShell`)return Do(i);let a=n??(typeof i.title==`string`?i.title:t),o=Wa(i);return{commands:[{targetComponentId:uo,type:`SetWindowTitle`,data:a}],messages:[],fragments:[{targetComponentId:uo,component:go(e,o,r),data:void 0,state:void 0,action:wa.Replace,containerId:void 0}],banners:[],appendBanners:!1,appData:void 0,appState:void 0}}function ho(e){return e.ref?{ref:e.ref}:Object.fromEntries(Object.entries(e).filter(([,e])=>e!=null))}function go(e,t,n){let r=(e.actions??[]).map(vo);r.push(...Fo(e.layout??t,r));let i=[...e.triggers??[]];if(n.data&&(n.data.ref||n.data.url)&&(r.push({id:`__restdata__`,restAction:{source:ho(n.data),resultPath:``}}),i.push({type:`OnLoad`,actionId:`__restdata__`,times:1})),!r.length&&!i.length)return t;let a=n.path??``;return{type:T.ServerSide,id:`page_`+(a||`root`).replace(/[^A-Za-z0-9_-]/g,`_`),serverSideType:void 0,route:`/`+a,initialData:{},actions:r,triggers:i,rules:[],validations:[],children:[t]}}function _o(e){let t=(e,t)=>({targetComponentId:null,type:e,data:t}),n=(e,t)=>({eventName:e,detail:t??null});switch(e?.type){case`Navigate`:return t(`NavigateTo`,e.route??null);case`Emit`:return t(`DispatchEvent`,n(e.event,e.payload));case`CloseOverlay`:return t(`CloseModal`,e.event?n(e.event,null):null);case`RunAction`:return t(`RunAction`,{actionId:e.actionId});case`MarkClean`:return t(`MarkAsClean`,null);case`MarkDirty`:return t(`MarkAsDirty`,null);default:return}}function vo(e){if(!e||typeof e!=`object`||!(`description`in e)&&!Array.isArray(e.steps))return e;let{description:t,...n}=e;if(!Array.isArray(n.steps))return n;let{steps:r,...i}=n,a=r.map(_o).filter(Boolean);return a.length?{...i,commands:a}:i}function yo(e){if(typeof e!=`string`||!e)return``;let t=e.replace(/\./g,` `).replace(/(?<=[A-Z])(?=[A-Z][a-z])|(?<=[^A-Z])(?=[A-Z])|(?<=[A-Za-z])(?=[^A-Za-z])/g,` `).toLowerCase().replace(/ +/g,` `);return t.length<=1?t:t.split(` `).map((e,t)=>t>0&&e?e[0].toUpperCase()+e.substring(1):e).join(``)}function bo(e){return e.type!==`RuleLink`||!Array.isArray(e.rules)?[]:e.rules.map(e=>({filter:e.filter??null,action:e.action??null,fieldName:e.fieldName??null,fieldAttribute:e.fieldAttribute??null,value:e.value??null,expression:e.expression??null,result:e.result??null,actionId:e.actionId??null}))}function xo(e){let t=`/`+(typeof e.route==`string`&&e.route?e.route:typeof e.path==`string`?e.path:e.type===`RuleLink`?yo(e.label):``).replace(/^\/+/,``),n=e.submenu??e.submenus??e.menu;return{label:e.label,icon:e.icon,path:t,route:t,consumedRoute:``,uriPrefix:``,visible:!e.hidden,selected:!1,disabled:!1,separator:e.type===`MenuSeparator`,remote:!1,rules:bo(e),submenus:Array.isArray(n)?n.map(xo):[]}}function So(e){for(let t of e){if(t.type===`RouteLink`&&(t.route||t.path))return t.route??t.path;let e=t.submenu??t.submenus??t.menu;if(Array.isArray(e)){let t=So(e);if(t)return t}}}var Co=e=>{let t=e.submenu??e.submenus??e.menu;return Array.isArray(t)?t:void 0},wo=e=>e.type===`Menu`||!e.type&&!!Co(e),To=e=>e.some(e=>e.type===`RemoteMenu`||wo(e)&&To(Co(e)??[]));function Eo(e,t){return typeof e==`string`&&e.trim()&&e.trim().toUpperCase()!==`AUTO`?e.trim():To(t)?`MENU_ON_TOP`:t.some(wo)?t.some(e=>wo(e)&&(Co(e)??[]).some(wo))?`TILES`:t.length>7?`HAMBURGUER_MENU`:`MENU_ON_TOP`:`TABS`}function Do(e){let t=e.menu??[],n=(e.widgets??[]).filter(e=>e&&typeof e==`object`),r=t=>e[t]===!0||e[t]===`true`;return{commands:[{targetComponentId:uo,type:`SetWindowTitle`,data:e.title??``}],messages:[],fragments:[{targetComponentId:uo,component:{type:T.ClientSide,id:`app`,metadata:{type:`App`,route:``,rootRoute:``,variant:Eo(e.variant,t),layout:`SINGLE_SLOT`,title:e.title,subtitle:e.subtitle,logo:e.logo,favicon:e.favicon,themeToggle:r(`themeToggle`),commandCenterEnabled:r(`commandCenter`)||r(`chromeless`),chromeless:r(`chromeless`),accessKeys:r(`accessKeys`),mobileQr:r(`mobileQr`),drawerClosed:r(`drawerClosed`),style:typeof e.style==`string`?e.style:void 0,cssClasses:typeof e.cssClasses==`string`?e.cssClasses:void 0,accentColor:typeof e.accentColor==`string`&&e.accentColor.trim()?e.accentColor.trim():void 0,menu:t.map(xo),totalMenuOptions:t.length,homeRoute:(typeof e.homeRoute==`string`&&e.homeRoute.trim()?e.homeRoute.trim().replace(/^\/+/,``):So(t))??``,homeConsumedRoute:``,homeBaseUrl:``,apps:[],fabs:[],contextSelectors:[],contextActions:[],actions:(e.actions??[]).filter(e=>e&&typeof e==`object`).map(vo),actionCatalogue:Mo()},children:n.map(e=>({...Wa(e),slot:`widgets`}))},data:void 0,state:void 0,action:wa.Replace,containerId:void 0}],banners:[],appendBanners:!1,appData:void 0,appState:void 0}}var Oo=[],ko=e=>{Oo=Array.isArray(e)?e.filter(e=>e&&typeof e.id==`string`):[]},Ao=e=>{let t=new Map;for(let n of Array.isArray(e)?e:[]){if(!n||typeof n!=`object`)continue;let e=n;if(!(typeof e.id!=`string`||!e.id)){if(!(Array.isArray(e.steps)&&e.steps.length>0||e.restAction)){console.warn(`mateu: action catalogue entry "${e.id}" is not client-runnable (no steps, no restAction) — ignored`);continue}t.set(e.id,vo(e))}}return[...t.values()]},jo=e=>e?Oo.find(t=>t.id===e):void 0,Mo=()=>Oo,No=(e,t,n)=>t?(e??[]).find(e=>e&&e.id===t)||((n??[]).find(e=>e&&e.id===t)??jo(t)):void 0,Po=(e,t=new Set)=>{if(Array.isArray(e))e.forEach(e=>Po(e,t));else if(e&&typeof e==`object`)for(let[n,r]of Object.entries(e))typeof r==`string`&&(n===`actionId`||n.endsWith(`ActionId`))&&r?t.add(r):r&&typeof r==`object`&&Po(r,t);return t},Fo=(e,t=[],n=Oo)=>{if(!n.length)return[];let r=new Set(t.map(e=>e?.id).filter(Boolean)),i=[...Po([e,t])],a=[];for(;i.length;){let e=i.shift();if(r.has(e))continue;let t=n.find(t=>t.id===e);t&&(r.add(e),a.push(t),i.push(...Po(t)))}return a},Io=/\$\{\s*i18n\.([A-Za-z0-9_][A-Za-z0-9_.-]*)\s*\}/g,Lo=`en`,Ro=e=>(e??``).trim().replace(/_/g,`-`).toLowerCase(),zo=(e,t)=>Object.keys(e).find(e=>Ro(e)===t);function Bo(e,t){if(!e)return;let n=Object.keys(e);if(n.length){for(let n of t){let t=Ro(n);if(!t)continue;let r=zo(e,t);if(r)return r;let i=zo(e,t.split(`-`)[0]);if(i)return i}return zo(e,Ro(Lo))??zo(e,Ro(Lo).split(`-`)[0])??n[0]}}var Vo=new Set;function Ho(e,t,n){return typeof e!=`string`||!e.includes(`i18n.`)?e:e.replace(Io,(e,r)=>{let i=t?.[r]??n?.[r];return i===void 0?(Vo.has(r)||(Vo.add(r),console.warn(`mateu: missing translation '${r}' — showing the key`)),r):i})}function Uo(e,t,n){let r=e=>{if(typeof e==`string`)return Ho(e,t,n);if(Array.isArray(e))return e.map(r);if(e&&typeof e==`object`){let t={};for(let[n,i]of Object.entries(e))t[n]=r(i);return t}return e};return r(e)}var Wo=e=>{if(e==null)return!1;let t=typeof e==`string`?e:JSON.stringify(e);return Io.lastIndex=0,Io.test(t)},Go=()=>{let e=globalThis.navigator;return e?[...e.languages??[],...e.language?[e.language]:[]]:[]},Ko,qo=new Map,Jo=[],Yo,Xo=[],Zo=[],Qo={},$o={},es,ts,ns=e=>{ts=e||void 0},rs=()=>{let e=Ts(Ko?.get(`_no_route`));return typeof e?.locale==`string`&&e.locale?e.locale:void 0},is=()=>Bo($o,[ts,rs(),...Go()]),as=e=>{if(e===void 0||!Object.keys($o).length||!Wo(e))return e;let t=is(),n=Bo($o,[]);return Uo(e,t?$o[t]:void 0,n&&n!==t?$o[n]:void 0)},os=e=>e.split(`/`).filter(e=>e.startsWith(`:`)&&e.length>1).map(e=>e.substring(1)),ss=e=>{let t=e=>e.replace(/^\/+/,``).replace(/\/+$/,``),n=t(e===`_no_route`?``:e),r=n===``?[]:n.split(`/`),i;for(let e of Xo){let n=t(e.route??``),a=n===``?[]:n.split(`/`);if(a.length!==r.length)continue;let o={},s=!0;for(let e=0;e<a.length;e++){let t=a[e];if(t.startsWith(`:`)&&t.length>1)o[t.substring(1)]=r[e];else if(t!==r[e]){s=!1;break}}if(!s)continue;let c={entry:e,pathParams:o};(!i||os(n).length<os(t(i.entry.route??``)).length)&&(i=c)}return i},cs=(e,t)=>{let n=ss(e);if(!n)return t;let{entry:r,pathParams:i}=n,a=r.defaultParams??{},o=r.fixedParams??{};return!Object.keys(a).length&&!Object.keys(o).length&&!Object.keys(i).length?t:{...t,fragments:(t.fragments??[]).map(e=>({...e,state:{...a,...e.state??{},...i,...o},data:{...a,...e.data??{},...i,...o}}))}},ls=e=>{let t=e&&e.startsWith(`/`)?e.substring(1):e??``;return t===``?`_no_route`:t},us=e=>{let t=new Map,n=new Map,r=[];for(let i of e.entries??[])if(!(!i.ok||!i.json))try{let e=JSON.parse(i.json),a=i.contentJson?JSON.parse(i.contentJson):void 0;i.routePattern?r.push({regex:new RegExp(i.routePattern),paramNames:i.paramNames??[],increment:e,content:a}):(t.set(i.syncPath,e),a&&n.set(i.syncPath,a))}catch(e){console.warn(`mateu: bundle entry parse failed for`,i.syncPath,e)}return{increments:t,contents:n,templates:r,routeEntries:e.routes?.routes??[],definitions:e.definitions??{},catalogueSources:e.sources?.sources??[],translations:e.translations??{},environment:e.environment??void 0}},ds=()=>Ko===void 0?void 0:{increments:Ko,contents:qo,templates:Jo,routeEntries:Xo,catalogueSources:Zo,definitions:Qo,translations:$o,environment:es},fs=e=>{Ko=e?.increments,qo=e?.contents??new Map,Jo=e?.templates??[],Xo=e?.routeEntries??[],Zo=e?.catalogueSources??[],Qo=e?.definitions??{},$o=e?.translations??{},es=e?.environment};function ps(e,t=fetch){return Yo=(async()=>{try{let n=await t(e);if(!n.ok)return;let r=await n.json();fs(us(r)),oe(r.sources?.sources),ko(r.actions),r.mockSources&&me(!0),r.types&&to(r.types.types)}catch(e){console.warn(`mateu: bundle manifest load failed`,e)}})(),Yo}var ms=new Map,hs=e=>{if(!e)return!1;let t=e.split(`#`)[0].split(`?`)[0];return/\.json$/i.test(t)},gs=(e,t=fetch)=>{let n=ms.get(e);if(!n){n=(async()=>{try{let n=await t(e);if(!n.ok)return;let r=await n.json(),i=us(r);return se(e,r.sources?.sources),i}catch(t){console.warn(`mateu: static remote manifest load failed`,e,t);return}})();let r=n;r.then(t=>{!t&&ms.get(e)===r&&ms.delete(e)}),ms.set(e,r)}return n},_s=async(e,t,n,r=fetch)=>{let i=await gs(e,r);if(!i)return;let a=ds();fs(i);try{if(n!==void 0&&n!==`_empty`&&t===`_no_route`){let e=Ts(xs(`_no_route`)??ws(`_no_route`))?.homeRoute;return typeof e!=`string`||ls(e)===`_no_route`?void 0:Ds(ls(e),n)}return Ds(t,n)}finally{fs(a)}},vs=e=>{if(!e||!/^https?:\/\//i.test(e))return!1;try{return typeof window>`u`||new URL(e).origin!==window.location.origin}catch{return!1}},ys=()=>Yo??Promise.resolve(),bs=()=>Ko!==void 0&&Ko.size>0||Jo.length>0||Object.keys(Qo).length>0,xs=e=>{let t=Ko?.get(e);return t===void 0?void 0:cs(e,t)},Ss=(e,t=!1)=>{for(let n of Jo){let r=n.regex.exec(e);if(!r)continue;let i=t?n.content:n.increment;if(!i)return;let a={};return n.paramNames.forEach((e,t)=>{a[e]=r[t+1]}),cs(e,{...i,fragments:(i.fragments??[]).map(e=>({...e,component:Cs(e.component,a),state:{...e.state??{},...a},data:{...e.data??{},...a}}))})}},Cs=(e,t)=>{let n=e;return!n||!n.initialData||typeof n.initialData!=`object`?e:{...n,initialData:{...n.initialData,...t}}},ws=e=>{let t=ss(e),n=t?.entry.definition;if(!n)return;let r=Qo[n];if(!r||!fo(r))return;let i=mo(as(r),t.entry.route,void 0,{data:t.entry.data??void 0,path:e===`_no_route`?``:e});return cs(e,{...i,fragments:(i.fragments??[]).map(e=>{let t=Ts({fragments:[e]}),n=t?{...e.component,metadata:{...t,restSources:Zo}}:e.component;return{...e,component:n,targetComponentId:void 0}})})},Ts=e=>{let t=e?.fragments?.[0]?.component;return t?.metadata?.type===`App`?t.metadata:void 0},Es=(e,t)=>{if(t===`_no_route`)return e;let[n,...r]=e.fragments??[],i=n.component;return{...e,fragments:[{...n,component:{...i,metadata:{...i.metadata,homeRoute:`/`+t}}},...r]}},Ds=(e,t)=>as(Os(e,t)),Os=(e,t)=>{let n=t===void 0||t===`_empty`,r=()=>xs(e)??Ss(e)??ws(e);if(n){let t=r();if(t&&Ts(t))return Es(t,e);if(e!==`_no_route`&&(ss(e)||!t)){let t=xs(`_no_route`)??ws(`_no_route`);if(t&&Ts(t))return Es(t,e)}return t}let i=qo.get(e)===void 0?Ss(e,!0):cs(e,qo.get(e));if(i)return i;let a=r();return a&&Ts(a)?void 0:a},ks=e=>e?t(`errorStatus`,{status:e}):``,As={offline:()=>r(`failOffline`),timeout:()=>r(`failTimeout`),server:e=>t(`failServer`,{status:ks(e)}),unauthorized:()=>r(`failUnauthorized`),forbidden:()=>r(`forbidden`),notFound:()=>r(`failNotFound`),client:e=>t(`failClient`,{status:ks(e)}),cancelled:()=>``,unknown:()=>r(`failUnknown`)},js=new Set([`offline`,`timeout`,`server`]),Ms=(e,t={})=>{let n=e??{},r=n.response?.status,i=n.code,a=t.online??(typeof navigator<`u`&&typeof navigator.onLine==`boolean`?navigator.onLine:!0),o=e=>({kind:e,message:As[e](r),retryable:js.has(e),status:r});return i===`ERR_CANCELED`?o(`cancelled`):i===`ECONNABORTED`||i===`ETIMEDOUT`||/timeout/i.test(n.message??``)?o(`timeout`):r===void 0?!a||i===`ERR_NETWORK`||/network error/i.test(n.message??``)?o(`offline`):o(`unknown`):o(r===401?`unauthorized`:r===403?`forbidden`:r===404||r===410?`notFound`:r===408||r===429?`timeout`:r>=500?`server`:r>=400?`client`:`unknown`)},Ns=e=>e.kind!==`forbidden`,Ps=new Set([``,`__load__`,`search`,`_globalsearch`,`_notifications-list`]),Fs=[`_appcontext-search-`,`search-`],Is=(e,t)=>t===!0?!0:e==null?!1:Ps.has(e)?!0:Fs.some(t=>e.startsWith(t)),Ls=(e,t=Math.random)=>{let n=300*3**Math.max(0,e-1);return Math.round(n*(.75+t()*.5))},Rs=(e,t,n)=>!n.idempotent||t>2||!e.retryable?!1:e.kind===`timeout`||e.kind===`server`,zs=new class{constructor(){this.linkUp=!0,this.listeners=new Set,this.waiters=new Set,this.started=!1}start(){this.started||typeof window>`u`||(this.started=!0,this.linkUp=typeof navigator<`u`&&typeof navigator.onLine==`boolean`?navigator.onLine:!0,window.addEventListener(`online`,()=>{this.linkUp=!0,this.reachable=void 0,this.changed(),this.releaseWaiters()}),window.addEventListener(`offline`,()=>{this.linkUp=!1,this.changed()}))}isOnline(){return this.linkUp?this.reachable!==!1:!1}noteReachable(){let e=this.isOnline();this.reachable=!0,e||(this.changed(),this.releaseWaiters())}noteUnreachable(){let e=this.isOnline();this.reachable=!1,e&&this.changed()}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}whenBack(e){return this.isOnline()?(e(),()=>{}):(this.waiters.add(e),()=>this.waiters.delete(e))}reset(){this.linkUp=!0,this.reachable=void 0,this.waiters.clear()}changed(){let e=this.isOnline();this.listeners.forEach(t=>t(e))}releaseWaiters(){let e=Array.from(this.waiters);this.waiters.clear(),e.forEach(e=>e())}};zs.start();var Bs=`useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict`,Vs=(e=21)=>{let t=``,n=crypto.getRandomValues(new Uint8Array(e|=0));for(;e--;)t+=Bs[n[e]&63];return t},Hs=e=>{try{return globalThis[e]??void 0}catch{return}},Us=e=>{let t={get(t){try{return Hs(e)?.getItem(t)??null}catch{return null}},set(t,n){try{let r=Hs(e);return r?(r.setItem(t,n),!0):!1}catch{return!1}},remove(t){try{Hs(e)?.removeItem(t)}catch{}},getJson(e,n){let r=t.get(e);if(r==null)return n;try{return JSON.parse(r)}catch{return n}},setJson(e,n){try{return t.set(e,JSON.stringify(n))}catch{return!1}}};return t},Ws=Us(`localStorage`),Gs=Us(`sessionStorage`),Ks=`__mateu_auth_token`,qs=`__mateu_sesion_id`,Js,Ys,Xs=null,Zs=()=>{try{let e=typeof document<`u`?document.querySelector(`meta[name="mateu-auth-token-storage"]`)?.getAttribute(`content`):void 0;return e===`localStorage`||e===`sessionStorage`||e===`memory`?e:void 0}catch{return}},Qs=()=>Js??Zs()??`localStorage`,$s=()=>{if(Ys)try{let e=Ys();if(e)return e}catch{}switch(Qs()){case`memory`:return Xs;case`sessionStorage`:return Gs.get(Ks);default:return Ws.get(Ks)}},ec=()=>{let e=$s();return e?{Authorization:`Bearer `+e}:{}},tc,nc=(e=!0)=>{let t=Gs.get(qs);if(t)return t;if(tc)return tc;if(!e)return null;let n=Vs();return Gs.set(`__mateu_sesion_id`,n)||(tc=n),n},rc=(e,t,n)=>{let r=t??{},i=!!r.config||!!r.response,a=r.config?.headers?.traceparent;return{kind:e.kind,message:e.message,status:e.status??r.response?.status,detail:typeof t==`string`?t:r.message,url:r.config?.url,actionId:n,traceparent:typeof a==`string`?a:void 0,stack:i?void 0:r.stack}},ic=null,ac=e=>{ic?.report(e)},oc=(e,t)=>`${e??``}|${t??``}`,sc=(e,t,n)=>!n||e===void 0||e===t,cc=(e,t)=>{let n=e.generation,r=e.callbackToken,i=e.connected;return()=>e.generation!==n||t&&e.callbackToken!==r||i&&!e.connected},lc=class extends Error{constructor(e,t){super(`response to '${e}' arrived for a view no longer on screen`),this.actionId=e,this.outcome=t,this.__mateuStale=!0,this.__mateuReported=!0,this.code=`ERR_CANCELED`}},uc=e=>!!e&&typeof e==`object`&&e.__mateuStale===!0,dc={show:e=>console.debug(`[mateu] no notifier registered, dropping toast:`,e.text)};function fc(e){dc=e}function pc(e,t){dc.show(e,t)}function mc(e,t=3){if(typeof e!=`string`||e.trim()===``)return{ok:!0};let n=parseInt(e.trim().split(`.`)[0]??``,10);return Number.isFinite(n)?n===t?{ok:!0}:{ok:!1,serverMajor:n,received:e.trim()}:{ok:!0}}function hc(e,n=3){return t(`wireVersionMismatch`,{server:`${e}.x`,supported:`${n}.x`})}var gc=!1,_c=e=>{console.error(`[mateu] `+e),typeof document<`u`&&document.body&&pc({text:e,variant:`error`,position:`topStretch`,duration:0,actionLabel:r(`dismiss`),onAction:()=>void 0},document.body)};function vc(e,t=_c){if(!e||typeof e!=`object`)return{ok:!0};let n=mc(e.wireVersion);return!n.ok&&!gc&&(gc=!0,t(hc(n.serverMajor))),n}var yc=[],bc=6e4,xc=e=>new Promise(t=>setTimeout(t,e)),Sc=new class{constructor(){this.axiosInstance=P.create({timeout:bc}),this.axiosInstance.interceptors.request.use(e=>(this.addAuthToken(e),this.addSessionId(e),e)),this.axiosInstance.interceptors.response.use(e=>{let t=va({requestedUrl:this.axiosInstance.getUri(e.config),finalUrl:e.request?.responseURL,contentType:String(e.headers?.[`content-type`]??``),data:e.data});if(t)throw window.location.assign(t),Object.assign(Error(`session lost — redirecting to `+t),{code:`ERR_CANCELED`});return e},e=>{let t=e;if(t?.response?.status===401&&t.config&&!t.config.__mateuRetried&&!t.config.__mateuIsStale?.()){let n=t.config;return n.__mateuRetried=!0,ga(e,()=>this.axiosInstance.request(n))}throw e})}addSessionId(e){let t=nc();t&&(e.headers[`X-Session-Id`]=t)}addAuthToken(e){let t=$s();t&&(e.headers.Authorization=`Bearer `+t)}async wrap(e,t,n,r,i,a=!1,o){n||t.dispatchEvent(new CustomEvent(`backend-called-event`,{bubbles:!0,composed:!0,detail:{}}));let s=e=>{throw t.dispatchEvent(new CustomEvent(`backend-cancelled-event`,{bubbles:!0,composed:!0,detail:{actionId:r}})),new lc(r,e)};return e().then(e=>(o?.()&&s(`answered`),t.dispatchEvent(new CustomEvent(`backend-succeeded-event`,{bubbles:!0,composed:!0,detail:{actionId:r}})),e),e=>{o?.()&&s(`failed`);let n=Ms(e,{online:zs.isOnline()});throw a||(n.kind==`cancelled`?t.dispatchEvent(new CustomEvent(`backend-cancelled-event`,{bubbles:!0,composed:!0,detail:{actionId:r}})):(e&&typeof e==`object`&&(e.__mateuReported=!0),t.dispatchEvent(new CustomEvent(`backend-failed-event`,{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(e),failure:n,retry:i}})))),e})}async sendWithRetry(e,t,n=!1,r){let i=0;for(;;)try{let t=await e();return n||zs.noteReachable(),t}catch(e){let a=Ms(e,{online:zs.isOnline()});if(a.kind==`offline`&&!n&&zs.noteUnreachable(),i++,r?.()||!Rs(a,i,{idempotent:t}))throw e;await xc(Ls(i))}}serialize(e){return e?.message?e:JSON.stringify(e)}release(e){yc=yc.filter(t=>t!==e)}async get(e){let t=new AbortController;return yc=[...yc,t],this.axiosInstance.get(e,{signal:t.signal}).finally(()=>this.release(t))}async post(e,t,n,r){let i=new AbortController;return yc=[...yc,i],this.axiosInstance.post(e,t,{signal:i.signal,...r?{__mateuIsStale:r}:{},...n&&n>0?{timeout:n}:{}}).finally(()=>this.release(i))}async abortAll(){yc.forEach(e=>e.abort()),yc=[]}async runAction(e,t,n,i,a,o,s,c,l,u,d,f={}){if(t&&t.startsWith(`/`)&&(t=t.substring(1)),hs(e)){let r=i===``?await _s(e,ls(t),n):void 0;return await this.wrap(()=>r?Promise.resolve({...r,fragments:(r.fragments??[]).map(e=>e.targetComponentId?e:{...e,targetComponentId:a})}):Promise.reject(Error(i===``?`the static bundle ${e} does not answer the route "${t}"`:`the static bundle ${e} has no server to run "${i}"`)),u,d,i,f.retry,!1,f.isStale)}if(i===``&&!vs(e)&&(await ys(),bs())){let e=Ds(ls(t),n);if(e){let t={...e,fragments:(e.fragments??[]).map(e=>e.targetComponentId?e:{...e,targetComponentId:a})};return await this.wrap(()=>Promise.resolve(t),u,d,i,f.retry,!1,f.isStale)}}let p=[e,t,n,s??``,i,a].join(``),m=ya.check(p);if(m.blocked)return await this.abortAll(),m.firstTrip&&(console.error(`[mateu] request loop detected — aborting repeated request`,p),ac({kind:`request-loop`,message:`A repeating request was detected and stopped`,url:e+`/mateu/v3/sync/`+(t||`_no_route`),actionId:i})),{messages:m.firstTrip?[{title:``,text:r(`repeatingRequest`),position:`bottom-end`,variant:`error`,duration:6e3}]:[],commands:[],fragments:[],banners:[],appendBanners:!1,appData:void 0,appState:void 0};o={...ua(),...o};let h=e+`/mateu/v3/sync/`+(t&&t!=``?t:`_no_route`),g={serverSideType:s,appState:o,componentState:c,parameters:l,initiatorComponentId:a,consumedRoute:n,route:t&&t!=``?`/`+t:``,actionId:i,knownStructureHash:f.knownStructureHash},_=Is(i,f.idempotent),v=()=>this.post(h,g,f.timeoutMillis,f.isStale).then(e=>(vc(e.data),e.data));return await this.wrap(()=>this.sendWithRetry(v,_,f.quiet,f.isStale),u,d,i,f.retry,f.quiet,f.isStale)}},Cc=e=>{let t=(e??``).trim(),n=t.search(/[?#]/);for(n>=0&&(t=t.slice(0,n)),t&&!t.startsWith(`/`)&&(t=`/`+t);t.length>1&&t.endsWith(`/`);)t=t.slice(0,-1);return t},wc=e=>{let t=e??``,n;do n=t,t=t.replace(/<[^<>]*>/g,``);while(t!==n);return t.replace(/[<>]/g,``).replace(/\s+/g,` `).trim()},Tc=(e,t)=>!!e&&e!==`/`&&(t===e||t.startsWith(e+`/`)),F=e=>!!e&&!!e.remote,Ec=e=>F(e)?Cc(e.routePrefix||e.path||e.route):``,Dc=(e,t)=>{if(!e||e.separator)return-1;let n=Cc(t);if(F(e)){let t=Ec(e);return Tc(t,n)?t.length:-1}let r=-1,i=Cc(e.route);Tc(i,n)&&(r=i.length);for(let t of e.submenus??[])r=Math.max(r,Dc(t,n));return r},Oc=(e,t)=>Dc(e,t)>=0;function kc(e,t){let n=NaN,r=-1;return(e??[]).forEach((e,i)=>{let a=Dc(e,t);a>r&&(r=a,n=i)}),n}function Ac(e,t){let n=Cc(t),r,i=jc(e),a=(e,t,n)=>{(!r||e.length>r.route.length||e.length===r.route.length&&r.pending&&!n)&&(r={crumbs:t,route:e,pending:n})},o=(e,t)=>{for(let r of e??[]){if(!r||r.separator)continue;let e=wc(r.label);if(F(r)){let i=Ec(r);Tc(i,n)&&a(i,[...t,{text:e}],!0);continue}let s=Cc(r.route),c=r.submenus??[];if(c.length>0){o(c,[...t,s&&s!==`/`&&i.has(s)?{text:e,route:s}:{text:e}]);continue}Tc(s,n)&&a(s,[...t,{text:e,route:s}],!1)}};return o(e,[]),r?{crumbs:r.crumbs,matched:r.route,...r.pending?{pending:!0}:{}}:{crumbs:[]}}function jc(e){let t=new Set,n=e=>{for(let r of e??[]){if(!r||r.separator||F(r))continue;let e=r.submenus??[];if(e.length>0){n(e);continue}let i=Cc(r.route);i&&i!==`/`&&t.add(i)}};return n(e),t}function Mc(e,t){let n=Cc(t),r,i=e=>{for(let t of e??[]){if(!t||t.separator||F(t))continue;let e=t.submenus??[];if(e.length>0){i(e);continue}let a=Cc(t.route);Tc(a,n)&&(!r||a.length>r.route.length)&&(r={option:t,route:a})}};return i(e),r?.option}var Nc=(e,t)=>{let n=!1,r=e.map(e=>{if(F(e)){let r=t(e);return r!==e&&(n=!0),r}if(e.submenus&&e.submenus.length>0){let r=Nc(e.submenus,t);if(r!==e.submenus)return n=!0,{...e,submenus:r}}return e});return n?r:e};function Pc(e,t,n){let r=Cc(n);if(!t||!r||r===`/`)return e;let i=`/`+r.split(`/`)[1];return Nc(e,e=>e.baseUrl===t&&!Tc(Ec(e),r)?{...e,routePrefix:i}:e)}function Fc(e,n){return t(`sectionUnavailable`,{name:wc(e)},n)}var Ic=e=>e.map(e=>({...e,visible:!1,...e.submenus&&e.submenus.length>0?{submenus:Ic(e.submenus)}:{}})),Lc=(e,t,n)=>{let r=t.serverSideType&&t.serverSideType!==``?t.serverSideType:n.serverSideType;return e.map(e=>e.baseUrl?e:e.submenus&&e.submenus.length>0?{...e,submenus:Lc(e.submenus,t,n)}:{...e,consumedRoute:n.route??``,baseUrl:t.baseUrl,serverSideType:r,uriPrefix:t.route})};function Rc(e,t,n,r={},i=0){let a=[];for(let o of e)if(F(o)){let e=t.get(o);if(!e)a.push(o);else if(`failed`in e)a.push({...o,unavailable:!0,disabled:!0,description:Fc(o.label,n)});else{let t=Lc(e.app.menu??[],o,e.app),n=t.length===1&&(t[0].submenus?.length??0)>0;r.sections&&i===0&&!n&&t.length>0?t=[zc(o,t)]:o.shellLabel&&o.label&&t.length===1&&(t=[{...t[0],label:o.label,icon:o.icon||t[0].icon}]),a.push(...o.visible===!1?Ic(t):t)}}else o.submenus&&o.submenus.length>0?a.push({...o,submenus:Rc(o.submenus,t,n,r,i+1)}):a.push(o);return a}var zc=(e,t)=>({label:e.label,icon:e.icon,path:e.path,route:``,separator:!1,visible:e.visible,description:void 0,submenus:t});function Bc(e){let t=[];for(let n of e??[])F(n)?t.push(n):n.submenus&&n.submenus.length>0&&t.push(...Bc(n.submenus));return t}function Vc(e){let t=!1,n=[];for(let r of e){if(r.visible===!1){t=!0;continue}if(r.submenus&&r.submenus.length>0){let e=Vc(r.submenus);if(e!==r.submenus){t=!0,n.push({...r,submenus:e});continue}}n.push(r)}return t?n:e}function Hc(e,t){let n=kc(e,t);return Number.isNaN(n)?void 0:e[n]}function Uc(e){if(!e||e.separator||e.visible===!1||F(e)||e.unavailable)return;let t=e.submenus??[];if(t.length===0)return e;for(let e of t){let t=Uc(e);if(t)return t}}var Wc=new Set;function Gc(e){return Wc.add(e),()=>{Wc.delete(e)}}function Kc(){let e=[...Wc];Wc.clear(),e.forEach(e=>e())}function qc(e,t){return!t.callbackToken||!e.callbackToken||t.callbackToken===e.callbackToken||t.initiator!=null&&t.initiator!==e}var Jc=new Set([`http:`,`https:`]),Yc=()=>typeof window<`u`&&window.location?window.location.href:void 0,Xc=(e,t=Yc())=>{if(typeof e!=`string`||e.trim()===``)return;let n;try{n=t?new URL(e,t):new URL(e)}catch{return}if(!Jc.has(n.protocol))return;let r=!1;try{r=!!t&&new URL(t).origin===n.origin}catch{r=!1}return{href:n.href,sameOrigin:r}},Zc=e=>{console.warn(`mateu: refused to navigate to a URL that is not http(s) or relative:`,e)},Qc=(e,t={})=>{let n=Xc(e);return n?(n.sameOrigin&&!t.newTab?window.location.assign(n.href):window.open(n.href,`_blank`,`noopener,noreferrer`),!0):(Zc(e),!1)},$c=new Set([`http`,`https`,`mailto`,`tel`]),el=(e,t={})=>{if(e==null)return;let n=String(e).replace(/[\t\n\r]/g,``).replace(/^[\u0000- ]+/,``).trimEnd();if(n===``)return;let r=/^([a-z][a-z0-9+.-]*):/i.exec(n)?.[1]?.toLowerCase();if(!r||$c.has(r)||r===`data`&&t.allowData)return n},tl=class{get signal(){return(!this.controller||this.controller.signal.aborted)&&(this.controller=new AbortController),this.controller.signal}abort(){this.controller?.abort(),this.controller=void 0}},nl=class{replace(){return this.controller?.abort(),this.controller=new AbortController,this.controller.signal}get active(){return!!this.controller&&!this.controller.signal.aborted}clear(){this.controller?.abort(),this.controller=void 0}},rl=6e4;function il(e,t){if(e){if(/^https?:\/\//i.test(e))return e;if(!(!e.startsWith(`/`)||e.startsWith(`//`))){if(t&&/^https?:\/\//i.test(t))try{return new URL(e,new URL(t).origin).toString()}catch{return e}return e}}}function al(e,t){let n=t(e),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r}function ol(e,t,n){if(e.base64Content){let n=new t.Blob([al(e.base64Content,t.atob)],{type:e.mimeType||`application/octet-stream`});return{href:t.URL.createObjectURL(n),objectUrl:!0}}let r=il(e.url,n);return r?{href:r,objectUrl:!1}:void 0}function sl(e,t,n){e.objectUrl&&t.setTimeout(()=>t.URL.revokeObjectURL(e.href),n)}function cl(e,t,n){let r=n.document.createElement(`a`);r.href=e,r.download=t,r.rel=`noopener`,r.style.display=`none`,n.document.body.appendChild(r),r.click(),r.remove()}function ll(e,t,n){let r=t.document.createElement(`iframe`);r.setAttribute(`aria-hidden`,`true`),r.setAttribute(`tabindex`,`-1`),r.style.cssText=`position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden`,r.addEventListener(`load`,()=>{try{let e=r.contentWindow;if(!e)throw Error(`no frame window`);e.focus(),e.print()}catch{n()}t.setTimeout(()=>r.remove(),rl)},{once:!0}),r.src=e,t.document.body.appendChild(r)}function ul(e,t=window,n){if(!e||typeof e!=`object`||!t?.document)return`none`;let r=ol(e,t,n);if(!r)return`none`;let i=e.filename||`download`,a=e.disposition===`inline`;if(a&&e.print)return ll(r.href,t,()=>{r.objectUrl&&t.open(r.href,`_blank`)}),sl(r,t,rl),`printing`;if(a){let e=t.open(r.href,`_blank`);if(e){try{e.opener=null}catch{}return sl(r,t,rl),`opened`}}return cl(r.href,i,t),sl(r,t,1e3),`downloaded`}var dl=`
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
`,fl=new WeakSet;function pl(e){if(fl.has(e))return;fl.add(e);let t=e;if(typeof CSSStyleSheet<`u`&&Array.isArray(t.adoptedStyleSheets))try{let e=new CSSStyleSheet;e.replaceSync(dl),t.adoptedStyleSheets=[...t.adoptedStyleSheets,e];return}catch{}let n=e instanceof Document?e.head:e;if(!n)return;let r=(e instanceof Document?e:e.ownerDocument).createElement(`style`);r.setAttribute(`data-mateu-print`,`styles`),r.textContent=dl,n.appendChild(r)}function ml(e){let t=[],n=e=>{(e.querySelectorAll?e.querySelectorAll(`*`):[]).forEach(e=>{let r=e.shadowRoot;r&&(t.push(r),n(r))})};return n(e),t}function hl(e=document){pl(e);let t=ml(e);return t.forEach(pl),t.length+1}function gl(e=window){e?.document&&(hl(e.document),e.print())}var _l=class e extends _{constructor(...e){super(...e),this.id=``,this.baseUrl=``,this.callbackToken=``,this.connection=new tl,this.createElement=e=>{let t=e.data,n=document.createElement(t.name);for(let e in t.attributes)n.setAttribute(e,t.attributes[e]);for(let e in t.on)n.addEventListener(e,n=>{this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.on[e],parameters:{event:n}},bubbles:!0,composed:!0}))},{signal:this.connection.signal});return n},this.closeModal=()=>{let e=(this.shadowRoot??this).querySelectorAll(`mateu-dialog, mateu-drawer`);if(e&&e.length>0){e[e.length-1].close();return}this.dispatchEvent(new CustomEvent(`close-modal-requested`,{bubbles:!0,composed:!0}))},this.changeFavicon=e=>{let t=document.querySelector(`link[rel="icon"]`);t===null?(t=document.createElement(`link`),t.setAttribute(`rel`,`icon`),t.setAttribute(`href`,e),document.head.appendChild(t)):t.setAttribute(`href`,e)}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=ft.subscribe(e=>{if(e.command){let t=e.command;this.id==t.targetComponentId&&this.applyCommand(t)}if(qc(this,e)&&e.fragment){let t=e.fragment;this.id==t.targetComponentId&&(this.applyFragment(t),this.completeMenu(t))}})}completeMenu(e){if(e.component&&e.component.type==T.ClientSide){let t=e.component,n=t.metadata;if(n?.type==E.App){this.pendingMenuRetries?.forEach(e=>e()),this.pendingMenuRetries=new Set;let e=n,r=typeof window<`u`?window.location.pathname:``,i=Pc(e.menu??[],e.homeBaseUrl,r),a=Vc(i);(a!==e.menu||i!==e.menu)&&(t.metadata={...e,menu:a,navMenu:i});let o=Bc(i).filter(t=>t.visible!==!1||Oc(t,r)||!!e.homeBaseUrl&&t.baseUrl===e.homeBaseUrl);o.length>0&&this.askRemotes(t,i,o,new Map,0)}}}static{this.remoteMenuTimeoutMillis=2e4}static{this.remoteRetryDelays=[1e4,3e4,6e4]}askRemotes(t,n,r,i,a){let o=[],s=()=>{let e=Rc(n,i,void 0,{sections:t.metadata.variant===ht.HAMBURGER_SECTIONS});t.metadata={...t.metadata,menu:Vc(e),navMenu:e},this.requestUpdate()},c=Promise.allSettled(r.map(t=>Sc.runAction(t.baseUrl,t.route,`_empty`,``,t.baseUrl+`#`+t.route,void 0,void 0,void 0,t.params,this,!0,{quiet:!0,timeoutMillis:e.remoteMenuTimeoutMillis}).then(e=>{let n=this.remoteAppOf(e?.fragments,t);if(!n)throw Error(`no app in the answer of `+t.baseUrl);se(t.baseUrl,n.restSources),i.set(t,{app:n}),s()}).catch(()=>{i.set(t,{failed:!0}),o.push(t),s()})));de(c),c.then(()=>{if(o.length>0){let r=e.remoteRetryDelays[a],s,c=()=>{s!==void 0&&clearTimeout(s),u(),this.pendingMenuRetries?.delete(c)},l=()=>{c(),this.isConnected&&this.askRemotes(t,n,o,i,Math.min(a+1,e.remoteRetryDelays.length))},u=Gc(l);this.pendingMenuRetries?.add(c),r!==void 0&&(s=setTimeout(l,r))}})}remoteAppOf(e,t){let n=(e??[]).find(e=>e?.targetComponentId==t.baseUrl+`#`+t.route);if(n?.component?.type==T.ClientSide){let e=n.component.metadata;if(e?.type==E.App){let t=e;return{menu:t.menu??[],route:t.route,serverSideType:t.serverSideType,restSources:t.restSources}}}}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.connection.abort()}applyCommand(e){if(e.type==`SetWindowTitle`&&(document.title=e.data,a(document.title)),e.type==`Announce`){let t=e.data;t?.text&&a(t.text,{politeness:t.assertive?`assertive`:`polite`})}if(e.type==`SetFavicon`&&this.changeFavicon(e.data),e.type==`DispatchEvent`&&this.dispatchNamedEvent(e.data),e.type==`NavigateTo`){let t=e.data;t&&Qc(t)}if(e.type==`PushStateToHistory`){let t=e.data;t!==void 0&&this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:t},bubbles:!0,composed:!0}))}if(e.type==`RunAction`){let t=e.data;if(t&&t.actionId){if(t.targetComponentId){let e={command:{type:`RunAction`,data:{actionId:t.actionId},targetComponentId:t.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:``};setTimeout(()=>ft.next(e))}else this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:{}},bubbles:!0,composed:!0}))}}if(e.type==`MarkAsDirty`&&this.dispatchEvent(new CustomEvent(`dirty`,{detail:{},bubbles:!0,composed:!0})),e.type==`MarkAsClean`&&this.dispatchEvent(new CustomEvent(`clean`,{detail:{},bubbles:!0,composed:!0})),e.type==`DownloadFile`&&ul(e.data,void 0,this.baseUrl),e.type==`Print`&&gl(),e.type==`CloseModal`&&(this.closeModal(),this.dispatchNamedEvent(e.data)),e.type==`AddContentToHead`){let t=e.data;if(t&&t.name){if(t.attributes&&t.attributes.id&&document.getElementById(t.attributes.id))return;document.head.appendChild(this.createElement(e))}}if(e.type==`AddContentToBody`){let t=e.data;if(t&&t.name){if(t.attributes&&t.attributes.id&&document.getElementById(t.attributes.id))return;document.body.appendChild(this.createElement(e))}}}dispatchNamedEvent(e){if(e&&e.eventName){let t=this.component,n=t?.emitsName??t?.serverSideType,r=e.payload??e.detail;n&&r&&typeof r==`object`&&(r={...r,__source:n}),this.dispatchEvent(new CustomEvent(e.eventName,{detail:r,bubbles:!0,composed:!0}))}}};o([n()],_l.prototype,`id`,void 0),o([n()],_l.prototype,`baseUrl`,void 0);var vl=class extends _l{applyFragment(e){}manageActionRequestedEvent(e){}};o([n()],vl.prototype,`component`,void 0);var yl=class extends Aa{constructor(e){if(super(e),this.it=g,e.type!==Oa.CHILD)throw Error(this.constructor.directiveName+`() can only be used in child bindings`)}render(e){if(e===g||e==null)return this._t=void 0,this.it=e;if(e===u)return e;if(typeof e!=`string`)throw Error(this.constructor.directiveName+`() called with a non-string value`);if(e===this.it)return this._t;this.it=e;let t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}};yl.directiveName=`unsafeHTML`,yl.resultType=1;var bl=ka(yl),xl=e=>v.sanitize(e,{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:e=>!0,attributeNameCheck:e=>!/^on/i.test(e),allowCustomizedBuiltInElements:!1}}),I=e=>bl(e==null?e:xl(String(e))),Sl=`>>>= ... === !== **= <<= >>= >>> &&= ||= ??= => == != <= >= && || ?? ?. ++ -- ** << >> += -= *= /= %= &= |= ^= { } ( ) [ ] ; , < > + - * / % & | ^ ! ~ ? : = .`.split(` `),Cl=e=>/[A-Za-z_$À-￿]/.test(e),wl=e=>/[A-Za-z0-9_$À-￿]/.test(e),Tl=class extends SyntaxError{constructor(e,t,n){super(`${e} at ${n} in: ${t}`),this.source=t,this.position=n,this.name=`SyntaxError`}},El=(e,t)=>{let n=e[t];switch(n){case`n`:return[`
`,t+1];case`t`:return[`	`,t+1];case`r`:return[`\r`,t+1];case`b`:return[`\b`,t+1];case`f`:return[`\f`,t+1];case`v`:return[`\v`,t+1];case`0`:return[`\0`,t+1];case`x`:return[String.fromCharCode(parseInt(e.substr(t+1,2),16)),t+3];case`u`:if(e[t+1]===`{`){let n=e.indexOf(`}`,t);return[String.fromCodePoint(parseInt(e.substring(t+2,n),16)),n+1]}return[String.fromCharCode(parseInt(e.substr(t+1,4),16)),t+5];case`\r`:return[``,e[t+1]===`
`?t+2:t+1];case`
`:case`\u2028`:case`\u2029`:return[``,t+1];default:return[n,t+1]}},Dl=(e,t)=>{let n=0;for(;t<e.length;){let r=e[t];if(r===`'`||r===`"`){let n=r;for(t++;t<e.length&&e[t]!==n;)t+=e[t]===`\\`?2:1;t++;continue}if(r==="`"){for(t++;t<e.length&&e[t]!=="`";){if(e[t]===`\\`){t+=2;continue}if(e[t]===`$`&&e[t+1]===`{`){t=Dl(e,t+2)+1;continue}t++}t++;continue}if(r===`{`&&n++,r===`}`){if(n===0)return t;n--}t++}throw new Tl(`Unterminated template expression`,e,t)},Ol=e=>{let t=[],n=0,r=()=>{let e=t[t.length-1];return e?e.t===`num`||e.t===`str`||e.t===`tpl`||e.t===`re`?!1:e.t===`id`?[`typeof`,`void`,`in`,`instanceof`,`new`,`return`,`delete`].includes(e.v):e.t!==`p`||![`)`,`]`,`}`].includes(e.v):!0};for(;n<e.length;){let i=e[n];if(/\s/.test(i)){n++;continue}if(i===`/`&&e[n+1]===`/`){for(;n<e.length&&e[n]!==`
`;)n++;continue}if(i===`/`&&e[n+1]===`*`){let t=e.indexOf(`*/`,n+2);if(t<0)throw new Tl(`Unterminated comment`,e,n);n=t+2;continue}let a=n;if(/[0-9]/.test(i)||i===`.`&&/[0-9]/.test(e[n+1]??``)){let r=/^(0[xX][0-9a-fA-F_]+|0[oO][0-7_]+|0[bB][01_]+|(?:[0-9][0-9_]*)?\.?[0-9_]*(?:[eE][+-]?[0-9]+)?)(n?)/.exec(e.slice(n)),i=r[1].replace(/_/g,``);n+=r[0].length,t.push({t:`num`,v:r[2]?BigInt(i):Number(i),s:a});continue}if(i===`'`||i===`"`){let r=``;for(n++;n<e.length&&e[n]!==i;)if(e[n]===`\\`){let[t,i]=El(e,n+1);r+=t,n=i}else{if(e[n]===`
`)throw new Tl(`Unterminated string`,e,a);r+=e[n++]}if(n>=e.length)throw new Tl(`Unterminated string`,e,a);n++,t.push({t:`str`,v:r,s:a});continue}if(i==="`"){let r=[],i=[],o=``;for(n++;;){if(n>=e.length)throw new Tl(`Unterminated template literal`,e,a);let t=e[n];if(t==="`"){n++;break}if(t===`\\`){let[t,r]=El(e,n+1);o+=t,n=r;continue}if(t===`$`&&e[n+1]===`{`){let t=Dl(e,n+2);r.push(o),o=``,i.push(e.substring(n+2,t)),n=t+1;continue}o+=t,n++}r.push(o),t.push({t:`tpl`,quasis:r,exprs:i,s:a});continue}if(i===`/`&&r()){let r=n+1,i=!1;for(;r<e.length;){let t=e[r];if(t===`\\`){r+=2;continue}if(t===`[`)i=!0;else if(t===`]`)i=!1;else if(t===`/`&&!i)break;else if(t===`
`)break;r++}if(e[r]!==`/`)throw new Tl(`Unterminated regular expression`,e,a);let o=e.substring(n+1,r);r++;let s=``;for(;r<e.length&&/[a-z]/i.test(e[r]);)s+=e[r++];n=r,t.push({t:`re`,pattern:o,flags:s,s:a});continue}if(Cl(i)){let r=n+1;for(;r<e.length&&wl(e[r]);)r++;t.push({t:`id`,v:e.substring(n,r),s:a}),n=r;continue}let o=Sl.find(t=>e.startsWith(t,n));if(!o)throw new Tl(`Unexpected character '${i}'`,e,n);if(o===`?.`&&/[0-9]/.test(e[n+2]??``)){t.push({t:`p`,v:`?`,s:a}),n+=1;continue}t.push({t:`p`,v:o,s:a}),n+=o.length}return t.push({t:`eof`,s:n}),t},kl={"??":1,"||":2,"&&":3,"|":4,"^":5,"&":6,"==":7,"!=":7,"===":7,"!==":7,"<":8,">":8,"<=":8,">=":8,in:8,instanceof:8,"<<":9,">>":9,">>>":9,"+":10,"-":10,"*":11,"/":11,"%":11,"**":12},Al=new Set([`=`,`+=`,`-=`,`*=`,`/=`,`%=`,`**=`,`<<=`,`>>=`,`>>>=`,`&=`,`|=`,`^=`,`&&=`,`||=`,`??=`]),jl=class{constructor(e,t){this.tokens=e,this.src=t,this.i=0}peek(e=0){return this.tokens[Math.min(this.i+e,this.tokens.length-1)]}next(){return this.tokens[this.i++]}isP(e,t=0){let n=this.peek(t);return n.t===`p`&&n.v===e}isId(e,t=0){let n=this.peek(t);return n.t===`id`&&n.v===e}fail(e,t=this.peek()){throw new Tl(e,this.src,t.s)}expectP(e){this.isP(e)||this.fail(`Expected '${e}'`),this.i++}parseAll(){let e=this.sequence();if(this.isP(`;`)&&this.i++,this.peek().t!==`eof`){let e=this.peek();e.t===`p`&&(Al.has(e.v)||e.v===`++`||e.v===`--`)&&this.fail(`Assignments are not allowed in expressions`),this.fail(`Unexpected token`)}return e}sequence(){let e=this.assignment();if(!this.isP(`,`))return e;let t=[e];for(;this.isP(`,`);)this.i++,t.push(this.assignment());return{k:`seq`,items:t}}assignment(){let e=this.tryArrow();if(e)return e;let t=this.conditional(),n=this.peek();return n.t===`p`&&Al.has(n.v)&&this.fail(`Assignments are not allowed in expressions`),t}tryArrow(){let e=this.peek();if(e.t===`id`&&this.isP(`=>`,1)&&!kl[e.v])return this.i+=2,{k:`arrow`,params:[e.v],rest:void 0,body:this.arrowBody()};if(!this.isP(`(`))return;let t=1,n=[],r;if(!this.isP(`)`,t))for(;;){if(this.isP(`...`,t)){let e=this.peek(t+1);if(e.t!==`id`)return;r=e.v,t+=2;break}let e=this.peek(t);if(e.t!==`id`)return;if(n.push(e.v),t++,this.isP(`,`,t)){t++;continue}break}if(!(!this.isP(`)`,t)||!this.isP(`=>`,t+1)))return this.i+=t+2,{k:`arrow`,params:n,rest:r,body:this.arrowBody()}}arrowBody(){return this.isP(`{`)&&this.fail(`Arrow functions with a block body are not supported; use an expression body`),this.assignment()}conditional(){let e=this.binary(0);if(!this.isP(`?`))return e;this.i++;let t=this.assignment();return this.expectP(`:`),{k:`cond`,test:e,consequent:t,alternate:this.assignment()}}binaryOp(){let e=this.peek();if(e.t===`p`&&kl[e.v]!==void 0||e.t===`id`&&(e.v===`in`||e.v===`instanceof`))return e.v}binary(e){let t=this.unary();for(;;){let n=this.binaryOp();if(!n)return t;let r=kl[n];if(r<e)return t;this.i++;let i=n===`**`?this.binary(r):this.binary(r+1);t=n===`&&`||n===`||`||n===`??`?{k:`logic`,op:n,left:t,right:i}:{k:`bin`,op:n,left:t,right:i}}}unary(){let e=this.peek();if(e.t===`p`&&[`!`,`-`,`+`,`~`].includes(e.v)||(e.t===`p`&&(e.v===`++`||e.v===`--`)&&this.fail(`Assignments are not allowed in expressions`),e.t===`id`&&(e.v===`typeof`||e.v===`void`)))return this.i++,{k:`unary`,op:e.v,arg:this.unary()};e.t===`id`&&e.v===`delete`&&this.fail(`'delete' is not allowed in expressions`);let t=this.postfix();return(this.isP(`++`)||this.isP(`--`))&&this.fail(`Assignments are not allowed in expressions`),t}args(){this.expectP(`(`);let e=[];for(;!this.isP(`)`);)this.isP(`...`)?(this.i++,e.push({k:`spread`,arg:this.assignment()})):e.push(this.assignment()),this.isP(`)`)||this.expectP(`,`);return this.i++,e}postfix(){let e;if(this.isId(`new`)){this.i++;let t=this.primary();for(;this.isP(`.`);){this.i++;let e=this.next();e.t!==`id`&&this.fail(`Expected a property name`,e),t={k:`member`,obj:t,prop:e.v,optional:!1}}let n=this.isP(`(`)?this.args():[];e={k:`new`,callee:t,args:n}}else e=this.primary();let t=!1;for(;;)if(this.isP(`.`)){this.i++;let t=this.next();t.t!==`id`&&this.fail(`Expected a property name`,t),e={k:`member`,obj:e,prop:t.v,optional:!1}}else if(this.isP(`?.`)){if(this.i++,t=!0,this.isP(`(`))e={k:`call`,callee:e,args:this.args(),optional:!0};else if(this.isP(`[`)){this.i++;let t=this.sequence();this.expectP(`]`),e={k:`member`,obj:e,prop:t,optional:!0}}else{let t=this.next();t.t!==`id`&&this.fail(`Expected a property name`,t),e={k:`member`,obj:e,prop:t.v,optional:!0}}}else if(this.isP(`[`)){this.i++;let t=this.sequence();this.expectP(`]`),e={k:`member`,obj:e,prop:t,optional:!1}}else if(this.isP(`(`))e={k:`call`,callee:e,args:this.args(),optional:!1};else if(this.peek().t===`tpl`)this.fail(`Tagged templates are not supported`);else break;return t?{k:`chain`,expr:e}:e}primary(){let e=this.next();switch(e.t){case`num`:return{k:`lit`,v:e.v};case`str`:return{k:`lit`,v:e.v};case`re`:return{k:`re`,pattern:e.pattern,flags:e.flags};case`tpl`:return{k:`tpl`,quasis:e.quasis,exprs:e.exprs.map(e=>Ml(e))};case`id`:switch(e.v){case`true`:return{k:`lit`,v:!0};case`false`:return{k:`lit`,v:!1};case`null`:return{k:`lit`,v:null};case`undefined`:return{k:`lit`,v:void 0};case`this`:return{k:`lit`,v:void 0};case`function`:case`class`:case`import`:case`await`:case`yield`:case`super`:this.fail(`'${e.v}' is not allowed in expressions`,e)}return{k:`id`,name:e.v};case`p`:if(e.v===`(`){let e=this.sequence();return this.expectP(`)`),e}if(e.v===`[`){let e=[];for(;!this.isP(`]`);){if(this.isP(`,`)){this.i++,e.push(null);continue}this.isP(`...`)?(this.i++,e.push({k:`spread`,arg:this.assignment()})):e.push(this.assignment()),this.isP(`]`)||this.expectP(`,`)}return this.i++,{k:`arr`,items:e}}if(e.v===`{`){let e=[];for(;!this.isP(`}`);){if(this.isP(`...`))this.i++,e.push({k:`spread`,arg:this.assignment()});else{let t=this.next(),n;t.t===`id`||t.t===`str`?n=t.v:t.t===`num`?n=String(t.v):t.t===`p`&&t.v===`[`?(n=this.assignment(),this.expectP(`]`)):this.fail(`Unexpected token in object literal`,t),this.isP(`:`)?(this.i++,e.push({key:n,value:this.assignment()})):t.t===`id`?e.push({key:n,value:{k:`id`,name:t.v}}):this.fail(`Expected ':'`)}this.isP(`}`)||this.expectP(`,`)}return this.i++,{k:`obj`,props:e}}}this.fail(`Unexpected token`,e)}},Ml=e=>new jl(Ol(e),e).parseAll(),Nl=new Set([`constructor`,`__proto__`,`prototype`,`__defineGetter__`,`__defineSetter__`,`__lookupGetter__`,`__lookupSetter__`]),Pl=new Set([`call`,`apply`,`bind`,`caller`,`arguments`]),Fl=Object.freeze({Math,JSON,Number,String,Boolean,Array,Object,Date,Intl,RegExp,Set,Map,parseInt,parseFloat,isNaN,isFinite,encodeURIComponent,decodeURIComponent,encodeURI,decodeURI,NaN:NaN,Infinity:1/0}),Il=new Set([Date,RegExp,Set,Map,Array,Number,String,Boolean,Object,Intl.NumberFormat,Intl.DateTimeFormat,Intl.Collator,Intl.PluralRules,Intl.RelativeTimeFormat,Intl.ListFormat]),Ll=new Set([Function,eval,Object.defineProperty,Object.defineProperties,Object.setPrototypeOf,Object.assign,Object.freeze,Object.seal,Object.preventExtensions,Reflect?.set,Reflect?.defineProperty,Reflect?.setPrototypeOf,Reflect?.deleteProperty].filter(Boolean)),Rl=Symbol(`mateu.expression.shortCircuit`),zl=e=>typeof e==`symbol`?e:String(e),Bl=e=>{if(typeof e==`string`&&Nl.has(e))throw TypeError(`Access to '${e}' is not allowed in expressions`)},Vl=e=>e.k===`id`?e.name:e.k===`member`?Vl(e.obj)+(typeof e.prop==`string`?`.`+e.prop:`[…]`):e.k===`call`?Vl(e.callee)+`(…)`:`expression`,Hl=(e,t)=>{for(let n=e;n;n=n.parent)if(Object.prototype.hasOwnProperty.call(n.vars,t))return{found:!0,value:n.vars[t]};return Object.prototype.hasOwnProperty.call(Fl,t)?{found:!0,value:Fl[t]}:{found:!1,value:void 0}},Ul=(e,t,n)=>{if(Bl(t),typeof e==`function`&&typeof t==`string`&&Pl.has(t))throw TypeError(`Access to '${t}' is not allowed in expressions`);if(e==null)throw TypeError(`Cannot read properties of ${e} (reading '${String(t)}') in ${Vl(n)}`);return e[t]},Wl=(e,t)=>{let n=[];for(let r of e)r.k===`spread`?n.push(...L(r.arg,t)):n.push(L(r,t));return n},Gl=(e,t,n,r)=>{if(typeof e!=`function`)throw TypeError(`${Vl(r)} is not a function`);if(Ll.has(e))throw TypeError(`${Vl(r)} is not allowed in expressions`);return Reflect.apply(e,t,n)},Kl=(e,t,n)=>{let r=t,i=n;switch(e){case`+`:return r+i;case`-`:return r-i;case`*`:return r*i;case`/`:return r/i;case`%`:return r%i;case`**`:return r**i;case`==`:return r==i;case`!=`:return r!=i;case`===`:return r===i;case`!==`:return r!==i;case`<`:return r<i;case`>`:return r>i;case`<=`:return r<=i;case`>=`:return r>=i;case`|`:return r|i;case`^`:return r^i;case`&`:return r&i;case`<<`:return r<<i;case`>>`:return r>>i;case`>>>`:return r>>>i;case`in`:return zl(r)in Object(i);case`instanceof`:return r instanceof i}throw SyntaxError(`Unknown operator `+e)},L=(e,t)=>{switch(e.k){case`lit`:return e.v;case`re`:return new RegExp(e.pattern,e.flags);case`id`:{let{found:n,value:r}=Hl(t,e.name);if(!n)throw ReferenceError(`${e.name} is not defined`);return r}case`tpl`:{let n=e.quasis[0];for(let r=0;r<e.exprs.length;r++)n+=String(L(e.exprs[r],t))+e.quasis[r+1];return n}case`arr`:{let n=[];for(let r of e.items)r===null?n.length++:r.k===`spread`?n.push(...L(r.arg,t)):n.push(L(r,t));return n}case`obj`:{let n={};for(let r of e.props){if(`k`in r&&r.k===`spread`){Object.assign(n,L(r.arg,t));continue}let e=r,i=typeof e.key==`string`?e.key:zl(L(e.key,t));Bl(i),n[i]=L(e.value,t)}return n}case`chain`:try{return L(e.expr,t)}catch(e){if(e===Rl)return;throw e}case`member`:{let n=L(e.obj,t);if(e.optional&&n==null)throw Rl;return Ul(n,typeof e.prop==`string`?e.prop:zl(L(e.prop,t)),e)}case`call`:{let n,r;if(e.callee.k===`member`){let i=e.callee;if(n=L(i.obj,t),i.optional&&n==null)throw Rl;let a=typeof i.prop==`string`?i.prop:zl(L(i.prop,t));r=Ul(n,a,i)}else r=L(e.callee,t);if(e.optional&&r==null)throw Rl;return Gl(r,n,Wl(e.args,t),e.callee)}case`new`:{let n=L(e.callee,t);if(!Il.has(n))throw TypeError(`'new ${Vl(e.callee)}' is not allowed in expressions`);return Reflect.construct(n,Wl(e.args,t))}case`unary`:{if(e.op===`typeof`)return e.arg.k===`id`&&!Hl(t,e.arg.name).found?`undefined`:typeof L(e.arg,t);let n=L(e.arg,t);switch(e.op){case`!`:return!n;case`-`:return-n;case`+`:return+n;case`~`:return~n;case`void`:return}throw SyntaxError(`Unknown operator `+e.op)}case`logic`:{let n=L(e.left,t);return e.op===`&&`?n&&L(e.right,t):e.op===`||`?n||L(e.right,t):n??L(e.right,t)}case`bin`:return Kl(e.op,L(e.left,t),L(e.right,t));case`cond`:return L(e.test,t)?L(e.consequent,t):L(e.alternate,t);case`seq`:{let n;for(let r of e.items)n=L(r,t);return n}case`arrow`:{let{params:n,rest:r,body:i}=e;return(...e)=>{let a=Object.create(null);return n.forEach((t,n)=>{a[t]=e[n]}),r&&(a[r]=e.slice(n.length)),L(i,{vars:a,parent:t})}}case`spread`:throw SyntaxError(`Unexpected spread`)}},ql=500,Jl=new Map,Yl=e=>{let t=Jl.get(e);return t||(t=Ml(e),Jl.size>=ql&&Jl.delete(Jl.keys().next().value),Jl.set(e,t)),t},Xl=(e,t={},n={})=>{let r=n.cache===!1?Ml(e):Yl(e),i=Object.create(null);for(let e of Object.keys(t))i[e]=t[e];return L(r,{vars:i})},Zl=(e,t)=>{let n=e[t];for(let r=t+1;r<e.length;r++){let t=e[r];if(t===`\\`){r++;continue}if(t===n)return r+1}throw SyntaxError(`Unterminated string literal in template expression`)},Ql=(e,t)=>{for(let n=t+1;n<e.length;n++){let t=e[n];if(t===`\\`){n++;continue}if(t==="`")return n+1;t===`$`&&e[n+1]===`{`&&(n=$l(e,n+2))}throw SyntaxError(`Unterminated template literal in template expression`)},$l=(e,t)=>{let n=0,r=t;for(;r<e.length;){let t=e[r];if(t===`'`||t===`"`){r=Zl(e,r);continue}if(t==="`"){r=Ql(e,r);continue}if(t===`{`)n++;else if(t===`}`){if(n===0)return r;n--}r++}throw SyntaxError('Unterminated ${ expression in "'+e+`"`)},eu=e=>{let t=[],n=``,r=0;for(;r<e.length;){let i=e[r];if(i===`\\`&&e[r+1]===`\\`){n+=`\\`,r+=2;continue}if(i===`\\`&&e[r+1]===`$`&&e[r+2]===`{`){n+="${",r+=3;continue}if(i===`$`&&e[r+1]===`{`){let i=$l(e,r+2);n&&t.push({lit:n}),n=``,t.push({expr:e.substring(r+2,i)}),r=i+1;continue}n+=i,r++}return n&&t.push({lit:n}),t},tu=(e,t)=>Xl(e,t),nu=(e,t)=>{let n=``;for(let r of eu(e)){if(`lit`in r){n+=r.lit;continue}let e=ru.exec(r.expr);n+=e?e[1]:String(tu(r.expr,t)??``)}return n},ru=/^\s*i18n\.([A-Za-z0-9_][A-Za-z0-9_.-]*)\s*$/,iu=(e,t,n)=>({state:e??{},data:t??{},...n});function au(e,t,n,r){if(!e?.includes("${"))return e;try{return nu(e,iu(t,n,r))}catch(t){return console.warn(`Mateu: could not interpolate "${e}":`,t),e}}var ou=(e,t,n)=>{if(e&&e.indexOf("${")>=0)try{return nu(e,iu(t,n))}catch(e){return e.message}return e},su=(e,t,n,r,i)=>{if(!e?.includes("${"))return e;let a=iu(t,n,{appState:r??{},appData:i??{}}),o=e;try{o=nu(e,a)}catch(a){o=`when evaluating `+e+` :`+a+`, where data is `+n+` and state is `+t+` and app state is `+r+` and app data is `+i,console.error(a,o,t,n,r,i)}return o},cu=(e,t)=>{for(let n=0;n<e.length;n++){let r=e[n];t===`code`?(r===`'`||r===`"`||r==="`")&&(t=r):r===`\\`?n++:r===t&&(t=`code`)}return t},lu=e=>e.replace(/[\\'"`\n\r\u2028\u2029]|\$\{/g,e=>{switch(e){case`
`:return`\\n`;case`\r`:return`\\r`;case`\u2028`:return`\\u2028`;case`\u2029`:return`\\u2029`;case"${":return"\\${";default:return`\\`+e}}),uu=e=>e===null?`null`:e===void 0?`undefined`:typeof e==`number`||typeof e==`boolean`?String(e):typeof e==`bigint`?e+`n`:JSON.stringify(e)??`undefined`,du=(e,t,n,r,i,a)=>{let o=iu(t,n,{appState:r??{},appData:i??{},...a}),s=``,c=`code`;for(let t of eu(e))if(`lit`in t)s+=t.lit,c=cu(t.lit,c);else{let e=tu(t.expr,o);s+=c===`code`?uu(e):lu(String(e))}return Xl(s,o,{cache:!1})},fu=(e,t,n,r)=>Xl(e,iu(t,n,r)),pu=(e,t,n,r)=>nu(e,iu(t,n,r)),mu=e=>encodeURIComponent(e).replace(/[!'()*]/g,e=>`%`+e.charCodeAt(0).toString(16).toUpperCase());function hu(e,t,n,r){if(!e?.includes("${"))return e;let i=iu(t,n,r),a=eu(e),o=a[0],s=!!o&&`lit`in o&&o.lit.includes(`://`),c=``,l=``;return a.forEach((t,n)=>{if(`lit`in t){if(s){let e=c===``?t.lit.indexOf(`://`)+3:0;/[/?#]/.test(t.lit.substring(e))&&(s=!1)}c+=t.lit,l+=t.lit;return}let r=String(tu(t.expr,i)??``);if(s||n===0){if(/^\s*state\b/.test(t.expr))throw Error(`A client state value cannot choose the origin of a URL: `+e);l+=r}else if(/[?#]/.test(c))l+=mu(r);else{if(r===`.`||r===`..`)throw Error(`A dot segment is not a valid path value: `+r);l+=mu(r)}}),l}function gu(e,t,n){let r=r=>au(r,e,t,n);return r.url=r=>hu(r,e,t,n),r}var _u=`display:inline-flex; align-items:center; justify-content:center; width:2rem; height:2rem; border-radius:50%; background:var(--lumo-contrast-10pct,#e0e0e0); color:var(--lumo-secondary-text-color,#555); font-size:.8rem; font-weight:600; overflow:hidden; flex:none;`,vu=(e,t)=>t||(typeof e==`string`&&e?e.trim().split(/\s+/).map(e=>e[0]).slice(0,2).join(``).toUpperCase():``),yu=(e,t,n)=>{let r=e.metadata,i=bu(r.name,t,n);return l`<span style="${_u}${e.style}" class="${e.cssClasses}"
                      title="${i||p}" slot="${e.slot??p}">
        ${r.image?l`<img src="${r.image}" alt="${i}" style="width:100%;height:100%;object-fit:cover;">`:vu(i,r.abbreviation)}
    </span>`},bu=(e,t,n)=>typeof e==`string`&&e.includes("${")?au(e,t,n):e,xu=e=>{let t=e.metadata,n=t.avatars??[],r=t.maxItemsVisible&&t.maxItemsVisible>0?t.maxItemsVisible:n.length,i=n.slice(0,r),a=n.length-i.length,o=`margin-left:-0.4rem; border:2px solid var(--lumo-base-color,#fff);`;return l`<span style="display:inline-flex; ${e.style}" class="${e.cssClasses}" slot="${e.slot??p}">
        ${i.map(e=>l`<span style="${_u}${o}" title="${e.name||p}">
            ${e.img?l`<img src="${e.img}" style="width:100%;height:100%;object-fit:cover;">`:vu(e.name??``,e.abbr)}
        </span>`)}
        ${a>0?l`<span style="${_u}${o}">+${a}</span>`:p}
    </span>`},Su=(e,t,n)=>{let r=e.metadata;return l`<span theme="badge ${r.color} ${r.pill?`pill`:``} ${r.small?`small`:``} ${r.primary?`primary`:``}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??p}">${bu(r.text,t,n)}</span>`},Cu=(e,t,n,r)=>{let i=bu(e.text,t,n);if(!i)return p;let a=bu(e.color,t,n);a==`SUCCESS`&&(a=`success`),a==`ERROR`&&(a=`error`),a==`DANGER`&&(a=`error`),a==`WARNING`&&(a=`warning`),a==`INFO`&&(a=`info`),a==`PRIMARY`&&(a=`primary`),a==`SECONDARY`&&(a=`secondary`),a==`TERTIARY`&&(a=`tertiary`),a==`QUATERNARY`&&(a=`quaternary`),a==`LIGHT`&&(a=`light`),a==`DARK`&&(a=`dark`);let o=e.pill||r?.pill;return l`<span theme="badge ${a} ${o?`pill`:``} ${e.small?`small`:``} ${e.primary?`primary`:``}">${i}</span>`},R=new class{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(e){if(this.componentRenderer=e,typeof window<`u`){let t=e.supportedClientSideTypes?.();window.__mateuRendererInfo={name:e.rendererName?.()??e.constructor?.name??`unknown`,supportedTypes:t?[...t].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(e){this.useShadowRoot=e}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(e){this.afterRenderHook=e}getAfterRenderHook(){return this.afterRenderHook}},wu=(e,t,n,r,i,a,o,s,c)=>(t.slot=s,z(e,t,n,r,i,a,o,c)),Tu=e=>{if(!e)return e;let t=/margin\s*:\s*(?:0\s+)?auto/.test(e)&&/max-width\s*:/.test(e),n=/(^|[;\s])width\s*:/.test(e);return t&&!n?`width: 100%; box-sizing: border-box; ${e}`:e},z=(e,t,n,r,i,a,o,s)=>{if(!t)return l``;if(t.type==T.ClientSide){let c=R.get().renderClientSideComponent(e,t,n,r,i,a,o,s);return Na()&&t.id?l`${Ia(t.id,c)}`:c}let c=e.route,u=e.consumedRoute;return l`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${u}"
                         baseUrl="${n}"
                         slot="${t.slot??p}"
                         style="${Tu(t.style)}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...r}}"
                         .data="${{...i}}"
                         .appState="${a}"
                         .appData="${o}"
        >
       </mateu-component>`},Eu=e=>e===`back`||e===`backToList`||e===`cancel-view`,Du=e=>!!e&&e.startsWith(`cancel`)&&!Eu(e),Ou=e=>Eu(e)||Du(e);function ku(e,t,n,r){if(!e||t==null)return;let i=au(e,n,r,{row:t});if(!(!i||i===e||i.includes("${")))return i}function Au(e,t){for(let n of[`route-changed`,`navigate-to-requested`])e.dispatchEvent(new CustomEvent(n,{detail:{route:t},bubbles:!0,composed:!0}))}function ju(e){if(!e)return[];let t=new Set;for(let n of e.matchAll(/\$\{\s*row\.([A-Za-z0-9_]+)/g))t.add(n[1]);return[...t]}var Mu=Cc,Nu=wc,Pu=e=>(e||typeof document<`u`&&document.documentElement?.lang||typeof navigator<`u`&&navigator.language||``).toLowerCase().startsWith(`es`),Fu=new Map;function Iu(e,t,n={}){let{crumbs:i,matched:a,pending:o}=Ac(e,t);if(!a)return[];let s=[...i];if(o){let e=Nu(n.title);return e&&e!==s[s.length-1]?.text&&s.push({text:e}),s.length<2?[]:s}let c=Mu(t).slice(a.length).split(`/`).filter(Boolean),l=Pu(n.lang);if(c.length>0){let e=decodeURIComponent(c[0]);if(e===`new`||e===`create`)s.push({text:r(`newRecord`,l?`es`:`en`)});else{let t=a+`/`+c[0],i=Nu(n.title);c.length===1&&i&&Fu.set(t,i),s.push({text:Fu.get(t)||e,route:t}),c[1]===`edit`?s.push({text:r(`edit`,l?`es`:`en`)}):c.length>1&&s.push({text:i||decodeURIComponent(c[c.length-1])})}}if(s.length<2)return[];let u=s[s.length-1];return s[s.length-1]={text:u.text},s}var Lu,Ru=!1,zu,Bu,Vu=new Set;function Hu(e,t,n,r){if(zu&&zu!==e&&zu.isConnected!==!1)return;zu=e;let i=Lu!==t||Ru!==!!n;Lu=t,Ru=!!n,Bu=r,i&&Vu.forEach(e=>e())}function Uu(e){return Vu.add(e),()=>{Vu.delete(e)}}function Wu(e){if(!Bu)return!1;let t=Mc(Lu,e);return t?(Bu(t,e),!0):!1}function Gu(e,t){return Ru?[]:Iu(Lu,e,t)}var Ku=new WeakMap,qu=e=>{let t=Ku.get(e);return t===void 0&&(t=typeof window<`u`?window.location.pathname:``,Ku.set(e,t)),t},Ju=new class{constructor(){this._dirty=!1,this._installed=!1,this.message=r(`unsavedChanges`),this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=e=>{this._dirty&&(e.preventDefault(),e.returnValue=``)}}install(){this._installed||(this._installed=!0,document.addEventListener(`dirty`,this._onDirty),document.addEventListener(`clean`,this._onClean),window.addEventListener(`beforeunload`,this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;let e=window.confirm(this.message);return e&&(this._dirty=!1),e}},Yu=`_record`,Xu=e=>String(e??``).normalize(`NFD`).replace(/[̀-ͯ]/g,``).toLowerCase().trim(),Zu=(e,t)=>{let n=Xu(t).split(/\s+/).filter(Boolean);return n.length===0?e:e.filter(e=>{let t=Xu(e.label)+` `+Xu(e.description);return n.every(e=>t.includes(e))})},Qu=e=>(e.options??[]).find(t=>String(t.value)===String(e.value??``)),$u=(e,t)=>e.disabled||t==null||String(t)===String(e.value??``)?null:{actionId:e.actionId,parameters:{[Yu]:t}},B=h`
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
`,ed=class extends _{constructor(...e){super(...e),this.open=!1,this.filter=``,this.active=0}pick(e){if(!this.switcher)return;let t=$u(this.switcher,e);this.open=!1,this.filter=``,t&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:t,bubbles:!0,composed:!0}))}visible(){return Zu(this.switcher?.options??[],this.filter)}onKey(e){let t=this.visible();e.key===`ArrowDown`?(e.preventDefault(),this.open=!0,this.active=Math.min(t.length-1,this.active+1)):e.key===`ArrowUp`?(e.preventDefault(),this.active=Math.max(0,this.active-1)):e.key===`Enter`?(e.preventDefault(),this.open&&t[this.active]&&this.pick(t[this.active].value)):e.key===`Escape`&&(this.open=!1,this.filter=``)}render(){let e=this.switcher;if(!e)return p;let t=Qu(e),n=e.label??(e.type===`context`?r(`context`):``);if(!e.searchable)return l`
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
            </div>`}static{this.styles=[B,h`
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
    `]}};o([n({attribute:!1})],ed.prototype,`switcher`,void 0),o([s()],ed.prototype,`open`,void 0),o([s()],ed.prototype,`filter`,void 0),o([s()],ed.prototype,`active`,void 0),ed=o([i(`mateu-record-switcher`)],ed);var td=e=>{let t=[];return e.color&&e.color!==`normal`&&e.color!==`none`&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle===`tertiaryInline`?`tertiary-inline`:e.buttonStyle),e.size&&e.size!==`none`&&e.size!==`normal`&&t.push(e.size),t.length?t.join(` `):void 0},nd=e=>{let t=td(e)??``,n=[];return t.includes(`primary`)&&n.push(`primary`),t.includes(`tertiary`)&&n.push(`tertiary`),(t.includes(`error`)||e.color===`error`)&&n.push(`danger`),n.join(` `)},rd=class extends _{constructor(...e){super(...e),this.appState={},this.appData={},this._overflowOpen=!1,this._overflowN=0,this._secCount=0,this._onDocClick=e=>{e.composedPath().includes(this)||(this._overflowOpen=!1)},this._resetOverflow=()=>{this._overflowN===0?this.requestUpdate():this._overflowN=0},this.handleButtonClick=e=>{this._overflowOpen=!1;let t=e.route?au(e.route,this.state,this.data):void 0;if(t&&!t.includes("${")){Au(this,t);return}this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{crud_selected_items:this.listingSelection()}},bubbles:!0,composed:!0}))},this.listingSelection=()=>{let e=this.findSiblingCrud()?.state?.crud_selected_items;return Array.isArray(e)?e:[]},this.findSiblingCrud=()=>{let e=t=>{for(let n of Array.from(t.querySelectorAll(`*`))){if(n.tagName===`MATEU-TABLE-CRUD`)return n;if(n.shadowRoot){let t=e(n.shadowRoot);if(t)return t}}return null},t=this;for(;t;){let n=t,r=n.parentElement??(n.getRootNode?.()instanceof ShadowRoot?n.getRootNode().host:null);if(!r)break;let i=e(r);if(i)return i;t=r}return null},this.evalLabel=e=>au(e,this.state,this.data),this.renderBackChevron=e=>{if((this.data??{})[e.actionId+`.hidden`])return p;let t=this.evalLabel(e.label);return l`
        <button class="back-chevron"
                data-action-id="${e.id}"
                title="${t}"
                aria-label="${t}"
                @click="${()=>this.handleButtonClick(e)}">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>`},this.renderBtn=e=>{if((this.data??{})[e.actionId+`.hidden`])return p;let t=this.evalLabel(e.label),n=R.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e));return n?Ra(e,n):Ra(e,l`
        <button class="mtb ${nd(e)}"
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
        `},this.renderPeerNav=e=>R.get()?.renderPeerNav?.(e)||l`
            <div style="display: flex; gap: var(--lumo-space-xs, .25rem); align-items: center;" class="peer-nav">
                <button class="mtb tertiary peer-nav-prev"
                        title="${e.prevLabel??r(`previous`)}"
                        aria-label="${e.prevLabel??r(`previous`)}"
                        ?disabled="${!e.prevRoute}"
                        @click="${()=>{e.prevRoute&&Qc(e.prevRoute)}}">‹</button>
                <button class="mtb tertiary peer-nav-next"
                        title="${e.nextLabel??r(`next`)}"
                        aria-label="${e.nextLabel??r(`next`)}"
                        ?disabled="${!e.nextRoute}"
                        @click="${()=>{e.nextRoute&&Qc(e.nextRoute)}}">›</button>
            </div>
        `,this.renderSwitcher=e=>R.get()?.renderRecordSwitcher?.(e)||l`<mateu-record-switcher .switcher=${e}></mateu-record-switcher>`}connectedCallback(){super.connectedCallback(),document.addEventListener(`click`,this._onDocClick),this._ro=new ResizeObserver(()=>this._resetOverflow()),this._ro.observe(this),window.addEventListener(`resize`,this._resetOverflow),this._offShellMenu=Uu(()=>this.requestUpdate())}disconnectedCallback(){this._offShellMenu?.(),this._offShellMenu=void 0,document.removeEventListener(`click`,this._onDocClick),window.removeEventListener(`resize`,this._resetOverflow),this._ro?.disconnect(),this._ro=void 0,super.disconnectedCallback()}updated(e){if(e.has(`_overflowOpen`)&&this._overflowOpen&&this._placeOverflowMenu(),e.has(`metadata`)||e.has(`data`)){this._resetOverflow();return}if(this._inDialog()){this._overflowN!==0&&(this._overflowN=0);return}let t=this.renderRoot.querySelector(`.actions-cluster`);if(!t||this._secCount===0)return;let n=t.closest(`.form-header, .no-header-row`);if(!n)return;let r=t.getBoundingClientRect(),i=n.getBoundingClientRect();(r.top-i.top>8||r.right>i.right+1)&&this._overflowN<this._secCount&&(this._overflowN+=1)}_inDialog(){let e=this;for(;e;){let t=e.tagName;if(t===`VAADIN-DIALOG-OVERLAY`||t===`DIALOG`||e.getAttribute?.(`role`)===`dialog`)return!0;e=e.parentElement??e.getRootNode?.()?.host}return!1}_placeOverflowMenu(){let e=this.renderRoot.querySelector(`.overflow-menu`);e&&(e.classList.remove(`flip`),e.getBoundingClientRect().left<0&&e.classList.add(`flip`))}crumbsOf(e,t){return e?.breadcrumbs&&e.breadcrumbs.length>0?e.breadcrumbs.map(e=>({text:e.text,route:e.link||void 0})):t>0||e?.type!==E.Page||e.noBreadcrumbs?[]:Gu(qu(e),{title:e.title,pageType:e.pageType})}goToCrumb(e){if(/^[a-z][a-z0-9+.-]*:/i.test(e)){Qc(e);return}Ju.confirmLeave()&&(Wu(e)||Au(this,e))}render(){let e=this.metadata;if(!e)return l``;let t=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0,n=e.toolbar??[],i=!e.noHeader,a=n.filter(e=>Ou(e.actionId)&&!(i&&Eu(e.actionId))),o=i?n.filter(e=>Eu(e.actionId)):[],s=n.filter(e=>!Ou(e.actionId)),c=a.length>0&&s.length>0?l`<span class="toolbar-divider"></span>`:p,u=e.overline,d=e.title?void 0:e.titlePlaceholder,f=e.avatar||e.title||e.subtitle||u||d||e.kpis?.length>0||e.header?.length>0||n.length>0||!!t||!!e.switcher,m=e.level??0;m>0?this.setAttribute(`data-nested`,``):this.removeAttribute(`data-nested`);let h=this.crumbsOf(e,m);return l`
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
                    ${e?.header?.map(e=>z(this,e,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${t?this.renderPeerNav(t):p}
                    ${a.map(this.renderBtn)}
                    ${c}
                    ${this.renderActions(s)}
                </div>
            `:f?l`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center; flex-wrap: wrap;" class="form-header">
                    ${o.map(this.renderBackChevron)}
                    ${e.avatar?z(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):p}
                    <div style="flex: 1; min-width: min(22rem, 100%); overflow: ${e.switcher?`visible`:`hidden`};">
                        ${u?l`<div class="page-overline">${I(ou(u,this.state??{},this.data??{}))}</div>`:p}
                        ${(e?.title||d)&&m==0?l`
                            <div style="display: flex; align-items: center; gap: var(--lumo-space-s, .5rem); min-width: 0;">
                                <h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${e?.title?I(ou(e?.title,this.state??{},this.data??{})):l`<span class="page-title-placeholder">${I(ou(d,this.state??{},this.data??{}))}</span>`}</h2>
                                ${e.kpisBelow&&e.badges?.length?e.badges.map(e=>Cu(e,this.state??{},this.data??{},{pill:!0})):p}
                                ${e.switcher?this.renderSwitcher(e.switcher):p}
                            </div>`:p}
                        ${e.switcher&&!((e?.title||d)&&m==0)?this.renderSwitcher(e.switcher):p}
                        ${e?.title&&m==1?l`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${I(ou(e?.title,this.state??{},this.data??{}))}</h3>`:p}
                        ${e?.title&&m==2?l`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${I(ou(e?.title,this.state??{},this.data??{}))}</h4>`:p}
                        ${e?.title&&m==3?l`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${I(ou(e?.title,this.state??{},this.data??{}))}</h5>`:p}
                        ${e?.title&&m>3?l`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${I(ou(e?.title,this.state??{},this.data??{}))}</h6>`:p}

                        ${e?.subtitle?l`<span style="display: inline-block; margin-block-end: 0.83em;">${I(ou(e?.subtitle,this.state??{},this.data??{}))}</span>`:p}
                        ${e?.timestamp?l`<span class="page-timestamp" style="display: block; color: var(--lumo-secondary-text-color, #6b7280); font-size: var(--lumo-font-size-s, .875rem);">${I(ou(e.timestamp,this.state??{},this.data??{}))}</span>`:p}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${e.kpisBelow?p:e?.kpis?.map(e=>l`
                            <div class="header-fact">
                                <span class="header-fact-label">${this.evalLabel(e.title)}</span>
                                <span class="header-fact-value">${I(ou(e.text,this.state??{},this.data??{}))}</span>
                            </div>
                        `)}
                        ${e?.header?.map(e=>z(this,e,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
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
                            <span class="kpi-value">${I(ou(e.text,this.state??{},this.data??{}))}</span>
                        </div>
                    `)}
                </div>
            `:p}
            ${e.badges&&e.badges.length>0&&!e.kpisBelow?l`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${e.badges.map(e=>Cu(e,this.state??{},this.data??{},{pill:!0}))}
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

        ${ve}
    `,w]}};o([n()],rd.prototype,`metadata`,void 0),o([n()],rd.prototype,`baseUrl`,void 0),o([n()],rd.prototype,`state`,void 0),o([n()],rd.prototype,`data`,void 0),o([n()],rd.prototype,`appState`,void 0),o([n()],rd.prototype,`appData`,void 0),o([s()],rd.prototype,`_overflowOpen`,void 0),o([s()],rd.prototype,`_overflowN`,void 0),rd=o([i(`mateu-content-header`)],rd);var id=e=>{let t=e?.line;return typeof t==`number`&&t>1?Math.floor(t):1};function ad(e,t=e=>e){let n=[],r=new Map;for(let i of e??[]){let e=id(t(i));e===1?n.push(i):(r.has(e)||r.set(e,[]),r.get(e).push(i))}return{first:n,extra:[...r.keys()].sort((e,t)=>e-t).map(e=>r.get(e))}}function od(e,t=e=>e){let{first:n,extra:r}=ad(e,t);return[...n,...r.flat()]}var sd=class extends _{constructor(...e){super(...e),this.variant=`text`,this.count=3}static{this.styles=h`
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
            `)}`:l`${e.map(()=>l`<div class="bone line"></div>`)}`}};o([n()],sd.prototype,`variant`,void 0),o([n({type:Number})],sd.prototype,`count`,void 0),sd=o([i(`mateu-skeleton`)],sd);var V=(e,t,n,r)=>{if(!e)return l``;let i=R.get()?.renderIcon;if(i){let a=i.call(R.get(),e,t,n);return r?l`<span slot="${r}">${a}</span>`:a}return l`<span class="mateu-icon ${n??``}" data-icon="${e}" aria-hidden="true"
                      style="display:inline-block; width:1em; height:1em; ${t??``}" slot="${r??p}"></span>`},cd=`vaadin:ban`,ld=e=>{let t=e??cd;return t.includes(`:`)?R.get()?.renderIcon?V(t,`width: 1.8rem; height: 1.8rem;`):l`${e?p:`🗂`}`:l`${t}`},ud=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t},bubbles:!0,composed:!0}))},dd=(e,t,n,i,a,o)=>l`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${ld(t)}</span>
            ${n?l`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${n}</span>`:p}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${i??e??r(`nothingHere`)}</span>
            ${a&&o?l`
                <button style="margin-top: .25rem; font: inherit; font-weight: 500; cursor: pointer; padding: .4rem .9rem; border: none; border-radius: var(--lumo-border-radius-m, 6px); background: transparent; color: var(--lumo-primary-text-color, #3b5bdb);"
                        @click="${e=>ud(e,a)}">${o}</button>
            `:p}
        </div>
    `,fd=e=>{let t=e.metadata;return l`
        <div style="${e.style??p}" class="${e.cssClasses??p}" slot="${e.slot??p}">
            ${dd(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},pd=e=>{let t=e.metadata;return l`
        <mateu-skeleton
                variant="${t.variant??`text`}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-skeleton>
    `},md;async function hd(e){if(!md)return{};try{return await md(e)??{}}catch(e){return console.warn(`mateu: external auth provider failed`,e),{}}}function gd(e,t){return t?t.split(`.`).reduce((e,t)=>typeof e==`object`&&e?e[t]:void 0,e):e}function _d(e,t,n=`value`,r=`label`){let i=gd(e,t);return Array.isArray(i)?i.map(e=>{if(typeof e==`object`&&e){let t=gd(e,n),i=gd(e,r);return{value:t??i,label:String(i??t??``)}}return{value:e,label:String(e)}}):[]}function vd(e,t,n,r=e=>e){let i=gd(e,t);return Array.isArray(i)?i.map(e=>{let t={};for(let i of n)t[i]=gd(e,r(i));return t}):[]}var yd=null;function bd(e){yd=e}async function xd(e,t=e=>e,n=fetch,r){e?.ref&&!ce(e.ref)&&await b();let i=fe(e),a=(i.method||`GET`).toUpperCase(),o=t.url??t;if(yd){let t=i.url?o(i.url)??i.url:``,n=yd({url:t,ref:e.ref,method:a});if(n!==void 0)return n}if(S(e))return a!==`GET`&&a!==`HEAD`?null:structuredClone(he(e));if(!i.url)throw Error(`External REST fetch has no url${e.ref?` (unknown source "${e.ref}")`:``}`);let s=o(i.url)??i.url,c={};for(let[e,n]of Object.entries(i.headers??{}))c[e]=t(n)??n;Object.assign(c,await hd({url:s,method:a}));let l={method:a,headers:c};a!==`GET`&&a!==`HEAD`&&i.body&&(l.body=(r&&ie(c)?r:t)(i.body)??i.body);let u=await n(s,l);if(!u.ok)throw Error(`External REST fetch failed: ${u.status}`);if(u.status===204||u.status===205)return null;if(typeof u.text!=`function`)return u.json();let d=await u.text();return d.trim()===``?null:JSON.parse(d)}async function Sd(e,t=e=>e,n=fetch){let r=await xd(e,t,n),i=fe(e);return _d(r,i.itemsPath,i.valuePath,i.labelPath)}async function Cd(e,t,n=e=>e,r=fetch){return vd(await xd(e,n,r),fe(e).itemsPath,t,t=>C(e,t))}async function wd(e,t,n=e=>e,r=fetch){return Td(await xd(e,n,r),e,t)}function Td(e,t,n){let r=vd(e,fe(t).itemsPath,n,e=>C(t,e)),i=gd(e,_e(t)),a=typeof i==`number`?i:Number(i);return{rows:r,total:Number.isFinite(a)?a:null}}var Ed=(e,t,n=!1)=>e&&e>1||n?l`<div style="grid-column: span ${e&&e>1?e:1}; min-width: 0;">${t}</div>`:t,Dd=`var(--lumo-space-m, 1rem)`,Od=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.columnWidth||`13rem`,u=`display: grid; grid-template-columns: ${s.maxColumns&&s.maxColumns>0?`repeat(${s.maxColumns}, minmax(0, 1fr))`:`repeat(auto-fill, minmax(min(100%, ${c}), 1fr))`}; gap: ${Dd} var(--lumo-space-l, 1.5rem); align-items: start;`;return s.labelsAside&&(u+=` --mateu-label-width: 10rem;`),s.fullWidth&&(u+=` width: 100%;`),u+=t.style??``,l`
        <div id="${t.id??p}" style="${u}" class="${t.cssClasses}" slot="${t.slot||p}">
            ${t.children?.map(t=>kd(s,e,t,n,r,i,a,o))}
        </div>
    `},kd=(e,t,n,r,i,a,o,s)=>n.type==T.ClientSide&&n.metadata?.type==E.FormRow?Md(e,t,n,r,i,a,o,s):Ed(Ad(n),e.labelsAside?jd(t,n,r,i,a,o,s):z(t,n,r,i,a,o,s),!0),Ad=e=>{if(e.type==T.ClientSide){let t=e.metadata;if(t?.type==E.FormField)return t.colspan||1}return 1},jd=(e,t,n,r,i,a,o)=>{if(t.type==T.ClientSide&&t.metadata?.type==E.FormField&&t.metadata.label){let s=t.metadata,c=s.label?.includes("${")?e._evalTemplate(s.label):s.label;return l`
            <div style="display: flex; gap: ${Dd}; align-items: baseline;">
                <label style="flex: 0 0 var(--mateu-label-width, 10rem); color: var(--lumo-secondary-text-color, #667);">${c}</label>
                <div style="flex: 1; min-width: 0;">${z(e,t,n,r,i,a,o,!0)}</div>
            </div>
        `}return z(e,t,n,r,i,a,o)},Md=(e,t,n,r,i,a,o,s)=>l`
        <div style="grid-column: 1 / -1; display: flex; gap: ${Dd}; flex-wrap: wrap;">
            ${n.children?.map(c=>l`<div style="flex: 1 1 ${100/Math.max(1,n.children.length)}%; min-width: min(100%, 13rem);">${kd(e,t,c,r,i,a,o,s)}</div>`)}
        </div>
    `,Nd=(e,t,n,r,i,a,o,s)=>{let c=n.metadata,u=`display: flex; flex-direction: ${e};`;c.spacing&&(u+=` gap: ${Dd};`),c.padding&&(u+=` padding: var(--lumo-space-m, 1rem);`),c.wrap&&(u+=` flex-wrap: wrap;`),c.fullWidth&&(u+=` width: 100%;`),c.justification&&(u+=` justify-content: ${c.justification};`);let d=e===`row`?c.verticalAlignment:c.horizontalAlignment;return d&&(u+=` align-items: ${d};`),u+=n.style??``,l`
        <div id="${n.id??p}" style="${u}" class="${n.cssClasses}" slot="${n.slot??p}">
            ${n.children?.map(e=>z(t,e,r,i,a,o,s))}
        </div>
    `},Pd=(e,t,n,r,i,a,o)=>Nd(`row`,e,t,n,r,i,a,o),Fd=(e,t,n,r,i,a,o)=>Nd(`column`,e,t,n,r,i,a,o),Id=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=`display: flex; flex-direction: ${s.orientation===`vertical`?`column`:`row`}; gap: var(--lumo-space-s, 0.5rem);`;return s.fullWidth&&(c+=` width: 100%;`),c+=t.style??``,l`
        <div id="${t.id??p}" style="${c}" class="${t.cssClasses}" slot="${t.slot??p}">
            <div style="flex: 1; min-width: 0; min-height: 0;">${z(e,t.children[0],n,r,i,a,o)}</div>
            <div style="flex: 1; min-width: 0; min-height: 0;">${z(e,t.children[1],n,r,i,a,o)}</div>
        </div>
    `},Ld=(e,t,n,i,a,o,s)=>{let c=t.children&&t.children.length>1?t.children[1]:null,u=a?.detailComponent??null,d=!!a?.hasDetail||!!c,f=u??c;return l`
        <div id="${t.id??p}" style="display: flex; gap: var(--lumo-space-m, 1rem); ${t.style??``}" class="${t.cssClasses}" slot="${t.slot??p}">
            <div style="flex: 1; min-width: 0;">${z(e,t.children[0],n,i,a,o,s)}</div>
            ${d&&f?l`<div style="flex: 1; min-width: 0;">${z(e,f,n,i,a,o,s)}</div>`:l`<div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-s, .875rem);">${r(`selectItemForDetails`)}</div>`}
        </div>
    `},Rd=(e,t,n,r,i,a,o)=>{let s=t.style??``;t.metadata.fullWidth&&(s+=` width: 100%;`);let c=Math.max(0,(t.children??[]).findIndex(e=>e.metadata.active));return l`
        <div id="${t.id??p}" style="${s}" class="${t.cssClasses}" slot="${t.slot??p}">
            ${t.children?.map((t,s)=>{let u=t,d=u.metadata.label,f=d?.includes("${")?e._evalTemplate(d):d;return l`
                    <details data-node-id="${Pa(u)}" ?open="${s===c}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));">
                        <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600;">${f}</summary>
                        <div style="padding: var(--lumo-space-m, 1rem) 0;">
                            ${u.children?.map(t=>z(e,t,n,r,i,a,o))}
                        </div>
                    </details>
                `})}
        </div>
    `},zd=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style??``;return s.fullWidth&&(c+=` width: 100%;`),l`
        <div style="${c}" class="${t.cssClasses}" slot="${t.slot??p}">
            ${t.children?.map(t=>Bd(e,t,n,r,i,a,o,s.variant))}
        </div>
    `},Bd=(e,t,n,r,i,a,o,s)=>{let c=t.metadata,u=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return l`
        <details data-node-id="${Pa(t)}" ?open="${c.active}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); ${t.style??``}" class="${t.cssClasses}">
            <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600; ${c.disabled?`pointer-events: none; opacity: .5;`:``}">${u}</summary>
            <div style="padding: var(--lumo-space-s, .5rem) 0;">
                ${t.children?.map(t=>z(e,t,n,r,i,a,o))}
            </div>
        </details>
    `},Vd=(e,t,n,r,i,a,o)=>l`
        <div style="overflow: auto; ${t.style??``}" class="${t.cssClasses}" slot="${t.slot??p}">
            ${t.children?.map(t=>z(e,t,n,r,i,a,o))}
        </div>
    `,Hd=(e,t,n,r,i,a,o)=>l`
        <div style="width: 100%; ${t.style}" class="${t.cssClasses}" slot="${t.slot??p}">
            ${t.children?.map(t=>z(e,t,n,r,i,a,o))}
        </div>
    `,Ud=(e,t,n,r,i,a,o)=>l`
        <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" class="${t.cssClasses}" slot="${t.slot??p}">
            ${t.children?.map(t=>z(e,t,n,r,i,a,o))}
        </div>
    `,Wd=(e,t,n,r,i,a,o)=>l`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: ${Dd}; ${t.style}" class="${t.cssClasses}" slot="${t.slot??p}">
            ${t.children?.map(t=>z(e,t,n,r,i,a,o))}
        </div>
    `,Gd=(e,t,n,r,i,a,o)=>l`
        <div style="display: flex; gap: ${Dd}; flex-wrap: wrap; ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(t=>z(e,t,n,r,i,a,o))}
        </div>
    `,Kd=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`
        <div style="flex: ${s.boardCols??1} 1 0; min-width: min(100%, 12rem); ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(t=>z(e,t,n,r,i,a,o))}
        </div>
    `},qd=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`
        <div
                style="display: flex; flex-direction: column; overflow: auto; ${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??p}"
        >
            ${s.page.content.map(t=>z(e,t,n,r,i,a,o))}
        </div>
    `},Jd=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,Yd=e=>typeof e==`string`&&Jd.test(e),Xd=e=>Yd(e)?`…-`+e.substring(e.lastIndexOf(`-`)+1):e,Zd=e=>t=>{t.clipboardData&&(t.clipboardData.setData(`text/plain`,e),t.preventDefault())},Qd=e=>Yd(e)?l`<span class="mateu-uuid" data-uuid="${e}" title="${e}"
                     @copy="${Zd(e)}">${Xd(e)}</span>`:e,$d=e=>{let t=e.metadata;return(t?.content??t?.columns??[]).filter(e=>e&&e.metadata).map(e=>{let t=e.metadata;return{id:e.id??``,label:t?.label??e.id??``,autoWidth:t?.autoWidth,width:t?.width}})},ef=(e,t)=>{let n=e?.[t];return n==null?``:typeof n==`object`?n.text??n.label??n.value??``:String(n)},tf=(e,t,n)=>{let i=$d(e);return l`
        <div style="overflow:auto; width:100%; ${e.style}" class="${e.cssClasses}" slot="${e.slot??p}">
            <table style="border-collapse:collapse; width:100%; font-size: var(--lumo-font-size-s,.875rem);">
                <thead><tr>${i.map(e=>l`<th style="${`text-align:left; padding:.45rem .6rem; border-bottom:2px solid var(--lumo-contrast-20pct,rgba(0,0,0,.2)); font-weight:600; white-space:nowrap; color: var(--lumo-secondary-text-color,#556);`}">${e.label}</th>`)}</tr></thead>
                <tbody>
                    ${(t??[]).length===0?l`<tr><td colspan="${Math.max(1,i.length)}" style="padding:1.5rem; text-align:center; color: var(--lumo-secondary-text-color,#888);">${n??r(`noData`)}</td></tr>`:t.map(e=>l`<tr>${i.map(t=>l`<td style="${`padding:.4rem .6rem; border-bottom:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.08)); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:24rem;`}" title="${ef(e,t.id)}">${Qd(ef(e,t.id))}</td>`)}</tr>`)}
                </tbody>
            </table>
        </div>
    `},nf=(e,t)=>{let n=e.metadata;return e.id&&t&&t[e.id]?t[e.id]:n?.page?.content??[]},rf=e=>{let t=e.metadata.items??[];return l`
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
    `},af=(e,t,n,r,i,a,o)=>t.separator?l`<span style="align-self: stretch; width: 1px; background: var(--lumo-contrast-20pct, rgba(0,0,0,.2));"></span>`:t.submenus?l`
            <details style="position: relative;">
                <summary style="cursor: pointer; list-style: none; padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);">
                    ${t.component?z(e,t.component,n,r,i,a,o):t.label} ▾
                </summary>
                <div style="display: flex; flex-direction: column; gap: .1rem; padding: .3rem; min-width: 10rem;
                            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px);
                            background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.15));">
                    ${t.submenus.map(t=>af(e,t,n,r,i,a,o))}
                </div>
            </details>
        `:l`
        <span class="${t.className??``}"
              style="cursor: ${t.disabled?`default`:`pointer`}; opacity: ${t.disabled?.5:1};
                     padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);
                     ${t.selected?`background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));`:``}">
            ${t.component?z(e,t.component,n,r,i,a,o):t.label}
        </span>
    `,of=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`
        <div style="display: flex; flex-wrap: wrap; gap: .25rem; align-items: center; ${t.style}"
             class="${t.cssClasses}" slot="${t.slot??p}">
            ${s.options?.map(t=>af(e,t,n,r,i,a??{},o??{}))}
        </div>
    `},sf=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`
        <div style="${t.style}" class="${t.cssClasses}" slot="${t.slot??p}">
            ${z(e,s.wrapped,n,r,i,a,o)}
        </div>
    `},cf=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.content?.metadata,u=c?.type==E.Notice&&c.fullWidth===!0;return l`
        <div style="display:flex; flex-direction:column; ${u?`width: 100%; `:``}${t.style}"
             class="${t.cssClasses}"
             slot="${t.slot??p}"
             data-colspan="${s.colspan||(u?99:p)}"
        >
            ${s.label?l`<label style="font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${s.label}</label>`:p}
            ${z(e,s.content,n,r,i,a,o)}
        </div>
            `},lf=e=>{let t=e.metadata,n=e=>{let n=e.closest(`.mateu-message-input`)?.querySelector(`input`),r=n?.value??``;!t.actionId||!r.trim()||(e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:{message:r}},bubbles:!0,composed:!0})),n&&(n.value=``))};return l`
        <div class="mateu-message-input ${e.cssClasses??``}"
             style="display:flex; gap:.5rem; align-items:center; ${e.style??``}"
             slot="${e.slot??p}">
            <input type="text"
                   style="flex:1; min-width:0; font:inherit; padding:.5rem .75rem; border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16)); border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513);"
                   @keydown="${e=>{e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),n(e.currentTarget))}}">
            <button style="font:inherit; font-weight:500; cursor:pointer; padding:.5rem 1rem; border:none; border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);"
                    @click="${e=>n(e.currentTarget)}">${r(`send`)}</button>
        </div>
    `},uf=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`<span title="${s.text}" style="${t.style}" class="${t.cssClasses}" slot="${t.slot??p}"
        >${z(e,s.wrapped,n,r,i,a,o)}</span>`},H=e=>e??g,df=e=>{if(e instanceof CustomEvent)return e.detail;let t={};for(let n in e){let r=e[n];[`number`,`string`,`boolean`].indexOf(typeof r)>=0&&(t[n]=e[n])}return t},ff=(e,t,n,r,i)=>{let a={appState:r??{},appData:i??{}},o={};for(let r in e.attributes)o[r]=au(e.attributes[r],t,n,a);return{attributes:o,content:au(e.content,t,n,a)}},pf=(e,t,n,r)=>{for(let t in r.attributes)e.setAttribute(t,r.attributes[t]);n.style&&e.setAttribute(`style`,n.style),n.cssClasses&&e.setAttribute(`class`,n.cssClasses),n.slot&&e.setAttribute(`slot`,n.slot),r.content&&(t.html?e.innerHTML=t.content?.includes("${")?xl(r.content):r.content:e.append(r.content))},mf=e=>{let t=e.name,n=e.attributes?e.attributes.import:void 0;n&&t.includes(`-`)&&!customElements.get(t)&&Se(()=>import(n),[],import.meta.url)},hf=(e,t,n,r,i,a,o)=>{mf(t);let s=ff(t,r,i,a,o),c=t.name;s.attributes.id&&(c=`#`+s.attributes.id);let u=n.id?`.element-container[data-element-id="${n.id}"]`:`.element-container`;return setTimeout(()=>{let r=e.shadowRoot?.querySelector(u),i=r?.querySelector(c);if(i){for(;i.firstChild;)i.removeChild(i.lastChild);pf(i,t,n,s)}else{let i=document.createElement(t.name);pf(i,t,n,s);for(let n in t.on)i.addEventListener(n,r=>{let i=df(r);e.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.on[n],parameters:{event:i}},bubbles:!0,composed:!0}))});r?.appendChild(i)}}),l`<div class="element-container" data-element-id="${H(n.id)}"></div>`},gf=function(e){return e.div=`div`,e.p=`p`,e.h1=`h1`,e.h2=`h2`,e.h3=`h3`,e.h4=`h4`,e.h5=`h5`,e.h6=`h6`,e.span=`span`,e}({}),_f=(e,t,n,r,i)=>{let a={...e.metadata};a.container??=gf.div;let o=a.attributes?.[`data-colspan`],s=su(a.text,t,n,r,i),c={xl:`var(--lumo-font-size-xl, 1.375rem)`,l:`var(--lumo-font-size-l, 1.125rem)`,s:`var(--lumo-font-size-s, .875rem)`,xs:`var(--lumo-font-size-xs, .8125rem)`},u=(a.size&&c[a.size]?`font-size: ${c[a.size]}; `:``)+(a.noMargins?`margin-block-start: 0; margin-block-end: 0; `:``);return gf.h1==a.container?l`
            <h1 style="${u}${e.style}" class="${e.cssClasses}"
                id="${H(e.id)}"
                data-colspan="${H(o)}"
                slot="${e.slot??p}">
                ${s??p}
            </h1>
        `:gf.h2==a.container?l`
            <h2 style="${u}${e.style}" class="${e.cssClasses}"
                id="${H(e.id)}"
                data-colspan="${H(o)}"
                slot="${e.slot??p}">
                ${s??p}
            </h2>
        `:gf.h3==a.container?l`
            <h3 style="${u}${e.style}" class="${e.cssClasses}"
                id="${H(e.id)}"
                data-colspan="${H(o)}"
                slot="${e.slot??p}">
                ${s??p}
            </h3>
        `:gf.h4==a.container?l`
            <h4 style="${u}${e.style}" class="${e.cssClasses}"
                id="${H(e.id)}"
                data-colspan="${H(o)}"
                slot="${e.slot??p}">
                ${s??p}
            </h4>
        `:gf.h5==a.container?l`
            <h5 style="${u}${e.style}" class="${e.cssClasses}"
                id="${H(e.id)}"
                data-colspan="${H(o)}"
                slot="${e.slot??p}">
                ${s??p}
            </h5>
        `:gf.h6==a.container?l`
            <h6 style="${u}${e.style}" class="${e.cssClasses}"
                id="${H(e.id)}"
                data-colspan="${H(o)}"
                slot="${e.slot??p}">
                ${s??p}
            </h6>
        `:gf.p==a.container?l`
               <p style="${u}${e.style}" class="${e.cssClasses}"
                  id="${H(e.id)}"
                  data-colspan="${H(o)}"
                  slot="${e.slot??p}">
                   ${s??p}
               </p>
            `:gf.div==a.container?l`
               <div style="${u}${e.style}" class="${e.cssClasses}"
                    id="${H(e.id)}"
                    data-colspan="${H(o)}"
                    slot="${e.slot??p}">${s?I(s):p}</div>
            `:gf.span==a.container?l`
               <span style="${u}${e.style}" class="${e.cssClasses}"
                     id="${H(e.id)}"
                     data-colspan="${H(o)}"
                    slot="${e.slot??p}">${s??p}</span>
            `:l`
               <p
                       id="${H(e.id)}"
                       data-colspan="${H(o)}"
                       slot="${e.slot??p}">
                   Unknown text container: ${a.container} 
               </p>
            `},vf=e=>{let t=e.metadata;return l`<a href="${H(el(t.url))}" target="${t.target??p}"
                   rel="${t.target===`_blank`?`noopener`:p}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??p}">${t.text}</a>`},yf=(e,t)=>{let n=e.toLowerCase().split(`+`);return t.ctrlKey===n.includes(`ctrl`)&&t.altKey===n.includes(`alt`)&&t.shiftKey===n.includes(`shift`)&&t.metaKey===n.includes(`meta`)},bf=(e,t)=>{if(!yf(e,t))return!1;let n=e.toLowerCase().split(`+`),r=n[n.length-1];return!!(t.key.toLowerCase()===r||/^[a-z]$/.test(r)&&t.code===`Key`+r.toUpperCase()||/^[0-9]$/.test(r)&&(t.code===`Digit`+r||t.code===`Numpad`+r))},xf=e=>e?e.split(`+`).map(e=>e.length<=1?e.toUpperCase():e.charAt(0).toUpperCase()+e.slice(1)).join(`+`):void 0,Sf=(e,t)=>{let n=e.currentTarget,r=n.dataset.route;if(r){Au(n,r);return}n.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:n.dataset.actionId,parameters:t.parameters},bubbles:!0,composed:!0}))},Cf=(e,t,n)=>{if(!e.route)return;let r=au(e.route,t,n);return!r||r.includes("${")?void 0:r},wf=`display:inline-flex; align-items:center; justify-content:center; gap:.4em; box-sizing:border-box; font:inherit; font-weight:500; cursor:pointer; border-radius:var(--lumo-border-radius-m,6px); border:1px solid transparent; line-height:1; white-space:nowrap;`,Tf=e=>{let t=e.buttonStyle??``,n=e.color&&e.color!==`none`&&e.color!==`normal`?e.color:``,r=e.size,i=n===`success`?`var(--lumo-success-color,#1a7f37)`:n===`error`?`var(--lumo-error-color,#c5221f)`:n===`contrast`?`var(--lumo-contrast,#161513)`:`var(--lumo-primary-color,#3b5bdb)`,a=n===`success`?`var(--lumo-success-contrast-color,#fff)`:n===`error`?`var(--lumo-error-contrast-color,#fff)`:n===`contrast`?`var(--lumo-base-color,#fff)`:`var(--lumo-primary-contrast-color,#fff)`,o=n===`success`?`var(--lumo-success-text-color,#1a7f37)`:n===`error`?`var(--lumo-error-text-color,#c5221f)`:n===`contrast`?`var(--lumo-body-text-color,#161513)`:`var(--lumo-primary-text-color,#3b5bdb)`,s;return s=t===`primary`?`background:${i}; color:${a};`:t===`tertiary`||t===`tertiaryInline`?`background:transparent; color:${o};`:`background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:${o}; border-color:var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,`${wf}${s}${r===`small`?`padding:.25rem .6rem; font-size:var(--lumo-font-size-s,.875rem);`:r===`large`?`padding:.65rem 1.4rem; font-size:var(--lumo-font-size-l,1.125rem);`:`padding:.45rem 1rem; font-size:var(--lumo-font-size-m,1rem);`}`},Ef=(e,t,n)=>{let r=e.metadata,i=au(r.label,t,n);return l`<button
            id="${e.id}"
            data-action-id="${r.actionId}"
            data-route="${Cf(r,t,n)??p}"
            @click="${e=>Sf(e,r)}"
            style="${Tf(r)}${e.style}"
            class="${e.cssClasses}"
            ?disabled="${r.disabled}"
            data-shortcut="${r.shortcut??p}"
            title="${r.shortcut?`${i} (${xf(r.shortcut)})`:p}"
            slot="${e.slot??p}"
    >${r.iconOnLeft?V(r.iconOnLeft):p}${i}${r.iconOnRight?V(r.iconOnRight):p}</button>`},Df=`display:block; box-sizing:border-box; background:var(--lumo-base-color,#fff); border:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.1)); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-xs,0 1px 3px rgba(0,0,0,.08)); overflow:hidden;`,Of=(e,t,n,r,i,a,o)=>{let s=t.metadata;if(!s)return l``;let c=t=>t?z(e,t,n,r,i,a,o,!1):p,u=s.header||s.headerPrefix||s.headerSuffix||s.title||s.subtitle;return l`
        <div id="${t.id??p}" style="${Df}${t.style}" class="${t.cssClasses}" slot="${t.slot??p}">
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
    `},kf=e=>{let t=e.metadata;return l`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??p}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},Af=e=>{let t=e.metadata;return V(t.icon,e.style,e.cssClasses,e.slot)},jf=(e,t)=>{e&&e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t},bubbles:!0,composed:!0}))},Mf=`font:inherit; font-weight:500; cursor:pointer; padding:.45rem 1rem; border-radius:var(--lumo-border-radius-m,6px);`,Nf=`${Mf} background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:var(--lumo-body-text-color,#161513); border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,Pf=`${Mf} background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff); border:1px solid transparent;`,Ff=(e,t,n,i,a,o,s)=>{let c=t.metadata,u=!1;if(c.openedCondition)try{u=du(c.openedCondition,i,a,o,s)}catch(e){console.error(`when evaluating `+c.openedCondition+` :`+e+`, where data is `+a+` and state is `+i)}return u?l`
        <div class="mateu-confirm-dialog ${t.cssClasses??``}"
             style="position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.4); ${t.style??``}"
             slot="${t.slot??p}">
            <div style="background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-l,0 8px 24px rgba(0,0,0,.2)); width:100%; max-width:min(90vw,32rem); padding:1.5rem; box-sizing:border-box;">
                ${c.header?l`<h3 style="margin:0 0 .75rem; font-size:1.15rem;">${c.header}</h3>`:p}
                <div>${t.children?.map(t=>z(e,t,n,i,a,o,s))}</div>
                <div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:1.25rem;">
                    ${c.canCancel?l`<button style="${Nf}" @click="${e=>jf(e.currentTarget,c.cancelActionId)}">${c.rejectText&&!c.canReject?c.rejectText:r(`cancel`)}</button>`:p}
                    ${c.canReject?l`<button style="${Nf}" @click="${e=>jf(e.currentTarget,c.rejectActionId)}">${c.rejectText||r(`no`)}</button>`:p}
                    <button style="${Pf}" @click="${e=>jf(e.currentTarget,c.confirmActionId)}">${c.confirmText||r(`ok`)}</button>
                </div>
            </div>
        </div>
    `:l``},If=e=>{let t=e.metadata,n;return t.position&&(n={Top:`top`,Bottom:`bottom`,TopLeft:`top-left`,TopRight:`top-right`,BottomLeft:`bottom-left`,BottomRight:`bottom-right`}[t.position]),l`
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
    `},Lf=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`
        <details
                ?open="${s.opened}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??p}"
        >
            <summary>${z(e,s.summary,n,r,i,a,o)}</summary>
            ${z(e,s.content,n,r,i,a,o)}
        </details>
            `},Rf=(e,t,n,r,i,a)=>l`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${n}"
            .xdata="${r}"
            .appState="${i}"
            .appdata="${a}"
        ></mateu-dialog>
            `,zf=(e,t,n,r,i,a)=>l`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${n}"
            .xdata="${r}"
            .appState="${i}"
            .appdata="${a}"
        ></mateu-drawer>
            `,Bf=e=>`mfe_`+[e.baseUrl,e.route,e.consumedRoute,e.serverSideType].map(e=>e??``).join(`|`).replace(/[^a-zA-Z0-9]/g,`_`),Vf=e=>{let t=e.metadata;return l`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"
                  route="${t.route}"
                  consumedRoute="${t.consumedRoute}"
                  id="${Bf(t)}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??p}"
        ></mateu-ux>
        </mateu-api-caller>
            `},Hf=e=>{let t=e.metadata;return l`
        <mateu-markdown .content=${t.markdown}
                        style="display:block; max-width: 72ch; ${e.style??``}" class="${e.cssClasses}"
                        slot="${e.slot??p}"></mateu-markdown>
            `},Uf=e=>{let t=e.metadata;return l`
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
    `},Wf=(e,t={})=>{let n=e.metadata,r=n.valueKey?t[n.valueKey]:n.value,i=n.max&&n.max!=0?n.max:1,a=!n.indeterminate&&r!=null;return l`
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
    `},Gf=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`
        <details style="position: relative; ${t.style}" class="${t.cssClasses}" slot="${t.slot??p}">
            <summary style="list-style: none; cursor: pointer;">${z(e,s.wrapped,n,r,i,a,o)}</summary>
            <div style="position: absolute; z-index: 100; min-width: 300px; margin-top: .25rem; padding: .6rem .8rem;
                        border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 8px);
                        background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,.2));">
                ${z(e,s.content,n,r,i,a,o)}
            </div>
        </details>
    `},Kf=e=>{let t=e.metadata;return l`
        <mateu-map id="${e.id??p}"
                   position="${t.position??p}" zoom="${t.zoom??p}"
                   .markers=${t.markers??[]}
                   .markerActionId=${t.markerActionId??void 0}
                   .tileUrl=${t.tileUrl??void 0}
                   .attribution=${t.attribution??void 0}
                   style="${e.style??p}" class="${e.cssClasses??p}"
                   slot="${e.slot??p}"></mateu-map>
            `},qf=e=>{let t=e.metadata;return l`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??p}">
            `},Jf=e=>{let t=e.metadata;return l`<div style="display:flex; align-items:center; gap:0.5rem;" slot="${e.slot??p}">
        ${t.breadcrumbs.map(e=>l`
            <a href="${H(el(e.link))}">${e.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </div>`},Yf=(e,t,n,r)=>{if(n<=0)return 0;let i=e+t;return r?(i%n+n)%n:Math.max(0,Math.min(n-1,i))},Xf=class extends _{constructor(...e){super(...e),this.dots=!1,this.nav=!1,this.loop=!1,this.auto=!1,this.duration=4e3,this.disableKeys=!1,this.selected=0,this.total=0,this.paused=!1,this.syncSlides=()=>{let e=this.slides;this.total!==e.length&&(this.total=e.length),this.selected>=e.length&&e.length>0&&(this.selected=e.length-1),e.forEach((t,n)=>{t.hidden=n!==this.selected,t.setAttribute(`aria-roledescription`,`slide`),t.setAttribute(`aria-label`,`${n+1} / ${e.length}`)})},this.onKey=e=>{this.disableKeys||(e.key===`ArrowRight`&&(this.go(1),e.preventDefault()),e.key===`ArrowLeft`&&(this.go(-1),e.preventDefault()))}}get slides(){return Array.from(this.children)}go(e){this.selected=Yf(this.selected,e,this.total,this.loop)}connectedCallback(){super.connectedCallback(),this.restartTimer()}disconnectedCallback(){super.disconnectedCallback(),this.stopTimer()}stopTimer(){this.timer&&clearInterval(this.timer),this.timer=void 0}restartTimer(){this.stopTimer(),this.auto&&this.isConnected&&(this.timer=setInterval(()=>{this.paused||(this.selected=Yf(this.selected,1,this.total,!0))},Math.max(500,this.duration||4e3)))}updated(e){(e.has(`auto`)||e.has(`duration`))&&this.restartTimer(),this.syncSlides()}render(){let e=!this.loop&&this.selected<=0,t=!this.loop&&this.selected>=this.total-1;return l`
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
    `}};o([n({type:Boolean})],Xf.prototype,`dots`,void 0),o([n({type:Boolean})],Xf.prototype,`nav`,void 0),o([n({type:Boolean})],Xf.prototype,`loop`,void 0),o([n({type:Boolean})],Xf.prototype,`auto`,void 0),o([n({type:Number})],Xf.prototype,`duration`,void 0),o([n({type:Boolean,attribute:`disable-keys`})],Xf.prototype,`disableKeys`,void 0),o([n({type:Number,reflect:!0})],Xf.prototype,`selected`,void 0),o([s()],Xf.prototype,`total`,void 0),Xf=o([i(`mateu-carousel`)],Xf);var Zf=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`
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
            ${t.children?.map(t=>l`<div>${z(e,t,n,r,i,a,o)}</div>`)}
        </mateu-carousel>
    `},Qf=(e,t,n,r)=>{let i=e.metadata;return l`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??p}">
            ${i.menu.map(e=>$f(e))}
        </div>
            `},$f=e=>l`
        ${e.submenus?l`
                <details open>
                    <summary>${e.label}</summary>
                    <div style="display:flex; flex-direction:column; gap:0.25rem; padding-left:0.5rem;">
                        ${e.submenus.map(e=>$f(e))}
                    </div>
                </details>
            `:l`
                <a href="${H(el(e.path))}">${e.label}</a>
        `}
        `,ep=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`<div
                slot="${t.slot??p}"
                style="${t.style}" class="${t.cssClasses}"
        >${s.content?I(s.content):p}${t.children?.map(t=>z(e,t,n,r,i,a,o))}</div>
    `},tp=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.title?.includes("${")?e._evalTemplate(s.title):s.title;return l`<div
                id="${t.id??p}"
                slot="${t.slot??p}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?l`<div style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color); margin-bottom: var(--lumo-space-s);">${c}</div>`:p}
        ${t.children?.map(t=>z(e,t,n,r,i,a,o))}
    </div>
    `},np=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.title?.includes("${")?e._evalTemplate(s.title):s.title;return l`
        <div
                slot="${t.slot??p}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(t=>z(e,t,n,r,i,a,o))}</div>
    `},rp=(e,t,n)=>{n.dispatchEvent(new CustomEvent(`value-changed`,{detail:{fieldId:e,value:t},bubbles:!0,composed:!0}))},ip=e=>t=>{let n=t.target,r=n.type===`checkbox`?n.checked:n.value;rp(e.fieldId,r,n)},ap=(e,t)=>{let n=e.metadata,r=t?.[n.fieldId]??``,i=n,a=i.dataType,o=i.stereotype,s=!!i.readOnly,c=!!i.disabled,u=i.options,d=n.label?l`<label style="display:block; font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${n.label}</label>`:p,f=`width:100%; box-sizing:border-box; padding:.4rem .6rem; border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.3)); border-radius: var(--lumo-border-radius-m,6px); font:inherit; background: var(--lumo-base-color,#fff); color: var(--lumo-body-text-color,#1a1a1a);`,m;return m=s||o===`plainText`?l`<div style="padding:.4rem 0;">${String(r??``)}</div>`:a===`boolean`||a===`bool`||o===`checkbox`||o===`badge`?l`<input type="checkbox" ?checked="${!!r}" ?disabled="${c}" @change="${ip(n)}">`:u&&u.length?l`
            <select style="${f}" ?disabled="${c}" @change="${ip(n)}">
                <option value="">—</option>
                ${u.map(e=>l`<option value="${e.value}" ?selected="${e.value===r}">${e.label}</option>`)}
            </select>`:o===`textarea`||o===`richText`||o===`html`?l`<textarea style="${f}" rows="3" ?disabled="${c}" @input="${ip(n)}">${String(r??``)}</textarea>`:l`<input type="${a===`integer`||a===`number`||a===`double`||a===`money`?`number`:a===`date`?`date`:a===`datetime`?`datetime-local`:a===`time`?`time`:o===`password`?`password`:a===`email`?`email`:`text`}" style="${f}" .value="${String(r??``)}"
                              placeholder="${i.placeholder??p}" ?disabled="${c}" @input="${ip(n)}">`,l`
        <div id="${e.id??p}" style="${e.style}" class="${e.cssClasses}" slot="${e.slot??p}">
            ${d}
            ${m}
        </div>
    `},{I:op}=f,sp={HTML:1,SVG:2,MATHML:3},cp=(e,t)=>t===void 0?e?._$litType$!==void 0:e?._$litType$===t,lp=e=>e.strings===void 0,up={},dp=(e,t=up)=>e._$AH=t,fp=(e,t)=>{let n=e._$AN;if(n===void 0)return!1;for(let e of n)e._$AO?.(t,!1),fp(e,t);return!0},pp=e=>{let t,n;do{if((t=e._$AM)===void 0)break;n=t._$AN,n.delete(e),e=t}while(n?.size===0)},mp=e=>{for(let t;t=e._$AM;e=t){let n=t._$AN;if(n===void 0)t._$AN=n=new Set;else if(n.has(e))break;n.add(e),_p(t)}};function hp(e){this._$AN===void 0?this._$AM=e:(pp(this),this._$AM=e,mp(this))}function gp(e,t=!1,n=0){let r=this._$AH,i=this._$AN;if(i!==void 0&&i.size!==0){if(t){if(Array.isArray(r))for(let e=n;e<r.length;e++)fp(r[e],!1),pp(r[e]);else r!=null&&(fp(r,!1),pp(r))}else fp(this,e)}}var _p=e=>{e.type==Oa.CHILD&&(e._$AP??=gp,e._$AQ??=hp)},vp=class extends Aa{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,t,n){super._$AT(e,t,n),mp(this),this.isConnected=e._$AU}_$AO(e,t=!0){e!==this.isConnected&&(this.isConnected=e,e?this.reconnected?.():this.disconnected?.()),t&&(fp(this,e),pp(this))}setValue(e){if(lp(this._$Ct))this._$Ct._$AI(e,this);else{let t=[...this._$Ct._$AH];t[this._$Ci]=e,this._$Ct._$AI(t,this,0)}}disconnected(){}reconnected(){}},yp=`var(--mateu-fab-size, var(--lumo-size-l, 2.75rem))`,bp=`var(--mateu-fab-gap, var(--lumo-space-s, 0.5rem))`,xp=`var(--mateu-fab-inset-bottom, var(--mateu-fab-inset-block, var(--lumo-space-m, 1rem)))`,Sp=`var(--mateu-fab-inset-end, var(--lumo-space-m, 1rem))`,Cp={inset:1,size:2.75,gap:.5,toc:15,tocGap:2},wp=e=>`calc(${xp} + ${e} * (${yp} + ${bp}))`,Tp=e=>`calc(${xp} + (var(--mateu-fab-shell-slots, 0) + ${e}) * (${yp} + ${bp}))`,Ep=e=>`bottom: ${wp(e)}; right: ${Sp};`,Dp=e=>`bottom: ${Tp(e)}; right: ${Sp};`,Op=e=>h`
    ${nm(e)} {
        position: fixed;
        box-sizing: border-box;
        width: ${tm(yp)};
        height: ${tm(yp)};
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
    ${nm(e)}:hover {
        background-image: linear-gradient(var(--lumo-tint-10pct, rgba(255, 255, 255, 0.1)), var(--lumo-tint-10pct, rgba(255, 255, 255, 0.1)));
    }
    ${nm(e)}:active {
        background-image: linear-gradient(var(--lumo-shade-10pct, rgba(0, 0, 0, 0.1)), var(--lumo-shade-10pct, rgba(0, 0, 0, 0.1)));
    }
    ${nm(e)}:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--lumo-base-color, #fff), 0 0 0 4px var(--lumo-primary-color-50pct, rgba(22, 118, 243, 0.5));
    }
`,kp=new Map,Ap=new Map,jp=new Set,Mp=!1,Np=()=>parseFloat(getComputedStyle(document.documentElement).fontSize||`16`)||16,Pp=()=>{let e=document.documentElement.style,t=[...kp.values()],n=t.filter(e=>e.kind===`shell`).reduce((e,t)=>Math.max(e,t.slot+1),0),r=t.filter(e=>e.kind===`page`).length;e.setProperty(`--mateu-fab-shell-slots`,String(n)),e.setProperty(`--mateu-fab-slots`,String(n+r))},Fp=()=>{Mp||(Mp=!0,queueMicrotask(()=>{Mp=!1,Pp(),jp.forEach(e=>e())}))},Ip=(e,t)=>{let n=kp.get(e);(n?.kind!==t.kind||n.slot!==t.slot)&&(kp.set(e,t),Fp())},Lp=e=>{kp.delete(e)&&Fp()},Rp=ka(class extends vp{constructor(e){if(super(e),e.type!==Oa.ELEMENT)throw Error(`onFabRail goes on the FAB element`)}render(e,t){return p}update(e,[t,n]){return this.element&&this.element!==e.element&&Lp(this.element),this.element=e.element,this.entry={kind:t,slot:n??0},this.isConnected&&Ip(this.element,this.entry),p}disconnected(){this.element&&Lp(this.element)}reconnected(){this.element&&this.entry&&Ip(this.element,this.entry)}}),zp=(e,t)=>(Ap.set(e,t),t(Bp,Vp),Fp(),()=>{Ap.delete(e)&&Fp()}),Bp=`column`,Vp,Hp=(e,t)=>{Bp=e,Vp=t,Ap.forEach(n=>n(e,t))},Up=e=>{let{mode:t,viewportWidth:n,contentEnd:r,hasFabs:i,hasToc:a,rem:o}=e,s=Cp.inset*o,c=(Cp.size+Cp.gap)*o;if(t===`edge`)return{channel:0,toc:`bar`,insetEnd:0,insetBottom:0};if(n<600)return{channel:0,toc:`bar`,insetEnd:s};let l=a&&n>=1200,u=Math.max(i?s+c:0,l?s+(Cp.toc+Cp.tocGap)*o:0),d=l?`aside`:`bar`;if(t===`full`)return{channel:u,toc:d,insetEnd:s,padEnd:u>0?Math.max(24,Math.round(u-(n-r))):void 0};let f=u>0?Math.max(0,Math.round(u-(n-(e.containerEnd??r)))):void 0,p=Math.max(c,u-s);return{channel:u,toc:d,insetEnd:Math.max(s,Math.round(n-r-p)),squeeze:f}},Wp=new Map,Gp=0,U,Kp,qp=(e,t)=>{let n=t;for(;n;)if(n=n.parentNode??n.host??null,n===e)return!0;return!1},Jp=()=>{let e=[...Wp.values()].filter(e=>e.element.isConnected);return e.filter(t=>!e.some(e=>e!==t&&qp(e.element,t.element))).sort((e,t)=>t.order-e.order)[0]?.element},Yp=e=>{e.removeAttribute(`data-aside`),e.style.removeProperty(`--mateu-aside-squeeze`),e.style.removeProperty(`--mateu-aside-pad-end`)},Xp=()=>{let e=document.documentElement,t=Jp();if(U&&U!==t&&(Kp?.unobserve(U),Yp(U)),t&&t!==U&&Kp?.observe(t),U=t,!U){e.style.removeProperty(`--mateu-fab-inset-end`),e.style.removeProperty(`--mateu-fab-inset-bottom`),Pp(),Hp(`column`);return}let n=Wp.get(U),r=Np(),i=e.clientWidth||window.innerWidth,a=U.getBoundingClientRect().right,o=Up({mode:n.mode,viewportWidth:i,contentEnd:a,containerEnd:a+(parseFloat(getComputedStyle(U).marginRight)||0),hasFabs:kp.size>0,hasToc:Ap.size>0,rem:r});o.channel>0?(U.setAttribute(`data-aside`,``),U.style.setProperty(`--mateu-aside-squeeze`,`${o.squeeze??0}px`),o.padEnd===void 0?U.style.removeProperty(`--mateu-aside-pad-end`):U.style.setProperty(`--mateu-aside-pad-end`,`${o.padEnd}px`)):Yp(U),e.style.setProperty(`--mateu-fab-inset-end`,`${o.insetEnd}px`),Pp(),o.insetBottom===void 0?e.style.removeProperty(`--mateu-fab-inset-bottom`):e.style.setProperty(`--mateu-fab-inset-bottom`,`${o.insetBottom}px`),Hp(o.toc,a-(parseFloat(getComputedStyle(U).paddingRight)||0))},Zp=!1,Qp=()=>{Zp||(Zp=!0,Kp=typeof ResizeObserver<`u`?new ResizeObserver(()=>Xp()):void 0,window.addEventListener(`resize`,Xp),jp.add(Xp))},$p=()=>{Zp&&(Zp=!1,Kp?.disconnect(),Kp=void 0,window.removeEventListener(`resize`,Xp),jp.delete(Xp))},em=(e,t)=>(Wp.set(e,{element:e,mode:t,order:++Gp}),Qp(),Xp(),()=>{Wp.get(e)?.element===e&&(Wp.delete(e),Yp(e),Xp(),Wp.size===0&&$p())}),tm=e=>d(e),nm=e=>d(e),rm=e=>{let t=e.metadata;if((t?.level??0)>0)return e;let n=e=>{if(e?.metadata?.type===E.EntityHeader)return e;let t=e?.metadata?.content,r=[...e?.children??[],...Array.isArray(t)?t:t?[t]:[]];for(let e of r){let t=n(e);if(t)return t}},r;for(let t of e.children??[])if(r=n(t),r)break;if(!r)return e;let i=r.metadata;r.__hoistedToPageHeader=!0;let a=[...(i.facts??[]).filter(e=>e.label||e.value).map(e=>({title:e.label??``,text:e.value??``})),...i.metricLabel?[{title:i.metricLabel,text:i.metricValue??``}]:[]],o=(i.badges??[]).filter(e=>e.label).map(e=>({text:e.label,color:e.color})),s={...t,title:i.title||t.title,subtitle:i.subtitle??t.subtitle,kpis:[...t.kpis??[],...a],kpisBelow:!0,badges:[...t.badges??[],...o]};return{...e,metadata:s}},im=e=>`width: 100%; box-sizing: border-box; ${e??``}`,am=(e,t,n,r,i,a,o,s)=>{let c=rm(t),u=c.metadata,d=u?.fabs??[];return l`<mateu-page
            .component="${c}"
            baseUrl="${n}"
            .state="${r}"
            .data="${i}"
            .appState="${a}"
            .appdata="${o}"
            slot="${c.slot??p}"
            style="${im(c.style)}"
            class="${c.cssClasses}"
            ?standalone="${s??!1}"
    >
        ${c.children?.map(t=>z(e,t,n,r,i,a,o))}
        ${u?.buttons?.map(t=>l`
                   ${z(e,{id:La(t),metadata:t,type:T.ClientSide,slot:`buttons`},void 0,r,i,a,o)}
`)}
        ${d.map((t,n)=>l`
            <button class="page-fab" style="${Dp(n)}" ${Rp(`page`,n)} aria-label="${t.label}"
                @click="${()=>e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))}"
                title="${t.label}">
                ${V(t.icon)}
            </button>
        `)}
</mateu-page>
    `},om=(e,t,n,r,i,a,o,s)=>l`<mateu-table-crud
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
        ${t.children?.map(t=>z(e,t,n,r,i,a,o))}
    </mateu-table-crud>`,sm=e=>{let t=e.metadata;return l`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??p}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},cm=(e,t,n)=>{let r=e.metadata;return l`<mateu-chat sseUrl="${r.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??p}"></mateu-chat>`},lm=e=>{let t=e.metadata;return l`
        <mateu-workflow
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
                value="${t.value??`{"name":"New Workflow","steps":[]}`}"
        ></mateu-workflow>
    `},um=e=>{let t=e.metadata;return l`
        <mateu-form-editor
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
                value="${t.value??`{"name":"New Form","fields":[]}`}"
        ></mateu-form-editor>
    `},dm=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,fm=e=>e==`up`?`var(--lumo-success-text-color, #1a7f37)`:e==`down`?`var(--lumo-error-text-color, #c5221f)`:`var(--lumo-secondary-text-color, #666)`,pm=e=>e==`up`?`▲`:e==`down`?`▼`:``,mm=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},hm=e=>{let t=e.metadata,n=!!t.actionId;return l`
        <div class="mateu-metric-card ${e.cssClasses??``}"
             style="${dm} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${n?`cursor: pointer;`:``} ${e.style??``}"
             slot="${e.slot??p}"
             role="${n?`button`:p}"
             @click="${e=>mm(e,t)}"
        >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${t.title}</span>
                ${t.icon?V(t.icon,`color: var(--lumo-tertiary-text-color, #999); width: 1.1em; height: 1.1em;`):p}
            </div>
            <div style="display: flex; align-items: baseline; gap: .35rem;">
                <span style="font-size: var(--lumo-font-size-xxxl, 2rem); font-weight: 600; line-height: 1.1;">${t.value}</span>
                ${t.unit?l`<span style="font-size: var(--lumo-font-size-m, 1rem); color: var(--lumo-secondary-text-color, #666);">${t.unit}</span>`:p}
            </div>
            ${t.trend||t.trendLabel?l`
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${fm(t.trend)};">
                    ${pm(t.trend)} ${t.trendLabel??p}
                </span>
            `:p}
            ${t.description?l`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-secondary-text-color, #5f6b7a);">${t.description}</span>`:p}
        </div>
    `},gm=(e,t,n,r,i,a,o)=>l`
        <div class="mateu-scoreboard ${t.cssClasses??``}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??``}"
             slot="${t.slot??p}"
        >
            ${t.children?.map(t=>z(e,t,n,r,i,a,o))}
        </div>
    `,_m=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.colSpan&&s.colSpan>1?`grid-column: span ${s.colSpan};`:``,u=s.rowSpan&&s.rowSpan>1?`grid-row: span ${s.rowSpan};`:``,d=t.children??[];return d.length===1&&d[0].metadata?.type===`MetricCard`?l`
            <div style="min-width: 0; ${c} ${u} ${t.style??``}" slot="${t.slot??p}">
                ${z(e,d[0],n,r,i,a,o)}
            </div>`:l`
        <div class="mateu-dashboard-panel ${t.cssClasses??``}"
             style="${dm} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${u} ${t.style??``}"
             slot="${t.slot??p}"
        >
            ${s.title?l`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${s.title}</h3>
                    ${s.subtitle?l`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${s.subtitle}</span>`:p}
                </div>
            `:p}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(t=>z(e,t,n,r,i,a,o))}
            </div>
        </div>
    `},vm=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.columns&&s.columns>0?`repeat(${s.columns}, minmax(0, 1fr))`:`repeat(auto-fit, minmax(20rem, 1fr))`;return l`
        <div class="mateu-dashboard ${t.cssClasses??``}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??``}"
             slot="${t.slot??p}"
        >
            ${t.children?.map(t=>z(e,t,n,r,i,a,o))}
        </div>
    `},ym=class extends _{constructor(...e){super(...e),this.panels=[],this.headerTitle=``,this.badges=[],this.orientation=`vertical`,this.navigation=null,this.overviewEditActionId=``,this.openPanels=new Set,this.expandedPanel=null,this._onPopState=()=>{let e=decodeURIComponent((location.hash||``).replace(/^#/,``));if(e.startsWith(`expand=`)){let t=e.slice(7),n=this.panels.findIndex((e,n)=>this.panelAnchor(e,n)===t);this.expandedPanel=n>=0?n:null}else this.expandedPanel=null},this.initialized=!1}navAction(e){e&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),window.addEventListener(`popstate`,this._onPopState)}disconnectedCallback(){window.removeEventListener(`popstate`,this._onPopState),super.disconnectedCallback()}willUpdate(){if(!this.initialized&&this.panels.length){this.openPanels=new Set(this.panels.map((e,t)=>e.open?t:-1).filter(e=>e>=0));let e=decodeURIComponent((location.hash||``).replace(/^#/,``));if(e.startsWith(`expand=`)){let t=e.slice(7),n=this.panels.findIndex((e,n)=>this.panelAnchor(e,n)===t);n>=0&&(this.expandedPanel=n)}else if(e){let t=this.panels.findIndex((t,n)=>this.panelAnchor(t,n)===e);t>=0&&this.openPanels.add(t)}this.initialized=!0}}firstUpdated(){let e=decodeURIComponent((location.hash||``).replace(/^#/,``));if(!e)return;let t=this.renderRoot.querySelector(`[data-anchor="${CSS.escape(e)}"]`);t&&t.scrollIntoView({block:`nearest`})}panelAnchor(e,t){return(e.title??``).toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)||`panel-${t}`}bookmarkPanel(e){let t=this.panelAnchor(this.panels[e],e);try{history.replaceState(history.state,``,`#`+t)}catch{}}clearBookmark(e){let t=this.panelAnchor(this.panels[e],e);if(decodeURIComponent((location.hash||``).replace(/^#/,``))===t)try{history.replaceState(history.state,``,location.pathname+location.search)}catch{}}expandPanel(e,t){t?.stopPropagation(),this.expandedPanel=e;let n=this.panelAnchor(this.panels[e],e);try{history.pushState(history.state,``,`#expand=`+n)}catch{}}collapsePanel(){try{history.back()}catch{this.expandedPanel=null}}toggle(e){let t=new Set(this.openPanels);t.has(e)?(t.delete(e),this.clearBookmark(e)):(t.add(e),this.bookmarkPanel(e)),this.openPanels=t}static{this.styles=h`
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
        `}};o([n({type:Array})],ym.prototype,`panels`,void 0),o([n({type:String})],ym.prototype,`headerTitle`,void 0),o([n({type:Array})],ym.prototype,`badges`,void 0),o([n({type:String,reflect:!0})],ym.prototype,`orientation`,void 0),o([n({attribute:!1})],ym.prototype,`navigation`,void 0),o([n({type:String})],ym.prototype,`overviewEditActionId`,void 0),o([s()],ym.prototype,`openPanels`,void 0),o([s()],ym.prototype,`expandedPanel`,void 0),ym=o([i(`mateu-foldout`)],ym);var bm=(e,t,n,r,i,a,o)=>{let s=t.metadata;return l`
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
            ${t.children?.map(t=>z(e,t,n,r,i,a,o))}
        </mateu-foldout>
    `},xm=`mateu-tile-order`,Sm=()=>{try{let e=JSON.parse(localStorage.getItem(xm)??`{}`);return e&&typeof e==`object`&&!Array.isArray(e)?e:{}}catch{return{}}},Cm=(e,t)=>e?.id?String(e.id):`#`+t,wm=e=>{let t=Sm()[e];return Array.isArray(t)?t.filter(e=>typeof e==`string`):null},Tm=(e,t)=>{try{let n=Sm();n[e]=t,localStorage.setItem(xm,JSON.stringify(n))}catch{}},Em=(e,t)=>{if(!t||!t.length)return e.map((e,t)=>t);let n=t.map(t=>e.indexOf(t)).filter(e=>e>=0),r=new Set(n);return[...n,...e.map((e,t)=>t).filter(e=>!r.has(e))]},Dm=(e,t,n)=>{let r=e.indexOf(t),i=e.indexOf(n);if(r<0||i<0||r===i)return e;let a=e.filter(e=>e!==t);return a.splice(i,0,t),a},Om=(e,t)=>{if(e?.type===`Scoreboard`)return`grid-column: 1 / -1;`;let n=e?.type===`DashboardPanel`?e.colSpan:t,r=e?.type===`DashboardPanel`?e.rowSpan:void 0;return(n&&n>1?`grid-column: span ${n};`:``)+(r&&r>1?` grid-row: span ${r};`:``)},km=(e,t,n)=>{let r=e.indexOf(t),i=r+n;return r<0||i<0||i>=e.length?e:Dm(e,t,e[i])},Am=`application/x-mateu-tile`,jm=(e,t,n,i)=>{let a=t.children??[],o=(typeof location<`u`?location.pathname:``)+`#`+(t.id??`grid`),s=a.map((e,t)=>Cm(e,t)),c=Em(s,wm(o)),u=c.map(e=>s[e]),d=t=>{t!==u&&(Tm(o,t),e.requestUpdate())};return c.map(e=>{let t=s[e],c=a[e].metadata;return l`<div class="mateu-tile" draggable="true" tabindex="0" data-tile-key="${t}"
                         aria-roledescription="draggable tile"
                         title="${r(`dragToRearrange`)}"
                         style="min-width: 0; cursor: grab; ${Om(c,i[e])}"
                         @dragstart=${e=>{e.dataTransfer?.setData(Am,o+`
`+t),e.dataTransfer&&(e.dataTransfer.effectAllowed=`move`)}}
                         @dragover=${e=>{e.dataTransfer?.types.includes(Am)&&e.preventDefault()}}
                         @drop=${e=>{let[n,r]=(e.dataTransfer?.getData(Am)??``).split(`
`);n!==o||!r||(e.preventDefault(),d(Dm(u,r,t)))}}
                         @keydown=${e=>{if(!e.altKey||e.key!==`ArrowLeft`&&e.key!==`ArrowRight`||e.target!==e.currentTarget)return;e.preventDefault(),d(km(u,t,e.key===`ArrowLeft`?-1:1));let n=e.currentTarget;requestAnimationFrame(()=>(n.parentElement?.querySelector(`[data-tile-key="${CSS.escape(t)}"]`))?.focus())}}
        >${n(e)}</div>`})},Mm=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.gridTemplateAreas,u=s.gridTemplateColumns&&s.gridTemplateColumns.trim().length?s.gridTemplateColumns:c&&c.trim().length?null:`repeat(auto-fit, minmax(min(100%, 16rem), 1fr))`,d=s.gap??`var(--lumo-space-m, 1rem)`,f=s.colSpans??[],m=s.stickyAreas??[],h=`display: grid;${u?` grid-template-columns: ${u};`:``} gap: ${d}; align-items: start;${c&&c.trim().length?` grid-template-areas: ${c};`:``} ${t.style??``}`,g=s.reorderable&&!(c&&c.trim().length)?jm(e,t,s=>z(e,t.children[s],n,r,i,a,o),f):t.children?.map((t,s)=>{let u=z(e,t,n,r,i,a,o);if(c&&t.slot){let e=m.includes(t.slot)?` position: sticky; top: 1rem; align-self: start; height: fit-content;`:``;return l`<div style="grid-area: ${t.slot}; min-width: 0;${e}">${u}</div>`}return Ed(f[s],u)});if(!s.stackBelow)return l`
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
    `},Nm=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.children??[],u=e=>c.filter(t=>(t.slot??``).startsWith(e)),d=u(`main-`),f=u(`aside-`),m=u(`footer-`),h=s.asideWidth&&s.asideWidth.trim()?s.asideWidth:`32%`,g=s.asidePosition===`start`,_=s.asideSticky!==!1,v=t=>t.map(t=>z(e,t,n,r,i,a,o)),ee=l`
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
    `},Pm={ocean:`#1f4e79`,pine:`#2d5a3d`,lilac:`#5b4a7a`,teal:`#1f5c5c`,rose:`#7a3b4f`,pebble:`#5a5550`,slate:`#3d4a57`,plum:`#5e3557`,sienna:`#7a4a2e`},Fm=`--lumo-primary-text-color: var(--mateu-hero-ink, #fff); --lumo-body-text-color: var(--mateu-hero-ink, #fff); --lumo-secondary-text-color: var(--mateu-hero-ink-secondary, rgba(255, 255, 255, .88)); --lumo-contrast-5pct: rgba(255, 255, 255, .12); --lumo-contrast-10pct: rgba(255, 255, 255, .18);`,Im=e=>(e&&Pm[e])??`var(--mateu-hero-background, color-mix(in srgb, var(--mateu-accent, #1f6f8f) 78%, #0b1a24))`,Lm=e=>e&&/^[\w\s/.:%~?&=#+,@-]+$/.test(e.trim())?`url("${e.trim()}")`:void 0,Rm=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=Lm(s.image),u=!c&&s.centered!==!1,d=u?`center`:`flex-start`,f=u?`center`:`start`;return l`
        <div class="mateu-hero ${t.cssClasses??``}" data-tone="${s.tone??p}"
             style="position: relative; display: flex; flex-direction: column; overflow: hidden; border-radius: var(--lumo-border-radius-l, 12px); margin-top: var(--mateu-hero-margin-top, var(--lumo-space-l, 1.5rem)); min-height: ${s.height??`12rem`}; box-sizing: border-box; background: ${Im(s.tone)}; color: var(--mateu-hero-ink, #fff); ${Fm} ${t.style??``}"
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
                        ${t.children?.map(t=>z(e,t,n,r,i,a,o))}
                    </div>
                `:p}
            </div>
            <div class="mateu-hero-strip" aria-hidden="true"
                 style="position: relative; flex-shrink: 0; height: var(--mateu-page-band-h, 0px); background-image: var(--mateu-page-band-image, none); background-repeat: repeat-x; background-size: auto 100%;"></div>
        </div>
    `},W=e=>t=>{if(t.key===`Enter`){e(t);return}(t.key===` `||t.key===`Spacebar`)&&(t.preventDefault(),e(t))},zm=864e5,Bm=class extends _{constructor(...e){super(...e),this.tasks=[],this.onTaskSelectionActionId=``}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}static{this.styles=h`
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
    
        ${B}
    `}range(){let e=this.tasks.flatMap(e=>[e.start,e.end]).filter(e=>!!e).map(e=>new Date(e+`T00:00:00`).getTime());return e.length?{min:Math.min(...e)-zm,max:Math.max(...e)+2*zm}:null}months(e,t){let n=[],r=new Date(e);for(r.setDate(1);r.getTime()<=t;){let i=Math.max(r.getTime(),e),a=new Date(r.getFullYear(),r.getMonth()+1,1),o=Math.min(a.getTime(),t);n.push({label:r.toLocaleDateString(void 0,{month:`short`,year:`2-digit`}),from:i,to:o}),r.setMonth(r.getMonth()+1)}return n}render(){let e=this.range();if(!e)return l``;let t=e.max-e.min,n=n=>(n-e.min)/t*100,i=Date.now();return l`
            <div class="frame">
                <div class="head">${r(`task`)}</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(e=>l`
                        <div class="month" style="width: ${(e.to-e.from)/t*100}%;">${e.label}</div>
                    `)}
                </div>
                ${this.tasks.map(r=>{let a=new Date(r.start+`T00:00:00`).getTime(),o=new Date(r.end+`T00:00:00`).getTime()+zm;return l`
                        <div class="label" title="${r.title}">${r.title}</div>
                        <div class="lane">
                            ${i>=e.min&&i<=e.max?l`<div class="today" style="left: ${n(i)}%;"></div>`:p}
                            <div role="button" tabindex="0"
                                 aria-label="${r.title}, ${r.start} to ${r.end}${r.progress?`, ${r.progress}% complete`:``}"
                                 class="bar ${this.onTaskSelectionActionId?`clickable`:``}"
                                 title="${r.title} · ${r.start} → ${r.end}${r.progress?` · ${r.progress}%`:``}"
                                 @click="${()=>this.selectTask(r)}" @keydown="${W(()=>this.selectTask(r))}"
                                 style="left: ${n(a)}%; width: ${(o-a)/t*100}%; ${r.color?`--mateu-gantt-fill: ${r.color};`:``}">
                                <div class="fill" style="width: ${r.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};o([n({type:Array})],Bm.prototype,`tasks`,void 0),o([n()],Bm.prototype,`onTaskSelectionActionId`,void 0),Bm=o([i(`mateu-gantt`)],Bm);var Vm=e=>{let t=e.metadata;return l`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                .onTaskSelectionActionId="${t.onTaskSelectionActionId??``}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-gantt>
    `},Hm=`#1a1a1a`,Um=`#fff`,Wm=e=>{let t=e.trim().toLowerCase(),n=t.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);if(n){let e=n[1].length===3?n[1].split(``).map(e=>e+e).join(``):n[1];return[0,2,4].map(t=>parseInt(e.slice(t,t+2),16))}let r=t.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);return r?[+r[1],+r[2],+r[3]]:void 0},Gm=([e,t,n])=>{let r=e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4};return .2126*r(e)+.7152*r(t)+.0722*r(n)},Km=(e,t)=>{let n=Wm(e),r=Wm(t);if(!n||!r)return;let[i,a]=[Gm(n),Gm(r)].sort((e,t)=>t-e);return(i+.05)/(a+.05)},qm=e=>{if(!(!e||!Wm(e)))return(Km(e,Um)??0)>=(Km(e,Hm)??0)?Um:Hm},G,Jm=(e,t)=>({startIdx:Math.min(e,t),endIdx:Math.max(e,t)}),Ym=(e,t,n,r)=>e===`start`?{startIdx:Math.min(r,n),endIdx:n}:{startIdx:t,endIdx:Math.max(r,t)},K=class extends _{static{G=this}constructor(...e){super(...e),this.resources=[],this.blocks=[],this.attributeColumns=[],this.resize=null,this.range=null,this.drag=null,this.dragStartX=0,this.dragStartY=0,this.laneRects=[],this.onDragKeydown=e=>{e.key===`Escape`&&(this.drag||this.resize||this.range)&&(e.stopPropagation(),this.endDrag())}}static{this.styles=h`
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
    `}static parse(e){return new Date(e+`T00:00:00`)}static iso(e){let t=e=>String(e).padStart(2,`0`);return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}static addDays(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}static daysBetween(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}window(){if(this.from&&this.to){let e=G.parse(this.from),t=G.daysBetween(e,G.parse(this.to))+1;return t>0?{from:e,days:t}:null}let e=this.blocks.flatMap(e=>[e.start,e.end]).filter(e=>!!e).map(e=>G.parse(e));if(!e.length)return null;let t=new Date(Math.min(...e.map(e=>e.getTime()))),n=new Date(Math.max(...e.map(e=>e.getTime())));return{from:t,days:G.daysBetween(t,n)+1}}onBlockPointerDown(e,t,n){if(!this.moveActionId&&!this.selectActionId||(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.dragStartX=e.clientX,this.dragStartY=e.clientY,!this.window()))return;let r=G.parse(t.start),i=G.parse(t.end),a=Math.max(1,G.daysBetween(r,i)+1);this.laneRects=[...this.renderRoot.querySelectorAll(`.lane[data-resource-id]`)].map(e=>({resourceId:e.dataset.resourceId,rect:e.getBoundingClientRect()}));let o=this.dayAt(t.resourceId,e.clientX)??n;this.drag={blockId:t.id,duration:a,grabOffsetDays:o-n,originResourceId:t.resourceId,originStartIdx:n,targetResourceId:t.resourceId,targetStartIdx:n,moved:!1},window.addEventListener(`keydown`,this.onDragKeydown)}dayAt(e,t){let n=this.laneRects.find(t=>t.resourceId===e),r=this.window();if(!n||!r||n.rect.width===0)return null;let i=Math.floor((t-n.rect.left)/n.rect.width*r.days);return Math.max(0,Math.min(r.days-1,i))}onBlockPointerMove(e){if(!this.drag||!this.drag.moved&&Math.abs(e.clientX-this.dragStartX)<4&&Math.abs(e.clientY-this.dragStartY)<4||!this.moveActionId)return;let t=this.window();if(!t)return;let n=this.laneRects.find(t=>e.clientY>=t.rect.top&&e.clientY<=t.rect.bottom)??this.laneRects.find(e=>e.resourceId===this.drag.targetResourceId);if(!n)return;let r=this.dayAt(n.resourceId,e.clientX);if(r==null)return;let i=Math.max(0,Math.min(t.days-this.drag.duration,r-this.drag.grabOffsetDays));this.drag={...this.drag,moved:!0,targetResourceId:n.resourceId,targetStartIdx:i}}onBlockPointerUp(e){let t=this.drag;if(this.endDrag(),!t)return;if(!t.moved){this.selectActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.selectActionId,parameters:{_blockId:e.id}},bubbles:!0,composed:!0}));return}if(!this.moveActionId||t.targetResourceId===t.originResourceId&&t.targetStartIdx===t.originStartIdx)return;let n=this.window();if(!n)return;let r=G.addDays(n.from,t.targetStartIdx),i=G.addDays(r,t.duration-1);this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.moveActionId,parameters:{_blockId:t.blockId,_resourceId:t.targetResourceId,_start:G.iso(r),_end:G.iso(i)}},bubbles:!0,composed:!0}))}emit(e,t){this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}measureLanes(){this.laneRects=[...this.renderRoot.querySelectorAll(`.lane[data-resource-id]`)].map(e=>({resourceId:e.dataset.resourceId,rect:e.getBoundingClientRect()}))}onHandlePointerDown(e,t,n,r,i){this.resizeActionId&&(e.preventDefault(),e.stopPropagation(),e.currentTarget.setPointerCapture(e.pointerId),this.measureLanes(),this.resize={blockId:t.id,resourceId:t.resourceId,edge:n,startIdx:r,endIdx:i,originStartIdx:r,originEndIdx:i},window.addEventListener(`keydown`,this.onDragKeydown))}onHandlePointerMove(e){if(!this.resize)return;e.stopPropagation();let t=this.dayAt(this.resize.resourceId,e.clientX);t!=null&&(this.resize={...this.resize,...Ym(this.resize.edge,this.resize.originStartIdx,this.resize.originEndIdx,t)})}onHandlePointerUp(e){e.stopPropagation();let t=this.resize;this.endDrag();let n=this.window();!t||!n||!this.resizeActionId||(t.startIdx!==t.originStartIdx||t.endIdx!==t.originEndIdx)&&this.emit(this.resizeActionId,{_blockId:t.blockId,_resourceId:t.resourceId,_start:G.iso(G.addDays(n.from,t.startIdx)),_end:G.iso(G.addDays(n.from,t.endIdx))})}onCellsPointerDown(e,t){if(!this.rangeSelectActionId||e.button>0)return;e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.measureLanes();let n=this.dayAt(t,e.clientX);n!=null&&(this.range={resourceId:t,anchorIdx:n,currentIdx:n},window.addEventListener(`keydown`,this.onDragKeydown))}onCellsPointerMove(e){if(!this.range)return;let t=this.dayAt(this.range.resourceId,e.clientX);t!=null&&t!==this.range.currentIdx&&(this.range={...this.range,currentIdx:t})}onCellsPointerUp(){let e=this.range;this.endDrag();let t=this.window();if(!e||!t||!this.rangeSelectActionId)return;let{startIdx:n,endIdx:r}=Jm(e.anchorIdx,e.currentIdx);this.emit(this.rangeSelectActionId,{_resourceId:e.resourceId,_start:G.iso(G.addDays(t.from,n)),_end:G.iso(G.addDays(t.from,r))})}endDrag(){this.drag=null,this.resize=null,this.range=null,window.removeEventListener(`keydown`,this.onDragKeydown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener(`keydown`,this.onDragKeydown)}render(){let e=this.window();if(!e||!this.resources.length)return l``;let t=[...Array(e.days).keys()].map(t=>G.addDays(e.from,t)),n=new Date,i=G.daysBetween(e.from,new Date(n.getFullYear(),n.getMonth(),n.getDate())),a=i>=0&&i<e.days,o=[],s;return this.resources.forEach(n=>{n.group&&n.group!==s&&o.push(l`<div class="group">${n.group}</div>`),s=n.group,o.push(this.renderRow(n,e,t,a?i:null))}),l`
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
                <span class="res-name">${e.icon?V(e.icon):p}${e.label}</span>
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
                ${a.map(e=>{let n=G.daysBetween(t.from,G.parse(e.start)),r=G.daysBetween(t.from,G.parse(e.end));if(r<0||n>=t.days)return p;let a=Math.max(0,n),o=Math.min(t.days-1,r),s=this.drag?.moved&&this.drag.blockId===e.id,c=this.resize?.blockId===e.id?this.resize:null,u=c?Math.max(0,c.startIdx):a,d=c?Math.min(t.days-1,c.endIdx):o,f=e.summary??`${e.label??``} · ${e.start} → ${e.end}${e.status?` · ${e.status}`:``}`;return l`
                        <div class="block ${this.selectActionId?`clickable`:``} ${this.moveActionId?`draggable`:``} ${s?`dragging`:``}"
                             title="${f}"
                             style="left: ${u*i}%; width: ${(d-u+1)*i}%; ${e.color?`--mateu-planning-block: ${e.color}; ${qm(e.color)?`--mateu-planning-block-ink: ${qm(e.color)};`:``}`:``}"
                             @dblclick="${this.openActionId?()=>this.emit(this.openActionId,{_blockId:e.id}):p}"
                             @pointerdown="${t=>this.onBlockPointerDown(t,e,n)}"
                             @pointermove="${e=>this.onBlockPointerMove(e)}"
                             @pointerup="${()=>this.onBlockPointerUp(e)}"
                             @pointercancel="${()=>this.endDrag()}"
                        >${this.resizeActionId?l`<span class="handle start"
                                @pointerdown="${t=>this.onHandlePointerDown(t,e,`start`,n,r)}"
                                @pointermove="${e=>this.onHandlePointerMove(e)}"
                                @pointerup="${e=>this.onHandlePointerUp(e)}"></span>`:p}${e.icon?V(e.icon):p}${e.label}${this.resizeActionId?l`<span class="handle end"
                                @pointerdown="${t=>this.onHandlePointerDown(t,e,`end`,n,r)}"
                                @pointermove="${e=>this.onHandlePointerMove(e)}"
                                @pointerup="${e=>this.onHandlePointerUp(e)}"></span>`:p}</div>
                    `})}
                ${this.range&&this.range.resourceId===e.id?(()=>{let{startIdx:e,endIdx:t}=Jm(this.range.anchorIdx,this.range.currentIdx);return l`<div class="range" style="left: ${e*i}%; width: ${(t-e+1)*i}%;"></div>`})():p}
                ${o?l`
                    <div class="ghost"
                         style="left: ${o.targetStartIdx*i}%; width: ${Math.min(o.duration,t.days-o.targetStartIdx)*i}%;"></div>
                `:p}
            </div>
        `}};o([n({type:Array})],K.prototype,`resources`,void 0),o([n({type:Array})],K.prototype,`blocks`,void 0),o([n()],K.prototype,`from`,void 0),o([n()],K.prototype,`to`,void 0),o([n()],K.prototype,`moveActionId`,void 0),o([n()],K.prototype,`selectActionId`,void 0),o([n({type:Array})],K.prototype,`attributeColumns`,void 0),o([n()],K.prototype,`resizeActionId`,void 0),o([n()],K.prototype,`openActionId`,void 0),o([n()],K.prototype,`rangeSelectActionId`,void 0),o([s()],K.prototype,`resize`,void 0),o([s()],K.prototype,`range`,void 0),o([s()],K.prototype,`drag`,void 0),K=G=o([i(`mateu-planning-board`)],K);var Xm=e=>{let t=e.metadata;return l`
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
    `},Zm=class extends _{constructor(...e){super(...e),this.columns=[]}static{this.styles=h`
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
    
        ${B}
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
                                 @click="${()=>this.clickCard(e)}" @keydown="${W(()=>this.clickCard(e))}">
                                <span class="card-title">${e.title}</span>
                                ${e.description?l`<span class="card-desc">${e.description}</span>`:p}
                                ${e.badge?l`<span class="badge">${e.badge}</span>`:p}
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};o([n({type:Array})],Zm.prototype,`columns`,void 0),Zm=o([i(`mateu-kanban`)],Zm);var Qm=e=>{let t=e.metadata;return l`
        <mateu-kanban
                .columns="${t.columns??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-kanban>
    `},$m=class extends _{constructor(...e){super(...e),this.items=[]}static{this.styles=h`
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
    
        ${B}
    `}clickItem(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedItem:e}},bubbles:!0,composed:!0}))}render(){return l`
            <div class="feed">
                ${this.items.map(e=>l`
                    <div class="item ${e.actionId?`clickable`:``}">
                        <div class="rail">
                            <div class="dot" style="${e.color?`--mateu-timeline-dot: ${e.color};`:``}">${e.icon??``}</div>
                            <div class="line"></div>
                        </div>
                        <div role="button" tabindex="0" class="body" @click="${()=>this.clickItem(e)}" @keydown="${W(()=>this.clickItem(e))}">
                            <div class="head">
                                <span class="title">${e.title}</span>
                                ${e.timestamp?l`<span class="time">${e.timestamp}</span>`:p}
                            </div>
                            ${e.description?l`<div class="desc">${e.description}</div>`:p}
                        </div>
                    </div>
                `)}
            </div>
        `}};o([n({type:Array})],$m.prototype,`items`,void 0),$m=o([i(`mateu-timeline`)],$m);var eh=e=>{let t=e.metadata;return l`
        <mateu-timeline
                .items="${t.items??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-timeline>
    `},th=class extends _{constructor(...e){super(...e),this.steps=[],this.vertical=!1}static{this.styles=h`
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
        `}};o([n({type:Array})],th.prototype,`steps`,void 0),o([n({type:Boolean,reflect:!0})],th.prototype,`vertical`,void 0),th=o([i(`mateu-progress-steps`)],th);var nh=e=>{let t=e.metadata;return l`
        <mateu-progress-steps
                .steps="${t.steps??[]}"
                ?vertical="${t.vertical??!1}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-progress-steps>
    `},rh=class extends _{constructor(...e){super(...e),this.spark=[]}static{this.styles=h`
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
    
        ${B}
    `}sparkline(){let e=this.spark;if(!e||e.length<2)return p;let t=Math.min(...e),n=Math.max(...e)-t||1,r=80/(e.length-1),i=e.map((e,i)=>[2+i*r,2+26*(1-(e-t)/n)]),a=i.map(([e,t],n)=>`${n===0?`M`:`L`}${e.toFixed(1)} ${t.toFixed(1)}`).join(` `),o=`${a} L${i[i.length-1][0].toFixed(1)} 30 L${i[0][0].toFixed(1)} 30 Z`,s=this.trend===`down`?`var(--lumo-error-color, #e11d48)`:this.trend===`flat`?`var(--lumo-secondary-text-color, #888)`:`var(--lumo-success-color, #12b76a)`;return m`
            <svg width="${84}" height="${30}" viewBox="0 0 ${84} ${30}">
                <path d="${o}" fill="${s}" opacity="0.12"></path>
                <path d="${a}" fill="none" stroke="${s}" stroke-width="1.6"
                      stroke-linejoin="round" stroke-linecap="round"></path>
            </svg>
        `}dispatchAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){let e=this.trend??`up`;return l`
            <div role="button" tabindex="0" class="tile ${this.actionId?`clickable`:``}" @click="${()=>this.dispatchAction()}" @keydown="${W(()=>this.dispatchAction())}">
                ${this.label?l`<span class="label">${this.label}</span>`:p}
                <span class="value">${this.value}${this.unit?l`<span class="unit">${this.unit}</span>`:p}</span>
                <div class="foot">
                    ${this.delta?l`<span class="delta ${e}">${e===`up`?`▲`:e===`down`?`▼`:`→`} ${this.delta}</span>`:l`<span></span>`}
                    ${this.sparkline()}
                </div>
            </div>
        `}};o([n()],rh.prototype,`label`,void 0),o([n()],rh.prototype,`value`,void 0),o([n()],rh.prototype,`unit`,void 0),o([n()],rh.prototype,`delta`,void 0),o([n()],rh.prototype,`trend`,void 0),o([n({type:Array})],rh.prototype,`spark`,void 0),o([n()],rh.prototype,`actionId`,void 0),rh=o([i(`mateu-stat`)],rh);var ih=e=>{let t=e.metadata;return l`
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
    `},ah=e=>{let[t,n,r]=e.split(`-`).map(Number);return Date.UTC(t,n-1,r)},oh=e=>new Date(e).toISOString().slice(0,10),sh=(e,t)=>oh(ah(e)+t*864e5),ch=e=>(new Date(ah(e)).getUTCDay()+6)%7,lh=e=>e.slice(0,8)+`01`,uh=e=>{let[t,n]=e.split(`-`).map(Number);return oh(Date.UTC(t,n,0))},dh=()=>{let e=new Date;return oh(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()))},fh=(e,t)=>{if(e===`day`)return{from:t,to:t};if(e===`week`){let e=sh(t,-ch(t));return{from:e,to:sh(e,6)}}return{from:lh(t),to:uh(t)}},ph=(e,t)=>{let n=[];for(let r=e;r<=t;r=sh(r,1))n.push(r);return n},mh=e=>{let t=lh(e),n=Array(ch(t)).fill(null);for(n.push(...ph(t,uh(e)));n.length%7;)n.push(null);let r=[];for(let e=0;e<n.length;e+=7)r.push(n.slice(e,e+7));return r},hh=(e,t)=>e.filter(e=>e.date&&e.date<=t&&(e.endDate||e.date)>=t).map((e,t)=>({e,i:t})).sort((e,t)=>(e.e.startTime||``).localeCompare(t.e.startTime||``)||e.i-t.i).map(({e})=>e),gh=(e,t,n)=>ph(t,n).map(t=>({date:t,events:hh(e,t)})).filter(e=>e.events.length),_h=(e,t)=>(e||[]).find(e=>e.date===t),vh=e=>e.startTime?e.startTime+(e.endTime?`–`+e.endTime:``):``,yh=new Set([`info`,`success`,`warning`,`danger`,`neutral`]),bh=e=>e&&yh.has(e)?`tone-`+e:``,xh=class extends _{constructor(...e){super(...e),this.events=[],this.views=[],this.days=[]}willUpdate(e){(e.has(`view`)||!this.shown)&&(this.shown=this.view||`month`)}static{this.styles=h`
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

        ${B}
    `}clickEvent(e,t){t?.stopPropagation(),e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedEvent:e}},bubbles:!0,composed:!0}))}clickDay(e){this.dayActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.dayActionId,parameters:{_date:e}},bubbles:!0,composed:!0}))}chip(e,t){let n=t?vh(e):``;return l`
            <span role="button" tabindex="0" class="chip ${e.actionId?`clickable`:``}"
                  style="${e.color?`--mateu-cal-accent: ${e.color};`:``}"
                  title="${(n?n+` `:``)+(e.title??``)}"
                  @click="${t=>this.clickEvent(e,t)}"
                  @keydown="${W(()=>this.clickEvent(e))}">${n?l`<span class="time">${n}</span>`:p}${e.title}</span>`}dayCell(e,t,n=!0){let r=_h(this.days,e),i=!!this.dayActionId,a=hh(this.events,e),o=new Date(e+`T00:00:00`).toLocaleDateString(void 0,{weekday:`long`,day:`numeric`,month:`long`})+(r?.label?`, `+r.label:``)+(a.length?`, `+a.length+` event`+(a.length>1?`s`:``):``);return l`
            <div class="cell ${e===dh()?`today`:``} ${bh(r?.tone)} ${i?`clickable`:``}"
                 role="${i?`button`:p}" tabindex="${i?`0`:p}"
                 aria-label="${i?o:p}"
                 @click="${i?()=>this.clickDay(e):p}"
                 @keydown="${i?W(()=>this.clickDay(e)):p}">
                <div class="top">
                    ${r?.label?l`<span class="label">${r.label}</span>`:p}
                    ${n?l`<span class="num">${Number(e.slice(8))}</span>`:p}
                </div>
                ${a.map(e=>this.chip(e,t))}
            </div>`}renderMonth(e){return l`
            <div class="grid month">
                ${[`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`,`Sun`].map(e=>l`<div class="dow">${e}</div>`)}
                ${mh(e).flat().map(e=>e?this.dayCell(e,!1):l`<div class="cell blank"></div>`)}
            </div>`}renderWeek(e){let{from:t,to:n}=fh(`week`,e),r=ph(t,n);return l`
            <div class="grid week">
                ${r.map(e=>l`<div class="dow">${new Date(e+`T00:00:00`).toLocaleDateString(void 0,{weekday:`short`,day:`numeric`})}</div>`)}
                ${r.map(e=>this.dayCell(e,!0,!1))}
            </div>`}renderDay(e){return l`
            <div class="grid day">
                <div class="dow">${new Date(e+`T00:00:00`).toLocaleDateString(void 0,{weekday:`long`,day:`numeric`,month:`long`})}</div>
                ${this.dayCell(e,!0,!1)}
            </div>`}renderList(e){let{from:t,to:n}=fh(`list`,e),i=gh(this.events,t,n);return i.length?l`
            <div class="agenda">
                ${i.map(({date:e,events:t})=>{let n=_h(this.days,e);return l`
                        <div class="date ${bh(n?.tone)}">
                            <span>${new Date(e+`T00:00:00`).toLocaleDateString(void 0,{weekday:`long`,day:`numeric`,month:`long`})}</span>
                            ${n?.label?l`<span class="label">${n.label}</span>`:p}
                        </div>
                        <div class="entries">${t.map(e=>this.chip(e,!0))}</div>`})}
            </div>`:l`<div class="agenda"><div class="empty">${r(`noEvents`)}</div></div>`}titleOf(e,t){let n=new Date(t+`T00:00:00`);if(e===`day`)return n.toLocaleDateString(void 0,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`});if(e===`week`){let{from:e,to:n}=fh(`week`,t),r=new Date(e+`T00:00:00`),i=new Date(n+`T00:00:00`);return r.toLocaleDateString(void 0,{day:`numeric`,month:`short`})+` – `+i.toLocaleDateString(void 0,{day:`numeric`,month:`short`,year:`numeric`})}return n.toLocaleDateString(void 0,{month:`long`,year:`numeric`})}render(){let e=this.month||dh(),t=this.shown||`month`;return l`
            <div class="head">
                <div class="title">${this.titleOf(t,e)}</div>
                ${this.views&&this.views.length>1?l`
                    <div class="switcher" role="group" aria-label="${r(`calendarView`)}">
                        ${this.views.map(e=>l`<button type="button" aria-pressed="${e===t?`true`:`false`}"
                            @click="${()=>{this.shown=e}}">${e.charAt(0).toUpperCase()+e.slice(1)}</button>`)}
                    </div>`:p}
            </div>
            ${t===`week`?this.renderWeek(e):t===`day`?this.renderDay(e):t===`list`?this.renderList(e):this.renderMonth(e)}
        `}};o([n()],xh.prototype,`month`,void 0),o([n({type:Array})],xh.prototype,`events`,void 0),o([n()],xh.prototype,`view`,void 0),o([n({type:Array})],xh.prototype,`views`,void 0),o([n({type:Array})],xh.prototype,`days`,void 0),o([n()],xh.prototype,`dayActionId`,void 0),o([s()],xh.prototype,`shown`,void 0),xh=o([i(`mateu-calendar`)],xh);var Sh=e=>{let t=e.metadata;return l`
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
    `},Ch=class extends _{constructor(...e){super(...e),this.plans=[]}static{this.styles=h`
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
        `}};o([n({type:Array})],Ch.prototype,`plans`,void 0),Ch=o([i(`mateu-pricing-table`)],Ch);var wh=e=>{let t=e.metadata;return l`
        <mateu-pricing-table
                .plans="${t.plans??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-pricing-table>
    `},Th=class extends _{static{this.styles=h`
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
    
        ${B}
    `}clickNode(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedNode:e}},bubbles:!0,composed:!0}))}renderNode(e){let t=e.avatar,n=t&&(t.startsWith(`http`)||t.startsWith(`data:`));return l`
            <li>
                <div role="button" tabindex="0" class="node ${e.actionId?`clickable`:``}"
                     style="${e.color?`--mateu-org-accent: ${e.color};`:``}"
                     @click="${()=>this.clickNode(e)}" @keydown="${W(()=>this.clickNode(e))}">
                    ${t?l`<span class="avatar">${n?l`<img src="${t}" alt="">`:t}</span>`:p}
                    <span class="title">${e.title}</span>
                    ${e.subtitle?l`<span class="subtitle">${e.subtitle}</span>`:p}
                </div>
                ${e.children&&e.children.length?l`<ul>${e.children.map(e=>this.renderNode(e))}</ul>`:p}
            </li>
        `}render(){return this.root?l`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`:l``}};o([n({attribute:!1})],Th.prototype,`root`,void 0),Th=o([i(`mateu-org-chart`)],Th);var Eh=e=>{let t=e.metadata;return l`
        <mateu-org-chart
                .root="${t.root}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-org-chart>
    `},Dh=864e5,Oh=class extends _{constructor(...e){super(...e),this.cells=[]}static{this.styles=h`
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
    `}color(e,t){if(e<=0||t<=0)return`var(--lumo-contrast-10pct, #ebedf0)`;let n=e/t;return`color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round((n>.75?1:n>.5?.75:n>.25?.5:.3)*100)}%, transparent)`}render(){let e=this.cells.filter(e=>!!e.date);if(!e.length)return l``;let t=e.map(e=>new Date(e.date+`T00:00:00`).getTime()),n=Math.min(...t),i=Math.max(...t),a=new Date(n);a.setDate(a.getDate()-(a.getDay()+6)%7);let o={};for(let t of e)o[t.date]=t;let s=Math.max(...e.map(e=>e.value??0),1),c=[];for(let e=a.getTime();e<=i;e+=Dh){let t=new Date(e),n=t.toISOString().slice(0,10),r=o[n],i=r?.value??0,a=(t.getDay()+6)%7+1,u=r?.label??`${n}: ${i}`;c.push(l`
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
        `}};o([n({type:Array})],Oh.prototype,`cells`,void 0),Oh=o([i(`mateu-heatmap`)],Oh);var kh=e=>{let t=e.metadata;return l`
        <mateu-heatmap
                .cells="${t.cells??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-heatmap>
    `},Ah=class extends _{constructor(...e){super(...e),this.stages=[]}static{this.styles=h`
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
                            <div class="bar" style="width: ${o}%; ${r.color?`--bar: ${r.color}; ${qm(r.color)?`--bar-ink: ${qm(r.color)};`:``}`:``}">
                                ${a.toLocaleString()}
                            </div>
                        </div>
                    `})}
            </div>
        `}};o([n({type:Array})],Ah.prototype,`stages`,void 0),Ah=o([i(`mateu-funnel`)],Ah);var jh=e=>{let t=e.metadata;return l`
        <mateu-funnel
                .stages="${t.stages??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-funnel>
    `},Mh=class extends _{constructor(...e){super(...e),this.values=[],this.labels=[],this.area=!1}static{this.styles=h`
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
        `}};o([n()],Mh.prototype,`heading`,void 0),o([n({type:Array})],Mh.prototype,`values`,void 0),o([n({type:Array})],Mh.prototype,`labels`,void 0),o([n()],Mh.prototype,`color`,void 0),o([n({type:Boolean})],Mh.prototype,`area`,void 0),Mh=o([i(`mateu-trend-chart`)],Mh);var Nh=e=>{let t=e.metadata;return l`
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
    `},Ph=class extends _{constructor(...e){super(...e),this.features=[],this.columns=0}static{this.styles=h`
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
    
        ${B}
    `}clickFeature(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){let e=this.columns&&this.columns>0?`repeat(${this.columns}, minmax(0, 1fr))`:`repeat(auto-fit, minmax(15rem, 1fr))`;return l`
            <div class="grid" style="grid-template-columns: ${e};">
                ${this.features.map(e=>l`
                    <div role="button" tabindex="0" class="card ${e.actionId?`clickable`:``}" @click="${()=>this.clickFeature(e)}" @keydown="${W(()=>this.clickFeature(e))}">
                        ${e.icon?l`<span class="icon">${e.icon}</span>`:p}
                        <span class="title">${e.title}</span>
                        ${e.description?l`<span class="desc">${e.description}</span>`:p}
                    </div>
                `)}
            </div>
        `}};o([n({type:Array})],Ph.prototype,`features`,void 0),o([n({type:Number})],Ph.prototype,`columns`,void 0),Ph=o([i(`mateu-feature-grid`)],Ph);var Fh=e=>{let t=e.metadata;return l`
        <mateu-feature-grid
                .features="${t.features??[]}"
                .columns="${t.columns??0}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-feature-grid>
    `},Ih=class extends _{constructor(...e){super(...e),this.items=[]}static{this.styles=h`
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
        `}};o([n({type:Array})],Ih.prototype,`items`,void 0),Ih=o([i(`mateu-testimonials`)],Ih);var Lh=e=>{let t=e.metadata;return l`
        <mateu-testimonials
                .items="${t.items??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-testimonials>
    `},Rh=class extends _{constructor(...e){super(...e),this.items=[],this.openSet=new Set,this.seeded=!1}static{this.styles=h`
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
    
        ${B}
    `}seed(){this.seeded||(this.seeded=!0,this.items.forEach((e,t)=>{e.open&&this.openSet.add(t)}))}toggle(e){this.openSet.has(e)?this.openSet.delete(e):this.openSet.add(e),this.requestUpdate()}render(){return this.seed(),l`
            <div class="list">
                ${this.items.map((e,t)=>{let n=this.openSet.has(t);return l`
                        <div class="item ${n?`open`:``}">
                            <div role="button" tabindex="0" aria-expanded="${n}" class="q" @click="${()=>this.toggle(t)}" @keydown="${W(()=>this.toggle(t))}">
                                <span>${e.question}</span>
                                <span class="chevron">›</span>
                            </div>
                            ${n?l`<div class="a">${e.answer}</div>`:``}
                        </div>
                    `})}
            </div>
        `}};o([n({type:Array})],Rh.prototype,`items`,void 0),o([s()],Rh.prototype,`openSet`,void 0),Rh=o([i(`mateu-faq`)],Rh);var zh=e=>{let t=e.metadata;return l`
        <mateu-faq
                .items="${t.items??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-faq>
    `},Bh=class extends _{static{this.styles=h`
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
        `}};o([n()],Bh.prototype,`heading`,void 0),o([n()],Bh.prototype,`description`,void 0),o([n()],Bh.prototype,`icon`,void 0),o([n()],Bh.prototype,`ctaLabel`,void 0),o([n()],Bh.prototype,`actionId`,void 0),o([n()],Bh.prototype,`theme`,void 0),Bh=o([i(`mateu-callout-card`)],Bh);var Vh=e=>{let t=e.metadata;return l`
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
    `},Hh=class extends _{constructor(...e){super(...e),this.comments=[]}static{this.styles=h`
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
        `}render(){return l`<div class="thread">${this.comments.map(e=>this.renderComment(e))}</div>`}};o([n({type:Array})],Hh.prototype,`comments`,void 0),Hh=o([i(`mateu-comment-thread`)],Hh);var Uh=e=>{let t=e.metadata;return l`
        <mateu-comment-thread
                .comments="${t.comments??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-comment-thread>
    `},Wh={pdf:`vaadin:file-text-o`,image:`vaadin:file-picture`,img:`vaadin:file-picture`,doc:`vaadin:file-text-o`,docx:`vaadin:file-text-o`,word:`vaadin:file-text-o`,xls:`vaadin:file-table`,xlsx:`vaadin:file-table`,excel:`vaadin:file-table`,sheet:`vaadin:file-table`,zip:`vaadin:file-zip`,archive:`vaadin:file-zip`,video:`vaadin:file-movie`,audio:`vaadin:file-sound`,code:`vaadin:file-code`,csv:`vaadin:file-table`,txt:`vaadin:file-text-o`},Gh=class extends _{constructor(...e){super(...e),this.files=[]}static{this.styles=h`
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
    
        ${B}
    `}icon(e){return V(e&&Wh[e.toLowerCase()]||`vaadin:file-o`,`width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem);`)}clickFile(e,t){e.url||e.actionId&&(t.preventDefault(),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_file:e}},bubbles:!0,composed:!0})))}render(){return l`
            <div class="list">
                ${this.files.map(e=>{let t=!!e.url||!!e.actionId,n=l`
                        <span class="icon" aria-hidden="true">${this.icon(e.type)}</span>
                        <span class="name">${e.name}</span>
                        ${e.size?l`<span class="size">${e.size}</span>`:p}
                        ${e.url?l`<span class="dl" aria-hidden="true">${V(`vaadin:download`,`width: var(--lumo-icon-size-s, 1rem); height: var(--lumo-icon-size-s, 1rem);`)}</span>`:p}
                    `;return e.url?l`<a class="file clickable" href="${H(el(e.url,{allowData:!0}))}" download target="_blank" rel="noopener">${n}</a>`:l`<div role="button" tabindex="0" class="file ${t?`clickable`:``}" @click="${t=>this.clickFile(e,t)}" @keydown="${W(t=>this.clickFile(e,t))}">${n}</div>`})}
            </div>
        `}};o([n({type:Array})],Gh.prototype,`files`,void 0),Gh=o([i(`mateu-file-list`)],Gh);var Kh=e=>{let t=e.metadata;return l`
        <mateu-file-list
                .files="${t.files??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-file-list>
    `},qh=class extends _{constructor(...e){super(...e),this.items=[],this.localDone=new Map}static{this.styles=h`
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
    
        ${B}
    `}isDone(e,t){return this.localDone.has(t)?!!this.localDone.get(t):!!e.done}toggle(e,t){let n=!this.isDone(e,t);this.localDone.set(t,n),this.requestUpdate(),e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_item:e,_done:n}},bubbles:!0,composed:!0}))}render(){let e=this.items.length,t=this.items.filter((e,t)=>this.isDone(e,t)).length,n=e>0?Math.round(t/e*100):0;return l`
            <div class="head">
                ${this.heading?l`<span class="title">${this.heading}</span>`:l`<span></span>`}
                <span class="count">${t} / ${e}</span>
            </div>
            <div class="bar"><div class="fill" style="width: ${n}%;"></div></div>
            ${this.items.map((e,t)=>{let n=this.isDone(e,t);return l`
                    <div role="button" tabindex="0" class="item ${n?`done`:``}" @click="${()=>this.toggle(e,t)}" @keydown="${W(()=>this.toggle(e,t))}">
                        <span class="box">${n?`✓`:p}</span>
                        <span class="label">${e.label}</span>
                    </div>
                `})}
        `}};o([n()],qh.prototype,`heading`,void 0),o([n({type:Array})],qh.prototype,`items`,void 0),o([s()],qh.prototype,`localDone`,void 0),qh=o([i(`mateu-checklist`)],qh);var Jh=e=>{let t=e.metadata;return l`
        <mateu-checklist
                heading="${t.title??p}"
                .items="${t.items??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-checklist>
    `},Yh=class extends _{static{this.styles=h`
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
        `}};o([n()],Yh.prototype,`heading`,void 0),o([n()],Yh.prototype,`leftLabel`,void 0),o([n()],Yh.prototype,`leftValue`,void 0),o([n()],Yh.prototype,`rightLabel`,void 0),o([n()],Yh.prototype,`rightValue`,void 0),o([n()],Yh.prototype,`delta`,void 0),o([n()],Yh.prototype,`trend`,void 0),Yh=o([i(`mateu-comparison-card`)],Yh);var Xh=e=>{let t=e.metadata;return l`
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
    `},Zh=h`
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
`,Qh=new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}),$h=e=>Number.isFinite(e)?Qh.format(e):``,eg=(e,t)=>{let n=e<0?`-`:``,r=$h(Math.abs(e));return t?`${n}${t} ${r}`:`${n}${r}`},tg=(e,t)=>t?`${$h(e)} ${t}`:$h(e),ng=class extends _{constructor(...e){super(...e),this.title=``,this.badges=[],this.facts=[]}static{this.styles=[Zh,h`
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
        `}};o([n()],ng.prototype,`title`,void 0),o([n({type:Array})],ng.prototype,`badges`,void 0),o([n()],ng.prototype,`subtitle`,void 0),o([n({type:Array})],ng.prototype,`facts`,void 0),o([n()],ng.prototype,`metricLabel`,void 0),o([n()],ng.prototype,`metricValue`,void 0),o([n()],ng.prototype,`metricCaption`,void 0),ng=o([i(`mateu-entity-header`)],ng);var rg=e=>{if(e.__hoistedToPageHeader)return l``;let t=e.metadata;return l`
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
    `},ig=class extends _{constructor(...e){super(...e),this.value=0,this.max=0}static{this.styles=h`
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
                <span class="value">${tg(this.value,this.unit)}</span>
                <div class="track">
                    <div class="fill ${this.fillColor()}" style="width: ${t}%"></div>
                </div>
                <span class="caption">${this.caption?this.caption:`${t}%`}</span>
            </div>
        `}};o([n()],ig.prototype,`label`,void 0),o([n({type:Number})],ig.prototype,`value`,void 0),o([n({type:Number})],ig.prototype,`max`,void 0),o([n()],ig.prototype,`unit`,void 0),o([n()],ig.prototype,`caption`,void 0),o([n({type:Number})],ig.prototype,`warnAt`,void 0),o([n({type:Number})],ig.prototype,`dangerAt`,void 0),ig=o([i(`mateu-meter`)],ig);var ag=e=>{let t=e.metadata;return l`
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
    `},og=class extends _{constructor(...e){super(...e),this.total=0,this.done=0}static{this.styles=h`
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
                <span class="icon" aria-hidden="true">${V(`vaadin:users`,`width: var(--lumo-icon-size-s, 1rem); height: var(--lumo-icon-size-s, 1rem);`)}</span>
                ${this.label?l`<span class="label">${this.label}</span>`:p}
                <div class="pills">
                    ${Array.from({length:this.total},(e,t)=>l`
                        <span class="pill ${t+1<=this.done?`filled`:``}">${t+1}/${this.total}</span>
                    `)}
                </div>
                <span class="spacer"></span>
                ${t?l`<button @click="${()=>this.runAction()}">${this.actionLabel} →</button>`:p}
            </div>
        `}};o([n()],og.prototype,`label`,void 0),o([n({type:Number})],og.prototype,`total`,void 0),o([n({type:Number})],og.prototype,`done`,void 0),o([n()],og.prototype,`actionLabel`,void 0),o([n()],og.prototype,`actionId`,void 0),og=o([i(`mateu-task-progress`)],og);var sg=e=>{let t=e.metadata;return l`
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
    `},cg=class extends _{constructor(...e){super(...e),this.items=[],this.compact=!1,this.frameless=!1,this.columns=0,this.itemHeadingLevel=3}static{this.styles=[Zh,B,h`
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
                    ${V(r)}
                </button>`:l`
            <button class="row-action" title="${t}"
                @click="${t=>{t.stopPropagation(),this.runAction(e,n)}}">${t}</button>`}render(){let e=this.columns>1||this.items.some(e=>e.actionId||e.actionId2||e.actionId3||(e.lines?.length??0)>0),t=this.itemHeadingLevel===4?`h4`:`h3`;return e?l`
                <div class="list stacked ${this.compact?`compact`:``} ${this.columns>1?`grid`:``}"
                     style="${this.columns>1?`grid-template-columns: repeat(auto-fit, minmax(min(18rem, calc(100% / ${this.columns} - 1.5rem)), 1fr));`:``}">
                    ${this.items.map(e=>l`
                        <div role="button" tabindex="0" class="cell ${(e.lines?.length??0)>0?`with-lines`:``} ${this.rowActionId?`clickable`:``}"
                             @click="${()=>this.rowClicked(e)}" @keydown="${W(()=>this.rowClicked(e))}">
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
                         @click="${()=>this.rowClicked(e)}" @keydown="${W(()=>this.rowClicked(e))}">
                        ${e.avatar?l`<span class="avatar">${e.avatar}</span>`:e.icon?l`<span class="icon">${e.icon}</span>`:p}
                        <div class="body">
                            <span class="title">${e.title}</span>
                            ${e.description?l`<span class="description">${e.description}</span>`:p}
                        </div>
                        ${e.status?l`<span class="chip ${e.statusColor??``}">${e.status}</span>`:p}
                    </div>
                `)}
            </div>
        `}};o([n({type:Array})],cg.prototype,`items`,void 0),o([n({type:Boolean})],cg.prototype,`compact`,void 0),o([n({type:Boolean})],cg.prototype,`frameless`,void 0),o([n()],cg.prototype,`rowActionId`,void 0),o([n({type:Number})],cg.prototype,`columns`,void 0),o([n({type:Number})],cg.prototype,`itemHeadingLevel`,void 0),cg=o([i(`mateu-status-list`)],cg);var lg=e=>{let t=e.metadata;return l`
        <mateu-status-list
                .items="${t.items??[]}"
                ?compact="${t.compact??!1}"
                ?frameless="${t.frameless??!1}"
                columns="${t.columns??0}"
                itemHeadingLevel="${t.itemHeadingLevel??3}"
                rowActionId="${H(t.rowActionId??void 0)}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-status-list>
    `},ug=class extends _{constructor(...e){super(...e),this.items=[]}static{this.styles=h`
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
        `}};o([n({type:Array})],ug.prototype,`items`,void 0),ug=o([i(`mateu-bulleted-list`)],ug);var dg=e=>{let t=e.metadata;return l`
        <mateu-bulleted-list
                .items="${t.items??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-bulleted-list>
    `},fg=e=>(e.label??``)+((e.count??0)>0?` (${(e.count??0)>25?`25+`:e.count})`:``),pg=(e,t={})=>{let n=(e.maxPerCategory??0)>0?e.maxPerCategory:10;return(e.categories??[]).map((e,r)=>{let i=(e.actions??[]).map((e,t)=>({a:e,i:t})).sort((e,t)=>Number(!!t.a.populated)-Number(!!e.a.populated)||e.i-t.i).map(({a:e})=>({label:fg(e),actionId:e.actionId??``,parameters:e.parameters??{},populated:!!e.populated,disabled:!!e.disabled}));t.hideUnpopulated&&(i=i.filter(e=>e.populated));let a=t.showAll?.has(r)?i:i.slice(0,n);return{title:e.title??``,actions:a,hiddenCount:i.length-a.length,index:r}}).filter(e=>e.actions.length>0)},mg=(e,t)=>{let n=String(e??``).toLowerCase().split(`+`).map(e=>e.trim()).filter(Boolean);if(!n.length)return!1;let r=e=>n.includes(e),i=n.find(e=>![`ctrl`,`control`,`alt`,`shift`,`meta`,`cmd`].includes(e));return!i||t.ctrlKey!==(r(`ctrl`)||r(`control`))||t.altKey!==r(`alt`)||t.shiftKey!==r(`shift`)||t.metaKey!==(r(`meta`)||r(`cmd`))?!1:t.key?.toLowerCase()===i||t.code===`Key`+i.toUpperCase()||t.code===`Digit`+i||t.code===`Numpad`+i},hg=class extends _{constructor(...e){super(...e),this.open=!1,this.hideUnpopulated=!1,this.showAll=new Set,this.keydown=e=>{if(this.open&&e.key===`Escape`){e.preventDefault(),this.close();return}!this.open&&this.panel?.shortcut&&this.isConnected&&this.getClientRects().length&&mg(this.panel.shortcut,e)&&(e.preventDefault(),this.show())}}connectedCallback(){super.connectedCallback(),document.addEventListener(`keydown`,this.keydown,!0)}disconnectedCallback(){document.removeEventListener(`keydown`,this.keydown,!0),this.focusTrap?.release(),this.focusTrap=void 0,super.disconnectedCallback()}show(){this.showAll=new Set,this.open=!0}close(){this.open=!1,this.focusTrap?.release(),this.focusTrap=void 0}updated(){let e=this.renderRoot.querySelector(`[role="dialog"]`);this.open&&e&&!this.focusTrap?this.focusTrap=c(e):this.open&&this.focusTrap?.refresh()}pick(e){e.disabled||(this.close(),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:e.parameters},bubbles:!0,composed:!0})))}render(){let e=this.panel;if(!e)return p;let t=e.label||`I want to…`,n=pg(e,{showAll:this.showAll,hideUnpopulated:this.hideUnpopulated});return l`
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
    `}};o([n({attribute:!1})],hg.prototype,`panel`,void 0),o([s()],hg.prototype,`open`,void 0),o([s()],hg.prototype,`hideUnpopulated`,void 0),o([s()],hg.prototype,`showAll`,void 0),hg=o([i(`mateu-action-panel`)],hg);var gg=e=>l`
    <mateu-action-panel
            .panel="${e.metadata}"
            style="${e.style??p}"
            class="${e.cssClasses??p}"
            slot="${e.slot??p}"
    ></mateu-action-panel>
`,_g=(e,t)=>{let n=[];for(let r of e.sections??[]){let e=!!r.title,i=e&&t.has(r.id);if(e&&n.push({kind:`section`,id:r.id,title:r.title,collapsed:i}),!i)for(let t of r.rows??[])n.push({kind:`row`,row:t,sectionId:r.id,indented:e})}return n},vg=e=>new Set((e.sections??[]).filter(e=>e.title&&e.collapsed).map(e=>e.id)),yg=e=>{let t=e.columns??[];if(!t.some(e=>e.group))return[];let n=[];for(let e of t){let t=e.group??``,r=n[n.length-1];r&&r.label===t?r.span++:n.push({label:t,span:1})}return n},bg=new Set([`info`,`success`,`warning`,`danger`,`neutral`]),xg=(e,t)=>e&&bg.has(e)?e:t&&bg.has(t)?t:``,Sg=class extends _{constructor(...e){super(...e),this.collapsed=new Set}willUpdate(e){e.has(`grid`)&&this.grid&&!this.seenGrid&&(this.collapsed=vg(this.grid)),e.has(`grid`)&&(this.seenGrid=this.grid,this.editing=void 0)}toggle(e){let t=new Set(this.collapsed);t.has(e)?t.delete(e):t.add(e),this.collapsed=t}dispatch(e,t,n,r){let i=this.grid?.columns?.[n];this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:{_rowId:t,_columnId:i?.id,_value:r}},bubbles:!0,composed:!0}))}commit(e,t,n){if(!this.editing)return;this.editing=void 0;let r=e.cells?.[t]?.value??``;n.value!==r&&this.grid?.editActionId&&this.dispatch(this.grid.editActionId,e.id,t,n.value)}renderCell(e,t){let n=this.grid,r=e.cells?.[t]??{},i=n.columns?.[t],a=xg(r.tone,i?.tone),o=!!(e.editable&&n.editActionId),s=`${e.label??``}, ${i?.label??``}: ${r.value??``}`;if(this.editing&&this.editing.rowId===e.id&&this.editing.columnIndex===t)return l`<td class="cell ${a} editing"><input aria-label="${s}" .value="${r.value??``}"
                @keydown="${n=>{n.key===`Enter`&&this.commit(e,t,n.target),n.key===`Escape`&&(this.editing=void 0)}}"
                @blur="${n=>this.commit(e,t,n.target)}" /></td>`;let c=()=>{this.editing={rowId:e.id,columnIndex:t}};return r.link&&n.cellActionId?l`<td class="cell ${a}"><button class="link" type="button" aria-label="${s}"
                @click="${()=>this.dispatch(n.cellActionId,e.id,t,r.value??``)}">${r.value}</button></td>`:l`<td class="cell ${a} ${o?`editable`:``}" tabindex="${o?`0`:p}"
            aria-label="${o?s:p}"
            @dblclick="${o?c:p}"
            @keydown="${o?e=>{(e.key===`Enter`||e.key===`F2`)&&(e.preventDefault(),c())}:p}">${r.value}</td>`}updated(){this.renderRoot.querySelector(`td.editing input`)?.focus()}render(){let e=this.grid;if(!e)return p;let t=e.columns??[],n=yg(e);return l`
            <div class="scroller">
                <table>
                    <thead>
                        ${n.length?l`<tr>
                            <th class="corner" rowspan="2">${e.rowHeaderLabel??``}</th>
                            ${n.map(e=>l`<th class="group" colspan="${e.span}">${e.label}</th>`)}
                        </tr>`:p}
                        <tr>
                            ${n.length?p:l`<th class="corner">${e.rowHeaderLabel??``}</th>`}
                            ${t.map(e=>l`<th class="col ${xg(null,e.tone)}" scope="col">${e.label??e.id}</th>`)}
                        </tr>
                    </thead>
                    <tbody>
                        ${_g(e,this.collapsed).map(e=>e.kind===`section`?l`<tr class="section"><th scope="rowgroup" class="rowhead">
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
    `}};o([n({attribute:!1})],Sg.prototype,`grid`,void 0),o([s()],Sg.prototype,`collapsed`,void 0),o([s()],Sg.prototype,`editing`,void 0),Sg=o([i(`mateu-matrix-grid`)],Sg);var Cg=e=>l`
    <mateu-matrix-grid
            .grid="${e.metadata}"
            style="${e.style??p}"
            class="${e.cssClasses??p}"
            slot="${e.slot??p}"
    ></mateu-matrix-grid>
`,wg=e=>e?`application/x-mateu-`+String(e).toLowerCase().replace(/[^a-z0-9.+-]/g,`-`):``,Tg=e=>{let t;try{t=JSON.parse(e)}catch{return[]}return(Array.isArray(t)?t:[t]).map(e=>{if(e==null)return null;if(typeof e!=`object`)return String(e);let t=e,n=(t.data&&typeof t.data==`object`?t.data:t).id??t.key;return n==null?null:String(n)}).filter(e=>e!=null)},Eg=(e,t,n)=>({...e??{},_draggedIds:t,_dragType:n}),Dg=class extends _{constructor(...e){super(...e),this.ready=!1,this.over=!1,this.onDocumentDragStart=e=>{setTimeout(()=>{this.ready=this.accepts(e)})},this.onDocumentDragEnd=()=>{this.ready=!1,this.over=!1}}get mime(){return wg(this.zone?.accept)}accepts(e){let t=e.dataTransfer?Array.from(e.dataTransfer.types):[];return!!this.mime&&t.includes(this.mime)}connectedCallback(){super.connectedCallback(),document.addEventListener(`dragstart`,this.onDocumentDragStart,!0),document.addEventListener(`dragend`,this.onDocumentDragEnd,!0)}disconnectedCallback(){document.removeEventListener(`dragstart`,this.onDocumentDragStart,!0),document.removeEventListener(`dragend`,this.onDocumentDragEnd,!0),super.disconnectedCallback()}onDragOver(e){this.accepts(e)&&(e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect=`move`),this.over=!0)}onDrop(e){if(!this.accepts(e))return;e.preventDefault(),this.over=!1,this.ready=!1;let t=Tg(e.dataTransfer?.getData(this.mime)??``);!t.length||!this.zone?.actionId||this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.zone.actionId,parameters:Eg(this.zone.parameters,t,this.zone.accept??``)},bubbles:!0,composed:!0}))}render(){let e=this.zone;return e?l`
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
    `}};o([n({attribute:!1})],Dg.prototype,`zone`,void 0),o([s()],Dg.prototype,`ready`,void 0),o([s()],Dg.prototype,`over`,void 0),Dg=o([i(`mateu-drop-zone`)],Dg);var Og=(e,t,n,r,i,a,o)=>l`
    <mateu-drop-zone
            .zone="${t.metadata}"
            style="${t.style??p}"
            class="${t.cssClasses??p}"
            slot="${t.slot??p}"
    >${(t.children??[]).map(t=>z(e,t,n,r,i,a,o))}</mateu-drop-zone>
`,kg=e=>{let t=e.metadata.attributes?.[`data-colspan`];return l`
        <hr style="border: none; border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); width: 100%; margin: var(--lumo-space-s, .5rem) 0; ${e.style??``}"
            class="${e.cssClasses??p}"
            id="${H(e.id??void 0)}"
            data-colspan="${H(t)}"
            slot="${e.slot??p}"/>
    `},Ag=new Map,jg=e=>Ag.get(e),Mg=(e,t)=>t!=null&&e!=null&&!e.has(t),Ng=typeof HTMLElement<`u`?HTMLElement:class{},Pg=class extends Ng{static get observedAttributes(){return[`type`,`renderer`]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){let e=this.getAttribute(`type`)??`unknown`,t=this.getAttribute(`renderer`)??`unknown`;this.shadowRoot||this.attachShadow({mode:`open`}),this.shadowRoot.innerHTML=`
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
        `}};typeof customElements<`u`&&!customElements.get(`mateu-unsupported`)&&customElements.define(`mateu-unsupported`,Pg);var Fg=new Set,Ig=(e,t,n)=>{let r=`${n}/${t}`;return Fg.has(r)||(Fg.add(r),console.warn(`[mateu] Component type "${t}" is not supported by the "${n}" renderer — rendering <mateu-unsupported> placeholder.`)),l`<mateu-unsupported
            type="${t}"
            renderer="${n}"
            data-component-id="${e?.id??p}"
            slot="${e?.slot??p}"
    ></mateu-unsupported>`},Lg=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.children?.map(t=>z(e,t,n,r,i,a,o,!1))??[],l=jg(s.name);return l?l(s.props??{},c):Ig(t,`${E.CustomComponent}:${s.name}`,`custom-component-registry`)},Rg={info:`vaadin:info-circle`,success:`vaadin:check-circle`,warning:`vaadin:warning`,danger:`vaadin:exclamation-circle`},zg=e=>!!e&&/^[a-z][\w-]*:[\w-]+$/.test(e),q=class extends _{constructor(...e){super(...e),this.text=``,this.theme=`info`,this.noIcon=!1,this.slim=!1,this.fullWidth=!1,this.hasContent=!1,this.inlineContent=!1}static{this.styles=h`
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
                ${this.noIcon?p:this.icon&&!zg(this.icon)?l`<span class="icon custom" aria-hidden="true">${this.icon}</span>`:l`<span class="icon" aria-hidden="true">${V(this.icon||Rg[t])}</span>`}
                <div class="body ${this.inlineContent?`inline`:``}">
                    ${e?l`<span class="text">${this.text}</span>`:p}
                    ${this.hasContent?l`<div class="content"><slot></slot></div>`:p}
                </div>
                ${this.actionLabel&&this.actionId?l`<button class="notice-action" @click="${()=>this.runAction()}">${this.actionLabel}</button>`:this.status?l`<span class="status">${this.status}</span>`:p}
            </div>
        `}};o([n()],q.prototype,`text`,void 0),o([n()],q.prototype,`theme`,void 0),o([n()],q.prototype,`icon`,void 0),o([n({type:Boolean})],q.prototype,`noIcon`,void 0),o([n()],q.prototype,`actionLabel`,void 0),o([n()],q.prototype,`actionId`,void 0),o([n()],q.prototype,`status`,void 0),o([n({type:Boolean})],q.prototype,`slim`,void 0),o([n({type:Boolean})],q.prototype,`fullWidth`,void 0),o([n({type:Boolean})],q.prototype,`hasContent`,void 0),o([n({type:Boolean})],q.prototype,`inlineContent`,void 0),q=o([i(`mateu-notice`)],q);var Bg=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=su(s.text??``,r,i,a,o)??``,u=t.children??[];return l`
        <mateu-notice
                text="${c}"
                theme="${s.theme??`info`}"
                icon="${H(s.icon??void 0)}"
                ?noIcon="${s.noIcon??!1}"
                actionLabel="${H(s.actionLabel??void 0)}"
                actionId="${H(s.actionId??void 0)}"
                status="${H(s.status??void 0)}"
                ?slim="${s.slim??!1}"
                ?fullWidth="${s.fullWidth??!1}"
                ?inlineContent="${s.inlineContent??!1}"
                ?hasContent="${u.length>0}"
                data-colspan="${s.fullWidth?`99`:p}"
                style="${t.style??p}"
                class="${t.cssClasses??p}"
                slot="${t.slot??p}"
        >${u.map(t=>z(e,t,n,r,i,a,o))}</mateu-notice>
    `},Vg=class extends _{constructor(...e){super(...e),this.groups=[]}static{this.styles=[Zh,B,h`
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
                                 @click="${()=>this.select(e.id)}" @keydown="${W(()=>this.select(e.id))}">
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
        `}};o([n()],Vg.prototype,`actionId`,void 0),o([n({type:Array})],Vg.prototype,`groups`,void 0),o([s()],Vg.prototype,`selectedId`,void 0),Vg=o([i(`mateu-task-queue`)],Vg);var Hg=e=>{let t=e.metadata;return l`
        <mateu-task-queue
                .actionId="${t.actionId}"
                .groups="${t.groups??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-task-queue>
    `},Ug=class extends _{constructor(...e){super(...e),this.columns=0,this.items=[]}static{this.styles=[Zh,B,h`
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
                         @click="${()=>this.select(e)}" @keydown="${W(()=>this.select(e))}">
                        ${e.recommended?l`<span class="tag">${this.recommendedLabel||`Recommended`}</span>`:p}
                        <span class="title">${e.title}</span>
                        ${e.subtitle?l`<span class="subtitle">${e.subtitle}</span>`:p}
                        ${e.statusLabel?l`<span class="chip ${e.statusColor??``}">${e.statusLabel}</span>`:p}
                        ${e.note?l`<span class="note ${e.noteColor??``}"><span class="dot"></span>${e.note}</span>`:p}
                    </div>
                `)}
            </div>
        `}};o([n()],Ug.prototype,`actionId`,void 0),o([n({type:Number})],Ug.prototype,`columns`,void 0),o([n()],Ug.prototype,`recommendedLabel`,void 0),o([n({type:Array})],Ug.prototype,`items`,void 0),o([s()],Ug.prototype,`selectedId`,void 0),Ug=o([i(`mateu-resource-grid`)],Ug);var Wg=e=>{let t=e.metadata;return l`
        <mateu-resource-grid
                .actionId="${t.actionId}"
                .columns="${t.columns??0}"
                .recommendedLabel="${t.recommendedLabel}"
                .items="${t.items??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-resource-grid>
    `},J=class extends _{constructor(...e){super(...e),this.title=``,this.features=[],this.current=!1,this.added=!1}static{this.styles=h`
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
        `}};o([n()],J.prototype,`tag`,void 0),o([n()],J.prototype,`title`,void 0),o([n()],J.prototype,`subtitle`,void 0),o([n()],J.prototype,`image`,void 0),o([n({type:Array})],J.prototype,`features`,void 0),o([n()],J.prototype,`priceLabel`,void 0),o([n()],J.prototype,`actionLabel`,void 0),o([n()],J.prototype,`actionId`,void 0),o([n({type:Boolean})],J.prototype,`current`,void 0),o([n()],J.prototype,`currentLabel`,void 0),o([n({type:Boolean})],J.prototype,`added`,void 0),o([n()],J.prototype,`addedLabel`,void 0),J=o([i(`mateu-offer-card`)],J);var Gg=e=>{let t=e.metadata;return l`
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
    `},Kg=class extends _{constructor(...e){super(...e),this.items=[],this.added=new Set}static{this.styles=h`
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
                <span class="total">${eg(this.total(),this.currency)}</span>
            </div>
            <div class="grid">
                ${this.items.map(e=>{let t=e.id!=null&&this.added.has(e.id);return l`
                        <div class="card ${t?`added`:``}">
                            ${e.icon?l`<span class="icon">${e.icon}</span>`:p}
                            <span class="title">${e.title}</span>
                            ${e.description?l`<span class="description">${e.description}</span>`:p}
                            ${e.includedLabel?l`<span class="included">${e.includedLabel}</span>`:l`
                                    ${e.price==null?p:l`
                                        <span class="price">${eg(e.price,this.currency)}${e.unit?` / ${e.unit}`:``}</span>
                                    `}
                                    <button class="toggle ${t?`on`:``}" @click="${()=>this.toggle(e)}"
                                            aria-pressed="${t}">${t?`✓`:`+`}</button>
                                `}
                        </div>
                    `})}
            </div>
        `}};o([n()],Kg.prototype,`totalLabel`,void 0),o([n()],Kg.prototype,`currency`,void 0),o([n()],Kg.prototype,`actionId`,void 0),o([n({type:Array})],Kg.prototype,`items`,void 0),o([s()],Kg.prototype,`added`,void 0),Kg=o([i(`mateu-addon-picker`)],Kg);var qg=e=>{let t=e.metadata;return l`
        <mateu-addon-picker
                .totalLabel="${t.totalLabel}"
                .currency="${t.currency}"
                .actionId="${t.actionId}"
                .items="${t.items??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-addon-picker>
    `},Jg=class extends _{constructor(...e){super(...e),this.lines=[]}static{this.styles=h`
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
                    ${e.included?l`<span class="included-label">${e.includedLabel||`Included`}</span>`:l`<span class="amount ${(e.amount??0)<0?`negative`:``}">${eg(e.amount??0,this.currency)}</span>`}
                </div>
            `)}
            <div class="total-row">
                <span class="total-label">${this.totalLabel||`Total`}</span>
                <span class="total">${eg(this.computedTotal(),this.currency)}</span>
            </div>
        `}};o([n()],Jg.prototype,`currency`,void 0),o([n()],Jg.prototype,`totalLabel`,void 0),o([n({type:Array})],Jg.prototype,`lines`,void 0),o([n({type:Number})],Jg.prototype,`total`,void 0),Jg=o([i(`mateu-ledger`)],Jg);var Yg=e=>{let t=e.metadata;return l`
        <mateu-ledger
                .currency="${t.currency}"
                .totalLabel="${t.totalLabel}"
                .lines="${t.lines??[]}"
                .total="${t.total}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-ledger>
    `},Xg=class extends _{constructor(...e){super(...e),this.methods=[]}static{this.styles=h`
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
        `}};o([n()],Xg.prototype,`actionId`,void 0),o([n()],Xg.prototype,`methodActionId`,void 0),o([n({type:Array})],Xg.prototype,`methods`,void 0),o([n()],Xg.prototype,`selected`,void 0),o([n()],Xg.prototype,`contextLabel`,void 0),o([n()],Xg.prototype,`contextValue`,void 0),o([n()],Xg.prototype,`confirmLabel`,void 0),o([s()],Xg.prototype,`selectedId`,void 0),Xg=o([i(`mateu-payment-picker`)],Xg);var Zg=e=>{let t=e.metadata;return l`
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
    `},Qg=class extends _{constructor(...e){super(...e),this.items=[]}static{this.styles=h`
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
                            <span class="counter ok">${V(`vaadin:check-circle`,`width: var(--lumo-icon-size-s, 1rem); height: var(--lumo-icon-size-s, 1rem); vertical-align: text-bottom;`)} ${e.ok??0} OK</span>
                            ${(e.warnings??0)>0?l`<span class="counter warning">${V(`vaadin:warning`,`width: var(--lumo-icon-size-s, 1rem); height: var(--lumo-icon-size-s, 1rem); vertical-align: text-bottom;`)} ${e.warnings} warnings</span>`:p}
                            ${(e.errors??0)>0?l`<span class="counter error">${V(`vaadin:exclamation-circle`,`width: var(--lumo-icon-size-s, 1rem); height: var(--lumo-icon-size-s, 1rem); vertical-align: text-bottom;`)} ${e.errors} errors</span>`:p}
                        </div>
                        ${e.actionLabel&&e.actionId?l`<button @click="${()=>this.runAction(e)}">${e.actionLabel}</button>`:p}
                    </div>
                `)}
            </div>
        `}};o([n({type:Array})],Qg.prototype,`items`,void 0),Qg=o([i(`mateu-process-monitor`)],Qg);var $g=e=>{let t=e.metadata;return l`
        <mateu-process-monitor
                .items="${t.items??[]}"
                style="${e.style??p}"
                class="${e.cssClasses??p}"
                slot="${e.slot??p}"
        ></mateu-process-monitor>
    `},e_=m`<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7"></circle><line x1="16.5" y1="16.5" x2="21" y2="21"></line></svg>`,t_=()=>R.get()?.renderIcon?V(`vaadin:search`,`width: 100%; height: 100%;`):l`${e_}`,n_=(e,t)=>{e.ctrlKey||e.metaKey||e.shiftKey||(e.preventDefault(),Au(e.currentTarget,t))},r_=e=>{let t=e.metadata??{},n=t.title||r(`notFound`),i=t.message||r(`notFoundMessage`),a=t.backRoute;return l`
        <section class="mateu-not-found ${e.cssClasses??``}"
                 slot="${e.slot??p}"
                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
                        gap: var(--lumo-space-s, .5rem); min-height: 50vh; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-m, 1rem);
                        color: var(--lumo-secondary-text-color, #5f6b7a); ${e.style??``}">
            <span class="mateu-not-found-icon" aria-hidden="true"
                  style="display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;
                         width: 4.5rem; height: 4.5rem; padding: 1.1rem; margin-bottom: var(--lumo-space-s, .5rem); border-radius: 50%;
                         color: var(--lumo-primary-text-color, #1676f3); background: var(--lumo-primary-color-10pct, rgba(22, 118, 243, .1));">
                ${t_()}
            </span>
            <h2 class="mateu-not-found-title"
                style="margin: 0; font-size: var(--lumo-font-size-xl, 1.375rem); font-weight: 600; line-height: var(--lumo-line-height-s, 1.375);
                       color: var(--lumo-header-text-color, var(--lumo-body-text-color, #1a2533)); overflow-wrap: anywhere;">${n}</h2>
            <p class="mateu-not-found-message" style="margin: 0; max-width: 32rem; font-size: var(--lumo-font-size-m, 1rem);">${i}</p>
            ${a?l`
                <a class="mateu-not-found-back" href="${H(el(a))}" @click="${e=>n_(e,a)}"
                   style="margin-top: var(--lumo-space-m, 1rem); font-weight: 500; text-decoration: none;
                          color: var(--lumo-primary-text-color, #1676f3);">← ${t.backLabel||r(`goBack`)}</a>
            `:p}
        </section>
    `},i_=(e,t)=>{let n=e.style;return e.id&&(n&&!n.endsWith(`;`)&&(n+=`;`),n??=``,t[e.id+`.hidden`]==1&&(n+=`display: none;`)),n},a_=(e,t)=>{let n={...e.metadata};if(e.id&&n){if(n.type==E.Button){let r=n;t[e.id+`.disabled`]==1&&(r.disabled=!0)}if(n.type==E.FormField){let r=n;t[e.id+`.disabled`]==1&&(r.disabled=!0)}}return n},Y=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),o_={[E.Bpmn]:({component:e})=>sm(e),[E.Workflow]:({component:e})=>lm(e),[E.FormEditor]:({component:e})=>um(e),[E.Page]:Y(am),[E.Div]:Y(ep),[E.Directory]:({component:e,baseUrl:t,state:n,data:r})=>Qf(e,t,n,r),[E.FormLayout]:Y(Od),[E.HorizontalLayout]:Y(Pd),[E.VerticalLayout]:Y(Fd),[E.SplitLayout]:Y(Id),[E.MasterDetailLayout]:Y(Ld),[E.TabLayout]:Y(Rd),[E.AccordionLayout]:Y(zd),[E.BoardLayout]:Y(Wd),[E.BoardLayoutRow]:Y(Gd),[E.BoardLayoutItem]:Y(Kd),[E.Scroller]:Y(Vd),[E.FullWidth]:Y(Hd),[E.Container]:Y(Ud),[E.Form]:({container:e,component:t,baseUrl:n,state:r,data:i,appState:a,appData:o})=>{let s=t.metadata;return l`<mateu-form
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
                ${t.children?.map(t=>z(e,t,n,r,i,a,o))}
            ${s?.buttons?.map(t=>l`
               ${z(e,{id:La(t),metadata:t,type:T.ClientSide,slot:`buttons`},void 0,r,i,a,o)}
`)}

            </mateu-form>`},[E.Table]:({component:e,state:t,data:n})=>tf(e,(e.id?n?.[e.id]:void 0)?.page?.content??nf(e,t)),[E.Crud]:Y(om),[E.App]:({container:e,component:t,baseUrl:n,state:r,data:i,appState:a,appData:o})=>l`
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
             ${t.children?.map(t=>z(e,t,n,r,i,a,o))}
         </mateu-app>`,[E.Element]:({container:e,component:t,state:n,data:r,appState:i,appData:a})=>hf(e,t.metadata,t,n,r,i,a),[E.FormField]:({component:e,state:t})=>ap(e,t),[E.Text]:({component:e,state:t,data:n,appState:r,appData:i})=>_f(e,t,n,r,i),[E.Avatar]:({component:e,state:t,data:n})=>yu(e,t,n),[E.Chat]:({component:e,state:t,data:n})=>cm(e,t,n),[E.AvatarGroup]:({component:e})=>xu(e),[E.Badge]:({component:e,state:t,data:n})=>Su(e,t,n),[E.Breadcrumbs]:({component:e})=>Jf(e),[E.Anchor]:({component:e})=>vf(e),[E.Button]:({component:e,state:t,data:n})=>Ef(e,t,n),[E.Card]:Y(Of),[E.Chart]:({component:e})=>kf(e),[E.Icon]:({component:e})=>Af(e),[E.ConfirmDialog]:Y(Ff),[E.ContextMenu]:Y(sf),[E.CookieConsent]:({component:e})=>If(e),[E.Details]:Y(Lf),[E.Dialog]:({component:e,baseUrl:t,state:n,data:r,appState:i,appData:a})=>Rf(e,t,n,r,i,a),[E.Drawer]:({component:e,baseUrl:t,state:n,data:r,appState:i,appData:a})=>zf(e,t,n,r,i,a),[E.Image]:({component:e})=>qf(e),[E.Map]:({component:e})=>Kf(e),[E.Markdown]:({component:e})=>Hf(e),[E.MicroFrontend]:({component:e})=>Vf(e),[E.Notification]:({component:e})=>Uf(e),[E.ProgressBar]:({component:e,state:t})=>Wf(e,t),[E.Popover]:Y(Gf),[E.CarouselLayout]:Y(Zf),[E.Tooltip]:Y(uf),[E.MessageInput]:({component:e})=>lf(e),[E.MessageList]:({component:e})=>rf(e),[E.CustomField]:Y(cf),[E.MenuBar]:({container:e,component:t,baseUrl:n,state:r,data:i})=>of(e,t,n,r,i),[E.Grid]:({component:e,state:t})=>tf(e,nf(e,t)),[E.VirtualList]:Y(qd),[E.FormSection]:Y(tp),[E.FormSubSection]:Y(np),[E.MetricCard]:({component:e})=>hm(e),[E.Scoreboard]:Y(gm),[E.DashboardPanel]:Y(_m),[E.DashboardLayout]:Y(vm),[E.ResponsiveGrid]:Y(Mm),[E.FoldoutLayout]:Y(bm),[E.ContentLayout]:Y(Nm),[E.HeroSection]:Y(Rm),[E.EmptyState]:({component:e})=>fd(e),[E.Skeleton]:({component:e})=>pd(e),[E.Gantt]:({component:e})=>Vm(e),[E.PlanningBoard]:({component:e})=>Xm(e),[E.Kanban]:({component:e})=>Qm(e),[E.Timeline]:({component:e})=>eh(e),[E.ProgressSteps]:({component:e})=>nh(e),[E.Stat]:({component:e})=>ih(e),[E.Calendar]:({component:e})=>Sh(e),[E.PricingTable]:({component:e})=>wh(e),[E.OrgChart]:({component:e})=>Eh(e),[E.Heatmap]:({component:e})=>kh(e),[E.Funnel]:({component:e})=>jh(e),[E.TrendChart]:({component:e})=>Nh(e),[E.FeatureGrid]:({component:e})=>Fh(e),[E.Testimonials]:({component:e})=>Lh(e),[E.Faq]:({component:e})=>zh(e),[E.CalloutCard]:({component:e})=>Vh(e),[E.CommentThread]:({component:e})=>Uh(e),[E.FileList]:({component:e})=>Kh(e),[E.Checklist]:({component:e})=>Jh(e),[E.ComparisonCard]:({component:e})=>Xh(e),[E.EntityHeader]:({component:e})=>rg(e),[E.Meter]:({component:e})=>ag(e),[E.TaskProgress]:({component:e})=>sg(e),[E.StatusList]:({component:e})=>lg(e),[E.BulletedList]:({component:e})=>dg(e),[E.ActionPanel]:({component:e})=>gg(e),[E.MatrixGrid]:({component:e})=>Cg(e),[E.DropZone]:Y(Og),[E.Separator]:({component:e})=>kg(e),[E.CustomComponent]:Y(Lg),[E.Notice]:Y(Bg),[E.TaskQueue]:({component:e})=>Hg(e),[E.ResourceGrid]:({component:e})=>Wg(e),[E.OfferCard]:({component:e})=>Gg(e),[E.AddOnPicker]:({component:e})=>qg(e),[E.Ledger]:({component:e})=>Yg(e),[E.PaymentPicker]:({component:e})=>Zg(e),[E.ProcessMonitor]:({component:e})=>$g(e),[E.NotFound]:({component:e})=>r_(e)},s_=(e,t,n,r,i,a,o,s)=>{if(!t?.metadata)return t==null?(console.warn(`No metadata for component`,t),l`<p>No metadata for component</p>`):s_(e,{id:Vs(),metadata:t,type:T.ClientSide},n,r,i,a,o,s);let c=t.metadata.type,u={...t,style:i_(t,i),metadata:a_(t,i)},d=o_[c];return d?d({container:e,component:u,baseUrl:n,state:r,data:i,appState:a,appData:o,labelAlreadyRendered:s}):l`<p ${u?.slot??p}>Unknown metadata type ${c} for component ${u?.id}</p>`},X=function(e){return e.NONE=`NONE`,e.INFO=`INFO`,e.SUCCESS=`SUCCESS`,e.WARNING=`WARNING`,e.DANGER=`DANGER`,e}({}),c_=(e,t)=>!t||e==null||typeof e!=`string`&&typeof e!=`number`&&typeof e!=`boolean`?e:t[String(e)]??e,l_=e=>{if(!/^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.test(e)||e.length<2)return e;let t=e.toLowerCase().replace(/_/g,` `).replace(/([a-z])(\d)/g,`$1 $2`);return t.charAt(0).toUpperCase()+t.slice(1)},u_=(e,t,n,r,i)=>{let a=m_(e[n.path],r,i);return a?l`<span theme="badge pill ${g_(a.type)}">${a.message}</span>`:l``},d_=new Set([`AVAILABLE`,`ACTIVE`,`RUNNING`,`SUCCEEDED`,`SUCCESS`,`OK`,`ENABLED`,`READY`,`HEALTHY`,`COMPLETED`,`DONE`,`ATTACHED`,`UP`]),f_=new Set([`PROVISIONING`,`UPDATING`,`PENDING`,`STARTING`,`STOPPING`,`IN_PROGRESS`,`TERMINATING`,`DELETING`,`CREATING`,`MOVING`,`WAITING`,`ACCEPTED`,`WARNING`,`DEGRADED`,`RESTORING`,`SCALING`]),p_=new Set([`FAILED`,`TERMINATED`,`ERROR`,`DELETED`,`STOPPED`,`DISABLED`,`UNHEALTHY`,`DOWN`,`CANCELED`,`CANCELLED`,`REJECTED`,`INACTIVE`]),m_=(e,t,n)=>{if(e==null||e===``)return;if(typeof e==`object`)return e;let r=String(e),i=h_(r,t),a=n?n[r]:void 0;return a==null?{...i,message:l_(r)}:{...i,message:a}},h_=(e,t)=>{let n=t?t[e]??t[e.trim().toUpperCase()]:void 0,r=n?__(n):void 0;if(r)return{type:r,message:e};let i=e.trim().toUpperCase().replace(/[\s-]+/g,`_`);return{type:d_.has(i)?X.SUCCESS:f_.has(i)?X.WARNING:p_.has(i)?X.DANGER:X.NONE,message:e}},g_=e=>{switch(e){case X.SUCCESS:return`success`;case X.WARNING:return`warning`;case X.DANGER:return`error`;case X.NONE:return`contrast`}return``},__=e=>{switch(String(e).trim().toLowerCase()){case`success`:return X.SUCCESS;case`warning`:return X.WARNING;case`danger`:case`error`:return X.DANGER;case`info`:return X.INFO;case`neutral`:case`none`:return X.NONE}},v_=e=>{let t=(e.split(`.`).filter(e=>e&&!/^\d+$/.test(e)).pop()??e).replace(/[_-]+/g,` `).replace(/([a-z0-9])([A-Z])/g,`$1 $2`).replace(/([A-Z]+)([A-Z][a-z])/g,`$1 $2`).trim().toLowerCase();return t?t.charAt(0).toUpperCase()+t.slice(1):e},y_=new class{constructor(){this.handleUIIncrement=(e,t,n)=>{if(e?.messages?.forEach(e=>{pc({text:e.text,position:e.position,variant:e.variant,duration:e.duration,undoLabel:e.undoLabel,undoActionId:e.undoActionId,undoParameters:e.undoParameters},t)}),e?.banners&&e.banners.length>0&&document.dispatchEvent(new CustomEvent(`page-banners-received`,{detail:{banners:e.banners,append:e.appendBanners??!1},bubbles:!1,composed:!1})),e?.commands?.forEach(e=>{ft.next({command:e,fragment:void 0,ui:void 0,error:void 0,callbackToken:n,initiator:t})}),e?.fragments?.forEach(e=>{ft.next({command:void 0,fragment:e,ui:void 0,error:void 0,callbackToken:n,initiator:t})}),e?.appState&&(pt.value={...e.appState},t.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0}))),e?.appData){let n=e?.appData;mt.value={...e.appData,...n},t.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0}))}}}async runAction(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h={}){let g=()=>{this.runAction(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)};n||=`_no_route`,n&&n.startsWith(`/`)&&(n=n.substring(1));let _={serverSideType:s,appState:pt.value,componentState:c,parameters:l,initiatorComponentId:a,consumedRoute:r,route:`/`+n,actionId:i};d||u.dispatchEvent(new CustomEvent(`backend-called-event`,{bubbles:!0,composed:!0,detail:{}}));let v={Accept:`text/event-stream`,"Content-Type":`application/json`};Object.assign(v,ec());let ee=nc(!1);ee&&(v[`X-Session-Id`]=ee),fetch(t+`/mateu/v3/sse/`+n,{method:`POST`,headers:v,body:JSON.stringify(_)}).then(async e=>{let t,n=e=>{if(h.isStale?.())throw t?.cancel().catch(()=>void 0),new lc(i,e)};if(n(`answered`),e.ok===!1){let t=`HTTP ${e.status}`;try{let n=await e.text();try{t=JSON.parse(n)?.message||t}catch{n.trim()&&(t=n.trim())}}catch{}throw Error(t)}if(t=e.body?.pipeThrough(new TextDecoderStream).getReader(),t){let e=``;for(;;){let{value:r,done:a}=await t.read();if(a)break;e+=r;let o=e.split(`

`);e=o.pop()??``;for(let e of o){let t=e.trim();if(t){if(t.startsWith(`data:`)){n(`answered`);let e=JSON.parse(t.substring(5).trim());vc(e),f&&f(e),p||this.handleUIIncrement(e,u,m),e.messages&&e.messages.length==1&&e.messages[0].variant==`error`&&u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-failed`,{detail:{actionId:i},bubbles:!0,composed:!0}))}else{let e=t;try{let n=JSON.parse(t);e=n.message,n._embedded?.errors?.length>0&&n._embedded.errors[0].message&&(e=n._embedded.errors[0].message)}catch{}throw n(`failed`),Error(e)}}}}}d||u.dispatchEvent(new CustomEvent(`backend-succeeded-event`,{bubbles:!0,composed:!0,detail:{actionId:i}})),u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-succeeded`,{detail:{actionId:i},bubbles:!0,composed:!0}))}).catch(e=>{if(uc(e)||h.isStale?.()){console.debug?.(`mateu: dropped a streamed answer to an action of a view no longer on screen`,i,s,t),u.dispatchEvent(new CustomEvent(`backend-cancelled-event`,{bubbles:!0,composed:!0,detail:{actionId:i}}));return}u.dispatchEvent(new CustomEvent(`backend-failed-event`,{bubbles:!0,composed:!0,detail:{actionId:i,reason:this.serialize(e),retry:g}})),u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-failed`,{detail:{actionId:i},bubbles:!0,composed:!0}))})}serialize(e){return e?.message?e:JSON.stringify(e)}},b_,x_=class extends _{static{b_=this}constructor(...e){super(...e),this.baseUrl=``,this.opened=!1,this.searchText=``}static{this.SEARCHABLE_THRESHOLD=7}connectedCallback(){super.connectedCallback(),ma()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(ua()[this.selector.fieldName]??``)}currentLabel(){let e=this.currentValue();if(!e)return`—`;let t=(this.searchedOptions??this.selector.options)?.find(t=>String(t.value)===e);if(t)return t.label;let n=da()[this.selector.fieldName];return n===void 0?e:String(n)}pick(e,t){fa(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText=``,this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener(`mousedown`,this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector(`input.picker-search`)?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){let e=this.app;if(e?.serverSideType)try{let t=await Sc.runAction(this.baseUrl??``,e.rootRoute??e.initialRoute??``,``,`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(let e of t?.fragments??[]){let t=e.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(t)){this.searchedOptions=t.map(e=>({value:e.value,label:e.label??String(e.value)}));return}}}catch{}}visibleOptions(){let e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(e=>e.label.toLowerCase().includes(t)):e}renderPanel(){let e=this.currentValue(),t=this.visibleOptions(),n=this.searchText!==``||t.length>b_.SEARCHABLE_THRESHOLD;return l`
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
    `}};o([n()],x_.prototype,`selector`,void 0),o([n()],x_.prototype,`app`,void 0),o([n()],x_.prototype,`baseUrl`,void 0),o([s()],x_.prototype,`opened`,void 0),o([s()],x_.prototype,`searchText`,void 0),o([s()],x_.prototype,`searchedOptions`,void 0),x_=b_=o([i(`mateu-app-context-picker`)],x_);var S_=class extends _{constructor(...e){super(...e),this.baseUrl=``,this.opened=!1,this.notifications=[],this.fetched=!1}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}updated(){!this.fetched&&this.app?.serverSideType&&(this.fetched=!0,this.refresh())}unreadCount(){return this.notifications.filter(e=>e.unread).length}async runNotificationsAction(e,t){let n=this.app;if(n?.serverSideType)try{let r=await Sc.runAction(this.baseUrl??``,n.rootRoute??n.initialRoute??``,``,e,`notification-bell`,void 0,n.serverSideType,{},t,this,!0);for(let e of r?.fragments??[]){let t=e.data?._notifications;if(Array.isArray(t)){this.notifications=t;return}}}catch{}}refresh(){return this.runNotificationsAction(`_notifications-list`,{})}markRead(e){return this.runNotificationsAction(`_notifications-read`,{ids:e})}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}openPanel(){this.opened||(this.opened=!0,this.refresh(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener(`mousedown`,this.outsideClick))}closePanel(){this.detachOutsideClick(),this.opened=!1}async entryClicked(e){e.unread&&await this.markRead([e.id]);let t=e.route;if(t){if(!Ju.confirmLeave())return;this.closePanel(),this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent(`navigate-to-requested`,{detail:{route:t},bubbles:!0,composed:!0}))}}renderEntry(e){return l`
            <div role="button" tabindex="0" class="entry ${e.unread?`entry--unread`:``}"
                 @click="${()=>this.entryClicked(e)}" @keydown="${W(()=>this.entryClicked(e))}">
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
                <button class="bell-button" data-access-key-target title="${r(`notifications`)}"
                        aria-label="${e>0?t(`notificationsUnread`,{count:e}):r(`notifications`)}"
                        aria-haspopup="true" aria-expanded="${this.opened?`true`:`false`}"
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
    
        ${B}
    `}};o([n()],S_.prototype,`app`,void 0),o([n()],S_.prototype,`baseUrl`,void 0),o([s()],S_.prototype,`opened`,void 0),o([s()],S_.prototype,`notifications`,void 0),S_=o([i(`mateu-notification-bell`)],S_);var C_=e=>{if(!e||!(`querySelectorAll`in e))return null;for(let t of e.querySelectorAll(`*`)){if(t.tagName?.toLowerCase()===`mateu-component`)return t;let e=C_(t.shadowRoot);if(e)return e}return null},w_=async(e,t,n)=>{let r=C_(t.renderRoot??t);await y_.runAction(Sc,t.baseUrl??``,e.rootRoute||`_no_route`,``,n,r?.id??`app-header-action`,{},e.serverSideType??``,{},{},r??t,!0,void 0,!1,``)},T_=class extends _{constructor(...e){super(...e),this.shown=!1}createRenderRoot(){return this}connectedCallback(){if(super.connectedCallback(),!this.shown){if(typeof IntersectionObserver>`u`){this.shown=!0;return}this.observer=new IntersectionObserver(e=>{e.some(e=>e.isIntersecting)&&(this.shown=!0,this.observer?.disconnect(),this.observer=void 0)}),this.observer.observe(this)}}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observer=void 0}render(){return this.shown&&this.content?this.content():l`<div class="mateu-when-visible-placeholder" style="min-height: 1px;">${p}</div>`}};o([n({attribute:!1})],T_.prototype,`content`,void 0),o([s()],T_.prototype,`shown`,void 0),T_=o([i(`mateu-when-visible`)],T_);var E_=e=>!!e&&/[?&]_lazy=1(&|$)/.test(e),D_=e=>(e.children??[]).filter(e=>e&&e.component!==`hr`&&e.text).map(e=>{let t=(e.children??[]).filter(e=>e&&e.text&&e.component!==`hr`);return{item:e,title:String(e.text??``),description:String(e.description??``),icon:String(e.icon??``),image:String(e.image??``),navigable:t.length===0,actions:t}}),O_=e=>!!e&&e.display===`cards`&&(e.children?.length??0)>0,k_=class extends _{constructor(...e){super(...e),this.open=!1,this.outside=e=>{e.composedPath().includes(this)||(this.open=!1)},this.escape=e=>{e.key===`Escape`&&this.open&&(this.open=!1,this.renderRoot.querySelector(`.trigger`)?.focus())}}connectedCallback(){super.connectedCallback(),document.addEventListener(`click`,this.outside,!0),document.addEventListener(`keydown`,this.escape)}disconnectedCallback(){document.removeEventListener(`click`,this.outside,!0),document.removeEventListener(`keydown`,this.escape),super.disconnectedCallback()}select(e,t){t?.stopPropagation(),this.open=!1,this.onSelect?.(e)}renderIcon(e){return e.image?l`<img class="visual image" src="${e.image}" alt="" />`:e.icon&&customElements.get(`vaadin-icon`)?l`<vaadin-icon class="visual icon" icon="${e.icon}"></vaadin-icon>`:p}render(){let e=this.item;if(!e)return p;let t=D_(e);return l`
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
    `}};o([n({attribute:!1})],k_.prototype,`item`,void 0),o([n({attribute:!1})],k_.prototype,`onSelect`,void 0),o([s()],k_.prototype,`open`,void 0),k_=o([i(`mateu-card-menu`)],k_);var A_=(e,t)=>e?l`<mateu-when-visible style="display: block; width: 100%;" .content="${t}"></mateu-when-visible>`:t(),j_=async(e,n,r)=>{try{await w_(e,n,r)}catch(e){pc({text:t(`actionFailed`,{error:e}),position:`bottomStart`,duration:6e3,variant:`error`},n)}},M_=(e,t)=>{let n=e.contextSelectors??[],r=e.contextActions??[];return n.length===0&&r.length===0&&!e.notificationsEnabled?p:l`${e.notificationsEnabled?l`
        <mateu-notification-bell .app="${e}" .baseUrl="${t.baseUrl??``}"></mateu-notification-bell>`:p}${n.map(n=>l`
        <mateu-app-context-picker .selector="${n}" .app="${e}" .baseUrl="${t.baseUrl??``}"></mateu-app-context-picker>`)}${r.map(n=>(n.children?.length??0)>0?l`
        <details class="mateu-nav-group" style="flex-shrink: 0;">
            <summary class="app-header-action-btn">${n.label} ▾</summary>
            <div class="mateu-nav-panel" style="right: 0; left: auto;">
                ${n.children.map(n=>l`
                    <button class="mateu-nav-item" @click="${()=>n.actionId&&j_(e,t,n.actionId)}">${n.label}</button>`)}
            </div>
        </details>`:l`
        <button class="app-header-action-btn" style="flex-shrink: 0;"
            @click="${()=>n.actionId&&j_(e,t,n.actionId)}" title="${n.label}">${n.icon?V(n.icon):p}${n.label}</button>`)}`},N_=(e,t)=>l`
    <button class="mateu-nav-item ${e.selected?`mateu-nav-item--active`:``} ${e.className??``}"
            ?disabled="${e.disabled}"
            title="${e.title??p}"
            @click="${()=>t(e)}">${e.text}</button>`,P_=(e,t=!0)=>l`
    <div class="m-hl" style="align-items: ${e.title?`baseline`:`center`}; min-width: 0;">
        ${e.logo?l`<img src="${e.logo}" alt="logo" height="28px" style="margin-left: ${t?`10px`:`0`}; align-self: center;">`:p}
        ${e.title?l`<h2 class="mateu-app-title" style="margin: 0 var(--lumo-space-l, 1.5rem) 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${e.title}</h2>`:p}
    </div>`,F_=`flex: 1; min-width: 0; align-items: baseline;`,I_=`m-hl mateu-app-header`,L_=(e,t,n=``)=>l`
    <nav class="mateu-nav ${n}">
        ${e.map(e=>(e.children?.length??0)>0?l`<details class="mateu-nav-group">
                       <summary class="mateu-nav-item">${e.text} ▾</summary>
                       <div class="mateu-nav-panel">
                           ${e.children.map(e=>N_(e,t))}
                       </div>
                   </details>`:N_(e,t))}
    </nav>`,R_=(e,t,n)=>{let r=e=>R.get()?.renderTopNav?.(e,t,n)??L_(e,t,n);if(!e.some(O_))return r(e);let i=[],a=[];for(let n of e)O_(n)?(a.length&&i.push(r(a)),a=[],i.push(l`<mateu-card-menu .item=${n} .onSelect=${t}></mateu-card-menu>`)):a.push(n);return a.length&&i.push(r(a)),l`<div class="mateu-nav-with-cards" style="display: flex; align-items: center; flex-wrap: wrap; min-width: 0;">${i}</div>`},z_=(e,t)=>{let n=[{text:`☰`,children:e,className:`mateu-menu-button-root`,"aria-label":r(`menu`)}];return R.get()?.renderTopNav?.(n,t,`menu-button`)??L_(n,t,`menu-button`)},B_=(e,t)=>n=>t.call(e,{detail:{value:n}}),V_=(e,t)=>e.backRoute?l`
        <a href="${H(el(e.backRoute))}" class="mateu-back-link"
           style="align-self: center; margin-left: 10px; white-space: nowrap; font-size: var(--lumo-font-size-s, .875rem);"
           @click="${n=>{n.preventDefault(),Ju.confirmLeave()&&Au(t,e.backRoute)}}">← ${e.backLabel??r(`back`)}</a>`:p,H_=e=>R.get()?.renderHeaderIconButton?.(e)??l`
        <button class="app-chrome-icon-btn ${e.cssClasses??``}" @click="${e.onClick}"
            title="${e.title??e.label}" aria-label="${e.label}"
            aria-pressed="${e.pressed===void 0?p:String(e.pressed)}"
            aria-expanded="${e.expanded===void 0?p:String(e.expanded)}"
            aria-controls="${e.controls??p}">
            ${V(e.icon,`width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem); color: currentColor;`)}
        </button>`,U_=(e,t)=>e.themeToggle?H_({icon:t.isDark?`vaadin:sun-o`:`vaadin:moon-o`,label:r(t.isDark?`lightMode`:`darkMode`),cssClasses:`mateu-theme-toggle`,onClick:()=>t.toggleTheme()}):p,W_=(e,t)=>e.mobileQr?H_({icon:`vaadin:qrcode`,label:r(`openOnMobile`),cssClasses:`mateu-mobile-qr`,onClick:()=>{Se(async()=>{let{openMobileQrDialog:e}=await import(`./mateu-mobile-qr-dialog-BXagoDAp.js`);return{openMobileQrDialog:e}},__vite__mapDeps([0,1,2]),import.meta.url).then(({openMobileQrDialog:n})=>n({appTitle:e.title,baseUrl:t.baseUrl??``}))}}):p,G_=(e,t)=>e.sseUrl?H_({icon:`vaadin:comments-o`,label:r(`chat`),title:r(t.chatOpen?`closeChat`:`openChat`),pressed:!!t.chatOpen,cssClasses:`mateu-chat-toggle`+(t.chatOpen?` mateu-chat-toggle--open`:``),onClick:()=>t.showHideIa()}):p,K_=(e,t)=>l`
    ${G_(e,t)}
    <slot name="widgets"></slot>
    ${M_(e,t)}${W_(e,t)}${U_(e,t)}`,q_=(e,t,n,r)=>e.sseUrl?l`<mateu-chat slot="${t.chatOpen?`detail`:`detail-hidden`}" sseurl="${e.sseUrl}" .label="${e.askLabel}" .mcpUrl="${e.mcpUrl}" .uploadUrl="${e.uploadUrl}" .menu="${e.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:n,appData:r,componentState:t.state,componentData:t.data})}" @navigation-requested="${t.updateRoute}" @close-requested="${t.showHideIa}"></mateu-chat>`:p,J_=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},Y_=(e,t,n)=>{let r=X_(e,t,n),i=Z(t,n);return r==`list`||r==i?`new`:r},X_=(e,t,n)=>{let r=e?._route;if(r!=null&&(r===``||r.startsWith(`/`))){let e=n.homeRoute??``,i=e.indexOf(`?`),a=i>=0?e.substring(i+1):``,o=Z(t,n)+r;return a?o+(o.indexOf(`?`)>=0?`&`:`?`)+a:o}return t.selectedRoute?t.selectedRoute:n.homeRoute},Z=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,Q=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:e.baseUrl||t.homeBaseUrl,$=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,Z_=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,Q_=(e,t)=>`ux_`+((Z(e,t)||`root`)+`|`+($(e,t)??``)).replace(/[^a-zA-Z0-9]/g,`_`),$_=e=>H_({icon:e.sectionsOpen?`lumo:cross`:`lumo:menu`,label:r(`sections`),expanded:!!e.sectionsOpen,controls:`mateu-sections-panel`,cssClasses:`mateu-sections-toggle`+(e.sectionsOpen?` mateu-sections-toggle--open`:``),onClick:()=>{e.sectionsOpen=!e.sectionsOpen}}),ev=(e,t,n)=>n.sectionsOpen?l`
    <div class="mateu-sections-scrim" @click="${()=>{n.sectionsOpen=!1}}"></div>
    <nav class="mateu-sections-panel" id="mateu-sections-panel" aria-label="${r(`sections`)}"
         @keydown="${e=>{e.key===`Escape`&&(n.sectionsOpen=!1)}}">
        ${e.filter(e=>!e.separator&&e.visible!==!1).map(e=>l`
            <button class="mateu-section-link ${e===t?`mateu-section-link--active`:``} ${e.unavailable?`mateu-nav-unavailable`:``}"
                    aria-current="${e===t?`page`:p}"
                    title="${e.unavailable?e.description??p:p}"
                    @click="${()=>n.selectSection(e)}">
                ${e.icon?V(e.icon,`width: var(--lumo-icon-size-s, 1.125rem); height: var(--lumo-icon-size-s, 1.125rem); flex-shrink: 0;`):p}
                <span>${e.label}</span>
            </button>`)}
    </nav>`:p,tv=(e,t)=>{if(!e)return p;let n=B_(t,t.itemSelected),r=F(e)?[]:t.mapItems(e.submenus??[],``);return l`
        <button type="button" class="mateu-app-band-title mateu-section-title"
           @click="${()=>t.selectSection(e)}">${e.label}</button>
        ${r.length>0?R_(r,n,`menu-on-top sections-band`):p}`},nv=(e,t,n,i,a,o,s)=>{let c=Q_(e,t);if(t.chromeless)return l`
            <div class="app chromeless">
                <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}" style="height: 100%;">
                    <div class="m-md">
                        <div class="m-scroll" style="height: 100%;">
                            <mateu-api-caller>
                                <mateu-ux
                                        data-content-view
                                        route="${X_(i,e,t)}"
                                        id="${c}"
                                        baseUrl="${Q(e,t)}"
                                        consumedRoute="${Z(e,t)}"
                                        serverSideType="${$(e,t)}"
                                        uriPrefix="${Z_(e,t)}"
                                        style="width: 100%;"
                                        .appState="${o}"
                                        .appData="${s}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        </div>
                        ${q_(t,e,o,s)}
                    </div>
                </div>
                <slot></slot>
            </div>
        `;let u=e.mapItems(t.menu,e.filter?.toLowerCase()??``),d=Z(e,t),f=Y_(i,e,t),m=f&&f!==`new`&&f.startsWith(d+`/`)?f.substring(d.length+1).split(`/`)[0]:void 0;return l`
                    ${t.variant==ht.MEDIATOR?l`

                        ${t.layout==`SPLIT`?l`
                            <div class="m-md">
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            data-content-view
                                            route="${Z(e,t)}"
                                            id="${c}"
                                            baseUrl="${Q(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${$(e,t)}"
                                            uriPrefix="${Z_(e,t)}"
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
                                            route="${Y_(i,e,t)}"
                                            id="${c}_detail"
                                            baseUrl="${Q(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${$(e,t)}"
                                            uriPrefix="${Z_(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${s}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>

                            </div>
                        `:A_(E_(t.homeRoute),()=>l`
                            <mateu-api-caller>
                                <mateu-ux
                                        data-content-view
                                        route="${X_(i,e,t)}"
                                        id="${c}"
                                        baseUrl="${Q(e,t)}"
                                        consumedRoute="${Z(e,t)}"
                                        serverSideType="${$(e,t)}"
                                        uriPrefix="${Z_(e,t)}"
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
            ${t.variant==ht.HAMBURGUER_MENU||t.variant==ht.HAMBURGER_MENU?l`
                <div class="mateu-app-layout m-app-layout ${t.drawerClosed?``:`drawer-open`} ${t?.cssClasses}" style="${t?.style}">
                    <header class="app-navbar">
                        <button class="drawer-toggle" title="${r(`menu`)}" aria-label="${r(`menu`)}"
                                @click="${e=>e.currentTarget.closest(`.m-app-layout`)?.classList.toggle(`drawer-open`)}">
                            ${V(`vaadin:menu`)}
                        </button>
                        <h2 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; margin: 0 .5rem;">${t.title}</h2><p style="margin: 0;">${t.subtitle}</p>
                        <div class="m-hl" style="margin-left: auto; align-items: center;">
                            ${K_(t,e)}
                        </div>
                    </header>
                    <div class="app-body">
                        <aside class="app-drawer p-s" @navigation-requested="${e.updateRoute}">
                            ${t.menu&&t.totalMenuOptions>10?l`
                                <div style="position: sticky; top: 0; z-index: 2; background: var(--lumo-base-color); padding: .25rem 0 .5rem;">
                                    <input class="drawer-search" placeholder="${r(`searchMenu`)}" aria-label="${r(`searchMenu`)}" style="width: calc(100% - 20px); margin: 0 10px;"
                                           @input="${t=>J_({detail:{value:t.target.value}},e)}">
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
                                                route="${X_(i,e,t)}"
                                                id="${c}"
                                                baseUrl="${Q(e,t)}"
                                                consumedRoute="${Z(e,t)}"
                                                serverSideType="${$(e,t)}"
                                                uriPrefix="${Z_(e,t)}"
                                                style="width: 100%;"
                                                .appState="${o}"
                                                .appData="${s}"
                                                instant="${e.instant}"
                                                @navigation-requested="${e.updateRoute}"
                                        ></mateu-ux>
                                    </mateu-api-caller>
                                </div>
                                ${q_(t,e,o,s)}
                            </div>
                        </div>
                    </div>
                </div>

            `:p}
            
            ${t.variant==ht.MENU_ON_TOP?l`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <!-- TWO BANDS, like the Redwood header: band 1 = the logo on the left and the
                         widgets on the right; band 2 = the app's title, then its menu as a horizontal
                         bar. A narrow viewport folds the menu into a ☰ button next to the title. -->
                    <div class="m-hl mateu-app-band1"
                            style="width: 100%; height: 3.5rem; flex-shrink: 0; align-items: center; background-color: var(--lumo-base-color);"
                            @navigation-requested="${e.updateRoute}">
                    <div class="${I_}" style="${F_}" theme="spacing">
                        <button type="button" @click="${()=>e.goHome()}" class="mateu-app-brand" aria-label="${t.title||r(`home`)}" style="text-decoration: none; color: inherit;">
                        ${P_({...t,title:``},!1)}
                        </button>
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${K_(t,e)}
                        </div>
                    </div>
                    </div>
                    <nav class="mateu-app-band2" aria-label="${t.title||r(`menu`)}"
                            @navigation-requested="${e.updateRoute}">
                        <div class="mateu-app-menu-button">
                            ${z_(u,B_(e,e.itemSelected))}
                        </div>
                        ${t.title?l`<button type="button" @click="${()=>e.goHome()}" class="mateu-app-band-title">${t.title}</button>`:p}
                        ${(()=>{let t=B_(e,e.itemSelected);return R_(u,t,`menu-on-top menu-band`)})()}
                    </nav>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div role="main" class="m-scroll mateu-content-gutter" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${X_(i,e,t)}"
                                            id="${c}"
                                            baseUrl="${Q(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${$(e,t)}"
                                            uriPrefix="${Z_(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${s}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${q_(t,e,o,s)}
                        </div>
                    </div>
                </div>

            `:p}

            ${t.variant==ht.HAMBURGER_SECTIONS?(()=>{let n=e.activeSectionOf(t.menu);return l`
                <div class="m-vl mateu-sections-shell" style="width: 100%; height: 100vh; overflow: hidden; position: relative;">
                    <div class="m-hl mateu-app-band1"
                            style="width: 100%; height: 3.5rem; flex-shrink: 0; align-items: center; background-color: var(--lumo-base-color);"
                            @navigation-requested="${e.updateRoute}">
                    <div class="${I_}" style="${F_}" theme="spacing">
                        ${$_(e)}
                        <button type="button" @click="${()=>{e.sectionsOpen=!1,e.goHome()}}" class="mateu-app-brand" aria-label="${t.title||r(`home`)}" style="text-decoration: none; color: inherit;">
                        ${P_(t,!1)}
                        </button>
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${K_(t,e)}
                        </div>
                    </div>
                    </div>
                    <nav class="mateu-app-band2 mateu-section-band ${n?``:`mateu-section-band--empty`}"
                            aria-label="${n?.label||t.title||r(`menu`)}" ?inert="${!n}"
                            @navigation-requested="${e.updateRoute}">
                        ${tv(n,e)}
                    </nav>
                    ${ev(t.menu??[],n,e)}
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div role="main" class="m-scroll mateu-content-gutter" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${X_(i,e,t)}"
                                            id="${c}"
                                            baseUrl="${Q(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${$(e,t)}"
                                            uriPrefix="${Z_(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${s}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${q_(t,e,o,s)}
                        </div>
                    </div>
                </div>
            `})():p}

            ${t.variant==ht.TILES?l`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            @navigation-requested="${e.updateRoute}">
                    <div class="${I_}" style="${F_}" theme="spacing">
                        <button type="button" @click="${()=>{e.goHome(),e.tilesMenuOption=null}}" class="mateu-app-brand" aria-label="${t.title||r(`home`)}" style="text-decoration: none; color: inherit;">
                        ${P_(t)}
                        </button>
                        ${L_(e.mapItemsForTiles(t.menu),B_(e,e.itemSelectedTiles),`menu-on-top`)}
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${K_(t,e)}
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
                                            route="${X_(i,e,t)}"
                                            id="${c}"
                                            baseUrl="${Q(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${$(e,t)}"
                                            uriPrefix="${Z_(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${s}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${q_(t,e,o,s)}
                        </div>
                        `}
                    </div>
                </div>
            `:p}

            ${t.variant==ht.RAIL?l`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):p}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <div class="m-md">
                            <div role="main" class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${X_(i,e,t)}"
                                            id="${c}"
                                            baseUrl="${Q(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${$(e,t)}"
                                            uriPrefix="${Z_(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${s}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${q_(t,e,o,s)}
                        </div>
                    </div>
                </div>
            `:p}

            ${t.variant==ht.MENU_ON_LEFT?l`

                <div class="m-hl">
                    <div class="m-scroll" style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <div class="m-vl"
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(t=>e.renderOptionOnLeftMenu(t))}
                            ${G_(t,e)}${M_(t,e)}${U_(t,e)}
                        </div>
                    </div>
                    <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${X_(i,e,t)}"
                                            id="${c}"
                                            baseUrl="${Q(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${$(e,t)}"
                                            uriPrefix="${Z_(e,t)}"
                                            style="width: 100%; padding: 1em;"
                                            .appState="${o}"
                                            .appData="${s}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${q_(t,e,o,s)}
                        </div>
                    </div>
                </div>


            `:p}

            ${t.variant==ht.TABS?l`
                <!--
                
                box-shadow: inset 0 -1px 0 0 var(--lumo-contrast-10pct);
                
                -->
                
                <div>
                    <div>
                        <div class="${I_}" 
                                style="width: 100%; ${F_} border-bottom: 1px solid var(--lumo-contrast-10pct);" 
                                theme="spacing"
                                @navigation-requested="${e.updateRoute}">
                            ${V_(t,e)}
                            <button type="button" @click="${()=>e.goHome()}" class="mateu-app-brand" aria-label="${t.title||r(`home`)}" style="text-decoration: none; color: inherit;">
                            ${P_(t)}
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
                                ${K_(t,e)}
                            </div>
                        </div>
                    </div>
                    <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${X_(i,e,t)}"
                                            id="${c}"
                                            baseUrl="${Q(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${$(e,t)}"
                                            uriPrefix="${Z_(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${s}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${q_(t,e,o,s)}
                        </div>
                    </div>
                </div>
            
            `:p}

            ${t.fabs?.map((t,n)=>l`
                <button class="app-fab" style="${Ep(n)}" ${Rp(`shell`,n)} aria-label="${t.label}"
                    @click="${()=>e.runAction(t.actionId)}"
                    title="${t.label}">
                    ${V(t.icon)}
                </button>
            `)}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},rv=class{renderFilterBar(e,t,n,r,i,a,o,s){let c=t?.metadata;return l`
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
                ${c?.header?.map(t=>z(e,t,n,r,i,a,o))}
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
        `}renderTableComponent(e,t,n,r,i,a,o){return tf(t,(e.data?.[e.id])?.page?.content??[],r[t?.id]?.emptyStateMessage)}rendererName(){return this.constructor?.name??`unknown`}supportedClientSideTypes(){}renderClientSideComponent(e,t,n,r,i,a,o,s){let c=t?.metadata?.type??t?.type,l=Object.values(E).includes(c)?c:void 0;return Mg(this.supportedClientSideTypes(),l)?Ig(t,l,this.rendererName()):s_(e,t,n,r,i,a,o,s)}renderAppComponent(e,t,n,r,i,a,o){return nv(e,t?.metadata,n,r,i,a,o)}};export{wu as $,Ra as $t,xd as A,ec as At,od as B,ps as Bt,Sf as C,fc as Ct,bf as D,oc as Dt,yf as E,cc as Et,_d as F,Is as Ft,Ju as G,No as Gt,td as H,ns as Ht,Td as I,Ms as It,ju as J,fo as Jt,Hu as K,ko as Kt,bd as L,Ns as Lt,wd as M,Ws as Mt,Cd as N,Vs as Nt,H as O,rc as Ot,gd as P,zs as Pt,z as Q,Ma as Qt,dd as R,ys as Rt,dp as S,pc as St,xf as T,uc as Tt,nd as U,jo as Ut,ad as V,Ds as Vt,B as W,Ao as Wt,Eu as X,to as Xt,ku as Y,no as Yt,Ou as Z,Pa as Zt,zp as _,me as _n,kc as _t,u_ as a,ga as an,du as at,sp as b,re as bn,Uc as bt,s_ as c,mt as cn,I as ct,W as d,Se as dn,_l as dt,ka as en,R as et,om as f,w as fn,nl as ft,Rp as g,oe as gn,Hc as gt,Op as h,le as hn,Kc as ht,g_ as i,wa as in,au as it,Sd as j,nc as jt,Qd as k,ac as kt,i_ as l,pt as ln,yl as lt,Ep as m,S as mn,Qc as mt,y_ as n,Oa as nn,fu as nt,m_ as o,E as on,su as ot,am as p,ve as pn,el as pt,Au as q,mo as qt,v_ as r,Ea as rn,pu as rt,c_ as s,T as sn,gu as st,rv as t,Aa as tn,bu as tt,wg as u,ft as un,vl as ut,em as v,_e as vn,Oc as vt,Cf as w,sc as wt,cp as x,te as xn,Sc as xt,vp as y,ge as yn,F as yt,V as z,is as zt};