import"./vendor.js";window.JSCompiler_renameProperty=function(t,e){return t};let es=/(url\()([^)]*)(\))/g,ts=/(^\/[^\/])|(^#)|(^[\w-\d]*:)/,he,C;function W(t,e){if(t&&ts.test(t)||t==="//")return t;if(he===void 0){he=!1;try{const s=new URL("b","http://a");s.pathname="c%20d",he=s.href==="http://a/c%20d"}catch{}}if(e||(e=document.baseURI||window.location.href),he)try{return new URL(t,e).href}catch{return t}return C||(C=document.implementation.createHTMLDocument("temp"),C.base=C.createElement("base"),C.head.appendChild(C.base),C.anchor=C.createElement("a"),C.body.appendChild(C.anchor)),C.base.href=e,C.anchor.href=t,C.anchor.href||t}function qe(t,e){return t.replace(es,function(s,r,i,n){return r+"'"+W(i.replace(/["']/g,""),e)+"'"+n})}function Ye(t){return t.substring(0,t.lastIndexOf("/")+1)}const ei=!window.ShadyDOM||!window.ShadyDOM.inUse;!window.ShadyCSS||window.ShadyCSS.nativeCss;const is=ei&&"adoptedStyleSheets"in Document.prototype&&"replaceSync"in CSSStyleSheet.prototype&&(()=>{try{const t=new CSSStyleSheet;t.replaceSync("");const e=document.createElement("div");return e.attachShadow({mode:"open"}),e.shadowRoot.adoptedStyleSheets=[t],e.shadowRoot.adoptedStyleSheets[0]===t}catch{return!1}})();let ss=window.Polymer&&window.Polymer.rootPath||Ye(document.baseURI||window.location.href),fe=window.Polymer&&window.Polymer.sanitizeDOMValue||void 0,rs=window.Polymer&&window.Polymer.setPassiveTouchGestures||!1,K=window.Polymer&&window.Polymer.strictTemplatePolicy||!1,ns=window.Polymer&&window.Polymer.allowTemplateFromDomModule||!1,te=window.Polymer&&window.Polymer.legacyOptimizations||!1,ti=window.Polymer&&window.Polymer.legacyWarnings||!1,as=window.Polymer&&window.Polymer.syncInitialRender||!1,Ve=window.Polymer&&window.Polymer.legacyUndefined||!1,ls=window.Polymer&&window.Polymer.orderedComputed||!1,ft=window.Polymer&&window.Polymer.removeNestedTemplates||!1,ii=window.Polymer&&window.Polymer.fastDomIf||!1,Te=window.Polymer&&window.Polymer.suppressTemplateNotifications||!1,ce=window.Polymer&&window.Polymer.legacyNoObservedAttributes||!1,os=window.Polymer&&window.Polymer.useAdoptedStyleSheetsWithBuiltCSS||!1;let hs=0;const H=function(t){let e=t.__mixinApplications;e||(e=new WeakMap,t.__mixinApplications=e);let s=hs++;function r(i){let n=i.__mixinSet;if(n&&n[s])return i;let l=e,a=l.get(i);if(!a){a=t(i),l.set(i,a);let o=Object.create(a.__mixinSet||n||null);o[s]=!0,a.__mixinSet=o}return a}return r};let Je={},si={};function _t(t,e){Je[t]=si[t.toLowerCase()]=e}function mt(t){return Je[t]||si[t.toLowerCase()]}function cs(t){t.querySelector("style")&&console.warn("dom-module %s has style outside template",t.id)}class ie extends HTMLElement{static get observedAttributes(){return["id"]}static import(e,s){if(e){let r=mt(e);return r&&s?r.querySelector(s):r}return null}attributeChangedCallback(e,s,r,i){s!==r&&this.register()}get assetpath(){if(!this.__assetpath){const e=window.HTMLImports&&HTMLImports.importForElement?HTMLImports.importForElement(this)||document:this.ownerDocument,s=W(this.getAttribute("assetpath")||"",e.baseURI);this.__assetpath=Ye(s)}return this.__assetpath}register(e){if(e=e||this.id,e){if(K&&mt(e)!==void 0)throw _t(e,null),new Error(`strictTemplatePolicy: dom-module ${e} re-registered`);this.id=e,_t(e,this),cs(this)}}}ie.prototype.modules=Je;customElements.define("dom-module",ie);const ds="link[rel=import][type~=css]",ps="include",gt="shady-unscoped";function Ge(t){return ie.import(t)}function vt(t){let e=t.body?t.body:t;const s=qe(e.textContent,t.baseURI),r=document.createElement("style");return r.textContent=s,r}function us(t){const e=t.trim().split(/\s+/),s=[];for(let r=0;r<e.length;r++)s.push(...fs(e[r]));return s}function fs(t){const e=Ge(t);if(!e)return console.warn("Could not find style data in module named",t),[];if(e._styles===void 0){const s=[];s.push(...We(e));const r=e.querySelector("template");r&&s.push(...Xe(r,e.assetpath)),e._styles=s}return e._styles}function Xe(t,e){if(!t._styles){const s=[],r=t.content.querySelectorAll("style");for(let i=0;i<r.length;i++){let n=r[i],l=n.getAttribute(ps);l&&s.push(...us(l).filter(function(a,o,h){return h.indexOf(a)===o})),e&&(n.textContent=qe(n.textContent,e)),s.push(n)}t._styles=s}return t._styles}function _s(t){let e=Ge(t);return e?We(e):[]}function We(t){const e=[],s=t.querySelectorAll(ds);for(let r=0;r<s.length;r++){let i=s[r];if(i.import){const n=i.import,l=i.hasAttribute(gt);if(l&&!n._unscopedStyle){const a=vt(n);a.setAttribute(gt,""),n._unscopedStyle=a}else n._style||(n._style=vt(n));e.push(l?n._unscopedStyle:n._style)}}return e}function ms(t){let e=t.trim().split(/\s+/),s="";for(let r=0;r<e.length;r++)s+=gs(e[r]);return s}function gs(t){let e=Ge(t);if(e&&e._cssText===void 0){let s=ys(e),r=e.querySelector("template");r&&(s+=vs(r,e.assetpath)),e._cssText=s||null}return e||console.warn("Could not find style data in module named",t),e&&e._cssText||""}function vs(t,e){let s="";const r=Xe(t,e);for(let i=0;i<r.length;i++){let n=r[i];n.parentNode&&n.parentNode.removeChild(n),s+=n.textContent}return s}function ys(t){let e="",s=We(t);for(let r=0;r<s.length;r++)e+=s[r].textContent;return e}const u=window.ShadyDOM&&window.ShadyDOM.noPatch&&window.ShadyDOM.wrap?window.ShadyDOM.wrap:window.ShadyDOM?t=>ShadyDOM.patch(t):t=>t;function Oe(t){return t.indexOf(".")>=0}function L(t){let e=t.indexOf(".");return e===-1?t:t.slice(0,e)}function ri(t,e){return t.indexOf(e+".")===0}function se(t,e){return e.indexOf(t+".")===0}function re(t,e,s){return e+s.slice(t.length)}function bs(t,e){return t===e||ri(t,e)||se(t,e)}function G(t){if(Array.isArray(t)){let e=[];for(let s=0;s<t.length;s++){let r=t[s].toString().split(".");for(let i=0;i<r.length;i++)e.push(r[i])}return e.join(".")}else return t}function ni(t){return Array.isArray(t)?G(t).split("."):t.toString().split(".")}function b(t,e,s){let r=t,i=ni(e);for(let n=0;n<i.length;n++){if(!r)return;let l=i[n];r=r[l]}return s&&(s.path=i.join(".")),r}function yt(t,e,s){let r=t,i=ni(e),n=i[i.length-1];if(i.length>1){for(let l=0;l<i.length-1;l++){let a=i[l];if(r=r[a],!r)return}r[n]=s}else r[e]=s;return i.join(".")}const _e={},zs=/-[a-z]/g,ws=/([A-Z])/g;function Qe(t){return _e[t]||(_e[t]=t.indexOf("-")<0?t:t.replace(zs,e=>e[1].toUpperCase()))}function be(t){return _e[t]||(_e[t]=t.replace(ws,"-$1").toLowerCase())}let Cs=0,ai=0,U=[],Ms=0,ke=!1,li=document.createTextNode("");new window.MutationObserver(Hs).observe(li,{characterData:!0});function Hs(){ke=!1;const t=U.length;for(let e=0;e<t;e++){let s=U[e];if(s)try{s()}catch(r){setTimeout(()=>{throw r})}}U.splice(0,t),ai+=t}const Q={after(t){return{run(e){return window.setTimeout(e,t)},cancel(e){window.clearTimeout(e)}}},run(t,e){return window.setTimeout(t,e)},cancel(t){window.clearTimeout(t)}},E={run(t){return ke||(ke=!0,li.textContent=Ms++),U.push(t),Cs++},cancel(t){const e=t-ai;if(e>=0){if(!U[e])throw new Error("invalid async handle: "+t);U[e]=null}}};const Ps=E,oi=H(t=>{class e extends t{static createProperties(r){const i=this.prototype;for(let n in r)n in i||i._createPropertyAccessor(n)}static attributeNameForProperty(r){return r.toLowerCase()}static typeForProperty(r){}_createPropertyAccessor(r,i){this._addPropertyToAttributeMap(r),this.hasOwnProperty(JSCompiler_renameProperty("__dataHasAccessor",this))||(this.__dataHasAccessor=Object.assign({},this.__dataHasAccessor)),this.__dataHasAccessor[r]||(this.__dataHasAccessor[r]=!0,this._definePropertyAccessor(r,i))}_addPropertyToAttributeMap(r){this.hasOwnProperty(JSCompiler_renameProperty("__dataAttributes",this))||(this.__dataAttributes=Object.assign({},this.__dataAttributes));let i=this.__dataAttributes[r];return i||(i=this.constructor.attributeNameForProperty(r),this.__dataAttributes[i]=r),i}_definePropertyAccessor(r,i){Object.defineProperty(this,r,{get(){return this.__data[r]},set:i?function(){}:function(n){this._setPendingProperty(r,n,!0)&&this._invalidateProperties()}})}constructor(){super(),this.__dataEnabled=!1,this.__dataReady=!1,this.__dataInvalid=!1,this.__data={},this.__dataPending=null,this.__dataOld=null,this.__dataInstanceProps=null,this.__dataCounter=0,this.__serializing=!1,this._initializeProperties()}ready(){this.__dataReady=!0,this._flushProperties()}_initializeProperties(){for(let r in this.__dataHasAccessor)this.hasOwnProperty(r)&&(this.__dataInstanceProps=this.__dataInstanceProps||{},this.__dataInstanceProps[r]=this[r],delete this[r])}_initializeInstanceProperties(r){Object.assign(this,r)}_setProperty(r,i){this._setPendingProperty(r,i)&&this._invalidateProperties()}_getProperty(r){return this.__data[r]}_setPendingProperty(r,i,n){let l=this.__data[r],a=this._shouldPropertyChange(r,i,l);return a&&(this.__dataPending||(this.__dataPending={},this.__dataOld={}),this.__dataOld&&!(r in this.__dataOld)&&(this.__dataOld[r]=l),this.__data[r]=i,this.__dataPending[r]=i),a}_isPropertyPending(r){return!!(this.__dataPending&&this.__dataPending.hasOwnProperty(r))}_invalidateProperties(){!this.__dataInvalid&&this.__dataReady&&(this.__dataInvalid=!0,Ps.run(()=>{this.__dataInvalid&&(this.__dataInvalid=!1,this._flushProperties())}))}_enableProperties(){this.__dataEnabled||(this.__dataEnabled=!0,this.__dataInstanceProps&&(this._initializeInstanceProperties(this.__dataInstanceProps),this.__dataInstanceProps=null),this.ready())}_flushProperties(){this.__dataCounter++;const r=this.__data,i=this.__dataPending,n=this.__dataOld;this._shouldPropertiesChange(r,i,n)&&(this.__dataPending=null,this.__dataOld=null,this._propertiesChanged(r,i,n)),this.__dataCounter--}_shouldPropertiesChange(r,i,n){return!!i}_propertiesChanged(r,i,n){}_shouldPropertyChange(r,i,n){return n!==i&&(n===n||i===i)}attributeChangedCallback(r,i,n,l){i!==n&&this._attributeToProperty(r,n),super.attributeChangedCallback&&super.attributeChangedCallback(r,i,n,l)}_attributeToProperty(r,i,n){if(!this.__serializing){const l=this.__dataAttributes,a=l&&l[r]||r;this[a]=this._deserializeValue(i,n||this.constructor.typeForProperty(a))}}_propertyToAttribute(r,i,n){this.__serializing=!0,n=arguments.length<3?this[r]:n,this._valueToNodeAttribute(this,n,i||this.constructor.attributeNameForProperty(r)),this.__serializing=!1}_valueToNodeAttribute(r,i,n){const l=this._serializeValue(i);(n==="class"||n==="name"||n==="slot")&&(r=u(r)),l===void 0?r.removeAttribute(n):r.setAttribute(n,l===""&&window.trustedTypes?window.trustedTypes.emptyScript:l)}_serializeValue(r){return typeof r==="boolean"?r?"":void 0:r?.toString()}_deserializeValue(r,i){switch(i){case Boolean:return r!==null;case Number:return Number(r);default:return r}}}return e});const hi={};let de=HTMLElement.prototype;for(;de;){let t=Object.getOwnPropertyNames(de);for(let e=0;e<t.length;e++)hi[t[e]]=!0;de=Object.getPrototypeOf(de)}const Ss=window.trustedTypes?t=>trustedTypes.isHTML(t)||trustedTypes.isScript(t)||trustedTypes.isScriptURL(t):()=>!1;function xs(t,e){if(!hi[e]){let s=t[e];s!==void 0&&(t.__data?t._setPendingProperty(e,s):(t.__dataProto?t.hasOwnProperty(JSCompiler_renameProperty("__dataProto",t))||(t.__dataProto=Object.create(t.__dataProto)):t.__dataProto={},t.__dataProto[e]=s))}}const ci=H(t=>{const e=oi(t);class s extends e{static createPropertiesForAttributes(){let i=this.observedAttributes;for(let n=0;n<i.length;n++)this.prototype._createPropertyAccessor(Qe(i[n]))}static attributeNameForProperty(i){return be(i)}_initializeProperties(){this.__dataProto&&(this._initializeProtoProperties(this.__dataProto),this.__dataProto=null),super._initializeProperties()}_initializeProtoProperties(i){for(let n in i)this._setProperty(n,i[n])}_ensureAttribute(i,n){const l=this;l.hasAttribute(i)||this._valueToNodeAttribute(l,n,i)}_serializeValue(i){switch(typeof i){case"object":if(i instanceof Date)return i.toString();if(i){if(Ss(i))return i;try{return JSON.stringify(i)}catch{return""}}default:return super._serializeValue(i)}}_deserializeValue(i,n){let l;switch(n){case Object:try{l=JSON.parse(i)}catch{l=i}break;case Array:try{l=JSON.parse(i)}catch{l=null,console.warn(`Polymer::Attributes: couldn't decode Array as JSON: ${i}`)}break;case Date:l=isNaN(i)?String(i):Number(i),l=new Date(l);break;default:l=super._deserializeValue(i,n);break}return l}_definePropertyAccessor(i,n){xs(this,i),super._definePropertyAccessor(i,n)}_hasAccessor(i){return this.__dataHasAccessor&&this.__dataHasAccessor[i]}_isPropertyPending(i){return!!(this.__dataPending&&i in this.__dataPending)}}return s});const Ls={"dom-if":!0,"dom-repeat":!0};let bt=!1,zt=!1;function Es(){if(!bt){bt=!0;const t=document.createElement("textarea");t.placeholder="a",zt=t.placeholder===t.textContent}return zt}function As(t){Es()&&t.localName==="textarea"&&t.placeholder&&t.placeholder===t.textContent&&(t.textContent=null)}const Vs=(()=>{const t=window.trustedTypes&&window.trustedTypes.createPolicy("polymer-template-event-attribute-policy",{createScript:e=>e});return(e,s,r)=>{const i=s.getAttribute(r);if(t&&r.startsWith("on-")){e.setAttribute(r,t.createScript(i,r));return}e.setAttribute(r,i)}})();function Ts(t){let e=t.getAttribute("is");if(e&&Ls[e]){let s=t;for(s.removeAttribute("is"),t=s.ownerDocument.createElement(e),s.parentNode.replaceChild(t,s),t.appendChild(s);s.attributes.length;){const{name:r}=s.attributes[0];Vs(t,s,r),s.removeAttribute(r)}}return t}function di(t,e){let s=e.parentInfo&&di(t,e.parentInfo);if(s){for(let r=s.firstChild,i=0;r;r=r.nextSibling)if(e.parentIndex===i++)return r}else return t}function Os(t,e,s,r){r.id&&(e[r.id]=s)}function ks(t,e,s){if(s.events&&s.events.length)for(let r=0,i=s.events,n;r<i.length&&(n=i[r]);r++)t._addMethodEventListenerToNode(e,n.name,n.value,t)}function Ns(t,e,s,r){s.templateInfo&&(e._templateInfo=s.templateInfo,e._parentTemplateInfo=r)}function Is(t,e,s){return t=t._methodHost||t,function(i){t[s]?t[s](i,i.detail):console.warn("listener method `"+s+"` not defined")}}const Ds=H(t=>{class e extends t{static _parseTemplate(r,i){if(!r._templateInfo){let n=r._templateInfo={};n.nodeInfoList=[],n.nestedTemplate=!!i,n.stripWhiteSpace=i&&i.stripWhiteSpace||r.hasAttribute&&r.hasAttribute("strip-whitespace"),this._parseTemplateContent(r,n,{parent:null})}return r._templateInfo}static _parseTemplateContent(r,i,n){return this._parseTemplateNode(r.content,i,n)}static _parseTemplateNode(r,i,n){let l=!1,a=r;return a.localName=="template"&&!a.hasAttribute("preserve-content")?l=this._parseTemplateNestedTemplate(a,i,n)||l:a.localName==="slot"&&(i.hasInsertionPoint=!0),As(a),a.firstChild&&this._parseTemplateChildNodes(a,i,n),a.hasAttributes&&a.hasAttributes()&&(l=this._parseTemplateNodeAttributes(a,i,n)||l),l||n.noted}static _parseTemplateChildNodes(r,i,n){if(!(r.localName==="script"||r.localName==="style"))for(let l=r.firstChild,a=0,o;l;l=o){if(l.localName=="template"&&(l=Ts(l)),o=l.nextSibling,l.nodeType===Node.TEXT_NODE){let c=o;for(;c&&c.nodeType===Node.TEXT_NODE;)l.textContent+=c.textContent,o=c.nextSibling,r.removeChild(c),c=o;if(i.stripWhiteSpace&&!l.textContent.trim()){r.removeChild(l);continue}}let h={parentIndex:a,parentInfo:n};this._parseTemplateNode(l,i,h)&&(h.infoIndex=i.nodeInfoList.push(h)-1),l.parentNode&&a++}}static _parseTemplateNestedTemplate(r,i,n){let l=r,a=this._parseTemplate(l,i);return(a.content=l.content.ownerDocument.createDocumentFragment()).appendChild(l.content),n.templateInfo=a,!0}static _parseTemplateNodeAttributes(r,i,n){let l=!1,a=Array.from(r.attributes);for(let o=a.length-1,h;h=a[o];o--)l=this._parseTemplateNodeAttribute(r,i,n,h.name,h.value)||l;return l}static _parseTemplateNodeAttribute(r,i,n,l,a){return l.slice(0,3)==="on-"?(r.removeAttribute(l),n.events=n.events||[],n.events.push({name:l.slice(3),value:a}),!0):l==="id"?(n.id=a,!0):!1}static _contentForTemplate(r){let i=r._templateInfo;return i&&i.content||r.content}_stampTemplate(r,i){r&&!r.content&&window.HTMLTemplateElement&&HTMLTemplateElement.decorate&&HTMLTemplateElement.decorate(r),i=i||this.constructor._parseTemplate(r);let n=i.nodeInfoList,l=i.content||r.content,a=document.importNode(l,!0);a.__noInsertionPoint=!i.hasInsertionPoint;let o=a.nodeList=new Array(n.length);a.$={};for(let h=0,c=n.length,d;h<c&&(d=n[h]);h++){let p=o[h]=di(a,d);Os(this,a.$,p,d),Ns(this,p,d,i),ks(this,p,d)}return a=a,a}_addMethodEventListenerToNode(r,i,n,l){l=l||r;let a=Is(l,i,n);return this._addEventListenerToNode(r,i,a),a}_addEventListenerToNode(r,i,n){r.addEventListener(i,n)}_removeEventListenerFromNode(r,i,n){r.removeEventListener(i,n)}}return e});let ne=0;const ae=[],_={COMPUTE:"__computeEffects",REFLECT:"__reflectEffects",NOTIFY:"__notifyEffects",PROPAGATE:"__propagateEffects",OBSERVE:"__observeEffects",READ_ONLY:"__readOnly"},pi="__computeInfo",Rs=/[A-Z]/;function Pe(t,e,s){let r=t[e];if(!r)r=t[e]={};else if(!t.hasOwnProperty(e)&&(r=t[e]=Object.create(t[e]),s))for(let i in r){let n=r[i],l=r[i]=Array(n.length);for(let a=0;a<n.length;a++)l[a]=n[a]}return r}function X(t,e,s,r,i,n){if(e){let l=!1;const a=ne++;for(let o in s){let h=i?L(o):o,c=e[h];if(c)for(let d=0,p=c.length,f;d<p&&(f=c[d]);d++)(!f.info||f.info.lastRun!==a)&&(!i||Ze(o,f.trigger))&&(f.info&&(f.info.lastRun=a),f.fn(t,o,s,r,f.info,i,n),l=!0)}return l}return!1}function Fs(t,e,s,r,i,n,l,a){let o=!1,h=l?L(r):r,c=e[h];if(c)for(let d=0,p=c.length,f;d<p&&(f=c[d]);d++)(!f.info||f.info.lastRun!==s)&&(!l||Ze(r,f.trigger))&&(f.info&&(f.info.lastRun=s),f.fn(t,r,i,n,f.info,l,a),o=!0);return o}function Ze(t,e){if(e){let s=e.name;return s==t||!!(e.structured&&ri(s,t))||!!(e.wildcard&&se(s,t))}else return!0}function wt(t,e,s,r,i){let n=typeof i.method=="string"?t[i.method]:i.method,l=i.property;n?n.call(t,t.__data[l],r[l]):i.dynamicFn||console.warn("observer method `"+i.method+"` not defined")}function Bs(t,e,s,r,i){let n=t[_.NOTIFY],l,a=ne++;for(let h in e)e[h]&&(n&&Fs(t,n,a,h,s,r,i)||i&&Us(t,h,s))&&(l=!0);let o;l&&(o=t.__dataHost)&&o._invalidateProperties&&o._invalidateProperties()}function Us(t,e,s){let r=L(e);if(r!==e){let i=be(r)+"-changed";return ui(t,i,s[e],e),!0}return!1}function ui(t,e,s,r){let i={value:s,queueProperty:!0};r&&(i.path=r),u(t).dispatchEvent(new CustomEvent(e,{detail:i}))}function js(t,e,s,r,i,n){let a=(n?L(e):e)!=e?e:null,o=a?b(t,a):t.__data[e];a&&o===void 0&&(o=s[e]),ui(t,i.eventName,o,a)}function Ks(t,e,s,r,i){let n,l=t.detail,a=l&&l.path;a?(r=re(s,r,a),n=l&&l.value):n=t.currentTarget[s],n=i?!n:n,(!e[_.READ_ONLY]||!e[_.READ_ONLY][r])&&e._setPendingPropertyOrPath(r,n,!0,!!a)&&(!l||!l.queueProperty)&&e._invalidateProperties()}function $s(t,e,s,r,i){let n=t.__data[e];fe&&(n=fe(n,i.attrName,"attribute",t)),t._propertyToAttribute(e,i.attrName,n)}function qs(t,e,s,r){let i=t[_.COMPUTE];if(i)if(ls){ne++;const n=Js(t),l=[];for(let o in e)Ct(o,i,l,n,r);let a;for(;a=l.shift();)fi(t,"",e,s,a)&&Ct(a.methodInfo,i,l,n,r);Object.assign(s,t.__dataOld),Object.assign(e,t.__dataPending),t.__dataPending=null}else{let n=e;for(;X(t,i,n,s,r);)Object.assign(s,t.__dataOld),Object.assign(e,t.__dataPending),n=t.__dataPending,t.__dataPending=null}}const Ys=(t,e,s)=>{let r=0,i=e.length-1,n=-1;for(;r<=i;){const l=r+i>>1,a=s.get(e[l].methodInfo)-s.get(t.methodInfo);if(a<0)r=l+1;else if(a>0)i=l-1;else{n=l;break}}n<0&&(n=i+1),e.splice(n,0,t)},Ct=(t,e,s,r,i)=>{const n=i?L(t):t,l=e[n];if(l)for(let a=0;a<l.length;a++){const o=l[a];o.info.lastRun!==ne&&(!i||Ze(t,o.trigger))&&(o.info.lastRun=ne,Ys(o.info,s,r))}};function Js(t){let e=t.constructor.__orderedComputedDeps;if(!e){e=new Map;const s=t[_.COMPUTE];let{counts:r,ready:i,total:n}=Gs(t),l;for(;l=i.shift();){e.set(l,e.size);const a=s[l];a&&a.forEach(o=>{const h=o.info.methodInfo;--n,--r[h]===0&&i.push(h)})}n!==0&&console.warn(`Computed graph for ${t.localName} incomplete; circular?`),t.constructor.__orderedComputedDeps=e}return e}function Gs(t){const e=t[pi],s={},r=t[_.COMPUTE],i=[];let n=0;for(let l in e){const a=e[l];n+=s[l]=a.args.filter(o=>!o.literal).length+(a.dynamicFn?1:0)}for(let l in r)e[l]||i.push(l);return{counts:s,ready:i,total:n}}function fi(t,e,s,r,i){let n=Ne(t,e,s,r,i);if(n===ae)return!1;let l=i.methodInfo;return t.__dataHasAccessor&&t.__dataHasAccessor[l]?t._setPendingProperty(l,n,!0):(t[l]=n,!1)}function Xs(t,e,s){let r=t.__dataLinkedPaths;if(r){let i;for(let n in r){let l=r[n];se(n,e)?(i=re(n,l,e),t._setPendingPropertyOrPath(i,s,!0,!0)):se(l,e)&&(i=re(l,n,e),t._setPendingPropertyOrPath(i,s,!0,!0))}}}function Se(t,e,s,r,i,n,l){s.bindings=s.bindings||[];let a={kind:r,target:i,parts:n,literal:l,isCompound:n.length!==1};if(s.bindings.push(a),t1(a)){let{event:h,negate:c}=a.parts[0];a.listenerEvent=h||be(i)+"-changed",a.listenerNegate=c}let o=e.nodeInfoList.length;for(let h=0;h<a.parts.length;h++){let c=a.parts[h];c.compoundIndex=h,Ws(t,e,a,c,o)}}function Ws(t,e,s,r,i){if(!r.literal)if(s.kind==="attribute"&&s.target[0]==="-")console.warn("Cannot set attribute "+s.target+' because "-" is not a valid attribute starting character');else{let n=r.dependencies,l={index:i,binding:s,part:r,evaluator:t};for(let a=0;a<n.length;a++){let o=n[a];typeof o=="string"&&(o=mi(o),o.wildcard=!0),t._addTemplatePropertyEffect(e,o.rootProperty,{fn:Qs,info:l,trigger:o})}}}function Qs(t,e,s,r,i,n,l){let a=l[i.index],o=i.binding,h=i.part;if(n&&h.source&&e.length>h.source.length&&o.kind=="property"&&!o.isCompound&&a.__isPropertyEffectsClient&&a.__dataHasAccessor&&a.__dataHasAccessor[o.target]){let c=s[e];e=re(h.source,o.target,e),a._setPendingPropertyOrPath(e,c,!1,!0)&&t._enqueueClient(a)}else{let c=i.evaluator._evaluateBinding(t,h,e,s,r,n);c!==ae&&Zs(t,a,o,h,c)}}function Zs(t,e,s,r,i){if(i=e1(e,i,s,r),fe&&(i=fe(i,s.target,s.kind,e)),s.kind=="attribute")t._valueToNodeAttribute(e,i,s.target);else{let n=s.target;e.__isPropertyEffectsClient&&e.__dataHasAccessor&&e.__dataHasAccessor[n]?(!e[_.READ_ONLY]||!e[_.READ_ONLY][n])&&e._setPendingProperty(n,i)&&t._enqueueClient(e):t._setUnmanagedPropertyToNode(e,n,i)}}function e1(t,e,s,r){if(s.isCompound){let i=t.__dataCompoundStorage[s.target];i[r.compoundIndex]=e,e=i.join("")}return s.kind!=="attribute"&&(s.target==="textContent"||s.target==="value"&&(t.localName==="input"||t.localName==="textarea"))&&(e=e??""),e}function t1(t){return!!t.target&&t.kind!="attribute"&&t.kind!="text"&&!t.isCompound&&t.parts[0].mode==="{"}function i1(t,e){let{nodeList:s,nodeInfoList:r}=e;if(r.length)for(let i=0;i<r.length;i++){let n=r[i],l=s[i],a=n.bindings;if(a)for(let o=0;o<a.length;o++){let h=a[o];s1(l,h),r1(l,t,h)}l.__dataHost=t}}function s1(t,e){if(e.isCompound){let s=t.__dataCompoundStorage||(t.__dataCompoundStorage={}),r=e.parts,i=new Array(r.length);for(let l=0;l<r.length;l++)i[l]=r[l].literal;let n=e.target;s[n]=i,e.literal&&e.kind=="property"&&(n==="className"&&(t=u(t)),t[n]=e.literal)}}function r1(t,e,s){if(s.listenerEvent){let r=s.parts[0];t.addEventListener(s.listenerEvent,function(i){Ks(i,e,s.target,r.source,r.negate)})}}function Mt(t,e,s,r,i,n){n=e.static||n&&(typeof n!="object"||n[e.methodName]);let l={methodName:e.methodName,args:e.args,methodInfo:i,dynamicFn:n};for(let a=0,o;a<e.args.length&&(o=e.args[a]);a++)o.literal||t._addPropertyEffect(o.rootProperty,s,{fn:r,info:l,trigger:o});return n&&t._addPropertyEffect(e.methodName,s,{fn:r,info:l}),l}function Ne(t,e,s,r,i){let n=t._methodHost||t,l=n[i.methodName];if(l){let a=t._marshalArgs(i.args,e,s);return a===ae?ae:l.apply(n,a)}else i.dynamicFn||console.warn("method `"+i.methodName+"` not defined")}const n1=[],_i="(?:[a-zA-Z_$][\\w.:$\\-*]*)",a1="(?:[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?)",l1="(?:'(?:[^'\\\\]|\\\\.)*')",o1='(?:"(?:[^"\\\\]|\\\\.)*")',h1="(?:"+l1+"|"+o1+")",Ht="(?:("+_i+"|"+a1+"|"+h1+")\\s*)",c1="(?:"+Ht+"(?:,\\s*"+Ht+")*)",d1="(?:\\(\\s*(?:"+c1+"?)\\)\\s*)",p1="("+_i+"\\s*"+d1+"?)",u1="(\\[\\[|{{)\\s*",f1="(?:]]|}})",_1="(?:(!)\\s*)?",m1=u1+_1+p1+f1,Pt=new RegExp(m1,"g");function St(t){let e="";for(let s=0;s<t.length;s++){let r=t[s].literal;e+=r||""}return e}function xe(t){let e=t.match(/([^\s]+?)\(([\s\S]*)\)/);if(e){let r={methodName:e[1],static:!0,args:n1};if(e[2].trim()){let i=e[2].replace(/\\,/g,"&comma;").split(",");return g1(i,r)}else return r}return null}function g1(t,e){return e.args=t.map(function(s){let r=mi(s);return r.literal||(e.static=!1),r},this),e}function mi(t){let e=t.trim().replace(/&comma;/g,",").replace(/\\(.)/g,"$1"),s={name:e,value:"",literal:!1},r=e[0];switch(r==="-"&&(r=e[1]),r>="0"&&r<="9"&&(r="#"),r){case"'":case'"':s.value=e.slice(1,-1),s.literal=!0;break;case"#":s.value=Number(e),s.literal=!0;break}return s.literal||(s.rootProperty=L(e),s.structured=Oe(e),s.structured&&(s.wildcard=e.slice(-2)==".*",s.wildcard&&(s.name=e.slice(0,-2)))),s}function xt(t,e,s){let r=b(t,s);return r===void 0&&(r=e[s]),r}function gi(t,e,s,r){const i={indexSplices:r};Ve&&!t._overrideLegacyUndefined&&(e.splices=i),t.notifyPath(s+".splices",i),t.notifyPath(s+".length",e.length),Ve&&!t._overrideLegacyUndefined&&(i.indexSplices=[])}function $(t,e,s,r,i,n){gi(t,e,s,[{index:r,addedCount:i,removed:n,object:e,type:"splice"}])}function v1(t){return t[0].toUpperCase()+t.substring(1)}const ze=H(t=>{const e=Ds(ci(t));class s extends e{constructor(){super(),this.__isPropertyEffectsClient=!0,this.__dataClientsReady,this.__dataPendingClients,this.__dataToNotify,this.__dataLinkedPaths,this.__dataHasPaths,this.__dataCompoundStorage,this.__dataHost,this.__dataTemp,this.__dataClientsInitialized,this.__data,this.__dataPending,this.__dataOld,this.__computeEffects,this.__computeInfo,this.__reflectEffects,this.__notifyEffects,this.__propagateEffects,this.__observeEffects,this.__readOnly,this.__templateInfo,this._overrideLegacyUndefined}get PROPERTY_EFFECT_TYPES(){return _}_initializeProperties(){super._initializeProperties(),this._registerHost(),this.__dataClientsReady=!1,this.__dataPendingClients=null,this.__dataToNotify=null,this.__dataLinkedPaths=null,this.__dataHasPaths=!1,this.__dataCompoundStorage=this.__dataCompoundStorage||null,this.__dataHost=this.__dataHost||null,this.__dataTemp={},this.__dataClientsInitialized=!1}_registerHost(){if(q.length){let i=q[q.length-1];i._enqueueClient(this),this.__dataHost=i}}_initializeProtoProperties(i){this.__data=Object.create(i),this.__dataPending=Object.create(i),this.__dataOld={}}_initializeInstanceProperties(i){let n=this[_.READ_ONLY];for(let l in i)(!n||!n[l])&&(this.__dataPending=this.__dataPending||{},this.__dataOld=this.__dataOld||{},this.__data[l]=this.__dataPending[l]=i[l])}_addPropertyEffect(i,n,l){this._createPropertyAccessor(i,n==_.READ_ONLY);let a=Pe(this,n,!0)[i];a||(a=this[n][i]=[]),a.push(l)}_removePropertyEffect(i,n,l){let a=Pe(this,n,!0)[i],o=a.indexOf(l);o>=0&&a.splice(o,1)}_hasPropertyEffect(i,n){let l=this[n];return!!(l&&l[i])}_hasReadOnlyEffect(i){return this._hasPropertyEffect(i,_.READ_ONLY)}_hasNotifyEffect(i){return this._hasPropertyEffect(i,_.NOTIFY)}_hasReflectEffect(i){return this._hasPropertyEffect(i,_.REFLECT)}_hasComputedEffect(i){return this._hasPropertyEffect(i,_.COMPUTE)}_setPendingPropertyOrPath(i,n,l,a){if(a||L(Array.isArray(i)?i[0]:i)!==i){if(!a){let o=b(this,i);if(i=yt(this,i,n),!i||!super._shouldPropertyChange(i,n,o))return!1}if(this.__dataHasPaths=!0,this._setPendingProperty(i,n,l))return Xs(this,i,n),!0}else{if(this.__dataHasAccessor&&this.__dataHasAccessor[i])return this._setPendingProperty(i,n,l);this[i]=n}return!1}_setUnmanagedPropertyToNode(i,n,l){(l!==i[n]||typeof l=="object")&&(n==="className"&&(i=u(i)),i[n]=l)}_setPendingProperty(i,n,l){let a=this.__dataHasPaths&&Oe(i),o=a?this.__dataTemp:this.__data;return this._shouldPropertyChange(i,n,o[i])?(this.__dataPending||(this.__dataPending={},this.__dataOld={}),i in this.__dataOld||(this.__dataOld[i]=this.__data[i]),a?this.__dataTemp[i]=n:this.__data[i]=n,this.__dataPending[i]=n,(a||this[_.NOTIFY]&&this[_.NOTIFY][i])&&(this.__dataToNotify=this.__dataToNotify||{},this.__dataToNotify[i]=l),!0):!1}_setProperty(i,n){this._setPendingProperty(i,n,!0)&&this._invalidateProperties()}_invalidateProperties(){this.__dataReady&&this._flushProperties()}_enqueueClient(i){this.__dataPendingClients=this.__dataPendingClients||[],i!==this&&this.__dataPendingClients.push(i)}_flushClients(){this.__dataClientsReady?this.__enableOrFlushClients():(this.__dataClientsReady=!0,this._readyClients(),this.__dataReady=!0)}__enableOrFlushClients(){let i=this.__dataPendingClients;if(i){this.__dataPendingClients=null;for(let n=0;n<i.length;n++){let l=i[n];l.__dataEnabled?l.__dataPending&&l._flushProperties():l._enableProperties()}}}_readyClients(){this.__enableOrFlushClients()}setProperties(i,n){for(let l in i)(n||!this[_.READ_ONLY]||!this[_.READ_ONLY][l])&&this._setPendingPropertyOrPath(l,i[l],!0);this._invalidateProperties()}ready(){this._flushProperties(),this.__dataClientsReady||this._flushClients(),this.__dataPending&&this._flushProperties()}_propertiesChanged(i,n,l){let a=this.__dataHasPaths;this.__dataHasPaths=!1;let o;qs(this,n,l,a),o=this.__dataToNotify,this.__dataToNotify=null,this._propagatePropertyChanges(n,l,a),this._flushClients(),X(this,this[_.REFLECT],n,l,a),X(this,this[_.OBSERVE],n,l,a),o&&Bs(this,o,n,l,a),this.__dataCounter==1&&(this.__dataTemp={})}_propagatePropertyChanges(i,n,l){this[_.PROPAGATE]&&X(this,this[_.PROPAGATE],i,n,l),this.__templateInfo&&this._runEffectsForTemplate(this.__templateInfo,i,n,l)}_runEffectsForTemplate(i,n,l,a){const o=(h,c)=>{X(this,i.propertyEffects,h,l,c,i.nodeList);for(let d=i.firstChild;d;d=d.nextSibling)this._runEffectsForTemplate(d,h,l,c)};i.runEffects?i.runEffects(o,n,a):o(n,a)}linkPaths(i,n){i=G(i),n=G(n),this.__dataLinkedPaths=this.__dataLinkedPaths||{},this.__dataLinkedPaths[i]=n}unlinkPaths(i){i=G(i),this.__dataLinkedPaths&&delete this.__dataLinkedPaths[i]}notifySplices(i,n){let l={path:""},a=b(this,i,l);gi(this,a,l.path,n)}get(i,n){return b(n||this,i)}set(i,n,l){l?yt(l,i,n):(!this[_.READ_ONLY]||!this[_.READ_ONLY][i])&&this._setPendingPropertyOrPath(i,n,!0)&&this._invalidateProperties()}push(i,...n){let l={path:""},a=b(this,i,l),o=a.length,h=a.push(...n);return n.length&&$(this,a,l.path,o,n.length,[]),h}pop(i){let n={path:""},l=b(this,i,n),a=!!l.length,o=l.pop();return a&&$(this,l,n.path,l.length,0,[o]),o}splice(i,n,l,...a){let o={path:""},h=b(this,i,o);n<0?n=h.length-Math.floor(-n):n&&(n=Math.floor(n));let c;return arguments.length===2?c=h.splice(n):c=h.splice(n,l,...a),(a.length||c.length)&&$(this,h,o.path,n,a.length,c),c}shift(i){let n={path:""},l=b(this,i,n),a=!!l.length,o=l.shift();return a&&$(this,l,n.path,0,0,[o]),o}unshift(i,...n){let l={path:""},a=b(this,i,l),o=a.unshift(...n);return n.length&&$(this,a,l.path,0,n.length,[]),o}notifyPath(i,n){let l;if(arguments.length==1){let a={path:""};n=b(this,i,a),l=a.path}else Array.isArray(i)?l=G(i):l=i;this._setPendingPropertyOrPath(l,n,!0,!0)&&this._invalidateProperties()}_createReadOnlyProperty(i,n){this._addPropertyEffect(i,_.READ_ONLY),n&&(this["_set"+v1(i)]=function(l){this._setProperty(i,l)})}_createPropertyObserver(i,n,l){let a={property:i,method:n,dynamicFn:!!l};this._addPropertyEffect(i,_.OBSERVE,{fn:wt,info:a,trigger:{name:i}}),l&&this._addPropertyEffect(n,_.OBSERVE,{fn:wt,info:a,trigger:{name:n}})}_createMethodObserver(i,n){let l=xe(i);if(!l)throw new Error("Malformed observer expression '"+i+"'");Mt(this,l,_.OBSERVE,Ne,null,n)}_createNotifyingProperty(i){this._addPropertyEffect(i,_.NOTIFY,{fn:js,info:{eventName:be(i)+"-changed",property:i}})}_createReflectedProperty(i){let n=this.constructor.attributeNameForProperty(i);n[0]==="-"?console.warn("Property "+i+" cannot be reflected to attribute "+n+' because "-" is not a valid starting attribute name. Use a lowercase first letter for the property instead.'):this._addPropertyEffect(i,_.REFLECT,{fn:$s,info:{attrName:n}})}_createComputedProperty(i,n,l){let a=xe(n);if(!a)throw new Error("Malformed computed expression '"+n+"'");const o=Mt(this,a,_.COMPUTE,fi,i,l);Pe(this,pi)[i]=o}_marshalArgs(i,n,l){const a=this.__data,o=[];for(let h=0,c=i.length;h<c;h++){let{name:d,structured:p,wildcard:f,value:v,literal:P}=i[h];if(!P)if(f){const S=se(d,n),z=xt(a,l,S?n:d);v={path:S?n:d,value:z,base:S?b(a,d):z}}else v=p?xt(a,l,d):a[d];if(Ve&&!this._overrideLegacyUndefined&&v===void 0&&i.length>1)return ae;o[h]=v}return o}static addPropertyEffect(i,n,l){this.prototype._addPropertyEffect(i,n,l)}static createPropertyObserver(i,n,l){this.prototype._createPropertyObserver(i,n,l)}static createMethodObserver(i,n){this.prototype._createMethodObserver(i,n)}static createNotifyingProperty(i){this.prototype._createNotifyingProperty(i)}static createReadOnlyProperty(i,n){this.prototype._createReadOnlyProperty(i,n)}static createReflectedProperty(i){this.prototype._createReflectedProperty(i)}static createComputedProperty(i,n,l){this.prototype._createComputedProperty(i,n,l)}static bindTemplate(i){return this.prototype._bindTemplate(i)}_bindTemplate(i,n){let l=this.constructor._parseTemplate(i),a=this.__preBoundTemplateInfo==l;if(!a)for(let o in l.propertyEffects)this._createPropertyAccessor(o);if(n)if(l=Object.create(l),l.wasPreBound=a,!this.__templateInfo)this.__templateInfo=l;else{const o=i._parentTemplateInfo||this.__templateInfo,h=o.lastChild;l.parent=o,o.lastChild=l,l.previousSibling=h,h?h.nextSibling=l:o.firstChild=l}else this.__preBoundTemplateInfo=l;return l}static _addTemplatePropertyEffect(i,n,l){let a=i.hostProps=i.hostProps||{};a[n]=!0;let o=i.propertyEffects=i.propertyEffects||{};(o[n]=o[n]||[]).push(l)}_stampTemplate(i,n){n=n||this._bindTemplate(i,!0),q.push(this);let l=super._stampTemplate(i,n);if(q.pop(),n.nodeList=l.nodeList,!n.wasPreBound){let a=n.childNodes=[];for(let o=l.firstChild;o;o=o.nextSibling)a.push(o)}return l.templateInfo=n,i1(this,n),this.__dataClientsReady&&(this._runEffectsForTemplate(n,this.__data,null,!1),this._flushClients()),l}_removeBoundDom(i){const n=i.templateInfo,{previousSibling:l,nextSibling:a,parent:o}=n;l?l.nextSibling=a:o&&(o.firstChild=a),a?a.previousSibling=l:o&&(o.lastChild=l),n.nextSibling=n.previousSibling=null;let h=n.childNodes;for(let c=0;c<h.length;c++){let d=h[c];u(u(d).parentNode).removeChild(d)}}static _parseTemplateNode(i,n,l){let a=e._parseTemplateNode.call(this,i,n,l);if(i.nodeType===Node.TEXT_NODE){let o=this._parseBindings(i.textContent,n);o&&(i.textContent=St(o)||" ",Se(this,n,l,"text","textContent",o),a=!0)}return a}static _parseTemplateNodeAttribute(i,n,l,a,o){let h=this._parseBindings(o,n);if(h){let c=a,d="property";Rs.test(a)?d="attribute":a[a.length-1]=="$"&&(a=a.slice(0,-1),d="attribute");let p=St(h);return p&&d=="attribute"&&(a=="class"&&i.hasAttribute("class")&&(p+=" "+i.getAttribute(a)),i.setAttribute(a,p)),d=="attribute"&&c=="disable-upgrade$"&&i.setAttribute(a,""),i.localName==="input"&&c==="value"&&i.setAttribute(c,""),i.removeAttribute(c),d==="property"&&(a=Qe(a)),Se(this,n,l,d,a,h,p),!0}else return e._parseTemplateNodeAttribute.call(this,i,n,l,a,o)}static _parseTemplateNestedTemplate(i,n,l){let a=e._parseTemplateNestedTemplate.call(this,i,n,l);const o=i.parentNode,h=l.templateInfo,c=o.localName==="dom-if",d=o.localName==="dom-repeat";ft&&(c||d)&&(o.removeChild(i),l=l.parentInfo,l.templateInfo=h,l.noted=!0,a=!1);let p=h.hostProps;if(ii&&c)p&&(n.hostProps=Object.assign(n.hostProps||{},p),ft||(l.parentInfo.noted=!0));else{let f="{";for(let v in p){let P=[{mode:f,source:v,dependencies:[v],hostProp:!0}];Se(this,n,l,"property","_host_"+v,P)}}return a}static _parseBindings(i,n){let l=[],a=0,o;for(;(o=Pt.exec(i))!==null;){o.index>a&&l.push({literal:i.slice(a,o.index)});let h=o[1][0],c=!!o[2],d=o[3].trim(),p=!1,f="",v=-1;h=="{"&&(v=d.indexOf("::"))>0&&(f=d.substring(v+2),d=d.substring(0,v),p=!0);let P=xe(d),S=[];if(P){let{args:z,methodName:w}=P;for(let He=0;He<z.length;He++){let ut=z[He];ut.literal||S.push(ut)}let R=n.dynamicFns;(R&&R[w]||P.static)&&(S.push(w),P.dynamicFn=!0)}else S.push(d);l.push({source:d,mode:h,negate:c,customEvent:p,signature:P,dependencies:S,event:f}),a=Pt.lastIndex}if(a&&a<i.length){let h=i.substring(a);h&&l.push({literal:h})}return l.length?l:null}static _evaluateBinding(i,n,l,a,o,h){let c;return n.signature?c=Ne(i,l,a,o,n.signature):l!=n.source?c=b(i,n.source):h&&Oe(l)?c=b(i,l):c=i.__data[l],n.negate&&(c=!c),c}}return s}),q=[];function y1(t){const e={};for(let s in t){const r=t[s];e[s]=typeof r=="function"?{type:r}:r}return e}const b1=H(t=>{const e=oi(t);function s(n){const l=Object.getPrototypeOf(n);return l.prototype instanceof i?l:null}function r(n){if(!n.hasOwnProperty(JSCompiler_renameProperty("__ownProperties",n))){let l=null;if(n.hasOwnProperty(JSCompiler_renameProperty("properties",n))){const a=n.properties;a&&(l=y1(a))}n.__ownProperties=l}return n.__ownProperties}class i extends e{static get observedAttributes(){if(!this.hasOwnProperty(JSCompiler_renameProperty("__observedAttributes",this))){this.prototype;const l=this._properties;this.__observedAttributes=l?Object.keys(l).map(a=>this.prototype._addPropertyToAttributeMap(a)):[]}return this.__observedAttributes}static finalize(){if(!this.hasOwnProperty(JSCompiler_renameProperty("__finalized",this))){const l=s(this);l&&l.finalize(),this.__finalized=!0,this._finalizeClass()}}static _finalizeClass(){const l=r(this);l&&this.createProperties(l)}static get _properties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("__properties",this))){const l=s(this);this.__properties=Object.assign({},l&&l._properties,r(this))}return this.__properties}static typeForProperty(l){const a=this._properties[l];return a&&a.type}_initializeProperties(){this.constructor.finalize(),super._initializeProperties()}connectedCallback(){super.connectedCallback&&super.connectedCallback(),this._enableProperties()}disconnectedCallback(){super.disconnectedCallback&&super.disconnectedCallback()}}return i});const z1="3.5.2",Ie=window.ShadyCSS&&window.ShadyCSS.cssBuild,we=H(t=>{const e=b1(ze(t));function s(o){if(!o.hasOwnProperty(JSCompiler_renameProperty("__propertyDefaults",o))){o.__propertyDefaults=null;let h=o._properties;for(let c in h){let d=h[c];"value"in d&&(o.__propertyDefaults=o.__propertyDefaults||{},o.__propertyDefaults[c]=d)}}return o.__propertyDefaults}function r(o){return o.hasOwnProperty(JSCompiler_renameProperty("__ownObservers",o))||(o.__ownObservers=o.hasOwnProperty(JSCompiler_renameProperty("observers",o))?o.observers:null),o.__ownObservers}function i(o,h,c,d){c.computed&&(c.readOnly=!0),c.computed&&(o._hasReadOnlyEffect(h)?console.warn(`Cannot redefine computed property '${h}'.`):o._createComputedProperty(h,c.computed,d)),c.readOnly&&!o._hasReadOnlyEffect(h)?o._createReadOnlyProperty(h,!c.computed):c.readOnly===!1&&o._hasReadOnlyEffect(h)&&console.warn(`Cannot make readOnly property '${h}' non-readOnly.`),c.reflectToAttribute&&!o._hasReflectEffect(h)?o._createReflectedProperty(h):c.reflectToAttribute===!1&&o._hasReflectEffect(h)&&console.warn(`Cannot make reflected property '${h}' non-reflected.`),c.notify&&!o._hasNotifyEffect(h)?o._createNotifyingProperty(h):c.notify===!1&&o._hasNotifyEffect(h)&&console.warn(`Cannot make notify property '${h}' non-notify.`),c.observer&&o._createPropertyObserver(h,c.observer,d[c.observer]),o._addPropertyToAttributeMap(h)}function n(o,h,c,d){if(!Ie){const p=h.content.querySelectorAll("style"),f=Xe(h),v=_s(c),P=h.content.firstElementChild;for(let z=0;z<v.length;z++){let w=v[z];w.textContent=o._processStyleText(w.textContent,d),h.content.insertBefore(w,P)}let S=0;for(let z=0;z<f.length;z++){let w=f[z],R=p[S];R!==w?(w=w.cloneNode(!0),R.parentNode.insertBefore(w,R)):S++,w.textContent=o._processStyleText(w.textContent,d)}}if(window.ShadyCSS&&window.ShadyCSS.prepareTemplate(h,c),os&&Ie&&is){const p=h.content.querySelectorAll("style");if(p){let f="";Array.from(p).forEach(v=>{f+=v.textContent,v.parentNode.removeChild(v)}),o._styleSheet=new CSSStyleSheet,o._styleSheet.replaceSync(f)}}}function l(o){let h=null;if(o&&(!K||ns)&&(h=ie.import(o,"template"),K&&!h))throw new Error(`strictTemplatePolicy: expecting dom-module or null template for ${o}`);return h}class a extends e{static get polymerElementVersion(){return z1}static _finalizeClass(){e._finalizeClass.call(this);const h=r(this);h&&this.createObservers(h,this._properties),this._prepareTemplate()}static _prepareTemplate(){let h=this.template;h&&(typeof h=="string"?(console.error("template getter must return HTMLTemplateElement"),h=null):te||(h=h.cloneNode(!0))),this.prototype._template=h}static createProperties(h){for(let c in h)i(this.prototype,c,h[c],h)}static createObservers(h,c){const d=this.prototype;for(let p=0;p<h.length;p++)d._createMethodObserver(h[p],c)}static get template(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_template",this))){let h=this.prototype.hasOwnProperty(JSCompiler_renameProperty("_template",this.prototype))?this.prototype._template:void 0;typeof h=="function"&&(h=h()),this._template=h!==void 0?h:this.hasOwnProperty(JSCompiler_renameProperty("is",this))&&l(this.is)||Object.getPrototypeOf(this.prototype).constructor.template}return this._template}static set template(h){this._template=h}static get importPath(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_importPath",this))){const h=this.importMeta;if(h)this._importPath=Ye(h.url);else{const c=ie.import(this.is);this._importPath=c&&c.assetpath||Object.getPrototypeOf(this.prototype).constructor.importPath}}return this._importPath}constructor(){super(),this._template,this._importPath,this.rootPath,this.importPath,this.root,this.$}_initializeProperties(){this.constructor.finalize(),this.constructor._finalizeTemplate(this.localName),super._initializeProperties(),this.rootPath=ss,this.importPath=this.constructor.importPath;let h=s(this.constructor);if(h)for(let c in h){let d=h[c];if(this._canApplyPropertyDefault(c)){let p=typeof d.value=="function"?d.value.call(this):d.value;this._hasAccessor(c)?this._setPendingProperty(c,p,!0):this[c]=p}}}_canApplyPropertyDefault(h){return!this.hasOwnProperty(h)}static _processStyleText(h,c){return qe(h,c)}static _finalizeTemplate(h){const c=this.prototype._template;if(c&&!c.__polymerFinalized){c.__polymerFinalized=!0;const d=this.importPath,p=d?W(d):"";n(this,c,h,p),this.prototype._bindTemplate(c)}}connectedCallback(){window.ShadyCSS&&this._template&&window.ShadyCSS.styleElement(this),super.connectedCallback()}ready(){this._template&&(this.root=this._stampTemplate(this._template),this.$=this.root.$),super.ready()}_readyClients(){this._template&&(this.root=this._attachDom(this.root)),super._readyClients()}_attachDom(h){const c=u(this);if(c.attachShadow)return h?(c.shadowRoot||(c.attachShadow({mode:"open",shadyUpgradeFragment:h}),c.shadowRoot.appendChild(h),this.constructor._styleSheet&&(c.shadowRoot.adoptedStyleSheets=[this.constructor._styleSheet])),as&&window.ShadyDOM&&window.ShadyDOM.flushInitial(c.shadowRoot),c.shadowRoot):null;throw new Error("ShadowDOM not available. PolymerElement can create dom as children instead of in ShadowDOM by setting `this.root = this;` before `ready`.")}updateStyles(h){window.ShadyCSS&&window.ShadyCSS.styleSubtree(this,h)}resolveUrl(h,c){return!c&&this.importPath&&(c=W(this.importPath)),W(h,c)}static _parseTemplateContent(h,c,d){return c.dynamicFns=c.dynamicFns||this._properties,e._parseTemplateContent.call(this,h,c,d)}static _addTemplatePropertyEffect(h,c,d){return ti&&!(c in this._properties)&&!(d.info.part.signature&&d.info.part.signature.static)&&!d.info.part.hostProp&&!h.nestedTemplate&&console.warn(`Property '${c}' used in template but not declared in 'properties'; attribute will not be observed.`),e._addTemplatePropertyEffect.call(this,h,c,d)}}return a});const Lt=window.trustedTypes&&trustedTypes.createPolicy("polymer-html-literal",{createHTML:t=>t});class vi{constructor(e,s){bi(e,s);const r=s.reduce((i,n,l)=>i+yi(n)+e[l+1],e[0]);this.value=r.toString()}toString(){return this.value}}function yi(t){if(t instanceof vi)return t.value;throw new Error(`non-literal value passed to Polymer's htmlLiteral function: ${t}`)}function w1(t){if(t instanceof HTMLTemplateElement)return t.innerHTML;if(t instanceof vi)return yi(t);throw new Error(`non-template value passed to Polymer's html function: ${t}`)}const V=function(e,...s){bi(e,s);const r=document.createElement("template");let i=s.reduce((n,l,a)=>n+w1(l)+e[a+1],e[0]);return Lt&&(i=Lt.createHTML(i)),r.innerHTML=i,r},bi=(t,e)=>{if(!Array.isArray(t)||!Array.isArray(t.raw)||e.length!==t.length-1)throw new TypeError("Invalid call to the html template tag")};const Ce=we(HTMLElement);class D{constructor(){this._asyncModule=null,this._callback=null,this._timer=null}setConfig(e,s){this._asyncModule=e,this._callback=s,this._timer=this._asyncModule.run(()=>{this._timer=null,le.delete(this),this._callback()})}cancel(){this.isActive()&&(this._cancelAsync(),le.delete(this))}_cancelAsync(){this.isActive()&&(this._asyncModule.cancel(this._timer),this._timer=null)}flush(){this.isActive()&&(this.cancel(),this._callback())}isActive(){return this._timer!=null}static debounce(e,s,r){return e instanceof D?e._cancelAsync():e=new D,e.setConfig(s,r),e}}let le=new Set;const zi=function(t){le.add(t)},C1=function(){const t=!!le.size;return le.forEach(e=>{try{e.flush()}catch(s){setTimeout(()=>{throw s})}}),t};let et=typeof document.head.style.touchAction=="string",me="__polymerGestures",ue="__polymerGesturesHandled",De="__polymerGesturesTouchAction",Et=25,At=5,M1=2,H1=2500,wi=["mousedown","mousemove","mouseup","click"],P1=[0,1,4,2],S1=(function(){try{return new MouseEvent("test",{buttons:1}).buttons===1}catch{return!1}})();function tt(t){return wi.indexOf(t)>-1}let it=!1;(function(){try{let t=Object.defineProperty({},"passive",{get(){it=!0}});window.addEventListener("test",null,t),window.removeEventListener("test",null,t)}catch{}})();function Ci(t){if(!(tt(t)||t==="touchend")&&et&&it&&rs)return{passive:!0}}let Mi=navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/);const Re=[],x1={button:!0,input:!0,keygen:!0,meter:!0,output:!0,textarea:!0,progress:!0,select:!0},L1={button:!0,command:!0,fieldset:!0,input:!0,keygen:!0,optgroup:!0,option:!0,select:!0,textarea:!0};function E1(t){return x1[t.localName]||!1}function A1(t){let e=Array.prototype.slice.call(t.labels||[]);if(!e.length){e=[];try{let s=t.getRootNode();if(t.id){let r=s.querySelectorAll(`label[for = '${t.id}']`);for(let i=0;i<r.length;i++)e.push(r[i])}}catch{}}return e}let Vt=function(t){let e=t.sourceCapabilities;if(!(e&&!e.firesTouchEvents)&&(t[ue]={skip:!0},t.type==="click")){let s=!1,r=Me(t);for(let i=0;i<r.length;i++){if(r[i].nodeType===Node.ELEMENT_NODE){if(r[i].localName==="label")Re.push(r[i]);else if(E1(r[i])){let n=A1(r[i]);for(let l=0;l<n.length;l++)s=s||Re.indexOf(n[l])>-1}}if(r[i]===y.mouse.target)return}if(s)return;t.preventDefault(),t.stopPropagation()}};function Tt(t){let e=Mi?["click"]:wi;for(let s=0,r;s<e.length;s++)r=e[s],t?(Re.length=0,document.addEventListener(r,Vt,!0)):document.removeEventListener(r,Vt,!0)}function V1(t){y.mouse.mouseIgnoreJob||Tt(!0);let e=function(){Tt(),y.mouse.target=null,y.mouse.mouseIgnoreJob=null};y.mouse.target=Me(t)[0],y.mouse.mouseIgnoreJob=D.debounce(y.mouse.mouseIgnoreJob,Q.after(H1),e)}function I(t){let e=t.type;if(!tt(e))return!1;if(e==="mousemove"){let s=t.buttons===void 0?1:t.buttons;return t instanceof window.MouseEvent&&!S1&&(s=P1[t.which]||0),!!(s&1)}else return(t.button===void 0?0:t.button)===0}function T1(t){if(t.type==="click"){if(t.detail===0)return!0;let e=A(t);if(!e.nodeType||e.nodeType!==Node.ELEMENT_NODE)return!0;let s=e.getBoundingClientRect(),r=t.pageX,i=t.pageY;return!(r>=s.left&&r<=s.right&&i>=s.top&&i<=s.bottom)}return!1}let y={mouse:{target:null,mouseIgnoreJob:null},touch:{x:0,y:0,id:-1,scrollDecided:!1}};function O1(t){let e="auto",s=Me(t);for(let r=0,i;r<s.length;r++)if(i=s[r],i[De]){e=i[De];break}return e}function Hi(t,e,s){t.movefn=e,t.upfn=s,document.addEventListener("mousemove",e),document.addEventListener("mouseup",s)}function j(t){document.removeEventListener("mousemove",t.movefn),document.removeEventListener("mouseup",t.upfn),t.movefn=null,t.upfn=null}document.addEventListener("touchend",V1,it?{passive:!0}:!1);const Me=window.ShadyDOM&&window.ShadyDOM.noPatch?window.ShadyDOM.composedPath:t=>t.composedPath&&t.composedPath()||[],oe={},N=[];function k1(t,e){let s=document.elementFromPoint(t,e),r=s;for(;r&&r.shadowRoot&&!window.ShadyDOM;){let i=r;if(r=r.shadowRoot.elementFromPoint(t,e),i===r)break;r&&(s=r)}return s}function A(t){const e=Me(t);return e.length>0?e[0]:t.target}function Pi(t){let e,s=t.type,i=t.currentTarget[me];if(!i)return;let n=i[s];if(n){if(!t[ue]&&(t[ue]={},s.slice(0,5)==="touch")){t=t;let l=t.changedTouches[0];if(s==="touchstart"&&t.touches.length===1&&(y.touch.id=l.identifier),y.touch.id!==l.identifier)return;et||(s==="touchstart"||s==="touchmove")&&N1(t)}if(e=t[ue],!e.skip){for(let l=0,a;l<N.length;l++)a=N[l],n[a.name]&&!e[a.name]&&a.flow&&a.flow.start.indexOf(t.type)>-1&&a.reset&&a.reset();for(let l=0,a;l<N.length;l++)a=N[l],n[a.name]&&!e[a.name]&&(e[a.name]=!0,a[s](t))}}}function N1(t){let e=t.changedTouches[0],s=t.type;if(s==="touchstart")y.touch.x=e.clientX,y.touch.y=e.clientY,y.touch.scrollDecided=!1;else if(s==="touchmove"){if(y.touch.scrollDecided)return;y.touch.scrollDecided=!0;let r=O1(t),i=!1,n=Math.abs(y.touch.x-e.clientX),l=Math.abs(y.touch.y-e.clientY);t.cancelable&&(r==="none"?i=!0:r==="pan-x"?i=l>n:r==="pan-y"&&(i=n>l)),i?t.preventDefault():ge("track")}}function Si(t,e,s){return oe[e]?(D1(t,e,s),!0):!1}function I1(t,e,s){return oe[e]?(R1(t,e,s),!0):!1}function D1(t,e,s){let r=oe[e],i=r.deps,n=r.name,l=t[me];l||(t[me]=l={});for(let a=0,o,h;a<i.length;a++)o=i[a],!(Mi&&tt(o)&&o!=="click")&&(h=l[o],h||(l[o]=h={_count:0}),h._count===0&&t.addEventListener(o,Pi,Ci(o)),h[n]=(h[n]||0)+1,h._count=(h._count||0)+1);t.addEventListener(e,s),r.touchAction&&xi(t,r.touchAction)}function R1(t,e,s){let r=oe[e],i=r.deps,n=r.name,l=t[me];if(l)for(let a=0,o,h;a<i.length;a++)o=i[a],h=l[o],h&&h[n]&&(h[n]=(h[n]||1)-1,h._count=(h._count||1)-1,h._count===0&&t.removeEventListener(o,Pi,Ci(o)));t.removeEventListener(e,s)}function st(t){N.push(t);for(let e=0;e<t.emits.length;e++)oe[t.emits[e]]=t}function F1(t){for(let e=0,s;e<N.length;e++){s=N[e];for(let r=0,i;r<s.emits.length;r++)if(i=s.emits[r],i===t)return s}return null}function xi(t,e){et&&t instanceof HTMLElement&&E.run(()=>{t.style.touchAction=e}),t[De]=e}function rt(t,e,s){let r=new Event(e,{bubbles:!0,cancelable:!0,composed:!0});if(r.detail=s,u(t).dispatchEvent(r),r.defaultPrevented){let i=s.preventer||s.sourceEvent;i&&i.preventDefault&&i.preventDefault()}}function ge(t){let e=F1(t);e.info&&(e.info.prevent=!0)}st({name:"downup",deps:["mousedown","touchstart","touchend"],flow:{start:["mousedown","touchstart"],end:["mouseup","touchend"]},emits:["down","up"],info:{movefn:null,upfn:null},reset:function(){j(this.info)},mousedown:function(t){if(!I(t))return;let e=A(t),s=this,r=function(l){I(l)||(Y("up",e,l),j(s.info))},i=function(l){I(l)&&Y("up",e,l),j(s.info)};Hi(this.info,r,i),Y("down",e,t)},touchstart:function(t){Y("down",A(t),t.changedTouches[0],t)},touchend:function(t){Y("up",A(t),t.changedTouches[0],t)}});function Y(t,e,s,r){e&&rt(e,t,{x:s.clientX,y:s.clientY,sourceEvent:s,preventer:r,prevent:function(i){return ge(i)}})}st({name:"track",touchAction:"none",deps:["mousedown","touchstart","touchmove","touchend"],flow:{start:["mousedown","touchstart"],end:["mouseup","touchend"]},emits:["track"],info:{x:0,y:0,state:"start",started:!1,moves:[],addMove:function(t){this.moves.length>M1&&this.moves.shift(),this.moves.push(t)},movefn:null,upfn:null,prevent:!1},reset:function(){this.info.state="start",this.info.started=!1,this.info.moves=[],this.info.x=0,this.info.y=0,this.info.prevent=!1,j(this.info)},mousedown:function(t){if(!I(t))return;let e=A(t),s=this,r=function(l){let a=l.clientX,o=l.clientY;Ot(s.info,a,o)&&(s.info.state=s.info.started?l.type==="mouseup"?"end":"track":"start",s.info.state==="start"&&ge("tap"),s.info.addMove({x:a,y:o}),I(l)||(s.info.state="end",j(s.info)),e&&Le(s.info,e,l),s.info.started=!0)},i=function(l){s.info.started&&r(l),j(s.info)};Hi(this.info,r,i),this.info.x=t.clientX,this.info.y=t.clientY},touchstart:function(t){let e=t.changedTouches[0];this.info.x=e.clientX,this.info.y=e.clientY},touchmove:function(t){let e=A(t),s=t.changedTouches[0],r=s.clientX,i=s.clientY;Ot(this.info,r,i)&&(this.info.state==="start"&&ge("tap"),this.info.addMove({x:r,y:i}),Le(this.info,e,s),this.info.state="track",this.info.started=!0)},touchend:function(t){let e=A(t),s=t.changedTouches[0];this.info.started&&(this.info.state="end",this.info.addMove({x:s.clientX,y:s.clientY}),Le(this.info,e,s))}});function Ot(t,e,s){if(t.prevent)return!1;if(t.started)return!0;let r=Math.abs(t.x-e),i=Math.abs(t.y-s);return r>=At||i>=At}function Le(t,e,s){if(!e)return;let r=t.moves[t.moves.length-2],i=t.moves[t.moves.length-1],n=i.x-t.x,l=i.y-t.y,a,o=0;r&&(a=i.x-r.x,o=i.y-r.y),rt(e,"track",{state:t.state,x:s.clientX,y:s.clientY,dx:n,dy:l,ddx:a,ddy:o,sourceEvent:s,hover:function(){return k1(s.clientX,s.clientY)}})}st({name:"tap",deps:["mousedown","click","touchstart","touchend"],flow:{start:["mousedown","touchstart"],end:["click","touchend"]},emits:["tap"],info:{x:NaN,y:NaN,prevent:!1},reset:function(){this.info.x=NaN,this.info.y=NaN,this.info.prevent=!1},mousedown:function(t){I(t)&&(this.info.x=t.clientX,this.info.y=t.clientY)},click:function(t){I(t)&&kt(this.info,t)},touchstart:function(t){const e=t.changedTouches[0];this.info.x=e.clientX,this.info.y=e.clientY},touchend:function(t){kt(this.info,t.changedTouches[0],t)}});function kt(t,e,s){let r=Math.abs(e.clientX-t.x),i=Math.abs(e.clientY-t.y),n=A(s||e);!n||L1[n.localName]&&n.hasAttribute("disabled")||(isNaN(r)||isNaN(i)||r<=Et&&i<=Et||T1(e))&&(t.prevent||rt(n,"tap",{x:e.clientX,y:e.clientY,sourceEvent:e,preventer:s}))}const nt=H(t=>{class e extends t{_addEventListenerToNode(r,i,n){Si(r,i,n)||super._addEventListenerToNode(r,i,n)}_removeEventListenerFromNode(r,i,n){I1(r,i,n)||super._removeEventListenerFromNode(r,i,n)}}return e});const B1=/:host\(:dir\((ltr|rtl)\)\)/g,U1=':host([dir="$1"])',j1=/([\s\w-#\.\[\]\*]*):dir\((ltr|rtl)\)/g,K1=':host([dir="$2"]) $1',$1=/:dir\((?:ltr|rtl)\)/,Nt=!!(window.ShadyDOM&&window.ShadyDOM.inUse),Z=[];let ee=null,at="";function Li(){at=document.documentElement.getAttribute("dir")}function Ei(t){t.__autoDirOptOut||t.setAttribute("dir",at)}function Ai(){Li(),at=document.documentElement.getAttribute("dir");for(let t=0;t<Z.length;t++)Ei(Z[t])}function q1(){ee&&ee.takeRecords().length&&Ai()}const Y1=H(t=>{Nt||ee||(Li(),ee=new MutationObserver(Ai),ee.observe(document.documentElement,{attributes:!0,attributeFilter:["dir"]}));const e=ci(t);class s extends e{static _processStyleText(i,n){return i=e._processStyleText.call(this,i,n),!Nt&&$1.test(i)&&(i=this._replaceDirInCssText(i),this.__activateDir=!0),i}static _replaceDirInCssText(i){let n=i;return n=n.replace(B1,U1),n=n.replace(j1,K1),n}constructor(){super(),this.__autoDirOptOut=!1}ready(){super.ready(),this.__autoDirOptOut=this.hasAttribute("dir")}connectedCallback(){e.prototype.connectedCallback&&super.connectedCallback(),this.constructor.__activateDir&&(q1(),Z.push(this),Ei(this))}disconnectedCallback(){if(e.prototype.disconnectedCallback&&super.disconnectedCallback(),this.constructor.__activateDir){const i=Z.indexOf(this);i>-1&&Z.splice(i,1)}}}return s.__activateDir=!1,s});function It(){document.body.removeAttribute("unresolved")}document.readyState==="interactive"||document.readyState==="complete"?It():window.addEventListener("DOMContentLoaded",It);function J(t,e,s){return{index:t,removed:e,addedCount:s}}const Vi=0,Ti=1,Fe=2,Be=3;function J1(t,e,s,r,i,n){let l=n-i+1,a=s-e+1,o=new Array(l);for(let h=0;h<l;h++)o[h]=new Array(a),o[h][0]=h;for(let h=0;h<a;h++)o[0][h]=h;for(let h=1;h<l;h++)for(let c=1;c<a;c++)if(lt(t[e+c-1],r[i+h-1]))o[h][c]=o[h-1][c-1];else{let d=o[h-1][c]+1,p=o[h][c-1]+1;o[h][c]=d<p?d:p}return o}function G1(t){let e=t.length-1,s=t[0].length-1,r=t[e][s],i=[];for(;e>0||s>0;){if(e==0){i.push(Fe),s--;continue}if(s==0){i.push(Be),e--;continue}let n=t[e-1][s-1],l=t[e-1][s],a=t[e][s-1],o;l<a?o=l<n?l:n:o=a<n?a:n,o==n?(n==r?i.push(Vi):(i.push(Ti),r=n),e--,s--):o==l?(i.push(Be),e--,r=l):(i.push(Fe),s--,r=a)}return i.reverse(),i}function X1(t,e,s,r,i,n){let l=0,a=0,o,h=Math.min(s-e,n-i);if(e==0&&i==0&&(l=W1(t,r,h)),s==t.length&&n==r.length&&(a=Q1(t,r,h-l)),e+=l,i+=l,s-=a,n-=a,s-e==0&&n-i==0)return[];if(e==s){for(o=J(e,[],0);i<n;)o.removed.push(r[i++]);return[o]}else if(i==n)return[J(e,[],s-e)];let c=G1(J1(t,e,s,r,i,n));o=void 0;let d=[],p=e,f=i;for(let v=0;v<c.length;v++)switch(c[v]){case Vi:o&&(d.push(o),o=void 0),p++,f++;break;case Ti:o||(o=J(p,[],0)),o.addedCount++,p++,o.removed.push(r[f]),f++;break;case Fe:o||(o=J(p,[],0)),o.addedCount++,p++;break;case Be:o||(o=J(p,[],0)),o.removed.push(r[f]),f++;break}return o&&d.push(o),d}function W1(t,e,s){for(let r=0;r<s;r++)if(!lt(t[r],e[r]))return r;return s}function Q1(t,e,s){let r=t.length,i=e.length,n=0;for(;n<s&&lt(t[--r],e[--i]);)n++;return n}function Oi(t,e){return X1(t,0,t.length,e,0,e.length)}function lt(t,e){return t===e}function F(t){return t.localName==="slot"}let ve=class{static getFlattenedNodes(t){const e=u(t);if(F(t))return t=t,e.assignedNodes({flatten:!0});{const s=[];for(let r=0;r<e.childNodes.length;r++){const i=e.childNodes[r];if(F(i)){const n=i;s.push(...u(n).assignedNodes({flatten:!0}))}else s.push(i)}return s}}constructor(t,e){this._shadyChildrenObserver=null,this._nativeChildrenObserver=null,this._connected=!1,this._target=t,this.callback=e,this._effectiveNodes=[],this._observer=null,this._scheduled=!1,this._boundSchedule=()=>{this._schedule()},this.connect(),this._schedule()}connect(){F(this._target)?this._listenSlots([this._target]):u(this._target).children&&(this._listenSlots(u(this._target).children),window.ShadyDOM?this._shadyChildrenObserver=window.ShadyDOM.observeChildren(this._target,t=>{this._processMutations(t)}):(this._nativeChildrenObserver=new MutationObserver(t=>{this._processMutations(t)}),this._nativeChildrenObserver.observe(this._target,{childList:!0}))),this._connected=!0}disconnect(){F(this._target)?this._unlistenSlots([this._target]):u(this._target).children&&(this._unlistenSlots(u(this._target).children),window.ShadyDOM&&this._shadyChildrenObserver?(window.ShadyDOM.unobserveChildren(this._shadyChildrenObserver),this._shadyChildrenObserver=null):this._nativeChildrenObserver&&(this._nativeChildrenObserver.disconnect(),this._nativeChildrenObserver=null)),this._connected=!1}_schedule(){this._scheduled||(this._scheduled=!0,E.run(()=>this.flush()))}_processMutations(t){this._processSlotMutations(t),this.flush()}_processSlotMutations(t){if(t)for(let e=0;e<t.length;e++){let s=t[e];s.addedNodes&&this._listenSlots(s.addedNodes),s.removedNodes&&this._unlistenSlots(s.removedNodes)}}flush(){if(!this._connected)return!1;window.ShadyDOM&&ShadyDOM.flush(),this._nativeChildrenObserver?this._processSlotMutations(this._nativeChildrenObserver.takeRecords()):this._shadyChildrenObserver&&this._processSlotMutations(this._shadyChildrenObserver.takeRecords()),this._scheduled=!1;let t={target:this._target,addedNodes:[],removedNodes:[]},e=this.constructor.getFlattenedNodes(this._target),s=Oi(e,this._effectiveNodes);for(let i=0,n;i<s.length&&(n=s[i]);i++)for(let l=0,a;l<n.removed.length&&(a=n.removed[l]);l++)t.removedNodes.push(a);for(let i=0,n;i<s.length&&(n=s[i]);i++)for(let l=n.index;l<n.index+n.addedCount;l++)t.addedNodes.push(e[l]);this._effectiveNodes=e;let r=!1;return(t.addedNodes.length||t.removedNodes.length)&&(r=!0,this.callback.call(this._target,t)),r}_listenSlots(t){for(let e=0;e<t.length;e++){let s=t[e];F(s)&&s.addEventListener("slotchange",this._boundSchedule)}}_unlistenSlots(t){for(let e=0;e<t.length;e++){let s=t[e];F(s)&&s.removeEventListener("slotchange",this._boundSchedule)}}};const ki=function(){let t,e;do t=window.ShadyDOM&&ShadyDOM.flush(),window.ShadyCSS&&window.ShadyCSS.ScopingShim&&window.ShadyCSS.ScopingShim.flush(),e=C1();while(t||e)};const B=Element.prototype,Z1=B.matches||B.matchesSelector||B.mozMatchesSelector||B.msMatchesSelector||B.oMatchesSelector||B.webkitMatchesSelector,Ni=function(t,e){return Z1.call(t,e)};class m{constructor(e){window.ShadyDOM&&window.ShadyDOM.inUse&&window.ShadyDOM.patch(e),this.node=e}observeNodes(e){return new ve(this.node,e)}unobserveNodes(e){e.disconnect()}notifyObserver(){}deepContains(e){if(u(this.node).contains(e))return!0;let s=e,r=e.ownerDocument;for(;s&&s!==r&&s!==this.node;)s=u(s).parentNode||u(s).host;return s===this.node}getOwnerRoot(){return u(this.node).getRootNode()}getDistributedNodes(){return this.node.localName==="slot"?u(this.node).assignedNodes({flatten:!0}):[]}getDestinationInsertionPoints(){let e=[],s=u(this.node).assignedSlot;for(;s;)e.push(s),s=u(s).assignedSlot;return e}importNode(e,s){let r=this.node instanceof Document?this.node:this.node.ownerDocument;return u(r).importNode(e,s)}getEffectiveChildNodes(){return ve.getFlattenedNodes(this.node)}queryDistributedElements(e){let s=this.getEffectiveChildNodes(),r=[];for(let i=0,n=s.length,l;i<n&&(l=s[i]);i++)l.nodeType===Node.ELEMENT_NODE&&Ni(l,e)&&r.push(l);return r}get activeElement(){let e=this.node;return e._activeElement!==void 0?e._activeElement:e.activeElement}}function er(t,e){for(let s=0;s<e.length;s++){let r=e[s];t[r]=function(){return this.node[r].apply(this.node,arguments)}}}function Dt(t,e){for(let s=0;s<e.length;s++){let r=e[s];Object.defineProperty(t,r,{get:function(){return this.node[r]},configurable:!0})}}function tr(t,e){for(let s=0;s<e.length;s++){let r=e[s];Object.defineProperty(t,r,{get:function(){return this.node[r]},set:function(i){this.node[r]=i},configurable:!0})}}class Ue{constructor(e){this.event=e}get rootTarget(){return this.path[0]}get localTarget(){return this.event.target}get path(){return this.event.composedPath()}}m.prototype.cloneNode;m.prototype.appendChild;m.prototype.insertBefore;m.prototype.removeChild;m.prototype.replaceChild;m.prototype.setAttribute;m.prototype.removeAttribute;m.prototype.querySelector;m.prototype.querySelectorAll;m.prototype.parentNode;m.prototype.firstChild;m.prototype.lastChild;m.prototype.nextSibling;m.prototype.previousSibling;m.prototype.firstElementChild;m.prototype.lastElementChild;m.prototype.nextElementSibling;m.prototype.previousElementSibling;m.prototype.childNodes;m.prototype.children;m.prototype.classList;m.prototype.textContent;m.prototype.innerHTML;let je=m;if(window.ShadyDOM&&window.ShadyDOM.inUse&&window.ShadyDOM.noPatch&&window.ShadyDOM.Wrapper){class t extends window.ShadyDOM.Wrapper{}Object.getOwnPropertyNames(m.prototype).forEach(e=>{e!="activeElement"&&(t.prototype[e]=m.prototype[e])}),Dt(t.prototype,["classList"]),je=t,Object.defineProperties(Ue.prototype,{localTarget:{get(){const e=this.event.currentTarget,s=e&&g(e).getOwnerRoot(),r=this.path;for(let i=0;i<r.length;i++){const n=r[i];if(g(n).getOwnerRoot()===s)return n}},configurable:!0},path:{get(){return window.ShadyDOM.composedPath(this.event)},configurable:!0}})}else er(m.prototype,["cloneNode","appendChild","insertBefore","removeChild","replaceChild","setAttribute","removeAttribute","querySelector","querySelectorAll","attachShadow"]),Dt(m.prototype,["parentNode","firstChild","lastChild","nextSibling","previousSibling","firstElementChild","lastElementChild","nextElementSibling","previousElementSibling","childNodes","children","classList","shadowRoot"]),tr(m.prototype,["textContent","innerHTML","className"]);const g=function(t){if(t=t||document,t instanceof je||t instanceof Ue)return t;let e=t.__domApi;return e||(t instanceof Event?e=new Ue(t):e=new je(t),t.__domApi=e),e};const Ee=window.ShadyDOM,Rt=window.ShadyCSS;function Ft(t,e){return u(t).getRootNode()===e}function ir(t,e=!1){if(!Ee||!Rt||!Ee.handlesDynamicScoping)return null;const s=Rt.ScopingShim;if(!s)return null;const r=s.scopeForNode(t),i=u(t).getRootNode(),n=l=>{if(!Ft(l,i))return;const a=Array.from(Ee.nativeMethods.querySelectorAll.call(l,"*"));a.push(l);for(let o=0;o<a.length;o++){const h=a[o];if(!Ft(h,i))continue;const c=s.currentScopeForNode(h);c!==r&&(c!==""&&s.unscopeNode(h,c),s.scopeNode(h,r))}};if(n(t),e){const l=new MutationObserver(a=>{for(let o=0;o<a.length;o++){const h=a[o];for(let c=0;c<h.addedNodes.length;c++){const d=h.addedNodes[c];d.nodeType===Node.ELEMENT_NODE&&n(d)}}});return l.observe(t,{childList:!0,subtree:!0}),l}else return null}const Ae="disable-upgrade",Ii=t=>{for(;t;){const e=Object.getOwnPropertyDescriptor(t,"observedAttributes");if(e)return e.get;t=Object.getPrototypeOf(t.prototype).constructor}return()=>[]};H(t=>{const e=we(t);let s=Ii(e);class r extends e{constructor(){super(),this.__isUpgradeDisabled}static get observedAttributes(){return s.call(this).concat(Ae)}_initializeProperties(){this.hasAttribute(Ae)?this.__isUpgradeDisabled=!0:super._initializeProperties()}_enableProperties(){this.__isUpgradeDisabled||super._enableProperties()}_canApplyPropertyDefault(n){return super._canApplyPropertyDefault(n)&&!(this.__isUpgradeDisabled&&this._isPropertyPending(n))}attributeChangedCallback(n,l,a,o){n==Ae?this.__isUpgradeDisabled&&a==null&&(super._initializeProperties(),this.__isUpgradeDisabled=!1,u(this).isConnected&&super.connectedCallback()):super.attributeChangedCallback(n,l,a,o)}connectedCallback(){this.__isUpgradeDisabled||super.connectedCallback()}disconnectedCallback(){this.__isUpgradeDisabled||super.disconnectedCallback()}}return r});const pe="disable-upgrade";let sr=window.ShadyCSS;const ot=H(t=>{const e=nt(we(t)),s=Ie?e:Y1(e),r=Ii(s),i={x:"pan-x",y:"pan-y",none:"none",all:"auto"};class n extends s{constructor(){super(),this.isAttached,this.__boundListeners,this._debouncers,this.__isUpgradeDisabled,this.__needsAttributesAtConnected,this._legacyForceObservedAttributes}static get importMeta(){return this.prototype.importMeta}created(){}__attributeReaction(a,o,h){(this.__dataAttributes&&this.__dataAttributes[a]||a===pe)&&this.attributeChangedCallback(a,o,h,null)}setAttribute(a,o){if(ce&&!this._legacyForceObservedAttributes){const h=this.getAttribute(a);super.setAttribute(a,o),this.__attributeReaction(a,h,String(o))}else super.setAttribute(a,o)}removeAttribute(a){if(ce&&!this._legacyForceObservedAttributes){const o=this.getAttribute(a);super.removeAttribute(a),this.__attributeReaction(a,o,null)}else super.removeAttribute(a)}static get observedAttributes(){return ce&&!this.prototype._legacyForceObservedAttributes?(this.hasOwnProperty(JSCompiler_renameProperty("__observedAttributes",this))||(this.__observedAttributes=[],this.prototype,void 0),this.__observedAttributes):r.call(this).concat(pe)}_enableProperties(){this.__isUpgradeDisabled||super._enableProperties()}_canApplyPropertyDefault(a){return super._canApplyPropertyDefault(a)&&!(this.__isUpgradeDisabled&&this._isPropertyPending(a))}connectedCallback(){this.__needsAttributesAtConnected&&this._takeAttributes(),this.__isUpgradeDisabled||(super.connectedCallback(),this.isAttached=!0,this.attached())}attached(){}disconnectedCallback(){this.__isUpgradeDisabled||(super.disconnectedCallback(),this.isAttached=!1,this.detached())}detached(){}attributeChangedCallback(a,o,h,c){o!==h&&(a==pe?this.__isUpgradeDisabled&&h==null&&(this._initializeProperties(),this.__isUpgradeDisabled=!1,u(this).isConnected&&this.connectedCallback()):(super.attributeChangedCallback(a,o,h,c),this.attributeChanged(a,o,h)))}attributeChanged(a,o,h){}_initializeProperties(){if(te&&this.hasAttribute(pe))this.__isUpgradeDisabled=!0;else{let a=Object.getPrototypeOf(this);a.hasOwnProperty(JSCompiler_renameProperty("__hasRegisterFinished",a))||(this._registered(),a.__hasRegisterFinished=!0),super._initializeProperties(),this.root=this,this.created(),ce&&!this._legacyForceObservedAttributes&&(this.hasAttributes()?this._takeAttributes():this.parentNode||(this.__needsAttributesAtConnected=!0)),this._applyListeners()}}_takeAttributes(){const a=this.attributes;for(let o=0,h=a.length;o<h;o++){const c=a[o];this.__attributeReaction(c.name,null,c.value)}}_registered(){}ready(){this._ensureAttributes(),super.ready()}_ensureAttributes(){}_applyListeners(){}serialize(a){return this._serializeValue(a)}deserialize(a,o){return this._deserializeValue(a,o)}reflectPropertyToAttribute(a,o,h){this._propertyToAttribute(a,o,h)}serializeValueToAttribute(a,o,h){this._valueToNodeAttribute(h||this,a,o)}extend(a,o){if(!(a&&o))return a||o;let h=Object.getOwnPropertyNames(o);for(let c=0,d;c<h.length&&(d=h[c]);c++){let p=Object.getOwnPropertyDescriptor(o,d);p&&Object.defineProperty(a,d,p)}return a}mixin(a,o){for(let h in o)a[h]=o[h];return a}chainObject(a,o){return a&&o&&a!==o&&(a.__proto__=o),a}instanceTemplate(a){let o=this.constructor._contentForTemplate(a);return document.importNode(o,!0)}fire(a,o,h){h=h||{},o=o??{};let c=new Event(a,{bubbles:h.bubbles===void 0?!0:h.bubbles,cancelable:!!h.cancelable,composed:h.composed===void 0?!0:h.composed});c.detail=o;let d=h.node||this;return u(d).dispatchEvent(c),c}listen(a,o,h){a=a||this;let c=this.__boundListeners||(this.__boundListeners=new WeakMap),d=c.get(a);d||(d={},c.set(a,d));let p=o+h;d[p]||(d[p]=this._addMethodEventListenerToNode(a,o,h,this))}unlisten(a,o,h){a=a||this;let c=this.__boundListeners&&this.__boundListeners.get(a),d=o+h,p=c&&c[d];p&&(this._removeEventListenerFromNode(a,o,p),c[d]=null)}setScrollDirection(a,o){xi(o||this,i[a]||"auto")}$$(a){return this.root.querySelector(a)}get domHost(){let a=u(this).getRootNode();return a instanceof DocumentFragment?a.host:a}distributeContent(){const o=g(this);window.ShadyDOM&&o.shadowRoot&&ShadyDOM.flush()}getEffectiveChildNodes(){return g(this).getEffectiveChildNodes()}queryDistributedElements(a){return g(this).queryDistributedElements(a)}getEffectiveChildren(){return this.getEffectiveChildNodes().filter(function(o){return o.nodeType===Node.ELEMENT_NODE})}getEffectiveTextContent(){let a=this.getEffectiveChildNodes(),o=[];for(let h=0,c;c=a[h];h++)c.nodeType!==Node.COMMENT_NODE&&o.push(c.textContent);return o.join("")}queryEffectiveChildren(a){let o=this.queryDistributedElements(a);return o&&o[0]}queryAllEffectiveChildren(a){return this.queryDistributedElements(a)}getContentChildNodes(a){let o=this.root.querySelector(a||"slot");return o?g(o).getDistributedNodes():[]}getContentChildren(a){return this.getContentChildNodes(a).filter(function(h){return h.nodeType===Node.ELEMENT_NODE})}isLightDescendant(a){const o=this;return o!==a&&u(o).contains(a)&&u(o).getRootNode()===u(a).getRootNode()}isLocalDescendant(a){return this.root===u(a).getRootNode()}scopeSubtree(a,o=!1){return ir(a,o)}getComputedStyleValue(a){return sr.getComputedStyleValue(this,a)}debounce(a,o,h){return this._debouncers=this._debouncers||{},this._debouncers[a]=D.debounce(this._debouncers[a],h>0?Q.after(h):E,o.bind(this))}isDebouncerActive(a){this._debouncers=this._debouncers||{};let o=this._debouncers[a];return!!(o&&o.isActive())}flushDebouncer(a){this._debouncers=this._debouncers||{};let o=this._debouncers[a];o&&o.flush()}cancelDebouncer(a){this._debouncers=this._debouncers||{};let o=this._debouncers[a];o&&o.cancel()}async(a,o){return o>0?Q.run(a.bind(this),o):~E.run(a.bind(this))}cancelAsync(a){a<0?E.cancel(~a):Q.cancel(a)}create(a,o){let h=document.createElement(a);if(o)if(h.setProperties)h.setProperties(o);else for(let c in o)h[c]=o[c];return h}elementMatches(a,o){return Ni(o||this,a)}toggleAttribute(a,o){let h=this;return arguments.length===3&&(h=arguments[2]),arguments.length==1&&(o=!h.hasAttribute(a)),o?(u(h).setAttribute(a,""),!0):(u(h).removeAttribute(a),!1)}toggleClass(a,o,h){h=h||this,arguments.length==1&&(o=!h.classList.contains(a)),o?h.classList.add(a):h.classList.remove(a)}transform(a,o){o=o||this,o.style.webkitTransform=a,o.style.transform=a}translate3d(a,o,h,c){c=c||this,this.transform("translate3d("+a+","+o+","+h+")",c)}arrayDelete(a,o){let h;if(Array.isArray(a)){if(h=a.indexOf(o),h>=0)return a.splice(h,1)}else if(h=b(this,a).indexOf(o),h>=0)return this.splice(a,h,1);return null}_logger(a,o){switch(Array.isArray(o)&&o.length===1&&Array.isArray(o[0])&&(o=o[0]),a){case"log":case"warn":case"error":console[a](...o)}}_log(...a){this._logger("log",a)}_warn(...a){this._logger("warn",a)}_error(...a){this._logger("error",a)}_logf(a,...o){return["[%s::%s]",this.is,a,...o]}}return n.prototype.is="",n});const rr={attached:!0,detached:!0,ready:!0,created:!0,beforeRegister:!0,registered:!0,attributeChanged:!0,listeners:!0,hostAttributes:!0},Di={attached:!0,detached:!0,ready:!0,created:!0,beforeRegister:!0,registered:!0,attributeChanged:!0,behaviors:!0,_noAccessors:!0},nr=Object.assign({listeners:!0,hostAttributes:!0,properties:!0,observers:!0},Di);function ar(t,e,s){const r=t._noAccessors,i=Object.getOwnPropertyNames(t);for(let n=0;n<i.length;n++){let l=i[n];if(!(l in s))if(r)e[l]=t[l];else{let a=Object.getOwnPropertyDescriptor(t,l);a&&(a.configurable=!0,Object.defineProperty(e,l,a))}}}function lr(t,e){return Bi({},ot(e),t)}function or(t,e,s){for(let r=0;r<e.length;r++)Ri(t,e[r],s,nr)}function Ri(t,e,s,r){ar(e,t,r);for(let i in rr)e[i]&&(s[i]=s[i]||[],s[i].push(e[i]))}function Fi(t,e,s){e=e||[];for(let r=t.length-1;r>=0;r--){let i=t[r];i?Array.isArray(i)?Fi(i,e):e.indexOf(i)<0&&(!s||s.indexOf(i)<0)&&e.unshift(i):console.warn("behavior is null, check for missing or 404 import")}return e}function Bt(t,e){for(const s in e){const r=t[s],i=e[s];!("value"in i)&&r&&"value"in r?t[s]=Object.assign({value:r.value},i):t[s]=i}}const Ut=ot(HTMLElement);function Bi(t,e,s){let r;const i={};class n extends e{static _finalizeClass(){if(!this.hasOwnProperty(JSCompiler_renameProperty("generatedFrom",this)))e._finalizeClass.call(this);else{if(r)for(let o=0,h;o<r.length;o++)h=r[o],h.properties&&this.createProperties(h.properties),h.observers&&this.createObservers(h.observers,h.properties);t.properties&&this.createProperties(t.properties),t.observers&&this.createObservers(t.observers,t.properties),this._prepareTemplate()}}static get properties(){const o={};if(r)for(let h=0;h<r.length;h++)Bt(o,r[h].properties);return Bt(o,t.properties),o}static get observers(){let o=[];if(r)for(let h=0,c;h<r.length;h++)c=r[h],c.observers&&(o=o.concat(c.observers));return t.observers&&(o=o.concat(t.observers)),o}created(){super.created();const o=i.created;if(o)for(let h=0;h<o.length;h++)o[h].call(this)}_registered(){const o=n.prototype;if(!o.hasOwnProperty(JSCompiler_renameProperty("__hasRegisterFinished",o))){o.__hasRegisterFinished=!0,super._registered(),te&&l(o);const h=Object.getPrototypeOf(this);let c=i.beforeRegister;if(c)for(let d=0;d<c.length;d++)c[d].call(h);if(c=i.registered,c)for(let d=0;d<c.length;d++)c[d].call(h)}}_applyListeners(){super._applyListeners();const o=i.listeners;if(o)for(let h=0;h<o.length;h++){const c=o[h];if(c)for(let d in c)this._addMethodEventListenerToNode(this,d,c[d])}}_ensureAttributes(){const o=i.hostAttributes;if(o)for(let h=o.length-1;h>=0;h--){const c=o[h];for(let d in c)this._ensureAttribute(d,c[d])}super._ensureAttributes()}ready(){super.ready();let o=i.ready;if(o)for(let h=0;h<o.length;h++)o[h].call(this)}attached(){super.attached();let o=i.attached;if(o)for(let h=0;h<o.length;h++)o[h].call(this)}detached(){super.detached();let o=i.detached;if(o)for(let h=0;h<o.length;h++)o[h].call(this)}attributeChanged(o,h,c){super.attributeChanged();let d=i.attributeChanged;if(d)for(let p=0;p<d.length;p++)d[p].call(this,o,h,c)}}if(s){Array.isArray(s)||(s=[s]);let a=e.prototype.behaviors;r=Fi(s,null,a),n.prototype.behaviors=a?a.concat(s):r}const l=a=>{r&&or(a,r,i),Ri(a,t,i,Di)};return te||l(n.prototype),n.generatedFrom=t,n}const hr=function(t,e){t||console.warn("Polymer.Class requires `info` argument");let s=e?e(Ut):Ut;return s=Bi(t,s,t.behaviors),s.is=s.prototype.is=t.is,s};const T=function(t){let e;return typeof t=="function"?e=t:e=T.Class(t),t._legacyForceObservedAttributes&&(e.prototype._legacyForceObservedAttributes=t._legacyForceObservedAttributes),customElements.define(e.is,e),e};T.Class=hr;function ht(t,e,s,r,i){let n;i&&(n=typeof s=="object"&&s!==null,n&&(r=t.__dataTemp[e]));let l=r!==s&&(r===r||s===s);return n&&l&&(t.__dataTemp[e]=s),l}const ct=H(t=>{class e extends t{_shouldPropertyChange(r,i,n){return ht(this,r,i,n,!0)}}return e}),Ui=H(t=>{class e extends t{static get properties(){return{mutableData:Boolean}}_shouldPropertyChange(r,i,n){return ht(this,r,i,n,this.mutableData)}}return e});ct._mutablePropertyChange=ht;let Ke=null;function $e(){return Ke}$e.prototype=Object.create(HTMLTemplateElement.prototype,{constructor:{value:$e,writable:!0}});const ji=ze($e),cr=ct(ji);function dr(t,e){Ke=t,Object.setPrototypeOf(t,e.prototype),new e,Ke=null}const pr=ze(class{});function Ki(t,e){for(let s=0;s<e.length;s++){let r=e[s];if(!!t!=!!r.__hideTemplateChildren__)if(r.nodeType===Node.TEXT_NODE)t?(r.__polymerTextContent__=r.textContent,r.textContent=""):r.textContent=r.__polymerTextContent__;else if(r.localName==="slot")if(t)r.__polymerReplaced__=document.createComment("hidden-slot"),u(u(r).parentNode).replaceChild(r.__polymerReplaced__,r);else{const i=r.__polymerReplaced__;i&&u(u(i).parentNode).replaceChild(r,i)}else r.style&&(t?(r.__polymerDisplay__=r.style.display,r.style.display="none"):r.style.display=r.__polymerDisplay__);r.__hideTemplateChildren__=t,r._showHideChildren&&r._showHideChildren(t)}}class O extends pr{constructor(e){super(),this._configureProperties(e),this.root=this._stampTemplate(this.__dataHost);let s=[];this.children=s;for(let i=this.root.firstChild;i;i=i.nextSibling)s.push(i),i.__templatizeInstance=this;this.__templatizeOwner&&this.__templatizeOwner.__hideTemplateChildren__&&this._showHideChildren(!0);let r=this.__templatizeOptions;(e&&r.instanceProps||!r.instanceProps)&&this._enableProperties()}_configureProperties(e){if(this.__templatizeOptions.forwardHostProp)for(let r in this.__hostProps)this._setPendingProperty(r,this.__dataHost["_host_"+r]);for(let r in e)this._setPendingProperty(r,e[r])}forwardHostProp(e,s){this._setPendingPropertyOrPath(e,s,!1,!0)&&this.__dataHost._enqueueClient(this)}_addEventListenerToNode(e,s,r){if(this._methodHost&&this.__templatizeOptions.parentModel)this._methodHost._addEventListenerToNode(e,s,i=>{i.model=this,r(i)});else{let i=this.__dataHost.__dataHost;i&&i._addEventListenerToNode(e,s,r)}}_showHideChildren(e){Ki(e,this.children)}_setUnmanagedPropertyToNode(e,s,r){e.__hideTemplateChildren__&&e.nodeType==Node.TEXT_NODE&&s=="textContent"?e.__polymerTextContent__=r:super._setUnmanagedPropertyToNode(e,s,r)}get parentModel(){let e=this.__parentModel;if(!e){let s;e=this;do e=e.__dataHost.__dataHost;while((s=e.__templatizeOptions)&&!s.parentModel);this.__parentModel=e}return e}dispatchEvent(e){return!0}}O.prototype.__dataHost;O.prototype.__templatizeOptions;O.prototype._methodHost;O.prototype.__templatizeOwner;O.prototype.__hostProps;const ur=ct(O);function jt(t){let e=t.__dataHost;return e&&e._methodHost||e}function fr(t,e,s){let r=s.mutableData?ur:O;ye.mixin&&(r=ye.mixin(r));let i=class extends r{};return i.prototype.__templatizeOptions=s,i.prototype._bindTemplate(t),gr(i,t,e,s),i}function _r(t,e,s,r){let i=s.forwardHostProp;if(i&&e.hasHostProps){const n=t.localName=="template";let l=e.templatizeTemplateClass;if(!l){if(n){let o=s.mutableData?cr:ji;class h extends o{}l=e.templatizeTemplateClass=h}else{const o=t.constructor;class h extends o{}l=e.templatizeTemplateClass=h}let a=e.hostProps;for(let o in a)l.prototype._addPropertyEffect("_host_"+o,l.prototype.PROPERTY_EFFECT_TYPES.PROPAGATE,{fn:mr(o,i)}),l.prototype._createNotifyingProperty("_host_"+o);ti&&r&&br(e,s,r)}if(t.__dataProto&&Object.assign(t.__data,t.__dataProto),n)dr(t,l),t.__dataTemp={},t.__dataPending=null,t.__dataOld=null,t._enableProperties();else{Object.setPrototypeOf(t,l.prototype);const a=e.hostProps;for(let o in a)if(o="_host_"+o,o in t){const h=t[o];delete t[o],t.__data[o]=h}}}}function mr(t,e){return function(r,i,n){e.call(r.__templatizeOwner,i.substring(6),n[i])}}function gr(t,e,s,r){let i=s.hostProps||{};for(let n in r.instanceProps){delete i[n];let l=r.notifyInstanceProp;l&&t.prototype._addPropertyEffect(n,t.prototype.PROPERTY_EFFECT_TYPES.NOTIFY,{fn:vr(n,l)})}if(r.forwardHostProp&&e.__dataHost)for(let n in i)s.hasHostProps||(s.hasHostProps=!0),t.prototype._addPropertyEffect(n,t.prototype.PROPERTY_EFFECT_TYPES.NOTIFY,{fn:yr()})}function vr(t,e){return function(r,i,n){e.call(r.__templatizeOwner,r,i,n[i])}}function yr(){return function(e,s,r){e.__dataHost._setPendingPropertyOrPath("_host_"+s,r[s],!0,!0)}}function ye(t,e,s){if(K&&!jt(t))throw new Error("strictTemplatePolicy: template owner not trusted");if(s=s||{},t.__templatizeOwner)throw new Error("A <template> can only be templatized once");t.__templatizeOwner=e;let i=(e?e.constructor:O)._parseTemplate(t),n=i.templatizeInstanceClass;n||(n=fr(t,i,s),i.templatizeInstanceClass=n);const l=jt(t);_r(t,i,s,l);let a=class extends n{};return a.prototype._methodHost=l,a.prototype.__dataHost=t,a.prototype.__templatizeOwner=e,a.prototype.__hostProps=i.hostProps,a=a,a}function br(t,e,s){const r=s.constructor._properties,{propertyEffects:i}=t,{instanceProps:n}=e;for(let l in i)if(!r[l]&&!(n&&n[l])){const a=i[l];for(let o=0;o<a.length;o++){const{part:h}=a[o].info;if(!(h.signature&&h.signature.static)){console.warn(`Property '${l}' used in template but not declared in 'properties'; attribute will not be observed.`);break}}}}function zr(t,e){let s;for(;e;)if(s=e.__dataHost?e:e.__templatizeInstance)if(s.__dataHost!=t)e=s.__dataHost;else return s;else e=u(e).parentNode;return null}let Kt=!1;function dt(){if(te&&!ei){if(!Kt){Kt=!0;const t=document.createElement("style");t.textContent="dom-bind,dom-if,dom-repeat{display:none;}",document.head.appendChild(t)}return!0}return!1}const wr=nt(Ui(ze(HTMLElement)));class Cr extends wr{static get observedAttributes(){return["mutable-data"]}constructor(){if(super(),K)throw new Error("strictTemplatePolicy: dom-bind not allowed");this.root=null,this.$=null,this.__children=null}attributeChangedCallback(e,s,r,i){this.mutableData=!0}connectedCallback(){dt()||(this.style.display="none"),this.render()}disconnectedCallback(){this.__removeChildren()}__insertChildren(){u(u(this).parentNode).insertBefore(this.root,this)}__removeChildren(){if(this.__children)for(let e=0;e<this.__children.length;e++)this.root.appendChild(this.__children[e])}render(){let e;if(!this.__children){if(e=e||this.querySelector("template"),!e){let s=new MutationObserver(()=>{if(e=this.querySelector("template"),e)s.disconnect(),this.render();else throw new Error("dom-bind requires a <template> child")});s.observe(this,{childList:!0});return}this.root=this._stampTemplate(e),this.$=this.root.$,this.__children=[];for(let s=this.root.firstChild;s;s=s.nextSibling)this.__children[this.__children.length]=s;this._enableProperties()}this.__insertChildren(),this.dispatchEvent(new CustomEvent("dom-change",{bubbles:!0,composed:!0}))}}customElements.define("dom-bind",Cr);const Mr=Ui(Ce);class $t extends Mr{static get is(){return"dom-repeat"}static get template(){return null}static get properties(){return{items:{type:Array},as:{type:String,value:"item"},indexAs:{type:String,value:"index"},itemsIndexAs:{type:String,value:"itemsIndex"},sort:{type:Function,observer:"__sortChanged"},filter:{type:Function,observer:"__filterChanged"},observe:{type:String,observer:"__observeChanged"},delay:Number,renderedItemCount:{type:Number,notify:!Te,readOnly:!0},initialCount:{type:Number},targetFramerate:{type:Number,value:20},_targetFrameTime:{type:Number,computed:"__computeFrameTime(targetFramerate)"},notifyDomChange:{type:Boolean},reuseChunkedInstances:{type:Boolean}}}static get observers(){return["__itemsChanged(items.*)"]}constructor(){super(),this.__instances=[],this.__renderDebouncer=null,this.__itemsIdxToInstIdx={},this.__chunkCount=null,this.__renderStartTime=null,this.__itemsArrayChanged=!1,this.__shouldMeasureChunk=!1,this.__shouldContinueChunking=!1,this.__chunkingId=0,this.__sortFn=null,this.__filterFn=null,this.__observePaths=null,this.__ctor=null,this.__isDetached=!0,this.template=null,this._templateInfo}disconnectedCallback(){super.disconnectedCallback(),this.__isDetached=!0;for(let e=0;e<this.__instances.length;e++)this.__detachInstance(e);this.__chunkingId&&cancelAnimationFrame(this.__chunkingId)}connectedCallback(){if(super.connectedCallback(),dt()||(this.style.display="none"),this.__isDetached){this.__isDetached=!1;let e=u(u(this).parentNode);for(let s=0;s<this.__instances.length;s++)this.__attachInstance(s,e);this.__chunkingId&&this.__render()}}__ensureTemplatized(){if(!this.__ctor){const e=this;let s=this.template=e._templateInfo?e:this.querySelector("template");if(!s){let i=new MutationObserver(()=>{if(this.querySelector("template"))i.disconnect(),this.__render();else throw new Error("dom-repeat requires a <template> child")});return i.observe(this,{childList:!0}),!1}let r={};r[this.as]=!0,r[this.indexAs]=!0,r[this.itemsIndexAs]=!0,this.__ctor=ye(s,this,{mutableData:this.mutableData,parentModel:!0,instanceProps:r,forwardHostProp:function(i,n){let l=this.__instances;for(let a=0,o;a<l.length&&(o=l[a]);a++)o.forwardHostProp(i,n)},notifyInstanceProp:function(i,n,l){if(bs(this.as,n)){let a=i[this.itemsIndexAs];n==this.as&&(this.items[a]=l);let o=re(this.as,`${JSCompiler_renameProperty("items",this)}.${a}`,n);this.notifyPath(o,l)}}})}return!0}__getMethodHost(){return this.__dataHost._methodHost||this.__dataHost}__functionFromPropertyValue(e){if(typeof e=="string"){let s=e,r=this.__getMethodHost();return function(){return r[s].apply(r,arguments)}}return e}__sortChanged(e){this.__sortFn=this.__functionFromPropertyValue(e),this.items&&this.__debounceRender(this.__render)}__filterChanged(e){this.__filterFn=this.__functionFromPropertyValue(e),this.items&&this.__debounceRender(this.__render)}__computeFrameTime(e){return Math.ceil(1e3/e)}__observeChanged(){this.__observePaths=this.observe&&this.observe.replace(".*",".").split(" ")}__handleObservedPaths(e){if(this.__sortFn||this.__filterFn){if(!e)this.__debounceRender(this.__render,this.delay);else if(this.__observePaths){let s=this.__observePaths;for(let r=0;r<s.length;r++)e.indexOf(s[r])===0&&this.__debounceRender(this.__render,this.delay)}}}__itemsChanged(e){this.items&&!Array.isArray(this.items)&&console.warn("dom-repeat expected array for `items`, found",this.items),this.__handleItemPath(e.path,e.value)||(e.path==="items"&&(this.__itemsArrayChanged=!0),this.__debounceRender(this.__render))}__debounceRender(e,s=0){this.__renderDebouncer=D.debounce(this.__renderDebouncer,s>0?Q.after(s):E,e.bind(this)),zi(this.__renderDebouncer)}render(){this.__debounceRender(this.__render),ki()}__render(){if(!this.__ensureTemplatized())return;let e=this.items||[];const s=this.__sortAndFilterItems(e),r=this.__calculateLimit(s.length);this.__updateInstances(e,r,s),this.initialCount&&(this.__shouldMeasureChunk||this.__shouldContinueChunking)&&(cancelAnimationFrame(this.__chunkingId),this.__chunkingId=requestAnimationFrame(()=>{this.__chunkingId=null,this.__continueChunking()})),this._setRenderedItemCount(this.__instances.length),(!Te||this.notifyDomChange)&&this.dispatchEvent(new CustomEvent("dom-change",{bubbles:!0,composed:!0}))}__sortAndFilterItems(e){let s=new Array(e.length);for(let r=0;r<e.length;r++)s[r]=r;return this.__filterFn&&(s=s.filter((r,i,n)=>this.__filterFn(e[r],i,n))),this.__sortFn&&s.sort((r,i)=>this.__sortFn(e[r],e[i])),s}__calculateLimit(e){let s=e;const r=this.__instances.length;if(this.initialCount){let i;!this.__chunkCount||this.__itemsArrayChanged&&!this.reuseChunkedInstances?(s=Math.min(e,this.initialCount),i=Math.max(s-r,0),this.__chunkCount=i||1):(i=Math.min(Math.max(e-r,0),this.__chunkCount),s=Math.min(r+i,e)),this.__shouldMeasureChunk=i===this.__chunkCount,this.__shouldContinueChunking=s<e,this.__renderStartTime=performance.now()}return this.__itemsArrayChanged=!1,s}__continueChunking(){if(this.__shouldMeasureChunk){const e=performance.now()-this.__renderStartTime,s=this._targetFrameTime/e;this.__chunkCount=Math.round(this.__chunkCount*s)||1}this.__shouldContinueChunking&&this.__debounceRender(this.__render)}__updateInstances(e,s,r){const i=this.__itemsIdxToInstIdx={};let n;for(n=0;n<s;n++){let l=this.__instances[n],a=r[n],o=e[a];i[a]=n,l?(l._setPendingProperty(this.as,o),l._setPendingProperty(this.indexAs,n),l._setPendingProperty(this.itemsIndexAs,a),l._flushProperties()):this.__insertInstance(o,n,a)}for(let l=this.__instances.length-1;l>=n;l--)this.__detachAndRemoveInstance(l)}__detachInstance(e){let s=this.__instances[e];const r=u(s.root);for(let i=0;i<s.children.length;i++){let n=s.children[i];r.appendChild(n)}return s}__attachInstance(e,s){let r=this.__instances[e];s.insertBefore(r.root,this)}__detachAndRemoveInstance(e){this.__detachInstance(e),this.__instances.splice(e,1)}__stampInstance(e,s,r){let i={};return i[this.as]=e,i[this.indexAs]=s,i[this.itemsIndexAs]=r,new this.__ctor(i)}__insertInstance(e,s,r){const i=this.__stampInstance(e,s,r);let n=this.__instances[s+1],l=n?n.children[0]:this;return u(u(this).parentNode).insertBefore(i.root,l),this.__instances[s]=i,i}_showHideChildren(e){for(let s=0;s<this.__instances.length;s++)this.__instances[s]._showHideChildren(e)}__handleItemPath(e,s){let r=e.slice(6),i=r.indexOf("."),n=i<0?r:r.substring(0,i);if(n==parseInt(n,10)){let l=i<0?"":r.substring(i+1);this.__handleObservedPaths(l);let a=this.__itemsIdxToInstIdx[n],o=this.__instances[a];if(o){let h=this.as+(l?"."+l:"");o._setPendingPropertyOrPath(h,s,!1,!0),o._flushProperties()}return!0}}itemForElement(e){let s=this.modelForElement(e);return s&&s[this.as]}indexForElement(e){let s=this.modelForElement(e);return s&&s[this.indexAs]}modelForElement(e){return zr(this.template,e)}}customElements.define($t.is,$t);class $i extends Ce{static get is(){return"dom-if"}static get template(){return null}static get properties(){return{if:{type:Boolean,observer:"__debounceRender"},restamp:{type:Boolean,observer:"__debounceRender"},notifyDomChange:{type:Boolean}}}constructor(){super(),this.__renderDebouncer=null,this._lastIf=!1,this.__hideTemplateChildren__=!1,this.__template,this._templateInfo}__debounceRender(){this.__renderDebouncer=D.debounce(this.__renderDebouncer,E,()=>this.__render()),zi(this.__renderDebouncer)}disconnectedCallback(){super.disconnectedCallback();const e=u(this).parentNode;(!e||e.nodeType==Node.DOCUMENT_FRAGMENT_NODE&&!u(e).host)&&this.__teardownInstance()}connectedCallback(){super.connectedCallback(),dt()||(this.style.display="none"),this.if&&this.__debounceRender()}__ensureTemplate(){if(!this.__template){const e=this;let s=e._templateInfo?e:u(e).querySelector("template");if(!s){let r=new MutationObserver(()=>{if(u(this).querySelector("template"))r.disconnect(),this.__render();else throw new Error("dom-if requires a <template> child")});return r.observe(this,{childList:!0}),!1}this.__template=s}return!0}__ensureInstance(){let e=u(this).parentNode;if(this.__hasInstance()){let s=this.__getInstanceNodes();if(s&&s.length&&u(this).previousSibling!==s[s.length-1])for(let i=0,n;i<s.length&&(n=s[i]);i++)u(e).insertBefore(n,this)}else{if(!e||!this.__ensureTemplate())return!1;this.__createAndInsertInstance(e)}return!0}render(){ki()}__render(){if(this.if){if(!this.__ensureInstance())return}else this.restamp&&this.__teardownInstance();this._showHideChildren(),(!Te||this.notifyDomChange)&&this.if!=this._lastIf&&(this.dispatchEvent(new CustomEvent("dom-change",{bubbles:!0,composed:!0})),this._lastIf=this.if)}__hasInstance(){}__getInstanceNodes(){}__createAndInsertInstance(e){}__teardownInstance(){}_showHideChildren(){}}class Hr extends $i{constructor(){super(),this.__instance=null,this.__syncInfo=null}__hasInstance(){return!!this.__instance}__getInstanceNodes(){return this.__instance.templateInfo.childNodes}__createAndInsertInstance(e){const s=this.__dataHost||this;if(K&&!this.__dataHost)throw new Error("strictTemplatePolicy: template owner not trusted");const r=s._bindTemplate(this.__template,!0);r.runEffects=(i,n,l)=>{let a=this.__syncInfo;if(this.if)a&&(this.__syncInfo=null,this._showHideChildren(),n=Object.assign(a.changedProps,n)),i(n,l);else if(this.__instance)if(a||(a=this.__syncInfo={runEffects:i,changedProps:{}}),l)for(const o in n){const h=L(o);a.changedProps[h]=this.__dataHost[h]}else Object.assign(a.changedProps,n)},this.__instance=s._stampTemplate(this.__template,r),u(e).insertBefore(this.__instance,this)}__syncHostProperties(){const e=this.__syncInfo;e&&(this.__syncInfo=null,e.runEffects(e.changedProps,!1))}__teardownInstance(){const e=this.__dataHost||this;this.__instance&&(e._removeBoundDom(this.__instance),this.__instance=null,this.__syncInfo=null)}_showHideChildren(){const e=this.__hideTemplateChildren__||!this.if;this.__instance&&!!this.__instance.__hidden!==e&&(this.__instance.__hidden=e,Ki(e,this.__instance.templateInfo.childNodes)),e||this.__syncHostProperties()}}class Pr extends $i{constructor(){super(),this.__ctor=null,this.__instance=null,this.__invalidProps=null}__hasInstance(){return!!this.__instance}__getInstanceNodes(){return this.__instance.children}__createAndInsertInstance(e){this.__ctor||(this.__ctor=ye(this.__template,this,{mutableData:!0,forwardHostProp:function(s,r){this.__instance&&(this.if?this.__instance.forwardHostProp(s,r):(this.__invalidProps=this.__invalidProps||Object.create(null),this.__invalidProps[L(s)]=!0))}})),this.__instance=new this.__ctor,u(e).insertBefore(this.__instance.root,this)}__teardownInstance(){if(this.__instance){let e=this.__instance.children;if(e&&e.length){let s=u(e[0]).parentNode;if(s){s=u(s);for(let r=0,i;r<e.length&&(i=e[r]);r++)s.removeChild(i)}}this.__invalidProps=null,this.__instance=null}}__syncHostProperties(){let e=this.__invalidProps;if(e){this.__invalidProps=null;for(let s in e)this.__instance._setPendingProperty(s,this.__dataHost[s]);this.__instance._flushProperties()}}_showHideChildren(){const e=this.__hideTemplateChildren__||!this.if;this.__instance&&!!this.__instance.__hidden!==e&&(this.__instance.__hidden=e,this.__instance._showHideChildren(e)),e||this.__syncHostProperties()}}const qt=ii?Hr:Pr;customElements.define(qt.is,qt);let Sr=H(t=>{let e=we(t);class s extends e{static get properties(){return{items:{type:Array},multi:{type:Boolean,value:!1},selected:{type:Object,notify:!0},selectedItem:{type:Object,notify:!0},toggle:{type:Boolean,value:!1}}}static get observers(){return["__updateSelection(multi, items.*)"]}constructor(){super(),this.__lastItems=null,this.__lastMulti=null,this.__selectedMap=null}__updateSelection(i,n){let l=n.path;if(l==JSCompiler_renameProperty("items",this)){let a=n.base||[],o=this.__lastItems,h=this.__lastMulti;if(i!==h&&this.clearSelection(),o){let c=Oi(a,o);this.__applySplices(c)}this.__lastItems=a,this.__lastMulti=i}else if(n.path==`${JSCompiler_renameProperty("items",this)}.splices`)this.__applySplices(n.value.indexSplices);else{let a=l.slice(`${JSCompiler_renameProperty("items",this)}.`.length),o=parseInt(a,10);a.indexOf(".")<0&&a==o&&this.__deselectChangedIdx(o)}}__applySplices(i){let n=this.__selectedMap;for(let a=0;a<i.length;a++){let o=i[a];n.forEach((h,c)=>{h<o.index||(h>=o.index+o.removed.length?n.set(c,h+o.addedCount-o.removed.length):n.set(c,-1))});for(let h=0;h<o.addedCount;h++){let c=o.index+h;n.has(this.items[c])&&n.set(this.items[c],c)}}this.__updateLinks();let l=0;n.forEach((a,o)=>{a<0?(this.multi?this.splice(JSCompiler_renameProperty("selected",this),l,1):this.selected=this.selectedItem=null,n.delete(o)):l++})}__updateLinks(){if(this.__dataLinkedPaths={},this.multi){let i=0;this.__selectedMap.forEach(n=>{n>=0&&this.linkPaths(`${JSCompiler_renameProperty("items",this)}.${n}`,`${JSCompiler_renameProperty("selected",this)}.${i++}`)})}else this.__selectedMap.forEach(i=>{this.linkPaths(JSCompiler_renameProperty("selected",this),`${JSCompiler_renameProperty("items",this)}.${i}`),this.linkPaths(JSCompiler_renameProperty("selectedItem",this),`${JSCompiler_renameProperty("items",this)}.${i}`)})}clearSelection(){this.__dataLinkedPaths={},this.__selectedMap=new Map,this.selected=this.multi?[]:null,this.selectedItem=null}isSelected(i){return this.__selectedMap.has(i)}isIndexSelected(i){return this.isSelected(this.items[i])}__deselectChangedIdx(i){let n=this.__selectedIndexForItemIndex(i);if(n>=0){let l=0;this.__selectedMap.forEach((a,o)=>{n==l++&&this.deselect(o)})}}__selectedIndexForItemIndex(i){let n=this.__dataLinkedPaths[`${JSCompiler_renameProperty("items",this)}.${i}`];if(n)return parseInt(n.slice(`${JSCompiler_renameProperty("selected",this)}.`.length),10)}deselect(i){let n=this.__selectedMap.get(i);if(n>=0){this.__selectedMap.delete(i);let l;this.multi&&(l=this.__selectedIndexForItemIndex(n)),this.__updateLinks(),this.multi?this.splice(JSCompiler_renameProperty("selected",this),l,1):this.selected=this.selectedItem=null}}deselectIndex(i){this.deselect(this.items[i])}select(i){this.selectIndex(this.items.indexOf(i))}selectIndex(i){let n=this.items[i];this.isSelected(n)?this.toggle&&this.deselectIndex(i):(this.multi||this.__selectedMap.clear(),this.__selectedMap.set(n,i),this.__updateLinks(),this.multi?this.push(JSCompiler_renameProperty("selected",this),n):this.selected=this.selectedItem=n)}}return s}),xr=Sr(Ce);class Yt extends xr{static get is(){return"array-selector"}static get template(){return null}}customElements.define(Yt.is,Yt);const Jt="include",Lr=window.ShadyCSS.CustomStyleInterface;class Er extends HTMLElement{constructor(){super(),this._style=null,Lr.addCustomStyle(this)}getStyle(){if(this._style)return this._style;const e=this.querySelector("style");if(!e)return null;this._style=e;const s=e.getAttribute(Jt);return s&&(e.removeAttribute(Jt),e.textContent=ms(s)+e.textContent),this.ownerDocument!==window.document&&window.document.head.appendChild(this),this._style}}window.customElements.define("custom-style",Er);const Ar=ot(HTMLElement).prototype;var Gt={"U+0008":"backspace","U+0009":"tab","U+001B":"esc","U+0020":"space","U+007F":"del"},Vr={8:"backspace",9:"tab",13:"enter",27:"esc",33:"pageup",34:"pagedown",35:"end",36:"home",32:"space",37:"left",38:"up",39:"right",40:"down",46:"del",106:"*"},Xt={shift:"shiftKey",ctrl:"ctrlKey",alt:"altKey",meta:"metaKey"},Tr=/[a-z0-9*]/,Or=/U\+/,kr=/^arrow/,Nr=/^space(bar)?/,Ir=/^escape$/;function Wt(t,e){var s="";if(t){var r=t.toLowerCase();r===" "||Nr.test(r)?s="space":Ir.test(r)?s="esc":r.length==1?(!e||Tr.test(r))&&(s=r):kr.test(r)?s=r.replace("arrow",""):r=="multiply"?s="*":s=r}return s}function Dr(t){var e="";return t&&(t in Gt?e=Gt[t]:Or.test(t)?(t=parseInt(t.replace("U+","0x"),16),e=String.fromCharCode(t).toLowerCase()):e=t.toLowerCase()),e}function Rr(t){var e="";return Number(t)&&(t>=65&&t<=90?e=String.fromCharCode(32+t):t>=112&&t<=123?e="f"+(t-112+1):t>=48&&t<=57?e=String(t-48):t>=96&&t<=105?e=String(t-96):e=Vr[t]),e}function Fr(t,e){return t.key?Wt(t.key,e):t.detail&&t.detail.key?Wt(t.detail.key,e):Dr(t.keyIdentifier)||Rr(t.keyCode)||""}function Qt(t,e){var s=Fr(e,t.hasModifiers);return s===t.key&&(!t.hasModifiers||!!e.shiftKey==!!t.shiftKey&&!!e.ctrlKey==!!t.ctrlKey&&!!e.altKey==!!t.altKey&&!!e.metaKey==!!t.metaKey)}function Br(t){return t.length===1?{combo:t,key:t,event:"keydown"}:t.split("+").reduce(function(e,s){var r=s.split(":"),i=r[0],n=r[1];return i in Xt?(e[Xt[i]]=!0,e.hasModifiers=!0):(e.key=i,e.event=n||"keydown"),e},{combo:t.split(":").shift()})}function Zt(t){return t.trim().split(" ").map(function(e){return Br(e)})}const pt={properties:{keyEventTarget:{type:Object,value:function(){return this}},stopKeyboardEventPropagation:{type:Boolean,value:!1},_boundKeyHandlers:{type:Array,value:function(){return[]}},_imperativeKeyBindings:{type:Object,value:function(){return{}}}},observers:["_resetKeyEventListeners(keyEventTarget, _boundKeyHandlers)"],keyBindings:{},registered:function(){this._prepKeyBindings()},attached:function(){this._listenKeyEventListeners()},detached:function(){this._unlistenKeyEventListeners()},addOwnKeyBinding:function(t,e){this._imperativeKeyBindings[t]=e,this._prepKeyBindings(),this._resetKeyEventListeners()},removeOwnKeyBindings:function(){this._imperativeKeyBindings={},this._prepKeyBindings(),this._resetKeyEventListeners()},keyboardEventMatchesKeys:function(t,e){for(var s=Zt(e),r=0;r<s.length;++r)if(Qt(s[r],t))return!0;return!1},_collectKeyBindings:function(){var t=this.behaviors.map(function(e){return e.keyBindings});return t.indexOf(this.keyBindings)===-1&&t.push(this.keyBindings),t},_prepKeyBindings:function(){this._keyBindings={},this._collectKeyBindings().forEach(function(s){for(var r in s)this._addKeyBinding(r,s[r])},this);for(var t in this._imperativeKeyBindings)this._addKeyBinding(t,this._imperativeKeyBindings[t]);for(var e in this._keyBindings)this._keyBindings[e].sort(function(s,r){var i=s[0].hasModifiers,n=r[0].hasModifiers;return i===n?0:i?-1:1})},_addKeyBinding:function(t,e){Zt(t).forEach(function(s){this._keyBindings[s.event]=this._keyBindings[s.event]||[],this._keyBindings[s.event].push([s,e])},this)},_resetKeyEventListeners:function(){this._unlistenKeyEventListeners(),this.isAttached&&this._listenKeyEventListeners()},_listenKeyEventListeners:function(){this.keyEventTarget&&Object.keys(this._keyBindings).forEach(function(t){var e=this._keyBindings[t],s=this._onKeyBindingEvent.bind(this,e);this._boundKeyHandlers.push([this.keyEventTarget,t,s]),this.keyEventTarget.addEventListener(t,s)},this)},_unlistenKeyEventListeners:function(){for(var t,e,s,r;this._boundKeyHandlers.length;)t=this._boundKeyHandlers.pop(),e=t[0],s=t[1],r=t[2],e.removeEventListener(s,r)},_onKeyBindingEvent:function(t,e){if(this.stopKeyboardEventPropagation&&e.stopPropagation(),!e.defaultPrevented)for(var s=0;s<t.length;s++){var r=t[s][0],i=t[s][1];if(Qt(r,e)&&(this._triggerKeyHandler(r,i,e),e.defaultPrevented))return}},_triggerKeyHandler:function(t,e,s){var r=Object.create(t);r.keyboardEvent=s;var i=new CustomEvent(t.event,{detail:r,cancelable:!0});this[e].call(this,i),i.defaultPrevented&&s.preventDefault()}};const qi=V`
<custom-style>
  <style is="custom-style">
    [hidden] {
      display: none !important;
    }
  </style>
</custom-style>
<custom-style>
  <style is="custom-style">
    html {

      --layout: {
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
      };

      --layout-inline: {
        display: -ms-inline-flexbox;
        display: -webkit-inline-flex;
        display: inline-flex;
      };

      --layout-horizontal: {
        @apply --layout;

        -ms-flex-direction: row;
        -webkit-flex-direction: row;
        flex-direction: row;
      };

      --layout-horizontal-reverse: {
        @apply --layout;

        -ms-flex-direction: row-reverse;
        -webkit-flex-direction: row-reverse;
        flex-direction: row-reverse;
      };

      --layout-vertical: {
        @apply --layout;

        -ms-flex-direction: column;
        -webkit-flex-direction: column;
        flex-direction: column;
      };

      --layout-vertical-reverse: {
        @apply --layout;

        -ms-flex-direction: column-reverse;
        -webkit-flex-direction: column-reverse;
        flex-direction: column-reverse;
      };

      --layout-wrap: {
        -ms-flex-wrap: wrap;
        -webkit-flex-wrap: wrap;
        flex-wrap: wrap;
      };

      --layout-wrap-reverse: {
        -ms-flex-wrap: wrap-reverse;
        -webkit-flex-wrap: wrap-reverse;
        flex-wrap: wrap-reverse;
      };

      --layout-flex-auto: {
        -ms-flex: 1 1 auto;
        -webkit-flex: 1 1 auto;
        flex: 1 1 auto;
      };

      --layout-flex-none: {
        -ms-flex: none;
        -webkit-flex: none;
        flex: none;
      };

      --layout-flex: {
        -ms-flex: 1 1 0.000000001px;
        -webkit-flex: 1;
        flex: 1;
        -webkit-flex-basis: 0.000000001px;
        flex-basis: 0.000000001px;
      };

      --layout-flex-2: {
        -ms-flex: 2;
        -webkit-flex: 2;
        flex: 2;
      };

      --layout-flex-3: {
        -ms-flex: 3;
        -webkit-flex: 3;
        flex: 3;
      };

      --layout-flex-4: {
        -ms-flex: 4;
        -webkit-flex: 4;
        flex: 4;
      };

      --layout-flex-5: {
        -ms-flex: 5;
        -webkit-flex: 5;
        flex: 5;
      };

      --layout-flex-6: {
        -ms-flex: 6;
        -webkit-flex: 6;
        flex: 6;
      };

      --layout-flex-7: {
        -ms-flex: 7;
        -webkit-flex: 7;
        flex: 7;
      };

      --layout-flex-8: {
        -ms-flex: 8;
        -webkit-flex: 8;
        flex: 8;
      };

      --layout-flex-9: {
        -ms-flex: 9;
        -webkit-flex: 9;
        flex: 9;
      };

      --layout-flex-10: {
        -ms-flex: 10;
        -webkit-flex: 10;
        flex: 10;
      };

      --layout-flex-11: {
        -ms-flex: 11;
        -webkit-flex: 11;
        flex: 11;
      };

      --layout-flex-12: {
        -ms-flex: 12;
        -webkit-flex: 12;
        flex: 12;
      };

      /* alignment in cross axis */

      --layout-start: {
        -ms-flex-align: start;
        -webkit-align-items: flex-start;
        align-items: flex-start;
      };

      --layout-center: {
        -ms-flex-align: center;
        -webkit-align-items: center;
        align-items: center;
      };

      --layout-end: {
        -ms-flex-align: end;
        -webkit-align-items: flex-end;
        align-items: flex-end;
      };

      --layout-baseline: {
        -ms-flex-align: baseline;
        -webkit-align-items: baseline;
        align-items: baseline;
      };

      /* alignment in main axis */

      --layout-start-justified: {
        -ms-flex-pack: start;
        -webkit-justify-content: flex-start;
        justify-content: flex-start;
      };

      --layout-center-justified: {
        -ms-flex-pack: center;
        -webkit-justify-content: center;
        justify-content: center;
      };

      --layout-end-justified: {
        -ms-flex-pack: end;
        -webkit-justify-content: flex-end;
        justify-content: flex-end;
      };

      --layout-around-justified: {
        -ms-flex-pack: distribute;
        -webkit-justify-content: space-around;
        justify-content: space-around;
      };

      --layout-justified: {
        -ms-flex-pack: justify;
        -webkit-justify-content: space-between;
        justify-content: space-between;
      };

      --layout-center-center: {
        @apply --layout-center;
        @apply --layout-center-justified;
      };

      /* self alignment */

      --layout-self-start: {
        -ms-align-self: flex-start;
        -webkit-align-self: flex-start;
        align-self: flex-start;
      };

      --layout-self-center: {
        -ms-align-self: center;
        -webkit-align-self: center;
        align-self: center;
      };

      --layout-self-end: {
        -ms-align-self: flex-end;
        -webkit-align-self: flex-end;
        align-self: flex-end;
      };

      --layout-self-stretch: {
        -ms-align-self: stretch;
        -webkit-align-self: stretch;
        align-self: stretch;
      };

      --layout-self-baseline: {
        -ms-align-self: baseline;
        -webkit-align-self: baseline;
        align-self: baseline;
      };

      /* multi-line alignment in main axis */

      --layout-start-aligned: {
        -ms-flex-line-pack: start;  /* IE10 */
        -ms-align-content: flex-start;
        -webkit-align-content: flex-start;
        align-content: flex-start;
      };

      --layout-end-aligned: {
        -ms-flex-line-pack: end;  /* IE10 */
        -ms-align-content: flex-end;
        -webkit-align-content: flex-end;
        align-content: flex-end;
      };

      --layout-center-aligned: {
        -ms-flex-line-pack: center;  /* IE10 */
        -ms-align-content: center;
        -webkit-align-content: center;
        align-content: center;
      };

      --layout-between-aligned: {
        -ms-flex-line-pack: justify;  /* IE10 */
        -ms-align-content: space-between;
        -webkit-align-content: space-between;
        align-content: space-between;
      };

      --layout-around-aligned: {
        -ms-flex-line-pack: distribute;  /* IE10 */
        -ms-align-content: space-around;
        -webkit-align-content: space-around;
        align-content: space-around;
      };

      /*******************************
                Other Layout
      *******************************/

      --layout-block: {
        display: block;
      };

      --layout-invisible: {
        visibility: hidden !important;
      };

      --layout-relative: {
        position: relative;
      };

      --layout-fit: {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      };

      --layout-scroll: {
        -webkit-overflow-scrolling: touch;
        overflow: auto;
      };

      --layout-fullbleed: {
        margin: 0;
        height: 100vh;
      };

      /* fixed position */

      --layout-fixed-top: {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
      };

      --layout-fixed-right: {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
      };

      --layout-fixed-bottom: {
        position: fixed;
        right: 0;
        bottom: 0;
        left: 0;
      };

      --layout-fixed-left: {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
      };

    }
  </style>
</custom-style>`;qi.setAttribute("style","display: none;");document.head.appendChild(qi.content);var Yi=document.createElement("style");Yi.textContent="[hidden] { display: none !important; }";document.head.appendChild(Yi);class Ur{constructor(e){this.selection=[],this.selectCallback=e}get(){return this.multi?this.selection.slice():this.selection[0]}clear(e){this.selection.slice().forEach(function(s){(!e||e.indexOf(s)<0)&&this.setItemSelected(s,!1)},this)}isSelected(e){return this.selection.indexOf(e)>=0}setItemSelected(e,s){if(e!=null&&s!==this.isSelected(e)){if(s)this.selection.push(e);else{var r=this.selection.indexOf(e);r>=0&&this.selection.splice(r,1)}this.selectCallback&&this.selectCallback(e,s)}}select(e){this.multi?this.toggle(e):this.get()!==e&&(this.setItemSelected(this.get(),!1),this.setItemSelected(e,!0))}toggle(e){this.setItemSelected(e,!this.isSelected(e))}}const Ji={properties:{attrForSelected:{type:String,value:null},selected:{type:String,notify:!0},selectedItem:{type:Object,readOnly:!0,notify:!0},activateEvent:{type:String,value:"tap",observer:"_activateEventChanged"},selectable:String,selectedClass:{type:String,value:"iron-selected"},selectedAttribute:{type:String,value:null},fallbackSelection:{type:String,value:null},items:{type:Array,readOnly:!0,notify:!0,value:function(){return[]}},_excludedLocalNames:{type:Object,value:function(){return{template:1,"dom-bind":1,"dom-if":1,"dom-repeat":1}}}},observers:["_updateAttrForSelected(attrForSelected)","_updateSelected(selected)","_checkFallback(fallbackSelection)"],created:function(){this._bindFilterItem=this._filterItem.bind(this),this._selection=new Ur(this._applySelection.bind(this))},attached:function(){this._observer=this._observeItems(this),this._addListener(this.activateEvent)},detached:function(){this._observer&&g(this).unobserveNodes(this._observer),this._removeListener(this.activateEvent)},indexOf:function(t){return this.items?this.items.indexOf(t):-1},select:function(t){this.selected=t},selectPrevious:function(){var t=this.items.length,e=t-1;this.selected!==void 0&&(e=(Number(this._valueToIndex(this.selected))-1+t)%t),this.selected=this._indexToValue(e)},selectNext:function(){var t=0;this.selected!==void 0&&(t=(Number(this._valueToIndex(this.selected))+1)%this.items.length),this.selected=this._indexToValue(t)},selectIndex:function(t){this.select(this._indexToValue(t))},forceSynchronousItemUpdate:function(){this._observer&&typeof this._observer.flush=="function"?this._observer.flush():this._updateItems()},get _shouldUpdateSelection(){return this.selected!=null},_checkFallback:function(){this._updateSelected()},_addListener:function(t){this.listen(this,t,"_activateHandler")},_removeListener:function(t){this.unlisten(this,t,"_activateHandler")},_activateEventChanged:function(t,e){this._removeListener(e),this._addListener(t)},_updateItems:function(){var t=g(this).queryDistributedElements(this.selectable||"*");t=Array.prototype.filter.call(t,this._bindFilterItem),this._setItems(t)},_updateAttrForSelected:function(){this.selectedItem&&(this.selected=this._valueForItem(this.selectedItem))},_updateSelected:function(){this._selectSelected(this.selected)},_selectSelected:function(t){if(this.items){var e=this._valueToItem(this.selected);e?this._selection.select(e):this._selection.clear(),this.fallbackSelection&&this.items.length&&this._selection.get()===void 0&&(this.selected=this.fallbackSelection)}},_filterItem:function(t){return!this._excludedLocalNames[t.localName]},_valueToItem:function(t){return t==null?null:this.items[this._valueToIndex(t)]},_valueToIndex:function(t){if(this.attrForSelected){for(var e=0,s;s=this.items[e];e++)if(this._valueForItem(s)==t)return e}else return Number(t)},_indexToValue:function(t){if(this.attrForSelected){var e=this.items[t];if(e)return this._valueForItem(e)}else return t},_valueForItem:function(t){if(!t)return null;if(!this.attrForSelected){var e=this.indexOf(t);return e===-1?null:e}var s=t[Qe(this.attrForSelected)];return s??t.getAttribute(this.attrForSelected)},_applySelection:function(t,e){this.selectedClass&&this.toggleClass(this.selectedClass,e,t),this.selectedAttribute&&this.toggleAttribute(this.selectedAttribute,e,t),this._selectionChange(),this.fire("iron-"+(e?"select":"deselect"),{item:t})},_selectionChange:function(){this._setSelectedItem(this._selection.get())},_observeItems:function(t){return g(t).observeNodes(function(e){this._updateItems(),this._updateSelected(),this.fire("iron-items-changed",e,{bubbles:!1,cancelable:!1})})},_activateHandler:function(t){for(var e=t.target,s=this.items;e&&e!=this;){var r=s.indexOf(e);if(r>=0){var i=this._indexToValue(r);this._itemActivate(i,e);return}e=e.parentNode}},_itemActivate:function(t,e){this.fire("iron-activate",{selected:t,item:e},{cancelable:!0}).defaultPrevented||this.select(t)}};const jr={properties:{multi:{type:Boolean,value:!1,observer:"multiChanged"},selectedValues:{type:Array,notify:!0,value:function(){return[]}},selectedItems:{type:Array,readOnly:!0,notify:!0,value:function(){return[]}}},observers:["_updateSelected(selectedValues.splices)"],select:function(t){this.multi?this._toggleSelected(t):this.selected=t},multiChanged:function(t){this._selection.multi=t,this._updateSelected()},get _shouldUpdateSelection(){return this.selected!=null||this.selectedValues!=null&&this.selectedValues.length},_updateAttrForSelected:function(){this.multi?this.selectedItems&&this.selectedItems.length>0&&(this.selectedValues=this.selectedItems.map(function(t){return this._indexToValue(this.indexOf(t))},this).filter(function(t){return t!=null},this)):Ji._updateAttrForSelected.apply(this)},_updateSelected:function(){this.multi?this._selectMulti(this.selectedValues):this._selectSelected(this.selected)},_selectMulti:function(t){t=t||[];var e=(this._valuesToItems(t)||[]).filter(function(i){return i!=null});this._selection.clear(e);for(var s=0;s<e.length;s++)this._selection.setItemSelected(e[s],!0);if(this.fallbackSelection&&!this._selection.get().length){var r=this._valueToItem(this.fallbackSelection);r&&this.select(this.fallbackSelection)}},_selectionChange:function(){var t=this._selection.get();this.multi?(this._setSelectedItems(t),this._setSelectedItem(t.length?t[0]:null)):t!=null?(this._setSelectedItems([t]),this._setSelectedItem(t)):(this._setSelectedItems([]),this._setSelectedItem(null))},_toggleSelected:function(t){var e=this.selectedValues.indexOf(t),s=e<0;s?this.push("selectedValues",t):this.splice("selectedValues",e,1)},_valuesToItems:function(t){return t==null?null:t.map(function(e){return this._valueToItem(e)},this)}},Kr=[Ji,jr];T({is:"iron-selector",behaviors:[Kr]});class M{constructor(e){M[" "](e),this.type=e&&e.type||"default",this.key=e&&e.key,e&&"value"in e&&(this.value=e.value)}get value(){var e=this.type,s=this.key;if(e&&s)return M.types[e]&&M.types[e][s]}set value(e){var s=this.type,r=this.key;s&&r&&(s=M.types[s]=M.types[s]||{},e==null?delete s[r]:s[r]=e)}get list(){var e=this.type;if(e){var s=M.types[this.type];return s?Object.keys(s).map(function(r){return $r[this.type][r]},this):[]}}byKey(e){return this.key=e,this.value}}M[" "]=function(){};M.types={};var $r=M.types;T({is:"iron-meta",properties:{type:{type:String,value:"default"},key:{type:String},value:{type:String,notify:!0},self:{type:Boolean,observer:"_selfChanged"},__meta:{type:Boolean,computed:"__computeMeta(type, key, value)"}},hostAttributes:{hidden:!0},__computeMeta:function(t,e,s){var r=new M({type:t,key:e});return s!==void 0&&s!==r.value?r.value=s:this.value!==r.value&&(this.value=r.value),r},get list(){return this.__meta&&this.__meta.list},_selfChanged:function(t){t&&(this.value=this)},byKey:function(t){return new M({type:this.type,key:t}).value}});T({_template:V`
    <style>
      :host {
        @apply --layout-inline;
        @apply --layout-center-center;
        position: relative;

        vertical-align: middle;

        fill: var(--iron-icon-fill-color, currentcolor);
        stroke: var(--iron-icon-stroke-color, none);

        width: var(--iron-icon-width, 24px);
        height: var(--iron-icon-height, 24px);
        @apply --iron-icon;
      }

      :host([hidden]) {
        display: none;
      }
    </style>
`,is:"iron-icon",properties:{icon:{type:String},theme:{type:String},src:{type:String},_meta:{value:Ar.create("iron-meta",{type:"iconset"})}},observers:["_updateIcon(_meta, isAttached)","_updateIcon(theme, isAttached)","_srcChanged(src, isAttached)","_iconChanged(icon, isAttached)"],_DEFAULT_ICONSET:"icons",_iconChanged:function(t){var e=(t||"").split(":");this._iconName=e.pop(),this._iconsetName=e.pop()||this._DEFAULT_ICONSET,this._updateIcon()},_srcChanged:function(t){this._updateIcon()},_usesIconset:function(){return this.icon||!this.src},_updateIcon:function(){this._usesIconset()?(this._img&&this._img.parentNode&&g(this.root).removeChild(this._img),this._iconName===""?this._iconset&&this._iconset.removeIcon(this):this._iconsetName&&this._meta&&(this._iconset=this._meta.byKey(this._iconsetName),this._iconset?(this._iconset.applyIcon(this,this._iconName,this.theme),this.unlisten(window,"iron-iconset-added","_updateIcon")):this.listen(window,"iron-iconset-added","_updateIcon"))):(this._iconset&&this._iconset.removeIcon(this),this._img||(this._img=document.createElement("img"),this._img.style.width="100%",this._img.style.height="100%",this._img.draggable=!1),this._img.src=this.src,g(this.root).appendChild(this._img))}});const Gi=V`
<custom-style>
  <style is="custom-style">
    html {

      /* Material Design color palette for Google products */

      --google-red-100: #f4c7c3;
      --google-red-300: #e67c73;
      --google-red-500: #db4437;
      --google-red-700: #c53929;

      --google-blue-100: #c6dafc;
      --google-blue-300: #7baaf7;
      --google-blue-500: #4285f4;
      --google-blue-700: #3367d6;

      --google-green-100: #b7e1cd;
      --google-green-300: #57bb8a;
      --google-green-500: #0f9d58;
      --google-green-700: #0b8043;

      --google-yellow-100: #fce8b2;
      --google-yellow-300: #f7cb4d;
      --google-yellow-500: #f4b400;
      --google-yellow-700: #f09300;

      --google-grey-100: #f5f5f5;
      --google-grey-300: #e0e0e0;
      --google-grey-500: #9e9e9e;
      --google-grey-700: #616161;

      /* Material Design color palette from online spec document */

      --paper-red-50: #ffebee;
      --paper-red-100: #ffcdd2;
      --paper-red-200: #ef9a9a;
      --paper-red-300: #e57373;
      --paper-red-400: #ef5350;
      --paper-red-500: #f44336;
      --paper-red-600: #e53935;
      --paper-red-700: #d32f2f;
      --paper-red-800: #c62828;
      --paper-red-900: #b71c1c;
      --paper-red-a100: #ff8a80;
      --paper-red-a200: #ff5252;
      --paper-red-a400: #ff1744;
      --paper-red-a700: #d50000;

      --paper-pink-50: #fce4ec;
      --paper-pink-100: #f8bbd0;
      --paper-pink-200: #f48fb1;
      --paper-pink-300: #f06292;
      --paper-pink-400: #ec407a;
      --paper-pink-500: #e91e63;
      --paper-pink-600: #d81b60;
      --paper-pink-700: #c2185b;
      --paper-pink-800: #ad1457;
      --paper-pink-900: #880e4f;
      --paper-pink-a100: #ff80ab;
      --paper-pink-a200: #ff4081;
      --paper-pink-a400: #f50057;
      --paper-pink-a700: #c51162;

      --paper-purple-50: #f3e5f5;
      --paper-purple-100: #e1bee7;
      --paper-purple-200: #ce93d8;
      --paper-purple-300: #ba68c8;
      --paper-purple-400: #ab47bc;
      --paper-purple-500: #9c27b0;
      --paper-purple-600: #8e24aa;
      --paper-purple-700: #7b1fa2;
      --paper-purple-800: #6a1b9a;
      --paper-purple-900: #4a148c;
      --paper-purple-a100: #ea80fc;
      --paper-purple-a200: #e040fb;
      --paper-purple-a400: #d500f9;
      --paper-purple-a700: #aa00ff;

      --paper-deep-purple-50: #ede7f6;
      --paper-deep-purple-100: #d1c4e9;
      --paper-deep-purple-200: #b39ddb;
      --paper-deep-purple-300: #9575cd;
      --paper-deep-purple-400: #7e57c2;
      --paper-deep-purple-500: #673ab7;
      --paper-deep-purple-600: #5e35b1;
      --paper-deep-purple-700: #512da8;
      --paper-deep-purple-800: #4527a0;
      --paper-deep-purple-900: #311b92;
      --paper-deep-purple-a100: #b388ff;
      --paper-deep-purple-a200: #7c4dff;
      --paper-deep-purple-a400: #651fff;
      --paper-deep-purple-a700: #6200ea;

      --paper-indigo-50: #e8eaf6;
      --paper-indigo-100: #c5cae9;
      --paper-indigo-200: #9fa8da;
      --paper-indigo-300: #7986cb;
      --paper-indigo-400: #5c6bc0;
      --paper-indigo-500: #3f51b5;
      --paper-indigo-600: #3949ab;
      --paper-indigo-700: #303f9f;
      --paper-indigo-800: #283593;
      --paper-indigo-900: #1a237e;
      --paper-indigo-a100: #8c9eff;
      --paper-indigo-a200: #536dfe;
      --paper-indigo-a400: #3d5afe;
      --paper-indigo-a700: #304ffe;

      --paper-blue-50: #e3f2fd;
      --paper-blue-100: #bbdefb;
      --paper-blue-200: #90caf9;
      --paper-blue-300: #64b5f6;
      --paper-blue-400: #42a5f5;
      --paper-blue-500: #2196f3;
      --paper-blue-600: #1e88e5;
      --paper-blue-700: #1976d2;
      --paper-blue-800: #1565c0;
      --paper-blue-900: #0d47a1;
      --paper-blue-a100: #82b1ff;
      --paper-blue-a200: #448aff;
      --paper-blue-a400: #2979ff;
      --paper-blue-a700: #2962ff;

      --paper-light-blue-50: #e1f5fe;
      --paper-light-blue-100: #b3e5fc;
      --paper-light-blue-200: #81d4fa;
      --paper-light-blue-300: #4fc3f7;
      --paper-light-blue-400: #29b6f6;
      --paper-light-blue-500: #03a9f4;
      --paper-light-blue-600: #039be5;
      --paper-light-blue-700: #0288d1;
      --paper-light-blue-800: #0277bd;
      --paper-light-blue-900: #01579b;
      --paper-light-blue-a100: #80d8ff;
      --paper-light-blue-a200: #40c4ff;
      --paper-light-blue-a400: #00b0ff;
      --paper-light-blue-a700: #0091ea;

      --paper-cyan-50: #e0f7fa;
      --paper-cyan-100: #b2ebf2;
      --paper-cyan-200: #80deea;
      --paper-cyan-300: #4dd0e1;
      --paper-cyan-400: #26c6da;
      --paper-cyan-500: #00bcd4;
      --paper-cyan-600: #00acc1;
      --paper-cyan-700: #0097a7;
      --paper-cyan-800: #00838f;
      --paper-cyan-900: #006064;
      --paper-cyan-a100: #84ffff;
      --paper-cyan-a200: #18ffff;
      --paper-cyan-a400: #00e5ff;
      --paper-cyan-a700: #00b8d4;

      --paper-teal-50: #e0f2f1;
      --paper-teal-100: #b2dfdb;
      --paper-teal-200: #80cbc4;
      --paper-teal-300: #4db6ac;
      --paper-teal-400: #26a69a;
      --paper-teal-500: #009688;
      --paper-teal-600: #00897b;
      --paper-teal-700: #00796b;
      --paper-teal-800: #00695c;
      --paper-teal-900: #004d40;
      --paper-teal-a100: #a7ffeb;
      --paper-teal-a200: #64ffda;
      --paper-teal-a400: #1de9b6;
      --paper-teal-a700: #00bfa5;

      --paper-green-50: #e8f5e9;
      --paper-green-100: #c8e6c9;
      --paper-green-200: #a5d6a7;
      --paper-green-300: #81c784;
      --paper-green-400: #66bb6a;
      --paper-green-500: #4caf50;
      --paper-green-600: #43a047;
      --paper-green-700: #388e3c;
      --paper-green-800: #2e7d32;
      --paper-green-900: #1b5e20;
      --paper-green-a100: #b9f6ca;
      --paper-green-a200: #69f0ae;
      --paper-green-a400: #00e676;
      --paper-green-a700: #00c853;

      --paper-light-green-50: #f1f8e9;
      --paper-light-green-100: #dcedc8;
      --paper-light-green-200: #c5e1a5;
      --paper-light-green-300: #aed581;
      --paper-light-green-400: #9ccc65;
      --paper-light-green-500: #8bc34a;
      --paper-light-green-600: #7cb342;
      --paper-light-green-700: #689f38;
      --paper-light-green-800: #558b2f;
      --paper-light-green-900: #33691e;
      --paper-light-green-a100: #ccff90;
      --paper-light-green-a200: #b2ff59;
      --paper-light-green-a400: #76ff03;
      --paper-light-green-a700: #64dd17;

      --paper-lime-50: #f9fbe7;
      --paper-lime-100: #f0f4c3;
      --paper-lime-200: #e6ee9c;
      --paper-lime-300: #dce775;
      --paper-lime-400: #d4e157;
      --paper-lime-500: #cddc39;
      --paper-lime-600: #c0ca33;
      --paper-lime-700: #afb42b;
      --paper-lime-800: #9e9d24;
      --paper-lime-900: #827717;
      --paper-lime-a100: #f4ff81;
      --paper-lime-a200: #eeff41;
      --paper-lime-a400: #c6ff00;
      --paper-lime-a700: #aeea00;

      --paper-yellow-50: #fffde7;
      --paper-yellow-100: #fff9c4;
      --paper-yellow-200: #fff59d;
      --paper-yellow-300: #fff176;
      --paper-yellow-400: #ffee58;
      --paper-yellow-500: #ffeb3b;
      --paper-yellow-600: #fdd835;
      --paper-yellow-700: #fbc02d;
      --paper-yellow-800: #f9a825;
      --paper-yellow-900: #f57f17;
      --paper-yellow-a100: #ffff8d;
      --paper-yellow-a200: #ffff00;
      --paper-yellow-a400: #ffea00;
      --paper-yellow-a700: #ffd600;

      --paper-amber-50: #fff8e1;
      --paper-amber-100: #ffecb3;
      --paper-amber-200: #ffe082;
      --paper-amber-300: #ffd54f;
      --paper-amber-400: #ffca28;
      --paper-amber-500: #ffc107;
      --paper-amber-600: #ffb300;
      --paper-amber-700: #ffa000;
      --paper-amber-800: #ff8f00;
      --paper-amber-900: #ff6f00;
      --paper-amber-a100: #ffe57f;
      --paper-amber-a200: #ffd740;
      --paper-amber-a400: #ffc400;
      --paper-amber-a700: #ffab00;

      --paper-orange-50: #fff3e0;
      --paper-orange-100: #ffe0b2;
      --paper-orange-200: #ffcc80;
      --paper-orange-300: #ffb74d;
      --paper-orange-400: #ffa726;
      --paper-orange-500: #ff9800;
      --paper-orange-600: #fb8c00;
      --paper-orange-700: #f57c00;
      --paper-orange-800: #ef6c00;
      --paper-orange-900: #e65100;
      --paper-orange-a100: #ffd180;
      --paper-orange-a200: #ffab40;
      --paper-orange-a400: #ff9100;
      --paper-orange-a700: #ff6500;

      --paper-deep-orange-50: #fbe9e7;
      --paper-deep-orange-100: #ffccbc;
      --paper-deep-orange-200: #ffab91;
      --paper-deep-orange-300: #ff8a65;
      --paper-deep-orange-400: #ff7043;
      --paper-deep-orange-500: #ff5722;
      --paper-deep-orange-600: #f4511e;
      --paper-deep-orange-700: #e64a19;
      --paper-deep-orange-800: #d84315;
      --paper-deep-orange-900: #bf360c;
      --paper-deep-orange-a100: #ff9e80;
      --paper-deep-orange-a200: #ff6e40;
      --paper-deep-orange-a400: #ff3d00;
      --paper-deep-orange-a700: #dd2c00;

      --paper-brown-50: #efebe9;
      --paper-brown-100: #d7ccc8;
      --paper-brown-200: #bcaaa4;
      --paper-brown-300: #a1887f;
      --paper-brown-400: #8d6e63;
      --paper-brown-500: #795548;
      --paper-brown-600: #6d4c41;
      --paper-brown-700: #5d4037;
      --paper-brown-800: #4e342e;
      --paper-brown-900: #3e2723;

      --paper-grey-50: #fafafa;
      --paper-grey-100: #f5f5f5;
      --paper-grey-200: #eeeeee;
      --paper-grey-300: #e0e0e0;
      --paper-grey-400: #bdbdbd;
      --paper-grey-500: #9e9e9e;
      --paper-grey-600: #757575;
      --paper-grey-700: #616161;
      --paper-grey-800: #424242;
      --paper-grey-900: #212121;

      --paper-blue-grey-50: #eceff1;
      --paper-blue-grey-100: #cfd8dc;
      --paper-blue-grey-200: #b0bec5;
      --paper-blue-grey-300: #90a4ae;
      --paper-blue-grey-400: #78909c;
      --paper-blue-grey-500: #607d8b;
      --paper-blue-grey-600: #546e7a;
      --paper-blue-grey-700: #455a64;
      --paper-blue-grey-800: #37474f;
      --paper-blue-grey-900: #263238;

      /* opacity for dark text on a light background */
      --dark-divider-opacity: 0.12;
      --dark-disabled-opacity: 0.38; /* or hint text or icon */
      --dark-secondary-opacity: 0.54;
      --dark-primary-opacity: 0.87;

      /* opacity for light text on a dark background */
      --light-divider-opacity: 0.12;
      --light-disabled-opacity: 0.3; /* or hint text or icon */
      --light-secondary-opacity: 0.7;
      --light-primary-opacity: 1.0;

    }

  </style>
</custom-style>
`;Gi.setAttribute("style","display: none;");document.head.appendChild(Gi.content);const Xi=V`
<custom-style>
  <style is="custom-style">
    html {
      /*
       * You can use these generic variables in your elements for easy theming.
       * For example, if all your elements use \`--primary-text-color\` as its main
       * color, then switching from a light to a dark theme is just a matter of
       * changing the value of \`--primary-text-color\` in your application.
       */
      --primary-text-color: var(--light-theme-text-color);
      --primary-background-color: var(--light-theme-background-color);
      --secondary-text-color: var(--light-theme-secondary-color);
      --disabled-text-color: var(--light-theme-disabled-color);
      --divider-color: var(--light-theme-divider-color);
      --error-color: var(--paper-deep-orange-a700);

      /*
       * Primary and accent colors. Also see color.js for more colors.
       */
      --primary-color: var(--paper-indigo-500);
      --light-primary-color: var(--paper-indigo-100);
      --dark-primary-color: var(--paper-indigo-700);

      --accent-color: var(--paper-pink-a200);
      --light-accent-color: var(--paper-pink-a100);
      --dark-accent-color: var(--paper-pink-a400);


      /*
       * Material Design Light background theme
       */
      --light-theme-background-color: #ffffff;
      --light-theme-base-color: #000000;
      --light-theme-text-color: var(--paper-grey-900);
      --light-theme-secondary-color: #737373;  /* for secondary text and icons */
      --light-theme-disabled-color: #9b9b9b;  /* disabled/hint text */
      --light-theme-divider-color: #dbdbdb;

      /*
       * Material Design Dark background theme
       */
      --dark-theme-background-color: var(--paper-grey-900);
      --dark-theme-base-color: #ffffff;
      --dark-theme-text-color: #ffffff;
      --dark-theme-secondary-color: #bcbcbc;  /* for secondary text and icons */
      --dark-theme-disabled-color: #646464;  /* disabled/hint text */
      --dark-theme-divider-color: #3c3c3c;

      /*
       * Deprecated values because of their confusing names.
       */
      --text-primary-color: var(--dark-theme-text-color);
      --default-primary-color: var(--primary-color);
    }
  </style>
</custom-style>`;Xi.setAttribute("style","display: none;");document.head.appendChild(Xi.content);const qr={properties:{focused:{type:Boolean,value:!1,notify:!0,readOnly:!0,reflectToAttribute:!0},disabled:{type:Boolean,value:!1,notify:!0,observer:"_disabledChanged",reflectToAttribute:!0},_oldTabIndex:{type:String},_boundFocusBlurHandler:{type:Function,value:function(){return this._focusBlurHandler.bind(this)}}},observers:["_changedControlState(focused, disabled)"],ready:function(){this.addEventListener("focus",this._boundFocusBlurHandler,!0),this.addEventListener("blur",this._boundFocusBlurHandler,!0)},_focusBlurHandler:function(t){this._setFocused(t.type==="focus")},_disabledChanged:function(t,e){this.setAttribute("aria-disabled",t?"true":"false"),this.style.pointerEvents=t?"none":"",t?(this._oldTabIndex=this.getAttribute("tabindex"),this._setFocused(!1),this.tabIndex=-1,this.blur()):this._oldTabIndex!==void 0&&(this._oldTabIndex===null?this.removeAttribute("tabindex"):this.setAttribute("tabindex",this._oldTabIndex))},_changedControlState:function(){this._controlStateChanged&&this._controlStateChanged()}};const Wi={properties:{pressed:{type:Boolean,readOnly:!0,value:!1,reflectToAttribute:!0,observer:"_pressedChanged"},toggles:{type:Boolean,value:!1,reflectToAttribute:!0},active:{type:Boolean,value:!1,notify:!0,reflectToAttribute:!0},pointerDown:{type:Boolean,readOnly:!0,value:!1},receivedFocusFromKeyboard:{type:Boolean,readOnly:!0},ariaActiveAttribute:{type:String,value:"aria-pressed",observer:"_ariaActiveAttributeChanged"}},listeners:{down:"_downHandler",up:"_upHandler",tap:"_tapHandler"},observers:["_focusChanged(focused)","_activeChanged(active, ariaActiveAttribute)"],keyBindings:{"enter:keydown":"_asyncClick","space:keydown":"_spaceKeyDownHandler","space:keyup":"_spaceKeyUpHandler"},_mouseEventRe:/^mouse/,_tapHandler:function(){this.toggles?this._userActivate(!this.active):this.active=!1},_focusChanged:function(t){this._detectKeyboardFocus(t),t||this._setPressed(!1)},_detectKeyboardFocus:function(t){this._setReceivedFocusFromKeyboard(!this.pointerDown&&t)},_userActivate:function(t){this.active!==t&&(this.active=t,this.fire("change"))},_downHandler:function(t){this._setPointerDown(!0),this._setPressed(!0),this._setReceivedFocusFromKeyboard(!1)},_upHandler:function(){this._setPointerDown(!1),this._setPressed(!1)},_spaceKeyDownHandler:function(t){var e=t.detail.keyboardEvent,s=g(e).localTarget;this.isLightDescendant(s)||(e.preventDefault(),e.stopImmediatePropagation(),this._setPressed(!0))},_spaceKeyUpHandler:function(t){var e=t.detail.keyboardEvent,s=g(e).localTarget;this.isLightDescendant(s)||(this.pressed&&this._asyncClick(),this._setPressed(!1))},_asyncClick:function(){this.async(function(){this.click()},1)},_pressedChanged:function(t){this._changedButtonState()},_ariaActiveAttributeChanged:function(t,e){e&&e!=t&&this.hasAttribute(e)&&this.removeAttribute(e)},_activeChanged:function(t,e){this.toggles?this.setAttribute(this.ariaActiveAttribute,t?"true":"false"):this.removeAttribute(this.ariaActiveAttribute),this._changedButtonState()},_controlStateChanged:function(){this.disabled?this._setPressed(!1):this._changedButtonState()},_changedButtonState:function(){this._buttonStateChanged&&this._buttonStateChanged()}},Yr=[pt,Wi];var x={distance:function(t,e,s,r){var i=t-s,n=e-r;return Math.sqrt(i*i+n*n)},now:window.performance&&window.performance.now?window.performance.now.bind(window.performance):Date.now};function Qi(t){this.element=t,this.width=this.boundingRect.width,this.height=this.boundingRect.height,this.size=Math.max(this.width,this.height)}Qi.prototype={get boundingRect(){return this.element.getBoundingClientRect()},furthestCornerDistanceFrom:function(t,e){var s=x.distance(t,e,0,0),r=x.distance(t,e,this.width,0),i=x.distance(t,e,0,this.height),n=x.distance(t,e,this.width,this.height);return Math.max(s,r,i,n)}};function k(t){this.element=t,this.color=window.getComputedStyle(t).color,this.wave=document.createElement("div"),this.waveContainer=document.createElement("div"),this.wave.style.backgroundColor=this.color,this.wave.classList.add("wave"),this.waveContainer.classList.add("wave-container"),g(this.waveContainer).appendChild(this.wave),this.resetInteractionState()}k.MAX_RADIUS=300;k.prototype={get recenters(){return this.element.recenters},get center(){return this.element.center},get mouseDownElapsed(){var t;return this.mouseDownStart?(t=x.now()-this.mouseDownStart,this.mouseUpStart&&(t-=this.mouseUpElapsed),t):0},get mouseUpElapsed(){return this.mouseUpStart?x.now()-this.mouseUpStart:0},get mouseDownElapsedSeconds(){return this.mouseDownElapsed/1e3},get mouseUpElapsedSeconds(){return this.mouseUpElapsed/1e3},get mouseInteractionSeconds(){return this.mouseDownElapsedSeconds+this.mouseUpElapsedSeconds},get initialOpacity(){return this.element.initialOpacity},get opacityDecayVelocity(){return this.element.opacityDecayVelocity},get radius(){var t=this.containerMetrics.width*this.containerMetrics.width,e=this.containerMetrics.height*this.containerMetrics.height,s=Math.min(Math.sqrt(t+e),k.MAX_RADIUS)*1.1+5,r=1.1-.2*(s/k.MAX_RADIUS),i=this.mouseInteractionSeconds/r,n=s*(1-Math.pow(80,-i));return Math.abs(n)},get opacity(){return this.mouseUpStart?Math.max(0,this.initialOpacity-this.mouseUpElapsedSeconds*this.opacityDecayVelocity):this.initialOpacity},get outerOpacity(){var t=this.mouseUpElapsedSeconds*.3,e=this.opacity;return Math.max(0,Math.min(t,e))},get isOpacityFullyDecayed(){return this.opacity<.01&&this.radius>=Math.min(this.maxRadius,k.MAX_RADIUS)},get isRestingAtMaxRadius(){return this.opacity>=this.initialOpacity&&this.radius>=Math.min(this.maxRadius,k.MAX_RADIUS)},get isAnimationComplete(){return this.mouseUpStart?this.isOpacityFullyDecayed:this.isRestingAtMaxRadius},get translationFraction(){return Math.min(1,this.radius/this.containerMetrics.size*2/Math.sqrt(2))},get xNow(){return this.xEnd?this.xStart+this.translationFraction*(this.xEnd-this.xStart):this.xStart},get yNow(){return this.yEnd?this.yStart+this.translationFraction*(this.yEnd-this.yStart):this.yStart},get isMouseDown(){return this.mouseDownStart&&!this.mouseUpStart},resetInteractionState:function(){this.maxRadius=0,this.mouseDownStart=0,this.mouseUpStart=0,this.xStart=0,this.yStart=0,this.xEnd=0,this.yEnd=0,this.slideDistance=0,this.containerMetrics=new Qi(this.element)},draw:function(){var t,e,s;this.wave.style.opacity=this.opacity,t=this.radius/(this.containerMetrics.size/2),e=this.xNow-this.containerMetrics.width/2,s=this.yNow-this.containerMetrics.height/2,this.waveContainer.style.webkitTransform="translate("+e+"px, "+s+"px)",this.waveContainer.style.transform="translate3d("+e+"px, "+s+"px, 0)",this.wave.style.webkitTransform="scale("+t+","+t+")",this.wave.style.transform="scale3d("+t+","+t+",1)"},downAction:function(t){var e=this.containerMetrics.width/2,s=this.containerMetrics.height/2;this.resetInteractionState(),this.mouseDownStart=x.now(),this.center?(this.xStart=e,this.yStart=s,this.slideDistance=x.distance(this.xStart,this.yStart,this.xEnd,this.yEnd)):(this.xStart=t?t.detail.x-this.containerMetrics.boundingRect.left:this.containerMetrics.width/2,this.yStart=t?t.detail.y-this.containerMetrics.boundingRect.top:this.containerMetrics.height/2),this.recenters&&(this.xEnd=e,this.yEnd=s,this.slideDistance=x.distance(this.xStart,this.yStart,this.xEnd,this.yEnd)),this.maxRadius=this.containerMetrics.furthestCornerDistanceFrom(this.xStart,this.yStart),this.waveContainer.style.top=(this.containerMetrics.height-this.containerMetrics.size)/2+"px",this.waveContainer.style.left=(this.containerMetrics.width-this.containerMetrics.size)/2+"px",this.waveContainer.style.width=this.containerMetrics.size+"px",this.waveContainer.style.height=this.containerMetrics.size+"px"},upAction:function(t){this.isMouseDown&&(this.mouseUpStart=x.now())},remove:function(){g(g(this.waveContainer).parentNode).removeChild(this.waveContainer)}};T({_template:V`
    <style>
      :host {
        display: block;
        position: absolute;
        border-radius: inherit;
        overflow: hidden;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;

        /* See PolymerElements/paper-behaviors/issues/34. On non-Chrome browsers,
         * creating a node (with a position:absolute) in the middle of an event
         * handler "interrupts" that event handler (which happens when the
         * ripple is created on demand) */
        pointer-events: none;
      }

      :host([animating]) {
        /* This resolves a rendering issue in Chrome (as of 40) where the
           ripple is not properly clipped by its parent (which may have
           rounded corners). See: http://jsbin.com/temexa/4

           Note: We only apply this style conditionally. Otherwise, the browser
           will create a new compositing layer for every ripple element on the
           page, and that would be bad. */
        -webkit-transform: translate(0, 0);
        transform: translate3d(0, 0, 0);
      }

      #background,
      #waves,
      .wave-container,
      .wave {
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      #background,
      .wave {
        opacity: 0;
      }

      #waves,
      .wave {
        overflow: hidden;
      }

      .wave-container,
      .wave {
        border-radius: 50%;
      }

      :host(.circle) #background,
      :host(.circle) #waves {
        border-radius: 50%;
      }

      :host(.circle) .wave-container {
        overflow: hidden;
      }
    </style>

    <div id="background"></div>
    <div id="waves"></div>
`,is:"paper-ripple",behaviors:[pt],properties:{initialOpacity:{type:Number,value:.25},opacityDecayVelocity:{type:Number,value:.8},recenters:{type:Boolean,value:!1},center:{type:Boolean,value:!1},ripples:{type:Array,value:function(){return[]}},animating:{type:Boolean,readOnly:!0,reflectToAttribute:!0,value:!1},holdDown:{type:Boolean,value:!1,observer:"_holdDownChanged"},noink:{type:Boolean,value:!1},_animating:{type:Boolean},_boundAnimate:{type:Function,value:function(){return this.animate.bind(this)}}},get target(){return this.keyEventTarget},keyBindings:{"enter:keydown":"_onEnterKeydown","space:keydown":"_onSpaceKeydown","space:keyup":"_onSpaceKeyup"},attached:function(){g(this).parentNode.nodeType==11?this.keyEventTarget=g(this).getOwnerRoot().host:this.keyEventTarget=g(this).parentNode;var t=this.keyEventTarget;this.listen(t,"up","uiUpAction"),this.listen(t,"down","uiDownAction")},detached:function(){this.unlisten(this.keyEventTarget,"up","uiUpAction"),this.unlisten(this.keyEventTarget,"down","uiDownAction"),this.keyEventTarget=null},get shouldKeepAnimating(){for(var t=0;t<this.ripples.length;++t)if(!this.ripples[t].isAnimationComplete)return!0;return!1},simulatedRipple:function(){this.downAction(null),this.async(function(){this.upAction()},1)},uiDownAction:function(t){this.noink||this.downAction(t)},downAction:function(t){if(!(this.holdDown&&this.ripples.length>0)){var e=this.addRipple();e.downAction(t),this._animating||(this._animating=!0,this.animate())}},uiUpAction:function(t){this.noink||this.upAction(t)},upAction:function(t){this.holdDown||(this.ripples.forEach(function(e){e.upAction(t)}),this._animating=!0,this.animate())},onAnimationComplete:function(){this._animating=!1,this.$.background.style.backgroundColor="",this.fire("transitionend")},addRipple:function(){var t=new k(this);return g(this.$.waves).appendChild(t.waveContainer),this.$.background.style.backgroundColor=t.color,this.ripples.push(t),this._setAnimating(!0),t},removeRipple:function(t){var e=this.ripples.indexOf(t);e<0||(this.ripples.splice(e,1),t.remove(),this.ripples.length||this._setAnimating(!1))},animate:function(){if(this._animating){var t,e;for(t=0;t<this.ripples.length;++t)e=this.ripples[t],e.draw(),this.$.background.style.opacity=e.outerOpacity,e.isOpacityFullyDecayed&&!e.isRestingAtMaxRadius&&this.removeRipple(e);!this.shouldKeepAnimating&&this.ripples.length===0?this.onAnimationComplete():window.requestAnimationFrame(this._boundAnimate)}},animateRipple:function(){return this.animate()},_onEnterKeydown:function(){this.uiDownAction(),this.async(this.uiUpAction,1)},_onSpaceKeydown:function(){this.uiDownAction()},_onSpaceKeyup:function(){this.uiUpAction()},_holdDownChanged:function(t,e){e!==void 0&&(t?this.downAction():this.upAction())}});const Zi={properties:{noink:{type:Boolean,observer:"_noinkChanged"},_rippleContainer:{type:Object}},_buttonStateChanged:function(){this.focused&&this.ensureRipple()},_downHandler:function(t){Wi._downHandler.call(this,t),this.pressed&&this.ensureRipple(t)},ensureRipple:function(t){if(!this.hasRipple()){this._ripple=this._createRipple(),this._ripple.noink=this.noink;var e=this._rippleContainer||this.root;if(e&&g(e).appendChild(this._ripple),t){var s=g(this._rippleContainer||this),r=g(t).rootTarget;s.deepContains(r)&&this._ripple.uiDownAction(t)}}},getRipple:function(){return this.ensureRipple(),this._ripple},hasRipple:function(){return!!this._ripple},_createRipple:function(){var t=document.createElement("paper-ripple");return t},_noinkChanged:function(t){this.hasRipple()&&(this._ripple.noink=t)}};const Jr={observers:["_focusedChanged(receivedFocusFromKeyboard)"],_focusedChanged:function(t){t&&this.ensureRipple(),this.hasRipple()&&(this._ripple.holdDown=t)},_createRipple:function(){var t=Zi._createRipple();return t.id="ink",t.setAttribute("center",""),t.classList.add("circle"),t}},Gr=[Yr,qr,Zi,Jr];T({is:"paper-icon-button",_template:V`
    <style>
      :host {
        display: inline-block;
        position: relative;
        padding: 8px;
        outline: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        cursor: pointer;
        z-index: 0;
        line-height: 1;

        width: 40px;
        height: 40px;

        /*
          NOTE: Both values are needed, since some phones require the value to
          be \`transparent\`.
        */
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        -webkit-tap-highlight-color: transparent;

        /* Because of polymer/2558, this style has lower specificity than * */
        box-sizing: border-box !important;

        @apply --paper-icon-button;
      }

      :host #ink {
        color: var(--paper-icon-button-ink-color, var(--primary-text-color));
        opacity: 0.6;
      }

      :host([disabled]) {
        color: var(--paper-icon-button-disabled-text, var(--disabled-text-color));
        pointer-events: none;
        cursor: auto;

        @apply --paper-icon-button-disabled;
      }

      :host([hidden]) {
        display: none !important;
      }

      :host(:hover) {
        @apply --paper-icon-button-hover;
      }

      iron-icon {
        --iron-icon-width: 100%;
        --iron-icon-height: 100%;
      }
    </style>

    <iron-icon id="icon" src="[[src]]" icon="[[icon]]"
               alt$="[[alt]]"></iron-icon>
  `,hostAttributes:{role:"button",tabindex:"0"},behaviors:[Gr],registered:function(){this._template.setAttribute("strip-whitespace","")},properties:{src:{type:String},icon:{type:String},alt:{type:String,observer:"_altChanged"}},_altChanged:function(t,e){var s=this.getAttribute("aria-label");(!s||e==s)&&this.setAttribute("aria-label",t)}});T({is:"iron-iconset-svg",properties:{name:{type:String,observer:"_nameChanged"},size:{type:Number,value:24},rtlMirroring:{type:Boolean,value:!1},useGlobalRtlAttribute:{type:Boolean,value:!1}},created:function(){this._meta=new M({type:"iconset",key:null,value:null})},attached:function(){this.style.display="none"},getIconNames:function(){return this._icons=this._createIconMap(),Object.keys(this._icons).map(function(t){return this.name+":"+t},this)},applyIcon:function(t,e){this.removeIcon(t);var s=this._cloneIcon(e,this.rtlMirroring&&this._targetIsRTL(t));if(s){var r=g(t.root||t);return r.insertBefore(s,r.childNodes[0]),t._svgIcon=s}return null},removeIcon:function(t){t._svgIcon&&(g(t.root||t).removeChild(t._svgIcon),t._svgIcon=null)},_targetIsRTL:function(t){if(this.__targetIsRTL==null)if(this.useGlobalRtlAttribute){var e=document.body&&document.body.hasAttribute("dir")?document.body:document.documentElement;this.__targetIsRTL=e.getAttribute("dir")==="rtl"}else t&&t.nodeType!==Node.ELEMENT_NODE&&(t=t.host),this.__targetIsRTL=t&&window.getComputedStyle(t).direction==="rtl";return this.__targetIsRTL},_nameChanged:function(){this._meta.value=null,this._meta.key=this.name,this._meta.value=this,this.async(function(){this.fire("iron-iconset-added",this,{node:window})})},_createIconMap:function(){var t=Object.create(null);return g(this).querySelectorAll("[id]").forEach(function(e){t[e.id]=e}),t},_cloneIcon:function(t,e){return this._icons=this._icons||this._createIconMap(),this._prepareSvgClone(this._icons[t],this.size,e)},_prepareSvgClone:function(t,e,s){if(t){var r=t.cloneNode(!0),i=document.createElementNS("http://www.w3.org/2000/svg","svg"),n=r.getAttribute("viewBox")||"0 0 "+e+" "+e,l="pointer-events: none; display: block; width: 100%; height: 100%;";return s&&r.hasAttribute("mirror-in-rtl")&&(l+="-webkit-transform:scale(-1,1);transform:scale(-1,1);transform-origin:center;"),i.setAttribute("viewBox",n),i.setAttribute("preserveAspectRatio","xMidYMid meet"),i.setAttribute("focusable","false"),i.style.cssText=l,i.appendChild(r).removeAttribute("id"),i}return null}});const Xr=V`<iron-iconset-svg name="icons" size="24">
<svg><defs>
<g id="3d-rotation"><path d="M7.52 21.48C4.25 19.94 1.91 16.76 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32zm.89-6.52c-.19 0-.37-.03-.52-.08-.16-.06-.29-.13-.4-.24-.11-.1-.2-.22-.26-.37-.06-.14-.09-.3-.09-.47h-1.3c0 .36.07.68.21.95.14.27.33.5.56.69.24.18.51.32.82.41.3.1.62.15.96.15.37 0 .72-.05 1.03-.15.32-.1.6-.25.83-.44s.42-.43.55-.72c.13-.29.2-.61.2-.97 0-.19-.02-.38-.07-.56-.05-.18-.12-.35-.23-.51-.1-.16-.24-.3-.4-.43-.17-.13-.37-.23-.61-.31.2-.09.37-.2.52-.33.15-.13.27-.27.37-.42.1-.15.17-.3.22-.46.05-.16.07-.32.07-.48 0-.36-.06-.68-.18-.96-.12-.28-.29-.51-.51-.69-.2-.19-.47-.33-.77-.43C9.1 8.05 8.76 8 8.39 8c-.36 0-.69.05-1 .16-.3.11-.57.26-.79.45-.21.19-.38.41-.51.67-.12.26-.18.54-.18.85h1.3c0-.17.03-.32.09-.45s.14-.25.25-.34c.11-.09.23-.17.38-.22.15-.05.3-.08.48-.08.4 0 .7.1.89.31.19.2.29.49.29.86 0 .18-.03.34-.08.49-.05.15-.14.27-.25.37-.11.1-.25.18-.41.24-.16.06-.36.09-.58.09H7.5v1.03h.77c.22 0 .42.02.6.07s.33.13.45.23c.12.11.22.24.29.4.07.16.1.35.1.57 0 .41-.12.72-.35.93-.23.23-.55.33-.95.33zm8.55-5.92c-.32-.33-.7-.59-1.14-.77-.43-.18-.92-.27-1.46-.27H12v8h2.3c.55 0 1.06-.09 1.51-.27.45-.18.84-.43 1.16-.76.32-.33.57-.73.74-1.19.17-.47.26-.99.26-1.57v-.4c0-.58-.09-1.1-.26-1.57-.18-.47-.43-.87-.75-1.2zm-.39 3.16c0 .42-.05.79-.14 1.13-.1.33-.24.62-.43.85-.19.23-.43.41-.71.53-.29.12-.62.18-.99.18h-.91V9.12h.97c.72 0 1.27.23 1.64.69.38.46.57 1.12.57 1.99v.4zM12 0l-.66.03 3.81 3.81 1.33-1.33c3.27 1.55 5.61 4.72 5.96 8.48h1.5C23.44 4.84 18.29 0 12 0z"></path></g>
<g id="accessibility"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"></path></g>
<g id="accessible"><circle cx="12" cy="4" r="2"></circle><path d="M19 13v-2c-1.54.02-3.09-.75-4.07-1.83l-1.29-1.43c-.17-.19-.38-.34-.61-.45-.01 0-.01-.01-.02-.01H13c-.35-.2-.75-.3-1.19-.26C10.76 7.11 10 8.04 10 9.09V15c0 1.1.9 2 2 2h5v5h2v-5.5c0-1.1-.9-2-2-2h-3v-3.45c1.29 1.07 3.25 1.94 5 1.95zm-6.17 5c-.41 1.16-1.52 2-2.83 2-1.66 0-3-1.34-3-3 0-1.31.84-2.41 2-2.83V12.1c-2.28.46-4 2.48-4 4.9 0 2.76 2.24 5 5 5 2.42 0 4.44-1.72 4.9-4h-2.07z"></path></g>
<g id="account-balance"><path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"></path></g>
<g id="account-balance-wallet"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path></g>
<g id="account-box"><path d="M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z"></path></g>
<g id="account-circle"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"></path></g>
<g id="add"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></g>
<g id="add-alert"><path d="M10.01 21.01c0 1.1.89 1.99 1.99 1.99s1.99-.89 1.99-1.99h-3.98zm8.87-4.19V11c0-3.25-2.25-5.97-5.29-6.69v-.72C13.59 2.71 12.88 2 12 2s-1.59.71-1.59 1.59v.72C7.37 5.03 5.12 7.75 5.12 11v5.82L3 18.94V20h18v-1.06l-2.12-2.12zM16 13.01h-3v3h-2v-3H8V11h3V8h2v3h3v2.01z"></path></g>
<g id="add-box"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"></path></g>
<g id="add-circle"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"></path></g>
<g id="add-circle-outline"><path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></g>
<g id="add-shopping-cart"><path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"></path></g>
<g id="alarm"><path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path></g>
<g id="alarm-add"><path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm1-11h-2v3H8v2h3v3h2v-3h3v-2h-3V9z"></path></g>
<g id="alarm-off"><path d="M12 6c3.87 0 7 3.13 7 7 0 .84-.16 1.65-.43 2.4l1.52 1.52c.58-1.19.91-2.51.91-3.92 0-4.97-4.03-9-9-9-1.41 0-2.73.33-3.92.91L9.6 6.43C10.35 6.16 11.16 6 12 6zm10-.28l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM2.92 2.29L1.65 3.57 2.98 4.9l-1.11.93 1.42 1.42 1.11-.94.8.8C3.83 8.69 3 10.75 3 13c0 4.97 4.02 9 9 9 2.25 0 4.31-.83 5.89-2.2l2.2 2.2 1.27-1.27L3.89 3.27l-.97-.98zm13.55 16.1C15.26 19.39 13.7 20 12 20c-3.87 0-7-3.13-7-7 0-1.7.61-3.26 1.61-4.47l9.86 9.86zM8.02 3.28L6.6 1.86l-.86.71 1.42 1.42.86-.71z"></path></g>
<g id="alarm-on"><path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm-1.46-5.47L8.41 12.4l-1.06 1.06 3.18 3.18 6-6-1.06-1.06-4.93 4.95z"></path></g>
<g id="all-out"><path d="M16.21 4.16l4 4v-4zm4 12l-4 4h4zm-12 4l-4-4v4zm-4-12l4-4h-4zm12.95-.95c-2.73-2.73-7.17-2.73-9.9 0s-2.73 7.17 0 9.9 7.17 2.73 9.9 0 2.73-7.16 0-9.9zm-1.1 8.8c-2.13 2.13-5.57 2.13-7.7 0s-2.13-5.57 0-7.7 5.57-2.13 7.7 0 2.13 5.57 0 7.7z"></path></g>
<g id="android"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"></path></g>
<g id="announcement"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"></path></g>
<g id="apps"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"></path></g>
<g id="archive"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"></path></g>
<g id="arrow-back"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></g>
<g id="arrow-downward"><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"></path></g>
<g id="arrow-drop-down"><path d="M7 10l5 5 5-5z"></path></g>
<g id="arrow-drop-down-circle"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 12l-4-4h8l-4 4z"></path></g>
<g id="arrow-drop-up"><path d="M7 14l5-5 5 5z"></path></g>
<g id="arrow-forward"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></g>
<g id="arrow-upward"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"></path></g>
<g id="aspect-ratio"><path d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"></path></g>
<g id="assessment"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"></path></g>
<g id="assignment"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path></g>
<g id="assignment-ind"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z"></path></g>
<g id="assignment-late"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 15h-2v-2h2v2zm0-4h-2V8h2v6zm-1-9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"></path></g>
<g id="assignment-return"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm4 12h-4v3l-5-5 5-5v3h4v4z"></path></g>
<g id="assignment-returned"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 15l-5-5h3V9h4v4h3l-5 5z"></path></g>
<g id="assignment-turned-in"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"></path></g>
<g id="attachment"><path d="M2 12.5C2 9.46 4.46 7 7.5 7H18c2.21 0 4 1.79 4 4s-1.79 4-4 4H9.5C8.12 15 7 13.88 7 12.5S8.12 10 9.5 10H17v2H9.41c-.55 0-.55 1 0 1H18c1.1 0 2-.9 2-2s-.9-2-2-2H7.5C5.57 9 4 10.57 4 12.5S5.57 16 7.5 16H17v2H7.5C4.46 18 2 15.54 2 12.5z"></path></g>
<g id="autorenew"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"></path></g>
<g id="backspace"><path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"></path></g>
<g id="backup"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"></path></g>
<g id="block"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"></path></g>
<g id="book"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"></path></g>
<g id="bookmark"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"></path></g>
<g id="bookmark-border"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"></path></g>
<g id="bug-report"><path d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z"></path></g>
<g id="build"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"></path></g>
<g id="cached"><path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"></path></g>
<g id="camera-enhance"><path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-1l1.25-2.75L16 13l-2.75-1.25L12 9l-1.25 2.75L8 13l2.75 1.25z"></path></g>
<g id="cancel"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></g>
<g id="card-giftcard"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"></path></g>
<g id="card-membership"><path d="M20 2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h4v5l4-2 4 2v-5h4c1.11 0 2-.89 2-2V4c0-1.11-.89-2-2-2zm0 13H4v-2h16v2zm0-5H4V4h16v6z"></path></g>
<g id="card-travel"><path d="M20 6h-3V4c0-1.11-.89-2-2-2H9c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4h6v2H9V4zm11 15H4v-2h16v2zm0-5H4V8h3v2h2V8h6v2h2V8h3v6z"></path></g>
<g id="change-history"><path d="M12 7.77L18.39 18H5.61L12 7.77M12 4L2 20h20L12 4z"></path></g>
<g id="check"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></g>
<g id="check-box"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></g>
<g id="check-box-outline-blank"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></g>
<g id="check-circle"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></g>
<g id="chevron-left"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></g>
<g id="chevron-right"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></g>
<g id="chrome-reader-mode"><path d="M13 12h7v1.5h-7zm0-2.5h7V11h-7zm0 5h7V16h-7zM21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15h-9V6h9v13z"></path></g>
<g id="class"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"></path></g>
<g id="clear"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g>
<g id="close"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g>
<g id="cloud"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"></path></g>
<g id="cloud-circle"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14H8c-1.66 0-3-1.34-3-3s1.34-3 3-3l.14.01C8.58 8.28 10.13 7 12 7c2.21 0 4 1.79 4 4h.5c1.38 0 2.5 1.12 2.5 2.5S17.88 16 16.5 16z"></path></g>
<g id="cloud-done"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17 15.18 9l1.41 1.41L10 17z"></path></g>
<g id="cloud-download"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"></path></g>
<g id="cloud-off"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z"></path></g>
<g id="cloud-queue"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h.71C7.37 7.69 9.48 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3s-1.34 3-3 3z"></path></g>
<g id="cloud-upload"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"></path></g>
<g id="code"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path></g>
<g id="compare-arrows"><path d="M9.01 14H2v2h7.01v3L13 15l-3.99-4v3zm5.98-1v-3H22V8h-7.01V5L11 9l3.99 4z"></path></g>
<g id="content-copy"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></g>
<g id="content-cut"><path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3z"></path></g>
<g id="content-paste"><path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"></path></g>
<g id="copyright"><path d="M10.08 10.86c.05-.33.16-.62.3-.87s.34-.46.59-.62c.24-.15.54-.22.91-.23.23.01.44.05.63.13.2.09.38.21.52.36s.25.33.34.53.13.42.14.64h1.79c-.02-.47-.11-.9-.28-1.29s-.4-.73-.7-1.01-.66-.5-1.08-.66-.88-.23-1.39-.23c-.65 0-1.22.11-1.7.34s-.88.53-1.2.92-.56.84-.71 1.36S8 11.29 8 11.87v.27c0 .58.08 1.12.23 1.64s.39.97.71 1.35.72.69 1.2.91 1.05.34 1.7.34c.47 0 .91-.08 1.32-.23s.77-.36 1.08-.63.56-.58.74-.94.29-.74.3-1.15h-1.79c-.01.21-.06.4-.15.58s-.21.33-.36.46-.32.23-.52.3c-.19.07-.39.09-.6.1-.36-.01-.66-.08-.89-.23-.25-.16-.45-.37-.59-.62s-.25-.55-.3-.88-.08-.67-.08-1v-.27c0-.35.03-.68.08-1.01zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></g>
<g id="create"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></g>
<g id="create-new-folder"><path d="M20 6h-8l-2-2H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z"></path></g>
<g id="credit-card"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"></path></g>
<g id="dashboard"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"></path></g>
<g id="date-range"><path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"></path></g>
<g id="delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></g>
<g id="delete-forever"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"></path></g>
<g id="delete-sweep"><path d="M15 16h4v2h-4zm0-8h7v2h-7zm0 4h6v2h-6zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zM14 5h-3l-1-1H6L5 5H2v2h12z"></path></g>
<g id="description"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"></path></g>
<g id="dns"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"></path></g>
<g id="done"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path></g>
<g id="done-all"><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"></path></g>
<g id="donut-large"><path d="M11 5.08V2c-5 .5-9 4.81-9 10s4 9.5 9 10v-3.08c-3-.48-6-3.4-6-6.92s3-6.44 6-6.92zM18.97 11H22c-.47-5-4-8.53-9-9v3.08C16 5.51 18.54 8 18.97 11zM13 18.92V22c5-.47 8.53-4 9-9h-3.03c-.43 3-2.97 5.49-5.97 5.92z"></path></g>
<g id="donut-small"><path d="M11 9.16V2c-5 .5-9 4.79-9 10s4 9.5 9 10v-7.16c-1-.41-2-1.52-2-2.84s1-2.43 2-2.84zM14.86 11H22c-.48-4.75-4-8.53-9-9v7.16c1 .3 1.52.98 1.86 1.84zM13 14.84V22c5-.47 8.52-4.25 9-9h-7.14c-.34.86-.86 1.54-1.86 1.84z"></path></g>
<g id="drafts"><path d="M21.99 8c0-.72-.37-1.35-.94-1.7L12 1 2.95 6.3C2.38 6.65 2 7.28 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l-.01-10zM12 13L3.74 7.84 12 3l8.26 4.84L12 13z"></path></g>
<g id="eject"><path d="M5 17h14v2H5zm7-12L5.33 15h13.34z"></path></g>
<g id="error"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></g>
<g id="error-outline"><path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path></g>
<g id="euro-symbol"><path d="M15 18.5c-2.51 0-4.68-1.42-5.76-3.5H15v-2H8.58c-.05-.33-.08-.66-.08-1s.03-.67.08-1H15V9H9.24C10.32 6.92 12.5 5.5 15 5.5c1.61 0 3.09.59 4.23 1.57L21 5.3C19.41 3.87 17.3 3 15 3c-3.92 0-7.24 2.51-8.48 6H3v2h3.06c-.04.33-.06.66-.06 1 0 .34.02.67.06 1H3v2h3.52c1.24 3.49 4.56 6 8.48 6 2.31 0 4.41-.87 6-2.3l-1.78-1.77c-1.13.98-2.6 1.57-4.22 1.57z"></path></g>
<g id="event"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"></path></g>
<g id="event-seat"><path d="M4 18v3h3v-3h10v3h3v-6H4zm15-8h3v3h-3zM2 10h3v3H2zm15 3H7V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v8z"></path></g>
<g id="exit-to-app"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></g>
<g id="expand-less"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"></path></g>
<g id="expand-more"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path></g>
<g id="explore"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"></path></g>
<g id="extension"><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"></path></g>
<g id="face"><path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"></path></g>
<g id="favorite"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></g>
<g id="favorite-border"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"></path></g>
<g id="feedback"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"></path></g>
<g id="file-download"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></g>
<g id="file-upload"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"></path></g>
<g id="filter-list"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"></path></g>
<g id="find-in-page"><path d="M20 19.59V8l-6-6H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c.45 0 .85-.15 1.19-.4l-4.43-4.43c-.8.52-1.74.83-2.76.83-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5c0 1.02-.31 1.96-.83 2.75L20 19.59zM9 13c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3z"></path></g>
<g id="find-replace"><path d="M11 6c1.38 0 2.63.56 3.54 1.46L12 10h6V4l-2.05 2.05C14.68 4.78 12.93 4 11 4c-3.53 0-6.43 2.61-6.92 6H6.1c.46-2.28 2.48-4 4.9-4zm5.64 9.14c.66-.9 1.12-1.97 1.28-3.14H15.9c-.46 2.28-2.48 4-4.9 4-1.38 0-2.63-.56-3.54-1.46L10 12H4v6l2.05-2.05C7.32 17.22 9.07 18 11 18c1.55 0 2.98-.51 4.14-1.36L20 21.49 21.49 20l-4.85-4.86z"></path></g>
<g id="fingerprint"><path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z"></path></g>
<g id="first-page"><path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path></g>
<g id="flag"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"></path></g>
<g id="flight-land"><path d="M2.5 19h19v2h-19zm7.18-5.73l4.35 1.16 5.31 1.42c.8.21 1.62-.26 1.84-1.06.21-.8-.26-1.62-1.06-1.84l-5.31-1.42-2.76-9.02L10.12 2v8.28L5.15 8.95l-.93-2.32-1.45-.39v5.17l1.6.43 5.31 1.43z"></path></g>
<g id="flight-takeoff"><path d="M2.5 19h19v2h-19zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 1.82 3.16.77 1.33 1.6-.43 5.31-1.42 4.35-1.16L21 11.49c.81-.23 1.28-1.05 1.07-1.85z"></path></g>
<g id="flip-to-back"><path d="M9 7H7v2h2V7zm0 4H7v2h2v-2zm0-8c-1.11 0-2 .9-2 2h2V3zm4 12h-2v2h2v-2zm6-12v2h2c0-1.1-.9-2-2-2zm-6 0h-2v2h2V3zM9 17v-2H7c0 1.1.89 2 2 2zm10-4h2v-2h-2v2zm0-4h2V7h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zM5 7H3v12c0 1.1.89 2 2 2h12v-2H5V7zm10-2h2V3h-2v2zm0 12h2v-2h-2v2z"></path></g>
<g id="flip-to-front"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm2 4v-2H3c0 1.1.89 2 2 2zM3 9h2V7H3v2zm12 12h2v-2h-2v2zm4-18H9c-1.11 0-2 .9-2 2v10c0 1.1.89 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H9V5h10v10zm-8 6h2v-2h-2v2zm-4 0h2v-2H7v2z"></path></g>
<g id="folder"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path></g>
<g id="folder-open"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"></path></g>
<g id="folder-shared"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 8h-8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z"></path></g>
<g id="font-download"><path d="M9.93 13.5h4.14L12 7.98zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z"></path></g>
<g id="forward"><path d="M12 8V4l8 8-8 8v-4H4V8z"></path></g>
<g id="fullscreen"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path></g>
<g id="fullscreen-exit"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path></g>
<g id="g-translate"><path d="M20 5h-9.12L10 2H4c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h7l1 3h8c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM7.17 14.59c-2.25 0-4.09-1.83-4.09-4.09s1.83-4.09 4.09-4.09c1.04 0 1.99.37 2.74 1.07l.07.06-1.23 1.18-.06-.05c-.29-.27-.78-.59-1.52-.59-1.31 0-2.38 1.09-2.38 2.42s1.07 2.42 2.38 2.42c1.37 0 1.96-.87 2.12-1.46H7.08V9.91h3.95l.01.07c.04.21.05.4.05.61 0 2.35-1.61 4-3.92 4zm6.03-1.71c.33.6.74 1.18 1.19 1.7l-.54.53-.65-2.23zm.77-.76h-.99l-.31-1.04h3.99s-.34 1.31-1.56 2.74c-.52-.62-.89-1.23-1.13-1.7zM21 20c0 .55-.45 1-1 1h-7l2-2-.81-2.77.92-.92L17.79 18l.73-.73-2.71-2.68c.9-1.03 1.6-2.25 1.92-3.51H19v-1.04h-3.64V9h-1.04v1.04h-1.96L11.18 6H20c.55 0 1 .45 1 1v13z"></path></g>
<g id="gavel"><path d="M1 21h12v2H1zM5.245 8.07l2.83-2.827 14.14 14.142-2.828 2.828zM12.317 1l5.657 5.656-2.83 2.83-5.654-5.66zM3.825 9.485l5.657 5.657-2.828 2.828-5.657-5.657z"></path></g>
<g id="gesture"><path d="M4.59 6.89c.7-.71 1.4-1.35 1.71-1.22.5.2 0 1.03-.3 1.52-.25.42-2.86 3.89-2.86 6.31 0 1.28.48 2.34 1.34 2.98.75.56 1.74.73 2.64.46 1.07-.31 1.95-1.4 3.06-2.77 1.21-1.49 2.83-3.44 4.08-3.44 1.63 0 1.65 1.01 1.76 1.79-3.78.64-5.38 3.67-5.38 5.37 0 1.7 1.44 3.09 3.21 3.09 1.63 0 4.29-1.33 4.69-6.1H21v-2.5h-2.47c-.15-1.65-1.09-4.2-4.03-4.2-2.25 0-4.18 1.91-4.94 2.84-.58.73-2.06 2.48-2.29 2.72-.25.3-.68.84-1.11.84-.45 0-.72-.83-.36-1.92.35-1.09 1.4-2.86 1.85-3.52.78-1.14 1.3-1.92 1.3-3.28C8.95 3.69 7.31 3 6.44 3 5.12 3 3.97 4 3.72 4.25c-.36.36-.66.66-.88.93l1.75 1.71zm9.29 11.66c-.31 0-.74-.26-.74-.72 0-.6.73-2.2 2.87-2.76-.3 2.69-1.43 3.48-2.13 3.48z"></path></g>
<g id="get-app"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></g>
<g id="gif"><path d="M11.5 9H13v6h-1.5zM9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1zm10 1.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z"></path></g>
<g id="grade"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></g>
<g id="group-work"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 17.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM9.5 8c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8zm6.5 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path></g>
<g id="help"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"></path></g>
<g id="help-outline"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"></path></g>
<g id="highlight-off"><path d="M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41 14.59 8zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></g>
<g id="history"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"></path></g>
<g id="home"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></g>
<g id="hourglass-empty"><path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z"></path></g>
<g id="hourglass-full"><path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6z"></path></g>
<g id="http"><path d="M4.5 11h-2V9H1v6h1.5v-2.5h2V15H6V9H4.5v2zm2.5-.5h1.5V15H10v-4.5h1.5V9H7v1.5zm5.5 0H14V15h1.5v-4.5H17V9h-4.5v1.5zm9-1.5H18v6h1.5v-2h2c.8 0 1.5-.7 1.5-1.5v-1c0-.8-.7-1.5-1.5-1.5zm0 2.5h-2v-1h2v1z"></path></g>
<g id="https"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"></path></g>
<g id="important-devices"><path d="M23 11.01L18 11c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-9c0-.55-.45-.99-1-.99zM23 20h-5v-7h5v7zM20 2H2C.89 2 0 2.89 0 4v12c0 1.1.89 2 2 2h7v2H7v2h8v-2h-2v-2h2v-2H2V4h18v5h2V4c0-1.11-.9-2-2-2zm-8.03 7L11 6l-.97 3H7l2.47 1.76-.94 2.91 2.47-1.8 2.47 1.8-.94-2.91L15 9h-3.03z"></path></g>
<g id="inbox"><path d="M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z"></path></g>
<g id="indeterminate-check-box"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"></path></g>
<g id="info"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></g>
<g id="info-outline"><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"></path></g>
<g id="input"><path d="M21 3.01H3c-1.1 0-2 .9-2 2V9h2V4.99h18v14.03H3V15H1v4.01c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98v-14c0-1.11-.9-2-2-2zM11 16l4-4-4-4v3H1v2h10v3z"></path></g>
<g id="invert-colors"><path d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"></path></g>
<g id="label"><path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"></path></g>
<g id="label-outline"><path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16zM16 17H5V7h11l3.55 5L16 17z"></path></g>
<g id="language"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"></path></g>
<g id="last-page"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"></path></g>
<g id="launch"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"></path></g>
<g id="lightbulb-outline"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"></path></g>
<g id="line-style"><path d="M3 16h5v-2H3v2zm6.5 0h5v-2h-5v2zm6.5 0h5v-2h-5v2zM3 20h2v-2H3v2zm4 0h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zM3 12h8v-2H3v2zm10 0h8v-2h-8v2zM3 4v4h18V4H3z"></path></g>
<g id="line-weight"><path d="M3 17h18v-2H3v2zm0 3h18v-1H3v1zm0-7h18v-3H3v3zm0-9v4h18V4H3z"></path></g>
<g id="link"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"></path></g>
<g id="list"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"></path></g>
<g id="lock"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"></path></g>
<g id="lock-open"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"></path></g>
<g id="lock-outline"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6zM18 20H6V10h12v10z"></path></g>
<g id="low-priority"><path d="M14 5h8v2h-8zm0 5.5h8v2h-8zm0 5.5h8v2h-8zM2 11.5C2 15.08 4.92 18 8.5 18H9v2l3-3-3-3v2h-.5C6.02 16 4 13.98 4 11.5S6.02 7 8.5 7H12V5H8.5C4.92 5 2 7.92 2 11.5z"></path></g>
<g id="loyalty"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7zm11.77 8.27L13 19.54l-4.27-4.27C8.28 14.81 8 14.19 8 13.5c0-1.38 1.12-2.5 2.5-2.5.69 0 1.32.28 1.77.74l.73.72.73-.73c.45-.45 1.08-.73 1.77-.73 1.38 0 2.5 1.12 2.5 2.5 0 .69-.28 1.32-.73 1.77z"></path></g>
<g id="mail"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path></g>
<g id="markunread"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path></g>
<g id="markunread-mailbox"><path d="M20 6H10v6H8V4h6V0H6v6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"></path></g>
<g id="menu"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></g>
<g id="more-horiz"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></g>
<g id="more-vert"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></g>
<g id="motorcycle"><path d="M19.44 9.03L15.41 5H11v2h3.59l2 2H5c-2.8 0-5 2.2-5 5s2.2 5 5 5c2.46 0 4.45-1.69 4.9-4h1.65l2.77-2.77c-.21.54-.32 1.14-.32 1.77 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.65-1.97-4.77-4.56-4.97zM7.82 15C7.4 16.15 6.28 17 5 17c-1.63 0-3-1.37-3-3s1.37-3 3-3c1.28 0 2.4.85 2.82 2H5v2h2.82zM19 17c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"></path></g>
<g id="move-to-inbox"><path d="M19 3H4.99c-1.11 0-1.98.9-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10zm-3-5h-2V7h-4v3H8l4 4 4-4z"></path></g>
<g id="next-week"><path d="M20 7h-4V5c0-.55-.22-1.05-.59-1.41C15.05 3.22 14.55 3 14 3h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5zm1 13.5l-1-1 3-3-3-3 1-1 4 4-4 4z"></path></g>
<g id="note-add"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z"></path></g>
<g id="offline-pin"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm5 16H7v-2h10v2zm-6.7-4L7 10.7l1.4-1.4 1.9 1.9 5.3-5.3L17 7.3 10.3 14z"></path></g>
<g id="opacity"><path d="M17.66 8L12 2.35 6.34 8C4.78 9.56 4 11.64 4 13.64s.78 4.11 2.34 5.67 3.61 2.35 5.66 2.35 4.1-.79 5.66-2.35S20 15.64 20 13.64 19.22 9.56 17.66 8zM6 14c.01-2 .62-3.27 1.76-4.4L12 5.27l4.24 4.38C17.38 10.77 17.99 12 18 14H6z"></path></g>
<g id="open-in-browser"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h4v-2H5V8h14v10h-4v2h4c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-7 6l-4 4h3v6h2v-6h3l-4-4z"></path></g>
<g id="open-in-new"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"></path></g>
<g id="open-with"><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"></path></g>
<g id="pageview"><path d="M11.5 9C10.12 9 9 10.12 9 11.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5S12.88 9 11.5 9zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-3.21 14.21l-2.91-2.91c-.69.44-1.51.7-2.39.7C9.01 16 7 13.99 7 11.5S9.01 7 11.5 7 16 9.01 16 11.5c0 .88-.26 1.69-.7 2.39l2.91 2.9-1.42 1.42z"></path></g>
<g id="pan-tool"><path d="M23 5.5V20c0 2.2-1.8 4-4 4h-7.3c-1.08 0-2.1-.43-2.85-1.19L1 14.83s1.26-1.23 1.3-1.25c.22-.19.49-.29.79-.29.22 0 .42.06.6.16.04.01 4.31 2.46 4.31 2.46V4c0-.83.67-1.5 1.5-1.5S11 3.17 11 4v7h1V1.5c0-.83.67-1.5 1.5-1.5S15 .67 15 1.5V11h1V2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V11h1V5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5z"></path></g>
<g id="payment"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"></path></g>
<g id="perm-camera-mic"><path d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v-2.09c-2.83-.48-5-2.94-5-5.91h2c0 2.21 1.79 4 4 4s4-1.79 4-4h2c0 2.97-2.17 5.43-5 5.91V21h7c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-6 8c0 1.1-.9 2-2 2s-2-.9-2-2V9c0-1.1.9-2 2-2s2 .9 2 2v4z"></path></g>
<g id="perm-contact-calendar"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1z"></path></g>
<g id="perm-data-setting"><path d="M18.99 11.5c.34 0 .67.03 1 .07L20 0 0 20h11.56c-.04-.33-.07-.66-.07-1 0-4.14 3.36-7.5 7.5-7.5zm3.71 7.99c.02-.16.04-.32.04-.49 0-.17-.01-.33-.04-.49l1.06-.83c.09-.08.12-.21.06-.32l-1-1.73c-.06-.11-.19-.15-.31-.11l-1.24.5c-.26-.2-.54-.37-.85-.49l-.19-1.32c-.01-.12-.12-.21-.24-.21h-2c-.12 0-.23.09-.25.21l-.19 1.32c-.3.13-.59.29-.85.49l-1.24-.5c-.11-.04-.24 0-.31.11l-1 1.73c-.06.11-.04.24.06.32l1.06.83c-.02.16-.03.32-.03.49 0 .17.01.33.03.49l-1.06.83c-.09.08-.12.21-.06.32l1 1.73c.06.11.19.15.31.11l1.24-.5c.26.2.54.37.85.49l.19 1.32c.02.12.12.21.25.21h2c.12 0 .23-.09.25-.21l.19-1.32c.3-.13.59-.29.84-.49l1.25.5c.11.04.24 0 .31-.11l1-1.73c.06-.11.03-.24-.06-.32l-1.07-.83zm-3.71 1.01c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path></g>
<g id="perm-device-information"><path d="M13 7h-2v2h2V7zm0 4h-2v6h2v-6zm4-9.99L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"></path></g>
<g id="perm-identity"><path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"></path></g>
<g id="perm-media"><path d="M2 6H0v5h.01L0 20c0 1.1.9 2 2 2h18v-2H2V6zm20-2h-8l-2-2H6c-1.1 0-1.99.9-1.99 2L4 16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7 15l4.5-6 3.5 4.51 2.5-3.01L21 15H7z"></path></g>
<g id="perm-phone-msg"><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.58l2.2-2.21c.28-.27.36-.66.25-1.01C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM12 3v10l3-3h6V3h-9z"></path></g>
<g id="perm-scan-wifi"><path d="M12 3C6.95 3 3.15 4.85 0 7.23L12 22 24 7.25C20.85 4.87 17.05 3 12 3zm1 13h-2v-6h2v6zm-2-8V6h2v2h-2z"></path></g>
<g id="pets"><circle cx="4.5" cy="9.5" r="2.5"></circle><circle cx="9" cy="5.5" r="2.5"></circle><circle cx="15" cy="5.5" r="2.5"></circle><circle cx="19.5" cy="9.5" r="2.5"></circle><path d="M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78-.04s-.53 0-.79.05c-.11.02-.22.05-.33.09-.7.24-1.28.78-1.75 1.32-.87 1.02-1.6 1.89-2.48 2.91-1.31 1.31-2.92 2.76-2.62 4.79.29 1.02 1.02 2.03 2.33 2.32.73.15 3.06-.44 5.54-.44h.18c2.48 0 4.81.58 5.54.44 1.31-.29 2.04-1.31 2.33-2.32.31-2.04-1.3-3.49-2.61-4.8z"></path></g>
<g id="picture-in-picture"><path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z"></path></g>
<g id="picture-in-picture-alt"><path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"></path></g>
<g id="play-for-work"><path d="M11 5v5.59H7.5l4.5 4.5 4.5-4.5H13V5h-2zm-5 9c0 3.31 2.69 6 6 6s6-2.69 6-6h-2c0 2.21-1.79 4-4 4s-4-1.79-4-4H6z"></path></g>
<g id="polymer"><path d="M19 4h-4L7.11 16.63 4.5 12 9 4H5L.5 12 5 20h4l7.89-12.63L19.5 12 15 20h4l4.5-8z"></path></g>
<g id="power-settings-new"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"></path></g>
<g id="pregnant-woman"><path d="M9 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm7 9c-.01-1.34-.83-2.51-2-3 0-1.66-1.34-3-3-3s-3 1.34-3 3v7h2v5h3v-5h3v-4z"></path></g>
<g id="print"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"></path></g>
<g id="query-builder"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></g>
<g id="question-answer"><path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"></path></g>
<g id="radio-button-checked"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path></g>
<g id="radio-button-unchecked"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path></g>
<g id="receipt"><path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z"></path></g>
<g id="record-voice-over"><circle cx="9" cy="9" r="4"></circle><path d="M9 15c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm7.76-9.64l-1.68 1.69c.84 1.18.84 2.71 0 3.89l1.68 1.69c2.02-2.02 2.02-5.07 0-7.27zM20.07 2l-1.63 1.63c2.77 3.02 2.77 7.56 0 10.74L20.07 16c3.9-3.89 3.91-9.95 0-14z"></path></g>
<g id="redeem"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"></path></g>
<g id="redo"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"></path></g>
<g id="refresh"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></g>
<g id="remove"><path d="M19 13H5v-2h14v2z"></path></g>
<g id="remove-circle"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"></path></g>
<g id="remove-circle-outline"><path d="M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></g>
<g id="remove-shopping-cart"><path d="M22.73 22.73L2.77 2.77 2 2l-.73-.73L0 2.54l4.39 4.39 2.21 4.66-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h7.46l1.38 1.38c-.5.36-.83.95-.83 1.62 0 1.1.89 2 1.99 2 .67 0 1.26-.33 1.62-.84L21.46 24l1.27-1.27zM7.42 15c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h2.36l2 2H7.42zm8.13-2c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H6.54l9.01 9zM7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2z"></path></g>
<g id="reorder"><path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z"></path></g>
<g id="reply"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"></path></g>
<g id="reply-all"><path d="M7 8V5l-7 7 7 7v-3l-4-4 4-4zm6 1V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"></path></g>
<g id="report"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"></path></g>
<g id="report-problem"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path></g>
<g id="restore"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"></path></g>
<g id="restore-page"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 16c-2.05 0-3.81-1.24-4.58-3h1.71c.63.9 1.68 1.5 2.87 1.5 1.93 0 3.5-1.57 3.5-3.5S13.93 9.5 12 9.5c-1.35 0-2.52.78-3.1 1.9l1.6 1.6h-4V9l1.3 1.3C8.69 8.92 10.23 8 12 8c2.76 0 5 2.24 5 5s-2.24 5-5 5z"></path></g>
<g id="room"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path></g>
<g id="rounded-corner"><path d="M19 19h2v2h-2v-2zm0-2h2v-2h-2v2zM3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm0-4h2V3H3v2zm4 0h2V3H7v2zm8 16h2v-2h-2v2zm-4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm-8 0h2v-2H7v2zm-4 0h2v-2H3v2zM21 8c0-2.76-2.24-5-5-5h-5v2h5c1.65 0 3 1.35 3 3v5h2V8z"></path></g>
<g id="rowing"><path d="M8.5 14.5L4 19l1.5 1.5L9 17h2l-2.5-2.5zM15 1c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 20.01L18 24l-2.99-3.01V19.5l-7.1-7.09c-.31.05-.61.07-.91.07v-2.16c1.66.03 3.61-.87 4.67-2.04l1.4-1.55c.19-.21.43-.38.69-.5.29-.14.62-.23.96-.23h.03C15.99 6.01 17 7.02 17 8.26v5.75c0 .84-.35 1.61-.92 2.16l-3.58-3.58v-2.27c-.63.52-1.43 1.02-2.29 1.39L16.5 18H18l3 3.01z"></path></g>
<g id="save"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"></path></g>
<g id="schedule"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></g>
<g id="search"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></g>
<g id="select-all"><path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2zM7 17h10V7H7v10zm2-8h6v6H9V9z"></path></g>
<g id="send"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></g>
<g id="settings"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path></g>
<g id="settings-applications"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm7-7H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-1.75 9c0 .23-.02.46-.05.68l1.48 1.16c.13.11.17.3.08.45l-1.4 2.42c-.09.15-.27.21-.43.15l-1.74-.7c-.36.28-.76.51-1.18.69l-.26 1.85c-.03.17-.18.3-.35.3h-2.8c-.17 0-.32-.13-.35-.29l-.26-1.85c-.43-.18-.82-.41-1.18-.69l-1.74.7c-.16.06-.34 0-.43-.15l-1.4-2.42c-.09-.15-.05-.34.08-.45l1.48-1.16c-.03-.23-.05-.46-.05-.69 0-.23.02-.46.05-.68l-1.48-1.16c-.13-.11-.17-.3-.08-.45l1.4-2.42c.09-.15.27-.21.43-.15l1.74.7c.36-.28.76-.51 1.18-.69l.26-1.85c.03-.17.18-.3.35-.3h2.8c.17 0 .32.13.35.29l.26 1.85c.43.18.82.41 1.18.69l1.74-.7c.16-.06.34 0 .43.15l1.4 2.42c.09.15.05.34-.08.45l-1.48 1.16c.03.23.05.46.05.69z"></path></g>
<g id="settings-backup-restore"><path d="M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-2-9c-4.97 0-9 4.03-9 9H0l4 4 4-4H5c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.51 0-2.91-.49-4.06-1.3l-1.42 1.44C8.04 20.3 9.94 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"></path></g>
<g id="settings-bluetooth"><path d="M11 24h2v-2h-2v2zm-4 0h2v-2H7v2zm8 0h2v-2h-2v2zm2.71-18.29L12 0h-1v7.59L6.41 3 5 4.41 10.59 10 5 15.59 6.41 17 11 12.41V20h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 3.83l1.88 1.88L13 7.59V3.83zm1.88 10.46L13 16.17v-3.76l1.88 1.88z"></path></g>
<g id="settings-brightness"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02zM8 16h2.5l1.5 1.5 1.5-1.5H16v-2.5l1.5-1.5-1.5-1.5V8h-2.5L12 6.5 10.5 8H8v2.5L6.5 12 8 13.5V16zm4-7c1.66 0 3 1.34 3 3s-1.34 3-3 3V9z"></path></g>
<g id="settings-cell"><path d="M7 24h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zM16 .01L8 0C6.9 0 6 .9 6 2v16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V2c0-1.1-.9-1.99-2-1.99zM16 16H8V4h8v12z"></path></g>
<g id="settings-ethernet"><path d="M7.77 6.76L6.23 5.48.82 12l5.41 6.52 1.54-1.28L3.42 12l4.35-5.24zM7 13h2v-2H7v2zm10-2h-2v2h2v-2zm-6 2h2v-2h-2v2zm6.77-7.52l-1.54 1.28L20.58 12l-4.35 5.24 1.54 1.28L23.18 12l-5.41-6.52z"></path></g>
<g id="settings-input-antenna"><path d="M12 5c-3.87 0-7 3.13-7 7h2c0-2.76 2.24-5 5-5s5 2.24 5 5h2c0-3.87-3.13-7-7-7zm1 9.29c.88-.39 1.5-1.26 1.5-2.29 0-1.38-1.12-2.5-2.5-2.5S9.5 10.62 9.5 12c0 1.02.62 1.9 1.5 2.29v3.3L7.59 21 9 22.41l3-3 3 3L16.41 21 13 17.59v-3.3zM12 1C5.93 1 1 5.93 1 12h2c0-4.97 4.03-9 9-9s9 4.03 9 9h2c0-6.07-4.93-11-11-11z"></path></g>
<g id="settings-input-component"><path d="M5 2c0-.55-.45-1-1-1s-1 .45-1 1v4H1v6h6V6H5V2zm4 14c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2H9v2zm-8 0c0 1.3.84 2.4 2 2.82V23h2v-4.18C6.16 18.4 7 17.3 7 16v-2H1v2zM21 6V2c0-.55-.45-1-1-1s-1 .45-1 1v4h-2v6h6V6h-2zm-8-4c0-.55-.45-1-1-1s-1 .45-1 1v4H9v6h6V6h-2V2zm4 14c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2h-6v2z"></path></g>
<g id="settings-input-composite"><path d="M5 2c0-.55-.45-1-1-1s-1 .45-1 1v4H1v6h6V6H5V2zm4 14c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2H9v2zm-8 0c0 1.3.84 2.4 2 2.82V23h2v-4.18C6.16 18.4 7 17.3 7 16v-2H1v2zM21 6V2c0-.55-.45-1-1-1s-1 .45-1 1v4h-2v6h6V6h-2zm-8-4c0-.55-.45-1-1-1s-1 .45-1 1v4H9v6h6V6h-2V2zm4 14c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2h-6v2z"></path></g>
<g id="settings-input-hdmi"><path d="M18 7V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v3H5v6l3 6v3h8v-3l3-6V7h-1zM8 4h8v3h-2V5h-1v2h-2V5h-1v2H8V4z"></path></g>
<g id="settings-input-svideo"><path d="M8 11.5c0-.83-.67-1.5-1.5-1.5S5 10.67 5 11.5 5.67 13 6.5 13 8 12.33 8 11.5zm7-5c0-.83-.67-1.5-1.5-1.5h-3C9.67 5 9 5.67 9 6.5S9.67 8 10.5 8h3c.83 0 1.5-.67 1.5-1.5zM8.5 15c-.83 0-1.5.67-1.5 1.5S7.67 18 8.5 18s1.5-.67 1.5-1.5S9.33 15 8.5 15zM12 1C5.93 1 1 5.93 1 12s4.93 11 11 11 11-4.93 11-11S18.07 1 12 1zm0 20c-4.96 0-9-4.04-9-9s4.04-9 9-9 9 4.04 9 9-4.04 9-9 9zm5.5-11c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-2 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"></path></g>
<g id="settings-overscan"><path d="M12.01 5.5L10 8h4l-1.99-2.5zM18 10v4l2.5-1.99L18 10zM6 10l-2.5 2.01L6 14v-4zm8 6h-4l2.01 2.5L14 16zm7-13H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"></path></g>
<g id="settings-phone"><path d="M13 9h-2v2h2V9zm4 0h-2v2h2V9zm3 6.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.58l2.2-2.21c.28-.27.36-.66.25-1.01C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 9v2h2V9h-2z"></path></g>
<g id="settings-power"><path d="M7 24h2v-2H7v2zm4 0h2v-2h-2v2zm2-22h-2v10h2V2zm3.56 2.44l-1.45 1.45C16.84 6.94 18 8.83 18 11c0 3.31-2.69 6-6 6s-6-2.69-6-6c0-2.17 1.16-4.06 2.88-5.12L7.44 4.44C5.36 5.88 4 8.28 4 11c0 4.42 3.58 8 8 8s8-3.58 8-8c0-2.72-1.36-5.12-3.44-6.56zM15 24h2v-2h-2v2z"></path></g>
<g id="settings-remote"><path d="M15 9H9c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V10c0-.55-.45-1-1-1zm-3 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM7.05 6.05l1.41 1.41C9.37 6.56 10.62 6 12 6s2.63.56 3.54 1.46l1.41-1.41C15.68 4.78 13.93 4 12 4s-3.68.78-4.95 2.05zM12 0C8.96 0 6.21 1.23 4.22 3.22l1.41 1.41C7.26 3.01 9.51 2 12 2s4.74 1.01 6.36 2.64l1.41-1.41C17.79 1.23 15.04 0 12 0z"></path></g>
<g id="settings-voice"><path d="M7 24h2v-2H7v2zm5-11c1.66 0 2.99-1.34 2.99-3L15 4c0-1.66-1.34-3-3-3S9 2.34 9 4v6c0 1.66 1.34 3 3 3zm-1 11h2v-2h-2v2zm4 0h2v-2h-2v2zm4-14h-1.7c0 3-2.54 5.1-5.3 5.1S6.7 13 6.7 10H5c0 3.41 2.72 6.23 6 6.72V20h2v-3.28c3.28-.49 6-3.31 6-6.72z"></path></g>
<g id="shop"><path d="M16 6V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H2v13c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6h-6zm-6-2h4v2h-4V4zM9 18V9l7.5 4L9 18z"></path></g>
<g id="shop-two"><path d="M3 9H1v11c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2H3V9zm15-4V3c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H5v11c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5h-5zm-6-2h4v2h-4V3zm0 12V8l5.5 3-5.5 4z"></path></g>
<g id="shopping-basket"><path d="M17.21 9l-4.38-6.56c-.19-.28-.51-.42-.83-.42-.32 0-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1h-4.79zM9 9l3-4.4L15 9H9zm3 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"></path></g>
<g id="shopping-cart"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"></path></g>
<g id="sort"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"></path></g>
<g id="speaker-notes"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 14H6v-2h2v2zm0-3H6V9h2v2zm0-3H6V6h2v2zm7 6h-5v-2h5v2zm3-3h-8V9h8v2zm0-3h-8V6h8v2z"></path></g>
<g id="speaker-notes-off"><path d="M10.54 11l-.54-.54L7.54 8 6 6.46 2.38 2.84 1.27 1.73 0 3l2.01 2.01L2 22l4-4h9l5.73 5.73L22 22.46 17.54 18l-7-7zM8 14H6v-2h2v2zm-2-3V9l2 2H6zm14-9H4.08L10 7.92V6h8v2h-7.92l1 1H18v2h-4.92l6.99 6.99C21.14 17.95 22 17.08 22 16V4c0-1.1-.9-2-2-2z"></path></g>
<g id="spellcheck"><path d="M12.45 16h2.09L9.43 3H7.57L2.46 16h2.09l1.12-3h5.64l1.14 3zm-6.02-5L8.5 5.48 10.57 11H6.43zm15.16.59l-8.09 8.09L9.83 16l-1.41 1.41 5.09 5.09L23 13l-1.41-1.41z"></path></g>
<g id="star"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></g>
<g id="star-border"><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"></path></g>
<g id="star-half"><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4V6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"></path></g>
<g id="stars"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"></path></g>
<g id="store"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path></g>
<g id="subdirectory-arrow-left"><path d="M11 9l1.42 1.42L8.83 14H18V4h2v12H8.83l3.59 3.58L11 21l-6-6 6-6z"></path></g>
<g id="subdirectory-arrow-right"><path d="M19 15l-6 6-1.42-1.42L15.17 16H4V4h2v10h9.17l-3.59-3.58L13 9l6 6z"></path></g>
<g id="subject"><path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"></path></g>
<g id="supervisor-account"><path d="M16.5 12c1.38 0 2.49-1.12 2.49-2.5S17.88 7 16.5 7C15.12 7 14 8.12 14 9.5s1.12 2.5 2.5 2.5zM9 11c1.66 0 2.99-1.34 2.99-3S10.66 5 9 5C7.34 5 6 6.34 6 8s1.34 3 3 3zm7.5 3c-1.83 0-5.5.92-5.5 2.75V19h11v-2.25c0-1.83-3.67-2.75-5.5-2.75zM9 13c-2.33 0-7 1.17-7 3.5V19h7v-2.25c0-.85.33-2.34 2.37-3.47C10.5 13.1 9.66 13 9 13z"></path></g>
<g id="swap-horiz"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"></path></g>
<g id="swap-vert"><path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"></path></g>
<g id="swap-vertical-circle"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM6.5 9L10 5.5 13.5 9H11v4H9V9H6.5zm11 6L14 18.5 10.5 15H13v-4h2v4h2.5z"></path></g>
<g id="system-update-alt"><path d="M12 16.5l4-4h-3v-9h-2v9H8l4 4zm9-13h-6v1.99h6v14.03H3V5.49h6V3.5H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2z"></path></g>
<g id="tab"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h10v4h8v10z"></path></g>
<g id="tab-unselected"><path d="M1 9h2V7H1v2zm0 4h2v-2H1v2zm0-8h2V3c-1.1 0-2 .9-2 2zm8 16h2v-2H9v2zm-8-4h2v-2H1v2zm2 4v-2H1c0 1.1.9 2 2 2zM21 3h-8v6h10V5c0-1.1-.9-2-2-2zm0 14h2v-2h-2v2zM9 5h2V3H9v2zM5 21h2v-2H5v2zM5 5h2V3H5v2zm16 16c1.1 0 2-.9 2-2h-2v2zm0-8h2v-2h-2v2zm-8 8h2v-2h-2v2zm4 0h2v-2h-2v2z"></path></g>
<g id="text-format"><path d="M5 17v2h14v-2H5zm4.5-4.2h5l.9 2.2h2.1L12.75 4h-1.5L6.5 15h2.1l.9-2.2zM12 5.98L13.87 11h-3.74L12 5.98z"></path></g>
<g id="theaters"><path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"></path></g>
<g id="thumb-down"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"></path></g>
<g id="thumb-up"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"></path></g>
<g id="thumbs-up-down"><path d="M12 6c0-.55-.45-1-1-1H5.82l.66-3.18.02-.23c0-.31-.13-.59-.33-.8L5.38 0 .44 4.94C.17 5.21 0 5.59 0 6v6.5c0 .83.67 1.5 1.5 1.5h6.75c.62 0 1.15-.38 1.38-.91l2.26-5.29c.07-.17.11-.36.11-.55V6zm10.5 4h-6.75c-.62 0-1.15.38-1.38.91l-2.26 5.29c-.07.17-.11.36-.11.55V18c0 .55.45 1 1 1h5.18l-.66 3.18-.02.24c0 .31.13.59.33.8l.79.78 4.94-4.94c.27-.27.44-.65.44-1.06v-6.5c0-.83-.67-1.5-1.5-1.5z"></path></g>
<g id="timeline"><path d="M23 8c0 1.1-.9 2-2 2-.18 0-.35-.02-.51-.07l-3.56 3.55c.05.16.07.34.07.52 0 1.1-.9 2-2 2s-2-.9-2-2c0-.18.02-.36.07-.52l-2.55-2.55c-.16.05-.34.07-.52.07s-.36-.02-.52-.07l-4.55 4.56c.05.16.07.33.07.51 0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.18 0 .35.02.51.07l4.56-4.55C8.02 9.36 8 9.18 8 9c0-1.1.9-2 2-2s2 .9 2 2c0 .18-.02.36-.07.52l2.55 2.55c.16-.05.34-.07.52-.07s.36.02.52.07l3.55-3.56C19.02 8.35 19 8.18 19 8c0-1.1.9-2 2-2s2 .9 2 2z"></path></g>
<g id="toc"><path d="M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h14v-2H3v2zm16 0h2v-2h-2v2zm0-10v2h2V7h-2zm0 6h2v-2h-2v2z"></path></g>
<g id="today"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"></path></g>
<g id="toll"><path d="M15 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zM3 12c0-2.61 1.67-4.83 4-5.65V4.26C3.55 5.15 1 8.27 1 12s2.55 6.85 6 7.74v-2.09c-2.33-.82-4-3.04-4-5.65z"></path></g>
<g id="touch-app"><path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"></path></g>
<g id="track-changes"><path d="M19.07 4.93l-1.41 1.41C19.1 7.79 20 9.79 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.16 6.57 6 9.03 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.66-.67-3.16-1.76-4.24l-1.41 1.41C15.55 9.9 16 10.9 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-1.86 1.28-3.41 3-3.86v2.14c-.6.35-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V2h-1C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z"></path></g>
<g id="translate"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"></path></g>
<g id="trending-down"><path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"></path></g>
<g id="trending-flat"><path d="M22 12l-4-4v3H3v2h15v3z"></path></g>
<g id="trending-up"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"></path></g>
<g id="turned-in"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"></path></g>
<g id="turned-in-not"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"></path></g>
<g id="unarchive"><path d="M20.55 5.22l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.15.55L3.46 5.22C3.17 5.57 3 6.01 3 6.5V19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.49-.17-.93-.45-1.28zM12 9.5l5.5 5.5H14v2h-4v-2H6.5L12 9.5zM5.12 5l.82-1h12l.93 1H5.12z"></path></g>
<g id="undo"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"></path></g>
<g id="unfold-less"><path d="M7.41 18.59L8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10l4.59-4.59z"></path></g>
<g id="unfold-more"><path d="M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z"></path></g>
<g id="update"><path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79 2.73 2.71 7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58 3.51-3.47 9.14-3.47 12.65 0L21 3v7.12zM12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z"></path></g>
<g id="verified-user"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"></path></g>
<g id="view-agenda"><path d="M20 13H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zm0-10H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"></path></g>
<g id="view-array"><path d="M4 18h3V5H4v13zM18 5v13h3V5h-3zM8 18h9V5H8v13z"></path></g>
<g id="view-carousel"><path d="M7 19h10V4H7v15zm-5-2h4V6H2v11zM18 6v11h4V6h-4z"></path></g>
<g id="view-column"><path d="M10 18h5V5h-5v13zm-6 0h5V5H4v13zM16 5v13h5V5h-5z"></path></g>
<g id="view-day"><path d="M2 21h19v-3H2v3zM20 8H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zM2 3v3h19V3H2z"></path></g>
<g id="view-headline"><path d="M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z"></path></g>
<g id="view-list"><path d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z"></path></g>
<g id="view-module"><path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"></path></g>
<g id="view-quilt"><path d="M10 18h5v-6h-5v6zm-6 0h5V5H4v13zm12 0h5v-6h-5v6zM10 5v6h11V5H10z"></path></g>
<g id="view-stream"><path d="M4 18h17v-6H4v6zM4 5v6h17V5H4z"></path></g>
<g id="view-week"><path d="M6 5H3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zm14 0h-3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zm-7 0h-3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"></path></g>
<g id="visibility"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></g>
<g id="visibility-off"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"></path></g>
<g id="warning"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path></g>
<g id="watch-later"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"></path></g>
<g id="weekend"><path d="M21 10c-1.1 0-2 .9-2 2v3H5v-3c0-1.1-.9-2-2-2s-2 .9-2 2v5c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2zm-3-5H6c-1.1 0-2 .9-2 2v2.15c1.16.41 2 1.51 2 2.82V14h12v-2.03c0-1.3.84-2.4 2-2.82V7c0-1.1-.9-2-2-2z"></path></g>
<g id="work"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"></path></g>
<g id="youtube-searched-for"><path d="M17.01 14h-.8l-.27-.27c.98-1.14 1.57-2.61 1.57-4.23 0-3.59-2.91-6.5-6.5-6.5s-6.5 3-6.5 6.5H2l3.84 4 4.16-4H6.51C6.51 7 8.53 5 11.01 5s4.5 2.01 4.5 4.5c0 2.48-2.02 4.5-4.5 4.5-.65 0-1.26-.14-1.82-.38L7.71 15.1c.97.57 2.09.9 3.3.9 1.61 0 3.08-.59 4.22-1.57l.27.27v.79l5.01 4.99L22 19l-4.99-5z"></path></g>
<g id="zoom-in"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm2.5-4h-2v2H9v-2H7V9h2V7h1v2h2v1z"></path></g>
<g id="zoom-out"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"></path></g>
</defs></svg>
</iron-iconset-svg>`;document.head.appendChild(Xr.content);class Wr extends lr([pt,nt],Ce){static get template(){return V`
    <!--suppress CssInvalidPseudoSelector -->
    <!--suppress CssUnresolvedCustomProperty -->
    <!--suppress CssUnresolvedCustomPropertySet -->
    <style>
      :host {
        display: block;
        position: relative;
        overflow: hidden;
        contain: content;
        box-sizing: border-box;
        @apply --layout-flex-auto;
        @apply --skeleton-carousel;
        min-height: var(--skeleton-carousel-min-height, 300px);
      }

      :host([direction="horizontal"]) {
        @apply --layout-vertical;
      }

      :host([alt][direction="horizontal"]) {
        @apply --layout-vertical-reverse;
      }

      :host([direction="vertical"]) {
        @apply --layout-inline;
        @apply --layout-horizontal;
      }

      :host([alt][direction="vertical"]) {
        @apply --layout-horizontal-reverse;
      }

      :host,
      #carousel *,
      #container ::slotted(*) {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        outline: none;
        -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
      }

      #carousel,
      #items,
      #container {
        display: block;
        position: relative;
        width: 100%;
        @apply --layout-flex-auto;
      }

      #carousel,
      #container {
        @apply --layout-vertical;
      }

      #carousel {
        overflow: hidden;
        z-index: 0;
      }

      #items {
        position: relative;
        transform: translate3d(0%, 0%, 0);
        will-change: transform;
      }

      :host([direction="horizontal"]) #items {
        @apply --layout-vertical;
      }

      :host([direction="vertical"]) #items {
        @apply --layout-fit;
      }

      #container {
        @apply --layout-inline;
        @apply --skeleton-carousel-container;
      }

      :host([direction="horizontal"]) #container {
        @apply --layout-horizontal;
        @apply --skeleton-carousel-container-horizontal;
      }

      :host([direction="vertical"]) #container {
        @apply --layout-vertical;
        @apply --layout-wrap;
        @apply --skeleton-carousel-container-vertical;
      }

      #container ::slotted(*) {
        display: block;
        position: relative;
        overflow: hidden;
        @apply --layout-vertical;
        @apply --layout-flex-auto;
        min-width: 100%;
        max-width: 100%;
        width: 100%;
        will-change: auto;
        opacity: .8;
        @apply --skeleton-carousel-item;
      }

      #container ::slotted(.selected) {
        opacity: 1;
        @apply --skeleton-carousel-item-selected;
      }

      /*
      * Controls
      */
      #controls {
        display: block;
        padding: .5rem;
        z-index: 1;
        @apply --layout-center-center;
        @apply --layout-center-justified;
        @apply --skeleton-carousel-controls;
      }

      :host([direction="horizontal"]) #controls {
        @apply --skeleton-carousel-controls-horizontal;
      }

      :host([direction="vertical"]) #controls {
        @apply --skeleton-carousel-controls-vertical;
      }

      :host([direction="horizontal"]) #controls,
      :host([direction="horizontal"]) #dots {
        @apply --layout-horizontal;
      }

      :host([direction="vertical"]) #controls,
      :host([direction="vertical"]) #dots {
        @apply --layout-vertical;
      }

      paper-icon-button {
        border-radius: 50%;
      }

      #dots {
        @apply --layout-flex-auto;
        @apply --layout-center-center;
        @apply --skeleton-carousel-dots;
      }

      #dots paper-icon-button {
        color: var(--skeleton-carousel-dot-color, var(--paper-grey-900));
        opacity: .4;
        @apply --skeleton-carousel-dot;
      }

      #dots paper-icon-button.selected {
        opacity: 1;
        @apply --skeleton-carousel-dot-selected;
      }

      #dots paper-icon-button[disabled] {
        opacity: .4;
        @apply --skeleton-carousel-dot-disabled;
      }

      #prev,
      #next {
        color: var(--skeleton-carousel-nav-color, var(--paper-grey-900));
      }

      #prev,
      #next {
        @apply --skeleton-carousel-nav;
      }

      #prev[disabled],
      #next[disabled] {
        color: var(--skeleton-carousel-nav-disabled-color, var(--paper-grey-600));
        @apply --skeleton-carousel-nav-disabled;
      }

      #prev {
        @apply --skeleton-carousel-nav-prev;
      }

      #next {
        @apply --skeleton-carousel-nav-next;
      }

      [hidden] {
        display: none !important;
      }

      /* Apply transition */
      #items,
      #container ::slotted(*),
      paper-icon-button {
        -webkit-transition: all 300ms cubic-bezier(.51, .92, .24, 1);
        -moz-transition: all 300ms cubic-bezier(.51, .92, .24, 1);
        -ms-transition: all 300ms cubic-bezier(.51, .92, .24, 1);
        -o-transition: all 300ms cubic-bezier(.51, .92, .24, 1);
        transition: all 300ms cubic-bezier(.51, .92, .24, 1);
        @apply --skeleton-carousel-transition;
      }

      :host[swiping] #items {
        -webkit-transition: all 300ms linear;
        -moz-transition: all 300ms linear;
        -ms-transition: all 300ms linear;
        -o-transition: all 300ms linear;
        transition: all 300ms linear;
      }
    </style>

    <div id="carousel">
      <div id="items">
        <iron-selector id="container" selected="{{selected}}" fallback-selection="0" selected-class="selected" style$="[[_containerHeight]]">
          <slot></slot>
        </iron-selector>
      </div>
    </div>
    <nav id="controls" hidden$="[[!_controls]]">
      <paper-icon-button icon$="[[_iconPrev]]" id="prev" on-tap="prev" disabled$="[[!showPrev]]" hidden$="[[!nav]]"></paper-icon-button>
      <iron-selector id="dots" selected="{{selected}}" fallback-selection="0" selected-class="selected" hidden$="[[!dots]]" tabindex="-1">
        <template is="dom-repeat" items="[[_dots]]">
          <paper-icon-button icon="[[_iconDot(item, selected)]]" disabled$="[[disabled]]"></paper-icon-button>
        </template>
      </iron-selector>
      <paper-icon-button icon$="[[_iconNext]]" id="next" on-tap="next" disabled$="[[!showNext]]" hidden$="[[!nav]]"></paper-icon-button>
    </nav>
`}static get is(){return"skeleton-carousel"}static get properties(){return{animating:{type:Boolean,value:!1,readOnly:!0,reflectToAttribute:!0,notify:!0},auto:{type:Boolean,value:!1,observer:"_autoAnimate"},direction:{type:String,value:"horizontal",reflectToAttribute:!0},disabled:{type:Boolean,value:!1},dots:{type:Boolean,value:!1},disableSwipe:{type:Boolean,value:!1},disableKeys:{type:Boolean,value:!1},duration:{type:Number,value:4e3},loop:{type:Boolean,value:!1},nav:{type:Boolean,value:!1},selected:{type:Number,value:0,notify:!0,reflectToAttribute:!0,observer:"_selectedObserver"},selectedItem:{type:Object,notify:!0,readOnly:!0,computed:"_computeSelectedItem(selected, _children)"},swiping:{type:Boolean,value:!1,notify:!0,readOnly:!0,reflectToAttribute:!0},tabindex:{type:Number,value:0,reflectToAttribute:!0},total:{type:Number,value:0,notify:!0,reflectToAttribute:!0,readOnly:!0},end:{type:Boolean,value:!1,notify:!0,readOny:!0,reflectToAttribute:!0,computed:"_computeEnd(total, selected)"},showNext:{type:Boolean,value:!1,computed:"_computeShowNext(disabled, total, selected, loop)",notify:!0,reflectToAttribute:!0,readOnly:!0},showPrev:{type:Boolean,value:!1,computed:"_computeShowPrev(disabled, selected, loop)",notify:!0,reflectToAttribute:!0,readOnly:!0},_autoInterval:{type:Object},_children:{type:Array,value:[],observer:"_childrenObserver"},_controls:{type:Boolean,value:!1,readOnly:!0,computed:"_computeControls(dots, nav, total)"},_dots:{type:Array,computed:"_computeDots(total)",readOnly:!0,value:[]},_iconPrev:{type:String,value:"icons:arrow-back",readOnly:!0,computed:"_computeIconPrev(direction)"},_iconNext:{type:String,value:"icons:arrow-forward",readOnly:!0,computed:"_computeIconNext(direction)"},_containerHeight:{type:String,value:"height: 100%;",computed:"_computeContainerHeight(direction, total)",readOnly:!0},_x:{type:Number,value:0},_y:{type:Number,value:0}}}connectedCallback(){super.connectedCallback();const e=this.shadowRoot.querySelector("slot"),s=this.shadowRoot.querySelector("#carousel");Si(s,"track",this._drag.bind(this)),this.setScrollDirection("all",s),new ve(e,()=>{this._children=ve.getFlattenedNodes(this).filter(i=>i.nodeType===Node.ELEMENT_NODE&&i.nodeName!=="DOM-REPEAT"&&i.nodeName!=="TEMPLATE")}),this.shadowRoot.querySelector("#items").addEventListener("transitionend",i=>{i.preventDefault(),!(this.swiping||i.propertyName!=="transform")&&this._setAnimating(!1)})}static get observers(){return["_translateObserver(direction, selected, _x, _y)"]}get keyBindings(){return{"left up":"_prevKey","right down":"_nextKey"}}_computeSelectedItem(e,s){return s[e]}_childrenObserver(e){this._setTotal(e.length),this._lazyContent(0),e.length>=1&&this._lazyContent(1)}_prevKey(e){if(!(this.disableKeys||this.disabled))return e.preventDefault(),this.prev()}_nextKey(e){if(!(this.disableKeys||this.disabled))return e.preventDefault(),this.next()}_autoAnimate(e){e?this._autoInterval=setInterval(()=>{this.next()},this.duration):clearInterval(this._autoInterval)}next(){if(this.disabled)return;const e=this.shadowRoot.querySelector("#container");(this.selected<--this.total||this.loop)&&(this._setAnimating(!0),e.selectNext())}prev(){if(this.disabled)return;const e=this.shadowRoot.querySelector("#container");(this.selected>0||this.loop)&&(this._setAnimating(!0),e.selectPrevious())}_iconDot(e,s){e--;let r="icons:radio-button-unchecked";return Number(e)===Number(s)&&(r="icons:radio-button-checked"),r}_selectedObserver(e,s){this._lazyContent(e),e<--this.total&&this._lazyContent(++e),this._autoAnimate(!1),this._autoAnimate(this.auto)}_lazyContent(e){const s=this._children[e];if(!s)return;s.hasAttribute("data-src")&&(s.src=s.getAttribute("data-src"),s.removeAttribute("data-src"));const r=s.querySelectorAll("[data-src]");if(r.length<=0)return;let i=0;for(i;i<r.length;++i)r[i].src=r[i].getAttribute("data-src"),r[i].removeAttribute("data-src")}_computeShowNext(e,s,r,i){return e?!1:i?!0:r<--s}_computeShowPrev(e,s,r){return e?!1:r?!0:s>0}_computeDots(e){let s=[];if(e<=0)return s;let r=1;for(e=++e,r;r<e;++r)s.push(r);return s}_computeEnd(e,s){const r=s===--e;return r&&this._event("end"),r}_normalize(e){return e<0?e=0:e>1&&(e=1),e}_calcPercentage(e){return e=e.toFixed(2),`${e*100}%`}_drag(e){if(this.disableSwipe||this.disabled){this._x=0,this._y=0,this._setSwiping(!1);return}const s=this.offsetWidth,r=this.offsetHeight,i=e.detail.ddx?e.detail.ddx:0,n=e.detail.ddy?e.detail.ddy:0;let l=i/s,a=n/r,o=0,h=0;this.direction==="horizontal"&&(o=this._x+l),this.direction==="vertical"&&(h=this._y+a);let c=Number(o),d=Number(h);switch(this.showPrev||(c>0&&(c=0),d>0&&(d=0)),this.showNext||(c<0&&(c=0),d<0&&(d=0)),e.detail.state){case"track":this._autoAnimate(!1),this._x=c,this._y=d,this._setSwiping(!0);break;case"end":this._autoAnimate(this.auto),this._x=0,this._y=0,this._setSwiping(!1),c>=.1||d>=.1?this.prev():(c<=-.1||d<=-.1)&&this.next();break}}_computeIconPrev(e){return e==="vertical"?"icons:arrow-upward":"icons:arrow-back"}_computeIconNext(e){return e==="vertical"?"icons:arrow-downward":"icons:arrow-forward"}_translateObserver(e,s,r,i){(r!==0||i!==0)&&this._setAnimating(!0);let n=0,l=0,a=-Math.abs(s);if(s<=0&&(a=0),r===0&&i===0){const c=this._calcPercentage(a);e==="horizontal"&&(n=c),e==="vertical"&&(l=c)}else r=a+r,i=a+i,e==="horizontal"&&(n=this._calcPercentage(r)),e==="vertical"&&(l=this._calcPercentage(i));const o=this.shadowRoot.querySelector("#items");let h="";e==="horizontal"&&(h=`translateX(${n})`),e==="vertical"&&(h=`translateY(${l})`),o.style.transform=h}_returnDragPosition(e,s){return e-s}_computeContainerHeight(e,s){let r="auto";return e==="vertical"&&(r=this._calcPercentage(s)),`height: ${r};`}_computeControls(e,s,r){return r>1&&(e||s)}_event(e,s=""){this.dispatchEvent(new CustomEvent(e,{detail:s,bubbles:!0,composed:!0}))}}window.customElements.define("skeleton-carousel",Wr);
