import{i as i$2,r as registerStyles,E as ElementMixin,T as ThemableMixin,P as PolymerElement,h as html,C as ControllerMixin,F as FlattenedNodesObserver,d as dedupingMixin,m as microTask,a as TooltipController,D as Debouncer$1,t as timeOut,b as DirHelper,s as s$2,y as y$1,c as DirMixin$1,e as requiredField,f as fieldButton,S as SlotController,g as generateUniqueId,o as overlay,j as PropertyEffects,k as strictTemplatePolicy,w as wrap$1,l as legacyWarnings,n as menuOverlay,p as ElementMixin$1,q as legacyOptimizations,u as useShadow,v as suppressTemplateNotifications,x as matches,z as translate,A as timeOut$1,B as microTask$1,G as menuOverlayCore,H as idlePeriod,I as animationFrame,J as flush$1,K as enqueueDebouncer$1,L as cancelSyntheticClickEvents,M as passiveTouchGestures$1,N as PropertyAccessors,O as builtCSS,Q as legacyNoObservedAttributes,R as register$2,U as get$1,V as fastDomIf,W as root,X as calculateSplices,Y as cssFromModules,Z as ThemePropertyMixin,_ as n$3,$ as Z$1,a0 as i$3,a1 as t$2,a2 as b$1,a3 as e$2,a4 as badge,a5 as e$3}from"./index-8a19cb36.js";/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const e$1=$=>C=>typeof C=="function"?((T,V)=>(customElements.define(T,V),V))($,C):((T,V)=>{const{kind:K,elements:Y}=V;return{kind:K,elements:Y,finisher(J){customElements.define(T,J)}}})($,C);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const i$1=($,C)=>C.kind==="method"&&C.descriptor&&!("value"in C.descriptor)?{...C,finisher(T){T.createProperty(C.key,$)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:C.key,initializer(){typeof C.initializer=="function"&&(this[C.key]=C.initializer.call(this))},finisher(T){T.createProperty(C.key,$)}};function e($){return(C,T)=>T!==void 0?((V,K,Y)=>{K.constructor.createProperty(Y,V)})($,C,T):i$1($,C)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function t$1($){return e({...$,state:!0})}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var n$2;((n$2=window.HTMLSlotElement)===null||n$2===void 0?void 0:n$2.prototype.assignedElements)!=null;/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const connect=$=>C=>class extends C{connectedCallback(){super.connectedCallback&&super.connectedCallback(),this._storeUnsubscribe=$.subscribe(()=>this.stateChanged($.getState())),this.stateChanged($.getState())}disconnectedCallback(){this._storeUnsubscribe(),super.disconnectedCallback&&super.disconnectedCallback()}stateChanged(T){}};function n$1($){for(var C=arguments.length,T=Array(C>1?C-1:0),V=1;V<C;V++)T[V-1]=arguments[V];throw Error("[Immer] minified error nr: "+$+(T.length?" "+T.map(function(K){return"'"+K+"'"}).join(","):"")+". Find the full error at: https://bit.ly/3cXEKWf")}function r$1($){return!!$&&!!$[Q]}function t($){var C;return!!$&&(function(T){if(!T||typeof T!="object")return!1;var V=Object.getPrototypeOf(T);if(V===null)return!0;var K=Object.hasOwnProperty.call(V,"constructor")&&V.constructor;return K===Object||typeof K=="function"&&Function.toString.call(K)===Z}($)||Array.isArray($)||!!$[L]||!!(!((C=$.constructor)===null||C===void 0)&&C[L])||s$1($)||v($))}function i($,C,T){T===void 0&&(T=!1),o$1($)===0?(T?Object.keys:nn)($).forEach(function(V){T&&typeof V=="symbol"||C(V,$[V],$)}):$.forEach(function(V,K){return C(K,V,$)})}function o$1($){var C=$[Q];return C?C.i>3?C.i-4:C.i:Array.isArray($)?1:s$1($)?2:v($)?3:0}function u($,C){return o$1($)===2?$.has(C):Object.prototype.hasOwnProperty.call($,C)}function a($,C){return o$1($)===2?$.get(C):$[C]}function f($,C,T){var V=o$1($);V===2?$.set(C,T):V===3?$.add(T):$[C]=T}function c$1($,C){return $===C?$!==0||1/$==1/C:$!=$&&C!=C}function s$1($){return X&&$ instanceof Map}function v($){return q&&$ instanceof Set}function p$1($){return $.o||$.t}function l$1($){if(Array.isArray($))return Array.prototype.slice.call($);var C=rn($);delete C[Q];for(var T=nn(C),V=0;V<T.length;V++){var K=T[V],Y=C[K];Y.writable===!1&&(Y.writable=!0,Y.configurable=!0),(Y.get||Y.set)&&(C[K]={configurable:!0,writable:!0,enumerable:Y.enumerable,value:$[K]})}return Object.create(Object.getPrototypeOf($),C)}function d($,C){return C===void 0&&(C=!1),y($)||r$1($)||!t($)||(o$1($)>1&&($.set=$.add=$.clear=$.delete=h$1),Object.freeze($),C&&i($,function(T,V){return d(V,!0)},!0)),$}function h$1(){n$1(2)}function y($){return $==null||typeof $!="object"||Object.isFrozen($)}function b($){var C=tn[$];return C||n$1(18,$),C}function m($,C){tn[$]||(tn[$]=C)}function _(){return U}function j($,C){C&&(b("Patches"),$.u=[],$.s=[],$.v=C)}function O($){g($),$.p.forEach(S),$.p=null}function g($){$===U&&(U=$.l)}function w($){return U={p:[],l:U,h:$,m:!0,_:0}}function S($){var C=$[Q];C.i===0||C.i===1?C.j():C.O=!0}function P($,C){C._=C.p.length;var T=C.p[0],V=$!==void 0&&$!==T;return C.h.g||b("ES5").S(C,$,V),V?(T[Q].P&&(O(C),n$1(4)),t($)&&($=M(C,$),C.l||x(C,$)),C.u&&b("Patches").M(T[Q].t,$,C.u,C.s)):$=M(C,T,[]),O(C),C.u&&C.v(C.u,C.s),$!==H?$:void 0}function M($,C,T){if(y(C))return C;var V=C[Q];if(!V)return i(C,function(ee,te){return A($,V,C,ee,te,T)},!0),C;if(V.A!==$)return C;if(!V.P)return x($,V.t,!0),V.t;if(!V.I){V.I=!0,V.A._--;var K=V.i===4||V.i===5?V.o=l$1(V.k):V.o,Y=K,J=!1;V.i===3&&(Y=new Set(K),K.clear(),J=!0),i(Y,function(ee,te){return A($,V,K,ee,te,T,J)}),x($,K,!1),T&&$.u&&b("Patches").N(V,T,$.u,$.s)}return V.o}function A($,C,T,V,K,Y,J){if(r$1(K)){var ee=M($,K,Y&&C&&C.i!==3&&!u(C.R,V)?Y.concat(V):void 0);if(f(T,V,ee),!r$1(ee))return;$.m=!1}else J&&T.add(K);if(t(K)&&!y(K)){if(!$.h.D&&$._<1)return;M($,K),C&&C.A.l||x($,K)}}function x($,C,T){T===void 0&&(T=!1),!$.l&&$.h.D&&$.m&&d(C,T)}function z($,C){var T=$[Q];return(T?p$1(T):$)[C]}function I($,C){if(C in $)for(var T=Object.getPrototypeOf($);T;){var V=Object.getOwnPropertyDescriptor(T,C);if(V)return V;T=Object.getPrototypeOf(T)}}function k($){$.P||($.P=!0,$.l&&k($.l))}function E($){$.o||($.o=l$1($.t))}function N($,C,T){var V=s$1(C)?b("MapSet").F(C,T):v(C)?b("MapSet").T(C,T):$.g?function(K,Y){var J=Array.isArray(K),ee={i:J?1:0,A:Y?Y.A:_(),P:!1,I:!1,R:{},l:Y,t:K,k:null,o:null,j:null,C:!1},te=ee,ie=en;J&&(te=[ee],ie=on);var re=Proxy.revocable(te,ie),se=re.revoke,oe=re.proxy;return ee.k=oe,ee.j=se,oe}(C,T):b("ES5").J(C,T);return(T?T.A:_()).p.push(V),V}function R($){return r$1($)||n$1(22,$),function C(T){if(!t(T))return T;var V,K=T[Q],Y=o$1(T);if(K){if(!K.P&&(K.i<4||!b("ES5").K(K)))return K.t;K.I=!0,V=D(T,Y),K.I=!1}else V=D(T,Y);return i(V,function(J,ee){K&&a(K.t,J)===ee||f(V,J,C(ee))}),Y===3?new Set(V):V}($)}function D($,C){switch(C){case 2:return new Map($);case 3:return Array.from($)}return l$1($)}function F(){function $(Y,J){var ee=K[Y];return ee?ee.enumerable=J:K[Y]=ee={configurable:!0,enumerable:J,get:function(){var te=this[Q];return en.get(te,Y)},set:function(te){var ie=this[Q];en.set(ie,Y,te)}},ee}function C(Y){for(var J=Y.length-1;J>=0;J--){var ee=Y[J][Q];if(!ee.P)switch(ee.i){case 5:V(ee)&&k(ee);break;case 4:T(ee)&&k(ee)}}}function T(Y){for(var J=Y.t,ee=Y.k,te=nn(ee),ie=te.length-1;ie>=0;ie--){var re=te[ie];if(re!==Q){var se=J[re];if(se===void 0&&!u(J,re))return!0;var oe=ee[re],ae=oe&&oe[Q];if(ae?ae.t!==se:!c$1(oe,se))return!0}}var ne=!!J[Q];return te.length!==nn(J).length+(ne?0:1)}function V(Y){var J=Y.k;if(J.length!==Y.t.length)return!0;var ee=Object.getOwnPropertyDescriptor(J,J.length-1);if(ee&&!ee.get)return!0;for(var te=0;te<J.length;te++)if(!J.hasOwnProperty(te))return!0;return!1}var K={};m("ES5",{J:function(Y,J){var ee=Array.isArray(Y),te=function(re,se){if(re){for(var oe=Array(se.length),ae=0;ae<se.length;ae++)Object.defineProperty(oe,""+ae,$(ae,!0));return oe}var ne=rn(se);delete ne[Q];for(var le=nn(ne),ce=0;ce<le.length;ce++){var de=le[ce];ne[de]=$(de,re||!!ne[de].enumerable)}return Object.create(Object.getPrototypeOf(se),ne)}(ee,Y),ie={i:ee?5:4,A:J?J.A:_(),P:!1,I:!1,R:{},l:J,t:Y,k:te,o:null,O:!1,C:!1};return Object.defineProperty(te,Q,{value:ie,writable:!0}),te},S:function(Y,J,ee){ee?r$1(J)&&J[Q].A===Y&&C(Y.p):(Y.u&&function te(ie){if(ie&&typeof ie=="object"){var re=ie[Q];if(re){var se=re.t,oe=re.k,ae=re.R,ne=re.i;if(ne===4)i(oe,function(ue){ue!==Q&&(se[ue]!==void 0||u(se,ue)?ae[ue]||te(oe[ue]):(ae[ue]=!0,k(re)))}),i(se,function(ue){oe[ue]!==void 0||u(oe,ue)||(ae[ue]=!1,k(re))});else if(ne===5){if(V(re)&&(k(re),ae.length=!0),oe.length<se.length)for(var le=oe.length;le<se.length;le++)ae[le]=!1;else for(var ce=se.length;ce<oe.length;ce++)ae[ce]=!0;for(var de=Math.min(oe.length,se.length),he=0;he<de;he++)oe.hasOwnProperty(he)||(ae[he]=!0),ae[he]===void 0&&te(oe[he])}}}}(Y.p[0]),C(Y.p))},K:function(Y){return Y.i===4?T(Y):V(Y)}})}var G,U,W=typeof Symbol<"u"&&typeof Symbol("x")=="symbol",X=typeof Map<"u",q=typeof Set<"u",B=typeof Proxy<"u"&&Proxy.revocable!==void 0&&typeof Reflect<"u",H=W?Symbol.for("immer-nothing"):((G={})["immer-nothing"]=!0,G),L=W?Symbol.for("immer-draftable"):"__$immer_draftable",Q=W?Symbol.for("immer-state"):"__$immer_state",Z=""+Object.prototype.constructor,nn=typeof Reflect<"u"&&Reflect.ownKeys?Reflect.ownKeys:Object.getOwnPropertySymbols!==void 0?function($){return Object.getOwnPropertyNames($).concat(Object.getOwnPropertySymbols($))}:Object.getOwnPropertyNames,rn=Object.getOwnPropertyDescriptors||function($){var C={};return nn($).forEach(function(T){C[T]=Object.getOwnPropertyDescriptor($,T)}),C},tn={},en={get:function($,C){if(C===Q)return $;var T=p$1($);if(!u(T,C))return function(K,Y,J){var ee,te=I(Y,J);return te?"value"in te?te.value:(ee=te.get)===null||ee===void 0?void 0:ee.call(K.k):void 0}($,T,C);var V=T[C];return $.I||!t(V)?V:V===z($.t,C)?(E($),$.o[C]=N($.A.h,V,$)):V},has:function($,C){return C in p$1($)},ownKeys:function($){return Reflect.ownKeys(p$1($))},set:function($,C,T){var V=I(p$1($),C);if(V!=null&&V.set)return V.set.call($.k,T),!0;if(!$.P){var K=z(p$1($),C),Y=K==null?void 0:K[Q];if(Y&&Y.t===T)return $.o[C]=T,$.R[C]=!1,!0;if(c$1(T,K)&&(T!==void 0||u($.t,C)))return!0;E($),k($)}return $.o[C]===T&&(T!==void 0||C in $.o)||Number.isNaN(T)&&Number.isNaN($.o[C])||($.o[C]=T,$.R[C]=!0),!0},deleteProperty:function($,C){return z($.t,C)!==void 0||C in $.t?($.R[C]=!1,E($),k($)):delete $.R[C],$.o&&delete $.o[C],!0},getOwnPropertyDescriptor:function($,C){var T=p$1($),V=Reflect.getOwnPropertyDescriptor(T,C);return V&&{writable:!0,configurable:$.i!==1||C!=="length",enumerable:V.enumerable,value:T[C]}},defineProperty:function(){n$1(11)},getPrototypeOf:function($){return Object.getPrototypeOf($.t)},setPrototypeOf:function(){n$1(12)}},on={};i(en,function($,C){on[$]=function(){return arguments[0]=arguments[0][0],C.apply(this,arguments)}}),on.deleteProperty=function($,C){return on.set.call(this,$,C,void 0)},on.set=function($,C,T){return en.set.call(this,$[0],C,T,$[0])};var un=function(){function $(T){var V=this;this.g=B,this.D=!0,this.produce=function(K,Y,J){if(typeof K=="function"&&typeof Y!="function"){var ee=Y;Y=K;var te=V;return function(le){var ce=this;le===void 0&&(le=ee);for(var de=arguments.length,he=Array(de>1?de-1:0),ue=1;ue<de;ue++)he[ue-1]=arguments[ue];return te.produce(le,function(fe){var pe;return(pe=Y).call.apply(pe,[ce,fe].concat(he))})}}var ie;if(typeof Y!="function"&&n$1(6),J!==void 0&&typeof J!="function"&&n$1(7),t(K)){var re=w(V),se=N(V,K,void 0),oe=!0;try{ie=Y(se),oe=!1}finally{oe?O(re):g(re)}return typeof Promise<"u"&&ie instanceof Promise?ie.then(function(le){return j(re,J),P(le,re)},function(le){throw O(re),le}):(j(re,J),P(ie,re))}if(!K||typeof K!="object"){if((ie=Y(K))===void 0&&(ie=K),ie===H&&(ie=void 0),V.D&&d(ie,!0),J){var ae=[],ne=[];b("Patches").M(K,ie,ae,ne),J(ae,ne)}return ie}n$1(21,K)},this.produceWithPatches=function(K,Y){if(typeof K=="function")return function(ie){for(var re=arguments.length,se=Array(re>1?re-1:0),oe=1;oe<re;oe++)se[oe-1]=arguments[oe];return V.produceWithPatches(ie,function(ae){return K.apply(void 0,[ae].concat(se))})};var J,ee,te=V.produce(K,Y,function(ie,re){J=ie,ee=re});return typeof Promise<"u"&&te instanceof Promise?te.then(function(ie){return[ie,J,ee]}):[te,J,ee]},typeof(T==null?void 0:T.useProxies)=="boolean"&&this.setUseProxies(T.useProxies),typeof(T==null?void 0:T.autoFreeze)=="boolean"&&this.setAutoFreeze(T.autoFreeze)}var C=$.prototype;return C.createDraft=function(T){t(T)||n$1(8),r$1(T)&&(T=R(T));var V=w(this),K=N(this,T,void 0);return K[Q].C=!0,g(V),K},C.finishDraft=function(T,V){var K=T&&T[Q],Y=K.A;return j(Y,V),P(void 0,Y)},C.setAutoFreeze=function(T){this.D=T},C.setUseProxies=function(T){T&&!B&&n$1(20),this.g=T},C.applyPatches=function(T,V){var K;for(K=V.length-1;K>=0;K--){var Y=V[K];if(Y.path.length===0&&Y.op==="replace"){T=Y.value;break}}K>-1&&(V=V.slice(K+1));var J=b("Patches").$;return r$1(T)?J(T,V):this.produce(T,function(ee){return J(ee,V)})},$}(),an=new un,fn=an.produce;an.produceWithPatches.bind(an);an.setAutoFreeze.bind(an);an.setUseProxies.bind(an);an.applyPatches.bind(an);an.createDraft.bind(an);an.finishDraft.bind(an);function _typeof($){return _typeof=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(C){return typeof C}:function(C){return C&&typeof Symbol=="function"&&C.constructor===Symbol&&C!==Symbol.prototype?"symbol":typeof C},_typeof($)}function _toPrimitive($,C){if(_typeof($)!=="object"||$===null)return $;var T=$[Symbol.toPrimitive];if(T!==void 0){var V=T.call($,C||"default");if(_typeof(V)!=="object")return V;throw new TypeError("@@toPrimitive must return a primitive value.")}return(C==="string"?String:Number)($)}function _toPropertyKey($){var C=_toPrimitive($,"string");return _typeof(C)==="symbol"?C:String(C)}function _defineProperty($,C,T){return C=_toPropertyKey(C),C in $?Object.defineProperty($,C,{value:T,enumerable:!0,configurable:!0,writable:!0}):$[C]=T,$}function ownKeys($,C){var T=Object.keys($);if(Object.getOwnPropertySymbols){var V=Object.getOwnPropertySymbols($);C&&(V=V.filter(function(K){return Object.getOwnPropertyDescriptor($,K).enumerable})),T.push.apply(T,V)}return T}function _objectSpread2($){for(var C=1;C<arguments.length;C++){var T=arguments[C]!=null?arguments[C]:{};C%2?ownKeys(Object(T),!0).forEach(function(V){_defineProperty($,V,T[V])}):Object.getOwnPropertyDescriptors?Object.defineProperties($,Object.getOwnPropertyDescriptors(T)):ownKeys(Object(T)).forEach(function(V){Object.defineProperty($,V,Object.getOwnPropertyDescriptor(T,V))})}return $}function formatProdErrorMessage($){return"Minified Redux error #"+$+"; visit https://redux.js.org/Errors?code="+$+" for the full message or use the non-minified dev environment for full errors. "}var $$observable=function(){return typeof Symbol=="function"&&Symbol.observable||"@@observable"}(),randomString=function(){return Math.random().toString(36).substring(7).split("").join(".")},ActionTypes={INIT:"@@redux/INIT"+randomString(),REPLACE:"@@redux/REPLACE"+randomString(),PROBE_UNKNOWN_ACTION:function(){return"@@redux/PROBE_UNKNOWN_ACTION"+randomString()}};function isPlainObject$2($){if(typeof $!="object"||$===null)return!1;for(var C=$;Object.getPrototypeOf(C)!==null;)C=Object.getPrototypeOf(C);return Object.getPrototypeOf($)===C}function createStore($,C,T){var V;if(typeof C=="function"&&typeof T=="function"||typeof T=="function"&&typeof arguments[3]=="function")throw new Error(formatProdErrorMessage(0));if(typeof C=="function"&&typeof T>"u"&&(T=C,C=void 0),typeof T<"u"){if(typeof T!="function")throw new Error(formatProdErrorMessage(1));return T(createStore)($,C)}if(typeof $!="function")throw new Error(formatProdErrorMessage(2));var K=$,Y=C,J=[],ee=J,te=!1;function ie(){ee===J&&(ee=J.slice())}function re(){if(te)throw new Error(formatProdErrorMessage(3));return Y}function se(le){if(typeof le!="function")throw new Error(formatProdErrorMessage(4));if(te)throw new Error(formatProdErrorMessage(5));var ce=!0;return ie(),ee.push(le),function(){if(ce){if(te)throw new Error(formatProdErrorMessage(6));ce=!1,ie();var he=ee.indexOf(le);ee.splice(he,1),J=null}}}function oe(le){if(!isPlainObject$2(le))throw new Error(formatProdErrorMessage(7));if(typeof le.type>"u")throw new Error(formatProdErrorMessage(8));if(te)throw new Error(formatProdErrorMessage(9));try{te=!0,Y=K(Y,le)}finally{te=!1}for(var ce=J=ee,de=0;de<ce.length;de++){var he=ce[de];he()}return le}function ae(le){if(typeof le!="function")throw new Error(formatProdErrorMessage(10));K=le,oe({type:ActionTypes.REPLACE})}function ne(){var le,ce=se;return le={subscribe:function(he){if(typeof he!="object"||he===null)throw new Error(formatProdErrorMessage(11));function ue(){he.next&&he.next(re())}ue();var fe=ce(ue);return{unsubscribe:fe}}},le[$$observable]=function(){return this},le}return oe({type:ActionTypes.INIT}),V={dispatch:oe,subscribe:se,getState:re,replaceReducer:ae},V[$$observable]=ne,V}function assertReducerShape($){Object.keys($).forEach(function(C){var T=$[C],V=T(void 0,{type:ActionTypes.INIT});if(typeof V>"u")throw new Error(formatProdErrorMessage(12));if(typeof T(void 0,{type:ActionTypes.PROBE_UNKNOWN_ACTION()})>"u")throw new Error(formatProdErrorMessage(13))})}function combineReducers($){for(var C=Object.keys($),T={},V=0;V<C.length;V++){var K=C[V];typeof $[K]=="function"&&(T[K]=$[K])}var Y=Object.keys(T),J;try{assertReducerShape(T)}catch(ee){J=ee}return function(te,ie){if(te===void 0&&(te={}),J)throw J;for(var re=!1,se={},oe=0;oe<Y.length;oe++){var ae=Y[oe],ne=T[ae],le=te[ae],ce=ne(le,ie);if(typeof ce>"u")throw ie&&ie.type,new Error(formatProdErrorMessage(14));se[ae]=ce,re=re||ce!==le}return re=re||Y.length!==Object.keys(te).length,re?se:te}}function compose(){for(var $=arguments.length,C=new Array($),T=0;T<$;T++)C[T]=arguments[T];return C.length===0?function(V){return V}:C.length===1?C[0]:C.reduce(function(V,K){return function(){return V(K.apply(void 0,arguments))}})}function applyMiddleware(){for(var $=arguments.length,C=new Array($),T=0;T<$;T++)C[T]=arguments[T];return function(V){return function(){var K=V.apply(void 0,arguments),Y=function(){throw new Error(formatProdErrorMessage(15))},J={getState:K.getState,dispatch:function(){return Y.apply(void 0,arguments)}},ee=C.map(function(te){return te(J)});return Y=compose.apply(void 0,ee)(K.dispatch),_objectSpread2(_objectSpread2({},K),{},{dispatch:Y})}}}function createThunkMiddleware($){var C=function(V){var K=V.dispatch,Y=V.getState;return function(J){return function(ee){return typeof ee=="function"?ee(K,Y,$):J(ee)}}};return C}var thunk=createThunkMiddleware();thunk.withExtraArgument=createThunkMiddleware;const thunkMiddleware=thunk;var __extends=globalThis&&globalThis.__extends||function(){var $=function(C,T){return $=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(V,K){V.__proto__=K}||function(V,K){for(var Y in K)Object.prototype.hasOwnProperty.call(K,Y)&&(V[Y]=K[Y])},$(C,T)};return function(C,T){if(typeof T!="function"&&T!==null)throw new TypeError("Class extends value "+String(T)+" is not a constructor or null");$(C,T);function V(){this.constructor=C}C.prototype=T===null?Object.create(T):(V.prototype=T.prototype,new V)}}(),__generator=globalThis&&globalThis.__generator||function($,C){var T={label:0,sent:function(){if(Y[0]&1)throw Y[1];return Y[1]},trys:[],ops:[]},V,K,Y,J;return J={next:ee(0),throw:ee(1),return:ee(2)},typeof Symbol=="function"&&(J[Symbol.iterator]=function(){return this}),J;function ee(ie){return function(re){return te([ie,re])}}function te(ie){if(V)throw new TypeError("Generator is already executing.");for(;T;)try{if(V=1,K&&(Y=ie[0]&2?K.return:ie[0]?K.throw||((Y=K.return)&&Y.call(K),0):K.next)&&!(Y=Y.call(K,ie[1])).done)return Y;switch(K=0,Y&&(ie=[ie[0]&2,Y.value]),ie[0]){case 0:case 1:Y=ie;break;case 4:return T.label++,{value:ie[1],done:!1};case 5:T.label++,K=ie[1],ie=[0];continue;case 7:ie=T.ops.pop(),T.trys.pop();continue;default:if(Y=T.trys,!(Y=Y.length>0&&Y[Y.length-1])&&(ie[0]===6||ie[0]===2)){T=0;continue}if(ie[0]===3&&(!Y||ie[1]>Y[0]&&ie[1]<Y[3])){T.label=ie[1];break}if(ie[0]===6&&T.label<Y[1]){T.label=Y[1],Y=ie;break}if(Y&&T.label<Y[2]){T.label=Y[2],T.ops.push(ie);break}Y[2]&&T.ops.pop(),T.trys.pop();continue}ie=C.call($,T)}catch(re){ie=[6,re],K=0}finally{V=Y=0}if(ie[0]&5)throw ie[1];return{value:ie[0]?ie[1]:void 0,done:!0}}},__spreadArray=globalThis&&globalThis.__spreadArray||function($,C){for(var T=0,V=C.length,K=$.length;T<V;T++,K++)$[K]=C[T];return $},__defProp$A=Object.defineProperty,__defProps=Object.defineProperties,__getOwnPropDescs=Object.getOwnPropertyDescriptors,__getOwnPropSymbols=Object.getOwnPropertySymbols,__hasOwnProp=Object.prototype.hasOwnProperty,__propIsEnum=Object.prototype.propertyIsEnumerable,__defNormalProp=function($,C,T){return C in $?__defProp$A($,C,{enumerable:!0,configurable:!0,writable:!0,value:T}):$[C]=T},__spreadValues=function($,C){for(var T in C||(C={}))__hasOwnProp.call(C,T)&&__defNormalProp($,T,C[T]);if(__getOwnPropSymbols)for(var V=0,K=__getOwnPropSymbols(C);V<K.length;V++){var T=K[V];__propIsEnum.call(C,T)&&__defNormalProp($,T,C[T])}return $},__spreadProps=function($,C){return __defProps($,__getOwnPropDescs(C))},__async=function($,C,T){return new Promise(function(V,K){var Y=function(te){try{ee(T.next(te))}catch(ie){K(ie)}},J=function(te){try{ee(T.throw(te))}catch(ie){K(ie)}},ee=function(te){return te.done?V(te.value):Promise.resolve(te.value).then(Y,J)};ee((T=T.apply($,C)).next())})},composeWithDevTools=typeof window<"u"&&window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__:function(){if(arguments.length!==0)return typeof arguments[0]=="object"?compose:compose.apply(null,arguments)};function isPlainObject$1($){if(typeof $!="object"||$===null)return!1;var C=Object.getPrototypeOf($);if(C===null)return!0;for(var T=C;Object.getPrototypeOf(T)!==null;)T=Object.getPrototypeOf(T);return C===T}var MiddlewareArray=function($){__extends(C,$);function C(){for(var T=[],V=0;V<arguments.length;V++)T[V]=arguments[V];var K=$.apply(this,T)||this;return Object.setPrototypeOf(K,C.prototype),K}return Object.defineProperty(C,Symbol.species,{get:function(){return C},enumerable:!1,configurable:!0}),C.prototype.concat=function(){for(var T=[],V=0;V<arguments.length;V++)T[V]=arguments[V];return $.prototype.concat.apply(this,T)},C.prototype.prepend=function(){for(var T=[],V=0;V<arguments.length;V++)T[V]=arguments[V];return T.length===1&&Array.isArray(T[0])?new(C.bind.apply(C,__spreadArray([void 0],T[0].concat(this)))):new(C.bind.apply(C,__spreadArray([void 0],T.concat(this))))},C}(Array);function freezeDraftable($){return t($)?fn($,function(){}):$}function isBoolean$1($){return typeof $=="boolean"}function curryGetDefaultMiddleware(){return function(C){return getDefaultMiddleware(C)}}function getDefaultMiddleware($){$===void 0&&($={});var C=$.thunk,T=C===void 0?!0:C;$.immutableCheck,$.serializableCheck;var V=new MiddlewareArray;return T&&(isBoolean$1(T)?V.push(thunkMiddleware):V.push(thunkMiddleware.withExtraArgument(T.extraArgument))),V}var IS_PRODUCTION=!0;function configureStore($){var C=curryGetDefaultMiddleware(),T=$||{},V=T.reducer,K=V===void 0?void 0:V,Y=T.middleware,J=Y===void 0?C():Y,ee=T.devTools,te=ee===void 0?!0:ee,ie=T.preloadedState,re=ie===void 0?void 0:ie,se=T.enhancers,oe=se===void 0?void 0:se,ae;if(typeof K=="function")ae=K;else if(isPlainObject$1(K))ae=combineReducers(K);else throw new Error('"reducer" is a required argument, and must be a function or an object of functions that can be passed to combineReducers');var ne=J;typeof ne=="function"&&(ne=ne(C));var le=applyMiddleware.apply(void 0,ne),ce=compose;te&&(ce=composeWithDevTools(__spreadValues({trace:!IS_PRODUCTION},typeof te=="object"&&te)));var de=[le];Array.isArray(oe)?de=__spreadArray([le],oe):typeof oe=="function"&&(de=oe(de));var he=ce.apply(void 0,de);return createStore(ae,re,he)}function createAction($,C){function T(){for(var V=[],K=0;K<arguments.length;K++)V[K]=arguments[K];if(C){var Y=C.apply(void 0,V);if(!Y)throw new Error("prepareAction did not return an object");return __spreadValues(__spreadValues({type:$,payload:Y.payload},"meta"in Y&&{meta:Y.meta}),"error"in Y&&{error:Y.error})}return{type:$,payload:V[0]}}return T.toString=function(){return""+$},T.type=$,T.match=function(V){return V.type===$},T}function executeReducerBuilderCallback($){var C={},T=[],V,K={addCase:function(Y,J){var ee=typeof Y=="string"?Y:Y.type;if(ee in C)throw new Error("addCase cannot be called with two reducers for the same action type");return C[ee]=J,K},addMatcher:function(Y,J){return T.push({matcher:Y,reducer:J}),K},addDefaultCase:function(Y){return V=Y,K}};return $(K),[C,T,V]}function isStateFunction($){return typeof $=="function"}function createReducer($,C,T,V){T===void 0&&(T=[]);var K=typeof C=="function"?executeReducerBuilderCallback(C):[C,T,V],Y=K[0],J=K[1],ee=K[2],te;if(isStateFunction($))te=function(){return freezeDraftable($())};else{var ie=freezeDraftable($);te=function(){return ie}}function re(se,oe){se===void 0&&(se=te());var ae=__spreadArray([Y[oe.type]],J.filter(function(ne){var le=ne.matcher;return le(oe)}).map(function(ne){var le=ne.reducer;return le}));return ae.filter(function(ne){return!!ne}).length===0&&(ae=[ee]),ae.reduce(function(ne,le){if(le)if(r$1(ne)){var ce=ne,de=le(ce,oe);return de===void 0?ne:de}else{if(t(ne))return fn(ne,function(he){return le(he,oe)});var de=le(ne,oe);if(de===void 0){if(ne===null)return ne;throw Error("A case reducer on a non-draftable value must not return undefined")}return de}return ne},se)}return re.getInitialState=te,re}function getType2($,C){return $+"/"+C}function createSlice($){var C=$.name;if(!C)throw new Error("`name` is a required option for createSlice");typeof process<"u";var T=typeof $.initialState=="function"?$.initialState:freezeDraftable($.initialState),V=$.reducers||{},K=Object.keys(V),Y={},J={},ee={};K.forEach(function(re){var se=V[re],oe=getType2(C,re),ae,ne;"reducer"in se?(ae=se.reducer,ne=se.prepare):ae=se,Y[re]=ae,J[oe]=ae,ee[re]=ne?createAction(oe,ne):createAction(oe)});function te(){var re=typeof $.extraReducers=="function"?executeReducerBuilderCallback($.extraReducers):[$.extraReducers],se=re[0],oe=se===void 0?{}:se,ae=re[1],ne=ae===void 0?[]:ae,le=re[2],ce=le===void 0?void 0:le,de=__spreadValues(__spreadValues({},oe),J);return createReducer(T,function(he){for(var ue in de)he.addCase(ue,de[ue]);for(var fe=0,pe=ne;fe<pe.length;fe++){var me=pe[fe];he.addMatcher(me.matcher,me.reducer)}ce&&he.addDefaultCase(ce)})}var ie;return{name:C,reducer:function(re,se){return ie||(ie=te()),ie(re,se)},actions:ee,caseReducers:Y,getInitialState:function(){return ie||(ie=te()),ie.getInitialState()}}}var urlAlphabet="ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW",nanoid$1=function($){$===void 0&&($=21);for(var C="",T=$;T--;)C+=urlAlphabet[Math.random()*64|0];return C},commonProperties=["name","message","stack","code"],RejectWithValue=function(){function $(C,T){this.payload=C,this.meta=T}return $}(),FulfillWithMeta=function(){function $(C,T){this.payload=C,this.meta=T}return $}(),miniSerializeError=function($){if(typeof $=="object"&&$!==null){for(var C={},T=0,V=commonProperties;T<V.length;T++){var K=V[T];typeof $[K]=="string"&&(C[K]=$[K])}return C}return{message:String($)}};(function(){function $(C,T,V){var K=createAction(C+"/fulfilled",function(ie,re,se,oe){return{payload:ie,meta:__spreadProps(__spreadValues({},oe||{}),{arg:se,requestId:re,requestStatus:"fulfilled"})}}),Y=createAction(C+"/pending",function(ie,re,se){return{payload:void 0,meta:__spreadProps(__spreadValues({},se||{}),{arg:re,requestId:ie,requestStatus:"pending"})}}),J=createAction(C+"/rejected",function(ie,re,se,oe,ae){return{payload:oe,error:(V&&V.serializeError||miniSerializeError)(ie||"Rejected"),meta:__spreadProps(__spreadValues({},ae||{}),{arg:se,requestId:re,rejectedWithValue:!!oe,requestStatus:"rejected",aborted:(ie==null?void 0:ie.name)==="AbortError",condition:(ie==null?void 0:ie.name)==="ConditionError"})}}),ee=typeof AbortController<"u"?AbortController:function(){function ie(){this.signal={aborted:!1,addEventListener:function(){},dispatchEvent:function(){return!1},onabort:function(){},removeEventListener:function(){},reason:void 0,throwIfAborted:function(){}}}return ie.prototype.abort=function(){},ie}();function te(ie){return function(re,se,oe){var ae=V!=null&&V.idGenerator?V.idGenerator(ie):nanoid$1(),ne=new ee,le;function ce(he){le=he,ne.abort()}var de=function(){return __async(this,null,function(){var he,ue,fe,pe,me,ge,ye;return __generator(this,function(be){switch(be.label){case 0:return be.trys.push([0,4,,5]),pe=(he=V==null?void 0:V.condition)==null?void 0:he.call(V,ie,{getState:se,extra:oe}),isThenable(pe)?[4,pe]:[3,2];case 1:pe=be.sent(),be.label=2;case 2:if(pe===!1||ne.signal.aborted)throw{name:"ConditionError",message:"Aborted due to condition callback returning false."};return me=new Promise(function(_e,ve){return ne.signal.addEventListener("abort",function(){return ve({name:"AbortError",message:le||"Aborted"})})}),re(Y(ae,ie,(ue=V==null?void 0:V.getPendingMeta)==null?void 0:ue.call(V,{requestId:ae,arg:ie},{getState:se,extra:oe}))),[4,Promise.race([me,Promise.resolve(T(ie,{dispatch:re,getState:se,extra:oe,requestId:ae,signal:ne.signal,abort:ce,rejectWithValue:function(_e,ve){return new RejectWithValue(_e,ve)},fulfillWithValue:function(_e,ve){return new FulfillWithMeta(_e,ve)}})).then(function(_e){if(_e instanceof RejectWithValue)throw _e;return _e instanceof FulfillWithMeta?K(_e.payload,ae,ie,_e.meta):K(_e,ae,ie)})])];case 3:return fe=be.sent(),[3,5];case 4:return ge=be.sent(),fe=ge instanceof RejectWithValue?J(null,ae,ie,ge.payload,ge.meta):J(ge,ae,ie),[3,5];case 5:return ye=V&&!V.dispatchConditionRejection&&J.match(fe)&&fe.meta.condition,ye||re(fe),[2,fe]}})})}();return Object.assign(de,{abort:ce,requestId:ae,arg:ie,unwrap:function(){return de.then(unwrapResult)}})}}return Object.assign(te,{pending:Y,rejected:J,fulfilled:K,typePrefix:C})}return $.withTypes=function(){return $},$})();function unwrapResult($){if($.meta&&$.meta.rejectedWithValue)throw $.payload;if($.error)throw $.error;return $.payload}function isThenable($){return $!==null&&typeof $=="object"&&typeof $.then=="function"}var alm="listenerMiddleware";createAction(alm+"/add");createAction(alm+"/removeAll");createAction(alm+"/remove");var promise$1;typeof queueMicrotask=="function"&&queueMicrotask.bind(typeof window<"u"?window:typeof global<"u"?global:globalThis);F();function bind($,C){return function(){return $.apply(C,arguments)}}const{toString}=Object.prototype,{getPrototypeOf}=Object,kindOf=($=>C=>{const T=toString.call(C);return $[T]||($[T]=T.slice(8,-1).toLowerCase())})(Object.create(null)),kindOfTest=$=>($=$.toLowerCase(),C=>kindOf(C)===$),typeOfTest=$=>C=>typeof C===$,{isArray}=Array,isUndefined=typeOfTest("undefined");function isBuffer($){return $!==null&&!isUndefined($)&&$.constructor!==null&&!isUndefined($.constructor)&&isFunction($.constructor.isBuffer)&&$.constructor.isBuffer($)}const isArrayBuffer=kindOfTest("ArrayBuffer");function isArrayBufferView($){let C;return typeof ArrayBuffer<"u"&&ArrayBuffer.isView?C=ArrayBuffer.isView($):C=$&&$.buffer&&isArrayBuffer($.buffer),C}const isString=typeOfTest("string"),isFunction=typeOfTest("function"),isNumber=typeOfTest("number"),isObject=$=>$!==null&&typeof $=="object",isBoolean=$=>$===!0||$===!1,isPlainObject=$=>{if(kindOf($)!=="object")return!1;const C=getPrototypeOf($);return(C===null||C===Object.prototype||Object.getPrototypeOf(C)===null)&&!(Symbol.toStringTag in $)&&!(Symbol.iterator in $)},isDate=kindOfTest("Date"),isFile=kindOfTest("File"),isBlob=kindOfTest("Blob"),isFileList=kindOfTest("FileList"),isStream=$=>isObject($)&&isFunction($.pipe),isFormData=$=>{const C="[object FormData]";return $&&(typeof FormData=="function"&&$ instanceof FormData||toString.call($)===C||isFunction($.toString)&&$.toString()===C)},isURLSearchParams=kindOfTest("URLSearchParams"),trim=$=>$.trim?$.trim():$.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"");function forEach($,C,{allOwnKeys:T=!1}={}){if($===null||typeof $>"u")return;let V,K;if(typeof $!="object"&&($=[$]),isArray($))for(V=0,K=$.length;V<K;V++)C.call(null,$[V],V,$);else{const Y=T?Object.getOwnPropertyNames($):Object.keys($),J=Y.length;let ee;for(V=0;V<J;V++)ee=Y[V],C.call(null,$[ee],ee,$)}}function findKey($,C){C=C.toLowerCase();const T=Object.keys($);let V=T.length,K;for(;V-- >0;)if(K=T[V],C===K.toLowerCase())return K;return null}const _global=(()=>typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:global)(),isContextDefined=$=>!isUndefined($)&&$!==_global;function merge(){const{caseless:$}=isContextDefined(this)&&this||{},C={},T=(V,K)=>{const Y=$&&findKey(C,K)||K;isPlainObject(C[Y])&&isPlainObject(V)?C[Y]=merge(C[Y],V):isPlainObject(V)?C[Y]=merge({},V):isArray(V)?C[Y]=V.slice():C[Y]=V};for(let V=0,K=arguments.length;V<K;V++)arguments[V]&&forEach(arguments[V],T);return C}const extend=($,C,T,{allOwnKeys:V}={})=>(forEach(C,(K,Y)=>{T&&isFunction(K)?$[Y]=bind(K,T):$[Y]=K},{allOwnKeys:V}),$),stripBOM=$=>($.charCodeAt(0)===65279&&($=$.slice(1)),$),inherits=($,C,T,V)=>{$.prototype=Object.create(C.prototype,V),$.prototype.constructor=$,Object.defineProperty($,"super",{value:C.prototype}),T&&Object.assign($.prototype,T)},toFlatObject=($,C,T,V)=>{let K,Y,J;const ee={};if(C=C||{},$==null)return C;do{for(K=Object.getOwnPropertyNames($),Y=K.length;Y-- >0;)J=K[Y],(!V||V(J,$,C))&&!ee[J]&&(C[J]=$[J],ee[J]=!0);$=T!==!1&&getPrototypeOf($)}while($&&(!T||T($,C))&&$!==Object.prototype);return C},endsWith=($,C,T)=>{$=String($),(T===void 0||T>$.length)&&(T=$.length),T-=C.length;const V=$.indexOf(C,T);return V!==-1&&V===T},toArray=$=>{if(!$)return null;if(isArray($))return $;let C=$.length;if(!isNumber(C))return null;const T=new Array(C);for(;C-- >0;)T[C]=$[C];return T},isTypedArray=($=>C=>$&&C instanceof $)(typeof Uint8Array<"u"&&getPrototypeOf(Uint8Array)),forEachEntry=($,C)=>{const V=($&&$[Symbol.iterator]).call($);let K;for(;(K=V.next())&&!K.done;){const Y=K.value;C.call($,Y[0],Y[1])}},matchAll=($,C)=>{let T;const V=[];for(;(T=$.exec(C))!==null;)V.push(T);return V},isHTMLForm=kindOfTest("HTMLFormElement"),toCamelCase=$=>$.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,function(T,V,K){return V.toUpperCase()+K}),hasOwnProperty=(({hasOwnProperty:$})=>(C,T)=>$.call(C,T))(Object.prototype),isRegExp=kindOfTest("RegExp"),reduceDescriptors=($,C)=>{const T=Object.getOwnPropertyDescriptors($),V={};forEach(T,(K,Y)=>{C(K,Y,$)!==!1&&(V[Y]=K)}),Object.defineProperties($,V)},freezeMethods=$=>{reduceDescriptors($,(C,T)=>{if(isFunction($)&&["arguments","caller","callee"].indexOf(T)!==-1)return!1;const V=$[T];if(isFunction(V)){if(C.enumerable=!1,"writable"in C){C.writable=!1;return}C.set||(C.set=()=>{throw Error("Can not rewrite read-only method '"+T+"'")})}})},toObjectSet=($,C)=>{const T={},V=K=>{K.forEach(Y=>{T[Y]=!0})};return isArray($)?V($):V(String($).split(C)),T},noop=()=>{},toFiniteNumber=($,C)=>($=+$,Number.isFinite($)?$:C),ALPHA="abcdefghijklmnopqrstuvwxyz",DIGIT="0123456789",ALPHABET={DIGIT,ALPHA,ALPHA_DIGIT:ALPHA+ALPHA.toUpperCase()+DIGIT},generateString=($=16,C=ALPHABET.ALPHA_DIGIT)=>{let T="";const{length:V}=C;for(;$--;)T+=C[Math.random()*V|0];return T};function isSpecCompliantForm($){return!!($&&isFunction($.append)&&$[Symbol.toStringTag]==="FormData"&&$[Symbol.iterator])}const toJSONObject=$=>{const C=new Array(10),T=(V,K)=>{if(isObject(V)){if(C.indexOf(V)>=0)return;if(!("toJSON"in V)){C[K]=V;const Y=isArray(V)?[]:{};return forEach(V,(J,ee)=>{const te=T(J,K+1);!isUndefined(te)&&(Y[ee]=te)}),C[K]=void 0,Y}}return V};return T($,0)},utils={isArray,isArrayBuffer,isBuffer,isFormData,isArrayBufferView,isString,isNumber,isBoolean,isObject,isPlainObject,isUndefined,isDate,isFile,isBlob,isRegExp,isFunction,isStream,isURLSearchParams,isTypedArray,isFileList,forEach,merge,extend,trim,stripBOM,inherits,toFlatObject,kindOf,kindOfTest,endsWith,toArray,forEachEntry,matchAll,isHTMLForm,hasOwnProperty,hasOwnProp:hasOwnProperty,reduceDescriptors,freezeMethods,toObjectSet,toCamelCase,noop,toFiniteNumber,findKey,global:_global,isContextDefined,ALPHABET,generateString,isSpecCompliantForm,toJSONObject};function AxiosError($,C,T,V,K){Error.call(this),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack,this.message=$,this.name="AxiosError",C&&(this.code=C),T&&(this.config=T),V&&(this.request=V),K&&(this.response=K)}utils.inherits(AxiosError,Error,{toJSON:function(){return{message:this.message,name:this.name,description:this.description,number:this.number,fileName:this.fileName,lineNumber:this.lineNumber,columnNumber:this.columnNumber,stack:this.stack,config:utils.toJSONObject(this.config),code:this.code,status:this.response&&this.response.status?this.response.status:null}}});const prototype$1=AxiosError.prototype,descriptors={};["ERR_BAD_OPTION_VALUE","ERR_BAD_OPTION","ECONNABORTED","ETIMEDOUT","ERR_NETWORK","ERR_FR_TOO_MANY_REDIRECTS","ERR_DEPRECATED","ERR_BAD_RESPONSE","ERR_BAD_REQUEST","ERR_CANCELED","ERR_NOT_SUPPORT","ERR_INVALID_URL"].forEach($=>{descriptors[$]={value:$}});Object.defineProperties(AxiosError,descriptors);Object.defineProperty(prototype$1,"isAxiosError",{value:!0});AxiosError.from=($,C,T,V,K,Y)=>{const J=Object.create(prototype$1);return utils.toFlatObject($,J,function(te){return te!==Error.prototype},ee=>ee!=="isAxiosError"),AxiosError.call(J,$.message,C,T,V,K),J.cause=$,J.name=$.name,Y&&Object.assign(J,Y),J};const httpAdapter=null;function isVisitable($){return utils.isPlainObject($)||utils.isArray($)}function removeBrackets($){return utils.endsWith($,"[]")?$.slice(0,-2):$}function renderKey($,C,T){return $?$.concat(C).map(function(K,Y){return K=removeBrackets(K),!T&&Y?"["+K+"]":K}).join(T?".":""):C}function isFlatArray($){return utils.isArray($)&&!$.some(isVisitable)}const predicates=utils.toFlatObject(utils,{},null,function(C){return/^is[A-Z]/.test(C)});function toFormData($,C,T){if(!utils.isObject($))throw new TypeError("target must be an object");C=C||new FormData,T=utils.toFlatObject(T,{metaTokens:!0,dots:!1,indexes:!1},!1,function(le,ce){return!utils.isUndefined(ce[le])});const V=T.metaTokens,K=T.visitor||re,Y=T.dots,J=T.indexes,te=(T.Blob||typeof Blob<"u"&&Blob)&&utils.isSpecCompliantForm(C);if(!utils.isFunction(K))throw new TypeError("visitor must be a function");function ie(ne){if(ne===null)return"";if(utils.isDate(ne))return ne.toISOString();if(!te&&utils.isBlob(ne))throw new AxiosError("Blob is not supported. Use a Buffer instead.");return utils.isArrayBuffer(ne)||utils.isTypedArray(ne)?te&&typeof Blob=="function"?new Blob([ne]):Buffer.from(ne):ne}function re(ne,le,ce){let de=ne;if(ne&&!ce&&typeof ne=="object"){if(utils.endsWith(le,"{}"))le=V?le:le.slice(0,-2),ne=JSON.stringify(ne);else if(utils.isArray(ne)&&isFlatArray(ne)||(utils.isFileList(ne)||utils.endsWith(le,"[]"))&&(de=utils.toArray(ne)))return le=removeBrackets(le),de.forEach(function(ue,fe){!(utils.isUndefined(ue)||ue===null)&&C.append(J===!0?renderKey([le],fe,Y):J===null?le:le+"[]",ie(ue))}),!1}return isVisitable(ne)?!0:(C.append(renderKey(ce,le,Y),ie(ne)),!1)}const se=[],oe=Object.assign(predicates,{defaultVisitor:re,convertValue:ie,isVisitable});function ae(ne,le){if(!utils.isUndefined(ne)){if(se.indexOf(ne)!==-1)throw Error("Circular reference detected in "+le.join("."));se.push(ne),utils.forEach(ne,function(de,he){(!(utils.isUndefined(de)||de===null)&&K.call(C,de,utils.isString(he)?he.trim():he,le,oe))===!0&&ae(de,le?le.concat(he):[he])}),se.pop()}}if(!utils.isObject($))throw new TypeError("data must be an object");return ae($),C}function encode$1($){const C={"!":"%21","'":"%27","(":"%28",")":"%29","~":"%7E","%20":"+","%00":"\0"};return encodeURIComponent($).replace(/[!'()~]|%20|%00/g,function(V){return C[V]})}function AxiosURLSearchParams($,C){this._pairs=[],$&&toFormData($,this,C)}const prototype=AxiosURLSearchParams.prototype;prototype.append=function(C,T){this._pairs.push([C,T])};prototype.toString=function(C){const T=C?function(V){return C.call(this,V,encode$1)}:encode$1;return this._pairs.map(function(K){return T(K[0])+"="+T(K[1])},"").join("&")};function encode($){return encodeURIComponent($).replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"+").replace(/%5B/gi,"[").replace(/%5D/gi,"]")}function buildURL($,C,T){if(!C)return $;const V=T&&T.encode||encode,K=T&&T.serialize;let Y;if(K?Y=K(C,T):Y=utils.isURLSearchParams(C)?C.toString():new AxiosURLSearchParams(C,T).toString(V),Y){const J=$.indexOf("#");J!==-1&&($=$.slice(0,J)),$+=($.indexOf("?")===-1?"?":"&")+Y}return $}class InterceptorManager{constructor(){this.handlers=[]}use(C,T,V){return this.handlers.push({fulfilled:C,rejected:T,synchronous:V?V.synchronous:!1,runWhen:V?V.runWhen:null}),this.handlers.length-1}eject(C){this.handlers[C]&&(this.handlers[C]=null)}clear(){this.handlers&&(this.handlers=[])}forEach(C){utils.forEach(this.handlers,function(V){V!==null&&C(V)})}}const InterceptorManager$1=InterceptorManager,transitionalDefaults={silentJSONParsing:!0,forcedJSONParsing:!0,clarifyTimeoutError:!1},URLSearchParams$1=typeof URLSearchParams<"u"?URLSearchParams:AxiosURLSearchParams,FormData$1=typeof FormData<"u"?FormData:null,Blob$1=typeof Blob<"u"?Blob:null,isStandardBrowserEnv=(()=>{let $;return typeof navigator<"u"&&(($=navigator.product)==="ReactNative"||$==="NativeScript"||$==="NS")?!1:typeof window<"u"&&typeof document<"u"})(),isStandardBrowserWebWorkerEnv=(()=>typeof WorkerGlobalScope<"u"&&self instanceof WorkerGlobalScope&&typeof self.importScripts=="function")(),platform={isBrowser:!0,classes:{URLSearchParams:URLSearchParams$1,FormData:FormData$1,Blob:Blob$1},isStandardBrowserEnv,isStandardBrowserWebWorkerEnv,protocols:["http","https","file","blob","url","data"]};function toURLEncodedForm($,C){return toFormData($,new platform.classes.URLSearchParams,Object.assign({visitor:function(T,V,K,Y){return platform.isNode&&utils.isBuffer(T)?(this.append(V,T.toString("base64")),!1):Y.defaultVisitor.apply(this,arguments)}},C))}function parsePropPath($){return utils.matchAll(/\w+|\[(\w*)]/g,$).map(C=>C[0]==="[]"?"":C[1]||C[0])}function arrayToObject($){const C={},T=Object.keys($);let V;const K=T.length;let Y;for(V=0;V<K;V++)Y=T[V],C[Y]=$[Y];return C}function formDataToJSON($){function C(T,V,K,Y){let J=T[Y++];const ee=Number.isFinite(+J),te=Y>=T.length;return J=!J&&utils.isArray(K)?K.length:J,te?(utils.hasOwnProp(K,J)?K[J]=[K[J],V]:K[J]=V,!ee):((!K[J]||!utils.isObject(K[J]))&&(K[J]=[]),C(T,V,K[J],Y)&&utils.isArray(K[J])&&(K[J]=arrayToObject(K[J])),!ee)}if(utils.isFormData($)&&utils.isFunction($.entries)){const T={};return utils.forEachEntry($,(V,K)=>{C(parsePropPath(V),K,T,0)}),T}return null}const DEFAULT_CONTENT_TYPE={"Content-Type":void 0};function stringifySafely($,C,T){if(utils.isString($))try{return(C||JSON.parse)($),utils.trim($)}catch(V){if(V.name!=="SyntaxError")throw V}return(T||JSON.stringify)($)}const defaults={transitional:transitionalDefaults,adapter:["xhr","http"],transformRequest:[function(C,T){const V=T.getContentType()||"",K=V.indexOf("application/json")>-1,Y=utils.isObject(C);if(Y&&utils.isHTMLForm(C)&&(C=new FormData(C)),utils.isFormData(C))return K&&K?JSON.stringify(formDataToJSON(C)):C;if(utils.isArrayBuffer(C)||utils.isBuffer(C)||utils.isStream(C)||utils.isFile(C)||utils.isBlob(C))return C;if(utils.isArrayBufferView(C))return C.buffer;if(utils.isURLSearchParams(C))return T.setContentType("application/x-www-form-urlencoded;charset=utf-8",!1),C.toString();let ee;if(Y){if(V.indexOf("application/x-www-form-urlencoded")>-1)return toURLEncodedForm(C,this.formSerializer).toString();if((ee=utils.isFileList(C))||V.indexOf("multipart/form-data")>-1){const te=this.env&&this.env.FormData;return toFormData(ee?{"files[]":C}:C,te&&new te,this.formSerializer)}}return Y||K?(T.setContentType("application/json",!1),stringifySafely(C)):C}],transformResponse:[function(C){const T=this.transitional||defaults.transitional,V=T&&T.forcedJSONParsing,K=this.responseType==="json";if(C&&utils.isString(C)&&(V&&!this.responseType||K)){const J=!(T&&T.silentJSONParsing)&&K;try{return JSON.parse(C)}catch(ee){if(J)throw ee.name==="SyntaxError"?AxiosError.from(ee,AxiosError.ERR_BAD_RESPONSE,this,null,this.response):ee}}return C}],timeout:0,xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",maxContentLength:-1,maxBodyLength:-1,env:{FormData:platform.classes.FormData,Blob:platform.classes.Blob},validateStatus:function(C){return C>=200&&C<300},headers:{common:{Accept:"application/json, text/plain, */*"}}};utils.forEach(["delete","get","head"],function(C){defaults.headers[C]={}});utils.forEach(["post","put","patch"],function(C){defaults.headers[C]=utils.merge(DEFAULT_CONTENT_TYPE)});const defaults$1=defaults,ignoreDuplicateOf=utils.toObjectSet(["age","authorization","content-length","content-type","etag","expires","from","host","if-modified-since","if-unmodified-since","last-modified","location","max-forwards","proxy-authorization","referer","retry-after","user-agent"]),parseHeaders=$=>{const C={};let T,V,K;return $&&$.split(`
`).forEach(function(J){K=J.indexOf(":"),T=J.substring(0,K).trim().toLowerCase(),V=J.substring(K+1).trim(),!(!T||C[T]&&ignoreDuplicateOf[T])&&(T==="set-cookie"?C[T]?C[T].push(V):C[T]=[V]:C[T]=C[T]?C[T]+", "+V:V)}),C},$internals=Symbol("internals");function normalizeHeader($){return $&&String($).trim().toLowerCase()}function normalizeValue($){return $===!1||$==null?$:utils.isArray($)?$.map(normalizeValue):String($)}function parseTokens($){const C=Object.create(null),T=/([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;let V;for(;V=T.exec($);)C[V[1]]=V[2];return C}function isValidHeaderName($){return/^[-_a-zA-Z]+$/.test($.trim())}function matchHeaderValue($,C,T,V,K){if(utils.isFunction(V))return V.call(this,C,T);if(K&&(C=T),!!utils.isString(C)){if(utils.isString(V))return C.indexOf(V)!==-1;if(utils.isRegExp(V))return V.test(C)}}function formatHeader($){return $.trim().toLowerCase().replace(/([a-z\d])(\w*)/g,(C,T,V)=>T.toUpperCase()+V)}function buildAccessors($,C){const T=utils.toCamelCase(" "+C);["get","set","has"].forEach(V=>{Object.defineProperty($,V+T,{value:function(K,Y,J){return this[V].call(this,C,K,Y,J)},configurable:!0})})}class AxiosHeaders{constructor(C){C&&this.set(C)}set(C,T,V){const K=this;function Y(ee,te,ie){const re=normalizeHeader(te);if(!re)throw new Error("header name must be a non-empty string");const se=utils.findKey(K,re);(!se||K[se]===void 0||ie===!0||ie===void 0&&K[se]!==!1)&&(K[se||te]=normalizeValue(ee))}const J=(ee,te)=>utils.forEach(ee,(ie,re)=>Y(ie,re,te));return utils.isPlainObject(C)||C instanceof this.constructor?J(C,T):utils.isString(C)&&(C=C.trim())&&!isValidHeaderName(C)?J(parseHeaders(C),T):C!=null&&Y(T,C,V),this}get(C,T){if(C=normalizeHeader(C),C){const V=utils.findKey(this,C);if(V){const K=this[V];if(!T)return K;if(T===!0)return parseTokens(K);if(utils.isFunction(T))return T.call(this,K,V);if(utils.isRegExp(T))return T.exec(K);throw new TypeError("parser must be boolean|regexp|function")}}}has(C,T){if(C=normalizeHeader(C),C){const V=utils.findKey(this,C);return!!(V&&this[V]!==void 0&&(!T||matchHeaderValue(this,this[V],V,T)))}return!1}delete(C,T){const V=this;let K=!1;function Y(J){if(J=normalizeHeader(J),J){const ee=utils.findKey(V,J);ee&&(!T||matchHeaderValue(V,V[ee],ee,T))&&(delete V[ee],K=!0)}}return utils.isArray(C)?C.forEach(Y):Y(C),K}clear(C){const T=Object.keys(this);let V=T.length,K=!1;for(;V--;){const Y=T[V];(!C||matchHeaderValue(this,this[Y],Y,C,!0))&&(delete this[Y],K=!0)}return K}normalize(C){const T=this,V={};return utils.forEach(this,(K,Y)=>{const J=utils.findKey(V,Y);if(J){T[J]=normalizeValue(K),delete T[Y];return}const ee=C?formatHeader(Y):String(Y).trim();ee!==Y&&delete T[Y],T[ee]=normalizeValue(K),V[ee]=!0}),this}concat(...C){return this.constructor.concat(this,...C)}toJSON(C){const T=Object.create(null);return utils.forEach(this,(V,K)=>{V!=null&&V!==!1&&(T[K]=C&&utils.isArray(V)?V.join(", "):V)}),T}[Symbol.iterator](){return Object.entries(this.toJSON())[Symbol.iterator]()}toString(){return Object.entries(this.toJSON()).map(([C,T])=>C+": "+T).join(`
`)}get[Symbol.toStringTag](){return"AxiosHeaders"}static from(C){return C instanceof this?C:new this(C)}static concat(C,...T){const V=new this(C);return T.forEach(K=>V.set(K)),V}static accessor(C){const V=(this[$internals]=this[$internals]={accessors:{}}).accessors,K=this.prototype;function Y(J){const ee=normalizeHeader(J);V[ee]||(buildAccessors(K,J),V[ee]=!0)}return utils.isArray(C)?C.forEach(Y):Y(C),this}}AxiosHeaders.accessor(["Content-Type","Content-Length","Accept","Accept-Encoding","User-Agent","Authorization"]);utils.freezeMethods(AxiosHeaders.prototype);utils.freezeMethods(AxiosHeaders);const AxiosHeaders$1=AxiosHeaders;function transformData($,C){const T=this||defaults$1,V=C||T,K=AxiosHeaders$1.from(V.headers);let Y=V.data;return utils.forEach($,function(ee){Y=ee.call(T,Y,K.normalize(),C?C.status:void 0)}),K.normalize(),Y}function isCancel($){return!!($&&$.__CANCEL__)}function CanceledError($,C,T){AxiosError.call(this,$??"canceled",AxiosError.ERR_CANCELED,C,T),this.name="CanceledError"}utils.inherits(CanceledError,AxiosError,{__CANCEL__:!0});function settle($,C,T){const V=T.config.validateStatus;!T.status||!V||V(T.status)?$(T):C(new AxiosError("Request failed with status code "+T.status,[AxiosError.ERR_BAD_REQUEST,AxiosError.ERR_BAD_RESPONSE][Math.floor(T.status/100)-4],T.config,T.request,T))}const cookies=platform.isStandardBrowserEnv?function(){return{write:function(T,V,K,Y,J,ee){const te=[];te.push(T+"="+encodeURIComponent(V)),utils.isNumber(K)&&te.push("expires="+new Date(K).toGMTString()),utils.isString(Y)&&te.push("path="+Y),utils.isString(J)&&te.push("domain="+J),ee===!0&&te.push("secure"),document.cookie=te.join("; ")},read:function(T){const V=document.cookie.match(new RegExp("(^|;\\s*)("+T+")=([^;]*)"));return V?decodeURIComponent(V[3]):null},remove:function(T){this.write(T,"",Date.now()-864e5)}}}():function(){return{write:function(){},read:function(){return null},remove:function(){}}}();function isAbsoluteURL($){return/^([a-z][a-z\d+\-.]*:)?\/\//i.test($)}function combineURLs($,C){return C?$.replace(/\/+$/,"")+"/"+C.replace(/^\/+/,""):$}function buildFullPath($,C){return $&&!isAbsoluteURL(C)?combineURLs($,C):C}const isURLSameOrigin=platform.isStandardBrowserEnv?function(){const C=/(msie|trident)/i.test(navigator.userAgent),T=document.createElement("a");let V;function K(Y){let J=Y;return C&&(T.setAttribute("href",J),J=T.href),T.setAttribute("href",J),{href:T.href,protocol:T.protocol?T.protocol.replace(/:$/,""):"",host:T.host,search:T.search?T.search.replace(/^\?/,""):"",hash:T.hash?T.hash.replace(/^#/,""):"",hostname:T.hostname,port:T.port,pathname:T.pathname.charAt(0)==="/"?T.pathname:"/"+T.pathname}}return V=K(window.location.href),function(J){const ee=utils.isString(J)?K(J):J;return ee.protocol===V.protocol&&ee.host===V.host}}():function(){return function(){return!0}}();function parseProtocol($){const C=/^([-+\w]{1,25})(:?\/\/|:)/.exec($);return C&&C[1]||""}function speedometer($,C){$=$||10;const T=new Array($),V=new Array($);let K=0,Y=0,J;return C=C!==void 0?C:1e3,function(te){const ie=Date.now(),re=V[Y];J||(J=ie),T[K]=te,V[K]=ie;let se=Y,oe=0;for(;se!==K;)oe+=T[se++],se=se%$;if(K=(K+1)%$,K===Y&&(Y=(Y+1)%$),ie-J<C)return;const ae=re&&ie-re;return ae?Math.round(oe*1e3/ae):void 0}}function progressEventReducer($,C){let T=0;const V=speedometer(50,250);return K=>{const Y=K.loaded,J=K.lengthComputable?K.total:void 0,ee=Y-T,te=V(ee),ie=Y<=J;T=Y;const re={loaded:Y,total:J,progress:J?Y/J:void 0,bytes:ee,rate:te||void 0,estimated:te&&J&&ie?(J-Y)/te:void 0,event:K};re[C?"download":"upload"]=!0,$(re)}}const isXHRAdapterSupported=typeof XMLHttpRequest<"u",xhrAdapter=isXHRAdapterSupported&&function($){return new Promise(function(T,V){let K=$.data;const Y=AxiosHeaders$1.from($.headers).normalize(),J=$.responseType;let ee;function te(){$.cancelToken&&$.cancelToken.unsubscribe(ee),$.signal&&$.signal.removeEventListener("abort",ee)}utils.isFormData(K)&&(platform.isStandardBrowserEnv||platform.isStandardBrowserWebWorkerEnv)&&Y.setContentType(!1);let ie=new XMLHttpRequest;if($.auth){const ae=$.auth.username||"",ne=$.auth.password?unescape(encodeURIComponent($.auth.password)):"";Y.set("Authorization","Basic "+btoa(ae+":"+ne))}const re=buildFullPath($.baseURL,$.url);ie.open($.method.toUpperCase(),buildURL(re,$.params,$.paramsSerializer),!0),ie.timeout=$.timeout;function se(){if(!ie)return;const ae=AxiosHeaders$1.from("getAllResponseHeaders"in ie&&ie.getAllResponseHeaders()),le={data:!J||J==="text"||J==="json"?ie.responseText:ie.response,status:ie.status,statusText:ie.statusText,headers:ae,config:$,request:ie};settle(function(de){T(de),te()},function(de){V(de),te()},le),ie=null}if("onloadend"in ie?ie.onloadend=se:ie.onreadystatechange=function(){!ie||ie.readyState!==4||ie.status===0&&!(ie.responseURL&&ie.responseURL.indexOf("file:")===0)||setTimeout(se)},ie.onabort=function(){ie&&(V(new AxiosError("Request aborted",AxiosError.ECONNABORTED,$,ie)),ie=null)},ie.onerror=function(){V(new AxiosError("Network Error",AxiosError.ERR_NETWORK,$,ie)),ie=null},ie.ontimeout=function(){let ne=$.timeout?"timeout of "+$.timeout+"ms exceeded":"timeout exceeded";const le=$.transitional||transitionalDefaults;$.timeoutErrorMessage&&(ne=$.timeoutErrorMessage),V(new AxiosError(ne,le.clarifyTimeoutError?AxiosError.ETIMEDOUT:AxiosError.ECONNABORTED,$,ie)),ie=null},platform.isStandardBrowserEnv){const ae=($.withCredentials||isURLSameOrigin(re))&&$.xsrfCookieName&&cookies.read($.xsrfCookieName);ae&&Y.set($.xsrfHeaderName,ae)}K===void 0&&Y.setContentType(null),"setRequestHeader"in ie&&utils.forEach(Y.toJSON(),function(ne,le){ie.setRequestHeader(le,ne)}),utils.isUndefined($.withCredentials)||(ie.withCredentials=!!$.withCredentials),J&&J!=="json"&&(ie.responseType=$.responseType),typeof $.onDownloadProgress=="function"&&ie.addEventListener("progress",progressEventReducer($.onDownloadProgress,!0)),typeof $.onUploadProgress=="function"&&ie.upload&&ie.upload.addEventListener("progress",progressEventReducer($.onUploadProgress)),($.cancelToken||$.signal)&&(ee=ae=>{ie&&(V(!ae||ae.type?new CanceledError(null,$,ie):ae),ie.abort(),ie=null)},$.cancelToken&&$.cancelToken.subscribe(ee),$.signal&&($.signal.aborted?ee():$.signal.addEventListener("abort",ee)));const oe=parseProtocol(re);if(oe&&platform.protocols.indexOf(oe)===-1){V(new AxiosError("Unsupported protocol "+oe+":",AxiosError.ERR_BAD_REQUEST,$));return}ie.send(K||null)})},knownAdapters={http:httpAdapter,xhr:xhrAdapter};utils.forEach(knownAdapters,($,C)=>{if($){try{Object.defineProperty($,"name",{value:C})}catch{}Object.defineProperty($,"adapterName",{value:C})}});const adapters={getAdapter:$=>{$=utils.isArray($)?$:[$];const{length:C}=$;let T,V;for(let K=0;K<C&&(T=$[K],!(V=utils.isString(T)?knownAdapters[T.toLowerCase()]:T));K++);if(!V)throw V===!1?new AxiosError(`Adapter ${T} is not supported by the environment`,"ERR_NOT_SUPPORT"):new Error(utils.hasOwnProp(knownAdapters,T)?`Adapter '${T}' is not available in the build`:`Unknown adapter '${T}'`);if(!utils.isFunction(V))throw new TypeError("adapter is not a function");return V},adapters:knownAdapters};function throwIfCancellationRequested($){if($.cancelToken&&$.cancelToken.throwIfRequested(),$.signal&&$.signal.aborted)throw new CanceledError(null,$)}function dispatchRequest($){return throwIfCancellationRequested($),$.headers=AxiosHeaders$1.from($.headers),$.data=transformData.call($,$.transformRequest),["post","put","patch"].indexOf($.method)!==-1&&$.headers.setContentType("application/x-www-form-urlencoded",!1),adapters.getAdapter($.adapter||defaults$1.adapter)($).then(function(V){return throwIfCancellationRequested($),V.data=transformData.call($,$.transformResponse,V),V.headers=AxiosHeaders$1.from(V.headers),V},function(V){return isCancel(V)||(throwIfCancellationRequested($),V&&V.response&&(V.response.data=transformData.call($,$.transformResponse,V.response),V.response.headers=AxiosHeaders$1.from(V.response.headers))),Promise.reject(V)})}const headersToObject=$=>$ instanceof AxiosHeaders$1?$.toJSON():$;function mergeConfig($,C){C=C||{};const T={};function V(ie,re,se){return utils.isPlainObject(ie)&&utils.isPlainObject(re)?utils.merge.call({caseless:se},ie,re):utils.isPlainObject(re)?utils.merge({},re):utils.isArray(re)?re.slice():re}function K(ie,re,se){if(utils.isUndefined(re)){if(!utils.isUndefined(ie))return V(void 0,ie,se)}else return V(ie,re,se)}function Y(ie,re){if(!utils.isUndefined(re))return V(void 0,re)}function J(ie,re){if(utils.isUndefined(re)){if(!utils.isUndefined(ie))return V(void 0,ie)}else return V(void 0,re)}function ee(ie,re,se){if(se in C)return V(ie,re);if(se in $)return V(void 0,ie)}const te={url:Y,method:Y,data:Y,baseURL:J,transformRequest:J,transformResponse:J,paramsSerializer:J,timeout:J,timeoutMessage:J,withCredentials:J,adapter:J,responseType:J,xsrfCookieName:J,xsrfHeaderName:J,onUploadProgress:J,onDownloadProgress:J,decompress:J,maxContentLength:J,maxBodyLength:J,beforeRedirect:J,transport:J,httpAgent:J,httpsAgent:J,cancelToken:J,socketPath:J,responseEncoding:J,validateStatus:ee,headers:(ie,re)=>K(headersToObject(ie),headersToObject(re),!0)};return utils.forEach(Object.keys($).concat(Object.keys(C)),function(re){const se=te[re]||K,oe=se($[re],C[re],re);utils.isUndefined(oe)&&se!==ee||(T[re]=oe)}),T}const VERSION="1.3.4",validators$1={};["object","boolean","number","function","string","symbol"].forEach(($,C)=>{validators$1[$]=function(V){return typeof V===$||"a"+(C<1?"n ":" ")+$}});const deprecatedWarnings={};validators$1.transitional=function(C,T,V){function K(Y,J){return"[Axios v"+VERSION+"] Transitional option '"+Y+"'"+J+(V?". "+V:"")}return(Y,J,ee)=>{if(C===!1)throw new AxiosError(K(J," has been removed"+(T?" in "+T:"")),AxiosError.ERR_DEPRECATED);return T&&!deprecatedWarnings[J]&&(deprecatedWarnings[J]=!0,console.warn(K(J," has been deprecated since v"+T+" and will be removed in the near future"))),C?C(Y,J,ee):!0}};function assertOptions($,C,T){if(typeof $!="object")throw new AxiosError("options must be an object",AxiosError.ERR_BAD_OPTION_VALUE);const V=Object.keys($);let K=V.length;for(;K-- >0;){const Y=V[K],J=C[Y];if(J){const ee=$[Y],te=ee===void 0||J(ee,Y,$);if(te!==!0)throw new AxiosError("option "+Y+" must be "+te,AxiosError.ERR_BAD_OPTION_VALUE);continue}if(T!==!0)throw new AxiosError("Unknown option "+Y,AxiosError.ERR_BAD_OPTION)}}const validator={assertOptions,validators:validators$1},validators=validator.validators;class Axios{constructor(C){this.defaults=C,this.interceptors={request:new InterceptorManager$1,response:new InterceptorManager$1}}request(C,T){typeof C=="string"?(T=T||{},T.url=C):T=C||{},T=mergeConfig(this.defaults,T);const{transitional:V,paramsSerializer:K,headers:Y}=T;V!==void 0&&validator.assertOptions(V,{silentJSONParsing:validators.transitional(validators.boolean),forcedJSONParsing:validators.transitional(validators.boolean),clarifyTimeoutError:validators.transitional(validators.boolean)},!1),K!==void 0&&validator.assertOptions(K,{encode:validators.function,serialize:validators.function},!0),T.method=(T.method||this.defaults.method||"get").toLowerCase();let J;J=Y&&utils.merge(Y.common,Y[T.method]),J&&utils.forEach(["delete","get","head","post","put","patch","common"],ne=>{delete Y[ne]}),T.headers=AxiosHeaders$1.concat(J,Y);const ee=[];let te=!0;this.interceptors.request.forEach(function(le){typeof le.runWhen=="function"&&le.runWhen(T)===!1||(te=te&&le.synchronous,ee.unshift(le.fulfilled,le.rejected))});const ie=[];this.interceptors.response.forEach(function(le){ie.push(le.fulfilled,le.rejected)});let re,se=0,oe;if(!te){const ne=[dispatchRequest.bind(this),void 0];for(ne.unshift.apply(ne,ee),ne.push.apply(ne,ie),oe=ne.length,re=Promise.resolve(T);se<oe;)re=re.then(ne[se++],ne[se++]);return re}oe=ee.length;let ae=T;for(se=0;se<oe;){const ne=ee[se++],le=ee[se++];try{ae=ne(ae)}catch(ce){le.call(this,ce);break}}try{re=dispatchRequest.call(this,ae)}catch(ne){return Promise.reject(ne)}for(se=0,oe=ie.length;se<oe;)re=re.then(ie[se++],ie[se++]);return re}getUri(C){C=mergeConfig(this.defaults,C);const T=buildFullPath(C.baseURL,C.url);return buildURL(T,C.params,C.paramsSerializer)}}utils.forEach(["delete","get","head","options"],function(C){Axios.prototype[C]=function(T,V){return this.request(mergeConfig(V||{},{method:C,url:T,data:(V||{}).data}))}});utils.forEach(["post","put","patch"],function(C){function T(V){return function(Y,J,ee){return this.request(mergeConfig(ee||{},{method:C,headers:V?{"Content-Type":"multipart/form-data"}:{},url:Y,data:J}))}}Axios.prototype[C]=T(),Axios.prototype[C+"Form"]=T(!0)});const Axios$1=Axios;class CancelToken{constructor(C){if(typeof C!="function")throw new TypeError("executor must be a function.");let T;this.promise=new Promise(function(Y){T=Y});const V=this;this.promise.then(K=>{if(!V._listeners)return;let Y=V._listeners.length;for(;Y-- >0;)V._listeners[Y](K);V._listeners=null}),this.promise.then=K=>{let Y;const J=new Promise(ee=>{V.subscribe(ee),Y=ee}).then(K);return J.cancel=function(){V.unsubscribe(Y)},J},C(function(Y,J,ee){V.reason||(V.reason=new CanceledError(Y,J,ee),T(V.reason))})}throwIfRequested(){if(this.reason)throw this.reason}subscribe(C){if(this.reason){C(this.reason);return}this._listeners?this._listeners.push(C):this._listeners=[C]}unsubscribe(C){if(!this._listeners)return;const T=this._listeners.indexOf(C);T!==-1&&this._listeners.splice(T,1)}static source(){let C;return{token:new CancelToken(function(K){C=K}),cancel:C}}}const CancelToken$1=CancelToken;function spread($){return function(T){return $.apply(null,T)}}function isAxiosError($){return utils.isObject($)&&$.isAxiosError===!0}const HttpStatusCode={Continue:100,SwitchingProtocols:101,Processing:102,EarlyHints:103,Ok:200,Created:201,Accepted:202,NonAuthoritativeInformation:203,NoContent:204,ResetContent:205,PartialContent:206,MultiStatus:207,AlreadyReported:208,ImUsed:226,MultipleChoices:300,MovedPermanently:301,Found:302,SeeOther:303,NotModified:304,UseProxy:305,Unused:306,TemporaryRedirect:307,PermanentRedirect:308,BadRequest:400,Unauthorized:401,PaymentRequired:402,Forbidden:403,NotFound:404,MethodNotAllowed:405,NotAcceptable:406,ProxyAuthenticationRequired:407,RequestTimeout:408,Conflict:409,Gone:410,LengthRequired:411,PreconditionFailed:412,PayloadTooLarge:413,UriTooLong:414,UnsupportedMediaType:415,RangeNotSatisfiable:416,ExpectationFailed:417,ImATeapot:418,MisdirectedRequest:421,UnprocessableEntity:422,Locked:423,FailedDependency:424,TooEarly:425,UpgradeRequired:426,PreconditionRequired:428,TooManyRequests:429,RequestHeaderFieldsTooLarge:431,UnavailableForLegalReasons:451,InternalServerError:500,NotImplemented:501,BadGateway:502,ServiceUnavailable:503,GatewayTimeout:504,HttpVersionNotSupported:505,VariantAlsoNegotiates:506,InsufficientStorage:507,LoopDetected:508,NotExtended:510,NetworkAuthenticationRequired:511};Object.entries(HttpStatusCode).forEach(([$,C])=>{HttpStatusCode[C]=$});const HttpStatusCode$1=HttpStatusCode;function createInstance($){const C=new Axios$1($),T=bind(Axios$1.prototype.request,C);return utils.extend(T,Axios$1.prototype,C,{allOwnKeys:!0}),utils.extend(T,C,null,{allOwnKeys:!0}),T.create=function(K){return createInstance(mergeConfig($,K))},T}const axios=createInstance(defaults$1);axios.Axios=Axios$1;axios.CanceledError=CanceledError;axios.CancelToken=CancelToken$1;axios.isCancel=isCancel;axios.VERSION=VERSION;axios.toFormData=toFormData;axios.AxiosError=AxiosError;axios.Cancel=axios.CanceledError;axios.all=function(C){return Promise.all(C)};axios.spread=spread;axios.isAxiosError=isAxiosError;axios.mergeConfig=mergeConfig;axios.AxiosHeaders=AxiosHeaders$1;axios.formToJSON=$=>formDataToJSON(utils.isHTMLForm($)?new FormData($):$);axios.HttpStatusCode=HttpStatusCode$1;axios.default=axios;const axios$1=axios,initialState={loading:!1,error:!1,ui:void 0,journeyTypes:void 0,journeyType:void 0,journeyId:void 0,journey:void 0,stepId:void 0,step:void 0,completed:!1,items:void 0,matches:void 0},{actions:authActions,reducer:authReducer}=createSlice({name:"tiposJourney",initialState,reducers:{reset:$=>(console.log("resetting",$),initialState),setLoading:$=>{$.loading=!0},setJourneyTypes:($,{payload:C})=>{$.loading=!1,$.error=!1,$.journeyTypes=C},setError:$=>{$.error=!0},setJourneyType:($,{payload:C})=>{$.journeyType=C,$.loading=!1,$.error=!1,$.journeyId=void 0,$.journey=void 0,$.stepId=void 0,$.step=void 0,$.completed=!1,$.items=void 0,$.matches=void 0},setJourneyId:($,{payload:C})=>{$.journeyId=C},setJourney:($,{payload:C})=>{$.journey=C,$.journey.currentStepId?$.stepId=$.journey.currentStepId:$.completed=!0},setStep:($,{payload:C})=>{const T=C;$.step=T},completeStep:$=>{$.step=void 0,$.stepId=void 0,$.journey=void 0},setUi:($,{payload:C})=>{$.ui=C},setCount:($,{payload:C})=>{$.matches=C},setRows:($,{payload:C})=>{$.items=C}}}),{reset,setLoading,setJourneyTypes,setError,setJourneyType,setJourneyId,setJourney,setStep,completeStep,setUi,setCount,setRows}=authActions,store=configureStore({reducer:{tiposJourney:authReducer}}),api=axios$1.create({baseURL:window.__MATEU_REMOTE_BASE_URL__?window.__MATEU_REMOTE_BASE_URL__:"https://remote.mateu.io/mateu/v1",withCredentials:!1,headers:{Accept:"application/json","Content-Type":"application/json"}});function fetchItems(){return async $=>{api.get("/journey-types").then(C=>{$(setJourneyTypes(C.data))}).catch(C=>{console.log(C),$(setError())})}}function createJourney($,C){const T={journeyTypeId:$,contextData:[]};return async V=>{api.post("/journeys/"+C,T).then(()=>{V(setJourneyId(C))}).catch(K=>{console.log(K),V(setError())})}}function getJourneyStatus($){return async C=>{api.get("/journeys/"+$).then(T=>{C(setJourney(T.data))}).catch(T=>{console.log(T),C(setError())})}}function getStep($,C){return async T=>{api.get("/journeys/"+$+"/steps/"+C).then(V=>{T(setStep(V.data))}).catch(V=>{console.log(V),T(setError())})}}function runStepAction($,C,T,V){const K={data:V};return async Y=>{api.post("/journeys/"+$+"/steps/"+C+"/"+T,K).then(J=>{Y(completeStep(J.data))}).catch(J=>{console.log(J),Y(setError())})}}function getUi($){return async C=>{api.get("/uis/"+$).then(T=>{C(setUi(T.data))}).catch(T=>{console.log(T),C(setError())})}}const verticalLayout=i$2`
  :host([theme~='margin']) {
    margin: var(--lumo-space-m);
  }

  :host([theme~='padding']) {
    padding: var(--lumo-space-m);
  }

  :host([theme~='spacing-xs']) {
    gap: var(--lumo-space-xs);
  }

  :host([theme~='spacing-s']) {
    gap: var(--lumo-space-s);
  }

  :host([theme~='spacing']) {
    gap: var(--lumo-space-m);
  }

  :host([theme~='spacing-l']) {
    gap: var(--lumo-space-l);
  }

  :host([theme~='spacing-xl']) {
    gap: var(--lumo-space-xl);
  }
`;registerStyles("vaadin-vertical-layout",verticalLayout,{moduleId:"lumo-vertical-layout"});/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class VerticalLayout extends ElementMixin(ThemableMixin(PolymerElement)){static get template(){return html`
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          box-sizing: border-box;
        }

        :host([hidden]) {
          display: none !important;
        }

        /* Theme variations */
        :host([theme~='margin']) {
          margin: 1em;
        }

        :host([theme~='padding']) {
          padding: 1em;
        }

        :host([theme~='spacing']) {
          gap: 1em;
        }
      </style>

      <slot></slot>
    `}static get is(){return"vaadin-vertical-layout"}}customElements.define(VerticalLayout.is,VerticalLayout);registerStyles("vaadin-app-layout",i$2`
    [part='navbar']::before {
      background: var(--lumo-base-color) linear-gradient(var(--lumo-contrast-5pct), var(--lumo-contrast-5pct));
    }

    :host(:not([dir='rtl']):not([overlay])) [part='drawer'] {
      border-right: 1px solid var(--lumo-contrast-10pct);
    }

    :host([dir='rtl']:not([overlay])) [part='drawer'] {
      border-left: 1px solid var(--lumo-contrast-10pct);
    }

    :host([overlay]) [part='drawer']::before {
      background: var(--lumo-base-color);
    }

    [part='navbar']::before,
    :host([overlay]) [part='drawer']::before {
      position: absolute;
      content: '';
      width: 100%;
      height: 100%;
      z-index: -1;
    }

    :host([overlay]) [part='drawer']::before {
      background: var(--lumo-base-color);
      height: var(--_vaadin-app-layout-drawer-scroll-size, 100%);
    }

    [part='backdrop'] {
      background-color: var(--lumo-shade-20pct);
      opacity: 1;
    }

    [part] ::slotted(h2),
    [part] ::slotted(h3),
    [part] ::slotted(h4) {
      margin-top: var(--lumo-space-xs) !important;
      margin-bottom: var(--lumo-space-xs) !important;
    }

    @supports (-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px)) {
      [part='navbar']::before {
        opacity: 0.8;
      }

      [part='navbar'] {
        -webkit-backdrop-filter: blur(24px);
        backdrop-filter: blur(24px);
      }

      :host([overlay]) [part='drawer']::before {
        opacity: 0.9;
      }

      :host([overlay]) [part='drawer'] {
        -webkit-backdrop-filter: blur(24px);
        backdrop-filter: blur(24px);
      }
    }
  `,{moduleId:"lumo-app-layout"});const template$8=document.createElement("template");template$8.innerHTML=`
  <style>
    /* Use units so that the values can be used in calc() */
    html {
      --safe-area-inset-top: env(safe-area-inset-top, 0px);
      --safe-area-inset-right: env(safe-area-inset-right, 0px);
      --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
      --safe-area-inset-left: env(safe-area-inset-left, 0px);
    }
  </style>
`;document.head.appendChild(template$8.content);/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const testUserAgent=$=>$.test(navigator.userAgent),testPlatform=$=>$.test(navigator.platform),testVendor=$=>$.test(navigator.vendor),isAndroid=testUserAgent(/Android/),isChrome=testUserAgent(/Chrome/)&&testVendor(/Google Inc/),isFirefox=testUserAgent(/Firefox/),isIPad=testPlatform(/^iPad/)||testPlatform(/^Mac/)&&navigator.maxTouchPoints>1,isIPhone=testPlatform(/^iPhone/),isIOS=isIPhone||isIPad,isSafari=testUserAgent(/^((?!chrome|android).)*safari/i),isTouch=(()=>{try{return document.createEvent("TouchEvent"),!0}catch{return!1}})();/**
 * @license
 * Copyright (c) 2018 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */function _detectIosNavbar(){if(isIOS){const $=window.innerHeight,T=window.innerWidth>$,V=document.documentElement.clientHeight;T&&V>$?document.documentElement.style.setProperty("--vaadin-viewport-offset-bottom",`${V-$}px`):document.documentElement.style.setProperty("--vaadin-viewport-offset-bottom","")}}_detectIosNavbar();window.addEventListener("resize",_detectIosNavbar);/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/let scheduled=!1,beforeRenderQueue=[],afterRenderQueue=[];function schedule(){scheduled=!0,requestAnimationFrame(function(){scheduled=!1,flushQueue(beforeRenderQueue),setTimeout(function(){runQueue(afterRenderQueue)})})}function flushQueue($){for(;$.length;)callMethod($.shift())}function runQueue($){for(let C=0,T=$.length;C<T;C++)callMethod($.shift())}function callMethod($){const C=$[0],T=$[1],V=$[2];try{T.apply(C,V)}catch(K){setTimeout(()=>{throw K})}}function beforeNextRender($,C,T){scheduled||schedule(),beforeRenderQueue.push([$,C,T])}function afterNextRender($,C,T){scheduled||schedule(),afterRenderQueue.push([$,C,T])}/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */let keyboardActive=!1;window.addEventListener("keydown",()=>{keyboardActive=!0},{capture:!0});window.addEventListener("mousedown",()=>{keyboardActive=!1},{capture:!0});function isKeyboardActive(){return keyboardActive}function isElementHiddenDirectly($){const C=$.style;if(C.visibility==="hidden"||C.display==="none")return!0;const T=window.getComputedStyle($);return T.visibility==="hidden"||T.display==="none"}function normalizeTabIndex($){if(!isElementFocusable($))return-1;const C=$.getAttribute("tabindex")||0;return Number(C)}function hasLowerTabOrder($,C){const T=Math.max($.tabIndex,0),V=Math.max(C.tabIndex,0);return T===0||V===0?V>T:T>V}function mergeSortByTabIndex($,C){const T=[];for(;$.length>0&&C.length>0;)hasLowerTabOrder($[0],C[0])?T.push(C.shift()):T.push($.shift());return T.concat($,C)}function sortElementsByTabIndex($){const C=$.length;if(C<2)return $;const T=Math.ceil(C/2),V=sortElementsByTabIndex($.slice(0,T)),K=sortElementsByTabIndex($.slice(T));return mergeSortByTabIndex(V,K)}function collectFocusableNodes($,C){if($.nodeType!==Node.ELEMENT_NODE||isElementHiddenDirectly($))return!1;const T=$,V=normalizeTabIndex(T);let K=V>0;V>=0&&C.push(T);let Y=[];return T.localName==="slot"?Y=T.assignedNodes({flatten:!0}):Y=(T.shadowRoot||T).children,[...Y].forEach(J=>{K=collectFocusableNodes(J,C)||K}),K}function isElementHidden($){return $.offsetParent===null?!0:isElementHiddenDirectly($)}function isElementFocusable($){return $.matches('[tabindex="-1"]')?!1:$.matches("input, select, textarea, button, object")?$.matches(":not([disabled])"):$.matches("a[href], area[href], iframe, [tabindex], [contentEditable]")}function isElementFocused($){return $.getRootNode().activeElement===$}function getFocusableElements($){const C=[];return collectFocusableNodes($,C)?sortElementsByTabIndex(C):C}/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const instances=[];class FocusTrapController{constructor(C){this.host=C,this.__trapNode=null,this.__onKeyDown=this.__onKeyDown.bind(this)}hostConnected(){document.addEventListener("keydown",this.__onKeyDown)}hostDisconnected(){document.removeEventListener("keydown",this.__onKeyDown)}trapFocus(C){if(this.__trapNode=C,this.__focusableElements.length===0)throw this.__trapNode=null,new Error("The trap node should have at least one focusable descendant or be focusable itself.");instances.push(this),this.__focusedElementIndex===-1&&this.__focusableElements[0].focus()}releaseFocus(){this.__trapNode=null,instances.pop()}__onKeyDown(C){if(this.__trapNode&&this===Array.from(instances).pop()&&C.key==="Tab"){C.preventDefault();const T=C.shiftKey;this.__focusNextElement(T)}}__focusNextElement(C=!1){const T=this.__focusableElements,V=C?-1:1,K=this.__focusedElementIndex,Y=(T.length+K+V)%T.length,J=T[Y];J.focus(),J.localName==="input"&&J.select()}get __focusableElements(){return getFocusableElements(this.__trapNode)}get __focusedElementIndex(){const C=this.__focusableElements;return C.indexOf(C.filter(isElementFocused).pop())}}/**
 * @license
 * Copyright (c) 2018 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class AppLayout extends ElementMixin(ThemableMixin(ControllerMixin(PolymerElement))){static get template(){return html`
      <style>
        :host {
          display: block;
          box-sizing: border-box;
          height: 100%;
          --vaadin-app-layout-transition: 200ms;
          transition: padding var(--vaadin-app-layout-transition);
          --vaadin-app-layout-touch-optimized: false;
          --vaadin-app-layout-navbar-offset-top: var(--_vaadin-app-layout-navbar-offset-size);
          --vaadin-app-layout-navbar-offset-bottom: var(--_vaadin-app-layout-navbar-offset-size-bottom);
          padding-top: var(--vaadin-app-layout-navbar-offset-top);
          padding-bottom: var(--vaadin-app-layout-navbar-offset-bottom);
          padding-left: var(--vaadin-app-layout-navbar-offset-left);
        }

        :host([dir='rtl']) {
          padding-left: 0;
          padding-right: var(--vaadin-app-layout-navbar-offset-left);
        }

        :host([hidden]),
        [hidden] {
          display: none !important;
        }

        :host([no-anim]) {
          --vaadin-app-layout-transition: none !important;
        }

        :host([drawer-opened]) {
          --vaadin-app-layout-drawer-offset-left: var(--_vaadin-app-layout-drawer-offset-size);
        }

        :host([overlay]) {
          --vaadin-app-layout-drawer-offset-left: 0;
          --vaadin-app-layout-navbar-offset-left: 0;
        }

        :host(:not([no-scroll])) [content] {
          overflow: auto;
        }

        [content] {
          height: 100%;
        }

        @media (pointer: coarse) and (max-width: 800px) and (min-height: 500px) {
          :host {
            --vaadin-app-layout-touch-optimized: true;
          }
        }

        [part='navbar'],
        [part='navbar']::before {
          position: fixed;
          display: flex;
          align-items: center;
          top: 0;
          right: 0;
          left: 0;
          transition: left var(--vaadin-app-layout-transition);
          padding-top: var(--safe-area-inset-top);
          padding-left: var(--safe-area-inset-left);
          padding-right: var(--safe-area-inset-right);
          z-index: 1;
        }

        :host(:not([dir='rtl'])[primary-section='drawer'][drawer-opened]:not([overlay])) [part='navbar'] {
          left: var(--vaadin-app-layout-drawer-offset-left, 0);
        }

        :host([dir='rtl'][primary-section='drawer'][drawer-opened]:not([overlay])) [part='navbar'] {
          right: var(--vaadin-app-layout-drawer-offset-left, 0);
        }

        :host([primary-section='drawer']) [part='drawer'] {
          top: 0;
        }

        [part='navbar'][bottom] {
          top: auto;
          bottom: 0;
          padding-bottom: var(--safe-area-inset-bottom);
        }

        [part='drawer'] {
          overflow: auto;
          position: fixed;
          top: var(--vaadin-app-layout-navbar-offset-top, 0);
          right: auto;
          bottom: var(--vaadin-app-layout-navbar-offset-bottom, var(--vaadin-viewport-offset-bottom, 0));
          left: var(--vaadin-app-layout-navbar-offset-left, 0);
          transition: transform var(--vaadin-app-layout-transition), visibility var(--vaadin-app-layout-transition);
          transform: translateX(-100%);
          max-width: 90%;
          width: 16em;
          box-sizing: border-box;
          padding: var(--safe-area-inset-top) 0 var(--safe-area-inset-bottom) var(--safe-area-inset-left);
          outline: none;
          /* The drawer should be inaccessible by the tabbing navigation when it is closed. */
          visibility: hidden;
        }

        :host([drawer-opened]) [part='drawer'] {
          /* The drawer should be accessible by the tabbing navigation when it is opened. */
          visibility: visible;
          transform: translateX(0%);
          touch-action: manipulation;
        }

        [part='backdrop'] {
          background-color: #000;
          opacity: 0.3;
        }

        :host(:not([drawer-opened])) [part='backdrop'] {
          opacity: 0;
        }

        :host([overlay]) [part='backdrop'] {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          pointer-events: none;
          transition: opacity var(--vaadin-app-layout-transition);
          -webkit-tap-highlight-color: transparent;
        }

        :host([overlay]) [part='drawer'] {
          top: 0;
          bottom: 0;
        }

        :host([overlay]) [part='drawer'],
        :host([overlay]) [part='backdrop'] {
          z-index: 2;
        }

        :host([drawer-opened][overlay]) [part='backdrop'] {
          pointer-events: auto;
          touch-action: manipulation;
        }

        :host([dir='rtl']) [part='drawer'] {
          left: auto;
          right: var(--vaadin-app-layout-navbar-offset-start, 0);
          transform: translateX(100%);
        }

        :host([dir='rtl']) [part='navbar'],
        :host([dir='rtl']) [part='navbar']::before {
          transition: right var(--vaadin-app-layout-transition);
        }

        :host([dir='rtl'][drawer-opened]) [part='drawer'] {
          transform: translateX(0%);
        }

        :host(:not([dir='rtl'])[drawer-opened]:not([overlay])) {
          padding-left: var(--vaadin-app-layout-drawer-offset-left);
        }

        :host([dir='rtl'][drawer-opened]:not([overlay])) {
          padding-right: var(--vaadin-app-layout-drawer-offset-left);
        }

        @media (max-width: 800px), (max-height: 600px) {
          :host {
            --vaadin-app-layout-drawer-overlay: true;
          }

          [part='drawer'] {
            width: 20em;
          }
        }
      </style>
      <div part="navbar" id="navbarTop">
        <slot name="navbar"></slot>
      </div>
      <div part="backdrop" on-click="_onBackdropClick" on-touchend="_onBackdropTouchend"></div>
      <div part="drawer" id="drawer" on-keydown="__onDrawerKeyDown">
        <slot name="drawer" id="drawerSlot"></slot>
      </div>
      <div content>
        <slot></slot>
      </div>
      <div part="navbar" id="navbarBottom" bottom hidden>
        <slot name="navbar-bottom"></slot>
      </div>
      <div hidden><slot id="touchSlot" name="navbar touch-optimized"></slot></div>
    `}static get is(){return"vaadin-app-layout"}static get properties(){return{i18n:{type:Object,observer:"__i18nChanged",value:()=>({drawer:"Drawer"})},primarySection:{type:String,value:"navbar",notify:!0,reflectToAttribute:!0,observer:"__primarySectionChanged"},drawerOpened:{type:Boolean,notify:!0,value:!0,reflectToAttribute:!0,observer:"__drawerOpenedChanged"},overlay:{type:Boolean,notify:!0,readOnly:!0,value:!1,reflectToAttribute:!0},closeDrawerOn:{type:String,value:"vaadin-router-location-changed",observer:"_closeDrawerOnChanged"}}}static dispatchCloseOverlayDrawerEvent(){window.dispatchEvent(new CustomEvent("close-overlay-drawer"))}constructor(){super(),this.__boundResizeListener=this._resize.bind(this),this.__drawerToggleClickListener=this._drawerToggleClick.bind(this),this.__closeOverlayDrawerListener=this.__closeOverlayDrawer.bind(this),this.__trapFocusInDrawer=this.__trapFocusInDrawer.bind(this),this.__releaseFocusFromDrawer=this.__releaseFocusFromDrawer.bind(this),this.__focusTrapController=new FocusTrapController(this)}connectedCallback(){super.connectedCallback(),this._blockAnimationUntilAfterNextRender(),window.addEventListener("resize",this.__boundResizeListener),this.addEventListener("drawer-toggle-click",this.__drawerToggleClickListener),beforeNextRender(this,this._afterFirstRender),this._updateTouchOptimizedMode();const C=this.$.navbarTop.firstElementChild;this._navbarChildObserver=new FlattenedNodesObserver(C,()=>{this._updateTouchOptimizedMode()}),this._touchChildObserver=new FlattenedNodesObserver(this.$.touchSlot,()=>{this._updateTouchOptimizedMode()}),this._drawerChildObserver=new FlattenedNodesObserver(this.$.drawerSlot,()=>{this._updateDrawerSize()}),this._updateDrawerSize(),this._updateOverlayMode(),this._navbarSizeObserver=new ResizeObserver(()=>{this._blockAnimationUntilAfterNextRender(),this._updateOffsetSize()}),this._navbarSizeObserver.observe(this.$.navbarTop),this._navbarSizeObserver.observe(this.$.navbarBottom),window.addEventListener("close-overlay-drawer",this.__closeOverlayDrawerListener)}ready(){super.ready(),this.addController(this.__focusTrapController),this.__setAriaExpanded()}disconnectedCallback(){super.disconnectedCallback(),this._navbarChildObserver&&this._navbarChildObserver.disconnect(),this._drawerChildObserver&&this._drawerChildObserver.disconnect(),this._touchChildObserver&&this._touchChildObserver.disconnect(),window.removeEventListener("resize",this.__boundResizeListener),this.removeEventListener("drawer-toggle-click",this.__drawerToggleClickListener),window.removeEventListener("close-overlay-drawer",this.__drawerToggleClickListener)}__primarySectionChanged(C){["navbar","drawer"].includes(C)||this.set("primarySection","navbar")}__drawerOpenedChanged(C,T){this.overlay&&(C?(this._updateDrawerHeight(),this.__trapFocusInDrawer()):T&&this.__releaseFocusFromDrawer()),this.__setAriaExpanded()}__i18nChanged(){this.__updateDrawerAriaAttributes()}_afterFirstRender(){this._blockAnimationUntilAfterNextRender(),this._updateOffsetSize()}_drawerToggleClick(C){C.stopPropagation(),this.drawerOpened=!this.drawerOpened}__closeOverlayDrawer(){this.overlay&&(this.drawerOpened=!1)}__setAriaExpanded(){const C=this.querySelector("vaadin-drawer-toggle");C&&C.setAttribute("aria-expanded",this.drawerOpened)}_updateDrawerSize(){const C=this.querySelectorAll("[slot=drawer]").length,T=this.$.drawer;C===0?T.setAttribute("hidden",""):T.removeAttribute("hidden"),this._updateOffsetSize()}_resize(){this._blockAnimationUntilAfterNextRender(),this._updateTouchOptimizedMode(),this._updateOverlayMode()}_updateOffsetSize(){const T=this.$.navbarTop.getBoundingClientRect(),K=this.$.navbarBottom.getBoundingClientRect();this.style.setProperty("--_vaadin-app-layout-navbar-offset-size",`${T.height}px`),this.style.setProperty("--_vaadin-app-layout-navbar-offset-size-bottom",`${K.height}px`);const J=this.$.drawer.getBoundingClientRect();this.style.setProperty("--_vaadin-app-layout-drawer-offset-size",`${J.width}px`)}_updateDrawerHeight(){const{scrollHeight:C,offsetHeight:T}=this.$.drawer,V=C>T?`${C}px`:"100%";this.style.setProperty("--_vaadin-app-layout-drawer-scroll-size",V)}_updateOverlayMode(){const C=this._getCustomPropertyValue("--vaadin-app-layout-drawer-overlay")==="true";!this.overlay&&C&&(this._drawerStateSaved=this.drawerOpened,this.drawerOpened=!1),this._setOverlay(C),!this.overlay&&this._drawerStateSaved&&(this.drawerOpened=this._drawerStateSaved,this._drawerStateSaved=null),this._updateDrawerHeight(),this.__updateDrawerAriaAttributes()}__updateDrawerAriaAttributes(){const C=this.$.drawer;this.overlay?(C.setAttribute("role","dialog"),C.setAttribute("aria-modal","true"),C.setAttribute("aria-label",this.i18n.drawer)):(C.removeAttribute("role"),C.removeAttribute("aria-modal"),C.removeAttribute("aria-label"))}__drawerTransitionComplete(){return new Promise(C=>{if(this._getCustomPropertyValue("--vaadin-app-layout-transition")==="none"){C();return}this.$.drawer.addEventListener("transitionend",C,{once:!0})})}async __trapFocusInDrawer(){await this.__drawerTransitionComplete(),this.drawerOpened&&(this.$.drawer.setAttribute("tabindex","0"),this.__focusTrapController.trapFocus(this.$.drawer))}async __releaseFocusFromDrawer(){if(await this.__drawerTransitionComplete(),this.drawerOpened)return;this.__focusTrapController.releaseFocus(),this.$.drawer.removeAttribute("tabindex");const C=this.querySelector("vaadin-drawer-toggle");C&&(C.focus(),C.setAttribute("focus-ring","focus"))}__onDrawerKeyDown(C){C.key==="Escape"&&this.overlay&&(this.drawerOpened=!1)}_closeDrawerOnChanged(C,T){T&&window.removeEventListener(T,this.__closeOverlayDrawerListener),C&&window.addEventListener(C,this.__closeOverlayDrawerListener)}_onBackdropClick(){this._close()}_onBackdropTouchend(C){C.preventDefault(),this._close()}_close(){this.drawerOpened=!1}_getCustomPropertyValue(C){return(getComputedStyle(this).getPropertyValue(C)||"").trim().toLowerCase()}_updateTouchOptimizedMode(){const C=this._getCustomPropertyValue("--vaadin-app-layout-touch-optimized")==="true",T=this.querySelectorAll('[slot*="navbar"]');T.length>0&&Array.from(T).forEach(V=>{V.getAttribute("slot").indexOf("touch-optimized")>-1&&(V.__touchOptimized=!0),C&&V.__touchOptimized?V.setAttribute("slot","navbar-bottom"):V.setAttribute("slot","navbar")}),this.$.navbarTop.querySelector("[name=navbar]").assignedNodes().length===0?this.$.navbarTop.setAttribute("hidden",""):this.$.navbarTop.removeAttribute("hidden"),C?this.$.navbarBottom.removeAttribute("hidden"):this.$.navbarBottom.setAttribute("hidden",""),this._updateOffsetSize()}_blockAnimationUntilAfterNextRender(){this.setAttribute("no-anim",""),afterNextRender(this,()=>{this.removeAttribute("no-anim")})}}customElements.define(AppLayout.is,AppLayout);const button=i$2`
  :host {
    /* Sizing */
    --lumo-button-size: var(--lumo-size-m);
    min-width: calc(var(--lumo-button-size) * 2);
    height: var(--lumo-button-size);
    padding: 0 calc(var(--lumo-button-size) / 3 + var(--lumo-border-radius-m) / 2);
    margin: var(--lumo-space-xs) 0;
    box-sizing: border-box;
    /* Style */
    font-family: var(--lumo-font-family);
    font-size: var(--lumo-font-size-m);
    font-weight: 500;
    color: var(--_lumo-button-color, var(--lumo-primary-text-color));
    background-color: var(--_lumo-button-background-color, var(--lumo-contrast-5pct));
    border-radius: var(--lumo-border-radius-m);
    cursor: var(--lumo-clickable-cursor);
    -webkit-tap-highlight-color: transparent;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Set only for the internal parts so we don't affect the host vertical alignment */
  [part='label'],
  [part='prefix'],
  [part='suffix'] {
    line-height: var(--lumo-line-height-xs);
  }

  [part='label'] {
    padding: calc(var(--lumo-button-size) / 6) 0;
  }

  :host([theme~='small']) {
    font-size: var(--lumo-font-size-s);
    --lumo-button-size: var(--lumo-size-s);
  }

  :host([theme~='large']) {
    font-size: var(--lumo-font-size-l);
    --lumo-button-size: var(--lumo-size-l);
  }

  /* For interaction states */
  :host::before,
  :host::after {
    content: '';
    /* We rely on the host always being relative */
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: currentColor;
    border-radius: inherit;
    opacity: 0;
    pointer-events: none;
  }

  /* Hover */

  @media (any-hover: hover) {
    :host(:hover)::before {
      opacity: 0.02;
    }
  }

  /* Active */

  :host::after {
    transition: opacity 1.4s, transform 0.1s;
    filter: blur(8px);
  }

  :host([active])::before {
    opacity: 0.05;
    transition-duration: 0s;
  }

  :host([active])::after {
    opacity: 0.1;
    transition-duration: 0s, 0s;
    transform: scale(0);
  }

  /* Keyboard focus */

  :host([focus-ring]) {
    box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
  }

  :host([theme~='primary'][focus-ring]) {
    box-shadow: 0 0 0 1px var(--lumo-base-color), 0 0 0 3px var(--lumo-primary-color-50pct);
  }

  /* Types (primary, tertiary, tertiary-inline */

  :host([theme~='tertiary']),
  :host([theme~='tertiary-inline']) {
    background-color: transparent !important;
    min-width: 0;
  }

  :host([theme~='tertiary']) {
    padding: 0 calc(var(--lumo-button-size) / 6);
  }

  :host([theme~='tertiary-inline'])::before {
    display: none;
  }

  :host([theme~='tertiary-inline']) {
    margin: 0;
    height: auto;
    padding: 0;
    line-height: inherit;
    font-size: inherit;
  }

  :host([theme~='tertiary-inline']) [part='label'] {
    padding: 0;
    overflow: visible;
    line-height: inherit;
  }

  :host([theme~='primary']) {
    background-color: var(--_lumo-button-primary-background-color, var(--lumo-primary-color));
    color: var(--_lumo-button-primary-color, var(--lumo-primary-contrast-color));
    font-weight: 600;
    min-width: calc(var(--lumo-button-size) * 2.5);
  }

  :host([theme~='primary'])::before {
    background-color: black;
  }

  @media (any-hover: hover) {
    :host([theme~='primary']:hover)::before {
      opacity: 0.05;
    }
  }

  :host([theme~='primary'][active])::before {
    opacity: 0.1;
  }

  :host([theme~='primary'][active])::after {
    opacity: 0.2;
  }

  /* Colors (success, error, contrast) */

  :host([theme~='success']) {
    color: var(--lumo-success-text-color);
  }

  :host([theme~='success'][theme~='primary']) {
    background-color: var(--lumo-success-color);
    color: var(--lumo-success-contrast-color);
  }

  :host([theme~='error']) {
    color: var(--lumo-error-text-color);
  }

  :host([theme~='error'][theme~='primary']) {
    background-color: var(--lumo-error-color);
    color: var(--lumo-error-contrast-color);
  }

  :host([theme~='contrast']) {
    color: var(--lumo-contrast);
  }

  :host([theme~='contrast'][theme~='primary']) {
    background-color: var(--lumo-contrast);
    color: var(--lumo-base-color);
  }

  /* Disabled state. Keep selectors after other color variants. */

  :host([disabled]) {
    pointer-events: none;
    color: var(--lumo-disabled-text-color);
  }

  :host([theme~='primary'][disabled]) {
    background-color: var(--lumo-contrast-30pct);
    color: var(--lumo-base-color);
  }

  :host([theme~='primary'][disabled]) [part] {
    opacity: 0.7;
  }

  /* Icons */

  [part] ::slotted(vaadin-icon),
  [part] ::slotted(iron-icon) {
    display: inline-block;
    width: var(--lumo-icon-size-m);
    height: var(--lumo-icon-size-m);
  }

  /* Vaadin icons are based on a 16x16 grid (unlike Lumo and Material icons with 24x24), so they look too big by default */
  [part] ::slotted(vaadin-icon[icon^='vaadin:']),
  [part] ::slotted(iron-icon[icon^='vaadin:']) {
    padding: 0.25em;
    box-sizing: border-box !important;
  }

  [part='prefix'] {
    margin-left: -0.25em;
    margin-right: 0.25em;
  }

  [part='suffix'] {
    margin-left: 0.25em;
    margin-right: -0.25em;
  }

  /* Icon-only */

  :host([theme~='icon']:not([theme~='tertiary-inline'])) {
    min-width: var(--lumo-button-size);
    padding-left: calc(var(--lumo-button-size) / 4);
    padding-right: calc(var(--lumo-button-size) / 4);
  }

  :host([theme~='icon']) [part='prefix'],
  :host([theme~='icon']) [part='suffix'] {
    margin-left: 0;
    margin-right: 0;
  }

  /* RTL specific styles */

  :host([dir='rtl']) [part='prefix'] {
    margin-left: 0.25em;
    margin-right: -0.25em;
  }

  :host([dir='rtl']) [part='suffix'] {
    margin-left: -0.25em;
    margin-right: 0.25em;
  }

  :host([dir='rtl'][theme~='icon']) [part='prefix'],
  :host([dir='rtl'][theme~='icon']) [part='suffix'] {
    margin-left: 0;
    margin-right: 0;
  }
`;registerStyles("vaadin-button",button,{moduleId:"lumo-button"});const drawerToggle=i$2`
  :host {
    width: var(--lumo-size-l);
    height: var(--lumo-size-l);
    min-width: auto;
    margin: 0 var(--lumo-space-s);
    padding: 0;
    background: transparent;
  }

  [part='icon'],
  [part='icon']::after,
  [part='icon']::before {
    position: inherit;
    height: auto;
    width: auto;
    background: transparent;
    top: auto;
  }

  [part='icon']::before {
    font-family: lumo-icons;
    font-size: var(--lumo-icon-size-m);
    content: var(--lumo-icons-menu);
  }
`;registerStyles("vaadin-drawer-toggle",[button,drawerToggle],{moduleId:"lumo-drawer-toggle"});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const DisabledMixin=dedupingMixin($=>class extends ${static get properties(){return{disabled:{type:Boolean,value:!1,observer:"_disabledChanged",reflectToAttribute:!0}}}_disabledChanged(T){this._setAriaDisabled(T)}_setAriaDisabled(T){T?this.setAttribute("aria-disabled","true"):this.removeAttribute("aria-disabled")}click(){this.disabled||super.click()}});/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const passiveTouchGestures=!1,wrap=$=>$,HAS_NATIVE_TA$1=typeof document.head.style.touchAction=="string",GESTURE_KEY$1="__polymerGestures",HANDLED_OBJ$1="__polymerGesturesHandled",TOUCH_ACTION$1="__polymerGesturesTouchAction",TAP_DISTANCE$1=25,TRACK_DISTANCE$1=5,TRACK_LENGTH$1=2,MOUSE_EVENTS$1=["mousedown","mousemove","mouseup","click"],MOUSE_WHICH_TO_BUTTONS$1=[0,1,4,2],MOUSE_HAS_BUTTONS$1=function(){try{return new MouseEvent("test",{buttons:1}).buttons===1}catch{return!1}}();function isMouseEvent$1($){return MOUSE_EVENTS$1.indexOf($)>-1}let supportsPassive$1=!1;(function(){try{const $=Object.defineProperty({},"passive",{get(){supportsPassive$1=!0}});window.addEventListener("test",null,$),window.removeEventListener("test",null,$)}catch{}})();function PASSIVE_TOUCH$1($){if(!(isMouseEvent$1($)||$==="touchend")&&HAS_NATIVE_TA$1&&supportsPassive$1&&passiveTouchGestures)return{passive:!0}}const IS_TOUCH_ONLY$1=navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/),canBeDisabled$1={button:!0,command:!0,fieldset:!0,input:!0,keygen:!0,optgroup:!0,option:!0,select:!0,textarea:!0};function hasLeftMouseButton$1($){const C=$.type;if(!isMouseEvent$1(C))return!1;if(C==="mousemove"){let V=$.buttons===void 0?1:$.buttons;return $ instanceof window.MouseEvent&&!MOUSE_HAS_BUTTONS$1&&(V=MOUSE_WHICH_TO_BUTTONS$1[$.which]||0),Boolean(V&1)}return($.button===void 0?0:$.button)===0}function isSyntheticClick$1($){if($.type==="click"){if($.detail===0)return!0;const C=_findOriginalTarget$1($);if(!C.nodeType||C.nodeType!==Node.ELEMENT_NODE)return!0;const T=C.getBoundingClientRect(),V=$.pageX,K=$.pageY;return!(V>=T.left&&V<=T.right&&K>=T.top&&K<=T.bottom)}return!1}const POINTERSTATE$1={mouse:{target:null,mouseIgnoreJob:null},touch:{x:0,y:0,id:-1,scrollDecided:!1}};function firstTouchAction$1($){let C="auto";const T=getComposedPath$1($);for(let V=0,K;V<T.length;V++)if(K=T[V],K[TOUCH_ACTION$1]){C=K[TOUCH_ACTION$1];break}return C}function trackDocument$1($,C,T){$.movefn=C,$.upfn=T,document.addEventListener("mousemove",C),document.addEventListener("mouseup",T)}function untrackDocument$1($){document.removeEventListener("mousemove",$.movefn),document.removeEventListener("mouseup",$.upfn),$.movefn=null,$.upfn=null}const getComposedPath$1=window.ShadyDOM&&window.ShadyDOM.noPatch?window.ShadyDOM.composedPath:$=>$.composedPath&&$.composedPath()||[],gestures$1={},recognizers$1=[];function deepTargetFind$1($,C){let T=document.elementFromPoint($,C),V=T;for(;V&&V.shadowRoot&&!window.ShadyDOM;){const K=V;if(V=V.shadowRoot.elementFromPoint($,C),K===V)break;V&&(T=V)}return T}function _findOriginalTarget$1($){const C=getComposedPath$1($);return C.length>0?C[0]:$.target}function _handleNative$1($){const C=$.type,V=$.currentTarget[GESTURE_KEY$1];if(!V)return;const K=V[C];if(!K)return;if(!$[HANDLED_OBJ$1]&&($[HANDLED_OBJ$1]={},C.startsWith("touch"))){const J=$.changedTouches[0];if(C==="touchstart"&&$.touches.length===1&&(POINTERSTATE$1.touch.id=J.identifier),POINTERSTATE$1.touch.id!==J.identifier)return;HAS_NATIVE_TA$1||(C==="touchstart"||C==="touchmove")&&_handleTouchAction$1($)}const Y=$[HANDLED_OBJ$1];if(!Y.skip){for(let J=0,ee;J<recognizers$1.length;J++)ee=recognizers$1[J],K[ee.name]&&!Y[ee.name]&&ee.flow&&ee.flow.start.indexOf($.type)>-1&&ee.reset&&ee.reset();for(let J=0,ee;J<recognizers$1.length;J++)ee=recognizers$1[J],K[ee.name]&&!Y[ee.name]&&(Y[ee.name]=!0,ee[C]($))}}function _handleTouchAction$1($){const C=$.changedTouches[0],T=$.type;if(T==="touchstart")POINTERSTATE$1.touch.x=C.clientX,POINTERSTATE$1.touch.y=C.clientY,POINTERSTATE$1.touch.scrollDecided=!1;else if(T==="touchmove"){if(POINTERSTATE$1.touch.scrollDecided)return;POINTERSTATE$1.touch.scrollDecided=!0;const V=firstTouchAction$1($);let K=!1;const Y=Math.abs(POINTERSTATE$1.touch.x-C.clientX),J=Math.abs(POINTERSTATE$1.touch.y-C.clientY);$.cancelable&&(V==="none"?K=!0:V==="pan-x"?K=J>Y:V==="pan-y"&&(K=Y>J)),K?$.preventDefault():prevent$1("track")}}function addListener$1($,C,T){return gestures$1[C]?(_add$1($,C,T),!0):!1}function removeListener$1($,C,T){return gestures$1[C]?(_remove$1($,C,T),!0):!1}function _add$1($,C,T){const V=gestures$1[C],K=V.deps,Y=V.name;let J=$[GESTURE_KEY$1];J||($[GESTURE_KEY$1]=J={});for(let ee=0,te,ie;ee<K.length;ee++)te=K[ee],!(IS_TOUCH_ONLY$1&&isMouseEvent$1(te)&&te!=="click")&&(ie=J[te],ie||(J[te]=ie={_count:0}),ie._count===0&&$.addEventListener(te,_handleNative$1,PASSIVE_TOUCH$1(te)),ie[Y]=(ie[Y]||0)+1,ie._count=(ie._count||0)+1);$.addEventListener(C,T),V.touchAction&&setTouchAction$1($,V.touchAction)}function _remove$1($,C,T){const V=gestures$1[C],K=V.deps,Y=V.name,J=$[GESTURE_KEY$1];if(J)for(let ee=0,te,ie;ee<K.length;ee++)te=K[ee],ie=J[te],ie&&ie[Y]&&(ie[Y]=(ie[Y]||1)-1,ie._count=(ie._count||1)-1,ie._count===0&&$.removeEventListener(te,_handleNative$1,PASSIVE_TOUCH$1(te)));$.removeEventListener(C,T)}function register$1($){recognizers$1.push($);for(let C=0;C<$.emits.length;C++)gestures$1[$.emits[C]]=$}function _findRecognizerByEvent$1($){for(let C=0,T;C<recognizers$1.length;C++){T=recognizers$1[C];for(let V=0,K;V<T.emits.length;V++)if(K=T.emits[V],K===$)return T}return null}function setTouchAction$1($,C){HAS_NATIVE_TA$1&&$ instanceof HTMLElement&&microTask.run(()=>{$.style.touchAction=C}),$[TOUCH_ACTION$1]=C}function _fire$1($,C,T){const V=new Event(C,{bubbles:!0,cancelable:!0,composed:!0});if(V.detail=T,wrap($).dispatchEvent(V),V.defaultPrevented){const K=T.preventer||T.sourceEvent;K&&K.preventDefault&&K.preventDefault()}}function prevent$1($){const C=_findRecognizerByEvent$1($);C.info&&(C.info.prevent=!0)}register$1({name:"downup",deps:["mousedown","touchstart","touchend"],flow:{start:["mousedown","touchstart"],end:["mouseup","touchend"]},emits:["down","up"],info:{movefn:null,upfn:null},reset(){untrackDocument$1(this.info)},mousedown($){if(!hasLeftMouseButton$1($))return;const C=_findOriginalTarget$1($),T=this,V=Y=>{hasLeftMouseButton$1(Y)||(downupFire$1("up",C,Y),untrackDocument$1(T.info))},K=Y=>{hasLeftMouseButton$1(Y)&&downupFire$1("up",C,Y),untrackDocument$1(T.info)};trackDocument$1(this.info,V,K),downupFire$1("down",C,$)},touchstart($){downupFire$1("down",_findOriginalTarget$1($),$.changedTouches[0],$)},touchend($){downupFire$1("up",_findOriginalTarget$1($),$.changedTouches[0],$)}});function downupFire$1($,C,T,V){C&&_fire$1(C,$,{x:T.clientX,y:T.clientY,sourceEvent:T,preventer:V,prevent(K){return prevent$1(K)}})}register$1({name:"track",touchAction:"none",deps:["mousedown","touchstart","touchmove","touchend"],flow:{start:["mousedown","touchstart"],end:["mouseup","touchend"]},emits:["track"],info:{x:0,y:0,state:"start",started:!1,moves:[],addMove($){this.moves.length>TRACK_LENGTH$1&&this.moves.shift(),this.moves.push($)},movefn:null,upfn:null,prevent:!1},reset(){this.info.state="start",this.info.started=!1,this.info.moves=[],this.info.x=0,this.info.y=0,this.info.prevent=!1,untrackDocument$1(this.info)},mousedown($){if(!hasLeftMouseButton$1($))return;const C=_findOriginalTarget$1($),T=this,V=Y=>{const J=Y.clientX,ee=Y.clientY;trackHasMovedEnough$1(T.info,J,ee)&&(T.info.state=T.info.started?Y.type==="mouseup"?"end":"track":"start",T.info.state==="start"&&prevent$1("tap"),T.info.addMove({x:J,y:ee}),hasLeftMouseButton$1(Y)||(T.info.state="end",untrackDocument$1(T.info)),C&&trackFire$1(T.info,C,Y),T.info.started=!0)},K=Y=>{T.info.started&&V(Y),untrackDocument$1(T.info)};trackDocument$1(this.info,V,K),this.info.x=$.clientX,this.info.y=$.clientY},touchstart($){const C=$.changedTouches[0];this.info.x=C.clientX,this.info.y=C.clientY},touchmove($){const C=_findOriginalTarget$1($),T=$.changedTouches[0],V=T.clientX,K=T.clientY;trackHasMovedEnough$1(this.info,V,K)&&(this.info.state==="start"&&prevent$1("tap"),this.info.addMove({x:V,y:K}),trackFire$1(this.info,C,T),this.info.state="track",this.info.started=!0)},touchend($){const C=_findOriginalTarget$1($),T=$.changedTouches[0];this.info.started&&(this.info.state="end",this.info.addMove({x:T.clientX,y:T.clientY}),trackFire$1(this.info,C,T))}});function trackHasMovedEnough$1($,C,T){if($.prevent)return!1;if($.started)return!0;const V=Math.abs($.x-C),K=Math.abs($.y-T);return V>=TRACK_DISTANCE$1||K>=TRACK_DISTANCE$1}function trackFire$1($,C,T){if(!C)return;const V=$.moves[$.moves.length-2],K=$.moves[$.moves.length-1],Y=K.x-$.x,J=K.y-$.y;let ee,te=0;V&&(ee=K.x-V.x,te=K.y-V.y),_fire$1(C,"track",{state:$.state,x:T.clientX,y:T.clientY,dx:Y,dy:J,ddx:ee,ddy:te,sourceEvent:T,hover(){return deepTargetFind$1(T.clientX,T.clientY)}})}register$1({name:"tap",deps:["mousedown","click","touchstart","touchend"],flow:{start:["mousedown","touchstart"],end:["click","touchend"]},emits:["tap"],info:{x:NaN,y:NaN,prevent:!1},reset(){this.info.x=NaN,this.info.y=NaN,this.info.prevent=!1},mousedown($){hasLeftMouseButton$1($)&&(this.info.x=$.clientX,this.info.y=$.clientY)},click($){hasLeftMouseButton$1($)&&trackForward$1(this.info,$)},touchstart($){const C=$.changedTouches[0];this.info.x=C.clientX,this.info.y=C.clientY},touchend($){trackForward$1(this.info,$.changedTouches[0],$)}});function trackForward$1($,C,T){const V=Math.abs(C.clientX-$.x),K=Math.abs(C.clientY-$.y),Y=_findOriginalTarget$1(T||C);!Y||canBeDisabled$1[Y.localName]&&Y.hasAttribute("disabled")||(isNaN(V)||isNaN(K)||V<=TAP_DISTANCE$1&&K<=TAP_DISTANCE$1||isSyntheticClick$1(C))&&($.prevent||_fire$1(Y,"tap",{x:C.clientX,y:C.clientY,sourceEvent:C,preventer:T}))}/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const KeyboardMixin=dedupingMixin($=>class extends ${ready(){super.ready(),this.addEventListener("keydown",T=>{this._onKeyDown(T)}),this.addEventListener("keyup",T=>{this._onKeyUp(T)})}_onKeyDown(T){switch(T.key){case"Enter":this._onEnter(T);break;case"Escape":this._onEscape(T);break}}_onKeyUp(T){}_onEnter(T){}_onEscape(T){}});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ActiveMixin=$=>class extends DisabledMixin(KeyboardMixin($)){get _activeKeys(){return[" "]}ready(){super.ready(),addListener$1(this,"down",T=>{this._shouldSetActive(T)&&this._setActive(!0)}),addListener$1(this,"up",()=>{this._setActive(!1)})}disconnectedCallback(){super.disconnectedCallback(),this._setActive(!1)}_shouldSetActive(T){return!this.disabled}_onKeyDown(T){super._onKeyDown(T),this._shouldSetActive(T)&&this._activeKeys.includes(T.key)&&(this._setActive(!0),document.addEventListener("keyup",V=>{this._activeKeys.includes(V.key)&&this._setActive(!1)},{once:!0}))}_setActive(T){this.toggleAttribute("active",T)}};/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const FocusMixin=dedupingMixin($=>class extends ${get _keyboardActive(){return isKeyboardActive()}ready(){this.addEventListener("focusin",T=>{this._shouldSetFocus(T)&&this._setFocused(!0)}),this.addEventListener("focusout",T=>{this._shouldRemoveFocus(T)&&this._setFocused(!1)}),super.ready()}disconnectedCallback(){super.disconnectedCallback(),this.hasAttribute("focused")&&this._setFocused(!1)}_setFocused(T){this.toggleAttribute("focused",T),this.toggleAttribute("focus-ring",T&&this._keyboardActive)}_shouldSetFocus(T){return!0}_shouldRemoveFocus(T){return!0}});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const TabindexMixin=$=>class extends DisabledMixin($){static get properties(){return{tabindex:{type:Number,reflectToAttribute:!0,observer:"_tabindexChanged"},_lastTabIndex:{type:Number}}}_disabledChanged(T,V){super._disabledChanged(T,V),T?(this.tabindex!==void 0&&(this._lastTabIndex=this.tabindex),this.tabindex=-1):V&&(this.tabindex=this._lastTabIndex)}_tabindexChanged(T){this.disabled&&T!==-1&&(this._lastTabIndex=T,this.tabindex=-1)}};/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ButtonMixin=$=>class extends ActiveMixin(TabindexMixin(FocusMixin($))){static get properties(){return{tabindex:{value:0}}}get _activeKeys(){return["Enter"," "]}ready(){super.ready(),this.hasAttribute("role")||this.setAttribute("role","button")}_onKeyDown(T){super._onKeyDown(T),this._activeKeys.includes(T.key)&&(T.preventDefault(),this.click())}};/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Button extends ButtonMixin(ElementMixin(ThemableMixin(ControllerMixin(PolymerElement)))){static get is(){return"vaadin-button"}static get template(){return html`
      <style>
        :host {
          display: inline-block;
          position: relative;
          outline: none;
          white-space: nowrap;
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
        }

        :host([hidden]) {
          display: none !important;
        }

        /* Aligns the button with form fields when placed on the same line.
          Note, to make it work, the form fields should have the same "::before" pseudo-element. */
        .vaadin-button-container::before {
          content: '\\2003';
          display: inline-block;
          width: 0;
          max-height: 100%;
        }

        .vaadin-button-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          width: 100%;
          height: 100%;
          min-height: inherit;
          text-shadow: inherit;
        }

        [part='prefix'],
        [part='suffix'] {
          flex: none;
        }

        [part='label'] {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      </style>
      <div class="vaadin-button-container">
        <span part="prefix" aria-hidden="true">
          <slot name="prefix"></slot>
        </span>
        <span part="label">
          <slot></slot>
        </span>
        <span part="suffix" aria-hidden="true">
          <slot name="suffix"></slot>
        </span>
      </div>
      <slot name="tooltip"></slot>
    `}ready(){super.ready(),this._tooltipController=new TooltipController(this),this.addController(this._tooltipController)}}customElements.define(Button.is,Button);/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */function getAncestorRootNodes($){const C=[];for(;$;){if($.nodeType===Node.DOCUMENT_NODE){C.push($);break}if($.nodeType===Node.DOCUMENT_FRAGMENT_NODE){C.push($),$=$.host;continue}if($.assignedSlot){$=$.assignedSlot;continue}$=$.parentNode}return C}function deserializeAttributeValue($){return $?new Set($.split(" ")):new Set}function serializeAttributeValue($){return[...$].join(" ")}function addValueToAttribute($,C,T){const V=deserializeAttributeValue($.getAttribute(C));V.add(T),$.setAttribute(C,serializeAttributeValue(V))}function removeValueFromAttribute($,C,T){const V=deserializeAttributeValue($.getAttribute(C));if(V.delete(T),V.size===0){$.removeAttribute(C);return}$.setAttribute(C,serializeAttributeValue(V))}function isEmptyTextNode($){return $.nodeType===Node.TEXT_NODE&&$.textContent.trim()===""}/**
 * @license
 * Copyright (c) 2018 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class DrawerToggle extends Button{static get template(){return html`
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: default;
          position: relative;
          outline: none;
          height: 24px;
          width: 24px;
          padding: 4px;
        }

        [part='icon'],
        [part='icon']::after,
        [part='icon']::before {
          position: absolute;
          top: 8px;
          height: 3px;
          width: 24px;
          background-color: #000;
        }

        [part='icon']::after,
        [part='icon']::before {
          content: '';
        }

        [part='icon']::after {
          top: 6px;
        }

        [part='icon']::before {
          top: 12px;
        }
      </style>
      <slot id="slot">
        <div part="icon"></div>
      </slot>
      <div part="icon" hidden$="[[!_showFallbackIcon]]"></div>
      <slot name="tooltip"></slot>
    `}static get is(){return"vaadin-drawer-toggle"}static get properties(){return{ariaLabel:{type:String,value:"Toggle navigation panel",reflectToAttribute:!0},_showFallbackIcon:{type:Boolean,value:!1}}}constructor(){super(),this.addEventListener("click",()=>{this.dispatchEvent(new CustomEvent("drawer-toggle-click",{bubbles:!0,composed:!0}))})}ready(){super.ready(),this._observer=new FlattenedNodesObserver(this,()=>{this._toggleFallbackIcon()})}_toggleFallbackIcon(){const C=this.$.slot.assignedNodes();this._showFallbackIcon=C.length>0&&C.every(T=>isEmptyTextNode(T))}}customElements.define(DrawerToggle.is,DrawerToggle);registerStyles("vaadin-tab",i$2`
    :host {
      box-sizing: border-box;
      padding: 0.5rem 0.75rem;
      font-family: var(--lumo-font-family);
      font-size: var(--lumo-font-size-m);
      line-height: var(--lumo-line-height-xs);
      font-weight: 500;
      opacity: 1;
      color: var(--lumo-secondary-text-color);
      transition: 0.15s color, 0.2s transform;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      position: relative;
      cursor: var(--lumo-clickable-cursor);
      transform-origin: 50% 100%;
      outline: none;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow: hidden;
      min-width: var(--lumo-size-m);
      -webkit-user-select: none;
      -moz-user-select: none;
      user-select: none;
    }

    :host(:not([orientation='vertical'])) {
      text-align: center;
    }

    :host([orientation='vertical']) {
      transform-origin: 0% 50%;
      padding: 0.25rem 1rem;
      min-height: var(--lumo-size-m);
      min-width: 0;
    }

    :host(:hover),
    :host([focus-ring]) {
      color: var(--lumo-body-text-color);
    }

    :host([selected]) {
      color: var(--lumo-primary-text-color);
      transition: 0.6s color;
    }

    :host([active]:not([selected])) {
      color: var(--lumo-primary-text-color);
      transition-duration: 0.1s;
    }

    :host::before,
    :host::after {
      content: '';
      position: absolute;
      display: var(--_lumo-tab-marker-display, block);
      bottom: 0;
      left: 50%;
      width: var(--lumo-size-s);
      height: 2px;
      background-color: var(--lumo-contrast-60pct);
      border-radius: var(--lumo-border-radius-s) var(--lumo-border-radius-s) 0 0;
      transform: translateX(-50%) scale(0);
      transform-origin: 50% 100%;
      transition: 0.14s transform cubic-bezier(0.12, 0.32, 0.54, 1);
      will-change: transform;
    }

    :host([selected])::before,
    :host([selected])::after {
      background-color: var(--lumo-primary-color);
    }

    :host([orientation='vertical'])::before,
    :host([orientation='vertical'])::after {
      left: 0;
      bottom: 50%;
      transform: translateY(50%) scale(0);
      width: 2px;
      height: var(--lumo-size-xs);
      border-radius: 0 var(--lumo-border-radius-s) var(--lumo-border-radius-s) 0;
      transform-origin: 100% 50%;
    }

    :host::after {
      box-shadow: 0 0 0 4px var(--lumo-primary-color);
      opacity: 0.15;
      transition: 0.15s 0.02s transform, 0.8s 0.17s opacity;
    }

    :host([selected])::before,
    :host([selected])::after {
      transform: translateX(-50%) scale(1);
      transition-timing-function: cubic-bezier(0.12, 0.32, 0.54, 1.5);
    }

    :host([orientation='vertical'][selected])::before,
    :host([orientation='vertical'][selected])::after {
      transform: translateY(50%) scale(1);
    }

    :host([selected]:not([active]))::after {
      opacity: 0;
    }

    :host(:not([orientation='vertical'])) ::slotted(a[href]) {
      justify-content: center;
    }

    :host ::slotted(a) {
      display: flex;
      width: 100%;
      align-items: center;
      height: 100%;
      margin: -0.5rem -0.75rem;
      padding: 0.5rem 0.75rem;
      outline: none;

      /*
          Override the CSS inherited from \`lumo-color\` and \`lumo-typography\`.
          Note: \`!important\` is needed because of the \`:slotted\` specificity.
        */
      text-decoration: none !important;
      color: inherit !important;
    }

    :host ::slotted(vaadin-icon),
    :host ::slotted(iron-icon) {
      margin: 0 4px;
      width: var(--lumo-icon-size-m);
      height: var(--lumo-icon-size-m);
    }

    /* Vaadin icons are based on a 16x16 grid (unlike Lumo and Material icons with 24x24), so they look too big by default */
    :host ::slotted(vaadin-icon[icon^='vaadin:']),
    :host ::slotted(iron-icon[icon^='vaadin:']) {
      padding: 0.25rem;
      box-sizing: border-box !important;
    }

    :host(:not([dir='rtl'])) ::slotted(vaadin-icon:first-child),
    :host(:not([dir='rtl'])) ::slotted(iron-icon:first-child) {
      margin-left: 0;
    }

    :host(:not([dir='rtl'])) ::slotted(vaadin-icon:last-child),
    :host(:not([dir='rtl'])) ::slotted(iron-icon:last-child) {
      margin-right: 0;
    }

    :host([theme~='icon-on-top']) {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      text-align: center;
      padding-bottom: 0.5rem;
      padding-top: 0.25rem;
    }

    :host([theme~='icon-on-top']) ::slotted(a) {
      flex-direction: column;
      align-items: center;
      margin-top: -0.25rem;
      padding-top: 0.25rem;
    }

    :host([theme~='icon-on-top']) ::slotted(vaadin-icon),
    :host([theme~='icon-on-top']) ::slotted(iron-icon) {
      margin: 0;
    }

    /* Disabled */

    :host([disabled]) {
      pointer-events: none;
      opacity: 1;
      color: var(--lumo-disabled-text-color);
    }

    /* Focus-ring */

    :host([focus-ring]) {
      box-shadow: inset 0 0 0 2px var(--lumo-primary-color-50pct);
      border-radius: var(--lumo-border-radius-m);
    }

    /* RTL specific styles */

    :host([dir='rtl'])::before,
    :host([dir='rtl'])::after {
      left: auto;
      right: 50%;
      transform: translateX(50%) scale(0);
    }

    :host([dir='rtl'][selected]:not([orientation='vertical']))::before,
    :host([dir='rtl'][selected]:not([orientation='vertical']))::after {
      transform: translateX(50%) scale(1);
    }

    :host([dir='rtl']) ::slotted(vaadin-icon:first-child),
    :host([dir='rtl']) ::slotted(iron-icon:first-child) {
      margin-right: 0;
    }

    :host([dir='rtl']) ::slotted(vaadin-icon:last-child),
    :host([dir='rtl']) ::slotted(iron-icon:last-child) {
      margin-left: 0;
    }

    :host([orientation='vertical'][dir='rtl']) {
      transform-origin: 100% 50%;
    }

    :host([dir='rtl'][orientation='vertical'])::before,
    :host([dir='rtl'][orientation='vertical'])::after {
      left: auto;
      right: 0;
      border-radius: var(--lumo-border-radius-s) 0 0 var(--lumo-border-radius-s);
      transform-origin: 0% 50%;
    }
  `,{moduleId:"lumo-tab"});/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ItemMixin=$=>class extends ActiveMixin(FocusMixin($)){static get properties(){return{_hasVaadinItemMixin:{value:!0},selected:{type:Boolean,value:!1,reflectToAttribute:!0,observer:"_selectedChanged"},_value:String}}get _activeKeys(){return["Enter"," "]}get value(){return this._value!==void 0?this._value:this.textContent.trim()}set value(T){this._value=T}ready(){super.ready();const T=this.getAttribute("value");T!==null&&(this.value=T)}focus(){this.disabled||(super.focus(),this._setFocused(!0))}_shouldSetActive(T){return!this.disabled&&!(T.type==="keydown"&&T.defaultPrevented)}_selectedChanged(T){this.setAttribute("aria-selected",T)}_disabledChanged(T){super._disabledChanged(T),T&&(this.selected=!1,this.blur())}_onKeyDown(T){super._onKeyDown(T),this._activeKeys.includes(T.key)&&!T.defaultPrevented&&(T.preventDefault(),this.click())}};/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Tab extends ElementMixin(ThemableMixin(ItemMixin(ControllerMixin(PolymerElement)))){static get template(){return html`
      <style>
        :host {
          display: block;
        }

        :host([hidden]) {
          display: none !important;
        }
      </style>
      <slot></slot>
      <slot name="tooltip"></slot>
    `}static get is(){return"vaadin-tab"}ready(){super.ready(),this.setAttribute("role","tab"),this._tooltipController=new TooltipController(this),this.addController(this._tooltipController)}_onKeyUp(C){const T=this.hasAttribute("active");if(super._onKeyUp(C),T){const V=this.querySelector("a");V&&V.click()}}}customElements.define(Tab.is,Tab);registerStyles("vaadin-tabs",i$2`
    :host {
      -webkit-tap-highlight-color: transparent;
    }

    :host(:not([orientation='vertical'])) {
      box-shadow: inset 0 -1px 0 0 var(--lumo-contrast-10pct);
      position: relative;
      min-height: var(--lumo-size-l);
    }

    :host([orientation='horizontal']) [part='tabs'] ::slotted(vaadin-tab:not([theme~='icon-on-top'])) {
      justify-content: center;
    }

    :host([orientation='vertical']) {
      box-shadow: -1px 0 0 0 var(--lumo-contrast-10pct);
    }

    :host([orientation='horizontal']) [part='tabs'] {
      margin: 0 0.75rem;
    }

    :host([orientation='vertical']) [part='tabs'] {
      width: 100%;
      margin: 0.5rem 0;
    }

    [part='forward-button'],
    [part='back-button'] {
      position: absolute;
      z-index: 1;
      font-family: lumo-icons;
      color: var(--lumo-tertiary-text-color);
      font-size: var(--lumo-icon-size-m);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.5em;
      height: 100%;
      transition: 0.2s opacity;
      top: 0;
    }

    [part='forward-button']:hover,
    [part='back-button']:hover {
      color: inherit;
    }

    :host(:not([dir='rtl'])) [part='forward-button'] {
      right: 0;
    }

    [part='forward-button']::after {
      content: var(--lumo-icons-angle-right);
    }

    [part='back-button']::after {
      content: var(--lumo-icons-angle-left);
    }

    /* Tabs overflow */

    [part='tabs'] {
      --_lumo-tabs-overflow-mask-image: none;
      -webkit-mask-image: var(--_lumo-tabs-overflow-mask-image);
      mask-image: var(--_lumo-tabs-overflow-mask-image);
    }

    /* Horizontal tabs overflow */

    /* Both ends overflowing */
    :host([overflow~='start'][overflow~='end']:not([orientation='vertical'])) [part='tabs'] {
      --_lumo-tabs-overflow-mask-image: linear-gradient(
        90deg,
        transparent 2em,
        #000 4em,
        #000 calc(100% - 4em),
        transparent calc(100% - 2em)
      );
    }

    /* End overflowing */
    :host([overflow~='end']:not([orientation='vertical'])) [part='tabs'] {
      --_lumo-tabs-overflow-mask-image: linear-gradient(90deg, #000 calc(100% - 4em), transparent calc(100% - 2em));
    }

    /* Start overflowing */
    :host([overflow~='start']:not([orientation='vertical'])) [part='tabs'] {
      --_lumo-tabs-overflow-mask-image: linear-gradient(90deg, transparent 2em, #000 4em);
    }

    /* Vertical tabs overflow */

    /* Both ends overflowing */
    :host([overflow~='start'][overflow~='end'][orientation='vertical']) [part='tabs'] {
      --_lumo-tabs-overflow-mask-image: linear-gradient(transparent, #000 2em, #000 calc(100% - 2em), transparent);
    }

    /* End overflowing */
    :host([overflow~='end'][orientation='vertical']) [part='tabs'] {
      --_lumo-tabs-overflow-mask-image: linear-gradient(#000 calc(100% - 2em), transparent);
    }

    /* Start overflowing */
    :host([overflow~='start'][orientation='vertical']) [part='tabs'] {
      --_lumo-tabs-overflow-mask-image: linear-gradient(transparent, #000 2em);
    }

    :host [part='tabs'] ::slotted(:not(vaadin-tab)) {
      margin-left: var(--lumo-space-m);
    }

    /* Centered */

    :host([theme~='centered'][orientation='horizontal']) ::slotted(vaadin-tab:first-of-type) {
      margin-inline-start: auto;
    }

    :host([theme~='centered'][orientation='horizontal']) ::slotted(vaadin-tab:last-of-type) {
      margin-inline-end: auto;
    }

    /* Small */

    :host([theme~='small']),
    :host([theme~='small']) [part='tabs'] {
      min-height: var(--lumo-size-m);
    }

    :host([theme~='small']) [part='tabs'] ::slotted(vaadin-tab) {
      font-size: var(--lumo-font-size-s);
    }

    /* Minimal */

    :host([theme~='minimal']) {
      box-shadow: none;
      --_lumo-tab-marker-display: none;
    }

    /* Hide-scroll-buttons */

    :host([theme~='hide-scroll-buttons']) [part='back-button'],
    :host([theme~='hide-scroll-buttons']) [part='forward-button'] {
      display: none;
    }

    /* prettier-ignore */
    :host([theme~='hide-scroll-buttons'][overflow~='start'][overflow~='end']:not([orientation='vertical'])) [part='tabs'] {
      --_lumo-tabs-overflow-mask-image: linear-gradient(
        90deg,
        transparent,
        #000 2em,
        #000 calc(100% - 2em),
        transparent 100%
      );
    }

    :host([theme~='hide-scroll-buttons'][overflow~='end']:not([orientation='vertical'])) [part='tabs'] {
      --_lumo-tabs-overflow-mask-image: linear-gradient(90deg, #000 calc(100% - 2em), transparent 100%);
    }

    :host([theme~='hide-scroll-buttons'][overflow~='start']:not([orientation='vertical'])) [part='tabs'] {
      --_lumo-tabs-overflow-mask-image: linear-gradient(90deg, transparent, #000 2em);
    }

    /* Equal-width tabs */
    :host([theme~='equal-width-tabs']) {
      flex: auto;
    }

    :host([theme~='equal-width-tabs']) [part='tabs'] ::slotted(vaadin-tab) {
      flex: 1 0 0%;
    }

    /* RTL specific styles */

    :host([dir='rtl']) [part='forward-button']::after {
      content: var(--lumo-icons-angle-left);
    }

    :host([dir='rtl']) [part='back-button']::after {
      content: var(--lumo-icons-angle-right);
    }

    :host([orientation='vertical'][dir='rtl']) {
      box-shadow: 1px 0 0 0 var(--lumo-contrast-10pct);
    }

    :host([dir='rtl']) [part='forward-button'] {
      left: 0;
    }

    :host([dir='rtl']) [part='tabs'] ::slotted(:not(vaadin-tab)) {
      margin-left: 0;
      margin-right: var(--lumo-space-m);
    }

    /* Both ends overflowing */
    :host([dir='rtl'][overflow~='start'][overflow~='end']:not([orientation='vertical'])) [part='tabs'] {
      --_lumo-tabs-overflow-mask-image: linear-gradient(
        -90deg,
        transparent 2em,
        #000 4em,
        #000 calc(100% - 4em),
        transparent calc(100% - 2em)
      );
    }

    /* End overflowing */
    :host([dir='rtl'][overflow~='end']:not([orientation='vertical'])) [part='tabs'] {
      --_lumo-tabs-overflow-mask-image: linear-gradient(-90deg, #000 calc(100% - 4em), transparent calc(100% - 2em));
    }

    /* Start overflowing */
    :host([dir='rtl'][overflow~='start']:not([orientation='vertical'])) [part='tabs'] {
      --_lumo-tabs-overflow-mask-image: linear-gradient(-90deg, transparent 2em, #000 4em);
    }

    :host([dir='rtl'][theme~='hide-scroll-buttons'][overflow~='start'][overflow~='end']:not([orientation='vertical']))
      [part='tabs'] {
      --_lumo-tabs-overflow-mask-image: linear-gradient(
        -90deg,
        transparent,
        #000 2em,
        #000 calc(100% - 2em),
        transparent 100%
      );
    }

    :host([dir='rtl'][theme~='hide-scroll-buttons'][overflow~='end']:not([orientation='vertical'])) [part='tabs'] {
      --_lumo-tabs-overflow-mask-image: linear-gradient(-90deg, #000 calc(100% - 2em), transparent 100%);
    }

    :host([dir='rtl'][theme~='hide-scroll-buttons'][overflow~='start']:not([orientation='vertical'])) [part='tabs'] {
      --_lumo-tabs-overflow-mask-image: linear-gradient(-90deg, transparent, #000 2em);
    }
  `,{moduleId:"lumo-tabs"});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const observer$1=new ResizeObserver($=>{setTimeout(()=>{$.forEach(C=>{C.target.resizables?C.target.resizables.forEach(T=>{T._onResize(C.contentRect)}):C.target._onResize(C.contentRect)})})}),ResizeMixin=dedupingMixin($=>class extends ${connectedCallback(){if(super.connectedCallback(),observer$1.observe(this),this._observeParent){const T=this.parentNode instanceof ShadowRoot?this.parentNode.host:this.parentNode;T.resizables||(T.resizables=new Set,observer$1.observe(T)),T.resizables.add(this),this.__parent=T}}disconnectedCallback(){super.disconnectedCallback(),observer$1.unobserve(this);const T=this.__parent;if(this._observeParent&&T){const V=T.resizables;V&&(V.delete(this),V.size===0&&observer$1.unobserve(T)),this.__parent=null}}get _observeParent(){return!1}_onResize(T){}notifyResize(){console.warn("WARNING: Since Vaadin 23, notifyResize() is deprecated. The component uses a ResizeObserver internally and doesn't need to be explicitly notified of resizes.")}});/**
 * @license
 * Copyright (c) 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const KeyboardDirectionMixin=$=>class extends KeyboardMixin($){focus(){const T=this._getItems();if(Array.isArray(T)){const V=this._getAvailableIndex(T,0,null,K=>!isElementHidden(K));V>=0&&T[V].focus()}}get focused(){return(this._getItems()||[]).find(isElementFocused)}get _vertical(){return!0}_getItems(){return Array.from(this.children)}_onKeyDown(T){if(super._onKeyDown(T),T.metaKey||T.ctrlKey)return;const{key:V}=T,K=this._getItems()||[],Y=K.indexOf(this.focused);let J,ee;const ie=!this._vertical&&this.getAttribute("dir")==="rtl"?-1:1;this.__isPrevKey(V)?(ee=-ie,J=Y-ie):this.__isNextKey(V)?(ee=ie,J=Y+ie):V==="Home"?(ee=1,J=0):V==="End"&&(ee=-1,J=K.length-1),J=this._getAvailableIndex(K,J,ee,re=>!isElementHidden(re)),J>=0&&(T.preventDefault(),this._focus(J,!0))}__isPrevKey(T){return this._vertical?T==="ArrowUp":T==="ArrowLeft"}__isNextKey(T){return this._vertical?T==="ArrowDown":T==="ArrowRight"}_focus(T,V=!1){const K=this._getItems();this._focusItem(K[T],V)}_focusItem(T){T&&(T.focus(),T.setAttribute("focus-ring",""))}_getAvailableIndex(T,V,K,Y){const J=T.length;let ee=V;for(let te=0;typeof ee=="number"&&te<J;te+=1,ee+=K||1){ee<0?ee=J-1:ee>=J&&(ee=0);const ie=T[ee];if(!ie.hasAttribute("disabled")&&this.__isMatchingItem(ie,Y))return ee}return-1}__isMatchingItem(T,V){return typeof V=="function"?V(T):!0}};/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ListMixin=$=>class extends KeyboardDirectionMixin($){static get properties(){return{_hasVaadinListMixin:{value:!0},selected:{type:Number,reflectToAttribute:!0,notify:!0},orientation:{type:String,reflectToAttribute:!0,value:""},items:{type:Array,readOnly:!0,notify:!0},_searchBuf:{type:String,value:""}}}static get observers(){return["_enhanceItems(items, orientation, selected, disabled)"]}ready(){super.ready(),this.addEventListener("click",T=>this._onClick(T)),this._observer=new FlattenedNodesObserver(this,()=>{this._setItems(this._filterItems(FlattenedNodesObserver.getFlattenedNodes(this)))})}_getItems(){return this.items}_enhanceItems(T,V,K,Y){if(!Y&&T){this.setAttribute("aria-orientation",V||"vertical"),this.items.forEach(ee=>{V?ee.setAttribute("orientation",V):ee.removeAttribute("orientation")}),this._setFocusable(K||0);const J=T[K];T.forEach(ee=>{ee.selected=ee===J}),J&&!J.disabled&&this._scrollToItem(K)}}_filterItems(T){return T.filter(V=>V._hasVaadinItemMixin)}_onClick(T){if(T.metaKey||T.shiftKey||T.ctrlKey||T.defaultPrevented)return;const V=this._filterItems(T.composedPath())[0];let K;V&&!V.disabled&&(K=this.items.indexOf(V))>=0&&(this.selected=K)}_searchKey(T,V){this._searchReset=Debouncer$1.debounce(this._searchReset,timeOut.after(500),()=>{this._searchBuf=""}),this._searchBuf+=V.toLowerCase(),this.items.some(Y=>this.__isMatchingKey(Y))||(this._searchBuf=V.toLowerCase());const K=this._searchBuf.length===1?T+1:T;return this._getAvailableIndex(this.items,K,1,Y=>this.__isMatchingKey(Y)&&getComputedStyle(Y).display!=="none")}__isMatchingKey(T){return T.textContent.replace(/[^\p{L}\p{Nd}]/gu,"").toLowerCase().startsWith(this._searchBuf)}get _isRTL(){return!this._vertical&&this.getAttribute("dir")==="rtl"}_onKeyDown(T){if(T.metaKey||T.ctrlKey)return;const V=T.key,K=this.items.indexOf(this.focused);if(/[a-zA-Z0-9]/.test(V)&&V.length===1){const Y=this._searchKey(K,V);Y>=0&&this._focus(Y);return}super._onKeyDown(T)}_isItemHidden(T){return getComputedStyle(T).display==="none"}_setFocusable(T){T=this._getAvailableIndex(this.items,T,1);const V=this.items[T];this.items.forEach(K=>{K.tabIndex=K===V?0:-1})}_focus(T){this.items.forEach((V,K)=>{V.focused=K===T}),this._setFocusable(T),this._scrollToItem(T),super._focus(T)}focus(){this._observer&&this._observer.flush();const T=this.querySelector('[tabindex="0"]')||(this.items?this.items[0]:null);this._focusItem(T)}get _scrollerElement(){return console.warn(`Please implement the '_scrollerElement' property in <${this.localName}>`),this}_scrollToItem(T){const V=this.items[T];if(!V)return;const K=this._vertical?["top","bottom"]:this._isRTL?["right","left"]:["left","right"],Y=this._scrollerElement.getBoundingClientRect(),J=(this.items[T+1]||V).getBoundingClientRect(),ee=(this.items[T-1]||V).getBoundingClientRect();let te=0;!this._isRTL&&J[K[1]]>=Y[K[1]]||this._isRTL&&J[K[1]]<=Y[K[1]]?te=J[K[1]]-Y[K[1]]:(!this._isRTL&&ee[K[0]]<=Y[K[0]]||this._isRTL&&ee[K[0]]>=Y[K[0]])&&(te=ee[K[0]]-Y[K[0]]),this._scroll(te)}get _vertical(){return this.orientation!=="horizontal"}_scroll(T){if(this._vertical)this._scrollerElement.scrollTop+=T;else{const V=this.getAttribute("dir")||"ltr",K=DirHelper.detectScrollType(),Y=DirHelper.getNormalizedScrollLeft(K,V,this._scrollerElement)+T;DirHelper.setNormalizedScrollLeft(K,V,this._scrollerElement,Y)}}};/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Tabs extends ResizeMixin(ElementMixin(ListMixin(ThemableMixin(PolymerElement)))){static get template(){return html`
      <style>
        :host {
          display: flex;
          align-items: center;
        }

        :host([hidden]) {
          display: none !important;
        }

        :host([orientation='vertical']) {
          display: block;
        }

        :host([orientation='horizontal']) [part='tabs'] {
          flex-grow: 1;
          display: flex;
          align-self: stretch;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* This seems more future-proof than \`overflow: -moz-scrollbars-none\` which is marked obsolete
         and is no longer guaranteed to work:
         https://developer.mozilla.org/en-US/docs/Web/CSS/overflow#Mozilla_Extensions */
        @-moz-document url-prefix() {
          :host([orientation='horizontal']) [part='tabs'] {
            overflow: hidden;
          }
        }

        :host([orientation='horizontal']) [part='tabs']::-webkit-scrollbar {
          display: none;
        }

        :host([orientation='vertical']) [part='tabs'] {
          height: 100%;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        [part='back-button'],
        [part='forward-button'] {
          pointer-events: none;
          opacity: 0;
          cursor: default;
        }

        :host([overflow~='start']) [part='back-button'],
        :host([overflow~='end']) [part='forward-button'] {
          pointer-events: auto;
          opacity: 1;
        }

        [part='back-button']::after {
          content: '\\25C0';
        }

        [part='forward-button']::after {
          content: '\\25B6';
        }

        :host([orientation='vertical']) [part='back-button'],
        :host([orientation='vertical']) [part='forward-button'] {
          display: none;
        }

        /* RTL specific styles */

        :host([dir='rtl']) [part='back-button']::after {
          content: '\\25B6';
        }

        :host([dir='rtl']) [part='forward-button']::after {
          content: '\\25C0';
        }
      </style>
      <div on-click="_scrollBack" part="back-button" aria-hidden="true"></div>

      <div id="scroll" part="tabs">
        <slot></slot>
      </div>

      <div on-click="_scrollForward" part="forward-button" aria-hidden="true"></div>
    `}static get is(){return"vaadin-tabs"}static get properties(){return{orientation:{value:"horizontal",type:String},selected:{value:0,type:Number}}}static get observers(){return["__tabsItemsChanged(items, items.*)"]}constructor(){super(),this.__itemsResizeObserver=new ResizeObserver(()=>{setTimeout(()=>this._updateOverflow())})}ready(){super.ready(),this._scrollerElement.addEventListener("scroll",()=>this._updateOverflow()),this.setAttribute("role","tablist"),afterNextRender(this,()=>{this._updateOverflow()})}_onResize(){this._updateOverflow()}__tabsItemsChanged(C){this.__itemsResizeObserver.disconnect(),(C||[]).forEach(T=>{this.__itemsResizeObserver.observe(T)}),this._updateOverflow()}_scrollForward(){this._scroll(-this.__direction*this._scrollOffset)}_scrollBack(){this._scroll(this.__direction*this._scrollOffset)}get _scrollOffset(){return this._vertical?this._scrollerElement.offsetHeight:this._scrollerElement.offsetWidth}get _scrollerElement(){return this.$.scroll}get __direction(){return!this._vertical&&this.getAttribute("dir")==="rtl"?1:-1}_updateOverflow(){const C=this._vertical?this._scrollerElement.scrollTop:this.__getNormalizedScrollLeft(this._scrollerElement),T=this._vertical?this._scrollerElement.scrollHeight:this._scrollerElement.scrollWidth;let V=C>0?"start":"";V+=C+this._scrollOffset<T?" end":"",this.__direction===1&&(V=V.replace(/start|end/gi,K=>K==="start"?"end":"start")),V?this.setAttribute("overflow",V.trim()):this.removeAttribute("overflow")}}customElements.define(Tabs.is,Tabs);/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */console.warn('WARNING: Since Vaadin 23.2, "@vaadin/vaadin-tabs" is deprecated. Use "@vaadin/tabs" instead.');var __defProp$z=Object.defineProperty,__getOwnPropDesc$z=Object.getOwnPropertyDescriptor,__decorateClass$z=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$z(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$z(C,T,K),K};let InputText=class extends s$2{constructor(){super(...arguments),this.name="",this.onChange=$=>{const C=$.target;console.log("input-text",C.value)},this.enabled=!0}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}render(){return y$1`
            <p>Label</p>
            <input type="text" 
                           @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
        ></input>`}};__decorateClass$z([e()],InputText.prototype,"name",2);__decorateClass$z([e()],InputText.prototype,"onChange",2);__decorateClass$z([e()],InputText.prototype,"value",2);__decorateClass$z([e()],InputText.prototype,"enabled",2);InputText=__decorateClass$z([e$1("input-text")],InputText);var __defProp$y=Object.defineProperty,__getOwnPropDesc$y=Object.getOwnPropertyDescriptor,__decorateClass$y=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$y(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$y(C,T,K),K};let InputNumber=class extends s$2{constructor(){super(...arguments),this.name="",this.enabled=!0,this.onChange=$=>{const C=$.target;this.onValueChanged({value:C.value})},this.value=""}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}render(){return y$1`
            <p>Label</p>
            <input type="number" 
                           @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                   disabled=${this.enabled}
        ></input>`}};__decorateClass$y([e()],InputNumber.prototype,"name",2);__decorateClass$y([e()],InputNumber.prototype,"enabled",2);__decorateClass$y([e()],InputNumber.prototype,"onChange",2);__decorateClass$y([e()],InputNumber.prototype,"value",2);InputNumber=__decorateClass$y([e$1("input-number")],InputNumber);var __defProp$x=Object.defineProperty,__getOwnPropDesc$x=Object.getOwnPropertyDescriptor,__decorateClass$x=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$x(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$x(C,T,K),K};let DynamicForm=class extends s$2{constructor(){super(...arguments),this.avalue="5",this.componentName="input-text",this.onChange=$=>{const C=$.target;console.log("dynamic-form",C.value)},this.onSelect=$=>{const C=$.target;this.changeInput(C.value)}}changeInput($){this.componentName=$;const C=document.createElement(this.componentName),T=this.shadowRoot.getElementById("cxx"),V=C;V.onValueChanged=K=>{console.log("new value",K.value)},V.setValue("1111"),T.appendChild(C)}render(){return y$1`<h1>Hello ${this.avalue}</h1>
        
        <div>
            <select name="campo" id="campo" @change=${this.onSelect}>
                <option value="input-text">texto</option>
                <option value="input-number">número</option>
            </select>
        </div>
        
        <div id="cxx"></div>
        
        <slot></slot>`}};DynamicForm.styles=i$2`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;      
    }
  `;__decorateClass$x([e()],DynamicForm.prototype,"avalue",2);__decorateClass$x([e()],DynamicForm.prototype,"componentName",2);DynamicForm=__decorateClass$x([e$1("dynamic-form")],DynamicForm);const horizontalLayout=i$2`
  :host([theme~='margin']) {
    margin: var(--lumo-space-m);
  }

  :host([theme~='padding']) {
    padding: var(--lumo-space-m);
  }

  :host([theme~='spacing-xs']) {
    gap: var(--lumo-space-xs);
  }

  :host([theme~='spacing-s']) {
    gap: var(--lumo-space-s);
  }

  :host([theme~='spacing']) {
    gap: var(--lumo-space-m);
  }

  :host([theme~='spacing-l']) {
    gap: var(--lumo-space-l);
  }

  :host([theme~='spacing-xl']) {
    gap: var(--lumo-space-xl);
  }
`;registerStyles("vaadin-horizontal-layout",horizontalLayout,{moduleId:"lumo-horizontal-layout"});/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class HorizontalLayout extends ElementMixin(ThemableMixin(PolymerElement)){static get template(){return html`
      <style>
        :host {
          display: flex;
          box-sizing: border-box;
        }

        :host([hidden]) {
          display: none !important;
        }

        /* Theme variations */
        :host([theme~='margin']) {
          margin: 1em;
        }

        :host([theme~='padding']) {
          padding: 1em;
        }

        :host([theme~='spacing']) {
          gap: 1em;
        }
      </style>

      <slot></slot>
    `}static get is(){return"vaadin-horizontal-layout"}}customElements.define(HorizontalLayout.is,HorizontalLayout);var ViewType=($=>($.Form="Form",$.Crud="Crud",$.Result="Result",$))(ViewType||{});const mapInputTypeToFieldType=($,C)=>{switch(C){case"readonly":return"field-readonly";case"textarea":return"field-textarea";case"radiobuttons":return"field-radiobuttons";case"toggle":return"field-toggle";case"combobox":return"field-combobox";case"file":return"field-file";case"closedlist":return"field-closedlist"}switch($){case"string":return"field-text";case"long":return"field-number";case"int":return"field-number";case"double":return"field-double";case"enum":return"field-radiobuttons";case"boolean":return"field-boolean";case"date":return"field-date";case"datetime":return"field-datetime";case"time":return"field-time";case"file":return"field-file";case"ExternalReference":return"field-externalref";case"boolean[]":return"field-boolean-array";case"int[]":return"field-int-array";case"double[]":return"field-double-array";case"string[]":return"field-string-array";case"enum[]":return"field-enum-array";case"ExternalReference[]":return"field-externalref-array"}return"field-text"};registerStyles("vaadin-input-container",i$2`
    :host {
      border-radius: var(--lumo-border-radius-m);
      background-color: var(--lumo-contrast-10pct);
      padding: 0 calc(0.375em + var(--lumo-border-radius-m) / 4 - 1px);
      font-weight: 500;
      line-height: 1;
      position: relative;
      cursor: text;
      box-sizing: border-box;
    }

    /* Used for hover and activation effects */
    :host::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      border-radius: inherit;
      pointer-events: none;
      background-color: var(--lumo-contrast-50pct);
      opacity: 0;
      transition: transform 0.15s, opacity 0.2s;
      transform-origin: 100% 0;
    }

    ::slotted(:not([slot$='fix'])) {
      cursor: inherit;
      min-height: var(--lumo-text-field-size, var(--lumo-size-m));
      padding: 0 0.25em;
      --_lumo-text-field-overflow-mask-image: linear-gradient(to left, transparent, #000 1.25em);
      -webkit-mask-image: var(--_lumo-text-field-overflow-mask-image);
      mask-image: var(--_lumo-text-field-overflow-mask-image);
    }

    /* Read-only */
    :host([readonly]) {
      color: var(--lumo-secondary-text-color);
      background-color: transparent;
      cursor: default;
    }

    :host([readonly])::after {
      background-color: transparent;
      opacity: 1;
      border: 1px dashed var(--lumo-contrast-30pct);
    }

    /* Disabled */
    :host([disabled]) {
      background-color: var(--lumo-contrast-5pct);
    }

    :host([disabled]) ::slotted(*) {
      color: var(--lumo-disabled-text-color);
      -webkit-text-fill-color: var(--lumo-disabled-text-color);
    }

    /* Invalid */
    :host([invalid]) {
      background-color: var(--lumo-error-color-10pct);
    }

    :host([invalid])::after {
      background-color: var(--lumo-error-color-50pct);
    }

    /* Slotted icons */
    ::slotted(iron-icon),
    ::slotted(vaadin-icon) {
      color: var(--lumo-contrast-60pct);
      width: var(--lumo-icon-size-m);
      height: var(--lumo-icon-size-m);
    }

    /* Vaadin icons are based on a 16x16 grid (unlike Lumo and Material icons with 24x24), so they look too big by default */
    ::slotted(iron-icon[icon^='vaadin:']),
    ::slotted(vaadin-icon[icon^='vaadin:']) {
      padding: 0.25em;
      box-sizing: border-box !important;
    }

    /* Text align */
    :host([dir='rtl']) ::slotted(:not([slot$='fix'])) {
      --_lumo-text-field-overflow-mask-image: linear-gradient(to right, transparent, #000 1.25em);
    }

    @-moz-document url-prefix() {
      :host([dir='rtl']) ::slotted(:not([slot$='fix'])) {
        mask-image: var(--_lumo-text-field-overflow-mask-image);
      }
    }

    :host([theme~='align-left']) ::slotted(:not([slot$='fix'])) {
      text-align: start;
      --_lumo-text-field-overflow-mask-image: none;
    }

    :host([theme~='align-center']) ::slotted(:not([slot$='fix'])) {
      text-align: center;
      --_lumo-text-field-overflow-mask-image: none;
    }

    :host([theme~='align-right']) ::slotted(:not([slot$='fix'])) {
      text-align: end;
      --_lumo-text-field-overflow-mask-image: none;
    }

    @-moz-document url-prefix() {
      /* Firefox is smart enough to align overflowing text to right */
      :host([theme~='align-right']) ::slotted(:not([slot$='fix'])) {
        --_lumo-text-field-overflow-mask-image: linear-gradient(to right, transparent 0.25em, #000 1.5em);
      }
    }

    @-moz-document url-prefix() {
      /* Firefox is smart enough to align overflowing text to right */
      :host([theme~='align-left']) ::slotted(:not([slot$='fix'])) {
        --_lumo-text-field-overflow-mask-image: linear-gradient(to left, transparent 0.25em, #000 1.5em);
      }
    }

    /* RTL specific styles */
    :host([dir='rtl'])::after {
      transform-origin: 0% 0;
    }

    :host([theme~='align-left'][dir='rtl']) ::slotted(:not([slot$='fix'])) {
      --_lumo-text-field-overflow-mask-image: none;
    }

    :host([theme~='align-center'][dir='rtl']) ::slotted(:not([slot$='fix'])) {
      --_lumo-text-field-overflow-mask-image: none;
    }

    :host([theme~='align-right'][dir='rtl']) ::slotted(:not([slot$='fix'])) {
      --_lumo-text-field-overflow-mask-image: none;
    }

    @-moz-document url-prefix() {
      /* Firefox is smart enough to align overflowing text to right */
      :host([theme~='align-right'][dir='rtl']) ::slotted(:not([slot$='fix'])) {
        --_lumo-text-field-overflow-mask-image: linear-gradient(to right, transparent 0.25em, #000 1.5em);
      }
    }

    @-moz-document url-prefix() {
      /* Firefox is smart enough to align overflowing text to right */
      :host([theme~='align-left'][dir='rtl']) ::slotted(:not([slot$='fix'])) {
        --_lumo-text-field-overflow-mask-image: linear-gradient(to left, transparent 0.25em, #000 1.5em);
      }
    }
  `,{moduleId:"lumo-input-container"});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class InputContainer extends ThemableMixin(DirMixin$1(PolymerElement)){static get is(){return"vaadin-input-container"}static get template(){return html`
      <style>
        :host {
          display: flex;
          align-items: center;
          flex: 0 1 auto;
        }

        :host([hidden]) {
          display: none !important;
        }

        /* Reset the native input styles */
        ::slotted(input) {
          -webkit-appearance: none;
          -moz-appearance: none;
          flex: auto;
          white-space: nowrap;
          overflow: hidden;
          width: 100%;
          height: 100%;
          outline: none;
          margin: 0;
          padding: 0;
          border: 0;
          border-radius: 0;
          min-width: 0;
          font: inherit;
          line-height: normal;
          color: inherit;
          background-color: transparent;
          /* Disable default invalid style in Firefox */
          box-shadow: none;
        }

        ::slotted(*) {
          flex: none;
        }

        ::slotted(:is(input, textarea))::placeholder {
          /* Use ::slotted(input:placeholder-shown) in themes to style the placeholder. */
          /* because ::slotted(...)::placeholder does not work in Safari. */
          font: inherit;
          color: inherit;
          /* Override default opacity in Firefox */
          opacity: 1;
        }
      </style>
      <slot name="prefix"></slot>
      <slot></slot>
      <slot name="suffix"></slot>
    `}static get properties(){return{disabled:{type:Boolean,reflectToAttribute:!0},readonly:{type:Boolean,reflectToAttribute:!0},invalid:{type:Boolean,reflectToAttribute:!0}}}ready(){super.ready(),this.addEventListener("pointerdown",C=>{C.target===this&&C.preventDefault()}),this.addEventListener("click",C=>{C.target===this&&this.shadowRoot.querySelector("slot:not([name])").assignedNodes({flatten:!0}).forEach(T=>T.focus&&T.focus())})}}customElements.define(InputContainer.is,InputContainer);/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const helper=i$2`
  :host([has-helper]) [part='helper-text']::before {
    content: '';
    display: block;
    height: 0.4em;
  }

  [part='helper-text'] {
    display: block;
    color: var(--lumo-secondary-text-color);
    font-size: var(--lumo-font-size-xs);
    line-height: var(--lumo-line-height-xs);
    margin-left: calc(var(--lumo-border-radius-m) / 4);
    transition: color 0.2s;
  }

  :host(:hover:not([readonly])) [part='helper-text'] {
    color: var(--lumo-body-text-color);
  }

  :host([disabled]) [part='helper-text'] {
    color: var(--lumo-disabled-text-color);
    -webkit-text-fill-color: var(--lumo-disabled-text-color);
  }

  :host([has-helper][theme~='helper-above-field']) [part='helper-text']::before {
    display: none;
  }

  :host([has-helper][theme~='helper-above-field']) [part='helper-text']::after {
    content: '';
    display: block;
    height: 0.4em;
  }

  :host([has-helper][theme~='helper-above-field']) [part='label'] {
    order: 0;
    padding-bottom: 0.4em;
  }

  :host([has-helper][theme~='helper-above-field']) [part='helper-text'] {
    order: 1;
  }

  :host([has-helper][theme~='helper-above-field']) [part='label'] + * {
    order: 2;
  }

  :host([has-helper][theme~='helper-above-field']) [part='error-message'] {
    order: 3;
  }
`;/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const inputField=i$2`
  :host {
    --lumo-text-field-size: var(--lumo-size-m);
    color: var(--lumo-body-text-color);
    font-size: var(--lumo-font-size-m);
    font-family: var(--lumo-font-family);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
    padding: var(--lumo-space-xs) 0;
  }

  :host::before {
    height: var(--lumo-text-field-size);
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
  }

  :host([focused]:not([readonly])) [part='label'] {
    color: var(--lumo-primary-text-color);
  }

  :host([focused]) [part='input-field'] ::slotted(:is(input, textarea)) {
    -webkit-mask-image: none;
    mask-image: none;
  }

  ::slotted(:is(input, textarea):placeholder-shown) {
    color: var(--lumo-secondary-text-color);
  }

  /* Hover */
  :host(:hover:not([readonly]):not([focused])) [part='label'] {
    color: var(--lumo-body-text-color);
  }

  :host(:hover:not([readonly]):not([focused])) [part='input-field']::after {
    opacity: 0.1;
  }

  /* Touch device adjustment */
  @media (pointer: coarse) {
    :host(:hover:not([readonly]):not([focused])) [part='label'] {
      color: var(--lumo-secondary-text-color);
    }

    :host(:hover:not([readonly]):not([focused])) [part='input-field']::after {
      opacity: 0;
    }

    :host(:active:not([readonly]):not([focused])) [part='input-field']::after {
      opacity: 0.2;
    }
  }

  /* Trigger when not focusing using the keyboard */
  :host([focused]:not([focus-ring]):not([readonly])) [part='input-field']::after {
    transform: scaleX(0);
    transition-duration: 0.15s, 1s;
  }

  /* Focus-ring */
  :host([focus-ring]) [part='input-field'] {
    box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
  }

  /* Read-only and disabled */
  :host(:is([readonly], [disabled])) ::slotted(:is(input, textarea):placeholder-shown) {
    opacity: 0;
  }

  /* Disabled style */
  :host([disabled]) {
    pointer-events: none;
  }

  :host([disabled]) [part='label'],
  :host([disabled]) [part='input-field'] ::slotted(*) {
    color: var(--lumo-disabled-text-color);
    -webkit-text-fill-color: var(--lumo-disabled-text-color);
  }

  /* Invalid style */
  :host([invalid][focus-ring]) [part='input-field'] {
    box-shadow: 0 0 0 2px var(--lumo-error-color-50pct);
  }

  :host([input-prevented]) [part='input-field'] {
    animation: shake 0.15s infinite;
  }

  @keyframes shake {
    25% {
      transform: translateX(4px);
    }
    75% {
      transform: translateX(-4px);
    }
  }

  /* Small theme */
  :host([theme~='small']) {
    font-size: var(--lumo-font-size-s);
    --lumo-text-field-size: var(--lumo-size-s);
  }

  :host([theme~='small']) [part='label'] {
    font-size: var(--lumo-font-size-xs);
  }

  :host([theme~='small']) [part='error-message'] {
    font-size: var(--lumo-font-size-xxs);
  }

  /* Slotted content */
  [part='input-field'] ::slotted(:not(iron-icon):not(vaadin-icon):not(input):not(textarea)) {
    color: var(--lumo-secondary-text-color);
    font-weight: 400;
  }

  [part='clear-button']::before {
    content: var(--lumo-icons-cross);
  }
`,inputFieldShared$1=[requiredField,fieldButton,helper,inputField];registerStyles("",inputFieldShared$1,{moduleId:"lumo-input-field-shared-styles"});/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */registerStyles("vaadin-text-field",inputFieldShared$1,{moduleId:"lumo-text-field-styles"});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class InputController extends SlotController{constructor(C,T){super(C,"input",()=>document.createElement("input"),(V,K)=>{V.value&&K.setAttribute("value",V.value),V.type&&K.setAttribute("type",V.type),K.id=this.defaultId,typeof T=="function"&&T(K)},!0)}}/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const DelegateFocusMixin=dedupingMixin($=>class extends FocusMixin(TabindexMixin($)){static get properties(){return{autofocus:{type:Boolean},focusElement:{type:Object,readOnly:!0,observer:"_focusElementChanged"},_lastTabIndex:{value:0}}}constructor(){super(),this._boundOnBlur=this._onBlur.bind(this),this._boundOnFocus=this._onFocus.bind(this)}ready(){super.ready(),this.autofocus&&!this.disabled&&requestAnimationFrame(()=>{this.focus(),this.setAttribute("focus-ring","")})}focus(){!this.focusElement||this.disabled||(this.focusElement.focus(),this._setFocused(!0))}blur(){this.focusElement&&(this.focusElement.blur(),this._setFocused(!1))}click(){this.focusElement&&!this.disabled&&this.focusElement.click()}_focusElementChanged(T,V){T?(T.disabled=this.disabled,this._addFocusListeners(T),this.__forwardTabIndex(this.tabindex)):V&&this._removeFocusListeners(V)}_addFocusListeners(T){T.addEventListener("blur",this._boundOnBlur),T.addEventListener("focus",this._boundOnFocus)}_removeFocusListeners(T){T.removeEventListener("blur",this._boundOnBlur),T.removeEventListener("focus",this._boundOnFocus)}_onFocus(T){T.stopPropagation(),this.dispatchEvent(new Event("focus"))}_onBlur(T){T.stopPropagation(),this.dispatchEvent(new Event("blur"))}_shouldSetFocus(T){return T.target===this.focusElement}_disabledChanged(T,V){super._disabledChanged(T,V),this.focusElement&&(this.focusElement.disabled=T),T&&this.blur()}_tabindexChanged(T){this.__forwardTabIndex(T)}__forwardTabIndex(T){T!==void 0&&this.focusElement&&(this.focusElement.tabIndex=T,T!==-1&&(this.tabindex=void 0)),this.disabled&&T&&(T!==-1&&(this._lastTabIndex=T),this.tabindex=void 0)}});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class ErrorController extends SlotController{constructor(C){super(C,"error-message",()=>document.createElement("div"),(T,V)=>{this.__updateErrorId(V),this.__updateHasError()},!0)}get errorId(){return this.node&&this.node.id}setErrorMessage(C){this.errorMessage=C,this.__updateHasError()}setInvalid(C){this.invalid=C,this.__updateHasError()}initCustomNode(C){this.__updateErrorId(C),C.textContent&&!this.errorMessage&&(this.errorMessage=C.textContent.trim()),this.__updateHasError()}teardownNode(C){let T=this.getSlotChild();!T&&C!==this.defaultNode&&(T=this.attachDefaultNode(),this.initNode(T)),this.__updateHasError()}__isNotEmpty(C){return Boolean(C&&C.trim()!=="")}__updateHasError(){const C=this.node,T=Boolean(this.invalid&&this.__isNotEmpty(this.errorMessage));C&&(C.textContent=T?this.errorMessage:"",C.hidden=!T,T?C.setAttribute("role","alert"):C.removeAttribute("role")),this.host.toggleAttribute("has-error-message",T)}__updateErrorId(C){C.id||(C.id=this.defaultId)}}/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class FieldAriaController{constructor(C){this.host=C,this.__required=!1}setTarget(C){this.__target=C,this.__setAriaRequiredAttribute(this.__required),this.__setLabelIdToAriaAttribute(this.__labelId),this.__setErrorIdToAriaAttribute(this.__errorId),this.__setHelperIdToAriaAttribute(this.__helperId)}setRequired(C){this.__setAriaRequiredAttribute(C),this.__required=C}setLabelId(C){this.__setLabelIdToAriaAttribute(C,this.__labelId),this.__labelId=C}setErrorId(C){this.__setErrorIdToAriaAttribute(C,this.__errorId),this.__errorId=C}setHelperId(C){this.__setHelperIdToAriaAttribute(C,this.__helperId),this.__helperId=C}get __isGroupField(){return this.__target===this.host}__setLabelIdToAriaAttribute(C,T){this.__setAriaAttributeId("aria-labelledby",C,T)}__setErrorIdToAriaAttribute(C,T){this.__isGroupField?this.__setAriaAttributeId("aria-labelledby",C,T):this.__setAriaAttributeId("aria-describedby",C,T)}__setHelperIdToAriaAttribute(C,T){this.__isGroupField?this.__setAriaAttributeId("aria-labelledby",C,T):this.__setAriaAttributeId("aria-describedby",C,T)}__setAriaRequiredAttribute(C){this.__target&&(["input","textarea"].includes(this.__target.localName)||(C?this.__target.setAttribute("aria-required","true"):this.__target.removeAttribute("aria-required")))}__setAriaAttributeId(C,T,V){this.__target&&(V&&removeValueFromAttribute(this.__target,C,V),T&&addValueToAttribute(this.__target,C,T))}}/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class HelperController extends SlotController{constructor(C){super(C,"helper",null,null,!0)}get helperId(){return this.node&&this.node.id}initCustomNode(C){this.__updateHelperId(C),this.__observeHelper(C);const T=this.__hasHelper(C);this.__toggleHasHelper(T)}teardownNode(C){this.__helperIdObserver&&this.__helperIdObserver.disconnect();const T=this.getSlotChild();if(T&&T!==this.defaultNode){const V=this.__hasHelper(T);this.__toggleHasHelper(V)}else this.__applyDefaultHelper(this.helperText,T)}setHelperText(C){this.helperText=C;const T=this.getSlotChild();(!T||T===this.defaultNode)&&this.__applyDefaultHelper(C,T)}__hasHelper(C){return C?C.children.length>0||C.nodeType===Node.ELEMENT_NODE&&customElements.get(C.localName)||this.__isNotEmpty(C.textContent):!1}__isNotEmpty(C){return C&&C.trim()!==""}__applyDefaultHelper(C,T){const V=this.__isNotEmpty(C);V&&!T&&(this.slotFactory=()=>document.createElement("div"),T=this.attachDefaultNode(),this.__updateHelperId(T),this.__observeHelper(T)),T&&(T.textContent=C),this.__toggleHasHelper(V)}__observeHelper(C){this.__helperObserver=new MutationObserver(T=>{T.forEach(V=>{const K=V.target,Y=K===this.node;if(V.type==="attributes")Y&&K.id!==this.defaultId&&this.__updateHelperId(K);else if(Y||K.parentElement===this.node){const J=this.__hasHelper(this.node);this.__toggleHasHelper(J)}})}),this.__helperObserver.observe(C,{attributes:!0,attributeFilter:["id"],childList:!0,subtree:!0,characterData:!0})}__toggleHasHelper(C){this.host.toggleAttribute("has-helper",C),this.dispatchEvent(new CustomEvent("helper-changed",{detail:{hasHelper:C,node:this.node}}))}__updateHelperId(C){C.id||(C.id=this.defaultId)}}/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class LabelController extends SlotController{constructor(C){super(C,"label",()=>document.createElement("label"),(T,V)=>{this.__updateLabelId(V),this.__updateDefaultLabel(this.label),this.__observeLabel(V)},!0)}get labelId(){return this.node.id}initCustomNode(C){this.__updateLabelId(C);const T=this.__hasLabel(C);this.__toggleHasLabel(T)}teardownNode(C){this.__labelObserver&&this.__labelObserver.disconnect();let T=this.getSlotChild();!T&&C!==this.defaultNode&&(T=this.attachDefaultNode(),this.initNode(T));const V=this.__hasLabel(T);this.__toggleHasLabel(V)}setLabel(C){this.label=C,this.__updateDefaultLabel(C)}__hasLabel(C){return C?C.children.length>0||this.__isNotEmpty(C.textContent):!1}__isNotEmpty(C){return Boolean(C&&C.trim()!=="")}__observeLabel(C){this.__labelObserver=new MutationObserver(T=>{T.forEach(V=>{const K=V.target,Y=K===this.node;if(V.type==="attributes")Y&&K.id!==this.defaultId&&this.__updateLabelId(K);else if(Y||K.parentElement===this.node){const J=this.__hasLabel(this.node);this.__toggleHasLabel(J)}})}),this.__labelObserver.observe(C,{attributes:!0,attributeFilter:["id"],childList:!0,subtree:!0,characterData:!0})}__toggleHasLabel(C){this.host.toggleAttribute("has-label",C),this.dispatchEvent(new CustomEvent("label-changed",{detail:{hasLabel:C,node:this.node}}))}__updateDefaultLabel(C){if(this.defaultNode&&(this.defaultNode.textContent=C,this.defaultNode===this.node)){const T=this.__isNotEmpty(C);this.__toggleHasLabel(T)}}__updateLabelId(C){C.id||(C.id=this.defaultId)}}/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const LabelMixin=dedupingMixin($=>class extends ControllerMixin($){static get properties(){return{label:{type:String,observer:"_labelChanged"}}}get _labelId(){return this._labelController.labelId}get _labelNode(){return this._labelController.node}constructor(){super(),this._labelController=new LabelController(this)}ready(){super.ready(),this.addController(this._labelController)}_labelChanged(T){this._labelController.setLabel(T)}});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ValidateMixin=dedupingMixin($=>class extends ${static get properties(){return{invalid:{type:Boolean,reflectToAttribute:!0,notify:!0,value:!1},required:{type:Boolean,reflectToAttribute:!0}}}validate(){const T=this.checkValidity();return this._setInvalid(!T),this.dispatchEvent(new CustomEvent("validated",{detail:{valid:T}})),T}checkValidity(){return!this.required||!!this.value}_setInvalid(T){this._shouldSetInvalid(T)&&(this.invalid=T)}_shouldSetInvalid(T){return!0}});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const FieldMixin=$=>class extends ValidateMixin(LabelMixin(ControllerMixin($))){static get properties(){return{ariaTarget:{type:Object,observer:"_ariaTargetChanged"},errorMessage:{type:String,observer:"_errorMessageChanged"},helperText:{type:String,observer:"_helperTextChanged"}}}static get observers(){return["_invalidChanged(invalid)","_requiredChanged(required)"]}get _errorId(){return this._errorController.errorId}get _errorNode(){return this._errorController.node}get _helperId(){return this._helperController.helperId}get _helperNode(){return this._helperController.node}constructor(){super(),this._fieldAriaController=new FieldAriaController(this),this._helperController=new HelperController(this),this._errorController=new ErrorController(this),this._labelController.addEventListener("label-changed",T=>{const{hasLabel:V,node:K}=T.detail;this.__labelChanged(V,K)}),this._helperController.addEventListener("helper-changed",T=>{const{hasHelper:V,node:K}=T.detail;this.__helperChanged(V,K)})}ready(){super.ready(),this.addController(this._fieldAriaController),this.addController(this._helperController),this.addController(this._errorController)}__helperChanged(T,V){T?this._fieldAriaController.setHelperId(V.id):this._fieldAriaController.setHelperId(null)}__labelChanged(T,V){T?this._fieldAriaController.setLabelId(V.id):this._fieldAriaController.setLabelId(null)}_errorMessageChanged(T){this._errorController.setErrorMessage(T)}_helperTextChanged(T){this._helperController.setHelperText(T)}_ariaTargetChanged(T){T&&this._fieldAriaController.setTarget(T)}_requiredChanged(T){this._fieldAriaController.setRequired(T)}_invalidChanged(T){this._errorController.setInvalid(T),setTimeout(()=>{T?this._fieldAriaController.setErrorId(this._errorController.errorId):this._fieldAriaController.setErrorId(null)})}};/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const DelegateStateMixin=dedupingMixin($=>class extends ${static get properties(){return{stateTarget:{type:Object,observer:"_stateTargetChanged"}}}static get delegateAttrs(){return[]}static get delegateProps(){return[]}ready(){super.ready(),this._createDelegateAttrsObserver(),this._createDelegatePropsObserver()}_stateTargetChanged(T){T&&(this._ensureAttrsDelegated(),this._ensurePropsDelegated())}_createDelegateAttrsObserver(){this._createMethodObserver(`_delegateAttrsChanged(${this.constructor.delegateAttrs.join(", ")})`)}_createDelegatePropsObserver(){this._createMethodObserver(`_delegatePropsChanged(${this.constructor.delegateProps.join(", ")})`)}_ensureAttrsDelegated(){this.constructor.delegateAttrs.forEach(T=>{this._delegateAttribute(T,this[T])})}_ensurePropsDelegated(){this.constructor.delegateProps.forEach(T=>{this._delegateProperty(T,this[T])})}_delegateAttrsChanged(...T){this.constructor.delegateAttrs.forEach((V,K)=>{this._delegateAttribute(V,T[K])})}_delegatePropsChanged(...T){this.constructor.delegateProps.forEach((V,K)=>{this._delegateProperty(V,T[K])})}_delegateAttribute(T,V){this.stateTarget&&(T==="invalid"&&this._delegateAttribute("aria-invalid",V?"true":!1),typeof V=="boolean"?this.stateTarget.toggleAttribute(T,V):V?this.stateTarget.setAttribute(T,V):this.stateTarget.removeAttribute(T))}_delegateProperty(T,V){this.stateTarget&&(this.stateTarget[T]=V)}});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const InputMixin=dedupingMixin($=>class extends ${static get properties(){return{inputElement:{type:Object,readOnly:!0,observer:"_inputElementChanged"},type:{type:String,readOnly:!0},value:{type:String,value:"",observer:"_valueChanged",notify:!0},_hasInputValue:{type:Boolean,value:!1,observer:"_hasInputValueChanged"}}}constructor(){super(),this._boundOnInput=this.__onInput.bind(this),this._boundOnChange=this._onChange.bind(this)}clear(){this.value=""}_addInputListeners(T){T.addEventListener("input",this._boundOnInput),T.addEventListener("change",this._boundOnChange)}_removeInputListeners(T){T.removeEventListener("input",this._boundOnInput),T.removeEventListener("change",this._boundOnChange)}_forwardInputValue(T){this.inputElement&&(T!=null?this.inputElement.value=T:this.inputElement.value="")}_inputElementChanged(T,V){T?this._addInputListeners(T):V&&this._removeInputListeners(V)}_hasInputValueChanged(T,V){(T||V)&&this.dispatchEvent(new CustomEvent("has-input-value-changed"))}__onInput(T){this._setHasInputValue(T),this._onInput(T)}_onInput(T){const V=T.composedPath()[0];this.__userInput=T.isTrusted,this.value=V.value,this.__userInput=!1}_onChange(T){}_toggleHasValue(T){this.toggleAttribute("has-value",T)}_valueChanged(T,V){this._toggleHasValue(this._hasValue),!(T===""&&V===void 0)&&(this.__userInput||this._forwardInputValue(T))}get _hasValue(){return this.value!=null&&this.value!==""}_setHasInputValue(T){const V=T.composedPath()[0];this._hasInputValue=V.value.length>0}});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const InputConstraintsMixin=dedupingMixin($=>class extends DelegateStateMixin(ValidateMixin(InputMixin($))){static get constraints(){return["required"]}static get delegateAttrs(){return[...super.delegateAttrs,"required"]}ready(){super.ready(),this._createConstraintsObserver()}checkValidity(){return this.inputElement&&this._hasValidConstraints(this.constructor.constraints.map(T=>this[T]))?this.inputElement.checkValidity():!this.invalid}_hasValidConstraints(T){return T.some(V=>this.__isValidConstraint(V))}_createConstraintsObserver(){this._createMethodObserver(`_constraintsChanged(stateTarget, ${this.constructor.constraints.join(", ")})`)}_constraintsChanged(T,...V){if(!T)return;const K=this._hasValidConstraints(V),Y=this.__previousHasConstraints&&!K;(this._hasValue||this.invalid)&&K?this.validate():Y&&this._setInvalid(!1),this.__previousHasConstraints=K}_onChange(T){T.stopPropagation(),this.validate(),this.dispatchEvent(new CustomEvent("change",{detail:{sourceEvent:T},bubbles:T.bubbles,cancelable:T.cancelable}))}__isValidConstraint(T){return Boolean(T)||T===0}});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const stylesMap=new WeakMap;function getRootStyles($){return stylesMap.has($)||stylesMap.set($,new Set),stylesMap.get($)}function insertStyles($,C){const T=document.createElement("style");T.textContent=$,C===document?document.head.appendChild(T):C.insertBefore(T,C.firstChild)}const SlotStylesMixin=dedupingMixin($=>class extends ${get slotStyles(){return{}}connectedCallback(){super.connectedCallback(),this.__applySlotStyles()}__applySlotStyles(){const T=this.getRootNode(),V=getRootStyles(T);this.slotStyles.forEach(K=>{V.has(K)||(insertStyles(K,T),V.add(K))})}});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const InputControlMixin=$=>class extends SlotStylesMixin(DelegateFocusMixin(InputConstraintsMixin(FieldMixin(KeyboardMixin($))))){static get properties(){return{allowedCharPattern:{type:String,observer:"_allowedCharPatternChanged"},autoselect:{type:Boolean,value:!1},clearButtonVisible:{type:Boolean,reflectToAttribute:!0,value:!1},name:{type:String,reflectToAttribute:!0},placeholder:{type:String,reflectToAttribute:!0},readonly:{type:Boolean,value:!1,reflectToAttribute:!0},title:{type:String,reflectToAttribute:!0}}}static get delegateAttrs(){return[...super.delegateAttrs,"name","type","placeholder","readonly","invalid","title"]}constructor(){super(),this._boundOnPaste=this._onPaste.bind(this),this._boundOnDrop=this._onDrop.bind(this),this._boundOnBeforeInput=this._onBeforeInput.bind(this)}get clearElement(){return console.warn(`Please implement the 'clearElement' property in <${this.localName}>`),null}get slotStyles(){return[`
          :is(input[slot='input'], textarea[slot='textarea'])::placeholder {
            font: inherit;
            color: inherit;
          }
        `]}ready(){super.ready(),this.clearElement&&this.clearElement.addEventListener("click",T=>this._onClearButtonClick(T))}_onClearButtonClick(T){T.preventDefault(),this.inputElement.focus(),this.__clear()}_onFocus(T){super._onFocus(T),this.autoselect&&this.inputElement&&this.inputElement.select()}_onEscape(T){super._onEscape(T),this.clearButtonVisible&&this.value&&(T.stopPropagation(),this.__clear())}_onChange(T){T.stopPropagation(),this.validate(),this.dispatchEvent(new CustomEvent("change",{detail:{sourceEvent:T},bubbles:T.bubbles,cancelable:T.cancelable}))}__clear(){this.clear(),this.inputElement.dispatchEvent(new Event("input",{bubbles:!0,composed:!0})),this.inputElement.dispatchEvent(new Event("change",{bubbles:!0}))}_addInputListeners(T){super._addInputListeners(T),T.addEventListener("paste",this._boundOnPaste),T.addEventListener("drop",this._boundOnDrop),T.addEventListener("beforeinput",this._boundOnBeforeInput)}_removeInputListeners(T){super._removeInputListeners(T),T.removeEventListener("paste",this._boundOnPaste),T.removeEventListener("drop",this._boundOnDrop),T.removeEventListener("beforeinput",this._boundOnBeforeInput)}_onKeyDown(T){super._onKeyDown(T),this.allowedCharPattern&&!this.__shouldAcceptKey(T)&&(T.preventDefault(),this._markInputPrevented())}_markInputPrevented(){this.setAttribute("input-prevented",""),this._preventInputDebouncer=Debouncer$1.debounce(this._preventInputDebouncer,timeOut.after(200),()=>{this.removeAttribute("input-prevented")})}__shouldAcceptKey(T){return T.metaKey||T.ctrlKey||!T.key||T.key.length!==1||this.__allowedCharRegExp.test(T.key)}_onPaste(T){if(this.allowedCharPattern){const V=T.clipboardData.getData("text");this.__allowedTextRegExp.test(V)||(T.preventDefault(),this._markInputPrevented())}}_onDrop(T){if(this.allowedCharPattern){const V=T.dataTransfer.getData("text");this.__allowedTextRegExp.test(V)||(T.preventDefault(),this._markInputPrevented())}}_onBeforeInput(T){this.allowedCharPattern&&T.data&&!this.__allowedTextRegExp.test(T.data)&&(T.preventDefault(),this._markInputPrevented())}_allowedCharPatternChanged(T){if(T)try{this.__allowedCharRegExp=new RegExp(`^${T}$`),this.__allowedTextRegExp=new RegExp(`^${T}*$`)}catch(V){console.error(V)}}};/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const InputFieldMixin=$=>class extends InputControlMixin($){static get properties(){return{autocomplete:{type:String},autocorrect:{type:String},autocapitalize:{type:String,reflectToAttribute:!0}}}static get delegateAttrs(){return[...super.delegateAttrs,"autocapitalize","autocomplete","autocorrect"]}_inputElementChanged(T){super._inputElementChanged(T),T&&(T.value&&T.value!==this.value&&(console.warn(`Please define value on the <${this.localName}> component!`),T.value=""),this.value&&(T.value=this.value))}get __data(){return this.__dataValue||{}}set __data(T){this.__dataValue=T}_setFocused(T){super._setFocused(T),T||this.validate()}_onInput(T){super._onInput(T),this.invalid&&this.validate()}_valueChanged(T,V){super._valueChanged(T,V),V!==void 0&&this.invalid&&this.validate()}};/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class LabelledInputController{constructor(C,T){this.input=C,this.__preventDuplicateLabelClick=this.__preventDuplicateLabelClick.bind(this),T.addEventListener("label-changed",V=>{this.__initLabel(V.detail.node)}),this.__initLabel(T.node)}__initLabel(C){C&&(C.addEventListener("click",this.__preventDuplicateLabelClick),this.input&&C.setAttribute("for",this.input.id))}__preventDuplicateLabelClick(){const C=T=>{T.stopImmediatePropagation(),this.input.removeEventListener("click",C)};this.input.addEventListener("click",C)}}/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const PatternMixin=$=>class extends InputConstraintsMixin($){static get properties(){return{pattern:{type:String},preventInvalidInput:{type:Boolean,observer:"_preventInvalidInputChanged"}}}static get delegateAttrs(){return[...super.delegateAttrs,"pattern"]}static get constraints(){return[...super.constraints,"pattern"]}_checkInputValue(){if(this.preventInvalidInput){const T=this.inputElement;T&&T.value.length>0&&!this.checkValidity()&&(T.value=this.value||"",this.setAttribute("input-prevented",""),this._inputDebouncer=Debouncer$1.debounce(this._inputDebouncer,timeOut.after(200),()=>{this.removeAttribute("input-prevented")}))}}_onInput(T){this._checkInputValue(),super._onInput(T)}_preventInvalidInputChanged(T){T&&console.warn('WARNING: Since Vaadin 23.2, "preventInvalidInput" is deprecated. Please use "allowedCharPattern" instead.')}};/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd..
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const clearButton=i$2`
  [part='clear-button'] {
    display: none;
    cursor: default;
  }

  [part='clear-button']::before {
    content: '✕';
  }

  :host([clear-button-visible][has-value]:not([disabled]):not([readonly])) [part='clear-button'] {
    display: block;
  }
`;/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd..
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const fieldShared=i$2`
  :host {
    display: inline-flex;
    outline: none;
  }

  :host::before {
    content: '\\2003';
    width: 0;
    display: inline-block;
    /* Size and position this element on the same vertical position as the input-field element
          to make vertical align for the host element work as expected */
  }

  :host([hidden]) {
    display: none !important;
  }

  :host(:not([has-label])) [part='label'] {
    display: none;
  }
`;/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd..
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const inputFieldContainer=i$2`
  [class$='container'] {
    display: flex;
    flex-direction: column;
    min-width: 100%;
    max-width: 100%;
    width: var(--vaadin-field-default-width, 12em);
  }
`;/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd..
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const inputFieldShared=[fieldShared,inputFieldContainer,clearButton];/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */registerStyles("vaadin-text-field",inputFieldShared,{moduleId:"vaadin-text-field-styles"});class TextField extends PatternMixin(InputFieldMixin(ThemableMixin(ElementMixin(PolymerElement)))){static get is(){return"vaadin-text-field"}static get template(){return html`
      <style>
        [part='input-field'] {
          flex-grow: 0;
        }
      </style>

      <div class="vaadin-field-container">
        <div part="label">
          <slot name="label"></slot>
          <span part="required-indicator" aria-hidden="true" on-click="focus"></span>
        </div>

        <vaadin-input-container
          part="input-field"
          readonly="[[readonly]]"
          disabled="[[disabled]]"
          invalid="[[invalid]]"
          theme$="[[_theme]]"
        >
          <slot name="prefix" slot="prefix"></slot>
          <slot name="input"></slot>
          <slot name="suffix" slot="suffix"></slot>
          <div id="clearButton" part="clear-button" slot="suffix" aria-hidden="true"></div>
        </vaadin-input-container>

        <div part="helper-text">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>
      <slot name="tooltip"></slot>
    `}static get properties(){return{maxlength:{type:Number},minlength:{type:Number}}}static get delegateAttrs(){return[...super.delegateAttrs,"maxlength","minlength"]}static get constraints(){return[...super.constraints,"maxlength","minlength"]}constructor(){super(),this._setType("text")}get clearElement(){return this.$.clearButton}ready(){super.ready(),this.addController(new InputController(this,C=>{this._setInputElement(C),this._setFocusElement(C),this.stateTarget=C,this.ariaTarget=C})),this.addController(new LabelledInputController(this.inputElement,this._labelController)),this._tooltipController=new TooltipController(this),this._tooltipController.setPosition("top"),this.addController(this._tooltipController)}}customElements.define(TextField.is,TextField);/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */console.warn('WARNING: Since Vaadin 23.2, "@vaadin/vaadin-text-field" is deprecated. Use "@vaadin/text-field" instead.');var __defProp$w=Object.defineProperty,__getOwnPropDesc$w=Object.getOwnPropertyDescriptor,__decorateClass$w=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$w(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$w(C,T,K),K};let FieldText=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="",this.name="",this.onChange=$=>{const C=$.target;this.onValueChanged({value:C.value})},this.enabled=!0}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){this.placeholder=$}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}render(){return y$1`
            <vaadin-text-field
                label="${this.label}"
                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                ?required=${this.required}
                placeholder="${this.placeholder}"
            ></vaadin-text-field>
            `}};FieldText.styles=i$2`
        vaadin-text-field {
            width: 100%;
        }
    `;__decorateClass$w([e()],FieldText.prototype,"required",2);__decorateClass$w([e()],FieldText.prototype,"label",2);__decorateClass$w([e()],FieldText.prototype,"placeholder",2);__decorateClass$w([e()],FieldText.prototype,"name",2);__decorateClass$w([e()],FieldText.prototype,"onChange",2);__decorateClass$w([e()],FieldText.prototype,"value",2);__decorateClass$w([e()],FieldText.prototype,"enabled",2);__decorateClass$w([e()],FieldText.prototype,"field",2);FieldText=__decorateClass$w([e$1("field-text")],FieldText);/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const numberField=i$2`
  :host {
    width: 8em;
  }

  :host([step-buttons-visible]:not([theme~='align-right'])) ::slotted(input),
  :host([has-controls]:not([theme~='align-right'])) ::slotted(input) {
    text-align: center;
  }

  [part$='button'][disabled] {
    opacity: 0.2;
  }

  :host([step-buttons-visible]) [part='input-field'],
  :host([has-controls]) [part='input-field'] {
    padding: 0;
  }

  [part\$='button'] {
    cursor: pointer;
    font-size: var(--lumo-icon-size-s);
    width: 1.6em;
    height: 1.6em;
  }

  [part\$='button']::before {
    margin-top: 0.3em;
  }

  [part='decrease-button']::before {
    content: var(--lumo-icons-minus);
  }

  [part='increase-button']::before {
    content: var(--lumo-icons-plus);
  }

  /* RTL specific styles */
  :host([dir='rtl']:not([theme~='align-right'])) ::slotted(input) {
    --_lumo-text-field-overflow-mask-image: linear-gradient(to left, transparent, #000 1.25em);
  }
`;registerStyles("vaadin-number-field",[inputFieldShared$1,fieldButton,numberField],{moduleId:"lumo-number-field"});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */registerStyles("vaadin-number-field",inputFieldShared,{moduleId:"vaadin-number-field-styles"});class NumberField extends InputFieldMixin(ThemableMixin(ElementMixin(PolymerElement))){static get is(){return"vaadin-number-field"}static get template(){return html`
      <style>
        :host([readonly]) [part$='button'] {
          pointer-events: none;
        }

        [part='decrease-button']::before {
          content: '−';
        }

        [part='increase-button']::before {
          content: '+';
        }

        [part='decrease-button'],
        [part='increase-button'] {
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
        }

        :host([dir='rtl']) [part='input-field'] {
          direction: ltr;
        }
      </style>

      <div class="vaadin-field-container">
        <div part="label">
          <slot name="label"></slot>
          <span part="required-indicator" aria-hidden="true" on-click="focus"></span>
        </div>

        <vaadin-input-container
          part="input-field"
          readonly="[[readonly]]"
          disabled="[[disabled]]"
          invalid="[[invalid]]"
          theme$="[[_theme]]"
        >
          <div
            disabled$="[[!_allowed(-1, value, min, max, step)]]"
            part="decrease-button"
            on-click="_decreaseValue"
            on-touchend="_decreaseButtonTouchend"
            hidden$="[[!_isStepButtonVisible(hasControls, stepButtonsVisible)]]"
            aria-hidden="true"
            slot="prefix"
          ></div>
          <slot name="prefix" slot="prefix"></slot>
          <slot name="input"></slot>
          <slot name="suffix" slot="suffix"></slot>
          <div id="clearButton" part="clear-button" slot="suffix" aria-hidden="true"></div>
          <div
            disabled$="[[!_allowed(1, value, min, max, step)]]"
            part="increase-button"
            on-click="_increaseValue"
            on-touchend="_increaseButtonTouchend"
            hidden$="[[!_isStepButtonVisible(hasControls, stepButtonsVisible)]]"
            aria-hidden="true"
            slot="suffix"
          ></div>
        </vaadin-input-container>

        <div part="helper-text">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>

      <slot name="tooltip"></slot>
    `}static get properties(){return{hasControls:{type:Boolean,value:!1,reflectToAttribute:!0},stepButtonsVisible:{type:Boolean,value:!1,reflectToAttribute:!0},min:{type:Number},max:{type:Number},step:{type:Number}}}static get observers(){return["_stepChanged(step, inputElement)"]}static get delegateProps(){return[...super.delegateProps,"min","max"]}static get constraints(){return[...super.constraints,"min","max","step"]}constructor(){super(),this._setType("number")}get slotStyles(){const C=this.localName;return[...super.slotStyles,`
        ${C} input[type="number"]::-webkit-outer-spin-button,
        ${C} input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        ${C} input[type="number"] {
          -moz-appearance: textfield;
        }

        ${C}[dir='rtl'] input[type="number"]::placeholder {
          direction: rtl;
        }

        ${C}[dir='rtl']:not([step-buttons-visible]):not([has-controls]) input[type="number"]::placeholder {
          text-align: left;
        }
      `]}get clearElement(){return this.$.clearButton}ready(){super.ready(),this.addController(new InputController(this,C=>{this._setInputElement(C),this._setFocusElement(C),this.stateTarget=C,this.ariaTarget=C})),this.addController(new LabelledInputController(this.inputElement,this._labelController)),this._tooltipController=new TooltipController(this),this.addController(this._tooltipController),this._tooltipController.setPosition("top")}checkValidity(){return this.inputElement?this.inputElement.checkValidity():!this.invalid}_decreaseButtonTouchend(C){C.preventDefault(),this._decreaseValue()}_increaseButtonTouchend(C){C.preventDefault(),this._increaseValue()}_decreaseValue(){this._incrementValue(-1)}_increaseValue(){this._incrementValue(1)}_incrementValue(C){if(this.disabled||this.readonly)return;const T=this.step||1;let V=parseFloat(this.value);this.value?V<this.min?(C=0,V=this.min):V>this.max&&(C=0,V=this.max):this.min===0&&C<0||this.max===0&&C>0||this.max===0&&this.min===0?(C=0,V=0):(this.max==null||this.max>=0)&&(this.min==null||this.min<=0)?V=0:this.min>0?(V=this.min,this.max<0&&C<0&&(V=this.max),C=0):this.max<0&&(V=this.max,C<0?C=0:this._getIncrement(1,V-T)>this.max?V-=2*T:V-=T);const K=this._getIncrement(C,V);(!this.value||C===0||this._incrementIsInsideTheLimits(C,V))&&this._setValue(K)}_setValue(C){this.value=this.inputElement.value=String(parseFloat(C)),this.dispatchEvent(new CustomEvent("change",{bubbles:!0}))}_getIncrement(C,T){let V=this.step||1,K=this.min||0;const Y=Math.max(this._getMultiplier(T),this._getMultiplier(V),this._getMultiplier(K));V*=Y,T=Math.round(T*Y),K*=Y;const J=(T-K)%V;return C>0?(T-J+V)/Y:C<0?(T-(J||V))/Y:T/Y}_getDecimalCount(C){const T=String(C),V=T.indexOf(".");return V===-1?1:T.length-V-1}_getMultiplier(C){if(!isNaN(C))return 10**this._getDecimalCount(C)}_incrementIsInsideTheLimits(C,T){return C<0?this.min==null||this._getIncrement(C,T)>=this.min:C>0?this.max==null||this._getIncrement(C,T)<=this.max:this._getIncrement(C,T)<=this.max&&this._getIncrement(C,T)>=this.min}_allowed(C){const T=C*(this.step||1),V=parseFloat(this.value);return!this.value||!this.disabled&&this._incrementIsInsideTheLimits(T,V)}_stepChanged(C,T){T&&(T.step=C||"any")}_valueChanged(C,T){C&&isNaN(parseFloat(C))?this.value="":typeof this.value!="string"&&(this.value=String(this.value)),super._valueChanged(this.value,T)}_onKeyDown(C){C.key==="ArrowUp"?(C.preventDefault(),this._increaseValue()):C.key==="ArrowDown"&&(C.preventDefault(),this._decreaseValue()),super._onKeyDown(C)}_isStepButtonVisible(C,T){return C||T}_setHasInputValue(C){const T=C.composedPath()[0];this._hasInputValue=T.value.length>0||T.validity.badInput}}customElements.define(NumberField.is,NumberField);/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class IntegerField extends NumberField{static get is(){return"vaadin-integer-field"}constructor(){super(),this.allowedCharPattern="[-+\\d]"}_valueChanged(C,T){if(C!==""&&!this.__isInteger(C)){console.warn(`Trying to set non-integer value "${C}" to <vaadin-integer-field>. Clearing the value.`),this.value="";return}super._valueChanged(C,T)}_stepChanged(C,T){if(C!=null&&!this.__hasOnlyDigits(C)){console.warn(`<vaadin-integer-field> The \`step\` property must be a positive integer but \`${C}\` was provided, so the property was reset to \`null\`.`),this.step=null;return}super._stepChanged(C,T)}__isInteger(C){return/^(-\d)?\d*$/.test(String(C))}__hasOnlyDigits(C){return/^\d+$/.test(String(C))}}customElements.define(IntegerField.is,IntegerField);var __defProp$v=Object.defineProperty,__getOwnPropDesc$v=Object.getOwnPropertyDescriptor,__decorateClass$v=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$v(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$v(C,T,K),K};let FieldNumber=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="",this.name="",this.enabled=!0,this.onChange=$=>{const C=$.target;this.onValueChanged({value:C.value})},this.value=""}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){this.placeholder=$}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}render(){return y$1`
            <vaadin-integer-field
                    label="${this.label}"
                    @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                    ?disabled=${!this.enabled}
                    ?required=${this.required}
                    step-buttons-visible
                    min="0"
                    max="100"
                    placeholder="${this.placeholder}"
            ></vaadin-integer-field>
        `}};FieldNumber.styles=i$2`
        vaadin-integer-field {
            width: 100%;
        }
    `;__decorateClass$v([e()],FieldNumber.prototype,"required",2);__decorateClass$v([e()],FieldNumber.prototype,"label",2);__decorateClass$v([e()],FieldNumber.prototype,"placeholder",2);__decorateClass$v([e()],FieldNumber.prototype,"name",2);__decorateClass$v([e()],FieldNumber.prototype,"enabled",2);__decorateClass$v([e()],FieldNumber.prototype,"field",2);__decorateClass$v([e()],FieldNumber.prototype,"onChange",2);__decorateClass$v([e()],FieldNumber.prototype,"value",2);FieldNumber=__decorateClass$v([e$1("field-number")],FieldNumber);var __defProp$u=Object.defineProperty,__getOwnPropDesc$u=Object.getOwnPropertyDescriptor,__decorateClass$u=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$u(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$u(C,T,K),K};let FieldDouble=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="",this.name="",this.enabled=!0,this.onChange=$=>{const C=$.target;this.onValueChanged({value:C.value})},this.value=""}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){this.placeholder=$}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}render(){return y$1`
            <vaadin-number-field
                    label="${this.label}"
                    @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                    ?disabled=${!this.enabled}
                    ?required=${this.required}
                    placeholder="${this.placeholder}"
            ></vaadin-number-field>
        `}};FieldDouble.styles=i$2`
        vaadin-number-field {
            width: 100%;
        }
    `;__decorateClass$u([e()],FieldDouble.prototype,"required",2);__decorateClass$u([e()],FieldDouble.prototype,"label",2);__decorateClass$u([e()],FieldDouble.prototype,"placeholder",2);__decorateClass$u([e()],FieldDouble.prototype,"name",2);__decorateClass$u([e()],FieldDouble.prototype,"enabled",2);__decorateClass$u([e()],FieldDouble.prototype,"field",2);__decorateClass$u([e()],FieldDouble.prototype,"onChange",2);__decorateClass$u([e()],FieldDouble.prototype,"value",2);FieldDouble=__decorateClass$u([e$1("field-double")],FieldDouble);registerStyles("vaadin-radio-button",i$2`
    :host {
      color: var(--lumo-body-text-color);
      font-size: var(--lumo-font-size-m);
      font-family: var(--lumo-font-family);
      line-height: var(--lumo-line-height-s);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      -webkit-tap-highlight-color: transparent;
      -webkit-user-select: none;
      -moz-user-select: none;
      user-select: none;
      cursor: default;
      outline: none;
      --_radio-button-size: var(--vaadin-radio-button-size, calc(var(--lumo-size-m) / 2));
    }

    :host([has-label]) ::slotted(label) {
      padding-block: var(--lumo-space-xs);
      padding-inline: var(--lumo-space-xs) var(--lumo-space-s);
    }

    [part='radio'] {
      width: var(--_radio-button-size);
      height: var(--_radio-button-size);
      margin: var(--lumo-space-xs);
      position: relative;
      border-radius: 50%;
      background-color: var(--lumo-contrast-20pct);
      transition: transform 0.2s cubic-bezier(0.12, 0.32, 0.54, 2), background-color 0.15s;
      will-change: transform;
      cursor: var(--lumo-clickable-cursor);
    }

    /* Used for activation "halo" */
    [part='radio']::before {
      pointer-events: none;
      color: transparent;
      width: 100%;
      height: 100%;
      line-height: var(--_radio-button-size);
      border-radius: inherit;
      background-color: inherit;
      transform: scale(1.4);
      opacity: 0;
      transition: transform 0.1s, opacity 0.8s;
      will-change: transform, opacity;
    }

    /* Used for the dot */
    [part='radio']::after {
      content: '';
      pointer-events: none;
      width: 0;
      height: 0;
      border: 3px solid var(--lumo-primary-contrast-color);
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      transition: 0.25s transform;
      will-change: transform;
      background-clip: content-box;
    }

    :host([checked]) [part='radio'] {
      background-color: var(--lumo-primary-color);
    }

    :host([checked]) [part='radio']::after {
      transform: translate(-50%, -50%) scale(1);
    }

    :host(:not([checked]):not([disabled]):hover) [part='radio'] {
      background-color: var(--lumo-contrast-30pct);
    }

    :host([active]) [part='radio'] {
      transform: scale(0.9);
      transition-duration: 0.05s;
    }

    :host([active][checked]) [part='radio'] {
      transform: scale(1.1);
    }

    :host([active]:not([checked])) [part='radio']::before {
      transition-duration: 0.01s, 0.01s;
      transform: scale(0);
      opacity: 0.4;
    }

    :host([focus-ring]) [part='radio'] {
      box-shadow: 0 0 0 1px var(--lumo-base-color), 0 0 0 3px var(--lumo-primary-color-50pct);
    }

    :host([disabled]) {
      pointer-events: none;
      color: var(--lumo-disabled-text-color);
    }

    :host([disabled]) ::slotted(label) {
      color: inherit;
    }

    :host([disabled]) [part='radio'] {
      background-color: var(--lumo-contrast-10pct);
    }

    :host([disabled]) [part='radio']::after {
      border-color: var(--lumo-contrast-30pct);
    }

    /* RTL specific styles */
    :host([dir='rtl'][has-label]) ::slotted(label) {
      padding: var(--lumo-space-xs) var(--lumo-space-xs) var(--lumo-space-xs) var(--lumo-space-s);
    }
  `,{moduleId:"lumo-radio-button"});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const CheckedMixin=dedupingMixin($=>class extends DelegateStateMixin(DisabledMixin(InputMixin($))){static get properties(){return{checked:{type:Boolean,value:!1,notify:!0,reflectToAttribute:!0}}}static get delegateProps(){return[...super.delegateProps,"checked"]}_onChange(T){const V=T.target;this._toggleChecked(V.checked),isElementFocused(V)||V.focus()}_toggleChecked(T){this.checked=T}});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class SlotTargetController{constructor(C,T,V){this.sourceSlot=C,this.targetFactory=T,this.copyCallback=V,C&&C.addEventListener("slotchange",()=>{this.__copying?this.__copying=!1:this.__checkAndCopyNodesToSlotTarget()})}hostConnected(){this.__sourceSlotObserver=new MutationObserver(()=>this.__checkAndCopyNodesToSlotTarget()),this.__copying||this.__checkAndCopyNodesToSlotTarget()}__checkAndCopyNodesToSlotTarget(){this.__sourceSlotObserver.disconnect();const C=this.targetFactory();if(!C)return;this.__slotTargetClones&&(this.__slotTargetClones.forEach(V=>{V.parentElement===C&&C.removeChild(V)}),delete this.__slotTargetClones);const T=this.sourceSlot.assignedNodes({flatten:!0}).filter(V=>!(V.nodeType===Node.TEXT_NODE&&V.textContent.trim()===""));T.length>0&&(C.innerHTML="",this.__copying=!0,this.__copyNodesToSlotTarget(T,C))}__copyNodesToSlotTarget(C,T){this.__slotTargetClones=this.__slotTargetClones||[],C.forEach(V=>{const K=V.cloneNode(!0);this.__slotTargetClones.push(K),T.appendChild(K),this.__sourceSlotObserver.observe(V,{attributes:!0,childList:!0,subtree:!0,characterData:!0})}),typeof this.copyCallback=="function"&&this.copyCallback(C)}}/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class RadioButton extends LabelMixin(CheckedMixin(DelegateFocusMixin(ActiveMixin(ElementMixin(ThemableMixin(ControllerMixin(PolymerElement))))))){static get is(){return"vaadin-radio-button"}static get template(){return html`
      <style>
        :host {
          display: inline-block;
        }

        :host([hidden]) {
          display: none !important;
        }

        :host([disabled]) {
          -webkit-tap-highlight-color: transparent;
        }

        .vaadin-radio-button-container {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: baseline;
        }

        [part='radio'],
        ::slotted(input),
        ::slotted(label) {
          grid-row: 1;
        }

        [part='radio'],
        ::slotted(input) {
          grid-column: 1;
        }

        [part='radio'] {
          width: var(--vaadin-radio-button-size, 1em);
          height: var(--vaadin-radio-button-size, 1em);
        }

        [part='radio']::before {
          display: block;
          content: '\\202F';
          line-height: var(--vaadin-radio-button-size, 1em);
          contain: paint;
        }

        /* visually hidden */
        ::slotted(input) {
          opacity: 0;
          cursor: inherit;
          margin: 0;
          align-self: stretch;
          -webkit-appearance: none;
        }
      </style>
      <div class="vaadin-radio-button-container">
        <div part="radio"></div>
        <slot name="input"></slot>
        <slot name="label"></slot>

        <div style="display: none !important">
          <slot id="noop"></slot>
        </div>
      </div>
    `}static get properties(){return{name:{type:String,value:""}}}static get delegateAttrs(){return[...super.delegateAttrs,"name"]}constructor(){super(),this._setType("radio"),this.value="on"}ready(){super.ready(),this.addController(new InputController(this,C=>{this._setInputElement(C),this._setFocusElement(C),this.stateTarget=C,this.ariaTarget=C})),this.addController(new LabelledInputController(this.inputElement,this._labelController)),this.addController(new SlotTargetController(this.$.noop,()=>this._labelController.node,()=>this.__warnDeprecated()))}__warnDeprecated(){console.warn(`WARNING: Since Vaadin 22, placing the label as a direct child of a <vaadin-radio-button> is deprecated.
  Please use <label slot="label"> wrapper or the label property instead.`)}}customElements.define(RadioButton.is,RadioButton);const radioGroup=i$2`
  :host {
    color: var(--lumo-body-text-color);
    font-size: var(--lumo-font-size-m);
    font-family: var(--lumo-font-family);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
    padding: var(--lumo-space-xs) 0;
  }

  :host::before {
    /* Effective height of vaadin-radio-button */
    height: var(--lumo-size-s);
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
  }

  :host([theme~='vertical']) [part='group-field'] {
    display: flex;
    flex-direction: column;
  }

  :host([focused]:not([readonly])) [part='label'] {
    color: var(--lumo-primary-text-color);
  }

  :host(:hover:not([readonly]):not([focused])) [part='label'],
  :host(:hover:not([readonly])) [part='helper-text'] {
    color: var(--lumo-body-text-color);
  }

  /* Touch device adjustment */
  @media (pointer: coarse) {
    :host(:hover:not([readonly]):not([focused])) [part='label'] {
      color: var(--lumo-secondary-text-color);
    }
  }
`;registerStyles("vaadin-radio-group",[requiredField,helper,radioGroup],{moduleId:"lumo-radio-group"});/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class RadioGroup extends FieldMixin(FocusMixin(DisabledMixin(KeyboardMixin(ElementMixin(ThemableMixin(PolymerElement)))))){static get is(){return"vaadin-radio-group"}static get template(){return html`
      <style>
        :host {
          display: inline-flex;
        }

        :host::before {
          content: '\\2003';
          width: 0;
          display: inline-block;
        }

        :host([hidden]) {
          display: none !important;
        }

        .vaadin-group-field-container {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        :host(:not([has-label])) [part='label'] {
          display: none;
        }
      </style>
      <div class="vaadin-group-field-container">
        <div part="label">
          <slot name="label"></slot>
          <span part="required-indicator" aria-hidden="true"></span>
        </div>

        <div part="group-field">
          <slot></slot>
        </div>

        <div part="helper-text">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>

      <slot name="tooltip"></slot>
    `}static get properties(){return{value:{type:String,notify:!0,value:"",observer:"__valueChanged"},readonly:{type:Boolean,value:!1,reflectToAttribute:!0,observer:"__readonlyChanged"},_fieldName:{type:String}}}constructor(){super(),this.__registerRadioButton=this.__registerRadioButton.bind(this),this.__unregisterRadioButton=this.__unregisterRadioButton.bind(this),this.__onRadioButtonCheckedChange=this.__onRadioButtonCheckedChange.bind(this)}ready(){super.ready(),this.ariaTarget=this,this.setAttribute("role","radiogroup"),this._fieldName=`${this.localName}-${generateUniqueId()}`,this._observer=new FlattenedNodesObserver(this,({addedNodes:C,removedNodes:T})=>{this.__filterRadioButtons(C).reverse().forEach(this.__registerRadioButton),this.__filterRadioButtons(T).forEach(this.__unregisterRadioButton)}),this._tooltipController=new TooltipController(this),this.addController(this._tooltipController)}__filterRadioButtons(C){return C.filter(T=>T instanceof RadioButton)}get __radioButtons(){return this.__filterRadioButtons([...this.children])}get __selectedRadioButton(){return this.__radioButtons.find(C=>C.checked)}get isHorizontalRTL(){return this.getAttribute("dir")==="rtl"&&this._theme!=="vertical"}_onKeyDown(C){super._onKeyDown(C);const T=C.composedPath().find(V=>V instanceof RadioButton);["ArrowLeft","ArrowUp"].includes(C.key)&&(C.preventDefault(),this.__selectNextRadioButton(T)),["ArrowRight","ArrowDown"].includes(C.key)&&(C.preventDefault(),this.__selectPrevRadioButton(T))}_invalidChanged(C){super._invalidChanged(C),C?this.setAttribute("aria-invalid","true"):this.removeAttribute("aria-invalid")}__selectNextRadioButton(C){const T=this.__radioButtons.indexOf(C);this.__selectIncRadioButton(T,this.isHorizontalRTL?1:-1)}__selectPrevRadioButton(C){const T=this.__radioButtons.indexOf(C);this.__selectIncRadioButton(T,this.isHorizontalRTL?-1:1)}__selectIncRadioButton(C,T){const V=(this.__radioButtons.length+C+T)%this.__radioButtons.length,K=this.__radioButtons[V];K.disabled?this.__selectIncRadioButton(V,T):(K.focusElement.focus(),K.focusElement.click())}__registerRadioButton(C){C.name=this._fieldName,C.addEventListener("checked-changed",this.__onRadioButtonCheckedChange),(this.disabled||this.readonly)&&(C.disabled=!0),C.checked&&this.__selectRadioButton(C)}__unregisterRadioButton(C){C.removeEventListener("checked-changed",this.__onRadioButtonCheckedChange),C.value===this.value&&this.__selectRadioButton(null)}__onRadioButtonCheckedChange(C){C.target.checked&&this.__selectRadioButton(C.target)}__valueChanged(C,T){if(!(T===void 0&&C==="")){if(C){const V=this.__radioButtons.find(K=>K.value===C);V?(this.__selectRadioButton(V),this.toggleAttribute("has-value",!0)):console.warn(`The radio button with the value "${C}" was not found.`)}else this.__selectRadioButton(null),this.removeAttribute("has-value");T!==void 0&&this.validate()}}__readonlyChanged(C,T){!C&&T===void 0||T!==C&&this.__updateRadioButtonsDisabledProperty()}_disabledChanged(C,T){super._disabledChanged(C,T),!(!C&&T===void 0)&&T!==C&&this.__updateRadioButtonsDisabledProperty()}_shouldRemoveFocus(C){return!this.contains(C.relatedTarget)}_setFocused(C){super._setFocused(C),C||this.validate()}__selectRadioButton(C){C?this.value=C.value:this.value="",this.__radioButtons.forEach(T=>{T.checked=T===C}),this.readonly&&this.__updateRadioButtonsDisabledProperty()}__updateRadioButtonsDisabledProperty(){this.__radioButtons.forEach(C=>{this.readonly?C.disabled=C!==this.__selectedRadioButton:C.disabled=this.disabled})}}customElements.define(RadioGroup.is,RadioGroup);var __defProp$t=Object.defineProperty,__getOwnPropDesc$t=Object.getOwnPropertyDescriptor,__decorateClass$t=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$t(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$t(C,T,K),K};let FieldRadiobuttons=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="",this.name="",this.onChange=$=>{const C=$.target;this.onValueChanged({value:C.value})},this.enabled=!0}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){this.placeholder=$}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}render(){return y$1`
            <vaadin-radio-group label="${this.label}" theme="vertical"
                                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                                ?required=${this.required}
                                placeholder="${this.placeholder}"
            >
                ${this.field.attributes.filter($=>$.key=="choice").map($=>$.value).map($=>y$1`
                    <vaadin-radio-button value=${$.value} label=${$.key}></vaadin-radio-button>
                    `)}
            </vaadin-radio-group>
            `}};__decorateClass$t([e()],FieldRadiobuttons.prototype,"required",2);__decorateClass$t([e()],FieldRadiobuttons.prototype,"label",2);__decorateClass$t([e()],FieldRadiobuttons.prototype,"placeholder",2);__decorateClass$t([e()],FieldRadiobuttons.prototype,"name",2);__decorateClass$t([e()],FieldRadiobuttons.prototype,"onChange",2);__decorateClass$t([e()],FieldRadiobuttons.prototype,"value",2);__decorateClass$t([e()],FieldRadiobuttons.prototype,"enabled",2);__decorateClass$t([e()],FieldRadiobuttons.prototype,"field",2);FieldRadiobuttons=__decorateClass$t([e$1("field-radiobuttons")],FieldRadiobuttons);registerStyles("vaadin-checkbox",i$2`
    :host {
      color: var(--lumo-body-text-color);
      font-size: var(--lumo-font-size-m);
      font-family: var(--lumo-font-family);
      line-height: var(--lumo-line-height-s);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      -webkit-tap-highlight-color: transparent;
      -webkit-user-select: none;
      -moz-user-select: none;
      user-select: none;
      cursor: default;
      outline: none;
      --_checkbox-size: var(--vaadin-checkbox-size, calc(var(--lumo-size-m) / 2));
    }

    :host([has-label]) ::slotted(label) {
      padding-block: var(--lumo-space-xs);
      padding-inline: var(--lumo-space-xs) var(--lumo-space-s);
    }

    [part='checkbox'] {
      width: var(--_checkbox-size);
      height: var(--_checkbox-size);
      margin: var(--lumo-space-xs);
      position: relative;
      border-radius: var(--lumo-border-radius-s);
      background-color: var(--lumo-contrast-20pct);
      transition: transform 0.2s cubic-bezier(0.12, 0.32, 0.54, 2), background-color 0.15s;
      cursor: var(--lumo-clickable-cursor);
    }

    :host([indeterminate]) [part='checkbox'],
    :host([checked]) [part='checkbox'] {
      background-color: var(--lumo-primary-color);
    }

    /* Checkmark */
    [part='checkbox']::after {
      pointer-events: none;
      font-family: 'lumo-icons';
      content: var(--lumo-icons-checkmark);
      color: var(--lumo-primary-contrast-color);
      font-size: calc(var(--_checkbox-size) + 2px);
      line-height: 1;
      position: absolute;
      top: -1px;
      left: -1px;
      contain: content;
      opacity: 0;
    }

    :host([checked]) [part='checkbox']::after {
      opacity: 1;
    }

    /* Indeterminate checkmark */
    :host([indeterminate]) [part='checkbox']::after {
      content: '';
      opacity: 1;
      top: 45%;
      height: 10%;
      left: 22%;
      right: 22%;
      width: auto;
      border: 0;
      background-color: var(--lumo-primary-contrast-color);
    }

    /* Focus ring */
    :host([focus-ring]) [part='checkbox'] {
      box-shadow: 0 0 0 1px var(--lumo-base-color), 0 0 0 3px var(--lumo-primary-color-50pct);
    }

    /* Disabled */
    :host([disabled]) {
      pointer-events: none;
      color: var(--lumo-disabled-text-color);
    }

    :host([disabled]) ::slotted(label) {
      color: inherit;
    }

    :host([disabled]) [part='checkbox'] {
      background-color: var(--lumo-contrast-10pct);
    }

    :host([disabled]) [part='checkbox']::after {
      color: var(--lumo-contrast-30pct);
    }

    :host([indeterminate][disabled]) [part='checkbox']::after {
      background-color: var(--lumo-contrast-30pct);
    }

    /* RTL specific styles */
    :host([dir='rtl'][has-label]) ::slotted(label) {
      padding: var(--lumo-space-xs) var(--lumo-space-xs) var(--lumo-space-xs) var(--lumo-space-s);
    }

    /* Used for activation "halo" */
    [part='checkbox']::before {
      pointer-events: none;
      color: transparent;
      width: 100%;
      height: 100%;
      line-height: var(--_checkbox-size);
      border-radius: inherit;
      background-color: inherit;
      transform: scale(1.4);
      opacity: 0;
      transition: transform 0.1s, opacity 0.8s;
    }

    /* Hover */
    :host(:not([checked]):not([indeterminate]):not([disabled]):hover) [part='checkbox'] {
      background-color: var(--lumo-contrast-30pct);
    }

    /* Disable hover for touch devices */
    @media (pointer: coarse) {
      :host(:not([checked]):not([indeterminate]):not([disabled]):hover) [part='checkbox'] {
        background-color: var(--lumo-contrast-20pct);
      }
    }

    /* Active */
    :host([active]) [part='checkbox'] {
      transform: scale(0.9);
      transition-duration: 0.05s;
    }

    :host([active][checked]) [part='checkbox'] {
      transform: scale(1.1);
    }

    :host([active]:not([checked])) [part='checkbox']::before {
      transition-duration: 0.01s, 0.01s;
      transform: scale(0);
      opacity: 0.4;
    }
  `,{moduleId:"lumo-checkbox"});/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Checkbox extends LabelMixin(CheckedMixin(DelegateFocusMixin(ActiveMixin(ElementMixin(ThemableMixin(ControllerMixin(PolymerElement))))))){static get is(){return"vaadin-checkbox"}static get template(){return html`
      <style>
        :host {
          display: inline-block;
        }

        :host([hidden]) {
          display: none !important;
        }

        :host([disabled]) {
          -webkit-tap-highlight-color: transparent;
        }

        .vaadin-checkbox-container {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: baseline;
        }

        [part='checkbox'],
        ::slotted(input),
        ::slotted(label) {
          grid-row: 1;
        }

        [part='checkbox'],
        ::slotted(input) {
          grid-column: 1;
        }

        [part='checkbox'] {
          width: var(--vaadin-checkbox-size, 1em);
          height: var(--vaadin-checkbox-size, 1em);
        }

        [part='checkbox']::before {
          display: block;
          content: '\\202F';
          line-height: var(--vaadin-checkbox-size, 1em);
          contain: paint;
        }

        /* visually hidden */
        ::slotted(input) {
          opacity: 0;
          cursor: inherit;
          margin: 0;
          align-self: stretch;
          -webkit-appearance: none;
        }
      </style>
      <div class="vaadin-checkbox-container">
        <div part="checkbox"></div>
        <slot name="input"></slot>
        <slot name="label"></slot>

        <div style="display: none !important">
          <slot id="noop"></slot>
        </div>
      </div>
      <slot name="tooltip"></slot>
    `}static get properties(){return{indeterminate:{type:Boolean,notify:!0,value:!1,reflectToAttribute:!0},name:{type:String,value:""}}}static get delegateProps(){return[...super.delegateProps,"indeterminate"]}static get delegateAttrs(){return[...super.delegateAttrs,"name"]}constructor(){super(),this._setType("checkbox"),this.value="on"}ready(){super.ready(),this.addController(new InputController(this,C=>{this._setInputElement(C),this._setFocusElement(C),this.stateTarget=C,this.ariaTarget=C})),this.addController(new LabelledInputController(this.inputElement,this._labelController)),this.addController(new SlotTargetController(this.$.noop,()=>this._labelController.node,()=>this.__warnDeprecated())),this._tooltipController=new TooltipController(this),this.addController(this._tooltipController)}__warnDeprecated(){console.warn(`WARNING: Since Vaadin 22, placing the label as a direct child of a <vaadin-checkbox> is deprecated.
Please use <label slot="label"> wrapper or the label property instead.`)}_shouldSetActive(C){return C.target.localName==="a"?!1:super._shouldSetActive(C)}_toggleChecked(C){this.indeterminate&&(this.indeterminate=!1),super._toggleChecked(C)}}customElements.define(Checkbox.is,Checkbox);/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */console.warn('WARNING: Since Vaadin 23.2, "@vaadin/vaadin-checkbox" is deprecated. Use "@vaadin/checkbox" instead.');const checkboxGroup=i$2`
  :host {
    color: var(--lumo-body-text-color);
    font-size: var(--lumo-font-size-m);
    font-family: var(--lumo-font-family);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
    padding: var(--lumo-space-xs) 0;
  }

  :host::before {
    /* Effective height of vaadin-checkbox */
    height: var(--lumo-size-s);
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
  }

  :host([theme~='vertical']) [part='group-field'] {
    display: flex;
    flex-direction: column;
  }

  :host([disabled]) [part='label'] {
    color: var(--lumo-disabled-text-color);
    -webkit-text-fill-color: var(--lumo-disabled-text-color);
  }

  :host([focused]:not([disabled])) [part='label'] {
    color: var(--lumo-primary-text-color);
  }

  :host(:hover:not([disabled]):not([focused])) [part='label'],
  :host(:hover:not([disabled]):not([focused])) [part='helper-text'] {
    color: var(--lumo-body-text-color);
  }

  /* Touch device adjustment */
  @media (pointer: coarse) {
    :host(:hover:not([disabled]):not([focused])) [part='label'] {
      color: var(--lumo-secondary-text-color);
    }
  }
`;registerStyles("vaadin-checkbox-group",[requiredField,helper,checkboxGroup],{moduleId:"lumo-checkbox-group"});/**
 * @license
 * Copyright (c) 2018 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class CheckboxGroup extends FieldMixin(FocusMixin(DisabledMixin(ElementMixin(ThemableMixin(PolymerElement))))){static get is(){return"vaadin-checkbox-group"}static get template(){return html`
      <style>
        :host {
          display: inline-flex;
        }

        :host::before {
          content: '\\2003';
          width: 0;
          display: inline-block;
        }

        :host([hidden]) {
          display: none !important;
        }

        .vaadin-group-field-container {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        :host(:not([has-label])) [part='label'] {
          display: none;
        }
      </style>

      <div class="vaadin-group-field-container">
        <div part="label">
          <slot name="label"></slot>
          <span part="required-indicator" aria-hidden="true"></span>
        </div>

        <div part="group-field">
          <slot></slot>
        </div>

        <div part="helper-text">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>

      <slot name="tooltip"></slot>
    `}static get properties(){return{value:{type:Array,value:()=>[],notify:!0,observer:"__valueChanged"}}}constructor(){super(),this.__registerCheckbox=this.__registerCheckbox.bind(this),this.__unregisterCheckbox=this.__unregisterCheckbox.bind(this),this.__onCheckboxCheckedChanged=this.__onCheckboxCheckedChanged.bind(this)}ready(){super.ready(),this.ariaTarget=this,this.setAttribute("role","group"),this._observer=new FlattenedNodesObserver(this,({addedNodes:C,removedNodes:T})=>{const V=this.__filterCheckboxes(C),K=this.__filterCheckboxes(T);V.forEach(this.__registerCheckbox),K.forEach(this.__unregisterCheckbox),this.__warnOfCheckboxesWithoutValue(V)}),this._tooltipController=new TooltipController(this),this.addController(this._tooltipController)}checkValidity(){return!this.required||this.value.length>0}__filterCheckboxes(C){return C.filter(T=>T instanceof Checkbox)}get __checkboxes(){return this.__filterCheckboxes([...this.children])}__warnOfCheckboxesWithoutValue(C){C.some(V=>{const{value:K}=V;return!V.hasAttribute("value")&&(!K||K==="on")})&&console.warn("Please provide the value attribute to all the checkboxes inside the checkbox group.")}__registerCheckbox(C){C.addEventListener("checked-changed",this.__onCheckboxCheckedChanged),this.disabled&&(C.disabled=!0),C.checked?this.__addCheckboxToValue(C.value):this.value.includes(C.value)&&(C.checked=!0)}__unregisterCheckbox(C){C.removeEventListener("checked-changed",this.__onCheckboxCheckedChanged),C.checked&&this.__removeCheckboxFromValue(C.value)}_disabledChanged(C,T){super._disabledChanged(C,T),!(!C&&T===void 0)&&T!==C&&this.__checkboxes.forEach(V=>{V.disabled=C})}__addCheckboxToValue(C){this.value.includes(C)||(this.value=[...this.value,C])}__removeCheckboxFromValue(C){this.value.includes(C)&&(this.value=this.value.filter(T=>T!==C))}__onCheckboxCheckedChanged(C){const T=C.target;T.checked?this.__addCheckboxToValue(T.value):this.__removeCheckboxFromValue(T.value)}__valueChanged(C,T){C.length===0&&T===void 0||(this.toggleAttribute("has-value",C.length>0),this.__checkboxes.forEach(V=>{V.checked=C.includes(V.value)}),T!==void 0&&this.validate())}_shouldRemoveFocus(C){return!this.contains(C.relatedTarget)}_setFocused(C){super._setFocused(C),C||this.validate()}}customElements.define(CheckboxGroup.is,CheckboxGroup);var __defProp$s=Object.defineProperty,__getOwnPropDesc$s=Object.getOwnPropertyDescriptor,__decorateClass$s=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$s(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$s(C,T,K),K};let FieldBoolean=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="",this.name="",this.onChange=$=>{const C=$.target;this.onValueChanged({value:C.checked})},this.enabled=!0}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){this.placeholder=$}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}render(){return y$1`
            <vaadin-checkbox-group label="${this.label}" theme="vertical">
                <vaadin-checkbox label="Yes"
            @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                                 ?required=${this.required}
                                 placeholder="${this.placeholder}"
                ></vaadin-checkbox>
            </vaadin-checkbox-group>
            `}};__decorateClass$s([e()],FieldBoolean.prototype,"required",2);__decorateClass$s([e()],FieldBoolean.prototype,"label",2);__decorateClass$s([e()],FieldBoolean.prototype,"placeholder",2);__decorateClass$s([e()],FieldBoolean.prototype,"name",2);__decorateClass$s([e()],FieldBoolean.prototype,"onChange",2);__decorateClass$s([e()],FieldBoolean.prototype,"value",2);__decorateClass$s([e()],FieldBoolean.prototype,"enabled",2);__decorateClass$s([e()],FieldBoolean.prototype,"field",2);FieldBoolean=__decorateClass$s([e$1("field-boolean")],FieldBoolean);registerStyles("vaadin-overlay",overlay,{moduleId:"lumo-vaadin-overlay"});/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/function mutablePropertyChange($,C,T,V,K){let Y;K&&(Y=typeof T=="object"&&T!==null,Y&&(V=$.__dataTemp[C]));let J=V!==T&&(V===V||T===T);return Y&&J&&($.__dataTemp[C]=T),J}const MutableData=dedupingMixin($=>{class C extends ${_shouldPropertyChange(V,K,Y){return mutablePropertyChange(this,V,K,Y,!0)}}return C}),OptionalMutableData=dedupingMixin($=>{class C extends ${static get properties(){return{mutableData:Boolean}}_shouldPropertyChange(V,K,Y){return mutablePropertyChange(this,V,K,Y,this.mutableData)}}return C});MutableData._mutablePropertyChange=mutablePropertyChange;/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/let newInstance=null;function HTMLTemplateElementExtension(){return newInstance}HTMLTemplateElementExtension.prototype=Object.create(HTMLTemplateElement.prototype,{constructor:{value:HTMLTemplateElementExtension,writable:!0}});const DataTemplate=PropertyEffects(HTMLTemplateElementExtension),MutableDataTemplate=MutableData(DataTemplate);function upgradeTemplate($,C){newInstance=$,Object.setPrototypeOf($,C.prototype),new C,newInstance=null}const templateInstanceBase=PropertyEffects(class{});function showHideChildren($,C){for(let T=0;T<C.length;T++){let V=C[T];if(Boolean($)!=Boolean(V.__hideTemplateChildren__))if(V.nodeType===Node.TEXT_NODE)$?(V.__polymerTextContent__=V.textContent,V.textContent=""):V.textContent=V.__polymerTextContent__;else if(V.localName==="slot")if($)V.__polymerReplaced__=document.createComment("hidden-slot"),wrap$1(wrap$1(V).parentNode).replaceChild(V.__polymerReplaced__,V);else{const K=V.__polymerReplaced__;K&&wrap$1(wrap$1(K).parentNode).replaceChild(V,K)}else V.style&&($?(V.__polymerDisplay__=V.style.display,V.style.display="none"):V.style.display=V.__polymerDisplay__);V.__hideTemplateChildren__=$,V._showHideChildren&&V._showHideChildren($)}}class TemplateInstanceBase extends templateInstanceBase{constructor(C){super(),this._configureProperties(C),this.root=this._stampTemplate(this.__dataHost);let T=[];this.children=T;for(let K=this.root.firstChild;K;K=K.nextSibling)T.push(K),K.__templatizeInstance=this;this.__templatizeOwner&&this.__templatizeOwner.__hideTemplateChildren__&&this._showHideChildren(!0);let V=this.__templatizeOptions;(C&&V.instanceProps||!V.instanceProps)&&this._enableProperties()}_configureProperties(C){if(this.__templatizeOptions.forwardHostProp)for(let V in this.__hostProps)this._setPendingProperty(V,this.__dataHost["_host_"+V]);for(let V in C)this._setPendingProperty(V,C[V])}forwardHostProp(C,T){this._setPendingPropertyOrPath(C,T,!1,!0)&&this.__dataHost._enqueueClient(this)}_addEventListenerToNode(C,T,V){if(this._methodHost&&this.__templatizeOptions.parentModel)this._methodHost._addEventListenerToNode(C,T,K=>{K.model=this,V(K)});else{let K=this.__dataHost.__dataHost;K&&K._addEventListenerToNode(C,T,V)}}_showHideChildren(C){showHideChildren(C,this.children)}_setUnmanagedPropertyToNode(C,T,V){C.__hideTemplateChildren__&&C.nodeType==Node.TEXT_NODE&&T=="textContent"?C.__polymerTextContent__=V:super._setUnmanagedPropertyToNode(C,T,V)}get parentModel(){let C=this.__parentModel;if(!C){let T;C=this;do C=C.__dataHost.__dataHost;while((T=C.__templatizeOptions)&&!T.parentModel);this.__parentModel=C}return C}dispatchEvent(C){return!0}}TemplateInstanceBase.prototype.__dataHost;TemplateInstanceBase.prototype.__templatizeOptions;TemplateInstanceBase.prototype._methodHost;TemplateInstanceBase.prototype.__templatizeOwner;TemplateInstanceBase.prototype.__hostProps;const MutableTemplateInstanceBase=MutableData(TemplateInstanceBase);function findMethodHost($){let C=$.__dataHost;return C&&C._methodHost||C}function createTemplatizerClass($,C,T){let V=T.mutableData?MutableTemplateInstanceBase:TemplateInstanceBase;templatize.mixin&&(V=templatize.mixin(V));let K=class extends V{};return K.prototype.__templatizeOptions=T,K.prototype._bindTemplate($),addNotifyEffects(K,$,C,T),K}function addPropagateEffects($,C,T,V){let K=T.forwardHostProp;if(K&&C.hasHostProps){const Y=$.localName=="template";let J=C.templatizeTemplateClass;if(!J){if(Y){let te=T.mutableData?MutableDataTemplate:DataTemplate;class ie extends te{}J=C.templatizeTemplateClass=ie}else{const te=$.constructor;class ie extends te{}J=C.templatizeTemplateClass=ie}let ee=C.hostProps;for(let te in ee)J.prototype._addPropertyEffect("_host_"+te,J.prototype.PROPERTY_EFFECT_TYPES.PROPAGATE,{fn:createForwardHostPropEffect(te,K)}),J.prototype._createNotifyingProperty("_host_"+te);legacyWarnings&&V&&warnOnUndeclaredProperties(C,T,V)}if($.__dataProto&&Object.assign($.__data,$.__dataProto),Y)upgradeTemplate($,J),$.__dataTemp={},$.__dataPending=null,$.__dataOld=null,$._enableProperties();else{Object.setPrototypeOf($,J.prototype);const ee=C.hostProps;for(let te in ee)if(te="_host_"+te,te in $){const ie=$[te];delete $[te],$.__data[te]=ie}}}}function createForwardHostPropEffect($,C){return function(V,K,Y){C.call(V.__templatizeOwner,K.substring(6),Y[K])}}function addNotifyEffects($,C,T,V){let K=T.hostProps||{};for(let Y in V.instanceProps){delete K[Y];let J=V.notifyInstanceProp;J&&$.prototype._addPropertyEffect(Y,$.prototype.PROPERTY_EFFECT_TYPES.NOTIFY,{fn:createNotifyInstancePropEffect(Y,J)})}if(V.forwardHostProp&&C.__dataHost)for(let Y in K)T.hasHostProps||(T.hasHostProps=!0),$.prototype._addPropertyEffect(Y,$.prototype.PROPERTY_EFFECT_TYPES.NOTIFY,{fn:createNotifyHostPropEffect()})}function createNotifyInstancePropEffect($,C){return function(V,K,Y){C.call(V.__templatizeOwner,V,K,Y[K])}}function createNotifyHostPropEffect(){return function(C,T,V){C.__dataHost._setPendingPropertyOrPath("_host_"+T,V[T],!0,!0)}}function templatize($,C,T){if(strictTemplatePolicy&&!findMethodHost($))throw new Error("strictTemplatePolicy: template owner not trusted");if(T=T||{},$.__templatizeOwner)throw new Error("A <template> can only be templatized once");$.__templatizeOwner=C;let K=(C?C.constructor:TemplateInstanceBase)._parseTemplate($),Y=K.templatizeInstanceClass;Y||(Y=createTemplatizerClass($,K,T),K.templatizeInstanceClass=Y);const J=findMethodHost($);addPropagateEffects($,K,T,J);let ee=class extends Y{};return ee.prototype._methodHost=J,ee.prototype.__dataHost=$,ee.prototype.__templatizeOwner=C,ee.prototype.__hostProps=K.hostProps,ee=ee,ee}function warnOnUndeclaredProperties($,C,T){const V=T.constructor._properties,{propertyEffects:K}=$,{instanceProps:Y}=C;for(let J in K)if(!V[J]&&!(Y&&Y[J])){const ee=K[J];for(let te=0;te<ee.length;te++){const{part:ie}=ee[te].info;if(!(ie.signature&&ie.signature.static)){console.warn(`Property '${J}' used in template but not declared in 'properties'; attribute will not be observed.`);break}}}}function modelForElement($,C){let T;for(;C;)if(T=C.__dataHost?C:C.__templatizeInstance)if(T.__dataHost!=$)C=T.__dataHost;else return T;else C=wrap$1(C).parentNode;return null}/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Overlay extends ThemableMixin(DirMixin$1(ControllerMixin(PolymerElement))){static get template(){return html`
      <style>
        :host {
          z-index: 200;
          position: fixed;

          /* Despite of what the names say, <vaadin-overlay> is just a container
          for position/sizing/alignment. The actual overlay is the overlay part. */

          /* Default position constraints: the entire viewport. Note: themes can
          override this to introduce gaps between the overlay and the viewport. */
          top: 0;
          right: 0;
          bottom: var(--vaadin-overlay-viewport-bottom);
          left: 0;

          /* Use flexbox alignment for the overlay part. */
          display: flex;
          flex-direction: column; /* makes dropdowns sizing easier */
          /* Align to center by default. */
          align-items: center;
          justify-content: center;

          /* Allow centering when max-width/max-height applies. */
          margin: auto;

          /* The host is not clickable, only the overlay part is. */
          pointer-events: none;

          /* Remove tap highlight on touch devices. */
          -webkit-tap-highlight-color: transparent;

          /* CSS API for host */
          --vaadin-overlay-viewport-bottom: 0;
        }

        :host([hidden]),
        :host(:not([opened]):not([closing])) {
          display: none !important;
        }

        [part='overlay'] {
          -webkit-overflow-scrolling: touch;
          overflow: auto;
          pointer-events: auto;

          /* Prevent overflowing the host in MSIE 11 */
          max-width: 100%;
          box-sizing: border-box;

          -webkit-tap-highlight-color: initial; /* reenable tap highlight inside */
        }

        [part='backdrop'] {
          z-index: -1;
          content: '';
          background: rgba(0, 0, 0, 0.5);
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          pointer-events: auto;
        }
      </style>

      <div id="backdrop" part="backdrop" hidden$="[[!withBackdrop]]"></div>
      <div part="overlay" id="overlay" tabindex="0">
        <div part="content" id="content">
          <slot></slot>
        </div>
      </div>
    `}static get is(){return"vaadin-overlay"}static get properties(){return{opened:{type:Boolean,notify:!0,observer:"_openedChanged",reflectToAttribute:!0},owner:Element,renderer:Function,template:{type:Object,notify:!0},content:{type:Object,notify:!0},withBackdrop:{type:Boolean,value:!1,reflectToAttribute:!0},model:Object,modeless:{type:Boolean,value:!1,reflectToAttribute:!0,observer:"_modelessChanged"},hidden:{type:Boolean,reflectToAttribute:!0,observer:"_hiddenChanged"},focusTrap:{type:Boolean,value:!1},restoreFocusOnClose:{type:Boolean,value:!1},restoreFocusNode:{type:HTMLElement},_mouseDownInside:{type:Boolean},_mouseUpInside:{type:Boolean},_instance:{type:Object},_originalContentPart:Object,_contentNodes:Array,_oldOwner:Element,_oldModel:Object,_oldTemplate:Object,_oldRenderer:Object,_oldOpened:Boolean}}static get observers(){return["_templateOrRendererChanged(template, renderer, owner, model, opened)"]}constructor(){super(),this._boundMouseDownListener=this._mouseDownListener.bind(this),this._boundMouseUpListener=this._mouseUpListener.bind(this),this._boundOutsideClickListener=this._outsideClickListener.bind(this),this._boundKeydownListener=this._keydownListener.bind(this),this._observer=new FlattenedNodesObserver(this,C=>{this._setTemplateFromNodes(C.addedNodes)}),this._boundIronOverlayCanceledListener=this._ironOverlayCanceled.bind(this),isIOS&&(this._boundIosResizeListener=()=>this._detectIosNavbar()),this.__focusTrapController=new FocusTrapController(this)}ready(){super.ready(),this._observer.flush(),this.addEventListener("click",()=>{}),this.$.backdrop.addEventListener("click",()=>{}),this.addController(this.__focusTrapController)}_detectIosNavbar(){if(!this.opened)return;const C=window.innerHeight,V=window.innerWidth>C,K=document.documentElement.clientHeight;V&&K>C?this.style.setProperty("--vaadin-overlay-viewport-bottom",`${K-C}px`):this.style.setProperty("--vaadin-overlay-viewport-bottom","0")}_setTemplateFromNodes(C){this.template=C.find(T=>T.localName&&T.localName==="template")||this.template}close(C){const T=new CustomEvent("vaadin-overlay-close",{bubbles:!0,cancelable:!0,detail:{sourceEvent:C}});this.dispatchEvent(T),T.defaultPrevented||(this.opened=!1)}connectedCallback(){super.connectedCallback(),this._boundIosResizeListener&&(this._detectIosNavbar(),window.addEventListener("resize",this._boundIosResizeListener))}disconnectedCallback(){super.disconnectedCallback(),this._boundIosResizeListener&&window.removeEventListener("resize",this._boundIosResizeListener)}requestContentUpdate(){this.renderer&&this.renderer.call(this.owner,this.content,this.owner,this.model)}_ironOverlayCanceled(C){C.preventDefault()}_mouseDownListener(C){this._mouseDownInside=C.composedPath().indexOf(this.$.overlay)>=0}_mouseUpListener(C){this._mouseUpInside=C.composedPath().indexOf(this.$.overlay)>=0}_outsideClickListener(C){if(C.composedPath().includes(this.$.overlay)||this._mouseDownInside||this._mouseUpInside){this._mouseDownInside=!1,this._mouseUpInside=!1;return}if(!this._last)return;const T=new CustomEvent("vaadin-overlay-outside-click",{bubbles:!0,cancelable:!0,detail:{sourceEvent:C}});this.dispatchEvent(T),this.opened&&!T.defaultPrevented&&this.close(C)}_keydownListener(C){if(this._last&&!(this.modeless&&!C.composedPath().includes(this.$.overlay))&&C.key==="Escape"){const T=new CustomEvent("vaadin-overlay-escape-press",{bubbles:!0,cancelable:!0,detail:{sourceEvent:C}});this.dispatchEvent(T),this.opened&&!T.defaultPrevented&&this.close(C)}}_ensureTemplatized(){this._setTemplateFromNodes(Array.from(this.children))}_openedChanged(C,T){this._instance||this._ensureTemplatized(),C?(this.__restoreFocusNode=this._getActiveElement(),this._animatedOpening(),afterNextRender(this,()=>{this.focusTrap&&this.__focusTrapController.trapFocus(this.$.overlay);const V=new CustomEvent("vaadin-overlay-open",{bubbles:!0});this.dispatchEvent(V)}),document.addEventListener("keydown",this._boundKeydownListener),this.modeless||this._addGlobalListeners()):T&&(this.focusTrap&&this.__focusTrapController.releaseFocus(),this._animatedClosing(),document.removeEventListener("keydown",this._boundKeydownListener),this.modeless||this._removeGlobalListeners())}_hiddenChanged(C){C&&this.hasAttribute("closing")&&this._flushAnimation("closing")}_shouldAnimate(){const C=getComputedStyle(this).getPropertyValue("animation-name");return!(getComputedStyle(this).getPropertyValue("display")==="none")&&C&&C!=="none"}_enqueueAnimation(C,T){const V=`__${C}Handler`,K=Y=>{Y&&Y.target!==this||(T(),this.removeEventListener("animationend",K),delete this[V])};this[V]=K,this.addEventListener("animationend",K)}_flushAnimation(C){const T=`__${C}Handler`;typeof this[T]=="function"&&this[T]()}_animatedOpening(){this.parentNode===document.body&&this.hasAttribute("closing")&&this._flushAnimation("closing"),this._attachOverlay(),this.modeless||this._enterModalState(),this.setAttribute("opening",""),this._shouldAnimate()?this._enqueueAnimation("opening",()=>{this._finishOpening()}):this._finishOpening()}_attachOverlay(){this._placeholder=document.createComment("vaadin-overlay-placeholder"),this.parentNode.insertBefore(this._placeholder,this),document.body.appendChild(this),this.bringToFront()}_finishOpening(){document.addEventListener("iron-overlay-canceled",this._boundIronOverlayCanceledListener),this.removeAttribute("opening")}_finishClosing(){document.removeEventListener("iron-overlay-canceled",this._boundIronOverlayCanceledListener),this._detachOverlay(),this.$.overlay.style.removeProperty("pointer-events"),this.removeAttribute("closing")}_animatedClosing(){if(this.hasAttribute("opening")&&this._flushAnimation("opening"),this._placeholder){this._exitModalState();const C=this.restoreFocusNode||this.__restoreFocusNode;if(this.restoreFocusOnClose&&C){const T=this._getActiveElement();(T===document.body||this._deepContains(T))&&setTimeout(()=>C.focus()),this.__restoreFocusNode=null}this.setAttribute("closing",""),this.dispatchEvent(new CustomEvent("vaadin-overlay-closing")),this._shouldAnimate()?this._enqueueAnimation("closing",()=>{this._finishClosing()}):this._finishClosing()}}_detachOverlay(){this._placeholder.parentNode.insertBefore(this,this._placeholder),this._placeholder.parentNode.removeChild(this._placeholder)}static get __attachedInstances(){return Array.from(document.body.children).filter(C=>C instanceof Overlay&&!C.hasAttribute("closing")).sort((C,T)=>C.__zIndex-T.__zIndex||0)}get _last(){return this===Overlay.__attachedInstances.pop()}_modelessChanged(C){C?(this._removeGlobalListeners(),this._exitModalState()):this.opened&&(this._addGlobalListeners(),this._enterModalState())}_addGlobalListeners(){document.addEventListener("mousedown",this._boundMouseDownListener),document.addEventListener("mouseup",this._boundMouseUpListener),document.documentElement.addEventListener("click",this._boundOutsideClickListener,!0)}_enterModalState(){document.body.style.pointerEvents!=="none"&&(this._previousDocumentPointerEvents=document.body.style.pointerEvents,document.body.style.pointerEvents="none"),Overlay.__attachedInstances.forEach(C=>{C!==this&&(C.shadowRoot.querySelector('[part="overlay"]').style.pointerEvents="none")})}_removeGlobalListeners(){document.removeEventListener("mousedown",this._boundMouseDownListener),document.removeEventListener("mouseup",this._boundMouseUpListener),document.documentElement.removeEventListener("click",this._boundOutsideClickListener,!0)}_exitModalState(){this._previousDocumentPointerEvents!==void 0&&(document.body.style.pointerEvents=this._previousDocumentPointerEvents,delete this._previousDocumentPointerEvents);const C=Overlay.__attachedInstances;let T;for(;(T=C.pop())&&!(T!==this&&(T.shadowRoot.querySelector('[part="overlay"]').style.removeProperty("pointer-events"),!T.modeless)););}_removeOldContent(){!this.content||!this._contentNodes||(this._observer.disconnect(),this._contentNodes.forEach(C=>{C.parentNode===this.content&&this.content.removeChild(C)}),this._originalContentPart&&(this.$.content.parentNode.replaceChild(this._originalContentPart,this.$.content),this.$.content=this._originalContentPart,this._originalContentPart=void 0),this._observer.connect(),this._contentNodes=void 0,this.content=void 0)}_stampOverlayTemplate(C){this._removeOldContent(),C._Templatizer||(C._Templatizer=templatize(C,this,{forwardHostProp(V,K){this._instance&&this._instance.forwardHostProp(V,K)}})),this._instance=new C._Templatizer({}),this._contentNodes=Array.from(this._instance.root.childNodes);const T=C._templateRoot||(C._templateRoot=C.getRootNode());if(T!==document){this.$.content.shadowRoot||this.$.content.attachShadow({mode:"open"});let V=Array.from(T.querySelectorAll("style")).reduce((K,Y)=>K+Y.textContent,"");if(V=V.replace(/:host/g,":host-nomatch"),V){const K=document.createElement("style");K.textContent=V,this.$.content.shadowRoot.appendChild(K),this._contentNodes.unshift(K)}this.$.content.shadowRoot.appendChild(this._instance.root),this.content=this.$.content.shadowRoot}else this.appendChild(this._instance.root),this.content=this}_removeNewRendererOrTemplate(C,T,V,K){C!==T?this.template=void 0:V!==K&&(this.renderer=void 0)}_templateOrRendererChanged(C,T,V,K,Y){if(C&&T)throw this._removeNewRendererOrTemplate(C,this._oldTemplate,T,this._oldRenderer),new Error("You should only use either a renderer or a template for overlay content");const J=this._oldOwner!==V||this._oldModel!==K;this._oldModel=K,this._oldOwner=V;const ee=this._oldTemplate!==C;this._oldTemplate=C;const te=this._oldRenderer!==T;this._oldRenderer=T;const ie=this._oldOpened!==Y;this._oldOpened=Y,te&&(this.content=this,this.content.innerHTML="",delete this.content._$litPart$),C&&ee?this._stampOverlayTemplate(C):T&&(te||ie||J)&&Y&&this.requestContentUpdate()}_getActiveElement(){let C=document.activeElement||document.body;for(;C.shadowRoot&&C.shadowRoot.activeElement;)C=C.shadowRoot.activeElement;return C}_deepContains(C){if(this.contains(C))return!0;let T=C;const V=C.ownerDocument;for(;T&&T!==V&&T!==this;)T=T.parentNode||T.host;return T===this}bringToFront(){let C="";const T=Overlay.__attachedInstances.filter(V=>V!==this).pop();T&&(C=T.__zIndex+1),this.style.zIndex=C,this.__zIndex=C||parseFloat(getComputedStyle(this).zIndex)}}customElements.define(Overlay.is,Overlay);const datePickerOverlay=i$2`
  [part='overlay'] {
    /*
  Width:
      date cell widths
    + month calendar side padding
    + year scroller width
  */
    /* prettier-ignore */
    width:
    calc(
        var(--lumo-size-m) * 7
      + var(--lumo-space-xs) * 2
      + 57px
    );
    height: 100%;
    max-height: calc(var(--lumo-size-m) * 14);
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
  }

  [part='overlay'] {
    flex-direction: column;
  }

  [part='content'] {
    padding: 0;
    height: 100%;
    overflow: hidden;
    -webkit-mask-image: none;
    mask-image: none;
  }

  :host([top-aligned]) [part~='overlay'] {
    margin-top: var(--lumo-space-xs);
  }

  :host([bottom-aligned]) [part~='overlay'] {
    margin-bottom: var(--lumo-space-xs);
  }

  @media (max-width: 420px), (max-height: 420px) {
    [part='overlay'] {
      width: 100vw;
      height: 70vh;
      max-height: 70vh;
    }
  }
`;registerStyles("vaadin-date-picker-overlay",[menuOverlay,datePickerOverlay],{moduleId:"lumo-date-picker-overlay"});registerStyles("vaadin-date-picker-overlay-content",i$2`
    :host {
      position: relative;
      /* Background for the year scroller, placed here as we are using a mask image on the actual years part */
      background-image: linear-gradient(var(--lumo-shade-5pct), var(--lumo-shade-5pct));
      background-size: 57px 100%;
      background-position: top right;
      background-repeat: no-repeat;
      cursor: default;
    }

    /* Month scroller */

    [part='months'] {
      /* Month calendar height:
              header height + margin-bottom
            + weekdays height + margin-bottom
            + date cell heights
            + small margin between month calendars
        */
      /* prettier-ignore */
      --vaadin-infinite-scroller-item-height:
          calc(
              var(--lumo-font-size-l) + var(--lumo-space-m)
            + var(--lumo-font-size-xs) + var(--lumo-space-s)
            + var(--lumo-size-m) * 6
            + var(--lumo-space-s)
          );
      --vaadin-infinite-scroller-buffer-offset: 10%;
      -webkit-mask-image: linear-gradient(transparent, #000 10%, #000 85%, transparent);
      mask-image: linear-gradient(transparent, #000 10%, #000 85%, transparent);
      position: relative;
      margin-right: 57px;
    }

    /* Year scroller */
    [part='years'] {
      /* TODO get rid of fixed magic number */
      --vaadin-infinite-scroller-buffer-width: 97px;
      width: 57px;
      height: auto;
      top: 0;
      bottom: 0;
      font-size: var(--lumo-font-size-s);
      box-shadow: inset 2px 0 4px 0 var(--lumo-shade-5pct);
      -webkit-mask-image: linear-gradient(transparent, #000 35%, #000 65%, transparent);
      mask-image: linear-gradient(transparent, #000 35%, #000 65%, transparent);
      cursor: var(--lumo-clickable-cursor);
    }

    [part='year-number']:not([current]),
    [part='year-separator'] {
      opacity: 0.7;
      transition: 0.2s opacity;
    }

    [part='years']:hover [part='year-number'],
    [part='years']:hover [part='year-separator'] {
      opacity: 1;
    }

    /* TODO unsupported selector */
    #scrollers {
      position: static;
      display: block;
    }

    /* TODO unsupported selector, should fix this in vaadin-date-picker that it adapts to the
       * width of the year scroller */
    #scrollers[desktop] [part='months'] {
      right: auto;
    }

    /* Year scroller position indicator */
    [part='years']::before {
      border: none;
      width: 1em;
      height: 1em;
      background-color: var(--lumo-base-color);
      background-image: linear-gradient(var(--lumo-tint-5pct), var(--lumo-tint-5pct));
      transform: translate(-75%, -50%) rotate(45deg);
      border-top-right-radius: var(--lumo-border-radius-s);
      box-shadow: 2px -2px 6px 0 var(--lumo-shade-5pct);
      z-index: 1;
    }

    [part='year-number'],
    [part='year-separator'] {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50%;
      transform: translateY(-50%);
    }

    [part='years'] [part='year-separator']::after {
      color: var(--lumo-disabled-text-color);
      content: '•';
    }

    /* Current year */

    [part='years'] [part='year-number'][current] {
      color: var(--lumo-primary-text-color);
    }

    /* Toolbar (footer) */

    [part='toolbar'] {
      padding: var(--lumo-space-s);
      border-bottom-left-radius: var(--lumo-border-radius-l);
      margin-right: 57px;
    }

    /* Today and Cancel buttons */

    [part='toolbar'] [part\$='button'] {
      margin: 0;
    }

    /* Narrow viewport mode (fullscreen) */

    :host([fullscreen]) [part='toolbar'] {
      order: -1;
      background-color: var(--lumo-base-color);
    }

    :host([fullscreen]) [part='overlay-header'] {
      order: -2;
      height: var(--lumo-size-m);
      padding: var(--lumo-space-s);
      position: absolute;
      left: 0;
      right: 0;
      justify-content: center;
    }

    :host([fullscreen]) [part='toggle-button'],
    :host([fullscreen]) [part='clear-button'],
    [part='overlay-header'] [part='label'] {
      display: none;
    }

    /* Very narrow screen (year scroller initially hidden) */

    [part='years-toggle-button'] {
      display: flex;
      align-items: center;
      height: var(--lumo-size-s);
      padding: 0 0.5em;
      border-radius: var(--lumo-border-radius-m);
      z-index: 3;
      color: var(--lumo-primary-text-color);
      font-weight: 500;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    :host([years-visible]) [part='years-toggle-button'] {
      background-color: var(--lumo-primary-color);
      color: var(--lumo-primary-contrast-color);
    }

    /* TODO magic number (same as used for media-query in vaadin-date-picker-overlay-content) */
    @media screen and (max-width: 374px) {
      :host {
        background-image: none;
      }

      [part='years'] {
        background-color: var(--lumo-shade-5pct);
      }

      [part='toolbar'],
      [part='months'] {
        margin-right: 0;
      }

      /* TODO make date-picker adapt to the width of the years part */
      [part='years'] {
        --vaadin-infinite-scroller-buffer-width: 90px;
        width: 50px;
      }

      :host([years-visible]) [part='months'] {
        padding-left: 50px;
      }
    }
  `,{moduleId:"lumo-date-picker-overlay-content"});registerStyles("vaadin-month-calendar",i$2`
    :host {
      -moz-user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      font-size: var(--lumo-font-size-m);
      color: var(--lumo-body-text-color);
      text-align: center;
      padding: 0 var(--lumo-space-xs);
    }

    /* Month header */

    [part='month-header'] {
      color: var(--lumo-header-text-color);
      font-size: var(--lumo-font-size-l);
      line-height: 1;
      font-weight: 500;
      margin-bottom: var(--lumo-space-m);
    }

    /* Week days and numbers */

    [part='weekdays'],
    [part='weekday'],
    [part='week-number'] {
      font-size: var(--lumo-font-size-xxs);
      line-height: 1;
      color: var(--lumo-secondary-text-color);
    }

    [part='weekdays'] {
      margin-bottom: var(--lumo-space-s);
    }

    [part='weekday']:empty,
    [part='week-number'] {
      width: var(--lumo-size-xs);
    }

    /* Date and week number cells */

    [part='date'],
    [part='week-number'] {
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: var(--lumo-size-m);
      position: relative;
    }

    [part='date'] {
      transition: color 0.1s;
    }

    [part='date']:not(:empty) {
      cursor: var(--lumo-clickable-cursor);
    }

    :host([week-numbers]) [part='weekday']:not(:empty),
    :host([week-numbers]) [part='date'] {
      width: calc((100% - var(--lumo-size-xs)) / 7);
    }

    /* Today date */

    [part='date'][today] {
      color: var(--lumo-primary-text-color);
    }

    /* Focused date */

    [part='date']::before {
      content: '';
      position: absolute;
      z-index: -1;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      min-width: 2em;
      min-height: 2em;
      width: 80%;
      height: 80%;
      max-height: 100%;
      max-width: 100%;
      border-radius: var(--lumo-border-radius-m);
    }

    [part='date'][focused]::before {
      box-shadow: 0 0 0 1px var(--lumo-base-color), 0 0 0 3px var(--lumo-primary-color-50pct);
    }

    :host(:not([focused])) [part='date'][focused]::before {
      animation: vaadin-date-picker-month-calendar-focus-date 1.4s infinite;
    }

    @keyframes vaadin-date-picker-month-calendar-focus-date {
      50% {
        box-shadow: 0 0 0 1px var(--lumo-base-color), 0 0 0 3px transparent;
      }
    }

    [part='date']:not(:empty):not([disabled]):not([selected]):hover::before {
      background-color: var(--lumo-primary-color-10pct);
    }

    [part='date'][selected] {
      color: var(--lumo-primary-contrast-color);
    }

    [part='date'][selected]::before {
      background-color: var(--lumo-primary-color);
    }

    [part='date'][disabled] {
      color: var(--lumo-disabled-text-color);
    }

    @media (pointer: coarse) {
      [part='date']:hover:not([selected])::before,
      [part='date'][focused]:not([selected])::before {
        display: none;
      }

      [part='date']:not(:empty):not([disabled]):active::before {
        display: block;
      }

      [part='date'][selected]::before {
        box-shadow: none;
      }
    }

    /* Disabled */

    :host([disabled]) * {
      color: var(--lumo-disabled-text-color) !important;
    }
  `,{moduleId:"lumo-month-calendar"});const template$7=document.createElement("template");template$7.innerHTML=`
  <style>
    @keyframes vaadin-date-picker-month-calendar-focus-date {
      50% {
        box-shadow: 0 0 0 2px transparent;
      }
    }
  </style>
`;document.head.appendChild(template$7.content);const datePicker=i$2`
  :host {
    outline: none;
  }

  [part='toggle-button']::before {
    content: var(--lumo-icons-calendar);
  }

  [part='clear-button']::before {
    content: var(--lumo-icons-cross);
  }

  @media (max-width: 420px), (max-height: 420px) {
    [part='overlay-content'] {
      height: 70vh;
    }
  }

  :host([dir='rtl']) [part='input-field'] ::slotted(input) {
    --_lumo-text-field-overflow-mask-image: linear-gradient(to left, transparent, #000 1.25em);
  }

  :host([dir='rtl']) [part='input-field'] ::slotted(input:placeholder-shown) {
    --_lumo-text-field-overflow-mask-image: none;
  }
`;registerStyles("vaadin-date-picker",[inputFieldShared$1,datePicker],{moduleId:"lumo-date-picker"});/**
 * @fileoverview
 * @suppress {checkPrototypalTypes}
 * @license Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
 * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
 * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
 * Google as part of the polymer project is also subject to an additional IP
 * rights grant found at http://polymer.github.io/PATENTS.txt
 */const DISABLED_ATTR$1="disable-upgrade",findObservedAttributesGetter=$=>{for(;$;){const C=Object.getOwnPropertyDescriptor($,"observedAttributes");if(C)return C.get;$=Object.getPrototypeOf($.prototype).constructor}return()=>[]},DisableUpgradeMixin=dedupingMixin($=>{const C=ElementMixin$1($);let T=findObservedAttributesGetter(C);class V extends C{constructor(){super(),this.__isUpgradeDisabled}static get observedAttributes(){return T.call(this).concat(DISABLED_ATTR$1)}_initializeProperties(){this.hasAttribute(DISABLED_ATTR$1)?this.__isUpgradeDisabled=!0:super._initializeProperties()}_enableProperties(){this.__isUpgradeDisabled||super._enableProperties()}_canApplyPropertyDefault(Y){return super._canApplyPropertyDefault(Y)&&!(this.__isUpgradeDisabled&&this._isPropertyPending(Y))}attributeChangedCallback(Y,J,ee,te){Y==DISABLED_ATTR$1?this.__isUpgradeDisabled&&ee==null&&(super._initializeProperties(),this.__isUpgradeDisabled=!1,wrap$1(this).isConnected&&super.connectedCallback()):super.attributeChangedCallback(Y,J,ee,te)}connectedCallback(){this.__isUpgradeDisabled||super.connectedCallback()}disconnectedCallback(){this.__isUpgradeDisabled||super.disconnectedCallback()}}return V});/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const PROP_NAMES_VERTICAL={start:"top",end:"bottom"},PROP_NAMES_HORIZONTAL={start:"left",end:"right"},targetResizeObserver=new ResizeObserver($=>{setTimeout(()=>{$.forEach(C=>{C.target.__overlay&&C.target.__overlay._updatePosition()})})}),PositionMixin=$=>class extends ${static get properties(){return{positionTarget:{type:Object,value:null},horizontalAlign:{type:String,value:"start"},verticalAlign:{type:String,value:"top"},noHorizontalOverlap:{type:Boolean,value:!1},noVerticalOverlap:{type:Boolean,value:!1},requiredVerticalSpace:{type:Number,value:0}}}static get observers(){return["__positionSettingsChanged(horizontalAlign, verticalAlign, noHorizontalOverlap, noVerticalOverlap, requiredVerticalSpace)","__overlayOpenedChanged(opened, positionTarget)"]}constructor(){super(),this.__onScroll=this.__onScroll.bind(this),this._updatePosition=this._updatePosition.bind(this)}connectedCallback(){super.connectedCallback(),this.opened&&this.__addUpdatePositionEventListeners()}disconnectedCallback(){super.disconnectedCallback(),this.__removeUpdatePositionEventListeners()}__addUpdatePositionEventListeners(){window.addEventListener("resize",this._updatePosition),this.__positionTargetAncestorRootNodes=getAncestorRootNodes(this.positionTarget),this.__positionTargetAncestorRootNodes.forEach(T=>{T.addEventListener("scroll",this.__onScroll,!0)})}__removeUpdatePositionEventListeners(){window.removeEventListener("resize",this._updatePosition),this.__positionTargetAncestorRootNodes&&(this.__positionTargetAncestorRootNodes.forEach(T=>{T.removeEventListener("scroll",this.__onScroll,!0)}),this.__positionTargetAncestorRootNodes=null)}__overlayOpenedChanged(T,V){if(this.__removeUpdatePositionEventListeners(),V&&(V.__overlay=null,targetResizeObserver.unobserve(V),T&&(this.__addUpdatePositionEventListeners(),V.__overlay=this,targetResizeObserver.observe(V))),T){const K=getComputedStyle(this);this.__margins||(this.__margins={},["top","bottom","left","right"].forEach(Y=>{this.__margins[Y]=parseInt(K[Y],10)})),this.setAttribute("dir",K.direction),this._updatePosition(),requestAnimationFrame(()=>this._updatePosition())}}get __isRTL(){return this.getAttribute("dir")==="rtl"}__positionSettingsChanged(){this._updatePosition()}__onScroll(T){this.contains(T.target)||this._updatePosition()}_updatePosition(){if(!this.positionTarget||!this.opened)return;const T=this.positionTarget.getBoundingClientRect(),V=this.__shouldAlignStartVertically(T);this.style.justifyContent=V?"flex-start":"flex-end";const K=this.__shouldAlignStartHorizontally(T,this.__isRTL),Y=!this.__isRTL&&K||this.__isRTL&&!K;this.style.alignItems=Y?"flex-start":"flex-end";const J=this.getBoundingClientRect(),ee=this.__calculatePositionInOneDimension(T,J,this.noVerticalOverlap,PROP_NAMES_VERTICAL,this,V),te=this.__calculatePositionInOneDimension(T,J,this.noHorizontalOverlap,PROP_NAMES_HORIZONTAL,this,K);Object.assign(this.style,ee,te),this.toggleAttribute("bottom-aligned",!V),this.toggleAttribute("top-aligned",V),this.toggleAttribute("end-aligned",!Y),this.toggleAttribute("start-aligned",Y)}__shouldAlignStartHorizontally(T,V){const K=Math.max(this.__oldContentWidth||0,this.$.overlay.offsetWidth);this.__oldContentWidth=this.$.overlay.offsetWidth;const Y=Math.min(window.innerWidth,document.documentElement.clientWidth),J=!V&&this.horizontalAlign==="start"||V&&this.horizontalAlign==="end";return this.__shouldAlignStart(T,K,Y,this.__margins,J,this.noHorizontalOverlap,PROP_NAMES_HORIZONTAL)}__shouldAlignStartVertically(T){const V=this.requiredVerticalSpace||Math.max(this.__oldContentHeight||0,this.$.overlay.offsetHeight);this.__oldContentHeight=this.$.overlay.offsetHeight;const K=Math.min(window.innerHeight,document.documentElement.clientHeight),Y=this.verticalAlign==="top";return this.__shouldAlignStart(T,V,K,this.__margins,Y,this.noVerticalOverlap,PROP_NAMES_VERTICAL)}__shouldAlignStart(T,V,K,Y,J,ee,te){const ie=K-T[ee?te.end:te.start]-Y[te.end],re=T[ee?te.start:te.end]-Y[te.start],se=J?ie:re,ae=se>(J?re:ie)||se>V;return J===ae}__adjustBottomProperty(T,V,K){let Y;if(T===V.end){if(V.end===PROP_NAMES_VERTICAL.end){const J=Math.min(window.innerHeight,document.documentElement.clientHeight);if(K>J&&this.__oldViewportHeight){const ee=this.__oldViewportHeight-J;Y=K-ee}this.__oldViewportHeight=J}if(V.end===PROP_NAMES_HORIZONTAL.end){const J=Math.min(window.innerWidth,document.documentElement.clientWidth);if(K>J&&this.__oldViewportWidth){const ee=this.__oldViewportWidth-J;Y=K-ee}this.__oldViewportWidth=J}}return Y}__calculatePositionInOneDimension(T,V,K,Y,J,ee){const te=ee?Y.start:Y.end,ie=ee?Y.end:Y.start,re=parseFloat(J.style[te]||getComputedStyle(J)[te]),se=this.__adjustBottomProperty(te,Y,re),oe=V[ee?Y.start:Y.end]-T[K===ee?Y.end:Y.start],ae=se?`${se}px`:`${re+oe*(ee?-1:1)}px`;return{[te]:ae,[ie]:""}}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const datePickerStyles=i$2`
  :host([dir='rtl']) [part='input-field'] {
    direction: ltr;
  }

  :host([dir='rtl']) [part='input-field'] ::slotted(input)::placeholder {
    direction: rtl;
    text-align: left;
  }
`,datePickerOverlayStyles=i$2`
  [part='overlay'] {
    display: flex;
    flex: auto;
  }

  [part~='content'] {
    flex: auto;
  }
`;/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */registerStyles("vaadin-date-picker-overlay",datePickerOverlayStyles,{moduleId:"vaadin-date-picker-overlay-styles"});let memoizedTemplate$2;class DatePickerOverlay extends DisableUpgradeMixin(PositionMixin(Overlay)){static get is(){return"vaadin-date-picker-overlay"}static get template(){return memoizedTemplate$2||(memoizedTemplate$2=super.template.cloneNode(!0),memoizedTemplate$2.content.querySelector('[part~="overlay"]').removeAttribute("tabindex")),memoizedTemplate$2}}customElements.define(DatePickerOverlay.is,DatePickerOverlay);/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/class Debouncer{constructor(){this._asyncModule=null,this._callback=null,this._timer=null}setConfig(C,T){this._asyncModule=C,this._callback=T,this._timer=this._asyncModule.run(()=>{this._timer=null,debouncerQueue.delete(this),this._callback()})}cancel(){this.isActive()&&(this._cancelAsync(),debouncerQueue.delete(this))}_cancelAsync(){this.isActive()&&(this._asyncModule.cancel(this._timer),this._timer=null)}flush(){this.isActive()&&(this.cancel(),this._callback())}isActive(){return this._timer!=null}static debounce(C,T,V){return C instanceof Debouncer?C._cancelAsync():C=new Debouncer,C.setConfig(T,V),C}}let debouncerQueue=new Set;const enqueueDebouncer=function($){debouncerQueue.add($)},flushDebouncers=function(){const $=Boolean(debouncerQueue.size);return debouncerQueue.forEach(C=>{try{C.flush()}catch(T){setTimeout(()=>{throw T})}}),$};/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const flush=function(){let $,C;do $=window.ShadyDOM&&ShadyDOM.flush(),window.ShadyCSS&&window.ShadyCSS.ScopingShim&&window.ShadyCSS.ScopingShim.flush(),C=flushDebouncers();while($||C)};/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/let elementsHidden=!1;function hideElementsGlobally(){if(legacyOptimizations&&!useShadow){if(!elementsHidden){elementsHidden=!0;const $=document.createElement("style");$.textContent="dom-bind,dom-if,dom-repeat{display:none;}",document.head.appendChild($)}return!0}return!1}/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const domRepeatBase=OptionalMutableData(PolymerElement);class DomRepeat extends domRepeatBase{static get is(){return"dom-repeat"}static get template(){return null}static get properties(){return{items:{type:Array},as:{type:String,value:"item"},indexAs:{type:String,value:"index"},itemsIndexAs:{type:String,value:"itemsIndex"},sort:{type:Function,observer:"__sortChanged"},filter:{type:Function,observer:"__filterChanged"},observe:{type:String,observer:"__observeChanged"},delay:Number,renderedItemCount:{type:Number,notify:!suppressTemplateNotifications,readOnly:!0},initialCount:{type:Number},targetFramerate:{type:Number,value:20},_targetFrameTime:{type:Number,computed:"__computeFrameTime(targetFramerate)"},notifyDomChange:{type:Boolean},reuseChunkedInstances:{type:Boolean}}}static get observers(){return["__itemsChanged(items.*)"]}constructor(){super(),this.__instances=[],this.__renderDebouncer=null,this.__itemsIdxToInstIdx={},this.__chunkCount=null,this.__renderStartTime=null,this.__itemsArrayChanged=!1,this.__shouldMeasureChunk=!1,this.__shouldContinueChunking=!1,this.__chunkingId=0,this.__sortFn=null,this.__filterFn=null,this.__observePaths=null,this.__ctor=null,this.__isDetached=!0,this.template=null,this._templateInfo}disconnectedCallback(){super.disconnectedCallback(),this.__isDetached=!0;for(let C=0;C<this.__instances.length;C++)this.__detachInstance(C);this.__chunkingId&&cancelAnimationFrame(this.__chunkingId)}connectedCallback(){if(super.connectedCallback(),hideElementsGlobally()||(this.style.display="none"),this.__isDetached){this.__isDetached=!1;let C=wrap$1(wrap$1(this).parentNode);for(let T=0;T<this.__instances.length;T++)this.__attachInstance(T,C);this.__chunkingId&&this.__render()}}__ensureTemplatized(){if(!this.__ctor){const C=this;let T=this.template=C._templateInfo?C:this.querySelector("template");if(!T){let K=new MutationObserver(()=>{if(this.querySelector("template"))K.disconnect(),this.__render();else throw new Error("dom-repeat requires a <template> child")});return K.observe(this,{childList:!0}),!1}let V={};V[this.as]=!0,V[this.indexAs]=!0,V[this.itemsIndexAs]=!0,this.__ctor=templatize(T,this,{mutableData:this.mutableData,parentModel:!0,instanceProps:V,forwardHostProp:function(K,Y){let J=this.__instances;for(let ee=0,te;ee<J.length&&(te=J[ee]);ee++)te.forwardHostProp(K,Y)},notifyInstanceProp:function(K,Y,J){if(matches(this.as,Y)){let ee=K[this.itemsIndexAs];Y==this.as&&(this.items[ee]=J);let te=translate(this.as,`${JSCompiler_renameProperty("items",this)}.${ee}`,Y);this.notifyPath(te,J)}}})}return!0}__getMethodHost(){return this.__dataHost._methodHost||this.__dataHost}__functionFromPropertyValue(C){if(typeof C=="string"){let T=C,V=this.__getMethodHost();return function(){return V[T].apply(V,arguments)}}return C}__sortChanged(C){this.__sortFn=this.__functionFromPropertyValue(C),this.items&&this.__debounceRender(this.__render)}__filterChanged(C){this.__filterFn=this.__functionFromPropertyValue(C),this.items&&this.__debounceRender(this.__render)}__computeFrameTime(C){return Math.ceil(1e3/C)}__observeChanged(){this.__observePaths=this.observe&&this.observe.replace(".*",".").split(" ")}__handleObservedPaths(C){if(this.__sortFn||this.__filterFn){if(!C)this.__debounceRender(this.__render,this.delay);else if(this.__observePaths){let T=this.__observePaths;for(let V=0;V<T.length;V++)C.indexOf(T[V])===0&&this.__debounceRender(this.__render,this.delay)}}}__itemsChanged(C){this.items&&!Array.isArray(this.items)&&console.warn("dom-repeat expected array for `items`, found",this.items),this.__handleItemPath(C.path,C.value)||(C.path==="items"&&(this.__itemsArrayChanged=!0),this.__debounceRender(this.__render))}__debounceRender(C,T=0){this.__renderDebouncer=Debouncer.debounce(this.__renderDebouncer,T>0?timeOut$1.after(T):microTask$1,C.bind(this)),enqueueDebouncer(this.__renderDebouncer)}render(){this.__debounceRender(this.__render),flush()}__render(){if(!this.__ensureTemplatized())return;let C=this.items||[];const T=this.__sortAndFilterItems(C),V=this.__calculateLimit(T.length);this.__updateInstances(C,V,T),this.initialCount&&(this.__shouldMeasureChunk||this.__shouldContinueChunking)&&(cancelAnimationFrame(this.__chunkingId),this.__chunkingId=requestAnimationFrame(()=>{this.__chunkingId=null,this.__continueChunking()})),this._setRenderedItemCount(this.__instances.length),(!suppressTemplateNotifications||this.notifyDomChange)&&this.dispatchEvent(new CustomEvent("dom-change",{bubbles:!0,composed:!0}))}__sortAndFilterItems(C){let T=new Array(C.length);for(let V=0;V<C.length;V++)T[V]=V;return this.__filterFn&&(T=T.filter((V,K,Y)=>this.__filterFn(C[V],K,Y))),this.__sortFn&&T.sort((V,K)=>this.__sortFn(C[V],C[K])),T}__calculateLimit(C){let T=C;const V=this.__instances.length;if(this.initialCount){let K;!this.__chunkCount||this.__itemsArrayChanged&&!this.reuseChunkedInstances?(T=Math.min(C,this.initialCount),K=Math.max(T-V,0),this.__chunkCount=K||1):(K=Math.min(Math.max(C-V,0),this.__chunkCount),T=Math.min(V+K,C)),this.__shouldMeasureChunk=K===this.__chunkCount,this.__shouldContinueChunking=T<C,this.__renderStartTime=performance.now()}return this.__itemsArrayChanged=!1,T}__continueChunking(){if(this.__shouldMeasureChunk){const C=performance.now()-this.__renderStartTime,T=this._targetFrameTime/C;this.__chunkCount=Math.round(this.__chunkCount*T)||1}this.__shouldContinueChunking&&this.__debounceRender(this.__render)}__updateInstances(C,T,V){const K=this.__itemsIdxToInstIdx={};let Y;for(Y=0;Y<T;Y++){let J=this.__instances[Y],ee=V[Y],te=C[ee];K[ee]=Y,J?(J._setPendingProperty(this.as,te),J._setPendingProperty(this.indexAs,Y),J._setPendingProperty(this.itemsIndexAs,ee),J._flushProperties()):this.__insertInstance(te,Y,ee)}for(let J=this.__instances.length-1;J>=Y;J--)this.__detachAndRemoveInstance(J)}__detachInstance(C){let T=this.__instances[C];const V=wrap$1(T.root);for(let K=0;K<T.children.length;K++){let Y=T.children[K];V.appendChild(Y)}return T}__attachInstance(C,T){let V=this.__instances[C];T.insertBefore(V.root,this)}__detachAndRemoveInstance(C){this.__detachInstance(C),this.__instances.splice(C,1)}__stampInstance(C,T,V){let K={};return K[this.as]=C,K[this.indexAs]=T,K[this.itemsIndexAs]=V,new this.__ctor(K)}__insertInstance(C,T,V){const K=this.__stampInstance(C,T,V);let Y=this.__instances[T+1],J=Y?Y.children[0]:this;return wrap$1(wrap$1(this).parentNode).insertBefore(K.root,J),this.__instances[T]=K,K}_showHideChildren(C){for(let T=0;T<this.__instances.length;T++)this.__instances[T]._showHideChildren(C)}__handleItemPath(C,T){let V=C.slice(6),K=V.indexOf("."),Y=K<0?V:V.substring(0,K);if(Y==parseInt(Y,10)){let J=K<0?"":V.substring(K+1);this.__handleObservedPaths(J);let ee=this.__itemsIdxToInstIdx[Y],te=this.__instances[ee];if(te){let ie=this.as+(J?"."+J:"");te._setPendingPropertyOrPath(ie,T,!1,!0),te._flushProperties()}return!0}}itemForElement(C){let T=this.modelForElement(C);return T&&T[this.as]}indexForElement(C){let T=this.modelForElement(C);return T&&T[this.indexAs]}modelForElement(C){return modelForElement(this.template,C)}}customElements.define(DomRepeat.is,DomRepeat);/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */function getISOWeekNumber($){let C=$.getDay();C===0&&(C=7);const T=4-C,V=new Date($.getTime()+T*24*3600*1e3),K=new Date(0,0);K.setFullYear(V.getFullYear());const Y=V.getTime()-K.getTime(),J=Math.round(Y/(24*3600*1e3));return Math.floor(J/7+1)}function dateEquals($,C){return $ instanceof Date&&C instanceof Date&&$.getFullYear()===C.getFullYear()&&$.getMonth()===C.getMonth()&&$.getDate()===C.getDate()}function dateAllowed($,C,T){return(!C||$>=C)&&(!T||$<=T)}function getClosestDate($,C){return C.filter(T=>T!==void 0).reduce((T,V)=>{if(!V)return T;if(!T)return V;const K=Math.abs($.getTime()-V.getTime()),Y=Math.abs(T.getTime()-$.getTime());return K<Y?V:T})}function extractDateParts($){return{day:$.getDate(),month:$.getMonth(),year:$.getFullYear()}}function getAdjustedYear($,C,T=0,V=1){if(C>99)throw new Error("The provided year cannot have more than 2 digits.");if(C<0)throw new Error("The provided year cannot be negative.");let K=C+Math.floor($.getFullYear()/100)*100;return $<new Date(K-50,T,V)?K-=100:$>new Date(K+50,T,V)&&(K+=100),K}function parseDate($){const C=/^([-+]\d{1}|\d{2,4}|[-+]\d{6})-(\d{1,2})-(\d{1,2})$/.exec($);if(!C)return;const T=new Date(0,0);return T.setFullYear(parseInt(C[1],10)),T.setMonth(parseInt(C[2],10)-1),T.setDate(parseInt(C[3],10)),T}/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class MonthCalendar extends FocusMixin(ThemableMixin(PolymerElement)){static get template(){return html`
      <style>
        :host {
          display: block;
        }

        #monthGrid {
          width: 100%;
          border-collapse: collapse;
        }

        #days-container tr,
        #weekdays-container tr {
          display: flex;
        }

        [part='date'] {
          outline: none;
        }

        [part='week-number'][hidden],
        [part='weekday'][hidden] {
          display: none;
        }

        [part='weekday'],
        [part='date'] {
          width: calc(100% / 7);
          padding: 0;
          font-weight: normal;
        }

        [part='weekday']:empty,
        [part='week-number'] {
          width: 12.5%;
          flex-shrink: 0;
          padding: 0;
        }

        :host([week-numbers]) [part='weekday']:not(:empty),
        :host([week-numbers]) [part='date'] {
          width: 12.5%;
        }
      </style>

      <div part="month-header" id="month-header" aria-hidden="true">[[_getTitle(month, i18n.monthNames)]]</div>
      <table
        id="monthGrid"
        role="grid"
        aria-labelledby="month-header"
        on-touchend="_preventDefault"
        on-touchstart="_onMonthGridTouchStart"
      >
        <thead id="weekdays-container">
          <tr role="row" part="weekdays">
            <th
              part="weekday"
              aria-hidden="true"
              hidden$="[[!_showWeekSeparator(showWeekNumbers, i18n.firstDayOfWeek)]]"
            ></th>
            <template
              is="dom-repeat"
              items="[[_getWeekDayNames(i18n.weekdays, i18n.weekdaysShort, showWeekNumbers, i18n.firstDayOfWeek)]]"
            >
              <th role="columnheader" part="weekday" scope="col" abbr$="[[item.weekDay]]" aria-hidden="true">
                [[item.weekDayShort]]
              </th>
            </template>
          </tr>
        </thead>
        <tbody id="days-container">
          <template is="dom-repeat" items="[[_weeks]]" as="week">
            <tr role="row">
              <td
                part="week-number"
                aria-hidden="true"
                hidden$="[[!_showWeekSeparator(showWeekNumbers, i18n.firstDayOfWeek)]]"
              >
                [[__getWeekNumber(week)]]
              </td>
              <template is="dom-repeat" items="[[week]]">
                <td
                  role="gridcell"
                  part="date"
                  date="[[item]]"
                  today$="[[_isToday(item)]]"
                  focused$="[[__isDayFocused(item, focusedDate)]]"
                  tabindex$="[[__getDayTabindex(item, focusedDate)]]"
                  selected$="[[__isDaySelected(item, selectedDate)]]"
                  disabled$="[[__isDayDisabled(item, minDate, maxDate)]]"
                  aria-selected$="[[__getDayAriaSelected(item, selectedDate)]]"
                  aria-disabled$="[[__getDayAriaDisabled(item, minDate, maxDate)]]"
                  aria-label$="[[__getDayAriaLabel(item)]]"
                  >[[_getDate(item)]]</td
                >
              </template>
            </tr>
          </template>
        </tbody>
      </table>
    `}static get is(){return"vaadin-month-calendar"}static get properties(){return{month:{type:Date,value:new Date},selectedDate:{type:Date,notify:!0},focusedDate:Date,showWeekNumbers:{type:Boolean,value:!1},i18n:{type:Object},ignoreTaps:Boolean,_notTapping:Boolean,minDate:{type:Date,value:null},maxDate:{type:Date,value:null},_days:{type:Array,computed:"_getDays(month, i18n.firstDayOfWeek, minDate, maxDate)"},_weeks:{type:Array,computed:"_getWeeks(_days)"},disabled:{type:Boolean,reflectToAttribute:!0,computed:"_isDisabled(month, minDate, maxDate)"}}}static get observers(){return["_showWeekNumbersChanged(showWeekNumbers, i18n.firstDayOfWeek)","__focusedDateChanged(focusedDate, _days)"]}ready(){super.ready(),addListener$1(this.$.monthGrid,"tap",this._handleTap.bind(this))}get focusableDateElement(){return[...this.shadowRoot.querySelectorAll("[part=date]")].find(C=>dateEquals(C.date,this.focusedDate))}_isDisabled(C,T,V){const K=new Date(0,0);K.setFullYear(C.getFullYear()),K.setMonth(C.getMonth()),K.setDate(1);const Y=new Date(0,0);return Y.setFullYear(C.getFullYear()),Y.setMonth(C.getMonth()+1),Y.setDate(0),T&&V&&T.getMonth()===V.getMonth()&&T.getMonth()===C.getMonth()&&V.getDate()-T.getDate()>=0?!1:!dateAllowed(K,T,V)&&!dateAllowed(Y,T,V)}_getTitle(C,T){if(!(C===void 0||T===void 0))return this.i18n.formatTitle(T[C.getMonth()],C.getFullYear())}_onMonthGridTouchStart(){this._notTapping=!1,setTimeout(()=>{this._notTapping=!0},300)}_dateAdd(C,T){C.setDate(C.getDate()+T)}_applyFirstDayOfWeek(C,T){if(!(C===void 0||T===void 0))return C.slice(T).concat(C.slice(0,T))}_getWeekDayNames(C,T,V,K){if(!(C===void 0||T===void 0||V===void 0||K===void 0))return C=this._applyFirstDayOfWeek(C,K),T=this._applyFirstDayOfWeek(T,K),C=C.map((Y,J)=>({weekDay:Y,weekDayShort:T[J]})),C}__focusedDateChanged(C,T){T.some(V=>dateEquals(V,C))?this.removeAttribute("aria-hidden"):this.setAttribute("aria-hidden","true")}_getDate(C){return C?C.getDate():""}_showWeekNumbersChanged(C,T){C&&T===1?this.setAttribute("week-numbers",""):this.removeAttribute("week-numbers")}_showWeekSeparator(C,T){return C&&T===1}_isToday(C){return dateEquals(new Date,C)}_getDays(C,T){if(C===void 0||T===void 0)return;const V=new Date(0,0);for(V.setFullYear(C.getFullYear()),V.setMonth(C.getMonth()),V.setDate(1);V.getDay()!==T;)this._dateAdd(V,-1);const K=[],Y=V.getMonth(),J=C.getMonth();for(;V.getMonth()===J||V.getMonth()===Y;)K.push(V.getMonth()===J?new Date(V.getTime()):null),this._dateAdd(V,1);return K}_getWeeks(C){return C.reduce((T,V,K)=>(K%7===0&&T.push([]),T[T.length-1].push(V),T),[])}_handleTap(C){!this.ignoreTaps&&!this._notTapping&&C.target.date&&!C.target.hasAttribute("disabled")&&(this.selectedDate=C.target.date,this.dispatchEvent(new CustomEvent("date-tap",{detail:{date:C.target.date},bubbles:!0,composed:!0})))}_preventDefault(C){C.preventDefault()}__getWeekNumber(C){const T=C.reduce((V,K)=>!V&&K?K:V);return getISOWeekNumber(T)}__isDayFocused(C,T){return dateEquals(C,T)}__isDaySelected(C,T){return dateEquals(C,T)}__getDayAriaSelected(C,T){if(this.__isDaySelected(C,T))return"true"}__isDayDisabled(C,T,V){return!dateAllowed(C,T,V)}__getDayAriaDisabled(C,T,V){if(!(C===void 0||T===void 0||V===void 0)&&this.__isDayDisabled(C,T,V))return"true"}__getDayAriaLabel(C){if(!C)return"";let T=`${this._getDate(C)} ${this.i18n.monthNames[C.getMonth()]} ${C.getFullYear()}, ${this.i18n.weekdays[C.getDay()]}`;return this._isToday(C)&&(T+=`, ${this.i18n.today}`),T}__getDayTabindex(C,T){return this.__isDayFocused(C,T)?"0":"-1"}}customElements.define(MonthCalendar.is,MonthCalendar);/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class InfiniteScroller extends PolymerElement{static get template(){return html`
      <style>
        :host {
          display: block;
          overflow: hidden;
          height: 500px;
        }

        #scroller {
          position: relative;
          height: 100%;
          overflow: auto;
          outline: none;
          margin-right: -40px;
          -webkit-overflow-scrolling: touch;
          overflow-x: hidden;
        }

        #scroller.notouchscroll {
          -webkit-overflow-scrolling: auto;
        }

        #scroller::-webkit-scrollbar {
          display: none;
        }

        .buffer {
          position: absolute;
          width: var(--vaadin-infinite-scroller-buffer-width, 100%);
          box-sizing: border-box;
          padding-right: 40px;
          top: var(--vaadin-infinite-scroller-buffer-offset, 0);
          animation: fadein 0.2s;
        }

        @keyframes fadein {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      </style>

      <div id="scroller" on-scroll="_scroll">
        <div class="buffer"></div>
        <div class="buffer"></div>
        <div id="fullHeight"></div>
      </div>
    `}static get is(){return"vaadin-infinite-scroller"}static get properties(){return{bufferSize:{type:Number,value:20},_initialScroll:{value:5e5},_initialIndex:{value:0},_buffers:Array,_preventScrollEvent:Boolean,_mayHaveMomentum:Boolean,_initialized:Boolean,active:{type:Boolean,observer:"_activated"}}}ready(){super.ready(),this._buffers=[...this.shadowRoot.querySelectorAll(".buffer")],this.$.fullHeight.style.height=`${this._initialScroll*2}px`;const C=this.querySelector("template");this._TemplateClass=templatize(C,this,{forwardHostProp(T,V){T!=="index"&&this._buffers.forEach(K=>{[...K.children].forEach(Y=>{Y._itemWrapper.instance[T]=V})})}}),isFirefox&&(this.$.scroller.tabIndex=-1)}forceUpdate(){this._debouncerUpdateClones&&(this._buffers[0].updated=this._buffers[1].updated=!1,this._updateClones(),this._debouncerUpdateClones.cancel())}_activated(C){C&&!this._initialized&&(this._createPool(),this._initialized=!0)}_finishInit(){this._initDone||(this._buffers.forEach(C=>{[...C.children].forEach(T=>{this._ensureStampedInstance(T._itemWrapper)})}),this._buffers[0].translateY||this._reset(),this._initDone=!0)}_translateBuffer(C){const T=C?1:0;this._buffers[T].translateY=this._buffers[T?0:1].translateY+this._bufferHeight*(T?-1:1),this._buffers[T].style.transform=`translate3d(0, ${this._buffers[T].translateY}px, 0)`,this._buffers[T].updated=!1,this._buffers.reverse()}_scroll(){if(this._scrollDisabled)return;const C=this.$.scroller.scrollTop;(C<this._bufferHeight||C>this._initialScroll*2-this._bufferHeight)&&(this._initialIndex=~~this.position,this._reset());const T=this.itemHeight+this.bufferOffset,V=C>this._buffers[1].translateY+T,K=C<this._buffers[0].translateY+T;(V||K)&&(this._translateBuffer(K),this._updateClones()),this._preventScrollEvent||(this.dispatchEvent(new CustomEvent("custom-scroll",{bubbles:!1,composed:!0})),this._mayHaveMomentum=!0),this._preventScrollEvent=!1,this._debouncerScrollFinish=Debouncer$1.debounce(this._debouncerScrollFinish,timeOut.after(200),()=>{const Y=this.$.scroller.getBoundingClientRect();!this._isVisible(this._buffers[0],Y)&&!this._isVisible(this._buffers[1],Y)&&(this.position=this.position)})}get bufferOffset(){return this._buffers[0].offsetTop}get position(){return(this.$.scroller.scrollTop-this._buffers[0].translateY)/this.itemHeight+this._firstIndex}set position(C){this._preventScrollEvent=!0,C>this._firstIndex&&C<this._firstIndex+this.bufferSize*2?this.$.scroller.scrollTop=this.itemHeight*(C-this._firstIndex)+this._buffers[0].translateY:(this._initialIndex=~~C,this._reset(),this._scrollDisabled=!0,this.$.scroller.scrollTop+=C%1*this.itemHeight,this._scrollDisabled=!1),this._mayHaveMomentum&&(this.$.scroller.classList.add("notouchscroll"),this._mayHaveMomentum=!1,setTimeout(()=>{this.$.scroller.classList.remove("notouchscroll")},10))}get itemHeight(){if(!this._itemHeightVal){const C=getComputedStyle(this).getPropertyValue("--vaadin-infinite-scroller-item-height"),T="background-position";this.$.fullHeight.style.setProperty(T,C);const V=getComputedStyle(this.$.fullHeight).getPropertyValue(T);this.$.fullHeight.style.removeProperty(T),this._itemHeightVal=parseFloat(V)}return this._itemHeightVal}get _bufferHeight(){return this.itemHeight*this.bufferSize}_reset(){this._scrollDisabled=!0,this.$.scroller.scrollTop=this._initialScroll,this._buffers[0].translateY=this._initialScroll-this._bufferHeight,this._buffers[1].translateY=this._initialScroll,this._buffers.forEach(C=>{C.style.transform=`translate3d(0, ${C.translateY}px, 0)`}),this._buffers[0].updated=this._buffers[1].updated=!1,this._updateClones(!0),this._debouncerUpdateClones=Debouncer$1.debounce(this._debouncerUpdateClones,timeOut.after(200),()=>{this._buffers[0].updated=this._buffers[1].updated=!1,this._updateClones()}),this._scrollDisabled=!1}_createPool(){const C=this.getBoundingClientRect();this._buffers.forEach(T=>{for(let V=0;V<this.bufferSize;V++){const K=document.createElement("div");K.style.height=`${this.itemHeight}px`,K.instance={};const J=`vaadin-infinite-scroller-item-content-${InfiniteScroller._contentIndex=InfiniteScroller._contentIndex+1||0}`,ee=document.createElement("slot");ee.setAttribute("name",J),ee._itemWrapper=K,T.appendChild(ee),K.setAttribute("slot",J),this.appendChild(K),setTimeout(()=>{this._isVisible(K,C)&&this._ensureStampedInstance(K)},1)}}),setTimeout(()=>{afterNextRender(this,this._finishInit.bind(this))},1)}_ensureStampedInstance(C){if(C.firstElementChild)return;const T=C.instance;C.instance=new this._TemplateClass({}),C.appendChild(C.instance.root),Object.keys(T).forEach(V=>{C.instance.set(V,T[V])})}_updateClones(C){this._firstIndex=~~((this._buffers[0].translateY-this._initialScroll)/this.itemHeight)+this._initialIndex;const T=C?this.$.scroller.getBoundingClientRect():void 0;this._buffers.forEach((V,K)=>{if(!V.updated){const Y=this._firstIndex+this.bufferSize*K;[...V.children].forEach((J,ee)=>{const te=J._itemWrapper;(!C||this._isVisible(te,T))&&(te.instance.index=Y+ee)}),V.updated=!0}})}_isVisible(C,T){const V=C.getBoundingClientRect();return V.bottom>T.top&&V.top<T.bottom}}customElements.define(InfiniteScroller.is,InfiniteScroller);/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class MediaQueryController{constructor(C,T){this.query=C,this.callback=T,this._boundQueryHandler=this._queryHandler.bind(this)}hostConnected(){this._removeListener(),this._mediaQuery=window.matchMedia(this.query),this._addListener(),this._queryHandler(this._mediaQuery)}hostDisconnected(){this._removeListener()}_addListener(){this._mediaQuery&&this._mediaQuery.addListener(this._boundQueryHandler)}_removeListener(){this._mediaQuery&&this._mediaQuery.removeListener(this._boundQueryHandler),this._mediaQuery=null}_queryHandler(C){typeof this.callback=="function"&&this.callback(C.matches)}}/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class DatePickerOverlayContent extends ControllerMixin(ThemableMixin(DirMixin$1(PolymerElement))){static get template(){return html`
      <style>
        :host {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          outline: none;
        }

        [part='overlay-header'] {
          display: flex;
          flex-shrink: 0;
          flex-wrap: nowrap;
          align-items: center;
        }

        :host(:not([fullscreen])) [part='overlay-header'] {
          display: none;
        }

        [part='label'] {
          flex-grow: 1;
        }

        [hidden] {
          display: none !important;
        }

        [part='years-toggle-button'] {
          display: flex;
        }

        #scrollers {
          display: flex;
          height: 100%;
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        [part='months'],
        [part='years'] {
          height: 100%;
        }

        [part='months'] {
          --vaadin-infinite-scroller-item-height: 270px;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        #scrollers[desktop] [part='months'] {
          right: 50px;
          transform: none !important;
        }

        [part='years'] {
          --vaadin-infinite-scroller-item-height: 80px;
          width: 50px;
          position: absolute;
          right: 0;
          transform: translateX(100%);
          -webkit-tap-highlight-color: transparent;
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
          /* Center the year scroller position. */
          --vaadin-infinite-scroller-buffer-offset: 50%;
        }

        #scrollers[desktop] [part='years'] {
          position: absolute;
          transform: none !important;
        }

        [part='years']::before {
          content: '';
          display: block;
          background: transparent;
          width: 0;
          height: 0;
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          border-width: 6px;
          border-style: solid;
          border-color: transparent;
          border-left-color: #000;
        }

        :host(.animate) [part='months'],
        :host(.animate) [part='years'] {
          transition: all 200ms;
        }

        [part='toolbar'] {
          display: flex;
          justify-content: space-between;
          z-index: 2;
          flex-shrink: 0;
        }
      </style>

      <div part="overlay-header" on-touchend="_preventDefault" desktop$="[[_desktopMode]]" aria-hidden="true">
        <div part="label">[[_formatDisplayed(selectedDate, i18n.formatDate, label)]]</div>
        <div part="clear-button" hidden$="[[!selectedDate]]"></div>
        <div part="toggle-button"></div>

        <div part="years-toggle-button" hidden$="[[_desktopMode]]" aria-hidden="true">
          [[_yearAfterXMonths(_visibleMonthIndex)]]
        </div>
      </div>

      <div id="scrollers" desktop$="[[_desktopMode]]">
        <vaadin-infinite-scroller
          id="monthScroller"
          on-custom-scroll="_onMonthScroll"
          on-touchstart="_onMonthScrollTouchStart"
          buffer-size="3"
          active="[[initialPosition]]"
          part="months"
        >
          <template>
            <vaadin-month-calendar
              i18n="[[i18n]]"
              month="[[_dateAfterXMonths(index)]]"
              selected-date="{{selectedDate}}"
              focused-date="[[focusedDate]]"
              ignore-taps="[[_ignoreTaps]]"
              show-week-numbers="[[showWeekNumbers]]"
              min-date="[[minDate]]"
              max-date="[[maxDate]]"
              part="month"
              theme$="[[_theme]]"
              on-keydown="__onMonthCalendarKeyDown"
            >
            </vaadin-month-calendar>
          </template>
        </vaadin-infinite-scroller>
        <vaadin-infinite-scroller
          id="yearScroller"
          on-custom-scroll="_onYearScroll"
          on-touchstart="_onYearScrollTouchStart"
          buffer-size="12"
          active="[[initialPosition]]"
          part="years"
          aria-hidden="true"
        >
          <template>
            <div
              part="year-number"
              current$="[[_isCurrentYear(index)]]"
              selected$="[[_isSelectedYear(index, selectedDate)]]"
            >
              [[_yearAfterXYears(index)]]
            </div>
            <div part="year-separator" aria-hidden="true"></div>
          </template>
        </vaadin-infinite-scroller>
      </div>

      <div on-touchend="_preventDefault" role="toolbar" part="toolbar">
        <vaadin-button
          id="todayButton"
          part="today-button"
          theme="tertiary"
          disabled="[[!_isTodayAllowed(minDate, maxDate)]]"
          on-keydown="__onTodayButtonKeyDown"
        >
          [[i18n.today]]
        </vaadin-button>
        <vaadin-button id="cancelButton" part="cancel-button" theme="tertiary" on-keydown="__onCancelButtonKeyDown">
          [[i18n.cancel]]
        </vaadin-button>
      </div>
    `}static get is(){return"vaadin-date-picker-overlay-content"}static get properties(){return{scrollDuration:{type:Number,value:300},selectedDate:{type:Date,value:null},focusedDate:{type:Date,notify:!0,observer:"_focusedDateChanged"},_focusedMonthDate:Number,initialPosition:{type:Date,observer:"_initialPositionChanged"},_originDate:{value:new Date},_visibleMonthIndex:Number,_desktopMode:Boolean,_desktopMediaQuery:{type:String,value:"(min-width: 375px)"},_translateX:{observer:"_translateXChanged"},_yearScrollerWidth:{value:50},i18n:{type:Object},showWeekNumbers:{type:Boolean},_ignoreTaps:Boolean,_notTapping:Boolean,minDate:Date,maxDate:Date,label:String}}get __isRTL(){return this.getAttribute("dir")==="rtl"}get __useSubMonthScrolling(){return this.$.monthScroller.clientHeight<this.$.monthScroller.itemHeight+this.$.monthScroller.bufferOffset}get calendars(){return[...this.shadowRoot.querySelectorAll("vaadin-month-calendar")]}get focusableDateElement(){return this.calendars.map(C=>C.focusableDateElement).find(Boolean)}ready(){super.ready(),this.setAttribute("role","dialog"),addListener$1(this.$.scrollers,"track",this._track.bind(this)),addListener$1(this.shadowRoot.querySelector('[part="clear-button"]'),"tap",this._clear.bind(this)),addListener$1(this.shadowRoot.querySelector('[part="today-button"]'),"tap",this._onTodayTap.bind(this)),addListener$1(this.shadowRoot.querySelector('[part="cancel-button"]'),"tap",this._cancel.bind(this)),addListener$1(this.shadowRoot.querySelector('[part="toggle-button"]'),"tap",this._cancel.bind(this)),addListener$1(this.shadowRoot.querySelector('[part="years"]'),"tap",this._onYearTap.bind(this)),addListener$1(this.shadowRoot.querySelector('[part="years-toggle-button"]'),"tap",this._toggleYearScroller.bind(this)),this.addController(new MediaQueryController(this._desktopMediaQuery,C=>{this._desktopMode=C}))}connectedCallback(){super.connectedCallback(),this._closeYearScroller(),this._toggleAnimateClass(!0),setTouchAction$1(this.$.scrollers,"pan-y")}focusCancel(){this.$.cancelButton.focus()}scrollToDate(C,T){const V=this.__useSubMonthScrolling?this._calculateWeekScrollOffset(C):0;this._scrollToPosition(this._differenceInMonths(C,this._originDate)+V,T),this.$.monthScroller.forceUpdate()}_selectDate(C){this.selectedDate=C,this.dispatchEvent(new CustomEvent("date-selected",{detail:{date:C},bubbles:!0,composed:!0}))}_focusedDateChanged(C){this.revealDate(C)}_isCurrentYear(C){return C===0}_isSelectedYear(C,T){if(T)return T.getFullYear()===this._originDate.getFullYear()+C}revealDate(C,T=!0){if(!C)return;const V=this._differenceInMonths(C,this._originDate);if(this.__useSubMonthScrolling){const te=this._calculateWeekScrollOffset(C);this._scrollToPosition(V+te,T);return}const K=this.$.monthScroller.position>V,J=Math.max(this.$.monthScroller.itemHeight,this.$.monthScroller.clientHeight-this.$.monthScroller.bufferOffset*2)/this.$.monthScroller.itemHeight,ee=this.$.monthScroller.position+J-1<V;K?this._scrollToPosition(V,T):ee&&this._scrollToPosition(V-J+1,T)}_calculateWeekScrollOffset(C){const T=new Date(0,0);T.setFullYear(C.getFullYear()),T.setMonth(C.getMonth()),T.setDate(1);let V=0;for(;T.getDate()<C.getDate();)T.setDate(T.getDate()+1),T.getDay()===this.i18n.firstDayOfWeek&&(V+=1);return V/6}_initialPositionChanged(C){this.scrollToDate(C)}_repositionYearScroller(){this._visibleMonthIndex=Math.floor(this.$.monthScroller.position),this.$.yearScroller.position=(this.$.monthScroller.position+this._originDate.getMonth())/12}_repositionMonthScroller(){this.$.monthScroller.position=this.$.yearScroller.position*12-this._originDate.getMonth(),this._visibleMonthIndex=Math.floor(this.$.monthScroller.position)}_onMonthScroll(){this._repositionYearScroller(),this._doIgnoreTaps()}_onYearScroll(){this._repositionMonthScroller(),this._doIgnoreTaps()}_onYearScrollTouchStart(){this._notTapping=!1,setTimeout(()=>{this._notTapping=!0},300),this._repositionMonthScroller()}_onMonthScrollTouchStart(){this._repositionYearScroller()}_doIgnoreTaps(){this._ignoreTaps=!0,this._debouncer=Debouncer$1.debounce(this._debouncer,timeOut.after(300),()=>{this._ignoreTaps=!1})}_formatDisplayed(C,T,V){return C?T(extractDateParts(C)):V}_onTodayTap(){const C=new Date;Math.abs(this.$.monthScroller.position-this._differenceInMonths(C,this._originDate))<.001?(this._selectDate(C),this._close()):this._scrollToCurrentMonth()}_scrollToCurrentMonth(){this.focusedDate&&(this.focusedDate=new Date),this.scrollToDate(new Date,!0)}_onYearTap(C){if(!this._ignoreTaps&&!this._notTapping){const V=(C.detail.y-(this.$.yearScroller.getBoundingClientRect().top+this.$.yearScroller.clientHeight/2))/this.$.yearScroller.itemHeight;this._scrollToPosition(this.$.monthScroller.position+V*12,!0)}}_scrollToPosition(C,T){if(this._targetPosition!==void 0){this._targetPosition=C;return}if(!T){this.$.monthScroller.position=C,this._targetPosition=void 0,this._repositionYearScroller(),this.__tryFocusDate();return}this._targetPosition=C;let V;this._revealPromise=new Promise(te=>{V=te});const K=(te,ie,re,se)=>(te/=se/2,te<1?re/2*te*te+ie:(te-=1,-re/2*(te*(te-2)-1)+ie));let Y=0;const J=this.$.monthScroller.position,ee=te=>{Y=Y||te;const ie=te-Y;if(ie<this.scrollDuration){const re=K(ie,J,this._targetPosition-J,this.scrollDuration);this.$.monthScroller.position=re,window.requestAnimationFrame(ee)}else this.dispatchEvent(new CustomEvent("scroll-animation-finished",{bubbles:!0,composed:!0,detail:{position:this._targetPosition,oldPosition:J}})),this.$.monthScroller.position=this._targetPosition,this._targetPosition=void 0,V(),this._revealPromise=void 0;setTimeout(this._repositionYearScroller.bind(this),1)};window.requestAnimationFrame(ee)}_limit(C,T){return Math.min(T.max,Math.max(T.min,C))}_handleTrack(C){if(Math.abs(C.detail.dx)<10||Math.abs(C.detail.ddy)>10)return;Math.abs(C.detail.ddx)>this._yearScrollerWidth/3&&this._toggleAnimateClass(!0);const T=this._translateX+C.detail.ddx;this._translateX=this._limit(T,{min:0,max:this._yearScrollerWidth})}_track(C){if(!this._desktopMode)switch(C.detail.state){case"start":this._toggleAnimateClass(!1);break;case"track":this._handleTrack(C);break;case"end":this._toggleAnimateClass(!0),this._translateX>=this._yearScrollerWidth/2?this._closeYearScroller():this._openYearScroller();break}}_toggleAnimateClass(C){C?this.classList.add("animate"):this.classList.remove("animate")}_toggleYearScroller(){this._isYearScrollerVisible()?this._closeYearScroller():this._openYearScroller()}_openYearScroller(){this._translateX=0,this.setAttribute("years-visible","")}_closeYearScroller(){this.removeAttribute("years-visible"),this._translateX=this._yearScrollerWidth}_isYearScrollerVisible(){return this._translateX<this._yearScrollerWidth/2}_translateXChanged(C){this._desktopMode||(this.$.monthScroller.style.transform=`translateX(${C-this._yearScrollerWidth}px)`,this.$.yearScroller.style.transform=`translateX(${C}px)`)}_yearAfterXYears(C){const T=new Date(this._originDate);return T.setFullYear(parseInt(C)+this._originDate.getFullYear()),T.getFullYear()}_yearAfterXMonths(C){return this._dateAfterXMonths(C).getFullYear()}_dateAfterXMonths(C){const T=new Date(this._originDate);return T.setDate(1),T.setMonth(parseInt(C)+this._originDate.getMonth()),T}_differenceInMonths(C,T){return(C.getFullYear()-T.getFullYear())*12-T.getMonth()+C.getMonth()}_clear(){this._selectDate("")}_close(){this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}_cancel(){this.focusedDate=this.selectedDate,this._close()}_preventDefault(C){C.preventDefault()}__toggleDate(C){dateEquals(C,this.selectedDate)?(this._clear(),this.focusedDate=C):this._selectDate(C)}__onMonthCalendarKeyDown(C){let T=!1;switch(C.key){case"ArrowDown":this._moveFocusByDays(7),T=!0;break;case"ArrowUp":this._moveFocusByDays(-7),T=!0;break;case"ArrowRight":this._moveFocusByDays(this.__isRTL?-1:1),T=!0;break;case"ArrowLeft":this._moveFocusByDays(this.__isRTL?1:-1),T=!0;break;case"Enter":this._selectDate(this.focusedDate),this._close(),T=!0;break;case" ":this.__toggleDate(this.focusedDate),T=!0;break;case"Home":this._moveFocusInsideMonth(this.focusedDate,"minDate"),T=!0;break;case"End":this._moveFocusInsideMonth(this.focusedDate,"maxDate"),T=!0;break;case"PageDown":this._moveFocusByMonths(C.shiftKey?12:1),T=!0;break;case"PageUp":this._moveFocusByMonths(C.shiftKey?-12:-1),T=!0;break;case"Tab":this._onTabKeyDown(C,"calendar");break}T&&(C.preventDefault(),C.stopPropagation())}_onTabKeyDown(C,T){switch(C.stopPropagation(),T){case"calendar":C.shiftKey&&(C.preventDefault(),this.hasAttribute("fullscreen")?this.$.cancelButton.focus():this.__focusInput());break;case"today":C.shiftKey&&(C.preventDefault(),this.focusDateElement());break;case"cancel":C.shiftKey||(C.preventDefault(),this.hasAttribute("fullscreen")?this.focusDateElement():this.__focusInput());break}}__onTodayButtonKeyDown(C){C.key==="Tab"&&this._onTabKeyDown(C,"today")}__onCancelButtonKeyDown(C){C.key==="Tab"&&this._onTabKeyDown(C,"cancel")}__focusInput(){this.dispatchEvent(new CustomEvent("focus-input",{bubbles:!0,composed:!0}))}__tryFocusDate(){if(this.__pendingDateFocus){const T=this.focusableDateElement;T&&dateEquals(T.date,this.__pendingDateFocus)&&(delete this.__pendingDateFocus,T.focus())}}async focusDate(C,T){const V=C||this.selectedDate||this.initialPosition||new Date;this.focusedDate=V,T||(this._focusedMonthDate=V.getDate()),await this.focusDateElement(!1)}async focusDateElement(C=!0){this.__pendingDateFocus=this.focusedDate,this.calendars.length||await new Promise(T=>{setTimeout(T)}),C&&this.revealDate(this.focusedDate),this._revealPromise&&await this._revealPromise,this.__tryFocusDate()}_focusClosestDate(C){this.focusDate(getClosestDate(C,[this.minDate,this.maxDate]))}_moveFocusByDays(C){const T=this.focusedDate,V=new Date(0,0);V.setFullYear(T.getFullYear()),V.setMonth(T.getMonth()),V.setDate(T.getDate()+C),this._dateAllowed(V,this.minDate,this.maxDate)?this.focusDate(V):this._dateAllowed(T,this.minDate,this.maxDate)?C>0?this.focusDate(this.maxDate):this.focusDate(this.minDate):this._focusClosestDate(T)}_moveFocusByMonths(C){const T=this.focusedDate,V=new Date(0,0);V.setFullYear(T.getFullYear()),V.setMonth(T.getMonth()+C);const K=V.getMonth();V.setDate(this._focusedMonthDate||(this._focusedMonthDate=T.getDate())),V.getMonth()!==K&&V.setDate(0),this._dateAllowed(V,this.minDate,this.maxDate)?this.focusDate(V,!0):this._dateAllowed(T,this.minDate,this.maxDate)?C>0?this.focusDate(this.maxDate):this.focusDate(this.minDate):this._focusClosestDate(T)}_moveFocusInsideMonth(C,T){const V=new Date(0,0);V.setFullYear(C.getFullYear()),T==="minDate"?(V.setMonth(C.getMonth()),V.setDate(1)):(V.setMonth(C.getMonth()+1),V.setDate(0)),this._dateAllowed(V,this.minDate,this.maxDate)?this.focusDate(V):this._dateAllowed(C,this.minDate,this.maxDate)?this.focusDate(this[T]):this._focusClosestDate(C)}_dateAllowed(C,T,V){return(!T||C>=T)&&(!V||C<=V)}_isTodayAllowed(C,T){const V=new Date,K=new Date(0,0);return K.setFullYear(V.getFullYear()),K.setMonth(V.getMonth()),K.setDate(V.getDate()),this._dateAllowed(K,C,T)}}customElements.define(DatePickerOverlayContent.is,DatePickerOverlayContent);/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class VirtualKeyboardController{constructor(C){this.host=C,C.addEventListener("opened-changed",()=>{C.opened||this.__setVirtualKeyboardEnabled(!1)}),C.addEventListener("blur",()=>this.__setVirtualKeyboardEnabled(!0)),C.addEventListener("touchstart",()=>this.__setVirtualKeyboardEnabled(!0))}__setVirtualKeyboardEnabled(C){this.host.inputElement&&(this.host.inputElement.inputMode=C?"":"none")}}/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const DatePickerMixin=$=>class extends ControllerMixin(DelegateFocusMixin(InputConstraintsMixin(KeyboardMixin($)))){static get properties(){return{_selectedDate:{type:Date},_focusedDate:Date,value:{type:String,notify:!0,value:""},initialPosition:String,opened:{type:Boolean,reflectToAttribute:!0,notify:!0,observer:"_openedChanged"},autoOpenDisabled:Boolean,showWeekNumbers:{type:Boolean},_fullscreen:{type:Boolean,value:!1},_fullscreenMediaQuery:{value:"(max-width: 420px), (max-height: 420px)"},i18n:{type:Object,value:()=>({monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],weekdays:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],weekdaysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],firstDayOfWeek:0,week:"Week",calendar:"Calendar",today:"Today",cancel:"Cancel",referenceDate:"",formatDate(T){const V=String(T.year).replace(/\d+/,K=>"0000".substr(K.length)+K);return[T.month+1,T.day,V].join("/")},parseDate(T){const V=T.split("/"),K=new Date;let Y,J=K.getMonth(),ee=K.getFullYear();if(V.length===3){if(J=parseInt(V[0])-1,Y=parseInt(V[1]),ee=parseInt(V[2]),V[2].length<3&&ee>=0){const te=this.referenceDate?parseDate(this.referenceDate):new Date;ee=getAdjustedYear(te,ee,J,Y)}}else V.length===2?(J=parseInt(V[0])-1,Y=parseInt(V[1])):V.length===1&&(Y=parseInt(V[0]));if(Y!==void 0)return{day:Y,month:J,year:ee}},formatTitle:(T,V)=>`${T} ${V}`})},min:{type:String},max:{type:String},_minDate:{type:Date,computed:"__computeMinOrMaxDate(min)"},_maxDate:{type:Date,computed:"__computeMinOrMaxDate(max)"},_noInput:{type:Boolean,computed:"_isNoInput(inputElement, _fullscreen, _ios, i18n, opened, autoOpenDisabled)"},_ios:{type:Boolean,value:isIOS},_focusOverlayOnOpen:Boolean,_overlayInitialized:Boolean}}static get observers(){return["_selectedDateChanged(_selectedDate, i18n.formatDate)","_focusedDateChanged(_focusedDate, i18n.formatDate)"]}static get constraints(){return[...super.constraints,"min","max"]}get clearElement(){return null}get _inputValue(){return this.inputElement?this.inputElement.value:void 0}set _inputValue(T){this.inputElement&&(this.inputElement.value=T)}get _nativeInput(){return this.inputElement?this.inputElement.focusElement||this.inputElement:null}constructor(){super(),this._boundOnClick=this._onClick.bind(this),this._boundOnScroll=this._onScroll.bind(this)}_onFocus(T){super._onFocus(T),this._noInput&&T.target.blur()}_onBlur(T){super._onBlur(T),this.opened||(this.autoOpenDisabled&&this._selectParsedOrFocusedDate(),this.validate(),this._inputValue===""&&this.value!==""&&(this.value=""))}ready(){super.ready(),this.addEventListener("click",this._boundOnClick),this.addController(new MediaQueryController(this._fullscreenMediaQuery,T=>{this._fullscreen=T})),this.addController(new VirtualKeyboardController(this))}disconnectedCallback(){super.disconnectedCallback(),this.opened=!1}_propertiesChanged(T,V,K){super._propertiesChanged(T,V,K),"value"in V&&this.__dispatchChange&&(this.dispatchEvent(new CustomEvent("change",{bubbles:!0})),this.__dispatchChange=!1)}open(){!this.disabled&&!this.readonly&&(this.opened=!0)}close(){(this._overlayInitialized||this.autoOpenDisabled)&&this.$.overlay.close()}_initOverlay(){this.$.overlay.removeAttribute("disable-upgrade"),this._overlayInitialized=!0,this.$.overlay.addEventListener("opened-changed",T=>{this.opened=T.detail.value}),this.$.overlay.addEventListener("vaadin-overlay-escape-press",()=>{this._focusedDate=this._selectedDate,this._close()}),this._overlayContent.addEventListener("close",()=>{this._close()}),this._overlayContent.addEventListener("focus-input",this._focusAndSelect.bind(this)),this._overlayContent.addEventListener("date-tap",T=>{this.__userConfirmedDate=!0,this._selectDate(T.detail.date),this._close()}),this._overlayContent.addEventListener("date-selected",T=>{this.__userConfirmedDate=!0,this._selectDate(T.detail.date)}),this._overlayContent.addEventListener("focusin",()=>{this._keyboardActive&&this._setFocused(!0)}),this.addEventListener("mousedown",()=>this.__bringToFront()),this.addEventListener("touchstart",()=>this.__bringToFront())}checkValidity(){const T=!this._inputValue||!!this._selectedDate&&this._inputValue===this._getFormattedDate(this.i18n.formatDate,this._selectedDate),V=!this._selectedDate||dateAllowed(this._selectedDate,this._minDate,this._maxDate);let K=!0;return this.inputElement&&(this.inputElement.checkValidity?K=this.inputElement.checkValidity():this.inputElement.validate&&(K=this.inputElement.validate())),T&&V&&K}_shouldSetFocus(T){return!this._shouldKeepFocusRing}_shouldRemoveFocus(T){return!this.opened}_setFocused(T){super._setFocused(T),this._shouldKeepFocusRing=T&&this._keyboardActive}_selectDate(T){const V=this._formatISO(T);this.value!==V&&(this.__dispatchChange=!0),this._selectedDate=T}_close(){this._focus(),this.close()}__bringToFront(){requestAnimationFrame(()=>{this.$.overlay.bringToFront()})}_isNoInput(T,V,K,Y,J,ee){return!T||V&&(!ee||J)||K&&J||!Y.parseDate}_formatISO(T){if(!(T instanceof Date))return"";const V=(re,se="00")=>(se+re).substr((se+re).length-se.length);let K="",Y="0000",J=T.getFullYear();J<0?(J=-J,K="-",Y="000000"):T.getFullYear()>=1e4&&(K="+",Y="000000");const ee=K+V(J,Y),te=V(T.getMonth()+1),ie=V(T.getDate());return[ee,te,ie].join("-")}_inputElementChanged(T){super._inputElementChanged(T),T&&(T.autocomplete="off",T.setAttribute("role","combobox"),T.setAttribute("aria-haspopup","dialog"),T.setAttribute("aria-expanded",!!this.opened),this._applyInputValue(this._selectedDate))}_openedChanged(T){T&&!this._overlayInitialized&&this._initOverlay(),this._overlayInitialized&&(this.$.overlay.opened=T),this.inputElement&&this.inputElement.setAttribute("aria-expanded",T)}_selectedDateChanged(T,V){if(T===void 0||V===void 0)return;const K=this._formatISO(T);this.__keepInputValue||this._applyInputValue(T),K!==this.value&&(this.validate(),this.value=K),this._ignoreFocusedDateChange=!0,this._focusedDate=T,this._ignoreFocusedDateChange=!1}_focusedDateChanged(T,V){T===void 0||V===void 0||!this._ignoreFocusedDateChange&&!this._noInput&&this._applyInputValue(T)}__getOverlayTheme(T,V){if(V)return T}_valueChanged(T,V){const K=parseDate(T);if(T&&!K){this.value=V;return}T?dateEquals(this._selectedDate,K)||(this._selectedDate=K,V!==void 0&&this.validate()):this._selectedDate=null,this._toggleHasValue(this._hasValue)}_onOverlayOpened(){const T=parseDate(this.initialPosition),V=this._selectedDate||this._overlayContent.initialPosition||T||new Date;T||dateAllowed(V,this._minDate,this._maxDate)?this._overlayContent.initialPosition=V:this._overlayContent.initialPosition=getClosestDate(V,[this._minDate,this._maxDate]),this._overlayContent.scrollToDate(this._overlayContent.focusedDate||this._overlayContent.initialPosition),this._ignoreFocusedDateChange=!0,this._overlayContent.focusedDate=this._overlayContent.focusedDate||this._overlayContent.initialPosition,this._ignoreFocusedDateChange=!1,window.addEventListener("scroll",this._boundOnScroll,!0),this._focusOverlayOnOpen?(this._overlayContent.focusDateElement(),this._focusOverlayOnOpen=!1):this._focus(),this._noInput&&this.focusElement&&(this.focusElement.blur(),this._overlayContent.focusDateElement())}_selectParsedOrFocusedDate(){if(this._ignoreFocusedDateChange=!0,this.i18n.parseDate){const T=this._inputValue||"",V=this._getParsedDate(T);this._isValidDate(V)?this._selectDate(V):(this.__keepInputValue=!0,this._selectDate(null),this._selectedDate=null,this.__keepInputValue=!1)}else this._focusedDate&&this._selectDate(this._focusedDate);this._ignoreFocusedDateChange=!1}_onOverlayClosed(){window.removeEventListener("scroll",this._boundOnScroll,!0),this.__userConfirmedDate?this.__userConfirmedDate=!1:this._selectParsedOrFocusedDate(),this._nativeInput&&this._nativeInput.selectionStart&&(this._nativeInput.selectionStart=this._nativeInput.selectionEnd),this.value||this.validate()}_onScroll(T){(T.target===window||!this._overlayContent.contains(T.target))&&this._overlayContent._repositionYearScroller()}_focus(){this._noInput||this.inputElement.focus()}_focusAndSelect(){this._focus(),this._setSelectionRange(0,this._inputValue.length)}_applyInputValue(T){this._inputValue=T?this._getFormattedDate(this.i18n.formatDate,T):""}_getFormattedDate(T,V){return T(extractDateParts(V))}_setSelectionRange(T,V){this._nativeInput&&this._nativeInput.setSelectionRange&&this._nativeInput.setSelectionRange(T,V)}_isValidDate(T){return T&&!isNaN(T.getTime())}_onChange(T){this._inputValue===""&&(this.__dispatchChange=!0),T.stopPropagation()}_onClick(T){this._isClearButton(T)||this._onHostClick(T)}_onHostClick(T){(!this.autoOpenDisabled||this._noInput)&&(T.preventDefault(),this.open())}_onClearButtonClick(T){T.preventDefault(),this.value="",this._inputValue="",this.validate(),this.dispatchEvent(new CustomEvent("change",{bubbles:!0}))}_onKeyDown(T){switch(super._onKeyDown(T),this._noInput&&[9].indexOf(T.keyCode)===-1&&T.preventDefault(),T.key){case"ArrowDown":case"ArrowUp":T.preventDefault(),this.opened?this._overlayContent.focusDateElement():(this._focusOverlayOnOpen=!0,this.open());break;case"Tab":this.opened&&(T.preventDefault(),T.stopPropagation(),this._setSelectionRange(0,0),T.shiftKey?this._overlayContent.focusCancel():this._overlayContent.focusDateElement());break}}_onEnter(T){const V=this.value;this.opened?this.close():this._selectParsedOrFocusedDate(),V===this.value&&this.validate()}_onEscape(T){if(!this.opened){if(this.clearButtonVisible&&this.value){T.stopPropagation(),this._onClearButtonClick(T);return}this.autoOpenDisabled?(this.inputElement.value===""&&this._selectDate(null),this._applyInputValue(this._selectedDate)):(this._focusedDate=this._selectedDate,this._selectParsedOrFocusedDate())}}_getParsedDate(T=this._inputValue){const V=this.i18n.parseDate&&this.i18n.parseDate(T);return V&&parseDate(`${V.year}-${V.month+1}-${V.day}`)}_isClearButton(T){return T.composedPath()[0]===this.clearElement}_onInput(){!this.opened&&this.inputElement.value&&!this.autoOpenDisabled&&this.open(),this._userInputValueChanged()}_userInputValueChanged(){if(this._inputValue){const T=this._getParsedDate();this._isValidDate(T)&&(this._ignoreFocusedDateChange=!0,dateEquals(T,this._focusedDate)||(this._focusedDate=T),this._ignoreFocusedDateChange=!1)}}get _overlayContent(){return this.$.overlay.content.querySelector("#overlay-content")}__computeMinOrMaxDate(T){return parseDate(T)}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */registerStyles("vaadin-date-picker",[inputFieldShared,datePickerStyles],{moduleId:"vaadin-date-picker-styles"});class DatePicker extends DatePickerMixin(InputControlMixin(ThemableMixin(ElementMixin(PolymerElement)))){static get is(){return"vaadin-date-picker"}static get template(){return html`
      <style>
        :host([opened]) {
          pointer-events: auto;
        }
      </style>

      <div class="vaadin-date-picker-container">
        <div part="label">
          <slot name="label"></slot>
          <span part="required-indicator" aria-hidden="true" on-click="focus"></span>
        </div>

        <vaadin-input-container
          part="input-field"
          readonly="[[readonly]]"
          disabled="[[disabled]]"
          invalid="[[invalid]]"
          theme$="[[_theme]]"
        >
          <slot name="prefix" slot="prefix"></slot>
          <slot name="input"></slot>
          <div id="clearButton" part="clear-button" slot="suffix" aria-hidden="true"></div>
          <div part="toggle-button" slot="suffix" aria-hidden="true" on-click="_toggle"></div>
        </vaadin-input-container>

        <div part="helper-text">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>

      <vaadin-date-picker-overlay
        id="overlay"
        fullscreen$="[[_fullscreen]]"
        theme$="[[__getOverlayTheme(_theme, _overlayInitialized)]]"
        on-vaadin-overlay-open="_onOverlayOpened"
        on-vaadin-overlay-closing="_onOverlayClosed"
        restore-focus-on-close
        restore-focus-node="[[inputElement]]"
        disable-upgrade
      >
        <template>
          <vaadin-date-picker-overlay-content
            id="overlay-content"
            i18n="[[i18n]]"
            fullscreen$="[[_fullscreen]]"
            label="[[label]]"
            selected-date="[[_selectedDate]]"
            focused-date="{{_focusedDate}}"
            show-week-numbers="[[showWeekNumbers]]"
            min-date="[[_minDate]]"
            max-date="[[_maxDate]]"
            part="overlay-content"
            theme$="[[__getOverlayTheme(_theme, _overlayInitialized)]]"
          ></vaadin-date-picker-overlay-content>
        </template>
      </vaadin-date-picker-overlay>

      <slot name="tooltip"></slot>
    `}get clearElement(){return this.$.clearButton}ready(){super.ready(),this.addController(new InputController(this,T=>{this._setInputElement(T),this._setFocusElement(T),this.stateTarget=T,this.ariaTarget=T})),this.addController(new LabelledInputController(this.inputElement,this._labelController)),this._tooltipController=new TooltipController(this),this.addController(this._tooltipController),this._tooltipController.setPosition("top"),this._tooltipController.setShouldShow(T=>!T.opened),this.shadowRoot.querySelector('[part="toggle-button"]').addEventListener("mousedown",T=>T.preventDefault())}_initOverlay(){super._initOverlay(),this.$.overlay.addEventListener("vaadin-overlay-close",this._onVaadinOverlayClose.bind(this))}_onVaadinOverlayClose(C){C.detail.sourceEvent&&C.detail.sourceEvent.composedPath().includes(this)&&C.preventDefault()}_toggle(C){C.stopPropagation(),this[this._overlayInitialized&&this.$.overlay.opened?"close":"open"]()}_openedChanged(C){super._openedChanged(C),this.$.overlay.positionTarget=this.shadowRoot.querySelector('[part="input-field"]'),this.$.overlay.noVerticalOverlap=!0}}customElements.define(DatePicker.is,DatePicker);var __defProp$r=Object.defineProperty,__getOwnPropDesc$r=Object.getOwnPropertyDescriptor,__decorateClass$r=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$r(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$r(C,T,K),K};let FieldDate=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="",this.name="",this.onChange=$=>{const C=$.target;this.onValueChanged({value:C.value})},this.enabled=!0}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){this.placeholder=$}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}render(){return y$1`
            <vaadin-date-picker
                    label="${this.label}"
                    @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                    ?disabled=${!this.enabled}
                    ?required=${this.required}
                    placeholder="${this.placeholder}"
            ></vaadin-date-picker>
            `}};FieldDate.styles=i$2`
        vaadin-date-picker {
            width: 100%;
        }
    `;__decorateClass$r([e()],FieldDate.prototype,"required",2);__decorateClass$r([e()],FieldDate.prototype,"label",2);__decorateClass$r([e()],FieldDate.prototype,"placeholder",2);__decorateClass$r([e()],FieldDate.prototype,"name",2);__decorateClass$r([e()],FieldDate.prototype,"onChange",2);__decorateClass$r([e()],FieldDate.prototype,"value",2);__decorateClass$r([e()],FieldDate.prototype,"enabled",2);__decorateClass$r([e()],FieldDate.prototype,"field",2);FieldDate=__decorateClass$r([e$1("field-date")],FieldDate);/**
 * @license
 * Copyright (c) 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const loader=i$2`
  [part~='loader'] {
    box-sizing: border-box;
    width: var(--lumo-icon-size-s);
    height: var(--lumo-icon-size-s);
    border: 2px solid transparent;
    border-color: var(--lumo-primary-color-10pct) var(--lumo-primary-color-10pct) var(--lumo-primary-color)
      var(--lumo-primary-color);
    border-radius: calc(0.5 * var(--lumo-icon-size-s));
    opacity: 0;
    pointer-events: none;
  }

  :host(:not([loading])) [part~='loader'] {
    display: none;
  }

  :host([loading]) [part~='loader'] {
    animation: 1s linear infinite lumo-loader-rotate, 0.3s 0.1s lumo-loader-fade-in both;
  }

  @keyframes lumo-loader-fade-in {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes lumo-loader-rotate {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
`,comboBoxOverlay=i$2`
  [part='content'] {
    padding: 0;
  }

  :host {
    --_vaadin-combo-box-items-container-border-width: var(--lumo-space-xs);
    --_vaadin-combo-box-items-container-border-style: solid;
    --_vaadin-combo-box-items-container-border-color: transparent;
  }

  /* Loading state */

  /* When items are empty, the spinner needs some room */
  :host(:not([closing])) [part~='content'] {
    min-height: calc(2 * var(--lumo-space-s) + var(--lumo-icon-size-s));
  }

  [part~='overlay'] {
    position: relative;
  }

  :host([top-aligned]) [part~='overlay'] {
    margin-top: var(--lumo-space-xs);
  }

  :host([bottom-aligned]) [part~='overlay'] {
    margin-bottom: var(--lumo-space-xs);
  }

  [part~='loader'] {
    position: absolute;
    z-index: 1;
    left: var(--lumo-space-s);
    right: var(--lumo-space-s);
    top: var(--lumo-space-s);
    margin-left: auto;
    margin-inline-start: auto;
    margin-inline-end: 0;
  }

  /* RTL specific styles */

  :host([dir='rtl']) [part~='loader'] {
    left: auto;
    margin-left: 0;
    margin-right: auto;
    margin-inline-start: 0;
    margin-inline-end: auto;
  }
`;registerStyles("vaadin-combo-box-overlay",[overlay,menuOverlayCore,comboBoxOverlay,loader],{moduleId:"lumo-combo-box-overlay"});const item=i$2`
  :host {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    font-family: var(--lumo-font-family);
    font-size: var(--lumo-font-size-m);
    line-height: var(--lumo-line-height-xs);
    padding: 0.5em calc(var(--lumo-space-l) + var(--lumo-border-radius-m) / 4) 0.5em
      var(--_lumo-list-box-item-padding-left, calc(var(--lumo-border-radius-m) / 4));
    min-height: var(--lumo-size-m);
    outline: none;
    border-radius: var(--lumo-border-radius-m);
    cursor: var(--lumo-clickable-cursor);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: var(--lumo-primary-color-10pct);
  }

  /* Checkmark */
  [part='checkmark']::before {
    display: var(--_lumo-item-selected-icon-display, none);
    content: var(--lumo-icons-checkmark);
    font-family: lumo-icons;
    font-size: var(--lumo-icon-size-m);
    line-height: 1;
    font-weight: normal;
    width: 1em;
    height: 1em;
    margin: calc((1 - var(--lumo-line-height-xs)) * var(--lumo-font-size-m) / 2) 0;
    color: var(--lumo-primary-text-color);
    flex: none;
    opacity: 0;
    transition: transform 0.2s cubic-bezier(0.12, 0.32, 0.54, 2), opacity 0.1s;
  }

  :host([selected]) [part='checkmark']::before {
    opacity: 1;
  }

  :host([active]:not([selected])) [part='checkmark']::before {
    transform: scale(0.8);
    opacity: 0;
    transition-duration: 0s;
  }

  [part='content'] {
    flex: auto;
  }

  /* Disabled */
  :host([disabled]) {
    color: var(--lumo-disabled-text-color);
    cursor: default;
    pointer-events: none;
  }

  /* TODO a workaround until we have "focus-follows-mouse". After that, use the hover style for focus-ring as well */
  @media (any-hover: hover) {
    :host(:hover:not([disabled])) {
      background-color: var(--lumo-primary-color-10pct);
    }

    :host([focus-ring]:not([disabled])) {
      box-shadow: inset 0 0 0 2px var(--lumo-primary-color-50pct);
    }
  }

  /* RTL specific styles */
  :host([dir='rtl']) {
    padding-left: calc(var(--lumo-space-l) + var(--lumo-border-radius-m) / 4);
    padding-right: var(--_lumo-list-box-item-padding-left, calc(var(--lumo-border-radius-m) / 4));
  }

  /* Slotted icons */
  :host ::slotted(vaadin-icon),
  :host ::slotted(iron-icon) {
    width: var(--lumo-icon-size-m);
    height: var(--lumo-icon-size-m);
  }
`;registerStyles("vaadin-item",item,{moduleId:"lumo-item"});const comboBoxItem=i$2`
  :host {
    transition: background-color 100ms;
    overflow: hidden;
    --_lumo-item-selected-icon-display: block;
  }

  @media (any-hover: hover) {
    :host([focused]:not([disabled])) {
      box-shadow: inset 0 0 0 2px var(--lumo-primary-color-50pct);
    }
  }
`;registerStyles("vaadin-combo-box-item",[item,comboBoxItem],{moduleId:"lumo-combo-box-item"});/**
 * @license
 * Copyright (c) 2018 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const timePicker=i$2`
  [part~='toggle-button']::before {
    content: var(--lumo-icons-clock);
  }

  :host([dir='rtl']) [part='input-field'] ::slotted(input:placeholder-shown) {
    --_lumo-text-field-overflow-mask-image: none;
  }

  :host([dir='rtl']) [part='input-field'] ::slotted(input) {
    --_lumo-text-field-overflow-mask-image: linear-gradient(to left, transparent, #000 1.25em);
  }
`;registerStyles("vaadin-time-picker",[inputFieldShared$1,timePicker],{moduleId:"lumo-time-picker"});/**
 * @license
 * Copyright (c) 2015 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class ComboBoxItem extends ThemableMixin(DirMixin$1(PolymerElement)){static get template(){return html`
      <style>
        :host {
          display: block;
        }

        :host([hidden]) {
          display: none;
        }
      </style>
      <span part="checkmark" aria-hidden="true"></span>
      <div part="content">
        <slot></slot>
      </div>
    `}static get is(){return"vaadin-combo-box-item"}static get properties(){return{index:Number,item:Object,label:String,selected:{type:Boolean,value:!1,reflectToAttribute:!0},focused:{type:Boolean,value:!1,reflectToAttribute:!0},renderer:Function,_oldRenderer:Function}}static get observers(){return["__rendererOrItemChanged(renderer, index, item.*, selected, focused)","__updateLabel(label, renderer)"]}connectedCallback(){super.connectedCallback(),this._comboBox=this.parentNode.comboBox;const C=this._comboBox.getAttribute("dir");C&&this.setAttribute("dir",C)}requestContentUpdate(){if(!this.renderer)return;const C={index:this.index,item:this.item,focused:this.focused,selected:this.selected};this.renderer(this,this._comboBox,C)}__rendererOrItemChanged(C,T,V){V===void 0||T===void 0||(this._oldRenderer!==C&&(this.innerHTML="",delete this._$litPart$),C&&(this._oldRenderer=C,this.requestContentUpdate()))}__updateLabel(C,T){T||(this.textContent=C)}}customElements.define(ComboBoxItem.is,ComboBoxItem);/**
 * @license
 * Copyright (c) 2018 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class TimePickerItem extends ComboBoxItem{static get is(){return"vaadin-time-picker-item"}}customElements.define(TimePickerItem.is,TimePickerItem);/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */const IOS=navigator.userAgent.match(/iP(?:hone|ad;(?: U;)? CPU) OS (\d+)/),IOS_TOUCH_SCROLLING=IOS&&IOS[1]>=8,DEFAULT_PHYSICAL_COUNT=3,ironList={_ratio:.5,_scrollerPaddingTop:0,_scrollPosition:0,_physicalSize:0,_physicalAverage:0,_physicalAverageCount:0,_physicalTop:0,_virtualCount:0,_estScrollHeight:0,_scrollHeight:0,_viewportHeight:0,_viewportWidth:0,_physicalItems:null,_physicalSizes:null,_firstVisibleIndexVal:null,_lastVisibleIndexVal:null,_maxPages:2,_templateCost:0,get _physicalBottom(){return this._physicalTop+this._physicalSize},get _scrollBottom(){return this._scrollPosition+this._viewportHeight},get _virtualEnd(){return this._virtualStart+this._physicalCount-1},get _hiddenContentSize(){return this._physicalSize-this._viewportHeight},get _maxScrollTop(){return this._estScrollHeight-this._viewportHeight+this._scrollOffset},get _maxVirtualStart(){const $=this._virtualCount;return Math.max(0,$-this._physicalCount)},get _virtualStart(){return this._virtualStartVal||0},set _virtualStart($){$=this._clamp($,0,this._maxVirtualStart),this._virtualStartVal=$},get _physicalStart(){return this._physicalStartVal||0},set _physicalStart($){$%=this._physicalCount,$<0&&($=this._physicalCount+$),this._physicalStartVal=$},get _physicalEnd(){return(this._physicalStart+this._physicalCount-1)%this._physicalCount},get _physicalCount(){return this._physicalCountVal||0},set _physicalCount($){this._physicalCountVal=$},get _optPhysicalSize(){return this._viewportHeight===0?1/0:this._viewportHeight*this._maxPages},get _isVisible(){return Boolean(this.offsetWidth||this.offsetHeight)},get firstVisibleIndex(){let $=this._firstVisibleIndexVal;if($==null){let C=this._physicalTop+this._scrollOffset;$=this._iterateItems((T,V)=>{if(C+=this._getPhysicalSizeIncrement(T),C>this._scrollPosition)return V})||0,this._firstVisibleIndexVal=$}return $},get lastVisibleIndex(){let $=this._lastVisibleIndexVal;if($==null){let C=this._physicalTop+this._scrollOffset;this._iterateItems((T,V)=>{C<this._scrollBottom&&($=V),C+=this._getPhysicalSizeIncrement(T)}),this._lastVisibleIndexVal=$}return $},get _scrollOffset(){return this._scrollerPaddingTop+this.scrollOffset},_scrollHandler(){const $=Math.max(0,Math.min(this._maxScrollTop,this._scrollTop));let C=$-this._scrollPosition;const T=C>=0;if(this._scrollPosition=$,this._firstVisibleIndexVal=null,this._lastVisibleIndexVal=null,Math.abs(C)>this._physicalSize&&this._physicalSize>0){C-=this._scrollOffset;const V=Math.round(C/this._physicalAverage);this._virtualStart+=V,this._physicalStart+=V,this._physicalTop=Math.min(Math.floor(this._virtualStart)*this._physicalAverage,this._scrollPosition),this._update()}else if(this._physicalCount>0){const V=this._getReusables(T);T?(this._physicalTop=V.physicalTop,this._virtualStart+=V.indexes.length,this._physicalStart+=V.indexes.length):(this._virtualStart-=V.indexes.length,this._physicalStart-=V.indexes.length),this._update(V.indexes,T?null:V.indexes),this._debounce("_increasePoolIfNeeded",this._increasePoolIfNeeded.bind(this,0),microTask)}},_getReusables($){let C,T,V;const K=[],Y=this._hiddenContentSize*this._ratio,J=this._virtualStart,ee=this._virtualEnd,te=this._physicalCount;let ie=this._physicalTop+this._scrollOffset;const re=this._physicalBottom+this._scrollOffset,se=this._scrollPosition,oe=this._scrollBottom;for($?(C=this._physicalStart,T=se-ie):(C=this._physicalEnd,T=re-oe);V=this._getPhysicalSizeIncrement(C),T-=V,!(K.length>=te||T<=Y);)if($){if(ee+K.length+1>=this._virtualCount||ie+V>=se-this._scrollOffset)break;K.push(C),ie+=V,C=(C+1)%te}else{if(J-K.length<=0||ie+this._physicalSize-V<=oe)break;K.push(C),ie-=V,C=C===0?te-1:C-1}return{indexes:K,physicalTop:ie-this._scrollOffset}},_update($,C){if(!($&&$.length===0||this._physicalCount===0)){if(this._assignModels($),this._updateMetrics($),C)for(;C.length;){const T=C.pop();this._physicalTop-=this._getPhysicalSizeIncrement(T)}this._positionItems(),this._updateScrollerSize()}},_isClientFull(){return this._scrollBottom!==0&&this._physicalBottom-1>=this._scrollBottom&&this._physicalTop<=this._scrollPosition},_increasePoolIfNeeded($){const T=this._clamp(this._physicalCount+$,DEFAULT_PHYSICAL_COUNT,this._virtualCount-this._virtualStart)-this._physicalCount;let V=Math.round(this._physicalCount*.5);if(!(T<0)){if(T>0){const K=window.performance.now();[].push.apply(this._physicalItems,this._createPool(T));for(let Y=0;Y<T;Y++)this._physicalSizes.push(0);this._physicalCount+=T,this._physicalStart>this._physicalEnd&&this._isIndexRendered(this._focusedVirtualIndex)&&this._getPhysicalIndex(this._focusedVirtualIndex)<this._physicalEnd&&(this._physicalStart+=T),this._update(),this._templateCost=(window.performance.now()-K)/T,V=Math.round(this._physicalCount*.5)}this._virtualEnd>=this._virtualCount-1||V===0||(this._isClientFull()?this._physicalSize<this._optPhysicalSize&&this._debounce("_increasePoolIfNeeded",this._increasePoolIfNeeded.bind(this,this._clamp(Math.round(50/this._templateCost),1,V)),idlePeriod):this._debounce("_increasePoolIfNeeded",this._increasePoolIfNeeded.bind(this,V),microTask))}},_render(){if(!(!this.isAttached||!this._isVisible))if(this._physicalCount!==0){const $=this._getReusables(!0);this._physicalTop=$.physicalTop,this._virtualStart+=$.indexes.length,this._physicalStart+=$.indexes.length,this._update($.indexes),this._update(),this._increasePoolIfNeeded(0)}else this._virtualCount>0&&(this.updateViewportBoundaries(),this._increasePoolIfNeeded(DEFAULT_PHYSICAL_COUNT))},_itemsChanged($){$.path==="items"&&(this._virtualStart=0,this._physicalTop=0,this._virtualCount=this.items?this.items.length:0,this._physicalIndexForKey={},this._firstVisibleIndexVal=null,this._lastVisibleIndexVal=null,this._physicalCount=this._physicalCount||0,this._physicalItems=this._physicalItems||[],this._physicalSizes=this._physicalSizes||[],this._physicalStart=0,this._scrollTop>this._scrollOffset&&this._resetScrollPosition(0),this._debounce("_render",this._render,animationFrame))},_iterateItems($,C){let T,V,K,Y;if(arguments.length===2&&C){for(Y=0;Y<C.length;Y++)if(T=C[Y],V=this._computeVidx(T),(K=$.call(this,T,V))!=null)return K}else{for(T=this._physicalStart,V=this._virtualStart;T<this._physicalCount;T++,V++)if((K=$.call(this,T,V))!=null)return K;for(T=0;T<this._physicalStart;T++,V++)if((K=$.call(this,T,V))!=null)return K}},_computeVidx($){return $>=this._physicalStart?this._virtualStart+($-this._physicalStart):this._virtualStart+(this._physicalCount-this._physicalStart)+$},_positionItems(){this._adjustScrollPosition();let $=this._physicalTop;this._iterateItems(C=>{this.translate3d(0,`${$}px`,0,this._physicalItems[C]),$+=this._physicalSizes[C]})},_getPhysicalSizeIncrement($){return this._physicalSizes[$]},_adjustScrollPosition(){const $=this._virtualStart===0?this._physicalTop:Math.min(this._scrollPosition+this._physicalTop,0);if($!==0){this._physicalTop-=$;const C=this._scrollPosition;!IOS_TOUCH_SCROLLING&&C>0&&this._resetScrollPosition(C-$)}},_resetScrollPosition($){this.scrollTarget&&$>=0&&(this._scrollTop=$,this._scrollPosition=this._scrollTop)},_updateScrollerSize($){this._estScrollHeight=this._physicalBottom+Math.max(this._virtualCount-this._physicalCount-this._virtualStart,0)*this._physicalAverage,$=$||this._scrollHeight===0,$=$||this._scrollPosition>=this._estScrollHeight-this._physicalSize,($||Math.abs(this._estScrollHeight-this._scrollHeight)>=this._viewportHeight)&&(this.$.items.style.height=`${this._estScrollHeight}px`,this._scrollHeight=this._estScrollHeight)},scrollToIndex($){if(typeof $!="number"||$<0||$>this.items.length-1||(flush$1(),this._physicalCount===0))return;$=this._clamp($,0,this._virtualCount-1),(!this._isIndexRendered($)||$>=this._maxVirtualStart)&&(this._virtualStart=$-1),this._assignModels(),this._updateMetrics(),this._physicalTop=this._virtualStart*this._physicalAverage;let C=this._physicalStart,T=this._virtualStart,V=0;const K=this._hiddenContentSize;for(;T<$&&V<=K;)V+=this._getPhysicalSizeIncrement(C),C=(C+1)%this._physicalCount,T+=1;this._updateScrollerSize(!0),this._positionItems(),this._resetScrollPosition(this._physicalTop+this._scrollOffset+V),this._increasePoolIfNeeded(0),this._firstVisibleIndexVal=null,this._lastVisibleIndexVal=null},_resetAverage(){this._physicalAverage=0,this._physicalAverageCount=0},_resizeHandler(){this._debounce("_render",()=>{this._firstVisibleIndexVal=null,this._lastVisibleIndexVal=null,this._isVisible?(this.updateViewportBoundaries(),this.toggleScrollListener(!0),this._resetAverage(),this._render()):this.toggleScrollListener(!1)},animationFrame)},_isIndexRendered($){return $>=this._virtualStart&&$<=this._virtualEnd},_getPhysicalIndex($){return(this._physicalStart+($-this._virtualStart))%this._physicalCount},_clamp($,C,T){return Math.min(T,Math.max(C,$))},_debounce($,C,T){this._debouncers=this._debouncers||{},this._debouncers[$]=Debouncer$1.debounce(this._debouncers[$],T,C.bind(this)),enqueueDebouncer$1(this._debouncers[$])}};/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const MAX_VIRTUAL_COUNT=1e5,OFFSET_ADJUST_MIN_THRESHOLD=1e3;class IronListAdapter{constructor({createElements:C,updateElement:T,scrollTarget:V,scrollContainer:K,elementsContainer:Y,reorderElements:J}){this.isAttached=!0,this._vidxOffset=0,this.createElements=C,this.updateElement=T,this.scrollTarget=V,this.scrollContainer=K,this.elementsContainer=Y||K,this.reorderElements=J,this._maxPages=1.3,this.__placeholderHeight=200,this.__elementHeightQueue=Array(10),this.timeouts={SCROLL_REORDER:500,IGNORE_WHEEL:500,FIX_INVALID_ITEM_POSITIONING:100},this.__resizeObserver=new ResizeObserver(()=>this._resizeHandler()),getComputedStyle(this.scrollTarget).overflow==="visible"&&(this.scrollTarget.style.overflow="auto"),getComputedStyle(this.scrollContainer).position==="static"&&(this.scrollContainer.style.position="relative"),this.__resizeObserver.observe(this.scrollTarget),this.scrollTarget.addEventListener("scroll",()=>this._scrollHandler()),this._scrollLineHeight=this._getScrollLineHeight(),this.scrollTarget.addEventListener("wheel",ee=>this.__onWheel(ee)),this.reorderElements&&(this.scrollTarget.addEventListener("mousedown",()=>{this.__mouseDown=!0}),this.scrollTarget.addEventListener("mouseup",()=>{this.__mouseDown=!1,this.__pendingReorder&&this.__reorderElements()}))}get scrollOffset(){return 0}get adjustedFirstVisibleIndex(){return this.firstVisibleIndex+this._vidxOffset}get adjustedLastVisibleIndex(){return this.lastVisibleIndex+this._vidxOffset}scrollToIndex(C){if(typeof C!="number"||isNaN(C)||this.size===0||!this.scrollTarget.offsetHeight)return;C=this._clamp(C,0,this.size-1);const T=this.__getVisibleElements().length;let V=Math.floor(C/this.size*this._virtualCount);this._virtualCount-V<T?(V=this._virtualCount-(this.size-C),this._vidxOffset=this.size-this._virtualCount):V<T?C<OFFSET_ADJUST_MIN_THRESHOLD?(V=C,this._vidxOffset=0):(V=OFFSET_ADJUST_MIN_THRESHOLD,this._vidxOffset=C-V):this._vidxOffset=C-V,this.__skipNextVirtualIndexAdjust=!0,super.scrollToIndex(V),this.adjustedFirstVisibleIndex!==C&&this._scrollTop<this._maxScrollTop&&!this.grid&&(this._scrollTop-=this.__getIndexScrollOffset(C)||0),this._scrollHandler()}flush(){this.scrollTarget.offsetHeight!==0&&(this._resizeHandler(),flush$1(),this._scrollHandler(),this.__fixInvalidItemPositioningDebouncer&&this.__fixInvalidItemPositioningDebouncer.flush(),this.__scrollReorderDebouncer&&this.__scrollReorderDebouncer.flush(),this.__debouncerWheelAnimationFrame&&this.__debouncerWheelAnimationFrame.flush())}update(C=0,T=this.size-1){this.__getVisibleElements().forEach(V=>{V.__virtualIndex>=C&&V.__virtualIndex<=T&&this.__updateElement(V,V.__virtualIndex,!0)})}_updateMetrics(C){flush$1();let T=0,V=0;const K=this._physicalAverageCount,Y=this._physicalAverage;this._iterateItems((J,ee)=>{V+=this._physicalSizes[J],this._physicalSizes[J]=Math.ceil(this.__getBorderBoxHeight(this._physicalItems[J])),T+=this._physicalSizes[J],this._physicalAverageCount+=this._physicalSizes[J]?1:0},C),this._physicalSize=this._physicalSize+T-V,this._physicalAverageCount!==K&&(this._physicalAverage=Math.round((Y*K+T)/this._physicalAverageCount))}__getBorderBoxHeight(C){const T=getComputedStyle(C),V=parseFloat(T.height)||0;if(T.boxSizing==="border-box")return V;const K=parseFloat(T.paddingBottom)||0,Y=parseFloat(T.paddingTop)||0,J=parseFloat(T.borderBottomWidth)||0,ee=parseFloat(T.borderTopWidth)||0;return V+K+Y+J+ee}__updateElement(C,T,V){C.style.paddingTop&&(C.style.paddingTop=""),!this.__preventElementUpdates&&(C.__lastUpdatedIndex!==T||V)&&(this.updateElement(C,T),C.__lastUpdatedIndex=T);const K=C.offsetHeight;if(K===0)C.style.paddingTop=`${this.__placeholderHeight}px`,requestAnimationFrame(()=>this._resizeHandler());else{this.__elementHeightQueue.push(K),this.__elementHeightQueue.shift();const Y=this.__elementHeightQueue.filter(J=>J!==void 0);this.__placeholderHeight=Math.round(Y.reduce((J,ee)=>J+ee,0)/Y.length)}}__getIndexScrollOffset(C){const T=this.__getVisibleElements().find(V=>V.__virtualIndex===C);return T?this.scrollTarget.getBoundingClientRect().top-T.getBoundingClientRect().top:void 0}get size(){return this.__size}set size(C){if(C===this.size)return;this.__fixInvalidItemPositioningDebouncer&&this.__fixInvalidItemPositioningDebouncer.cancel(),this._debouncers&&this._debouncers._increasePoolIfNeeded&&this._debouncers._increasePoolIfNeeded.cancel(),this.__preventElementUpdates=!0;let T,V;if(C>0&&(T=this.adjustedFirstVisibleIndex,V=this.__getIndexScrollOffset(T)),this.__size=C,this._itemsChanged({path:"items"}),flush$1(),C>0){T=Math.min(T,C-1),this.scrollToIndex(T);const K=this.__getIndexScrollOffset(T);V!==void 0&&K!==void 0&&(this._scrollTop+=V-K)}this.elementsContainer.children.length||requestAnimationFrame(()=>this._resizeHandler()),this.__preventElementUpdates=!1,this._resizeHandler(),flush$1()}get _scrollTop(){return this.scrollTarget.scrollTop}set _scrollTop(C){this.scrollTarget.scrollTop=C}get items(){return{length:Math.min(this.size,MAX_VIRTUAL_COUNT)}}get offsetHeight(){return this.scrollTarget.offsetHeight}get $(){return{items:this.scrollContainer}}updateViewportBoundaries(){const C=window.getComputedStyle(this.scrollTarget);this._scrollerPaddingTop=this.scrollTarget===this?0:parseInt(C["padding-top"],10),this._isRTL=Boolean(C.direction==="rtl"),this._viewportWidth=this.elementsContainer.offsetWidth,this._viewportHeight=this.scrollTarget.offsetHeight,this._scrollPageHeight=this._viewportHeight-this._scrollLineHeight,this.grid&&this._updateGridMetrics()}setAttribute(){}_createPool(C){const T=this.createElements(C),V=document.createDocumentFragment();return T.forEach(K=>{K.style.position="absolute",V.appendChild(K),this.__resizeObserver.observe(K)}),this.elementsContainer.appendChild(V),T}_assignModels(C){this._iterateItems((T,V)=>{const K=this._physicalItems[T];K.hidden=V>=this.size,K.hidden?delete K.__lastUpdatedIndex:(K.__virtualIndex=V+(this._vidxOffset||0),this.__updateElement(K,K.__virtualIndex))},C)}_isClientFull(){return setTimeout(()=>{this.__clientFull=!0}),this.__clientFull||super._isClientFull()}translate3d(C,T,V,K){K.style.transform=`translateY(${T})`}toggleScrollListener(){}_scrollHandler(){this._adjustVirtualIndexOffset(this._scrollTop-(this.__previousScrollTop||0));const C=this.scrollTarget.scrollTop-this._scrollPosition;if(super._scrollHandler(),this._physicalCount!==0){const T=C>=0,V=this._getReusables(!T);V.indexes.length&&(this._physicalTop=V.physicalTop,T?(this._virtualStart-=V.indexes.length,this._physicalStart-=V.indexes.length):(this._virtualStart+=V.indexes.length,this._physicalStart+=V.indexes.length),this._resizeHandler())}C&&(this.__fixInvalidItemPositioningDebouncer=Debouncer$1.debounce(this.__fixInvalidItemPositioningDebouncer,timeOut.after(this.timeouts.FIX_INVALID_ITEM_POSITIONING),()=>this.__fixInvalidItemPositioning())),this.reorderElements&&(this.__scrollReorderDebouncer=Debouncer$1.debounce(this.__scrollReorderDebouncer,timeOut.after(this.timeouts.SCROLL_REORDER),()=>this.__reorderElements())),this.__previousScrollTop=this._scrollTop,this._scrollTop===0&&this.firstVisibleIndex!==0&&Math.abs(C)>0&&this.scrollToIndex(0)}__fixInvalidItemPositioning(){if(!this.scrollTarget.isConnected)return;const C=this._physicalTop>this._scrollTop,T=this._physicalBottom<this._scrollBottom,V=this.adjustedFirstVisibleIndex===0,K=this.adjustedLastVisibleIndex===this.size-1;if(C&&!V||T&&!K){const Y=T,J=this._ratio;this._ratio=0,this._scrollPosition=this._scrollTop+(Y?-1:1),this._scrollHandler(),this._ratio=J}}__onWheel(C){if(C.ctrlKey||this._hasScrolledAncestor(C.target,C.deltaX,C.deltaY))return;let T=C.deltaY;if(C.deltaMode===WheelEvent.DOM_DELTA_LINE?T*=this._scrollLineHeight:C.deltaMode===WheelEvent.DOM_DELTA_PAGE&&(T*=this._scrollPageHeight),this._deltaYAcc=this._deltaYAcc||0,this._wheelAnimationFrame){this._deltaYAcc+=T,C.preventDefault();return}T+=this._deltaYAcc,this._deltaYAcc=0,this._wheelAnimationFrame=!0,this.__debouncerWheelAnimationFrame=Debouncer$1.debounce(this.__debouncerWheelAnimationFrame,animationFrame,()=>{this._wheelAnimationFrame=!1});const V=Math.abs(C.deltaX)+Math.abs(T);this._canScroll(this.scrollTarget,C.deltaX,T)?(C.preventDefault(),this.scrollTarget.scrollTop+=T,this.scrollTarget.scrollLeft+=C.deltaX,this._hasResidualMomentum=!0,this._ignoreNewWheel=!0,this._debouncerIgnoreNewWheel=Debouncer$1.debounce(this._debouncerIgnoreNewWheel,timeOut.after(this.timeouts.IGNORE_WHEEL),()=>{this._ignoreNewWheel=!1})):this._hasResidualMomentum&&V<=this._previousMomentum||this._ignoreNewWheel?C.preventDefault():V>this._previousMomentum&&(this._hasResidualMomentum=!1),this._previousMomentum=V}_hasScrolledAncestor(C,T,V){if(C===this.scrollTarget||C===this.scrollTarget.getRootNode().host)return!1;if(this._canScroll(C,T,V)&&["auto","scroll"].indexOf(getComputedStyle(C).overflow)!==-1)return!0;if(C!==this&&C.parentElement)return this._hasScrolledAncestor(C.parentElement,T,V)}_canScroll(C,T,V){return V>0&&C.scrollTop<C.scrollHeight-C.offsetHeight||V<0&&C.scrollTop>0||T>0&&C.scrollLeft<C.scrollWidth-C.offsetWidth||T<0&&C.scrollLeft>0}_getScrollLineHeight(){const C=document.createElement("div");C.style.fontSize="initial",C.style.display="none",document.body.appendChild(C);const T=window.getComputedStyle(C).fontSize;return document.body.removeChild(C),T?window.parseInt(T):void 0}__getVisibleElements(){return Array.from(this.elementsContainer.children).filter(C=>!C.hidden)}__reorderElements(){if(this.__mouseDown){this.__pendingReorder=!0;return}this.__pendingReorder=!1;const C=this._virtualStart+(this._vidxOffset||0),T=this.__getVisibleElements(),K=T.find(ee=>ee.contains(this.elementsContainer.getRootNode().activeElement)||ee.contains(this.scrollTarget.getRootNode().activeElement))||T[0];if(!K)return;const Y=K.__virtualIndex-C,J=T.indexOf(K)-Y;if(J>0)for(let ee=0;ee<J;ee++)this.elementsContainer.appendChild(T[ee]);else if(J<0)for(let ee=T.length+J;ee<T.length;ee++)this.elementsContainer.insertBefore(T[ee],T[0]);if(isSafari){const{transform:ee}=this.scrollTarget.style;this.scrollTarget.style.transform="translateZ(0)",setTimeout(()=>{this.scrollTarget.style.transform=ee})}}_adjustVirtualIndexOffset(C){if(this._virtualCount>=this.size)this._vidxOffset=0;else if(this.__skipNextVirtualIndexAdjust)this.__skipNextVirtualIndexAdjust=!1;else if(Math.abs(C)>1e4){const T=this._scrollTop/(this.scrollTarget.scrollHeight-this.scrollTarget.offsetHeight),V=T*this.size;this._vidxOffset=Math.round(V-T*this._virtualCount)}else{const T=this._vidxOffset,V=OFFSET_ADJUST_MIN_THRESHOLD,K=100;this._scrollTop===0?(this._vidxOffset=0,T!==this._vidxOffset&&super.scrollToIndex(0)):this.firstVisibleIndex<V&&this._vidxOffset>0&&(this._vidxOffset-=Math.min(this._vidxOffset,K),super.scrollToIndex(this.firstVisibleIndex+(T-this._vidxOffset)));const Y=this.size-this._virtualCount;this._scrollTop>=this._maxScrollTop&&this._maxScrollTop>0?(this._vidxOffset=Y,T!==this._vidxOffset&&super.scrollToIndex(this._virtualCount-1)):this.firstVisibleIndex>this._virtualCount-V&&this._vidxOffset<Y&&(this._vidxOffset+=Math.min(Y-this._vidxOffset,K),super.scrollToIndex(this.firstVisibleIndex-(this._vidxOffset-T)))}}}Object.setPrototypeOf(IronListAdapter.prototype,ironList);class Virtualizer{constructor(C){this.__adapter=new IronListAdapter(C)}get size(){return this.__adapter.size}set size(C){this.__adapter.size=C}scrollToIndex(C){this.__adapter.scrollToIndex(C)}update(C=0,T=this.size-1){this.__adapter.update(C,T)}flush(){this.__adapter.flush()}get firstVisibleIndex(){return this.__adapter.adjustedFirstVisibleIndex}get lastVisibleIndex(){return this.__adapter.adjustedLastVisibleIndex}}/**
 * @license
 * Copyright (c) 2015 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ComboBoxPlaceholder=class{toString(){return""}};/**
 * @license
 * Copyright (c) 2015 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class ComboBoxScroller extends PolymerElement{static get is(){return"vaadin-combo-box-scroller"}static get template(){return html`
      <style>
        :host {
          display: block;
          min-height: 1px;
          overflow: auto;

          /* Fixes item background from getting on top of scrollbars on Safari */
          transform: translate3d(0, 0, 0);

          /* Enable momentum scrolling on iOS */
          -webkit-overflow-scrolling: touch;

          /* Fixes scrollbar disappearing when 'Show scroll bars: Always' enabled in Safari */
          box-shadow: 0 0 0 white;
        }

        #selector {
          border-width: var(--_vaadin-combo-box-items-container-border-width);
          border-style: var(--_vaadin-combo-box-items-container-border-style);
          border-color: var(--_vaadin-combo-box-items-container-border-color);
        }
      </style>
      <div id="selector">
        <slot></slot>
      </div>
    `}static get properties(){return{items:{type:Array,observer:"__itemsChanged"},focusedIndex:{type:Number,observer:"__focusedIndexChanged"},loading:{type:Boolean,observer:"__loadingChanged"},opened:{type:Boolean,observer:"__openedChanged"},selectedItem:{type:Object,observer:"__selectedItemChanged"},itemIdPath:{type:String},comboBox:{type:Object},getItemLabel:{type:Object},renderer:{type:Object,observer:"__rendererChanged"},theme:{type:String}}}constructor(){super(),this.__boundOnItemClick=this.__onItemClick.bind(this)}__openedChanged(C){C&&this.requestContentUpdate()}ready(){super.ready(),this.id=`${this.localName}-${generateUniqueId()}`,this.__hostTagName=this.constructor.is.replace("-scroller",""),this.setAttribute("role","listbox"),this.addEventListener("click",C=>C.stopPropagation()),this.__patchWheelOverScrolling(),this.__virtualizer=new Virtualizer({createElements:this.__createElements.bind(this),updateElement:this.__updateElement.bind(this),elementsContainer:this,scrollTarget:this,scrollContainer:this.$.selector})}requestContentUpdate(){this.__virtualizer&&this.__virtualizer.update()}scrollIntoView(C){if(!(this.opened&&C>=0))return;const T=this._visibleItemsCount();let V=C;C>this.__virtualizer.lastVisibleIndex-1?(this.__virtualizer.scrollToIndex(C),V=C-T+1):C>this.__virtualizer.firstVisibleIndex&&(V=this.__virtualizer.firstVisibleIndex),this.__virtualizer.scrollToIndex(Math.max(0,V));const K=[...this.children].find(te=>!te.hidden&&te.index===this.__virtualizer.lastVisibleIndex);if(!K||C!==K.index)return;const Y=K.getBoundingClientRect(),J=this.getBoundingClientRect(),ee=Y.bottom-J.bottom+this._viewportTotalPaddingBottom;ee>0&&(this.scrollTop+=ee)}__getAriaRole(C){return C!==void 0?"option":!1}__isItemFocused(C,T){return!this.loading&&C===T}_isItemSelected(C,T,V){return C instanceof ComboBoxPlaceholder?!1:V&&C!==void 0&&T!==void 0?this.get(V,C)===this.get(V,T):C===T}__itemsChanged(C){this.__virtualizer&&C&&(this.__virtualizer.size=C.length,this.__virtualizer.flush(),this.requestContentUpdate())}__loadingChanged(){this.requestContentUpdate()}__selectedItemChanged(){this.requestContentUpdate()}__focusedIndexChanged(C,T){C!==T&&this.requestContentUpdate(),C>=0&&!this.loading&&this.scrollIntoView(C)}__rendererChanged(C,T){(C||T)&&this.requestContentUpdate()}__createElements(C){return[...Array(C)].map(()=>{const T=document.createElement(`${this.__hostTagName}-item`);return T.addEventListener("click",this.__boundOnItemClick),T.tabIndex="-1",T.style.width="100%",T})}__updateElement(C,T){const V=this.items[T],K=this.focusedIndex,Y=this._isItemSelected(V,this.selectedItem,this.itemIdPath);C.setProperties({item:V,index:T,label:this.getItemLabel(V),selected:Y,renderer:this.renderer,focused:this.__isItemFocused(K,T)}),C.id=`${this.__hostTagName}-item-${T}`,C.setAttribute("role",this.__getAriaRole(T)),C.setAttribute("aria-selected",Y.toString()),C.setAttribute("aria-posinset",T+1),C.setAttribute("aria-setsize",this.items.length),this.theme?C.setAttribute("theme",this.theme):C.removeAttribute("theme"),V instanceof ComboBoxPlaceholder&&this.__requestItemByIndex(T)}__onItemClick(C){this.dispatchEvent(new CustomEvent("selection-changed",{detail:{item:C.currentTarget.item}}))}__patchWheelOverScrolling(){this.$.selector.addEventListener("wheel",C=>{const T=this.scrollTop===0,V=this.scrollHeight-this.scrollTop-this.clientHeight<=1;(T&&C.deltaY<0||V&&C.deltaY>0)&&C.preventDefault()})}get _viewportTotalPaddingBottom(){if(this._cachedViewportTotalPaddingBottom===void 0){const C=window.getComputedStyle(this.$.selector);this._cachedViewportTotalPaddingBottom=[C.paddingBottom,C.borderBottomWidth].map(T=>parseInt(T,10)).reduce((T,V)=>T+V)}return this._cachedViewportTotalPaddingBottom}__requestItemByIndex(C){requestAnimationFrame(()=>{this.dispatchEvent(new CustomEvent("index-requested",{detail:{index:C,currentScrollerPos:this._oldScrollerPosition}}))})}_visibleItemsCount(){return this.__virtualizer.scrollToIndex(this.__virtualizer.firstVisibleIndex),this.__virtualizer.size>0?this.__virtualizer.lastVisibleIndex-this.__virtualizer.firstVisibleIndex+1:0}}customElements.define(ComboBoxScroller.is,ComboBoxScroller);/**
 * @license
 * Copyright (c) 2018 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class TimePickerScroller extends ComboBoxScroller{static get is(){return"vaadin-time-picker-scroller"}}customElements.define(TimePickerScroller.is,TimePickerScroller);/**
 * @license
 * Copyright (c) 2015 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */registerStyles("vaadin-combo-box-overlay",i$2`
    #overlay {
      width: var(--vaadin-combo-box-overlay-width, var(--_vaadin-combo-box-overlay-default-width, auto));
    }

    [part='content'] {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  `,{moduleId:"vaadin-combo-box-overlay-styles"});let memoizedTemplate$1;class ComboBoxOverlay extends PositionMixin(Overlay){static get is(){return"vaadin-combo-box-overlay"}static get template(){return memoizedTemplate$1||(memoizedTemplate$1=super.template.cloneNode(!0),memoizedTemplate$1.content.querySelector('[part~="overlay"]').removeAttribute("tabindex")),memoizedTemplate$1}static get observers(){return["_setOverlayWidth(positionTarget, opened)"]}connectedCallback(){super.connectedCallback();const C=this._comboBox,T=C&&C.getAttribute("dir");T&&this.setAttribute("dir",T)}ready(){super.ready();const C=document.createElement("div");C.setAttribute("part","loader");const T=this.shadowRoot.querySelector('[part~="content"]');T.parentNode.insertBefore(C,T),this.requiredVerticalSpace=200}_outsideClickListener(C){const T=C.composedPath();!T.includes(this.positionTarget)&&!T.includes(this)&&this.close()}_setOverlayWidth(C,T){if(C&&T){const V=this.localName;this.style.setProperty(`--_${V}-default-width`,`${C.clientWidth}px`);const K=getComputedStyle(this._comboBox).getPropertyValue(`--${V}-width`);K===""?this.style.removeProperty(`--${V}-width`):this.style.setProperty(`--${V}-width`,K),this._updatePosition()}}}customElements.define(ComboBoxOverlay.is,ComboBoxOverlay);/**
 * @license
 * Copyright (c) 2018 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */registerStyles("vaadin-time-picker-overlay",i$2`
    #overlay {
      width: var(--vaadin-time-picker-overlay-width, var(--_vaadin-time-picker-overlay-default-width, auto));
    }
  `,{moduleId:"vaadin-time-picker-overlay-styles"});class TimePickerOverlay extends ComboBoxOverlay{static get is(){return"vaadin-time-picker-overlay"}}customElements.define(TimePickerOverlay.is,TimePickerOverlay);/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */function processTemplates($){if(window.Vaadin&&window.Vaadin.templateRendererCallback){window.Vaadin.templateRendererCallback($);return}$.querySelector("template")&&console.warn(`WARNING: <template> inside <${$.localName}> is no longer supported. Import @vaadin/polymer-legacy-adapter/template-renderer.js to enable compatibility.`)}/**
 * @license
 * Copyright (c) 2015 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */function isValidValue($){return $!=null}function findItemIndex($,C){return $.findIndex(T=>T instanceof ComboBoxPlaceholder?!1:C(T))}const ComboBoxMixin=$=>class extends ControllerMixin(KeyboardMixin(InputMixin(DisabledMixin($)))){static get properties(){return{opened:{type:Boolean,notify:!0,value:!1,reflectToAttribute:!0,observer:"_openedChanged"},autoOpenDisabled:{type:Boolean},readonly:{type:Boolean,value:!1,reflectToAttribute:!0},renderer:Function,items:{type:Array,observer:"_itemsChanged"},allowCustomValue:{type:Boolean,value:!1},filteredItems:{type:Array,observer:"_filteredItemsChanged"},_lastCommittedValue:String,loading:{type:Boolean,value:!1,reflectToAttribute:!0},_focusedIndex:{type:Number,observer:"_focusedIndexChanged",value:-1},filter:{type:String,value:"",notify:!0},selectedItem:{type:Object,notify:!0},itemLabelPath:{type:String,value:"label",observer:"_itemLabelPathChanged"},itemValuePath:{type:String,value:"value"},itemIdPath:String,_toggleElement:{type:Object,observer:"_toggleElementChanged"},_closeOnBlurIsPrevented:Boolean,_scroller:Object,_overlayOpened:{type:Boolean,observer:"_overlayOpenedChanged"}}}static get observers(){return["_selectedItemChanged(selectedItem, itemValuePath, itemLabelPath)","_openedOrItemsChanged(opened, filteredItems, loading)","_updateScroller(_scroller, filteredItems, opened, loading, selectedItem, itemIdPath, _focusedIndex, renderer, theme)"]}constructor(){super(),this._boundOnFocusout=this._onFocusout.bind(this),this._boundOverlaySelectedItemChanged=this._overlaySelectedItemChanged.bind(this),this._boundOnClearButtonMouseDown=this.__onClearButtonMouseDown.bind(this),this._boundOnClick=this._onClick.bind(this),this._boundOnOverlayTouchAction=this._onOverlayTouchAction.bind(this),this._boundOnTouchend=this._onTouchend.bind(this)}get _tagNamePrefix(){return"vaadin-combo-box"}get _inputElementValue(){return this.inputElement?this.inputElement[this._propertyForValue]:void 0}set _inputElementValue(T){this.inputElement&&(this.inputElement[this._propertyForValue]=T)}get _nativeInput(){return this.inputElement}_inputElementChanged(T){super._inputElementChanged(T);const V=this._nativeInput;V&&(V.autocomplete="off",V.autocapitalize="off",V.setAttribute("role","combobox"),V.setAttribute("aria-autocomplete","list"),V.setAttribute("aria-expanded",!!this.opened),V.setAttribute("spellcheck","false"),V.setAttribute("autocorrect","off"),this._revertInputValueToValue(),this.clearElement&&this.clearElement.addEventListener("mousedown",this._boundOnClearButtonMouseDown))}ready(){super.ready(),this._initOverlay(),this._initScroller(),this.addEventListener("focusout",this._boundOnFocusout),this._lastCommittedValue=this.value,this.addEventListener("click",this._boundOnClick),this.addEventListener("touchend",this._boundOnTouchend);const T=()=>{requestAnimationFrame(()=>{this.$.overlay.bringToFront()})};this.addEventListener("mousedown",T),this.addEventListener("touchstart",T),processTemplates(this),this.addController(new VirtualKeyboardController(this))}disconnectedCallback(){super.disconnectedCallback(),this.close()}requestContentUpdate(){this._scroller&&(this._scroller.requestContentUpdate(),this._getItemElements().forEach(T=>{T.requestContentUpdate()}))}open(){!this.disabled&&!this.readonly&&(this.opened=!0)}close(){this.opened=!1}_propertiesChanged(T,V,K){super._propertiesChanged(T,V,K),V.filter!==void 0&&this._filterChanged(V.filter)}_initOverlay(){const T=this.$.overlay;T._comboBox=this,T.addEventListener("touchend",this._boundOnOverlayTouchAction),T.addEventListener("touchmove",this._boundOnOverlayTouchAction),T.addEventListener("mousedown",V=>V.preventDefault()),T.addEventListener("opened-changed",V=>{this._overlayOpened=V.detail.value})}_initScroller(T){const V=`${this._tagNamePrefix}-scroller`,K=this.$.overlay;K.renderer=J=>{J.firstChild||J.appendChild(document.createElement(V))},K.requestContentUpdate();const Y=K.querySelector(V);Y.comboBox=T||this,Y.getItemLabel=this._getItemLabel.bind(this),Y.addEventListener("selection-changed",this._boundOverlaySelectedItemChanged),this._scroller=Y}_updateScroller(T,V,K,Y,J,ee,te,ie,re){T&&(K&&(T.style.maxHeight=getComputedStyle(this).getPropertyValue(`--${this._tagNamePrefix}-overlay-max-height`)||"65vh"),T.setProperties({items:K?V:[],opened:K,loading:Y,selectedItem:J,itemIdPath:ee,focusedIndex:te,renderer:ie,theme:re}))}_openedOrItemsChanged(T,V,K){this._overlayOpened=!!(T&&(K||V&&V.length))}_overlayOpenedChanged(T,V){T?(this.dispatchEvent(new CustomEvent("vaadin-combo-box-dropdown-opened",{bubbles:!0,composed:!0})),this._onOpened()):V&&this.filteredItems&&this.filteredItems.length&&(this.close(),this.dispatchEvent(new CustomEvent("vaadin-combo-box-dropdown-closed",{bubbles:!0,composed:!0})))}_focusedIndexChanged(T,V){V!==void 0&&this._updateActiveDescendant(T)}_isInputFocused(){return this.inputElement&&isElementFocused(this.inputElement)}_updateActiveDescendant(T){const V=this._nativeInput;if(!V)return;const K=this._getItemElements().find(Y=>Y.index===T);K?V.setAttribute("aria-activedescendant",K.id):V.removeAttribute("aria-activedescendant")}_openedChanged(T,V){if(V===void 0)return;T?(this._openedWithFocusRing=this.hasAttribute("focus-ring"),!this._isInputFocused()&&!isTouch&&this.focus(),this.$.overlay.restoreFocusOnClose=!0):(this._onClosed(),this._openedWithFocusRing&&this._isInputFocused()&&this.setAttribute("focus-ring",""));const K=this._nativeInput;K&&(K.setAttribute("aria-expanded",!!T),T?K.setAttribute("aria-controls",this._scroller.id):K.removeAttribute("aria-controls"))}_onOverlayTouchAction(){this._closeOnBlurIsPrevented=!0,this.inputElement.blur(),this._closeOnBlurIsPrevented=!1}_isClearButton(T){return T.composedPath()[0]===this.clearElement}_handleClearButtonClick(T){T.preventDefault(),this._clear(),this.opened&&this.requestContentUpdate()}_onToggleButtonClick(T){T.preventDefault(),this.opened?this.close():this.open()}_onHostClick(T){this.autoOpenDisabled||(T.preventDefault(),this.open())}_onClick(T){const V=T.composedPath();this._isClearButton(T)?this._handleClearButtonClick(T):V.indexOf(this._toggleElement)>-1?this._onToggleButtonClick(T):this._onHostClick(T)}_onKeyDown(T){super._onKeyDown(T),T.key==="Tab"?this.$.overlay.restoreFocusOnClose=!1:T.key==="ArrowDown"?(this._onArrowDown(),T.preventDefault()):T.key==="ArrowUp"&&(this._onArrowUp(),T.preventDefault())}_getItemLabel(T){let V=T&&this.itemLabelPath?this.get(this.itemLabelPath,T):void 0;return V==null&&(V=T?T.toString():""),V}_getItemValue(T){let V=T&&this.itemValuePath?this.get(this.itemValuePath,T):void 0;return V===void 0&&(V=T?T.toString():""),V}_onArrowDown(){if(this.opened){const T=this.filteredItems;T&&(this._focusedIndex=Math.min(T.length-1,this._focusedIndex+1),this._prefillFocusedItemLabel())}else this.open()}_onArrowUp(){if(this.opened){if(this._focusedIndex>-1)this._focusedIndex=Math.max(0,this._focusedIndex-1);else{const T=this.filteredItems;T&&(this._focusedIndex=T.length-1)}this._prefillFocusedItemLabel()}else this.open()}_prefillFocusedItemLabel(){if(this._focusedIndex>-1){const T=this.filteredItems[this._focusedIndex];this._inputElementValue=this._getItemLabel(T),this._markAllSelectionRange()}}_setSelectionRange(T,V){this._isInputFocused()&&this.inputElement.setSelectionRange&&this.inputElement.setSelectionRange(T,V)}_markAllSelectionRange(){this._inputElementValue!==void 0&&this._setSelectionRange(0,this._inputElementValue.length)}_clearSelectionRange(){if(this._inputElementValue!==void 0){const T=this._inputElementValue?this._inputElementValue.length:0;this._setSelectionRange(T,T)}}_closeOrCommit(){!this.opened&&!this.loading?this._commitValue():this.close()}_onEnter(T){const V=this._focusedIndex<0&&this._inputElementValue!==""&&this._getItemLabel(this.selectedItem)!==this._inputElementValue;if(!this.allowCustomValue&&V){T.preventDefault(),T.stopPropagation();return}this.opened&&(T.preventDefault(),T.stopPropagation()),this._closeOrCommit()}_onEscape(T){this.autoOpenDisabled?this.opened||this.value!==this._inputElementValue&&this._inputElementValue.length>0?(T.stopPropagation(),this._focusedIndex=-1,this.cancel()):this.clearButtonVisible&&!this.opened&&this.value&&(T.stopPropagation(),this._clear()):this.opened?(T.stopPropagation(),this._focusedIndex>-1?(this._focusedIndex=-1,this._revertInputValue()):this.cancel()):this.clearButtonVisible&&this.value&&(T.stopPropagation(),this._clear())}_toggleElementChanged(T){T&&(T.addEventListener("mousedown",V=>V.preventDefault()),T.addEventListener("click",()=>{isTouch&&!this._isInputFocused()&&document.activeElement.blur()}))}_clear(){this.selectedItem=null,this.allowCustomValue&&(this.value=""),this._detectAndDispatchChange()}cancel(){this._revertInputValueToValue(),this._lastCommittedValue=this.value,this._closeOrCommit()}_onOpened(){requestAnimationFrame(()=>{this._scrollIntoView(this._focusedIndex),this._updateActiveDescendant(this._focusedIndex)}),this._lastCommittedValue=this.value}_onClosed(){(!this.loading||this.allowCustomValue)&&this._commitValue()}_commitValue(){if(this._focusedIndex>-1){const T=this.filteredItems[this._focusedIndex];this.selectedItem!==T&&(this.selectedItem=T),this._inputElementValue=this._getItemLabel(this.selectedItem)}else if(this._inputElementValue===""||this._inputElementValue===void 0)this.selectedItem=null,this.allowCustomValue&&(this.value="");else{const T=[...this.filteredItems||[],this.selectedItem],V=T[this.__getItemIndexByLabel(T,this._inputElementValue)];if(this.allowCustomValue&&!V){const K=this._inputElementValue;this._lastCustomValue=K;const Y=new CustomEvent("custom-value-set",{detail:K,composed:!0,cancelable:!0,bubbles:!0});this.dispatchEvent(Y),Y.defaultPrevented||(this.value=K)}else!this.allowCustomValue&&!this.opened&&V?this.value=this._getItemValue(V):this._inputElementValue=this.selectedItem?this._getItemLabel(this.selectedItem):this.value||""}this._detectAndDispatchChange(),this._clearSelectionRange(),this.filter=""}get _propertyForValue(){return"value"}_onInput(T){const V=this._inputElementValue,K={};this.filter===V?this._filterChanged(this.filter):K.filter=V,!this.opened&&!this._isClearButton(T)&&!this.autoOpenDisabled&&(K.opened=!0),this.setProperties(K)}_onChange(T){T.stopPropagation()}_itemLabelPathChanged(T){typeof T!="string"&&console.error("You should set itemLabelPath to a valid string")}_filterChanged(T){this._scrollIntoView(0),this._focusedIndex=-1,this.items?this.filteredItems=this._filterItems(this.items,T):this._filteredItemsChanged(this.filteredItems)}_revertInputValue(){this.filter!==""?this._inputElementValue=this.filter:this._revertInputValueToValue(),this._clearSelectionRange()}_revertInputValueToValue(){this.allowCustomValue&&!this.selectedItem?this._inputElementValue=this.value:this._inputElementValue=this._getItemLabel(this.selectedItem)}_selectedItemChanged(T){if(T==null)this.filteredItems&&(this.allowCustomValue||(this.value=""),this._toggleHasValue(this._hasValue),this._inputElementValue=this.value);else{const V=this._getItemValue(T);if(this.value!==V&&(this.value=V,this.value!==V))return;this._toggleHasValue(!0),this._inputElementValue=this._getItemLabel(T)}this.filteredItems&&(this._focusedIndex=this.filteredItems.indexOf(T))}_valueChanged(T,V){T===""&&V===void 0||(isValidValue(T)?(this._getItemValue(this.selectedItem)!==T&&this._selectItemForValue(T),!this.selectedItem&&this.allowCustomValue&&(this._inputElementValue=T),this._toggleHasValue(this._hasValue)):this.selectedItem=null,this.filter="",this._lastCommittedValue=void 0)}_detectAndDispatchChange(){this.value!==this._lastCommittedValue&&(this.dispatchEvent(new CustomEvent("change",{bubbles:!0})),this._lastCommittedValue=this.value)}_itemsChanged(T,V){this._ensureItemsOrDataProvider(()=>{this.items=V}),T?this.filteredItems=T.slice(0):V&&(this.filteredItems=null)}_filteredItemsChanged(T,V){const K=V?V[this._focusedIndex]:null,Y=this.__getItemIndexByValue(T,this.value);(this.selectedItem===null||this.selectedItem===void 0)&&Y>=0&&(this.selectedItem=T[Y]);const J=this.__getItemIndexByValue(T,this._getItemValue(K));J>-1?this._focusedIndex=J:this.__setInitialFocusedIndex()}__setInitialFocusedIndex(){const T=this._inputElementValue;T===void 0||T===this._getItemLabel(this.selectedItem)?this._focusedIndex=this.__getItemIndexByLabel(this.filteredItems,this._getItemLabel(this.selectedItem)):this._focusedIndex=this.__getItemIndexByLabel(this.filteredItems,this.filter)}_filterItems(T,V){return T&&T.filter(Y=>(V=V?V.toString().toLowerCase():"",this._getItemLabel(Y).toString().toLowerCase().indexOf(V)>-1))}_selectItemForValue(T){const V=this.__getItemIndexByValue(this.filteredItems,T),K=this.selectedItem;V>=0?this.selectedItem=this.filteredItems[V]:this.dataProvider&&this.selectedItem===void 0?this.selectedItem=void 0:this.selectedItem=null,this.selectedItem===null&&K===null&&this._selectedItemChanged(this.selectedItem)}_getItemElements(){return Array.from(this._scroller.querySelectorAll(`${this._tagNamePrefix}-item`))}_scrollIntoView(T){this._scroller&&this._scroller.scrollIntoView(T)}__getItemIndexByValue(T,V){return!T||!isValidValue(V)?-1:findItemIndex(T,K=>this._getItemValue(K)===V)}__getItemIndexByLabel(T,V){return!T||!V?-1:findItemIndex(T,K=>this._getItemLabel(K).toString().toLowerCase()===V.toString().toLowerCase())}_overlaySelectedItemChanged(T){T.stopPropagation(),!(T.detail.item instanceof ComboBoxPlaceholder)&&this.opened&&(this._focusedIndex=this.filteredItems.indexOf(T.detail.item),this.close())}__onClearButtonMouseDown(T){T.preventDefault(),this.inputElement.focus()}_onFocusout(T){if(!(T.relatedTarget&&T.relatedTarget.localName===`${this._tagNamePrefix}-item`)){if(T.relatedTarget===this.$.overlay){T.composedPath()[0].focus();return}if(!this.readonly&&!this._closeOnBlurIsPrevented){if(!this.opened&&this.allowCustomValue&&this._inputElementValue===this._lastCustomValue){delete this._lastCustomValue;return}this._closeOrCommit()}}}_onTouchend(T){!this.clearElement||T.composedPath()[0]!==this.clearElement||(T.preventDefault(),this._clear())}};/**
 * @license
 * Copyright (c) 2018 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class TimePickerComboBox extends ComboBoxMixin(ThemableMixin(PolymerElement)){static get is(){return"vaadin-time-picker-combo-box"}static get template(){return html`
      <style>
        :host([opened]) {
          pointer-events: auto;
        }
      </style>

      <slot></slot>

      <vaadin-time-picker-overlay
        id="overlay"
        opened="[[_overlayOpened]]"
        loading$="[[loading]]"
        theme$="[[_theme]]"
        position-target="[[positionTarget]]"
        no-vertical-overlap
        restore-focus-node="[[inputElement]]"
      ></vaadin-time-picker-overlay>
    `}static get properties(){return{positionTarget:{type:Object}}}get _tagNamePrefix(){return"vaadin-time-picker"}get clearElement(){return this.querySelector('[part="clear-button"]')}ready(){super.ready(),this.allowCustomValue=!0,this._toggleElement=this.querySelector(".toggle-button"),this.setAttribute("dir","ltr")}}customElements.define(TimePickerComboBox.is,TimePickerComboBox);/**
 * @license
 * Copyright (c) 2018 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const MIN_ALLOWED_TIME="00:00:00.000",MAX_ALLOWED_TIME="23:59:59.999";registerStyles("vaadin-time-picker",inputFieldShared,{moduleId:"vaadin-time-picker-styles"});class TimePicker extends PatternMixin(InputControlMixin(ThemableMixin(ElementMixin(PolymerElement)))){static get is(){return"vaadin-time-picker"}static get template(){return html`
      <style>
        /* See https://github.com/vaadin/vaadin-time-picker/issues/145 */
        :host([dir='rtl']) [part='input-field'] {
          direction: ltr;
        }

        :host([dir='rtl']) [part='input-field'] ::slotted(input)::placeholder {
          direction: rtl;
          text-align: left;
        }

        [part~='toggle-button'] {
          cursor: pointer;
        }
      </style>

      <div class="vaadin-time-picker-container">
        <div part="label">
          <slot name="label"></slot>
          <span part="required-indicator" aria-hidden="true" on-click="focus"></span>
        </div>

        <vaadin-time-picker-combo-box
          id="comboBox"
          filtered-items="[[__dropdownItems]]"
          value="{{_comboBoxValue}}"
          opened="{{opened}}"
          disabled="[[disabled]]"
          readonly="[[readonly]]"
          clear-button-visible="[[clearButtonVisible]]"
          auto-open-disabled="[[autoOpenDisabled]]"
          position-target="[[_inputContainer]]"
          theme$="[[_theme]]"
          on-change="__onComboBoxChange"
        >
          <vaadin-input-container
            part="input-field"
            readonly="[[readonly]]"
            disabled="[[disabled]]"
            invalid="[[invalid]]"
            theme$="[[_theme]]"
          >
            <slot name="prefix" slot="prefix"></slot>
            <slot name="input"></slot>
            <div id="clearButton" part="clear-button" slot="suffix" aria-hidden="true"></div>
            <div id="toggleButton" class="toggle-button" part="toggle-button" slot="suffix" aria-hidden="true"></div>
          </vaadin-input-container>
        </vaadin-time-picker-combo-box>

        <div part="helper-text">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>
      <slot name="tooltip"></slot>
    `}static get properties(){return{value:{type:String,notify:!0,value:""},opened:{type:Boolean,notify:!0,value:!1,reflectToAttribute:!0},min:{type:String,value:""},max:{type:String,value:""},step:{type:Number},autoOpenDisabled:Boolean,__dropdownItems:{type:Array},i18n:{type:Object,value:()=>({formatTime:C=>{if(!C)return;const T=(K=0,Y="00")=>(Y+K).substr((Y+K).length-Y.length);let V=`${T(C.hours)}:${T(C.minutes)}`;return C.seconds!==void 0&&(V+=`:${T(C.seconds)}`),C.milliseconds!==void 0&&(V+=`.${T(C.milliseconds,"000")}`),V},parseTime:C=>{const T="(\\d|[0-1]\\d|2[0-3])",V="(\\d|[0-5]\\d)",K=V,Y="(\\d{1,3})",ee=new RegExp(`^${T}(?::${V}(?::${K}(?:\\.${Y})?)?)?$`).exec(C);if(ee){if(ee[4])for(;ee[4].length<3;)ee[4]+="0";return{hours:ee[1],minutes:ee[2],seconds:ee[3],milliseconds:ee[4]}}}})},_comboBoxValue:{type:String,observer:"__comboBoxValueChanged"},_inputContainer:Object}}static get observers(){return["__updateDropdownItems(i18n.*, min, max, step)"]}static get constraints(){return[...super.constraints,"min","max"]}get clearElement(){return this.$.clearButton}ready(){super.ready(),this.addController(new InputController(this,C=>{this._setInputElement(C),this._setFocusElement(C),this.stateTarget=C,this.ariaTarget=C})),this.addController(new LabelledInputController(this.inputElement,this._labelController)),this._inputContainer=this.shadowRoot.querySelector('[part~="input-field"]'),this._tooltipController=new TooltipController(this),this._tooltipController.setShouldShow(C=>!C.opened),this._tooltipController.setPosition("top"),this.addController(this._tooltipController)}_inputElementChanged(C){super._inputElementChanged(C),C&&this.$.comboBox._setInputElement(C)}open(){!this.disabled&&!this.readonly&&(this.opened=!0)}close(){this.opened=!1}checkValidity(){return!!(this.inputElement.checkValidity()&&(!this.value||this._timeAllowed(this.i18n.parseTime(this.value)))&&(!this._comboBoxValue||this.i18n.parseTime(this._comboBoxValue)))}_setFocused(C){super._setFocused(C),C||this.validate()}__validDayDivisor(C){return!C||24*3600%C===0||C<1&&C%1*1e3%1===0}_onKeyDown(C){if(super._onKeyDown(C),this.readonly||this.disabled||this.__dropdownItems.length)return;const T=this.__validDayDivisor(this.step)&&this.step||60;C.keyCode===40?this.__onArrowPressWithStep(-T):C.keyCode===38&&this.__onArrowPressWithStep(T)}_onEscape(){}__onArrowPressWithStep(C){const T=this.__addStep(this.__getMsec(this.__memoValue),C,!0);this.__memoValue=T,this.inputElement.value=this.i18n.formatTime(this.__validateTime(T)),this.__dispatchChange()}__dispatchChange(){this.dispatchEvent(new CustomEvent("change",{bubbles:!0}))}__getMsec(C){let T=(C&&C.hours||0)*60*60*1e3;return T+=(C&&C.minutes||0)*60*1e3,T+=(C&&C.seconds||0)*1e3,T+=C&&parseInt(C.milliseconds)||0,T}__getSec(C){let T=(C&&C.hours||0)*60*60;return T+=(C&&C.minutes||0)*60,T+=C&&C.seconds||0,T+=C&&C.milliseconds/1e3||0,T}__addStep(C,T,V){C===0&&T<0&&(C=24*60*60*1e3);const K=T*1e3,Y=C%K;K<0&&Y&&V?C-=Y:K>0&&Y&&V?C-=Y-K:C+=K;const J=Math.floor(C/1e3/60/60);C-=J*1e3*60*60;const ee=Math.floor(C/1e3/60);C-=ee*1e3*60;const te=Math.floor(C/1e3);return C-=te*1e3,{hours:J<24?J:0,minutes:ee,seconds:te,milliseconds:C}}__updateDropdownItems(C,T,V,K){const Y=this.__validateTime(this.__parseISO(T||MIN_ALLOWED_TIME)),J=this.__getSec(Y),ee=this.__validateTime(this.__parseISO(V||MAX_ALLOWED_TIME)),te=this.__getSec(ee);if(this.__adjustValue(J,te,Y,ee),this.__dropdownItems=this.__generateDropdownList(J,te,K),K!==this.__oldStep){this.__oldStep=K;const ie=this.__validateTime(this.__parseISO(this.value));this.__updateValue(ie)}this.value&&(this._comboBoxValue=this.i18n.formatTime(this.i18n.parseTime(this.value)))}__generateDropdownList(C,T,V){if(V<15*60||!this.__validDayDivisor(V))return[];const K=[];V=V||3600;let Y=-V+C;for(;Y+V>=C&&Y+V<=T;){const J=this.__validateTime(this.__addStep(Y*1e3,V));Y+=V;const ee=this.i18n.formatTime(J);K.push({label:ee,value:ee})}return K}__adjustValue(C,T,V,K){if(!this.__memoValue)return;const Y=this.__getSec(this.__memoValue);Y<C?this.__updateValue(V):Y>T&&this.__updateValue(K)}_valueChanged(C,T){const V=this.__memoValue=this.__parseISO(C),K=this.__formatISO(V)||"";C!==""&&C!==null&&!V?this.value=T===void 0?"":T:C!==K?this.value=K:this.__keepInvalidInput?delete this.__keepInvalidInput:this.__updateInputValue(V),this._toggleHasValue(this._hasValue)}__comboBoxValueChanged(C,T){if(C===""&&T===void 0)return;const V=this.i18n.parseTime(C),K=this.i18n.formatTime(V)||"";V?C!==K?this._comboBoxValue=K:this.__updateValue(V):(C!==""&&(this.__keepInvalidInput=!0),this.value="")}__onComboBoxChange(C){C.stopPropagation(),this.validate(),this.__dispatchChange()}__updateValue(C){const T=this.__formatISO(this.__validateTime(C))||"";this.value=T}__updateInputValue(C){const T=this.i18n.formatTime(this.__validateTime(C))||"";this._comboBoxValue=T}__validateTime(C){return C&&(C.hours=parseInt(C.hours),C.minutes=parseInt(C.minutes||0),C.seconds=this.__stepSegment<3?void 0:parseInt(C.seconds||0),C.milliseconds=this.__stepSegment<4?void 0:parseInt(C.milliseconds||0)),C}get __stepSegment(){if(this.step%3600===0)return 1;if(this.step%60===0||!this.step)return 2;if(this.step%1===0)return 3;if(this.step<1)return 4}__formatISO(C){return TimePicker.properties.i18n.value().formatTime(C)}__parseISO(C){return TimePicker.properties.i18n.value().parseTime(C)}_timeAllowed(C){const T=this.i18n.parseTime(this.min||MIN_ALLOWED_TIME),V=this.i18n.parseTime(this.max||MAX_ALLOWED_TIME);return(!this.__getMsec(T)||this.__getMsec(C)>=this.__getMsec(T))&&(!this.__getMsec(V)||this.__getMsec(C)<=this.__getMsec(V))}_onClearButtonClick(){}_onChange(){}_onInput(){this._checkInputValue()}}customElements.define(TimePicker.is,TimePicker);/**
 * @license
 * Copyright (c) 2019 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const customField=i$2`
  :host {
    --lumo-text-field-size: var(--lumo-size-m);
    color: var(--lumo-body-text-color);
    font-size: var(--lumo-font-size-m);
    /* align with text-field height + vertical paddings */
    line-height: calc(var(--lumo-text-field-size) + 2 * var(--lumo-space-xs));
    font-family: var(--lumo-font-family);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
    padding: 0;
  }

  :host::before {
    margin-top: var(--lumo-space-xs);
    height: var(--lumo-text-field-size);
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
  }

  /* align with text-field label */
  :host([has-label]) [part='label'] {
    padding-bottom: calc(0.5em - var(--lumo-space-xs));
  }

  :host(:not([has-label])) [part='label'],
  :host(:not([has-label]))::before {
    display: none;
  }

  /* align with text-field error message */
  :host([has-error-message]) [part='error-message']::before {
    height: calc(0.4em - var(--lumo-space-xs));
  }

  :host([focused]:not([readonly]):not([disabled])) [part='label'] {
    color: var(--lumo-primary-text-color);
  }

  :host(:hover:not([readonly]):not([disabled]):not([focused])) [part='label'],
  :host(:hover:not([readonly]):not([disabled]):not([focused])) [part='helper-text'] {
    color: var(--lumo-body-text-color);
  }

  /* Touch device adjustment */
  @media (pointer: coarse) {
    :host(:hover:not([readonly]):not([disabled]):not([focused])) [part='label'] {
      color: var(--lumo-secondary-text-color);
    }
  }

  /* Disabled */
  :host([disabled]) [part='label'] {
    color: var(--lumo-disabled-text-color);
    -webkit-text-fill-color: var(--lumo-disabled-text-color);
  }

  /* Small theme */
  :host([theme~='small']) {
    font-size: var(--lumo-font-size-s);
    --lumo-text-field-size: var(--lumo-size-s);
  }

  :host([theme~='small'][has-label]) [part='label'] {
    font-size: var(--lumo-font-size-xs);
  }

  :host([theme~='small'][has-label]) [part='error-message'] {
    font-size: var(--lumo-font-size-xxs);
  }

  /* When custom-field is used with components without outer margin */
  :host([theme~='whitespace'][has-label]) [part='label'] {
    padding-bottom: 0.5em;
  }
`;registerStyles("vaadin-custom-field",[requiredField,helper,customField],{moduleId:"lumo-custom-field"});registerStyles("vaadin-date-time-picker",[requiredField,helper,customField],{moduleId:"lumo-date-time-picker"});registerStyles("vaadin-date-time-picker-date-picker",i$2`
    :host {
      margin-right: 2px;
    }

    /* RTL specific styles */
    :host([dir='rtl']) {
      margin-right: auto;
      margin-left: 2px;
    }

    [part~='input-field'] {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    /* RTL specific styles */
    :host([dir='rtl']) [part~='input-field'] {
      border-radius: var(--lumo-border-radius-m);
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  `,{moduleId:"lumo-date-time-picker-date-picker"});registerStyles("vaadin-date-time-picker-time-picker",i$2`
    [part~='input-field'] {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    /* RTL specific styles */
    :host([dir='rtl']) [part~='input-field'] {
      border-radius: var(--lumo-border-radius-m);
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  `,{moduleId:"lumo-date-time-picker-time-picker"});/**
 * @license
 * Copyright (c) 2019 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class DateTimePickerDatePicker extends DatePicker{static get is(){return"vaadin-date-time-picker-date-picker"}}customElements.define(DateTimePickerDatePicker.is,DateTimePickerDatePicker);/**
 * @license
 * Copyright (c) 2019 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class DateTimePickerTimePicker extends TimePicker{static get is(){return"vaadin-date-time-picker-time-picker"}}customElements.define(DateTimePickerTimePicker.is,DateTimePickerTimePicker);/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const SlotMixin=dedupingMixin($=>class extends ${get slots(){return{}}ready(){super.ready(),this._connectSlotMixin()}_connectSlotMixin(){Object.keys(this.slots).forEach(T=>{if(!(this._getDirectSlotChild(T)!==void 0)){const K=this.slots[T],Y=K();Y instanceof Element&&(T!==""&&Y.setAttribute("slot",T),this.appendChild(Y))}})}_getDirectSlotChild(T){return Array.from(this.childNodes).find(V=>V.nodeType===Node.ELEMENT_NODE&&V.slot===T||V.nodeType===Node.TEXT_NODE&&V.textContent.trim()&&T==="")}});/**
 * @license
 * Copyright (c) 2019 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */registerStyles("vaadin-date-time-picker",inputFieldShared,{moduleId:"vaadin-date-time-picker"});function getPropertyFromPrototype($,C){for(;$;){if($.properties&&$.properties[C])return $.properties[C];$=Object.getPrototypeOf($)}}const datePickerClass=customElements.get("vaadin-date-time-picker-date-picker"),timePickerClass=customElements.get("vaadin-date-time-picker-time-picker"),datePickerI18nDefaults=getPropertyFromPrototype(datePickerClass,"i18n").value(),timePickerI18nDefaults=getPropertyFromPrototype(timePickerClass,"i18n").value(),datePickerI18nProps=Object.keys(datePickerI18nDefaults),timePickerI18nProps=Object.keys(timePickerI18nDefaults);class DateTimePicker extends FieldMixin(SlotMixin(DisabledMixin(FocusMixin(ThemableMixin(ElementMixin(PolymerElement)))))){static get template(){return html`
      <style>
        .vaadin-date-time-picker-container {
          --vaadin-field-default-width: auto;
        }

        .slots {
          display: flex;
          --vaadin-field-default-width: 12em;
        }

        .slots ::slotted([slot='date-picker']) {
          min-width: 0;
          flex: 1 1 auto;
        }

        .slots ::slotted([slot='time-picker']) {
          min-width: 0;
          flex: 1 1.65 auto;
        }
      </style>

      <div class="vaadin-date-time-picker-container">
        <div part="label" on-click="focus">
          <slot name="label"></slot>
          <span part="required-indicator" aria-hidden="true"></span>
        </div>

        <div class="slots">
          <slot name="date-picker" id="dateSlot"></slot>
          <slot name="time-picker" id="timeSlot"></slot>
        </div>

        <div part="helper-text">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>

      <slot name="tooltip"></slot>
    `}static get is(){return"vaadin-date-time-picker"}static get properties(){return{name:{type:String},value:{type:String,notify:!0,value:"",observer:"__valueChanged"},min:{type:String,observer:"__minChanged"},max:{type:String,observer:"__maxChanged"},__minDateTime:{type:Date,value:""},__maxDateTime:{type:Date,value:""},datePlaceholder:{type:String},timePlaceholder:{type:String},step:{type:Number},initialPosition:String,showWeekNumbers:{type:Boolean},autoOpenDisabled:Boolean,readonly:{type:Boolean,value:!1,reflectToAttribute:!0},autofocus:{type:Boolean},__selectedDateTime:{type:Date},i18n:{type:Object,value:()=>({...datePickerI18nDefaults,...timePickerI18nDefaults})},__datePicker:{type:HTMLElement,observer:"__datePickerChanged"},__timePicker:{type:HTMLElement,observer:"__timePickerChanged"}}}static get observers(){return["__selectedDateTimeChanged(__selectedDateTime)","__datePlaceholderChanged(datePlaceholder)","__timePlaceholderChanged(timePlaceholder)","__stepChanged(step)","__initialPositionChanged(initialPosition)","__showWeekNumbersChanged(showWeekNumbers)","__requiredChanged(required)","__invalidChanged(invalid)","__disabledChanged(disabled)","__readonlyChanged(readonly)","__i18nChanged(i18n.*)","__autoOpenDisabledChanged(autoOpenDisabled)","__themeChanged(_theme, __datePicker, __timePicker)","__pickersChanged(__datePicker, __timePicker)"]}get slots(){return{...super.slots,"date-picker":()=>{const C=document.createElement("vaadin-date-time-picker-date-picker");return C.__defaultPicker=!0,C},"time-picker":()=>{const C=document.createElement("vaadin-date-time-picker-time-picker");return C.__defaultPicker=!0,C}}}constructor(){super(),this.__defaultDateMinMaxValue=void 0,this.__defaultTimeMinValue="00:00:00.000",this.__defaultTimeMaxValue="23:59:59.999",this.__changeEventHandler=this.__changeEventHandler.bind(this),this.__valueChangedEventHandler=this.__valueChangedEventHandler.bind(this)}ready(){super.ready(),this.__datePicker=this._getDirectSlotChild("date-picker"),this.__timePicker=this._getDirectSlotChild("time-picker"),this._observer=new FlattenedNodesObserver(this,C=>{this.__onDomChange(C.addedNodes)}),this.autofocus&&!this.disabled&&window.requestAnimationFrame(()=>this.focus()),this.setAttribute("role","group"),this._tooltipController=new TooltipController(this),this.addController(this._tooltipController),this._tooltipController.setPosition("top"),this._tooltipController.setShouldShow(C=>C.__datePicker&&!C.__datePicker.opened&&C.__timePicker&&!C.__timePicker.opened),this.ariaTarget=this}focus(){this.__datePicker.focus()}_setFocused(C){super._setFocused(C),C||this.validate()}_shouldRemoveFocus(C){const T=C.relatedTarget;return!(this.__datePicker.contains(T)||this.__timePicker.contains(T)||T===this.__datePicker.$.overlay)}__syncI18n(C,T,V){V=V||Object.keys(T.i18n),V.forEach(K=>{T.i18n&&T.i18n.hasOwnProperty(K)&&C.set(`i18n.${K}`,T.i18n[K])})}__changeEventHandler(C){C.stopPropagation(),this.__dispatchChangeForValue===this.value&&(this.__dispatchChange(),this.validate()),this.__dispatchChangeForValue=void 0}__addInputListeners(C){C.addEventListener("change",this.__changeEventHandler),C.addEventListener("value-changed",this.__valueChangedEventHandler)}__removeInputListeners(C){C.removeEventListener("change",this.__changeEventHandler),C.removeEventListener("value-changed",this.__valueChangedEventHandler)}__onDomChange(C){C.filter(T=>T.nodeType===Node.ELEMENT_NODE).forEach(T=>{const V=T.getAttribute("slot");V==="date-picker"?this.__datePicker=T:V==="time-picker"&&(this.__timePicker=T)}),this.value&&(this.min||this.max)&&this.validate()}__datePickerChanged(C,T){C&&(T&&(this.__removeInputListeners(T),T.remove()),this.__addInputListeners(C),C.__defaultPicker?(C.placeholder=this.datePlaceholder,C.invalid=this.invalid,C.initialPosition=this.initialPosition,C.showWeekNumbers=this.showWeekNumbers,this.__syncI18n(C,this,datePickerI18nProps)):(this.datePlaceholder=C.placeholder,this.initialPosition=C.initialPosition,this.showWeekNumbers=C.showWeekNumbers,this.__syncI18n(this,C,datePickerI18nProps)),C.min=this.__formatDateISO(this.__minDateTime,this.__defaultDateMinMaxValue),C.max=this.__formatDateISO(this.__maxDateTime,this.__defaultDateMinMaxValue),C.required=this.required,C.disabled=this.disabled,C.readonly=this.readonly,C.autoOpenDisabled=this.autoOpenDisabled,C.validate=()=>{},C._validateInput=()=>{})}__timePickerChanged(C,T){C&&(T&&(this.__removeInputListeners(T),T.remove()),this.__addInputListeners(C),C.__defaultPicker?(C.placeholder=this.timePlaceholder,C.step=this.step,C.invalid=this.invalid,this.__syncI18n(C,this,timePickerI18nProps)):(this.timePlaceholder=C.placeholder,this.step=C.step,this.__syncI18n(this,C,timePickerI18nProps)),this.__updateTimePickerMinMax(),C.required=this.required,C.disabled=this.disabled,C.readonly=this.readonly,C.autoOpenDisabled=this.autoOpenDisabled,C.validate=()=>{})}__updateTimePickerMinMax(){if(this.__timePicker&&this.__datePicker){const C=this.__parseDate(this.__datePicker.value),T=dateEquals(this.__minDateTime,this.__maxDateTime),V=this.__timePicker.value;this.__minDateTime&&dateEquals(C,this.__minDateTime)||T?this.__timePicker.min=this.__dateToIsoTimeString(this.__minDateTime):this.__timePicker.min=this.__defaultTimeMinValue,this.__maxDateTime&&dateEquals(C,this.__maxDateTime)||T?this.__timePicker.max=this.__dateToIsoTimeString(this.__maxDateTime):this.__timePicker.max=this.__defaultTimeMaxValue,this.__timePicker.value!==V&&(this.__timePicker.value=V)}}__i18nChanged(C){this.__datePicker&&this.__datePicker.set(C.path,C.value),this.__timePicker&&this.__timePicker.set(C.path,C.value)}__datePlaceholderChanged(C){this.__datePicker&&(this.__datePicker.placeholder=C)}__timePlaceholderChanged(C){this.__timePicker&&(this.__timePicker.placeholder=C)}__stepChanged(C){this.__timePicker&&this.__timePicker.step!==C&&(this.__timePicker.step=C)}__initialPositionChanged(C){this.__datePicker&&(this.__datePicker.initialPosition=C)}__showWeekNumbersChanged(C){this.__datePicker&&(this.__datePicker.showWeekNumbers=C)}__invalidChanged(C){this.__datePicker&&(this.__datePicker.invalid=C),this.__timePicker&&(this.__timePicker.invalid=C)}__requiredChanged(C){this.__datePicker&&(this.__datePicker.required=C),this.__timePicker&&(this.__timePicker.required=C)}__disabledChanged(C){this.__datePicker&&(this.__datePicker.disabled=C),this.__timePicker&&(this.__timePicker.disabled=C)}__readonlyChanged(C){this.__datePicker&&(this.__datePicker.readonly=C),this.__timePicker&&(this.__timePicker.readonly=C)}__parseDate(C){return parseDate(C)}__formatDateISO(C,T){return C?datePickerClass.prototype._formatISO(C):T}__formatTimeISO(C){return timePickerI18nDefaults.formatTime(C)}__parseTimeISO(C){return timePickerI18nDefaults.parseTime(C)}__parseDateTime(C){const[T,V]=C.split("T");if(!(T&&V))return;const K=this.__parseDate(T);if(!K)return;const Y=this.__parseTimeISO(V);if(Y)return K.setHours(parseInt(Y.hours)),K.setMinutes(parseInt(Y.minutes||0)),K.setSeconds(parseInt(Y.seconds||0)),K.setMilliseconds(parseInt(Y.milliseconds||0)),K}__formatDateTime(C){if(!C)return"";const T=this.__formatDateISO(C,""),V=this.__dateToIsoTimeString(C);return`${T}T${V}`}__dateToIsoTimeString(C){return this.__formatTimeISO(this.__validateTime({hours:C.getHours(),minutes:C.getMinutes(),seconds:C.getSeconds(),milliseconds:C.getMilliseconds()}))}__validateTime(C){return C&&(C.seconds=this.__stepSegment<3?void 0:C.seconds,C.milliseconds=this.__stepSegment<4?void 0:C.milliseconds),C}get __inputs(){return[this.__datePicker,this.__timePicker]}checkValidity(){const C=this.__inputs.some(V=>!V.checkValidity()),T=this.required&&this.__inputs.some(V=>!V.value);return!(C||T)}get __stepSegment(){const C=this.step==null?60:parseFloat(this.step);if(C%3600===0)return 1;if(C%60===0||!C)return 2;if(C%1===0)return 3;if(C<1)return 4}__dateTimeEquals(C,T){return dateEquals(C,T)?C.getHours()===T.getHours()&&C.getMinutes()===T.getMinutes()&&C.getSeconds()===T.getSeconds()&&C.getMilliseconds()===T.getMilliseconds():!1}__handleDateTimeChange(C,T,V,K){if(!V){this[C]="",this[T]="";return}const Y=this.__parseDateTime(V);if(!Y){this[C]=K;return}this.__dateTimeEquals(this[T],Y)||(this[T]=Y)}__valueChanged(C,T){this.__handleDateTimeChange("value","__selectedDateTime",C,T),T!==void 0&&(this.__dispatchChangeForValue=C),this.toggleAttribute("has-value",!!C),this.__updateTimePickerMinMax()}__dispatchChange(){this.dispatchEvent(new CustomEvent("change",{bubbles:!0}))}__minChanged(C,T){this.__handleDateTimeChange("min","__minDateTime",C,T),this.__datePicker&&(this.__datePicker.min=this.__formatDateISO(this.__minDateTime,this.__defaultDateMinMaxValue)),this.__updateTimePickerMinMax(),this.__datePicker&&this.__timePicker&&this.value&&this.validate()}__maxChanged(C,T){this.__handleDateTimeChange("max","__maxDateTime",C,T),this.__datePicker&&(this.__datePicker.max=this.__formatDateISO(this.__maxDateTime,this.__defaultDateMinMaxValue)),this.__updateTimePickerMinMax(),this.__datePicker&&this.__timePicker&&this.value&&this.validate()}__selectedDateTimeChanged(C){const T=this.__formatDateTime(C);if(this.value!==T&&(this.value=T),Boolean(this.__datePicker&&this.__datePicker.$)&&!this.__ignoreInputValueChange){this.__ignoreInputValueChange=!0;const[K,Y]=this.value.split("T");this.__datePicker.value=K||"",this.__timePicker.value=Y||"",this.__ignoreInputValueChange=!1}}get __formattedValue(){const C=this.__datePicker.value,T=this.__timePicker.value;return C&&T?[C,T].join("T"):""}__valueChangedEventHandler(){if(this.__ignoreInputValueChange)return;const C=this.__formattedValue,[T,V]=C.split("T");this.__ignoreInputValueChange=!0,this.__updateTimePickerMinMax(),T&&V?C!==this.value&&(this.value=C):this.value="",this.__ignoreInputValueChange=!1}__autoOpenDisabledChanged(C){this.__datePicker&&(this.__datePicker.autoOpenDisabled=C),this.__timePicker&&(this.__timePicker.autoOpenDisabled=C)}__themeChanged(C,T,V){!T||!V||[T,V].forEach(K=>{C?K.setAttribute("theme",C):K.removeAttribute("theme")})}__pickersChanged(C,T){!C||!T||C.__defaultPicker===T.__defaultPicker&&(C.value?this.__valueChangedEventHandler():this.value&&this.__selectedDateTimeChanged(this.__selectedDateTime))}}customElements.define(DateTimePicker.is,DateTimePicker);var __defProp$q=Object.defineProperty,__getOwnPropDesc$q=Object.getOwnPropertyDescriptor,__decorateClass$q=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$q(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$q(C,T,K),K};let FieldDateTime=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="",this.name="",this.onChange=$=>{const C=$.target;this.onValueChanged({value:C.value})},this.enabled=!0}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){this.placeholder=$}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}render(){return y$1`
            <vaadin-date-time-picker
                    label="${this.label}"
                    @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                    ?disabled=${!this.enabled}
                    ?required=${this.required}
                    placeholder="${this.placeholder}"
            ></vaadin-date-time-picker>
            `}};FieldDateTime.styles=i$2`
        vaadin-date-time-picker {
            width: 100%;
        }
    `;__decorateClass$q([e()],FieldDateTime.prototype,"required",2);__decorateClass$q([e()],FieldDateTime.prototype,"label",2);__decorateClass$q([e()],FieldDateTime.prototype,"placeholder",2);__decorateClass$q([e()],FieldDateTime.prototype,"name",2);__decorateClass$q([e()],FieldDateTime.prototype,"onChange",2);__decorateClass$q([e()],FieldDateTime.prototype,"value",2);__decorateClass$q([e()],FieldDateTime.prototype,"enabled",2);__decorateClass$q([e()],FieldDateTime.prototype,"field",2);FieldDateTime=__decorateClass$q([e$1("field-datetime")],FieldDateTime);var __defProp$p=Object.defineProperty,__getOwnPropDesc$p=Object.getOwnPropertyDescriptor,__decorateClass$p=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$p(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$p(C,T,K),K};let FieldTime=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="",this.name="",this.onChange=$=>{const C=$.target;this.onValueChanged({value:C.value})},this.enabled=!0}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){this.placeholder=$}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}render(){return y$1`
            <vaadin-time-picker
                    label="${this.label}"
                    @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                    ?disabled=${!this.enabled}
                    ?required=${this.required}
                    placeholder="${this.placeholder}"
            ></vaadin-time-picker>
            `}};FieldTime.styles=i$2`
        vaadin-time-picker {
            width: 100%;
        }
    `;__decorateClass$p([e()],FieldTime.prototype,"required",2);__decorateClass$p([e()],FieldTime.prototype,"label",2);__decorateClass$p([e()],FieldTime.prototype,"placeholder",2);__decorateClass$p([e()],FieldTime.prototype,"name",2);__decorateClass$p([e()],FieldTime.prototype,"onChange",2);__decorateClass$p([e()],FieldTime.prototype,"value",2);__decorateClass$p([e()],FieldTime.prototype,"enabled",2);__decorateClass$p([e()],FieldTime.prototype,"field",2);FieldTime=__decorateClass$p([e$1("field-time")],FieldTime);/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const textArea=i$2`
  [part='input-field'],
  [part='input-field'] ::slotted(textarea) {
    height: auto;
    box-sizing: border-box;
  }

  [part='input-field'] {
    /* Equal to the implicit padding in vaadin-text-field */
    padding-top: calc((var(--lumo-text-field-size) - 1em * var(--lumo-line-height-s)) / 2);
    padding-bottom: calc((var(--lumo-text-field-size) - 1em * var(--lumo-line-height-s)) / 2);
    transition: background-color 0.1s;
    line-height: var(--lumo-line-height-s);
  }

  :host(:not([readonly])) [part='input-field']::after {
    display: none;
  }

  :host([readonly]) [part='input-field'] {
    border: 1px dashed var(--lumo-contrast-30pct);
  }

  :host([readonly]) [part='input-field']::after {
    border: none;
  }

  :host(:hover:not([readonly]):not([focused]):not([invalid])) [part='input-field'] {
    background-color: var(--lumo-contrast-20pct);
  }

  @media (pointer: coarse) {
    :host(:hover:not([readonly]):not([focused]):not([invalid])) [part='input-field'] {
      background-color: var(--lumo-contrast-10pct);
    }

    :host(:active:not([readonly]):not([focused])) [part='input-field'] {
      background-color: var(--lumo-contrast-20pct);
    }
  }

  [part='input-field'] ::slotted(textarea) {
    line-height: inherit;
    --_lumo-text-field-overflow-mask-image: none;
  }

  /* Vertically align icon prefix/suffix with the first line of text */
  [part='input-field'] ::slotted(iron-icon),
  [part='input-field'] ::slotted(vaadin-icon) {
    margin-top: calc((var(--lumo-icon-size-m) - 1em * var(--lumo-line-height-s)) / -2);
  }
`;registerStyles("vaadin-text-area",[inputFieldShared$1,textArea],{moduleId:"lumo-text-area"});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class TextAreaController extends SlotController{constructor(C,T){super(C,"textarea",()=>document.createElement("textarea"),(V,K)=>{const Y=V.getAttribute("value");Y&&(K.value=Y);const J=V.getAttribute("name");J&&K.setAttribute("name",J),K.id=this.defaultId,typeof T=="function"&&T(K)},!0)}}/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */registerStyles("vaadin-text-area",inputFieldShared,{moduleId:"vaadin-text-area-styles"});class TextArea extends ResizeMixin(PatternMixin(InputFieldMixin(ThemableMixin(ElementMixin(PolymerElement))))){static get is(){return"vaadin-text-area"}static get template(){return html`
      <style>
        :host {
          animation: 1ms vaadin-text-area-appear;
        }

        .vaadin-text-area-container {
          flex: auto;
        }

        /* The label, helper text and the error message should neither grow nor shrink. */
        [part='label'],
        [part='helper-text'],
        [part='error-message'] {
          flex: none;
        }

        [part='input-field'] {
          flex: auto;
          overflow: auto;
          -webkit-overflow-scrolling: touch;
        }

        ::slotted(textarea) {
          -webkit-appearance: none;
          -moz-appearance: none;
          flex: auto;
          overflow: hidden;
          width: 100%;
          height: 100%;
          outline: none;
          resize: none;
          margin: 0;
          padding: 0 0.25em;
          border: 0;
          border-radius: 0;
          min-width: 0;
          font: inherit;
          font-size: 1em;
          line-height: normal;
          color: inherit;
          background-color: transparent;
          /* Disable default invalid style in Firefox */
          box-shadow: none;
        }

        /* Override styles from <vaadin-input-container> */
        [part='input-field'] ::slotted(textarea) {
          align-self: stretch;
          white-space: pre-wrap;
        }

        [part='input-field'] ::slotted(:not(textarea)) {
          align-self: flex-start;
        }

        /* Workaround https://bugzilla.mozilla.org/show_bug.cgi?id=1739079 */
        :host([disabled]) ::slotted(textarea) {
          user-select: none;
        }

        @keyframes vaadin-text-area-appear {
          to {
            opacity: 1;
          }
        }
      </style>

      <div class="vaadin-text-area-container">
        <div part="label">
          <slot name="label"></slot>
          <span part="required-indicator" aria-hidden="true"></span>
        </div>

        <vaadin-input-container
          part="input-field"
          readonly="[[readonly]]"
          disabled="[[disabled]]"
          invalid="[[invalid]]"
          theme$="[[_theme]]"
          on-scroll="__scrollPositionUpdated"
        >
          <slot name="prefix" slot="prefix"></slot>
          <slot name="textarea"></slot>
          <slot name="suffix" slot="suffix"></slot>
          <div id="clearButton" part="clear-button" slot="suffix" aria-hidden="true"></div>
        </vaadin-input-container>

        <div part="helper-text">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>

      <slot name="tooltip"></slot>
    `}static get properties(){return{maxlength:{type:Number},minlength:{type:Number}}}static get delegateAttrs(){return[...super.delegateAttrs,"maxlength","minlength"]}static get constraints(){return[...super.constraints,"maxlength","minlength"]}get clearElement(){return this.$.clearButton}_onResize(){this.__scrollPositionUpdated()}ready(){super.ready(),this.addController(new TextAreaController(this,C=>{this._setInputElement(C),this._setFocusElement(C),this.stateTarget=C,this.ariaTarget=C})),this.addController(new LabelledInputController(this.inputElement,this._labelController)),this._tooltipController=new TooltipController(this),this._tooltipController.setPosition("top"),this.addController(this._tooltipController),this.addEventListener("animationend",this._onAnimationEnd),this._inputField=this.shadowRoot.querySelector("[part=input-field]"),this._inputField.addEventListener("wheel",C=>{const T=this._inputField.scrollTop;this._inputField.scrollTop+=C.deltaY,T!==this._inputField.scrollTop&&(C.preventDefault(),this.__scrollPositionUpdated())}),this._updateHeight(),this.__scrollPositionUpdated()}__scrollPositionUpdated(){this._inputField.style.setProperty("--_text-area-vertical-scroll-position","0px"),this._inputField.style.setProperty("--_text-area-vertical-scroll-position",`${this._inputField.scrollTop}px`)}_onAnimationEnd(C){C.animationName.indexOf("vaadin-text-area-appear")===0&&this._updateHeight()}_valueChanged(C,T){super._valueChanged(C,T),this._updateHeight()}_updateHeight(){const C=this.inputElement,T=this._inputField;if(!C||!T)return;const V=T.scrollTop,K=this.value?this.value.length:0;if(this._oldValueLength>=K){const J=getComputedStyle(T).height,ee=getComputedStyle(C).width;T.style.display="block",T.style.height=J,C.style.maxWidth=ee,C.style.height="auto"}this._oldValueLength=K;const Y=C.scrollHeight;Y>C.clientHeight&&(C.style.height=`${Y}px`),C.style.removeProperty("max-width"),T.style.removeProperty("display"),T.style.removeProperty("height"),T.scrollTop=V}checkValidity(){if(!super.checkValidity())return!1;if(!this.pattern||!this.inputElement.value)return!0;try{const C=this.inputElement.value.match(this.pattern);return C?C[0]===C.input:!1}catch{return!0}}}customElements.define(TextArea.is,TextArea);var __defProp$o=Object.defineProperty,__getOwnPropDesc$o=Object.getOwnPropertyDescriptor,__decorateClass$o=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$o(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$o(C,T,K),K};let FieldReadonly=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.name="",this.onChange=$=>{const C=$.target;this.onValueChanged({value:C.value})},this.enabled=!0}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder(){}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}firstUpdated(){var C;const $=this.shadowRoot.querySelector("textarea");(C=$==null?void 0:$.parentElement)==null||C.removeChild($)}render(){return y$1`
            <vaadin-text-area
                label="${this.label}"
                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                ?required=${this.required}
                readonly
            ><div class="content" slot="textarea">${this.value}</div></vaadin-text-area>
            `}};FieldReadonly.styles=i$2`
        .content {
            width: 95%;
            min-height: unset;
        }
        vaadin-text-area {
            width: 100%;
        }
    `;__decorateClass$o([e()],FieldReadonly.prototype,"required",2);__decorateClass$o([e()],FieldReadonly.prototype,"label",2);__decorateClass$o([e()],FieldReadonly.prototype,"name",2);__decorateClass$o([e()],FieldReadonly.prototype,"onChange",2);__decorateClass$o([e()],FieldReadonly.prototype,"value",2);__decorateClass$o([e()],FieldReadonly.prototype,"enabled",2);__decorateClass$o([e()],FieldReadonly.prototype,"field",2);FieldReadonly=__decorateClass$o([e$1("field-readonly")],FieldReadonly);var __defProp$n=Object.defineProperty,__getOwnPropDesc$n=Object.getOwnPropertyDescriptor,__decorateClass$n=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$n(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$n(C,T,K),K};let FieldTextarea=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="",this.name="",this.onChange=$=>{const C=$.target;this.onValueChanged({value:C.value})},this.enabled=!0}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){this.placeholder=$}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}render(){return y$1`
            <vaadin-text-area
                label="${this.label}"
                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                ?required=${this.required}
                placeholder="${this.placeholder}"
            ></vaadin-text-area>
            `}};FieldTextarea.styles=i$2`
        .content {
            width: 100%;
        }
        vaadin-text-area {
            width: 100%;
        }
    `;__decorateClass$n([e()],FieldTextarea.prototype,"required",2);__decorateClass$n([e()],FieldTextarea.prototype,"label",2);__decorateClass$n([e()],FieldTextarea.prototype,"placeholder",2);__decorateClass$n([e()],FieldTextarea.prototype,"name",2);__decorateClass$n([e()],FieldTextarea.prototype,"onChange",2);__decorateClass$n([e()],FieldTextarea.prototype,"value",2);__decorateClass$n([e()],FieldTextarea.prototype,"enabled",2);__decorateClass$n([e()],FieldTextarea.prototype,"field",2);FieldTextarea=__decorateClass$n([e$1("field-textarea")],FieldTextarea);const comboBox=i$2`
  :host {
    outline: none;
  }

  [part='toggle-button']::before {
    content: var(--lumo-icons-dropdown);
  }
`;registerStyles("vaadin-combo-box",[inputFieldShared$1,comboBox],{moduleId:"lumo-combo-box"});/**
 * @license
 * Copyright (c) 2015 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ComboBoxDataProviderMixin=$=>class extends ${static get properties(){return{pageSize:{type:Number,value:50,observer:"_pageSizeChanged"},size:{type:Number,observer:"_sizeChanged"},dataProvider:{type:Object,observer:"_dataProviderChanged"},_pendingRequests:{value:()=>({})},__placeHolder:{value:new ComboBoxPlaceholder},__previousDataProviderFilter:{type:String}}}static get observers(){return["_dataProviderFilterChanged(filter)","_warnDataProviderValue(dataProvider, value)","_ensureFirstPage(opened)"]}ready(){super.ready(),this._scroller.addEventListener("index-requested",T=>{const V=T.detail.index,K=T.detail.currentScrollerPos,Y=Math.floor(this.pageSize*1.5);if(!this._shouldSkipIndex(V,Y,K)&&V!==void 0){const J=this._getPageForIndex(V);this._shouldLoadPage(J)&&this._loadPage(J)}})}_dataProviderFilterChanged(T){if(this.__previousDataProviderFilter===void 0&&T===""){this.__previousDataProviderFilter=T;return}this.__previousDataProviderFilter!==T&&(this.__previousDataProviderFilter=T,this._pendingRequests={},this.loading=this._shouldFetchData(),this.size=void 0,this.clearCache())}_shouldFetchData(){return this.dataProvider?this.opened||this.filter&&this.filter.length:!1}_ensureFirstPage(T){T&&this._shouldLoadPage(0)&&this._loadPage(0)}_shouldSkipIndex(T,V,K){return K!==0&&T>=K-V&&T<=K+V}_shouldLoadPage(T){if(!this.filteredItems||this._forceNextRequest)return this._forceNextRequest=!1,!0;const V=this.filteredItems[T*this.pageSize];return V!==void 0?V instanceof ComboBoxPlaceholder:this.size===void 0}_loadPage(T){if(this._pendingRequests[T]||!this.dataProvider)return;const V={page:T,pageSize:this.pageSize,filter:this.filter},K=(Y,J)=>{if(this._pendingRequests[T]!==K)return;const ee=this.filteredItems?[...this.filteredItems]:[];ee.splice(V.page*V.pageSize,Y.length,...Y),this.filteredItems=ee,!this.opened&&!this._isInputFocused()&&this._commitValue(),J!==void 0&&(this.size=J),delete this._pendingRequests[T],Object.keys(this._pendingRequests).length===0&&(this.loading=!1)};this._pendingRequests[T]=K,this.loading=!0,this.dataProvider(V,K)}_getPageForIndex(T){return Math.floor(T/this.pageSize)}clearCache(){if(!this.dataProvider)return;this._pendingRequests={};const T=[];for(let V=0;V<(this.size||0);V++)T.push(this.__placeHolder);this.filteredItems=T,this._shouldFetchData()?(this._forceNextRequest=!1,this._loadPage(0)):this._forceNextRequest=!0}_sizeChanged(T=0){const V=(this.filteredItems||[]).slice(0,T);for(let K=0;K<T;K++)V[K]=V[K]!==void 0?V[K]:this.__placeHolder;this.filteredItems=V,this._flushPendingRequests(T)}_pageSizeChanged(T,V){if(Math.floor(T)!==T||T<1)throw this.pageSize=V,new Error("`pageSize` value must be an integer > 0");this.clearCache()}_dataProviderChanged(T,V){this._ensureItemsOrDataProvider(()=>{this.dataProvider=V}),this.clearCache()}_ensureItemsOrDataProvider(T){if(this.items!==void 0&&this.dataProvider!==void 0)throw T(),new Error("Using `items` and `dataProvider` together is not supported");this.dataProvider&&!this.filteredItems&&(this.filteredItems=[])}_warnDataProviderValue(T,V){if(T&&V!==""&&(this.selectedItem===void 0||this.selectedItem===null)){const K=this.__getItemIndexByValue(this.filteredItems,V);(K<0||!this._getItemLabel(this.filteredItems[K]))&&console.warn("Warning: unable to determine the label for the provided `value`. Nothing to display in the text field. This usually happens when setting an initial `value` before any items are returned from the `dataProvider` callback. Consider setting `selectedItem` instead of `value`")}}_flushPendingRequests(T){if(this._pendingRequests){const V=Math.ceil(T/this.pageSize),K=Object.keys(this._pendingRequests);for(let Y=0;Y<K.length;Y++){const J=parseInt(K[Y]);J>=V&&this._pendingRequests[J]([],T)}}}};/**
 * @license
 * Copyright (c) 2015 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */registerStyles("vaadin-combo-box",inputFieldShared,{moduleId:"vaadin-combo-box-styles"});class ComboBox extends ComboBoxDataProviderMixin(ComboBoxMixin(PatternMixin(InputControlMixin(ThemableMixin(ElementMixin(PolymerElement)))))){static get is(){return"vaadin-combo-box"}static get template(){return html`
      <style>
        :host([opened]) {
          pointer-events: auto;
        }
      </style>

      <div class="vaadin-combo-box-container">
        <div part="label">
          <slot name="label"></slot>
          <span part="required-indicator" aria-hidden="true" on-click="focus"></span>
        </div>

        <vaadin-input-container
          part="input-field"
          readonly="[[readonly]]"
          disabled="[[disabled]]"
          invalid="[[invalid]]"
          theme$="[[_theme]]"
        >
          <slot name="prefix" slot="prefix"></slot>
          <slot name="input"></slot>
          <div id="clearButton" part="clear-button" slot="suffix" aria-hidden="true"></div>
          <div id="toggleButton" part="toggle-button" slot="suffix" aria-hidden="true"></div>
        </vaadin-input-container>

        <div part="helper-text">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>

      <vaadin-combo-box-overlay
        id="overlay"
        opened="[[_overlayOpened]]"
        loading$="[[loading]]"
        theme$="[[_theme]]"
        position-target="[[_positionTarget]]"
        no-vertical-overlap
        restore-focus-node="[[inputElement]]"
      ></vaadin-combo-box-overlay>

      <slot name="tooltip"></slot>
    `}static get properties(){return{_positionTarget:{type:Object}}}get clearElement(){return this.$.clearButton}ready(){super.ready(),this.addController(new InputController(this,C=>{this._setInputElement(C),this._setFocusElement(C),this.stateTarget=C,this.ariaTarget=C})),this.addController(new LabelledInputController(this.inputElement,this._labelController)),this._tooltipController=new TooltipController(this),this.addController(this._tooltipController),this._tooltipController.setPosition("top"),this._tooltipController.setShouldShow(C=>!C.opened),this._positionTarget=this.shadowRoot.querySelector('[part="input-field"]'),this._toggleElement=this.$.toggleButton}_setFocused(C){super._setFocused(C),C||this.validate()}_shouldRemoveFocus(C){return C.relatedTarget===this.$.overlay?(C.composedPath()[0].focus(),!1):!0}_onClearButtonClick(C){C.stopPropagation(),this._handleClearButtonClick(C)}_onHostClick(C){const T=C.composedPath();(T.includes(this._labelNode)||T.includes(this._positionTarget))&&super._onHostClick(C)}}customElements.define(ComboBox.is,ComboBox);var __defProp$m=Object.defineProperty,__getOwnPropDesc$m=Object.getOwnPropertyDescriptor,__decorateClass$m=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$m(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$m(C,T,K),K};let FieldCombobox=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="",this.name="",this.onChange=$=>{const C=$.target;this.onValueChanged({value:C.value})},this.enabled=!0}setRequired($){this.required=$}setPlaceholder($){this.placeholder=$}setField($){this.field=$}setLabel($){this.label=$}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}connectedCallback(){super.connectedCallback(),this.items=this.field.attributes.filter($=>$.key=="choice").map($=>$.value)}render(){return y$1`
            <vaadin-combo-box label="${this.label}" theme="vertical"
                                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                                ?required=${this.required}
                              .items="${this.items}"
                              item-label-path="key"
                              item-value-path="value"
                              placeholder="${this.placeholder}"
            >
            </vaadin-combo-box>
            `}};FieldCombobox.styles=i$2`
        vaadin-combo-box {
            width: 100%;
        }
    `;__decorateClass$m([e()],FieldCombobox.prototype,"required",2);__decorateClass$m([e()],FieldCombobox.prototype,"label",2);__decorateClass$m([e()],FieldCombobox.prototype,"placeholder",2);__decorateClass$m([e()],FieldCombobox.prototype,"name",2);__decorateClass$m([e()],FieldCombobox.prototype,"onChange",2);__decorateClass$m([e()],FieldCombobox.prototype,"value",2);__decorateClass$m([e()],FieldCombobox.prototype,"enabled",2);__decorateClass$m([e()],FieldCombobox.prototype,"field",2);FieldCombobox=__decorateClass$m([e$1("field-combobox")],FieldCombobox);var __defProp$l=Object.defineProperty,__getOwnPropDesc$l=Object.getOwnPropertyDescriptor,__decorateClass$l=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$l(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$l(C,T,K),K};let FieldExternalRef=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="",this.name="",this.onChange=$=>{const C=$.target;this.onValueChanged({value:C.selectedItem})},this.enabled=!0,this.dataProvider=async($,C)=>{var re;const T=window.__MATEU_REMOTE_BASE_URL__?window.__MATEU_REMOTE_BASE_URL__:"https://remote.mateu.io/mateu/v1",V=(re=this.field)==null?void 0:re.attributes.filter(se=>se.key=="itemprovider")[0].value,K=`${T}/itemproviders/${V}/items`,{filter:Y,page:J,pageSize:ee}=$,te=await this.getCount($),ie=await fetch(`${K}?page=${J}&page_size=${ee}&search_text=${Y}`);if(ie.ok){const se=await ie.json();C(se,te)}}}setRequired($){this.required=$}setPlaceholder($){this.placeholder=$}setField($){this.field=$}setLabel($){this.label=$}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}async getCount($){var J;const C=window.__MATEU_REMOTE_BASE_URL__?window.__MATEU_REMOTE_BASE_URL__:"https://remote.mateu.io/mateu/v1",T=(J=this.field)==null?void 0:J.attributes.filter(ee=>ee.key=="itemprovider")[0].value,V=`${C}/itemproviders/${T}/count`,{filter:K}=$,Y=await fetch(`${V}?search_text=${K}`);return Y.ok?parseInt(await Y.text()):0}firstUpdated($){var T;const C=(T=this.shadowRoot)==null?void 0:T.querySelector("vaadin-combo-box");C.dataProvider=this.dataProvider,C.selectedItem=this.value}render(){return y$1`
            <vaadin-combo-box label="${this.label}" theme="vertical"
                                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                                ?required=${this.required}
                              item-label-path="key"
                              placeholder="${this.placeholder}"
            >
            </vaadin-combo-box>
            `}};FieldExternalRef.styles=i$2`
        vaadin-combo-box {
            width: 100%;
        }
    `;__decorateClass$l([e()],FieldExternalRef.prototype,"required",2);__decorateClass$l([e()],FieldExternalRef.prototype,"label",2);__decorateClass$l([e()],FieldExternalRef.prototype,"placeholder",2);__decorateClass$l([e()],FieldExternalRef.prototype,"name",2);__decorateClass$l([e()],FieldExternalRef.prototype,"onChange",2);__decorateClass$l([e()],FieldExternalRef.prototype,"value",2);__decorateClass$l([e()],FieldExternalRef.prototype,"enabled",2);__decorateClass$l([e()],FieldExternalRef.prototype,"field",2);__decorateClass$l([t$1()],FieldExternalRef.prototype,"dataProvider",2);FieldExternalRef=__decorateClass$l([e$1("field-externalref")],FieldExternalRef);/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const nativeShadow=!(window.ShadyDOM&&window.ShadyDOM.inUse);let nativeCssVariables_;function calcCssVariables($){$&&$.shimcssproperties?nativeCssVariables_=!1:nativeCssVariables_=nativeShadow||Boolean(!navigator.userAgent.match(/AppleWebKit\/601|Edge\/15/)&&window.CSS&&CSS.supports&&CSS.supports("box-shadow","0 0 0 var(--foo)"))}let cssBuild;window.ShadyCSS&&window.ShadyCSS.cssBuild!==void 0&&(cssBuild=window.ShadyCSS.cssBuild);const disableRuntime=Boolean(window.ShadyCSS&&window.ShadyCSS.disableRuntime);window.ShadyCSS&&window.ShadyCSS.nativeCss!==void 0?nativeCssVariables_=window.ShadyCSS.nativeCss:window.ShadyCSS?(calcCssVariables(window.ShadyCSS),window.ShadyCSS=void 0):calcCssVariables(window.WebComponents&&window.WebComponents.flags);const nativeCssVariables=nativeCssVariables_;/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/class StyleNode{constructor(){this.start=0,this.end=0,this.previous=null,this.parent=null,this.rules=null,this.parsedCssText="",this.cssText="",this.atRule=!1,this.type=0,this.keyframesName="",this.selector="",this.parsedSelector=""}}function parse($){return $=clean($),parseCss(lex($),$)}function clean($){return $.replace(RX.comments,"").replace(RX.port,"")}function lex($){let C=new StyleNode;C.start=0,C.end=$.length;let T=C;for(let V=0,K=$.length;V<K;V++)if($[V]===OPEN_BRACE){T.rules||(T.rules=[]);let Y=T,J=Y.rules[Y.rules.length-1]||null;T=new StyleNode,T.start=V+1,T.parent=Y,T.previous=J,Y.rules.push(T)}else $[V]===CLOSE_BRACE&&(T.end=V+1,T=T.parent||C);return C}function parseCss($,C){let T=C.substring($.start,$.end-1);if($.parsedCssText=$.cssText=T.trim(),$.parent){let K=$.previous?$.previous.end:$.parent.start;T=C.substring(K,$.start-1),T=_expandUnicodeEscapes(T),T=T.replace(RX.multipleSpaces," "),T=T.substring(T.lastIndexOf(";")+1);let Y=$.parsedSelector=$.selector=T.trim();$.atRule=Y.indexOf(AT_START)===0,$.atRule?Y.indexOf(MEDIA_START)===0?$.type=types.MEDIA_RULE:Y.match(RX.keyframesRule)&&($.type=types.KEYFRAMES_RULE,$.keyframesName=$.selector.split(RX.multipleSpaces).pop()):Y.indexOf(VAR_START)===0?$.type=types.MIXIN_RULE:$.type=types.STYLE_RULE}let V=$.rules;if(V)for(let K=0,Y=V.length,J;K<Y&&(J=V[K]);K++)parseCss(J,C);return $}function _expandUnicodeEscapes($){return $.replace(/\\([0-9a-f]{1,6})\s/gi,function(){let C=arguments[1],T=6-C.length;for(;T--;)C="0"+C;return"\\"+C})}function stringify($,C,T=""){let V="";if($.cssText||$.rules){let K=$.rules;if(K&&!_hasMixinRules(K))for(let Y=0,J=K.length,ee;Y<J&&(ee=K[Y]);Y++)V=stringify(ee,C,V);else V=C?$.cssText:removeCustomProps($.cssText),V=V.trim(),V&&(V="  "+V+`
`)}return V&&($.selector&&(T+=$.selector+" "+OPEN_BRACE+`
`),T+=V,$.selector&&(T+=CLOSE_BRACE+`

`)),T}function _hasMixinRules($){let C=$[0];return Boolean(C)&&Boolean(C.selector)&&C.selector.indexOf(VAR_START)===0}function removeCustomProps($){return $=removeCustomPropAssignment($),removeCustomPropApply($)}function removeCustomPropAssignment($){return $.replace(RX.customProp,"").replace(RX.mixinProp,"")}function removeCustomPropApply($){return $.replace(RX.mixinApply,"").replace(RX.varApply,"")}const types={STYLE_RULE:1,KEYFRAMES_RULE:7,MEDIA_RULE:4,MIXIN_RULE:1e3},OPEN_BRACE="{",CLOSE_BRACE="}",RX={comments:/\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,port:/@import[^;]*;/gim,customProp:/(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,mixinProp:/(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,mixinApply:/@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,varApply:/[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,keyframesRule:/^@[^\s]*keyframes/,multipleSpaces:/\s+/g},VAR_START="--",MEDIA_START="@media",AT_START="@";/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const VAR_ASSIGN=/(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};{])+)|\{([^}]*)\}(?:(?=[;\s}])|$))/gi,MIXIN_MATCH=/(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi,MEDIA_MATCH=/@media\s(.*)/;/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const styleTextSet=new Set,scopingAttribute="shady-unscoped";function processUnscopedStyle($){const C=$.textContent;if(!styleTextSet.has(C)){styleTextSet.add(C);const T=document.createElement("style");T.setAttribute("shady-unscoped",""),T.textContent=C,document.head.appendChild(T)}}function isUnscopedStyle($){return $.hasAttribute(scopingAttribute)}/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/function toCssText($,C){return $?(typeof $=="string"&&($=parse($)),C&&forEachRule($,C),stringify($,nativeCssVariables)):""}function rulesForStyle($){return!$.__cssRules&&$.textContent&&($.__cssRules=parse($.textContent)),$.__cssRules||null}function forEachRule($,C,T,V){if(!$)return;let K=!1,Y=$.type;if(V&&Y===types.MEDIA_RULE){let ee=$.selector.match(MEDIA_MATCH);ee&&(window.matchMedia(ee[1]).matches||(K=!0))}Y===types.STYLE_RULE?C($):T&&Y===types.KEYFRAMES_RULE?T($):Y===types.MIXIN_RULE&&(K=!0);let J=$.rules;if(J&&!K)for(let ee=0,te=J.length,ie;ee<te&&(ie=J[ee]);ee++)forEachRule(ie,C,T,V)}function findMatchingParen($,C){let T=0;for(let V=C,K=$.length;V<K;V++)if($[V]==="(")T++;else if($[V]===")"&&--T===0)return V;return-1}function processVariableAndFallback($,C){let T=$.indexOf("var(");if(T===-1)return C($,"","","");let V=findMatchingParen($,T+3),K=$.substring(T+4,V),Y=$.substring(0,T),J=processVariableAndFallback($.substring(V+1),C),ee=K.indexOf(",");if(ee===-1)return C(Y,K.trim(),"",J);let te=K.substring(0,ee).trim(),ie=K.substring(ee+1).trim();return C(Y,te,ie,J)}window.ShadyDOM&&window.ShadyDOM.wrap;function getIsExtends($){let C=$.localName,T="",V="";return C?C.indexOf("-")>-1?T=C:(V=C,T=$.getAttribute&&$.getAttribute("is")||""):(T=$.is,V=$.extends),{is:T,typeExtension:V}}function gatherStyleText($){const C=[],T=$.querySelectorAll("style");for(let V=0;V<T.length;V++){const K=T[V];isUnscopedStyle(K)?nativeShadow||(processUnscopedStyle(K),K.parentNode.removeChild(K)):(C.push(K.textContent),K.parentNode.removeChild(K))}return C.join("").trim()}const CSS_BUILD_ATTR="css-build";function getCssBuild($){if(cssBuild!==void 0)return cssBuild;if($.__cssBuild===void 0){const C=$.getAttribute(CSS_BUILD_ATTR);if(C)$.__cssBuild=C;else{const T=getBuildComment($);T!==""&&removeBuildComment($),$.__cssBuild=T}}return $.__cssBuild||""}function elementHasBuiltCss($){return getCssBuild($)!==""}function getBuildComment($){const C=$.localName==="template"?$.content.firstChild:$.firstChild;if(C instanceof Comment){const T=C.textContent.trim().split(":");if(T[0]===CSS_BUILD_ATTR)return T[1]}return""}function removeBuildComment($){const C=$.localName==="template"?$.content.firstChild:$.firstChild;C.parentNode.removeChild(C)}/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/function updateNativeProperties($,C){for(let T in C)T===null?$.style.removeProperty(T):$.style.setProperty(T,C[T])}function getComputedStyleValue($,C){const T=window.getComputedStyle($).getPropertyValue(C);return T?T.trim():""}function detectMixin($){const C=MIXIN_MATCH.test($)||VAR_ASSIGN.test($);return MIXIN_MATCH.lastIndex=0,VAR_ASSIGN.lastIndex=0,C}/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const APPLY_NAME_CLEAN=/;\s*/m,INITIAL_INHERIT=/^\s*(initial)|(inherit)\s*$/,IMPORTANT=/\s*!important/,MIXIN_VAR_SEP="_-_";class MixinMap{constructor(){this._map={}}set(C,T){C=C.trim(),this._map[C]={properties:T,dependants:{}}}get(C){return C=C.trim(),this._map[C]||null}}let invalidCallback=null;class ApplyShim{constructor(){this._currentElement=null,this._measureElement=null,this._map=new MixinMap}detectMixin(C){return detectMixin(C)}gatherStyles(C){const T=gatherStyleText(C.content);if(T){const V=document.createElement("style");return V.textContent=T,C.content.insertBefore(V,C.content.firstChild),V}return null}transformTemplate(C,T){C._gatheredStyle===void 0&&(C._gatheredStyle=this.gatherStyles(C));const V=C._gatheredStyle;return V?this.transformStyle(V,T):null}transformStyle(C,T=""){let V=rulesForStyle(C);return this.transformRules(V,T),C.textContent=toCssText(V),V}transformCustomStyle(C){let T=rulesForStyle(C);return forEachRule(T,V=>{V.selector===":root"&&(V.selector="html"),this.transformRule(V)}),C.textContent=toCssText(T),T}transformRules(C,T){this._currentElement=T,forEachRule(C,V=>{this.transformRule(V)}),this._currentElement=null}transformRule(C){C.cssText=this.transformCssText(C.parsedCssText,C),C.selector===":root"&&(C.selector=":host > *")}transformCssText(C,T){return C=C.replace(VAR_ASSIGN,(V,K,Y,J)=>this._produceCssProperties(V,K,Y,J,T)),this._consumeCssProperties(C,T)}_getInitialValueForProperty(C){return this._measureElement||(this._measureElement=document.createElement("meta"),this._measureElement.setAttribute("apply-shim-measure",""),this._measureElement.style.all="initial",document.head.appendChild(this._measureElement)),window.getComputedStyle(this._measureElement).getPropertyValue(C)}_fallbacksFromPreviousRules(C){let T=C;for(;T.parent;)T=T.parent;const V={};let K=!1;return forEachRule(T,Y=>{K=K||Y===C,!K&&Y.selector===C.selector&&Object.assign(V,this._cssTextToMap(Y.parsedCssText))}),V}_consumeCssProperties(C,T){let V=null;for(;V=MIXIN_MATCH.exec(C);){let K=V[0],Y=V[1],J=V.index,ee=J+K.indexOf("@apply"),te=J+K.length,ie=C.slice(0,ee),re=C.slice(te),se=T?this._fallbacksFromPreviousRules(T):{};Object.assign(se,this._cssTextToMap(ie));let oe=this._atApplyToCssProperties(Y,se);C=`${ie}${oe}${re}`,MIXIN_MATCH.lastIndex=J+oe.length}return C}_atApplyToCssProperties(C,T){C=C.replace(APPLY_NAME_CLEAN,"");let V=[],K=this._map.get(C);if(K||(this._map.set(C,{}),K=this._map.get(C)),K){this._currentElement&&(K.dependants[this._currentElement]=!0);let Y,J,ee;const te=K.properties;for(Y in te)ee=T&&T[Y],J=[Y,": var(",C,MIXIN_VAR_SEP,Y],ee&&J.push(",",ee.replace(IMPORTANT,"")),J.push(")"),IMPORTANT.test(te[Y])&&J.push(" !important"),V.push(J.join(""))}return V.join("; ")}_replaceInitialOrInherit(C,T){let V=INITIAL_INHERIT.exec(T);return V&&(V[1]?T=this._getInitialValueForProperty(C):T="apply-shim-inherit"),T}_cssTextToMap(C,T=!1){let V=C.split(";"),K,Y,J={};for(let ee=0,te,ie;ee<V.length;ee++)te=V[ee],te&&(ie=te.split(":"),ie.length>1&&(K=ie[0].trim(),Y=ie.slice(1).join(":"),T&&(Y=this._replaceInitialOrInherit(K,Y)),J[K]=Y));return J}_invalidateMixinEntry(C){if(invalidCallback)for(let T in C.dependants)T!==this._currentElement&&invalidCallback(T)}_produceCssProperties(C,T,V,K,Y){if(V&&processVariableAndFallback(V,(ce,de)=>{de&&this._map.get(de)&&(K=`@apply ${de};`)}),!K)return C;let J=this._consumeCssProperties(""+K,Y),ee=C.slice(0,C.indexOf("--")),te=this._cssTextToMap(J,!0),ie=te,re=this._map.get(T),se=re&&re.properties;se?ie=Object.assign(Object.create(se),te):this._map.set(T,ie);let oe=[],ae,ne,le=!1;for(ae in ie)ne=te[ae],ne===void 0&&(ne="initial"),se&&!(ae in se)&&(le=!0),oe.push(`${T}${MIXIN_VAR_SEP}${ae}: ${ne}`);return le&&this._invalidateMixinEntry(re),re&&(re.properties=ie),V&&(ee=`${C};${ee}`),`${ee}${oe.join("; ")};`}}ApplyShim.prototype.detectMixin=ApplyShim.prototype.detectMixin;ApplyShim.prototype.transformStyle=ApplyShim.prototype.transformStyle;ApplyShim.prototype.transformCustomStyle=ApplyShim.prototype.transformCustomStyle;ApplyShim.prototype.transformRules=ApplyShim.prototype.transformRules;ApplyShim.prototype.transformRule=ApplyShim.prototype.transformRule;ApplyShim.prototype.transformTemplate=ApplyShim.prototype.transformTemplate;ApplyShim.prototype._separator=MIXIN_VAR_SEP;Object.defineProperty(ApplyShim.prototype,"invalidCallback",{get(){return invalidCallback},set($){invalidCallback=$}});/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const templateMap={};/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const CURRENT_VERSION="_applyShimCurrentVersion",NEXT_VERSION="_applyShimNextVersion",VALIDATING_VERSION="_applyShimValidatingVersion",promise=Promise.resolve();function invalidate($){let C=templateMap[$];C&&invalidateTemplate(C)}function invalidateTemplate($){$[CURRENT_VERSION]=$[CURRENT_VERSION]||0,$[VALIDATING_VERSION]=$[VALIDATING_VERSION]||0,$[NEXT_VERSION]=($[NEXT_VERSION]||0)+1}function templateIsValid($){return $[CURRENT_VERSION]===$[NEXT_VERSION]}function templateIsValidating($){return!templateIsValid($)&&$[VALIDATING_VERSION]===$[NEXT_VERSION]}function startValidatingTemplate($){$[VALIDATING_VERSION]=$[NEXT_VERSION],$._validating||($._validating=!0,promise.then(function(){$[CURRENT_VERSION]=$[NEXT_VERSION],$._validating=!1}))}/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/let readyPromise=null,whenReady=window.HTMLImports&&window.HTMLImports.whenReady||null,resolveFn;function documentWait($){requestAnimationFrame(function(){whenReady?whenReady($):(readyPromise||(readyPromise=new Promise(C=>{resolveFn=C}),document.readyState==="complete"?resolveFn():document.addEventListener("readystatechange",()=>{document.readyState==="complete"&&resolveFn()})),readyPromise.then(function(){$&&$()}))})}/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const SEEN_MARKER="__seenByShadyCSS",CACHED_STYLE="__shadyCSSCachedStyle";let transformFn=null,validateFn=null,CustomStyleInterface$1=class{constructor(){this.customStyles=[],this.enqueued=!1,documentWait(()=>{window.ShadyCSS.flushCustomStyles&&window.ShadyCSS.flushCustomStyles()})}enqueueDocumentValidation(){this.enqueued||!validateFn||(this.enqueued=!0,documentWait(validateFn))}addCustomStyle(C){C[SEEN_MARKER]||(C[SEEN_MARKER]=!0,this.customStyles.push(C),this.enqueueDocumentValidation())}getStyleForCustomStyle(C){if(C[CACHED_STYLE])return C[CACHED_STYLE];let T;return C.getStyle?T=C.getStyle():T=C,T}processStyles(){const C=this.customStyles;for(let T=0;T<C.length;T++){const V=C[T];if(V[CACHED_STYLE])continue;const K=this.getStyleForCustomStyle(V);if(K){const Y=K.__appliedElement||K;transformFn&&transformFn(Y),V[CACHED_STYLE]=Y}}return C}};CustomStyleInterface$1.prototype.addCustomStyle=CustomStyleInterface$1.prototype.addCustomStyle;CustomStyleInterface$1.prototype.getStyleForCustomStyle=CustomStyleInterface$1.prototype.getStyleForCustomStyle;CustomStyleInterface$1.prototype.processStyles=CustomStyleInterface$1.prototype.processStyles;Object.defineProperties(CustomStyleInterface$1.prototype,{transformCallback:{get(){return transformFn},set($){transformFn=$}},validateCallback:{get(){return validateFn},set($){let C=!1;validateFn||(C=!0),validateFn=$,C&&this.enqueueDocumentValidation()}}});/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const applyShim=new ApplyShim;class ApplyShimInterface{constructor(){this.customStyleInterface=null,applyShim.invalidCallback=invalidate}ensure(){this.customStyleInterface||window.ShadyCSS.CustomStyleInterface&&(this.customStyleInterface=window.ShadyCSS.CustomStyleInterface,this.customStyleInterface.transformCallback=C=>{applyShim.transformCustomStyle(C)},this.customStyleInterface.validateCallback=()=>{requestAnimationFrame(()=>{this.customStyleInterface.enqueued&&this.flushCustomStyles()})})}prepareTemplate(C,T){if(this.ensure(),elementHasBuiltCss(C))return;templateMap[T]=C;let V=applyShim.transformTemplate(C,T);C._styleAst=V}flushCustomStyles(){if(this.ensure(),!this.customStyleInterface)return;let C=this.customStyleInterface.processStyles();if(this.customStyleInterface.enqueued){for(let T=0;T<C.length;T++){let V=C[T],K=this.customStyleInterface.getStyleForCustomStyle(V);K&&applyShim.transformCustomStyle(K)}this.customStyleInterface.enqueued=!1}}styleSubtree(C,T){if(this.ensure(),T&&updateNativeProperties(C,T),C.shadowRoot){this.styleElement(C);let V=C.shadowRoot.children||C.shadowRoot.childNodes;for(let K=0;K<V.length;K++)this.styleSubtree(V[K])}else{let V=C.children||C.childNodes;for(let K=0;K<V.length;K++)this.styleSubtree(V[K])}}styleElement(C){this.ensure();let{is:T}=getIsExtends(C),V=templateMap[T];if(!(V&&elementHasBuiltCss(V))&&V&&!templateIsValid(V)){templateIsValidating(V)||(this.prepareTemplate(V,T),startValidatingTemplate(V));let K=C.shadowRoot;if(K){let Y=K.querySelector("style");Y&&(Y.__cssRules=V._styleAst,Y.textContent=toCssText(V._styleAst))}}}styleDocument(C){this.ensure(),this.styleSubtree(document.body,C)}}if(!window.ShadyCSS||!window.ShadyCSS.ScopingShim){const $=new ApplyShimInterface;let C=window.ShadyCSS&&window.ShadyCSS.CustomStyleInterface;window.ShadyCSS={prepareTemplate(T,V,K){$.flushCustomStyles(),$.prepareTemplate(T,V)},prepareTemplateStyles(T,V,K){window.ShadyCSS.prepareTemplate(T,V,K)},prepareTemplateDom(T,V){},styleSubtree(T,V){$.flushCustomStyles(),$.styleSubtree(T,V)},styleElement(T){$.flushCustomStyles(),$.styleElement(T)},styleDocument(T){$.flushCustomStyles(),$.styleDocument(T)},getComputedStyleValue(T,V){return getComputedStyleValue(T,V)},flushCustomStyles(){$.flushCustomStyles()},nativeCss:nativeCssVariables,nativeShadow,cssBuild,disableRuntime},C&&(window.ShadyCSS.CustomStyleInterface=C)}window.ShadyCSS.ApplyShim=applyShim;/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/let HAS_NATIVE_TA=typeof document.head.style.touchAction=="string",GESTURE_KEY="__polymerGestures",HANDLED_OBJ="__polymerGesturesHandled",TOUCH_ACTION="__polymerGesturesTouchAction",TAP_DISTANCE=25,TRACK_DISTANCE=5,TRACK_LENGTH=2,MOUSE_TIMEOUT=2500,MOUSE_EVENTS=["mousedown","mousemove","mouseup","click"],MOUSE_WHICH_TO_BUTTONS=[0,1,4,2],MOUSE_HAS_BUTTONS=function(){try{return new MouseEvent("test",{buttons:1}).buttons===1}catch{return!1}}();function isMouseEvent($){return MOUSE_EVENTS.indexOf($)>-1}let supportsPassive=!1;(function(){try{let $=Object.defineProperty({},"passive",{get(){supportsPassive=!0}});window.addEventListener("test",null,$),window.removeEventListener("test",null,$)}catch{}})();function PASSIVE_TOUCH($){if(!(isMouseEvent($)||$==="touchend")&&HAS_NATIVE_TA&&supportsPassive&&passiveTouchGestures$1)return{passive:!0}}let IS_TOUCH_ONLY=navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/);const clickedLabels=[],labellable={button:!0,input:!0,keygen:!0,meter:!0,output:!0,textarea:!0,progress:!0,select:!0},canBeDisabled={button:!0,command:!0,fieldset:!0,input:!0,keygen:!0,optgroup:!0,option:!0,select:!0,textarea:!0};function canBeLabelled($){return labellable[$.localName]||!1}function matchingLabels($){let C=Array.prototype.slice.call($.labels||[]);if(!C.length){C=[];try{let T=$.getRootNode();if($.id){let V=T.querySelectorAll(`label[for = '${$.id}']`);for(let K=0;K<V.length;K++)C.push(V[K])}}catch{}}return C}let mouseCanceller=function($){let C=$.sourceCapabilities;if(!(C&&!C.firesTouchEvents)&&($[HANDLED_OBJ]={skip:!0},$.type==="click")){let T=!1,V=getComposedPath($);for(let K=0;K<V.length;K++){if(V[K].nodeType===Node.ELEMENT_NODE){if(V[K].localName==="label")clickedLabels.push(V[K]);else if(canBeLabelled(V[K])){let Y=matchingLabels(V[K]);for(let J=0;J<Y.length;J++)T=T||clickedLabels.indexOf(Y[J])>-1}}if(V[K]===POINTERSTATE.mouse.target)return}if(T)return;$.preventDefault(),$.stopPropagation()}};function setupTeardownMouseCanceller($){let C=IS_TOUCH_ONLY?["click"]:MOUSE_EVENTS;for(let T=0,V;T<C.length;T++)V=C[T],$?(clickedLabels.length=0,document.addEventListener(V,mouseCanceller,!0)):document.removeEventListener(V,mouseCanceller,!0)}function ignoreMouse($){if(!cancelSyntheticClickEvents)return;POINTERSTATE.mouse.mouseIgnoreJob||setupTeardownMouseCanceller(!0);let C=function(){setupTeardownMouseCanceller(),POINTERSTATE.mouse.target=null,POINTERSTATE.mouse.mouseIgnoreJob=null};POINTERSTATE.mouse.target=getComposedPath($)[0],POINTERSTATE.mouse.mouseIgnoreJob=Debouncer.debounce(POINTERSTATE.mouse.mouseIgnoreJob,timeOut$1.after(MOUSE_TIMEOUT),C)}function hasLeftMouseButton($){let C=$.type;if(!isMouseEvent(C))return!1;if(C==="mousemove"){let T=$.buttons===void 0?1:$.buttons;return $ instanceof window.MouseEvent&&!MOUSE_HAS_BUTTONS&&(T=MOUSE_WHICH_TO_BUTTONS[$.which]||0),Boolean(T&1)}else return($.button===void 0?0:$.button)===0}function isSyntheticClick($){if($.type==="click"){if($.detail===0)return!0;let C=_findOriginalTarget($);if(!C.nodeType||C.nodeType!==Node.ELEMENT_NODE)return!0;let T=C.getBoundingClientRect(),V=$.pageX,K=$.pageY;return!(V>=T.left&&V<=T.right&&K>=T.top&&K<=T.bottom)}return!1}let POINTERSTATE={mouse:{target:null,mouseIgnoreJob:null},touch:{x:0,y:0,id:-1,scrollDecided:!1}};function firstTouchAction($){let C="auto",T=getComposedPath($);for(let V=0,K;V<T.length;V++)if(K=T[V],K[TOUCH_ACTION]){C=K[TOUCH_ACTION];break}return C}function trackDocument($,C,T){$.movefn=C,$.upfn=T,document.addEventListener("mousemove",C),document.addEventListener("mouseup",T)}function untrackDocument($){document.removeEventListener("mousemove",$.movefn),document.removeEventListener("mouseup",$.upfn),$.movefn=null,$.upfn=null}cancelSyntheticClickEvents&&document.addEventListener("touchend",ignoreMouse,supportsPassive?{passive:!0}:!1);const getComposedPath=window.ShadyDOM&&window.ShadyDOM.noPatch?window.ShadyDOM.composedPath:$=>$.composedPath&&$.composedPath()||[],gestures={},recognizers=[];function deepTargetFind($,C){let T=document.elementFromPoint($,C),V=T;for(;V&&V.shadowRoot&&!window.ShadyDOM;){let K=V;if(V=V.shadowRoot.elementFromPoint($,C),K===V)break;V&&(T=V)}return T}function _findOriginalTarget($){const C=getComposedPath($);return C.length>0?C[0]:$.target}function _handleNative($){let C,T=$.type,K=$.currentTarget[GESTURE_KEY];if(!K)return;let Y=K[T];if(Y){if(!$[HANDLED_OBJ]&&($[HANDLED_OBJ]={},T.slice(0,5)==="touch")){$=$;let J=$.changedTouches[0];if(T==="touchstart"&&$.touches.length===1&&(POINTERSTATE.touch.id=J.identifier),POINTERSTATE.touch.id!==J.identifier)return;HAS_NATIVE_TA||(T==="touchstart"||T==="touchmove")&&_handleTouchAction($)}if(C=$[HANDLED_OBJ],!C.skip){for(let J=0,ee;J<recognizers.length;J++)ee=recognizers[J],Y[ee.name]&&!C[ee.name]&&ee.flow&&ee.flow.start.indexOf($.type)>-1&&ee.reset&&ee.reset();for(let J=0,ee;J<recognizers.length;J++)ee=recognizers[J],Y[ee.name]&&!C[ee.name]&&(C[ee.name]=!0,ee[T]($))}}}function _handleTouchAction($){let C=$.changedTouches[0],T=$.type;if(T==="touchstart")POINTERSTATE.touch.x=C.clientX,POINTERSTATE.touch.y=C.clientY,POINTERSTATE.touch.scrollDecided=!1;else if(T==="touchmove"){if(POINTERSTATE.touch.scrollDecided)return;POINTERSTATE.touch.scrollDecided=!0;let V=firstTouchAction($),K=!1,Y=Math.abs(POINTERSTATE.touch.x-C.clientX),J=Math.abs(POINTERSTATE.touch.y-C.clientY);$.cancelable&&(V==="none"?K=!0:V==="pan-x"?K=J>Y:V==="pan-y"&&(K=Y>J)),K?$.preventDefault():prevent("track")}}function addListener($,C,T){return gestures[C]?(_add($,C,T),!0):!1}function removeListener($,C,T){return gestures[C]?(_remove($,C,T),!0):!1}function _add($,C,T){let V=gestures[C],K=V.deps,Y=V.name,J=$[GESTURE_KEY];J||($[GESTURE_KEY]=J={});for(let ee=0,te,ie;ee<K.length;ee++)te=K[ee],!(IS_TOUCH_ONLY&&isMouseEvent(te)&&te!=="click")&&(ie=J[te],ie||(J[te]=ie={_count:0}),ie._count===0&&$.addEventListener(te,_handleNative,PASSIVE_TOUCH(te)),ie[Y]=(ie[Y]||0)+1,ie._count=(ie._count||0)+1);$.addEventListener(C,T),V.touchAction&&setTouchAction($,V.touchAction)}function _remove($,C,T){let V=gestures[C],K=V.deps,Y=V.name,J=$[GESTURE_KEY];if(J)for(let ee=0,te,ie;ee<K.length;ee++)te=K[ee],ie=J[te],ie&&ie[Y]&&(ie[Y]=(ie[Y]||1)-1,ie._count=(ie._count||1)-1,ie._count===0&&$.removeEventListener(te,_handleNative,PASSIVE_TOUCH(te)));$.removeEventListener(C,T)}function register($){recognizers.push($);for(let C=0;C<$.emits.length;C++)gestures[$.emits[C]]=$}function _findRecognizerByEvent($){for(let C=0,T;C<recognizers.length;C++){T=recognizers[C];for(let V=0,K;V<T.emits.length;V++)if(K=T.emits[V],K===$)return T}return null}function setTouchAction($,C){HAS_NATIVE_TA&&$ instanceof HTMLElement&&microTask$1.run(()=>{$.style.touchAction=C}),$[TOUCH_ACTION]=C}function _fire($,C,T){let V=new Event(C,{bubbles:!0,cancelable:!0,composed:!0});if(V.detail=T,wrap$1($).dispatchEvent(V),V.defaultPrevented){let K=T.preventer||T.sourceEvent;K&&K.preventDefault&&K.preventDefault()}}function prevent($){let C=_findRecognizerByEvent($);C.info&&(C.info.prevent=!0)}register({name:"downup",deps:["mousedown","touchstart","touchend"],flow:{start:["mousedown","touchstart"],end:["mouseup","touchend"]},emits:["down","up"],info:{movefn:null,upfn:null},reset:function(){untrackDocument(this.info)},mousedown:function($){if(!hasLeftMouseButton($))return;let C=_findOriginalTarget($),T=this,V=function(J){hasLeftMouseButton(J)||(downupFire("up",C,J),untrackDocument(T.info))},K=function(J){hasLeftMouseButton(J)&&downupFire("up",C,J),untrackDocument(T.info)};trackDocument(this.info,V,K),downupFire("down",C,$)},touchstart:function($){downupFire("down",_findOriginalTarget($),$.changedTouches[0],$)},touchend:function($){downupFire("up",_findOriginalTarget($),$.changedTouches[0],$)}});function downupFire($,C,T,V){C&&_fire(C,$,{x:T.clientX,y:T.clientY,sourceEvent:T,preventer:V,prevent:function(K){return prevent(K)}})}register({name:"track",touchAction:"none",deps:["mousedown","touchstart","touchmove","touchend"],flow:{start:["mousedown","touchstart"],end:["mouseup","touchend"]},emits:["track"],info:{x:0,y:0,state:"start",started:!1,moves:[],addMove:function($){this.moves.length>TRACK_LENGTH&&this.moves.shift(),this.moves.push($)},movefn:null,upfn:null,prevent:!1},reset:function(){this.info.state="start",this.info.started=!1,this.info.moves=[],this.info.x=0,this.info.y=0,this.info.prevent=!1,untrackDocument(this.info)},mousedown:function($){if(!hasLeftMouseButton($))return;let C=_findOriginalTarget($),T=this,V=function(J){let ee=J.clientX,te=J.clientY;trackHasMovedEnough(T.info,ee,te)&&(T.info.state=T.info.started?J.type==="mouseup"?"end":"track":"start",T.info.state==="start"&&prevent("tap"),T.info.addMove({x:ee,y:te}),hasLeftMouseButton(J)||(T.info.state="end",untrackDocument(T.info)),C&&trackFire(T.info,C,J),T.info.started=!0)},K=function(J){T.info.started&&V(J),untrackDocument(T.info)};trackDocument(this.info,V,K),this.info.x=$.clientX,this.info.y=$.clientY},touchstart:function($){let C=$.changedTouches[0];this.info.x=C.clientX,this.info.y=C.clientY},touchmove:function($){let C=_findOriginalTarget($),T=$.changedTouches[0],V=T.clientX,K=T.clientY;trackHasMovedEnough(this.info,V,K)&&(this.info.state==="start"&&prevent("tap"),this.info.addMove({x:V,y:K}),trackFire(this.info,C,T),this.info.state="track",this.info.started=!0)},touchend:function($){let C=_findOriginalTarget($),T=$.changedTouches[0];this.info.started&&(this.info.state="end",this.info.addMove({x:T.clientX,y:T.clientY}),trackFire(this.info,C,T))}});function trackHasMovedEnough($,C,T){if($.prevent)return!1;if($.started)return!0;let V=Math.abs($.x-C),K=Math.abs($.y-T);return V>=TRACK_DISTANCE||K>=TRACK_DISTANCE}function trackFire($,C,T){if(!C)return;let V=$.moves[$.moves.length-2],K=$.moves[$.moves.length-1],Y=K.x-$.x,J=K.y-$.y,ee,te=0;V&&(ee=K.x-V.x,te=K.y-V.y),_fire(C,"track",{state:$.state,x:T.clientX,y:T.clientY,dx:Y,dy:J,ddx:ee,ddy:te,sourceEvent:T,hover:function(){return deepTargetFind(T.clientX,T.clientY)}})}register({name:"tap",deps:["mousedown","click","touchstart","touchend"],flow:{start:["mousedown","touchstart"],end:["click","touchend"]},emits:["tap"],info:{x:NaN,y:NaN,prevent:!1},reset:function(){this.info.x=NaN,this.info.y=NaN,this.info.prevent=!1},mousedown:function($){hasLeftMouseButton($)&&(this.info.x=$.clientX,this.info.y=$.clientY)},click:function($){hasLeftMouseButton($)&&trackForward(this.info,$)},touchstart:function($){const C=$.changedTouches[0];this.info.x=C.clientX,this.info.y=C.clientY},touchend:function($){trackForward(this.info,$.changedTouches[0],$)}});function trackForward($,C,T){let V=Math.abs(C.clientX-$.x),K=Math.abs(C.clientY-$.y),Y=_findOriginalTarget(T||C);!Y||canBeDisabled[Y.localName]&&Y.hasAttribute("disabled")||(isNaN(V)||isNaN(K)||V<=TAP_DISTANCE&&K<=TAP_DISTANCE||isSyntheticClick(C))&&($.prevent||_fire(Y,"tap",{x:C.clientX,y:C.clientY,sourceEvent:C,preventer:T}))}/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const GestureEventListeners=dedupingMixin($=>{class C extends ${_addEventListenerToNode(V,K,Y){addListener(V,K,Y)||super._addEventListenerToNode(V,K,Y)}_removeEventListenerFromNode(V,K,Y){removeListener(V,K,Y)||super._removeEventListenerFromNode(V,K,Y)}}return C});/**
 * @fileoverview
 * @suppress {checkPrototypalTypes}
 * @license Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
 * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
 * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
 * Google as part of the polymer project is also subject to an additional IP
 * rights grant found at http://polymer.github.io/PATENTS.txt
 */const HOST_DIR=/:host\(:dir\((ltr|rtl)\)\)/g,HOST_DIR_REPLACMENT=':host([dir="$1"])',EL_DIR=/([\s\w-#\.\[\]\*]*):dir\((ltr|rtl)\)/g,EL_DIR_REPLACMENT=':host([dir="$2"]) $1',DIR_CHECK=/:dir\((?:ltr|rtl)\)/,SHIM_SHADOW=Boolean(window.ShadyDOM&&window.ShadyDOM.inUse),DIR_INSTANCES=[];let observer=null,documentDir="";function getRTL(){documentDir=document.documentElement.getAttribute("dir")}function setRTL($){$.__autoDirOptOut||$.setAttribute("dir",documentDir)}function updateDirection(){getRTL(),documentDir=document.documentElement.getAttribute("dir");for(let $=0;$<DIR_INSTANCES.length;$++)setRTL(DIR_INSTANCES[$])}function takeRecords(){observer&&observer.takeRecords().length&&updateDirection()}const DirMixin=dedupingMixin($=>{SHIM_SHADOW||observer||(getRTL(),observer=new MutationObserver(updateDirection),observer.observe(document.documentElement,{attributes:!0,attributeFilter:["dir"]}));const C=PropertyAccessors($);class T extends C{static _processStyleText(K,Y){return K=C._processStyleText.call(this,K,Y),!SHIM_SHADOW&&DIR_CHECK.test(K)&&(K=this._replaceDirInCssText(K),this.__activateDir=!0),K}static _replaceDirInCssText(K){let Y=K;return Y=Y.replace(HOST_DIR,HOST_DIR_REPLACMENT),Y=Y.replace(EL_DIR,EL_DIR_REPLACMENT),Y}constructor(){super(),this.__autoDirOptOut=!1}ready(){super.ready(),this.__autoDirOptOut=this.hasAttribute("dir")}connectedCallback(){C.prototype.connectedCallback&&super.connectedCallback(),this.constructor.__activateDir&&(takeRecords(),DIR_INSTANCES.push(this),setRTL(this))}disconnectedCallback(){if(C.prototype.disconnectedCallback&&super.disconnectedCallback(),this.constructor.__activateDir){const K=DIR_INSTANCES.indexOf(this);K>-1&&DIR_INSTANCES.splice(K,1)}}}return T.__activateDir=!1,T});/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/function resolve(){document.body.removeAttribute("unresolved")}document.readyState==="interactive"||document.readyState==="complete"?resolve():window.addEventListener("DOMContentLoaded",resolve);/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const p=Element.prototype,normalizedMatchesSelector=p.matches||p.matchesSelector||p.mozMatchesSelector||p.msMatchesSelector||p.oMatchesSelector||p.webkitMatchesSelector,matchesSelector=function($,C){return normalizedMatchesSelector.call($,C)};class DomApiNative{constructor(C){window.ShadyDOM&&window.ShadyDOM.inUse&&window.ShadyDOM.patch(C),this.node=C}observeNodes(C){return new FlattenedNodesObserver(this.node,C)}unobserveNodes(C){C.disconnect()}notifyObserver(){}deepContains(C){if(wrap$1(this.node).contains(C))return!0;let T=C,V=C.ownerDocument;for(;T&&T!==V&&T!==this.node;)T=wrap$1(T).parentNode||wrap$1(T).host;return T===this.node}getOwnerRoot(){return wrap$1(this.node).getRootNode()}getDistributedNodes(){return this.node.localName==="slot"?wrap$1(this.node).assignedNodes({flatten:!0}):[]}getDestinationInsertionPoints(){let C=[],T=wrap$1(this.node).assignedSlot;for(;T;)C.push(T),T=wrap$1(T).assignedSlot;return C}importNode(C,T){let V=this.node instanceof Document?this.node:this.node.ownerDocument;return wrap$1(V).importNode(C,T)}getEffectiveChildNodes(){return FlattenedNodesObserver.getFlattenedNodes(this.node)}queryDistributedElements(C){let T=this.getEffectiveChildNodes(),V=[];for(let K=0,Y=T.length,J;K<Y&&(J=T[K]);K++)J.nodeType===Node.ELEMENT_NODE&&matchesSelector(J,C)&&V.push(J);return V}get activeElement(){let C=this.node;return C._activeElement!==void 0?C._activeElement:C.activeElement}}function forwardMethods($,C){for(let T=0;T<C.length;T++){let V=C[T];$[V]=function(){return this.node[V].apply(this.node,arguments)}}}function forwardReadOnlyProperties($,C){for(let T=0;T<C.length;T++){let V=C[T];Object.defineProperty($,V,{get:function(){return this.node[V]},configurable:!0})}}function forwardProperties($,C){for(let T=0;T<C.length;T++){let V=C[T];Object.defineProperty($,V,{get:function(){return this.node[V]},set:function(K){this.node[V]=K},configurable:!0})}}class EventApi{constructor(C){this.event=C}get rootTarget(){return this.path[0]}get localTarget(){return this.event.target}get path(){return this.event.composedPath()}}DomApiNative.prototype.cloneNode;DomApiNative.prototype.appendChild;DomApiNative.prototype.insertBefore;DomApiNative.prototype.removeChild;DomApiNative.prototype.replaceChild;DomApiNative.prototype.setAttribute;DomApiNative.prototype.removeAttribute;DomApiNative.prototype.querySelector;DomApiNative.prototype.querySelectorAll;DomApiNative.prototype.parentNode;DomApiNative.prototype.firstChild;DomApiNative.prototype.lastChild;DomApiNative.prototype.nextSibling;DomApiNative.prototype.previousSibling;DomApiNative.prototype.firstElementChild;DomApiNative.prototype.lastElementChild;DomApiNative.prototype.nextElementSibling;DomApiNative.prototype.previousElementSibling;DomApiNative.prototype.childNodes;DomApiNative.prototype.children;DomApiNative.prototype.classList;DomApiNative.prototype.textContent;DomApiNative.prototype.innerHTML;let DomApiImpl=DomApiNative;if(window.ShadyDOM&&window.ShadyDOM.inUse&&window.ShadyDOM.noPatch&&window.ShadyDOM.Wrapper){class $ extends window.ShadyDOM.Wrapper{}Object.getOwnPropertyNames(DomApiNative.prototype).forEach(C=>{C!="activeElement"&&($.prototype[C]=DomApiNative.prototype[C])}),forwardReadOnlyProperties($.prototype,["classList"]),DomApiImpl=$,Object.defineProperties(EventApi.prototype,{localTarget:{get(){const C=this.event.currentTarget,T=C&&dom(C).getOwnerRoot(),V=this.path;for(let K=0;K<V.length;K++){const Y=V[K];if(dom(Y).getOwnerRoot()===T)return Y}},configurable:!0},path:{get(){return window.ShadyDOM.composedPath(this.event)},configurable:!0}})}else forwardMethods(DomApiNative.prototype,["cloneNode","appendChild","insertBefore","removeChild","replaceChild","setAttribute","removeAttribute","querySelector","querySelectorAll","attachShadow"]),forwardReadOnlyProperties(DomApiNative.prototype,["parentNode","firstChild","lastChild","nextSibling","previousSibling","firstElementChild","lastElementChild","nextElementSibling","previousElementSibling","childNodes","children","classList","shadowRoot"]),forwardProperties(DomApiNative.prototype,["textContent","innerHTML","className"]);const dom=function($){if($=$||document,$ instanceof DomApiImpl||$ instanceof EventApi)return $;let C=$.__domApi;return C||($ instanceof Event?C=new EventApi($):C=new DomApiImpl($),$.__domApi=C),C};/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const ShadyDOM$1=window.ShadyDOM,ShadyCSS=window.ShadyCSS;function sameScope($,C){return wrap$1($).getRootNode()===C}function scopeSubtree($,C=!1){if(!ShadyDOM$1||!ShadyCSS||!ShadyDOM$1.handlesDynamicScoping)return null;const T=ShadyCSS.ScopingShim;if(!T)return null;const V=T.scopeForNode($),K=wrap$1($).getRootNode(),Y=J=>{if(!sameScope(J,K))return;const ee=Array.from(ShadyDOM$1.nativeMethods.querySelectorAll.call(J,"*"));ee.push(J);for(let te=0;te<ee.length;te++){const ie=ee[te];if(!sameScope(ie,K))continue;const re=T.currentScopeForNode(ie);re!==V&&(re!==""&&T.unscopeNode(ie,re),T.scopeNode(ie,V))}};if(Y($),C){const J=new MutationObserver(ee=>{for(let te=0;te<ee.length;te++){const ie=ee[te];for(let re=0;re<ie.addedNodes.length;re++){const se=ie.addedNodes[re];se.nodeType===Node.ELEMENT_NODE&&Y(se)}}});return J.observe($,{childList:!0,subtree:!0}),J}else return null}/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const DISABLED_ATTR="disable-upgrade";let styleInterface=window.ShadyCSS;const LegacyElementMixin=dedupingMixin($=>{const C=GestureEventListeners(ElementMixin$1($)),T=builtCSS?C:DirMixin(C),V=findObservedAttributesGetter(T),K={x:"pan-x",y:"pan-y",none:"none",all:"auto"};class Y extends T{constructor(){super(),this.isAttached,this.__boundListeners,this._debouncers,this.__isUpgradeDisabled,this.__needsAttributesAtConnected,this._legacyForceObservedAttributes}static get importMeta(){return this.prototype.importMeta}created(){}__attributeReaction(ee,te,ie){(this.__dataAttributes&&this.__dataAttributes[ee]||ee===DISABLED_ATTR)&&this.attributeChangedCallback(ee,te,ie,null)}setAttribute(ee,te){if(legacyNoObservedAttributes&&!this._legacyForceObservedAttributes){const ie=this.getAttribute(ee);super.setAttribute(ee,te),this.__attributeReaction(ee,ie,String(te))}else super.setAttribute(ee,te)}removeAttribute(ee){if(legacyNoObservedAttributes&&!this._legacyForceObservedAttributes){const te=this.getAttribute(ee);super.removeAttribute(ee),this.__attributeReaction(ee,te,null)}else super.removeAttribute(ee)}static get observedAttributes(){return legacyNoObservedAttributes&&!this.prototype._legacyForceObservedAttributes?(this.hasOwnProperty(JSCompiler_renameProperty("__observedAttributes",this))||(this.__observedAttributes=[],register$2(this.prototype)),this.__observedAttributes):V.call(this).concat(DISABLED_ATTR)}_enableProperties(){this.__isUpgradeDisabled||super._enableProperties()}_canApplyPropertyDefault(ee){return super._canApplyPropertyDefault(ee)&&!(this.__isUpgradeDisabled&&this._isPropertyPending(ee))}connectedCallback(){this.__needsAttributesAtConnected&&this._takeAttributes(),this.__isUpgradeDisabled||(super.connectedCallback(),this.isAttached=!0,this.attached())}attached(){}disconnectedCallback(){this.__isUpgradeDisabled||(super.disconnectedCallback(),this.isAttached=!1,this.detached())}detached(){}attributeChangedCallback(ee,te,ie,re){te!==ie&&(ee==DISABLED_ATTR?this.__isUpgradeDisabled&&ie==null&&(this._initializeProperties(),this.__isUpgradeDisabled=!1,wrap$1(this).isConnected&&this.connectedCallback()):(super.attributeChangedCallback(ee,te,ie,re),this.attributeChanged(ee,te,ie)))}attributeChanged(ee,te,ie){}_initializeProperties(){if(legacyOptimizations&&this.hasAttribute(DISABLED_ATTR))this.__isUpgradeDisabled=!0;else{let ee=Object.getPrototypeOf(this);ee.hasOwnProperty(JSCompiler_renameProperty("__hasRegisterFinished",ee))||(this._registered(),ee.__hasRegisterFinished=!0),super._initializeProperties(),this.root=this,this.created(),legacyNoObservedAttributes&&!this._legacyForceObservedAttributes&&(this.hasAttributes()?this._takeAttributes():this.parentNode||(this.__needsAttributesAtConnected=!0)),this._applyListeners()}}_takeAttributes(){const ee=this.attributes;for(let te=0,ie=ee.length;te<ie;te++){const re=ee[te];this.__attributeReaction(re.name,null,re.value)}}_registered(){}ready(){this._ensureAttributes(),super.ready()}_ensureAttributes(){}_applyListeners(){}serialize(ee){return this._serializeValue(ee)}deserialize(ee,te){return this._deserializeValue(ee,te)}reflectPropertyToAttribute(ee,te,ie){this._propertyToAttribute(ee,te,ie)}serializeValueToAttribute(ee,te,ie){this._valueToNodeAttribute(ie||this,ee,te)}extend(ee,te){if(!(ee&&te))return ee||te;let ie=Object.getOwnPropertyNames(te);for(let re=0,se;re<ie.length&&(se=ie[re]);re++){let oe=Object.getOwnPropertyDescriptor(te,se);oe&&Object.defineProperty(ee,se,oe)}return ee}mixin(ee,te){for(let ie in te)ee[ie]=te[ie];return ee}chainObject(ee,te){return ee&&te&&ee!==te&&(ee.__proto__=te),ee}instanceTemplate(ee){let te=this.constructor._contentForTemplate(ee);return document.importNode(te,!0)}fire(ee,te,ie){ie=ie||{},te=te??{};let re=new Event(ee,{bubbles:ie.bubbles===void 0?!0:ie.bubbles,cancelable:Boolean(ie.cancelable),composed:ie.composed===void 0?!0:ie.composed});re.detail=te;let se=ie.node||this;return wrap$1(se).dispatchEvent(re),re}listen(ee,te,ie){ee=ee||this;let re=this.__boundListeners||(this.__boundListeners=new WeakMap),se=re.get(ee);se||(se={},re.set(ee,se));let oe=te+ie;se[oe]||(se[oe]=this._addMethodEventListenerToNode(ee,te,ie,this))}unlisten(ee,te,ie){ee=ee||this;let re=this.__boundListeners&&this.__boundListeners.get(ee),se=te+ie,oe=re&&re[se];oe&&(this._removeEventListenerFromNode(ee,te,oe),re[se]=null)}setScrollDirection(ee,te){setTouchAction(te||this,K[ee]||"auto")}$$(ee){return this.root.querySelector(ee)}get domHost(){let ee=wrap$1(this).getRootNode();return ee instanceof DocumentFragment?ee.host:ee}distributeContent(){const te=dom(this);window.ShadyDOM&&te.shadowRoot&&ShadyDOM.flush()}getEffectiveChildNodes(){return dom(this).getEffectiveChildNodes()}queryDistributedElements(ee){return dom(this).queryDistributedElements(ee)}getEffectiveChildren(){return this.getEffectiveChildNodes().filter(function(te){return te.nodeType===Node.ELEMENT_NODE})}getEffectiveTextContent(){let ee=this.getEffectiveChildNodes(),te=[];for(let ie=0,re;re=ee[ie];ie++)re.nodeType!==Node.COMMENT_NODE&&te.push(re.textContent);return te.join("")}queryEffectiveChildren(ee){let te=this.queryDistributedElements(ee);return te&&te[0]}queryAllEffectiveChildren(ee){return this.queryDistributedElements(ee)}getContentChildNodes(ee){let te=this.root.querySelector(ee||"slot");return te?dom(te).getDistributedNodes():[]}getContentChildren(ee){return this.getContentChildNodes(ee).filter(function(ie){return ie.nodeType===Node.ELEMENT_NODE})}isLightDescendant(ee){const te=this;return te!==ee&&wrap$1(te).contains(ee)&&wrap$1(te).getRootNode()===wrap$1(ee).getRootNode()}isLocalDescendant(ee){return this.root===wrap$1(ee).getRootNode()}scopeSubtree(ee,te=!1){return scopeSubtree(ee,te)}getComputedStyleValue(ee){return styleInterface.getComputedStyleValue(this,ee)}debounce(ee,te,ie){return this._debouncers=this._debouncers||{},this._debouncers[ee]=Debouncer.debounce(this._debouncers[ee],ie>0?timeOut$1.after(ie):microTask$1,te.bind(this))}isDebouncerActive(ee){this._debouncers=this._debouncers||{};let te=this._debouncers[ee];return!!(te&&te.isActive())}flushDebouncer(ee){this._debouncers=this._debouncers||{};let te=this._debouncers[ee];te&&te.flush()}cancelDebouncer(ee){this._debouncers=this._debouncers||{};let te=this._debouncers[ee];te&&te.cancel()}async(ee,te){return te>0?timeOut$1.run(ee.bind(this),te):~microTask$1.run(ee.bind(this))}cancelAsync(ee){ee<0?microTask$1.cancel(~ee):timeOut$1.cancel(ee)}create(ee,te){let ie=document.createElement(ee);if(te)if(ie.setProperties)ie.setProperties(te);else for(let re in te)ie[re]=te[re];return ie}elementMatches(ee,te){return matchesSelector(te||this,ee)}toggleAttribute(ee,te){let ie=this;return arguments.length===3&&(ie=arguments[2]),arguments.length==1&&(te=!ie.hasAttribute(ee)),te?(wrap$1(ie).setAttribute(ee,""),!0):(wrap$1(ie).removeAttribute(ee),!1)}toggleClass(ee,te,ie){ie=ie||this,arguments.length==1&&(te=!ie.classList.contains(ee)),te?ie.classList.add(ee):ie.classList.remove(ee)}transform(ee,te){te=te||this,te.style.webkitTransform=ee,te.style.transform=ee}translate3d(ee,te,ie,re){re=re||this,this.transform("translate3d("+ee+","+te+","+ie+")",re)}arrayDelete(ee,te){let ie;if(Array.isArray(ee)){if(ie=ee.indexOf(te),ie>=0)return ee.splice(ie,1)}else if(ie=get$1(this,ee).indexOf(te),ie>=0)return this.splice(ee,ie,1);return null}_logger(ee,te){switch(Array.isArray(te)&&te.length===1&&Array.isArray(te[0])&&(te=te[0]),ee){case"log":case"warn":case"error":console[ee](...te)}}_log(...ee){this._logger("log",ee)}_warn(...ee){this._logger("warn",ee)}_error(...ee){this._logger("error",ee)}_logf(ee,...te){return["[%s::%s]",this.is,ee,...te]}}return Y.prototype.is="",Y});/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const lifecycleProps={attached:!0,detached:!0,ready:!0,created:!0,beforeRegister:!0,registered:!0,attributeChanged:!0,listeners:!0,hostAttributes:!0},excludeOnInfo={attached:!0,detached:!0,ready:!0,created:!0,beforeRegister:!0,registered:!0,attributeChanged:!0,behaviors:!0,_noAccessors:!0},excludeOnBehaviors=Object.assign({listeners:!0,hostAttributes:!0,properties:!0,observers:!0},excludeOnInfo);function copyProperties($,C,T){const V=$._noAccessors,K=Object.getOwnPropertyNames($);for(let Y=0;Y<K.length;Y++){let J=K[Y];if(!(J in T))if(V)C[J]=$[J];else{let ee=Object.getOwnPropertyDescriptor($,J);ee&&(ee.configurable=!0,Object.defineProperty(C,J,ee))}}}function applyBehaviors($,C,T){for(let V=0;V<C.length;V++)applyInfo($,C[V],T,excludeOnBehaviors)}function applyInfo($,C,T,V){copyProperties(C,$,V);for(let K in lifecycleProps)C[K]&&(T[K]=T[K]||[],T[K].push(C[K]))}function flattenBehaviors($,C,T){C=C||[];for(let V=$.length-1;V>=0;V--){let K=$[V];K?Array.isArray(K)?flattenBehaviors(K,C):C.indexOf(K)<0&&(!T||T.indexOf(K)<0)&&C.unshift(K):console.warn("behavior is null, check for missing or 404 import")}return C}function mergeProperties($,C){for(const T in C){const V=$[T],K=C[T];!("value"in K)&&V&&"value"in V?$[T]=Object.assign({value:V.value},K):$[T]=K}}const LegacyElement=LegacyElementMixin(HTMLElement);function GenerateClassFromInfo($,C,T){let V;const K={};class Y extends C{static _finalizeClass(){if(!this.hasOwnProperty(JSCompiler_renameProperty("generatedFrom",this)))C._finalizeClass.call(this);else{if(V)for(let te=0,ie;te<V.length;te++)ie=V[te],ie.properties&&this.createProperties(ie.properties),ie.observers&&this.createObservers(ie.observers,ie.properties);$.properties&&this.createProperties($.properties),$.observers&&this.createObservers($.observers,$.properties),this._prepareTemplate()}}static get properties(){const te={};if(V)for(let ie=0;ie<V.length;ie++)mergeProperties(te,V[ie].properties);return mergeProperties(te,$.properties),te}static get observers(){let te=[];if(V)for(let ie=0,re;ie<V.length;ie++)re=V[ie],re.observers&&(te=te.concat(re.observers));return $.observers&&(te=te.concat($.observers)),te}created(){super.created();const te=K.created;if(te)for(let ie=0;ie<te.length;ie++)te[ie].call(this)}_registered(){const te=Y.prototype;if(!te.hasOwnProperty(JSCompiler_renameProperty("__hasRegisterFinished",te))){te.__hasRegisterFinished=!0,super._registered(),legacyOptimizations&&J(te);const ie=Object.getPrototypeOf(this);let re=K.beforeRegister;if(re)for(let se=0;se<re.length;se++)re[se].call(ie);if(re=K.registered,re)for(let se=0;se<re.length;se++)re[se].call(ie)}}_applyListeners(){super._applyListeners();const te=K.listeners;if(te)for(let ie=0;ie<te.length;ie++){const re=te[ie];if(re)for(let se in re)this._addMethodEventListenerToNode(this,se,re[se])}}_ensureAttributes(){const te=K.hostAttributes;if(te)for(let ie=te.length-1;ie>=0;ie--){const re=te[ie];for(let se in re)this._ensureAttribute(se,re[se])}super._ensureAttributes()}ready(){super.ready();let te=K.ready;if(te)for(let ie=0;ie<te.length;ie++)te[ie].call(this)}attached(){super.attached();let te=K.attached;if(te)for(let ie=0;ie<te.length;ie++)te[ie].call(this)}detached(){super.detached();let te=K.detached;if(te)for(let ie=0;ie<te.length;ie++)te[ie].call(this)}attributeChanged(te,ie,re){super.attributeChanged();let se=K.attributeChanged;if(se)for(let oe=0;oe<se.length;oe++)se[oe].call(this,te,ie,re)}}if(T){Array.isArray(T)||(T=[T]);let ee=C.prototype.behaviors;V=flattenBehaviors(T,null,ee),Y.prototype.behaviors=ee?ee.concat(T):V}const J=ee=>{V&&applyBehaviors(ee,V,K),applyInfo(ee,$,K,excludeOnInfo)};return legacyOptimizations||J(Y.prototype),Y.generatedFrom=$,Y}const Class=function($,C){$||console.warn("Polymer.Class requires `info` argument");let T=C?C(LegacyElement):LegacyElement;return T=GenerateClassFromInfo($,T,$.behaviors),T.is=T.prototype.is=$.is,T};/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const Polymer=function($){let C;return typeof $=="function"?C=$:C=Polymer.Class($),$._legacyForceObservedAttributes&&(C.prototype._legacyForceObservedAttributes=$._legacyForceObservedAttributes),customElements.define(C.is,C),C};Polymer.Class=Class;/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const domBindBase=GestureEventListeners(OptionalMutableData(PropertyEffects(HTMLElement)));class DomBind extends domBindBase{static get observedAttributes(){return["mutable-data"]}constructor(){if(super(),strictTemplatePolicy)throw new Error("strictTemplatePolicy: dom-bind not allowed");this.root=null,this.$=null,this.__children=null}attributeChangedCallback(C,T,V,K){this.mutableData=!0}connectedCallback(){hideElementsGlobally()||(this.style.display="none"),this.render()}disconnectedCallback(){this.__removeChildren()}__insertChildren(){wrap$1(wrap$1(this).parentNode).insertBefore(this.root,this)}__removeChildren(){if(this.__children)for(let C=0;C<this.__children.length;C++)this.root.appendChild(this.__children[C])}render(){let C;if(!this.__children){if(C=C||this.querySelector("template"),!C){let T=new MutationObserver(()=>{if(C=this.querySelector("template"),C)T.disconnect(),this.render();else throw new Error("dom-bind requires a <template> child")});T.observe(this,{childList:!0});return}this.root=this._stampTemplate(C),this.$=this.root.$,this.__children=[];for(let T=this.root.firstChild;T;T=T.nextSibling)this.__children[this.__children.length]=T;this._enableProperties()}this.__insertChildren(),this.dispatchEvent(new CustomEvent("dom-change",{bubbles:!0,composed:!0}))}}customElements.define("dom-bind",DomBind);/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/class DomIfBase extends PolymerElement{static get is(){return"dom-if"}static get template(){return null}static get properties(){return{if:{type:Boolean,observer:"__debounceRender"},restamp:{type:Boolean,observer:"__debounceRender"},notifyDomChange:{type:Boolean}}}constructor(){super(),this.__renderDebouncer=null,this._lastIf=!1,this.__hideTemplateChildren__=!1,this.__template,this._templateInfo}__debounceRender(){this.__renderDebouncer=Debouncer.debounce(this.__renderDebouncer,microTask$1,()=>this.__render()),enqueueDebouncer(this.__renderDebouncer)}disconnectedCallback(){super.disconnectedCallback();const C=wrap$1(this).parentNode;(!C||C.nodeType==Node.DOCUMENT_FRAGMENT_NODE&&!wrap$1(C).host)&&this.__teardownInstance()}connectedCallback(){super.connectedCallback(),hideElementsGlobally()||(this.style.display="none"),this.if&&this.__debounceRender()}__ensureTemplate(){if(!this.__template){const C=this;let T=C._templateInfo?C:wrap$1(C).querySelector("template");if(!T){let V=new MutationObserver(()=>{if(wrap$1(this).querySelector("template"))V.disconnect(),this.__render();else throw new Error("dom-if requires a <template> child")});return V.observe(this,{childList:!0}),!1}this.__template=T}return!0}__ensureInstance(){let C=wrap$1(this).parentNode;if(this.__hasInstance()){let T=this.__getInstanceNodes();if(T&&T.length&&wrap$1(this).previousSibling!==T[T.length-1])for(let K=0,Y;K<T.length&&(Y=T[K]);K++)wrap$1(C).insertBefore(Y,this)}else{if(!C||!this.__ensureTemplate())return!1;this.__createAndInsertInstance(C)}return!0}render(){flush()}__render(){if(this.if){if(!this.__ensureInstance())return}else this.restamp&&this.__teardownInstance();this._showHideChildren(),(!suppressTemplateNotifications||this.notifyDomChange)&&this.if!=this._lastIf&&(this.dispatchEvent(new CustomEvent("dom-change",{bubbles:!0,composed:!0})),this._lastIf=this.if)}__hasInstance(){}__getInstanceNodes(){}__createAndInsertInstance(C){}__teardownInstance(){}_showHideChildren(){}}class DomIfFast extends DomIfBase{constructor(){super(),this.__instance=null,this.__syncInfo=null}__hasInstance(){return Boolean(this.__instance)}__getInstanceNodes(){return this.__instance.templateInfo.childNodes}__createAndInsertInstance(C){const T=this.__dataHost||this;if(strictTemplatePolicy&&!this.__dataHost)throw new Error("strictTemplatePolicy: template owner not trusted");const V=T._bindTemplate(this.__template,!0);V.runEffects=(K,Y,J)=>{let ee=this.__syncInfo;if(this.if)ee&&(this.__syncInfo=null,this._showHideChildren(),Y=Object.assign(ee.changedProps,Y)),K(Y,J);else if(this.__instance)if(ee||(ee=this.__syncInfo={runEffects:K,changedProps:{}}),J)for(const te in Y){const ie=root(te);ee.changedProps[ie]=this.__dataHost[ie]}else Object.assign(ee.changedProps,Y)},this.__instance=T._stampTemplate(this.__template,V),wrap$1(C).insertBefore(this.__instance,this)}__syncHostProperties(){const C=this.__syncInfo;C&&(this.__syncInfo=null,C.runEffects(C.changedProps,!1))}__teardownInstance(){const C=this.__dataHost||this;this.__instance&&(C._removeBoundDom(this.__instance),this.__instance=null,this.__syncInfo=null)}_showHideChildren(){const C=this.__hideTemplateChildren__||!this.if;this.__instance&&Boolean(this.__instance.__hidden)!==C&&(this.__instance.__hidden=C,showHideChildren(C,this.__instance.templateInfo.childNodes)),C||this.__syncHostProperties()}}class DomIfLegacy extends DomIfBase{constructor(){super(),this.__ctor=null,this.__instance=null,this.__invalidProps=null}__hasInstance(){return Boolean(this.__instance)}__getInstanceNodes(){return this.__instance.children}__createAndInsertInstance(C){this.__ctor||(this.__ctor=templatize(this.__template,this,{mutableData:!0,forwardHostProp:function(T,V){this.__instance&&(this.if?this.__instance.forwardHostProp(T,V):(this.__invalidProps=this.__invalidProps||Object.create(null),this.__invalidProps[root(T)]=!0))}})),this.__instance=new this.__ctor,wrap$1(C).insertBefore(this.__instance.root,this)}__teardownInstance(){if(this.__instance){let C=this.__instance.children;if(C&&C.length){let T=wrap$1(C[0]).parentNode;if(T){T=wrap$1(T);for(let V=0,K;V<C.length&&(K=C[V]);V++)T.removeChild(K)}}this.__invalidProps=null,this.__instance=null}}__syncHostProperties(){let C=this.__invalidProps;if(C){this.__invalidProps=null;for(let T in C)this.__instance._setPendingProperty(T,this.__dataHost[T]);this.__instance._flushProperties()}}_showHideChildren(){const C=this.__hideTemplateChildren__||!this.if;this.__instance&&Boolean(this.__instance.__hidden)!==C&&(this.__instance.__hidden=C,this.__instance._showHideChildren(C)),C||this.__syncHostProperties()}}const DomIf=fastDomIf?DomIfFast:DomIfLegacy;customElements.define(DomIf.is,DomIf);/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/let ArraySelectorMixin=dedupingMixin($=>{let C=ElementMixin$1($);class T extends C{static get properties(){return{items:{type:Array},multi:{type:Boolean,value:!1},selected:{type:Object,notify:!0},selectedItem:{type:Object,notify:!0},toggle:{type:Boolean,value:!1}}}static get observers(){return["__updateSelection(multi, items.*)"]}constructor(){super(),this.__lastItems=null,this.__lastMulti=null,this.__selectedMap=null}__updateSelection(K,Y){let J=Y.path;if(J==JSCompiler_renameProperty("items",this)){let ee=Y.base||[],te=this.__lastItems,ie=this.__lastMulti;if(K!==ie&&this.clearSelection(),te){let re=calculateSplices(ee,te);this.__applySplices(re)}this.__lastItems=ee,this.__lastMulti=K}else if(Y.path==`${JSCompiler_renameProperty("items",this)}.splices`)this.__applySplices(Y.value.indexSplices);else{let ee=J.slice(`${JSCompiler_renameProperty("items",this)}.`.length),te=parseInt(ee,10);ee.indexOf(".")<0&&ee==te&&this.__deselectChangedIdx(te)}}__applySplices(K){let Y=this.__selectedMap;for(let ee=0;ee<K.length;ee++){let te=K[ee];Y.forEach((ie,re)=>{ie<te.index||(ie>=te.index+te.removed.length?Y.set(re,ie+te.addedCount-te.removed.length):Y.set(re,-1))});for(let ie=0;ie<te.addedCount;ie++){let re=te.index+ie;Y.has(this.items[re])&&Y.set(this.items[re],re)}}this.__updateLinks();let J=0;Y.forEach((ee,te)=>{ee<0?(this.multi?this.splice(JSCompiler_renameProperty("selected",this),J,1):this.selected=this.selectedItem=null,Y.delete(te)):J++})}__updateLinks(){if(this.__dataLinkedPaths={},this.multi){let K=0;this.__selectedMap.forEach(Y=>{Y>=0&&this.linkPaths(`${JSCompiler_renameProperty("items",this)}.${Y}`,`${JSCompiler_renameProperty("selected",this)}.${K++}`)})}else this.__selectedMap.forEach(K=>{this.linkPaths(JSCompiler_renameProperty("selected",this),`${JSCompiler_renameProperty("items",this)}.${K}`),this.linkPaths(JSCompiler_renameProperty("selectedItem",this),`${JSCompiler_renameProperty("items",this)}.${K}`)})}clearSelection(){this.__dataLinkedPaths={},this.__selectedMap=new Map,this.selected=this.multi?[]:null,this.selectedItem=null}isSelected(K){return this.__selectedMap.has(K)}isIndexSelected(K){return this.isSelected(this.items[K])}__deselectChangedIdx(K){let Y=this.__selectedIndexForItemIndex(K);if(Y>=0){let J=0;this.__selectedMap.forEach((ee,te)=>{Y==J++&&this.deselect(te)})}}__selectedIndexForItemIndex(K){let Y=this.__dataLinkedPaths[`${JSCompiler_renameProperty("items",this)}.${K}`];if(Y)return parseInt(Y.slice(`${JSCompiler_renameProperty("selected",this)}.`.length),10)}deselect(K){let Y=this.__selectedMap.get(K);if(Y>=0){this.__selectedMap.delete(K);let J;this.multi&&(J=this.__selectedIndexForItemIndex(Y)),this.__updateLinks(),this.multi?this.splice(JSCompiler_renameProperty("selected",this),J,1):this.selected=this.selectedItem=null}}deselectIndex(K){this.deselect(this.items[K])}select(K){this.selectIndex(this.items.indexOf(K))}selectIndex(K){let Y=this.items[K];this.isSelected(Y)?this.toggle&&this.deselectIndex(K):(this.multi||this.__selectedMap.clear(),this.__selectedMap.set(Y,K),this.__updateLinks(),this.multi?this.push(JSCompiler_renameProperty("selected",this),Y):this.selected=this.selectedItem=Y)}}return T}),baseArraySelector=ArraySelectorMixin(PolymerElement);class ArraySelector extends baseArraySelector{static get is(){return"array-selector"}static get template(){return null}}customElements.define(ArraySelector.is,ArraySelector);/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const customStyleInterface=new CustomStyleInterface$1;window.ShadyCSS||(window.ShadyCSS={prepareTemplate($,C,T){},prepareTemplateDom($,C){},prepareTemplateStyles($,C,T){},styleSubtree($,C){customStyleInterface.processStyles(),updateNativeProperties($,C)},styleElement($){customStyleInterface.processStyles()},styleDocument($){customStyleInterface.processStyles(),updateNativeProperties(document.body,$)},getComputedStyleValue($,C){return getComputedStyleValue($,C)},flushCustomStyles(){},nativeCss:nativeCssVariables,nativeShadow,cssBuild,disableRuntime});window.ShadyCSS.CustomStyleInterface=customStyleInterface;/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const attr="include",CustomStyleInterface=window.ShadyCSS.CustomStyleInterface;class CustomStyle extends HTMLElement{constructor(){super(),this._style=null,CustomStyleInterface.addCustomStyle(this)}getStyle(){if(this._style)return this._style;const C=this.querySelector("style");if(!C)return null;this._style=C;const T=C.getAttribute(attr);return T&&(C.removeAttribute(attr),C.textContent=cssFromModules(T)+C.textContent),this.ownerDocument!==window.document&&window.document.head.appendChild(this),this._style}}window.customElements.define("custom-style",CustomStyle);/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/LegacyElementMixin(HTMLElement).prototype;/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const template$6=html`
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
</custom-style>`;template$6.setAttribute("style","display: none;");document.head.appendChild(template$6.content);var style=document.createElement("style");style.textContent="[hidden] { display: none !important; }";document.head.appendChild(style);/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const template$5=html`
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
`;template$5.setAttribute("style","display: none;");document.head.appendChild(template$5.content);/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const template$4=html`
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
</custom-style>`;template$4.setAttribute("style","display: none;");document.head.appendChild(template$4.content);/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const IronFormElementBehavior={properties:{name:{type:String},value:{notify:!0,type:String},required:{type:Boolean,value:!1}},attached:function(){},detached:function(){}};/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/class IronMeta{constructor(C){IronMeta[" "](C),this.type=C&&C.type||"default",this.key=C&&C.key,C&&"value"in C&&(this.value=C.value)}get value(){var C=this.type,T=this.key;if(C&&T)return IronMeta.types[C]&&IronMeta.types[C][T]}set value(C){var T=this.type,V=this.key;T&&V&&(T=IronMeta.types[T]=IronMeta.types[T]||{},C==null?delete T[V]:T[V]=C)}get list(){var C=this.type;if(C){var T=IronMeta.types[this.type];return T?Object.keys(T).map(function(V){return metaDatas[this.type][V]},this):[]}}byKey(C){return this.key=C,this.value}}IronMeta[" "]=function(){};IronMeta.types={};var metaDatas=IronMeta.types;Polymer({is:"iron-meta",properties:{type:{type:String,value:"default"},key:{type:String},value:{type:String,notify:!0},self:{type:Boolean,observer:"_selfChanged"},__meta:{type:Boolean,computed:"__computeMeta(type, key, value)"}},hostAttributes:{hidden:!0},__computeMeta:function($,C,T){var V=new IronMeta({type:$,key:C});return T!==void 0&&T!==V.value?V.value=T:this.value!==V.value&&(this.value=V.value),V},get list(){return this.__meta&&this.__meta.list},_selfChanged:function($){$&&(this.value=this)},byKey:function($){return new IronMeta({type:this.type,key:$}).value}});/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/let IronValidatableBehaviorMeta=null;const IronValidatableBehavior={properties:{validator:{type:String},invalid:{notify:!0,reflectToAttribute:!0,type:Boolean,value:!1,observer:"_invalidChanged"}},registered:function(){IronValidatableBehaviorMeta=new IronMeta({type:"validator"})},_invalidChanged:function(){this.invalid?this.setAttribute("aria-invalid","true"):this.removeAttribute("aria-invalid")},get _validator(){return IronValidatableBehaviorMeta&&IronValidatableBehaviorMeta.byKey(this.validator)},hasValidator:function(){return this._validator!=null},validate:function($){return $===void 0&&this.value!==void 0?this.invalid=!this._getValidity(this.value):this.invalid=!this._getValidity($),!this.invalid},_getValidity:function($){return this.hasValidator()?this._validator.validate($):!0}};/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const IronCheckedElementBehaviorImpl={properties:{checked:{type:Boolean,value:!1,reflectToAttribute:!0,notify:!0,observer:"_checkedChanged"},toggles:{type:Boolean,value:!0,reflectToAttribute:!0},value:{type:String,value:"on",observer:"_valueChanged"}},observers:["_requiredChanged(required)"],created:function(){this._hasIronCheckedElementBehavior=!0},_getValidity:function($){return this.disabled||!this.required||this.checked},_requiredChanged:function(){this.required?this.setAttribute("aria-required","true"):this.removeAttribute("aria-required")},_checkedChanged:function(){this.active=this.checked,this.fire("iron-change")},_valueChanged:function(){(this.value===void 0||this.value===null)&&(this.value="on")}},IronCheckedElementBehavior=[IronFormElementBehavior,IronValidatableBehavior,IronCheckedElementBehaviorImpl];/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const IronControlState={properties:{focused:{type:Boolean,value:!1,notify:!0,readOnly:!0,reflectToAttribute:!0},disabled:{type:Boolean,value:!1,notify:!0,observer:"_disabledChanged",reflectToAttribute:!0},_oldTabIndex:{type:String},_boundFocusBlurHandler:{type:Function,value:function(){return this._focusBlurHandler.bind(this)}}},observers:["_changedControlState(focused, disabled)"],ready:function(){this.addEventListener("focus",this._boundFocusBlurHandler,!0),this.addEventListener("blur",this._boundFocusBlurHandler,!0)},_focusBlurHandler:function($){this._setFocused($.type==="focus")},_disabledChanged:function($,C){this.setAttribute("aria-disabled",$?"true":"false"),this.style.pointerEvents=$?"none":"",$?(this._oldTabIndex=this.getAttribute("tabindex"),this._setFocused(!1),this.tabIndex=-1,this.blur()):this._oldTabIndex!==void 0&&(this._oldTabIndex===null?this.removeAttribute("tabindex"):this.setAttribute("tabindex",this._oldTabIndex))},_changedControlState:function(){this._controlStateChanged&&this._controlStateChanged()}};/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/var KEY_IDENTIFIER={"U+0008":"backspace","U+0009":"tab","U+001B":"esc","U+0020":"space","U+007F":"del"},KEY_CODE={8:"backspace",9:"tab",13:"enter",27:"esc",33:"pageup",34:"pagedown",35:"end",36:"home",32:"space",37:"left",38:"up",39:"right",40:"down",46:"del",106:"*"},MODIFIER_KEYS={shift:"shiftKey",ctrl:"ctrlKey",alt:"altKey",meta:"metaKey"},KEY_CHAR=/[a-z0-9*]/,IDENT_CHAR=/U\+/,ARROW_KEY=/^arrow/,SPACE_KEY=/^space(bar)?/,ESC_KEY=/^escape$/;function transformKey($,C){var T="";if($){var V=$.toLowerCase();V===" "||SPACE_KEY.test(V)?T="space":ESC_KEY.test(V)?T="esc":V.length==1?(!C||KEY_CHAR.test(V))&&(T=V):ARROW_KEY.test(V)?T=V.replace("arrow",""):V=="multiply"?T="*":T=V}return T}function transformKeyIdentifier($){var C="";return $&&($ in KEY_IDENTIFIER?C=KEY_IDENTIFIER[$]:IDENT_CHAR.test($)?($=parseInt($.replace("U+","0x"),16),C=String.fromCharCode($).toLowerCase()):C=$.toLowerCase()),C}function transformKeyCode($){var C="";return Number($)&&($>=65&&$<=90?C=String.fromCharCode(32+$):$>=112&&$<=123?C="f"+($-112+1):$>=48&&$<=57?C=String($-48):$>=96&&$<=105?C=String($-96):C=KEY_CODE[$]),C}function normalizedKeyForEvent($,C){return $.key?transformKey($.key,C):$.detail&&$.detail.key?transformKey($.detail.key,C):transformKeyIdentifier($.keyIdentifier)||transformKeyCode($.keyCode)||""}function keyComboMatchesEvent($,C){var T=normalizedKeyForEvent(C,$.hasModifiers);return T===$.key&&(!$.hasModifiers||!!C.shiftKey==!!$.shiftKey&&!!C.ctrlKey==!!$.ctrlKey&&!!C.altKey==!!$.altKey&&!!C.metaKey==!!$.metaKey)}function parseKeyComboString($){return $.length===1?{combo:$,key:$,event:"keydown"}:$.split("+").reduce(function(C,T){var V=T.split(":"),K=V[0],Y=V[1];return K in MODIFIER_KEYS?(C[MODIFIER_KEYS[K]]=!0,C.hasModifiers=!0):(C.key=K,C.event=Y||"keydown"),C},{combo:$.split(":").shift()})}function parseEventString($){return $.trim().split(" ").map(function(C){return parseKeyComboString(C)})}const IronA11yKeysBehavior={properties:{keyEventTarget:{type:Object,value:function(){return this}},stopKeyboardEventPropagation:{type:Boolean,value:!1},_boundKeyHandlers:{type:Array,value:function(){return[]}},_imperativeKeyBindings:{type:Object,value:function(){return{}}}},observers:["_resetKeyEventListeners(keyEventTarget, _boundKeyHandlers)"],keyBindings:{},registered:function(){this._prepKeyBindings()},attached:function(){this._listenKeyEventListeners()},detached:function(){this._unlistenKeyEventListeners()},addOwnKeyBinding:function($,C){this._imperativeKeyBindings[$]=C,this._prepKeyBindings(),this._resetKeyEventListeners()},removeOwnKeyBindings:function(){this._imperativeKeyBindings={},this._prepKeyBindings(),this._resetKeyEventListeners()},keyboardEventMatchesKeys:function($,C){for(var T=parseEventString(C),V=0;V<T.length;++V)if(keyComboMatchesEvent(T[V],$))return!0;return!1},_collectKeyBindings:function(){var $=this.behaviors.map(function(C){return C.keyBindings});return $.indexOf(this.keyBindings)===-1&&$.push(this.keyBindings),$},_prepKeyBindings:function(){this._keyBindings={},this._collectKeyBindings().forEach(function(T){for(var V in T)this._addKeyBinding(V,T[V])},this);for(var $ in this._imperativeKeyBindings)this._addKeyBinding($,this._imperativeKeyBindings[$]);for(var C in this._keyBindings)this._keyBindings[C].sort(function(T,V){var K=T[0].hasModifiers,Y=V[0].hasModifiers;return K===Y?0:K?-1:1})},_addKeyBinding:function($,C){parseEventString($).forEach(function(T){this._keyBindings[T.event]=this._keyBindings[T.event]||[],this._keyBindings[T.event].push([T,C])},this)},_resetKeyEventListeners:function(){this._unlistenKeyEventListeners(),this.isAttached&&this._listenKeyEventListeners()},_listenKeyEventListeners:function(){this.keyEventTarget&&Object.keys(this._keyBindings).forEach(function($){var C=this._keyBindings[$],T=this._onKeyBindingEvent.bind(this,C);this._boundKeyHandlers.push([this.keyEventTarget,$,T]),this.keyEventTarget.addEventListener($,T)},this)},_unlistenKeyEventListeners:function(){for(var $,C,T,V;this._boundKeyHandlers.length;)$=this._boundKeyHandlers.pop(),C=$[0],T=$[1],V=$[2],C.removeEventListener(T,V)},_onKeyBindingEvent:function($,C){if(this.stopKeyboardEventPropagation&&C.stopPropagation(),!C.defaultPrevented)for(var T=0;T<$.length;T++){var V=$[T][0],K=$[T][1];if(keyComboMatchesEvent(V,C)&&(this._triggerKeyHandler(V,K,C),C.defaultPrevented))return}},_triggerKeyHandler:function($,C,T){var V=Object.create($);V.keyboardEvent=T;var K=new CustomEvent($.event,{detail:V,cancelable:!0});this[C].call(this,K),K.defaultPrevented&&T.preventDefault()}};/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const IronButtonStateImpl={properties:{pressed:{type:Boolean,readOnly:!0,value:!1,reflectToAttribute:!0,observer:"_pressedChanged"},toggles:{type:Boolean,value:!1,reflectToAttribute:!0},active:{type:Boolean,value:!1,notify:!0,reflectToAttribute:!0},pointerDown:{type:Boolean,readOnly:!0,value:!1},receivedFocusFromKeyboard:{type:Boolean,readOnly:!0},ariaActiveAttribute:{type:String,value:"aria-pressed",observer:"_ariaActiveAttributeChanged"}},listeners:{down:"_downHandler",up:"_upHandler",tap:"_tapHandler"},observers:["_focusChanged(focused)","_activeChanged(active, ariaActiveAttribute)"],keyBindings:{"enter:keydown":"_asyncClick","space:keydown":"_spaceKeyDownHandler","space:keyup":"_spaceKeyUpHandler"},_mouseEventRe:/^mouse/,_tapHandler:function(){this.toggles?this._userActivate(!this.active):this.active=!1},_focusChanged:function($){this._detectKeyboardFocus($),$||this._setPressed(!1)},_detectKeyboardFocus:function($){this._setReceivedFocusFromKeyboard(!this.pointerDown&&$)},_userActivate:function($){this.active!==$&&(this.active=$,this.fire("change"))},_downHandler:function($){this._setPointerDown(!0),this._setPressed(!0),this._setReceivedFocusFromKeyboard(!1)},_upHandler:function(){this._setPointerDown(!1),this._setPressed(!1)},_spaceKeyDownHandler:function($){var C=$.detail.keyboardEvent,T=dom(C).localTarget;this.isLightDescendant(T)||(C.preventDefault(),C.stopImmediatePropagation(),this._setPressed(!0))},_spaceKeyUpHandler:function($){var C=$.detail.keyboardEvent,T=dom(C).localTarget;this.isLightDescendant(T)||(this.pressed&&this._asyncClick(),this._setPressed(!1))},_asyncClick:function(){this.async(function(){this.click()},1)},_pressedChanged:function($){this._changedButtonState()},_ariaActiveAttributeChanged:function($,C){C&&C!=$&&this.hasAttribute(C)&&this.removeAttribute(C)},_activeChanged:function($,C){this.toggles?this.setAttribute(this.ariaActiveAttribute,$?"true":"false"):this.removeAttribute(this.ariaActiveAttribute),this._changedButtonState()},_controlStateChanged:function(){this.disabled?this._setPressed(!1):this._changedButtonState()},_changedButtonState:function(){this._buttonStateChanged&&this._buttonStateChanged()}},IronButtonState=[IronA11yKeysBehavior,IronButtonStateImpl];/**
@license
Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/var Utility={distance:function($,C,T,V){var K=$-T,Y=C-V;return Math.sqrt(K*K+Y*Y)},now:window.performance&&window.performance.now?window.performance.now.bind(window.performance):Date.now};function ElementMetrics($){this.element=$,this.width=this.boundingRect.width,this.height=this.boundingRect.height,this.size=Math.max(this.width,this.height)}ElementMetrics.prototype={get boundingRect(){return this.element.getBoundingClientRect()},furthestCornerDistanceFrom:function($,C){var T=Utility.distance($,C,0,0),V=Utility.distance($,C,this.width,0),K=Utility.distance($,C,0,this.height),Y=Utility.distance($,C,this.width,this.height);return Math.max(T,V,K,Y)}};function Ripple($){this.element=$,this.color=window.getComputedStyle($).color,this.wave=document.createElement("div"),this.waveContainer=document.createElement("div"),this.wave.style.backgroundColor=this.color,this.wave.classList.add("wave"),this.waveContainer.classList.add("wave-container"),dom(this.waveContainer).appendChild(this.wave),this.resetInteractionState()}Ripple.MAX_RADIUS=300;Ripple.prototype={get recenters(){return this.element.recenters},get center(){return this.element.center},get mouseDownElapsed(){var $;return this.mouseDownStart?($=Utility.now()-this.mouseDownStart,this.mouseUpStart&&($-=this.mouseUpElapsed),$):0},get mouseUpElapsed(){return this.mouseUpStart?Utility.now()-this.mouseUpStart:0},get mouseDownElapsedSeconds(){return this.mouseDownElapsed/1e3},get mouseUpElapsedSeconds(){return this.mouseUpElapsed/1e3},get mouseInteractionSeconds(){return this.mouseDownElapsedSeconds+this.mouseUpElapsedSeconds},get initialOpacity(){return this.element.initialOpacity},get opacityDecayVelocity(){return this.element.opacityDecayVelocity},get radius(){var $=this.containerMetrics.width*this.containerMetrics.width,C=this.containerMetrics.height*this.containerMetrics.height,T=Math.min(Math.sqrt($+C),Ripple.MAX_RADIUS)*1.1+5,V=1.1-.2*(T/Ripple.MAX_RADIUS),K=this.mouseInteractionSeconds/V,Y=T*(1-Math.pow(80,-K));return Math.abs(Y)},get opacity(){return this.mouseUpStart?Math.max(0,this.initialOpacity-this.mouseUpElapsedSeconds*this.opacityDecayVelocity):this.initialOpacity},get outerOpacity(){var $=this.mouseUpElapsedSeconds*.3,C=this.opacity;return Math.max(0,Math.min($,C))},get isOpacityFullyDecayed(){return this.opacity<.01&&this.radius>=Math.min(this.maxRadius,Ripple.MAX_RADIUS)},get isRestingAtMaxRadius(){return this.opacity>=this.initialOpacity&&this.radius>=Math.min(this.maxRadius,Ripple.MAX_RADIUS)},get isAnimationComplete(){return this.mouseUpStart?this.isOpacityFullyDecayed:this.isRestingAtMaxRadius},get translationFraction(){return Math.min(1,this.radius/this.containerMetrics.size*2/Math.sqrt(2))},get xNow(){return this.xEnd?this.xStart+this.translationFraction*(this.xEnd-this.xStart):this.xStart},get yNow(){return this.yEnd?this.yStart+this.translationFraction*(this.yEnd-this.yStart):this.yStart},get isMouseDown(){return this.mouseDownStart&&!this.mouseUpStart},resetInteractionState:function(){this.maxRadius=0,this.mouseDownStart=0,this.mouseUpStart=0,this.xStart=0,this.yStart=0,this.xEnd=0,this.yEnd=0,this.slideDistance=0,this.containerMetrics=new ElementMetrics(this.element)},draw:function(){var $,C,T;this.wave.style.opacity=this.opacity,$=this.radius/(this.containerMetrics.size/2),C=this.xNow-this.containerMetrics.width/2,T=this.yNow-this.containerMetrics.height/2,this.waveContainer.style.webkitTransform="translate("+C+"px, "+T+"px)",this.waveContainer.style.transform="translate3d("+C+"px, "+T+"px, 0)",this.wave.style.webkitTransform="scale("+$+","+$+")",this.wave.style.transform="scale3d("+$+","+$+",1)"},downAction:function($){var C=this.containerMetrics.width/2,T=this.containerMetrics.height/2;this.resetInteractionState(),this.mouseDownStart=Utility.now(),this.center?(this.xStart=C,this.yStart=T,this.slideDistance=Utility.distance(this.xStart,this.yStart,this.xEnd,this.yEnd)):(this.xStart=$?$.detail.x-this.containerMetrics.boundingRect.left:this.containerMetrics.width/2,this.yStart=$?$.detail.y-this.containerMetrics.boundingRect.top:this.containerMetrics.height/2),this.recenters&&(this.xEnd=C,this.yEnd=T,this.slideDistance=Utility.distance(this.xStart,this.yStart,this.xEnd,this.yEnd)),this.maxRadius=this.containerMetrics.furthestCornerDistanceFrom(this.xStart,this.yStart),this.waveContainer.style.top=(this.containerMetrics.height-this.containerMetrics.size)/2+"px",this.waveContainer.style.left=(this.containerMetrics.width-this.containerMetrics.size)/2+"px",this.waveContainer.style.width=this.containerMetrics.size+"px",this.waveContainer.style.height=this.containerMetrics.size+"px"},upAction:function($){this.isMouseDown&&(this.mouseUpStart=Utility.now())},remove:function(){dom(dom(this.waveContainer).parentNode).removeChild(this.waveContainer)}};Polymer({_template:html`
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
`,is:"paper-ripple",behaviors:[IronA11yKeysBehavior],properties:{initialOpacity:{type:Number,value:.25},opacityDecayVelocity:{type:Number,value:.8},recenters:{type:Boolean,value:!1},center:{type:Boolean,value:!1},ripples:{type:Array,value:function(){return[]}},animating:{type:Boolean,readOnly:!0,reflectToAttribute:!0,value:!1},holdDown:{type:Boolean,value:!1,observer:"_holdDownChanged"},noink:{type:Boolean,value:!1},_animating:{type:Boolean},_boundAnimate:{type:Function,value:function(){return this.animate.bind(this)}}},get target(){return this.keyEventTarget},keyBindings:{"enter:keydown":"_onEnterKeydown","space:keydown":"_onSpaceKeydown","space:keyup":"_onSpaceKeyup"},attached:function(){dom(this).parentNode.nodeType==11?this.keyEventTarget=dom(this).getOwnerRoot().host:this.keyEventTarget=dom(this).parentNode;var $=this.keyEventTarget;this.listen($,"up","uiUpAction"),this.listen($,"down","uiDownAction")},detached:function(){this.unlisten(this.keyEventTarget,"up","uiUpAction"),this.unlisten(this.keyEventTarget,"down","uiDownAction"),this.keyEventTarget=null},get shouldKeepAnimating(){for(var $=0;$<this.ripples.length;++$)if(!this.ripples[$].isAnimationComplete)return!0;return!1},simulatedRipple:function(){this.downAction(null),this.async(function(){this.upAction()},1)},uiDownAction:function($){this.noink||this.downAction($)},downAction:function($){if(!(this.holdDown&&this.ripples.length>0)){var C=this.addRipple();C.downAction($),this._animating||(this._animating=!0,this.animate())}},uiUpAction:function($){this.noink||this.upAction($)},upAction:function($){this.holdDown||(this.ripples.forEach(function(C){C.upAction($)}),this._animating=!0,this.animate())},onAnimationComplete:function(){this._animating=!1,this.$.background.style.backgroundColor="",this.fire("transitionend")},addRipple:function(){var $=new Ripple(this);return dom(this.$.waves).appendChild($.waveContainer),this.$.background.style.backgroundColor=$.color,this.ripples.push($),this._setAnimating(!0),$},removeRipple:function($){var C=this.ripples.indexOf($);C<0||(this.ripples.splice(C,1),$.remove(),this.ripples.length||this._setAnimating(!1))},animate:function(){if(this._animating){var $,C;for($=0;$<this.ripples.length;++$)C=this.ripples[$],C.draw(),this.$.background.style.opacity=C.outerOpacity,C.isOpacityFullyDecayed&&!C.isRestingAtMaxRadius&&this.removeRipple(C);!this.shouldKeepAnimating&&this.ripples.length===0?this.onAnimationComplete():window.requestAnimationFrame(this._boundAnimate)}},animateRipple:function(){return this.animate()},_onEnterKeydown:function(){this.uiDownAction(),this.async(this.uiUpAction,1)},_onSpaceKeydown:function(){this.uiDownAction()},_onSpaceKeyup:function(){this.uiUpAction()},_holdDownChanged:function($,C){C!==void 0&&($?this.downAction():this.upAction())}});/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const PaperRippleBehavior={properties:{noink:{type:Boolean,observer:"_noinkChanged"},_rippleContainer:{type:Object}},_buttonStateChanged:function(){this.focused&&this.ensureRipple()},_downHandler:function($){IronButtonStateImpl._downHandler.call(this,$),this.pressed&&this.ensureRipple($)},ensureRipple:function($){if(!this.hasRipple()){this._ripple=this._createRipple(),this._ripple.noink=this.noink;var C=this._rippleContainer||this.root;if(C&&dom(C).appendChild(this._ripple),$){var T=dom(this._rippleContainer||this),V=dom($).rootTarget;T.deepContains(V)&&this._ripple.uiDownAction($)}}},getRipple:function(){return this.ensureRipple(),this._ripple},hasRipple:function(){return Boolean(this._ripple)},_createRipple:function(){var $=document.createElement("paper-ripple");return $},_noinkChanged:function($){this.hasRipple()&&(this._ripple.noink=$)}};/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const PaperInkyFocusBehaviorImpl={observers:["_focusedChanged(receivedFocusFromKeyboard)"],_focusedChanged:function($){$&&this.ensureRipple(),this.hasRipple()&&(this._ripple.holdDown=$)},_createRipple:function(){var $=PaperRippleBehavior._createRipple();return $.id="ink",$.setAttribute("center",""),$.classList.add("circle"),$}},PaperInkyFocusBehavior=[IronButtonState,IronControlState,PaperRippleBehavior,PaperInkyFocusBehaviorImpl];/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const PaperCheckedElementBehaviorImpl={_checkedChanged:function(){IronCheckedElementBehaviorImpl._checkedChanged.call(this),this.hasRipple()&&(this.checked?this._ripple.setAttribute("checked",""):this._ripple.removeAttribute("checked"))},_buttonStateChanged:function(){PaperRippleBehavior._buttonStateChanged.call(this),!this.disabled&&this.isAttached&&(this.checked=this.active)}},PaperCheckedElementBehavior=[PaperInkyFocusBehavior,IronCheckedElementBehavior,PaperCheckedElementBehaviorImpl];/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const template$3=html`

    <style>
      :host {
        display: inline-block;
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --paper-font-common-base;
      }

      :host([disabled]) {
        pointer-events: none;
      }

      :host(:focus) {
        outline:none;
      }

      .toggle-bar {
        position: absolute;
        height: 100%;
        width: 100%;
        border-radius: 8px;
        pointer-events: none;
        opacity: 0.4;
        transition: background-color linear .08s;
        background-color: var(--paper-toggle-button-unchecked-bar-color, #000000);

        @apply --paper-toggle-button-unchecked-bar;
      }

      .toggle-button {
        position: absolute;
        top: -3px;
        left: 0;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.6);
        transition: -webkit-transform linear .08s, background-color linear .08s;
        transition: transform linear .08s, background-color linear .08s;
        will-change: transform;
        background-color: var(--paper-toggle-button-unchecked-button-color, var(--paper-grey-50));

        @apply --paper-toggle-button-unchecked-button;
      }

      .toggle-button.dragging {
        -webkit-transition: none;
        transition: none;
      }

      :host([checked]:not([disabled])) .toggle-bar {
        opacity: 0.5;
        background-color: var(--paper-toggle-button-checked-bar-color, var(--primary-color));

        @apply --paper-toggle-button-checked-bar;
      }

      :host([disabled]) .toggle-bar {
        background-color: #000;
        opacity: 0.12;
      }

      :host([checked]) .toggle-button {
        -webkit-transform: translate(16px, 0);
        transform: translate(16px, 0);
      }

      :host([checked]:not([disabled])) .toggle-button {
        background-color: var(--paper-toggle-button-checked-button-color, var(--primary-color));

        @apply --paper-toggle-button-checked-button;
      }

      :host([disabled]) .toggle-button {
        background-color: #bdbdbd;
        opacity: 1;
      }

      .toggle-ink {
        position: absolute;
        top: -14px;
        left: -14px;
        right: auto;
        bottom: auto;
        width: 48px;
        height: 48px;
        opacity: 0.5;
        pointer-events: none;
        color: var(--paper-toggle-button-unchecked-ink-color, var(--primary-text-color));

        @apply --paper-toggle-button-unchecked-ink;
      }

      :host([checked]) .toggle-ink {
        color: var(--paper-toggle-button-checked-ink-color, var(--primary-color));

        @apply --paper-toggle-button-checked-ink;
      }

      .toggle-container {
        display: inline-block;
        position: relative;
        width: 36px;
        height: 14px;
        /* The toggle button has an absolute position of -3px; The extra 1px
        /* accounts for the toggle button shadow box. */
        margin: 4px 1px;
      }

      .toggle-label {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        padding-left: var(--paper-toggle-button-label-spacing, 8px);
        pointer-events: none;
        color: var(--paper-toggle-button-label-color, var(--primary-text-color));
      }

      /* invalid state */
      :host([invalid]) .toggle-bar {
        background-color: var(--paper-toggle-button-invalid-bar-color, var(--error-color));
      }

      :host([invalid]) .toggle-button {
        background-color: var(--paper-toggle-button-invalid-button-color, var(--error-color));
      }

      :host([invalid]) .toggle-ink {
        color: var(--paper-toggle-button-invalid-ink-color, var(--error-color));
      }
    </style>

    <div class="toggle-container">
      <div id="toggleBar" class="toggle-bar"></div>
      <div id="toggleButton" class="toggle-button"></div>
    </div>

    <div class="toggle-label"><slot></slot></div>

  `;template$3.setAttribute("strip-whitespace","");Polymer({_template:template$3,is:"paper-toggle-button",behaviors:[PaperCheckedElementBehavior],hostAttributes:{role:"button","aria-pressed":"false",tabindex:0},properties:{},listeners:{track:"_ontrack"},attached:function(){afterNextRender(this,function(){setTouchAction(this,"pan-y")})},_ontrack:function($){var C=$.detail;C.state==="start"?this._trackStart(C):C.state==="track"?this._trackMove(C):C.state==="end"&&this._trackEnd(C)},_trackStart:function($){this._width=this.$.toggleBar.offsetWidth/2,this._trackChecked=this.checked,this.$.toggleButton.classList.add("dragging")},_trackMove:function($){var C=$.dx;this._x=Math.min(this._width,Math.max(0,this._trackChecked?this._width+C:C)),this.translate3d(this._x+"px",0,0,this.$.toggleButton),this._userActivate(this._x>this._width/2)},_trackEnd:function($){this.$.toggleButton.classList.remove("dragging"),this.transform("",this.$.toggleButton)},_createRipple:function(){this._rippleContainer=this.$.toggleButton;var $=PaperRippleBehavior._createRipple();return $.id="ink",$.setAttribute("recenters",""),$.classList.add("circle","toggle-ink"),$}});var __defProp$k=Object.defineProperty,__getOwnPropDesc$k=Object.getOwnPropertyDescriptor,__decorateClass$k=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$k(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$k(C,T,K),K};let FieldToggle=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="",this.name="",this.onChange=$=>{const C=$.target;this.onValueChanged({value:C.checked})},this.enabled=!0}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){this.placeholder=$}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}render(){return y$1`
            <div class="vaadin-field-container">
                <vaadin-horizontal-layout>
                    <h5 style="flex-grow: 1;">${this.label}</h5>
                    <paper-toggle-button id="mitoggle"
                                         ?disabled=${!this.enabled}
                                         ?checked=${this.value}
                                         @change=${this.onChange}></paper-toggle-button>
                </vaadin-horizontal-layout>
            </div>
            `}};__decorateClass$k([e()],FieldToggle.prototype,"required",2);__decorateClass$k([e()],FieldToggle.prototype,"label",2);__decorateClass$k([e()],FieldToggle.prototype,"placeholder",2);__decorateClass$k([e()],FieldToggle.prototype,"name",2);__decorateClass$k([e()],FieldToggle.prototype,"onChange",2);__decorateClass$k([e()],FieldToggle.prototype,"value",2);__decorateClass$k([e()],FieldToggle.prototype,"enabled",2);__decorateClass$k([e()],FieldToggle.prototype,"field",2);FieldToggle=__decorateClass$k([e$1("field-toggle")],FieldToggle);registerStyles("vaadin-progress-bar",i$2`
    :host {
      height: calc(var(--lumo-size-l) / 10);
      margin: var(--lumo-space-s) 0;
    }

    [part='bar'] {
      border-radius: var(--lumo-border-radius-m);
      background-color: var(--lumo-contrast-10pct);
    }

    [part='value'] {
      border-radius: var(--lumo-border-radius-m);
      background-color: var(--lumo-primary-color);
      /* Use width instead of transform to preserve border radius */
      transform: none;
      width: calc(var(--vaadin-progress-value) * 100%);
      will-change: width;
      transition: 0.1s width linear;
    }

    /* Indeterminate mode */
    :host([indeterminate]) [part='value'] {
      --lumo-progress-indeterminate-progress-bar-background: linear-gradient(
        to right,
        var(--lumo-primary-color-10pct) 10%,
        var(--lumo-primary-color)
      );
      --lumo-progress-indeterminate-progress-bar-background-reverse: linear-gradient(
        to left,
        var(--lumo-primary-color-10pct) 10%,
        var(--lumo-primary-color)
      );
      width: 100%;
      background-color: transparent !important;
      background-image: var(--lumo-progress-indeterminate-progress-bar-background);
      opacity: 0.75;
      will-change: transform;
      animation: vaadin-progress-indeterminate 1.6s infinite cubic-bezier(0.645, 0.045, 0.355, 1);
    }

    @keyframes vaadin-progress-indeterminate {
      0% {
        transform: scaleX(0.015);
        transform-origin: 0% 0%;
      }

      25% {
        transform: scaleX(0.4);
      }

      50% {
        transform: scaleX(0.015);
        transform-origin: 100% 0%;
        background-image: var(--lumo-progress-indeterminate-progress-bar-background);
      }

      50.1% {
        transform: scaleX(0.015);
        transform-origin: 100% 0%;
        background-image: var(--lumo-progress-indeterminate-progress-bar-background-reverse);
      }

      75% {
        transform: scaleX(0.4);
      }

      100% {
        transform: scaleX(0.015);
        transform-origin: 0% 0%;
        background-image: var(--lumo-progress-indeterminate-progress-bar-background-reverse);
      }
    }

    :host(:not([aria-valuenow])) [part='value']::before,
    :host([indeterminate]) [part='value']::before {
      content: '';
      display: block;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      background-color: var(--lumo-primary-color);
      will-change: opacity;
      animation: vaadin-progress-pulse3 1.6s infinite cubic-bezier(0.645, 0.045, 0.355, 1);
    }

    @keyframes vaadin-progress-pulse3 {
      0% {
        opacity: 1;
      }

      10% {
        opacity: 0;
      }

      40% {
        opacity: 0;
      }

      50% {
        opacity: 1;
      }

      50.1% {
        opacity: 1;
      }

      60% {
        opacity: 0;
      }

      90% {
        opacity: 0;
      }

      100% {
        opacity: 1;
      }
    }

    /* Contrast color */
    :host([theme~='contrast']) [part='value'],
    :host([theme~='contrast']) [part='value']::before {
      background-color: var(--lumo-contrast-80pct);
      --lumo-progress-indeterminate-progress-bar-background: linear-gradient(
        to right,
        var(--lumo-contrast-5pct) 10%,
        var(--lumo-contrast-80pct)
      );
      --lumo-progress-indeterminate-progress-bar-background-reverse: linear-gradient(
        to left,
        var(--lumo-contrast-5pct) 10%,
        var(--lumo-contrast-60pct)
      );
    }

    /* Error color */
    :host([theme~='error']) [part='value'],
    :host([theme~='error']) [part='value']::before {
      background-color: var(--lumo-error-color);
      --lumo-progress-indeterminate-progress-bar-background: linear-gradient(
        to right,
        var(--lumo-error-color-10pct) 10%,
        var(--lumo-error-color)
      );
      --lumo-progress-indeterminate-progress-bar-background-reverse: linear-gradient(
        to left,
        var(--lumo-error-color-10pct) 10%,
        var(--lumo-error-color)
      );
    }

    /* Primary color */
    :host([theme~='success']) [part='value'],
    :host([theme~='success']) [part='value']::before {
      background-color: var(--lumo-success-color);
      --lumo-progress-indeterminate-progress-bar-background: linear-gradient(
        to right,
        var(--lumo-success-color-10pct) 10%,
        var(--lumo-success-color)
      );
      --lumo-progress-indeterminate-progress-bar-background-reverse: linear-gradient(
        to left,
        var(--lumo-success-color-10pct) 10%,
        var(--lumo-success-color)
      );
    }

    /* RTL specific styles */
    :host([indeterminate][dir='rtl']) [part='value'] {
      --lumo-progress-indeterminate-progress-bar-background: linear-gradient(
        to left,
        var(--lumo-primary-color-10pct) 10%,
        var(--lumo-primary-color)
      );
      --lumo-progress-indeterminate-progress-bar-background-reverse: linear-gradient(
        to right,
        var(--lumo-primary-color-10pct) 10%,
        var(--lumo-primary-color)
      );
      animation: vaadin-progress-indeterminate-rtl 1.6s infinite cubic-bezier(0.355, 0.045, 0.645, 1);
    }

    :host(:not([aria-valuenow])[dir='rtl']) [part='value']::before,
    :host([indeterminate][dir='rtl']) [part='value']::before {
      animation: vaadin-progress-pulse3 1.6s infinite cubic-bezier(0.355, 0.045, 0.645, 1);
    }

    @keyframes vaadin-progress-indeterminate-rtl {
      0% {
        transform: scaleX(0.015);
        transform-origin: 100% 0%;
      }

      25% {
        transform: scaleX(0.4);
      }

      50% {
        transform: scaleX(0.015);
        transform-origin: 0% 0%;
        background-image: var(--lumo-progress-indeterminate-progress-bar-background);
      }

      50.1% {
        transform: scaleX(0.015);
        transform-origin: 0% 0%;
        background-image: var(--lumo-progress-indeterminate-progress-bar-background-reverse);
      }

      75% {
        transform: scaleX(0.4);
      }

      100% {
        transform: scaleX(0.015);
        transform-origin: 100% 0%;
        background-image: var(--lumo-progress-indeterminate-progress-bar-background-reverse);
      }
    }

    /* Contrast color */
    :host([theme~='contrast'][dir='rtl']) [part='value'],
    :host([theme~='contrast'][dir='rtl']) [part='value']::before {
      --lumo-progress-indeterminate-progress-bar-background: linear-gradient(
        to left,
        var(--lumo-contrast-5pct) 10%,
        var(--lumo-contrast-80pct)
      );
      --lumo-progress-indeterminate-progress-bar-background-reverse: linear-gradient(
        to right,
        var(--lumo-contrast-5pct) 10%,
        var(--lumo-contrast-60pct)
      );
    }

    /* Error color */
    :host([theme~='error'][dir='rtl']) [part='value'],
    :host([theme~='error'][dir='rtl']) [part='value']::before {
      --lumo-progress-indeterminate-progress-bar-background: linear-gradient(
        to left,
        var(--lumo-error-color-10pct) 10%,
        var(--lumo-error-color)
      );
      --lumo-progress-indeterminate-progress-bar-background-reverse: linear-gradient(
        to right,
        var(--lumo-error-color-10pct) 10%,
        var(--lumo-error-color)
      );
    }

    /* Primary color */
    :host([theme~='success'][dir='rtl']) [part='value'],
    :host([theme~='success'][dir='rtl']) [part='value']::before {
      --lumo-progress-indeterminate-progress-bar-background: linear-gradient(
        to left,
        var(--lumo-success-color-10pct) 10%,
        var(--lumo-success-color)
      );
      --lumo-progress-indeterminate-progress-bar-background-reverse: linear-gradient(
        to right,
        var(--lumo-success-color-10pct) 10%,
        var(--lumo-success-color)
      );
    }
  `,{moduleId:"lumo-progress-bar"});const template$2=document.createElement("template");template$2.innerHTML=`
  <style>
    @keyframes vaadin-progress-pulse3 {
      0% { opacity: 1; }
      10% { opacity: 0; }
      40% { opacity: 0; }
      50% { opacity: 1; }
      50.1% { opacity: 1; }
      60% { opacity: 0; }
      90% { opacity: 0; }
      100% { opacity: 1; }
    }
  </style>
`;document.head.appendChild(template$2.content);/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ProgressMixin=$=>class extends ${static get properties(){return{value:{type:Number,observer:"_valueChanged"},min:{type:Number,value:0,observer:"_minChanged"},max:{type:Number,value:1,observer:"_maxChanged"},indeterminate:{type:Boolean,value:!1,reflectToAttribute:!0}}}static get observers(){return["_normalizedValueChanged(value, min, max)"]}ready(){super.ready(),this.setAttribute("role","progressbar")}_normalizedValueChanged(T,V,K){const Y=this._normalizeValue(T,V,K);this.style.setProperty("--vaadin-progress-value",Y)}_valueChanged(T){this.setAttribute("aria-valuenow",T)}_minChanged(T){this.setAttribute("aria-valuemin",T)}_maxChanged(T){this.setAttribute("aria-valuemax",T)}_normalizeValue(T,V,K){let Y;return!T&&T!==0?Y=0:V>=K?Y=1:(Y=(T-V)/(K-V),Y=Math.min(Math.max(Y,0),1)),Y}};/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class ProgressBar extends ElementMixin(ThemableMixin(ProgressMixin(PolymerElement))){static get template(){return html`
      <style>
        :host {
          display: block;
          width: 100%; /* prevent collapsing inside non-stretching column flex */
          height: 8px;
        }

        :host([hidden]) {
          display: none !important;
        }

        [part='bar'] {
          height: 100%;
        }

        [part='value'] {
          height: 100%;
          transform-origin: 0 50%;
          transform: scaleX(var(--vaadin-progress-value));
        }

        /* RTL specific styles */

        :host([dir='rtl']) [part='value'] {
          transform-origin: 100% 50%;
        }
      </style>

      <div part="bar">
        <div part="value"></div>
      </div>
    `}static get is(){return"vaadin-progress-bar"}}customElements.define(ProgressBar.is,ProgressBar);registerStyles("vaadin-upload",i$2`
    :host {
      line-height: var(--lumo-line-height-m);
    }

    :host(:not([nodrop])) {
      overflow: hidden;
      border: 1px dashed var(--lumo-contrast-20pct);
      border-radius: var(--lumo-border-radius-l);
      padding: var(--lumo-space-m);
      transition: background-color 0.6s, border-color 0.6s;
    }

    [part='primary-buttons'] > * {
      display: inline-block;
      white-space: nowrap;
    }

    [part='drop-label'] {
      display: inline-block;
      white-space: normal;
      padding: 0 var(--lumo-space-s);
      color: var(--lumo-secondary-text-color);
      font-family: var(--lumo-font-family);
    }

    :host([dragover-valid]) {
      border-color: var(--lumo-primary-color-50pct);
      background: var(--lumo-primary-color-10pct);
      transition: background-color 0.1s, border-color 0.1s;
    }

    :host([dragover-valid]) [part='drop-label'] {
      color: var(--lumo-primary-text-color);
    }

    :host([max-files-reached]) [part='drop-label'] {
      color: var(--lumo-disabled-text-color);
    }

    [part='drop-label-icon'] {
      display: inline-block;
    }

    [part='drop-label-icon']::before {
      content: var(--lumo-icons-upload);
      font-family: lumo-icons;
      font-size: var(--lumo-icon-size-m);
      line-height: 1;
      vertical-align: -0.25em;
    }

    [part='file-list'] > *:not(:first-child) > * {
      border-top: 1px solid var(--lumo-contrast-10pct);
    }
  `,{moduleId:"lumo-upload"});const uploadFile=i$2`
  :host {
    padding: var(--lumo-space-s) 0;
    outline: none;
  }

  :host([focus-ring]) [part='row'] {
    border-radius: var(--lumo-border-radius-s);
    box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
  }

  [part='row'] {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  [part='status'],
  [part='error'] {
    color: var(--lumo-secondary-text-color);
    font-size: var(--lumo-font-size-s);
  }

  [part='info'] {
    display: flex;
    align-items: baseline;
    flex: auto;
  }

  [part='meta'] {
    width: 0.001px;
    flex: 1 1 auto;
  }

  [part='name'] {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  [part='commands'] {
    display: flex;
    align-items: baseline;
    flex: none;
  }

  [part$='icon'] {
    margin-right: var(--lumo-space-xs);
    font-size: var(--lumo-icon-size-m);
    font-family: 'lumo-icons';
    line-height: 1;
  }

  /* When both icons are hidden, let us keep space for one */
  [part='done-icon'][hidden] + [part='warning-icon'][hidden] {
    display: block !important;
    visibility: hidden;
  }

  [part$='button'] {
    flex: none;
    margin-left: var(--lumo-space-xs);
    cursor: var(--lumo-clickable-cursor);
  }

  [part$='button']:focus {
    outline: none;
    border-radius: var(--lumo-border-radius-s);
    box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
  }

  [part$='icon']::before,
  [part$='button']::before {
    vertical-align: -0.25em;
  }

  [part='done-icon']::before {
    content: var(--lumo-icons-checkmark);
    color: var(--lumo-primary-text-color);
  }

  [part='warning-icon']::before {
    content: var(--lumo-icons-error);
    color: var(--lumo-error-text-color);
  }

  [part='start-button']::before {
    content: var(--lumo-icons-play);
  }

  [part='retry-button']::before {
    content: var(--lumo-icons-reload);
  }

  [part='remove-button']::before {
    content: var(--lumo-icons-cross);
  }

  [part='error'] {
    color: var(--lumo-error-text-color);
  }

  [part='progress'] {
    width: auto;
    margin-left: calc(var(--lumo-icon-size-m) + var(--lumo-space-xs));
    margin-right: calc(var(--lumo-icon-size-m) + var(--lumo-space-xs));
  }

  [part='progress'][complete],
  [part='progress'][error] {
    display: none;
  }
`;registerStyles("vaadin-upload-file",[fieldButton,uploadFile],{moduleId:"lumo-upload-file"});/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const template$1=document.createElement("template");template$1.innerHTML=`
  <style>
    @font-face {
      font-family: 'vaadin-upload-icons';
      src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAasAAsAAAAABmAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABPUy8yAAABCAAAAGAAAABgDxIF5mNtYXAAAAFoAAAAVAAAAFQXVtKMZ2FzcAAAAbwAAAAIAAAACAAAABBnbHlmAAABxAAAAfQAAAH0bBJxYWhlYWQAAAO4AAAANgAAADYPD267aGhlYQAAA/AAAAAkAAAAJAfCA8tobXR4AAAEFAAAACgAAAAoHgAAx2xvY2EAAAQ8AAAAFgAAABYCSgHsbWF4cAAABFQAAAAgAAAAIAAOADVuYW1lAAAEdAAAAhYAAAIWmmcHf3Bvc3QAAAaMAAAAIAAAACAAAwAAAAMDtwGQAAUAAAKZAswAAACPApkCzAAAAesAMwEJAAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAQAAA6QUDwP/AAEADwABAAAAAAQAAAAAAAAAAAAAAIAAAAAAAAwAAAAMAAAAcAAEAAwAAABwAAwABAAAAHAAEADgAAAAKAAgAAgACAAEAIOkF//3//wAAAAAAIOkA//3//wAB/+MXBAADAAEAAAAAAAAAAAAAAAEAAf//AA8AAQAAAAAAAAAAAAIAADc5AQAAAAABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAgAA/8AEAAPAABkAMgAAEz4DMzIeAhczLgMjIg4CBycRIScFIRcOAyMiLgInIx4DMzI+AjcXphZGWmo6SH9kQwyADFiGrmJIhXJbIEYBAFoDWv76YBZGXGw8Rn5lRQyADFmIrWBIhHReIkYCWjJVPSIyVnVDXqN5RiVEYTxG/wBa2loyVT0iMlZ1Q16jeUYnRWE5RgAAAAABAIAAAAOAA4AAAgAAExEBgAMAA4D8gAHAAAAAAwAAAAAEAAOAAAIADgASAAAJASElIiY1NDYzMhYVFAYnETMRAgD+AAQA/gAdIyMdHSMjXYADgPyAgCMdHSMjHR0jwAEA/wAAAQANADMD5gNaAAUAACUBNwUBFwHT/jptATMBppMzAU2a4AIgdAAAAAEAOv/6A8YDhgALAAABJwkBBwkBFwkBNwEDxoz+xv7GjAFA/sCMAToBOoz+wAL6jP7AAUCM/sb+xowBQP7AjAE6AAAAAwAA/8AEAAPAAAcACwASAAABFSE1IREhEQEjNTMJAjMRIRECwP6A/sAEAP0AgIACQP7A/sDAAQABQICA/oABgP8AgAHAAUD+wP6AAYAAAAABAAAAAQAAdhiEdV8PPPUACwQAAAAAANX4FR8AAAAA1fgVHwAA/8AEAAPAAAAACAACAAAAAAAAAAEAAAPA/8AAAAQAAAAAAAQAAAEAAAAAAAAAAAAAAAAAAAAKBAAAAAAAAAAAAAAAAgAAAAQAAAAEAACABAAAAAQAAA0EAAA6BAAAAAAAAAAACgAUAB4AagB4AJwAsADSAPoAAAABAAAACgAzAAMAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAADgCuAAEAAAAAAAEAEwAAAAEAAAAAAAIABwDMAAEAAAAAAAMAEwBaAAEAAAAAAAQAEwDhAAEAAAAAAAUACwA5AAEAAAAAAAYAEwCTAAEAAAAAAAoAGgEaAAMAAQQJAAEAJgATAAMAAQQJAAIADgDTAAMAAQQJAAMAJgBtAAMAAQQJAAQAJgD0AAMAAQQJAAUAFgBEAAMAAQQJAAYAJgCmAAMAAQQJAAoANAE0dmFhZGluLXVwbG9hZC1pY29ucwB2AGEAYQBkAGkAbgAtAHUAcABsAG8AYQBkAC0AaQBjAG8AbgBzVmVyc2lvbiAxLjAAVgBlAHIAcwBpAG8AbgAgADEALgAwdmFhZGluLXVwbG9hZC1pY29ucwB2AGEAYQBkAGkAbgAtAHUAcABsAG8AYQBkAC0AaQBjAG8AbgBzdmFhZGluLXVwbG9hZC1pY29ucwB2AGEAYQBkAGkAbgAtAHUAcABsAG8AYQBkAC0AaQBjAG8AbgBzUmVndWxhcgBSAGUAZwB1AGwAYQBydmFhZGluLXVwbG9hZC1pY29ucwB2AGEAYQBkAGkAbgAtAHUAcABsAG8AYQBkAC0AaQBjAG8AbgBzRm9udCBnZW5lcmF0ZWQgYnkgSWNvTW9vbi4ARgBvAG4AdAAgAGcAZQBuAGUAcgBhAHQAZQBkACAAYgB5ACAASQBjAG8ATQBvAG8AbgAuAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format('woff');
      font-weight: normal;
      font-style: normal;
    }
  </style>
`;document.head.appendChild(template$1.content);/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class UploadFile extends FocusMixin(ThemableMixin(PolymerElement)){static get template(){return html`
      <style>
        :host {
          display: block;
        }

        [hidden] {
          display: none;
        }

        [part='row'] {
          list-style-type: none;
        }

        button {
          background: transparent;
          padding: 0;
          border: none;
          box-shadow: none;
        }
      </style>

      <div part="row">
        <div part="info">
          <div part="done-icon" hidden$="[[!file.complete]]" aria-hidden="true"></div>
          <div part="warning-icon" hidden$="[[!file.error]]" aria-hidden="true"></div>

          <div part="meta">
            <div part="name" id="name">[[file.name]]</div>
            <div part="status" hidden$="[[!file.status]]" id="status">[[file.status]]</div>
            <div part="error" id="error" hidden$="[[!file.error]]">[[file.error]]</div>
          </div>
        </div>
        <div part="commands">
          <button
            type="button"
            part="start-button"
            file-event="file-start"
            on-click="_fireFileEvent"
            hidden$="[[!file.held]]"
            aria-label$="[[i18n.file.start]]"
            aria-describedby="name"
          ></button>
          <button
            type="button"
            part="retry-button"
            file-event="file-retry"
            on-click="_fireFileEvent"
            hidden$="[[!file.error]]"
            aria-label$="[[i18n.file.retry]]"
            aria-describedby="name"
          ></button>
          <button
            type="button"
            part="remove-button"
            file-event="file-abort"
            on-click="_fireFileEvent"
            aria-label$="[[i18n.file.remove]]"
            aria-describedby="name"
          ></button>
        </div>
      </div>

      <vaadin-progress-bar
        part="progress"
        id="progress"
        value$="[[_formatProgressValue(file.progress)]]"
        error$="[[file.error]]"
        indeterminate$="[[file.indeterminate]]"
        uploading$="[[file.uploading]]"
        complete$="[[file.complete]]"
      ></vaadin-progress-bar>
    `}static get is(){return"vaadin-upload-file"}static get properties(){return{file:Object,i18n:Object,tabindex:{type:Number,value:0,reflectToAttribute:!0}}}static get observers(){return["_fileAborted(file.abort)",'_toggleHostAttribute(file.error, "error")','_toggleHostAttribute(file.indeterminate, "indeterminate")','_toggleHostAttribute(file.uploading, "uploading")','_toggleHostAttribute(file.complete, "complete")']}ready(){super.ready(),this.shadowRoot.addEventListener("focusin",C=>{C.composedPath()[0].getAttribute("part").endsWith("button")&&this._setFocused(!1)}),this.shadowRoot.addEventListener("focusout",C=>{C.relatedTarget===this&&this._setFocused(!0)})}_shouldSetFocus(C){return C.composedPath()[0]===this}_fileAborted(C){C&&this._remove()}_remove(){this.dispatchEvent(new CustomEvent("file-remove",{detail:{file:this.file},bubbles:!0,composed:!0}))}_formatProgressValue(C){return C/100}_fireFileEvent(C){return C.preventDefault(),this.dispatchEvent(new CustomEvent(C.target.getAttribute("file-event"),{detail:{file:this.file},bubbles:!0,composed:!0}))}_toggleHostAttribute(C,T){const V=Boolean(C);this.hasAttribute(T)!==V&&(V?this.setAttribute(T,""):this.removeAttribute(T))}}customElements.define(UploadFile.is,UploadFile);/**
 * @license
 * Copyright (c) 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const region=document.createElement("div");region.style.position="fixed";region.style.clip="rect(0px, 0px, 0px, 0px)";region.setAttribute("aria-live","polite");document.body.appendChild(region);let alertDebouncer;function announce($,C={}){const T=C.mode||"polite",V=C.timeout===void 0?150:C.timeout;T==="alert"?(region.removeAttribute("aria-live"),region.removeAttribute("role"),alertDebouncer=Debouncer$1.debounce(alertDebouncer,animationFrame,()=>{region.setAttribute("role","alert")})):(alertDebouncer&&alertDebouncer.cancel(),region.removeAttribute("role"),region.setAttribute("aria-live",T)),region.textContent="",setTimeout(()=>{region.textContent=$},V)}/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Upload extends ElementMixin(ThemableMixin(PolymerElement)){static get template(){return html`
      <style>
        :host {
          display: block;
          position: relative;
          box-sizing: border-box;
        }

        :host([hidden]) {
          display: none !important;
        }

        [hidden] {
          display: none !important;
        }

        [part='file-list'] {
          padding: 0;
          margin: 0;
          list-style-type: none;
        }
      </style>

      <div part="primary-buttons">
        <div id="addFiles" on-touchend="_onAddFilesTouchEnd" on-click="_onAddFilesClick">
          <slot name="add-button">
            <vaadin-button part="upload-button" id="addButton" disabled="[[maxFilesReached]]">
              [[_i18nPlural(maxFiles, i18n.addFiles, i18n.addFiles.*)]]
            </vaadin-button>
          </slot>
        </div>
        <div part="drop-label" hidden$="[[nodrop]]" id="dropLabelContainer" aria-hidden="true">
          <slot name="drop-label-icon">
            <div part="drop-label-icon"></div>
          </slot>
          <slot name="drop-label" id="dropLabel"> [[_i18nPlural(maxFiles, i18n.dropFiles, i18n.dropFiles.*)]]</slot>
        </div>
      </div>
      <slot name="file-list">
        <ul id="fileList" part="file-list">
          <template is="dom-repeat" items="[[files]]" as="file">
            <li>
              <vaadin-upload-file file="[[file]]" i18n="[[i18n]]"></vaadin-upload-file>
            </li>
          </template>
        </ul>
      </slot>
      <slot></slot>
      <input
        type="file"
        id="fileInput"
        hidden
        on-change="_onFileInputChange"
        accept$="{{accept}}"
        multiple$="[[_isMultiple(maxFiles)]]"
        capture$="[[capture]]"
      />
    `}static get is(){return"vaadin-upload"}static get properties(){return{nodrop:{type:Boolean,reflectToAttribute:!0,value:isTouch},target:{type:String,value:""},method:{type:String,value:"POST"},headers:{type:Object,value:{}},timeout:{type:Number,value:0},_dragover:{type:Boolean,value:!1,observer:"_dragoverChanged"},files:{type:Array,notify:!0,value:()=>[]},maxFiles:{type:Number,value:1/0},maxFilesReached:{type:Boolean,value:!1,notify:!0,readOnly:!0,reflectToAttribute:!0,computed:"_maxFilesAdded(maxFiles, files.length)"},accept:{type:String,value:""},maxFileSize:{type:Number,value:1/0},_dragoverValid:{type:Boolean,value:!1,observer:"_dragoverValidChanged"},formDataName:{type:String,value:"file"},noAuto:{type:Boolean,value:!1},withCredentials:{type:Boolean,value:!1},capture:String,i18n:{type:Object,value(){return{dropFiles:{one:"Drop file here",many:"Drop files here"},addFiles:{one:"Upload File...",many:"Upload Files..."},error:{tooManyFiles:"Too Many Files.",fileIsTooBig:"File is Too Big.",incorrectFileType:"Incorrect File Type."},uploading:{status:{connecting:"Connecting...",stalled:"Stalled",processing:"Processing File...",held:"Queued"},remainingTime:{prefix:"remaining time: ",unknown:"unknown remaining time"},error:{serverUnavailable:"Upload failed, please try again later",unexpectedServerError:"Upload failed due to server error",forbidden:"Upload forbidden"}},file:{retry:"Retry",start:"Start",remove:"Remove"},units:{size:["B","kB","MB","GB","TB","PB","EB","ZB","YB"]}}}}}}ready(){super.ready(),this.addEventListener("dragover",this._onDragover.bind(this)),this.addEventListener("dragleave",this._onDragleave.bind(this)),this.addEventListener("drop",this._onDrop.bind(this)),this.addEventListener("file-retry",this._onFileRetry.bind(this)),this.addEventListener("file-abort",this._onFileAbort.bind(this)),this.addEventListener("file-remove",this._onFileRemove.bind(this)),this.addEventListener("file-start",this._onFileStart.bind(this)),this.addEventListener("file-reject",this._onFileReject.bind(this)),this.addEventListener("upload-start",this._onUploadStart.bind(this)),this.addEventListener("upload-success",this._onUploadSuccess.bind(this)),this.addEventListener("upload-error",this._onUploadError.bind(this))}_formatSize(C){if(typeof this.i18n.formatSize=="function")return this.i18n.formatSize(C);const T=this.i18n.units.sizeBase||1e3,V=~~(Math.log(C)/Math.log(T)),K=Math.max(0,Math.min(3,V-1));return`${parseFloat((C/T**V).toFixed(K))} ${this.i18n.units.size[V]}`}_splitTimeByUnits(C){const T=[60,60,24,1/0],V=[0];for(let K=0;K<T.length&&C>0;K++)V[K]=C%T[K],C=Math.floor(C/T[K]);return V}_formatTime(C,T){if(typeof this.i18n.formatTime=="function")return this.i18n.formatTime(C,T);for(;T.length<3;)T.push(0);return T.reverse().map(V=>(V<10?"0":"")+V).join(":")}_formatFileProgress(C){const T=C.loaded>0?this.i18n.uploading.remainingTime.prefix+C.remainingStr:this.i18n.uploading.remainingTime.unknown;return`${C.totalStr}: ${C.progress}% (${T})`}_maxFilesAdded(C,T){return C>=0&&T>=C}_onDragover(C){C.preventDefault(),!this.nodrop&&!this._dragover&&(this._dragoverValid=!this.maxFilesReached,this._dragover=!0),C.dataTransfer.dropEffect=!this._dragoverValid||this.nodrop?"none":"copy"}_onDragleave(C){C.preventDefault(),this._dragover&&!this.nodrop&&(this._dragover=this._dragoverValid=!1)}_onDrop(C){this.nodrop||(C.preventDefault(),this._dragover=this._dragoverValid=!1,this._addFiles(C.dataTransfer.files))}_createXhr(){return new XMLHttpRequest}_configureXhr(C){if(typeof this.headers=="string")try{this.headers=JSON.parse(this.headers)}catch{this.headers=void 0}Object.entries(this.headers).forEach(([T,V])=>{C.setRequestHeader(T,V)}),this.timeout&&(C.timeout=this.timeout),C.withCredentials=this.withCredentials}_setStatus(C,T,V,K){C.elapsed=K,C.elapsedStr=this._formatTime(C.elapsed,this._splitTimeByUnits(C.elapsed)),C.remaining=Math.ceil(K*(T/V-1)),C.remainingStr=this._formatTime(C.remaining,this._splitTimeByUnits(C.remaining)),C.speed=~~(T/K/1024),C.totalStr=this._formatSize(T),C.loadedStr=this._formatSize(V),C.status=this._formatFileProgress(C)}uploadFiles(C){C&&!Array.isArray(C)&&(C=[C]),C=C||this.files,C=C.filter(T=>!T.complete),Array.prototype.forEach.call(C,this._uploadFile.bind(this))}_uploadFile(C){if(C.uploading)return;const T=Date.now(),V=C.xhr=this._createXhr();let K,Y;V.upload.onprogress=ie=>{clearTimeout(K),Y=Date.now();const re=(Y-T)/1e3,se=ie.loaded,oe=ie.total,ae=~~(se/oe*100);C.loaded=se,C.progress=ae,C.indeterminate=se<=0||se>=oe,C.error?C.indeterminate=C.status=void 0:C.abort||(ae<100?(this._setStatus(C,oe,se,re),K=setTimeout(()=>{C.status=this.i18n.uploading.status.stalled,this._notifyFileChanges(C)},2e3)):(C.loadedStr=C.totalStr,C.status=this.i18n.uploading.status.processing)),this._notifyFileChanges(C),this.dispatchEvent(new CustomEvent("upload-progress",{detail:{file:C,xhr:V}}))},V.onreadystatechange=()=>{if(V.readyState===4){if(clearTimeout(K),C.indeterminate=C.uploading=!1,C.abort){this._notifyFileChanges(C);return}if(C.status="",!this.dispatchEvent(new CustomEvent("upload-response",{detail:{file:C,xhr:V},cancelable:!0})))return;V.status===0?C.error=this.i18n.uploading.error.serverUnavailable:V.status>=500?C.error=this.i18n.uploading.error.unexpectedServerError:V.status>=400&&(C.error=this.i18n.uploading.error.forbidden),C.complete=!C.error,this.dispatchEvent(new CustomEvent(`upload-${C.error?"error":"success"}`,{detail:{file:C,xhr:V}})),this._notifyFileChanges(C)}};const J=new FormData;if(C.uploadTarget=C.uploadTarget||this.target||"",C.formDataName=this.formDataName,!this.dispatchEvent(new CustomEvent("upload-before",{detail:{file:C,xhr:V},cancelable:!0})))return;J.append(C.formDataName,C,C.name),V.open(this.method,C.uploadTarget,!0),this._configureXhr(V),C.status=this.i18n.uploading.status.connecting,C.uploading=C.indeterminate=!0,C.complete=C.abort=C.error=C.held=!1,V.upload.onloadstart=()=>{this.dispatchEvent(new CustomEvent("upload-start",{detail:{file:C,xhr:V}})),this._notifyFileChanges(C)},this.dispatchEvent(new CustomEvent("upload-request",{detail:{file:C,xhr:V,formData:J},cancelable:!0}))&&V.send(J)}_retryFileUpload(C){this.dispatchEvent(new CustomEvent("upload-retry",{detail:{file:C,xhr:C.xhr},cancelable:!0}))&&this._uploadFile(C)}_abortFileUpload(C){this.dispatchEvent(new CustomEvent("upload-abort",{detail:{file:C,xhr:C.xhr},cancelable:!0}))&&(C.abort=!0,C.xhr&&C.xhr.abort(),this._notifyFileChanges(C))}_notifyFileChanges(C){const T=`files.${this.files.indexOf(C)}.`;Object.keys(C).forEach(V=>{this.notifyPath(T+V,C[V])})}_addFiles(C){Array.prototype.forEach.call(C,this._addFile.bind(this))}_addFile(C){if(this.maxFilesReached){this.dispatchEvent(new CustomEvent("file-reject",{detail:{file:C,error:this.i18n.error.tooManyFiles}}));return}if(this.maxFileSize>=0&&C.size>this.maxFileSize){this.dispatchEvent(new CustomEvent("file-reject",{detail:{file:C,error:this.i18n.error.fileIsTooBig}}));return}const T=C.name.match(/\.[^.]*$|$/)[0],V=this.accept.replace(/[+.]/g,"\\$&"),K=new RegExp(`^(${V.replace(/[, ]+/g,"|").replace(/\/\*/g,"/.*")})$`,"i");if(this.accept&&!(K.test(C.type)||K.test(T))){this.dispatchEvent(new CustomEvent("file-reject",{detail:{file:C,error:this.i18n.error.incorrectFileType}}));return}C.loaded=0,C.held=!0,C.status=this.i18n.uploading.status.held,this.files=[C,...this.files],this.noAuto||this._uploadFile(C)}_removeFile(C){this.files.indexOf(C)>-1&&(this.files=this.files.filter(T=>T!==C))}_onAddFilesTouchEnd(C){C.preventDefault(),this._onAddFilesClick(C)}_onAddFilesClick(C){this.maxFilesReached||(C.stopPropagation(),this.$.fileInput.value="",this.$.fileInput.click())}_onFileInputChange(C){this._addFiles(C.target.files)}_onFileStart(C){this._uploadFile(C.detail.file)}_onFileRetry(C){this._retryFileUpload(C.detail.file)}_onFileAbort(C){this._abortFileUpload(C.detail.file)}_onFileRemove(C){this._removeFile(C.detail.file)}_onFileReject(C){announce(`${C.detail.file.name}: ${C.detail.file.error}`,{mode:"alert"})}_onUploadStart(C){announce(`${C.detail.file.name}: 0%`,{mode:"alert"})}_onUploadSuccess(C){announce(`${C.detail.file.name}: 100%`,{mode:"alert"})}_onUploadError(C){announce(`${C.detail.file.name}: ${C.detail.file.error}`,{mode:"alert"})}_dragoverChanged(C){C?this.setAttribute("dragover",C):this.removeAttribute("dragover")}_dragoverValidChanged(C){C?this.setAttribute("dragover-valid",C):this.removeAttribute("dragover-valid")}_i18nPlural(C,T){return C===1?T.one:T.many}_isMultiple(C){return C!==1}}customElements.define(Upload.is,Upload);/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */console.warn('WARNING: Since Vaadin 23.2, "@vaadin/vaadin-upload" is deprecated. Use "@vaadin/upload" instead.');let nanoid=($=21)=>crypto.getRandomValues(new Uint8Array($)).reduce((C,T)=>(T&=63,T<36?C+=T.toString(36):T<62?C+=(T-26).toString(36).toUpperCase():T>62?C+="-":C+="_",C),"");var __defProp$j=Object.defineProperty,__getOwnPropDesc$j=Object.getOwnPropertyDescriptor,__decorateClass$j=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$j(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$j(C,T,K),K};let FieldFile=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="",this.name="",this.onChange=$=>{const C=$.target;$.detail.value==100&&(console.log("upload complete",$,C.files),this.onValueChanged({value:C.files.map(T=>({targetUrl:T.uploadTarget,id:this.fileid,name:T.name,type:T.type}))}))},this.enabled=!0}setRequired($){this.required=$}setField($){var C,T;this.field=$,this.fileidprefix=(C=$.attributes.find(V=>V.key=="fileidprefix"))==null?void 0:C.value,this.fileid=nanoid(),this.maxfiles=(T=$.attributes.find(V=>V.key=="maxfiles"))==null?void 0:T.value}setLabel($){this.label=$}setPlaceholder($){this.placeholder=$}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}render(){return y$1`
            <vaadin-upload
                label="${this.label}"
                .maxFiles="${this.maxfiles}"
                @files-changed=${this.onChange}
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                ?required=${this.required}
                placeholder="${this.placeholder}"
                    target="${window.__MATEU_REMOTE_BASE_URL__+"/files/"+this.fileidprefix+this.fileid}"></vaadin-upload>
            `}};FieldFile.styles=i$2`
        vaadin-text-field {
            width: 100%;
        }
    `;__decorateClass$j([e()],FieldFile.prototype,"required",2);__decorateClass$j([e()],FieldFile.prototype,"label",2);__decorateClass$j([e()],FieldFile.prototype,"placeholder",2);__decorateClass$j([e()],FieldFile.prototype,"name",2);__decorateClass$j([e()],FieldFile.prototype,"onChange",2);__decorateClass$j([e()],FieldFile.prototype,"value",2);__decorateClass$j([e()],FieldFile.prototype,"enabled",2);__decorateClass$j([e()],FieldFile.prototype,"field",2);__decorateClass$j([e()],FieldFile.prototype,"maxfiles",2);__decorateClass$j([e()],FieldFile.prototype,"fileidprefix",2);__decorateClass$j([e()],FieldFile.prototype,"fileid",2);FieldFile=__decorateClass$j([e$1("field-file")],FieldFile);var __defProp$i=Object.defineProperty,__getOwnPropDesc$i=Object.getOwnPropertyDescriptor,__decorateClass$i=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$i(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$i(C,T,K),K};let FieldBooleanArray=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="type 0011110001",this.name="",this.onChange=$=>{const C=$.target;this.onValueChanged({value:this.toArray(C.value)})},this.enabled=!0}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){$&&(this.placeholder=$)}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){const C=$;let T;if(C){T="";for(let V=0;V<C.length;V++)T+=C[V]?"1":"0"}this.value=T}toArray($){let C=[];if($)for(let T=0;T<$.length;T++)C[T]=$[T]=="1";return C}render(){return y$1`
            <vaadin-text-field
                label="${this.label}"
                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                ?required=${this.required}
                placeholder="${this.placeholder}"
            ></vaadin-text-field>
            `}};FieldBooleanArray.styles=i$2`
        vaadin-text-field {
            width: 100%;
        }
    `;__decorateClass$i([e()],FieldBooleanArray.prototype,"required",2);__decorateClass$i([e()],FieldBooleanArray.prototype,"label",2);__decorateClass$i([e()],FieldBooleanArray.prototype,"placeholder",2);__decorateClass$i([e()],FieldBooleanArray.prototype,"name",2);__decorateClass$i([e()],FieldBooleanArray.prototype,"onChange",2);__decorateClass$i([e()],FieldBooleanArray.prototype,"value",2);__decorateClass$i([e()],FieldBooleanArray.prototype,"enabled",2);__decorateClass$i([e()],FieldBooleanArray.prototype,"field",2);FieldBooleanArray=__decorateClass$i([e$1("field-boolean-array")],FieldBooleanArray);var __defProp$h=Object.defineProperty,__getOwnPropDesc$h=Object.getOwnPropertyDescriptor,__decorateClass$h=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$h(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$h(C,T,K),K};let FieldIntArray=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="type 1,2,3,4",this.name="",this.onChange=$=>{const C=$.target;this.onValueChanged({value:this.toArray(C.value)})},this.enabled=!0}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){$&&(this.placeholder=$)}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}toArray($){let C=[];if($){const T=$.split(",");for(let V=0;V<T.length;V++)C[V]=parseInt(T[V])}return C}render(){return y$1`
            <vaadin-text-field
                label="${this.label}"
                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                ?required=${this.required}
                placeholder="${this.placeholder}"
            ></vaadin-text-field>
            `}};FieldIntArray.styles=i$2`
        vaadin-text-field {
            width: 100%;
        }
    `;__decorateClass$h([e()],FieldIntArray.prototype,"required",2);__decorateClass$h([e()],FieldIntArray.prototype,"label",2);__decorateClass$h([e()],FieldIntArray.prototype,"placeholder",2);__decorateClass$h([e()],FieldIntArray.prototype,"name",2);__decorateClass$h([e()],FieldIntArray.prototype,"onChange",2);__decorateClass$h([e()],FieldIntArray.prototype,"value",2);__decorateClass$h([e()],FieldIntArray.prototype,"enabled",2);__decorateClass$h([e()],FieldIntArray.prototype,"field",2);FieldIntArray=__decorateClass$h([e$1("field-int-array")],FieldIntArray);var __defProp$g=Object.defineProperty,__getOwnPropDesc$g=Object.getOwnPropertyDescriptor,__decorateClass$g=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$g(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$g(C,T,K),K};let FieldDoubleArray=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="type 1.3,2.1,3.32",this.name="",this.onChange=$=>{const C=$.target;this.onValueChanged({value:this.toArray(C.value)})},this.enabled=!0}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){$&&(this.placeholder=$)}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}toArray($){let C=[];if($){const T=$.split(",");for(let V=0;V<T.length;V++)C[V]=parseFloat(T[V])}return C}render(){return y$1`
            <vaadin-text-field
                label="${this.label}"
                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                ?required=${this.required}
                placeholder="${this.placeholder}"
            ></vaadin-text-field>
            `}};FieldDoubleArray.styles=i$2`
        vaadin-text-field {
            width: 100%;
        }
    `;__decorateClass$g([e()],FieldDoubleArray.prototype,"required",2);__decorateClass$g([e()],FieldDoubleArray.prototype,"label",2);__decorateClass$g([e()],FieldDoubleArray.prototype,"placeholder",2);__decorateClass$g([e()],FieldDoubleArray.prototype,"name",2);__decorateClass$g([e()],FieldDoubleArray.prototype,"onChange",2);__decorateClass$g([e()],FieldDoubleArray.prototype,"value",2);__decorateClass$g([e()],FieldDoubleArray.prototype,"enabled",2);__decorateClass$g([e()],FieldDoubleArray.prototype,"field",2);FieldDoubleArray=__decorateClass$g([e$1("field-double-array")],FieldDoubleArray);var __defProp$f=Object.defineProperty,__getOwnPropDesc$f=Object.getOwnPropertyDescriptor,__decorateClass$f=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$f(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$f(C,T,K),K};let FieldStringArray=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="type Mateu,Antònia,Miguel",this.name="",this.onChange=$=>{const C=$.target;this.onValueChanged({value:this.toArray(C.value)})},this.enabled=!0}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){$&&(this.placeholder=$)}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}toArray($){let C=[];return $&&(C=$.split(",")),C}render(){return y$1`
            <vaadin-text-field
                label="${this.label}"
                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                ?required=${this.required}
                placeholder="${this.placeholder}"
            ></vaadin-text-field>
            `}};FieldStringArray.styles=i$2`
        vaadin-text-field {
            width: 100%;
        }
    `;__decorateClass$f([e()],FieldStringArray.prototype,"required",2);__decorateClass$f([e()],FieldStringArray.prototype,"label",2);__decorateClass$f([e()],FieldStringArray.prototype,"placeholder",2);__decorateClass$f([e()],FieldStringArray.prototype,"name",2);__decorateClass$f([e()],FieldStringArray.prototype,"onChange",2);__decorateClass$f([e()],FieldStringArray.prototype,"value",2);__decorateClass$f([e()],FieldStringArray.prototype,"enabled",2);__decorateClass$f([e()],FieldStringArray.prototype,"field",2);FieldStringArray=__decorateClass$f([e$1("field-string-array")],FieldStringArray);var __defProp$e=Object.defineProperty,__getOwnPropDesc$e=Object.getOwnPropertyDescriptor,__decorateClass$e=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$e(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$e(C,T,K),K};let FieldEnumArray=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="",this.name="",this.onChange=$=>{this.onValueChanged({value:$.detail.value})},this.enabled=!0}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){this.placeholder=$}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}render(){return y$1`
            <vaadin-checkbox-group label="${this.label}" theme="vertical"
                                @value-changed=${this.onChange} 
                                   .value="${this.value}"
                           name="${this.name}" 
                           id="${this.name}"
                   ?disabled=${!this.enabled}
                                ?required=${this.required}
            >
                ${this.field.attributes.filter($=>$.key=="choice").map($=>$.value).map($=>y$1`
                    <vaadin-checkbox value=${$.value} label=${$.key}></vaadin-checkbox>
                    `)}
            </vaadin-checkbox-group>
            `}};__decorateClass$e([e()],FieldEnumArray.prototype,"required",2);__decorateClass$e([e()],FieldEnumArray.prototype,"label",2);__decorateClass$e([e()],FieldEnumArray.prototype,"placeholder",2);__decorateClass$e([e()],FieldEnumArray.prototype,"name",2);__decorateClass$e([e()],FieldEnumArray.prototype,"onChange",2);__decorateClass$e([e()],FieldEnumArray.prototype,"value",2);__decorateClass$e([e()],FieldEnumArray.prototype,"enabled",2);__decorateClass$e([e()],FieldEnumArray.prototype,"field",2);FieldEnumArray=__decorateClass$e([e$1("field-enum-array")],FieldEnumArray);/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const chip=i$2`
  :host {
    font-size: var(--lumo-font-size-xxs);
    line-height: 1;
    padding: 0.3125em calc(0.5em + var(--lumo-border-radius-s) / 4);
    color: var(--lumo-body-text-color);
    border-radius: var(--lumo-border-radius-s);
    background-color: var(--lumo-contrast-20pct);
    cursor: var(--lumo-clickable-cursor);
  }

  :host([focused]) {
    background-color: var(--lumo-primary-color);
    color: var(--lumo-primary-contrast-color);
  }

  :host([focused]) [part='remove-button'] {
    color: inherit;
  }

  :host(:not([part~='overflow']):not([readonly]):not([disabled])) {
    padding-inline-end: 0;
  }

  :host([part~='overflow']) {
    position: relative;
    min-width: var(--lumo-size-xxs);
    margin-inline-start: var(--lumo-space-s);
  }

  :host([part~='overflow'])::before,
  :host([part~='overflow'])::after {
    position: absolute;
    content: '';
    width: 100%;
    height: 100%;
    border-left: calc(var(--lumo-space-s) / 4) solid;
    border-radius: var(--lumo-border-radius-s);
    border-color: var(--lumo-contrast-30pct);
  }

  :host([part~='overflow'])::before {
    left: calc(-1 * var(--lumo-space-s) / 2);
  }

  :host([part~='overflow'])::after {
    left: calc(-1 * var(--lumo-space-s));
  }

  :host([part~='overflow-two']) {
    margin-inline-start: calc(var(--lumo-space-s) / 2);
  }

  :host([part~='overflow-two'])::after {
    display: none;
  }

  :host([part~='overflow-one']) {
    margin-inline-start: 0;
  }

  :host([part~='overflow-one'])::before,
  :host([part~='overflow-one'])::after {
    display: none;
  }

  [part='label'] {
    font-weight: 500;
    line-height: 1.25;
  }

  [part='remove-button'] {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -0.3125em;
    margin-bottom: -0.3125em;
    margin-inline-start: auto;
    width: 1.25em;
    height: 1.25em;
    font-size: 1.5em;
    transition: none;
  }

  [part='remove-button']::before {
    content: var(--lumo-icons-cross);
  }

  :host([disabled]) [part='label'] {
    color: var(--lumo-disabled-text-color);
    -webkit-text-fill-color: var(--lumo-disabled-text-color);
    pointer-events: none;
  }
`;registerStyles("vaadin-multi-select-combo-box-chip",[fieldButton,chip],{moduleId:"lumo-multi-select-combo-box-chip"});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */registerStyles("vaadin-multi-select-combo-box-item",i$2`
    @media (any-hover: hover) {
      :host(:hover[readonly]) {
        background-color: transparent;
        cursor: default;
      }
    }
  `,{moduleId:"lumo-multi-select-combo-box-item"});const multiSelectComboBox$1=i$2`
  :host([has-value]) {
    padding-inline-start: 0;
  }

  :host([has-value]) ::slotted(input:placeholder-shown) {
    caret-color: var(--lumo-body-text-color) !important;
  }

  [part~='chip']:not(:last-of-type) {
    margin-inline-end: var(--lumo-space-xs);
  }

  [part~='overflow']:not([hidden]) + :not(:empty) {
    margin-inline-start: var(--lumo-space-xs);
  }

  [part='toggle-button']::before {
    content: var(--lumo-icons-dropdown);
  }

  :host([readonly][has-value]) [part='toggle-button'] {
    color: var(--lumo-contrast-60pct);
    cursor: var(--lumo-clickable-cursor);
  }
`;registerStyles("vaadin-multi-select-combo-box",[inputFieldShared$1,multiSelectComboBox$1],{moduleId:"lumo-multi-select-combo-box"});/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class MultiSelectComboBoxChip extends ThemableMixin(PolymerElement){static get is(){return"vaadin-multi-select-combo-box-chip"}static get properties(){return{disabled:{type:Boolean,reflectToAttribute:!0},readonly:{type:Boolean,reflectToAttribute:!0},label:{type:String},item:{type:Object}}}static get template(){return html`
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          align-self: center;
          white-space: nowrap;
          box-sizing: border-box;
        }

        [part='label'] {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        :host(:is([readonly], [disabled], [part~='overflow'])) [part='remove-button'] {
          display: none !important;
        }
      </style>
      <div part="label">[[label]]</div>
      <div part="remove-button" role="button" on-click="_onRemoveClick"></div>
    `}_onRemoveClick(C){C.stopPropagation(),this.dispatchEvent(new CustomEvent("item-removed",{detail:{item:this.item},bubbles:!0,composed:!0}))}}customElements.define(MultiSelectComboBoxChip.is,MultiSelectComboBoxChip);/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */registerStyles("vaadin-multi-select-combo-box-container",i$2`
    #wrapper {
      display: flex;
      width: 100%;
    }
  `,{moduleId:"vaadin-multi-select-combo-box-container-styles"});let memoizedTemplate;class MultiSelectComboBoxContainer extends InputContainer{static get is(){return"vaadin-multi-select-combo-box-container"}static get template(){if(!memoizedTemplate){memoizedTemplate=super.template.cloneNode(!0);const C=memoizedTemplate.content,T=C.querySelectorAll("slot"),V=document.createElement("div");V.setAttribute("id","wrapper"),C.insertBefore(V,T[2]),V.appendChild(T[0]),V.appendChild(T[1])}return memoizedTemplate}}customElements.define(MultiSelectComboBoxContainer.is,MultiSelectComboBoxContainer);/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class MultiSelectComboBoxItem extends ComboBoxItem{static get is(){return"vaadin-multi-select-combo-box-item"}}customElements.define(MultiSelectComboBoxItem.is,MultiSelectComboBoxItem);/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */registerStyles("vaadin-multi-select-combo-box-overlay",i$2`
    #overlay {
      width: var(
        --vaadin-multi-select-combo-box-overlay-width,
        var(--_vaadin-multi-select-combo-box-overlay-default-width, auto)
      );
    }
  `,{moduleId:"vaadin-multi-select-combo-box-overlay-styles"});class MultiSelectComboBoxOverlay extends ComboBoxOverlay{static get is(){return"vaadin-multi-select-combo-box-overlay"}}customElements.define(MultiSelectComboBoxOverlay.is,MultiSelectComboBoxOverlay);/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class MultiSelectComboBoxScroller extends ComboBoxScroller{static get is(){return"vaadin-multi-select-combo-box-scroller"}ready(){super.ready(),this.setAttribute("aria-multiselectable","true")}_isItemSelected(C,T,V){return C instanceof ComboBoxPlaceholder||this.comboBox.readonly?!1:this.comboBox._findIndex(C,this.comboBox.selectedItems,V)>-1}__updateElement(C,T){super.__updateElement(C,T),C.toggleAttribute("readonly",this.comboBox.readonly)}}customElements.define(MultiSelectComboBoxScroller.is,MultiSelectComboBoxScroller);/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class MultiSelectComboBoxInternal extends ComboBoxDataProviderMixin(ComboBoxMixin(ThemableMixin(PolymerElement))){static get is(){return"vaadin-multi-select-combo-box-internal"}static get template(){return html`
      <style>
        :host([opened]) {
          pointer-events: auto;
        }
      </style>

      <slot></slot>

      <vaadin-multi-select-combo-box-overlay
        id="overlay"
        opened="[[_overlayOpened]]"
        loading$="[[loading]]"
        theme$="[[_theme]]"
        position-target="[[_target]]"
        no-vertical-overlap
        restore-focus-node="[[inputElement]]"
      ></vaadin-multi-select-combo-box-overlay>
    `}static get properties(){return{filteredItems:{type:Array,notify:!0},loading:{type:Boolean,notify:!0},size:{type:Number,notify:!0},selectedItems:{type:Array,value:()=>[]},lastFilter:{type:String,notify:!0},_target:{type:Object}}}get clearElement(){return this.querySelector('[part="clear-button"]')}get _tagNamePrefix(){return"vaadin-multi-select-combo-box"}open(){!this.disabled&&!(this.readonly&&this.selectedItems.length===0)&&(this.opened=!0)}ready(){super.ready(),this._target=this,this._toggleElement=this.querySelector(".toggle-button")}_initScroller(){const C=this.getRootNode().host;super._initScroller(C)}clear(){super.clear(),this.inputElement&&(this.inputElement.value="")}_onEnter(C){this.__enterPressed=!0,super._onEnter(C)}_closeOrCommit(){if(this.readonly){this.close();return}if(this.__enterPressed){this.__enterPressed=null;const C=this.filteredItems[this._focusedIndex];this._commitValue(),this._focusedIndex=this.filteredItems.indexOf(C);return}super._closeOrCommit()}_commitValue(){this.lastFilter=this.filter,super._commitValue()}_onArrowDown(){this.readonly?this.opened||this.open():super._onArrowDown()}_onArrowUp(){this.readonly?this.opened||this.open():super._onArrowUp()}_onFocusout(C){this._ignoreCommitValue=!0,super._onFocusout(C),this.readonly&&!this._closeOnBlurIsPrevented&&this.close()}_detectAndDispatchChange(){if(this._ignoreCommitValue){this._ignoreCommitValue=!1,this.selectedItem=null,this._inputElementValue="";return}super._detectAndDispatchChange()}_overlaySelectedItemChanged(C){C.stopPropagation(),!this.readonly&&(C.detail.item instanceof ComboBoxPlaceholder||this.opened&&this.dispatchEvent(new CustomEvent("combo-box-item-selected",{detail:{item:C.detail.item}})))}_shouldLoadPage(C){return this.readonly?!1:super._shouldLoadPage(C)}clearCache(){this.readonly||super.clearCache()}}customElements.define(MultiSelectComboBoxInternal.is,MultiSelectComboBoxInternal);/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const multiSelectComboBox=i$2`
  :host {
    --input-min-width: var(--vaadin-multi-select-combo-box-input-min-width, 4em);
  }

  [hidden] {
    display: none !important;
  }

  #chips {
    display: flex;
    align-items: center;
  }

  ::slotted(input) {
    box-sizing: border-box;
    flex: 1 0 var(--input-min-width);
  }

  [part='chip'] {
    flex: 0 1 auto;
  }

  :host(:is([readonly], [disabled])) ::slotted(input) {
    flex-grow: 0;
    flex-basis: 0;
    padding: 0;
  }
`;registerStyles("vaadin-multi-select-combo-box",[inputFieldShared,multiSelectComboBox],{moduleId:"vaadin-multi-select-combo-box-styles"});class MultiSelectComboBox extends ResizeMixin(InputControlMixin(ThemableMixin(ElementMixin(PolymerElement)))){static get is(){return"vaadin-multi-select-combo-box"}static get template(){return html`
      <div class="vaadin-multi-select-combo-box-container">
        <div part="label">
          <slot name="label"></slot>
          <span part="required-indicator" aria-hidden="true" on-click="focus"></span>
        </div>

        <vaadin-multi-select-combo-box-internal
          id="comboBox"
          items="[[__effectiveItems]]"
          item-id-path="[[itemIdPath]]"
          item-label-path="[[itemLabelPath]]"
          item-value-path="[[itemValuePath]]"
          disabled="[[disabled]]"
          readonly="[[readonly]]"
          auto-open-disabled="[[autoOpenDisabled]]"
          allow-custom-value="[[allowCustomValue]]"
          data-provider="[[dataProvider]]"
          filter="{{filter}}"
          last-filter="{{_lastFilter}}"
          loading="{{loading}}"
          size="{{size}}"
          filtered-items="[[__effectiveFilteredItems]]"
          selected-items="[[selectedItems]]"
          opened="{{opened}}"
          renderer="[[renderer]]"
          theme$="[[_theme]]"
          on-combo-box-item-selected="_onComboBoxItemSelected"
          on-change="_onComboBoxChange"
          on-custom-value-set="_onCustomValueSet"
          on-filtered-items-changed="_onFilteredItemsChanged"
        >
          <vaadin-multi-select-combo-box-container
            part="input-field"
            readonly="[[readonly]]"
            disabled="[[disabled]]"
            invalid="[[invalid]]"
            theme$="[[_theme]]"
          >
            <vaadin-multi-select-combo-box-chip
              id="overflow"
              slot="prefix"
              part$="[[_getOverflowPart(_overflowItems.length)]]"
              disabled="[[disabled]]"
              readonly="[[readonly]]"
              label="[[_getOverflowLabel(_overflowItems.length)]]"
              title$="[[_getOverflowTitle(_overflowItems)]]"
              hidden$="[[_isOverflowHidden(_overflowItems.length)]]"
              on-mousedown="_preventBlur"
            ></vaadin-multi-select-combo-box-chip>
            <div id="chips" part="chips" slot="prefix"></div>
            <slot name="input"></slot>
            <div
              id="clearButton"
              part="clear-button"
              slot="suffix"
              on-touchend="_onClearButtonTouchend"
              aria-hidden="true"
            ></div>
            <div id="toggleButton" class="toggle-button" part="toggle-button" slot="suffix" aria-hidden="true"></div>
          </vaadin-multi-select-combo-box-container>
        </vaadin-multi-select-combo-box-internal>

        <div part="helper-text">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>

      <slot name="tooltip"></slot>
    `}static get properties(){return{autoOpenDisabled:Boolean,clearButtonVisible:{type:Boolean,reflectToAttribute:!0,observer:"_clearButtonVisibleChanged",value:!1},items:{type:Array},itemLabelPath:{type:String,value:"label"},itemValuePath:{type:String,value:"value"},itemIdPath:{type:String},i18n:{type:Object,value:()=>({cleared:"Selection cleared",focused:"focused. Press Backspace to remove",selected:"added to selection",deselected:"removed from selection",total:"{count} items selected"})},loading:{type:Boolean,value:!1,reflectToAttribute:!0},readonly:{type:Boolean,value:!1,observer:"_readonlyChanged",reflectToAttribute:!0},selectedItems:{type:Array,value:()=>[],notify:!0},opened:{type:Boolean,notify:!0,value:!1,reflectToAttribute:!0},size:{type:Number},pageSize:{type:Number,value:50,observer:"_pageSizeChanged"},dataProvider:{type:Object},allowCustomValue:{type:Boolean,value:!1},placeholder:{type:String,value:"",observer:"_placeholderChanged"},renderer:Function,filter:{type:String,value:"",notify:!0},filteredItems:Array,value:{type:String},__effectiveItems:{type:Array,computed:"__computeEffectiveItems(items, selectedItems, readonly)"},__effectiveFilteredItems:{type:Array,computed:"__computeEffectiveFilteredItems(items, filteredItems, selectedItems, readonly)"},_overflowItems:{type:Array,value:()=>[]},_focusedChipIndex:{type:Number,value:-1,observer:"_focusedChipIndexChanged"},_lastFilter:{type:String}}}static get observers(){return["_selectedItemsChanged(selectedItems, selectedItems.*)"]}get slotStyles(){const C=this.localName;return[...super.slotStyles,`
        ${C}[has-value] input::placeholder {
          color: transparent !important;
        }
      `]}get clearElement(){return this.$.clearButton}get _chips(){return this.shadowRoot.querySelectorAll('[part~="chip"]')}ready(){super.ready(),this.addController(new InputController(this,C=>{this._setInputElement(C),this._setFocusElement(C),this.stateTarget=C,this.ariaTarget=C})),this.addController(new LabelledInputController(this.inputElement,this._labelController)),this._tooltipController=new TooltipController(this),this.addController(this._tooltipController),this._tooltipController.setPosition("top"),this._tooltipController.setShouldShow(C=>!C.opened),this._inputField=this.shadowRoot.querySelector('[part="input-field"]'),this.__updateChips(),processTemplates(this)}checkValidity(){return this.required&&!this.readonly?this._hasValue:!0}clear(){this.__updateSelection([]),announce(this.i18n.cleared)}clearCache(){this.$&&this.$.comboBox&&this.$.comboBox.clearCache()}requestContentUpdate(){this.$&&this.$.comboBox&&this.$.comboBox.requestContentUpdate()}_disabledChanged(C,T){super._disabledChanged(C,T),(C||T)&&this.__updateChips()}_inputElementChanged(C){super._inputElementChanged(C),C&&this.$.comboBox._setInputElement(C)}_setFocused(C){super._setFocused(C),C||(this._focusedChipIndex=-1,this.validate())}_onResize(){this.__updateChips()}_delegateAttribute(C,T){if(this.stateTarget){if(C==="required"){this._delegateAttribute("aria-required",T?"true":!1);return}super._delegateAttribute(C,T)}}_clearButtonVisibleChanged(C,T){(C||T)&&this.__updateChips()}_onFilteredItemsChanged(C){const{value:T}=C.detail;(Array.isArray(T)||T==null)&&(this.filteredItems=T)}_readonlyChanged(C,T){(C||T)&&this.__updateChips(),this.dataProvider&&this.clearCache()}_pageSizeChanged(C,T){(Math.floor(C)!==C||C<=0)&&(this.pageSize=T,console.error('"pageSize" value must be an integer > 0')),this.$.comboBox.pageSize=this.pageSize}_placeholderChanged(C){const T=this.__tmpA11yPlaceholder;T!==C&&(this.__savedPlaceholder=C,T&&(this.placeholder=T))}_selectedItemsChanged(C){if(this._toggleHasValue(this._hasValue),this._hasValue){const T=this._mergeItemLabels(C);this.__tmpA11yPlaceholder=T,this.placeholder=T}else delete this.__tmpA11yPlaceholder,this.placeholder=this.__savedPlaceholder;this.__updateChips(),this.requestContentUpdate()}_getItemLabel(C){return this.$.comboBox._getItemLabel(C)}_getOverflowLabel(C){return C}_getOverflowPart(C){let T="chip overflow";return C===1?T+=" overflow-one":C===2&&(T+=" overflow-two"),T}_getOverflowTitle(C){return this._mergeItemLabels(C)}_isOverflowHidden(C){return C===0}_mergeItemLabels(C){return C.map(T=>this._getItemLabel(T)).join(", ")}_findIndex(C,T,V){if(V&&C){for(let K=0;K<T.length;K++)if(T[K]&&T[K][V]===C[V])return K;return-1}return T.indexOf(C)}__clearFilter(){this.filter="",this.$.comboBox.clear()}__announceItem(C,T,V){const K=T?"selected":"deselected",Y=this.i18n.total.replace("{count}",V||0);announce(`${C} ${this.i18n[K]} ${Y}`)}__removeItem(C){const T=[...this.selectedItems];T.splice(T.indexOf(C),1),this.__updateSelection(T);const V=this._getItemLabel(C);this.__announceItem(V,!1,T.length)}__selectItem(C){const T=[...this.selectedItems],V=this._findIndex(C,T,this.itemIdPath),K=this._getItemLabel(C);let Y=!1;if(V!==-1){const J=this._lastFilter;if(J&&J.toLowerCase()===K.toLowerCase()){this.__clearFilter();return}T.splice(V,1)}else T.push(C),Y=!0;this.__updateSelection(T),this.__clearFilter(),this.__announceItem(K,Y,T.length)}__updateSelection(C){this.selectedItems=C,this.validate(),this.dispatchEvent(new CustomEvent("change",{bubbles:!0}))}__createChip(C){const T=document.createElement("vaadin-multi-select-combo-box-chip");T.setAttribute("part","chip"),T.setAttribute("slot","prefix"),T.item=C,T.disabled=this.disabled,T.readonly=this.readonly;const V=this._getItemLabel(C);return T.label=V,T.setAttribute("title",V),T.addEventListener("item-removed",K=>this._onItemRemoved(K)),T.addEventListener("mousedown",K=>this._preventBlur(K)),T}__getOverflowWidth(){const C=this.$.overflow;C.style.visibility="hidden",C.removeAttribute("hidden"),C.setAttribute("part","chip overflow");const T=getComputedStyle(C),V=C.clientWidth+parseInt(T.marginInlineStart);return C.setAttribute("hidden",""),C.style.visibility="",V}__updateChips(){if(!this._inputField||!this.inputElement)return;Array.from(this._chips).forEach(Y=>{Y!==this.$.overflow&&Y.remove()});const C=[...this.selectedItems],T=this._inputField.$.wrapper.clientWidth,V=parseInt(getComputedStyle(this.inputElement).flexBasis);let K=T-V;C.length>1&&(K-=this.__getOverflowWidth());for(let Y=C.length-1,J=null;Y>=0;Y--){const ee=this.__createChip(C[Y]);if(this.$.chips.insertBefore(ee,J),this.$.chips.clientWidth>K){ee.remove();break}C.pop(),J=ee}this._overflowItems=C}_onClearButtonTouchend(C){C.preventDefault(),this.clear()}_onClearButtonClick(C){C.stopPropagation(),this.clear()}_onChange(C){C.stopPropagation()}_onEscape(C){this.clearButtonVisible&&this.selectedItems&&this.selectedItems.length&&(C.stopPropagation(),this.selectedItems=[])}_onKeyDown(C){super._onKeyDown(C);const T=Array.from(this._chips).slice(1);if(!this.readonly&&T.length>0)switch(C.key){case"Backspace":this._onBackSpace(T);break;case"ArrowLeft":this._onArrowLeft(T,C);break;case"ArrowRight":this._onArrowRight(T,C);break;default:this._focusedChipIndex=-1;break}}_onArrowLeft(C,T){if(this.inputElement.selectionStart!==0)return;const V=this._focusedChipIndex;V!==-1&&T.preventDefault();let K;this.getAttribute("dir")!=="rtl"?V===-1?K=C.length-1:V>0&&(K=V-1):V===C.length-1?K=-1:V>-1&&(K=V+1),K!==void 0&&(this._focusedChipIndex=K)}_onArrowRight(C,T){if(this.inputElement.selectionStart!==0)return;const V=this._focusedChipIndex;V!==-1&&T.preventDefault();let K;this.getAttribute("dir")==="rtl"?V===-1?K=C.length-1:V>0&&(K=V-1):V===C.length-1?K=-1:V>-1&&(K=V+1),K!==void 0&&(this._focusedChipIndex=K)}_onBackSpace(C){if(this.inputElement.selectionStart!==0)return;const T=this._focusedChipIndex;T===-1?this._focusedChipIndex=C.length-1:(this.__removeItem(C[T].item),this._focusedChipIndex=-1)}_focusedChipIndexChanged(C,T){if(C>-1||T>-1){const V=Array.from(this._chips).slice(1);if(V.forEach((K,Y)=>{K.toggleAttribute("focused",Y===C)}),C>-1){const K=V[C].item,Y=this._getItemLabel(K);announce(`${Y} ${this.i18n.focused}`)}}}_onComboBoxChange(){const C=this.$.comboBox.selectedItem;C&&this.__selectItem(C)}_onComboBoxItemSelected(C){this.__selectItem(C.detail.item)}_onCustomValueSet(C){C.preventDefault(),C.stopPropagation(),this.__clearFilter(),this.dispatchEvent(new CustomEvent("custom-value-set",{detail:C.detail,composed:!0,bubbles:!0}))}_onItemRemoved(C){this.__removeItem(C.detail.item)}_preventBlur(C){C.preventDefault()}__computeEffectiveItems(C,T,V){return C&&V?T:C}__computeEffectiveFilteredItems(C,T,V,K){return!C&&K?V:T}get _hasValue(){return this.selectedItems&&this.selectedItems.length>0}}customElements.define(MultiSelectComboBox.is,MultiSelectComboBox);var __defProp$d=Object.defineProperty,__getOwnPropDesc$d=Object.getOwnPropertyDescriptor,__decorateClass$d=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$d(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$d(C,T,K),K};let FieldExternalrefArray=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="",this.name="",this.onChange=$=>{this.onValueChanged({value:$.detail.value})},this.enabled=!0,this.dataProvider=async($,C)=>{var re;const T=window.__MATEU_REMOTE_BASE_URL__?window.__MATEU_REMOTE_BASE_URL__:"https://remote.mateu.io/mateu/v1",V=(re=this.field)==null?void 0:re.attributes.filter(se=>se.key=="itemprovider")[0].value,K=`${T}/itemproviders/${V}/items`,{filter:Y,page:J,pageSize:ee}=$,te=await this.getCount($),ie=await fetch(`${K}?page=${J}&page_size=${ee}&search_text=${Y}`);if(ie.ok){const se=await ie.json();C(se,te)}}}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){this.placeholder=$}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){this.value=$}async getCount($){var J;const C=window.__MATEU_REMOTE_BASE_URL__?window.__MATEU_REMOTE_BASE_URL__:"https://remote.mateu.io/mateu/v1",T=(J=this.field)==null?void 0:J.attributes.filter(ee=>ee.key=="itemprovider")[0].value,V=`${C}/itemproviders/${T}/count`,{filter:K}=$,Y=await fetch(`${V}?search_text=${K}`);return Y.ok?parseInt(await Y.text()):0}firstUpdated($){var T;const C=(T=this.shadowRoot)==null?void 0:T.querySelector("vaadin-multi-select-combo-box");C.dataProvider=this.dataProvider,C.selectedItems=this.value?this.value:[]}render(){return y$1`
            <vaadin-multi-select-combo-box .selectedValues="${this.value}"
                             label="${this.label}"
                             name="${this.name}"
                             id="${this.name}"
                             ?disabled=${!this.enabled}
                             ?required=${this.required}
                             item-label-path="key"
                                           item-id-path="value"
                                           @selected-items-changed=${this.onChange}
            >
            </vaadin-multi-select-combo-box>
            `}};FieldExternalrefArray.styles=i$2`
        vaadin-multi-select-combo-box {
            width: 100%;
        }
    `;__decorateClass$d([e()],FieldExternalrefArray.prototype,"required",2);__decorateClass$d([e()],FieldExternalrefArray.prototype,"label",2);__decorateClass$d([e()],FieldExternalrefArray.prototype,"placeholder",2);__decorateClass$d([e()],FieldExternalrefArray.prototype,"name",2);__decorateClass$d([e()],FieldExternalrefArray.prototype,"onChange",2);__decorateClass$d([e()],FieldExternalrefArray.prototype,"value",2);__decorateClass$d([e()],FieldExternalrefArray.prototype,"items",2);__decorateClass$d([e()],FieldExternalrefArray.prototype,"enabled",2);__decorateClass$d([e()],FieldExternalrefArray.prototype,"field",2);__decorateClass$d([t$1()],FieldExternalrefArray.prototype,"dataProvider",2);FieldExternalrefArray=__decorateClass$d([e$1("field-externalref-array")],FieldExternalrefArray);var __defProp$c=Object.defineProperty,__getOwnPropDesc$c=Object.getOwnPropertyDescriptor,__decorateClass$c=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$c(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$c(C,T,K),K};let FieldClosedList=class extends s$2{constructor(){super(...arguments),this.required=!1,this.label="",this.placeholder="",this.name="",this.onChange=$=>{console.log("onchange",$.detail.value),this.onValueChanged({value:$.detail.value})},this.enabled=!0}setRequired($){this.required=$}setField($){this.field=$}setLabel($){this.label=$}setPlaceholder($){this.placeholder=$}setEnabled($){this.enabled=$}onValueChanged($){console.log($)}setValue($){console.log("setvalue",$);const C=$;this.value=C.map(T=>""+T)}render(){return y$1`
            <vaadin-checkbox-group label="${this.label}" theme="vertical"
                                @value-changed=${this.onChange} 
                                   .value=${this.value}
                           name="${this.name}" 
                           id="${this.name}"
                   ?disabled=${!this.enabled}
                                ?required=${this.required}
            >
                ${this.field.attributes.filter($=>$.key=="choice").map($=>$.value).map($=>y$1`
                    <vaadin-checkbox .value=${""+$.value} .label=${$.key} ></vaadin-checkbox>
                    `)}
            </vaadin-checkbox-group>
            `}};__decorateClass$c([e()],FieldClosedList.prototype,"required",2);__decorateClass$c([e()],FieldClosedList.prototype,"label",2);__decorateClass$c([e()],FieldClosedList.prototype,"placeholder",2);__decorateClass$c([e()],FieldClosedList.prototype,"name",2);__decorateClass$c([e()],FieldClosedList.prototype,"onChange",2);__decorateClass$c([e()],FieldClosedList.prototype,"value",2);__decorateClass$c([e()],FieldClosedList.prototype,"enabled",2);__decorateClass$c([e()],FieldClosedList.prototype,"field",2);FieldClosedList=__decorateClass$c([e$1("field-closedlist")],FieldClosedList);var __defProp$b=Object.defineProperty,__getOwnPropDesc$b=Object.getOwnPropertyDescriptor,__decorateClass$b=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$b(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$b(C,T,K),K};let MateuField=class extends s$2{firstUpdated(){const $=document.createElement(mapInputTypeToFieldType(this.field.type,this.field.stereotype)),C=this.shadowRoot.getElementById("container"),T=$;T.onValueChanged=K=>{let Y=new CustomEvent("change",{detail:{key:this.field.id,value:K.value}});this.dispatchEvent(Y)},T.setLabel(this.field.caption),T.setPlaceholder(this.field.placeholder),T.setField(this.field),T.setValue(this.value),T.setRequired(this.field.validations.length>0),C.appendChild($);const V=this.shadowRoot.getElementById("wrapper");this.fieldWrapper.container=V}render(){return y$1`
      <div id="wrapper">
        <div id="container"></div>
        
        <slot></slot>
      </div>
    `}};MateuField.styles=i$2`
  /*
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
*/
  `;__decorateClass$b([e()],MateuField.prototype,"field",2);__decorateClass$b([e()],MateuField.prototype,"value",2);__decorateClass$b([e()],MateuField.prototype,"visible",2);__decorateClass$b([e()],MateuField.prototype,"enabled",2);__decorateClass$b([e()],MateuField.prototype,"fieldWrapper",2);MateuField=__decorateClass$b([e$1("mateu-field")],MateuField);var __defProp$a=Object.defineProperty,__getOwnPropDesc$a=Object.getOwnPropertyDescriptor,__decorateClass$a=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$a(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$a(C,T,K),K};let MateuFieldGroup=class extends s$2{connectedCallback(){super.connectedCallback()}onValueChange($){this.formElement.valueChanged($.detail.key,$.detail.value)}render(){return y$1`
      <div>

        ${this.fieldGroup.caption?y$1`<h2>${this.fieldGroup.caption}</h2>`:""}
        
          ${this.fieldGroup.fields.map($=>y$1`<mateu-field .field="${$}" @change=${this.onValueChange} .formElement=${this.formElement} .value=${this.formElement.getValue($.id)} .fieldWrapper=${this.formElement.getFieldWrapper($)}></mateu-field>`)}
        
        <slot></slot>
      </div>
    `}};MateuFieldGroup.styles=i$2`
  /*
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
    */
  `;__decorateClass$a([e()],MateuFieldGroup.prototype,"fieldGroup",2);__decorateClass$a([e()],MateuFieldGroup.prototype,"formElement",2);MateuFieldGroup=__decorateClass$a([e$1("mateu-fieldgroup")],MateuFieldGroup);var __defProp$9=Object.defineProperty,__getOwnPropDesc$9=Object.getOwnPropertyDescriptor,__decorateClass$9=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$9(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$9(C,T,K),K};let MateuSection=class extends s$2{render(){return y$1`
      <div class="mateu-section">

        ${this.section.caption?y$1`<h2>${this.section.caption}</h2>`:""}
        
        ${this.section.readOnly?y$1`
          ${this.section.fieldGroups.map($=>y$1`<div>
              ${$.caption}
              <div class="table">
              ${$.fields.map(C=>y$1`<div class="field"><div class="cell caption">${C.caption}</div><div class="cell value">${this.formElement.getValue(C.id)}</div></div>`)}
              </div>
          </div>`)}
        `:y$1`
          ${this.section.fieldGroups.map($=>y$1`<mateu-fieldgroup .fieldGroup="${$}" .formElement=${this.formElement}></mateu-fieldgroup>`)}
        `}
        
        <slot></slot>
      </div>
    `}};MateuSection.styles=i$2`
    .mateu-section {
      text-align: left;
      border: 1px solid lightgrey;
      border-radius: 8px;
      padding: 2rem;  
      margin-bottom: 16px;       
      padding-top: 14px;   
    }
    
    .mateu-section:has(h1) {
      padding-top: 0px;
    }
    
    .table {
        display: grid;
        grid-template-columns: repeat(auto-fill, calc(50% - 20px));
        grid-column-gap: 20px;
    }
    
    .field {
        border-bottom: 1px dashed lightgrey;
        display: flex;
    }

    .field:nth-child(n+3)  {
    /*
        border-top: 1px solid lightgrey;
        */
    }
    
    .cell {
        min-height: 2rem;
        padding-top: 5px;
    }
    
    .caption {
        font-weight: 800;
        font-size: var(--lumo-font-size-s);
        color: var(--lumo-secondary-text-color);
    }
    
    .value {
        text-align: right;
        flex: auto;
    }


  `;__decorateClass$9([e()],MateuSection.prototype,"section",2);__decorateClass$9([e()],MateuSection.prototype,"formElement",2);MateuSection=__decorateClass$9([e$1("mateu-section")],MateuSection);registerStyles("vaadin-notification-card",i$2`
    :host {
      position: relative;
      margin: var(--lumo-space-s);
    }

    [part='overlay'] {
      background: var(--lumo-base-color) linear-gradient(var(--lumo-contrast-5pct), var(--lumo-contrast-5pct));
      border-radius: var(--lumo-border-radius-l);
      box-shadow: 0 0 0 1px var(--lumo-contrast-10pct), var(--lumo-box-shadow-l);
      font-family: var(--lumo-font-family);
      font-size: var(--lumo-font-size-m);
      font-weight: 400;
      line-height: var(--lumo-line-height-s);
      letter-spacing: 0;
      text-transform: none;
      -webkit-text-size-adjust: 100%;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    [part='content'] {
      padding: var(--lumo-space-wide-l);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    [part='content'] ::slotted(vaadin-button) {
      flex: none;
      margin: 0 calc(var(--lumo-space-s) * -1) 0 var(--lumo-space-m);
    }

    :host([slot^='middle']) {
      max-width: 80vw;
      margin: var(--lumo-space-s) auto;
    }

    :host([slot\$='stretch']) {
      margin: 0;
    }

    :host([slot\$='stretch']) [part='overlay'] {
      border-radius: 0;
    }

    @media (min-width: 421px) {
      :host(:not([slot\$='stretch'])) {
        display: flex;
      }

      :host([slot\$='end']) {
        justify-content: flex-end;
      }

      :host([slot^='middle']),
      :host([slot\$='center']) {
        display: flex;
        justify-content: center;
      }
    }

    @keyframes lumo-notification-exit-fade-out {
      100% {
        opacity: 0;
      }
    }

    @keyframes lumo-notification-enter-fade-in {
      0% {
        opacity: 0;
      }
    }

    @keyframes lumo-notification-enter-slide-down {
      0% {
        transform: translateY(-200%);
        opacity: 0;
      }
    }

    @keyframes lumo-notification-exit-slide-up {
      100% {
        transform: translateY(-200%);
        opacity: 0;
      }
    }

    @keyframes lumo-notification-enter-slide-up {
      0% {
        transform: translateY(200%);
        opacity: 0;
      }
    }

    @keyframes lumo-notification-exit-slide-down {
      100% {
        transform: translateY(200%);
        opacity: 0;
      }
    }

    :host([slot='middle'][opening]) {
      animation: lumo-notification-enter-fade-in 300ms;
    }

    :host([slot='middle'][closing]) {
      animation: lumo-notification-exit-fade-out 300ms;
    }

    :host([slot^='top'][opening]) {
      animation: lumo-notification-enter-slide-down 300ms;
    }

    :host([slot^='top'][closing]) {
      animation: lumo-notification-exit-slide-up 300ms;
    }

    :host([slot^='bottom'][opening]) {
      animation: lumo-notification-enter-slide-up 300ms;
    }

    :host([slot^='bottom'][closing]) {
      animation: lumo-notification-exit-slide-down 300ms;
    }

    :host([theme~='primary']) [part='overlay'] {
      background: var(--lumo-primary-color);
      color: var(--lumo-primary-contrast-color);
      box-shadow: var(--lumo-box-shadow-l);
    }

    :host([theme~='primary']) {
      --_lumo-button-background-color: var(--lumo-shade-20pct);
      --_lumo-button-color: var(--lumo-primary-contrast-color);
      --_lumo-button-primary-background-color: var(--lumo-primary-contrast-color);
      --_lumo-button-primary-color: var(--lumo-primary-text-color);
    }

    :host([theme~='contrast']) [part='overlay'] {
      background: var(--lumo-contrast);
      color: var(--lumo-base-color);
      box-shadow: var(--lumo-box-shadow-l);
    }

    :host([theme~='contrast']) {
      --_lumo-button-background-color: var(--lumo-contrast-20pct);
      --_lumo-button-color: var(--lumo-base-color);
      --_lumo-button-primary-background-color: var(--lumo-base-color);
      --_lumo-button-primary-color: var(--lumo-contrast);
    }

    :host([theme~='success']) [part='overlay'] {
      background: var(--lumo-success-color);
      color: var(--lumo-success-contrast-color);
      box-shadow: var(--lumo-box-shadow-l);
    }

    :host([theme~='success']) {
      --_lumo-button-background-color: var(--lumo-shade-20pct);
      --_lumo-button-color: var(--lumo-success-contrast-color);
      --_lumo-button-primary-background-color: var(--lumo-success-contrast-color);
      --_lumo-button-primary-color: var(--lumo-success-text-color);
    }

    :host([theme~='error']) [part='overlay'] {
      background: var(--lumo-error-color);
      color: var(--lumo-error-contrast-color);
      box-shadow: var(--lumo-box-shadow-l);
    }

    :host([theme~='error']) {
      --_lumo-button-background-color: var(--lumo-shade-20pct);
      --_lumo-button-color: var(--lumo-error-contrast-color);
      --_lumo-button-primary-background-color: var(--lumo-error-contrast-color);
      --_lumo-button-primary-color: var(--lumo-error-text-color);
    }
  `,{moduleId:"lumo-notification-card"});/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class NotificationContainer extends ThemableMixin(ElementMixin(PolymerElement)){static get template(){return html`
      <style>
        :host {
          position: fixed;
          z-index: 1000;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          box-sizing: border-box;

          display: flex;
          flex-direction: column;
          align-items: stretch;
          pointer-events: none;
        }

        [region-group] {
          flex: 1 1 0%;
          display: flex;
        }

        [region-group='top'] {
          align-items: flex-start;
        }

        [region-group='bottom'] {
          align-items: flex-end;
        }

        [region-group] > [region] {
          flex: 1 1 0%;
        }

        @media (max-width: 420px) {
          [region-group] {
            flex-direction: column;
            align-items: stretch;
          }

          [region-group='top'] {
            justify-content: flex-start;
          }

          [region-group='bottom'] {
            justify-content: flex-end;
          }

          [region-group] > [region] {
            flex: initial;
          }
        }
      </style>

      <div region="top-stretch"><slot name="top-stretch"></slot></div>
      <div region-group="top">
        <div region="top-start"><slot name="top-start"></slot></div>
        <div region="top-center"><slot name="top-center"></slot></div>
        <div region="top-end"><slot name="top-end"></slot></div>
      </div>
      <div region="middle"><slot name="middle"></slot></div>
      <div region-group="bottom">
        <div region="bottom-start"><slot name="bottom-start"></slot></div>
        <div region="bottom-center"><slot name="bottom-center"></slot></div>
        <div region="bottom-end"><slot name="bottom-end"></slot></div>
      </div>
      <div region="bottom-stretch"><slot name="bottom-stretch"></slot></div>
    `}static get is(){return"vaadin-notification-container"}static get properties(){return{opened:{type:Boolean,value:!1,observer:"_openedChanged"}}}constructor(){super(),this._boundVaadinOverlayClose=this._onVaadinOverlayClose.bind(this),isIOS&&(this._boundIosResizeListener=()=>this._detectIosNavbar())}_openedChanged(C){C?(document.body.appendChild(this),document.addEventListener("vaadin-overlay-close",this._boundVaadinOverlayClose),this._boundIosResizeListener&&(this._detectIosNavbar(),window.addEventListener("resize",this._boundIosResizeListener))):(document.body.removeChild(this),document.removeEventListener("vaadin-overlay-close",this._boundVaadinOverlayClose),this._boundIosResizeListener&&window.removeEventListener("resize",this._boundIosResizeListener))}_detectIosNavbar(){const C=window.innerHeight,V=window.innerWidth>C,K=document.documentElement.clientHeight;V&&K>C?this.style.bottom=`${K-C}px`:this.style.bottom="0"}_onVaadinOverlayClose(C){const T=C.detail.sourceEvent;T&&T.composedPath().indexOf(this)>=0&&C.preventDefault()}}class NotificationCard extends ThemableMixin(PolymerElement){static get template(){return html`
      <style>
        :host {
          display: block;
        }

        [part='overlay'] {
          pointer-events: auto;
        }
      </style>

      <div part="overlay">
        <div part="content">
          <slot></slot>
        </div>
      </div>
    `}static get is(){return"vaadin-notification-card"}ready(){super.ready(),this.setAttribute("role","alert"),this.setAttribute("aria-live","polite")}}class Notification extends ThemePropertyMixin(ElementMixin(PolymerElement)){static get template(){return html`
      <style>
        :host {
          display: none !important;
        }
      </style>
      <vaadin-notification-card theme$="[[_theme]]"> </vaadin-notification-card>
    `}static get is(){return"vaadin-notification"}static get properties(){return{duration:{type:Number,value:5e3},opened:{type:Boolean,value:!1,notify:!0,observer:"_openedChanged"},position:{type:String,value:"bottom-start",observer:"_positionChanged"},renderer:Function}}static get observers(){return["_durationChanged(duration, opened)","_rendererChanged(renderer, opened, _card)"]}static show(C,T){return n$3(C)?Notification._createAndShowNotification(V=>{Z$1(C,V)},T):Notification._createAndShowNotification(V=>{V.innerText=C},T)}static _createAndShowNotification(C,T){const V=document.createElement(Notification.is);return T&&Number.isFinite(T.duration)&&(V.duration=T.duration),T&&T.position&&(V.position=T.position),T&&T.theme&&V.setAttribute("theme",T.theme),V.renderer=C,document.body.appendChild(V),V.opened=!0,V.addEventListener("opened-changed",K=>{K.detail.value||V.remove()}),V}ready(){super.ready(),this._card=this.shadowRoot.querySelector("vaadin-notification-card"),processTemplates(this)}disconnectedCallback(){super.disconnectedCallback(),this.opened=!1}requestContentUpdate(){this.renderer&&this.renderer(this._card,this)}_rendererChanged(C,T,V){if(!V)return;const K=this._oldRenderer!==C;this._oldRenderer=C,K&&(V.innerHTML="",delete V._$litPart$),T&&(this._didAnimateNotificationAppend||this._animatedAppendNotificationCard(),this.requestContentUpdate())}open(){this.opened=!0}close(){this.opened=!1}get _container(){return Notification._container||(Notification._container=document.createElement("vaadin-notification-container"),document.body.appendChild(Notification._container)),Notification._container}_openedChanged(C){C?(this._container.opened=!0,this._animatedAppendNotificationCard()):this._card&&this._closeNotificationCard()}_animatedAppendNotificationCard(){if(this._card){this._card.setAttribute("opening",""),this._appendNotificationCard();const C=()=>{this._card.removeEventListener("animationend",C),this._card.removeAttribute("opening")};this._card.addEventListener("animationend",C),this._didAnimateNotificationAppend=!0}else this._didAnimateNotificationAppend=!1}_appendNotificationCard(){if(this._card){if(!this._container.shadowRoot.querySelector(`slot[name="${this.position}"]`)){console.warn(`Invalid alignment parameter provided: position=${this.position}`);return}this._card.slot=this.position,this._container.firstElementChild&&/top/.test(this.position)?this._container.insertBefore(this._card,this._container.firstElementChild):this._container.appendChild(this._card)}}_removeNotificationCard(){this._card.parentNode&&this._card.parentNode.removeChild(this._card),this._card.removeAttribute("closing"),this._container.opened=Boolean(this._container.firstElementChild)}_closeNotificationCard(){this._durationTimeoutId&&clearTimeout(this._durationTimeoutId),this._animatedRemoveNotificationCard()}_animatedRemoveNotificationCard(){this._card.setAttribute("closing","");const C=getComputedStyle(this._card).getPropertyValue("animation-name");if(C&&C!=="none"){const T=()=>{this._removeNotificationCard(),this._card.removeEventListener("animationend",T)};this._card.addEventListener("animationend",T)}else this._removeNotificationCard()}_positionChanged(){this.opened&&this._animatedAppendNotificationCard()}_durationChanged(C,T){T&&(clearTimeout(this._durationTimeoutId),C>0&&(this._durationTimeoutId=setTimeout(()=>this.close(),C)))}}customElements.define(NotificationContainer.is,NotificationContainer);customElements.define(NotificationCard.is,NotificationCard);customElements.define(Notification.is,Notification);/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */console.warn('WARNING: Since Vaadin 23.2, "@vaadin/vaadin-notification" is deprecated. Use "@vaadin/notification" instead.');const initialValue={};class AbstractRendererDirective extends i$3{constructor(C){if(super(C),this.previousValue=initialValue,C.type!==t$2.ELEMENT)throw new Error("renderer only supports binding to element")}render(C,T){return b$1}update(C,[T,V]){var K;const Y=this.previousValue===initialValue;if(!this.hasChanged(V))return b$1;this.previousValue=Array.isArray(V)?Array.from(V):V;const J=C.element;if(Y){const ee=(K=C.options)===null||K===void 0?void 0:K.host;this.addRenderer(J,T,{host:ee})}else this.runRenderer(J);return b$1}hasChanged(C){let T=!0;return Array.isArray(C)?Array.isArray(this.previousValue)&&this.previousValue.length===C.length&&C.every((V,K)=>V===this.previousValue[K])&&(T=!1):this.previousValue===C&&(T=!1),T}}class NotificationRendererDirective extends AbstractRendererDirective{addRenderer(C,T,V){C.renderer=(K,Y)=>{Z$1(T.call(V.host,Y),K,V)}}runRenderer(C){C.requestContentUpdate()}}const rendererDirective=e$2(NotificationRendererDirective),notificationRenderer=($,C)=>rendererDirective($,C);class FieldsMap{constructor(){this.map=new Map}}class FieldWrapper{constructor(C){this.visible=!0,this.enabled=!0,this.container=void 0,this.field=C}setVisible(C){var T;this.visible=C,(T=this.container)==null||T.setAttribute("style","display: "+(this.visible?"block":"none"))}}/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const template=document.createElement("template");template.innerHTML=`<vaadin-iconset name="lumo" size="1000">
<svg xmlns="http://www.w3.org/2000/svg">
<defs>
<g id="lumo:align-center"><path d="M167 217c0-18 17-33 38-34H795c21 0 38 15 38 34 0 18-17 33-38 33H205C184 250 167 235 167 217z m83 191c0-18 13-33 29-33H721c16 0 29 15 29 33 0 18-13 33-29 34H279C263 442 250 427 250 408zM250 792c0-18 13-33 29-34H721c16 0 29 15 29 34s-13 33-29 33H279C263 825 250 810 250 792z m-83-192c0-18 17-33 38-33H795c21 0 38 15 38 33s-17 33-38 33H205C184 633 167 618 167 600z" fill-rule="evenodd" clip-rule="evenodd"></path></g>
<g id="lumo:align-left"><path d="M167 217c0-18 17-33 38-34H795c21 0 38 15 38 34 0 18-17 33-38 33H205C184 250 167 235 167 217z m0 191c0-18 13-33 28-33H638c16 0 29 15 29 33 0 18-13 33-29 34H195C179 442 167 427 167 408zM167 792c0-18 13-33 28-34H638c16 0 29 15 29 34s-13 33-29 33H195C179 825 167 810 167 792z m0-192c0-18 17-33 38-33H795c21 0 38 15 38 33s-17 33-38 33H205C184 633 167 618 167 600z" fill-rule="evenodd" clip-rule="evenodd"></path></g>
<g id="lumo:align-right"><path d="M167 217c0-18 17-33 38-34H795c21 0 38 15 38 34 0 18-17 33-38 33H205C184 250 167 235 167 217z m166 191c0-18 13-33 29-33H805c16 0 29 15 28 33 0 18-13 33-28 34H362C346 442 333 427 333 408zM333 792c0-18 13-33 29-34H805c16 0 29 15 28 34s-13 33-28 33H362C346 825 333 810 333 792z m-166-192c0-18 17-33 38-33H795c21 0 38 15 38 33s-17 33-38 33H205C184 633 167 618 167 600z" fill-rule="evenodd" clip-rule="evenodd"></path></g>
<g id="lumo:angle-down"><path d="M283 391c-18-16-46-15-63 4-16 18-15 46 3 63l244 224c17 15 43 15 60 0l250-229c18-16 20-45 3-63-16-18-45-20-63-4l-220 203-214-198z"></path></g>
<g id="lumo:angle-left"><path d="M601 710c16 18 15 46-3 63-18 16-46 15-63-4l-224-244c-15-17-15-43 0-59l229-250c16-18 45-20 63-4 18 16 20 45 3 63l-203 220 198 215z"></path></g>
<g id="lumo:angle-right"><path d="M399 275c-16-18-15-46 3-63 18-16 46-15 63 4l224 244c15 17 15 43 0 59l-229 250c-16 18-45 20-63 4-18-16-20-45-3-63l203-220-198-215z"></path></g>
<g id="lumo:angle-up"><path d="M283 635c-18 16-46 15-63-3-16-18-15-46 3-63l244-224c17-15 43-15 60 0l250 229c18 16 20 45 3 63-16 18-45 20-63 3l-220-202L283 635z"></path></g>
<g id="lumo:arrow-down"><path d="M538 646l125-112c15-14 39-12 53 4 14 15 12 39-4 53l-187 166c0 0 0 0 0 0-14 13-36 12-50 0l-187-166c-15-14-17-37-4-53 14-15 37-17 53-4L462 646V312c0-21 17-38 38-37s38 17 37 37v334z"></path></g>
<g id="lumo:arrow-left"><path d="M375 538l111 125c14 15 12 39-3 53-15 14-39 12-53-4l-166-187c0 0 0 0 0 0-13-14-12-36 0-50l166-187c14-15 37-17 53-4 15 14 17 37 3 53L375 463h333c21 0 38 17 38 37 0 21-17 38-38 38h-333z"></path></g>
<g id="lumo:arrow-right"><path d="M625 538h-333c-21 0-38-17-38-38 0-21 17-38 38-37h333l-111-126c-14-15-12-39 3-53 15-14 39-12 53 4l166 187c13 14 13 36 0 50 0 0 0 0 0 0l-166 187c-14 15-37 17-53 4-15-14-17-37-3-53l111-125z"></path></g>
<g id="lumo:arrow-up"><path d="M538 354V688c0 21-17 38-38 37s-38-17-38-38V354l-125 112c-15 14-39 12-53-4-14-15-12-39 4-53l187-166c14-13 36-13 50 0 0 0 0 0 0 0l187 166c15 14 17 37 4 53-14 15-37 17-53 4L538 354z"></path></g>
<g id="lumo:bar-chart"><path d="M175 500h108c28 0 50 22 50 50v233c0 28-22 50-50 50H175c-28 0-50-22-50-50v-233c0-28 22-50 50-50z m33 67c-9 0-17 7-16 16v167c0 9 7 17 16 17h42c9 0 17-7 17-17v-167c0-9-7-17-17-16H208zM446 167h108c28 0 50 22 50 50v566c0 28-22 50-50 50h-108c-28 0-50-22-50-50V217c0-28 22-50 50-50z m33 66c-9 0-17 7-17 17v500c0 9 7 17 17 17h42c9 0 17-7 16-17V250c0-9-7-17-16-17h-42zM717 333h108c28 0 50 22 50 50v400c0 28-22 50-50 50h-108c-28 0-50-22-50-50V383c0-28 22-50 50-50z m33 67c-9 0-17 7-17 17v333c0 9 7 17 17 17h42c9 0 17-7 16-17v-333c0-9-7-17-16-17h-42z"></path></g>
<g id="lumo:bell"><path d="M367 675H292v-258C292 325 366 250 459 250H458V208c0-23 18-42 42-41 23 0 42 18 42 41v42h-1C634 250 708 325 708 417V675h-75v-258c0-51-41-92-91-92h-84C408 325 367 366 367 417V675z m-159 37c0-21 17-38 38-37h508c21 0 37 17 38 37 0 21-17 38-38 38H246C225 750 208 733 208 713z m230 71h125v32c0 17-14 31-32 31h-62c-17 0-32-14-31-31v-32z"></path></g>
<g id="lumo:calendar"><path d="M375 208h250v-20C625 176 634 167 646 167h41C699 167 708 176 708 188V208h74c23 0 41 19 41 42v42C823 315 804 333 782 333H218C196 333 177 315 177 292V250C177 227 196 208 218 208H292v-20C292 176 301 167 313 167h41C366 167 375 176 375 188V208zM229 375h42C283 375 292 384 292 396v41C292 449 282 458 271 458h-42C217 458 208 449 208 437v-41C208 384 218 375 229 375z m125 0h42C408 375 417 384 417 396v41C417 449 407 458 396 458h-42C342 458 333 449 333 437v-41C333 384 343 375 354 375z m125 0h42C533 375 542 384 542 396v41C542 449 532 458 521 458h-42C467 458 458 449 458 437v-41C458 384 468 375 479 375z m-250 125h42C283 500 292 509 292 521v41C292 574 282 583 271 583h-42C217 583 208 574 208 562v-41C208 509 218 500 229 500z m125 0h42C408 500 417 509 417 521v41C417 574 407 583 396 583h-42C342 583 333 574 333 562v-41C333 509 343 500 354 500z m125 0h42c12 0 21 9 21 21v41C542 574 532 583 521 583h-42C467 583 458 574 458 562v-41C458 509 468 500 479 500z m-250 125h42C283 625 292 634 292 646v41C292 699 282 708 271 708h-42C217 708 208 699 208 687v-41C208 634 218 625 229 625z m125 0h42C408 625 417 634 417 646v41C417 699 407 708 396 708h-42C342 708 333 699 333 687v-41C333 634 343 625 354 625z m125 0h42c12 0 21 9 21 21v41C542 699 532 708 521 708h-42C467 708 458 699 458 687v-41C458 634 468 625 479 625z m125-250h42C658 375 667 384 667 396v41C667 449 657 458 646 458h-42C592 458 583 449 583 437v-41C583 384 593 375 604 375z m0 125h42c12 0 21 9 21 21v41C667 574 657 583 646 583h-42C592 583 583 574 583 562v-41C583 509 593 500 604 500z m0 125h42c12 0 21 9 21 21v41C667 699 657 708 646 708h-42C592 708 583 699 583 687v-41C583 634 593 625 604 625z m125 0h42c12 0 21 9 21 21v41C792 699 782 708 771 708h-42C717 708 708 699 708 687v-41C708 634 718 625 729 625z m-500 125h42C283 750 292 759 292 771v41C292 824 282 833 271 833h-42C217 833 208 824 208 812v-41C208 759 218 750 229 750z m125 0h42C408 750 417 759 417 771v41C417 824 407 833 396 833h-42C342 833 333 824 333 812v-41C333 759 343 750 354 750z m125 0h42c12 0 21 9 21 21v41C542 824 532 833 521 833h-42C467 833 458 824 458 812v-41C458 759 468 750 479 750z m125 0h42c12 0 21 9 21 21v41C667 824 657 833 646 833h-42C592 833 583 824 583 812v-41C583 759 593 750 604 750z m125 0h42c12 0 21 9 21 21v41C792 824 782 833 771 833h-42C717 833 708 824 708 812v-41C708 759 718 750 729 750z m0-250h42c12 0 21 9 21 21v41C792 574 782 583 771 583h-42C717 583 708 574 708 562v-41C708 509 718 500 729 500z m0-125h42C783 375 792 384 792 396v41C792 449 782 458 771 458h-42C717 458 708 449 708 437v-41C708 384 718 375 729 375z"></path></g>
<g id="lumo:checkmark"><path d="M318 493c-15-15-38-15-53 0-15 15-15 38 0 53l136 136c15 15 38 15 53 0l323-322c15-15 15-38 0-53-15-15-38-15-54 0l-295 296-110-110z"></path></g>
<g id="lumo:chevron-down"><path d="M533 654l210-199c9-9 9-23 0-32C739 419 733 417 726 417H274C261 417 250 427 250 439c0 6 2 12 7 16l210 199c18 17 48 17 66 0z"></path></g>
<g id="lumo:chevron-left"><path d="M346 533l199 210c9 9 23 9 32 0 4-4 7-10 6-17V274C583 261 573 250 561 250c-6 0-12 2-16 7l-199 210c-17 18-17 48 0 66z"></path></g>
<g id="lumo:chevron-right"><path d="M654 533L455 743c-9 9-23 9-32 0C419 739 417 733 417 726V274C417 261 427 250 439 250c6 0 12 2 16 7l199 210c17 18 17 48 0 66z"></path></g>
<g id="lumo:chevron-up"><path d="M533 346l210 199c9 9 9 23 0 32-4 4-10 7-17 6H274C261 583 250 573 250 561c0-6 2-12 7-16l210-199c18-17 48-17 66 0z"></path></g>
<g id="lumo:clock"><path d="M538 489l85 85c15 15 15 38 0 53-15 15-38 15-53 0l-93-93a38 38 0 0 1-2-2C467 525 462 515 462 504V308c0-21 17-38 38-37 21 0 38 17 37 37v181zM500 833c-184 0-333-149-333-333s149-333 333-333 333 149 333 333-149 333-333 333z m0-68c146 0 265-118 265-265 0-146-118-265-265-265-146 0-265 118-265 265 0 146 118 265 265 265z"></path></g>
<g id="lumo:cog"><path d="M833 458l-81-18c-8-25-17-50-29-75L767 292 708 233l-72 49c-21-12-46-25-75-30L542 167h-84l-19 79c-25 8-50 17-71 30L296 233 233 296l47 69c-12 21-21 46-29 71L167 458v84l84 25c8 25 17 50 29 75L233 708 292 767l76-44c21 12 46 25 75 29L458 833h84l19-81c25-8 50-17 75-29L708 767l59-59-44-66c12-21 25-46 29-75L833 542v-84z m-333 217c-96 0-175-79-175-175 0-96 79-175 175-175 96 0 175 79 175 175 0 96-79 175-175 175z"></path></g>
<g id="lumo:cross"><path d="M445 500l-142-141c-15-15-15-40 0-56 15-15 40-15 56 0L500 445l141-142c15-15 40-15 56 0 15 15 15 40 0 56L555 500l142 141c15 15 15 40 0 56-15 15-40 15-56 0L500 555l-141 142c-15 15-40 15-56 0-15-15-15-40 0-56L445 500z"></path></g>
<g id="lumo:download"><path d="M538 521l125-112c15-14 39-12 53 4 14 15 12 39-4 53l-187 166a38 38 0 0 1 0 0c-14 13-36 12-50 0l-187-166c-15-14-17-37-4-53 14-15 37-17 53-4L462 521V188c0-21 17-38 38-38s38 17 37 38v333zM758 704c0-21 17-38 38-37 21 0 38 17 37 37v92c0 21-17 38-37 37H204c-21 0-38-17-37-37v-92c0-21 17-38 37-37s38 17 38 37v54h516v-54z"></path></g>
<g id="lumo:dropdown"><path d="M317 393c-15-14-39-13-53 3-14 15-13 39 3 53l206 189c14 13 36 13 50 0l210-193c15-14 17-38 3-53-14-15-38-17-53-3l-185 171L317 393z"></path></g>
<g id="lumo:edit"><path d="M673 281l62 56-205 233c-9 10-38 24-85 39a8 8 0 0 1-5 0c-4-1-7-6-6-10l0 0c14-47 25-76 35-86l204-232z m37-42l52-59c15-17 41-18 58-2 17 16 18 42 3 59L772 295l-62-56zM626 208l-67 75h-226C305 283 283 306 283 333v334C283 695 306 717 333 717h334c28 0 50-22 50-50v-185L792 398v269C792 736 736 792 667 792H333C264 792 208 736 208 667V333C208 264 264 208 333 208h293z"></path></g>
<g id="lumo:error"><path d="M500 833c-184 0-333-149-333-333s149-333 333-333 333 149 333 333-149 333-333 333z m0-68c146 0 265-118 265-265 0-146-118-265-265-265-146 0-265 118-265 265 0 146 118 265 265 265zM479 292h42c12 0 21 9 20 20l-11 217c0 8-6 13-13 13h-34c-7 0-13-6-13-13l-11-217C459 301 468 292 479 292zM483 608h34c12 0 21 9 20 21v33c0 12-9 21-20 21h-34c-12 0-21-9-21-21v-33c0-12 9-21 21-21z"></path></g>
<g id="lumo:eye"><path d="M500 750c-187 0-417-163-417-250s230-250 417-250 417 163 417 250-230 250-417 250z m-336-231c20 22 47 46 78 69C322 644 411 678 500 678s178-34 258-90c31-22 59-46 78-69 6-7 12-14 16-19-4-6-9-12-16-19-20-22-47-46-78-69C678 356 589 322 500 322s-178 34-258 90c-31 22-59 46-78 69-6 7-12 14-16 19 4 6 9 12 16 19zM500 646c-81 0-146-65-146-146s65-146 146-146 146 65 146 146-65 146-146 146z m0-75c39 0 71-32 71-71 0-39-32-71-71-71-39 0-71 32-71 71 0 39 32 71 71 71z"></path></g>
<g id="lumo:eye-disabled"><path d="M396 735l60-60c15 2 30 3 44 3 89 0 178-34 258-90 31-22 59-46 78-69 6-7 12-14 16-19-4-6-9-12-16-19-20-22-47-46-78-69-8-5-15-11-23-15l50-51C862 397 917 458 917 500c0 87-230 250-417 250-34 0-69-5-104-15zM215 654C138 603 83 542 83 500c0-87 230-250 417-250 34 0 69 5 104 15l-59 60c-15-2-30-3-45-3-89 0-178 34-258 90-31 22-59 46-78 69-6 7-12 14-16 19 4 6 9 12 16 19 20 22 47 46 78 69 8 5 16 11 24 16L215 654z m271-9l159-159c0 5 1 9 1 14 0 81-65 146-146 146-5 0-9 0-14-1z m-131-131C354 510 354 505 354 500c0-81 65-146 146-146 5 0 10 0 14 1l-159 159z m-167 257L780 179c12-12 32-12 44 0 12 12 12 32 0 44L232 815c-12 12-32 12-44 0s-12-32 0-44z"></path></g>
<g id="lumo:menu"><path d="M167 292c0-23 19-42 41-42h584C815 250 833 268 833 292c0 23-19 42-41 41H208C185 333 167 315 167 292z m0 208c0-23 19-42 41-42h584C815 458 833 477 833 500c0 23-19 42-41 42H208C185 542 167 523 167 500z m0 208c0-23 19-42 41-41h584C815 667 833 685 833 708c0 23-19 42-41 42H208C185 750 167 732 167 708z"></path></g>
<g id="lumo:minus"><path d="M261 461c-22 0-39 18-39 39 0 22 18 39 39 39h478c22 0 39-18 39-39 0-22-18-39-39-39H261z"></path></g>
<g id="lumo:ordered-list"><path d="M138 333V198H136l-43 28v-38l45-31h45V333H138z m-61 128c0-35 27-59 68-59 39 0 66 21 66 53 0 20-11 37-43 64l-29 27v2h74V583H80v-30l55-52c26-24 32-33 33-43 0-13-10-22-24-22-15 0-26 10-26 25v1h-41v-1zM123 759v-31h21c15 0 25-8 25-21 0-13-10-21-25-21-15 0-26 9-26 23h-41c1-34 27-56 68-57 39 0 66 20 66 49 0 20-14 36-33 39v3c24 3 40 19 39 41 0 32-30 54-73 54-41 0-69-22-70-57h43c1 13 11 22 28 22 16 0 27-9 27-22 0-14-10-22-28-22h-21zM333 258c0-18 15-33 34-33h516c18 0 33 15 34 33 0 18-15 33-34 34H367c-18 0-33-15-34-34z m0 250c0-18 15-33 34-33h516c18 0 33 15 34 33s-15 33-34 34H367c-18 0-33-15-34-34z m0 250c0-18 15-33 34-33h516c18 0 33 15 34 33s-15 33-34 34H367c-18 0-33-15-34-34z"></path></g>
<g id="lumo:phone"><path d="M296 208l42-37c17-15 44-13 58 4a42 42 0 0 1 5 7L459 282c12 20 5 45-15 57l-7 4c-17 10-25 30-19 48l20 66a420 420 0 0 0 93 157l41 45c13 14 35 17 51 8l7-5c20-12 45-5 57 16L745 777c12 20 5 45-15 57a42 42 0 0 1-8 4l-52 17c-61 21-129 4-174-43l-50-52c-81-85-141-189-175-302l-24-78c-19-62 0-129 49-172z"></path></g>
<g id="lumo:photo"><path d="M208 167h584c69 0 125 56 125 125v416c0 69-56 125-125 125H208c-69 0-125-56-125-125V292c0-69 56-125 125-125z m584 75H208c-28 0-50 22-50 50v416c0 28 22 50 50 50h584c28 0 50-22 50-50V292c0-28-22-50-50-50zM239 740l167-167c12-12 31-14 45-6l73 43 172-201c13-15 34-18 50-7l95 67v92l-111-78-169 199c-12 14-32 17-47 8l-76-43-111 111H229c2-7 5-13 10-18zM458 427C458 490 407 542 344 542S229 490 229 427c0-63 51-115 115-115S458 364 458 427z m-62 0C396 398 373 375 344 375S292 398 292 427c0 29 23 52 52 52s52-23 52-52z"></path></g>
<g id="lumo:play"><path d="M689 528l-298 175c-13 8-34 8-48 0-6-4-10-9-10-14V311C333 300 348 292 367 292c9 0 17 2 24 5l298 175c26 15 26 40 0 56z"></path></g>
<g id="lumo:plus"><path d="M461 461H261c-22 0-39 18-39 39 0 22 18 39 39 39h200v200c0 22 18 39 39 39 22 0 39-18 39-39v-200h200c22 0 39-18 39-39 0-22-18-39-39-39h-200V261c0-22-18-39-39-39-22 0-39 18-39 39v200z"></path></g>
<g id="lumo:redo"><path d="M290 614C312 523 393 458 491 458c55 0 106 22 144 57l-88 88c-3 3-5 7-5 11 0 8 6 15 15 15l193-5c17 0 31-15 31-32l5-192c0-4-1-8-4-11-6-6-16-6-22 0l-66 67C641 406 570 375 491 375c-136 0-248 90-281 215-1 2-1 5-1 8-8 44 45 68 73 32 4-5 7-11 8-16z"></path></g>
<g id="lumo:reload"><path d="M500 233V137c0-9 7-16 15-16 4 0 8 2 10 4l133 140c12 12 12 32 0 45l-133 140c-6 6-15 6-21 0C502 447 500 443 500 438V308c-117 0-212 95-212 213 0 117 95 212 212 212 117 0 212-95 212-212 0-21 17-38 38-38s38 17 37 38c0 159-129 288-287 287-159 0-288-129-288-287 0-159 129-288 288-288z"></path></g>
<g id="lumo:search"><path d="M662 603l131 131c16 16 16 42 0 59-16 16-43 16-59 0l-131-131C562 691 512 708 458 708c-138 0-250-112-250-250 0-138 112-250 250-250 138 0 250 112 250 250 0 54-17 104-46 145zM458 646c104 0 188-84 188-188S562 271 458 271 271 355 271 458s84 188 187 188z"></path></g>
<g id="lumo:undo"><path d="M710 614C688 523 607 458 509 458c-55 0-106 22-144 57l88 88c3 3 5 7 5 11 0 8-6 15-15 15l-193-5c-17 0-31-15-31-32L214 400c0-4 1-8 4-11 6-6 16-6 22 0l66 67C359 406 430 375 509 375c136 0 248 90 281 215 1 2 1 5 1 8 8 44-45 68-73 32-4-5-7-11-8-16z"></path></g>
<g id="lumo:unordered-list"><path d="M146 325c-42 0-67-26-67-63 0-37 25-63 67-63 42 0 67 26 67 63 0 37-25 63-67 63z m0 250c-42 0-67-26-67-63 0-37 25-63 67-63 42 0 67 26 67 63 0 37-25 63-67 63z m0 250c-42 0-67-26-67-63 0-37 25-63 67-63 42 0 67 26 67 63 0 37-25 63-67 63zM333 258c0-18 15-33 34-33h516c18 0 33 15 34 33 0 18-15 33-34 34H367c-18 0-33-15-34-34z m0 250c0-18 15-33 34-33h516c18 0 33 15 34 33s-15 33-34 34H367c-18 0-33-15-34-34z m0 250c0-18 15-33 34-33h516c18 0 33 15 34 33s-15 33-34 34H367c-18 0-33-15-34-34z"></path></g>
<g id="lumo:upload"><path d="M454 271V604c0 21-17 38-37 38s-38-17-38-38V271L254 382c-15 14-39 12-53-3-14-15-12-39 3-53L391 160c14-13 36-13 51-1 0 0 0 0 0 1l187 166c15 14 17 37 3 53-14 15-37 17-53 3L454 271zM675 704c0-21 17-38 37-37 21 0 38 17 38 37v92c0 21-17 38-38 37H121c-21 0-38-17-38-37v-92c0-21 17-38 38-37s38 17 37 37v54h517v-54z"></path></g>
<g id="lumo:user"><path d="M500 500c-69 0-125-56-125-125s56-125 125-125 125 56 125 125-56 125-125 125z m-292 292c0-115 131-208 292-209s292 93 292 209H208z"></path></g>
</defs>
</svg>
</vaadin-iconset>`;document.head.appendChild(template.content);var BadgeType=($=>($.NONE="NONE",$.INFO="INFO",$.SUCCESS="SUCCESS",$.WARNING="WARNING",$.DANGER="DANGER",$))(BadgeType||{}),ActionType=($=>($.Primary="Primary",$.Secondary="Secondary",$))(ActionType||{}),__defProp$8=Object.defineProperty,__getOwnPropDesc$8=Object.getOwnPropertyDescriptor,__decorateClass$8=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$8(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$8(C,T,K),K};let MateuForm=class extends s$2{constructor(){super(...arguments),this.notificationOpened=!1,this.notificationMessage="",this.fieldsMap=new FieldsMap,this.renderNotification=()=>y$1`${this.notificationMessage}`}getFieldWrapper($){return this.fieldsMap.map.get($)}valueChanged($,C){const T={};T[$]=C,this.data={...this.data,...T},this.runRules()}getValue($){return this.data[$]}runRules(){this.metadata.sections.flatMap($=>$.fieldGroups).flatMap($=>$.fields).map($=>this.fieldsMap.map.get($)).filter($=>$).forEach($=>$.setVisible(!0)),this.rules.forEach($=>this.applyRule($))}applyRule(r){try{const applies=eval(this.buildJs(r.filter));if(applies&&r.action=="Hide"){const $=r.data;this.metadata.sections.flatMap(C=>C.fieldGroups).flatMap(C=>C.fields).filter(C=>$.includes(C.id)).map(C=>this.fieldsMap.map.get(C)).forEach(C=>C.setVisible(!1))}}catch($){}}buildJs($){let C="";for(let T in this.data)C+="const "+T+' = this.getValue("'+T+'");';return C+=""+$,C}connectedCallback(){super.connectedCallback(),this.metadata.sections.flatMap($=>$.fieldGroups.flatMap(C=>C.fields)).forEach($=>this.fieldsMap.map.set($,new FieldWrapper($))),setTimeout(()=>this.runRules())}runAction($){const T=this.metadata.sections.flatMap(V=>V.fieldGroups.flatMap(K=>K.fields)).filter(V=>V.validations.length>0).filter(V=>!this.data[V.id]);if(T.length>0){const V=T.map(K=>K.caption);this.notificationMessage="All mandatory fields must be filled ("+V+")",this.notificationOpened=!0}else{const V=$.target.getAttribute("actionId");this.setLoading(!0),store.dispatch(runStepAction(this.journeyId,this.stepId,V,this.data))}}render(){return y$1`
      <div>
        
        <vaadin-horizontal-layout class="header">
          <div>
            <h1>${this.metadata.title}</h1>
            <h3>${this.metadata.subtitle}</h3>
          </div>
          <vaadin-horizontal-layout style="justify-content: end; flex-grow: 1; align-items: center;" theme="spacing">
            ${this.metadata.actions.map($=>y$1`
            <vaadin-button theme="secondary" @click=${this.runAction} actionId=${$.id}>${$.caption}</vaadin-button>
          `)}
          </vaadin-horizontal-layout>
        </vaadin-horizontal-layout>
          
        ${this.metadata.badges?y$1`
            <div class="badges">
              ${this.metadata.badges.map($=>y$1`<span theme="badge ${this.getThemeForBadgetType($.type)}">${$.message}</span>`)}
            </div>        
        `:""}
        
        ${this.metadata.sections.map($=>y$1`<mateu-section .section="${$}" .formElement=${this}></mateu-section>`)}

        <vaadin-horizontal-layout style="justify-content: end;" theme="spacing">
          <slot></slot>
          ${this.metadata.mainActions.map($=>y$1`
            <vaadin-button theme="${ActionType.Primary==$.type?"primary":"secondary"}" @click=${this.runAction} actionId=${$.id}>${$.caption}</vaadin-button>
          `)}
        </vaadin-horizontal-layout>

        <vaadin-notification
            .opened=${this.notificationOpened}
            position="bottom-end"
            duration="5000"
            theme="error"
            ${notificationRenderer(this.renderNotification)}
        >${this.notificationMessage}</vaadin-notification>
      </div>
    `}getThemeForBadgetType($){switch($){case BadgeType.SUCCESS:return"success";case BadgeType.WARNING:return"warning";case BadgeType.DANGER:return"error";case BadgeType.NONE:return"contrast"}return""}};MateuForm.styles=i$2`
    ${badge}
    
  [theme~='badge'][theme~='warning'] {
    color: #C7BC1D;
    background-color: #FFFCC0;
  }
  [theme~='badge'][theme~='warning'][theme~='primary'] {
    color: #ffffff;
    background-color: #C7BC1D;
  }
  
  .header {
  width: 100%;
  }


    vaadin-button {
        margin-left: 10px;
    }    
    .badges {
      margin-bottom: 10px;
    }
  `;__decorateClass$8([e()],MateuForm.prototype,"metadata",2);__decorateClass$8([e()],MateuForm.prototype,"data",2);__decorateClass$8([e()],MateuForm.prototype,"journeyId",2);__decorateClass$8([e()],MateuForm.prototype,"stepId",2);__decorateClass$8([e()],MateuForm.prototype,"rules",2);__decorateClass$8([e()],MateuForm.prototype,"notificationOpened",2);__decorateClass$8([e()],MateuForm.prototype,"notificationMessage",2);__decorateClass$8([e()],MateuForm.prototype,"fieldsMap",2);__decorateClass$8([e()],MateuForm.prototype,"setLoading",2);MateuForm=__decorateClass$8([e$1("mateu-form")],MateuForm);registerStyles("vaadin-grid",i$2`
    :host {
      font-family: var(--lumo-font-family);
      font-size: var(--lumo-font-size-m);
      line-height: var(--lumo-line-height-s);
      color: var(--lumo-body-text-color);
      background-color: var(--lumo-base-color);
      box-sizing: border-box;
      -webkit-text-size-adjust: 100%;
      -webkit-tap-highlight-color: transparent;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;

      /* For internal use only */
      --_lumo-grid-border-color: var(--lumo-contrast-20pct);
      --_lumo-grid-secondary-border-color: var(--lumo-contrast-10pct);
      --_lumo-grid-border-width: 1px;
      --_lumo-grid-selected-row-color: var(--lumo-primary-color-10pct);
    }

    /* No (outer) border */

    :host(:not([theme~='no-border'])) {
      border: var(--_lumo-grid-border-width) solid var(--_lumo-grid-border-color);
    }

    :host([disabled]) {
      opacity: 0.7;
    }

    /* Cell styles */

    [part~='cell'] {
      min-height: var(--lumo-size-m);
      background-color: var(--lumo-base-color);
    }

    [part~='cell'] ::slotted(vaadin-grid-cell-content) {
      cursor: default;
      padding: var(--lumo-space-xs) var(--lumo-space-m);
    }

    /* Apply row borders by default and introduce the "no-row-borders" variant */
    :host(:not([theme~='no-row-borders'])) [part~='cell']:not([part~='details-cell']) {
      border-top: var(--_lumo-grid-border-width) solid var(--_lumo-grid-secondary-border-color);
    }

    /* Hide first body row top border */
    :host(:not([theme~='no-row-borders'])) [part='row'][first] [part~='cell']:not([part~='details-cell']) {
      border-top: 0;
      min-height: calc(var(--lumo-size-m) - var(--_lumo-grid-border-width));
    }

    /* Focus-ring */

    [part~='row'] {
      position: relative;
    }

    [part~='row']:focus,
    [part~='focused-cell']:focus {
      outline: none;
    }

    :host([navigating]) [part~='row']:focus::before,
    :host([navigating]) [part~='focused-cell']:focus::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      pointer-events: none;
      box-shadow: inset 0 0 0 2px var(--lumo-primary-color-50pct);
    }

    :host([navigating]) [part~='row']:focus::before {
      transform: translateX(calc(-1 * var(--_grid-horizontal-scroll-position)));
      z-index: 3;
    }

    /* Drag and Drop styles */
    :host([dragover])::after {
      content: '';
      position: absolute;
      z-index: 100;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      pointer-events: none;
      box-shadow: inset 0 0 0 2px var(--lumo-primary-color-50pct);
    }

    [part~='row'][dragover] {
      z-index: 100 !important;
    }

    [part~='row'][dragover] [part~='cell'] {
      overflow: visible;
    }

    [part~='row'][dragover] [part~='cell']::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      height: calc(var(--_lumo-grid-border-width) + 2px);
      pointer-events: none;
      background: var(--lumo-primary-color-50pct);
    }

    [part~='row'][dragover] [part~='cell'][last-frozen]::after {
      right: -1px;
    }

    :host([theme~='no-row-borders']) [dragover] [part~='cell']::after {
      height: 2px;
    }

    [part~='row'][dragover='below'] [part~='cell']::after {
      top: 100%;
      bottom: auto;
      margin-top: -1px;
    }

    :host([all-rows-visible]) [part~='row'][last][dragover='below'] [part~='cell']::after {
      height: 1px;
    }

    [part~='row'][dragover='above'] [part~='cell']::after {
      top: auto;
      bottom: 100%;
      margin-bottom: -1px;
    }

    [part~='row'][details-opened][dragover='below'] [part~='cell']:not([part~='details-cell'])::after,
    [part~='row'][details-opened][dragover='above'] [part~='details-cell']::after {
      display: none;
    }

    [part~='row'][dragover][dragover='on-top'] [part~='cell']::after {
      height: 100%;
      opacity: 0.5;
    }

    [part~='row'][dragstart] [part~='cell'] {
      border: none !important;
      box-shadow: none !important;
    }

    [part~='row'][dragstart] [part~='cell'][last-column] {
      border-radius: 0 var(--lumo-border-radius-s) var(--lumo-border-radius-s) 0;
    }

    [part~='row'][dragstart] [part~='cell'][first-column] {
      border-radius: var(--lumo-border-radius-s) 0 0 var(--lumo-border-radius-s);
    }

    #scroller [part~='row'][dragstart]:not([dragstart=''])::after {
      display: block;
      position: absolute;
      left: var(--_grid-drag-start-x);
      top: var(--_grid-drag-start-y);
      z-index: 100;
      content: attr(dragstart);
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding: calc(var(--lumo-space-xs) * 0.8);
      color: var(--lumo-error-contrast-color);
      background-color: var(--lumo-error-color);
      border-radius: var(--lumo-border-radius-m);
      font-family: var(--lumo-font-family);
      font-size: var(--lumo-font-size-xxs);
      line-height: 1;
      font-weight: 500;
      text-transform: initial;
      letter-spacing: initial;
      min-width: calc(var(--lumo-size-s) * 0.7);
      text-align: center;
    }

    /* Headers and footers */

    [part~='header-cell'] ::slotted(vaadin-grid-cell-content),
    [part~='footer-cell'] ::slotted(vaadin-grid-cell-content),
    [part~='reorder-ghost'] {
      font-size: var(--lumo-font-size-s);
      font-weight: 500;
    }

    [part~='footer-cell'] ::slotted(vaadin-grid-cell-content) {
      font-weight: 400;
    }

    [part='row']:only-child [part~='header-cell'] {
      min-height: var(--lumo-size-xl);
    }

    /* Header borders */

    /* Hide first header row top border */
    :host(:not([theme~='no-row-borders'])) [part='row']:first-child [part~='header-cell'] {
      border-top: 0;
    }

    [part='row']:last-child [part~='header-cell'] {
      border-bottom: var(--_lumo-grid-border-width) solid transparent;
    }

    :host(:not([theme~='no-row-borders'])) [part='row']:last-child [part~='header-cell'] {
      border-bottom-color: var(--_lumo-grid-secondary-border-color);
    }

    /* Overflow uses a stronger border color */
    :host([overflow~='top']) [part='row']:last-child [part~='header-cell'] {
      border-bottom-color: var(--_lumo-grid-border-color);
    }

    /* Footer borders */

    [part='row']:first-child [part~='footer-cell'] {
      border-top: var(--_lumo-grid-border-width) solid transparent;
    }

    :host(:not([theme~='no-row-borders'])) [part='row']:first-child [part~='footer-cell'] {
      border-top-color: var(--_lumo-grid-secondary-border-color);
    }

    /* Overflow uses a stronger border color */
    :host([overflow~='bottom']) [part='row']:first-child [part~='footer-cell'] {
      border-top-color: var(--_lumo-grid-border-color);
    }

    /* Column reordering */

    :host([reordering]) [part~='cell'] {
      background: linear-gradient(var(--lumo-shade-20pct), var(--lumo-shade-20pct)) var(--lumo-base-color);
    }

    :host([reordering]) [part~='cell'][reorder-status='allowed'] {
      background: var(--lumo-base-color);
    }

    :host([reordering]) [part~='cell'][reorder-status='dragging'] {
      background: linear-gradient(var(--lumo-contrast-5pct), var(--lumo-contrast-5pct)) var(--lumo-base-color);
    }

    [part~='reorder-ghost'] {
      opacity: 0.85;
      box-shadow: var(--lumo-box-shadow-s);
      /* TODO Use the same styles as for the cell element (reorder-ghost copies styles from the cell element) */
      padding: var(--lumo-space-s) var(--lumo-space-m) !important;
    }

    /* Column resizing */

    [part='resize-handle'] {
      width: 3px;
      background-color: var(--lumo-primary-color-50pct);
      opacity: 0;
      transition: opacity 0.2s;
    }

    :host(:not([reordering])) *:not([column-resizing]) [part~='cell']:hover [part='resize-handle'],
    [part='resize-handle']:active {
      opacity: 1;
      transition-delay: 0.15s;
    }

    /* Column borders */

    :host([theme~='column-borders']) [part~='cell']:not([last-column]):not([part~='details-cell']) {
      border-right: var(--_lumo-grid-border-width) solid var(--_lumo-grid-secondary-border-color);
    }

    /* Frozen columns */

    [last-frozen] {
      border-right: var(--_lumo-grid-border-width) solid transparent;
      overflow: hidden;
    }

    :host([overflow~='start']) [part~='cell'][last-frozen]:not([part~='details-cell']) {
      border-right-color: var(--_lumo-grid-border-color);
    }

    [first-frozen-to-end] {
      border-left: var(--_lumo-grid-border-width) solid transparent;
    }

    :host([overflow~='end']) [part~='cell'][first-frozen-to-end]:not([part~='details-cell']) {
      border-left-color: var(--_lumo-grid-border-color);
    }

    /* Row stripes */

    :host([theme~='row-stripes']) [part~='row']:not([odd]) [part~='body-cell'],
    :host([theme~='row-stripes']) [part~='row']:not([odd]) [part~='details-cell'] {
      background-image: linear-gradient(var(--lumo-contrast-5pct), var(--lumo-contrast-5pct));
      background-repeat: repeat-x;
    }

    /* Selected row */

    /* Raise the selected rows above unselected rows (so that box-shadow can cover unselected rows) */
    :host(:not([reordering])) [part~='row'][selected] {
      z-index: 1;
    }

    :host(:not([reordering])) [part~='row'][selected] [part~='body-cell']:not([part~='details-cell']) {
      background-image: linear-gradient(var(--_lumo-grid-selected-row-color), var(--_lumo-grid-selected-row-color));
      background-repeat: repeat;
    }

    /* Cover the border of an unselected row */
    :host(:not([theme~='no-row-borders'])) [part~='row'][selected] [part~='cell']:not([part~='details-cell']) {
      box-shadow: 0 var(--_lumo-grid-border-width) 0 0 var(--_lumo-grid-selected-row-color);
    }

    /* Compact */

    :host([theme~='compact']) [part='row']:only-child [part~='header-cell'] {
      min-height: var(--lumo-size-m);
    }

    :host([theme~='compact']) [part~='cell'] {
      min-height: var(--lumo-size-s);
    }

    :host([theme~='compact']) [part='row'][first] [part~='cell']:not([part~='details-cell']) {
      min-height: calc(var(--lumo-size-s) - var(--_lumo-grid-border-width));
    }

    :host([theme~='compact']) [part~='cell'] ::slotted(vaadin-grid-cell-content) {
      padding: var(--lumo-space-xs) var(--lumo-space-s);
    }

    /* Wrap cell contents */

    :host([theme~='wrap-cell-content']) [part~='cell'] ::slotted(vaadin-grid-cell-content) {
      white-space: normal;
    }

    /* RTL specific styles */

    :host([dir='rtl']) [part~='row'][dragstart] [part~='cell'][last-column] {
      border-radius: var(--lumo-border-radius-s) 0 0 var(--lumo-border-radius-s);
    }

    :host([dir='rtl']) [part~='row'][dragstart] [part~='cell'][first-column] {
      border-radius: 0 var(--lumo-border-radius-s) var(--lumo-border-radius-s) 0;
    }

    :host([dir='rtl'][theme~='column-borders']) [part~='cell']:not([last-column]):not([part~='details-cell']) {
      border-right: none;
      border-left: var(--_lumo-grid-border-width) solid var(--_lumo-grid-secondary-border-color);
    }

    :host([dir='rtl']) [last-frozen] {
      border-right: none;
      border-left: var(--_lumo-grid-border-width) solid transparent;
    }

    :host([dir='rtl']) [first-frozen-to-end] {
      border-left: none;
      border-right: var(--_lumo-grid-border-width) solid transparent;
    }

    :host([dir='rtl'][overflow~='start']) [part~='cell'][last-frozen]:not([part~='details-cell']) {
      border-left-color: var(--_lumo-grid-border-color);
    }

    :host([dir='rtl'][overflow~='end']) [part~='cell'][first-frozen-to-end]:not([part~='details-cell']) {
      border-right-color: var(--_lumo-grid-border-color);
    }
  `,{moduleId:"lumo-grid"});/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ColumnBaseMixin=$=>class extends ${static get properties(){return{resizable:{type:Boolean,value(){if(this.localName==="vaadin-grid-column-group")return;const T=this.parentNode;return T&&T.localName==="vaadin-grid-column-group"&&T.resizable||!1}},frozen:{type:Boolean,value:!1},frozenToEnd:{type:Boolean,value:!1},hidden:{type:Boolean,value:!1},header:{type:String},textAlign:{type:String},_lastFrozen:{type:Boolean,value:!1},_firstFrozenToEnd:{type:Boolean,value:!1},_order:Number,_reorderStatus:Boolean,_emptyCells:Array,_headerCell:Object,_footerCell:Object,_grid:Object,__initialized:{type:Boolean,value:!0},headerRenderer:Function,_headerRenderer:{type:Function,computed:"_computeHeaderRenderer(headerRenderer, header, __initialized)"},footerRenderer:Function,_footerRenderer:{type:Function,computed:"_computeFooterRenderer(footerRenderer, __initialized)"},__gridColumnElement:{type:Boolean,value:!0}}}static get observers(){return["_widthChanged(width, _headerCell, _footerCell, _cells.*)","_frozenChanged(frozen, _headerCell, _footerCell, _cells.*)","_frozenToEndChanged(frozenToEnd, _headerCell, _footerCell, _cells.*)","_flexGrowChanged(flexGrow, _headerCell, _footerCell, _cells.*)","_textAlignChanged(textAlign, _cells.*, _headerCell, _footerCell)","_orderChanged(_order, _headerCell, _footerCell, _cells.*)","_lastFrozenChanged(_lastFrozen)","_firstFrozenToEndChanged(_firstFrozenToEnd)","_onRendererOrBindingChanged(_renderer, _cells, _cells.*, path)","_onHeaderRendererOrBindingChanged(_headerRenderer, _headerCell, path, header)","_onFooterRendererOrBindingChanged(_footerRenderer, _footerCell)","_resizableChanged(resizable, _headerCell)","_reorderStatusChanged(_reorderStatus, _headerCell, _footerCell, _cells.*)","_hiddenChanged(hidden, _headerCell, _footerCell, _cells.*)"]}connectedCallback(){super.connectedCallback(),requestAnimationFrame(()=>{this._grid&&this._allCells.forEach(T=>{T._content.parentNode||this._grid.appendChild(T._content)})})}disconnectedCallback(){super.disconnectedCallback(),requestAnimationFrame(()=>{this._grid||this._allCells.forEach(T=>{T._content.parentNode&&T._content.parentNode.removeChild(T._content)})}),this._gridValue=void 0}ready(){super.ready(),processTemplates(this)}_findHostGrid(){let T=this;for(;T&&!/^vaadin.*grid(-pro)?$/.test(T.localName);)T=T.assignedSlot?T.assignedSlot.parentNode:T.parentNode;return T||void 0}get _grid(){return this._gridValue||(this._gridValue=this._findHostGrid()),this._gridValue}get _allCells(){return[].concat(this._cells||[]).concat(this._emptyCells||[]).concat(this._headerCell).concat(this._footerCell).filter(T=>T)}_renderHeaderAndFooter(){this._renderHeaderCellContent(this._headerRenderer,this._headerCell),this._renderFooterCellContent(this._footerRenderer,this._footerCell)}_flexGrowChanged(T){this.parentElement&&this.parentElement._columnPropChanged&&this.parentElement._columnPropChanged("flexGrow"),this._allCells.forEach(V=>{V.style.flexGrow=T})}_orderChanged(T){this._allCells.forEach(V=>{V.style.order=T})}_widthChanged(T){this.parentElement&&this.parentElement._columnPropChanged&&this.parentElement._columnPropChanged("width"),this._allCells.forEach(V=>{V.style.width=T})}_frozenChanged(T){this.parentElement&&this.parentElement._columnPropChanged&&this.parentElement._columnPropChanged("frozen",T),this._allCells.forEach(V=>V.toggleAttribute("frozen",T)),this._grid&&this._grid._frozenCellsChanged&&this._grid._frozenCellsChanged()}_frozenToEndChanged(T){this.parentElement&&this.parentElement._columnPropChanged&&this.parentElement._columnPropChanged("frozenToEnd",T),this._allCells.forEach(V=>{this._grid&&V.parentElement===this._grid.$.sizer||V.toggleAttribute("frozen-to-end",T)}),this._grid&&this._grid._frozenCellsChanged&&this._grid._frozenCellsChanged()}_lastFrozenChanged(T){this._allCells.forEach(V=>V.toggleAttribute("last-frozen",T)),this.parentElement&&this.parentElement._columnPropChanged&&(this.parentElement._lastFrozen=T)}_firstFrozenToEndChanged(T){this._allCells.forEach(V=>{this._grid&&V.parentElement===this._grid.$.sizer||V.toggleAttribute("first-frozen-to-end",T)}),this.parentElement&&this.parentElement._columnPropChanged&&(this.parentElement._firstFrozenToEnd=T)}_generateHeader(T){return T.substr(T.lastIndexOf(".")+1).replace(/([A-Z])/g,"-$1").toLowerCase().replace(/-/g," ").replace(/^./,V=>V.toUpperCase())}_reorderStatusChanged(T){this._allCells.forEach(V=>V.setAttribute("reorder-status",T))}_resizableChanged(T,V){T===void 0||V===void 0||V&&[V].concat(this._emptyCells).forEach(K=>{if(K){const Y=K.querySelector('[part~="resize-handle"]');if(Y&&K.removeChild(Y),T){const J=document.createElement("div");J.setAttribute("part","resize-handle"),K.appendChild(J)}}})}_textAlignChanged(T){if(T===void 0)return;if(["start","end","center"].indexOf(T)===-1){console.warn('textAlign can only be set as "start", "end" or "center"');return}let V;getComputedStyle(this._grid).direction==="ltr"?T==="start"?V="left":T==="end"&&(V="right"):T==="start"?V="right":T==="end"&&(V="left"),this._allCells.forEach(K=>{K._content.style.textAlign=T,getComputedStyle(K._content).textAlign!==T&&(K._content.style.textAlign=V)})}_hiddenChanged(T){this.parentElement&&this.parentElement._columnPropChanged&&this.parentElement._columnPropChanged("hidden",T),!!T!=!!this._previousHidden&&this._grid&&(T===!0&&this._allCells.forEach(V=>{V._content.parentNode&&V._content.parentNode.removeChild(V._content)}),this._grid._debouncerHiddenChanged=Debouncer$1.debounce(this._grid._debouncerHiddenChanged,animationFrame,()=>{this._grid&&this._grid._renderColumnTree&&this._grid._renderColumnTree(this._grid._columnTree)}),this._grid._debounceUpdateFrozenColumn&&this._grid._debounceUpdateFrozenColumn(),this._grid._resetKeyboardNavigation&&this._grid._resetKeyboardNavigation()),this._previousHidden=T}_runRenderer(T,V,K){const Y=[V._content,this];K&&K.item&&Y.push(K),T.apply(this,Y)}__renderCellsContent(T,V){this.hidden||!this._grid||V.forEach(K=>{if(!K.parentElement)return;const Y=this._grid.__getRowModel(K.parentElement);T&&(K._renderer!==T&&this._clearCellContent(K),K._renderer=T,(Y.item||T===this._headerRenderer||T===this._footerRenderer)&&this._runRenderer(T,K,Y))})}_clearCellContent(T){T._content.innerHTML="",delete T._content._$litPart$}_renderHeaderCellContent(T,V){!V||!T||(this.__renderCellsContent(T,[V]),this._grid&&V.parentElement&&this._grid.__debounceUpdateHeaderFooterRowVisibility(V.parentElement))}_onHeaderRendererOrBindingChanged(T,V,...K){this._renderHeaderCellContent(T,V)}_renderBodyCellsContent(T,V){!V||!T||this.__renderCellsContent(T,V)}_onRendererOrBindingChanged(T,V,...K){this._renderBodyCellsContent(T,V)}_renderFooterCellContent(T,V){!V||!T||(this.__renderCellsContent(T,[V]),this._grid&&V.parentElement&&this._grid.__debounceUpdateHeaderFooterRowVisibility(V.parentElement))}_onFooterRendererOrBindingChanged(T,V){this._renderFooterCellContent(T,V)}__setTextContent(T,V){T.textContent!==V&&(T.textContent=V)}__textHeaderRenderer(){this.__setTextContent(this._headerCell._content,this.header)}_defaultHeaderRenderer(){this.path&&this.__setTextContent(this._headerCell._content,this._generateHeader(this.path))}_defaultRenderer(T,V,{item:K}){this.path&&this.__setTextContent(T,this.get(this.path,K))}_defaultFooterRenderer(){}_computeHeaderRenderer(T,V){return T||(V!=null?this.__textHeaderRenderer:this._defaultHeaderRenderer)}_computeRenderer(T){return T||this._defaultRenderer}_computeFooterRenderer(T){return T||this._defaultFooterRenderer}};class GridColumn extends ColumnBaseMixin(DirMixin$1(PolymerElement)){static get is(){return"vaadin-grid-column"}static get properties(){return{width:{type:String,value:"100px"},flexGrow:{type:Number,value:1},renderer:Function,_renderer:{type:Function,computed:"_computeRenderer(renderer, __initialized)"},path:{type:String},autoWidth:{type:Boolean,value:!1},_focusButtonMode:{type:Boolean,value:!1},_cells:Array}}}customElements.define(GridColumn.is,GridColumn);/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */registerStyles("vaadin-grid",i$2`
    @keyframes vaadin-grid-appear {
      to {
        opacity: 1;
      }
    }

    :host {
      display: block;
      animation: 1ms vaadin-grid-appear;
      height: 400px;
      flex: 1 1 auto;
      align-self: stretch;
      position: relative;
    }

    :host([hidden]) {
      display: none !important;
    }

    :host([disabled]) {
      pointer-events: none;
    }

    #scroller {
      display: block;
      transform: translateY(0);
      width: auto;
      height: auto;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }

    :host([all-rows-visible]) {
      height: auto;
      align-self: flex-start;
      flex-grow: 0;
      width: 100%;
    }

    :host([all-rows-visible]) #scroller {
      width: 100%;
      height: 100%;
      position: relative;
    }

    :host([all-rows-visible]) #items {
      min-height: 1px;
    }

    #table {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      overflow: auto;
      position: relative;
      outline: none;
      /* Workaround for a Desktop Safari bug: new stacking context here prevents the scrollbar from getting hidden */
      z-index: 0;
    }

    #header,
    #footer {
      display: block;
      position: -webkit-sticky;
      position: sticky;
      left: 0;
      overflow: visible;
      width: 100%;
      z-index: 1;
    }

    #header {
      top: 0;
    }

    th {
      text-align: inherit;
    }

    /* Safari doesn't work with "inherit" */
    [safari] th {
      text-align: initial;
    }

    #footer {
      bottom: 0;
    }

    #items {
      flex-grow: 1;
      flex-shrink: 0;
      display: block;
      position: -webkit-sticky;
      position: sticky;
      width: 100%;
      left: 0;
      overflow: visible;
    }

    [part~='row'] {
      display: flex;
      width: 100%;
      box-sizing: border-box;
      margin: 0;
    }

    [part~='row'][loading] [part~='body-cell'] ::slotted(vaadin-grid-cell-content) {
      opacity: 0;
    }

    #items [part~='row'] {
      position: absolute;
    }

    #items [part~='row']:empty {
      height: 100%;
    }

    [part~='cell']:not([part~='details-cell']) {
      flex-shrink: 0;
      flex-grow: 1;
      box-sizing: border-box;
      display: flex;
      width: 100%;
      position: relative;
      align-items: center;
      padding: 0;
      white-space: nowrap;
    }

    [part~='cell'] > [tabindex] {
      display: flex;
      align-items: inherit;
      outline: none;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }

    [part~='details-cell'] {
      position: absolute;
      bottom: 0;
      width: 100%;
      box-sizing: border-box;
      padding: 0;
    }

    [part~='cell'] ::slotted(vaadin-grid-cell-content) {
      display: block;
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    [hidden] {
      display: none !important;
    }

    [frozen],
    [frozen-to-end] {
      z-index: 2;
      will-change: transform;
    }

    [no-scrollbars][safari] #table,
    [no-scrollbars][firefox] #table {
      overflow: hidden;
    }

    /* Reordering styles */
    :host([reordering]) [part~='cell'] ::slotted(vaadin-grid-cell-content),
    :host([reordering]) [part~='resize-handle'],
    #scroller[no-content-pointer-events] [part~='cell'] ::slotted(vaadin-grid-cell-content) {
      pointer-events: none;
    }

    [part~='reorder-ghost'] {
      visibility: hidden;
      position: fixed;
      pointer-events: none;
      opacity: 0.5;

      /* Prevent overflowing the grid in Firefox */
      top: 0;
      left: 0;
    }

    :host([reordering]) {
      -moz-user-select: none;
      -webkit-user-select: none;
      user-select: none;
    }

    /* Resizing styles */
    [part~='resize-handle'] {
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
      cursor: col-resize;
      z-index: 1;
    }

    [part~='resize-handle']::before {
      position: absolute;
      content: '';
      height: 100%;
      width: 35px;
      transform: translateX(-50%);
    }

    [last-column] [part~='resize-handle']::before,
    [last-frozen] [part~='resize-handle']::before {
      width: 18px;
      transform: none;
      right: 0;
    }

    [frozen-to-end] [part~='resize-handle'] {
      left: 0;
      right: auto;
    }

    [frozen-to-end] [part~='resize-handle']::before {
      left: 0;
      right: auto;
    }

    [first-frozen-to-end] [part~='resize-handle']::before {
      width: 18px;
      transform: none;
    }

    [first-frozen-to-end] {
      margin-inline-start: auto;
    }

    /* Hide resize handle if scrolled to end */
    :host(:not([overflow~='end'])) [first-frozen-to-end] [part~='resize-handle'] {
      display: none;
    }

    #scroller[column-resizing] {
      -ms-user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
      user-select: none;
    }

    /* Sizer styles */
    #sizer {
      display: flex;
      position: absolute;
      visibility: hidden;
    }

    #sizer [part~='details-cell'] {
      display: none !important;
    }

    #sizer [part~='cell'][hidden] {
      display: none !important;
    }

    #sizer [part~='cell'] {
      display: block;
      flex-shrink: 0;
      line-height: 0;
      height: 0 !important;
      min-height: 0 !important;
      max-height: 0 !important;
      padding: 0 !important;
      border: none !important;
    }

    #sizer [part~='cell']::before {
      content: '-';
    }

    #sizer [part~='cell'] ::slotted(vaadin-grid-cell-content) {
      display: none !important;
    }

    /* RTL specific styles */

    :host([dir='rtl']) #items,
    :host([dir='rtl']) #header,
    :host([dir='rtl']) #footer {
      left: auto;
    }

    :host([dir='rtl']) [part~='reorder-ghost'] {
      left: auto;
      right: 0;
    }

    :host([dir='rtl']) [part~='resize-handle'] {
      left: 0;
      right: auto;
    }

    :host([dir='rtl']) [part~='resize-handle']::before {
      transform: translateX(50%);
    }

    :host([dir='rtl']) [last-column] [part~='resize-handle']::before,
    :host([dir='rtl']) [last-frozen] [part~='resize-handle']::before {
      left: 0;
      right: auto;
    }

    :host([dir='rtl']) [frozen-to-end] [part~='resize-handle'] {
      right: 0;
      left: auto;
    }

    :host([dir='rtl']) [frozen-to-end] [part~='resize-handle']::before {
      right: 0;
      left: auto;
    }
  `,{moduleId:"vaadin-grid-styles"});/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const A11yMixin=$=>class extends ${static get observers(){return["_a11yUpdateGridSize(size, _columnTree, _columnTree.*)"]}_a11yGetHeaderRowCount(T){return T.filter(V=>V.some(K=>K.headerRenderer||K.path||K.header)).length}_a11yGetFooterRowCount(T){return T.filter(V=>V.some(K=>K.headerRenderer)).length}_a11yUpdateGridSize(T,V){if(T===void 0||V===void 0)return;const K=V[V.length-1];this.$.table.setAttribute("aria-rowcount",T+this._a11yGetHeaderRowCount(V)+this._a11yGetFooterRowCount(V)),this.$.table.setAttribute("aria-colcount",K&&K.length||0),this._a11yUpdateHeaderRows(),this._a11yUpdateFooterRows()}_a11yUpdateHeaderRows(){Array.from(this.$.header.children).forEach((T,V)=>T.setAttribute("aria-rowindex",V+1))}_a11yUpdateFooterRows(){Array.from(this.$.footer.children).forEach((T,V)=>T.setAttribute("aria-rowindex",this._a11yGetHeaderRowCount(this._columnTree)+this.size+V+1))}_a11yUpdateRowRowindex(T,V){T.setAttribute("aria-rowindex",V+this._a11yGetHeaderRowCount(this._columnTree)+1)}_a11yUpdateRowSelected(T,V){T.setAttribute("aria-selected",Boolean(V)),Array.from(T.children).forEach(K=>K.setAttribute("aria-selected",Boolean(V)))}_a11yUpdateRowExpanded(T){this.__isRowExpandable(T)?T.setAttribute("aria-expanded","false"):this.__isRowCollapsible(T)?T.setAttribute("aria-expanded","true"):T.removeAttribute("aria-expanded")}_a11yUpdateRowLevel(T,V){V>0||this.__isRowCollapsible(T)||this.__isRowExpandable(T)?T.setAttribute("aria-level",V+1):T.removeAttribute("aria-level")}_a11ySetRowDetailsCell(T,V){Array.from(T.children).forEach(K=>{K!==V&&K.setAttribute("aria-controls",V.id)})}_a11yUpdateCellColspan(T,V){T.setAttribute("aria-colspan",Number(V))}_a11yUpdateSorters(){Array.from(this.querySelectorAll("vaadin-grid-sorter")).forEach(T=>{let V=T.parentNode;for(;V&&V.localName!=="vaadin-grid-cell-content";)V=V.parentNode;V&&V.assignedSlot&&V.assignedSlot.parentNode.setAttribute("aria-sort",{asc:"ascending",desc:"descending"}[String(T.direction)]||"none")})}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ActiveItemMixin=$=>class extends ${static get properties(){return{activeItem:{type:Object,notify:!0,value:null}}}ready(){super.ready(),this.$.scroller.addEventListener("click",this._onClick.bind(this)),this.addEventListener("cell-activate",this._activateItem.bind(this)),this.addEventListener("row-activate",this._activateItem.bind(this))}_activateItem(T){const V=T.detail.model,K=V?V.item:null;K&&(this.activeItem=this._itemsEqual(this.activeItem,K)?null:K)}_onClick(T){if(T.defaultPrevented)return;const V=T.composedPath(),K=V[V.indexOf(this.$.table)-3];if(!K||K.getAttribute("part").indexOf("details-cell")>-1)return;const Y=K._content,J=this.getRootNode().activeElement;!Y.contains(J)&&!this._isFocusable(T.target)&&!(T.target instanceof HTMLLabelElement)&&this.dispatchEvent(new CustomEvent("cell-activate",{detail:{model:this.__getRowModel(K.parentElement)}}))}_isFocusable(T){return isFocusable(T)}},isFocusable=$=>{if(!$.parentNode)return!1;const T=Array.from($.parentNode.querySelectorAll("[tabindex], button, input, select, textarea, object, iframe, a[href], area[href]")).filter(V=>{const K=V.getAttribute("part");return!(K&&K.includes("body-cell"))}).includes($);return!$.disabled&&T&&$.offsetParent&&getComputedStyle($).visibility!=="hidden"};function get($,C){return $.split(".").reduce((T,V)=>T[V],C)}function checkPaths($,C,T){if(T.length===0)return!1;let V=!0;return $.forEach(({path:K})=>{if(!K||K.indexOf(".")===-1)return;const Y=K.replace(/\.[^.]*$/,"");get(Y,T[0])===void 0&&(console.warn(`Path "${K}" used for ${C} does not exist in all of the items, ${C} is disabled.`),V=!1)}),V}function multiSort($,C){return $.sort((T,V)=>C.map(K=>K.direction==="asc"?compare(get(K.path,T),get(K.path,V)):K.direction==="desc"?compare(get(K.path,V),get(K.path,T)):0).reduce((K,Y)=>K!==0?K:Y,0))}function normalizeEmptyValue($){return[void 0,null].indexOf($)>=0?"":isNaN($)?$.toString():$}function compare($,C){return $=normalizeEmptyValue($),C=normalizeEmptyValue(C),$<C?-1:$>C?1:0}function filter($,C){return $.filter(T=>C.every(V=>{const K=normalizeEmptyValue(get(V.path,T)),Y=normalizeEmptyValue(V.value).toString().toLowerCase();return K.toString().toLowerCase().includes(Y)}))}const createArrayDataProvider=$=>(C,T)=>{let V=$?[...$]:[];C.filters&&checkPaths(C.filters,"filtering",V)&&(V=filter(V,C.filters)),Array.isArray(C.sortOrders)&&C.sortOrders.length&&checkPaths(C.sortOrders,"sorting",V)&&(V=multiSort(V,C.sortOrders));const K=Math.min(V.length,C.pageSize),Y=C.page*K,J=Y+K,ee=V.slice(Y,J);T(ee,V.length)};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ArrayDataProviderMixin=$=>class extends ${static get properties(){return{items:Array}}static get observers(){return["__dataProviderOrItemsChanged(dataProvider, items, isAttached, items.*, _filters, _sorters)"]}__setArrayDataProvider(T){const V=createArrayDataProvider(this.items);V.__items=T,this.setProperties({_arrayDataProvider:V,size:T.length,dataProvider:V})}__dataProviderOrItemsChanged(T,V,K){K&&(this._arrayDataProvider?T!==this._arrayDataProvider?this.setProperties({_arrayDataProvider:void 0,items:void 0}):V?this._arrayDataProvider.__items===V?(this.clearCache(),this.size=this._effectiveSize):this.__setArrayDataProvider(V):(this.setProperties({_arrayDataProvider:void 0,dataProvider:void 0,size:0}),this.clearCache()):V&&this.__setArrayDataProvider(V))}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */function updateColumnOrders($,C,T){let V=1;$.forEach(K=>{V%10===0&&(V+=1),K._order=T+V*C,V+=1})}/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ColumnReorderingMixin=$=>class extends ${static get properties(){return{columnReorderingAllowed:{type:Boolean,value:!1},_orderBaseScope:{type:Number,value:1e7}}}static get observers(){return["_updateOrders(_columnTree)"]}ready(){super.ready(),addListener$1(this,"track",this._onTrackEvent),this._reorderGhost=this.shadowRoot.querySelector('[part="reorder-ghost"]'),this.addEventListener("touchstart",this._onTouchStart.bind(this)),this.addEventListener("touchmove",this._onTouchMove.bind(this)),this.addEventListener("touchend",this._onTouchEnd.bind(this)),this.addEventListener("contextmenu",this._onContextMenu.bind(this))}_onContextMenu(T){this.hasAttribute("reordering")&&(T.preventDefault(),isTouch||this._onTrackEnd())}_onTouchStart(T){this._startTouchReorderTimeout=setTimeout(()=>{this._onTrackStart({detail:{x:T.touches[0].clientX,y:T.touches[0].clientY}})},100)}_onTouchMove(T){this._draggedColumn&&T.preventDefault(),clearTimeout(this._startTouchReorderTimeout)}_onTouchEnd(){clearTimeout(this._startTouchReorderTimeout),this._onTrackEnd()}_onTrackEvent(T){if(T.detail.state==="start"){const V=T.composedPath(),K=V[V.indexOf(this.$.header)-2];if(!K||!K._content||K._content.contains(this.getRootNode().activeElement)||this.$.scroller.hasAttribute("column-resizing"))return;this._touchDevice||this._onTrackStart(T)}else T.detail.state==="track"?this._onTrack(T):T.detail.state==="end"&&this._onTrackEnd(T)}_onTrackStart(T){if(!this.columnReorderingAllowed)return;const V=T.composedPath&&T.composedPath();if(V&&V.some(Y=>Y.hasAttribute&&Y.hasAttribute("draggable")))return;const K=this._cellFromPoint(T.detail.x,T.detail.y);if(!(!K||!K.getAttribute("part").includes("header-cell"))){for(this.toggleAttribute("reordering",!0),this._draggedColumn=K._column;this._draggedColumn.parentElement.childElementCount===1;)this._draggedColumn=this._draggedColumn.parentElement;this._setSiblingsReorderStatus(this._draggedColumn,"allowed"),this._draggedColumn._reorderStatus="dragging",this._updateGhost(K),this._reorderGhost.style.visibility="visible",this._updateGhostPosition(T.detail.x,this._touchDevice?T.detail.y-50:T.detail.y),this._autoScroller()}}_onTrack(T){if(!this._draggedColumn)return;const V=this._cellFromPoint(T.detail.x,T.detail.y);if(!V)return;const K=this._getTargetColumn(V,this._draggedColumn);if(this._isSwapAllowed(this._draggedColumn,K)&&this._isSwappableByPosition(K,T.detail.x)){const Y=this._columnTree.findIndex(re=>re.includes(K)),J=this._getColumnsInOrder(Y),ee=J.indexOf(this._draggedColumn),te=J.indexOf(K),ie=ee<te?1:-1;for(let re=ee;re!==te;re+=ie)this._swapColumnOrders(this._draggedColumn,J[re+ie])}this._updateGhostPosition(T.detail.x,this._touchDevice?T.detail.y-50:T.detail.y),this._lastDragClientX=T.detail.x}_onTrackEnd(){this._draggedColumn&&(this.toggleAttribute("reordering",!1),this._draggedColumn._reorderStatus="",this._setSiblingsReorderStatus(this._draggedColumn,""),this._draggedColumn=null,this._lastDragClientX=null,this._reorderGhost.style.visibility="hidden",this.dispatchEvent(new CustomEvent("column-reorder",{detail:{columns:this._getColumnsInOrder()}})))}_getColumnsInOrder(T=this._columnTree.length-1){return this._columnTree[T].filter(V=>!V.hidden).sort((V,K)=>V._order-K._order)}_cellFromPoint(T,V){T=T||0,V=V||0,this._draggedColumn||this.$.scroller.toggleAttribute("no-content-pointer-events",!0);const K=this.shadowRoot.elementFromPoint(T,V);if(this.$.scroller.toggleAttribute("no-content-pointer-events",!1),K&&K._column)return K}_updateGhostPosition(T,V){const K=this._reorderGhost.getBoundingClientRect(),Y=T-K.width/2,J=V-K.height/2,ee=parseInt(this._reorderGhost._left||0),te=parseInt(this._reorderGhost._top||0);this._reorderGhost._left=ee-(K.left-Y),this._reorderGhost._top=te-(K.top-J),this._reorderGhost.style.transform=`translate(${this._reorderGhost._left}px, ${this._reorderGhost._top}px)`}_updateGhost(T){const V=this._reorderGhost;V.textContent=T._content.innerText;const K=window.getComputedStyle(T);return["boxSizing","display","width","height","background","alignItems","padding","border","flex-direction","overflow"].forEach(Y=>{V.style[Y]=K[Y]}),V}_updateOrders(T){T!==void 0&&(T[0].forEach(V=>{V._order=0}),updateColumnOrders(T[0],this._orderBaseScope,0))}_setSiblingsReorderStatus(T,V){Array.from(T.parentNode.children).filter(K=>/column/.test(K.localName)&&this._isSwapAllowed(K,T)).forEach(K=>{K._reorderStatus=V})}_autoScroller(){if(this._lastDragClientX){const T=this._lastDragClientX-this.getBoundingClientRect().right+50,V=this.getBoundingClientRect().left-this._lastDragClientX+50;T>0?this.$.table.scrollLeft+=T/10:V>0&&(this.$.table.scrollLeft-=V/10)}this._draggedColumn&&setTimeout(()=>this._autoScroller(),10)}_isSwapAllowed(T,V){if(T&&V){const K=T!==V,Y=T.parentElement===V.parentElement,J=T.frozen&&V.frozen||T.frozenToEnd&&V.frozenToEnd||!T.frozen&&!T.frozenToEnd&&!V.frozen&&!V.frozenToEnd;return K&&Y&&J}}_isSwappableByPosition(T,V){const K=Array.from(this.$.header.querySelectorAll('tr:not([hidden]) [part~="cell"]')).find(ee=>T.contains(ee._column)),Y=this.$.header.querySelector("tr:not([hidden]) [reorder-status=dragging]").getBoundingClientRect(),J=K.getBoundingClientRect();return J.left>Y.left?V>J.right-Y.width:V<J.left+Y.width}_swapColumnOrders(T,V){[T._order,V._order]=[V._order,T._order],this._debounceUpdateFrozenColumn(),this._updateFirstAndLastColumn()}_getTargetColumn(T,V){if(T&&V){let K=T._column;for(;K.parentElement!==V.parentElement&&K!==this;)K=K.parentElement;return K.parentElement===V.parentElement?K:T._column}}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ColumnResizingMixin=$=>class extends ${ready(){super.ready();const T=this.$.scroller;addListener$1(T,"track",this._onHeaderTrack.bind(this)),T.addEventListener("touchmove",V=>T.hasAttribute("column-resizing")&&V.preventDefault()),T.addEventListener("contextmenu",V=>V.target.getAttribute("part")==="resize-handle"&&V.preventDefault()),T.addEventListener("mousedown",V=>V.target.getAttribute("part")==="resize-handle"&&V.preventDefault())}_onHeaderTrack(T){const V=T.target;if(V.getAttribute("part")==="resize-handle"){let Y=V.parentElement._column;for(this.$.scroller.toggleAttribute("column-resizing",!0);Y.localName==="vaadin-grid-column-group";)Y=Y._childColumns.slice(0).sort((re,se)=>re._order-se._order).filter(re=>!re.hidden).pop();const J=T.detail.x,ee=Array.from(this.$.header.querySelectorAll('[part~="row"]:last-child [part~="cell"]')),te=ee.find(re=>re._column===Y);if(te.offsetWidth){const re=getComputedStyle(te._content),se=10+parseInt(re.paddingLeft)+parseInt(re.paddingRight)+parseInt(re.borderLeftWidth)+parseInt(re.borderRightWidth)+parseInt(re.marginLeft)+parseInt(re.marginRight);let oe;const ae=te.offsetWidth,ne=te.getBoundingClientRect();te.hasAttribute("frozen-to-end")?oe=ae+(this.__isRTL?J-ne.right:ne.left-J):oe=ae+(this.__isRTL?ne.left-J:J-ne.right),Y.width=`${Math.max(se,oe)}px`,Y.flexGrow=0}ee.sort((re,se)=>re._column._order-se._column._order).forEach((re,se,oe)=>{se<oe.indexOf(te)&&(re._column.width=`${re.offsetWidth}px`,re._column.flexGrow=0)});const ie=this._frozenToEndCells[0];if(ie&&this.$.table.scrollWidth>this.$.table.offsetWidth){const re=ie.getBoundingClientRect(),se=J-(this.__isRTL?re.right:re.left);(this.__isRTL&&se<=0||!this.__isRTL&&se>=0)&&(this.$.table.scrollLeft+=se)}T.detail.state==="end"&&(this.$.scroller.toggleAttribute("column-resizing",!1),this.dispatchEvent(new CustomEvent("column-resize",{detail:{resizedColumn:Y}}))),this._resizeHandler()}}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ItemCache=class Ce{constructor(C,T,V){this.grid=C,this.parentCache=T,this.parentItem=V,this.itemCaches={},this.items={},this.effectiveSize=0,this.size=0,this.pendingRequests={}}isLoading(){return Boolean(Object.keys(this.pendingRequests).length||Object.keys(this.itemCaches).filter(C=>this.itemCaches[C].isLoading())[0])}getItemForIndex(C){const{cache:T,scaledIndex:V}=this.getCacheAndIndex(C);return T.items[V]}updateSize(){this.effectiveSize=!this.parentItem||this.grid._isExpanded(this.parentItem)?this.size+Object.keys(this.itemCaches).reduce((C,T)=>{const V=this.itemCaches[T];return V.updateSize(),C+V.effectiveSize},0):0}ensureSubCacheForScaledIndex(C){if(!this.itemCaches[C]){const T=new Ce(this.grid,this,this.items[C]);this.itemCaches[C]=T,this.grid._loadPage(0,T)}}getCacheAndIndex(C){let T=C;const V=Object.keys(this.itemCaches);for(let K=0;K<V.length;K++){const Y=Number(V[K]),J=this.itemCaches[Y];if(T<=Y)return{cache:this,scaledIndex:T};if(T<=Y+J.effectiveSize)return J.getCacheAndIndex(T-Y-1);T-=J.effectiveSize}return{cache:this,scaledIndex:T}}},DataProviderMixin=$=>class extends ${static get properties(){return{size:{type:Number,notify:!0},pageSize:{type:Number,value:50,observer:"_pageSizeChanged"},dataProvider:{type:Object,notify:!0,observer:"_dataProviderChanged"},loading:{type:Boolean,notify:!0,readOnly:!0,reflectToAttribute:!0},_cache:{type:Object,value(){return new ItemCache(this)}},_hasData:{type:Boolean,value:!1},itemHasChildrenPath:{type:String,value:"children"},itemIdPath:{type:String,value:null},expandedItems:{type:Object,notify:!0,value:()=>[]},__expandedKeys:{type:Object,computed:"__computeExpandedKeys(itemIdPath, expandedItems.*)"}}}static get observers(){return["_sizeChanged(size)","_expandedItemsChanged(expandedItems.*)"]}_sizeChanged(T){const V=T-this._cache.size;this._cache.size+=V,this._cache.effectiveSize+=V,this._effectiveSize=this._cache.effectiveSize}_getItem(T,V){if(T>=this._effectiveSize)return;V.index=T;const{cache:K,scaledIndex:Y}=this._cache.getCacheAndIndex(T),J=K.items[Y];J?(V.toggleAttribute("loading",!1),this._updateItem(V,J),this._isExpanded(J)&&K.ensureSubCacheForScaledIndex(Y)):(V.toggleAttribute("loading",!0),this._loadPage(this._getPageForIndex(Y),K))}getItemId(T){return this.itemIdPath?this.get(this.itemIdPath,T):T}_isExpanded(T){return this.__expandedKeys.has(this.getItemId(T))}_expandedItemsChanged(){this._cache.updateSize(),this._effectiveSize=this._cache.effectiveSize,this.__updateVisibleRows()}__computeExpandedKeys(T,V){const K=V.base||[],Y=new Set;return K.forEach(J=>{Y.add(this.getItemId(J))}),Y}expandItem(T){this._isExpanded(T)||(this.expandedItems=[...this.expandedItems,T])}collapseItem(T){this._isExpanded(T)&&(this.expandedItems=this.expandedItems.filter(V=>!this._itemsEqual(V,T)))}_getIndexLevel(T){let{cache:V}=this._cache.getCacheAndIndex(T),K=0;for(;V.parentCache;)V=V.parentCache,K+=1;return K}_loadPage(T,V){if(!V.pendingRequests[T]&&this.dataProvider){this._setLoading(!0),V.pendingRequests[T]=!0;const K={page:T,pageSize:this.pageSize,sortOrders:this._mapSorters(),filters:this._mapFilters(),parentItem:V.parentItem};this.dataProvider(K,(Y,J)=>{J!==void 0?V.size=J:K.parentItem&&(V.size=Y.length);const ee=Array.from(this.$.items.children).map(te=>te._item);Y.forEach((te,ie)=>{const re=T*this.pageSize+ie;V.items[re]=te,this._isExpanded(te)&&ee.indexOf(te)>-1&&V.ensureSubCacheForScaledIndex(re)}),this._hasData=!0,delete V.pendingRequests[T],this._debouncerApplyCachedData=Debouncer$1.debounce(this._debouncerApplyCachedData,timeOut.after(0),()=>{this._setLoading(!1),this._cache.updateSize(),this._effectiveSize=this._cache.effectiveSize,Array.from(this.$.items.children).filter(te=>!te.hidden).forEach(te=>{this._cache.getItemForIndex(te.index)&&this._getItem(te.index,te)}),this.__scrollToPendingIndex()}),this._cache.isLoading()||this._debouncerApplyCachedData.flush(),this.__itemsReceived()})}}_getPageForIndex(T){return Math.floor(T/this.pageSize)}clearCache(){this._cache=new ItemCache(this),this._cache.size=this.size||0,this._cache.updateSize(),this._hasData=!1,this.__updateVisibleRows(),this._effectiveSize||this._loadPage(0,this._cache)}_pageSizeChanged(T,V){V!==void 0&&T!==V&&this.clearCache()}_checkSize(){this.size===void 0&&this._effectiveSize===0&&console.warn("The <vaadin-grid> needs the total number of items in order to display rows. Set the total number of items to the `size` property, or provide the total number of items in the second argument of the `dataProvider`’s `callback` call.")}_dataProviderChanged(T,V){V!==void 0&&this.clearCache(),this._ensureFirstPageLoaded(),this._debouncerCheckSize=Debouncer$1.debounce(this._debouncerCheckSize,timeOut.after(2e3),this._checkSize.bind(this))}_ensureFirstPageLoaded(){this._hasData||this._loadPage(0,this._cache)}_itemsEqual(T,V){return this.getItemId(T)===this.getItemId(V)}_getItemIndexInArray(T,V){let K=-1;return V.forEach((Y,J)=>{this._itemsEqual(Y,T)&&(K=J)}),K}scrollToIndex(T){super.scrollToIndex(T),!isNaN(T)&&(this._cache.isLoading()||!this.clientHeight)&&(this.__pendingScrollToIndex=T)}__scrollToPendingIndex(){if(this.__pendingScrollToIndex&&this.$.items.children.length){const T=this.__pendingScrollToIndex;delete this.__pendingScrollToIndex,this.scrollToIndex(T)}}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const DropMode={BETWEEN:"between",ON_TOP:"on-top",ON_TOP_OR_BETWEEN:"on-top-or-between",ON_GRID:"on-grid"},DropLocation={ON_TOP:"on-top",ABOVE:"above",BELOW:"below",EMPTY:"empty"},usesDnDPolyfill=!("draggable"in document.createElement("div")),DragAndDropMixin=$=>class extends ${static get properties(){return{dropMode:String,rowsDraggable:Boolean,dragFilter:Function,dropFilter:Function,__dndAutoScrollThreshold:{value:50}}}static get observers(){return["_dragDropAccessChanged(rowsDraggable, dropMode, dragFilter, dropFilter, loading)"]}ready(){super.ready(),this.$.table.addEventListener("dragstart",this._onDragStart.bind(this)),this.$.table.addEventListener("dragend",this._onDragEnd.bind(this)),this.$.table.addEventListener("dragover",this._onDragOver.bind(this)),this.$.table.addEventListener("dragleave",this._onDragLeave.bind(this)),this.$.table.addEventListener("drop",this._onDrop.bind(this)),this.$.table.addEventListener("dragenter",T=>{this.dropMode&&(T.preventDefault(),T.stopPropagation())})}_onDragStart(T){if(this.rowsDraggable){let V=T.target;if(V.localName==="vaadin-grid-cell-content"&&(V=V.assignedSlot.parentNode.parentNode),V.parentNode!==this.$.items)return;if(T.stopPropagation(),this.toggleAttribute("dragging-rows",!0),this._safari){const ee=V.style.transform;V.style.top=/translateY\((.*)\)/.exec(ee)[1],V.style.transform="none",requestAnimationFrame(()=>{V.style.top="",V.style.transform=ee})}const K=V.getBoundingClientRect();usesDnDPolyfill?T.dataTransfer.setDragImage(V):T.dataTransfer.setDragImage(V,T.clientX-K.left,T.clientY-K.top);let Y=[V];this._isSelected(V._item)&&(Y=this.__getViewportRows().filter(ee=>this._isSelected(ee._item)).filter(ee=>!this.dragFilter||this.dragFilter(this.__getRowModel(ee)))),T.dataTransfer.setData("text",this.__formatDefaultTransferData(Y)),V.setAttribute("dragstart",Y.length>1?Y.length:""),this.style.setProperty("--_grid-drag-start-x",`${T.clientX-K.left+20}px`),this.style.setProperty("--_grid-drag-start-y",`${T.clientY-K.top+10}px`),requestAnimationFrame(()=>{V.removeAttribute("dragstart"),this.updateStyles({"--_grid-drag-start-x":"","--_grid-drag-start-y":""})});const J=new CustomEvent("grid-dragstart",{detail:{draggedItems:Y.map(ee=>ee._item),setDragData:(ee,te)=>T.dataTransfer.setData(ee,te),setDraggedItemsCount:ee=>V.setAttribute("dragstart",ee)}});J.originalEvent=T,this.dispatchEvent(J)}}_onDragEnd(T){this.toggleAttribute("dragging-rows",!1),T.stopPropagation();const V=new CustomEvent("grid-dragend");V.originalEvent=T,this.dispatchEvent(V)}_onDragLeave(T){T.stopPropagation(),this._clearDragStyles()}_onDragOver(T){if(this.dropMode){if(this._dropLocation=void 0,this._dragOverItem=void 0,this.__dndAutoScroll(T.clientY)){this._clearDragStyles();return}let V=T.composedPath().find(K=>K.localName==="tr");if(!this._effectiveSize||this.dropMode===DropMode.ON_GRID)this._dropLocation=DropLocation.EMPTY;else if(!V||V.parentNode!==this.$.items){if(V)return;if(this.dropMode===DropMode.BETWEEN||this.dropMode===DropMode.ON_TOP_OR_BETWEEN)V=Array.from(this.$.items.children).filter(K=>!K.hidden).pop(),this._dropLocation=DropLocation.BELOW;else return}else{const K=V.getBoundingClientRect();if(this._dropLocation=DropLocation.ON_TOP,this.dropMode===DropMode.BETWEEN){const Y=T.clientY-K.top<K.bottom-T.clientY;this._dropLocation=Y?DropLocation.ABOVE:DropLocation.BELOW}else this.dropMode===DropMode.ON_TOP_OR_BETWEEN&&(T.clientY-K.top<K.height/3?this._dropLocation=DropLocation.ABOVE:T.clientY-K.top>K.height/3*2&&(this._dropLocation=DropLocation.BELOW))}if(V&&V.hasAttribute("drop-disabled")){this._dropLocation=void 0;return}T.stopPropagation(),T.preventDefault(),this._dropLocation===DropLocation.EMPTY?this.toggleAttribute("dragover",!0):V?(this._dragOverItem=V._item,V.getAttribute("dragover")!==this._dropLocation&&V.setAttribute("dragover",this._dropLocation)):this._clearDragStyles()}}__dndAutoScroll(T){if(this.__dndAutoScrolling)return!0;const V=this.$.header.getBoundingClientRect().bottom,K=this.$.footer.getBoundingClientRect().top,Y=V-T+this.__dndAutoScrollThreshold,J=T-K+this.__dndAutoScrollThreshold;let ee=0;if(J>0?ee=J*2:Y>0&&(ee=-Y*2),ee){const te=this.$.table.scrollTop;if(this.$.table.scrollTop+=ee,te!==this.$.table.scrollTop)return this.__dndAutoScrolling=!0,setTimeout(()=>{this.__dndAutoScrolling=!1},20),!0}}__getViewportRows(){const T=this.$.header.getBoundingClientRect().bottom,V=this.$.footer.getBoundingClientRect().top;return Array.from(this.$.items.children).filter(K=>{const Y=K.getBoundingClientRect();return Y.bottom>T&&Y.top<V})}_clearDragStyles(){this.removeAttribute("dragover"),Array.from(this.$.items.children).forEach(T=>T.removeAttribute("dragover"))}_onDrop(T){if(this.dropMode){T.stopPropagation(),T.preventDefault();const V=T.dataTransfer.types&&Array.from(T.dataTransfer.types).map(Y=>({type:Y,data:T.dataTransfer.getData(Y)}));this._clearDragStyles();const K=new CustomEvent("grid-drop",{bubbles:T.bubbles,cancelable:T.cancelable,detail:{dropTargetItem:this._dragOverItem,dropLocation:this._dropLocation,dragData:V}});K.originalEvent=T,this.dispatchEvent(K)}}__formatDefaultTransferData(T){return T.map(V=>Array.from(V.children).filter(K=>!K.hidden&&K.getAttribute("part").indexOf("details-cell")===-1).sort((K,Y)=>K._column._order>Y._column._order?1:-1).map(K=>K._content.textContent.trim()).filter(K=>K).join("	")).join(`
`)}_dragDropAccessChanged(){this.filterDragAndDrop()}filterDragAndDrop(){Array.from(this.$.items.children).filter(T=>!T.hidden).forEach(T=>{this._filterDragAndDrop(T,this.__getRowModel(T))})}_filterDragAndDrop(T,V){const K=this.loading||T.hasAttribute("loading"),Y=!this.rowsDraggable||K||this.dragFilter&&!this.dragFilter(V),J=!this.dropMode||K||this.dropFilter&&!this.dropFilter(V);Array.from(T.children).map(te=>te._content).forEach(te=>{Y?te.removeAttribute("draggable"):te.setAttribute("draggable",!0)}),T.toggleAttribute("drag-disabled",!!Y),T.toggleAttribute("drop-disabled",!!J)}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */function arrayEquals($,C){if(!$||!C||$.length!==C.length)return!1;for(let T=0,V=$.length;T<V;T++)if($[T]instanceof Array&&C[T]instanceof Array){if(!arrayEquals($[T],C[T]))return!1}else if($[T]!==C[T])return!1;return!0}const DynamicColumnsMixin=$=>class extends ${static get properties(){return{_columnTree:Object}}ready(){super.ready(),this._addNodeObserver()}_hasColumnGroups(T){for(let V=0;V<T.length;V++)if(T[V].localName==="vaadin-grid-column-group")return!0;return!1}_getChildColumns(T){return FlattenedNodesObserver.getFlattenedNodes(T).filter(this._isColumnElement)}_flattenColumnGroups(T){return T.map(V=>V.localName==="vaadin-grid-column-group"?this._getChildColumns(V):[V]).reduce((V,K)=>V.concat(K),[])}_getColumnTree(){const T=FlattenedNodesObserver.getFlattenedNodes(this).filter(this._isColumnElement),V=[T];let K=T;for(;this._hasColumnGroups(K);)K=this._flattenColumnGroups(K),V.push(K);return V}_updateColumnTree(){const T=this._getColumnTree();arrayEquals(T,this._columnTree)||(this._columnTree=T)}_addNodeObserver(){this._observer=new FlattenedNodesObserver(this,T=>{const V=K=>K.filter(this._isColumnElement).length>0;if(V(T.addedNodes)||V(T.removedNodes)){const K=T.removedNodes.flatMap(J=>J._allCells),Y=J=>K.filter(ee=>ee._content.contains(J)).length;this.__removeSorters(this._sorters.filter(Y)),this.__removeFilters(this._filters.filter(Y)),this._updateColumnTree()}this._debouncerCheckImports=Debouncer$1.debounce(this._debouncerCheckImports,timeOut.after(2e3),this._checkImports.bind(this)),this._ensureFirstPageLoaded()})}_checkImports(){["vaadin-grid-column-group","vaadin-grid-filter","vaadin-grid-filter-column","vaadin-grid-tree-toggle","vaadin-grid-selection-column","vaadin-grid-sort-column","vaadin-grid-sorter"].forEach(T=>{const V=this.querySelector(T);V&&!(V instanceof PolymerElement)&&console.warn(`Make sure you have imported the required module for <${T}> element.`)})}_updateFirstAndLastColumn(){Array.from(this.shadowRoot.querySelectorAll("tr")).forEach(T=>this._updateFirstAndLastColumnForRow(T))}_updateFirstAndLastColumnForRow(T){Array.from(T.querySelectorAll('[part~="cell"]:not([part~="details-cell"])')).sort((V,K)=>V._column._order-K._column._order).forEach((V,K,Y)=>{V.toggleAttribute("first-column",K===0),V.toggleAttribute("last-column",K===Y.length-1)})}_isColumnElement(T){return T.nodeType===Node.ELEMENT_NODE&&/\bcolumn\b/.test(T.localName)}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const EventContextMixin=$=>class extends ${getEventContext(T){const V={},K=T.__composedPath||T.composedPath(),Y=K[K.indexOf(this.$.table)-3];return Y&&(V.section=["body","header","footer","details"].find(J=>Y.getAttribute("part").indexOf(J)>-1),Y._column&&(V.column=Y._column),(V.section==="body"||V.section==="details")&&Object.assign(V,this.__getRowModel(Y.parentElement))),V}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const FilterMixin=$=>class extends ${static get properties(){return{_filters:{type:Array,value:()=>[]}}}ready(){super.ready(),this.addEventListener("filter-changed",this._filterChanged.bind(this))}_filterChanged(T){T.stopPropagation(),this.__addFilter(T.target),this.__applyFilters()}__removeFilters(T){T.length!==0&&(this._filters=this._filters.filter(V=>T.indexOf(V)<0),this.__applyFilters())}__addFilter(T){this._filters.indexOf(T)===-1&&this._filters.push(T)}__applyFilters(){this.dataProvider&&this.isAttached&&this.clearCache()}_mapFilters(){return this._filters.map(T=>({path:T.path,value:T.value}))}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const KeyboardNavigationMixin=$=>class extends ${static get properties(){return{_headerFocusable:{type:Object,observer:"_focusableChanged"},_itemsFocusable:{type:Object,observer:"_focusableChanged"},_footerFocusable:{type:Object,observer:"_focusableChanged"},_navigatingIsHidden:Boolean,_focusedItemIndex:{type:Number,value:0},_focusedColumnOrder:Number,_focusedCell:{type:Object,observer:"_focusedCellChanged"},interacting:{type:Boolean,value:!1,reflectToAttribute:!0,readOnly:!0,observer:"_interactingChanged"}}}ready(){super.ready(),!(this._ios||this._android)&&(this.addEventListener("keydown",this._onKeyDown),this.addEventListener("keyup",this._onKeyUp),this.addEventListener("focusin",this._onFocusIn),this.addEventListener("focusout",this._onFocusOut),this.$.table.addEventListener("focusin",this._onContentFocusIn.bind(this)),this.addEventListener("mousedown",()=>{this.toggleAttribute("navigating",!1),this._isMousedown=!0,this._focusedColumnOrder=void 0}),this.addEventListener("mouseup",()=>{this._isMousedown=!1}))}get __rowFocusMode(){return this.__isRow(this._itemsFocusable)||this.__isRow(this._headerFocusable)||this.__isRow(this._footerFocusable)}set __rowFocusMode(T){["_itemsFocusable","_footerFocusable","_headerFocusable"].forEach(V=>{const K=this[V];if(T){const Y=K&&K.parentElement;this.__isCell(K)?this[V]=Y:this.__isCell(Y)&&(this[V]=Y.parentElement)}else if(!T&&this.__isRow(K)){const Y=K.firstElementChild;this[V]=Y._focusButton||Y}})}_focusableChanged(T,V){V&&V.setAttribute("tabindex","-1"),T&&this._updateGridSectionFocusTarget(T)}_focusedCellChanged(T,V){V&&removeValueFromAttribute(V,"part","focused-cell"),T&&addValueToAttribute(T,"part","focused-cell")}_interactingChanged(){this._updateGridSectionFocusTarget(this._headerFocusable),this._updateGridSectionFocusTarget(this._itemsFocusable),this._updateGridSectionFocusTarget(this._footerFocusable)}__updateItemsFocusable(){if(!this._itemsFocusable)return;const T=this.shadowRoot.activeElement===this._itemsFocusable;this._getVisibleRows().forEach(V=>{if(V.index===this._focusedItemIndex)if(this.__rowFocusMode)this._itemsFocusable=V;else{let K=this._itemsFocusable.parentElement,Y=this._itemsFocusable;if(K){this.__isCell(K)&&(Y=K,K=K.parentElement);const J=[...K.children].indexOf(Y);this._itemsFocusable=this.__getFocusable(V,V.children[J])}}}),T&&this._itemsFocusable.focus()}_onKeyDown(T){const V=T.key;let K;switch(V){case"ArrowUp":case"ArrowDown":case"ArrowLeft":case"ArrowRight":case"PageUp":case"PageDown":case"Home":case"End":K="Navigation";break;case"Enter":case"Escape":case"F2":K="Interaction";break;case"Tab":K="Tab";break;case" ":K="Space";break}this._detectInteracting(T),this.interacting&&K!=="Interaction"&&(K=void 0),K&&this[`_on${K}KeyDown`](T,V)}_ensureScrolledToIndex(T){[...this.$.items.children].find(K=>K.index===T)?this.__scrollIntoViewport(T):this.scrollToIndex(T)}__isRowExpandable(T){if(this.itemHasChildrenPath){const V=T._item;return V&&this.get(this.itemHasChildrenPath,V)&&!this._isExpanded(V)}}__isRowCollapsible(T){return this._isExpanded(T._item)}__isDetailsCell(T){return T.matches('[part~="details-cell"]')}__isCell(T){return T instanceof HTMLTableCellElement}__isRow(T){return T instanceof HTMLTableRowElement}__getIndexOfChildElement(T){return Array.prototype.indexOf.call(T.parentNode.children,T)}_onNavigationKeyDown(T,V){T.preventDefault();const K=this._lastVisibleIndex-this._firstVisibleIndex-1;let Y=0,J=0;switch(V){case"ArrowRight":Y=this.__isRTL?-1:1;break;case"ArrowLeft":Y=this.__isRTL?1:-1;break;case"Home":this.__rowFocusMode||T.ctrlKey?J=-1/0:Y=-1/0;break;case"End":this.__rowFocusMode||T.ctrlKey?J=1/0:Y=1/0;break;case"ArrowDown":J=1;break;case"ArrowUp":J=-1;break;case"PageDown":J=K;break;case"PageUp":J=-K;break}const ee=T.composedPath().find(se=>this.__isRow(se)),te=T.composedPath().find(se=>this.__isCell(se));if(this.__rowFocusMode&&!ee||!this.__rowFocusMode&&!te)return;const ie=this.__isRTL?"ArrowLeft":"ArrowRight",re=this.__isRTL?"ArrowRight":"ArrowLeft";if(V===ie){if(this.__rowFocusMode){if(this.__isRowExpandable(ee)){this.expandItem(ee._item);return}this.__rowFocusMode=!1,this._onCellNavigation(ee.firstElementChild,0,0);return}}else if(V===re)if(this.__rowFocusMode){if(this.__isRowCollapsible(ee)){this.collapseItem(ee._item);return}}else{const se=[...ee.children].sort((oe,ae)=>oe._order-ae._order);if(te===se[0]||this.__isDetailsCell(te)){this.__rowFocusMode=!0,this._onRowNavigation(ee,0);return}}this.__rowFocusMode?this._onRowNavigation(ee,J):this._onCellNavigation(te,Y,J)}_onRowNavigation(T,V){const{dstRow:K}=this.__navigateRows(V,T);K&&K.focus()}__getIndexInGroup(T,V){return T.parentNode===this.$.items?V!==void 0?V:T.index:this.__getIndexOfChildElement(T)}__navigateRows(T,V,K){const Y=this.__getIndexInGroup(V,this._focusedItemIndex),J=V.parentNode,ee=(J===this.$.items?this._effectiveSize:J.children.length)-1;let te=Math.max(0,Math.min(Y+T,ee));if(J!==this.$.items){if(te>Y)for(;te<ee&&J.children[te].hidden;)te+=1;else if(te<Y)for(;te>0&&J.children[te].hidden;)te-=1;return this.toggleAttribute("navigating",!0),{dstRow:J.children[te]}}let ie=!1;if(K){const re=this.__isDetailsCell(K);if(J===this.$.items){const se=V._item,oe=this._cache.getItemForIndex(te);re?ie=T===0:ie=T===1&&this._isDetailsOpened(se)||T===-1&&te!==Y&&this._isDetailsOpened(oe),ie!==re&&(T===1&&ie||T===-1&&!ie)&&(te=Y)}}return this._ensureScrolledToIndex(te),this._focusedItemIndex=te,this.toggleAttribute("navigating",!0),{dstRow:[...J.children].find(re=>!re.hidden&&re.index===te),dstIsRowDetails:ie}}_onCellNavigation(T,V,K){const Y=T.parentNode,{dstRow:J,dstIsRowDetails:ee}=this.__navigateRows(K,Y,T);if(!J)return;const te=this.__getIndexOfChildElement(T),ie=this.__isDetailsCell(T),re=Y.parentNode,se=this.__getIndexInGroup(Y,this._focusedItemIndex);if(this._focusedColumnOrder===void 0&&(ie?this._focusedColumnOrder=0:this._focusedColumnOrder=this._getColumns(re,se).filter(oe=>!oe.hidden)[te]._order),ee)[...J.children].find(ae=>this.__isDetailsCell(ae)).focus();else{const oe=this.__getIndexInGroup(J,this._focusedItemIndex),ae=this._getColumns(re,oe).filter(pe=>!pe.hidden),ne=ae.map(pe=>pe._order).sort((pe,me)=>pe-me),le=ne.length-1,ce=ne.indexOf(ne.slice(0).sort((pe,me)=>Math.abs(pe-this._focusedColumnOrder)-Math.abs(me-this._focusedColumnOrder))[0]),de=K===0&&ie?ce:Math.max(0,Math.min(ce+V,le));de!==ce&&(this._focusedColumnOrder=void 0);const ue=ae.reduce((pe,me,ge)=>(pe[me._order]=ge,pe),{})[ne[de]],fe=J.children[ue];this._scrollHorizontallyToCell(fe),fe.focus()}}_onInteractionKeyDown(T,V){const K=T.composedPath()[0],Y=K.localName==="input"&&!/^(button|checkbox|color|file|image|radio|range|reset|submit)$/i.test(K.type);let J;switch(V){case"Enter":J=this.interacting?!Y:!0;break;case"Escape":J=!1;break;case"F2":J=!this.interacting;break}const{cell:ee}=this._getGridEventLocation(T);if(this.interacting!==J&&ee!==null)if(J){const te=ee._content.querySelector("[focus-target]")||[...ee._content.querySelectorAll("*")].find(ie=>this._isFocusable(ie));te&&(T.preventDefault(),te.focus(),this._setInteracting(!0),this.toggleAttribute("navigating",!1))}else T.preventDefault(),this._focusedColumnOrder=void 0,ee.focus(),this._setInteracting(!1),this.toggleAttribute("navigating",!0);V==="Escape"&&this._hideTooltip(!0)}_predictFocusStepTarget(T,V){const K=[this.$.table,this._headerFocusable,this._itemsFocusable,this._footerFocusable,this.$.focusexit];let Y=K.indexOf(T);for(Y+=V;Y>=0&&Y<=K.length-1;){let J=K[Y];if(J&&!this.__rowFocusMode&&(J=K[Y].parentNode),!J||J.hidden)Y+=V;else break}return K[Y]}_onTabKeyDown(T){const V=this._predictFocusStepTarget(T.composedPath()[0],T.shiftKey?-1:1);if(V){if(T.stopPropagation(),V===this.$.table)this.$.table.focus();else if(V===this.$.focusexit)this.$.focusexit.focus();else if(V===this._itemsFocusable){let K=V;const Y=this.__isRow(V)?V:V.parentNode;if(this._ensureScrolledToIndex(this._focusedItemIndex),Y.index!==this._focusedItemIndex&&this.__isCell(V)){const J=Array.from(Y.children).indexOf(this._itemsFocusable),ee=Array.from(this.$.items.children).find(te=>!te.hidden&&te.index===this._focusedItemIndex);ee&&(K=ee.children[J])}T.preventDefault(),K.focus()}else T.preventDefault(),V.focus();this.toggleAttribute("navigating",!0)}}_onSpaceKeyDown(T){T.preventDefault();const V=T.composedPath()[0],K=this.__isRow(V);(K||!V._content||!V._content.firstElementChild)&&this.dispatchEvent(new CustomEvent(K?"row-activate":"cell-activate",{detail:{model:this.__getRowModel(K?V:V.parentElement)}}))}_onKeyUp(T){if(!/^( |SpaceBar)$/.test(T.key)||this.interacting)return;T.preventDefault();const V=T.composedPath()[0];if(V._content&&V._content.firstElementChild){const K=this.hasAttribute("navigating");V._content.firstElementChild.dispatchEvent(new MouseEvent("click",{shiftKey:T.shiftKey,bubbles:!0,composed:!0,cancelable:!0})),this.toggleAttribute("navigating",K)}}_onFocusIn(T){this._isMousedown||this.toggleAttribute("navigating",!0);const V=T.composedPath()[0];V===this.$.table||V===this.$.focusexit?(this._predictFocusStepTarget(V,V===this.$.table?1:-1).focus(),this._setInteracting(!1)):this._detectInteracting(T)}_onFocusOut(T){this.toggleAttribute("navigating",!1),this._detectInteracting(T),this._hideTooltip(),this._focusedCell=null}_onContentFocusIn(T){const{section:V,cell:K,row:Y}=this._getGridEventLocation(T);if(!(!K&&!this.__rowFocusMode)){if(this._detectInteracting(T),V&&(K||Y))if(this._activeRowGroup=V,this.$.header===V?this._headerFocusable=this.__getFocusable(Y,K):this.$.items===V?this._itemsFocusable=this.__getFocusable(Y,K):this.$.footer===V&&(this._footerFocusable=this.__getFocusable(Y,K)),K){const J=this.getEventContext(T);K.dispatchEvent(new CustomEvent("cell-focus",{bubbles:!0,composed:!0,detail:{context:J}})),this._focusedCell=K._focusButton||K,isKeyboardActive()&&T.target===K&&this._showTooltip(T)}else this._focusedCell=null;this._detectFocusedItemIndex(T)}}__getFocusable(T,V){return this.__rowFocusMode?T:V._focusButton||V}_detectInteracting(T){const V=T.composedPath().some(K=>K.localName==="vaadin-grid-cell-content");this._setInteracting(V),this.__updateHorizontalScrollPosition()}_detectFocusedItemIndex(T){const{section:V,row:K}=this._getGridEventLocation(T);V===this.$.items&&(this._focusedItemIndex=K.index)}_updateGridSectionFocusTarget(T){if(!T)return;const V=this._getGridSectionFromFocusTarget(T),K=this.interacting&&V===this._activeRowGroup;T.tabIndex=K?-1:0}_preventScrollerRotatingCellFocus(T,V){T.index===this._focusedItemIndex&&this.hasAttribute("navigating")&&this._activeRowGroup===this.$.items&&(this._navigatingIsHidden=!0,this.toggleAttribute("navigating",!1)),V===this._focusedItemIndex&&this._navigatingIsHidden&&(this._navigatingIsHidden=!1,this.toggleAttribute("navigating",!0))}_getColumns(T,V){let K=this._columnTree.length-1;return T===this.$.header?K=V:T===this.$.footer&&(K=this._columnTree.length-1-V),this._columnTree[K]}__isValidFocusable(T){return this.$.table.contains(T)&&T.offsetHeight}_resetKeyboardNavigation(){if(["header","footer"].forEach(T=>{if(!this.__isValidFocusable(this[`_${T}Focusable`])){const V=[...this.$[T].children].find(Y=>Y.offsetHeight),K=V?[...V.children].find(Y=>!Y.hidden):null;V&&K&&(this[`_${T}Focusable`]=this.__getFocusable(V,K))}}),!this.__isValidFocusable(this._itemsFocusable)&&this.$.items.firstElementChild){const T=this.__getFirstVisibleItem(),V=T?[...T.children].find(K=>!K.hidden):null;V&&T&&(delete this._focusedColumnOrder,this._itemsFocusable=this.__getFocusable(T,V))}else this.__updateItemsFocusable()}_scrollHorizontallyToCell(T){if(T.hasAttribute("frozen")||T.hasAttribute("frozen-to-end")||this.__isDetailsCell(T))return;const V=T.getBoundingClientRect(),K=T.parentNode,Y=Array.from(K.children).indexOf(T),J=this.$.table.getBoundingClientRect();let ee=J.left,te=J.right;for(let ie=Y-1;ie>=0;ie--){const re=K.children[ie];if(!(re.hasAttribute("hidden")||this.__isDetailsCell(re))&&(re.hasAttribute("frozen")||re.hasAttribute("frozen-to-end"))){ee=re.getBoundingClientRect().right;break}}for(let ie=Y+1;ie<K.children.length;ie++){const re=K.children[ie];if(!(re.hasAttribute("hidden")||this.__isDetailsCell(re))&&(re.hasAttribute("frozen")||re.hasAttribute("frozen-to-end"))){te=re.getBoundingClientRect().left;break}}V.left<ee&&(this.$.table.scrollLeft+=Math.round(V.left-ee)),V.right>te&&(this.$.table.scrollLeft+=Math.round(V.right-te))}_getGridEventLocation(T){const V=T.composedPath(),K=V.indexOf(this.$.table),Y=K>=1?V[K-1]:null,J=K>=2?V[K-2]:null,ee=K>=3?V[K-3]:null;return{section:Y,row:J,cell:ee}}_getGridSectionFromFocusTarget(T){return T===this._headerFocusable?this.$.header:T===this._itemsFocusable?this.$.items:T===this._footerFocusable?this.$.footer:null}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const RowDetailsMixin=$=>class extends ${static get properties(){return{detailsOpenedItems:{type:Array,value:()=>[]},rowDetailsRenderer:Function,_detailsCells:{type:Array}}}static get observers(){return["_detailsOpenedItemsChanged(detailsOpenedItems.*, rowDetailsRenderer)","_rowDetailsRendererChanged(rowDetailsRenderer)"]}ready(){super.ready(),this._detailsCellResizeObserver=new ResizeObserver(T=>{T.forEach(({target:V})=>{this._updateDetailsCellHeight(V.parentElement)}),this.__virtualizer.__adapter._resizeHandler()})}_rowDetailsRendererChanged(T){T&&this._columnTree&&Array.from(this.$.items.children).forEach(V=>{if(!V.querySelector("[part~=details-cell]")){this._updateRow(V,this._columnTree[this._columnTree.length-1]);const K=this._isDetailsOpened(V._item);this._toggleDetailsCell(V,K)}})}_detailsOpenedItemsChanged(T,V){T.path==="detailsOpenedItems.length"||!T.value||[...this.$.items.children].forEach(K=>{if(K.hasAttribute("details-opened")){this._updateItem(K,K._item);return}V&&this._isDetailsOpened(K._item)&&this._updateItem(K,K._item)})}_configureDetailsCell(T){T.setAttribute("part","cell details-cell"),T.toggleAttribute("frozen",!0),this._detailsCellResizeObserver.observe(T)}_toggleDetailsCell(T,V){const K=T.querySelector('[part~="details-cell"]');K&&(K.hidden=!V,!K.hidden&&this.rowDetailsRenderer&&(K._renderer=this.rowDetailsRenderer))}_updateDetailsCellHeight(T){const V=T.querySelector('[part~="details-cell"]');V&&(V.hidden?T.style.removeProperty("padding-bottom"):T.style.setProperty("padding-bottom",`${V.offsetHeight}px`))}_updateDetailsCellHeights(){[...this.$.items.children].forEach(T=>{this._updateDetailsCellHeight(T)})}_isDetailsOpened(T){return this.detailsOpenedItems&&this._getItemIndexInArray(T,this.detailsOpenedItems)!==-1}openItemDetails(T){this._isDetailsOpened(T)||(this.detailsOpenedItems=[...this.detailsOpenedItems,T])}closeItemDetails(T){this._isDetailsOpened(T)&&(this.detailsOpenedItems=this.detailsOpenedItems.filter(V=>!this._itemsEqual(V,T)))}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const timeouts={SCROLLING:500},ScrollMixin=$=>class extends ResizeMixin($){static get properties(){return{_frozenCells:{type:Array,value:()=>[]},_frozenToEndCells:{type:Array,value:()=>[]},_rowWithFocusedElement:Element}}get _scrollTop(){return this.$.table.scrollTop}set _scrollTop(T){this.$.table.scrollTop=T}get _scrollLeft(){return this.$.table.scrollLeft}ready(){super.ready(),this.scrollTarget=this.$.table,this.$.items.addEventListener("focusin",T=>{const V=T.composedPath().indexOf(this.$.items);this._rowWithFocusedElement=T.composedPath()[V-1]}),this.$.items.addEventListener("focusout",()=>{this._rowWithFocusedElement=void 0}),this.$.table.addEventListener("scroll",()=>this._afterScroll())}_onResize(){this._updateOverflow(),this.__updateHorizontalScrollPosition()}scrollToIndex(T){T=Math.min(this._effectiveSize-1,Math.max(0,T)),this.__virtualizer.scrollToIndex(T),this.__scrollIntoViewport(T)}__scrollIntoViewport(T){const V=[...this.$.items.children].find(K=>K.index===T);if(V){const K=V.getBoundingClientRect(),Y=this.$.footer.getBoundingClientRect().top,J=this.$.header.getBoundingClientRect().bottom;K.bottom>Y?this.$.table.scrollTop+=K.bottom-Y:K.top<J&&(this.$.table.scrollTop-=J-K.top)}}_scheduleScrolling(){this._scrollingFrame||(this._scrollingFrame=requestAnimationFrame(()=>this.$.scroller.toggleAttribute("scrolling",!0))),this._debounceScrolling=Debouncer$1.debounce(this._debounceScrolling,timeOut.after(timeouts.SCROLLING),()=>{cancelAnimationFrame(this._scrollingFrame),delete this._scrollingFrame,this.$.scroller.toggleAttribute("scrolling",!1)})}_afterScroll(){this.__updateHorizontalScrollPosition(),this.hasAttribute("reordering")||this._scheduleScrolling(),this.hasAttribute("navigating")||this._hideTooltip(!0),this._updateOverflow()}_updateOverflow(){let T="";const V=this.$.table;V.scrollTop<V.scrollHeight-V.clientHeight&&(T+=" bottom"),V.scrollTop>0&&(T+=" top");const K=this.__getNormalizedScrollLeft(V);K>0&&(T+=" start"),K<V.scrollWidth-V.clientWidth&&(T+=" end"),this.__isRTL&&(T=T.replace(/start|end/gi,Y=>Y==="start"?"end":"start")),V.scrollLeft<V.scrollWidth-V.clientWidth&&(T+=" right"),V.scrollLeft>0&&(T+=" left"),this._debounceOverflow=Debouncer$1.debounce(this._debounceOverflow,animationFrame,()=>{const Y=T.trim();Y.length>0&&this.getAttribute("overflow")!==Y?this.setAttribute("overflow",Y):Y.length===0&&this.hasAttribute("overflow")&&this.removeAttribute("overflow")})}_frozenCellsChanged(){this._debouncerCacheElements=Debouncer$1.debounce(this._debouncerCacheElements,microTask,()=>{Array.from(this.shadowRoot.querySelectorAll('[part~="cell"]')).forEach(T=>{T.style.transform=""}),this._frozenCells=Array.prototype.slice.call(this.$.table.querySelectorAll("[frozen]")),this._frozenToEndCells=Array.prototype.slice.call(this.$.table.querySelectorAll("[frozen-to-end]")),this.__updateHorizontalScrollPosition()}),this._debounceUpdateFrozenColumn()}_debounceUpdateFrozenColumn(){this.__debounceUpdateFrozenColumn=Debouncer$1.debounce(this.__debounceUpdateFrozenColumn,microTask,()=>this._updateFrozenColumn())}_updateFrozenColumn(){if(!this._columnTree)return;const T=this._columnTree[this._columnTree.length-1].slice(0);T.sort((Y,J)=>Y._order-J._order);let V,K;for(let Y=0;Y<T.length;Y++){const J=T[Y];J._lastFrozen=!1,J._firstFrozenToEnd=!1,K===void 0&&J.frozenToEnd&&!J.hidden&&(K=Y),J.frozen&&!J.hidden&&(V=Y)}V!==void 0&&(T[V]._lastFrozen=!0),K!==void 0&&(T[K]._firstFrozenToEnd=!0)}__updateHorizontalScrollPosition(){const T=this.$.table.scrollWidth,V=this.$.table.clientWidth,K=Math.max(0,this.$.table.scrollLeft),Y=this.__getNormalizedScrollLeft(this.$.table),J=`translate(${-K}px, 0)`;this.$.header.style.transform=J,this.$.footer.style.transform=J,this.$.items.style.transform=J;const ee=this.__isRTL?Y+V-T:K,te=`translate(${ee}px, 0)`;for(let se=0;se<this._frozenCells.length;se++)this._frozenCells[se].style.transform=te;const re=`translate(${this.__isRTL?Y:K+V-T}px, 0)`;for(let se=0;se<this._frozenToEndCells.length;se++)this._frozenToEndCells[se].style.transform=re;this.hasAttribute("navigating")&&this.__rowFocusMode&&this.$.table.style.setProperty("--_grid-horizontal-scroll-position",`${-ee}px`)}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const SelectionMixin=$=>class extends ${static get properties(){return{selectedItems:{type:Object,notify:!0,value:()=>[]},__selectedKeys:{type:Object,computed:"__computeSelectedKeys(itemIdPath, selectedItems.*)"}}}static get observers(){return["__selectedItemsChanged(itemIdPath, selectedItems.*)"]}_isSelected(T){return this.__selectedKeys.has(this.getItemId(T))}selectItem(T){this._isSelected(T)||(this.selectedItems=[...this.selectedItems,T])}deselectItem(T){this._isSelected(T)&&(this.selectedItems=this.selectedItems.filter(V=>!this._itemsEqual(V,T)))}_toggleItem(T){this._isSelected(T)?this.deselectItem(T):this.selectItem(T)}__selectedItemsChanged(){this.requestContentUpdate()}__computeSelectedKeys(T,V){const K=V.base||[],Y=new Set;return K.forEach(J=>{Y.add(this.getItemId(J))}),Y}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */let defaultMultiSortPriority="prepend";const SortMixin=$=>class extends ${static get properties(){return{multiSort:{type:Boolean,value:!1},multiSortPriority:{type:String,value:()=>defaultMultiSortPriority},multiSortOnShiftClick:{type:Boolean,value:!1},_sorters:{type:Array,value:()=>[]},_previousSorters:{type:Array,value:()=>[]}}}static setDefaultMultiSortPriority(T){defaultMultiSortPriority=["append","prepend"].includes(T)?T:"prepend"}ready(){super.ready(),this.addEventListener("sorter-changed",this._onSorterChanged)}_onSorterChanged(T){const V=T.target;T.stopPropagation(),V._grid=this,this.__updateSorter(V,T.detail.shiftClick,T.detail.fromSorterClick),this.__applySorters()}__removeSorters(T){T.length!==0&&(this._sorters=this._sorters.filter(V=>T.indexOf(V)<0),this.multiSort&&this.__updateSortOrders(),this.__applySorters())}__updateSortOrders(){this._sorters.forEach((T,V)=>{T._order=this._sorters.length>1?V:null})}__appendSorter(T){T.direction?this._sorters.includes(T)||this._sorters.push(T):this._removeArrayItem(this._sorters,T),this.__updateSortOrders()}__prependSorter(T){this._removeArrayItem(this._sorters,T),T.direction&&this._sorters.unshift(T),this.__updateSortOrders()}__updateSorter(T,V,K){if(!(!T.direction&&this._sorters.indexOf(T)===-1)){if(T._order=null,this.multiSort&&(!this.multiSortOnShiftClick||!K)||this.multiSortOnShiftClick&&V)this.multiSortPriority==="append"?this.__appendSorter(T):this.__prependSorter(T);else if(T.direction||this.multiSortOnShiftClick){const Y=this._sorters.filter(J=>J!==T);this._sorters=T.direction?[T]:[],Y.forEach(J=>{J._order=null,J.direction=null})}}}__applySorters(){this.dataProvider&&this.isAttached&&JSON.stringify(this._previousSorters)!==JSON.stringify(this._mapSorters())&&this.clearCache(),this._a11yUpdateSorters(),this._previousSorters=this._mapSorters()}_mapSorters(){return this._sorters.map(T=>({path:T.path,direction:T.direction}))}_removeArrayItem(T,V){const K=T.indexOf(V);K>-1&&T.splice(K,1)}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const StylingMixin=$=>class extends ${static get properties(){return{cellClassNameGenerator:Function}}static get observers(){return["__cellClassNameGeneratorChanged(cellClassNameGenerator)"]}__cellClassNameGeneratorChanged(){this.generateCellClassNames()}generateCellClassNames(){Array.from(this.$.items.children).filter(T=>!T.hidden&&!T.hasAttribute("loading")).forEach(T=>this._generateCellClassNames(T,this.__getRowModel(T)))}_generateCellClassNames(T,V){Array.from(T.children).forEach(K=>{if(K.__generatedClasses&&K.__generatedClasses.forEach(Y=>K.classList.remove(Y)),this.cellClassNameGenerator){const Y=this.cellClassNameGenerator(K._column,V);K.__generatedClasses=Y&&Y.split(" ").filter(J=>J.length>0),K.__generatedClasses&&K.__generatedClasses.forEach(J=>K.classList.add(J))}})}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Grid extends ElementMixin(ThemableMixin(DataProviderMixin(ArrayDataProviderMixin(DynamicColumnsMixin(ActiveItemMixin(ScrollMixin(SelectionMixin(SortMixin(RowDetailsMixin(KeyboardNavigationMixin(A11yMixin(FilterMixin(ColumnReorderingMixin(ColumnResizingMixin(ControllerMixin(EventContextMixin(DragAndDropMixin(StylingMixin(TabindexMixin(PolymerElement)))))))))))))))))))){static get template(){return html`
      <div
        id="scroller"
        safari$="[[_safari]]"
        ios$="[[_ios]]"
        loading$="[[loading]]"
        column-reordering-allowed$="[[columnReorderingAllowed]]"
      >
        <table id="table" role="treegrid" aria-multiselectable="true" tabindex="0">
          <caption id="sizer" part="row"></caption>
          <thead id="header" role="rowgroup"></thead>
          <tbody id="items" role="rowgroup"></tbody>
          <tfoot id="footer" role="rowgroup"></tfoot>
        </table>

        <div part="reorder-ghost"></div>
      </div>

      <slot name="tooltip"></slot>

      <div id="focusexit" tabindex="0"></div>
    `}static get is(){return"vaadin-grid"}static get observers(){return["_columnTreeChanged(_columnTree, _columnTree.*)","_effectiveSizeChanged(_effectiveSize, __virtualizer, _hasData, _columnTree)"]}static get properties(){return{_safari:{type:Boolean,value:isSafari},_ios:{type:Boolean,value:isIOS},_firefox:{type:Boolean,value:isFirefox},_android:{type:Boolean,value:isAndroid},_touchDevice:{type:Boolean,value:isTouch},allRowsVisible:{type:Boolean,value:!1,reflectToAttribute:!0},_recalculateColumnWidthOnceLoadingFinished:{type:Boolean,value:!0},isAttached:{value:!1},__gridElement:{type:Boolean,value:!0}}}constructor(){super(),this.addEventListener("animationend",this._onAnimationEnd)}connectedCallback(){super.connectedCallback(),this.isAttached=!0,this.recalculateColumnWidths()}disconnectedCallback(){super.disconnectedCallback(),this.isAttached=!1,this._hideTooltip(!0)}__getFirstVisibleItem(){return this._getVisibleRows().find(C=>this._isInViewport(C))}get _firstVisibleIndex(){const C=this.__getFirstVisibleItem();return C?C.index:void 0}__getLastVisibleItem(){return this._getVisibleRows().reverse().find(C=>this._isInViewport(C))}get _lastVisibleIndex(){const C=this.__getLastVisibleItem();return C?C.index:void 0}_isInViewport(C){const T=this.$.table.getBoundingClientRect(),V=C.getBoundingClientRect(),K=this.$.header.getBoundingClientRect().height,Y=this.$.footer.getBoundingClientRect().height;return V.bottom>T.top+K&&V.top<T.bottom-Y}_getVisibleRows(){return Array.from(this.$.items.children).filter(C=>!C.hidden).sort((C,T)=>C.index-T.index)}ready(){super.ready(),this.__virtualizer=new Virtualizer({createElements:this._createScrollerRows.bind(this),updateElement:this._updateScrollerItem.bind(this),scrollContainer:this.$.items,scrollTarget:this.$.table,reorderElements:!0}),new ResizeObserver(()=>setTimeout(()=>this.__updateFooterPositioning())).observe(this.$.footer),processTemplates(this),this._tooltipController=new TooltipController(this),this.addController(this._tooltipController),this._tooltipController.setManual(!0)}attributeChangedCallback(C,T,V){super.attributeChangedCallback(C,T,V),C==="dir"&&(this.__isRTL=V==="rtl")}__getBodyCellCoordinates(C){if(this.$.items.contains(C)&&C.localName==="td")return{item:C.parentElement._item,column:C._column}}__focusBodyCell({item:C,column:T}){const V=this._getVisibleRows().find(Y=>Y._item===C),K=V&&[...V.children].find(Y=>Y._column===T);K&&K.focus()}_effectiveSizeChanged(C,T,V,K){if(T&&V&&K){const Y=this.shadowRoot.activeElement,J=this.__getBodyCellCoordinates(Y);T.size=C,T.update(),T.flush(),J&&Y.parentElement.hidden&&this.__focusBodyCell(J),this._resetKeyboardNavigation()}}__hasRowsWithClientHeight(){return!!Array.from(this.$.items.children).filter(C=>C.clientHeight).length}__itemsReceived(){this._recalculateColumnWidthOnceLoadingFinished&&!this._cache.isLoading()&&this.__hasRowsWithClientHeight()&&(this._recalculateColumnWidthOnceLoadingFinished=!1,this.recalculateColumnWidths())}__getIntrinsicWidth(C){if(this.__intrinsicWidthCache.has(C))return this.__intrinsicWidthCache.get(C);const T=this.__calculateIntrinsicWidth(C);return this.__intrinsicWidthCache.set(C,T),T}__calculateIntrinsicWidth(C){const T=C.width,V=C.flexGrow;C.width="auto",C.flexGrow=0;const K=C._allCells.filter(Y=>!this.$.items.contains(Y)||this._isInViewport(Y.parentElement)).reduce((Y,J)=>Math.max(Y,J.offsetWidth+1),0);return C.flexGrow=V,C.width=T,K}__getDistributedWidth(C,T){if(C==null||C===this)return 0;const V=Math.max(this.__getIntrinsicWidth(C),this.__getDistributedWidth(C.parentElement,C));if(!T)return V;const K=C,Y=V,J=K._visibleChildColumns.map(re=>this.__getIntrinsicWidth(re)).reduce((re,se)=>re+se,0),ee=Math.max(0,Y-J),ie=this.__getIntrinsicWidth(T)/J*ee;return this.__getIntrinsicWidth(T)+ie}_recalculateColumnWidths(C){this.__virtualizer.flush(),[...this.$.header.children,...this.$.footer.children].forEach(T=>{T.__debounceUpdateHeaderFooterRowVisibility&&T.__debounceUpdateHeaderFooterRowVisibility.flush()}),this._debouncerHiddenChanged&&this._debouncerHiddenChanged.flush(),this.__intrinsicWidthCache=new Map,C.forEach(T=>{T.width=`${this.__getDistributedWidth(T)}px`})}recalculateColumnWidths(){if(this._columnTree)if(this._cache.isLoading())this._recalculateColumnWidthOnceLoadingFinished=!0;else{const C=this._getColumns().filter(T=>!T.hidden&&T.autoWidth);this._recalculateColumnWidths(C)}}_createScrollerRows(C){const T=[];for(let V=0;V<C;V++){const K=document.createElement("tr");K.setAttribute("part","row"),K.setAttribute("role","row"),K.setAttribute("tabindex","-1"),this._columnTree&&this._updateRow(K,this._columnTree[this._columnTree.length-1],"body",!1,!0),T.push(K)}return this._columnTree&&this._columnTree[this._columnTree.length-1].forEach(V=>V.isConnected&&V.notifyPath&&V.notifyPath("_cells.*",V._cells)),beforeNextRender(this,()=>{this._updateFirstAndLastColumn(),this._resetKeyboardNavigation(),this._afterScroll(),this.__itemsReceived()}),T}_createCell(C,T){const K=`vaadin-grid-cell-content-${this._contentIndex=this._contentIndex+1||0}`,Y=document.createElement("vaadin-grid-cell-content");Y.setAttribute("slot",K);const J=document.createElement(C);J.id=K.replace("-content-","-"),J.setAttribute("role",C==="td"?"gridcell":"columnheader"),!isAndroid&&!isIOS&&(J.addEventListener("mouseenter",te=>{this.$.scroller.hasAttribute("scrolling")||this._showTooltip(te)}),J.addEventListener("mouseleave",()=>{this._hideTooltip()}),J.addEventListener("mousedown",()=>{this._hideTooltip(!0)}));const ee=document.createElement("slot");if(ee.setAttribute("name",K),T&&T._focusButtonMode){const te=document.createElement("div");te.setAttribute("role","button"),te.setAttribute("tabindex","-1"),J.appendChild(te),J._focusButton=te,J.focus=function(){J._focusButton.focus()},te.appendChild(ee)}else J.setAttribute("tabindex","-1"),J.appendChild(ee);return J._content=Y,Y.addEventListener("mousedown",()=>{if(isChrome){const te=ie=>{const re=Y.contains(this.getRootNode().activeElement),se=ie.composedPath().includes(Y);!re&&se&&J.focus(),document.removeEventListener("mouseup",te,!0)};document.addEventListener("mouseup",te,!0)}else setTimeout(()=>{Y.contains(this.getRootNode().activeElement)||J.focus()})}),J}_updateRow(C,T,V,K,Y){V=V||"body";const J=document.createDocumentFragment();Array.from(C.children).forEach(ee=>{ee._vacant=!0}),C.innerHTML="",T.filter(ee=>!ee.hidden).forEach((ee,te,ie)=>{let re;if(V==="body"){if(ee._cells=ee._cells||[],re=ee._cells.find(se=>se._vacant),re||(re=this._createCell("td",ee),ee._cells.push(re)),re.setAttribute("part","cell body-cell"),C.appendChild(re),te===ie.length-1&&this.rowDetailsRenderer){this._detailsCells=this._detailsCells||[];const se=this._detailsCells.find(oe=>oe._vacant)||this._createCell("td");this._detailsCells.indexOf(se)===-1&&this._detailsCells.push(se),se._content.parentElement||J.appendChild(se._content),this._configureDetailsCell(se),C.appendChild(se),this._a11ySetRowDetailsCell(C,se),se._vacant=!1}ee.notifyPath&&!Y&&ee.notifyPath("_cells.*",ee._cells)}else{const se=V==="header"?"th":"td";K||ee.localName==="vaadin-grid-column-group"?(re=ee[`_${V}Cell`]||this._createCell(se),re._column=ee,C.appendChild(re),ee[`_${V}Cell`]=re):(ee._emptyCells=ee._emptyCells||[],re=ee._emptyCells.find(oe=>oe._vacant)||this._createCell(se),re._column=ee,C.appendChild(re),ee._emptyCells.indexOf(re)===-1&&ee._emptyCells.push(re)),re.setAttribute("part",`cell ${V}-cell`)}re._content.parentElement||J.appendChild(re._content),re._vacant=!1,re._column=ee}),V!=="body"&&this.__debounceUpdateHeaderFooterRowVisibility(C),this.appendChild(J),this._frozenCellsChanged(),this._updateFirstAndLastColumnForRow(C)}__debounceUpdateHeaderFooterRowVisibility(C){C.__debounceUpdateHeaderFooterRowVisibility=Debouncer$1.debounce(C.__debounceUpdateHeaderFooterRowVisibility,microTask,()=>this.__updateHeaderFooterRowVisibility(C))}__updateHeaderFooterRowVisibility(C){if(!C)return;const T=Array.from(C.children).filter(V=>{const K=V._column;if(K._emptyCells&&K._emptyCells.indexOf(V)>-1)return!1;if(C.parentElement===this.$.header){if(K.headerRenderer)return!0;if(K.header===null)return!1;if(K.path||K.header!==void 0)return!0}else if(K.footerRenderer)return!0;return!1});C.hidden!==!T.length&&(C.hidden=!T.length),this._resetKeyboardNavigation()}_updateScrollerItem(C,T){this._preventScrollerRotatingCellFocus(C,T),this._columnTree&&(C.toggleAttribute("first",T===0),C.toggleAttribute("last",T===this._effectiveSize-1),C.toggleAttribute("odd",T%2),this._a11yUpdateRowRowindex(C,T),this._getItem(T,C))}_columnTreeChanged(C){this._renderColumnTree(C),this.recalculateColumnWidths()}_renderColumnTree(C){for(Array.from(this.$.items.children).forEach(T=>this._updateRow(T,C[C.length-1],null,!1,!0));this.$.header.children.length<C.length;){const T=document.createElement("tr");T.setAttribute("part","row"),T.setAttribute("role","row"),T.setAttribute("tabindex","-1"),this.$.header.appendChild(T);const V=document.createElement("tr");V.setAttribute("part","row"),V.setAttribute("role","row"),V.setAttribute("tabindex","-1"),this.$.footer.appendChild(V)}for(;this.$.header.children.length>C.length;)this.$.header.removeChild(this.$.header.firstElementChild),this.$.footer.removeChild(this.$.footer.firstElementChild);Array.from(this.$.header.children).forEach((T,V)=>this._updateRow(T,C[V],"header",V===C.length-1)),Array.from(this.$.footer.children).forEach((T,V)=>this._updateRow(T,C[C.length-1-V],"footer",V===0)),this._updateRow(this.$.sizer,C[C.length-1]),this._resizeHandler(),this._frozenCellsChanged(),this._updateFirstAndLastColumn(),this._resetKeyboardNavigation(),this._a11yUpdateHeaderRows(),this._a11yUpdateFooterRows(),this.__updateFooterPositioning(),this.generateCellClassNames()}__updateFooterPositioning(){this._firefox&&parseFloat(navigator.userAgent.match(/Firefox\/(\d{2,3}.\d)/)[1])<99&&(this.$.items.style.paddingBottom=0,this.allRowsVisible||(this.$.items.style.paddingBottom=`${this.$.footer.offsetHeight}px`))}_updateItem(C,T){C._item=T;const V=this.__getRowModel(C);this._toggleDetailsCell(C,V.detailsOpened),this._a11yUpdateRowLevel(C,V.level),this._a11yUpdateRowSelected(C,V.selected),C.toggleAttribute("expanded",V.expanded),C.toggleAttribute("selected",V.selected),C.toggleAttribute("details-opened",V.detailsOpened),this._generateCellClassNames(C,V),this._filterDragAndDrop(C,V),Array.from(C.children).forEach(K=>{if(K._renderer){const Y=K._column||this;K._renderer.call(Y,K._content,Y,V)}}),this._updateDetailsCellHeight(C),this._a11yUpdateRowExpanded(C,V.expanded)}_resizeHandler(){this._updateDetailsCellHeights(),this.__updateFooterPositioning(),this.__updateHorizontalScrollPosition()}_onAnimationEnd(C){C.animationName.indexOf("vaadin-grid-appear")===0&&(C.stopPropagation(),this.__itemsReceived(),requestAnimationFrame(()=>{this.__scrollToPendingIndex()}))}__getRowModel(C){return{index:C.index,item:C._item,level:this._getIndexLevel(C.index),expanded:this._isExpanded(C._item),selected:this._isSelected(C._item),detailsOpened:!!this.rowDetailsRenderer&&this._isDetailsOpened(C._item)}}_showTooltip(C){const T=this._tooltipController.node;T&&T.isConnected&&(this._tooltipController.setTarget(C.target),this._tooltipController.setContext(this.getEventContext(C)),T._stateController.open({focus:C.type==="focusin",hover:C.type==="mouseenter"}))}_hideTooltip(C){const T=this._tooltipController.node;T&&T._stateController.close(C)}requestContentUpdate(){this._columnTree&&(this._columnTree.forEach(C=>{C.forEach(T=>{T._renderHeaderAndFooter&&T._renderHeaderAndFooter()})}),this.__updateVisibleRows())}__updateVisibleRows(C,T){this.__virtualizer&&this.__virtualizer.update(C,T)}notifyResize(){console.warn("WARNING: Since Vaadin 22, notifyResize() is deprecated. The component uses a ResizeObserver internally and doesn't need to be explicitly notified of resizes.")}}customElements.define(Grid.is,Grid);/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */console.warn('WARNING: Since Vaadin 23.2, "@vaadin/vaadin-grid" is deprecated. Use "@vaadin/grid" instead.');/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class GridSelectionColumn extends GridColumn{static get is(){return"vaadin-grid-selection-column"}static get properties(){return{width:{type:String,value:"58px"},flexGrow:{type:Number,value:0},selectAll:{type:Boolean,value:!1,notify:!0},autoSelect:{type:Boolean,value:!1},__indeterminate:Boolean,__previousActiveItem:Object,__selectAllHidden:Boolean}}static get observers(){return["__onSelectAllChanged(selectAll)","_onHeaderRendererOrBindingChanged(_headerRenderer, _headerCell, path, header, selectAll, __indeterminate, __selectAllHidden)"]}constructor(){super(),this.__boundOnActiveItemChanged=this.__onActiveItemChanged.bind(this),this.__boundOnDataProviderChanged=this.__onDataProviderChanged.bind(this),this.__boundOnSelectedItemsChanged=this.__onSelectedItemsChanged.bind(this)}disconnectedCallback(){this._grid.removeEventListener("active-item-changed",this.__boundOnActiveItemChanged),this._grid.removeEventListener("data-provider-changed",this.__boundOnDataProviderChanged),this._grid.removeEventListener("filter-changed",this.__boundOnSelectedItemsChanged),this._grid.removeEventListener("selected-items-changed",this.__boundOnSelectedItemsChanged),super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this._grid&&(this._grid.addEventListener("active-item-changed",this.__boundOnActiveItemChanged),this._grid.addEventListener("data-provider-changed",this.__boundOnDataProviderChanged),this._grid.addEventListener("filter-changed",this.__boundOnSelectedItemsChanged),this._grid.addEventListener("selected-items-changed",this.__boundOnSelectedItemsChanged))}_defaultHeaderRenderer(C,T){let V=C.firstElementChild;V||(V=document.createElement("vaadin-checkbox"),V.setAttribute("aria-label","Select All"),V.classList.add("vaadin-grid-select-all-checkbox"),V.addEventListener("checked-changed",this.__onSelectAllCheckedChanged.bind(this)),C.appendChild(V));const K=this.__isChecked(this.selectAll,this.__indeterminate);V.__rendererChecked=K,V.checked=K,V.hidden=this.__selectAllHidden,V.indeterminate=this.__indeterminate}_defaultRenderer(C,T,{item:V,selected:K}){let Y=C.firstElementChild;Y||(Y=document.createElement("vaadin-checkbox"),Y.setAttribute("aria-label","Select Row"),Y.addEventListener("checked-changed",this.__onSelectRowCheckedChanged.bind(this)),C.appendChild(Y)),Y.__item=V,Y.__rendererChecked=K,Y.checked=K}__onSelectAllChanged(C){if(!(C===void 0||!this._grid)){if(!this.__selectAllInitialized){this.__selectAllInitialized=!0;return}this._selectAllChangeLock||(C&&this.__hasArrayDataProvider()?this.__withFilteredItemsArray(T=>{this._grid.selectedItems=T}):this._grid.selectedItems=[])}}__arrayContains(C,T){return Array.isArray(C)&&Array.isArray(T)&&T.every(V=>C.includes(V))}__onSelectAllCheckedChanged(C){C.target.checked!==C.target.__rendererChecked&&(this.selectAll=this.__indeterminate||C.target.checked)}__onSelectRowCheckedChanged(C){C.target.checked!==C.target.__rendererChecked&&(C.target.checked?this._grid.selectItem(C.target.__item):this._grid.deselectItem(C.target.__item))}__isChecked(C,T){return T||C}__onActiveItemChanged(C){const T=C.detail.value;if(this.autoSelect){const V=T||this.__previousActiveItem;V&&this._grid._toggleItem(V)}this.__previousActiveItem=T}__hasArrayDataProvider(){return Array.isArray(this._grid.items)&&!!this._grid.dataProvider}__onSelectedItemsChanged(){this._selectAllChangeLock=!0,this.__hasArrayDataProvider()&&this.__withFilteredItemsArray(C=>{this._grid.selectedItems.length?this.__arrayContains(this._grid.selectedItems,C)?(this.selectAll=!0,this.__indeterminate=!1):(this.selectAll=!1,this.__indeterminate=!0):(this.selectAll=!1,this.__indeterminate=!1)}),this._selectAllChangeLock=!1}__onDataProviderChanged(){this.__selectAllHidden=!Array.isArray(this._grid.items)}__withFilteredItemsArray(C){const T={page:0,pageSize:1/0,sortOrders:[],filters:this._grid._mapFilters()};this._grid.dataProvider(T,V=>C(V))}}customElements.define(GridSelectionColumn.is,GridSelectionColumn);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=($,C)=>{var T,V;const K=$._$AN;if(K===void 0)return!1;for(const Y of K)(V=(T=Y)._$AO)===null||V===void 0||V.call(T,C,!1),s(Y,C);return!0},o=$=>{let C,T;do{if((C=$._$AM)===void 0)break;T=C._$AN,T.delete($),$=C}while((T==null?void 0:T.size)===0)},r=$=>{for(let C;C=$._$AM;$=C){let T=C._$AN;if(T===void 0)C._$AN=T=new Set;else if(T.has($))break;T.add($),l(C)}};function n($){this._$AN!==void 0?(o(this),this._$AM=$,r(this)):this._$AM=$}function h($,C=!1,T=0){const V=this._$AH,K=this._$AN;if(K!==void 0&&K.size!==0)if(C)if(Array.isArray(V))for(let Y=T;Y<V.length;Y++)s(V[Y],!1),o(V[Y]);else V!=null&&(s(V,!1),o(V));else s(this,$)}const l=$=>{var C,T,V,K;$.type==t$2.CHILD&&((C=(V=$)._$AP)!==null&&C!==void 0||(V._$AP=h),(T=(K=$)._$AQ)!==null&&T!==void 0||(K._$AQ=n))};class c extends i$3{constructor(){super(...arguments),this._$AN=void 0}_$AT(C,T,V){super._$AT(C,T,V),r(this),this.isConnected=C._$AU}_$AO(C,T=!0){var V,K;C!==this.isConnected&&(this.isConnected=C,C?(V=this.reconnected)===null||V===void 0||V.call(this):(K=this.disconnected)===null||K===void 0||K.call(this)),T&&(s(this,C),o(this))}setValue(C){if(e$3(this._$Ct))this._$Ct._$AI(C,this);else{const T=[...this._$Ct._$AH];T[this._$Ci]=C,this._$Ct._$AI(T,this,0)}}disconnected(){}reconnected(){}}/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const VALUE_NOT_INITIALIZED=Symbol("valueNotInitialized");class LitRendererDirective extends c{constructor(C){if(super(C),C.type!==t$2.ELEMENT)throw new Error(`\`${this.constructor.name}\` must be bound to an element.`);this.previousValue=VALUE_NOT_INITIALIZED}render(C,T){return b$1}update(C,[T,V]){return this.hasChanged(V)?(this.host=C.options&&C.options.host,this.element=C.element,this.renderer=T,this.previousValue===VALUE_NOT_INITIALIZED?this.addRenderer():this.runRenderer(),this.previousValue=Array.isArray(V)?[...V]:V,b$1):b$1}reconnected(){this.addRenderer()}disconnected(){this.removeRenderer()}addRenderer(){throw new Error("The `addRenderer` method must be implemented.")}runRenderer(){throw new Error("The `runRenderer` method must be implemented.")}removeRenderer(){throw new Error("The `removeRenderer` method must be implemented.")}renderRenderer(C,...T){const V=this.renderer.call(this.host,...T);Z$1(V,C,{host:this.host})}hasChanged(C){return Array.isArray(C)?!Array.isArray(this.previousValue)||this.previousValue.length!==C.length?!0:C.some((T,V)=>T!==this.previousValue[V]):this.previousValue!==C}}/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const CONTENT_UPDATE_DEBOUNCER=Symbol("contentUpdateDebouncer");/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class AbstractGridColumnRendererDirective extends LitRendererDirective{get rendererProperty(){throw new Error("The `rendererProperty` getter must be implemented.")}addRenderer(){this.element[this.rendererProperty]=(C,T)=>{this.renderRenderer(C,T)}}runRenderer(){const C=this.element._grid;C[CONTENT_UPDATE_DEBOUNCER]=Debouncer$1.debounce(C[CONTENT_UPDATE_DEBOUNCER],microTask,()=>{C.requestContentUpdate()})}removeRenderer(){this.element[this.rendererProperty]=null}}class GridColumnBodyRendererDirective extends AbstractGridColumnRendererDirective{get rendererProperty(){return"renderer"}addRenderer(){this.element[this.rendererProperty]=(C,T,V)=>{this.renderRenderer(C,V.item,V,T)}}}const columnBodyRenderer=e$2(GridColumnBodyRendererDirective);var StatusType=($=>($.NONE="NONE",$.INFO="INFO",$.SUCCESS="SUCCESS",$.WARNING="WARNING",$.DANGER="DANGER",$))(StatusType||{});const menuBarButton=i$2`
  :host {
    margin: calc(var(--lumo-space-xs) / 2);
    margin-left: 0;
    border-radius: 0;
  }

  [part='label'] {
    width: 100%;
  }

  /* NOTE(web-padawan): avoid using shorthand padding property for IE11 */
  [part='label'] ::slotted(vaadin-context-menu-item) {
    justify-content: center;
    background-color: transparent;
    height: var(--lumo-button-size);
    margin: 0 calc((var(--lumo-size-m) / 3 + var(--lumo-border-radius-m) / 2) * -1);
    padding-left: calc(var(--lumo-size-m) / 3 + var(--lumo-border-radius-m) / 2);
    padding-right: calc(var(--lumo-size-m) / 3 + var(--lumo-border-radius-m) / 2);
  }

  :host([theme~='small']) [part='label'] ::slotted(vaadin-context-menu-item) {
    min-height: var(--lumo-size-s);
    margin: 0 calc((var(--lumo-size-s) / 3 + var(--lumo-border-radius-m) / 2) * -1);
    padding-left: calc(var(--lumo-size-s) / 3 + var(--lumo-border-radius-m) / 2);
    padding-right: calc(var(--lumo-size-s) / 3 + var(--lumo-border-radius-m) / 2);
  }

  :host([theme~='tertiary']) [part='label'] ::slotted(vaadin-context-menu-item) {
    margin: 0 calc((var(--lumo-button-size) / 6) * -1);
    padding-left: calc(var(--lumo-button-size) / 6);
    padding-right: calc(var(--lumo-button-size) / 6);
  }

  :host([theme~='tertiary-inline']) {
    margin-top: calc(var(--lumo-space-xs) / 2);
    margin-bottom: calc(var(--lumo-space-xs) / 2);
    margin-right: calc(var(--lumo-space-xs) / 2);
  }

  :host([theme~='tertiary-inline']) [part='label'] ::slotted(vaadin-context-menu-item) {
    margin: 0;
    padding: 0;
  }

  :host(:first-of-type) {
    border-radius: var(--lumo-border-radius-m) 0 0 var(--lumo-border-radius-m);

    /* Needed to retain the focus-ring with border-radius */
    margin-left: calc(var(--lumo-space-xs) / 2);
  }

  :host(:nth-last-of-type(2)),
  :host([part='overflow-button']) {
    border-radius: 0 var(--lumo-border-radius-m) var(--lumo-border-radius-m) 0;
  }

  :host([theme~='tertiary']),
  :host([theme~='tertiary-inline']) {
    border-radius: var(--lumo-border-radius-m);
  }

  :host([part='overflow-button']) {
    min-width: var(--lumo-button-size);
    padding-left: calc(var(--lumo-button-size) / 4);
    padding-right: calc(var(--lumo-button-size) / 4);
  }

  :host([part='overflow-button']) ::slotted(*) {
    font-size: var(--lumo-font-size-xl);
  }

  :host([part='overflow-button']) [part='prefix'],
  :host([part='overflow-button']) [part='suffix'] {
    margin-left: 0;
    margin-right: 0;
  }

  /* RTL styles */
  :host([dir='rtl']) {
    margin-left: calc(var(--lumo-space-xs) / 2);
    margin-right: 0;
    border-radius: 0;
  }

  :host([dir='rtl']:first-of-type) {
    border-radius: 0 var(--lumo-border-radius-m) var(--lumo-border-radius-m) 0;
    margin-right: calc(var(--lumo-space-xs) / 2);
  }

  :host([dir='rtl']:nth-last-of-type(2)),
  :host([dir='rtl'][part='overflow-button']) {
    border-radius: var(--lumo-border-radius-m) 0 0 var(--lumo-border-radius-m);
  }
`;registerStyles("vaadin-menu-bar-button",[button,menuBarButton],{moduleId:"lumo-menu-bar-button"});/**
 * @license
 * Copyright (c) 2019 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */registerStyles("vaadin-menu-bar-button",i$2`
    [part='label'] ::slotted(vaadin-context-menu-item) {
      position: relative;
      z-index: 1;
    }
  `,{moduleId:"vaadin-menu-bar-button-styles"});class MenuBarButton extends Button{static get is(){return"vaadin-menu-bar-button"}}customElements.define(MenuBarButton.is,MenuBarButton);registerStyles("vaadin-context-menu-item",i$2`
    :host([theme='menu-bar-item']) [part='content'] {
      display: flex;
      /* tweak to inherit centering from menu bar button */
      align-items: inherit;
      justify-content: inherit;
    }

    :host([theme='menu-bar-item']) [part='content'] ::slotted(vaadin-icon),
    :host([theme='menu-bar-item']) [part='content'] ::slotted(iron-icon) {
      display: inline-block;
      width: var(--lumo-icon-size-m);
      height: var(--lumo-icon-size-m);
    }

    :host([theme='menu-bar-item']) [part='content'] ::slotted(vaadin-icon[icon^='vaadin:']),
    :host([theme='menu-bar-item']) [part='content'] ::slotted(iron-icon[icon^='vaadin:']) {
      padding: var(--lumo-space-xs);
      box-sizing: border-box !important;
    }
  `,{moduleId:"lumo-menu-bar-item"});registerStyles("vaadin-context-menu-overlay",i$2`
    :host(:first-of-type) {
      padding-top: var(--lumo-space-xs);
    }
  `,{moduleId:"lumo-menu-bar-overlay"});registerStyles("vaadin-menu-bar",i$2`
    :host([has-single-button]) [part$='button'] {
      border-radius: var(--lumo-border-radius-m);
    }

    :host([theme~='end-aligned']) [part$='button']:first-child,
    :host([theme~='end-aligned'][has-single-button]) [part$='button'] {
      margin-inline-start: auto;
    }
  `,{moduleId:"lumo-menu-bar"});const contextMenuOverlay=i$2`
  :host([phone]) {
    top: 0 !important;
    right: 0 !important;
    bottom: var(--vaadin-overlay-viewport-bottom) !important;
    left: 0 !important;
    align-items: stretch;
    justify-content: flex-end;
  }

  /* TODO These style overrides should not be needed.
   We should instead offer a way to have non-selectable items inside the context menu. */

  :host {
    --_lumo-list-box-item-selected-icon-display: none;
    --_lumo-list-box-item-padding-left: calc(var(--lumo-space-m) + var(--lumo-border-radius-m) / 4);
  }

  [part='overlay'] {
    outline: none;
  }
`;registerStyles("vaadin-context-menu-overlay",[menuOverlay,contextMenuOverlay],{moduleId:"lumo-context-menu-overlay"});registerStyles("vaadin-context-menu-list-box",i$2`
    :host(.vaadin-menu-list-box) {
      --_lumo-list-box-item-selected-icon-display: block;
    }

    /* Normal item */
    [part='items'] ::slotted(.vaadin-menu-item) {
      -webkit-tap-highlight-color: var(--lumo-primary-color-10pct);
      cursor: default;
    }

    [part='items'] ::slotted(.vaadin-menu-item) {
      outline: none;
      border-radius: var(--lumo-border-radius-m);
      padding-left: var(--_lumo-list-box-item-padding-left, calc(var(--lumo-border-radius-m) / 4));
      padding-right: calc(var(--lumo-space-l) + var(--lumo-border-radius-m) / 4);
    }

    :host(.vaadin-menu-list-box) [part='items'] ::slotted(.vaadin-menu-item) {
      padding-left: calc(var(--lumo-border-radius-m) / 4);
      padding-right: calc(var(--lumo-space-l) + var(--lumo-border-radius-m) / 4);
    }

    /* Hovered item */
    /* TODO a workaround until we have "focus-follows-mouse". After that, use the hover style for focus-ring as well */
    [part='items'] ::slotted(.vaadin-menu-item:hover:not([disabled])),
    [part='items'] ::slotted(.vaadin-menu-item[expanded]:not([disabled])) {
      background-color: var(--lumo-primary-color-10pct);
    }

    /* RTL styles */
    :host([dir='rtl'])[part='items'] ::slotted(.vaadin-menu-item) {
      padding-left: calc(var(--lumo-space-l) + var(--lumo-border-radius-m) / 4);
      padding-right: var(--_lumo-list-box-item-padding-left, calc(var(--lumo-border-radius-m) / 4));
    }

    :host([dir='rtl'].vaadin-menu-list-box) [part='items'] ::slotted(.vaadin-menu-item) {
      padding-left: calc(var(--lumo-space-l) + var(--lumo-border-radius-m) / 4);
      padding-right: calc(var(--lumo-border-radius-m) / 4);
    }

    /* Focused item */
    @media (pointer: coarse) {
      [part='items'] ::slotted(.vaadin-menu-item:hover:not([expanded]):not([disabled])) {
        background-color: transparent;
      }
    }
  `,{moduleId:"lumo-context-menu-list-box"});registerStyles("vaadin-context-menu-item",i$2`
    /* :hover needed to workaround https://github.com/vaadin/web-components/issues/3133 */
    :host(:hover) {
      user-select: none;
      -ms-user-select: none;
      -webkit-user-select: none;
    }

    :host(.vaadin-menu-item[menu-item-checked]) [part='checkmark']::before {
      opacity: 1;
    }

    :host(.vaadin-menu-item.vaadin-context-menu-parent-item)::after {
      font-family: lumo-icons;
      font-size: var(--lumo-icon-size-xs);
      content: var(--lumo-icons-angle-right);
      color: var(--lumo-tertiary-text-color);
    }

    :host(:not([dir='rtl']).vaadin-menu-item.vaadin-context-menu-parent-item)::after {
      margin-right: calc(var(--lumo-space-m) * -1);
      padding-left: var(--lumo-space-m);
    }

    :host([expanded]) {
      background-color: var(--lumo-primary-color-10pct);
    }

    /* RTL styles */
    :host([dir='rtl'].vaadin-menu-item.vaadin-context-menu-parent-item)::after {
      content: var(--lumo-icons-angle-left);
      margin-left: calc(var(--lumo-space-m) * -1);
      padding-right: var(--lumo-space-m);
    }
  `,{moduleId:"lumo-context-menu-item"});/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Item extends ItemMixin(ThemableMixin(DirMixin$1(PolymerElement))){static get template(){return html`
      <style>
        :host {
          display: inline-block;
        }

        :host([hidden]) {
          display: none !important;
        }
      </style>
      <span part="checkmark" aria-hidden="true"></span>
      <div part="content">
        <slot></slot>
      </div>
    `}static get is(){return"vaadin-item"}constructor(){super(),this.value}ready(){super.ready(),this.setAttribute("role","option")}}customElements.define(Item.is,Item);registerStyles("vaadin-list-box",i$2`
    :host {
      -webkit-tap-highlight-color: transparent;
      --_lumo-item-selected-icon-display: var(--_lumo-list-box-item-selected-icon-display, block);
    }

    /* Dividers */
    [part='items'] ::slotted(hr) {
      height: 1px;
      border: 0;
      padding: 0;
      margin: var(--lumo-space-s) var(--lumo-border-radius-m);
      background-color: var(--lumo-contrast-10pct);
    }
  `,{moduleId:"lumo-list-box"});/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const MultiSelectListMixin=$=>class extends ListMixin($){static get properties(){return{multiple:{type:Boolean,value:!1,reflectToAttribute:!0,observer:"_multipleChanged"},selectedValues:{type:Array,notify:!0,value:()=>[]}}}static get observers(){return["_enhanceMultipleItems(items, multiple, selected, selectedValues, selectedValues.*)"]}ready(){this.addEventListener("click",T=>this._onMultipleClick(T)),super.ready()}_enhanceMultipleItems(T,V,K,Y){if(!(!T||!V)){if(Y){const J=Y.map(ee=>T[ee]);T.forEach(ee=>{ee.selected=J.includes(ee)})}this._scrollToLastSelectedItem()}}_scrollToLastSelectedItem(){const T=this.selectedValues.slice(-1)[0];T&&!T.disabled&&this._scrollToItem(T)}_onMultipleClick(T){const V=this._filterItems(T.composedPath())[0],K=V&&!V.disabled?this.items.indexOf(V):-1;K<0||!this.multiple||(T.preventDefault(),this.selectedValues.includes(K)?this.selectedValues=this.selectedValues.filter(Y=>Y!==K):this.selectedValues=this.selectedValues.concat(K))}_multipleChanged(T,V){!T&&V&&(this.selectedValues=[],this.items.forEach(K=>{K.selected=!1}),this.removeAttribute("aria-multiselectable")),T&&!V&&(this.setAttribute("aria-multiselectable","true"),this.selected!==void 0&&(this.selectedValues=[...this.selectedValues,this.selected],this.selected=void 0))}};/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class ListBox extends ElementMixin(MultiSelectListMixin(ThemableMixin(ControllerMixin(PolymerElement)))){static get template(){return html`
      <style>
        :host {
          display: flex;
        }

        :host([hidden]) {
          display: none !important;
        }

        [part='items'] {
          height: 100%;
          width: 100%;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
      </style>
      <div part="items">
        <slot></slot>
      </div>

      <slot name="tooltip"></slot>
    `}static get is(){return"vaadin-list-box"}static get properties(){return{orientation:{readOnly:!0}}}constructor(){super(),this.focused}ready(){super.ready(),this.setAttribute("role","listbox"),setTimeout(this._checkImport.bind(this),2e3),this._tooltipController=new TooltipController(this),this.addController(this._tooltipController)}get _scrollerElement(){return this.shadowRoot.querySelector('[part="items"]')}_checkImport(){const C=this.querySelector("vaadin-item");C&&!(C instanceof PolymerElement)&&console.warn("Make sure you have imported the vaadin-item element.")}}customElements.define(ListBox.is,ListBox);/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */register$1({name:"vaadin-contextmenu",deps:["touchstart","touchmove","touchend","contextmenu"],flow:{start:["touchstart","contextmenu"],end:["contextmenu"]},emits:["vaadin-contextmenu"],info:{sourceEvent:null},reset(){this.info.sourceEvent=null,this._cancelTimer(),this.info.touchJob=null,this.info.touchStartCoords=null},_cancelTimer(){this._timerId&&(clearTimeout(this._timerId),delete this._fired)},_setSourceEvent($){this.info.sourceEvent=$;const C=$.composedPath();this.info.sourceEvent.__composedPath=C},touchstart($){this._setSourceEvent($),this.info.touchStartCoords={x:$.changedTouches[0].clientX,y:$.changedTouches[0].clientY};const C=$.composedPath()[0]||$.target;this._timerId=setTimeout(()=>{const T=$.changedTouches[0];$.shiftKey||(isIOS&&(this._fired=!0,this.fire(C,T.clientX,T.clientY)),prevent$1("tap"))},500)},touchmove($){const T=this.info.touchStartCoords;(Math.abs(T.x-$.changedTouches[0].clientX)>15||Math.abs(T.y-$.changedTouches[0].clientY)>15)&&this._cancelTimer()},touchend($){this._fired&&$.preventDefault(),this._cancelTimer()},contextmenu($){$.shiftKey||(this._setSourceEvent($),this.fire($.target,$.clientX,$.clientY),prevent$1("tap"))},fire($,C,T){const V=this.info.sourceEvent,K=new Event("vaadin-contextmenu",{bubbles:!0,cancelable:!0,composed:!0});K.detail={x:C,y:T,sourceEvent:V},$.dispatchEvent(K),K.defaultPrevented&&V&&V.preventDefault&&V.preventDefault()}});/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */registerStyles("vaadin-context-menu-overlay",i$2`
    :host {
      align-items: flex-start;
      justify-content: flex-start;
    }

    :host([right-aligned]),
    :host([end-aligned]) {
      align-items: flex-end;
    }

    :host([bottom-aligned]) {
      justify-content: flex-end;
    }

    [part='overlay'] {
      background-color: #fff;
    }
  `,{moduleId:"vaadin-context-menu-overlay-styles"});class ContextMenuOverlay extends PositionMixin(Overlay){static get is(){return"vaadin-context-menu-overlay"}static get properties(){return{parentOverlay:{type:Object,readOnly:!0}}}static get observers(){return["_themeChanged(_theme)"]}ready(){super.ready(),this.addEventListener("keydown",C=>{if(!C.defaultPrevented&&C.composedPath()[0]===this.$.overlay&&[38,40].indexOf(C.keyCode)>-1){const T=this.getFirstChild();T&&Array.isArray(T.items)&&T.items.length&&(C.preventDefault(),C.keyCode===38?T.items[T.items.length-1].focus():T.focus())}})}getFirstChild(){return this.content.querySelector(":not(style):not(slot)")}_themeChanged(){this.close()}getBoundaries(){const C=this.getBoundingClientRect(),T=this.$.overlay.getBoundingClientRect();let V=C.bottom-T.height;const K=this.parentOverlay;if(K&&K.hasAttribute("bottom-aligned")){const Y=getComputedStyle(K);V=V-parseFloat(Y.bottom)-parseFloat(Y.height)}return{xMax:C.right-T.width,xMin:C.left+T.width,yMax:V}}_updatePosition(){if(super._updatePosition(),this.positionTarget&&this.parentOverlay){const C=this.$.content,T=getComputedStyle(C);!!this.style.left?this.style.left=`${parseFloat(this.style.left)+parseFloat(T.paddingLeft)}px`:this.style.right=`${parseFloat(this.style.right)+parseFloat(T.paddingRight)}px`,!!this.style.bottom?this.style.bottom=`${parseFloat(this.style.bottom)-parseFloat(T.paddingBottom)}px`:this.style.top=`${parseFloat(this.style.top)-parseFloat(T.paddingTop)}px`}}}customElements.define(ContextMenuOverlay.is,ContextMenuOverlay);/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class ContextMenuItemElement extends Item{static get is(){return"vaadin-context-menu-item"}}customElements.define(ContextMenuItemElement.is,ContextMenuItemElement);class ContextMenuListBox extends ListBox{static get is(){return"vaadin-context-menu-list-box"}}customElements.define(ContextMenuListBox.is,ContextMenuListBox);const ItemsMixin=$=>class extends ${static get properties(){return{items:Array}}ready(){super.ready(),this.__itemsOutsideClickListener=T=>{T.composedPath().some(V=>V.localName==="vaadin-context-menu-overlay")||this.dispatchEvent(new CustomEvent("items-outside-click"))},this.addEventListener("items-outside-click",()=>this.items&&this.close())}connectedCallback(){super.connectedCallback(),document.documentElement.addEventListener("click",this.__itemsOutsideClickListener)}disconnectedCallback(){super.disconnectedCallback(),document.documentElement.removeEventListener("click",this.__itemsOutsideClickListener)}get __isRTL(){return this.getAttribute("dir")==="rtl"}__forwardFocus(){const T=this.$.overlay,V=T.getFirstChild();if(T.parentOverlay){const K=T.parentOverlay.querySelector("[expanded]");K&&K.hasAttribute("focused")&&V?V.focus():T.$.overlay.focus()}else V&&V.focus()}__openSubMenu(T,V){T.items=V._item.children,T.listenOn=V;const K=this.$.overlay,Y=T.$.overlay;Y.positionTarget=V,Y.noHorizontalOverlap=!0,Y._setParentOverlay(K),K.hasAttribute("theme")?T.setAttribute("theme",K.getAttribute("theme")):T.removeAttribute("theme");const J=T.$.overlay.$.content;J.style.minWidth="",V.dispatchEvent(new CustomEvent("opensubmenu",{detail:{children:V._item.children}}))}__itemsRenderer(T,V,K){this.__initMenu(T,V);const Y=T.querySelector(this.constructor.is);Y.closeOn=V.closeOn;const J=T.querySelector("vaadin-context-menu-list-box");J.innerHTML="",Array.from(K.detail.children||V.items).forEach(te=>{let ie;te.component instanceof HTMLElement?ie=te.component:ie=document.createElement(te.component||"vaadin-context-menu-item"),ie instanceof Item?(ie.setAttribute("role","menuitem"),ie.classList.add("vaadin-menu-item")):ie.localName==="hr"&&ie.setAttribute("role","separator"),this._setMenuItemTheme(ie,te,this._theme),ie._item=te,te.text&&(ie.textContent=te.text),this.__toggleMenuComponentAttribute(ie,"menu-item-checked",te.checked),this.__toggleMenuComponentAttribute(ie,"disabled",te.disabled),ie.setAttribute("aria-haspopup","false"),ie.classList.remove("vaadin-context-menu-parent-item"),te.children&&te.children.length&&(ie.classList.add("vaadin-context-menu-parent-item"),ie.setAttribute("aria-haspopup","true"),ie.setAttribute("aria-expanded","false"),ie.removeAttribute("expanded")),J.appendChild(ie)})}_setMenuItemTheme(T,V,K){let Y=T.getAttribute("theme")||K;V.theme!=null&&(Y=Array.isArray(V.theme)?V.theme.join(" "):V.theme),Y?T.setAttribute("theme",Y):T.removeAttribute("theme")}__toggleMenuComponentAttribute(T,V,K){K?(T.setAttribute(V,""),T[`__has-${V}`]=!0):T[`__has-${V}`]&&(T.removeAttribute(V),T[`__has-${V}`]=!1)}__initMenu(T,V){if(T.firstElementChild){const K=T.querySelector("vaadin-context-menu-list-box");this._theme?K.setAttribute("theme",this._theme):K.removeAttribute("theme")}else{const K=document.createElement("vaadin-context-menu-list-box");T.appendChild(K),this._theme&&K.setAttribute("theme",this._theme),K.classList.add("vaadin-menu-list-box"),requestAnimationFrame(()=>K.setAttribute("role","menu"));const Y=document.createElement(this.constructor.is);Y.setAttribute("hidden",""),T.appendChild(Y),Y.$.overlay.modeless=!0,Y.openOn="opensubmenu",V.addEventListener("opened-changed",ee=>!ee.detail.value&&Y.close()),Y.addEventListener("opened-changed",ee=>{if(!ee.detail.value){const te=K.querySelector("[expanded]");te&&(te.setAttribute("aria-expanded","false"),te.removeAttribute("expanded"))}}),K.addEventListener("selected-changed",ee=>{if(typeof ee.detail.value=="number"){const te=ee.target.items[ee.detail.value]._item;if(!te.children){const ie={value:te};V.dispatchEvent(new CustomEvent("item-selected",{detail:ie}))}K.selected=null}}),Y.addEventListener("item-selected",ee=>{V.dispatchEvent(new CustomEvent("item-selected",{detail:ee.detail}))}),Y.addEventListener("close-all-menus",()=>{V.dispatchEvent(new CustomEvent("close-all-menus"))}),V.addEventListener("close-all-menus",V.close),V.addEventListener("item-selected",V.close),V.$.overlay.$.backdrop.addEventListener("click",()=>V.close()),V.$.overlay.addEventListener("keydown",ee=>{const te=this.__isRTL;!te&&ee.keyCode===37||te&&ee.keyCode===39?(V.close(),V.listenOn.focus()):(ee.key==="Escape"||ee.key==="Tab")&&V.dispatchEvent(new CustomEvent("close-all-menus"))}),requestAnimationFrame(()=>{this.__openListenerActive=!0});const J=(ee,te=ee.composedPath().find(ie=>ie.localName==="vaadin-context-menu-item"))=>{if(this.__openListenerActive){if(V.$.overlay.hasAttribute("opening")){requestAnimationFrame(()=>J(ee,te));return}if(te){if(Y.items!==te._item.children&&Y.close(),!V.opened)return;te._item.children&&te._item.children.length?(te.setAttribute("aria-expanded","true"),te.setAttribute("expanded",""),this.__openSubMenu(Y,te)):Y.listenOn.focus()}}};V.$.overlay.addEventListener(isTouch?"click":"mouseover",J),V.$.overlay.addEventListener("keydown",ee=>{const te=this.__isRTL;(!te&&ee.keyCode===39||te&&ee.keyCode===37||ee.keyCode===13||ee.keyCode===32)&&J(ee)})}}};/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class ContextMenu extends ControllerMixin(ElementMixin(ThemePropertyMixin(ItemsMixin(PolymerElement)))){static get template(){return html`
      <style>
        :host {
          display: block;
        }

        :host([hidden]) {
          display: none !important;
        }
      </style>

      <slot id="slot"></slot>

      <vaadin-context-menu-overlay
        id="overlay"
        on-opened-changed="_onOverlayOpened"
        on-vaadin-overlay-open="_onVaadinOverlayOpen"
        with-backdrop="[[_phone]]"
        phone$="[[_phone]]"
        model="[[_context]]"
        theme$="[[_theme]]"
      >
      </vaadin-context-menu-overlay>
    `}static get is(){return"vaadin-context-menu"}static get properties(){return{selector:{type:String},opened:{type:Boolean,value:!1,notify:!0,readOnly:!0},openOn:{type:String,value:"vaadin-contextmenu"},listenOn:{type:Object,value(){return this}},closeOn:{type:String,value:"click",observer:"_closeOnChanged"},renderer:{type:Function},_context:Object,_boundClose:Object,_boundOpen:Object,_phone:{type:Boolean},_touch:{type:Boolean,value:isTouch},_wide:{type:Boolean},_wideMediaQuery:{type:String,value:"(min-device-width: 750px)"}}}static get observers(){return["_openedChanged(opened)","_targetOrOpenOnChanged(listenOn, openOn)","_rendererChanged(renderer, items)","_touchOrWideChanged(_touch, _wide)"]}constructor(){super(),this._boundOpen=this.open.bind(this),this._boundClose=this.close.bind(this),this._boundOnGlobalContextMenu=this._onGlobalContextMenu.bind(this)}connectedCallback(){super.connectedCallback(),this.__boundOnScroll=this.__onScroll.bind(this),window.addEventListener("scroll",this.__boundOnScroll,!0)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("scroll",this.__boundOnScroll,!0),this.close()}ready(){super.ready(),this._overlayElement=this.$.overlay,this.addController(new MediaQueryController(this._wideMediaQuery,C=>{this._wide=C})),processTemplates(this)}_onOverlayOpened(C){this._setOpened(C.detail.value),this.__alignOverlayPosition()}_onVaadinOverlayOpen(){this.__alignOverlayPosition(),this.$.overlay.style.opacity="",this.__forwardFocus()}_targetOrOpenOnChanged(C,T){this._oldListenOn&&this._oldOpenOn&&(this._unlisten(this._oldListenOn,this._oldOpenOn,this._boundOpen),this._oldListenOn.style.webkitTouchCallout="",this._oldListenOn.style.webkitUserSelect="",this._oldListenOn.style.userSelect="",this._oldListenOn=null,this._oldOpenOn=null),C&&T&&(this._listen(C,T,this._boundOpen),this._oldListenOn=C,this._oldOpenOn=T)}_touchOrWideChanged(C,T){this._phone=!T&&C}_setListenOnUserSelect(C){this.listenOn.style.webkitTouchCallout=C,this.listenOn.style.webkitUserSelect=C,this.listenOn.style.userSelect=C,document.getSelection().removeAllRanges()}_closeOnChanged(C,T){const V="vaadin-overlay-outside-click";T&&(this._unlisten(this.$.overlay,T,this._boundClose),this._unlisten(this.$.overlay.root,T,this._boundClose)),C?(this._listen(this.$.overlay,C,this._boundClose),this._listen(this.$.overlay.root,C,this._boundClose),this._unlisten(this.$.overlay,V,this._preventDefault)):this._listen(this.$.overlay,V,this._preventDefault)}_preventDefault(C){C.preventDefault()}_openedChanged(C){C?(document.documentElement.addEventListener("contextmenu",this._boundOnGlobalContextMenu,!0),this._setListenOnUserSelect("none")):(document.documentElement.removeEventListener("contextmenu",this._boundOnGlobalContextMenu,!0),this._setListenOnUserSelect("")),this.$.overlay.opened=C}requestContentUpdate(){!this._overlayElement||!this.renderer||this._overlayElement.requestContentUpdate()}_rendererChanged(C,T){if(T){if(C)throw new Error("The items API cannot be used together with a renderer");this.closeOn==="click"&&(this.closeOn=""),C=this.__itemsRenderer}this.$.overlay.setProperties({owner:this,renderer:C})}close(){this._setOpened(!1)}_contextTarget(C){if(this.selector){const T=this.listenOn.querySelectorAll(this.selector);return Array.prototype.filter.call(T,V=>C.composedPath().indexOf(V)>-1)[0]}return C.target}open(C){C&&!this.opened&&(this._context={detail:C.detail,target:this._contextTarget(C)},this._context.target&&(this._preventDefault(C),C.stopPropagation(),this.__x=this._getEventCoordinate(C,"x"),this.__pageXOffset=window.pageXOffset,this.__y=this._getEventCoordinate(C,"y"),this.__pageYOffset=window.pageYOffset,this.$.overlay.style.opacity="0",this._setOpened(!0)))}__onScroll(){if(!this.opened)return;const C=window.pageYOffset-this.__pageYOffset,T=window.pageXOffset-this.__pageXOffset;this.__adjustPosition("left",-T),this.__adjustPosition("right",T),this.__adjustPosition("top",-C),this.__adjustPosition("bottom",C),this.__pageYOffset+=C,this.__pageXOffset+=T}__adjustPosition(C,T){const K=this.$.overlay.style;K[C]=`${(parseInt(K[C])||0)+T}px`}__alignOverlayPosition(){const C=this.$.overlay;if(C.positionTarget)return;const T=C.style;["top","right","bottom","left"].forEach(re=>T.removeProperty(re)),["right-aligned","end-aligned","bottom-aligned"].forEach(re=>C.removeAttribute(re));const{xMax:V,xMin:K,yMax:Y}=C.getBoundaries(),J=this.__x,ee=this.__y,te=document.documentElement.clientWidth,ie=document.documentElement.clientHeight;this.__isRTL?J>te/2||J>K?T.right=`${Math.max(0,te-J)}px`:(T.left=`${J}px`,this._setEndAligned(C)):J<te/2||J<V?T.left=`${J}px`:(T.right=`${Math.max(0,te-J)}px`,this._setEndAligned(C)),ee<ie/2||ee<Y?T.top=`${ee}px`:(T.bottom=`${Math.max(0,ie-ee)}px`,C.setAttribute("bottom-aligned",""))}_setEndAligned(C){C.setAttribute("end-aligned",""),this.__isRTL||C.setAttribute("right-aligned","")}_getEventCoordinate(C,T){if(C.detail instanceof Object){if(C.detail[T])return C.detail[T];if(C.detail.sourceEvent)return this._getEventCoordinate(C.detail.sourceEvent,T)}else{const V=`client${T.toUpperCase()}`,K=C.changedTouches?C.changedTouches[0][V]:C[V];if(K===0){const Y=C.target.getBoundingClientRect();return T==="x"?Y.left:Y.top+Y.height}return K}}_listen(C,T,V){gestures$1[T]?addListener$1(C,T,V):C.addEventListener(T,V)}_unlisten(C,T,V){gestures$1[T]?removeListener$1(C,T,V):C.removeEventListener(T,V)}_onGlobalContextMenu(C){C.shiftKey||(C.preventDefault(),this.close())}}customElements.define(ContextMenu.is,ContextMenu);/**
 * @license
 * Copyright (c) 2019 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class MenuBarSubmenu extends ContextMenu{static get is(){return"vaadin-menu-bar-submenu"}constructor(){super(),this.openOn="opensubmenu"}_openedChanged(C){this.$.overlay.opened=C}close(){super.close(),this.hasAttribute("is-root")&&this.getRootNode().host._close()}}customElements.define(MenuBarSubmenu.is,MenuBarSubmenu);/**
 * @license
 * Copyright (c) 2019 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ButtonsMixin=$=>class extends ResizeMixin($){static get properties(){return{_hasOverflow:{type:Boolean,value:!1}}}static get observers(){return["_menuItemsChanged(items, items.splices)"]}get _observeParent(){return!0}ready(){super.ready(),this.setAttribute("role","menubar")}connectedCallback(){super.connectedCallback(),this._initButtonAttrs(this._overflow)}get _buttons(){return Array.from(this.shadowRoot.querySelectorAll('[part$="button"]'))}get _container(){return this.shadowRoot.querySelector('[part="container"]')}get _overflow(){return this.shadowRoot.querySelector('[part="overflow-button"]')}_menuItemsChanged(C){C!==this._oldItems&&(this._oldItems=C,this.__renderButtons(C))}__getOverflowCount(C){return C.item&&C.item.children&&C.item.children.length||0}__restoreButtons(C){for(let T=0;T<C.length;T++){const V=C[T];V.disabled=V.item&&V.item.disabled||this.disabled,V.style.visibility="",V.style.position="";const K=V.item&&V.item.component;K instanceof HTMLElement&&K.classList.contains("vaadin-menu-item")&&(V.appendChild(K),K.classList.remove("vaadin-menu-item"))}this.__updateOverflow([])}__updateOverflow(C){this._overflow.item={children:C},this._hasOverflow=C.length>0}__setOverflowItems(C,T){const V=this._container;if(V.offsetWidth<V.scrollWidth){this._hasOverflow=!0;const K=this.getAttribute("dir")==="rtl";let Y;for(Y=C.length;Y>0;Y--){const ee=C[Y-1],te=getComputedStyle(ee);if(!K&&ee.offsetLeft+ee.offsetWidth<V.offsetWidth-T.offsetWidth||K&&ee.offsetLeft>=T.offsetWidth)break;ee.disabled=!0,ee.style.visibility="hidden",ee.style.position="absolute",ee.style.width=te.width}const J=C.filter((ee,te)=>te>=Y).map(ee=>ee.item);this.__updateOverflow(J)}}__detectOverflow(){const C=this._overflow,T=this._buttons.filter(J=>J!==C),V=this.__getOverflowCount(C);this.__restoreButtons(T),this.__setOverflowItems(T,C);const K=this.__getOverflowCount(C);V!==K&&this._subMenu.opened&&this._subMenu.close();const Y=K===T.length||K===0&&T.length===1;this.toggleAttribute("has-single-button",Y)}_removeButtons(){const C=this._container;for(;C.children.length>1;)C.removeChild(C.firstElementChild)}_initButton(C){const T=document.createElement("vaadin-menu-bar-button");T.setAttribute("part","menu-bar-button");const V={...C};if(T.item=V,C.component){const K=this.__getComponent(V);V.component=K,K.item=V,T.appendChild(K)}else C.text&&(T.textContent=C.text);return T}_initButtonAttrs(C){C.setAttribute("role","menuitem"),(C===this._overflow||C.item&&C.item.children)&&(C.setAttribute("aria-haspopup","true"),C.setAttribute("aria-expanded","false"))}_setButtonDisabled(C,T){C.disabled=T,C.setAttribute("tabindex",T?"-1":"0")}_setButtonTheme(C,T){let V=T;const K=C.item&&C.item.theme;K!=null&&(V=Array.isArray(K)?K.join(" "):K),V?C.setAttribute("theme",V):C.removeAttribute("theme")}_appendButton(C){this._container.insertBefore(C,this._overflow)}__getComponent(C){const T=C.component;let V;const K=T instanceof HTMLElement;if(K&&T.localName==="vaadin-context-menu-item"?V=T:(V=document.createElement("vaadin-context-menu-item"),V.appendChild(K?T:document.createElement(T))),C.text){const Y=V.firstChild||V;Y.textContent=C.text}return V.setAttribute("theme","menu-bar-item"),V}__renderButtons(C=[]){this._removeButtons(),C.length!==0&&(C.forEach(T=>{const V=this._initButton(T);this._appendButton(V),this._setButtonDisabled(V,T.disabled),this._initButtonAttrs(V),this._setButtonTheme(V,this._theme)}),this.__detectOverflow())}_onResize(){this.__detectOverflow()}};/**
 * @license
 * Copyright (c) 2019 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const InteractionsMixin=$=>class extends KeyboardDirectionMixin(FocusMixin($)){static get properties(){return{openOnHover:{type:Boolean}}}constructor(){super(),this.__boundOnContextMenuKeydown=this.__onContextMenuKeydown.bind(this)}static get observers(){return["_itemsChanged(items, items.splices)"]}ready(){super.ready(),this.addEventListener("mousedown",()=>this._hideTooltip()),this.addEventListener("mouseleave",()=>this._hideTooltip()),this._subMenu.addEventListener("item-selected",this.__onItemSelected.bind(this)),this._subMenu.addEventListener("close-all-menus",this.__onEscapeClose.bind(this)),this._subMenu.$.overlay.addEventListener("keydown",this.__boundOnContextMenuKeydown);const V=this._container;V.addEventListener("click",this.__onButtonClick.bind(this)),V.addEventListener("mouseover",K=>this._onMouseOver(K))}get focused(){return this.shadowRoot.activeElement||this._expandedButton}get _vertical(){return!1}_getItems(){return this._buttons}get __isRTL(){return this.getAttribute("dir")==="rtl"}disconnectedCallback(){super.disconnectedCallback(),this._hideTooltip(!0)}_showTooltip(T,V){const K=this._tooltipController.node;K&&K.isConnected&&(K.generator===void 0&&(K.generator=({item:Y})=>Y&&Y.tooltip),this._subMenu.opened||(this._tooltipController.setTarget(T),this._tooltipController.setContext({item:T.item}),K._stateController.open({hover:V,focus:!V})))}_hideTooltip(T){const V=this._tooltipController.node;V&&V._stateController.close(T)}_setExpanded(T,V){T.toggleAttribute("expanded",V),T.toggleAttribute("active",V),T.setAttribute("aria-expanded",V?"true":"false")}_setTabindex(T,V){T.setAttribute("tabindex",V?"0":"-1")}_focusItem(T,V){const K=V&&this.focused===this._expandedButton;K&&this._close(),super._focusItem(T,V),this._buttons.forEach(Y=>{this._setTabindex(Y,Y===T)}),K&&T.item&&T.item.children?this.__openSubMenu(T,!0,{keepFocus:!0}):T===this._overflow?this._hideTooltip():this._showTooltip(T)}_getButtonFromEvent(T){return Array.from(T.composedPath()).find(V=>V.localName==="vaadin-menu-bar-button")}_setFocused(T){if(T){const V=this.shadowRoot.querySelector('[part$="button"][tabindex="0"]');V&&this._buttons.forEach(K=>{this._setTabindex(K,K===V),K===V&&K!==this._overflow&&isKeyboardActive()&&this._showTooltip(K)})}else this._hideTooltip()}_onArrowDown(T){T.preventDefault();const V=this._getButtonFromEvent(T);V===this._expandedButton?this._focusFirstItem():this.__openSubMenu(V,!0)}_onArrowUp(T){T.preventDefault();const V=this._getButtonFromEvent(T);V===this._expandedButton?this._focusLastItem():this.__openSubMenu(V,!0,{focusLast:!0})}_onEscape(T){T.composedPath().includes(this._expandedButton)&&this._close(!0),this._hideTooltip(!0)}_onKeyDown(T){switch(T.key){case"ArrowDown":this._onArrowDown(T);break;case"ArrowUp":this._onArrowUp(T);break;default:super._onKeyDown(T);break}}get _subMenu(){return this.shadowRoot.querySelector("vaadin-menu-bar-submenu")}_itemsChanged(){const T=this._subMenu;T&&T.opened&&T.close()}_onMouseOver(T){const V=this._getButtonFromEvent(T);if(!V)this._hideTooltip();else if(V!==this._expandedButton){const K=this._subMenu.opened;V.item.children&&(this.openOnHover||K)?this.__openSubMenu(V,!1):K&&this._close(),V===this._overflow||this.openOnHover&&V.item.children?this._hideTooltip():this._showTooltip(V,!0)}}__onContextMenuKeydown(T){const V=Array.from(T.composedPath()).find(K=>K._item);if(V){const K=V.parentNode;T.keyCode===38&&V===K.items[0]&&this._close(!0),(T.keyCode===37||T.keyCode===39&&!V._item.children)&&(T.stopImmediatePropagation(),this._onKeyDown(T))}}__fireItemSelected(T){this.dispatchEvent(new CustomEvent("item-selected",{detail:{value:T}}))}__onButtonClick(T){T.stopPropagation();const V=this._getButtonFromEvent(T);V&&this.__openSubMenu(V,!1)}__openSubMenu(T,V,K={}){const Y=this._subMenu,J=T.item;if(Y.opened&&(this._close(),Y.listenOn===T))return;const ee=J&&J.children;if(!ee||ee.length===0){this.__fireItemSelected(J);return}Y.items=ee,Y.listenOn=T;const te=Y.$.overlay;te.positionTarget=T,te.noVerticalOverlap=!0,this._expandedButton=T,requestAnimationFrame(()=>{T.dispatchEvent(new CustomEvent("opensubmenu",{detail:{children:ee}})),this._hideTooltip(!0),this._setExpanded(T,!0)}),this.style.pointerEvents="auto",te.addEventListener("vaadin-overlay-open",()=>{K.focusLast&&this._focusLastItem(),K.keepFocus&&this._focusItem(this._expandedButton,!1),V||te.$.overlay.focus(),te._updatePosition()},{once:!0})}_focusFirstItem(){this._subMenu.$.overlay.firstElementChild.focus()}_focusLastItem(){const T=this._subMenu.$.overlay.firstElementChild,V=T.items[T.items.length-1];V&&V.focus()}__onItemSelected(T){T.stopPropagation(),this._close(),this.__fireItemSelected(T.detail.value)}__onEscapeClose(){this.__deactivateButton(!0)}__deactivateButton(T){const V=this._expandedButton;V&&V.hasAttribute("expanded")&&(this._setExpanded(V,!1),T&&this._focusItem(V,!1),this._expandedButton=null)}_close(T){this.style.pointerEvents="",this.__deactivateButton(T),this._subMenu.opened&&this._subMenu.close()}};/**
 * @license
 * Copyright (c) 2019 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class MenuBar extends ButtonsMixin(DisabledMixin(InteractionsMixin(ElementMixin(ThemableMixin(ControllerMixin(PolymerElement)))))){static get template(){return html`
      <style>
        :host {
          display: block;
        }

        :host([hidden]) {
          display: none !important;
        }

        [part='container'] {
          position: relative;
          display: flex;
          width: 100%;
          flex-wrap: nowrap;
          overflow: hidden;
        }

        [part$='button'] {
          flex-shrink: 0;
        }

        [part='overflow-button'] {
          margin-right: 0;
        }

        .dots::before {
          display: block;
          content: '\\00B7\\00B7\\00B7';
          font-size: inherit;
          line-height: inherit;
        }
      </style>

      <div part="container">
        <vaadin-menu-bar-button part="overflow-button" hidden$="[[!_hasOverflow]]" aria-label$="[[i18n.moreOptions]]">
          <div class="dots"></div>
        </vaadin-menu-bar-button>
      </div>
      <vaadin-menu-bar-submenu is-root=""></vaadin-menu-bar-submenu>

      <slot name="tooltip"></slot>
    `}static get is(){return"vaadin-menu-bar"}static get properties(){return{items:{type:Array,value:()=>[]},i18n:{type:Object,value:()=>({moreOptions:"More options"})}}}static get observers(){return["_themeChanged(_theme)"]}ready(){super.ready(),this._tooltipController=new TooltipController(this),this._tooltipController.setManual(!0),this.addController(this._tooltipController)}_disabledChanged(C,T){super._disabledChanged(C,T),T!==C&&this.__updateButtonsDisabled(C)}_themeChanged(C){this.shadowRoot&&(this._buttons.forEach(T=>this._setButtonTheme(T,C)),this.__detectOverflow()),C?this._subMenu.setAttribute("theme",C):this._subMenu.removeAttribute("theme")}__updateButtonsDisabled(C){this._buttons.forEach(T=>{T.disabled=C||T.item&&T.item.disabled})}}customElements.define(MenuBar.is,MenuBar);var __defProp$7=Object.defineProperty,__getOwnPropDesc$7=Object.getOwnPropertyDescriptor,__decorateClass$7=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$7(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$7(C,T,K),K};let MateuCrud=class extends connect(store)(s$2){constructor(){super(...arguments),this.dataProvider=async($,C)=>{const{page:T,pageSize:V,sortOrders:K}=$,{rows:Y,count:J}=await this.fetchData({page:T,pageSize:V,sortOrders:K,filters:btoa(JSON.stringify(this.data))});C(Y,J)}}search(){this.shadowRoot.getElementById("grid").clearCache()}async fetchData($){const C=await this.fetchRows($),T=await this.fetchCount($.filters);return{rows:C,count:T}}async fetchRows($){return(await api.get("/journeys/"+this.journeyId+"/steps/"+this.stepId+"/lists/main/rows?page="+$.page+"&page_size="+$.pageSize+"&ordering=&filters="+$.filters)).data}async fetchCount($){return(await api.get("/journeys/"+this.journeyId+"/steps/"+this.stepId+"/lists/main/count?filters="+$)).data}connectedCallback(){super.connectedCallback()}firstUpdated($){this.addEventListener("keydown",this.handleKey)}handleKey($){$.code=="Enter"&&setTimeout(()=>this.search())}stateChanged($){console.log("state changed in crud",$)}filterChanged($){const C=$.target,T={};T[C.id]=C.value,this.data={...this.data,...T}}edit($){const C=$.currentTarget;console.log(C.row);const T={_selectedRow:C.row};this.data={...this.data,...T},store.dispatch(runStepAction(this.journeyId,this.stepId,"edit",this.data))}runAction($){var Y;const C=$.currentTarget,V={_selectedRows:((Y=this.shadowRoot)==null?void 0:Y.getElementById("grid")).selectedItems,_clickedRow:this.clickedRow},K={...this.data,...V};store.dispatch(runStepAction(this.journeyId,this.stepId,C.getAttribute("actionid"),K))}itemSelected($){const C={_clickedRow:$.target.row},T={...this.data,...C};store.dispatch(runStepAction(this.journeyId,this.stepId,"__row__"+$.detail.value.id,T))}getThemeForBadgetType($){switch($){case StatusType.SUCCESS:return"success";case StatusType.WARNING:return"warning";case StatusType.DANGER:return"error";case StatusType.NONE:return"contrast"}return""}getColumn($){return $.type=="Status"?y$1`
            <vaadin-grid-column  path="${$.id}" header="${$.caption}"
                ${columnBodyRenderer(C=>{const T=C[$.id];return y$1`<span theme="badge ${this.getThemeForBadgetType(T.type)}">${T.message}</span>`},[])}
            </vaadin-grid-column>
          `:$.type=="ColumnActionGroup"?y$1`
        <vaadin-grid-column  path="${$.id}" header="${$.caption}"
                             ${columnBodyRenderer(C=>{const T=C[$.id].actions.map(V=>({...V,text:V.caption}));return y$1`
                                     <vaadin-menu-bar
                                         .items=${[{text:"···",children:T}]}
                                         theme="tertiary"
                                         .row="${C}"
                                         @item-selected="${this.itemSelected}"
                                     ></vaadin-menu-bar>
                                   </vaadin-icon>`},[])}
        </vaadin-grid-column>
      `:y$1`
            <vaadin-grid-column path="${$.id}" header="${$.caption}"></vaadin-grid-column>
        `}render(){var $,C,T;return y$1`

      <vaadin-horizontal-layout class="header">
        <div>
          <h1>${this.metadata.title}</h1>
          <h3>${this.metadata.subtitle}</h3>
        </div>
        <vaadin-horizontal-layout style="justify-content: end; flex-grow: 1; align-items: center;" theme="spacing">
          ${this.metadata.actions.map(V=>y$1`
            <vaadin-button theme="secondary" @click=${this.runAction} actionId=${V.id}>${V.caption}</vaadin-button>
          `)}
        </vaadin-horizontal-layout>
      </vaadin-horizontal-layout>
      <vaadin-horizontal-layout style="align-items: baseline;" theme="spacing">
        ${($=this.metadata)==null?void 0:$.searchForm.fields.slice(0,1).map(V=>y$1`
          <vaadin-text-field autofocus id="${V.id}" label="${V.caption}" @change=${this.filterChanged} style="flex-grow: 1;"></vaadin-text-field>
        `)}
        <vaadin-button theme="primary" @click="${this.search}">Search</vaadin-button>
      </vaadin-horizontal-layout>

      <vaadin-horizontal-layout style="align-items: baseline;" theme="spacing">
        ${(C=this.metadata)==null?void 0:C.searchForm.fields.slice(1).map(V=>y$1`
          ${V.type!="enum"?y$1`
            <vaadin-text-field id="${V.id}" label="${V.caption}"
                               placeholder="${V.placeholder}"
                               @change=${this.filterChanged}></vaadin-text-field>
          `:""}
          ${V.type=="enum"?y$1`
            
            <vaadin-combo-box label="${V.caption}" theme="vertical"
                                @change=${this.filterChanged}
                           id="${V.id}"
                              .items="${V.attributes.filter(K=>K.key=="choice").map(K=>K.value)}"
                              item-label-path="key"
                              item-value-path="value"
                              placeholder="${V.placeholder}"
            >
            </vaadin-combo-box>
            
            
          `:""}
        `)}
      </vaadin-horizontal-layout>
      <vaadin-grid id="grid" .dataProvider="${this.dataProvider}">
        <vaadin-grid-selection-column></vaadin-grid-selection-column>

      ${(T=this.metadata)==null?void 0:T.columns.map(V=>this.getColumn(V))}

        <vaadin-grid-column
            frozen-to-end
            auto-width
            flex-grow="0"
            ${columnBodyRenderer(V=>y$1`<vaadin-button theme="tertiary-inline" .row="${V}" @click="${this.edit}">Edit</vaadin-button>`,[])}
        
        </vaadin-grid>
    `}};MateuCrud.styles=i$2`
  ${badge}
    
  [theme~='badge'][theme~='warning'] {
    color: #C7BC1D;
    background-color: #FFFCC0;
  }
  [theme~='badge'][theme~='warning'][theme~='primary'] {
    color: #ffffff;
    background-color: #C7BC1D;
  }
  
  .menu {
    /* color: var(--lumo-secondary-text-color); */
    color: grey;
    height: 1.2rem;
  }
  
    :host {

    }

  `;__decorateClass$7([e()],MateuCrud.prototype,"journeyId",2);__decorateClass$7([e()],MateuCrud.prototype,"stepId",2);__decorateClass$7([e()],MateuCrud.prototype,"metadata",2);__decorateClass$7([e()],MateuCrud.prototype,"data",2);__decorateClass$7([t$1()],MateuCrud.prototype,"clickedRow",2);__decorateClass$7([t$1()],MateuCrud.prototype,"dataProvider",2);MateuCrud=__decorateClass$7([e$1("mateu-crud")],MateuCrud);var ResultType=($=>($.Success="Success",$.Info="Info",$.Warning="Warning",$.Error="Error",$))(ResultType||{}),__defProp$6=Object.defineProperty,__getOwnPropDesc$6=Object.getOwnPropertyDescriptor,__decorateClass$6=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$6(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$6(C,T,K),K};let MateuResult=class extends connect(store)(s$2){connectedCallback(){super.connectedCallback()}runAction($){const C=$.currentTarget;store.dispatch(runStepAction(this.journeyId,this.stepId,C.getAttribute("actionid"),{}))}getIcon($){switch($){case ResultType.Success:return"vaadin:check-circle";case ResultType.Info:return"vaadin:info-circle";case ResultType.Warning:return"vaadin:warning";case ResultType.Error:return"lumo:error"}return"vaadin:question"}getClass($){switch($){case ResultType.Success:return"success";case ResultType.Info:return"info";case ResultType.Warning:return"warning";case ResultType.Error:return"error"}return""}render(){return y$1`

      <vaadin-horizontal-layout class="header">
        <div>
          <h1>Result</h1>
        </div>
      </vaadin-horizontal-layout>

      <div class="mateu-section">
      
      <vaadin-vertical-layout style="align-items: center;">
        <vaadin-icon icon="${this.getIcon(this.metadata.resultType)}" class="${this.getClass(this.metadata.resultType)}" size="64"></vaadin-icon>
        <div><h3>${this.metadata.message}</h3></div>
        
        ${this.metadata.interestingLinks.length>0?y$1`

          <div class="youmayalso">
            <h5>You may also be interested in:</h5>

            <vaadin-vertical-layout style="align-items: center;">
            
            ${this.metadata.interestingLinks.map($=>y$1`

    <div class="youmayalsolink"><vaadin-button theme="tertiary" @click=${this.runAction} actionId=${$.value}>${$.description}</vaadin-button></div>                   

`)}
            </vaadin-vertical-layout>
          </div>
          
        `:""}
        
      </vaadin-vertical-layout>
      
      </div>
      
      <vaadin-horizontal-layout style="justify-content: end;" theme="spacing">
        <slot></slot>
        <vaadin-button theme="primary" @click=${this.runAction} actionId=${this.metadata.nowTo.value}>${this.metadata.nowTo.description}</vaadin-button>
      </vaadin-horizontal-layout>
    `}};MateuResult.styles=i$2`
    :host {

    }
    
    .mateu-section {
      text-align: left;
      border: 1px solid lightgrey;
      border-radius: 8px;
      padding: 2rem;  
      margin-bottom: 16px;       
      padding-top: 47px;
    }
    
    .mateu-section:has(h1) {
      padding-top: 0px;
    }
    
    .success {
      color: green;
    }

    .info {
      color: cyan;
    }

    .warning {
      color: orange;
    }

    .error {
      color: red;
    }

  `;__decorateClass$6([e()],MateuResult.prototype,"journeyId",2);__decorateClass$6([e()],MateuResult.prototype,"stepId",2);__decorateClass$6([e()],MateuResult.prototype,"metadata",2);__decorateClass$6([e()],MateuResult.prototype,"data",2);MateuResult=__decorateClass$6([e$1("mateu-result")],MateuResult);var __defProp$5=Object.defineProperty,__getOwnPropDesc$5=Object.getOwnPropertyDescriptor,__decorateClass$5=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$5(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$5(C,T,K),K};let MateuComponent=class extends s$2{connectedCallback(){super.connectedCallback()}render(){var $,C,T;return y$1`
        
            ${(($=this.component)==null?void 0:$.metadata.type)==ViewType.Form?y$1`<mateu-form 
                            .metadata=${this.component.metadata} 
                            .data=${this.component.data}
                            journeyId="${this.journeyId}" stepId="${this.stepId}"
                            .setLoading=${this.setLoading}
                            .rules=${this.component.rules}
                    ><slot></slot></mateu-form>`:y$1``}

            ${((C=this.component)==null?void 0:C.metadata.type)==ViewType.Crud?y$1`<mateu-crud 
                            .metadata=${this.component.metadata} 
                            .data=${this.component.data}
                            journeyId="${this.journeyId}" stepId="${this.stepId}"
                            .setLoading=${this.setLoading}
                            .rules=${this.component.rules}
                    ><slot></slot></mateu-crud>`:y$1``}

            ${((T=this.component)==null?void 0:T.metadata.type)==ViewType.Result?y$1`<mateu-result 
                            .metadata=${this.component.metadata} 
                            .data=${this.component.data}
                            journeyId="${this.journeyId}" stepId="${this.stepId}"
                            .setLoading=${this.setLoading}
                            .rules=${this.component.rules}
                    ><slot></slot></mateu-result>`:y$1``}

        `}};MateuComponent.styles=i$2`
    
  `;__decorateClass$5([e()],MateuComponent.prototype,"component",2);__decorateClass$5([e()],MateuComponent.prototype,"journeyId",2);__decorateClass$5([e()],MateuComponent.prototype,"stepId",2);__decorateClass$5([e()],MateuComponent.prototype,"setLoading",2);MateuComponent=__decorateClass$5([e$1("mateu-component")],MateuComponent);var __defProp$4=Object.defineProperty,__getOwnPropDesc$4=Object.getOwnPropertyDescriptor,__decorateClass$4=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$4(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$4(C,T,K),K};let MateuView=class extends s$2{connectedCallback(){super.connectedCallback()}render(){var $;return y$1`
      <div>
        ${($=this.view)==null?void 0:$.components.map(C=>y$1`<mateu-component 
            .component=${C}  journeyId="${this.journeyId}" stepId="${this.stepId}" .setLoading=${this.setLoading}>
          <slot></slot></mateu-component>
        `)}</div>`}};MateuView.styles=i$2`
    `;__decorateClass$4([e()],MateuView.prototype,"view",2);__decorateClass$4([e()],MateuView.prototype,"journeyId",2);__decorateClass$4([e()],MateuView.prototype,"stepId",2);__decorateClass$4([e()],MateuView.prototype,"setLoading",2);MateuView=__decorateClass$4([e$1("mateu-view")],MateuView);var __defProp$3=Object.defineProperty,__getOwnPropDesc$3=Object.getOwnPropertyDescriptor,__decorateClass$3=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$3(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$3(C,T,K),K};let JourneyStep=class extends s$2{constructor(){super(...arguments),this.journeyId="",this.stepId="",this.step=void 0}connectedCallback(){super.connectedCallback()}render(){var $;return y$1`<mateu-view 
                .view=${($=this.step)==null?void 0:$.view} 
                journeyId="${this.journeyId}" 
                stepId="${this.stepId}" 
                .setLoading=${this.setLoading}><slot></slot></mateu-view>`}};JourneyStep.styles=i$2`

  `;__decorateClass$3([e()],JourneyStep.prototype,"journeyId",2);__decorateClass$3([e()],JourneyStep.prototype,"stepId",2);__decorateClass$3([e()],JourneyStep.prototype,"step",2);__decorateClass$3([e()],JourneyStep.prototype,"setLoading",2);JourneyStep=__decorateClass$3([e$1("journey-step")],JourneyStep);var __defProp$2=Object.defineProperty,__getOwnPropDesc$2=Object.getOwnPropertyDescriptor,__decorateClass$2=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$2(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$2(C,T,K),K};let JourneyStarter=class extends connect(store)(s$2){constructor(){super(...arguments),this.journeyTypeId=void 0,this.loading=!1,this.cargando=void 0,this.error=void 0,this.tipos=[],this.journeyType=void 0,this.journeyId=void 0,this.journey=void 0,this.stepId=void 0,this.step=void 0,this.completed=!1}stateChanged($){var C;if(this.loading=!1,this.journeyTypeId||(this.tipos=$.tiposJourney.journeyTypes),this.cargando=$.tiposJourney.loading,this.error=$.tiposJourney.error,this.journeyType=$.tiposJourney.journeyType,this.journeyId=$.tiposJourney.journeyId,this.journey=$.tiposJourney.journey,this.stepId=$.tiposJourney.stepId,this.step=$.tiposJourney.step,this.completed=$.tiposJourney.completed,!this.tipos)this.loading=!0,store.dispatch(fetchItems());else if(this.journeyType)if(this.journeyId)this.journey?this.stepId&&(this.step||(this.loading=!0,store.dispatch(getStep(this.journeyId,this.stepId)))):(this.loading=!0,store.dispatch(getJourneyStatus(this.journeyId)));else{const T=(C=this.journeyTypeId)!=null&&C.startsWith("fixed_")?this.journeyType:nanoid$1();this.loading=!0,store.dispatch(createJourney(this.journeyType,T))}}updated($){$.has("journeyTypeId")&&store.dispatch(setJourneyType(this.journeyTypeId))}connectedCallback(){super.connectedCallback(),this.journeyTypeId?store.dispatch(setJourneyType(this.journeyTypeId)):store.dispatch(fetchItems())}startJourney($){const C=$.target.getAttribute("typeId");store.dispatch(setJourneyType(C))}resetJourney(){store.dispatch(reset())}setLoading($){this.loading=$}render(){var $;return y$1`

            <div class="lds-roller" style="display: ${this.loading?"":"none"};"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>

            <!--
            <div>cargando = ${this.cargando}</div>
            <div>error = ${this.error}</div>
            <div>journey types = ${this.tipos}</div>
            <div>journey type = ${this.journeyType}</div>
            <div>journey id = ${this.journeyId}</div>
            <div>journey = ${this.journey}</div>
            <div>step id = ${this.stepId}</div>
            <div>step = ${this.step}</div>
            <div>completed = ${this.completed}</div>
            -->
        
            ${this.journeyType?y$1``:y$1`

                ${this.tipos?y$1`
                            <h1>Available journey types</h1>
                            <div>
                                ${($=this.tipos)==null?void 0:$.map(C=>y$1`<div class="card-journey-type">
                <vaadin-horizontal-layout theme="spacing padding" style="width: 100%;">
                    <div style="flex-grow: 1"><h2>${C.name}</h2></div>
                    <vaadin-horizontal-layout style="align-items: center;">
                        <vaadin-button theme="primary" @click=${this.startJourney} typeId="${C.id}">Start journey</vaadin-button>
                    </vaadin-horizontal-layout>
                </vaadin-horizontal-layout>
            </div>`)}
                            </div>                     
                        `:y$1`<h2>No journey type available</h2>`}

                    `}

            ${this.step?y$1`

                        <journey-step  journeyId="${this.journeyId}" stepId="${this.stepId}" .step=${this.step} .setLoading=${this.setLoading}>
            ${this.tipos.length>0?y$1`<vaadin-button theme="secondary" @click=${this.resetJourney}>Back to the beginning</vaadin-button>`:""}
                        </journey-step>

                    `:""}
            
            ${this.completed?y$1`<h1>Done!</h1>

                    <vaadin-button theme="secondary" @click=${this.resetJourney}>+</vaadin-button>
                    
                    `:""}

        <slot></slot>`}};JourneyStarter.styles=i$2`
    :host {
      max-width: 1280px;
      width: 800px;
      margin: 0 auto;
      padding: 2rem;    
    }
    
    .card-journey-type {
        padding-left: 20px;
        padding-right: 20px;
        margin-bottom: 10px;
        border: 1px solid lightgrey;
        border-radius: 7px;
    }
    
    
.lds-roller {
  display: inline-block;
  width: 80px;
  height: 80px;
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
.lds-roller div {
  animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  transform-origin: 40px 40px;
}
.lds-roller div:after {
  content: " ";
  display: block;
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fcf;
  margin: -4px 0 0 -4px;
}
.lds-roller div:nth-child(1) {
  animation-delay: -0.036s;
}
.lds-roller div:nth-child(1):after {
  top: 63px;
  left: 63px;
}
.lds-roller div:nth-child(2) {
  animation-delay: -0.072s;
}
.lds-roller div:nth-child(2):after {
  top: 68px;
  left: 56px;
}
.lds-roller div:nth-child(3) {
  animation-delay: -0.108s;
}
.lds-roller div:nth-child(3):after {
  top: 71px;
  left: 48px;
}
.lds-roller div:nth-child(4) {
  animation-delay: -0.144s;
}
.lds-roller div:nth-child(4):after {
  top: 72px;
  left: 40px;
}
.lds-roller div:nth-child(5) {
  animation-delay: -0.18s;
}
.lds-roller div:nth-child(5):after {
  top: 71px;
  left: 32px;
}
.lds-roller div:nth-child(6) {
  animation-delay: -0.216s;
}
.lds-roller div:nth-child(6):after {
  top: 68px;
  left: 24px;
}
.lds-roller div:nth-child(7) {
  animation-delay: -0.252s;
}
.lds-roller div:nth-child(7):after {
  top: 63px;
  left: 17px;
}
.lds-roller div:nth-child(8) {
  animation-delay: -0.288s;
}
.lds-roller div:nth-child(8):after {
  top: 56px;
  left: 12px;
}
@keyframes lds-roller {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}



  `;__decorateClass$2([e()],JourneyStarter.prototype,"journeyTypeId",2);__decorateClass$2([e()],JourneyStarter.prototype,"loading",2);__decorateClass$2([e()],JourneyStarter.prototype,"cargando",2);__decorateClass$2([e()],JourneyStarter.prototype,"error",2);__decorateClass$2([e()],JourneyStarter.prototype,"tipos",2);__decorateClass$2([e()],JourneyStarter.prototype,"journeyType",2);__decorateClass$2([e()],JourneyStarter.prototype,"journeyId",2);__decorateClass$2([e()],JourneyStarter.prototype,"journey",2);__decorateClass$2([e()],JourneyStarter.prototype,"stepId",2);__decorateClass$2([e()],JourneyStarter.prototype,"step",2);__decorateClass$2([e()],JourneyStarter.prototype,"completed",2);JourneyStarter=__decorateClass$2([e$1("journey-starter")],JourneyStarter);var MenuType=($=>($.MenuOption="MenuOption",$.Submenu="Submenu",$))(MenuType||{}),__defProp$1=Object.defineProperty,__getOwnPropDesc$1=Object.getOwnPropertyDescriptor,__decorateClass$1=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc$1(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp$1(C,T,K),K};let MateuUi=class extends connect(store)(s$2){constructor(){super(...arguments),this.uiId="",this.ui=void 0,this.loading=!1}stateChanged($){var C;this.loading=!1,this.ui=$.tiposJourney.ui,this.journeyTypeId=$.tiposJourney.journeyType,this.items=(C=this.ui)==null?void 0:C.menu.map(T=>{var V;return{journeyTypeId:T.journeyTypeId,text:T.caption,children:T.type==MenuType.Submenu?(V=T.submenus)==null?void 0:V.map(K=>({journeyTypeId:K.journeyTypeId,text:K.caption})):void 0}})}connectedCallback(){super.connectedCallback(),this.loading=!0,store.dispatch(getUi(this.uiId))}selectJourney($){let C=$.currentTarget.getAttribute("journeytypeid");store.dispatch(setJourneyType(C))}itemSelected($){let C=$.detail.value;store.dispatch(setJourneyType(C.journeyTypeId))}render(){return y$1`
        ${this.ui?y$1`

            <vaadin-vertical-layout style="align-items: center">

            <vaadin-app-layout>
                <h3 slot="navbar" class="title ml-l mr-l" style="width: 200px;">${this.ui.title}</h3>
                <div class="container" slot="navbar">
                ${this.ui.menu?y$1`
                    <vaadin-menu-bar slot="navbar"
                            .items="${this.items}"
                            @item-selected="${this.itemSelected}"
                                     theme="tertiary"
                    ></vaadin-menu-bar>
                `:""}
                </div>
                <div slot="navbar" style="width: 200px;"></div>
            </vaadin-app-layout>


                <!--
                <div class="container">
                    <router-outlet></router-outlet>
                </div>
                -->
                
                ${this.ui.homeJourneyTypeId?y$1`

                    <journey-starter journeytypeid="${this.ui.homeJourneyTypeId}"></journey-starter>
                    
                `:""}

            ${this.journeyTypeId?y$1`

                    <journey-starter journeytypeid=${this.journeyTypeId}></journey-starter>
                    
                `:""}

            </vaadin-vertical-layout>
        
        `:""}`}};MateuUi.styles=i$2`
    :host {
        
    }
    
    .mr-l {
        margin-right: var(--lumo-space-l);
    }
    .ml-l {
        margin-left: var(--lumo-space-l);
    }
    
    h3.title {
        font-size: var(--lumo-font-size-xl);
        margin-bottom: 0.5em;
        font-weight: 600;
        padding-bottom: 6px;
    }
    
    div {
        height: 44px;
    }
        
    .container {
      max-width: 1024px;
      margin: auto;
    }

  `;__decorateClass$1([e()],MateuUi.prototype,"uiId",2);__decorateClass$1([e()],MateuUi.prototype,"ui",2);__decorateClass$1([e()],MateuUi.prototype,"journeyTypeId",2);__decorateClass$1([e()],MateuUi.prototype,"loading",2);__decorateClass$1([e()],MateuUi.prototype,"items",2);__decorateClass$1([e()],MateuUi.prototype,"selectedItem",2);MateuUi=__decorateClass$1([e$1("mateu-ui")],MateuUi);var __defProp=Object.defineProperty,__getOwnPropDesc=Object.getOwnPropertyDescriptor,__decorateClass=($,C,T,V)=>{for(var K=V>1?void 0:V?__getOwnPropDesc(C,T):C,Y=$.length-1,J;Y>=0;Y--)(J=$[Y])&&(K=(V?J(C,T,K):J(K))||K);return V&&K&&__defProp(C,T,K),K};let LandingComponent=class extends s$2{constructor(){super(...arguments),this.uiId=window.__MATEU_UI_ID__}render(){return y$1`<mateu-ui uiId="${this.uiId}">
        </mateu-ui>`}};LandingComponent.styles=i$2`
  `;__decorateClass([e()],LandingComponent.prototype,"uiId",2);LandingComponent=__decorateClass([e$1("landing-component")],LandingComponent);export{LandingComponent};
